'use client';

import { UserCheck, UserX, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactBulkActionsProps {
  selectedIds: number[];
  onActivate: () => Promise<void>;
  onDeactivate: () => Promise<void>;
  onDelete: () => Promise<void>;
  isProcessing: boolean;
}

export default function ContactBulkActions({
  selectedIds,
  onActivate,
  onDeactivate,
  onDelete,
  isProcessing,
}: ContactBulkActionsProps) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
      <span className="text-blue-900 font-medium">
        {selectedIds.length} contatti selezionati
      </span>
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={onActivate}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700"
        >
          <UserCheck className="w-4 h-4 mr-2" />
          Attiva
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onDeactivate}
          disabled={isProcessing}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <UserX className="w-4 h-4 mr-2" />
          Disattiva
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (confirm(`Sei sicuro di voler eliminare ${selectedIds.length} contatti?`)) {
              onDelete();
            }
          }}
          disabled={isProcessing}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Elimina
        </Button>
      </div>
    </div>
  );
}
