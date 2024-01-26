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
import { auth, db } from '@/lib/firebase';
import { camelize, playAudio } from '@/lib/utils';
import { doc, updateDoc } from 'firebase/firestore';
import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import {
  IoCog,
  IoPauseOutline,
  IoPlayOutline,
  IoRefreshOutline,
} from 'react-icons/io5';
import { PiSpinnerLight } from 'react-icons/pi';

enum TimerType {
  Pomodoro = 'Pomodoro',
  ShortBreak = 'Short Break',
  LongBreak = 'Long Break',
}

interface PomodoroCardProps {
  actionsDisabled?: boolean;
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  loading: boolean;
  setPomodoroTime: (value: number) => void;
  setShortBreakTime: (value: number) => void;
  setLongBreakTime: (value: number) => void;
}

const PomodoroCard: React.FC<PomodoroCardProps> = ({
  actionsDisabled,
  pomodoroTime,
  shortBreakTime,
  longBreakTime,
  loading,
  setPomodoroTime,
  setShortBreakTime,
  setLongBreakTime,
}) => {
  const [playable, setPlayable] = useState(false);
  const [volume, setVolume] = useAtom(volumeAtom);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [timerType, setTimerType] = useState(TimerType.Pomodoro);
  const [timeRemaining, setTimeRemaining] = useState(pomodoroTime * 60);
  const [_, setCurrentBreakType] = useState(TimerType.Pomodoro);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleTimerComplete = () => {
      setIsRunning(false);
      playAudio('/sfx/timercomplete.mp3', volume / 100);

      if (timerType === TimerType.Pomodoro)
        setCompletedSessions((prevSessions) => prevSessions + 1);

      const isLongBreak = completedSessions > 0 && completedSessions % 4 === 0;
      const newType = isLongBreak ? TimerType.LongBreak : TimerType.ShortBreak;

      setTimerType(newType);
      setTimeRemaining(getTimeByType(newType) * 60);
    };

    if (isRunning && timeRemaining <= 0) {
      handleTimerComplete();
    }

    if (isRunning && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning, timeRemaining, completedSessions, timerType]);

  useEffect(() => {
    const isLongBreak = completedSessions > 0 && completedSessions % 4 === 0;
    const newBreakType = isLongBreak
      ? TimerType.LongBreak
      : TimerType.ShortBreak;
    setCurrentBreakType(newBreakType);
  }, [completedSessions]);

  const handleTimerTypeChange = (newTimerType: TimerType) => {
    const newTime = getTimeByType(newTimerType);
    setTimeRemaining(newTime * 60);
    setIsRunning(false);
    setTimerType(newTimerType);
  };

  const toggleTimer = () => {
    if (timeRemaining > 0) {
      setIsRunning((prevState) => !prevState);
    }
    playAudio('/sfx/click.mp3', volume / 100);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const getTimeByType = (timerType: TimerType) => {
    switch (timerType) {
      case TimerType.Pomodoro:
        return pomodoroTime;
      case TimerType.ShortBreak:
        return shortBreakTime;
      case TimerType.LongBreak:
        return longBreakTime;
      default:
        return 0;
    }
  };

  useEffect(() => {
    setTimeRemaining(pomodoroTime * 60);
    setCompletedSessions(0);
  }, [pomodoroTime, shortBreakTime, longBreakTime]);

  const updateTimer = (newTime: number, timerType: TimerType) => {
    const ref = doc(db, 'users', auth.currentUser?.uid as string);

    switch (timerType) {
      case TimerType.Pomodoro:
        setPomodoroTime(newTime);
        break;
      case TimerType.ShortBreak:
        setShortBreakTime(newTime);
        break;
      case TimerType.LongBreak:
        setLongBreakTime(newTime);
        break;
      default:
        break;
    }

    updateDoc(ref, {
      [camelize(timerType.replace(/ /g, '')) + 'Time']: newTime,
    });
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setPlayable(true);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (volume !== 0) {
      timer = setTimeout(() => {
        if (playable) playAudio('/sfx/timercomplete.mp3', volume / 100);
      }, 200);
    }

    return () => clearTimeout(timer);
  }, [volume]);

  return (
    <Card className='py-5 px-14'>
      <div className='flex gap-1 justify-center mt-3'>
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
      <p className='text-center text-6xl font-extralight mt-2 flex items-center justify-center'>
        {loading ? (
          <PiSpinnerLight className='mr-2 h-[3.75rem] animate-spin' />
        ) : (
          formatTime(timeRemaining)
        )}
      </p>
      <div className='flex items-center justify-center mt-2'>
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
      <div className='flex gap-1 justify-center mt-3'>
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
          onClick={() => {
            setIsRunning(false);
            setTimeRemaining(getTimeByType(timerType) * 60);
            setCompletedSessions(0);
          }}
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
      </div>
    </Card>
  );
};

export default PomodoroCard;
