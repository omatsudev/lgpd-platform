import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require('./package.json') as { version: string }

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://utesgzaybftosklfuhnt.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0ZXNnemF5YmZ0b3NrbGZ1aG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MjQ1MTcsImV4cCI6MjA5MjEwMDUxN30.D0m3Q4KtBt770rfJkQ0DLBJjs9E_-zvmPhzcx4FK2Pc",
    // Injetados em build time — lidos pelo sidebar e por /api/version
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_BUILD_TIME:  new Date().toISOString(),
  },
};

export default nextConfig;
