<template>
  <view class="page">
    <view class="header">
      <text class="header-title">大宗供需</text>
      <text class="header-sub">产地直供 · 市场直采</text>
    </view>

    <!-- Supply list -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">📦 供应信息</text>
        <text class="section-count">{{ supply.length }}条</text>
      </view>
      <view v-if="supply.length === 0" class="empty-text">暂无供应信息</view>
      <view v-for="item in supply" :key="'s' + item.id" class="info-card supply">
        <view class="card-top">
          <text class="card-variety">{{ item.variety }}</text>
          <text class="card-price">{{ item.price }}</text>
        </view>
        <view class="card-mid">
          <text class="card-tag">📦 {{ item.quantity }}</text>
          <text class="card-tag">📍 {{ item.origin }}</text>
        </view>
        <view class="card-bottom">
          <text class="card-date">{{ item.date }}</text>
          <text class="card-contact">{{ item.contact }}</text>
        </view>
      </view>
    </view>

    <!-- Demand list -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">🛒 需求信息</text>
        <text class="section-count">{{ demand.length }}条</text>
      </view>
      <view v-if="demand.length === 0" class="empty-text">暂无需求信息</view>
      <view v-for="item in demand" :key="'d' + item.id" class="info-card demand">
        <view class="card-top">
          <text class="card-variety">{{ item.variety }}</text>
          <text class="card-price">{{ item.price }}</text>
        </view>
        <view class="card-mid">
          <text class="card-tag">🎯 {{ item.quantity }}</text>
          <text class="card-tag">🏪 {{ item.buyer }}</text>
        </view>
        <view class="card-bottom">
          <text class="card-date">{{ item.date }}</text>
          <text class="card-contact">{{ item.contact }}</text>
        </view>
      </view>
    </view>

    <!-- Publish CTA -->
    <view class="cta-section">
      <text class="cta-title">有供需需求？</text>
      <text class="cta-desc">发布供应或求购信息，对接全国批发市场</text>
      <view class="cta-row">
        <view class="cta-btn supply-btn">发布供应</view>
        <view class="cta-btn demand-btn">发布求购</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get } from '../../utils/api'

const supply = ref([])
const demand = ref([])

async function fetchData() {
  try {
    const res = await get('/supply-demand/list')
    supply.value = res.supply || []
    demand.value = res.demand || []
  } catch (e) { /* silent */ }
}

onShow(() => { fetchData() })
</script>

<style scoped lang="scss">
.page { padding: 24rpx; min-height: 100vh; padding-bottom: 100rpx; background: var(--bg); }
.header { margin-bottom: 24rpx; }
.header-title { font-size: 40rpx; font-weight: 700; color: var(--text); display: block; }
.header-sub { font-size: 28rpx; color: var(--text-muted); margin-top: 4rpx; display: block; }

.section { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 24rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.section-title { font-size: 32rpx; font-weight: 600; color: var(--text); }
.section-count { font-size: 26rpx; color: var(--text-muted); }

.empty-text { font-size: 28rpx; color: var(--text-muted); text-align: center; padding: 40rpx 0; }

.info-card { padding: 20rpx; border-radius: 10rpx; margin-bottom: 12rpx; }
.info-card.supply { background: #fff; border-left: 6rpx solid var(--primary); }
.info-card.demand { background: #fff; border-left: 6rpx solid #D97706; }

.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10rpx; }
.card-variety { font-size: 32rpx; font-weight: 700; color: var(--text); }
.card-price { font-size: 34rpx; font-weight: 700; color: var(--danger); }
.card-mid { display: flex; gap: 16rpx; margin-bottom: 10rpx; }
.card-tag { font-size: 26rpx; color: var(--text-secondary); background: var(--bg); padding: 4rpx 12rpx; border-radius: 6rpx; }
.card-bottom { display: flex; justify-content: space-between; }
.card-date { font-size: 24rpx; color: var(--text-muted); }
.card-contact { font-size: 24rpx; color: var(--primary); }

.cta-section { text-align: center; padding: 40rpx 24rpx; background: linear-gradient(135deg, #F5ECD7, #FFF); border-radius: 12rpx; }
.cta-title { font-size: 34rpx; font-weight: 700; color: var(--text); display: block; }
.cta-desc { font-size: 28rpx; color: var(--text-secondary); margin-top: 8rpx; display: block; }
.cta-row { display: flex; gap: 24rpx; margin-top: 24rpx; justify-content: center; }
.cta-btn { padding: 16rpx 40rpx; border-radius: 32rpx; font-size: 30rpx; font-weight: 600; }
.supply-btn { background: var(--primary); color: #fff; }
.demand-btn { background: #D97706; color: #fff; }
</style>
