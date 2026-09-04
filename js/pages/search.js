/* ==========================================
   YOUTUPOST — Search Page
   ========================================== */

import { AppState } from '../state.js';
import { SearchService } from '../services/services.js';
import { Icons } from '../icons.js';
import { formatNumber, generateAvatarSVG, debounce, escapeHtml } from '../utils.js';
import { Router } from '../router.js';

let activeSearchTab = 'top';

export function renderSearchPage() {
  const page = document.getElementById('page-search-page');
  if (!page) return;

  const history = SearchService.getHistory();

  page.innerHTML = `
    <div style="max-width:var(--content-max-width);margin:0 auto;padding:0 var(--space-4);">
      <div style="padding:var(--space-4) 0;">
        <div class="search-input-wrapper" style="margin-bottom:var(--space-4);">
          <span class="search-icon-left" style="position:absolute;left:var(--space-4);top:50%;transform:translateY(-50%);color:var(--text-tertiary);display:flex;">${Icons.search}</span>
          <input type="text" class="search-input" id="search-main-input" placeholder="Search people, posts, hashtags..." style="width:100%;height:44px;padding:0 var(--space-4) 0 44px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-full);color:var(--text-primary);font-size:var(--text-sm);">
        </div>

        <div id="search-history" style="margin-bottom:var(--space-4);">
          ${history.length > 0 ? `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3);">
              <span style="font-size:var(--text-sm);font-weight:600;">Recent</span>
              <button id="clear-history" style="font-size:var(--text-xs);color:var(--color-primary);background:none;border:none;cursor:pointer;">Clear all</button>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);">
              ${history.map(h => `
                <div class="chip" data-query="${escapeHtml(h)}" style="cursor:pointer;">${escapeHtml(h)}</div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div id="search-tabs" class="tabs" style="margin-bottom:var(--space-4);display:none;"></div>
        <div id="search-results"></div>
      </div>
    </div>
  `;

  const input = document.getElementById('search-main-input');
  const resultsDiv = document.getElementById('search-results');

  const doSearch = debounce((query) => {
    if (!query || query.length < 2) {
      resultsDiv.innerHTML = '';
      document.getElementById('search-tabs').style.display = 'none';
      return;
    }

    SearchService.addToHistory(query);
    const results = SearchService.search(query);

    document.getElementById('search-tabs').style.display = 'flex';
    renderSearchTabs(results);

    const tabs = ['top', 'accounts', 'posts', 'hashtags', 'communities'];
    const tabsContainer = document.getElementById('search-tabs');
    tabsContainer.innerHTML = '';
    tabs.forEach(tab => {
      const el = document.createElement('div');
      el.className = `tab-item ${tab === activeSearchTab ? 'active' : ''}`;
      el.textContent = tab.charAt(0).toUpperCase() + tab.slice(1);
      el.addEventListener('click', () => {
        activeSearchTab = tab;
        tabsContainer.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
        renderSearchResults(results);
      });
      tabsContainer.appendChild(el);
    });

    renderSearchResults(results);
  }, 300);

  input?.addEventListener('input', () => doSearch(input.value));
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      SearchService.addToHistory(input.value.trim());
      doSearch(input.value.trim());
    }
  });

  // History chip clicks
  document.querySelectorAll('.chip[data-query]').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.query;
      doSearch(chip.dataset.query);
    });
  });

  document.getElementById('clear-history')?.addEventListener('click', () => {
    SearchService.clearHistory();
    document.getElementById('search-history').innerHTML = '';
  });
}

function renderSearchTabs(results) {
  const tabsContainer = document.getElementById('search-tabs');
  if (!tabsContainer) return;
}

function renderSearchResults(results) {
  const container = document.getElementById('search-results');
  if (!container) return;
  container.innerHTML = '';

  const users = AppState.getVal('users') || [];

  if (activeSearchTab === 'top' || activeSearchTab === 'accounts') {
    if (results.users.length > 0) {
      const section = document.createElement('div');
      section.style.marginBottom = 'var(--space-6)';
      section.innerHTML = `<h3 style="font-size:var(--text-sm);font-weight:600;margin-bottom:var(--space-3);">Accounts</h3>`;
      results.users.forEach(user => {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-md);cursor:pointer;transition:background 150ms;';
        item.innerHTML = `
          <div class="avatar md"><img src="${user.avatar || generateAvatarSVG(user.displayName)}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:var(--text-sm);font-weight:600;display:flex;align-items:center;gap:4px;">${escapeHtml(user.displayName)} ${user.isVerified ? '<span style="color:var(--badge-verified);display:flex;"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>' : ''}</div>
            <div style="font-size:var(--text-xs);color:var(--text-secondary);">@${user.username}</div>
          </div>
        `;
        item.addEventListener('click', () => Router.navigate(`/profile/${user.username}`));
        section.appendChild(item);
      });
      container.appendChild(section);
    }
  }

  if (activeSearchTab === 'top' || activeSearchTab === 'posts') {
    if (results.posts.length > 0) {
      const section = document.createElement('div');
      section.style.marginBottom = 'var(--space-6)';
      section.innerHTML = `<h3 style="font-size:var(--text-sm);font-weight:600;margin-bottom:var(--space-3);">Posts</h3>`;
      results.posts.forEach(post => {
        const user = users.find(u => u.id === post.userId);
        const item = document.createElement('div');
        item.style.cssText = 'padding:var(--space-3);border:1px solid var(--border);border-radius:var(--radius-md);margin-bottom:var(--space-2);cursor:pointer;';
        item.innerHTML = `
          <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-2);">
            <div class="avatar xs"><img src="${user?.avatar || generateAvatarSVG(user?.displayName || '')}" alt="" style="width:100%;height:100%;border-radius:50%;"></div>
            <span style="font-size:var(--text-xs);font-weight:600;">@${user?.username || ''}</span>
          </div>
          <p style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.4;">${escapeHtml(post.text?.slice(0, 150) || '')}</p>
        `;
        section.appendChild(item);
      });
      container.appendChild(section);
    }
  }

  if (activeSearchTab === 'hashtags') {
    if (results.hashtags.length > 0) {
      const section = document.createElement('div');
      section.innerHTML = `<h3 style="font-size:var(--text-sm);font-weight:600;margin-bottom:var(--space-3);">Hashtags</h3>`;
      results.hashtags.forEach(tag => {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-md);cursor:pointer;';
        item.innerHTML = `
          <div style="width:40px;height:40px;border-radius:var(--radius-md);background:var(--surface);display:flex;align-items:center;justify-content:center;color:var(--color-primary);">${Icons.hash}</div>
          <div><div style="font-size:var(--text-sm);font-weight:600;">#${escapeHtml(tag)}</div></div>
        `;
        section.appendChild(item);
      });
      container.appendChild(section);
    }
  }

  if (activeSearchTab === 'communities') {
    if (results.communities.length > 0) {
      const section = document.createElement('div');
      section.innerHTML = `<h3 style="font-size:var(--text-sm);font-weight:600;margin-bottom:var(--space-3);">Communities</h3>`;
      results.communities.forEach(c => {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-md);cursor:pointer;';
        item.innerHTML = `
          <div style="width:40px;height:40px;border-radius:var(--radius-md);background:var(--surface);display:flex;align-items:center;justify-content:center;font-size:20px;">${c.icon || '👥'}</div>
          <div><div style="font-size:var(--text-sm);font-weight:600;">${escapeHtml(c.name)}</div><div style="font-size:var(--text-xs);color:var(--text-tertiary);">${c.members?.length || 0} members</div></div>
        `;
        section.appendChild(item);
      });
      container.appendChild(section);
    }
  }

  if (container.children.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:var(--space-10);">
        <div class="empty-icon">${Icons.search}</div>
        <h3>No results found</h3>
        <p>Try different keywords</p>
      </div>
    `;
  }
}
