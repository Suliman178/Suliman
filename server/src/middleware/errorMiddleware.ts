import type { NextFunction, Request, Response } from 'express';
export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message = err instanceof Error ? err.message : 'Unexpected server error.';
  console.error(err);
  res.status(message.includes('not found') ? 404 : 400).json({ error: message });
}
