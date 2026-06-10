// ==================== 达人数据标准化 + 智能分层 ====================

import { parseNum } from './utils.js';

/**
 * 标准化达人数据
 * 支持多种 API 响应字段名，统一为标准格式
 */
export function normalizeCreator(item) {
  const id = item.id || item.creator_id || item.author_id || item.user_id || item.uid;
  if (!id) return null;

  // 首次标准化时打印原始字段名（调试用，帮助确认类目字段名）
  debugCategoryFields(item);

  return {
    id: String(id),
    nickname: item.nickname || item.nick_name || item.name || item.author_name || item.user_name || '',
    avatar: item.avatar || item.avatar_url || item.avatar_thumb || '',
    fans: parseNum(item.fans_count ?? item.follower_count ?? item.fans ?? item.followers ?? 0),
    // 近30天结算GMV（精选联盟标准口径，优先取 settled_gmv / gmv_30d）
    sales: parseNum(item.settled_gmv ?? item.gmv_30d ?? item.gmv ?? item.sales ?? item.sales_amount ?? item.total_gmv ?? 0),
    orders: parseNum(item.order_cnt_30d ?? item.order_count ?? item.orders ?? item.sales_count ?? 0),
    score: parseFloat(item.score ?? item.fulfill_score ?? item.rating ?? item.credit_score ?? item.reputation_score ?? 0) || 0,
    commissionRate: parseFloat(item.commission_rate ?? item.commission ?? item.expected_commission ?? 0) || 0,
    category: extractCategory(item),
    contentTypes: item.content_type ?? item.content_types ?? '',
    genderRatio: item.gender_ratio ?? item.gender ?? '',
    ageDistribution: item.age_distribution ?? item.age ?? '',
    cityDistribution: item.city_distribution ?? item.city ?? '',
    // 额外字段
    fulfillmentRate: parseFloat(item.fulfillment_rate ?? item.fulfill_rate ?? 0) || 0,
    badRate: parseFloat(item.bad_rate ?? item.negative_rate ?? item.refund_rate ?? 0) || 0,
    isPureCommission: item.is_pure_commission ?? item.pure_commission ?? false,
    pitFee: parseNum(item.pit_fee ?? item.pit_price ?? item.fixed_fee ?? 0),
    acceptsExchange: item.accepts_exchange ?? item.accept_exchange ?? false,
    hasCart: item.has_cart ?? item.cart_stable ?? true,
    accountWeight: parseFloat(item.weight ?? item.account_weight ?? item.author_weight ?? 0) || 0,
    _el: item._el || null,
    source: item.source || 'api',
  };
}

/**
 * 达人智能分层
 * 头部: ≥100w 粉 或 GMV ≥ 1000w
 * 中腰部: 10w-100w 粉 或 GMV 100w-1000w
 * 素人: <10w 粉
 * 置换: acceptsExchange = true
 */
export function classifyTier(creator) {
  if (creator.acceptsExchange) return '置换';
  if (creator.fans >= 1000000 || creator.sales >= 10000000) return '头部';
  if (creator.fans >= 100000 || creator.sales >= 1000000) return '中腰部';
  return '素人';
}

/** 分层颜色标签 */
export const TIER_COLORS = {
  '头部': { bg: '#fef3c7', color: '#92400e', label: '头部达人' },
  '中腰部': { bg: '#dbeafe', color: '#1e40af', label: '中腰部达人' },
  '素人': { bg: '#f3f4f6', color: '#374151', label: '素人达人' },
  '置换': { bg: '#d1fae5', color: '#065f46', label: '置换达人' },
};

/** 提取类目（支持数组/字符串/大量可能字段名） */
function extractCategory(item) {
  // 优先尝试验证的常见字段名
  const candidates = [
    item.category, item.categories, item.cat_name, item.cat_names,
    item.main_category, item.main_cat, item.product_categories,
    // 抖音精选联盟可能的字段名
    item.anchor_category, item.author_category, item.creator_category,
    item.kol_category, item.shop_category, item.goods_category,
    item.industry, item.vertical, item.industry_name,
    item.tag, item.tags, item.labels,
    item.cat, item.cate, item.cate_name, item.category_name,
    item.category_list, item.cat_list,
    item.first_category, item.second_category, item.third_category,
  ];
  for (const raw of candidates) {
    if (raw === undefined || raw === null || raw === '') continue;
    if (Array.isArray(raw)) {
      const parts = raw.map(c =>
        typeof c === 'string' ? c : (c.name || c.cat_name || c.category_name || c.label || c.value || '')
      ).filter(Boolean);
      if (parts.length) return parts.join(',');
      continue;
    }
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
    if (typeof raw === 'number' && raw > 0) return String(raw);
  }

  // 兜底：遍历对象所有 key，找包含 category/cat/industry/vertical 的字段
  for (const key of Object.keys(item)) {
    const kl = key.toLowerCase();
    if ((kl.includes('cat') || kl.includes('cate') || kl.includes('industry') || kl.includes('vertical') || kl.includes('class')) &&
        typeof item[key] === 'string' && item[key].trim()) {
      console.log('[达人邀约] 🔍 类目兜底匹配:', key, '→', item[key]);
      return item[key].trim();
    }
  }

  return '';
}

/** 调试：打印原始数据中可用的字段（每30条打印一次，避免刷屏） */
let _catDebugCount = 0;
export function debugCategoryFields(item) {
  _catDebugCount++;
  if (_catDebugCount % 30 !== 1) return; // 每30条打印一次
  const catKeys = Object.keys(item).filter(k =>
    k.toLowerCase().includes('cat') || k.toLowerCase().includes('cate') ||
    k.toLowerCase().includes('industry') || k.toLowerCase().includes('vertical') ||
    k.toLowerCase().includes('tag') || k.toLowerCase().includes('label') ||
    k.toLowerCase().includes('class') || k.toLowerCase().includes('field')
  );
  console.log('[达人邀约] 📋 #' + _catDebugCount + ' API原始字段名:', Object.keys(item).join(', '));
  if (catKeys.length) {
    console.log('[达人邀约] 📋 #' + _catDebugCount + ' 类目相关字段:', catKeys.map(k => `${k}=${JSON.stringify(item[k]).slice(0,100)}`).join(' | '));
  } else {
    console.log('[达人邀约] 📋 #' + _catDebugCount + ' ⚠️ 无类目相关字段！请查看上方字段名');
  }
}

/** 批量标准化 */
export function normalizeBatch(items) {
  return items.map(normalizeCreator).filter(Boolean);
}

/**
 * 检查是否符合筛选条件
 * @param {Object} creator
 * @param {Object} filters - { fansMin, fansMax, salesMin, salesMax, scoreMin, commissionMin, commissionMax, category, tier, pureCommissionOnly }
 */
export function matchesFilter(creator, filters) {
  if (!filters) return true;
  const f = filters;

  if (f.fansMin != null && creator.fans < f.fansMin) return false;
  if (f.fansMax != null && creator.fans > f.fansMax) return false;

  if (f.salesMin != null && creator.sales < f.salesMin) return false;
  if (f.salesMax != null && creator.sales > f.salesMax) return false;

  if (f.scoreMin != null && creator.score < f.scoreMin) return false;
  if (f.scoreMax != null && creator.score > f.scoreMax) return false;

  if (f.commissionMin != null && creator.commissionRate < f.commissionMin) return false;
  if (f.commissionMax != null && creator.commissionRate > f.commissionMax) return false;

  if (f.ordersMin != null && creator.orders < f.ordersMin) return false;

  // 类目匹配：大小写不敏感，支持模糊包含（达人类目可能是"美妆护肤"，搜索"美妆"能命中）
  if (f.category) {
    const creatorCat = (creator.category || '').toLowerCase();
    const filterCat = f.category.toLowerCase();
    if (!creatorCat.includes(filterCat)) return false;
  }

  if (f.tier && classifyTier(creator) !== f.tier) return false;

  if (f.pureCommissionOnly && !creator.isPureCommission) return false;

  if (f.keyword) {
    const kw = f.keyword.toLowerCase();
    if (!creator.nickname.toLowerCase().includes(kw)) return false;
  }

  return true;
}
