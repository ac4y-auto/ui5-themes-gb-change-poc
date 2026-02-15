/**
 * UI5 Bootstrap Environment Configuration
 *
 * Használat: index-configurable.html?env=cdn|local|backend|hybrid
 * Alapértelmezett: cdn
 */
/* eslint-disable no-unused-vars */
var UI5_CONFIGS = {
    cdn: {
        name: "CDN (SAPUI5 1.105.0)",
        url: "https://ui5.sap.com/1.105.0/resources/sap-ui-core.js",
        description: "SAPUI5 publikus CDN-ről (internet szükséges)"
    },
    local: {
        name: "Local (UI5 CLI cache)",
        url: "./resources/sap-ui-core.js",
        description: "UI5 CLI által letöltött lokális library-k"
    },
    backend: {
        name: "Backend (direkt)",
        url: "http://192.168.1.10:9000/resources/sap-ui-core.js",
        description: "Közvetlen betöltés a backend szerverről (CORS!)"
    },
    hybrid: {
        name: "Hybrid (backend via proxy)",
        url: "/proxy/resources/sap-ui-core.js",
        description: "Backend szerver reverse proxy-n keresztül (CORS-safe)"
    }
};
