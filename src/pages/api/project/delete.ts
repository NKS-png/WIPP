import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { project_id } = await request.json();

    if (!project_id) {
      return new Response('Project ID is required', { status: 400 });
    }

    // Get current user
    const authHeader = request.headers.get('cookie');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Extract tokens from cookies
    const cookies = authHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const accessToken = cookies['sb-access-token'];
    const refreshToken = cookies['sb-refresh-token'];

    if (!accessToken || !refreshToken) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Set session
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError || !sessionData.session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const currentUser = sessionData.session.user;

    // Get project to verify ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return new Response('Project not found', { status: 404 });
    }

    // Check if user owns the project
    if (project.user_id !== currentUser.id) {
      return new Response('Forbidden: You can only delete your own projects', { status: 403 });
    }

    // Delete the project (this will cascade delete comments due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', project_id);

    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      return new Response('Failed to delete project', { status: 500 });
    }

    return new Response('Project deleted successfully', { status: 200 });

  } catch (error) {
    console.error('Error in delete project API:', error);
    return new Response('Internal server error', { status: 500 });
  }
};