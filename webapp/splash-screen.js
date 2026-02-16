/**
 * Splash Screen Controller
 * @description External JavaScript for UI5 Splash Screen
 * @version 1.0.0
 */

(function() {
    'use strict';

    /**
     * Initialize splash screen on DOMContentLoaded
     */
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Splash] DOM loaded, initializing splash screen...');

        // Set video playback rate (slow motion)
        var video = document.getElementById('splash-video');
        if (video) {
            video.playbackRate = 0.2; // 5x slower (20% speed)
            console.log('[Splash] Video playback rate set to 0.2 (5x slower)');
        }

        // Show environment badge (optional)
        showEnvironmentBadge();
    });

    /**
     * Hide splash screen when UI5 is ready
     */
    function hideSplashScreen(delay) {
        delay = delay || 500; // Default 500ms delay

        setTimeout(function() {
            // Remove loading class from body
            document.body.classList.remove('loading');

            var splash = document.getElementById('splash-screen');
            if (splash) {
                console.log('[Splash] Hiding splash screen with fade-out...');
                splash.classList.add('fade-out');

                // Remove from DOM after animation
                setTimeout(function() {
                    splash.remove();
                    console.log('[Splash] Splash screen removed from DOM');
                }, 1000); // Match CSS transition duration
            }
        }, delay);
    }

    /**
     * Show environment badge (optional debug info)
     */
    function showEnvironmentBadge() {
        // Get current environment
        var env = typeof getCurrentEnv === 'function' ? getCurrentEnv() : 'cdn';

        // Create badge element
        var badge = document.getElementById('env-badge');
        if (badge) {
            badge.textContent = 'UI5 Source: ' + env.toUpperCase();
            badge.className = 'env-badge ' + env;
        }
    }

    /**
     * Attach to UI5 Core init event
     * This ensures splash screen hides when UI5 is fully loaded
     */
    if (typeof sap !== 'undefined') {
        // UI5 is already loaded (unlikely)
        console.log('[Splash] UI5 already loaded, hiding splash...');
        hideSplashScreen();
    } else {
        // Wait for UI5 to load
        console.log('[Splash] Waiting for UI5 Core to initialize...');

        // Polling mechanism to detect UI5 load
        var checkUI5Interval = setInterval(function() {
            if (typeof sap !== 'undefined' && sap.ui && sap.ui.getCore) {
                clearInterval(checkUI5Interval);
                console.log('[Splash] UI5 Core detected, attaching init handler...');

                sap.ui.getCore().attachInit(function() {
                    console.log('[Splash] UI5 Core initialized successfully');
                    hideSplashScreen();
                });
            }
        }, 100); // Check every 100ms

        // Fallback timeout (hide after 10 seconds max)
        setTimeout(function() {
            clearInterval(checkUI5Interval);
            if (document.getElementById('splash-screen')) {
                console.warn('[Splash] UI5 init timeout, forcing splash screen hide');
                hideSplashScreen(0);
            }
        }, 10000);
    }

    /**
     * Expose hide function globally (optional)
     * Allows manual control: SplashScreen.hide()
     */
    window.SplashScreen = {
        hide: hideSplashScreen,
        show: function() {
            var splash = document.getElementById('splash-screen');
            if (splash) {
                splash.classList.remove('fade-out');
                console.log('[Splash] Splash screen shown');
            }
        }
    };

})();
