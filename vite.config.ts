import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // CAPACITOR: base must be './' so all asset paths are relative.
  // This is required for file:// loading in Android WebView.
  base: './',

  server: {
    host: true, // Listen on all network interfaces for mobile Wi-Fi access
    port: 5173,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    // Ensure chunk size warnings are raised for large bundles
    chunkSizeWarningLimit: 1600,
  },
});

