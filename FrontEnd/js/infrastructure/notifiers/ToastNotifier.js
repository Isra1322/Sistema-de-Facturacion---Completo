export class ToastNotifier {
  static show(message, type = "error") {
    if (typeof window.mostrarToast === "function") {
      window.mostrarToast(message, type);
    } else {
      console.log(`[Toast Fallback] [${type.toUpperCase()}]: ${message}`);
    }
  }

  static showUnique(message, type = "error") {
    if (typeof window.mostrarToastUnico === "function") {
      window.mostrarToastUnico(message, type);
    } else {
      this.show(message, type);
    }
  }

  static success(message) {
    this.show(message, "success");
  }

  static error(message) {
    this.show(message, "error");
  }

  static warning(message) {
    this.show(message, "warning");
  }

  static errorUnique(message) {
    this.showUnique(message, "error");
  }

  static warningUnique(message) {
    this.showUnique(message, "warning");
  }
}
