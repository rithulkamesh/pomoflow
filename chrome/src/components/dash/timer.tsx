import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { auth, db } from '@/lib/firebase';
import { camelize, playAudio } from '@/lib/utils';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  IoCog,
  IoPauseOutline,
  IoPlayOutline,
  IoRefreshOutline,
} from 'react-icons/io5';
import { PiSpinnerLight } from 'react-icons/pi';
import { Slider } from '../ui/slider';

enum TimerType {
  Pomodoro = 'Pomodoro',
  ShortBreak = 'Short Break',
  LongBreak = 'Long Break',
}

interface UserConfig {
  id: string;
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  volume: number;
}

const PomodoroCard = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [playable, isPlayable] = useState(false);
  const [volume, setVolume] = useState<number>(33);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState<number>(25);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [longBreakTime, setLongBreakTime] = useState<number>(15);
  const [timerType, setTimerType] = useState(TimerType.Pomodoro);
  const [shortBreakTime, setShortBreakTime] = useState<number>(5);
  const [timeRemaining, setTimeRemaining] = useState(pomodoroTime * 60);
  const [currentBreakType, setCurrentBreakType] = useState(TimerType.Pomodoro);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeRemaining <= 0) {
      setIsRunning(false);
      playAudio('/sfx/timercomplete.mp3', volume / 100);
      // Increment completed sessions only during Pomodoro
      if (timerType === TimerType.Pomodoro) {
        setCompletedSessions((prevSessions) => prevSessions + 1);
      }

      if (completedSessions > 0 && completedSessions % 4 === 0) {
        setTimerType((prevType) => {
          const newType =
            prevType === TimerType.Pomodoro
              ? TimerType.LongBreak
              : TimerType.Pomodoro;

          setTimeRemaining(getTimeByType(newType) * 60);
          return newType;
        });
      } else {
        setTimerType((prevType) => {
          const newType =
            prevType === TimerType.Pomodoro
              ? TimerType.ShortBreak
              : TimerType.Pomodoro;

          setTimeRemaining(getTimeByType(newType) * 60);
          return newType;
        });
      }
    }

    if (isRunning && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning, timeRemaining, completedSessions, timerType]);

  useEffect(() => {
    if (completedSessions > 0 && completedSessions % 4 === 0) {
      setCurrentBreakType(TimerType.LongBreak);
    } else {
      setCurrentBreakType(
        currentBreakType === TimerType.Pomodoro
          ? TimerType.ShortBreak
          : TimerType.Pomodoro
      );
    }
  }, [completedSessions]);

  useEffect(() => {
    if (!auth.currentUser?.uid) return;
    const ref = doc(db, 'users', auth.currentUser.uid);

    const unsubscribe = onSnapshot(
      ref,
      (ss) => {
        const data = { ...ss.data(), id: ss.id } as UserConfig;

        if (!ss.data()) {
          return setDoc(
            ref,
            {
              pomodoroTime: 25,
              shortBreakTime: 5,
              longBreakTime: 15,
              volume: 66,
            },
            { merge: true }
          ).then(() => {
            setPomodoroTime(25);
            setShortBreakTime(5);
            setLongBreakTime(15);
            setVolume(66);
            setLoading(false);
          });
        }

        setPomodoroTime(data.pomodoroTime);
        setShortBreakTime(data.shortBreakTime);
        setLongBreakTime(data.longBreakTime);
        setVolume(data.volume);
        setLoading(false);
      },
      (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    );

    return () => unsubscribe();
  });

  const timerTypes = [
    TimerType.Pomodoro,
    TimerType.ShortBreak,
    TimerType.LongBreak,
  ];

  const handleTimerTypeChange = (newTimerType: TimerType) => {
    setTimerType(() => {
      const newTime = getTimeByType(newTimerType);

      setTimeRemaining(newTime * 60);
      setIsRunning(false);

      return newTimerType;
    });
  };

  const toggleTimer = () => {
    if (timeRemaining > 0) {
      setIsRunning((prevState) => !prevState);
    }

    playAudio('/sfx/click.mp3', volume / 100);
  };

  const resetTimer = () => handleTimerTypeChange(timerType);

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
    resetTimer();
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
    const ref = doc(db, 'users', auth.currentUser?.uid as string);
    updateDoc(ref, { volume: value[0] });
    isPlayable(true);
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
        {timerTypes.map((type) => (
          <Button
            key={type}
            variant='outline'
            disabled={loading}
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
          disabled={loading}
          onClickCapture={() => isPlayable(true)}
        >
          {isRunning ? <IoPauseOutline /> : <IoPlayOutline />}
        </Button>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => {
            resetTimer();
            setCompletedSessions(0);
          }}
          disabled={loading}
        >
          <IoRefreshOutline />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='ghost' size='icon' disabled={loading}>
              <IoCog />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80'>
            <div className='grid gap-4'>
              <div className='space-y-2'>
                <h4 className='font-medium leading-none'>Settings</h4>
                <p className='text-sm text-muted-foreground'>
                  Adjust clock settings for optimum productivity.
                </p>
              </div>
              <div className='grid gap-2'>
                <SettingInput
                  label='Pomodoro'
                  value={pomodoroTime}
                  onChange={updateTimer}
                />
                <SettingInput
                  label='Short Break'
                  value={shortBreakTime}
                  onChange={updateTimer}
                />
                <SettingInput
                  label='Long Break'
                  value={longBreakTime}
                  onChange={updateTimer}
                />
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

interface SettingInputProps {
  label: string;
  value: number;
  onChange: (value: number, timerType: TimerType) => void;
}

const SettingInput: React.FC<SettingInputProps> = ({
  label,
  value,
  onChange,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(e.target.value, 10);
    if (!isNaN(inputValue) && inputValue >= 0 && Number.isInteger(inputValue)) {
      onChange(inputValue, label as TimerType);
    }
  };

  return (
    <div className='grid grid-cols-3 items-center gap-4'>
      <Label htmlFor={label}>{label}</Label>
      <Input
        id={label.toLowerCase().replace(' ', '-')}
        className='col-span-2 h-8'
        value={value}
        type='number'
        onChange={handleInputChange}
      />
    </div>
  );
};

export default PomodoroCard;
