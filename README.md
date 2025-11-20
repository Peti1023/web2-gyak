# F1 Archívum – NodeJS + Sequelize + MySQL

Beadandó mintamegoldás (autentikáció, szerepkörök, CRUD, üzenetek, 3 tábla megjelenítése).

## Követelmények
- Node 18+
- MySQL 8+

## Telepítés
```bash
cp .env.example .env
# .env fájlban állítsd a DB_ változókat (MySQL)
npm install
```

### Adatbázis létrehozása
```sql
CREATE DATABASE forma1 CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
```

### Adatok importálása
A `data/` mappában a feladatban kapott TSV fájlok találhatók. Import:
```bash
npm run import
```

Admin felhasználó:
- Email: `.env` (ADMIN_EMAIL)
- Jelszó: `.env` (ADMIN_PASSWORD)

### Futtatás
```bash
npm start
```
Nyisd meg: http://localhost:3000

## Funkciók
- **Autentikáció**: regisztráció, bejelentkezés, kijelentkezés
- Szerepkörök: visitor, registered, admin
- **Főoldal**: bemutató
- **Adatbázis**: 3 tábla listázása (pilota, gp, eredmeny)
- **Üzenetek**: kapcsolat űrlap → DB, megtekintés belépve (fordított időrend)
- **CRUD**: Pilóta (listázás, új, módosítás, törlés) – admin

## Indító fájl
`src/indito.js` (Linuxon: `/home/felhasznalonev/feladat/src/indito.js`).
