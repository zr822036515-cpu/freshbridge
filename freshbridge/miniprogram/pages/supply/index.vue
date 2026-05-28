<template>
  <view class="page">
    <!-- Search bar -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <text class="search-icon">&#128269;</text>
        <input
          class="search-input"
          type="text"
          placeholder="搜索水果品种、产地..."
          v-model="keyword"
          confirm-type="search"
          @confirm="onSearch"
        />
      </view>
    </view>

    <!-- Category shortcuts -->
    <scroll-view class="category-scroll" scroll-x enable-flex>
      <view
        v-for="cat in categories"
        :key="cat"
        class="category-item touch-target"
        :class="{ active: activeCategory === cat }"
        @tap="onCategoryTap(cat)"
      >
        <text>{{ cat }}</text>
      </view>
    </scroll-view>

    <!-- Product list -->
    <view class="product-list">
      <!-- Loading -->
      <view v-if="loading && products.length === 0" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- Product cards -->
      <view v-for="item in products" :key="item.id" class="product-card card">
        <view class="card-header">
          <view class="card-variety-row">
            <text class="card-variety">{{ item.variety }}</text>
            <text v-if="item.urgent" class="urgent-badge">&#9889; 急售</text>
          </view>
          <text class="card-spec" v-if="item.spec">{{ item.spec }}</text>
        </view>

        <view class="card-body">
          <view class="card-info">
            <text class="info-label">产量</text>
            <text class="info-value amount-green">{{ item.total_quantity }} 斤</text>
          </view>
          <view class="card-info">
            <text class="info-label">价格</text>
            <text class="info-value amount-gold">{{ item.price }} 元/斤</text>
          </view>
          <view class="card-info">
            <text class="info-label">产地</text>
            <text class="info-value">{{ item.origin_province }} {{ item.origin_city }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="footer-tags">
            <text class="footer-tag" v-if="item.grade">{{ item.grade }}</text>
            <text class="footer-tag" v-if="item.packaging">{{ item.packaging }}</text>
          </view>
          <text class="footer-date" v-if="item.available_date">{{ item.available_date }} 可发</text>
          <text class="footer-status">{{ statusText(item.status) }}</text>
        </view>

        <view class="card-actions">
          <view class="offer-btn btn-primary touch-target" @tap.stop="onMakeOffer(item)">
            <text>接单</text>
          </view>
        </view>
      </view>

      <!-- Empty state -->
      <view v-if="!loading && products.length === 0" class="empty-state">
        <text class="empty-icon">&#128230;</text>
        <text class="empty-text">暂无货源</text>
        <text class="empty-sub">下拉刷新试试</text>
      </view>

      <!-- Load more -->
      <view v-if="hasMore && products.length > 0" class="load-more" @tap="loadMore">
        <text class="load-more-text">{{ loadingMore ? '加载中...' : '加载更多' }}</text>
      </view>

      <!-- No more -->
      <view v-if="!hasMore && products.length > 0" class="no-more">
        <text class="no-more-text">—— 没有更多了 ——</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { get, post } from '../../utils/api'

const keyword = ref('')
const activeCategory = ref('全部')
const loading = ref(false)
const loadingMore = ref(false)
const products = ref([])
const page = ref(1)
const hasMore = ref(true)
const categories = ref(['全部', '苹果', '柑橘', '芒果', '葡萄', '蔬菜'])

// Fetch products from API
async function fetchProducts(reset = false) {
  if (reset) {
    page.value = 1
    hasMore.value = true
    loading.value = true
  }

  const params = {
    page: page.value,
    page_size: 10
  }
  if (keyword.value) params.keyword = keyword.value
  if (activeCategory.value !== '全部') params.category = activeCategory.value

  try {
    const res = await get('/products', params)
    const list = res.data || res || []
    if (reset) {
      products.value = list
    } else {
      products.value.push(...list)
    }
    if (list.length < 10) {
      hasMore.value = false
    }
  } catch (e) {
    if (reset) {
      products.value = []
    }
    console.error('Failed to fetch products:', e)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function onSearch() {
  fetchProducts(true)
}

function onCategoryTap(cat) {
  if (activeCategory.value === cat) return
  activeCategory.value = cat
  fetchProducts(true)
}

function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  page.value++
  fetchProducts(false)
}

function statusText(status) {
  const map = {
    0: '待审核',
    1: '在售',
    2: '已售罄',
    3: '已下架'
  }
  return map[status] || '未知'
}

async function onMakeOffer(item) {
  try {
    await post('/trades', { product_id: item.id })
    uni.showToast({ title: '已发起代卖意向', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '发起失败，请重试', icon: 'none' })
  }
}

// Lifecycle
onShow(() => {
  fetchProducts(true)
})

onPullDownRefresh(() => {
  fetchProducts(true).then(() => {
    uni.stopPullDownRefresh()
  }).catch(() => {
    uni.stopPullDownRefresh()
  })
})
</script>

<style scoped lang="scss">
.page {
  padding: 24rpx;
  min-height: 100vh;
}

.search-bar {
  margin-bottom: 24rpx;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16rpx 24rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 32rpx;
  color: var(--text);
}

.category-scroll {
  white-space: nowrap;
  margin-bottom: 24rpx;

  .category-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    min-width: 44px;
    padding: 12rpx 28rpx;
    margin-right: 16rpx;
    background-color: var(--white);
    border: 1px solid var(--border);
    border-radius: 32rpx;
    font-size: 32rpx;
    color: var(--text-secondary);

    &.active {
      background-color: var(--primary);
      color: var(--white);
      border-color: var(--primary);
    }
  }
}

.product-list {
  flex: 1;
}

/* Loading */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 80rpx 0;
}

.loading-text {
  font-size: 32rpx;
  color: var(--text-muted);
}

/* Product card */
.product-card {
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.card-header {
  margin-bottom: 16rpx;

  .card-variety-row {
    display: flex;
    align-items: center;
    margin-bottom: 6rpx;
  }

  .card-variety {
    font-size: 36rpx;
    font-weight: 700;
    color: var(--text);
  }

  .urgent-badge {
    font-size: 24rpx;
    color: var(--accent);
    background-color: #FEF3C7;
    padding: 4rpx 12rpx;
    border-radius: 4px;
    margin-left: 12rpx;
  }

  .card-spec {
    font-size: 28rpx;
    color: var(--text-secondary);
  }
}

.card-body {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
  padding: 16rpx 0;
  border-top: 1px solid #F3F4F6;
  border-bottom: 1px solid #F3F4F6;
}

.card-info {
  display: flex;
  flex-direction: column;

  .info-label {
    font-size: 24rpx;
    color: var(--text-muted);
    margin-bottom: 4rpx;
  }

  .info-value {
    font-size: 32rpx;
    font-weight: 700;
  }
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-actions {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1px solid #F3F4F6;

  .offer-btn {
    width: 100%;
    height: 44px;
    border-radius: 8px;
    font-size: 32rpx;
    font-weight: 500;
  }
}

.footer-tags {
  display: flex;
  gap: 8rpx;
}

.footer-tag {
  font-size: 24rpx;
  color: var(--primary);
  background-color: #F0FDF4;
  padding: 4rpx 12rpx;
  border-radius: 4px;
}

.footer-date {
  font-size: 24rpx;
  color: var(--text-muted);
}

.footer-status {
  font-size: 24rpx;
  color: var(--primary);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  color: var(--text-muted);
}

.empty-sub {
  font-size: 28rpx;
  color: var(--text-muted);
  margin-top: 8rpx;
}

/* Load more */
.load-more {
  display: flex;
  justify-content: center;
  padding: 32rpx 0;

  &-text {
    font-size: 28rpx;
    color: var(--primary);
  }
}

.no-more {
  display: flex;
  justify-content: center;
  padding: 32rpx 0;

  &-text {
    font-size: 28rpx;
    color: var(--text-muted);
  }
}
</style>
