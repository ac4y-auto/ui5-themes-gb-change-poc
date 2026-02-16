/**
 * UI5 Bootstrap Environment Configuration
 *
 * Környezet beállítása: build time (build.js) vagy URL param (?env=cdn|local|backend|hybrid)
 * Alapértelmezett: cdn
 */
/* eslint-disable no-unused-vars */
var UI5_CONFIGS = {
    cdn: {
        name: "CDN (SAPUI5 Latest)",
        url: "https://sapui5.hana.ondemand.com/resources/sap-ui-core.js",
        description: "SAPUI5 legújabb verzió a hivatalos SAP CDN-ről"
    },
    local: {
        name: "Local (UI5 CLI serve)",
        url: "/resources/sap-ui-core.js",
        description: "UI5 CLI által kiszolgált lokális SAPUI5 library-k"
    },
    backend: {
        name: "Backend Server (direct)",
        url: "http://192.168.1.10:9000/resources/sap-ui-core.js",
        description: "Közvetlen betöltés a backend szerverről (CORS szükséges)"
    },
    hybrid: {
        name: "Hybrid (backend via proxy)",
        url: "/proxy/resources/sap-ui-core.js",
        description: "Backend szerver reverse proxy-n keresztül (CORS-safe, SAP ajánlott)"
    }
};

// Get current environment (set at build time or via URL param)
function getCurrentEnv() {
    // 1. Build time injection (preferred)
    if (window.UI5_ENVIRONMENT) {
        return window.UI5_ENVIRONMENT;
    }
    // 2. URL parameter fallback
    var urlEnv = new URLSearchParams(location.search).get('env');
    if (urlEnv && UI5_CONFIGS[urlEnv]) {
        return urlEnv;
    }
    // 3. Default
    return 'cdn';
}

// Get UI5 bootstrap URL for current environment
function getUI5BootstrapUrl() {
    var env = getCurrentEnv();
    return UI5_CONFIGS[env] ? UI5_CONFIGS[env].url : UI5_CONFIGS.cdn.url;
}

// Export for use in Node.js (build.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UI5_CONFIGS: UI5_CONFIGS, getCurrentEnv: getCurrentEnv, getUI5BootstrapUrl: getUI5BootstrapUrl };
}
