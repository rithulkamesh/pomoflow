'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FaDiscord } from 'react-icons/fa6';
import { createBrowserClient } from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const pb = createBrowserClient();
  const router = useRouter();

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }

  async function discordLogin(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    await pb
      .collection('users')
      .authWithOAuth2({ provider: 'discord' });

    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }
  
  if (pb.authStore.isValid) {
    router.push('/');
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className='grid gap-2'>
          <div className='grid gap-1'>
            <Label className='sr-only' htmlFor='email'>
              Email
            </Label>
            <Input
              id='email'
              placeholder='name@example.com'
              type='email'
              autoCapitalize='none'
              autoComplete='email'
              autoCorrect='off'
              disabled={isLoading}
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
            )}
            Sign In with Email
          </Button>
        </div>
      </form>
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant='outline'
        type='button'
        disabled={isLoading}
        onClick={discordLogin}
      >
        {isLoading ? (
          <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
        ) : (
          <FaDiscord className='mr-2 h-4 w-4' />
        )}{' '}
        Discord
      </Button>
    </div>
  );
}
