import { Email } from "../valueObjects/Email.js";
import { DomainException } from "../exceptions/DomainException.js";

export class Cliente {
  constructor({ idCliente = 0, nombre, apellido, direccion, telefono, correo, estado = "Activo" }) {
    this.idCliente = idCliente;
    this.nombre = this._normalizeName(nombre, "El nombre");
    this.apellido = this._normalizeName(apellido, "El apellido");
    this.estado = estado;
    
    if (!direccion || !direccion.trim()) {
      throw new DomainException("La dirección es obligatoria.");
    }
    this.direccion = direccion.trim();

    if (!telefono || !/^09\d{8}$/.test(telefono.trim())) {
      throw new DomainException("El teléfono debe iniciar con 09 y tener exactamente 10 dígitos.");
    }
    this.telefono = telefono.trim();

    this.correo = new Email(correo).value;
  }

  _normalizeName(val, fieldName) {
    if (!val || !val.trim()) {
      throw new DomainException(`${fieldName} es obligatorio.`);
    }
    const clean = val
      .replace(/[^A-Za-z\u00c1\u00c9\u00cd\u00d3\u00da\u00e1\u00e9\u00ed\u00f3\u00fa\u00d1\u00f1\s]/g, "")
      .replace(/\s+/g, "")
      .slice(0, 20);

    if (!clean) {
      throw new DomainException(`${fieldName} no es válido.`);
    }

    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
}
