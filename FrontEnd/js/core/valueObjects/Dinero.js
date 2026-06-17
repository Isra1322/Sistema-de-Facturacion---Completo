import { DomainException } from "../exceptions/DomainException.js";

export class Dinero {
  constructor(value) {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      throw new DomainException("El monto de dinero no puede ser negativo ni inválido.");
    }
    this._value = Math.round(num * 100) / 100;
  }

  get value() {
    return this._value;
  }

  toString() {
    return this._value.toFixed(2);
  }

  static round(val) {
    return Math.round(val * 100) / 100;
  }
}
