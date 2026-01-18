// Script to apply the read tracking migration
// Run this with: node apply-read-tracking.js

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('Reading migration file...');
    const migrationSQL = readFileSync('./message-read-tracking.sql', 'utf8');
    
    console.log('Applying migration...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('Migration failed:', error);
      return;
    }
    
    console.log('Migration applied successfully!');
    console.log('Result:', data);
    
    // Test the new functions
    console.log('\nTesting new functions...');
    
    // Test get_unread_count function (you'll need a real user ID)
    // const { data: unreadCount } = await supabase.rpc('get_unread_count', {
    //   p_user_id: 'your-user-id-here'
    // });
    // console.log('Unread count test:', unreadCount);
    
  } catch (error) {
    console.error('Error applying migration:', error);
  }
}

// Alternative: Apply migration manually
console.log('To apply the migration manually:');
console.log('1. Copy the contents of message-read-tracking.sql');
console.log('2. Go to your Supabase dashboard > SQL Editor');
console.log('3. Paste and run the SQL');
console.log('4. Or run: node apply-read-tracking.js (after setting up environment variables)');

// Uncomment to run automatically:
// applyMigration();