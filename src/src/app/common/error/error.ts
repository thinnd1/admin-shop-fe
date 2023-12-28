
abstract class RuntimeError implements Error {

  name: string;
  message: string;
  stack?: string;

  constructor(message?: string, name?: string) {
    this.message = message ? message : '';
    this.name = name ? name : '';
  }
}

/**
 * IllegalArgumentError.
 */
export class IllegalArgumentError extends RuntimeError {
}
