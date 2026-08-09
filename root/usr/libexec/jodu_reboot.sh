#!/bin/sh
IP=$(uci -q get jodu52140.main.ip || echo "192.168.225.1")
USER=$(uci -q get jodu52140.main.user || echo "root")
PASS=$(uci -q get jodu52140.main.pass || echo "oelinux123")

(
    sleep 1
    echo "$USER"
    sleep 1
    echo "$PASS"
    sleep 1
    echo "reboot"
    sleep 1
    echo "exit"
    sleep 2
) | nc "$IP" 23 >/dev/null 2>&1 &

TELNET_PID=$!
sleep 10
kill -9 $TELNET_PID 2>/dev/null
killall -9 nc 2>/dev/null
