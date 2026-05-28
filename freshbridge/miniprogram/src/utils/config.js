// API configuration
// H5 dev: Vite proxy forwards /api → localhost:8080
// Mini-program: use full URL
const isH5 = typeof window !== 'undefined' && !window.wx

const config = {
  baseURL: isH5 ? '/api' : 'https://api.freshbridge.cn/api',
  timeout: 15000
}

export default config
