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
            document.documentElement.removeAttribute("style");
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
