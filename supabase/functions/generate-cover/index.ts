import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://jeyukida-eng.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

function failMessage(message: string, code = "ERROR", extra: Record<string, unknown> = {}) {
  return json({ ok: false, code, message, ...extra });
}

function isUuid(value: unknown) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, code: "METHOD_NOT_ALLOWED", message: "POST 요청만 지원합니다." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const openaiKey = Deno.env.get("OPENAI_API_KEY") ?? "";
  const imageModel = Deno.env.get("OPENAI_IMAGE_MODEL") ?? "gpt-image-2";

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json({ ok: false, code: "AUTH_REQUIRED", message: "작가 로그인이 필요합니다." }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const admin = createClient(supabaseUrl, serviceRoleKey);

  const token = authHeader.replace(/^Bearer\s+/i, "");
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  const user = userData?.user ?? null;
  if (userError || !user || user.is_anonymous) return json({ ok: false, code: "AUTH_REQUIRED", message: "작가 로그인이 필요합니다." }, 401);

  let body: any = {};
  try {
    const reader=req.body?.getReader();let size=0;const chunks:Uint8Array[]=[];
    if(!reader)throw new Error('EMPTY_BODY');
    for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>32768){await reader.cancel();return json({ok:false,code:'REQUEST_TOO_LARGE',message:'표지 설명이 너무 깁니다.'},413);}chunks.push(value);}
    const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
    body=JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return failMessage("요청 형식이 올바르지 않습니다.", "BAD_REQUEST");
  }

  if(!body||typeof body!=='object'||Array.isArray(body))return json({ok:false,code:'BAD_REQUEST',message:'요청 형식이 올바르지 않습니다.'},400);

  const coverKey = String(body.coverKey ?? "").trim();
  const fullPrompt = String(body.prompt ?? "").trim();
  const userPrompt = String(body.userPrompt ?? "").trim();
  const style = ["watercolor", "pencil", "storybook", "essay", "realistic", "minimal"].includes(String(body.style)) ? String(body.style) : "pencil";
  const bookId = isUuid(body.bookId) ? String(body.bookId) : null;

  if (!isUuid(coverKey)) return failMessage("표지 작업 키가 올바르지 않습니다. 새 책 등록 화면을 다시 열어 주세요.", "INVALID_COVER_KEY");
  if (!fullPrompt) return failMessage("AI 표지 설명을 먼저 적어 주세요.", "PROMPT_REQUIRED");

  // The first successful AI cover generation is free for each book/draft.
  // cover_key is persisted with the book, so the partial unique index on (user_id, cover_key)
  // prevents a second free generation even across tabs/devices.
  if(fullPrompt.length>6000||userPrompt.length>3000)return json({ok:false,code:'PROMPT_TOO_LONG',message:'표지 설명은 6,000자 이내로 입력해 주세요.'},400);
  const {data:reservation,error:reserveError}=await admin.rpc('reserve_cover_generation',{
    p_owner:user.id,p_cover_key:coverKey,p_book:bookId,p_user_prompt:userPrompt,p_full_prompt:fullPrompt,p_style:style,p_model:imageModel
  }).single();

  if (reserveError) {
    if(reserveError.message?.includes('COVER_RATE_LIMIT'))return json({ok:false,code:'RATE_LIMIT',message:'표지 생성은 1분에 2회, 하루에 10회까지 가능합니다. 잠시 후 다시 시도해 주세요.'},429);
    if(reserveError.message?.includes('COVER_OWNER_REQUIRED'))return json({ok:false,code:'OWNER_REQUIRED',message:'본인 작품에만 표지를 만들 수 있습니다.'},403);
    if (reserveError.code === "23505") {
      return failMessage(
        "이 책의 첫 AI 표지 무료 1회를 이미 사용했습니다. 2회째부터는 유료입니다.",
        "PAYMENT_REQUIRED",
        { freeUsed: true }
      );
    }
    console.error("cover reservation error", reserveError);
    return failMessage("AI 표지 사용 횟수를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.", "RESERVATION_FAILED");
  }

  const logId = reservation.id;

  const markFailed = async (message: string) => {
    try {
      await admin
        .from("cover_generation_logs")
        .update({ status: "failed", error_message: message.slice(0, 1000) })
        .eq("id", logId);
    } catch (_) {}
  };

  if (!openaiKey) {
    await markFailed("OPENAI_API_KEY is not configured");
    return failMessage(
      "AI 이미지 서버 연결 키가 아직 설정되지 않았습니다.",
      "OPENAI_API_KEY_MISSING"
    );
  }

  const imagePrompt = [
    fullPrompt,
    "Generate artwork only. Do not draw or print any title, author name, letters, words, logos, watermarks, or typography inside the image.",
    "Keep generous clean breathing room in the lower-middle area because the app will add Korean title and author typography afterward."
  ].join(" ");

  try {
    const aiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: imageModel,
        prompt: imagePrompt,
        size: "1024x1536",
        quality: "medium",
        output_format: "jpeg",
        output_compression: 80,
        n: 1,
        user: user.id,
      }),
    });

    if (!aiResponse.ok) {
      const raw = await aiResponse.text();
      console.error("OpenAI image error", aiResponse.status, raw.slice(0, 1200));
      await markFailed(`OpenAI ${aiResponse.status}: ${raw.slice(0, 700)}`);

      let apiCode = "";
      try {
        apiCode = JSON.parse(raw)?.error?.code ?? "";
      } catch (_) {}

      if (apiCode === "credit_balance_exhausted") {
        return failMessage(
          "OpenAI API 크레딧이 모두 소진되었습니다. API 결제에서 크레딧을 충전한 뒤 다시 시도해 주세요. 무료 1회는 차감되지 않았습니다.",
          "OPENAI_CREDIT_EXHAUSTED"
        );
      }

      return failMessage(
        "AI 이미지 생성 서버에서 오류가 발생했습니다. 무료 1회는 차감되지 않았습니다.",
        "OPENAI_GENERATION_FAILED"
      );
    }

    const result = await aiResponse.json();
    const b64 = result?.data?.[0]?.b64_json;
    if (!b64) {
      await markFailed("OpenAI response did not include b64_json");
      return failMessage("생성된 이미지 데이터를 받지 못했습니다. 무료 1회는 차감되지 않았습니다.", "EMPTY_IMAGE");
    }

    const bytes = base64ToBytes(b64);
    const imagePath = `${user.id}/ai/${coverKey}/${logId}.jpg`;

    const { error: uploadError } = await admin.storage
      .from("book-covers")
      .upload(imagePath, bytes, {
        contentType: "image/jpeg",
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.error("cover storage error", uploadError);
      await markFailed(uploadError.message || "storage upload failed");
      return failMessage("표지 이미지를 저장하지 못했습니다. 무료 1회는 차감되지 않았습니다.", "STORAGE_FAILED");
    }

    const imageUrl = admin.storage.from("book-covers").getPublicUrl(imagePath).data?.publicUrl ?? "";

    const { error: completeError } = await admin
      .from("cover_generation_logs")
      .update({
        status: "completed",
        image_path: imagePath,
        completed_at: new Date().toISOString(),
        error_message: "",
      })
      .eq("id", logId);

    if (completeError) console.error("cover log completion error", completeError);

    return json({
      ok: true,
      free: true,
      freeUsed: true,
      generationId: logId,
      imageDataUrl: `data:image/jpeg;base64,${b64}`,
      imageUrl,
      model: imageModel,
      quality: "medium",
      message: "이 책의 첫 AI 표지 무료 1회 생성이 완료되었습니다.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("generate-cover unexpected error", message);
    await markFailed(message);
    return failMessage("AI 표지 생성 중 오류가 발생했습니다. 무료 1회는 차감되지 않았습니다.", "UNEXPECTED_ERROR");
  }
});

