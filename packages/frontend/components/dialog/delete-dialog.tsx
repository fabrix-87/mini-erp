import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useTranslations } from "next-intl";

interface DeleteDialogProps {
  isOpen: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  handleDelete: () => void;
  isDeleting: boolean;
  children: React.ReactNode;
}

export default function DeleteDialog({
  isOpen,
  title,
  onOpenChange,
  handleDelete,
  isDeleting,
  children,
}: DeleteDialogProps) {
  const t = useTranslations("common");
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{children}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            variant="destructive"
          >
            {isDeleting ? t("feedback.isDeleting") : t("actions.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
