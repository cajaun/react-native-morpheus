import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { TRAY_HORIZONTAL_PADDING } from "../core/constants";

export const TrayBody: React.FC<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}> = ({ children, style, className }) => {
  return (
    <View className={className} style={[styles.body, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: TRAY_HORIZONTAL_PADDING,
  },
});

TrayBody.displayName = "TrayBody";
