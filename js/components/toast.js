/* ==========================================
   YOUTUPOST — Toast System
   Reusable Notifications
   ========================================== */

let toastContainer = null;

function ensureContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = 'position:fixed;top:var(--topbar-height);right:var(--space-4);z-index:var(--z-toast);display:flex;flex-direction:column;gap:var(--space-2);pointer-events:none;';
    document.body.appendChild(toastContainer);
  }
}

const icons = {
  success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
};

const colors = {
  success: '#00D68F',
  info: '#0095FF',
  warning: '#FFAA00',
  error: '#FF3D71',
};

export function showToast(message, type = 'info', duration = 3000) {
  ensureContainer();

  const toast = document.createElement('div');
  toast.style.cssText = `
    display:flex;align-items:center;gap:var(--space-3);
    padding:var(--space-3) var(--space-5);
    background:var(--bg-elevated);border:1px solid var(--border);
    border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);
    pointer-events:auto;cursor:pointer;min-width:280px;max-width:420px;
    animation:toastEnter 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
    font-size:var(--text-sm);color:var(--text-primary);
  `;

  const iconEl = document.createElement('span');
  iconEl.style.cssText = `color:${colors[type]};flex-shrink:0;display:flex;`;
  iconEl.innerHTML = icons[type];

  const textEl = document.createElement('span');
  textEl.style.cssText = 'flex:1;line-height:1.4;';
  textEl.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'color:var(--text-tertiary);flex-shrink:0;display:flex;width:20px;height:20px;align-items:center;justify-content:center;border-radius:var(--radius-full);transition:color 150ms;';
  closeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  toast.appendChild(iconEl);
  toast.appendChild(textEl);
  toast.appendChild(closeBtn);
  toastContainer.appendChild(toast);

  const dismiss = () => {
    toast.style.animation = 'toastExit 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  };

  closeBtn.addEventListener('click', dismiss);
  toast.addEventListener('click', dismiss);

  if (duration > 0) {
    setTimeout(dismiss, duration);
  }

  return toast;
}

export const toast = {
  success: (msg, dur) => showToast(msg, 'success', dur),
  info: (msg, dur) => showToast(msg, 'info', dur),
  warning: (msg, dur) => showToast(msg, 'warning', dur),
  error: (msg, dur) => showToast(msg, 'error', dur),
};
