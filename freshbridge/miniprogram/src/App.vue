<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { getToken, getUserInfo } from './utils/auth'

onLaunch(() => {
  console.log('鲜桥 App Launched')

  // Restore token from local storage
  const savedToken = getToken()

  if (savedToken) {
    console.log('Token restored from storage')
  }

  const userInfo = getUserInfo()
  if (userInfo) {
    console.log('User info restored:', userInfo.nickname || '')
  }
})

onShow(() => {
  console.log('鲜桥 App Show')
})

onHide(() => {
  console.log('鲜桥 App Hide')
})
</script>

<style lang="scss">
/* Global styles are defined in uni.scss */
</style>
