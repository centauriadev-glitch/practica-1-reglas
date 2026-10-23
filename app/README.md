# API de pagos

Endpoint `POST /pagos` en Express que guarda pagos en SQLite.

## Requisitos

- Node.js 22.5 o superior (usa el módulo integrado `node:sqlite`)

## Ejecutar

```bash
cd app
npm install
npm start
```

Configuración por variables de entorno (ver `.env.example`):

| Variable | Por defecto | Uso |
|---|---|---|
| `PORT` | `3000` | Puerto del servidor |
| `DB_PATH` | `pagos.db` | Archivo de la base SQLite |

## Ejemplo

```bash
curl -X POST http://localhost:3000/pagos \
  -H "Content-Type: application/json" \
  -d '{"titular": "Ana Pérez", "monto": 150.5, "numero_tarjeta": "4111111111111111"}'
```

Respuesta:

```json
{ "id": 1, "titular": "Ana Pérez", "monto": 150.5, "tarjeta": "**** **** **** 1111", "marca": "visa" }
```

## Controles de seguridad

- **Validación con esquema (zod):** `titular` de 2 a 100 letras; `monto` positivo, máximo 1 000 000 y 2 decimales;
  `numero_tarjeta` de 13 a 19 dígitos que pase Luhn. Se rechazan campos extra y cuerpos mayores a 10 kb.
- **Consultas parametrizadas** en todas las operaciones SQL.
- **La tarjeta nunca se guarda ni se registra completa:** solo los últimos 4 dígitos y la marca.
- **Errores genéricos** al cliente (`Datos inválidos`, `Error interno`); el detalle queda en el log del servidor.
- **Sin secretos en el código:** la configuración se lee de variables de entorno.

## Pruebas

```bash
npm test
```

Cubren cada control: enmascarado en respuesta, base de datos y logs; validación de cada campo; inyección SQL;
JSON malformado; tamaño máximo; mensajes genéricos y cabecera `X-Powered-By`.
