#!/usr/bin/env bash
set -euo pipefail

# 鲜桥 FreshBridge 一键部署脚本
# Usage: bash deploy.sh [--init-db]

DEPLOY_ROOT="/opt/freshbridge"
BACKEND_DIR="${DEPLOY_ROOT}/backend"
ENV_FILE="${DEPLOY_ROOT}/backend/.env"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

INIT_DB=false
[[ "${1:-}" == "--init-db" ]] && INIT_DB=true

# --- Init DB (first deploy only) ---
if $INIT_DB; then
    log "Initializing database..."
    cd "$(dirname "$0")/.."
    mysql -u root --default-character-set=utf8mb4 < migrations/001_init.sql || err "Schema init failed"
    mysql -u root --default-character-set=utf8mb4 freshbridge < migrations/002_seed.sql || err "Seed data import failed"
    log "Database initialized with seed data"
fi

# --- Build frontend ---
log "Building frontend..."
cd "$(dirname "$0")/.."
(cd miniprogram && npm install --silent && npm run build:h5) || err "Frontend build failed"

# --- Copy frontend to embed directory ---
log "Embedding frontend..."
rm -rf internal/static/web
mkdir -p internal/static/web
cp -r miniprogram/dist/build/h5/* internal/static/web/

# --- Build single binary (API + frontend) ---
log "Building server..."
go build -ldflags="-s -w" -o "${BACKEND_DIR}/server" ./cmd/server || err "Build failed"

# --- Setup env if missing ---
if [ ! -f "${ENV_FILE}" ]; then
    mkdir -p "${BACKEND_DIR}"
    cp deploy/.env.production "${ENV_FILE}"
    log "Created ${ENV_FILE} — PLEASE EDIT DB_DSN password!"
fi

# --- Restart service ---
if systemctl is-active --quiet freshbridge 2>/dev/null; then
    log "Restarting freshbridge service..."
    systemctl restart freshbridge
    systemctl status freshbridge --no-pager
else
    log "Installing systemd service..."
    cp deploy/freshbridge.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable --now freshbridge
    log "Service started. Check: systemctl status freshbridge"
fi

log "Deploy complete — http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'localhost'):8080"
