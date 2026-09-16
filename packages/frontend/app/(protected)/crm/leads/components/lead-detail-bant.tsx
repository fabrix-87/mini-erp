import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lead } from "@mini-erp/shared";
import { Target } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface Props {
  lead: Lead;
}

export async function LeadDetailBant({ lead }: Props) {
  const t = await getTranslations("crm.leads");
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            {t("bant")}
          </CardTitle>
          <CardDescription>{t("bantDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("form.bantQualified")}</span>
            <Badge variant={lead.bantQualified ? "default" : "outline"}>
              {lead.bantQualified ? `✓ ${t("yes")}` : t("no")}
            </Badge>
          </div>
          {lead.bantNotes && (
            <div className="space-y-1">
              <p className="text-muted-foreground">{t("form.bantNotes")}</p>
              <p className="whitespace-pre-wrap">{lead.bantNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
