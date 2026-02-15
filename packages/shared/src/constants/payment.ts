import { z } from 'zod';
import { termTypeSchema } from '../validators';

export type TermType = z.infer<typeof termTypeSchema>;