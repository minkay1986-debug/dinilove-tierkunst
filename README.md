# DiniLove Atelier – Tierkunst

Eine eigenständige, responsive statische Website für eine Tierkunst-Galerie.

## Wichtig
- Die Galerie enthält bewusst keine erfundenen Tierkunstwerke.
- Die sichtbaren Felder sind klar als Platzhalter markiert und müssen durch echte Zeichnungen ersetzt werden.
- Vor Veröffentlichung müssen eine echte Kontaktadresse sowie Impressum und Datenschutzerklärung ergänzt werden.
- Externe Schriftarten werden von Google Fonts geladen. Für eine vollständig externe-dienstfreie Variante sollten die Schriftdateien lokal eingebunden werden.
- Die Seite ist nicht mit Supabase verbunden und benötigt für den ersten statischen Entwurf keine Datenbank.
- Das Projekt ist unabhängig von Tankstellenertrag.

## Dateien
- `index.html`: Seitenstruktur und Texte
- `styles.css`: Gestaltung und responsive Layout
- `script.js`: mobiles Menü und Galeriefilter

## Lokal ansehen
Öffne `index.html` in einem Browser.

## GitHub Pages
1. Ein neues, separates GitHub-Repository anlegen, z. B. `dinilove-tierkunst`.
2. Diese Dateien in das Repository hochladen.
3. In GitHub unter Settings → Pages die Veröffentlichung aus dem gewünschten Branch (typischerweise `main`, Ordner `/root`) aktivieren.
4. Zuerst die GitHub-Pages-Adresse testen.
5. Erst wenn die Domain-Inhaberschaft und DNS-Verwaltung geklärt sind, eine Subdomain verbinden. Vorhandene DNS-Einträge nicht löschen oder überschreiben.

## Vor dem Livegang
- Echte Werke und Bildunterschriften ergänzen
- Kontaktadresse einsetzen
- Impressum und Datenschutzerklärung fachgerecht ergänzen
- Mobilansicht, Tastaturbedienung und Links testen


## Privates Atelier – Anforderungen (Entwicklungszweig)
- Genau ein privates Konto für die Künstlerin; keine öffentliche Registrierung.
- Besucher können die öffentliche Galerie ohne Anmeldung ansehen.
- Kontaktanfragen erfolgen über einen normalen `mailto:`-Link.
- Die Künstlerin darf ihre Werke, Bildtexte und Galerieinhalte selbst verwalten.
- Geplant sind 365 tägliche Überraschungen, automatisch nach Kalendertag freigeschaltet.
- Besondere Überraschungstermine:
  - 30. Oktober: Geburtstag
  - 24./25. Dezember: Weihnachtsüberraschung (Termin und gewünschter Weihnachtstag vor Umsetzung festlegen)
  - 16. Februar: Jahrestag
  - jeder 16. des Monats: Monatsüberraschung
- Wenn Jahrestag und Monatsüberraschung zusammenfallen, wird nur die Jahrestagsbotschaft angezeigt.
- Besondere Datumsregeln und Texte werden serverseitig geprüft; niemals private Botschaften oder Adminfunktionen nur im Frontend schützen.
- Die Vorschau im aktuellen Branch ist noch kein echtes Login und darf nicht als geschützter privater Bereich ausgegeben werden.
- Vor Aktivierung: Authentifizierung, Berechtigungen, Datenbank, Dateispeicher, Datumszeitzone und Zugriffstests implementieren.
