const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const { esquemaPago, marcaTarjeta } = require('./validacion');

function crearApp(dbPath) {
  const db = new DatabaseSync(dbPath);

  // Solo se guardan los últimos 4 dígitos y la marca; nunca el número completo.
  db.exec(`
    CREATE TABLE IF NOT EXISTS pagos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titular TEXT NOT NULL,
      monto REAL NOT NULL,
      ultimos4 TEXT NOT NULL,
      marca TEXT NOT NULL,
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const insertarPago = db.prepare(
    'INSERT INTO pagos (titular, monto, ultimos4, marca) VALUES (?, ?, ?, ?)'
  );

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));

  app.post('/pagos', (req, res) => {
    const resultado = esquemaPago.safeParse(req.body);
    if (!resultado.success) {
      // Se registran solo las rutas de los campos inválidos, no sus valores.
      console.warn('Validación fallida en campos:', resultado.error.issues.map((i) => i.path.join('.')));
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    const { titular, monto, numero_tarjeta } = resultado.data;
    const ultimos4 = numero_tarjeta.slice(-4);
    const marca = marcaTarjeta(numero_tarjeta);

    const { lastInsertRowid } = insertarPago.run(titular, monto, ultimos4, marca);
    const id = Number(lastInsertRowid);

    console.log('Pago registrado:', { id, monto, tarjeta: `**** ${ultimos4}` });

    res.status(201).json({ id, titular, monto, tarjeta: `**** **** **** ${ultimos4}`, marca });
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'No encontrado' });
  });

  // Manejador final: detalle solo en el servidor, mensaje genérico al cliente.
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Datos inválidos' });
    }
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Solicitud demasiado grande' });
    }
    console.error('Error interno:', err.message);
    res.status(500).json({ error: 'Error interno' });
  });

  return { app, db };
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  const { app } = crearApp(process.env.DB_PATH || 'pagos.db');
  app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });
}

module.exports = { crearApp };
