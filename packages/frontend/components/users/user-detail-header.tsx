// frontend/components/users/user-detail-header.tsx
import { User } from '@/types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mail, 
  Calendar, 
  Shield, 
  CheckCircle2, 
  XCircle,
  Clock
} from 'lucide-react';
import { GenderIcon } from '@/components/gender-icon';

interface UserDetailHeaderProps {
  user: User;
}

export function UserDetailHeader({ user }: UserDetailHeaderProps) {
  const initials = user.details?.firstName && user.details?.lastName
    ? `${user.details?.firstName[0]}${user.details?.lastName[0]}`
    : user.username.substring(0, 2).toUpperCase();

  const fullName = user.details?.firstName || user.details?.lastName
    ? `${user.details?.firstName || ''} ${user.details?.lastName || ''}`.trim()
    : null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <Avatar className="h-20 w-20">
            <AvatarImage 
              src={user.details?.profilePicture} 
              alt={user.username} 
            />
            <AvatarFallback className="text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 space-y-4">
            {/* Nome e Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight">
                  {fullName || user.username}
                </h1>
                
                <Badge 
                  variant={user.active ? 'default' : 'secondary'}
                  className={`gap-1 ${user.active ? 'bg-green-500' : 'bg-red-500'}`}
                >
                  {user.active ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Attivo
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Inattivo
                    </>
                  )}
                </Badge>

                {user.details?.gender && (
                  <GenderIcon gender={user.details?.gender} showLabel />
                )}
              </div>

              {fullName && (
                <p className="text-muted-foreground">@{user.username}</p>
              )}
            </div>

            {/* Meta Info */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${user.email}`}
                  className="text-primary hover:underline"
                >
                  {user.email}
                </a>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Creato il {new Date(user.createdAt).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>

              {user.details?.lastLogin && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Ultimo accesso: {new Date(user.details.lastLogin).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Ruoli */}
            {user.roles && user.roles.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Ruoli:</span>
                {user.roles.map((role) => (
                  <Badge key={role.id} variant="secondary">
                    {role.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
