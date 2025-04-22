import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  // Ensure this is an admin or authorized request
  const supabase = createRouteHandlerClient({ cookies });
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get admin users
  const { data: adminUsers, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .single();
    
  if (adminError || !adminUsers) {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
  }

  try {
    const { migrationName } = await req.json();
    
    if (!migrationName) {
      return NextResponse.json({ error: 'Missing migration name' }, { status: 400 });
    }
    
    // Load the migration file from the migrations directory
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const migrationPath = path.join(migrationsDir, `${migrationName}.sql`);
    
    if (!fs.existsSync(migrationPath)) {
      return NextResponse.json({ error: 'Migration file not found' }, { status: 404 });
    }
    
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { error: migrationError } = await supabase.rpc('execute_sql', {
      sql_query: migrationSql
    });
    
    if (migrationError) {
      console.error('Migration error:', migrationError);
      return NextResponse.json({ error: `Error applying migration: ${migrationError.message}` }, { status: 500 });
    }
    
    // Add a record to the migrations table to track that this migration was applied
    const { error: trackingError } = await supabase
      .from('applied_migrations')
      .insert({
        name: migrationName,
        applied_by: user.id,
        sql_content: migrationSql
      });
      
    if (trackingError) {
      console.error('Error tracking migration:', trackingError);
      // We don't fail the request since the migration was applied successfully
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Migration "${migrationName}" applied successfully` 
    });
    
  } catch (error: any) {
    console.error('Error in migration API:', error);
    return NextResponse.json({ 
      error: `Server error: ${error.message || 'Unknown error'}`
    }, { status: 500 });
  }
} 