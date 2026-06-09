<template>
  <view class="page">
    <!-- Header -->
    <view class="page-header">
      <view class="header-row">
        <text class="page-title">销售记录</text>
        <view class="header-actions">
          <view class="header-icon-btn">
            <text>📅</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Summary Dashboard (Bento Grid) -->
    <view class="summary-grid">
      <view class="summary-main">
        <text class="sm-label">本月累计销售</text>
        <text class="sm-amount">¥{{ monthTotal.toFixed(2) }}</text>
        <text class="sm-change up">较上月 +{{ monthGrowth }}%</text>
      </view>
      <view class="summary-mini">
        <text class="sm-label">今日订单</text>
        <text class="sm-num">{{ todayCount }}</text>
      </view>
      <view class="summary-mini gold">
        <text class="sm-label">库存周转</text>
        <text class="sm-num">{{ turnoverRate }}%</text>
      </view>
    </view>

    <!-- Date Filter Tabs -->
    <view class="date-tabs">
      <view
        v-for="d in dateRanges"
        :key="d.key"
        class="date-tab"
        :class="{ active: activeDate === d.key }"
        @tap="activeDate = d.key"
      >
        <text>{{ d.label }}</text>
      </view>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="loading-state">
      <text>加载中...</text>
    </view>

    <!-- Sales List Grouped by Date -->
    <view v-if="!loading" class="sales-list">
      <view v-for="(group, idx) in groupedSales" :key="idx" class="sale-group">
        <view class="group-header">
          <text class="group-date">{{ group.label }}</text>
          <text class="group-date-sub">{{ group.dateFull }}</text>
        </view>

        <view v-for="sale in group.items" :key="sale.id" class="sale-card">
          <view class="sale-left">
            <view class="sale-avatar">
              <text>{{ (sale.product ? sale.product.variety : '?')[0] }}</text>
            </view>
            <view class="sale-info">
              <text class="sale-name">{{ sale.product ? sale.product.variety : '未知品种' }}</text>
              <text class="sale-spec">{{ sale.quantity }} 斤 × ¥{{ sale.price }}/斤</text>
            </view>
          </view>
          <view class="sale-right">
            <text class="sale-amount">¥{{ (sale.quantity * sale.price).toFixed(2) }}</text>
            <text class="sale-time">{{ formatTime(sale.sale_time) }}</text>
          </view>
        </view>
      </view>

      <!-- Empty -->
      <view v-if="groupedSales.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无销售记录</text>
      </view>
    </view>

    <view class="bottom-spacer"></view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
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

// Summary
const monthTotal = computed(() => {
  return sales.value.filter(s => isThisMonth(s.sale_time)).reduce((sum, s) => sum + s.quantity * s.price, 0)
})

const monthGrowth = computed(() => '12.4') // placeholder

const todayCount = computed(() => {
  return sales.value.filter(s => isToday(s.sale_time)).length
})

const turnoverRate = computed(() => '86') // placeholder

const groupedSales = computed(() => {
  const groups = {}
  const filtered = getFilteredSales()
  for (const s of filtered) {
    const key = formatDate(s.sale_time)
    if (!groups[key]) {
      groups[key] = { label: key, dateFull: key, items: [], total: 0 }
    }
    groups[key].items.push(s)
    groups[key].total += s.quantity * s.price
  }
  return Object.values(groups).sort((a, b) => {
    return b.items[0].sale_time.localeCompare(a.items[0].sale_time)
  })
})

async function fetchSales() {
  loading.value = true
  try {
    const res = await get('/trades/my')
    const trades = res.trades || []
    const allSales = []
    for (const trade of trades) {
      try {
        const sRes = await get(`/trades/${trade.id}/sales`)
        const list = (sRes.sales || sRes || []).map(s => ({ ...s, product: trade.product }))
        allSales.push(...list)
      } catch (e) {}
    }
    allSales.sort((a, b) => (b.sale_time || '').localeCompare(a.sale_time || ''))
    sales.value = allSales
  } catch (e) {}
  loading.value = false
}

onShow(() => { fetchSales() })

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
  return filtered
}

function isToday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

function isThisMonth(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

function formatDate(dateStr) {
  if (!dateStr) return '未知'
  const d = new Date(dateStr)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}月${day}日`
}

function formatTime(dateStr) {
  if (!dateStr) return '--:--'
  const d = new Date(dateStr)
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}
</script>

<style scoped lang="scss">
.page {
  padding: 24rpx;
  min-height: 100vh;
  background: var(--bg);
}

/* Header */
.page-header { margin-bottom: 24rpx; }
.header-row { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 40rpx; font-weight: 700; color: var(--text); }
.header-actions { display: flex; gap: 16rpx; }
.header-icon-btn {
  width: 64rpx; height: 64rpx;
  display: flex; align-items: center; justify-content: center;
  background: #fff; border-radius: 50%;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

/* Summary Bento Grid */
.summary-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
}
.summary-main {
  width: 100%;
  background: var(--primary);
  border-radius: 16rpx;
  padding: 32rpx;
  color: #fff;
  position: relative;
  overflow: hidden;
  &::after {
    content: '';
    position: absolute;
    right: -20rpx; bottom: -20rpx;
    width: 200rpx; height: 200rpx;
    background: rgba(255,255,255,0.05);
    border-radius: 50%;
  }
}
.sm-label { font-size: 24rpx; opacity: 0.8; display: block; }
.sm-amount { font-size: 52rpx; font-weight: 700; display: block; margin-top: 8rpx; }
.sm-change { font-size: 24rpx; margin-top: 8rpx; display: block; }
.sm-change.up { color: #BFEDD7; }

.summary-mini {
  flex: 1;
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
}
.summary-mini.gold { background: #FFDEA4; }
.sm-num { font-size: 44rpx; font-weight: 700; color: var(--text); display: block; margin-top: 8rpx; }
.summary-mini.gold .sm-num { color: #5A4312; }

/* Date Tabs */
.date-tabs {
  display: flex;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
}
.date-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: var(--text-secondary);
}
.date-tab.active {
  background: var(--primary);
  color: #fff;
  font-weight: 600;
}

/* Sales List */
.sale-group { margin-bottom: 32rpx; }
.group-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 16rpx 8rpx;
  margin-bottom: 12rpx;
}
.group-date { font-size: 32rpx; font-weight: 700; color: var(--text); }
.group-date-sub { font-size: 24rpx; color: var(--text-muted); }

.sale-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 12rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
  transition: transform 0.2s;
  &:active { transform: scale(0.98); }
}

.sale-left { display: flex; align-items: center; gap: 20rpx; }
.sale-avatar {
  width: 72rpx; height: 72rpx;
  border-radius: 12rpx;
  background: #EDEEEB;
  display: flex; align-items: center; justify-content: center;
  font-size: 32rpx; font-weight: 700; color: var(--primary);
  flex-shrink: 0;
}
.sale-name { font-size: 30rpx; font-weight: 600; color: var(--text); display: block; }
.sale-spec { font-size: 24rpx; color: var(--text-muted); margin-top: 4rpx; display: block; }

.sale-right { text-align: right; flex-shrink: 0; }
.sale-amount { font-size: 32rpx; font-weight: 700; color: var(--text); display: block; }
.sale-time { font-size: 24rpx; color: var(--text-muted); margin-top: 4rpx; display: block; }

/* Loading & Empty */
.loading-state { padding: 80rpx 0; text-align: center; color: var(--text-muted); font-size: 28rpx; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 120rpx 0; }
.empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.empty-text { font-size: 28rpx; color: var(--text-muted); }

.bottom-spacer { height: 80rpx; }
</style>
