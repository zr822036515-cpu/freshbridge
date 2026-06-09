<template>
  <view class="page">
    <!-- Search Bar -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input class="search-input" type="text" placeholder="搜索品种或关键词" v-model="keyword" />
      </view>
    </view>

    <!-- Time Filter Pills -->
    <view class="time-filters">
      <view class="time-pill" :class="{ active: timeFilter === 'today' }" @tap="timeFilter = 'today'">今日</view>
      <view class="time-pill" :class="{ active: timeFilter === '7d' }" @tap="timeFilter = '7d'">近7日</view>
      <view class="time-pill" :class="{ active: timeFilter === '30d' }" @tap="timeFilter = '30d'">近30日</view>
    </view>

    <!-- Category Tabs -->
    <view class="cat-tabs">
      <view v-for="tab in catTabs" :key="tab.key" class="cat-tab" :class="{ active: activeTab === tab.key }" @tap="activeTab = tab.key">
        {{ tab.label }}
      </view>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="loading-text">加载中...</view>

    <!-- Ranking List -->
    <view v-else class="rank-list">
      <view
        v-for="(item, i) in displayList"
        :key="i"
        class="rank-card"
        :class="{ 'rank-card-top': i === 0 && activeTab === 'hot' }"
      >
        <view class="rank-badge" :class="'rank-' + (i + 1)">{{ i + 1 }}</view>
        <view class="rank-info">
          <view class="rank-name-row">
            <text class="rank-name">{{ item.name }}</text>
            <text v-if="i === 0 && activeTab === 'hot'" class="rank-tag-top">TOP</text>
          </view>
          <text class="rank-spec">规格：{{ item.spec }}</text>
          <view class="rank-heat-bar">
            <view class="rank-heat-fill" :style="{ width: item.heat + '%' }"></view>
          </view>
        </view>
        <view class="rank-price-col">
          <text class="rank-price">¥{{ item.price }}<text class="rank-unit">/斤</text></text>
          <view class="rank-change" :class="item.up ? 'up' : 'down'">
            <text>{{ item.up ? '▲' : '▼' }}{{ item.change }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="!loading && displayList.length === 0" class="empty-text">暂无数据</view>

    <view class="bottom-spacer"></view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get } from '../../utils/api'

const loading = ref(true)
const keyword = ref('')
const timeFilter = ref('today')
const activeTab = ref('hot')

const catTabs = [
  { key: 'hot', label: '热门榜' },
  { key: 'up', label: '涨幅榜' },
  { key: 'down', label: '跌幅榜' },
]

const rankList = ref([])

const displayList = computed(() => {
  let list = [...rankList.value]
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(item =>
      item.name.toLowerCase().includes(kw) || item.spec.toLowerCase().includes(kw)
    )
  }
  if (activeTab.value === 'up') {
    list.sort((a, b) => parseFloat(b.change) - parseFloat(a.change))
  } else if (activeTab.value === 'down') {
    list.sort((a, b) => parseFloat(a.change) - parseFloat(b.change))
  }
  return list
})

async function fetchData() {
  loading.value = true
  try {
    const res = await get('/market/prices')
    const prices = (res.prices || []).slice(0, 20)
    rankList.value = prices.map((p, i) => ({
      name: p.variety,
      spec: p.market_name + ' · ' + (p.category || ''),
      price: p.price.toFixed(1),
      change: (p.change_pct >= 0 ? '+' : '') + p.change_pct.toFixed(1) + '%',
      up: p.change_pct >= 0,
      heat: Math.max(15, 95 - i * 4),
    }))
  } catch (e) {
    // 离线 mock
    rankList.value = [
      { name: '泰国金枕榴莲', spec: '上海辉展 · A级大果', price: '32.5', change: '+12.4%', up: true, heat: 95 },
      { name: '智利车厘子 JJ级', spec: '广州江南 · 原箱5kg', price: '89.0', change: '+8.2%', up: true, heat: 82 },
      { name: '云南阳光玫瑰青提', spec: '北京新发地 · 15g+礼盒', price: '15.8', change: '-3.5%', up: false, heat: 75 },
      { name: '日本静冈哈密瓜', spec: '上海辉展 · 1.5-2kg', price: '288.0', change: '+1.2%', up: true, heat: 68 },
      { name: '新西兰爱妃苹果', spec: '广州江南 · 12枚礼盒', price: '12.5', change: '+4.5%', up: true, heat: 62 },
      { name: '澳洲脐橙', spec: '北京新发地 · 10kg/箱', price: '9.8', change: '-0.8%', up: false, heat: 59 },
      { name: '四川凯特芒果', spec: '广州江南 · 特大果5kg', price: '7.5', change: '+15.2%', up: true, heat: 55 },
      { name: '海南妃子笑荔枝', spec: '上海辉展 · 出口级3kg', price: '24.0', change: '-10.5%', up: false, heat: 51 },
      { name: '陕西红富士苹果', spec: '北京新发地 · 85#果5kg', price: '6.2', change: '+0.5%', up: true, heat: 48 },
      { name: '菲律宾凤梨', spec: '广州江南 · 2.5kg+', price: '19.9', change: '+2.1%', up: true, heat: 45 },
    ]
  }
  loading.value = false
}

fetchData()
onShow(() => { fetchData() })
</script>

<style scoped lang="scss">
.page {
  padding: 24rpx;
  min-height: 100vh;
  padding-bottom: 120rpx;
  background: var(--bg);
}

/* Search */
.search-bar { margin-bottom: 24rpx; }
.search-input-wrap {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.search-icon { font-size: 28rpx; margin-right: 12rpx; }
.search-input { flex: 1; font-size: 28rpx; color: var(--text); border: none; outline: none; background: transparent; }

/* Time Filter Pills */
.time-filters { display: flex; gap: 16rpx; margin-bottom: 24rpx; }
.time-pill {
  padding: 12rpx 32rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  background: #EDEEEB;
  color: var(--text-secondary);
  transition: all 0.2s;
}
.time-pill.active {
  background: var(--primary);
  color: #fff;
  font-weight: 600;
}

/* Category Tabs */
.cat-tabs {
  display: flex;
  border-bottom: 2rpx solid var(--border-light);
  margin-bottom: 24rpx;
}
.cat-tab {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 30rpx;
  font-weight: 500;
  color: var(--text-muted);
  position: relative;
  transition: all 0.2s;
}
.cat-tab.active {
  color: var(--primary);
  font-weight: 700;
}
.cat-tab.active::after {
  content: '';
  position: absolute;
  bottom: -2rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 6rpx;
  background: var(--primary);
  border-radius: 3rpx;
}

/* Rank Cards */
.rank-list { display: flex; flex-direction: column; gap: 16rpx; }
.rank-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
  transition: transform 0.2s;
}
.rank-card:active { transform: scale(0.98); }
.rank-card-top { border-left: 6rpx solid var(--gold); }

.rank-badge {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 700;
  font-style: italic;
  color: var(--text-secondary);
  background: #F0F0F0;
  flex-shrink: 0;
  margin-right: 20rpx;
}
.rank-badge.rank-1 { background: linear-gradient(135deg, #FFD700, #C9A96E); color: #fff; }
.rank-badge.rank-2 { background: linear-gradient(135deg, #C0C0C0, #A0A0A0); color: #fff; }
.rank-badge.rank-3 { background: linear-gradient(135deg, #CD7F32, #A0522D); color: #fff; }

.rank-info { flex: 1; min-width: 0; }
.rank-name-row { display: flex; align-items: center; gap: 12rpx; }
.rank-name {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 280rpx;
}
.rank-tag-top {
  font-size: 18rpx;
  font-weight: 700;
  background: #FFDEA4;
  color: #5A4312;
  padding: 2rpx 10rpx;
  border-radius: 4rpx;
  flex-shrink: 0;
}
.rank-spec { font-size: 24rpx; color: var(--text-muted); margin-top: 4rpx; }
.rank-heat-bar {
  width: 100%;
  height: 8rpx;
  background: #F0F0F0;
  border-radius: 4rpx;
  margin-top: 12rpx;
  overflow: hidden;
}
.rank-heat-fill { height: 100%; background: #745A27; border-radius: 4rpx; transition: width 0.6s ease; }

.rank-price-col { text-align: right; flex-shrink: 0; margin-left: 16rpx; }
.rank-price { font-size: 32rpx; font-weight: 700; color: var(--text); display: block; }
.rank-unit { font-size: 22rpx; font-weight: 400; color: var(--text-muted); }
.rank-change { font-size: 24rpx; font-weight: 600; margin-top: 4rpx; }
.rank-change.up { color: var(--up); }
.rank-change.down { color: var(--danger); }

.loading-text { font-size: 28rpx; color: var(--text-muted); text-align: center; padding: 80rpx 0; }
.empty-text { font-size: 28rpx; color: var(--text-muted); text-align: center; padding: 80rpx 0; }
.bottom-spacer { height: 80rpx; }
</style>
