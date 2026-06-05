import { useEffect } from 'react';
import Animated, { useSharedValue, withSpring, useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type Props = { progress: number };

const SIZE = 200;
const CX = 100;
const CY = 100;
const R = 95;
const FILL_MAX = R * 2; // 190px

// Mercator-like projection centered at 10°E
// x = (lon + 170) / 1.8
// y = (90 - lat) / 0.9

const NORTH_AMERICA =
  'M 1,39 L 3,29 L 7,21 L 14,22 L 19,33 ' +
  'L 26,46 L 26,56 L 29,62 L 33,74 L 37,79 ' +
  'L 39,82 L 46,77 L 51,91 ' +
  'L 41,79 L 41,70 L 45,68 L 46,67 L 48,69 ' +
  'L 50,72 L 50,69 L 52,61 ' +
  'L 56,53 L 65,48 L 63,42 ' +
  'L 58,30 L 47,28 L 28,17 Z';

const GREENLAND =
  'M 42,14 L 52,9 L 64,10 L 73,17 L 75,26 ' +
  'L 70,32 L 63,36 L 52,38 L 44,36 L 40,28 L 40,18 Z';

const SOUTH_AMERICA =
  'M 52,91 L 46,96 L 47,102 L 52,107 L 60,107 ' +
  'L 76,108 L 79,118 L 75,128 L 68,138 L 60,144 ' +
  'L 56,155 L 58,162 L 65,164 L 71,158 L 72,148 ' +
  'L 72,136 L 70,126 L 72,112 L 68,98 L 58,93 Z';

const EUROPE =
  'M 89,59 L 91,61 L 96,59 L 98,52 L 103,58 ' +
  'L 107,57 L 109,55 L 115,48 L 117,30 ' +
  'L 111,23 L 110,28 L 108,34 L 104,38 ' +
  'L 104,42 L 108,44 L 109,50 L 103,46 ' +
  'L 99,43 L 97,45 L 92,45 L 92,35 ' +
  'L 97,35 L 98,30 L 92,34 L 89,42 Z';

const UK = 'M 88,37 L 86,41 L 87,47 L 90,47 L 92,44 L 91,38 Z';

const IRELAND = 'M 84,42 L 83,46 L 85,49 L 87,47 L 87,41 Z';

const AFRICA =
  'M 90,62 L 100,59 L 106,64 L 111,66 L 116,76 ' +
  'L 118,88 L 123,88 L 117,104 L 117,111 L 114,120 ' +
  'L 104,138 L 102,131 L 101,120 L 101,106 L 97,96 ' +
  'L 93,94 L 92,94 L 88,91 L 86,88 L 85,83 ' +
  'L 87,69 L 90,62 Z';

const ASIA =
  'M 114,59 L 118,54 L 122,52 L 128,44 ' +
  'L 128,28 L 140,19 L 160,19 L 172,22 ' +
  'L 168,35 L 162,52 L 162,65 L 162,72 ' +
  'L 155,82 L 152,96 L 145,83 L 138,91 ' +
  'L 135,88 L 135,76 L 129,72 L 127,76 ' +
  'L 125,84 L 119,87 L 116,83 L 113,70 ' +
  'L 111,66 L 114,59 Z';

const AUSTRALIA =
  'M 158,124 L 168,113 L 176,117 L 180,128 ' +
  'L 180,142 L 172,146 L 162,143 L 158,135 Z';

const ANTARCTICA =
  'M 15,175 L 40,168 L 70,165 L 100,163 L 130,165 ' +
  'L 160,168 L 185,175 L 185,200 L 100,200 L 15,200 Z';

export function WaterEarth({ progress }: Props) {
  const fillH = useSharedValue(0);

  useEffect(() => {
    fillH.value = withSpring(Math.min(1, Math.max(0, progress)) * FILL_MAX, {
      damping: 18,
      stiffness: 100,
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    y: CY + R - fillH.value,
    height: Math.max(0, fillH.value),
  }));

  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Defs>
        <ClipPath id="earth-clip">
          <Circle cx={CX} cy={CY} r={R} />
        </ClipPath>
      </Defs>

      <G clipPath="url(#earth-clip)">
        {/* Ocean */}
        <Circle cx={CX} cy={CY} r={R} fill="#0d2137" />

        {/* Animated water fill rising from bottom */}
        <AnimatedRect x={0} width={SIZE} fill="#1565c0" opacity={0.88} animatedProps={animatedProps} />

        {/* Continents on top */}
        <Path d={ANTARCTICA} fill="#dce8f0" />
        <Path d={NORTH_AMERICA} fill="#2e7d32" />
        <Path d={GREENLAND} fill="#a5d6a7" />
        <Path d={SOUTH_AMERICA} fill="#388e3c" />
        <Path d={EUROPE} fill="#2e7d32" />
        <Path d={UK} fill="#2e7d32" />
        <Path d={IRELAND} fill="#2e7d32" />
        <Path d={AFRICA} fill="#388e3c" />
        <Path d={ASIA} fill="#2e7d32" />
        <Path d={AUSTRALIA} fill="#388e3c" />

        {/* Atmosphere highlight */}
        <Circle cx={CX - 22} cy={CY - 30} r={36} fill="rgba(255,255,255,0.05)" />
      </G>

      {/* Globe rim */}
      <Circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} />
    </Svg>
  );
}
