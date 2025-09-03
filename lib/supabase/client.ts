import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SupabaseSUPABASE_URL!,
    process.env.NEXT_PUBLIC_SupabaseSUPABASE_ANON_KEY!,
  )
}
