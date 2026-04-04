export function notFoundHandler(req, res) {
  return res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(error, _req, res, _next) {
  const isUploadError =
    error?.name === 'MulterError' || error?.message === 'Only image files are allowed.';

  return res.status(error.statusCode || (isUploadError ? 400 : 500)).json({
    message:
      isUploadError ?
      error.message :
      error.message || 'Internal server error.'
  });
}
