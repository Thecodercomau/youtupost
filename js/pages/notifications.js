/* ==========================================
   YOUTUPOST — Notifications Page
   ========================================== */

import { AppState } from '../state.js';
import { NotificationService } from '../services/services.js';
import { Icons } from '../icons.js';
import { timeAgo, generateAvatarSVG } from '../utils.js';

let activeFilter = 'all';

const filters = ['All', 'Mentions', 'Comments', 'Followers', 'Messages', 'System'];

export function renderNotificationsPage() {
  const page = document.getElementById('page-notifications');
  if (!page) return;

  const notifs = NotificationService.getAll();
  const users = AppState.getVal('users') || [];

  page.innerHTML = `
    <div style="max-width:var(--content-max-width);margin:0 auto;padding:0 var(--space-4);">
      <div style="padding:var(--space-4) 0 var(--space-2);display:flex;align-items:center;justify-content:space-between;">
        <h2 style="font-size:var(--text-2xl);font-weight:700;">Notifications</h2>
        <button id="mark-all-read" style="font-size:var(--text-sm);color:var(--color-primary);background:none;border:none;cursor:pointer;font-weight:600;">Mark all read</button>
      </div>

      <div id="notif-filters" class="tabs" style="margin-bottom:var(--space-4);"></div>

      <div id="notif-list" class="stagger-children"></div>
    </div>
  `;

  // Filters
  const filtersContainer = document.getElementById('notif-filters');
  filters.forEach(f => {
    const tab = document.createElement('div');
    tab.className = `tab-item ${f.toLowerCase() === activeFilter ? 'active' : ''}`;
    tab.textContent = f;
    tab.addEventListener('click', () => {
      activeFilter = f.toLowerCase();
      filtersContainer.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderNotifications();
    });
    filtersContainer.appendChild(tab);
  });

  // Mark all read
  document.getElementById('mark-all-read')?.addEventListener('click', () => {
    NotificationService.markAllAsRead();
    renderNotifications();
  });

  renderNotifications();
}

function renderNotifications() {
  const container = document.getElementById('notif-list');
  if (!container) return;

  let notifs = NotificationService.getAll();
  const users = AppState.getVal('users') || [];

  if (activeFilter !== 'all') {
    notifs = notifs.filter(n => {
      if (activeFilter === 'mentions') return n.type === 'mention';
      if (activeFilter === 'comments') return n.type === 'comment';
      if (activeFilter === 'followers') return n.type === 'follow';
      if (activeFilter === 'messages') return n.type === 'message';
      if (activeFilter === 'system') return n.type === 'system';
      return true;
    });
  }

  container.innerHTML = '';

  if (notifs.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:var(--space-16);">
        <div class="empty-icon">${Icons.bell}</div>
        <h3>No notifications</h3>
        <p>When someone interacts with your posts, you'll see it here.</p>
      </div>
    `;
    return;
  }

  notifs.forEach(notif => {
    const user = notif.userId ? users.find(u => u.id === notif.userId) : null;
    const el = document.createElement('div');
    el.className = `notification-item ${!notif.read ? 'unread' : ''}`;
    el.style.cssText = 'display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);border-radius:var(--radius-md);transition:background 150ms;cursor:pointer;';

    const typeIcons = {
      like: Icons.heart,
      comment: Icons.comment,
      follow: Icons.user,
      repost: Icons.repost,
      mention: Icons.atSign,
      message: Icons.message,
      story: Icons.image,
      system: Icons.info,
    };

    const typeColors = {
      like: '#FF6B9D',
      comment: '#00CEFF',
      follow: '#6C5CE7',
      repost: '#00D68F',
      mention: '#FFAA00',
      message: '#0095FF',
      story: '#A29BFE',
      system: '#969AAA',
    };

    const typeMessages = {
      like: `<strong>${user?.displayName || 'Someone'}</strong> liked your post`,
      comment: `<strong>${user?.displayName || 'Someone'}</strong> commented on your post`,
      follow: `<strong>${user?.displayName || 'Someone'}</strong> started following you`,
      repost: `<strong>${user?.displayName || 'Someone'}</strong> reposted your post`,
      mention: `<strong>${user?.displayName || 'Someone'}</strong> mentioned you in a post`,
      message: `<strong>${user?.displayName || 'Someone'}</strong> sent you a message`,
      story: `<strong>${user?.displayName || 'Someone'}</strong> shared a story`,
      system: notif.text || 'System notification',
    };

    el.innerHTML = `
      <div style="position:relative;">
        <div class="avatar sm">
          <img src="${user?.avatar || generateAvatarSVG(user?.displayName || 'System')}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
        </div>
        <div style="position:absolute;bottom:-2px;right:-2px;width:20px;height:20px;border-radius:50%;background:${typeColors[notif.type] || '#969AAA'};display:flex;align-items:center;justify-content:center;color:white;">
          <span style="width:12px;height:12px;display:flex;">${typeIcons[notif.type] || Icons.info}</span>
        </div>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.4;">${typeMessages[notif.type]}</div>
        <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:2px;">${timeAgo(notif.createdAt)}</div>
      </div>
      ${!notif.read ? '<div style="width:8px;height:8px;border-radius:50%;background:var(--color-primary);flex-shrink:0;"></div>' : ''}
    `;

    el.addEventListener('click', () => {
      NotificationService.markAsRead(notif.id);
      el.classList.remove('unread');
      const dot = el.querySelector('[style*="background:var(--color-primary)"]');
      if (dot && dot.style.width === '8px') dot.remove();
    });

    container.appendChild(el);
  });
}
