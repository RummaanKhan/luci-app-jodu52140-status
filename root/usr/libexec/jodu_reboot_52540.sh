#!/bin/sh
IP=$(/sbin/uci -q get jodu52540.main.ip || echo "192.168.225.1")
USER="root"
PASS="oelinux123"

(
    sleep 2
    echo "$USER"
    sleep 2
    echo "$PASS"
    sleep 2
    echo "reboot"
    sleep 2
    echo "exit"
    sleep 2
) | nc "$IP" 23 >/dev/null 2>&1 &

TELNET_PID=$!
sleep 15
kill -9 $TELNET_PID 2>/dev/null
killall -9 nc 2>/dev/null
