<template>
  <view class="page">
    <view class="header">
      <text class="header-title">今日行情大盘</text>
      <text class="header-date">{{ today }}</text>
    </view>

    <!-- Market overview cards -->
    <view class="overview-row">
      <view class="overview-card card">
        <text class="overview-label">今日平台交易额</text>
        <text class="overview-value amount-green">--</text>
        <text class="overview-sub">数据加载中</text>
      </view>
      <view class="overview-card card">
        <text class="overview-label">在售品种数</text>
        <text class="overview-value amount-green">--</text>
        <text class="overview-sub">数据加载中</text>
      </view>
    </view>

    <!-- Hot categories ranking -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门品类排行</text>
        <text class="section-more">查看更多 ></text>
      </view>
      <view class="card">
        <text class="empty-text">各品类交易数据将在接入后展示</text>
      </view>
    </view>

    <!-- Market price index -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">各大市场价格指数</text>
      </view>
      <view class="card">
        <text class="empty-text">市场价格指数将在接入后展示</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)
const today = ref(getToday())

function getToday() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<style scoped lang="scss">
.page {
  padding: 24rpx;
  min-height: 100vh;
}

.header {
  margin-bottom: 32rpx;

  &-title {
    font-size: 36rpx;
    font-weight: 700;
    color: var(--text);
    display: block;
  }

  &-date {
    font-size: 32rpx;
    color: var(--text-muted);
    margin-top: 8rpx;
    display: block;
  }
}

.overview-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.overview-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 12px;
}

.overview-label {
  font-size: 32rpx;
  color: var(--text-secondary);
  margin-bottom: 12rpx;
}

.overview-value {
  font-size: 44rpx;
  margin-bottom: 8rpx;
}

.overview-sub {
  font-size: 32rpx;
  color: var(--text-muted);
}

.section {
  margin-bottom: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text);
}

.section-more {
  font-size: 32rpx;
  color: var(--primary);
}

.empty-text {
  font-size: 32rpx;
  color: var(--text-muted);
  text-align: center;
  display: block;
  padding: 32rpx 0;
}
</style>
