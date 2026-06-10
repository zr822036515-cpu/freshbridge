// ============================================================
// 达人邀约助手 v1.0
// 参考小青苔架构：XHR拦截 + Shadow DOM UI + 批量邀约
// ============================================================

// ==================== 工具 ====================
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a,b) => Math.floor(a + Math.random()*(b-a));

// React受控组件设值（小青苔 setReactValue）
function setReactValue(el, val) {
  const proto = el.tagName === 'TEXTAREA'
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter?.call(el, String(val));
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

// 格式化数字
function fmtNum(n) { return n>=1e8? (n/1e8).toFixed(1)+'亿' : n>=1e4? (n/1e4).toFixed(1)+'万' : String(n); }
function parseNum(v) { return typeof v==='number'? Math.round(v) : typeof v==='string'? Math.round(parseFloat(v.replace(/[^0-9.]/g,''))||0) : 0; }

// ==================== API 拦截器（日志 + DOM 优先） ====================
const apiBuffer = [];
const seenURLs = new Set(); // 记录见过的 URL，避免重复日志

function tryExtract(json, url) {
  try {
    if (typeof json === 'string') json = JSON.parse(json);
    if (!json || typeof json !== 'object') return;
    const results = [];
    searchCreatorList(json, results, 0);
    if (results.length) {
      let added = 0;
      for (const c of results) {
        if (!STATE.seen.has(c.id)) { STATE.seen.add(c.id); apiBuffer.push(c); added++; }
      }
      if (added) console.log('[达人邀约] 📡 拦截', added, '位 |', url?.slice(0,80));
    }
  } catch(e) {}
}

function searchCreatorList(obj, out, depth) {
  if (!obj || depth > 5) return;
  if (Array.isArray(obj)) {
    if (obj.length>0 && typeof obj[0]==='object') {
      const f = obj[0];
      if (('fans_count' in f) || ('follower_count' in f) ||
          ('fans' in f && ('nickname' in f || 'nick_name' in f || 'author_name' in f))) {
        for (const item of obj) { const c = normalizeCreator(item); if (c) out.push(c); }
        return;
      }
    }
    for (const item of obj) searchCreatorList(item, out, depth+1);
    return;
  }
  if (typeof obj === 'object') {
    for (const k of ['data','list','records','items','result','author_list','creators','authors','creator_list']) {
      if (obj[k]) searchCreatorList(obj[k], out, depth+1);
    }
  }
}

function installInterceptor() {
  // XHR
  const oO=XMLHttpRequest.prototype.open, oS=XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(m,u){ this.__u=m; return oO.apply(this,arguments); };
  XMLHttpRequest.prototype.send = function(b){
    const x=this; x.addEventListener('load',function(){
      const u=x.__u||'';
      if (!seenURLs.has(u) && (u.includes('api')||u.includes('square')||u.includes('feed')||u.includes('author')||u.includes('creator')||u.includes('search'))) {
        seenURLs.add(u); console.log('[达人邀约] 🔍 XHR:', u.slice(0,100));
      }
      tryExtract(x.responseText||x.response, u);
    });
    return oS.apply(this,arguments);
  };
  // Fetch
  const oF=window.fetch;
  window.fetch=async function(i,init){
    const u=typeof i==='string'?i:(i?.url||''); const r=await oF.apply(this,arguments);
    try {
      if (!seenURLs.has(u) && (u.includes('api')||u.includes('square')||u.includes('feed')||u.includes('author')||u.includes('creator')||u.includes('search'))) {
        seenURLs.add(u); console.log('[达人邀约] 🔍 Fetch:', u.slice(0,100));
      }
      const c=r.clone(); tryExtract(await c.text(), u);
    }catch(e){}
    return r;
  };
  console.log('[达人邀约] ✅ 拦截器已安装（全量监听）');
}

function normalizeCreator(item) {
  const id = item.id || item.creator_id || item.author_id || item.user_id || item.uid;
  if (!id) return null;
  return {
    id: String(id), nickname: item.nickname||item.nick_name||item.name||item.author_name||item.user_name||'',
    fans: parseNum(item.fans_count??item.follower_count??item.fans??item.followers??0),
    sales: parseNum(item.gmv??item.sales??item.sales_amount??item.total_gmv??0),
    score: parseFloat(item.score??item.fulfill_score??item.rating??item.credit_score??0)||0,
    category: item.category??item.main_category??item.cat_name??'', _el: null,
  };
}

// ==================== 状态 ====================
const STATE = { seen: new Set(), list: [], cfg: null, running: false, abort: false, uid: Date.now().toString(36) };

// ==================== 邀约逻辑 ====================
function findInviteBtn(cardEl) {
  if (!cardEl) return null;
  // 按标签文字找邀约按钮
  const btns = cardEl.querySelectorAll('button');
  for (const b of btns) {
    const t = b.textContent.trim();
    if (t === '邀约' || t === '联系' || t === '合作' || t.includes('邀约')) {
      if (b.offsetParent !== null) return b;
    }
  }
  // 按类名找
  return cardEl.querySelector('[class*="invite"],[class*="Invite"]');
}

function triggerClick(el) {
  if (!el) return;
  el.scrollIntoView({ block: 'center', behavior: 'instant' });
  ['mousedown','mouseup','click'].forEach(t =>
    el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true })));
  try { el.click(); } catch(e) {}
}

async function inviteOne(creator) {
  // 获取或查找卡片元素
  let card = creator._el;
  if (!card || !document.contains(card)) {
    const cards = document.querySelectorAll('[class*="card"],[class*="row"],[class*="item"]');
    for (const c of cards) {
      if (c.textContent.includes(creator.nickname)) { card = c; creator._el = c; break; }
    }
  }
  if (!card) return { ok: false, reason: '找不到达人卡片' };

  // 点击邀约按钮
  const btn = findInviteBtn(card);
  if (!btn) return { ok: false, reason: '找不到邀约按钮' };
  triggerClick(btn);

  // 等弹窗
  await sleep(400, 700);
  const ta = document.querySelector('textarea,[class*="textarea"]');
  if (!ta) return { ok: false, reason: '弹窗未出现' };

  // 填话术
  await sleep(200, 400);
  const tpl = pickTemplate();
  if (!tpl) return { ok: false, reason: '无可用话术' };
  const msg = renderTpl(tpl.content, creator);
  setReactValue(ta, msg);
  await sleep(200, 400);

  // 点发送
  const sendBtn = document.querySelector(
    'button:contains("发送"),button:contains("确认"),button:contains("提交"),[class*="send"],[class*="submit"],[class*="confirm"]');
  if (sendBtn) triggerClick(sendBtn);

  // 等结果
  await sleep(800, 1500);
  const toast = document.querySelector('[class*="toast"],[class*="message"]');
  if (toast) {
    const t = toast.textContent;
    if (t.includes('失败')||t.includes('错误')||t.includes('频繁')) return { ok: false, reason: t.slice(0, 50) };
  }
  return { ok: true, reason: '' };
}

// 话术模板渲染
function pickTemplate() {
  const templates = STATE.cfg?.templates || [];
  const enabled = templates.filter(t => t.enabled !== false);
  if (!enabled.length) return null;
  return enabled[Math.floor(Math.random() * enabled.length)];
}

function renderTpl(tpl, creator) {
  return tpl.replace(/\{(\w+)\}/g, (_, key) => {
    const vars = {
      '达人昵称': creator.nickname || '',
      '商品名': STATE.cfg?.product?.name || '好物',
      '佣金比例': STATE.cfg?.product?.commissionRate || '丰厚',
    };
    return vars[key] !== undefined ? vars[key] : '';
  });
}

// 批量邀约主循环
async function batchInvite(target, dlyMin, dlyMax) {
  STATE.running = true; STATE.abort = false;
  let ok = 0, ng = 0, sk = 0;
  const invited = new Set();
  let queue = getSelected();
  if (!queue.length) queue = [...STATE.list];
  if (!queue.length) return { ok:0, ng:0, sk:0, msg:'无达人' };

  updateProg(0, ok, ng);
  const total = target || queue.length;

  while ((target === 0 || ok < target) && !STATE.abort) {
    // 队列空了就等API数据
    if (!queue.length) {
      flushBuffer();
      queue = STATE.list.filter(c => !invited.has(c.id));
      if (!queue.length) { updateStatus('等待API数据...'); await sleep(1500, 3000); continue; }
    }

    const c = queue.shift();
    if (!c || invited.has(c.id)) continue;

    updateStatus(`正在邀约: ${c.nickname}`);
    updateProg(target ? Math.round(ok/target*100) : Math.round((ok+ng)/(total||1)*100), ok, ng);

    const res = await inviteOne(c);
    invited.add(c.id);
    res.ok ? ok++ : ng++;
    markRowStatus(c.id, res.ok);

    // 记录
    chrome.runtime.sendMessage({
      action: 'LOG',
      record: { id: Date.now().toString(36)+Math.random().toString(36).slice(2,6),
        creatorId: c.id, nickname: c.nickname, fans: c.fans, ok: res.ok,
        reason: res.reason, time: Date.now() }
    });

    if (!STATE.abort && (target === 0 || ok < target)) {
      await sleep(rand(dlyMin, dlyMax));
    }
  }

  let msg = STATE.abort ? '已停止' : target>0&&ok>=target ? `已达标${target}次` : '无更多达人';
  msg += ` | ✅${ok} ❌${ng} ⏭${sk}`;
  STATE.running = false;
  return { ok, ng, sk, msg };
}

function flushBuffer() {
  const fresh = drainBuffer();
  for (const c of fresh) {
    if (!STATE.seen.has(c.id)) { STATE.seen.add(c.id); STATE.list.push(c); }
  }
  if (fresh.length) refreshTable();
}

// ==================== Shadow DOM UI ====================
let shadowRoot;

function $id(id) { return shadowRoot?.getElementById(id); }

function createUI() {
  if (shadowRoot) return true;
  const exist = document.getElementById('__dar_en_inviter__');
  if (exist) { shadowRoot = exist.shadowRoot; if (shadowRoot) return true; }
  if (!document.body) return false;

  const host = document.createElement('div');
  host.id = '__dar_en_inviter__';
  host.style.cssText = 'all:initial;position:fixed;z-index:2147483646;top:0;left:0;';
  shadowRoot = host.attachShadow({ mode: 'open' });

  shadowRoot.innerHTML = `<style>${CSS}</style>
<button class="fab" id="fab">🔥<b class="badge" id="badge">0</b></button>
<div class="panel" id="panel">
  <div class="hdr"><b>🔥 达人邀约助手</b><button class="close" id="close">✕</button></div>
  <div class="tbar">
    <button class="tbtn" id="selAll">☑ 全选</button>
    <button class="tbtn" id="selNone">☐ 取消</button>
    <span class="flex1"></span>
    <span class="tinfo" id="tinfo">等待数据...</span>
  </div>
  <div class="tblWrap"><table class="tbl"><thead><tr>
    <th class="cbCol"><input type="checkbox" id="cbAll"></th>
    <th>达人</th><th>粉丝</th><th>销售额</th><th>履约</th><th>类目</th><th>状态</th>
  </tr></thead><tbody id="tbody"></tbody></table></div>
  <div class="ftr">
    <div class="cfgRow">
      <span>邀约</span><input id="target" value="0" style="width:55px;text-align:center"><span>位 (0=全部)</span>
    </div>
    <button class="big orange" id="goBtn" disabled>📡 等待达人数据...</button>
    <button class="big red" id="stopBtn" style="display:none">⏹ 停止</button>
    <div class="prog" id="prog" style="display:none">
      <div class="progBar"><div class="progFill" id="progFill"></div></div>
      <div class="progTxt" id="progTxt"></div>
    </div>
    <div class="result" id="result"></div>
  </div>
</div>`;

  document.body.appendChild(host);
  bindUI();
  return true;
}

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}:host{pointer-events:none}:host>*{pointer-events:auto}
.fab{position:fixed;bottom:80px;right:20px;width:54px;height:54px;border-radius:50%;
  background:linear-gradient(135deg,#ff6b35,#f7931e);color:#fff;border:none;font-size:22px;
  cursor:pointer;box-shadow:0 4px 20px rgba(255,107,53,.5);z-index:2147483647;
  display:flex;align-items:center;justify-content:center;transition:all .2s}
.fab:hover{transform:scale(1.08)}
.badge{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;border-radius:9px;
  background:#ef4444;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;
  justify-content:center;padding:0 5px}
.panel{position:fixed;top:56px;right:16px;width:420px;max-height:calc(100vh-80px);background:#fff;
  border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,.18);z-index:2147483647;
  display:none;flex-direction:column;overflow:hidden;font:13px -apple-system,sans-serif;color:#1f2937}
.panel.open{display:flex}
.hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;
  background:linear-gradient(135deg,#ff6b35,#f7931e);color:#fff;font-size:15px;flex-shrink:0;font-weight:600}
.close{background:none;border:none;color:#fff;font-size:18px;cursor:pointer}
.tbar{display:flex;gap:6px;padding:8px 12px;border-bottom:1px solid #e5e7eb;flex-shrink:0;align-items:center}
.tbtn{padding:4px 10px;font-size:11px;border:1px solid #d1d5db;border-radius:3px;background:#fff;cursor:pointer}
.tbtn:hover{background:#f3f4f6}.flex1{flex:1}.tinfo{font-size:11px;color:#9ca3af}
.tblWrap{flex:1;overflow-y:auto}.tbl{width:100%;border-collapse:collapse;font-size:12px}
.tbl thead{position:sticky;top:0;z-index:2}
.tbl th{background:#fef2f2;padding:7px 5px;text-align:left;font-weight:600;color:#374151;
  border-bottom:1px solid #fde8df;font-size:11px;white-space:nowrap}
.tbl td{padding:5px;border-bottom:1px solid #f3f4f6}
.tbl tr:hover td{background:#fff8f5}.tbl tr.sel td{background:#fef2f2}
.cbCol{width:28px;text-align:center}.tbl input[type=checkbox]{accent-color:#ff6b35;width:13px;height:13px}
.tag{font-size:10px;padding:1px 5px;border-radius:3px}.tagOk{background:#d1fae5;color:#065f46}
.tagNg{background:#fee2e2;color:#991b1b}
.ftr{padding:10px 14px;background:#f9fafb;border-top:1px solid #e5e7eb;flex-shrink:0;
  display:flex;flex-direction:column;gap:8px}
.cfgRow{display:flex;align-items:center;gap:6px;font-size:12px}
.cfgRow input{padding:3px 6px;border:1px solid #d1d5db;border-radius:3px;font-size:12px}
.big{padding:10px 16px;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;width:100%}
.big:disabled{background:#fef2f2;color:#fca5a5;cursor:not-allowed;border:2px dashed #fecaca}
.orange{background:#ff6b35;color:#fff}.orange:hover{background:#e85d2c}
.red{background:#ef4444;color:#fff}.red:hover{background:#dc2626}
.prog{display:flex;flex-direction:column;gap:4px}.progBar{height:4px;background:#e5e7eb;border-radius:2px;overflow:hidden}
.progFill{height:100%;background:linear-gradient(90deg,#ff6b35,#f7931e);border-radius:2px;width:0;transition:width .3s}
.progTxt{font-size:11px;color:#6b7280;text-align:center}.result{font-size:12px;font-weight:500;text-align:center}
`;

function bindUI() {
  $id('fab').onclick = () => $id('panel').classList.toggle('open');
  $id('close').onclick = () => $id('panel').classList.remove('open');

  // 全选/取消
  $id('selAll').onclick = () => {
    $id('tbody').querySelectorAll('input[type=checkbox]').forEach(c => { c.checked=true; c.closest('tr')?.classList.add('sel'); });
    $id('cbAll').checked = true; updateGoBtn();
  };
  $id('selNone').onclick = () => {
    $id('tbody').querySelectorAll('input[type=checkbox]').forEach(c => { c.checked=false; c.closest('tr')?.classList.remove('sel'); });
    $id('cbAll').checked = false; updateGoBtn();
  };
  $id('cbAll').onchange = () => {
    const v = $id('cbAll').checked;
    $id('tbody').querySelectorAll('input[type=checkbox]').forEach(c => { c.checked=v; c.closest('tr')?.classList.toggle('sel',v); });
    updateGoBtn();
  };
  $id('tbody').addEventListener('change', e => {
    if (e.target.type !== 'checkbox') return;
    e.target.closest('tr')?.classList.toggle('sel', e.target.checked);
    const all = $id('tbody').querySelectorAll('input[type=checkbox]');
    $id('cbAll').checked = [...all].every(c => c.checked) && all.length > 0;
    updateGoBtn();
  });

  // 开始邀约
  $id('goBtn').onclick = async () => {
    if (STATE.running) return;
    const target = +($id('target').value) || 0;
    const cfg = await getConfig();
    STATE.cfg = cfg;
    const dly = [cfg.settings?.delayMin||2000, cfg.settings?.delayMax||3000];

    $id('goBtn').style.display='none'; $id('stopBtn').style.display='block';
    $id('prog').style.display='flex'; $id('result').textContent='';

    const r = await batchInvite(target, dly[0], dly[1]);

    $id('goBtn').style.display='block'; $id('stopBtn').style.display='none';
    $id('prog').style.display='none'; $id('result').textContent = r.msg;
    updateGoBtn();
  };
  $id('stopBtn').onclick = () => { STATE.abort = true; };
}

function getSelected() {
  const cbs = $id('tbody').querySelectorAll('input[type=checkbox]:checked');
  const ids = new Set([...cbs].map(c => c.dataset.id));
  return STATE.list.filter(c => ids.has(c.id));
}

function refreshTable() {
  const tbody = $id('tbody');
  tbody.innerHTML = STATE.list.map(c => `
    <tr data-id="${c.id}">
      <td class="cbCol"><input type="checkbox" data-id="${c.id}"></td>
      <td title="${c.nickname||''}">${c.nickname||'-'}</td>
      <td>${c.fans?fmtNum(c.fans):'-'}</td>
      <td>${c.sales?fmtNum(c.sales):'-'}</td>
      <td>${c.score?c.score.toFixed(1):'-'}</td>
      <td>${c.category||'-'}</td>
      <td></td>
    </tr>`).join('');
  $id('badge').textContent = STATE.list.length;
  $id('badge').style.display = STATE.list.length?'flex':'none';
  $id('tinfo').textContent = `已拦截 ${STATE.list.length} 位达人`;
  updateGoBtn();
}

function markRowStatus(id, ok) {
  const row = $id('tbody').querySelector(`tr[data-id="${id}"]`);
  if (!row) return;
  row.querySelector('td:last-child').innerHTML = ok
    ? '<span class="tag tagOk">已邀</span>'
    : '<span class="tag tagNg">失败</span>';
}

function extractFromDOM() {
  const cards = document.querySelectorAll('[class*="card"],[class*="row"],[class*="item"]');
  let added = 0;
  for (const card of cards) {
    const nickEl = card.querySelector('[class*="nickname"],[class*="name"],[class*="title"]');
    if (!nickEl) continue;
    const nick = nickEl.textContent.trim();
    if (!nick || nick.length < 2) continue;
    // 用昵称作稳定ID，避免重复
    const id = 'dom_'+simpleHash(nick);
    if (STATE.seen.has(id)) continue;
    STATE.seen.add(id);
    STATE.list.push({ id, nickname: nick, fans:0, sales:0, score:0, category:'', _el: card });
    added++;
  }
  if (added) {
    console.log('[达人邀约] 📋 DOM提取:', added, '位 (共', STATE.list.length, '位)');
    refreshTable();
  }
}

function simpleHash(s) { let h=0; for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;} return Math.abs(h).toString(36); }

function updateGoBtn() {
  const sel = getSelected().length;
  const btn = $id('goBtn');
  if (!STATE.list.length) {
    btn.disabled = true;
    btn.textContent = '📡 等待达人数据...';
  } else {
    btn.disabled = STATE.running;
    btn.textContent = sel > 0 ? `🚀 批量邀约 (${sel})` : `🚀 邀约全部 (${STATE.list.length})`;
  }
}

function updateProg(pct, ok, ng) {
  $id('progFill').style.width = pct+'%';
  $id('progTxt').textContent = `✅${ok} ❌${ng}`;
}
function updateStatus(txt) { $id('progTxt').textContent = txt; }

// ==================== 配置 ====================
async function getConfig() {
  return new Promise(resolve => chrome.storage.local.get(null, resolve));
}

const DEFAULTS = {
  filter: {},
  templates: [
    { id:'1', name:'默认', content:'Hi {达人昵称}，【{商品名}】正在找达人合作，佣金{佣金比例}%，期待合作！', enabled:true },
    { id:'2', name:'简洁', content:'{达人昵称}你好，品牌好物【{商品名}】诚邀合作，高佣金高转化~', enabled:true },
  ],
  product: { name:'', commissionRate:'' },
  settings: { delayMin:2000, delayMax:3000 },
  history: [], stats: {},
};

// ==================== 初始化 ====================
async function init() {
  // 1. 加载/初始化配置
  let cfg = await getConfig();
  if (!cfg || !cfg.templates) {
    await new Promise(r => chrome.storage.local.set(DEFAULTS, r));
    cfg = DEFAULTS;
  }
  STATE.cfg = cfg;

  // 2. 安装API拦截器
  installInterceptor();

  // 3. 创建UI
  let tries = 0;
  while (!createUI() && tries < 20) { await sleep(300); tries++; }
  console.log('[达人邀约] ✅ UI已创建, 重试:', tries);

  // 4. 定时刷新缓冲区 + DOM 回退
  setInterval(() => {
    flushBuffer();
    // 如果 API 拦截没数据，尝试从 DOM 提取
    if (STATE.list.length === 0) extractFromDOM();
  }, 2000);

  // 立即尝试一次 DOM 提取
  extractFromDOM();

  // 5. 监听配置变更
  chrome.storage.onChanged.addListener(async () => {
    STATE.cfg = await getConfig();
  });

  console.log('[达人邀约] ✅ 初始化完成');
}

function boot() {
  if (!document.body) { setTimeout(boot, 300); return; }
  init().catch(e => console.error('[达人邀约] 初始化失败:', e));
}
boot();
