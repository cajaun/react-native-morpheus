import React, { useCallback, useEffect, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import { useSharedValue, type SharedValue } from "react-native-reanimated";
import { log } from "./logger";

type Params = {
  contentHeight: SharedValue<number>;
  footerHeight: SharedValue<number>;
  renderedTrayId?: string;
  renderedFooter?: React.ReactNode;
};

export const useActionTrayMeasurements = ({
  contentHeight,
  footerHeight,
  renderedTrayId,
  renderedFooter,
}: Params) => {
  const [layoutEnabled, setLayoutEnabled] = useState(false);
  const [footerMeasured, setFooterMeasured] = useState(false);
  const [contentMeasured, setContentMeasured] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);

  const measuredFooterHeight = useSharedValue(0);

  useEffect(() => {
    if (renderedFooter) {
      return;
    }

    measuredFooterHeight.value = 0;
    footerHeight.value = 0;
  }, [footerHeight, measuredFooterHeight, renderedFooter]);

  const beginOpenMeasurement = useCallback(
    (hasFooter: boolean) => {
      contentHeight.value = 0;
      footerHeight.value = hasFooter ? measuredFooterHeight.value : 0;

      setLayoutEnabled(false);
      setContentMeasured(false);
      setFooterMeasured(!hasFooter);
      setPendingOpen(true);
    },
    [contentHeight, footerHeight, measuredFooterHeight],
  );

  const enableLayout = useCallback(() => {
    setLayoutEnabled(true);
  }, []);

  const setLayoutAnimationEnabled = useCallback((enabled: boolean) => {
    setLayoutEnabled(enabled);
  }, []);

  const completePendingOpen = useCallback(() => {
    setPendingOpen(false);
  }, []);

  const prepareForClose = useCallback(() => {
    setPendingOpen(false);
    setLayoutEnabled(false);
  }, []);

  const reset = useCallback(() => {
    contentHeight.value = 0;
    footerHeight.value = 0;
    measuredFooterHeight.value = 0;

    setContentMeasured(false);
    setFooterMeasured(false);
    setPendingOpen(false);
    setLayoutEnabled(false);
  }, [contentHeight, footerHeight, measuredFooterHeight]);

  const handleContentLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const height = e.nativeEvent.layout.height;
      contentHeight.value = height;

      if (!contentMeasured && renderedTrayId !== undefined) {
        setContentMeasured(true);
      }

      log("CONTENT onLayout", { height, trayId: renderedTrayId });
    },
    [contentHeight, contentMeasured, renderedTrayId],
  );

  const handleVisibleFooterLayout = useCallback(
    (e: LayoutChangeEvent) => {
      if (!renderedFooter) {
        return;
      }

      const height = e.nativeEvent.layout.height;

      log("VISIBLE FOOTER onLayout", {
        height,
        measuredRef: measuredFooterHeight.value,
        delta: height - measuredFooterHeight.value,
      });

      measuredFooterHeight.value = height;
      footerHeight.value = height;
    },
    [footerHeight, measuredFooterHeight, renderedFooter],
  );

  const handleMeasureFooterLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const height = e.nativeEvent.layout.height;

      log("OFFSCREEN FOOTER onLayout", { height });

      measuredFooterHeight.value = height;
      footerHeight.value = height;
      setFooterMeasured(true);
    },
    [footerHeight, measuredFooterHeight],
  );

  return {
    shared: {
      measuredFooterHeight,
    },
    state: {
      layoutEnabled,
      footerMeasured,
      contentMeasured,
      pendingOpen,
      isReadyToOpen: pendingOpen && contentMeasured && footerMeasured,
      shouldMeasureFooter: !!renderedFooter && !footerMeasured,
    },
    actions: {
      beginOpenMeasurement,
      enableLayout,
      setLayoutAnimationEnabled,
      completePendingOpen,
      prepareForClose,
      reset,
    },
    handlers: {
      handleContentLayout,
      handleVisibleFooterLayout,
      handleMeasureFooterLayout,
    },
  };
};
