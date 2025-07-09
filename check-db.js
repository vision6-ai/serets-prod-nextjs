require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabase() {
  try {
    console.log('Connecting to Supabase...');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // Get all tables
    const { data: tables, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .order('tablename');

    if (error) {
      console.error('Error fetching tables:', error);
      return;
    }

    console.log('\n=== CURRENT DATABASE TABLES ===');
    console.log('Found', tables.length, 'tables:');
    tables.forEach((table, i) => {
      console.log(`${i + 1}. ${table.tablename}`);
    });

    // Try to get basic info about some key tables
    const keyTables = ['movies', 'movie_translations', 'actors', 'movieshows', 'reviews'];
    
    for (const tableName of keyTables) {
      const tableExists = tables.some(t => t.tablename === tableName);
      if (tableExists) {
        console.log(`\n--- ${tableName} table structure ---`);
        const { data: sample, error: sampleError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!sampleError && sample && sample.length > 0) {
          console.log('Columns:', Object.keys(sample[0]).join(', '));
        } else {
          console.log('No data or error accessing table');
        }
      } else {
        console.log(`\n--- ${tableName} table: NOT FOUND ---`);
      }
    }

  } catch (error) {
    console.error('Connection error:', error.message);
  }
}

checkDatabase();