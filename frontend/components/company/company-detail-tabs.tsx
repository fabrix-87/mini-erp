// components/company/company-detail-tabs.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Users,
  MapPin,
  Activity,
  FileCheck,
  Package,
} from "lucide-react";
import { Customer } from "@/types/customer";
import { Supplier } from "@/types/supplier";
import { CompanyType } from "@/types/company";
import { CompanyInfoTab } from "./details-tabs/info-tab";
import { CompanyContactsTab } from "./details-tabs/contacts-tab";
import { CompanyAddressesTab } from "./details-tabs/addresses-tab";
import { CompanyDocumentsTab } from "./details-tabs/documents-tab";
import { CompanyActivitiesTab } from "./details-tabs/activities-tab";

interface CompanyDetailTabsProps {
  data: Customer | Supplier;
  companyType: CompanyType;
}

export function CompanyDetailTabs({
  data,
  companyType,
}: CompanyDetailTabsProps) {
  const [activeTab, setActiveTab] = useState("info");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="info">
          <FileText className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Informazioni</span>
        </TabsTrigger>
        <TabsTrigger value="contacts">
          <Users className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Contatti</span>
        </TabsTrigger>
        <TabsTrigger value="addresses">
          <MapPin className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Indirizzi</span>
        </TabsTrigger>
        <TabsTrigger value="documents">
          <FileCheck className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Documenti</span>
        </TabsTrigger>
        <TabsTrigger value="activities">
          <Activity className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Attività</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="mt-6">
        <CompanyInfoTab data={data} companyType={companyType} />
      </TabsContent>

      <TabsContent value="contacts" className="mt-6">
        <CompanyContactsTab companyId={data.companyId} />
      </TabsContent>

      <TabsContent value="addresses" className="mt-6">
        <CompanyAddressesTab companyId={data.companyId} />
      </TabsContent>

      <TabsContent value="documents" className="mt-6">
        <CompanyDocumentsTab
          companyId={data.companyId}
          companyType={companyType}
        />
      </TabsContent>

      <TabsContent value="activities" className="mt-6">
        <CompanyActivitiesTab companyId={data.companyId} />
      </TabsContent>
    </Tabs>
  );
}