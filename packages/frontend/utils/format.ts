// Funzione helper per la formattazione delle date
export const formatDateTime = (dateStr?: string, timeStr?: string): string | undefined => {
  if (dateStr && timeStr) {
    // Crea l'oggetto Date
    const dateObj = new Date(`${dateStr}T${timeStr}:00`);

    // Controlla se è una data valida prima di convertirla in ISO string
    if (isNaN(dateObj.getTime())) {
      return undefined; // O solleva un errore se la data è invalida
    }

    // Converte nel formato ISO 8601 richiesto (es. 2025-11-09T17:00:00.000Z)
    return dateObj.toISOString();
  }
  return undefined;
};

export const formatDate = (date: string | Date) => new Date(date).toLocaleString("it-IT");
