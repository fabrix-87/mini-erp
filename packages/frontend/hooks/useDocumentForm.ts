// hooks/useDocumentForm.ts
import { useState, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CreateDocumentDTO,
  DocumentLineDTO,
  DocumentType,
} from "@/types/document";
import { Company } from "@/types/company-types";
import { Contact } from "@/types/contact";
import { createDocument, updateDocument } from "@/lib/client/modules/document";
// import { createDocument, updateDocument } from "@/services/documentService"; // I tuoi service reali

interface UseDocumentFormProps {
  initialDocument?: CreateDocumentDTO;
  mode: "create" | "edit";
  documentType: DocumentType;
}

export const useDocumentForm = ({
  initialDocument,
  mode,
  documentType,
}: UseDocumentFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stato per i selettori (gestiti qui per sincronizzarli col form)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Stato principale del form
  const [formData, setFormData] = useState<CreateDocumentDTO>(
    initialDocument ||
      ({
        documentType,
        companyId: null, // Dovrebbe essere number, ma lo lasciamo null per il check iniziale

        // Inizializza qui tutti gli altri campi base del DTO
        lines: [] as DocumentLineDTO[],
        shippingAddress: null,
      } as unknown as CreateDocumentDTO) // Cast per sicurezza
  );

  // Gestore generico cambio campi
  const handleChange = useCallback(
    (key: keyof CreateDocumentDTO, value: any) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // --- GESTIONE RIGHE ---

  const addLine = useCallback(() => {
    const newLine: DocumentLineDTO = {
      name: "",
      description: "",
      quantity: 1,
      unit: "pz",
      unitPrice: 0,
      discountPercent: 0,
      taxPercent: 22,
      lineTotal: 0,
      discountAmount: 0,
      lineType: "product",
    };
    setFormData((prev) => ({ ...prev, lines: [...prev.lines, newLine] }));
  }, []);

  const removeLine = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index),
    }));
  }, []);

  const updateLine = useCallback(
    (index: number, field: keyof DocumentLineDTO, value: any) => {
      setFormData((prev) => {
        const newLines = [...prev.lines];
        const currentLine = newLines[index];

        // Aggiorna il campo
        const updatedLine = { ...currentLine, [field]: value };

        // Calcolo automatico del totale riga per UI (prezzo * qtà)
        if (
          field === "quantity" ||
          field === "unitPrice" ||
          field === "discountPercent"
        ) {
          const qty =
            field === "quantity" ? Number(value) : currentLine.quantity;
          const price =
            field === "unitPrice" ? Number(value) : currentLine.unitPrice;
          const discount =
            field === "discountPercent"
              ? Number(value)
              : currentLine.discountPercent;

          const subtotal = qty * price;
          const discountAmount = (subtotal * discount) / 100;
          updatedLine.lineTotal = subtotal - discountAmount;
        }

        newLines[index] = updatedLine;
        return { ...prev, lines: newLines };
      });
    },
    []
  );

  // --- SUBMIT ---

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      if (!formData.companyId) {
        setError("Selezionare un'azienda è obbligatorio.");
        setIsLoading(false);
        return;
      }

      if (formData.lines.length === 0) {
        setError("Inserire almeno una riga nel documento.");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Submitting:", formData);
        let documentId = null
        if(mode === 'create'){
            const result = await createDocument(formData)            
            documentId = result.data.id
        }else{
            documentId = formData.id
            updateDocument(documentId, formData)
        }        
        router.push(`/documents/${documentType}/${documentId}`);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Errore durante il salvataggio.");
      } finally {
        setIsLoading(false);
      }
    },
    [formData, mode, router, documentType]
  );

  return {
    formData,
    isLoading,
    error,
    selectedCompany,
    setSelectedCompany,
    selectedContact,
    setSelectedContact,
    handleChange,
    handleSubmit,
    addLine,
    removeLine,
    updateLine,
  };
};
