<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <text class="header-title">结算对账</text>
    </view>

    <!-- Month selector -->
    <view class="month-selector">
      <view class="month-arrow touch-target" @tap="prevMonth">
        <text class="arrow-text">&lt;</text>
      </view>
      <text class="month-label">{{ currentYear }}年{{ currentMonth }}月</text>
      <view class="month-arrow touch-target" @tap="nextMonth">
        <text class="arrow-text">&gt;</text>
      </view>
    </view>

    <!-- Summary cards -->
    <view class="summary-row">
      <view class="summary-card card">
        <text class="summary-label">本月销售额</text>
        <text class="summary-value amount-green">¥{{ fmtMoney(summary.sales) }}</text>
      </view>
      <view class="summary-card card">
        <text class="summary-label">平台服务费</text>
        <text class="summary-value" style="color:#CA8A04;">¥{{ fmtMoney(summary.fee) }}</text>
      </view>
      <view class="summary-card card summary-full">
        <text class="summary-label">实际到账</text>
        <text class="summary-value" style="color:#14532D;">¥{{ fmtMoney(summary.received) }}</text>
        <text class="summary-sub">共 {{ summary.count }} 笔结算</text>
      </view>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="loading-box">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- Settlement list -->
    <view v-if="!loading && settlements.length > 0" class="list">
      <view v-for="item in settlements" :key="item.id" class="settlement-card card">
        <!-- Trade summary -->
        <view class="settlement-top">
          <view class="trade-info">
            <text class="trade-name">{{ item.trade_summary || '交易汇总' }}</text>
            <text class="trade-date">{{ fmtDate(item.settled_at || item.created_at) }}</text>
          </view>
          <view class="status-badge" :class="statusClass(item.status)">
            <text>{{ statusLabel(item.status) }}</text>
          </view>
        </view>

        <!-- Sales total -->
        <view class="total-row">
          <text class="total-label">销售总额</text>
          <text class="total-value amount-green">¥{{ fmtMoney(item.total_sales) }}</text>
        </view>

        <!-- Breakdown -->
        <view class="breakdown">
          <view class="breakdown-item">
            <text class="breakdown-label">平台服务费</text>
            <text class="breakdown-value">-¥{{ fmtMoney(item.platform_fee) }}</text>
          </view>
          <view class="breakdown-item">
            <text class="breakdown-label">物流费</text>
            <text class="breakdown-value">-¥{{ fmtMoney(item.logistics_fee) }}</text>
          </view>
          <view class="breakdown-item">
            <text class="breakdown-label">损耗扣除</text>
            <text class="breakdown-value">-¥{{ fmtMoney(item.loss_deduction) }}</text>
          </view>
          <view class="breakdown-item">
            <text class="breakdown-label">档口佣金</text>
            <text class="breakdown-value">-¥{{ fmtMoney(item.stall_commission) }}</text>
          </view>
          <view class="breakdown-item highlight">
            <text class="breakdown-label">农户实收</text>
            <text class="breakdown-value amount-green">¥{{ fmtMoney(item.farmer_amount) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Empty -->
    <view v-if="!loading && settlements.length === 0" class="card empty-box">
      <text class="empty-text">暂无结算记录</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { get } from '../../utils/api'

const loading = ref(false)
const settlements = ref([])
const summary = reactive({ sales: 0, fee: 0, received: 0, count: 0 })

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1)

function fmtMoney(val) {
  const n = Number(val)
  if (!n) return '0.00'
  return n.toFixed(2)
}

function fmtDate(val) {
  if (!val) return '--'
  return String(val).slice(0, 10)
}

function statusLabel(s) {
  const map = { pending: '待确认', confirmed: '已确认', paid: '已到账' }
  return map[s] || s || '--'
}

function statusClass(s) {
  return 'status-' + (s || 'pending')
}

function recalcSummary() {
  const acc = { sales: 0, fee: 0, received: 0, count: 0 }
  settlements.value.forEach(s => {
    acc.sales += (s.total_sales || 0)
    acc.fee += (s.platform_fee || 0)
    acc.received += (s.farmer_amount || 0)
    acc.count++
  })
  Object.assign(summary, acc)
}

async function loadSettlements() {
  loading.value = true
  try {
    const res = await get('/settlements', {
      year: currentYear.value,
      month: currentMonth.value
    })
    settlements.value = res.settlements || []
    recalcSummary()
  } catch (e) {
    settlements.value = []
    Object.assign(summary, { sales: 0, fee: 0, received: 0, count: 0 })
  } finally {
    loading.value = false
  }
}

function prevMonth() {
  if (currentMonth.value === 1) {
    currentYear.value--
    currentMonth.value = 12
  } else {
    currentMonth.value--
  }
  loadSettlements()
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentYear.value++
    currentMonth.value = 1
  } else {
    currentMonth.value++
  }
  loadSettlements()
}

onMounted(() => {
  loadSettlements()
})
</script>

<style scoped lang="scss">
.page {
  padding: 24rpx;
  min-height: 100vh;
}

.header {
  margin-bottom: 24rpx;

  &-title {
    font-size: 36rpx;
    font-weight: 700;
    color: var(--text);
    display: block;
  }
}

/* Month selector */
.month-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  gap: 32rpx;
}

.month-arrow {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--white);
  border: 1px solid var(--border);
  border-radius: 50%;
}

.arrow-text {
  font-size: 36rpx;
  color: var(--primary);
  font-weight: 700;
}

.month-label {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--text);
  min-width: 200rpx;
  text-align: center;
}

/* Summary cards */
.summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.summary-card {
  flex: 1;
  min-width: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 16rpx;
  margin-bottom: 0;
}

.summary-full {
  flex-basis: 100%;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
}

.summary-label {
  font-size: 26rpx;
  color: var(--text-muted);
  margin-bottom: 8rpx;
}

.summary-value {
  font-size: 36rpx;
  font-weight: 700;
}

.summary-sub {
  font-size: 24rpx;
  color: var(--text-muted);
}

/* Loading */
.loading-box {
  padding: 80rpx 0;
  text-align: center;
}

.loading-text {
  font-size: 28rpx;
  color: var(--text-muted);
}

/* Settlement list */
.list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.settlement-card {
  padding: 24rpx;
  margin-bottom: 0;
}

.settlement-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.trade-info {
  flex: 1;
}

.trade-name {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text);
  display: block;
  margin-bottom: 6rpx;
}

.trade-date {
  font-size: 24rpx;
  color: var(--text-muted);
}

/* Status badges */
.status-badge {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  line-height: 1.6;
  flex-shrink: 0;
}

.status-pending {
  background-color: #FEF3C7;
  color: #CA8A04;
}

.status-confirmed {
  background-color: #DBEAFE;
  color: #2563EB;
}

.status-paid {
  background-color: #DCFCE7;
  color: #15803D;
}

/* Total row */
.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-top: 1rpx solid var(--border);
  border-bottom: 1rpx solid var(--border);
  margin-bottom: 16rpx;
}

.total-label {
  font-size: 32rpx;
  color: var(--text-secondary);
}

.total-value {
  font-size: 36rpx;
  font-weight: 700;
}

/* Breakdown */
.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 0;
}

.breakdown-item.highlight {
  margin-top: 8rpx;
  padding-top: 16rpx;
  border-top: 1rpx dashed var(--border);
}

.breakdown-label {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.breakdown-value {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.highlight .breakdown-label {
  font-weight: 600;
  color: var(--text);
}

/* Empty */
.empty-box {
  padding: 80rpx 0;
}

.empty-text {
  font-size: 32rpx;
  color: var(--text-muted);
  text-align: center;
  display: block;
}
</style>
