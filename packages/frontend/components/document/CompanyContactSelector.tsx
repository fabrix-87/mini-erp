// components/document/CompanyContactSelector.tsx
import { CommandInput, CommandItem, CommandList } from "@/components/ui/cmd";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useEffect, useRef, useState } from "react";
import { Company } from "@/types/company-types";
import { Contact } from "@/types/contact-types";
// Importa i tuoi tipi Company e Contact
// import { Company, Contact } from "@/types/data"; 

interface CompanyContactSelectorProps {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  selectedContact: Contact | null;
  setSelectedContact: (contact: Contact | null) => void;
  handleChange: (key: any, value: any) => void;
}

export function CompanyContactSelector({
  selectedCompany,
  setSelectedCompany,
  selectedContact,
  setSelectedContact,
  handleChange,
}: CompanyContactSelectorProps) {
  // Logica per Company Selector (ricerca aziende)
  const [isCompanyPopoverOpen, setIsCompanyPopoverOpen] = useState(false);
  const [companyQuery, setCompanyQuery] = useState("");
  // ... Stati di loading e filteredCompanies

  // Logica per Contact Selector (ricerca contatti, che usa selectedCompany.id)
  const [isContactPopoverOpen, setIsContactPopoverOpen] = useState(false);
  const [contactQuery, setContactQuery] = useState("");
  const isSelectingCompany = useRef(false); // Ref mantenuto qui
  // ... Stati di loading e filteredContacts

  // Funzione di ricerca contatti (CORRETTA con useCallback e dipendenze)
  const searchContactsList = useCallback(async (query: string = "") => {
    // ... (La logica corretta che abbiamo scritto in precedenza)
    // Se la logica di ricerca contatti è complessa, potresti spostarla in un altro custom hook
    // ma per chiarezza, la lasciamo qui per gestire i contatti locali
    
    if (isSelectingCompany.current || !selectedCompany) return; 

    // Esempio di logica di ricerca:
    // try {
    //     const response = await getContacts({
    //         search: query,
    //         companyId: selectedCompany.id
    //     });
    //     // setFilteredContacts(response.data);
    // } catch (e) { /* ... */ }

  }, [selectedCompany]); 

  // Esecuzione della ricerca quando cambia l'azienda selezionata
  useEffect(() => {
    if (selectedCompany) {
      handleChange("companyId", selectedCompany.id);
      searchContactsList();
    } else {
      handleChange("companyId", null);
      setSelectedContact(null);
    }
  }, [selectedCompany, searchContactsList, handleChange, setSelectedContact]);

  // Restituzione JSX della Command Palette per Company e Contact
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Dati Cliente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Componente Popover per la selezione Azienda */}
        <div>
          <Label htmlFor="company-select">Azienda *</Label>
          <Popover open={isCompanyPopoverOpen} onOpenChange={setIsCompanyPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                // ... Stili
              >
                {selectedCompany ? selectedCompany.name : "Seleziona Azienda"}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Cerca azienda..." />
                <CommandList>
                  {/* ... Logica e CommandItem per le aziende */}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Componente Popover per la selezione Contatto (simile a Company) */}
        {selectedCompany && (
            // ... JSX per il selector del Contatto
            <p>Selector Contatto qui (usa selectedCompany per filtrare)</p>
        )}
      </CardContent>
    </Card>
  );
}