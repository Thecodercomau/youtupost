/* ==========================================
   YOUTUPOST — Communities Page
   ========================================== */

import { AppState } from '../state.js';
import { CommunityService } from '../services/services.js';
import { Icons } from '../icons.js';
import { formatNumber, generateAvatarSVG, generatePostImage } from '../utils.js';

export function renderCommunitiesPage() {
  const page = document.getElementById('page-communities');
  if (!page) return;

  const communities = CommunityService.getAll();
  const currentUserId = AppState.getVal('currentUser');
  const users = AppState.getVal('users') || [];

  page.innerHTML = `
    <div style="max-width:var(--content-max-width);margin:0 auto;padding:0 var(--space-4);">
      <div style="padding:var(--space-4) 0 var(--space-2);display:flex;align-items:center;justify-content:space-between;">
        <h2 style="font-size:var(--text-2xl);font-weight:700;">Communities</h2>
        <button class="btn btn-primary btn-sm" id="create-community-btn">${Icons.plus} Create</button>
      </div>

      <div id="my-communities" style="margin-bottom:var(--space-6);"></div>
      <h3 style="font-size:var(--text-lg);font-weight:700;margin-bottom:var(--space-4);">Discover</h3>
      <div id="all-communities" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--space-4);"></div>
    </div>
  `;

  // My communities
  const myCommunities = communities.filter(c => c.members?.includes(currentUserId));
  const myContainer = document.getElementById('my-communities');

  if (myCommunities.length > 0) {
    myContainer.innerHTML = `<h3 style="font-size:var(--text-lg);font-weight:700;margin-bottom:var(--space-4);">Your Communities</h3>
      <div style="display:flex;gap:var(--space-3);overflow-x:auto;padding-bottom:var(--space-3);scrollbar-width:none;">
        ${myCommunities.map(c => `
          <div style="min-width:120px;padding:var(--space-3);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);text-align:center;cursor:pointer;flex-shrink:0;">
            <div style="font-size:28px;margin-bottom:var(--space-2);">${c.icon || '👥'}</div>
            <div style="font-size:var(--text-sm);font-weight:600;">${c.name}</div>
          </div>
        `).join('')}
      </div>`;
  }

  // All communities
  const allContainer = document.getElementById('all-communities');
  communities.forEach(community => {
    const isMember = community.members?.includes(currentUserId);
    const memberCount = community.members?.length || 0;

    const card = document.createElement('div');
    card.className = 'community-card';
    card.innerHTML = `
      <div style="height:100px;background:linear-gradient(135deg,var(--color-primary)33,var(--surface));display:flex;align-items:center;justify-content:center;font-size:40px;">
        ${community.icon || '👥'}
      </div>
      <div class="community-info" style="padding:var(--space-4);">
        <div class="community-name" style="font-size:var(--text-base);font-weight:700;margin-bottom:var(--space-1);">${community.name}</div>
        <div class="community-desc" style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--space-3);line-height:1.4;">${community.description || ''}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:var(--text-xs);color:var(--text-tertiary);">${formatNumber(memberCount)} members</span>
          <button class="btn-follow ${isMember ? 'following' : ''}" data-community-id="${community.id}" style="${isMember ? 'background:transparent;color:var(--text-secondary);border:1px solid var(--border);' : ''}">${isMember ? 'Joined' : 'Join'}</button>
        </div>
      </div>
    `;

    card.querySelector('.btn-follow')?.addEventListener('click', (e) => {
      e.stopPropagation();
      CommunityService.join(community.id);
      const nowMember = (AppState.getVal('communities') || []).find(c => c.id === community.id)?.members?.includes(currentUserId);
      const btn = card.querySelector('.btn-follow');
      btn.textContent = nowMember ? 'Joined' : 'Join';
      btn.classList.toggle('following', nowMember);
      if (nowMember) {
        btn.style.background = 'transparent';
        btn.style.color = 'var(--text-secondary)';
        btn.style.border = '1px solid var(--border)';
      } else {
        btn.style.background = '';
        btn.style.color = '';
        btn.style.border = '';
      }
    });

    allContainer.appendChild(card);
  });

  document.getElementById('create-community-btn')?.addEventListener('click', () => {
    const name = prompt('Community name:');
    if (name?.trim()) {
      CommunityService.create({ name: name.trim(), description: '', icon: '👥' });
      renderCommunitiesPage();
    }
  });
}
