import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoSave } from "./useAutoSave";

describe("useAutoSave", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("speichert erst nach der Debounce-Zeit und nur einmal", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ value }) => useAutoSave(1, value, onSave, { delay: 1200 }),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });
    rerender({ value: "abc" });
    expect(onSave).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith("abc");
    expect(result.current.status).toBe("saved");
  });

  it("speichert nicht beim Wechsel des Keys (andere Notiz)", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ id, value }) => useAutoSave(id, value, onSave, { delay: 1200 }),
      { initialProps: { id: 1, value: "erste" } },
    );

    // Notiz wechselt: anderer Key + anderer Wert gleichzeitig.
    rerender({ id: 2, value: "zweite" });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it("saveNow speichert sofort", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ value }) => useAutoSave(1, value, onSave, { delay: 1200 }),
      { initialProps: { value: "x" } },
    );

    rerender({ value: "geändert" });
    await act(async () => {
      await result.current.saveNow();
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith("geändert");
  });
});
