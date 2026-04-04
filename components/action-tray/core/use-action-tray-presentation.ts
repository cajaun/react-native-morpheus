import { useCallback, useEffect } from "react";
import {
  cancelAnimation,
  runOnJS,
  runOnUI,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BORDER_RADIUS,
  HORIZONTAL_MARGIN,
  SCREEN_HEIGHT,
  TRAY_SPRING_CONFIG,
} from "./constants";
import { log } from "./logger";

type Params = {
  fullScreen: boolean;
};

export const useActionTrayPresentation = ({ fullScreen }: Params) => {
  const { bottom } = useSafeAreaInsets();

  const animMargin = useSharedValue(HORIZONTAL_MARGIN);
  const animRadius = useSharedValue(BORDER_RADIUS);
  const animBottom = useSharedValue(0);
  const animMinHeight = useSharedValue(0);
  const animHeight = useSharedValue(0);
  const animFullScreenBg = useSharedValue(0);

  useEffect(() => {
    if (!fullScreen) {
      animBottom.value = bottom;
    }
  }, [animBottom, bottom, fullScreen]);

  useEffect(() => {
    log("PRESENTATION PROP", {
      fullScreen,
      bottom,
    });
  }, [bottom, fullScreen]);

  const applyPresentationMode = useCallback(
    (isFullScreen: boolean, lockedHeight?: number) => {
      log("applyPresentationMode()", {
        isFullScreen,
        lockedHeight,
        bottom,
        current: {
          margin: animMargin.value,
          radius: animRadius.value,
          bottom: animBottom.value,
          height: animHeight.value,
          minHeight: animMinHeight.value,
          fullScreenBg: animFullScreenBg.value,
        },
        target: {
          margin: isFullScreen ? 0 : HORIZONTAL_MARGIN,
          radius: BORDER_RADIUS,
          bottom: isFullScreen ? 0 : bottom,
          height: isFullScreen ? SCREEN_HEIGHT : 0,
          minHeight: isFullScreen ? SCREEN_HEIGHT : 0,
        },
      });

      runOnUI(
        (
          nextFullScreen: boolean,
          insetBottom: number,
          nextLockedHeight: number | undefined,
        ) => {
          "worklet";

          cancelAnimation(animMargin);
          cancelAnimation(animRadius);
          cancelAnimation(animBottom);
          cancelAnimation(animHeight);
          cancelAnimation(animMinHeight);

          if (nextFullScreen && nextLockedHeight !== undefined) {
            animHeight.value = nextLockedHeight;
            animMinHeight.value = nextLockedHeight;
          }

          animMargin.value = withSpring(
            nextFullScreen ? 0 : HORIZONTAL_MARGIN,
            TRAY_SPRING_CONFIG,
          );

          animRadius.value = withSpring(BORDER_RADIUS, TRAY_SPRING_CONFIG);

          animBottom.value = withSpring(
            nextFullScreen ? 0 : insetBottom,
            TRAY_SPRING_CONFIG,
          );

          if (nextFullScreen) {
            animHeight.value = withSpring(SCREEN_HEIGHT, TRAY_SPRING_CONFIG);
          } else {
            animHeight.value = 0;
          }

          animMinHeight.value = withSpring(
            nextFullScreen ? SCREEN_HEIGHT : 0,
            TRAY_SPRING_CONFIG,
            (finished) => {
              runOnJS(log)("applyPresentationMode() minHeight finished", {
                finished,
                isFullScreen: nextFullScreen,
                target: nextFullScreen ? SCREEN_HEIGHT : 0,
              });

              if (finished && nextFullScreen) {
                animFullScreenBg.value = 1;
              }
            },
          );
        },
      )(isFullScreen, bottom, lockedHeight);
    },
    [
      animBottom,
      animFullScreenBg,
      animHeight,
      animMargin,
      animMinHeight,
      animRadius,
      bottom,
    ],
  );

  const resetPresentationMode = useCallback(() => {
    log("resetPresentationMode()", {
      bottom,
      current: {
        margin: animMargin.value,
        radius: animRadius.value,
        bottom: animBottom.value,
        height: animHeight.value,
        minHeight: animMinHeight.value,
        fullScreenBg: animFullScreenBg.value,
      },
    });

    animMargin.value = HORIZONTAL_MARGIN;
    animRadius.value = BORDER_RADIUS;
    animBottom.value = bottom;
    animHeight.value = 0;
    animMinHeight.value = 0;
  }, [animBottom, animHeight, animMargin, animMinHeight, animRadius, bottom]);

  const clearFullScreenBackground = useCallback(() => {
    log("clearFullScreenBackground()", {
      current: animFullScreenBg.value,
    });

    animFullScreenBg.value = 0;
  }, [animFullScreenBg]);

  return {
    shared: {
      animMargin,
      animRadius,
      animBottom,
      animHeight,
      animMinHeight,
      animFullScreenBg,
    },
    actions: {
      applyPresentationMode,
      resetPresentationMode,
      clearFullScreenBackground,
    },
  };
};
