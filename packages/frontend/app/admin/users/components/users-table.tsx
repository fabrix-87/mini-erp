// frontend/components/users/users-table.tsx
"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import { GenderIcon } from "../../../../components/gender-icon";
import { UserListItem } from "@mini-erp/shared";
import { useNavigation } from "@/hooks/use-navigation";
import { formatDateIT } from "@/helpers/date-helper";

interface UsersTableProps {
  users: UserListItem[];
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

  const { getDetailRoute } = useNavigation();

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ruoli</TableHead>
              <TableHead className="w-25">Stato</TableHead>
              <TableHead className="w-30">Creato</TableHead>
              <TableHead className="w-30">Ultimo accesso</TableHead>
              <TableHead className="w-25 text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.details?.gender && <GenderIcon gender={user.details.gender} />}
                    <span>
                      {user.details?.firstName} {user.details?.lastName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell className="text-muted-foreground"><a href={`mailto:${user.email}`}>{user.email}</a></TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.currentTenant.roles?.map((role) => (
                      <Badge key={role.id} variant="secondary" className="text-xs">
                        {role.name}
                      </Badge>
                    )) || <span className="text-sm text-muted-foreground">-</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.active ? "default" : "secondary"}
                    className={user.active ? "bg-green-500" : "bg-red-500"}
                  >
                    {user.active ? "Attivo" : "Inattivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  { formatDateIT(user.createdAt) }
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  { formatDateIT(user.lastLogin) }
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={getDetailRoute("users", user.id)}
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
