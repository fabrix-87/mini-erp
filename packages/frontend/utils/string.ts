// Helper per pulire e convertire i campi stringa opzionali
export const cleanStringOrNull = (
  value: string | null | undefined
): string | null | undefined => {
  // 1. Controlla se il valore esiste
  if (value === undefined || value === null) {
    return undefined; // Mantiene undefined se non è mai stato toccato
  }

  // 2. Rimuovi gli spazi vuoti iniziali e finali
  const trimmed = value.trim();

  // 3. Se la stringa risultante è vuota, restituisci null
  if (trimmed === "") {
    return null;
  }

  // 4. Altrimenti, restituisci la stringa pulita
  return trimmed;
};

// Helper per pulire e convertire i campi stringa opzionali
export const cleanStringOrUndefined = (
  value: string | undefined
): string | undefined => {
  // 1. Controlla se il valore esiste
  if (value === undefined || value === null) {
    return undefined; // Mantiene undefined se non è mai stato toccato
  }

  // 2. Rimuovi gli spazi vuoti iniziali e finali
  const trimmed = value.trim();

  // 3. Se la stringa risultante è vuota, restituisci null
  if (trimmed === "") {
    return undefined;
  }

  // 4. Altrimenti, restituisci la stringa pulita
  return trimmed;
};

