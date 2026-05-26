// packages/frontend/components/company/company-form-tab.tsx
"use client";

import { useState } from "react";
import { Building2, FileText, CreditCard, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useFormContext } from "react-hook-form";
import { CompanyFormValues } from "@mini-erp/shared";
import { CompanyType } from "@/types/company-types";
import { BasicInfoTab } from "./tabs/basic-info-tab";
import { FiscalDataTab } from "./tabs/fiscal-data-tab";
import { CommercialTab } from "./tabs/commercial-tab";
import { ClassificationTab } from "./tabs/classification-tab";

/** Field groups per tab — used to compute per-tab error badges */
const TAB_FIELDS: Record<string, (keyof CompanyFormValues)[]> = {
  basic: [
    "companyName",
    "tradeName",
    "legalForm",
    "status",
    "entityType",
    "mainEmail",
    "mainPhone",
    "legalAddress",
  ],
  fiscal: ["vatNumber", "taxCode", "sdiCode", "pec", "vatId", "eoriNumber", "countryCode"],
  commercial: [
    "creditLimit",
    "segment",
    "priority",
    "size",
    "paymentTerms",
    "leadTimeDays",
    "transportCost",
    "rating",
  ],
  classification: ["type", "creditStatus", "parentCustomerId", "parentSupplierId", "customFields"],
};

interface TabTriggerProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  errorCount: number;
}

/** Tab trigger with optional error badge */
function TabTriggerWithBadge({ value, label, icon, errorCount }: TabTriggerProps) {
  return (
    <TabsTrigger value={value} className="relative">
      {icon}
      {label}
      {errorCount > 0 && (
        <Badge
          variant="destructive"
          className="ml-1.5 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center"
        >
          {errorCount}
        </Badge>
      )}
    </TabsTrigger>
  );
}

interface CompanyFormTabsProps {
  companyType: CompanyType;
}

export function CompanyFormTabs({ companyType }: CompanyFormTabsProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const {
    formState: { errors },
  } = useFormContext<CompanyFormValues>();

  /** Counts validation errors belonging to each tab */
  const getTabErrorCount = (tabKey: string): number => {
    const fields = TAB_FIELDS[tabKey] ?? [];
    return fields.filter((f) => !!errors[f]).length;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4">
        <TabTriggerWithBadge
          value="basic"
          label="Dati Base"
          icon={<Building2 className="mr-2 h-4 w-4" />}
          errorCount={getTabErrorCount("basic")}
        />
        <TabTriggerWithBadge
          value="fiscal"
          label="Dati Fiscali"
          icon={<FileText className="mr-2 h-4 w-4" />}
          errorCount={getTabErrorCount("fiscal")}
        />
        <TabTriggerWithBadge
          value="commercial"
          label="Commerciale"
          icon={<CreditCard className="mr-2 h-4 w-4" />}
          errorCount={getTabErrorCount("commercial")}
        />
        <TabTriggerWithBadge
          value="classification"
          label="Classificazione"
          icon={<Users className="mr-2 h-4 w-4" />}
          errorCount={getTabErrorCount("classification")}
        />
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <BasicInfoTab />
      </TabsContent>
      <TabsContent value="fiscal" className="space-y-4">
        <FiscalDataTab />
      </TabsContent>
      <TabsContent value="commercial" className="space-y-4">
        <CommercialTab companyType={companyType} />
      </TabsContent>
      <TabsContent value="classification" className="space-y-4">
        <ClassificationTab companyType={companyType} />
      </TabsContent>
    </Tabs>
  );
}
