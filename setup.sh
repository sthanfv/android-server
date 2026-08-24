#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# Script de Instalación Automatizada: Mini Servidor Android
# ==============================================================================

set -e

echo "=================================================="
echo "🚀 Instalando Mini Servidor en Android (Termux)..."
echo "=================================================="

# 1. Actualizar repositorios e instalar paquetes requeridos
echo "📦 Actualizando paquetes de Termux..."
pkg update -y
pkg install -y nodejs git openssh

# 2. Configurar directorio del proyecto
PROJECT_DIR="$HOME/termux-dashboard"
if [ ! -d "$PROJECT_DIR" ]; then
  mkdir -p "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# 3. Instalar dependencias de Node.js
echo "📦 Instalando dependencias de Node.js..."
npm install express systeminformation

# 4. Iniciar servicio
echo "🚀 Iniciando servidor de monitoreo y supervisor..."
pkill -f "node server.js" 2>/dev/null || true
sleep 1
nohup node server.js > server.log 2>&1 &

echo "=================================================="
echo "✅ Instalación completada con éxito!"
echo "📡 Accede desde tu navegador en el puerto 3000"
echo "=================================================="
