// ============================================================
// 分时段定时调度器
// 在用户设定的时段窗口内自动执行任务
// 异常场景（弹窗/验证/页面跳转）→ 自动终止 → 等待人工
// ============================================================

/**
 * 任务调度器
 * 支持设置可执行时段，在窗口内自动运行，异常时自动停止
 */
export class TaskScheduler {
  constructor(options = {}) {
    this.timeWindows = options.timeWindows || [];   // [{ start: '02:00', end: '06:00' }]
    this.onWindowEnter = options.onWindowEnter || (() => {});  // 进入窗口
    this.onWindowExit = options.onWindowExit || (() => {});    // 离开窗口
    this.onTick = options.onTick || (() => {});                // 每秒滴答
    this.isAnomaly = options.isAnomaly || (() => false);      // 检查是否有异常
    this._timer = null;
    this._inWindow = false;
    this._running = false;
    this._currentTaskId = null;
  }

  /** 启动调度器 */
  start() {
    if (this._running) return;
    this._running = true;
    this._checkWindow();
    this._timer = setInterval(() => this._checkWindow(), 30000); // 每 30 秒检查一次
    console.log('[达人邀约] ⏰ 定时调度器已启动，时段:', this.timeWindows);
  }

  /** 停止调度器 */
  stop() {
    this._running = false;
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    this._inWindow = false;
    console.log('[达人邀约] ⏰ 定时调度器已停止');
  }

  /** 当前是否在可执行窗口内 */
  isInWindow() {
    return this._inWindow;
  }

  /** 设置时段窗口 */
  setTimeWindows(windows) {
    this.timeWindows = windows || [];
    this._checkWindow();
  }

  /** 检查当前是否在允许的时段内 */
  _checkWindow() {
    if (!this._running) return;

    // 如果存在异常，不执行任何调度操作
    if (this.isAnomaly()) {
      if (this._inWindow) {
        this._inWindow = false;
        this.onWindowExit({ reason: 'anomaly_detected' });
      }
      return;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentDay = now.getDay(); // 0=周日

    let inAnyWindow = false;

    if (!this.timeWindows || this.timeWindows.length === 0) {
      // 无窗口限制 = 全天可执行（但需手动启动）
      inAnyWindow = false; // 无配置时不自动启动
    } else {
      for (const win of this.timeWindows) {
        // 检查星期过滤
        if (win.days && win.days.length > 0) {
          if (!win.days.includes(currentDay)) continue;
        }

        const startMin = this._timeToMinutes(win.start);
        const endMin = this._timeToMinutes(win.end);

        if (startMin <= endMin) {
          // 正常窗口（如 02:00-06:00）
          if (currentMinutes >= startMin && currentMinutes < endMin) {
            inAnyWindow = true;
            break;
          }
        } else {
          // 跨天窗口（如 22:00-02:00）
          if (currentMinutes >= startMin || currentMinutes < endMin) {
            inAnyWindow = true;
            break;
          }
        }
      }
    }

    // 状态变化处理
    if (inAnyWindow && !this._inWindow) {
      this._inWindow = true;
      console.log('[达人邀约] ⏰ 进入执行窗口');
      this.onWindowEnter({ time: now.toLocaleTimeString() });
    } else if (!inAnyWindow && this._inWindow) {
      this._inWindow = false;
      console.log('[达人邀约] ⏰ 离开执行窗口');
      this.onWindowExit({ reason: 'out_of_window' });
    }

    // 滴答
    this.onTick({
      inWindow: this._inWindow,
      time: now.toLocaleTimeString(),
      nextCheck: new Date(now.getTime() + 30000).toLocaleTimeString(),
    });
  }

  _timeToMinutes(timeStr) {
    const [h, m] = (timeStr || '0:00').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }
}
