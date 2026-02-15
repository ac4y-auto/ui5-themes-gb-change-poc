sap.ui.define([
    "sap/ui/core/UIComponent"
], function (UIComponent) {
    "use strict";

    return UIComponent.extend("poc.themeswitcher.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this.getRouter().initialize();

            var oCore = sap.ui.getCore();

            // Log theme changes (1.105.0 compatible API)
            oCore.attachThemeChanged(function () {
                console.log("[Theme POC] Theme applied:",
                    oCore.getConfiguration().getTheme());
            });

            console.log("[Theme POC] Component initialized with theme:",
                oCore.getConfiguration().getTheme());
        },

        switchTheme: function (sThemeId) {
            var oCore = sap.ui.getCore();
            var sCurrentTheme = oCore.getConfiguration().getTheme();
            if (sCurrentTheme !== sThemeId) {
                console.log("[Theme POC] Switching theme from", sCurrentTheme, "to", sThemeId);
                oCore.applyTheme(sThemeId);
            }
        },

        getCurrentTheme: function () {
            return sap.ui.getCore().getConfiguration().getTheme();
        }
    });
});
