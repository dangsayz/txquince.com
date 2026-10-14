import { connection } from "next/server";

/**
 * Public browser config read at RUNTIME from the Worker's env, so the admin
 * login works even when a build ran without the NEXT_PUBLIC_* values inlined.
 * Both values are public by design (the anon key is safe to ship to browsers).
 */
// Read by dynamic key: Next inlines literal `process.env.NEXT_PUBLIC_*` reads at
// build time, which would freeze them empty when the build machine lacks them.
const runtimeEnv = (name: string) => process.env[name] ?? "";

export async function GET() {
  await connection();
  return Response.json(
    {
      supabaseUrl: runtimeEnv("NEXT_PUBLIC_SUPABASE_URL") || runtimeEnv("SUPABASE_URL"),
      supabaseAnonKey: runtimeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
