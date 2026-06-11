# eNote — CLAUDE.md

## Was wir bauen

Eine lokale Desktop-Notiz-App namens **eNote**. **macOS-first** (entwickelt und
gebaut für macOS; Windows-Support kommt später, Tauri ist cross-platform).
Minimalistisch, schnell, offline-first. Kein Account, kein Cloud-Sync — alles
bleibt lokal auf dem Rechner.

**Design-Sprache:** „Swiss / Mono Minimal" — warmes Off-White, Fast-Schwarz,
Haarlinien-Borders, viel Weißraum, Mono-Labels (Geist Mono) für Tabs/Meta,
Sans (Geist) für Body. Note-Akzentfarbe ist der einzige Farbtupfer
(Punkt + linker Card-Spine). Bewusst kein generisches Default-Design.

**Kernidee:** Links eine Card-Übersicht aller Notizen, rechts ein Editor. Klick auf eine Card → öffnet sie im Editor. Doppelklick → Popup-Vorschau. Auto-Save nach kurzer Pause.

---

## Tech-Stack

| Schicht | Technologie |
|---|---|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS v3 |
| Editor | `<textarea>` (MVP), später TipTap |
| Desktop-Wrapper | Tauri v2 |
| Datenbank | SQLite via `tauri-plugin-sql` |
| Build | Vite |

**Warum Tauri:** Kleines Binary (~5 MB), kein Chromium-Bundle wie Electron, Rust-Backend für natives SQLite. Entwickler hat Vorerfahrung mit Tauri.

---

## Projektstruktur

```
noteapp/
├── src/                        # React Frontend
│   ├── components/
│   │   ├── Sidebar.tsx         # Linke Spalte: Card-Liste + Tabs
│   │   ├── NoteCard.tsx        # Einzelne Card-Komponente
│   │   ├── Editor.tsx          # Rechte Spalte: Titel + Textarea + Toolbar
│   │   ├── NoteModal.tsx       # Popup bei Doppelklick
│   │   └── ColorPicker.tsx     # Farbauswahl-Dots
│   ├── hooks/
│   │   ├── useNotes.ts         # CRUD + State-Management
│   │   └── useAutoSave.ts      # Debounce-Logik (1.2s)
│   ├── lib/
│   │   └── db.ts               # Tauri SQL Wrapper-Funktionen
│   ├── types/
│   │   └── note.ts             # TypeScript Interfaces
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/                  # Tauri / Rust Backend
│   ├── src/
│   │   └── main.rs
│   ├── migrations/
│   │   └── 001_initial.sql     # DB-Schema
│   └── tauri.conf.json
├── CLAUDE.md
└── package.json
```

---

## Datenbank-Schema (SQLite)

```sql
-- migrations/001_initial.sql

CREATE TABLE IF NOT EXISTS notes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL DEFAULT '',
  content     TEXT    NOT NULL DEFAULT '',
  color       TEXT    NOT NULL DEFAULT '#888780',
  is_template INTEGER NOT NULL DEFAULT 0,   -- 0 = Notiz, 1 = Vorlage
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TRIGGER update_notes_timestamp
  AFTER UPDATE ON notes
  FOR EACH ROW
  BEGIN
    UPDATE notes SET updated_at = datetime('now') WHERE id = OLD.id;
  END;
```

---

## TypeScript Interface

```typescript
// src/types/note.ts

export interface Note {
  id: number;
  title: string;
  content: string;
  color: string;       // Hex-Wert, z.B. "#378ADD"
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export type NoteCreate = Omit<Note, 'id' | 'created_at' | 'updated_at'>;
export type NoteUpdate = Partial<NoteCreate> & { id: number };
```

---

## Verfügbare Farben (Card-Akzentfarbe)

```typescript
export const NOTE_COLORS = [
  { name: 'Grau',   hex: '#888780' },
  { name: 'Blau',   hex: '#378ADD' },
  { name: 'Grün',   hex: '#1D9E75' },
  { name: 'Gelb',   hex: '#EF9F27' },
  { name: 'Orange', hex: '#D85A30' },
  { name: 'Pink',   hex: '#D4537E' },
  { name: 'Lila',   hex: '#7F77DD' },
] as const;
```

Die Farbe erscheint als linker Border-Akzent auf der Card (`border-left: 3px solid <color>`).

---

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Notizen] [Vorlagen]              [+ Neue Notiz]        │
├──────────────┬──────────────────────────────────────────┤
│              │  [Titel-Input]   [●●●●●●●] [🔖] [🗑] [💾] │
│  ┌────────┐  ├─────────────────────────────────────────┤ │
│  │ Card 1 │  │                                          │ │
│  └────────┘  │   Textarea (Editor)                      │ │
│  ┌────────┐  │                                          │ │
│  │ Card 2 │  │                                          │ │
│  └────────┘  │                                          │ │
│  ┌────────┐  │                                          │ │
│  │ Card 3 │  ├─────────────────────────────────────────┤ │
│              │  42 Wörter          ✓ Gespeichert         │
└──────────────┴──────────────────────────────────────────┘
```

- **Sidebar:** 260px fest, nicht resizable (MVP)
- **Editor:** flex-1, füllt restlichen Platz
- **Kein Splitter** im MVP — kann später nachgerüstet werden

---

## Kernfunktionen (MVP)

### Notizen
- [x] Notiz erstellen (leere Note, sofort aktiv)
- [x] Notiz auswählen (Klick auf Card)
- [x] Notiz bearbeiten (Titel + Content im Editor)
- [x] Notiz löschen (Toolbar-Button mit Bestätigung)
- [x] Notiz-Farbe ändern (ColorPicker in Toolbar)
- [x] Auto-Save (1200ms Debounce nach letzter Eingabe)
- [x] Manuelles Speichern (Cmd/Ctrl+S)

### Vorlagen
- [x] Notiz als Vorlage markieren (Bookmark-Button)
- [x] Vorlagen-Tab zeigt nur Vorlagen
- [x] Aus Vorlage neue Notiz erstellen (Button in Vorlage)

### Popup (Modal)
- [x] Doppelklick auf Card → Vorschau-Modal
- [x] Modal zeigt Titel + Inhalt (read-only)
- [x] "Bearbeiten"-Button öffnet Note im Editor
- [x] Schließen per Klick auf Backdrop oder Escape

### Keyboard Shortcuts
- `Ctrl+S` → Manuell speichern
- `Ctrl+N` → Neue Notiz
- `Escape` → Modal schließen

---

## db.ts — Wrapper-Funktionen

```typescript
// src/lib/db.ts
import Database from '@tauri-apps/plugin-sql'; // Tauri v2

let db: Database | null = null;

async function getDb() {
  if (!db) db = await Database.load('sqlite:notes.db');
  return db;
}

export async function getAllNotes(): Promise<Note[]> { ... }
export async function getNoteById(id: number): Promise<Note | null> { ... }
export async function createNote(data: NoteCreate): Promise<number> { ... }
export async function updateNote(data: NoteUpdate): Promise<void> { ... }
export async function deleteNote(id: number): Promise<void> { ... }
```

Die DB-Datei liegt unter dem Tauri App-Data-Verzeichnis (macOS:
`~/Library/Application Support/com.enote.app/notes.db`; Windows später:
`%APPDATA%\com.enote.app\notes.db`). Pfad ist Tauri-managed — niemals hardcoden.

---

## Styling-Regeln

- **Tailwind** für alle Styles — kein eigenes CSS außer in `index.css` für globale Resets
- Kein Dark Mode im MVP (kann später über Tailwind `dark:` nachgerüstet werden)
- Schriftart: System-Font-Stack (`font-sans` in Tailwind)
- Keine externen Icon-Libraries — Tabler Icons via npm (`@tabler/icons-react`)
- Breakpoints irrelevant — App ist Desktop-only, Mindestbreite 800px

---

## Was wir NICHT bauen (MVP)

- ❌ Cloud-Sync / Account-System
- ❌ Rich-Text-Editor (kein Markdown-Rendering im MVP)
- ❌ Ordner / Tags / Kategorien
- ❌ Suche (kann später einfach per SQLite `LIKE` nachgerüstet werden)
- ❌ Drag-and-Drop Reihenfolge
- ❌ Attachments / Bilder
- ❌ Multi-Window

---

## Entwicklungsreihenfolge

1. **Tauri-Projekt aufsetzen** (`npm create tauri-app`)
2. **DB-Migration + `db.ts`** implementieren und testen
3. **`useNotes` Hook** mit CRUD bauen
4. **Sidebar + NoteCard** rendern (statische Daten zuerst)
5. **Editor-Komponente** mit Titel-Input + Textarea
6. **Auto-Save** via `useAutoSave` Hook
7. **ColorPicker** + Farbe in DB speichern
8. **NoteModal** (Doppelklick-Popup)
9. **Vorlagen-Tab** + Template-Logik
10. **Keyboard Shortcuts** (Ctrl+S, Ctrl+N, Escape)
11. **Tauri Build** → `npm run tauri build` erzeugt `.app`/`.dmg` (macOS) unter `src-tauri/target/release/bundle/`. Windows-`.exe` später per Cross-Build.

---

## Wichtige Hinweise für Claude Code

- **Immer TypeScript** — kein JavaScript
- **Keine `any`-Types** — lieber `unknown` + Type Guard
- **Tauri-API nur im `src/lib/db.ts`** kapseln — Komponenten rufen nie direkt `invoke()` auf
- Bei DB-Operationen immer **try/catch** mit User-Feedback (Toast o.ä.)
- **Auto-Save darf nie den Cursor-Position resetten** — `textarea` Value nur setzen wenn Note von außen wechselt
- `is_template` in SQLite ist `INTEGER (0/1)` — beim Lesen in `boolean` casten
- DB-Datei-Pfad ist Tauri-managed — niemals hardcoden