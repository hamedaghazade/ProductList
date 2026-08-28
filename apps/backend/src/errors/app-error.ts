export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 400, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'منبع مورد نظر یافت نشد') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'این رکورد از قبل در سامانه وجود دارد') {
    super(message, 409);
  }
}