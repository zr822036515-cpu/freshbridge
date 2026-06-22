-- 站点配置表：Admin 后台控制前端模块显示
CREATE TABLE IF NOT EXISTS site_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(64) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT '',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 首页模块开关
INSERT INTO site_config (config_key, config_value, description) VALUES
('home_banner_enabled', 'true', '首页 Banner 轮播'),
('home_search_enabled', 'true', '首页搜索栏'),
('home_news_ticker_enabled', 'false', '首页行情资讯横条'),
('home_cta_enabled', 'true', '首页双按钮(发布供应/求购)'),
('home_service_entry_enabled', 'true', '首页全链路服务入口'),
('home_market_track_enabled', 'true', '首页行情溯源卡片'),
('home_notice_enabled', 'true', '首页平台公告'),
('home_ranking_enabled', 'true', '首页品种排行');

-- Banner 数据 (3条)
INSERT INTO site_config (config_key, config_value, description) VALUES
('banner_1_title', '产地直采', 'Banner1标题'),
('banner_1_sub', '源头把控 · 一手货源', 'Banner1副标题'),
('banner_1_img', '/static/images/banners/banner-1.jpg', 'Banner1图片'),
('banner_2_title', '全国档口', 'Banner2标题'),
('banner_2_sub', '快速去化 · 品质保证', 'Banner2副标题'),
('banner_2_img', '/static/images/banners/banner-2.jpg', 'Banner2图片'),
('banner_3_title', '品质溯源', 'Banner3标题'),
('banner_3_sub', '从枝头到舌尖的安心', 'Banner3副标题'),
('banner_3_img', '/static/images/banners/banner-3.jpg', 'Banner3图片');

-- 平台基础信息
INSERT INTO site_config (config_key, config_value, description) VALUES
('platform_name', '鲜桥 FreshBridge', '平台名称'),
('platform_slogan', '让农产品流通更简单', '平台标语'),
('platform_phone', '400-000-0000', '平台客服电话'),
('platform_wechat', 'freshbridge2026', '企业微信号');
