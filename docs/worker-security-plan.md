# DiniLove – Worker und Atelier-Sicherheit

## Status
- Nur Entwicklungszweig: `feature/private-atelier-daily-surprises`
- Worker-Dateien sind ein **nicht deploytes Gerüst**.
- `GET /health` meldet den Scaffold-Status.
- Alle `/api/*)-Routen antworten absichtlich mit `503 not_configured`.
- Keine Verbindung zu TankstellenErtrag, dessen Supabase-Projekten oder Live-App.
- Keine Zugangsdaten, Cloudinary-API-Secrets oder echten privaten Texte im Repository.

## Zielarchitektur
1. Statische Galerie bleibt öffentlich und ohne Login erreichbar.
2. Genau eine zugelassene Atelier-Benutzerin: die vom Betreiber angegebene E-Mail-Adresse wird ausschließlich in der privaten Worker-Konfiguration hinterlegt. Sie wird nicht in öffentliche Repository-Dateien geschrieben. Keine Registrierung und keine öffentliche Kontoerstellung.
3. Private Verwaltungs-API prüft die Anmeldung serverseitig bei **jeder** geschützten Anfrage.
4. Cloudinary-Signaturen werden ausschließlich serverseitig erstellt; API Secret wird als Worker Secret hinterlegt, niemals in HTML/JavaScript oder Git.
5. Galerie-Metadaten und Überraschungszuordnung benötigen einen dauerhaften Speicher mit restriktiven Berechtigungen.
6. Überraschungstexte werden nur für den aktuell freigegebenen Tag zurückgegeben. Browser-Uhr und clientseitige Sperren sind keine Sicherheitsgrenze.
7. Zeitzone ist `Europe/Berlin`; Geburtstag am 30. Oktober, Jahrestag am 16. Februar, monatliche Überraschung jeweils am 16. Bei Kollision gewinnt der Jahrestag. Weihnachtsdatum wird vor Aktivierung auf den 24. Dezember festgelegt, sofern der Betreiber das bestätigt.
8. Jede Upload-, Bearbeiten- und Löschaktion wird serverseitig autorisiert. Dateityp, Dateigröße und Eingaben werden geprüft.

## Vor Implementierung echter Login-Sessions
- Die zugelassene Admin-E-Mail privat als Worker-Secret/-Konfiguration setzen; niemals die konkrete Adresse in öffentliche Dateien oder Logs schreiben.
- Authentifizierungsverfahren und sichere Passwort-/E-Mail-Wiederherstellung auswählen; keine selbst erfundene, ungetestete Passwort-Kryptografie.
- Session-Cookies: `HttpOnly`, `Secure`, angemessene `SameSite`-Einstellung, Ablauf und Widerruf; CSRF-Schutz für schreibende Anfragen.
- Rate-Limits und generische Fehlermeldungen gegen Passwort-Raten und Konto-Erkennung.
- CORS nur für den exakten Galerie-Origin. CORS ist **kein** Ersatz für Authentifizierung.
- Secrets nur über Cloudflare Worker Secrets setzen; niemals in GitHub, Frontend oder Chat eintragen.
- Erst mit Testkonto und künstlichen Beispieldaten prüfen; keine echten privaten Überraschungstexte vor dem Sicherheitstest.

## Deployment-Sperre
Dieses Gerüst nicht deployen und die Vorschau nicht als sicheres Login bezeichnen. Erst nach Implementierung und Prüfung von Authentifizierung, Speicherung, Tageslogik, Uploads, Datenschutz und Kostenlimits darf ein separater Test-Worker eingerichtet werden. Kein kostenpflichtiger Dienst und keine Zahlungsmethode ohne ausdrückliche Zustimmung.
