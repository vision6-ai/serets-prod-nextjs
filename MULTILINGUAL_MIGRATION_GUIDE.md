# Multilingual Database Migration Guide

This guide explains how to apply the multilingual database migrations to your Supabase project.

## Overview

The migration process consists of two steps:

1. **First Migration**: Creates translation tables and migrates existing data
2. **Second Migration**: Removes original language columns (only after verifying everything works)

## Step 1: Apply the First Migration

1. Log in to your Supabase Dashboard at https://app.supabase.com/
2. Select your project (with URL: https://llasjkahpdovjshvroky.supabase.co)
3. In the left sidebar, click on "SQL Editor"
4. Click "New Query" to create a new SQL query
5. Copy the entire contents of the file `supabase/migrations/20250310000000_multilingual_support.sql`
6. Paste it into the SQL Editor
7. Click "Run" to execute the query

This migration will:
- Create a new `languages` table with English and Hebrew
- Create translation tables for movies, actors, genres, awards, and SEO metadata
- Migrate existing data from original tables to translation tables
- Create views for backward compatibility

## Step 2: Verify the Migration

After applying the first migration:

1. In the left sidebar, click on "Table Editor"
2. Verify that the following tables were created:
   - `languages`
   - `movie_translations`
   - `actor_translations`
   - `genre_translations`
   - `award_translations`
   - `seo_meta_translations`
3. Check that data was properly migrated by viewing the contents of these tables
4. Run your application and test that it works with the new tables

## Step 3: Apply the Second Migration (Optional)

**IMPORTANT**: Only proceed with this step after verifying that your application is fully using the new translation tables.

1. In the Supabase Dashboard, go to the SQL Editor
2. Create a new query
3. Copy the entire contents of the file `supabase/migrations/20250310000001_cleanup_original_columns.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the query

This migration will:
- Remove the original language columns from the tables
- Update the views to work without the original columns

## Troubleshooting

If you encounter any errors during the migration process:

### Error: "column specified more than once"

This error occurs when a view tries to include columns with the same name from different tables. The updated migration scripts should avoid this issue by using different aliases for the joined tables.

### Error: "relation does not exist"

This error occurs when the migration tries to reference a table or column that doesn't exist. Make sure you're running the migrations in the correct order and that all tables mentioned in the migration exist in your database.

## Adding New Languages

To add a new language to your system:

1. Insert a new row into the `languages` table:
   ```sql
   INSERT INTO languages (code, name, native_name, direction, is_default, is_active)
   VALUES ('fr', 'French', 'Français', 'ltr', false, true);
   ```

2. Add translations for your content in the new language:
   ```sql
   INSERT INTO movie_translations (movie_id, language_code, title, synopsis)
   VALUES 
     ('movie-uuid', 'fr', 'French Title', 'French synopsis');
   ``` 