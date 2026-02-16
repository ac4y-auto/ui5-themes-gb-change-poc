# UI5 Splash Screen - Környezeti Konfiguráció Koncepció

## Áttekintés

Ez a projekt egy konfigurálható UI5 splash screen megoldást valósít meg, amely három különböző UI5 forrásból tud betölteni:

1. **CDN** - OpenUI5 SDK (internet)
2. **Local** - node_modules (helyi telepítés)
3. **Backend** - Egyedi backend szerver (192.168.1.10:9000)

## Architektúra

### 1. Konfiguráció Réteg

**Fájl**: `config.js`

Ez a központi konfigurációs fájl tartalmazza az összes környezet definícióját:

```javascript
const UI5_CONFIGS = {
    cdn: { ... },
    local: { ... },
    backend: { ... }
}
```

**Funkciók**:
- `getCurrentEnv()` - Aktuális környezet lekérdezése
- `getUI5BootstrapUrl()` - UI5 bootstrap URL generálása
- `saveEnvPreference()` - Környezet preferencia mentése localStorage-ba

### 2. Dinamikus Bootstrap

Az `index-configurable.html` dinamikusan tölti be a megfelelő UI5 verziót:

```javascript
// 1. Környezet detektálása
var env = getCurrentEnv();

// 2. Script tag generálása
var script = document.createElement('script');
script.src = config.url;

// 3. Injektálás a DOM-ba
document.head.appendChild(script);
```

### 3. Környezet Váltás Módjai

#### A) URL paraméterrel
```
http://localhost:8300/index-configurable.html?env=backend
http://localhost:8300/index-configurable.html?env=local
http://localhost:8300/index-configurable.html?env=cdn
```

#### B) NPM scriptekkel
```bash
npm run start:cdn       # CDN verzió
npm run start:local     # Local verzió
npm run start:backend   # Backend verzió
```

#### C) LocalStorage-ból
A kiválasztott környezet mentésre kerül és automatikusan újratöltődik.

## Használati Módok

### 1. CDN Mód (Alapértelmezett)

**Előnyök**:
- Nincs szükség helyi UI5 telepítésre
- Mindig a legújabb verzió
- Gyors kezdés

**Hátrányok**:
- Internet kapcsolat szükséges
- Lassabb betöltés (külső szerver)

**Használat**:
```bash
npm run start:cdn
```

Vagy egyszerűen:
```bash
npm start
```

### 2. Local Mód (node_modules)

**Előnyök**:
- Offline működés
- Gyors betöltés (helyi fájl)
- Verzió kontroll

**Hátrányok**:
- Telepítés szükséges
- Manuális frissítés

**Telepítés**:
```bash
npm install @openui5/sap.ui.core @openui5/sap.m @openui5/themelib_sap_horizon
```

**Használat**:
```bash
npm run start:local
```

### 3. Backend Mód (Custom Server)

**Előnyök**:
- Központi UI5 verzió kezelés
- Egyedi testreszabások
- Belső hálózaton gyors

**Hátrányok**:
- Backend szerver szükséges
- Hálózati kapcsolat függőség

**Backend követelmények**:
- UI5 resources elérhető a `/resources/` útvonalon
- CORS engedélyezve
- `http://192.168.1.10:9000/resources/sap-ui-core.js` elérhető

**Használat**:
```bash
npm run start:backend
```

## Projekt Struktúra

```
ui5-splash-screen-poc/
├── index.html                  # Eredeti CDN verzió (kompatibilitás)
├── index-configurable.html     # Új konfigurálható verzió
├── index-demo.html             # Demo verzió (CSS animációval)
├── config.js                   # Környezeti konfiguráció
├── package.json                # NPM scriptek és függőségek
├── .env.example                # Környezeti változók példa
├── Component.js                # UI5 Component
├── manifest.json               # App manifest
├── view/
│   └── App.view.xml           # UI5 View
├── controller/
│   └── App.controller.js      # UI5 Controller
├── splash-video.mp4           # Splash screen videó
├── splash-poster.jpeg         # Poster kép
├── README.md                   # Általános dokumentáció
├── FEJLESZTOI_UTASITAS.md    # Fejlesztői útmutató
└── KONZEPCIÓ.md              # Ez a fájl
```

## Konfiguráció Részletek

### config.js Struktúra

```javascript
{
    cdn: {
        name: 'CDN (OpenUI5 SDK)',
        url: 'https://sdk.openui5.org/resources/sap-ui-core.js',
        description: 'Uses OpenUI5 from official CDN'
    },
    local: {
        name: 'Local (node_modules)',
        url: './node_modules/@openui5/sap.ui.core/resources/sap-ui-core.js',
        description: 'Uses locally installed OpenUI5 from node_modules'
    },
    backend: {
        name: 'Backend Server',
        url: 'http://192.168.1.10:9000/resources/sap-ui-core.js',
        description: 'Uses UI5 from custom backend server'
    }
}
```

### Backend URL Testreszabása

Ha más backend URL-t szeretnél használni, módosítsd a `config.js` fájlt:

```javascript
backend: {
    name: 'Backend Server',
    url: 'http://YOUR_SERVER:PORT/resources/sap-ui-core.js',
    description: 'Uses UI5 from custom backend server'
}
```

## NPM Scriptek

### Indítási Scriptek

| Script | Parancs | Leírás |
|--------|---------|--------|
| `start` | `npm start` | Alapértelmezett (CDN) indítás |
| `start:cdn` | `npm run start:cdn` | CDN verzió indítása |
| `start:local` | `npm run start:local` | Local verzió indítása |
| `start:backend` | `npm run start:backend` | Backend verzió indítása |

### Működés

1. **cross-env** - Környezeti változó beállítása (platform-független)
2. **http-server** - Dev szerver indítása 8300-as porton
3. **--cors** - CORS engedélyezése
4. **-o** - Automatikus böngésző megnyitás

## Környezet Detektálás Prioritás

A rendszer a következő sorrendben dönti el, melyik környezetet használja:

1. **URL paraméter** (`?env=backend`) - Legmagasabb prioritás
2. **LocalStorage** (`localStorage.getItem('ui5_env')`)
3. **Alapértelmezett** (`cdn`)

## Fejlesztői Workflow

### 1. Új Környezet Hozzáadása

**Lépések**:

1. Add hozzá a konfigurációt a `config.js`-hez:
```javascript
newenv: {
    name: 'New Environment',
    url: 'http://example.com/ui5/sap-ui-core.js',
    description: 'Description here'
}
```

2. Add hozzá az NPM scriptet a `package.json`-hoz:
```json
"start:newenv": "cross-env UI5_ENV=newenv npm run serve"
```

3. Dokumentáld a `KONZEPCIÓ.md`-ben

### 2. Backend Szerver Setup

**Minimális Backend Követelmények**:

```javascript
// Node.js példa (Express)
const express = require('express');
const app = express();

// CORS engedélyezése
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// UI5 resources kiszolgálása
app.use('/resources', express.static('path/to/ui5/resources'));

app.listen(9000);
```

**SAPUI5/OpenUI5 telepítés**:
- Töltsd le az OpenUI5 SDK-t
- Vagy használj SAP UI5 tooling-ot
- Vagy használj CDN proxy-t

### 3. Local UI5 Telepítés

```bash
# 1. Telepítsd az OpenUI5 csomagokat
npm install --save-dev @openui5/sap.ui.core @openui5/sap.m @openui5/themelib_sap_horizon

# 2. Indítsd el local módban
npm run start:local
```

## Splash Screen Konfiguráció

A splash screen működése minden környezetben azonos:

- **Videó**: `splash-video.mp4` (5x lassított)
- **Poster**: `splash-poster.jpeg`
- **Időtartam**: 2 perc (120 000 ms)
- **Fade-out**: 1 másodperc
- **Méret**: 80% szélesség/magasság, középre igazítva

### Splash Screen Testreszabás

**Időtartam módosítása**:
```javascript
setTimeout(function() {
    // ...
}, 120000); // <- Változtasd ezt (ms)
```

**Videó sebesség módosítása**:
```javascript
video.playbackRate = 0.2; // <- 0.2 = 5x lassabb
```

**Méret módosítása**:
```css
#splash-video {
    width: 80%;  /* <- Változtasd */
    height: 80%; /* <- Változtasd */
}
```

## Hibakeresés

### 1. UI5 nem töltődik be

**Ellenőrizd**:
- Network tab a böngészőben
- Console hibaüzenetek
- CORS problémák
- Backend szerver elérhető-e

**Megoldás**:
```javascript
script.onerror = function() {
    console.error('Failed to load UI5 from:', config.url);
    // Fallback CDN-re
    script.src = 'https://sdk.openui5.org/resources/sap-ui-core.js';
};
```

### 2. Környezet nem vált

**Ellenőrizd**:
- URL paraméter helyesen van-e írva (`?env=backend`)
- LocalStorage tartalmát (`localStorage.getItem('ui5_env')`)
- Console log-okat

**Tisztítás**:
```javascript
localStorage.removeItem('ui5_env');
location.reload();
```

### 3. Backend CORS hiba

**Ellenőrizd**:
```bash
curl -I http://192.168.1.10:9000/resources/sap-ui-core.js
```

**Szükséges header**:
```
Access-Control-Allow-Origin: *
```

## Best Practices

### 1. Fejlesztés

- Használj **CDN** módot gyors kezdéshez
- Használj **local** módot offline fejlesztéshez
- Használj **backend** módot csapat környezetben

### 2. Production

- Backend mód ajánlott belső hálózaton
- CDN mód publikus alkalmazásokhoz
- Mindig legyen fallback CDN-re

### 3. Verziókezelés

- Local módban verzionáld az OpenUI5 csomagokat
- Backend módban központilag kezelj verziókat
- CDN módban követd az OpenUI5 release-eket

## Továbbfejlesztési Lehetőségek

### 1. UI Selector

Grafikus környezet váltó a UI-on:

```html
<select id="env-selector" onchange="switchEnv(this.value)">
    <option value="cdn">CDN</option>
    <option value="local">Local</option>
    <option value="backend">Backend</option>
</select>
```

### 2. Verzió Információ

UI5 verzió megjelenítése:

```javascript
sap.ui.getCore().attachInit(function() {
    var version = sap.ui.version;
    console.log('UI5 Version:', version);
});
```

### 3. Performance Monitoring

Betöltési idő mérése:

```javascript
var start = performance.now();
script.onload = function() {
    var duration = performance.now() - start;
    console.log('UI5 loaded in:', duration, 'ms');
};
```

### 4. Automatikus Fallback

Ha backend nem elérhető, automatikus fallback CDN-re:

```javascript
script.onerror = function() {
    console.warn('Backend failed, falling back to CDN');
    loadUI5FromCDN();
};
```

## Támogatás

- UI5 Verzió: 1.120.0+
- Böngészők: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- Node.js: 16+

## Referenciák

- [OpenUI5 Documentation](https://sdk.openui5.org/)
- [SAP UI5 Tooling](https://sap.github.io/ui5-tooling/)
- [UI5 Best Practices](https://sdk.openui5.org/topic/28fcd55b04654977b63dacbee0552712)
