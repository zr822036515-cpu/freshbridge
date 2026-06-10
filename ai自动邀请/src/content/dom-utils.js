// ==================== DOM 操作工具 ====================

import { sleep } from './utils.js';

/** 在卡片元素中查找邀约按钮 */
export function findInviteBtn(cardEl) {
  if (!cardEl) return null;
  const btns = cardEl.querySelectorAll('button');
  for (const b of btns) {
    const t = b.textContent.trim();
    if (t === '邀约' || t === '联系' || t === '合作' || t.includes('邀约')) {
      if (b.offsetParent !== null) return b;
    }
  }
  return cardEl.querySelector('[class*="invite"],[class*="Invite"]');
}

/** 模拟点击事件 */
export function triggerClick(el) {
  if (!el) return;
  el.scrollIntoView({ block: 'center', behavior: 'instant' });
  ['mousedown', 'mouseup', 'click'].forEach(t =>
    el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true })));
  try { el.click(); } catch (e) { /* ignore */ }
}

/** 在整个文档中查找包含文本的元素卡片 */
export function findCardByNickname(nickname) {
  const cards = document.querySelectorAll('[class*="card"],[class*="row"],[class*="item"]');
  for (const c of cards) {
    if (c.textContent.includes(nickname)) return c;
  }
  return null;
}

/** 从页面 DOM 提取达人数据（API 拦截回退方案） */
import { parseNum } from './utils.js';

export function extractFromDOM(seen) {
  const cards = document.querySelectorAll('[class*="card"],[class*="row"],[class*="item"]');
  const results = [];
  for (const card of cards) {
    const nickEl = card.querySelector('[class*="nickname"],[class*="name"],[class*="title"]');
    if (!nickEl) continue;
    const nick = nickEl.textContent.trim();
    if (!nick || nick.length < 2) continue;

    // 尝试提取粉丝数
    const fansEl = card.querySelector('[class*="fans"],[class*="follower"]');
    const fans = fansEl ? parseNum(fansEl.textContent) : 0;

    // 用昵称作稳定ID
    let id = 'dom_' + simpleHash(nick);
    if (seen.has(id)) continue;

    results.push({ id, nickname: nick, fans, sales: 0, score: 0, category: '', _el: card, source: 'dom' });
  }
  return results;
}

function simpleHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}

/**
 * 从页面 DOM 提取可选类目
 * 优先精准定位「主推类目」区域，再兜底扫描
 */
export function extractCategoriesFromDOM() {
  const cats = new Set();

  // ====== 优先：精准定位「主推类目」区域 ======
  let categoryContainer = null;

  // 方法1: 找到"主推类目"标签 → 导航到表单项容器 → 找兄弟控件区
  const allElements = document.querySelectorAll('*');
  for (const el of allElements) {
    if (el.children.length !== 0 && el.childNodes.length > 3) continue;
    const text = (el.innerText || el.textContent || '').trim();
    if (text === '主推类目' || text === '类目' || text === '达人分类') {
      // 找到了标签元素。向上找到表单项行容器，然后找它的控件区
      const formItem = el.closest('[class*="form-item"], [class*="row"], [class*="col"]') || el.parentElement;
      if (formItem) {
        // 在 formItem 的兄弟中找控件区域，或者在父容器中搜索
        const parent = formItem.parentElement;
        if (parent) {
          // 优先找同级的控件容器（通常是 form-item-control）
          const control = parent.querySelector('[class*="control"], [class*="content"], [class*="body"]');
          if (control) {
            categoryContainer = control;
            console.log('[达人邀约] 🎯 通过标签+兄弟定位到控件区:', control.className?.slice(0, 60) || control.tagName);
            break;
          }
          // 备选：使用兄弟元素中不是标签的那个
          for (const child of parent.children) {
            if (child !== formItem && !child.contains(el)) {
              const childText = (child.innerText || child.textContent || '').trim();
              if (childText.length > 10 && !/主推|类目|分类/.test(childText.slice(0, 5))) {
                categoryContainer = child;
                console.log('[达人邀约] 🎯 通过兄弟定位到类目区:', child.className?.slice(0, 60) || child.tagName);
                break;
              }
            }
          }
          if (categoryContainer) break;
        }
      }
    }
  }

  // 方法2: 如果没找到，尝试直接定位类目控件容器
  if (!categoryContainer) {
    categoryContainer = document.querySelector(
      '[class*="mainCategory"], [class*="main-category"], [class*="primaryCategory"], ' +
      '[class*="anchorCategory"], [class*="creatorCategory"], ' +
      '[class*="category"]:not([class*="categoryItem"])'
    );
    if (categoryContainer) {
      console.log('[达人邀约] 🎯 通过选择器定位:', categoryContainer.className?.slice(0, 60) || categoryContainer.tagName);
    }
  }

  // 如果找到了容器，从容器内提取类目项
  if (categoryContainer) {
    // 提取容器内所有包含中文文本的叶子元素
    extractLeafText(categoryContainer, cats);
  }

  // ====== 兜底：全页扫描类目标签 ======
  if (cats.size === 0) {
    console.log('[达人邀约] ⚠️ 未找到类目容器，启用全页扫描');
    const tabSelectors = [
      '[class*="categoryTab"]', '[class*="catTab"]', '[class*="cateTab"]',
      '[class*="category"][class*="tab"]', '[role="tab"]',
      '.category-item', '.cat-item',
    ];
    for (const sel of tabSelectors) {
      document.querySelectorAll(sel).forEach(el => {
        const text = (el.innerText || el.textContent || '').trim();
        if (text && text.length >= 2 && text.length <= 6 && /^[一-龥]+$/.test(text) &&
            !/找|按|搜|选|达人|商品|人群|相似|主推|类目|全[部]|不限/.test(text)) {
          cats.add(text);
        }
      });
    }
  }

  const result = [...cats].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  if (result.length) {
    console.log('[达人邀约] 📋 提取到类目:', result.join(', '));
  } else {
    console.log('[达人邀约] ⚠️ 未提取到类目 — 可能需要检查页面结构');
  }
  return result;
}

/** 从容器中提取叶子元素文本作为类目名 */
function extractLeafText(container, cats) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT);
  const seen = new Set();
  while (walker.nextNode()) {
    const el = walker.currentNode;
    // 只看叶子元素（没有子元素或只有文本节点）
    if (el.children.length > 0) continue;
    const text = (el.innerText || el.textContent || '').trim();
    if (!text) continue;
    // 严格过滤
    if (text.length < 2 || text.length > 6) continue;
    if (!/^[一-龥]+$/.test(text)) continue;
    if (/全[部选]|不限|确定|重置|更多|展开|收起|主推|类目|分类|达人|商品|人群|相似|找|按|搜索|筛选|推荐|清空|请选择/.test(text)) continue;
    if (!seen.has(text)) { seen.add(text); cats.add(text); }
  }
}
