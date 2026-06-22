<template>
  <view class="page">
    <!-- Hero header -->
    <view class="hero">
      <text class="hero-title">全链路服务</text>
      <view class="hero-tagline">
        <text class="tagline-item">采</text>
        <text class="tagline-dot">·</text>
        <text class="tagline-item">销</text>
        <text class="tagline-dot">·</text>
        <text class="tagline-item">垫</text>
        <text class="tagline-sub">一站式闭环</text>
      </view>
    </view>

    <!-- Three pillar cards -->
    <view class="pillars">
      <!-- 采 -->
      <view class="pillar-card pillar-source">
        <view class="pillar-icon-wrap">
          <text class="pillar-icon">🍎</text>
        </view>
        <view class="pillar-body">
          <text class="pillar-title">产地直采</text>
          <text class="pillar-slogan">源头把控 · 一手货源</text>
          <view class="pillar-items">
            <view class="pi-row"><text class="pi-dot"></text><text>产地验货，品质分级把关</text></view>
            <view class="pi-row"><text class="pi-dot"></text><text>对接全国优质产区农户</text></view>
            <view class="pi-row"><text class="pi-dot"></text><text>标准化包装，全程冷链</text></view>
          </view>
        </view>
      </view>

      <!-- 连接线 -->
      <view class="pillar-connector">
        <view class="connector-line"></view>
        <text class="connector-arrow">↓</text>
        <view class="connector-line"></view>
      </view>

      <!-- 销 -->
      <view class="pillar-card pillar-sell">
        <view class="pillar-icon-wrap">
          <text class="pillar-icon">🏪</text>
        </view>
        <view class="pillar-body">
          <text class="pillar-title">渠道分销</text>
          <text class="pillar-slogan">全国档口 · 快速去化</text>
          <view class="pillar-items">
            <view class="pi-row"><text class="pi-dot"></text><text>全国 30+ 批发市场档口网络</text></view>
            <view class="pi-row"><text class="pi-dot"></text><text>实时行情匹配最优渠道</text></view>
            <view class="pi-row"><text class="pi-dot"></text><text>销量进度实时可查</text></view>
          </view>
        </view>
      </view>

      <!-- 连接线 -->
      <view class="pillar-connector">
        <view class="connector-line"></view>
        <text class="connector-arrow">↓</text>
        <view class="connector-line"></view>
      </view>

      <!-- 垫 -->
      <view class="pillar-card pillar-fund">
        <view class="pillar-icon-wrap">
          <text class="pillar-icon">🤝</text>
        </view>
        <view class="pillar-body">
          <text class="pillar-title">商务对接</text>
          <text class="pillar-slogan">帮助对接商务与资金方</text>
          <view class="pillar-items">
            <view class="pi-row"><text class="pi-dot"></text><text>精准匹配合作资金渠道</text></view>
            <view class="pi-row"><text class="pi-dot"></text><text>协助商务洽谈与方案落地</text></view>
            <view class="pi-row"><text class="pi-dot"></text><text>平台背书，交易全程护航</text></view>
          </view>
        </view>
      </view>
    </view>

    <!-- Data summary -->
    <view class="summary-row">
      <view class="summary-card">
        <text class="s-num">¥{{ fmtMoney(summary.total_amount) }}</text>
        <text class="s-label">累计服务金额</text>
      </view>
      <view class="summary-card">
        <text class="s-num">{{ summary.total_orders }}</text>
        <text class="s-label">累计订单</text>
      </view>
    </view>
    <view class="summary-row">
      <view class="summary-card">
        <text class="s-num green">¥{{ fmtMoney(summary.today_amount) }}</text>
        <text class="s-label">今日成交</text>
      </view>
      <view class="summary-card">
        <text class="s-num green">{{ summary.today_orders }}</text>
        <text class="s-label">今日订单</text>
      </view>
    </view>

    <!-- Real-time scroll -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">📋 实时动态</text>
        <text class="section-badge">LIVE</text>
      </view>
      <swiper vertical autoplay circular :interval="2500" class="scroll-swiper">
        <swiper-item v-for="item in scrolling" :key="item.id">
          <view class="scroll-item">
            <view class="si-left">
              <text class="si-tag" :class="item.status === 'completed' ? 'tag-done' : 'tag-ing'">{{ item.status === 'completed' ? '已完成' : '进行中' }}</text>
              <text class="si-desc">{{ item.user }} · {{ item.product }}</text>
            </view>
            <text class="si-amount">¥{{ fmtMoney(item.amount) }}</text>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- Contact -->
    <view class="contact-bar">
      <view class="contact-info">
        <text class="contact-title">开通全链路服务</text>
        <text class="contact-sub">专属顾问一对一对接</text>
      </view>
      <view class="contact-btn">联系企业微信</view>
    </view>

    <!-- 采购服务 / 农资配套 -->
    <view class="section-header">
      <view class="section-bar bar-gold"></view>
      <text class="section-title">采购服务 / 农资配套</text>
    </view>
    <view class="svc-grid">
      <view class="svc-card" v-for="s in services" :key="s.id" @tap="goServiceDetail(s)">
        <view class="svc-icon-wrap"><text>{{ s.icon }}</text></view>
        <text class="svc-name">{{ s.title }}</text>
        <text class="svc-desc">{{ s.desc }}</text>
        <view class="svc-list">
          <view v-for="(item, j) in s.items" :key="j" class="svc-list-row">
            <text class="svc-dot">•</text>
            <text>{{ item }}</text>
          </view>
        </view>
        <view class="svc-btn">查看详情 ›</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get } from '../../utils/api'

const summary = ref({ total_orders: 0, total_amount: 0, today_orders: 0, today_amount: 0 })
const scrolling = ref([])

const services = ref([
  { id: 1, icon: '🚛', title: '产地物流', desc: '找车拉货 · 代发代运', items: ['全国冷链物流网络覆盖', '产地直发，降低中转损耗', '实时追踪，全程可视'] },
  { id: 2, icon: '📦', title: '农资采购', desc: '种子 · 化肥 · 包装材料', items: ['优质农资供应商对接', '集中采购价格更优', '品质保障，送货到田'] },
  { id: 3, icon: '💰', title: '结算代办', desc: '代收代付 · 资金垫付', items: ['快速结算，T+1到账', '平台担保，交易安全', '灵活账期，缓解资金压力'] },
  { id: 4, icon: '🏷️', title: '品牌运营', desc: '包装 · 品牌 · 营销推广', items: ['产地品牌策划与包装设计', '线上线下渠道品牌推广', '农产品故事化内容营销'] },
])

function goServiceDetail(s) { uni.showToast({ title: s.title + '详情开发中', icon: 'none' }) }

function fmtMoney(v) {
  if (!v) return '0'
  if (v >= 10000) return (v / 10000).toFixed(0) + '万'
  return v.toFixed(0)
}

async function fetchData() {
  try {
    const res = await get('/finance/summary')
    summary.value = res
    scrolling.value = res.scrolling || []
  } catch (e) { /* silent */ }
}

onShow(() => { fetchData() })
</script>

<style scoped lang="scss">
.page { padding: 24rpx; min-height: 100vh; padding-bottom: 60rpx; }

/* Hero */
.hero { text-align: center; padding: 32rpx 0 24rpx; }
.hero-title { font-size: 44rpx; font-weight: 800; color: #14532D; display: block; letter-spacing: 4rpx; }
.hero-tagline { display: flex; align-items: center; justify-content: center; margin-top: 16rpx; gap: 4rpx; }
.tagline-item {
  font-size: 40rpx; font-weight: 900; color: #15803D;
  background: #F0FDF4; width: 72rpx; height: 72rpx; line-height: 72rpx;
  border-radius: 50%; text-align: center; display: inline-block;
}
.tagline-dot { font-size: 36rpx; color: #86EFAC; margin: 0 4rpx; }
.tagline-sub { font-size: 26rpx; color: #999; margin-left: 16rpx; }

/* Pillars */
.pillars { margin-bottom: 24rpx; }
.pillar-card {
  display: flex; background: #fff; border-radius: 16rpx; padding: 28rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.pillar-source { border-left: 8rpx solid #22C55E; }
.pillar-sell { border-left: 8rpx solid #F59E0B; }
.pillar-fund { border-left: 8rpx solid #3B82F6; }

.pillar-icon-wrap {
  width: 88rpx; height: 88rpx; border-radius: 20rpx; display: flex;
  align-items: center; justify-content: center; margin-right: 20rpx; flex-shrink: 0;
}
.pillar-source .pillar-icon-wrap { background: #F0FDF4; }
.pillar-sell .pillar-icon-wrap { background: #FFF7ED; }
.pillar-fund .pillar-icon-wrap { background: #EFF6FF; }

.pillar-icon { font-size: 44rpx; }
.pillar-body { flex: 1; }
.pillar-title { font-size: 34rpx; font-weight: 700; color: var(--text); display: block; }
.pillar-slogan { font-size: 24rpx; color: var(--text-muted); margin-top: 4rpx; display: block; }
.pillar-items { margin-top: 14rpx; }
.pi-row { display: flex; align-items: center; padding: 6rpx 0; font-size: 26rpx; color: var(--text-secondary); }
.pi-dot {
  width: 10rpx; height: 10rpx; border-radius: 50%; background: #86EFAC;
  margin-right: 12rpx; flex-shrink: 0;
}
.pillar-sell .pi-dot { background: #FCD34D; }
.pillar-fund .pi-dot { background: #93C5FD; }

/* Connector */
.pillar-connector { display: flex; align-items: center; padding: 8rpx 0 8rpx 64rpx; }
.connector-line { flex: 1; height: 1px; background: #E5E7EB; }
.connector-arrow { font-size: 24rpx; color: #D1D5DB; margin: 0 16rpx; }

/* Summary */
.summary-row { display: flex; gap: 16rpx; margin-bottom: 16rpx; }
.summary-card {
  flex: 1; background: #fff; border-radius: 12rpx; padding: 24rpx; text-align: center; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
  .s-num { font-size: 36rpx; font-weight: 700; color: #14532D; display: block; }
  .s-num.green { color: #15803D; }
  .s-label { font-size: 26rpx; color: #999; margin-top: 8rpx; display: block; }
}

/* Section */
.section { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 24rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.section-title { font-size: 32rpx; font-weight: 600; color: #14532D; }
.section-badge { font-size: 20rpx; color: #EF4444; background: #FEE2E2; padding: 4rpx 12rpx; border-radius: 8rpx; font-weight: 700; letter-spacing: 2rpx; }

.scroll-swiper { height: 220rpx; }
.scroll-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18rpx 0; border-bottom: 1px solid #F5F5F5;
}
.si-left { display: flex; align-items: center; gap: 12rpx; flex: 1; min-width: 0; }
.si-tag { font-size: 22rpx; padding: 4rpx 10rpx; border-radius: 6rpx; flex-shrink: 0; }
.tag-done { background: #DCFCE7; color: #16A34A; }
.tag-ing { background: #FEF3C7; color: #D97706; }
.si-desc { font-size: 28rpx; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.si-amount { font-size: 30rpx; font-weight: 700; color: #EF4444; flex-shrink: 0; }

/* Contact */
.contact-bar {
  display: flex; justify-content: space-between; align-items: center;
  background: linear-gradient(135deg, #14532D, #15803D); border-radius: 16rpx;
  padding: 28rpx 28rpx; margin-bottom: 24rpx;
}
.contact-info { }
.contact-title { font-size: 32rpx; font-weight: 700; color: #fff; display: block; }
.contact-sub { font-size: 26rpx; color: rgba(255,255,255,0.7); margin-top: 6rpx; display: block; }
.contact-btn {
  background: #fff; color: #15803D; padding: 16rpx 32rpx; border-radius: 32rpx;
  font-size: 28rpx; font-weight: 600; flex-shrink: 0;
}

/* Service Section */
.section-header { display: flex; align-items: center; gap: 10rpx; margin-bottom: 20rpx; }
.section-bar { width: 6rpx; height: 24rpx; border-radius: 3rpx; flex-shrink: 0; }
.bar-gold { background: var(--gold); }
.section-title { font-size: 32rpx; font-weight: 700; color: var(--text); }

.svc-grid { display: flex; flex-direction: column; gap: 16rpx; }
.svc-card { background: #fff; border-radius: 14rpx; padding: 24rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); }
.svc-icon-wrap { width: 72rpx; height: 72rpx; border-radius: 18rpx; background: linear-gradient(135deg, #E8F5E9, #DCEDC8); display: flex; align-items: center; justify-content: center; font-size: 38rpx; margin-bottom: 14rpx; }
.svc-name { font-size: 30rpx; font-weight: 700; color: var(--text); display: block; }
.svc-desc { font-size: 24rpx; color: var(--text-muted); margin-top: 4rpx; display: block; }
.svc-list { margin-top: 16rpx; border-top: 1px solid var(--border-light); padding-top: 14rpx; }
.svc-list-row { display: flex; align-items: center; gap: 8rpx; padding: 6rpx 0; font-size: 26rpx; color: var(--text-secondary); }
.svc-dot { color: var(--gold); font-weight: 700; }
.svc-btn { margin-top: 16rpx; text-align: right; font-size: 26rpx; color: var(--primary); font-weight: 600; }
</style>
