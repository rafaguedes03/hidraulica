/**
 * TIPOS DE DADOS DO HIDROCALC
 *
 * Aqui ficam as "fichas" que circulam pelo app:
 *   - DadosEntrada ........ o que a pessoa preenche no formulário
 *   - ResultadoHidraulico . tudo o que o cálculo devolve
 *   - ModeloBomba ......... uma bomba do catálogo
 *   - BombaAvaliada ....... uma bomba do catálogo depois de comparada com a instalação
 *
 * Convenção dos nomes: o final indica a unidade.
 *   M = metros, Mm = milímetros, Mca = metros de coluna d'água, M3h = m³/h,
 *   Ls = litros por segundo, Lh = litros por hora, Cv = cavalo-vapor,
 *   Kw = quilowatt, Kwh = quilowatt-hora, Pct = porcentagem, Brl = reais.
 */

// ---------------------------------------------------------------------------
// Tubos e conexões
// ---------------------------------------------------------------------------

export type IdMaterial = 'pvc' | 'pead' | 'ferro_fundido' | 'aco_galvanizado' | 'aco_soldado';

export interface MaterialTubo {
  id: IdMaterial;
  nome: string;
  nomeCurto: string;
  /** Coeficiente C de Hazen-Williams: quanto maior, mais liso o tubo e menor a perda. */
  coeficienteC: number;
  usoTipico: string;
}

/** Bitola vendida no mercado. O cálculo usa o diâmetro INTERNO, por onde a água passa. */
export interface DiametroComercial {
  bitolaPol: string;  // como se pede na loja: 3/4", 1", 1.1/4"...
  nominalMm: number;  // diâmetro externo do tubo de PVC soldável
  internoMm: number;  // diâmetro interno (usado nas fórmulas)
}

export type IdConexao =
  | 'curva_90_raio_longo'
  | 'curva_90_raio_curto'
  | 'joelho_90'
  | 'joelho_45'
  | 'valvula_pe_crivo'
  | 'valvula_retencao_pesada'
  | 'valvula_retencao_leve'
  | 'registro_gaveta_aberto'
  | 'registro_globo_aberto'
  | 'registro_esfera_aberto'
  | 'te_passagem_direta'
  | 'te_saida_lateral'
  | 'saida_tubulacao';

export interface DefinicaoConexao {
  id: IdConexao;
  nome: string;
  categoria: 'curvas' | 'valvulas' | 'registros' | 'conexoes';
  /**
   * Comprimento equivalente (m) para cada diâmetro nominal (mm).
   * Ex.: { 32: 13.3 } = uma peça de 32 mm perde tanto quanto 13,3 m de cano reto.
   */
  comprimentosEquivalentes: Record<number, number>;
}

/** Uma linha da lista de conexões: qual peça e quantas. */
export interface ItemConexao {
  idConexao: IdConexao;
  quantidade: number;
}

// ---------------------------------------------------------------------------
// Bombas
// ---------------------------------------------------------------------------

export type TipoBomba =
  | 'centrifuga'
  | 'submersivel'
  | 'periferica'
  | 'autoaspirante'
  | 'injetora'
  | 'solar';

export interface ModeloBomba {
  id: string;
  fabricante: string;
  modelo: string;
  tipo: TipoBomba;
  potenciaCv: number;
  potenciaKw: number;
  tensao: string;
  fase: 'Monofásico 127/220V' | 'Trifásico 220/380V' | 'Bivolt Automático' | 'Solar DC (24V/48V/110V)';
  bocalSuccao: string;    // bitola da entrada (ou "Submersa")
  bocalRecalque: string;  // bitola da saída
  diametroRotorMm?: number;
  alturaMaximaMca: number;   // altura com a saída fechada (vazão zero)
  vazaoMaximaM3h: number;    // vazão com altura quase zero
  vazaoMinimaM3h: number;    // abaixo disso o fabricante não recomenda operar
  /**
   * Curva da bomba: H = a·Q² + b·Q + c
   * (Q em m³/h, H em mca). "c" é a altura com vazão zero; "a" é negativo,
   * por isso a altura cai à medida que a vazão aumenta.
   */
  coeficientesCurva: {
    a: number;
    b: number;
    c: number;
  };
  /** Pontos lidos da curva do fabricante (usados para conferir os coeficientes). */
  pontosCurva: Array<{ vazaoM3h: number; alturaMca: number }>;
  /** BEP = ponto de melhor eficiência (onde a bomba rende mais). */
  vazaoBepM3h: number;
  alturaBepMca: number;
  rendimentoMaximoPct: number;
  linkManual?: string;
  linkFichaTecnica?: string;
  linkCompra?: string;
  precoAproximadoBrl?: number;
  caracteristicas: string[];
}

export type SituacaoBomba = 'ideal' | 'boa' | 'superdimensionada' | 'limite' | 'incompativel';

/** Resultado da comparação de uma bomba do catálogo com a instalação. */
export interface BombaAvaliada {
  bomba: ModeloBomba;
  /** Onde a curva da bomba cruza a curva da instalação. */
  pontoTrabalho: {
    vazaoM3h: number;
    alturaMca: number;
    rendimentoPct: number;
  };
  nota: number;        // de 0 a 100; usada para ordenar a lista
  situacao: SituacaoBomba;
  rotulo: string;      // texto do selo: "Melhor opção", "Boa opção"...
  motivos: string[];   // pontos a favor (ou, se incompatível, por que não serve)
  ressalvas: string[]; // pontos de atenção
}

// ---------------------------------------------------------------------------
// Dados de entrada (formulário)
// ---------------------------------------------------------------------------

export interface DadosEntrada {
  /** Para onde vai a água no modo simples: 'reservatorio', 'gotejamento' ou 'aspersao'. */
  destino?: string;

  // O que se pede da bomba
  vazaoM3h: number;
  horasPorDia?: number;         // horas ligada por dia (para estimar energia)
  pressaoResidualMca: number;   // pressão que precisa sobrar no fim do cano

  // Sucção: da água até a bomba
  alturaSuccaoM: number;        // desnível vertical do nível da água até a bomba
  comprimentoSuccaoM: number;   // comprimento do cano de sucção
  diametroSuccaoMm: number;     // diâmetro INTERNO do cano de sucção
  materialSuccao: IdMaterial;
  conexoesSuccao: ItemConexao[];
  bombaSubmersa: boolean;       // true = bomba dentro do poço: não há sucção

  // Recalque: da bomba até a chegada
  alturaRecalqueM: number;      // desnível vertical da bomba até o ponto mais alto
  comprimentoRecalqueM: number;
  diametroRecalqueMm: number;   // diâmetro INTERNO
  materialRecalque: IdMaterial;
  conexoesRecalque: ItemConexao[];

  // Rendimentos estimados
  rendimentoBombaPct: number;   // padrão 60%
  rendimentoMotorPct: number;   // padrão 85%

  /** Modo simples: usa um conjunto típico de conexões em vez das listas acima. */
  usarConexoesTipicas?: boolean;
  /** Altitude do local (m). Afeta a pressão atmosférica e, com ela, a sucção. Padrão 500 m. */
  altitudeM?: number;
  /** Tarifa de energia (R$/kWh). Padrão 0,85. */
  tarifaEnergiaBrlKwh?: number;
}

// ---------------------------------------------------------------------------
// Resultado do cálculo
// ---------------------------------------------------------------------------

export type NivelAviso = 'info' | 'atencao' | 'grave';

export interface Aviso {
  nivel: NivelAviso;
  codigo: 'succao_impossivel' | 'succao_no_limite' | 'velocidade_succao' | 'velocidade_recalque' | 'conexoes_tipicas';
  mensagem: string;
}

/** Classificação da velocidade da água no cano. */
export type SituacaoVelocidade = 'baixa' | 'adequada' | 'alta' | 'critica';

export interface ResultadoHidraulico {
  // Vazão em três unidades
  vazaoM3h: number;
  vazaoLs: number;
  vazaoLh: number;

  // Uso diário
  horasPorDia: number;
  volumeDiarioM3: number;
  volumeDiarioLitros: number;
  consumoDiarioKwh: number;
  custoMensalBrl: number;

  // Sucção
  comprimentoCanoSuccaoM: number;   // cano reto
  comprimentoEquivSuccaoM: number;  // soma dos comprimentos equivalentes das conexões
  comprimentoTotalSuccaoM: number;  // cano + conexões
  perdaUnitariaSuccao: number;      // J: metros de perda por metro de cano (m/m)
  perdaSuccaoMca: number;
  velocidadeSuccaoMs: number;
  situacaoVelocidadeSuccao: SituacaoVelocidade;
  mensagemVelocidadeSuccao: string;

  // Recalque
  comprimentoCanoRecalqueM: number;
  comprimentoEquivRecalqueM: number;
  comprimentoTotalRecalqueM: number;
  perdaUnitariaRecalque: number;
  perdaRecalqueMca: number;
  velocidadeRecalqueMs: number;
  situacaoVelocidadeRecalque: SituacaoVelocidade;
  mensagemVelocidadeRecalque: string;

  // Altura manométrica total e suas parcelas
  desnivelSuccaoM: number;
  desnivelRecalqueM: number;
  desnivelTotalM: number;           // sucção + recalque
  perdaTotalMca: number;            // perdas na sucção + no recalque
  pressaoResidualMca: number;
  alturaEstaticaMca: number;        // desnível + pressão residual (não depende da vazão)
  hmtMca: number;                   // HMT = desnível + perdas + pressão residual

  // Sucção: NPSH disponível (null quando a bomba é submersa)
  pressaoAtmosfericaMca: number;
  npshDisponivelMca: number | null;

  // Potências
  potenciaHidraulicaCv: number;      // energia entregue à água
  potenciaHidraulicaKw: number;
  potenciaEixoCv: number;            // o que a bomba exige do motor = hidráulica / rendimento da bomba
  potenciaEixoKw: number;
  folgaMotorPct: number;             // folga de segurança aplicada sobre a potência no eixo
  potenciaMotorNecessariaCv: number; // eixo + folga
  motorComercialCv: number;          // motor de mercado imediatamente acima
  potenciaEletricaKw: number;        // o que sai da rede = eixo / rendimento do motor
  tarifaEnergiaBrlKwh: number;

  avisos: Aviso[];

  /** Pontos da curva da instalação, para o gráfico. */
  pontosCurvaInstalacao: Array<{ vazaoM3h: number; alturaMca: number }>;
  /** k da curva da instalação: H = altura estática + k·Q^1,852 */
  coeficienteKInstalacao: number;
}
