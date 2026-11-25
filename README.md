# HidroCalc

Aplicativo web instalável (PWA) que ajuda produtores rurais e técnicos a escolher a bomba d'água certa. A pessoa informa a vazão, as alturas e a tubulação; o app calcula a altura manométrica, a potência do motor e lista as bombas do catálogo que atendem. O cálculo roda no aparelho e funciona sem internet.

## O que o app faz

- **Modo simples**: três blocos (água, alturas, tubulação), com conexões típicas já consideradas e escolha entre bomba de superfície e bomba submersa de poço.
- **Modo técnico**: sucção e recalque separados, conexões peça a peça, rendimentos, altitude e tarifa de energia.
- **Resultado**: potência do motor com folga de segurança, composição da altura manométrica, avisos de sucção e de velocidade, bombas compatíveis com a curva H × Q e o ponto de trabalho.
- **Memorial de cálculo em PDF** para guardar ou levar à revenda.
- **Catálogo** com busca por marca, modelo e tipo.

## Como rodar

Requisitos: Node.js 20 ou mais novo. MySQL é opcional.

```bash
# Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev

# Testes do motor de cálculo
npm test

# Versão de produção (gera frontend/dist com o service worker)
npm run build
npm run preview
```

O modo offline só existe na versão de produção (`npm run build`). Em desenvolvimento o service worker fica desligado para não servir arquivos antigos.

### Hospedar em uma porta só (app + API)

```bash
npm run setup     # só na primeira vez: instala frontend e backend
npm start         # gera frontend/dist e sobe tudo em http://localhost:3001
```

O backend entrega o app pronto e a API no mesmo endereço. Não precisa de MySQL: sem banco, o catálogo vem de `catalog.json`. No Windows, dá para usar o `iniciar.bat` com dois cliques.

Para alguém de fora da sua rede acessar, use um túnel HTTPS (o modo offline e a instalação só funcionam em HTTPS):

```bash
cloudflared tunnel --url http://localhost:3001
```

### Backend com MySQL (opcional)

```bash
cd backend
npm install
cp .env.example .env        # ajuste usuário e senha do MySQL
mysql -u root -p < src/database/schema.sql
npm run seed                # grava o catálogo no banco
npm run dev                 # http://localhost:3001
```

Se o banco já existia de uma versão anterior, rode antes `src/database/migracao_001.sql`.

| Rota | O que faz |
| --- | --- |
| `GET /api/bombas` | Catálogo no formato usado pelo app: `{ origem, bombas }`. Sem MySQL, responde com `catalog.json`. |
| `POST /api/bombas` | Cadastra ou atualiza uma bomba. Exige o cabeçalho `x-admin-token` igual ao `ADMIN_TOKEN` do `.env`. |
| `POST /api/projetos` | Guarda um dimensionamento. |
| `GET /api/health` | Situação da API e do banco. |

## Como o catálogo funciona offline

1. O app já vem com o catálogo embutido (`frontend/src/calculo/catalogoBombas.ts`).
2. Com internet, ele busca `GET /api/bombas` e guarda a resposta no aparelho.
3. Sem internet, usa a última versão guardada; se nunca houve, usa a embutida.

O catálogo é editado em um lugar só, `catalogoBombas.ts`. Depois de editar:

```bash
npm run sync:catalog          # na raiz: gera backend/src/database/catalog.json
cd backend && npm run seed    # atualiza o MySQL
```

**As curvas e os dados das bombas são aproximados e ainda não foram conferidos com os catálogos dos fabricantes.** Confira antes de usar o app para uma compra real.

## Método de cálculo

- Perda de carga contínua por Hazen-Williams: `J = 10,643 · Q^1,852 / (C^1,852 · D^4,87)`.
- Perdas localizadas por comprimento equivalente (tabela para PVC, NBR 5626).
- `HMT = desnível + perdas + pressão residual`.
- Potência hidráulica `= Q · HMT / 270` (cv, com Q em m³/h). Potência no eixo `= hidráulica / rendimento da bomba`.
- Motor comercial: potência no eixo mais folga (50% até 2 cv, 30% até 5 cv, 20% até 10 cv, 15% até 20 cv, 10% acima), arredondada para o motor comercial seguinte.
- Energia: potência no eixo dividida pelo rendimento do motor, vezes as horas de uso.
- Sucção: `NPSH disponível = pressão atmosférica (pela altitude) − pressão de vapor − altura de sucção − perdas na sucção`. Como o catálogo não traz o NPSH requerido de cada bomba, adota-se 3 mca para centrífugas comuns.
- Ponto de trabalho: cruzamento da curva da bomba `H = aQ² + bQ + c` com a curva da instalação `H = H estático + k·Q^1,852`.

Limitações conhecidas: Hazen-Williams é menos preciso em canos finos (abaixo de 50 mm); os diâmetros internos são os de PVC soldável e são usados também para os outros materiais; não há sucção afogada (bomba abaixo do nível da água).

## Estrutura

```
frontend/src/
  calculo/
    tipos.ts                formato dos dados (entrada, resultado, bomba)
    calculoHidraulico.ts    perdas de carga, HMT, NPSH, potências, energia
    selecaoBombas.ts        curva da bomba, ponto de trabalho e ranking
    materiaisEConexoes.ts   coeficiente C, diâmetros e comprimentos equivalentes
    catalogoBombas.ts       as 45 bombas
    fonteCatalogo.ts        catálogo embutido, guardado no aparelho ou da API
    calculo.test.ts         testes automáticos das fórmulas
  components/      telas; components/ui tem os campos, a janela e os avisos
  lib/formatacao.ts  números no padrão brasileiro
  index.css        cores e componentes (Tailwind v4)
backend/src/
  server.js, controllers/, database/ (schema.sql, seed.js, catalog.json)
scripts/export-catalog.mjs
```

## Referências

- NBR 5626: instalação predial de água fria.
- Porto, R. M. *Hidráulica Básica*. EESC-USP.
- Macintyre, A. J. *Bombas e Instalações de Bombeamento*. LTC.
- Azevedo Netto, J. M. *Manual de Hidráulica*. Blucher.
