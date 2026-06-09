<template>
  <view class="page">
    <!-- Search Header -->
    <view class="search-bar">
      <view class="search-wrap">
        <text>🔍</text>
        <input class="search-input" type="text" placeholder="搜索品种、产地或档口" v-model="keyword" confirm-type="search" @confirm="onSearch" />
        <text class="search-filter">🔧</text>
      </view>
    </view>

    <!-- Category 3x3 Grid -->
    <view class="cat-grid card">
      <view v-for="l1 in catTree" :key="l1.name" class="cat-item" @tap="openCategory(l1)">
        <view class="cat-icon" :class="l1.active ? 'cat-icon-active' : ''">
          <text class="cat-emoji">{{ l1.icon }}</text>
        </view>
        <text class="cat-label">{{ l1.name }}</text>
      </view>
    </view>

    <!-- Category Panel (expandable) -->
    <view v-if="showPanel" class="cat-panel card" @tap.stop>
      <view class="cp-columns">
        <scroll-view scroll-y class="cp-col cp-l1">
          <view v-for="l1 in catTree" :key="l1.name" class="cp-item" :class="{ active: selectedL1 === l1.name }" @tap="selectL1(l1)">
            <text>{{ l1.name }}</text>
          </view>
        </scroll-view>
        <scroll-view v-if="l2List.length > 0" scroll-y class="cp-col cp-l2">
          <view v-for="l2 in l2List" :key="l2.name" class="cp-item" :class="{ active: selectedL2 === l2.name }" @tap="selectL2(l2)">
            <text>{{ l2.name }}</text>
          </view>
        </scroll-view>
        <scroll-view v-if="l3List.length > 0" scroll-y class="cp-col cp-l3">
          <view v-for="l3 in l3List" :key="l3" class="cp-item" :class="{ active: selectedL3 === l3 }" @tap="selectL3(l3)">
            <text>{{ l3 }}</text>
          </view>
        </scroll-view>
      </view>
      <view class="cp-actions">
        <view class="cp-btn-clear" @tap="clearCategory">清除</view>
        <view class="cp-btn-confirm" @tap="applyCategory">确定筛选</view>
      </view>
    </view>

    <!-- Active filter path -->
    <view v-if="pathText" class="filter-tag">
      <text>{{ pathText }}</text>
      <text class="filter-tag-x" @tap="clearCategory">✕</text>
    </view>

    <!-- Product Cards - 2 Column Masonry -->
    <view class="product-grid">
      <view v-for="item in products" :key="item.id" class="product-card">
        <view class="pc-img-wrap">
          <image v-if="item.img" :src="item.img" mode="aspectFill" class="pc-img-real" />
          <view v-else class="pc-img-placeholder">
            <text class="pc-img-emoji">{{ item.emoji || '🍎' }}</text>
          </view>
          <view v-if="item.tag" class="pc-tag" :class="'tag-' + item.tagColor">{{ item.tag }}</view>
        </view>
        <view class="pc-body">
          <view class="pc-name-row">
            <text class="pc-name">{{ item.variety }}</text>
          </view>
          <text class="pc-origin">产地：{{ item.origin_city || item.origin_province || '--' }}</text>
          <view class="pc-price-row">
            <text class="pc-price">¥{{ item.price }}<text class="pc-unit">/斤</text></text>
          </view>
          <view class="pc-footer">
            <view class="pc-supplier">
              <view class="pc-avatar">
                <text>S</text>
              </view>
              <text class="pc-supplier-name">{{ item.farmer_name || '鲜桥农场' }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="loading-state">
      <text>加载中...</text>
    </view>

    <!-- Empty -->
    <view v-if="!loading && products.length === 0" class="empty-state">
      <text class="empty-icon">📦</text>
      <text class="empty-text">暂无货源</text>
    </view>

    <!-- Load more -->
    <view v-if="hasMore && products.length > 0" class="load-more" @tap="loadMore">
      <text>{{ loadingMore ? '加载中...' : '加载更多' }}</text>
    </view>

    <view class="bottom-spacer"></view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { get, post } from '../../utils/api'

const catTree = [
  { name: '仁果类', icon: '🍎', img: '/static/images/categories/apple.jpg', active: false, children: [
    { name: '苹果', children: ['红富士', '阿克苏', '嘎啦', '花牛', '国光', '蛇果', '黄元帅', '金帅', '秦冠'] },
    { name: '梨', children: ['皇冠梨', '雪花梨', '库尔勒香梨', '丰水梨', '秋月梨', '南果梨', '鸭梨'] },
  ]},
  { name: '柑橘类', icon: '🍊', img: '/static/images/categories/citrus.jpg', active: false, children: [
    { name: '橙子', children: ['赣南脐橙', '褚橙', '冰糖橙', '伦晚橙', '新奇士橙', '夏橙'] },
    { name: '宽皮柑橘', children: ['砂糖橘', '沃柑', '耙耙柑', '丑橘', '南丰蜜桔', '金桔'] },
    { name: '柚子', children: ['琯溪蜜柚', '沙田柚', '文旦柚', '红心柚', '葡萄柚'] },
    { name: '柠檬', children: ['安岳柠檬', '香水柠檬', '青柠檬'] },
  ]},
  { name: '浆果类', icon: '🍇', img: '/static/images/categories/berry.jpg', active: false, children: [
    { name: '葡萄', children: ['巨峰', '夏黑', '阳光玫瑰', '红提', '青提', '克瑞森'] },
    { name: '草莓', children: ['丹东草莓', '章姬', '红颜', '奶油草莓', '白草莓'] },
    { name: '蓝莓', children: ['云南蓝莓', '东北蓝莓'] },
    { name: '猕猴桃', children: ['徐香', '翠香', '红阳', '金果', '软枣'] },
  ]},
  { name: '核果类', icon: '🍑', img: '/static/images/categories/stone-fruit.jpg', active: false, children: [
    { name: '樱桃/车厘子', children: ['山东大樱桃', '大连樱桃', '智利车厘子', '美早', '红灯'] },
    { name: '桃子', children: ['水蜜桃', '黄桃', '蟠桃', '油桃', '鹰嘴桃'] },
    { name: '李子', children: ['三华李', '黑布林', '青脆李', '蜂糖李'] },
  ]},
  { name: '热带水果', icon: '🥭', img: '/static/images/categories/tropical.jpg', active: false, children: [
    { name: '芒果', children: ['台农芒', '金煌芒', '贵妃芒', '凯特芒', '象牙芒'] },
    { name: '荔枝', children: ['妃子笑', '桂味', '糯米糍', '白糖罂'] },
    { name: '火龙果', children: ['红心火龙果', '白心火龙果', '黄火龙果'] },
    { name: '榴莲', children: ['金枕榴莲', '猫山王', '青尼'] },
    { name: '山竹', children: ['泰国山竹', '印尼山竹'] },
  ]},
  { name: '瓜类', icon: '🍈', img: '/static/images/categories/melon.jpg', active: false, children: [
    { name: '西瓜', children: ['麒麟瓜', '8424', '黑美人', '甜王', '小凤瓜'] },
    { name: '甜瓜', children: ['哈密瓜', '网纹瓜', '羊角蜜', '绿宝'] },
  ]},
  { name: '柿枣类', icon: '🫐', img: '/static/images/categories/persimmon.jpg', active: false, children: [
    { name: '柿子', children: ['脆柿', '火晶柿子', '柿饼'] },
    { name: '石榴', children: ['突尼斯软籽石榴', '蒙自石榴'] },
  ]},
  { name: '坚果干果', icon: '🥜', img: '/static/images/categories/nuts.jpg', active: false, children: [
    { name: '核桃', children: ['纸皮核桃', '云南核桃', '新疆核桃'] },
    { name: '板栗', children: ['迁西板栗', '罗田板栗'] },
    { name: '枸杞', children: ['宁夏枸杞', '青海枸杞'] },
  ]},
  { name: '进口水果', icon: '🌍', img: '/static/images/categories/imported.jpg', active: false, children: [
    { name: '车厘子', children: ['智利车厘子', '美国车厘子', '新西兰车厘子'] },
    { name: '奇异果', children: ['新西兰佳沛', '意大利金果'] },
    { name: '牛油果', children: ['墨西哥牛油果', '秘鲁牛油果'] },
  ]},
]

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

const l2List = computed(() => {
  const l1 = catTree.find(c => c.name === selectedL1.value)
  return l1 ? l1.children : []
})
const l3List = computed(() => {
  const l2 = l2List.value.find(c => c.name === selectedL2.value)
  return l2 ? l2.children : []
})
const pathText = computed(() => {
  return [selectedL1.value, selectedL2.value, selectedL3.value].filter(Boolean).join(' > ')
})

function openCategory(l1) {
  selectedL1.value = l1.name
  selectedL2.value = ''
  selectedL3.value = ''
  showPanel.value = !showPanel.value
}
function selectL1(l1) { selectedL1.value = l1.name; selectedL2.value = ''; selectedL3.value = '' }
function selectL2(l2) { selectedL2.value = l2.name; selectedL3.value = '' }
function selectL3(l3) { selectedL3.value = selectedL3.value === l3 ? '' : l3 }
function applyCategory() {
  filterCategory.value = selectedL2.value || selectedL1.value
  filterVariety.value = selectedL3.value
  showPanel.value = false
  fetchProducts(true)
}
function clearCategory() {
  selectedL1.value = ''; selectedL2.value = ''; selectedL3.value = ''
  filterCategory.value = ''; filterVariety.value = ''
  showPanel.value = false
  fetchProducts(true)
}

async function fetchProducts(reset = false) {
  if (reset) { page.value = 1; hasMore.value = true; loading.value = true }
  try {
    const params = { page: page.value, page_size: 10 }
    if (keyword.value) params.keyword = keyword.value
    if (filterCategory.value) params.category = filterCategory.value
    if (filterVariety.value) params.variety = filterVariety.value
    const res = await get('/products', params)
    const imgPool = ['/static/images/mall/product-1.jpg','/static/images/mall/product-2.jpg','/static/images/mall/product-3.jpg','/static/images/mall/product-4.jpg','/static/images/mall/product-5.jpg','/static/images/mall/product-6.jpg','/static/images/mall/product-7.jpg','/static/images/mall/product-8.jpg']
    const list = (res.products || []).map((p, idx) => ({
      ...p,
      img: imgPool[idx % imgPool.length],
      emoji: fruitEmoji(p.category, p.variety),
      tag: p.grade === '特级' ? '精品' : p.price > 50 ? '空运' : '',
      tagColor: p.grade === '特级' ? 'gold' : p.price > 50 ? 'blue' : '',
    }))
    products.value = reset ? list : [...products.value, ...list]
    hasMore.value = list.length >= 10
  } catch (e) { if (reset) products.value = [] }
  finally { loading.value = false; loadingMore.value = false }
}

function fruitEmoji(cat, variety) {
  const map = { '苹果': '🍎', '梨': '🍐', '橙子': '🍊', '葡萄': '🍇', '草莓': '🍓', '蓝莓': '🫐', '猕猴桃': '🥝', '樱桃': '🍒', '桃子': '🍑', '芒果': '🥭', '荔枝': '🍈', '榴莲': '🥥', '西瓜': '🍉', '香蕉': '🍌', '火龙果': '🐉', '柠檬': '🍋' }
  return map[variety] || map[cat] || '🍎'
}

function onSearch() { fetchProducts(true) }
function loadMore() { if (!loadingMore.value && hasMore.value) { loadingMore.value = true; page.value++; fetchProducts(false) } }

onShow(() => { fetchProducts(true) })
onPullDownRefresh(() => { fetchProducts(true).then(() => uni.stopPullDownRefresh()).catch(() => uni.stopPullDownRefresh()) })
</script>

<style scoped lang="scss">
.page { padding: 24rpx; min-height: 100vh; background: var(--bg); }

/* Search */
.search-bar { margin-bottom: 24rpx; }
.search-wrap {
  display: flex; align-items: center; background: #fff;
  border-radius: 16rpx; padding: 16rpx 20rpx; gap: 12rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
}
.search-input { flex: 1; font-size: 28rpx; color: var(--text); border: none; outline: none; background: transparent; }
.search-filter { font-size: 28rpx; }

/* Category Grid */
.cat-grid {
  display: flex; flex-wrap: wrap; gap: 24rpx 12rpx;
  padding: 24rpx 12rpx; margin-bottom: 24rpx;
}
.cat-item { width: 20%; display: flex; flex-direction: column; align-items: center; gap: 10rpx; }
.cat-icon {
  width: 80rpx; height: 80rpx; border-radius: 18rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 36rpx; transition: all 0.2s;
  &:nth-child(odd) { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); }
  &:nth-child(even) { background: linear-gradient(135deg, #F1F8E9, #DCEDC8); }
}
.cat-icon-active { background: linear-gradient(135deg, var(--primary), #1A5C3E) !important; }
.cat-icon-active .cat-emoji { transform: scale(1.15); }
.cat-icon-active { background: #BFEDD7; }
.cat-label { font-size: 22rpx; color: var(--text-secondary); text-align: center; }

/* Category Panel */
.cat-panel { margin-bottom: 24rpx; overflow: hidden; }
.cp-columns { display: flex; height: 440rpx; }
.cp-col { flex: 1; border-right: 1px solid var(--border-light); }
.cp-col:last-child { border-right: none; }
.cp-l1 { background: #FAFAFA; }
.cp-l2 { background: #F5F5F5; }
.cp-item { padding: 18rpx 14rpx; font-size: 26rpx; color: var(--text-secondary); }
.cp-item.active { background: #fff; color: var(--primary); font-weight: 600; }
.cp-actions { display: flex; gap: 16rpx; padding: 16rpx 20rpx; border-top: 1px solid var(--border-light); }
.cp-btn-clear { flex: 1; text-align: center; padding: 16rpx 0; border-radius: 8rpx; border: 1px solid var(--border); color: var(--text-secondary); font-size: 28rpx; }
.cp-btn-confirm { flex: 2; text-align: center; padding: 16rpx 0; border-radius: 8rpx; background: var(--primary); color: #fff; font-size: 28rpx; font-weight: 600; }

/* Filter Tag */
.filter-tag {
  display: inline-flex; align-items: center; gap: 8rpx;
  background: var(--primary); color: #fff; padding: 8rpx 20rpx;
  border-radius: 20rpx; font-size: 24rpx; margin-bottom: 16rpx;
}
.filter-tag-x { font-size: 24rpx; padding: 4rpx; }

/* Product Grid - 2 columns */
.product-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.product-card {
  width: calc(50% - 8rpx);
  background: #fff; border-radius: 16rpx; overflow: hidden;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
  transition: transform 0.15s;
  &:active { transform: scale(0.97); }
}
.pc-img-wrap {
  position: relative; height: 240rpx; overflow: hidden;
}
.pc-img-real { position: absolute; inset: 0; width: 100%; height: 100%; }
.pc-img-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #E8F5E9, #F1F8E9);
}
.pc-img-emoji { font-size: 80rpx; }
.pc-tag {
  position: absolute; top: 12rpx; right: 12rpx;
  padding: 4rpx 14rpx; border-radius: 6rpx;
  font-size: 20rpx; font-weight: 700;
}
.tag-gold { background: #FFDEA4; color: #5A4312; }
.tag-blue { background: #DBEAFE; color: #1E40AF; }

.pc-body { padding: 16rpx 20rpx 20rpx; }
.pc-name { font-size: 28rpx; font-weight: 700; color: var(--text); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pc-origin { font-size: 22rpx; color: var(--text-muted); margin-top: 6rpx; display: block; }
.pc-price-row { margin-top: 12rpx; }
.pc-price { font-size: 32rpx; font-weight: 700; color: var(--primary); }
.pc-unit { font-size: 22rpx; font-weight: 400; color: var(--text-muted); }
.pc-footer { margin-top: 12rpx; padding-top: 12rpx; border-top: 1px solid var(--border-light); }
.pc-supplier { display: flex; align-items: center; gap: 8rpx; }
.pc-avatar {
  width: 32rpx; height: 32rpx; border-radius: 50%;
  background: #FFDEA4; display: flex; align-items: center; justify-content: center;
  font-size: 18rpx; color: #5A4312; font-weight: 600;
}
.pc-supplier-name { font-size: 22rpx; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* States */
.loading-state { padding: 80rpx 0; text-align: center; color: var(--text-muted); font-size: 28rpx; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 120rpx 0; }
.empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.empty-text { font-size: 28rpx; color: var(--text-muted); }
.load-more { padding: 32rpx 0; text-align: center; color: var(--primary); font-size: 28rpx; }
.bottom-spacer { height: 80rpx; }
</style>
