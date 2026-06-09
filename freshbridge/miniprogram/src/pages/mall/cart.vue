<template>
  <view class="page">
    <view class="page-header">
      <text class="page-title">购物车</text>
      <text v-if="items.length > 0" class="clear-btn" @tap="clearCart">清空</text>
    </view>

    <view v-if="loading" class="state-text">加载中...</view>

    <!-- Cart Items -->
    <view v-if="!loading && items.length > 0" class="cart-list">
      <view v-for="(item, i) in items" :key="item.id" class="cart-item">
        <view class="ci-check" @tap="toggleItem(i)">
          <view class="check-circle" :class="{ checked: item.checked }">
            <text v-if="item.checked">✓</text>
          </view>
        </view>
        <view class="ci-img">
          <text class="ci-img-emoji">{{ item.emoji || '🍎' }}</text>
        </view>
        <view class="ci-info">
          <text class="ci-name">{{ item.name }}</text>
          <text class="ci-spec">{{ item.spec || '' }}</text>
          <view class="ci-qty-row">
            <text class="ci-price">¥{{ item.price }}</text>
            <view class="qty-control">
              <view class="qty-btn" @tap="decrease(i)"><text>−</text></view>
              <text class="qty-num">{{ item.quantity }}</text>
              <view class="qty-btn" @tap="increase(i)"><text>+</text></view>
            </view>
          </view>
        </view>
      </view>

      <!-- Upsell -->
      <view class="upsell-row">
        <view class="upsell-card">
          <text class="us-label">🎁 礼品包装</text>
          <text class="us-price">+¥5.00</text>
        </view>
        <view class="upsell-card">
          <text class="us-label">🧊 冷链配送</text>
          <text class="us-price">+¥12.00</text>
        </view>
      </view>
    </view>

    <!-- Empty -->
    <view v-if="!loading && items.length === 0" class="empty-state">
      <text class="empty-icon">🛒</text>
      <text class="empty-text">购物车是空的</text>
      <view class="go-shop-btn" @tap="goMall">去逛逛</view>
    </view>

    <!-- Bottom Bar -->
    <view v-if="items.length > 0" class="bottom-bar">
      <view class="bb-left" @tap="toggleAll">
        <view class="check-circle" :class="{ checked: allChecked }">
          <text v-if="allChecked">✓</text>
        </view>
        <text class="bb-all">全选</text>
      </view>
      <view class="bb-right">
        <view class="bb-total">
          <text class="bb-total-label">合计</text>
          <text class="bb-total-amount">¥{{ totalAmount }}</text>
        </view>
        <view class="bb-btn" @tap="checkout">结算({{ checkedCount }})</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get } from '../../utils/api'

const loading = ref(false)
const items = ref([])
const fruitEmojis = { '苹果': '🍎', '梨': '🍐', '橙子': '🍊', '葡萄': '🍇', '草莓': '🍓', '蓝莓': '🫐', '樱桃': '🍒', '桃子': '🍑', '芒果': '🥭', '榴莲': '🥥', '西瓜': '🍉', '香蕉': '🍌', '猕猴桃': '🥝' }
const checkedCount = computed(() => items.value.filter(i => i.checked).length)
const allChecked = computed(() => items.value.length > 0 && items.value.every(i => i.checked))
const totalAmount = computed(() => {
  return items.value.filter(i => i.checked).reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)
})

function toggleItem(i) { items.value[i].checked = !items.value[i].checked }
function toggleAll() { const v = !allChecked.value; items.value.forEach(i => i.checked = v) }
function increase(i) { items.value[i].quantity++ }
function decrease(i) { if (items.value[i].quantity > 1) items.value[i].quantity-- }
function clearCart() {
  uni.showModal({ title: '清空购物车', content: '确定要清空吗？', success: (res) => {
    if (res.confirm) items.value = []
  }})
}
function checkout() {
  const checked = items.value.filter(i => i.checked)
  if (checked.length === 0) { uni.showToast({ title: '请选择商品', icon: 'none' }); return }
  uni.navigateTo({ url: '/pages/mall/checkout' })
}
function goMall() { uni.navigateTo({ url: '/pages/mall/index' }) }

async function fetchCart() {
  try {
    const res = await get('/mall/cart')
    items.value = (res.items || []).map(i => ({
      ...i,
      name: i.product?.name || i.name || '商品',
      spec: i.product?.spec || '',
      emoji: fruitEmojis[i.product?.name] || '🍎',
      checked: true,
    }))
  } catch (e) { /* offline ok */ }
}

onShow(() => fetchCart())
</script>

<style scoped lang="scss">
.page { padding: 24rpx; min-height: 100vh; background: var(--bg); }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
.page-title { font-size: 40rpx; font-weight: 700; color: var(--text); }
.clear-btn { font-size: 28rpx; color: var(--danger); }

/* Cart Items */
.cart-list { display: flex; flex-direction: column; gap: 16rpx; }
.cart-item {
  display: flex; align-items: center; gap: 20rpx;
  background: #fff; border-radius: 16rpx; padding: 20rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
}
.check-circle {
  width: 40rpx; height: 40rpx; border-radius: 50%;
  border: 3rpx solid var(--border); display: flex; align-items: center; justify-content: center;
  font-size: 22rpx; color: #fff; transition: all 0.2s;
  &.checked { background: var(--primary); border-color: var(--primary); }
}
.ci-img {
  width: 120rpx; height: 120rpx; border-radius: 12rpx;
  background: linear-gradient(135deg, #E8F5E9, #F1F8E9);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ci-img-emoji { font-size: 56rpx; }
.ci-info { flex: 1; min-width: 0; }
.ci-name { font-size: 30rpx; font-weight: 700; color: var(--text); display: block; }
.ci-spec { font-size: 24rpx; color: var(--text-muted); margin-top: 4rpx; display: block; }
.ci-qty-row { display: flex; justify-content: space-between; align-items: center; margin-top: 16rpx; }
.ci-price { font-size: 32rpx; font-weight: 700; color: var(--primary); }
.qty-control { display: flex; align-items: center; gap: 8rpx; background: #EDEEEB; border-radius: 24rpx; padding: 4rpx; }
.qty-btn {
  width: 48rpx; height: 48rpx; border-radius: 50%;
  background: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 28rpx; color: var(--text);
}
.qty-num { font-size: 28rpx; font-weight: 600; width: 48rpx; text-align: center; }

/* Upsell */
.upsell-row { display: flex; gap: 16rpx; margin-top: 8rpx; }
.upsell-card {
  flex: 1; background: #fff; border-radius: 12rpx; padding: 20rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
  display: flex; flex-direction: column; gap: 8rpx;
}
.us-label { font-size: 24rpx; color: var(--text-secondary); }
.us-price { font-size: 28rpx; font-weight: 700; color: var(--gold); }

/* Empty */
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 160rpx 0; }
.empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.empty-text { font-size: 28rpx; color: var(--text-muted); margin-bottom: 32rpx; }
.go-shop-btn { background: var(--primary); color: #fff; padding: 16rpx 48rpx; border-radius: 32rpx; font-size: 28rpx; font-weight: 600; }

/* Bottom Bar */
.bottom-bar {
  position: fixed; bottom: 0; left: 0; width: 100%;
  background: #fff; padding: 20rpx 24rpx; padding-bottom: 40rpx;
  display: flex; justify-content: space-between; align-items: center;
  box-shadow: 0 -2rpx 16rpx rgba(0,0,0,0.04); z-index: 50;
}
.bb-left { display: flex; align-items: center; gap: 12rpx; }
.bb-all { font-size: 28rpx; color: var(--text-secondary); }
.bb-right { display: flex; align-items: center; gap: 16rpx; }
.bb-total { display: flex; flex-direction: column; text-align: right; }
.bb-total-label { font-size: 22rpx; color: var(--text-muted); }
.bb-total-amount { font-size: 36rpx; font-weight: 700; color: var(--text); }
.bb-btn { background: var(--primary); color: #fff; padding: 20rpx 48rpx; border-radius: 32rpx; font-size: 28rpx; font-weight: 700; }
.state-text { text-align: center; padding: 80rpx 0; color: var(--text-muted); font-size: 28rpx; }
</style>
