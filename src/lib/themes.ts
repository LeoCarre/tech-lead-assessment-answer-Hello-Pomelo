export const DEFAULT_THEME = {
  preset: "hello-pomelo",
  radius: "sm",
  scale: "none",
  contentLayout: "full",
} as const;

export type ThemePreset =
  | "hello-pomelo"
  | "underground"
  | "rose-garden"
  | "lake-view"
  | "sunset-glow"
  | "forest-whisper"
  | "ocean-breeze"
  | "lavender-dream";

export type ThemeType = {
  preset: ThemePreset;
  radius: string;
  scale: string;
  contentLayout: string;
};

/**
 * Swatch colors match each preset's effective `--primary` token
 * (and Hello Pomelo secondary magenta for the brand preset).
 */
export const THEMES: {
  name: string;
  value: ThemePreset;
  colors: string[];
}[] = [
  {
    name: "Hello Pomelo",
    value: "hello-pomelo",
    colors: ["#11103B", "#D9306B"],
  },
  {
    name: "Underground",
    value: "underground",
    // primary-700
    colors: ["oklch(0.5315 0.0694 156.19)"],
  },
  {
    name: "Rose Garden",
    value: "rose-garden",
    // primary-600
    colors: ["oklch(0.5827 0.2418 12.23)"],
  },
  {
    name: "Lake View",
    value: "lake-view",
    // primary-400
    colors: ["oklch(0.765 0.177 163.22)"],
  },
  {
    name: "Sunset Glow",
    value: "sunset-glow",
    // primary-600
    colors: ["oklch(0.5591 0.1882 25.33)"],
  },
  {
    name: "Forest Whisper",
    value: "forest-whisper",
    // primary-700
    colors: ["oklch(0.5276 0.1072 182.22)"],
  },
  {
    name: "Ocean Breeze",
    value: "ocean-breeze",
    // primary-600
    colors: ["oklch(0.5461 0.2152 262.88)"],
  },
  {
    name: "Lavender Dream",
    value: "lavender-dream",
    // primary-600
    colors: ["oklch(0.5709 0.1808 306.89)"],
  },
];
