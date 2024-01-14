import ThemeSwitcher from '@/components/theme/theme-switcher';

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <ThemeSwitcher />
    </main>
  );
}
