export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // 处理已知错误类型
  if (err.type === "ValidationError") {
    return res.error(err.message, 400);
  }

  if (err.type === "AuthError") {
    return res.error(err.message, 401);
  }

  // 未知错误
  res.error("服务器内部错误", 500);
};
