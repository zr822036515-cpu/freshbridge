// ==================== 全局样式 (Shadow DOM) ====================

export const CSS = `
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
`;
