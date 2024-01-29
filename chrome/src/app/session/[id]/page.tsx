'use client';

import { SessionDoc } from '@/app/dash/page';
import Timer, { TimerType } from '@/components/dash/timer';
import { useToast } from '@/components/ui/use-toast';
import { volumeAtom } from '@/lib/atoms';
import { auth, db } from '@/lib/firebase';
import { camelize, playAudio } from '@/lib/utils';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

// Not sure if this is the best approach but I don't want to think right now
const DEFAULTS = {
  id: '',
  pomodoroTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
};

type Props = {
  params: {
    id: string;
  };
};

const SessionPage: React.FC<Props> = ({ params }) => {
  const [session, setSession] = useState<SessionDoc | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);

  const [volume] = useAtom(volumeAtom);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [timerType, setTimerType] = useState(TimerType.Pomodoro);
  const [host, isHost] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(
    (session?.pomodoroTime ?? DEFAULTS.pomodoroTime) * 60
  );

  useEffect(() => {
    const ref = doc(db, 'sessions', params.id);
    const unsubscribe = onSnapshot(ref, (ss) => {
      if (!ss.data()) {
        router.push('/404');
      }
      if (ss.data()?.hostId === auth.currentUser?.uid) {
        isHost(true);
      }
      setSession({ ...ss.data(), id: ss.id } as SessionDoc);
      setLoading(false);
    });

    return () => unsubscribe();
  });
  const [currentBreakType, setCurrentBreakType] = useState(TimerType.Pomodoro);
  const audios = useRef<{
    click: HTMLAudioElement;
    complete: HTMLAudioElement;
  } | null>(null);

  const getTimeByType = (timerType: TimerType) => {
    const { pomodoroTime, shortBreakTime, longBreakTime } = session;

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
    audios.current?.click.play();
    if (timeRemaining > 0) {
      setIsRunning((prevState) => !prevState);
      const ref = doc(db, 'sessions', params.id);
      updateDoc(ref, { isRunning: !isRunning });
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(getTimeByType(timerType) * 60);
    setCompletedSessions(0);
  };

  const updateTimer = (newTime: number, type: TimerType) => {
    const ref = doc(db, 'sessions', params.id);
    setSession({ ...session, [type + 'Time']: newTime });
    updateDoc(ref, { [camelize(type.replace(/ /g, '')) + 'Time']: newTime });
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
    if (!session) return;
    if (!auth.currentUser?.uid) return;
    if (session.guests.includes(auth.currentUser.uid)) return;
    if (session.hostId === auth.currentUser.uid) return;

    const ref = doc(db, 'sessions', session.id);
    updateDoc(ref, { guests: [...session.guests] });
  }, [session]);
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

  return (
    <main className='flex flex-col items-center justify-center p-24 gap-6 w-screen h-[calc(100vh-10rem)]'>
      <Timer
        loading={loading}
        timerType={timerType}
        isRunning={!!(!host && session?.isRunning)}
        timeRemaining={timeRemaining}
        completedSessions={completedSessions}
        pomodoroTime={session?.pomodoroTime as number}
        longBreakTime={session?.longBreakTime as number}
        shortBreakTime={session?.shortBreakTime as number}
        resetTimer={resetTimer}
        updateTimer={updateTimer}
        toggleTimer={toggleTimer}
        handleTimerTypeChange={handleTimerTypeChange}
        actionsDisabled={session?.hostId !== auth.currentUser?.uid}
      />
      {host && 'Host'}
    </main>
  );
};

export default SessionPage;
