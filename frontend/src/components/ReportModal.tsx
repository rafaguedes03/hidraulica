/**
 * MEMORIAL DE CÁLCULO EM PDF
 * Monta um PDF com os dados da instalação, a HMT, as potências e as bombas
 * indicadas. A biblioteca de PDF só é carregada quando alguém clica em baixar.
 */
import React, { useId, useState } from 'react';
import { DadosEntrada, ResultadoHidraulico, BombaAvaliada } from '../calculo/tipos';
import { MATERIAIS_TUBO, descreverConexoes } from '../calculo/materiaisEConexoes';
import { conexoesConsideradas } from '../calculo/calculoHidraulico';
import { Modal } from './ui/Modal';
import { cv, numero } from '../lib/formatacao';
import { Download } from 'lucide-react';

interface PropsRelatorio {
  aberto: boolean;
  aoFechar: () => void;
  entradas: DadosEntrada;
  resultados: ResultadoHidraulico;
  bombasAvaliadas: BombaAvaliada[];
}

const VERDE: [number, number, number] = [31, 107, 58];
const TINTA: [number, number, number] = [21, 35, 26];
const CINZA: [number, number, number] = [83, 99, 88];

const TextField: React.FC<{ rotulo: string; valor: string; aoAlterar: (v: string) => void; exemplo: string }> = ({
  rotulo, valor, aoAlterar, exemplo
}) => {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[15px] font-semibold text-ink">{rotulo}</label>
      <input id={id} type="text" value={valor} onChange={e => aoAlterar(e.target.value)} placeholder={exemplo} className="input" />
    </div>
  );
};

export const ReportModal: React.FC<PropsRelatorio> = ({ aberto, aoFechar, entradas, resultados, bombasAvaliadas }) => {
  const [nomeProjeto, setNomeProjeto] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [local, setLocal] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [gerando, setGerando] = useState(false);
  const [falhou, setFalhou] = useState(false);

  const compativeis = bombasAvaliadas.filter(a => a.situacao !== 'incompativel');

  const baixarPdf = async () => {
    setGerando(true);
    setFalhou(false);
    try {
      // Carregado só quando alguém pede o PDF: o app abre mais rápido no celular.
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const ultimoY = () => (pdf as any).lastAutoTable.finalY as number;
      const tituloSecao = (texto: string, y: number) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(...TINTA);
        pdf.text(texto, 14, y);
      };
      const seNaoSubmersa = (v: string) => (entradas.bombaSubmersa ? '-' : v);
      const nomeMaterial = (id: string) => MATERIAIS_TUBO.find(m => m.id === id)?.nome ?? id;
      const conexoes = conexoesConsideradas(entradas);

      pdf.setFillColor(...VERDE);
      pdf.rect(0, 0, 210, 30, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Memorial de cálculo: dimensionamento de bomba', 14, 14);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(`HidroCalc. Emitido em ${new Date().toLocaleDateString('pt-BR')}.`, 14, 22);

      autoTable(pdf, {
        startY: 36,
        body: [
          ['Projeto', nomeProjeto || '-', 'Cliente', nomeCliente || '-'],
          ['Local', local || '-', 'Responsável', responsavel || '-']
        ],
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 1.5, textColor: TINTA },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 24 }, 2: { fontStyle: 'bold', cellWidth: 26 } }
      });

      tituloSecao('1. Instalação', ultimoY() + 8);
      autoTable(pdf, {
        startY: ultimoY() + 11,
        head: [['', 'Sucção', 'Recalque', 'Total']],
        body: [
          ['Desnível', entradas.bombaSubmersa ? 'bomba submersa' : `${numero(resultados.desnivelSuccaoM, 1)} m`, `${numero(resultados.desnivelRecalqueM, 1)} m`, `${numero(resultados.desnivelTotalM, 1)} m`],
          ['Comprimento do cano', seNaoSubmersa(`${numero(resultados.comprimentoCanoSuccaoM, 1)} m`), `${numero(resultados.comprimentoCanoRecalqueM, 1)} m`, `${numero(resultados.comprimentoCanoSuccaoM + resultados.comprimentoCanoRecalqueM, 1)} m`],
          ['Comprimento equivalente das conexões', seNaoSubmersa(`${numero(resultados.comprimentoEquivSuccaoM, 1)} m`), `${numero(resultados.comprimentoEquivRecalqueM, 1)} m`, `${numero(resultados.comprimentoEquivSuccaoM + resultados.comprimentoEquivRecalqueM, 1)} m`],
          ['Diâmetro interno', seNaoSubmersa(`${numero(entradas.diametroSuccaoMm, 1)} mm`), `${numero(entradas.diametroRecalqueMm, 1)} mm`, ''],
          ['Material', seNaoSubmersa(nomeMaterial(entradas.materialSuccao)), nomeMaterial(entradas.materialRecalque), ''],
          ['Velocidade', seNaoSubmersa(`${numero(resultados.velocidadeSuccaoMs, 2)} m/s`), `${numero(resultados.velocidadeRecalqueMs, 2)} m/s`, ''],
          ['Perda de carga', seNaoSubmersa(`${numero(resultados.perdaSuccaoMca, 2)} mca`), `${numero(resultados.perdaRecalqueMca, 2)} mca`, `${numero(resultados.perdaTotalMca, 2)} mca`],
          ['Pressão residual na chegada', '', '', `${numero(resultados.pressaoResidualMca, 1)} mca`],
          ['Altura manométrica total (HMT)', '', '', `${numero(resultados.hmtMca, 1)} mca`]
        ],
        theme: 'striped',
        headStyles: { fillColor: TINTA, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
        styles: { fontSize: 8.5, cellPadding: 2 },
        didParseCell: data => {
          if (data.section === 'body' && data.row.index === 8) data.cell.styles.fontStyle = 'bold';
        }
      });

      const linhasConexoes = [
        !entradas.bombaSubmersa && conexoes.succao.length > 0 ? `Conexões na sucção: ${descreverConexoes(conexoes.succao)}.` : '',
        conexoes.recalque.length > 0 ? `Conexões no recalque: ${descreverConexoes(conexoes.recalque)}.` : '',
        entradas.usarConexoesTipicas ? 'Conexões estimadas por um conjunto típico (modo simples).' : ''
      ].filter(Boolean);
      if (linhasConexoes.length > 0) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...CINZA);
        const linhas = pdf.splitTextToSize(linhasConexoes.join(' '), 182);
        pdf.text(linhas, 14, ultimoY() + 5);
        (pdf as any).lastAutoTable.finalY = ultimoY() + 2 + linhas.length * 3.6;
      }

      tituloSecao('2. Potência', ultimoY() + 8);
      autoTable(pdf, {
        startY: ultimoY() + 11,
        head: [['Vazão', 'Potência hidráulica', 'Potência no eixo', `Com folga de ${resultados.folgaMotorPct}%`, 'Motor comercial']],
        body: [[
          `${numero(resultados.vazaoM3h, 2)} m³/h`,
          `${numero(resultados.potenciaHidraulicaCv, 2)} cv`,
          `${numero(resultados.potenciaEixoCv, 2)} cv`,
          `${numero(resultados.potenciaMotorNecessariaCv, 2)} cv`,
          `${cv(resultados.motorComercialCv)} cv`
        ]],
        theme: 'grid',
        headStyles: { fillColor: VERDE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
        styles: { fontSize: 9, cellPadding: 2.5 }
      });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...CINZA);
      pdf.text(
        `Rendimentos adotados: bomba ${numero(entradas.rendimentoBombaPct, 0)}%, motor ${numero(entradas.rendimentoMotorPct, 0)}%. Consumo estimado: ${numero(resultados.consumoDiarioKwh, 1)} kWh/dia em ${numero(resultados.horasPorDia, 1)} h/dia.`,
        14, ultimoY() + 5
      );
      (pdf as any).lastAutoTable.finalY = ultimoY() + 5;

      tituloSecao('3. Bombas do catálogo que atendem', ultimoY() + 9);
      autoTable(pdf, {
        startY: ultimoY() + 12,
        head: [['Modelo', 'Motor', 'Alimentação', 'Bocais', 'Ponto de trabalho', 'Avaliação']],
        body: compativeis.length > 0
          ? compativeis.slice(0, 5).map(m => [
              `${m.bomba.fabricante} ${m.bomba.modelo}`,
              `${cv(m.bomba.potenciaCv)} cv`,
              m.bomba.tensao || m.bomba.fase,
              /submers/i.test(m.bomba.bocalSuccao) ? `saída ${m.bomba.bocalRecalque}` : `${m.bomba.bocalSuccao} / ${m.bomba.bocalRecalque}`,
              `${numero(m.pontoTrabalho.vazaoM3h, 2)} m³/h a ${numero(m.pontoTrabalho.alturaMca, 1)} mca`,
              m.rotulo
            ])
          : [['Nenhum modelo do catálogo atende a este ponto.', '', '', '', '', '']],
        theme: 'grid',
        headStyles: { fillColor: VERDE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2 }
      });

      let y = ultimoY() + 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...CINZA);
      const notas = [
        ...resultados.avisos.filter(w => w.nivel !== 'info').map(w => `Atenção: ${w.mensagem}`),
        'Perdas calculadas por Hazen-Williams com comprimentos equivalentes. As curvas do catálogo são aproximadas: confirme a seleção na curva oficial do fabricante antes da compra.'
      ];
      for (const nota of notas) {
        const linhas = pdf.splitTextToSize(nota, 182);
        if (y + linhas.length * 3.6 > 285) { pdf.addPage(); y = 16; }
        pdf.text(linhas, 14, y);
        y += linhas.length * 3.6 + 1.5;
      }

      y += 16;
      if (y > 280) { pdf.addPage(); y = 40; }
      pdf.setDrawColor(...CINZA);
      pdf.line(20, y, 90, y);
      pdf.line(120, y, 190, y);
      pdf.text('Responsável pelo cálculo', 55, y + 4, { align: 'center' });
      pdf.text('Cliente', 155, y + 4, { align: 'center' });

      const nomeArquivo = (nomeProjeto || 'bomba').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
      pdf.save(`Memorial_${nomeArquivo || 'bomba'}.pdf`);
    } catch (err) {
      console.error(err);
      setFalhou(true);
    } finally {
      setGerando(false);
    }
  };

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Memorial de cálculo em PDF"
      descricao="Para guardar, imprimir ou levar à revenda. Os campos abaixo são opcionais."
      rodape={
        <div className="space-y-2">
          {falhou && <p role="alert" className="text-sm font-medium text-danger">Não foi possível gerar o PDF. Tente de novo.</p>}
          <button type="button" onClick={baixarPdf} disabled={gerando} className="btn btn-primary w-full">
            <Download className="h-5 w-5" aria-hidden="true" />
            {gerando ? 'Gerando PDF…' : 'Baixar PDF'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField rotulo="Projeto" valor={nomeProjeto} aoAlterar={setNomeProjeto} exemplo="Ex.: Irrigação da horta" />
          <TextField rotulo="Cliente" valor={nomeCliente} aoAlterar={setNomeCliente} exemplo="Nome do produtor" />
          <TextField rotulo="Local" valor={local} aoAlterar={setLocal} exemplo="Fazenda, município" />
          <TextField rotulo="Responsável pelo cálculo" valor={responsavel} aoAlterar={setResponsavel} exemplo="Seu nome" />
        </div>
        <dl className="tabular divide-y divide-line rounded-xl bg-sunken px-3.5 text-[15px]">
          <div className="flex justify-between gap-3 py-2"><dt className="text-muted">Vazão</dt><dd className="font-semibold">{numero(resultados.vazaoM3h, 2)} m³/h</dd></div>
          <div className="flex justify-between gap-3 py-2"><dt className="text-muted">Altura manométrica</dt><dd className="font-semibold">{numero(resultados.hmtMca, 1)} mca</dd></div>
          <div className="flex justify-between gap-3 py-2"><dt className="text-muted">Motor</dt><dd className="font-semibold">{cv(resultados.motorComercialCv)} cv</dd></div>
          <div className="flex justify-between gap-3 py-2"><dt className="text-muted">Bombas listadas</dt><dd className="font-semibold">{Math.min(5, compativeis.length)}</dd></div>
        </dl>
      </div>
    </Modal>
  );
};
