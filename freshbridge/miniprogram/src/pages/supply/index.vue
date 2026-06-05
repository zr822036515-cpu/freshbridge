<template>
  <view class="page">
    <!-- Search bar -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <input class="search-input" type="text" placeholder="搜索水果品种、产地..." v-model="keyword" confirm-type="search" @confirm="onSearch" />
      </view>
    </view>

    <!-- Category selector -->
    <view class="cat-bar">
      <view class="cat-path" @tap="showPanel = !showPanel">
        <text class="cat-path-text">{{ pathText || '全部类目' }}</text>
        <text class="cat-path-arrow" :class="{ up: showPanel }">▼</text>
      </view>
      <text v-if="pathText" class="cat-clear" @tap="clearCategory">✕</text>
    </view>

    <!-- Category panel (expandable) -->
    <view v-if="showPanel" class="cat-panel">
      <view class="cp-columns">
        <!-- L1 -->
        <scroll-view scroll-y class="cp-col cp-l1">
          <view v-for="l1 in catTree" :key="l1.name" class="cp-item" :class="{ active: selectedL1 === l1.name }" @tap="selectL1(l1)">
            <text>{{ l1.name }}</text>
          </view>
        </scroll-view>
        <!-- L2 -->
        <scroll-view v-if="l2List.length > 0" scroll-y class="cp-col cp-l2">
          <view v-for="l2 in l2List" :key="l2.name" class="cp-item" :class="{ active: selectedL2 === l2.name }" @tap="selectL2(l2)">
            <text>{{ l2.name }}</text>
          </view>
        </scroll-view>
        <!-- L3 -->
        <scroll-view v-if="l3List.length > 0" scroll-y class="cp-col cp-l3">
          <view v-for="l3 in l3List" :key="l3" class="cp-item cp-l3-item" :class="{ active: selectedL3 === l3 }" @tap="selectL3(l3)">
            <text>{{ l3 }}</text>
          </view>
        </scroll-view>
      </view>
      <view v-if="selectedL3" class="cp-confirm">
        <view class="cp-confirm-btn" @tap="applyCategory">确定筛选</view>
      </view>
    </view>

    <!-- Mine filter bar -->
    <view v-if="filterMine" class="filter-bar">
      <text class="filter-bar-text">我的货源</text>
      <text class="filter-bar-clear" @tap="clearMineFilter">查看全部 ›</text>
    </view>

    <!-- Product list -->
    <view class="product-list">
      <view v-if="loading && products.length === 0" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-for="item in products" :key="item.id" class="product-card card">
        <view class="card-header">
          <view class="card-variety-row">
            <text class="card-variety">{{ item.variety }}</text>
            <text v-if="item.urgent" class="urgent-badge">⚡ 急售</text>
          </view>
          <text class="card-spec" v-if="item.spec">{{ item.spec }}</text>
          <text class="card-cat-tag" v-if="item.category">{{ item.category }}</text>
        </view>

        <view class="card-body">
          <view class="card-info">
            <text class="info-label">产量</text>
            <text class="info-value amount-green">{{ item.total_quantity }} 斤</text>
          </view>
          <view class="card-info">
            <text class="info-label">价格</text>
            <text class="info-value amount-gold">{{ item.price }} 元/斤</text>
          </view>
          <view class="card-info">
            <text class="info-label">产地</text>
            <text class="info-value">{{ item.origin_province }} {{ item.origin_city }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="footer-tags">
            <text class="footer-tag" v-if="item.grade">{{ item.grade }}</text>
            <text class="footer-tag" v-if="item.packaging">{{ item.packaging }}</text>
          </view>
          <text class="footer-date" v-if="item.available_date">{{ item.available_date }} 可发</text>
        </view>

        <view class="card-actions">
          <view class="offer-btn btn-primary touch-target" @tap.stop="onMakeOffer(item)">接单</view>
        </view>
      </view>

      <view v-if="!loading && products.length === 0" class="empty-state">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无货源</text>
        <text class="empty-sub">试试更换筛选条件</text>
      </view>

      <view v-if="hasMore && products.length > 0" class="load-more" @tap="loadMore">
        <text class="load-more-text">{{ loadingMore ? '加载中...' : '加载更多' }}</text>
      </view>
      <view v-if="!hasMore && products.length > 0" class="no-more">
        <text class="no-more-text">—— 没有更多了 ——</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { get, post } from '../../utils/api'

// ===== 三级类目树 =====
const catTree = [
  {
    name: '仁果类', children: [
      { name: '苹果', children: ['红富士', '阿克苏', '嘎啦', '花牛', '国光', '蛇果', '黄元帅', '金帅', '秦冠', '其他'] },
      { name: '梨', children: ['皇冠梨', '雪花梨', '库尔勒香梨', '丰水梨', '秋月梨', '南果梨', '鸭梨', '砀山酥梨', '莱阳梨', '其他'] },
    ]
  },
  {
    name: '柑橘类', children: [
      { name: '橙子', children: ['赣南脐橙', '褚橙', '冰糖橙', '伦晚橙', '新奇士橙', '血橙', '夏橙', '其他'] },
      { name: '宽皮柑橘', children: ['砂糖橘', '沃柑', '耙耙柑', '丑橘', '南丰蜜桔', '金桔', '马水桔', '其他'] },
      { name: '柚子', children: ['琯溪蜜柚', '沙田柚', '文旦柚', '红心柚', '三红柚', '葡萄柚', '其他'] },
      { name: '柠檬', children: ['安岳柠檬', '香水柠檬', '青柠檬', '其他'] },
    ]
  },
  {
    name: '浆果类', children: [
      { name: '葡萄', children: ['巨峰', '夏黑', '阳光玫瑰', '红提', '青提', '克瑞森', '美人指', '其他'] },
      { name: '草莓', children: ['丹东草莓', '章姬', '红颜', '奶油草莓', '白草莓', '其他'] },
      { name: '蓝莓', children: ['云南蓝莓', '东北蓝莓', '智利蓝莓', '其他'] },
      { name: '猕猴桃', children: ['徐香', '翠香', '红阳', '金果', '海沃德', '软枣', '其他'] },
      { name: '桑葚', children: ['黑桑葚', '白桑葚', '其他'] },
      { name: '树莓', children: ['红树莓', '黑树莓', '其他'] },
    ]
  },
  {
    name: '核果类', children: [
      { name: '樱桃/车厘子', children: ['山东大樱桃', '大连樱桃', '智利车厘子', '美早', '红灯', '其他'] },
      { name: '桃子', children: ['水蜜桃', '黄桃', '蟠桃', '油桃', '鹰嘴桃', '雪桃', '其他'] },
      { name: '李子', children: ['三华李', '黑布林', '青脆李', '蜂糖李', '其他'] },
      { name: '杏', children: ['小白杏', '凯特杏', '其他'] },
      { name: '枣', children: ['冬枣', '骏枣', '灰枣', '金丝小枣', '其他'] },
    ]
  },
  {
    name: '热带水果', children: [
      { name: '芒果', children: ['台农芒', '金煌芒', '贵妃芒', '凯特芒', '象牙芒', '其他'] },
      { name: '香蕉', children: ['进口香蕉', '皇帝蕉', '小米蕉', '其他'] },
      { name: '菠萝/凤梨', children: ['海南金钻凤梨', '徐闻菠萝', '香水菠萝', '都乐凤梨', '其他'] },
      { name: '荔枝', children: ['妃子笑', '桂味', '糯米糍', '白糖罂', '其他'] },
      { name: '龙眼', children: ['石硖龙眼', '储良龙眼', '泰国龙眼', '其他'] },
      { name: '火龙果', children: ['红心火龙果', '白心火龙果', '黄火龙果', '其他'] },
      { name: '榴莲', children: ['金枕榴莲', '猫山王', '青尼', '其他'] },
      { name: '山竹', children: ['泰国山竹', '印尼山竹', '其他'] },
      { name: '百香果', children: ['紫香', '黄金百香果', '其他'] },
      { name: '椰子', children: ['泰国椰青', '海南椰子', '其他'] },
    ]
  },
  {
    name: '瓜类', children: [
      { name: '西瓜', children: ['麒麟瓜', '8424', '黑美人', '甜王', '小凤瓜', '硒砂瓜', '其他'] },
      { name: '甜瓜', children: ['哈密瓜', '网纹瓜', '羊角蜜', '绿宝', '玉菇', '其他'] },
    ]
  },
  {
    name: '柿枣类', children: [
      { name: '柿子', children: ['脆柿', '火晶柿子', '柿饼', '其他'] },
      { name: '石榴', children: ['突尼斯软籽石榴', '蒙自石榴', '怀远石榴', '其他'] },
      { name: '无花果', children: ['青皮', '波姬红', '其他'] },
    ]
  },
  {
    name: '坚果干果', children: [
      { name: '核桃', children: ['纸皮核桃', '云南核桃', '新疆核桃', '其他'] },
      { name: '板栗', children: ['迁西板栗', '罗田板栗', '其他'] },
      { name: '腰果', children: ['越南腰果', '其他'] },
      { name: '红枣', children: ['若羌灰枣', '和田骏枣', '新郑红枣', '其他'] },
      { name: '枸杞', children: ['宁夏枸杞', '青海枸杞', '其他'] },
    ]
  },
  {
    name: '进口水果', children: [
      { name: '车厘子', children: ['智利车厘子', '美国车厘子', '新西兰车厘子', '其他'] },
      { name: '榴莲', children: ['马来西亚猫山王', '泰国金枕', '其他'] },
      { name: '牛油果', children: ['墨西哥牛油果', '秘鲁牛油果', '其他'] },
      { name: '奇异果', children: ['新西兰佳沛', '意大利金果', '其他'] },
      { name: '柑橘', children: ['澳洲柑', '南非橙', '其他'] },
    ]
  },
]

// ===== State =====
const keyword = ref('')
const showPanel = ref(false)
const selectedL1 = ref('')
const selectedL2 = ref('')
const selectedL3 = ref('')
const filterCategory = ref('')
const filterVariety = ref('')

const loading = ref(false)
const loadingMore = ref(false)
const products = ref([])
const page = ref(1)
const hasMore = ref(true)
const filterMine = ref(false)

// Computed L2/L3 lists
const l2List = computed(() => {
  const l1 = catTree.find(c => c.name === selectedL1.value)
  return l1 ? l1.children : []
})
const l3List = computed(() => {
  const l2 = l2List.value.find(c => c.name === selectedL2.value)
  return l2 ? l2.children : []
})
const pathText = computed(() => {
  const parts = [selectedL1.value, selectedL2.value, selectedL3.value].filter(Boolean)
  return parts.join(' > ')
})

// Category selection
function selectL1(l1) {
  if (selectedL1.value === l1.name) return
  selectedL1.value = l1.name
  selectedL2.value = ''
  selectedL3.value = ''
}
function selectL2(l2) {
  if (selectedL2.value === l2.name) return
  selectedL2.value = l2.name
  selectedL3.value = ''
}
function selectL3(l3) {
  selectedL3.value = selectedL3.value === l3 ? '' : l3
}
function applyCategory() {
  filterCategory.value = selectedL2.value || selectedL1.value
  filterVariety.value = selectedL3.value
  showPanel.value = false
  fetchProducts(true)
}
function clearCategory() {
  selectedL1.value = ''
  selectedL2.value = ''
  selectedL3.value = ''
  filterCategory.value = ''
  filterVariety.value = ''
  showPanel.value = false
  fetchProducts(true)
}

// Fetch
async function fetchProducts(reset = false) {
  if (reset) { page.value = 1; hasMore.value = true; loading.value = true }
  try {
    let res
    if (filterMine.value) {
      res = await get('/products/my')
    } else {
      const params = { page: page.value, page_size: 10 }
      if (keyword.value) params.keyword = keyword.value
      if (filterCategory.value) params.category = filterCategory.value
      if (filterVariety.value) params.variety = filterVariety.value
      res = await get('/products', params)
    }
    const list = res.products || []
    if (reset) products.value = list
    else products.value.push(...list)
    if (filterMine.value || list.length < 10) hasMore.value = false
  } catch (e) {
    if (reset) products.value = []
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function clearMineFilter() {
  filterMine.value = false
  uni.removeStorageSync('supply_filter_mine')
  fetchProducts(true)
}
function onSearch() { fetchProducts(true) }
function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true; page.value++; fetchProducts(false)
}
function statusText(s) {
  const map = { 0: '待审核', 1: '在售', 2: '已售罄', 3: '已下架' }
  return map[s] || '未知'
}
async function onMakeOffer(item) {
  try {
    await post('/trades', { product_id: item.id, farmer_id: item.farmer_id, commission_rate: item.commission_rate || 25 })
    uni.showToast({ title: '已发起代卖意向', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '发起失败，请重试', icon: 'none' })
  }
}

onShow(() => {
  if (uni.getStorageSync('supply_filter_mine')) {
    filterMine.value = true
    uni.removeStorageSync('supply_filter_mine')
  }
  fetchProducts(true)
})
onPullDownRefresh(() => {
  fetchProducts(true).then(() => uni.stopPullDownRefresh()).catch(() => uni.stopPullDownRefresh())
})
</script>

<style scoped lang="scss">
.page { padding: 24rpx; min-height: 100vh; }

/* Search */
.search-bar { margin-bottom: 16rpx; }
.search-input-wrapper {
  display: flex; align-items: center; background: #fff; border: 1px solid #E5E7EB;
  border-radius: 10rpx; padding: 16rpx 24rpx;
}
.search-icon { font-size: 32rpx; margin-right: 16rpx; }
.search-input { flex: 1; font-size: 32rpx; color: #14532D; }

/* Category bar */
.cat-bar { display: flex; align-items: center; margin-bottom: 16rpx; gap: 12rpx; }
.cat-path {
  flex: 1; display: flex; justify-content: space-between; align-items: center;
  background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8rpx; padding: 14rpx 20rpx; min-height: 44px;
}
.cat-path-text { font-size: 30rpx; color: #15803D; }
.cat-path-arrow { font-size: 22rpx; color: #15803D; transition: transform .2s; }
.cat-path-arrow.up { transform: rotate(180deg); }
.cat-clear { font-size: 30rpx; color: #EF4444; padding: 8rpx; }

/* Category panel */
.cat-panel { background: #fff; border-radius: 12rpx; margin-bottom: 16rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08); overflow: hidden; }
.cp-columns { display: flex; height: 500rpx; }
.cp-col { flex: 1; border-right: 1px solid #F0FDF4; }
.cp-col:last-child { border-right: none; }
.cp-l1 { background: #F9FAFB; }
.cp-l2 { background: #F0FDF4; }
.cp-item { padding: 20rpx 16rpx; font-size: 28rpx; color: #666; }
.cp-item.active { background: #fff; color: #15803D; font-weight: 600; }
.cp-l3-item { font-size: 26rpx; padding: 16rpx 12rpx; }
.cp-confirm { padding: 16rpx 24rpx; border-top: 1px solid #F0FDF4; }
.cp-confirm-btn {
  text-align: center; background: #15803D; color: #fff; padding: 16rpx 0;
  border-radius: 8rpx; font-size: 30rpx; font-weight: 600;
}

/* Filter bar */
.filter-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16rpx 24rpx; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8rpx; margin-bottom: 16rpx;
  .filter-bar-text { font-size: 32rpx; color: #15803D; font-weight: 600; }
  .filter-bar-clear { font-size: 32rpx; color: #15803D; min-height: 44px; display: flex; align-items: center; }
}

/* Product list */
.product-list { flex: 1; }
.loading-state { display: flex; justify-content: center; padding: 80rpx 0; }
.loading-text { font-size: 32rpx; color: #999; }

.product-card { padding: 24rpx; margin-bottom: 20rpx; }
.card-header { margin-bottom: 16rpx; }
.card-variety-row { display: flex; align-items: center; margin-bottom: 6rpx; }
.card-variety { font-size: 36rpx; font-weight: 700; color: #14532D; }
.urgent-badge { font-size: 24rpx; color: #D97706; background: #FEF3C7; padding: 4rpx 12rpx; border-radius: 4rpx; margin-left: 12rpx; }
.card-spec { font-size: 28rpx; color: #999; display: block; }
.card-cat-tag { font-size: 22rpx; color: #15803D; background: #F0FDF4; padding: 2rpx 10rpx; border-radius: 4rpx; display: inline-block; margin-top: 6rpx; }

.card-body { display: flex; justify-content: space-between; margin-bottom: 16rpx; padding: 16rpx 0; border-top: 1px solid #F3F4F6; border-bottom: 1px solid #F3F4F6; }
.card-info { display: flex; flex-direction: column; }
.info-label { font-size: 24rpx; color: #999; margin-bottom: 4rpx; }
.info-value { font-size: 32rpx; font-weight: 700; color: #14532D; }
.amount-green { color: #15803D; }

.card-footer { display: flex; align-items: center; justify-content: space-between; }
.footer-tags { display: flex; gap: 8rpx; }
.footer-tag { font-size: 24rpx; color: #15803D; background: #F0FDF4; padding: 4rpx 12rpx; border-radius: 4rpx; }
.footer-date { font-size: 24rpx; color: #999; }

.card-actions { margin-top: 16rpx; padding-top: 16rpx; border-top: 1px solid #F3F4F6; }
.offer-btn { width: 100%; height: 44px; text-align: center; line-height: 44px; background: #15803D; color: #fff; border-radius: 8rpx; font-size: 32rpx; font-weight: 500; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 120rpx 0; }
.empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.empty-text { font-size: 32rpx; color: #999; }
.empty-sub { font-size: 28rpx; color: #999; margin-top: 8rpx; }

.load-more, .no-more { display: flex; justify-content: center; padding: 32rpx 0; }
.load-more-text { font-size: 28rpx; color: #15803D; }
.no-more-text { font-size: 28rpx; color: #999; }
</style>
