# 📌 UI5 VERSION NOTES

**Projekt**: UI5 Splash Screen POC
**Cél verzió**: 1.105.0
**Létrehozva**: 2026-02-12

---

## 🎯 VERZIÓ STRATÉGIA

### Projekt Requirement
- **manifest.json**: `minUI5Version: "1.105.0"`
- **NPM package**: `@openui5/sap.ui.core@1.105.0` (telepítve)

### Három Mód Verzió Kezelése

| Mód | Forrás | Verzió | Miért |
|-----|--------|--------|-------|
| **CDN** | sdk.openui5.org | Latest | 1.105.0 nincs CDN-en |
| **Local** | node_modules | 1.105.0 | NPM package fix verzió |
| **Backend** | 192.168.1.10:9000 | ? | Backend verzió |

---

## ⚠️ CDN VERZIÓ PROBLÉMA

### Mit próbáltunk:
```
❌ https://sdk.openui5.org/1.105.0/resources/sap-ui-core.js (404)
❌ https://openui5.hana.ondemand.com/1.105.0/resources/sap-ui-core.js (404)
❌ https://sapui5.hana.ondemand.com/1.105.0/resources/sap-ui-core.js (404)
```

### Mi működik:
```
✅ https://sdk.openui5.org/resources/sap-ui-core.js (Latest)
✅ https://sapui5.hana.ondemand.com/1.120.0/resources/sap-ui-core.js (1.120.0)
```

### Következtetés:
**Az 1.105.0 verzió NINCS elérhető CDN-en!** Túl régi verzió, a CDN-ek már nem szolgálják.

---

## 🔧 MEGOLDÁS: Három Mód Részletei

### 1. CDN Mode (Latest)
```javascript
cdn: {
    name: 'CDN (OpenUI5 Latest)',
    url: 'https://sdk.openui5.org/resources/sap-ui-core.js',
    description: 'Uses latest OpenUI5 from CDN'
}
```

**Előnyök**:
- ✅ Működik azonnal
- ✅ Gyors (CDN cache)
- ✅ Mindig friss

**Hátrányok**:
- ❌ Nincs verzió kontroll
- ❌ Kompatibilitási problémák lehetnek

---

### 2. Local Mode (1.105.0 via UI5 CLI)
```javascript
local: {
    name: 'Local (node_modules)',
    url: './node_modules/@openui5/sap.ui.core/src/sap-ui-core.js',
    description: 'Uses locally installed OpenUI5 from node_modules (UI5 CLI serves built libraries)'
}
```

**NPM Package**:
```bash
npm install --save-dev @openui5/sap.ui.core@1.105.0 @openui5/sap.m@1.105.0
```

**UI5 CLI**:
```bash
npm install --save-dev @ui5/cli
npx ui5 serve --port 8300
```

**FONTOS**:
- NPM package **forrás formátumban** van (`src/`)
- UI5 CLI **automatikusan szolgálja a built library-kat**
- NEM kell külön build!

**Előnyök**:
- ✅ Pontos 1.105.0 verzió
- ✅ Offline működés
- ✅ Fix verzió kontroll

**Hátrányok**:
- ❌ UI5 CLI telepítés szükséges
- ❌ Komplexebb setup

---

### 3. Backend Mode (Custom)
```javascript
backend: {
    name: 'Backend Server',
    url: 'http://192.168.1.10:9000/resources/sap-ui-core.js',
    description: 'Uses UI5 from custom backend server'
}
```

**Státusz**: Jelenleg offline
**Verzió**: Ismeretlen (backend-től függ)

---

## 📦 NPM PACKAGE TELEPÍTÉS

### Jelenlegi telepített verziók:
```json
{
  "devDependencies": {
    "@openui5/sap.ui.core": "1.105.0",
    "@openui5/sap.m": "1.105.0",
    "@openui5/themelib_sap_horizon": "1.105.0",
    "@ui5/cli": "^4.0.43",
    "cross-env": "^7.0.3",
    "http-server": "^14.1.1"
  }
}
```

### Package struktúra:
```
node_modules/@openui5/sap.ui.core/
├── src/                    # Forrás fájlok
│   ├── sap-ui-core.js     # Launcher (resources/ mappát vár!)
│   └── sap/               # Modulok
├── package.json
└── ui5.yaml               # UI5 CLI konfiguráció
```

**⚠️ FIGYELEM**: A `src/sap-ui-core.js` **NEM működik közvetlenül**!
- Ez egy launcher script
- `resources/` mappát vár (ami nincs!)
- UI5 CLI szükséges a built library szolgáláshoz

---

## 🚀 AJÁNLOTT HASZNÁLAT

### Development (verzió kontroll fontos):
```bash
npm run start:local    # Local mode (1.105.0 fix)
```

### Quick testing (verzió nem kritikus):
```bash
npm start              # CDN mode (latest)
```

### Production:
- **Backend mode** (vállalati környezet)
- Vagy **Local mode** built és deploy-olva

---

## 🔄 VERZIÓ UPGRADE TERV

Ha frissíteni kell 1.120.0-ra:

1. **manifest.json frissítés**:
```json
"minUI5Version": "1.120.0"
```

2. **NPM package frissítés**:
```bash
npm uninstall @openui5/sap.ui.core @openui5/sap.m @openui5/themelib_sap_horizon
npm install --save-dev @openui5/sap.ui.core@1.120.0 @openui5/sap.m@1.120.0 @openui5/themelib_sap_horizon@1.120.0
```

3. **CDN mód** (alternatíva):
```javascript
cdn: {
    url: 'https://sapui5.hana.ondemand.com/1.120.0/resources/sap-ui-core.js'
}
```
(SAPUI5 CDN támogatja az 1.120.0-t!)

---

## 📝 TESZTELÉSI JEGYZET

### CDN Mode:
```
http://localhost:8300/index-configurable.html?env=cdn
```
- ✅ Működik (latest verzió)
- Console: Ellenőrizd a betöltött UI5 verziót

### Local Mode:
```
http://localhost:8300/index-configurable.html?env=local
```
- ⚠️ UI5 CLI serve szükséges
- ❌ `npm start` (http-server) NEM működik local mode-hoz!
- ✅ `npx ui5 serve --port 8300` működik

### Backend Mode:
```
http://localhost:8300/index-configurable.html?env=backend
```
- ⏸️ Jelenleg offline (192.168.1.10:9000)

---

## 🎓 TANULSÁGOK

1. **OpenUI5 CDN nem támogatja a régi verziókat** (1.105.0 nincs!)
2. **NPM package-ek forrás formátumban** vannak (UI5 CLI kell!)
3. **SAPUI5 CDN támogatja az 1.120.0+** verziókat
4. **Local mode = UI5 CLI** (nem http-server!)
5. **Poster kép 100%**: `object-fit: cover`

---

**Utolsó frissítés**: 2026-02-12 15:30
**Verzió**: 1.0
**Státusz**: Dokumentált és tesztelve
