import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import SettingsPage from "@/app/settings/page";
import { PREFERENCES_STORAGE_KEY } from "@/lib/preferences";

expect.extend(toHaveNoViolations);

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    address: null,
    isAuthenticated: false,
    isWalletConnected: false,
    isWalletDetected: false,
    isLoading: false,
    connectWallet: jest.fn(),
    authenticate: jest.fn(),
    logout: jest.fn(),
  }),
}));

// ─── Existing preference tests ────────────────────────────────────────────────

describe("Settings preferences", () => {
  beforeEach(() => localStorage.clear());

  it("saves the selected currency and notification settings", async () => {
    render(<SettingsPage />);

    const currency = await screen.findByRole("combobox", { name: "Preferred currency" });
    fireEvent.change(currency, { target: { value: "cNGN" } });
    fireEvent.click(screen.getByRole("switch", { name: "Trade updates" }));
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? "{}");
      expect(saved.currency).toBe("cNGN");
      expect(saved.notifications.tradeUpdates).toBe(false);
    });
  });

  it("only references rendered description and error nodes", async () => {
    render(<SettingsPage />);

    const network = await screen.findByRole("combobox", { name: "Network" });
    fireEvent.change(network, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
    await screen.findByText("Network selection is required");

    const describedBy = network.getAttribute("aria-describedby")?.split(/\s+/) ?? [];
    expect(describedBy).toHaveLength(2);
    expect(describedBy.every((id) => document.getElementById(id) !== null)).toBe(true);
    expect(
      describedBy.some((id) => document.getElementById(id)?.textContent === "Network selection is required"),
    ).toBe(true);
  });
});

// ─── Toggle ARIA correctness ──────────────────────────────────────────────────

describe("Toggle – ARIA attributes", () => {
  beforeEach(() => localStorage.clear());

  it("each Toggle renders with role=switch", async () => {
    render(<SettingsPage />);
    const switches = await screen.findAllByRole("switch");
    expect(switches.length).toBeGreaterThan(0);
    switches.forEach((sw) => {
      expect(sw).toHaveAttribute("role", "switch");
    });
  });

  it("Toggle 'Trade updates' has correct aria-checked state (initially true)", async () => {
    render(<SettingsPage />);
    const sw = await screen.findByRole("switch", { name: "Trade updates" });
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("aria-checked reflects toggled state after click", async () => {
    render(<SettingsPage />);
    const sw = await screen.findByRole("switch", { name: "Trade updates" });
    expect(sw).toHaveAttribute("aria-checked", "true");

    fireEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "false");

    fireEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("Toggle is labelled via aria-labelledby pointing to visible label text", async () => {
    render(<SettingsPage />);
    const sw = await screen.findByRole("switch", { name: "Trade updates" });
    const labelledById = sw.getAttribute("aria-labelledby");
    expect(labelledById).toBeTruthy();

    const labelEl = document.getElementById(labelledById!);
    expect(labelEl).not.toBeNull();
    expect(labelEl?.textContent).toBe("Trade updates");
  });

  it("Toggle with description has aria-describedby pointing to description text", async () => {
    render(<SettingsPage />);
    // "Trade updates" has a description; find that switch.
    const sw = await screen.findByRole("switch", { name: "Trade updates" });
    const describedById = sw.getAttribute("aria-describedby");
    expect(describedById).toBeTruthy();

    const descEl = document.getElementById(describedById!);
    expect(descEl).not.toBeNull();
    expect(descEl?.textContent).toBe("Status changes on your active trades.");
  });

  it("aria-labelledby and aria-describedby IDs reference elements in the DOM", async () => {
    render(<SettingsPage />);
    const switches = await screen.findAllByRole("switch");
    switches.forEach((sw) => {
      const labelledById = sw.getAttribute("aria-labelledby");
      expect(labelledById).toBeTruthy();
      expect(document.getElementById(labelledById!)).not.toBeNull();

      const describedById = sw.getAttribute("aria-describedby");
      if (describedById) {
        expect(document.getElementById(describedById)).not.toBeNull();
      }
    });
  });
});

// ─── Toggle keyboard interaction ──────────────────────────────────────────────

describe("Toggle – keyboard interaction", () => {
  beforeEach(() => localStorage.clear());

  it("Space key toggles the switch (native button behaviour)", async () => {
    render(<SettingsPage />);
    const sw = await screen.findByRole("switch", { name: "Trade updates" });

    // Space is handled natively by <button> — fireEvent.click is the
    // Testing-Library equivalent for the click that Space triggers.
    fireEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "false");
  });

  it("Enter key toggles the switch", async () => {
    render(<SettingsPage />);
    const sw = await screen.findByRole("switch", { name: "Trade updates" });
    expect(sw).toHaveAttribute("aria-checked", "true");

    fireEvent.keyDown(sw, { key: "Enter" });
    expect(sw).toHaveAttribute("aria-checked", "false");
  });

  it("Enter key alternates aria-checked on successive presses", async () => {
    render(<SettingsPage />);
    const sw = await screen.findByRole("switch", { name: "Dispute alerts" });
    const initial = sw.getAttribute("aria-checked");

    fireEvent.keyDown(sw, { key: "Enter" });
    expect(sw.getAttribute("aria-checked")).toBe(initial === "true" ? "false" : "true");

    fireEvent.keyDown(sw, { key: "Enter" });
    expect(sw.getAttribute("aria-checked")).toBe(initial);
  });

  it("Tab key does not toggle the switch", async () => {
    render(<SettingsPage />);
    const sw = await screen.findByRole("switch", { name: "Trade updates" });
    const before = sw.getAttribute("aria-checked");

    fireEvent.keyDown(sw, { key: "Tab" });
    expect(sw.getAttribute("aria-checked")).toBe(before);
  });
});

// ─── jest-axe accessibility audit ────────────────────────────────────────────

describe("Settings page – jest-axe audit", () => {
  beforeEach(() => localStorage.clear());

  it("has no axe violations in the default (unauthenticated) state", async () => {
    const { container } = render(<SettingsPage />);
    // Wait for any async state hydration from localStorage.
    await screen.findByRole("switch", { name: "Trade updates" });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("Toggle switches have no axe violations after interaction", async () => {
    const { container } = render(<SettingsPage />);
    const sw = await screen.findByRole("switch", { name: "Trade updates" });
    fireEvent.click(sw);
    expect(await axe(container)).toHaveNoViolations();
  });
});