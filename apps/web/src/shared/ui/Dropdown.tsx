import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  icon?: React.ReactNode;
  className?: string;
  label?: string;
}

export function Dropdown({
  value,
  onChange,
  options,
  icon,
  className = '',
  label,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5 ml-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-3 
          bg-white dark:bg-slate-900 
          rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 
          hover:ring-purple-500/50 transition-all duration-300
          text-sm font-bold text-gray-700 dark:text-gray-200
          min-w-[160px] justify-between
          ${isOpen ? 'ring-2 ring-purple-500 shadow-purple-500/10 scale-[1.02]' : ''}
        `}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-400">{icon}</span>}
          <span>{selectedOption?.label || 'Selecionar...'}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-purple-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="
          absolute right-0 z-50 mt-2 w-full min-w-[200px] origin-top-right 
          rounded-2xl bg-white dark:bg-slate-900 
          shadow-2xl ring-1 ring-black/5 dark:ring-white/10 
          backdrop-blur-xl dark:bg-slate-900/95
          overflow-hidden animate-in fade-in zoom-in-95 duration-200
        ">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  flex items-center justify-between w-full px-4 py-3 text-sm font-medium
                  transition-colors duration-200
                  ${
                    option.value === value
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                  }
                `}
              >
                <span>{option.label}</span>
                {option.value === value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
