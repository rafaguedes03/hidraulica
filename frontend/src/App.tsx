/**
 * APLICATIVO PRINCIPAL
 * Guarda os dados digitados, roda o cálculo a cada mudança e alterna entre
 * o formulário e o resultado. Tudo fica salvo no aparelho (localStorage),
 * então o app reabre com os últimos dados mesmo sem internet.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { DadosEntrada } from './calculo/tipos';
import { calcularHidraulica, ALTITUDE_PADRAO_M, TARIFA_PADRAO_BRL_KWH } from './calculo/calculoHidraulico';
import { avaliarBombas } from './calculo/selecaoBombas';
import { CONEXOES_TIPICAS_RECALQUE, CONEXOES_TIPICAS_SUCCAO } from './calculo/materiaisEConexoes';
import { EstadoCatalogo, buscarCatalogoServidor, carregarCatalogoGuardado } from './calculo/fonteCatalogo';
import { Header } from './components/Header';
import { SimpleForm, DESTINOS } from './components/SimpleForm';
import { TechnicalForm } from './components/TechnicalForm';
import { ResultsPanel } from './components/ResultsPanel';
import { ReportModal } from './components/ReportModal';
import { CatalogExplorer } from './components/CatalogExplorer';
import { Segmented } from './components/ui/Field';
import { Modal } from './components/ui/Modal';

type Modo = 'simples' | 'tecnico';
type Tema = 'claro' | 'escuro';
type Tela = 'formulario' | 'resultado';

// Chaves do que fica guardado no aparelho (localStorage).
// v4: os campos passaram a ter nomes em português.
const CHAVE_ENTRADAS = 'hidrocalc_entradas_v4';
const CHAVE_MODO = 'hidrocalc_modo';
const CHAVE_TEMA = 'hidrocalc_tema';

/** Formulário em branco (com os padrões de diâmetro, material e rendimentos). */
const ENTRADAS_VAZIAS: DadosEntrada = {
  destino: 'reservatorio',
  vazaoM3h: 0,
  horasPorDia: 0,
  pressaoResidualMca: 0,
  alturaSuccaoM: 0,
  comprimentoSuccaoM: 0,
  diametroSuccaoMm: 27.8, // 1" (32 mm)
  materialSuccao: 'pvc',
  conexoesSuccao: [],
  bombaSubmersa: false,
  alturaRecalqueM: 0,
  comprimentoRecalqueM: 0,
  diametroRecalqueMm: 21.6, // 3/4" (25 mm)
  materialRecalque: 'pvc',
  conexoesRecalque: [],
  rendimentoBombaPct: 60,
  rendimentoMotorPct: 85,
  usarConexoesTipicas: true,
  altitudeM: ALTITUDE_PADRAO_M,
  tarifaEnergiaBrlKwh: TARIFA_PADRAO_BRL_KWH
};

/** Lê um valor guardado no aparelho; se não houver (ou der erro), devolve o padrão. */
function ler<T>(chave: string, padrao: T): T {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : padrao;
  } catch {
    return padrao;
  }
}

/** Guarda um valor no aparelho. */
function gravar(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // armazenamento cheio ou bloqueado: o app continua funcionando sem guardar
  }
}

export const App: React.FC = () => {
  const [modo, setModo] = useState<Modo>(() => (ler<Modo>(CHAVE_MODO, 'simples') === 'tecnico' ? 'tecnico' : 'simples'));
  const [tela, setTela] = useState<Tela>('formulario');
  const [tema, setTema] = useState<Tema>(() => (ler<Tema>(CHAVE_TEMA, 'claro') === 'escuro' ? 'escuro' : 'claro'));
  const [entradas, setEntradas] = useState<DadosEntrada>(() => ({ ...ENTRADAS_VAZIAS, ...ler<Partial<DadosEntrada>>(CHAVE_ENTRADAS, {}) }));
  const [catalogo, setCatalogo] = useState<EstadoCatalogo>(() => carregarCatalogoGuardado());
  const [relatorioAberto, setRelatorioAberto] = useState(false);
  const [catalogoAberto, setCatalogoAberto] = useState(false);
  const [prontoOffline, setProntoOffline] = useState(false);
  const [confirmarLimpeza, setConfirmarLimpeza] = useState(false);

  useEffect(() => {
    gravar(CHAVE_TEMA, tema);
    // A classe 'dark' no <html> liga as cores do tema escuro (ver index.css).
    document.documentElement.classList.toggle('dark', tema === 'escuro');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'escuro' ? '#16201a' : '#ffffff');
  }, [tema]);

  useEffect(() => gravar(CHAVE_ENTRADAS, entradas), [entradas]);
  useEffect(() => gravar(CHAVE_MODO, modo), [modo]);

  // Com internet, busca o catálogo mais novo; sem internet, segue com o que já está no aparelho.
  useEffect(() => {
    let ativo = true;
    const atualizar = () => buscarCatalogoServidor().then(remoto => {
      if (ativo && remoto) setCatalogo(remoto);
    });
    atualizar();
    window.addEventListener('online', atualizar);
    return () => {
      ativo = false;
      window.removeEventListener('online', atualizar);
    };
  }, []);

  // Aviso único de que o app já pode ser usado sem internet.
  useEffect(() => {
    const aoFicarPronto = () => {
      setProntoOffline(true);
      window.setTimeout(() => setProntoOffline(false), 6000);
    };
    window.addEventListener('hidrocalc:offline-ready', aoFicarPronto);
    return () => window.removeEventListener('hidrocalc:offline-ready', aoFicarPronto);
  }, []);

  // O botão "voltar" do celular sai dos resultados para o formulário, em vez de fechar o app.
  useEffect(() => {
    const aoVoltar = () => setTela('formulario');
    window.addEventListener('popstate', aoVoltar);
    return () => window.removeEventListener('popstate', aoVoltar);
  }, []);

  // O cálculo roda de novo sempre que um campo muda (é rápido e não precisa de internet).
  const resultados = useMemo(() => calcularHidraulica(entradas), [entradas]);
  const bombasAvaliadas = useMemo(() => avaliarBombas(entradas, resultados, catalogo.bombas), [entradas, resultados, catalogo.bombas]);

  const trocarModo = (proximo: Modo) => {
    if (proximo === modo) return;
    if (proximo === 'tecnico') {
      // Leva para o modo técnico as conexões típicas que o modo simples vinha considerando.
      setEntradas(anterior => ({
        ...anterior,
        usarConexoesTipicas: false,
        conexoesSuccao: anterior.conexoesSuccao.length > 0 ? anterior.conexoesSuccao : CONEXOES_TIPICAS_SUCCAO,
        conexoesRecalque: anterior.conexoesRecalque.length > 0 ? anterior.conexoesRecalque : CONEXOES_TIPICAS_RECALQUE
      }));
    } else {
      setEntradas(anterior => {
        // Volta a usar a pressão residual do destino escolhido no modo simples.
        const destino = DESTINOS.find(d => d.valor === anterior.destino) ?? DESTINOS[0];
        return { ...anterior, usarConexoesTipicas: true, destino: destino.valor, pressaoResidualMca: destino.pressaoResidual };
      });
    }
    setModo(proximo);
  };

  const voltarAoFormulario = () => {
    if (tela === 'resultado' && window.history.state?.hidrocalc === 'resultado') {
      window.history.back();
    } else {
      setTela('formulario');
    }
  };

  const calcular = () => {
    // Cria um passo no histórico para o botão voltar do celular funcionar.
    window.history.pushState({ hidrocalc: 'resultado' }, '');
    setTela('resultado');
    window.scrollTo({ top: 0 });
  };

  const limpar = () => {
    setEntradas({ ...ENTRADAS_VAZIAS, usarConexoesTipicas: modo === 'simples' });
    setConfirmarLimpeza(false);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        tema={tema}
        aoTrocarTema={() => setTema(atual => (atual === 'escuro' ? 'claro' : 'escuro'))}
        aoAbrirCatalogo={() => setCatalogoAberto(true)}
        aoIrParaInicio={voltarAoFormulario}
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-5 sm:pt-8">
        {tela === 'formulario' ? (
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">
                Qual bomba eu preciso?
              </h1>
              <p className="mt-1 max-w-prose text-[15px] text-muted">
                Informe a água, as alturas e a tubulação. O cálculo roda no aparelho, mesmo sem internet.
              </p>
            </div>

            <Segmented<Modo>
              rotulo="Modo de preenchimento"
              ocultarRotulo
              valor={modo}
              aoAlterar={trocarModo}
              opcoes={[
                { valor: 'simples', rotulo: 'Simples' },
                { valor: 'tecnico', rotulo: 'Técnico' }
              ]}
            />

            {modo === 'simples' ? (
              <SimpleForm entradas={entradas} aoAlterar={setEntradas} aoCalcular={calcular} aoLimpar={() => setConfirmarLimpeza(true)} />
            ) : (
              <TechnicalForm entradas={entradas} resultados={resultados} aoAlterar={setEntradas} aoCalcular={calcular} aoLimpar={() => setConfirmarLimpeza(true)} />
            )}
          </div>
        ) : (
          <div className="pb-6">
            <ResultsPanel
              entradas={entradas}
              resultados={resultados}
              bombasAvaliadas={bombasAvaliadas}
              aoAbrirRelatorio={() => setRelatorioAberto(true)}
              aoVoltar={voltarAoFormulario}
            />
          </div>
        )}
      </main>

      <footer className="no-print mx-auto w-full max-w-3xl px-4 py-5 text-sm text-muted">
        <p>
          HidroCalc, projeto do IFNMG. Estimativa para apoiar a escolha da bomba; não substitui o projeto de um profissional habilitado.
        </p>
      </footer>

      {prontoOffline && (
        <div role="status" className="no-print fixed inset-x-4 bottom-24 z-40 mx-auto max-w-sm rounded-xl bg-ink px-4 py-3 text-center text-[15px] font-medium text-page shadow-lg">
          Pronto: o app já funciona sem internet.
        </div>
      )}

      <Modal
        aberto={confirmarLimpeza}
        aoFechar={() => setConfirmarLimpeza(false)}
        titulo="Apagar os dados preenchidos?"
        descricao="Os campos voltam a ficar em branco."
        rodape={
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirmarLimpeza(false)} className="btn btn-secondary flex-1">Manter</button>
            <button type="button" onClick={limpar} className="btn btn-primary flex-1">Apagar</button>
          </div>
        }
      >
        <p className="text-[15px] text-muted">O catálogo de bombas e o tema escolhido não mudam.</p>
      </Modal>

      <ReportModal
        aberto={relatorioAberto}
        aoFechar={() => setRelatorioAberto(false)}
        entradas={entradas}
        resultados={resultados}
        bombasAvaliadas={bombasAvaliadas}
      />
      <CatalogExplorer aberto={catalogoAberto} aoFechar={() => setCatalogoAberto(false)} catalogo={catalogo} />
    </div>
  );
};

export default App;
