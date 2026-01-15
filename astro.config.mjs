import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node'; // Adapter for SSR

export default defineConfig({
  integrations: [tailwind()],
  output: 'server', // Important for dynamic auth routes
  adapter: node({
    mode: 'standalone',
  }),
});