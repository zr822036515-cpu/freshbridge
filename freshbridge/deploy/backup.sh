#!/usr/bin/env bash
# 鲜桥 FreshBridge 数据库自动备份脚本
set -euo pipefail

BACKUP_DIR="/opt/freshbridge/backups"
DB_NAME="freshbridge"
DB_USER="root"
DB_PASS="Fr8shBr!dge2026"
RETENTION_DAYS=30

mkdir -p "${BACKUP_DIR}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

# Dump + compress
mysqldump -u"${DB_USER}" -p"${DB_PASS}" --single-transaction --routines --triggers "${DB_NAME}" | gzip > "${BACKUP_FILE}"

# Clean old backups
find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# Keep only 5 most recent if storage is tight
ls -t "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | tail -n +6 | xargs -r rm -f

echo "[$(date)] Backup: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))" >> "${BACKUP_DIR}/backup.log"
