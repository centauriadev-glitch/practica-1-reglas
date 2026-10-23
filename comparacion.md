# Comparación: sin reglas vs. con reglas

| Aspecto | Rama `sin-reglas` | Rama `con-reglas` |
|---|---|---|
| Vulnerabilidades en SonarCloud | 1 (S5689: Express expone su versión con `X-Powered-By`) · Security rating B | 0 · Security rating A |
| Security Hotspots | 0 | 0 |
| ¿Valida las entradas? | Solo que los campos existan; acepta cualquier tipo, longitud o monto negativo | Sí, esquema zod estricto: tipos, longitudes, rango y decimales del monto, Luhn, sin campos extra, cuerpo ≤ 10 kb |
| ¿Consultas parametrizadas? | Sí | Sí |
| ¿Guarda o registra la tarjeta completa? | Sí: la guarda en SQLite, la escribe en el log y la devuelve en la respuesta | No: solo guarda y muestra los últimos 4 dígitos y la marca |
| ¿Secretos en el código? | No | No; puerto y ruta de la base por variables de entorno (`.env.example`) |
| ¿Mensajes de error genéricos? | No: devuelve `err.message` al cliente | Sí: `Datos inválidos` / `Error interno`; el detalle solo en el log |
| ¿Incluye pruebas de seguridad? | No | Sí, 13 pruebas con `node:test` (todas pasan) |
| Paquetes instalados | `express` | `express`, `zod` (verificados en el registro npm antes de instalar) |

## Conclusiones del equipo

- Sin reglas, el agente cumplió el prompt al pie de la letra: guardó, registró y devolvió el número de tarjeta
  completo, y expuso mensajes de error internos.
- Con reglas, el agente mostró un plan de controles antes de escribir código y lo implementó completo.
- SonarCloud solo detectó una vulnerabilidad menor (`X-Powered-By`) en `sin-reglas`; **no detectó** que la tarjeta
  completa se guarda, se registra y se devuelve. El análisis estático no sustituye la revisión del código ni las pruebas.
- Las consultas parametrizadas aparecieron en ambas ramas, así que esa regla no marcó diferencia en este caso.
- Las pruebas de seguridad existen, pero el workflow de CI solo ejecuta SonarCloud; no corre `npm test`.
