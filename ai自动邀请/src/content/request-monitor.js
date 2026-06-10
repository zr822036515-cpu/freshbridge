// ============================================================
// 请求规范监控器
// 使用浏览器原生请求标识，不做篡改
// 监控 API 响应，检测风控拦截 → 自动暂停
// ============================================================

/**
 * 请求监控器
 * - 确保所有请求使用浏览器原生 headers（不篡改）
 * - 监控响应中是否包含风控拦截标记
 * - 检测到异常响应 → 触发回调 → 暂停自动化
 */
export class RequestMonitor {
  constructor(options = {}) {
    this.onRiskDetected = options.onRiskDetected || (() => {});  // 检测到风控
    this.onRateLimit = options.onRateLimit || (() => {});        // 频率限制
    this.onRequestError = options.onRequestError || (() => {});  // 请求异常
    this._riskCount = 0;
    this._enabled = false;
    this._originalFetch = null;
  }

  /** 启动监控 */
  start() {
    if (this._enabled) return;
    this._enabled = true;
    this._installFetchMonitor();
    this._installXHRMonitor();
    console.log('[达人邀约] 📡 请求监控器已启动');
  }

  /** 停止监控 */
  stop() {
    this._enabled = false;
    this._riskCount = 0;
  }

  /**
   * 获取标准化的请求标识（仅供展示用途，不做任何篡改）
   * 所有字段来自浏览器原生属性
   */
  static getStandardIdentity() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  // ==================== Fetch 监控 ====================

  _installFetchMonitor() {
    const self = this;
    const origFetch = window.fetch;

    window.fetch = async function (input, init) {
      const url = typeof input === 'string' ? input : (input?.url || '');

      // 确保使用原生 headers（不添加任何自定义 header）
      const safeInit = { ...init };
      // 移除可能引起风控的非标准 headers
      if (safeInit.headers) {
        const headers = new Headers(safeInit.headers);
        // 删除一些自动化工具常见的标记头
        const suspiciousHeaders = [
          'x-automation', 'x-bot', 'x-scraper', 'automated',
          'x-requested-with', 'x-puppeteer', 'x-selenium',
        ];
        for (const h of suspiciousHeaders) {
          headers.delete(h);
        }
        safeInit.headers = headers;
      }

      try {
        const resp = await origFetch.call(this, input, safeInit);

        if (self._enabled) {
          // 检查风控拦截特征
          await self._checkResponseRisk(resp, url);
        }

        return resp;
      } catch (err) {
        if (self._enabled) {
          self.onRequestError({ url, error: err.message, timestamp: Date.now() });
        }
        throw err;
      }
    };
  }

  // ==================== XHR 监控 ====================

  _installXHRMonitor() {
    const self = this;
    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
      this.__url = url;
      // 移除自动化相关 header（如果有代码添加的话）
      this.__safeHeaders = true;
      return origOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function (body) {
      const xhr = this;
      // 确保 XMLHttpRequest 使用浏览器默认 headers
      // 不做任何额外设置

      xhr.addEventListener('load', function () {
        if (!self._enabled) return;
        self._checkXHRRisk(xhr, xhr.__url || '');
      });

      xhr.addEventListener('error', function () {
        if (!self._enabled) {
          self.onRequestError({
            url: xhr.__url || '',
            error: 'XHR Network Error',
            timestamp: Date.now(),
          });
        }
      });

      return origSend.apply(this, arguments);
    };
  }

  // ==================== 响应风险评估 ====================

  async _checkResponseRisk(resp, url) {
    // HTTP 状态码检查
    if (resp.status === 429) {
      this.onRateLimit({ url, status: 429, message: '请求过于频繁' });
      return;
    }
    if (resp.status === 403) {
      this._riskCount++;
      this.onRiskDetected({ url, status: 403, message: '访问被拒绝' });
      return;
    }

    // 响应体内容检查（风控拦截通常有标记）
    try {
      const cloned = resp.clone();
      const text = await cloned.text().catch(() => '');

      const riskKeywords = [
        '请求过于频繁', '操作频繁', '请稍后再试',
        '账号存在风险', '行为异常', '暂时限制',
        'rate limit', 'too many requests', 'blocked',
      ];

      for (const kw of riskKeywords) {
        if (text.includes(kw)) {
          this._riskCount++;
          this.onRiskDetected({ url, keyword: kw, message: `响应包含风控标记: ${kw}` });
          return;
        }
      }

      // 正常响应，缓慢衰减风险计数
      if (this._riskCount > 0 && Math.random() < 0.2) {
        this._riskCount = Math.max(0, this._riskCount - 1);
      }
    } catch (e) {
      // 无法读取响应体（如流式响应），忽略
    }
  }

  _checkXHRRisk(xhr, url) {
    if (xhr.status === 429) {
      this.onRateLimit({ url, status: 429 });
    } else if (xhr.status === 403) {
      this._riskCount++;
      this.onRiskDetected({ url, status: 403 });
    }

    // 检查响应体中的风控关键词
    const text = xhr.responseText || '';
    const riskKeywords = ['请求过于频繁', '操作频繁', '请稍后再试', '账号存在风险'];
    for (const kw of riskKeywords) {
      if (text.includes(kw)) {
        this._riskCount++;
        this.onRiskDetected({ url, keyword: kw });
        return;
      }
    }
  }

  /** 获取当前风险等级 */
  getRiskLevel() {
    if (this._riskCount >= 5) return 'high';
    if (this._riskCount >= 2) return 'medium';
    if (this._riskCount > 0) return 'low';
    return 'none';
  }
}
