#!/bin/sh
CMD="$1"
[ -z "$CMD" ] && exit 1

IP=$(/sbin/uci -q get jodu52540.main.ip || echo "192.168.225.1")
USER="root"
PASS="oelinux123"

# Execute the AT command over Telnet
OUTPUT=$( (
    sleep 2
    echo "$USER"
    sleep 2
    echo "$PASS"
    sleep 2
    echo "lux_atc '$CMD'"
    sleep 2
    echo "exit"
    sleep 1
) | nc "$IP" 23 2>/dev/null )

# Extract the pure AT command response (ignoring login banners and prompt echoes)
# Find everything between the executed command and the exit prompt.
echo "$OUTPUT" | sed -n "/lux_atc '$CMD'/,/root@sdxlemur:~#/p" | tail -n +2 | head -n -1
