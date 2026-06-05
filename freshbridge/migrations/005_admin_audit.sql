-- Admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_token VARCHAR(64) NOT NULL DEFAULT '',
    method VARCHAR(10) NOT NULL DEFAULT '',
    path VARCHAR(255) NOT NULL DEFAULT '',
    action VARCHAR(100) NOT NULL DEFAULT '',
    ip VARCHAR(45) NOT NULL DEFAULT '',
    status_code INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
