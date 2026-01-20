import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({
    error: 'Auto encryption disabled for serverless compatibility',
    success: false
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' }
  });
};