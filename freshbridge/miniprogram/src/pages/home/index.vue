<template>
  <view class="page">
    <!-- ===== Zone 1: 品牌栏 + 消息入口 ===== -->
    <view class="brand-bar">
      <view class="brand-logo">
        <view class="logo-leaf"><text>🍃</text></view>
        <text class="logo-text">鲜桥</text>
      </view>
      <view class="brand-actions">
        <view class="bell-wrap" @tap="goMessages">
          <text class="bell-icon">🔔</text>
          <view v-if="unreadCount > 0" class="bell-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
        </view>
      </view>
    </view>

    <!-- Search Bar -->
    <view class="home-search" @tap="focusSearch">
      <view class="hs-wrap">
        <text class="hs-icon">🔍</text>
        <input class="hs-input" type="text" placeholder="搜索品种、产地或档口..." />
        <view class="hs-btn">搜索</view>
      </view>
    </view>

    <!-- ===== Zone 1.5: Banner 轮播图 ===== -->
    <swiper class="banner-swiper" indicator-dots indicator-active-color="#C9A96E" autoplay circular>
      <swiper-item v-for="(b, i) in banners" :key="i">
        <view class="banner-slide">
          <image v-if="b.img" :src="b.img" mode="aspectFill" class="banner-img" />
          <view class="banner-overlay"></view>
          <view class="banner-content">
            <text class="banner-text">{{ b.text }}</text>
            <text class="banner-sub">{{ b.sub }}</text>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- ===== Zone 3: 核心功能双按钮 ===== -->
    <view class="cta-row">
      <view class="cta-card cta-supply" @tap="goPublish('supply')">
        <view class="cta-icon-wrap cta-icon-green">
          <text class="cta-icon">📤</text>
        </view>
        <text class="cta-title">发布供应</text>
        <text class="cta-sub">上架货源，找买家</text>
        <view class="cta-tag tag-green">农户入口</view>
      </view>
      <view class="cta-card cta-buy" @tap="goPublish('buy')">
        <view class="cta-icon-wrap cta-icon-orange">
          <text class="cta-icon">📥</text>
        </view>
        <text class="cta-title buy">发布求购</text>
        <text class="cta-sub">发布需求，找货源</text>
        <view class="cta-tag tag-orange">采购商入口</view>
      </view>
    </view>

    <!-- ===== Zone 3.5: 全链路服务入口 ===== -->
    <view class="service-entry" @tap="goFinance">
      <view class="se-left">
        <view class="se-title-row">
          <view class="section-bar bar-green"></view>
          <text class="se-title">全链路服务</text>
        </view>
        <text class="se-desc">采 · 销 · 垫 一站式闭环，助力农产品高效流通</text>
        <view class="se-tags">
          <text class="se-tag">产地直采</text>
          <text class="se-tag">渠道分销</text>
          <text class="se-tag">商务对接</text>
        </view>
      </view>
      <view class="se-arrow"><text>›</text></view>
    </view>

    <!-- ===== Zone 4: 农产品行情溯源 ===== -->
    <view class="section-header">
      <view class="section-bar bar-green"></view>
      <text class="section-title">行情溯源</text>
      <text class="section-more" @tap="goRanking">更多 ›</text>
    </view>
    <scroll-view scroll-x class="variety-scroll" :show-scrollbar="false">
      <view class="variety-track">
        <view v-for="v in varietyCards" :key="v.name" class="variety-card" @tap="goPriceDetail(v)">
          <view class="vc-top">
            <text class="vc-emoji">{{ v.emoji }}</text>
            <view>
              <text class="vc-name">{{ v.name }}</text>
              <text class="vc-label">产地报价</text>
            </view>
          </view>
          <view class="vc-price-row">
            <text class="vc-price">¥{{ v.price }}</text>
            <view class="vc-diff" :class="v.up ? 'diff-up' : 'diff-down'">
              <text>{{ v.up ? '▲' : '▼' }} {{ v.diff }}</text>
            </view>
          </view>
          <view class="vc-markets">
            <view v-for="m in v.markets" :key="m.name" class="vc-market-row">
              <text class="vcm-name">{{ m.name }}</text>
              <text class="vcm-price">¥{{ m.price }}</text>
              <text :class="m.change >= 0 ? 'up' : 'down'">{{ m.change >= 0 ? '▲' : '▼' }}{{ Math.abs(m.change).toFixed(1) }}%</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- ===== Zone 6: 平台公告 ===== -->
    <view class="notice-card" @tap="showNotice">
      <view class="nc-left">
        <view class="nc-icon"><text>📢</text></view>
        <view>
          <text class="nc-title">{{ latestNotice.title }}</text>
          <text class="nc-time">{{ latestNotice.time }}</text>
        </view>
      </view>
      <text class="nc-link">查看 ›</text>
    </view>

    <!-- ===== Zone 8: 页脚 ===== -->
    <view class="footer">
      <text>鲜桥 FreshBridge · 让农产品流通更简单</text>
    </view>

    <view style="height: 120rpx;"></view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get } from '../../utils/api'

// ===== Zone 1 =====
const unreadCount = ref(3)

// ===== Zone 1.5: Banners =====
const banners = ref([
  { text: '产地直采', sub: '源头把控 · 一手货源', img: '/static/images/banners/banner-1.jpg' },
  { text: '全国档口', sub: '快速去化 · 品质保证', img: '/static/images/banners/banner-2.jpg' },
  { text: '品质溯源', sub: '从枝头到舌尖的安心', img: '/static/images/banners/banner-3.jpg' },
])

// ===== Zone 2 =====

// ===== Zone 4: Market tracking data =====
const rankList = ref([])
const varietyCards = computed(() => {
  if (rankList.value.length === 0) return defaultVarieties
  const groups = {}
  rankList.value.forEach(p => {
    if (!groups[p.variety]) groups[p.variety] = []
    groups[p.variety].push(p)
  })
  return Object.entries(groups).slice(0, 8).map(([name, pts]) => {
    const latest = pts[0]
    const prev = pts.length > 1 ? pts[1].price : latest.price
    const diff = (latest.price - prev).toFixed(2)
    return {
      name,
      emoji: fruitEmoji(name),
      price: latest.price.toFixed(2),
      diff: (diff >= 0 ? '+' : '') + diff,
      up: diff >= 0,
      markets: pts.slice(0, 3).map(p => ({
        name: p.market_name, price: p.price.toFixed(2), change: p.change_pct
      }))
    }
  })
})

const defaultVarieties = [
  { name: '黄瓜', emoji: '🥒', price: '2.13', diff: '+2.02', up: true, markets: [{name:'上海辉展',price:'2.13',change:-2.4},{name:'广州江南',price:'2.78',change:-0.4},{name:'北京新发地',price:'1.52',change:1.1}] },
  { name: '西红柿', emoji: '🍅', price: '2.78', diff: '-0.35', up: false, markets: [{name:'上海辉展',price:'2.78',change:-0.5},{name:'广州江南',price:'3.10',change:0.8},{name:'北京新发地',price:'2.45',change:-1.2}] },
  { name: '土豆', emoji: '🥔', price: '1.52', diff: '+0.18', up: true, markets: [{name:'上海辉展',price:'1.52',change:1.1},{name:'广州江南',price:'1.80',change:0.3},{name:'北京新发地',price:'1.35',change:-0.5}] },
  { name: '大米', emoji: '🍚', price: '3.85', diff: '-0.12', up: false, markets: [{name:'上海辉展',price:'3.85',change:-0.3},{name:'广州江南',price:'4.10',change:0.5},{name:'北京新发地',price:'3.60',change:-0.8}] },
]

function fruitEmoji(name) {
  const m = { '黄瓜':'🥒','西红柿':'🍅','土豆':'🥔','大米':'🍚','苹果':'🍎','梨':'🍐','橙子':'🍊','葡萄':'🍇','草莓':'🍓','辣椒':'🌶️','茄子':'🍆','豆角':'🫘' }
  return m[name] || '🍎'
}

// ===== Zone 6 =====
const latestNotice = ref({ title: '平台实名认证已上线，请尽快完成认证确保交易安全', time: '2026-06-06' })

// ===== Data fetching =====
async function fetchPrices() {
  try { const r = await get('/market/prices'); rankList.value = (r.prices || []).sort((a,b) => new Date(b.created_at) - new Date(a.created_at)) } catch(e){}
}

// ===== Navigation =====
function goMessages() { uni.navigateTo({ url: '/pages/message/index' }) }
function goNewsDetail(n) { uni.showToast({ title: n.text.substring(0, 20), icon: 'none' }) }
function goPublish(type) { uni.switchTab({ url: '/pages/publish/index' }) }
function goRanking() { uni.navigateTo({ url: '/pages/ranking/index' }) }
function goPriceDetail(v) { uni.navigateTo({ url: '/pages/price-compare/index' }) }
function focusSearch() { uni.navigateTo({ url: '/pages/price-compare/index' }) }
function goFinance() { uni.navigateTo({ url: '/pages/finance/index' }) }
function showNotice() { uni.showToast({ title: latestNotice.value.title.substring(0, 20), icon: 'none' }) }

onShow(() => { fetchPrices() })
</script>

<style scoped lang="scss">
.page { padding: 0 24rpx; background: var(--bg); min-height: 100vh; }

/* ===== Z1: Brand Bar ===== */
.brand-bar { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0 16rpx; }
.brand-logo { display: flex; align-items: center; gap: 8rpx; }
.logo-leaf { width: 48rpx; height: 48rpx; border-radius: 12rpx; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 26rpx; }
.logo-text { font-size: 36rpx; font-weight: 700; color: var(--primary); letter-spacing: 2rpx; }
.bell-wrap { position: relative; padding: 8rpx; }
.bell-icon { font-size: 40rpx; }
.bell-badge { position: absolute; top: 0; right: 0; min-width: 32rpx; height: 32rpx; line-height: 32rpx; background: var(--danger); color: #fff; font-size: 20rpx; border-radius: 16rpx; text-align: center; padding: 0 6rpx; }

/* Search Bar */
.home-search { margin-bottom: 16rpx; cursor: pointer; }
.hs-wrap { display: flex; align-items: center; background: #fff; border-radius: 40rpx; padding: 12rpx 16rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); min-height: 80rpx; }
.hs-icon { font-size: 28rpx; margin-right: 12rpx; flex-shrink: 0; }
.hs-input { flex: 1; font-size: 28rpx; color: var(--text); border: none; outline: none; background: transparent; height: 56rpx; line-height: 56rpx; pointer-events: none; }
.hs-btn { background: var(--primary); color: #fff; padding: 14rpx 32rpx; border-radius: 32rpx; font-size: 26rpx; font-weight: 600; flex-shrink: 0; }

/* ===== Z1.5: Banner ===== */
.banner-swiper { height: 340rpx; border-radius: 16rpx; overflow: hidden; margin-bottom: 20rpx; box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.1); }
.banner-slide { height: 100%; position: relative; }
.banner-img { position: absolute; inset: 0; width: 100%; height: 100%; }
.banner-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.08) 60%, rgba(0,0,0,0.02) 100%); z-index: 1; }
.banner-content { position: absolute; left: 32rpx; bottom: 32rpx; z-index: 2; }
.banner-text { font-size: 40rpx; font-weight: 700; color: #fff; display: block; letter-spacing: 2rpx; text-shadow: 0 2rpx 12rpx rgba(0,0,0,0.3); }
.banner-sub { font-size: 24rpx; color: rgba(255,255,255,0.85); margin-top: 6rpx; display: block; letter-spacing: 1rpx; }

/* ===== Z2: News Ticker ===== */
.news-scroll { margin-bottom: 20rpx; white-space: nowrap; }
.news-track { display: inline-flex; gap: 0; background: #F0FDF4; border-radius: 10rpx; padding: 14rpx 8rpx; }
.news-item { display: inline-flex; align-items: center; gap: 8rpx; padding: 0 16rpx; border-right: 1px solid #D1D5DB; white-space: nowrap; &:last-child { border-right: none; } }
.news-tag { font-size: 20rpx; font-weight: 700; padding: 3rpx 10rpx; border-radius: 4rpx; color: #fff; }
.tag-red { background: #DC2626; }
.tag-orange { background: #D97706; }
.tag-green { background: #16A34A; }
.news-text { font-size: 24rpx; color: var(--text-secondary); max-width: 320rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ===== Z3: CTA Buttons ===== */
.cta-row { display: flex; gap: 16rpx; margin-bottom: 32rpx; }
.cta-card { flex: 1; border-radius: 16rpx; padding: 24rpx; position: relative; overflow: hidden; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); }
.cta-supply { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); }
.cta-buy { background: linear-gradient(135deg, #FFF7ED, #FFEDD5); }
.cta-icon-wrap { width: 72rpx; height: 72rpx; border-radius: 18rpx; display: flex; align-items: center; justify-content: center; margin-bottom: 16rpx; }
.cta-icon-green { background: rgba(15,59,44,0.1); }
.cta-icon-orange { background: rgba(217,119,6,0.1); }
.cta-icon { font-size: 38rpx; }
.cta-title { font-size: 36rpx; font-weight: 700; color: var(--primary); display: block; }
.cta-title.buy { color: #D97706; }
.cta-sub { font-size: 24rpx; color: var(--text-secondary); margin-top: 4rpx; display: block; }
.cta-tag { position: absolute; bottom: 12rpx; right: 12rpx; font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 6rpx; }
.tag-green { background: rgba(15,59,44,0.1); color: var(--primary); }
.tag-orange { background: rgba(217,119,6,0.1); color: #D97706; }

/* ===== Section Headers ===== */
.section-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 16rpx; }
.section-bar { width: 6rpx; height: 24rpx; border-radius: 3rpx; flex-shrink: 0; }
.bar-green { background: var(--primary); }
.bar-gold { background: var(--gold); }
.section-title { font-size: 32rpx; font-weight: 700; color: var(--text); }
.section-more { font-size: 26rpx; color: var(--primary); margin-left: auto; }

/* ===== Z4: Variety Cards ===== */
.variety-scroll { margin-bottom: 24rpx; white-space: nowrap; }
.variety-track { display: inline-flex; gap: 16rpx; }
.variety-card { width: 300rpx; background: #fff; border-radius: 14rpx; padding: 20rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); display: inline-block; white-space: normal; flex-shrink: 0; }
.vc-top { display: flex; align-items: center; gap: 12rpx; margin-bottom: 16rpx; }
.vc-emoji { font-size: 44rpx; }
.vc-name { font-size: 30rpx; font-weight: 700; color: var(--text); display: block; }
.vc-label { font-size: 22rpx; color: var(--text-muted); }
.vc-price-row { display: flex; align-items: baseline; gap: 12rpx; margin-bottom: 14rpx; }
.vc-price { font-size: 36rpx; font-weight: 700; color: var(--primary); }
.vc-diff { font-size: 24rpx; font-weight: 600; padding: 4rpx 10rpx; border-radius: 6rpx; }
.diff-up { color: #DC2626; background: #FEE2E2; }
.diff-down { color: #16A34A; background: #DCFCE7; }
.vc-markets { border-top: 1px solid var(--border-light); padding-top: 12rpx; }
.vc-market-row { display: flex; justify-content: space-between; padding: 6rpx 0; font-size: 24rpx; }
.vcm-name { color: var(--text-secondary); }
.vcm-price { color: var(--text); font-weight: 600; }
.up { color: var(--up); }
.down { color: var(--danger); }

/* ===== Z3.5: 全链路服务入口 ===== */
.service-entry { display: flex; align-items: center; background: linear-gradient(135deg, #F5ECD7, #FFF8E1); border-radius: 16rpx; padding: 24rpx; margin-bottom: 32rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); }
.se-left { flex: 1; }
.se-title-row { display: flex; align-items: center; gap: 10rpx; margin-bottom: 8rpx; }
.se-title { font-size: 32rpx; font-weight: 700; color: var(--text); }
.se-desc { font-size: 24rpx; color: var(--text-secondary); display: block; margin-bottom: 14rpx; }
.se-tags { display: flex; gap: 10rpx; }
.se-tag { font-size: 22rpx; background: rgba(15,59,44,0.08); color: var(--primary); padding: 4rpx 14rpx; border-radius: 6rpx; }
.se-arrow { width: 56rpx; height: 56rpx; border-radius: 50%; background: rgba(15,59,44,0.08); display: flex; align-items: center; justify-content: center; font-size: 36rpx; color: var(--primary); font-weight: 700; }

/* ===== Z6: Notice ===== */
.notice-card { display: flex; justify-content: space-between; align-items: center; background: #fff; border-radius: 14rpx; padding: 24rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); margin-bottom: 32rpx; }
.nc-left { display: flex; align-items: center; gap: 16rpx; flex: 1; min-width: 0; }
.nc-icon { width: 56rpx; height: 56rpx; border-radius: 14rpx; background: #F5ECD7; display: flex; align-items: center; justify-content: center; font-size: 28rpx; }
.nc-title { font-size: 28rpx; font-weight: 600; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; max-width: 400rpx; }
.nc-time { font-size: 24rpx; color: var(--text-muted); margin-top: 4rpx; display: block; }
.nc-link { font-size: 26rpx; color: var(--primary); flex-shrink: 0; }

/* ===== Z8: Footer ===== */
.footer { text-align: center; padding: 20rpx 0 40rpx; }
.footer text { font-size: 22rpx; color: var(--text-muted); }
</style>
