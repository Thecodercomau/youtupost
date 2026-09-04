/* ==========================================
   YOUTUPOST — AI Page
   ========================================== */

import { AIService } from '../services/services.js';
import { Icons } from '../icons.js';
import { AuthService } from '../services/services.js';
import { toast } from '../components/toast.js';

const tools = [
  { id: 'caption', name: 'Caption Generator', icon: 'edit', desc: 'Generate creative captions for your posts' },
  { id: 'hashtags', name: 'Hashtag Suggestions', icon: 'hash', desc: 'Find the best hashtags for your content' },
  { id: 'ideas', name: 'Post Ideas', icon: 'sparkles', desc: 'Get inspiration for your next post' },
  { id: 'bio', name: 'Bio Generator', icon: 'user', desc: 'Create a compelling profile bio' },
  { id: 'search', name: 'Search Assistant', icon: 'search', desc: 'Get help finding content and creators' },
  { id: 'summary', name: 'Discussion Summaries', icon: 'comment', desc: 'Summarize community discussions' },
];

export function renderAIPage() {
  const page = document.getElementById('page-ai');
  if (!page) return;

  page.innerHTML = `
    <div style="max-width:600px;margin:0 auto;padding:var(--space-6) var(--space-4);">
      <div style="text-align:center;margin-bottom:var(--space-8);">
        <div style="width:64px;height:64px;margin:0 auto var(--space-4);background:var(--gradient-accent);border-radius:var(--radius-xl);display:flex;align-items:center;justify-content:center;">${Icons.sparkles}</div>
        <h2 style="font-size:var(--text-2xl);font-weight:700;margin-bottom:var(--space-2);">Youtupost AI</h2>
        <p style="font-size:var(--text-sm);color:var(--text-secondary);">AI-powered creative tools for creators</p>
      </div>

      <div id="ai-tools-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-3);margin-bottom:var(--space-6);">
        ${tools.map(tool => `
          <div class="ai-tool-card" data-tool="${tool.id}" style="padding:var(--space-4);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);cursor:pointer;transition:all 200ms;">
            <div style="width:36px;height:36px;margin-bottom:var(--space-3);color:var(--color-primary);">${Icons[tool.icon]}</div>
            <div style="font-size:var(--text-sm);font-weight:600;margin-bottom:2px;">${tool.name}</div>
            <div style="font-size:var(--text-xs);color:var(--text-secondary);line-height:1.4;">${tool.desc}</div>
          </div>
        `).join('')}
      </div>

      <div id="ai-result" style="display:none;">
        <div id="ai-result-content" style="padding:var(--space-5);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);margin-bottom:var(--space-4);"></div>
      </div>

      <div id="ai-input-area" style="display:none;">
        <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-3);">
          <input type="text" id="ai-input" placeholder="Enter your topic or question..." style="flex:1;height:44px;padding:0 var(--space-4);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-full);color:var(--text-primary);font-size:var(--text-sm);">
          <button class="btn btn-primary" id="ai-generate-btn">Generate</button>
        </div>
        <div style="font-size:var(--text-xs);color:var(--text-tertiary);text-align:center;">⚠️ AI responses are simulated for demo purposes</div>
      </div>
    </div>
  `;

  let selectedTool = null;

  document.querySelectorAll('.ai-tool-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedTool = card.dataset.tool;
      document.getElementById('ai-input-area').style.display = 'block';
      document.getElementById('ai-result').style.display = 'none';

      const input = document.getElementById('ai-input');
      const placeholders = {
        caption: 'Describe your image or post...',
        hashtags: 'What is your post about?',
        ideas: 'What are your interests?',
        bio: 'What do you do?',
        search: 'What are you looking for?',
        summary: 'Paste or describe the discussion...',
      };
      input.placeholder = placeholders[selectedTool] || 'Enter your query...';
      input.focus();
    });
  });

  document.getElementById('ai-generate-btn')?.addEventListener('click', async () => {
    const input = document.getElementById('ai-input');
    const value = input.value.trim();
    if (!value) { toast.warning('Enter something first'); return; }

    const resultDiv = document.getElementById('ai-result');
    const resultContent = document.getElementById('ai-result-content');
    resultDiv.style.display = 'block';
    resultContent.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;padding:var(--space-8);"><div class="spinner lg"></div></div>';

    try {
      let result;
      switch (selectedTool) {
        case 'caption': result = await AIService.generateCaption(value); break;
        case 'hashtags': result = (await AIService.generateHashtags(value)).join(' '); break;
        case 'ideas': result = await AIService.generatePostIdea([value]); break;
        case 'bio': result = await AIService.generateBio('User', [value]); break;
        case 'search': result = await AIService.searchAssistant(value); break;
        case 'summary': result = await AIService.summarizeDiscussion([]); break;
        default: result = 'Select a tool first';
      }

      resultContent.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3);">
          <span style="font-size:var(--text-sm);font-weight:600;color:var(--color-primary);display:flex;align-items:center;gap:var(--space-2);">${Icons.sparkles} AI Response</span>
          <button class="btn btn-ghost btn-sm" onclick="navigator.clipboard?.writeText(this.closest('#ai-result-content').querySelector('p').textContent);">Copy</button>
        </div>
        <p style="font-size:var(--text-sm);color:var(--text-primary);line-height:1.6;white-space:pre-wrap;">${result}</p>
      `;
    } catch (e) {
      resultContent.innerHTML = '<p style="color:var(--color-error);">Something went wrong. Please try again.</p>';
    }
  });

  document.getElementById('ai-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('ai-generate-btn')?.click();
  });
}
