const { test, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { crearApp } = require('../server');

const TARJETA = '4111111111111111';
let servidor;
let db;
let base;
let logs;
const originales = {};

before(async () => {
  const creado = crearApp(':memory:');
  db = creado.db;
  await new Promise((resolve) => {
    servidor = creado.app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${servidor.address().port}`;
});

after(() => {
  servidor.close();
  db.close();
});

// Captura todo lo que la app escribe en consola para revisar que no se filtre la tarjeta.
beforeEach(() => {
  logs = [];
  for (const nivel of ['log', 'warn', 'error', 'info']) {
    originales[nivel] = console[nivel];
    console[nivel] = (...args) => logs.push(args.map((a) => JSON.stringify(a)).join(' '));
  }
});

afterEach(() => {
  Object.assign(console, originales);
});

function enviar(cuerpo, contentType = 'application/json') {
  return fetch(`${base}/pagos`, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo),
  });
}

const pagoValido = { titular: 'Ana Pérez', monto: 150.5, numero_tarjeta: TARJETA };

test('un pago válido responde 201 y solo muestra los últimos 4 dígitos', async () => {
  const res = await enviar(pagoValido);
  const texto = await res.text();
  assert.equal(res.status, 201);
  assert.ok(!texto.includes(TARJETA));
  assert.equal(JSON.parse(texto).tarjeta, '**** **** **** 1111');
});

test('la base de datos no guarda el número completo', async () => {
  await enviar(pagoValido);
  const filas = db.prepare('SELECT * FROM pagos').all();
  assert.ok(filas.length > 0);
  assert.ok(!JSON.stringify(filas).includes(TARJETA));
  assert.ok(filas.every((f) => f.ultimos4 === '1111'));
});

test('los logs no contienen el número completo', async () => {
  await enviar(pagoValido);
  await enviar({ ...pagoValido, monto: -1 });
  assert.ok(logs.length > 0);
  assert.ok(logs.every((l) => !l.includes(TARJETA)));
});

test('rechaza tarjeta que no pasa Luhn', async () => {
  const res = await enviar({ ...pagoValido, numero_tarjeta: '4111111111111112' });
  assert.equal(res.status, 400);
});

test('rechaza montos fuera de rango o con más de 2 decimales', async () => {
  for (const monto of [-5, 0, 2_000_000, 10.123, '100']) {
    const res = await enviar({ ...pagoValido, monto });
    assert.equal(res.status, 400, `monto ${monto}`);
  }
});

test('rechaza titular vacío, muy largo o con caracteres no permitidos', async () => {
  for (const titular of ['', 'A', 'x'.repeat(101), '<script>alert(1)</script>']) {
    const res = await enviar({ ...pagoValido, titular });
    assert.equal(res.status, 400, `titular ${titular}`);
  }
});

test('rechaza campos extra y campos faltantes', async () => {
  assert.equal((await enviar({ ...pagoValido, admin: true })).status, 400);
  assert.equal((await enviar({ titular: 'Ana Pérez' })).status, 400);
});

test('un intento de inyección SQL no altera la tabla', async () => {
  const antes = db.prepare('SELECT COUNT(*) AS n FROM pagos').get().n;
  const res = await enviar({ ...pagoValido, titular: "Ana'); DROP TABLE pagos;--" });
  assert.equal(res.status, 400);
  const despues = db.prepare('SELECT COUNT(*) AS n FROM pagos').get().n;
  assert.equal(despues, antes);
});

test('las comillas en datos válidos se guardan como texto, no como SQL', async () => {
  const titular = "O'Brien' OR 'a' --";
  const res = await enviar({ ...pagoValido, titular });
  assert.equal(res.status, 201);
  const { id } = await res.json();
  const fila = db.prepare('SELECT titular FROM pagos WHERE id = ?').get(id);
  assert.equal(fila.titular, titular);
});

test('JSON malformado devuelve un error genérico sin detalles internos', async () => {
  const res = await enviar('{"titular": ', 'application/json');
  const cuerpo = await res.json();
  assert.equal(res.status, 400);
  assert.deepEqual(cuerpo, { error: 'Datos inválidos' });
});

test('una solicitud demasiado grande se rechaza', async () => {
  const res = await enviar({ ...pagoValido, titular: 'a'.repeat(20_000) });
  assert.equal(res.status, 413);
});

test('los errores de validación no revelan qué falló', async () => {
  const res = await enviar({ ...pagoValido, numero_tarjeta: 'abc' });
  assert.deepEqual(await res.json(), { error: 'Datos inválidos' });
});

test('no expone la cabecera X-Powered-By', async () => {
  const res = await enviar(pagoValido);
  assert.equal(res.headers.get('x-powered-by'), null);
});
