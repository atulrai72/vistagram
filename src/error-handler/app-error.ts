export class AppError extends Error {
  public readonly statusCode?: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class validationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class JWTError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}
