import React from "react";
import { View, StyleSheet } from "react-native";
import {
  TRAY_HORIZONTAL_PADDING,
} from "./constants";

export const TrayBody: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <View style={styles.body}>{children}</View>;
};

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: TRAY_HORIZONTAL_PADDING,
    // paddingVertical: 16,
  },
});

TrayBody.displayName = "TrayBody";