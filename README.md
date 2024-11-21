# KettőLingo

## Popis
Krátky prehľad projektu:
- Náš projekt KettőLingo je určený na výučbu cudzích jazykov. Obshahuje viacero možných výučbových aktivít pre prihláseného používateľa a zároveň široký rozsah cudzích slov a kvízov.
- Aplikácia je určená pre každého, kto má chuť sa vzdelávať v oblasti cudzích jazykov. Môže ísť o študentov ale aj dospelých ľudí, na svoje si tu príde každý!

## Obsah
1. [Inštalácia](#inštalácia)
2. [Použitie](#použitie)
3. [Funkcie](#funkcie)
   - [Jazyky](#jazyky)
4. [Autori](#autori)

## Inštalácia
Krok za krokom, ako nastaviť projekt KettőLingo lokálne:

```bash
# Príkazy
git clone https://github.com/ChrappaCode/KettoLingo.git
```

- Prvým krokom je inštalácia všetkých potrebných knižníc a import DB:
  
```bash
# Príkazy
python import_categories.py
python import_languages.py
python import_csv.py
flask db upgrade                         
```

- Následne je potrebné spustiť front-end, v podpriečinku KettoLingoFE:

```bash
# Príkazy
npm run dev
```

- Následne môžme spustiť back-end:

```bash
# Príkazy
python app.py 
```

Aplikácia bude bežať na http://localhost:5173/

## Použitie
Po spustení aplikácie je potrebné vytvoriť použivateľský účet a následne sa do neho prihlásiť. Príhlásený používateľ si na svojom profile zvolí rodnú reč a následne sú mu sprístupnené všetky funckie našej aplikácie.

## Funkcie
Výuka cudzích slov zo širokej škály kategórií a podporovaných jazykov, ktorými sú Maďarčina, Slovenčina, Čeština, Taliančina a Angličtina. Ďalej po preštudovaní danej kategórie si používateľ vyplniť test dosiahnutých znalostí z danej kategórie. Test mu po ukončení ukáže jeho úspešnosť a uloží sa do jeho profilu. Používateľ v profile nájde všetky testy, ktoré vyplnil aj s podrobným detailom chýb.

## Autori
- Bc. Boglárka Farkas
- Bc. Miloš Ilovský
- Bc. Dávid Kurek
- Bc. Marek Mikula
- Bc. Jakub Chrappa
