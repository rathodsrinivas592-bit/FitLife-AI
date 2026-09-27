import React from 'react';

interface MetricRingProps {
  progress: number; // 0 to 100 or ratio
  size?: number;
  strokeWidth?: number;
  color?: string; // Tailwind stroke color or hex
  backgroundColor?: string;
  children?: React.ReactNode;
  animate?: boolean;
}

export const MetricRing: React.FC<MetricRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  color = '#10B981', // Emerald default
  backgroundColor = 'rgba(51, 65, 85, 0.4)',
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Clamp progress between 0 and 100 for visual ring
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
        />
        {/* Active progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      )}
    </div>
  );
};
