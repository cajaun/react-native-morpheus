import { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BORDER_RADIUS,
  HORIZONTAL_MARGIN,
  TRAY_KEYBOARD_GAP,
} from "./constants";

type Params = {
  translateY: { value: number };
  hasFooter: { value: boolean };
  footerHeight: { value: number };
  keyboardHeight: { value: number };
};

export const useActionTrayAnimatedStyles = ({
  translateY,
  hasFooter,
  footerHeight,
  keyboardHeight,
}: Params) => {
  const { bottom } = useSafeAreaInsets();

  const footerSpacerStyle = useAnimatedStyle(() => ({
    height: hasFooter.value ? footerHeight.value : 0,
  }));

  const trayLayoutStyle = useAnimatedStyle(() => {
    const keyboardBottom =
      keyboardHeight.value > 0
        ? keyboardHeight.value + TRAY_KEYBOARD_GAP
        : 0;
    const resolvedBottom = Math.max(bottom, keyboardBottom);

    return {
      left: HORIZONTAL_MARGIN,
      right: HORIZONTAL_MARGIN,
      borderRadius: BORDER_RADIUS,
      bottom: resolvedBottom,
    };
  });

  const footerContainerStyle = useAnimatedStyle(() => {
    const keyboardBottom =
      keyboardHeight.value > 0
        ? keyboardHeight.value + TRAY_KEYBOARD_GAP
        : 0;
    const resolvedBottom = Math.max(bottom, keyboardBottom);

    return {
      left: HORIZONTAL_MARGIN,
      right: HORIZONTAL_MARGIN,
      bottom: resolvedBottom,
      borderTopLeftRadius: BORDER_RADIUS,
      borderTopRightRadius: BORDER_RADIUS,
      borderBottomLeftRadius: BORDER_RADIUS,
      borderBottomRightRadius: BORDER_RADIUS,
    };
  });

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const contentPaddingStyle = useAnimatedStyle(() => ({
    paddingHorizontal: 0,
  }));

  return {
    footerSpacerStyle,
    trayLayoutStyle,
    footerContainerStyle,
    dragStyle,
    contentPaddingStyle,
  };
};
