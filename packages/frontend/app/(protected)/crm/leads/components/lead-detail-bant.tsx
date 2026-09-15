import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lead } from "@mini-erp/shared";
import { Target } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface Props {
  lead: Lead;
}

export function LeadDetailBant({ lead }: Props) {
  const t = getTranslations("crm");
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Qualificazione BANT
          </CardTitle>
          <CardDescription>Budget · Authority · Need · Timeframe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Qualificato</span>
            <Badge variant={lead.bantQualified ? "default" : "outline"}>
              {lead.bantQualified ? "✓ Sì" : "No"}
            </Badge>
          </div>
          {lead.bantNotes && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Note BANT</p>
              <p className="whitespace-pre-wrap">{lead.bantNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
