import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { StyleProp, ViewStyle } from "react-native";
import {
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SCREEN_HEIGHT, TRAY_SPRING_CONFIG } from "./constants";
import { log } from "./logger";
import { useActionTrayMeasurements } from "./use-action-tray-measurements";
import { useActionTrayPresentation } from "./use-action-tray-presentation";
import { useActionTrayRenderState } from "./use-action-tray-render-state";

type Params = {
  visible: boolean;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  trayId?: string;
  fullScreen: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  className?: string;
  footerStyle?: StyleProp<ViewStyle>;
  footerClassName?: string;
  onClose: () => void;
};

export const useActionTrayController = ({
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
}: Params) => {
  const { bottom } = useSafeAreaInsets();

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const contentHeight = useSharedValue(0);
  const footerHeight = useSharedValue(0);
  const active = useSharedValue(false);
  const context = useSharedValue({ y: 0 });
  const hasFooter = useSharedValue(false);
  const closeGeneration = useSharedValue(0);

  const justOpenedRef = useRef(false);

  const renderState = useActionTrayRenderState({
    content,
    footer,
    trayId,
    fullScreen,
    containerStyle,
    className,
    footerStyle,
    footerClassName,
  });

  const presentation = useActionTrayPresentation({
    fullScreen,
  });
  const {
    animMargin,
    animRadius,
    animBottom,
    animHeight,
    animMinHeight,
    animFullScreenBg,
  } = presentation.shared;

  const measurements = useActionTrayMeasurements({
    contentHeight,
    footerHeight,
    renderedTrayId: renderState.state.renderedTrayId,
    renderedFooter: renderState.state.renderedFooter,
  });

  useEffect(() => {
    hasFooter.value = !!renderState.state.renderedFooter;
  }, [hasFooter, renderState.state.renderedFooter]);

  const totalHeight = useDerivedValue(() => {
    if (renderState.state.renderedFullScreen) {
      return SCREEN_HEIGHT;
    }

    return contentHeight.value + footerHeight.value + bottom;
  });

  const progress = useDerivedValue(() => {
    if (totalHeight.value === 0) return 0;
    const travel = Math.min(translateY.value, totalHeight.value);
    return 1 - travel / totalHeight.value;
  });

  const doOpenSpring = useCallback(() => {
    log("doOpenSpring", {
      footer: measurements.shared.measuredFooterHeight.value,
      content: contentHeight.value,
    });

    footerHeight.value = measurements.shared.measuredFooterHeight.value;

    translateY.value = withSpring(0, TRAY_SPRING_CONFIG, (finished) => {
      if (finished) {
        runOnJS(log)("OPEN SPRING FINISHED");
        runOnJS(measurements.actions.enableLayout)();
      }
    });

    active.value = true;
  }, [
    active,
    contentHeight,
    footerHeight,
    measurements.actions.enableLayout,
    measurements.shared.measuredFooterHeight,
    translateY,
  ]);

  const handleCloseSpringFinished = useCallback(() => {
    log("CLOSE SPRING FINISHED — resetting tray state");
    presentation.actions.clearFullScreenBackground();
    presentation.actions.resetPresentationMode();
    renderState.actions.clear();
    measurements.actions.reset();
  }, [
    measurements.actions.reset,
    presentation.actions.clearFullScreenBackground,
    presentation.actions.resetPresentationMode,
    renderState.actions.clear,
  ]);

  useEffect(() => {
    if (visible) {
      translateY.value = SCREEN_HEIGHT;
      closeGeneration.value += 1;
      justOpenedRef.current = true;

      log("OPEN START", {
        trayId,
        footer: measurements.shared.measuredFooterHeight.value,
        hadExistingContent: renderState.state.renderedTrayId !== undefined,
        existingTrayId: renderState.state.renderedTrayId,
      });

      renderState.actions.showLatestSnapshot();
      measurements.actions.beginOpenMeasurement(!!footer);
      presentation.actions.applyPresentationMode(
        fullScreen,
        fullScreen ? SCREEN_HEIGHT : undefined,
      );
      log("OPEN — waiting for measurement");
    } else {
      log("CLOSE START", { renderedTrayId: renderState.state.renderedTrayId });

      const myGeneration = closeGeneration.value + 1;
      closeGeneration.value = myGeneration;

      measurements.actions.prepareForClose();
      active.value = false;

      translateY.value = withSpring(
        SCREEN_HEIGHT,
        TRAY_SPRING_CONFIG,
        (finished) => {
          if (!finished) {
            return;
          }

          if (closeGeneration.value === myGeneration) {
            runOnJS(handleCloseSpringFinished)();
          } else {
            runOnJS(log)(
              "CLOSE SPRING — stale, skipping reset",
              myGeneration,
              closeGeneration.value,
            );
          }
        },
      );
    }
    // Visibility changes are the only lifecycle boundary for open/close.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (!measurements.state.isReadyToOpen) {
      return;
    }

    log("PENDING OPEN — all measurements ready", {
      footer: measurements.shared.measuredFooterHeight.value,
      content: contentHeight.value,
      needsFooter: !!renderState.state.renderedFooter,
    });

    measurements.actions.completePendingOpen();
    doOpenSpring();
  }, [
    contentHeight,
    doOpenSpring,
    measurements.actions.completePendingOpen,
    measurements.shared.measuredFooterHeight,
    measurements.state.isReadyToOpen,
    renderState.state.renderedFooter,
  ]);

  useEffect(() => {
    if (!visible) return;

    if (justOpenedRef.current) {
      justOpenedRef.current = false;
      return;
    }

    const fs = fullScreen;
    const renderedTrayId = renderState.state.renderedTrayId;
    const previousContentHeight =
      measurements.actions.getCachedContentHeight(renderedTrayId) ??
      contentHeight.value;
    const nextCachedContentHeight =
      measurements.actions.getCachedContentHeight(trayId);

    log("TRAY CHANGE", {
      trayId,
      incomingFullScreen: fullScreen,
      renderedTrayId,
      renderedFullScreen: renderState.state.renderedFullScreen,
      contentHeight: contentHeight.value,
      footerHeight: footerHeight.value,
      layoutEnabled: measurements.state.layoutEnabled,
      previousContentHeight,
      nextCachedContentHeight,
    });

    presentation.actions.clearFullScreenBackground();
    measurements.actions.setLayoutAnimationEnabled(!fs);

    if (nextCachedContentHeight !== undefined) {
      measurements.actions.setCachedContentHeight(trayId);
    }

    if (fs) {
      animMinHeight.value = previousContentHeight;
    }

    presentation.actions.applyPresentationMode(
      fs,
      fs ? previousContentHeight : undefined,
    );
    renderState.actions.showLatestSnapshot();
    // Tray identity changes coordinate the swap, presentation, and layout mode together.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trayId, visible, fullScreen]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    renderState.actions.syncRenderedNodes(trayId);
  }, [
    className,
    containerStyle,
    content,
    footer,
    footerClassName,
    footerStyle,
    fullScreen,
    renderState.actions.syncRenderedNodes,
    trayId,
    visible,
  ]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    log("LIVE STEP PROPS", {
      trayId,
      fullScreen,
      hasContent: content != null,
      hasFooter: footer != null,
      hasContainerStyle: containerStyle != null,
      hasFooterStyle: footerStyle != null,
      className,
      footerClassName,
    });
  }, [
    className,
    containerStyle,
    content,
    footer,
    footerClassName,
    footerStyle,
    fullScreen,
    trayId,
    visible,
  ]);

  useEffect(() => {
    log("RENDERED CONTENT CHANGED", {
      trayId: renderState.state.renderedTrayId,
      hasContent: renderState.state.renderedContent !== null,
      fullScreen: renderState.state.renderedFullScreen,
      hasFooter: renderState.state.renderedFooter !== null,
    });
  }, [
    renderState.state.renderedContent,
    renderState.state.renderedFooter,
    renderState.state.renderedFullScreen,
    renderState.state.renderedTrayId,
  ]);

  const handleRequestClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const imperativeApi = useMemo(
    () => ({
      open: () => {
        log("imperative open() requested");
      },
      close: () => {
        handleRequestClose();
      },
      isActive: () => !!active.value,
    }),
    [active, handleRequestClose],
  );

  return {
    shared: {
      translateY,
      contentHeight,
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
      layoutEnabled: measurements.state.layoutEnabled,
      footerMeasured: measurements.state.footerMeasured,
      contentMeasured: measurements.state.contentMeasured,
      pendingOpen: measurements.state.pendingOpen,
      renderedFooter: renderState.state.renderedFooter,
      renderedContent: renderState.state.renderedContent,
      renderedTrayId: renderState.state.renderedTrayId,
      renderedFullScreen: renderState.state.renderedFullScreen,
      renderedContainerStyle: renderState.state.renderedContainerStyle,
      renderedClassName: renderState.state.renderedClassName,
      renderedFooterStyle: renderState.state.renderedFooterStyle,
      renderedFooterClassName: renderState.state.renderedFooterClassName,
      measureFooter: measurements.state.shouldMeasureFooter
        ? renderState.state.renderedFooter
        : null,
    },
    handlers: {
      ...measurements.handlers,
      handleRequestClose,
    },
    imperativeApi,
  };
};
