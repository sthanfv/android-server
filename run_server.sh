#!/system/bin/sh
export TERMUX_USER=$(ls -ld /data/data/com.termux/files/home | awk '{print $3}')
su - $TERMUX_USER -c 'export PATH=/data/data/com.termux/files/usr/bin:$PATH && cd /data/data/com.termux/files/home/termux-dashboard && node server.js'
