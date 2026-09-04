/* ==========================================
   YOUTUPOST — Main Application
   Entry Point, Initialization
   ========================================== */

import { AppState } from './state.js';
import { Router } from './router.js';
import { AuthService } from './services/services.js';
import { renderSidebar, updateSidebarBadges } from './components/sidebar.js';
import { toast } from './components/toast.js';
import { debounce, delegate } from './utils.js';

/* === Page Imports === */
import { renderLoginPage, renderRegisterPage } from './pages/auth.js';
import { renderHomePage } from './pages/home.js';
import { renderExplorePage } from './pages/explore.js';
import { renderShortsPage, cleanupShortsPage } from './pages/shorts.js';
import { renderMessagesPage } from './pages/messages.js';
import { renderNotificationsPage } from './pages/notifications.js';
import { renderProfilePage } from './pages/profile.js';
import { renderSettingsPage } from './pages/settings.js';
import { renderCommunitiesPage } from './pages/communities.js';
import { renderSavedPage } from './pages/saved.js';
import { renderCreatePage } from './pages/create.js';
import { renderAIPage } from './pages/ai.js';
import { renderSearchPage } from './pages/search.js';

/* === Supabase === */
import { isSupabaseConfigured, getSupabase } from './supabase.js';
import { RealtimeService } from './services/services.js';

/* === Demo Data Loader === */
import { loadDemoData } from './demo/data.js';

function ensureDemoData() {
  const users = AppState.getVal('users') || [];
  if (users.length === 0) {
    const demo = loadDemoData();
    AppState.set('users', demo.users);
    AppState.set('posts', demo.posts);
    AppState.set('stories', demo.stories);
    AppState.set('shorts', demo.shorts);
    AppState.set('conversations', demo.conversations);
    AppState.set('messages', demo.messages);
    AppState.set('notifications', demo.notifications);
    AppState.set('communities', demo.communities);
    AppState.set('savedPosts', demo.savedPosts);
    AppState.set('savedCollections', demo.savedCollections);
    AppState.set('followRelationships', demo.followRelationships);
  }
}

/* === Initialize App === */
async function initApp() {
  // 1. Initialize state (sync — instant)
  AppState.init();

  // Check system theme preference
  if (!localStorage.getItem('youtupost_state')) {
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      AppState.set('theme', 'light');
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      AppState.set('reducedMotion', true);
    }
  }

  AppState._applyTheme();

  // 2. Load demo data (sync — instant)
  ensureDemoData();

  // 3. Render ALL UI immediately (sync — instant)
  renderSidebar();
  setupMobileNav();
  setupTopbar();
  setupKeyboardShortcuts();
  setupSidebarCollapse();

  // Subscribe to state changes
  AppState.subscribe('notifications', () => updateSidebarBadges());
  AppState.subscribe('conversations', () => updateSidebarBadges());

  // 4. Register routes and start router (sync)
  registerRoutes();

  // 5. Auto-login as demo user if no session
  if (!window.location.hash.includes('login') && !window.location.hash.includes('register')) {
    ensureDemoData();
    const existing = AppState.getVal('currentUser');
    if (!existing) {
      AuthService.continueAsDemo();
    }
  }

  // 6. Initialize router (shows the correct page)
  Router.init();

  // 7. NOW init Supabase in the background (async — non-blocking)
  initSupabaseBackground();
}

/* === Supabase Background Init === */
async function initSupabaseBackground() {
  if (!isSupabaseConfigured()) return;

  console.log('[Youtupost] Initializing Supabase in background...');
  try {
    const sb = await getSupabase();
    if (!sb) {
      console.warn('[Youtupost] Supabase failed to initialize');
      return;
    }

    // Listen for auth state changes
    sb.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          AppState.set('currentUser', profile.id);
          renderSidebar();
          setupMobileNav();
          toast.success(`Welcome back, ${profile.display_name}!`);
        }
      } else if (event === 'SIGNED_OUT') {
        AppState.set('currentUser', null);
        renderSidebar();
        Router.navigate('/login');
      }
    });

    // Check existing session
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user) {
      const { data: profile } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
      if (profile) {
        AppState.set('currentUser', profile.id);
        renderSidebar();
        console.log('[Youtupost] Session restored for', profile.display_name);
      }
    }

    // Setup real-time subscriptions
    if (AppState.getVal('currentUser')) {
      setupRealtimeSubscriptions();
    }

    console.log('[Youtupost] Supabase ready');
  } catch (e) {
    console.warn('[Youtupost] Supabase init error:', e);
  }
}

/* === Real-time Subscriptions === */
async function setupRealtimeSubscriptions() {
  try {
    // Subscribe to notifications
    await RealtimeService.subscribeToNotifications((notif) => {
      toast.info('New notification!');
      updateSidebarBadges();
    });

    // Track presence
    await RealtimeService.trackPresence(AppState.getVal('currentUser'));

    console.log('[Youtupost] Real-time subscriptions active');
  } catch (e) {
    console.warn('[Youtupost] Real-time setup error:', e);
  }
}

/* === Routes === */
function registerRoutes() {
  Router.register('/login', () => renderLoginPage());
  Router.register('/register', () => renderRegisterPage());

  Router.register('/home', () => {
    showPage('home');
    renderHomePage();
  });

  Router.register('/explore', () => {
    showPage('explore');
    renderExplorePage();
  });

  Router.register('/shorts', () => {
    showPage('shorts');
    renderShortsPage();
  });

  Router.register('/messages', () => {
    showPage('messages');
    renderMessagesPage();
  });

  Router.register('/notifications', () => {
    showPage('notifications');
    renderNotificationsPage();
  });

  Router.register('/create', () => {
    showPage('create');
    renderCreatePage();
  });

  Router.register('/profile/:username', (params) => {
    showPage('profile');
    renderProfilePage(params);
  });

  Router.register('/settings', () => {
    showPage('settings');
    renderSettingsPage();
  });

  Router.register('/communities', () => {
    showPage('communities');
    renderCommunitiesPage();
  });

  Router.register('/saved', () => {
    showPage('saved');
    renderSavedPage();
  });

  Router.register('/ai', () => {
    showPage('ai');
    renderAIPage();
  });

  Router.register('/search', () => {
    showPage('search-page');
    renderSearchPage();
  });

  Router.register('/', () => {
    showPage('home');
    renderHomePage();
  });

  // Default route
  Router.setNotFound(() => {
    showPage('home');
    renderHomePage();
  });
}

/* === Page Management === */
function showPage(pageId) {
  // Clean up previous page
  cleanupShortsPage();

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Show target page
  const page = document.getElementById(`page-${pageId}`);
  if (page) {
    page.classList.add('active');
    page.classList.add('page-enter');
    setTimeout(() => page.classList.remove('page-enter'), 300);
  }

  // Show/hide layout based on auth
  const isAuth = ['login', 'register'].includes(pageId);
  const appLayout = document.getElementById('app-layout');
  if (appLayout) {
    appLayout.style.display = isAuth ? 'none' : 'flex';
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

/* === Mobile Navigation === */
function setupMobileNav() {
  const mobileNav = document.getElementById('mobile-bottom-nav');
  if (!mobileNav) return;

  mobileNav.innerHTML = `
    <div class="nav-items">
      <div class="nav-item active" data-page="home" data-hash="#/home">
        <div class="nav-icon"><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
        <span>Home</span>
      </div>
      <div class="nav-item" data-page="explore" data-hash="#/explore">
        <div class="nav-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg></div>
        <span>Explore</span>
      </div>
      <div class="nav-item create-btn" data-page="create" data-hash="#/create">
        <div class="nav-icon"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
      </div>
      <div class="nav-item" data-page="shorts" data-hash="#/shorts">
        <div class="nav-icon"><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><polygon points="10 8 16 12 10 16 10 8"/></svg></div>
        <span>Shorts</span>
      </div>
      <div class="nav-item" data-page="profile" data-hash="#/profile/${AppState.getVal('currentUser') ? '' : ''}">
        <div class="nav-icon"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
        <span>Profile</span>
      </div>
    </div>
  `;

  mobileNav.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const hash = item.dataset.hash;
      if (hash) {
        if (item.dataset.page === 'profile') {
          const user = AuthService.getCurrentUser();
          if (user) Router.navigate(`/profile/${user.username}`);
        } else {
          Router.navigate(hash.slice(1));
        }
      }
    });
  });
}

/* === Topbar === */
function setupTopbar() {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;

  topbar.innerHTML = `
    <div class="topbar-left">
      <button id="sidebar-toggle" class="topbar-btn" aria-label="Toggle sidebar">
        <svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>
    <div class="topbar-center">
      <div class="search-bar">
        <span class="search-icon"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
        <input type="text" placeholder="Search" id="topbar-search" aria-label="Search">
      </div>
    </div>
    <div class="topbar-right">
      <button class="topbar-btn" id="topbar-messages" aria-label="Messages">
        <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      </button>
      <button class="topbar-btn" id="topbar-notifs" aria-label="Notifications">
        <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span class="notif-dot" id="topbar-notif-dot" style="display:none;"></span>
      </button>
    </div>
  `;

  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    const collapsed = !AppState.getVal('sidebarCollapsed');
    AppState.set('sidebarCollapsed', collapsed);
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    if (sidebar) sidebar.classList.toggle('collapsed', collapsed);
    if (mainContent) mainContent.classList.toggle('sidebar-collapsed', collapsed);
  });

  document.getElementById('topbar-search')?.addEventListener('click', () => {
    Router.navigate('/search');
  });

  document.getElementById('topbar-messages')?.addEventListener('click', () => {
    Router.navigate('/messages');
  });

  document.getElementById('topbar-notifs')?.addEventListener('click', () => {
    Router.navigate('/notifications');
  });

  // Update notif dot
  updateNotifDot();
  AppState.subscribe('notifications', updateNotifDot);
}

function updateNotifDot() {
  const dot = document.getElementById('topbar-notif-dot');
  if (!dot) return;
  const notifs = AppState.getVal('notifications') || [];
  const unread = notifs.filter(n => !n.read).length;
  dot.style.display = unread > 0 ? '' : 'none';
}

/* === Sidebar Collapse === */
function setupSidebarCollapse() {
  const collapsed = AppState.getVal('sidebarCollapsed');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.querySelector('.main-content');
  if (sidebar) sidebar.classList.toggle('collapsed', collapsed);
  if (mainContent) mainContent.classList.toggle('sidebar-collapsed', collapsed);
}

/* === Keyboard Shortcuts === */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Don't trigger if typing in an input
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    if (document.activeElement?.contentEditable === 'true') return;

    // Don't trigger if modal is open
    if (document.querySelector('.modal-backdrop')?.style.opacity === '1') {
      if (e.key === 'Escape') {
        document.querySelector('.modal-backdrop')?.click();
      }
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'h': Router.navigate('/home'); break;
      case 'e': Router.navigate('/explore'); break;
      case 's': Router.navigate('/search'); break;
      case 'm': Router.navigate('/messages'); break;
      case 'n': Router.navigate('/notifications'); break;
      case 'c': Router.navigate('/create'); break;
      case 'p':
        const user = AuthService.getCurrentUser();
        if (user) Router.navigate(`/profile/${user.username}`);
        break;
    }
  });
}

/* === Start === */
document.addEventListener('DOMContentLoaded', initApp);
