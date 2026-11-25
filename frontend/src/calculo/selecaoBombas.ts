/**
 * SELEÇÃO DE BOMBAS
 *
 * Compara cada bomba do catálogo com a instalação calculada:
 *   1. descarta as que não servem (tipo errado, não alcançam a altura, sucção impossível);
 *   2. dá uma nota às que servem;
 *   3. ordena da mais indicada para a menos indicada.
 */
import { DadosEntrada, ResultadoHidraulico, BombaAvaliada, ModeloBomba, SituacaoBomba } from './tipos';
import { CATALOGO_BOMBAS } from './catalogoBombas';
import { NPSH_REQUERIDO_ADOTADO_MCA } from './calculoHidraulico';

/** Número com uma casa e vírgula, para as mensagens. */
const decimal = (valor: number, casas = 1) => valor.toFixed(casas).replace('.', ',');

/** Bombas que trabalham dentro da água (poço, cisterna), inclusive as solares submersas. */
export function ehBombaSubmersa(bomba: ModeloBomba): boolean {
  return bomba.tipo === 'submersivel' || /submers/i.test(bomba.bocalSuccao || '');
}

/**
 * Altura que a bomba entrega numa certa vazão, pela curva do fabricante:
 *
 *   H(Q) = a·Q² + b·Q + c
 *
 * Q em m³/h, H em mca. Nunca devolve altura negativa.
 */
export function alturaDaBombaNaVazao(bomba: ModeloBomba, vazaoM3h: number): number {
  if (vazaoM3h < 0) return bomba.coeficientesCurva.c;
  const { a, b, c } = bomba.coeficientesCurva;
  const altura = a * Math.pow(vazaoM3h, 2) + b * vazaoM3h + c;
  return Math.max(0, altura);
}

/**
 * Ponto de trabalho: onde a curva da bomba cruza a curva da instalação.
 *
 *   curva da bomba:      H = a·Q² + b·Q + c
 *   curva da instalação: H = altura estática + k·Q^1,852
 *
 * A bomba sempre vai trabalhar nesse ponto, não na vazão pedida.
 * Para achar o cruzamento usamos bisseção: testamos a vazão do meio do
 * intervalo; se a bomba ainda vence a instalação, a vazão real é maior;
 * se não vence, é menor. Repetindo 40 vezes, o erro fica desprezível.
 */
export function encontrarPontoTrabalho(
  bomba: ModeloBomba,
  alturaEstaticaMca: number,
  coeficienteKInstalacao: number
): { vazaoM3h: number; alturaMca: number; rendimentoPct: number } {
  let vazaoMinima = 0;
  let vazaoMaxima = bomba.vazaoMaximaM3h;
  let vazaoTrabalho = 0;
  let alturaTrabalho = 0;

  for (let i = 0; i < 40; i++) {
    const vazaoMeio = (vazaoMinima + vazaoMaxima) / 2;
    const alturaBomba = alturaDaBombaNaVazao(bomba, vazaoMeio);
    const alturaInstalacao = alturaEstaticaMca + coeficienteKInstalacao * Math.pow(vazaoMeio, 1.852);

    if (alturaBomba >= alturaInstalacao) {
      // a bomba ainda tem força nessa vazão: o cruzamento está mais à direita
      vazaoTrabalho = vazaoMeio;
      alturaTrabalho = alturaBomba;
      vazaoMinima = vazaoMeio;
    } else {
      // a instalação pede mais do que a bomba dá: o cruzamento está mais à esquerda
      vazaoMaxima = vazaoMeio;
    }
  }

  // Rendimento estimado no ponto de trabalho. Cai em forma de parábola
  // conforme a vazão se afasta da vazão de melhor eficiência (BEP):
  //   η = η máximo · (1 − 0,75 · desvio²), nunca abaixo de 30% do máximo
  const vazaoBep = bomba.vazaoBepM3h;
  const desvioDoBep = vazaoBep > 0 ? (vazaoTrabalho - vazaoBep) / vazaoBep : 0;
  const fatorRendimento = Math.max(0.3, 1 - 0.75 * Math.pow(desvioDoBep, 2));
  const rendimentoPct = vazaoTrabalho > 0 ? Math.round(bomba.rendimentoMaximoPct * fatorRendimento) : 0;

  return {
    vazaoM3h: Math.round(vazaoTrabalho * 100) / 100,
    alturaMca: Math.round(alturaTrabalho * 100) / 100,
    rendimentoPct
  };
}

/**
 * Avalia todas as bombas do catálogo para a instalação calculada.
 *
 * Nota de cada bomba que serve (começa em 60):
 *   folga de pressão de 5% a 25% .............. +20
 *   folga de 25% a 60% ......................... +10
 *   folga acima de 60% (maior que o necessário)  −10
 *   vazão a menos de 20% do BEP ................ +15
 *   vazão a menos de 40% do BEP ................ +8
 *   vazão abaixo da mínima do modelo ........... −15
 *   motor compatível com a potência calculada .. +5
 *   submersa em poço ........................... +10
 *   autoaspirante com sucção acima de 4 m ...... +10
 */
export function avaliarBombas(
  entradas: DadosEntrada,
  resultado: ResultadoHidraulico,
  catalogo?: ModeloBomba[]
): BombaAvaliada[] {
  const bombas = catalogo && catalogo.length > 0 ? catalogo : CATALOGO_BOMBAS;
  const vazaoPedida = resultado.vazaoM3h;
  const hmtPedida = resultado.hmtMca;
  const alturaEstatica = resultado.alturaEstaticaMca;
  const npshDisponivel = resultado.npshDisponivelMca;

  const avaliadas: BombaAvaliada[] = [];

  for (const bomba of bombas) {
    const alturaNaVazaoPedida = alturaDaBombaNaVazao(bomba, vazaoPedida);
    const pontoTrabalho = encontrarPontoTrabalho(bomba, alturaEstatica, resultado.coeficienteKInstalacao);
    const submersa = ehBombaSubmersa(bomba);
    const autoaspirante = bomba.tipo === 'autoaspirante' || bomba.tipo === 'injetora';

    let nota = 0;
    const motivos: string[] = [];
    const ressalvas: string[] = [];
    let situacao: SituacaoBomba = 'boa';
    let rotulo = 'Atende';

    // --- Etapa 1: motivos para descartar a bomba --------------------------------
    const impedimentos: string[] = [];

    if (vazaoPedida <= 0 || hmtPedida <= 0) {
      impedimentos.push('Informe a vazão e as alturas para avaliar esta bomba.');
    } else {
      // Tipo de instalação: bomba de poço não serve na superfície e vice-versa
      if (entradas.bombaSubmersa && !submersa) {
        impedimentos.push('Bomba de superfície: não serve para trabalhar dentro do poço.');
      }
      if (!entradas.bombaSubmersa && submersa) {
        impedimentos.push('Bomba submersa: só serve se ficar dentro da água (poço ou cisterna).');
      }

      // A bomba precisa entregar a HMT na vazão pedida
      if (alturaNaVazaoPedida < hmtPedida) {
        impedimentos.push(`Altura insuficiente: entrega ${decimal(alturaNaVazaoPedida)} mca na vazão de ${decimal(vazaoPedida)} m³/h (necessário: ${decimal(hmtPedida)} mca).`);
      }
      if (vazaoPedida > bomba.vazaoMaximaM3h) {
        impedimentos.push(`Vazão máxima do modelo (${decimal(bomba.vazaoMaximaM3h)} m³/h) é menor que a vazão pedida.`);
      }

      // Sucção: só vale para bombas de superfície.
      // Autoaspirantes aguentam um pouco mais (adotamos 1,5 mca no lugar de 3).
      if (!entradas.bombaSubmersa && !submersa && npshDisponivel !== null) {
        const npshMinimo = autoaspirante ? 1.5 : NPSH_REQUERIDO_ADOTADO_MCA;
        if (npshDisponivel < npshMinimo) {
          impedimentos.push(`Altura de sucção alta demais para este tipo de bomba (NPSH disponível de ${decimal(npshDisponivel)} mca).`);
        } else if (!autoaspirante && npshDisponivel < NPSH_REQUERIDO_ADOTADO_MCA + 0.5) {
          ressalvas.push('Sucção no limite: confira o NPSH requerido no catálogo do fabricante.');
        }
      }
    }

    if (impedimentos.length > 0) {
      situacao = 'incompativel';
      rotulo = 'Não atende';
      nota = 10;
      motivos.push(...impedimentos);
    } else {
      // --- Etapa 2: nota das bombas que servem ----------------------------------
      nota = 60;

      // Folga de pressão: quanto a bomba entrega acima da HMT pedida
      const folgaPressao = alturaNaVazaoPedida / hmtPedida;
      if (folgaPressao >= 1.05 && folgaPressao <= 1.25) {
        nota += 20;
        motivos.push('Folga de pressão na medida (5% a 25% acima do necessário).');
      } else if (folgaPressao > 1.25 && folgaPressao <= 1.6) {
        nota += 10;
        motivos.push('Pressão com folga considerável.');
      } else if (folgaPressao > 1.6) {
        nota -= 10;
        situacao = 'superdimensionada';
        ressalvas.push(`Bomba maior que o necessário (${decimal(alturaNaVazaoPedida)} mca contra ${decimal(hmtPedida)} mca pedidos): gasta mais energia.`);
      } else {
        ressalvas.push('Atende com pouca folga de pressão (menos de 5%).');
      }

      // Distância até o ponto de melhor eficiência (BEP)
      const distanciaBep = bomba.vazaoBepM3h > 0
        ? Math.abs(vazaoPedida - bomba.vazaoBepM3h) / bomba.vazaoBepM3h
        : 1;
      if (distanciaBep < 0.2) {
        nota += 15;
        motivos.push('Trabalha perto do ponto de melhor rendimento.');
      } else if (distanciaBep < 0.4) {
        nota += 8;
      }

      // Vazão mínima recomendada pelo fabricante
      if (bomba.vazaoMinimaM3h > 0 && vazaoPedida < bomba.vazaoMinimaM3h) {
        nota -= 15;
        ressalvas.push(`Vazão pedida abaixo da mínima recomendada para o modelo (${decimal(bomba.vazaoMinimaM3h)} m³/h).`);
      }

      // Potência do motor da bomba comparada com a calculada
      if (bomba.potenciaCv >= resultado.potenciaEixoCv && bomba.potenciaCv <= resultado.potenciaMotorNecessariaCv * 1.5) {
        nota += 5;
        motivos.push(`Motor de ${String(bomba.potenciaCv).replace('.', ',')} cv compatível com a potência calculada.`);
      } else if (bomba.potenciaCv < resultado.potenciaEixoCv) {
        ressalvas.push('Motor menor que a potência estimada no eixo: confirme a curva de potência no catálogo.');
      }

      // Tipo de bomba adequado à aplicação
      if (entradas.bombaSubmersa && submersa) {
        nota += 10;
        motivos.push('Modelo submerso, próprio para poço ou cisterna.');
      } else if (!entradas.bombaSubmersa && entradas.alturaSuccaoM > 4 && autoaspirante) {
        nota += 10;
        motivos.push('Autoaspirante: lida melhor com sucção alta.');
      }
      if (bomba.tipo === 'solar') {
        motivos.push('Funciona com painel solar, sem conta de luz.');
      }

      nota = Math.min(100, Math.max(0, nota));

      // Selo exibido no cartão da bomba
      if (situacao === 'superdimensionada') {
        rotulo = 'Maior que o necessário';
      } else if (nota >= 85) {
        situacao = 'ideal';
        rotulo = 'Melhor opção';
      } else if (nota >= 70) {
        situacao = 'boa';
        rotulo = 'Boa opção';
      } else {
        situacao = 'limite';
        rotulo = 'Atende no limite';
      }
    }

    avaliadas.push({
      bomba,
      pontoTrabalho,
      nota: Math.min(100, Math.max(0, nota)),
      situacao,
      rotulo,
      motivos,
      ressalvas
    });
  }

  // Maior nota primeiro; no empate, o motor menor (mais barato de comprar e de manter).
  return avaliadas.sort((a, b) => b.nota - a.nota || a.bomba.potenciaCv - b.bomba.potenciaCv);
}
