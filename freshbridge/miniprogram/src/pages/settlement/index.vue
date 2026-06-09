<template>
  <view class="page">
    <!-- Header -->
    <view class="page-header">
      <text class="page-title">结算对账</text>
    </view>

    <!-- Summary Bento Grid -->
    <view class="summary-grid">
      <view class="summary-main">
        <text class="sm-label">当前待结算总额</text>
        <text class="sm-amount">¥{{ fmtMoney(summary.received > 0 ? summary.sales - summary.received : summary.sales) }}</text>
        <view class="sm-date-row">
          <text>📅</text>
          <text class="sm-date-text">统计截止至 {{ currentYear }}年{{ currentMonth }}月</text>
        </view>
      </view>
      <view class="summary-mini">
        <text class="smi-label">本月营收</text>
        <text class="smi-num">¥{{ fmtMoney(summary.sales / 1000) }}k</text>
        <view class="smi-change up">
          <text>▲ 较上月 +12%</text>
        </view>
      </view>
      <view class="summary-mini gold">
        <text class="smi-label">平均佣金率</text>
        <text class="smi-num gold-text">4.5%</text>
        <view class="smi-change">
          <text>✅ 优选供应商</text>
        </view>
      </view>
    </view>

    <!-- Month selector -->
    <view class="month-selector">
      <view class="month-arrow" @tap="prevMonth">
        <text>&lt;</text>
      </view>
      <text class="month-label">{{ currentYear }}年{{ currentMonth }}月</text>
      <view class="month-arrow" @tap="nextMonth">
        <text>&gt;</text>
      </view>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="loading-state">
      <text>加载中...</text>
    </view>

    <!-- Settlement List -->
    <view v-if="!loading" class="settlement-list">
      <view v-for="item in settlements" :key="item.id" class="settlement-card" @tap="showDetail(item)">
        <!-- Top: month badge + title + status -->
        <view class="stl-top">
          <view class="stl-month-badge">
            <text>{{ currentMonth }}</text>
          </view>
          <view class="stl-info">
            <text class="stl-title">{{ currentYear }}年{{ currentMonth }}月结算</text>
            <text class="stl-period">对账周期: {{ item.period_start || '01' }} - {{ item.period_end || '31' }}</text>
          </view>
          <view class="stl-status" :class="'status-' + (item.status || 'pending')">
            <text>{{ statusLabel(item.status) }}</text>
          </view>
        </view>

        <!-- 3-column breakdown -->
        <view class="stl-breakdown">
          <view class="stl-col">
            <text class="stl-col-label">总营收</text>
            <text class="stl-col-val">¥{{ fmtMoney(item.total_sales) }}</text>
          </view>
          <view class="stl-col">
            <text class="stl-col-label">平台佣金</text>
            <text class="stl-col-val fee">-¥{{ fmtMoney((item.platform_fee || 0) + (item.stall_commission || 0)) }}</text>
          </view>
          <view class="stl-col">
            <text class="stl-col-label">实收金额</text>
            <text class="stl-col-val net">¥{{ fmtMoney(item.farmer_amount) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Empty -->
    <view v-if="!loading && settlements.length === 0" class="empty-state">
      <text class="empty-icon">📊</text>
      <text class="empty-text">暂无结算记录</text>
    </view>

    <!-- Promotion Banner -->
    <view class="promo-banner">
      <view class="promo-content">
        <text class="promo-title">升级金牌商户</text>
        <text class="promo-sub">享佣金减免</text>
        <view class="promo-btn">
          <text>立即申请</text>
        </view>
      </view>
    </view>

    <view class="bottom-spacer"></view>
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

function statusLabel(s) {
  const map = { pending: '待结算 PENDING', confirmed: '已确认', paid: '已结算 SETTLED' }
  return map[s] || s || '--'
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
    const res = await get('/settlements', { year: currentYear.value, month: currentMonth.value })
    settlements.value = res.settlements || []
    recalcSummary()
  } catch (e) {
    settlements.value = []
    Object.assign(summary, { sales: 0, fee: 0, received: 0, count: 0 })
  }
  loading.value = false
}

function prevMonth() {
  if (currentMonth.value === 1) { currentYear.value--; currentMonth.value = 12 }
  else { currentMonth.value-- }
  loadSettlements()
}

function nextMonth() {
  if (currentMonth.value === 12) { currentYear.value++; currentMonth.value = 1 }
  else { currentMonth.value++ }
  loadSettlements()
}

function showDetail(item) {
  uni.showToast({ title: '查看结算详情', icon: 'none' })
}

onMounted(() => { loadSettlements() })
</script>

<style scoped lang="scss">
.page {
  padding: 24rpx;
  min-height: 100vh;
  background: var(--bg);
}

.page-header { margin-bottom: 24rpx; }
.page-title { font-size: 40rpx; font-weight: 700; color: var(--text); }

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
}
.sm-label { font-size: 24rpx; opacity: 0.8; display: block; }
.sm-amount { font-size: 52rpx; font-weight: 700; display: block; margin-top: 8rpx; }
.sm-date-row { display: flex; align-items: center; gap: 8rpx; margin-top: 16rpx; }
.sm-date-text { font-size: 24rpx; opacity: 0.8; }

.summary-mini {
  flex: 1;
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
}
.summary-mini.gold { background: #FFDEA4; }
.smi-label { font-size: 24rpx; color: var(--text-muted); display: block; }
.smi-num { font-size: 40rpx; font-weight: 700; color: var(--text); display: block; margin-top: 8rpx; }
.smi-num.gold-text { color: #5A4312; }
.smi-change { font-size: 20rpx; margin-top: 8rpx; display: block; }
.smi-change.up { color: var(--up); }

/* Month Selector */
.month-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  gap: 32rpx;
}
.month-arrow {
  width: 72rpx; height: 72rpx;
  display: flex; align-items: center; justify-content: center;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
  font-size: 36rpx; font-weight: 700; color: var(--primary);
}
.month-label { font-size: 34rpx; font-weight: 600; color: var(--text); min-width: 200rpx; text-align: center; }

/* Settlement Cards */
.settlement-list { display: flex; flex-direction: column; gap: 16rpx; }
.settlement-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
  transition: transform 0.2s;
  &:active { transform: scale(0.98); }
}

.stl-top {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx dashed var(--border-light);
}
.stl-month-badge {
  width: 72rpx; height: 72rpx;
  border-radius: 12rpx;
  background: var(--primary);
  display: flex; align-items: center; justify-content: center;
  font-size: 36rpx; font-weight: 700; color: #fff;
  flex-shrink: 0;
}
.stl-info { flex: 1; }
.stl-title { font-size: 32rpx; font-weight: 700; color: var(--text); display: block; }
.stl-period { font-size: 24rpx; color: var(--text-muted); margin-top: 4rpx; display: block; }

.stl-status {
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 700;
  flex-shrink: 0;
}
.status-pending { background: #FEF3C7; color: #CA8A04; }
.status-confirmed { background: #DBEAFE; color: #2563EB; }
.status-paid { background: #DCFCE7; color: #15803D; }

/* 3-col breakdown */
.stl-breakdown { display: flex; }
.stl-col {
  flex: 1;
  text-align: center;
  padding: 8rpx 0;
  &:nth-child(2) { border-left: 1px solid var(--border-light); border-right: 1px solid var(--border-light); }
}
.stl-col-label { font-size: 22rpx; color: var(--text-muted); text-transform: uppercase; display: block; }
.stl-col-val { font-size: 30rpx; font-weight: 700; color: var(--text); margin-top: 8rpx; display: block; }
.stl-col-val.fee { color: var(--danger); font-size: 26rpx; }
.stl-col-val.net { color: var(--primary); }

/* Loading & Empty */
.loading-state { padding: 80rpx 0; text-align: center; color: var(--text-muted); font-size: 28rpx; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 120rpx 0; }
.empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.empty-text { font-size: 28rpx; color: var(--text-muted); }

/* Promotion Banner */
.promo-banner {
  margin-top: 32rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: linear-gradient(135deg, var(--primary), #1A5C3E);
  padding: 32rpx;
  position: relative;
}
.promo-content { position: relative; z-index: 1; }
.promo-title { font-size: 36rpx; font-weight: 700; color: #fff; display: block; }
.promo-sub { font-size: 28rpx; color: rgba(255,255,255,0.7); margin-top: 8rpx; display: block; }
.promo-btn {
  margin-top: 24rpx;
  background: #FFDEA4;
  color: #5A4312;
  display: inline-block;
  padding: 16rpx 40rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 700;
}

.bottom-spacer { height: 80rpx; }
</style>
