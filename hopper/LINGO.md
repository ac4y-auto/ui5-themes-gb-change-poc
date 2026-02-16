# 📚 LINGO - Dokumentációs Fogalomtár

**Mire jó melyik dokumentáció?** - Gyors áttekintő

---

## 📖 DOKUMENTÁCIÓ TÍPUSOK

### 🔵 RUNBOOK
**Mire jó**: Operációs útmutató a mindennapi működéshez

**Tartalma**:
- ✅ **Kritikus szabályok** (pl. "Claude tesztel először!")
- ✅ Szerver indítás/leállítás
- ✅ Tesztelési protokoll és checklist
- ✅ Session start/end checklist
- ✅ Hibaelhárítási lépések
- ✅ Monitoring és ellenőrzési pontok
- ✅ Git workflow
- ✅ Gyakori műveletek step-by-step

**Mikor használd**:
- Amikor elindítasz egy work sessiont
- Amikor problémát kell megoldani
- Amikor nem vagy biztos a helyes eljárásban
- Minden nap elején, hogy emlékezz a szabályokra

**Példa használat**:
> "Hogyan kell tesztelni egy változtatás után?"
> "Mi a session indítási checklist?"
> "Hogyan állítom le a szervert?"

**Fájl**: `RUNBOOK.md`

---

### 🟢 PLAYBOOK
**Mire jó**: Konkrét feladatok végrehajtási receptjei

**Tartalma**:
- ✅ **Receptszerű útmutatók** konkrét feladatokhoz
- ✅ Step-by-step instrukciók (1. 2. 3...)
- ✅ Változtatási scenáriók
- ✅ Deployment folyamatok
- ✅ Konkrét use-case megoldások
- ✅ "Ha ezt csinálod, akkor azt tedd" szabályok

**Mikor használd**:
- Amikor egy konkrét feladatot kell végrehajtani
- Amikor változtatni akarsz valamit (pl. CDN URL, verzió)
- Amikor nem emlékszel egy ritkán használt folyamatra
- Deployment vagy release előtt

**Példa használat**:
> "Hogyan változtatom meg a splash screen időzítését?"
> "Hogyan adok hozzá új environment-et?"
> "Hogyan cserélem le a splash videót?"

**Fájl**: `PLAYBOOK.md` (ha létezik)

---

### 🟡 HOUSE RULES
**Mire jó**: Projekt specifikus szabályok és konvenciók

**Tartalma**:
- ✅ **Kódolási szabályok** (naming, formatting)
- ✅ Git commit konvenciók
- ✅ Branching strategy
- ✅ Code review szabályok
- ✅ Dokumentálási követelmények
- ✅ Nem megkérdőjelezhető team szabályok
- ✅ Best practices a projektre

**Mikor használd**:
- Amikor kódot írsz
- Amikor commit-olsz
- Amikor dokumentálsz
- Amikor új csapattag csatlakozik
- Amikor PR-t készítesz

**Példa használat**:
> "Milyen formátumban írjam a commit üzenetet?"
> "Hogyan nevezzek el egy új fájlt?"
> "Milyen szabályok vannak a változókra?"

**Fájl**: `HOUSE_RULES.md` (ha létezik)

---

### 🟠 CHEAT SHEET
**Mire jó**: Gyors referencia gyakori parancsokhoz és műveletekhez

**Tartalma**:
- ✅ **Gyakran használt parancsok**
- ✅ Git parancsok gyűjteménye
- ✅ NPM scriptek
- ✅ Bash parancsok
- ✅ IDE shortcuts
- ✅ API endpoints
- ✅ Általános fejlesztői tippek

**Mikor használd**:
- Amikor nem emlékszel egy parancsra
- Amikor gyorsan kell keresni valamit
- Amikor sokféle tool-t használsz
- Referencia anyagként

**Példa használat**:
> "Mi volt a git force push parancs?"
> "Hogyan nézzem meg a running processeket?"
> "Mi az NPM install parancs flagje?"

**Fájl**: `CHEAT_SHEET.md` (általános)

---

### 🔴  CHEAT SHEET
**Mire jó**: **Projekt-specifikus** fontos adatok és beállítások (amit fejben nehéz tartani)

**Tartalma**:
- ✅ **Port számok** (8300)
- ✅ **Verziók** (UI5 1.120.0)
- ✅ **URL-ek** (CDN, Backend, Local)
- ✅ **IP címek** (192.168.1.10:9000)
- ✅ **Fájl elérések**
- ✅ **Konfiguráció értékek** (timeoutok, késleltetések)
- ✅ **Környezeti változók**
- ✅ **API kulcsok helye** (nem maga a kulcs!)
- ✅ **Build paraméterek**
- ✅ **Fontos számok** (méret, időzítés, stb.)

**Mikor használd**:
- Amikor nem emlékszel egy konkrét értékre
- Amikor konfigurálsz valamit
- Amikor problémát debugolsz
- Amikor új environment-et állítasz be
- Session handoff-nál

**Példa használat**:
> "Melyik porton fut a dev szerver?"
> "Mi volt a backend IP címe?"
> "Melyik UI5 verziót használjuk?"
> "Mennyi az splash screen delay?"
> "Mi a CDN URL pontosan?"

**Fájl**: `_CHEAT_SHEET.md` ⭐ (projekt-specifikus!)

---

## 🎯 GYORS DÖNTÉSI FA

```
Kérdés: Mit keresek?

├─ "Hogyan csináljam XY-t?"
│  └─ RUNBOOK vagy PLAYBOOK
│
├─ "Milyen szabály van XY-ra?"
│  └─ HOUSE RULES
│
├─ "Mi volt az XY parancs?"
│  └─ CHEAT SHEET
│
└─ "Mi volt az XY értéke/száma/URL-je?"
   └─  CHEAT SHEET ⭐
```

---

## 📊 ÖSSZEHASONLÍTÁS

| Típus | Fókusz | Stílus | Gyakoriság |
|-------|--------|--------|------------|
| **RUNBOOK** | Hogyan működik? | Procedurális | Napi |
| **PLAYBOOK** | Hogyan csináld? | Receptszerű | Heti |
| **HOUSE RULES** | Mi a szabály? | Normatív | Havonta |
| **CHEAT SHEET** | Mi a parancs? | Referencia | Napi |
| ** CHEAT SHEET** | Mi az érték? | Adatlista | **Óránként** ⭐ |

---

## 💡 PÉLDÁK A PROJEKT KONTEXTUSÁBAN

### RUNBOOK.md
```
✅ "Claude tesztel először böngészőben!"
✅ Szerver indítás: npm start (port 8300)
✅ Session start checklist
✅ Git workflow lépései
```

### PLAYBOOK.md (ha lenne)
```
✅ Splash screen videó cseréje (1-2-3 lépés)
✅ Új environment hozzáadása
✅ CDN váltás folyamata
```

### HOUSE_RULES.md (ha lenne)
```
✅ Commit üzenet: "type: message\n\nCo-Authored-By: Claude..."
✅ Fájlnév konvenció: kebab-case
✅ Indent: 4 spaces
```

### CHEAT_SHEET.md (általános, ha lenne)
```
✅ Git push: git push origin main
✅ Port check: netstat -ano | findstr :8300
✅ Process kill: taskkill /PID [PID] /F
```

### _CHEAT_SHEET.md ⭐
```
✅ Port: 8300
✅ UI5 verzió: 1.120.0 minimum
✅ CDN: https://sdk.openui5.org/resources/sap-ui-core.js
✅ Backend: http://192.168.1.10:9000
✅ Splash delay: 500ms
✅ Video speed: 0.2 (5x lassabb)
```

---

## 🎓 MIKOR ÍRJUNK ÚJ BEJEGYZÉST?

###  CHEAT SHEET-be írjunk, ha:
- ✅ Új portot használunk
- ✅ Verziót váltunk
- ✅ URL-t változtatunk
- ✅ IP címet beállítunk
- ✅ Környezeti változót használunk
- ✅ Fontos számot használunk (timeout, delay, méret)
- ✅ Bármit amit **fejben nehéz megjegyezni**

### RUNBOOK-ba írjunk, ha:
- ✅ Új szabály születik (pl. "Claude tesztel először")
- ✅ Új workflow lépést találunk ki
- ✅ Hibaelhárítási eljárást dokumentálunk
- ✅ Checklist itemet adunk hozzá

### PLAYBOOK-ba írjunk, ha:
- ✅ Gyakran ismétlődő komplex feladat
- ✅ Többlépéses változtatás (recept)
- ✅ Deployment vagy release folyamat

### HOUSE RULES-ba írjunk, ha:
- ✅ Team szabály születik
- ✅ Kódolási konvenció változik
- ✅ Git stratégia frissül

---

## 🔑 KULCS KÜLÖNBSÉGEK

### RUNBOOK vs PLAYBOOK
- **RUNBOOK**: "Hogyan működik a rendszer?" (operációs)
- **PLAYBOOK**: "Hogyan csinálj X feladatot?" (task-oriented)

### CHEAT SHEET vs  CHEAT SHEET
- **CHEAT SHEET**: "Mi a parancs?" (általános parancsok)
- ** CHEAT SHEET**: "Mi az érték?" (projekt-specifikus adatok) ⭐

### RUNBOOK vs HOUSE RULES
- **RUNBOOK**: "Hogyan dolgozz?" (workflow)
- **HOUSE RULES**: "Mi a szabály?" (standardok)

---

## 📝 GYORS KERESÉS

**Kérdés típusok**:

| Kérdés | Válasz helye |
|--------|-------------|
| "Melyik porton?" |  CHEAT SHEET ⭐ |
| "Hogyan teszteljek?" | RUNBOOK |
| "Hogyan cseréljek videót?" | PLAYBOOK |
| "Mi a commit formátum?" | HOUSE RULES |
| "Mi a git push parancs?" | CHEAT SHEET |
| "Mennyi a delay?" |  CHEAT SHEET ⭐ |
| "Hogyan indítom a szervert?" | RUNBOOK |
| "Melyik UI5 verziót?" |  CHEAT SHEET ⭐ |

---

## 🎯 ÖSSZEFOGLALÁS

### Top 3 leggyakrabban használt (ebben a projektben):

1. ** CHEAT SHEET** ⭐⭐⭐
   - Port, verzió, URL, IP, számok
   - Projekt-specifikus adatok
   - **Leggyakrabban nézett!**

2. **RUNBOOK** ⭐⭐
   - Napi workflow
   - Tesztelési szabályok
   - Hibaelhárítás

3. **CHEAT SHEET** ⭐
   - Git parancsok
   - NPM parancsok
   - Általános referencia

---

**Utolsó frissítés**: 2026-02-12
**Verzió**: 1.0

💡 **Pro tip**: Mindig a  CHEAT SHEET-et nézd először, ha konkrét értéket keresel!
