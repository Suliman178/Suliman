import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';
export const validateBody = (schema: ZodSchema): RequestHandler => (req, _res, next) => { const parsed = schema.parse(req.body); req.body = parsed; next(); };
