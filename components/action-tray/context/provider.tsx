import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { ActionTray } from "@/components/action-tray/core/action-tray";
import { log } from "@/components/action-tray/core/logger";
import { TrayContext, TrayDefinition } from "./context";

export const TrayProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [registry, setRegistry] = useState<Record<string, TrayDefinition>>({});
  const [activeTrayId, setActiveTrayId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  const totalRef = useRef(0);
  const justOpenedRef = useRef(false);
  const previousActiveStepRef = useRef<{
    trayId: string | null;
    index: number;
    fullScreen: boolean;
  }>({
    trayId: null,
    index: 0,
    fullScreen: false,
  });
  const pendingStepTransitionRef = useRef<{
    trayId: string;
    fromIndex: number;
    toIndex: number;
    fromFullScreen: boolean;
    toFullScreen: boolean;
  } | null>(null);

  const registerTray = useCallback((id: string, def: TrayDefinition) => {
    setRegistry((prev) => ({ ...prev, [id]: def }));
  }, []);

  const openTray = useCallback((id: string) => {
    justOpenedRef.current = true;
    pendingStepTransitionRef.current = null;
    setIndex(0);
    setActiveTrayId(id);
  }, []);

  const close = useCallback(() => {
    pendingStepTransitionRef.current = null;
    setActiveTrayId(null);
    setIndex(0);
  }, []);

  const activeTray = activeTrayId ? registry[activeTrayId] : undefined;
  const total = activeTray?.contents.length ?? 0;

  useEffect(() => {
    totalRef.current = total;
  }, [total]);

  const safeIndex = total > 0 ? Math.max(0, Math.min(index, total - 1)) : 0;
  const activeFullScreen = activeTray?.fullScreenSteps?.[safeIndex] ?? false;

  const next = useCallback(() => {
    setIndex((i) => {
      const nextIndex = Math.min(i + 1, totalRef.current - 1);
      const currentTrayId = activeTrayId;
      const tray = currentTrayId ? registry[currentTrayId] : undefined;

      if (tray && currentTrayId && nextIndex !== i) {
        pendingStepTransitionRef.current = {
          trayId: currentTrayId,
          fromIndex: i,
          toIndex: nextIndex,
          fromFullScreen: tray.fullScreenSteps?.[i] ?? false,
          toFullScreen: tray.fullScreenSteps?.[nextIndex] ?? false,
        };

        log("QUEUED STEP TRANSITION", pendingStepTransitionRef.current);
      }

      return nextIndex;
    });
  }, [activeTrayId, registry]);

  const back = useCallback(() => {
    setIndex((i) => {
      const nextIndex = Math.max(i - 1, 0);
      const currentTrayId = activeTrayId;
      const tray = currentTrayId ? registry[currentTrayId] : undefined;

      if (tray && currentTrayId && nextIndex !== i) {
        pendingStepTransitionRef.current = {
          trayId: currentTrayId,
          fromIndex: i,
          toIndex: nextIndex,
          fromFullScreen: tray.fullScreenSteps?.[i] ?? false,
          toFullScreen: tray.fullScreenSteps?.[nextIndex] ?? false,
        };

        log("QUEUED STEP TRANSITION", pendingStepTransitionRef.current);
      }

      return nextIndex;
    });
  }, [activeTrayId, registry]);

  useEffect(() => {
    if (justOpenedRef.current && activeTrayId !== null) {
      justOpenedRef.current = false;
    }
  }, [activeTrayId]);

  useEffect(() => {
    const nextActiveStep = {
      trayId: activeTrayId,
      index: safeIndex,
      fullScreen: activeFullScreen,
    };
    const previousActiveStep = previousActiveStepRef.current;

    const didChange =
      previousActiveStep.trayId !== nextActiveStep.trayId ||
      previousActiveStep.index !== nextActiveStep.index ||
      previousActiveStep.fullScreen !== nextActiveStep.fullScreen;

    if (didChange) {
      log("PROVIDER STEP CHANGE", {
        from: previousActiveStep,
        to: nextActiveStep,
        total,
        sameTray: previousActiveStep.trayId === nextActiveStep.trayId,
        presentationModeSwitch:
          previousActiveStep.trayId === nextActiveStep.trayId &&
          previousActiveStep.fullScreen !== nextActiveStep.fullScreen,
      });
    }

    previousActiveStepRef.current = nextActiveStep;
  }, [activeTrayId, activeFullScreen, safeIndex, total]);

  useEffect(() => {
    const pendingTransition = pendingStepTransitionRef.current;

    if (
      !pendingTransition ||
      pendingTransition.trayId !== activeTrayId ||
      pendingTransition.toIndex !== safeIndex
    ) {
      return;
    }

    log("CONSUMED STEP TRANSITION", pendingTransition);
    pendingStepTransitionRef.current = null;
  }, [activeTrayId, safeIndex]);

  const ctxValue = useMemo(
    () => ({
      activeTrayId,
      openTray,
      close,
      next,
      back,
      index: safeIndex,
      total,
      registerTray,
      registerFocusable: () => {},
    }),
    [activeTrayId, openTray, close, next, back, safeIndex, total, registerTray],
  );

  return (
    <TrayContext.Provider value={ctxValue}>
      {children}

      {/* Render one ActionTray per registered tray — all at root level so
          position: absolute resolves against the screen, not a child container. */}
      {Object.entries(registry).map(([trayId, def]) => {
        const isActive = activeTrayId === trayId;
        const trayTotal = def.contents.length;
        const trayIndex = isActive
          ? Math.max(0, Math.min(safeIndex, trayTotal - 1))
          : 0;

        const contentEl = def.contents[trayIndex]?.();
        const containerStyle = contentEl?.props?.style ?? undefined;
        const containerClassName = contentEl?.props?.className;


        const footerEl = isActive && def.footer ? def.footer() : null;
        const footerStyle = footerEl?.props?.style;
const footerClassName = footerEl?.props?.className;

        const isFirstRender = justOpenedRef.current && trayIndex === 0;

        const isFullScreen = def.fullScreenSteps?.[trayIndex] ?? false;
        const pendingStepTransition = pendingStepTransitionRef.current;
        const isPresentationModeSwitch =
          isActive &&
          pendingStepTransition?.trayId === trayId &&
          pendingStepTransition.toIndex === trayIndex &&
          pendingStepTransition.fromFullScreen !==
            pendingStepTransition.toFullScreen;

        const rawContent = isActive
          ? React.cloneElement(contentEl, {
              stepKey: `${trayId}-${trayIndex}`,
              // The shell owns container visuals now. Reapplying them on the
              // animated inner wrapper creates a second independently-sized box.
              className: undefined,
              style: undefined,
              skipEntering: isFirstRender || isPresentationModeSwitch,
              // The tray shell is reused across steps, so keeping the previous
              // body around for an exit animation causes both steps to occupy
              // the same shell at once. That overlap is the fullscreen flicker.
              skipExiting: false,
              step: trayIndex,
              total: trayTotal,
              fullScreen: isFullScreen,
            })
          : null;

        if (isActive) {
          log("PROVIDER CONTENT FLAGS", {
            trayId,
            trayIndex,
            isFullScreen,
            isFirstRender,
            pendingStepTransition,
            isPresentationModeSwitch,
          });
        }

        const footer = footerEl
          ? React.cloneElement(footerEl, {
              step: trayIndex,
              total: trayTotal,
            })
          : null;

        return (
          <ActionTray
            key={trayId}
            visible={isActive}
            content={rawContent}
            footer={footer}
            onClose={close}
            trayId={isActive ? `${trayId}-${trayIndex}` : undefined}
            fullScreen={isFullScreen}
            containerStyle={containerStyle}
            className={containerClassName}
              footerStyle={footerStyle}
  footerClassName={footerClassName}
          />
        );
      })}
    </TrayContext.Provider>
  );
};
