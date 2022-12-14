export class CustomError {
  constructor(public status: number, public message: string) {}
}

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(404, message);
  }
}

export class BadRequestError extends CustomError {
  constructor(message: string) {
    super(400, message);
  }
}
