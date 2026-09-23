// components/company/company-detail-tabs.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Users, MapPin, Activity, FileCheck, Package } from "lucide-react";
import { Customer } from "@/types/customer-types";
import { Supplier } from "@/types/supplier-types";
import { CompanyType } from "@/types/company-types";
import { CompanyInfoTab } from "./details-tabs/info-tab";
import { CompanyContactsTab } from "./details-tabs/contacts-tab";
import { CompanyAddressesTab } from "./details-tabs/addresses-tab";
import { CompanyDocumentsTab } from "./details-tabs/documents-tab";
import { CompanyActivitiesTab } from "./details-tabs/activities-tab";
import { useTranslations } from "next-intl";

interface CompanyDetailTabsProps {
  data: Customer | Supplier;
  companyType: CompanyType;
}

export function CompanyDetailTabs({ data, companyType }: CompanyDetailTabsProps) {
  const [activeTab, setActiveTab] = useState("info");
  const t = useTranslations("crm.customers.tabs");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="crm-tabs-list" variant="line">
        <TabsTrigger value="info">
          <FileText className="size-4 shrink-0" />
          <span className="hidden sm:inline">{t("info")}</span>
        </TabsTrigger>

        <TabsTrigger value="contacts">
          <Users className="size-4 shrink-0" />
          <span className="hidden sm:inline">{t("contacts")}</span>
        </TabsTrigger>

        <TabsTrigger value="addresses">
          <MapPin className="size-4 shrink-0" />
          <span className="hidden sm:inline">{t("addresses")}</span>
        </TabsTrigger>

        <TabsTrigger value="documents">
          <FileCheck className="size-4 shrink-0" />
          <span className="hidden sm:inline">{t("documents")}</span>
        </TabsTrigger>

        <TabsTrigger value="activities">
          <Activity className="size-4 shrink-0" />
          <span className="hidden sm:inline">{t("activities")}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="outline-none">
        {companyType === "CUSTOMER" ? (
          <CompanyInfoTab data={data as Customer} companyType="CUSTOMER" />
        ) : (
          <CompanyInfoTab data={data as Supplier} companyType="SUPPLIER" />
        )}
      </TabsContent>

      <TabsContent value="contacts" className="outline-none">
        <CompanyContactsTab companyId={data.companyId} />
      </TabsContent>

      <TabsContent value="addresses" className="outline-none">
        <CompanyAddressesTab companyId={data.companyId} />
      </TabsContent>

      <TabsContent value="documents" className="outline-none">
        <CompanyDocumentsTab companyId={data.companyId} companyType={companyType} />
      </TabsContent>

      <TabsContent value="activities" className="outline-none">
        <CompanyActivitiesTab
          {...(companyType === "CUSTOMER" ? { customerId: data.id } : { supplierId: data.id })}
        />
      </TabsContent>
    </Tabs>
  );
}
