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

El servidor queda en `http://localhost:3000` y crea `pagos.db` en la carpeta actual.

## Ejemplo

```bash
curl -X POST http://localhost:3000/pagos \
  -H "Content-Type: application/json" \
  -d '{"titular": "Ana Pérez", "monto": 150.5, "numero_tarjeta": "4111111111111111"}'
```

Respuesta:

```json
{ "id": 1, "titular": "Ana Pérez", "monto": 150.5, "numero_tarjeta": "4111111111111111" }
```
