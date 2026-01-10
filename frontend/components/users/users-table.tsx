// frontend/components/users/users-table.tsx
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink } from 'lucide-react';
import { User } from '@/types/api';
import { GenderIcon } from '../gender-icon';

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">Nessun utente trovato</p>
          <p className="text-sm text-muted-foreground mt-1">
            Prova a modificare i filtri di ricerca
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ruoli</TableHead>
              <TableHead className="w-[100px]">Stato</TableHead>
              <TableHead className="w-[120px]">Creato</TableHead>
              <TableHead className="w-[100px] text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="group">
                <TableCell className="font-mono text-sm">{user.id}</TableCell>
                <TableCell>
                    {user.details ? <GenderIcon gender={user.details.gender} /> : ''}
                    {
                        `${user.details?.firstName} ${user.details?.lastName} `
                    }
                </TableCell>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles?.map((role) => (
                      <Badge key={role.id} variant="secondary" className="text-xs">
                        {role.name}
                      </Badge>
                    )) || (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>                
                <TableCell>
                  <Badge
                    variant={user.active ? 'default' : 'secondary'}
                    className={user.active ? 'bg-green-500' : 'bg-red-500'}
                  >
                    {user.active ? 'Attivo' : 'Inattivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('it-IT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/settings/users/${user.id}`}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Dettagli
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
