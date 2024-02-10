import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { IoCog, IoPlayOutline, IoRefreshOutline } from 'react-icons/io5';
import { PiSpinnerLight } from 'react-icons/pi';
import { TimerType } from './timer';

export const TimerLoading = () => (
  <Card className='py-5 px-14 flex flex-col gap-4 border-0 animate-in fade-in-0'>
    <div className='flex gap-2 justify-center'>
      {Object.values(TimerType).map((type) => (
        <Button key={type} variant='ghost' className={`font-regular`}>
          {type}
        </Button>
      ))}
    </div>

    <div className='py-0.5' />

    <p className='text-center text-6xl font-extralight flex items-center justify-center'>
      <PiSpinnerLight className='mr-2 h-[3.75rem] animate-spin' />
    </p>
    <div className='flex items-center justify-center'>
      {[1, 2, 3, 4].map((dot) => (
        <div key={dot} className={`h-2 w-2 rounded-full mx-1`} />
      ))}
    </div>
    <div className='flex gap-1 justify-center'>
      <Button variant='ghost' size='icon'>
        <IoPlayOutline />
      </Button>
      <Button variant='ghost' size='icon' disabled={true}>
        <IoRefreshOutline />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='ghost' size='icon' disabled={true}>
            <IoCog />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80'></PopoverContent>
      </Popover>
    </div>
  </Card>
);
