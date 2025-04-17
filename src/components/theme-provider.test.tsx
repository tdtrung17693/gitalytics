import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./theme-provider";

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

// Mock matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, "matchMedia", {
  value: mockMatchMedia,
});

// Mock document.documentElement.classList
const mockClassList = {
  toggle: vi.fn(),
};
Object.defineProperty(document.documentElement, "classList", {
  value: mockClassList,
});

// Test component that uses the theme
function TestComponent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockMatchMedia.mockClear();
    mockClassList.toggle.mockClear();
  });

  it("should initialize with light theme when no preference is set", () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({ matches: false });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme").textContent).toBe("light");
  });

  it("should initialize with dark theme from localStorage", () => {
    mockLocalStorage.getItem.mockReturnValue("dark");
    mockMatchMedia.mockReturnValue({ matches: false });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(mockClassList.toggle).toHaveBeenCalledWith("dark", true);
  });

  it("should initialize with dark theme from system preference", () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({ matches: true });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(mockClassList.toggle).toHaveBeenCalledWith("dark", true);
  });

  it("should toggle theme when button is clicked", () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({ matches: false });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initial state
    expect(screen.getByTestId("theme").textContent).toBe("light");

    // Click toggle button
    fireEvent.click(screen.getByText("Toggle Theme"));

    // Should update to dark
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "dark");
    expect(mockClassList.toggle).toHaveBeenCalledWith("dark", true);

    // Click toggle button again
    fireEvent.click(screen.getByText("Toggle Theme"));

    // Should update back to light
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "light");
    expect(mockClassList.toggle).toHaveBeenCalledWith("dark", false);
  });

  it("should throw error when useTheme is used outside ThemeProvider", () => {
    // Suppress console error for this test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useTheme must be used within a ThemeProvider");

    console.error = originalError;
  });
});
