'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div className="relative flex items-center justify-center w-70 h-70">
        <Image
          src="/bookyourflight-transp.png"
          alt="BookYourFlight"
          width={200}
          height={60}
          className="relative z-10"
        />
        <svg
          className="absolute inset-0"
          width="280"
          height="280"
          viewBox="0 0 280 280"
        >
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="#FE5D00"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="753.98"
            strokeDashoffset="753.98"
            className="animate-loading-circle"
            style={{ transformOrigin: 'center' }}
          />
        </svg>
      </div>
    </div>
  );
}
