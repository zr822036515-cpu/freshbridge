<template>
  <view class="page">
    <!-- Message list -->
    <view class="message-list">
      <view
        v-for="(msg, index) in messages"
        :key="index"
        class="message-item card touch-target"
        @tap="onMessageTap(msg)"
      >
        <view class="message-avatar">
          <text class="avatar-placeholder">📢</text>
        </view>
        <view class="message-body">
          <view class="message-header">
            <text class="message-title">{{ msg.title }}</text>
            <text class="message-time">{{ msg.time }}</text>
          </view>
          <text class="message-preview">{{ msg.preview }}</text>
        </view>
      </view>
    </view>

    <!-- Empty state -->
    <view v-if="messages.length === 0" class="empty-state">
      <text class="empty-icon">💬</text>
      <text class="empty-text">暂无消息</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)

// TODO: const res = await get('/messages')
const messages = ref([
  { title: '平台公告', time: '2026-05-28', preview: '鲜桥平台正式上线，欢迎各位农户和档口老板使用！' },
  { title: '系统通知', time: '2026-05-27', preview: '您的实名认证已通过审核' }
])

function onMessageTap(msg) {
  console.log('Open message:', msg.title)
  // TODO: Navigate to message detail
}
</script>

<style scoped lang="scss">
.page {
  padding: 24rpx;
  min-height: 100vh;
}

.message-list {
  display: flex;
  flex-direction: column;
}

.message-item {
  display: flex;
  align-items: flex-start;
  padding: 24rpx 20rpx;
}

.message-avatar {
  margin-right: 20rpx;
  flex-shrink: 0;
}

.avatar-placeholder {
  font-size: 48rpx;
  display: block;
  width: 80rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background-color: var(--bg-light);
  border-radius: 12rpx;
}

.message-body {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.message-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text);
}

.message-time {
  font-size: 32rpx;
  color: var(--text-muted);
  flex-shrink: 0;
  margin-left: 16rpx;
}

.message-preview {
  font-size: 32rpx;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.empty-icon {
  font-size: 96rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  color: var(--text-muted);
}
</style>
