<template>
  <view class="page">
    <!-- Hero Image -->
    <view class="hero-img">
      <image v-if="product.img" :src="product.img" mode="aspectFill" class="hero-real-img" />
      <text v-else class="hero-emoji">{{ product.emoji || '🍎' }}</text>
      <view class="hero-badge"><text>1/1</text></view>
    </view>

    <!-- Product Info -->
    <view class="info-section">
      <view class="tags-row">
        <text class="tag">{{ product.grade || '精选' }}</text>
        <text class="tag-text">· {{ product.origin || '严选产地' }}</text>
      </view>
      <text class="product-name">{{ product.name || '商品详情' }}</text>
      <view class="price-row">
        <text class="price">¥{{ product.price || '--' }}</text>
        <text v-if="product.originalPrice" class="old-price">¥{{ product.originalPrice }}</text>
      </view>
    </view>

    <!-- Fast Facts -->
    <view class="facts-grid">
      <view class="fact-item">
        <text class="fact-icon">⭐</text>
        <text class="fact-label">品质</text>
        <text class="fact-val">{{ product.grade || 'A级' }}</text>
      </view>
      <view class="fact-item">
        <text class="fact-icon">⚖️</text>
        <text class="fact-label">规格</text>
        <text class="fact-val">{{ product.spec || '标准' }}</text>
      </view>
      <view class="fact-item">
        <text class="fact-icon">🍬</text>
        <text class="fact-label">糖度</text>
        <text class="fact-val">{{ product.brix || '15°+' }}</text>
      </view>
    </view>

    <!-- Description -->
    <view class="desc-section">
      <text class="desc-title">商品详情</text>
      <text class="desc-text">{{ product.description || '精选优质水果，从产地直达您的餐桌。每一颗都经过严格筛选，确保品质如一。' }}</text>
      <view class="feature-list">
        <view class="feature-item">
          <text>✅</text>
          <text>绿色种植，零农残认证</text>
        </view>
        <view class="feature-item">
          <text>✅</text>
          <text>冷链保鲜，航空直送</text>
        </view>
        <view class="feature-item">
          <text>✅</text>
          <text>精美礼盒包装，送礼体面</text>
        </view>
      </view>
    </view>

    <!-- Origin Section -->
    <view class="origin-card">
      <view class="origin-img"><text>🌄</text></view>
      <view class="origin-info">
        <text class="origin-label">产地溯源</text>
        <text class="origin-name">{{ product.origin_city || '优渥产地' }}</text>
      </view>
    </view>

    <view class="bottom-spacer"></view>

    <!-- Bottom Action Bar -->
    <view class="bottom-bar">
      <view class="bb-fav">
        <text>🤍</text>
        <text class="bb-fav-text">收藏</text>
      </view>
      <view class="bb-cart-btn" @tap="addToCart">加入购物车</view>
      <view class="bb-buy-btn" @tap="buyNow">立即购买</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get, post } from '../../utils/api'

const product = ref({})

onLoad((options) => {
  if (options.id) fetchProduct(options.id)
})

async function fetchProduct(id) {
  try {
    const res = await get('/mall/products/' + id)
    product.value = { ...res, emoji: '🍇', img: '/static/images/mall/product-' + (((res.id || 1) % 8) + 1) + '.jpg', price: res.price, originalPrice: res.original_price }
  } catch (e) {}
}

async function addToCart() {
  try {
    await post('/mall/cart', { product_id: product.value.id, quantity: 1 })
    uni.showToast({ title: '已加入购物车', icon: 'success' })
  } catch (e) { uni.showToast({ title: '添加失败', icon: 'none' }) }
}
function buyNow() {
  addToCart()
  uni.navigateTo({ url: '/pages/mall/checkout' })
}
</script>

<style scoped lang="scss">
.page { background: var(--bg); min-height: 100vh; }

.hero-img {
  width: 100%; height: 600rpx; position: relative; overflow: hidden;
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  display: flex; align-items: center; justify-content: center;
}
.hero-real-img { position: absolute; inset: 0; width: 100%; height: 100%; }
.hero-emoji { font-size: 180rpx; }
.hero-badge {
  position: absolute; bottom: 24rpx; right: 24rpx;
  background: rgba(255,255,255,0.9); padding: 6rpx 20rpx;
  border-radius: 24rpx; font-size: 24rpx; color: var(--text-secondary);
}

.info-section { padding: 32rpx 24rpx 24rpx; background: #fff; }
.tags-row { display: flex; align-items: center; gap: 8rpx; margin-bottom: 12rpx; }
.tag { background: #FFDEA4; color: #5A4312; padding: 4rpx 14rpx; border-radius: 6rpx; font-size: 22rpx; font-weight: 600; }
.tag-text { font-size: 24rpx; color: var(--text-muted); }
.product-name { font-size: 36rpx; font-weight: 700; color: var(--text); display: block; margin-bottom: 12rpx; }
.price-row { display: flex; align-items: baseline; gap: 16rpx; }
.price { font-size: 44rpx; font-weight: 700; color: var(--primary); }
.old-price { font-size: 28rpx; color: var(--text-muted); text-decoration: line-through; }

.facts-grid {
  display: flex; margin: 16rpx 24rpx; gap: 16rpx;
}
.fact-item {
  flex: 1; background: #fff; border-radius: 12rpx; padding: 20rpx;
  display: flex; flex-direction: column; align-items: center; gap: 6rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
}
.fact-icon { font-size: 36rpx; }
.fact-label { font-size: 22rpx; color: var(--text-muted); }
.fact-val { font-size: 26rpx; font-weight: 700; color: var(--text); }

.desc-section { margin: 24rpx; background: #fff; border-radius: 16rpx; padding: 24rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); }
.desc-title { font-size: 32rpx; font-weight: 700; color: var(--text); display: block; margin-bottom: 16rpx; }
.desc-text { font-size: 28rpx; color: var(--text-secondary); line-height: 1.8; display: block; }
.feature-list { margin-top: 24rpx; display: flex; flex-direction: column; gap: 16rpx; }
.feature-item { display: flex; align-items: center; gap: 16rpx; font-size: 28rpx; color: var(--text-secondary); }

.origin-card {
  margin: 24rpx; border-radius: 16rpx; overflow: hidden; background: #fff;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); position: relative; height: 260rpx;
}
.origin-img {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, #1A5C3E, #0F3B2C);
  display: flex; align-items: center; justify-content: center; font-size: 100rpx;
}
.origin-info {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 20rpx 24rpx; background: linear-gradient(transparent, rgba(0,0,0,0.7));
}
.origin-label { font-size: 22rpx; color: rgba(255,255,255,0.7); display: block; }
.origin-name { font-size: 32rpx; font-weight: 700; color: #fff; display: block; margin-top: 4rpx; }

.bottom-spacer { height: 160rpx; }

.bottom-bar {
  position: fixed; bottom: 0; left: 0; width: 100%;
  background: #fff; padding: 16rpx 24rpx 40rpx;
  display: flex; align-items: center; gap: 12rpx;
  box-shadow: 0 -2rpx 16rpx rgba(0,0,0,0.04); z-index: 50;
}
.bb-fav { display: flex; flex-direction: column; align-items: center; gap: 2rpx; flex-shrink: 0; }
.bb-fav-text { font-size: 20rpx; color: var(--text-muted); }
.bb-cart-btn { flex: 1; text-align: center; padding: 24rpx 0; border-radius: 12rpx; border: 2rpx solid var(--gold); color: var(--gold); font-size: 28rpx; font-weight: 600; }
.bb-buy-btn { flex: 1; text-align: center; padding: 24rpx 0; border-radius: 12rpx; background: var(--primary); color: #fff; font-size: 28rpx; font-weight: 700; }
</style>
