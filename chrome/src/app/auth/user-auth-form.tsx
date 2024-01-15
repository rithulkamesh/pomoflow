'use client';

import { Button } from '@/components/ui/button';
import { app } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { getAuth, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth/cordova';
import React, { useEffect } from 'react';
import { FaGoogle, FaSpinner } from 'react-icons/fa6';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(app), (user) => {
      console.log(user);
      if (user) {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            Continue with
          </span>
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <Button
          variant='outline'
          type='button'
          disabled={isLoading}
          onClick={(e) => {
            e.preventDefault();
            const provider = new GoogleAuthProvider();
            signInWithPopup(getAuth(app), provider);
            setIsLoading(true);
          }}
        >
          {isLoading ? (
            <FaSpinner className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <FaGoogle className='mr-2 h-4 w-4' />
          )}{' '}
          Google
        </Button>
      </div>
    </div>
  );
}
