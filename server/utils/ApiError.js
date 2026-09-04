// Controller'larda tekrar tekrar yazılan
//   const err = new Error(mesaj);
//   err.statusCode = kod;
//   throw err;
// kalıbı yerine, tek satırla: throw new ApiError(kod, mesaj)
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;