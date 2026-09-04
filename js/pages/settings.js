/* ==========================================
   YOUTUPOST — Settings Page
   ========================================== */

import { AppState } from '../state.js';
import { AuthService, ProfileService } from '../services/services.js';
import { Icons } from '../icons.js';
import { toast } from '../components/toast.js';
import { Storage } from '../storage.js';

let activeSection = 'appearance';

const sections = [
  { id: 'appearance', label: 'Appearance', icon: 'palette' },
  { id: 'account', label: 'Account', icon: 'user' },
  { id: 'privacy', label: 'Privacy', icon: 'shield' },
  { id: 'security', label: 'Security', icon: 'lock' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'content', label: 'Content', icon: 'grid' },
  { id: 'accessibility', label: 'Accessibility', icon: 'eye' },
  { id: 'about', label: 'About', icon: 'info' },
];

function getLocalUser() {
  const userId = AppState.getVal('currentUser');
  if (!userId) return null;
  const users = AppState.getVal('users') || [];
  return users.find(u => u.id === userId) || null;
}

export function renderSettingsPage() {
  const page = document.getElementById('page-settings');
  if (!page) return;

  const settings = AppState.getVal('settings') || {};
  const user = getLocalUser();

  page.innerHTML = `
    <div style="max-width:900px;margin:0 auto;padding:var(--space-6) var(--space-4);">
      <h2 style="font-size:var(--text-2xl);font-weight:700;margin-bottom:var(--space-6);">Settings</h2>
      <div style="display:grid;grid-template-columns:200px 1fr;gap:var(--space-8);">
        <nav id="settings-nav" style="display:flex;flex-direction:column;gap:var(--space-1);">
          ${sections.map(s => `
            <div class="settings-nav-item ${s.id === activeSection ? 'active' : ''}" data-section="${s.id}" style="padding:var(--space-3) var(--space-4);border-radius:var(--radius-md);font-size:var(--text-sm);color:var(--text-secondary);cursor:pointer;transition:all 150ms;display:flex;align-items:center;gap:var(--space-2);">
              <span style="width:18px;height:18px;display:flex;">${Icons[s.icon]}</span>${s.label}
            </div>
          `).join('')}
        </nav>
        <div id="settings-content" style="min-height:400px;"></div>
      </div>
    </div>
  `;

  document.querySelectorAll('#settings-nav .settings-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      activeSection = item.dataset.section;
      document.querySelectorAll('#settings-nav .settings-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      renderSettingsSection();
    });
  });

  renderSettingsSection();
}

function renderSettingsSection() {
  const container = document.getElementById('settings-content');
  if (!container) return;

  const settings = AppState.getVal('settings') || {};
  const theme = AppState.getVal('theme');
  const accent = AppState.getVal('accent');

  switch (activeSection) {
    case 'appearance':
      container.innerHTML = `
        <h3 style="font-size:var(--text-lg);font-weight:700;margin-bottom:var(--space-5);">Appearance</h3>
        <div style="margin-bottom:var(--space-6);">
          <label style="display:block;font-size:var(--text-sm);font-weight:500;color:var(--text-secondary);margin-bottom:var(--space-3);">Theme</label>
          <div style="display:flex;gap:var(--space-3);">
            ${['dark', 'light', 'oled'].map(t => `
              <button class="theme-btn" data-theme="${t}" style="padding:var(--space-3) var(--space-5);border-radius:var(--radius-md);border:2px solid ${theme === t ? 'var(--color-primary)' : 'var(--border)'};background:var(--surface);color:var(--text-primary);font-size:var(--text-sm);cursor:pointer;transition:all 150ms;">
                ${t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            `).join('')}
          </div>
        </div>
        <div style="margin-bottom:var(--space-6);">
          <label style="display:block;font-size:var(--text-sm);font-weight:500;color:var(--text-secondary);margin-bottom:var(--space-3);">Accent Color</label>
          <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;">
            ${[{id:'default',color:'#6C5CE7'},{id:'violet',color:'#6C5CE7'},{id:'cyan',color:'#00CEFF'},{id:'emerald',color:'#00D68F'},{id:'solar',color:'#FFAA00'},{id:'rose',color:'#FF6B9D'},{id:'ice',color:'#74B9FF'}].map(a => `
              <button class="accent-btn" data-accent="${a.id}" style="width:36px;height:36px;border-radius:50%;background:${a.color};border:3px solid ${accent === a.id ? 'white' : 'transparent'};cursor:pointer;transition:all 150ms;box-shadow:0 0 0 2px ${accent === a.id ? a.color : 'transparent'};"></button>
            `).join('')}
          </div>
        </div>
        <div style="margin-bottom:var(--space-6);">
          <label style="display:block;font-size:var(--text-sm);font-weight:500;color:var(--text-secondary);margin-bottom:var(--space-3);">Interface Density</label>
          <div style="display:flex;gap:var(--space-3);">
            ${['compact', 'comfortable', 'spacious'].map(d => `
              <button class="density-btn" data-density="${d}" style="padding:var(--space-3) var(--space-5);border-radius:var(--radius-md);border:2px solid ${AppState.getVal('density') === d ? 'var(--color-primary)' : 'var(--border)'};background:var(--surface);color:var(--text-primary);font-size:var(--text-sm);cursor:pointer;">
                ${d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            `).join('')}
          </div>
        </div>
      `;

      container.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const t = btn.dataset.theme;
          AppState.set('theme', t);
          document.documentElement.setAttribute('data-theme', t);
          toast.success('Theme updated');
          renderSettingsSection();
        });
      });

      container.querySelectorAll('.accent-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const a = btn.dataset.accent;
          AppState.set('accent', a);
          document.documentElement.setAttribute('data-accent', a);
          toast.success('Accent updated');
          renderSettingsSection();
        });
      });

      container.querySelectorAll('.density-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const d = btn.dataset.density;
          AppState.set('density', d);
          document.documentElement.setAttribute('data-density', d);
          toast.success('Density updated');
          renderSettingsSection();
        });
      });
      break;

    case 'account':
      const user = getLocalUser();
      container.innerHTML = `
        <h3 style="font-size:var(--text-lg);font-weight:700;margin-bottom:var(--space-5);">Account</h3>
        <div style="margin-bottom:var(--space-4);">
          <label style="display:block;font-size:var(--text-sm);font-weight:500;color:var(--text-secondary);margin-bottom:var(--space-2);">Display Name</label>
          <input type="text" value="${user?.displayName || ''}" id="settings-displayname" style="width:100%;height:44px;padding:0 var(--space-4);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);font-size:var(--text-base);">
        </div>
        <div style="margin-bottom:var(--space-4);">
          <label style="display:block;font-size:var(--text-sm);font-weight:500;color:var(--text-secondary);margin-bottom:var(--space-2);">Bio</label>
          <textarea id="settings-bio" style="width:100%;min-height:100px;padding:var(--space-3) var(--space-4);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);font-size:var(--text-base);resize:vertical;">${user?.bio || ''}</textarea>
        </div>
        <button class="btn btn-primary" id="save-profile-btn">Save Changes</button>
        <div style="margin-top:var(--space-8);padding-top:var(--space-6);border-top:1px solid var(--border);">
          <h4 style="color:var(--color-error);font-size:var(--text-base);margin-bottom:var(--space-3);">Danger Zone</h4>
          <button class="btn btn-danger btn-sm" id="signout-btn">Sign Out</button>
        </div>
      `;
      document.getElementById('save-profile-btn')?.addEventListener('click', () => {
        ProfileService.updateProfile(user.id, {
          displayName: document.getElementById('settings-displayname').value,
          bio: document.getElementById('settings-bio').value,
        });
        toast.success('Profile updated');
      });
      document.getElementById('signout-btn')?.addEventListener('click', () => {
        AuthService.signOut();
        window.location.hash = '#/login';
      });
      break;

    case 'privacy':
      container.innerHTML = `
        <h3 style="font-size:var(--text-lg);font-weight:700;margin-bottom:var(--space-5);">Privacy</h3>
        ${[
          { key: 'isPrivate', label: 'Private Profile', desc: 'Only followers can see your posts' },
          { key: 'readReceipts', label: 'Read Receipts', desc: 'Show when you\'ve read messages' },
          { key: 'activityVisibility', label: 'Activity Status', desc: 'Show when you\'re active' },
        ].map(item => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-4) 0;border-bottom:1px solid var(--border-light);">
            <div><div style="font-size:var(--text-sm);font-weight:500;">${item.label}</div><div style="font-size:var(--text-xs);color:var(--text-secondary);">${item.desc}</div></div>
            <div class="toggle ${settings.privacy?.[item.key] ? 'active' : ''}" data-key="${item.key}" style="cursor:pointer;"><div class="toggle-knob"></div></div>
          </div>
        `).join('')}
      `;
      container.querySelectorAll('.toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
          toggle.classList.toggle('active');
          const key = toggle.dataset.key;
          settings.privacy = settings.privacy || {};
          settings.privacy[key] = toggle.classList.contains('active');
          AppState.set('settings', settings);
          toast.success('Settings updated');
        });
      });
      break;

    case 'notifications':
      container.innerHTML = `
        <h3 style="font-size:var(--text-lg);font-weight:700;margin-bottom:var(--space-5);">Notifications</h3>
        ${[
          { key: 'likes', label: 'Likes' },
          { key: 'comments', label: 'Comments' },
          { key: 'follows', label: 'Follows' },
          { key: 'messages', label: 'Messages' },
          { key: 'mentions', label: 'Mentions' },
          { key: 'system', label: 'System' },
        ].map(item => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-4) 0;border-bottom:1px solid var(--border-light);">
            <span style="font-size:var(--text-sm);font-weight:500;">${item.label}</span>
            <div class="toggle ${settings.notifications?.[item.key] !== false ? 'active' : ''}" data-key="${item.key}" style="cursor:pointer;"><div class="toggle-knob"></div></div>
          </div>
        `).join('')}
      `;
      container.querySelectorAll('.toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
          toggle.classList.toggle('active');
          const key = toggle.dataset.key;
          settings.notifications = settings.notifications || {};
          settings.notifications[key] = toggle.classList.contains('active');
          AppState.set('settings', settings);
        });
      });
      break;

    case 'security':
      container.innerHTML = `
        <h3 style="font-size:var(--text-lg);font-weight:700;margin-bottom:var(--space-5);">Security</h3>
        <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--space-5);">These are frontend demonstrations. Real security requires a backend.</p>
        <div style="margin-bottom:var(--space-4);"><button class="btn btn-secondary" style="width:100%;">Change Password</button></div>
        <div style="margin-bottom:var(--space-4);"><button class="btn btn-secondary" style="width:100%;">Two-Factor Authentication</button></div>
        <div style="margin-bottom:var(--space-4);"><button class="btn btn-secondary" style="width:100%;">Login Alerts</button></div>
        <div style="margin-bottom:var(--space-4);"><button class="btn btn-secondary" style="width:100%;">Active Sessions</button></div>
      `;
      container.querySelectorAll('.btn-secondary').forEach(btn => {
        btn.addEventListener('click', () => toast.info('Demo feature — requires backend'));
      });
      break;

    case 'content':
      container.innerHTML = `
        <h3 style="font-size:var(--text-lg);font-weight:700;margin-bottom:var(--space-5);">Content Preferences</h3>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-4) 0;border-bottom:1px solid var(--border-light);">
          <div><div style="font-size:var(--text-sm);font-weight:500;">Autoplay Videos</div><div style="font-size:var(--text-xs);color:var(--text-secondary);">Automatically play videos in feed</div></div>
          <div class="toggle active" style="cursor:pointer;"><div class="toggle-knob"></div></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-4) 0;border-bottom:1px solid var(--border-light);">
          <div><div style="font-size:var(--text-sm);font-weight:500;">Sensitive Content</div><div style="font-size:var(--text-xs);color:var(--text-secondary);">Show content warnings for sensitive posts</div></div>
          <div class="toggle" style="cursor:pointer;"><div class="toggle-knob"></div></div>
        </div>
      `;
      break;

    case 'accessibility':
      container.innerHTML = `
        <h3 style="font-size:var(--text-lg);font-weight:700;margin-bottom:var(--space-5);">Accessibility</h3>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-4) 0;border-bottom:1px solid var(--border-light);">
          <div><div style="font-size:var(--text-sm);font-weight:500;">Reduce Motion</div><div style="font-size:var(--text-xs);color:var(--text-secondary);">Minimize animations</div></div>
          <div class="toggle ${AppState.getVal('reducedMotion') ? 'active' : ''}" id="reduced-motion-toggle" style="cursor:pointer;"><div class="toggle-knob"></div></div>
        </div>
      `;
      document.getElementById('reduced-motion-toggle')?.addEventListener('click', function() {
        this.classList.toggle('active');
        const reduced = this.classList.contains('active');
        AppState.set('reducedMotion', reduced);
        document.documentElement.setAttribute('data-reduced-motion', reduced ? 'true' : 'false');
        toast.success(reduced ? 'Motion reduced' : 'Motion restored');
      });
      break;

    case 'about':
      container.innerHTML = `
        <h3 style="font-size:var(--text-lg);font-weight:700;margin-bottom:var(--space-5);">About Youtupost</h3>
        <div style="padding:var(--space-5);background:var(--surface);border-radius:var(--radius-lg);margin-bottom:var(--space-4);">
          <div style="font-size:var(--text-xl);font-weight:700;background:var(--gradient-accent);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:var(--space-2);">Youtupost</div>
          <div style="font-size:var(--text-sm);color:var(--text-secondary);">Share what happens next.</div>
          <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:var(--space-2);">Version 1.0.0 (Demo)</div>
        </div>
        <div style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.6;">
          <p>Youtupost is a next-generation social media platform built with vanilla HTML, CSS, and JavaScript.</p>
          <p style="margin-top:var(--space-3);">This is a frontend demonstration. All data is stored locally in your browser.</p>
        </div>
        <div style="margin-top:var(--space-6);">
          <button class="btn btn-danger btn-sm" id="clear-storage-btn">Clear All Data</button>
        </div>
      `;
      document.getElementById('clear-storage-btn')?.addEventListener('click', () => {
        if (confirm('This will delete all local data. Continue?')) {
          Storage.clear();
          window.location.reload();
        }
      });
      break;

    default:
      container.innerHTML = '<p style="color:var(--text-secondary);">Select a section</p>';
  }
}
