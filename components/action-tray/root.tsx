import React, { useMemo, useEffect, useRef, useId } from "react";
import { useTray } from "./context";

const TrayScopeContext = React.createContext<string | null>(null);

export const useTrayScope = () => {
  return React.useContext(TrayScopeContext);
};

type TrayRootProps = {
  children: React.ReactNode;
};

export const TrayRoot: React.FC<TrayRootProps> = ({ children }) => {
  const { registerTray } = useTray();

  const reactId = useId();

  const trayId = useMemo(() => `tray-${reactId}`, [reactId]);
  const parsed = useMemo(() => {
    const outsideNodes: React.ReactNode[] = [];
    const contentFactories: (() => React.ReactNode)[] = [];
    let footerFactory: (() => React.ReactNode) | undefined;

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) {
        outsideNodes.push(child);
        return;
      }

      const name = (child.type as any)?.displayName;

      if (name === "TrayContent") {
        contentFactories.push((stepKey?: string, skipEntering?: boolean) =>
          React.cloneElement(child, { stepKey, skipEntering }),
        );
        return;
      }

      if (name === "TrayFooter") {
        footerFactory = () => child;
        return;
      }

      outsideNodes.push(child);
    });

    return {
      outside: outsideNodes,
      contents: contentFactories,
      footer: footerFactory,
    };
  }, [children]);

  useEffect(() => {
    registerTray(trayId, {
      contents: parsed.contents,
      footer: parsed.footer,
    });
  }, [trayId, parsed.contents, parsed.footer, registerTray]);

  return (
    <TrayScopeContext.Provider value={trayId}>
      {parsed.outside}
    </TrayScopeContext.Provider>
  );
};

TrayRoot.displayName = "TrayRoot";
