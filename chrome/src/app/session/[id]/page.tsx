'use client';

import { TimerLoading } from '@/components/dash/timerLoading';
import SessionPage, {
  SessionDoc,
  SessionGuests,
} from '@/components/sessions/SessionPage';
import { useToast } from '@/components/ui/use-toast';
import { auth, db } from '@/lib/firebase';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
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
      data.hostId === auth.currentUser?.uid && setIsHost(true);

      setSession({ id: ss.id, ...data } as SessionDoc);

      setLoading(false);
    });

    const unsubGuests = onSnapshot(collection(ref, 'guests'), (ss) => {
      if (ss.empty) return setGuests([]);

      const data = ss.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setGuests(data as SessionGuests);
    });

    return () => {
      unsubscribe();
      unsubGuests();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, router]);

  const stopSession = async () =>
    deleteDoc(doc(db, 'sessions', params.id)).then(() => {
      toast({
        title: 'Session stopped',
        description: 'The session has been stopped',
      });
    });

  if (!session || loading)
    return (
      <main className='flex flex-col items-center justify-center p-24 gap-6 w-screen h-[calc(100vh-10rem)]'>
        <TimerLoading />
      </main>
    );

  return <>
    <p>Guest count: {guests.length}</p>

    <SessionPage
      stopSession={stopSession}
      session={session}
      isHost={isHost}
      params={params}
      setSession={setSession}
    />

  </ >;
}
