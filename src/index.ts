export default {
  async fetch(request, env) {
    // CORS headers - cho phép gọi từ bất kỳ domain nào
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Xử lý preflight request (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Lấy prompt từ URL hoặc POST body
    const url = new URL(request.url);
    let prompt = url.searchParams.get("prompt");

    if (!prompt && request.method === "POST") {
      try {
        const body = await request.json();
        prompt = body.prompt;
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Nếu không có prompt, trả về lỗi
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Thiếu tham số 'prompt'. Gửi qua ?prompt=... hoặc POST body {\"prompt\": \"...\"}" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    try {
      // Gọi Workers AI để tạo ảnh
      const inputs = { prompt };
      const response = await env.AI.run(
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        inputs
      );

      // Trả về ảnh PNG với CORS headers
      return new Response(response, {
        headers: {
          "Content-Type": "image/png",
          ...corsHeaders,
        },
      });
    } catch (e) {
      return new Response(
        JSON.stringify({ error: e.message || "Lỗi khi tạo ảnh" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  },
} satisfies ExportedHandler<Env>;
