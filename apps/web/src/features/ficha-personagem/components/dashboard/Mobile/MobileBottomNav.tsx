import { User, Sword, Backpack, BookOpen } from 'lucide-react';

interface MobileBottomNavProps {
  activeSection: string;
  onChange: (section: string) => void;
}

export function MobileBottomNav({ activeSection, onChange }: MobileBottomNavProps) {
  const tabs = [
    { id: 'geral', label: 'Geral', icon: <User className="w-5 h-5" /> },
    { id: 'combate', label: 'Combate', icon: <Sword className="w-5 h-5" /> },
    { id: 'inventario', label: 'Bolsa', icon: <Backpack className="w-5 h-5" /> },
    { id: 'lore', label: 'Lore', icon: <BookOpen className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 pb-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:hidden">
      {/* pb-safe is helpful if env(safe-area-inset-bottom) is added in global css, but pb-2 works safely enough */}
      <div className="flex items-center justify-around px-2 py-1 pb-[calc(env(safe-area-inset-bottom)_+_4px)]">
        {tabs.map(tab => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center justify-center w-full py-1 gap-0.5 rounded-lg transition-colors ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-purple-100 dark:bg-purple-900/30' : ''}`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  );
}
