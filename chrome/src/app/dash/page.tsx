'use client';

import Timer from '@/components/dash/timer';
import { useToast } from '@/components/ui/use-toast';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export interface UserConfig {
  id: string;
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
}

export default function Dash() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [userConfig, setUserConfig] = useState<UserConfig>({
    id: '',
    pomodoroTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
  });

  useEffect(() => {
    if (!auth.currentUser?.uid) return;
    const ref = doc(db, 'users', auth.currentUser.uid);

    const unsubscribe = onSnapshot(
      ref,
      (ss) => {
        const data = { ...ss.data(), id: ss.id } as UserConfig;

        if (!ss.data()) {
          return setDoc(
            ref,
            {
              pomodoroTime: 25,
              shortBreakTime: 5,
              longBreakTime: 15,
            },
            { merge: true }
          ).then(() => {
            setUserConfig({
              id: ss.id,
              pomodoroTime: 25,
              shortBreakTime: 5,
              longBreakTime: 15,
            });
            setLoading(false);
          });
        }

        setUserConfig(data);
        setLoading(false);
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

  return (
    <main className='flex flex-col items-center justify-center p-24'>
      <Timer
        loading={loading}
        pomodoroTime={userConfig.pomodoroTime}
        shortBreakTime={userConfig.shortBreakTime}
        longBreakTime={userConfig.longBreakTime}
        setPomodoroTime={(time) =>
          setUserConfig({ ...userConfig, pomodoroTime: time })
        }
        setShortBreakTime={(time) =>
          setUserConfig({ ...userConfig, shortBreakTime: time })
        }
        setLongBreakTime={(time) =>
          setUserConfig({ ...userConfig, longBreakTime: time })
        }
      />
    </main>
  );
}
