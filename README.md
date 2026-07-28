<div align="center">
 
# luci-app-jodu52140-status
## Made with Gemini as a Personal Fun Project.
 
![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![OpenWrt Compatible](https://img.shields.io/badge/OpenWrt-Compatible-success.svg)
![ImmortalWrt Compatible](https://img.shields.io/badge/ImmortalWrt-Compatible-success.svg)

A Sleek, lightweight LuCI web interface module for OpenWrt that seamlessly monitors and configures the **JODU52140** directly from your router. 

This application entirely eliminates the need to log into the ODU web portal. It bridges your router and the ODU hardware, pulling real-time baseband diagnostics and pushing advanced hardware-level AT commands straight from your router's dashboard.
</div>


## Features

* **Bypass the Default Portal:** View all crucial 5G statistics natively inside OpenWrt Router.
* **Advanced Hardware Control:** 
  * **NR-ARFCN & PCI Locking:** Force your Qualcomm baseband modem to connect to a specific tower/frequency using direct `AT` commands directly from the UI.
* **Smart UI Elements:**
  * **Dynamic 5-Bar Signal Quality:** Uses a custom weighted algorithm to calculate true signal quality, displaying a responsive, familiar 5-bar mobile network icon.
  * **Color-Coded Thermal Monitoring:** Real-time CPU/modem temperature tracking that automatically shifts colors to warn you of thermal throttling.
* **Comprehensive Metrics:** Tracks Duplex Mode, Band, Bandwidth, BLER, Modulation (QAM), MIMO, RSRP, RSRQ, and SINR for both Primary and Secondary (Carrier Aggregation) cells.

---

## Prerequisites

Since this application utilizes the router's command line to establish a connection and push configurations to the ODU, ensure your OpenWrt Router and the ODU has the `telnet` enabled.

---

## Installation

### Pre-built Package (Recommended)
Grab the Latest from the ![Releases]([https://img.shields.io/badge/ImmortalWrt-Compatible-success.svg](https://github.com/RummaanKhan/luci-app-jodu52140-status/releases))
```sh
apk add --allow-untrusted luci-app-jodu52140-status-<version>.apk
```

## Usage & Configuration

Once installed, navigate to Status -> 5G Dashboard in your OpenWrt LuCI menu.

**Initial Setup:** The dashboard will automatically attempt to connect to the default Jio ODU IP (192.168.225.1). You will see "PROVISIONING DEVICE" animation while the router installs the reporting daemon on the ODU.

## Cell Locking (PCI/ARFCN):

**Locking:** Click the ⚙️ Settings button in the top right corner.

Enter the exact NR-ARFCN and Physical Cell ID (PCI) of the tower you wish to lock onto.

Click Save & Apply. The UI will display a 20-second countdown while the hardware natively drops the connection and locks the baseband to your selected tower.

**Unlocking:** To return to automatic tower selection, simply clear the text fields in the Settings menu and hit Apply.

## Disclaimer

This project is not affiliated with, endorsed by, or authorized by Jio or Qualcomm. Utilizing AT commands to modify cellular connectivity parameters (like PCI locking) is done at your own risk. Incorrect configurations may result in temporary loss of internet connectivity until reset.
