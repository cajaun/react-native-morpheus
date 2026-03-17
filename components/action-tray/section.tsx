import React from "react";
import { View, StyleSheet } from "react-native";
import { TRAY_SECTION_GAP } from "./constants";

export const TraySection: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <View style={styles.section}>{children}</View>;
};

const styles = StyleSheet.create({
  section: {
    gap: TRAY_SECTION_GAP,
    paddingTop: 24,
    paddingBottom: 24,
  
  },
});

TraySection.displayName = "TraySection";