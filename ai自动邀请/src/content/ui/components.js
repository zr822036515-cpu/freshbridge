// ==================== 可复用 UI 组件 ====================

import { fmtNum, escHtml, fmtDateTime } from '../utils.js';
import { classifyTier, TIER_COLORS } from '../normalizer.js';

/**
 * 创建统计卡片 HTML
 */
export function statCard(val, label, accent = false) {
  return `<div class="statCard${accent ? ' accent' : ''}">
    <div class="sc-val">${escHtml(String(val))}</div>
    <div class="sc-label">${escHtml(label)}</div>
  </div>`;
}

/**
 * 达人表格行 HTML
 */
export function creatorTableRow(creator, idx) {
  const tier = classifyTier(creator);
  const tierStyle = TIER_COLORS[tier] || TIER_COLORS['素人'];
  return `<tr data-id="${escHtml(creator.id)}" data-idx="${idx}">
    <td class="cb-col"><input type="checkbox" data-id="${escHtml(creator.id)}"></td>
    <td title="${escHtml(creator.nickname)}">${escHtml(creator.nickname || '-')}</td>
    <td>${creator.fans ? fmtNum(creator.fans) : '-'}</td>
    <td>${creator.sales ? fmtNum(creator.sales) : '-'}</td>
    <td>${creator.score ? creator.score.toFixed(1) : '-'}</td>
    <td>${creator.orders || '-'}</td>
    <td>${creator.commissionRate ? creator.commissionRate + '%' : '-'}</td>
    <td><span class="tag" style="background:${tierStyle.bg};color:${tierStyle.color}">${tierStyle.label}</span></td>
  </tr>`;
}

/**
 * 达人卡片 HTML
 */
export function creatorCard(creator, selected = false) {
  const tier = classifyTier(creator);
  const tierStyle = TIER_COLORS[tier] || TIER_COLORS['素人'];
  const selClass = selected ? ' sel' : '';
  const avatar = creator.avatar
    ? `<img src="${escHtml(creator.avatar)}" alt="">`
    : (creator.nickname || '?').charAt(0);

  return `<div class="creator-card${selClass}" data-id="${escHtml(creator.id)}">
    <div class="cc-avatar">${avatar.includes('<img') ? avatar : escHtml(avatar)}</div>
    <div class="cc-info">
      <div class="cc-name">${escHtml(creator.nickname || '-')}</div>
      <div class="cc-meta">
        <span>👥 ${fmtNum(creator.fans)}</span>
        <span>💰 ${fmtNum(creator.sales)}</span>
        <span>⭐ ${creator.score.toFixed(1)}</span>
      </div>
    </div>
    <span class="tag" style="background:${tierStyle.bg};color:${tierStyle.color}">${tierStyle.label}</span>
  </div>`;
}

/**
 * 空状态 HTML
 */
export function emptyState(icon, text) {
  return `<div class="empty-state">
    <div class="empty-icon">${icon || '📭'}</div>
    <div class="empty-text">${escHtml(text || '暂无数据')}</div>
  </div>`;
}

/**
 * 邀约记录时间线 HTML
 */
export function timelineItem(record) {
  const icon = record.ok ? '✅' : '❌';
  return `<div class="timeline-item">
    <div class="tl-time">${fmtDateTime(record.time)}</div>
    <div class="tl-text">${icon} ${escHtml(record.nickname)} — ${escHtml(record.reason || (record.ok ? '发送成功' : '发送失败'))}</div>
  </div>`;
}

/**
 * 显示 Toast 通知
 */
export function showToast(msg, type = 'info', duration = 3000) {
  // 移除已有 toast
  document.querySelectorAll('#__daren_toast__').forEach(el => el.remove());
  const el = document.createElement('div');
  el.id = '__daren_toast__';
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

/**
 * 在 Shadow DOM 内显示 Toast
 */
export function showPanelToast(root, msg, type = 'info') {
  const existing = root.querySelector('.toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}
