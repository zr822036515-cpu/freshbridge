USE freshbridge;

-- 采购需求
CREATE TABLE procurements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(64) NOT NULL COMMENT '品类',
    variety VARCHAR(64) NOT NULL COMMENT '品种',
    quantity DECIMAL(10,2) NOT NULL COMMENT '采购量(斤)',
    price DECIMAL(10,2) DEFAULT 0 COMMENT '期望价格(元/斤)',
    grade VARCHAR(16) DEFAULT '' COMMENT '品质要求',
    delivery_date DATE COMMENT '期望交货时间',
    delivery_addr VARCHAR(256) DEFAULT '' COMMENT '收货地址',
    note VARCHAR(512) DEFAULT '' COMMENT '备注',
    status ENUM('open','matched','closed','cancelled') NOT NULL DEFAULT 'open',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB;

-- 消息通知
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type ENUM('system','trade','logistics','service') NOT NULL DEFAULT 'system',
    title VARCHAR(128) NOT NULL,
    content TEXT NOT NULL,
    link VARCHAR(256) DEFAULT '' COMMENT '跳转链接',
    is_read TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- 物流时间线
CREATE TABLE logistics_timeline (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    logistics_id BIGINT NOT NULL,
    status VARCHAR(32) NOT NULL COMMENT '状态: accepted/loading/in_transit/arrived/signed',
    description VARCHAR(256) NOT NULL COMMENT '描述',
    lat DOUBLE DEFAULT 0 COMMENT '纬度',
    lng DOUBLE DEFAULT 0 COMMENT '经度',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_logistics (logistics_id)
) ENGINE=InnoDB;

-- 供需信息
CREATE TABLE supply_demand (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('supply','demand') NOT NULL COMMENT '供应/需求',
    variety VARCHAR(64) NOT NULL,
    quantity VARCHAR(32) NOT NULL COMMENT '数量描述',
    price VARCHAR(32) NOT NULL COMMENT '价格描述',
    origin VARCHAR(64) DEFAULT '' COMMENT '产地(供应)/采购方(需求)',
    contact VARCHAR(64) DEFAULT '' COMMENT '联系方式',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1有效 0过期',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;
