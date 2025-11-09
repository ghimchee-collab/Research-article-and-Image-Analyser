import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This makes Vercel's VITE_API_KEY available as process.env.API_KEY in client-side code
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY),
  },
});
