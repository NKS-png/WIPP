-- Create user_encryption_keys table for storing E2E encryption keys
CREATE TABLE IF NOT EXISTS user_encryption_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    public_key TEXT NOT NULL,
    encrypted_private_key TEXT NOT NULL,
    key_salt TEXT NOT NULL,
    key_iv TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one key pair per user
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_encryption_keys_user_id ON user_encryption_keys(user_id);

-- Enable RLS on user_encryption_keys table
ALTER TABLE user_encryption_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_encryption_keys

-- Users can only insert their own keys
CREATE POLICY "Users can insert their own encryption keys" ON user_encryption_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only read their own private key data
CREATE POLICY "Users can read their own encryption keys" ON user_encryption_keys
    FOR SELECT USING (auth.uid() = user_id);

-- Anyone authenticated can read public keys (they're meant to be public)
CREATE POLICY "Anyone can read public keys" ON user_encryption_keys
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can update their own keys (for key rotation)
CREATE POLICY "Users can update their own encryption keys" ON user_encryption_keys
    FOR UPDATE USING (auth.uid() = user_id);

-- Update messages table to store encrypted content
ALTER TABLE messages ADD COLUMN IF NOT EXISTS encrypted_content JSONB;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT FALSE;

-- Create index for encrypted messages
CREATE INDEX IF NOT EXISTS idx_messages_encrypted ON messages(is_encrypted) WHERE is_encrypted = TRUE;

-- Update RLS policies for messages to handle encryption

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;

-- Recreate policies with encryption support
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their conversations" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

-- Re-enable RLS on messages table (in case it was disabled)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on conversations and conversation_participants
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Recreate conversation policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversations.id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Recreate conversation_participants policies
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations they're in" ON conversation_participants;

CREATE POLICY "Users can view conversation participants" ON conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversation_participants.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add participants to conversations they're in" ON conversation_participants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversation_participants.conversation_id
            AND cp.user_id = auth.uid()
        ) OR
        -- Allow adding yourself to a new conversation
        user_id = auth.uid()
    );

-- Function to safely create encrypted message
CREATE OR REPLACE FUNCTION create_encrypted_message(
    p_conversation_id UUID,
    p_content TEXT,
    p_encrypted_content JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    message_id UUID;
BEGIN
    -- Verify user is participant in conversation
    IF NOT EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = p_conversation_id
        AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'User is not a participant in this conversation';
    END IF;

    -- Insert the message
    INSERT INTO messages (
        conversation_id,
        sender_id,
        content,
        encrypted_content,
        is_encrypted,
        created_at
    ) VALUES (
        p_conversation_id,
        auth.uid(),
        CASE WHEN p_encrypted_content IS NOT NULL THEN '[Encrypted Message]' ELSE p_content END,
        p_encrypted_content,
        p_encrypted_content IS NOT NULL,
        NOW()
    ) RETURNING id INTO message_id;

    -- Update conversation timestamp
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = p_conversation_id;

    RETURN message_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION create_encrypted_message TO authenticated;

-- Create function to get user's public key (for encryption)
CREATE OR REPLACE FUNCTION get_user_public_key(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    public_key TEXT;
BEGIN
    -- Only authenticated users can get public keys
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT user_encryption_keys.public_key INTO public_key
    FROM user_encryption_keys
    WHERE user_id = p_user_id;

    RETURN public_key;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_public_key TO authenticated;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_encryption_keys_updated_at
    BEFORE UPDATE ON user_encryption_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();