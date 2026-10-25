# DiniLove – Admin-Sicherheitsgrundlage

## Aktueller Stand
- `admin-demo.html` ist eine **öffentliche Demo**, kein echter Adminbereich.
- Formulareinträge und Galerieänderungen existieren nur im aktuellen Browser-Speicher; sie werden nicht dauerhaft gespeichert.
- Keine echten privaten Bilder oder personenbezogenen Daten in die Demo eingeben.
- Clientseitige Prüfungen sind Bedienungshilfe, keine Sicherheitsgrenze.

## Umsetzungsreihenfolge für einen echten Adminbereich
1. **Zugang schützen serverseitig:** Cloudflare Access vor dem Adminpfad oder eine gleichwertige serverseitige Authentifizierung. Kein fest eingebautes Passwort und keine Zugangsdaten im JavaScript.
2. **Admin und öffentliche Galerie trennen:** öffentliche Besucher dürfen nur veröffentlichte Werke lesen; nur authentifizierte Admin-Aktionen dürfen erstellen, ändern oder löschen.
3. **Speicherung mit minimalen Rechten:** private Bildablage und Datenbank nur über serverseitige Funktionen; Geheimnisse ausschließlich in geschützten Umgebungsvariablen.
4. **Uploads serverseitig prüfen:** Dateityp anhand des Inhalts, Größenlimit, zufällige Dateinamen und sichere Bildverarbeitung. Browserprüfungen niemals als alleinige Schutzmaßnahme verwenden.
5. **Datenschutz und Wiederherstellung:** nur notwendige Daten speichern, Löschprozess dokumentieren und Sicherungen/Wiederherstellung prüfen.
6. **Freigabetests:** nicht angemeldet darf niemand Admin-API oder private Dateien erreichen; manipulierte Requests, zu große Dateien und ungültige Formate müssen abgewiesen werden.

## In diesem Testzweig umgesetzt
- Demo-Upload akzeptiert nur als Bild deklarierte Dateien und begrenzt die Dateigröße auf 8 MB.
- Bei ungültiger oder zu großer Datei erscheint eine verständliche Meldung.
- Der Hinweistext beschreibt korrekt, dass es sich um eine lokale Demo handelt.

## Noch nicht umgesetzt / nicht behaupten
- Es gibt noch keine Anmeldung, Datenbank, private Speicherung oder serverseitige Autorisierung.
- Die 8-MB- und MIME-Prüfung im Browser ist **keine** serverseitige Sicherheitsprüfung.
- Cloudflare-Konfiguration und echte Zugangskontrollen benötigen die Einrichtung und Prüfung der entsprechenden Cloudflare-Umgebung.
