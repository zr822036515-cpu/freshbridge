(function(){const p=t=>new Promise(e=>setTimeout(e,t)),z=(t,e)=>Math.floor(t+Math.random()*(e-t));function B(t,e){var r;const o=t.tagName==="TEXTAREA"?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype,n=(r=Object.getOwnPropertyDescriptor(o,"value"))==null?void 0:r.set;n==null||n.call(t,String(e)),t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function k(t){return t>=1e8?(t/1e8).toFixed(1)+"亿":t>=1e4?(t/1e4).toFixed(1)+"万":String(t)}function w(t){return typeof t=="number"?Math.round(t):typeof t=="string"?Math.round(parseFloat(t.replace(/[^0-9.]/g,""))||0):0}const I=[],x=new Set;function v(t,e){try{if(typeof t=="string"&&(t=JSON.parse(t)),!t||typeof t!="object")return;const o=[];if(y(t,o,0),o.length){let n=0;for(const r of o)a.seen.has(r.id)||(a.seen.add(r.id),I.push(r),n++);n&&console.log("[达人邀约] 📡 拦截",n,"位 |",e==null?void 0:e.slice(0,80))}}catch{}}function y(t,e,o){if(!(!t||o>5)){if(Array.isArray(t)){if(t.length>0&&typeof t[0]=="object"){const n=t[0];if("fans_count"in n||"follower_count"in n||"fans"in n&&("nickname"in n||"nick_name"in n||"author_name"in n)){for(const r of t){const s=F(r);s&&e.push(s)}return}}for(const n of t)y(n,e,o+1);return}if(typeof t=="object")for(const n of["data","list","records","items","result","author_list","creators","authors","creator_list"])t[n]&&y(t[n],e,o+1)}}function R(){const t=XMLHttpRequest.prototype.open,e=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.open=function(n,r){return this.__u=n,t.apply(this,arguments)},XMLHttpRequest.prototype.send=function(n){const r=this;return r.addEventListener("load",function(){const s=r.__u||"";!x.has(s)&&(s.includes("api")||s.includes("square")||s.includes("feed")||s.includes("author")||s.includes("creator")||s.includes("search"))&&(x.add(s),console.log("[达人邀约] 🔍 XHR:",s.slice(0,100))),v(r.responseText||r.response,s)}),e.apply(this,arguments)};const o=window.fetch;window.fetch=async function(n,r){const s=typeof n=="string"?n:(n==null?void 0:n.url)||"",l=await o.apply(this,arguments);try{!x.has(s)&&(s.includes("api")||s.includes("square")||s.includes("feed")||s.includes("author")||s.includes("creator")||s.includes("search"))&&(x.add(s),console.log("[达人邀约] 🔍 Fetch:",s.slice(0,100)));const c=l.clone();v(await c.text(),s)}catch{}return l},console.log("[达人邀约] ✅ 拦截器已安装（全量监听）")}function F(t){const e=t.id||t.creator_id||t.author_id||t.user_id||t.uid;return e?{id:String(e),nickname:t.nickname||t.nick_name||t.name||t.author_name||t.user_name||"",fans:w(t.fans_count??t.follower_count??t.fans??t.followers??0),sales:w(t.gmv??t.sales??t.sales_amount??t.total_gmv??0),score:parseFloat(t.score??t.fulfill_score??t.rating??t.credit_score??0)||0,category:t.category??t.main_category??t.cat_name??"",_el:null}:null}const a={seen:new Set,list:[],cfg:null,running:!1,abort:!1,uid:Date.now().toString(36)};function H(t){if(!t)return null;const e=t.querySelectorAll("button");for(const o of e){const n=o.textContent.trim();if((n==="邀约"||n==="联系"||n==="合作"||n.includes("邀约"))&&o.offsetParent!==null)return o}return t.querySelector('[class*="invite"],[class*="Invite"]')}function _(t){if(t){t.scrollIntoView({block:"center",behavior:"instant"}),["mousedown","mouseup","click"].forEach(e=>t.dispatchEvent(new MouseEvent(e,{bubbles:!0,cancelable:!0})));try{t.click()}catch{}}}async function O(t){let e=t._el;if(!e||!document.contains(e)){const d=document.querySelectorAll('[class*="card"],[class*="row"],[class*="item"]');for(const g of d)if(g.textContent.includes(t.nickname)){e=g,t._el=g;break}}if(!e)return{ok:!1,reason:"找不到达人卡片"};const o=H(e);if(!o)return{ok:!1,reason:"找不到邀约按钮"};_(o),await p(400);const n=document.querySelector('textarea,[class*="textarea"]');if(!n)return{ok:!1,reason:"弹窗未出现"};await p(200);const r=N();if(!r)return{ok:!1,reason:"无可用话术"};const s=D(r.content,t);B(n,s),await p(200);const l=document.querySelector('button:contains("发送"),button:contains("确认"),button:contains("提交"),[class*="send"],[class*="submit"],[class*="confirm"]');l&&_(l),await p(800);const c=document.querySelector('[class*="toast"],[class*="message"]');if(c){const d=c.textContent;if(d.includes("失败")||d.includes("错误")||d.includes("频繁"))return{ok:!1,reason:d.slice(0,50)}}return{ok:!0,reason:""}}function N(){var o;const e=(((o=a.cfg)==null?void 0:o.templates)||[]).filter(n=>n.enabled!==!1);return e.length?e[Math.floor(Math.random()*e.length)]:null}function D(t,e){return t.replace(/\{(\w+)\}/g,(o,n)=>{var s,l,c,d;const r={达人昵称:e.nickname||"",商品名:((l=(s=a.cfg)==null?void 0:s.product)==null?void 0:l.name)||"好物",佣金比例:((d=(c=a.cfg)==null?void 0:c.product)==null?void 0:d.commissionRate)||"丰厚"};return r[n]!==void 0?r[n]:""})}async function P(t,e,o){a.running=!0,a.abort=!1;let n=0,r=0,s=0;const l=new Set;let c=q();if(c.length||(c=[...a.list]),!c.length)return{ok:0,ng:0,sk:0,msg:"无达人"};M(0,n,r);const d=t||c.length;for(;(t===0||n<t)&&!a.abort;){if(!c.length&&(T(),c=a.list.filter($=>!l.has($.id)),!c.length)){A("等待API数据..."),await p(1500);continue}const f=c.shift();if(!f||l.has(f.id))continue;A(`正在邀约: ${f.nickname}`),M(Math.round(t?n/t*100:(n+r)/(d||1)*100),n,r);const h=await O(f);l.add(f.id),h.ok?n++:r++,V(f.id,h.ok),chrome.runtime.sendMessage({action:"LOG",record:{id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),creatorId:f.id,nickname:f.nickname,fans:f.fans,ok:h.ok,reason:h.reason,time:Date.now()}}),!a.abort&&(t===0||n<t)&&await p(z(e,o))}let g=a.abort?"已停止":t>0&&n>=t?`已达标${t}次`:"无更多达人";return g+=` | ✅${n} ❌${r} ⏭${s}`,a.running=!1,{ok:n,ng:r,sk:s,msg:g}}function T(){const t=drainBuffer();for(const e of t)a.seen.has(e.id)||(a.seen.add(e.id),a.list.push(e));t.length&&L()}let u;function i(t){return u==null?void 0:u.getElementById(t)}function X(){if(u)return!0;const t=document.getElementById("__dar_en_inviter__");if(t&&(u=t.shadowRoot,u))return!0;if(!document.body)return!1;const e=document.createElement("div");return e.id="__dar_en_inviter__",e.style.cssText="all:initial;position:fixed;z-index:2147483646;top:0;left:0;",u=e.attachShadow({mode:"open"}),u.innerHTML=`<style>${U}</style>
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
</div>`,document.body.appendChild(e),G(),!0}const U=`
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
`;function G(){i("fab").onclick=()=>i("panel").classList.toggle("open"),i("close").onclick=()=>i("panel").classList.remove("open"),i("selAll").onclick=()=>{i("tbody").querySelectorAll("input[type=checkbox]").forEach(t=>{var e;t.checked=!0,(e=t.closest("tr"))==null||e.classList.add("sel")}),i("cbAll").checked=!0,b()},i("selNone").onclick=()=>{i("tbody").querySelectorAll("input[type=checkbox]").forEach(t=>{var e;t.checked=!1,(e=t.closest("tr"))==null||e.classList.remove("sel")}),i("cbAll").checked=!1,b()},i("cbAll").onchange=()=>{const t=i("cbAll").checked;i("tbody").querySelectorAll("input[type=checkbox]").forEach(e=>{var o;e.checked=t,(o=e.closest("tr"))==null||o.classList.toggle("sel",t)}),b()},i("tbody").addEventListener("change",t=>{var o;if(t.target.type!=="checkbox")return;(o=t.target.closest("tr"))==null||o.classList.toggle("sel",t.target.checked);const e=i("tbody").querySelectorAll("input[type=checkbox]");i("cbAll").checked=[...e].every(n=>n.checked)&&e.length>0,b()}),i("goBtn").onclick=async()=>{var r,s;if(a.running)return;const t=+i("target").value||0,e=await m();a.cfg=e;const o=[((r=e.settings)==null?void 0:r.delayMin)||2e3,((s=e.settings)==null?void 0:s.delayMax)||3e3];i("goBtn").style.display="none",i("stopBtn").style.display="block",i("prog").style.display="flex",i("result").textContent="";const n=await P(t,o[0],o[1]);i("goBtn").style.display="block",i("stopBtn").style.display="none",i("prog").style.display="none",i("result").textContent=n.msg,b()},i("stopBtn").onclick=()=>{a.abort=!0}}function q(){const t=i("tbody").querySelectorAll("input[type=checkbox]:checked"),e=new Set([...t].map(o=>o.dataset.id));return a.list.filter(o=>e.has(o.id))}function L(){const t=i("tbody");t.innerHTML=a.list.map(e=>`
    <tr data-id="${e.id}">
      <td class="cbCol"><input type="checkbox" data-id="${e.id}"></td>
      <td title="${e.nickname||""}">${e.nickname||"-"}</td>
      <td>${e.fans?k(e.fans):"-"}</td>
      <td>${e.sales?k(e.sales):"-"}</td>
      <td>${e.score?e.score.toFixed(1):"-"}</td>
      <td>${e.category||"-"}</td>
      <td></td>
    </tr>`).join(""),i("badge").textContent=a.list.length,i("badge").style.display=a.list.length?"flex":"none",i("tinfo").textContent=`已拦截 ${a.list.length} 位达人`,b()}function V(t,e){const o=i("tbody").querySelector(`tr[data-id="${t}"]`);o&&(o.querySelector("td:last-child").innerHTML=e?'<span class="tag tagOk">已邀</span>':'<span class="tag tagNg">失败</span>')}function S(){const t=document.querySelectorAll('[class*="card"],[class*="row"],[class*="item"]');let e=0;for(const o of t){const n=o.querySelector('[class*="nickname"],[class*="name"],[class*="title"]');if(!n)continue;const r=n.textContent.trim();if(!r||r.length<2)continue;const s="dom_"+W(r);a.seen.has(s)||(a.seen.add(s),a.list.push({id:s,nickname:r,fans:0,sales:0,score:0,category:"",_el:o}),e++)}e&&(console.log("[达人邀约] 📋 DOM提取:",e,"位 (共",a.list.length,"位)"),L())}function W(t){let e=0;for(let o=0;o<t.length;o++)e=(e<<5)-e+t.charCodeAt(o),e|=0;return Math.abs(e).toString(36)}function b(){const t=q().length,e=i("goBtn");a.list.length?(e.disabled=a.running,e.textContent=t>0?`🚀 批量邀约 (${t})`:`🚀 邀约全部 (${a.list.length})`):(e.disabled=!0,e.textContent="📡 等待达人数据...")}function M(t,e,o){i("progFill").style.width=t+"%",i("progTxt").textContent=`✅${e} ❌${o}`}function A(t){i("progTxt").textContent=t}async function m(){return new Promise(t=>chrome.storage.local.get(null,t))}const C={filter:{},templates:[{id:"1",name:"默认",content:"Hi {达人昵称}，【{商品名}】正在找达人合作，佣金{佣金比例}%，期待合作！",enabled:!0},{id:"2",name:"简洁",content:"{达人昵称}你好，品牌好物【{商品名}】诚邀合作，高佣金高转化~",enabled:!0}],product:{name:"",commissionRate:""},settings:{delayMin:2e3,delayMax:3e3},history:[],stats:{}};async function J(){let t=await m();(!t||!t.templates)&&(await new Promise(o=>chrome.storage.local.set(C,o)),t=C),a.cfg=t,R();let e=0;for(;!X()&&e<20;)await p(300),e++;console.log("[达人邀约] ✅ UI已创建, 重试:",e),setInterval(()=>{T(),a.list.length===0&&S()},2e3),S(),chrome.storage.onChanged.addListener(async()=>{a.cfg=await m()}),console.log("[达人邀约] ✅ 初始化完成")}function E(){if(!document.body){setTimeout(E,300);return}J().catch(t=>console.error("[达人邀约] 初始化失败:",t))}E();
})()
