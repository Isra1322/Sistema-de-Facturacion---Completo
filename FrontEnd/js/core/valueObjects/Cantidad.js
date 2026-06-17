import { DomainException } from "../exceptions/DomainException.js";

export class Cantidad {
  constructor(value) {
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
      throw new DomainException("La cantidad debe ser un número entero mayor a 0.");
    }
    this._value = num;
  }

  get value() {
    return this._value;
  }
}
