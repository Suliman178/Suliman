import type { NextFunction, Request, Response } from 'express';

function statusFromError(err: unknown) {
  if (!err || typeof err !== 'object') return undefined;
  const statusCode = (err as { statusCode?: unknown }).statusCode;
  if (typeof statusCode === 'number') return statusCode;
  const status = (err as { status?: unknown }).status;
  return typeof status === 'number' ? status : undefined;
}

function sanitizeMessage(message: string) {
  return message.replace(/sk-proj-[A-Za-z0-9_-]+/g, '[redacted OpenAI key]').replace(/sk-[A-Za-z0-9_-]+/g, '[redacted OpenAI key]');
}

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const rawMessage = err instanceof Error ? err.message : 'Unexpected server error.';
  const message = sanitizeMessage(rawMessage);
  const status = statusFromError(err) ?? (message.includes('not found') ? 404 : 400);
  console.error('Server error:', { message, status });
  res.status(status).json({ error: message });
}
