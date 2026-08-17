#!/bin/sh
# /usr/libexec/jodu_lock_52540.sh - Locks or unlocks 5G NR Cell on Jio ODU 52540

IP=$(/sbin/uci -q get jodu52540.main.ip || echo "192.168.225.1")
USER="root"
PASS="oelinux123"

NR_ARFCN="$1"
NR_PCI="$2"

[ -z "$NR_ARFCN" ] && NR_ARFCN=$(/sbin/uci -q get jodu52540.main.arfcn)
[ -z "$NR_PCI" ] && NR_PCI=$(/sbin/uci -q get jodu52540.main.pci)

# Format AT Command
if [ -z "$NR_ARFCN" ] || [ -z "$NR_PCI" ]; then
    AT_CMD='AT+QNWLOCK="COMMON/5G",0'
else
    # Automatically determine SCS and Band from ARFCN
    SCS="30"
    BAND="78"
    if [ "$NR_ARFCN" -lt 200000 ] 2>/dev/null; then
        SCS="15"
        BAND="28"
    fi
    AT_CMD="AT+QNWLOCK=\"COMMON/5G\",${NR_PCI},${NR_ARFCN},${SCS},${BAND}"
fi

# Execute over Telnet
OUTPUT=$( (
    sleep 2
    echo "$USER"
    sleep 2
    echo "$PASS"
    sleep 2
    echo "lux_atc '$AT_CMD'"
    sleep 2
    echo "exit"
    sleep 1
) | nc "$IP" 23 2>/dev/null )

echo "$OUTPUT" | sed -n "/lux_atc '$AT_CMD'/,/root@sdxlemur:~#/p" | tail -n +2 | head -n -1
