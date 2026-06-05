<template>
  <view class="page">
    <!-- Header -->
    <view class="page-header">
      <text class="page-title">代卖管理</text>
    </view>

    <!-- Status filter tabs -->
    <scroll-view class="filter-scroll" scroll-x enable-flex>
      <view
        v-for="f in filters"
        :key="f.key"
        class="filter-tab touch-target"
        :class="{ active: activeFilter === f.key }"
        @tap="activeFilter = f.key"
      >
        <text>{{ f.label }}</text>
      </view>
    </scroll-view>

    <!-- Loading -->
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- Trade list -->
    <view v-if="!loading" class="trade-list">
      <view v-for="trade in filteredTrades" :key="trade.id" class="trade-card card">
        <!-- Product info -->
        <view class="trade-header">
          <view class="trade-variety-row">
            <text class="trade-variety">
              {{ trade.product ? trade.product.variety : '未知品种' }}
            </text>
            <text v-if="trade.product && trade.product.category" class="trade-category">
              {{ trade.product.category }}
            </text>
          </view>
          <text v-if="trade.product && trade.product.spec" class="trade-spec">
            {{ trade.product.spec }}
          </text>
        </view>

        <!-- Origin info -->
        <view class="trade-origin">
          <text class="origin-icon">📍</text>
          <text class="origin-text">
            {{ trade.product ? trade.product.origin_province + ' ' + trade.product.origin_city : '' }}
          </text>
        </view>

        <!-- Progress bar -->
        <view class="trade-progress">
          <view class="progress-info">
            <text class="progress-label">
              已售
              <text class="progress-highlight">{{ soldAmount(trade) }}</text>
              /
              <text>{{ trade.product ? trade.product.total_quantity : 0 }}</text>
              斤
            </text>
            <text class="progress-percent">{{ soldPercent(trade) }}%</text>
          </view>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: soldPercent(trade) + '%' }" />
          </view>
        </view>

        <!-- Commission + pricing -->
        <view class="trade-meta">
          <text class="meta-item">
            佣金 {{ trade.commission_rate || 0 }}%
          </text>
          <text class="meta-item">
            {{ trade.pricing_mode === 'fixed' ? '固定价' : trade.pricing_mode === 'floor_share' ? '保底分成' : '面议' }}
          </text>
          <view class="status-badge" :class="'status-' + (trade.status || '')">
            <text>{{ statusLabel(trade.status) }}</text>
          </view>
        </view>

        <!-- Action -->
        <view class="trade-action">
          <view
            v-if="trade.status === 'accepted' || trade.status === 'selling'"
            class="action-btn btn-primary touch-target"
            @tap="goBookkeeping(trade.id)"
          >
            <text>记一笔</text>
          </view>
        </view>
      </view>

      <!-- Empty state -->
      <view v-if="filteredTrades.length === 0" class="empty-state">
        <image src="/static/images/handshake.svg" mode="aspectFit" class="empty-icon-img" />
        <text class="empty-text">暂无代卖订单</text>
        <text class="empty-sub">去货源页面接单，开始代卖</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get } from '../../utils/api'

const loading = ref(true)
const trades = ref([])
const activeFilter = ref('all')

const filters = ref([
  { key: 'all', label: '全部' },
  { key: 'selling', label: '进行中' },
  { key: 'sold_out', label: '已售罄' },
  { key: 'settled', label: '已结算' }
])

const filteredTrades = computed(() => {
  if (activeFilter.value === 'all') return trades.value
  return trades.value.filter(t => {
    if (activeFilter.value === 'selling') return t.status === 'accepted' || t.status === 'selling'
    return t.status === activeFilter.value
  })
})

async function fetchTrades() {
  loading.value = true
  try {
    const res = await get('/trades/my')
    trades.value = res.trades || []
  } catch (e) {
    console.error('Failed to fetch trades:', e)
  } finally {
    loading.value = false
  }
}

onShow(() => {
  fetchTrades()
})

function soldAmount(trade) {
  return trade.product ? (trade.product.sold_quantity || 0) : 0
}

function soldPercent(trade) {
  const total = trade.product ? (trade.product.total_quantity || 1) : 1
  const sold = trade.product ? (trade.product.sold_quantity || 0) : 0
  return Math.round((sold / total) * 100)
}

function statusLabel(status) {
  const map = {
    pending: '待确认',
    accepted: '进行中',
    selling: '售卖中',
    sold_out: '已售罄',
    settled: '已结算',
    cancelled: '已取消'
  }
  return map[status] || status
}

function goBookkeeping(tradeId) {
  uni.navigateTo({ url: `/pages/bookkeeping/index?tradeId=${tradeId}` })
}
</script>

<style scoped lang="scss">
.page {
  padding: 24rpx;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24rpx;

  .page-title {
    font-size: 40rpx;
    font-weight: 700;
    color: var(--text);
  }
}

/* Filter tabs */
.filter-scroll {
  white-space: nowrap;
  margin-bottom: 24rpx;

  .filter-tab {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    min-width: 44px;
    padding: 8rpx 24rpx;
    margin-right: 16rpx;
    background-color: var(--white);
    border: 1px solid var(--border);
    border-radius: 32rpx;
    font-size: 32rpx;
    color: var(--text-secondary);

    &.active {
      background-color: var(--primary);
      color: var(--white);
      border-color: var(--primary);
    }
  }
}

/* Loading */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 80rpx 0;
}

.loading-text {
  font-size: 32rpx;
  color: var(--text-muted);
}

/* Trade card */
.trade-card {
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.trade-header {
  margin-bottom: 12rpx;

  .trade-variety-row {
    display: flex;
    align-items: center;
    margin-bottom: 6rpx;
  }

  .trade-variety {
    font-size: 36rpx;
    font-weight: 700;
    color: var(--text);
  }

  .trade-category {
    font-size: 24rpx;
    color: var(--primary);
    background-color: #F0FDF4;
    padding: 4rpx 12rpx;
    border-radius: 4px;
    margin-left: 12rpx;
  }

  .trade-spec {
    font-size: 32rpx;
    color: var(--text-secondary);
    display: block;
    margin-top: 4rpx;
  }
}

.trade-origin {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;

  .origin-icon {
    font-size: 32rpx;
    margin-right: 8rpx;
  }

  .origin-text {
    font-size: 32rpx;
    color: var(--text-secondary);
  }
}

/* Progress */
.trade-progress {
  margin-bottom: 16rpx;

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10rpx;
  }

  .progress-label {
    font-size: 32rpx;
    color: var(--text-secondary);
  }

  .progress-highlight {
    color: var(--primary);
    font-weight: 700;
  }

  .progress-percent {
    font-size: 32rpx;
    color: var(--accent);
    font-weight: 700;
  }

  .progress-bar {
    height: 12rpx;
    background-color: #E5E7EB;
    border-radius: 6rpx;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #22C55E, #15803D);
      border-radius: 6rpx;
      transition: width 0.3s ease;
    }
  }
}

/* Meta */
.trade-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding-top: 16rpx;
  border-top: 1px solid #F3F4F6;
  flex-wrap: wrap;

  .meta-item {
    font-size: 32rpx;
    color: var(--text-muted);
  }

  .status-badge {
    padding: 4rpx 16rpx;
    border-radius: 4px;
    font-size: 24rpx;
    margin-left: auto;

    &.status-accepted {
      background-color: #DBEAFE;
      color: #2563EB;
    }

    &.status-selling {
      background-color: #DCEDC8;
      color: #33691E;
    }

    &.status-sold_out {
      background-color: #FEE2E2;
      color: #991B1B;
    }

    &.status-settled {
      background-color: #E5E7EB;
      color: #4B5563;
    }
  }
}

.trade-action {
  margin-top: 20rpx;

  .action-btn {
    width: 100%;
    height: 44px;
    border-radius: 8px;
    font-size: 32rpx;
    font-weight: 500;
  }
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
  }

  .empty-text {
    font-size: 32rpx;
    color: var(--text-muted);
  }

  .empty-sub {
    font-size: 32rpx;
    color: var(--text-muted);
    margin-top: 8rpx;
  }
}
</style>
