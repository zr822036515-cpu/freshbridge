# 鲜桥 UI 升级设计 — 精致高端农产品风格

日期：2026-06-05 | 参考：山姆会员店 | 范围：首页、货源、商城、我的

---

## 一、设计定位

精致高端农产品平台。核心关键词：**品质感、信任感、自然感**。

参考山姆会员店的设计语言：中性底色 + 白色卡片 + 深色点缀，大面积留白，信息层级清晰。避免全绿色调的视觉疲劳。

## 二、色彩体系

### 主色

| 角色 | 色值 | 用途 |
|------|------|------|
| Primary | `#0F3B2C` | 导航栏、主按钮、核心图标 |
| Primary-light | `#1A5C3E` | hover态、趋势箭头 |
| Accent-gold | `#C9A96E` | VIP标签、强调数字、分割装饰 |
| Gold-light | `#F5ECD7` | 会员卡背景、精选推荐区底色 |

### 中性色

| 角色 | 色值 | 用途 |
|------|------|------|
| Bg-page | `#F5F5F5` | 全局页面底色（微暖灰） |
| Card-white | `#FFFFFF` | 所有卡片背景 |
| Text-primary | `#1A1A1A` | 标题、正文、变体名 |
| Text-secondary | `#6B7280` | 描述、副标题 |
| Text-muted | `#9CA3AF` | 时间、标签、辅助信息 |
| Border-light | `#F0F0F0` | 微分割线 |
| Divider | `#E5E7EB` | 边界分割线 |

### 语义色

| 角色 | 色值 | 用途 |
|------|------|------|
| Up-green | `#16A34A` | 涨幅、正数 |
| Down-red | `#DC2626` | 跌幅、负数 |
| Status-pending | `#D97706` | 待处理状态 |
| Status-done | `#059669` | 已完成状态 |

### 渐变

- 导航栏/头部：`linear-gradient(135deg, #0F3B2C 0%, #1A5C3E 100%)`
- 金色会员区：`linear-gradient(135deg, #F5ECD7 0%, #FFFFFF 100%)`

### CSS 变量

所有页面统一使用 CSS 自定义属性，全局 `uni.scss` 定义。禁止硬编码色值。

```css
--primary: #0F3B2C;
--primary-light: #1A5C3E;
--gold: #C9A96E;
--gold-light: #F5ECD7;
--bg: #F5F5F5;
--text: #1A1A1A;
--text-secondary: #6B7280;
--text-muted: #9CA3AF;
--danger: #DC2626;
--up: #16A34A;
```

## 三、通用组件规范

### 卡片

- 白色背景，阴影：`box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06)`
- 圆角：`12rpx` 统一
- 无边框（取消现有的 `.card` 类边框）
- 卡片内边距：`24rpx`
- 卡片间距：`16rpx`

### 按钮

- 主按钮：`#0F3B2C` 背景，白色文字，圆角 `12rpx`，高度 `88rpx`
- 次按钮/描边：白底 `#0F3B2C` 描边，深绿文字
- 金色按钮（仅商城购买）：`#C9A96E` 背景
- 小标签按钮：`#0F3B2C` 或 `#C9A96E`，圆角 `8rpx`

### 间距

- 页面水平边距：`24rpx`
- 段落间距：`24rpx`
- 条目间距：`16rpx`
- 行内间距：`12rpx`

## 四、页面改动详情

### 4.1 首页 (pages/home/index.vue)

**改动项：**

1. **Banner 轮播区**（新增）
   - 3-4 张水果实拍大图，高度 320rpx，圆角 16rpx
   - 图片需插入：`/static/images/banner-1.jpg` ~ `banner-4.jpg`（用 placeholder 占位）
   - swiper 组件，指示器圆点金色

2. **快捷入口**（重构）
   - 4 列网格：品牌商城、全链路服务、大宗供需、品种排行
   - 每项：图标 64rpx + 文字 24rpx
   - 图标带圆角底色（浅绿/浅金背景）
   - 图片需插入：`/static/images/icon-mall.png`、`icon-service.png`、`icon-supply-demand.png`、`icon-ranking.png`

3. **实时行情快讯**（新增）
   - 滚动条，左图标 + 文字，单行 marquee 效果
   - 背景：`#F5ECD7` 浅金底

4. **热门品种排行**（优化）
   - 现有 10 条 → 改为卡片式列表
   - 每项：排名序号+变体名+价格+涨跌幅箭头
   - 前三名序号用金色/银色/铜色
   - 涨绿跌红小箭头

5. **底部更多入口**（保留）
   - 品牌商城横条卡片

### 4.2 货源页 (pages/supply/index.vue)

**改动项：**

1. **类目入口**（重构）
   - 三级分类 → 改为 3×3 图片网格
   - 9 个 L1 类目卡片，每张配实拍图+类目名
   - 图片需插入：`/static/images/category-apple.jpg` ~ `category-imported.jpg`

2. **品种卡片**（优化）
   - 白底阴影卡片，取消左绿边框
   - 变体名 36rpx 深黑加粗
   - 产地+规格 24rpx 灰色
   - 价格 36rpx 深绿加粗
   - "发布货源" 按钮改为深绿小标签

### 4.3 品牌商城 (pages/mall/)

**改动项：**

1. **商品网格**（优化）
   - 两列瀑布流 → 两列固定高度卡片
   - 每个商品带实拍图 placeholder（240rpx 高）
   - 图片需插入：按商品 seed 数据对应，`/static/images/mall/product-{id}.jpg`
   - 价格用金色 `#C9A96E`
   - 加入购物车按钮金色

2. **购物车/结算/订单**（小幅调整）
   - 统一卡片风格
   - 主按钮改金色

### 4.4 我的 (pages/mine/index.vue)

**改动项：**

1. **头部卡片**（重构）
   - 深绿渐变背景 `linear-gradient(135deg, #0F3B2C, #1A5C3E)`
   - 头像 + 昵称 + 金色会员等级标签
   - 头部下方弧线过渡

2. **功能菜单**（优化）
   - 图标统一线框风格（SVG）
   - 增加金色箭头指示
   - 菜单项间细分割线

## 五、图片资源清单

需要插入的图片占位：

| 序号 | 路径 | 尺寸 | 用途 |
|------|------|------|------|
| 1 | `static/images/banner-1.jpg` | 690×320 | 首页轮播1 |
| 2 | `static/images/banner-2.jpg` | 690×320 | 首页轮播2 |
| 3 | `static/images/banner-3.jpg` | 690×320 | 首页轮播3 |
| 4 | `static/images/banner-4.jpg` | 690×320 | 首页轮播4 |
| 5-8 | `static/images/icon-mall.png` 等 | 128×128 | 快捷入口图标 |
| 9-17 | `static/images/category-*.jpg` | 200×150 | 货源类目图 |
| 18+ | `static/images/mall/product-*.jpg` | 320×240 | 商城商品图 |

## 六、实施策略

1. 先更新 `uni.scss` 全局变量和基础类
2. 改造首页 → 货源页 → 商城 → 我的
3. 每页改造完截图确认
4. 图片用 placeholder 色块占位，后续替换实拍图

## 七、不包括

- 其余 15 个页面不做改动（本次范围外）
- 不做字体系统切换（保留 PingFang SC）
- 图标不做全面替换，仅核心页面
