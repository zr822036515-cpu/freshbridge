// ==================== chrome.storage 封装 ====================

const DEFAULTS = {
  filter: {},
  templates: [
    { id: '1', group: '通用', name: '默认话术', content: 'Hi {达人昵称}，【{商品名}】正在找达人合作，佣金{佣金比例}%，期待合作！', enabled: true },
    { id: '2', group: '通用', name: '简洁版', content: '{达人昵称}你好，品牌好物【{商品名}】诚邀合作，高佣金高转化~', enabled: true },
    { id: '3', group: '高佣', name: '高佣邀约', content: '{达人昵称}老师好！【{商品名}】提供{佣金比例}高佣合作，出单稳定，欢迎来撩~', enabled: true },
    { id: '4', group: '纯佣', name: '纯佣合作', content: '{达人昵称}，【{商品名}】纯佣金合作，坑位费可谈，佣金{佣金比例}%，期待回复！', enabled: true },
  ],
  product: { name: '', commissionRate: '', link: '', category: '', benefit: '' },
  settings: { delayMin: 3000, delayMax: 6000 },
  history: [],
  stats: { date: '', sent: 0, ok: 0, ng: 0 },
  blacklist: [],
  whitelist: [],
  inviteRecords: [],  // 详细邀约记录
};

/** 获取全部存储数据 */
export async function getAll() {
  return new Promise(resolve => chrome.storage.local.get(null, resolve));
}

/** 合并写入 */
export async function set(items) {
  return new Promise(resolve => chrome.storage.local.set(items, resolve));
}

/** 初始化默认配置（如果不存在） */
export async function ensureDefaults() {
  const data = await getAll();
  if (!data || !data.templates) {
    await set(DEFAULTS);
    return { ...DEFAULTS };
  }
  // 确保新字段存在
  const patches = {};
  if (!data.blacklist) patches.blacklist = [];
  if (!data.whitelist) patches.whitelist = [];
  if (!data.inviteRecords) patches.inviteRecords = [];
  if (Object.keys(patches).length) await set(patches);
  return data;
}

/** 获取配置（带缓存） */
export async function getConfig() {
  return ensureDefaults();
}

/** 添加邀约记录 */
export async function addInviteRecord(record) {
  const { inviteRecords = [] } = await getAll();
  inviteRecords.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    time: Date.now(),
    ...record,
  });
  // 保留最近 2000 条
  if (inviteRecords.length > 2000) inviteRecords.length = 2000;
  await set({ inviteRecords });
}

/** 获取邀约记录 */
export async function getInviteRecords(filters = {}) {
  const { inviteRecords = [] } = await getAll();
  let list = inviteRecords;
  if (filters.status) list = list.filter(r => r.status === filters.status);
  if (filters.creatorId) list = list.filter(r => r.creatorId === filters.creatorId);
  if (filters.dateFrom) list = list.filter(r => r.time >= filters.dateFrom);
  if (filters.dateTo) list = list.filter(r => r.time <= filters.dateTo);
  return list;
}

/** 黑名单操作 */
export async function getBlacklist() {
  const { blacklist = [] } = await getAll();
  return blacklist;
}

export async function addToBlacklist(creatorId) {
  const { blacklist = [] } = await getAll();
  if (!blacklist.includes(creatorId)) {
    blacklist.push(creatorId);
    await set({ blacklist });
  }
}

export async function removeFromBlacklist(creatorId) {
  const { blacklist = [] } = await getAll();
  const idx = blacklist.indexOf(creatorId);
  if (idx >= 0) {
    blacklist.splice(idx, 1);
    await set({ blacklist });
  }
}

/** 白名单操作 */
export async function getWhitelist() {
  const { whitelist = [] } = await getAll();
  return whitelist;
}

export async function addToWhitelist(creatorId) {
  const { whitelist = [] } = await getAll();
  if (!whitelist.includes(creatorId)) {
    whitelist.push(creatorId);
    await set({ whitelist });
  }
}

export async function removeFromWhitelist(creatorId) {
  const { whitelist = [] } = await getAll();
  const idx = whitelist.indexOf(creatorId);
  if (idx >= 0) {
    whitelist.splice(idx, 1);
    await set({ whitelist });
  }
}

/** 数据导出为 JSON */
export async function exportAllData() {
  return getAll();
}

/** 数据导入 */
export async function importData(data) {
  if (data.templates) await set({ templates: data.templates });
  if (data.settings) await set({ settings: data.settings });
  if (data.blacklist) await set({ blacklist: data.blacklist });
  if (data.whitelist) await set({ whitelist: data.whitelist });
}

/** 清除所有数据 */
export async function clearAllData() {
  return new Promise(resolve => chrome.storage.local.clear(resolve));
}
