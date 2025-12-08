// ============================================================================
// app/sales/documents/[type]/new/page.tsx - Crea Nuovo Documento
// ============================================================================

"use client";

import { notFound, redirect } from "next/navigation";
import { DocumentForm } from "@/components/document/DocumentForm";
import {
  DOCUMENT_TITLES,
  DocumentType,
  DocumentTypePageProps,
  VALID_TYPES,
} from "@/types/document";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

async function createDocument(type: string, formData: any) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/documents`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_TOKEN}`,
        },
        body: JSON.stringify({
          ...formData,
          documentType: type,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Errore nella creazione del documento");
    }

    const data = await response.json();
    redirect(`/sales/documents/${type}/${data.id}`);
  } catch (error) {
    console.error("Errore:", error);
    throw error;
  }
}

export default function NewDocumentPage({
  params,
}: DocumentTypePageProps) {
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");

  useEffect(() => {
    if (type === "") fetchType();
    else {
      setLoading(false)
      if (!VALID_TYPES.includes(type)) {
        notFound();
      }
    }
  }, [type]);

  const fetchType = async () => {
    // Await dei params qui
    const { type } = await params;
    setType(type);
  };

  const handleSave = async (formData: any) => {
    await createDocument(type, formData);
  };

  if(loading){
    return <Spinner/>
  }

  return (
    <>
      <DocumentForm
        mode="create"
        documentType={type as DocumentType}
        onSave={handleSave}
      />
    </>
  );
}
