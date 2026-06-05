<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <text class="header-title">品牌商城</text>
      <view class="header-cart" @tap="goCart">
        <text class="cart-icon">🛒</text>
        <text v-if="cartCount > 0" class="cart-badge">{{ cartCount > 99 ? '99+' : cartCount }}</text>
      </view>
    </view>

    <!-- Category tabs -->
    <scroll-view scroll-x class="cat-tabs">
      <view v-for="cat in categories" :key="cat.value" class="cat-tab" :class="{ active: activeCat === cat.value }" @tap="switchCat(cat.value)">
        <text>{{ cat.label }}</text>
      </view>
    </scroll-view>

    <!-- Product list -->
    <view v-if="loading" class="empty-text">加载中...</view>
    <view v-else-if="products.length === 0" class="empty-text">暂无商品</view>
    <view v-else class="product-grid">
      <view v-for="p in products" :key="p.id" class="product-card" @tap="goDetail(p.id)">
        <view class="card-img-wrap">
          <image v-if="p.image_url" :src="p.image_url" mode="aspectFill" class="card-img" />
          <view v-else class="card-img-placeholder">🍎</view>
        </view>
        <view class="card-info">
          <text class="card-name">{{ p.name }}</text>
          <view class="card-price-row">
            <text class="card-price">¥{{ p.price.toFixed(2) }}</text>
            <text v-if="p.original_price > p.price" class="card-original">¥{{ p.original_price.toFixed(2) }}</text>
          </view>
          <view class="card-bottom">
            <text class="card-sales">已售 {{ p.sales }}</text>
            <view class="add-btn" @tap.stop="addToCart(p.id)">+</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, post } from '../../utils/api'

const categories = [
  { label: '全部', value: '' },
  { label: '鲜果', value: 'fruit' },
  { label: '礼盒', value: 'gift' },
  { label: '其他', value: 'other' }
]
const activeCat = ref('')
const loading = ref(true)
const products = ref([])
const cartCount = ref(0)

function switchCat(cat) {
  activeCat.value = cat
  fetchProducts()
}

async function fetchProducts() {
  loading.value = true
  try {
    const res = await get('/mall/products', { category: activeCat.value })
    products.value = res.products || []
  } catch (e) { /* silent */ }
  loading.value = false
}

async function fetchCartCount() {
  try {
    const res = await get('/mall/cart/count')
    cartCount.value = res.count || 0
  } catch (e) { cartCount.value = 0 }
}

async function addToCart(productId) {
  try {
    await post('/mall/cart', { product_id: productId, quantity: 1 })
    cartCount.value++
    uni.showToast({ title: '已加入购物车', icon: 'success', duration: 1200 })
  } catch (e) {
    uni.showToast({ title: '请先登录', icon: 'none' })
  }
}

function goDetail(id) { uni.navigateTo({ url: '/pages/mall/detail?id=' + id }) }
function goCart() { uni.navigateTo({ url: '/pages/mall/cart' }) }

onShow(() => {
  fetchProducts()
  fetchCartCount()
})
</script>

<style scoped lang="scss">
.page { padding: 24rpx; min-height: 100vh; padding-bottom: 100rpx; }

.header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx;
  .header-title { font-size: 36rpx; font-weight: 700; color: #14532D; }
  .header-cart { position: relative; padding: 8rpx; }
  .cart-icon { font-size: 44rpx; }
  .cart-badge {
    position: absolute; top: -4rpx; right: -8rpx;
    background: #EF4444; color: #fff; font-size: 20rpx;
    min-width: 32rpx; height: 32rpx; line-height: 32rpx; text-align: center; border-radius: 16rpx; padding: 0 6rpx;
  }
}

.cat-tabs { white-space: nowrap; margin-bottom: 24rpx; }
.cat-tab {
  display: inline-block; padding: 12rpx 28rpx; margin-right: 16rpx;
  border-radius: 32rpx; background: #fff; font-size: 28rpx; color: #666;
  &.active { background: #15803D; color: #fff; }
}

.product-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.product-card {
  width: calc(50% - 8rpx); background: #fff; border-radius: 12rpx; overflow: hidden; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}
.card-img-wrap {
  width: 100%; height: 280rpx; background: #F0FDF4; display: flex; align-items: center; justify-content: center;
}
.card-img { width: 100%; height: 100%; }
.card-img-placeholder { font-size: 80rpx; }
.card-info { padding: 16rpx; }
.card-name { font-size: 30rpx; font-weight: 600; color: #14532D; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-price-row { margin-top: 8rpx; display: flex; align-items: baseline; gap: 8rpx; }
.card-price { font-size: 34rpx; font-weight: 700; color: #EF4444; }
.card-original { font-size: 24rpx; color: #999; text-decoration: line-through; }
.card-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 12rpx; }
.card-sales { font-size: 24rpx; color: #999; }
.add-btn {
  width: 48rpx; height: 48rpx; line-height: 48rpx; text-align: center;
  background: #15803D; color: #fff; font-size: 28rpx; border-radius: 50%; font-weight: 700;
}

.empty-text { font-size: 32rpx; color: #999; text-align: center; padding: 80rpx 0; }
</style>
