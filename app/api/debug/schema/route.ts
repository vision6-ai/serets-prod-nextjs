import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all tables in the public schema
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .not('table_name', 'like', 'pg_%')
      .order('table_name');
    
    if (error) {
      return NextResponse.json({ error: 'Error fetching tables', details: error }, { status: 500 });
    }
    
    const schema: Record<string, any> = {};
    
    // Fetch details for each table
    for (const table of tables) {
      // Direct query to get columns
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', table.table_name)
        .order('ordinal_position');
      
      if (columnsError) {
        schema[table.table_name] = { error: `Error fetching columns: ${columnsError.message}` };
        continue;
      }
      
      schema[table.table_name] = columns.map(column => ({
        name: column.column_name,
        type: column.data_type,
        nullable: column.is_nullable === 'YES'
      }));
    }
    
    // Return the schema
    return NextResponse.json({ schema });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
} 