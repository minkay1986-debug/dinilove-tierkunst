# DiniLove – Entscheidungsvorlage Anmeldung und Speicherung

## Vorschlag für den nächsten Testaufbau
- Cloudflare Access One-Time PIN (E-Mail-Code) für genau die zugelassene Admin-Adresse verwenden, sofern die Access-Konfiguration im bestehenden Konto verfügbar ist.
- Öffentliche Galerie und Admin-Oberfläche getrennt behandeln: der öffentliche GitHub-Pages-Origin darf nicht pauschal geschützt werden. Der private Admin-Endpunkt muss bei jeder Anfrage die Access-Identität prüfen und exakt die konfigurierte Admin-Adresse erlauben.
- Cloudflare Worker + D1 nur im Free-Tarif testen. D1 Free beinhaltet derzeit 5 Mio. gelesene Zeilen/Tag, 100.000 geschriebene Zeilen/Tag und insgesamt 5 GB; bei Überschreitung schlagen entsprechende Datenbankoperationen fehl. Workers Free: 100.000 Requests/Tag; bei Überschreitung liefert Cloudflare Fehler 1027. Kostenlimits vor Nutzung im Dashboard kontrollieren.
- Cloudinary bleibt Bilddatei-Speicher; keine API-Secrets im Frontend. Signierte Uploads erst nach nachgewiesener Admin-Authentifizierung.

## Kritische Authentifizierungsdetails
Cloudflare Access kann E-Mail-One-Time-PINs anbieten und vor einem Worker authentifizieren. Der Worker muss trotzdem prüfen, ob die von Access verifizierte E-Mail exakt dem privaten Admin-Allowlist-Wert entspricht. Nicht allein auf CORS oder ein im Browser gespeichertes Flag vertrauen.

## Status und Grenzen
- Nur Plan/Schema/Datumslogik in einem Entwicklungszweig; nichts deployed.
- Die Schema-Datei ist eine Migration für eine **neue, separate DiniLove-D1-Datenbank**, keine Anweisung, eine vorhandene Datenbank zu verändern.
- Noch keine echte Anmeldung, keine Session und kein Upload-Endpunkt aktiviert.
- Keine Zahlung, kein Upgrade, keine Zahlungsmethode erforderlich oder eingerichtet.
- Die E-Mail-Adresse wird nicht in diesen öffentlichen Dateien wiederholt.
- Die Datumslogik behandelt den 16. Februar als Jahrestag, 30. Oktober als Geburtstag und 24. Dezember als Weihnachten. Jahrestag hat Vorrang vor der monatlichen Überraschung.

## Access-JWT-Prüfung im Testzweig
Der Worker-Scaffold prüft den Access-Assertion-Header kryptografisch (RS256), validiert Issuer/Audience/Ablaufzeit und erlaubt nur die konfigurierte, verifizierte Admin-E-Mail. `/api/admin/me` ist der einzige vorläufige Identitäts-Endpunkt. Der Worker ist **noch nicht deployt** und muss hinter Cloudflare Access betrieben werden; ein direkter Zugriff ohne Access-Gate ist nicht als geschützt anzusehen. Content-, Upload- und Mutationsrouten bleiben geschlossen.
