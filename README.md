# הקוד העצבי — חדר בריחה

זוהי הגרסה הסופית של המשחק, כפי שפורסמה ב־Sites בגרסה 72.

- תאריך צילום המצב: 27 באוקטובר 2026
- commit מקור: `87b6286c1d76b5dbefc03764912fb5ddde9a9648`
- קובצי האתר: `dist/`
- עשר החידות העצמאיות: `standalone-riddles/`

## הפעלה מקומית ב־Windows

לחצו פעמיים על `start-local.bat`. הסקריפט מפעיל שרת מקומי ופותח את המשחק בדפדפן. נדרשת התקנה של Python 3 (`py` או `python`).

אפשר גם להפעיל ידנית מתוך התיקייה:

```powershell
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

ואז לפתוח בדפדפן: <http://127.0.0.1:8000>

אין לפתוח את `dist/index.html` ישירות באמצעות `file://`, משום שהמשחק משתמש במודולי JavaScript שדורשים שרת HTTP.

## GitHub Pages

המאגר מוכן לפרסום באמצעות GitHub Pages. הקובץ `.github/workflows/pages.yml` מפרסם אוטומטית את התיקייה `dist/` בכל דחיפה לענף `main`.

לאחר יצירת המאגר ב־GitHub:

1. היכנסו ל־Settings → Pages.
2. תחת Source בחרו `GitHub Actions`.
3. דחפו את הענף `main` והמתינו לסיום תהליך `Deploy GitHub Pages`.

## עשר החידות העצמאיות

כל קובץ בתיקייה `standalone-riddles/` כולל בתוכו את ה־CSS וה־JavaScript המשותפים, ולכן אפשר לפתוח אותו ישירות בדפדפן ללא שאר קובצי האתר.

כדי לבנות אותם מחדש מהגרסה שבתיקייה `dist/`, הריצו:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\build-standalone-riddles.ps1
```

## מבנה המאגר

```text
dist/                         האתר המלא
standalone-riddles/           10 קובצי HTML עצמאיים
tools/                        כלי בנייה לחידות העצמאיות
.github/workflows/pages.yml   פרסום אוטומטי ל־GitHub Pages
start-local.bat               הפעלה מקומית ב־Windows
```
