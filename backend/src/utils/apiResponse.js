class ApiResponse {
  static success(res, message = 'Success', data = null, statusCode = 200) {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  }

  static error(res, message = 'Error', errors = null, statusCode = 500) {
    return res.status(statusCode).json({
      status: 'error',
      message,
      errors,
    });
  }
}

module.exports = ApiResponse;
