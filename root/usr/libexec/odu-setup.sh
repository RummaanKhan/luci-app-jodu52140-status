#!/bin/sh

trap 'rm -f /tmp/odu_setup.lock' EXIT

IP=$(/sbin/uci -q get jodu52140.main.ip || echo "192.168.225.1")
USER=$(/sbin/uci -q get jodu52140.main.user || echo "root")
PASS=$(/sbin/uci -q get jodu52140.main.pass || echo "oelinux123")

NR_ARFCN=$(/sbin/uci -q get jodu52140.main.arfcn)
NR_PCI=$(/sbin/uci -q get jodu52140.main.pci)

if [ -z "$NR_ARFCN" ] || [ -z "$NR_PCI" ]; then
    AT_CMD='AT+QNWLOCK="common/5g",0'
else
    AT_CMD="AT+QNWLOCK=\"common/5g\",${NR_PCI},${NR_ARFCN},30,78"
fi

(
sleep 2
echo "$USER"
sleep 2
echo "$PASS"
sleep 2

echo "lux_atc '$AT_CMD'"
sleep 2

echo "rm -f /usrdata/odu_dashboard.sh /etc/systemd/system/odu-dashboard.service"
sleep 1

echo "cat << 'EOF' > /usrdata/odu_dashboard.sh"
echo "#!/bin/sh"
echo "mkdir -p /tmp/www"
echo "while true; do"
echo "    if ! pidof httpd > /dev/null; then"
echo "        httpd -p 8080 -h /tmp/www"
echo "    fi"
echo "    SERVING=\$(ubus call luxslam 5g '{\"cmd\":\"get\",\"class\":\"serving_cell\"}')"
echo "    SECONDARY=\$(ubus call luxslam 5g '{\"cmd\":\"get\",\"class\":\"secondary_cell\"}')"
echo "    NETWORK=\$(ubus call luxslam 5g '{\"cmd\":\"get\",\"class\":\"network\"}')"
echo "    QTEMP=\"\""
echo "    if [ -x /usr/bin/lux_atc ]; then"
echo "        QTEMP=\$(/usr/bin/lux_atc 'AT+QTEMP')"
echo "    elif command -v lux_atc >/dev/null 2>&1; then"
echo "        QTEMP=\$(lux_atc 'AT+QTEMP')"
echo "    else"
echo "        raw_t=\$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo \"0\")"
echo "        deg_t=\$((raw_t / 1000))"
echo "        QTEMP=\"cpuss-0-usr, \$deg_t\""
echo "    fi"
echo "    {"
echo "        echo \"---SERVING---\""
echo "        echo \"\$SERVING\""
echo "        echo \"---SECONDARY---\""
echo "        echo \"\$SECONDARY\""
echo "        echo \"---NETWORK---\""
echo "        echo \"\$NETWORK\""
echo "        echo \"---QTEMP---\""
echo "        echo \"\$QTEMP\""
echo "        echo \"---UPTIME---\""
echo "        cat /proc/uptime"
echo "    } > /tmp/www/status.tmp"
echo "    mv /tmp/www/status.tmp /tmp/www/status.txt"
echo "    sleep 2"
echo "done"
echo "EOF"
sleep 2

echo "chmod +x /usrdata/odu_dashboard.sh"
sleep 1

echo "cat << 'SVC_EOF' > /etc/systemd/system/odu-dashboard.service"
echo "[Unit]"
echo "Description=ODU 5G Dashboard Ubus Proxy"
echo "After=network.target"
echo ""
echo "[Service]"
echo "ExecStart=/usrdata/odu_dashboard.sh"
echo "Restart=always"
echo ""
echo "[Install]"
echo "WantedBy=multi-user.target"
echo "SVC_EOF"
sleep 2

echo "systemctl daemon-reload"
sleep 1
echo "systemctl enable odu-dashboard.service"
sleep 1
echo "systemctl restart odu-dashboard.service"
sleep 1
echo "exit"
sleep 2
) | nc "$IP" 23 > /tmp/odu_setup.log 2>&1 &

TELNET_PID=$!
sleep 20
kill -9 $TELNET_PID 2>/dev/null
killall -9 nc 2>/dev/null
