import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export default function NeutralIcon({ size = 24, color = '#000' }: { size?: number, color?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      {/* Face outline */}
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
      {/* Eyes */}
      <Circle cx={9} cy={10} r={1} fill={color} />
      <Circle cx={15} cy={10} r={1} fill={color} />
      {/* Straight mouth */}
      <Path
        d="M8 15h8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
