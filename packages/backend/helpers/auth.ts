import ms from "ms";

// Helper per conversione sicura
export const safeMs = (timeString: string, fallback: number): number => {
  try {
    const result = ms(timeString as any) as unknown as number;
    if (typeof result === 'number' && !isNaN(result) && result > 0) {
      return result;
    }
    console.warn(`Valore non valido da ms('${timeString}'): ${result}. Uso fallback: ${fallback}ms`);
    return fallback;
  } catch (error) {
    console.error(`Errore nel parsing di '${timeString}':`, error);
    return fallback;
  }
};