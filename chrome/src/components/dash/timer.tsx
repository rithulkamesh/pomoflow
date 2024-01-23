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
import { camelize } from '@/lib/utils';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  IoCog,
  IoPauseOutline,
  IoPlayOutline,
  IoRefreshOutline,
} from 'react-icons/io5';

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
}

const PomodoroCard = () => {
  const [pomodoroTime, setPomodoroTime] = useState<number>(25);
  const [shortBreakTime, setShortBreakTime] = useState<number>(5);
  const [longBreakTime, setLongBreakTime] = useState<number>(15);

  const [timeRemaining, setTimeRemaining] = useState(pomodoroTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerType, setTimerType] = useState(TimerType.Pomodoro);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning, timeRemaining]);

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
            },
            { merge: true }
          ).then(() => {
            setPomodoroTime(25);
            setShortBreakTime(5);
            setLongBreakTime(15);
            toast({
              title: 'Success',
              description: 'Default settings applied.',
            });
          });
        }

        setPomodoroTime(data.pomodoroTime);
        setShortBreakTime(data.shortBreakTime);
        setLongBreakTime(data.longBreakTime);
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
  }, [auth.currentUser]);

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
  }, [pomodoroTime, shortBreakTime, longBreakTime, resetTimer]);

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

  return (
    <Card className='py-5 px-14'>
      <div className='flex gap-1 justify-center mt-3'>
        {timerTypes.map((type) => (
          <Button
            key={type}
            variant='outline'
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
      <p className='text-center text-6xl font-extralight mt-2'>
        {formatTime(timeRemaining)}
      </p>
      <div className='flex gap-1 justify-center mt-3'>
        <Button variant='ghost' size='icon' onClick={toggleTimer}>
          {isRunning ? <IoPauseOutline /> : <IoPlayOutline />}
        </Button>
        <Button variant='ghost' size='icon' onClick={resetTimer}>
          <IoRefreshOutline />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='ghost' size='icon'>
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
}) => (
  <div className='grid grid-cols-3 items-center gap-4'>
    <Label htmlFor={label}>{label}</Label>
    <Input
      id={label.toLowerCase().replace(' ', '-')}
      className='col-span-2 h-8'
      value={value}
      type='number'
      onChange={(e) => {
        onChange(+e.target.value, label as TimerType);
      }}
    />
  </div>
);

export default PomodoroCard;
