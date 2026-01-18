import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Get session from cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return new Response('Not authenticated', { status: 401 });
    }

    const { data: sessionData } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!sessionData.session) {
      return new Response('Invalid session', { status: 401 });
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!imageFile || imageFile.size === 0) {
      return new Response('No image file provided', { status: 400 });
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return new Response('File must be an image', { status: 400 });
    }

    // Validate file size (5MB max)
    if (imageFile.size > 5 * 1024 * 1024) {
      return new Response('Image must be less than 5MB', { status: 400 });
    }

    // Generate unique filename
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log('Uploading image:', { fileName, filePath, size: imageFile.size });

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('projects') // Using existing bucket
      .upload(filePath, imageFile, { 
        cacheControl: '3600', 
        upsert: false 
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response('Failed to upload image: ' + uploadError.message, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('projects')
      .getPublicUrl(filePath);

    console.log('Image uploaded successfully:', urlData.publicUrl);

    return new Response(JSON.stringify({ 
      success: true, 
      url: urlData.publicUrl,
      path: filePath
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};