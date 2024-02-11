'use client';

import Header from '@/components/dash/header';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

const SessionLayout: React.FC<Props> = ({ children }) => {
  const [signedIn, setSignedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return router.push('/auth');

      setSignedIn(true);
    });
    return () => unsubscribe();
  });

  if (!signedIn) {
    return null;
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default SessionLayout;
