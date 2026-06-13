import { Platform } from "react-native";

const primaryColor = "#EF5548";

export const Colors = {
  light: {
    primary: primaryColor,
    text: "#11181C",
    background: "#FFFFFF",
    card: "#F8F8F8",
    border: "#E5E5E5",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: primaryColor,
  },

  dark: {
    primary: primaryColor,
    text: "#ECEDEE",
    background: "#151718",
    card: "#1E1E1E",
    border: "#333333",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#FFFFFF",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
