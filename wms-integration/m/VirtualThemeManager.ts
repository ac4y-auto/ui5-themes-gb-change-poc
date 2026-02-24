import Log from "sap/base/Log";

export interface VirtualThemePatch {
    [cssVariable: string]: string;
}

export interface VirtualThemeDefinition {
    base: string;
    label: string;
    patch: VirtualThemePatch | null;
    cssOverrides?: string;
}

export interface VirtualThemeInfo {
    key: string;
    label: string;
}

const LOG_TAG = "VirtualThemeManager";

const THEMES: { [key: string]: VirtualThemeDefinition } = {
    normal: {
        base: "sap_horizon",
        label: "Normal (Horizon Light)",
        patch: null
    },
    normal_branded: {
        base: "sap_horizon",
        label: "Normal – Branded",
        patch: {
            "--sapBrandColor":            "#1b5e20",
            "--sapShell_Background":      "#e8f5e9",
            "--sapPageHeader_Background": "#c8e6c9",
            "--sapButton_Emphasized_Background": "#2e7d32",
            "--sapButton_Emphasized_Hover_Background": "#1b5e20"
        }
    },
    warning: {
        base: "sap_horizon",
        label: "Warning",
        patch: {
            "--sapBackgroundColor":       "#fff8e1",
            "--sapShell_Background":      "#f9a825",
            "--sapPageHeader_Background": "#fff3cd",
            "--sapBrandColor":            "#ff8f00",
            "--sapTile_Background":       "#fff8e1",
            "--sapList_Background":       "#fffde7",
            "--sapButton_Background":     "#fff3cd"
        }
    },
    alarm: {
        base: "sap_horizon_dark",
        label: "Alarm (Critical)",
        patch: {
            "--sapBackgroundColor":       "#3d0000",
            "--sapShell_Background":      "#8b0000",
            "--sapPageHeader_Background": "#6b0000",
            "--sapBrandColor":            "#ff1744",
            "--sapErrorColor":            "#ff1744",
            "--sapTile_Background":       "#4a0000",
            "--sapList_Background":       "#3d0000",
            "--sapButton_Reject_Background": "#d50000",
            "--sapButton_Background":     "#6b0000",
            "--sapButton_Emphasized_Background": "#d50000",
            "--sapButton_Emphasized_Hover_Background": "#ff1744",
            "--sapContent_LabelColor":    "#ff8a80",
            "--sapField_Background":      "#4a0000",
            "--sapField_BorderColor":     "#ff1744",
            "--sapGroup_TitleBackground": "#6b0000",
            "--sapGroup_ContentBackground": "#3d0000",
            "--sapPageFooter_Background": "#6b0000",
            "--sapToolbar_Background":    "#6b0000",
            "--sapHighlightColor":        "#ff1744",
            "--sapActiveColor":           "#ff1744",
            "--sapSelectedColor":         "#ff1744",
            "--sapList_HeaderBackground": "#6b0000",
            "--sapList_BorderColor":      "#8b0000",
            "--sapInfobar_Background":    "#d50000"
        },
        cssOverrides: `
            .sapUiBody { background-color: #3d0000 !important; }
            .sapMPage, .sapMPageBgSolid { background-color: #3d0000 !important; }
            .sapMPageHeader, .sapMBar, .sapMITB, .sapMITBHead { background-color: #6b0000 !important; }
            .sapMPanel { background-color: #4a0000 !important; }
            .sapMPanelContent { background-color: #3d0000 !important; }
            .sapMObjLHeader { background-color: #6b0000 !important; }
        `
    },
    nightshift: {
        base: "sap_horizon_dark",
        label: "Night Shift (Dark)",
        patch: null
    },
    nightshift_dimmed: {
        base: "sap_horizon_dark",
        label: "Night Shift – Extra Dim",
        patch: {
            "--sapBackgroundColor":       "#0a0a0f",
            "--sapShell_Background":      "#060610",
            "--sapPageHeader_Background": "#0d0d15",
            "--sapTile_Background":       "#0f0f18",
            "--sapList_Background":       "#0c0c14",
            "--sapContent_LabelColor":    "#7a7a8e"
        }
    }
};

/**
 * VirtualThemeManager – runtime theme switching for UI5 applications.
 *
 * Combines a real UI5 base theme with optional CSS custom-property patches
 * to create "virtual themes" that can be switched on the fly.
 *
 * Uses sap.ui.getCore() API for broad SAPUI5 version compatibility (1.84+).
 * The modern sap/ui/core/Theming module is only available from 1.118+.
 *
 * @namespace ntt.wms.m
 */
export default class VirtualThemeManager {

    private static _instance: VirtualThemeManager;

    private _activeThemeKey: string | null = null;
    private _pendingPatch: VirtualThemePatch | null = null;
    private _pendingCssOverrides: string | undefined = undefined;

    private constructor() {
        (sap.ui.getCore() as any).attachThemeChanged(() => {
            this._onBaseThemeApplied();
        });
    }

    public static getInstance(): VirtualThemeManager {
        if (!VirtualThemeManager._instance) {
            VirtualThemeManager._instance = new VirtualThemeManager();
        }
        return VirtualThemeManager._instance;
    }

    // ================================================================
    //  Public API
    // ================================================================

    public switchTheme(sThemeKey: string): boolean {
        const oDef = THEMES[sThemeKey];
        if (!oDef) {
            Log.error(`Unknown virtual theme: ${sThemeKey}`, "", LOG_TAG);
            return false;
        }

        if (this._activeThemeKey === sThemeKey) {
            return true;
        }

        Log.info(
            `Switching: ${this._activeThemeKey} → ${sThemeKey} (base: ${oDef.base}, patch: ${!!oDef.patch})`,
            "", LOG_TAG
        );

        this._removePatch();

        const sCurrentBase = (sap.ui.getCore() as any).getConfiguration().getTheme();

        if (sCurrentBase !== oDef.base) {
            this._pendingPatch = oDef.patch;
            this._pendingCssOverrides = oDef.cssOverrides;
            (sap.ui.getCore() as any).applyTheme(oDef.base);
        } else {
            this._applyPatch(oDef.patch);
            this._applyCssOverrides(oDef.cssOverrides);
        }

        this._activeThemeKey = sThemeKey;

        return true;
    }

    public getActiveThemeKey(): string | null {
        return this._activeThemeKey;
    }

    public getActiveTheme(): VirtualThemeDefinition | null {
        if (!this._activeThemeKey) return null;
        return THEMES[this._activeThemeKey] || null;
    }

    public getThemes(): VirtualThemeInfo[] {
        return Object.keys(THEMES).map(key => ({
            key,
            label: THEMES[key].label
        }));
    }

    public getThemeDefinition(sKey: string): VirtualThemeDefinition | undefined {
        return THEMES[sKey];
    }

    public static register(sKey: string, oDef: VirtualThemeDefinition): void {
        THEMES[sKey] = oDef;
    }

    public applyDefault(): void {
        this.switchTheme("normal");
    }

    // ================================================================
    //  Internal
    // ================================================================

    private _onBaseThemeApplied(): void {
        if (this._pendingPatch) {
            this._applyPatch(this._pendingPatch);
            this._pendingPatch = null;
        }
        if (this._pendingCssOverrides) {
            this._applyCssOverrides(this._pendingCssOverrides);
            this._pendingCssOverrides = undefined;
        }
    }

    private _applyPatch(oPatch: VirtualThemePatch | null): void {
        if (!oPatch) return;

        const oRoot = document.documentElement;
        const aVars = Object.keys(oPatch);

        aVars.forEach(sVar => {
            oRoot.style.setProperty(sVar, oPatch[sVar]);
        });

        Log.info(`Applied CSS patch: ${aVars.length} variables`, "", LOG_TAG);
    }

    private _applyCssOverrides(sCss?: string): void {
        this._removeCssOverrides();
        if (!sCss) return;

        const oStyle = document.createElement("style");
        oStyle.id = "vtm-css-overrides";
        oStyle.textContent = sCss;
        document.head.appendChild(oStyle);
        Log.info("Applied CSS overrides", "", LOG_TAG);
    }

    private _removeCssOverrides(): void {
        const oEl = document.getElementById("vtm-css-overrides");
        if (oEl) oEl.remove();
    }

    private _removePatch(): void {
        document.documentElement.removeAttribute("style");
        this._removeCssOverrides();
    }
}
