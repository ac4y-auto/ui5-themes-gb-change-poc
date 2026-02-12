# UI5 Virtual Theme Switching - POC

Runtime témaváltás OpenUI5 alkalmazásokban CSS custom property patching-gel.

## Verzió kompatibilitás

- **OpenUI5**: 1.105.0+
- **SAPUI5**: 1.105.0+

A projekt jelenleg **OpenUI5 1.105.0** verziót használ (lásd `ui5.yaml`).

## Gyors start

```bash
npm start
```

Az alkalmazás elérhető: http://localhost:8100/index.html

## Funkciók

- ✅ Runtime témaváltás build lépés nélkül
- ✅ CSS custom property alapú patching
- ✅ 6 előre definiált virtuális téma
- ✅ Eseményvezérelt témaváltás (WebSocket, időzített, manuális)
- ✅ Bázis téma kombinálás patch-ekkel

## Virtuális témák

| Téma | Bázis | CSS Patch | Használat |
|------|-------|-----------|-----------|
| Normal | sap_horizon | Nincs | Alap üzemmód |
| Normal – Branded | sap_horizon | Zöld brand | Testreszabott márka |
| Warning | sap_horizon | Sárga/narancs | Figyelmeztetés |
| Alarm (Critical) | sap_horizon_dark | Piros | Kritikus riasztás |
| Night Shift (Dark) | sap_horizon_dark | Nincs | Éjszakai műszak |
| Night Shift – Extra Dim | sap_horizon_dark | Extra sötét | Minimális fény |

## Dokumentáció

- **[VIRTUAL-THEME-GUIDE.md](VIRTUAL-THEME-GUIDE.md)** - Általános integrációs útmutató (JS projektek)
- **[wms-integration/INTEGRATION-GUIDE.md](wms-integration/INTEGRATION-GUIDE.md)** - WMS-specifikus TypeScript integráció

## Architektúra

A témaváltás két lépésből áll:

1. **Bázis téma betöltése**: `sap.ui.core.Theming.setTheme(baseThemeId)`
2. **CSS patch alkalmazása**: `document.documentElement.style.setProperty(cssVar, value)`

A CSS patch magasabb specificitású, mint a téma CSS változók, így azonnal felülírja őket.

## Telepítés

Nincs npm dependency - a projekt a CDN-ről tölti az OpenUI5-öt:

```html
<script src="https://sdk.openui5.org/resources/sap-ui-core.js"></script>
```

## Build

```bash
npm run build
```

A build kimenet a `dist/` mappába kerül.

## Licenc

MIT
