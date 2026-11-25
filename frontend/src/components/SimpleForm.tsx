/**
 * FORMULÁRIO SIMPLES
 * Poucos campos, em linguagem do dia a dia. As conexões não são pedidas:
 * o cálculo usa um conjunto típico (usarConexoesTipicas = true).
 */
import React, { useState } from 'react';
import { DadosEntrada, IdMaterial } from '../calculo/tipos';
import { DIAMETROS_COMERCIAIS, MATERIAIS_TUBO } from '../calculo/materiaisEConexoes';
import { NumberField, SelectField, Segmented } from './ui/Field';
import { FormSection, SubmitBar, validarEntradas, ErrosFormulario } from './formShared';

interface PropsFormularioSimples {
  entradas: DadosEntrada;
  aoAlterar: (entradas: DadosEntrada) => void;
  aoCalcular: () => void;
  aoLimpar: () => void;
}

/**
 * Para onde vai a água define a pressão que precisa sobrar na ponta do cano
 * (pressão residual, em mca): caixa d'água 0, gotejamento 10, aspersão 25.
 */
export const DESTINOS = [
  { valor: 'reservatorio', rotulo: "Encher caixa d'água ou reservatório", pressaoResidual: 0 },
  { valor: 'gotejamento', rotulo: 'Irrigação por gotejamento', pressaoResidual: 10 },
  { valor: 'aspersao', rotulo: 'Irrigação por aspersão', pressaoResidual: 25 }
] as const;

export const SimpleForm: React.FC<PropsFormularioSimples> = ({ entradas, aoAlterar, aoCalcular, aoLimpar }) => {
  const [unidadeVazao, setUnidadeVazao] = useState<'m3h' | 'lh'>('lh');
  const [erros, setErros] = useState<ErrosFormulario>({});

  const alterar = (patch: Partial<DadosEntrada>) => {
    setErros({});
    aoAlterar({ ...entradas, ...patch, usarConexoesTipicas: true });
  };

  const destino = DESTINOS.find(d => d.valor === entradas.destino) ?? DESTINOS[0];

  const aoEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    const encontrados = validarEntradas(entradas);
    setErros(encontrados);
    if (Object.keys(encontrados).length === 0) aoCalcular();
  };

  return (
    <form onSubmit={aoEnviar} noValidate className="space-y-4">
      <FormSection titulo="A água" passo={1}>
        <Segmented<'superficie' | 'poco'>
          rotulo="De onde vem a água?"
          valor={entradas.bombaSubmersa ? 'poco' : 'superficie'}
          aoAlterar={v => alterar({ bombaSubmersa: v === 'poco' })}
          opcoes={[
            { valor: 'superficie', rotulo: 'Rio, açude ou cisterna' },
            { valor: 'poco', rotulo: 'Poço (bomba submersa)' }
          ]}
        />

        <SelectField
          rotulo="Para onde vai?"
          valor={destino.valor}
          aoAlterar={v => {
            const proximo = DESTINOS.find(d => d.valor === v) ?? DESTINOS[0];
            alterar({ destino: proximo.valor, pressaoResidualMca: proximo.pressaoResidual });
          }}
          opcoes={DESTINOS.map(d => ({ valor: d.valor, rotulo: d.rotulo }))}
          dica={destino.pressaoResidual > 0 ? `Reservamos ${destino.pressaoResidual} mca de pressão para os emissores funcionarem.` : undefined}
        />

        <NumberField
          rotulo="Quanta água por hora?"
          valor={unidadeVazao === 'lh' ? Math.round(entradas.vazaoM3h * 1000) : entradas.vazaoM3h}
          aoAlterar={v => alterar({ vazaoM3h: unidadeVazao === 'lh' ? v / 1000 : v })}
          unidade={unidadeVazao === 'lh' ? 'litros/h' : 'm³/h'}
          exemplo={unidadeVazao === 'lh' ? 'Ex.: 3000' : 'Ex.: 3'}
          erro={erros.vazao}
          dica="Para encher uma caixa de 5.000 litros em 2 horas: 2.500 litros/h."
          complemento={
            <div className="w-36 shrink-0">
              <Segmented<'m3h' | 'lh'>
                rotulo="Unidade da vazão"
                ocultarRotulo
                tamanho="pequeno"
                valor={unidadeVazao}
                aoAlterar={setUnidadeVazao}
                opcoes={[
                  { valor: 'lh', rotulo: 'litros/h' },
                  { valor: 'm3h', rotulo: 'm³/h' }
                ]}
              />
            </div>
          }
        />

        <NumberField
          rotulo="Quantas horas por dia a bomba fica ligada?"
          valor={entradas.horasPorDia ?? 0}
          aoAlterar={v => alterar({ horasPorDia: v })}
          unidade="h/dia"
          exemplo="Ex.: 4"
          maximo={24}
          dica="Serve para estimar o gasto de energia. Em branco, usamos 4 horas."
        />
      </FormSection>

      <FormSection titulo="As alturas" passo={2}>
        {!entradas.bombaSubmersa && (
          <NumberField
            rotulo="Altura de sucção"
            valor={entradas.alturaSuccaoM}
            aoAlterar={v => alterar({ alturaSuccaoM: v })}
            unidade="metros"
            exemplo="Ex.: 2"
            erro={erros.alturaSuccao}
            dica="Do nível da água até a bomba, na vertical. Bomba comum não puxa de mais de 6 m."
          />
        )}
        <NumberField
          rotulo="Altura de recalque"
          valor={entradas.alturaRecalqueM}
          aoAlterar={v => alterar({ alturaRecalqueM: v })}
          unidade="metros"
          exemplo="Ex.: 18"
          erro={erros.altura}
          dica={
            entradas.bombaSubmersa
              ? 'Do nível da água dentro do poço até o ponto mais alto de chegada, na vertical.'
              : 'Da bomba até o ponto mais alto de chegada da água, na vertical.'
          }
        />
      </FormSection>

      <FormSection titulo="A tubulação" passo={3}>
        {!entradas.bombaSubmersa && (
          <NumberField
            rotulo="Comprimento do cano de sucção"
            valor={entradas.comprimentoSuccaoM}
            aoAlterar={v => alterar({ comprimentoSuccaoM: v })}
            unidade="metros"
            exemplo="Ex.: 5"
            dica="Todo o cano entre a água e a bomba."
          />
        )}
        <NumberField
          rotulo="Comprimento do cano de recalque"
          valor={entradas.comprimentoRecalqueM}
          aoAlterar={v => alterar({ comprimentoRecalqueM: v })}
          unidade="metros"
          exemplo="Ex.: 60"
          erro={erros.comprimento}
          dica="Todo o cano entre a bomba e a chegada, seguindo o terreno."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            rotulo="Bitola do cano"
            valor={entradas.diametroRecalqueMm}
            aoAlterar={v => {
              const diametro = parseFloat(v);
              // A sucção acompanha o recalque, mas nunca fica mais fina que 1".
              alterar({ diametroRecalqueMm: diametro, diametroSuccaoMm: Math.max(diametro, 27.8) });
            }}
            opcoes={DIAMETROS_COMERCIAIS.map(d => ({
              valor: d.internoMm,
              rotulo: `${d.bitolaPol} (${d.nominalMm} mm)`
            }))}
          />
          <SelectField
            rotulo="Material do cano"
            valor={entradas.materialRecalque}
            aoAlterar={v => alterar({ materialSuccao: v as IdMaterial, materialRecalque: v as IdMaterial })}
            opcoes={MATERIAIS_TUBO.map(m => ({ valor: m.id, rotulo: m.nomeCurto }))}
          />
        </div>
      </FormSection>

      <SubmitBar aoLimpar={aoLimpar} temErros={Object.keys(erros).length > 0} />
    </form>
  );
};
