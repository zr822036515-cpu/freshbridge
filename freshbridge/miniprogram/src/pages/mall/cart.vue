<template>
  <view class="page">
    <view class="header">
      <text class="header-title">购物车</text>
    </view>

    <view v-if="loading" class="empty-text">加载中...</view>
    <view v-else-if="items.length === 0" class="empty-cart">
      <text class="empty-icon">🛒</text>
      <text class="empty-text">购物车是空的</text>
      <view class="go-shop" @tap="goMall">去逛逛</view>
    </view>
    <view v-else>
      <!-- Cart items -->
      <view v-for="item in items" :key="item.id" class="cart-item">
        <view class="ci-info">
          <text class="ci-name">{{ item.name }}</text>
          <text class="ci-price">¥{{ item.price.toFixed(2) }}</text>
        </view>
        <view class="ci-qty">
          <view class="qty-btn" @tap="decrease(item)">−</view>
          <text class="qty-num">{{ item.quantity }}</text>
          <view class="qty-btn" @tap="increase(item)">+</view>
        </view>
        <text class="ci-delete" @tap="remove(item.id)">删除</text>
      </view>

      <!-- Total -->
      <view class="total-bar">
        <text class="total-label">合计：</text>
        <text class="total-price">¥{{ totalAmount.toFixed(2) }}</text>
      </view>

      <!-- Checkout -->
      <view class="checkout-btn" @tap="goCheckout">去结算</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, put, del } from '../../utils/api'

const loading = ref(true)
const items = ref([])

const totalAmount = computed(() => {
  return items.value.reduce((s, i) => s + i.price * i.quantity, 0)
})

async function fetchCart() {
  loading.value = true
  try {
    const res = await get('/mall/cart')
    items.value = res.items || []
  } catch (e) { /* silent */ }
  loading.value = false
}

async function increase(item) {
  if (item.quantity >= item.stock) {
    uni.showToast({ title: '库存不足', icon: 'none' })
    return
  }
  await put('/mall/cart/' + item.id, { quantity: item.quantity + 1 })
  item.quantity++
}

async function decrease(item) {
  if (item.quantity <= 1) return
  await put('/mall/cart/' + item.id, { quantity: item.quantity - 1 })
  item.quantity--
}

async function remove(id) {
  await del('/mall/cart/' + id)
  items.value = items.value.filter(i => i.id !== id)
}

function goCheckout() {
  uni.navigateTo({ url: '/pages/mall/checkout' })
}

function goMall() {
  uni.switchTab({ url: '/pages/home/index' })
}

onShow(() => { fetchCart() })
</script>

<style scoped lang="scss">
.page { padding: 24rpx; min-height: 100vh; }

.header { margin-bottom: 24rpx; }
.header-title { font-size: 36rpx; font-weight: 700; color: #14532D; }

.empty-cart { text-align: center; padding: 120rpx 0; }
.empty-icon { font-size: 80rpx; display: block; }
.empty-text { font-size: 32rpx; color: #999; padding: 24rpx 0; display: block; }
.go-shop {
  display: inline-block; padding: 16rpx 48rpx; background: #15803D; color: #fff;
  border-radius: 32rpx; font-size: 30rpx; margin-top: 16rpx;
}

.cart-item {
  display: flex; align-items: center; background: #fff; padding: 24rpx;
  border-radius: 12rpx; margin-bottom: 16rpx; gap: 16rpx;
}
.ci-info { flex: 1; }
.ci-name { font-size: 32rpx; font-weight: 600; color: #14532D; display: block; }
.ci-price { font-size: 30rpx; color: #EF4444; margin-top: 8rpx; display: block; }
.ci-qty { display: flex; align-items: center; gap: 12rpx; }
.qty-btn {
  width: 48rpx; height: 48rpx; line-height: 48rpx; text-align: center;
  border: 2rpx solid #E5E7EB; border-radius: 8rpx; font-size: 28rpx; color: #333;
}
.qty-num { font-size: 30rpx; font-weight: 600; min-width: 40rpx; text-align: center; }
.ci-delete { font-size: 26rpx; color: #EF4444; padding: 8rpx; }

.total-bar {
  display: flex; justify-content: flex-end; align-items: center; padding: 24rpx 0;
}
.total-label { font-size: 32rpx; color: #666; }
.total-price { font-size: 40rpx; font-weight: 700; color: #EF4444; }

.checkout-btn {
  text-align: center; padding: 24rpx 0; background: #15803D; color: #fff;
  border-radius: 12rpx; font-size: 34rpx; font-weight: 600; margin-top: 16rpx;
}
</style>
