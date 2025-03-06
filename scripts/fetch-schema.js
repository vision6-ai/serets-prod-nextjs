// Script to fetch Supabase database schema
const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchSchema() {
  try {
    // Fetch all tables in the public schema
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .not('table_name', 'like', 'pg_%')
      .order('table_name');
    
    if (error) {
      console.error('Error fetching tables:', error);
      return;
    }
    
    console.log('=== Database Schema ===');
    
    // Fetch details for each table
    for (const table of tables) {
      console.log(`\n--- Table: ${table.table_name} ---`);
      
      // Direct query to get columns
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', table.table_name)
        .order('ordinal_position');
      
      if (columnsError) {
        console.error(`Error fetching columns for ${table.table_name}:`, columnsError);
        continue;
      }
      
      console.log('Columns:');
      columns.forEach(column => {
        const nullable = column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        console.log(`  - ${column.column_name} (${column.data_type}, ${nullable})`);
      });
    }
    
    // Specifically check the genres table structure
    console.log('\n=== Checking Genres Table Structure ===');
    const { data: genresColumns, error: genresError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'genres')
      .order('ordinal_position');
    
    if (genresError) {
      console.error('Error fetching genres columns:', genresError);
    } else {
      console.log('Genres Columns:');
      genresColumns.forEach(column => {
        console.log(`  - ${column.column_name} (${column.data_type})`);
      });
    }
    
    // Check if genre_translations table exists
    console.log('\n=== Checking Genre Translations Table ===');
    const { data: genreTranslations, error: genreTransError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'genre_translations')
      .order('ordinal_position');
    
    if (genreTransError) {
      console.error('Error fetching genre_translations columns:', genreTransError);
    } else if (genreTranslations.length === 0) {
      console.log('genre_translations table does not exist or has no columns');
    } else {
      console.log('Genre Translations Columns:');
      genreTranslations.forEach(column => {
        console.log(`  - ${column.column_name} (${column.data_type})`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Main execution
(async () => {
  try {
    await fetchSchema();
  } catch (error) {
    console.error('Script execution failed:', error);
  }
})(); 