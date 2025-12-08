// ============================================================================
// app/dashboard/documents/[type]/[id]/page.tsx - Visualizza/Modifica
// ============================================================================

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { DocumentForm } from '@/components/document/DocumentForm';
import { DocumentType } from '@/types/document';

const VALID_TYPES = ['quote', 'proforma', 'order', 'delivery_note', 'invoice', 'credit_note'];

interface DocumentDetailPageProps {
  params: {
    type: string;
    id: string;
  };
}

export async function generateMetadata({
  params
}: DocumentDetailPageProps): Promise<Metadata> {
  if (!VALID_TYPES.includes(params.type)) {
    return { title: 'Non trovato' };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${params.id}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.API_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      return { title: 'Documento non trovato' };
    }

    const document = await response.json();
    return {
      title: `${document.documentNumber} | Dashboard`,
      description: `Modifica ${document.documentNumber}`
    };
  } catch (error) {
    return { title: 'Documento | Dashboard' };
  }
}

async function getDocument(id: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.API_TOKEN}`
        },
        next: { revalidate: 60 }
      }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Errore:', error);
    return null;
  }
}

async function updateDocument(type: string, id: string, formData: any) {
  'use server';

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_TOKEN}`
        },
        body: JSON.stringify(formData)
      }
    );

    if (!response.ok) {
      throw new Error('Errore nell\'aggiornamento');
    }

    revalidatePath(`/dashboard/documents/${type}/${id}`);
    revalidatePath(`/dashboard/documents/${type}`);

    return { success: true };
  } catch (error) {
    console.error('Errore:', error);
    throw error;
  }
}

export default async function DocumentDetailPage({
  params
}: DocumentDetailPageProps) {
  if (!VALID_TYPES.includes(params.type)) {
    notFound();
  }

  const document = await getDocument(params.id);

  if (!document) {
    notFound();
  }

  const handleSave = async (formData: any) => {
    await updateDocument(params.type, params.id, formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{document.documentNumber}</h1>
        <p className="text-muted-foreground mt-1">{document.customerName}</p>
      </div>
      
      <DocumentForm
        mode="edit"
        documentType={params.type as DocumentType}
        document={document}
        onSave={handleSave}
      />
    </div>
  );
}