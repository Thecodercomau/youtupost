/* ==========================================
   YOUTUPOST — Post Component
   Post Card with All Interactions
   ========================================== */

import { Icons } from '../icons.js';
import { AppState } from '../state.js';
import { PostService, ProfileService, AuthService } from '../services/services.js';
import { timeAgo, formatNumber, escapeHtml, generateAvatarSVG, delegate } from '../utils.js';
import { showToast } from './toast.js';
import { openShareSheet } from './modal.js';
import { openCommentsModal } from './comments.js';

export function createPostCard(post, options = {}) {
  const { showFull = false, isSingle = false } = options;
  const users = AppState.getVal('users') || [];
  const user = users.find(u => u.id === post.userId);
  const currentUserId = AppState.getVal('currentUser');

  if (!user) return document.createElement('div');

  const card = document.createElement('article');
  card.className = 'post-card';
  card.dataset.postId = post.id;

  const isLiked = post.likes?.includes(currentUserId);
  const isSaved = (AppState.getVal('savedPosts') || []).includes(post.id);

  const textHtml = post.text ? formatPostText(post.text) : '';

  // Build carousel if multiple images
  let mediaHtml = '';
  if (post.media?.length > 0) {
    if (post.media.length === 1) {
      mediaHtml = `
        <div class="post-media" data-media-index="0">
          <img src="${post.media[0]}" alt="Post media" loading="lazy" style="width:100%;aspect-ratio:1;object-fit:cover;">
          <div class="heart-animation" style="pointer-events:none;">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
        </div>
      `;
    } else {
      mediaHtml = `
        <div class="post-media carousel" data-carousel="true" data-current="0">
          <div class="carousel-track" style="display:flex;transition:transform 0.3s ease;">
            ${post.media.map((m, i) => `<img src="${m}" alt="Post media ${i + 1}" loading="lazy" style="min-width:100%;aspect-ratio:1;object-fit:cover;">`).join('')}
          </div>
          <button class="carousel-btn prev" style="display:none;">${Icons.chevronLeft}</button>
          <button class="carousel-btn next" style="display:none;">${Icons.chevronRight}</button>
          <div class="media-indicators">
            ${post.media.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}"></div>`).join('')}
          </div>
          <div class="heart-animation" style="pointer-events:none;">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
        </div>
      `;
    }
  }

  // Repost indicator
  let repostHtml = '';
  if (post.type === 'repost' && post.repostOf) {
    repostHtml = `<div style="padding:0 var(--space-4);padding-top:var(--space-2);font-size:var(--text-xs);color:var(--text-tertiary);display:flex;align-items:center;gap:var(--space-1);">${Icons.repost} Reposted</div>`;
  }

  card.innerHTML = `
    ${repostHtml}
    <div class="post-header">
      <div class="avatar md" data-user-id="${user.id}" style="cursor:pointer;">
        <img src="${user.avatar || generateAvatarSVG(user.displayName)}" alt="${user.displayName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
      </div>
      <div class="post-user-info" style="flex:1;min-width:0;">
        <div class="post-user-name" data-user-id="${user.id}" style="cursor:pointer;">
          ${escapeHtml(user.displayName)}
          ${user.isVerified ? `<span style="color:var(--badge-${user.badges?.[0] || 'verified'});display:inline-flex;"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>` : ''}
        </div>
        <div class="post-meta">
          <span class="post-username">@${user.username}</span>
          <span>·</span>
          <span>${timeAgo(post.createdAt)}</span>
          ${post.location ? `<span>· ${escapeHtml(post.location)}</span>` : ''}
        </div>
      </div>
      <button class="post-menu-btn" data-action="menu" aria-label="Post options">${Icons.moreVertical}</button>
    </div>

    ${textHtml ? `<div class="post-body"><div class="post-text">${textHtml}</div></div>` : ''}

    ${mediaHtml}

    <div class="post-actions" style="padding:var(--space-2) var(--space-4);">
      <button class="post-action-btn ${isLiked ? 'liked' : ''}" data-action="like" aria-label="Like">
        ${isLiked ? Icons.heartFilled : Icons.heart}
        <span>${formatNumber(post.likes?.length || 0)}</span>
      </button>
      <button class="post-action-btn" data-action="comment" aria-label="Comment">
        ${Icons.comment}
        <span>${formatNumber(post.comments?.length || 0)}</span>
      </button>
      <button class="post-action-btn" data-action="repost" aria-label="Repost">
        ${Icons.repost}
        <span>${formatNumber(post.reposts?.length || 0)}</span>
      </button>
      <button class="post-action-btn" data-action="share" aria-label="Share">
        ${Icons.share}
      </button>
      <button class="post-action-btn bookmark-btn ${isSaved ? 'saved' : ''}" data-action="save" aria-label="Save">
        ${isSaved ? Icons.bookmark : Icons.bookmark}
        ${isSaved ? `<style>.post-action-btn.saved svg{fill:var(--color-primary-light);stroke:var(--color-primary-light);}</style>` : ''}
      </button>
    </div>

    ${post.views ? `<div class="post-footer" style="padding:0 var(--space-4) var(--space-3);"><span style="font-size:var(--text-xs);color:var(--text-tertiary);">${formatNumber(post.views)} views</span></div>` : ''}
  `;

  // Event delegation for post actions
  card.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) {
      // Check if clicking on user avatar/name
      const userEl = e.target.closest('[data-user-id]');
      if (userEl) {
        const uid = userEl.dataset.userId;
        const u = users.find(u => u.id === uid);
        if (u) Router.navigate(`/profile/${u.username}`);
      }
      return;
    }

    const action = actionBtn.dataset.action;

    switch (action) {
      case 'like':
        handleLike(post, actionBtn);
        break;
      case 'comment':
        openCommentsModal(post.id);
        break;
      case 'repost':
        handleRepost(post);
        break;
      case 'share':
        openShareSheet(post.id);
        break;
      case 'save':
        handleSave(post, actionBtn);
        break;
      case 'menu':
        e.stopPropagation();
        showPostMenu(post, actionBtn);
        break;
    }
  });

  // Double-click to like
  let lastTap = 0;
  const mediaEl = card.querySelector('.post-media');
  if (mediaEl) {
    mediaEl.addEventListener('click', (e) => {
      const now = Date.now();
      if (now - lastTap < 300) {
        handleDoubleTapLike(post, mediaEl, card);
      }
      lastTap = now;
    });
  }

  // Carousel navigation
  if (post.media?.length > 1) {
    setupCarousel(card, post);
  }

  return card;
}

function handleLike(post, btn) {
  PostService.likePost(post.id);
  const isLiked = post.likes?.includes(AppState.getVal('currentUser'));
  btn.classList.toggle('liked');
  btn.innerHTML = `${isLiked ? Icons.heartFilled : Icons.heart}<span>${formatNumber(post.likes?.length || 0)}</span>`;
  if (isLiked) {
    btn.classList.add('like-bounce');
    setTimeout(() => btn.classList.remove('like-bounce'), 400);
  }
}

function handleDoubleTapLike(post, mediaEl, card) {
  const currentUserId = AppState.getVal('currentUser');
  if (!post.likes?.includes(currentUserId)) {
    PostService.likePost(post.id);
    const likeBtn = card.querySelector('[data-action="like"]');
    if (likeBtn) {
      likeBtn.classList.add('liked');
      likeBtn.innerHTML = `${Icons.heartFilled}<span>${formatNumber(post.likes?.length || 0)}</span>`;
    }
  }

  // Show heart animation
  const heart = mediaEl.querySelector('.heart-animation');
  if (heart) {
    heart.classList.remove('animate');
    void heart.offsetWidth;
    heart.classList.add('animate');
    setTimeout(() => heart.classList.remove('animate'), 800);
  }
}

function handleRepost(post) {
  PostService.repostPost(post.id);
  showToast('Reposted!', 'success');
}

function handleSave(post, btn) {
  const saved = PostService.savePost(post.id);
  btn.classList.toggle('saved');
  showToast(saved ? 'Saved' : 'Removed from saved', 'success');
}

function showPostMenu(post, btn) {
  const currentUserId = AppState.getVal('currentUser');
  const isOwn = post.userId === currentUserId;

  // Remove existing menus
  document.querySelectorAll('.context-menu').forEach(m => m.remove());

  const menu = document.createElement('div');
  menu.className = 'context-menu visible';
  menu.style.cssText = 'position:fixed;min-width:200px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);z-index:500;padding:var(--space-2);';

  const items = isOwn ? [
    { label: 'Edit', icon: 'edit', action: 'edit' },
    { label: 'Archive', icon: 'archive', action: 'archive' },
    { label: 'Delete', icon: 'trash', action: 'delete', danger: true },
  ] : [
    { label: 'Save', icon: 'bookmark', action: 'save' },
    { label: 'Copy Link', icon: 'copy', action: 'copy' },
    { label: 'Not Interested', icon: 'eyeOff', action: 'not-interested' },
    { label: 'Mute', icon: 'mute', action: 'mute' },
    { label: 'Report', icon: 'flag', action: 'report', danger: true },
  ];

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = `context-menu-item ${item.danger ? 'danger' : ''}`;
    el.style.cssText = 'display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);font-size:var(--text-sm);color:var(--text-secondary);cursor:pointer;transition:all 150ms;';
    el.innerHTML = `<span style="width:18px;height:18px;">${Icons[item.icon]}</span>${item.label}`;
    el.addEventListener('click', () => {
      menu.remove();
      switch (item.action) {
        case 'delete':
          PostService.deletePost(post.id);
          document.querySelector(`[data-post-id="${post.id}"]`)?.remove();
          showToast('Post deleted', 'success');
          break;
        case 'archive':
          PostService.archivePost(post.id);
          document.querySelector(`[data-post-id="${post.id}"]`)?.remove();
          showToast('Post archived', 'success');
          break;
        case 'save':
          PostService.savePost(post.id);
          showToast('Saved', 'success');
          break;
        case 'copy':
          navigator.clipboard?.writeText(window.location.href);
          showToast('Link copied', 'success');
          break;
        case 'mute':
          ProfileService.muteUser(post.userId);
          showToast('User muted', 'info');
          break;
        case 'report':
          showToast('Report submitted', 'info');
          break;
      }
    });
    menu.appendChild(el);
  });

  document.body.appendChild(menu);

  const rect = btn.getBoundingClientRect();
  menu.style.top = rect.bottom + 4 + 'px';
  menu.style.right = (window.innerWidth - rect.right) + 'px';

  setTimeout(() => {
    document.addEventListener('click', function close(e) {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', close);
      }
    });
  }, 0);
}

function setupCarousel(card, post) {
  const container = card.querySelector('.carousel');
  if (!container) return;
  const track = container.querySelector('.carousel-track');
  const indicators = container.querySelectorAll('.dot');
  const prevBtn = container.querySelector('.prev');
  const nextBtn = container.querySelector('.next');
  let current = 0;
  const total = post.media.length;

  function update() {
    track.style.transform = `translateX(-${current * 100}%)`;
    indicators.forEach((d, i) => d.classList.toggle('active', i === current));
    if (prevBtn) prevBtn.style.display = current > 0 ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = current < total - 1 ? 'flex' : 'none';
  }

  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); current = Math.max(0, current - 1); update(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); current = Math.min(total - 1, current + 1); update(); });

  // Touch swipe
  let startX = 0;
  container.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  container.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && current < total - 1) current++;
      else if (diff < 0 && current > 0) current--;
      update();
    }
  }, { passive: true });

  // Show arrows on hover
  container.addEventListener('mouseenter', () => { update(); });
  container.addEventListener('mouseleave', () => {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
  });

  container.style.overflow = 'hidden';
}

function formatPostText(text) {
  if (!text) return '';
  return escapeHtml(text)
    .replace(/#(\w+)/g, '<span class="hashtag" data-hashtag="$1">#$1</span>')
    .replace(/@(\w+)/g, '<span class="mention" data-username="$1">@$1</span>');
}

/* Import Router here to avoid circular dependency */
import { Router } from '../router.js';
