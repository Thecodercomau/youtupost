/* ==========================================
   YOUTUPOST — Modal System
   Reusable Modal Component
   ========================================== */

import { lockScroll, unlockScroll } from '../utils.js';
import { Icons } from '../icons.js';

let activeModals = [];

export function openModal(content, options = {}) {
  const { className = '', onClose, size = 'md', closeOnBackdrop = true } = options;

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:400;display:flex;align-items:center;justify-content:center;';

  const container = document.createElement('div');
  container.className = `modal-container ${className}`;

  const sizeMap = { sm: '420px', md: '600px', lg: '900px', xl: '1100px', full: '95vw' };
  container.style.maxWidth = sizeMap[size] || sizeMap.md;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.innerHTML = Icons.close;
  closeBtn.style.cssText = 'position:absolute;top:12px;right:12px;width:36px;height:36px;border-radius:50%;background:var(--bg-elevated);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--text-secondary);z-index:10;cursor:pointer;transition:all 150ms;';
  closeBtn.addEventListener('click', () => closeModal(backdrop));

  if (typeof content === 'string') {
    container.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    container.appendChild(content);
  }
  container.appendChild(closeBtn);

  backdrop.appendChild(container);
  document.body.appendChild(backdrop);
  lockScroll();

  requestAnimationFrame(() => {
    backdrop.style.opacity = '1';
    backdrop.style.transition = 'opacity 0.3s ease';
  });

  if (closeOnBackdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal(backdrop);
    });
  }

  const modalObj = { backdrop, container, close: () => closeModal(backdrop) };
  activeModals.push(modalObj);

  // ESC key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal(backdrop);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  return modalObj;
}

function closeModal(backdrop) {
  if (!backdrop || !backdrop.parentNode) return;
  backdrop.style.opacity = '0';
  setTimeout(() => {
    backdrop.remove();
    activeModals = activeModals.filter(m => m.backdrop !== backdrop);
    if (activeModals.length === 0) unlockScroll();
  }, 300);
}

export function closeAllModals() {
  [...activeModals].forEach(m => m.close());
}

export function openFollowersModal(users, title = 'Followers') {
  const content = document.createElement('div');
  content.style.cssText = 'max-width:480px;max-height:600px;display:flex;flex-direction:column;';

  const header = document.createElement('div');
  header.style.cssText = 'padding:var(--space-4) var(--space-5);border-bottom:1px solid var(--border-light);';
  header.innerHTML = `<h3 style="font-size:var(--text-lg);font-weight:700;">${title}</h3>`;
  content.appendChild(header);

  const list = document.createElement('div');
  list.style.cssText = 'flex:1;overflow-y:auto;padding:var(--space-2);';

  if (users.length === 0) {
    list.innerHTML = `<div class="empty-state" style="padding:var(--space-10);"><p style="color:var(--text-secondary);font-size:var(--text-sm);">No ${title.toLowerCase()} yet</p></div>`;
  } else {
    users.forEach(user => {
      const item = document.createElement('div');
      item.className = 'follower-item';
      item.style.cssText = 'display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-md);cursor:pointer;';
      item.innerHTML = `
        <div class="avatar md">
          <img src="${user.avatar || ''}" alt="${user.displayName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
        </div>
        <div class="follower-info" style="flex:1;">
          <div class="follower-name" style="font-size:var(--text-sm);font-weight:600;display:flex;align-items:center;gap:4px;">
            ${user.displayName}
            ${user.isVerified ? '<span style="color:var(--badge-verified);display:flex;"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>' : ''}
          </div>
          <div class="follower-username" style="font-size:var(--text-xs);color:var(--text-secondary);">@${user.username}</div>
        </div>
      `;
      list.appendChild(item);
    });
  }

  content.appendChild(list);
  return openModal(content, { className: 'followers-modal', size: 'sm' });
}

export function openShareSheet(postId) {
  const content = document.createElement('div');
  content.style.cssText = 'padding:var(--space-6);';

  const handle = document.createElement('div');
  handle.style.cssText = 'width:36px;height:4px;background:var(--border-strong);border-radius:2px;margin:0 auto var(--space-5);';
  content.appendChild(handle);

  const title = document.createElement('h3');
  title.style.cssText = 'font-size:var(--text-lg);font-weight:700;text-align:center;margin-bottom:var(--space-5);';
  title.textContent = 'Share';
  content.appendChild(title);

  const options = document.createElement('div');
  options.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-4);';

  const shareItems = [
    { label: 'Copy Link', icon: 'copy' },
    { label: 'Repost', icon: 'repost' },
    { label: 'Send to', icon: 'send' },
    { label: 'Bookmark', icon: 'bookmark' },
  ];

  shareItems.forEach(item => {
    const el = document.createElement('div');
    el.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:var(--space-2);cursor:pointer;';
    el.innerHTML = `
      <div style="width:52px;height:52px;border-radius:50%;background:var(--surface);display:flex;align-items:center;justify-content:center;transition:background 150ms;">
        <span style="color:var(--text-primary);">${Icons[item.icon]}</span>
      </div>
      <span style="font-size:var(--text-xs);color:var(--text-secondary);">${item.label}</span>
    `;
    el.addEventListener('click', () => {
      if (item.label === 'Copy Link') {
        navigator.clipboard?.writeText(window.location.href);
      }
      closeModal(content.closest('.modal-backdrop'));
    });
    options.appendChild(el);
  });

  content.appendChild(options);
  return openModal(content, { size: 'sm' });
}
