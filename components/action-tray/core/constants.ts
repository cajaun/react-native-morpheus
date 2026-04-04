import { Dimensions } from "react-native";

export const HORIZONTAL_MARGIN = 12;
export const BORDER_RADIUS = 40;
export const SCREEN_HEIGHT = Dimensions.get("window").height;
export const SCREEN_WIDTH = Dimensions.get("window").width;
export const MORPH_DURATION = 350;
export const TRAY_SPRING_CONFIG = {
  stiffness: 350,
  damping: 34,
  mass: 1,
  overshootClamping: true,
} as const;

export const TRAY_HORIZONTAL_PADDING = 32;
export const TRAY_VERTICAL_PADDING = 28;

export const TRAY_SECTION_GAP = 24;
