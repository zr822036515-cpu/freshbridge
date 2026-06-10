// ==================== UI 管理器 ====================

import { CSS } from './styles.js';
import { renderDashboard, initDashboard } from './dashboard.js';
import { renderFilter, initFilter } from './filter.js';
import { renderTask, initTask } from './task.js';
import { renderAnalytics, initAnalytics } from './analytics.js';
import { renderSettings, initSettings } from './settings.js';
import { getConfig, getBlacklist, getWhitelist } from '../storage.js';

/** 全局 Shadow Root 引用 */
export let shadowRoot = null;
let panelVisible = false;
let currentTab = 'dashboard';

/** 标签定义 */
const TABS = [
  { id: 'dashboard', icon: '📊', label: '看板' },
  { id: 'filter', icon: '🎯', label: '筛选 & 启动' },
  { id: 'task', icon: '🎮', label: '运行控制台' },
  { id: 'analytics', icon: '📈', label: '数据分析' },
  { id: 'settings', icon: '⚙️', label: '设置' },
];

/**
 * 创建页面内 Shadow DOM UI
 */
export function createUI() {
  if (shadowRoot) return true;
  const exist = document.getElementById('__daren_inviter_v2__');
  if (exist) { shadowRoot = exist.shadowRoot; if (shadowRoot) return true; }
  if (!document.body) return false;

  const host = document.createElement('div');
  host.id = '__daren_inviter_v2__';
  host.style.cssText = 'all:initial;position:fixed;z-index:2147483646;top:0;left:0;';
  shadowRoot = host.attachShadow({ mode: 'open' });

  shadowRoot.innerHTML = buildHTML();
  document.body.appendChild(host);

  bindGlobalUI();
  switchTab('dashboard'); // 默认显示看板
  return true;
}

function buildHTML() {
  const tabsHTML = TABS.map((t, i) =>
    `<button class="tab${i === 0 ? ' active' : ''}" data-tab="${t.id}">${t.icon} ${t.label}</button>`
  ).join('');

  return `<style>${CSS}</style>
<!-- FAB 浮动按钮 -->
<button class="fab" id="fab">🔥<span class="badge" id="badge">0</span></button>

<!-- 主面板 -->
<div class="panel" id="panel">
  <div class="hdr">
    <div class="hdr-left">
      <span class="hdr-logo">🔥</span>
      <div>
        <div class="hdr-title">精选联盟达人邀约助手</div>
        <div class="hdr-subtitle">智能筛选 · 批量邀约 · 数据分析</div>
      </div>
    </div>
    <div class="hdr-actions">
      <button class="hdr-btn" id="panel-min" title="最小化">─</button>
      <button class="hdr-btn" id="panel-close" title="关闭">✕</button>
    </div>
  </div>

  <!-- 标签导航 -->
  <div class="tabs">${tabsHTML}</div>

  <!-- 面板内容 -->
  <div class="content active" id="content-dashboard"></div>
  <div class="content" id="content-filter"></div>
  <div class="content" id="content-task"></div>
  <div class="content" id="content-analytics"></div>
  <div class="content" id="content-settings"></div>
</div>`;
}

/**
 * 绑定全局 UI 事件
 */
function bindGlobalUI() {
  if (!shadowRoot) return;
  const $ = (id) => shadowRoot.getElementById(id);

  // FAB 切换面板
  $('fab')?.addEventListener('click', () => {
    panelVisible = !panelVisible;
    $('panel').classList.toggle('open', panelVisible);
    if (panelVisible) refreshCurrentTab();
  });

  // 关闭按钮
  $('panel-close')?.addEventListener('click', () => {
    panelVisible = false;
    $('panel').classList.remove('open');
  });

  // 最小化按钮
  $('panel-min')?.addEventListener('click', () => {
    panelVisible = false;
    $('panel').classList.remove('open');
  });

  // 标签切换
  shadowRoot.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      switchTab(tabId);
    });
  });
}

/**
 * 切换面板标签
 */
function switchTab(tabId) {
  if (!shadowRoot) return;
  currentTab = tabId;

  // 更新标签激活状态
  shadowRoot.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabId);
  });

  // 更新内容区显示
  shadowRoot.querySelectorAll('.content').forEach(c => {
    c.classList.toggle('active', c.id === `content-${tabId}`);
  });

  refreshCurrentTab();
}

/**
 * 刷新当前标签页内容
 * @param {Object} state - 全局状态
 */
export async function refreshPanel(state = {}) {
  if (!shadowRoot || !panelVisible) return;

  // 刷新当前标签
  refreshCurrentTab(state);

  // 更新 FAB 角标
  const badge = shadowRoot.getElementById('badge');
  if (badge) {
    const count = (state.list || []).length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function refreshCurrentTab(state = {}) {
  if (!shadowRoot) return;

  const contentEl = shadowRoot.getElementById(`content-${currentTab}`);
  if (!contentEl) return;

  switch (currentTab) {
    case 'dashboard':
      contentEl.innerHTML = renderDashboard(state);
      initDashboard(shadowRoot, state, () => refreshPanel(state));
      break;
    case 'filter':
      contentEl.innerHTML = renderFilter(state);
      initFilter(shadowRoot, state, () => refreshPanel(state));
      break;
    case 'task':
      contentEl.innerHTML = renderTask(state);
      initTask(shadowRoot, state, () => refreshPanel(state));
      break;
    case 'analytics':
      contentEl.innerHTML = renderAnalytics(state);
      initAnalytics(shadowRoot, state, () => refreshPanel(state));
      break;
    case 'settings':
      contentEl.innerHTML = renderSettings(state);
      initSettings(shadowRoot, state, () => refreshPanel(state));
      break;
  }
}

/** 切换到指定面板 */
export function switchToTab(tabId) {
  if (!shadowRoot) return;
  switchTab(tabId);
  // 确保面板可见
  panelVisible = true;
  shadowRoot.getElementById('panel')?.classList.add('open');
}
