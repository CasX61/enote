import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

interface AutoSaveOptions<T> {
  /** Debounce-Verzögerung in ms (Standard 1200). */
  delay?: number;
  /** Speichern aktiv? (z.B. false ohne ausgewählte Notiz). */
  enabled?: boolean;
  /** Serialisierung zum Änderungs-Vergleich (Standard JSON). */
  serialize?: (value: T) => string;
}

/**
 * Speichert `value` automatisch `delay` ms nach der letzten Änderung.
 *
 * - Speichert nur, wenn sich der Wert wirklich geändert hat.
 * - Wechselt `key` (z.B. andere Notiz ausgewählt), wird die Baseline neu
 *   gesetzt OHNE zu speichern — verhindert versehentliches Schreiben beim
 *   Notizwechsel und hat keinen Einfluss auf die Cursor-Position.
 */
export function useAutoSave<T>(
  key: string | number | null,
  value: T,
  onSave: (value: T) => Promise<void>,
  options: AutoSaveOptions<T> = {},
): { status: SaveStatus; saveNow: () => Promise<void> } {
  const { delay = 1200, enabled = true, serialize = JSON.stringify } = options;

  const data = serialize(value);
  const savedRef = useRef<string>(data);
  const keyRef = useRef<string | number | null>(key);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");

  // Aktuellen Wert in Ref halten, damit verzögerte/explizite Saves den
  // neuesten Stand verwenden.
  const valueRef = useRef(value);
  valueRef.current = value;
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const run = useCallback(async () => {
    clearTimer();
    const snapshot = serialize(valueRef.current);
    if (snapshot === savedRef.current) {
      setStatus("idle");
      return;
    }
    setStatus("saving");
    try {
      await onSaveRef.current(valueRef.current);
      savedRef.current = snapshot;
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, [serialize]);

  useEffect(() => {
    // Notiz gewechselt → Baseline neu, kein Save.
    if (keyRef.current !== key) {
      keyRef.current = key;
      savedRef.current = data;
      clearTimer();
      setStatus("idle");
      return;
    }

    if (!enabled) return;

    if (data === savedRef.current) {
      setStatus("idle");
      return;
    }

    setStatus("dirty");
    clearTimer();
    timer.current = setTimeout(() => {
      void run();
    }, delay);

    return clearTimer;
    // `data` ist ein String (primitiv) → Effekt läuft nur bei echter Änderung.
  }, [key, data, enabled, delay, run]);

  const saveNow = useCallback(async () => {
    await run();
  }, [run]);

  return { status, saveNow };
}
