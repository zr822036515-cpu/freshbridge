<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <text class="header-title">行情大盘</text>
      <text class="header-date">{{ today }}</text>
    </view>

    <!-- Summary cards -->
    <view class="summary-row">
      <view class="summary-card">
        <text class="summary-num">{{ summary.total || '--' }}</text>
        <text class="summary-label">在售品种</text>
      </view>
      <view class="summary-card up">
        <text class="summary-num up-color">▲ {{ summary.up || 0 }}</text>
        <text class="summary-label">上涨</text>
      </view>
      <view class="summary-card down">
        <text class="summary-num down-color">▼ {{ summary.down || 0 }}</text>
        <text class="summary-label">下跌</text>
      </view>
    </view>

    <!-- Quick entries -->
    <view class="quick-entries">
      <view class="qe-card" @tap="goMall">
        <text class="qe-icon">🛍️</text>
        <text class="qe-title">品牌商城</text>
        <text class="qe-sub">鲜果直达</text>
      </view>
      <view class="qe-card" @tap="goFinance">
        <text class="qe-icon">💰</text>
        <text class="qe-title">商务服务</text>
        <text class="qe-sub">全程护航</text>
      </view>
      <view class="qe-card" @tap="goSupplyDemand">
        <text class="qe-icon">🤝</text>
        <text class="qe-title">大宗供需</text>
        <text class="qe-sub">产地直供</text>
      </view>
    </view>

    <!-- Hot ranking -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">🔥 热门品种排行</text>
        <text class="see-more" @tap="goRanking">更多 ›</text>
      </view>
      <view v-if="rankList.length === 0" class="empty-text">暂无数据</view>
      <view v-for="(item, i) in displayRank" :key="i" class="rank-item" :class="{ 'rank-top3': i < 3 }">
        <text class="rank-num" :class="'rank-' + (i + 1)">{{ i + 1 }}</text>
        <view class="rank-info">
          <text class="rank-variety">{{ item.variety }}</text>
          <text class="rank-market">{{ item.market_name }}</text>
        </view>
        <view class="rank-price">
          <text class="rank-amount">¥{{ item.price.toFixed(2) }}</text>
          <text :class="item.change_pct >= 0 ? 'up-color' : 'down-color'">
            {{ item.change_pct >= 0 ? '▲' : '▼' }}{{ Math.abs(item.change_pct).toFixed(1) }}%
          </text>
        </view>
      </view>
    </view>

    <!-- Gainers / Losers -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">📈 涨跌榜</text>
      </view>
      <view class="gl-row">
        <view class="gl-col">
          <text class="gl-title up-color">▲ 涨幅榜</text>
          <view v-for="(item, i) in gainers" :key="'g' + i" class="gl-item">
            <text class="gl-variety">{{ item.variety }}</text>
            <text class="gl-pct up-color">+{{ item.change_pct.toFixed(1) }}%</text>
          </view>
          <text v-if="gainers.length === 0" class="empty-text">暂无</text>
        </view>
        <view class="gl-divider" />
        <view class="gl-col">
          <text class="gl-title down-color">▼ 跌幅榜</text>
          <view v-for="(item, i) in losers" :key="'l' + i" class="gl-item">
            <text class="gl-variety">{{ item.variety }}</text>
            <text class="gl-pct down-color">{{ item.change_pct.toFixed(1) }}%</text>
          </view>
          <text v-if="losers.length === 0" class="empty-text">暂无</text>
        </view>
      </view>
    </view>

    <!-- Price trend chart -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">📊 价格走势</text>
      </view>
      <picker :range="varietyList" range-key="label" :value="trendIndex" @change="onVarietyChange" class="trend-picker">
        <view class="picker-display">
          <text>{{ varietyList[trendIndex] ? varietyList[trendIndex].label : '选择品种' }}</text>
          <text class="picker-arrow">▼</text>
        </view>
      </picker>
      <view v-if="trendPoints.length > 0" class="chart-area">
        <view class="chart-y">
          <text v-for="l in yLabels" :key="l" class="y-label">¥{{ l }}</text>
        </view>
        <view class="chart-canvas-wrapper">
          <canvas canvas-id="trendCanvas" id="trendCanvas" class="chart-canvas" @touchstart="onChartTouch" />
        </view>
        <view class="chart-x">
          <text v-for="(d, i) in xLabels" :key="i" class="x-label">{{ d }}</text>
        </view>
      </view>
      <view v-else class="empty-text">请选择品种查看走势</view>
      <!-- Market prices for selected variety -->
      <view v-if="trendMarkets.length > 0" class="trend-markets">
        <view v-for="m in trendMarkets" :key="m.market" class="trend-market-item">
          <text class="tm-name">{{ m.market }}</text>
          <text class="tm-price">¥{{ m.price.toFixed(2) }}</text>
          <text :class="m.change >= 0 ? 'up-color' : 'down-color'">
            {{ m.change >= 0 ? '▲' : '▼' }}{{ Math.abs(m.change).toFixed(1) }}%
          </text>
        </view>
      </view>
    </view>

    <!-- Market comparison -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">🏪 市场价格对比</text>
      </view>
      <view class="market-table">
        <view class="mt-header">
          <text class="mt-cell name">市场</text>
          <text class="mt-cell num">品种数</text>
          <text class="mt-cell num">均价</text>
        </view>
        <view v-for="m in marketCompare" :key="m.market" class="mt-row">
          <text class="mt-cell name">{{ m.market }}</text>
          <text class="mt-cell num">{{ m.count }}</text>
          <text class="mt-cell num bold">¥{{ m.avg.toFixed(2) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get } from '../../utils/api'

const today = ref(new Date().toISOString().slice(0, 10))

// Summary
const summary = ref({ total: 0, up: 0, down: 0 })
// Rankings
const rankList = ref([])
const displayRank = computed(() => rankList.value.slice(0, 10))

// Gainers / Losers
const gainers = computed(() => rankList.value.filter(r => r.change_pct > 0).slice(0, 5))
const losers = computed(() => rankList.value.filter(r => r.change_pct < 0).slice(0, 5))

// Trend
const varietyList = ref([])
const trendIndex = ref(0)
const trendPoints = ref([])
const trendMarkets = ref([])
const yLabels = ref([])
const xLabels = ref([])

// Market comparison
const marketCompare = ref([])

// Fetch summary
async function fetchSummary() {
  try {
    const res = await get('/market/summary')
    const s = res.summary || {}
    summary.value = { total: s.total_varieties || 0, up: s.up_count || 0, down: s.down_count || 0 }
  } catch (e) { /* silent */ }
}

// Fetch latest prices for ranking
async function fetchRankings() {
  try {
    const res = await get('/market/prices')
    const all = res.prices || []
    rankList.value = all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    // Build variety list for picker
    const seen = new Set()
    varietyList.value = []
    all.forEach(p => {
      if (!seen.has(p.variety)) {
        seen.add(p.variety)
        varietyList.value.push({ label: p.variety, value: p.variety })
      }
    })
    // Build market comparison
    const markets = {}
    all.forEach(p => {
      if (!markets[p.market_name]) markets[p.market_name] = { total: 0, count: 0 }
      markets[p.market_name].total += p.price
      markets[p.market_name].count++
    })
    marketCompare.value = Object.entries(markets).map(([market, d]) => ({
      market,
      count: d.count,
      avg: d.total / d.count
    }))
  } catch (e) { /* silent */ }
}

// Fetch trend for selected variety
async function fetchTrend() {
  if (varietyList.value.length === 0) return
  const variety = varietyList.value[trendIndex.value].value
  try {
    const res = await get('/market/trend', { variety })
    trendPoints.value = res.points || []
    // Compute y labels
    if (trendPoints.value.length > 0) {
      const prices = trendPoints.value.map(p => p.price)
      const min = Math.floor(Math.min(...prices) - 1)
      const max = Math.ceil(Math.max(...prices) + 1)
      const step = (max - min) / 4
      yLabels.value = [min + step * 4, min + step * 3, min + step * 2, min + step, min].map(v => parseFloat(v.toFixed(1)))
      // X labels: unique dates
      const dates = [...new Set(trendPoints.value.map(p => p.date.slice(5, 10)))]
      xLabels.value = dates
      // Current market prices
      const latest = {}
      trendPoints.value.forEach(p => {
        if (!latest[p.market] || p.date > latest[p.market].date) latest[p.market] = p
      })
      // Get change for each market from trend
      const marketPriceMap = {}
      trendPoints.value.forEach(p => {
        if (!marketPriceMap[p.market]) marketPriceMap[p.market] = []
        marketPriceMap[p.market].push(p)
      })
      trendMarkets.value = Object.entries(marketPriceMap).map(([market, pts]) => {
        const latestPt = pts[pts.length - 1]
        const prev = pts.length > 1 ? pts[pts.length - 2].price : latestPt.price
        return { market, price: latestPt.price, change: prev ? ((latestPt.price - prev) / prev * 100) : 0 }
      })
      // Draw chart after DOM update
      setTimeout(drawChart, 300)
    }
  } catch (e) { /* silent */ }
}

function onVarietyChange(e) {
  trendIndex.value = e.detail.value
  fetchTrend()
}

function goMall() { uni.navigateTo({ url: '/pages/mall/index' }) }
function goFinance() { uni.navigateTo({ url: '/pages/finance/index' }) }
function goSupplyDemand() { uni.navigateTo({ url: '/pages/supply-demand/index' }) }
function goRanking() { uni.navigateTo({ url: '/pages/ranking/index' }) }

onShow(() => {
  fetchSummary()
  fetchRankings().then(fetchTrend)
})

// Draw line chart
function drawChart() {
  // #ifdef H5
  const canvas = document.getElementById('trendCanvas')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.offsetWidth || 300
  const h = canvas.offsetHeight || 160
  canvas.width = w
  canvas.height = h
  const pts = trendPoints.value
  if (pts.length === 0) return
  const prices = pts.map(p => p.price)
  const minP = Math.min(...prices) - 1
  const maxP = Math.max(...prices) + 1
  const range = maxP - minP || 1
  const padL = 10, padR = 10, padT = 10, padB = 20
  // Group by date
  const byDate = {}
  pts.forEach(p => {
    const d = p.date.slice(0, 10)
    if (!byDate[d]) byDate[d] = []
    byDate[d].push(p)
  })
  const dates = Object.keys(byDate)
  if (dates.length < 2) return
  // Draw line
  ctx.strokeStyle = '#15803D'
  ctx.lineWidth = 2
  ctx.beginPath()
  let first = true
  dates.forEach((d, i) => {
    const avg = byDate[d].reduce((s, p) => s + p.price, 0) / byDate[d].length
    const x = padL + (i / (dates.length - 1)) * (w - padL - padR)
    const y = padT + ((maxP - avg) / range) * (h - padT - padB)
    if (first) { ctx.moveTo(x, y); first = false }
    else ctx.lineTo(x, y)
  })
  ctx.stroke()
  // Draw dots
  dates.forEach((d, i) => {
    const avg = byDate[d].reduce((s, p) => s + p.price, 0) / byDate[d].length
    const x = padL + (i / (dates.length - 1)) * (w - padL - padR)
    const y = padT + ((maxP - avg) / range) * (h - padT - padB)
    ctx.fillStyle = '#15803D'
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
  })
  // #endif
}

function onChartTouch(e) { /* future: tooltip */ }
</script>

<style scoped lang="scss">
.page {
  padding: 24rpx;
  min-height: 100vh;
  padding-bottom: 100rpx;
}

.header {
  margin-bottom: 24rpx;
  .header-title { font-size: 36rpx; font-weight: 700; color: #14532D; display: block; }
  .header-date { font-size: 32rpx; color: #999; margin-top: 8rpx; display: block; }
}

/* Summary cards */
.summary-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}
.summary-card {
  flex: 1;
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
  .summary-num { font-size: 40rpx; font-weight: 700; color: #14532D; display: block; }
  .summary-label { font-size: 28rpx; color: #999; margin-top: 8rpx; display: block; }
}
/* Quick entries */
.quick-entries { display: flex; gap: 16rpx; margin-bottom: 24rpx; }
.qe-card {
  flex: 1; background: #fff; border-radius: 12rpx; padding: 24rpx 16rpx;
  text-align: center; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}
.qe-icon { font-size: 44rpx; display: block; }
.qe-title { font-size: 28rpx; font-weight: 600; color: #14532D; margin-top: 8rpx; display: block; }
.qe-sub { font-size: 22rpx; color: #999; margin-top: 4rpx; display: block; }

.up-color { color: #22C55E; }
.down-color { color: #EF4444; }

/* Section */
.section {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  .section-title { font-size: 34rpx; font-weight: 600; color: #14532D; }
  .see-more { font-size: 28rpx; color: #15803D; }
}

/* Rankings */
.rank-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1px solid #F0FDF4;
  &:last-child { border-bottom: none; }
}
.rank-num {
  width: 48rpx; height: 48rpx; line-height: 48rpx;
  text-align: center; font-size: 32rpx; font-weight: 700;
  background: #F0FDF4; border-radius: 8rpx; margin-right: 16rpx; color: #15803D;
  &.rank-1 { background: #15803D; color: #fff; }
  &.rank-2 { background: #22C55E; color: #fff; }
  &.rank-3 { background: #86EFAC; color: #14532D; }
}
.rank-info { flex: 1; }
.rank-variety { font-size: 32rpx; color: #14532D; display: block; }
.rank-market { font-size: 28rpx; color: #999; }
.rank-price { text-align: right; }
.rank-amount { font-size: 32rpx; font-weight: 600; color: #14532D; display: block; }

/* Gainers / Losers */
.gl-row { display: flex; }
.gl-col { flex: 1; }
.gl-divider { width: 1px; background: #E5E7EB; margin: 0 16rpx; }
.gl-title { font-size: 30rpx; font-weight: 600; margin-bottom: 16rpx; display: block; }
.gl-item { display: flex; justify-content: space-between; padding: 10rpx 0; }
.gl-variety { font-size: 32rpx; color: #14532D; }
.gl-pct { font-size: 32rpx; font-weight: 600; }

/* Trend chart */
.trend-picker { margin-bottom: 16rpx; }
.picker-display {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16rpx 20rpx; background: #F0FDF4; border-radius: 8rpx;
  font-size: 32rpx; color: #15803D; min-height: 44px;
  .picker-arrow { font-size: 24rpx; color: #999; }
}
.chart-area { display: flex; }
.chart-y { width: 80rpx; display: flex; flex-direction: column-reverse; padding-bottom: 20rpx; }
.y-label { font-size: 20rpx; color: #999; line-height: 2; text-align: right; }
.chart-canvas-wrapper { flex: 1; }
.chart-canvas { width: 100%; height: 320rpx; }
.chart-x { display: flex; justify-content: space-around; padding-left: 80rpx; }
.x-label { font-size: 22rpx; color: #999; }
.trend-markets { margin-top: 20rpx; padding-top: 20rpx; border-top: 1px solid #F0FDF4; }
.trend-market-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12rpx 0; border-bottom: 1px solid #F0FDF4;
  &:last-child { border-bottom: none; }
}
.tm-name { font-size: 32rpx; color: #14532D; }
.tm-price { font-size: 32rpx; font-weight: 600; color: #14532D; }

/* Market comparison */
.market-table { }
.mt-header, .mt-row { display: flex; padding: 12rpx 0; }
.mt-header { border-bottom: 2px solid #15803D; }
.mt-row { border-bottom: 1px solid #F0FDF4; }
.mt-cell { font-size: 32rpx; color: #14532D; }
.mt-cell.name { flex: 2; }
.mt-cell.num { flex: 1; text-align: center; }
.mt-cell.bold { font-weight: 600; }
.mt-header .mt-cell { font-weight: 600; color: #15803D; }

.empty-text { font-size: 32rpx; color: #999; text-align: center; padding: 40rpx 0; display: block; }
</style>
