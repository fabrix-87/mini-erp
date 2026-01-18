


// Interfaccia per l'oggetto 'shippingAddress' utilizzato nel DTO e nel Joi validator
// (È solo un sottoinsieme dei campi salvati come snapshot sul Documento)
export interface ShippingAddressDTO {
  name?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  province?: string | null;
  country?: string | null; // Codice ISO 2-lettere (come definito nel validator)
}