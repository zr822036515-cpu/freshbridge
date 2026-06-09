<template>
  <view class="page">
    <!-- Category tabs -->
    <view class="tabs">
      <view v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: activeTab === tab.key }" @tap="activeTab = tab.key">
        <text>{{ tab.label }}</text>
        <text v-if="tab.count > 0" class="tab-badge">{{ tab.count > 99 ? '99+' : tab.count }}</text>
      </view>
    </view>

    <!-- Message list -->
    <view class="msg-list">
      <view v-if="filteredList.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无消息</text>
      </view>
      <view v-for="msg in filteredList" :key="msg.id" class="msg-card" @tap="openMsg(msg)">
        <view class="msg-avatar" :class="'avatar-' + msg.type">
          <text class="avatar-icon">{{ typeIcon[msg.type] || '📋' }}</text>
        </view>
        <view class="msg-body">
          <view class="msg-top">
            <view class="msg-title-row">
              <text class="msg-title">{{ msg.title }}</text>
              <text v-if="!msg.read" class="msg-dot"></text>
            </view>
            <text class="msg-time">{{ fmtTime(msg.time) }}</text>
          </view>
          <text class="msg-text">{{ msg.content.slice(0, 80) }}{{ msg.content.length > 80 ? '...' : '' }}</text>
        </view>
      </view>
    </view>

    <!-- Detail popup -->
    <view v-if="detailVisible" class="detail-overlay" @tap="closeDetail">
      <view class="detail-card" @tap.stop>
        <view class="detail-header">
          <text class="detail-type">{{ typeLabel[activeMsg.type] || '消息' }}</text>
          <text class="detail-close" @tap="closeDetail">✕</text>
        </view>
        <text class="detail-title">{{ activeMsg.title }}</text>
        <text class="detail-time">{{ activeMsg.time }}</text>
        <view class="detail-divider"></view>
        <text class="detail-content">{{ activeMsg.content }}</text>
        <view v-if="activeMsg.link" class="detail-link" @tap="goLink(activeMsg.link)">
          {{ activeMsg.linkText || '查看详情' }} ›
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const tabs = [
  { key: 'all', label: '全部', count: 0 },
  { key: 'system', label: '系统', count: 2 },
  { key: 'trade', label: '交易', count: 4 },
  { key: 'logistics', label: '物流', count: 2 },
  { key: 'service', label: '客服', count: 1 },
]

const typeIcon = { system: '📢', trade: '💰', logistics: '🚚', service: '💬' }
const typeLabel = { system: '系统通知', trade: '交易消息', logistics: '物流通知', service: '客服消息' }

const activeTab = ref('all')
const detailVisible = ref(false)
const activeMsg = ref({})

const messages = ref([
  { id: 1, type: 'system', title: '鲜桥平台正式上线', time: '2026-06-04 09:00', content: '鲜桥 FreshBridge 水果代卖平台正式上线运营！欢迎各位农户和档口老板加入。平台提供行情查询、品牌商城、商务服务、大宗供需、物流运输等一站式服务。如在使用过程中有任何问题，请联系企业微信客服。', read: false },
  { id: 2, type: 'system', title: '实名认证已通过', time: '2026-06-03 14:30', content: '恭喜！您的实名认证已通过审核。现在可以发布货源信息、发起交易、使用商城购物等功能。感谢您的耐心等待。', read: true },
  { id: 3, type: 'trade', title: '订单 #FB202606031234 已确认', time: '2026-06-03 12:34', content: '您的订单 #FB202606031234 已确认，金额 ¥168.00。商品：精品水果礼盒装。预计1-3个工作日内发货，请留意物流信息。', read: false, link: '/pages/mall/orders' },
  { id: 4, type: 'trade', title: '结算到账通知', time: '2026-06-02 16:20', content: '您与北京新发地档口的代卖结算已完成。本期销售额 ¥12,580.00，扣除佣金 ¥3,145.00，实际到账 ¥9,435.00。请查收。', read: false },
  { id: 5, type: 'trade', title: '新代卖意向', time: '2026-06-02 10:15', content: '上海辉展档口对您的"红富士苹果"发起了代卖意向，意向佣金率25%。请及时确认或联系对方沟通细节。', read: true },
  { id: 6, type: 'trade', title: '出价已被接受', time: '2026-06-01 15:45', content: '您对"赣南脐橙 30吨"的出价已被农户接受。请尽快安排付款和物流事宜，确保交易顺利进行。', read: true },
  { id: 7, type: 'logistics', title: '货物已发车', time: '2026-06-02 08:30', content: '您的货物"红富士苹果 50吨"已从新疆阿克苏发车，预计3天后到达北京新发地。司机：张师傅（138****5678）。车牌：新A·12345。可随时在"在途追踪"页面查看实时位置。', read: false, link: '/pages/tracking/index', linkText: '查看轨迹' },
  { id: 8, type: 'logistics', title: '货物已签收', time: '2026-06-01 18:00', content: '您的货物"丹东草莓 5吨"已由深圳海吉星档口签收。请进入结算页面确认结算信息。', read: true },
  { id: 9, type: 'service', title: '企业微信客服消息', time: '2026-06-03 11:00', content: '您好，关于您咨询的品牌商城入驻事宜，目前平台正在完善商家入驻流程，预计下周开放申请入口。届时会通过系统消息通知您，敬请关注。如有其他问题可随时留言。', read: false },
])

const filteredList = computed(() => {
  if (activeTab.value === 'all') return messages.value
  return messages.value.filter(m => m.type === activeTab.value)
})

// Update tab counts
messages.value.forEach(m => {
  const tab = tabs.find(t => t.key === m.type)
  if (tab) tab.count = messages.value.filter(x => x.type === m.type && !x.read).length
})

function fmtTime(t) {
  const now = new Date()
  const d = new Date(t.replace(' ', 'T'))
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 172800000) return '昨天 ' + t.slice(11, 16)
  return t.slice(5, 10)
}

function openMsg(msg) {
  msg.read = true
  activeMsg.value = msg
  detailVisible.value = true
}
function closeDetail() { detailVisible.value = false }
function goLink(url) {
  detailVisible.value = false
  if (url.startsWith('/')) uni.navigateTo({ url })
}
</script>

<style scoped lang="scss">
.page { display: flex; flex-direction: column; height: 100vh; background: var(--bg); }

.tabs { display: flex; padding: 16rpx 24rpx; background: #fff; border-bottom: 1px solid var(--border-light); gap: 8rpx; }
.tab-item {
  position: relative; padding: 12rpx 24rpx; border-radius: 24rpx; font-size: 28rpx; color: var(--text-secondary); background: #EDEEEB;
  &.active { background: var(--primary); color: #fff; }
}
.tab-badge {
  position: absolute; top: -6rpx; right: -6rpx; min-width: 28rpx; height: 28rpx; line-height: 28rpx;
  background: var(--danger); color: #fff; font-size: 20rpx; border-radius: 14rpx; padding: 0 6rpx; text-align: center;
}

.msg-list { flex: 1; padding: 16rpx 24rpx; overflow-y: auto; }
.msg-card { display: flex; padding: 24rpx 16rpx; background: #fff; border-radius: 12rpx; margin-bottom: 12rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); }
.msg-avatar {
  width: 88rpx; height: 88rpx; border-radius: 16rpx; display: flex; align-items: center; justify-content: center;
  margin-right: 20rpx; flex-shrink: 0;
  .avatar-icon { font-size: 40rpx; }
}
.avatar-system { background: #E8F5E9; }
.avatar-trade { background: #FFF8E1; }
.avatar-logistics { background: #E3F2FD; }
.avatar-service { background: #F3E5F5; }

.msg-body { flex: 1; min-width: 0; }
.msg-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10rpx; }
.msg-title-row { display: flex; align-items: center; gap: 8rpx; }
.msg-title { font-size: 30rpx; font-weight: 600; color: var(--text); }
.msg-dot { width: 14rpx; height: 14rpx; border-radius: 50%; background: var(--danger); flex-shrink: 0; }
.msg-time { font-size: 24rpx; color: var(--text-muted); flex-shrink: 0; margin-left: 12rpx; }
.msg-text { font-size: 26rpx; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 200rpx 0; }
.empty-icon { font-size: 80rpx; margin-bottom: 20rpx; }
.empty-text { font-size: 28rpx; color: var(--text-muted); }

.detail-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 100;
  display: flex; align-items: flex-end; justify-content: center;
}
.detail-card { width: 100%; max-height: 75vh; background: #fff; border-radius: 24rpx 24rpx 0 0; padding: 32rpx 32rpx 60rpx; overflow-y: auto; }
.detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.detail-type { font-size: 24rpx; color: var(--primary); background: #E8F5E9; padding: 4rpx 16rpx; border-radius: 8rpx; }
.detail-close { font-size: 32rpx; color: var(--text-muted); padding: 8rpx; }
.detail-title { font-size: 36rpx; font-weight: 700; color: var(--text); display: block; margin-bottom: 8rpx; }
.detail-time { font-size: 26rpx; color: var(--text-muted); display: block; }
.detail-divider { height: 1px; background: var(--border-light); margin: 24rpx 0; }
.detail-content { font-size: 30rpx; color: var(--text); line-height: 1.8; white-space: pre-wrap; }
.detail-link { margin-top: 24rpx; padding: 16rpx 0; text-align: center; color: var(--primary); font-size: 30rpx; font-weight: 600; border-top: 1px solid var(--border-light); }
</style>
