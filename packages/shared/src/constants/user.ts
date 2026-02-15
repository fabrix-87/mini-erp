import { genderSchema } from '../validators';
import { z } from 'zod';

// ============================================================================
// ENUM TYPES
// ============================================================================

export type Gender = z.infer<typeof genderSchema>;