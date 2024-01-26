import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { volumeAtom } from '@/lib/atoms';
import { playAudio } from '@/lib/utils';
import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { FaPeopleArrows } from 'react-icons/fa6';
import {
  IoCog,
  IoPauseOutline,
  IoPersonAddOutline,
  IoPlayOutline,
  IoRefreshOutline,
} from 'react-icons/io5';
import { PiSpinnerLight } from 'react-icons/pi';

export enum TimerType {
  Pomodoro = 'Pomodoro',
  ShortBreak = 'Short Break',
  LongBreak = 'Long Break',
}

interface PomodoroCardProps {
  loading: boolean;
  isRunning: boolean;
  pomodoroTime: number;
  timerType: TimerType;
  longBreakTime: number;
  timeRemaining: number;
  shortBreakTime: number;
  actionsDisabled?: boolean;
  completedSessions: number;
  resetTimer: () => void;
  toggleTimer: () => void;
  handleTimerTypeChange: (timerType: TimerType) => void;
  updateTimer: (value: number, timerType: TimerType) => void;
}

const PomodoroCard: React.FC<PomodoroCardProps> = ({
  actionsDisabled,
  pomodoroTime,
  shortBreakTime,
  longBreakTime,
  loading,
  completedSessions,
  timerType,
  timeRemaining,
  isRunning,
  updateTimer,
  toggleTimer,
  handleTimerTypeChange,
  resetTimer,
}) => {
  const [playable, setPlayable] = useState(false);
  const [volume, setVolume] = useAtom(volumeAtom);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setPlayable(true);
  };

  useEffect(() => {
    if (volume !== 0) {
      const timer = setTimeout(() => {
        document.querySelectorAll('audio').forEach((audio) => audio.pause());
        if (playable) playAudio('/sfx/timercomplete.mp3', volume / 100);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [volume]);

  return (
    <Card className='py-5 px-14 flex flex-col gap-4 border-0'>
      <div className='flex gap-1 justify-center'>
        {Object.values(TimerType).map((type) => (
          <Button
            key={type}
            variant='outline'
            disabled={loading || actionsDisabled}
            onClick={() => handleTimerTypeChange(type)}
            className={`${
              timerType === type
                ? 'dark:bg-white dark:text-black bg-black text-white'
                : ''
            } font-regular`}
          >
            {type}
          </Button>
        ))}
      </div>
      <p className='text-center text-6xl font-extralight flex items-center justify-center'>
        {loading ? (
          <PiSpinnerLight className='mr-2 h-[3.75rem] animate-spin' />
        ) : (
          formatTime(timeRemaining)
        )}
      </p>
      <div className='flex items-center justify-center'>
        {[1, 2, 3, 4].map((dot) => (
          <div
            key={dot}
            className={`h-2 w-2 rounded-full mx-1 ${
              dot <= completedSessions % 4
                ? 'dark:bg-white bg-black'
                : 'dark:bg-zinc-800 bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className='flex gap-1 justify-center'>
        <Button
          variant='ghost'
          size='icon'
          onClick={toggleTimer}
          disabled={loading || actionsDisabled}
          onClickCapture={() => setPlayable(true)}
        >
          {isRunning ? <IoPauseOutline /> : <IoPlayOutline />}
        </Button>
        <Button
          variant='ghost'
          size='icon'
          onClick={resetTimer}
          disabled={loading || actionsDisabled}
        >
          <IoRefreshOutline />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              disabled={loading || actionsDisabled}
            >
              <IoCog />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80'>
            <div className='grid gap-4'>
              <div className='space-y-2'>
                <h4 className='font-medium leading-none'>Settings</h4>
                <p className='text-sm text-muted-foreground'>
                  Adjust clock settings for optimum productivity (in minutes)
                </p>
              </div>
              <div className='grid gap-2'>
                <div className='grid grid-cols-3 items-center gap-4'>
                  <Label htmlFor='pomodoro'>Pomodoro</Label>
                  <Input
                    id='pomodoro'
                    className='col-span-2 h-8'
                    value={pomodoroTime}
                    type='number'
                    onChange={(e) =>
                      updateTimer(
                        parseInt(e.target.value, 10),
                        TimerType.Pomodoro
                      )
                    }
                  />
                </div>
                <div className='grid grid-cols-3 items-center gap-4'>
                  <Label htmlFor='short-break'>Short Break</Label>
                  <Input
                    id='short-break'
                    className='col-span-2 h-8'
                    value={shortBreakTime}
                    type='number'
                    onChange={(e) =>
                      updateTimer(
                        parseInt(e.target.value, 10),
                        TimerType.ShortBreak
                      )
                    }
                  />
                </div>
                <div className='grid grid-cols-3 items-center gap-4'>
                  <Label htmlFor='long-break'>Long Break</Label>
                  <Input
                    id='long-break'
                    className='col-span-2 h-8'
                    value={longBreakTime}
                    type='number'
                    onChange={(e) =>
                      updateTimer(
                        parseInt(e.target.value, 10),
                        TimerType.LongBreak
                      )
                    }
                  />
                </div>
                <div className='grid grid-cols-3 gap-5'>
                  <Label htmlFor='volume'>Volume</Label>
                  <Slider
                    defaultValue={[volume]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                  />
                  <span className='text-sm text-muted-foreground'>
                    {volume}%
                  </span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          variant='ghost'
          size='icon'
          disabled={loading || actionsDisabled}
        >
          <IoPersonAddOutline />
        </Button>
      </div>
    </Card>
  );
};

export default PomodoroCard;
