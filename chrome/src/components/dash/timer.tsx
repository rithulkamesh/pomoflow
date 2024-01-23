import { useEffect, useState } from 'react';
import {
  IoCog,
  IoPauseOutline,
  IoPlayOutline,
  IoRefreshOutline,
} from 'react-icons/io5';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface TimerProps {
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
}

enum TimerType {
  Pomodoro = 'Pomodoro',
  ShortBreak = 'Short Break',
  LongBreak = 'Long Break',
}

const PomodoroCard = ({
  pomodoroTime,
  shortBreakTime,
  longBreakTime,
}: TimerProps) => {
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

  const timerTypes = [
    TimerType.Pomodoro,
    TimerType.ShortBreak,
    TimerType.LongBreak,
  ];

  const handleTimerTypeChange = (newTimerType: TimerType) => {
    setTimerType((prevTimerType) => {
      const newTime =
        newTimerType === TimerType.Pomodoro
          ? pomodoroTime
          : newTimerType === TimerType.ShortBreak
          ? shortBreakTime
          : longBreakTime;

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

  return (
    <Card className='py-5 px-14'>
      <div className='flex gap-1 justify-center mt-3'>
        {timerTypes.map((type) => (
          <Button
            key={type}
            variant='outline'
            onClick={() => handleTimerTypeChange(type)}
            className={
              timerType === type
                ? 'dark:bg-white dark:text-black bg-black text-white'
                : ''
            }
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
        <Button variant='ghost' size='icon' onClick={resetTimer}>
          <IoCog />
        </Button>
      </div>
    </Card>
  );
};

export default PomodoroCard;
