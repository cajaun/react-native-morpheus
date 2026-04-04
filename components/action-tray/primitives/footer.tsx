import React, { useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";

export const TrayFooter: React.FC<{
  children: React.ReactNode;
  step?: number;
  total?: number;
      style?: StyleProp<ViewStyle>;
  className?: string;
}> = ({ children, step, total,}) => {

  useEffect(() => {
  console.log("[TrayFooter] props", {
    step,
    total,
  });
}, [step, total]);

  return React.cloneElement(children as any, { step, total });
};

TrayFooter.displayName = "TrayFooter";