<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <text class="header-title">运单大厅</text>
    </view>

    <!-- Status tabs -->
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item touch-target"
        :class="{ active: activeTab === tab.key }"
        @tap="switchTab(tab.key)"
      >
        <text class="tab-text">{{ tab.label }}</text>
      </view>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="loading-box">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- Delivery list -->
    <view v-if="!loading && deliveries.length > 0" class="list">
      <view v-for="item in deliveries" :key="item.id" class="delivery-card card">
        <!-- Route -->
        <view class="route-row">
          <text class="route-origin">📍 {{ item.origin || item.origin_city || '--' }}</text>
          <text class="route-arrow">→</text>
          <text class="route-dest">{{ item.dest || item.dest_city || '--' }}</text>
        </view>

        <!-- Cargo & vehicle -->
        <view class="cargo-row">
          <text class="cargo-text">{{ item.cargo || item.variety || '--' }}</text>
          <text v-if="item.quantity" class="cargo-qty">{{ item.quantity }}吨</text>
        </view>
        <view class="info-row">
          <text class="info-text">{{ item.vehicle_type || '--' }}</text>
          <text v-if="item.distance" class="info-divider">|</text>
          <text v-if="item.distance" class="info-text">{{ item.distance }}km</text>
        </view>

        <!-- Price & status -->
        <view class="action-row">
          <view class="price-box">
            <text class="price-label">运费</text>
            <text class="price-value amount-gold">¥{{ fmtMoney(item.price || item.freight) }}</text>
          </view>
          <view class="action-right">
            <view class="status-badge" :class="statusClass(item.status)">
              <text>{{ statusLabel(item.status) }}</text>
            </view>
            <view
              v-if="actionBtn(item.status)"
              class="action-btn touch-target"
              :class="'btn-' + actionBtnStyle(item.status)"
              @tap="onAction(item)"
            >
              <text class="action-btn-text">{{ actionBtn(item.status) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Empty -->
    <view v-if="!loading && deliveries.length === 0" class="card empty-box">
      <text class="empty-text">{{ emptyText }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, put } from '../../utils/api'

const loading = ref(false)
const deliveries = ref([])
const activeTab = ref('pending')

const tabs = [
  { key: 'pending', label: '待接单' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' }
]

const emptyText = computed(() => {
  const map = {
    pending: '暂无待接单运单',
    in_progress: '暂无进行中运单',
    completed: '暂无已完成运单'
  }
  return map[activeTab.value] || '暂无数据'
})

function fmtMoney(val) {
  const n = Number(val)
  if (!n) return '0.00'
  return n.toFixed(2)
}

function statusLabel(s) {
  const map = {
    pending: '待接单',
    accepted: '已接单',
    loading: '装车中',
    in_transit: '运输中',
    arrived: '已到达',
    completed: '已完成'
  }
  return map[s] || s || '--'
}

function statusClass(s) {
  return 'status-' + (s || 'pending')
}

function actionBtn(status) {
  const map = {
    pending: '抢单',
    accepted: '开始装车',
    loading: '确认出发',
    in_transit: '确认到达'
  }
  return map[status] || null
}

function actionBtnStyle(status) {
  if (status === 'pending') return 'primary'
  return 'accent'
}

function switchTab(key) {
  if (activeTab.value === key) return
  activeTab.value = key
  loadDeliveries()
}

async function loadDeliveries() {
  loading.value = true
  try {
    let res
    if (activeTab.value === 'pending') {
      res = await get('/logistics/available')
    } else {
      res = await get('/logistics/my', { status: activeTab.value })
    }
    deliveries.value = res.logistics || []
  } catch (e) {
    deliveries.value = []
  } finally {
    loading.value = false
  }
}

async function onAction(item) {
  const status = item.status
  try {
    if (status === 'pending') {
      await put(`/logistics/${item.id}/accept`)
      uni.showToast({ title: '抢单成功', icon: 'success' })
    } else if (status === 'accepted') {
      await put(`/logistics/${item.id}/status`, { status: 'loading' })
      uni.showToast({ title: '已更新为装车中', icon: 'success' })
    } else if (status === 'loading') {
      await put(`/logistics/${item.id}/status`, { status: 'in_transit' })
      uni.showToast({ title: '已出发', icon: 'success' })
    } else if (status === 'in_transit') {
      await put(`/logistics/${item.id}/arrive`)
      uni.showToast({ title: '已确认到达', icon: 'success' })
    }
    loadDeliveries()
  } catch (e) {
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  }
}

function goTracking(item) {
  uni.navigateTo({ url: `/pages/tracking/index?id=${item.id}` })
}

onShow(() => {
  loadDeliveries()
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

/* Tabs */
.tabs {
  display: flex;
  background-color: var(--white);
  border-radius: 10px;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  border-bottom: 4rpx solid transparent;
}

.tab-item.active {
  border-bottom-color: var(--primary);
}

.tab-text {
  font-size: 32rpx;
  color: var(--text-muted);
}

.tab-item.active .tab-text {
  color: var(--primary);
  font-weight: 600;
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

/* Delivery list */
.list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.delivery-card {
  padding: 24rpx;
  margin-bottom: 0;
}

/* Route */
.route-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.route-origin,
.route-dest {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text);
}

.route-arrow {
  margin: 0 12rpx;
  font-size: 28rpx;
  color: var(--primary);
}

/* Cargo & info */
.cargo-row {
  display: flex;
  align-items: center;
  margin-bottom: 6rpx;
}

.cargo-text {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.cargo-qty {
  font-size: 28rpx;
  color: var(--text);
  font-weight: 600;
  margin-left: 12rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.info-text {
  font-size: 26rpx;
  color: var(--text-muted);
}

.info-divider {
  margin: 0 8rpx;
  color: var(--border);
  font-size: 26rpx;
}

/* Price & action */
.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid var(--border);
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.price-label {
  font-size: 26rpx;
  color: var(--text-muted);
}

.price-value {
  font-size: 36rpx;
  font-weight: 700;
}

.action-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

/* Status badges */
.status-badge {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.status-pending {
  background-color: #FEF3C7;
  color: #CA8A04;
}

.status-accepted,
.status-in_transit,
.status-loading {
  background-color: #DBEAFE;
  color: #2563EB;
}

.status-arrived,
.status-completed {
  background-color: #DCFCE7;
  color: #15803D;
}

/* Action button */
.action-btn {
  padding: 10rpx 24rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: var(--primary);
}

.btn-accent {
  background-color: var(--accent);
}

.action-btn-text {
  font-size: 26rpx;
  color: #fff;
  font-weight: 500;
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
