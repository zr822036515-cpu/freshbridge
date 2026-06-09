<template>
  <view class="page">
    <!-- Banner Carousel -->
    <swiper class="banner-swiper" indicator-dots indicator-active-color="#C9A96E" autoplay circular>
      <swiper-item v-for="(b, i) in banners" :key="i">
        <view class="banner-slide">
          <image v-if="b.img" :src="b.img" mode="aspectFill" class="banner-img" />
          <view class="banner-overlay"></view>
          <view class="banner-content">
            <text class="banner-text">{{ b.text }}</text>
            <text class="banner-sub">{{ b.sub || '鲜桥 FreshBridge' }}</text>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- 4-Column Quick Entries -->
    <view class="quick-grid">
      <view class="quick-item" @tap="goMall">
        <view class="quick-icon-box qib-green">
          <image src="/static/images/icon-mall.svg" mode="aspectFit" class="quick-img" />
        </view>
        <text class="quick-label">品牌商城</text>
      </view>
      <view class="quick-item" @tap="goFinance">
        <view class="quick-icon-box qib-gold">
          <image src="/static/images/icon-service.svg" mode="aspectFit" class="quick-img" />
        </view>
        <text class="quick-label">全链路服务</text>
      </view>
      <view class="quick-item" @tap="goSupplyDemand">
        <view class="quick-icon-box qib-orange">
          <image src="/static/images/icon-supply-demand.svg" mode="aspectFit" class="quick-img" />
        </view>
        <text class="quick-label">大宗供需</text>
      </view>
      <view class="quick-item" @tap="goRanking">
        <view class="quick-icon-box qib-blue">
          <image src="/static/images/icon-ranking.svg" mode="aspectFit" class="quick-img" />
        </view>
        <text class="quick-label">品种排行</text>
      </view>
    </view>

    <!-- Market Ticker -->
    <view class="ticker-bar" v-if="tickerMsgs.length > 0">
      <view class="ticker-dot"></view>
      <swiper class="ticker-swiper" vertical autoplay circular :interval="3000" :duration="500">
        <swiper-item v-for="(msg, i) in tickerMsgs" :key="i">
          <text class="ticker-text">{{ msg }}</text>
        </swiper-item>
      </swiper>
    </view>

    <!-- Stats Summary Row -->
    <view class="stats-row">
      <view class="stat-item">
        <text class="stat-num">{{ summary.total || '--' }}</text>
        <text class="stat-label">在售品种</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-num up">{{ summary.up || 0 }}</text>
        <text class="stat-label">上涨</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-num down">{{ summary.down || 0 }}</text>
        <text class="stat-label">下跌</text>
      </view>
    </view>

    <!-- Hot Ranking -->
    <view class="section">
      <view class="section-header">
        <view class="section-title-row">
          <view class="section-dot dot-orange"></view>
          <text class="section-title">热门品种排行</text>
        </view>
        <text class="see-more" @tap="goRanking">更多 ›</text>
      </view>
      <view v-if="rankList.length === 0" class="empty-text">暂无数据</view>
      <view v-for="(item, i) in displayRank" :key="i" class="rank-card">
        <view class="rank-badge" :class="'rank-' + (i + 1)">{{ i + 1 }}</view>
        <view class="rank-info">
          <text class="rank-variety">{{ item.variety }}</text>
          <text class="rank-market">{{ item.market_name }}</text>
        </view>
        <view class="rank-price-col">
          <text class="rank-price">¥{{ item.price.toFixed(2) }}</text>
          <view class="rank-change" :class="item.change_pct >= 0 ? 'up' : 'down'">
            <text>{{ item.change_pct >= 0 ? '▲' : '▼' }}{{ Math.abs(item.change_pct).toFixed(1) }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Gainers / Losers -->
    <view class="section">
      <view class="section-header">
        <view class="section-title-row">
          <view class="section-bar bar-green"></view>
          <text class="section-title">涨跌榜</text>
        </view>
      </view>
      <view class="gl-row">
        <view class="gl-col">
          <text class="gl-title up">▲ 涨幅榜</text>
          <view v-for="(item, i) in gainers" :key="'g' + i" class="gl-item">
            <text class="gl-variety">{{ item.variety }}</text>
            <text class="gl-pct up">+{{ item.change_pct.toFixed(1) }}%</text>
          </view>
          <text v-if="gainers.length === 0" class="empty-text">暂无</text>
        </view>
        <view class="gl-divider" />
        <view class="gl-col">
          <text class="gl-title down">▼ 跌幅榜</text>
          <view v-for="(item, i) in losers" :key="'l' + i" class="gl-item">
            <text class="gl-variety">{{ item.variety }}</text>
            <text class="gl-pct down">{{ item.change_pct.toFixed(1) }}%</text>
          </view>
          <text v-if="losers.length === 0" class="empty-text">暂无</text>
        </view>
      </view>
    </view>

    <!-- Price Trend Chart -->
    <view class="section">
      <view class="section-header">
        <view class="section-title-row">
          <view class="section-dot dot-green"></view>
          <text class="section-title">价格走势</text>
        </view>
      </view>
      <picker :range="varietyList" range-key="label" :value="trendIndex" @change="onVarietyChange" class="trend-picker">
        <view class="picker-display">
          <text>{{ varietyList[trendIndex] ? varietyList[trendIndex].label : '选择品种' }}</text>
          <text class="picker-arrow">›</text>
        </view>
      </picker>
      <view v-if="trendPoints.length > 0" class="chart-area">
        <view class="chart-y">
          <text v-for="l in yLabels" :key="l" class="y-label">{{ l }}</text>
        </view>
        <view class="chart-canvas-wrapper">
          <canvas canvas-id="trendCanvas" id="trendCanvas" class="chart-canvas" @touchstart="onChartTouch" />
        </view>
        <view class="chart-x">
          <text v-for="(d, i) in xLabels" :key="i" class="x-label">{{ d }}</text>
        </view>
      </view>
      <view v-else class="empty-text">请选择品种查看走势</view>
      <view v-if="trendMarkets.length > 0" class="trend-markets">
        <view v-for="m in trendMarkets" :key="m.market" class="trend-market-item">
          <text class="tm-name">{{ m.market }}</text>
          <text class="tm-price">¥{{ m.price.toFixed(2) }}</text>
          <text :class="m.change >= 0 ? 'up' : 'down'">
            {{ m.change >= 0 ? '▲' : '▼' }}{{ Math.abs(m.change).toFixed(1) }}%
          </text>
        </view>
      </view>
    </view>

    <!-- Market Comparison -->
    <view class="section">
      <view class="section-header">
        <view class="section-title-row">
          <view class="section-bar bar-gold"></view>
          <text class="section-title">市场价格对比</text>
        </view>
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

    <!-- Bottom spacer for tab bar -->
    <view style="height: 120rpx;" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get } from '../../utils/api'

const today = ref(new Date().toISOString().slice(0, 10))

// Banners — img prefers real photo, falls back to emoji placeholder
const banners = ref([
  { text: '产地直采', sub: '源头把控 · 一手货源', img: '/static/images/banners/banner-1.jpg' },
  { text: '全国档口', sub: '快速去化 · 品质保证', img: '/static/images/banners/banner-2.jpg' },
  { text: '品质溯源', sub: '从枝头到舌尖的安心', img: '/static/images/banners/banner-3.jpg' },
])

// Ticker messages
const tickerMsgs = ref([
  '🔥 妃子笑荔枝今日成交量破 2,000 斤',
  '📦 云南阳光玫瑰新到货，价格微涨 2.3%',
  '🏆 本周最受欢迎：新疆阿克苏苹果',
])

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

async function fetchSummary() {
  try {
    const res = await get('/market/summary')
    const s = res.summary || {}
    summary.value = { total: s.total_varieties || 0, up: s.up_count || 0, down: s.down_count || 0 }
  } catch (e) { /* silent */ }
}

async function fetchRankings() {
  try {
    const res = await get('/market/prices')
    const all = res.prices || []
    rankList.value = all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    const seen = new Set()
    varietyList.value = []
    all.forEach(p => {
      if (!seen.has(p.variety)) {
        seen.add(p.variety)
        varietyList.value.push({ label: p.variety, value: p.variety })
      }
    })
    const markets = {}
    all.forEach(p => {
      if (!markets[p.market_name]) markets[p.market_name] = { total: 0, count: 0 }
      markets[p.market_name].total += p.price
      markets[p.market_name].count++
    })
    marketCompare.value = Object.entries(markets).map(([market, d]) => ({
      market, count: d.count, avg: d.total / d.count
    }))
  } catch (e) { /* silent */ }
}

async function fetchTrend() {
  if (varietyList.value.length === 0) return
  const variety = varietyList.value[trendIndex.value].value
  try {
    const res = await get('/market/trend', { variety })
    trendPoints.value = res.points || []
    if (trendPoints.value.length > 0) {
      const prices = trendPoints.value.map(p => p.price)
      const min = Math.floor(Math.min(...prices) - 1)
      const max = Math.ceil(Math.max(...prices) + 1)
      const step = (max - min) / 4
      yLabels.value = [min + step * 4, min + step * 3, min + step * 2, min + step, min].map(v => parseFloat(v.toFixed(1)))
      const dates = [...new Set(trendPoints.value.map(p => p.date.slice(5, 10)))]
      xLabels.value = dates
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
  const byDate = {}
  pts.forEach(p => {
    const d = p.date.slice(0, 10)
    if (!byDate[d]) byDate[d] = []
    byDate[d].push(p)
  })
  const dates = Object.keys(byDate)
  if (dates.length < 2) return
  ctx.strokeStyle = '#0F3B2C'
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
    ctx.fillStyle = '#0F3B2C'
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
  padding-bottom: 120rpx;
  background: var(--bg);
}

/* ========== Banner ========== */
.banner-swiper {
  height: 340rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.1);
}
.banner-slide {
  height: 100%; position: relative;
}
.banner-img { position: absolute; inset: 0; width: 100%; height: 100%; }
.banner-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.05) 100%); z-index: 1; }
.banner-content { position: absolute; left: 32rpx; bottom: 32rpx; z-index: 2; }
.banner-text { font-size: 40rpx; font-weight: 700; color: #fff; display: block; letter-spacing: 2rpx; text-shadow: 0 2rpx 12rpx rgba(0,0,0,0.3); }
.banner-sub { font-size: 24rpx; color: rgba(255,255,255,0.85); margin-top: 6rpx; display: block; letter-spacing: 1rpx; }

/* ========== Quick Entry Grid ========== */
.quick-grid {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24rpx;
  padding: 24rpx;
  background: var(--white);
  border-radius: 12rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
}
.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}
.quick-icon-box {
  width: 92rpx;
  height: 92rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42rpx;
  transition: transform 0.2s;
}
.quick-item:active .quick-icon-box { transform: scale(0.92); }
.qib-green { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); }
.qib-gold { background: linear-gradient(135deg, #FFF8E1, #FFECB3); }
.qib-orange { background: linear-gradient(135deg, #FFF3E0, #FFE0B2); }
.qib-blue { background: linear-gradient(135deg, #E3F2FD, #BBDEFB); }
.quick-img { width: 44rpx; height: 44rpx; }
.quick-label { font-size: 24rpx; color: var(--text-secondary); text-align: center; margin-top: 4rpx; }

/* ========== Ticker Bar ========== */
.ticker-bar {
  display: flex;
  align-items: center;
  background: var(--gold-light);
  border-radius: 8rpx;
  padding: 12rpx 16rpx;
  margin-bottom: 24rpx;
  height: 56rpx;
  overflow: hidden;
}
.ticker-icon { font-size: 28rpx; margin-right: 12rpx; flex-shrink: 0; }
.ticker-swiper { flex: 1; height: 56rpx; }
.ticker-text { font-size: 26rpx; color: var(--text-secondary); line-height: 56rpx; white-space: nowrap; }

/* ========== Stats Row ========== */
.stats-row {
  display: flex;
  background: var(--white);
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
}
.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-divider { width: 1px; background: var(--border-light); margin: 0 8rpx; }
.stat-num { font-size: 40rpx; font-weight: 700; color: var(--text); display: block; }
.stat-num.up { color: var(--up); }
.stat-num.down { color: var(--danger); }
.stat-label { font-size: 24rpx; color: var(--text-muted); margin-top: 4rpx; display: block; }

/* ========== Section ========== */
.section {
  background: var(--white);
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.section-title-row { display: flex; align-items: center; gap: 12rpx; }
/* Section indicators */
.section-dot { width: 12rpx; height: 12rpx; border-radius: 50%; flex-shrink: 0; }
.dot-orange { background: #D97706; }
.dot-green { background: var(--primary); }
.section-bar { width: 6rpx; height: 22rpx; border-radius: 3rpx; flex-shrink: 0; }
.bar-green { background: var(--primary); }
.bar-gold { background: var(--gold); }
/* Ticker dot */
.ticker-bar { display: flex; align-items: center; gap: 12rpx; }
.ticker-dot { width: 14rpx; height: 14rpx; border-radius: 50%; background: var(--primary); flex-shrink: 0; animation: pulse 2s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.ticker-icon { display: none; }
.section-title { font-size: 32rpx; font-weight: 600; color: var(--text); }
.see-more { font-size: 26rpx; color: var(--primary); }

/* ---------- Hot Ranking ---------- */
.rank-card {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid var(--border-light);
  &:last-child { border-bottom: none; }
}
.rank-badge {
  width: 48rpx;
  height: 48rpx;
  line-height: 48rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 700;
  border-radius: 12rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
  background: #F0F0F0;
  color: var(--text-secondary);
  &.rank-1 { background: #C9A96E; color: #fff; }
  &.rank-2 { background: #B0B0B0; color: #fff; }
  &.rank-3 { background: #CDA87A; color: #fff; }
}
.rank-info { flex: 1; }
.rank-variety { font-size: 30rpx; font-weight: 600; color: var(--text); display: block; }
.rank-market { font-size: 24rpx; color: var(--text-muted); }
.rank-price-col { text-align: right; }
.rank-price { font-size: 30rpx; font-weight: 700; color: var(--text); display: block; }
.rank-change { font-size: 24rpx; font-weight: 600; }
.up { color: var(--up); }
.down { color: var(--danger); }

/* ---------- Gainers / Losers ---------- */
.gl-row { display: flex; }
.gl-col { flex: 1; }
.gl-divider { width: 1px; background: var(--border-light); margin: 0 16rpx; }
.gl-title { font-size: 28rpx; font-weight: 600; margin-bottom: 16rpx; display: block; }
.gl-item { display: flex; justify-content: space-between; padding: 10rpx 0; }
.gl-variety { font-size: 28rpx; color: var(--text); }
.gl-pct { font-size: 28rpx; font-weight: 600; }

/* ---------- Trend Chart ---------- */
.trend-picker { margin-bottom: 16rpx; }
.picker-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 20rpx;
  background: #F5F5F5;
  border-radius: 8rpx;
  font-size: 30rpx;
  color: var(--text);
  min-height: 44px;
  .picker-arrow { font-size: 28rpx; color: var(--text-muted); font-weight: 600; }
}
.chart-area { display: flex; }
.chart-y { width: 80rpx; display: flex; flex-direction: column-reverse; padding-bottom: 20rpx; }
.y-label { font-size: 20rpx; color: var(--text-muted); line-height: 2; text-align: right; }
.chart-canvas-wrapper { flex: 1; }
.chart-canvas { width: 100%; height: 320rpx; }
.chart-x { display: flex; justify-content: space-around; padding-left: 80rpx; }
.x-label { font-size: 22rpx; color: var(--text-muted); }
.trend-markets { margin-top: 20rpx; padding-top: 20rpx; border-top: 1px solid var(--border-light); }
.trend-market-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12rpx 0; border-bottom: 1px solid var(--border-light);
  &:last-child { border-bottom: none; }
}
.tm-name { font-size: 28rpx; color: var(--text); }
.tm-price { font-size: 28rpx; font-weight: 600; color: var(--text); }

/* ---------- Market Compare ---------- */
.market-table { }
.mt-header, .mt-row { display: flex; padding: 12rpx 0; }
.mt-header { border-bottom: 2px solid var(--primary); }
.mt-row { border-bottom: 1px solid var(--border-light); }
.mt-cell { font-size: 28rpx; color: var(--text); }
.mt-cell.name { flex: 2; }
.mt-cell.num { flex: 1; text-align: center; }
.mt-cell.bold { font-weight: 600; }
.mt-header .mt-cell { font-weight: 600; color: var(--primary); }

.empty-text { font-size: 28rpx; color: var(--text-muted); text-align: center; padding: 40rpx 0; display: block; }
</style>
