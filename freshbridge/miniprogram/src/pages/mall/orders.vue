<template>
  <view class="page">
    <view class="header">
      <text class="header-title">我的订单</text>
    </view>

    <view v-if="loading" class="empty-text">加载中...</view>
    <view v-else-if="orders.length === 0" class="empty-text">暂无订单</view>
    <view v-else>
      <view v-for="order in orders" :key="order.id" class="order-card" @tap="goDetail(order.id)">
        <view class="oc-header">
          <text class="oc-no">订单号：{{ order.order_no }}</text>
          <text class="oc-status" :class="'status-' + order.status">{{ statusMap[order.status] }}</text>
        </view>
        <view class="oc-body">
          <text class="oc-amount">¥{{ order.total_amount.toFixed(2) }}</text>
          <text class="oc-date">{{ order.created_at.slice(0, 10) }}</text>
        </view>
        <view class="oc-footer">
          <text class="oc-receiver">{{ order.receiver_name }} {{ order.receiver_phone }}</text>
          <view v-if="order.status === 'pending'" class="cancel-btn" @tap.stop="cancelOrder(order.id)">取消订单</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, put } from '../../utils/api'

const statusMap = {
  pending: '待支付',
  paid: '已支付',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消'
}
const loading = ref(true)
const orders = ref([])

async function fetchOrders() {
  loading.value = true
  try {
    const res = await get('/mall/orders')
    orders.value = res.orders || []
  } catch (e) { /* silent */ }
  loading.value = false
}

async function cancelOrder(id) {
  try {
    await put('/mall/orders/' + id + '/cancel')
    const order = orders.value.find(o => o.id === id)
    if (order) order.status = 'cancelled'
    uni.showToast({ title: '已取消', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '取消失败', icon: 'none' })
  }
}

function goDetail(id) {
  uni.navigateTo({ url: '/pages/mall/detail?id=' + id })
}

onShow(() => { fetchOrders() })
</script>

<style scoped lang="scss">
.page { padding: 24rpx; min-height: 100vh; }
.header { margin-bottom: 24rpx; }
.header-title { font-size: 36rpx; font-weight: 700; color: #14532D; }

.empty-text { font-size: 32rpx; color: #999; text-align: center; padding: 120rpx 0; }

.order-card { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05); }
.oc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.oc-no { font-size: 26rpx; color: #999; }
.oc-status { font-size: 26rpx; font-weight: 600; }
.status-pending { color: #F59E0B; }
.status-paid { color: #3B82F6; }
.status-shipped { color: #8B5CF6; }
.status-completed { color: #22C55E; }
.status-cancelled { color: #EF4444; }

.oc-body { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.oc-amount { font-size: 40rpx; font-weight: 700; color: #EF4444; }
.oc-date { font-size: 26rpx; color: #999; }
.oc-footer { display: flex; justify-content: space-between; align-items: center; }
.oc-receiver { font-size: 28rpx; color: #666; }
.cancel-btn {
  padding: 8rpx 24rpx; border: 1px solid #EF4444; color: #EF4444;
  border-radius: 8rpx; font-size: 26rpx;
}
</style>
