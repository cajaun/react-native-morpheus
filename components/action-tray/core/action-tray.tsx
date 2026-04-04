import React, { forwardRef, useImperativeHandle, useMemo } from "react";
import Animated from "react-native-reanimated";
import { GestureDetector } from "react-native-gesture-handler";
import { Backdrop } from "../primitives/backdrop";
import { useActionTrayController } from "./use-action-tray-controller";
import { useActionTrayGesture } from "./use-action-tray-gesture";
import { useActionTrayAnimatedStyles } from "./use-action-tray-animated-styles";
import { createTrayLayoutTransition } from "./action-tray-layout";
import { styles } from "./action-tray-styles";
import { HORIZONTAL_MARGIN, TRAY_VERTICAL_PADDING } from "./constants";
import { ActionTrayProps, ActionTrayRef } from "./action-tray-types";

const ActionTray = forwardRef<ActionTrayRef, ActionTrayProps>(
  (
    {
      style,
      onClose,
      content,
      footer,
      trayId,
      visible,
      containerStyle,
      className,
      fullScreen = false,
      footerClassName,
      footerStyle,
    },
    ref,
  ) => {
    const controller = useActionTrayController({
      visible,
      content,
      footer,
      trayId,
      fullScreen,
      containerStyle,
      className,
      footerStyle,
      footerClassName,
      onClose,
    });

    const {
      shared: {
        translateY,
        footerHeight,
        active,
        context,
        hasFooter,
        animMargin,
        animRadius,
        animBottom,
        animHeight,
        animMinHeight,
        animFullScreenBg,
        totalHeight,
        progress,
      },
      state: {
        layoutEnabled,
        renderedFooter,
        renderedContent,
        renderedTrayId,
        renderedFullScreen,
        renderedContainerStyle,
        renderedClassName,
        renderedFooterStyle,
        renderedFooterClassName,
        measureFooter,
      },
      handlers: {
        handleContentLayout,
        handleVisibleFooterLayout,
        handleMeasureFooterLayout,
        handleRequestClose,
      },
      imperativeApi,
    } = controller;

    useImperativeHandle(ref, () => imperativeApi, [imperativeApi]);

    const gesture = useActionTrayGesture({
      fullScreen: renderedFullScreen,
      translateY,
      totalHeight,
      context,
      onRequestClose: handleRequestClose,
    });

    const {
      footerSpacerStyle,
      trayLayoutStyle,
      footerContainerStyle,
      contentPaddingStyle,
      dragStyle,
    } = useActionTrayAnimatedStyles({
      animMargin,
      animRadius,
      animBottom,
      animHeight,
      animMinHeight,
      animFullScreenBg,
      translateY,
      hasFooter,
      footerHeight,
    });

    const layoutAnimationConfig = useMemo(
      () => createTrayLayoutTransition(),
      [],
    );
    const shouldUseLayoutAnimation =
      layoutEnabled &&
      !(visible && trayId !== renderedTrayId) &&
      !(visible && fullScreen !== renderedFullScreen);

    return (
      <>
        {measureFooter && (
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
            onLayout={handleMeasureFooterLayout}
            pointerEvents="none"
          >
            {measureFooter}
          </Animated.View>
        )}

        <Backdrop
          onTap={handleRequestClose}
          isActive={active}
          progress={progress}
          totalHeight={totalHeight}
        />

        {/* <Animated.View
          style={[styles.fullScreenBg, fullScreenBgStyle]}
          pointerEvents="none"
        /> */}

        <GestureDetector gesture={gesture}>
          <Animated.View
            className={renderedClassName}
            style={[
              styles.container,
              trayLayoutStyle,
              renderedContainerStyle,
              dragStyle,
              style,
            ]}
            layout={shouldUseLayoutAnimation ? layoutAnimationConfig : undefined}
          >
            <Animated.View
              style={styles.content}
              // Measure the intrinsic content stack, not the animated shell.
              // The shell can be fullscreen-sized during presentation swaps,
              // which pollutes the next step's measurement with stale heights.
              onLayout={handleContentLayout}
            >
              <Animated.View style={contentPaddingStyle}>
                {renderedContent}
              </Animated.View>
              <Animated.View style={footerSpacerStyle} />
            </Animated.View>
          </Animated.View>
        </GestureDetector>

        <Animated.View
          className={renderedFooterClassName}
          onLayout={handleVisibleFooterLayout}
          style={[
            styles.footer,
            footerContainerStyle,
            dragStyle,
            renderedFooterStyle,
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

ActionTray.displayName = "ActionTray";

export { ActionTray };
