import { auth } from '@/lib/firebase';
import { thumbs } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import React from 'react';
import ThemeSwitcher from '../theme/theme-switcher';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const Header: React.FC = () => {
  const avatar = createAvatar(thumbs, {
    seed: auth.currentUser?.displayName as string,
  });

  const router = useRouter();

  return (
    <div className='flex justify-between items-center h-12 w-screen px-5 my-2'>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src={avatar.toDataUriSync()} />
            <AvatarFallback>{auth.currentUser?.displayName}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='ml-2 mt-1 p-0'>
          <DropdownMenuLabel>
            <Button
              variant='link'
              onClick={() => {
                signOut(auth);
                router.push('/auth');
              }}
            >
              Log out
            </Button>
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>

      <ThemeSwitcher />
    </div>
  );
};

export default Header;
