import logger from "./logger";

// config/validate-env.ts
const validateEnv = () => {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'JWT_ISSUER',
    'FRONTEND_URI'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Variabili d'ambiente mancanti: ${missing.join(', ')}\n` +
      `Copia .env.example in .env e configura i valori`
    );
  }

  // Verifica lunghezza JWT secrets
  if (process.env.JWT_SECRET!.length < 64) {
    logger.warn(
      '⚠️  JWT_SECRET è più corto di 64 caratteri. ' +
      'Per produzione usa almeno 64 caratteri.'
    );
  }

  if (process.env.JWT_REFRESH_SECRET!.length < 64) {
    logger.warn(
      '⚠️  JWT_REFRESH_SECRET è più corto di 64 caratteri. ' +
      'Per produzione usa almeno 64 caratteri.'
    );
  }

  logger.info('✅ Variabili d\'ambiente validate con successo');
};

export default validateEnv;
