'use client';

import React, { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FaDiscord, FaGoogle, FaPaperPlane, FaSpinner } from 'react-icons/fa6';
import { createBrowserClient } from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { FaSignInAlt } from 'react-icons/fa';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const pb = createBrowserClient();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState<string>('');
  const [stepTwo, setStepTwo] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    if (email === '')
      return toast({
        title: 'Invalid Email.',
        description: 'Please enter a valid email address.',
      });

    if (!stepTwo) {
      setStepTwo(true);
      // TODO: Implement logic to send Emails
      toast({
        title: 'Email Sent.',
        description: 'Please check your email for a sign-in code.',
      });
      return setIsLoading(true);
    }

    // TODO: Implement logic to verify code
  }

  async function oAuth(event: React.SyntheticEvent, provider: string) {
    event.preventDefault();
    setIsLoading(true);

    const authData = await pb.collection('users').authWithOAuth2({ provider });

    if (authData) router.push('/');
  }

  useEffect(() => {
    if (pb.authStore.isValid) {
      router.push('/');
    }
  });

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className='grid gap-2'>
          <div className='grid gap-1'>
            <Label className='sr-only' htmlFor='email'>
              Email
            </Label>
            <div className='flex flex-col gap-1 mb-2'>
              <Input
                id='email'
                placeholder='hi@rithul.dev'
                type='email'
                autoCapitalize='none'
                autoComplete='email'
                autoCorrect='off'
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              {stepTwo && (
                <div className='relative'>
                  <Label className='sr-only' htmlFor='code'>
                    Code
                  </Label>
                  <Input
                    id='code'
                    placeholder='xxxx-xxxx'
                    type='text'
                    autoCapitalize='characters'
                    autoComplete='off'
                    autoCorrect='off'
                    maxLength={9}
                    value={code}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const sanitizedValue = inputValue.replace(
                        /[^A-Za-z0-9]/g,
                        ''
                      );

                      if (sanitizedValue.length <= 4) {
                        setCode(sanitizedValue);
                      } else if (sanitizedValue.length <= 8) {
                        setCode(
                          sanitizedValue.slice(0, 4) +
                            '-' +
                            sanitizedValue.slice(4)
                        );
                      }
                    }}
                    className={`transition-all duration-300 transform border rounded-md focus:outline-none focus:border-primary`}
                  />
                </div>
              )}
            </div>
          </div>
          <Button disabled={isLoading && !stepTwo}>
            {stepTwo ? (
              <div className='flex gap-1 items-center justify-center text-center'>
                <FaSignInAlt /> Enter
              </div>
            ) : (
              <div className='flex gap-1 items-center justify-center text-center group'>
                <FaPaperPlane /> Send Sign-in Code
              </div>
            )}
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
      <div className='flex flex-col gap-2'>
        <Button
          variant='outline'
          type='button'
          disabled={isLoading}
          onClick={(e) => oAuth(e, 'google')}
        >
          {isLoading ? (
            <FaSpinner className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <FaGoogle className='mr-2 h-4 w-4' />
          )}{' '}
          Google
        </Button>
        <Button
          variant='outline'
          type='button'
          disabled={isLoading}
          onClick={(e) => oAuth(e, 'discord')}
        >
          {isLoading ? (
            <FaSpinner className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <FaDiscord className='mr-2 h-4 w-4' />
          )}{' '}
          Discord
        </Button>
      </div>
    </div>
  );
}
