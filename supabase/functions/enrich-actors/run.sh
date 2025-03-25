#!/bin/bash

# Set environment variables
export OPENAI_API_KEY="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"

echo "Deploying enrich-actors Edge Function to Supabase..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Supabase CLI not found. Please install it first:"
  echo "brew install supabase/tap/supabase"
  exit 1
fi

# Deploy to Supabase
PROJECT_ID=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d'=' -f2 | cut -d'/' -f3 | cut -d'.' -f1)
if [ -z "$PROJECT_ID" ]; then
  echo "Could not determine project ID from .env.local"
  echo "Please run this script from the project root directory"
  exit 1
fi

echo "Detected Supabase project: $PROJECT_ID"

# Set the OpenAI API key as a secret
echo "Setting OpenAI API key as a Supabase secret..."
supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY" --project-ref "$PROJECT_ID"

# Deploy the Edge Function
echo "Deploying Edge Function..."
supabase functions deploy enrich-actors --project-ref "$PROJECT_ID"

# Execute the function
echo "Executing the Edge Function..."
curl -X POST "https://$PROJECT_ID.supabase.co/functions/v1/enrich-actors" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json"

echo "Done!" 