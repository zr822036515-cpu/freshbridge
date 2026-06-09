<template>
  <view class="page">
    <view class="page-header">
      <text class="page-title">确认订单</text>
    </view>

    <!-- Shipping -->
    <view class="section">
      <view class="section-top">
        <text class="section-title">收货地址</text>
        <text class="link-btn">更换</text>
      </view>
      <view class="addr-card">
        <view class="addr-bar"></view>
        <view class="addr-row">
          <text>📍</text>
          <view>
            <text class="addr-name">张三  138****8888</text>
            <text class="addr-detail">浙江省杭州市西湖区文三路 882 号</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Items -->
    <view class="section">
      <text class="section-title">商品明细</text>
      <view v-for="item in items" :key="item.id" class="item">
        <view class="item-img"><text>{{ item.emoji || '📦' }}</text></view>
        <view class="item-info">
          <text class="item-name">{{ item.name }}</text>
          <text class="item-spec">{{ item.spec }}</text>
        </view>
        <view class="item-right">
          <text class="item-price">¥{{ item.price }}</text>
          <text class="item-qty">x{{ item.quantity }}</text>
        </view>
      </view>
    </view>

    <!-- Price -->
    <view class="section">
      <text class="section-title">费用明细</text>
      <view class="price-row"><text>商品金额</text><text>¥{{ total }}</text></view>
      <view class="price-row"><text>运费</text><text class="green">免运费</text></view>
      <view class="price-row total"><text>合计</text><text class="gold">¥{{ total }}</text></view>
    </view>

    <view class="spacer"></view>
    <view class="bottom-bar">
      <view class="bb-info"><text class="bb-label">合计</text><text class="bb-amount">¥{{ total }}</text></view>
      <view class="bb-btn" @tap="submit">提交订单</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { post } from '../../utils/api'

const items = ref([{ id: 1, name: '特级红富士苹果', spec: '5kg礼盒装', price: '128.00', quantity: 1, emoji: '🍎' }])
const total = computed(() => items.value.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0).toFixed(2))

async function submit() {
  try { await post('/mall/orders', { items: items.value }); uni.showToast({ title: '下单成功', icon: 'success' }); setTimeout(() => uni.navigateTo({ url: '/pages/mall/orders' }), 1500) } catch (e) { uni.showToast({ title: '提交失败', icon: 'none' }) }
}
</script>

<style scoped lang="scss">
.page { padding: 24rpx; background: var(--bg); min-height: 100vh; }
.page-header { margin-bottom: 24rpx; }
.page-title { font-size: 40rpx; font-weight: 700; color: var(--text); }

.section { margin-bottom: 24rpx; }
.section-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 700; color: var(--text); display: block; margin-bottom: 16rpx; }
.link-btn { font-size: 24rpx; color: var(--primary); background: #EDEEEB; padding: 6rpx 20rpx; border-radius: 20rpx; }

.addr-card { background: #fff; border-radius: 12rpx; padding: 24rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); position: relative; overflow: hidden; }
.addr-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 6rpx; background: var(--gold); }
.addr-row { display: flex; gap: 16rpx; }
.addr-name { font-size: 30rpx; font-weight: 700; color: var(--text); display: block; }
.addr-detail { font-size: 26rpx; color: var(--text-secondary); margin-top: 6rpx; display: block; }

.item { display: flex; align-items: center; gap: 16rpx; background: #fff; border-radius: 12rpx; padding: 20rpx; margin-bottom: 12rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }
.item-img { width: 88rpx; height: 88rpx; border-radius: 10rpx; background: linear-gradient(135deg, #E8F5E9, #F1F8E9); display: flex; align-items: center; justify-content: center; font-size: 48rpx; }
.item-info { flex: 1; }
.item-name { font-size: 28rpx; font-weight: 600; color: var(--text); display: block; }
.item-spec { font-size: 24rpx; color: var(--text-muted); margin-top: 4rpx; }
.item-right { text-align: right; }
.item-price { font-size: 30rpx; font-weight: 700; color: var(--text); display: block; }
.item-qty { font-size: 24rpx; color: var(--text-muted); }

.price-row { display: flex; justify-content: space-between; padding: 14rpx 0; font-size: 28rpx; color: var(--text-secondary); }
.price-row.total { border-top: 2rpx dashed var(--border-light); margin-top: 8rpx; padding-top: 20rpx; font-size: 32rpx; font-weight: 700; color: var(--text); }
.green { color: var(--up); }
.gold { color: var(--primary); font-size: 36rpx; font-weight: 700; }

.spacer { height: 160rpx; }
.bottom-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: #fff; padding: 20rpx 24rpx 40rpx; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 -2rpx 16rpx rgba(0,0,0,0.04); z-index: 50; }
.bb-label { font-size: 24rpx; color: var(--text-muted); display: block; }
.bb-amount { font-size: 40rpx; font-weight: 700; color: var(--text); display: block; }
.bb-btn { background: var(--primary); color: #fff; padding: 24rpx 64rpx; border-radius: 16rpx; font-size: 30rpx; font-weight: 700; }
</style>
