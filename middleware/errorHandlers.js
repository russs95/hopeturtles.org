export const notFoundHandler = (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'Resource not found' });
  }
  return res.status(404).render('error', {
    pageTitle: 'Not Found',
    message: 'The requested resource could not be located.'
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  if (req.path.startsWith('/api/')) {
    return res
      .status(err.status || 500)
      .json({ success: false, message: err.message || 'Unexpected error occurred.' });
  }
  return res.status(err.status || 500).render('error', {
    pageTitle: 'Server error',
    message: err.message || 'Unexpected error occurred.'
  });
};

export default errorHandler;
