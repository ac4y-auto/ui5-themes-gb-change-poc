# RUNBOOK - UI5 Virtual Theme Switching POC

**Projekt**: UI5 Virtual Theme Switching POC (with Splash Screen)
**Port**: 8300
**Létrehozva**: 2026-02-12
**Frissítve**: 2026-02-15

---

## 🎯 KRITIKUS SZABÁLYOK

### 0. **Kezelési Attitűd & Session Debrief** 📋

**MINDEN session végén kötelező DEBRIEF írása!**

#### Session Debrief Célja

A debrief dokumentum célja, hogy **rögzítse** a következőket:
- ✅ Mi készült el (funkciók, fájlok, javítások)
- ✅ Milyen problémák merültek fel (bugs, technikai akadályok)
- ✅ Milyen döntések születtek (jó vs rossz döntések)
- ✅ Milyen tanulságok vonhatók le (technikai, workflow)
- ✅ Mi a következő lépés (TODO lista következő session-hez)

#### Debrief Helye

```
hopper/DEBRIEF_v{VERSION}.md
```

**Példa**:
- `hopper/DEBRIEF_v3.1.md` - v3.1 session debrief
- `hopper/DEBRIEF_v3.2.md` - v3.2 session debrief

#### Debrief Struktúra (Template)

```markdown
# 📝 DEBRIEF - Session v{VERSION}

**Dátum**: YYYY-MM-DD
**Verzió**: X.Y.Z
**Session hossz**: ~X óra
**Főbb fejlesztések**: Feature 1, Feature 2

---

## 🎯 Session Célkitűzések
- [ ] Cél 1
- [ ] Cél 2

## 🚀 Elkészült Funkciók
### 1. Feature Name
- **Probléma**: ...
- **Megoldás**: ...
- **Előnyök**: ...
- **Hátrányok**: ...

## 🐛 Felderített Problémák & Megoldások
### 1. Bug Name
- **Tünet**: ...
- **Gyökér ok**: ...
- **Fix**: ...

## 💡 Jó Döntések
### 1. Döntés
- **Indoklás**: ...
- **Visszajelzés**: ...

## ❌ Rossz Döntések
### 1. Döntés
- **Probléma**: ...
- **Tanulság**: ...

## 🎓 Tanulságok
- Technikai tanulságok
- Workflow tanulságok

## 🔮 Továbbfejlesztési Ötletek
- Rövid távú
- Középtávú
- Hosszú távú

## 🎯 Következő Session Fókusz
- Must Have
- Nice to Have
```

#### Mikor Írj Debrief-et?

**Session vége előtt 15-30 perccel!**

- ✅ Minden feature elkészült után
- ✅ Minden commit előtt
- ✅ Session lezárás előtt
- ✅ Context váltás előtt (ha más projektre ugranál)

#### Debrief Best Practices

1. **Őszinteség**: Rossz döntések is benne vannak!
2. **Részletesség**: Code snippet-ek, hibakeresési lépések
3. **Tanulságok**: Mit csinálnál másképp legközelebb?
4. **Linkek**: Kapcsolódó dokumentumok cross-reference
5. **Metrikák**: LOC, fájlok száma, session hossz

#### Debrief Használata

**Következő session-nél**:
1. Olvasd el az előző debrief-et
2. Nézd meg a "Következő Session Fókusz" részt
3. Folytasd ott, ahol abbahagytad

**Code review-nál**:
- Rossz döntések review fókuszpontok
- Tanulságok alapján refactor

**Onboarding-nál**:
- Új fejlesztők látják a decision-making folyamatot
- Tanulságok átadása

---

### Kezelési Attitűd Szabályok

**Claude munkastílus a projektben:**

1. **Proaktív Tesztelés** 🧪
   - Minden új feature-t böngészőben tesztelj
   - Screenshot-ok, console ellenőrzés
   - Csak működő kódot mutass be a usernek

2. **Dokumentáció Karbantartás** 📚
   - Minden változás → dokumentáció frissítés
   - Cross-reference linkek naprakészen
   - README.md mindig aktuális

3. **Git Workflow** 🔀
   - Csak működő kód commit-olása
   - Descriptive commit messages
   - Tag-elés minden release-nél

4. **Engedélyek Kezelése** 🔐
   - Új Bash parancs → settings.local.json update
   - RUNBOOK.md frissítés
   - Átláthatóság

5. **Debrief Írás** 📝
   - Session vége előtt 15-30 perccel
   - Őszinte visszajelzés (jó + rossz döntések)
   - Következő session fókusz

6. **TODO Tracking** ✅
   - TodoWrite tool használata multi-step taskoknál
   - Status frissítés real-time
   - Cleanup ha stale

---

### 1. **UI5 Library Használat** 🚨

**⚠️ KIZÁRÓLAG SAPUI5 HASZNÁLHATÓ! OpenUI5 TILOS! ⚠️**

- ✅ **SAPUI5** - Hivatalos SAP UI5 library (licencelt, támogatott)
- ❌ **OpenUI5** - **TILOS** használni (nyílt forráskódú, nem támogatott ebben a projektben)

**Helyes CDN URL:**
```javascript
// HELYES - SAPUI5
cdn: {
    name: 'CDN (SAPUI5 Latest)',
    url: 'https://sapui5.hana.ondemand.com/resources/sap-ui-core.js',
    description: 'Uses SAPUI5 latest version from official SAP CDN'
}

// TILOS - OpenUI5
cdn: {
    url: 'https://sdk.openui5.org/resources/sap-ui-core.js'  // NE használd!
}
```

**CDN Fallback opciók (ha az elsődleges nem elérhető):**
- **Elsődleges:** `https://sapui5.hana.ondemand.com/resources/sap-ui-core.js`
- **Tartalék #1:** `https://ui5.sap.com/1.105.0/resources/sap-ui-core.js`
- **Tartalék #2 (helyi):** `http://192.168.1.10:9000/resources/sap-ui-core.js`

**Ismert CDN problémák:**
- SAP CDN időnként 503 hibát ad (Service Unavailable)
- Helyi szerver (192.168.1.10:9000) nem mindig elérhető
- Megoldás: CDN fallback-et próbálj, vagy local módot

**Ellenőrzési parancsok:**
```bash
# config.js ellenőrzés (SAPUI5-nek kell lennie)
grep "sapui5.hana.ondemand.com" webapp/config.js

# OpenUI5 ellenőrzés (ÜRESNEK kell lennie!)
grep -i "openui5" webapp/config.js
```

**Ha OpenUI5-öt találsz:**
1. AZONNAL javítsd a `config.js`-t SAPUI5-re
2. Futtasd: `node build.js cdn`
3. Indítsd újra a szervert

### 1. **Tesztelési Protokoll** ⚠️

**MINDIG Claude tesztel először böngészőben, CSAK UTÁNA szól a usernek!**

#### Lépések:
1. ✅ Claude megnyitja a böngészőt
2. ✅ Claude navigál a megfelelő URL-re
3. ✅ Claude ellenőrzi a funkciót (screenshot, console, network)
4. ✅ Claude elemzi az eredményt
5. ✅ **CSAK EZUTÁN** szól a usernek, hogy nézzen rá

#### Miért?
- User időt spórol
- Claude előre észleli a problémákat
- Csak működő funkciókat mutatunk be

### 2. **Engedélyek Kezelése** 🔐

**Minden új Bash parancs előtt ellenőrizd a `.claude/settings.local.json` fájlt!**

#### Lépések:
1. ✅ Ha a parancs NEM szerepel a `permissions.allow` listában:
   - Futtasd a parancsot (user jóváhagyja)
   - Azonnal add hozzá a `.claude/settings.local.json`-hoz
   - Frissítsd a RUNBOOK.md-t az új paranccsal
2. ✅ Ha a parancs szerepel:
   - Futtasd normálisan (nincs engedélykérés)

#### Példa settings.local.json bejegyzés:
```json
{
  "permissions": {
    "allow": [
      "Bash(node build.js:*)",
      "Bash(npm start)",
      "Bash(mkdir:*)",
      "Bash(mv:*)"
    ]
  }
}
```

---

## 🚀 Szerver Működés

### Aktív Szerver
- **Port**: 8300
- **URL**: http://localhost:8300
- **Főoldal**: http://localhost:8300/ (egyetlen index.html)

### Szerver Indítás (Build-based + Smart Start)

**Az üzemmód a szerver indításakor fix, nem URL paraméter!**

```bash
# CDN mód (alapértelmezett) - Smart Start-tal (port kezelés)
npm start
# vagy
npm run smart-start:cdn

# Local mód
npm run start:local

# Backend mód
npm run start:backend

# Hybrid mód (reverse proxy .env-ből)
npm run start:hybrid
```

**Smart Start:** Automatikus port kezelés - ha a port foglalt és a mi projektünk használja, leállítja és újraindítja. Ha más projekt foglalja, figyelmeztet.

**Hogyan működik?**
1. `node build.js [env]` - Beinjektálja a `window.UI5_ENVIRONMENT` változót a webapp/index.html-be
2. Elindítja a megfelelő szervert (http-server vagy UI5 CLI)
3. Megnyitja a böngészőt az `http://localhost:8300/` URL-en

**Nincs szükség URL paraméterre!** (`?env=cdn` NEM kell többé)

### Szerver Leállítás
```bash
# Port használat ellenőrzése
netstat -ano | findstr :8300

# Process leállítása (PID-t helyettesítsd)
cmd //c "taskkill /PID [PID] /F"
```

### Háttérben Futó Task Ellenőrzése
Ha a szerver task ID-vel fut (pl. b079a0d), akkor a TaskOutput tool-lal ellenőrizhető.

---

## 🌍 Environment Módok

**Új (v3.0)**: Egyetlen URL minden módhoz!

### Minden Mód:
```
http://localhost:8300/
```

### Legacy URL-ek (archív):
A `legacy/` mappában találhatók a régi URL paraméter alapú verziók:
- `http://localhost:8300/legacy/index-configurable.html?env=cdn`
- `http://localhost:8300/legacy/index-configurable.html?env=backend`
- `http://localhost:8300/legacy/index-configurable.html?env=local`

---

## 🧪 Tesztelési Checklist

### Minden Változtatás Után:

1. **Fájl mentés** - Ensure file is saved
2. **Browser tesztelés Claude által**:
   - [ ] Screenshot készítés
   - [ ] Console log ellenőrzés
   - [ ] Network requests ellenőrzés
   - [ ] Funkció validálás
3. **User értesítés** - "Kész, nézd meg te is!"

### Splash Screen Specifikus:
- [ ] Videó betöltődik
- [ ] Poster megjelenik
- [ ] Autoplay működik
- [ ] Fade-out animáció smooth
- [ ] UI5 app betöltődik utána
- [ ] Environment badge látható

### Virtual Theme Specifikus:
- [ ] Virtual Theme dropdown megjelenik
- [ ] Normal téma (Horizon Light) betöltődik
- [ ] Warning téma sárga/narancs háttérrel jelenik meg
- [ ] Alarm téma piros/sötét háttérrel jelenik meg
- [ ] Night Shift (sap_horizon_dark) betöltődik
- [ ] Témaváltás simán megy (nincs villogás)
- [ ] CSS patch alkalmazás/törlés helyesen működik
- [ ] Simulate gombok működnek (Normal, Warning, Alarm, Night Shift)

### Böngésző Indítás Tippek
```bash
# Inkognito mód (cache és extension nélkül) - hasznos ha cache problémák vannak
# macOS:
open -na "Google Chrome" --args --incognito "http://localhost:8300/"
# Windows:
start chrome --incognito "http://localhost:8300/"
```

---

## 📝 Git Workflow

### Minden Commit Előtt:
```bash
git status
```

### Commit Üzenet Formátum:
```
type: Short description

- Detailed change 1
- Detailed change 2

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Types:
- `feat:` - Új funkció
- `fix:` - Bugfix
- `docs:` - Dokumentáció
- `refactor:` - Refaktorálás
- `test:` - Tesztek
- `chore:` - Karbantartás

### Push
```bash
git push origin main
```

---

## 🔧 Gyakori Műveletek

### Config.js Módosítás
Backend URL változtatás:
```javascript
backend: {
    url: 'http://YOUR_IP:PORT/resources/sap-ui-core.js'
}
```

### Splash Screen Időzítés
`index-configurable.html`:
```javascript
}, 500); // <- ms delay
```

### Videó Sebesség
```javascript
video.playbackRate = 0.2; // 0.2 = 5x lassabb
```

---

## 🐛 Hibaelhárítás

### Port Foglalt Hiba
```bash
# Ellenőrizd mi használja a portot
netstat -ano | findstr :8300

# Állítsd le a folyamatot
cmd //c "taskkill /PID [PID] /F"
```

### Backend Nem Elérhető
- Normális ha 192.168.1.10:9000 offline
- Fallback: Használd CDN mode-ot

### i18n 404 Errorok
- Nem kritikus
- i18n fájlok opcionálisak

### UI5 Nem Tölt Be
1. Ellenőrizd Network tab-ot
2. Ellenőrizd Console error-okat
3. Próbáld CDN mode-ot
4. Clear cache + hard reload (Ctrl+Shift+R)

---

## 📊 Monitoring

### Browser DevTools
- **Console**: Hibaüzenetek, logok
- **Network**: Resource betöltés, timing
- **Application**: LocalStorage értékek

### Ellenőrizendő:
- UI5 bootstrap script betöltődik
- Splash video letöltődik (908KB)
- Poster image betöltődik (25KB)
- Environment badge helyesen jelenik meg
- Nincs CORS error

---

## 📞 Gyors Referencia

### Dokumentációk
- **README.md** - Projekt áttekintés
- **[wms-integration/INTEGRATION-GUIDE.md](../wms-integration/INTEGRATION-GUIDE.md)** - Integrációs útmutató (TypeScript, WMS)
- **HYBRID_MODE_GUIDE.md** - Hybrid mód (reverse proxy) útmutató
- **JUST-RUN-IT.md** - Gyors indítási referencia
- **KONZEPCIÓ.md** - Architektúra
- **FEJLESZTOI_UTASITAS.md** - Splash screen integráció
- **SMART_START_GUIDE.md** - Smart Start dokumentáció

### GitHub
- **User**: ac4y-auto
- **Branch**: main

### Eszközök
- Node.js: v20.20.0
- Git: Telepítve
- GitHub CLI: Bejelentkezve (ac4y)

---

## ✅ Session Start Checklist

1. [ ] Ellenőrizd git status
2. [ ] Ellenőrizd szerver fut-e (port 8300)
3. [ ] Ha nem fut, indítsd: `npm start`
4. [ ] Nyisd meg böngészőben: http://localhost:8300/index-configurable.html
5. [ ] **Claude tesztel először**
6. [ ] Git pull ha kell: `git pull origin main`

---

## ✅ Session End Checklist

1. [ ] Minden változtatás commit-olva
2. [ ] Push GitHub-ra
3. [ ] SESSION_HANDOFF.md frissítve
4. [ ] Szerver leállítható (vagy futhat)

---

**Frissítve**: 2026-02-15
**Verzió**: 2.0 (splash screen + smart start átvétel a splash-screen-poc-ból)
