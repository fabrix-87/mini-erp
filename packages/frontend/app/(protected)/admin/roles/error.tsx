'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ContactsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Contacts error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Errore nel caricamento
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'Si è verificato un errore durante il caricamento dei contatti.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Riprova
        </button>
      </div>
    </div>
  );
}