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
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            
            #cbi-jodu52140 {
                font-family: 'Inter', sans-serif;
                color: #e2e8f0;
            }
            
            .sa-header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
            .sa-title-row { display: flex; align-items: center; gap: 15px; width: auto; }
            .sa-header-actions { display: flex; align-items: center; gap: 8px; }
            .sa-header-bar h2 { margin: 0; white-space: nowrap; line-height: 1; font-weight: 800; font-size: 24px; color: #f8fafc; }
            
            .sa-uptime { display: flex; flex-direction: row; align-items: baseline; justify-content: flex-start; margin-top: 2px; }
            .sa-uptime-label { font-size: 13px; color: #94a3b8; font-weight: 500; margin-right: 6px; }
            .sa-uptime-val { font-size: 13px; font-weight: 600; color: #f8fafc; }
            
            .action-btn {
                margin: 0 !important;
                padding: 6px 12px !important;
                height: 32px !important;
                border-radius: 6px !important;
                box-sizing: border-box !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background 0.15s ease;
                border: none !important;
                gap: 5px;
            }
            
            #odu-reboot-btn {
                background-color: #dc2626 !important;
                border: 1px solid #b91c1c !important;
                box-shadow: 0 0 8px rgba(220, 38, 38, 0.4) !important;
                color: #ffffff !important;
            }
            #odu-reboot-btn:hover {
                background-color: #b91c1c !important;
                box-shadow: 0 0 12px rgba(220, 38, 38, 0.6) !important;
            }
            
            #odu-settings-btn {
                background-color: #0284c7 !important;
                border: 1px solid #0369a1 !important;
                box-shadow: 0 0 8px rgba(2, 132, 199, 0.4) !important;
                color: #ffffff !important;
            }
            #odu-settings-btn:hover {
                background-color: #0369a1 !important;
                box-shadow: 0 0 12px rgba(2, 132, 199, 0.6) !important;
            }

            .sa-grid-top { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; margin-bottom: 20px; }
            
            .sa-card { 
                padding: 16px 15px; 
                text-align: center; 
                border-radius: 12px; 
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.15);
            } 
            
            .sa-icon { width: 42px; height: 42px; margin: 0 auto 12px auto; display: flex; align-items: center; justify-content: center; }
            .sa-card h2 { margin: 6px 0; font-size: 22px; font-weight: 700; }
            .sa-card span { font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; color: #94a3b8; }
            
            .sa-grid-bot { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
            
            .cbi-section h3 { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; color: #f8fafc; margin-bottom: 12px; }
            
            .sa-transparent-node { 
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 8px; 
                overflow: hidden; 
            }
            .sa-table { width: 100%; border-collapse: collapse; }
            .sa-tr { border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
            .sa-tr:last-child { border-bottom: none; }
            
            .sa-td { padding: 10px 14px; font-size: 13px; }
            .sa-td.left { font-weight: 500; color: #94a3b8; width: 45%; } 
            .sa-td.right { text-align: right; font-weight: 600; width: 55%; color: #e2e8f0; }
            .val-highlight { font-size: 14px; }
            .sa-grid-mid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin-bottom: 20px; }
            .sa-grid-mid h3 { margin: 0; font-size: 14px; font-weight: 700; color: #f8fafc; text-align: left; }

            @media (max-width: 900px) { 
                .sa-grid-bot { grid-template-columns: 1fr; } 
            }
            
            @media (max-width: 650px) {
                .sa-title-row { width: 100%; justify-content: space-between; gap: 10px; }
                .sa-uptime { justify-content: flex-end; margin-top: 0; }
                .sa-header-actions { width: 100%; }
                .action-btn { flex: 1; height: 38px !important; font-size: 14px !important; }
                .sa-card { padding: 15px 12px; }
                .sa-card h2 { font-size: 20px; }
                .sa-td { padding: 8px 10px; }
            }
        </style>

        <div class="cbi-map" id="cbi-jodu52140">
            <div class="sa-header-bar">
                <div class="sa-title-row">
                    <h2 name="content">5G Dashboard</h2>
                    <div class="sa-uptime">
                        <span class="sa-uptime-label">Uptime:</span>
                        <span id="ui-uptime-val" class="sa-uptime-val">--</span>
                    </div>
                </div>
                
                <div class="sa-header-actions">
                    <button class="btn action-btn btn-reboot" id="odu-reboot-btn">
                        <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        <span style="color:#ffffff !important;">Reboot</span>
                    </button>
                    <button class="btn action-btn btn-settings" id="odu-settings-btn">
                        <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                        <span style="color:#ffffff !important;">Settings</span>
                    </button>
                </div>
            </div>
            
            <div class="sa-grid-top">
                <div class="cbi-section-node sa-card">
                    <div class="sa-icon">
                        <img src="/luci-static/resources/view/jodu52140/jio-logo.png" onerror="this.onerror=null; this.src='https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/jio-logo-icon.png';" style="width: 48px; height: 48px; border-radius: 50%; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
                    </div>
                    <h2 style="color: #60a5fa; text-shadow: 0 0 15px rgba(96,165,250,0.4);">JioTrue 5G</h2><span id="ui-top-mode">--</span>
                </div>
                <div class="cbi-section-node sa-card">
                    <div class="sa-icon" id="icon-cpu">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="36" height="36">
                            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
                            <rect x="9" y="9" width="6" height="6"/>
                            <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
                            <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
                            <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
                            <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
                        </svg>
                    </div>
                    <h2 id="ui-cpu">--%</h2><span>CPU Usage <span id="ui-temp" style="color:#facc15; margin-left: 5px; font-weight: 500;">(--°C)</span></span>
                </div>
                <div class="cbi-section-node sa-card">
                    <div class="sa-icon" id="icon-sig">
                        <svg viewBox="0 0 24 24" fill="none" width="36" height="36">
                            <rect x="2" y="16" width="3" height="6" rx="1.5" fill="#334155"/>
                            <rect x="7" y="12" width="3" height="10" rx="1.5" fill="#334155"/>
                            <rect x="12" y="8" width="3" height="14" rx="1.5" fill="#334155"/>
                            <rect x="17" y="4" width="3" height="18" rx="1.5" fill="#334155"/>
                        </svg>
                    </div>
                    <h2 id="ui-sig-pct">--%</h2><span>Signal Quality</span>
                </div>
                <div class="cbi-section-node sa-card">
                    <div class="sa-icon" id="icon-conn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="36" height="36"><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M17.31 17.31A10.43 10.43 0 0 1 12 19c-7 0-10-7-10-7a13.23 13.23 0 0 1 7.58-6.19"/><path d="M14 14.66V17c0 .55-.47.98-.97 1.21C11.69 18.75 10 18.24 10 17v-2.34"/><path d="m2 2 20 20"/></svg>
                    </div>
                    <h2 id="ui-state" style="color: #f43f5e; text-shadow: 0 0 15px rgba(244,63,94,0.4);">LINK DOWN</h2><span>Connection</span>
                </div>
            </div>

            <div class="sa-grid-mid">
                <div class="cbi-section-node sa-card" style="padding: 10px 15px; display: flex; justify-content: space-evenly; align-items: center; flex-direction: row; flex-wrap: wrap;">
                    <div style="font-weight: 600; color: #f8fafc; font-size: 14px;">Data Usage (Session)</div>
                    <div style="display: flex; gap: 30px;">
                        <div style="text-align: center;"><span style="font-size: 11px; color:#94a3b8;">DOWNLOAD</span> <b id="ui-rx-bytes" style="font-size: 16px; color: #4ade80;">0 B</b></div>
                        <div style="text-align: center;"><span style="font-size: 11px; color:#94a3b8;">UPLOAD</span> <b id="ui-tx-bytes" style="font-size: 16px; color: #38bdf8;">0 B</b></div>
                    </div>
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
                            <tr class="sa-tr"><td class="sa-td left">SS-RSRQ</td><td class="sa-td right val-highlight" id="ui-rsrq" style="color: #f472b6;">--</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">SS-SINR</td><td class="sa-td right val-highlight" id="ui-sinr" style="color: #38bdf8;">--</td></tr>
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
                            <tr class="sa-tr"><td class="sa-td left">SS-RSRQ</td><td class="sa-td right val-highlight" id="ui-scc-rsrq" style="color: #f472b6;">NA</td></tr>
                            <tr class="sa-tr"><td class="sa-td left">SS-SINR</td><td class="sa-td right val-highlight" id="ui-scc-sinr" style="color: #38bdf8;">NA</td></tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;

        var container = document.createElement('div');
        container.innerHTML = html;

        var cachedBt = sessionStorage.getItem('odu_boot_time');
        if (cachedBt) {
            window.oduBootTime = parseInt(cachedBt, 10);
        }

        fs.exec_direct('/bin/sh', ['-c', 'cat /tmp/odu_boot_time 2>/dev/null']).then(function(res) {
            if (res && res.trim() !== '') {
                var bt = parseInt(res.trim(), 10);
                if (!isNaN(bt)) {
                    window.oduBootTime = bt;
                    sessionStorage.setItem('odu_boot_time', bt);
                }
            }
        }).catch(function(e) {});

        var rebootBtn = container.querySelector('#odu-reboot-btn');
        rebootBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reboot the Jio ODU?')) {
                uci.load('jodu52140').then(function() {
                    var ip = uci.get('jodu52140', 'main', 'ip') || '192.168.225.1';
                    
                    isConfiguring = true; 
                    
                    var stateEl = document.getElementById('ui-state');
                    var iconEl = document.getElementById('icon-conn');
                    var secondsLeft = 50; 
                    
                    if (stateEl && iconEl) {
                        stateEl.style.color = '#ef4444'; 
                        stateEl.style.textShadow = '0 0 15px rgba(239,68,68,0.4)'; 
                        
                        iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="36" height="36"><circle cx="20" cy="20" r="16" fill="none" stroke="#334155" stroke-width="3"/><circle cx="20" cy="20" r="16" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="25 75" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="1s" repeatCount="indefinite"/></circle><circle cx="20" cy="20" r="8" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="10 40" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="360 20 20" to="0 20 20" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="20" cy="20" r="3" fill="#ef4444"><animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/></circle></svg>';
                        
                        stateEl.innerText = 'REBOOTING ODU (' + secondsLeft + 's)';
                        
                        var countdownTimer = setInterval(function() {
                            secondsLeft--;
                            if (secondsLeft > 0) {
                                stateEl.innerText = 'REBOOTING ODU (' + secondsLeft + 's)';
                            } else {
                                clearInterval(countdownTimer);
                                window.location.reload();
                            }
                        }, 1000);
                    } else {
                        setTimeout(function() { window.location.reload(); }, 60000); 
                    }
                    
                    var cmds = "/usr/libexec/jodu_reboot.sh >/dev/null 2>&1 &";
                    fs.exec_direct('/bin/sh', ['-c', cmds]).catch(function(e) {});
                });
            }
        });

        var btn = container.querySelector('#odu-settings-btn');
        btn.addEventListener('click', function() {
            uci.load('jodu52140').then(function() {
                var ip = uci.get('jodu52140', 'main', 'ip') || '192.168.225.1';
                var arfcn = uci.get('jodu52140', 'main', 'arfcn') || '';
                var pci = uci.get('jodu52140', 'main', 'pci') || '';
                
                var body = document.createElement('div');
                body.innerHTML = `
                    <ul class="cbi-tabmenu">
                        <li class="cbi-tab" id="tab-locking"><a href="javascript:void(0);">Cell Locking</a></li>
                        <li class="cbi-tab-disabled" id="tab-terminal"><a href="javascript:void(0);">Terminal</a></li>
                        <li class="cbi-tab-disabled" id="tab-config"><a href="javascript:void(0);">Config</a></li>
                    </ul>
                    
                    <div id="container-locking" style="margin-top: 15px;">
                        <div class="cbi-value">
                            <label class="cbi-value-title">NR-ARFCN Lock</label>
                            <div class="cbi-value-field">
                                <input type="text" id="cfg-arfcn" class="cbi-input-text" placeholder="e.g. 634080 (Leave blank to unlock)" value="${arfcn}" autocomplete="off" data-lpignore="true">
                            </div>
                        </div>
                        <div class="cbi-value">
                            <label class="cbi-value-title">NR PCI Lock</label>
                            <div class="cbi-value-field">
                                <input type="text" id="cfg-pci" class="cbi-input-text" placeholder="e.g. 263 (Leave blank to unlock)" value="${pci}" autocomplete="off" data-lpignore="true">
                            </div>
                        </div>
                    </div>
                    
                    <div id="container-terminal" style="display: none; margin-top: 15px;">
                        <div style="background: #0f172a; color: #a78bfa; padding: 15px; border-radius: 8px; font-family: monospace; min-height: 200px; max-height: 400px; overflow-y: auto; margin-bottom: 15px; font-size: 13px;" id="odu-term-out">
                            <div>Welcome to Jio ODU AT Terminal.</div>
                            <div style="color: #64748b;">Warning: Invalid AT commands may cause the modem to crash or reboot.</div>
                            <div style="color: #64748b;">(Note: Each command takes ~10 seconds to execute via Telnet injection)</div><br>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <input type="text" id="odu-term-in" class="cbi-input-text" placeholder="e.g. AT+QNWINFO" style="flex: 1; font-family: monospace; text-transform: uppercase;" autocomplete="off">
                            <button class="btn cbi-button-action important" id="odu-term-send">Send</button>
                        </div>
                    </div>
                    
                    <div id="container-config" style="display: none; margin-top: 15px;">
                        <div class="cbi-value">
                            <label class="cbi-value-title">ODU IP Address</label>
                            <div class="cbi-value-field">
                                <input type="text" id="cfg-ip" class="cbi-input-text" value="${ip}" autocomplete="off" data-lpignore="true">
                            </div>
                        </div>
                    </div>
                `;

                var btnWrap = document.createElement('div');
                btnWrap.className = 'right';
                btnWrap.style.marginTop = '20px';
                
                var btnCancel = document.createElement('button');
                btnCancel.className = 'btn';
                btnCancel.innerText = 'Close';
                btnCancel.onclick = ui.hideModal;
                btnWrap.appendChild(btnCancel);
                
                var btnSave = document.createElement('button');
                btnSave.className = 'btn cbi-button-action important';
                btnSave.innerText = 'Save & Apply';
                btnSave.id = 'btn-save-settings';
                btnWrap.appendChild(btnSave);
                
                body.appendChild(btnWrap);
                ui.showModal('Settings', [body]);
                
                var tLocking = document.getElementById('tab-locking');
                var tTerminal = document.getElementById('tab-terminal');
                var tConfig = document.getElementById('tab-config');
                var cLocking = document.getElementById('container-locking');
                var cTerminal = document.getElementById('container-terminal');
                var cConfig = document.getElementById('container-config');
                var bSave = document.getElementById('btn-save-settings');
                
                tLocking.onclick = function() {
                    tLocking.className = 'cbi-tab';
                    tTerminal.className = 'cbi-tab-disabled';
                    tConfig.className = 'cbi-tab-disabled';
                    cLocking.style.display = 'block';
                    cTerminal.style.display = 'none';
                    cConfig.style.display = 'none';
                    bSave.style.display = 'inline-block';
                };
                
                tTerminal.onclick = function() {
                    tTerminal.className = 'cbi-tab';
                    tLocking.className = 'cbi-tab-disabled';
                    tConfig.className = 'cbi-tab-disabled';
                    cTerminal.style.display = 'block';
                    cLocking.style.display = 'none';
                    cConfig.style.display = 'none';
                    bSave.style.display = 'none';
                    document.getElementById('odu-term-in').focus();
                };
                
                tConfig.onclick = function() {
                    tConfig.className = 'cbi-tab';
                    tLocking.className = 'cbi-tab-disabled';
                    tTerminal.className = 'cbi-tab-disabled';
                    cConfig.style.display = 'block';
                    cLocking.style.display = 'none';
                    cTerminal.style.display = 'none';
                    bSave.style.display = 'inline-block';
                };
                
                var inEl = document.getElementById('odu-term-in');
                var outEl = document.getElementById('odu-term-out');
                var sendBtn = document.getElementById('odu-term-send');
                
                var executeCmd = function() {
                    var cmd = inEl.value.trim();
                    if (!cmd) return;
                    if (!cmd.toUpperCase().startsWith('AT')) cmd = 'AT' + cmd;
                    
                    var outDiv = document.createElement('div');
                    outDiv.style.color = '#38bdf8';
                    outDiv.innerText = '> ' + cmd.toUpperCase();
                    outEl.appendChild(outDiv);
                    
                    var waitDiv = document.createElement('div');
                    waitDiv.style.color = '#94a3b8';
                    waitDiv.innerText = 'Executing...';
                    outEl.appendChild(waitDiv);
                    outEl.scrollTop = outEl.scrollHeight;
                    
                    inEl.value = '';
                    inEl.disabled = true;
                    sendBtn.disabled = true;
                    
                    fs.exec_direct('/usr/libexec/jodu_at.sh', [cmd.toUpperCase()]).then(function(res) {
                        waitDiv.innerText = (res && res.trim() !== '') ? res.trim() : 'OK';
                        waitDiv.style.color = '#f8fafc';
                        outEl.scrollTop = outEl.scrollHeight;
                    }).catch(function(e) {
                        waitDiv.innerText = 'Error: ' + e;
                        waitDiv.style.color = '#ef4444';
                        outEl.scrollTop = outEl.scrollHeight;
                    }).finally(function() {
                        inEl.disabled = false;
                        sendBtn.disabled = false;
                        inEl.focus();
                    });
                };
                
                sendBtn.onclick = executeCmd;
                inEl.onkeypress = function(e) {
                    if (e.key === 'Enter') executeCmd();
                };
                
                btnSave.onclick = function() {
                    var newIp = (document.getElementById('cfg-ip') ? document.getElementById('cfg-ip').value.trim() : '') || '192.168.225.1';
                    var newArfcn = (document.getElementById('cfg-arfcn') ? document.getElementById('cfg-arfcn').value.trim() : '');
                    var newPci = (document.getElementById('cfg-pci') ? document.getElementById('cfg-pci').value.trim() : '');
                    
                    btnSave.innerText = 'Applying...';
                    btnSave.disabled = true;
                    isConfiguring = true; 
                    
                    var stateEl = document.getElementById('ui-state');
                    var iconEl = document.getElementById('icon-conn');
                    var secondsLeft = 20;
                    var baseText = (newArfcn && newPci) ? 'LOCKING CELL' : (newArfcn || newPci ? 'APPLYING LOCK' : 'UNLOCKING CELL');
                    
                    if (stateEl && iconEl) {
                        stateEl.innerText = baseText + ' (' + secondsLeft + 's)';
                        stateEl.style.color = '#03dac6'; 
                        stateEl.style.textShadow = '0 0 15px rgba(3,218,198,0.4)'; 
                        
                        iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#03dac6"><path d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2M12 20A8 8 0 1 1 20 12A8 8 0 0 1 12 20M12 4A8 8 0 0 0 4 12H6A6 6 0 0 1 12 6V4Z"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>';
                        
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
                        '/usr/libexec/jodu_lock.sh "' + newArfcn + '" "' + newPci + '"'
                    ].join('; ');
                    
                    fs.exec_direct('/bin/sh', ['-c', cmds]).catch(function(e) {});
                };
            });
        });

        if (window.oduUptimeTicker) clearInterval(window.oduUptimeTicker);
        window.oduUptimeTicker = setInterval(function() {
            if (isConfiguring) return;
            var el = document.getElementById('ui-uptime-val');
            if (!el) return; 
            
            if (window.oduBootTime) {
                var up = Math.floor((Date.now() - window.oduBootTime) / 1000);
                if (up >= 0) {
                    var d = Math.floor(up / 86400);
                    var h = Math.floor((up % 86400) / 3600);
                    var m = Math.floor((up % 3600) / 60);
                    var s = up % 60;
                    var upStr = '';
                    if (d > 0) upStr += d + 'd ';
                    if (h > 0) upStr += h + 'h ';
                    if (m > 0) upStr += m + 'm ';
                    upStr += s + 's';
                    el.innerText = upStr;
                }
            }
        }, 1000);

        function formatBytes(bytes) {
            if (bytes === 0) return '0 B';
            var k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        poll.add(function() {
            if (isConfiguring) return; 

            return fs.exec_direct('/usr/libexec/odu-data.sh').then(function(res) {
                if (isConfiguring) return; 
                
                try { 
                    if (!res) return;
                    var data = JSON.parse(res.trim()); 
                    
                    if (data.uptime && data.uptime !== "0" && !isConfiguring) {
                        var up = parseInt(data.uptime, 10);
                        if (!isNaN(up) && up > 0) {
                            var bt = Date.now() - (up * 1000);
                            window.oduBootTime = bt;
                            sessionStorage.setItem('odu_boot_time', bt);
                        }
                    }

                    var stateEl = document.getElementById('ui-state');
                    var iconEl = document.getElementById('icon-conn');

                    if (data.cpu) {
                        var cpuVal = parseInt(data.cpu, 10);
                        if (!isNaN(cpuVal)) {
                            var cCol = '#4ade80';
                            if (cpuVal >= 35) cCol = '#facc15';
                            if (cpuVal >= 70) cCol = '#ef4444';
                            
                            var cpuEl = document.getElementById('ui-cpu');
                            if (cpuEl) {
                                cpuEl.innerText = cpuVal + '%';
                                cpuEl.style.color = cCol;
                                cpuEl.style.textShadow = '0 0 15px ' + cCol + '66';
                            }
                            
                            var iconCpuEl = document.getElementById('icon-cpu');
                            if (iconCpuEl) {
                                iconCpuEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="' + cCol + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="36" height="36"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>';
                            }
                        }
                    }

                    if (data.temp) {
                        var tempStr = data.temp;
                        if (tempStr.includes(',')) {
                            tempStr = tempStr.split(',')[1].trim();
                        }
                        var tempVal = parseInt(tempStr, 10);
                        if (!isNaN(tempVal)) {
                            var tCol = '#94a3b8';
                            if (tempVal >= 40) tCol = '#facc15';
                            if (tempVal > 45) tCol = '#ef4444';
                            
                            var tempEl = document.getElementById('ui-temp');
                            if (tempEl) {
                                tempEl.innerText = '(' + tempVal + '°C)';
                                tempEl.style.color = tCol;
                            }
                        }
                    }

                    if (data.server_link === 'INITIALIZING' || data.server_link === 'CONFIGURING') {
                        stateEl.innerText = 'PROVISIONING DEVICE';
                        stateEl.style.color = '#2dd4bf'; 
                        stateEl.style.textShadow = '0 0 15px rgba(45,212,191,0.4)'; 
                        iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="36" height="36"><circle cx="12" cy="12" r="2" fill="#2dd4bf"/><circle cx="12" cy="12" r="6"><animate attributeName="r" values="2; 10" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="1; 0" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="12" cy="12" r="10"><animate attributeName="r" values="2; 10" dur="1.5s" begin="0.75s" repeatCount="indefinite"/><animate attributeName="opacity" values="1; 0" dur="1.5s" begin="0.75s" repeatCount="indefinite"/></circle></svg>';
                        return; 
                    }

                    if (data.server_link === 'OFFLINE') {
                        stateEl.innerText = 'LINK DOWN';
                        stateEl.style.color = '#f43f5e';
                        stateEl.style.textShadow = '0 0 15px rgba(244,63,94,0.4)';
                        iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="36" height="36"><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M17.31 17.31A10.43 10.43 0 0 1 12 19c-7 0-10-7-10-7a13.23 13.23 0 0 1 7.58-6.19"/><path d="M14 14.66V17c0 .55-.47.98-.97 1.21C11.69 18.75 10 18.24 10 17v-2.34"/><path d="m2 2 20 20"/></svg>';
                        return;
                    }

                    if (data.state === 'SEARCHING' || data.state === 'DISCONNECTED') {
                        stateEl.innerText = 'PROVISIONING DEVICE';
                        stateEl.style.color = '#2dd4bf';
                        stateEl.style.textShadow = '0 0 15px rgba(45,212,191,0.4)';
                        iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>';
                        return;
                    }

                    stateEl.innerText = 'LINK ACTIVE';
                    stateEl.style.color = '#4ade80';
                    stateEl.style.textShadow = '0 0 15px rgba(74,222,128,0.4)';
                    iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="36" height="36"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
                    
                    document.getElementById('ui-top-mode').innerText = (data.mccmnc && data.mccmnc !== '--' ? data.mccmnc : 'Searching PLMN') + ' | NR5G-SA';

                    document.getElementById('ui-duplex').innerText = data.duplex;
                    document.getElementById('ui-band').innerText = data.band;
                    document.getElementById('ui-bw').innerText = data.bw + ' MHz';
                    document.getElementById('ui-arfcn').innerText = data.arfcn;
                    document.getElementById('ui-pcid').innerText = data.pcid;
                    var blerStr = data.bler || "0%";
                    var blerVal = parseFloat(blerStr.replace('%','')) || 0;
                    var blerCol = '#f43f5e';
                    if (blerVal <= 5) blerCol = '#4ade80';
                    else if (blerVal <= 10) blerCol = '#fbbf24';
                    var uiBler = document.getElementById('ui-bler');
                    uiBler.innerText = blerStr;
                    uiBler.style.color = blerCol;

                    document.getElementById('ui-mod').innerText = data.mod;
                    document.getElementById('ui-mimo').innerText = data.mimo;

                    var rsrp = parseInt(data.rsrp) || -130;
                    var rsrq = parseInt(data.rsrq) || -20;
                    var sinr = parseInt(data.sinr) || 0;

                    var rsrpCol = '#f43f5e'; 
                    if (rsrp >= -85) rsrpCol = '#4ade80'; 
                    else if (rsrp >= -100) rsrpCol = '#fbbf24'; 
                    var uiRsrp = document.getElementById('ui-rsrp');
                    uiRsrp.innerText = rsrp + ' dBm';
                    uiRsrp.style.color = rsrpCol;

                    var rsrqCol = '#f43f5e';
                    if (rsrq >= -9) rsrqCol = '#4ade80';
                    else if (rsrq >= -13) rsrqCol = '#fbbf24';
                    var uiRsrq = document.getElementById('ui-rsrq');
                    uiRsrq.innerText = rsrq + ' dB';
                    uiRsrq.style.color = rsrqCol;

                    var sinrCol = '#f43f5e';
                    if (sinr >= 25) sinrCol = '#4ade80';
                    else if (sinr >= 10) sinrCol = '#fbbf24';
                    var uiSinr = document.getElementById('ui-sinr');
                    uiSinr.innerText = sinr + ' dB';
                    uiSinr.style.color = sinrCol;

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
                    var sigSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="36" height="36">';
                    for (var i = 0; i < 5; i++) {
                        var fCol = (i < activeBars) ? '#38bdf8' : '#334155'; 
                        sigSvg += '<rect x="'+barCoords[i].x+'" y="'+barCoords[i].y+'" width="3" height="'+barCoords[i].h+'" rx="0.5" fill="'+fCol+'"/>';
                    }
                    sigSvg += '</svg>';
                    document.getElementById('icon-sig').innerHTML = sigSvg;

                    var rx = parseInt(data.rx_bytes) || 0;
                    var tx = parseInt(data.tx_bytes) || 0;
                    var uiRx = document.getElementById('ui-rx-bytes');
                    var uiTx = document.getElementById('ui-tx-bytes');
                    if(uiRx) uiRx.innerText = formatBytes(rx);
                    if(uiTx) uiTx.innerText = formatBytes(tx);

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
                } catch(e) {}
            });
        }, 2); 

        return container;
    }
});
