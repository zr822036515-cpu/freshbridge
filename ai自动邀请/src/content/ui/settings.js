// ==================== 系统设置面板 ====================

import { escHtml } from '../utils.js';
import { getBlacklist, getWhitelist, removeFromBlacklist, removeFromWhitelist, addToBlacklist, addToWhitelist, clearAllData, exportAllData, importData } from '../storage.js';
import { showPanelToast } from './components.js';

/**
 * 渲染设置面板
 */
export function renderSettings(data = {}) {
  const cfg = data.cfg || {};
  const templates = cfg.templates || [];
  const settings = cfg.settings || {};
  const blacklist = data.blacklist || [];
  const whitelist = data.whitelist || [];
  const schedule = settings.schedule || {};
  const timeWindows = schedule.timeWindows || [];

  return `
    <!-- 话术模板管理 -->
    <div class="section">
      <div class="section-title">💬 话术模板 (${templates.length})</div>
      <div id="tpl-list">${renderTemplateList(templates)}</div>
      <div class="btn-group" style="margin-top:8px">
        <button class="btn btn-outline btn-sm" id="set-add-tpl">+ 添加模板</button>
        <button class="btn btn-primary btn-sm" id="set-save-tpl">💾 保存模板</button>
      </div>
      <div class="frm-hint" style="margin-top:8px">
        可用变量: <code>{达人昵称}</code> <code>{商品名}</code> <code>{佣金比例}</code> <code>{产品链接}</code> <code>{类目}</code> <code>{店铺名}</code> <code>{福利政策}</code>
      </div>
    </div>

    <!-- 黑白名单 -->
    <div class="section">
      <div class="section-title">🚫 黑白名单管理</div>
      <div class="frm-row">
        <div class="frm-group">
          <label class="frm-label">黑名单 (${blacklist.length} 位) <span style="color:#94A3B8;font-weight:400">— 永不邀约</span></label>
          <div style="max-height:120px;overflow-y:auto;border:1px solid #E2E8F0;border-radius:6px;padding:8px">
            ${blacklist.length
              ? blacklist.map(id => `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;font-size:12px">
                  <span>🆔 ${escHtml(String(id).slice(0, 16))}...</span>
                  <button class="btn btn-ghost btn-sm remove-blacklist" data-id="${escHtml(id)}">✕</button>
                </div>`).join('')
              : '<span style="font-size:12px;color:#94A3B8">空</span>'}
          </div>
          <div class="frm-hint">在达人筛选中选中达人后，可批量加入黑名单</div>
        </div>
        <div class="frm-group">
          <label class="frm-label">白名单 (${whitelist.length} 位) <span style="color:#94A3B8;font-weight:400">— 优先邀约</span></label>
          <div style="max-height:120px;overflow-y:auto;border:1px solid #E2E8F0;border-radius:6px;padding:8px">
            ${whitelist.length
              ? whitelist.map(id => `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;font-size:12px">
                  <span>⭐ ${escHtml(String(id).slice(0, 16))}...</span>
                  <button class="btn btn-ghost btn-sm remove-whitelist" data-id="${escHtml(id)}">✕</button>
                </div>`).join('')
              : '<span style="font-size:12px;color:#94A3B8">空</span>'}
          </div>
          <div class="frm-hint">白名单达人优先排在邀约队列前面</div>
        </div>
      </div>
    </div>

    <!-- 定时调度设置 -->
    <div class="section">
      <div class="section-title">⏰ 定时调度</div>
      <div class="frm-hint" style="margin-bottom:8px">设置可执行时段，插件仅在时段内自动运行。异常时自动终止。留空则不启用。</div>
      <label style="display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:12px;cursor:pointer">
        <input type="checkbox" id="set-sched-enabled" ${schedule.enabled ? 'checked' : ''}>
        启用定时调度
      </label>
      <div id="sched-windows">
        ${renderTimeWindows(timeWindows)}
      </div>
      <button class="btn btn-outline btn-sm" id="set-add-window">+ 添加时段</button>
      <button class="btn btn-primary btn-sm" id="set-save-schedule" style="margin-left:6px">💾 保存调度</button>
      <div class="frm-hint" style="margin-top:6px">
        ⚠️ 调度器仅在无异常状态下执行，遇到验证弹窗/风控拦截自动暂停
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="section">
      <div class="section-title">🗄 数据管理</div>
      <div class="btn-group">
        <button class="btn btn-outline btn-sm" id="set-backup">📤 备份数据</button>
        <button class="btn btn-outline btn-sm" id="set-restore-btn">📥 恢复数据</button>
        <button class="btn btn-danger btn-sm" id="set-clear">🗑 清空所有数据</button>
      </div>
      <input type="file" id="set-restore-file" accept=".json" style="display:none">
    </div>
  `;
}

/** 渲染时段窗口列表 */
function renderTimeWindows(windows) {
  if (!windows || !windows.length) {
    return '<div style="font-size:12px;color:#94A3B8;padding:8px;border:1px dashed #E2E8F0;border-radius:6px;text-align:center">暂无时段 — 点击"添加时段"按钮</div>';
  }
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  return windows.map((w, i) => `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;padding:8px;border:1px solid #E2E8F0;border-radius:6px;background:#F8FAFC">
      <span style="font-size:12px;font-weight:600;color:#64748B">#${i + 1}</span>
      <input class="sched-start" value="${escHtml(w.start || '02:00')}" placeholder="开始" style="width:65px;font-size:12px;padding:4px;border:1px solid #E2E8F0;border-radius:4px" data-idx="${i}">
      <span style="color:#94A3B8">—</span>
      <input class="sched-end" value="${escHtml(w.end || '06:00')}" placeholder="结束" style="width:65px;font-size:12px;padding:4px;border:1px solid #E2E8F0;border-radius:4px" data-idx="${i}">
      <div style="display:flex;gap:4px;flex-wrap:wrap">
        ${dayNames.map((d, di) => `<label style="font-size:10px;cursor:pointer;display:flex;align-items:center;gap:1px">
          <input type="checkbox" class="sched-day" data-idx="${i}" value="${di}" ${w.days?.includes(di) ? 'checked' : ''}>${d}
        </label>`).join('')}
      </div>
      <button class="btn btn-sm sched-del" data-idx="${i}" style="font-size:11px;padding:2px 6px;background:#FEE2E2;color:#991B1B;border:none;border-radius:3px">✕</button>
    </div>
  `).join('');
}

function renderTemplateList(templates) {
  if (!templates.length) return '<div style="font-size:12px;color:#94A3B8;padding:8px">暂无模板</div>';
  return templates.map((t, i) => renderOneTemplate(t, i)).join('');
}

/** 渲染单个模板项（innerHTML 版本，用于初始渲染） */
function renderOneTemplate(t, i) {
  return `
    <div class="tpl-item" data-idx="${i}" style="display:flex;gap:8px;margin-bottom:8px;padding:8px;border:1px solid #E2E8F0;border-radius:6px;background:${t.enabled===false?'#F8FAFC':'#fff'}">
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <input class="tpl-content" value="${escHtml(t.content)}" style="flex:1;font-size:12px;padding:5px;border:1px solid #E2E8F0;border-radius:4px" data-idx="${i}">
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <input class="tpl-name" value="${escHtml(t.name || '')}" placeholder="模板名称" style="width:100px;font-size:11px;padding:3px 6px;border:1px solid #E2E8F0;border-radius:3px" data-idx="${i}">
          <select class="tpl-group" data-idx="${i}" style="font-size:11px;padding:3px;border:1px solid #E2E8F0;border-radius:3px">
            <option value="通用" ${t.group==='通用'?'selected':''}>通用</option>
            <option value="高佣" ${t.group==='高佣'?'selected':''}>高佣</option>
            <option value="纯佣" ${t.group==='纯佣'?'selected':''}>纯佣</option>
            <option value="置换" ${t.group==='置换'?'selected':''}>置换</option>
          </select>
          <button class="btn btn-sm tpl-toggle" data-idx="${i}" style="font-size:11px;padding:2px 8px;background:${t.enabled===false?'#FEE2E2':'#D1FAE5'};color:${t.enabled===false?'#991B1B':'#065F46'};border:none;border-radius:3px">${t.enabled===false?'停用':'启用'}</button>
          <button class="btn btn-sm tpl-del" data-idx="${i}" style="font-size:11px;padding:2px 8px;background:#FEE2E2;color:#991B1B;border:none;border-radius:3px">删</button>
        </div>
      </div>
    </div>
  `;
}

/** 用 createElement 构建单个模板 DOM（零 HTML 解析，即时响应） */
function buildTplElement(t, i) {
  const bg = t.enabled === false ? '#F8FAFC' : '#fff';
  const item = el('div', { class: 'tpl-item', 'data-idx': i, style: `display:flex;gap:8px;margin-bottom:8px;padding:8px;border:1px solid #E2E8F0;border-radius:6px;background:${bg}` });

  const flex1 = el('div', { style: 'flex:1' });

  // 内容行
  const row1 = el('div', { style: 'display:flex;align-items:center;gap:6px;margin-bottom:4px' });
  const contentInput = el('input', { class: 'tpl-content', 'data-idx': i, style: 'flex:1;font-size:12px;padding:5px;border:1px solid #E2E8F0;border-radius:4px' });
  contentInput.value = t.content || '';
  row1.appendChild(contentInput);
  flex1.appendChild(row1);

  // 配置行
  const row2 = el('div', { style: 'display:flex;align-items:center;gap:8px' });
  const nameInput = el('input', { class: 'tpl-name', 'data-idx': i, placeholder: '模板名称', style: 'width:100px;font-size:11px;padding:3px 6px;border:1px solid #E2E8F0;border-radius:3px' });
  nameInput.value = t.name || '';

  const groupSel = el('select', { class: 'tpl-group', 'data-idx': i, style: 'font-size:11px;padding:3px;border:1px solid #E2E8F0;border-radius:3px' });
  ['通用', '高佣', '纯佣', '置换'].forEach(g => {
    const opt = el('option', { value: g });
    opt.textContent = g;
    if (t.group === g) opt.selected = true;
    groupSel.appendChild(opt);
  });

  const enabled = t.enabled !== false;
  const toggleBtn = el('button', { class: 'btn btn-sm tpl-toggle', 'data-idx': i, style: `font-size:11px;padding:2px 8px;background:${enabled?'#D1FAE5':'#FEE2E2'};color:${enabled?'#065F46':'#991B1B'};border:none;border-radius:3px` });
  toggleBtn.textContent = enabled ? '启用' : '停用';

  const delBtn = el('button', { class: 'btn btn-sm tpl-del', 'data-idx': i, style: 'font-size:11px;padding:2px 8px;background:#FEE2E2;color:#991B1B;border:none;border-radius:3px' });
  delBtn.textContent = '删';

  row2.appendChild(nameInput);
  row2.appendChild(groupSel);
  row2.appendChild(toggleBtn);
  row2.appendChild(delBtn);
  flex1.appendChild(row2);
  item.appendChild(flex1);
  return item;
}

/** 快捷创建元素 */
function el(tag, attrs = {}) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k === 'style') e.style.cssText = v;
    else e.setAttribute(k, String(v));
  }
  return e;
}

// 模块级 handler 引用，每次 initSettings 先移除旧的再绑定新的，防止叠加
let _tplClickHandler = null;
let _blacklistClickHandler = null;
let _schedClickHandler = null;

/**
 * 初始化设置面板事件
 */
export function initSettings(root, state, refreshUI) {
  // 移除旧的 root 级别监听器
  if (_tplClickHandler) root.removeEventListener('click', _tplClickHandler);
  if (_blacklistClickHandler) root.removeEventListener('click', _blacklistClickHandler);
  if (_schedClickHandler) root.removeEventListener('click', _schedClickHandler);

  const $ = (id) => root.getElementById(id);

  // 保存模板
  $('set-save-tpl')?.addEventListener('click', async () => {
    const items = root.querySelectorAll('.tpl-item');
    if (!items.length) {
      showPanelToast(root, '⚠️ 没有模板可保存，请先添加', 'error');
      return;
    }
    const templates = [];
    items.forEach((item, i) => {
      const content = item.querySelector('.tpl-content')?.value?.trim() || '';
      if (!content) return; // 跳过空内容
      const name = item.querySelector('.tpl-name')?.value?.trim() || '未命名';
      const group = item.querySelector('.tpl-group')?.value || '通用';
      const toggleBtn = item.querySelector('.tpl-toggle');
      const enabled = toggleBtn ? !toggleBtn.textContent.includes('停用') : true;
      const oldId = (state.cfg && state.cfg.templates && state.cfg.templates[i]) ? state.cfg.templates[i].id : null;
      templates.push({ id: oldId || 't' + Date.now() + i, name, group, content, enabled });
    });
    if (!templates.length) {
      showPanelToast(root, '⚠️ 没有有效模板（内容不能为空）', 'error');
      return;
    }
    await chrome.storage.local.set({ templates });
    if (!state.cfg) state.cfg = {};
    state.cfg.templates = templates;
    // 无需 refreshUI — DOM 和 state 已是最新
    showPanelToast(root, '✅ 已保存 ' + templates.length + ' 条模板', 'success');
  });

  // 添加模板 — createElement 直接构建 DOM，零 HTML 解析
  $('set-add-tpl')?.addEventListener('click', () => {
    const cfg = state.cfg || {};
    if (!cfg.templates) cfg.templates = [];
    const templates = cfg.templates;
    const idx = templates.length;
    const tpl = { id: 't' + Date.now(), name: '新模板', group: '通用', content: 'Hi {达人昵称}，【{商品名}】诚邀合作，佣金{佣金比例}%！', enabled: true };
    templates.push(tpl);

    const listEl = root.querySelector('#tpl-list');
    if (!listEl) return;

    // 纯 DOM 操作
    const item = buildTplElement(tpl, idx);
    listEl.appendChild(item);

    // 异步滚动和聚焦
    requestAnimationFrame(() => {
      item.scrollIntoView({ behavior: 'instant', block: 'center' });
      requestAnimationFrame(() => {
        const input = item.querySelector('.tpl-content');
        if (input) { input.focus(); input.select(); }
      });
    });

    // 更新标题
    const title = root.querySelector('.section-title');
    if (title) title.textContent = `💬 话术模板 (${templates.length})`;
  });

  // 模板列表事件委托 — 直接操作 DOM，不全量渲染
  root.addEventListener('click', _tplClickHandler = async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const idx = +btn.dataset.idx;
    if (isNaN(idx)) return;
    const templates = (state.cfg && state.cfg.templates) ? state.cfg.templates : [];

    if (btn.classList.contains('tpl-toggle')) {
      if (templates[idx]) {
        templates[idx].enabled = !templates[idx].enabled;
        const enabled = templates[idx].enabled;
        // 局部更新按钮样式
        btn.textContent = enabled ? '启用' : '停用';
        btn.style.background = enabled ? '#D1FAE5' : '#FEE2E2';
        btn.style.color = enabled ? '#065F46' : '#991B1B';
        // 更新行背景
        const item = btn.closest('.tpl-item');
        if (item) item.style.background = enabled ? '#fff' : '#F8FAFC';
        await chrome.storage.local.set({ templates });
      }
    }

    if (btn.classList.contains('tpl-del')) {
      templates.splice(idx, 1);
      // 移除 DOM 元素
      const item = btn.closest('.tpl-item');
      if (item) item.remove();
      // 重新编号后续元素
      const listEl = root.querySelector('#tpl-list');
      if (listEl) {
        listEl.querySelectorAll('.tpl-item').forEach((el, newIdx) => {
          el.dataset.idx = newIdx;
          el.querySelectorAll('[data-idx]').forEach(child => { child.dataset.idx = newIdx; });
        });
      }
      await chrome.storage.local.set({ templates });
      // 更新标题
      const title = root.querySelector('.section-title');
      if (title) title.innerHTML = `💬 话术模板 (${templates.length})`;
    }
  });

  // 黑白名单移除
  root.addEventListener('click', _blacklistClickHandler = async (e) => {
    if (e.target.classList.contains('remove-blacklist')) {
      await removeFromBlacklist(e.target.dataset.id);
      state.blacklist = await getBlacklist();
      refreshUI();
      showPanelToast(root, '✅ 已从黑名单移除', 'success');
    }
    if (e.target.classList.contains('remove-whitelist')) {
      await removeFromWhitelist(e.target.dataset.id);
      state.whitelist = await getWhitelist();
      refreshUI();
      showPanelToast(root, '✅ 已从白名单移除', 'success');
    }
  });

  // ======== 调度器设置 ========
  $('set-add-window')?.addEventListener('click', () => {
    if (!state.cfg.settings) state.cfg.settings = {};
    if (!state.cfg.settings.schedule) state.cfg.settings.schedule = { enabled: false, timeWindows: [] };
    const sched = state.cfg.settings.schedule;
    sched.timeWindows.push({ start: '02:00', end: '06:00', days: [] });
    refreshUI();
  });

  // 时段删除事件委托
  root.addEventListener('click', _schedClickHandler = (e) => {
    if (e.target.classList.contains('sched-del')) {
      const idx = +e.target.dataset.idx;
      const sched = state.cfg.settings?.schedule;
      if (sched?.timeWindows) {
        sched.timeWindows.splice(idx, 1);
        refreshUI();
      }
    }
  });

  $('set-save-schedule')?.addEventListener('click', async () => {
    if (!state.cfg.settings) state.cfg.settings = {};
    const enabled = $('set-sched-enabled')?.checked || false;
    const timeWindows = [];
    root.querySelectorAll('#sched-windows > div').forEach(row => {
      const start = row.querySelector('.sched-start')?.value || '02:00';
      const end = row.querySelector('.sched-end')?.value || '06:00';
      const days = [...row.querySelectorAll('.sched-day:checked')].map(cb => +cb.value);
      timeWindows.push({ start, end, days });
    });
    const schedule = { enabled, timeWindows };
    state.cfg.settings.schedule = schedule;
    await chrome.storage.local.set({ settings: state.cfg.settings });
    showPanelToast(root, '✅ 调度设置已保存', 'success');
  });

  // 备份数据
  $('set-backup')?.addEventListener('click', async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '达人邀约助手_备份_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showPanelToast(root, '📤 数据已备份', 'success');
  });

  // 恢复数据
  $('set-restore-btn')?.addEventListener('click', () => $('set-restore-file')?.click());
  $('set-restore-file')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importData(data);
      state.cfg = { ...state.cfg, ...data };
      state.blacklist = await getBlacklist();
      state.whitelist = await getWhitelist();
      refreshUI();
      showPanelToast(root, '📥 数据已恢复', 'success');
    } catch (err) {
      showPanelToast(root, '❌ 文件格式错误', 'error');
    }
  });

  // 清空数据
  $('set-clear')?.addEventListener('click', async () => {
    if (confirm('确定清空所有数据？此操作不可恢复！')) {
      await clearAllData();
      location.reload();
    }
  });
}
