#!/bin/sh

touch /tmp/odu_setup.lock
trap 'rm -f /tmp/odu_setup.lock' EXIT INT TERM HUP

IP=$(/sbin/uci -q get jodu52540.main.ip || echo "192.168.225.1")
USER="root"
PASS="oelinux123"

NR_ARFCN=$(/sbin/uci -q get jodu52540.main.arfcn)
NR_PCI=$(/sbin/uci -q get jodu52540.main.pci)

if [ -z "$NR_ARFCN" ] || [ -z "$NR_PCI" ]; then
    AT_CMD='AT+QNWLOCK="COMMON/5G",0'
else
    SCS="30"
    BAND="78"
    if [ "$NR_ARFCN" -lt 200000 ] 2>/dev/null; then
        SCS="15"
        BAND="28"
    fi
    AT_CMD="AT+QNWLOCK=\"COMMON/5G\",${NR_PCI},${NR_ARFCN},${SCS},${BAND}"
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
echo "killall -9 odu_dashboard.sh 2>/dev/null"
sleep 1

echo "cat << 'EOF' > /usrdata/odu_dashboard.sh"
echo "#!/bin/sh"
echo "mkdir -p /tmp/www"
echo "while true; do"
echo "    if ! pidof httpd > /dev/null; then"
echo "        httpd -p 8080 -h /tmp/www"
echo "    fi"
sleep 1
echo "    SERVING=\$(ubus call luxslam 5g '{\"cmd\":\"get\",\"class\":\"serving_cell\"}')"
echo "    SECONDARY=\$(ubus call luxslam 5g '{\"cmd\":\"get\",\"class\":\"secondary_cell\"}')"
echo "    NETWORK=\$(ubus call luxslam 5g '{\"cmd\":\"get\",\"class\":\"network\"}')"
echo "    CPU=\"0\""
echo "    read p_total p_idle < /tmp/odu_cpu_stat 2>/dev/null"
sleep 1
echo "    CPU=\$(awk -v pt=\"\$\{p_total:-0\}\" -v pi=\"\$\{p_idle:-0\}\" '/^cpu / { t=\$2+\$3+\$4+\$5+\$6+\$7+\$8+\$9; i=\$5; dt=t-pt; di=i-pi; if(pt>0 && dt>0) print int(100*(dt-di)/dt); else print \"0\"; print t\" \"i > \"/tmp/odu_cpu_stat\"; exit }' /proc/stat)"
echo "    QTEMP=\"\""
sleep 1
echo "    if [ -x /usr/bin/lux_atc ]; then"
echo "        QTEMP=\$(/usr/bin/lux_atc 'AT+QTEMP')"
echo "    elif command -v lux_atc >/dev/null 2>&1; then"
echo "        QTEMP=\$(lux_atc 'AT+QTEMP')"
echo "    else"
sleep 1
echo "        raw_t=\$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo \"0\")"
echo "        deg_t=\$(awk -v r=\"\$raw_t\" 'BEGIN {print int(r/1000)}')"
echo "        QTEMP=\"cpuss-0-usr, \$deg_t\""
echo "    fi"
echo "    {"
sleep 1
echo "        echo \"---SERVING---\""
echo "        echo \"\$SERVING\""
echo "        echo \"---SECONDARY---\""
echo "        echo \"\$SECONDARY\""
echo "        echo \"---NETWORK---\""
echo "        echo \"\$NETWORK\""
sleep 1
echo "        echo \"---CPU---\""
echo "        echo \"\$CPU\""
echo "        echo \"---QTEMP---\""
echo "        echo \"\$QTEMP\""
echo "        echo \"---UPTIME---\""
echo "        cat /proc/uptime"
echo "        echo \"---VERSION---\""
echo "        echo \"1.1.2\""
sleep 1
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
sleep 45
kill -9 $TELNET_PID 2>/dev/null
killall -9 nc 2>/dev/null
