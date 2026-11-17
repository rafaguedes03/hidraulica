import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  title: string;
  description: string;
  example?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  description,
  example
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Click outside listener for mobile tap
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div 
      className="relative inline-flex items-center ml-1.5 align-middle" 
      ref={tooltipRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="text-slate-400 hover:text-sky-400 focus:outline-none focus:text-sky-400 transition-colors p-0.5 rounded-full hover:bg-slate-800/60 cursor-help"
        aria-label={`Ajuda sobre ${title}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 sm:w-72 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="border-b border-slate-800 pb-1.5 mb-1.5">
            <span className="text-xs font-bold text-sky-400">{title}</span>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-300">
            {description}
          </p>

          {example && (
            <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
              <strong className="text-slate-300">Exemplo:</strong> {example}
            </div>
          )}

          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700 w-0 h-0" />
        </div>
      )}
    </div>
  );
};
