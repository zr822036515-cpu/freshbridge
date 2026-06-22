<template>
  <view class="page">
    <!-- ===== 导航栏 ===== -->
    <view class="navbar">
      <view class="nav-left">
        <text class="nav-map-icon">🍑</text>
        <text class="nav-map-text">产区地图</text>
        <text class="nav-map-arrow">›</text>
      </view>
      <view class="nav-search" @tap="focusSearch">
        <text class="nav-search-icon">🔍</text>
        <text class="nav-search-placeholder">搜索</text>
      </view>
      <view class="nav-actions">
        <text class="nav-icon-text">⋯</text>
        <text class="nav-icon-text">━</text>
        <text class="nav-icon-text">✕</text>
      </view>
    </view>

    <!-- ===== 资讯横幅 ===== -->
    <view class="info-banner">
      <view class="ib-left">
        <text class="ib-icon">📢</text>
        <text class="ib-tomato">🍅</text>
        <text class="ib-text">水果产业每天 5 分钟 07:30 更新</text>
      </view>
      <view class="ib-arrow">›</view>
    </view>

    <!-- ===== 标签行：仅需求广场 + 发布按钮 ===== -->
    <view class="label-row">
      <view class="label-active">
        <text>需求广场</text>
        <view class="label-underline"></view>
      </view>
      <view class="label-publish" @tap="goPublish">
        <text>✚ 发布</text>
      </view>
    </view>

    <!-- ===== 信息流 ===== -->
    <scroll-view scroll-y class="feed-scroll" @scrolltolower="loadMore" @refresherrefresh="onRefresh" refresher-enabled>
      <view class="card-list">
        <view v-for="card in feedCards" :key="card.id" class="feed-card">
          <!-- 头部 -->
          <view class="fc-header">
            <view class="fc-user" @tap="goProfile(card)">
              <view class="fc-avatar" :style="{ background: card.avatarBg }"></view>
              <view class="fc-badge-tag" :class="card.type === 'supply' ? 'badge-supply' : 'badge-demand'">
                {{ card.type === 'supply' ? '供货' : '求购' }}
              </view>
              <view>
                <view class="fc-name-row">
                  <text class="fc-name">{{ card.userName }}</text>
                  <text v-if="card.isVip" class="fc-vip">VIP</text>
                </view>
              </view>
            </view>
            <view class="fc-follow" :class="{ followed: card.followed }" @tap="toggleFollow(card)">
              {{ card.followed ? '已关注' : '+ 关注' }}
            </view>
          </view>

          <!-- 正文 -->
          <view class="fc-body">
            <text v-for="(line, li) in card.textLines" :key="li" class="fc-text">
              <text v-if="line.label" class="fc-label">{{ line.label }}</text>
              <text>{{ line.content }}</text>
              <text v-if="line.showPhone" class="fc-link" @tap="revealPhone(card)">查看</text>
            </text>
          </view>

          <!-- 配图 -->
          <view v-if="card.images && card.images.length" class="fc-images" :class="'img-count-' + card.images.length">
            <view v-for="(img, ii) in card.images" :key="ii" class="fc-img" @tap="previewImage(card.images, ii)">
              <text class="fc-img-placeholder" :class="{ large: card.images.length === 1 }">{{ img.emoji }}</text>
              <text v-if="img.label" class="fc-img-sub">{{ img.label }}</text>
            </view>
          </view>

          <!-- 底部互动 -->
          <view class="fc-footer">
            <text class="fc-time">{{ card.timeAgo }}</text>
            <view class="fc-stats">
              <view class="fc-stat-item" @tap="openComments(card)">
                <text>💬</text>
                <text v-if="card.commentCount">{{ card.commentCount }}</text>
              </view>
              <view class="fc-stat-item" @tap="toggleLike(card)">
                <text>{{ card.liked ? '❤️' : '🤍' }}</text>
                <text v-if="card.likeCount">{{ card.likeCount }}</text>
              </view>
            </view>
            <view class="fc-call" @tap="callPhone(card)">📞 电话</view>
          </view>
        </view>

        <view v-if="loading" class="state-text">加载中...</view>
        <view v-if="!loading && feedCards.length === 0" class="state-text">暂无名片，下拉刷新</view>
      </view>
    </scroll-view>

    <!-- ===== 评论弹窗 ===== -->
    <view v-if="commentVisible" class="overlay" @tap="closeComments">
      <view class="comment-panel" @tap.stop>
        <view class="cm-header">
          <text class="cm-title">评论</text>
          <text class="cm-close" @tap="closeComments">✕</text>
        </view>
        <scroll-view scroll-y class="cm-list">
          <view v-for="c in currentComments" :key="c.id" class="cm-item">
            <text class="cm-user">{{ c.userName }}</text>
            <text class="cm-content">{{ c.content }}</text>
            <text class="cm-time">{{ c.time }}</text>
          </view>
          <view v-if="currentComments.length === 0" class="cm-empty">暂无评论</view>
        </scroll-view>
        <view class="cm-input-row">
          <input class="cm-input" v-model="commentText" placeholder="写评论..." />
          <view class="cm-send" @tap="sendComment">发送</view>
        </view>
      </view>
    </view>

    <view class="bottom-spacer"></view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'

const loading = ref(false)
const commentVisible = ref(false)
const commentText = ref('')
const currentCard = ref(null)
const currentComments = ref([])

// Mock feed data matching the design spec
const feedCards = ref([
  {
    id: 1, type: 'supply', userName: '鲜果地', isVip: true, avatarBg: 'linear-gradient(135deg, #FFE0B2, #FFCC80)',
    followed: false, timeAgo: '9 分钟前', likeCount: 2, commentCount: 0, liked: false,
    textLines: [
      { label: '【供货】', content: '水蜜桃包装盒，有需求的老板可以联系我 1824661 ', showPhone: true },
      { label: '【联系方式】', content: '鲜果地 1824661 ', showPhone: true },
    ],
    images: [
      { emoji: '🍑', label: '礼盒' },
      { emoji: '🎁', label: '套装' },
      { emoji: '📦', label: '分格托' },
    ],
  },
  {
    id: 2, type: 'supply', userName: '侯书言', isVip: false, avatarBg: 'linear-gradient(135deg, #C8E6C9, #A5D6A7)',
    followed: false, timeAgo: '25 分钟前', likeCount: 5, commentCount: 0, liked: true,
    textLines: [
      { label: '【供货水果】', content: '甘蒂一号大量有货，毛毛钱走货', showPhone: false },
      { label: '【品类】', content: '西瓜', showPhone: false },
      { label: '【产地】', content: '陕西省安康市岚皋县', showPhone: false },
      { label: '【联系方式】', content: '侯书言 150****8389 ', showPhone: true },
    ],
    images: [{ emoji: '🍉', label: '' }],
  },
  {
    id: 3, type: 'supply', userName: '赣南果园', isVip: true, avatarBg: 'linear-gradient(135deg, #FFE0B2, #FFB74D)',
    followed: false, timeAgo: '1 小时前', likeCount: 12, commentCount: 3, liked: false,
    textLines: [
      { label: '【供货水果】', content: '赣南脐橙大量上市，产地直发，品质保证', showPhone: false },
      { label: '【品类】', content: '脐橙', showPhone: false },
      { label: '【产地】', content: '江西省赣州市信丰县', showPhone: false },
      { label: '【联系方式】', content: '赣南果园 138****5678 ', showPhone: true },
    ],
    images: [
      { emoji: '🍊', label: '整果' },
      { emoji: '📦', label: '装箱' },
      { emoji: '🔪', label: '切面' },
    ],
  },
])

// ===== Interactions =====
function toggleFollow(card) {
  if (!card.followed) { card.followed = true; uni.showToast({ title: '已关注 ' + card.userName, icon: 'success' }) }
  else {
    uni.showModal({ title: '取消关注', content: '确定不再关注 ' + card.userName + '？', success: (r) => { if (r.confirm) card.followed = false } })
  }
}

function toggleLike(card) {
  card.liked = !card.liked; card.likeCount += card.liked ? 1 : -1
}

function revealPhone(card) {
  uni.showModal({ title: '联系方式', content: '完整手机号：182****4661\n（VIP 用户无限查看，普通用户每日限 5 次）', showCancel: false })
}

function callPhone(card) {
  uni.showModal({
    title: '拨打电话', content: '1824661\n点击确定拨打',
    success: (r) => { if (r.confirm) uni.makePhoneCall({ phoneNumber: '1824661' }) }
  })
}

function openComments(card) {
  currentCard.value = card
  currentComments.value = [
    { id: 1, userName: '张采购', content: '老板，水蜜桃还有货吗？什么价位', time: '5 分钟前' },
    { id: 2, userName: '李批发', content: '已联系，价格合适', time: '3 分钟前' },
  ]
  commentVisible.value = true
}
function closeComments() { commentVisible.value = false; commentText.value = '' }
function sendComment() {
  if (!commentText.value.trim()) return
  currentComments.value.push({ id: Date.now(), userName: '我', content: commentText.value, time: '刚刚' })
  if (currentCard.value) currentCard.value.commentCount++
  commentText.value = ''
}

function previewImage(images, idx) {
  uni.previewImage({ urls: images.map(i => i.emoji), current: idx })
}

function goProfile(card) { uni.showToast({ title: card.userName + ' 的主页', icon: 'none' }) }
function goPublish() { uni.switchTab({ url: '/pages/publish/index' }) }
function focusSearch() { uni.showToast({ title: '搜索货源、产地、商家', icon: 'none' }) }
function loadMore() { uni.showToast({ title: '加载更多...', icon: 'none', duration: 1000 }) }
function onRefresh() { setTimeout(() => uni.stopPullDownRefresh(), 1000) }
</script>

<style scoped lang="scss">
.page { background: #FAF7F2; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }

/* ===== 导航栏 ===== */
.navbar { display: flex; align-items: center; padding: 16rpx 20rpx; background: #fff; gap: 16rpx; }
.nav-left { display: flex; align-items: center; gap: 6rpx; background: #E8F5E9; padding: 14rpx 20rpx; border-radius: 24rpx; flex-shrink: 0; }
.nav-map-icon { font-size: 24rpx; }
.nav-map-text { font-size: 24rpx; font-weight: 600; color: #0F3B2C; }
.nav-map-arrow { font-size: 20rpx; color: #0F3B2C; margin-left: 2rpx; }
.nav-search { flex: 1; display: flex; align-items: center; border: 2rpx solid #F5A623; border-radius: 24rpx; padding: 14rpx 20rpx; gap: 8rpx; }
.nav-search-icon { font-size: 24rpx; color: #999; }
.nav-search-placeholder { font-size: 26rpx; color: #999; }
.nav-actions { display: flex; gap: 12rpx; align-items: center; flex-shrink: 0; }
.nav-icon-text { font-size: 24rpx; color: #999; }

/* ===== 资讯横幅 ===== */
.info-banner { display: flex; align-items: center; justify-content: space-between; margin: 16rpx 20rpx; background: #FEF7E0; border-radius: 16rpx; padding: 18rpx 20rpx; }
.ib-left { display: flex; align-items: center; gap: 8rpx; flex: 1; overflow: hidden; }
.ib-icon { font-size: 26rpx; }
.ib-tomato { font-size: 26rpx; }
.ib-text { font-size: 24rpx; color: #5A4312; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ib-arrow { width: 48rpx; height: 48rpx; border-radius: 50%; background: #F5A623; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28rpx; font-weight: 700; flex-shrink: 0; margin-left: 12rpx; }

/* ===== 标签行 ===== */
.label-row { display: flex; align-items: center; justify-content: space-between; padding: 16rpx 20rpx; }
.label-active { position: relative; font-size: 34rpx; font-weight: 700; color: #F5A623; padding-bottom: 8rpx; }
.label-underline { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 80rpx; height: 6rpx; background: #F5A623; border-radius: 3rpx; }
.label-publish { padding: 14rpx 28rpx; border-radius: 14rpx; background: #F5A623; color: #fff; font-size: 26rpx; font-weight: 600; }

/* ===== 信息流 ===== */
.feed-scroll { flex: 1; height: 0; overflow-y: auto; }
.card-list { padding: 0 20rpx 120rpx; display: flex; flex-direction: column; gap: 20rpx; }

.feed-card { background: #fff; border-radius: 20rpx; padding: 24rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.04); }

/* 头部 */
.fc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18rpx; }
.fc-user { display: flex; align-items: center; gap: 12rpx; position: relative; }
.fc-avatar { width: 72rpx; height: 72rpx; border-radius: 50%; flex-shrink: 0; }
.fc-badge-tag { font-size: 20rpx; font-weight: 700; padding: 2rpx 8rpx; border-radius: 6rpx; position: absolute; bottom: -4rpx; left: 52rpx; }
.badge-supply { background: #F5A623; color: #fff; }
.badge-demand { background: #D97706; color: #fff; }
.fc-name-row { display: flex; align-items: center; gap: 8rpx; }
.fc-name { font-size: 30rpx; font-weight: 700; color: #1A1A1A; }
.fc-vip { font-size: 20rpx; font-weight: 700; color: #fff; background: linear-gradient(135deg, #F5A623, #E8961A); padding: 3rpx 10rpx; border-radius: 6rpx; }
.fc-follow { padding: 10rpx 24rpx; border-radius: 20rpx; border: 2rpx solid #F5A623; color: #F5A623; font-size: 24rpx; font-weight: 600; }
.fc-follow.followed { background: #F5F5F5; color: #999; border-color: #E5E7EB; }

/* 正文 */
.fc-body { margin-bottom: 16rpx; }
.fc-text { font-size: 28rpx; color: #333; line-height: 1.8; display: block; }
.fc-label { color: #F5A623; font-weight: 600; }
.fc-link { color: #2563EB; }

/* 配图 */
.fc-images { display: flex; gap: 12rpx; margin-bottom: 18rpx; }
.img-count-3 .fc-img { flex: 1; height: 200rpx; }
.img-count-1 .fc-img { width: 100%; height: 360rpx; }
.fc-img { border-radius: 14rpx; overflow: hidden; background: linear-gradient(135deg, #FFF3E0, #FFE0B2); display: flex; align-items: center; justify-content: center; }
.fc-img-placeholder { font-size: 60rpx; display: flex; flex-direction: column; align-items: center; }
.fc-img-placeholder.large { font-size: 120rpx; }
.fc-img-sub { font-size: 18rpx; color: #999; margin-top: 4rpx; }

/* 底部互动 */
.fc-footer { display: flex; align-items: center; gap: 20rpx; padding-top: 16rpx; border-top: 1px solid #F5F5F5; }
.fc-time { font-size: 24rpx; color: #999; }
.fc-stats { display: flex; gap: 16rpx; }
.fc-stat-item { display: flex; align-items: center; gap: 4rpx; font-size: 24rpx; color: #999; }
.fc-call { margin-left: auto; padding: 12rpx 28rpx; border-radius: 20rpx; background: #fff; border: 1px solid #E5E7EB; font-size: 24rpx; color: #666; }

/* ===== 评论弹窗 ===== */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; align-items: flex-end; }
.comment-panel { width: 100%; max-height: 70vh; background: #fff; border-radius: 24rpx 24rpx 0 0; display: flex; flex-direction: column; }
.cm-header { display: flex; justify-content: space-between; padding: 24rpx; border-bottom: 1px solid #F0F0F0; }
.cm-title { font-size: 32rpx; font-weight: 700; }
.cm-close { font-size: 28rpx; color: #999; padding: 0 8rpx; }
.cm-list { flex: 1; padding: 16rpx 24rpx; max-height: 400rpx; }
.cm-item { padding: 16rpx 0; border-bottom: 1px solid #F5F5F5; }
.cm-user { font-size: 26rpx; font-weight: 600; color: #333; }
.cm-content { font-size: 28rpx; color: #333; display: block; margin-top: 6rpx; }
.cm-time { font-size: 22rpx; color: #999; margin-top: 4rpx; display: block; }
.cm-empty { text-align: center; padding: 40rpx 0; color: #999; }
.cm-input-row { display: flex; align-items: center; padding: 16rpx 24rpx 40rpx; gap: 12rpx; border-top: 1px solid #F0F0F0; }
.cm-input { flex: 1; background: #F5F5F5; border-radius: 24rpx; padding: 16rpx 20rpx; font-size: 26rpx; }
.cm-send { padding: 14rpx 32rpx; border-radius: 24rpx; background: #F5A623; color: #fff; font-size: 26rpx; font-weight: 600; }

.state-text { text-align: center; padding: 120rpx 0; font-size: 28rpx; color: #999; }
.bottom-spacer { height: 120rpx; }
</style>
