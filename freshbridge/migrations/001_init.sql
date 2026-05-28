CREATE DATABASE IF NOT EXISTS freshbridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE freshbridge;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    open_id VARCHAR(64) UNIQUE NOT NULL COMMENT '微信OpenID',
    union_id VARCHAR(64) DEFAULT '' COMMENT '微信UnionID',
    nickname VARCHAR(64) DEFAULT '',
    avatar_url VARCHAR(512) DEFAULT '',
    phone VARCHAR(20) DEFAULT '',
    role ENUM('farmer','stall','driver') NOT NULL DEFAULT 'farmer',
    real_name VARCHAR(32) DEFAULT '' COMMENT '实名',
    id_card VARCHAR(20) DEFAULT '' COMMENT '身份证号',
    verified TINYINT NOT NULL DEFAULT 0 COMMENT '实名认证 0未认证 1已认证',
    origin_province VARCHAR(32) DEFAULT '' COMMENT '产地-省',
    origin_city VARCHAR(32) DEFAULT '' COMMENT '产地-市',
    origin_district VARCHAR(32) DEFAULT '' COMMENT '产地-区',
    origin_altitude VARCHAR(16) DEFAULT '' COMMENT '海拔',
    origin_features TEXT COMMENT '产地特征JSON',
    credit_score INT NOT NULL DEFAULT 100 COMMENT '信用分',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id BIGINT NOT NULL,
    category VARCHAR(32) NOT NULL COMMENT '品类',
    variety VARCHAR(64) NOT NULL COMMENT '具体品种',
    spec VARCHAR(64) NOT NULL COMMENT '规格',
    grade VARCHAR(16) DEFAULT '一级果' COMMENT '等级',
    total_quantity DECIMAL(10,2) NOT NULL COMMENT '总产量(斤)',
    sold_quantity DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '已售(斤)',
    waste_quantity DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '损耗(斤)',
    price DECIMAL(10,2) NOT NULL COMMENT '预期单价(元/斤)',
    pricing_mode ENUM('fixed','floor_share') NOT NULL DEFAULT 'fixed' COMMENT '定价模式',
    commission_rate INT NOT NULL DEFAULT 25 COMMENT '接受佣金%',
    packaging VARCHAR(32) DEFAULT '纸箱' COMMENT '包装方式',
    min_order DECIMAL(10,2) DEFAULT 500 COMMENT '最小起订量(斤)',
    available_date DATE COMMENT '上市时间',
    origin_province VARCHAR(32) DEFAULT '',
    origin_city VARCHAR(32) DEFAULT '',
    origin_district VARCHAR(32) DEFAULT '',
    images TEXT COMMENT '图片JSON数组',
    urgent TINYINT NOT NULL DEFAULT 0 COMMENT '是否急售',
    status ENUM('pending','published','trading','sold_out','settled') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_farmer (farmer_id),
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB;

CREATE TABLE trade_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    farmer_id BIGINT NOT NULL,
    stall_id BIGINT NOT NULL,
    commission_rate INT NOT NULL COMMENT '佣金比例%',
    pricing_mode ENUM('fixed','floor_share') NOT NULL DEFAULT 'fixed',
    floor_price DECIMAL(10,2) DEFAULT 0 COMMENT '保底价',
    status ENUM('pending','accepted','shipping','selling','done','disputed','cancelled') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product (product_id),
    INDEX idx_farmer (farmer_id),
    INDEX idx_stall (stall_id)
) ENGINE=InnoDB;

CREATE TABLE sales_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trade_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    stall_id BIGINT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL COMMENT '售出数量(斤)',
    price DECIMAL(10,2) NOT NULL COMMENT '实际售价(元/斤)',
    total_amount DECIMAL(12,2) NOT NULL COMMENT '小计',
    record_method ENUM('voice','manual','ocr') NOT NULL DEFAULT 'manual',
    voice_text VARCHAR(512) DEFAULT '' COMMENT '语音原始文本',
    sale_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_trade (trade_id),
    INDEX idx_stall (stall_id),
    INDEX idx_sale_time (sale_time)
) ENGINE=InnoDB;

CREATE TABLE settlements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trade_id BIGINT NOT NULL,
    farmer_id BIGINT NOT NULL,
    stall_id BIGINT NOT NULL,
    total_sales DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '总销售额',
    platform_fee DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '平台服务费',
    logistics_fee DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '物流费',
    waste_deduction DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '损耗扣除',
    farmer_amount DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '农户实收',
    stall_commission DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '档口佣金',
    status ENUM('pending','confirmed','paid') NOT NULL DEFAULT 'pending',
    settled_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_trade (trade_id),
    INDEX idx_farmer (farmer_id)
) ENGINE=InnoDB;

CREATE TABLE logistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trade_id BIGINT DEFAULT NULL,
    farmer_id BIGINT NOT NULL,
    driver_id BIGINT DEFAULT NULL,
    origin_addr VARCHAR(256) NOT NULL,
    dest_addr VARCHAR(256) NOT NULL,
    cargo_desc VARCHAR(128) NOT NULL COMMENT '货物描述',
    cargo_weight DECIMAL(10,2) NOT NULL COMMENT '重量(吨)',
    vehicle_type VARCHAR(32) NOT NULL COMMENT '车型',
    distance_km INT DEFAULT 0 COMMENT '预估里程',
    price DECIMAL(10,2) NOT NULL COMMENT '运费',
    status ENUM('pending','accepted','loading','in_transit','arrived','signed') NOT NULL DEFAULT 'pending',
    load_time DATETIME COMMENT '装车时间',
    eta DATETIME COMMENT '预计到达',
    gps_lat DOUBLE DEFAULT 0 COMMENT '当前经度',
    gps_lng DOUBLE DEFAULT 0 COMMENT '当前纬度',
    signed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_driver (driver_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE market_prices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(32) NOT NULL,
    variety VARCHAR(64) NOT NULL,
    market_name VARCHAR(64) NOT NULL COMMENT '市场名称',
    price DECIMAL(10,2) NOT NULL COMMENT '均价',
    change_pct DECIMAL(5,2) DEFAULT 0 COMMENT '涨跌幅%',
    volume DECIMAL(10,2) DEFAULT 0 COMMENT '交易量(吨)',
    record_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date_category (record_date, category)
) ENGINE=InnoDB;
