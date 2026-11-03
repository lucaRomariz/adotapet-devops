import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

// Banco isolado; o teste não toca os dados de desenvolvimento.
test('HTTP integra interface, saúde, validação e persistência SQLite', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'adotapet-test-'));
  let child;
  async function start() {
    child = spawn(process.execPath, ['src/server.js'], {
      env: { ...process.env, PORT: '0', DATABASE_DIR: directory },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let output = '';
    let errors = '';
    child.stderr.on('data', chunk => { errors += chunk; });
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { child.kill(); reject(new Error(`Servidor não iniciou: ${errors}`)); }, 10000);
      child.once('error', error => { clearTimeout(timeout); reject(error); });
      child.once('exit', code => { clearTimeout(timeout); reject(new Error(`Servidor encerrou (${code}): ${errors}`)); });
      child.stdout.on('data', chunk => {
        output += chunk;
        const match = output.match(/http:\/\/localhost:(\d+)/);
        if (match) { clearTimeout(timeout); resolve(`http://127.0.0.1:${match[1]}`); }
      });
    });
  }
  async function stop() {
    if (child && child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit');
      child.kill('SIGTERM');
      await exited;
    }
  }
  try {
    let base = await start();
    assert.equal((await fetch(`${base}/health`)).status, 200);
    assert.match(await (await fetch(base)).text(), /AdotaPet/);
    const invalid = await fetch(`${base}/api/animals`, {method:'POST',body:'{'});
    assert.equal(invalid.status, 400);
    const response = await fetch(`${base}/api/animals`, {
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name:'Teste HTTP',species:'Gato',age:2,city:'Brasília',description:'Animal criado pelo teste de integração.'})
    });
    assert.equal(response.status, 201);
    const animal = await response.json();
    await stop();
    base = await start();
    const animals = await (await fetch(`${base}/api/animals`)).json();
    assert.ok(animals.some(item => item.id === animal.id && item.name === animal.name));
    assert.equal((await fetch(`${base}/inexistente`)).status, 404);
  } finally {
    await stop();
    await rm(directory, {recursive:true,force:true});
  }
});
