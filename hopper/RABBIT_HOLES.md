# 🐇 Rabbit Holes - Fejlesztési Zsákutcák és Tanulságok

**Projekt**: UI5 Splash Screen POC
**Cél**: Dokumentálja azokat a fejlesztési döntéseket, zsákutcákat és megoldásokat, amelyekbe a projekt során belefutottunk.

---

## 1. URL Paraméter vs Build-Time Environment Injection

### A Probléma
Az eredeti megközelítés (v1.0-v2.0) URL paraméterrel (`?env=cdn`, `?env=backend`) kezelte a környezeti konfigurációt. Ez azt jelentette, hogy:
- Minden oldalbetöltéskor parseolni kellett az URL-t
- A felhasználó könnyen elírhatta a paramétert
- Több belépési pont (több HTML fájl) kellett különböző módokhoz
- A böngésző cache nem volt megbízható, mert ugyanaz az URL más paramétert kaphatott

### A Zsákutca
Eleinte több HTML fájl létezett párhuzamosan:
- `index.html` - CDN-only, hardcoded
- `index-configurable.html` - URL paraméter alapú
- `index-minimal.html` - Minimális példa
- `index-demo.html` - Demo CSS animációval

Ez karbantarthatatlanná vált: minden változtatást több fájlban kellett szinkronizálni.

### A Megoldás (v3.0 - Build-Time Injection)
A `build.js` script megoldotta a problémát:

```
index.template.html  -->  build.js [env]  -->  index.html
     {{ENV_INJECTION}}                        <script>window.UI5_ENVIRONMENT = 'cdn';</script>
```

**Hogyan működik**:
1. Az `index.template.html` tartalmaz egy `{{ENV_INJECTION}}` placeholder-t
2. A `build.js` CLI argumentumból vagy `UI5_ENV` env variable-ból olvassa a környezetet
3. Beírja a `<script>window.UI5_ENVIRONMENT = 'cdn';</script>` sort az `index.html`-be
4. A `config.js` futásidőben kiolvassa a `window.UI5_ENVIRONMENT` értéket
5. A `ui5-bootstrap.js` ennek alapján injektálja a megfelelő UI5 bootstrap `<script>` taget

**NPM scriptek összekapcsolása**:
```json
"start:cdn": "node build.js cdn && http-server -p 8300 --cors -o"
"start:local": "node build.js local && npx ui5 serve --port 8300 --open"
```

A `&&` operátor biztosítja, hogy először a build lefut (environment injection), és csak utána indul a szerver.

**Eredmény**: Egyetlen URL (`http://localhost:8300/`), egyetlen `index.html`, a környezet fix a szerver indításakor.

### Tanulság
> Build-time konfiguráció egyszerűbb és megbízhatóbb, mint runtime URL paraméterek. A régi fájlokat a `legacy/` mappába archiváltuk, nem töröltük.

---

## 2. Több HTML Fájl Szindróma

### A Probléma
Ahogy a projekt fejlődött, minden új ötlethez új HTML fájl készült:
- `index.html` (eredeti CDN)
- `index-configurable.html` (env választó)
- `index-minimal.html` (lecsupaszított teszt)
- `index-demo.html` (CSS splash demo)

### Miért Volt Zsákutca?
- Egy CSS változtatást 4 helyen kellett megcsinálni
- A splash screen logika duplikálódott
- Nem volt egyértelmű, melyik a "főoldal"
- A tesztelés bonyolulttá vált (melyik HTML-t nézem?)

### A Megoldás
1. **v2.0**: Splash screen kód kiszervezése külső fájlokba (`splash-screen.css`, `splash-screen.js`, `ui5-bootstrap.js`)
2. **v3.0**: Egyetlen `index.html` + `index.template.html` mint forrás, régi fájlok -> `legacy/`

### Tanulság
> Ne hozz létre új HTML fájlt minden variációhoz. Inkább a logikát tedd konfigurálhatóvá egyetlen belépési ponttal.

---

## 3. A `window.UI5_ENVIRONMENT` Globális Változó Minta

### Miért Nem Sima Config Import?
A UI5 bootstrap speciális: a `<script>` tag `data-sap-ui-*` attribútumaival konfigurálódik, és a DOM-ba kell injektálni **mielőtt** bármi más UI5-ös kód futna. Ezért:

1. A környezet értéke **szinkron** kell legyen (nem async module import)
2. A `config.js` is szinkron `<script>` tag-ként töltődik
3. A `window.UI5_ENVIRONMENT` globális változó a legegyszerűbb módja, hogy a build-time injektált érték elérhető legyen a többi script számára

### A Lánc
```
index.html
  ├── <script>window.UI5_ENVIRONMENT = 'cdn';</script>   ← build.js injektálja
  ├── <script src="config.js"></script>                    ← getCurrentEnv() olvassa
  ├── <script src="ui5-bootstrap.js"></script>             ← getUI5BootstrapUrl() alapján injektál
  └── <script src="splash-screen.js"></script>             ← splash logika
```

### Tanulság
> UI5 bootstrap esetén a szinkron, globális változó minta teljesen valid, mert a bootstrap script injection a DOM-szintű, nem ES module-szintű feladat.

---

## 4. A `config.js` Module Export Trükk

### A Probléma
A `config.js`-t két kontextusban is használni kell:
1. **Böngészőben**: globális script, `window` scope
2. **Node.js-ben**: a `build.js` importálhatná a konfigurációt

### A Megoldás
```javascript
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UI5_CONFIGS, getCurrentEnv, getUI5BootstrapUrl };
}
```

Ez a minta lehetővé teszi, hogy ugyanaz a fájl böngészőben globális scriptként, Node.js-ben pedig CommonJS modulként működjön.

### Tanulság
> Az `typeof module !== 'undefined'` check az isomorphic JavaScript klasszikus mintája - régi trükk, de UI5 kontextusban is hasznos.

---

## 5. Legacy Fájlok Kezelése

### A Döntés
A régi HTML fájlokat nem töröltük, hanem a `legacy/` mappába költöztettük:
```
legacy/
  ├── index-configurable.html
  ├── index-minimal.html
  ├── index-demo.html
  └── index.html (eredeti)
```

### Miért Nem Törlés?
- Referencia értékük van (hogyan működött régen)
- Ha valakinek kell az URL paraméter alapú megoldás, megtalálja
- A git history-ban amúgy is benne lennének, de a `legacy/` mappa explicitebb

### Tanulság
> Archív mappa (`legacy/`) > törlés, ha a fájlok referencia értékűek. De a `.gitignore`-ban ne felejtsd el ignorálni, ha nem akarod, hogy a repóba kerüljenek (ebben a projektben bekerülnek).

---

## Összefoglaló Időrend

| Verzió | Megközelítés | Probléma |
|--------|-------------|----------|
| v1.0 | Hardcoded CDN `index.html` | Nem konfigurálható |
| v1.x | Több HTML fájl, mindegyik más környezethez | Duplikáció, karbantarthatatlan |
| v2.0 | Külső CSS/JS modulok + `index-configurable.html` URL paraméterrel | Jobb, de még mindig URL-függő |
| **v3.0** | **`build.js` + template + egyetlen `index.html`** | **Jelenlegi - tiszta, egyszerű** |

---

**Frissítve**: 2026-02-15
