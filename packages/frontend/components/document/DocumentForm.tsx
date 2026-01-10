// ============================================================================
// components/document/DocumentForm.tsx
// ============================================================================

"use client";

import { ReactNode, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Package, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FormField } from "@/components/document/FormField";
import { DocumentLineRow } from "@/components/document/DocumentLine";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreateDocumentDTO,
  DocumentLineDTO,
  DocumentType,
  ShippingAddressDTO,
  VALID_TYPES,
} from "@/types/document";
import { Company, companyFilters } from "@/types/company";
import { Contact } from "@/types/contact";
import { getCompanies } from "@/lib/client/modules/company";
import { getContactParams, getContacts, searchContacts } from "@/lib/api/modules/contact";

interface DocumentFormProps {
  mode: "create" | "edit";
  documentType?: DocumentType;
  document?: any;
  onSave?: (data: CreateDocumentDTO) => Promise<void>;
  onCancel?: () => void;
}

interface FormData
  extends Omit<CreateDocumentDTO, "lines" | "shippingAddress"> {
  lines: DocumentLineDTO[];
  shippingAddress: ShippingAddressDTO | null;
}

const INITIAL_FORM_DATA: FormData = {
  documentType: "quote",
  companyId: 0,
  contactId: undefined,
  documentDate: new Date().toISOString().split("T")[0],
  dueDate: "",
  deliveryDate: "",
  validUntil: "",
  status: "draft",
  currency: "EUR",
  discountPercent: 0,
  discountAmount: 0,
  shippingCost: 0,
  paymentMethod: "bank_transfer",
  paymentTermDays: 30,
  notes: "",
  internalNotes: "",
  termsAndConditions: "",
  shippingAddress: null,
  lines: [
    {
      lineType: "product",
      name: "",
      quantity: 1,
      unitPrice: 0,
      unit: "pz",
      discountPercent: 0,
      taxPercent: 22,
      discountAmount: 0,
    },
  ],
};

export function DocumentForm({
  mode = "create",
  documentType = "quote",
  document,
  onSave,
  onCancel,
}: DocumentFormProps): ReactNode {
  const router = useRouter();

  // State Form
  const [formData, setFormData] = useState<FormData>({
    ...(document || INITIAL_FORM_DATA),
    documentType: document?.documentType || documentType,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // State Company Search
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [companyOpen, setCompanyOpen] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const companySearchTimeout = useRef<NodeJS.Timeout | null>(null);
  const isSelectingCompany = useRef(false);

  // State Contact Search
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const contactSearchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Ricerca companies da API con debounce
  const searchCompanies = useCallback(async (query: string = "") => {
    setLoadingCompanies(true);
    try {
      const filters: companyFilters = {
        limit: 20,
        search: query,
        active: true,
      };

      const response = await getCompanies(filters);
      setFilteredCompanies(response.data)      
    } catch (error) {
      console.error("Errore ricerca aziende:", error);
      setFilteredCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  }, []);

  // Ricerca contacts da API con debounce
  const searchContactsList = useCallback(async (query: string = "") => {
    if (isSelectingCompany.current) return;
       
    setLoadingContacts(true);
    // se non è selezionata una company non carico i contatti
    if(!selectedCompany){
      setFilteredContacts([])
      setLoadingContacts(false)
      return;
    }


    try {
      const params: getContactParams = {
        page: 1,
        limit: 10,
        search: query,
        companyId: selectedCompany.id
      }
      const response = await getContacts(params);
      setFilteredContacts(response.data || []);
    } catch (error) {
      console.error("Errore ricerca contatti:", error);
      setFilteredContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  }, [selectedCompany]);

  // Carica companies iniziali al montaggio
  useEffect(() => {
    searchCompanies();
  }, [searchCompanies]);

  // Debounce ricerca companies
  useEffect(() => {
    if (companySearchTimeout.current) {
      clearTimeout(companySearchTimeout.current);
    }

    companySearchTimeout.current = setTimeout(() => {
      searchCompanies(companySearch);
    }, 300);

    return () => {
      if (companySearchTimeout.current) {
        clearTimeout(companySearchTimeout.current);
      }
    };
  }, [companySearch, searchCompanies]);

  // Debounce ricerca contacts
  useEffect(() => {
    if (isSelectingCompany.current) return;

    if (contactSearchTimeout.current) {
      clearTimeout(contactSearchTimeout.current);
    }

    contactSearchTimeout.current = setTimeout(() => {
      searchContactsList(contactSearch);
    }, 300);

    return () => {
      if (contactSearchTimeout.current) {
        clearTimeout(contactSearchTimeout.current);
      }
    };
  }, [contactSearch, searchContactsList]);

  // Seleziona company
  const handleSelectCompany = (company: Company) => {
    isSelectingCompany.current = true;
    setSelectedCompany(company);
    setFormData({ ...formData, companyId: company.id, contactId: undefined });
    setSelectedContact(null);
    setCompanyOpen(false);
    setCompanySearch("");
    // Carica contacts per questa company
    isSelectingCompany.current = false;
    console.log(company)
    searchContactsList("");
  };

  // Seleziona contact
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData({ ...formData, contactId: contact.id });
    setContactOpen(false);
    setContactSearch("");
  };

  const handleInputChange = (e: any): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLineUpdate = (
    index: number,
    updatedLine: DocumentLineDTO
  ): void => {
    const newLines = [...formData.lines];
    newLines[index] = updatedLine;
    setFormData({ ...formData, lines: newLines });
  };

  const handleLineDelete = (index: number): void => {
    const newLines = formData.lines.filter((_, i) => i !== index);
    setFormData({ ...formData, lines: newLines });
  };

  const handleAddLine = (): void => {
    setFormData({
      ...formData,
      lines: [
        ...formData.lines,
        {
          lineType: "product",
          name: "",
          quantity: 1,
          unitPrice: 0,
          unit: "pz",
          discountPercent: 0,
          discountAmount: 0,
          taxPercent: 22,
        },
      ],
    });
  };

  const handleShippingAddressChange = (
    field: keyof ShippingAddressDTO,
    value: string
  ) => {
    setFormData({
      ...formData,
      shippingAddress: {
        ...formData.shippingAddress,
        [field]: value,
      },
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validazioni
    if (!formData.companyId || formData.companyId === 0) {
      setErrors({ companyId: "Azienda obbligatoria" });
      setIsLoading(false);
      return;
    }

    if (formData.lines.length === 0) {
      setErrors({ lines: "Almeno una riga è obbligatoria" });
      setIsLoading(false);
      return;
    }

    const hasValidLines = formData.lines.some(
      (line) => line.name && line.unitPrice > 0 && line.quantity > 0
    );

    if (!hasValidLines) {
      setErrors({ lines: "Almeno un articolo con prezzo e quantità" });
      setIsLoading(false);
      return;
    }

    try {
      if (onSave) {
        const dto: CreateDocumentDTO = {
          ...formData,
          companyId: formData.companyId,
          lines: formData.lines,
          shippingAddress: formData.shippingAddress,
        };

        await onSave(dto);
      }
      router.push(`/dashboard/documents/${formData.documentType}`);
    } catch (error) {
      console.error("Errore salvataggio:", error);
      setErrors({ form: "Errore nel salvataggio del documento" });
    } finally {
      setIsLoading(false);
    }
  };

  // Calcolo totali
  let subtotal = 0;
  let taxTotal = 0;

  formData.lines.forEach((line) => {
    const qty = parseFloat(String(line.quantity)) || 0;
    const price = parseFloat(String(line.unitPrice)) || 0;
    const discount = parseFloat(String(line.discountPercent)) || 0;
    const tax = parseFloat(String(line.taxPercent)) || 22;

    const lineTotal = qty * price;
    const discountAmount = (lineTotal * discount) / 100;
    const taxableAmount = lineTotal - discountAmount;
    const lineTax = (taxableAmount * tax) / 100;

    subtotal += lineTotal;
    taxTotal += lineTax;
  });

  const discount =
    (subtotal * (parseFloat(String(formData.discountPercent)) || 0)) / 100;
  const taxableAmount = subtotal - discount;
  const shippingCost = parseFloat(String(formData.shippingCost)) || 0;
  const shippingTax = shippingCost * 0.22;
  const totalAmount = taxableAmount + taxTotal + shippingCost + shippingTax;

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.form && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {errors.form}
          </div>
        )}

        {/* SEZIONE 1: INFORMAZIONI DOCUMENTO */}
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Documento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Tipo Documento"
                type="select"
                name="documentType"
                value={formData.documentType}
                onChange={handleInputChange}
                options={[
                  { value: "quote", label: "Preventivo" },
                  { value: "proforma", label: "Proforma" },
                  { value: "order", label: "Ordine" },
                  { value: "delivery_note", label: "DDT" },
                  { value: "invoice", label: "Fattura" },
                  { value: "credit_note", label: "Nota di Credito" },
                ]}
                disabled={mode === "edit"}
                required
              />

              <FormField
                label="Status"
                type="select"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={[
                  { value: "draft", label: "Bozza" },
                  { value: "pending", label: "In Sospeso" },
                  { value: "approved", label: "Approvato" },
                  { value: "sent", label: "Inviato" },
                  { value: "paid", label: "Pagato" },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Data Documento"
                type="date"
                name="documentDate"
                value={formData.documentDate}
                onChange={handleInputChange}
                required
              />

              <FormField
                label="Data Scadenza"
                type="date"
                name="dueDate"
                value={formData.dueDate || ""}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* SEZIONE 2: CLIENTE - COMPANY SEARCH */}
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={companyOpen}
                  className="w-full justify-between text-left font-normal"
                >
                  {selectedCompany?.companyName || "Seleziona azienda..."}
                  <Search
                    size={16}
                    className="ml-2 h-4 w-4 shrink-0 opacity-50"
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Cerca azienda per nome o codice..."
                    value={companySearch}
                    onValueChange={setCompanySearch}
                  />
                  <CommandEmpty>
                    {loadingCompanies ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      "Nessuna azienda trovata"
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {filteredCompanies.map((company) => (
                      <CommandItem
                        key={company.id}
                        value={company.companyName}
                        onSelect={() => handleSelectCompany(company)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex-1">
                            <div className="font-medium">
                              {company.companyName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {company.code} • {company.primaryEmail}
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {errors.companyId && (
              <p className="text-sm text-red-600">{errors.companyId}</p>
            )}

            {/* Informazioni Azienda Selezionata */}
            {selectedCompany && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Indirizzo:</span>{" "}
                  {selectedCompany.legalAddress},{" "}
                  {selectedCompany.legalPostalCode} {selectedCompany.legalCity}
                </p>
                <p className="text-sm">
                  <span className="font-medium">P.IVA:</span>{" "}
                  {selectedCompany.vatNumber}
                </p>
                {selectedCompany.pecEmail && (
                  <p className="text-sm">
                    <span className="font-medium">PEC:</span>{" "}
                    {selectedCompany.pecEmail}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEZIONE 3: CONTATTO - CONTACT SEARCH */}
        {selectedCompany && (
          <Card>
            <CardHeader>
              <CardTitle>Contatto</CardTitle>
            </CardHeader>
            <CardContent>
              <Popover open={contactOpen} onOpenChange={setContactOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={contactOpen}
                    className="w-full justify-between text-left font-normal"
                  >
                    {selectedContact?.fullName || "Seleziona contatto..."}
                    <Search
                      size={16}
                      className="ml-2 h-4 w-4 shrink-0 opacity-50"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Cerca contatto per nome o email..."
                      value={contactSearch}
                      onValueChange={setContactSearch}
                    />
                    <CommandEmpty>
                      {loadingContacts ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        "Nessun contatto trovato"
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredContacts.map((contact) => (
                        <CommandItem
                          key={contact.id}
                          value={contact.fullName}
                          onSelect={() => handleSelectContact(contact)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex-1">
                              <div className="font-medium">{contact.fullName}</div>
                              <div className="text-xs text-muted-foreground">
                                {contact.email} • {contact.phone}
                              </div>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
        )}

        {/* SEZIONE 4: RIGHE DOCUMENTO */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Articoli</CardTitle>
            <Button
              type="button"
              onClick={handleAddLine}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isLoading}
            >
              <Plus size={16} />
              Aggiungi Articolo
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.lines.map((line, index) => (
              <DocumentLineRow
                key={index}
                line={line}
                index={index}
                onUpdate={handleLineUpdate}
                onDelete={handleLineDelete}
              />
            ))}
            {errors.lines && (
              <p className="text-sm text-red-600">{errors.lines}</p>
            )}
          </CardContent>
        </Card>

        {/* SEZIONE 5: INDIRIZZO SPEDIZIONE */}
        <Card>
          <CardHeader>
            <CardTitle>Indirizzo Spedizione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Nome destinatario"
                value={formData.shippingAddress?.name || ""}
                onChange={(e) =>
                  handleShippingAddressChange("name", e.target.value)
                }
              />
              <Input
                placeholder="Indirizzo"
                value={formData.shippingAddress?.address || ""}
                onChange={(e) =>
                  handleShippingAddressChange("address", e.target.value)
                }
              />
              <Input
                placeholder="Città"
                value={formData.shippingAddress?.city || ""}
                onChange={(e) =>
                  handleShippingAddressChange("city", e.target.value)
                }
              />
              <Input
                placeholder="CAP"
                value={formData.shippingAddress?.postalCode || ""}
                onChange={(e) =>
                  handleShippingAddressChange("postalCode", e.target.value)
                }
              />
              <Input
                placeholder="Provincia"
                value={formData.shippingAddress?.province || ""}
                onChange={(e) =>
                  handleShippingAddressChange("province", e.target.value)
                }
              />
              <Input
                placeholder="Paese"
                value={formData.shippingAddress?.country || ""}
                onChange={(e) =>
                  handleShippingAddressChange("country", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* SEZIONE 6: IMPORTI */}
        <Card>
          <CardHeader>
            <CardTitle>Importi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Sconto Documento (%)"
                type="number"
                name="discountPercent"
                value={formData.discountPercent || 0}
                onChange={handleInputChange}
                step="0.01"
                min="0"
              />

              <FormField
                label="Costo Spedizione (€)"
                type="number"
                name="shippingCost"
                value={formData.shippingCost || 0}
                onChange={handleInputChange}
                step="0.01"
                min="0"
              />

              <FormField
                label="Valuta"
                type="select"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                options={[
                  { value: "EUR", label: "Euro (€)" },
                  { value: "USD", label: "Dollaro ($)" },
                  { value: "GBP", label: "Sterlina (£)" },
                ]}
              />

              <FormField
                label="Metodo Pagamento"
                type="select"
                name="paymentMethod"
                value={formData.paymentMethod || ""}
                onChange={handleInputChange}
                options={[
                  { value: "bank_transfer", label: "Bonifico" },
                  { value: "credit_card", label: "Carta di Credito" },
                  { value: "check", label: "Assegno" },
                  { value: "cash", label: "Contanti" },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* SEZIONE 7: NOTE */}
        <Card>
          <CardHeader>
            <CardTitle>Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Note Documento"
              type="textarea"
              name="notes"
              value={formData.notes || ""}
              onChange={handleInputChange}
              placeholder="Note da includere nel documento..."
            />

            <FormField
              label="Note Interne"
              type="textarea"
              name="internalNotes"
              value={formData.internalNotes || ""}
              onChange={handleInputChange}
              placeholder="Note interne non visibili al cliente..."
            />
          </CardContent>
        </Card>

        {/* SEZIONE 8: RIEPILOGO TOTALI */}
        <Card>
          <CardHeader>
            <CardTitle>Riepilogo Totali</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotale:</span>
              <span className="font-medium">€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Sconto Documento ({formData.discountPercent}%):
              </span>
              <span className="font-medium">-€{discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IVA totale:</span>
              <span className="font-medium">€{taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Spedizione:</span>
              <span className="font-medium">€{shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IVA Spedizione:</span>
              <span className="font-medium">€{shippingTax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base">
              <span className="font-semibold">Totale Documento:</span>
              <span className="text-lg font-bold text-blue-600">
                €{totalAmount.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-white py-4 border-t">
          <Button
            type="button"
            onClick={() => router.back()}
            variant="outline"
            disabled={isLoading}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            size="lg"
            className="gap-2"
            disabled={isLoading}
          >
            <Package size={16} />
            {isLoading
              ? "Salvataggio in corso..."
              : mode === "create"
              ? "Crea Documento"
              : "Salva Modifiche"}
          </Button>
        </div>
      </form>
    </div>
  );
}