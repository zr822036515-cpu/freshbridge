#!/usr/bin/env bash
set -euo pipefail

# 鲜桥 FreshBridge 一键部署脚本
# Usage: bash deploy.sh [--backend-only] [--frontend-only]

DEPLOY_ROOT="/opt/freshbridge"
BACKEND_DIR="${DEPLOY_ROOT}/backend"
WEB_DIR="${DEPLOY_ROOT}/web"
NGINX_CONF="/etc/nginx/sites-enabled/freshbridge.conf"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

BACKEND_ONLY=false
FRONTEND_ONLY=false
[[ "${1:-}" == "--backend-only" ]] && BACKEND_ONLY=true
[[ "${1:-}" == "--frontend-only" ]] && FRONTEND_ONLY=true

# --- Backend ---
if ! $FRONTEND_ONLY; then
    log "Building backend..."
    cd "$(dirname "$0")/.."
    go build -ldflags="-s -w" -o "${BACKEND_DIR}/server" ./cmd/server || err "Backend build failed"

    mkdir -p "${BACKEND_DIR}"
    cp cmd/server/server "${BACKEND_DIR}/" 2>/dev/null || true

    # Restart service
    if systemctl is-active --quiet freshbridge 2>/dev/null; then
        log "Restarting freshbridge service..."
        systemctl restart freshbridge
    else
        log "Backend binary built to ${BACKEND_DIR}/server"
        log "Start manually: ${BACKEND_DIR}/server &"
    fi
fi

# --- Frontend ---
if ! $BACKEND_ONLY; then
    log "Building frontend..."
    cd "$(dirname "$0")/.."
    (cd miniprogram && npm run build:h5) || err "Frontend build failed"

    mkdir -p "${WEB_DIR}"
    rm -rf "${WEB_DIR:?}"/*
    cp -r miniprogram/dist/build/h5/* "${WEB_DIR}/"

    # Reload nginx
    if systemctl is-active --quiet nginx 2>/dev/null; then
        log "Reloading nginx..."
        cp deploy/nginx.conf "${NGINX_CONF}"
        nginx -t && systemctl reload nginx
    else
        log "Frontend files copied to ${WEB_DIR}/"
        log "Install nginx config: cp deploy/nginx.conf ${NGINX_CONF}"
    fi
fi

log "Deploy complete."
