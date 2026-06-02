import type { Contact } from '@/types/contact-types';

/**
 * Formatta nome completo
 */
export function getFullName(contact: Contact): string {
  return `${contact.firstName} ${contact.lastName}`.trim();
}

/**
 * Formatta display name con email
 */
export function getDisplayName(contact: Contact): string {
  return `${getFullName(contact)} (${contact.email})`;
}

/**
 * Ottieni iniziali
 */
export function getInitials(contact: Contact): string {
  return `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`.toUpperCase();
}

/**
 * Verifica se contatto è attivo
 */
export function isActive(contact: Contact): boolean {
  return contact.active;
}

/**
 * Verifica se contatto è primario
 */
export function isPrimary(contact: Contact): boolean {
  return contact.isPrimaryContact;
}

/**
 * Formatta data per display
 */
export function formatContactDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formatta telefono italiano
 */
export function formatPhone(phone: string): string {
  // Rimuovi spazi e caratteri speciali tranne +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Formatta numero italiano
  if (cleaned.startsWith('+39')) {
    const number = cleaned.slice(3);
    if (number.length === 10) {
      // Mobile: +39 333 1234567
      return `+39 ${number.slice(0, 3)} ${number.slice(3)}`;
    } else if (number.length > 6) {
      // Fisso: +39 02 12345678
      return `+39 ${number.slice(0, 2)} ${number.slice(2)}`;
    }
  }
  
  return phone;
}

/**
 * Valida email format
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Estrai dominio da email
 */
export function getEmailDomain(email: string): string {
  return email.split('@')[1] || '';
}

/**
 * Download blob come file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Genera nome file export con timestamp
 */
export function generateExportFilename(prefix: string, extension: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Filtra contatti per search term
 */
export function filterContactsBySearch(contacts: Contact[], search: string): Contact[] {
  if (!search) return contacts;
  
  const term = search.toLowerCase();
  return contacts.filter(contact => 
    contact.firstName.toLowerCase().includes(term) ||
    contact.lastName.toLowerCase().includes(term) ||
    contact.email.toLowerCase().includes(term) ||
    contact.position?.toLowerCase().includes(term) ||
    contact.department?.toLowerCase().includes(term)
  );
}

/**
 * Raggruppa contatti per azienda
 */
export function groupContactsByCompany(contacts: Contact[]): Record<number, Contact[]>{
  return contacts.reduce((acc, contact) => {
    if (!acc[contact.companyId]) {
      acc[contact.companyId] = [];
    }
    acc[contact.companyId].push(contact);
    return acc;
  }, {} as Record<number, Contact[]>);
}

/**
 * Ordina contatti
 */
export function sortContacts(
  contacts: Contact[],
  field: keyof Contact,
  order: 'asc' | 'desc' = 'asc'
): Contact[] {
  return [...contacts].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    return order === 'asc'
      ? (aVal > bVal ? 1 : -1)
      : (aVal < bVal ? 1 : -1);
  });
}

/**
 * Statistiche contatti
 */
export function getContactStats(contacts: Contact[]) {
  return {
    total: contacts.length,
    active: contacts.filter(c => c.active).length,
    inactive: contacts.filter(c => !c.active).length,
    primary: contacts.filter(c => c.isPrimaryContact).length,
    byDepartment: contacts.reduce((acc, c) => {
      if (c.department) {
        acc[c.department] = (acc[c.department] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    byPosition: contacts.reduce((acc, c) => {
      if (c.position) {
        acc[c.position] = (acc[c.position] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
  };
}

/**
 * Trova contatto primario in una lista
 */
export function findPrimaryContact(contacts: Contact[]): Contact | null {
  return contacts.find(c => c.isPrimaryContact) || null;
}

/**
 * Valida struttura contatto
 */
export function validateContact(contact: Partial<Contact>): string[] {
  const errors: string[] = [];
  
  if (!contact.companyId) errors.push('Company ID è obbligatorio');
  if (!contact.firstName) errors.push('Nome è obbligatorio');
  if (!contact.lastName) errors.push('Cognome è obbligatorio');
  if (!contact.email) errors.push('Email è obbligatoria');
  if (contact.email && !isValidEmail(contact.email)) errors.push('Email non valida');
  
  return errors;
}