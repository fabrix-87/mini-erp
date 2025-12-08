import { AuthConfig } from "../types/user";
import ms from "ms";

// Helper per conversione sicura
const safeMs = (timeString: string, fallback: number): number => {
  try {
    // Cast esplicito per forzare l'overload corretto
    const result = ms(timeString as any) as unknown as number;
    
    // Verifica che sia effettivamente un numero
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

// Valida variabili d'ambiente all'avvio
const validateEnv = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET non è definito nelle variabili d'ambiente");
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error(
      "JWT_REFRESH_SECRET non è definito nelle variabili d'ambiente"
    );
  }
};

validateEnv();

const authConfig: AuthConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || "default-secret-change-me",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "default-refresh-secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    // Pre-calcola i millisecondi una sola volta
    expiresInMs: safeMs(process.env.JWT_EXPIRES_IN || "15m", 15 * 60 * 1000),
    refreshExpiresInMs: safeMs(
      process.env.JWT_REFRESH_EXPIRES_IN || "7d",
      7 * 24 * 60 * 60 * 1000
    ),
  },
  isProduction: process.env.NODE_ENV === "production",
} as const;

export default authConfig;
