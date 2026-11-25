/**
 * FORMULÁRIO TÉCNICO
 * Sucção e recalque separados, conexões peça a peça, rendimentos,
 * altitude e tarifa. Mostra a velocidade da água enquanto se digita.
 */
import React, { useState } from 'react';
import { DadosEntrada, ResultadoHidraulico, IdMaterial, ItemConexao, SituacaoVelocidade } from '../calculo/tipos';
import { MATERIAIS_TUBO, DIAMETROS_COMERCIAIS } from '../calculo/materiaisEConexoes';
import { ALTITUDE_PADRAO_M, TARIFA_PADRAO_BRL_KWH } from '../calculo/calculoHidraulico';
import { FittingSelectorModal } from './FittingSelectorModal';
import { NumberField, SelectField } from './ui/Field';
import { FormSection, SubmitBar, validarEntradas, ErrosFormulario } from './formShared';
import { numero } from '../lib/formatacao';

interface PropsFormularioTecnico {
  entradas: DadosEntrada;
  resultados: ResultadoHidraulico;
  aoAlterar: (entradas: DadosEntrada) => void;
  aoCalcular: () => void;
  aoLimpar: () => void;
}

// Opções das listas de diâmetro e material.
const opcoesDiametro = DIAMETROS_COMERCIAIS.map(d => ({
  valor: d.internoMm,
  rotulo: `${d.bitolaPol} (${d.nominalMm} mm ext., ${String(d.internoMm).replace('.', ',')} mm int.)`
}));
const opcoesMaterial = MATERIAIS_TUBO.map(m => ({ valor: m.id, rotulo: `${m.nomeCurto} (C = ${m.coeficienteC})` }));

/** Cor do texto da velocidade conforme a situação (adequada, baixa, alta, crítica). */
const COR_VELOCIDADE: Record<SituacaoVelocidade, string> = {
  adequada: 'text-brand',
  baixa: 'text-muted',
  alta: 'text-warn',
  critica: 'text-danger'
};

const VelocityLine: React.FC<{ velocidade: number; status: string; message: string }> = ({ velocidade, status, message }) =>
  velocidade > 0 ? (
    <p className={`text-sm ${COR_VELOCIDADE[status] ?? 'text-muted'}`}>
      <span className="tabular font-bold">{numero(velocidade, 2)} m/s. </span>
      {message}
    </p>
  ) : null;

const FittingsButton: React.FC<{ rotulo: string; conexoes: ItemConexao[]; comprimentoEquivalente: number; aoClicar: () => void }> = ({
  rotulo, conexoes, comprimentoEquivalente, aoClicar
}) => {
  const quantidade = conexoes.reduce((a, b) => a + b.quantidade, 0);
  return (
    <div className="space-y-1.5">
      <span className="block text-[15px] font-semibold text-ink">{rotulo}</span>
      <button type="button" onClick={aoClicar} className="btn btn-secondary w-full justify-between text-left font-medium">
        <span>{quantidade > 0 ? `${quantidade} ${quantidade === 1 ? 'conexão' : 'conexões'}` : 'Nenhuma conexão'}</span>
        <span className="text-brand">{quantidade > 0 ? 'Editar' : 'Adicionar'}</span>
      </button>
      <p className="tabular text-sm text-muted">
        Equivalem a {numero(comprimentoEquivalente, 1)} m de cano reto.
      </p>
    </div>
  );
};

export const TechnicalForm: React.FC<PropsFormularioTecnico> = ({ entradas, resultados, aoAlterar, aoCalcular, aoLimpar }) => {
  const [janela, setJanela] = useState<'succao' | 'recalque' | null>(null);
  const [erros, setErros] = useState<ErrosFormulario>({});

  const alterar = (patch: Partial<DadosEntrada>) => {
    setErros({});
    aoAlterar({ ...entradas, ...patch, usarConexoesTipicas: false });
  };

  const aoEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    const encontrados = validarEntradas(entradas);
    setErros(encontrados);
    if (Object.keys(encontrados).length === 0) aoCalcular();
  };

  return (
    <form onSubmit={aoEnviar} noValidate className="space-y-4">
      <FormSection titulo="Vazão e pressão">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            rotulo="Vazão (Q)"
            valor={entradas.vazaoM3h}
            aoAlterar={v => alterar({ vazaoM3h: v })}
            unidade="m³/h"
            exemplo="Ex.: 3,5"
            erro={erros.vazao}
            dica={entradas.vazaoM3h > 0 ? `${numero(entradas.vazaoM3h * 1000, 0)} litros/h` : undefined}
          />
          <NumberField
            rotulo="Pressão residual na chegada"
            valor={entradas.pressaoResidualMca}
            aoAlterar={v => alterar({ pressaoResidualMca: v })}
            unidade="mca"
            exemplo="Ex.: 0"
            ajuda="Pressão que precisa sobrar no fim do cano. Saída livre em reservatório: 0. Gotejamento: cerca de 10 mca. Aspersores: de 15 a 30 mca."
          />
        </div>
      </FormSection>

      <FormSection
        titulo="Sucção"
        lateral={
          <label className="flex min-h-11 items-center gap-2 text-[15px] font-medium text-ink">
            <input
              type="checkbox"
              checked={entradas.bombaSubmersa}
              onChange={e => alterar({ bombaSubmersa: e.target.checked })}
              className="h-5 w-5 accent-brand"
            />
            Bomba submersa
          </label>
        }
      >
        {entradas.bombaSubmersa ? (
          <p className="text-[15px] text-muted">
            Bomba dentro da água: não há trecho de sucção. Em "Recalque", conte o desnível a partir do nível da água no poço.
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                rotulo="Desnível de sucção"
                valor={entradas.alturaSuccaoM}
                aoAlterar={v => alterar({ alturaSuccaoM: v })}
                unidade="m"
                exemplo="Ex.: 2"
                erro={erros.alturaSuccao}
                ajuda="Distância vertical do nível da água até o eixo da bomba. O limite prático de uma centrífuga comum fica em torno de 6 m; acima disso, o app barra a seleção."
              />
              <NumberField
                rotulo="Comprimento do cano"
                valor={entradas.comprimentoSuccaoM}
                aoAlterar={v => alterar({ comprimentoSuccaoM: v })}
                unidade="m"
                exemplo="Ex.: 5"
              />
              <SelectField
                rotulo="Diâmetro"
                valor={entradas.diametroSuccaoMm}
                aoAlterar={v => alterar({ diametroSuccaoMm: parseFloat(v) })}
                opcoes={opcoesDiametro}
                dica="Igual ou uma bitola acima do recalque."
              />
              <SelectField
                rotulo="Material"
                valor={entradas.materialSuccao}
                aoAlterar={v => alterar({ materialSuccao: v as IdMaterial })}
                opcoes={opcoesMaterial}
              />
            </div>
            <FittingsButton
              rotulo="Conexões da sucção"
              conexoes={entradas.conexoesSuccao}
              comprimentoEquivalente={resultados.comprimentoEquivSuccaoM}
              aoClicar={() => setJanela('succao')}
            />
            <VelocityLine
              velocidade={resultados.velocidadeSuccaoMs}
              status={resultados.situacaoVelocidadeSuccao}
              message={resultados.mensagemVelocidadeSuccao}
            />
          </>
        )}
      </FormSection>

      <FormSection titulo="Recalque">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            rotulo="Desnível de recalque"
            valor={entradas.alturaRecalqueM}
            aoAlterar={v => alterar({ alturaRecalqueM: v })}
            unidade="m"
            exemplo="Ex.: 18"
            erro={erros.altura}
          />
          <NumberField
            rotulo="Comprimento do cano"
            valor={entradas.comprimentoRecalqueM}
            aoAlterar={v => alterar({ comprimentoRecalqueM: v })}
            unidade="m"
            exemplo="Ex.: 60"
            erro={erros.comprimento}
          />
          <SelectField
            rotulo="Diâmetro"
            valor={entradas.diametroRecalqueMm}
            aoAlterar={v => alterar({ diametroRecalqueMm: parseFloat(v) })}
            opcoes={opcoesDiametro}
          />
          <SelectField
            rotulo="Material"
            valor={entradas.materialRecalque}
            aoAlterar={v => alterar({ materialRecalque: v as IdMaterial })}
            opcoes={opcoesMaterial}
          />
        </div>
        <FittingsButton
          rotulo="Conexões do recalque"
          conexoes={entradas.conexoesRecalque}
          comprimentoEquivalente={resultados.comprimentoEquivRecalqueM}
          aoClicar={() => setJanela('recalque')}
        />
        <VelocityLine
          velocidade={resultados.velocidadeRecalqueMs}
          status={resultados.situacaoVelocidadeRecalque}
          message={resultados.mensagemVelocidadeRecalque}
        />
      </FormSection>

      <FormSection titulo="Condições de operação">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            rotulo="Horas ligada por dia"
            valor={entradas.horasPorDia ?? 0}
            aoAlterar={v => alterar({ horasPorDia: v })}
            unidade="h/dia"
            exemplo="4"
            maximo={24}
          />
          <NumberField
            rotulo="Tarifa de energia"
            valor={entradas.tarifaEnergiaBrlKwh ?? TARIFA_PADRAO_BRL_KWH}
            aoAlterar={v => alterar({ tarifaEnergiaBrlKwh: v })}
            unidade="R$/kWh"
            vazioQuandoZero={false}
            dica="Veja o valor na sua conta de luz."
          />
          <NumberField
            rotulo="Altitude do local"
            valor={entradas.altitudeM ?? ALTITUDE_PADRAO_M}
            aoAlterar={v => alterar({ altitudeM: v })}
            unidade="m"
            vazioQuandoZero={false}
            maximo={5000}
            ajuda="Quanto mais alto o local, menor a pressão atmosférica e menor a altura de sucção possível."
          />
          <NumberField
            rotulo="Rendimento da bomba"
            valor={entradas.rendimentoBombaPct}
            aoAlterar={v => alterar({ rendimentoBombaPct: v })}
            unidade="%"
            vazioQuandoZero={false}
            maximo={95}
            dica="Bombas pequenas: de 40% a 70%."
          />
          <NumberField
            rotulo="Rendimento do motor"
            valor={entradas.rendimentoMotorPct}
            aoAlterar={v => alterar({ rendimentoMotorPct: v })}
            unidade="%"
            vazioQuandoZero={false}
            maximo={98}
            dica="Motores elétricos: de 75% a 92%."
          />
        </div>
      </FormSection>

      <SubmitBar aoLimpar={aoLimpar} temErros={Object.keys(erros).length > 0} />

      <FittingSelectorModal
        aberto={janela !== null}
        aoFechar={() => setJanela(null)}
        titulo={janela === 'succao' ? 'Conexões da sucção' : 'Conexões do recalque'}
        diametroMm={janela === 'succao' ? entradas.diametroSuccaoMm : entradas.diametroRecalqueMm}
        conexoesSelecionadas={janela === 'succao' ? entradas.conexoesSuccao : entradas.conexoesRecalque}
        aoAlterar={conexoes => alterar(janela === 'succao' ? { conexoesSuccao: conexoes } : { conexoesRecalque: conexoes })}
      />
    </form>
  );
};
