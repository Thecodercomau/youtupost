/* ==========================================
   YOUTUPOST — Supabase Client
   Initialization & Configuration
   ========================================== */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

let supabaseClient = null;
let initPromise = null;

/**
 * Get or initialize the Supabase client.
 * Always returns a Promise<SupabaseClient|null>.
 */
export function getSupabase() {
  // Already initialized
  if (supabaseClient) return Promise.resolve(supabaseClient);

  // No credentials — demo mode
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[Youtupost] Supabase not configured. Running in demo mode.');
    return Promise.resolve(null);
  }

  // Already initializing — reuse the same promise
  if (initPromise) return initPromise;

  // Initialize
  initPromise = (async () => {
    try {
      // Load Supabase JS from CDN
      if (!window.supabase) {
        await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
      }

      if (!window.supabase) {
        console.error('[Youtupost] Supabase JS library failed to load from CDN');
        initPromise = null;
        return null;
      }

      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
        realtime: {
          params: { eventsPerSecond: 10 },
        },
      });

      console.log('[Youtupost] Supabase client initialized');
      return supabaseClient;
    } catch (err) {
      console.error('[Youtupost] Failed to initialize Supabase:', err);
      initPromise = null;
      return null;
    }
  })();

  return initPromise;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export function isSupabaseConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}
