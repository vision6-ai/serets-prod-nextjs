require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getTableNames() {
  try {
    const { data: tables, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .order('tablename');

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Current database tables:');
    tables.forEach(table => {
      console.log(`- ${table.tablename}`);
    });

    return tables.map(t => t.tablename);
  } catch (error) {
    console.error('Connection error:', error.message);
  }
}

getTableNames();