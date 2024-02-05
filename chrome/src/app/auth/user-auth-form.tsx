'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { auth, db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import React, { HTMLAttributes, useEffect } from 'react';
import { FaGoogle, FaSpinner } from 'react-icons/fa6';

export function UserAuthForm({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (auth.currentUser) return router.push('/dash');

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      setIsLoading(false);
      router.push('/dash');
    });

    return () => unsubscribe();
  }, [router]);

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
            setIsLoading(true);

            signInWithPopup(auth, new GoogleAuthProvider())
              .then((res) =>
                setDoc(doc(db, 'users', res.user.uid), {
                  id: res.user.uid,
                  name: res.user.displayName,
                  email: res.user.email,
                  pomodoroTime: 25,
                  shortBreakTime: 5,
                  longBreakTime: 15,
                })
              )
              .catch(() => {
                toast({
                  title: 'Authentication Error',
                  description:
                    "Couldn't authenticate with Google, Please try again.",
                });
                setIsLoading(false);
              });
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
