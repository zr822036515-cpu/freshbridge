// ==================== 工具函数 ====================

/** Promise 延时 */
export const sleep = ms => new Promise(r => setTimeout(r, ms));

/** 随机整数 [a, b) */
export const rand = (a, b) => Math.floor(a + Math.random() * (b - a));

/** 设置 React 受控组件的值（dispatch native events） */
export function setReactValue(el, val) {
  const proto = el.tagName === 'TEXTAREA'
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter?.call(el, String(val));
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

/** 格式化大数字：1.2万 / 3.5亿 */
export function fmtNum(n) {
  if (n == null || isNaN(n)) return '-';
  n = Math.round(n);
  if (n >= 1e8) return (n / 1e8).toFixed(1) + '亿';
  if (n >= 1e4) return (n / 1e4).toFixed(1) + '万';
  return String(n);
}

/** 解析数字字符串 */
export function parseNum(v) {
  if (typeof v === 'number') return Math.round(v);
  if (typeof v === 'string') return Math.round(parseFloat(v.replace(/[^0-9.]/g, '')) || 0);
  return 0;
}

/** 简单字符串哈希 */
export function simpleHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}

/** 日期格式化 YYYY-MM-DD */
export function fmtDate(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/** 日期时间格式化 */
export function fmtDateTime(ts) {
  const d = new Date(ts);
  return `${fmtDate(ts)} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

/** 防抖 */
export function debounce(fn, ms = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/** HTML 转义 */
export function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
