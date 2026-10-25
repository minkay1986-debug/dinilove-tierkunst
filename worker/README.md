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

## Access-geschützte Admin-Identität (noch nicht deployt)

Der Worker enthält jetzt einen Prüfbaustein für den von Cloudflare Access gesetzten Header `Cf-Access-Jwt-Assertion`. Er prüft Signatur (RS256), Issuer, Audience, Ablaufzeit und die exakt zugelassene, verifizierte E-Mail. Der Worker darf nur hinter einer korrekt konfigurierten Cloudflare-Access-Anwendung laufen.

Vor einem Test-Deployment müssen diese Werte **im Cloudflare-Dashboard** gesetzt werden, nicht in Git:
- `ACCESS_TEAM_DOMAIN`: vollständiger HTTPS-Issuer der eigenen Cloudflare-Access-Zone
- `ACCESS_AUD`: Audience/Policy-Tag der Access-Anwendung
- `ADMIN_EMAIL`: einzige zugelassene Admin-Adresse
- `ALLOWED_ORIGINS`: exakter öffentliche Galerie-Origin

Die Admin-Adresse und Audience sind Konfiguration; private Schlüssel oder Passwörter gehören nicht ins Repository. Keine dieser Einstellungen wurde gesetzt und der Worker wurde nicht deployed. Alle privaten Inhalte, Uploads und Schreibaktionen bleiben deaktiviert.
