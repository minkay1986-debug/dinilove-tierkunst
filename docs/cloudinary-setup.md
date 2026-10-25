# DiniLove – Cloudinary-Integration (Entwurf)

## Ziel
Cloudinary dient als Bildspeicher und Bildoptimierung für die öffentliche DiniLove-Galerie. Die Website bleibt im Repository `minkay1986-debug/dinilove-tierkunst`. Änderungen erfolgen ausschließlich im Branch `feature/private-atelier-daily-surprises`, bis eine ausdrückliche Freigabe zum Livegang vorliegt.

## Konto-Konfiguration
- Cloud name: `oevtblow`
- Tarif: Free (laut Einrichtung)
- Keine Zahlungsdaten hinterlegen und kein kostenpflichtiges Upgrade aktivieren, solange der Betreiber kostenlose Nutzung verlangt.
- Der Cloud name ist keine geheime Zugangsinformation. API Secret und private Schlüssel dürfen niemals im Browser-Code, GitHub-Repository oder Chat veröffentlicht werden.

## Sicherheitsgrenzen
- Öffentliche Bildauslieferung kann Cloudinary-URLs mit dem Cloud name verwenden.
- Uploads dürfen nicht über ein ungeschütztes unsigned-upload-Preset freigegeben werden, weil Fremde dieses sonst missbrauchen könnten.
- Für private Galerie-Verwaltung und sichere Uploads ist ein vertrauenswürdiger Server-Endpunkt erforderlich, der die Identität der einzigen Atelier-Benutzerin prüft und Upload-Signaturen serverseitig erstellt.
- Keine privaten Überraschungstexte, Zugangsdaten oder Adminfunktionen allein im Frontend schützen.
- Keine Verbindung zu TankstellenErtrag oder dessen Supabase-Projekten herstellen.

## Noch offen
1. Einen kostenlosen, sicheren Server-Endpunkt für signierte Uploads festlegen und in einem getrennten DiniLove-Konto/Projekt bereitstellen.
2. Authentifizierung mit genau einem Konto und ohne öffentliche Registrierung umsetzen.
3. Erst nach erfolgreicher Authentifizierung Upload, Bearbeiten und Löschen erlauben.
4. Galerie-Lesezugriff, Upload-Berechtigungen und Tagesüberraschungslogik testen.
5. Cloudinary-Free-Kontingente und eventuelle Grenzen vor produktivem Einsatz erneut prüfen.

## Status
Diese Datei dokumentiert nur die geplante Integration. Es wurden keine API-Schlüssel gespeichert, keine Bilder hochgeladen, kein kostenpflichtiger Tarif gebucht und keine Live-Dateien verändert.
