import { notionists } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface Props {
  name: string;
}

const NotionAvatar: React.FC<Props> = ({ name }) => {
  const avatar = createAvatar(notionists, {
    seed: name,
  });
  return (
    <Avatar>
      <AvatarImage src={avatar.toDataUriSync()} className='dark:bg-white' />
      <AvatarFallback>{name}</AvatarFallback>
    </Avatar>
  );
};

export default NotionAvatar;
