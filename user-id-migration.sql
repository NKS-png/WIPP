-- Add username column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
        ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;
        CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
    END IF;
END $$;

-- Add images array column to projects table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'images') THEN
        ALTER TABLE projects ADD COLUMN images TEXT[];
    END IF;
END $$;

-- Function to generate unique username for existing users
CREATE OR REPLACE FUNCTION generate_unique_username(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
    username TEXT;
    counter INTEGER := 1;
    random_num INTEGER;
BEGIN
    -- Clean base name
    base_name := lower(regexp_replace(base_name, '[^a-z0-9]', '', 'g'));
    IF length(base_name) = 0 THEN
        base_name := 'user';
    END IF;
    
    LOOP
        random_num := floor(random() * 9999) + 1;
        username := base_name || random_num::TEXT;
        
        -- Check if username exists
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.username = username) THEN
            RETURN username;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            -- Fallback with timestamp
            username := base_name || extract(epoch from now())::INTEGER::TEXT;
            EXIT;
        END IF;
    END LOOP;
    
    RETURN username;
END;
$$ LANGUAGE plpgsql;

-- Update existing profiles without usernames
UPDATE profiles 
SET username = generate_unique_username(
    COALESCE(
        full_name, 
        split_part(email, '@', 1),
        'user'
    )
)
WHERE username IS NULL;

-- Drop the function after use
DROP FUNCTION IF EXISTS generate_unique_username(TEXT);

-- Add constraint to ensure username is not null for new records
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;