import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HydraulicInputs, HydraulicResults, MatchedPump } from '../engine/types';
import { PIPE_MATERIALS } from '../engine/materialsAndFittings';
import { X, Download, FileText, CheckCircle2, Building2, User, Calendar } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: HydraulicInputs;
  results: HydraulicResults;
  matchedPumps: MatchedPump[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  inputs,
  results,
  matchedPumps
}) => {
  const [clientName, setClientName] = useState('Produtor Rural / Cliente');
  const [projectName, setProjectName] = useState('Instalação Hidráulica');
  const [locationName, setLocationName] = useState('Fazenda / Sítio - IFNMG');
  const [responsibleTech, setResponsibleTech] = useState('Técnico / Responsável');

  if (!isOpen) return null;

  const topPump = matchedPumps.length > 0 ? matchedPumps[0] : null;
  const suctionMat = PIPE_MATERIALS.find(m => m.id === inputs.suctionMaterial)?.name || inputs.suctionMaterial;
  const dischargeMat = PIPE_MATERIALS.find(m => m.id === inputs.dischargeMaterial)?.name || inputs.dischargeMaterial;

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [2, 132, 199]; // Sky 600
    const darkColor = [15, 23, 42]; // Slate 900

    // Header Background
    doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.rect(0, 0, 210, 38, 'F');

    // Title & Logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('LAUDO TÉCNICO DE DIMENSIONAMENTO HIDRÁULICO', 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(186, 230, 253);
    doc.text('HidroCalc PWA - Sistema Inteligente de Seleção de Bombas e Motores', 14, 25);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 31);

    // Project Info Box
    autoTable(doc, {
      startY: 44,
      head: [['Identificação do Projeto & Responsável', 'Localização & Propriedade']],
      body: [
        [
          `Projeto: ${projectName}\nResponsável: ${responsibleTech}`,
          `Cliente/Produtor: ${clientName}\nLocal: ${locationName}`
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 3, textColor: [30, 41, 59] }
    });

    // 1. Hydraulic Data Table
    const startY1 = (doc as any).lastAutoTable.finalY + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('1. PARÂMETROS DA INSTALAÇÃO E MEMÓRIA DE CÁLCULO', 14, startY1);

    autoTable(doc, {
      startY: startY1 + 3,
      head: [['Parâmetro', 'Sucção (Captação)', 'Recalque (Elevação)', 'Total do Sistema']],
      body: [
        ['Desnível Geométrico (m)', inputs.isSubmerged ? 'Submersa (0.0 m)' : `${inputs.suctionHeight.toFixed(1)} m`, `${inputs.dischargeHeight.toFixed(1)} m`, `${results.totalGeometricHeightMca.toFixed(1)} m`],
        ['Comprimento Linear da Tubulação (m)', inputs.isSubmerged ? '-' : `${inputs.suctionLength.toFixed(1)} m`, `${inputs.dischargeLength.toFixed(1)} m`, `${(inputs.suctionLength + inputs.dischargeLength).toFixed(1)} m`],
        ['Perdas Localizadas / Conexões (Leq)', inputs.isSubmerged ? '-' : `+${results.suctionEquivalentLengthM.toFixed(1)} m`, `+${results.dischargeEquivalentLengthM.toFixed(1)} m`, `+${(results.suctionEquivalentLengthM + results.dischargeEquivalentLengthM).toFixed(1)} m eq.`],
        ['Comprimento Total Virtual (L + Leq)', inputs.isSubmerged ? '-' : `${results.suctionTotalLengthM.toFixed(1)} m`, `${results.dischargeTotalLengthM.toFixed(1)} m`, `${(results.suctionTotalLengthM + results.dischargeTotalLengthM).toFixed(1)} m`],
        ['Diâmetro Interno Adotado', inputs.isSubmerged ? '-' : `${inputs.suctionDiameterMm} mm`, `${inputs.dischargeDiameterMm} mm`, '-'],
        ['Material do Tubo (Coef. Hazen C)', inputs.isSubmerged ? '-' : suctionMat, dischargeMat, '-'],
        ['Velocidade do Fluido no Tubo', inputs.isSubmerged ? '-' : `${results.suctionVelocityMs.toFixed(2)} m/s`, `${results.dischargeVelocityMs.toFixed(2)} m/s`, 'Faixa Recomendada: 0.8 a 2.2 m/s'],
        ['Perda de Carga por Atrito (hf)', inputs.isSubmerged ? '0.00 mca' : `${results.suctionLossMca.toFixed(2)} mca`, `${results.dischargeLossMca.toFixed(2)} mca`, `${results.totalHeadLossMca.toFixed(2)} mca`],
        ['Pressão Residual de Saída', '-', '-', `${inputs.residualPressureMca.toFixed(1)} mca`],
        ['Altura Manométrica Total (HMT)', '-', '-', `${results.totalDynamicHeadMca.toFixed(1)} mca`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 2 }
    });

    // 2. Power Requirements Table
    const startY2 = (doc as any).lastAutoTable.finalY + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('2. DIMENSIONAMENTO DE POTÊNCIA DO MOTOR', 14, startY2);

    autoTable(doc, {
      startY: startY2 + 3,
      head: [['Vazão de Projeto', 'Potência Hidráulica', 'Potência no Eixo', 'Motor Comercial Sugerido']],
      body: [
        [
          `${results.flowRateM3h.toFixed(1)} m³/h (${results.flowRateLph.toLocaleString()} L/h)`,
          `${results.hydraulicPowerCv.toFixed(2)} CV (${results.hydraulicPowerKw.toFixed(2)} kW)`,
          `${results.motorShaftPowerCv.toFixed(2)} CV (${results.motorShaftPowerKw.toFixed(2)} kW)`,
          `${results.suggestedCommercialPowerCv} CV (${(results.suggestedCommercialPowerCv * 0.7355).toFixed(2)} kW)`
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8.5, cellPadding: 3, fontStyle: 'bold' }
    });

    // 3. Recommended Pumps Section
    const startY3 = (doc as any).lastAutoTable.finalY + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('3. BOMBAS SELECIONADAS NO BANCO DE DADOS', 14, startY3);

    const pumpRows = matchedPumps.slice(0, 4).map((m, idx) => [
      `${idx + 1}º ${m.pump.brand} ${m.pump.model}`,
      `${m.pump.powerCv} CV (${m.pump.powerKw} kW)`,
      m.pump.phase,
      `Suc: ${m.pump.suctionPortPol} | Rec: ${m.pump.dischargePortPol}`,
      `${m.operatingPoint.flowM3h.toFixed(1)} m³/h @ ${m.operatingPoint.headMca.toFixed(1)} mca`,
      `${m.suitabilityScore}% (${m.statusLabel})`
    ]);

    autoTable(doc, {
      startY: startY3 + 3,
      head: [['Modelo da Motobomba', 'Potência', 'Alimentação Elétrica', 'Conexões', 'Ponto de Operação', 'Compatibilidade']],
      body: pumpRows,
      theme: 'grid',
      headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      styles: { fontSize: 7.8, cellPadding: 2.5 }
    });

    // Footer signature line
    const startY4 = (doc as any).lastAutoTable.finalY + 18;
    if (startY4 < 270) {
      doc.setDrawColor(148, 163, 184);
      doc.line(20, startY4, 90, startY4);
      doc.line(120, startY4, 190, startY4);

      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Responsável Técnico / Projetista', 55, startY4 + 4, { align: 'center' });
      doc.text('Produtor Rural / Cliente', 155, startY4 + 4, { align: 'center' });
    }

    doc.save(`Laudo_Dimensionamento_Bomba_${projectName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-sky-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Memorial Técnico de Dimensionamento
              </h3>
              <p className="text-xs text-slate-400">
                Visualize e baixe o laudo oficial em PDF para compras e execução da obra
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Metadata Inputs */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Dados do Laudo
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300">Nome do Projeto</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Cliente / Produtor</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Localização / Fazenda</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Responsável Técnico</label>
                <input
                  type="text"
                  value={responsibleTech}
                  onChange={e => setResponsibleTech(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Quick Preview of Technical Summary */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider border-b border-slate-800 pb-2">
              Resumo do Laudo Técnico
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[11px]">HMT Total</div>
                <div className="text-base font-bold text-sky-400">{results.totalDynamicHeadMca.toFixed(1)} mca</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Vazão Q</div>
                <div className="text-base font-bold text-cyan-400">{results.flowRateM3h.toFixed(1)} m³/h</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Motor Sugerido</div>
                <div className="text-base font-bold text-emerald-400">{results.suggestedCommercialPowerCv} CV</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Perdas Atrito</div>
                <div className="text-base font-bold text-amber-400">{results.totalHeadLossMca.toFixed(1)} mca</div>
              </div>
            </div>

            {topPump && (
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-emerald-300 font-bold">Principal Bomba Recomendada:</div>
                  <div className="text-sm font-bold text-white">{topPump.pump.brand} {topPump.pump.model} ({topPump.pump.powerCv} CV)</div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-900/60 px-2.5 py-1 rounded-full border border-emerald-700">
                  {topPump.statusLabel}
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Fechar
          </button>
          
          <button
            onClick={handleDownloadPdf}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Laudo Técnico em PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};
