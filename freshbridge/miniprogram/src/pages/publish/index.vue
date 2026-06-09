<template>
  <scroll-view class="page" scroll-y>
    <!-- Type tabs -->
    <view class="type-tabs">
      <view class="type-tab" :class="{ active: pubType === 'supply' }" @tap="pubType = 'supply'">
        <text>📦 发布货源</text>
      </view>
      <view class="type-tab" :class="{ active: pubType === 'buy' }" @tap="pubType = 'buy'">
        <text>🛒 发布采购</text>
      </view>
    </view>

    <!-- Header -->
    <view class="publish-header">
      <text class="publish-title">{{ pubType === 'supply' ? '发布货源' : '发布采购' }}</text>
      <text class="publish-sub">{{ pubType === 'supply' ? '填写信息，让采购商找到您' : '发布需求，让供应商找到您' }}</text>
    </view>

    <!-- ====== Supply Form ====== -->
    <view v-if="pubType === 'supply'" class="form-section">
      <view class="form-item">
        <text class="form-label">水果品种 <text class="required">*</text></text>
        <picker :range="categories" @change="onCatChange">
          <view class="form-picker touch-target">
            <text :class="{ placeholder: !form.category }">{{ form.category || '请选择' }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">具体品种 <text class="required">*</text></text>
        <input class="form-input" v-model="form.variety" placeholder="例如：红富士、赣南脐橙" />
      </view>
      <view class="form-item">
        <text class="form-label">预估产量 <text class="required">*</text></text>
        <view class="form-input-row">
          <input class="form-input flex-1" v-model="form.quantity" type="digit" placeholder="请输入产量" />
          <text class="form-unit">斤</text>
        </view>
        <text v-if="tonValue" class="form-note">约 {{ tonValue }} 吨</text>
      </view>
      <view class="form-item">
        <text class="form-label">预期价格 <text class="required">*</text></text>
        <view class="form-input-row">
          <input class="form-input flex-1" v-model="form.price" type="digit" placeholder="请输入预期价格" />
          <text class="form-unit">元/斤</text>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">规格</text>
        <picker :range="specOptions" @change="onSpecChange">
          <view class="form-picker touch-target">
            <text :class="{ placeholder: !form.spec }">{{ form.spec || '请选择' }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">等级</text>
        <view class="tag-row">
          <view v-for="g in gradeOptions" :key="g" class="tag" :class="{ active: form.grade === g }" @tap="form.grade = g">{{ g }}</view>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">包装方式</text>
        <view class="tag-row">
          <view v-for="p in packagingOptions" :key="p" class="tag" :class="{ active: form.packaging === p }" @tap="form.packaging = p">{{ p }}</view>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">上市时间</text>
        <picker mode="date" :value="form.available_date" @change="onDateChange">
          <view class="form-picker touch-target">
            <text :class="{ placeholder: !form.available_date }">{{ form.available_date || '请选择' }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">最小起订量</text>
        <view class="form-input-row">
          <input class="form-input flex-1" v-model="form.min_order" type="digit" placeholder="最小起订量" />
          <text class="form-unit">斤</text>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">产地</text>
        <input class="form-input" :value="originDisplay" disabled />
      </view>
      <!-- Photos -->
      <view class="form-item">
        <text class="form-label">商品图片</text>
        <view class="photo-grid">
          <view v-for="(img, i) in form.images" :key="i" class="photo-item">
            <image class="photo-image" :src="img" mode="aspectFill" />
            <view class="photo-delete" @tap="removePhoto(i)"><text class="delete-icon">✕</text></view>
          </view>
          <view v-if="form.images.length < 9" class="photo-add" @tap="takePhoto"><text class="add-icon">📷</text><text class="add-text">拍照</text></view>
          <view v-if="form.images.length < 9" class="photo-add" @tap="choosePhoto"><text class="add-icon">🖼</text><text class="add-text">相册</text></view>
        </view>
      </view>
      <view class="form-item">
        <view class="form-switch-row">
          <text class="form-label" style="margin-bottom:0">⚡ 标记为急售</text>
          <switch :checked="form.urgent" @change="form.urgent = $event.detail.value" color="#CA8A04" />
        </view>
      </view>
    </view>

    <!-- ====== Procurement Form ====== -->
    <view v-else class="form-section">
      <view class="form-item">
        <text class="form-label">需求品种 <text class="required">*</text></text>
        <picker :range="categories" @change="onCatChange">
          <view class="form-picker touch-target">
            <text :class="{ placeholder: !form.category }">{{ form.category || '请选择' }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">具体品种 <text class="required">*</text></text>
        <input class="form-input" v-model="form.variety" placeholder="例如：红富士、赣南脐橙" />
      </view>
      <view class="form-item">
        <text class="form-label">采购数量 <text class="required">*</text></text>
        <view class="form-input-row">
          <input class="form-input flex-1" v-model="form.quantity" type="digit" placeholder="请输入采购量" />
          <text class="form-unit">斤</text>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">期望价格</text>
        <view class="form-input-row">
          <input class="form-input flex-1" v-model="form.price" type="digit" placeholder="可接受的最高价格" />
          <text class="form-unit">元/斤</text>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">品质要求</text>
        <view class="tag-row">
          <view v-for="g in gradeOptions" :key="g" class="tag" :class="{ active: form.grade === g }" @tap="form.grade = g">{{ g }}</view>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">期望交货时间</text>
        <picker mode="date" :value="form.available_date" @change="onDateChange">
          <view class="form-picker touch-target">
            <text :class="{ placeholder: !form.available_date }">{{ form.available_date || '请选择' }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">收货地址 <text class="required">*</text></text>
        <input class="form-input" v-model="form.delivery_addr" placeholder="请输入收货地址，如：北京新发地市场" />
      </view>
      <view class="form-item">
        <text class="form-label">备注</text>
        <input class="form-input" v-model="form.note" placeholder="其他要求，如：需要冷链运输" />
      </view>
    </view>

    <!-- Submit -->
    <view class="submit-section">
      <button class="submit-btn btn-primary" :loading="submitting" :disabled="submitting" @tap="submit">
        {{ submitting ? '发布中...' : (pubType === 'supply' ? '立即发布货源' : '立即发布采购') }}
      </button>
    </view>
    <view class="safe-bottom"></view>
  </scroll-view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { post } from '../../utils/api'

const pubType = ref('supply')
const form = reactive({
  category: '', variety: '', quantity: '', price: '', spec: '',
  grade: '一级果', packaging: '纸箱', available_date: '', min_order: '500',
  origin_province: '陕西', origin_city: '洛川',
  images: [], urgent: false,
  delivery_addr: '', note: ''
})

const submitting = ref(false)

const categories = ['苹果', '梨', '橙子', '宽皮柑橘', '柚子', '柠檬', '葡萄', '草莓', '蓝莓', '猕猴桃', '樱桃/车厘子', '桃子', '李子', '杏', '枣', '芒果', '香蕉', '菠萝/凤梨', '荔枝', '龙眼', '火龙果', '榴莲', '山竹', '百香果', '椰子', '西瓜', '甜瓜', '柿子', '石榴', '无花果', '核桃', '板栗', '腰果', '红枣', '枸杞', '牛油果', '奇异果', '桑葚', '树莓']
const specOptions = ['50-60mm', '60-70mm', '70-80mm', '80-85mm', '85-90mm', '90mm+']
const gradeOptions = ['一级果', '二级果', '统货']
const packagingOptions = ['纸箱', '泡沫箱', '塑料筐', '散装']

const originDisplay = computed(() => form.origin_province + ' ' + form.origin_city)
const tonValue = computed(() => {
  const q = parseFloat(form.quantity); return q > 0 ? (q / 2000).toFixed(2) : ''
})

function onCatChange(e) { form.category = categories[e.detail.value] }
function onSpecChange(e) { form.spec = specOptions[e.detail.value] }
function onDateChange(e) { form.available_date = e.detail.value }

async function takePhoto() {
  try { const r = await uni.chooseImage({ count: 9 - form.images.length, sourceType: ['camera'] }); form.images.push(...r.tempFilePaths) } catch (e) {}
}
async function choosePhoto() {
  try { const r = await uni.chooseImage({ count: 9 - form.images.length, sourceType: ['album'] }); form.images.push(...r.tempFilePaths) } catch (e) {}
}
function removePhoto(i) { form.images.splice(i, 1) }

async function submit() {
  if (!form.variety || !form.quantity || !form.price) {
    uni.showToast({ title: '请填写品种、数量和价格', icon: 'none' }); return
  }
  if (pubType.value === 'buy' && !form.delivery_addr) {
    uni.showToast({ title: '请填写收货地址', icon: 'none' }); return
  }
  submitting.value = true
  try {
    if (pubType.value === 'supply') {
      await post('/products', {
        category: form.category, variety: form.variety, spec: form.spec,
        grade: form.grade, total_quantity: parseFloat(form.quantity),
        price: parseFloat(form.price), packaging: form.packaging,
        min_order: parseFloat(form.min_order) || 500, available_date: form.available_date,
        origin_province: form.origin_province, origin_city: form.origin_city,
        images: form.images, urgent: form.urgent ? 1 : 0
      })
    } else {
      await post('/procurements', {
        category: form.category, variety: form.variety,
        quantity: parseFloat(form.quantity), price: parseFloat(form.price),
        grade: form.grade, delivery_date: form.available_date,
        delivery_addr: form.delivery_addr, note: form.note
      })
    }
    uni.showToast({ title: '发布成功！', icon: 'success' })
    setTimeout(() => uni.switchTab({ url: '/pages/supply/index' }), 1000)
  } catch (e) {
    uni.showToast({ title: '发布失败，请重试', icon: 'none' })
  } finally { submitting.value = false }
}
</script>

<style scoped lang="scss">
.page { padding: 0 32rpx; min-height: 100vh; background: #F0FDF4; }

/* Type tabs */
.type-tabs { display: flex; padding-top: 24rpx; gap: 16rpx; }
.type-tab {
  flex: 1; text-align: center; padding: 20rpx 0; background: #fff; border-radius: 12rpx;
  font-size: 32rpx; font-weight: 600; color: var(--text-secondary); box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
  &.active { background: var(--primary); color: #fff; }
}

.publish-header { padding-top: 24rpx; padding-bottom: 16rpx; }
.publish-title { font-size: 40rpx; font-weight: 700; color: var(--text); display: block; }
.publish-sub { font-size: 28rpx; color: var(--text-muted); margin-top: 8rpx; display: block; }

.form-section { background: #fff; border-radius: 12rpx; padding: 8rpx 24rpx 24rpx; margin-bottom: 24rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); }
.form-item { margin-top: 24rpx; }
.form-label { font-size: 32rpx; font-weight: 700; color: var(--text); margin-bottom: 12rpx; display: block; }
.required { color: var(--danger); }

.form-input {
  font-size: 32rpx; min-height: 44px; border-bottom: 1px solid var(--border); padding: 8rpx 0; color: var(--text);
}
.form-input-row { display: flex; align-items: center; }
.flex-1 { flex: 1; }
.form-unit { font-size: 28rpx; color: var(--text-muted); margin-left: 12rpx; white-space: nowrap; }
.form-note { font-size: 26rpx; color: var(--text-muted); margin-top: 6rpx; }

.form-picker {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 32rpx; min-height: 44px; border-bottom: 1px solid var(--border); padding: 8rpx 0; color: var(--text);
  .placeholder { color: var(--text-muted); }
  .picker-arrow { font-size: 36rpx; color: var(--text-muted); }
}

.tag-row { display: flex; flex-wrap: wrap; gap: 16rpx; }
.tag {
  padding: 12rpx 28rpx; border: 1px solid var(--border); border-radius: 8rpx; font-size: 28rpx; color: var(--text-secondary); background: #fff;
  &.active { background: var(--primary); color: #fff; border-color: var(--primary); }
}

.photo-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.photo-item { width: 200rpx; height: 200rpx; border-radius: 8rpx; position: relative; overflow: hidden; border: 1px solid #E5E7EB; }
.photo-image { width: 100%; height: 100%; }
.photo-delete {
  position: absolute; top: 0; right: 0; width: 48rpx; height: 48rpx;
  background: rgba(0,0,0,0.5); border-radius: 0 8px 0 8px; display: flex; align-items: center; justify-content: center;
  .delete-icon { color: #fff; font-size: 24rpx; }
}
.photo-add {
  width: 200rpx; height: 200rpx; border: 2rpx dashed #D1D5DB; border-radius: 8rpx;
  display: flex; flex-direction: column; align-items: center; justify-content: center; background: #FAFAFA;
  .add-icon { font-size: 44rpx; margin-bottom: 6rpx; }
  .add-text { font-size: 24rpx; color: #999; }
}

.form-switch-row { display: flex; align-items: center; justify-content: space-between; }

.submit-section { padding: 8rpx 0 32rpx; }
.submit-btn {
  width: 100%; height: 96rpx; border-radius: 12rpx; background: var(--primary); color: #fff;
  font-size: 34rpx; font-weight: 600; display: flex; align-items: center; justify-content: center; border: none;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
  &[disabled] { opacity: 0.6; }
}
.safe-bottom { height: 60rpx; }
</style>
