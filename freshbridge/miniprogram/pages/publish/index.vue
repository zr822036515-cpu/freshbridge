<template>
  <view class="page">
    <!-- Voice input: primary interaction for elderly farmers -->
    <view class="voice-section">
      <view class="voice-btn touch-target" @touchstart="onVoiceStart" @touchend="onVoiceEnd">
        <text class="voice-icon">🎤</text>
        <text class="voice-text">按住说话，快速发布货源</text>
      </view>
    </view>

    <!-- Divider -->
    <view class="divider">
      <view class="divider-line"></view>
      <text class="divider-text">或手动填写</text>
      <view class="divider-line"></view>
    </view>

    <!-- Manual form entry -->
    <view class="manual-section">
      <view class="manual-btn btn-primary touch-target" @tap="onManualPublish">
        <text>手动填写表单</text>
      </view>
    </view>

    <!-- Tips -->
    <view class="tips">
      <text class="tips-text">提示：语音发布会自动识别品种、数量、价格等信息，方便快捷</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)

function onVoiceStart() {
  // TODO: Start voice recording
  console.log('Voice recording started')
  uni.vibrateShort()
}

function onVoiceEnd() {
  // TODO: Stop voice recording, send to speech-to-text
  console.log('Voice recording ended')
  uni.showToast({ title: '语音识别功能开发中', icon: 'none' })
}

function onManualPublish() {
  // TODO: Navigate to manual publish form
  console.log('Navigate to manual publish form')
  uni.showToast({ title: '表单功能开发中', icon: 'none' })
}
</script>

<style scoped lang="scss">
.page {
  padding: 48rpx 24rpx;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Voice section */
.voice-section {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 120rpx;
  margin-bottom: 60rpx;
}

.voice-btn {
  width: 400rpx;
  height: 400rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #22C55E, #15803D);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(21, 128, 61, 0.3);
  transition: transform 0.15s;
  min-height: 44px;
  min-width: 44px;

  &:active {
    transform: scale(0.95);
  }
}

.voice-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.voice-text {
  font-size: 32rpx;
  color: var(--white);
  text-align: center;
  padding: 0 40rpx;
  line-height: 1.5;
}

/* Divider */
.divider {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 60rpx;

  &-line {
    flex: 1;
    height: 1px;
    background-color: var(--border);
  }

  &-text {
    padding: 0 32rpx;
    font-size: 32rpx;
    color: var(--text-muted);
  }
}

/* Manual button */
.manual-section {
  width: 100%;
  padding: 0 48rpx;
  margin-bottom: 60rpx;
}

.manual-btn {
  width: 100%;
  border-radius: 10px;
}

/* Tips */
.tips {
  width: 100%;
  padding: 0 48rpx;
  text-align: center;
}

.tips-text {
  font-size: 32rpx;
  color: var(--text-muted);
  line-height: 1.6;
}
</style>
