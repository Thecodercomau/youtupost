/* ==========================================
   YOUTUPOST — Create Page
   ========================================== */

import { AppState } from '../state.js';
import { PostService, DraftService, AuthService } from '../services/services.js';
import { Icons } from '../icons.js';
import { generatePostImage } from '../utils.js';
import { toast } from '../components/toast.js';
import { Router } from '../router.js';

let createData = {
  type: 'post',
  text: '',
  media: [],
  hashtags: [],
  location: '',
};

export function renderCreatePage() {
  const page = document.getElementById('page-create');
  if (!page) return;

  createData = { type: 'post', text: '', media: [], hashtags: [], location: '' };

  page.innerHTML = `
    <div style="max-width:600px;margin:0 auto;padding:var(--space-6) var(--space-4);">
      <h2 style="font-size:var(--text-2xl);font-weight:700;margin-bottom:var(--space-6);text-align:center;">Create Post</h2>

      <div id="create-type-tabs" style="display:flex;gap:var(--space-2);margin-bottom:var(--space-5);overflow-x:auto;">
        ${['post', 'story', 'short', 'text', 'poll'].map(type => `
          <button class="chip ${type === createData.type ? 'selected' : ''}" data-type="${type}" style="cursor:pointer;">${type.charAt(0).toUpperCase() + type.slice(1)}</button>
        `).join('')}
      </div>

      <div id="create-content">
        <div class="upload-area" id="upload-area" style="margin-bottom:var(--space-4);">
          <div style="width:48px;height:48px;margin-bottom:var(--space-4);color:var(--text-tertiary);">${Icons.image}</div>
          <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--space-2);">Drag & drop or click to upload</div>
          <div style="font-size:var(--text-xs);color:var(--text-tertiary);">Images, videos (max 10 items)</div>
          <input type="file" id="file-input" accept="image/*,video/*" multiple style="display:none;">
        </div>

        <div id="media-preview" style="display:none;margin-bottom:var(--space-4);"></div>

        <div style="margin-bottom:var(--space-4);">
          <textarea id="post-text" placeholder="What's on your mind?" style="width:100%;min-height:120px;padding:var(--space-3) var(--space-4);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);font-size:var(--text-base);resize:vertical;line-height:1.5;"></textarea>
          <div id="char-counter" style="text-align:right;font-size:var(--text-xs);color:var(--text-tertiary);margin-top:var(--space-1);">0/2200</div>
        </div>

        <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-5);flex-wrap:wrap;">
          <button class="btn btn-ghost btn-sm" id="add-location">${Icons.mapPin} Location</button>
          <button class="btn btn-ghost btn-sm" id="add-hashtag">${Icons.hash} Hashtag</button>
          <button class="btn btn-ghost btn-sm" id="add-mention">${Icons.atSign} Mention</button>
        </div>

        <div style="display:flex;gap:var(--space-3);">
          <button class="btn btn-secondary" style="flex:1;" id="save-draft-btn">Save Draft</button>
          <button class="btn btn-primary" style="flex:2;" id="publish-btn">Publish</button>
        </div>
      </div>
    </div>
  `;

  // Type tabs
  document.querySelectorAll('#create-type-tabs .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      createData.type = chip.dataset.type;
      document.querySelectorAll('#create-type-tabs .chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });

  // Upload area
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');

  uploadArea?.addEventListener('click', () => fileInput?.click());
  uploadArea?.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
  uploadArea?.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
  uploadArea?.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });
  fileInput?.addEventListener('change', (e) => handleFiles(e.target.files));

  // Text input
  const textInput = document.getElementById('post-text');
  const charCounter = document.getElementById('char-counter');
  textInput?.addEventListener('input', () => {
    createData.text = textInput.value;
    const len = textInput.value.length;
    charCounter.textContent = `${len}/2200`;
    charCounter.style.color = len > 2200 ? 'var(--color-error)' : len > 2000 ? 'var(--color-warning)' : 'var(--text-tertiary)';
  });

  // Publish
  document.getElementById('publish-btn')?.addEventListener('click', () => {
    if (!createData.text.trim() && createData.media.length === 0) {
      toast.warning('Add some content to your post');
      return;
    }
    const hashtags = createData.text.match(/#(\w+)/g)?.map(h => h.slice(1)) || [];
    PostService.createPost({
      text: createData.text,
      media: createData.media.length > 0 ? createData.media : [generatePostImage(Math.floor(Math.random() * 100))],
      type: createData.media.length > 1 ? 'carousel' : 'image',
      hashtags,
      location: createData.location,
    });
    toast.success('Post published!');
    Router.navigate('/home');
  });

  // Save draft
  document.getElementById('save-draft-btn')?.addEventListener('click', () => {
    DraftService.save({ text: createData.text, media: createData.media, type: createData.type });
    toast.success('Draft saved');
  });

  // Location
  document.getElementById('add-location')?.addEventListener('click', () => {
    const loc = prompt('Add location:');
    if (loc) { createData.location = loc; toast.success('Location added'); }
  });

  // Hashtag
  document.getElementById('add-hashtag')?.addEventListener('click', () => {
    const tag = prompt('Add hashtag (without #):');
    if (tag) {
      createData.text += ` #${tag}`;
      textInput.value = createData.text;
      textInput.dispatchEvent(new Event('input'));
    }
  });
}

function handleFiles(files) {
  const preview = document.getElementById('media-preview');
  if (!preview) return;

  Array.from(files).slice(0, 10).forEach(file => {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        createData.media.push(e.target.result);
        renderMediaPreview();
      };
      reader.readAsDataURL(file);
    }
  });
}

function renderMediaPreview() {
  const preview = document.getElementById('media-preview');
  if (!preview) return;

  if (createData.media.length === 0) {
    preview.style.display = 'none';
    return;
  }

  preview.style.display = 'grid';
  preview.style.gridTemplateColumns = createData.media.length === 1 ? '1fr' : 'repeat(2, 1fr)';
  preview.style.gap = 'var(--space-2)';
  preview.style.marginBottom = 'var(--space-4)';

  preview.innerHTML = createData.media.map((src, i) => `
    <div style="position:relative;aspect-ratio:1;border-radius:var(--radius-md);overflow:hidden;">
      <img src="${src}" alt="" style="width:100%;height:100%;object-fit:cover;">
      <button onclick="this.parentElement.remove()" style="position:absolute;top:var(--space-1);right:var(--space-1);width:24px;height:24px;border-radius:50%;background:rgba(0,0,0,0.6);color:white;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;font-size:14px;">✕</button>
    </div>
  `).join('');
}
