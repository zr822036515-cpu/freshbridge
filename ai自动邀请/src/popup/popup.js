// Popup — 精简版：统计 + 打开面板 + 最近活动

async function get() { return new Promise(r => chrome.storage.local.get(null, r)); }
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

document.addEventListener('DOMContentLoaded', () => {
  // 打开面板
  document.getElementById('open-panel').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'OPEN_PANEL' }).catch(() => {
        document.getElementById('status').textContent = '⚠️ 请在精选联盟页面使用';
      });
    }
  });

  // 加载统计
  loadStats();
  setInterval(loadStats, 5000);
});

async function loadStats() {
  const { stats, inviteRecords } = await get();
  const today = new Date().toDateString();
  if (stats?.date === today) {
    document.getElementById('s1').textContent = stats.sent || 0;
    document.getElementById('s2').textContent = stats.ok || 0;
    document.getElementById('s3').textContent = stats.ng || 0;
  } else {
    document.getElementById('s1').textContent = '0';
    document.getElementById('s2').textContent = '0';
    document.getElementById('s3').textContent = '0';
  }

  // 最近 5 条活动
  const recent = (inviteRecords || []).slice(0, 5);
  const actEl = document.getElementById('recent-activity');
  if (actEl) {
    if (recent.length) {
      actEl.innerHTML = recent.map(r => {
        const t = new Date(r.time);
        const ts = `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`;
        return `<div style="font-size:11px;padding:3px 0;color:${r.ok?'#10B981':'#EF4444'}">${r.ok?'✅':'❌'} ${esc(r.nickname||'?')} <span style="color:#94A3B8">${ts}</span></div>`;
      }).join('');
    } else {
      actEl.innerHTML = '<span class="muted">暂无记录</span>';
    }
  }
}
