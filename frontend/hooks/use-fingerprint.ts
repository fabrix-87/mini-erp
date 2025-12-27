// hooks/use-fingerprint.ts

'use client';

import { useState, useEffect } from 'react';
import { getBrowserFingerprint, isFingerprintReady } from '@/lib/client/fingerprint';

export function useFingerprint() {
  const [fingerprint, setFingerprint] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check se già disponibile in cache
    if (isFingerprintReady()) {
      setIsLoading(false);
    }

    // Genera/recupera fingerprint
    getBrowserFingerprint()
      .then((fp) => {
        setFingerprint(fp);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  return { fingerprint, isLoading, error };
}