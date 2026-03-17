import React, {
  useCallback,
  useMemo,
  forwardRef,
  useState,
  useEffect,
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
  index?: number;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  trayKey?: string;
};

export type ActionTrayRef = {
  open: () => void;
  close: () => void;
  isActive: () => boolean;
};

const ActionTray = forwardRef<ActionTrayRef, ActionTrayProps>(
  ({ style, onClose, content, footer, index, trayKey, visible }, ref) => {
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const contentHeight = useSharedValue(0);
    const footerHeight = useSharedValue(0);
    const active = useSharedValue(false);
    const context = useSharedValue({ y: 0 });
    const [layoutEnabled, setLayoutEnabled] = useState(false);
    const { bottom } = useSafeAreaInsets();

    const [renderedFooter, setRenderedFooter] = useState<React.ReactNode>(footer);
    const [renderedContent, setRenderedContent] = useState<React.ReactNode>(content);
    const [renderedTrayKey, setRenderedTrayKey] = useState<string | undefined>(trayKey);


    const shouldReset = useSharedValue(false);


    useEffect(() => {
      if (visible) {
        setRenderedContent(content);
        setRenderedFooter(footer);
        setRenderedTrayKey(trayKey);
      }
    }, [visible]); 


    useEffect(() => {
      if (visible && content) setRenderedContent(content);
    }, [content]);

    useEffect(() => {
      if (visible && footer) setRenderedFooter(footer);
    }, [footer]);

    const totalHeight = useDerivedValue(() => {
      return contentHeight.value + bottom;
    });

    const progress = useDerivedValue(() => {
      return 1 - translateY.value / SCREEN_HEIGHT;
    });

    const heightEasing = Easing.bezier(0.26, 1, 0.5, 1).factory();

    const layoutAnimationConfig = useMemo(
      () => LinearTransition.duration(MORPH_DURATION).easing(heightEasing),
      [],
    );

    const scrollTo = useCallback((destination: number) => {
      "worklet";
      active.value = destination !== SCREEN_HEIGHT;
      translateY.value = withSpring(destination, {
        damping: 50,
        stiffness: 400,
        mass: 0.8,
      });
    }, []);

    const handleClose = useCallback(() => {
      onClose?.();
    }, [onClose]);

    const resetContent = useCallback(() => {
      setRenderedContent(null);
      setRenderedFooter(null);
      setRenderedTrayKey(undefined);
    }, []);

    useEffect(() => {
      if (visible) {

        shouldReset.value = false;

        translateY.value = withSpring(
          0,
          { damping: 50, stiffness: 400, mass: 0.8 },
          () => {
            runOnJS(setLayoutEnabled)(true);
          },
        );
        active.value = true;
      } else {
        runOnJS(setLayoutEnabled)(false);
        active.value = false;

        shouldReset.value = true;
        translateY.value = withSpring(
          SCREEN_HEIGHT,
          { damping: 50, stiffness: 400, mass: 0.8 },
          () => {
           
            if (shouldReset.value) {
              runOnJS(resetContent)();
            }
          },
        );
      }
    }, [visible]);

    const gesture = useMemo(() => {
      return Gesture.Pan()
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
            scrollTo(0);
          }
        });
    }, [handleClose, scrollTo]);

    const rFooterSpacerStyle = useAnimatedStyle(() => {
      return {
        height: renderedFooter ? footerHeight.value : 0,
      };
    });

    const rDragStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const handleLayout = (e: LayoutChangeEvent) => {
      contentHeight.value = e.nativeEvent.layout.height;
    };

    const handleFooterLayout = (e: LayoutChangeEvent) => {
      footerHeight.value = e.nativeEvent.layout.height;
    };

    return (
      <>
        <Backdrop onTap={handleClose} isActive={active} progress={progress} />

        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[styles.container, { bottom }, rDragStyle, style]}
            layout={layoutEnabled ? layoutAnimationConfig : undefined}
            onLayout={handleLayout}
          >
            <Animated.View style={styles.content}>
             
              <Animated.View key={renderedTrayKey}>
                {renderedContent}
              </Animated.View>
              <Animated.View style={rFooterSpacerStyle} />
            </Animated.View>
          </Animated.View>
        </GestureDetector>

        <Animated.View
          onLayout={handleFooterLayout}
          style={[
            styles.footer,
            { bottom, left: HORIZONTAL_MARGIN, right: HORIZONTAL_MARGIN },
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
    left: HORIZONTAL_MARGIN,
    right: HORIZONTAL_MARGIN,
    backgroundColor: "white",
    borderRadius: BORDER_RADIUS,
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
    borderBottomLeftRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS,
  },
});

export { ActionTray };