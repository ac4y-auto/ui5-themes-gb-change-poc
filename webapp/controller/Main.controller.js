sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], function (Controller, MessageBox) {
    "use strict";

    var ALARM_PATCH = {
        "--sapBackgroundColor":       "#5c0000",
        "--sapShell_Background":      "#8b0000",
        "--sapPageHeader_Background": "#6b0000",
        "--sapBrandColor":            "#ff1744",
        "--sapErrorColor":            "#ff5252",
        "--sapTile_Background":       "#4a0000",
        "--sapList_Background":       "#3d0000",
        "--sapButton_Reject_Background": "#b71c1c",
        "--sapContent_LabelColor":    "#ffcccc"
    };

    var ALARM_CSS_ID = "alarm-theme-override";
    var ALARM_CSS = [
        ".sapUiBody { background-color: #8b0000 !important; }",
        ".sapMShellBG { background-color: #8b0000 !important; }",
        ".sapMShell > .sapMShellBG { background-color: #8b0000 !important; }",
        ".sapMPage { background-color: #5c0000 !important; }",
        ".sapMPageBgSolid { background-color: #5c0000 !important; }",
        ".sapMBar { background-color: #6b0000 !important; }",
        ".sapMPageHeader { background-color: #6b0000 !important; }",
        ".sapMDialogBlockLayer { background-color: rgba(139, 0, 0, 0.7) !important; }"
    ].join("\n");

    return Controller.extend("poc.themeswitcher.controller.Main", {

        onInit: function () {
            this._sOriginalTheme = sap.ui.getCore().getConfiguration().getTheme();
        },

        _applyAlarmTheme: function () {
            var sCurrentTheme = sap.ui.getCore().getConfiguration().getTheme();

            var fnApplyPatch = function () {
                Object.keys(ALARM_PATCH).forEach(function (sVar) {
                    document.documentElement.style.setProperty(sVar, ALARM_PATCH[sVar]);
                });
                if (!document.getElementById(ALARM_CSS_ID)) {
                    var oStyle = document.createElement("style");
                    oStyle.id = ALARM_CSS_ID;
                    oStyle.textContent = ALARM_CSS;
                    document.head.appendChild(oStyle);
                }
            };

            if (sCurrentTheme !== "sap_horizon_dark") {
                var fnOnce = function () {
                    fnApplyPatch();
                    sap.ui.getCore().detachThemeChanged(fnOnce);
                };
                sap.ui.getCore().attachThemeChanged(fnOnce);
                sap.ui.getCore().applyTheme("sap_horizon_dark");
            } else {
                fnApplyPatch();
            }
        },

        _restoreTheme: function () {
            // Remove only the CSS variables we set (not the whole style attribute,
            // because UI5 may set height:100% on <html> which is needed for Shell layout)
            Object.keys(ALARM_PATCH).forEach(function (sVar) {
                document.documentElement.style.removeProperty(sVar);
            });
            var oStyle = document.getElementById(ALARM_CSS_ID);
            if (oStyle) { oStyle.remove(); }
            var sCurrentTheme = sap.ui.getCore().getConfiguration().getTheme();
            if (sCurrentTheme !== this._sOriginalTheme) {
                sap.ui.getCore().applyTheme(this._sOriginalTheme);
            }
        },

        onSimulateAlarm: function () {
            this._applyAlarmTheme();

            MessageBox.error(
                "RIASZTÁS!\nKritikus állapot észlelve a rendszerben.",
                {
                    title: "Alarm (Critical)",
                    onClose: this._restoreTheme.bind(this)
                }
            );
        }

    });
});
