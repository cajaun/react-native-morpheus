import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import { ActionTray } from "@/components/action-tray/action-tray";
import { TrayContext, TrayDefinition } from "./context";

export const TrayProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [registry, setRegistry] =
    useState<Record<string, TrayDefinition>>({});

  const [activeTrayId, setActiveTrayId] =
    useState<string | null>(null);

  const [index, setIndex] = useState(0);

  // true only on the very first render after openTray is called
  const [justOpened, setJustOpened] = useState(false);

  const registerTray = useCallback(
    (id: string, def: TrayDefinition) => {
      setRegistry((prev) => {
        if (prev[id] === def) return prev;
        return { ...prev, [id]: def };
      });
    },
    []
  );

  const openTray = useCallback((id: string) => {
    setIndex(0);
    setActiveTrayId(id);
    setJustOpened(true);
  }, []);

  const close = useCallback(() => {
    setActiveTrayId(null);
    setIndex(0);
  }, []);

  // Reset justOpened after the first content render so step transitions
  // still get their entering animation
  useEffect(() => {
    if (justOpened) setJustOpened(false);
  }, [activeTrayId, index]);

  const activeTray = activeTrayId
    ? registry[activeTrayId]
    : undefined;

  const total = activeTray?.contents.length ?? 0;

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const back = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const rawContent =
    activeTray?.contents[index]?.(
      `${activeTrayId}-${index}`,
      justOpened  // ← skip the fade-in when the tray is first opening
    ) ?? null;

  const footer = activeTray?.footer?.() ?? null;

  const ctxValue = useMemo(
    () => ({
      openTray,
      close,
      next,
      back,
      index,
      total,
      registerTray,
      registerFocusable: () => {},
    }),
    [openTray, close, next, back, index, total, registerTray]
  );

  return (
    <TrayContext.Provider value={ctxValue}>
      {children}

      <ActionTray
        visible={activeTrayId !== null}
        content={rawContent}
        footer={footer}
        onClose={close}
        trayKey={`${activeTrayId}-${index}`}
      />
    </TrayContext.Provider>
  );
};