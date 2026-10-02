import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(body: unknown, status = 200, cache = "public, max-age=60, s-maxage=300, stale-while-revalidate=600") {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cache,
      "Vary": "Accept-Encoding",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return json({ ok: false, message: "GET only" }, 405, "no-store");

  const url = new URL(req.url);
  const rawLimit = Number(url.searchParams.get("limit") ?? 200);
  const limit = Math.min(200, Math.max(1, Number.isFinite(rawLimit) ? Math.floor(rawLimit) : 200));

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await supabase
    .from("books")
    .select("id,title,subtitle,pen_name,category,writing_type,genre,format,intro,author_note,cover_url,completed,published,price,episode_count,views,likes,owned,created_at,updated_at")
    .eq("published", true)
    .neq("age_rating", "19")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("public-library", error);
    return json({ ok: false, message: "공개 작품을 불러오지 못했습니다." }, 500, "no-store");
  }

  return json({ ok: true, books: data ?? [], generatedAt: new Date().toISOString() });
});

