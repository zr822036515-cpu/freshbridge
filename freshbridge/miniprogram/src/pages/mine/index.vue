<template>
  <view class="page">
    <!-- User info header - Stitch style -->
    <view class="user-header">
      <view class="uh-gradient"></view>
      <view class="uh-content">
        <view class="user-avatar touch-target" @tap="onLoginTap">
          <view v-if="userInfo" class="avatar-img">
            <image :src="userInfo.avatar_url" mode="aspectFill" class="avatar-pic" />
          </view>
          <view v-else class="avatar-placeholder">
            <image src="/static/images/user.svg" mode="aspectFit" class="avatar-icon" />
          </view>
        </view>
        <view class="user-info" @tap="onLoginTap">
          <view class="user-name-row">
            <text v-if="userInfo" class="user-name">{{ userInfo.nickname || '鲜桥用户' }}</text>
            <text v-else class="user-name">点击登录</text>
            <view v-if="userInfo" class="role-badge" :class="'role-' + userInfo.role">
              <text>{{ roleLabel(userInfo.role) }}</text>
            </view>
          </view>
          <view v-if="userInfo" class="vip-tag">VIP 会员</view>
          <text class="user-sub">{{ loginSubtitle }}</text>
        </view>
      </view>
    </view>

    <!-- Verification & credit info (only when logged in) -->
    <view v-if="userInfo" class="info-cards">
      <view class="info-card" :class="userInfo.verified ? 'verified' : 'unverified'">
        <image :src="userInfo.verified ? '/static/images/check-circle.svg' : '/static/images/warning.svg'" mode="aspectFit" class="info-card-icon" />
        <text class="info-card-text">{{ userInfo.verified ? '已实名认证' : '未实名认证' }}</text>
      </view>
      <view class="info-card credit">
        <image src="/static/images/star.svg" mode="aspectFit" class="info-card-icon" />
        <text class="info-card-text">信用分 {{ userInfo.credit_score || 100 }}</text>
      </view>
    </view>

    <!-- Quick stats -->
    <view class="stats-row">
      <view class="stats-item">
        <text class="stats-value">{{ stats.products }}</text>
        <text class="stats-label">在售货源</text>
      </view>
      <view class="stats-item">
        <text class="stats-value">{{ stats.trades }}</text>
        <text class="stats-label">代卖订单</text>
      </view>
      <view class="stats-item">
        <text class="stats-value">{{ stats.pendingAmount }}</text>
        <text class="stats-label">待结算(元)</text>
      </view>
    </view>

    <!-- Navigation cards -->
    <view class="nav-section">
      <view class="nav-item card touch-target" @tap="onNavTap('我的货源')">
        <image src="/static/images/package.svg" mode="aspectFit" class="nav-icon" />
        <text class="nav-text">我的货源</text>
        <text class="nav-arrow">></text>
      </view>
      <view class="nav-item card touch-target" @tap="onNavTap('代卖管理')">
        <image src="/static/images/handshake.svg" mode="aspectFit" class="nav-icon" />
        <text class="nav-text">代卖管理</text>
        <text class="nav-arrow">></text>
      </view>
      <view class="nav-item card touch-target" @tap="onNavTap('销售记录')">
        <image src="/static/images/clipboard.svg" mode="aspectFit" class="nav-icon" />
        <text class="nav-text">销售记录</text>
        <text class="nav-arrow">></text>
      </view>
      <view class="nav-item card touch-target" @tap="onNavTap('结算对账')">
        <image src="/static/images/wallet.svg" mode="aspectFit" class="nav-icon" />
        <text class="nav-text">结算对账</text>
        <text class="nav-arrow">></text>
      </view>
      <view class="nav-item card touch-target" @tap="onNavTap('实名认证')">
        <image src="/static/images/check-circle.svg" mode="aspectFit" class="nav-icon" />
        <text class="nav-text">实名认证</text>
        <text class="nav-arrow">></text>
      </view>
      <!-- Switch role placeholder -->
      <view v-if="userInfo" class="nav-item card touch-target" @tap="onSwitchRole">
        <image src="/static/images/swap.svg" mode="aspectFit" class="nav-icon" />
        <text class="nav-text">切换角色</text>
        <text class="nav-arrow">></text>
      </view>
    </view>

    <!-- Bottom actions -->
    <view class="bottom-section">
      <view class="nav-item card touch-target" @tap="onNavTap('设置')">
        <image src="/static/images/settings.svg" mode="aspectFit" class="nav-icon" />
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
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { login, getUserInfo, logout } from '../../utils/auth'
import { get } from '../../utils/api'

const userInfo = ref(null)
const stats = ref({ products: 0, trades: 0, pendingAmount: '0.00' })

userInfo.value = getUserInfo()

async function fetchStats() {
  if (!userInfo.value) return
  try {
    const [prodRes, tradeRes, settleRes] = await Promise.all([
      get('/products/my').catch(() => ({ products: [] })),
      get('/trades/my').catch(() => ({ trades: [] })),
      get('/settlements').catch(() => ({ settlements: [] }))
    ])
    stats.value.products = (prodRes.products || []).length
    stats.value.trades = (tradeRes.trades || []).length
    const pending = (settleRes.settlements || []).reduce(
      (sum, s) => sum + (parseFloat(s.total_amount) || 0), 0
    )
    stats.value.pendingAmount = pending.toFixed(2)
  } catch (e) {
    console.error('Failed to fetch stats:', e)
  }
}

onShow(() => {
  userInfo.value = getUserInfo()
  fetchStats()
})

const loginSubtitle = computed(() => {
  if (!userInfo.value) return '登录后可发布货源'
  const parts = []
  if (userInfo.value.phone) parts.push(userInfo.value.phone)
  if (userInfo.value.origin_city) parts.push(userInfo.value.origin_city)
  return parts.length ? parts.join(' · ') : '已登录'
})

function roleLabel(role) {
  const map = { farmer: '农户', stall: '档口', driver: '司机' }
  return map[role] || role
}

function onLoginTap() {
  if (userInfo.value) return
  login()
    .then(u => {
      userInfo.value = u
      uni.showToast({ title: '登录成功', icon: 'success' })
    })
    .catch(err => {
      console.error('Login failed:', err)
      uni.showToast({ title: '登录失败，请重试', icon: 'none' })
    })
}

function onSwitchRole() {
  uni.showToast({ title: '切换角色功能开发中', icon: 'none' })
}

function onNavTap(label) {
  const routes = {
    '我的货源': '/pages/supply/index',
    '代卖管理': '/pages/consignment/index',
    '销售记录': '/pages/sales-history/index',
    '结算对账': '/pages/settlement/index',
    '实名认证': null,
    '设置': null
  }
  const url = routes[label]
  if (label === '我的货源') {
    uni.setStorageSync('supply_filter_mine', '1')
    uni.switchTab({ url })
  } else if (url) {
    uni.navigateTo({ url })
  } else {
    uni.showToast({ title: label + '开发中', icon: 'none' })
  }
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
  .avatar-icon {
    width: 56rpx;
    height: 56rpx;
  }
}

.avatar-pic {
  width: 100%;
  height: 100%;
}

.user-info {
  flex: 1;
}

.user-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.user-name {
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
}

.role-badge {
  margin-left: 12rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #fff;
  line-height: 1.4;
}

.role-badge.role-farmer {
  background-color: #15803D;
}
.role-badge.role-stall {
  background-color: #CA8A04;
}
.role-badge.role-driver {
  background-color: #2563EB;
}

.user-sub {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* Info cards (verified + credit) */
.info-cards {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.info-card {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-radius: 10px;
  background-color: #fff;
  min-height: 44px;
}

.info-card.verified {
  border-left: 6rpx solid #15803D;
}

.info-card.unverified {
  border-left: 6rpx solid #CA8A04;
}

.info-card.credit {
  border-left: 6rpx solid #CA8A04;
}

.info-card-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.info-card-text {
  font-size: 32rpx;
  color: #14532D;
}

/* Stats row */
.stats-row {
  display: flex;
  background-color: #fff;
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
  color: #14532D;
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
  width: 44rpx;
  height: 44rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.nav-text {
  flex: 1;
  font-size: 32rpx;
  color: #14532D;
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
