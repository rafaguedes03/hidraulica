// Gera backend/src/database/catalog.json a partir do catálogo do frontend.
// O catálogo é mantido em um lugar só: frontend/src/calculo/catalogoBombas.ts
// Rode `npm run sync:catalog` na raiz sempre que editar aquele arquivo e depois `npm run seed` no backend.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origem = path.join(raiz, 'frontend/src/calculo/catalogoBombas.ts');
const destino = path.join(raiz, 'backend/src/database/catalog.json');

// Tira o "import" e transforma a declaração em "return" para executar o arquivo como função.
const codigo = fs.readFileSync(origem, 'utf8')
  .replace(/^import .*$/gm, '')
  .replace(/export const CATALOGO_BOMBAS\s*:\s*ModeloBomba\[\]\s*=/, 'return');

const catalogo = new Function(codigo)();
if (!Array.isArray(catalogo) || catalogo.length === 0) {
  throw new Error('Não foi possível ler CATALOGO_BOMBAS de ' + origem);
}

fs.writeFileSync(destino, JSON.stringify(catalogo, null, 2) + '\n');
console.log(`${catalogo.length} bombas exportadas para ${path.relative(raiz, destino)}`);
