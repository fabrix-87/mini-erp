// app/(protected)/crm/opportunities/[id]/components/opportunity-detail-commercial.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OpportunityComplete } from "@mini-erp/shared";
import { useTranslations } from "next-intl";

interface Props {
  opportunity: OpportunityComplete;
}

/**
 * Commercial tab: proposed products table.
 */
export function OpportunityDetailCommercial({ opportunity }: Props) {
  const t = useTranslations("crm.opportunities");
  const products = opportunity.proposedProducts ?? [];

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          {t("detail.noProducts")}
        </CardContent>
      </Card>
    );
  }

  const total = products.reduce((sum, p) => {
    const line = Number(p.price) * Number(p.quantity) * (1 - Number(p.discount ?? 0) / 100);
    return sum + line;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("detail.proposedProducts")}</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
              <th className="text-left pb-2 font-medium">{t("detail.product")}</th>
              <th className="text-right pb-2 font-medium">{t("form.quantity")}</th>
              <th className="text-right pb-2 font-medium">{t("form.price")}</th>
              <th className="text-right pb-2 font-medium">{t("form.discount")}</th>
              <th className="text-right pb-2 font-medium">{t("detail.total")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p, i) => {
              const line =
                Number(p.price) * Number(p.quantity) * (1 - Number(p.discount ?? 0) / 100);
              return (
                <tr key={i} className="py-2">
                  <td className="py-2 font-medium">{p.productName ?? p.productId}</td>
                  <td className="py-2 text-right tabular-nums">{Number(p.quantity)}</td>
                  <td className="py-2 text-right tabular-nums">
                    {Number(p.price).toLocaleString("it-IT", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {p.discount ? `${Number(p.discount)}%` : "—"}
                  </td>
                  <td className="py-2 text-right tabular-nums font-medium">
                    {line.toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t font-semibold">
              <td colSpan={4} className="pt-3 text-right text-muted-foreground text-xs uppercase">
                {t("detail.total")}
              </td>
              <td className="pt-3 text-right tabular-nums">
                {total.toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
              </td>
            </tr>
          </tfoot>
        </table>
      </CardContent>
    </Card>
  );
}
