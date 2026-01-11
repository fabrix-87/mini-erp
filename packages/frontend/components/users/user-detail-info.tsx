// frontend/components/users/user-detail-info.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User as UserIcon,
  MapPin,
  Phone,
  Calendar,
  FileText,
  Globe
} from 'lucide-react';
import { User } from '@/types/user'

interface UserDetailInfoProps {
  user: User;
}

export function UserDetailInfo({ user }: UserDetailInfoProps) {
  const details = user.details;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Informazioni Personali */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Informazioni Personali
          </CardTitle>
          <CardDescription>
            Dati anagrafici e personali dell'utente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow 
            label="Nome Completo" 
            value={
              details?.firstName || details?.lastName
                ? `${details?.firstName || ''} ${details?.lastName || ''}`.trim()
                : 'Non specificato'
            }
          />
          
          <Separator />
          
          <InfoRow 
            label="Username" 
            value={user.username}
          />
          
          <Separator />
          
          <InfoRow 
            label="Email" 
            value={user.email}
          />
          
          <Separator />
          
          <InfoRow 
            label="Telefono" 
            value={details?.phone || 'Non specificato'}
            icon={<Phone className="h-4 w-4" />}
          />
          
          <Separator />
          
          <InfoRow 
            label="Data di Nascita" 
            value={
              details?.dateOfBirth 
                ? new Date(details.dateOfBirth).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : 'Non specificata'
            }
            icon={<Calendar className="h-4 w-4" />}
          />
          
          <Separator />
          
          <InfoRow 
            label="Genere" 
            value={
              details?.gender 
                ? {
                    MALE: 'Uomo',
                    FEMALE: 'Donna',
                    OTHER: 'Altro',
                    PREFER_NOT_TO_SAY: 'Preferisco non specificare'
                  }[details.gender]
                : 'Non specificato'
            }
          />
        </CardContent>
      </Card>

      {/* Indirizzo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Indirizzo
          </CardTitle>
          <CardDescription>
            Informazioni sulla residenza
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow 
            label="Indirizzo" 
            value={details?.address || 'Non specificato'}
          />
          
          <Separator />
          
          <InfoRow 
            label="Città" 
            value={details?.city || 'Non specificata'}
          />
          
          <Separator />
          
          <InfoRow 
            label="Provincia/Stato" 
            value={details?.state || 'Non specificato'}
          />
          
          <Separator />
          
          <InfoRow 
            label="CAP" 
            value={details?.zipCode || 'Non specificato'}
          />
          
          <Separator />
          
          <InfoRow 
            label="Paese" 
            value={details?.country || 'Non specificato'}
            icon={<Globe className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      {/* Bio */}
      {details?.bio && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Biografia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {details.bio}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Metadati */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Metadati</CardTitle>
          <CardDescription>
            Informazioni di sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <InfoRow 
              label="ID Utente" 
              value={`#${user.id}`}
            />
            
            <InfoRow 
              label="Creato il" 
              value={new Date(user.createdAt).toLocaleString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            />
            
            <InfoRow 
              label="Ultimo aggiornamento" 
              value={new Date(user.updatedAt).toLocaleString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string | number; 
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        {icon}
        {label}:
      </span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
