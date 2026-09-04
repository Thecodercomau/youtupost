/* ==========================================
   YOUTUPOST — Sidebar Component
   Desktop Navigation Sidebar
   ========================================== */

import { Icons } from '../icons.js';
import { AuthService } from '../services/services.js';
import { AppState } from '../state.js';
import { Router } from '../router.js';
import { generateAvatarSVG } from '../utils.js';

const navItems = [
  { id: 'home', label: 'Home', icon: 'home', hash: '#/home' },
  { id: 'explore', label: 'Explore', icon: 'explore', hash: '#/explore' },
  { id: 'search-page', label: 'Search', icon: 'search', hash: '#/search' },
  { id: 'shorts', label: 'Shorts', icon: 'shorts', hash: '#/shorts' },
  { id: 'messages', label: 'Messages', icon: 'message', hash: '#/messages', hasBadge: true },
  { id: 'notifications', label: 'Notifications', icon: 'bell', hash: '#/notifications', hasBadge: true },
  { id: 'communities', label: 'Communities', icon: 'users', hash: '#/communities' },
  { id: 'saved', label: 'Saved', icon: 'bookmark', hash: '#/saved' },
];

const bottomItems = [
  { id: 'ai', label: 'Youtupost AI', icon: 'sparkles', hash: '#/ai' },
  { id: 'settings', label: 'Settings', icon: 'settings', hash: '#/settings' },
];

function getLocalUser() {
  const userId = AppState.getVal('currentUser');
  if (!userId) return null;
  const users = AppState.getVal('users') || [];
  return users.find(u => u.id === userId) || null;
}

export function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const user = getLocalUser();
  const collapsed = AppState.getVal('sidebarCollapsed');

  sidebar.className = `sidebar ${collapsed ? 'collapsed' : ''}`;

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <div class="logo-icon"><svg viewBox="0 0 24 24" fill="white" width="22" height="22"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
      <span class="logo-text">Youtupost</span>
    </div>

    <nav class="sidebar-nav">
      ${navItems.map(item => `
        <div class="sidebar-nav-item" data-page="${item.id}" data-hash="${item.hash}" role="button" tabindex="0" aria-label="${item.label}">
          <span class="nav-icon">${Icons[item.icon]}</span>
          <span class="nav-label">${item.label}</span>
          ${item.hasBadge ? `<span class="badge" data-badge="${item.id}" style="display:none;">0</span>` : ''}
        </div>
      `).join('')}

      <div class="sidebar-divider"></div>

      <div class="sidebar-nav-item" data-page="create" data-hash="#/create" role="button" tabindex="0" aria-label="Create Post">
        <span class="nav-icon">${Icons.plus}</span>
        <span class="nav-label">Create</span>
      </div>

      <div class="sidebar-divider"></div>

      ${bottomItems.map(item => `
        <div class="sidebar-nav-item" data-page="${item.id}" data-hash="${item.hash}" role="button" tabindex="0" aria-label="${item.label}">
          <span class="nav-icon">${Icons[item.icon]}</span>
          <span class="nav-label">${item.label}</span>
        </div>
      `).join('')}
    </nav>

    <div class="sidebar-user" id="sidebar-user-card" role="button" tabindex="0" aria-label="User menu">
      <div class="user-avatar">
        <img src="${user?.avatar || generateAvatarSVG(user?.displayName || 'User')}" alt="${user?.displayName || 'User'}">
        <div class="online-dot"></div>
      </div>
      <div class="user-info">
        <div class="user-name">${user?.displayName || 'User'}</div>
        <div class="user-username">@${user?.username || 'user'}</div>
      </div>
    </div>
  `;

  // Navigation click handlers
  sidebar.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const hash = item.dataset.hash;
      if (hash) Router.navigate(hash.slice(1));
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  // User card click -> profile
  const userCard = document.getElementById('sidebar-user-card');
  if (userCard) {
    userCard.addEventListener('click', () => {
      const u = getLocalUser();
      if (u) Router.navigate(`/profile/${u.username}`);
    });
  }

  // Update badges
  updateSidebarBadges();
}

export function updateSidebarBadges() {
  const messagesBadge = document.querySelector('[data-badge="messages"]');
  const notifBadge = document.querySelector('[data-badge="notifications"]');

  if (messagesBadge) {
    const conversations = AppState.getVal('conversations') || [];
    const userId = AppState.getVal('currentUser');
    let unread = 0;
    conversations.forEach(c => {
      if (c.lastMessage && c.lastMessage.userId !== userId && !c.lastMessage.read) unread++;
    });
    messagesBadge.textContent = unread;
    messagesBadge.style.display = unread > 0 ? '' : 'none';
  }

  if (notifBadge) {
    const notifs = AppState.getVal('notifications') || [];
    const unread = notifs.filter(n => !n.read).length;
    notifBadge.textContent = unread;
    notifBadge.style.display = unread > 0 ? '' : 'none';
  }
}
