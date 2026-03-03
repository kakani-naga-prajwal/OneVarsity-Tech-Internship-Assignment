export function errorHandler(err, req, res, next) {
  console.error(err.stack);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong.' : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

export function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Resource not found.' });
}
