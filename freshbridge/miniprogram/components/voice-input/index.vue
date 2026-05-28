<template>
  <view class="voice-input-wrapper">
    <!-- Large circular record button -->
    <view
      class="voice-btn touch-target"
      :class="{ recording: isRecording }"
      @touchstart.prevent="onStart"
      @touchend.prevent="onEnd"
      @touchcancel.prevent="onCancel"
    >
      <view class="voice-btn-inner">
        <view class="mic-ring" :class="{ pulse: isRecording }">
          <text class="mic-icon">{{ isRecording ? '🔴' : '🎤' }}</text>
        </view>
        <text class="voice-label">{{ isRecording ? '正在聆听...' : '按住说话' }}</text>
      </view>
    </view>

    <!-- Hint text -->
    <text class="voice-hint">例如：我有5000斤红富士，果径80，明天可发货</text>

    <!-- Previous recognition result -->
    <view v-if="lastText" class="last-result">
      <text class="last-label">上次识别：</text>
      <text class="last-text">{{ lastText }}</text>
      <text class="last-check">&#10003;</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['result'])

const isRecording = ref(false)
const lastText = ref('')
const longPressTimer = ref(null)

function onStart() {
  isRecording.value = true
  uni.vibrateShort({ type: 'medium' })
}

function onEnd() {
  if (!isRecording.value) return
  isRecording.value = false
  uni.vibrateShort({ type: 'light' })

  // Mock ASR result — in production this would come from a speech-to-text API
  // Simulate voice recognition with a sample text
  mockASR()
}

function onCancel() {
  isRecording.value = false
}

function mockASR() {
  // In production, this would call uni.getRecorderManager() or a cloud ASR API.
  // For now, we simulate a result that the user would speak.
  const samples = [
    '我有5000斤红富士，果径80，3块5一斤，纸箱装，明天可发',
    '赣南脐橙2000斤，85mm以上，4块一斤，一级果',
    '砂糖橘3000斤，3块一斤，散装，统货',
    '陕西洛川红富士8000斤，果径75，4块2一斤，纸箱装，一级果',
    '芒果1500斤，5块一斤，泡沫箱装，明天上市'
  ]
  const text = samples[Math.floor(Math.random() * samples.length)]
  lastText.value = text
  const parsed = parseVoiceText(text)
  emit('result', { raw: text, ...parsed })
}

function parseVoiceText(text) {
  const result = {}
  // Extract quantity: "5000斤" or "5000 斤" → 5000
  const qtyMatch = text.match(/(\d+)\s*斤/)
  if (qtyMatch) result.quantity = parseInt(qtyMatch[1])

  // Extract price: "3块5" or "3.5元" or "4块2" or "4块" → number
  const priceMatch = text.match(/(\d+\.?\d*)\s*[块元]/)
  if (priceMatch) result.price = parseFloat(priceMatch[1])

  // Handle "X块Y" pattern like "3块5" → 3.5, "4块2" → 4.2
  const complexPrice = text.match(/(\d+)\s*块\s*(\d+)/)
  if (complexPrice) {
    result.price = parseFloat(complexPrice[1]) + parseFloat(complexPrice[2]) * 0.1
  }

  // Extract variety (common fruits)
  const fruits = ['红富士', '赣南脐橙', '砂糖橘', '芒果', '葡萄', '樱桃', '荔枝', '龙眼', '蜜柚', '猕猴桃']
  for (const f of fruits) {
    if (text.includes(f)) { result.variety = f; break }
  }

  // Extract spec: "果径80" or "80mm" or "85mm以上" → number
  const specMatch = text.match(/果径\s*(\d+)/)
  if (specMatch) {
    const val = parseInt(specMatch[1])
    if (val >= 90) result.spec = '90mm+'
    else if (val >= 85) result.spec = '85-90mm'
    else if (val >= 80) result.spec = '80-85mm'
    else if (val >= 70) result.spec = '70-80mm'
    else if (val >= 60) result.spec = '60-70mm'
    else result.spec = '50-60mm'
  }
  const mmMatch = text.match(/(\d+)\s*mm/)
  if (mmMatch && !result.spec) {
    const val = parseInt(mmMatch[1])
    if (val >= 90) result.spec = '90mm+'
    else if (val >= 85) result.spec = '85-90mm'
    else if (val >= 80) result.spec = '80-85mm'
  }

  // Extract packaging
  if (text.includes('纸箱')) result.packaging = '纸箱'
  else if (text.includes('泡沫箱')) result.packaging = '泡沫箱'
  else if (text.includes('塑料筐')) result.packaging = '塑料筐'
  else if (text.includes('散装')) result.packaging = '散装'

  // Extract grade
  if (text.includes('一级')) result.grade = '一级果'
  else if (text.includes('二级')) result.grade = '二级果'
  else if (text.includes('统货')) result.grade = '统货'

  return result
}
</script>

<style scoped lang="scss">
.voice-input-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.voice-btn {
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #22C55E, #15803D);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(21, 128, 61, 0.3);
  transition: transform 0.15s, box-shadow 0.15s;
  user-select: none;

  &.recording {
    background: linear-gradient(135deg, #DC2626, #B91C1C);
    box-shadow: 0 8rpx 32rpx rgba(220, 38, 38, 0.4);
    transform: scale(1.05);
  }
}

.voice-btn-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.mic-ring {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  transition: all 0.3s;

  &.pulse {
    animation: micPulse 1s ease-in-out infinite;
  }
}

.mic-icon {
  font-size: 56rpx;
}

.voice-label {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 500;
  white-space: nowrap;
}

@keyframes micPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.7;
  }
}

.voice-hint {
  font-size: 28rpx;
  color: var(--text-muted);
  margin-top: 32rpx;
  text-align: center;
  line-height: 1.6;
  padding: 0 48rpx;
}

.last-result {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  padding: 16rpx 24rpx;
  background-color: #F0FDF4;
  border: 1px solid #BBF7D0;
  border-radius: 8px;

  .last-label {
    font-size: 26rpx;
    color: var(--text-muted);
  }

  .last-text {
    font-size: 26rpx;
    color: var(--primary);
    margin-left: 8rpx;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .last-check {
    font-size: 26rpx;
    color: var(--primary);
    margin-left: 8rpx;
  }
}
</style>
