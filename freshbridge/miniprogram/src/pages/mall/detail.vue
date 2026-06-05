<template>
  <view class="page">
    <!-- Product image -->
    <view class="img-wrap">
      <image v-if="product.image_url" :src="product.image_url" mode="aspectFill" class="hero-img" />
      <view v-else class="hero-placeholder">🍎</view>
    </view>

    <!-- Product info -->
    <view class="info-card">
      <text class="product-name">{{ product.name }}</text>
      <view class="price-row">
        <text class="price">¥{{ product.price.toFixed(2) }}</text>
        <text v-if="product.original_price > product.price" class="original">¥{{ product.original_price.toFixed(2) }}</text>
      </view>
      <text class="sales">已售 {{ product.sales }} 件 | 库存 {{ product.stock }}</text>
    </view>

    <!-- Description -->
    <view class="section">
      <text class="section-title">商品详情</text>
      <text class="desc-text">{{ product.description || '暂无详情' }}</text>
    </view>

    <!-- Bottom bar -->
    <view class="bottom-bar">
      <view class="qty-row">
        <text class="qty-label">数量</text>
        <view class="qty-ctrl">
          <view class="qty-btn" @tap="qty > 1 ? qty-- : 1">−</view>
          <text class="qty-num">{{ qty }}</text>
          <view class="qty-btn" @tap="qty++">+</view>
        </view>
      </view>
      <view class="action-row">
        <view class="btn-cart" @tap="doAddCart">加入购物车</view>
        <view class="btn-buy" @tap="buyNow">立即购买</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get, post } from '../../utils/api'

const product = ref({})
const qty = ref(1)

onLoad((opt) => {
  if (opt.id) fetchProduct(opt.id)
})

async function fetchProduct(id) {
  try {
    const res = await get('/mall/products/' + id)
    product.value = res
  } catch (e) { /* silent */ }
}

async function doAddCart() {
  try {
    await post('/mall/cart', { product_id: product.value.id, quantity: qty.value })
    uni.showToast({ title: '已加入购物车', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '请先登录', icon: 'none' })
  }
}

function buyNow() {
  doAddCart().then(() => {
    uni.navigateTo({ url: '/pages/mall/cart' })
  })
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: #F5F5F5; padding-bottom: 160rpx; }

.img-wrap { width: 100%; height: 500rpx; background: #F0FDF4; display: flex; align-items: center; justify-content: center; }
.hero-img { width: 100%; height: 100%; }
.hero-placeholder { font-size: 120rpx; }

.info-card { background: #fff; padding: 24rpx; margin-bottom: 16rpx; }
.product-name { font-size: 36rpx; font-weight: 700; color: #14532D; display: block; }
.price-row { margin-top: 16rpx; display: flex; align-items: baseline; gap: 12rpx; }
.price { font-size: 44rpx; font-weight: 700; color: #EF4444; }
.original { font-size: 28rpx; color: #999; text-decoration: line-through; }
.sales { font-size: 26rpx; color: #999; margin-top: 8rpx; display: block; }

.section { background: #fff; padding: 24rpx; margin-bottom: 16rpx; }
.section-title { font-size: 32rpx; font-weight: 600; color: #14532D; margin-bottom: 12rpx; display: block; }
.desc-text { font-size: 30rpx; color: #666; line-height: 1.8; }

.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0; background: #fff; padding: 16rpx 24rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.05); padding-bottom: env(safe-area-inset-bottom);
}
.qty-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.qty-label { font-size: 30rpx; color: #666; }
.qty-ctrl { display: flex; align-items: center; gap: 16rpx; }
.qty-btn {
  width: 56rpx; height: 56rpx; line-height: 56rpx; text-align: center;
  border: 2rpx solid #E5E7EB; border-radius: 8rpx; font-size: 32rpx; color: #333;
}
.qty-num { font-size: 32rpx; font-weight: 600; min-width: 48rpx; text-align: center; }
.action-row { display: flex; gap: 16rpx; }
.btn-cart, .btn-buy {
  flex: 1; text-align: center; padding: 20rpx 0; border-radius: 12rpx; font-size: 32rpx; font-weight: 600;
}
.btn-cart { border: 2rpx solid #15803D; color: #15803D; background: #fff; }
.btn-buy { background: #15803D; color: #fff; }
</style>
