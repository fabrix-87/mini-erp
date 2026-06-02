'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Smartphone, Building2, Briefcase, Users, Star, Calendar, User, MessageSquare, UserCheck, UserX } from 'lucide-react';
import { useContact, useContactMutations } from '@/hooks/use-contact';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ContactDetails() {
  const router = useRouter();
  const params = useParams();
  const contactId = params?.id ? parseInt(params.id as string) : null;

  const { contact, loading, error, refetch } = useContact(contactId || 0);
  const { deleteContact, toggleActive, isPending } = useContactMutations();

  const handleEdit = () => {
    router.push(`/contacts/${contactId}/edit`);
  };

  const handleDelete = async () => {
    if (confirm('Sei sicuro di voler eliminare questo contatto?')) {
      try {
        await deleteContact(contactId!);
        router.push('/contacts');
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleToggleActive = async () => {
    if (!contact) return;
    try {
      await toggleActive(contactId!, !contact.active);
      await refetch();
    } catch (error) {
      console.error('Toggle active error:', error);
    }
  };

  const handleSetPrimary = async () => {
    try {
      await setPrimary(contactId!);
      await refetch();
    } catch (error) {
      console.error('Set primary error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Caricamento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Il contatto richiesto non esiste'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/contacts')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna ai contatti
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Indietro
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">
                {contact.firstName} {contact.lastName}
              </h1>
              <Badge variant={contact.active ? 'default' : 'secondary'}>
                {contact.active ? 'Attivo' : 'Inattivo'}
              </Badge>
              {contact.isPrimaryContact && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Primario
                </Badge>
              )}
            </div>
            {contact.position && (
              <p className="text-gray-600">
                {contact.position}
                {contact.department && ` • ${contact.department}`}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {!contact.isPrimaryContact && (
              <Button
                variant="outline"
                onClick={handleSetPrimary}
                disabled={isToggling}
              >
                <Star className="w-4 h-4 mr-2" />
                Imposta Primario
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleToggleActive}
              disabled={isToggling}
            >
              {contact.active ? (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Disattiva
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Attiva
                </>
              )}
            </Button>
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Modifica
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Eliminazione...' : 'Elimina'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informazioni di Contatto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                    {contact.email}
                  </a>
                </div>
              </div>

              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Telefono</p>
                    <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                </div>
              )}

              {contact.mobilePhone && (
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Cellulare</p>
                    <a href={`tel:${contact.mobilePhone}`} className="text-blue-600 hover:underline">
                      {contact.mobilePhone}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Info */}
          {contact.company && (
            <Card>
              <CardHeader>
                <CardTitle>Azienda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Ragione Sociale</p>
                    <p className="font-medium">
                      {contact.company.companyName}
                      {contact.company.tradeName && ` (${contact.company.tradeName})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Codice</p>
                    <p className="font-medium">{contact.company.code}</p>
                  </div>
                </div>

                {contact.company.mainEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email Aziendale</p>
                      <a href={`mailto:${contact.company.mainEmail}`} className="text-blue-600 hover:underline">
                        {contact.company.mainEmail}
                      </a>
                    </div>
                  </div>
                )}

                {contact.company.mainPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Telefono Aziendale</p>
                      <a href={`tel:${contact.company.mainPhone}`} className="text-blue-600 hover:underline">
                        {contact.company.mainPhone}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Work Info */}
          {(contact.position || contact.department) && (
            <Card>
              <CardHeader>
                <CardTitle>Ruolo Aziendale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contact.position && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Posizione</p>
                      <p className="font-medium">{contact.position}</p>
                    </div>
                  </div>
                )}

                {contact.department && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Dipartimento</p>
                      <p className="font-medium">{contact.department}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {contact.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Note</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-400 mt-1" />
                  <p className="text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Dettagli</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">ID Contatto</p>
                <p className="font-medium">#{contact.id}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500">Creato il</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm">{formatDate(contact.createdAt.toString())}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ultimo aggiornamento</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm">{formatDate(contact.updatedAt.toString())}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents - se disponibili */}
          {contact.documents && contact.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Documenti Associati</CardTitle>
                <CardDescription>
                  {contact.documents.length} documento{contact.documents.length !== 1 ? 'i' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contact.documents.map((doc) => (
                    <div key={doc.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{doc.documentType}</p>
                          {doc.documentNumber && (
                            <p className="text-sm text-gray-500">#{doc.documentNumber}</p>
                          )}
                        </div>
                        <p className="text-sm font-medium">€{doc.totalAmount.toFixed(2)}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(doc.documentDate).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
