import React from "react";
import {
  Platform,
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  StyleProp,
  ViewStyle,
} from "react-native";
import { TRAY_SECTION_GAP } from "../core/constants";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type TraySectionProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  maxHeight?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  contentClassName?: string;
};

export const TraySection: React.FC<TraySectionProps> = ({
  children,
  scrollable = false,
  maxHeight,

  style,
  className,
  contentContainerStyle,
  contentClassName,
}) => {
  const height = maxHeight ?? SCREEN_HEIGHT * 0.65;

  if (scrollable) {
    return (
      <View style={[{ height }, style]} className={className}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          className={contentClassName}
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="always"
          scrollEventThrottle={16}
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.section, style]} className={className}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: TRAY_SECTION_GAP,
    paddingVertical: TRAY_SECTION_GAP,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: TRAY_SECTION_GAP,
    paddingTop: TRAY_SECTION_GAP,
    paddingBottom: TRAY_SECTION_GAP,
    flexGrow: 1,
  },
});

TraySection.displayName = "TraySection";
