// ============================================================
// 达人筛选 & 任务配置页（所有条件集中在一个页面）
// ============================================================

import { matchesFilter, classifyTier, TIER_COLORS } from '../normalizer.js';
import { batchInvite, pickTemplate, renderTemplate } from '../inviter.js';
import { creatorCard, emptyState, showPanelToast } from './components.js';
import { fmtNum, escHtml, debounce, fmtDateTime } from '../utils.js';
import { addToBlacklist, addToWhitelist, getBlacklist, getWhitelist, addInviteRecord } from '../storage.js';
import { HumanEmulator } from '../human-emulator.js';
import { extractCategoriesFromDOM } from '../dom-utils.js';

/**
 * 渲染合并后的筛选+配置页
 */
export function renderFilter(data = {}) {
  const {
    list = [], filters = {}, blacklist = [], whitelist = [],
    cfg = {}, anomalyPaused = false,
    schedulerEnabled = false, schedulerInWindow = false, riskLevel = 'none',
    taskState = {},
  } = data;

  const product = cfg?.product || {};
  const settings = cfg?.settings || {};
  const templates = cfg?.templates || [];
  const enabledTpls = templates.filter(t => t.enabled !== false);
  const { running = false } = taskState;

  // 应用筛选
  const filtered = list.filter(c => matchesFilter(c, filters));

  return `
    <!-- ========== 安全状态条 ========== -->
    ${renderSafetyMini(anomalyPaused, schedulerEnabled, schedulerInWindow, riskLevel)}

    <!-- ========== 商品信息（话术变量来源） ========== -->
    <div class="section" id="sec-product" style="${product.name ? '' : 'display:none'}">
      <div class="section-title">📦 商品信息 <button class="btn btn-ghost btn-sm" id="toggle-product" style="font-size:11px">${product.name ? '展开' : '+ 设置'}</button></div>
      <div id="product-fields" style="display:none">
        <div class="frm-row">
          <div class="frm-group"><label class="frm-label">商品名</label><input class="frm-input" id="qp-name" value="${escHtml(product.name || '')}" placeholder="{商品名}"></div>
          <div class="frm-group"><label class="frm-label">佣金率</label><input class="frm-input" id="qp-rate" value="${escHtml(product.commissionRate || '')}" placeholder="{佣金比例} 如20%"></div>
        </div>
        <div class="frm-row">
          <div class="frm-group"><label class="frm-label">店铺名</label><input class="frm-input" id="qp-shop" value="${escHtml(product.shopName || '')}" placeholder="{店铺名}"></div>
          <div class="frm-group"><label class="frm-label">类目</label><input class="frm-input" id="qp-cat" value="${escHtml(product.category || '')}" placeholder="{类目}"></div>
        </div>
        <div class="frm-row">
          <div class="frm-group"><label class="frm-label">产品链接</label><input class="frm-input" id="qp-link" value="${escHtml(product.link || '')}" placeholder="{产品链接}"></div>
          <div class="frm-group"><label class="frm-label">福利政策</label><input class="frm-input" id="qp-benefit" value="${escHtml(product.benefit || '')}" placeholder="{福利政策} 如:前10单额外奖"></div>
        </div>
        <button class="btn btn-primary btn-sm" id="qp-save-product" style="margin-top:6px">💾 保存</button>
      </div>
    </div>

    <!-- ========== 达人筛选条件 ========== -->
    <div class="section">
      <div class="section-title" style="justify-content:space-between">
        <span>🔍 达人筛选条件</span>
        <button class="btn btn-ghost btn-sm" id="toggle-adv-filter">${hasActiveFilters(filters) ? '⚙️ 修改筛选' : '⚙️ 高级筛选'}</button>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <input class="frm-input" id="filter-search" placeholder="🔍 搜索达人昵称..." value="${escHtml(filters.keyword || '')}">
      </div>

      <!-- 筛选标签 -->
      <div class="filter-tags" id="active-tags">${renderActiveTags(filters)}</div>

      <!-- 高级筛选表单 -->
      <div id="filter-form" style="display:none;margin-bottom:10px;padding:12px;background:#F8FAFC;border-radius:8px;border:1px solid #E2E8F0">
        <div class="frm-row">
          <div class="frm-group"><label class="frm-label">粉丝下限</label>
            <select class="frm-select" id="ff-fansMin">
              <option value="">不限</option><option value="1000">1千</option><option value="10000">1万</option><option value="50000">5万</option><option value="100000">10万</option><option value="500000">50万</option><option value="1000000">100万</option>
            </select></div>
          <div class="frm-group"><label class="frm-label">粉丝上限</label>
            <select class="frm-select" id="ff-fansMax">
              <option value="">不限</option><option value="10000">1万</option><option value="100000">10万</option><option value="500000">50万</option><option value="1000000">100万</option><option value="5000000">500万</option>
            </select></div>
        </div>
        <div class="frm-row">
          <div class="frm-group"><label class="frm-label">近30天结算GMV下限</label><input class="frm-input" id="ff-salesMin" type="number" placeholder="如 100000" value="${filters.salesMin || ''}"></div>
          <div class="frm-group"><label class="frm-label">近30天结算GMV上限</label><input class="frm-input" id="ff-salesMax" type="number" placeholder="如 1000000" value="${filters.salesMax || ''}"></div>
        </div>
        <div class="frm-row">
          <div class="frm-group"><label class="frm-label">最低口碑分</label><input class="frm-input" id="ff-scoreMin" type="number" step="0.1" value="${filters.scoreMin || ''}"></div>
          <div class="frm-group"><label class="frm-label">佣金率下限(%)</label><input class="frm-input" id="ff-commissionMin" type="number" value="${filters.commissionMin || ''}"></div>
        </div>
        <div class="frm-row">
          <div class="frm-group"><label class="frm-label">类目 (${getCategoryOptions(list).length > 0 ? getCategoryOptions(list).length + '个可选' : '浏览达人广场后自动填充'})</label>
            <select class="frm-select" id="ff-category">
              <option value="">不限</option>
              ${getCategoryOptions(list).length === 0
                ? `<option disabled>— 请先在达人广场浏览达人 —</option>`
                : getCategoryOptions(list).map(cat => `<option value="${escHtml(cat)}" ${filters.category===cat?'selected':''}>${escHtml(cat)}</option>`).join('')}
            </select></div>
          <div class="frm-group"><label class="frm-label">达人分层</label>
            <select class="frm-select" id="ff-tier"><option value="">全部</option><option value="头部">头部</option><option value="中腰部">中腰部</option><option value="素人">素人</option><option value="置换">置换</option></select></div>
        </div>
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;margin-top:6px">
          <input type="checkbox" id="ff-pureCommission" ${filters.pureCommissionOnly?'checked':''}> 仅纯佣金达人
        </label>
        <div class="btn-group" style="margin-top:8px">
          <button class="btn btn-primary btn-sm" id="filter-apply">✅ 应用</button>
          <button class="btn btn-outline btn-sm" id="filter-reset">🔄 重置</button>
        </div>
      </div>
    </div>

    <!-- ========== 邀约任务配置（合并到这里） ========== -->
    <div class="section">
      <div class="section-title">🚀 邀约任务配置</div>
      <div class="frm-row">
        <div class="frm-group"><label class="frm-label">目标人数 (0=全部)</label><input class="frm-input" id="task-target" type="number" value="0"></div>
        <div class="frm-group"><label class="frm-label">话术分组</label>
          <select class="frm-select" id="task-tpl-group">
            <option value="">全部 (${enabledTpls.length}个可用)</option>
            ${renderGroupOptions(templates)}
          </select></div>
      </div>
      <!-- 模板预览区（随分组选择变化） -->
      <div id="tpl-preview" style="margin-top:8px">${renderTplPreview(templates, '')}</div>
      <div class="frm-row" style="margin-top:8px">
        <div class="frm-group"><label class="frm-label">最小间隔(秒)</label><input class="frm-input" id="task-dlyMin" type="number" value="${settings.delayMin ? Math.round(settings.delayMin/1000) : 3}"></div>
        <div class="frm-group"><label class="frm-label">最大间隔(秒)</label><input class="frm-input" id="task-dlyMax" type="number" value="${settings.delayMax ? Math.round(settings.delayMax/1000) : 6}"></div>
      </div>
      <div class="frm-hint">随机间隔 + 自然人节奏，建议≥3秒</div>
    </div>

    <!-- ========== 达人列表 ========== -->
    <div class="section">
      <div class="section-title" style="justify-content:space-between">
        <span>📋 达人列表</span>
        <span style="font-size:12px;color:var(--text-secondary)">${filtered.length} / ${list.length} 位</span>
      </div>
      <div class="toolbar">
        <div class="btn-group">
          <button class="btn btn-ghost btn-sm" id="sel-all">☑ 全选</button>
          <button class="btn btn-ghost btn-sm" id="sel-none">☐ 取消</button>
          <button class="btn btn-outline btn-sm" id="sel-blacklist">🚫 黑名单</button>
          <button class="btn btn-outline btn-sm" id="sel-whitelist">⭐ 白名单</button>
        </div>
      </div>
      <div class="creator-cards" id="creator-cards" style="max-height:250px;overflow-y:auto">
        ${filtered.length ? filtered.map(c => creatorCard(c)).join('') : emptyState('🔍', list.length ? '无匹配结果' : '等待达人数据...浏览精选联盟达人广场获取')}
      </div>
    </div>

    <!-- ========== 执行按钮 ========== -->
    <div style="padding:8px 0 16px">
      ${running
        ? `<div style="text-align:center;color:var(--primary);font-weight:600">▶ 任务运行中 — 前往「邀约任务」面板查看进度</div>`
        : `<button class="btn btn-primary btn-block" id="filter-start" style="padding:14px;font-size:15px" ${anomalyPaused ? 'disabled' : ''}>
            ${anomalyPaused ? '⚠️ 异常待处理' : '🚀 开始批量邀约'}
          </button>`
      }
      <div id="filter-start-msg" style="text-align:center;margin-top:6px;font-size:12px;color:var(--text-secondary)"></div>
    </div>
  `;
}

/** 精简安全状态条 */
function renderSafetyMini(anomalyPaused, schedulerEnabled, schedulerInWindow, riskLevel) {
  if (!anomalyPaused && !schedulerEnabled && riskLevel === 'none') return '';
  const riskColors = { none: '#10B981', low: '#F59E0B', medium: '#F97316', high: '#EF4444' };
  const riskLabels = { none: '正常', low: '低', medium: '中', high: '高' };
  return `<div style="display:flex;gap:8px;margin-bottom:10px">
    ${schedulerEnabled ? `<span class="tag ${schedulerInWindow?'tag-green':'tag-gray'}" style="font-size:11px">⏰ ${schedulerInWindow?'窗口内':'等待'}</span>` : ''}
    <span class="tag" style="font-size:11px;background:${riskColors[riskLevel]}20;color:${riskColors[riskLevel]}">🛡 ${riskLabels[riskLevel]}</span>
    ${anomalyPaused ? '<span class="tag tag-red" style="font-size:11px">🚨 异常</span>' : ''}
  </div>`;
}

/** 渲染活跃筛选标签 */
function renderActiveTags(filters) {
  if (!filters || !hasActiveFilters(filters)) return '<span style="font-size:11px;color:var(--text-muted)">无筛选条件（显示全部）</span>';
  const tags = [];
  if (filters.keyword) tags.push({ label: `搜索: ${filters.keyword}`, key: 'keyword' });
  if (filters.fansMin) tags.push({ label: `粉丝≥${fmtNum(filters.fansMin)}`, key: 'fansMin' });
  if (filters.salesMin) tags.push({ label: `近30天GMV≥${fmtNum(filters.salesMin)}`, key: 'salesMin' });
  if (filters.scoreMin) tags.push({ label: `口碑≥${filters.scoreMin}`, key: 'scoreMin' });
  if (filters.tier) tags.push({ label: filters.tier, key: 'tier' });
  if (filters.pureCommissionOnly) tags.push({ label: '纯佣', key: 'pureCommissionOnly' });
  return tags.map(t => `<span class="filter-tag">${escHtml(t.label)} <span class="remove" data-key="${t.key}">×</span></span>`).join('');
}

function hasActiveFilters(filters) {
  if (!filters) return false;
  return !!(filters.keyword || filters.fansMin || filters.fansMax || filters.salesMin || filters.salesMax || filters.scoreMin || filters.commissionMin || filters.tier || filters.pureCommissionOnly);
}

// ==================== 事件初始化 ====================

export function initFilter(root, state, refreshUI) {
  const $ = (id) => root.getElementById(id);

  // ---- 商品信息折叠 ----
  $('toggle-product')?.addEventListener('click', () => {
    const fields = $('product-fields');
    fields.style.display = fields.style.display === 'none' ? 'block' : 'none';
  });
  $('qp-save-product')?.addEventListener('click', async () => {
    const product = {
      name: $('qp-name')?.value || '',
      commissionRate: $('qp-rate')?.value || '',
      shopName: $('qp-shop')?.value || '',
      category: $('qp-cat')?.value || '',
      link: $('qp-link')?.value || '',
      benefit: $('qp-benefit')?.value || '',
    };
    state.cfg.product = product;
    await chrome.storage.local.set({ product });
    showPanelToast(root, '✅ 商品信息已保存', 'success');
  });

  // ---- 高级筛选切换 ----
  $('toggle-adv-filter')?.addEventListener('click', () => {
    const form = $('filter-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  });
  if (hasActiveFilters(state.filters || {})) {
    // 如果有活跃筛选，默认展开高级筛选
    const form = $('filter-form');
    if (form) form.style.display = 'block';
  }

  // ---- 搜索（防抖） ----
  $('filter-search')?.addEventListener('input', debounce(() => {
    state.filters.keyword = $('filter-search')?.value || undefined;
    refreshUI();
  }, 400));

  // ---- 应用筛选 ----
  $('filter-apply')?.addEventListener('click', () => {
    state.filters = {
      ...state.filters,
      fansMin: $('ff-fansMin')?.value ? +$('ff-fansMin').value : undefined,
      fansMax: $('ff-fansMax')?.value ? +$('ff-fansMax').value : undefined,
      salesMin: $('ff-salesMin')?.value ? +$('ff-salesMin').value : undefined,
      salesMax: $('ff-salesMax')?.value ? +$('ff-salesMax').value : undefined,
      scoreMin: $('ff-scoreMin')?.value ? +$('ff-scoreMin').value : undefined,
      commissionMin: $('ff-commissionMin')?.value ? +$('ff-commissionMin').value : undefined,
      category: $('ff-category')?.value || undefined,
      tier: $('ff-tier')?.value || undefined,
      pureCommissionOnly: $('ff-pureCommission')?.checked || undefined,
    };
    refreshUI();
    showPanelToast(root, '✅ 筛选已应用', 'success');
  });

  // ---- 重置 ----
  $('filter-reset')?.addEventListener('click', () => {
    state.filters = {};
    refreshUI();
  });

  // ---- 话术分组切换 → 实时更新模板预览 ----
  $('task-tpl-group')?.addEventListener('change', () => {
    const group = $('task-tpl-group')?.value || '';
    const previewEl = $('tpl-preview');
    if (previewEl) {
      previewEl.innerHTML = renderTplPreview(state.cfg?.templates || [], group);
      // 重新绑定"管理模板"链接
      bindTplManageLink(root);
    }
  });

  // ---- "管理模板"链接 → 跳转设置页 ----
  bindTplManageLink(root);

  // ---- 移除筛选标签 ----
  $('active-tags')?.addEventListener('click', (e) => {
    const remove = e.target.closest('.remove');
    if (!remove) return;
    delete state.filters[remove.dataset.key];
    refreshUI();
  });

  // ---- 全选/取消 ----
  $('sel-all')?.addEventListener('click', () => root.querySelectorAll('.creator-card').forEach(c => c.classList.add('sel')));
  $('sel-none')?.addEventListener('click', () => root.querySelectorAll('.creator-card').forEach(c => c.classList.remove('sel')));

  // ---- 卡片点击切换 ----
  $('creator-cards')?.addEventListener('click', (e) => {
    const card = e.target.closest('.creator-card');
    if (card) card.classList.toggle('sel');
  });

  // ---- 黑名单 ----
  $('sel-blacklist')?.addEventListener('click', async () => {
    const ids = getSelectedIds(root);
    if (!ids.length) { showPanelToast(root, '请先选择达人', 'info'); return; }
    for (const id of ids) await addToBlacklist(id);
    state.blacklist = await getBlacklist();
    showPanelToast(root, `🚫 ${ids.length} 位已加黑名单`, 'success');
    refreshUI();
  });

  // ---- 白名单 ----
  $('sel-whitelist')?.addEventListener('click', async () => {
    const ids = getSelectedIds(root);
    if (!ids.length) { showPanelToast(root, '请先选择达人', 'info'); return; }
    for (const id of ids) await addToWhitelist(id);
    state.whitelist = await getWhitelist();
    showPanelToast(root, `⭐ ${ids.length} 位已加白名单`, 'success');
    refreshUI();
  });

  // ======== 开始邀约（主按钮） ========
  $('filter-start')?.addEventListener('click', async () => {
    const anomalyDetector = window.__daren_anomaly?.();
    const humanEmulator = window.__daren_emu?.();

    if (anomalyDetector?.hasAnomaly()) {
      showPanelToast(root, '⚠️ 检测到异常，请先处理', 'error');
      return;
    }

    const target = +($('task-target')?.value || 0);
    const dlyMin = (+($('task-dlyMin')?.value || 3)) * 1000;
    const dlyMax = (+($('task-dlyMax')?.value || 6)) * 1000;
    const tplGroup = $('task-tpl-group')?.value || '';

    // 保存延迟设置
    const settings = { ...state.cfg?.settings, delayMin: dlyMin, delayMax: dlyMax };
    state.cfg.settings = settings;
    await chrome.storage.local.set({ settings });

    // 构建队列
    const blackSet = new Set((state.blacklist || []).map(String));
    let queue = state.list.filter(c => {
      if (blackSet.has(String(c.id))) return false;
      return matchesFilter(c, state.filters || {});
    });

    const whiteSet = new Set((state.whitelist || []).map(String));
    queue.sort((a, b) => (whiteSet.has(String(a.id)) ? 0 : 1) - (whiteSet.has(String(b.id)) ? 0 : 1));

    if (!queue.length) {
      showPanelToast(root, '无可用达人', 'error');
      return;
    }

    let templates = state.cfg?.templates || [];
    if (tplGroup) templates = templates.filter(t => t.group === tplGroup);

    if (humanEmulator) humanEmulator.reset();

    // 设置运行状态
    state.taskState = { running: true, paused: false, ok: 0, ng: 0, sk: 0, pct: 0, status: '运行中' };
    refreshUI();

    const msgEl = $('filter-start-msg');
    if (msgEl) msgEl.textContent = `🚀 正在邀约... 队列: ${queue.length} 位`;

    const result = await batchInvite({
      queue, target, templates,
      product: state.cfg?.product || {},
      dlyMin, dlyMax,
      emulator: humanEmulator || undefined,
      onProgress: (pct, ok, ng) => {
        state.taskState.pct = pct;
        state.taskState.ok = ok;
        state.taskState.ng = ng;
        if (msgEl) msgEl.textContent = `进度 ${pct}% | ✅${ok} ❌${ng}`;
      },
      onStatus: (s) => {
        state.taskState.status = s;
        if (msgEl) msgEl.textContent = s;
      },
      onLog: (record) => {
        addInviteRecord(record);
        chrome.runtime.sendMessage({ action: 'LOG', record });
      },
      isAborted: () => state.taskState.aborted || false,
      hasAnomaly: () => anomalyDetector ? anomalyDetector.hasAnomaly() : false,
      blacklist: state.blacklist || [],
    });

    state.taskState = { running: false, paused: false, ok: result.ok, ng: result.ng, sk: result.sk, pct: 100, status: result.msg };
    if (msgEl) msgEl.textContent = result.msg;
    refreshUI();
  });
}

function getSelectedIds(root) {
  return [...root.querySelectorAll('.creator-card.sel')].map(c => c.dataset.id);
}

/** 绑定"管理模板"链接 → 跳转设置页 */
function bindTplManageLink(root) {
  root.querySelector('#tpl-goto-settings')?.addEventListener('click', (e) => {
    e.preventDefault();
    const settingsTab = root.querySelector('.tab[data-tab="settings"]');
    if (settingsTab) settingsTab.click();
  });
}

/** 从达人列表 + 页面DOM 合并提取唯一类目 */
function getCategoryOptions(list) {
  const cats = new Set();

  // 源1: 达人数据中的类目字段
  for (const c of list) {
    const raw = c.category || '';
    if (!raw) continue;
    raw.split(/[,，、/]+/).forEach(part => {
      const trimmed = part.trim();
      if (trimmed && trimmed.length > 1) cats.add(trimmed);
    });
  }

  // 源2: 页面 DOM 中的类目标签/筛选按钮
  try {
    const domCats = extractCategoriesFromDOM();
    domCats.forEach(c => cats.add(c));
  } catch (e) { /* DOM 提取失败不影响 */ }

  return [...cats].sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

/** 渲染分组下拉选项（每个分组显示模板数量） */
function renderGroupOptions(templates) {
  const groups = ['通用', '高佣', '纯佣', '置换'];
  return groups.map(g => {
    const count = templates.filter(t => t.group === g && t.enabled !== false).length;
    const total = templates.filter(t => t.group === g).length;
    return `<option value="${g}">${g} (${count}/${total}个)</option>`;
  }).join('');
}

/** 渲染模板预览卡片 */
function renderTplPreview(templates, selectedGroup) {
  let pool = templates.filter(t => t.enabled !== false);
  if (selectedGroup) pool = pool.filter(t => t.group === selectedGroup);

  if (!pool.length) {
    return `<div style="font-size:11px;color:var(--text-muted);padding:6px 0">
      ${selectedGroup ? `「${selectedGroup}」分组无可用模板 — ` : '无可用模板 — '}
      <a href="#" id="tpl-goto-settings" style="color:var(--primary);cursor:pointer">去设置页管理</a>
    </div>`;
  }

  const groupBadge = selectedGroup
    ? `<span class="tag tag-blue" style="font-size:10px;margin-right:4px">${selectedGroup}</span>`
    : '';

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <span style="font-size:11px;color:var(--text-secondary)">
        ${groupBadge}随机从 <b>${pool.length}</b> 条中选取:
      </span>
      <a href="#" id="tpl-goto-settings" style="font-size:11px;color:var(--primary);cursor:pointer">⚙️ 管理模板</a>
    </div>
    <div style="max-height:80px;overflow-y:auto;border:1px solid var(--border);border-radius:6px;padding:4px">
      ${pool.slice(0, 5).map(t => `
        <div style="font-size:11px;padding:3px 6px;border-bottom:1px solid #F1F5F9;display:flex;align-items:center;gap:6px">
          <span style="color:${t.enabled===false?'#94A3B8':'var(--text)'};flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            ${t.enabled===false?'<s>'+escHtml(t.content.slice(0,50))+'</s>':escHtml(t.content.slice(0,50))}
          </span>
          <span class="tag" style="font-size:9px;background:${t.enabled===false?'#FEE2E2':'#D1FAE5'};color:${t.enabled===false?'#991B1B':'#065F46'}">${t.enabled===false?'停':'启'}</span>
        </div>
      `).join('')}
      ${pool.length > 5 ? `<div style="font-size:10px;color:var(--text-muted);text-align:center;padding:2px">...还有 ${pool.length - 5} 条</div>` : ''}
    </div>
  `;
}
