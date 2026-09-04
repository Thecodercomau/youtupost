/* ==========================================
   YOUTUPOST — Story Component
   Story Viewer & Story Bar
   ========================================== */

import { Icons } from '../icons.js';
import { AppState } from '../state.js';
import { timeAgo, generateAvatarSVG } from '../utils.js';
import { lockScroll, unlockScroll } from '../utils.js';

export function renderStoriesBar(container) {
  const stories = AppState.getVal('stories') || [];
  const users = AppState.getVal('users') || [];
  const currentUserId = AppState.getVal('currentUser');

  // Group stories by user
  const userStories = {};
  stories.forEach(s => {
    if (!userStories[s.userId]) userStories[s.userId] = [];
    userStories[s.userId].push(s);
  });

  container.innerHTML = '';

  // Create Story button
  const createItem = document.createElement('div');
  createItem.className = 'story-item create-story';
  createItem.innerHTML = `
    <div class="story-avatar" style="background:var(--surface);">
      <div class="avatar-inner" style="display:flex;align-items:center;justify-content:center;font-size:24px;color:var(--text-secondary);">+</div>
      <div class="add-icon">+</div>
    </div>
    <span class="story-username">Your Story</span>
  `;
  createItem.addEventListener('click', () => {
    // Open create story
  });
  container.appendChild(createItem);

  // Story items
  Object.entries(userStories).forEach(([userId, userStoryList]) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const allSeen = userStoryList.every(s => s.seen);

    const item = document.createElement('div');
    item.className = `story-item ${allSeen ? 'seen' : ''}`;
    item.innerHTML = `
      <div class="story-avatar">
        <div class="avatar-inner">
          <img src="${user.avatar || generateAvatarSVG(user.displayName)}" alt="${user.displayName}">
        </div>
      </div>
      <span class="story-username">${user.username}</span>
    `;

    item.addEventListener('click', () => {
      openStoryViewer(userId);
    });

    container.appendChild(item);
  });
}

function openStoryViewer(startUserId) {
  const stories = AppState.getVal('stories') || [];
  const users = AppState.getVal('users') || [];

  // Get all unique user IDs with stories, in order
  const storyUserIds = [];
  const seen = new Set();
  stories.forEach(s => {
    if (!seen.has(s.userId)) {
      storyUserIds.push(s.userId);
      seen.add(s.userId);
    }
  });

  let currentIndex = storyUserIds.indexOf(startUserId);
  if (currentIndex === -1) currentIndex = 0;

  let currentStoryIndex = 0;
  let progressTimer = null;
  let isPaused = false;
  let progressInterval = null;

  const viewer = document.createElement('div');
  viewer.className = 'story-viewer visible';
  viewer.innerHTML = `
    <div class="story-viewer-content">
      <div class="story-viewer-progress" id="story-progress"></div>
      <div class="story-viewer-header" id="story-header"></div>
      <div id="story-image-container" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"></div>
      <div class="story-viewer-actions">
        <input class="story-reply-input" placeholder="Reply to story..." id="story-reply">
        <button style="color:white;width:40px;height:40px;display:flex;align-items:center;justify-content:center;" id="story-like-btn">${Icons.heart}</button>
        <button style="color:white;width:40px;height:40px;display:flex;align-items:center;justify-content:center;" id="story-share-btn">${Icons.share}</button>
      </div>
    </div>
  `;

  document.body.appendChild(viewer);
  lockScroll();

  const closeBtn = document.createElement('button');
  closeBtn.className = 'story-viewer-close';
  closeBtn.innerHTML = Icons.close;
  closeBtn.style.cssText = 'position:absolute;top:var(--space-3);right:var(--space-3);width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,0.4);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;color:white;z-index:10;border:none;cursor:pointer;';
  viewer.querySelector('.story-viewer-content').appendChild(closeBtn);

  function render() {
    const userId = storyUserIds[currentIndex];
    const userStories = stories.filter(s => s.userId === userId);
    const user = users.find(u => u.id === userId);

    if (!user || currentStoryIndex >= userStories.length) {
      // Move to next user or close
      if (currentIndex < storyUserIds.length - 1) {
        currentIndex++;
        currentStoryIndex = 0;
        render();
      } else {
        close();
      }
      return;
    }

    const story = userStories[currentStoryIndex];

    // Mark as seen
    story.seen = true;

    // Progress bars
    const progressContainer = viewer.querySelector('#story-progress');
    progressContainer.innerHTML = userStories.map((s, i) => `
      <div class="story-progress-bar ${i < currentStoryIndex ? 'completed' : ''}">
        <div class="fill" style="${i === currentStoryIndex ? 'width:0%' : (i < currentStoryIndex ? 'width:100%' : 'width:0%')}"></div>
      </div>
    `).join('');

    // Header
    const header = viewer.querySelector('#story-header');
    header.innerHTML = `
      <div class="story-user-info">
        <img src="${user.avatar || generateAvatarSVG(user.displayName)}" alt="${user.displayName}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
        <span class="story-user-name">${user.displayName}</span>
        <span class="story-time">${timeAgo(story.createdAt)}</span>
      </div>
    `;

    // Image
    const imgContainer = viewer.querySelector('#story-image-container');
    imgContainer.innerHTML = `<img src="${story.items[0]?.src || ''}" alt="Story" style="width:100%;height:100%;object-fit:cover;">`;

    // Progress animation
    clearInterval(progressInterval);
    const fill = progressContainer.querySelectorAll('.fill')[currentStoryIndex];
    if (fill) {
      let progress = 0;
      const duration = story.items[0]?.duration || 5000;
      const step = 100 / (duration / 50);
      progressInterval = setInterval(() => {
        if (!isPaused) {
          progress += step;
          fill.style.width = `${Math.min(progress, 100)}%`;
          if (progress >= 100) {
            clearInterval(progressInterval);
            currentStoryIndex++;
            render();
          }
        }
      }, 50);
    }
  }

  function close() {
    clearInterval(progressInterval);
    viewer.classList.remove('visible');
    setTimeout(() => {
      viewer.remove();
      unlockScroll();
    }, 300);
  }

  // Navigation
  viewer.addEventListener('click', (e) => {
    if (e.target.closest('.story-viewer-close') || e.target.closest('#story-reply') || e.target.closest('#story-like-btn') || e.target.closest('#story-share-btn')) return;

    const rect = viewer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) {
      // Previous
      if (currentStoryIndex > 0) {
        currentStoryIndex--;
      } else if (currentIndex > 0) {
        currentIndex--;
        currentStoryIndex = 0;
      }
    } else {
      // Next
      currentStoryIndex++;
    }
    render();
  });

  // Pause on hold
  viewer.addEventListener('mousedown', () => { isPaused = true; });
  viewer.addEventListener('mouseup', () => { isPaused = false; });
  viewer.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
  viewer.addEventListener('touchend', () => { isPaused = false; }, { passive: true });

  closeBtn.addEventListener('click', close);

  // Keyboard
  const keyHandler = (e) => {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', keyHandler); }
    if (e.key === 'ArrowRight') { currentStoryIndex++; render(); }
    if (e.key === 'ArrowLeft') { if (currentStoryIndex > 0) currentStoryIndex--; else if (currentIndex > 0) { currentIndex--; currentStoryIndex = 0; } render(); }
  };
  document.addEventListener('keydown', keyHandler);

  render();
}
