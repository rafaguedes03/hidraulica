import React from 'react';
import { FittingItem } from '../engine/types';
import { FITTING_DEFINITIONS, getClosestNominalDiameter } from '../engine/materialsAndFittings';
import { X, Plus, Minus, Check, HelpCircle } from 'lucide-react';

interface FittingSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pipeType: 'suction' | 'discharge';
  diameterMm: number;
  selectedFittings: FittingItem[];
  onChange: (fittings: FittingItem[]) => void;
}

export const FittingSelectorModal: React.FC<FittingSelectorModalProps> = ({
  isOpen,
  onClose,
  title,
  pipeType,
  diameterMm,
  selectedFittings,
  onChange
}) => {
  if (!isOpen) return null;

  const nominalMm = getClosestNominalDiameter(diameterMm);

  const getQuantity = (fittingId: string) => {
    const item = selectedFittings.find(f => f.fittingId === fittingId);
    return item ? item.quantity : 0;
  };

  const handleUpdate = (fittingId: any, delta: number) => {
    const current = getQuantity(fittingId);
    const nextQty = Math.max(0, current + delta);
    
    let updated: FittingItem[];
    if (nextQty === 0) {
      updated = selectedFittings.filter(f => f.fittingId !== fittingId);
    } else {
      const exists = selectedFittings.some(f => f.fittingId === fittingId);
      if (exists) {
        updated = selectedFittings.map(f => 
          f.fittingId === fittingId ? { ...f, quantity: nextQty } : f
        );
      } else {
        updated = [...selectedFittings, { fittingId, quantity: nextQty }];
      }
    }
    onChange(updated);
  };

  // Calculate total equivalent length
  const totalEqLength = selectedFittings.reduce((acc, item) => {
    const def = FITTING_DEFINITIONS.find(f => f.id === item.fittingId);
    const len = def ? (def.equivalentLengths[nominalMm] || 0) : 0;
    return acc + len * item.quantity;
  }, 0);

  // Group definitions by category
  const categories = [
    { id: 'valvulas', name: 'Válvulas (Pé, Retenção)' },
    { id: 'curvas', name: 'Curvas e Joelhos (Cotovelos)' },
    { id: 'registros', name: 'Registros de Controle' },
    { id: 'conexoes', name: 'Tês e Saídas' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-sky-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{title}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                Ø Nominal: {nominalMm}mm
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Adicione as conexões presentes na tubulação para cálculo das perdas localizadas (Leq)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - List of Categories & Fittings */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {categories.map(cat => {
            const itemsInCat = FITTING_DEFINITIONS.filter(f => f.category === cat.id);
            return (
              <div key={cat.id} className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400/90 border-b border-slate-800 pb-1">
                  {cat.name}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {itemsInCat.map(def => {
                    const qty = getQuantity(def.id);
                    const unitEq = def.equivalentLengths[nominalMm] || 0;

                    return (
                      <div
                        key={def.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                          qty > 0
                            ? 'bg-sky-950/40 border-sky-500/50 shadow-sm'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex-1 pr-2">
                          <div className="text-xs font-semibold text-slate-200">
                            {def.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            +{unitEq.toFixed(1)}m de tubo equivalente
                          </div>
                        </div>

                        {/* Quantity Counter Buttons */}
                        <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                          <button
                            onClick={() => handleUpdate(def.id, -1)}
                            disabled={qty === 0}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className={`w-6 text-center text-xs font-bold ${qty > 0 ? 'text-sky-300' : 'text-slate-500'}`}>
                            {qty}
                          </span>
                          <button
                            onClick={() => handleUpdate(def.id, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-sky-400 hover:text-white hover:bg-sky-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Summary */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Comprimento Equivalente Total:</div>
            <div className="text-lg font-bold text-sky-400">
              +{totalEqLength.toFixed(1)} metros de perda adicional
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar Conexões</span>
          </button>
        </div>

      </div>
    </div>
  );
};
