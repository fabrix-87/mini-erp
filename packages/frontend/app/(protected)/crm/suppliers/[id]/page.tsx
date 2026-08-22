import { deleteSupplierAction } from "@/actions/supplier-actions";
import CompanyDetailPage from "@/components/company-detail";
import { PageHeader } from "@/components/page-header";
import {
  createCreateAction,
  createDeleteServerAction,
  createEditAction,
} from "@/helpers/page-header-actions-helper";
import { getEditRoute, getNewRoute } from "@/lib/navigation-routes";
import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { getSupplierById } from "@/services/server/supplier-service";
import { PageIdProps } from "@/types/page-types";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function SupplierDetailPage({ params }: PageIdProps) {
  await requirePermission("supplier:read");

  const { id } = await params;
  const t = await getTranslations("crm");
  const deleteAction = deleteSupplierAction.bind(null, id); // bind per iniettare l'id

  const [result, permissions, contactPermissions] = await Promise.all([
    getSupplierById(id, 3600),
    checkEntityPermissions("supplier"),
    checkEntityPermissions("contact"),
  ]);

  if (!result) notFound();

  const actionItems = [
    createEditAction(
      "update",
      t("editButton") ?? "Modifica",
      getEditRoute("suppliers", id),
      permissions.canUpdate,
    ),
    createCreateAction(
      "createContact",
      t("createContactButton") ?? "Aggiungi contatto",
      getNewRoute("contacts"),
      contactPermissions.canCreate,
    ),
    createDeleteServerAction(
      "delete",
      t("deleteButton") ?? "Elimina",
      deleteAction,
      {
        title: t("deleteDialogTitle", {
          name: `${result.company.companyName} [${result.company.code}]`,
        }),
        description: t("deleteDialogDescription"),
        confirmLabel: t("deleteDialogConfirm"),
        cancelLabel: t("deleteDialogCancel"),
      },
      permissions.canDelete,
    ),
  ];

  return (
    <>
      <PageHeader
        actionItems={actionItems}
        extraBreadcrumbs={[{ label: result.company.companyName }]}
        title={result.company.companyName}
        subtitle={result.company.code}
      />
      <CompanyDetailPage data={result} companyType="SUPPLIER" />
    </>
  );
}

// Metadata
export async function generateMetadata({ params }: PageIdProps) {
  const t = await getTranslations("crm.suppliers");
  try {
    const { id } = await params;

    const supplier = await getSupplierById(id, 3600);

    return {
      title: `${supplier.company.companyName} - ${t("companyDetailsTitle")} | ${process.env.APP_NAME}`,
      description: `${t("companyDetailsDescription")} ${supplier.company.companyName}`,
    };
  } catch {
    return {
      title: `${t("companyDetailsTitle")} | ${process.env.APP_NAME}`,
    };
  }
}
