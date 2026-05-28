// ============================================
// 鲜桥 FreshBridge — Authentication Utility
// WeChat login + token management
// ============================================

import { post } from './api'

/**
 * WeChat login — exchange code for backend token
 * @returns {Promise<object>} user info object
 */
export const login = () => {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success(res) {
        if (res.code) {
          post('/auth/wechat-login', { code: res.code })
            .then(data => {
              uni.setStorageSync('token', data.token)
              uni.setStorageSync('userInfo', JSON.stringify(data.user))
              resolve(data.user)
            })
            .catch(reject)
        } else {
          reject(new Error('微信登录失败'))
        }
      },
      fail: reject
    })
  })
}

/**
 * Get stored token
 * @returns {string}
 */
export const getToken = () => uni.getStorageSync('token') || ''

/**
 * Get stored user info
 * @returns {object|null}
 */
export const getUserInfo = () => {
  try {
    const info = uni.getStorageSync('userInfo')
    return info ? JSON.parse(info) : null
  } catch {
    return null
  }
}

/**
 * Clear all stored auth data
 */
export const logout = () => {
  uni.removeStorageSync('token')
  uni.removeStorageSync('userInfo')
}

export default { login, getToken, getUserInfo, logout }
