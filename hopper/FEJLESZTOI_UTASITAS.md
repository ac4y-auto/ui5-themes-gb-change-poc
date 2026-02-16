# UI5 Splash Screen - Fejlesztői Útmutató

## Áttekintés

Ez az útmutató részletezi, hogyan kell integrálni a splash screen funkciót egy meglévő UI5 alkalmazásba.

## Előfeltételek

- Működő UI5 alkalmazás
- WebM formátumú videó fájl a splash screen-hez (opcionális)
- Modern böngésző támogatás

## Implementációs Lépések

### 1. HTML Módosítások (index.html)

#### 1.1 CSS Stílusok Hozzáadása

Helyezd el ezeket a stílusokat a `<head>` szekcióban, a UI5 bootstrap script **ELŐTT**:

```html
<style>
    /* Splash Screen Styles */
    #splash-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #000;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        transition: opacity 0.5s ease-out;
    }

    #splash-screen.fade-out {
        opacity: 0;
        pointer-events: none;
    }

    #splash-video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    /* Hide body content until loaded */
    body.loading #content {
        visibility: hidden;
    }
</style>
```

**Testreszabási lehetőségek:**
- `background-color`: Háttérszín módosítása (pl. `#000` -> `#667eea`)
- `transition`: Átmenet sebessége (pl. `0.5s` -> `1s`)
- `object-fit`: Videó illesztése (`cover`, `contain`, `fill`)

#### 1.2 JavaScript Inicializáló Script

Helyezd el ezt a scriptet a `<head>` szekcióban, a UI5 bootstrap script **UTÁN**:

```html
<script>
    sap.ui.getCore().attachInit(function() {
        console.log("UI5 Core ready - hiding splash screen");
        // UI5 betöltődött, elrejtjük a splash screent
        setTimeout(function() {
            document.body.classList.remove('loading');
            var splashScreen = document.getElementById('splash-screen');
            splashScreen.classList.add('fade-out');

            // Eltávolítjuk a DOM-ból az animáció után
            setTimeout(function() {
                splashScreen.remove();
                console.log("Splash screen removed");
            }, 500);
        }, 500);
    });
</script>
```

**Paraméterek:**
- Első `setTimeout` késleltetés: Minimális megjelenítési idő (pl. `500` -> `1000` ms)
- Második `setTimeout` késleltetés: Fade-out animáció időtartama (egyezzen a CSS transition-nel)

#### 1.3 Body Tag Módosítása

Adj hozzá egy `loading` osztályt a `<body>` taghez:

```html
<body class="sapUiBody loading">
```

#### 1.4 Splash Screen HTML Hozzáadása

Helyezd el ezt a HTML kódot **közvetlenül a `<body>` tag után**, még a fő content konténer előtt:

**Videós verzió:**
```html
<!-- Splash Screen -->
<div id="splash-screen">
    <video id="splash-video" autoplay loop muted playsinline>
        <source src="splash-video.webm" type="video/webm">
        Your browser does not support the video tag.
    </video>
</div>
```

**Animált verzió (videó nélkül):**
```html
<!-- Splash Screen -->
<div id="splash-screen">
    <div class="splash-content">
        <div class="spinner"></div>
        <div class="splash-text">Betöltés...</div>
    </div>
</div>
```

Ha az animált verziót használod, add hozzá ezeket a CSS stílusokat is:

```css
.splash-content {
    text-align: center;
    color: white;
}

.spinner {
    width: 80px;
    height: 80px;
    border: 8px solid rgba(255, 255, 255, 0.3);
    border-top: 8px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.splash-text {
    font-size: 24px;
    font-weight: 300;
    margin-top: 20px;
}
```

### 2. Videó Fájl Elhelyezése

#### 2.1 Fájl Követelmények

- **Formátum**: WebM (ajánlott böngésző támogatás miatt)
- **Alternatíva**: MP4 (szélesebb támogatás)
- **Méret**: Optimalizálva legyen (max 5-10 MB)
- **Felbontás**: 1920x1080 vagy kisebb

#### 2.2 Fájl Elhelyezése

Helyezd el a videó fájlt a projekt gyökérkönyvtárába:

```
ui5-app/
├── index.html
├── splash-video.webm  <-- IDE
├── Component.js
├── manifest.json
└── ...
```

**Alternatív elérési utak:**

Ha másik mappába szeretnéd helyezni:

```html
<!-- Példa: assets mappában -->
<source src="assets/splash-video.webm" type="video/webm">

<!-- Példa: media mappában -->
<source src="media/splash-video.webm" type="video/webm">
```

#### 2.3 Poster Kép (Előnézeti Kép)

A poster attribútum beállítása opcionális, de ajánlott. Ez a kép jelenik meg a videó betöltése előtt:

```html
<video id="splash-video" autoplay loop muted playsinline poster="splash-poster.jpg">
    <source src="splash-video.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>
```

**Poster kép követelmények:**
- Formátum: JPG, PNG vagy WebP
- Felbontás: Azonos a videóval (pl. 1920x1080)
- Méret: Optimalizált (max 200-500 KB)
- Elhelyezés: Projekt gyökérkönyvtár

**Poster kép elkészítése videóból:**

A videó első frame-jét használd poster képnek. A legtöbb videószerkesztő programban exportálhatod az első képkockát JPG-ként.

#### 2.4 Több Formátum Támogatása

Több formátum hozzáadása a szélesebb böngésző támogatáshoz:

```html
<video id="splash-video" autoplay loop muted playsinline poster="splash-poster.jpg">
    <source src="splash-video.webm" type="video/webm">
    <source src="splash-video.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>
```

#### 2.5 Videó Sebesség Módosítása

Ha lassított lejátszást szeretnél (pl. 5x lassítás), add hozzá ezt a scriptet a `</body>` tag előtt:

```html
<script>
    // Beállítjuk a videó sebességét 0.2-re (5x lassítás)
    document.addEventListener('DOMContentLoaded', function() {
        var video = document.getElementById('splash-video');
        video.playbackRate = 0.2; // 0.2 = 5x lassabb, 0.5 = 2x lassabb, 2.0 = 2x gyorsabb
    });
</script>
```

### 3. Content Konténer Azonosítása

Győződj meg róla, hogy a fő UI5 content konténer rendelkezik `id="content"` attribútummal:

```html
<div id="content"
     data-sap-ui-component
     data-name="myapp"
     data-id="container"
     data-settings='{"id" : "myapp"}'>
</div>
```

**Ha más ID-t használsz**, módosítsd a CSS-ben:

```css
/* Eredeti */
body.loading #content {
    visibility: hidden;
}

/* Ha más ID-d van, pl. "app-container" */
body.loading #app-container {
    visibility: hidden;
}
```

## Teljes Példa Struktúra

### Minimális index.html struktúra:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UI5 Application</title>

    <!-- 1. CSS STÍLUSOK -->
    <style>
        /* Splash screen CSS itt */
    </style>

    <!-- 2. UI5 BOOTSTRAP -->
    <script
        id="sap-ui-bootstrap"
        src="https://sdk.openui5.org/resources/sap-ui-core.js"
        data-sap-ui-theme="sap_horizon"
        data-sap-ui-libs="sap.m"
        data-sap-ui-compatVersion="edge"
        data-sap-ui-async="true"
        data-sap-ui-onInit="module:sap/ui/core/ComponentSupport"
        data-sap-ui-resourceroots='{
            "myapp": "./"
        }'>
    </script>

    <!-- 3. SPLASH SCREEN SCRIPT -->
    <script>
        sap.ui.getCore().attachInit(function() {
            // Splash screen elrejtési logika itt
        });
    </script>
</head>
<body class="sapUiBody loading">
    <!-- 4. SPLASH SCREEN HTML -->
    <div id="splash-screen">
        <video id="splash-video" autoplay loop muted playsinline>
            <source src="splash-video.webm" type="video/webm">
        </video>
    </div>

    <!-- 5. FŐ CONTENT -->
    <div id="content"
         data-sap-ui-component
         data-name="myapp"
         data-id="container"
         data-settings='{"id" : "myapp"}'>
    </div>
</body>
</html>
```

## Hibakeresés

### A splash screen nem jelenik meg

1. Ellenőrizd, hogy a `loading` osztály hozzá van-e adva a `<body>` taghez
2. Ellenőrizd a CSS `z-index` értékét (9999-nek kell lennie)
3. Nézd meg a böngésző konzolját hibaüzenetekért

### A splash screen nem tűnik el

1. Nyisd meg a böngésző konzolt
2. Keresd a "UI5 Core ready" üzenetet
3. Ha nincs ilyen üzenet, az UI5 nem töltődött be rendesen
4. Ellenőrizd a UI5 bootstrap script URL-jét

### A videó nem játszódik le

1. Ellenőrizd a videó fájl elérési útját
2. Ellenőrizd a fájl formátumát (WebM vagy MP4)
3. Nyisd meg a Network tab-ot és nézd meg, hogy betöltődik-e a videó
4. Próbálj meg több formátumot hozzáadni (WebM + MP4)

### A videó nem loop-ol

1. Ellenőrizd, hogy a `loop` attribútum jelen van-e
2. Bizonyos böngészők esetében próbáld meg JavaScript-tel:
```javascript
document.getElementById('splash-video').loop = true;
```

## Optimalizálási Tippek

### 1. Videó Optimalizálás

```bash
# FFmpeg használata videó optimalizáláshoz
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -b:a 128k -c:a libopus splash-video.webm
```

### 2. Minimális Megjelenítési Idő

Ha túl gyorsan töltődik be az app és alig látszik a splash screen:

```javascript
// Növeld az első setTimeout értékét
setTimeout(function() {
    // ...
}, 2000); // 2 másodperc minimális megjelenítés
```

### 3. Háttér Fallback

Ha a videó nem tölthető be, adj meg fallback hátteret:

```css
#splash-screen {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    /* ... */
}
```

## További Testreszabások

### Progress Bar Hozzáadása

```html
<div id="splash-screen">
    <video id="splash-video" autoplay loop muted playsinline>
        <source src="splash-video.webm" type="video/webm">
    </video>
    <div class="progress-bar">
        <div class="progress-fill"></div>
    </div>
</div>
```

```css
.progress-bar {
    position: absolute;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: white;
    animation: progress 2s ease-in-out;
}

@keyframes progress {
    0% { width: 0%; }
    100% { width: 100%; }
}
```

## Támogatás és Verziókövetés

- **UI5 Verzió**: 1.120.0+
- **Böngésző Támogatás**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobil Támogatás**: iOS Safari 13+, Chrome Android 80+

## Kapcsolat

Ha kérdésed van vagy problémába ütközöl, nézd meg a projekt README.md fájlját további információkért.
