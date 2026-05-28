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

    <!-- Product list area -->
    <view class="product-list">
      <view class="empty-state">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无货源，下拉刷新</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'

const keyword = ref('')
const activeCategory = ref('全部')
const loading = ref(false)
const categories = ref(['全部', '苹果', '柑橘', '芒果', '葡萄', '蔬菜'])

function onSearch() {
  // TODO: Implement search
  console.log('Search:', keyword.value)
}

function onCategoryTap(cat) {
  activeCategory.value = cat
  // TODO: Filter by category
  console.log('Category selected:', cat)
}

onPullDownRefresh(() => {
  // TODO: Refresh supply list
  uni.stopPullDownRefresh()
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
</style>
