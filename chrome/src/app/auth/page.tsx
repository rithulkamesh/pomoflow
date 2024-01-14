import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { UserAuthForm } from '@/components/user-auth-form';

export const metadata: Metadata = {
  title: 'Pomotimer | Auth',
  description: 'Please identify yourself to proceed.',
};

export default function AuthenticationPage() {
  return (
    <div className='w-screen h-screen flex items-center justify-center border-md flex-col'>
      <div className='container relative flex-col items-center justify-center md:grid lg:max-w-none lg:px-0'>
        <div className='lg:p-8'>
          <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
            <div className='flex flex-col space-y-2 text-center'>
              <Image
                src='/pomotimer.svg'
                alt='Pomotimer'
                className='h-14 w-auto'
                width={15}
                height={15}
              />
              <h1 className='text-2xl font-semibold tracking-tight'>
                Authenticate
              </h1>
              <p className='text-sm text-muted-foreground'>
                Sign in with a magic link or continue with socials.
              </p>
            </div>
            <UserAuthForm />
            <p className='px-8 text-center text-sm text-muted-foreground'>
              By clicking continue, you agree to our{' '}
              <Link
                href='/terms'
                className='underline underline-offset-4 hover:text-primary'
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href='/privacy'
                className='underline underline-offset-4 hover:text-primary'
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
