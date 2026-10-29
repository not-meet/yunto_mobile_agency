import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

// A campaign's progress: a green arc on a white track around a green dot, filling in on mount
// and easing to a new value. The dot is drawn in SVG too (small rounded views render square on
// some Android devices).

const SIZE = 48;
const STROKE = 4.67;
const RADIUS = (SIZE - STROKE) / 2 - 0.5;
const LENGTH = 2 * Math.PI * RADIUS;
const GREEN = '#10B981';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ProgressRing({ percent }: { percent: number }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? percent / 100 : 0);

  useEffect(() => {
    progress.set(
      reduceMotion ? percent / 100 : withDelay(200, withTiming(percent / 100, { duration: 800 })),
    );
  }, [percent, progress, reduceMotion]);

  const arc = useAnimatedProps(() => ({ strokeDashoffset: LENGTH * (1 - progress.get()) }));

  return (
    <View className="h-12 w-12">
      <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#FFFFFF"
          strokeWidth={STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={GREEN}
          strokeWidth={STROKE}
          strokeDasharray={LENGTH}
          fill="none"
          animatedProps={arc}
        />
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={5} fill={GREEN} />
      </Svg>
    </View>
  );
}
