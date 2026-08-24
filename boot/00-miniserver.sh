#!/system/bin/sh
# ==============================================================================
# Mini Servidor Android - Script de Arranque Temprano para Magisk (service.d)
# Ubicación: /data/adb/service.d/00-miniserver.sh
# ==============================================================================

# Esperar a que el sistema y almacenamiento estén listos
until [ $(getprop sys.boot_completed) -eq 1 ]; do
  sleep 3
done

sleep 5

# Adquirir WakeLock para que Android no suspenda la CPU
echo "miniserver_lock" > /sys/power/wake_lock 2>/dev/null

TERMUX_HOME="/data/data/com.termux/files/home"
TERMUX_BIN="/data/data/com.termux/files/usr/bin"
DASHBOARD_DIR="$TERMUX_HOME/termux-dashboard"

# Exportar rutas de Termux
export PATH="$TERMUX_BIN:$PATH"
export LD_PRELOAD=""

# 1. Iniciar Servidor SSH si no está corriendo
if ! pgrep -f "$TERMUX_BIN/sshd" > /dev/null; then
  su u0_a106 -c "$TERMUX_BIN/sshd"
fi

# 2. Iniciar Servidor Express de Telemetría y Supervisor de Procesos
if [ -d "$DASHBOARD_DIR" ]; then
  pkill -f "node server.js" 2>/dev/null
  sleep 1
  nohup $TERMUX_BIN/node $DASHBOARD_DIR/server.js > $DASHBOARD_DIR/server.log 2>&1 &
fi
