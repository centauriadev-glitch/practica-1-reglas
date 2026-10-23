const { z } = require('zod');

function pasaLuhn(numero) {
  let suma = 0;
  let duplicar = false;
  for (let i = numero.length - 1; i >= 0; i--) {
    let digito = Number(numero[i]);
    if (duplicar) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    suma += digito;
    duplicar = !duplicar;
  }
  return suma % 10 === 0;
}

function tieneMaxDosDecimales(valor) {
  const centavos = valor * 100;
  return Math.abs(centavos - Math.round(centavos)) < 1e-9;
}

const esquemaPago = z
  .object({
    titular: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .regex(/^[\p{L}\p{M}' .-]+$/u),
    monto: z.number().positive().max(1_000_000).refine(tieneMaxDosDecimales),
    numero_tarjeta: z
      .string()
      .regex(/^\d{13,19}$/)
      .refine(pasaLuhn),
  })
  .strict();

function marcaTarjeta(numero) {
  if (/^4/.test(numero)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(numero)) return 'mastercard';
  if (/^3[47]/.test(numero)) return 'amex';
  return 'otra';
}

module.exports = { esquemaPago, marcaTarjeta, pasaLuhn };
