/* ==========================================
   YOUTUPOST — Shorts Page
   Fullscreen Vertical Video Feed
   ========================================== */

import { AppState } from '../state.js';
import { Icons } from '../icons.js';
import { generateAvatarSVG, formatNumber, generatePostImage } from '../utils.js';
import { Router } from '../router.js';

let activeShortIndex = 0;
let observer = null;

export function renderShortsPage() {
  const page = document.getElementById('page-shorts');
  if (!page) return;

  const shorts = AppState.getVal('shorts') || [];
  const users = AppState.getVal('users') || [];
  const currentUserId = AppState.getVal('currentUser');

  page.innerHTML = `
    <div id="shorts-container" style="height:calc(100vh - var(--topbar-height));overflow-y:scroll;scroll-snap-type:y mandatory;">
      ${shorts.map((short, index) => {
        const user = users.find(u => u.id === short.userId);
        const isLiked = short.likes?.includes(currentUserId);
        return `
        <div class="short-slide" data-index="${index}" data-short-id="${short.id}" style="height:calc(100vh - var(--topbar-height));scroll-snap-align:start;position:relative;display:flex;align-items:center;justify-content:center;background:#000;">
          <div style="width:100%;height:100%;position:relative;">
            <img src="${generatePostImage(parseInt(short.id.replace('sh','')) + 100, 400, 700)}" alt="" style="width:100%;height:100%;object-fit:cover;">

            <div style="position:absolute;inset:0;background:linear-gradient(transparent 50%,rgba(0,0,0,0.7));"></div>

            <div style="position:absolute;bottom:80px;left:var(--space-4);right:80px;z-index:2;">
              <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
                <div class="avatar sm" style="width:36px;height:36px;flex-shrink:0;">
                  <img src="${user?.avatar || generateAvatarSVG(user?.displayName || '')}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
                </div>
                <span style="color:white;font-size:var(--text-sm);font-weight:600;">@${user?.username || ''}</span>
                <button class="btn-follow" style="background:white;color:#000;font-size:var(--text-xs);min-height:28px;padding:var(--space-1) var(--space-3);border-radius:var(--radius-sm);border:none;cursor:pointer;font-weight:600;">Follow</button>
              </div>
              <p style="color:white;font-size:var(--text-sm);line-height:1.5;margin-bottom:var(--space-2);">${short.caption || ''}</p>
              ${short.music ? `
              <div style="display:flex;align-items:center;gap:var(--space-2);color:white;font-size:var(--text-xs);">
                <span style="display:flex;">${Icons.music}</span>
                <span>${short.music.name} · ${short.music.artist}</span>
              </div>
              ` : ''}
            </div>

            <div style="position:absolute;right:var(--space-3);bottom:100px;display:flex;flex-direction:column;align-items:center;gap:var(--space-5);z-index:2;">
              <button class="short-action-btn" data-action="like" style="display:flex;flex-direction:column;align-items:center;gap:2px;background:none;border:none;cursor:pointer;">
                <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;color:white;">${isLiked ? Icons.heartFilled : Icons.heart}</div>
                <span style="color:white;font-size:10px;">${formatNumber(short.likes?.length || 0)}</span>
              </button>
              <button class="short-action-btn" data-action="comment" style="display:flex;flex-direction:column;align-items:center;gap:2px;background:none;border:none;cursor:pointer;">
                <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;color:white;">${Icons.comment}</div>
                <span style="color:white;font-size:10px;">${formatNumber(short.comments || 0)}</span>
              </button>
              <button class="short-action-btn" data-action="repost" style="display:flex;flex-direction:column;align-items:center;gap:2px;background:none;border:none;cursor:pointer;">
                <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;color:white;">${Icons.repost}</div>
                <span style="color:white;font-size:10px;">${formatNumber(short.reposts || 0)}</span>
              </button>
              <button class="short-action-btn" data-action="share" style="display:flex;flex-direction:column;align-items:center;gap:2px;background:none;border:none;cursor:pointer;">
                <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;color:white;">${Icons.share}</div>
                <span style="color:white;font-size:10px;">${formatNumber(short.views || 0)}</span>
              </button>
            </div>
          </div>
        </div>
        `;
      }).join('')}
    </div>
  `;

  // Setup IntersectionObserver for autoplay
  const container = document.getElementById('shorts-container');
  if (!container) return;

  const slides = container.querySelectorAll('.short-slide');

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activeShortIndex = parseInt(entry.target.dataset.index);
      }
    });
  }, { root: container, threshold: 0.6 });

  slides.forEach(slide => observer.observe(slide));

  // Keyboard navigation
  const keyHandler = (e) => {
    if (document.getElementById('page-shorts')?.classList.contains('active')) {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const next = Math.min(activeShortIndex + 1, slides.length - 1);
        slides[next]?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const prev = Math.max(activeShortIndex - 1, 0);
        slides[prev]?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  document.addEventListener('keydown', keyHandler);
}

export function cleanupShortsPage() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
