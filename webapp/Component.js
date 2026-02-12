sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/core/Theming"
], function (UIComponent, Theming) {
    "use strict";

    return UIComponent.extend("poc.themeswitcher.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            // Call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // Initialize the router
            this.getRouter().initialize();

            // Log theme changes
            Theming.attachApplied(function (oEvent) {
                var sTheme = Theming.getTheme();
                console.log("[Theme POC] Theme applied:", sTheme);
            });

            console.log("[Theme POC] Component initialized with theme:", Theming.getTheme());
        },

        /**
         * Switch theme programmatically.
         * This is the core API call - can be triggered from anywhere in the app.
         * @param {string} sThemeId - Theme identifier (e.g., "sap_fiori_3", "sap_fiori_3_dark")
         */
        switchTheme: function (sThemeId) {
            var sCurrentTheme = Theming.getTheme();
            if (sCurrentTheme !== sThemeId) {
                console.log("[Theme POC] Switching theme from", sCurrentTheme, "to", sThemeId);
                Theming.setTheme(sThemeId);
            }
        },

        /**
         * Get current theme ID
         * @returns {string}
         */
        getCurrentTheme: function () {
            return Theming.getTheme();
        }
    });
});
