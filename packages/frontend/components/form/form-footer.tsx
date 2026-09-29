"use client";

import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { CardFooter } from "../ui/card";
import { useNavigation } from "@/hooks/use-navigation";
import { useTranslations } from "next-intl";
import { RouteKey } from "@/lib/navigation-routes";

export interface FormFooterProps {
  entityKey: RouteKey;
  isPending: boolean;
  isEditMode: boolean;
  entityId?: string | number;
}

export const FormFooter = ({
  entityKey,
  isPending,
  isEditMode,
  entityId,
}: FormFooterProps): React.ReactNode => {
  const { navigate, navigateToDetail } = useNavigation();
  const t = useTranslations("common.form");
  return (
    <CardFooter className="justify-end gap-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => (entityId ? navigateToDetail(entityKey, entityId) : navigate(entityKey))}
        disabled={isPending}
      >
        {t("cancel")}
      </Button>
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditMode ? t("saveChanges") : t("create")}
      </Button>
    </CardFooter>
  );
};
