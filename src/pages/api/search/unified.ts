import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    // Get session from cookies for potential user-specific filtering
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    let currentUser = null;
    if (accessToken && refreshToken) {
      try {
        const { data: sessionData } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        currentUser = sessionData.session?.user;
      } catch (error) {
        console.warn('Session validation failed:', error);
        // Continue without authentication - search should work for anonymous users
      }
    }

    // Get search parameters
    const query = url.searchParams.get('query')?.trim();
    const types = url.searchParams.get('types')?.split(',') || ['user', 'community', 'post', 'project'];
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50); // Max 50 results

    if (!query || query.length < 2) {
      return new Response(JSON.stringify({
        error: 'Query must be at least 2 characters long',
        results: [],
        totalCount: 0,
        searchTime: 0
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const startTime = Date.now();
    const results = [];

    // Search users (profiles)
    if (types.includes('user')) {
      try {
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, bio')
          .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,bio.ilike.%${query}%`)
          .limit(Math.ceil(limit / types.length));

        if (usersError) {
          console.error('Users search error:', usersError);
        } else if (users) {
          users.forEach(user => {
            results.push({
              id: user.id,
              type: 'user',
              title: user.full_name || user.username || 'Unknown User',
              description: user.bio || `@${user.username}`,
              url: `/profile/${user.id}`,
              metadata: {
                username: user.username,
                avatar_url: user.avatar_url
              }
            });
          });
        }
      } catch (error) {
        console.error('Error searching users:', error);
      }
    }

    // Search communities
    if (types.includes('community')) {
      try {
        const { data: communities, error: communitiesError } = await supabase
          .from('communities')
          .select('id, name, description, image_url, created_at')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(Math.ceil(limit / types.length));

        if (communitiesError) {
          console.error('Communities search error:', communitiesError);
        } else if (communities) {
          communities.forEach(community => {
            results.push({
              id: community.id,
              type: 'community',
              title: community.name,
              description: community.description || 'Community',
              url: `/c/${community.id}`,
              metadata: {
                image_url: community.image_url,
                created_at: community.created_at
              }
            });
          });
        }
      } catch (error) {
        console.error('Error searching communities:', error);
      }
    }

    // Search posts
    if (types.includes('post')) {
      try {
        const { data: posts, error: postsError } = await supabase
          .from('posts')
          .select(`
            id, content, image_url, created_at, type, user_id, community_id,
            profiles!posts_user_id_fkey (username, full_name, avatar_url),
            communities (name)
          `)
          .ilike('content', `%${query}%`)
          .limit(Math.ceil(limit / types.length))
          .order('created_at', { ascending: false });

        if (postsError) {
          console.error('Posts search error:', postsError);
        } else if (posts) {
          posts.forEach(post => {
            const author = post.profiles;
            const community = post.communities;
            const contentPreview = post.content.length > 100 
              ? post.content.substring(0, 100) + '...' 
              : post.content;

            results.push({
              id: post.id,
              type: 'post',
              title: contentPreview,
              description: `by ${author?.full_name || author?.username || 'Unknown'} in c/${community?.name || 'Unknown'}`,
              url: `/post/${post.id}`,
              metadata: {
                author: author?.full_name || author?.username,
                community: community?.name,
                post_type: post.type,
                image_url: post.image_url,
                created_at: post.created_at
              }
            });
          });
        }
      } catch (error) {
        console.error('Error searching posts:', error);
      }
    }

    // Search projects
    if (types.includes('project')) {
      try {
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select(`
            id, title, description, image_url, images, created_at, user_id,
            profiles!projects_user_id_fkey (username, full_name, avatar_url)
          `)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(Math.ceil(limit / types.length))
          .order('created_at', { ascending: false });

        if (projectsError) {
          console.error('Projects search error:', projectsError);
        } else if (projects) {
          projects.forEach(project => {
            const author = project.profiles;
            const descriptionPreview = project.description && project.description.length > 100 
              ? project.description.substring(0, 100) + '...' 
              : project.description;

            results.push({
              id: project.id,
              type: 'project',
              title: project.title,
              description: descriptionPreview || `by ${author?.full_name || author?.username || 'Unknown'}`,
              url: `/project/${project.id}`,
              metadata: {
                author: author?.full_name || author?.username,
                image_url: project.image_url || (project.images && project.images[0]),
                created_at: project.created_at
              }
            });
          });
        }
      } catch (error) {
        console.error('Error searching projects:', error);
      }
    }

    const searchTime = Date.now() - startTime;

    // Sort results by relevance (exact matches first, then by creation date)
    results.sort((a, b) => {
      const aExactMatch = a.title.toLowerCase().includes(query.toLowerCase());
      const bExactMatch = b.title.toLowerCase().includes(query.toLowerCase());
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // If both or neither are exact matches, sort by creation date (newest first)
      const aDate = new Date(a.metadata?.created_at || 0);
      const bDate = new Date(b.metadata?.created_at || 0);
      return bDate.getTime() - aDate.getTime();
    });

    // Limit final results
    const limitedResults = results.slice(0, limit);

    return new Response(JSON.stringify({
      results: limitedResults,
      totalCount: limitedResults.length,
      searchTime,
      query,
      types: types.filter(type => ['user', 'community', 'post', 'project'].includes(type))
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60' // Cache for 1 minute
      }
    });

  } catch (error: any) {
    console.error('Unified search API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message,
      results: [],
      totalCount: 0,
      searchTime: 0
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Get session from cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    let currentUser = null;
    if (accessToken && refreshToken) {
      try {
        const { data: sessionData } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        currentUser = sessionData.session?.user;
      } catch (error) {
        console.warn('Session validation failed:', error);
      }
    }

    const { query, types, limit } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return new Response(JSON.stringify({
        error: 'Query must be at least 2 characters long',
        results: [],
        totalCount: 0,
        searchTime: 0
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create URL with search parameters and delegate to GET handler
    const searchUrl = new URL('/api/search/unified', 'http://localhost');
    searchUrl.searchParams.set('query', query.trim());
    if (types && Array.isArray(types)) {
      searchUrl.searchParams.set('types', types.join(','));
    }
    if (limit && typeof limit === 'number') {
      searchUrl.searchParams.set('limit', limit.toString());
    }

    // Call the GET handler
    const getResponse = await GET({ url: searchUrl, cookies } as any);
    return getResponse;

  } catch (error: any) {
    console.error('Unified search POST API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message,
      results: [],
      totalCount: 0,
      searchTime: 0
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};