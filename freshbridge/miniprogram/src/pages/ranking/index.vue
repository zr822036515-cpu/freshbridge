<template>
  <view class="page">
    <view class="header">
      <text class="header-title">品种排行榜</text>
      <text class="header-sub">{{ summary.total || 0 }}个品种 · {{ summary.record_date || '' }}</text>
    </view>

    <!-- Summary -->
    <view class="summary-row">
      <view class="summary-item up">
        <text class="si-num up-color">▲ {{ summary.up || 0 }}</text>
        <text class="si-label">上涨</text>
      </view>
      <view class="summary-item down">
        <text class="si-num down-color">▼ {{ summary.down || 0 }}</text>
        <text class="si-label">下跌</text>
      </view>
      <view class="summary-item">
        <text class="si-num">{{ summary.flat || 0 }}</text>
        <text class="si-label">持平</text>
      </view>
    </view>

    <!-- Sort tabs -->
    <view class="sort-tabs">
      <view class="sort-tab" :class="{ active: sortBy === 'default' }" @tap="sortBy = 'default'">默认</view>
      <view class="sort-tab" :class="{ active: sortBy === 'up' }" @tap="sortBy = 'up'">涨幅 ↓</view>
      <view class="sort-tab" :class="{ active: sortBy === 'down' }" @tap="sortBy = 'down'">跌幅 ↓</view>
      <view class="sort-tab" :class="{ active: sortBy === 'price' }" @tap="sortBy = 'price'">价格 ↓</view>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="loading-text">加载中...</view>

    <!-- Rank list -->
    <view v-else class="rank-list">
      <view v-for="(item, i) in sortedList" :key="i" class="rank-item">
        <view class="ri-left">
          <text class="ri-rank" :class="{ 'top3': i < 3 }">{{ i + 1 }}</text>
          <view class="ri-info">
            <text class="ri-variety">{{ item.variety }}</text>
            <text class="ri-market">{{ item.market_name }}</text>
          </view>
        </view>
        <view class="ri-right">
          <text class="ri-price">¥{{ item.price.toFixed(2) }}</text>
          <view class="ri-change" :class="item.change_pct >= 0 ? 'up-bg' : 'down-bg'">
            <text>{{ item.change_pct >= 0 ? '▲' : '▼' }}{{ Math.abs(item.change_pct).toFixed(1) }}%</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="!loading && sortedList.length === 0" class="empty-text">暂无数据</view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get } from '../../utils/api'

const loading = ref(true)
const summary = ref({ total: 0, up: 0, down: 0, flat: 0, record_date: '' })
const rankList = ref([])
const sortBy = ref('default')

const sortedList = computed(() => {
  const list = [...rankList.value]
  switch (sortBy.value) {
    case 'up': return list.sort((a, b) => b.change_pct - a.change_pct)
    case 'down': return list.sort((a, b) => a.change_pct - b.change_pct)
    case 'price': return list.sort((a, b) => b.price - a.price)
    default: return list
  }
})

async function fetchData() {
  loading.value = true
  try {
    const [summaryRes, pricesRes] = await Promise.all([
      get('/market/summary'),
      get('/market/prices')
    ])
    const s = summaryRes.summary || {}
    const total = s.total_varieties || 0
    const up = s.up_count || 0
    const down = s.down_count || 0
    summary.value = {
      total,
      up,
      down,
      flat: total - up - down,
      record_date: (s.record_date || '').slice(0, 10)
    }
    rankList.value = pricesRes.prices || []
  } catch (e) { /* silent */ }
  loading.value = false
}

onShow(() => { fetchData() })
</script>

<style scoped lang="scss">
.page { padding: 24rpx; min-height: 100vh; padding-bottom: 60rpx; }
.header { margin-bottom: 24rpx; }
.header-title { font-size: 36rpx; font-weight: 700; color: #14532D; display: block; }
.header-sub { font-size: 28rpx; color: #999; margin-top: 6rpx; display: block; }

.summary-row { display: flex; gap: 16rpx; margin-bottom: 24rpx; }
.summary-item {
  flex: 1; background: #fff; border-radius: 12rpx; padding: 20rpx; text-align: center; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
  .si-num { font-size: 36rpx; font-weight: 700; color: #14532D; display: block; }
  .si-label { font-size: 26rpx; color: #999; margin-top: 4rpx; display: block; }
}
.up-color { color: #22C55E; }
.down-color { color: #EF4444; }

.sort-tabs { display: flex; gap: 16rpx; margin-bottom: 20rpx; }
.sort-tab {
  padding: 10rpx 24rpx; border-radius: 24rpx; background: #fff; font-size: 28rpx; color: #666;
  &.active { background: #15803D; color: #fff; }
}

.rank-list { }
.rank-item {
  display: flex; justify-content: space-between; align-items: center;
  background: #fff; padding: 20rpx 24rpx; border-radius: 10rpx; margin-bottom: 12rpx; box-shadow: 0 1rpx 4rpx rgba(0,0,0,0.03);
}
.ri-left { display: flex; align-items: center; gap: 16rpx; }
.ri-rank {
  width: 48rpx; height: 48rpx; line-height: 48rpx; text-align: center; font-size: 30rpx;
  font-weight: 700; background: #F0FDF4; color: #15803D; border-radius: 8rpx;
  &.top3 { background: #15803D; color: #fff; }
}
.ri-info { }
.ri-variety { font-size: 32rpx; font-weight: 600; color: #14532D; display: block; }
.ri-market { font-size: 26rpx; color: #999; margin-top: 2rpx; display: block; }
.ri-right { text-align: right; }
.ri-price { font-size: 32rpx; font-weight: 700; color: #14532D; display: block; }
.ri-change { padding: 4rpx 12rpx; border-radius: 6rpx; margin-top: 4rpx; font-size: 26rpx; font-weight: 600; display: inline-block; }
.up-bg { background: #DCFCE7; color: #16A34A; }
.down-bg { background: #FEE2E2; color: #EF4444; }

.loading-text { font-size: 32rpx; color: #999; text-align: center; padding: 80rpx 0; }
.empty-text { font-size: 32rpx; color: #999; text-align: center; padding: 80rpx 0; }
</style>
