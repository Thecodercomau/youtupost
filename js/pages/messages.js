/* ==========================================
   YOUTUPOST — Messages Page
   Conversations & Chat Interface
   ========================================== */

import { AppState } from '../state.js';
import { MessageService, AuthService } from '../services/services.js';
import { Icons } from '../icons.js';
import { timeAgo, formatTime, generateAvatarSVG, escapeHtml } from '../utils.js';
import { Router } from '../router.js';

let activeConvId = null;

export function renderMessagesPage() {
  const page = document.getElementById('page-messages');
  if (!page) return;

  const conversations = MessageService.getConversations();
  const users = AppState.getVal('users') || [];
  const currentUserId = AppState.getVal('currentUser');

  page.innerHTML = `
    <div style="display:grid;grid-template-columns:340px 1fr;height:calc(100vh - var(--topbar-height));overflow:hidden;">
      <div id="conv-list" style="border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;">
        <div style="padding:var(--space-4) var(--space-5);border-bottom:1px solid var(--border-light);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3);">
            <h2 style="font-size:var(--text-xl);font-weight:700;">Messages</h2>
            <button style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--surface);color:var(--text-secondary);border:none;cursor:pointer;">${Icons.edit}</button>
          </div>
          <div class="search-input-wrapper">
            <input type="text" placeholder="Search messages..." style="width:100%;height:38px;padding:0 var(--space-4);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-full);color:var(--text-primary);font-size:var(--text-sm);">
          </div>
        </div>
        <div id="conversations-items" style="flex:1;overflow-y:auto;"></div>
      </div>

      <div id="chat-area" style="display:flex;flex-direction:column;overflow:hidden;">
        <div id="chat-placeholder" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div style="width:80px;height:80px;border-radius:50%;background:var(--surface);display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-6);">${Icons.message}</div>
          <h3 style="font-size:var(--text-xl);font-weight:700;margin-bottom:var(--space-2);">Your Messages</h3>
          <p style="font-size:var(--text-sm);color:var(--text-secondary);">Send private messages to a friend</p>
        </div>
        <div id="chat-content" style="display:none;flex:1;flex-direction:column;overflow:hidden;"></div>
      </div>
    </div>
  `;

  renderConversationList(conversations, users, currentUserId);

  // Mobile responsive
  if (window.innerWidth <= 768) {
    const chatArea = document.getElementById('chat-area');
    if (chatArea) chatArea.style.display = 'none';
  }
}

function renderConversationList(conversations, users, currentUserId) {
  const container = document.getElementById('conversations-items');
  if (!container) return;
  container.innerHTML = '';

  conversations.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  conversations.forEach(conv => {
    const otherMembers = conv.members.filter(id => id !== currentUserId);
    const otherUser = users.find(u => u.id === otherMembers[0]);
    const messages = MessageService.getMessages(conv.id);
    const lastMsg = messages[messages.length - 1];
    const unread = messages.filter(m => m.userId !== currentUserId && m.status !== 'read').length;

    const card = document.createElement('div');
    card.className = `conversation-card ${activeConvId === conv.id ? 'active' : ''}`;
    card.innerHTML = `
      <div class="avatar md" style="position:relative;">
        <img src="${otherUser?.avatar || generateAvatarSVG(otherUser?.displayName || 'Group')}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
        ${!conv.isGroup ? '<div class="online-indicator" style="position:absolute;bottom:0;right:0;width:10px;height:10px;background:var(--status-online);border:2px solid var(--bg-secondary);border-radius:50%;"></div>' : ''}
      </div>
      <div class="conv-info" style="flex:1;min-width:0;">
        <div class="conv-name" style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);display:flex;align-items:center;gap:var(--space-1);">
          ${conv.isGroup ? conv.name : (otherUser?.displayName || 'Unknown')}
        </div>
        <div class="conv-preview" style="font-size:var(--text-xs);color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ${lastMsg ? escapeHtml(lastMsg.text) : 'Start a conversation'}
        </div>
      </div>
      <div class="conv-meta" style="display:flex;flex-direction:column;align-items:flex-end;gap:var(--space-1);flex-shrink:0;">
        <span style="font-size:var(--text-xs);color:var(--text-tertiary);">${lastMsg ? timeAgo(lastMsg.createdAt) : ''}</span>
        ${unread > 0 ? `<span style="min-width:18px;height:18px;border-radius:50%;background:var(--color-primary);color:white;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;">${unread}</span>` : ''}
      </div>
    `;

    card.addEventListener('click', () => openChat(conv));
    container.appendChild(card);
  });
}

function openChat(conv) {
  activeConvId = conv.id;
  const users = AppState.getVal('users') || [];
  const currentUserId = AppState.getVal('currentUser');
  const otherMembers = conv.members.filter(id => id !== currentUserId);
  const otherUser = users.find(u => u.id === otherMembers[0]);
  const messages = MessageService.getMessages(conv.id);

  // Show chat content
  document.getElementById('chat-placeholder')?.style.setProperty('display', 'none');
  const chatContent = document.getElementById('chat-content');
  if (!chatContent) return;
  chatContent.style.display = 'flex';

  chatContent.innerHTML = `
    <div style="padding:var(--space-3) var(--space-5);border-bottom:1px solid var(--border-light);display:flex;align-items:center;gap:var(--space-3);">
      <button id="chat-back-btn" style="display:none;width:32px;height:32px;border-radius:50%;background:none;border:none;color:var(--text-secondary);cursor:pointer;">${Icons.chevronLeft}</button>
      <div class="avatar sm">
        <img src="${otherUser?.avatar || generateAvatarSVG(otherUser?.displayName || 'Group')}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
      </div>
      <div style="flex:1;">
        <div style="font-size:var(--text-sm);font-weight:600;">${conv.isGroup ? conv.name : (otherUser?.displayName || 'Unknown')}</div>
        <div style="font-size:var(--text-xs);color:var(--text-tertiary);">Active now</div>
      </div>
      <button style="width:32px;height:32px;border-radius:50%;background:none;border:none;color:var(--text-secondary);cursor:pointer;">${Icons.phone}</button>
      <button style="width:32px;height:32px;border-radius:50%;background:none;border:none;color:var(--text-secondary);cursor:pointer;">${Icons.moreVertical}</button>
    </div>

    <div id="messages-list" style="flex:1;overflow-y:auto;padding:var(--space-4);display:flex;flex-direction:column;gap:var(--space-1);"></div>

    <div style="padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-light);display:flex;align-items:center;gap:var(--space-3);">
      <button style="width:36px;height:36px;border-radius:50%;background:none;border:none;color:var(--text-secondary);cursor:pointer;">${Icons.plus}</button>
      <input type="text" id="message-input" placeholder="Message..." style="flex:1;height:40px;padding:0 var(--space-4);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-full);color:var(--text-primary);font-size:var(--text-sm);">
      <button id="send-btn" style="width:36px;height:36px;border-radius:50%;background:none;border:none;color:var(--color-primary);cursor:pointer;display:flex;align-items:center;justify-content:center;">${Icons.send}</button>
    </div>
  `;

  renderMessages(messages, users, currentUserId);

  // Send message
  const input = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');

  const send = () => {
    const text = input.value.trim();
    if (!text) return;
    MessageService.sendMessage(conv.id, text);
    input.value = '';
    const updatedMessages = MessageService.getMessages(conv.id);
    renderMessages(updatedMessages, users, currentUserId);
  };

  sendBtn?.addEventListener('click', send);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send();
  });

  // Scroll to bottom
  setTimeout(() => {
    const list = document.getElementById('messages-list');
    if (list) list.scrollTop = list.scrollHeight;
  }, 100);

  // Update conversation list active state
  document.querySelectorAll('.conversation-card').forEach(c => c.classList.remove('active'));
  document.querySelector(`.conversation-card:nth-child(${[...document.querySelectorAll('.conversation-card')].findIndex(c => c.querySelector('.conv-name')?.textContent.includes(otherUser?.displayName || conv.name)) + 1})`)?.classList.add('active');

  // Mobile back button
  if (window.innerWidth <= 768) {
    const backBtn = document.getElementById('chat-back-btn');
    if (backBtn) {
      backBtn.style.display = 'flex';
      backBtn.addEventListener('click', () => {
        chatContent.style.display = 'none';
        document.getElementById('chat-placeholder')?.style.setProperty('display', 'flex');
      });
    }
  }
}

function renderMessages(messages, users, currentUserId) {
  const list = document.getElementById('messages-list');
  if (!list) return;
  list.innerHTML = '';

  messages.forEach(msg => {
    const isSent = msg.userId === currentUserId;
    const bubble = document.createElement('div');
    bubble.style.cssText = `display:flex;flex-direction:column;${isSent ? 'align-items:flex-end;' : 'align-items:flex-start;'}margin-bottom:var(--space-1);`;
    bubble.innerHTML = `
      <div style="max-width:70%;padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);font-size:var(--text-sm);line-height:1.5;${isSent ? 'background:var(--color-primary);color:white;border-bottom-right-radius:var(--radius-sm);' : 'background:var(--surface);color:var(--text-primary);border-bottom-left-radius:var(--radius-sm);'}">
        ${escapeHtml(msg.text)}
      </div>
      <div style="display:flex;align-items:center;gap:var(--space-1);margin-top:2px;padding:0 var(--space-1);">
        <span style="font-size:10px;color:var(--text-tertiary);">${formatTime(msg.createdAt)}</span>
        ${isSent ? `<span style="color:var(--text-tertiary);">${msg.status === 'read' ? Icons.checkDouble : Icons.check}</span>` : ''}
      </div>
    `;
    list.appendChild(bubble);
  });
}
