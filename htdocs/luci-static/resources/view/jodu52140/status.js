'use strict';
'require view';
'require fs';
'require poll';
'require uci';
'require ui';

var isConfiguring = false;

return view.extend({
    handleSaveApply: null, handleSave: null, handleReset: null,

    render: function() {
        var html = `
        <style>
            .sa-header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .sa-header-bar h2 { margin: 0; }
            .sa-grid-top { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px; }
            .sa-card { padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); } 
            .sa-icon { width: 42px; height: 42px; margin: 0 auto 12px auto; }
            .sa-card h2 { margin: 5px 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
            .sa-card span { font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 1px; opacity: 0.7; }
            
            .sa-grid-bot { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
            @media (max-width: 900px) { .sa-grid-bot { grid-template-columns: 1fr; } }
            
            .sa-transparent-node { border: 1px solid var(--border-color, #444); border-radius: 6px; overflow: hidden; background: transparent; }
            .sa-table { width: 100%; border-collapse: collapse; }
            
            .sa-tr { border-bottom: 1px solid var(--border-color, #333); }
            .sa-tr:last-child { border-bottom: none; }
            .sa-td { padding: 12px 15px; font-size: 13px; }
            .sa-td.left { font-weight: 500; opacity: 0.85; width: 45%; } 
            .sa-td.right { text-align: right; font-weight: 700; width: 55%; }
            .val-highlight { font-size: 14px; }
        </style>

        <div class="cbi-map" id="cbi-jodu52140">
            <div class="sa-header-bar">
                <h2 name="content">5G Dashboard</h2>
                <button class="btn" id="odu-settings-btn">⚙️ Settings</button>
            </div>
            
            <div class="sa-grid-top">
                <div class="cbi-section-node sa-card">
                    <div class="sa-icon">
                        <img src="/luci-static/resources/view/jodu52140/jio-logo.png" onerror="this.onerror=null; this.src='https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/jio-logo-icon.png';" style="width: 42px; height: 42px; border-radius: 50%; object-fit: contain;">
                    </div>
                    <h2 style="font-size: 20px; margin-top:12px; color: #4D7DFF;">JioTrue 5G</h2><span id="ui-top-mode">--</span>
                </div>
                <div class="cbi-section-node sa-card">
                    <div class="sa-icon" id="icon-temp"><svg viewBox="0 0 24 24" fill="#444444"><path d="M15 13V5A3 3 0 0 0 9 5V13A5 5 0 1 0 15 13M12 4A1 1 0 0 1 13 5V8H11V5A1 1 0 0 1 12 4Z"/></svg></div>
                    <h2 id="ui-temp">--°C</h2><span>Temperature</span>
                </div>
                <div class="cbi-section-node sa-card">
                    <div class="sa-icon" id="icon-sig">
                        <svg viewBox="0 0 24 24" fill="none" width="42" height="42">
                            <rect x="2" y="17" width="3" height="5" rx="0.5" fill="#444444"/>
                            <rect x="6.5" y="14" width="3" height="8" rx="0.5" fill="#444444"/>
                            <rect x="11" y="11" width="3" height="11" rx="0.5" fill="#444444"/>
                            <rect x="15.5" y="8" width="3" height="14" rx="0.5" fill="#444444"/>
                            <rect x="20" y="5" width="3" height="17" rx="0.5" fill="#444444"/>
                        </svg>
                    </div>
                    <h2 id="ui-sig-pct">--%</h2><span>Signal Quality</span>
                </div>
                <div class="cbi-section-node sa-card">
                    <div class="sa-icon" id="icon-conn"><svg viewBox="0 0 24 24" fill="#cf6679"><path d="M22.11 21.46L2.39 1.73L1.11 3L5.56 7.45C3.54 8.21 2 10.15 2 12.5C2 15.54 4.46 18 7.5 18H16.11L19.84 21.73L21.11 20.46V21.46M7.5 16C5.57 16 4 14.43 4 12.5C4 10.82 5.19 9.4 6.78 9.06L14.71 17H7.5M19.35 10.04C18.67 6.59 15.64 4 12 4C10.66 4 9.41 4.36 8.36 4.97L9.95 6.56C10.59 6.2 11.27 6 12 6C15.31 6 18 8.69 18 12C18 12.44 17.95 12.87 17.85 13.27L20.85 16.27C21.5 15.22 22 13.9 22 12.5C22 10.69 20.86 9.08 19.35 10.04Z"/></svg></div>
                    <h2 id="ui-state" style="font-size: 18px; margin-top:12px; color: #cf6679;">LINK DOWN</h2><span>Connection</span>
                </div>
            </div>

            <div class="sa-grid-bot">
                <div class="cbi-section">
                    <h3>Cellular Parameters (Primary Cell)</h3>
                    <div class="sa-transparent-node">
                        <table class="sa-table">
                            <tr class="sa-tr"><td class="sa-td left">Duplex Mode</td><td class="sa-td right val-highlight" id="ui-duplex">--</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">Band</td><td class="sa-td right val-highlight" id="ui-band">--</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">Bandwidth</td><td class="sa-td right val-highlight" id="ui-bw">--</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">NR-ARFCN</td><td class="sa-td right val-highlight" id="ui-arfcn">--</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">Physical Cell ID</td><td class="sa-td right val-highlight" id="ui-pcid">--</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">BLER</td><td class="sa-td right val-highlight" id="ui-bler">--</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">Modulation</td><td class="sa-td right val-highlight" id="ui-mod">--</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">MIMO</td><td class="sa-td right val-highlight" id="ui-mimo">--</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">SS-RSRP</td><td class="sa-td right val-highlight" id="ui-rsrp">--</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">SS-RSRQ</td><td class="sa-td right val-highlight" id="ui-rsrq" style="color: #ec4899;">--</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">SS-SINR</td><td class="sa-td right val-highlight" id="ui-sinr" style="color: #0ea5e9;">--</td></tr>
                        </table>
                    </div>
                </div>

                <div class="cbi-section">
                    <h3>Cellular Parameters (Secondary Cell)</h3>
                    <div class="sa-transparent-node">
                        <table class="sa-table">
                            <tr class="sa-tr"><td class="sa-td left">Aggregation Status</td><td class="sa-td right val-highlight" id="ui-ca-status">--</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">Band</td><td class="sa-td right val-highlight" id="ui-scc-band">NA</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">Bandwidth</td><td class="sa-td right val-highlight" id="ui-scc-bw">NA</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">NR-ARFCN</td><td class="sa-td right val-highlight" id="ui-scc-arfcn">NA</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">Physical Cell ID</td><td class="sa-td right val-highlight" id="ui-scc-pcid">NA</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">BLER</td><td class="sa-td right val-highlight" id="ui-scc-bler">NA</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">Modulation</td><td class="sa-td right val-highlight" id="ui-scc-mod">NA</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">MIMO</td><td class="sa-td right val-highlight" id="ui-scc-mimo">NA</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">SS-RSRP</td><td class="sa-td right val-highlight" id="ui-scc-rsrp">NA</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">SS-RSRQ</td><td class="sa-td right val-highlight" id="ui-scc-rsrq" style="color: #ec4899;">NA</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">SS-SINR</td><td class="sa-td right val-highlight" id="ui-scc-sinr" style="color: #0ea5e9;">NA</td></tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;

        var container = document.createElement('div');
        container.innerHTML = html;

        var btn = container.querySelector('#odu-settings-btn');
        btn.addEventListener('click', function() {
            uci.load('jodu52140').then(function() {
                var ip = uci.get('jodu52140', 'main', 'ip') || '192.168.225.1';
                var arfcn = uci.get('jodu52140', 'main', 'arfcn') || '';
                var pci = uci.get('jodu52140', 'main', 'pci') || '';
                
                var body = document.createElement('div');
                body.innerHTML = `
                    <div class="cbi-value">
                        <label class="cbi-value-title">ODU IP Address</label>
                        <div class="cbi-value-field">
                            <input type="text" id="cfg-ip" class="cbi-input-text" value="${ip}">
                        </div>
                    </div>
                    <div class="cbi-value">
                        <label class="cbi-value-title">NR-ARFCN Lock</label>
                        <div class="cbi-value-field">
                            <input type="text" id="cfg-arfcn" class="cbi-input-text" placeholder="e.g. 634080 (Leave blank to unlock)" value="${arfcn}">
                        </div>
                    </div>
                    <div class="cbi-value">
                        <label class="cbi-value-title">NR PCI Lock</label>
                        <div class="cbi-value-field">
                            <input type="text" id="cfg-pci" class="cbi-input-text" placeholder="e.g. 263 (Leave blank to unlock)" value="${pci}">
                        </div>
                    </div>
                `;

                var btnWrap = document.createElement('div');
                btnWrap.className = 'right';
                btnWrap.style.marginTop = '20px';
                
                var btnCancel = document.createElement('button');
                btnCancel.className = 'btn';
                btnCancel.innerText = 'Cancel';
                btnCancel.onclick = ui.hideModal;
                
                var btnSave = document.createElement('button');
                btnSave.className = 'btn cbi-button-action important';
                btnSave.innerText = 'Save & Apply';
                btnSave.onclick = function() {
                    btnSave.innerText = 'Applying...';
                    btnSave.disabled = true;
                    
                    var newIp = document.getElementById('cfg-ip').value || '192.168.225.1';
                    var newArfcn = document.getElementById('cfg-arfcn').value || '';
                    var newPci = document.getElementById('cfg-pci').value || '';
                    
                    isConfiguring = true; 
                    
                    var stateEl = document.getElementById('ui-state');
                    var iconEl = document.getElementById('icon-conn');
                    var secondsLeft = 20;
                    var baseText = (newArfcn || newPci) ? 'LOCKING CELL' : 'APPLYING CONFIG';
                    
                    if (stateEl && iconEl) {
                        stateEl.innerText = baseText + ' (' + secondsLeft + 's)';
                        stateEl.style.color = '#03dac6'; 
                        iconEl.innerHTML = '<svg viewBox="0 0 24 24" fill="#03dac6"><path d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2M12 20A8 8 0 1 1 20 12A8 8 0 0 1 12 20M12 4A8 8 0 0 0 4 12H6A6 6 0 0 1 12 6V4Z"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>';
                        
                        var countdownTimer = setInterval(function() {
                            secondsLeft--;
                            if (secondsLeft > 0) {
                                stateEl.innerText = baseText + ' (' + secondsLeft + 's)';
                            } else {
                                clearInterval(countdownTimer);
                                window.location.reload();
                            }
                        }, 1000);
                    } else {
                        setTimeout(function() { window.location.reload(); }, 20000);
                    }
                    
                    ui.hideModal();
                    
                    var cmds = [
                        'uci set jodu52140.main.ip="' + newIp + '"',
                        'uci set jodu52140.main.arfcn="' + newArfcn + '"',
                        'uci set jodu52140.main.pci="' + newPci + '"',
                        'uci commit jodu52140',
                        '/usr/libexec/odu-setup.sh >/dev/null 2>&1 &'
                    ].join('; ');
                    
                    fs.exec_direct('/bin/sh', ['-c', cmds]).catch(function(e) {
                        console.error("Execution failed:", e);
                    });
                };
                
                btnWrap.appendChild(btnCancel);
                btnWrap.appendChild(document.createTextNode(' '));
                btnWrap.appendChild(btnSave);
                body.appendChild(btnWrap);
                
                ui.showModal('ODU Configuration', [body]);
            });
        });

        poll.add(function() {
            if (isConfiguring) return; 

            return fs.exec_direct('/usr/libexec/odu-data.sh').then(function(res) {
                try { 
                    if (!res) return;
                    var data = JSON.parse(res.trim()); 
                    var stateEl = document.getElementById('ui-state');
                    var iconEl = document.getElementById('icon-conn');

                    if (data.server_link === 'INITIALIZING' || data.server_link === 'CONFIGURING') {
                        stateEl.innerText = 'PROVISIONING DEVICE';
                        stateEl.style.color = '#03dac6'; 
                        iconEl.innerHTML = '<svg viewBox="0 0 24 24" fill="#03dac6"><path d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2M12 20A8 8 0 1 1 20 12A8 8 0 0 1 12 20M12 4A8 8 0 0 0 4 12H6A6 6 0 0 1 12 6V4Z"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>';
                        return; 
                    }

                    if (data.server_link === 'OFFLINE') {
                        stateEl.innerText = 'LINK DOWN';
                        stateEl.style.color = '#cf6679';
                        iconEl.innerHTML = '<svg viewBox="0 0 24 24" fill="#cf6679"><path d="M22.11 21.46L2.39 1.73L1.11 3L5.56 7.45C3.54 8.21 2 10.15 2 12.5C2 15.54 4.46 18 7.5 18H16.11L19.84 21.73L21.11 20.46V21.46M7.5 16C5.57 16 4 14.43 4 12.5C4 10.82 5.19 9.4 6.78 9.06L14.71 17H7.5M19.35 10.04C18.67 6.59 15.64 4 12 4C10.66 4 9.41 4.36 8.36 4.97L9.95 6.56C10.59 6.2 11.27 6 12 6C15.31 6 18 8.69 18 12C18 12.44 17.95 12.87 17.85 13.27L20.85 16.27C21.5 15.22 22 13.9 22 12.5C22 10.69 20.86 9.08 19.35 10.04Z"/></svg>';
                        return;
                    }

                    stateEl.innerText = 'LINK ACTIVE';
                    stateEl.style.color = '#4dff4d';
                    iconEl.innerHTML = '<svg viewBox="0 0 24 24" fill="#4dff4d"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04Z"/></svg>';

                    if(data.temp && data.temp !== "0" && data.temp !== "--" && data.temp !== "") {
                        document.getElementById('ui-temp').innerText = data.temp + '°C';
                        var tVal = parseInt(data.temp);
                        var tCol = '#4dff4d'; 
                        if (tVal >= 41 && tVal <= 45) { tCol = '#ffb84d'; } 
                        else if (tVal >= 46) { tCol = '#cf6679'; } 
                        
                        document.getElementById('icon-temp').innerHTML = '<svg viewBox="0 0 24 24" fill="' + tCol + '"><path d="M15 13V5A3 3 0 0 0 9 5V13A5 5 0 1 0 15 13M12 4A1 1 0 0 1 13 5V8H11V5A1 1 0 0 1 12 4Z"/></svg>';
                    }
                    
                    document.getElementById('ui-top-mode').innerText = (data.mccmnc && data.mccmnc !== '--' ? data.mccmnc : 'Searching PLMN') + ' | NR5G-SA';

                    document.getElementById('ui-duplex').innerText = data.duplex;
                    document.getElementById('ui-band').innerText = data.band;
                    document.getElementById('ui-bw').innerText = data.bw + ' MHz';
                    document.getElementById('ui-arfcn').innerText = data.arfcn;
                    document.getElementById('ui-pcid').innerText = data.pcid;
                    document.getElementById('ui-bler').innerText = data.bler;
                    document.getElementById('ui-mod').innerText = data.mod;
                    document.getElementById('ui-mimo').innerText = data.mimo;

                    var rsrp = parseInt(data.rsrp) || -130;
                    var rsrq = parseInt(data.rsrq) || -20;
                    var sinr = parseInt(data.sinr) || 0;

                    var rsrpCol = '#cf6679'; 
                    if (rsrp >= -85) rsrpCol = '#4dff4d'; 
                    else if (rsrp >= -100) rsrpCol = '#ffb84d'; 
                    
                    var uiRsrp = document.getElementById('ui-rsrp');
                    uiRsrp.innerText = rsrp + ' dBm';
                    uiRsrp.style.color = rsrpCol;

                    document.getElementById('ui-rsrq').innerText = rsrq + ' dB';
                    document.getElementById('ui-sinr').innerText = sinr + ' dB';

                    var qRsrp = Math.max(0, Math.min(100, ((rsrp + 115) / 55) * 100));
                    var qRsrq = Math.max(0, Math.min(100, ((rsrq + 18) / 9) * 100));
                    var qSinr = Math.max(0, Math.min(100, (sinr / 30) * 100));
                    
                    var sigQuality = Math.round((qRsrp * 0.6) + (qRsrq * 0.2) + (qSinr * 0.2));
                    if (isNaN(sigQuality)) sigQuality = 0;
                    
                    document.getElementById('ui-sig-pct').innerText = sigQuality + '%';

                    var activeBars = 0;
                    if (sigQuality >= 80) activeBars = 5;
                    else if (sigQuality >= 60) activeBars = 4;
                    else if (sigQuality >= 40) activeBars = 3;
                    else if (sigQuality >= 20) activeBars = 2;
                    else if (sigQuality > 0) activeBars = 1;

                    var barCoords = [ {x:2,y:17,h:5}, {x:6.5,y:14,h:8}, {x:11,y:11,h:11}, {x:15.5,y:8,h:14}, {x:20,y:5,h:17} ];
                    var sigSvg = '<svg viewBox="0 0 24 24" fill="none" width="42" height="42">';
                    for (var i = 0; i < 5; i++) {
                        var fCol = (i < activeBars) ? '#4da6ff' : '#444444'; 
                        sigSvg += '<rect x="'+barCoords[i].x+'" y="'+barCoords[i].y+'" width="3" height="'+barCoords[i].h+'" rx="0.5" fill="'+fCol+'"/>';
                    }
                    sigSvg += '</svg>';
                    document.getElementById('icon-sig').innerHTML = sigSvg;

                    if (data.scc_pcid && data.scc_pcid !== "0" && data.scc_pcid !== "--") {
                        document.getElementById('ui-ca-status').innerText = 'Active (CA)';
                        document.getElementById('ui-ca-status').style.color = '#03dac6';
                        
                        document.getElementById('ui-scc-band').innerText = 'TDD (' + data.scc_band + ')';
                        document.getElementById('ui-scc-bw').innerText = data.scc_bw + ' MHz';
                        document.getElementById('ui-scc-arfcn').innerText = data.scc_arfcn;
                        document.getElementById('ui-scc-pcid').innerText = data.scc_pcid;
                        document.getElementById('ui-scc-bler').innerText = data.scc_bler;
                        document.getElementById('ui-scc-mod').innerText = data.scc_mod;
                        document.getElementById('ui-scc-mimo').innerText = data.scc_mimo;
                        
                        var sccRsrp = parseInt(data.scc_rsrp) || -130;
                        var sccRsrpCol = '#cf6679'; 
                        if (sccRsrp >= -85) sccRsrpCol = '#4dff4d'; 
                        else if (sccRsrp >= -100) sccRsrpCol = '#ffb84d'; 
                        
                        var uiSccRsrp = document.getElementById('ui-scc-rsrp');
                        uiSccRsrp.innerText = sccRsrp + ' dBm';
                        uiSccRsrp.style.color = sccRsrpCol;
                        
                        document.getElementById('ui-scc-rsrq').innerText = (parseInt(data.scc_rsrq) || -20) + ' dB';
                        document.getElementById('ui-scc-sinr').innerText = (parseInt(data.scc_sinr) || 0) + ' dB';
                    } else {
                        document.getElementById('ui-ca-status').innerText = 'Inactive';
                        document.getElementById('ui-ca-status').style.color = '#cf6679';
                        
                        document.getElementById('ui-scc-band').innerText = 'NA';
                        document.getElementById('ui-scc-bw').innerText = 'NA';
                        document.getElementById('ui-scc-arfcn').innerText = 'NA';
                        document.getElementById('ui-scc-pcid').innerText = 'NA';
                        document.getElementById('ui-scc-bler').innerText = 'NA';
                        document.getElementById('ui-scc-mod').innerText = 'NA';
                        document.getElementById('ui-scc-mimo').innerText = 'NA';
                        
                        var uiSccRsrpEmpty = document.getElementById('ui-scc-rsrp');
                        uiSccRsrpEmpty.innerText = 'NA';
                        uiSccRsrpEmpty.style.color = '';
                        
                        document.getElementById('ui-scc-rsrq').innerText = 'NA';
                        document.getElementById('ui-scc-sinr').innerText = 'NA';
                    }
                } catch(e) {
                    console.error("JSON Parse failed for ODU Payload:", e);
                }
            });
        }, 2); 

        return container;
    }
});