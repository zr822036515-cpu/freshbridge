-- 需求广场社交模块
CREATE TABLE IF NOT EXISTS square_posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(16) NOT NULL DEFAULT 'supply' COMMENT 'supply/demand',
    category VARCHAR(64) NOT NULL DEFAULT '',
    origin VARCHAR(128) NOT NULL DEFAULT '' COMMENT '产地',
    description TEXT NOT NULL COMMENT '货源描述文案',
    images TEXT NOT NULL COMMENT 'JSON array of image URLs',
    phone VARCHAR(20) NOT NULL DEFAULT '' COMMENT '脱敏手机号',
    real_phone VARCHAR(20) NOT NULL DEFAULT '' COMMENT '真实手机号',
    is_vip BOOLEAN NOT NULL DEFAULT FALSE,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否置顶',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '0=审核中 1=已通过 2=已驳回',
    review_msg VARCHAR(255) NOT NULL DEFAULT '',
    like_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_status_time (status, created_at DESC),
    INDEX idx_pinned_time (is_pinned DESC, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS square_follows (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    follower_id BIGINT NOT NULL COMMENT '关注者',
    followed_id BIGINT NOT NULL COMMENT '被关注者',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_follow (follower_id, followed_id),
    INDEX idx_followed (followed_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS square_likes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_like (user_id, post_id),
    INDEX idx_post (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS square_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    content VARCHAR(500) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_post (post_id, created_at ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 通用通知表（复用已有的 notifications 表，如不存在则创建）
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'system' COMMENT 'system/trade/logistics/service/social',
    title VARCHAR(255) NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    link VARCHAR(255) NOT NULL DEFAULT '',
    is_read TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_read (user_id, is_read, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
