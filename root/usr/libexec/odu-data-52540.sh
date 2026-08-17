#!/bin/sh

IP=$(/sbin/uci -q get jodu52540.main.ip)
[ -z "$IP" ] && IP="192.168.225.1"

if [ -f /tmp/odu_force_setup ]; then
    NEW_IP=$(awk 'NR==1' /tmp/odu_force_setup)
    rm -f /tmp/odu_force_setup
    
    if [ -n "$NEW_IP" ]; then
        /sbin/uci set jodu52540.main.ip="$NEW_IP"
        /sbin/uci commit jodu52540
    fi
    
    IP=$(/sbin/uci -q get jodu52540.main.ip)
    [ -z "$IP" ] && IP="192.168.225.1"
    
    touch /tmp/odu_setup.lock
    /usr/libexec/odu-setup-52540.sh >/dev/null 2>&1 &
    echo '{"server_link":"CONFIGURING"}'
    exit 0
fi

# Try querying the ODU's CGI JSON endpoints (preferred)
NET=$(wget -q -O - -T 3 "http://$IP/cgi-bin/QCMAP_HFCL_CGI_Interface?Page=GetNetworkStatus" 2>/dev/null)

if [ -z "$NET" ]; then
    # fallback to the previous status.txt probe/setup flow
    STATUS=$(wget -q -O - -T 3 "http://$IP:8080/status.txt" 2>/dev/null | tr -d '\r')

    if ! echo "$STATUS" | grep -q -e '---UPTIME---' || ! echo "$STATUS" | grep -q -e '1.1.2'; then
        if [ -f /tmp/odu_setup.lock ]; then
            echo '{"server_link":"CONFIGURING"}'
            exit 0
        else
            touch /tmp/odu_setup.lock
            /usr/libexec/odu-setup-52540.sh >/dev/null 2>&1 &
            echo '{"server_link":"INITIALIZING"}'
            exit 0
        fi
    fi

    rm -f /tmp/odu_setup.lock

    # parse legacy status.txt format (unchanged)
    SERVING=$(echo "$STATUS" | sed -n '/---SERVING---/,/---SECONDARY---/p')
    STATE=$(echo "$SERVING" | grep '"status"' | awk -F'"' '{print $4}')
    BAND=$(echo "$SERVING" | grep '"nr5g"' | awk -F'"' '{print $4}')
    BW=$(echo "$SERVING" | grep '"bandwidth"' | head -n1 | awk -F':' '{print $2}' | tr -d ' ,')
    PCID=$(echo "$SERVING" | grep '"pci"' | head -n1 | awk -F':' '{print $2}' | tr -d ' ,')
    ARFCN=$(echo "$SERVING" | grep '"nr_arfcn"' | head -n1 | awk -F':' '{print $2}' | tr -d ' ,')
    RSRP=$(echo "$SERVING" | grep '"rsrp"' | head -n1 | awk -F':' '{print $2}' | tr -d ' ,')
    RSRQ=$(echo "$SERVING" | grep '"rsrq"' | head -n1 | awk -F':' '{print $2}' | tr -d ' ,')
    SINR=$(echo "$SERVING" | grep '"sinr"' | head -n1 | awk -F':' '{print $2}' | tr -d ' ,')
    BLER_RAW=$(echo "$SERVING" | grep '"bler"' | head -n1 | awk -F':' '{print $2}' | tr -d ' ,')
    MOD=$(echo "$SERVING" | grep '"modulation"' | head -n1 | awk -F'"' '{print $4}')
    MIMO=$(echo "$SERVING" | grep '"mimo"' | head -n1 | awk -F'"' '{print $4}')
    MCCMNC=$(echo "$SERVING" | grep '"plmn"' | head -n1 | awk -F'"' '{print $4}')
    DUPLEX="TDD"

    if [ -n "$BLER_RAW" ] && [ "$BLER_RAW" -gt 0 ] 2>/dev/null; then
        BLER_P=$(awk "BEGIN {print $BLER_RAW/100}")"%"
    else
        BLER_P="0.00%"
    fi

    SECONDARY=$(echo "$STATUS" | sed -n '/---SECONDARY---/,/---QTEMP---/p')
    SCC_PCI=$(echo "$SECONDARY" | grep '"pci"' | head -n1 | awk -F':' '{print $2}' | tr -d ' ,')

    if [ -n "$SCC_PCI" ] && [ "$SCC_PCI" -gt 0 ] 2>/dev/null; then
        SCC_BAND=$(echo "$SECONDARY" | grep '"band"' | awk -F'"' '{print $4}')
        SCC_BW=$(echo "$SECONDARY" | grep '"bandwidth"' | head -n1 | awk -F':' '{print $2}' | tr -d ' ,')
        SCC_ARFCN=$(echo "$SECONDARY" | grep '"nr_arfcn"' | head -n1 | awk -F':' '{print $2}' | tr -d ' ,')
        SCC_PCID="$SCC_PCI"
        SCC_RSRP=$(echo "$SECONDARY" | grep '"ss_rsrp"' | head -n1 | awk -F':' '{print $2}' | tr -d ' ,')
        SCC_RSRQ=$(echo "$SECONDARY" | grep '"ss_rsrq"' | head -n1 | awk -F':' '{print $2}' | tr -d ' ,')
        SCC_SINR=$(echo "$SECONDARY" | grep '"ss_sinr"' | head -n1 | awk -F':' '{print $2}' | tr -d ' ,')
        SCC_BLER_RAW=$(echo "$SECONDARY" | grep '"bler"' | head -n1 | awk -F':' '{print $2}' | tr -d ' ,')
        SCC_MOD=$(echo "$SECONDARY" | grep '"modulation"' | head -n1 | awk -F'"' '{print $4}')
        SCC_MIMO=$(echo "$SECONDARY" | grep '"mimo"' | head -n1 | awk -F'"' '{print $4}')
        
        if [ -n "$SCC_BLER_RAW" ] && [ "$SCC_BLER_RAW" -gt 0 ] 2>/dev/null; then
            SCC_BLER=$(awk "BEGIN {print $SCC_BLER_RAW/100}")"%"
        else
            SCC_BLER="0.00%"
        fi
    else
        SCC_BAND="--"
        SCC_BW="--"
        SCC_ARFCN="--"
        SCC_PCID="--"
        SCC_RSRP="--"
        SCC_RSRQ="--"
        SCC_SINR="--"
        SCC_BLER="NA"
        SCC_MOD="NA"
        SCC_MIMO="NA"
    fi

    TEMP=$(echo "$STATUS" | grep 'cpuss-0-usr' | awk -F',' '{print $2}' | tr -d '"' | tr -d ' ' | tr -d '\r')
    NETWORK_BLOCK=$(echo "$STATUS" | sed -n '/---NETWORK---/,/---QTEMP---/p')
    RX_BYTES=$(echo "$NETWORK_BLOCK" | grep '"rx_bytes"' | head -n1 | awk -F':' '{print $2}' | tr -d ' ,')
    TX_BYTES=$(echo "$NETWORK_BLOCK" | grep '"tx_bytes"' | head -n1 | awk -F':' '{print $2}' | tr -d ' ,')
    [ -z "$RX_BYTES" ] && RX_BYTES="0"
    [ -z "$TX_BYTES" ] && TX_BYTES="0"

    QTEMP=$(echo "$STATUS" | sed -n '/---QTEMP---/,/---UPTIME---/p' | grep -v -e '---' | grep 'cpuss-0-usr' | awk -F',' '{print $2}' | tr -d '"' | tr -d ' ' | tr -d '\r\n')
    UPTIME=$(echo "$STATUS" | sed -n '/---UPTIME---/,$p' | grep -v -e '---' | head -n1 | tr -d '\r\n')
    CPU=$(echo "$STATUS" | sed -n '/---CPU---/,/---QTEMP---/p' | grep -v -e '---' | head -n1 | tr -d '\r\n')

    JSON_OUT=$(printf '{"server_link":"ONLINE","state":"%s","duplex":"%s","mccmnc":"%s","band":"%s","bw":"%s","rsrp":"%s","rsrq":"%s","sinr":"%s","temp":"%s","uptime":"%s","cpu":"%s","bler":"%s","mod":"%s","mimo":"%s","pcid":"%s","arfcn":"%s","scc_band":"%s","scc_bw":"%s","scc_rsrp":"%s","scc_rsrq":"%s","scc_sinr":"%s","scc_bler":"%s","scc_mod":"%s","scc_mimo":"%s","scc_pcid":"%s","scc_arfcn":"%s","rx_bytes":"%s","tx_bytes":"%s"}' \
  "${STATE:-CONNECTED}" "${DUPLEX}" "${MCCMNC:---}" "${BAND:-n78}" "${BW:-100}" "${RSRP:--80}" "${RSRQ:--10}" "${SINR:--18}" "${QTEMP:-0}" "${UPTIME:-0}" "${CPU:-0}" "${BLER_P}" "${MOD:---}" "${MIMO:---}" "${PCID:-263}" "${ARFCN:-634080}" "${SCC_BAND:-n78}" "${SCC_BW:-0}" "${SCC_RSRP:-0}" "${SCC_RSRQ:-0}" "${SCC_SINR:-0}" "${SCC_BLER}" "${SCC_MOD:-NA}" "${SCC_MIMO:-NA}" "${SCC_PCID:-0}" "${SCC_ARFCN:-0}" "${RX_BYTES}" "${TX_BYTES}" )

    echo "$JSON_OUT" 
else
    # Parse JSON from GetNetworkStatus
    # Helper to extract JSON key (handles quoted and unquoted values)
    json_get() {
        key="$1"
        echo "$NET" | sed -n 's/.*"'"$key"'"\s*:\s*"\([^"]*\)".*/\1/p' | head -n1
        if [ -z "$(echo "$NET" | sed -n 's/.*"'"$key"'"\s*:\s*"\([^"]*\)".*/\1/p' | head -n1)" ]; then
            echo "$NET" | sed -n 's/.*"'"$key"'"\s*:\s*\([^",}]*\).*/\1/p' | head -n1
        fi
    }

    STATE=$(json_get connection_status)
    BAND=$(json_get operating_band)
    BW=$(json_get bandwidth)
    PCID=$(json_get pci)
    ARFCN=$(json_get earfcn)
    RSRP=$(json_get ss_rsrp)
    if [ -z "$RSRP" ]; then RSRP=$(json_get rsrp); fi
    RSRQ=$(json_get ss_rsrq)
    if [ -z "$RSRQ" ]; then RSRQ=$(json_get rsrq); fi
    SINR=$(json_get ss_snr)
    if [ -z "$SINR" ]; then SINR=$(json_get snr); fi
    BLER_RAW=$(json_get bler)
    MOD=$(json_get modulation)
    MIMO=$(json_get mimo_mode)
    MCCMNC=$(json_get plmn)
    DUPLEX="TDD"

    # secondary / scell
    SCC_PCID=$(json_get scell_pci)
    SCC_ARFCN=$(json_get scell_earfcn)
    SCC_RSRP=$(json_get scell_ss_rsrp)
    SCC_RSRQ=$(json_get scell_ss_rsrq)
    SCC_SINR=$(json_get scell_ss_snr)
    SCC_BLER_RAW=$(json_get scell_bler)
    SCC_MOD=$(json_get scell_modulation)
    SCC_MIMO=$(json_get scell_mimo_mode)

    if [ -n "$BLER_RAW" ] && [ "$BLER_RAW" -gt 0 ] 2>/dev/null; then
        BLER_P=$(awk "BEGIN {print $BLER_RAW/100}")"%"
    else
        BLER_P="0.00%"
    fi
    if [ -n "$SCC_BLER_RAW" ] && [ "$SCC_BLER_RAW" -gt 0 ] 2>/dev/null; then
        SCC_BLER=$(awk "BEGIN {print $SCC_BLER_RAW/100}")"%"
    else
        SCC_BLER="NA"
    fi

    # Get interface counters
    IFC=$(wget -q -O - -T 3 "http://$IP/cgi-bin/qcmap_web_cgi?Page=GetNetworkInterfaceInfo" 2>/dev/null)
    RX_BYTES=$(echo "$IFC" | sed -n 's/.*"total_downlink_data"\s*:\s*"\?\([^",}]*\)\"?.*/\1/p' | head -n1)
    TX_BYTES=$(echo "$IFC" | sed -n 's/.*"total_uplink_data"\s*:\s*"\?\([^",}]*\)\"?.*/\1/p' | head -n1)
    [ -z "$RX_BYTES" ] && RX_BYTES=0
    [ -z "$TX_BYTES" ] && TX_BYTES=0

    QTEMP=0
    UPTIME=0
    CPU=0

    JSON_OUT=$(printf '{"server_link":"ONLINE","state":"%s","duplex":"%s","mccmnc":"%s","band":"%s","bw":"%s","rsrp":"%s","rsrq":"%s","sinr":"%s","temp":"%s","uptime":"%s","cpu":"%s","bler":"%s","mod":"%s","mimo":"%s","pcid":"%s","arfcn":"%s","scc_band":"%s","scc_bw":"%s","scc_rsrp":"%s","scc_rsrq":"%s","scc_sinr":"%s","scc_bler":"%s","scc_mod":"%s","scc_mimo":"%s","scc_pcid":"%s","scc_arfcn":"%s","rx_bytes":"%s","tx_bytes":"%s"}' \
      "${STATE:-CONNECTED}" "${DUPLEX}" "${MCCMNC:---}" "${BAND:-n78}" "${BW:-100}" "${RSRP:--80}" "${RSRQ:--10}" "${SINR:--18}" "${QTEMP:-0}" "${UPTIME:-0}" "${CPU:-0}" "${BLER_P}" "${MOD:---}" "${MIMO:---}" "${PCID:-263}" "${ARFCN:-634080}" "${BAND:-n78}" "${BW:-0}" "${SCC_RSRP:-0}" "${SCC_RSRQ:-0}" "${SCC_SINR:-0}" "${SCC_BLER}" "${SCC_MOD:-NA}" "${SCC_MIMO:-NA}" "${SCC_PCID:-0}" "${SCC_ARFCN:-0}" "${RX_BYTES}" "${TX_BYTES}")

    echo "$JSON_OUT"
fi
