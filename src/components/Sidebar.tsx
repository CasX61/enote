import { IconPlus } from "@tabler/icons-react";
import type { Note } from "../types/note";
import type { Tab } from "../hooks/useNotes";
import { NoteCard } from "./NoteCard";

interface SidebarProps {
  notes: Note[];
  tab: Tab;
  onTab: (tab: Tab) => void;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onPreview: (note: Note) => void;
  onNew: () => void;
  loading: boolean;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "notes", label: "Notizen" },
  { id: "templates", label: "Vorlagen" },
];

export function Sidebar({
  notes,
  tab,
  onTab,
  selectedId,
  onSelect,
  onPreview,
  onNew,
  loading,
}: SidebarProps) {
  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-line bg-bg">
      {/* Drag-Region + macOS-Ampel-Freiraum */}
      <div className="drag select-none px-4 pb-3 pt-7">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[0.95rem] font-medium tracking-tight text-ink">
            eNote
          </span>
          <span className="label text-faint">
            {loading ? "···" : String(notes.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-drag flex items-center gap-4 px-4">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTab(t.id)}
              className={[
                "label relative -mb-px py-2 transition-colors",
                active ? "text-ink" : "text-faint hover:text-muted",
              ].join(" ")}
            >
              {t.label}
              {active && (
                <span className="absolute inset-x-0 bottom-0 h-px bg-ink" />
              )}
            </button>
          );
        })}
      </div>
      <div className="h-px bg-line" />

      {/* Neue Notiz */}
      <div className="no-drag px-4 py-3">
        <button
          type="button"
          onClick={onNew}
          className="group flex w-full items-center justify-center gap-1.5 rounded-sm border border-line bg-surface py-2 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-surface"
        >
          <IconPlus size={14} stroke={2} />
          <span className="label">
            {tab === "templates" ? "Neue Vorlage" : "Neue Notiz"}
          </span>
        </button>
      </div>

      {/* Liste */}
      <div className="scroll-thin no-drag flex-1 space-y-2 overflow-y-auto px-4 pb-4">
        {loading ? (
          <p className="label px-1 py-6 text-center text-faint">Lädt…</p>
        ) : notes.length === 0 ? (
          <p className="label px-1 py-8 text-center leading-relaxed text-faint">
            {tab === "templates"
              ? "Keine Vorlagen"
              : "Noch keine Notizen"}
          </p>
        ) : (
          notes.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              active={n.id === selectedId}
              onSelect={onSelect}
              onPreview={onPreview}
            />
          ))
        )}
      </div>
    </aside>
  );
}
