'use client';

import Timer, { TimerType } from '@/components/dash/timer';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

type Props = {
  params: {
    id: string;
  };
};

interface Pauses {
  start: number;
  end: number | null;
}

export interface SessionDoc {
  id: string;
  isRunning: boolean;
  timerType: TimerType;
  hostId: string;
  sessionStarted: boolean;
  completedSessions: number;
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  guests: Array<string>;
  pausedTimes: Pauses[];
  startTime: number;
}

const SessionPage: React.FC<Props> = ({ params }) => {
  const [session, setSession] = useState<SessionDoc | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const sessionRef = useRef<SessionDoc | null>(null);

  const [completedSessions] = useState(0);
  const [isHost, setIsHost] = useState(false);

  const dataRef = useRef(doc(db, 'sessions', params.id));

  useEffect(() => {
    dataRef.current = doc(db, 'sessions', params.id);
    const unsubscribe = onSnapshot(dataRef.current, (ss) => {
      const data = ss.data();
      if (!data) return router.push('/404');
      data.hostId === auth.currentUser?.uid && setIsHost(true);

      setSession({ id: ss.id, ...data } as SessionDoc);
      sessionRef.current = { id: ss.id, ...data } as SessionDoc;

      setTimeRemaining(getTimeByType((data as SessionDoc).timerType) * 60);

      setLoading(false);
    });

    return () => unsubscribe();
  }, [params.id, router]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (
        !sessionRef.current ||
        !sessionRef.current.isRunning ||
        !sessionRef.current.startTime
      )
        return;

      const now = Date.now(); // Current time in miliseconds
      const { startTime, pausedTimes, timerType } = sessionRef.current;

      const sessionDuration = getTimeByType(timerType) * 60 * 1000;
      const elapsedTime = now - startTime;

      const pausedTime =
        pausedTimes.length === 0
          ? 0
          : pausedTimes.reduce((acc, curr) => {
              const { start, end } = curr;
              if (end === null) {
                return acc + (now - start);
              }
              return acc + (end - start);
            }, 0);

      const remainingTime = sessionDuration - elapsedTime + pausedTime;
      setTimeRemaining(Math.floor(remainingTime / 1000));
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTimeByType = (timerType: TimerType) => {
    if (!sessionRef.current) return 0;

    const { pomodoroTime, shortBreakTime, longBreakTime } = sessionRef.current;

    const timeMapping: Record<TimerType, number> = {
      [TimerType.Pomodoro]: pomodoroTime,
      [TimerType.ShortBreak]: shortBreakTime,
      [TimerType.LongBreak]: longBreakTime,
    };

    return timeMapping[timerType];
  };

  const [timeRemaining, setTimeRemaining] = useState<number>(
    getTimeByType(session?.timerType || TimerType.Pomodoro) * 60 || 0
  );

  const toggleTimer = () => {
    if (!session) return;

    const now = Date.now();

    if (!session.sessionStarted) {
      const newSession = {
        ...session,
        sessionStarted: true,
        isRunning: true,
        startTime: now,
      };
      setSession(newSession);
      updateDoc(dataRef.current, newSession as any);
      return;
    }

    const lastPause = session.pausedTimes.slice(-1)[0];
    const newPausedTimes =
      lastPause && lastPause.end === null
        ? [...session.pausedTimes.slice(0, -1), { ...lastPause, end: now }]
        : [...session.pausedTimes, { start: now, end: null }];

    const newSession = {
      ...session,
      isRunning: !session.isRunning,
      pausedTimes: newPausedTimes,
    };

    setSession(newSession);
    updateDoc(dataRef.current, newSession as any);
  };

  const resetTimer = () => {
    if (!session) return;

    const newSession = {
      ...session,
      startTime: Date.now(),
      pausedTimes: [],
      isRunning: false,
      sessionStarted: false,
    };

    setTimeRemaining(getTimeByType(newSession.timerType) * 60);
    setSession(newSession);
    updateDoc(dataRef.current, newSession);
  };

  const updateTimer = (value: number, timerType: TimerType) => {
    // Update the session pomodoro timer details

    console.error('Todo');
  };

  const handleTimerTypeChange = (timerType: TimerType) => {
    if (!session) return;

    const newSession = {
      ...session,
      timerType,
      startTime: Date.now(),
      pausedTimes: [],
      isRunning: false,
    };

    setSession(newSession);
    setTimeRemaining(getTimeByType(newSession.timerType) * 60);
    updateDoc(dataRef.current, newSession);
  };

  return (
    <main className='flex flex-col items-center justify-center p-24 gap-6 w-screen h-[calc(100vh-10rem)]'>
      <Timer
        loading={loading}
        timerType={session?.timerType as TimerType}
        isRunning={!!session?.isRunning}
        timeRemaining={timeRemaining}
        completedSessions={completedSessions}
        pomodoroTime={session?.pomodoroTime as number}
        longBreakTime={session?.longBreakTime as number}
        shortBreakTime={session?.shortBreakTime as number}
        resetTimer={resetTimer}
        updateTimer={updateTimer}
        toggleTimer={toggleTimer}
        handleTimerTypeChange={handleTimerTypeChange}
        actionsDisabled={!isHost}
      />
      {isHost && 'Host'}
    </main>
  );
};

export default SessionPage;
