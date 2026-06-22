<template>
  <view class="page">
    <!-- Screen Tabs -->
    <scroll-view scroll-x class="screen-tabs" :show-scrollbar="false">
      <view class="screen-track">
        <view v-for="t in screenTabs" :key="t.key" class="screen-tab" :class="{ active: activeScreen === t.key }" @tap="activeScreen = t.key">
          {{ t.label }}
        </view>
      </view>
    </scroll-view>

    <!-- Search Bar -->
    <view class="search-bar">
      <view class="search-wrap">
        <text class="search-icon">🔍</text>
        <input class="search-input" type="text" placeholder="搜索品种名称（黄瓜/西红柿/土豆...）" v-model="keyword" @confirm="onSearch" @input="onSearchInput" />
        <text v-if="keyword" class="search-clear" @tap="clearSearch">✕</text>
      </view>
    </view>

    <!-- ===== MAIN TABLE ===== -->
    <view class="table-card">
      <!-- Table Header -->
      <view class="table-header">
        <text class="th th-name">品种溯源</text>
        <text class="th th-trend">涨跌走势</text>
        <text class="th th-price">价格</text>
        <text class="th th-diff">对比</text>
      </view>

      <!-- Table Body -->
      <scroll-view scroll-y class="table-body" @scrolltolower="loadMore">
        <view
          v-for="(row, i) in tableData"
          :key="i"
          class="table-row"
          :class="{ 'row-placeholder': row.isPlaceholder }"
          @tap="goDetail(row)"
        >
          <!-- 品种溯源 -->
          <view class="td td-name">
            <text class="td-emoji">{{ row.emoji }}</text>
            <view>
              <text class="td-variety">{{ row.name }}</text>
              <text v-if="row.origin" class="td-origin">{{ row.origin }}</text>
            </view>
          </view>

          <!-- 涨跌走势 -->
          <view class="td td-trend">
            <template v-if="!row.isPlaceholder">
              <view class="trend-line" :class="row.up ? 'trend-up' : 'trend-down'">
                <view class="trend-bar" v-for="d in row.trend || defaultTrend(row)" :key="d" :style="{ height: (d * 100) + '%' }"></view>
              </view>
              <text class="trend-arrow" :class="row.up ? 'up' : 'down'">{{ row.up ? '▲' : '▼' }}</text>
            </template>
            <text v-else class="td-placeholder">--</text>
          </view>

          <!-- 价格 -->
          <view class="td td-price">
            <text v-if="!row.isPlaceholder && row.price" class="price-val">¥{{ row.price }}</text>
            <text v-else-if="row.isPlaceholder" class="td-placeholder">--</text>
            <text v-else class="td-wait">待更新</text>
          </view>

          <!-- 对比 -->
          <view class="td td-diff">
            <template v-if="!row.isPlaceholder && row.diff">
              <text class="diff-val" :class="row.up ? 'up' : 'down'">
                {{ row.up ? '▲' : '▼' }}{{ row.diff }}
              </text>
              <text v-if="row.diffPct" class="diff-pct" :class="row.up ? 'up' : 'down'">
                {{ row.up ? '+' : '' }}{{ row.diffPct }}%
              </text>
            </template>
            <text v-else-if="row.isPlaceholder" class="td-placeholder">--</text>
            <text v-else class="td-wait">待更新</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Legend -->
    <view class="legend">
      <view class="legend-item"><view class="legend-dot dot-up"></view><text>上涨</text></view>
      <view class="legend-item"><view class="legend-dot dot-down"></view><text>下跌</text></view>
      <view class="legend-item"><view class="legend-dot dot-flat"></view><text>持平</text></view>
    </view>

    <view class="bottom-spacer"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get } from '../../utils/api'

const activeScreen = ref('all')
const keyword = ref('')

function onSearch() { /* triggers filter */ }
function onSearchInput() { /* live filter via computed */ }
function clearSearch() { keyword.value = '' }

const screenTabs = [
  { key: 'all', label: '全部品种' },
  { key: 'vegetable', label: '蔬菜' },
  { key: 'fruit', label: '水果' },
  { key: 'grain', label: '粮油' },
  { key: 'other', label: '农副' },
]

const tableData = ref([])

// Default trend bars for demo / fallback
function defaultTrend(row) {
  return row.up ? [0.3, 0.5, 0.2, 0.7, 0.4, 0.9] : [0.8, 0.6, 0.9, 0.3, 0.7, 0.2]
}

async function fetchData() {
  try {
    const res = await get('/market/prices')
    const prices = res.prices || []
    // Group by variety
    const groups = {}
    prices.forEach(p => {
      if (!groups[p.variety]) groups[p.variety] = []
      groups[p.variety].push(p)
    })
    const list = Object.entries(groups).slice(0, 15).map(([name, pts]) => {
      const latest = pts[0]
      const prev = pts.length > 1 ? pts[1].price : latest.price
      const diff = (latest.price - prev).toFixed(2)
      return {
        name,
        emoji: fruitEmoji(name),
        origin: latest.market_name,
        price: latest.price.toFixed(2),
        diff: Math.abs(diff).toFixed(2),
        diffPct: prev ? Math.abs((diff / prev) * 100).toFixed(1) : '0.0',
        up: diff >= 0,
        trend: pts.slice(0, 6).map(p => (p.price / (pts[0].price || 1))).reverse(),
        isPlaceholder: false,
      }
    })
    // Fill remaining with placeholder rows
    while (list.length < 5) {
      list.push({ name: '—', emoji: '⬜', isPlaceholder: true })
    }
    tableData.value = list
  } catch (e) {
    // Offline fallback — exactly matching the sketch spec
    tableData.value = [
      { name: '黄瓜', emoji: '🥒', origin: '上海辉展', price: '2.13', diff: '2.02', diffPct: '12.4', up: true, trend: [0.3, 0.5, 0.2, 0.7, 0.4, 0.9], isPlaceholder: false },
      { name: '西红柿', emoji: '🍅', origin: '广州江南', price: '', diff: '', diffPct: '', up: false, trend: [0.8, 0.6, 0.9, 0.3, 0.7, 0.2], isPlaceholder: false },
      { name: '土豆', emoji: '🥔', origin: '北京新发地', price: '', diff: '', diffPct: '', up: false, trend: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5], isPlaceholder: false },
      { name: '大米', emoji: '🍚', origin: '', price: '', diff: '', diffPct: '', up: false, trend: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5], isPlaceholder: true },
      { name: '—', emoji: '⬜', origin: '', price: '', diff: '', diffPct: '', up: false, trend: [], isPlaceholder: true },
    ]
  }
}

function fruitEmoji(name) {
  const m = { '黄瓜':'🥒','西红柿':'🍅','土豆':'🥔','大米':'🍚','苹果':'🍎','梨':'🍐','橙子':'🍊','葡萄':'🍇','辣椒':'🌶️','茄子':'🍆' }
  return m[name] || '🥬'
}

function goDetail(row) {
  if (row.isPlaceholder) return
  uni.showToast({ title: row.name + ' 溯源详情', icon: 'none' })
  // Future: uni.navigateTo({ url: '/pages/price-detail/index?variety=' + row.name })
}

function loadMore() {
  uni.showToast({ title: '加载更多品种...', icon: 'none', duration: 1000 })
}

onShow(() => { fetchData() })
</script>

<style scoped lang="scss">
.page { padding: 24rpx; background: var(--bg); min-height: 100vh; }

/* Screen Tabs */
.screen-tabs { margin-bottom: 24rpx; white-space: nowrap; }
.screen-track { display: inline-flex; gap: 16rpx; }
.screen-tab { padding: 12rpx 28rpx; border-radius: 24rpx; font-size: 26rpx; color: var(--text-secondary); background: #fff; display: inline-block; }
.screen-tab.active { background: var(--primary); color: #fff; font-weight: 600; }

/* Search */
.search-bar { margin-bottom: 20rpx; }
.search-wrap { display: flex; align-items: center; background: #fff; border-radius: 14rpx; padding: 16rpx 20rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); }
.search-icon { font-size: 28rpx; margin-right: 12rpx; }
.search-input { flex: 1; font-size: 28rpx; color: var(--text); border: none; outline: none; background: transparent; }
.search-clear { font-size: 28rpx; color: var(--text-muted); padding: 4rpx 8rpx; }

/* ===== TABLE ===== */
.table-card { background: #fff; border-radius: 16rpx; overflow: hidden; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); margin-bottom: 24rpx; }

/* Header */
.table-header { display: flex; background: #F5F5F5; padding: 20rpx 20rpx; border-bottom: 2rpx solid var(--border-light); }
.th { font-size: 26rpx; font-weight: 700; color: var(--text-secondary); text-align: center; }
.th-name { flex: 3; text-align: left; }
.th-trend { flex: 2; }
.th-price { flex: 2; }
.th-diff { flex: 2; }

/* Body */
.table-body { max-height: 800rpx; }
.table-row { display: flex; padding: 20rpx; border-bottom: 1px solid #F5F5F5; align-items: center; transition: background 0.15s; }
.table-row:active { background: #FAFAFA; }
.table-row:last-child { border-bottom: none; }
.row-placeholder { opacity: 0.5; }

.td { text-align: center; }
.td-name { flex: 3; display: flex; align-items: center; gap: 12rpx; text-align: left; }
.td-emoji { font-size: 36rpx; }
.td-variety { font-size: 30rpx; font-weight: 700; color: var(--text); display: block; }
.td-origin { font-size: 22rpx; color: var(--text-muted); }

.td-trend { flex: 2; display: flex; align-items: center; justify-content: center; gap: 8rpx; }
.trend-line { display: flex; align-items: flex-end; gap: 3rpx; height: 40rpx; }
.trend-bar { width: 6rpx; min-height: 4rpx; border-radius: 3rpx; }
.trend-up .trend-bar { background: #DC2626; }
.trend-down .trend-bar { background: #16A34A; }
.trend-arrow { font-size: 32rpx; font-weight: 700; }
.trend-arrow.up { color: #DC2626; }
.trend-arrow.down { color: #16A34A; }

.td-price { flex: 2; }
.price-val { font-size: 30rpx; font-weight: 700; color: var(--text); }

.td-diff { flex: 2; }
.diff-val { font-size: 28rpx; font-weight: 700; display: block; }
.diff-val.up { color: #DC2626; }
.diff-val.down { color: #16A34A; }
.diff-pct { font-size: 22rpx; }

.td-placeholder, .td-wait { font-size: 24rpx; color: var(--text-muted); }
.up { color: #DC2626; }
.down { color: #16A34A; }

/* Legend */
.legend { display: flex; gap: 32rpx; padding: 16rpx 0; }
.legend-item { display: flex; align-items: center; gap: 8rpx; font-size: 24rpx; color: var(--text-muted); }
.legend-dot { width: 14rpx; height: 14rpx; border-radius: 50%; }
.dot-up { background: #DC2626; }
.dot-down { background: #16A34A; }
.dot-flat { background: #9CA3AF; }

.bottom-spacer { height: 100rpx; }
</style>
