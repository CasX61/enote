# eNote

Lokale, offline-first Desktop-Notiz-App (Tauri v2 + React + SQLite). macOS & Windows.

## Neue Version veröffentlichen

Die Versionsnummer wird **automatisch aus dem Tag** gezogen — du musst keine Datei
anfassen. Einfach Code pushen, dann taggen:

```bash
# 1. Änderungen committen und pushen
git add -A
git commit -m "Was geändert wurde"
git push origin main

# 2. Version taggen und pushen  ->  baut + erstellt das Release
git tag v0.2.0
git push origin v0.2.0
```

Wenn der Build grün ist, erscheint das Release automatisch unter:
**https://github.com/CasX61/enote/releases** — mit:

- `eNote.exe` — Windows, portabel (Doppelklick, kein Installer)
- `eNote_<version>_universal.dmg` — macOS (App in „Programme" ziehen)

### Regeln
- Der Tag **muss mit `v` beginnen** (`v0.2.0`, `v1.0.0`, …).
- Jeder Tag nur **einmal**. Tag löschen & neu setzen:
  ```bash
  git tag -d v0.2.0 && git push origin :refs/tags/v0.2.0
  ```
- Push auf `main` **ohne** Tag baut nur Test-Artefakte (kein Release).

## Lokal entwickeln / starten

```bash
npm install
npm run tauri dev      # App im Dev-Modus starten
npm test               # Tests
npm run tauri build    # lokales Release-Bundle (.app/.dmg bzw. .exe)
```

Die SQLite-Datenbank legt die App beim ersten Start selbst an
(`~/Library/Application Support/com.enote.app/notes.db` auf macOS,
`%APPDATA%\com.enote.app\notes.db` auf Windows).
