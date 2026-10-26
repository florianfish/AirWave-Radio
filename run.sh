#!/usr/bin/env bash
# ==============================================================================
# Home Assistant Add-on: Radios Françaises
# Entrypoint script for Home Assistant Supervisor & Docker
# ==============================================================================
set -e

log_info() {
    if command -v bashio::log.info &>/dev/null; then
        bashio::log.info "$1"
    else
        echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') $1"
    fi
}

log_info "=========================================================="
log_info "  Radios Françaises - Module Home Assistant"
log_info "  Europe 2 • NRJ • Fun Radio • Radio FG"
log_info "=========================================================="

CONFIG_PATH="/data/options.json"
DEFAULT_STATION="europe-2"
LOG_LEVEL="info"

if [ -f "$CONFIG_PATH" ]; then
    log_info "Chargement des options depuis ${CONFIG_PATH}..."
    if command -v jq &>/dev/null; then
        CONFIG_STATION=$(jq -r '.default_station // empty' "$CONFIG_PATH" 2>/dev/null || true)
        CONFIG_LOG_LEVEL=$(jq -r '.log_level // empty' "$CONFIG_PATH" 2>/dev/null || true)
        [ -n "$CONFIG_STATION" ] && DEFAULT_STATION="$CONFIG_STATION"
        [ -n "$CONFIG_LOG_LEVEL" ] && LOG_LEVEL="$CONFIG_LOG_LEVEL"
    fi
    log_info "Station sélectionnée: ${DEFAULT_STATION}"
    log_info "Niveau de journalisation: ${LOG_LEVEL}"
fi

export NODE_ENV=production
export PORT=3000
export DEFAULT_STATION

mkdir -p /data

log_info "Démarrage du serveur web et Ingress sur le port 3000..."
cd /app
exec node dist/server.cjs
