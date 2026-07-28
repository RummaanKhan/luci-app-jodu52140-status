include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-jodu52140-status
PKG_VERSION:=1.1.0

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-jodu52140-status
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=JODU52140 5G Dashboard
  PKGARCH:=all
  DEPENDS:=+luci-base +wget +telnet-bsd
endef

define Package/luci-app-jodu52140-status/description
  Fully Automated 5G Dashboard for JODU52140.
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/luci-app-jodu52140-status/install
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) ./root/usr/share/luci/menu.d/luci-app-jodu52140-status.json $(1)/usr/share/luci/menu.d/
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/luci-app-jodu52140-status.json $(1)/usr/share/rpcd/acl.d/
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/jodu52140
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/jodu52140/status.js $(1)/www/luci-static/resources/view/jodu52140/
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/jodu52140/jio-logo.png $(1)/www/luci-static/resources/view/jodu52140/
	$(INSTALL_DIR) $(1)/usr/libexec
	$(INSTALL_BIN) ./root/usr/libexec/odu-data.sh $(1)/usr/libexec/
	$(INSTALL_BIN) ./root/usr/libexec/odu-setup.sh $(1)/usr/libexec/
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./root/etc/config/jodu52140 $(1)/etc/config/
endef

define Package/luci-app-jodu52140-status/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	rm -rf /tmp/luci-indexcache /tmp/luci-modulecache /tmp/luci-sessions/*
	/etc/init.d/rpcd restart
}
exit 0
endef

$(eval $(call BuildPackage,luci-app-jodu52140-status))
