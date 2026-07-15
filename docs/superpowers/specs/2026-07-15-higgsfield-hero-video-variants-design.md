# Higgsfield Hero Video Variants — Design

## Ziel

Für die neue persönliche Portfolio-Website von Karl Pilz werden drei fotorealistische Hero-Videos erzeugt. Sie sollen Karl als nahbaren KI-Experten für KMU-Inhaber und Führungskräfte positionieren und als Auswahlgrundlage für den finalen Website-Hero dienen.

Die Referenz ist die Wirkung der Website-Sequenz ab 14:21 im bereitgestellten YouTube-Video: Ein Fullscreen-Video läuft während des Scrollens weiter, die große Hero-Überschrift wird transparent und anschließend werden Text und Kontakt-CTA eingeblendet. Farben, Produktmotive und Markenstil der Referenz werden nicht übernommen.

## Umfang und Phasengrenze

Diese Spezifikation und der anschließende Umsetzungsplan umfassen ausschließlich Phase 1: drei fotorealistische Desktop-Auswahlvideos inklusive Ausgangsframes, Qualitätsprüfung, lokaler Ablage und drei sichtbarer Vergleichslinks.

Eine 9:16-Mobilversion und die Integration des gewählten Videos in die Website sind eine spätere Phase nach Karls Variantenauswahl. Headline, Nutzenversprechen, Beweiszeile und CTA-Texte sind deshalb nicht Teil dieses Plans. Der Abschnitt „Website-Effekt nach Auswahl“ dokumentiert nur die beabsichtigte spätere Verwendung und erzeugt in Phase 1 keine Implementierungsaufgabe.

## Gemeinsame visuelle Regeln

- Fotorealistisch und filmisch, nicht illustrativ oder wie ein generisches KI-Stockmotiv.
- Identitätsreferenz: `.preview/assets/karl-pilz-ki-berater-salzburg.webp`.
- Karl bleibt eindeutig erkennbar: Brille, rotblonder Bart, Frisur und natürliche Gesichtsproportionen.
- Ausdruck: freundlich, ruhig, kompetent und zugänglich; kein grimmiger Blick.
- Kleidung: modernes dunkles Sakko oder dunkles Overshirt mit offenem Kragen; ausdrücklich keine Krawatte.
- Einziger Farbakzent ist das bestehende CI-Türkis `#2BC8B7`. Alle übrigen Farben bleiben neutral: Schwarz, Graphit und dezentes Off-White.
- Kein violetter Neon-Look, keine Regenbogenfarben, keine Roboter-Klischees und kein Terminator-/Horror-Look.
- Keine generierte Schrift, keine Logos und keine lesbaren UI-Texte im Video. Typografie und CTA werden später als HTML überlagert.
- Karl steht überwiegend im rechten Bilddrittel. Die linke Bildhälfte bleibt ruhig genug für Headline und CTA.
- Mindestens die linken 42 Prozent des Bildes bleiben detailarm; dort dürfen keine Gesichter, Hände oder kontrastreichen Hauptobjekte erscheinen.
- Bewegungen bleiben langsam und hochwertig: dezenter Kamerazug, klare Tiefenstaffelung, kontrollierte Partikel und keine hektischen Schnitte.

## Technisches Format der Auswahlrenders

- Modell: Higgsfield Seedance 2.0.
- Ausgangsframes: drei separate fotorealistische 16:9-Kompositionen mit Nano Banana Pro auf Basis der Identitätsreferenz.
- Format: 16:9, 1920 × 1080, acht Sekunden, ohne Audio.
- Schleifenfähigkeit: Der jeweilige Ausgangsframe wird auch als Endreferenz verwendet; die Bewegung kehrt am Ende in eine nahezu identische Ruheposition zurück.
- Die drei Auswahlrenders sind Desktop-Vorschauen. Erst für die gewählte Variante wird zusätzlich eine eigenständige 9:16-Mobilversion erzeugt.
- Lokale Ablage: `.preview/higgsfield/hero-videos/` mit `hero-a-human-machine-1080p.mp4`, `hero-b-ai-workbench-1080p.mp4`, `hero-c-chaos-to-system-1080p.mp4` sowie den drei zugehörigen Ausgangsframes.
- Auslieferungsformat: MP4/H.264, `yuv420p`, ohne Audiospur und mit `faststart`; falls Higgsfield ein anderes MP4-Profil liefert, wird die lokale Vergleichskopie verlustarm webtauglich transkodiert.

## Variante A — Human × Machine

Karl steht freundlich und ruhig im rechten Bilddrittel vor einem tiefen graphitfarbenen Raum. Ein kontrollierter türkiser Lichtimpuls fährt über eine Gesichtshälfte und die Schulter und legt dort kurz elegante, anatomisch glaubwürdige biomechanische Details frei. Feine Partikel und Lichtbahnen liegen in mehreren Tiefenebenen. Die Transformation bleibt hochwertig, subtil und menschlich; sie bildet die Brücke zwischen persönlicher Beratung und technischer Kompetenz.

Bewegungsbogen:

1. Ruhiges Porträt und sehr langsamer Kamerazug.
2. Türkiser Lichtimpuls enthüllt die dezente Human-Machine-Struktur.
3. Licht und Partikel beruhigen sich; Karl kehrt optisch in die Anfangsposition zurück.

## Variante B — AI Workbench

Karl steht in einem glaubwürdigen, modernen Arbeitsraum und orchestriert ein abstraktes KI-System. Halbtransparente Ebenen, Datenpfade und Prozessknoten schweben räumlich um ihn, ohne wie ein Science-Fiction-Dashboard auszusehen. Ein langsamer Kamerabogen erzeugt Tiefe. Die Bildaussage lautet: Karl baut und steuert produktive Systeme, statt nur über KI zu sprechen.

Alle Prozessknoten bleiben textlose geometrische Formen; es erscheinen keine pseudo-lesbaren Interface-Fragmente.

Bewegungsbogen:

1. Karl betrachtet ruhig ein einzelnes türkises Prozesssignal.
2. Daraus entfaltet sich ein geordnetes Netz aus abstrakten Workflow-Ebenen.
3. Die Ebenen verdichten sich zu einem klaren System und fahren wieder in die Ruheposition zurück.

## Variante C — Vom Chaos zum System

Karl bleibt als ruhiger Anker im rechten Bilddrittel. Unscharfe, abstrakte Fragmente für E-Mail, Dokumente, Meetings und Aufgaben treiben zunächst ungeordnet durch den Raum. Ein türkiser Impuls ordnet sie in einen klaren, räumlichen Prozess. Die Metapher zeigt den unmittelbar verständlichen KMU-Nutzen: weniger operative Unordnung, mehr strukturierter Ablauf.

Die Fragmente sind ausschließlich textlose geometrische Symbole und Materialformen, keine nachgebauten Apps oder lesbaren Dokumentoberflächen.

Bewegungsbogen:

1. Kontrolliertes visuelles Chaos um den ruhig stehenden Karl.
2. Ein türkiser Impuls bündelt die Elemente zu einem Prozessfluss.
3. Der geordnete Fluss löst sich dezent auf und kehrt zum Ausgangsbild zurück.

## Website-Effekt nach Auswahl

Dieser Abschnitt gehört ausdrücklich nicht zum Lieferumfang von Phase 1.

- Der Hero ist über eine längere Scrollstrecke als Fullscreen-Fläche angeheftet; das Video läuft durchgehend im Hintergrund.
- Die große Headline startet deckend und wird im ersten Scrollabschnitt transparent beziehungsweise als feine Kontur sichtbar.
- Danach erscheinen Nutzenversprechen, Beweiszeile und Kontakt-CTA nacheinander von unten.
- Das Video spielt unabhängig als zeitbasierter Loop; es wird ausdrücklich nicht durch die Scrollposition gescrubbt. Nur Transparenz und Position der HTML-Overlays werden später über den Scrollfortschritt gesteuert.
- Bei `prefers-reduced-motion` wird die spätere Website auf eine statische, vollständig lesbare Darstellung reduziert.
- Auf Mobilgeräten wird die gewählte 9:16-Version verwendet; die Textüberlagerung bleibt unabhängig vom Video und vollständig bedienbar.

## Qualitätsprüfung

Jeder Render wird anhand von Anfangs-, Mittel- und Endframe geprüft:

- Karl ist klar wiedererkennbar und wirkt freundlich.
- Keine Krawatte und keine ungewollten Kleidungswechsel.
- Gesicht, Brille, Hände und Körperproportionen enthalten keine sichtbaren Artefakte.
- Nur das CI-Türkis erscheint als Akzentfarbe.
- Die linke Safe-Zone bleibt für Website-Text ausreichend ruhig.
- Keine generierten Buchstaben, Logos oder unlesbaren UI-Fragmente.
- Anfang und Ende erlauben eine unauffällige Wiederholung.

Ein Render mit einem harten Verstoß gegen diese Kriterien wird mit einem präzisierten Prompt neu erzeugt. Pro Variante sind nach dem ersten Render maximal zwei Korrekturrenders vorgesehen. Besteht danach weiterhin ein harter Fehler, wird Phase 1 nicht als vollständig abgeschlossen bezeichnet; die zwei erfolgreichen Varianten und der konkrete Blocker der dritten werden Karl zur Entscheidung vorgelegt. Nur erfolgreiche Varianten erhalten einen Vergleichslink.
