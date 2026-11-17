import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceDot 
} from 'recharts';
import { PumpModel, HydraulicResults } from '../engine/types';
import { getPumpHeadAtFlow } from '../engine/pumpMatcher';
import { TrendingUp, Target } from 'lucide-react';

interface PumpCurveChartProps {
  pump: PumpModel;
  results: HydraulicResults;
  operatingPoint: {
    flowM3h: number;
    headMca: number;
    efficiencyPct: number;
  };
}

export const PumpCurveChart: React.FC<PumpCurveChartProps> = ({
  pump,
  results,
  operatingPoint
}) => {
  const maxFlow = Math.max(pump.maxFlowM3h * 1.08, results.flowRateM3h * 1.4, 4);
  const staticHead = results.totalGeometricHeightMca;

  // Generate 180 high-density interpolation points for smooth, continuous hover
  const chartData = useMemo(() => {
    const points: Array<{
      flow: number;
      pumpHead: number | null;
      systemHead: number | null;
    }> = [];

    const numSamples = 180;
    const step = maxFlow / numSamples;

    // Collect discrete steps plus exact critical points (operating point)
    const flowValues = new Set<number>();
    
    for (let i = 0; i <= numSamples; i++) {
      flowValues.add(Math.round((i * step) * 100) / 100);
    }
    if (operatingPoint.flowM3h > 0 && operatingPoint.flowM3h <= maxFlow) {
      flowValues.add(Math.round(operatingPoint.flowM3h * 100) / 100);
    }

    const sortedFlows = Array.from(flowValues).sort((a, b) => a - b);

    for (const q of sortedFlows) {
      let hPump: number | null = null;
      if (q <= pump.maxFlowM3h) {
        hPump = Math.round(getPumpHeadAtFlow(pump, q) * 100) / 100;
      }

      const hSys = Math.round((staticHead + results.systemCurveK * Math.pow(q, 1.852)) * 100) / 100;

      points.push({
        flow: q,
        pumpHead: hPump,
        systemHead: hSys
      });
    }

    return points;
  }, [pump, results, operatingPoint, maxFlow, staticHead]);

  // Clean custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const currentFlow = Number(label);
    const isAtOperatingPoint = Math.abs(currentFlow - operatingPoint.flowM3h) < 0.05 && operatingPoint.flowM3h > 0;
    
    const pumpVal = payload.find((p: any) => p.dataKey === 'pumpHead')?.value;
    const sysVal = payload.find((p: any) => p.dataKey === 'systemHead')?.value;

    return (
      <div className={`p-3 rounded-xl border text-xs shadow-2xl transition-all ${
        isAtOperatingPoint 
          ? 'bg-slate-950 border-emerald-500 ring-1 ring-emerald-500/40' 
          : 'bg-slate-900/95 border-slate-700'
      }`}>
        <div className="flex items-center justify-between gap-3 text-slate-400 font-semibold mb-1 pb-1 border-b border-slate-800">
          <span>Vazão: <strong className="text-white">{currentFlow.toFixed(2)} m³/h</strong></span>
          {isAtOperatingPoint && (
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
              Ponto de Operação
            </span>
          )}
        </div>

        <div className="space-y-1">
          {pumpVal !== null && pumpVal !== undefined && (
            <div className="flex items-center justify-between space-x-3">
              <span className="text-sky-400">Curva Bomba H(Q):</span>
              <strong className="text-white font-mono">{Number(pumpVal).toFixed(2)} mca</strong>
            </div>
          )}

          {sysVal !== null && sysVal !== undefined && (
            <div className="flex items-center justify-between space-x-3">
              <span className="text-amber-400">Curva Instalação:</span>
              <strong className="text-white font-mono">{Number(sysVal).toFixed(2)} mca</strong>
            </div>
          )}

          {isAtOperatingPoint && (
            <div className="mt-1.5 pt-1 border-t border-slate-800 text-[11px] text-emerald-300 flex justify-between">
              <span>Rendimento da Bomba (η):</span>
              <strong>{operatingPoint.efficiencyPct}%</strong>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
      
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-400">
            <TrendingUp className="w-4 h-4" />
            <span>Curva Característica: {pump.brand} {pump.model}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Gráfico de alta resolução com curvas de desempenho da motobomba e perda de carga da instalação.
          </p>
        </div>

        {/* Operating Point Badge */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Ponto de Operação:</span>
          <strong className="text-emerald-300 font-mono">
            {operatingPoint.flowM3h.toFixed(1)} m³/h @ {operatingPoint.headMca.toFixed(1)} mca
          </strong>
          <span className="text-emerald-400 text-[11px] font-semibold">
            (η: {operatingPoint.efficiencyPct}%)
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            
            <XAxis 
              dataKey="flow" 
              type="number"
              domain={[0, Math.ceil(maxFlow)]}
              stroke="#64748b" 
              fontSize={11}
              tickCount={10}
              label={{ value: 'Vazão Q (m³/h)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
            />
            
            <YAxis 
              stroke="#64748b" 
              fontSize={11}
              label={{ value: 'Altura H (mca)', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', fontSize: 11 }}
            />
            
            <Tooltip content={<CustomTooltip />} />

            <Legend 
              verticalAlign="top" 
              height={30} 
              wrapperStyle={{ fontSize: '11px', paddingTop: '0px' }} 
            />

            {/* Pump Curve */}
            <Line 
              type="monotone" 
              dataKey="pumpHead" 
              name="Curva da Bomba H(Q)" 
              stroke="#38bdf8" 
              strokeWidth={2.5} 
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 4, stroke: '#38bdf8', strokeWidth: 2, fill: '#ffffff' }}
            />

            {/* System Characteristic Curve */}
            <Line 
              type="monotone" 
              dataKey="systemHead" 
              name="Curva do Sistema Hsis(Q)" 
              stroke="#f59e0b" 
              strokeWidth={2} 
              strokeDasharray="4 2"
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 4, stroke: '#f59e0b', strokeWidth: 2, fill: '#ffffff' }}
            />

            {/* Operating Point Target Marker (reduced size by 50%) */}
            {operatingPoint.flowM3h > 0 && (
              <ReferenceDot
                x={operatingPoint.flowM3h}
                y={operatingPoint.headMca}
                r={3.5}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={1.5}
                label={{
                  value: `Ponto de Operação (${operatingPoint.flowM3h.toFixed(1)} m³/h, ${operatingPoint.headMca.toFixed(1)} mca)`,
                  position: 'top',
                  fill: '#34d399',
                  fontSize: 10,
                  fontWeight: 'bold'
                }}
              />
            )}

          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend details */}
      <div className="flex items-center text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded-lg border border-slate-800/80">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
          <span>Ponto Verde: Ponto de Operação na tubulação calculada.</span>
        </span>
      </div>

    </div>
  );
};
