import { useEffect } from 'react';
import Animated, { useSharedValue, withSpring, useAnimatedProps } from 'react-native-reanimated';
import Svg, { Path, ClipPath, Defs, Rect, Line, G } from 'react-native-svg';
import { colors } from '@/theme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type Props = { progress: number };

const W = 200;
const H = 270;

// Outer trapezoid
const TOP_Y = 14;
const BOT_Y = 256;
const OT_X1 = 14, OT_X2 = 186; // outer top: width 172
const OB_X1 = 42, OB_X2 = 158; // outer bottom: width 116

// Inner clip (inset by wall thickness)
const WALL = 4;
const IT_X1 = OT_X1 + WALL,  IT_X2 = OT_X2 - WALL; // 18, 182 → width 164
const IB_X1 = OB_X1 + WALL,  IB_X2 = OB_X2 - WALL; // 46, 154 → width 108
const ITOP_Y = TOP_Y + 3;
const IBOT_Y = BOT_Y - 2;
const INNER_H = IBOT_Y - ITOP_Y; // ~239

const CX = W / 2;
const TW = IT_X2 - IT_X1; // 164
const BW = IB_X2 - IB_X1; // 108

const OUTER_PATH =
  `M ${OT_X1},${TOP_Y} L ${OT_X2},${TOP_Y} L ${OB_X2},${BOT_Y} L ${OB_X1},${BOT_Y} Z`;
const INNER_PATH =
  `M ${IT_X1},${ITOP_Y} L ${IT_X2},${ITOP_Y} L ${IB_X2},${IBOT_Y} L ${IB_X1},${IBOT_Y} Z`;

// Tick marks at 25 / 50 / 75 % from bottom
const TICKS = [0.25, 0.5, 0.75].map((fFromBot) => {
  const fFromTop = 1 - fFromBot;
  const halfW = (TW + fFromTop * (BW - TW)) / 2;
  const y = ITOP_Y + fFromTop * INNER_H;
  return { x1: CX - halfW + 10, x2: CX + halfW - 10, y };
});

export function WaterGlass({ progress }: Props) {
  const fillH = useSharedValue(0);

  useEffect(() => {
    fillH.value = withSpring(
      Math.min(1, Math.max(0, progress)) * INNER_H,
      { damping: 18, stiffness: 100 },
    );
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    y: IBOT_Y - fillH.value,
    height: Math.max(0, fillH.value),
  }));

  const isComplete = progress >= 1;
  const rimColor = isComplete ? colors.primary : 'rgba(255,255,255,0.30)';

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <ClipPath id="glass-clip">
          <Path d={INNER_PATH} />
        </ClipPath>
      </Defs>

      {/* Glass body background */}
      <Path d={OUTER_PATH} fill="#0a1c2e" opacity={0.92} />

      {/* Animated water fill clipped to trapezoid */}
      <G clipPath="url(#glass-clip)">
        {/* Deep water layer */}
        <AnimatedRect
          x={0} width={W}
          fill="#0d47a1"
          opacity={0.95}
          animatedProps={animatedProps}
        />
        {/* Surface shimmer layer */}
        <AnimatedRect
          x={0} width={W}
          fill="#1e88e5"
          opacity={0.40}
          animatedProps={animatedProps}
        />
      </G>

      {/* Tick marks */}
      {TICKS.map(({ x1, x2, y }) => (
        <Line
          key={y}
          x1={x1} y1={y} x2={x2} y2={y}
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={1}
          strokeDasharray="4,3"
        />
      ))}

      {/* Glass wall stroke */}
      <Path d={OUTER_PATH} fill="none" stroke={rimColor} strokeWidth={2} />

      {/* Left glass reflection — wide */}
      <Line
        x1={OT_X1 + 7}  y1={TOP_Y + 10}
        x2={OB_X1 + 5}  y2={BOT_Y - 12}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={5}
        strokeLinecap="round"
      />
      {/* Left glass reflection — narrow */}
      <Line
        x1={OT_X1 + 17} y1={TOP_Y + 10}
        x2={OB_X1 + 12} y2={BOT_Y - 12}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Rim highlight */}
      <Line
        x1={OT_X1} y1={TOP_Y}
        x2={OT_X2} y2={TOP_Y}
        stroke={rimColor}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </Svg>
  );
}
