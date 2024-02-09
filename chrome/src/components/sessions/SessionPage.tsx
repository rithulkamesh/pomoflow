/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
'use client';

import Timer, { TimerType } from '@/components/dash/timer';
import { db } from '@/lib/firebase';
import { calculateTimeRemaining, getTimeByType } from '@/lib/time';
import { camelize } from '@/lib/utils';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import NotionAvatar from '../NotionAvatar';
import { Card } from '../ui/card';
import { useToast } from '../ui/use-toast';

interface Props {
  params: {
    id: string;
  };
  session: SessionDoc;
  isHost: boolean;
  setSession: React.Dispatch<React.SetStateAction<SessionDoc | null>>;
  stopSession: () => Promise<void>;
  guests: SessionGuests;
}

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
  pausedTimes: Pauses[];
  startTime: number;
  deleted?: boolean;
}

export type SessionGuests = {
  id: string;
  lastPingTime: number;
  name: string;
}[];

const SessionPage: React.FC<Props> = ({
  params,
  session,
  isHost,
  setSession,
  stopSession,
  guests,
}) => {
  const sessionRef = useRef<SessionDoc | null>(session);

  const [timeRemaining, setTimeRemaining] = useState<number>(
    calculateTimeRemaining(session) ?? 0
  );

  const dataRef = useRef(doc(db, 'sessions', params.id));
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    sessionRef.current = session;

    if (session.deleted) {
      router.push('/dash');
      toast({
        title: 'Session has been closed.',
        description: 'The session you were in has been stopped by the host.',
      });
    }
  }, [session, router, toast]);

  useEffect(() => {
    const calc = () => {
      if (!sessionRef.current) return;
      const res = calculateTimeRemaining(sessionRef.current);
      if (!res) return;

      if (res > 0) return setTimeRemaining(res);
      if (sessionRef.current.timerType != TimerType.Pomodoro)
        return handleTimerTypeChange(TimerType.Pomodoro);

      const newSession = {
        ...sessionRef.current,
        isRunning: false,
        completedSessions:
          sessionRef.current.completedSessions + 1 <= 4
            ? sessionRef.current.completedSessions + 1
            : 0,
        timerType:
          sessionRef.current.completedSessions === 4
            ? TimerType.LongBreak
            : TimerType.ShortBreak,
        pausedTimes: [],
        sessionStarted: false,
      };

      setSession(newSession);
      void updateDoc(dataRef.current, newSession);
    };
    const interval = setInterval(calc, 1000);

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTimer = () => {
    const now = Date.now();

    if (!session.sessionStarted) {
      const newSession = {
        ...session,
        sessionStarted: true,
        isRunning: true,
        startTime: now,
      };
      setSession(newSession);

      void updateDoc(dataRef.current, newSession);
      return;
    }

    const lastPause = session.pausedTimes.slice(-1)[0];
    const newPausedTimes =
      (lastPause as typeof lastPause | undefined) && lastPause.end === null
        ? [...session.pausedTimes.slice(0, -1), { ...lastPause, end: now }]
        : [...session.pausedTimes, { start: now, end: null }];

    const newSession = {
      ...session,
      isRunning: !session.isRunning,
      pausedTimes: newPausedTimes,
    };

    setSession(newSession);
    void updateDoc(dataRef.current, newSession);
  };

  const resetTimer = () => {
    const newSession = {
      ...session,
      startTime: Date.now(),
      pausedTimes: [],
      isRunning: false,
      sessionStarted: false,
      completedSessions: 0,
      timerType: TimerType.Pomodoro,
    };

    setTimeRemaining(
      getTimeByType(newSession.timerType, sessionRef.current) * 60
    );
    setSession(newSession);
    void updateDoc(dataRef.current, newSession);
  };

  const updateTimer = (value: number, timerType: TimerType) => {
    const newSession = {
      ...session,
      [camelize(timerType) + 'Time']: value,
    };

    setSession(newSession);
    void updateDoc(dataRef.current, newSession);
  };

  const handleTimerTypeChange = (timerType: TimerType) => {
    const newSession = {
      ...session,
      timerType,
      startTime: Date.now(),
      pausedTimes: [],
      isRunning: false,
      sessionStarted: false,
    };

    setSession(newSession);
    setTimeRemaining(
      getTimeByType(newSession.timerType, sessionRef.current) * 60
    );
    void updateDoc(dataRef.current, newSession);
  };

  return (
    <main className='flex flex-col items-center justify-center p-24 gap-6 w-screen h-[calc(100vh-10rem)]'>
      <Timer
        timerType={session.timerType as TimerType}
        isRunning={!!session.isRunning}
        timeRemaining={timeRemaining}
        completedSessions={session.completedSessions}
        pomodoroTime={session.pomodoroTime}
        longBreakTime={session.longBreakTime}
        shortBreakTime={session.shortBreakTime}
        resetTimer={resetTimer}
        updateTimer={updateTimer}
        toggleTimer={toggleTimer}
        handleTimerTypeChange={handleTimerTypeChange}
        actionsDisabled={!isHost}
        stopSession={stopSession}
      />
      <Card className='py-5 px-14 flex flex-col gap-4 animate-in fade-in-0'>
        {guests.slice(0, 5).map((guest, index) => (
          <div key={index} className='flex items-center gap-3'>
            <NotionAvatar name={guest.name} />
            {guest.name}
          </div>
        ))}
        {guests.length > 5 && (
          <div className='flex items-center gap-3'>
            <span>and {guests.length - 5} others</span>
          </div>
        )}
      </Card>
    </main>
  );
};

export default SessionPage;
