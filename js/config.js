/* ==========================================
   YOUTUPOST — Configuration
   Supabase Credentials & App Settings
   ========================================== */

// ============================================
// PASTE YOUR SUPABASE CREDENTIALS BELOW
// ============================================

export const SUPABASE_URL = 'https://rldcbdabnimrdlgcocsr.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZGNiZGFibmltcmRsZ2NvY3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MjU2NDQsImV4cCI6MjEwNDAwMTY0NH0.LkSUk8tXW6tP1SwWQtR2tsm1onraSa9EMWMJTStgu8U';

// ============================================
// APP SETTINGS
// ============================================

export const APP_NAME = 'Youtupost';
export const APP_VERSION = '1.0.0';
export const DEMO_MODE = !SUPABASE_URL || !SUPABASE_ANON_KEY;

// Storage bucket name for media uploads
export const STORAGE_BUCKET = 'media';

// Realtime channel prefixes
export const RT_CHANNEL_MESSAGES = 'messages:';
export const RT_CHANNEL_NOTIFICATIONS = 'notifications:';
export const RT_CHANNEL_PRESENCE = 'presence:';
