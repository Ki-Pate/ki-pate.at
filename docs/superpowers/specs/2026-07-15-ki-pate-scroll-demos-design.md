# KI-Pate: drei interaktive Mobile-Scroll-Demos

Datum: 15. Juli 2026  
Status: Nach unabhängiger Review überarbeitet; Freigabe durch Karl ausständig
Branch: `codex/scroll-demos`

## 1. Ziel und Entscheidung

Es entstehen drei isolierte, direkt vergleichbare Prototypen. Sie übernehmen die bestehende KI-Pate-CI, erzählen dieselben Use Cases und verwenden dieselbe technische Basis. Nur die räumliche Dramaturgie unterscheidet sich. So kann Karl Scrollgefühl, mobile Lesbarkeit, Animation, Rückwärtsscrollen, Fallbacks und Conversion selbst testen.

Die bestehende Startseite `index.html` bleibt in der Demo-Phase unverändert. Die drei Richtungen sind:

1. **A – Der stille Arbeitsfluss:** kontinuierliche Fahrt entlang einer präzisen Arbeitsmaschine.
2. **B – Der Betrieb im Schnitt:** vertikale Fahrt durch ein aufgeschnittenes Firmengebäude.
3. **C – Use-Case-Inseln:** isometrische Welt mit räumlichen Transfers zwischen Themeninseln.

### Preview-Isolation

- Alle Demo- und Entwicklungsdateien bleiben ausschließlich auf `codex/scroll-demos`.
- Die bestehende Deployment-Pipeline zieht nur `main`; der Demo-Branch wird weder gemerged noch über `deploy.php` veröffentlicht.
- Getestet wird in einem reproduzierbaren lokalen Preview-Webroot. Eine externe Preview oder ein Live-Deployment ist nicht Teil dieser Phase.
- Jede Demo erhält zusätzlich `<meta name="robots" content="noindex,nofollow,noarchive">`.
- Der Kontakt-CTA zeigt im Preview immer relativ auf `../../index.html#kontakt`; es gibt keinen abweichenden Live-Host.
- Vor einer späteren Integration wird entschieden, ob die Demo-Dateien entfernt oder ausdrücklich in die serverseitige Exclude-Liste aufgenommen werden. Ohne diese Entscheidung gibt es keinen Merge nach `main`.

## 2. Verbindliche Corporate Identity

`designsystem.md` ist die normative CI-Quelle; `index.html` und die aus `kipate-site.zip` entpackten Assets sind die aktuelle Referenzimplementierung. Die Demos führen keine neue Markenwelt ein.

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
- Keine generischen Roboter, Gehirn-Icons, Chatblasen, schwebenden KI-Kugeln oder Cyberpunk-Städte. Die im Designsystem erlaubten freundlichen Agenten-Roboter gelten nur für eigenständige Editorial-Comics und werden in diesen Demos nicht verwendet.
- Logo, Text und Interface bleiben echtes HTML und werden nie in KI-Medien eingebrannt.
- Bewegung ist langsam, präzise und funktional; keine aggressive Parallax-Show und kein Scroll-Jacking.
- Karl wird in generierten Previz-Medien nicht dargestellt. Falls er im HTML-Abschluss erscheint, wird ausschließlich ein vorhandenes echtes Portrait verwendet; seine Person wird nicht neu generiert oder verfremdet.

Visuelle Abnahme pro Demo:

1. ausschließlich definierte Farben, Fonts und Logos;
2. höchstens ein dominantes Teal-Aktionselement pro Viewport;
3. technische Hairlines, Passmarken und 3–8-Pixel-Radien statt Glassmorphism;
4. keine Emojis, Hover-Lifts oder generische SaaS-Kartenoptik;
5. Sie-Form, kurze aktive Sätze und „Beweis vor Behauptung“.

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

„83 E-Mails. 7 Entscheidungen.“ ist in allen Demos sichtbar als **BEISPIELTAG** gekennzeichnet und keine Behauptung über ein bestehendes Kundenprojekt.

Die Inhalte liegen einmalig in `demos/shared/content.js`. Stabile Scene-IDs sind `chaos`, `inbox`, `offer`, `meeting`, `knowledge` und `control`. Varianten dürfen nur räumliche Parameter, Medienreferenzen und Renderer ergänzen; Copy, CTA, Reihenfolge und Rechnerlogik dürfen nicht dupliziert werden.

## 4. Gemeinsame Funktionen

### Demo-Übersicht `/demos/`

- drei klar beschriftete Vorschaukarten;
- gleiche Bewertungsfragen: „Verstehe ich es sofort?“, „Fühlt es sich mobil natürlich an?“, „Wirkt Karl wie ein Systembauer?“;
- direkte Links in jede Demo und zurück zur Übersicht;
- klare Kennzeichnung als Previz, nicht als Live-Seite.

### Scroll-Erlebnis

- nativer Browser-Scroll ohne erzwungenes Snapping;
- Sticky-Vollbildbühne über exakt `600svh`; die Bühne selbst verwendet `100dvh`;
- sechs semantische Szenen steuern dieselbe normalisierte Zeitleiste;
- Vorwärts- und Rückwärtsscrollen aktualisieren Medium, räumliche Szene, Copy und Fortschritt in beide Richtungen;
- Motiv oben, Copy in einer kontrastgesicherten Ruhezone im unteren Drittel;
- sichtbare Fortschrittslinie, `01/06` und Szenenname;
- Fortschritt bleibt bei Rotation oder Größenänderung erhalten;
- Buttons und Links sind echte DOM-Elemente, keine dekorativen Canvas-Hotspots.

Die sechs Szenen belegen gleich große Segmente der globalen Zeitleiste. Ihre Test-Mittelpunkte liegen bei `0.0833`, `0.2500`, `0.4167`, `0.5833`, `0.7500` und `0.9167`; am jeweiligen Mittelpunkt muss die erwartete Scene-ID nach spätestens 250 ms aktiv sein. Browserleisten-Höhenänderungen verändern die `svh`-Scrollstrecke nicht; nur eine Breiten- oder Orientierungsänderung löst eine Neuberechnung aus.

### Panel „Demo testen“

- **Full:** zwei Videoebenen für die kurze Clip-Überblendung plus räumliche DOM-Effekte und maximal 24 dezente Partikel;
- **Lite:** genau eine aktive Videoebene, keine Partikel, kein `filter`/`backdrop-filter` und nur Opacity-/Translate-/Scale-Transforms;
- **Static:** sechs normale Posterabschnitte ohne Scrubbing;
- Anzeige von Szene, Gesamtfortschritt und Viewport-Klasse;
- „Zum Anfang“, „Nächste Szene“ und „Animation aus/ein“;
- Hinweis, wenn Reduced Motion oder Save-Data den Modus überschreibt.

Die Moduswahl wird nur in `sessionStorage` gespeichert und nicht übertragen. Priorität, von hoch nach niedrig:

1. Decode-/Seek-Fehler erzwingt Static.
2. `prefers-reduced-motion: reduce` erzwingt Static und verhindert bereits das Setzen von `video.src`.
3. „Animation aus“ erzwingt Static.
4. Save-Data überschreibt auch eine gespeicherte Full-/Lite-Wahl und startet ohne Video. Erst der separate Klick „Trotz Datensparmodus laden“ in der aktuellen Seitenansicht erlaubt danach Full/Lite.
5. Ohne Save-Data gilt eine bewusste Moduswahl in der aktuellen Sitzung.
6. Ohne Einschränkung und gespeicherte Wahl startet die Demo in Full.

Videos verwenden deshalb zunächst nur `data-src`; die Engine setzt `src` erst nach der Modusentscheidung.

### Mini Use-Case-Check

Der primäre CTA öffnet in jeder Demo denselben kleinen Funktionscheck:

1. Auswahl: E-Mail, Angebote, Meetings oder Firmenwissen; mindestens eine Auswahl ist erforderlich.
2. Eingabe: verlorene Teamstunden pro Woche als Ganzzahl von 1 bis 80.
3. Ausgabe: konservativer Prüfbereich in Stunden pro Jahr, keine erfundene Euro-Garantie.
4. Optionaler Übergang zu `../../index.html#kontakt` innerhalb des lokalen Preview-Webroots.

Es werden keine Daten gesendet.

Formel: `Wochenstunden × 46 Arbeitswochen × 0,20` bis `Wochenstunden × 46 × 0,40`; beide Grenzen werden auf ganze Stunden gerundet. Die Use-Case-Auswahl ändert die Ergebnisformulierung, nicht den Faktor. Die Oberfläche kennzeichnet 20–40 Prozent sichtbar als **illustrative Modellannahme für die Demo, keine gemessene Einsparung**; Karl gibt diesen Korridor mit der Spec frei oder ändert ihn vor der Umsetzung. Verbindliche Testvektoren: 10 Stunden ergeben `92–184 Stunden/Jahr`, 20 Stunden ergeben `184–368 Stunden/Jahr`; 0, 81 und nichtnumerische Eingaben sind ungültig.

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

Die Demos testen die spätere Medienmechanik mit einer echten Zwei-Clip-Vertikalscheibe, ohne drei vollständige Filmketten vorwegzunehmen. Nach Freigabe entstehen pro Richtung:

1. drei native 9:16-Keyframes mit Higgsfield GPT Image 2;
2. zwei zusammenhängende, exakt 6,0 Sekunden lange Previz-Clips mit Higgsfield Seedance 2.0;
3. ein daraus abgeleitetes Poster für den sofortigen ersten Paint.

Der tatsächliche letzte Frame von Clip 1 ist der Startframe von Clip 2. Alle sechs Vergleichsclips haben bei 30 fps exakt 180 Frames. Beide Clips werden über die Scrollposition vor- und rückwärts gescrubbt; der Wechsel liegt bei globalem Fortschritt `0.5`. Die sechs HTML-Szenen liegen darüber und testen Interaktion, Clipwechsel, Naht und Fehler-Fallback. Ein reiner Unit-Test simuliert zusätzlich fünf Clips und verifiziert das Laden/Entladen von `current ± 1`; die Zwei-Clip-Demo selbst beweist keine Langzeit-Speicherstabilität einer finalen Sechs-Clip-Kette. Erst nach Auswahl einer Richtung entsteht die vollständige 9:16-Kette und danach eine eigene 16:9-Desktopkette.

Medienvorgaben:

- 9:16 Master, Delivery 720 × 1280, H.264, konstante 30 fps, `yuv420p`, SDR/Rec.709 und ohne Audio;
- CRF 23–24, GOP 4, `keyint_min 4`, Scene-Cut-Keyframes aus und `faststart`;
- Poster WebP, Zielgröße unter 220 KB;
- maximal 2,5 MB pro Clip und 5 MB pro Demo; höchstens drei Videoelemente und 7,5 MB Blob-Daten gleichzeitig;
- Engine maximal 25 KB gzip, gesamtes initiales JavaScript maximal 70 KB gzip;
- Motiv-Safe-Zone in den mittleren 70–75 Prozent;
- Medium rein dekorativ mit `aria-hidden="true"`;
- keine eingebrannten Logos, Texte oder UI;
- bei Lade-, Decode- oder Seek-Fehler bleibt Poster/Static vollständig nutzbar.
- Poster wird mit hoher Priorität geladen; Videos erst nach erstem Paint und Modusentscheidung.
- Videoelemente tragen `muted`, `playsinline` und initial `preload="none"`; nach Modusfreigabe wechselt Preload auf `metadata`.
- Auf iOS werden aktiver und nächster Clip nach der ersten Nutzerinteraktion kurz per `play()`/`pause()` geprimed. Erfolgt die Interaktion vor dem Laden, wird der Aktivierungsstatus gemerkt und das Priming unmittelbar nach `loadedmetadata` nachgeholt. Ein abgelehntes Play-Promise wird einmal bei der nächsten Interaktion erneut versucht; Decode-/Media-Fehler wechseln sofort zu Static. Das Poster bleibt bis zum ersten gemalten Frame sichtbar.

Vorhandene KI-Pate-Assets dienen als Art-Direction-Referenz und werden nicht überschrieben.

Fester Dateivertrag je Slug (`arbeitsfluss`, `betrieb-im-schnitt`, `use-case-inseln`): `keyframe-01.webp`, `keyframe-02.webp`, `keyframe-03.webp`, `clip-01.mp4`, `clip-02.mp4` und `poster.webp`. `media-manifest.js` enthält Pfad, Bytes, Dauer, Framezahl und SHA-256; die Tests vergleichen Manifest und tatsächliche Dateien.

## 7. Technische Struktur

Die ausgelieferte Website bleibt build-freies, statisches HTML/CSS/JavaScript auf der bestehenden Apache/PHP-Basis. Das Repository enthält Assets und Fonts nur in `kipate-site.zip`; deshalb erhält die Demo reproduzierbares, rein lokales Entwicklungs-Tooling.

```text
demos/
├── index.html
├── shared/
│   ├── ci.css
│   ├── demo-shell.css
│   ├── content.js
│   ├── media-manifest.js
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
│   └── renderer.js
├── betrieb-im-schnitt/
│   ├── index.html
│   ├── demo.css
│   └── renderer.js
└── use-case-inseln/
    ├── index.html
    ├── demo.css
    └── renderer.js

tools/
├── prepare-preview.mjs
└── serve-preview.mjs

tests/
├── demos.spec.mjs
└── scroll-engine.test.mjs

package.json
package-lock.json
playwright.config.mjs
.gitignore                  # .preview/, node_modules/, test-results/, playwright-report/
```

Reproduzierbarer Ablauf in einem frischen Checkout:

```powershell
npm ci
npx playwright install chromium
npm run test:demos          # Prepare + Server-Start/-Stop über Playwright webServer
npm run preview             # optional danach: blockierender manueller Server auf 127.0.0.1:43110
```

`test:demos` ruft `preview:prepare` auf; Playwright `webServer` startet und beendet `serve-preview.mjs` selbst. `prepare-preview.mjs` kopiert die branch-eigenen HTML/CSS/JS-Dateien in `.preview/`, entpackt `assets/` und `presse/` aus `kipate-site.zip` und verändert keine getrackte Datei. Das Preview-Skript prüft vor dem Start die erwarteten Font-, Logo- und Posterdateien. Node/Playwright sind nur Entwicklungswerkzeuge und werden nicht in die Website ausgeliefert.

Gemeinsame Engine:

- passiver Scrolllistener aktualisiert nur den Zielwert;
- `requestAnimationFrame` berechnet Szene, lokalen Fortschritt und CSS-Variablen;
- Video-Seeks werden auf den neuesten Zielwert zusammengefasst;
- `requestVideoFrameCallback()` bestätigt gemalte Frames, `seeked` dient als Fallback;
- während `video.seeking` wird kein weiterer Seek gestartet; nur das neueste Ziel bleibt vorgemerkt;
- Seek-Epsilon mindestens ein Frame (`33 ms`), Clipende maximal `duration - 1 Frame`;
- bei Tab-Wechsel pausiert die Engine und synchronisiert beim Zurückkehren neu;
- jede Demo implementiert nur räumliche Parameter und einen visuellen Renderer.

Bewusst nicht enthalten:

- kein Three.js/WebGL;
- keine Drittanbieter-Animationbibliothek;
- keine Änderungen an `index.html`, Kontakt-PHP, Tracking, Sitemap oder Live-Navigation;
- keine Speicherung oder Übertragung der Testeingaben;
- keine dreifach kopierte Engine, CI, Copy oder Rechnerlogik.

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
- Skip-Link „Zur statischen Inhaltsansicht“ als erstes fokussierbares Element.
- Der Use-Case-Dialog übernimmt den Fokus, schließt mit Escape, setzt den Hintergrund auf `inert` und gibt den Fokus an den auslösenden CTA zurück; Fokuszustände bleiben deutlich sichtbar.

## 9. Abnahmekriterien

Eine Demo gilt nur als testbar, wenn:

1. `/demos/` und alle drei direkten URLs liefern Status 200, `text/html` und die korrekte `data-demo-id`; `/demos/__missing__/` liefert Status 404 und darf nicht als Demo gelten.
2. Jede Demo sechs identische Inhalte und eine andere räumliche Dramaturgie zeigt.
3. Jeder definierte Timeline-Mittelpunkt aktiviert innerhalb 250 ms die erwartete Scene-ID; Fast-Flick auf den letzten Mittelpunkt und unmittelbarer Rücksprung auf den ersten bestehen jeweils dreimal hintereinander.
4. Full, Lite und Static umschaltbar sind; Reduced Motion verhindert jeden MP4-Request, Save-Data startet ohne MP4-Request und ein bewusster Klick kann dort Lite/Full laden.
5. beide CTAs per Touch und Tastatur erreichbar sind.
6. der Mini Use-Case-Check erfüllt die drei Testvektoren. Nach `networkidle` und ab der ersten Eingabe gilt bis zum bewussten Kontakt-Klick eine Request-Allowlist mit null neuen Requests; Eingabewerte dürfen weder URL/History noch Request, Storage oder Log verlassen.
7. bei 320, 390, 768 und 1440 Pixel kein horizontaler Overflow entsteht.
8. Console Errors, Page Errors, fehlgeschlagene Requests, Asset-404, Decode-Fehler und ein nicht gesetztes `data-frame-ready` an den Prüfpunkten schlagen den Test fehl; schwarze/weiße Frames und Nähte werden zusätzlich visuell auf echten Geräten geprüft.
9. Ein Browserkontext mit deaktiviertem JavaScript zeigt sechs Scene-Überschriften und beide CTAs; Static enthält dieselben Scene-IDs.
10. `index.html` unverändert bleibt.
11. CI-Review besteht die fünf Kriterien aus Abschnitt 2; Copy und Rechnerkonfiguration sind per Test in allen drei Routen identisch.
12. Bei einer simulierten Rotation am Mittelpunkt von `meeting` bleiben Scene-ID und globaler Fortschritt mit einer Abweichung von höchstens `0.02` erhalten; derselbe Check wird auf einem echten Mobilgerät einmal Portrait → Landscape → Portrait wiederholt.

Automatisierte Playwright-Checks prüfen Status/MIME/Sentinels, Timeline, Fast-Flick, Rückwärtsscrollen, Rotation, Moduspriorität, beobachtbare Full-/Lite-Unterschiede, CTA-Dialog, Rechner, Request-Allowlist, No-JS und Responsive-Overflow. Screenshots bei 390 × 844 und 1440 × 900 werden visuell geprüft. Zusätzlich erfolgt ein manueller Durchlauf auf Safari/iPhone und Chrome auf einem Android-Mittelklassegerät: Portrait, Rotation in Szene 04, Browserleiste, Hintergrund/Resume, langsames Scrollen, Fast-Flick, Rückwärtslauf, Naht und schwarzer Frame.

## 10. Reihenfolge nach Freigabe

1. Reproduzierbares Preview-Tooling, gemeinsame Content-Datei, Static-Fallback und Testskelett bauen.
2. Eine vollständige technische Vertikalscheibe von A mit zwei Clips, Moduspriorität und Use-Case-Check umsetzen.
3. A automatisiert sowie auf iPhone und Android-Mittelklasse abnehmen; erst danach die gemeinsame Engine einfrieren.
4. B und C als reine Renderer-/Medienvarianten derselben Engine und Inhalte umsetzen.
5. Pro Richtung drei Higgsfield-Keyframes und zwei Previz-Clips einbinden.
6. Gesamte Browser-, CI- und Geräteabnahme durchführen und Vergleichsempfehlung übergeben.

Erst nach Karls Auswahl wird eine Richtung zur vollständigen Website ausgebaut und separat deployed.
