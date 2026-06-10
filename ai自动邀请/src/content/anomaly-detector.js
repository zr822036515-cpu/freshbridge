// ============================================================
// 页面异常检测器
// 实时监听：验证弹窗、页面跳转、加载异常、DOM 突变
// 检测到异常 → 立即暂停自动化 → 弹窗提醒用户人工处理
// ============================================================

/**
 * 页面异常检测器
 * 全程监控页面环境，发现异常立即触发回调
 */
export class AnomalyDetector {
  constructor(options = {}) {
    this.onAnomaly = options.onAnomaly || (() => {});   // 异常回调
    this.onWarning = options.onWarning || (() => {});    // 警告回调
    this.onRecovery = options.onRecovery || (() => {});  // 恢复正常回调
    this.observers = [];
    this.anomalies = new Set();
    this.enabled = false;
    this._checkInterval = null;
    this._lastURL = location.href;
  }

  /** 启动所有监控 */
  start() {
    if (this.enabled) return;
    this.enabled = true;
    this._lastURL = location.href;

    this._watchCaptchaPopups();     // 验证码弹窗
    this._watchPageNavigation();    // 页面跳转
    this._watchDOMStability();      // DOM 稳定性
    this._watchNetworkErrors();     // 网络错误兜底
    this._startPeriodicCheck();     // 定期综合检查

    console.log('[达人邀约] 🔒 异常检测器已启动');
  }

  /** 停止所有监控 */
  stop() {
    this.enabled = false;
    this.observers.forEach(o => o.disconnect());
    this.observers = [];
    if (this._checkInterval) { clearInterval(this._checkInterval); this._checkInterval = null; }
    console.log('[达人邀约] 🔒 异常检测器已停止');
  }

  /** 当前是否有活跃异常 */
  hasAnomaly() {
    return this.anomalies.size > 0;
  }

  /** 获取异常列表 */
  getAnomalies() {
    return [...this.anomalies];
  }

  /** 内部：触发异常 */
  _triggerAnomaly(type, detail) {
    if (this.anomalies.has(type)) return; // 不重复触发
    this.anomalies.add(type);
    console.warn(`[达人邀约] ⚠️ 检测到异常 [${type}]:`, detail);
    this.onAnomaly({ type, detail, timestamp: Date.now() });
  }

  /** 内部：异常恢复 */
  _resolveAnomaly(type) {
    if (!this.anomalies.has(type)) return;
    this.anomalies.delete(type);
    console.log(`[达人邀约] ✅ 异常已恢复 [${type}]`);
    this.onRecovery({ type, timestamp: Date.now() });
  }

  // ==================== 1. 验证码/人机校验弹窗监控 ====================

  _watchCaptchaPopups() {
    // 使用 MutationObserver 监听 DOM 变化，检测验证弹窗
    const captchaKeywords = [
      '验证码', 'captcha', '滑块验证', '请完成验证',
      '拼图验证', 'are you a robot',
      '请先完成安全验证', '请按住滑块拖动',
    ];

    // 常见的验证组件选择器
    const captchaSelectors = [
      '[class*="captcha"]', '[id*="captcha"]',
      '[class*="verify"]', '[id*="verify"]',
      '[class*="robot"]', '[id*="robot"]',
      '[class*="slide-verify"]',
      '[class*="safety-verify"]',
      '.geetest_panel',           // 极验
      '.yidun_modal',             // 网易易盾
      '.captcha_modal',
      '[class*="antibot"]',
      '[class*="security-check"]',
      '[aria-label*="验证"]',
    ];

    const checkForCaptcha = () => {
      if (!this.enabled) return;

      // 只在弹窗/模态层内检查验证关键词（不全页扫描）
      const modalContainers = document.querySelectorAll(
        '[class*="modal"], [class*="dialog"], [class*="popup"], [class*="overlay"], ' +
        '[role="dialog"], [role="alertdialog"], ' +
        '.geetest_panel, .yidun_modal, .captcha_modal'
      );

      // 1. 先检查已知验证组件选择器（高置信度）
      for (const sel of captchaSelectors) {
        const el = document.querySelector(sel);
        if (el && el.offsetParent !== null) {
          this._triggerAnomaly('captcha_popup', `检测到验证组件: ${sel}`);
          return;
        }
      }

      // 2. 仅在可见弹窗元素内扫描关键词（避免全页扫描误触发）
      for (const container of modalContainers) {
        if (!container.offsetParent) continue; // 跳过不可见元素
        const text = container.innerText || '';
        for (const kw of captchaKeywords) {
          if (text.includes(kw)) {
            this._triggerAnomaly('captcha_popup', `弹窗包含"${kw}"`);
            return;
          }
        }
      }

      // 没检测到则尝试恢复
      this._resolveAnomaly('captcha_popup');
    };

    // MutationObserver
    const observer = new MutationObserver(() => {
      checkForCaptcha();
    });
    observer.observe(document.body || document.documentElement, {
      childList: true, subtree: true, attributes: true,
    });
    this.observers.push(observer);

    // 初始检查
    checkForCaptcha();
  }

  // ==================== 2. 页面 URL 跳转监控 ====================

  _watchPageNavigation() {
    // 监听 URL 变化（SPA 路由变化）
    const checkURL = () => {
      if (!this.enabled) return;
      const currentURL = location.href;
      if (currentURL !== this._lastURL) {
        const prevURL = this._lastURL;
        this._lastURL = currentURL;
        // URL 发生变化，检查是否离开了商家后台
        if (!currentURL.includes('buyin.jinritemai.com')) {
          this._triggerAnomaly('page_navigation', { from: prevURL, to: currentURL });
        } else {
          // 仍在商家后台内，但页面切换了
          this.onWarning({ type: 'page_changed', detail: { from: prevURL, to: currentURL } });
        }
      }
    };

    // 拦截 history API
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    const self = this;
    history.pushState = function () { origPush.apply(this, arguments); self._lastURL = location.href; };
    history.replaceState = function () { origReplace.apply(this, arguments); self._lastURL = location.href; };
    window.addEventListener('popstate', () => { self._lastURL = location.href; checkURL(); });
    window.addEventListener('hashchange', () => { self._lastURL = location.href; checkURL(); });
  }

  // ==================== 3. DOM 稳定性监控 ====================

  _watchDOMStability() {
    let errorCount = 0;

    // 监控页面 toast/弹窗/提示消息区域（不全页扫描）
    const errorKeywords = [
      '请求过于频繁', '操作太频繁', '请稍后再试', '账号异常',
      '已被限制', '发送失败',
    ];

    const observer = new MutationObserver(() => {
      if (!this.enabled) return;
      // 仅在 toast/提示/modal 元素内检查（不全页扫描）
      const messageContainers = document.querySelectorAll(
        '[class*="toast"], [class*="message"], [class*="notification"], ' +
        '[class*="alert"], [class*="notice"], [class*="tip"], [role="alert"]'
      );
      for (const container of messageContainers) {
        if (!container.offsetParent) continue;
        const text = container.innerText || '';
        for (const kw of errorKeywords) {
          if (text.includes(kw)) {
            errorCount++;
            if (errorCount >= 3) {
              this._triggerAnomaly('page_errors', `连续错误提示: "${kw}" (${errorCount}次)`);
            } else {
              this.onWarning({ type: 'page_error_hint', detail: `页面提示: "${kw}"` });
            }
            return;
          }
        }
      }
      // 缓慢衰减计数
      if (errorCount > 0 && Math.random() < 0.1) errorCount = Math.max(0, errorCount - 1);
    });
    observer.observe(document.body || document.documentElement, {
      childList: true, subtree: true, characterData: true,
    });
    this.observers.push(observer);
  }

  // ==================== 4. 网络异常兜底监控 ====================

  _watchNetworkErrors() {
    const self = this;
    let rateLimitCount = 0;

    // 监听全局未捕获错误中的网络相关
    window.addEventListener('error', (e) => {
      if (!self.enabled) return;
      const msg = e.message || '';
      if (msg.includes('NetworkError') || msg.includes('Failed to fetch')) {
        self.onWarning({ type: 'network_error', detail: { message: msg } });
      }
    });

    // 拦截 fetch 错误
    const origFetch = window.fetch;
    window.fetch = async function (...args) {
      try {
        const resp = await origFetch.apply(this, args);
        if (self.enabled) {
          // 检查 HTTP 状态码
          if (resp.status === 429) {
            rateLimitCount++;
            self._triggerAnomaly('rate_limited', { status: 429, count: rateLimitCount });
          } else if (resp.status >= 500) {
            self.onWarning({ type: 'server_error', detail: { status: resp.status } });
          } else if (resp.status === 403) {
            self._triggerAnomaly('access_denied', { status: 403 });
          }
          // 429 恢复：连续正常请求后复位
          if (resp.status === 200 && rateLimitCount > 0) {
            rateLimitCount = Math.max(0, rateLimitCount - 1);
            if (rateLimitCount === 0) self._resolveAnomaly('rate_limited');
          }
        }
        return resp;
      } catch (err) {
        if (self.enabled) {
          self.onWarning({ type: 'fetch_failed', detail: { error: err.message } });
        }
        throw err;
      }
    };
  }

  // ==================== 5. 定期综合检查 ====================

  _startPeriodicCheck() {
    this._checkInterval = setInterval(() => {
      if (!this.enabled) return;

      // 检查页面是否 crash
      if (!document.body || document.readyState === 'loading') {
        this._triggerAnomaly('page_unstable', { readyState: document.readyState });
      } else {
        this._resolveAnomaly('page_unstable');
      }

      // 检查是否被踢下线（常见：需要重新登录的弹窗）
      const reloginHints = ['请登录', '重新登录', '身份已过期', '请先登录', 'login expired'];
      for (const hint of reloginHints) {
        if (document.body?.innerText?.includes(hint)) {
          this._triggerAnomaly('session_expired', { hint });
          return;
        }
      }
      this._resolveAnomaly('session_expired');
    }, 3000);
  }
}
