export const responseHandler = (req, res, next) => {
  res.success = (data = null, message = 'success') => {
    res.json({
      code: 200,
      data,
      message
    });
  };

  res.error = (message = 'error', code = -1) => {
    res.json({
      code,
      data: null,
      message
    });
  };

  next();
}; 