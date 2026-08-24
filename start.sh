#!/data/data/com.termux/files/usr/bin/sh
cd /data/data/com.termux/files/home/termux-dashboard
export PATH=/data/data/com.termux/files/usr/bin:$PATH
pkill -f "node server.js" 2>/dev/null
sleep 1
nohup node server.js > server.log 2>&1 &
echo "Servidor iniciado con PID $!"
