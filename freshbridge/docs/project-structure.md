# 鲜桥 FreshBridge 项目代码目录结构

> 更新日期：2026-06-22  
> 小程序地址：http://114.55.173.112:8080/  
> Admin 后台：http://114.55.173.112:8080/admin/

---

## 最外层总览

```
freshbridge/                          # 📁 [项目根目录] 鲜桥果蔬批发平台
├── miniprogram/                      # [模块A] 微信小程序前端 (uni-app Vue3)
├── cmd/                              # [模块B-入口] Go 程序入口
├── internal/                         # [模块B-核心] 后端 API 服务 (Go + Gin)
├── migrations/                       # [模块B-数据库] SQL 迁移文件
├── deploy/                           # [部署运维] Nginx/Systemd/备份脚本
├── docs/                             # [文档] 设计稿/需求/提示词
├── go.mod                            # Go 依赖管理
├── go.sum                            # Go 依赖校验
└── .gitignore                        # Git 忽略规则
```

---

## 模块 A：微信小程序前端

```
miniprogram/
├── src/                              # [源码] 小程序源代码
│   ├── pages/                        # [页面] 22 个业务页面
│   │   ├── home/                     # 首页-行情中心 (Tab1)
│   │   │   └── index.vue             #   Banner轮播+搜索+双按钮+行情溯源+全链路入口+公告
│   │   ├── square/                   # 需求广场-水果名片 (Tab2)
│   │   │   └── index.vue             #   社交信息流+供货卡片+关注/点赞/评论/查看电话
│   │   ├── publish/                  # 发布页 (Tab3)
│   │   │   └── index.vue             #   供货/求购双模式表单+品类选择+图片上传
│   │   ├── message/                  # 消息中心 (Tab4)
│   │   │   └── index.vue             #   分类Tab+消息列表+底部详情弹窗
│   │   ├── mine/                     # 个人中心 (Tab5)
│   │   │   └── index.vue             #   头像+VIP标识+菜单列表+退出
│   │   ├── supply/                   # 货源大厅
│   │   │   └── index.vue             #   9宫格类目+三级分类面板+2列瀑布流卡片
│   │   ├── mall/                     # 品牌商城
│   │   │   ├── index.vue             #   商品分类+2列网格+搜索+会员Banner
│   │   │   ├── detail.vue            #   商品详情大图+规格+加入购物车
│   │   │   ├── cart.vue              #   购物车列表+全选+数量+结算
│   │   │   ├── checkout.vue          #   确认订单+收货地址+费用明细
│   │   │   └── orders.vue            #   我的订单+状态Tab+操作按钮
│   │   ├── ranking/                  # 品种排行
│   │   │   └── index.vue             #   金/银/铜徽章+搜索+Tab切换
│   │   ├── price-compare/            # 行情对比表格
│   │   │   └── index.vue             #   4列表头+趋势图+涨跌色标+搜索
│   │   ├── finance/                  # 全链路服务
│   │   │   └── index.vue             #   采·销·垫三柱+统计数据+实时滚动+采购服务专区
│   │   ├── supply-demand/            # 大宗供需
│   │   │   └── index.vue             #   供应/求购分类卡片+发布CTA
│   │   ├── bookkeeping/              # 快速记账
│   │   │   └── index.vue             #   扫码/手动双模式+销售记录
│   │   ├── consignment/              # 代卖管理
│   │   │   └── index.vue             #   交易列表+进度条+状态筛选
│   │   ├── sales-history/            # 销售记录
│   │   │   └── index.vue             #   日期分组+金额汇总
│   │   ├── settlement/               # 结算对账
│   │   │   └── index.vue             #   月份选择+三列明细+状态标签
│   │   ├── logistics/                # 运单大厅
│   │   │   └── index.vue             #   状态筛选+运单卡片+接单按钮
│   │   └── tracking/                 # 在途追踪
│   │       └── index.vue             #   地图+时间线+物流信息
│   ├── utils/                        # [工具] API 请求封装
│   │   ├── api.js                    #   HTTP 请求 (GET/POST/PUT/DELETE + Token)
│   │   └── config.js                 #   API 基地址配置
│   ├── static/                       # [静态资源]
│   │   └── images/                   #   图标/图片
│   │       ├── banners/              #     首页轮播图 (3张)
│   │       ├── categories/           #     类目入口图 (9张)
│   │       ├── mall/                 #     商城商品图 (8张)
│   │       └── *.svg                 #     TabBar图标 (10个SVG)
│   ├── pages.json                    # [配置] 页面路由+TabBar+导航栏
│   ├── uni.scss                      # [样式] 全局CSS变量+工具类
│   ├── App.vue                       # [入口] Vue根组件
│   └── main.js                       # [入口] Vue初始化
├── dist/                             # [构建输出] H5编译产物 (npm run build:h5)
│   └── build/h5/                     #   H5打包文件(嵌入后端)
├── package.json                      # NPM 依赖
└── README.md                         # 项目说明
```

---

## 模块 B：后端 API 服务 (Go)

```
cmd/                                  # [程序入口]
└── server/
    └── main.go                       # 主函数：初始化DB→注册路由→启动HTTP→优雅关闭

internal/                             # [核心代码] 不对外暴露
├── config/                           # [配置] 环境变量读取
│   └── config.go                     #   DB/JWT/Admin/微信 配置项
├── handler/                          # [控制器] HTTP请求处理
│   ├── auth.go                       #   微信登录
│   ├── auth_test.go                  #   登录测试
│   ├── product.go                    #   货源CRUD+搜索
│   ├── trade.go                      #   交易创建+接单+销售记录
│   ├── trade_test.go                 #   交易测试
│   ├── settlement.go                 #   结算查询+汇总
│   ├── logistics.go                  #   物流CRUD+状态更新
│   ├── market.go                     #   行情价格查询+走势+汇总
│   ├── mall.go                       #   商城: 商品/购物车/订单
│   ├── admin.go                      #   Admin v1: 旧版后台接口
│   ├── admin_v2.go                   #   Admin v2: 登录/仪表盘/审核/配置
│   ├── gaps.go                       #   供需/通知/物流时间线/审计日志
│   ├── square.go                     #   需求广场: 帖子/关注/点赞/评论/电话
│   ├── upload.go                     #   图片上传 (multipart/form-data)
│   ├── info.go                       #   商务服务摘要
│   ├── transport.go                  #   运输面板
│   └── procurement.go               #   采购发布
├── middleware/                       # [中间件] 请求拦截
│   ├── auth.go                       #   JWT认证 (用户端)
│   ├── admin.go                      #   Bearer Token认证 (Admin) + 审计日志 + 失败限流
│   ├── security.go                   #   安全头 + 内容审核 + 手机号脱敏 + 查看限流
│   ├── validator.go                  #   请求体大小限制
│   └── cors.go                       #   跨域配置 (如存在)
├── model/                            # [数据模型] 数据库表映射
│   ├── user.go                       #   用户表
│   ├── product.go                    #   货源表
│   ├── trade.go                      #   交易订单表
│   ├── settlement.go                 #   结算表
│   ├── mall.go                       #   商城商品/购物车/订单表
│   ├── gaps.go                       #   采购/通知/物流时间线/供需表
│   ├── square.go                     #   帖子/关注/点赞/评论表
│   └── admin.go                      #   管理员/Banner/公告/站点配置表
├── repository/                       # [数据访问层] 数据库CRUD
│   ├── user.go                       #   用户查询
│   ├── product.go                    #   货源搜索+分类筛选
│   ├── trade.go                      #   交易+销售记录
│   ├── settlement.go                 #   结算CRUD
│   ├── logistics.go                  #   物流CRUD
│   ├── mall.go                       #   商城CRUD+事务
│   ├── admin.go                      #   仪表盘+用户+订单+商品+Admin v2全部
│   ├── gaps.go                       #   供需+通知+时间线+审计
│   └── square.go                     #   帖子/关注/点赞/评论 CRUD
├── service/                          # [业务逻辑] 复杂业务编排
│   ├── auth.go                       #   微信登录+JWT生成
│   ├── product.go                    #   货源业务
│   ├── market_updater.go             #   行情价格自动更新 (6h定时)
│   └── mail.go                       #   邮件通知+国际化
└── static/                           # [静态嵌入] Go embed打包
    ├── embed.go                      #   嵌入web/ admin/目录
    ├── web/                          #   小程序H5前端文件 (构建产物)
    └── admin/                        #   PC后台HTML (index.html)
        └── index.html                #     Admin完整SPA:登录+7个功能页

migrations/                           # [数据库迁移] SQL版本管理
├── 001_init.sql                      # 初始建表 (users/products/trades/…)
├── 002_mall.sql                      # 商城表 (mall_*)
├── 003_mall_seed.sql                 # 商城种子数据 (12个商品)
├── 004_backend_gap.sql               # 供需/通知/物流时间线表
├── 005_admin_audit.sql               # 操作审计日志表
├── 006_square.sql                    # 需求广场社交表 (posts/follows/likes/comments)
├── 007_test_data.sql                 # 测试数据 (5用户+7产品+3帖子+…)
├── 008_admin_v2.sql                  # Admin表 (admins/banners/announcements)
└── 009_site_config.sql               # 站点配置表 (模块开关+Banner内容)

deploy/                               # [部署运维]
├── deploy.sh                         # 一键部署脚本
├── freshbridge.service               # Systemd 服务配置
├── nginx.conf                        # Nginx 反向代理
├── backup.sh                         # 数据库自动备份 (每日2:00)
└── .env.production                   # 生产环境变量模板
```

---

## 模块 C：PC Admin 管理后台

```
internal/static/admin/                # [后台前端] 纯 HTML+CSS+JS，Go embed 嵌入
└── index.html                        # 完整 SPA 后台 (~500行)
    │                                 #   ├─ 登录页 (账号密码)
    │                                 #   ├─ 📊 数据仪表盘 (8项核心指标)
    │                                 #   ├─ 👥 用户管理 (列表+角色标签+认证操作)
    │                                 #   ├─ 📦 帖子审核 (通过/驳回/置顶)
    │                                 #   ├─ 📈 行情管理 (价格查看)
    │                                 #   ├─ 🔔 资讯公告 (新增/删除)
    │                                 #   ├─ 🖼️ Banner管理 (图片上传+预览+删除)
    │                                 #   └─ ⚙️ 模块开关 (首页8模块显隐+Banner内容编辑)
```

---

## 数据库表清单 (21 张)

| 表名 | 用途 | 模块 |
|------|------|------|
| `users` | 用户信息+认证+角色 | 用户 |
| `products` | 货源发布 | 货源 |
| `trade_orders` | 交易订单 | 交易 |
| `sales_records` | 销售记录 | 交易 |
| `settlements` | 结算对账 | 结算 |
| `logistics` | 物流运单 | 物流 |
| `logistics_timeline` | 物流时间线 | 物流 |
| `market_prices` | 行情价格 | 行情 |
| `mall_products` | 商城商品 | 商城 |
| `mall_cart_items` | 购物车 | 商城 |
| `mall_orders` | 商城订单 | 商城 |
| `mall_order_items` | 订单明细 | 商城 |
| `supply_demand` | 大宗供需 | 供需 |
| `procurements` | 采购发布 | 采购 |
| `notifications` | 消息通知 | 消息 |
| `admin_audit_logs` | 审计日志 | 系统 |
| `square_posts` | 需求广场帖子 | 社交 |
| `square_follows` | 关注关系 | 社交 |
| `square_likes` | 点赞记录 | 社交 |
| `square_comments` | 评论内容 | 社交 |
| `admins` | 管理员账号 | Admin |
| `banners` | Banner管理 | Admin |
| `announcements` | 资讯公告 | Admin |
| `site_config` | 站点配置 | Admin |

---

## 技术栈总览

| 层级 | 技术 |
|------|------|
| 小程序前端 | uni-app (Vue3 Composition API) + SCSS |
| 后端 API | Go 1.26 + Gin + GORM + MySQL 8.0 |
| Admin 后台 | 纯 HTML5 + CSS3 + Vanilla JS (SPA) |
| 部署 | 阿里云 ECS + Nginx + Systemd + Go embed 单二进制 |
| 数据库 | MySQL 8.0 (阿里云本地) |
| 认证 | JWT (用户端) + Bearer Token (Admin) |
| 安全 | 限流/脱敏/内容审核/审计日志/自动备份 |
