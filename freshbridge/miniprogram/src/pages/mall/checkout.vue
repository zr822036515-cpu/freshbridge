<template>
  <view class="page">
    <view class="header">
      <text class="header-title">确认订单</text>
    </view>

    <!-- Order items -->
    <view class="section">
      <text class="section-title">商品明细</text>
      <view v-for="item in items" :key="item.id" class="order-item">
        <text class="oi-name">{{ item.name }}</text>
        <text class="oi-qty">×{{ item.quantity }}</text>
        <text class="oi-price">¥{{ (item.price * item.quantity).toFixed(2) }}</text>
      </view>
      <view class="total-line">
        <text>合计</text>
        <text class="total-price">¥{{ totalAmount.toFixed(2) }}</text>
      </view>
    </view>

    <!-- Receiver info -->
    <view class="section">
      <text class="section-title">收货信息</text>
      <input class="input" v-model="form.receiver_name" placeholder="收货人姓名" />
      <input class="input" v-model="form.receiver_phone" placeholder="手机号码" type="number" maxlength="11" />
      <input class="input" v-model="form.receiver_address" placeholder="详细地址" />
      <input class="input" v-model="form.note" placeholder="备注（选填）" />
    </view>

    <!-- Place order -->
    <view class="submit-btn" @tap="placeOrder" :class="{ disabled: submitting }">
      {{ submitting ? '提交中...' : '提交订单' }}
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, post } from '../../utils/api'

const items = ref([])
const submitting = ref(false)
const form = ref({
  receiver_name: '',
  receiver_phone: '',
  receiver_address: '',
  note: ''
})

const totalAmount = computed(() => {
  return items.value.reduce((s, i) => s + i.price * i.quantity, 0)
})

async function fetchCart() {
  try {
    const res = await get('/mall/cart')
    items.value = res.items || []
  } catch (e) { /* silent */ }
}

async function placeOrder() {
  if (!form.value.receiver_name || !form.value.receiver_phone || !form.value.receiver_address) {
    uni.showToast({ title: '请填写完整收货信息', icon: 'none' })
    return
  }
  if (items.value.length === 0) {
    uni.showToast({ title: '购物车为空', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    const res = await post('/mall/orders', form.value)
    uni.showToast({ title: '下单成功', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/mall/orders' })
    }, 1200)
  } catch (e) {
    uni.showToast({ title: '下单失败，请重试', icon: 'none' })
  }
  submitting.value = false
}

onShow(() => { fetchCart() })
</script>

<style scoped lang="scss">
.page { padding: 24rpx; min-height: 100vh; }
.header { margin-bottom: 24rpx; }
.header-title { font-size: 36rpx; font-weight: 700; color: #14532D; }

.section { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 24rpx; }
.section-title { font-size: 32rpx; font-weight: 600; color: #14532D; margin-bottom: 16rpx; display: block; }

.order-item { display: flex; align-items: center; padding: 12rpx 0; border-bottom: 1px solid #F0FDF4; }
.oi-name { flex: 1; font-size: 30rpx; color: #333; }
.oi-qty { font-size: 28rpx; color: #999; margin: 0 16rpx; }
.oi-price { font-size: 30rpx; font-weight: 600; color: #333; }

.total-line { display: flex; justify-content: space-between; padding-top: 16rpx; font-size: 34rpx; font-weight: 600; color: #14532D; }
.total-price { color: #EF4444; font-size: 38rpx; }

.input {
  width: 100%; padding: 20rpx 0; border-bottom: 1px solid #F0FDF4; font-size: 30rpx; color: #333; margin-bottom: 4rpx;
  &:last-child { border-bottom: none; }
}

.submit-btn {
  text-align: center; padding: 24rpx 0; background: #15803D; color: #fff;
  border-radius: 12rpx; font-size: 34rpx; font-weight: 600;
  &.disabled { opacity: 0.6; }
}
</style>
