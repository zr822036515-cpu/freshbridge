// ============================================================
// 自然人操作模拟器
// 模拟人类浏览行为：随机滚动、不规则停顿、自然操作节奏
// 不做假鼠标轨迹，不做验证码绕过
// ============================================================

import { sleep, rand } from './utils.js';

/**
 * 自然人操作模拟器
 * 用途：让批量操作节奏接近真人，避免过于机械化的统一节奏
 */
export class HumanEmulator {
  constructor(options = {}) {
    this.scrollSpeed = options.scrollSpeed || { min: 300, max: 800 };   // 滚动速度 ms
    this.pauseChance = options.pauseChance || 0.3;                       // 随机停顿概率
    this.pauseDuration = options.pauseDuration || { min: 500, max: 3000 }; // 停顿时长
    this.viewportMargin = options.viewportMargin || 0.2;                 // 滚动边界余量
    this.enabled = options.enabled !== false;
    this._aborted = false;
  }

  abort() { this._aborted = true; }
  reset() { this._aborted = false; }

  /**
   * 模拟自然滚动到目标元素
   * 分段滚动，速度不匀，中间随机停顿
   */
  async scrollToElement(el) {
    if (!el || !this.enabled) return;
    try {
      const rect = el.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - window.innerHeight * 0.35;

      // 分 2-4 段滚动
      const segments = rand(2, 5);
      const startY = window.scrollY;
      const totalDist = targetY - startY;

      for (let i = 0; i < segments; i++) {
        if (this._aborted) break;

        // 每段滚动距离不均匀
        const progress = (i + 1) / segments;
        const easeProgress = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        const segTarget = startY + totalDist * easeProgress;

        window.scrollTo({
          top: segTarget,
          behavior: 'smooth',
        });

        // 段间随机停顿
        await sleep(rand(this.scrollSpeed.min, this.scrollSpeed.max));

        // 以一定概率在中间位置额外停顿（模拟阅读）
        if (Math.random() < this.pauseChance) {
          await sleep(rand(this.pauseDuration.min, this.pauseDuration.max));
        }
      }
    } catch (e) {
      // 滚动失败不影响主流程
    }
  }

  /**
   * 模拟自然的微滚动（浏览时的小幅度随机滚动）
   */
  async microScroll() {
    if (!this.enabled || this._aborted) return;
    const dist = rand(-150, 150); // 小范围上下
    window.scrollBy({ top: dist, behavior: 'smooth' });
    await sleep(rand(400, 1200));
  }

  /**
   * 模拟自然的操作前停顿
   * 人类在操作前会有不确定的犹豫时间
   */
  async naturalPause(label = '') {
    if (!this.enabled || this._aborted) return;

    // 基础等待 + 随机波动 (±30%)
    const baseWait = rand(200, 600);
    const jitter = Math.round(baseWait * (Math.random() * 0.6 - 0.3));
    const totalWait = Math.max(100, baseWait + jitter);

    await sleep(totalWait);
  }

  /**
   * 模拟人类操作间隔（主要间隔，用于两次邀约之间）
   * 特征：时间不固定，有长有短，偶尔会有较长停顿
   */
  async humanInterval(dlyMin = 3000, dlyMax = 6000) {
    if (!this.enabled || this._aborted) return;

    const baseDelay = rand(dlyMin, dlyMax);

    // 偶尔插入较长停顿（约 15% 概率），模拟切换注意力
    if (Math.random() < 0.15) {
      const extraPause = rand(2000, 8000);
      await sleep(baseDelay + extraPause);
    } else {
      // 正常间隔也加入微调（±25%）
      const jitter = Math.round(baseDelay * (Math.random() * 0.5 - 0.25));
      await sleep(Math.max(dlyMin, baseDelay + jitter));
    }

    // 每隔几次操作做一次微滚动
    if (Math.random() < 0.25) {
      await this.microScroll();
    }
  }
}
