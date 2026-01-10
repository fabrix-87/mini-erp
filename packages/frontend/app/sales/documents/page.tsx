// ============================================================================
// app/sales/documents/page.tsx - Selettore Tipo Documento
// ============================================================================

import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Package, Truck, CreditCard, File } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documenti | Dashboard',
  description: 'Gestisci preventivi, ordini, fatture e altri documenti'
};

const DOCUMENT_TYPES = [
  {
    type: 'quote',
    label: 'Preventivi',
    description: 'Preventivi commerciali',
    icon: FileText,
    color: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-600'
  },
  {
    type: 'proforma',
    label: 'Proforma',
    description: 'Fatture proforma',
    icon: File,
    color: 'bg-purple-50 border-purple-200',
    textColor: 'text-purple-600'
  },
  {
    type: 'order',
    label: 'Ordini',
    description: 'Ordini di acquisto/vendita',
    icon: Package,
    color: 'bg-green-50 border-green-200',
    textColor: 'text-green-600'
  },
  {
    type: 'delivery_note',
    label: 'Documenti di Trasporto',
    description: 'DDT e bolla di accompagnamento',
    icon: Truck,
    color: 'bg-orange-50 border-orange-200',
    textColor: 'text-orange-600'
  },
  {
    type: 'invoice',
    label: 'Fatture',
    description: 'Fatture e note di credito',
    icon: FileText,
    color: 'bg-red-50 border-red-200',
    textColor: 'text-red-600'
  },
  {
    type: 'credit_note',
    label: 'Note di Credito',
    description: 'Storno e note di credito',
    icon: CreditCard,
    color: 'bg-yellow-50 border-yellow-200',
    textColor: 'text-yellow-600'
  }
];

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documenti</h1>
        <p className="text-muted-foreground mt-2">Seleziona il tipo di documento da gestire</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOCUMENT_TYPES.map((docType) => {
          const Icon = docType.icon;
          return (
            <Link key={docType.type} href={`/sales/documents/${docType.type}`}>
              <Card className={`${docType.color} border cursor-pointer hover:shadow-lg transition-shadow h-full`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{docType.label}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {docType.description}
                      </CardDescription>
                    </div>
                    <Icon className={`${docType.textColor} w-6 h-6 shrink-0`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    asChild 
                    className="w-full"
                   
                  >
                    <span>Gestisci</span>
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}