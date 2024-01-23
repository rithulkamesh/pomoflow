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
    Pomodoro,
    ShortBreak,
    LongBreak,
}

const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
};

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

        return () => {
            clearInterval(timer);
        };
    }, [isRunning, timeRemaining]);

    const toggleTimer = () => {
        if (timeRemaining > 0) {
            setIsRunning((prevState) => !prevState);
        }
    };

    const resetTimer = () => {
        setTimerType((prevTimerType) => {
            switch (prevTimerType) {
                case TimerType.Pomodoro:
                    setTimeRemaining(pomodoroTime * 60);
                    break;
                case TimerType.ShortBreak:
                    setTimeRemaining(shortBreakTime * 60);
                    break;
                case TimerType.LongBreak:
                    setTimeRemaining(longBreakTime * 60);
                    break;
            }
            setIsRunning(false);
            return prevTimerType;
        });
    };

    const handleTimerTypeChange = (timerType: TimerType) => {
        setTimerType(timerType);
        resetTimer();
    };

    return (
        <Card className='py-5 px-14'>
            <div className='flex gap-1 justify-center mt-3'>
                <Button
                    variant='outline'
                    onClick={() => handleTimerTypeChange(TimerType.Pomodoro)}
                    className={
                        timerType === TimerType.Pomodoro
                            ? 'dark:bg-white dark:text-black bg-black text-white'
                            : ''
                    }
                >
                    Pomodoro
                </Button>
                <Button
                    variant='outline'
                    onClick={() => handleTimerTypeChange(TimerType.ShortBreak)}
                    className={
                        timerType === TimerType.ShortBreak
                            ? 'dark:bg-white dark:text-black bg-black text-white'
                            : ''
                    }
                >
                    Short Break
                </Button>
                <Button
                    variant='outline'
                    onClick={() => handleTimerTypeChange(TimerType.LongBreak)}
                    className={
                        timerType === TimerType.LongBreak
                            ? 'dark:bg-white dark:text-black bg-black text-white'
                            : ''
                    }
                >
                    Long Break
                </Button>
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
