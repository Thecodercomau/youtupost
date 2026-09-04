/* ==========================================
   YOUTUPOST — Router
   Client-Side Routing
   ========================================== */

import { AppState } from './state.js';
import { getHash } from './utils.js';

const routes = {};
let currentRoute = null;
let notFoundHandler = null;

export const Router = {
  register(path, handler) {
    routes[path] = handler;
  },

  setNotFound(handler) {
    notFoundHandler = handler;
  },

  init() {
    window.addEventListener('hashchange', () => this._resolve());
    window.addEventListener('popstate', () => this._resolve());
    this._resolve();
  },

  navigate(path) {
    if (window.location.hash === '#' + path) {
      this._resolve();
    } else {
      window.location.hash = path;
    }
  },

  _resolve() {
    const hash = getHash();
    const path = hash.startsWith('/') ? hash : '/' + hash;

    // Try exact match first
    if (routes[path]) {
      this._execute(path, routes[path]);
      return;
    }

    // Try pattern match (e.g., /profile/:username)
    for (const [pattern, handler] of Object.entries(routes)) {
      const params = this._matchPattern(pattern, path);
      if (params !== null) {
        this._execute(path, handler, params);
        return;
      }
    }

    // 404
    if (notFoundHandler) {
      notFoundHandler(path);
    }
  },

  _execute(path, handler, params = {}) {
    const prev = AppState.getVal('currentPage');
    AppState.set('previousPage', prev);

    // Determine page name from path
    const pageName = path.split('/')[1] || 'home';
    AppState.set('currentPage', pageName);

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Execute route handler
    try {
      handler(params);
    } catch (e) {
      console.error('Route handler error:', e);
    }

    // Update sidebar active state
    this._updateNavActive(pageName);

    currentRoute = path;
  },

  _matchPattern(pattern, path) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return params;
  },

  _updateNavActive(pageName) {
    // Desktop sidebar
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === pageName);
    });
    // Mobile nav
    document.querySelectorAll('.mobile-bottom-nav .nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === pageName);
    });
  },
};
