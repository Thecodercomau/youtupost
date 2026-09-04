/* ==========================================
   YOUTUPOST — Utilities
   Helper Functions
   ========================================== */

/* === DOM Helpers === */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

export function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') el.className = value;
    else if (key === 'innerHTML') el.innerHTML = value;
    else if (key === 'textContent') el.textContent = value;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
    else el.setAttribute(key, value);
  }
  for (const child of children) {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if (child instanceof Node) el.appendChild(child);
  }
  return el;
}

/* === Formatting === */
export function timeAgo(dateStr) {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function formatCount(num) {
  return num.toLocaleString();
}

/* === Sanitization === */
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function sanitizeText(text) {
  return escapeHtml(text);
}

/* === ID Generation === */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/* === Date Helpers === */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });
}

export function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

/* === Debounce / Throttle === */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function throttle(fn, ms = 100) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}

/* === URL Helpers === */
export function getHash() {
  return window.location.hash.slice(1) || '/home';
}

export function setHash(path) {
  window.location.hash = path;
}

/* === Avatar Generator === */
const avatarColors = [
  '#6C5CE7', '#00CEFF', '#00D68F', '#FFAA00', '#FF6B9D',
  '#74B9FF', '#A29BFE', '#55EFC4', '#FD79A8', '#FDCB6E',
];

export function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function generateAvatarSVG(name, size = 40) {
  const color = getAvatarColor(name);
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${color}" rx="${size / 2}"/><text x="50%" y="50%" text-anchor="middle" dy=".35em" fill="white" font-size="${size * 0.4}" font-family="system-ui,sans-serif" font-weight="600">${initials}</text></svg>`)}`;
}

/* === Image Generation (for demo posts) === */
export function generatePostImage(seed, width = 600, height = 600) {
  const colors = [
    ['#6C5CE7', '#00CEFF'], ['#FF6B9D', '#FFAA00'], ['#00D68F', '#74B9FF'],
    ['#A29BFE', '#FD79A8'], ['#55EFC4', '#00CEFF'], ['#FDCB6E', '#E17055'],
    ['#74B9FF', '#6C5CE7'], ['#FD79A8', '#A29BFE'],
  ];
  const pair = colors[seed % colors.length];
  const angle = (seed * 37) % 360;
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle})"><stop offset="0%" stop-color="${pair[0]}"/><stop offset="100%" stop-color="${pair[1]}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#g)"/><circle cx="${width * 0.3}" cy="${height * 0.4}" r="${width * 0.15}" fill="rgba(255,255,255,0.15)"/><circle cx="${width * 0.7}" cy="${height * 0.6}" r="${width * 0.1}" fill="rgba(255,255,255,0.1)"/><rect x="${width * 0.2}" y="${height * 0.65}" width="${width * 0.6}" height="${height * 0.08}" rx="8" fill="rgba(255,255,255,0.12)"/></svg>`)}`;
}

/* === Matched Items === */
export function fuzzyMatch(text, query) {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

/* === Event Delegation === */
export function delegate(parent, eventType, selector, handler) {
  if (typeof parent === 'string') parent = document.querySelector(parent);
  if (!parent) return;
  parent.addEventListener(eventType, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      handler(e, target);
    }
  });
}

/* === Intersection Observer Helper === */
export function observeIntersection(elements, callback, options = {}) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      callback(entry);
    });
  }, { threshold: 0.5, ...options });

  if (Array.isArray(elements)) {
    elements.forEach(el => el && observer.observe(el));
  } else if (elements) {
    observer.observe(elements);
  }

  return observer;
}

/* === Click Outside === */
export function clickOutside(element, callback) {
  const handler = (e) => {
    if (!element.contains(e.target)) {
      callback(e);
      document.removeEventListener('click', handler);
    }
  };
  setTimeout(() => document.addEventListener('click', handler), 0);
}

/* === Prevent Background Scroll === */
export function lockScroll() {
  document.body.classList.add('modal-open');
}

export function unlockScroll() {
  document.body.classList.remove('modal-open');
}
