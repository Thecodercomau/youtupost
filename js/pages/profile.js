/* ==========================================
   YOUTUPOST — Profile Page
   Profile Header, Grid, Followers, Following
   ========================================== */

import { AppState } from '../state.js';
import { ProfileService, PostService, AuthService } from '../services/services.js';
import { Icons } from '../icons.js';
import { formatNumber, generateAvatarSVG, generatePostImage, escapeHtml } from '../utils.js';
import { openFollowersModal } from '../components/modal.js';
import { createPostCard } from '../components/post.js';
import { Router } from '../router.js';

let activeTab = 'posts';

export function renderProfilePage(params = {}) {
  const page = document.getElementById('page-profile');
  if (!page) return;

  const username = params.username;
  const users = AppState.getVal('users') || [];
  const user = users.find(u => u.username === username);
  const currentUserId = AppState.getVal('currentUser');

  if (!user) {
    page.innerHTML = `<div class="empty-state" style="padding-top:calc(var(--topbar-height) + var(--space-16));"><h3>User not found</h3><p>This account doesn't exist.</p></div>`;
    return;
  }

  const isOwn = user.id === currentUserId;
  const isFollowing = ProfileService.isFollowing(currentUserId, user.id);
  const isConnection = ProfileService.isConnection(currentUserId, user.id);
  const followerCount = ProfileService.getFollowerCount(user.id);
  const followingCount = ProfileService.getFollowingCount(user.id);
  const userPosts = PostService.getUserPosts(user.id);

  const auraColors = { violet: '#6C5CE7', cyan: '#00CEFF', emerald: '#00D68F', solar: '#FFAA00', rose: '#FF6B9D', ice: '#74B9FF' };
  const auraColor = auraColors[user.aura] || auraColors.violet;

  page.innerHTML = `
    <div style="max-width:var(--content-max-width);margin:0 auto;padding:0 var(--space-4);">
      <div style="height:200px;background:linear-gradient(135deg,${auraColor}33,var(--bg-secondary));border-radius:var(--radius-xl);margin-bottom:var(--space-5);position:relative;overflow:hidden;">
        ${user.banner ? `<img src="${user.banner}" alt="" style="width:100%;height:100%;object-fit:cover;">` : ''}
      </div>

      <div style="display:flex;align-items:flex-end;gap:var(--space-5);margin-top:-50px;margin-bottom:var(--space-5);position:relative;z-index:2;">
        <div style="width:120px;height:120px;border-radius:50%;border:4px solid var(--bg-primary);overflow:hidden;background:var(--bg-secondary);box-shadow:0 0 0 3px ${auraColor}44;">
          <img src="${user.avatar || generateAvatarSVG(user.displayName)}" alt="${user.displayName}" style="width:100%;height:100%;object-fit:cover;">
        </div>
        <div style="flex:1;padding-top:50px;">
          <div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;">
            <h1 style="font-size:var(--text-2xl);font-weight:700;">${escapeHtml(user.displayName)}</h1>
            ${user.isVerified ? `<span style="color:var(--badge-${user.badges?.[0] || 'verified'});display:flex;"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>` : ''}
            ${isConnection ? '<span style="font-size:var(--text-xs);color:var(--color-primary);background:rgba(108,92,231,0.1);padding:2px 8px;border-radius:var(--radius-full);">Connection</span>' : ''}
          </div>
          <div style="font-size:var(--text-sm);color:var(--text-secondary);">@${user.username}</div>
        </div>
        <div style="display:flex;gap:var(--space-2);">
          ${isOwn ? `
            <button class="btn btn-secondary" onclick="Router.navigate('/settings')">Edit Profile</button>
          ` : `
            <button class="btn-follow ${isFollowing ? 'following' : ''}" id="profile-follow-btn" data-user-id="${user.id}">${isFollowing ? 'Following' : 'Follow'}</button>
            <button class="btn btn-secondary" style="min-height:36px;padding:var(--space-1) var(--space-3);font-size:var(--text-sm);">Message</button>
          `}
        </div>
      </div>

      ${user.bio ? `<p style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.5;margin-bottom:var(--space-4);white-space:pre-wrap;">${escapeHtml(user.bio)}</p>` : ''}

      <div style="display:flex;flex-wrap:wrap;gap:var(--space-4);font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--space-5);">
        ${user.location ? `<span style="display:flex;align-items:center;gap:4px;"><span style="width:16px;height:16px;">${Icons.mapPin}</span>${escapeHtml(user.location)}</span>` : ''}
        ${user.website ? `<span style="display:flex;align-items:center;gap:4px;color:var(--text-link);"><span style="width:16px;height:16px;">${Icons.link}</span>${escapeHtml(user.website)}</span>` : ''}
        <span style="display:flex;align-items:center;gap:4px;"><span style="width:16px;height:16px;">${Icons.clock}</span>Joined ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
      </div>

      <div style="display:flex;gap:var(--space-6);margin-bottom:var(--space-5);font-size:var(--text-sm);">
        <span><strong style="color:var(--text-primary);">${formatNumber(followingCount)}</strong> <span style="color:var(--text-secondary);">Following</span></span>
        <span><strong style="color:var(--text-primary);">${formatNumber(followerCount)}</strong> <span style="color:var(--text-secondary);">Followers</span></span>
        <span><strong style="color:var(--text-primary);">${formatNumber(userPosts.length)}</strong> <span style="color:var(--text-secondary);">Posts</span></span>
      </div>

      <div id="profile-tabs" class="tabs" style="margin-bottom:var(--space-4);">
        ${['posts', 'shorts', 'reposts', 'tagged'].map(tab => `
          <div class="tab-item ${tab === activeTab ? 'active' : ''}" data-tab="${tab}" style="flex:1;text-align:center;">${tab.charAt(0).toUpperCase() + tab.slice(1)}</div>
        `).join('')}
      </div>

      <div id="profile-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-bottom:var(--space-8);"></div>
    </div>
  `;

  // Tab clicks
  document.querySelectorAll('#profile-tabs .tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      document.querySelectorAll('#profile-tabs .tab-item').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderProfileGrid(userPosts, user);
    });
  });

  // Follow button
  const followBtn = document.getElementById('profile-follow-btn');
  if (followBtn) {
    followBtn.addEventListener('click', () => {
      ProfileService.follow(user.id);
      const nowFollowing = ProfileService.isFollowing(currentUserId, user.id);
      followBtn.textContent = nowFollowing ? 'Following' : 'Follow';
      followBtn.classList.toggle('following', nowFollowing);
    });
  }

  renderProfileGrid(userPosts, user);
}

function renderProfileGrid(posts, user) {
  const container = document.getElementById('profile-grid');
  if (!container) return;
  container.innerHTML = '';

  const filteredPosts = activeTab === 'posts' ? posts :
    activeTab === 'reposts' ? posts.filter(p => p.type === 'repost') :
    [];

  if (filteredPosts.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;" class="empty-state" style="padding:var(--space-10);">
        <div class="empty-icon">${Icons.grid}</div>
        <h3>No ${activeTab} yet</h3>
      </div>
    `;
    return;
  }

  filteredPosts.forEach(post => {
    const item = document.createElement('div');
    item.style.cssText = 'position:relative;aspect-ratio:1;overflow:hidden;cursor:pointer;background:var(--surface);';

    if (post.media?.length > 0) {
      item.innerHTML = `
        <img src="${post.media[0]}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0);transition:background 0.3s;opacity:0;display:flex;align-items:center;justify-content:center;" class="grid-overlay">
          <div style="display:flex;gap:var(--space-4);color:white;font-size:var(--text-sm);font-weight:600;">
            <span style="display:flex;align-items:center;gap:4px;">${Icons.heart} ${formatNumber(post.likes?.length || 0)}</span>
            <span style="display:flex;align-items:center;gap:4px;">${Icons.comment} ${formatNumber(post.comments?.length || 0)}</span>
          </div>
        </div>
        ${post.type === 'carousel' ? `<div style="position:absolute;top:var(--space-2);right:var(--space-2);color:white;">${Icons.image}</div>` : ''}
      `;
    } else {
      item.style.cssText += 'display:flex;align-items:center;justify-content:center;padding:var(--space-4);background:var(--surface);';
      item.innerHTML = `<p style="font-size:var(--text-sm);color:var(--text-secondary);text-align:center;">${escapeHtml(post.text?.slice(0, 80) || '')}</p>`;
    }

    item.addEventListener('mouseenter', () => {
      const overlay = item.querySelector('.grid-overlay');
      if (overlay) { overlay.style.opacity = '1'; overlay.style.background = 'rgba(0,0,0,0.3)'; }
    });
    item.addEventListener('mouseleave', () => {
      const overlay = item.querySelector('.grid-overlay');
      if (overlay) { overlay.style.opacity = '0'; overlay.style.background = 'rgba(0,0,0,0)'; }
    });

    container.appendChild(item);
  });
}

import { Router } from '../router.js';
