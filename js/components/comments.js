/* ==========================================
   YOUTUPOST — Comments Component
   Comments Modal
   ========================================== */

import { Icons } from '../icons.js';
import { AppState } from '../state.js';
import { PostService, AuthService } from '../services/services.js';
import { timeAgo, escapeHtml, generateAvatarSVG } from '../utils.js';
import { openModal } from './modal.js';

export function openCommentsModal(postId) {
  const post = PostService.getPost(postId);
  if (!post) return;

  const users = AppState.getVal('users') || [];
  const postUser = users.find(u => u.id === post.userId);
  const currentUserId = AppState.getVal('currentUser');
  const currentUser = users.find(u => u.id === currentUserId);

  const content = document.createElement('div');
  content.style.cssText = 'max-width:500px;display:flex;flex-direction:column;max-height:80vh;';

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'padding:var(--space-4) var(--space-5);border-bottom:1px solid var(--border-light);text-align:center;';
  header.innerHTML = `<h3 style="font-size:var(--text-base);font-weight:700;">Comments</h3>`;
  content.appendChild(header);

  // Comments list
  const list = document.createElement('div');
  list.style.cssText = 'flex:1;overflow-y:auto;padding:var(--space-3) var(--space-4);max-height:400px;min-height:200px;';

  const comments = post.comments || [];

  if (comments.length === 0) {
    list.innerHTML = `
      <div class="empty-state" style="padding:var(--space-10);">
        <div class="empty-icon">${Icons.comment}</div>
        <h3>No comments yet</h3>
        <p>Start the conversation.</p>
      </div>
    `;
  } else {
    comments.filter(c => !c.parentId).forEach(comment => {
      const commentEl = createCommentElement(comment, post, users);
      list.appendChild(commentEl);

      // Add replies
      const replies = comments.filter(c => c.parentId === comment.id);
      replies.forEach(reply => {
        const replyEl = createCommentElement(reply, post, users, true);
        list.appendChild(replyEl);
      });
    });
  }

  content.appendChild(list);

  // Comment input
  const inputArea = document.createElement('div');
  inputArea.style.cssText = 'padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-light);display:flex;align-items:center;gap:var(--space-3);';

  inputArea.innerHTML = `
    <div class="avatar sm">
      <img src="${currentUser?.avatar || generateAvatarSVG(currentUser?.displayName || 'User')}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
    </div>
    <input type="text" placeholder="Add a comment..." style="flex:1;height:36px;padding:0 var(--space-3);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-full);color:var(--text-primary);font-size:var(--text-sm);" id="comment-input">
    <button style="color:var(--color-primary);font-weight:600;font-size:var(--text-sm);min-width:60px;" id="comment-submit">Post</button>
  `;

  content.appendChild(inputArea);

  const modal = openModal(content, { size: 'sm', className: 'comments-modal' });

  // Submit comment
  const input = inputArea.querySelector('#comment-input');
  const submit = inputArea.querySelector('#comment-submit');

  const submitComment = () => {
    const text = input.value.trim();
    if (!text) return;
    PostService.addComment(postId, text);
    input.value = '';

    // Re-render comments
    const updatedPost = PostService.getPost(postId);
    if (updatedPost) {
      list.innerHTML = '';
      const updatedComments = updatedPost.comments || [];
      updatedComments.filter(c => !c.parentId).forEach(comment => {
        list.appendChild(createCommentElement(comment, updatedPost, users));
        updatedComments.filter(c => c.parentId === comment.id).forEach(reply => {
          list.appendChild(createCommentElement(reply, updatedPost, users, true));
        });
      });
      list.scrollTop = list.scrollHeight;
    }
  };

  submit.addEventListener('click', submitComment);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitComment();
  });

  setTimeout(() => input.focus(), 100);
}

function createCommentElement(comment, post, users, isReply = false) {
  const user = users.find(u => u.id === comment.userId);
  const currentUserId = AppState.getVal('currentUser');

  const el = document.createElement('div');
  el.style.cssText = `display:flex;gap:var(--space-3);padding:var(--space-3) 0;${isReply ? 'margin-left:var(--space-10);' : ''}`;

  el.innerHTML = `
    <div class="avatar sm" style="flex-shrink:0;">
      <img src="${user?.avatar || generateAvatarSVG(user?.displayName || 'User')}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
    </div>
    <div style="flex:1;min-width:0;">
      <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:2px;">
        <span style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);">${escapeHtml(user?.displayName || 'User')}</span>
        <span style="font-size:var(--text-xs);color:var(--text-tertiary);">${timeAgo(comment.createdAt)}</span>
      </div>
      <p style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.5;">${escapeHtml(comment.text)}</p>
      <div style="display:flex;align-items:center;gap:var(--space-3);margin-top:var(--space-1);">
        <button style="font-size:var(--text-xs);color:var(--text-tertiary);display:flex;align-items:center;gap:4px;cursor:pointer;background:none;border:none;padding:2px 4px;border-radius:4px;transition:color 150ms;" class="comment-like-btn">
          ${Icons.heart}
          <span>${comment.likes?.length || 0}</span>
        </button>
        ${!isReply ? `<button style="font-size:var(--text-xs);color:var(--text-tertiary);cursor:pointer;background:none;border:none;padding:2px 4px;border-radius:4px;" class="reply-btn">Reply</button>` : ''}
        ${comment.userId === currentUserId ? `<button style="font-size:var(--text-xs);color:var(--text-tertiary);cursor:pointer;background:none;border:none;padding:2px 4px;border-radius:4px;" class="delete-comment-btn">Delete</button>` : ''}
      </div>
    </div>
  `;

  // Like comment
  const likeBtn = el.querySelector('.comment-like-btn');
  likeBtn?.addEventListener('click', () => {
    const posts = AppState.getVal('posts') || [];
    const p = posts.find(p => p.id === post.id);
    if (p) {
      const c = p.comments.find(c => c.id === comment.id);
      if (c) {
        if (!c.likes) c.likes = [];
        if (c.likes.includes(currentUserId)) {
          c.likes = c.likes.filter(id => id !== currentUserId);
        } else {
          c.likes.push(currentUserId);
        }
        AppState.set('posts', posts);
        likeBtn.querySelector('span').textContent = c.likes.length;
      }
    }
  });

  return el;
}
