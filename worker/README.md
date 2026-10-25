# DiniLove Atelier API – lokaler Test-Scaffold

**Nicht deployt. Private Funktionen sind deaktiviert.** Dieses Paket enthält absichtlich keine Anmeldung, keinen persistenten Speicher und keine Upload-Endpunkte.

## Voraussetzungen
Node.js 20 oder neuer.

## Lokal testen
Im Ordner `worker/` ausführen:

```sh
npm test
```

Die Tests prüfen:
- Status-Endpunkt und `no-store`-Header,
- geschlossene private API (erwartet HTTP 503),
- Ablehnung nicht freigegebener Browser-Origin,
- CORS-Preflight für den freigegebenen Origin,
- 404 für unbekannte Routen.

Diese Tests sind nur Basissicherheitsprüfungen, kein Nachweis für eine fertige Authentifizierung. Vor echtem Einsatz müssen insbesondere Login, Sessions, CSRF, Rate-Limits, Berechtigungen, persistenter Speicher, Upload-Signierung und Tagesfreigaben implementiert und getestet werden.
