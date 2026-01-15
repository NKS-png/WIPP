import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel'; // Adapter for Vercel

export default defineConfig({
  integrations: [tailwind()],
  output: 'server', // Important for dynamic auth routes
  adapter: vercel(),
});