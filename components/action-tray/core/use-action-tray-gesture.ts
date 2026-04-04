import { useMemo } from "react";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS, withSpring } from "react-native-reanimated";

type Params = {
  fullScreen: boolean;
  translateY: { value: number };
  totalHeight: { value: number };
  context: { value: { y: number } };
  onRequestClose: () => void;
};

export const useActionTrayGesture = ({
  fullScreen,
  translateY,
  totalHeight,
  context,
  onRequestClose,
}: Params) => {
  return useMemo(() => {
    return Gesture.Pan()
      .enabled(!fullScreen)

      .onStart(() => {
      
        context.value = { y: Math.max(0, translateY.value) };
      })

      .onUpdate((e) => {
        const raw = e.translationY + context.value.y;

     
        const resisted = raw > 0 ? raw : raw * 0.2;

    
        translateY.value = Math.max(0, resisted);
      })

      .onEnd((e) => {
        const closeThreshold = totalHeight.value * 0.4;

        const shouldClose =
          translateY.value > closeThreshold ||
          (translateY.value > 20 && e.velocityY > 1200); 

        if (shouldClose) {
          runOnJS(onRequestClose)();
        } else {
          translateY.value = withSpring(0, {
            damping: 25,
            stiffness: 250,
            overshootClamping: true,
          });
        }
      });
  }, [fullScreen, onRequestClose, context, totalHeight, translateY]);
};