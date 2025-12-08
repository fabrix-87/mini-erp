// ============================================================================
// app/dashboard/documents/[type]/page.tsx - Lista Documenti per Tipo
// ============================================================================

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentsList } from '@/components/document/DocumentsList';
import { DOCUMENT_TITLES, DocumentType, DocumentTypePageProps, VALID_TYPES } from '@/types/document';
import { generateDocumentMetadata, generateDocumentStaticParams } from '@/lib/utils';

export { generateDocumentMetadata as generateMetadata }
export { generateDocumentStaticParams as generateStaticParams }

export default async function DocumentTypeListPage({
  params
}: DocumentTypePageProps) {
  // Await dei params qui
  const { type } = await params;

  if (!VALID_TYPES.includes(type)) {
    notFound();
  }

  const titles = DOCUMENT_TITLES[type];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{titles.plural}</h1>
          <p className="text-muted-foreground mt-1">Gestisci i tuoi {titles.plural.toLowerCase()}</p>
        </div>
        <Link href={`/sales/documents/${type}/new`}>
          <Button size="lg" className="gap-2">
            <Plus size={20} />
            Nuovo {titles.singular}
          </Button>
        </Link>
      </div>
      
      <DocumentsList documentType={type as DocumentType} />
    </div>
  );
}