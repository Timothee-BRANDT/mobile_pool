import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export default function HappyIcon({ size = 24, color = '#000' }: { size?: number, color?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
      <Circle cx={9} cy={10} r={1} fill={color} />
      <Circle cx={15} cy={10} r={1} fill={color} />
      <Path
        d="M8 15c1.5 1 3 1 4 1s2.5 0 4 -1"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}