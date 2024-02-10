'use client';

import ThemeSwitcher from '@/components/theme/theme-switcher';
import Link from 'next/link';

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <Link href='/dash'>Go to Dash</Link>
      <ThemeSwitcher />
    </main>
  );
}
