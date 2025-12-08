import { Activity } from "./activitiy";
import { Company } from "./company";

/**
 * Tipi uniti (Union Types) per i campi ENUM
 */
export type ContactSalutation = 'mr' | 'ms' | 'mrs' | 'dr' | 'prof';

export type ContactType = 
  | 'primary' 
  | 'billing' 
  | 'technical' 
  | 'decision_maker' 
  | 'influencer' 
  | 'other';

export type ContactDecisionLevel = 'executive' | 'manager' | 'employee';

export type PreferredContactMethod = 'email' | 'phone' | 'mobile' | 'whatsapp' | 'other';

/**
 * Interfaccia principale per l'entità Contatto
 * Le date vengono tipizzate come stringhe (formato ISO 8601) come da API.
 */
export interface Contact {
  // Identificativi e Relazioni
  id: number;
  companyId: number; // Obbligatorio
  assignedUserId?: number; // Assegnato
  
  // Dati anagrafici
  salutation?: ContactSalutation; // Opzionale
  firstName: string; // Obbligatorio
  lastName: string; // Obbligatorio
  
  // Ruolo e Dipartimento
  jobTitle?: string;
  department?: string;
  
  // Tipo e Livello
  contactType: ContactType;
  decisionLevel?: ContactDecisionLevel;
  
  // Contatti
  email: string; // Obbligatorio, con validazione isEmail
  secondaryEmail?: string;
  phone?: string;
  mobile?: string;
  directLine?: string;
  extension?: string;
  
  // Social/Messaging
  skype?: string;
  linkedinUrl?: string;
  whatsapp?: string;
  telegram?: string;
  
  // Indirizzo (se specifico del contatto)
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  country?: string;
  
  // Stati e Flags
  active: boolean;
  isPrimary: boolean; // Contatto principale per azienda
  isDecisionMaker: boolean; // Ha potere decisionale
  
  // Preferenze comunicazione
  preferredContactMethod: PreferredContactMethod;
  preferredLanguage: string; // Es. 'it-IT'
  
  // Consensi privacy/marketing
  acceptsMarketing: boolean;
  acceptsNewsletter: boolean;
  gdprConsentDate?: string; // Data (opzionale)
  
  // Date
  birthDate?: string; // DATEONLY (opzionale)
  lastContactDate?: string; // DATE (opzionale)
  
  // Note e Foto
  notes?: string; // TEXT
  avatarUrl?: string;
  
  // Campi custom JSON
  customFields?: Record<string, any>; // Tipo generico per JSON
  
  // Metadata (Sequelize Timestamps)
  createdAt: string;
  updatedAt: string;
  
  // Virtual
  fullName?: string; // Metodo virtuale fullName()
  
  // Relazioni (inclusa nella risposta API)
  Company?: Company; 
  Activities?: Activity[];
}

export interface CreateContactData {
  companyId: string;
  salutation: ContactSalutation
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  contactType: ContactType;
  decisionLevel: ContactDecisionLevel;
  email: string;
  secondaryEmail: string;
  phone: string;
  mobile: string;
  directLine: string;
  extension: string;
  skype: string;
  linkedinUrl: string;
  whatsapp: string;
  telegram: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
  isPrimary: boolean;
  isDecisionMaker: boolean;
  active: boolean;
  preferredContactMethod: PreferredContactMethod;
  preferredLanguage: string;
  acceptsMarketing: boolean;
  acceptsNewsletter: boolean;
  birthDate?: string;
  notes: string;
}
