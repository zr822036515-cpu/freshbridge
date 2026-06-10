// ==================== 邀约执行逻辑 ====================

import { sleep, rand, setReactValue } from './utils.js';
import { findInviteBtn, triggerClick, findCardByNickname } from './dom-utils.js';
import { HumanEmulator } from './human-emulator.js';

// 默认自然人操作模拟器
const defaultEmulator = new HumanEmulator();

/**
 * 渲染话术模板
 * @param {string} tpl - 模板字符串，支持 {变量名}
 * @param {Object} creator - 达人信息
 * @param {Object} product - 商品信息
 */
export function renderTemplate(tpl, creator, product = {}) {
  return tpl.replace(/\{(\w+)\}/g, (_, key) => {
    const vars = {
      '达人昵称': creator.nickname || '',
      '商品名': product.name || '好物',
      '佣金比例': product.commissionRate || '丰厚',
      '产品链接': product.link || '',
      '类目': product.category || creator.category || '',
      '福利政策': product.benefit || '',
      '店铺名': product.shopName || '',
    };
    return vars[key] !== undefined ? vars[key] : `{${key}}`;
  });
}

/**
 * 从模板列表中随机选择一条启用的模板
 */
export function pickTemplate(templates) {
  const enabled = (templates || []).filter(t => t.enabled !== false);
  if (!enabled.length) return null;
  return enabled[Math.floor(Math.random() * enabled.length)];
}

/**
 * 按分组随机选择模板
 */
export function pickTemplateByGroup(templates, group) {
  const pool = (templates || []).filter(t => t.enabled !== false && t.group === group);
  if (!pool.length) return pickTemplate(templates);
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * 邀请单个达人
 * @param {Object} creator - 达人对象
 * @param {string} message - 已渲染的话术
 * @param {Object} options - { dlyAfterClick, dlyAfterFill, dlyAfterSend }
 */
export async function inviteOne(creator, message, options = {}) {
  const {
    dlyAfterClick = [300, 600],
    dlyAfterFill = [200, 400],
    dlyAfterSend = [800, 1500],
    emulator = null,
  } = options;

  const emu = emulator || defaultEmulator;

  // 1. 查找或刷新卡片
  let card = creator._el;
  if (!card || !document.contains(card)) {
    card = findCardByNickname(creator.nickname);
    if (card) creator._el = card;
  }
  if (!card) return { ok: false, reason: '找不到达人卡片' };

  // 2. 自然滚动到卡片位置（分段滚动，模拟真人浏览）
  await emu.scrollToElement(card);
  await emu.naturalPause();

  // 3. 点击邀约按钮
  const btn = findInviteBtn(card);
  if (!btn) return { ok: false, reason: '找不到邀约按钮' };
  triggerClick(btn);

  // 4. 等待弹窗出现（模拟人类观察反应时间）
  await sleep(rand(...dlyAfterClick));
  const ta = document.querySelector('textarea,[class*="textarea"]');
  if (!ta) return { ok: false, reason: '弹窗未出现' };

  // 5. 填写话术（带自然停顿）
  await emu.naturalPause('before_fill');
  setReactValue(ta, message);
  await sleep(rand(...dlyAfterFill));

  // 6. 点击发送按钮（发送前短暂停顿，模拟人类检查消息）
  await emu.naturalPause('before_send');
  const sendBtn = findSendButton();
  if (sendBtn) triggerClick(sendBtn);

  // 7. 等待结果
  await sleep(rand(...dlyAfterSend));
  const toast = document.querySelector('[class*="toast"],[class*="message"],[class*="notification"]');
  if (toast) {
    const t = toast.textContent;
    if (t.includes('失败') || t.includes('错误') || t.includes('频繁') || t.includes('限制')) {
      return { ok: false, reason: t.slice(0, 50) };
    }
  }
  return { ok: true, reason: '' };
}

/** 查找发送/确认按钮 */
function findSendButton() {
  const texts = ['发送', '确认', '提交', '确定', 'Send', 'OK'];
  const btns = document.querySelectorAll('button');
  for (const b of btns) {
    if (texts.some(t => b.textContent.trim() === t || b.textContent.trim().includes(t))) {
      if (b.offsetParent !== null) return b;
    }
  }
  return document.querySelector('[class*="send"],[class*="submit"],[class*="confirm"]');
}

/**
 * 批量邀约主循环
 * @param {Object} config - { queue, target, templates, product, dlyMin, dlyMax, onProgress, onStatus, isAborted }
 */
export async function batchInvite(config) {
  const {
    queue = [],
    target = 0,
    templates = [],
    product = {},
    dlyMin = 3000,
    dlyMax = 6000,
    onProgress = () => {},
    onStatus = () => {},
    onLog = () => {},
    isAborted = () => false,
    hasAnomaly = () => false,
    blacklist = [],
    emulator = null,
  } = config;

  const emu = emulator || defaultEmulator;

  let ok = 0, ng = 0, sk = 0;
  const invited = new Set();
  let workQueue = [...queue];
  const total = target || workQueue.length;
  const blackSet = new Set(blacklist.map(String));

  onProgress(0, ok, ng, sk);

  while ((target === 0 || ok < target) && !isAborted()) {
    // 检查异常状态（验证弹窗/页面跳转/风控拦截）→ 立即暂停
    if (hasAnomaly()) {
      onStatus('⚠️ 检测到异常，自动暂停 — 请手动确认后继续');
      break;
    }

    // 过滤黑名单和已邀请
    workQueue = workQueue.filter(c => !blackSet.has(String(c.id)) && !invited.has(c.id));

    if (!workQueue.length) {
      onStatus('队列为空，等待数据...');
      break;
    }

    const creator = workQueue.shift();
    if (!creator || invited.has(creator.id) || blackSet.has(String(creator.id))) {
      sk++;
      continue;
    }

    onStatus(`正在邀约: ${creator.nickname}`);
    onProgress(
      target ? Math.round(ok / target * 100) : Math.round((ok + ng) / (total || 1) * 100),
      ok, ng, sk
    );

    const tpl = pickTemplate(templates);
    if (!tpl) {
      onStatus('无可用话术模板');
      break;
    }

    const msg = renderTemplate(tpl.content, creator, product);
    const result = await inviteOne(creator, msg, {
      dlyAfterClick: [300, 600],
      dlyAfterFill: [200, 400],
      dlyAfterSend: [800, 1500],
      emulator: emu,
    });

    invited.add(creator.id);
    result.ok ? ok++ : ng++;

    // 记录日志
    onLog({
      creatorId: creator.id,
      nickname: creator.nickname,
      fans: creator.fans,
      template: tpl.name,
      ok: result.ok,
      reason: result.reason,
      time: Date.now(),
    });

    // 自然人操作间隔（替代固定 sleep）
    if (!isAborted() && (target === 0 || ok < target)) {
      // 每次循环前再次检查异常
      if (hasAnomaly()) {
        onStatus('⚠️ 检测到异常，自动暂停');
        break;
      }
      await emu.humanInterval(dlyMin, dlyMax);
    }
  }

  const msg = isAborted() ? '⏹ 已停止' :
    target > 0 && ok >= target ? `✅ 已达标 ${target} 次` :
    '📭 队列已清空';
  return { ok, ng, sk, msg };
}
