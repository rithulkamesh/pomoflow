'use client';

import Timer, { TimerType } from '@/components/dash/timer';
import { db } from '@/lib/firebase';
import { calculateTimeRemaining, getTimeByType } from '@/lib/time';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  params: {
    id: string;
  };
  session: SessionDoc;
  isHost: boolean;
  setSession: React.Dispatch<React.SetStateAction<SessionDoc | null>>;
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
  guests: string[];
  pausedTimes: Pauses[];
  startTime: number;
}

const SessionPage: React.FC<Props> = ({
  params,
  session,
  isHost,
  setSession,
}) => {
  const sessionRef = useRef<SessionDoc | null>(session);

  const [completedSessions] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(
    getTimeByType(session.timerType, session) * 60 || 0
  );

  const dataRef = useRef(doc(db, 'sessions', params.id));

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    const calc = () => {
      if (!sessionRef.current) return;
      const res = calculateTimeRemaining(sessionRef.current);
      if (!res) return;

      setTimeRemaining(res);
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
    };

    setTimeRemaining(
      getTimeByType(newSession.timerType, sessionRef.current) * 60
    );
    setSession(newSession);
    void updateDoc(dataRef.current, newSession);
  };

  const updateTimer = (value: number, timerType: TimerType) => {
    console.log(value, timerType);
    // Update the session pomodoro timer details

    console.error('Todo');
  };

  const handleTimerTypeChange = (timerType: TimerType) => {
    const newSession = {
      ...session,
      timerType,
      startTime: Date.now(),
      pausedTimes: [],
      isRunning: false,
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
        completedSessions={completedSessions}
        pomodoroTime={session.pomodoroTime}
        longBreakTime={session.longBreakTime}
        shortBreakTime={session.shortBreakTime}
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
