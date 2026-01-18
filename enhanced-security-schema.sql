-- Enhanced security schema for robust E2E encryption
-- Addresses: data loss, cross-device sync, moderation, and security concerns

-- Enhanced user encryption keys table with recovery support
ALTER TABLE user_encryption_keys ADD COLUMN IF NOT EXISTS recovery_public_key TEXT;
ALTER TABLE user_encryption_keys ADD COLUMN IF NOT EXISTS recovery_package JSONB;
ALTER TABLE user_encryption_keys ADD COLUMN IF NOT EXISTS device_fingerprint TEXT;
ALTER TABLE user_encryption_keys ADD COLUMN IF NOT EXISTS backup_created_at TIMESTAMP WITH TIME ZONE;

-- Device registration for cross-device key sync
CREATE TABLE IF NOT EXISTS user_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL,
    device_type TEXT DEFAULT 'unknown',
    device_name TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code TEXT,
    verification_expires_at TIMESTAMP WITH TIME ZONE,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, device_fingerprint)
);

-- Recovery codes for password reset without data loss
CREATE TABLE IF NOT EXISTS recovery_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    recovery_data JSONB NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE
);

-- Moderation reports for encrypted content
CREATE TABLE IF NOT EXISTS moderation_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES auth.users(id),
    message_id UUID NOT NULL REFERENCES messages(id),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    report_type TEXT NOT NULL CHECK (report_type IN ('harassment', 'threats', 'spam', 'inappropriate', 'other')),
    evidence_content TEXT, -- Only if user consented to decrypt
    user_consented_to_decrypt BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    moderator_id UUID REFERENCES auth.users(id),
    moderator_notes TEXT,
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Moderation queue for prioritizing reports
CREATE TABLE IF NOT EXISTS moderation_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES moderation_reports(id) ON DELETE CASCADE,
    priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    has_evidence BOOLEAN DEFAULT FALSE,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_at TIMESTAMP WITH TIME ZONE
);

-- Code integrity tracking
CREATE TABLE IF NOT EXISTS code_integrity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_path TEXT NOT NULL,
    hash_sha256 TEXT NOT NULL,
    version TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(file_path, version)
);

-- User security events log
CREATE TABLE IF NOT EXISTS security_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_fingerprint ON user_devices(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_recovery_codes_user_id ON recovery_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_recovery_codes_expires ON recovery_codes(expires_at) WHERE NOT is_used;
CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON moderation_reports(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_priority ON moderation_queue(priority, created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id, created_at);

-- RLS Policies

-- User devices
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own devices" ON user_devices
    FOR ALL USING (auth.uid() = user_id);

-- Recovery codes
ALTER TABLE recovery_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own recovery codes" ON recovery_codes
    FOR ALL USING (auth.uid() = user_id);

-- Moderation reports
ALTER TABLE moderation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports for their conversations" ON moderation_reports
    FOR INSERT WITH CHECK (
        auth.uid() = reporter_id AND
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = moderation_reports.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own reports" ON moderation_reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- Note: Moderator policies disabled - add role column to profiles table if needed
-- CREATE POLICY "Moderators can view all reports" ON moderation_reports
--     FOR SELECT USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role = 'moderator'
--         )
--     );

-- Moderation queue
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- Note: Moderator policies disabled - add role column to profiles table if needed
-- CREATE POLICY "Moderators can access moderation queue" ON moderation_queue
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('moderator', 'admin')
--         )
--     );

-- Security events
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own security events" ON security_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can log security events" ON security_events
    FOR INSERT WITH CHECK (TRUE);

-- Functions for enhanced security

-- Function to register a new device
CREATE OR REPLACE FUNCTION register_user_device(
    p_device_fingerprint TEXT,
    p_device_type TEXT DEFAULT 'unknown',
    p_device_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    device_id UUID;
    verification_code TEXT;
BEGIN
    -- Generate verification code
    verification_code := encode(gen_random_bytes(3), 'hex');
    
    -- Insert or update device
    INSERT INTO user_devices (
        user_id,
        device_fingerprint,
        device_type,
        device_name,
        verification_code,
        verification_expires_at
    ) VALUES (
        auth.uid(),
        p_device_fingerprint,
        p_device_type,
        p_device_name,
        verification_code,
        NOW() + INTERVAL '1 hour'
    )
    ON CONFLICT (user_id, device_fingerprint)
    DO UPDATE SET
        last_active_at = NOW(),
        verification_code = verification_code,
        verification_expires_at = NOW() + INTERVAL '1 hour'
    RETURNING id INTO device_id;
    
    -- Log security event
    INSERT INTO security_events (user_id, event_type, event_data)
    VALUES (auth.uid(), 'device_registration', jsonb_build_object(
        'device_fingerprint', p_device_fingerprint,
        'device_type', p_device_type,
        'verification_code', verification_code
    ));
    
    RETURN device_id;
END;
$$;

-- Function to verify device
CREATE OR REPLACE FUNCTION verify_user_device(
    p_device_fingerprint TEXT,
    p_verification_code TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    device_record RECORD;
BEGIN
    -- Find device with matching code
    SELECT * INTO device_record
    FROM user_devices
    WHERE user_id = auth.uid()
    AND device_fingerprint = p_device_fingerprint
    AND verification_code = p_verification_code
    AND verification_expires_at > NOW()
    AND NOT is_verified;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Mark device as verified
    UPDATE user_devices
    SET is_verified = TRUE,
        verification_code = NULL,
        verification_expires_at = NULL
    WHERE id = device_record.id;
    
    -- Log security event
    INSERT INTO security_events (user_id, event_type, event_data)
    VALUES (auth.uid(), 'device_verified', jsonb_build_object(
        'device_fingerprint', p_device_fingerprint
    ));
    
    RETURN TRUE;
END;
$$;

-- Function to create recovery code
CREATE OR REPLACE FUNCTION create_recovery_code(
    p_recovery_data JSONB
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    recovery_code TEXT;
    code_hash TEXT;
BEGIN
    -- Generate recovery code (12 random words would be better)
    recovery_code := encode(gen_random_bytes(16), 'base64');
    code_hash := encode(digest(recovery_code, 'sha256'), 'hex');
    
    -- Store recovery code
    INSERT INTO recovery_codes (user_id, code_hash, recovery_data)
    VALUES (auth.uid(), code_hash, p_recovery_data);
    
    -- Log security event
    INSERT INTO security_events (user_id, event_type, event_data)
    VALUES (auth.uid(), 'recovery_code_created', jsonb_build_object(
        'expires_at', NOW() + INTERVAL '30 days'
    ));
    
    RETURN recovery_code;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION register_user_device TO authenticated;
GRANT EXECUTE ON FUNCTION verify_user_device TO authenticated;
GRANT EXECUTE ON FUNCTION create_recovery_code TO authenticated;