import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { TRAY_HORIZONTAL_PADDING } from "../core/constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const TrayBody: React.FC<{
  children: React.ReactNode;
  fullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}> = ({ children, fullScreen, style, className }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={className} 
      style={[
        styles.body, // base
        fullScreen && {
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom,
        },
        style, 
      ]}
    >
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