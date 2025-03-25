#!/bin/bash

# Set environment variables
OPENAI_API_KEY="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"

echo "Deploying enrich-actors Edge Function to Supabase..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Supabase CLI not found. Installing..."
  if command -v brew &> /dev/null; then
    brew install supabase/tap/supabase
  else
    echo "Error: Homebrew is not installed. Please install Homebrew first:"
    echo "https://brew.sh/"
    exit 1
  fi
fi

# Get Supabase project info from .env.local
source .env.local
PROJECT_ID=$(echo $NEXT_PUBLIC_SUPABASE_URL | cut -d'/' -f3 | cut -d'.' -f1)

if [ -z "$PROJECT_ID" ]; then
  echo "Could not determine project ID from .env.local"
  echo "Please set NEXT_PUBLIC_SUPABASE_URL in .env.local"
  exit 1
fi

echo "Detected Supabase project: $PROJECT_ID"

# Set environment variables for the function
echo "Setting up environment variables..."
supabase secrets set --env-file .env.local OPENAI_API_KEY="$OPENAI_API_KEY" --project-ref "$PROJECT_ID"

# Deploy the function
echo "Deploying Edge Function..."
supabase functions deploy enrich-actors --project-ref "$PROJECT_ID"

echo "Function deployed successfully!"
echo "You can now invoke it with:"
echo "curl -X POST https://$PROJECT_ID.supabase.co/functions/v1/enrich-actors -H \"Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY\"" 