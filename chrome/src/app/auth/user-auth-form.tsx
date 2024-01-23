'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { FaGoogle, FaSpinner } from 'react-icons/fa6';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
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
            setIsLoading(true);
            signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => {
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
