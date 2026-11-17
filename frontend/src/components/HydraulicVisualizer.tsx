import React from 'react';
import { HydraulicInputs, HydraulicResults } from '../engine/types';
import { Layers, Activity, ArrowUpRight } from 'lucide-react';

interface HydraulicVisualizerProps {
  inputs: HydraulicInputs;
  results: HydraulicResults;
}

export const HydraulicVisualizer: React.FC<HydraulicVisualizerProps> = ({
  inputs,
  results
}) => {
  const isSubmerged = inputs.isSubmerged;
  const suctionH = isSubmerged ? 0 : inputs.suctionHeight;
  const dischargeH = inputs.dischargeHeight;
  const hmt = results.totalDynamicHeadMca;
  const flow = results.flowRateM3h;

  return (
    <div className="relative rounded-2xl glass-panel p-5 overflow-hidden transition-all duration-300 border border-sky-500/20">
      {/* Background radial glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar of visualizer */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Esquema Hidráulico em Tempo Real
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center text-sky-400 font-semibold bg-sky-950/60 px-2 py-1 rounded-md border border-sky-800/40">
            <Activity className="w-3.5 h-3.5 mr-1 animate-pulse" />
            Vazão: {flow.toFixed(1)} m³/h ({results.flowRateLph.toLocaleString()} L/h)
          </span>
          <span className="flex items-center text-cyan-300 font-semibold bg-cyan-950/60 px-2 py-1 rounded-md border border-cyan-800/40">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
            HMT: {hmt.toFixed(1)} mca
          </span>
        </div>
      </div>

      {/* SVG Canvas Schematic */}
      <div className="w-full h-64 sm:h-72 relative flex items-center justify-center">
        <svg
          viewBox="0 0 700 280"
          className="w-full h-full select-none"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="pumpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            <linearGradient id="tankGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Grid lines for engineering vibe */}
          <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
          <rect width="700" height="280" fill="url(#smallGrid)" />

          {/* ================= 1. RESERVATÓRIO INFERIOR (CAPTAÇÃO) ================= */}
          <g transform="translate(40, 160)">
            {/* Tank structure */}
            <rect x="0" y="0" width="130" height="90" rx="8" fill="url(#tankGrad)" stroke="#334155" strokeWidth="2" />
            {/* Water volume with wave */}
            <path
              d="M 4 25 Q 35 20, 65 25 T 126 25 L 126 86 Q 126 86, 4 86 Z"
              fill="url(#waterGrad)"
              className="animate-pulse"
            />
            {/* Water label */}
            <text x="65" y="60" textAnchor="middle" fill="#bae6fd" fontSize="11" fontWeight="600">
              {isSubmerged ? 'Poço / Aquífero' : 'Captação / Cisterna'}
            </text>
            <text x="65" y="75" textAnchor="middle" fill="#64748b" fontSize="9">
              Nível da Água
            </text>
          </g>

          {/* ================= 2. BOMBA E SUCÇÃO ================= */}
          {isSubmerged ? (
            /* Submerged Pump inside lower tank */
            <g transform="translate(90, 195)">
              <rect x="0" y="0" width="30" height="48" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              {/* Impeller slots */}
              <line x1="5" y1="12" x2="25" y2="12" stroke="#e0f2fe" strokeWidth="1" />
              <line x1="5" y1="20" x2="25" y2="20" stroke="#e0f2fe" strokeWidth="1" />
              <line x1="5" y1="28" x2="25" y2="28" stroke="#e0f2fe" strokeWidth="1" />
              <text x="15" y="42" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">SUB</text>
            </g>
          ) : (
            /* Surface Centrifugal Pump */
            <g>
              {/* Suction Pipe from tank to pump */}
              <path
                d="M 105 210 L 105 130 L 220 130"
                fill="none"
                stroke="url(#pipeGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Animated Water flow line inside suction */}
              <path
                d="M 105 210 L 105 130 L 220 130"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-water-flow"
              />

              {/* Válvula de Pé com crivo */}
              <g transform="translate(98, 205)">
                <rect x="0" y="0" width="14" height="15" rx="3" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                <line x1="2" y1="12" x2="12" y2="12" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="1,1" />
                <text x="7" y="9" textAnchor="middle" fill="#1e293b" fontSize="6" fontWeight="bold">V.PÉ</text>
              </g>

              {/* Suction height annotation */}
              <g transform="translate(130, 140)">
                <text x="0" y="0" fill="#38bdf8" fontSize="10" fontWeight="bold">
                  H. Sucção: {suctionH}m
                </text>
                <text x="0" y="12" fill="#94a3b8" fontSize="8">
                  Ø {inputs.suctionDiameterMm}mm ({results.suctionVelocityMs.toFixed(2)} m/s)
                </text>
              </g>

              {/* Centrifugal Pump Unit */}
              <g transform="translate(230, 110)">
                {/* Motor Base */}
                <rect x="0" y="32" width="65" height="6" rx="2" fill="#334155" />
                {/* Motor Body */}
                <rect x="25" y="5" width="40" height="28" rx="4" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />
                {/* Cooling fins */}
                <line x1="32" y1="8" x2="32" y2="30" stroke="#475569" strokeWidth="1.5" />
                <line x1="40" y1="8" x2="40" y2="30" stroke="#475569" strokeWidth="1.5" />
                <line x1="48" y1="8" x2="48" y2="30" stroke="#475569" strokeWidth="1.5" />
                <line x1="56" y1="8" x2="56" y2="30" stroke="#475569" strokeWidth="1.5" />
                {/* Pump Volute (Caracol) */}
                <circle cx="15" cy="19" r="17" fill="url(#pumpGrad)" stroke="#38bdf8" strokeWidth="2" />
                
                {/* Spinning Impeller Rotor (Fixed in center) */}
                <g transform="translate(15, 19)">
                  <g>
                    <circle cx="0" cy="0" r="11" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                    <line x1="-8" y1="0" x2="8" y2="0" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" />
                    <line x1="0" y1="-8" x2="0" y2="8" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" />
                    <line x1="-5.5" y1="-5.5" x2="5.5" y2="5.5" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="-5.5" y1="5.5" x2="5.5" y2="-5.5" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 0 0"
                      to="360 0 0"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </g>
                  <circle cx="0" cy="0" r="3" fill="#ffffff" />
                </g>

                <text x="32" y="48" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">
                  Bomba
                </text>
              </g>
            </g>
          )}

          {/* ================= 3. TUBULAÇÃO DE RECALQUE ================= */}
          {/* Discharge Pipe: from pump to elevated destination tank */}
          <path
            d={isSubmerged ? "M 105 195 L 105 50 L 530 50 L 530 65" : "M 245 110 L 245 50 L 530 50 L 530 65"}
            fill="none"
            stroke="url(#pipeGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Animated Water flow line inside discharge */}
          <path
            d={isSubmerged ? "M 105 195 L 105 50 L 530 50 L 530 65" : "M 245 110 L 245 50 L 530 50 L 530 65"}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-water-flow"
          />

          {/* Discharge Válvula de Retenção & Registro */}
          <g transform={isSubmerged ? "translate(160, 42)" : "translate(300, 42)"}>
            {/* Check valve */}
            <polygon points="0,0 12,8 0,16" fill="#10b981" />
            <polygon points="12,0 0,8 12,16" fill="#059669" />
            <text x="6" y="24" textAnchor="middle" fill="#6ee7b7" fontSize="7">Retenção</text>
          </g>

          <g transform={isSubmerged ? "translate(220, 40)" : "translate(360, 40)"}>
            {/* Gate valve */}
            <polygon points="0,3 10,10 0,17" fill="#ef4444" />
            <polygon points="20,3 10,10 20,17" fill="#ef4444" />
            <line x1="10" y1="3" x2="10" y2="-4" stroke="#ef4444" strokeWidth="2" />
            <circle cx="10" cy="-5" r="4" fill="#dc2626" />
            <text x="10" y="25" textAnchor="middle" fill="#fca5a5" fontSize="7">Registro</text>
          </g>

          {/* Discharge Pipe Specs Annotation */}
          <g transform={isSubmerged ? "translate(270, 30)" : "translate(400, 30)"}>
            <text x="0" y="0" fill="#38bdf8" fontSize="10" fontWeight="bold">
              Recalque: {inputs.dischargeLength}m (Desnível: {dischargeH}m)
            </text>
            <text x="0" y="11" fill="#94a3b8" fontSize="8">
              Ø {inputs.dischargeDiameterMm}mm | Vel: {results.dischargeVelocityMs.toFixed(2)} m/s
            </text>
          </g>

          {/* ================= 4. RESERVATÓRIO SUPERIOR (DESTINO) ================= */}
          <g transform="translate(520, 60)">
            {/* Tank Stand / Tower Structure */}
            <line x1="20" y1="90" x2="15" y2="180" stroke="#475569" strokeWidth="3" />
            <line x1="110" y1="90" x2="115" y2="180" stroke="#475569" strokeWidth="3" />
            <line x1="15" y1="130" x2="115" y2="130" stroke="#334155" strokeWidth="2" />
            <line x1="15" y1="170" x2="115" y2="170" stroke="#334155" strokeWidth="2" />
            <line x1="15" y1="90" x2="115" y2="170" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="115" y1="90" x2="15" y2="170" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

            {/* Elevated Tank Body */}
            <rect x="0" y="0" width="130" height="90" rx="8" fill="url(#tankGrad)" stroke="#38bdf8" strokeWidth="2" />
            {/* Water in destination tank */}
            <path
              d="M 4 35 Q 35 30, 65 35 T 126 35 L 126 86 Q 126 86, 4 86 Z"
              fill="url(#waterGrad)"
            />
            {/* Water inlet splash */}
            <circle cx="10" cy="35" r="3" fill="#bae6fd" opacity="0.8">
              <animate attributeName="r" values="2;5;2" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
            </circle>

            <text x="65" y="55" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
              Reservatório Destino
            </text>
            <text x="65" y="70" textAnchor="middle" fill="#7dd3fc" fontSize="9">
              Caixa / Irrigação
            </text>
          </g>

          {/* ================= 5. COTA VERTICAL DE HMT ================= */}
          <g transform="translate(670, 40)">
            <line x1="0" y1="10" x2="0" y2="200" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />
            <polygon points="-4,10 0,2 4,10" fill="#38bdf8" />
            <polygon points="-4,200 0,208 4,200" fill="#38bdf8" />
            <text x="-8" y="110" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold" transform="rotate(-90 -8 110)">
              HMT Total: {hmt.toFixed(1)} mca
            </text>
          </g>
        </svg>
      </div>

      {/* Footer stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-center">
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">Desnível Geométrico</div>
          <div className="text-sm font-bold text-white">
            {results.totalGeometricHeightMca.toFixed(1)} m
          </div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">Perda de Carga Total</div>
          <div className="text-sm font-bold text-amber-400">
            {results.totalHeadLossMca.toFixed(2)} mca
          </div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">Potência Recomendada</div>
          <div className="text-sm font-bold text-emerald-400">
            {results.suggestedCommercialPowerCv} CV ({results.motorShaftPowerKw.toFixed(2)} kW)
          </div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">Rendimento do Sistema</div>
          <div className="text-sm font-bold text-sky-400">
            {((inputs.pumpEfficiencyPct * inputs.motorEfficiencyPct) / 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
};
