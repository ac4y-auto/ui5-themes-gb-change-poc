# Virtual Theme Manager — TL;DR

> Gyors referencia. Teljes verzió: [INTEGRATION-GUIDE.md](INTEGRATION-GUIDE.md)

---

## Mi ez?

Runtime témaváltás SAPUI5-ben, build nélkül. Base theme + CSS variable patch = "virtuális téma".

```
vtm.switchTheme("alarm")   // → piros riasztás
vtm.switchTheme("normal")  // → vissza
```

---

## Témák

| Kulcs | Base | Leírás |
|-------|------|--------|
| `normal` | sap_horizon | Alapértelmezett |
| `normal_branded` | sap_horizon | Zöld branded |
| `warning` | sap_horizon | Sárga figyelmeztetés |
| `alarm` | sap_horizon_dark | Piros riasztás |
| `nightshift` | sap_horizon_dark | Sötét mód |
| `nightshift_dimmed` | sap_horizon_dark | Extra sötét |

---

## Beépítés (új projektbe)

### 1. Fájl másolása

```
wms-integration/m/VirtualThemeManager.ts  →  webapp/m/VirtualThemeManager.ts
```

### 2. Component.ts módosítása (3 hely)

```typescript
// a) Import
import VirtualThemeManager from "./m/VirtualThemeManager";

// b) init()-ben
VirtualThemeManager.getInstance().applyDefault();

// c) Accessor metódus
public getVirtualThemeManager(): VirtualThemeManager {
    return VirtualThemeManager.getInstance();
}
```

---

## Használat (már integrált projektben)

```typescript
const vtm = (this.getOwnerComponent() as Component).getVirtualThemeManager();

vtm.switchTheme("alarm");      // téma váltás
vtm.switchTheme("normal");     // vissza
vtm.getActiveThemeKey();       // aktuális kulcs
vtm.getThemes();               // összes téma listája
```

---

## Tipikus példák

### Hiba → alarm → normal

```typescript
try {
    await save();
} catch (err) {
    vtm.switchTheme("alarm");
    MessageBox.error(err.message, {
        onClose: () => vtm.switchTheme("normal")
    });
}
```

### WebSocket esemény

```typescript
if (oMessage.command === "THEME_CHANGE") {
    vtm.switchTheme(oMessage.data.themeKey);
}
```

### Egyedi téma

```typescript
VirtualThemeManager.register("custom", {
    base: "sap_horizon",
    label: "Egyedi",
    patch: { "--sapBrandColor": "#ff6600" }
});
vtm.switchTheme("custom");
```

---

## Fontos

- **Nem perzisztens** — oldal újratöltéskor `normal`-ra resetel
- **`switchTheme()` idempotens** — ha már aktív, nem csinál semmit
- **`sap.ui.getCore().getConfiguration().getTheme()` a base theme-t adja** — használd `vtm.getActiveThemeKey()`-t
- **Előfeltétel**: SAPUI5 1.84+, `themelib_sap_horizon` a ui5.yaml-ban
