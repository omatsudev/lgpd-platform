import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = "https://utesgzaybftosklfuhnt.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0ZXNnemF5YmZ0b3NrbGZ1aG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MjQ1MTcsImV4cCI6MjA5MjEwMDUxN30.D0m3Q4KtBt770rfJkQ0DLBJjs9E_-zvmPhzcx4FK2Pc"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component — cookies set in middleware
          }
        },
      },
    }
  )
}
