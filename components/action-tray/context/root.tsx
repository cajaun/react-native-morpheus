import React, { useMemo, useEffect, useId } from "react";
import { useTray } from "./context";

const TrayScopeContext = React.createContext<string | null>(null);

export const useTrayScope = () => React.useContext(TrayScopeContext);

export const TrayRoot: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { registerTray } = useTray();
  const reactId = useId();
  const trayId = useMemo(() => `tray-${reactId}`, [reactId]);

const parsed = (() => {
    const outside: React.ReactNode[] = [];
    const fullScreenSteps: boolean[] = [];
    const contents: any[] = [];
    let footer: any;

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) {
        outside.push(child);
        return;
      }

      const name = (child.type as any)?.displayName;

      if (name === "TrayContent") {
        fullScreenSteps.push(!!(child.props as any).fullScreen);
      contents.push(() => child as React.ReactElement);
        return;
      }

      if (name === "TrayFooter") {
    footer = () => child as React.ReactElement;
        return;
      }

      outside.push(child);
    });

  return { outside, contents, footer, fullScreenSteps };
})();

const registrationSignature = useMemo(
  () =>
    React.Children.toArray(children)
      .map((child) => {
        if (!React.isValidElement(child)) {
          return "outside";
        }

        const name = (child.type as any)?.displayName ?? "unknown";
        const fullScreen = (child.props as any)?.fullScreen ? "fs" : "sheet";
        const key = child.key ?? "nokey";

        return `${name}:${fullScreen}:${key}`;
      })
      .join("|"),
  [children],
);

useEffect(() => {
  registerTray(trayId, {
    contents: parsed.contents,
    footer: parsed.footer,
    fullScreenSteps: parsed.fullScreenSteps,
  });
}, [trayId, registerTray, registrationSignature]);

  return (
    <TrayScopeContext.Provider value={trayId}>
      {parsed.outside}
      {/* No ActionTray here — provider renders all instances at root level */}
    </TrayScopeContext.Provider>
  );
};

TrayRoot.displayName = "TrayRoot";
