// components/company/company-form-tabs.tsx
"use client";

import { useState } from "react";
import { Building2, FileText, CreditCard, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyFormData, CompanyType } from "@/types/company-types";
import { BasicInfoTab } from "./tabs/basic-info-tab";
import { FiscalDataTab } from "./tabs/fiscal-data-tab";
import { CommercialTab } from "./tabs/commercial-tab";
import { ClassificationTab } from "./tabs/classification-tab";

interface CompanyFormTabsProps {
  formData: CompanyFormData;
  setFormData: (data: CompanyFormData | ((prev: CompanyFormData) => CompanyFormData)) => void;
  companyType: CompanyType;
}

export function CompanyFormTabs({ formData, setFormData, companyType }: CompanyFormTabsProps) {
  const [activeTab, setActiveTab] = useState("basic");

  const handleChange = (field: keyof CompanyFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof CompanyFormData] as any),
        [field]: value,
      },
    }));
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">
          <Building2 className="mr-2 h-4 w-4" />
          Dati Base
        </TabsTrigger>
        <TabsTrigger value="fiscal">
          <FileText className="mr-2 h-4 w-4" />
          Dati Fiscali
        </TabsTrigger>
        <TabsTrigger value="commercial">
          <CreditCard className="mr-2 h-4 w-4" />
          Commerciale
        </TabsTrigger>
        <TabsTrigger value="classification">
          <Users className="mr-2 h-4 w-4" />
          Classificazione
        </TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <BasicInfoTab
          formData={formData}
          onChange={handleChange}
          onNestedChange={handleNestedChange}
          companyType={companyType}
        />
      </TabsContent>

      <TabsContent value="fiscal" className="space-y-4">
        <FiscalDataTab
          formData={formData}
          onChange={handleChange}
        />
      </TabsContent>

      <TabsContent value="commercial" className="space-y-4">
        <CommercialTab
          formData={formData}
          onChange={handleChange}
          companyType={companyType}
        />
      </TabsContent>

      <TabsContent value="classification" className="space-y-4">
        <ClassificationTab
          formData={formData}
          onChange={handleChange}
          companyType={companyType}
        />
      </TabsContent>
    </Tabs>
  );
}