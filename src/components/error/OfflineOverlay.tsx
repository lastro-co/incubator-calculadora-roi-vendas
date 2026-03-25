'use client';

import { useEffect, useState } from 'react';

function OfflineIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      role="img"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <title>Sem conexão</title>
      <path d="M1 1l22 22" />
      <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
      <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0122.56 9" />
      <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
      <path d="M8.53 16.11a6 6 0 016.95 0" />
      <path d="M12 20h.01" />
    </svg>
  );
}

export function OfflineOverlay() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
    };

    const handleOnline = () => {
      setIsOffline(false);
    };

    // Check if already offline
    setIsOffline(!navigator.onLine);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 z-50 flex h-screen w-screen flex-col items-center justify-center gap-8 bg-white">
      <OfflineIcon className="h-48 w-48 text-gray-400" />

      <h1 className="m-0 font-display font-semibold text-3xl text-black">
        Sem conexão com internet
      </h1>

      <p className="m-0 text-center text-black text-lg">
        Verifique sua conexão e recarregue a página para tentar novamente.
      </p>
    </div>
  );
}
