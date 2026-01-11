// frontend/components/users/user-detail-actions.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Edit, 
  Trash2, 
  Power, 
  PowerOff,
  Shield,
  Key
} from 'lucide-react';
import { toast } from 'sonner';

interface UserDetailActionsProps {
  user: User;
}

export function UserDetailActions({ user }: UserDetailActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleActive = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      });

      if (!response.ok) {
        throw new Error('Errore durante l\'aggiornamento dello stato');
      }

      toast.success(
        user.active 
          ? 'Utente disattivato con successo' 
          : 'Utente attivato con successo'
      );

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast.error('Errore durante l\'operazione');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Errore durante l\'eliminazione');
      }

      toast.success('Utente eliminato con successo');
      router.push('/settings/users');
      router.refresh();
    } catch (error) {
      toast.error('Errore durante l\'eliminazione');
      console.error(error);
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Azioni</CardTitle>
        <CardDescription>
          Gestisci l'utente e i suoi permessi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Modifica Profilo */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push(`/settings/users/${user.id}/edit`)}
            disabled={isPending}
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifica Profilo
          </Button>

          {/* Gestisci Ruoli */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push(`/settings/users/${user.id}/roles`)}
            disabled={isPending}
          >
            <Shield className="h-4 w-4 mr-2" />
            Gestisci Ruoli
          </Button>

          {/* Reset Password */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push(`/settings/users/${user.id}/reset-password`)}
            disabled={isPending}
          >
            <Key className="h-4 w-4 mr-2" />
            Reset Password
          </Button>

          {/* Toggle Attivo/Inattivo */}
          <Button
            variant={user.active ? 'destructive' : 'default'}
            className="w-full justify-start"
            onClick={handleToggleActive}
            disabled={isPending}
          >
            {user.active ? (
              <>
                <PowerOff className="h-4 w-4 mr-2" />
                Disattiva Utente
              </>
            ) : (
              <>
                <Power className="h-4 w-4 mr-2" />
                Attiva Utente
              </>
            )}
          </Button>

          {/* Elimina Utente */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full justify-start sm:col-span-2 lg:col-span-1"
                disabled={isPending || isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina Utente
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Questa azione non può essere annullata. L'utente{' '}
                  <strong>{user.username}</strong> verrà eliminato permanentemente
                  dal sistema insieme a tutti i suoi dati.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminazione...' : 'Elimina'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
