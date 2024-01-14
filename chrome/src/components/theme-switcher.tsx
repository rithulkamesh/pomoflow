'use client';

import { Button } from './ui/button';
import { useTheme } from 'next-themes';
import { IoSunny } from 'react-icons/io5';
import { LuMoon } from 'react-icons/lu';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant='link'
      size='icon'
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <IoSunny className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
      <LuMoon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
      <span className='sr-only'>Toggle theme</span>
    </Button>
  );
};

export default ThemeSwitcher;
