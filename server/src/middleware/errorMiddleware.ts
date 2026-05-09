import type { ErrorRequestHandler } from 'express';
export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Unexpected server error' });
};
