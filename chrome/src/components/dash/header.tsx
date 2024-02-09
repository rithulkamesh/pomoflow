import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { notionists } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { signOut } from 'firebase/auth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useToast } from '../ui/use-toast';

const Header: React.FC = () => {
  const avatar = createAvatar(notionists, {
    seed: auth.currentUser!.displayName!,
  });

  const router = useRouter();
  const { toast } = useToast();

  return (
    <div className='flex justify-between items-center h-12 w-screen px-5 my-2'>
      <Image
        src={'/pomoflow-logo.svg'}
        width={50}
        height={50}
        alt='pomoflow logo'
      />
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage
              src={avatar.toDataUriSync()}
              className='dark:bg-white'
            />
            <AvatarFallback>{auth.currentUser?.displayName}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='ml-2 mt-1 p-0'>
          <DropdownMenuLabel>
            <Button
              variant='link'
              onClick={() => {
                void signOut(auth)
                  .catch((e) => {
                    let message = "Couldn't log out";

                    if (e instanceof Error) {
                      message = e.message;
                    }

                    toast({
                      title: 'Error',
                      description: message,
                      variant: 'destructive',
                    });
                  })
                  .then(() => router.push('/'));
              }}
            >
              Log out
            </Button>
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Header;
