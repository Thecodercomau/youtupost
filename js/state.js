/* ==========================================
   YOUTUPOST — State Management
   Central Application State
   ========================================== */

import { Storage } from './storage.js';

const listeners = new Map();
let state = {};

const defaultState = {
  currentUser: null,
  currentPage: 'home',
  previousPage: null,
  theme: 'dark',
  accent: 'default',
  density: 'comfortable',
  reducedMotion: false,
  sidebarCollapsed: false,
  users: [],
  posts: [],
  stories: [],
  shorts: [],
  messages: [],
  conversations: [],
  notifications: [],
  communities: [],
  savedPosts: [],
  savedCollections: [],
  drafts: [],
  archivedPosts: [],
  followRelationships: {},
  blockedUsers: [],
  mutedUsers: [],
  closeFriends: [],
  settings: {
    profile: { public: true },
    privacy: {
      commentsPermission: 'everyone',
      mentionPermission: 'everyone',
      messagePermission: 'everyone',
      storyVisibility: 'everyone',
      activityVisibility: true,
      readReceipts: true,
    },
    notifications: {
      likes: true,
      comments: true,
      follows: true,
      messages: true,
      mentions: true,
      system: true,
    },
    content: {
      sensitiveContent: false,
      autoplay: true,
    },
    activityStatus: true,
    language: 'en',
  },
  searchHistory: [],
  onlineUsers: [],
  typingUsers: {},
};

export const AppState = {
  init() {
    const saved = Storage.get('youtupost_state');
    if (saved) {
      state = this._deepMerge(structuredClone(defaultState), saved);
    } else {
      state = structuredClone(defaultState);
    }
    this._applyTheme();
    return state;
  },

  get() {
    return state;
  },

  set(path, value) {
    const keys = path.split('.');
    let obj = state;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    const oldValue = obj[keys[keys.length - 1]];
    obj[keys[keys.length - 1]] = value;

    this._notify(path, value, oldValue);
    this.persist();
    return state;
  },

  getVal(path) {
    const keys = path.split('.');
    let obj = state;
    for (const key of keys) {
      if (obj == null) return undefined;
      obj = obj[key];
    }
    return obj;
  },

  subscribe(path, callback) {
    if (!listeners.has(path)) listeners.set(path, new Set());
    listeners.get(path).add(callback);
    return () => listeners.get(path)?.delete(callback);
  },

  _notify(path, newValue, oldValue) {
    for (const [listenerPath, callbacks] of listeners) {
      if (path.startsWith(listenerPath) || listenerPath.startsWith(path)) {
        for (const cb of callbacks) {
          try { cb(newValue, oldValue, path); } catch (e) { console.error('State listener error:', e); }
        }
      }
    }
  },

  persist() {
    const toSave = {
      currentUser: state.currentUser,
      theme: state.theme,
      accent: state.accent,
      density: state.density,
      reducedMotion: state.reducedMotion,
      sidebarCollapsed: state.sidebarCollapsed,
      savedPosts: state.savedPosts,
      savedCollections: state.savedCollections,
      drafts: state.drafts,
      archivedPosts: state.archivedPosts,
      followRelationships: state.followRelationships,
      blockedUsers: state.blockedUsers,
      mutedUsers: state.mutedUsers,
      closeFriends: state.closeFriends,
      settings: state.settings,
      searchHistory: state.searchHistory,
    };
    Storage.set('youtupost_state', toSave);
  },

  _applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    document.documentElement.setAttribute('data-accent', state.accent);
    document.documentElement.setAttribute('data-density', state.density);
    if (state.reducedMotion) {
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    }
  },

  _deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        this._deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  },

  reset() {
    state = structuredClone(defaultState);
    this.persist();
    listeners.forEach(callbacks => {
      for (const cb of callbacks) {
        try { cb(state); } catch (e) { console.error(e); }
      }
    });
  },
};
