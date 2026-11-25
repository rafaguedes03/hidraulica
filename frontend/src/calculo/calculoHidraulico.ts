/**
 * CÁLCULO HIDRÁULICO
 *
 * Recebe os dados da instalação (vazão, alturas, canos e conexões) e devolve
 * tudo o que o app mostra: perdas de carga, altura manométrica total (HMT),
 * NPSH disponível, potências, consumo de energia e a curva da instalação.
 *
 * Unidades:
 *   vazão (Q) ........... m³/h; vira m³/s só dentro das fórmulas
 *   alturas e perdas .... mca (metros de coluna d'água)
 *   diâmetros ........... mm; viram metros dentro das fórmulas
 *   potência ............ cv (1 cv = 0,7355 kW)
 *
 * Referências: Porto (2006), Hidráulica Básica; Macintyre (2013), Bombas e
 * Instalações de Bombeamento; Azevedo Netto, Manual de Hidráulica.
 */
import {
  DadosEntrada,
  ResultadoHidraulico,
  Aviso,
  ItemConexao,
  SituacaoVelocidade
} from './tipos';
import {
  MATERIAIS_TUBO,
  CONEXOES,
  CONEXOES_TIPICAS_SUCCAO,
  CONEXOES_TIPICAS_RECALQUE,
  diametroNominalMaisProximo
} from './materiaisEConexoes';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Potências de motor vendidas no mercado (cv). */
export const POTENCIAS_COMERCIAIS_CV = [
  0.25, 0.33, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 6.0, 7.5, 10.0, 12.5, 15.0, 20.0, 25.0, 30.0, 40.0, 50.0
];

/** Usada quando a pessoa não informa a altitude (média do norte de Minas). */
export const ALTITUDE_PADRAO_M = 500;
/** Tarifa rural aproximada, usada quando a pessoa não informa a da conta de luz. */
export const TARIFA_PADRAO_BRL_KWH = 0.85;
/** Pressão de vapor da água a cerca de 25 °C, em mca. */
export const PRESSAO_VAPOR_MCA = 0.32;
/**
 * NPSH requerido adotado para bombas centrífugas pequenas.
 * O catálogo não traz esse dado de cada bomba, então usamos um valor típico.
 */
export const NPSH_REQUERIDO_ADOTADO_MCA = 3.0;
/** 1 cv = 0,7355 kW. */
export const KW_POR_CV = 0.7355;

/** Arredonda para um número de casas decimais. */
const arredondar = (valor: number, casas: number) => {
  const fator = Math.pow(10, casas);
  return Math.round(valor * fator) / fator;
};

// ---------------------------------------------------------------------------
// Fórmulas
// ---------------------------------------------------------------------------

/**
 * Perda de carga unitária pela fórmula de Hazen-Williams.
 *
 *   J = 10,643 · Q^1,852 / (C^1,852 · D^4,87)
 *
 * J = metros de perda por metro de cano (m/m)
 * Q = vazão em m³/s
 * C = coeficiente do material (PVC 140, ferro fundido 100...)
 * D = diâmetro interno em metros
 */
export function perdaUnitariaHazenWilliams(
  vazaoM3s: number,
  diametroInternoM: number,
  coeficienteC: number
): number {
  if (vazaoM3s <= 0 || diametroInternoM <= 0 || coeficienteC <= 0) return 0;
  const numerador = 10.643 * Math.pow(vazaoM3s, 1.852);
  const denominador = Math.pow(coeficienteC, 1.852) * Math.pow(diametroInternoM, 4.87);
  return numerador / denominador;
}

/**
 * Velocidade média da água no cano.
 *
 *   V = Q / A,   com A = π · D² / 4
 *
 * V em m/s, Q em m³/s, D (diâmetro interno) em metros.
 */
export function velocidadeEscoamento(vazaoM3s: number, diametroInternoM: number): number {
  if (diametroInternoM <= 0 || vazaoM3s <= 0) return 0;
  const areaM2 = (Math.PI * Math.pow(diametroInternoM, 2)) / 4;
  return vazaoM3s / areaM2;
}

/**
 * Soma dos comprimentos equivalentes das conexões (m).
 * Cada peça "vale" alguns metros de cano reto; o valor depende da bitola,
 * por isso procuramos a bitola comercial mais próxima do diâmetro interno.
 */
export function comprimentoEquivalente(conexoes: ItemConexao[], diametroInternoMm: number): number {
  const diametroNominalMm = diametroNominalMaisProximo(diametroInternoMm);
  let soma = 0;

  for (const item of conexoes) {
    if (item.quantidade <= 0) continue;
    const definicao = CONEXOES.find(c => c.id === item.idConexao);
    if (definicao) {
      const metrosPorPeca = definicao.comprimentosEquivalentes[diametroNominalMm] || 0;
      soma += metrosPorPeca * item.quantidade;
    }
  }

  return soma;
}

/** Quais conexões entram na conta: as típicas (modo simples) ou as informadas (modo técnico). */
export function conexoesConsideradas(entradas: DadosEntrada): { succao: ItemConexao[]; recalque: ItemConexao[] } {
  if (entradas.usarConexoesTipicas) {
    return { succao: CONEXOES_TIPICAS_SUCCAO, recalque: CONEXOES_TIPICAS_RECALQUE };
  }
  return { succao: entradas.conexoesSuccao || [], recalque: entradas.conexoesRecalque || [] };
}

/**
 * Pressão atmosférica local em mca.
 *
 *   Patm = 10,33 · (1 − 2,2557×10⁻⁵ · altitude)^5,2559
 *
 * Ao nível do mar vale 10,33 mca e cai cerca de 1,2 mca a cada 1.000 m.
 * É essa pressão que "empurra" a água para dentro da bomba na sucção.
 */
export function calcularPressaoAtmosferica(altitudeM: number): number {
  const altitude = Math.max(0, altitudeM);
  return 10.33 * Math.pow(1 - 2.2557e-5 * altitude, 5.2559);
}

/**
 * Folga de segurança do motor sobre a potência no eixo (tabela clássica de
 * Azevedo Netto e Macintyre). Motores pequenos recebem folga maior.
 */
export function folgaMotorPct(potenciaEixoCv: number): number {
  if (potenciaEixoCv <= 2) return 50;
  if (potenciaEixoCv <= 5) return 30;
  if (potenciaEixoCv <= 10) return 20;
  if (potenciaEixoCv <= 20) return 15;
  return 10;
}

/** Motor comercial imediatamente acima da potência pedida. */
export function proximoMotorComercialCv(potenciaCv: number): number {
  for (const motorCv of POTENCIAS_COMERCIAIS_CV) {
    // a tolerância evita que 1,0000001 cv vire 1,5 cv por erro de arredondamento
    if (motorCv >= potenciaCv - 1e-9) return motorCv;
  }
  return POTENCIAS_COMERCIAIS_CV[POTENCIAS_COMERCIAIS_CV.length - 1];
}

/**
 * Classifica a velocidade da água no cano.
 * Faixas recomendadas: sucção de 0,6 a 1,5 m/s; recalque de 0,8 a 2,2 m/s.
 * Velocidade alta aumenta a perda de carga, o risco de cavitação (na sucção)
 * e o golpe de aríete (no recalque).
 */
export function avaliarVelocidade(velocidadeMs: number, ehSuccao: boolean): {
  situacao: SituacaoVelocidade;
  mensagem: string;
} {
  if (velocidadeMs === 0) {
    return { situacao: 'adequada', mensagem: 'Sem escoamento' };
  }

  if (ehSuccao) {
    if (velocidadeMs < 0.6) {
      return {
        situacao: 'baixa',
        mensagem: 'Velocidade baixa na sucção (abaixo de 0,6 m/s): o tubo pode ser mais fino sem prejuízo.'
      };
    }
    if (velocidadeMs <= 1.5) {
      return {
        situacao: 'adequada',
        mensagem: 'Velocidade adequada na sucção (0,6 a 1,5 m/s).'
      };
    }
    if (velocidadeMs <= 2.0) {
      return {
        situacao: 'alta',
        mensagem: 'Velocidade alta na sucção (1,5 a 2,0 m/s): aumenta a perda de carga e o risco de cavitação.'
      };
    }
    return {
      situacao: 'critica',
      mensagem: 'Velocidade excessiva na sucção (acima de 2,0 m/s): use um tubo de sucção mais grosso.'
    };
  }

  if (velocidadeMs < 0.8) {
    return {
      situacao: 'baixa',
      mensagem: 'Velocidade baixa no recalque (abaixo de 0,8 m/s): o tubo pode ser mais fino e mais barato.'
    };
  }
  if (velocidadeMs <= 2.2) {
    return {
      situacao: 'adequada',
      mensagem: 'Velocidade adequada no recalque (0,8 a 2,2 m/s).'
    };
  }
  if (velocidadeMs <= 3.0) {
    return {
      situacao: 'alta',
      mensagem: 'Velocidade alta no recalque (2,2 a 3,0 m/s): perda de carga elevada e risco de golpe de aríete.'
    };
  }
  return {
    situacao: 'critica',
    mensagem: 'Velocidade crítica no recalque (acima de 3,0 m/s): use um tubo mais grosso.'
  };
}

// ---------------------------------------------------------------------------
// Cálculo completo
// ---------------------------------------------------------------------------

export function calcularHidraulica(entradas: DadosEntrada): ResultadoHidraulico {
  // --- 1. Vazão em várias unidades -----------------------------------------
  const vazaoM3h = Math.max(0, Number(entradas.vazaoM3h) || 0);
  const vazaoM3s = vazaoM3h / 3600;   // 1 hora = 3.600 s (unidade das fórmulas)
  const vazaoLs = vazaoM3h / 3.6;     // litros por segundo
  const vazaoLh = vazaoM3h * 1000;    // litros por hora
  const submersa = !!entradas.bombaSubmersa;
  const conexoes = conexoesConsideradas(entradas);

  const materialSuccao = MATERIAIS_TUBO.find(m => m.id === entradas.materialSuccao) || MATERIAIS_TUBO[0];
  const materialRecalque = MATERIAIS_TUBO.find(m => m.id === entradas.materialRecalque) || MATERIAIS_TUBO[0];

  // --- 2. Sucção (não existe quando a bomba fica dentro do poço) -------------
  const diametroSuccaoMm = entradas.diametroSuccaoMm || 27.8; // padrão: 1"
  const diametroSuccaoM = diametroSuccaoMm / 1000;
  const comprimentoEquivSuccao = submersa ? 0 : comprimentoEquivalente(conexoes.succao, diametroSuccaoMm);
  const comprimentoCanoSuccao = submersa ? 0 : Math.max(0, entradas.comprimentoSuccaoM || 0);
  const comprimentoTotalSuccao = comprimentoCanoSuccao + comprimentoEquivSuccao;

  const perdaUnitariaSuccao = submersa
    ? 0
    : perdaUnitariaHazenWilliams(vazaoM3s, diametroSuccaoM, materialSuccao.coeficienteC);
  // perda (mca) = perda por metro × (cano + conexões)
  const perdaSuccaoMca = perdaUnitariaSuccao * comprimentoTotalSuccao;

  const velocidadeSuccaoMs = submersa ? 0 : velocidadeEscoamento(vazaoM3s, diametroSuccaoM);
  const avaliacaoSuccao = avaliarVelocidade(velocidadeSuccaoMs, true);

  // --- 3. Recalque -----------------------------------------------------------
  const diametroRecalqueMm = entradas.diametroRecalqueMm || 21.6; // padrão: 3/4"
  const diametroRecalqueM = diametroRecalqueMm / 1000;
  const comprimentoEquivRecalque = comprimentoEquivalente(conexoes.recalque, diametroRecalqueMm);
  const comprimentoCanoRecalque = Math.max(0, entradas.comprimentoRecalqueM || 0);
  const comprimentoTotalRecalque = comprimentoCanoRecalque + comprimentoEquivRecalque;

  const perdaUnitariaRecalque = perdaUnitariaHazenWilliams(vazaoM3s, diametroRecalqueM, materialRecalque.coeficienteC);
  const perdaRecalqueMca = perdaUnitariaRecalque * comprimentoTotalRecalque;

  const velocidadeRecalqueMs = velocidadeEscoamento(vazaoM3s, diametroRecalqueM);
  const avaliacaoRecalque = avaliarVelocidade(velocidadeRecalqueMs, false);

  // --- 4. Altura manométrica total ------------------------------------------
  //   HMT = desnível (sucção + recalque) + perdas de carga + pressão residual
  const desnivelSuccao = submersa ? 0 : Math.max(0, entradas.alturaSuccaoM || 0);
  const desnivelRecalque = Math.max(0, entradas.alturaRecalqueM || 0);
  const desnivelTotal = desnivelSuccao + desnivelRecalque;
  const perdaTotalMca = perdaSuccaoMca + perdaRecalqueMca;
  const pressaoResidual = Math.max(0, entradas.pressaoResidualMca || 0);
  // parte da altura que não muda com a vazão
  const alturaEstatica = desnivelTotal + pressaoResidual;
  const hmtMca = alturaEstatica + perdaTotalMca;

  // --- 5. Sucção: NPSH disponível -------------------------------------------
  //   NPSHd = Patm − Pvapor − altura de sucção − perda na sucção
  // É a "sobra" de pressão na entrada da bomba. Se for menor que o NPSH
  // requerido pela bomba, a água ferve dentro dela (cavitação).
  const altitudeM = entradas.altitudeM ?? ALTITUDE_PADRAO_M;
  const pressaoAtmosfericaMca = calcularPressaoAtmosferica(altitudeM);
  const npshDisponivel = submersa
    ? null
    : pressaoAtmosfericaMca - PRESSAO_VAPOR_MCA - desnivelSuccao - perdaSuccaoMca;

  // --- 6. Potências ------------------------------------------------------------
  //   P hidráulica (cv) = γ · Q · HMT / 75, com γ = 1000 kgf/m³ e Q em m³/s
  //   Com Q em m³/h:      = Q · HMT / 270   (porque 75 × 3600 / 1000 = 270)
  const potenciaHidraulicaCv = (vazaoM3h * hmtMca) / 270;
  const potenciaHidraulicaKw = potenciaHidraulicaCv * KW_POR_CV;

  // Rendimentos limitados a faixas realistas, caso alguém digite um valor absurdo.
  const rendimentoBomba = Math.min(0.95, Math.max(0.2, (entradas.rendimentoBombaPct || 60) / 100));
  const rendimentoMotor = Math.min(0.98, Math.max(0.5, (entradas.rendimentoMotorPct || 85) / 100));

  // Potência no eixo: o que a bomba exige do motor (perde energia no rotor).
  const potenciaEixoCv = potenciaHidraulicaCv / rendimentoBomba;
  const potenciaEixoKw = potenciaEixoCv * KW_POR_CV;

  // Motor comercial: eixo + folga de segurança, arredondado para cima.
  const folgaPct = folgaMotorPct(potenciaEixoCv);
  const potenciaMotorNecessariaCv = potenciaEixoCv * (1 + folgaPct / 100);
  const motorComercialCv = potenciaHidraulicaCv > 0 ? proximoMotorComercialCv(potenciaMotorNecessariaCv) : 0;

  // Potência que sai da rede elétrica. O rendimento do motor entra só aqui, uma única vez.
  const potenciaEletricaKw = potenciaEixoKw / rendimentoMotor;

  // --- 7. Curva da instalação --------------------------------------------------
  //   H(Q) = altura estática + k · Q^1,852
  // O expoente 1,852 vem de Hazen-Williams; k sai da perda calculada na vazão de projeto.
  const coeficienteKInstalacao = vazaoM3h > 0 ? perdaTotalMca / Math.pow(vazaoM3h, 1.852) : 0;

  // 21 pontos, de zero até 1,8 vez a vazão de projeto (ou até 5 m³/h, o que for maior)
  const vazaoMaximaGrafico = Math.max(vazaoM3h * 1.8, 5);
  const pontosCurvaInstalacao: Array<{ vazaoM3h: number; alturaMca: number }> = [];
  const divisoes = 20;
  for (let i = 0; i <= divisoes; i++) {
    const q = arredondar((vazaoMaximaGrafico * i) / divisoes, 2);
    pontosCurvaInstalacao.push({
      vazaoM3h: q,
      alturaMca: arredondar(alturaEstatica + coeficienteKInstalacao * Math.pow(q, 1.852), 2)
    });
  }

  // --- 8. Uso diário e custo ----------------------------------------------------
  const horasPorDia = Math.min(24, Math.max(0.5, entradas.horasPorDia || 4));
  const volumeDiarioM3 = arredondar(vazaoM3h * horasPorDia, 1);
  const volumeDiarioLitros = Math.round(vazaoM3h * horasPorDia * 1000);
  const consumoDiarioKwh = arredondar(potenciaEletricaKw * horasPorDia, 2);
  const tarifa = entradas.tarifaEnergiaBrlKwh && entradas.tarifaEnergiaBrlKwh > 0
    ? entradas.tarifaEnergiaBrlKwh
    : TARIFA_PADRAO_BRL_KWH;
  const custoMensalBrl = arredondar(potenciaEletricaKw * horasPorDia * 30 * tarifa, 2);

  // --- 9. Avisos para a pessoa ---------------------------------------------------
  const avisos: Aviso[] = [];
  const decimal = (v: number) => v.toFixed(1).replace('.', ',');

  if (!submersa && vazaoM3h > 0 && npshDisponivel !== null) {
    if (npshDisponivel < 1.5) {
      avisos.push({
        nivel: 'grave',
        codigo: 'succao_impossivel',
        mensagem: `A bomba não consegue puxar água de ${decimal(desnivelSuccao)} m de altura de sucção. Coloque a bomba mais perto do nível da água (até uns 6 m) ou use uma bomba submersa.`
      });
    } else if (npshDisponivel < NPSH_REQUERIDO_ADOTADO_MCA + 0.5) {
      avisos.push({
        nivel: 'atencao',
        codigo: 'succao_no_limite',
        mensagem: `Sucção no limite: sobram só ${decimal(npshDisponivel)} mca de NPSH disponível. Há risco de cavitação; confira o NPSH requerido no catálogo da bomba ou reduza a altura de sucção.`
      });
    }
  }
  if (!submersa && (avaliacaoSuccao.situacao === 'alta' || avaliacaoSuccao.situacao === 'critica')) {
    avisos.push({
      nivel: avaliacaoSuccao.situacao === 'critica' ? 'grave' : 'atencao',
      codigo: 'velocidade_succao',
      mensagem: avaliacaoSuccao.mensagem
    });
  }
  if (avaliacaoRecalque.situacao === 'alta' || avaliacaoRecalque.situacao === 'critica') {
    avisos.push({
      nivel: avaliacaoRecalque.situacao === 'critica' ? 'grave' : 'atencao',
      codigo: 'velocidade_recalque',
      mensagem: avaliacaoRecalque.mensagem
    });
  }
  if (entradas.usarConexoesTipicas && vazaoM3h > 0) {
    avisos.push({
      nivel: 'info',
      codigo: 'conexoes_tipicas',
      mensagem: 'As perdas em conexões foram estimadas com um conjunto típico (válvula de pé, válvula de retenção, registro e curvas). No modo técnico você informa as conexões reais.'
    });
  }

  // --- 10. Resultado (arredondado para exibir) -----------------------------------
  return {
    vazaoM3h: arredondar(vazaoM3h, 2),
    vazaoLs: arredondar(vazaoLs, 2),
    vazaoLh: Math.round(vazaoLh),

    horasPorDia,
    volumeDiarioM3,
    volumeDiarioLitros,
    consumoDiarioKwh,
    custoMensalBrl,

    comprimentoCanoSuccaoM: arredondar(comprimentoCanoSuccao, 1),
    comprimentoEquivSuccaoM: arredondar(comprimentoEquivSuccao, 1),
    comprimentoTotalSuccaoM: arredondar(comprimentoTotalSuccao, 1),
    perdaUnitariaSuccao: arredondar(perdaUnitariaSuccao, 4),
    perdaSuccaoMca: arredondar(perdaSuccaoMca, 2),
    velocidadeSuccaoMs: arredondar(velocidadeSuccaoMs, 2),
    situacaoVelocidadeSuccao: avaliacaoSuccao.situacao,
    mensagemVelocidadeSuccao: avaliacaoSuccao.mensagem,

    comprimentoCanoRecalqueM: arredondar(comprimentoCanoRecalque, 1),
    comprimentoEquivRecalqueM: arredondar(comprimentoEquivRecalque, 1),
    comprimentoTotalRecalqueM: arredondar(comprimentoTotalRecalque, 1),
    perdaUnitariaRecalque: arredondar(perdaUnitariaRecalque, 4),
    perdaRecalqueMca: arredondar(perdaRecalqueMca, 2),
    velocidadeRecalqueMs: arredondar(velocidadeRecalqueMs, 2),
    situacaoVelocidadeRecalque: avaliacaoRecalque.situacao,
    mensagemVelocidadeRecalque: avaliacaoRecalque.mensagem,

    desnivelSuccaoM: arredondar(desnivelSuccao, 2),
    desnivelRecalqueM: arredondar(desnivelRecalque, 2),
    desnivelTotalM: arredondar(desnivelTotal, 2),
    perdaTotalMca: arredondar(perdaTotalMca, 2),
    pressaoResidualMca: arredondar(pressaoResidual, 2),
    alturaEstaticaMca: arredondar(alturaEstatica, 2),
    hmtMca: arredondar(hmtMca, 2),

    pressaoAtmosfericaMca: arredondar(pressaoAtmosfericaMca, 2),
    npshDisponivelMca: npshDisponivel === null ? null : arredondar(npshDisponivel, 2),

    potenciaHidraulicaCv: arredondar(potenciaHidraulicaCv, 2),
    potenciaHidraulicaKw: arredondar(potenciaHidraulicaKw, 2),
    potenciaEixoCv: arredondar(potenciaEixoCv, 2),
    potenciaEixoKw: arredondar(potenciaEixoKw, 2),
    folgaMotorPct: folgaPct,
    potenciaMotorNecessariaCv: arredondar(potenciaMotorNecessariaCv, 2),
    motorComercialCv,
    potenciaEletricaKw: arredondar(potenciaEletricaKw, 2),
    tarifaEnergiaBrlKwh: tarifa,

    avisos,

    pontosCurvaInstalacao,
    coeficienteKInstalacao
  };
}
