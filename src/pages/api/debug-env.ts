import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    const envVars = {
      PUBLIC_SUPABASE_URL: import.meta.env.PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY: import.meta.env.PUBLIC_SUPABASE_ANON_KEY ? '[PRESENT]' : '[MISSING]',
      NODE_ENV: import.meta.env.NODE_ENV || process.env.NODE_ENV,
      VERCEL: import.meta.env.VERCEL || process.env.VERCEL,
      VERCEL_ENV: import.meta.env.VERCEL_ENV || process.env.VERCEL_ENV
    };

    return new Response(JSON.stringify({
      status: 'ok',
      environment: envVars,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      status: 'error',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};