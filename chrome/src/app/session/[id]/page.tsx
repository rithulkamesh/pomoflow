'use client';

import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { SessionDoc } from '@/app/dash/page';

type Props = {
  params: {
    id: string;
  };
};

const SessionPage: React.FC<Props> = ({ params }) => {
  const router = useRouter();
  const [session, setSession] = useState<SessionDoc | null>(null);
  useEffect(() => {
    const ref = doc(db, 'sessions', params.id);
    const unsubscribe = onSnapshot(ref, (ss) => {
      if (!ss.data()) {
        router.push('/404');
      }
    });

    return () => unsubscribe();
  });
  return <div>Welcome to a session lmfao, id: {params.id}</div>;
};

export default SessionPage;
