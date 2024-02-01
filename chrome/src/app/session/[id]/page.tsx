'use client';

import SessionPage, { SessionDoc } from '@/components/sessions/SessionPage';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Props = {
  params: {
    id: string;
  };
};

export default function Page({ params }: Props) {
  const [session, setSession] = useState<SessionDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);

    const ref = doc(db, 'sessions', params.id);
    const unsubscribe = onSnapshot(ref, (ss) => {
      setLoading(false);
      const data = ss.data();
      if (!data) return router.push('/404');
      data.hostId === auth.currentUser?.uid && setIsHost(true);

      setSession({ id: ss.id, ...data } as SessionDoc);

      setLoading(false);
    });

    return () => unsubscribe();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, router]);

  if (!session || loading) return 'loading...';

  return (
    <SessionPage
      session={session}
      isHost={isHost}
      params={params}
      setSession={setSession}
    />
  );
}
