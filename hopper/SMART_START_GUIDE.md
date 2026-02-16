# Smart Start Guide - Port Conflict Management

**Verzió**: 3.1
**Létrehozva**: 2026-02-15
**Státusz**: Production Ready ✅

---

## 🎯 Mi az a Smart Start?

A Smart Start egy intelligens szerver indító script, amely automatikusan kezeli a port konfliktusokat anélkül, hogy manuálisan kellene leállítanod a futó folyamatokat.

### Probléma

**Hagyományos start:**
```bash
npm run start:cdn

# Hiba: Port 8300 is already in use
# EADDRINUSE: address already in use :::8300
```

**Megoldás eddig:**
1. Manuálisan megkeresed a PID-t: `lsof -ti:8300`
2. Leölöd: `kill -9 <PID>`
3. Újra próbálod: `npm run start:cdn`

### Megoldás Smart Starttal

```bash
npm start  # Automatikusan kezeli a port konfliktust!
```

---

## 🚀 Használat

### Alapértelmezett (CDN mód)

```bash
npm start
```

### Explicit Módok

```bash
npm run smart-start:cdn      # SAPUI5 CDN
npm run smart-start:local    # Local UI5 CLI
npm run smart-start:backend  # Backend szerver
npm run smart-start:hybrid   # Hybrid (proxy)
```

### Custom Port

```bash
PORT=9000 npm run smart-start:cdn
```

---

## 🔍 Működés

### 1. Port Ellenőrzés

A script ellenőrzi, hogy a port (default: 8300) foglalt-e:

```javascript
// macOS/Linux
lsof -ti:8300

// Windows
netstat -ano | findstr :8300
```

### 2. Process Azonosítás

Ha a port foglalt, megnézi, hogy **ehhez a projekthez** tartozik-e a process:

```javascript
// Ellenőrzi a command line-t
ps -p <PID> -o command=

// Keres:
// - 'ui5-splash-screen-poc' (projekt marker)
// - 'http-server' (CDN/backend szerver)
// - 'ui5 serve' (local/hybrid szerver)
```

### 3. Döntés

| Feltétel | Akció |
|----------|-------|
| Port szabad | ✅ Szerver indítás |
| Port foglalt + saját projekt | 🔄 Process leöl + Szerver indítás |
| Port foglalt + más projekt | ❌ Hibaüzenet + Exit |

---

## 📋 Kimenet Példák

### Eset 1: Port Szabad

```
🚀 Smart Start - CDN Mode
   Port: 8300
   Project: ui5-splash-screen-poc

✓  Port 8300 is available

🔧 Building for environment: cdn...
✅ Environment 'cdn' injected into index.html
   window.UI5_ENVIRONMENT = 'cdn'

🚀 Starting server...

Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8300
  http://192.168.1.100:8300
```

### Eset 2: Port Foglalt (Saját Projekt)

```
🚀 Smart Start - CDN Mode
   Port: 8300
   Project: ui5-splash-screen-poc

⚠️  Port 8300 is already in use (PID: 54321)
✓  Process belongs to this project (ui5-splash-screen-poc)
🔄 Killing existing process (PID: 54321)...
✅ Process killed successfully

⏳ Waiting for port to be released...
✅ Port 8300 is now free

🔧 Building for environment: cdn...
✅ Environment 'cdn' injected into index.html

🚀 Starting server...
```

### Eset 3: Port Foglalt (Más Projekt)

```
🚀 Smart Start - CDN Mode
   Port: 8300
   Project: ui5-splash-screen-poc

⚠️  Port 8300 is already in use (PID: 99999)
❌ Port 8300 is used by another application (PID: 99999)
   This process does NOT belong to ui5-splash-screen-poc
   Please stop it manually or use a different port:
   PORT=9000 npm run smart-start:cdn
```

---

## 🛡️ Biztonsági Funkciók

### 1. Projekt Védelem

A script **NEM öli le** más projektek folyamatait:

```javascript
// Ellenőrzi:
if (cmdLine.includes('ui5-splash-screen-poc') ||
    cmdLine.includes('http-server') ||
    cmdLine.includes('ui5 serve')) {
    // Biztonságos leölni
} else {
    // STOP! Más projekt folyamata
    process.exit(1);
}
```

### 2. Process Marker

A szerver **environment változóval** van megjelölve:

```javascript
const server = spawn(command, args, {
    env: {
        ...process.env,
        UI5_SPLASH_PROJECT: 'ui5-splash-screen-poc'  // ← Projekt ID
    }
});
```

### 3. Várakozási Idő

Port felszabadítás után **max 3 másodperc** várakozás:

```javascript
const start = Date.now();
while (Date.now() - start < 3000) {
    if (!getPortPID(DEFAULT_PORT)) {
        break;  // Port felszabadult
    }
}
```

---

## 🔧 Troubleshooting

### Probléma: "Failed to kill process"

**Ok:** Nincs jogosultság a process leölésére

**Megoldás:**
```bash
# macOS/Linux
sudo npm run smart-start:cdn

# Windows (Admin CMD)
npm run smart-start:cdn
```

### Probléma: Port még mindig foglalt

**Ok:** A process nem szabadult fel 3 másodpercen belül

**Megoldás:**
```bash
# Manuális leállítás
lsof -ti:8300 | xargs kill -9  # macOS/Linux
taskkill /PID <PID> /F         # Windows

# Vagy használj másik portot
PORT=9000 npm run smart-start:cdn
```

### Probléma: "Port is used by another application"

**Ok:** A port-on futó process **NEM** ehhez a projekthez tartozik

**Megoldás:**

**Opció 1** - Leállítod a másik folyamatot:
```bash
lsof -ti:8300  # Megkapod a PID-t
kill -9 <PID>  # Leölöd
```

**Opció 2** - Másik portot használsz:
```bash
PORT=9000 npm run smart-start:cdn
```

**Opció 3** - Megnézed, mi fut a porton:
```bash
# macOS/Linux
lsof -i:8300

# Windows
netstat -ano | findstr :8300
```

---

## 🆚 Összehasonlítás

| | Hagyományos Start | Smart Start |
|---|---|---|
| **Port foglalt** | ❌ Hibaüzenet, manuális leállítás | ✅ Automatikus kezelés |
| **Ismételt futtatás** | ❌ Újra hibát dob | ✅ Mindig indul |
| **Más projekt védelme** | ⚠️ Nincs védelem | ✅ Biztonságos |
| **Egyszerűség** | ❌ 3 lépés (find PID, kill, restart) | ✅ 1 parancs |
| **Hibakezelés** | ❌ Nincs | ✅ Van (exit code, error msg) |

---

## 📝 Package.json Konfiguráció

```json
{
  "scripts": {
    "start": "npm run smart-start:cdn",
    "smart-start:cdn": "node start.js cdn",
    "smart-start:local": "node start.js local",
    "smart-start:backend": "node start.js backend",
    "smart-start:hybrid": "node start.js hybrid",

    "start:cdn": "node build.js cdn && http-server -p ${PORT:-8300} --cors -o",
    "start:local": "node build.js local && npx ui5 serve --port ${PORT:-8300} --open"
  }
}
```

**Magyarázat:**
- `npm start` → Smart Start (default CDN)
- `npm run start:cdn` → Manuális start (nincs port ellenőrzés)
- `npm run smart-start:cdn` → Explicit Smart Start

---

## 🎓 Fejlesztői Megjegyzések

### start.js Architektúra

```javascript
main() {
    1. getPortPID(8300) → PID vagy null
    2. if (PID exists) {
        3. isProjectProcess(PID) → true/false
        4. if (true) {
            5. killProcess(PID)
            6. wait 3s for port release
        } else {
            7. error + exit
        }
    }
    8. execSync('node build.js cdn')
    9. spawn(server, { env: { UI5_SPLASH_PROJECT: '...' } })
}
```

### Cross-Platform Kompatibilitás

| Platform | Port Check | Process Info | Kill |
|----------|-----------|--------------|------|
| **macOS** | `lsof -ti:8300` | `ps -p <PID> -o command=` | `kill -9 <PID>` |
| **Linux** | `lsof -ti:8300` | `ps -p <PID> -o command=` | `kill -9 <PID>` |
| **Windows** | `netstat -ano \| findstr :8300` | `wmic process where "ProcessId=<PID>" get CommandLine` | `taskkill /PID <PID> /F` |

---

## 🚦 Best Practices

### 1. Használd az alapértelmezett npm start-ot

```bash
# ✅ HELYES
npm start

# ❌ KERÜLENDŐ (csak troubleshooting esetén)
npm run start:cdn
```

### 2. Custom port csak dev környezetben

```bash
# ✅ DEV környezetben
PORT=9000 npm start

# ❌ Prod környezetben (használd az alapértelmezett 8300-at)
```

### 3. VSCode launch.json integráció

```json
{
    "name": "UI5 Splash - Smart Start (CDN)",
    "type": "node",
    "request": "launch",
    "runtimeExecutable": "npm",
    "runtimeArgs": ["run", "smart-start:cdn"],
    "console": "integratedTerminal"
}
```

---

## 📚 Kapcsolódó Dokumentáció

- [README.md](README.md) - Projekt áttekintés
- [RUNBOOK.md](RUNBOOK.md) - Operációs útmutató
- [CHANGELOG_v3.0.md](CHANGELOG_v3.0.md) - v3.0 változások

---

**Smart Start - Egyszerűbb fejlesztés, kevesebb manuális munka!** 🚀
