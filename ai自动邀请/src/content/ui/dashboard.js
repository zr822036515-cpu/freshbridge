// ==================== 首页看板 ====================

import { statCard, timelineItem, emptyState, creatorTableRow } from './components.js';

/**
 * 渲染看板面板
 * @param {Object} data - { stats, list, inviteRecords, history }
 */
export function renderDashboard(data = {}) {
  const { stats = {}, list = [], inviteRecords = [] } = data;
  const today = new Date().toDateString();
  const todayStats = stats.date === today ? stats : { sent: 0, ok: 0, ng: 0 };

  // 最近 10 条邀约记录
  const recentRecords = (inviteRecords || []).slice(0, 10);

  // 达人分层统计
  const tierCounts = { '头部': 0, '中腰部': 0, '素人': 0, '置换': 0 };
  for (const c of list) {
    const tier = classifyTierSimple(c);
    tierCounts[tier] = (tierCounts[tier] || 0) + 1;
  }

  return `
    <!-- 统计卡片 -->
    <div class="statCards">
      ${statCard(todayStats.sent || 0, '今日邀约')}
      ${statCard(list.length, '已拦截达人', true)}
      ${statCard(todayStats.ok || 0, '今日成功')}
    </div>
    <div class="statCards">
      ${statCard(inviteRecords?.length || 0, '累计邀约记录')}
      ${statCard(tierCounts['头部'] + tierCounts['中腰部'], '中腰部以上达人')}
      ${statCard(todayStats.ng || 0, '今日失败')}
    </div>

    <!-- 达人分层 -->
    <div class="section">
      <div class="section-title">📊 达人分层统计</div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <span class="tag tag-yellow">头部 ${tierCounts['头部']}</span>
        <span class="tag tag-blue">中腰部 ${tierCounts['中腰部']}</span>
        <span class="tag tag-gray">素人 ${tierCounts['素人']}</span>
        <span class="tag tag-green">置换 ${tierCounts['置换']}</span>
      </div>
    </div>

    <!-- 最近邀约记录 -->
    <div class="section">
      <div class="section-title">🕐 最近邀约记录</div>
      ${recentRecords.length
        ? `<div class="timeline">${recentRecords.map(timelineItem).join('')}</div>`
        : emptyState('📭', '暂无邀约记录，去达人筛选页开始邀约吧')}
    </div>
  `;
}

/** 简易分层 */
function classifyTierSimple(c) {
  if (c.acceptsExchange) return '置换';
  if (c.fans >= 1000000 || c.sales >= 10000000) return '头部';
  if (c.fans >= 100000 || c.sales >= 1000000) return '中腰部';
  return '素人';
}

/** 绑定看板事件 */
export function initDashboard(root, state, refreshUI) {
  // 看板主要是展示，无复杂交互
}
