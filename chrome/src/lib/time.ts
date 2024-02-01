import { TimerType } from '@/components/dash/timer';
import { SessionDoc } from '@/components/sessions/SessionPage';

export const getTimeByType = (
  timerType: TimerType,
  session: SessionDoc | null
) => {
  if (!session) return 0;

  const { pomodoroTime, shortBreakTime, longBreakTime } = session;

  const timeMapping: Record<TimerType, number> = {
    [TimerType.Pomodoro]: pomodoroTime,
    [TimerType.ShortBreak]: shortBreakTime,
    [TimerType.LongBreak]: longBreakTime,
  };

  return timeMapping[timerType];
};

export const calculateTimeRemaining = (session: SessionDoc) => {
  if (!session.startTime) return;

  const now = Date.now(); // Current time in miliseconds
  const { startTime, pausedTimes, timerType } = session;

  const sessionDuration = getTimeByType(timerType, session) * 60 * 1000;
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
  return Math.floor(remainingTime / 1000);
};
