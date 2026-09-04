/* ==========================================
   YOUTUPOST — Home Page
   Feed, Stories, Feed Filters
   ========================================== */

import { AppState } from '../state.js';
import { PostService } from '../services/services.js';
import { createPostCard } from '../components/post.js';
import { renderStoriesBar } from '../components/story.js';
import { $ } from '../utils.js';

const feedFilters = [
  { id: 'for-you', label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'friends', label: 'Friends' },
  { id: 'latest', label: 'Latest' },
];

let currentFilter = 'for-you';

export async function renderHomePage() {
  const page = document.getElementById('page-home');
  if (!page) return;

  page.innerHTML = `
    <div class="content-wrapper" style="max-width:var(--content-max-width);margin:0 auto;padding:0 var(--space-4);">
      <div id="stories-container" class="stories-container" style="border-bottom:1px solid var(--border-light);margin-bottom:var(--space-3);"></div>
      <div id="feed-filters" class="tabs" style="margin-bottom:var(--space-4);position:sticky;top:var(--topbar-height);background:var(--bg-primary);z-index:10;"></div>
      <div id="feed-container"></div>
    </div>
  `;

  // Render stories
  const storiesContainer = $('#stories-container', page);
  renderStoriesBar(storiesContainer);

  // Render feed filters
  const filtersContainer = $('#feed-filters', page);
  feedFilters.forEach(filter => {
    const tab = document.createElement('div');
    tab.className = `tab-item ${filter.id === currentFilter ? 'active' : ''}`;
    tab.textContent = filter.label;
    tab.addEventListener('click', () => {
      currentFilter = filter.id;
      filtersContainer.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderFeed();
    });
    filtersContainer.appendChild(tab);
  });

  await renderFeed();
}

async function renderFeed() {
  const container = document.getElementById('feed-container');
  if (!container) return;

  const result = PostService.getFeed(currentFilter);
  const posts = result && typeof result.then === 'function' ? await result : result;
  container.innerHTML = '';

  if (!posts || posts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
        <h3>No posts yet</h3>
        <p>Follow some people to see their posts here!</p>
      </div>
    `;
    return;
  }

  posts.forEach(post => {
    const card = createPostCard(post);
    container.appendChild(card);
  });
}
