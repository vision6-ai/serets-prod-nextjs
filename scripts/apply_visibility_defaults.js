// Apply migration to set default visibility for profiles
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create Supabase client with admin rights
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    // Read SQL file
    const sqlPath = path.join(process.cwd(), 'migrations', 'set_default_profile_visibility.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute SQL
    const { error } = await supabase.rpc('pgadmin_exec_sql', { sql });

    if (error) {
      throw error;
    }

    console.log('✅ Successfully applied profile visibility defaults');
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    process.exit(1);
  }
}

applyMigration(); 