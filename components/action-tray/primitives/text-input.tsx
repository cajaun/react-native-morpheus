import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { TextInput, TextInputProps } from "react-native";
import { useTray } from "../context/context";
import { useTrayScope } from "../context/root";

export const TrayTextInput = forwardRef<TextInput, TextInputProps>(
  (props, forwardedRef) => {
    const ref = useRef<TextInput>(null);
    const trayId = useTrayScope();
    const { registerFocusable } = useTray();

    useImperativeHandle(forwardedRef, () => ref.current as TextInput);

    useEffect(() => {
      return registerFocusable(trayId, ref);
    }, [registerFocusable, trayId]);

    return <TextInput ref={ref} {...props} />;
  },
);

TrayTextInput.displayName = "TrayTextInput";
