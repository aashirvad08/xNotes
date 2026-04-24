export const PRIORITY_COLORS = {
  High: "#DC2626",
  Medium: "#D97706",
  Low: "#15803D",
};

export const THEMES = {
  dark: {
    name: "dark",
    statusBar: "light",
    background: "#09090F",
    surface: "#161321",
    surfaceAlt: "#120F1B",
    surfaceStrong: "#1B1529",
    border: "#2B2540",
    borderStrong: "#34274E",
    textPrimary: "#F5F3FF",
    textSecondary: "#DDD6FE",
    textMuted: "#A1A1AA",
    textSoft: "#B3AEC2",
    accent: "#7E22CE",
    accentBright: "#A855F7",
    accentText: "#E9D5FF",
    accentSoft: "#C084FC",
    accentSurface: "#1A122A",
    accentBorder: "#4C1D95",
    fabShadow: "#000000",
    shadow: "#000000",
  },
  light: {
    name: "light",
    statusBar: "dark",
    background: "#F7F2FF",
    surface: "#FFFFFF",
    surfaceAlt: "#F2E8FF",
    surfaceStrong: "#E9D5FF",
    border: "#D8B4FE",
    borderStrong: "#C084FC",
    textPrimary: "#221033",
    textSecondary: "#4C1D95",
    textMuted: "#6B5A86",
    textSoft: "#7C6A98",
    accent: "#7E22CE",
    accentBright: "#9333EA",
    accentText: "#4C1D95",
    accentSoft: "#7E22CE",
    accentSurface: "#F3E8FF",
    accentBorder: "#A855F7",
    fabShadow: "#4C1D95",
    shadow: "#4C1D95",
  },
};

export function getToggleLabel(themeName) {
  return themeName === "dark" ? "Light" : "Dark";
}
