<template>
  <view class="page">
    <!-- Map placeholder -->
    <view class="map-placeholder">
      <view class="map-icon-box">
        <text class="map-icon">📍</text>
      </view>
      <text class="map-title">GPS轨迹地图</text>
      <text class="map-hint">真实地图需要接入腾讯地图SDK</text>
      <view v-if="delivery" class="map-route">
        <text class="map-from">{{ delivery.origin || delivery.origin_city || '--' }}</text>
        <text class="map-arrow">→</text>
        <text class="map-to">{{ delivery.dest || delivery.dest_city || '--' }}</text>
      </view>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="loading-box">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- Delivery info -->
    <view v-if="!loading && delivery" class="info-section">
      <!-- Route & ETA -->
      <view class="card info-card">
        <view class="info-row">
          <text class="info-label">出发地</text>
          <text class="info-value">{{ delivery.origin || delivery.origin_city || '--' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">目的地</text>
          <text class="info-value">{{ delivery.dest || delivery.dest_city || '--' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">距离</text>
          <text class="info-value">{{ delivery.distance || '--' }}km</text>
        </view>
        <view class="info-row">
          <text class="info-label">预计到达</text>
          <text class="info-value amount-green">{{ delivery.eta ? fmtDate(delivery.eta) : '--' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">当前状态</text>
          <text class="info-value status-text">{{ statusLabel(delivery.status) }}</text>
        </view>
      </view>

      <!-- Driver info -->
      <view class="card driver-card">
        <view class="driver-header">
          <image src="/static/images/user.svg" mode="aspectFit" class="driver-icon-img" />
          <view class="driver-detail">
            <text class="driver-name">{{ delivery.driver_name || delivery.driver_phone || '--' }}</text>
            <text v-if="delivery.driver_phone" class="driver-phone">{{ delivery.driver_phone }}</text>
          </view>
        </view>
      </view>

      <!-- Action buttons -->
      <view class="action-buttons">
        <view class="action-btn touch-target btn-accent" @tap="updateGPS">
          <text class="action-btn-text">更新位置</text>
        </view>
        <view
          v-if="delivery.status === 'in_transit'"
          class="action-btn touch-target btn-primary"
          @tap="confirmArrive"
        >
          <text class="action-btn-text">确认到达</text>
        </view>
      </view>

      <!-- Status timeline -->
      <view class="timeline-section">
        <text class="timeline-title">运单状态</text>
        <view class="timeline">
          <view
            v-for="(step, idx) in timeline"
            :key="idx"
            class="timeline-item"
            :class="{ active: step.active, last: idx === timeline.length - 1 }"
          >
            <view class="timeline-dot" :class="{ done: step.active, pending: !step.active }"></view>
            <view class="timeline-body">
              <text class="timeline-step">{{ step.label }}</text>
              <text v-if="step.time" class="timeline-time">{{ step.time }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Not found -->
    <view v-if="!loading && !delivery" class="card empty-box">
      <text class="empty-text">未找到运单信息</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { get, put } from '../../utils/api'

const loading = ref(true)
const delivery = ref(null)

function fmtDate(val) {
  if (!val) return '--'
  return String(val).slice(0, 16)
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

const timeline = computed(() => {
  if (!delivery.value) return []
  const steps = [
    { key: 'accepted', label: '已接单', active: false, time: '' },
    { key: 'loading', label: '已装车', active: false, time: '' },
    { key: 'in_transit', label: '运输中', active: false, time: '' },
    { key: 'arrived', label: '已到达', active: false, time: '' }
  ]
  const statusOrder = ['pending', 'accepted', 'loading', 'in_transit', 'arrived', 'completed']
  const currentIdx = statusOrder.indexOf(delivery.value.status)
  steps.forEach((step, idx) => {
    const stepIdx = statusOrder.indexOf(step.key)
    step.active = stepIdx <= currentIdx
    if (delivery.value.timeline && delivery.value.timeline[step.key]) {
      step.time = String(delivery.value.timeline[step.key]).slice(0, 16)
    }
  })
  return steps
})

async function loadDelivery() {
  loading.value = true
  try {
    const res = await get('/logistics/my')
    // Try to get specific delivery by query param or pick the in-transit one
    const pages = getCurrentPages()
    const page = pages[pages.length - 1]
    const id = (page && page.options && page.options.id) || null

    const list = res.logistics || []
    if (id) {
      // Fetch single or find from list
      try {
        const detail = await get(`/logistics/${id}`)
        delivery.value = detail.delivery || detail.data || detail
      } catch (e) {
        delivery.value = list.find(d => String(d.id) === String(id)) || list[0] || null
      }
    } else {
      // Show the most recent in-transit or first delivery
      delivery.value = list.find(d => d.status === 'in_transit') || list[0] || null
    }
  } catch (e) {
    delivery.value = null
  } finally {
    loading.value = false
  }
}

async function updateGPS() {
  try {
    const loc = await new Promise((resolve, reject) => {
      uni.getLocation({
        type: 'gcj02',
        success: resolve,
        fail: reject
      })
    })
    await put(`/logistics/${delivery.value.id}/gps`, {
      lat: loc.latitude,
      lng: loc.longitude
    })
    uni.showToast({ title: '位置已更新', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '获取位置失败', icon: 'none' })
  }
}

async function confirmArrive() {
  try {
    await put(`/logistics/${delivery.value.id}/arrive`)
    delivery.value.status = 'arrived'
    uni.showToast({ title: '已确认到达', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

onMounted(() => {
  loadDelivery()
})
</script>

<style scoped lang="scss">
.page {
  padding: 0 24rpx 24rpx;
  min-height: 100vh;
}

/* Map placeholder */
.map-placeholder {
  height: 500rpx;
  background: linear-gradient(135deg, #DCFCE7, #BBF7D0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 -24rpx 24rpx;
}

.map-icon-box {
  width: 100rpx;
  height: 100rpx;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.map-icon {
  font-size: 52rpx;
}

.map-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8rpx;
}

.map-hint {
  font-size: 24rpx;
  color: var(--text-muted);
  margin-bottom: 16rpx;
}

.map-route {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.map-from,
.map-to {
  font-size: 28rpx;
  color: #14532D;
  font-weight: 600;
}

.map-arrow {
  font-size: 32rpx;
  color: var(--primary);
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

/* Info section */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-card {
  padding: 24rpx;
  margin-bottom: 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
}

.info-label {
  font-size: 28rpx;
  color: var(--text-muted);
}

.info-value {
  font-size: 28rpx;
  color: var(--text);
  font-weight: 500;
}

.status-text {
  color: #2563EB;
}

/* Driver card */
.driver-card {
  padding: 24rpx;
  margin-bottom: 0;
}

.driver-header {
  display: flex;
  align-items: center;
}

.driver-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.driver-detail {
  display: flex;
  flex-direction: column;
}

.driver-name {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text);
}

.driver-phone {
  font-size: 26rpx;
  color: var(--text-muted);
  margin-top: 4rpx;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 10px;
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
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
}

/* Timeline */
.timeline-section {
  margin-top: 8rpx;
}

.timeline-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text);
  display: block;
  margin-bottom: 20rpx;
}

.timeline {
  padding-left: 16rpx;
}

.timeline-item {
  display: flex;
  position: relative;
  padding-bottom: 32rpx;

  &.last {
    padding-bottom: 0;
  }
}

.timeline-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6rpx;
  z-index: 1;

  &.done {
    background-color: var(--primary);
  }

  &.pending {
    background-color: var(--border);
  }
}

/* Vertical line between dots */
.timeline-item:not(.last) .timeline-dot::after {
  content: '';
  position: absolute;
  left: 27rpx;
  top: 30rpx;
  width: 2rpx;
  height: calc(100% - 6rpx);
  background-color: var(--border);
}

.timeline-item.active:not(.last) .timeline-dot::after {
  background-color: var(--primary);
}

.timeline-body {
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
}

.timeline-step {
  font-size: 28rpx;
  color: var(--text-muted);
  line-height: 1.5;
}

.timeline-item.active .timeline-step {
  color: var(--text);
  font-weight: 500;
}

.timeline-time {
  font-size: 24rpx;
  color: var(--text-muted);
  margin-top: 4rpx;
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
