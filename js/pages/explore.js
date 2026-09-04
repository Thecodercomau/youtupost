/* ==========================================
   YOUTUPOST — Explore Page
   Discovery Grid, Categories, Trending
   ========================================== */

import { AppState } from '../state.js';
import { PostService } from '../services/services.js';
import { $, formatNumber, generatePostImage } from '../utils.js';
import { Icons } from '../icons.js';
import { Router } from '../router.js';

const categories = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'photography', label: 'Photography', icon: 'camera' },
  { id: 'technology', label: 'Technology', icon: 'cpu' },
  { id: 'music', label: 'Music', icon: 'music' },
  { id: 'gaming', label: 'Gaming', icon: 'shorts' },
  { id: 'programming', label: 'Programming', icon: 'code' },
  { id: 'art', label: 'Art', icon: 'palette' },
  { id: 'design', label: 'Design', icon: 'sliders' },
  { id: 'sports', label: 'Sports', icon: 'zap' },
  { id: 'science', label: 'Science', icon: 'compass' },
  { id: 'travel', label: 'Travel', icon: 'globe' },
  { id: 'fashion', label: 'Fashion', icon: 'sparkles' },
];

let selectedCategory = 'all';

export function renderExplorePage() {
  const page = document.getElementById('page-explore');
  if (!page) return;

  const trending = AppState.getVal('communities') || [];
  const posts = PostService.getExplorePosts(selectedCategory === 'all' ? null : selectedCategory);

  page.innerHTML = `
    <div class="content-wrapper" style="max-width:var(--content-max-width);margin:0 auto;padding:0 var(--space-4);">
      <div style="padding:var(--space-4) 0 var(--space-2);">
        <h2 style="font-size:var(--text-2xl);font-weight:700;">Explore</h2>
      </div>

      <div id="search-area" style="margin-bottom:var(--space-4);">
        <div class="search-input-wrapper">
          <span class="search-icon-left" style="position:absolute;left:var(--space-4);top:50%;transform:translateY(-50%);color:var(--text-tertiary);display:flex;">${Icons.search}</span>
          <input type="text" class="search-input" placeholder="Search people, posts, hashtags..." id="explore-search" style="width:100%;height:44px;padding:0 var(--space-4) 0 44px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-full);color:var(--text-primary);font-size:var(--text-sm);">
        </div>
      </div>

      <div id="explore-categories" style="display:flex;gap:var(--space-2);overflow-x:auto;padding-bottom:var(--space-4);margin-bottom:var(--space-4);scrollbar-width:none;"></div>

      <div id="trending-section" style="margin-bottom:var(--space-6);"></div>

      <div id="explore-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;"></div>
    </div>
  `;

  // Categories
  const catContainer = $('#explore-categories', page);
  categories.forEach(cat => {
    const chip = document.createElement('div');
    chip.className = `chip ${cat.id === selectedCategory ? 'selected' : ''}`;
    chip.innerHTML = `${Icons[cat.icon] ? `<span style="width:14px;height:14px;display:flex;">${Icons[cat.icon]}</span>` : ''}${cat.label}`;
    chip.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:var(--space-2) var(--space-3);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-full);font-size:var(--text-xs);color:var(--text-secondary);cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all 150ms;';
    chip.addEventListener('click', () => {
      selectedCategory = cat.id;
      catContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      renderExploreGrid();
    });
    catContainer.appendChild(chip);
  });

  // Trending
  const trendingSection = $('#trending-section', page);
  const trendingData = [
    { name: '#AI', count: '12.5K posts', category: 'Technology' },
    { name: 'Web3 Development', count: '8.9K posts', category: 'Tech' },
    { name: '#DigitalArt', count: '23.4K posts', category: 'Art' },
    { name: 'Sustainable Fashion', count: '15.6K posts', category: 'Fashion' },
    { name: '#IndieMusic', count: '9.8K posts', category: 'Music' },
  ];

  trendingSection.innerHTML = `
    <h3 style="font-size:var(--text-base);font-weight:700;margin-bottom:var(--space-3);">Trending</h3>
    <div style="display:flex;gap:var(--space-3);overflow-x:auto;padding-bottom:var(--space-2);scrollbar-width:none;">
      ${trendingData.map(t => `
        <div style="min-width:160px;padding:var(--space-3) var(--space-4);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);cursor:pointer;flex-shrink:0;transition:all 150ms;" class="hover-lift">
          <div style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);margin-bottom:2px;">${t.name}</div>
          <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${t.count}</div>
        </div>
      `).join('')}
    </div>
  `;

  renderExploreGrid();
}

function renderExploreGrid() {
  const container = document.getElementById('explore-grid');
  if (!container) return;

  const posts = PostService.getExplorePosts(selectedCategory === 'all' ? null : selectedCategory);
  container.innerHTML = '';

  if (posts.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;" class="empty-state">
        <div class="empty-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
        <h3>No results found</h3>
        <p>Try a different category</p>
      </div>
    `;
    return;
  }

  posts.forEach(post => {
    if (!post.media?.length) return;
    const item = document.createElement('div');
    item.style.cssText = 'position:relative;aspect-ratio:1;overflow:hidden;cursor:pointer;background:var(--surface);';
    item.innerHTML = `
      <img src="${post.media[0]}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;transition:transform 0.3s ease;">
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0);transition:background 0.3s ease;display:flex;align-items:center;justify-content:center;opacity:0;" class="explore-overlay">
        <div style="display:flex;gap:var(--space-4);color:white;font-size:var(--text-sm);font-weight:600;">
          <span style="display:flex;align-items:center;gap:4px;">${Icons.heart} ${formatNumber(post.likes?.length || 0)}</span>
          <span style="display:flex;align-items:center;gap:4px;">${Icons.comment} ${formatNumber(post.comments?.length || 0)}</span>
        </div>
      </div>
      ${post.type === 'carousel' ? `<div style="position:absolute;top:var(--space-2);right:var(--space-2);color:white;">${Icons.image}</div>` : ''}
    `;

    item.addEventListener('mouseenter', () => {
      item.querySelector('img').style.transform = 'scale(1.05)';
      item.querySelector('.explore-overlay').style.opacity = '1';
      item.querySelector('.explore-overlay').style.background = 'rgba(0,0,0,0.3)';
    });
    item.addEventListener('mouseleave', () => {
      item.querySelector('img').style.transform = 'scale(1)';
      item.querySelector('.explore-overlay').style.opacity = '0';
      item.querySelector('.explore-overlay').style.background = 'rgba(0,0,0,0)';
    });

    item.addEventListener('click', () => {
      // Could open post detail modal
    });

    container.appendChild(item);
  });
}
