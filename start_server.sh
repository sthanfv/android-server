#!/data/data/com.termux/files/usr/bin/sh
termux-wake-lock
su -c "nohup /data/data/com.termux/files/usr/bin/node /data/data/com.termux/files/home/termux-dashboard/server.js > /data/data/com.termux/files/home/termux-dashboard/logs/boot.log 2>&1 &"
