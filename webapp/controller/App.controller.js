sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("poc.themeswitcher.controller.App", {

        onInit: function () {
            console.log("[Theme POC] App controller initialized");
        }

    });
});
