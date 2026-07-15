# KI-Pate: drei interaktive Mobile-Scroll-Demos

Datum: 15. Juli 2026  
Status: Entwurf zur Freigabe  
Branch: `codex/scroll-demos`

## 1. Ziel und Entscheidung

Es entstehen drei isolierte, direkt vergleichbare Prototypen. Sie übernehmen die bestehende KI-Pate-CI, erzählen dieselben Use Cases und verwenden dieselbe technische Basis. Nur die räumliche Dramaturgie unterscheidet sich. So kann Karl Scrollgefühl, mobile Lesbarkeit, Animation, Rückwärtsscrollen, Fallbacks und Conversion selbst testen.

Die bestehende Startseite `index.html` bleibt in der Demo-Phase unverändert. Die drei Richtungen sind:

1. **A – Der stille Arbeitsfluss:** kontinuierliche Fahrt entlang einer präzisen Arbeitsmaschine.
2. **B – Der Betrieb im Schnitt:** vertikale Fahrt durch ein aufgeschnittenes Firmengebäude.
3. **C – Use-Case-Inseln:** isometrische Welt mit räumlichen Transfers zwischen Themeninseln.

## 2. Verbindliche Corporate Identity

Die Demos übernehmen die CI aus `index.html` und `/assets`; sie führen keine neue Markenwelt ein.

### Farben

| Rolle | Token | Wert |
|---|---|---|
| Grundfläche | `--bg` | `#10141B` |
| Panel | `--panel` | `#151A23` |
| Tiefes Panel | `--panel2` | `#12161E` |
| Kapitel | `--chapter` | `#0A0D12` |
| Primärtext | `--ink` | `#EDEBE3` |
| Sekundärtext | `--muted` | `#9BA3AD` |
| Metadaten | `--faint` | `#6B7683` |
| Technik | `--tech` | `#6FA3AD` |
| Akzent | `--acc` | `#2BC8B7` |
| Akzent Hover | `--acc-hi` | `#48E2D1` |

Erlaubt sind transparente Abstufungen und Schwarz für Tiefe. Kein Violett, kein neues Neon-Lime und keine beliebigen Verlaufspaletten. Warmes Amber darf nur als Licht in Bildern vorkommen, nicht als zweite UI-Akzentfarbe.

### Typografie und Geometrie

- Headlines: selbst gehostetes **Space Grotesk**, Gewicht 600–650.
- Fließtext: selbst gehostetes **IBM Plex Sans**, Gewicht 400/600.
- Labels, Indizes und technische Daten: selbst gehostetes **IBM Plex Mono**, Gewicht 400/500.
- Mobil 28 Pixel Außenabstand, 64 Pixel Header, Touchziele mindestens 44 × 44 Pixel.
- Ecken überwiegend 3–8 Pixel; keine runden SaaS-Kartenlandschaften.
- 72-Pixel-Konstruktionsraster, feine 1-Pixel-Linien und `+`-Passmarken.
- Logo ausschließlich aus `/assets/logo-mono.webp` und `/assets/logo-ki-pate.webp`.

### Bild- und Bewegungssprache

- Carbon, dunkles Metall, Papier, technische Pläne, glaubwürdige Geräte und ruhiges Licht.
- Teal markiert aktive Prozesse, Quellen, Fortschritt und Freigaben; kein Dauer-Glow.
- Keine Roboter, Gehirn-Icons, Chatblasen, schwebenden KI-Kugeln oder Cyberpunk-Städte.
- Logo, Text und Interface bleiben echtes HTML und werden nie in KI-Medien eingebrannt.
- Bewegung ist langsam, präzise und funktional; keine aggressive Parallax-Show und kein Scroll-Jacking.

## 3. Identischer Inhalt in allen Demos

| Szene | Bekanntes Problem | Sichtbare Lösung | Kernaussage |
|---|---|---|---|
| 01 · Chaos | Montagmorgen, E-Mails, Notizen, Anfragen | Eingänge werden erkannt und geordnet | **KI, die Arbeit wirklich abnimmt.** |
| 02 · Posteingang | 83 Nachrichten, unklare Priorität | sortieren, zusammenfassen, Antworten vorbereiten | **83 E-Mails. 7 Entscheidungen.** |
| 03 · Angebot | Anfrage, Anhang, Kunden- und Preisdaten | Angebotsentwurf und CRM-Eintrag entstehen | **Die Anfrage kommt. Das Angebot wartet schon.** |
| 04 · Meeting | Gespräch vorbei, Nacharbeit beginnt | Entscheidungen, Aufgaben und Termine werden extrahiert | **Das Meeting endet. Die Nacharbeit auch.** |
| 05 · Wissen | Information steckt in Dateien und Köpfen | Antwort erscheint mit überprüfbaren Quellen | **Antworten mit Quelle. Nicht mit Bauchgefühl.** |
| 06 · Kontrolle | Sorge vor Blackbox und Datenschutz | menschliche Freigabe, DSGVO und On-Premise | **Die KI arbeitet. Sie entscheiden.** |

Abschlussbeweis in jeder Variante:

> 25+ Jahre Technik · 2 KI-Plattformen live · Pilot in 4–6 Wochen

Primärer CTA: **Meine Use Cases finden**  
Sekundärer CTA: **30 Minuten KI-Sprechstunde**

## 4. Gemeinsame Funktionen

### Demo-Übersicht `/demos/`

- drei klar beschriftete Vorschaukarten;
- gleiche Bewertungsfragen: „Verstehe ich es sofort?“, „Fühlt es sich mobil natürlich an?“, „Wirkt Karl wie ein Systembauer?“;
- direkte Links in jede Demo und zurück zur Übersicht;
- klare Kennzeichnung als Previz, nicht als Live-Seite.

### Scroll-Erlebnis

- nativer Browser-Scroll ohne erzwungenes Snapping;
- Sticky-Vollbildbühne über ungefähr `600dvh`;
- sechs semantische Szenen steuern dieselbe normalisierte Zeitleiste;
- Vorwärts- und Rückwärtsscrollen aktualisieren Medium, räumliche Szene, Copy und Fortschritt in beide Richtungen;
- Motiv oben, Copy in einer kontrastgesicherten Ruhezone im unteren Drittel;
- sichtbare Fortschrittslinie, `01/06` und Szenenname;
- Fortschritt bleibt bei Rotation oder Größenänderung erhalten;
- Buttons und Links sind echte DOM-Elemente, keine dekorativen Canvas-Hotspots.

### Panel „Demo testen“

- **Full:** Video-Scrubbing plus räumliche DOM-Effekte;
- **Lite:** Poster/Video mit reduzierten Ebenen und ohne Partikel;
- **Static:** sechs normale Posterabschnitte ohne Scrubbing;
- Anzeige von Szene, Gesamtfortschritt und Viewport-Klasse;
- „Zum Anfang“, „Nächste Szene“ und „Animation aus/ein“;
- Hinweis, wenn Reduced Motion oder Save-Data den Modus überschreibt.

Die Moduswahl wird nur lokal im Browser gespeichert und nicht übertragen.

### Mini Use-Case-Check

Der primäre CTA öffnet in jeder Demo denselben kleinen Funktionscheck:

1. Auswahl: E-Mail, Angebote, Meetings oder Firmenwissen.
2. Eingabe: grob verlorene Teamstunden pro Woche.
3. Ausgabe: konservativer Prüfbereich in Stunden pro Jahr, keine erfundene Euro-Garantie.
4. Optionaler Übergang zu `/index.html#kontakt`.

Es werden keine Daten gesendet.

## 5. Drei räumliche Richtungen

### A – Der stille Arbeitsfluss

Eine präzise Arbeitsmaschine auf einem dunklen Konstruktionstisch. Papier, E-Mail-Karten und Datenmodule bewegen sich auf klaren Spuren von Eingang zu Ergebnis. Die Kamera fährt kontinuierlich vorwärts; jede Szene ist eine Station derselben Maschine.

- stärkste Verbindung zu Karls Ingenieurs- und Builder-Positionierung;
- Teal leuchtet nur an der aktiven Verarbeitung oder Freigabe;
- sichtbarer menschlicher Freigabepunkt in Szene 06;
- ruhige Vorwärtsfahrt und leichte Tiefenstaffelung;
- jedes Objekt braucht eine sofort verständliche Alltagsfunktion.

### B – Der Betrieb im Schnitt

Ein vertikales, gläsern-metallisches Firmengebäude im Querschnitt. Jede Etage steht für denselben Use Case wie in A. Beim Scrollen fährt die Kamera nach oben, richtet sich auf eine Etage aus und zeigt den konkreten Vorher-Nachher-Prozess.

- natürliche mobile Vertikallogik;
- Orientierung über Etagenanzeige und aktive Beleuchtung;
- Szene 06 als Technik-/Kontrollraum, nicht als magische Kommandozentrale;
- vertikale Fahrt, kurze Annäherung, ruhige Haltephase;
- darf nicht wie eine verspielte Miniaturstadt wirken.

### C – Use-Case-Inseln

Eine isometrische KI-Pate-Landkarte mit sechs technisch gestalteten Inseln. Die Kamera zieht kurz heraus, wechselt zur nächsten Insel und taucht wieder ein. Diese Variante ist der YouTube-Referenz am nächsten.

- stärkster Showreel- und Entdeckungscharakter;
- jede Insel hat eine eindeutige Silhouette und ein einziges Prozessmotiv;
- feste Route statt freier Navigation auf Mobil;
- kontrolliertes Herausziehen, Transfer und Eintauchen;
- höchstes Risiko für sichtbare Nähte, Medienlast und verspielt wirkende Darstellung.

## 6. Higgsfield-Previz

Die Demos testen die spätere Medienmechanik, ohne drei vollständige Filmketten vorwegzunehmen. Nach Freigabe entstehen pro Richtung:

1. ein natives 9:16-Keyvisual mit Higgsfield GPT Image 2;
2. ein zusammenhängender 6–8-Sekunden-Previz-Clip mit Higgsfield Seedance 2.0;
3. ein daraus abgeleitetes Poster für den sofortigen ersten Paint.

Der Clip wird über die Scrollposition vor- und rückwärts gescrubbt. Die sechs HTML-Szenen liegen darüber und testen die komplette Interaktion. Erst nach Auswahl einer Richtung entsteht eine vollständige 9:16-Clipkette; anschließend eine eigene 16:9-Desktopkette.

Medienvorgaben:

- 9:16 Master, Delivery 720 × 1280, H.264, 30 fps, ohne Audio;
- Poster WebP, Zielgröße unter 220 KB;
- Motiv-Safe-Zone in den mittleren 70–75 Prozent;
- Medium rein dekorativ mit `aria-hidden="true"`;
- keine eingebrannten Logos, Texte oder UI;
- bei Lade-, Decode- oder Seek-Fehler bleibt Poster/Static vollständig nutzbar.

Vorhandene KI-Pate-Assets dienen als Art-Direction-Referenz und werden nicht überschrieben.

## 7. Technische Struktur

Die Website bleibt build-freies, statisches HTML/CSS/JavaScript auf der bestehenden Apache/PHP-Basis.

```text
demos/
├── index.html
├── shared/
│   ├── ci.css
│   ├── demo-shell.css
│   ├── scroll-engine.js
│   ├── demo-controls.js
│   └── use-case-check.js
├── media/
│   ├── arbeitsfluss/
│   ├── betrieb-im-schnitt/
│   └── use-case-inseln/
├── arbeitsfluss/
│   ├── index.html
│   ├── demo.css
│   └── scenes.js
├── betrieb-im-schnitt/
│   ├── index.html
│   ├── demo.css
│   └── scenes.js
└── use-case-inseln/
    ├── index.html
    ├── demo.css
    └── scenes.js
```

Gemeinsame Engine:

- passiver Scrolllistener aktualisiert nur den Zielwert;
- `requestAnimationFrame` berechnet Szene, lokalen Fortschritt und CSS-Variablen;
- Video-Seeks werden auf den neuesten Zielwert zusammengefasst;
- `requestVideoFrameCallback()` bestätigt gemalte Frames, `seeked` dient als Fallback;
- Ende wird einen Frame vor Clipende begrenzt;
- bei Tab-Wechsel pausiert die Engine und synchronisiert beim Zurückkehren neu;
- jede Demo implementiert nur eigene Szenendaten und einen visuellen Renderer.

Bewusst nicht enthalten:

- kein Three.js/WebGL;
- keine Drittanbieter-Animationbibliothek;
- keine Änderungen an `index.html`, Kontakt-PHP, Tracking, Sitemap oder Live-Navigation;
- keine Speicherung oder Übertragung der Testeingaben;
- keine dreifach kopierte Engine oder CI.

## 8. Mobile, Accessibility und Fallbacks

- Master-Viewport 390 × 844; zusätzlich 320 Pixel und große Smartphones.
- `viewport-fit=cover` und Safe-Area-Padding.
- Primärtext mindestens 16 Pixel; `--faint` nur für entbehrliche Metadaten.
- Kontrast über feste Scrims, nicht abhängig vom Videoframe.
- korrekte Überschriftenhierarchie und semantische Szenen in Dokumentreihenfolge.
- vollständige Tab-Navigation; optionale Pfeiltasten für Szene vor/zurück.
- `prefers-reduced-motion` lädt standardmäßig kein Scrub-Video und zeigt Static.
- ohne JavaScript bleiben alle sechs Use Cases und CTAs linear lesbar.
- kein Flackern und keine unsichtbaren fokussierbaren Elemente.

## 9. Abnahmekriterien

Eine Demo gilt nur als testbar, wenn:

1. `/demos/` und alle drei direkten URLs lokal funktionieren.
2. Jede Demo sechs identische Inhalte und eine andere räumliche Dramaturgie zeigt.
3. langsames Scrollen, Fast-Flick und sofortiges Zurückscrollen korrekt landen.
4. Full, Lite und Static umschaltbar sind; Reduced Motion Full korrekt überschreibt.
5. beide CTAs per Touch und Tastatur erreichbar sind.
6. der Mini Use-Case-Check berechnet und keine Daten sendet.
7. bei 320, 390, 768 und 1440 Pixel kein horizontaler Overflow entsteht.
8. keine JavaScript-Fehler, fehlenden Assets oder schwarzen Videoframes auftreten.
9. Inhalt ohne JavaScript lesbar und Static vollständig ist.
10. `index.html` unverändert bleibt.

Automatisierte Browserchecks prüfen URLs, Szenenwechsel, Modusschalter, CTA-Dialog, Berechnung und Responsive-Overflow. Screenshots bei 390 × 844 und 1440 × 900 werden zusätzlich visuell geprüft.

## 10. Reihenfolge nach Freigabe

1. Gemeinsame CI, Shell, Scroll-Engine und Testpanel bauen.
2. Drei räumliche DOM-Previz-Renderer implementieren.
3. Drei Higgsfield-Keyvisuals und drei kurze Previz-Clips erzeugen und einbinden.
4. Mini Use-Case-Check ergänzen.
5. Mobile- und Desktop-Browserchecks ausführen und Fehler beheben.
6. Test-URLs und Vergleichsempfehlung übergeben.

Erst nach Karls Auswahl wird eine Richtung zur vollständigen Website ausgebaut und separat deployed.
