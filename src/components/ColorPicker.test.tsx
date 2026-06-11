import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColorPicker } from "./ColorPicker";

describe("ColorPicker", () => {
  it("meldet die gewählte Farbe per onChange", async () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#888780" onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Farbe Blau" }));
    expect(onChange).toHaveBeenCalledWith("#378ADD");
  });

  it("markiert die aktive Farbe als pressed", () => {
    render(<ColorPicker value="#378ADD" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Farbe Blau" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
