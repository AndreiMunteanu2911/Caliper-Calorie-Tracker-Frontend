import {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  ReduceMotion,
} from 'react-native-reanimated';

export const motion = {
  enter: FadeInDown.duration(150)
    .withInitialValues({ opacity: 0, transform: [{ translateY: 6 }] })
    .reduceMotion(ReduceMotion.System),
  exit: FadeOut.duration(90).reduceMotion(ReduceMotion.System),
  layout: LinearTransition.duration(150).reduceMotion(ReduceMotion.System),
  soft: FadeIn.duration(130).reduceMotion(ReduceMotion.System),
} as const;
