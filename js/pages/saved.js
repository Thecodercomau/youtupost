/* ==========================================
   YOUTUPOST — Saved Page
   ========================================== */

import { AppState } from '../state.js';
import { SavedService } from '../services/services.js';
import { Icons } from '../icons.js';
import { createPostCard } from '../components/post.js';
import { toast } from '../components/toast.js';

let activeCollection = null;

export function renderSavedPage() {
  const page = document.getElementById('page-saved');
  if (!page) return;

  const collections = SavedService.getCollections();
  const savedPosts = SavedService.getSavedPosts();

  page.innerHTML = `
    <div style="max-width:var(--content-max-width);margin:0 auto;padding:0 var(--space-4);">
      <div style="padding:var(--space-4) 0 var(--space-2);display:flex;align-items:center;justify-content:space-between;">
        <h2 style="font-size:var(--text-2xl);font-weight:700;">Saved</h2>
        <button class="btn btn-secondary btn-sm" id="new-collection-btn">${Icons.plus} Collection</button>
      </div>

      <div style="display:flex;gap:var(--space-2);overflow-x:auto;padding-bottom:var(--space-4);margin-bottom:var(--space-4);scrollbar-width:none;">
        <div class="chip ${!activeCollection ? 'selected' : ''}" data-collection="all" style="cursor:pointer;white-space:nowrap;">All Saved</div>
        ${collections.map(c => `
          <div class="chip ${activeCollection === c.id ? 'selected' : ''}" data-collection="${c.id}" style="cursor:pointer;white-space:nowrap;">
            ${c.name}
            <span style="opacity:0.6;">${c.posts.length}</span>
          </div>
        `).join('')}
      </div>

      <div id="saved-posts-container"></div>
    </div>
  `;

  document.querySelectorAll('.chip[data-collection]').forEach(chip => {
    chip.addEventListener('click', () => {
      activeCollection = chip.dataset.collection === 'all' ? null : chip.dataset.collection;
      document.querySelectorAll('.chip[data-collection]').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      renderSavedPosts();
    });
  });

  document.getElementById('new-collection-btn')?.addEventListener('click', () => {
    const name = prompt('Collection name:');
    if (name?.trim()) {
      SavedService.createCollection(name.trim());
      toast.success('Collection created');
      renderSavedPage();
    }
  });

  renderSavedPosts();
}

function renderSavedPosts() {
  const container = document.getElementById('saved-posts-container');
  if (!container) return;

  let posts;
  if (activeCollection) {
    const collections = SavedService.getCollections();
    const collection = collections.find(c => c.id === activeCollection);
    const allPosts = AppState.getVal('posts') || [];
    posts = (collection?.posts || []).map(id => allPosts.find(p => p.id === id)).filter(Boolean);
  } else {
    posts = SavedService.getSavedPosts();
  }

  container.innerHTML = '';

  if (posts.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:var(--space-16);">
        <div class="empty-icon">${Icons.bookmark}</div>
        <h3>No saved posts</h3>
        <p>Save posts to see them here.</p>
      </div>
    `;
    return;
  }

  posts.forEach(post => {
    container.appendChild(createPostCard(post));
  });
}
