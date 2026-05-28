<template>
  <scroll-view class="page" scroll-y>
    <!-- Header -->
    <view class="publish-header">
      <text class="publish-title">发布货源</text>
      <text class="publish-sub">填写信息，让采购商找到您</text>
    </view>

    <!-- Voice input component (primary interaction) -->
    <voice-input class="voice-section" @result="onVoiceResult" />

    <!-- Divider -->
    <view class="divider">
      <view class="divider-line"></view>
      <text class="divider-text">或手动填写</text>
      <view class="divider-line"></view>
    </view>

    <!-- Manual form -->
    <view class="form-section">
      <!-- 水果品种 (category picker) -->
      <view class="form-item">
        <text class="form-label">水果品种 <text class="required">*</text></text>
        <picker :range="categories" @change="onCategoryChange">
          <view class="form-picker touch-target">
            <text :class="{ placeholder: !form.category }">{{ form.category || '请选择水果品种' }}</text>
            <text class="picker-arrow">&#8250;</text>
          </view>
        </picker>
      </view>

      <!-- 具体品种 (text input) -->
      <view class="form-item">
        <text class="form-label">具体品种 <text class="required">*</text></text>
        <input
          class="form-input"
          v-model="form.variety"
          placeholder="例如：红富士、赣南脐橙"
          placeholder-style="color:#D1D5DB; font-size:28rpx;"
        />
      </view>

      <!-- 预估产量 (number input with ton conversion) -->
      <view class="form-item">
        <text class="form-label">预估产量 <text class="required">*</text></text>
        <view class="form-input-row">
          <input
            class="form-input flex-1"
            v-model="form.quantity"
            type="digit"
            placeholder="请输入产量"
            placeholder-style="color:#D1D5DB; font-size:28rpx;"
            @input="onQuantityInput"
          />
          <text class="form-unit">斤</text>
        </view>
        <text v-if="tonValue" class="form-note">约 {{ tonValue }} 吨</text>
      </view>

      <!-- 预期价格 (number input) -->
      <view class="form-item">
        <text class="form-label">预期价格 <text class="required">*</text></text>
        <view class="form-input-row">
          <input
            class="form-input flex-1"
            v-model="form.price"
            type="digit"
            placeholder="请输入预期价格"
            placeholder-style="color:#D1D5DB; font-size:28rpx;"
          />
          <text class="form-unit">元/斤</text>
        </view>
      </view>

      <!-- 规格 (picker) -->
      <view class="form-item">
        <text class="form-label">规格</text>
        <picker :range="specOptions" @change="onSpecChange">
          <view class="form-picker touch-target">
            <text :class="{ placeholder: !form.spec }">{{ form.spec || '请选择规格' }}</text>
            <text class="picker-arrow">&#8250;</text>
          </view>
        </picker>
      </view>

      <!-- 等级 (tag selector) -->
      <view class="form-item">
        <text class="form-label">等级</text>
        <view class="tag-row">
          <view
            v-for="g in gradeOptions"
            :key="g"
            class="tag touch-target"
            :class="{ active: form.grade === g }"
            @tap="form.grade = g"
          >
            <text>{{ g }}</text>
          </view>
        </view>
      </view>

      <!-- 包装方式 (tag selector) -->
      <view class="form-item">
        <text class="form-label">包装方式</text>
        <view class="tag-row">
          <view
            v-for="p in packagingOptions"
            :key="p"
            class="tag touch-target"
            :class="{ active: form.packaging === p }"
            @tap="form.packaging = p"
          >
            <text>{{ p }}</text>
          </view>
        </view>
      </view>

      <!-- 上市时间 (date picker) -->
      <view class="form-item">
        <text class="form-label">上市时间</text>
        <picker mode="date" :value="form.available_date" @change="onDateChange">
          <view class="form-picker touch-target">
            <text :class="{ placeholder: !form.available_date }">{{ form.available_date || '请选择日期' }}</text>
            <text class="picker-arrow">&#8250;</text>
          </view>
        </picker>
      </view>

      <!-- 最小起订量 (number input) -->
      <view class="form-item">
        <text class="form-label">最小起订量</text>
        <view class="form-input-row">
          <input
            class="form-input flex-1"
            v-model="form.min_order"
            type="digit"
            placeholder="最小起订量"
            placeholder-style="color:#D1D5DB; font-size:28rpx;"
          />
          <text class="form-unit">斤</text>
        </view>
      </view>

      <!-- 产地 (read-only from user profile) -->
      <view class="form-item">
        <text class="form-label">产地</text>
        <view class="form-input-row">
          <input
            class="form-input flex-1"
            v-model="originDisplay"
            disabled
          />
          <text class="form-unit" style="color: var(--text-muted);">自动</text>
        </view>
      </view>

      <!-- 图片上传 -->
      <view class="form-item">
        <text class="form-label">商品图片</text>
        <view class="photo-grid">
          <!-- Uploaded photos -->
          <view
            v-for="(img, index) in form.images"
            :key="'img-' + index"
            class="photo-item"
          >
            <image class="photo-image" :src="img" mode="aspectFill" />
            <view class="photo-delete touch-target" @tap="removePhoto(index)">
              <text class="delete-icon">&#10005;</text>
            </view>
          </view>
          <!-- Camera button -->
          <view v-if="form.images.length < 9" class="photo-add touch-target" @tap="takePhoto">
            <text class="add-icon">&#128247;</text>
            <text class="add-text">拍照</text>
          </view>
          <!-- Album button -->
          <view v-if="form.images.length < 9" class="photo-add touch-target" @tap="choosePhoto">
            <text class="add-icon">&#128444;</text>
            <text class="add-text">相册</text>
          </view>
        </view>
      </view>

      <!-- 急售开关 -->
      <view class="form-item">
        <view class="form-switch-row">
          <text class="form-label" style="margin-bottom:0;">
            <text style="font-size:36rpx;">&#9889;</text> 标记为急售
          </text>
          <switch
            :checked="form.urgent"
            @change="form.urgent = $event.detail.value"
            color="#CA8A04"
          />
        </view>
        <text v-if="form.urgent" class="form-note-urgent">急售商品将优先展示给采购商</text>
      </view>
    </view>

    <!-- Submit button -->
    <view class="submit-section">
      <button
        class="submit-btn btn-primary"
        :loading="submitting"
        :disabled="submitting"
        @tap="submit"
      >
        <text>{{ submitting ? '发布中...' : '立即发布' }}</text>
      </button>
    </view>

    <!-- Bottom safe area -->
    <view class="safe-bottom"></view>
  </scroll-view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { post } from '../../utils/api'
import VoiceInput from '../../components/voice-input/index.vue'

const form = reactive({
  category: '',
  variety: '',
  quantity: '',
  price: '',
  spec: '',
  grade: '一级果',
  packaging: '纸箱',
  available_date: '',
  min_order: '500',
  origin_province: '陕西',
  origin_city: '洛川',
  images: [],
  urgent: false
})

const submitting = ref(false)

const categories = ['苹果', '柑橘', '芒果', '葡萄', '樱桃', '荔枝', '猕猴桃', '桃子', '梨', '蔬菜']
const specOptions = ['50-60mm', '60-70mm', '70-80mm', '80-85mm', '85-90mm', '90mm+']
const gradeOptions = ['一级果', '二级果', '统货']
const packagingOptions = ['纸箱', '泡沫箱', '塑料筐', '散装']

const originDisplay = computed(() => {
  return form.origin_province + ' ' + form.origin_city
})

const tonValue = computed(() => {
  const qty = parseFloat(form.quantity)
  if (!qty || qty <= 0) return ''
  return (qty / 2000).toFixed(2)
})

function onQuantityInput() {
  // Allow only digits and dot
  form.quantity = form.quantity.replace(/[^\d.]/g, '')
}

function onVoiceResult(e) {
  const data = e.detail
  if (data.quantity) form.quantity = String(data.quantity)
  if (data.price) form.price = String(data.price)
  if (data.variety) form.variety = data.variety
  if (data.spec) form.spec = data.spec
  if (data.packaging) form.packaging = data.packaging
  if (data.grade) form.grade = data.grade

  // Auto-detect category from variety
  if (data.variety) {
    if (data.variety.includes('富士') || data.variety.includes('苹果')) form.category = '苹果'
    else if (data.variety.includes('脐橙') || data.variety.includes('柑橘')) form.category = '柑橘'
    else if (data.variety.includes('芒果')) form.category = '芒果'
    else if (data.variety.includes('葡萄')) form.category = '葡萄'
    else if (data.variety.includes('樱桃')) form.category = '樱桃'
    else if (data.variety.includes('荔枝')) form.category = '荔枝'
    else if (data.variety.includes('猕猴桃')) form.category = '猕猴桃'
  }

  uni.showToast({ title: '语音识别成功，请核对信息', icon: 'success' })
}

function onCategoryChange(e) {
  form.category = categories[e.detail.value]
}

function onSpecChange(e) {
  form.spec = specOptions[e.detail.value]
}

function onDateChange(e) {
  form.available_date = e.detail.value
}

// Image handling
async function takePhoto() {
  try {
    const res = await uni.chooseImage({
      count: 9 - form.images.length,
      sourceType: ['camera']
    })
    form.images.push(...res.tempFilePaths)
  } catch (e) {
    // User cancelled
  }
}

async function choosePhoto() {
  try {
    const res = await uni.chooseImage({
      count: 9 - form.images.length,
      sourceType: ['album']
    })
    form.images.push(...res.tempFilePaths)
  } catch (e) {
    // User cancelled
  }
}

function removePhoto(index) {
  form.images.splice(index, 1)
}

// Submit
async function submit() {
  if (!form.variety || !form.quantity || !form.price) {
    uni.showToast({ title: '请填写品种、产量和价格', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await post('/products', {
      category: form.category,
      variety: form.variety,
      spec: form.spec,
      grade: form.grade,
      total_quantity: parseFloat(form.quantity),
      price: parseFloat(form.price),
      packaging: form.packaging,
      min_order: parseFloat(form.min_order) || 500,
      available_date: form.available_date,
      origin_province: form.origin_province,
      origin_city: form.origin_city,
      images: JSON.stringify(form.images),
      urgent: form.urgent ? 1 : 0
    })
    uni.showToast({ title: '发布成功！', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/supply/index' })
    }, 1000)
  } catch (e) {
    uni.showToast({ title: '发布失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.page {
  padding: 0 32rpx;
  min-height: 100vh;
  background-color: var(--bg);
}

/* Header */
.publish-header {
  padding-top: 32rpx;
  padding-bottom: 16rpx;

  .publish-title {
    font-size: 40rpx;
    font-weight: 700;
    color: var(--text);
    display: block;
  }

  .publish-sub {
    font-size: 28rpx;
    color: var(--text-muted);
    margin-top: 8rpx;
    display: block;
  }
}

/* Voice section */
.voice-section {
  margin: 24rpx 0;
}

/* Divider */
.divider {
  width: 100%;
  display: flex;
  align-items: center;
  margin: 40rpx 0 32rpx;

  &-line {
    flex: 1;
    height: 1px;
    background-color: var(--border);
  }

  &-text {
    padding: 0 32rpx;
    font-size: 28rpx;
    color: var(--text-muted);
  }
}

/* Form */
.form-section {
  background-color: var(--white);
  border-radius: 10px;
  padding: 8rpx 24rpx 24rpx;
  border: 1px solid var(--border);
}

.form-item {
  margin-top: 24rpx;
}

.form-label {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12rpx;
  display: block;

  .required {
    color: var(--danger);
  }
}

.form-input {
  font-size: 32rpx;
  min-height: 44px;
  border-bottom: 1px solid var(--border);
  padding: 8rpx 0;
  color: var(--text);
  box-sizing: border-box;
}

.form-input-row {
  display: flex;
  align-items: center;

  .flex-1 {
    flex: 1;
  }
}

.form-unit {
  font-size: 28rpx;
  color: var(--text-secondary);
  margin-left: 12rpx;
  white-space: nowrap;
}

.form-note {
  font-size: 26rpx;
  color: var(--text-muted);
  margin-top: 6rpx;
}

.form-note-urgent {
  font-size: 26rpx;
  color: var(--accent);
  margin-top: 8rpx;
}

/* Picker style */
.form-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 32rpx;
  min-height: 44px;
  border-bottom: 1px solid var(--border);
  padding: 8rpx 0;
  color: var(--text);

  .placeholder {
    color: #D1D5DB;
  }

  .picker-arrow {
    font-size: 36rpx;
    color: var(--text-muted);
    font-weight: 700;
  }
}

/* Tag selectors */
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  padding: 12rpx 28rpx;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 28rpx;
  color: var(--text-secondary);
  background-color: var(--white);

  &.active {
    background-color: var(--primary);
    color: var(--white);
    border-color: var(--primary);
  }
}

/* Photo grid */
.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.photo-item {
  width: 220rpx;
  height: 220rpx;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
}

.photo-image {
  width: 100%;
  height: 100%;
}

.photo-delete {
  position: absolute;
  top: 0;
  right: 0;
  width: 48rpx;
  height: 48rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 0 8px 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  .delete-icon {
    color: #FFFFFF;
    font-size: 24rpx;
  }
}

.photo-add {
  width: 220rpx;
  height: 220rpx;
  border: 2px dashed var(--border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #FAFAFA;

  .add-icon {
    font-size: 48rpx;
    margin-bottom: 8rpx;
  }

  .add-text {
    font-size: 24rpx;
    color: var(--text-muted);
  }
}

/* Switch row */
.form-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Submit */
.submit-section {
  padding: 32rpx 0;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 10px;
  background-color: var(--primary);
  color: var(--white);
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-sizing: border-box;

  &[disabled] {
    opacity: 0.6;
  }
}

/* Safe bottom */
.safe-bottom {
  height: 60rpx;
}
</style>
