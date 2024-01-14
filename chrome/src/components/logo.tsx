import React from 'react';
import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ width = 32, height = 32, className }) => {
  return (
    <Image
      src='/pomotimer.svg'
      alt='Pomotimer'
      className={`w-auto invert dark:invert-0 ${className}`}
      width={width}
      height={height}
    />
  );
};

export default Logo;
