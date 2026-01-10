// components/users/user-form.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from '@/types/api';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  createUserAction, 
  updateUserProfileAction, 
  updateUserDetailsAction 
} from '@/actions/user';
import { Loader2, Save, X } from 'lucide-react';

// ============================================================================
// Validation Schema
// ============================================================================

const userFormSchema = z.object({
  // Profile
  username: z.string()
    .min(3, 'Username deve essere almeno 3 caratteri')
    .max(50, 'Username troppo lungo')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username può contenere solo lettere, numeri e underscore'),
  email: z
    .email('Email non valida')
    .min(1, 'Email richiesta'),
  password: z.string()
    .min(8, 'Password deve essere almeno 8 caratteri')
    .optional()
    .or(z.literal('')),
  
  // Details
  firstName: z.string().max(50, 'Nome troppo lungo').optional(),
  lastName: z.string().max(50, 'Cognome troppo lungo').optional(),
  phone: z.string().max(20, 'Telefono troppo lungo').optional(),
  
  // Address
  address: z.string().max(200, 'Indirizzo troppo lungo').optional(),
  city: z.string().max(100, 'Città troppo lungo').optional(),
  state: z.string().max(100, 'Provincia troppo lungo').optional(),
  zipCode: z.string().max(20, 'CAP troppo lungo').optional(),
  country: z.string().max(100, 'Paese troppo lungo').optional(),
  
  // Personal
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  bio: z.string().max(1000, 'Biografia troppo lunga').optional(),
  
  // Roles
  roleIds: z.array(z.number()).optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

// ============================================================================
// Component Props
// ============================================================================

interface UserFormProps {
  user?: User;
  mode: 'create' | 'edit';
  roles?: Array<{ id: number; name: string; code: string }>;
}

// ============================================================================
// Component
// ============================================================================

export function UserForm({ user, mode, roles = [] }: UserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'profile' | 'details' | 'address'>('profile');

  // Initialize form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      firstName: user?.details?.firstName || '',
      lastName: user?.details?.lastName || '',
      phone: user?.details?.phone || '',
      address: user?.details?.address || '',
      city: user?.details?.city || '',
      state: user?.details?.state || '',
      zipCode: user?.details?.zipCode || '',
      country: user?.details?.country || '',
      dateOfBirth: user?.details?.dateOfBirth || '',
      gender: user?.details?.gender || undefined,
      bio: user?.details?.bio || '',
      roleIds: user?.roles?.map((r) => r.id) || [],
    },
  });

  // Handle form submission
  const onSubmit = async (data: UserFormValues) => {
    startTransition(async () => {
      try {
        if (mode === 'create') {
          // Create new user
          const result = await createUserAction({
            username: data.username,
            email: data.email,
            password: data.password || '',
            roleIds: data.roleIds,
            details: {
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
            },
          });

          if (result.success) {
            toast.success(result.message || 'Utente creato con successo');
            router.push('/settings/users');
            router.refresh();
          } else {
            toast.error(result.error || 'Errore durante la creazione');
          }
        } else {
          // Update existing user
          const userId = user!.id;

          // Update profile if changed
          const profileChanged = 
            data.username !== user!.username || 
            data.email !== user!.email;

          if (profileChanged) {
            const profileResult = await updateUserProfileAction(userId, {
              username: data.username,
              email: data.email,
            });

            if (!profileResult.success) {
              toast.error(profileResult.error || 'Errore aggiornamento profilo');
              return;
            }
          }

          // Update details
          const detailsResult = await updateUserDetailsAction(userId, {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            bio: data.bio,
          });

          if (detailsResult.success) {
            toast.success(detailsResult.message || 'Utente aggiornato con successo');
            router.push(`/settings/users/${userId}`);
            router.refresh();
          } else {
            toast.error(detailsResult.error || 'Errore durante l\'aggiornamento');
          }
        }
      } catch (error) {
        console.error('Form submission error:', error);
        toast.error('Errore imprevisto');
      }
    });
  };

  const handleCancel = () => {
    if (mode === 'edit' && user) {
      router.push(`/settings/users/${user.id}`);
    } else {
      router.push('/settings/users');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b">
          <Button
            type="button"
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('profile')}
            className="rounded-b-none"
          >
            Profilo
          </Button>
          <Button
            type="button"
            variant={activeTab === 'details' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('details')}
            className="rounded-b-none"
          >
            Dettagli Personali
          </Button>
          <Button
            type="button"
            variant={activeTab === 'address' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('address')}
            className="rounded-b-none"
          >
            Indirizzo
          </Button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Account</CardTitle>
              <CardDescription>
                Credenziali di accesso e informazioni base
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="johndoe" disabled={isPending} />
                      </FormControl>
                      <FormDescription>
                        Minimo 3 caratteri, solo lettere, numeri e underscore
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="john@example.com" 
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {mode === 'create' && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password" 
                          placeholder="••••••••" 
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimo 8 caratteri
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {mode === 'edit' && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Per cambiare la password, usa la funzione "Reset Password" dalla pagina dettagli utente
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Personali</CardTitle>
              <CardDescription>
                Informazioni anagrafiche e personali
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Mario" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cognome</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Rossi" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+39 123 456 7890" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data di Nascita</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genere</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona genere" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Uomo</SelectItem>
                        <SelectItem value="FEMALE">Donna</SelectItem>
                        <SelectItem value="OTHER">Altro</SelectItem>
                        <SelectItem value="PREFER_NOT_TO_SAY">Preferisco non specificare</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografia</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Scrivi qualcosa su di te..."
                        rows={4}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Massimo 1000 caratteri
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Address Tab */}
        {activeTab === 'address' && (
          <Card>
            <CardHeader>
              <CardTitle>Indirizzo</CardTitle>
              <CardDescription>
                Informazioni sulla residenza
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indirizzo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Via Roma, 123" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Città</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Milano" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provincia/Stato</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="MI" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CAP</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="20100" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paese</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Italia" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
          >
            <X className="h-4 w-4 mr-2" />
            Annulla
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Crea Utente' : 'Salva Modifiche'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
