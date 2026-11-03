import assert from 'node:assert/strict';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const health = await fetch(`${base}/health`);
assert.equal(health.status, 200);
assert.equal((await health.json()).status, 'ok');
assert.equal((await fetch(base)).status, 200);
const response = await fetch(`${base}/api/animals`);
assert.equal(response.status, 200);
assert.ok(Array.isArray(await response.json()));
console.log('Smoke aprovado: saúde, interface e API/banco.');
