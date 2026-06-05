// ============================================
// 鲜桥 FreshBridge — HTTP Request Utility
// Configurable base URL for China networks
// ============================================

import config from './config'

const request = (method, path, data = {}) => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    uni.request({
      method,
      url: config.baseURL + path,
      timeout: config.timeout,
      header: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      data,
      success(res) {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          if (token) {
            uni.removeStorageSync('token')
            uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
          }
          reject(res.data)
        } else {
          reject(res.data)
        }
      },
      fail(err) {
        uni.showToast({ title: '网络连接失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

export const get = (path, data) => request('GET', path, data)
export const post = (path, data) => request('POST', path, data)
export const put = (path, data) => request('PUT', path, data)
export const del = (path, data) => request('DELETE', path, data)

export default { get, post, put, del }
