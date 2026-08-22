import { deleteCustomerAction } from "@/actions/customer-actions";
import CompanyDetailPage from "@/components/company-detail";
import { PageHeader } from "@/components/page-header";
import {
  createCreateAction,
  createDeleteServerAction,
  createEditAction,
} from "@/helpers/page-header-actions-helper";
import { getEditRoute, getNewRoute } from "@/lib/navigation-routes";
import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { getCustomerById } from "@/services/server/customer-service";
import { PageIdProps } from "@/types/page-types";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function CustomerDetailPage({ params }: PageIdProps) {
  await requirePermission("customer:read");

  const { id } = await params;
  const t = await getTranslations("crm");
  const deleteAction = deleteCustomerAction.bind(null, id); // bind per iniettare l'id

  const [result, permissions, contactPermissions] = await Promise.all([
    getCustomerById(id, 3600),
    checkEntityPermissions("customer"),
    checkEntityPermissions("contact"),
  ]);

  if (!result) notFound();

  const actionItems = [
    createEditAction(
      "update",
      t("editButton") ?? "Modifica",
      getEditRoute("customers", id),
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
      <CompanyDetailPage data={result} companyType="CUSTOMER" />
    </>
  );
}

// Metadata
export async function generateMetadata({ params }: PageIdProps) {
  const t = await getTranslations("crm.customers");
  try {
    const { id } = await params;

    const customer = await getCustomerById(id, 3600);

    return {
      title: `${customer.company.companyName} - ${t("companyDetailsTitle")} | ${process.env.APP_NAME}`,
      description: `${t("companyDetailsDescription")} ${customer.company.companyName}`,
    };
  } catch {
    return {
      title: `${t("companyDetailsTitle")} | ${process.env.APP_NAME}`,
    };
  }
}
