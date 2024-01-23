'use client';

import Header from '@/components/dash/header';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<Props> = ({ children }) => {
  const [signedIn, setSignedIn] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

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
    <html lang='en' suppressHydrationWarning>
      <ThemeProvider attribute='className' defaultTheme={theme}>
        <Header />
        {children}
      </ThemeProvider>
    </html>
  );
};

export default DashboardLayout;
