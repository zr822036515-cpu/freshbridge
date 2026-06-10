// ==================== 数据分析面板 ====================

import { statCard, emptyState } from './components.js';
import { classifyTier } from '../normalizer.js';
import { fmtNum, escHtml } from '../utils.js';

/**
 * 渲染数据分析面板
 */
export function renderAnalytics(data = {}) {
  const { list = [], inviteRecords = [], stats = {} } = data;

  // 达人分层统计
  const tierCounts = { '头部': 0, '中腰部': 0, '素人': 0, '置换': 0 };
  for (const c of list) {
    const tier = classifyTier(c);
    tierCounts[tier] = (tierCounts[tier] || 0) + 1;
  }

  // 邀约转化统计
  const totalInvites = inviteRecords.length;
  const successInvites = inviteRecords.filter(r => r.ok).length;
  const failInvites = totalInvites - successInvites;
  const conversionRate = totalInvites ? ((successInvites / totalInvites) * 100).toFixed(1) : '0';

  // 粉丝分布
  const fanBuckets = { '1w以下': 0, '1w-10w': 0, '10w-50w': 0, '50w-100w': 0, '100w+': 0 };
  for (const c of list) {
    if (c.fans < 10000) fanBuckets['1w以下']++;
    else if (c.fans < 100000) fanBuckets['1w-10w']++;
    else if (c.fans < 500000) fanBuckets['10w-50w']++;
    else if (c.fans < 1000000) fanBuckets['50w-100w']++;
    else fanBuckets['100w+']++;
  }

  // 佣金率分布
  const commBuckets = { '<5%': 0, '5-10%': 0, '10-20%': 0, '20-30%': 0, '>30%': 0 };
  for (const c of list) {
    const r = c.commissionRate || 0;
    if (r < 5) commBuckets['<5%']++;
    else if (r < 10) commBuckets['5-10%']++;
    else if (r < 20) commBuckets['10-20%']++;
    else if (r < 30) commBuckets['20-30%']++;
    else commBuckets['>30%']++;
  }

  return `
    <!-- 关键指标 -->
    <div class="section">
      <div class="section-title">📈 关键指标</div>
      <div class="statCards">
        ${statCard(list.length, '达人总数')}
        ${statCard(totalInvites, '累计邀约', true)}
        ${statCard(conversionRate + '%', '邀约成功率')}
      </div>
    </div>

    <!-- 邀约统计 -->
    <div class="section">
      <div class="section-title">📊 邀约转化</div>
      ${totalInvites ? renderBar('成功/失败', [
        { label: '成功', value: successInvites, color: '#10B981' },
        { label: '失败', value: failInvites, color: '#EF4444' },
      ], totalInvites) : emptyState('📊', '暂无邀约数据')}
    </div>

    <!-- 达人分层分布 -->
    <div class="section">
      <div class="section-title">🏷 达人分层分布</div>
      ${renderBar('分层', [
        { label: '头部', value: tierCounts['头部'], color: '#F59E0B' },
        { label: '中腰部', value: tierCounts['中腰部'], color: '#4A90D9' },
        { label: '素人', value: tierCounts['素人'], color: '#94A3B8' },
        { label: '置换', value: tierCounts['置换'], color: '#10B981' },
      ], list.length)}
    </div>

    <!-- 粉丝数分布 -->
    <div class="section">
      <div class="section-title">👥 粉丝数分布</div>
      ${renderBar('粉丝', Object.entries(fanBuckets).map(([k, v]) => ({ label: k, value: v, color: '#4A90D9' })), list.length)}
    </div>

    <!-- 佣金率分布 -->
    <div class="section">
      <div class="section-title">💰 佣金率分布</div>
      ${renderBar('佣金率', Object.entries(commBuckets).map(([k, v]) => ({ label: k, value: v, color: '#3B82F6' })), list.length)}
    </div>

    <!-- 导出按钮 -->
    <div class="section">
      <div class="section-title">📥 数据导出</div>
      <div class="btn-group">
        <button class="btn btn-outline" id="export-creators">📋 导出达人列表 (CSV)</button>
        <button class="btn btn-outline" id="export-records">📝 导出邀约记录 (CSV)</button>
        <button class="btn btn-outline" id="export-all">💾 导出全部数据 (JSON)</button>
      </div>
    </div>
  `;
}

/** 渲染简单水平柱状图 */
function renderBar(title, items, total) {
  if (!total) return emptyState('📊', '暂无数据');
  const maxVal = Math.max(...items.map(i => i.value), 1);
  return `<div style="margin-bottom:12px">` +
    items.map(i => {
      const pct = Math.round((i.value / maxVal) * 100);
      return `<div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
          <span>${escHtml(i.label)}</span>
          <span style="color:var(--text-secondary)">${i.value} (${total ? Math.round(i.value/total*100) : 0}%)</span>
        </div>
        <div style="height:8px;background:#F1F5F9;border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${i.color};border-radius:4px;transition:width .5s"></div>
        </div>
      </div>`;
    }).join('') +
  `</div>`;
}

/**
 * 初始化分析面板事件
 */
export function initAnalytics(root, state, refreshUI) {
  const $ = (id) => root.getElementById(id);

  // 导出达人列表 CSV
  $('export-creators')?.addEventListener('click', () => {
    exportCSV(state.list, [
      { key: 'nickname', label: '昵称' },
      { key: 'fans', label: '粉丝数' },
      { key: 'sales', label: '近30天结算GMV' },
      { key: 'orders', label: '近30天出单' },
      { key: 'score', label: '口碑分' },
      { key: 'commissionRate', label: '佣金率(%)' },
      { key: 'category', label: '类目' },
    ], '达人列表.csv');
  });

  // 导出邀约记录 CSV
  $('export-records')?.addEventListener('click', async () => {
    const { inviteRecords = [] } = await chrome.storage.local.get('inviteRecords');
    exportCSV(inviteRecords, [
      { key: 'nickname', label: '达人昵称' },
      { key: 'ok', label: '是否成功', format: v => v ? '成功' : '失败' },
      { key: 'reason', label: '原因' },
      { key: 'time', label: '时间', format: v => new Date(v).toLocaleString('zh-CN') },
    ], '邀约记录.csv');
  });

  // 导出全部数据 JSON
  $('export-all')?.addEventListener('click', async () => {
    const data = await chrome.storage.local.get(null);
    downloadFile(JSON.stringify(data, null, 2), '达人邀约助手_全部数据.json', 'application/json');
  });
}

/** 导出 CSV */
function exportCSV(data, columns, filename) {
  const header = columns.map(c => c.label).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      let val = row[c.key];
      if (c.format) val = c.format(val);
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        val = '"' + val.replace(/"/g, '""') + '"';
      }
      return val ?? '';
    }).join(',')
  );
  const csv = '﻿' + [header, ...rows].join('\n');
  downloadFile(csv, filename, 'text/csv;charset=utf-8');
}

/** 触发文件下载 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
