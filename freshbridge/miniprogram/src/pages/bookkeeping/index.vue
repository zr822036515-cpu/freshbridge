<template>
  <view class="page">
    <!-- Header -->
    <view class="page-header">
      <text class="page-title">快速记账</text>
      <text class="page-sub">记录每一笔销售</text>
    </view>

    <!-- Method tabs -->
    <view class="method-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="method-tab touch-target"
        :class="{ active: activeTab === tab.key }"
        @tap="activeTab = tab.key"
      >
        <image :src="tab.icon" mode="aspectFit" class="tab-icon-img" />
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- Tab content: 扫码记账 -->
    <view v-if="activeTab === 'scan'" class="tab-content">
      <view class="scan-area touch-target" @tap="onScanCode">
        <image src="/static/images/camera.svg" mode="aspectFit" class="scan-icon-img" />
        <text class="scan-text">点击扫码</text>
      </view>
      <view v-if="scanResult" class="scan-result card">
        <text class="scan-result-label">扫码结果：</text>
        <text class="scan-result-text">{{ scanResult }}</text>
      </view>
    </view>

    <!-- Tab content: 手写录入 -->
    <view v-if="activeTab === 'manual'" class="tab-content">
      <text class="tab-hint">直接填写以下信息</text>
    </view>

    <!-- Shared form (shown for all tabs) -->
    <view class="form-card card">
      <view class="form-title">销售信息</view>

      <!-- Trade picker -->
      <view class="form-item">
        <text class="form-label">交易单号</text>
        <picker
          v-if="trades.length > 0"
          :range="tradeLabels"
          :value="selectedTradeIndex"
          @change="onTradeChange"
          class="form-picker"
        >
          <view class="picker-display touch-target">
            <text :class="{ placeholder: !selectedTradeId }">
              {{ selectedTradeId ? selectedTradeLabel : '请选择代卖交易' }}
            </text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
        <view v-else class="picker-display touch-target">
          <text class="placeholder">暂无进行中的代卖交易</text>
        </view>
      </view>

      <!-- Quantity input -->
      <view class="form-item">
        <text class="form-label">售出数量（斤）</text>
        <input
          class="form-input"
          type="digit"
          v-model="quantity"
          placeholder="请输入数量"
        />
      </view>

      <!-- Price input -->
      <view class="form-item">
        <text class="form-label">实际售价（元/斤）</text>
        <input
          class="form-input"
          type="digit"
          v-model="price"
          placeholder="请输入单价"
        />
      </view>

      <!-- Auto-calculated total -->
      <view class="form-item total-row">
        <text class="form-label">小计</text>
        <text class="total-value">¥ {{ totalAmount.toFixed(2) }}</text>
      </view>

    </view>

    <!-- Submit button -->
    <view class="submit-btn btn-primary touch-target" @tap="submitSale">
      <text>确认记账</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, post } from '../../utils/api'

const activeTab = ref('manual')
const tabs = ref([
  { key: 'scan', label: '扫码记账', icon: '/static/images/camera.svg' },
  { key: 'manual', label: '手写录入', icon: '/static/images/edit.svg' }
])

const trades = ref([])
const tradeLabels = computed(() => trades.value.map(t => {
  const trade = t
  const variety = trade.product ? trade.product.variety : '未知'
  return `#${trade.id} ${variety}`
}))
const selectedTradeIndex = ref(-1)
const selectedTradeId = ref(null)
const selectedTradeLabel = computed(() => {
  const idx = selectedTradeIndex.value
  return idx >= 0 ? tradeLabels.value[idx] : ''
})

const quantity = ref('')
const price = ref('')
const scanResult = ref('')

const totalAmount = computed(() => {
  return (parseFloat(quantity.value) || 0) * (parseFloat(price.value) || 0)
})

async function loadTrades() {
  try {
    const res = await get('/trades/my')
    const all = res.trades || []
    trades.value = all.filter(t => t.status === 'accepted' || t.status === 'selling')

    // Auto-select trade from navigation param
    const pages = getCurrentPages()
    const page = pages[pages.length - 1]
    const tradeId = (page && page.options && page.options.tradeId) || null
    if (tradeId) {
      const idx = trades.value.findIndex(t => String(t.id) === String(tradeId))
      if (idx >= 0) {
        selectedTradeIndex.value = idx
        selectedTradeId.value = trades.value[idx].id
      }
    }
  } catch (e) {
    console.error('Failed to load trades:', e)
  }
}

onShow(() => {
  loadTrades()
})

function onTradeChange(e) {
  const idx = e.detail ? e.detail.value : e.value
  selectedTradeIndex.value = idx
  selectedTradeId.value = trades.value[idx] ? trades.value[idx].id : null
}

async function submitSale() {
  if (!selectedTradeId.value || !quantity.value || !price.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  const trade = trades.value.find(t => t.id === selectedTradeId.value)
  if (!trade) {
    uni.showToast({ title: '交易不存在', icon: 'none' })
    return
  }
  try {
    await post('/sales', {
      trade_id: selectedTradeId.value,
      product_id: trade.product_id,
      quantity: parseFloat(quantity.value),
      price: parseFloat(price.value),
      record_method: activeTab.value === 'scan' ? 'scan' : 'manual',
      sale_time: new Date().toISOString()
    })
    uni.showToast({ title: '记账成功', icon: 'success' })
    // Reset form
    quantity.value = ''
    price.value = ''
    scanResult.value = ''
  } catch (e) {
    uni.showToast({ title: '记账失败，请重试', icon: 'none' })
  }
}

function onScanCode() {
  uni.scanCode({
    onlyFromCamera: true,
    success(res) {
      scanResult.value = res.result || ''
      uni.showToast({ title: '扫码成功', icon: 'success' })
    },
    fail() {
      uni.showToast({ title: '扫码取消', icon: 'none' })
    }
  })
}
</script>

<style scoped lang="scss">
.page {
  padding: 24rpx;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 32rpx;

  .page-title {
    font-size: 40rpx;
    font-weight: 700;
    color: var(--text);
    display: block;
  }

  .page-sub {
    font-size: 32rpx;
    color: var(--text-muted);
    margin-top: 8rpx;
    display: block;
  }
}

/* Method tabs */
.method-tabs {
  display: flex;
  background-color: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 32rpx;
}

.method-tab {
  flex: 1;
  flex-direction: column;
  padding: 20rpx 0;
  font-size: 32rpx;
  color: var(--text-secondary);
  border-right: 1px solid var(--border);
  min-height: 44px;
  gap: 4rpx;

  &:last-child {
    border-right: none;
  }

  &.active {
    background-color: var(--primary);
    color: var(--white);
  }

  .tab-icon-img {
    width: 40rpx;
    height: 40rpx;
  }
}

.tab-content {
  margin-bottom: 24rpx;
}

.tab-hint {
  font-size: 32rpx;
  color: var(--text-muted);
  display: block;
  text-align: center;
  padding: 16rpx 0;
}

/* Scan area */
.scan-area {
  flex-direction: column;
  background-color: var(--white);
  border: 2rpx dashed var(--border);
  border-radius: 10px;
  padding: 48rpx;
  min-height: 44px;
  gap: 16rpx;

  .scan-icon-img {
    width: 80rpx;
    height: 80rpx;
  }

  .scan-text {
    font-size: 32rpx;
    color: var(--text-secondary);
  }
}

.scan-result {
  margin-top: 24rpx;
  padding: 24rpx;

  .scan-result-label {
    font-size: 32rpx;
    color: var(--text-muted);
  }

  .scan-result-text {
    font-size: 32rpx;
    color: var(--text);
    margin-top: 8rpx;
    word-break: break-all;
  }
}

/* Form */
.form-card {
  padding: 24rpx;
  margin-bottom: 32rpx;

  .form-title {
    font-size: 32rpx;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 24rpx;
    padding-bottom: 16rpx;
    border-bottom: 1px solid var(--border);
  }
}

.form-item {
  margin-bottom: 24rpx;

  .form-label {
    font-size: 32rpx;
    color: var(--text-secondary);
    display: block;
    margin-bottom: 12rpx;
  }
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 16rpx;
  background-color: #F9FAFB;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 32rpx;
  color: var(--text);
  box-sizing: border-box;
}

.form-picker {
  width: 100%;
}

.picker-display {
  width: 100%;
  height: 44px;
  padding: 0 16rpx;
  background-color: #F9FAFB;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 32rpx;
  justify-content: space-between;
  box-sizing: border-box;

  .placeholder {
    color: var(--text-muted);
  }

  .picker-arrow {
    font-size: 24rpx;
    color: var(--text-muted);
    flex-shrink: 0;
    margin-left: 12rpx;
  }
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1px solid var(--border);

  .form-label {
    margin-bottom: 0;
  }
}

.total-value {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--accent);
}

/* Submit button */
.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 10px;
  font-size: 36rpx;
  font-weight: 600;
  margin-top: 16rpx;
}
</style>
