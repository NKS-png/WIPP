import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    return new Response(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Health check passed'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};