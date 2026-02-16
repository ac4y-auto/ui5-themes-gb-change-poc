#!/usr/bin/env node

/**
 * Smart Start Script for UI5 Theme Switching POC
 *
 * Features:
 * - Checks if port is in use
 * - Kills existing process if it belongs to this project
 * - Prevents killing unrelated processes
 * - Starts the server with project identifier
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

// Configuration
const DEFAULT_PORT = process.env.PORT || 8300;
const PROJECT_MARKER = 'poc-theme-switcher';
const env = process.argv[2] || 'cdn'; // cdn, local, backend, hybrid

// Valid environments
const validEnvs = ['cdn', 'local', 'backend', 'hybrid'];
if (!validEnvs.includes(env)) {
    console.error(`Invalid environment: ${env}`);
    console.error(`   Valid options: ${validEnvs.join(', ')}`);
    process.exit(1);
}

console.log(`Smart Start - ${env.toUpperCase()} Mode`);
console.log(`   Port: ${DEFAULT_PORT}`);
console.log(`   Project: ${PROJECT_MARKER}\n`);

/**
 * Check if port is in use and get PID
 */
function getPortPID(port) {
    try {
        let cmd;
        if (process.platform === 'win32') {
            cmd = `netstat -ano | findstr :${port}`;
        } else {
            // macOS/Linux
            cmd = `lsof -ti:${port}`;
        }

        const output = execSync(cmd, { encoding: 'utf8' });

        if (process.platform === 'win32') {
            // Parse Windows netstat output
            const lines = output.trim().split('\n');
            for (const line of lines) {
                const match = line.match(/LISTENING\s+(\d+)/);
                if (match) {
                    return match[1];
                }
            }
            return null;
        } else {
            // macOS/Linux - lsof returns PID directly
            return output.trim().split('\n')[0];
        }
    } catch (error) {
        // No process on port (lsof returns exit code 1)
        return null;
    }
}

/**
 * Check if process belongs to this project
 */
function isProjectProcess(pid) {
    try {
        let cmd;
        if (process.platform === 'win32') {
            cmd = `wmic process where "ProcessId=${pid}" get CommandLine /format:list`;
        } else {
            cmd = `ps -p ${pid} -o command=`;
        }

        const cmdLine = execSync(cmd, { encoding: 'utf8' });

        // Check if command line contains project marker OR common server names
        return cmdLine.includes(PROJECT_MARKER) ||
               cmdLine.includes('http-server') ||
               cmdLine.includes('ui5 serve');
    } catch (error) {
        return false;
    }
}

/**
 * Kill process by PID
 */
function killProcess(pid) {
    try {
        console.log(`Killing existing process (PID: ${pid})...`);
        if (process.platform === 'win32') {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        } else {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
        }
        console.log(`Process killed successfully\n`);
        return true;
    } catch (error) {
        console.error(`Failed to kill process: ${error.message}`);
        return false;
    }
}

/**
 * Main logic
 */
function main() {
    // 1. Check if port is in use
    const pid = getPortPID(DEFAULT_PORT);

    if (pid) {
        console.log(`Port ${DEFAULT_PORT} is already in use (PID: ${pid})`);

        // 2. Check if it's our project's process
        if (isProjectProcess(pid)) {
            console.log(`Process belongs to this project (${PROJECT_MARKER})`);

            // 3. Kill it
            if (!killProcess(pid)) {
                console.error(`Could not kill process. Please stop it manually.`);
                process.exit(1);
            }

            // Wait a bit for port to be released
            console.log(`Waiting for port to be released...`);
            const start = Date.now();
            while (Date.now() - start < 3000) {
                if (!getPortPID(DEFAULT_PORT)) {
                    break;
                }
            }
            console.log(`Port ${DEFAULT_PORT} is now free\n`);
        } else {
            console.error(`Port ${DEFAULT_PORT} is used by another application (PID: ${pid})`);
            console.error(`   This process does NOT belong to ${PROJECT_MARKER}`);
            console.error(`   Please stop it manually or use a different port:`);
            console.error(`   PORT=9000 npm run smart-start:${env}`);
            process.exit(1);
        }
    } else {
        console.log(`Port ${DEFAULT_PORT} is available\n`);
    }

    // 4. Start the server with project marker in environment
    console.log(`Building for environment: ${env}...`);

    try {
        execSync(`node build.js ${env}`, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Build failed`);
        process.exit(1);
    }

    console.log(`\nStarting server...\n`);

    // Determine command based on environment
    let command, args;
    if (env === 'local' || env === 'hybrid') {
        command = 'npx';
        args = ['ui5', 'serve', '--port', DEFAULT_PORT.toString(), '--open'];
        if (env === 'hybrid') {
            args.push('--config', 'ui5-backend.yaml');
        }
    } else {
        command = 'npx';
        args = ['http-server', 'webapp', '-p', DEFAULT_PORT.toString(), '--cors', '-o'];
    }

    // Start server with PROJECT_MARKER in environment
    const server = spawn(command, args, {
        stdio: 'inherit',
        env: {
            ...process.env,
            UI5_THEME_PROJECT: PROJECT_MARKER, // Project identifier
            PORT: DEFAULT_PORT.toString()
        }
    });

    server.on('error', (error) => {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    });

    server.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Server exited with code ${code}`);
            process.exit(code);
        }
    });

    // Handle Ctrl+C
    process.on('SIGINT', () => {
        console.log(`\n\nStopping server...`);
        server.kill('SIGINT');
        process.exit(0);
    });
}

// Run
main();
