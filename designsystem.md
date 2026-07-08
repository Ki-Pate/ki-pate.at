# Designsystem „Der KI-Pate" (ki-pate.at) — v3 · Petrol

**Konzept:** Konstruktionszeichnung trifft KI-Konsole. Karl ist Maschinenbau-Ingenieur, der KI baut — die Seite spricht die Sprache präziser technischer Dokumente (Bemaßungs-Kreuze, mono Labels, Datenblatt) kombiniert mit moderner AI-Ästhetik (Terminal, Türkis-Signal). Kein KI-Template-Look (keine Lila-Gradients, keine Einheits-Cards, keine Emojis).

## Farben (Tokens)

| Token | Wert | Verwendung |
|---|---|---|
| `--bg` | `#10141B` | Grundfläche (dunkles Graphit-Blau) |
| `--panel` | `#151A23` | Karten/Panels |
| `--panel2` | `#12161E` | alternierende Sektionen |
| `--ink` | `#EDEBE3` | Text (Papierweiß) |
| `--muted` | `#9BA3AD` | Sekundärtext |
| `--faint` | `#6B7683` | Tertiär/Meta |
| `--acc` | **`#2BC8B7`** | **Signal-Türkis/Petrol — EINZIGER Akzent** (CTAs, Zahlen, Marker) |
| `--acc-hi` | `#48E2D1` | Hover |
| `--tech` | `#6FA3AD` | Petrol-grau: technische Linien, Bemaßung, Sub-Labels |
| `--line` | `rgba(155,163,173,.16)` | Hairlines |

Regel: Türkis sparsam — es markiert Entscheidungen/Aktionen, nie Dekor-Flächen.

## Typografie (self-hosted, DSGVO)

- **Display:** Space Grotesk 640 · H1 clamp(2.9–5.2rem) · letter-spacing −.028em
- **Body:** IBM Plex Sans 400/600 · 16.5px · line-height 1.7
- **Utility/Mono:** IBM Plex Mono 400/500 · Eyebrows/Labels: 0.72rem, letter-spacing .18–.22em, UPPERCASE

## Struktur-Elemente

- Sektions-Eyebrow: `[NR] TITEL` in Mono mit Linien-Prefix; Sektionen als „Blätter" einer Zeichnung nummeriert (00–12)
- `+`-Kreuze an Sektionsgrenzen (Bemaßungs-Metapher), 1px-Hairlines
- Fotos als „ABB. XX" mit technischem Rahmen + Mono-Caption
- Signature-Element: **agent.log-Terminal im Hero** (tippt den Bau der Seite nach) — nur EIN mutiges Element, Rest diszipliniert
- Radius 4–8px, keine Hover-Lift-Effekte, Reveal dezent, prefers-reduced-motion respektiert

## Bildsprache

- **Fotos:** DSLR-natürlich (35–85mm, available light, keine Übersättigung). Karls Gesicht IMMER via nano-banana-EDIT seines echten Fotos, nie neu generieren. **Körperbau authentisch: ~100 kg bei 178 cm — nie verschlanken.**
- **Produkt-Demos:** Produkte in Lebensszenen mit Menschen, Label lesbar
- **Comics (Erklärgrafiken):** dunkles Graphit `#10141B`, Petrol-Türkis `#2BC8B7` dominant, Off-White-Linien, flacher Editorial-Stil, konsistente Linienstärke, deutsche Labels, Karl erkennbar (Brille, rotblonder Vollbart) + authentische Statur, freundliche Agenten-Roboter mit Türkis-Augen
- **Logo:** KP-Monogramm, Türkis auf Graphit, technische Strichführung (assets/logo-ki-pate)

## Ton

Sie-Form, kurz, aktiv, Beweis vor Behauptung, Zahlen statt Adjektive. Verboten: „ganzheitlich", „revolutionär", „disruptiv", Emojis. FOMO über Opportunitätskosten („was der Mitbewerb bereits einspart"), nie Drohkulisse.
