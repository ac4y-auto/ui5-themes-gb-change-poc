#!/usr/bin/env node

/**
 * Build Script for UI5 Theme Switching POC
 *
 * Purpose: Inject environment-specific configuration at build time
 *
 * Usage:
 *   node build.js [cdn|local|backend|hybrid]
 *
 * Environment modes:
 *   - cdn: SAPUI5 from CDN (default)
 *   - local: Local UI5 from UI5 CLI cache
 *   - backend: Backend server (192.168.1.10:9000)
 *   - hybrid: Backend via local proxy
 */

const fs = require('fs');
const path = require('path');

// Get environment from command line argument
const env = process.argv[2] || process.env.UI5_ENV || 'cdn';

// Validate environment
const validEnvs = ['cdn', 'local', 'backend', 'hybrid'];
if (!validEnvs.includes(env)) {
    console.error(`Invalid environment: ${env}`);
    console.error(`   Valid options: ${validEnvs.join(', ')}`);
    process.exit(1);
}

console.log(`Building for environment: ${env}`);

// Read index.template.html from webapp/
const templatePath = path.join(__dirname, 'webapp', 'index.template.html');
const outputPath = path.join(__dirname, 'webapp', 'index.html');

let templateContent = fs.readFileSync(templatePath, 'utf8');

// Inject environment variable
const envInjection = `<script>window.UI5_ENVIRONMENT = '${env}';</script>`;

// Replace the {{ENV_INJECTION}} placeholder
const indexContent = templateContent.replace('{{ENV_INJECTION}}', envInjection);

// Write the final index.html
fs.writeFileSync(outputPath, indexContent, 'utf8');

console.log(`Environment '${env}' injected into webapp/index.html`);
console.log(`   window.UI5_ENVIRONMENT = '${env}'`);
console.log(`\nYou can now start the server with: npm run serve:${env}`);
