import React from "react";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { StyleSheet } from "react-native";

type BackdropProps = {
  onTap: () => void;
  isRendered: boolean;
  progress: SharedValue<number>;
};

const Backdrop: React.FC<BackdropProps> = React.memo(
  ({ isRendered, onTap, progress }) => {
    const rBackdropStyle = useAnimatedStyle(() => {
      return {
        opacity: progress.value,
      };
    }, [progress]);

    return (
      <Animated.View
        onTouchStart={onTap}
        pointerEvents={isRendered ? "auto" : "none"}
        style={[
          {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.3)",
          },
          rBackdropStyle,
        ]}
      />
    );
  },
);

export { Backdrop };
