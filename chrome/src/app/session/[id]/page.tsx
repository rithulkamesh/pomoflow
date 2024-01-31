'use client';

import Timer, { TimerType } from '@/components/dash/timer';
import { useToast } from '@/components/ui/use-toast';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

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

interface Pauses {
  start: number;
  end: number | null;
}

export interface SessionDoc {
  id: string;
  isRunning: boolean;
  timerType: TimerType;
  hostId: string;
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
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);

  const [completedSessions] = useState(0);
  const [timerType] = useState(TimerType.Pomodoro);
  const [isHost, setIsHost] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(
    (session?.pomodoroTime ?? DEFAULTS.pomodoroTime) * 60
  );

  useEffect(() => {
    const ref = doc(db, 'sessions', params.id);
    const unsubscribe = onSnapshot(ref, (ss) => {
      const data = ss.data();
      if (!data) return router.push('/404');
      data.hostId === auth.currentUser?.uid && setIsHost(true);
      setSession({ id: ss.id, ...data } as SessionDoc);
      setTimeRemaining((data.pomodoroTime ?? DEFAULTS.pomodoroTime) * 60);
      setLoading(false);
    });

    return () => unsubscribe();
  });
  const ref = doc(db, 'sessions', params.id);

  useEffect(() => {
    if (!session || !session.isRunning || !session.startTime) return;

    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const { startTime, pausedTimes, pomodoroTime } = session;

      const remainingTime = pomodoroTime * 60 - (now - startTime);
      const pausedTime = pausedTimes.reduce((acc, curr) => {
        const { start, end } = curr;
        if (end === null) {
          return acc + (now - start);
        }
        return acc + (end - start);
      }, 0);

      setTimeRemaining(remainingTime - pausedTime);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const toggleTimer = () => {
    if (!session) return;

    const lastPause = session.pausedTimes.slice(-1)[0];

    const newPausedTimes =
      lastPause && lastPause.end === null
        ? [
            ...session.pausedTimes.slice(0, -1),
            { ...lastPause, end: Date.now() },
          ]
        : [...session.pausedTimes, { start: Date.now(), end: null }];

    const newSession: SessionDoc = {
      ...session,
      isRunning: !session.isRunning,
      pausedTimes: newPausedTimes,
    };

    setSession(newSession);
    updateDoc(ref, newSession as any);
  };

  const resetTimer = () => {
    if (!session) return;
    const newSession: SessionDoc = {
      ...session,
      startTime: Date.now(),
      pausedTimes: [],
      isRunning: false,
    };
    setSession(newSession);
    updateDoc(ref, newSession as any);
  };

  const updateTimer = (value: number, timerType: TimerType) => {
    // Update the session pomodoro timer details

    console.error('Todo');
  };

  const handleTimerTypeChange = (timerType: TimerType) => {
    // Update the timer to a new timer type, and then update the session
    console.error('Todo');
  };

  return (
    <main className='flex flex-col items-center justify-center p-24 gap-6 w-screen h-[calc(100vh-10rem)]'>
      <Timer
        loading={loading}
        timerType={timerType}
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
        actionsDisabled={!setIsHost}
      />
      {isHost && 'Host'}
    </main>
  );
};

export default SessionPage;
