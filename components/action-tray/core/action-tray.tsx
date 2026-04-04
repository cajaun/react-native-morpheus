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
      footerClassName,
      footerStyle,
      keyboardHeight: trayKeyboardHeight,
      dismissKeyboard,
    },
    ref,
  ) => {
    const controller = useActionTrayController({
      visible,
      content,
      footer,
      trayId,
      containerStyle,
      className,
      footerStyle,
      footerClassName,
      keyboardHeight: trayKeyboardHeight,
      dismissKeyboard,
      onClose,
    });

    const {
      shared: {
        translateY,
        footerHeight,
        context,
        hasFooter,
        totalHeight,
        progress,
      },
      state: {
        layoutEnabled,
        renderedFooter,
        renderedContent,
        renderedTrayId,
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
      translateY,
      totalHeight,
      context,
      keyboardHeight: trayKeyboardHeight,
      dismissKeyboard,
      onRequestClose: handleRequestClose,
    });

    const {
      footerSpacerStyle,
      trayLayoutStyle,
      footerContainerStyle,
      contentPaddingStyle,
      dragStyle,
    } = useActionTrayAnimatedStyles({
      translateY,
      hasFooter,
      footerHeight,
      keyboardHeight: trayKeyboardHeight,
    });

    const layoutAnimationConfig = useMemo(
      () => createTrayLayoutTransition(),
      [],
    );
    const shouldUseLayoutAnimation =
      layoutEnabled && !(visible && trayId !== renderedTrayId);

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
          isRendered={renderedTrayId !== undefined}
          progress={progress}
        />

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
