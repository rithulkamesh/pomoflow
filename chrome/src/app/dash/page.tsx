/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import Timer, { TimerType } from '@/components/dash/timer';
import { TimerLoading } from '@/components/dash/timerLoading';
import { useToast } from '@/components/ui/use-toast';
import { volumeAtom } from '@/lib/atoms';
import { auth, db } from '@/lib/firebase';
import { camelize, playAudio } from '@/lib/utils';
import axios from 'axios';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export interface UserConfig {
  id: string;
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
}

const Dash: React.FC = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [userConfig, setUserConfig] = useState<UserConfig>({
    id: '',
    pomodoroTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
  });
  const [volume] = useAtom(volumeAtom);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [timerType, setTimerType] = useState(TimerType.Pomodoro);
  const [timeRemaining, setTimeRemaining] = useState(
    userConfig.pomodoroTime * 60
  );
  const [, setCurrentBreakType] = useState(TimerType.Pomodoro);
  const audios = useRef<{
    click: HTMLAudioElement;
    complete: HTMLAudioElement;
  } | null>(null);

  const getTimeByType = (timerType: TimerType) => {
    const { pomodoroTime, shortBreakTime, longBreakTime } = userConfig;

    const timeMapping: Record<TimerType, number> = {
      [TimerType.Pomodoro]: pomodoroTime,
      [TimerType.ShortBreak]: shortBreakTime,
      [TimerType.LongBreak]: longBreakTime,
    };

    return timeMapping[timerType];
  };

  const handleTimerTypeChange = (newTimerType: TimerType) => {
    const newTime = getTimeByType(newTimerType);
    setTimeRemaining(newTime * 60);
    setIsRunning(false);
    setTimerType(newTimerType);
  };

  const toggleTimer = () => {
    void audios.current?.click.play();
    if (timeRemaining > 0) {
      setIsRunning((prevState) => !prevState);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(getTimeByType(timerType) * 60);
    setCompletedSessions(0);
  };

  const updateTimer = (newTime: number, type: TimerType) => {
    if (!auth.currentUser?.uid) return;

    const ref = doc(db, 'users', auth.currentUser.uid);
    setUserConfig({ ...userConfig, [type + 'Time']: newTime });
    void updateDoc(ref, {
      [camelize(type.replace(/ /g, '')) + 'Time']: newTime,
    });
  };

  // Preload audio
  useEffect(() => {
    if (!audios.current) {
      const complete = new Audio('/sfx/timercomplete.mp3');
      const click = new Audio('/sfx/click.mp3');
      [complete, click].forEach((audio) => {
        audio.load();
        audio.preload = 'auto';
      });
      audios.current = { complete, click };
    }

    audios.current.complete.volume = volume / 100;
    audios.current.click.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    if (!auth.currentUser?.uid) return;
    const ref = doc(db, 'users', auth.currentUser.uid);

    const unsubscribe = onSnapshot(
      ref,
      (ss) => {
        const data = { ...ss.data(), id: ss.id } as UserConfig;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!ss.data() || data.pomodoroTime === undefined) {
          const defaultConfig = {
            pomodoroTime: 25,
            shortBreakTime: 5,
            longBreakTime: 15,
          };

          void setDoc(ref, defaultConfig, { merge: true })
            .then(() => setUserConfig({ id: ss.id, ...defaultConfig }))
            .finally(() => setLoading(false));
        } else {
          setUserConfig(data);
          setLoading(false);
        }
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
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning) {
      if (timeRemaining <= 0) {
        setIsRunning(false);
        playAudio('/sfx/timercomplete.mp3', volume / 100);

        if (timerType === TimerType.Pomodoro) {
          setCompletedSessions((prevSessions) => prevSessions + 1);
        }

        const isLongBreak =
          completedSessions > 0 && completedSessions % 4 === 0;
        const newType = isLongBreak
          ? TimerType.LongBreak
          : TimerType.ShortBreak;

        setTimerType(newType);
        setTimeRemaining(getTimeByType(newType) * 60);
      } else {
        timer = setInterval(() => {
          setTimeRemaining((prevTime) => prevTime - 1);
        }, 1000);
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, timeRemaining, completedSessions, timerType, volume]);

  useEffect(() => {
    const isLongBreak = completedSessions > 0 && completedSessions % 4 === 0;
    const newBreakType = isLongBreak
      ? TimerType.LongBreak
      : TimerType.ShortBreak;
    setCurrentBreakType(newBreakType);
  }, [completedSessions]);

  useEffect(() => {
    setTimeRemaining(getTimeByType(timerType) * 60);
    setCompletedSessions(0);
  }, [userConfig]);

  const createSession = () => {
    if (!auth.currentUser?.uid) return;

    setLoading(true);
    axios
      .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/session`)
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        router.push(`/session/${res.data.id}`);
      })
      .catch((err) => {
        toast({
          title: 'Error',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          description: err.message as string,
          variant: 'destructive',
        });
      });

    setLoading(false);
  };

  if (loading)
    return (
      <main className='flex flex-col items-center justify-center p-24 gap-6 w-screen h-[calc(100vh-10rem)]'>
        <TimerLoading />
      </main>
    );

  console.log(auth.currentUser?.getIdTokenResult());

  return (
    <main className='flex flex-col items-center justify-center p-24 gap-6 w-screen h-[calc(100vh-10rem)]'>
      <Timer
        timerType={timerType}
        isRunning={isRunning}
        timeRemaining={timeRemaining}
        completedSessions={completedSessions}
        pomodoroTime={userConfig.pomodoroTime}
        longBreakTime={userConfig.longBreakTime}
        shortBreakTime={userConfig.shortBreakTime}
        resetTimer={resetTimer}
        updateTimer={updateTimer}
        toggleTimer={toggleTimer}
        handleTimerTypeChange={handleTimerTypeChange}
        handleMultiplayer={createSession}
      />
    </main>
  );
};

export default Dash;
