export class ApplicationError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'ApplicationError';
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }
}
