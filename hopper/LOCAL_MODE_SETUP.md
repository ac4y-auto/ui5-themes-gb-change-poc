# 🔧 LOCAL MODE SETUP - OpenUI5 SDK Telepítés

**Probléma**: Az NPM `@openui5` package-ek **forrás formátumban** vannak, nem működnek közvetlenül!

**Megoldás**: OpenUI5 SDK letöltése és használata

---

## ⚠️ MIÉRT NEM MŰKÖDIK AZ NPM PACKAGE?

### NPM Package Struktúra:
```
node_modules/@openui5/sap.ui.core/
├── src/                           # Forrás fájlok
│   ├── sap-ui-core.js            # Launcher script
│   └── sap/                       # Source modulok
├── package.json
└── ui5.yaml                       # Build konfiguráció
```

### Probléma:
- ❌ `src/sap-ui-core.js` launcher, ami `resources/` mappát vár
- ❌ Nincs `resources/` mappa (csak `src/`)
- ❌ Build process szükséges (UI5 Tooling)
- ❌ Komplex setup

---

## ✅ MEGOLDÁS: OpenUI5 SDK Letöltés

### 1. SDK Letöltés

**URL**: https://sdk.openui5.org/downloads

**Lépések**:
1. Nyisd meg: https://sdk.openui5.org/downloads
2. Válassd: **OpenUI5 Runtime**
3. Verzió: **1.105.x** vagy **Latest**
4. Formátum: **ZIP**
5. Letöltés: `openui5-runtime-X.XX.X.zip`

### 2. Kicsomagolás

```bash
# Projekt root-ba kicsomagolás
cd C:\work\ui5\ui5-splash-screen-poc

# Létrehozd az openui5-sdk mappát
mkdir openui5-sdk

# Csomagold ki a ZIP-et az openui5-sdk mappába
# (Explorer-ben vagy unzip paranccsal)
```

**Eredmény struktúra**:
```
C:\work\ui5\ui5-splash-screen-poc\
├── openui5-sdk/
│   ├── resources/              # ⭐ Ezt használjuk!
│   │   ├── sap-ui-core.js     # UI5 bootstrap
│   │   └── sap/               # UI5 modulok
│   ├── test-resources/
│   └── LICENSE.txt
├── config.js
├── index-configurable.html
└── ...
```

### 3. Konfiguráció Ellenőrzés

**config.js** (már frissítve):
```javascript
local: {
    name: 'Local (OpenUI5 SDK)',
    url: './openui5-sdk/resources/sap-ui-core.js',
    description: 'Uses locally downloaded OpenUI5 SDK'
}
```

### 4. .gitignore Frissítés

**Hozzáadandó**:
```
# OpenUI5 SDK (nagy méret, ne commitold)
openui5-sdk/
```

---

## 🧪 TESZTELÉS

### 1. Szerver Indítás
```bash
npm start
```

### 2. Local Mode URL
```
http://localhost:8300/index-configurable.html?env=local
```

### 3. Ellenőrzés (F12 → Console)
```
UI5 Environment: Local (OpenUI5 SDK)
UI5 Bootstrap URL: ./openui5-sdk/resources/sap-ui-core.js
```

### 4. Sikeres Betöltés Jelei
- ✅ Splash screen megjelenik
- ✅ Environment badge: "UI5 ENV: Local (OpenUI5 SDK)"
- ✅ UI5 Core inicializálódik
- ✅ App View betöltődik
- ✅ Nincs 404 error a console-ban

---

## 📊 SDK VERZIÓK

### Ajánlott Verziók:

| Verzió | Méret | Státusz | Kompatibilitás |
|--------|-------|---------|----------------|
| **1.105.x** | ~80MB | Stable | ⭐ Projekt használja |
| **1.120.x** | ~85MB | Stable | ✅ Újabb |
| **Latest** | ~90MB | Latest | ⚠️ Tesztelés kell |

**Javasolt**: **1.105.x** (manifest.json szerint)

---

## 🔧 ALTERNATÍV MEGOLDÁSOK

### Opció A: UI5 Tooling Build (komplex)

```bash
# UI5 CLI telepítés
npm install --save-dev @ui5/cli

# Build futtatás
ui5 build --all

# Eredmény: dist/ mappa built fájlokkal
```

**Hátrány**: Komplex setup, lassú build

---

### Opció B: CDN Cache (hybrid)

**Ötlet**: CDN-ről cache-elés offline használatra
```javascript
// Service Worker cache strategy
// Nem implementált ebben a POC-ban
```

---

### Opció C: SAPUI5 SDK (fizetős license)

Ha SAP licensze van:
- SAPUI5 SDK letöltés SAP portálról
- Több komponens, testreszabhatóbb

---

## 📝 GYORS ÖSSZEFOGLALÓ

### NPM Package ❌
```bash
npm install @openui5/sap.ui.core  # Forrás fájlok (src/)
# ❌ Nem működik közvetlenül!
```

### OpenUI5 SDK ✅
```bash
# 1. Letöltés: https://sdk.openui5.org/downloads
# 2. Kicsomagolás: ./openui5-sdk/
# 3. URL: ./openui5-sdk/resources/sap-ui-core.js
# ✅ Működik!
```

---

## 🐛 HIBAELHÁRÍTÁS

### "Failed to load UI5 from local"
**Ok**: SDK nincs letöltve
**Megoldás**: Kövesd a fenti lépéseket

### "404 on sap-ui-core.js"
**Ok**: Rossz path vagy hiányzó SDK
**Ellenőrzés**:
```bash
ls openui5-sdk/resources/sap-ui-core.js
# Létezik? Ha nem, nincs SDK!
```

### "Modules not found"
**Ok**: SDK nem teljes vagy sérült
**Megoldás**: Újra letöltés + kicsomagolás

---

## 📦 SDK MÉRET OPTIMALIZÁLÁS

### Teljes SDK (~80-90MB)
- Minden komponens
- Dokumentáció
- Test resources

### Minimális Setup (javasolt production-höz)
```
openui5-sdk/
└── resources/           # Csak ezt másold!
    ├── sap-ui-core.js
    └── sap/
        ├── m/           # sap.m library
        └── ui/
            └── core/    # sap.ui.core library
```

**Méret**: ~30-40MB (optimalizált)

---

## 🎯 KÖVETKEZŐ LÉPÉSEK

1. ✅ **Poster kép 100%-ra** - Kész
2. ✅ **Integration Plan** - Dokumentálva
3. ⏳ **OpenUI5 SDK letöltés** - User telepíti
4. ⏳ **Local Mode tesztelés** - SDK után
5. ⏳ **WMS projekt beépítés** - Tervezés után

---

**Létrehozva**: 2026-02-12
**Frissítve**: 2026-02-12
**Verzió**: 1.0
**Státusz**: Útmutató kész ✅

**User Action Required**: OpenUI5 SDK letöltés és kicsomagolás!
