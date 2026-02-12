# Virtual Theme Manager - WMS Integrációs Útmutató

Ez az útmutató leírja, hogyan kell integrálni a futásidejű (on-the-fly) virtuális témaváltást egy meglévő WMS SAPUI5/TypeScript projektbe. A témaváltás **kizárólag kódból** történik – eseményvezérelten, hibák és figyelmeztetések vizuális jelzésére.

---

## Koncepció: Miért "virtuális" témák?

Az UI5 beépített `Theming.setTheme()` API-ja csak valódi, előre buildelt témákat tud váltani
(pl. `sap_horizon` ↔ `sap_horizon_dark`). Ez viszonylag kevés variációt kínál.

A **virtuális téma** megközelítés erre épít, de kibővíti: egy valódi alap témát kombinál
**CSS custom property patch-ekkel**. A modern SAP témák (Horizon, Fiori 3) CSS változókat
használnak a színekhez (`--sapBrandColor`, `--sapBackgroundColor`, stb.), és ezek futásidőben
felülírhatók a `document.documentElement.style.setProperty()` hívással.

Így egyetlen alap témából tetszőleges számú vizuális variánst hozhatunk létre build lépés nélkül:
- **Normal**: tiszta `sap_horizon`, patch nélkül
- **Warning**: `sap_horizon` + sárga/narancs háttér (figyelmeztető állapot)
- **Alarm**: `sap_horizon_dark` + piros háttér (kritikus riasztás)

A téma NEM perzisztálódik – oldal újratöltéskor visszaáll `normal`-ra. Ez szándékos, mert a
témaváltás eseményvezérelt figyelmeztetésre szolgál, nem felhasználói preferencia.

---

## Előfeltételek

- SAPUI5/OpenUI5 1.105+ (szükséges a `sap/ui/core/Theming` API-hoz)
- TypeScript alapú UI5 projekt
- `sap_horizon` és `sap_horizon_dark` témák elérhetők (ui5-local.yaml-ban `themelib_sap_horizon`)

---

## 1. VirtualThemeManager.ts bemásolása

**Forrás:** `wms-integration/m/VirtualThemeManager.ts`
**Cél:** `webapp/m/VirtualThemeManager.ts`

Singleton modul, amely tartalmazza:
- A virtuális téma registry-t (6 előre definiált téma)
- A témaváltás logikát (`switchTheme`)
- CSS custom property patching-et
- `Theming.attachApplied` event kezelést az aszinkron base téma váltáshoz
- Nincs localStorage/persistencia – a téma csak a session alatt él

### Testreszabás

A `THEMES` objektumban módosíthatod a meglévő témákat vagy újakat adhatsz hozzá.
Futásidőben is regisztrálhatsz új témát:
```typescript
VirtualThemeManager.register("custom_theme", {
    base: "sap_horizon",
    label: "Custom Theme",
    patch: { "--sapBrandColor": "#ff5722" }
});
```

---

## 2. Component.ts módosítása

### 2.1 Import hozzáadása

```typescript
import VirtualThemeManager from "./m/VirtualThemeManager";
```

### 2.2 init() metódus bővítése

A `getDeviceSettings()` hívás után, az `initCompany()` elé:

```typescript
this.getDeviceSettings();

VirtualThemeManager.getInstance().applyDefault();  // <-- ÚJ SOR

this.initCompany().then( oUser => {
```

### 2.3 Publikus API metódus (opcionális)

```typescript
public getVirtualThemeManager(): VirtualThemeManager {
    return VirtualThemeManager.getInstance();
}
```

---

## 3. Használat bármely controllerből

A témaváltás kódból, eseményvezérelten történik. Tipikus használati esetek:

### Hiba / figyelmeztetés jelzése

```typescript
import VirtualThemeManager from "../m/VirtualThemeManager";

// Kritikus hiba → alarm téma (piros)
VirtualThemeManager.getInstance().switchTheme("alarm");

// Figyelmeztetés → warning téma (sárga)
VirtualThemeManager.getInstance().switchTheme("warning");

// Visszaállítás normálra
VirtualThemeManager.getInstance().switchTheme("normal");
```

### WebSocket esemény alapján

A `Component.ts` `onWebSocketMessage` metódusában:

```typescript
private onWebSocketMessage(oWebsocketEvent: Event) {
    try {
        let oMessage = JSON.parse(oWebsocketEvent.getParameter('data')) as WebSocketMessage;

        // Témaváltás WebSocket üzenet alapján
        if (oMessage.command === "THEME_CHANGE" && oMessage.data?.themeKey) {
            VirtualThemeManager.getInstance().switchTheme(oMessage.data.themeKey);
        }

        PickListDetails.WebSocketHandler(this, oMessage);
    }
    catch (err: any) {
        Log.error("WebSocket Message Error", err.message, "WMS");
    }
}
```

### Üzleti logika alapján (pl. catch blokkban)

```typescript
try {
    await this.processCriticalOperation();
} catch (err: any) {
    VirtualThemeManager.getInstance().switchTheme("alarm");
    MessageBox.error(err.message, {
        onClose: () => {
            VirtualThemeManager.getInstance().switchTheme("normal");
        }
    });
}
```

---

## Használható CSS változók

| CSS változó | Leírás |
|-------------|--------|
| `--sapBrandColor` | Fő brand szín |
| `--sapBackgroundColor` | Általános háttér |
| `--sapShell_Background` | Shell fejléc háttér |
| `--sapPageHeader_Background` | Oldal fejléc háttér |
| `--sapTile_Background` | Csempe háttér |
| `--sapList_Background` | Lista háttér |
| `--sapButton_Background` | Gomb háttér |
| `--sapButton_Emphasized_Background` | Kiemelt gomb háttér |
| `--sapButton_Reject_Background` | Elutasító gomb háttér |
| `--sapErrorColor` | Hiba szín |
| `--sapContent_LabelColor` | Label szöveg szín |

---

## Fájlok összefoglalása

| Fájl | Művelet | Leírás |
|------|---------|--------|
| `webapp/m/VirtualThemeManager.ts` | **ÚJ** | Singleton téma manager modul |
| `webapp/Component.ts` | **MÓDOSÍTÁS** | +1 import, +1 sor az init()-ben, +1 getter metódus |

A Settings.view.xml és Settings.controller.ts **NEM módosul** – nincs felhasználói UI a témaváltáshoz.

---

## Működési elv

1. Az app indulásakor a `Component.init()` hívja a `VirtualThemeManager.applyDefault()` metódust
2. Ez inicializálja a singleton-t és beállítja a `normal` témát
3. Ezután események (WebSocket, hibakezelés, üzleti logika) hívják a `switchTheme()` metódust
4. A `switchTheme()` metódus:
   - Eltávolítja a korábbi CSS patch-et
   - Ha az alap téma változik: `Theming.setTheme()` + patch várakoztatás
   - Ha az alap téma nem változik: patch azonnali alkalmazása
5. A `Theming.attachApplied` callback alkalmazza a függőben lévő patch-et
6. Oldal újratöltéskor mindig `normal`-ra indul
