<template>
  <view class="page">
    <view class="page-header">
      <text class="page-title">我的订单</text>
    </view>

    <!-- Status Tabs -->
    <scroll-view scroll-x class="tab-scroll" :show-scrollbar="false">
      <view class="tabs">
        <view v-for="t in statusTabs" :key="t.key" class="tab" :class="{ active: activeStatus === t.key }" @tap="activeStatus = t.key">{{ t.label }}</view>
      </view>
    </scroll-view>

    <view v-if="loading" class="state-text">加载中...</view>

    <!-- Order List -->
    <view v-if="!loading" class="order-list">
      <view v-for="order in filteredOrders" :key="order.id" class="order-card">
        <view class="oc-top">
          <view class="oc-date">
            <text>📅</text>
            <text class="oc-date-text">{{ order.created_at?.slice(0,10) || '--' }}</text>
          </view>
          <view class="oc-status" :class="'status-' + (order.status || 'pending')">
            {{ statusLabel(order.status) }}
          </view>
        </view>
        <view class="oc-body">
          <view class="oc-img"><text>📦</text></view>
          <view class="oc-info">
            <text class="oc-name">{{ order.product_name || '水果商品' }}</text>
            <text class="oc-spec">Qty: {{ order.quantity || 1 }}</text>
            <view class="oc-price-row">
              <text class="oc-price">¥{{ (order.total_amount || 0).toFixed(2) }}</text>
            </view>
          </view>
        </view>
        <view class="oc-footer">
          <text class="oc-id">订单号: #{{ order.id }}</text>
          <view class="oc-actions">
            <view v-if="order.status === 'pending'" class="oc-btn outline" @tap="cancelOrder(order)">取消</view>
            <view v-if="order.status === 'pending'" class="oc-btn primary" @tap="payOrder(order)">去付款</view>
            <view v-if="order.status === 'shipped'" class="oc-btn primary" @tap="confirmOrder(order)">确认收货</view>
            <view v-if="order.status === 'completed'" class="oc-btn outline" @tap="reBuy(order)">再次购买</view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="!loading && filteredOrders.length === 0" class="empty-state">
      <text class="empty-icon">📋</text>
      <text class="empty-text">暂无此类订单</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, put } from '../../utils/api'

const loading = ref(false)
const orders = ref([])
const activeStatus = ref('all')
const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'shipped', label: '已发货' },
  { key: 'completed', label: '已完成' },
]

const filteredOrders = computed(() => {
  return activeStatus.value === 'all' ? orders.value : orders.value.filter(o => o.status === activeStatus.value)
})

function statusLabel(s) {
  const map = { pending: '待付款', paid: '已付款', shipped: '已发货', completed: '已完成', cancelled: '已取消' }
  return map[s] || s || '--'
}
async function cancelOrder(order) {
  uni.showModal({ title: '取消订单', content: '确定要取消吗？', success: async (r) => {
    if (r.confirm) { try { await put('/mall/orders/' + order.id + '/cancel'); fetchOrders() } catch (e) {} }
  }})
}
function payOrder(order) { uni.showToast({ title: '模拟支付成功', icon: 'success' }) }
function confirmOrder(order) { uni.showToast({ title: '已确认收货', icon: 'success' }) }
function reBuy(order) { uni.navigateTo({ url: '/pages/mall/index' }) }

async function fetchOrders() {
  try { const res = await get('/mall/orders'); orders.value = res.orders || [] } catch (e) {}
}

onShow(() => fetchOrders())
</script>

<style scoped lang="scss">
.page { padding: 24rpx; background: var(--bg); min-height: 100vh; }
.page-header { margin-bottom: 24rpx; }
.page-title { font-size: 40rpx; font-weight: 700; color: var(--text); }

.tab-scroll { margin-bottom: 24rpx; white-space: nowrap; }
.tabs { display: inline-flex; gap: 12rpx; }
.tab { padding: 12rpx 28rpx; border-radius: 24rpx; font-size: 26rpx; color: var(--text-secondary); background: #fff; display: inline-block; position: relative; }
.tab.active { color: var(--primary); font-weight: 700; }
.tab.active::after { content: ''; position: absolute; bottom: 4rpx; left: 50%; transform: translateX(-50%); width: 32rpx; height: 4rpx; background: var(--primary); border-radius: 2rpx; }

.order-list { display: flex; flex-direction: column; gap: 16rpx; }
.order-card { background: #fff; border-radius: 16rpx; padding: 24rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); }
.oc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.oc-date { display: flex; align-items: center; gap: 8rpx; font-size: 24rpx; color: var(--text-muted); }
.oc-date-text { font-size: 24rpx; }
.oc-status { padding: 4rpx 16rpx; border-radius: 6rpx; font-size: 20rpx; font-weight: 700; }
.status-pending { background: #FEF3C7; color: #CA8A04; }
.status-shipped { background: #DBEAFE; color: #2563EB; }
.status-completed { background: #DCFCE7; color: #16A34A; }

.oc-body { display: flex; gap: 16rpx; margin-bottom: 16rpx; }
.oc-img { width: 120rpx; height: 120rpx; border-radius: 12rpx; background: linear-gradient(135deg, #E8F5E9, #F1F8E9); display: flex; align-items: center; justify-content: center; font-size: 56rpx; flex-shrink: 0; }
.oc-info { flex: 1; }
.oc-name { font-size: 28rpx; font-weight: 700; color: var(--text); display: block; }
.oc-spec { font-size: 24rpx; color: var(--text-muted); margin-top: 4rpx; display: block; }
.oc-price-row { margin-top: 8rpx; }
.oc-price { font-size: 32rpx; font-weight: 700; color: var(--primary); }

.oc-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16rpx; border-top: 1px solid var(--border-light); }
.oc-id { font-size: 24rpx; color: var(--text-muted); }
.oc-actions { display: flex; gap: 12rpx; }
.oc-btn { padding: 10rpx 28rpx; border-radius: 8rpx; font-size: 24rpx; font-weight: 600; }
.oc-btn.primary { background: var(--primary); color: #fff; }
.oc-btn.outline { border: 2rpx solid var(--text-muted); color: var(--text-secondary); }

.state-text { text-align: center; padding: 80rpx 0; color: var(--text-muted); font-size: 28rpx; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 120rpx 0; }
.empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.empty-text { font-size: 28rpx; color: var(--text-muted); }
</style>
