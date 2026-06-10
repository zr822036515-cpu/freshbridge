// ==================== API 拦截器（精准抓取达人数据） ====================

import { normalizeCreator } from './normalizer.js';

/** 拦截到的达人数据缓冲区 */
export const apiBuffer = [];
const seenURLs = new Set();

/**
 * 在 JSON 对象中递归搜索达人列表
 * 严格判定：必须同时具备 粉丝数+昵称+带货相关字段 才视为达人
 */
function searchCreatorList(obj, out, depth) {
  if (!obj || depth > 5) return;

  if (Array.isArray(obj)) {
    if (obj.length > 0 && typeof obj[0] === 'object') {
      if (isCreatorArray(obj)) {
        for (const item of obj) {
          const c = normalizeCreator(item);
          if (c && c.nickname && c.fans > 0) out.push(c);
        }
        return; // 找到达人数组就不再深入
      }
    }
    // 不是达人数组，继续递归搜索子元素
    for (const item of obj) searchCreatorList(item, out, depth + 1);
    return;
  }

  if (typeof obj === 'object') {
    // 只搜索明确的达人容器字段，不盲目遍历
    const creatorKeys = [
      'author_list', 'creators', 'authors', 'creator_list',
      'kol_list', 'talent_list', 'anchor_list', 'influencer_list',
    ];
    for (const k of creatorKeys) {
      if (obj[k]) searchCreatorList(obj[k], out, depth + 1);
    }
    // 通用数据容器（仅在深度较浅时搜索，避免抓取无关数据）
    if (depth <= 2) {
      for (const k of ['data', 'list', 'records', 'items', 'result', 'rows']) {
        if (obj[k]) searchCreatorList(obj[k], out, depth + 1);
      }
    }
  }
}

/**
 * 严格判定数组是否为达人列表
 * 必须同时满足：粉丝相关字段 + 身份标识字段
 */
function isCreatorArray(arr) {
  if (!arr.length) return false;
  const sample = arr[0];
  if (typeof sample !== 'object') return false;

  // 必须有粉丝量相关字段
  const hasFans = 'fans_count' in sample || 'follower_count' in sample || 'fans' in sample || 'followers' in sample;
  if (!hasFans) return false;

  // 必须有达人身份标识：昵称/ID/带货GMV/口碑分 等
  const hasIdentity =
    ('nickname' in sample || 'nick_name' in sample || 'author_name' in sample || 'user_name' in sample) &&
    ('author_id' in sample || 'creator_id' in sample || 'user_id' in sample || 'uid' in sample || 'id' in sample);

  // 额外确认：排除非达人对象（如普通商品、订单等）
  const isNotProduct = !('product_id' in sample || 'sku_id' in sample || 'goods_id' in sample);
  const isNotOrder = !('order_id' in sample || 'trade_no' in sample || 'order_status' in sample);

  return hasIdentity && isNotProduct && isNotOrder;
}

/**
 * 尝试从响应中提取达人数据
 */
function tryExtract(json, url) {
  try {
    if (typeof json === 'string') json = JSON.parse(json);
    if (!json || typeof json !== 'object') return [];
    const results = [];
    searchCreatorList(json, results, 0);
    return results;
  } catch (e) {
    return [];
  }
}

/**
 * 精准判断 URL 是否为达人相关 API
 * 排除通用的 api 调用，只匹配达人/创作者/主播相关
 */
function isCreatorAPI(url) {
  // 达人专用关键词（不包含泛化的 'api'）
  const creatorKeywords = [
    'author', 'creator', 'kol', 'talent', 'anchor', 'influencer',
    'square',        // 达人广场
    '/feed',          // 信息流
  ];
  const hasCreatorKW = creatorKeywords.some(k => url.includes(k));
  if (!hasCreatorKW) return false;

  // 排除明确非达人的 API
  const excludeKeywords = [
    'product', 'goods', 'order', 'trade', 'logistics',
    'finance', 'account/info', 'shop/basic', 'upload',
    'message', 'notification', 'config', 'upload',
  ];
  const isExcluded = excludeKeywords.some(k => url.includes(k));
  return !isExcluded;
}

/**
 * 安装 XHR + Fetch 拦截器
 * @param {Function} onData - 回调：(creators: Array) => void
 */
export function installInterceptor(onData) {
  let totalIntercepted = 0;

  const wrappedOnData = (results, url) => {
    if (!results.length) return;
    totalIntercepted += results.length;
    if (totalIntercepted <= 20 || totalIntercepted % 50 === 0) {
      console.log(`[达人邀约] 📡 已拦截 ${totalIntercepted} 条达人 (来自: ${url?.slice(0,80)})`);
    }
    onData(results);
  };

  // ---- XHR ----
  const oOpen = XMLHttpRequest.prototype.open;
  const oSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this.__url = url;
    return oOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    const xhr = this;
    xhr.addEventListener('load', function () {
      const url = xhr.__url || '';
      // 只处理达人相关 URL
      if (!isCreatorAPI(url)) return;
      if (!seenURLs.has(url)) {
        seenURLs.add(url);
        console.log('[达人邀约] 🔍 XHR:', url.slice(0, 100));
      }
      const results = tryExtract(xhr.responseText || xhr.response, url);
      wrappedOnData(results, url);
    });
    return oSend.apply(this, arguments);
  };

  // ---- Fetch ----
  const oFetch = window.fetch;
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : (input?.url || '');
    const response = await oFetch.apply(this, arguments);
    try {
      if (!isCreatorAPI(url)) return response;
      if (!seenURLs.has(url)) {
        seenURLs.add(url);
        console.log('[达人邀约] 🔍 Fetch:', url.slice(0, 100));
      }
      const cloned = response.clone();
      const results = tryExtract(await cloned.text(), url);
      wrappedOnData(results, url);
    } catch (e) { /* ignore */ }
    return response;
  };

  console.log('[达人邀约] ✅ API 拦截器已安装（精准达人模式）');
}
