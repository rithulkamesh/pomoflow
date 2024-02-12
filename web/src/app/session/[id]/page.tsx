'use client';

import { TimerLoading } from '@/components/dash/timerLoading';
import SessionPage, {
  SessionDoc,
  SessionGuests,
} from '@/components/sessions/SessionPage';
import { useToast } from '@/components/ui/use-toast';
import { auth, db } from '@/lib/firebase';
import axios from 'axios';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Props {
  params: {
    id: string;
  };
}

export default function Page({ params }: Props) {
  const [session, setSession] = useState<SessionDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [guests, setGuests] = useState<SessionGuests>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);

    const ref = doc(db, 'sessions', params.id);
    const unsubscribe = onSnapshot(ref, (ss) => {
      setLoading(false);

      const data = ss.data();
      if (!data) return router.push('/dash');
      if (data.deleted) {
        toast({
          title: 'Session Deleted!',
          description: 'The session was stopped by the host.',
        });
        return router.push('/dash');
      }
      data.hostId === auth.currentUser?.uid && setIsHost(true);

      setSession({ id: ss.id, ...data } as SessionDoc);
      (async () => {
        const token = await auth.currentUser?.getIdToken();
        axios({
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/sessions/${params.id}/join`,
          method: 'POST',
          headers: {
            Authorization: token,
          },
        }).catch((err) => {
          toast({
            title: 'Error',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            description: err.message as string,
            variant: 'destructive',
          });
          setLoading(false);
        });
        // eslint-disable-next-line @typescript-eslint/no-empty-function
      })().catch(() => {});

      setLoading(false);
    });

    const unsubGuests = onSnapshot(collection(ref, 'guests'), (ss) => {
      if (ss.empty) return setGuests([]);

      let data = ss.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SessionGuests;

      data = data.filter(
        (guest) =>
          Math.floor(new Date().getTime() / 1000 - guest.lastPingTime) < 12
      );

      console.log('setting guests', data);

      setGuests(data);
    });

    return () => {
      unsubscribe();
      unsubGuests();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, router]);

  const stopSession = async () => {
    const token = await auth.currentUser?.getIdToken();

    if (isHost) {
      await axios({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/sessions/${params.id}`,
        method: 'DELETE',
        headers: {
          Authorization: token,
        },
      })
        .then(() => {
          router.push('/dash');
          toast({
            title: 'Session Deleted!',
            description: 'The session has been stopped successfully.',
          });
        })
        .catch((err) => {
          toast({
            title: 'Error',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            description: err.message as string,
            variant: 'destructive',
          });
        });
      return;
    }

    await axios({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/sessions/${params.id}/leave`,
      method: 'POST',
      headers: {
        Authorization: token,
      },
    })
      .then(() => {
        router.push('/dash');
      })
      .catch((err) => {
        toast({
          title: 'Error',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          description: err.message as string,
          variant: 'destructive',
        });
      });
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const interval = setInterval(async () => {
      const token = await auth.currentUser?.getIdToken();

      await axios({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/sessions/${params.id}/ping`,
        method: 'POST',
        headers: {
          Authorization: token,
        },
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!session || loading)
    return (
      <main className='flex flex-col items-center justify-center p-24 gap-6 w-screen h-[calc(100vh-10rem)]'>
        <TimerLoading />
      </main>
    );

  return (
    <>
      <SessionPage
        stopSession={stopSession}
        session={session}
        isHost={isHost}
        params={params}
        setSession={setSession}
        guests={guests}
      />
    </>
  );
}
