// ============================================================
// 邀约任务运行控制台（纯监控面板，配置项已移至筛选页）
// ============================================================

import { escHtml, fmtDateTime } from '../utils.js';
import { emptyState } from './components.js';

/**
 * 渲染任务控制台
 */
export function renderTask(data = {}) {
  const {
    taskState = {}, anomalies = [], anomalyPaused = false,
    schedulerEnabled = false, schedulerInWindow = false, riskLevel = 'none',
    list = [], filters = {},
  } = data;
  const { running = false, paused = false, ok = 0, ng = 0, sk = 0, pct = 0, status = '待启动' } = taskState;

  // 统计当前符合条件的达人
  const blackSet = new Set((data.blacklist || []).map(String));
  const eligible = list.filter(c => !blackSet.has(String(c.id))).length;

  return `
    <!-- 安全状态条 -->
    ${renderSafetyBar(anomalyPaused, anomalies, schedulerEnabled, schedulerInWindow, riskLevel)}

    <!-- 运行状态大卡片 -->
    <div style="background:var(--surface);border:2px solid ${running ? '#4A90D9' : '#E2E8F0'};border-radius:12px;padding:20px;text-align:center;margin-bottom:16px">
      <div style="font-size:32px;margin-bottom:8px">${running ? (paused ? '⏸' : '🚀') : '⏹'}</div>
      <div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:4px" id="task-big-status">${escHtml(status)}</div>
      <div style="font-size:13px;color:var(--text-secondary)">
        可用达人: <b>${eligible}</b> 位 | 队列筛选后: <b>${list.length}</b> 位
      </div>
    </div>

    <!-- 计数卡片 -->
    <div class="statCards">
      <div class="statCard"><div class="sc-val" id="task-ok">${ok}</div><div class="sc-label">✅ 成功</div></div>
      <div class="statCard"><div class="sc-val" id="task-ng">${ng}</div><div class="sc-label">❌ 失败</div></div>
      <div class="statCard"><div class="sc-val" id="task-sk">${sk}</div><div class="sc-label">⏭ 跳过</div></div>
    </div>

    <!-- 进度条 -->
    <div class="prog-wrap">
      <div class="prog-bar"><div class="prog-fill" id="task-prog-fill" style="width:${pct}%"></div></div>
      <div class="prog-info">
        <span id="task-prog-txt">${pct}%</span>
        <span id="task-current" style="color:var(--text-secondary)">${running ? '运行中' : '就绪'}</span>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="btn-group btn-block" style="margin-bottom:16px">
      ${!running
        ? `<button class="btn btn-outline btn-block" id="task-goto-filter">🔍 前往筛选页配置并启动</button>`
        : `<button class="btn btn-warning" id="task-pause" style="flex:1">⏸ ${paused ? '继续' : '暂停'}</button>
           <button class="btn btn-danger" id="task-stop" style="flex:1">⏹ 停止</button>`
      }
    </div>

    <!-- 最近日志 -->
    <div class="section">
      <div class="section-title">📝 运行日志 <button class="btn btn-ghost btn-sm" id="task-clear-log" style="font-size:11px">清空</button></div>
      <div id="task-log" style="max-height:250px;overflow-y:auto">
        ${emptyState('📭', '暂无日志 — 在筛选页配置并启动邀约后，日志将显示在此处')}
      </div>
    </div>
  `;
}

function renderSafetyBar(anomalyPaused, anomalies, schedulerEnabled, schedulerInWindow, riskLevel) {
  if (!anomalyPaused && !schedulerEnabled && riskLevel === 'none' && !anomalies.length) return '';
  const riskColors = { none: '#10B981', low: '#F59E0B', medium: '#F97316', high: '#EF4444' };
  const riskLabels = { none: '正常', low: '低风险', medium: '中风险', high: '高风险' };

  let html = `<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">`;
  if (schedulerEnabled) html += `<span class="tag ${schedulerInWindow?'tag-green':'tag-gray'}" style="font-size:11px">⏰ ${schedulerInWindow?'窗口内':'等待'}</span>`;
  html += `<span class="tag" style="font-size:11px;background:${riskColors[riskLevel]}20;color:${riskColors[riskLevel]}">🛡 ${riskLabels[riskLevel]}</span>`;
  if (anomalyPaused) html += `<span class="tag tag-red" style="font-size:11px">🚨 异常暂停</span>`;
  html += `</div>`;

  if (anomalies.length) {
    html += `<div style="margin-bottom:12px;padding:8px 12px;background:#FEF2F2;border:1px solid #FECACA;border-radius:6px;font-size:12px">
      <b style="color:#991B1B">🚨 活跃异常:</b> ${anomalies.map(a => `<span style="color:#7F1D1D">${a}</span>`).join(', ')}
    </div>`;
  }
  return html;
}

// ==================== 事件 ====================

let taskLogs = [];

export function addTaskLog(msg, type = 'info') {
  taskLogs.unshift({ time: Date.now(), msg, type });
  if (taskLogs.length > 200) taskLogs.length = 200;
}

function renderLogs(el) {
  if (!el) return;
  if (!taskLogs.length) {
    el.innerHTML = emptyState('📭', '暂无日志');
    return;
  }
  el.innerHTML = taskLogs.slice(0, 30).map(l =>
    `<div style="font-size:11px;padding:3px 0;border-bottom:1px solid #F1F5F9;color:${l.type==='error'?'#EF4444':l.type==='success'?'#10B981':'#64748B'}">
      <span style="color:#94A3B8">${fmtDateTime(l.time)}</span> ${escHtml(l.msg)}
    </div>`
  ).join('');
}

export function initTask(root, state, refreshUI) {
  const $ = (id) => root.getElementById(id);

  // 渲染日志
  const logEl = $('task-log');
  if (logEl) renderLogs(logEl);

  // 清空日志
  $('task-clear-log')?.addEventListener('click', () => {
    taskLogs = [];
    renderLogs($('task-log'));
  });

  // 前往筛选页
  $('task-goto-filter')?.addEventListener('click', () => {
    // 切换到 filter tab
    root.querySelector('.tab[data-tab="filter"]')?.click();
  });

  // 暂停/继续
  $('task-pause')?.addEventListener('click', () => {
    state.taskState.paused = !state.taskState.paused;
    addTaskLog(state.taskState.paused ? '⏸ 已暂停' : '▶ 继续执行');
    refreshUI();
  });

  // 停止
  $('task-stop')?.addEventListener('click', () => {
    state.taskState.aborted = true;
    addTaskLog('⏹ 用户手动停止');
    refreshUI();
  });
}

// 供外部模块追加日志
export { taskLogs };
