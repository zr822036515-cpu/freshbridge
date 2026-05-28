<template>
  <view class="page">
    <view class="header">
      <text class="header-title">今日行情大盘</text>
      <text class="header-date">{{ today }}</text>
    </view>

    <!-- Market overview cards -->
    <view class="overview-row">
      <view class="overview-card card">
        <text class="overview-label">今日平台交易额</text>
        <text class="overview-value amount-green">--</text>
        <text class="overview-sub">数据加载中</text>
      </view>
      <view class="overview-card card">
        <text class="overview-label">在售品种数</text>
        <text class="overview-value amount-green">--</text>
        <text class="overview-sub">数据加载中</text>
      </view>
    </view>

    <!-- Latest products section -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">最新货源</text>
        <text class="section-more" @tap="goToSupply">查看更多 &#8250;</text>
      </view>

      <!-- Loading -->
      <view v-if="loading" class="loading-box">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- Product mini cards -->
      <view v-if="!loading && latestProducts.length > 0" class="latest-list">
        <view v-for="item in latestProducts" :key="item.id" class="mini-card card">
          <view class="mini-card-top">
            <text class="mini-variety">{{ item.variety }}</text>
            <text v-if="item.urgent" class="urgent-mini">&#9889; 急售</text>
          </view>
          <view class="mini-card-info">
            <text class="mini-spec" v-if="item.spec">{{ item.spec }}</text>
            <text class="mini-origin">{{ item.origin_province }}{{ item.origin_city }}</text>
          </view>
          <view class="mini-card-bottom">
            <text class="mini-quantity">{{ item.total_quantity }}斤</text>
            <text class="mini-price amount-gold">{{ item.price }} 元/斤</text>
          </view>
        </view>
      </view>

      <!-- Empty -->
      <view v-if="!loading && latestProducts.length === 0" class="card">
        <text class="empty-text">暂无最新货源</text>
      </view>
    </view>

    <!-- Market prices section -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">今日行情</text>
      </view>

      <!-- Loading -->
      <view v-if="marketLoading" class="loading-box">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- Price cards — horizontal scroll -->
      <scroll-view v-if="!marketLoading && marketPrices.length > 0" scroll-x class="price-scroll">
        <view class="price-list">
          <view v-for="item in marketPrices" :key="item.id || item.variety" class="price-card card">
            <text class="price-variety">{{ item.variety }}</text>
            <view class="price-main">
              <text class="price-number">¥{{ fmtPrice(item.price) }}</text>
              <text class="price-unit">/斤</text>
            </view>
            <view class="price-change" :class="item.change_pct >= 0 ? 'up' : 'down'">
              <text>{{ item.change_pct >= 0 ? '▲' : '▼' }}{{ fmtPct(item.change_pct) }}</text>
            </view>
            <text class="price-market">{{ item.market || item.market_name || '' }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- Empty -->
      <view v-if="!marketLoading && marketPrices.length === 0" class="card">
        <text class="empty-text">暂无行情数据</text>
      </view>
    </view>

    <!-- Hot categories ranking -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门品类排行</text>
        <text class="section-more">查看更多 &#8250;</text>
      </view>
      <view class="card">
        <text class="empty-text">各品类交易数据将在接入后展示</text>
      </view>
    </view>

    <!-- Market price index -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">各大市场价格指数</text>
      </view>
      <view class="card">
        <text class="empty-text">市场价格指数将在接入后展示</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get } from '../../utils/api'

const loading = ref(false)
const marketLoading = ref(false)
const today = ref(getToday())
const latestProducts = ref([])
const marketPrices = ref([])

function getToday() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fmtPrice(val) {
  const n = Number(val)
  if (!n) return '--'
  return n.toFixed(2)
}

function fmtPct(val) {
  const n = Number(val)
  if (!n && n !== 0) return '--'
  return Math.abs(n).toFixed(1) + '%'
}

async function fetchMarketPrices() {
  marketLoading.value = true
  try {
    const res = await get('/market/prices')
    const list = res.prices || res.data || []
    marketPrices.value = list.slice(0, 8)
  } catch (e) {
    console.error('Failed to fetch market prices:', e)
  } finally {
    marketLoading.value = false
  }
}

async function fetchLatestProducts() {
  loading.value = true
  try {
    const res = await get('/products', { page: 1, page_size: 4 })
    // Handle both response shapes: { data: [...] } or direct array
    const list = res.data || res || []
    latestProducts.value = list.slice(0, 4)
  } catch (e) {
    console.error('Failed to fetch latest products:', e)
  } finally {
    loading.value = false
  }
}

function goToSupply() {
  uni.switchTab({ url: '/pages/supply/index' })
}

onShow(() => {
  fetchLatestProducts()
  fetchMarketPrices()
})
</script>

<style scoped lang="scss">
.page {
  padding: 24rpx;
  min-height: 100vh;
}

.header {
  margin-bottom: 32rpx;

  &-title {
    font-size: 36rpx;
    font-weight: 700;
    color: var(--text);
    display: block;
  }

  &-date {
    font-size: 32rpx;
    color: var(--text-muted);
    margin-top: 8rpx;
    display: block;
  }
}

.overview-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.overview-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 12px;
}

.overview-label {
  font-size: 32rpx;
  color: var(--text-secondary);
  margin-bottom: 12rpx;
}

.overview-value {
  font-size: 44rpx;
  margin-bottom: 8rpx;
}

.overview-sub {
  font-size: 32rpx;
  color: var(--text-muted);
}

.section {
  margin-bottom: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text);
}

.section-more {
  font-size: 28rpx;
  color: var(--primary);
}

/* Loading */
.loading-box {
  padding: 40rpx 0;
  text-align: center;
}

.loading-text {
  font-size: 28rpx;
  color: var(--text-muted);
}

/* Latest product mini cards */
.latest-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.mini-card {
  padding: 20rpx 24rpx;

  &-top {
    display: flex;
    align-items: center;
    margin-bottom: 8rpx;
  }

  &-info {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 12rpx;
  }

  &-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.mini-variety {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--text);
}

.urgent-mini {
  font-size: 22rpx;
  color: var(--accent);
  background-color: #FEF3C7;
  padding: 2rpx 10rpx;
  border-radius: 4px;
  margin-left: 10rpx;
}

.mini-spec {
  font-size: 26rpx;
  color: var(--text-secondary);
}

.mini-origin {
  font-size: 26rpx;
  color: var(--text-muted);
}

.mini-quantity {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text);
}

.mini-price {
  font-size: 30rpx;
  font-weight: 700;
}

.empty-text {
  font-size: 32rpx;
  color: var(--text-muted);
  text-align: center;
  display: block;
  padding: 32rpx 0;
}

/* Market prices horizontal scroll */
.price-scroll {
  white-space: nowrap;
}

.price-list {
  display: inline-flex;
  gap: 16rpx;
  padding-bottom: 8rpx;
}

.price-card {
  display: inline-flex;
  flex-direction: column;
  min-width: 220rpx;
  padding: 20rpx;
  margin-bottom: 0;
  white-space: normal;
}

.price-variety {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text);
  display: block;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
  margin-bottom: 8rpx;
}

.price-number {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--primary);
}

.price-unit {
  font-size: 24rpx;
  color: var(--text-muted);
}

.price-change {
  font-size: 24rpx;
  margin-bottom: 8rpx;
}

.price-change.up {
  color: var(--primary);
}

.price-change.down {
  color: var(--danger);
}

.price-market {
  font-size: 22rpx;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
