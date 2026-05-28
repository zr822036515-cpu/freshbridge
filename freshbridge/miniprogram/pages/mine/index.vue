<template>
  <view class="page">
    <!-- User info header -->
    <view class="user-header">
      <view class="user-avatar touch-target" @tap="onLoginTap">
        <view v-if="userInfo" class="avatar-img">
          <image :src="userInfo.avatar" mode="aspectFill" class="avatar-pic" />
        </view>
        <view v-else class="avatar-placeholder">
          <text>👤</text>
        </view>
      </view>
      <view class="user-info" @tap="onLoginTap">
        <text v-if="userInfo" class="user-name">{{ userInfo.nickname }}</text>
        <text v-else class="user-name">点击登录</text>
        <text class="user-sub">{{ userInfo ? userInfo.phone || '已认证' : '登录后可发布货源' }}</text>
      </view>
    </view>

    <!-- Quick stats -->
    <view class="stats-row">
      <view class="stats-item">
        <text class="stats-value">0</text>
        <text class="stats-label">在售货源</text>
      </view>
      <view class="stats-item">
        <text class="stats-value">0</text>
        <text class="stats-label">代卖订单</text>
      </view>
      <view class="stats-item">
        <text class="stats-value">0.00</text>
        <text class="stats-label">待结算(元)</text>
      </view>
    </view>

    <!-- Navigation cards -->
    <view class="nav-section">
      <view class="nav-item card touch-target" @tap="onNavTap('我的货源')">
        <text class="nav-icon">📦</text>
        <text class="nav-text">我的货源</text>
        <text class="nav-arrow">></text>
      </view>
      <view class="nav-item card touch-target" @tap="onNavTap('代卖管理')">
        <text class="nav-icon">🤝</text>
        <text class="nav-text">代卖管理</text>
        <text class="nav-arrow">></text>
      </view>
      <view class="nav-item card touch-target" @tap="onNavTap('销售记录')">
        <text class="nav-icon">📋</text>
        <text class="nav-text">销售记录</text>
        <text class="nav-arrow">></text>
      </view>
      <view class="nav-item card touch-target" @tap="onNavTap('结算对账')">
        <text class="nav-icon">💰</text>
        <text class="nav-text">结算对账</text>
        <text class="nav-arrow">></text>
      </view>
      <view class="nav-item card touch-target" @tap="onNavTap('实名认证')">
        <text class="nav-icon">✅</text>
        <text class="nav-text">实名认证</text>
        <text class="nav-arrow">></text>
      </view>
    </view>

    <!-- Bottom actions -->
    <view class="bottom-section">
      <view class="nav-item card touch-target" @tap="onNavTap('设置')">
        <text class="nav-icon">⚙️</text>
        <text class="nav-text">设置</text>
        <text class="nav-arrow">></text>
      </view>
      <view v-if="userInfo" class="logout-btn touch-target" @tap="onLogout">
        <text>退出登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { getUserInfo, logout } from '../../utils/auth'

const userInfo = ref(null)

// Try to restore user info on load
userInfo.value = getUserInfo()

function onLoginTap() {
  console.log('Navigate to login')
  uni.showToast({ title: '登录功能开发中', icon: 'none' })
}

function onNavTap(label) {
  console.log('Navigate to:', label)
  uni.showToast({ title: label + '开发中', icon: 'none' })
}

function onLogout() {
  logout()
  userInfo.value = null
  uni.showToast({ title: '已退出登录', icon: 'none' })
}
</script>

<style scoped lang="scss">
.page {
  padding: 24rpx;
  min-height: 100vh;
}

/* User header */
.user-header {
  display: flex;
  align-items: center;
  padding: 32rpx;
  background: linear-gradient(135deg, #15803D, #22C55E);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.avatar-placeholder {
  font-size: 56rpx;
}

.avatar-pic {
  width: 100%;
  height: 100%;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 34rpx;
  font-weight: 600;
  color: var(--white);
  display: block;
  margin-bottom: 8rpx;
}

.user-sub {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* Stats row */
.stats-row {
  display: flex;
  background-color: var(--white);
  border-radius: 10px;
  padding: 24rpx 0;
  margin-bottom: 24rpx;
}

.stats-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-value {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8rpx;
}

.stats-label {
  font-size: 32rpx;
  color: var(--text-muted);
}

/* Navigation */
.nav-section {
  margin-bottom: 24rpx;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
}

.nav-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.nav-text {
  flex: 1;
  font-size: 32rpx;
  color: var(--text);
}

.nav-arrow {
  font-size: 32rpx;
  color: var(--text-muted);
  flex-shrink: 0;
}

/* Bottom */
.bottom-section {
  margin-top: 24rpx;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0;
  margin-top: 24rpx;
  font-size: 32rpx;
  color: var(--text-muted);
}
</style>
