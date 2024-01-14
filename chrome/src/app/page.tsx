'use client';
import ThemeSwitcher from '@/components/theme/theme-switcher';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const pb = createBrowserClient();
  const router = useRouter();
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <ThemeSwitcher />
      <Button
        onClick={() => {
          pb.authStore.clear();
          router.push('/auth');
        }}
      >
        Log Out{' '}
      </Button>
    </main>
  );
}
