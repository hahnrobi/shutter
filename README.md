# Shutter
Készítte: Hahn Róbert

A program kipróbálható a https://shutter.iva.hu/ címen is.
## Szükséges szoftverek
- Node.JS 16
- npm
- MongoDB
- Docker (Amennyiben konténerből futtatnánk)
- Docker-compose (Amennyiben konténerből futtatnánk)
## Telepítés
A program szkriptként használható, közvetlenül Node JS-ből futtatható. A szakdolgozathoz csatolt lemezen található source mappában található forráskódhoz csatolva meghalálthatóak a szükséges Node modulok, így azokat nem szükséges telepíteni.
Az Angularban készített frontend felület lefordítva került csatolásra.
## Fordítás, csomagok beszerzése
Bár csatolásra került az összes felhasznált modul, érdemes azokat frissíteni, a frondend alkalmazást lefordítani.
Mind az alkalmazás gyökérkönyvtárában, mind a frontend felületet tartalmazó `public` könyvtárban találatóak Node modulok, melyeket npm-ből az `npm i` paranncsal telepíthetünk.
Az Angular alkalmazást az `ng build --prod` paranccsal fordíthatjuk le.
## Futtatás helyileg konzolból
A futtatáshoz a MongoDB adatbázisnak futnia kell. A futtatás során bizonyos konfigurációk a környezeti változókból kerülnek beolvasásra. A következő változók használhatók e célból, de a .env változóban is elhelyezhetőek.
- DB_CONN: Adatbázishoz használt connection string. pl.: mongodb://127.0.0.1:27017/shutter
- SHUTTER_ACCESS_TOKEN_SECRET: A JWT generálásához használt secret. pl.: 573d64c90c79255ee30fdfea4d4affd25fd958d260f359244e5183830a1993ada9531abb59bc36c61c000378c2fb0166c0dc418a1fbe917047efc10ddcb455d35f511d78c690d09769c5dd04e5f4384bc7e78eb002d419741c9839613694247bd35cec5b02b735653aee25bb9daf35f868828cba61d7e57c20a71ac231435e50
- SSL_CERT: SSL biztonsági tanusítvány relatív elérési útvonala. pl.: /certs/cert.crt
- SSL_PRIVATE_KEY: SSL privát kulcs relatív elérési útvonala. pl.: /certs/private.key

A biztonsági tanusítványok esetében a program tartalmaz ilyen fájlokat, azonban a futtatási környezettől függően érdemes generálni sajátot.

A szerver a következő paranccsal indítható el.
```
node server.js
```

Ezt követően a böngészőnkben a `https://localhost:4430` címet felkeresve használhatjuk az alkalmazást.
A szerver a számítógép összes interfészén működik, így közvetlenül használható az interneten is. Ez esetben érdemes a használt domainnek megfelelő tanusítványt beszerezni.

## Futtatás Docker segítségével
Az alkalmazás Docker könténerből is futtatható, teljes működéséhez azonban szükség van egy MongoDB-t futtató konténerre is. Erre a célra a Docker-compose használható, mely a csatolt docker-compose.yml fájllal konfigurálható.
Először a Docker image elkészítése szükséges. Csatolásra került egy előre elkészített képfájl `shutter.tar` néven.
### Csatolt képfájl használata
Amennyiben nem szeretnénk saját képfájlt készíteni, úgy importálhatjuk az előre elkészített képfájlt a helyi gyűjteménybe.
```
docker load < shutter.tar
```
### Saját képfájl készítése
Saját képfájl készítéséhez a konfigurációt a `Dockerfile` fájlban találhatjuk. A képfájlt a következő paranccsal készíthetjük el:
```
docker build . -t hahnrobi/shutter
```
Ezt követően elkészül a képfájl és hozzáadódik a helyi gyűjteményhez.
### Futtatás
Az előző kép opció egyike mindenképpen szükséges az alkalmazás futtatásához. A `docker-compose.yml` fájlt testreszabhatjuk egyéni preferenciáink alapján. A fájlban találhatóak meg a használni kívánt portok, valamint itt kell megadnunk a már korábban említett környezeti változókat is a futtatáshoz.
Az alkalmazás elindítását a következő parancs kiadásával tehetjük meg:
```
docker-compose up
```
Ezt követően elindul a shutter és a mongo konténerünk is, mindkettő kimenetét láthatjuk a konzolon. Első indításkor érdemes ílyen módon elindítani, hogy láthassuk ha valamelyik konténerben hiba keletkezik.
Amennyiben a háttérben szeretnénk futtatni a konzolunktól függetlenül, azt a következő paranccsal tehetjük meg:
```
docker-compose up -d
```