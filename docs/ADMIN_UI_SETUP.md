# DiniLove Admin UI — Testzweig

Status: Prototyp im Branch `feature/admin-security-foundation-2026-10-25`. Nicht nach `main` mergen und nicht auf die Live-Website deployen, bevor CORS/Access und die End-to-End-Tests bestätigt sind.

## Oberfläche

Die Datei `admin.html` enthält eine responsive, deutschsprachige Verwaltungsoberfläche für Nadine:
- Anmeldung über die separate Cloudflare-Access-geschützte Admin-API
- Upload von JPG, PNG, WebP und AVIF direkt zu Cloudinary
- Anzeige der Bilder im Cloudinary-Ordner `dinilove/`
- explizit bestätigungspflichtiges Löschen einzelner Bilder

Die Oberfläche enthält keine Zugangsdaten. Das Cloudinary-API-Secret bleibt als Worker-Secret gespeichert.

## API-Routen

- `GET /health` — einfacher Status-Endpunkt
- `POST /admin/cloudinary-signature` — erzeugt die Upload-Signatur
- `GET /admin/assets` — listet bis zu 100 Bilder im Ordner `dinilove/`
- `POST /admin/delete-asset` — löscht nur Assets, deren `publicId` mit `dinilove/` beginnt

Alle Admin-Routen prüfen den Access-JWT und die freigegebene E-Mail-Adresse serverseitig. Die API gibt nur ausgewählte Bildmetadaten zurück.

## Vor Freigabe zwingend testen

1. Worker-Code im separaten Cloudflare-Service `dinilove-admin-api-v2` auf den Stand dieses Branches bringen; niemals den bestehenden Turnstile-Worker ersetzen.
2. CORS-Preflight mit Cloudflare Access testen. Aktuell ist in der Access-App `options_preflight_bypass` auf `false` gesetzt; das kann OPTIONS-Anfragen vor dem Worker blockieren. Nur nach Prüfung auf `true` ändern und Worker-Origin-Prüfung beibehalten.
3. Aus dem echten Browser auf `https://dinilove.de` bzw. der Test-URL testen, dass Access-Cookie/Anmeldung bei Credentialed-Fetch funktionieren.
4. Upload eines harmlosen Testbilds durchführen und Signatur von Cloudinary akzeptieren lassen.
5. Galerie-Liste und Löschen eines eigens hochgeladenen Testbilds testen.
6. Ohne Anmeldung, mit falscher E-Mail und mit fremdem Origin testen; alle Admin-Aktionen müssen scheitern.
7. Den öffentlichen Turnstile-Endpunkt unabhängig testen.
8. GitHub Actions Tests prüfen.

Die Live-Website und `main` wurden durch diese Änderungen nicht geändert. Die Admin-Oberfläche ist noch kein veröffentlichter Login.
