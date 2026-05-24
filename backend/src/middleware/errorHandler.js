export function errorHandler(err, req, res, next) {
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ error: message });
}
