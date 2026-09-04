/* ==========================================
   YOUTUPOST — Auth Pages
   Login, Registration, Onboarding
   ========================================== */

import { AuthService } from '../services/services.js';
import { Icons } from '../icons.js';
import { toast } from '../components/toast.js';
import { generateAvatarSVG } from '../utils.js';
import { loadDemoData } from '../demo/data.js';
import { AppState } from '../state.js';
import { Router } from '../router.js';

let regStep = 0;
let regData = {};

export function renderLoginPage() {
  const page = document.getElementById('page-login');
  if (!page) return;

  page.style.cssText = 'display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg-primary);';

  page.innerHTML = `
    <div style="width:100%;max-width:420px;padding:var(--space-6);">
      <div style="text-align:center;margin-bottom:var(--space-10);">
        <div style="width:64px;height:64px;margin:0 auto var(--space-4);background:var(--gradient-accent);border-radius:var(--radius-xl);display:flex;align-items:center;justify-content:center;">
          <svg viewBox="0 0 24 24" fill="white" width="32" height="32"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        <h1 style="font-size:var(--text-3xl);font-weight:700;background:var(--gradient-accent);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:var(--space-2);">Youtupost</h1>
        <p style="font-size:var(--text-sm);color:var(--text-secondary);">Share what happens next.</p>
      </div>

      <div style="margin-bottom:var(--space-6);">
        <div class="input-group">
          <label>Username or Email</label>
          <input type="text" id="login-username" class="input-field" placeholder="Enter your username" value="demo@demo.com">
        </div>
        <div class="input-group">
          <label>Password</label>
          <input type="password" id="login-password" class="input-field" placeholder="Enter your password" value="demo">
        </div>
      </div>

      <button class="btn btn-primary btn-lg" id="login-btn" style="width:100%;margin-bottom:var(--space-4);">Sign In</button>

      <button class="btn btn-secondary btn-lg" id="demo-btn" style="width:100%;margin-bottom:var(--space-6);">Explore Demo</button>

      <div style="text-align:center;">
        <span style="font-size:var(--text-sm);color:var(--text-secondary);">Don't have an account? </span>
        <button id="go-register" style="font-size:var(--text-sm);color:var(--text-link);background:none;border:none;cursor:pointer;font-weight:600;">Create Account</button>
      </div>
    </div>
  `;

  // Load demo data if not loaded
  ensureDemoData();

  document.getElementById('login-btn')?.addEventListener('click', () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    if (!username || !password) { toast.warning('Please fill in all fields'); return; }

    const result = AuthService.signIn(username, password);
    if (result.success) {
      toast.success('Welcome back!');
      Router.navigate('/home');
    } else {
      toast.error('Invalid credentials. Try demo@demo.com / demo');
    }
  });

  document.getElementById('demo-btn')?.addEventListener('click', () => {
    ensureDemoData();
    const user = AuthService.continueAsDemo();
    if (user) {
      toast.success(`Welcome, ${user.displayName}!`);
      Router.navigate('/home');
    }
  });

  document.getElementById('go-register')?.addEventListener('click', () => {
    Router.navigate('/register');
  });
}

export function renderRegisterPage() {
  const page = document.getElementById('page-register');
  if (!page) return;

  regStep = 0;
  regData = {};

  page.style.cssText = 'display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg-primary);';
  renderRegisterStep(page);
}

function renderRegisterStep(page) {
  const steps = [
    { title: 'Email', field: 'email', type: 'email', placeholder: 'your@email.com' },
    { title: 'Password', field: 'password', type: 'password', placeholder: 'Create a password' },
    { title: 'Display Name', field: 'displayName', type: 'text', placeholder: 'Your name' },
    { title: 'Birthday', field: 'birthday', type: 'date', placeholder: '' },
    { title: 'Username', field: 'username', type: 'text', placeholder: 'Choose a username' },
    { title: 'Interests', field: 'interests', type: 'interests', placeholder: '' },
    { title: 'Avatar', field: 'avatar', type: 'avatar', placeholder: '' },
  ];

  if (regStep >= steps.length) {
    completeRegistration(page);
    return;
  }

  const step = steps[regStep];

  page.innerHTML = `
    <div style="width:100%;max-width:420px;padding:var(--space-6);">
      <button id="reg-back" style="font-size:var(--text-sm);color:var(--text-secondary);background:none;border:none;cursor:pointer;margin-bottom:var(--space-6);display:flex;align-items:center;gap:var(--space-1);">← Back</button>

      <div class="step-indicator" style="display:flex;align-items:center;justify-content:center;gap:var(--space-2);margin-bottom:var(--space-8);">
        ${steps.map((_, i) => `<div style="width:8px;height:8px;border-radius:50%;background:${i <= regStep ? 'var(--color-primary)' : 'var(--border-strong)'};${i === regStep ? 'width:24px;' : ''}transition:all 0.3s;"></div>`).join('')}
      </div>

      <h2 style="font-size:var(--text-2xl);font-weight:700;text-align:center;margin-bottom:var(--space-2);">Create Account</h2>
      <p style="font-size:var(--text-sm);color:var(--text-secondary);text-align:center;margin-bottom:var(--space-8);">Step ${regStep + 1} of ${steps.length}: ${step.title}</p>

      <div id="reg-field-container" style="margin-bottom:var(--space-6);"></div>

      <button class="btn btn-primary btn-lg" id="reg-next" style="width:100%;">${regStep === steps.length - 1 ? 'Complete' : 'Next'}</button>
    </div>
  `;

  const fieldContainer = document.getElementById('reg-field-container');

  if (step.type === 'interests') {
    const interests = ['Music', 'Gaming', 'Coding', 'Technology', 'Photography', 'Art', 'Design', 'Travel', 'Sports', 'Science', 'Movies'];
    fieldContainer.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);">
        ${interests.map(i => `
          <div class="chip interest-chip" data-interest="${i}" style="cursor:pointer;padding:var(--space-2) var(--space-4);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-full);font-size:var(--text-sm);color:var(--text-secondary);transition:all 150ms;">${i}</div>
        `).join('')}
      </div>
    `;
    if (!regData.interests) regData.interests = [];
    fieldContainer.querySelectorAll('.interest-chip').forEach(chip => {
      if (regData.interests.includes(chip.dataset.interest)) chip.classList.add('selected');
      chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
        const interest = chip.dataset.interest;
        if (chip.classList.contains('selected')) {
          regData.interests.push(interest);
        } else {
          regData.interests = regData.interests.filter(i => i !== interest);
        }
      });
    });
  } else if (step.type === 'avatar') {
    fieldContainer.innerHTML = `
      <div class="avatar-upload" style="width:120px;height:120px;margin:0 auto;">
        <div class="avatar-preview" style="width:100%;height:100%;border-radius:50%;background:var(--surface);border:3px solid var(--border);overflow:hidden;display:flex;align-items:center;justify-content:center;">
          <img src="${regData.avatar || generateAvatarSVG(regData.displayName || 'User')}" alt="" style="width:100%;height:100%;object-fit:cover;">
        </div>
      </div>
    `;
  } else {
    fieldContainer.innerHTML = `
      <div class="input-group">
        <input type="${step.type}" id="reg-input" class="input-field" placeholder="${step.placeholder}" value="${regData[step.field] || ''}" style="width:100%;height:48px;padding:0 var(--space-4);background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);font-size:var(--text-base);">
      </div>
    `;
    setTimeout(() => document.getElementById('reg-input')?.focus(), 100);
  }

  document.getElementById('reg-back')?.addEventListener('click', () => {
    if (regStep > 0) { regStep--; renderRegisterStep(page); }
    else Router.navigate('/login');
  });

  document.getElementById('reg-next')?.addEventListener('click', () => {
    if (step.type !== 'interests' && step.type !== 'avatar') {
      const input = document.getElementById('reg-input');
      if (!input?.value?.trim()) { toast.warning('Please fill in this field'); return; }
      regData[step.field] = input.value.trim();
    }
    regStep++;
    renderRegisterStep(page);
  });
}

function completeRegistration(page) {
  ensureDemoData();
  const result = AuthService.signUp({
    email: regData.email,
    password: regData.password,
    displayName: regData.displayName,
    username: regData.username,
    interests: regData.interests || [],
    avatar: regData.avatar || generateAvatarSVG(regData.displayName),
  });

  if (result.success) {
    toast.success('Welcome to Youtupost!');
    Router.navigate('/home');
  } else {
    toast.error(result.error);
    regStep = 4;
    renderRegisterStep(page);
  }
}

function ensureDemoData() {
  const users = AppState.getVal('users') || [];
  if (users.length === 0) {
    const demo = loadDemoData();
    AppState.set('users', demo.users);
    AppState.set('posts', demo.posts);
    AppState.set('stories', demo.stories);
    AppState.set('shorts', demo.shorts);
    AppState.set('conversations', demo.conversations);
    AppState.set('messages', demo.messages);
    AppState.set('notifications', demo.notifications);
    AppState.set('communities', demo.communities);
    AppState.set('savedPosts', demo.savedPosts);
    AppState.set('savedCollections', demo.savedCollections);
    AppState.set('followRelationships', demo.followRelationships);
  }
}
