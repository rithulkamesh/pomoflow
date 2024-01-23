import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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

const PomodoroCard = () => {
  const [pomodoroTime, setPomodoroTime] = useState<number>(25);
  const [shortBreakTime, setShortBreakTime] = useState<number>(5);
  const [longBreakTime, setLongBreakTime] = useState<number>(15);

  const [timeRemaining, setTimeRemaining] = useState(pomodoroTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerType, setTimerType] = useState(TimerType.Pomodoro);

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
    resetTimer();
  }, [pomodoroTime, shortBreakTime, longBreakTime]);

  const timerTypes = [
    TimerType.Pomodoro,
    TimerType.ShortBreak,
    TimerType.LongBreak,
  ];

  const handleTimerTypeChange = (newTimerType: TimerType) => {
    setTimerType((prevType) => {
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
                  onChange={setPomodoroTime}
                />
                <SettingInput
                  label='Short Break'
                  value={shortBreakTime}
                  onChange={setShortBreakTime}
                />
                <SettingInput
                  label='Long Break'
                  value={longBreakTime}
                  onChange={setLongBreakTime}
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
  onChange: (value: number) => void;
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
      onChange={(e) => {
        onChange(+e.target.value);
      }}
    />
  </div>
);

export default PomodoroCard;
