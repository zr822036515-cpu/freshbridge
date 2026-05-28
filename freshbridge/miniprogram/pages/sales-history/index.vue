<template>
  <view class="page">
    <!-- Header -->
    <view class="page-header">
      <text class="page-title">销售记录</text>
    </view>

    <!-- Date range tabs -->
    <view class="date-tabs">
      <view
        v-for="d in dateRanges"
        :key="d.key"
        class="date-tab touch-target"
        :class="{ active: activeDate === d.key }"
        @tap="activeDate = d.key"
      >
        <text>{{ d.label }}</text>
      </view>
    </view>

    <!-- Summary bar -->
    <view class="summary-bar">
      <view class="summary-item">
        <text class="summary-label">今日销售额</text>
        <text class="summary-value amount-gold">¥ {{ todayTotal.toFixed(2) }}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">今日销量</text>
        <text class="summary-value amount-green">{{ todayQuantity }} 斤</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">共</text>
        <text class="summary-value">{{ sales.length }} 笔</text>
      </view>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- Sales list -->
    <view v-if="!loading" class="sales-list">
      <view v-for="(group, idx) in groupedSales" :key="idx" class="sale-group">
        <view class="group-header">
          <text class="group-date">{{ group.label }}</text>
          <text class="group-total">¥ {{ group.total.toFixed(2) }}</text>
        </view>

        <view v-for="sale in group.items" :key="sale.id" class="sale-card card">
          <view class="sale-row">
            <view class="sale-time-badge">
              <text class="sale-time">{{ formatTime(sale.sale_time) }}</text>
            </view>
            <text class="sale-method">{{ methodIcon(sale.record_method) }}</text>
          </view>
          <view class="sale-body">
            <text class="sale-variety">
              {{ sale.product ? sale.product.variety : '未知品种' }}
            </text>
            <view class="sale-math">
              <text class="sale-qty">{{ sale.quantity }} 斤</text>
              <text class="sale-x">x</text>
              <text class="sale-price">¥{{ sale.price }}/斤</text>
              <text class="sale-eq">=</text>
              <text class="sale-subtotal">¥{{ (sale.quantity * sale.price).toFixed(2) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Empty state -->
      <view v-if="sales.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无销售记录</text>
        <text class="empty-sub">去快速记账，记录销售数据</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { get } from '../../utils/api'

const loading = ref(true)
const sales = ref([])
const activeDate = ref('today')

const dateRanges = ref([
  { key: 'today', label: '今天' },
  { key: 'yesterday', label: '昨天' },
  { key: 'week', label: '本周' },
  { key: 'custom', label: '自定义' }
])

const todayTotal = computed(() => {
  return sales.value.filter(s => isToday(s.sale_time)).reduce((sum, s) => sum + s.quantity * s.price, 0)
})

const todayQuantity = computed(() => {
  return sales.value.filter(s => isToday(s.sale_time)).reduce((sum, s) => sum + (s.quantity || 0), 0)
})

const groupedSales = computed(() => {
  const groups = {}
  const filtered = getFilteredSales()
  for (const s of filtered) {
    const key = formatDate(s.sale_time)
    if (!groups[key]) {
      groups[key] = { label: key, items: [], total: 0 }
    }
    groups[key].items.push(s)
    groups[key].total += s.quantity * s.price
  }
  // Sort groups by date descending
  return Object.values(groups).sort((a, b) => {
    return b.items[0].sale_time.localeCompare(a.items[0].sale_time)
  })
})

async function fetchSales() {
  loading.value = true
  try {
    // Fetch trades, then sales for each trade
    const res = await get('/trades/my')
    const trades = res.trades || []
    const allSales = []
    for (const trade of trades) {
      try {
        const sRes = await get(`/trades/${trade.id}/sales`)
        const list = (sRes.sales || sRes || []).map(s => ({
          ...s,
          product: trade.product
        }))
        allSales.push(...list)
      } catch (e) {
        // Skip trades with no sales
      }
    }
    // Sort by sale_time descending
    allSales.sort((a, b) => (b.sale_time || '').localeCompare(a.sale_time || ''))
    sales.value = allSales
  } catch (e) {
    console.error('Failed to fetch sales:', e)
  } finally {
    loading.value = false
  }
}

fetchSales()

function getFilteredSales() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let filtered = sales.value

  if (activeDate.value === 'today') {
    filtered = sales.value.filter(s => isToday(s.sale_time))
  } else if (activeDate.value === 'yesterday') {
    const yesterday = new Date(today.getTime() - 86400000)
    filtered = sales.value.filter(s => {
      if (!s.sale_time) return false
      const d = new Date(s.sale_time)
      return d >= yesterday && d < today
    })
  } else if (activeDate.value === 'week') {
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    filtered = sales.value.filter(s => {
      if (!s.sale_time) return false
      return new Date(s.sale_time) >= weekStart
    })
  }
  // 'custom' shows all
  return filtered
}

function isToday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate()
}

function formatDate(dateStr) {
  if (!dateStr) return '未知'
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatTime(dateStr) {
  if (!dateStr) return '--:--'
  const d = new Date(dateStr)
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

function methodIcon(method) {
  const map = { voice: '🎤', scan: '📷', manual: '✍️' }
  return map[method] || '✍️'
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

/* Date tabs */
.date-tabs {
  display: flex;
  background-color: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.date-tab {
  flex: 1;
  font-size: 32rpx;
  color: var(--text-secondary);
  padding: 16rpx 0;
  min-height: 44px;

  &.active {
    background-color: var(--primary);
    color: var(--white);
  }
}

/* Summary bar */
.summary-bar {
  display: flex;
  background-color: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-label {
  font-size: 32rpx;
  color: var(--text-muted);
  margin-bottom: 8rpx;
}

.summary-value {
  font-size: 36rpx;
  font-weight: 700;
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

/* Grouped sales list */
.sale-group {
  margin-bottom: 24rpx;

  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 8rpx;
    margin-bottom: 8rpx;

    .group-date {
      font-size: 32rpx;
      font-weight: 600;
      color: var(--text);
    }

    .group-total {
      font-size: 32rpx;
      font-weight: 700;
      color: var(--accent);
    }
  }
}

.sale-card {
  padding: 20rpx 24rpx;
  margin-bottom: 12rpx;

  .sale-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;
  }

  .sale-time-badge {
    .sale-time {
      font-size: 32rpx;
      color: var(--text-muted);
    }
  }

  .sale-method {
    font-size: 32rpx;
  }

  .sale-body {
    .sale-variety {
      font-size: 32rpx;
      font-weight: 600;
      color: var(--text);
      display: block;
      margin-bottom: 8rpx;
    }

    .sale-math {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8rpx;

      .sale-qty, .sale-price {
        font-size: 32rpx;
        color: var(--text-secondary);
      }

      .sale-x, .sale-eq {
        font-size: 32rpx;
        color: var(--text-muted);
      }

      .sale-subtotal {
        font-size: 32rpx;
        font-weight: 700;
        color: var(--primary);
      }
    }
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
