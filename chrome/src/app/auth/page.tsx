import { Metadata } from 'next';
import { UserAuthForm } from './user-auth-form';
import Logo from '@/components/logo';
import ThemeSwitcher from '@/components/theme/theme-switcher';

export const metadata: Metadata = {
  title: 'Pomotimer | Auth',
  description: 'Please identify yourself to proceed.',
};

export default function AuthenticationPage() {
  return (
    <div className='w-screen h-screen flex items-center justify-center border-md flex-col'>
      <div className='absolute top-4 right-4'>
        <ThemeSwitcher />
      </div>
      <div className='container relative flex-col items-center justify-center md:grid lg:max-w-none lg:px-0'>
        <div className='lg:p-8'>
          <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
            <div className='flex flex-col space-y-2 text-center'>
              <Logo className='w-16 h-16 mx-auto mb-3' />
              <h1 className='text-2xl font-semibold tracking-tight'>
                Authenticate
              </h1>
              <p className='text-sm text-muted-foreground'>
                Sign in with your credentials or use socials.
              </p>
            </div>
            <UserAuthForm />
            <p className='px-8 text-center text-sm text-muted-foreground'>
              If you don't have an account, it will be created automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
