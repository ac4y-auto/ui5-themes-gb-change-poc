# Just Run It!

## Előfeltétel

```bash
npm install
```

## Indítás

| Parancs | Mód | Port | HTML | Bootstrap forrás |
|---------|-----|------|------|-----------------|
| `npm start` | Local | 8100 | index.html | UI5 CLI cache |
| `npm run start:cdn` | CDN | 8080 | index-cdn.html | ui5.sap.com CDN |
| `npm run start:hybrid` | Hybrid | 8300 | index-hybrid.html | backend proxy |

Vagy: **dupla klikk a `run.bat`-ra** és válassz számot.

## Melyiket használjam?

- **Nincs backend szerver?** → `npm start`
- **Van internet, gyors teszt kell?** → `npm run start:cdn`
- **Van backend szerver?** → `npm run start:hybrid` (`.env` beállítás után)

## Hybrid mód beállítása

```bash
cp .env.example .env
# Szerkeszd a .env fájlt: UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI=http://a-te-szervered:9000
npm run start:hybrid
```

## SAPUI5 verzió: 1.105.0

Nem változtatható! A kód erre a verzióra van írva.
