import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // ── Core App Identity ──────────────────────────────────────────────────────
  appId:   'com.unidwell.app',
  appName: 'Unidwell',

  // Points Capacitor at the Vite build output directory
  webDir: 'dist',

  // ── Server (Web Dev only — not used in production APK) ────────────────────
  server: {
    androidScheme: 'https',
    // Uncomment for live-reload during development on a device:
    // url: 'http://192.168.x.x:5173',
    // cleartext: true,
  },

  // ── Android-specific config ────────────────────────────────────────────────
  android: {
    // Allow mixed-content (needed for Firebase Storage download URLs over http)
    allowMixedContent: true,
    // Use the web implementation for storage (vs. native fs)
    webContentsDebuggingEnabled: true,
    // Capture background color before React paints to avoid white flash
    backgroundColor: '#0F172A',
  },

  // ── Plugin Configuration ───────────────────────────────────────────────────
  plugins: {
    // SplashScreen: React SplashScreen.tsx handles the UX animation entirely.
    // We just need a dark background to hide any native white flash.
    SplashScreen: {
      launchAutoHide:     true,     // Native splash hides immediately
      launchShowDuration: 0,        // 0ms — hidden before React even paints
      backgroundColor:   '#0F172A',
      androidSplashResourceName: 'splash',
      showSpinner:       false,
    },

    // Camera: Used for profile photo / property photo uploads
    Camera: {
      permissions: ['camera', 'photos'],
    },

    // StatusBar: Translucent overlay so the app content goes edge-to-edge
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0F172A',
    },
  },
};

export default config;
