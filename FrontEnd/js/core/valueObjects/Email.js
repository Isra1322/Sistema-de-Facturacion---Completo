import { DomainException } from "../exceptions/DomainException.js";

export class Email {
  constructor(value) {
    if (!value) {
      throw new DomainException("El correo electrónico es obligatorio.");
    }
    const cleanValue = value.trim();
    if (!Email.isValid(cleanValue)) {
      throw new DomainException("El formato del correo electrónico no es válido.");
    }
    this._value = cleanValue;
  }

  get value() {
    return this._value;
  }

  static isValid(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  }
}
