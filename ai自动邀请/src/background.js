// ============================================================
// Background Service Worker — 邀约记录 + 统计数据管理
// ============================================================

const MAX_HISTORY = 1000;

/**
 * 消息处理
 */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'LOG') {
    handleInviteLog(msg.record);
    sendResponse({ ok: true });
    return true;
  }

  if (msg.action === 'GET_STATS') {
    chrome.storage.local.get(['stats', 'history', 'inviteRecords'], (data) => {
      sendResponse(data);
    });
    return true;
  }

  if (msg.action === 'CLEAR_ALL') {
    chrome.storage.local.clear(() => {
      sendResponse({ ok: true });
    });
    return true;
  }
});

/**
 * 处理邀约日志
 */
async function handleInviteLog(record) {
  const data = await chrome.storage.local.get(['history', 'stats', 'inviteRecords']);

  // 更新统计
  const stats = data.stats || { date: '', sent: 0, ok: 0, ng: 0 };
  const today = new Date().toDateString();
  if (stats.date !== today) {
    stats.date = today;
    stats.sent = 0;
    stats.ok = 0;
    stats.ng = 0;
  }
  stats.sent++;
  record.ok ? stats.ok++ : stats.ng++;

  // 更新历史记录
  const history = data.history || [];
  history.unshift(record);
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;

  // 更新详细邀约记录
  const inviteRecords = data.inviteRecords || [];
  inviteRecords.unshift({
    id: record.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
    time: record.time || Date.now(),
    creatorId: record.creatorId,
    nickname: record.nickname,
    fans: record.fans,
    template: record.template || '',
    status: record.ok ? 'success' : 'failed',
    reason: record.reason || '',
    ok: record.ok,
  });
  if (inviteRecords.length > 2000) inviteRecords.length = 2000;

  await chrome.storage.local.set({ stats, history, inviteRecords });
}

/**
 * 插件安装/更新
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[达人邀约] 🎉 插件已安装');
  } else if (details.reason === 'update') {
    console.log('[达人邀约] 🔄 插件已更新至', chrome.runtime.getManifest().version);
  }
});
