#!/bin/bash

# Get Supabase project info from .env.local
source .env.local
PROJECT_ID=$(echo $NEXT_PUBLIC_SUPABASE_URL | cut -d'/' -f3 | cut -d'.' -f1)

if [ -z "$PROJECT_ID" ]; then
  echo "Could not determine project ID from .env.local"
  echo "Please set NEXT_PUBLIC_SUPABASE_URL in .env.local"
  exit 1
fi

echo "Invoking enrich-actors Edge Function..."
echo "This process will run in the background on Supabase servers."
echo "You can check your Supabase dashboard for function logs."

# Invoke the function
curl -X POST "https://$PROJECT_ID.supabase.co/functions/v1/enrich-actors" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json"

echo ""
echo "Request sent. The function is now running on Supabase servers."
echo "Check the Supabase dashboard for logs and results." 