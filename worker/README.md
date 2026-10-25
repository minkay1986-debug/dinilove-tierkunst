# DiniLove Atelier API – lokaler Test-Scaffold

**Nicht deployt. Private Funktionen sind deaktiviert.** Dieses Paket enthält noch keine produktive Anmeldung, keine aktivierte Galerie-Verwaltung und keine Upload-Endpunkte.

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
- 404 für unbekannte Routen,
- Datumsauswahl mit Zeitzone `Europe/Berlin`,
- Vorrang besonderer Tage,
- serverseitige Suche nur nach dem heutigen Datum.

## Access-geschützte Admin-Identität (noch nicht deployt)
Der Worker enthält einen Prüfbaustein für den von Cloudflare Access gesetzten Header `Cf-Access-Jwt-Assertion`. Er prüft Signatur (RS256), Issuer, Audience, Ablaufzeit und die konfigurierte Admin-Adresse. Der Worker darf nur hinter einer korrekt konfigurierten Cloudflare-Access-Anwendung laufen.

Vor einem Test-Deployment müssen diese Werte **im Cloudflare-Dashboard** gesetzt werden, nicht in Git:
- `ACCESS_TEAM_DOMAIN`: vollständiger HTTPS-Issuer der eigenen Cloudflare-Access-Zone
- `ACCESS_AUD`: Audience/Policy-Tag der Access-Anwendung
- `ADMIN_EMAIL`: einzige zugelassene Admin-Adresse
- `ALLOWED_ORIGINS`: exakter öffentliche Galerie-Origin

Die Admin-Adresse und Audience sind Konfiguration; private Schlüssel oder Passwörter gehören nicht ins Repository. Keine dieser Einstellungen wurde gesetzt und der Worker wurde nicht deployed. Alle privaten Inhalte, Uploads und Schreibaktionen bleiben deaktiviert.

## Sicherheitshinweis
Der Helfer `getTodaySurprise` ist nur für serverseitigen Aufruf nach erfolgreicher Admin-Identitätsprüfung vorgesehen. Er nimmt bewusst kein Datum aus dem Browser an und gibt keine zukünftigen Zeilen aus. Er ist noch nicht mit einer aktivierten Route verbunden.
