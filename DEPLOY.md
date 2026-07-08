# Deployment: ki-pate.at

**Ablauf: Lokal → GitHub → All-Inkl Server**

## So funktioniert es

1. **Lokal** ändern: `C:\Users\info\Desktop\Projekte\Privat\KI-Pate\site\`
2. **GitHub**: geänderte Dateien in dieses Repo committen (`main`-Branch)
   - Quellcode-Dateien einzeln (index.html, kontakt.php, …)
   - Bilder/Fonts gesammelt als `kipate-site.zip` (enthält nur `assets/` + `presse/`)
3. **Server ziehen lassen**: Deploy-URL im Browser aufrufen:
   `https://ki-pate.at/deploy.php?key=<DEPLOY_KEY>`
   (Key steht NICHT im Repo — nur in `deploy.php` am Server und lokal in `planning/deploy-key.txt`)

Der Server lädt dann das Repo-ZIP von GitHub, entpackt zuerst `kipate-site.zip`
(Assets) und kopiert danach alle Repo-Dateien ins Webroot `/ki-pate.at/`.

## Was NICHT deployed wird (Exclude-Liste in deploy.php)

`README.md`, `kipate-site.zip`, `.gitignore`, `designsystem.md`,
`post-vorlage.md`, `DEPLOY.md`, `deploy.php`

## Sicherheit

- `deploy.php` liegt **nur am Server**, nie im Repo (enthält den Key)
- Key schützt den Trigger; Vorgang ist idempotent (nur Kopieren, kein Löschen)
- Rate-Limit: max. 1 Deploy / 60 s · Log: `.deploy.log` im Webroot
