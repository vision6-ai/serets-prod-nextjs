require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getTableSchema() {
  try {
    // Get all tables using pg_tables
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .order('tablename');

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      return;
    }

    console.log('=== CURRENT DATABASE TABLES ===');
    const tableNames = tables.map(t => t.tablename);
    console.log(tableNames.join('\n'));

    // Get detailed schema for each table
    console.log('\n=== DETAILED SCHEMA ===');
    for (const table of tables) {
      const tableName = table.tablename;
      
      // Use raw SQL to get column info
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: tableName })
        .catch(async () => {
          // Fallback: try to get basic info from the table itself
          const { data: sample } = await supabase
            .from(tableName)
            .select('*')
            .limit(0);
          
          if (sample) {
            return Object.keys(sample[0] || {}).map(key => ({
              column_name: key,
              data_type: 'unknown',
              is_nullable: 'unknown'
            }));
          }
          return [];
        });

      if (columnsError) {
        console.error(`Error fetching columns for ${tableName}:`, columnsError);
        continue;
      }

      console.log(`\n${tableName}:`);
      if (columns && columns.length > 0) {
        columns.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type || 'unknown'} ${col.is_nullable === 'NO' ? 'NOT NULL' : col.is_nullable === 'YES' ? 'NULL' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
        });
      } else {
        console.log('  (No column information available)');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getTableSchema();