import styles from "./settings.module.css";
import { useState, useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { IoMdSunny, IoMdMoon } from "react-icons/io";
import { FiSettings, FiMonitor } from "react-icons/fi";
import { HiOutlineTemplate } from "react-icons/hi";
import { VscColorMode } from "react-icons/vsc";

type Theme =
  | "dark"
  | "light"
  | "system"
  | "blue"
  | "purple"
  | "green"
  | "sepia"
  | "high-contrast";

// Theme template definitions
const themeTemplates: Record<
  string,
  {
    name: string;
    colors: {
      bg: string;
      surface: string;
      surfaceHover: string;
      border: string;
      card: string;
      text: string;
      textMuted: string;
      primary: string;
      primaryHover: string;
      primaryActive: string;
    };
  }
> = {
  dark: {
    name: "Dark",
    colors: {
      bg: "#18181b",
      surface: "#23232a",
      surfaceHover: "#2a2a33",
      border: "#32323c",
      card: "#23232a",
      text: "#f4f4f4",
      textMuted: "#a1a1aa",
      primary: "#6366f1",
      primaryHover: "#818cf8",
      primaryActive: "#4f46e5",
    },
  },
  light: {
    name: "Light",
    colors: {
      bg: "#f4f4f5",
      surface: "#ffffff",
      surfaceHover: "#f1f5f9",
      border: "#e4e4e7",
      card: "#ffffff",
      text: "#18181b",
      textMuted: "#6b7280",
      primary: "#6366f1",
      primaryHover: "#818cf8",
      primaryActive: "#4f46e5",
    },
  },
  blue: {
    name: "Blue",
    colors: {
      bg: "#0f172a",
      surface: "#1e293b",
      surfaceHover: "#334155",
      border: "#475569",
      card: "#1e293b",
      text: "#f8fafc",
      textMuted: "#94a3b8",
      primary: "#38bdf8",
      primaryHover: "#7dd3fc",
      primaryActive: "#0284c7",
    },
  },
  purple: {
    name: "Purple",
    colors: {
      bg: "#1e1b4b",
      surface: "#312e81",
      surfaceHover: "#4338ca",
      border: "#4f46e5",
      card: "#312e81",
      text: "#ffffff",
      textMuted: "#c7d2fe",
      primary: "#a78bfa",
      primaryHover: "#c4b5fd",
      primaryActive: "#7c3aed",
    },
  },
  green: {
    name: "Forest",
    colors: {
      bg: "#14532d",
      surface: "#166534",
      surfaceHover: "#15803d",
      border: "#22c55e",
      card: "#166534",
      text: "#ffffff",
      textMuted: "#bbf7d0",
      primary: "#22c55e",
      primaryHover: "#4ade80",
      primaryActive: "#16a34a",
    },
  },
  sepia: {
    name: "Sepia",
    colors: {
      bg: "#292524",
      surface: "#44403c",
      surfaceHover: "#57534e",
      border: "#78716c",
      card: "#44403c",
      text: "#faf6f0",
      textMuted: "#d6d3d1",
      primary: "#c2410c",
      primaryHover: "#ea580c",
      primaryActive: "#9a3412",
    },
  },
  "high-contrast": {
    name: "High Contrast",
    colors: {
      bg: "#000000",
      surface: "#1a1a1a",
      surfaceHover: "#2c2c2c",
      border: "#ffffff",
      card: "#1a1a1a",
      text: "#ffffff",
      textMuted: "#d4d4d4",
      primary: "#ffdd00",
      primaryHover: "#ffcc00",
      primaryActive: "#ffbb00",
    },
  },
};

const Settings = () => {
  const [open, setOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>("dark");
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  useEffect(() => {
    // Get the theme from localStorage if available
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    localStorage.setItem("theme", theme);

    let themeToApply = theme;
    if (theme === "system") {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      themeToApply = systemPrefersDark ? "dark" : "light";
    }

    // Get theme template
    const template = themeTemplates[themeToApply] || themeTemplates.dark;
    const colors = template.colors;

    // Apply all theme colors
    root.style.setProperty("--color-bg", colors.bg);
    root.style.setProperty("--color-surface", colors.surface);
    root.style.setProperty("--color-surface-hover", colors.surfaceHover);
    root.style.setProperty("--color-border", colors.border);
    root.style.setProperty("--color-card", colors.card);
    root.style.setProperty("--color-text", colors.text);
    root.style.setProperty("--color-text-muted", colors.textMuted);
    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--color-primary-hover", colors.primaryHover);
    root.style.setProperty("--color-primary-active", colors.primaryActive);

    // Set calendar-specific colors
    root.style.setProperty("--main-page-bg-color", colors.bg);
    root.style.setProperty("--fc-page-bg-color", colors.bg);
    root.style.setProperty("--fc-neutral-bg-color", colors.surface);
    root.style.setProperty("--fc-border-color", colors.border);
    root.style.setProperty("--fc-button-text-color", colors.text);
    root.style.setProperty("--fc-event-text-color", "#ffffff");

    // Apply text color to root
    root.style.color = colors.text;

    // Create a style element for dynamic CSS rules
    let styleElement = document.getElementById("theme-styles");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "theme-styles";
      document.head.appendChild(styleElement);
    }

    // Apply text color rules for form elements
    styleElement.textContent = `
      input, textarea, select {
        color: ${colors.text} !important;
      }
      ::placeholder {
        color: ${colors.textMuted} !important;
        opacity: 0.7;
      }
    `;
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  return (
    <div className={styles.settings}>
      <button
        className={styles.settingsButton}
        onClick={() => setOpen(true)}
        aria-label="Open settings"
      >
        <FiSettings />
      </button>

      {open && (
        <div className={styles.settingsModal}>
          <div className={styles.settingsContent}>
            <div className={styles.settingsHeader}>
              <h2>Settings</h2>
              <button
                className={styles.closeButton}
                onClick={() => setOpen(false)}
                aria-label="Close settings"
              >
                <IoCloseOutline />
              </button>
            </div>

            <div className={styles.settingSection}>
              <h3>Theme</h3>
              <div className={styles.themeCategoryTitle}>
                <VscColorMode />
                <span>Base Themes</span>
              </div>
              <div className={styles.themeOptions}>
                <button
                  className={`${styles.themeButton} ${
                    currentTheme === "light" ? styles.activeTheme : ""
                  }`}
                  onClick={() => handleThemeChange("light")}
                  aria-label="Light theme"
                >
                  <IoMdSunny />
                  <span>Light</span>
                </button>
                <button
                  className={`${styles.themeButton} ${
                    currentTheme === "dark" ? styles.activeTheme : ""
                  }`}
                  onClick={() => handleThemeChange("dark")}
                  aria-label="Dark theme"
                >
                  <IoMdMoon />
                  <span>Dark</span>
                </button>
                <button
                  className={`${styles.themeButton} ${
                    currentTheme === "system" ? styles.activeTheme : ""
                  }`}
                  onClick={() => handleThemeChange("system")}
                  aria-label="System theme"
                >
                  <FiMonitor />
                  <span>System</span>
                </button>
              </div>

              <div className={styles.themeCategoryTitle}>
                <HiOutlineTemplate />
                <span>Theme Templates</span>
              </div>
              <div className={styles.themeOptions}>
                <button
                  className={`${styles.themeButton} ${
                    currentTheme === "blue" ? styles.activeTheme : ""
                  }`}
                  onClick={() => handleThemeChange("blue")}
                  aria-label="Blue theme"
                  style={{
                    borderLeft: "4px solid #38bdf8",
                  }}
                >
                  <span>Blue</span>
                </button>
                <button
                  className={`${styles.themeButton} ${
                    currentTheme === "purple" ? styles.activeTheme : ""
                  }`}
                  onClick={() => handleThemeChange("purple")}
                  aria-label="Purple theme"
                  style={{
                    borderLeft: "4px solid #a78bfa",
                  }}
                >
                  <span>Purple</span>
                </button>
                <button
                  className={`${styles.themeButton} ${
                    currentTheme === "green" ? styles.activeTheme : ""
                  }`}
                  onClick={() => handleThemeChange("green")}
                  aria-label="Green theme"
                  style={{
                    borderLeft: "4px solid #22c55e",
                  }}
                >
                  <span>Forest</span>
                </button>
                <button
                  className={`${styles.themeButton} ${
                    currentTheme === "sepia" ? styles.activeTheme : ""
                  }`}
                  onClick={() => handleThemeChange("sepia")}
                  aria-label="Sepia theme"
                  style={{
                    borderLeft: "4px solid #c2410c",
                  }}
                >
                  <span>Sepia</span>
                </button>
                <button
                  className={`${styles.themeButton} ${
                    currentTheme === "high-contrast" ? styles.activeTheme : ""
                  }`}
                  onClick={() => handleThemeChange("high-contrast")}
                  aria-label="High contrast theme"
                  style={{
                    borderLeft: "4px solid #ffdd00",
                  }}
                >
                  <span>High Contrast</span>
                </button>
              </div>
            </div>

            <div className={styles.settingSection}>
              <h3>Notifications</h3>
              <div className={styles.settingOption}>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={() => setNotifications(!notifications)}
                  />
                  <span className={styles.slider}></span>
                </label>
                <span>Enable notifications</span>
              </div>
            </div>

            <div className={styles.settingSection}>
              <h3>Sound Effects</h3>
              <div className={styles.settingOption}>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={soundEffects}
                    onChange={() => setSoundEffects(!soundEffects)}
                  />
                  <span className={styles.slider}></span>
                </label>
                <span>Enable sound effects</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
