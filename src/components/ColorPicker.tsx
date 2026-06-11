import { NOTE_COLORS } from "../types/note";

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

/** Reihe aus 7 Akzent-Punkten; aktiver Punkt erhält einen Ring. */
export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Akzentfarbe">
      {NOTE_COLORS.map((c) => {
        const active = c.hex.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={c.hex}
            type="button"
            onClick={() => onChange(c.hex)}
            title={c.name}
            aria-label={`Farbe ${c.name}`}
            aria-pressed={active}
            className={[
              "h-5 w-5 rounded-full transition-transform",
              "hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40",
              active ? "ring-2 ring-offset-2 ring-offset-surface ring-ink" : "",
            ].join(" ")}
            style={{ backgroundColor: c.hex }}
          />
        );
      })}
    </div>
  );
}
