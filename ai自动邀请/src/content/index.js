// ============================================================
// 精选联盟达人邀约助手 v2.0 — 入口
// 模块化架构：拦截 → 标准化 → 存储 → UI 五面板
// 安全模块：操作模拟 / 定时调度 / 异常检测 / 请求监控
// ============================================================

import { sleep } from './utils.js';
import { installInterceptor } from './interceptor.js';
import { normalizeCreator } from './normalizer.js';
import { extractFromDOM } from './dom-utils.js';
import { getConfig, getBlacklist, getWhitelist, ensureDefaults } from './storage.js';
import { createUI, refreshPanel, shadowRoot, switchToTab } from './ui/index.js';
import { AnomalyDetector } from './anomaly-detector.js';
import { TaskScheduler } from './scheduler.js';
import { RequestMonitor } from './request-monitor.js';
import { HumanEmulator } from './human-emulator.js';

// ==================== 全局状态 ====================
const STATE = {
  seen: new Set(),        // 已拦截达人 ID 集合（去重）
  list: [],               // 达人列表
  filters: {},            // 当前筛选条件
  cfg: {},               // 存储配置缓存
  blacklist: [],          // 黑名单
  whitelist: [],          // 白名单
  taskState: { running: false, paused: false, ok: 0, ng: 0, sk: 0, pct: 0, status: '待启动' },
  // 安全模块状态
  anomalies: [],          // 当前活跃异常列表
  anomalyPaused: false,   // 异常导致的暂停
  schedulerEnabled: false,// 调度器是否启用
  schedulerInWindow: false,
  riskLevel: 'none',      // 风控等级: none/low/medium/high
};

// ==================== 安全模块实例 ====================
let anomalyDetector = null;
let taskScheduler = null;
let requestMonitor = null;
let humanEmulator = null;

// ==================== 异常处理 ====================

function onAnomalyDetected(event) {
  STATE.anomalies = anomalyDetector ? anomalyDetector.getAnomalies() : [event.type];
  STATE.anomalyPaused = true;

  // 如果正在运行邀约任务，强制暂停
  const detailStr = typeof event.detail === 'string' ? event.detail : JSON.stringify(event.detail || '');
  if (STATE.taskState.running) {
    STATE.taskState.paused = true;
    STATE.taskState.status = '⚠️ 异常暂停: ' + (detailStr || event.type);
  }

  console.warn('[达人邀约] 🚨 异常触发暂停:', event.type, detailStr);
  showAlertModal(event);
  refreshPanelUI();
}

function onAnomalyRecovery(event) {
  STATE.anomalies = anomalyDetector ? anomalyDetector.getAnomalies() : [];
  if (STATE.anomalies.length === 0) {
    STATE.anomalyPaused = false;
  }
  console.log('[达人邀约] ✅ 异常恢复:', event);
  refreshPanelUI();
}

function onWarning(event) {
  console.log('[达人邀约] ⚡ 警告:', event);
  // 警告级别不高，仅记录日志，不暂停
  refreshPanelUI();
}

function onRiskDetected(event) {
  STATE.riskLevel = requestMonitor ? requestMonitor.getRiskLevel() : 'medium';
  STATE.anomalyPaused = true;

  if (STATE.taskState.running) {
    STATE.taskState.paused = true;
    STATE.taskState.status = '⚠️ 风控拦截: ' + (event.message || '检测到风控响应');
  }

  console.warn('[达人邀约] 🛡 风控检测:', event);
  showAlertModal({ type: 'risk_detected', detail: event.message || '平台返回风控拦截' });
  refreshPanelUI();
}

function onRateLimit(event) {
  STATE.riskLevel = 'high';
  STATE.anomalyPaused = true;

  if (STATE.taskState.running) {
    STATE.taskState.paused = true;
    STATE.taskState.status = '⛔ 频率限制 — 立即暂停';
  }

  console.warn('[达人邀约] ⛔ 频率限制:', event);
  showAlertModal({ type: 'rate_limited', detail: '请求过于频繁，请等待后手动重试' });
  refreshPanelUI();
}

// ==================== 调度器回调 ====================

function onSchedulerWindowEnter(event) {
  STATE.schedulerInWindow = true;
  console.log('[达人邀约] ⏰ 进入执行时段');

  // 如果配置了自动启动，且没有异常，开始执行
  if (!STATE.anomalyPaused && !STATE.taskState.running) {
    // 自动触发邀约任务（通过模拟点击任务面板的启动按钮）
    autoStartScheduledTask();
  }
  refreshPanelUI();
}

function onSchedulerWindowExit(event) {
  STATE.schedulerInWindow = false;
  console.log('[达人邀约] ⏰ 离开执行时段:', event.reason);

  // 自动停止任务
  if (STATE.taskState.running) {
    STATE.taskState.aborted = true;
    STATE.taskState.running = false;
    STATE.taskState.status = '⏰ 时段结束，自动停止';
  }
  refreshPanelUI();
}

async function autoStartScheduledTask() {
  // 延迟一小段时间后尝试自动启动
  await sleep(2000);
  if (STATE.anomalyPaused || STATE.taskState.running) return;

  // 通知 UI 自动启动任务
  console.log('[达人邀约] 🤖 调度器自动启动邀约任务');
  // 通过刷新 UI 触发 task 面板的自动启动逻辑
  refreshPanelUI();
}

// ==================== 弹窗提醒 ====================

function showAlertModal(event) {
  if (!shadowRoot) return;

  const type = event.type || 'unknown';
  // 确保 detail 是字符串（可能是对象）
  const rawDetail = event.detail || '';
  const detail = typeof rawDetail === 'string' ? rawDetail : JSON.stringify(rawDetail);

  // 移除已有弹窗
  const existing = shadowRoot.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const iconMap = {
    'captcha_popup': '🤖',
    'page_navigation': '🔀',
    'rate_limited': '⛔',
    'access_denied': '🚫',
    'risk_detected': '🛡',
    'page_errors': '⚠️',
    'session_expired': '🔑',
    'page_unstable': '💥',
  };
  const icon = iconMap[type] || '⚠️';

  const titleMap = {
    'captcha_popup': '检测到验证弹窗',
    'page_navigation': '页面发生跳转',
    'rate_limited': '请求频率限制',
    'access_denied': '访问被拒绝',
    'risk_detected': '风控拦截警告',
    'page_errors': '页面出现错误提示',
    'session_expired': '登录已过期',
    'page_unstable': '页面加载不稳定',
  };
  const title = titleMap[type] || '检测到异常';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">${icon} ${title}</div>
      <div class="modal-body">
        <p>${detail || '自动化任务已自动暂停，请手动确认此问题后再继续。'}</p>
        <p style="margin-top:8px;font-size:11px;color:#94A3B8">
          时间: ${new Date().toLocaleTimeString()}<br>
          异常类型: ${type}
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" id="alert-resume">✅ 已手动处理，继续任务</button>
        <button class="btn btn-outline" id="alert-stop">⏹ 终止任务</button>
      </div>
    </div>
  `;
  shadowRoot.appendChild(overlay);

  overlay.querySelector('#alert-resume')?.addEventListener('click', () => {
    STATE.anomalyPaused = false;
    STATE.anomalies = [];
    STATE.riskLevel = 'none';
    if (STATE.taskState.paused) {
      STATE.taskState.paused = false;
      STATE.taskState.status = '▶ 继续执行';
    }
    overlay.remove();
    refreshPanelUI();
  });

  overlay.querySelector('#alert-stop')?.addEventListener('click', () => {
    STATE.taskState.aborted = true;
    STATE.taskState.running = false;
    STATE.taskState.status = '⏹ 已终止';
    overlay.remove();
    refreshPanelUI();
  });
}

// ==================== API 数据回调 ====================

function onCreatorData(rawCreators) {
  let added = 0;
  for (const c of rawCreators) {
    if (!c.id) continue;
    if (STATE.seen.has(String(c.id))) continue;
    STATE.seen.add(String(c.id));
    STATE.list.push(c);
    added++;
  }
  if (added) {
    console.log(`[达人邀约] 📡 +${added} 位达人 (总计 ${STATE.list.length})`);
    refreshPanelUI();
  }
}

/** 刷新面板 UI（包含新状态字段） */
async function refreshPanelUI() {
  const records = await chrome.storage.local.get('inviteRecords');
  const stats = await chrome.storage.local.get('stats');
  refreshPanel({
    list: STATE.list,
    filters: STATE.filters,
    blacklist: STATE.blacklist,
    whitelist: STATE.whitelist,
    cfg: STATE.cfg || {},
    taskState: STATE.taskState,
    inviteRecords: records.inviteRecords || [],
    stats: stats.stats || {},
    // 安全模块状态
    anomalies: STATE.anomalies,
    anomalyPaused: STATE.anomalyPaused,
    schedulerEnabled: STATE.schedulerEnabled,
    schedulerInWindow: STATE.schedulerInWindow,
    riskLevel: STATE.riskLevel,
  });
}

/** Flush DOM 提取缓冲 */
function flushDOM() {
  const results = extractFromDOM(STATE.seen);
  if (results.length) {
    for (const c of results) {
      STATE.seen.add(c.id);
      STATE.list.push(c);
    }
    console.log(`[达人邀约] 📋 DOM提取 +${results.length} (总计 ${STATE.list.length})`);
    refreshPanelUI();
  }
}

// ==================== 初始化 ====================
async function init() {
  // 1. 加载配置
  STATE.cfg = await ensureDefaults();
  STATE.blacklist = await getBlacklist();
  STATE.whitelist = await getWhitelist();
  console.log('[达人邀约] ✅ 配置已加载');

  // 2. 安装 API 拦截器
  installInterceptor(onCreatorData);

  // 3. 创建 UI
  let tries = 0;
  while (!createUI() && tries < 30) {
    await sleep(300);
    tries++;
  }
  console.log(`[达人邀约] ✅ UI 已创建 (重试 ${tries} 次)`);

  // 4. 初始化自然人操作模拟器
  humanEmulator = new HumanEmulator({ enabled: true });

  // 5. 初始化异常检测器
  anomalyDetector = new AnomalyDetector({
    onAnomaly: onAnomalyDetected,
    onWarning: onWarning,
    onRecovery: onAnomalyRecovery,
  });
  anomalyDetector.start();

  // 6. 初始化请求监控器
  requestMonitor = new RequestMonitor({
    onRiskDetected: onRiskDetected,
    onRateLimit: onRateLimit,
    onRequestError: (e) => console.warn('[达人邀约] 请求错误:', e),
  });
  requestMonitor.start();

  // 7. 初始化定时调度器
  const schedSettings = STATE.cfg.settings?.schedule || {};
  taskScheduler = new TaskScheduler({
    timeWindows: schedSettings.timeWindows || [],
    onWindowEnter: onSchedulerWindowEnter,
    onWindowExit: onSchedulerWindowExit,
    onTick: (tick) => { /* 安静 */ },
    isAnomaly: () => anomalyDetector ? anomalyDetector.hasAnomaly() : false,
  });
  if (schedSettings.enabled && schedSettings.timeWindows?.length) {
    STATE.schedulerEnabled = true;
    taskScheduler.start();
    console.log('[达人邀约] ⏰ 调度器已自动启动');
  }

  // 8. 监听存储变更
  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area !== 'local') return;
    if (changes.templates || changes.product || changes.settings) {
      STATE.cfg = await getConfig();
      // 更新调度器
      const schedSettings = STATE.cfg.settings?.schedule || {};
      if (taskScheduler) {
        taskScheduler.setTimeWindows(schedSettings.timeWindows || []);
        if (schedSettings.enabled && schedSettings.timeWindows?.length && !STATE.schedulerEnabled) {
          STATE.schedulerEnabled = true;
          taskScheduler.start();
        } else if (!schedSettings.enabled && STATE.schedulerEnabled) {
          STATE.schedulerEnabled = false;
          taskScheduler.stop();
        }
      }
    }
    if (changes.blacklist) STATE.blacklist = await getBlacklist();
    if (changes.whitelist) STATE.whitelist = await getWhitelist();
    refreshPanelUI();
  });

  // 9. 定时刷新：清空 API 缓冲 + DOM 回退
  setInterval(() => {
    flushDOM();
  }, 3000);

  // 10. 立即 DOM 提取
  flushDOM();

  // 11. 初始渲染
  refreshPanelUI();

  // 12. 监听 popup 消息
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'OPEN_PANEL') {
      switchToTab('dashboard');
      sendResponse({ ok: true });
    } else if (msg.action === 'REFRESH') {
      refreshPanelUI();
      sendResponse({ ok: true });
    }
    return true;
  });

  // 导出供 task 面板使用
  window.__daren_state = STATE;
  window.__daren_anomaly = () => anomalyDetector;
  window.__daren_emu = () => humanEmulator;
  window.__daren_scheduler = () => taskScheduler;
  window.__daren_monitor = () => requestMonitor;

  console.log('[达人邀约] ✅ 初始化完成 — 精选联盟达人邀约助手 v2.0');
}

/** 启动入口 */
function boot() {
  if (!document.body) {
    setTimeout(boot, 300);
    return;
  }
  init().catch(e => console.error('[达人邀约] 初始化失败:', e));
}

boot();
