/**
 * UI5 Bootstrap Controller
 * @description Dynamic UI5 bootstrap script injection based on environment
 * @version 1.0.0
 */

(function() {
    'use strict';

    // Get current environment
    var env = getCurrentEnv();
    var config = UI5_CONFIGS[env];

    // Show environment badge
    var badge = document.getElementById('env-badge');
    if (badge) {
        badge.textContent = 'UI5 ENV: ' + config.name;
        badge.classList.add('show');
        setTimeout(function() {
            badge.classList.remove('show');
        }, 3000);
    }

    // Log configuration
    console.log('[UI5 Bootstrap] Environment:', config.name);
    console.log('[UI5 Bootstrap] Bootstrap URL:', config.url);
    console.log('[UI5 Bootstrap] Description:', config.description);

    // Create and inject UI5 bootstrap script
    var script = document.createElement('script');
    script.id = 'sap-ui-bootstrap';
    script.src = config.url;
    script.setAttribute('data-sap-ui-theme', 'sap_horizon');
    script.setAttribute('data-sap-ui-libs', 'sap.m');
    script.setAttribute('data-sap-ui-compatVersion', 'edge');
    script.setAttribute('data-sap-ui-async', 'true');
    script.setAttribute('data-sap-ui-onInit', 'module:sap/ui/core/ComponentSupport');
    script.setAttribute('data-sap-ui-resourceroots', JSON.stringify({
        "poc.themeswitcher": "./"
    }));
    script.setAttribute('data-sap-ui-xx-bindingSyntax', 'complex');

    // Handle script load error
    script.onerror = function() {
        console.error('[UI5 Bootstrap] Failed to load UI5 from:', config.url);
        alert('Failed to load UI5 from ' + config.name + '. Please check the configuration.');
    };

    // Handle script load success
    script.onload = function() {
        console.log('[UI5 Bootstrap] UI5 script loaded successfully');
    };

    // Inject script into document head
    document.head.appendChild(script);

    console.log('[UI5 Bootstrap] Bootstrap script injected into DOM');

})();
