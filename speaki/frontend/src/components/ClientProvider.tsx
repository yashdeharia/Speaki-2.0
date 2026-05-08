'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize store from localStorage on client startup
    useUserStore.getState().initializeFromStorage();
  }, []);

  return <>{children}</>;
}
