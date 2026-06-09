<template>
  <view class="page">
    <!-- Search -->
    <view class="search-bar">
      <view class="search-wrap">
        <text>🔍</text>
        <input class="search-input" type="text" placeholder="搜索精美水果礼盒..." v-model="keyword" />
        <text>🔧</text>
      </view>
    </view>

    <!-- Category Tabs -->
    <scroll-view scroll-x class="cat-scroll" :show-scrollbar="false">
      <view class="cat-tabs">
        <view v-for="t in catTabs" :key="t" class="cat-tab" :class="{ active: activeCat === t }" @tap="activeCat = t">{{ t }}</view>
      </view>
    </scroll-view>

    <!-- Promo Banner -->
    <view class="promo-banner">
      <view class="promo-img"><text>🍒</text></view>
      <view class="promo-content">
        <text class="promo-tag">季节精选</text>
        <text class="promo-title">夏季樱桃礼盒</text>
        <text class="promo-sub">源自雅基玛山谷</text>
      </view>
    </view>

    <!-- Product Grid -->
    <view class="section-title-row">
      <text class="section-title">精选好物</text>
      <text class="section-more">查看全部 ›</text>
    </view>
    <view class="product-grid">
      <view v-for="item in products" :key="item.id" class="product-card" @tap="goDetail(item)">
        <view class="pc-img-wrap">
          <image v-if="item.img" :src="item.img" mode="aspectFill" class="pc-img" />
          <text v-else class="pc-img-text">{{ '🍎' }}</text>
          <view class="pc-add-btn"><text>+</text></view>
        </view>
        <view class="pc-body">
          <text class="pc-cat">{{ item.category || '精选' }}</text>
          <text class="pc-name">{{ item.name }}</text>
          <view class="pc-price-row">
            <text class="pc-price">{{ item.price }}</text>
            <text v-if="item.originalPrice" class="pc-old-price">{{ item.originalPrice }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Membership Banner -->
    <view class="member-banner">
      <view class="mb-text">
        <text class="mb-title">Reserve 会员</text>
        <text class="mb-sub">开通即享全场85折 + 优先抢购</text>
      </view>
      <view class="mb-btn"><text>立即加入</text></view>
    </view>

    <view class="bottom-spacer"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get } from '../../utils/api'

const keyword = ref('')
const activeCat = ref('全部')
const catTabs = ['全部', '礼盒', '季节限定', '进口']

const products = ref([
  { id: 1, name: '猫山王榴莲', category: '马来西亚进口', price: '¥428', originalPrice: '¥580', img: '/static/images/mall/product-1.jpg' },
  { id: 2, name: '阳光玫瑰葡萄', category: '精选礼盒', price: '¥890', img: '/static/images/mall/product-2.jpg' },
  { id: 3, name: '青森富士苹果', category: '手选精品', price: '¥120', img: '/static/images/mall/product-3.jpg' },
  { id: 4, name: '金煌芒果', category: '异域精选', price: '¥249', img: '/static/images/mall/product-4.jpg' },
])

async function fetchProducts() {
  try { const res = await get('/mall/products'); products.value = (res.products || []).slice(0, 8).map(p => ({ ...p, name: p.name, price: '¥' + (p.price || 0), emoji: '🍎' })) } catch (e) {}
}
function goDetail(item) { uni.navigateTo({ url: '/pages/mall/detail?id=' + item.id }) }
onShow(() => fetchProducts())
</script>

<style scoped lang="scss">
.page { padding: 24rpx; background: var(--bg); min-height: 100vh; }

.search-bar { margin-bottom: 20rpx; }
.search-wrap { display: flex; align-items: center; gap: 12rpx; background: #fff; border-radius: 14rpx; padding: 16rpx 20rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); }
.search-input { flex: 1; font-size: 28rpx; border: none; outline: none; background: transparent; }

.cat-scroll { margin-bottom: 24rpx; white-space: nowrap; }
.cat-tabs { display: inline-flex; gap: 16rpx; }
.cat-tab { padding: 12rpx 32rpx; border-radius: 32rpx; font-size: 26rpx; color: var(--text-secondary); background: #EDEEEB; transition: all 0.2s; display: inline-block; }
.cat-tab.active { background: var(--primary); color: #fff; font-weight: 600; }

.promo-banner { position: relative; border-radius: 16rpx; overflow: hidden; height: 260rpx; margin-bottom: 28rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); }
.promo-img { width: 100%; height: 100%; background: linear-gradient(135deg, #1A5C3E, #0F3B2C); display: flex; align-items: center; justify-content: center; font-size: 120rpx; }
.promo-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 24rpx; background: linear-gradient(transparent, rgba(0,0,0,0.7)); }
.promo-tag { font-size: 20rpx; color: #fff; background: rgba(201,169,110,0.3); padding: 4rpx 12rpx; border-radius: 4rpx; }
.promo-title { font-size: 36rpx; font-weight: 700; color: #fff; display: block; margin-top: 8rpx; }
.promo-sub { font-size: 24rpx; color: rgba(255,255,255,0.7); display: block; margin-top: 4rpx; }

.section-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.section-title { font-size: 32rpx; font-weight: 700; color: var(--text); }
.section-more { font-size: 26rpx; color: var(--primary); }

.product-grid { display: flex; flex-wrap: wrap; gap: 16rpx; margin-bottom: 32rpx; }
.product-card { width: calc(50% - 8rpx); background: #fff; border-radius: 16rpx; overflow: hidden; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); transition: transform 0.15s; &:active { transform: scale(0.97); } }
.pc-img-wrap { position: relative; height: 280rpx; background: linear-gradient(135deg, #E8F5E9, #F1F8E9); display: flex; align-items: center; justify-content: center; overflow: hidden; }
.pc-img { width: 100%; height: 100%; position: absolute; inset: 0; }
.pc-img-text { font-size: 100rpx; }
.pc-add-btn { position: absolute; bottom: 16rpx; right: 16rpx; width: 56rpx; height: 56rpx; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 32rpx; font-weight: 300; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.15); }
.pc-body { padding: 16rpx 20rpx 20rpx; }
.pc-cat { font-size: 22rpx; color: var(--text-muted); }
.pc-name { font-size: 28rpx; font-weight: 700; color: var(--text); margin-top: 4rpx; display: block; }
.pc-price-row { display: flex; align-items: baseline; gap: 8rpx; margin-top: 12rpx; }
.pc-price { font-size: 32rpx; font-weight: 700; color: var(--primary); }
.pc-old-price { font-size: 24rpx; color: var(--text-muted); text-decoration: line-through; }

.member-banner { background: linear-gradient(135deg, #F5ECD7, #C9A96E); border-radius: 16rpx; padding: 24rpx; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
.mb-title { font-size: 30rpx; font-weight: 700; color: #5A4312; display: block; }
.mb-sub { font-size: 24rpx; color: rgba(90,67,18,0.7); margin-top: 4rpx; display: block; }
.mb-btn { background: var(--primary); color: #fff; padding: 16rpx 32rpx; border-radius: 12rpx; font-size: 26rpx; font-weight: 600; }
.bottom-spacer { height: 100rpx; }
</style>
