import { s as supabase } from '../../chunks/supabase_DJaqNw0S.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;
    if (!accessToken || !refreshToken) {
      return new Response("Not authenticated", { status: 401 });
    }
    const { data: sessionData } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    if (!sessionData.session) {
      return new Response("Invalid session", { status: 401 });
    }
    const formData = await request.formData();
    const imageFile = formData.get("image");
    const folder = formData.get("folder") || "uploads";
    if (!imageFile || imageFile.size === 0) {
      return new Response("No image file provided", { status: 400 });
    }
    if (!imageFile.type.startsWith("image/")) {
      return new Response("File must be an image", { status: 400 });
    }
    if (imageFile.size > 2 * 1024 * 1024) {
      return new Response("Max 2MB", { status: 400 });
    }
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    console.log("Uploading image:", { fileName, filePath, size: imageFile.size });
    const { data: uploadData, error: uploadError } = await supabase.storage.from("projects").upload(filePath, imageFile, {
      cacheControl: "3600",
      upsert: false
    });
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response("Failed to upload image: " + uploadError.message, { status: 500 });
    }
    const { data: urlData } = supabase.storage.from("projects").getPublicUrl(filePath);
    console.log("Image uploaded successfully:", urlData.publicUrl);
    return new Response(JSON.stringify({
      success: true,
      url: urlData.publicUrl,
      path: filePath
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
