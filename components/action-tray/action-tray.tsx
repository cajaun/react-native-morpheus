import React, {
  useCallback,
  useMemo,
  forwardRef,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  StyleProp,
  StyleSheet,
  ViewStyle,
  LayoutChangeEvent,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Backdrop } from "./backdrop";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BORDER_RADIUS,
  HORIZONTAL_MARGIN,
  MORPH_DURATION,
  SCREEN_HEIGHT,
  TRAY_VERTICAL_PADDING,
} from "./constants";

type ActionTrayProps = {
  visible: boolean;
  style?: StyleProp<ViewStyle>;
  onClose: () => void;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  trayId?: string;
  fullScreen?: boolean;
};

export type ActionTrayRef = {
  open: () => void;
  close: () => void;
  isActive: () => boolean;
};

const DEBUG = true;
const log = (...args: any[]) => {
  if (DEBUG) console.log("[ActionTray]", ...args);
};

const ActionTray = forwardRef<ActionTrayRef, ActionTrayProps>(
  (
    { style, onClose, content, footer, trayId, visible, fullScreen = false },
    ref,
  ) => {
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const contentHeight = useSharedValue(0);
    const footerHeight = useSharedValue(0);
    const active = useSharedValue(false);
    const context = useSharedValue({ y: 0 });

    const hasFooter = useSharedValue(false);

    const animMargin = useSharedValue(HORIZONTAL_MARGIN);
    const animRadius = useSharedValue(BORDER_RADIUS);
    const animBottom = useSharedValue(0); // initialised properly once bottom is known
    const animMinHeight = useSharedValue(0);

    const [layoutEnabled, setLayoutEnabled] = useState(false);
    const [footerMeasured, setFooterMeasured] = useState(false);
    const [contentMeasured, setContentMeasured] = useState(false);
    const [pendingOpen, setPendingOpen] = useState(false);

    const measuredFooterHeightRef = useRef(0);
    const justOpenedRef = useRef(false);
    const closeGenerationRef = useRef(0);

    const { bottom } = useSafeAreaInsets();

    const [renderedFooter, setRenderedFooter] =
      useState<React.ReactNode>(footer);
    const [renderedContent, setRenderedContent] =
      useState<React.ReactNode>(content);
    const [renderedTrayId, setRenderedTrayId] = useState<string | undefined>(
      trayId,
    );

    // Seed animBottom once safe area is known
    useEffect(() => {
      if (!fullScreen) animBottom.value = bottom;
    }, [bottom]);

    useEffect(() => {
      hasFooter.value = !!renderedFooter;
    }, [renderedFooter]);

    const animFullScreenBg = useSharedValue(0);

    // In the fullScreen/visible effect:
    useEffect(() => {
      if (!visible) return;

      const springCfg = { damping: 50, stiffness: 400, mass: 0.8 };

      animMargin.value = withSpring(
        fullScreen ? 0 : HORIZONTAL_MARGIN,
        springCfg,
      );

      animRadius.value = withSpring(BORDER_RADIUS, springCfg);

      animBottom.value = withSpring(fullScreen ? 0 : bottom, springCfg);

      animMinHeight.value = withSpring(
        fullScreen ? SCREEN_HEIGHT : 0,
        springCfg,
        (finished) => {
         if (fullScreen) {
  animFullScreenBg.value = 1;
}
        },
      );
    }, [fullScreen, visible]);


    useEffect(() => {
      if (!visible) {
        animMargin.value = HORIZONTAL_MARGIN;
        animRadius.value = BORDER_RADIUS;
        animBottom.value = bottom;
        animMinHeight.value = 0;
      }
    }, [visible]);

    const totalHeight = useDerivedValue(() => {
      return contentHeight.value + footerHeight.value + bottom;
    });

    const progress = useDerivedValue(() => {
      if (totalHeight.value === 0) return 0;
      const travel = Math.min(translateY.value, totalHeight.value);
      return 1 - travel / totalHeight.value;
    });

    const rFullScreenBgStyle = useAnimatedStyle(() => ({
      opacity: animFullScreenBg.value,
    }));

    const doOpenSpring = useCallback(() => {
      log("doOpenSpring", {
        footer: measuredFooterHeightRef.current,
        content: contentHeight.value,
      });

      footerHeight.value = measuredFooterHeightRef.current;

      translateY.value = withSpring(
        0,
        { damping: 50, stiffness: 400, mass: 0.8 },
        (finished) => {
          if (finished) {
            runOnJS(log)("OPEN SPRING FINISHED");

            runOnJS(setLayoutEnabled)(true);
          }
        },
      );

      active.value = true;
    }, []);

    const resetContent = useCallback(() => {
      log("resetContent()");
      contentHeight.value = 0;
      setContentMeasured(false);
      setRenderedContent(null);
      setRenderedFooter(null);
      setRenderedTrayId(undefined);
      setLayoutEnabled(false);
    }, []);

    const checkAndReset = useCallback(
      (capturedGeneration: number) => {
        if (closeGenerationRef.current === capturedGeneration) {
          log("CLOSE SPRING FINISHED — resetting content");
          resetContent();
        } else {
          log(
            "CLOSE SPRING — stale, skipping resetContent",
            capturedGeneration,
            closeGenerationRef.current,
          );
        }
      },
      [resetContent],
    );

    useEffect(() => {
      if (visible) {
        translateY.value = SCREEN_HEIGHT;
        closeGenerationRef.current++;
        justOpenedRef.current = true;

        log("OPEN START", {
          trayId,
          footerMeasured,
          contentMeasured,
          footer: measuredFooterHeightRef.current,
          hadExistingContent: renderedTrayId !== undefined,
          existingTrayId: renderedTrayId,
        });

        setRenderedTrayId(trayId);
        setRenderedContent(content);
        setRenderedFooter(footer);

        setLayoutEnabled(false);
        setContentMeasured(false);
        setFooterMeasured(false);

        const needsFooter = !!footer;

        if (!contentMeasured || (needsFooter && !footerMeasured)) {
          log("OPEN — waiting for measurement", {
            footerMeasured,
            contentMeasured,
            needsFooter,
          });
          setPendingOpen(true);
        } else {
          doOpenSpring();
        }
      } else {
        log("CLOSE START", { renderedTrayId });

        const myGeneration = ++closeGenerationRef.current;

        setPendingOpen(false);
        setLayoutEnabled(false);
        active.value = false;

        animFullScreenBg.value = 0;

        translateY.value = withSpring(
          SCREEN_HEIGHT,
          { damping: 50, stiffness: 400, mass: 0.8 },
          (finished) => {
            if (finished) {
              runOnJS(checkAndReset)(myGeneration);
            }
          },
        );
      }
    }, [visible]);

    useEffect(() => {
      const needsFooter = !!renderedFooter;

      if (
        !pendingOpen ||
        !contentMeasured ||
        (needsFooter && !footerMeasured)
      ) {
        return;
      }

      log("PENDING OPEN — all measurements ready", {
        footer: measuredFooterHeightRef.current,
        content: contentHeight.value,
        needsFooter,
      });

      setPendingOpen(false);
      doOpenSpring();
    }, [pendingOpen, footerMeasured, contentMeasured]);

    useEffect(() => {
      if (!visible) return;

      if (justOpenedRef.current) {
        justOpenedRef.current = false;
        return;
      }

      log("TRAY CHANGE", { trayId });

   
      animFullScreenBg.value = 0;

      setLayoutEnabled(true);
      setRenderedContent(content);
      setRenderedFooter(footer);
      setRenderedTrayId(trayId);
    }, [trayId]);

    useEffect(() => {
      log("RENDERED CONTENT CHANGED", {
        trayId: renderedTrayId,
        hasContent: renderedContent !== null,
      });
    }, [renderedContent]);

    const heightEasing = Easing.bezier(0.26, 1, 0.5, 1).factory();

    const layoutAnimationConfig = useMemo(
      () => LinearTransition.duration(MORPH_DURATION).easing(heightEasing),
      [],
    );

    const handleClose = useCallback(() => {
      onClose?.();
    }, [onClose]);

const gesture = useMemo(() => {
  return Gesture.Pan()
    .enabled(!fullScreen)
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((e) => {
      if (e.translationY >= 0) {
        translateY.value = e.translationY + context.value.y;
      }
    })
    .onEnd((e) => {
      const projectedEnd = translateY.value + e.velocityY / 60;
      const shouldClose =
        projectedEnd > totalHeight.value * 0.5 || e.velocityY > 1000;

      if (shouldClose) {
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0);
      }
    });
}, [fullScreen]);

    const rFooterSpacerStyle = useAnimatedStyle(() => ({
      height: hasFooter.value ? footerHeight.value : 0,
    }));


    const rContainerStyle = useAnimatedStyle(() => ({
      left: animMargin.value,
      right: animMargin.value,
      borderRadius: animRadius.value,
      bottom: animBottom.value,
      minHeight: animMinHeight.value,
    }));

 
    const rFooterContainerStyle = useAnimatedStyle(() => ({
      left: animMargin.value,
      right: animMargin.value,
      bottom: animBottom.value,
      borderTopLeftRadius: animRadius.value, 
      borderTopRightRadius: animRadius.value, 
      borderBottomLeftRadius: animRadius.value,
      borderBottomRightRadius: animRadius.value,
    }));

    const rDragStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const handleLayout = (e: LayoutChangeEvent) => {
      const h = e.nativeEvent.layout.height;
      contentHeight.value = h;

      if (!contentMeasured && renderedTrayId !== undefined) {
        setContentMeasured(true);
      }

      log("CONTENT onLayout", { height: h, trayId: renderedTrayId });
    };

    const handleFooterLayout = (e: LayoutChangeEvent) => {
      if (!renderedFooter) return;

      const h = e.nativeEvent.layout.height;

      log("VISIBLE FOOTER onLayout", {
        height: h,
        measuredRef: measuredFooterHeightRef.current,
        delta: h - measuredFooterHeightRef.current,
      });

      footerHeight.value = h;
    };

    return (
      <>
        {footer && !footerMeasured && (
          <Animated.View
            style={[
              styles.measureFooter,
              {
                left: HORIZONTAL_MARGIN,
                right: HORIZONTAL_MARGIN,
                paddingHorizontal: TRAY_VERTICAL_PADDING,
                paddingTop: 6,
                paddingBottom: TRAY_VERTICAL_PADDING,
              },
            ]}
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              log("OFFSCREEN FOOTER onLayout", { height: h });
              measuredFooterHeightRef.current = h;
              footerHeight.value = h;
              setFooterMeasured(true);
            }}
            pointerEvents="none"
          >
            {footer}
          </Animated.View>
        )}

        <Backdrop onTap={handleClose} isActive={active} progress={progress} />

        <Animated.View
          style={[styles.fullScreenBg, rFullScreenBgStyle]}
          pointerEvents="none"
        />

        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[styles.container, rContainerStyle, rDragStyle, style]}
            layout={layoutEnabled ? layoutAnimationConfig : undefined}
            onLayout={handleLayout}
          >
            <Animated.View style={styles.content}>
              {renderedContent}
              <Animated.View style={rFooterSpacerStyle} />
            </Animated.View>
          </Animated.View>
        </GestureDetector>

        <Animated.View
          onLayout={handleFooterLayout}
          style={[
            styles.footer,
            rFooterContainerStyle,
            rDragStyle,
            { opacity: renderedFooter ? 1 : 0 },
          ]}
          pointerEvents={renderedFooter ? "auto" : "none"}
        >
          {renderedFooter ?? null}
        </Animated.View>
      </>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: "white",
    borderCurve: "continuous",
    overflow: "hidden",
  },
  content: {
    padding: 0,
  },
  footer: {
    position: "absolute",
    paddingHorizontal: TRAY_VERTICAL_PADDING,
    paddingTop: 6,
    paddingBottom: TRAY_VERTICAL_PADDING,
    backgroundColor: "white",
  },
  measureFooter: {
    position: "absolute",
    opacity: 0,
    top: -10000,
  },
  fullScreenBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
  },
});

ActionTray.displayName = "ActionTray";

export { ActionTray };
