import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create Supabase client with service role key for admin access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function checkSyncQueueStructure() {
  console.log('🔍 Checking sync_queue table structure...')
  
  try {
    // First, check if the table exists by trying to select a single row
    const { data: sampleRow, error: sampleError } = await supabase
      .from('sync_queue')
      .select('*')
      .limit(1)
    
    if (sampleError) {
      if (sampleError.code === '42P01') { // Table doesn't exist
        console.error('❌ The sync_queue table does not exist in your database')
      } else {
        console.error('❌ Error checking sync_queue table:', sampleError)
      }
      return
    }
    
    console.log('✅ The sync_queue table exists')
    
    // Get the table structure using PostgreSQL's information_schema
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'sync_queue' })
    
    if (columnsError) {
      console.error('❌ Error fetching table columns:', columnsError)
      
      // Fallback: Try to infer columns from the sample row
      if (sampleRow && sampleRow.length > 0) {
        console.log('📊 Inferred columns from sample row:')
        const sampleColumns = Object.keys(sampleRow[0])
        sampleColumns.forEach(column => {
          const value = sampleRow[0][column]
          const type = typeof value
          console.log(`- ${column}: ${type} (example: ${JSON.stringify(value)})`)
        })
      }
      
      return
    }
    
    console.log('📊 Table columns:')
    columns.forEach((column: any) => {
      console.log(`- ${column.column_name}: ${column.data_type}`)
    })
    
    // Check for any rows in the table
    const { count, error: countError } = await supabase
      .from('sync_queue')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Error counting rows:', countError)
      return
    }
    
    console.log(`📈 The sync_queue table has ${count} rows`)
    
    // If there are rows, show a sample
    if (count && count > 0) {
      const { data: sample, error: sampleError } = await supabase
        .from('sync_queue')
        .select('*')
        .limit(5)
      
      if (sampleError) {
        console.error('❌ Error fetching sample rows:', sampleError)
        return
      }
      
      console.log('📋 Sample rows:')
      sample?.forEach((row, index) => {
        console.log(`Row ${index + 1}:`, row)
      })
    }
  } catch (error) {
    console.error('❌ Unhandled error:', error)
  }
}

// Create the RPC function if it doesn't exist
async function createRpcFunction() {
  const { error } = await supabase.rpc('get_table_columns', { table_name: 'sync_queue' })
  
  if (error && error.code === '42883') { // Function doesn't exist
    console.log('🔧 Creating get_table_columns function...')
    
    // Create the function using raw SQL
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
        RETURNS TABLE (
          column_name text,
          data_type text,
          is_nullable boolean
        )
        LANGUAGE sql
        SECURITY DEFINER
        AS $$
          SELECT 
            column_name::text,
            data_type::text,
            is_nullable::boolean
          FROM 
            information_schema.columns
          WHERE 
            table_schema = 'public'
            AND table_name = $1
          ORDER BY 
            ordinal_position;
        $$;
      `
    })
    
    if (createError) {
      if (createError.code === '42883') { // exec_sql function doesn't exist
        console.error('❌ Cannot create helper function. Please check the table structure manually.')
      } else {
        console.error('❌ Error creating helper function:', createError)
      }
      return false
    }
    
    console.log('✅ Helper function created successfully')
    return true
  }
  
  return error ? false : true
}

// Run the check
async function main() {
  const rpcExists = await createRpcFunction()
  if (rpcExists) {
    await checkSyncQueueStructure()
  } else {
    // Fallback to a simpler check
    console.log('🔍 Performing simplified check...')
    
    const { data, error } = await supabase
      .from('sync_queue')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('❌ Error accessing sync_queue table:', error)
      return
    }
    
    console.log('✅ The sync_queue table exists')
    
    if (data && data.length > 0) {
      console.log('📊 Inferred columns from sample row:')
      const columns = Object.keys(data[0])
      columns.forEach(column => {
        const value = data[0][column]
        const type = typeof value
        console.log(`- ${column}: ${type} (example: ${JSON.stringify(value)})`)
      })
      
      console.log('📋 Sample rows:')
      data.forEach((row, index) => {
        console.log(`Row ${index + 1}:`, row)
      })
    } else {
      console.log('📈 The sync_queue table is empty')
    }
  }
}

main().catch(error => {
  console.error('❌ Unhandled error:', error)
  process.exit(1)
}) 