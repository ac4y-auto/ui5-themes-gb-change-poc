sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
    "use strict";

    // ====================================================================
    //  VIRTUAL THEME REGISTRY
    //
    //  Each entry defines a logical "theme" composed of:
    //    - base   : a real UI5 theme id (loaded via Theming.setTheme)
    //    - label  : human-readable name shown in the UI
    //    - patch  : CSS custom properties applied ON TOP of the base theme
    //              (null = no patch, pure base theme)
    // ====================================================================

    var THEMES = {
        normal: {
            base: "sap_horizon",
            label: "Normal (Horizon Light)",
            patch: null
        },
        normal_branded: {
            base: "sap_horizon",
            label: "Normal – Branded",
            patch: {
                "--sapBrandColor":            "#1b5e20",
                "--sapShell_Background":      "#e8f5e9",
                "--sapPageHeader_Background": "#c8e6c9",
                "--sapButton_Emphasized_Background": "#2e7d32",
                "--sapButton_Emphasized_Hover_Background": "#1b5e20"
            }
        },
        warning: {
            base: "sap_horizon",
            label: "Warning",
            patch: {
                "--sapBackgroundColor":       "#fff8e1",
                "--sapShell_Background":      "#f9a825",
                "--sapPageHeader_Background": "#fff3cd",
                "--sapBrandColor":            "#ff8f00",
                "--sapTile_Background":       "#fff8e1",
                "--sapList_Background":       "#fffde7",
                "--sapButton_Background":     "#fff3cd"
            }
        },
        alarm: {
            base: "sap_horizon_dark",
            label: "Alarm (Critical)",
            patch: {
                "--sapBackgroundColor":       "#1a0000",
                "--sapShell_Background":      "#4a0e0e",
                "--sapPageHeader_Background": "#330000",
                "--sapBrandColor":            "#ff1744",
                "--sapErrorColor":            "#ff5252",
                "--sapTile_Background":       "#2d0a0a",
                "--sapList_Background":       "#1f0000",
                "--sapButton_Reject_Background": "#b71c1c"
            }
        },
        nightshift: {
            base: "sap_horizon_dark",
            label: "Night Shift (Dark)",
            patch: null
        },
        nightshift_dimmed: {
            base: "sap_horizon_dark",
            label: "Night Shift – Extra Dim",
            patch: {
                "--sapBackgroundColor":       "#0a0a0f",
                "--sapShell_Background":      "#060610",
                "--sapPageHeader_Background": "#0d0d15",
                "--sapTile_Background":       "#0f0f18",
                "--sapList_Background":       "#0c0c14",
                "--sapContent_LabelColor":    "#7a7a8e"
            }
        }
    };

    return Controller.extend("poc.themeswitcher.controller.Main", {

        // ================================================================
        // Lifecycle
        // ================================================================

        onInit: function () {
            // Build a model from the registry so the View can bind to it
            var aThemeList = Object.keys(THEMES).map(function (sKey) {
                return { key: sKey, label: THEMES[sKey].label };
            });
            var oModel = new JSONModel({
                themes: aThemeList,
                activeThemeKey: "normal",
                activeThemeLabel: THEMES.normal.label,
                activeBaseTheme: THEMES.normal.base,
                hasPatch: false
            });
            this.getView().setModel(oModel, "theme");

            // Listen for base-theme applied events (1.105.0 compatible API)
            sap.ui.getCore().attachThemeChanged(this._onBaseThemeApplied.bind(this));

            // Track which virtual theme is active
            this._sActiveThemeKey = null;

            // Apply initial theme
            this._switchToVirtualTheme("normal");
        },

        // ================================================================
        // Base-theme applied callback
        // ================================================================

        _onBaseThemeApplied: function () {
            // If a patch is pending, apply it now that the base CSS is loaded
            if (this._oPendingPatch) {
                this._applyPatch(this._oPendingPatch);
                this._oPendingPatch = null;
            }
        },

        // ================================================================
        // Virtual theme selector (dropdown)
        // ================================================================

        onVirtualThemeChange: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            this._switchToVirtualTheme(sKey);
        },

        // ================================================================
        // Simulated event-driven triggers
        // ================================================================

        onSimulateNormal:     function () { this._switchToVirtualTheme("normal"); },
        onSimulateWarning:    function () { this._switchToVirtualTheme("warning"); },
        onSimulateAlarm:      function () { this._switchToVirtualTheme("alarm"); },
        onSimulateNightShift: function () { this._switchToVirtualTheme("nightshift"); },

        // ================================================================
        // CORE: Virtual theme switching
        // ================================================================

        /**
         * Switches to a virtual theme by key.
         *
         * Steps:
         *   1. Remove any previous CSS-variable patch
         *   2. If the base theme differs from the current one,
         *      call Theming.setTheme() and queue the patch
         *   3. If the base is already active, apply the patch immediately
         *
         * @param {string} sThemeKey - key in THEMES registry
         */
        _switchToVirtualTheme: function (sThemeKey) {
            var oThemeDef = THEMES[sThemeKey];
            if (!oThemeDef) {
                MessageToast.show("Unknown virtual theme: " + sThemeKey);
                return;
            }

            if (this._sActiveThemeKey === sThemeKey) {
                MessageToast.show("Already active: " + oThemeDef.label);
                return;
            }

            console.log("[Theme POC] Switching virtual theme:",
                this._sActiveThemeKey, "→", sThemeKey,
                "(base:", oThemeDef.base + ", patch:", !!oThemeDef.patch + ")");

            // 1. Always clear previous patch first
            this._removePatch();

            var sCurrentBase = sap.ui.getCore().getConfiguration().getTheme();

            if (sCurrentBase !== oThemeDef.base) {
                // Base theme needs to change – queue the patch
                this._oPendingPatch = oThemeDef.patch;
                sap.ui.getCore().applyTheme(oThemeDef.base);
            } else {
                // Same base – apply patch immediately
                this._applyPatch(oThemeDef.patch);
            }

            // 2. Update state
            this._sActiveThemeKey = sThemeKey;
            this._updateModel(sThemeKey, oThemeDef);
        },

        // ================================================================
        // CSS variable patching
        // ================================================================

        /**
         * Applies CSS custom property overrides to :root
         * @param {Object|null} oPatch - map of CSS variable → value
         */
        _applyPatch: function (oPatch) {
            if (!oPatch) { return; }

            var oRoot = document.documentElement;
            var aVars = Object.keys(oPatch);

            aVars.forEach(function (sVar) {
                oRoot.style.setProperty(sVar, oPatch[sVar]);
            });

            console.log("[Theme POC] Applied CSS patch:", aVars.length, "variables");

            // Update model flag
            var oModel = this.getView().getModel("theme");
            if (oModel) {
                oModel.setProperty("/hasPatch", true);
            }
        },

        /**
         * Removes all CSS custom property overrides from :root
         */
        _removePatch: function () {
            document.documentElement.removeAttribute("style");

            var oModel = this.getView().getModel("theme");
            if (oModel) {
                oModel.setProperty("/hasPatch", false);
            }
        },

        // ================================================================
        // Model helpers
        // ================================================================

        _updateModel: function (sThemeKey, oThemeDef) {
            var oModel = this.getView().getModel("theme");
            oModel.setProperty("/activeThemeKey", sThemeKey);
            oModel.setProperty("/activeThemeLabel", oThemeDef.label);
            oModel.setProperty("/activeBaseTheme", oThemeDef.base);
            oModel.setProperty("/hasPatch", !!oThemeDef.patch);

            MessageToast.show("Theme: " + oThemeDef.label);
        }

        // ================================================================
        // Integration example (same as before, now using virtual themes):
        //
        //   onWebSocketMessage: function(oMsg) {
        //       this._switchToVirtualTheme(oMsg.themeKey);
        //       // where themeKey = "normal" | "warning" | "alarm" | ...
        //   }
        // ================================================================
    });
});
