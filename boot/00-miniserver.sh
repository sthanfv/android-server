#!/system/bin/sh
# ══════════════════════════════════════════════════════════════════════
# 🚀 Mini Servidor Android — Script de Arranque Completo (Magisk / Boot)
# Ubicación: /data/adb/service.d/00-miniserver.sh
# 
# Arranca TODO al encender el teléfono con grupos de red (AID_INET 3003):
#   1. WakeLock (evita que Android suspenda la CPU)
#   2. SSH (acceso remoto en puerto 8022)
#   3. Tailscale VPN (lanza app Android o CLI daemon)
#   4. Dashboard de Telemetría (server.js en puerto 3000)
#   5. Ofertas Hunter Pro v3.0 (scraper empresarial)
#   6. PocketBase (base de datos en puerto 8090)
#   7. Notificación a Telegram (Alertas M10)
# ══════════════════════════════════════════════════════════════════════

# Esperar a que Android complete el boot
until [ $(getprop sys.boot_completed) -eq 1 ]; do
  sleep 3
done

# Esperar 10 segundos extra para conectividad
sleep 10

# ── Rutas de Termux ──
TERMUX_HOME="/data/data/com.termux/files/home"
TERMUX_BIN="/data/data/com.termux/files/usr/bin"
DASHBOARD_DIR="$TERMUX_HOME/termux-dashboard"
SCRAPER_DIR="$TERMUX_HOME/ofertas-hunter-pro"
BOOT_LOG="$DASHBOARD_DIR/logs/boot.log"

export PATH="$TERMUX_BIN:$PATH"
export LD_PRELOAD=""
export HOME="$TERMUX_HOME"

# Crear directorio de logs si no existe
mkdir -p "$DASHBOARD_DIR/logs" 2>/dev/null

echo "═══════════════════════════════════════════" >> "$BOOT_LOG"
echo "[$(date)] 🚀 ARRANQUE DEL SISTEMA INICIADO" >> "$BOOT_LOG"
echo "═══════════════════════════════════════════" >> "$BOOT_LOG"

# ══════════════════════════════════════════
# 1. WAKELOCK — Evitar suspensión de CPU
# ══════════════════════════════════════════
echo "miniserver_lock" > /sys/power/wake_lock 2>/dev/null
echo "[$(date)] ✅ WakeLock adquirido" >> "$BOOT_LOG"

# ══════════════════════════════════════════
# 2. SSH — Acceso remoto (u0_a106 con AID_INET 3003)
# ══════════════════════════════════════════
if ! pgrep -f "$TERMUX_BIN/sshd" > /dev/null; then
  su u0_a106 -G 3003 -c "$TERMUX_BIN/sshd" 2>> "$BOOT_LOG"
  echo "[$(date)] ✅ SSH iniciado" >> "$BOOT_LOG"
else
  echo "[$(date)] ℹ️ SSH ya estaba corriendo" >> "$BOOT_LOG"
fi

# ══════════════════════════════════════════
# 3. TAILSCALE VPN — Soporte para App Android y CLI
# ══════════════════════════════════════════
if pm list packages | grep -q "com.tailscale.ipn"; then
  # Iniciar y despertar la app de Tailscale en Android
  am start -n com.tailscale.ipn/com.tailscale.ipn.MainActivity > /dev/null 2>&1
  echo "[$(date)] ✅ Tailscale VPN (App Android iniciada)" >> "$BOOT_LOG"
elif [ -f "$TERMUX_BIN/tailscaled" ]; then
  if ! pgrep -f "tailscaled" > /dev/null; then
    nohup $TERMUX_BIN/tailscaled --tun=userspace-networking --socket=$TERMUX_HOME/.tailscale/tailscaled.sock --state=$TERMUX_HOME/.tailscale/tailscaled.state > /dev/null 2>&1 &
    sleep 3
    $TERMUX_BIN/tailscale up --accept-routes --socket=$TERMUX_HOME/.tailscale/tailscaled.sock 2>> "$BOOT_LOG"
    echo "[$(date)] ✅ Tailscale VPN (CLI daemon iniciado)" >> "$BOOT_LOG"
  else
    echo "[$(date)] ℹ️ Tailscale ya estaba corriendo" >> "$BOOT_LOG"
  fi
else
  echo "[$(date)] ⚠️ Tailscale no encontrado" >> "$BOOT_LOG"
fi

# ══════════════════════════════════════════
# 4. DASHBOARD DE TELEMETRÍA — Panel de monitoreo
# ══════════════════════════════════════════
if [ -d "$DASHBOARD_DIR" ]; then
  pkill -f "server.js" 2>/dev/null
  pkill -f "index.js" 2>/dev/null
  killall -9 node 2>/dev/null
  sleep 1
  su u0_a106 -G 3003 -c "export PATH=$TERMUX_BIN:\$PATH; export HOME=$TERMUX_HOME; cd $DASHBOARD_DIR && nohup $TERMUX_BIN/node server.js > $DASHBOARD_DIR/server.log 2>&1 &"
  echo "[$(date)] ✅ Dashboard iniciado (Puerto 3000)" >> "$BOOT_LOG"
else
  echo "[$(date)] ❌ Dashboard no encontrado en $DASHBOARD_DIR" >> "$BOOT_LOG"
fi

# Esperar a que el dashboard levante antes de arrancar el scraper
sleep 3

# ══════════════════════════════════════════
# 5. OFERTAS HUNTER PRO v3.0 — Scraper empresarial
# ══════════════════════════════════════════
if [ -d "$SCRAPER_DIR" ]; then
  pkill -f "index.js" 2>/dev/null
  sleep 1
  su u0_a106 -G 3003 -c "export PATH=$TERMUX_BIN:\$PATH; export HOME=$TERMUX_HOME; cd $SCRAPER_DIR && nohup $TERMUX_BIN/node index.js > $SCRAPER_DIR/data/logs/scraper.log 2>&1 &"
  echo "[$(date)] ✅ Ofertas Hunter Pro v3.0 iniciado (Daemon)" >> "$BOOT_LOG"
else
  echo "[$(date)] ❌ Scraper no encontrado en $SCRAPER_DIR" >> "$BOOT_LOG"
fi

# ══════════════════════════════════════════
# 6. NOTIFICACIÓN A TELEGRAM (Alertas M10)
# ══════════════════════════════════════════
sleep 5

if [ -f "$SCRAPER_DIR/.env" ]; then
  BOT_TOKEN=$(grep "^TELEGRAM_BOT_TOKEN=" "$SCRAPER_DIR/.env" | cut -d'=' -f2)
  CHAT_ID=$(grep "^TELEGRAM_CHAT_PRIVADO=" "$SCRAPER_DIR/.env" | cut -d'=' -f2)
  
  if [ -n "$BOT_TOKEN" ] && [ -n "$CHAT_ID" ]; then
    BATTERY=$(cat /sys/class/power_supply/battery/capacity 2>/dev/null || echo "?")
    STATUS_BAT=$(cat /sys/class/power_supply/battery/status 2>/dev/null || echo "?")
    
    # Extraer IP de wlan0 de forma confiable, si falla intenta con ip route
    IP_LOCAL=$(ifconfig wlan0 2>/dev/null | awk '/inet / {print $2}')
    if [ -z "$IP_LOCAL" ]; then
      IP_LOCAL=$(ip route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}')
    fi
    [ -z "$IP_LOCAL" ] && IP_LOCAL="Desconocida"

    TAILSCALE_IP=$(ip a show tun0 2>/dev/null | grep "inet " | awk '{print $2}' | cut -d'/' -f1 || echo "100.108.43.122")
    
    # Fecha en formato 12 horas (AM/PM)
    FECHA=$(date "+%Y-%m-%d %I:%M:%S %p")
    
    SERVICIOS=""
    pgrep -f "node.*server.js" > /dev/null && SERVICIOS="${SERVICIOS}   ✅ Dashboard (Puerto 3000)\n" || SERVICIOS="${SERVICIOS}   ❌ Dashboard\n"
    pgrep -f "node.*index.js" > /dev/null && SERVICIOS="${SERVICIOS}   ✅ Motor Estadístico B2B (Activo)\n" || SERVICIOS="${SERVICIOS}   ❌ Motor Estadístico\n"
    (pgrep -f "com.tailscale.ipn" > /dev/null || pgrep -f "tailscaled" > /dev/null) && SERVICIOS="${SERVICIOS}   ✅ Tailscale VPN (Activo)\n" || SERVICIOS="${SERVICIOS}   ❌ Tailscale\n"
    pgrep -f "sshd" > /dev/null && SERVICIOS="${SERVICIOS}   ✅ SSH (Puerto 8022)\n" || SERVICIOS="${SERVICIOS}   ❌ SSH\n"
    
    MENSAJE="🚀 *[CAPA 1 - HARDWARE] ENCENDIDO*
  
  📅 *Fecha:* \`${FECHA}\`
  🔋 *Batería:* \`${BATTERY}%\` (${STATUS_BAT})
  🏠 *IP Local Wi-Fi:* \`http://${IP_LOCAL}:3000\`
  🌍 *IP Tailscale VPN:* \`http://${TAILSCALE_IP}:3000\`
  
  🛠️ *Servicios Operativos:*
  ${SERVICIOS}
  🤖 Motor B2B en línea y protegiendo el sistema."

    $TERMUX_BIN/curl -s -X POST \
      "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
      -H "Content-Type: application/json" \
      -d "{\"chat_id\":\"${CHAT_ID}\",\"text\":\"${MENSAJE}\",\"parse_mode\":\"Markdown\"}" \
      >> "$BOOT_LOG" 2>&1
    
    echo "[$(date)] ✅ Notificación de arranque enviada a Alertas M10" >> "$BOOT_LOG"
  fi
fi

echo "[$(date)] 🏁 ARRANQUE COMPLETO — Todos los servicios iniciados" >> "$BOOT_LOG"
echo "═══════════════════════════════════════════" >> "$BOOT_LOG"
