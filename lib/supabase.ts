import { createBrowserClient } from '@supabase/ssr'

// Create a single supabase client for interacting with your database
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Also export the createClient function for components that need a fresh instance
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Enhanced client with error handling and retries
export async function fetchWithRetry(fetchFunction: () => Promise<any>, retries = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fetchFunction();
    } catch (error) {
      console.warn(`Fetch attempt ${attempt + 1} failed. Retrying...`, error);
      lastError = error;
      
      // Wait before retrying
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }
  
  console.error(`All ${retries} fetch attempts failed`, lastError);
  throw lastError;
}