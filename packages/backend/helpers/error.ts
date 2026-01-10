import winston from 'winston';
const { format } = winston;

/**
 * Estrae informazioni dettagliate da una catena di errori
 */
export const extractErrorChain = (error: any): any[] => {
  const chain = [];
  let currentError = error;
  
  while (currentError) {
    chain.push({
      name: currentError.name,
      message: currentError.message,
      stack: currentError.stack,
      isOperational: currentError.isOperational ?? false
    });
    currentError = currentError.cause;
  }
  
  return chain;
};

export const sanitizeMetadata = format((info) => {
  const sensitiveFields = ['password', 'token', 'authorization', 'cookie'];
  
  const sanitize = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = { ...obj };
    for (const key in sanitized) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitize(sanitized[key]);
      }
    }
    return sanitized;
  };
  
  return sanitize(info);
});