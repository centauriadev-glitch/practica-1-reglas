const express = require('express');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const db = new DatabaseSync(process.env.DB_PATH || 'pagos.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS pagos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titular TEXT NOT NULL,
    monto REAL NOT NULL,
    numero_tarjeta TEXT NOT NULL,
    creado_en TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

const app = express();
app.use(express.json());

app.post('/pagos', (req, res) => {
  const { titular, monto, numero_tarjeta } = req.body;

  if (!titular || monto === undefined || !numero_tarjeta) {
    return res.status(400).json({ error: 'titular, monto y numero_tarjeta son obligatorios' });
  }

  try {
    const result = db
      .prepare('INSERT INTO pagos (titular, monto, numero_tarjeta) VALUES (?, ?, ?)')
      .run(titular, monto, numero_tarjeta);

    console.log('Pago registrado:', { id: result.lastInsertRowid, titular, monto, numero_tarjeta });

    res.status(201).json({ id: Number(result.lastInsertRowid), titular, monto, numero_tarjeta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
