import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";

export const TrayHeader: React.FC<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}> = ({ children, style, className }) => {
  return (
    <View className={className} style={[styles.header, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {},
});

TrayHeader.displayName = "TrayHeader";
