// app/components/PurgeCacheButton.tsx
'use client'

import { purgeAllCache } from '@/actions/clear-cache-actions'
import { useTransition } from 'react'
import { toast } from 'sonner'

export default function PurgeCacheButton() {
  const [isPending, startTransition] = useTransition()

  const handlePurge = () => {
    startTransition(async () => {
      const result = await purgeAllCache()
      if (result.success) {
        toast.info(result.message || "Cache invalidata")
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <button
      onClick={handlePurge}
      disabled={isPending}
      className="px-4 py-2 bg-red-600 text-white rounded disabled:bg-gray-400"
    >
      {isPending ? 'Svuotamento in corso...' : 'Invalida Tutta la Cache'}
    </button>
  )
}