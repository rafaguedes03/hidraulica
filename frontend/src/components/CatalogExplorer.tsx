import React, { useState } from 'react';
import { PumpModel } from '../engine/types';
import { PUMP_CATALOG } from '../engine/pumpCatalogData';
import { 
  X, 
  Search, 
  Filter, 
  ExternalLink, 
  Zap, 
  Layers, 
  DollarSign, 
  BookOpen,
  CheckCircle2
} from 'lucide-react';

interface CatalogExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPumpForSizing?: (pump: PumpModel) => void;
}

export const CatalogExplorer: React.FC<CatalogExplorerProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  if (!isOpen) return null;

  const brands = ['all', ...Array.from(new Set(PUMP_CATALOG.map(p => p.brand)))];
  const types = [
    { id: 'all', label: 'Todos os Tipos' },
    { id: 'centrifuga', label: 'Centrífugas' },
    { id: 'submersivel', label: 'Submersíveis' },
    { id: 'periferica', label: 'Periféricas' },
    { id: 'autoaspirante', label: 'Autoaspirantes' },
    { id: 'solar', label: 'Solares DC' }
  ];

  const filteredPumps = PUMP_CATALOG.filter(p => {
    const matchesSearch = 
      p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.features.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;
    const matchesType = selectedType === 'all' || p.type === selectedType;

    return matchesSearch && matchesBrand && matchesType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-sky-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Catálogo Técnico de Bombas Hidráulicas
              </h3>
              <p className="text-xs text-slate-400">
                Base de dados de modelos comerciais disponíveis para consulta e dimensionamento offline
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

        {/* Search & Filter Controls */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar modelo, marca, aplicação..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:border-sky-500"
            >
              {brands.map(b => (
                <option key={b} value={b}>
                  {b === 'all' ? 'Todos os Fabricantes' : `Fabricante: ${b}`}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:border-sky-500"
            >
              {types.map(t => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Pumps Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPumps.map(pump => (
              <div
                key={pump.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-slate-800 text-sky-400 border border-slate-700">
                      {pump.brand}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {pump.approxPriceBrl ? `R$ ${pump.approxPriceBrl.toFixed(2)}` : 'Consulte'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-2">
                    {pump.model}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mt-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <div>
                      <span className="text-slate-500">Potência: </span>
                      <strong>{pump.powerCv} CV</strong> ({pump.powerKw} kW)
                    </div>
                    <div>
                      <span className="text-slate-500">Tipo: </span>
                      <span className="capitalize">{pump.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Vazão Máx: </span>
                      <span>{pump.maxFlowM3h} m³/h</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Altura Máx: </span>
                      <span>{pump.maxHeadMca} mca</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-2 space-y-1">
                    {pump.features.slice(0, 2).map((f, i) => (
                      <div key={i} className="flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Bocais: {pump.suctionPortPol} x {pump.dischargePortPol}
                  </span>

                  {pump.manualUrl && (
                    <a
                      href={pump.manualUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      <span>Manual Técnico</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Total de {filteredPumps.length} modelos encontrados na base</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Fechar Catálogo
          </button>
        </div>

      </div>
    </div>
  );
};
