import { useCallback, useEffect } from "react";
import {
  Dimensions,
  EmitterSubscription,
  Keyboard,
  KeyboardEvent,
  Platform,
} from "react-native";
import {
  Easing,
  type EasingFunction,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { log } from "./logger";

const DEFAULT_KEYBOARD_DURATION = 0;

const KEYBOARD_EASING: Record<string, EasingFunction> = {
  easeIn: Easing.in(Easing.ease),
  easeInEaseOut: Easing.inOut(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  keyboard: Easing.bezierFn(0.26, 1, 0.5, 1),
  linear: Easing.linear,
};

const resolveKeyboardEasing = (easing?: string) => {
  if (!easing) {
    return Easing.out(Easing.ease);
  }

  return KEYBOARD_EASING[easing] ?? Easing.out(Easing.ease);
};

const getKeyboardOverlap = (event: KeyboardEvent) => {
  const windowHeight = Dimensions.get("window").height;

  if (event.endCoordinates?.screenY != null) {
    return Math.max(0, windowHeight - event.endCoordinates.screenY);
  }

  return Math.max(0, event.endCoordinates?.height ?? 0);
};

export const useActionTrayKeyboard = () => {
  const keyboardHeight = useSharedValue(0);

  const animateKeyboardHeight = useCallback(
    (nextHeight: number, event?: KeyboardEvent) => {
      const duration =
        Platform.OS === "ios"
          ? Math.max(0, event?.duration ?? DEFAULT_KEYBOARD_DURATION)
          : DEFAULT_KEYBOARD_DURATION;

      log("KEYBOARD FRAME", {
        nextHeight,
        duration,
        easing: event?.easing,
      });

      keyboardHeight.value = withTiming(nextHeight, {
        duration,
        easing: resolveKeyboardEasing(event?.easing),
      });
    },
    [keyboardHeight],
  );

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  useEffect(() => {
    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      return;
    }

    const subscriptions: EmitterSubscription[] = [];

    if (Platform.OS === "ios") {
      subscriptions.push(
        Keyboard.addListener("keyboardWillChangeFrame", (event) => {
          animateKeyboardHeight(getKeyboardOverlap(event), event);
        }),
      );
      subscriptions.push(
        Keyboard.addListener("keyboardWillHide", (event) => {
          animateKeyboardHeight(0, event);
        }),
      );
    } else {
      subscriptions.push(
        Keyboard.addListener("keyboardDidShow", (event) => {
          animateKeyboardHeight(getKeyboardOverlap(event), event);
        }),
      );
      subscriptions.push(
        Keyboard.addListener("keyboardDidHide", () => {
          animateKeyboardHeight(0);
        }),
      );
    }

    return () => {
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, [animateKeyboardHeight]);

  return {
    keyboardHeight,
    dismissKeyboard,
  };
};
