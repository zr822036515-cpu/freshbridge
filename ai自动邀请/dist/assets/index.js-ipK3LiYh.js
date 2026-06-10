(function(){const z=t=>new Promise(e=>setTimeout(e,t)),R=(t,e)=>Math.floor(t+Math.random()*(e-t));function Xt(t,e){var a;const n=t.tagName==="TEXTAREA"?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype,s=(a=Object.getOwnPropertyDescriptor(n,"value"))==null?void 0:a.set;s==null||s.call(t,String(e)),t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function at(t){return t==null||isNaN(t)?"-":(t=Math.round(t),t>=1e8?(t/1e8).toFixed(1)+"亿":t>=1e4?(t/1e4).toFixed(1)+"万":String(t))}function V(t){return typeof t=="number"?Math.round(t):typeof t=="string"?Math.round(parseFloat(t.replace(/[^0-9.]/g,""))||0):0}function Ut(t){const e=new Date(t);return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function qt(t){const e=new Date(t);return`${Ut(t)} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}function Kt(t,e=300){let n;return(...s)=>{clearTimeout(n),n=setTimeout(()=>t(...s),e)}}function w(t){const e=document.createElement("div");return e.textContent=t||"",e.innerHTML}function Vt(t){const e=t.id||t.creator_id||t.author_id||t.user_id||t.uid;return e?(Yt(t),{id:String(e),nickname:t.nickname||t.nick_name||t.name||t.author_name||t.user_name||"",avatar:t.avatar||t.avatar_url||t.avatar_thumb||"",fans:V(t.fans_count??t.follower_count??t.fans??t.followers??0),sales:V(t.settled_gmv??t.gmv_30d??t.gmv??t.sales??t.sales_amount??t.total_gmv??0),orders:V(t.order_cnt_30d??t.order_count??t.orders??t.sales_count??0),score:parseFloat(t.score??t.fulfill_score??t.rating??t.credit_score??t.reputation_score??0)||0,commissionRate:parseFloat(t.commission_rate??t.commission??t.expected_commission??0)||0,category:Jt(t),contentTypes:t.content_type??t.content_types??"",genderRatio:t.gender_ratio??t.gender??"",ageDistribution:t.age_distribution??t.age??"",cityDistribution:t.city_distribution??t.city??"",fulfillmentRate:parseFloat(t.fulfillment_rate??t.fulfill_rate??0)||0,badRate:parseFloat(t.bad_rate??t.negative_rate??t.refund_rate??0)||0,isPureCommission:t.is_pure_commission??t.pure_commission??!1,pitFee:V(t.pit_fee??t.pit_price??t.fixed_fee??0),acceptsExchange:t.accepts_exchange??t.accept_exchange??!1,hasCart:t.has_cart??t.cart_stable??!0,accountWeight:parseFloat(t.weight??t.account_weight??t.author_weight??0)||0,_el:t._el||null,source:t.source||"api"}):null}function dt(t){return t.acceptsExchange?"置换":t.fans>=1e6||t.sales>=1e7?"头部":t.fans>=1e5||t.sales>=1e6?"中腰部":"素人"}const $t={头部:{bg:"#fef3c7",color:"#92400e",label:"头部达人"},中腰部:{bg:"#dbeafe",color:"#1e40af",label:"中腰部达人"},素人:{bg:"#f3f4f6",color:"#374151",label:"素人达人"},置换:{bg:"#d1fae5",color:"#065f46",label:"置换达人"}};function Jt(t){const e=[t.category,t.categories,t.cat_name,t.cat_names,t.main_category,t.main_cat,t.product_categories,t.anchor_category,t.author_category,t.creator_category,t.kol_category,t.shop_category,t.goods_category,t.industry,t.vertical,t.industry_name,t.tag,t.tags,t.labels,t.cat,t.cate,t.cate_name,t.category_name,t.category_list,t.cat_list,t.first_category,t.second_category,t.third_category];for(const n of e)if(!(n==null||n==="")){if(Array.isArray(n)){const s=n.map(a=>typeof a=="string"?a:a.name||a.cat_name||a.category_name||a.label||a.value||"").filter(Boolean);if(s.length)return s.join(",");continue}if(typeof n=="string"&&n.trim())return n.trim();if(typeof n=="number"&&n>0)return String(n)}for(const n of Object.keys(t)){const s=n.toLowerCase();if((s.includes("cat")||s.includes("cate")||s.includes("industry")||s.includes("vertical")||s.includes("class"))&&typeof t[n]=="string"&&t[n].trim())return console.log("[达人邀约] 🔍 类目兜底匹配:",n,"→",t[n]),t[n].trim()}return""}let K=0;function Yt(t){if(K++,K%30!==1)return;const e=Object.keys(t).filter(n=>n.toLowerCase().includes("cat")||n.toLowerCase().includes("cate")||n.toLowerCase().includes("industry")||n.toLowerCase().includes("vertical")||n.toLowerCase().includes("tag")||n.toLowerCase().includes("label")||n.toLowerCase().includes("class")||n.toLowerCase().includes("field"));console.log("[达人邀约] 📋 #"+K+" API原始字段名:",Object.keys(t).join(", ")),e.length?console.log("[达人邀约] 📋 #"+K+" 类目相关字段:",e.map(n=>`${n}=${JSON.stringify(t[n]).slice(0,100)}`).join(" | ")):console.log("[达人邀约] 📋 #"+K+" ⚠️ 无类目相关字段！请查看上方字段名")}function Wt(t,e){if(!e)return!0;const n=e;if(n.fansMin!=null&&t.fans<n.fansMin||n.fansMax!=null&&t.fans>n.fansMax||n.salesMin!=null&&t.sales<n.salesMin||n.salesMax!=null&&t.sales>n.salesMax||n.scoreMin!=null&&t.score<n.scoreMin||n.scoreMax!=null&&t.score>n.scoreMax||n.commissionMin!=null&&t.commissionRate<n.commissionMin||n.commissionMax!=null&&t.commissionRate>n.commissionMax||n.ordersMin!=null&&t.orders<n.ordersMin)return!1;if(n.category){const s=(t.category||"").toLowerCase(),a=n.category.toLowerCase();if(!s.includes(a))return!1}if(n.tier&&dt(t)!==n.tier||n.pureCommissionOnly&&!t.isPureCommission)return!1;if(n.keyword){const s=n.keyword.toLowerCase();if(!t.nickname.toLowerCase().includes(s))return!1}return!0}const Z=new Set;function nt(t,e,n){if(!(!t||n>5)){if(Array.isArray(t)){if(t.length>0&&typeof t[0]=="object"&&Gt(t)){for(const s of t){const a=Vt(s);a&&a.nickname&&a.fans>0&&e.push(a)}return}for(const s of t)nt(s,e,n+1);return}if(typeof t=="object"){const s=["author_list","creators","authors","creator_list","kol_list","talent_list","anchor_list","influencer_list"];for(const a of s)t[a]&&nt(t[a],e,n+1);if(n<=2)for(const a of["data","list","records","items","result","rows"])t[a]&&nt(t[a],e,n+1)}}}function Gt(t){if(!t.length)return!1;const e=t[0];if(typeof e!="object"||!("fans_count"in e||"follower_count"in e||"fans"in e||"followers"in e))return!1;const s=("nickname"in e||"nick_name"in e||"author_name"in e||"user_name"in e)&&("author_id"in e||"creator_id"in e||"user_id"in e||"uid"in e||"id"in e),a=!("product_id"in e||"sku_id"in e||"goods_id"in e),i=!("order_id"in e||"trade_no"in e||"order_status"in e);return s&&a&&i}function St(t,e){try{if(typeof t=="string"&&(t=JSON.parse(t)),!t||typeof t!="object")return[];const n=[];return nt(t,n,0),n}catch{return[]}}function Mt(t){return["author","creator","kol","talent","anchor","influencer","square","/feed"].some(i=>t.includes(i))?!["product","goods","order","trade","logistics","finance","account/info","shop/basic","upload","message","notification","config","upload"].some(i=>t.includes(i)):!1}function Qt(t){let e=0;const n=(l,o)=>{l.length&&(e+=l.length,(e<=20||e%50===0)&&console.log(`[达人邀约] 📡 已拦截 ${e} 条达人 (来自: ${o==null?void 0:o.slice(0,80)})`),t(l))},s=XMLHttpRequest.prototype.open,a=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.open=function(l,o){return this.__url=o,s.apply(this,arguments)},XMLHttpRequest.prototype.send=function(l){const o=this;return o.addEventListener("load",function(){const r=o.__url||"";if(!Mt(r))return;Z.has(r)||(Z.add(r),console.log("[达人邀约] 🔍 XHR:",r.slice(0,100)));const u=St(o.responseText||o.response);n(u,r)}),a.apply(this,arguments)};const i=window.fetch;window.fetch=async function(l,o){const r=typeof l=="string"?l:(l==null?void 0:l.url)||"",u=await i.apply(this,arguments);try{if(!Mt(r))return u;Z.has(r)||(Z.add(r),console.log("[达人邀约] 🔍 Fetch:",r.slice(0,100)));const b=u.clone(),g=St(await b.text(),r);n(g,r)}catch{}return u},console.log("[达人邀约] ✅ API 拦截器已安装（精准达人模式）")}function Zt(t){if(!t)return null;const e=t.querySelectorAll("button");for(const n of e){const s=n.textContent.trim();if((s==="邀约"||s==="联系"||s==="合作"||s.includes("邀约"))&&n.offsetParent!==null)return n}return t.querySelector('[class*="invite"],[class*="Invite"]')}function Ct(t){if(t){t.scrollIntoView({block:"center",behavior:"instant"}),["mousedown","mouseup","click"].forEach(e=>t.dispatchEvent(new MouseEvent(e,{bubbles:!0,cancelable:!0})));try{t.click()}catch{}}}function te(t){const e=document.querySelectorAll('[class*="card"],[class*="row"],[class*="item"]');for(const n of e)if(n.textContent.includes(t))return n;return null}function ee(t){const e=document.querySelectorAll('[class*="card"],[class*="row"],[class*="item"]'),n=[];for(const s of e){const a=s.querySelector('[class*="nickname"],[class*="name"],[class*="title"]');if(!a)continue;const i=a.textContent.trim();if(!i||i.length<2)continue;const l=s.querySelector('[class*="fans"],[class*="follower"]'),o=l?V(l.textContent):0;let r="dom_"+ne(i);t.has(r)||n.push({id:r,nickname:i,fans:o,sales:0,score:0,category:"",_el:s,source:"dom"})}return n}function ne(t){let e=0;for(let n=0;n<t.length;n++)e=(e<<5)-e+t.charCodeAt(n),e|=0;return Math.abs(e).toString(36)}function se(){var a,i,l;const t=new Set;let e=null;const n=document.querySelectorAll("*");for(const o of n){if(o.children.length!==0&&o.childNodes.length>3)continue;const r=(o.innerText||o.textContent||"").trim();if(r==="主推类目"||r==="类目"||r==="达人分类"){const u=o.closest('[class*="form-item"], [class*="row"], [class*="col"]')||o.parentElement;if(u){const b=u.parentElement;if(b){const g=b.querySelector('[class*="control"], [class*="content"], [class*="body"]');if(g){e=g,console.log("[达人邀约] 🎯 通过标签+兄弟定位到控件区:",((a=g.className)==null?void 0:a.slice(0,60))||g.tagName);break}for(const d of b.children)if(d!==u&&!d.contains(o)){const f=(d.innerText||d.textContent||"").trim();if(f.length>10&&!/主推|类目|分类/.test(f.slice(0,5))){e=d,console.log("[达人邀约] 🎯 通过兄弟定位到类目区:",((i=d.className)==null?void 0:i.slice(0,60))||d.tagName);break}}if(e)break}}}}if(e||(e=document.querySelector('[class*="mainCategory"], [class*="main-category"], [class*="primaryCategory"], [class*="anchorCategory"], [class*="creatorCategory"], [class*="category"]:not([class*="categoryItem"])'),e&&console.log("[达人邀约] 🎯 通过选择器定位:",((l=e.className)==null?void 0:l.slice(0,60))||e.tagName)),e&&ae(e,t),t.size===0){console.log("[达人邀约] ⚠️ 未找到类目容器，启用全页扫描");const o=['[class*="categoryTab"]','[class*="catTab"]','[class*="cateTab"]','[class*="category"][class*="tab"]','[role="tab"]',".category-item",".cat-item"];for(const r of o)document.querySelectorAll(r).forEach(u=>{const b=(u.innerText||u.textContent||"").trim();b&&b.length>=2&&b.length<=6&&/^[一-龥]+$/.test(b)&&!/找|按|搜|选|达人|商品|人群|相似|主推|类目|全[部]|不限/.test(b)&&t.add(b)})}const s=[...t].sort((o,r)=>o.localeCompare(r,"zh-CN"));return s.length?console.log("[达人邀约] 📋 提取到类目:",s.join(", ")):console.log("[达人邀约] ⚠️ 未提取到类目 — 可能需要检查页面结构"),s}function ae(t,e){const n=document.createTreeWalker(t,NodeFilter.SHOW_ELEMENT),s=new Set;for(;n.nextNode();){const a=n.currentNode;if(a.children.length>0)continue;const i=(a.innerText||a.textContent||"").trim();i&&(i.length<2||i.length>6||/^[一-龥]+$/.test(i)&&(/全[部选]|不限|确定|重置|更多|展开|收起|主推|类目|分类|达人|商品|人群|相似|找|按|搜索|筛选|推荐|清空|请选择/.test(i)||s.has(i)||(s.add(i),e.add(i))))}}const Lt={filter:{},templates:[{id:"1",group:"通用",name:"默认话术",content:"Hi {达人昵称}，【{商品名}】正在找达人合作，佣金{佣金比例}%，期待合作！",enabled:!0},{id:"2",group:"通用",name:"简洁版",content:"{达人昵称}你好，品牌好物【{商品名}】诚邀合作，高佣金高转化~",enabled:!0},{id:"3",group:"高佣",name:"高佣邀约",content:"{达人昵称}老师好！【{商品名}】提供{佣金比例}高佣合作，出单稳定，欢迎来撩~",enabled:!0},{id:"4",group:"纯佣",name:"纯佣合作",content:"{达人昵称}，【{商品名}】纯佣金合作，坑位费可谈，佣金{佣金比例}%，期待回复！",enabled:!0}],product:{name:"",commissionRate:"",link:"",category:"",benefit:""},settings:{delayMin:3e3,delayMax:6e3},history:[],stats:{date:"",sent:0,ok:0,ng:0},blacklist:[],whitelist:[],inviteRecords:[]};async function O(){return new Promise(t=>chrome.storage.local.get(null,t))}async function T(t){return new Promise(e=>chrome.storage.local.set(t,e))}async function Ot(){const t=await O();if(!t||!t.templates)return await T(Lt),{...Lt};const e={};return t.blacklist||(e.blacklist=[]),t.whitelist||(e.whitelist=[]),t.inviteRecords||(e.inviteRecords=[]),Object.keys(e).length&&await T(e),t}async function ie(){return Ot()}async function oe(t){const{inviteRecords:e=[]}=await O();e.unshift({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),time:Date.now(),...t}),e.length>2e3&&(e.length=2e3),await T({inviteRecords:e})}async function Y(){const{blacklist:t=[]}=await O();return t}async function re(t){const{blacklist:e=[]}=await O();e.includes(t)||(e.push(t),await T({blacklist:e}))}async function le(t){const{blacklist:e=[]}=await O(),n=e.indexOf(t);n>=0&&(e.splice(n,1),await T({blacklist:e}))}async function G(){const{whitelist:t=[]}=await O();return t}async function ce(t){const{whitelist:e=[]}=await O();e.includes(t)||(e.push(t),await T({whitelist:e}))}async function de(t){const{whitelist:e=[]}=await O(),n=e.indexOf(t);n>=0&&(e.splice(n,1),await T({whitelist:e}))}async function ue(){return O()}async function pe(t){t.templates&&await T({templates:t.templates}),t.settings&&await T({settings:t.settings}),t.blacklist&&await T({blacklist:t.blacklist}),t.whitelist&&await T({whitelist:t.whitelist})}async function fe(){return new Promise(t=>chrome.storage.local.clear(t))}const ge=`
*{margin:0;padding:0;box-sizing:border-box}
:host{pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
:host>*{pointer-events:auto}

/* ---- 主题色（Shadow DOM 里用 :host 而非 :root） ---- */
:host {
  --primary: #4A90D9;
  --primary-dark: #3A7BC8;
  --primary-light: #E8F0FE;
  --success: #10B981;
  --warning: #F59E0B;
  --danger: #EF4444;
  --bg: #F8FAFC;
  --surface: #FFFFFF;
  --border: #E2E8F0;
  --text: #1E293B;
  --text-secondary: #64748B;
  --text-muted: #94A3B8;
  --radius: 8px;
  --shadow: 0 4px 24px rgba(0,0,0,0.12);
  --shadow-lg: 0 8px 40px rgba(0,0,0,0.16);
}

/* ---- FAB 浮动按钮 ---- */
.fab {
  position:fixed;bottom:80px;right:20px;width:56px;height:56px;border-radius:50%;
  background:linear-gradient(135deg,#4A90D9,#357ABD);color:#fff;border:none;font-size:24px;
  cursor:pointer;box-shadow:0 4px 20px rgba(74,144,217,.45);z-index:2147483647;
  display:flex;align-items:center;justify-content:center;transition:all .25s;
}
.fab:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(74,144,217,.55)}
.fab .badge{
  position:absolute;top:-6px;right:-6px;min-width:20px;height:20px;border-radius:10px;
  background:#EF4444;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;
  justify-content:center;padding:0 6px;display:none;
}

/* ---- 主面板 ---- */
.panel{
  position:fixed;top:56px;right:16px;width:520px;max-height:calc(100vh - 80px);
  background:var(--surface);border-radius:12px;
  box-shadow:var(--shadow-lg);z-index:2147483647;
  display:none;flex-direction:column;overflow:hidden;font-size:13px;color:var(--text);
}
.panel.open{display:flex}

/* ---- 面板头部 ---- */
.hdr{
  display:flex;align-items:center;justify-content:space-between;padding:14px 18px;
  background:linear-gradient(135deg,#4A90D9,#3A7BC8);color:#fff;flex-shrink:0;
}
.hdr-left{display:flex;align-items:center;gap:8px}
.hdr-logo{font-size:18px}
.hdr-title{font-size:15px;font-weight:700}
.hdr-subtitle{font-size:11px;opacity:.8}
.hdr-actions{display:flex;gap:6px}
.hdr-btn{
  width:28px;height:28px;border:none;border-radius:6px;background:rgba(255,255,255,.2);
  color:#fff;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:background .15s;
}
.hdr-btn:hover{background:rgba(255,255,255,.35)}

/* ---- 标签导航 ---- */
.tabs{
  display:flex;background:var(--surface);border-bottom:1px solid var(--border);flex-shrink:0;
  overflow-x:auto;
}
.tab{
  flex:1;min-width:fit-content;padding:11px 14px;border:none;background:none;font-size:12px;
  color:var(--text-secondary);cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent;
  transition:all .15s;display:flex;align-items:center;gap:5px;
}
.tab:hover{color:var(--primary);background:var(--primary-light)}
.tab.active{color:var(--primary);border-bottom-color:var(--primary);font-weight:600}

/* ---- 面板内容区 ---- */
.content{flex:1;overflow-y:auto;padding:16px;display:none}
.content.active{display:block}

/* ---- 统计卡片 ---- */
.statCards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
.statCard{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
  padding:12px 14px;text-align:center;
}
.statCard .sc-val{font-size:22px;font-weight:700;color:var(--text)}
.statCard .sc-label{font-size:11px;color:var(--text-muted);margin-top:4px}
.statCard.accent .sc-val{color:var(--primary)}

/* ---- 区块容器 ---- */
.section{margin-bottom:16px}
.section-title{
  font-size:13px;font-weight:600;color:var(--text);margin-bottom:10px;
  display:flex;align-items:center;gap:6px;
}
.section-title::before{content:'';width:3px;height:14px;background:var(--primary);border-radius:2px}

/* ---- 表单 ---- */
.frm-group{margin-bottom:12px}
.frm-label{display:block;font-size:12px;font-weight:600;color:var(--text);margin-bottom:4px}
.frm-input,.frm-select{
  width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:6px;
  font-size:13px;outline:none;color:var(--text);background:var(--surface);
  transition:border-color .15s;
}
.frm-input:focus,.frm-select:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(74,144,217,.1)}
.frm-row{display:flex;gap:10px}
.frm-row>*{flex:1}
.frm-hint{font-size:11px;color:var(--text-muted);margin-top:4px}

/* ---- 按钮 ---- */
.btn{
  padding:8px 16px;border:none;border-radius:6px;font-size:13px;font-weight:500;
  cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:4px;
}
.btn:disabled{opacity:.5;cursor:not-allowed}
.btn-primary{background:var(--primary);color:#fff}
.btn-primary:hover:not(:disabled){background:var(--primary-dark)}
.btn-success{background:var(--success);color:#fff}
.btn-success:hover:not(:disabled){background:#059669}
.btn-danger{background:var(--danger);color:#fff}
.btn-danger:hover:not(:disabled){background:#DC2626}
.btn-warning{background:var(--warning);color:#fff}
.btn-outline{background:var(--surface);color:var(--primary);border:1px solid var(--primary)}
.btn-outline:hover:not(:disabled){background:var(--primary-light)}
.btn-ghost{background:none;color:var(--text-secondary)}
.btn-ghost:hover{background:var(--bg)}
.btn-sm{padding:4px 10px;font-size:12px}
.btn-block{width:100%;justify-content:center}
.btn-group{display:flex;gap:6px;flex-wrap:wrap}

/* ---- 达人列表表格 ---- */
.tbl-wrap{overflow-y:auto;max-height:300px;border:1px solid var(--border);border-radius:var(--radius)}
.tbl{width:100%;border-collapse:collapse;font-size:12px}
.tbl thead{position:sticky;top:0;z-index:2}
.tbl th{
  background:#F1F5F9;padding:8px 6px;text-align:left;font-weight:600;color:var(--text);
  font-size:11px;white-space:nowrap;border-bottom:2px solid var(--border);
}
.tbl td{padding:7px 6px;border-bottom:1px solid #F1F5F9;vertical-align:middle}
.tbl tr:hover td{background:var(--primary-light)}
.tbl tr.sel td{background:#EFF6FF}
.tbl .cb-col{width:32px;text-align:center}
.tbl input[type=checkbox]{accent-color:var(--primary);width:14px;height:14px}

/* ---- 标签 ---- */
.tag{font-size:10px;padding:2px 8px;border-radius:10px;font-weight:500;white-space:nowrap}
.tag-blue{background:#DBEAFE;color:#1E40AF}
.tag-green{background:#D1FAE5;color:#065F46}
.tag-red{background:#FEE2E2;color:#991B1B}
.tag-yellow{background:#FEF3C7;color:#92400E}
.tag-gray{background:#F3F4F6;color:#374151}

/* ---- 进度条 ---- */
.prog-wrap{margin:12px 0}
.prog-bar{height:6px;background:var(--border);border-radius:3px;overflow:hidden}
.prog-fill{height:100%;background:linear-gradient(90deg,#4A90D9,#3A7BC8);border-radius:3px;width:0;transition:width .3s}
.prog-info{display:flex;justify-content:space-between;margin-top:6px;font-size:12px;color:var(--text-secondary)}

/* ---- 模态弹窗 ---- */
.modal-overlay{
  position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.4);
  z-index:2147483648;display:none;align-items:center;justify-content:center;
}
.modal-overlay.open{display:flex}
.modal{
  background:var(--surface);border-radius:12px;padding:20px;width:400px;max-height:80vh;
  overflow-y:auto;box-shadow:var(--shadow-lg);
}
.modal-title{font-size:15px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.modal-body{font-size:13px;line-height:1.6}
.modal-footer{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}

/* ---- 搜索栏 ---- */
.search-bar{display:flex;gap:8px;margin-bottom:12px}
.search-bar .frm-input{flex:1}

/* ---- 过滤器标签 ---- */
.filter-tags{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px}
.filter-tag{
  display:inline-flex;align-items:center;gap:4px;padding:3px 10px;
  background:var(--primary-light);color:var(--primary);border-radius:12px;
  font-size:11px;font-weight:500;
}
.filter-tag .remove{cursor:pointer;font-size:14px;line-height:1}

/* ---- 时间线 ---- */
.timeline{position:relative;padding-left:20px}
.timeline::before{content:'';position:absolute;left:6px;top:4px;bottom:4px;width:1px;background:var(--border)}
.timeline-item{position:relative;margin-bottom:12px;font-size:12px}
.timeline-item::before{
  content:'';position:absolute;left:-17px;top:4px;width:8px;height:8px;
  border-radius:50%;background:var(--primary);
}
.timeline-item .tl-time{color:var(--text-muted);font-size:11px}
.timeline-item .tl-text{color:var(--text)}

/* ---- 空状态 ---- */
.empty-state{
  text-align:center;padding:40px 20px;color:var(--text-muted);
}
.empty-state .empty-icon{font-size:40px;margin-bottom:10px}
.empty-state .empty-text{font-size:13px}

/* ---- 操作栏 ---- */
.toolbar{
  display:flex;align-items:center;justify-content:space-between;gap:8px;
  margin-bottom:12px;flex-wrap:wrap;
}

/* ---- 达人卡片 ---- */
.creator-cards{display:flex;flex-direction:column;gap:8px}
.creator-card{
  display:flex;align-items:center;gap:10px;padding:10px 12px;
  border:1px solid var(--border);border-radius:var(--radius);
  background:var(--surface);cursor:pointer;transition:all .15s;
}
.creator-card:hover{border-color:var(--primary);box-shadow:0 2px 8px rgba(74,144,217,.1)}
.creator-card.sel{border-color:var(--primary);background:var(--primary-light)}
.creator-card .cc-avatar{
  width:40px;height:40px;border-radius:50%;background:var(--border);
  display:flex;align-items:center;justify-content:center;font-size:16px;
  color:var(--text-muted);flex-shrink:0;overflow:hidden;
}
.creator-card .cc-avatar img{width:100%;height:100%;object-fit:cover}
.creator-card .cc-info{flex:1;min-width:0}
.creator-card .cc-name{font-weight:600;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.creator-card .cc-meta{font-size:11px;color:var(--text-secondary);margin-top:2px;display:flex;gap:10px}
.creator-card .cc-actions{display:flex;gap:6px;flex-shrink:0}

/* ---- 抽屉（达人详情） ---- */
.drawer{
  position:fixed;top:0;right:0;width:380px;height:100vh;background:var(--surface);
  box-shadow:var(--shadow-lg);z-index:2147483649;transform:translateX(100%);
  transition:transform .25s;display:flex;flex-direction:column;overflow:hidden;
}
.drawer.open{transform:translateX(0)}
.drawer-hdr{
  display:flex;align-items:center;justify-content:space-between;padding:14px 16px;
  background:linear-gradient(135deg,#4A90D9,#3A7BC8);color:#fff;flex-shrink:0;
}
.drawer-body{flex:1;overflow-y:auto;padding:16px}
.drawer-section{margin-bottom:16px}
.drawer-section dt{font-size:11px;color:var(--text-muted);margin-bottom:2px}
.drawer-section dd{font-size:14px;font-weight:500;color:var(--text)}

/* ---- 通知提示 ---- */
.toast{
  position:fixed;top:16px;left:50%;transform:translateX(-50%);padding:10px 20px;
  border-radius:8px;font-size:13px;font-weight:500;z-index:2147483650;
  box-shadow:var(--shadow);animation:toastIn .3s ease;
}
.toast-success{background:#D1FAE5;color:#065F46}
.toast-error{background:#FEE2E2;color:#991B1B}
.toast-info{background:#DBEAFE;color:#1E40AF}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

/* ---- 滚动条 ---- */
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:#94A3B8}
`;function q(t,e,n=!1){return`<div class="statCard${n?" accent":""}">
    <div class="sc-val">${w(String(t))}</div>
    <div class="sc-label">${w(e)}</div>
  </div>`}function be(t,e=!1){const n=dt(t),s=$t[n]||$t.素人,a=e?" sel":"",i=t.avatar?`<img src="${w(t.avatar)}" alt="">`:(t.nickname||"?").charAt(0);return`<div class="creator-card${a}" data-id="${w(t.id)}">
    <div class="cc-avatar">${i.includes("<img")?i:w(i)}</div>
    <div class="cc-info">
      <div class="cc-name">${w(t.nickname||"-")}</div>
      <div class="cc-meta">
        <span>👥 ${at(t.fans)}</span>
        <span>💰 ${at(t.sales)}</span>
        <span>⭐ ${t.score.toFixed(1)}</span>
      </div>
    </div>
    <span class="tag" style="background:${s.bg};color:${s.color}">${s.label}</span>
  </div>`}function P(t,e){return`<div class="empty-state">
    <div class="empty-icon">${t||"📭"}</div>
    <div class="empty-text">${w(e||"暂无数据")}</div>
  </div>`}function me(t){const e=t.ok?"✅":"❌";return`<div class="timeline-item">
    <div class="tl-time">${qt(t.time)}</div>
    <div class="tl-text">${e} ${w(t.nickname)} — ${w(t.reason||(t.ok?"发送成功":"发送失败"))}</div>
  </div>`}function S(t,e,n="info"){const s=t.querySelector(".toast");s&&s.remove();const a=document.createElement("div");a.className=`toast toast-${n}`,a.textContent=e,t.appendChild(a),setTimeout(()=>a.remove(),2500)}function he(t={}){const{stats:e={},list:n=[],inviteRecords:s=[]}=t,a=new Date().toDateString(),i=e.date===a?e:{sent:0,ok:0,ng:0},l=(s||[]).slice(0,10),o={头部:0,中腰部:0,素人:0,置换:0};for(const r of n){const u=ve(r);o[u]=(o[u]||0)+1}return`
    <!-- 统计卡片 -->
    <div class="statCards">
      ${q(i.sent||0,"今日邀约")}
      ${q(n.length,"已拦截达人",!0)}
      ${q(i.ok||0,"今日成功")}
    </div>
    <div class="statCards">
      ${q((s==null?void 0:s.length)||0,"累计邀约记录")}
      ${q(o.头部+o.中腰部,"中腰部以上达人")}
      ${q(i.ng||0,"今日失败")}
    </div>

    <!-- 达人分层 -->
    <div class="section">
      <div class="section-title">📊 达人分层统计</div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <span class="tag tag-yellow">头部 ${o.头部}</span>
        <span class="tag tag-blue">中腰部 ${o.中腰部}</span>
        <span class="tag tag-gray">素人 ${o.素人}</span>
        <span class="tag tag-green">置换 ${o.置换}</span>
      </div>
    </div>

    <!-- 最近邀约记录 -->
    <div class="section">
      <div class="section-title">🕐 最近邀约记录</div>
      ${l.length?`<div class="timeline">${l.map(me).join("")}</div>`:P("📭","暂无邀约记录，去达人筛选页开始邀约吧")}
    </div>
  `}function ve(t){return t.acceptsExchange?"置换":t.fans>=1e6||t.sales>=1e7?"头部":t.fans>=1e5||t.sales>=1e6?"中腰部":"素人"}class It{constructor(e={}){this.scrollSpeed=e.scrollSpeed||{min:300,max:800},this.pauseChance=e.pauseChance||.3,this.pauseDuration=e.pauseDuration||{min:500,max:3e3},this.viewportMargin=e.viewportMargin||.2,this.enabled=e.enabled!==!1,this._aborted=!1}abort(){this._aborted=!0}reset(){this._aborted=!1}async scrollToElement(e){if(!(!e||!this.enabled))try{const n=e.getBoundingClientRect(),s=window.scrollY+n.top-window.innerHeight*.35,a=R(2,5),i=window.scrollY,l=s-i;for(let o=0;o<a&&!this._aborted;o++){const r=(o+1)/a,u=r<.5?2*r*r:1-Math.pow(-2*r+2,2)/2,b=i+l*u;window.scrollTo({top:b,behavior:"smooth"}),await z(R(this.scrollSpeed.min,this.scrollSpeed.max)),Math.random()<this.pauseChance&&await z(R(this.pauseDuration.min,this.pauseDuration.max))}}catch{}}async microScroll(){if(!this.enabled||this._aborted)return;const e=R(-150,150);window.scrollBy({top:e,behavior:"smooth"}),await z(R(400,1200))}async naturalPause(e=""){if(!this.enabled||this._aborted)return;const n=R(200,600),s=Math.round(n*(Math.random()*.6-.3)),a=Math.max(100,n+s);await z(a)}async humanInterval(e=3e3,n=6e3){if(!this.enabled||this._aborted)return;const s=R(e,n);if(Math.random()<.15){const a=R(2e3,8e3);await z(s+a)}else{const a=Math.round(s*(Math.random()*.5-.25));await z(Math.max(e,s+a))}Math.random()<.25&&await this.microScroll()}}const jt=new It;function ye(t,e,n={}){return t.replace(/\{(\w+)\}/g,(s,a)=>{const i={达人昵称:e.nickname||"",商品名:n.name||"好物",佣金比例:n.commissionRate||"丰厚",产品链接:n.link||"",类目:n.category||e.category||"",福利政策:n.benefit||"",店铺名:n.shopName||""};return i[a]!==void 0?i[a]:`{${a}}`})}function xe(t){const e=(t||[]).filter(n=>n.enabled!==!1);return e.length?e[Math.floor(Math.random()*e.length)]:null}async function we(t,e,n={}){const{dlyAfterClick:s=[300,600],dlyAfterFill:a=[200,400],dlyAfterSend:i=[800,1500],emulator:l=null}=n,o=l||jt;let r=t._el;if((!r||!document.contains(r))&&(r=te(t.nickname),r&&(t._el=r)),!r)return{ok:!1,reason:"找不到达人卡片"};await o.scrollToElement(r),await o.naturalPause();const u=Zt(r);if(!u)return{ok:!1,reason:"找不到邀约按钮"};Ct(u),await z(R(...s));const b=document.querySelector('textarea,[class*="textarea"]');if(!b)return{ok:!1,reason:"弹窗未出现"};await o.naturalPause("before_fill"),Xt(b,e),await z(R(...a)),await o.naturalPause("before_send");const g=ke();g&&Ct(g),await z(R(...i));const d=document.querySelector('[class*="toast"],[class*="message"],[class*="notification"]');if(d){const f=d.textContent;if(f.includes("失败")||f.includes("错误")||f.includes("频繁")||f.includes("限制"))return{ok:!1,reason:f.slice(0,50)}}return{ok:!0,reason:""}}function ke(){const t=["发送","确认","提交","确定","Send","OK"],e=document.querySelectorAll("button");for(const n of e)if(t.some(s=>n.textContent.trim()===s||n.textContent.trim().includes(s))&&n.offsetParent!==null)return n;return document.querySelector('[class*="send"],[class*="submit"],[class*="confirm"]')}async function _e(t){const{queue:e=[],target:n=0,templates:s=[],product:a={},dlyMin:i=3e3,dlyMax:l=6e3,onProgress:o=()=>{},onStatus:r=()=>{},onLog:u=()=>{},isAborted:b=()=>!1,hasAnomaly:g=()=>!1,blacklist:d=[],emulator:f=null}=t,v=f||jt;let m=0,y=0,x=0;const p=new Set;let h=[...e];const $=n||h.length,E=new Set(d.map(String));for(o(0,m,y,x);(n===0||m<n)&&!b();){if(g()){r("⚠️ 检测到异常，自动暂停 — 请手动确认后继续");break}if(h=h.filter(X=>!E.has(String(X.id))&&!p.has(X.id)),!h.length){r("队列为空，等待数据...");break}const _=h.shift();if(!_||p.has(_.id)||E.has(String(_.id))){x++;continue}r(`正在邀约: ${_.nickname}`),o(Math.round(n?m/n*100:(m+y)/($||1)*100),m,y,x);const C=xe(s);if(!C){r("无可用话术模板");break}const D=ye(C.content,_,a),A=await we(_,D,{dlyAfterClick:[300,600],dlyAfterFill:[200,400],dlyAfterSend:[800,1500],emulator:v});if(p.add(_.id),A.ok?m++:y++,u({creatorId:_.id,nickname:_.nickname,fans:_.fans,template:C.name,ok:A.ok,reason:A.reason,time:Date.now()}),!b()&&(n===0||m<n)){if(g()){r("⚠️ 检测到异常，自动暂停");break}await v.humanInterval(i,l)}}const M=b()?"⏹ 已停止":n>0&&m>=n?`✅ 已达标 ${n} 次`:"📭 队列已清空";return{ok:m,ng:y,sk:x,msg:M}}function Ee(t={}){const{list:e=[],filters:n={},blacklist:s=[],whitelist:a=[],cfg:i={},anomalyPaused:l=!1,schedulerEnabled:o=!1,schedulerInWindow:r=!1,riskLevel:u="none",taskState:b={}}=t,g=(i==null?void 0:i.product)||{},d=(i==null?void 0:i.settings)||{},f=(i==null?void 0:i.templates)||[],v=f.filter(x=>x.enabled!==!1),{running:m=!1}=b,y=e.filter(x=>Wt(x,n));return`
    <!-- ========== 安全状态条 ========== -->
    ${$e(l,o,r,u)}

    <!-- ========== 商品信息（话术变量来源） ========== -->
    <div class="section" id="sec-product" style="${g.name?"":"display:none"}">
      <div class="section-title">📦 商品信息 <button class="btn btn-ghost btn-sm" id="toggle-product" style="font-size:11px">${g.name?"展开":"+ 设置"}</button></div>
      <div id="product-fields" style="display:none">
        <div class="frm-row">
          <div class="frm-group"><label class="frm-label">商品名</label><input class="frm-input" id="qp-name" value="${w(g.name||"")}" placeholder="{商品名}"></div>
          <div class="frm-group"><label class="frm-label">佣金率</label><input class="frm-input" id="qp-rate" value="${w(g.commissionRate||"")}" placeholder="{佣金比例} 如20%"></div>
        </div>
        <div class="frm-row">
          <div class="frm-group"><label class="frm-label">店铺名</label><input class="frm-input" id="qp-shop" value="${w(g.shopName||"")}" placeholder="{店铺名}"></div>
          <div class="frm-group"><label class="frm-label">类目</label><input class="frm-input" id="qp-cat" value="${w(g.category||"")}" placeholder="{类目}"></div>
        </div>
        <div class="frm-row">
          <div class="frm-group"><label class="frm-label">产品链接</label><input class="frm-input" id="qp-link" value="${w(g.link||"")}" placeholder="{产品链接}"></div>
          <div class="frm-group"><label class="frm-label">福利政策</label><input class="frm-input" id="qp-benefit" value="${w(g.benefit||"")}" placeholder="{福利政策} 如:前10单额外奖"></div>
        </div>
        <button class="btn btn-primary btn-sm" id="qp-save-product" style="margin-top:6px">💾 保存</button>
      </div>
    </div>

    <!-- ========== 达人筛选条件 ========== -->
    <div class="section">
      <div class="section-title" style="justify-content:space-between">
        <span>🔍 达人筛选条件</span>
        <button class="btn btn-ghost btn-sm" id="toggle-adv-filter">${ut(n)?"⚙️ 修改筛选":"⚙️ 高级筛选"}</button>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <input class="frm-input" id="filter-search" placeholder="🔍 搜索达人昵称..." value="${w(n.keyword||"")}">
      </div>

      <!-- 筛选标签 -->
      <div class="filter-tags" id="active-tags">${Se(n)}</div>

      <!-- 高级筛选表单 -->
      <div id="filter-form" style="display:none;margin-bottom:10px;padding:12px;background:#F8FAFC;border-radius:8px;border:1px solid #E2E8F0">
        <div class="frm-row">
          <div class="frm-group"><label class="frm-label">粉丝下限</label>
            <select class="frm-select" id="ff-fansMin">
              <option value="">不限</option><option value="1000">1千</option><option value="10000">1万</option><option value="50000">5万</option><option value="100000">10万</option><option value="500000">50万</option><option value="1000000">100万</option>
            </select></div>
          <div class="frm-group"><label class="frm-label">粉丝上限</label>
            <select class="frm-select" id="ff-fansMax">
              <option value="">不限</option><option value="10000">1万</option><option value="100000">10万</option><option value="500000">50万</option><option value="1000000">100万</option><option value="5000000">500万</option>
            </select></div>
        </div>
        <div class="frm-row">
          <div class="frm-group"><label class="frm-label">近30天结算GMV下限</label><input class="frm-input" id="ff-salesMin" type="number" placeholder="如 100000" value="${n.salesMin||""}"></div>
          <div class="frm-group"><label class="frm-label">近30天结算GMV上限</label><input class="frm-input" id="ff-salesMax" type="number" placeholder="如 1000000" value="${n.salesMax||""}"></div>
        </div>
        <div class="frm-row">
          <div class="frm-group"><label class="frm-label">最低口碑分</label><input class="frm-input" id="ff-scoreMin" type="number" step="0.1" value="${n.scoreMin||""}"></div>
          <div class="frm-group"><label class="frm-label">佣金率下限(%)</label><input class="frm-input" id="ff-commissionMin" type="number" value="${n.commissionMin||""}"></div>
        </div>
        <div class="frm-row">
          <div class="frm-group"><label class="frm-label">类目 (${tt(e).length>0?tt(e).length+"个可选":"浏览达人广场后自动填充"})</label>
            <select class="frm-select" id="ff-category">
              <option value="">不限</option>
              ${tt(e).length===0?"<option disabled>— 请先在达人广场浏览达人 —</option>":tt(e).map(x=>`<option value="${w(x)}" ${n.category===x?"selected":""}>${w(x)}</option>`).join("")}
            </select></div>
          <div class="frm-group"><label class="frm-label">达人分层</label>
            <select class="frm-select" id="ff-tier"><option value="">全部</option><option value="头部">头部</option><option value="中腰部">中腰部</option><option value="素人">素人</option><option value="置换">置换</option></select></div>
        </div>
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;margin-top:6px">
          <input type="checkbox" id="ff-pureCommission" ${n.pureCommissionOnly?"checked":""}> 仅纯佣金达人
        </label>
        <div class="btn-group" style="margin-top:8px">
          <button class="btn btn-primary btn-sm" id="filter-apply">✅ 应用</button>
          <button class="btn btn-outline btn-sm" id="filter-reset">🔄 重置</button>
        </div>
      </div>
    </div>

    <!-- ========== 邀约任务配置（合并到这里） ========== -->
    <div class="section">
      <div class="section-title">🚀 邀约任务配置</div>
      <div class="frm-row">
        <div class="frm-group"><label class="frm-label">目标人数 (0=全部)</label><input class="frm-input" id="task-target" type="number" value="0"></div>
        <div class="frm-group"><label class="frm-label">话术分组</label>
          <select class="frm-select" id="task-tpl-group">
            <option value="">全部 (${v.length}个可用)</option>
            ${Ce(f)}
          </select></div>
      </div>
      <!-- 模板预览区（随分组选择变化） -->
      <div id="tpl-preview" style="margin-top:8px">${Nt(f,"")}</div>
      <div class="frm-row" style="margin-top:8px">
        <div class="frm-group"><label class="frm-label">最小间隔(秒)</label><input class="frm-input" id="task-dlyMin" type="number" value="${d.delayMin?Math.round(d.delayMin/1e3):3}"></div>
        <div class="frm-group"><label class="frm-label">最大间隔(秒)</label><input class="frm-input" id="task-dlyMax" type="number" value="${d.delayMax?Math.round(d.delayMax/1e3):6}"></div>
      </div>
      <div class="frm-hint">随机间隔 + 自然人节奏，建议≥3秒</div>
    </div>

    <!-- ========== 达人列表 ========== -->
    <div class="section">
      <div class="section-title" style="justify-content:space-between">
        <span>📋 达人列表</span>
        <span style="font-size:12px;color:var(--text-secondary)">${y.length} / ${e.length} 位</span>
      </div>
      <div class="toolbar">
        <div class="btn-group">
          <button class="btn btn-ghost btn-sm" id="sel-all">☑ 全选</button>
          <button class="btn btn-ghost btn-sm" id="sel-none">☐ 取消</button>
          <button class="btn btn-outline btn-sm" id="sel-blacklist">🚫 黑名单</button>
          <button class="btn btn-outline btn-sm" id="sel-whitelist">⭐ 白名单</button>
        </div>
      </div>
      <div class="creator-cards" id="creator-cards" style="max-height:250px;overflow-y:auto">
        ${y.length?y.map(x=>be(x)).join(""):P("🔍",e.length?"无匹配结果":"等待达人数据...浏览精选联盟达人广场获取")}
      </div>
    </div>

    <!-- ========== 执行按钮 ========== -->
    <div style="padding:8px 0 16px">
      ${m?'<div style="text-align:center;color:var(--primary);font-weight:600">▶ 任务运行中 — 前往「邀约任务」面板查看进度</div>':`<button class="btn btn-primary btn-block" id="filter-start" style="padding:14px;font-size:15px" ${l?"disabled":""}>
            ${l?"⚠️ 异常待处理":"🚀 开始批量邀约"}
          </button>`}
      <div id="filter-start-msg" style="text-align:center;margin-top:6px;font-size:12px;color:var(--text-secondary)"></div>
    </div>
  `}function $e(t,e,n,s){if(!t&&!e&&s==="none")return"";const a={none:"#10B981",low:"#F59E0B",medium:"#F97316",high:"#EF4444"},i={none:"正常",low:"低",medium:"中",high:"高"};return`<div style="display:flex;gap:8px;margin-bottom:10px">
    ${e?`<span class="tag ${n?"tag-green":"tag-gray"}" style="font-size:11px">⏰ ${n?"窗口内":"等待"}</span>`:""}
    <span class="tag" style="font-size:11px;background:${a[s]}20;color:${a[s]}">🛡 ${i[s]}</span>
    ${t?'<span class="tag tag-red" style="font-size:11px">🚨 异常</span>':""}
  </div>`}function Se(t){if(!t||!ut(t))return'<span style="font-size:11px;color:var(--text-muted)">无筛选条件（显示全部）</span>';const e=[];return t.keyword&&e.push({label:`搜索: ${t.keyword}`,key:"keyword"}),t.fansMin&&e.push({label:`粉丝≥${at(t.fansMin)}`,key:"fansMin"}),t.salesMin&&e.push({label:`近30天GMV≥${at(t.salesMin)}`,key:"salesMin"}),t.scoreMin&&e.push({label:`口碑≥${t.scoreMin}`,key:"scoreMin"}),t.tier&&e.push({label:t.tier,key:"tier"}),t.pureCommissionOnly&&e.push({label:"纯佣",key:"pureCommissionOnly"}),e.map(n=>`<span class="filter-tag">${w(n.label)} <span class="remove" data-key="${n.key}">×</span></span>`).join("")}function ut(t){return t?!!(t.keyword||t.fansMin||t.fansMax||t.salesMin||t.salesMax||t.scoreMin||t.commissionMin||t.tier||t.pureCommissionOnly):!1}function Me(t,e,n){var a,i,l,o,r,u,b,g,d,f,v,m,y,x;const s=p=>t.getElementById(p);if((a=s("toggle-product"))==null||a.addEventListener("click",()=>{const p=s("product-fields");p.style.display=p.style.display==="none"?"block":"none"}),(i=s("qp-save-product"))==null||i.addEventListener("click",async()=>{var h,$,E,M,_,C;const p={name:((h=s("qp-name"))==null?void 0:h.value)||"",commissionRate:(($=s("qp-rate"))==null?void 0:$.value)||"",shopName:((E=s("qp-shop"))==null?void 0:E.value)||"",category:((M=s("qp-cat"))==null?void 0:M.value)||"",link:((_=s("qp-link"))==null?void 0:_.value)||"",benefit:((C=s("qp-benefit"))==null?void 0:C.value)||""};e.cfg.product=p,await chrome.storage.local.set({product:p}),S(t,"✅ 商品信息已保存","success")}),(l=s("toggle-adv-filter"))==null||l.addEventListener("click",()=>{const p=s("filter-form");p.style.display=p.style.display==="none"?"block":"none"}),ut(e.filters||{})){const p=s("filter-form");p&&(p.style.display="block")}(o=s("filter-search"))==null||o.addEventListener("input",Kt(()=>{var p;e.filters.keyword=((p=s("filter-search"))==null?void 0:p.value)||void 0,n()},400)),(r=s("filter-apply"))==null||r.addEventListener("click",()=>{var p,h,$,E,M,_,C,D,A;e.filters={...e.filters,fansMin:(p=s("ff-fansMin"))!=null&&p.value?+s("ff-fansMin").value:void 0,fansMax:(h=s("ff-fansMax"))!=null&&h.value?+s("ff-fansMax").value:void 0,salesMin:($=s("ff-salesMin"))!=null&&$.value?+s("ff-salesMin").value:void 0,salesMax:(E=s("ff-salesMax"))!=null&&E.value?+s("ff-salesMax").value:void 0,scoreMin:(M=s("ff-scoreMin"))!=null&&M.value?+s("ff-scoreMin").value:void 0,commissionMin:(_=s("ff-commissionMin"))!=null&&_.value?+s("ff-commissionMin").value:void 0,category:((C=s("ff-category"))==null?void 0:C.value)||void 0,tier:((D=s("ff-tier"))==null?void 0:D.value)||void 0,pureCommissionOnly:((A=s("ff-pureCommission"))==null?void 0:A.checked)||void 0},n(),S(t,"✅ 筛选已应用","success")}),(u=s("filter-reset"))==null||u.addEventListener("click",()=>{e.filters={},n()}),(b=s("task-tpl-group"))==null||b.addEventListener("change",()=>{var $,E;const p=(($=s("task-tpl-group"))==null?void 0:$.value)||"",h=s("tpl-preview");h&&(h.innerHTML=Nt(((E=e.cfg)==null?void 0:E.templates)||[],p),At(t))}),At(t),(g=s("active-tags"))==null||g.addEventListener("click",p=>{const h=p.target.closest(".remove");h&&(delete e.filters[h.dataset.key],n())}),(d=s("sel-all"))==null||d.addEventListener("click",()=>t.querySelectorAll(".creator-card").forEach(p=>p.classList.add("sel"))),(f=s("sel-none"))==null||f.addEventListener("click",()=>t.querySelectorAll(".creator-card").forEach(p=>p.classList.remove("sel"))),(v=s("creator-cards"))==null||v.addEventListener("click",p=>{const h=p.target.closest(".creator-card");h&&h.classList.toggle("sel")}),(m=s("sel-blacklist"))==null||m.addEventListener("click",async()=>{const p=Ft(t);if(!p.length){S(t,"请先选择达人","info");return}for(const h of p)await re(h);e.blacklist=await Y(),S(t,`🚫 ${p.length} 位已加黑名单`,"success"),n()}),(y=s("sel-whitelist"))==null||y.addEventListener("click",async()=>{const p=Ft(t);if(!p.length){S(t,"请先选择达人","info");return}for(const h of p)await ce(h);e.whitelist=await G(),S(t,`⭐ ${p.length} 位已加白名单`,"success"),n()}),(x=s("filter-start"))==null||x.addEventListener("click",async()=>{var bt,mt,ht,vt,yt,xt,wt,kt,_t;const p=(bt=window.__daren_anomaly)==null?void 0:bt.call(window),h=(mt=window.__daren_emu)==null?void 0:mt.call(window);if(p!=null&&p.hasAnomaly()){S(t,"⚠️ 检测到异常，请先处理","error");return}const $=+(((ht=s("task-target"))==null?void 0:ht.value)||0),E=+(((vt=s("task-dlyMin"))==null?void 0:vt.value)||3)*1e3,M=+(((yt=s("task-dlyMax"))==null?void 0:yt.value)||6)*1e3,_=((xt=s("task-tpl-group"))==null?void 0:xt.value)||"",C={...(wt=e.cfg)==null?void 0:wt.settings,delayMin:E,delayMax:M};e.cfg.settings=C,await chrome.storage.local.set({settings:C});const D=new Set((e.blacklist||[]).map(String));let A=e.list.filter(L=>D.has(String(L.id))?!1:Wt(L,e.filters||{}));const X=new Set((e.whitelist||[]).map(String));if(A.sort((L,Q)=>(X.has(String(L.id))?0:1)-(X.has(String(Q.id))?0:1)),!A.length){S(t,"无可用达人","error");return}let it=((kt=e.cfg)==null?void 0:kt.templates)||[];_&&(it=it.filter(L=>L.group===_)),h&&h.reset(),e.taskState={running:!0,paused:!1,ok:0,ng:0,sk:0,pct:0,status:"运行中"},n();const I=s("filter-start-msg");I&&(I.textContent=`🚀 正在邀约... 队列: ${A.length} 位`);const U=await _e({queue:A,target:$,templates:it,product:((_t=e.cfg)==null?void 0:_t.product)||{},dlyMin:E,dlyMax:M,emulator:h||void 0,onProgress:(L,Q,Et)=>{e.taskState.pct=L,e.taskState.ok=Q,e.taskState.ng=Et,I&&(I.textContent=`进度 ${L}% | ✅${Q} ❌${Et}`)},onStatus:L=>{e.taskState.status=L,I&&(I.textContent=L)},onLog:L=>{oe(L),chrome.runtime.sendMessage({action:"LOG",record:L})},isAborted:()=>e.taskState.aborted||!1,hasAnomaly:()=>p?p.hasAnomaly():!1,blacklist:e.blacklist||[]});e.taskState={running:!1,paused:!1,ok:U.ok,ng:U.ng,sk:U.sk,pct:100,status:U.msg},I&&(I.textContent=U.msg),n()})}function Ft(t){return[...t.querySelectorAll(".creator-card.sel")].map(e=>e.dataset.id)}function At(t){var e;(e=t.querySelector("#tpl-goto-settings"))==null||e.addEventListener("click",n=>{n.preventDefault();const s=t.querySelector('.tab[data-tab="settings"]');s&&s.click()})}function tt(t){const e=new Set;for(const n of t){const s=n.category||"";s&&s.split(/[,，、/]+/).forEach(a=>{const i=a.trim();i&&i.length>1&&e.add(i)})}try{se().forEach(s=>e.add(s))}catch{}return[...e].sort((n,s)=>n.localeCompare(s,"zh-CN"))}function Ce(t){return["通用","高佣","纯佣","置换"].map(n=>{const s=t.filter(i=>i.group===n&&i.enabled!==!1).length,a=t.filter(i=>i.group===n).length;return`<option value="${n}">${n} (${s}/${a}个)</option>`}).join("")}function Nt(t,e){let n=t.filter(a=>a.enabled!==!1);return e&&(n=n.filter(a=>a.group===e)),n.length?`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <span style="font-size:11px;color:var(--text-secondary)">
        ${e?`<span class="tag tag-blue" style="font-size:10px;margin-right:4px">${e}</span>`:""}随机从 <b>${n.length}</b> 条中选取:
      </span>
      <a href="#" id="tpl-goto-settings" style="font-size:11px;color:var(--primary);cursor:pointer">⚙️ 管理模板</a>
    </div>
    <div style="max-height:80px;overflow-y:auto;border:1px solid var(--border);border-radius:6px;padding:4px">
      ${n.slice(0,5).map(a=>`
        <div style="font-size:11px;padding:3px 6px;border-bottom:1px solid #F1F5F9;display:flex;align-items:center;gap:6px">
          <span style="color:${a.enabled===!1?"#94A3B8":"var(--text)"};flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            ${a.enabled===!1?"<s>"+w(a.content.slice(0,50))+"</s>":w(a.content.slice(0,50))}
          </span>
          <span class="tag" style="font-size:9px;background:${a.enabled===!1?"#FEE2E2":"#D1FAE5"};color:${a.enabled===!1?"#991B1B":"#065F46"}">${a.enabled===!1?"停":"启"}</span>
        </div>
      `).join("")}
      ${n.length>5?`<div style="font-size:10px;color:var(--text-muted);text-align:center;padding:2px">...还有 ${n.length-5} 条</div>`:""}
    </div>
  `:`<div style="font-size:11px;color:var(--text-muted);padding:6px 0">
      ${e?`「${e}」分组无可用模板 — `:"无可用模板 — "}
      <a href="#" id="tpl-goto-settings" style="color:var(--primary);cursor:pointer">去设置页管理</a>
    </div>`}function Le(t={}){const{taskState:e={},anomalies:n=[],anomalyPaused:s=!1,schedulerEnabled:a=!1,schedulerInWindow:i=!1,riskLevel:l="none",list:o=[],filters:r={}}=t,{running:u=!1,paused:b=!1,ok:g=0,ng:d=0,sk:f=0,pct:v=0,status:m="待启动"}=e,y=new Set((t.blacklist||[]).map(String)),x=o.filter(p=>!y.has(String(p.id))).length;return`
    <!-- 安全状态条 -->
    ${Fe(s,n,a,i,l)}

    <!-- 运行状态大卡片 -->
    <div style="background:var(--surface);border:2px solid ${u?"#4A90D9":"#E2E8F0"};border-radius:12px;padding:20px;text-align:center;margin-bottom:16px">
      <div style="font-size:32px;margin-bottom:8px">${u?b?"⏸":"🚀":"⏹"}</div>
      <div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:4px" id="task-big-status">${w(m)}</div>
      <div style="font-size:13px;color:var(--text-secondary)">
        可用达人: <b>${x}</b> 位 | 队列筛选后: <b>${o.length}</b> 位
      </div>
    </div>

    <!-- 计数卡片 -->
    <div class="statCards">
      <div class="statCard"><div class="sc-val" id="task-ok">${g}</div><div class="sc-label">✅ 成功</div></div>
      <div class="statCard"><div class="sc-val" id="task-ng">${d}</div><div class="sc-label">❌ 失败</div></div>
      <div class="statCard"><div class="sc-val" id="task-sk">${f}</div><div class="sc-label">⏭ 跳过</div></div>
    </div>

    <!-- 进度条 -->
    <div class="prog-wrap">
      <div class="prog-bar"><div class="prog-fill" id="task-prog-fill" style="width:${v}%"></div></div>
      <div class="prog-info">
        <span id="task-prog-txt">${v}%</span>
        <span id="task-current" style="color:var(--text-secondary)">${u?"运行中":"就绪"}</span>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="btn-group btn-block" style="margin-bottom:16px">
      ${u?`<button class="btn btn-warning" id="task-pause" style="flex:1">⏸ ${b?"继续":"暂停"}</button>
           <button class="btn btn-danger" id="task-stop" style="flex:1">⏹ 停止</button>`:'<button class="btn btn-outline btn-block" id="task-goto-filter">🔍 前往筛选页配置并启动</button>'}
    </div>

    <!-- 最近日志 -->
    <div class="section">
      <div class="section-title">📝 运行日志 <button class="btn btn-ghost btn-sm" id="task-clear-log" style="font-size:11px">清空</button></div>
      <div id="task-log" style="max-height:250px;overflow-y:auto">
        ${P("📭","暂无日志 — 在筛选页配置并启动邀约后，日志将显示在此处")}
      </div>
    </div>
  `}function Fe(t,e,n,s,a){if(!t&&!n&&a==="none"&&!e.length)return"";const i={none:"#10B981",low:"#F59E0B",medium:"#F97316",high:"#EF4444"},l={none:"正常",low:"低风险",medium:"中风险",high:"高风险"};let o='<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">';return n&&(o+=`<span class="tag ${s?"tag-green":"tag-gray"}" style="font-size:11px">⏰ ${s?"窗口内":"等待"}</span>`),o+=`<span class="tag" style="font-size:11px;background:${i[a]}20;color:${i[a]}">🛡 ${l[a]}</span>`,t&&(o+='<span class="tag tag-red" style="font-size:11px">🚨 异常暂停</span>'),o+="</div>",e.length&&(o+=`<div style="margin-bottom:12px;padding:8px 12px;background:#FEF2F2;border:1px solid #FECACA;border-radius:6px;font-size:12px">
      <b style="color:#991B1B">🚨 活跃异常:</b> ${e.map(r=>`<span style="color:#7F1D1D">${r}</span>`).join(", ")}
    </div>`),o}let H=[];function Rt(t,e="info"){H.unshift({time:Date.now(),msg:t,type:e}),H.length>200&&(H.length=200)}function zt(t){if(t){if(!H.length){t.innerHTML=P("📭","暂无日志");return}t.innerHTML=H.slice(0,30).map(e=>`<div style="font-size:11px;padding:3px 0;border-bottom:1px solid #F1F5F9;color:${e.type==="error"?"#EF4444":e.type==="success"?"#10B981":"#64748B"}">
      <span style="color:#94A3B8">${qt(e.time)}</span> ${w(e.msg)}
    </div>`).join("")}}function Ae(t,e,n){var i,l,o,r;const s=u=>t.getElementById(u),a=s("task-log");a&&zt(a),(i=s("task-clear-log"))==null||i.addEventListener("click",()=>{H=[],zt(s("task-log"))}),(l=s("task-goto-filter"))==null||l.addEventListener("click",()=>{var u;(u=t.querySelector('.tab[data-tab="filter"]'))==null||u.click()}),(o=s("task-pause"))==null||o.addEventListener("click",()=>{e.taskState.paused=!e.taskState.paused,Rt(e.taskState.paused?"⏸ 已暂停":"▶ 继续执行"),n()}),(r=s("task-stop"))==null||r.addEventListener("click",()=>{e.taskState.aborted=!0,Rt("⏹ 用户手动停止"),n()})}function Re(t={}){const{list:e=[],inviteRecords:n=[],stats:s={}}=t,a={头部:0,中腰部:0,素人:0,置换:0};for(const g of e){const d=dt(g);a[d]=(a[d]||0)+1}const i=n.length,l=n.filter(g=>g.ok).length,o=i-l,r=i?(l/i*100).toFixed(1):"0",u={"1w以下":0,"1w-10w":0,"10w-50w":0,"50w-100w":0,"100w+":0};for(const g of e)g.fans<1e4?u["1w以下"]++:g.fans<1e5?u["1w-10w"]++:g.fans<5e5?u["10w-50w"]++:g.fans<1e6?u["50w-100w"]++:u["100w+"]++;const b={"<5%":0,"5-10%":0,"10-20%":0,"20-30%":0,">30%":0};for(const g of e){const d=g.commissionRate||0;d<5?b["<5%"]++:d<10?b["5-10%"]++:d<20?b["10-20%"]++:d<30?b["20-30%"]++:b[">30%"]++}return`
    <!-- 关键指标 -->
    <div class="section">
      <div class="section-title">📈 关键指标</div>
      <div class="statCards">
        ${q(e.length,"达人总数")}
        ${q(i,"累计邀约",!0)}
        ${q(r+"%","邀约成功率")}
      </div>
    </div>

    <!-- 邀约统计 -->
    <div class="section">
      <div class="section-title">📊 邀约转化</div>
      ${i?et("成功/失败",[{label:"成功",value:l,color:"#10B981"},{label:"失败",value:o,color:"#EF4444"}],i):P("📊","暂无邀约数据")}
    </div>

    <!-- 达人分层分布 -->
    <div class="section">
      <div class="section-title">🏷 达人分层分布</div>
      ${et("分层",[{label:"头部",value:a.头部,color:"#F59E0B"},{label:"中腰部",value:a.中腰部,color:"#4A90D9"},{label:"素人",value:a.素人,color:"#94A3B8"},{label:"置换",value:a.置换,color:"#10B981"}],e.length)}
    </div>

    <!-- 粉丝数分布 -->
    <div class="section">
      <div class="section-title">👥 粉丝数分布</div>
      ${et("粉丝",Object.entries(u).map(([g,d])=>({label:g,value:d,color:"#4A90D9"})),e.length)}
    </div>

    <!-- 佣金率分布 -->
    <div class="section">
      <div class="section-title">💰 佣金率分布</div>
      ${et("佣金率",Object.entries(b).map(([g,d])=>({label:g,value:d,color:"#3B82F6"})),e.length)}
    </div>

    <!-- 导出按钮 -->
    <div class="section">
      <div class="section-title">📥 数据导出</div>
      <div class="btn-group">
        <button class="btn btn-outline" id="export-creators">📋 导出达人列表 (CSV)</button>
        <button class="btn btn-outline" id="export-records">📝 导出邀约记录 (CSV)</button>
        <button class="btn btn-outline" id="export-all">💾 导出全部数据 (JSON)</button>
      </div>
    </div>
  `}function et(t,e,n){if(!n)return P("📊","暂无数据");const s=Math.max(...e.map(a=>a.value),1);return'<div style="margin-bottom:12px">'+e.map(a=>{const i=Math.round(a.value/s*100);return`<div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
          <span>${w(a.label)}</span>
          <span style="color:var(--text-secondary)">${a.value} (${n?Math.round(a.value/n*100):0}%)</span>
        </div>
        <div style="height:8px;background:#F1F5F9;border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${i}%;background:${a.color};border-radius:4px;transition:width .5s"></div>
        </div>
      </div>`}).join("")+"</div>"}function ze(t,e,n){var a,i,l;const s=o=>t.getElementById(o);(a=s("export-creators"))==null||a.addEventListener("click",()=>{Tt(e.list,[{key:"nickname",label:"昵称"},{key:"fans",label:"粉丝数"},{key:"sales",label:"近30天结算GMV"},{key:"orders",label:"近30天出单"},{key:"score",label:"口碑分"},{key:"commissionRate",label:"佣金率(%)"},{key:"category",label:"类目"}],"达人列表.csv")}),(i=s("export-records"))==null||i.addEventListener("click",async()=>{const{inviteRecords:o=[]}=await chrome.storage.local.get("inviteRecords");Tt(o,[{key:"nickname",label:"达人昵称"},{key:"ok",label:"是否成功",format:r=>r?"成功":"失败"},{key:"reason",label:"原因"},{key:"time",label:"时间",format:r=>new Date(r).toLocaleString("zh-CN")}],"邀约记录.csv")}),(l=s("export-all"))==null||l.addEventListener("click",async()=>{const o=await chrome.storage.local.get(null);Ht(JSON.stringify(o,null,2),"达人邀约助手_全部数据.json","application/json")})}function Tt(t,e,n){const s=e.map(l=>l.label).join(","),a=t.map(l=>e.map(o=>{let r=l[o.key];return o.format&&(r=o.format(r)),typeof r=="string"&&(r.includes(",")||r.includes('"')||r.includes(`
`))&&(r='"'+r.replace(/"/g,'""')+'"'),r??""}).join(",")),i="\uFEFF"+[s,...a].join(`
`);Ht(i,n,"text/csv;charset=utf-8")}function Ht(t,e,n){const s=new Blob([t],{type:n}),a=URL.createObjectURL(s),i=document.createElement("a");i.href=a,i.download=e,i.click(),URL.revokeObjectURL(a)}function Te(t={}){const e=t.cfg||{},n=e.templates||[],s=e.settings||{},a=t.blacklist||[],i=t.whitelist||[],l=s.schedule||{},o=l.timeWindows||[];return`
    <!-- 话术模板管理 -->
    <div class="section">
      <div class="section-title">💬 话术模板 (${n.length})</div>
      <div id="tpl-list">${De(n)}</div>
      <div class="btn-group" style="margin-top:8px">
        <button class="btn btn-outline btn-sm" id="set-add-tpl">+ 添加模板</button>
        <button class="btn btn-primary btn-sm" id="set-save-tpl">💾 保存模板</button>
      </div>
      <div class="frm-hint" style="margin-top:8px">
        可用变量: <code>{达人昵称}</code> <code>{商品名}</code> <code>{佣金比例}</code> <code>{产品链接}</code> <code>{类目}</code> <code>{店铺名}</code> <code>{福利政策}</code>
      </div>
    </div>

    <!-- 黑白名单 -->
    <div class="section">
      <div class="section-title">🚫 黑白名单管理</div>
      <div class="frm-row">
        <div class="frm-group">
          <label class="frm-label">黑名单 (${a.length} 位) <span style="color:#94A3B8;font-weight:400">— 永不邀约</span></label>
          <div style="max-height:120px;overflow-y:auto;border:1px solid #E2E8F0;border-radius:6px;padding:8px">
            ${a.length?a.map(r=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;font-size:12px">
                  <span>🆔 ${w(String(r).slice(0,16))}...</span>
                  <button class="btn btn-ghost btn-sm remove-blacklist" data-id="${w(r)}">✕</button>
                </div>`).join(""):'<span style="font-size:12px;color:#94A3B8">空</span>'}
          </div>
          <div class="frm-hint">在达人筛选中选中达人后，可批量加入黑名单</div>
        </div>
        <div class="frm-group">
          <label class="frm-label">白名单 (${i.length} 位) <span style="color:#94A3B8;font-weight:400">— 优先邀约</span></label>
          <div style="max-height:120px;overflow-y:auto;border:1px solid #E2E8F0;border-radius:6px;padding:8px">
            ${i.length?i.map(r=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;font-size:12px">
                  <span>⭐ ${w(String(r).slice(0,16))}...</span>
                  <button class="btn btn-ghost btn-sm remove-whitelist" data-id="${w(r)}">✕</button>
                </div>`).join(""):'<span style="font-size:12px;color:#94A3B8">空</span>'}
          </div>
          <div class="frm-hint">白名单达人优先排在邀约队列前面</div>
        </div>
      </div>
    </div>

    <!-- 定时调度设置 -->
    <div class="section">
      <div class="section-title">⏰ 定时调度</div>
      <div class="frm-hint" style="margin-bottom:8px">设置可执行时段，插件仅在时段内自动运行。异常时自动终止。留空则不启用。</div>
      <label style="display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:12px;cursor:pointer">
        <input type="checkbox" id="set-sched-enabled" ${l.enabled?"checked":""}>
        启用定时调度
      </label>
      <div id="sched-windows">
        ${Be(o)}
      </div>
      <button class="btn btn-outline btn-sm" id="set-add-window">+ 添加时段</button>
      <button class="btn btn-primary btn-sm" id="set-save-schedule" style="margin-left:6px">💾 保存调度</button>
      <div class="frm-hint" style="margin-top:6px">
        ⚠️ 调度器仅在无异常状态下执行，遇到验证弹窗/风控拦截自动暂停
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="section">
      <div class="section-title">🗄 数据管理</div>
      <div class="btn-group">
        <button class="btn btn-outline btn-sm" id="set-backup">📤 备份数据</button>
        <button class="btn btn-outline btn-sm" id="set-restore-btn">📥 恢复数据</button>
        <button class="btn btn-danger btn-sm" id="set-clear">🗑 清空所有数据</button>
      </div>
      <input type="file" id="set-restore-file" accept=".json" style="display:none">
    </div>
  `}function Be(t){if(!t||!t.length)return'<div style="font-size:12px;color:#94A3B8;padding:8px;border:1px dashed #E2E8F0;border-radius:6px;text-align:center">暂无时段 — 点击"添加时段"按钮</div>';const e=["日","一","二","三","四","五","六"];return t.map((n,s)=>`
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;padding:8px;border:1px solid #E2E8F0;border-radius:6px;background:#F8FAFC">
      <span style="font-size:12px;font-weight:600;color:#64748B">#${s+1}</span>
      <input class="sched-start" value="${w(n.start||"02:00")}" placeholder="开始" style="width:65px;font-size:12px;padding:4px;border:1px solid #E2E8F0;border-radius:4px" data-idx="${s}">
      <span style="color:#94A3B8">—</span>
      <input class="sched-end" value="${w(n.end||"06:00")}" placeholder="结束" style="width:65px;font-size:12px;padding:4px;border:1px solid #E2E8F0;border-radius:4px" data-idx="${s}">
      <div style="display:flex;gap:4px;flex-wrap:wrap">
        ${e.map((a,i)=>{var l;return`<label style="font-size:10px;cursor:pointer;display:flex;align-items:center;gap:1px">
          <input type="checkbox" class="sched-day" data-idx="${s}" value="${i}" ${(l=n.days)!=null&&l.includes(i)?"checked":""}>${a}
        </label>`}).join("")}
      </div>
      <button class="btn btn-sm sched-del" data-idx="${s}" style="font-size:11px;padding:2px 6px;background:#FEE2E2;color:#991B1B;border:none;border-radius:3px">✕</button>
    </div>
  `).join("")}function De(t){return t.length?t.map((e,n)=>qe(e,n)).join(""):'<div style="font-size:12px;color:#94A3B8;padding:8px">暂无模板</div>'}function qe(t,e){return`
    <div class="tpl-item" data-idx="${e}" style="display:flex;gap:8px;margin-bottom:8px;padding:8px;border:1px solid #E2E8F0;border-radius:6px;background:${t.enabled===!1?"#F8FAFC":"#fff"}">
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <input class="tpl-content" value="${w(t.content)}" style="flex:1;font-size:12px;padding:5px;border:1px solid #E2E8F0;border-radius:4px" data-idx="${e}">
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <input class="tpl-name" value="${w(t.name||"")}" placeholder="模板名称" style="width:100px;font-size:11px;padding:3px 6px;border:1px solid #E2E8F0;border-radius:3px" data-idx="${e}">
          <select class="tpl-group" data-idx="${e}" style="font-size:11px;padding:3px;border:1px solid #E2E8F0;border-radius:3px">
            <option value="通用" ${t.group==="通用"?"selected":""}>通用</option>
            <option value="高佣" ${t.group==="高佣"?"selected":""}>高佣</option>
            <option value="纯佣" ${t.group==="纯佣"?"selected":""}>纯佣</option>
            <option value="置换" ${t.group==="置换"?"selected":""}>置换</option>
          </select>
          <button class="btn btn-sm tpl-toggle" data-idx="${e}" style="font-size:11px;padding:2px 8px;background:${t.enabled===!1?"#FEE2E2":"#D1FAE5"};color:${t.enabled===!1?"#991B1B":"#065F46"};border:none;border-radius:3px">${t.enabled===!1?"停用":"启用"}</button>
          <button class="btn btn-sm tpl-del" data-idx="${e}" style="font-size:11px;padding:2px 8px;background:#FEE2E2;color:#991B1B;border:none;border-radius:3px">删</button>
        </div>
      </div>
    </div>
  `}function We(t,e){const n=t.enabled===!1?"#F8FAFC":"#fff",s=B("div",{class:"tpl-item","data-idx":e,style:`display:flex;gap:8px;margin-bottom:8px;padding:8px;border:1px solid #E2E8F0;border-radius:6px;background:${n}`}),a=B("div",{style:"flex:1"}),i=B("div",{style:"display:flex;align-items:center;gap:6px;margin-bottom:4px"}),l=B("input",{class:"tpl-content","data-idx":e,style:"flex:1;font-size:12px;padding:5px;border:1px solid #E2E8F0;border-radius:4px"});l.value=t.content||"",i.appendChild(l),a.appendChild(i);const o=B("div",{style:"display:flex;align-items:center;gap:8px"}),r=B("input",{class:"tpl-name","data-idx":e,placeholder:"模板名称",style:"width:100px;font-size:11px;padding:3px 6px;border:1px solid #E2E8F0;border-radius:3px"});r.value=t.name||"";const u=B("select",{class:"tpl-group","data-idx":e,style:"font-size:11px;padding:3px;border:1px solid #E2E8F0;border-radius:3px"});["通用","高佣","纯佣","置换"].forEach(f=>{const v=B("option",{value:f});v.textContent=f,t.group===f&&(v.selected=!0),u.appendChild(v)});const b=t.enabled!==!1,g=B("button",{class:"btn btn-sm tpl-toggle","data-idx":e,style:`font-size:11px;padding:2px 8px;background:${b?"#D1FAE5":"#FEE2E2"};color:${b?"#065F46":"#991B1B"};border:none;border-radius:3px`});g.textContent=b?"启用":"停用";const d=B("button",{class:"btn btn-sm tpl-del","data-idx":e,style:"font-size:11px;padding:2px 8px;background:#FEE2E2;color:#991B1B;border:none;border-radius:3px"});return d.textContent="删",o.appendChild(r),o.appendChild(u),o.appendChild(g),o.appendChild(d),a.appendChild(o),s.appendChild(a),s}function B(t,e={}){const n=document.createElement(t);for(const[s,a]of Object.entries(e))s==="class"?n.className=a:s==="style"?n.style.cssText=a:n.setAttribute(s,String(a));return n}let ot=null,rt=null,lt=null;function Oe(t,e,n){var a,i,l,o,r,u,b,g;ot&&t.removeEventListener("click",ot),rt&&t.removeEventListener("click",rt),lt&&t.removeEventListener("click",lt);const s=d=>t.getElementById(d);(a=s("set-save-tpl"))==null||a.addEventListener("click",async()=>{const d=t.querySelectorAll(".tpl-item");if(!d.length){S(t,"⚠️ 没有模板可保存，请先添加","error");return}const f=[];if(d.forEach((v,m)=>{var M,_,C,D,A;const y=((_=(M=v.querySelector(".tpl-content"))==null?void 0:M.value)==null?void 0:_.trim())||"";if(!y)return;const x=((D=(C=v.querySelector(".tpl-name"))==null?void 0:C.value)==null?void 0:D.trim())||"未命名",p=((A=v.querySelector(".tpl-group"))==null?void 0:A.value)||"通用",h=v.querySelector(".tpl-toggle"),$=h?!h.textContent.includes("停用"):!0,E=e.cfg&&e.cfg.templates&&e.cfg.templates[m]?e.cfg.templates[m].id:null;f.push({id:E||"t"+Date.now()+m,name:x,group:p,content:y,enabled:$})}),!f.length){S(t,"⚠️ 没有有效模板（内容不能为空）","error");return}await chrome.storage.local.set({templates:f}),e.cfg||(e.cfg={}),e.cfg.templates=f,S(t,"✅ 已保存 "+f.length+" 条模板","success")}),(i=s("set-add-tpl"))==null||i.addEventListener("click",()=>{const d=e.cfg||{};d.templates||(d.templates=[]);const f=d.templates,v=f.length,m={id:"t"+Date.now(),name:"新模板",group:"通用",content:"Hi {达人昵称}，【{商品名}】诚邀合作，佣金{佣金比例}%！",enabled:!0};f.push(m);const y=t.querySelector("#tpl-list");if(!y)return;const x=We(m,v);y.appendChild(x),requestAnimationFrame(()=>{x.scrollIntoView({behavior:"instant",block:"center"}),requestAnimationFrame(()=>{const h=x.querySelector(".tpl-content");h&&(h.focus(),h.select())})});const p=t.querySelector(".section-title");p&&(p.textContent=`💬 话术模板 (${f.length})`)}),t.addEventListener("click",ot=async d=>{const f=d.target.closest("button");if(!f)return;const v=+f.dataset.idx;if(isNaN(v))return;const m=e.cfg&&e.cfg.templates?e.cfg.templates:[];if(f.classList.contains("tpl-toggle")&&m[v]){m[v].enabled=!m[v].enabled;const y=m[v].enabled;f.textContent=y?"启用":"停用",f.style.background=y?"#D1FAE5":"#FEE2E2",f.style.color=y?"#065F46":"#991B1B";const x=f.closest(".tpl-item");x&&(x.style.background=y?"#fff":"#F8FAFC"),await chrome.storage.local.set({templates:m})}if(f.classList.contains("tpl-del")){m.splice(v,1);const y=f.closest(".tpl-item");y&&y.remove();const x=t.querySelector("#tpl-list");x&&x.querySelectorAll(".tpl-item").forEach((h,$)=>{h.dataset.idx=$,h.querySelectorAll("[data-idx]").forEach(E=>{E.dataset.idx=$})}),await chrome.storage.local.set({templates:m});const p=t.querySelector(".section-title");p&&(p.innerHTML=`💬 话术模板 (${m.length})`)}}),t.addEventListener("click",rt=async d=>{d.target.classList.contains("remove-blacklist")&&(await le(d.target.dataset.id),e.blacklist=await Y(),n(),S(t,"✅ 已从黑名单移除","success")),d.target.classList.contains("remove-whitelist")&&(await de(d.target.dataset.id),e.whitelist=await G(),n(),S(t,"✅ 已从白名单移除","success"))}),(l=s("set-add-window"))==null||l.addEventListener("click",()=>{e.cfg.settings||(e.cfg.settings={}),e.cfg.settings.schedule||(e.cfg.settings.schedule={enabled:!1,timeWindows:[]}),e.cfg.settings.schedule.timeWindows.push({start:"02:00",end:"06:00",days:[]}),n()}),t.addEventListener("click",lt=d=>{var f;if(d.target.classList.contains("sched-del")){const v=+d.target.dataset.idx,m=(f=e.cfg.settings)==null?void 0:f.schedule;m!=null&&m.timeWindows&&(m.timeWindows.splice(v,1),n())}}),(o=s("set-save-schedule"))==null||o.addEventListener("click",async()=>{var m;e.cfg.settings||(e.cfg.settings={});const d=((m=s("set-sched-enabled"))==null?void 0:m.checked)||!1,f=[];t.querySelectorAll("#sched-windows > div").forEach(y=>{var $,E;const x=(($=y.querySelector(".sched-start"))==null?void 0:$.value)||"02:00",p=((E=y.querySelector(".sched-end"))==null?void 0:E.value)||"06:00",h=[...y.querySelectorAll(".sched-day:checked")].map(M=>+M.value);f.push({start:x,end:p,days:h})});const v={enabled:d,timeWindows:f};e.cfg.settings.schedule=v,await chrome.storage.local.set({settings:e.cfg.settings}),S(t,"✅ 调度设置已保存","success")}),(r=s("set-backup"))==null||r.addEventListener("click",async()=>{const d=await ue(),f=new Blob([JSON.stringify(d,null,2)],{type:"application/json"}),v=URL.createObjectURL(f),m=document.createElement("a");m.href=v,m.download="达人邀约助手_备份_"+new Date().toISOString().slice(0,10)+".json",m.click(),URL.revokeObjectURL(v),S(t,"📤 数据已备份","success")}),(u=s("set-restore-btn"))==null||u.addEventListener("click",()=>{var d;return(d=s("set-restore-file"))==null?void 0:d.click()}),(b=s("set-restore-file"))==null||b.addEventListener("change",async d=>{var v;const f=(v=d.target.files)==null?void 0:v[0];if(f)try{const m=await f.text(),y=JSON.parse(m);await pe(y),e.cfg={...e.cfg,...y},e.blacklist=await Y(),e.whitelist=await G(),n(),S(t,"📥 数据已恢复","success")}catch{S(t,"❌ 文件格式错误","error")}}),(g=s("set-clear"))==null||g.addEventListener("click",async()=>{confirm("确定清空所有数据？此操作不可恢复！")&&(await fe(),location.reload())})}let k=null,j=!1,ct="dashboard";const Ie=[{id:"dashboard",icon:"📊",label:"看板"},{id:"filter",icon:"🎯",label:"筛选 & 启动"},{id:"task",icon:"🎮",label:"运行控制台"},{id:"analytics",icon:"📈",label:"数据分析"},{id:"settings",icon:"⚙️",label:"设置"}];function je(){if(k)return!0;const t=document.getElementById("__daren_inviter_v2__");if(t&&(k=t.shadowRoot,k))return!0;if(!document.body)return!1;const e=document.createElement("div");return e.id="__daren_inviter_v2__",e.style.cssText="all:initial;position:fixed;z-index:2147483646;top:0;left:0;",k=e.attachShadow({mode:"open"}),k.innerHTML=Ne(),document.body.appendChild(e),He(),pt("dashboard"),!0}function Ne(){const t=Ie.map((e,n)=>`<button class="tab${n===0?" active":""}" data-tab="${e.id}">${e.icon} ${e.label}</button>`).join("");return`<style>${ge}</style>
<!-- FAB 浮动按钮 -->
<button class="fab" id="fab">🔥<span class="badge" id="badge">0</span></button>

<!-- 主面板 -->
<div class="panel" id="panel">
  <div class="hdr">
    <div class="hdr-left">
      <span class="hdr-logo">🔥</span>
      <div>
        <div class="hdr-title">精选联盟达人邀约助手</div>
        <div class="hdr-subtitle">智能筛选 · 批量邀约 · 数据分析</div>
      </div>
    </div>
    <div class="hdr-actions">
      <button class="hdr-btn" id="panel-min" title="最小化">─</button>
      <button class="hdr-btn" id="panel-close" title="关闭">✕</button>
    </div>
  </div>

  <!-- 标签导航 -->
  <div class="tabs">${t}</div>

  <!-- 面板内容 -->
  <div class="content active" id="content-dashboard"></div>
  <div class="content" id="content-filter"></div>
  <div class="content" id="content-task"></div>
  <div class="content" id="content-analytics"></div>
  <div class="content" id="content-settings"></div>
</div>`}function He(){var e,n,s;if(!k)return;const t=a=>k.getElementById(a);(e=t("fab"))==null||e.addEventListener("click",()=>{j=!j,t("panel").classList.toggle("open",j),j&&ft()}),(n=t("panel-close"))==null||n.addEventListener("click",()=>{j=!1,t("panel").classList.remove("open")}),(s=t("panel-min"))==null||s.addEventListener("click",()=>{j=!1,t("panel").classList.remove("open")}),k.querySelectorAll(".tab").forEach(a=>{a.addEventListener("click",()=>{const i=a.dataset.tab;pt(i)})})}function pt(t){k&&(ct=t,k.querySelectorAll(".tab").forEach(e=>{e.classList.toggle("active",e.dataset.tab===t)}),k.querySelectorAll(".content").forEach(e=>{e.classList.toggle("active",e.id===`content-${t}`)}),ft())}async function st(t={}){if(!k||!j)return;ft(t);const e=k.getElementById("badge");if(e){const n=(t.list||[]).length;e.textContent=n,e.style.display=n>0?"flex":"none"}}function ft(t={}){if(!k)return;const e=k.getElementById(`content-${ct}`);if(e)switch(ct){case"dashboard":e.innerHTML=he(t);break;case"filter":e.innerHTML=Ee(t),Me(k,t,()=>st(t));break;case"task":e.innerHTML=Le(t),Ae(k,t,()=>st(t));break;case"analytics":e.innerHTML=Re(t),ze(k,t);break;case"settings":e.innerHTML=Te(t),Oe(k,t,()=>st(t));break}}function Pe(t){var e;k&&(pt(t),j=!0,(e=k.getElementById("panel"))==null||e.classList.add("open"))}class Xe{constructor(e={}){this.onAnomaly=e.onAnomaly||(()=>{}),this.onWarning=e.onWarning||(()=>{}),this.onRecovery=e.onRecovery||(()=>{}),this.observers=[],this.anomalies=new Set,this.enabled=!1,this._checkInterval=null,this._lastURL=location.href}start(){this.enabled||(this.enabled=!0,this._lastURL=location.href,this._watchCaptchaPopups(),this._watchPageNavigation(),this._watchDOMStability(),this._watchNetworkErrors(),this._startPeriodicCheck(),console.log("[达人邀约] 🔒 异常检测器已启动"))}stop(){this.enabled=!1,this.observers.forEach(e=>e.disconnect()),this.observers=[],this._checkInterval&&(clearInterval(this._checkInterval),this._checkInterval=null),console.log("[达人邀约] 🔒 异常检测器已停止")}hasAnomaly(){return this.anomalies.size>0}getAnomalies(){return[...this.anomalies]}_triggerAnomaly(e,n){this.anomalies.has(e)||(this.anomalies.add(e),console.warn(`[达人邀约] ⚠️ 检测到异常 [${e}]:`,n),this.onAnomaly({type:e,detail:n,timestamp:Date.now()}))}_resolveAnomaly(e){this.anomalies.has(e)&&(this.anomalies.delete(e),console.log(`[达人邀约] ✅ 异常已恢复 [${e}]`),this.onRecovery({type:e,timestamp:Date.now()}))}_watchCaptchaPopups(){const e=["验证码","captcha","滑块验证","请完成验证","拼图验证","are you a robot","请先完成安全验证","请按住滑块拖动"],n=['[class*="captcha"]','[id*="captcha"]','[class*="verify"]','[id*="verify"]','[class*="robot"]','[id*="robot"]','[class*="slide-verify"]','[class*="safety-verify"]',".geetest_panel",".yidun_modal",".captcha_modal",'[class*="antibot"]','[class*="security-check"]','[aria-label*="验证"]'],s=()=>{if(!this.enabled)return;const i=document.querySelectorAll('[class*="modal"], [class*="dialog"], [class*="popup"], [class*="overlay"], [role="dialog"], [role="alertdialog"], .geetest_panel, .yidun_modal, .captcha_modal');for(const l of n){const o=document.querySelector(l);if(o&&o.offsetParent!==null){this._triggerAnomaly("captcha_popup",`检测到验证组件: ${l}`);return}}for(const l of i){if(!l.offsetParent)continue;const o=l.innerText||"";for(const r of e)if(o.includes(r)){this._triggerAnomaly("captcha_popup",`弹窗包含"${r}"`);return}}this._resolveAnomaly("captcha_popup")},a=new MutationObserver(()=>{s()});a.observe(document.body||document.documentElement,{childList:!0,subtree:!0,attributes:!0}),this.observers.push(a),s()}_watchPageNavigation(){const e=()=>{if(!this.enabled)return;const i=location.href;if(i!==this._lastURL){const l=this._lastURL;this._lastURL=i,i.includes("buyin.jinritemai.com")?this.onWarning({type:"page_changed",detail:{from:l,to:i}}):this._triggerAnomaly("page_navigation",{from:l,to:i})}},n=history.pushState,s=history.replaceState,a=this;history.pushState=function(){n.apply(this,arguments),a._lastURL=location.href},history.replaceState=function(){s.apply(this,arguments),a._lastURL=location.href},window.addEventListener("popstate",()=>{a._lastURL=location.href,e()}),window.addEventListener("hashchange",()=>{a._lastURL=location.href,e()})}_watchDOMStability(){let e=0;const n=["请求过于频繁","操作太频繁","请稍后再试","账号异常","已被限制","发送失败"],s=new MutationObserver(()=>{if(!this.enabled)return;const a=document.querySelectorAll('[class*="toast"], [class*="message"], [class*="notification"], [class*="alert"], [class*="notice"], [class*="tip"], [role="alert"]');for(const i of a){if(!i.offsetParent)continue;const l=i.innerText||"";for(const o of n)if(l.includes(o)){e++,e>=3?this._triggerAnomaly("page_errors",`连续错误提示: "${o}" (${e}次)`):this.onWarning({type:"page_error_hint",detail:`页面提示: "${o}"`});return}}e>0&&Math.random()<.1&&(e=Math.max(0,e-1))});s.observe(document.body||document.documentElement,{childList:!0,subtree:!0,characterData:!0}),this.observers.push(s)}_watchNetworkErrors(){const e=this;let n=0;window.addEventListener("error",a=>{if(!e.enabled)return;const i=a.message||"";(i.includes("NetworkError")||i.includes("Failed to fetch"))&&e.onWarning({type:"network_error",detail:{message:i}})});const s=window.fetch;window.fetch=async function(...a){try{const i=await s.apply(this,a);return e.enabled&&(i.status===429?(n++,e._triggerAnomaly("rate_limited",{status:429,count:n})):i.status>=500?e.onWarning({type:"server_error",detail:{status:i.status}}):i.status===403&&e._triggerAnomaly("access_denied",{status:403}),i.status===200&&n>0&&(n=Math.max(0,n-1),n===0&&e._resolveAnomaly("rate_limited"))),i}catch(i){throw e.enabled&&e.onWarning({type:"fetch_failed",detail:{error:i.message}}),i}}}_startPeriodicCheck(){this._checkInterval=setInterval(()=>{var n,s;if(!this.enabled)return;!document.body||document.readyState==="loading"?this._triggerAnomaly("page_unstable",{readyState:document.readyState}):this._resolveAnomaly("page_unstable");const e=["请登录","重新登录","身份已过期","请先登录","login expired"];for(const a of e)if((s=(n=document.body)==null?void 0:n.innerText)!=null&&s.includes(a)){this._triggerAnomaly("session_expired",{hint:a});return}this._resolveAnomaly("session_expired")},3e3)}}class Ue{constructor(e={}){this.timeWindows=e.timeWindows||[],this.onWindowEnter=e.onWindowEnter||(()=>{}),this.onWindowExit=e.onWindowExit||(()=>{}),this.onTick=e.onTick||(()=>{}),this.isAnomaly=e.isAnomaly||(()=>!1),this._timer=null,this._inWindow=!1,this._running=!1,this._currentTaskId=null}start(){this._running||(this._running=!0,this._checkWindow(),this._timer=setInterval(()=>this._checkWindow(),3e4),console.log("[达人邀约] ⏰ 定时调度器已启动，时段:",this.timeWindows))}stop(){this._running=!1,this._timer&&(clearInterval(this._timer),this._timer=null),this._inWindow=!1,console.log("[达人邀约] ⏰ 定时调度器已停止")}isInWindow(){return this._inWindow}setTimeWindows(e){this.timeWindows=e||[],this._checkWindow()}_checkWindow(){if(!this._running)return;if(this.isAnomaly()){this._inWindow&&(this._inWindow=!1,this.onWindowExit({reason:"anomaly_detected"}));return}const e=new Date,n=e.getHours()*60+e.getMinutes(),s=e.getDay();let a=!1;if(!this.timeWindows||this.timeWindows.length===0)a=!1;else for(const i of this.timeWindows){if(i.days&&i.days.length>0&&!i.days.includes(s))continue;const l=this._timeToMinutes(i.start),o=this._timeToMinutes(i.end);if(l<=o){if(n>=l&&n<o){a=!0;break}}else if(n>=l||n<o){a=!0;break}}a&&!this._inWindow?(this._inWindow=!0,console.log("[达人邀约] ⏰ 进入执行窗口"),this.onWindowEnter({time:e.toLocaleTimeString()})):!a&&this._inWindow&&(this._inWindow=!1,console.log("[达人邀约] ⏰ 离开执行窗口"),this.onWindowExit({reason:"out_of_window"})),this.onTick({inWindow:this._inWindow,time:e.toLocaleTimeString(),nextCheck:new Date(e.getTime()+3e4).toLocaleTimeString()})}_timeToMinutes(e){const[n,s]=(e||"0:00").split(":").map(Number);return(n||0)*60+(s||0)}}class Ke{constructor(e={}){this.onRiskDetected=e.onRiskDetected||(()=>{}),this.onRateLimit=e.onRateLimit||(()=>{}),this.onRequestError=e.onRequestError||(()=>{}),this._riskCount=0,this._enabled=!1,this._originalFetch=null}start(){this._enabled||(this._enabled=!0,this._installFetchMonitor(),this._installXHRMonitor(),console.log("[达人邀约] 📡 请求监控器已启动"))}stop(){this._enabled=!1,this._riskCount=0}static getStandardIdentity(){return{userAgent:navigator.userAgent,platform:navigator.platform,language:navigator.language,cookieEnabled:navigator.cookieEnabled,onLine:navigator.onLine,screenResolution:`${window.screen.width}x${window.screen.height}`,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone}}_installFetchMonitor(){const e=this,n=window.fetch;window.fetch=async function(s,a){const i=typeof s=="string"?s:(s==null?void 0:s.url)||"",l={...a};if(l.headers){const o=new Headers(l.headers),r=["x-automation","x-bot","x-scraper","automated","x-requested-with","x-puppeteer","x-selenium"];for(const u of r)o.delete(u);l.headers=o}try{const o=await n.call(this,s,l);return e._enabled&&await e._checkResponseRisk(o,i),o}catch(o){throw e._enabled&&e.onRequestError({url:i,error:o.message,timestamp:Date.now()}),o}}}_installXHRMonitor(){const e=this,n=XMLHttpRequest.prototype.open,s=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.open=function(a,i){return this.__url=i,this.__safeHeaders=!0,n.apply(this,arguments)},XMLHttpRequest.prototype.send=function(a){const i=this;return i.addEventListener("load",function(){e._enabled&&e._checkXHRRisk(i,i.__url||"")}),i.addEventListener("error",function(){e._enabled||e.onRequestError({url:i.__url||"",error:"XHR Network Error",timestamp:Date.now()})}),s.apply(this,arguments)}}async _checkResponseRisk(e,n){if(e.status===429){this.onRateLimit({url:n,status:429,message:"请求过于频繁"});return}if(e.status===403){this._riskCount++,this.onRiskDetected({url:n,status:403,message:"访问被拒绝"});return}try{const a=await e.clone().text().catch(()=>""),i=["请求过于频繁","操作频繁","请稍后再试","账号存在风险","行为异常","暂时限制","rate limit","too many requests","blocked"];for(const l of i)if(a.includes(l)){this._riskCount++,this.onRiskDetected({url:n,keyword:l,message:`响应包含风控标记: ${l}`});return}this._riskCount>0&&Math.random()<.2&&(this._riskCount=Math.max(0,this._riskCount-1))}catch{}}_checkXHRRisk(e,n){e.status===429?this.onRateLimit({url:n,status:429}):e.status===403&&(this._riskCount++,this.onRiskDetected({url:n,status:403}));const s=e.responseText||"",a=["请求过于频繁","操作频繁","请稍后再试","账号存在风险"];for(const i of a)if(s.includes(i)){this._riskCount++,this.onRiskDetected({url:n,keyword:i});return}}getRiskLevel(){return this._riskCount>=5?"high":this._riskCount>=2?"medium":this._riskCount>0?"low":"none"}}const c={seen:new Set,list:[],filters:{},cfg:{},blacklist:[],whitelist:[],taskState:{running:!1,paused:!1,ok:0,ng:0,sk:0,pct:0,status:"待启动"},anomalies:[],anomalyPaused:!1,schedulerEnabled:!1,schedulerInWindow:!1,riskLevel:"none"};let W=null,N=null,J=null,Bt=null;function Ve(t){c.anomalies=W?W.getAnomalies():[t.type],c.anomalyPaused=!0;const e=typeof t.detail=="string"?t.detail:JSON.stringify(t.detail||"");c.taskState.running&&(c.taskState.paused=!0,c.taskState.status="⚠️ 异常暂停: "+(e||t.type)),console.warn("[达人邀约] 🚨 异常触发暂停:",t.type,e),gt(t),F()}function Je(t){c.anomalies=W?W.getAnomalies():[],c.anomalies.length===0&&(c.anomalyPaused=!1),console.log("[达人邀约] ✅ 异常恢复:",t),F()}function Ye(t){console.log("[达人邀约] ⚡ 警告:",t),F()}function Ge(t){c.riskLevel=J?J.getRiskLevel():"medium",c.anomalyPaused=!0,c.taskState.running&&(c.taskState.paused=!0,c.taskState.status="⚠️ 风控拦截: "+(t.message||"检测到风控响应")),console.warn("[达人邀约] 🛡 风控检测:",t),gt({type:"risk_detected",detail:t.message||"平台返回风控拦截"}),F()}function Qe(t){c.riskLevel="high",c.anomalyPaused=!0,c.taskState.running&&(c.taskState.paused=!0,c.taskState.status="⛔ 频率限制 — 立即暂停"),console.warn("[达人邀约] ⛔ 频率限制:",t),gt({type:"rate_limited",detail:"请求过于频繁，请等待后手动重试"}),F()}function Ze(t){c.schedulerInWindow=!0,console.log("[达人邀约] ⏰ 进入执行时段"),!c.anomalyPaused&&!c.taskState.running&&en(),F()}function tn(t){c.schedulerInWindow=!1,console.log("[达人邀约] ⏰ 离开执行时段:",t.reason),c.taskState.running&&(c.taskState.aborted=!0,c.taskState.running=!1,c.taskState.status="⏰ 时段结束，自动停止"),F()}async function en(){await z(2e3),!(c.anomalyPaused||c.taskState.running)&&(console.log("[达人邀约] 🤖 调度器自动启动邀约任务"),F())}function gt(t){var b,g;if(!k)return;const e=t.type||"unknown",n=t.detail||"",s=typeof n=="string"?n:JSON.stringify(n),a=k.querySelector(".modal-overlay");a&&a.remove();const l={captcha_popup:"🤖",page_navigation:"🔀",rate_limited:"⛔",access_denied:"🚫",risk_detected:"🛡",page_errors:"⚠️",session_expired:"🔑",page_unstable:"💥"}[e]||"⚠️",r={captcha_popup:"检测到验证弹窗",page_navigation:"页面发生跳转",rate_limited:"请求频率限制",access_denied:"访问被拒绝",risk_detected:"风控拦截警告",page_errors:"页面出现错误提示",session_expired:"登录已过期",page_unstable:"页面加载不稳定"}[e]||"检测到异常",u=document.createElement("div");u.className="modal-overlay open",u.innerHTML=`
    <div class="modal">
      <div class="modal-title">${l} ${r}</div>
      <div class="modal-body">
        <p>${s||"自动化任务已自动暂停，请手动确认此问题后再继续。"}</p>
        <p style="margin-top:8px;font-size:11px;color:#94A3B8">
          时间: ${new Date().toLocaleTimeString()}<br>
          异常类型: ${e}
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" id="alert-resume">✅ 已手动处理，继续任务</button>
        <button class="btn btn-outline" id="alert-stop">⏹ 终止任务</button>
      </div>
    </div>
  `,k.appendChild(u),(b=u.querySelector("#alert-resume"))==null||b.addEventListener("click",()=>{c.anomalyPaused=!1,c.anomalies=[],c.riskLevel="none",c.taskState.paused&&(c.taskState.paused=!1,c.taskState.status="▶ 继续执行"),u.remove(),F()}),(g=u.querySelector("#alert-stop"))==null||g.addEventListener("click",()=>{c.taskState.aborted=!0,c.taskState.running=!1,c.taskState.status="⏹ 已终止",u.remove(),F()})}function nn(t){let e=0;for(const n of t)n.id&&(c.seen.has(String(n.id))||(c.seen.add(String(n.id)),c.list.push(n),e++));e&&(console.log(`[达人邀约] 📡 +${e} 位达人 (总计 ${c.list.length})`),F())}async function F(){const t=await chrome.storage.local.get("inviteRecords"),e=await chrome.storage.local.get("stats");st({list:c.list,filters:c.filters,blacklist:c.blacklist,whitelist:c.whitelist,cfg:c.cfg||{},taskState:c.taskState,inviteRecords:t.inviteRecords||[],stats:e.stats||{},anomalies:c.anomalies,anomalyPaused:c.anomalyPaused,schedulerEnabled:c.schedulerEnabled,schedulerInWindow:c.schedulerInWindow,riskLevel:c.riskLevel})}function Dt(){const t=ee(c.seen);if(t.length){for(const e of t)c.seen.add(e.id),c.list.push(e);console.log(`[达人邀约] 📋 DOM提取 +${t.length} (总计 ${c.list.length})`),F()}}async function sn(){var n,s;c.cfg=await Ot(),c.blacklist=await Y(),c.whitelist=await G(),console.log("[达人邀约] ✅ 配置已加载"),Qt(nn);let t=0;for(;!je()&&t<30;)await z(300),t++;console.log(`[达人邀约] ✅ UI 已创建 (重试 ${t} 次)`),Bt=new It({enabled:!0}),W=new Xe({onAnomaly:Ve,onWarning:Ye,onRecovery:Je}),W.start(),J=new Ke({onRiskDetected:Ge,onRateLimit:Qe,onRequestError:a=>console.warn("[达人邀约] 请求错误:",a)}),J.start();const e=((n=c.cfg.settings)==null?void 0:n.schedule)||{};N=new Ue({timeWindows:e.timeWindows||[],onWindowEnter:Ze,onWindowExit:tn,onTick:a=>{},isAnomaly:()=>W?W.hasAnomaly():!1}),e.enabled&&((s=e.timeWindows)!=null&&s.length)&&(c.schedulerEnabled=!0,N.start(),console.log("[达人邀约] ⏰ 调度器已自动启动")),chrome.storage.onChanged.addListener(async(a,i)=>{var l,o;if(i==="local"){if(a.templates||a.product||a.settings){c.cfg=await ie();const r=((l=c.cfg.settings)==null?void 0:l.schedule)||{};N&&(N.setTimeWindows(r.timeWindows||[]),r.enabled&&((o=r.timeWindows)!=null&&o.length)&&!c.schedulerEnabled?(c.schedulerEnabled=!0,N.start()):!r.enabled&&c.schedulerEnabled&&(c.schedulerEnabled=!1,N.stop()))}a.blacklist&&(c.blacklist=await Y()),a.whitelist&&(c.whitelist=await G()),F()}}),setInterval(()=>{Dt()},3e3),Dt(),F(),chrome.runtime.onMessage.addListener((a,i,l)=>(a.action==="OPEN_PANEL"?(Pe("dashboard"),l({ok:!0})):a.action==="REFRESH"&&(F(),l({ok:!0})),!0)),window.__daren_state=c,window.__daren_anomaly=()=>W,window.__daren_emu=()=>Bt,window.__daren_scheduler=()=>N,window.__daren_monitor=()=>J,console.log("[达人邀约] ✅ 初始化完成 — 精选联盟达人邀约助手 v2.0")}function Pt(){if(!document.body){setTimeout(Pt,300);return}sn().catch(t=>console.error("[达人邀约] 初始化失败:",t))}Pt();
})()
