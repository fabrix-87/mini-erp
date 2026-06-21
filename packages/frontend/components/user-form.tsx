// components/user-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  updateUserProfileAction,
  updateUserDetailsAction,
  toggleUserActiveAction,
  deleteUserAction,
} from "@/actions/user-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { useNavigation } from "@/hooks/use-navigation";

// ============================================================================
// Validation Schema
// ============================================================================

const profileSchema = z.object({
  username: z.string().min(3, "Username deve essere almeno 3 caratteri"),
  email: z.email("Email non valida"),
});

const detailsSchema = z.object({
  firstName: z.string().min(1, "Nome obbligatorio"),
  lastName: z.string().min(1, "Cognome obbligatorio"),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type DetailsFormData = z.infer<typeof detailsSchema>;

// ============================================================================
// Component Props
// ============================================================================

interface UserFormProps {
  user: {
    id: number;
    username: string;
    email: string;
    active: boolean;
    details?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
    };
  };
}

// ============================================================================
// Component
// ============================================================================

export function UserForm({ user }: UserFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const { refresh } = useNavigation();

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
    },
  });

  // Details form
  const detailsForm = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      firstName: user.details?.firstName || "",
      lastName: user.details?.lastName || "",
      phone: user.details?.phone || "",
    },
  });

  // ========================================
  // Handlers
  // ========================================

  const onProfileSubmit = async (data: ProfileFormData) => {
    startTransition(async () => {
      const result = await updateUserProfileAction(user.id, data);

      if (result.success) {
        toast.success("Profilo aggiornato", {
          description: "Le modifiche sono state salvate",
        });
      } else {
        toast.error("Errore", {
          description: result.error || "Impossibile aggiornare il profilo",
        });
      }
    });
  };

  const onDetailsSubmit = async (data: DetailsFormData) => {
    startTransition(async () => {
      const result = await updateUserDetailsAction(user.id, data);

      if (result.success) {
        toast.success("Dettagli aggiornati", {
          description: "Le modifiche sono state salvate",
        });
      } else {
        toast.error("Errore", {
          description: result.error || "Impossibile aggiornare i dettagli",
        });
      }
    });
  };

  const handleToggleActive = async () => {
    startTransition(async () => {
      const result = await toggleUserActiveAction(user.id, !user.active);

      if (result.success) {
        toast.success(user.active ? "Utente disattivato" : "Utente attivato", {
          description: "Lo stato è stato modificato",
        });
        refresh();
      } else {
        toast.error("Errore", {
          description: result.error || "Impossibile modificare lo stato",
        });
      }
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteUserAction(user.id);

      if (result.success) {
        toast.success("Utente eliminato", {
          description: "L'utente è stato rimosso dal sistema",
        });
        // deleteUserAction includes redirect, no need to call router.push
      } else {
        toast.error("Errore", {
          description: result.error || "Impossibile eliminare l'utente",
        });
        setIsDeleting(false);
      }
    } catch (error) {
      toast.error("Errore imprevisto");
      setIsDeleting(false);
    }
  };

  // ========================================
  // Render
  // ========================================

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profilo Utente</CardTitle>
          <CardDescription>Modifica username ed email dell'utente</CardDescription>
        </CardHeader>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...profileForm.register("username")} disabled={isPending} />
              {profileForm.formState.errors.username && (
                <p className="text-sm text-red-500">
                  {profileForm.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...profileForm.register("email")}
                disabled={isPending}
              />
              {profileForm.formState.errors.email && (
                <p className="text-sm text-red-500">{profileForm.formState.errors.email.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salva Profilo
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Dettagli Personali</CardTitle>
          <CardDescription>Modifica i dati personali dell'utente</CardDescription>
        </CardHeader>

        <form onSubmit={detailsForm.handleSubmit(onDetailsSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input id="firstName" {...detailsForm.register("firstName")} disabled={isPending} />
                {detailsForm.formState.errors.firstName && (
                  <p className="text-sm text-red-500">
                    {detailsForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Cognome</Label>
                <Input id="lastName" {...detailsForm.register("lastName")} disabled={isPending} />
                {detailsForm.formState.errors.lastName && (
                  <p className="text-sm text-red-500">
                    {detailsForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input id="phone" {...detailsForm.register("phone")} disabled={isPending} />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salva Dettagli
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Azioni</CardTitle>
          <CardDescription>Gestisci lo stato dell'utente</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Toggle Active */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Stato Utente</h4>
              <p className="text-sm text-muted-foreground">
                {user.active ? "Utente attivo" : "Utente disattivato"}
              </p>
            </div>
            <Button
              variant={user.active ? "destructive" : "default"}
              onClick={handleToggleActive}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user.active ? "Disattiva" : "Attiva"}
            </Button>
          </div>

          {/* Delete User */}
          <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-100">Zona Pericolosa</h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                Elimina definitivamente questo utente
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Elimina Utente
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Questa azione non può essere annullata. L'utente{" "}
                    <strong>{user.username}</strong> verrà eliminato permanentemente dal sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Elimina
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
