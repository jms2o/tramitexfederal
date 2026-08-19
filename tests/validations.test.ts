import { describe, expect, it } from "vitest";
import { credentialsSchema, passwordResetSchema, registrationSchema } from "../lib/validations/auth";
import { contactSchema } from "../lib/validations/contact";
import { parseQuoteItems } from "../lib/validations/finance";

describe("validaciones críticas", () => {
  it("rechaza una contraseña corta", () => {
    expect(credentialsSchema.safeParse({ email: "admin@example.com", password: "corta" }).success).toBe(false);
  });

  it("valida registro de cliente y normaliza el correo", () => {
    const result = registrationSchema.safeParse({ email: "CLIENTE@EXAMPLE.COM", password: "ClaveSegura1!", confirmPassword: "ClaveSegura1!", turnstileToken: "token-de-prueba" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("cliente@example.com");
  });

  it("rechaza confirmación de contraseña distinta y token de reset débil", () => {
    expect(registrationSchema.safeParse({ email: "cliente@example.com", password: "ClaveSegura1!", confirmPassword: "OtraClave1!", turnstileToken: "token" }).success).toBe(false);
    expect(passwordResetSchema.safeParse({ token: "corto", password: "ClaveSegura1!", confirmPassword: "ClaveSegura1!" }).success).toBe(false);
  });

  it("acepta una solicitud de contacto completa", () => {
    expect(contactSchema.safeParse({ name: "Ana Pérez", phone: "5512345678", email: "ana@example.com", clientType: "INDIVIDUAL", serviceSlug: "placas-federales", state: "Jalisco", message: "Necesito apoyo para iniciar el trámite de placas." }).success).toBe(true);
  });

  it("convierte conceptos de cotización de forma segura", () => {
    expect(parseQuoteItems("Honorarios | 2500.00\nDerechos | 1500")).toEqual([{ concept: "Honorarios", amount: 2500 }, { concept: "Derechos", amount: 1500 }]);
    expect(() => parseQuoteItems("Honorarios sin monto")).toThrow();
  });
});
