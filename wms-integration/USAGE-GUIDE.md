# Virtual Theme Manager — Használati Segédlet

> A VTM már be van építve a projektbe. Ez a dokumentum a napi használathoz szükséges tudnivalókat tartalmazza.
> Beépítéshez / portoláshoz lásd: [INTEGRATION-GUIDE.md](INTEGRATION-GUIDE.md)

---

## Hozzáférés kontrollerből

```typescript
import type Component from "../Component";

const vtm = (this.getOwnerComponent() as Component).getVirtualThemeManager();
```

---

## Elérhető témák

| Kulcs               | Megjelenés                | Base theme         |
|---------------------|---------------------------|--------------------|
| `normal`            | Alapértelmezett világos   | sap_horizon        |
| `normal_branded`    | Zöld branded              | sap_horizon        |
| `warning`           | Sárga/amber figyelmeztetés| sap_horizon        |
| `alarm`             | Vörös riasztás (kritikus) | sap_horizon_dark   |
| `nightshift`        | Sötét mód                 | sap_horizon_dark   |
| `nightshift_dimmed` | Extra sötét éjszakai      | sap_horizon_dark   |

---

## API gyorsreferencia

```typescript
vtm.switchTheme("alarm")          // téma váltás → true/false
vtm.switchTheme("normal")         // vissza alapértelmezettre
vtm.applyDefault()                // = switchTheme("normal")

vtm.getActiveThemeKey()           // "alarm" | null
vtm.getActiveTheme()              // VirtualThemeDefinition | null
vtm.getThemes()                   // [{ key, label }, ...]
vtm.getThemeDefinition("alarm")   // VirtualThemeDefinition | undefined
```

---

## Példák

### Hiba kezelés — alarm majd vissza

```typescript
try {
    await this._restService.post("/endpoint", oPayload);
} catch (err: any) {
    vtm.switchTheme("alarm");
    MessageBox.error(err.message, {
        onClose: () => vtm.switchTheme("normal")
    });
}
```

### Figyelmeztetés időkorláttal

```typescript
vtm.switchTheme("warning");
MessageToast.show("Alacsony készlet!");
setTimeout(() => vtm.switchTheme("normal"), 5000);
```

### Éjszakai mód toggle

```typescript
private _isNightShift = false;

public onToggleNightShift(): void {
    this._isNightShift = !this._isNightShift;
    vtm.switchTheme(this._isNightShift ? "nightshift" : "normal");
}
```

### Témaválasztó Select

```typescript
// onInit — feltöltés
vtm.getThemes().forEach(t => {
    oSelect.addItem(new sap.ui.core.Item({ key: t.key, text: t.label }));
});
oSelect.setSelectedKey(vtm.getActiveThemeKey() || "normal");

// change event
public onThemeChange(oEvent: Event): void {
    const sKey = (oEvent.getParameter("selectedItem") as any).getKey();
    vtm.switchTheme(sKey);
}
```

### WebSocket esemény alapján

```typescript
if (oMessage.command === "THEME_CHANGE" && oMessage.data?.themeKey) {
    vtm.switchTheme(oMessage.data.themeKey);
}
```

### Egyedi téma regisztrálása

```typescript
import VirtualThemeManager from "ntt/wms/m/VirtualThemeManager";

VirtualThemeManager.register("customer_xyz", {
    base: "sap_horizon",
    label: "XYZ Ügyfél",
    patch: {
        "--sapBrandColor":            "#0d47a1",
        "--sapShell_Background":      "#e3f2fd",
        "--sapPageHeader_Background": "#bbdefb"
    }
});

vtm.switchTheme("customer_xyz");
```

Ha CSS override is kell (pl. `!important` szabályok):

```typescript
VirtualThemeManager.register("customer_xyz_dark", {
    base: "sap_horizon_dark",
    label: "XYZ Ügyfél (Sötét)",
    patch: { "--sapBrandColor": "#42a5f5" },
    cssOverrides: `
        .sapMPage { background-color: #0a1929 !important; }
    `
});
```

---

## Gyakran használt CSS változók

| Változó | Hatás |
|---------|-------|
| `--sapBrandColor` | Fő brand szín (emphasized gombok, linkek) |
| `--sapBackgroundColor` | Oldal háttér |
| `--sapShell_Background` | Shell/header háttér |
| `--sapPageHeader_Background` | Page header háttér |
| `--sapButton_Emphasized_Background` | Kiemelt gombok |
| `--sapField_Background` | Input mezők háttere |
| `--sapList_Background` | Listák/táblázatok háttere |
| `--sapTile_Background` | Tile-ok háttere |
| `--sapErrorColor` | Hibajelző szín |
| `--sapHighlightColor` | Kijelölés, fókusz |
| `--sapContent_LabelColor` | Label szöveg szín |

Teljes lista: [SAP Theming Parameters](https://experience.sap.com/fiori-design-web/theming/)

---

## Tudnivalók

1. **Nem perzisztens** — oldal újratöltéskor `normal`-ra resetel (szándékos).
2. **`switchTheme()` idempotens** — ha már aktív a kért téma, nem csinál semmit.
3. **Egyszerre egy téma** — nincs rétegezés, az új mindig lecseréli az előzőt.
4. **`getActiveThemeKey()` a virtuális kulcsot adja** — a UI5 `getTheme()` csak a base theme-t.
5. **CSS override ritkán kell** — a legtöbb változás megoldható patch-csel. Override-ot csak akkor, ha egy SAP kontrol figyelmen kívül hagyja a CSS változókat.
6. **`getThemes()` a regisztrált témákat is tartalmazza** — `register()` után automatikusan megjelenik.
