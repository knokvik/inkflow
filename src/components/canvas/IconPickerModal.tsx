import React, { useState, useMemo, useEffect } from 'react';
import { ICON_CATALOG, ICON_CATEGORIES, IconDefinition } from '../../constants/icons';
import { Search, X, Check } from 'lucide-react';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (icon: IconDefinition) => void;
  theme?: 'light' | 'dark';
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectIcon,
  theme = 'light',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [displayLimit, setDisplayLimit] = useState(120);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const isDark = theme === 'dark';

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredIcons = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return ICON_CATALOG.filter((icon) => {
      const matchesCat = activeCategory === 'all' || icon.category === activeCategory;
      if (!matchesCat) return false;
      if (!term) return true;
      return (
        icon.name.toLowerCase().includes(term) ||
        icon.id.toLowerCase().includes(term) ||
        icon.tags.some((t) => t.toLowerCase().includes(term))
      );
    });
  }, [searchTerm, activeCategory]);

  const visibleIcons = useMemo(() => {
    return filteredIcons.slice(0, displayLimit);
  }, [filteredIcons, displayLimit]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-all duration-200 animate-in zoom-in-95 ${
          isDark ? 'bg-[#1E1E1E] border-[#2E2E2E]' : 'bg-white border-neutral-200'
        }`}
      >
        {/* Header with Eraser Branding */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? 'border-[#2E2E2E] bg-[#181818]' : 'border-neutral-200 bg-neutral-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <img
              src={isDark ? '/inkflow-logo-dark.png' : '/inkflow-logo-light.png'}
              alt="Inkflow"
              className="w-7 h-7 object-contain drop-shadow-sm"
            />
            <div>
              <h2
                className={`text-base font-bold flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-neutral-900'
                }`}
              >
                Inkflow Icon Library
                <span className={`text-[11px] font-normal px-2 py-0.5 rounded-full font-mono border ${
                  isDark
                    ? 'bg-[#2E2E2E] text-neutral-300 border-[#3E3E3E]'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                }`}>
                  3,900+ official icons
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Official cloud providers (AWS, Azure, GCP), tech stacks, databases, and shapes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'text-neutral-400 hover:text-white hover:bg-[#282828]'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div
          className={`p-4 border-b ${
            isDark ? 'border-[#2E2E2E] bg-[#181818]' : 'border-neutral-200 bg-neutral-50'
          }`}
        >
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search icons (e.g. EC2, S3, Docker, Kubernetes, React, Postgres, Redis, Router)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setDisplayLimit(120);
              }}
              className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-colors ${
                isDark
                  ? 'bg-[#262626] border-[#383838] text-neutral-200 placeholder-neutral-500 focus:border-neutral-400'
                  : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 shadow-xs'
              }`}
              autoFocus
            />
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto mt-3 pb-1 scrollbar-none">
            {ICON_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setDisplayLimit(120);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? isDark
                      ? 'bg-neutral-200 text-neutral-900 font-semibold shadow-xs'
                      : 'bg-neutral-800 text-white font-semibold shadow-xs'
                    : isDark
                    ? 'bg-[#262626] text-neutral-400 hover:text-neutral-200 hover:bg-[#333333]'
                    : 'bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Icons Grid */}
        <div className="p-6 overflow-y-auto max-h-[52vh] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {visibleIcons.map((icon) => {
            const iconSrc = icon.iconUrl || `/icons/${icon.id}.svg`;
            return (
              <button
                key={icon.id}
                onClick={() => {
                  setSelectedIconId(icon.id);
                  setTimeout(() => {
                    onSelectIcon(icon);
                    onClose();
                    setSelectedIconId(null);
                  }, 120);
                }}
                className={`group flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-150 hover:scale-[1.04] active:scale-95 shadow-xs text-center cursor-pointer ${
                  selectedIconId === icon.id
                    ? isDark
                      ? 'ring-2 ring-white/30 scale-95 bg-white/10'
                      : 'ring-2 ring-neutral-400 scale-95 bg-neutral-100'
                    : ''
                } ${
                  isDark
                    ? 'border-[#2A2A2A] hover:border-neutral-500 bg-[#242424] hover:bg-[#2C2C2C]'
                    : 'border-neutral-200 hover:border-neutral-400 bg-white hover:bg-neutral-50'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 p-1.5 transition-all shadow-2xs group-hover:scale-105"
                  style={{
                    backgroundColor: isDark ? `${icon.color}1c` : (icon.bgColor || `${icon.color}15`),
                    border: `1.5px solid ${icon.color}35`,
                  }}
                >
                  <img
                    src={iconSrc}
                    alt={icon.name}
                    className="w-8 h-8 object-contain pointer-events-none drop-shadow-xs"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <span
                  className={`text-xs font-semibold truncate max-w-full leading-snug px-1 ${
                    isDark
                      ? 'text-neutral-200 group-hover:text-white'
                      : 'text-neutral-800 group-hover:text-neutral-900'
                  }`}
                  title={icon.name}
                >
                  {icon.name}
                </span>
                <span
                  className="text-[10px] uppercase font-mono mt-1 font-semibold truncate max-w-full px-1.5 py-0.5 rounded-md"
                  style={{
                    color: icon.color,
                    backgroundColor: isDark ? `${icon.color}20` : `${icon.color}12`,
                  }}
                >
                  {icon.categoryLabel || icon.category}
                </span>
              </button>
            );
          })}

          {filteredIcons.length === 0 && (
            <div className="col-span-full py-12 text-center text-neutral-400">
              No matching icons found for "{searchTerm}".
            </div>
          )}

          {filteredIcons.length > displayLimit && (
            <div className="col-span-full py-3 text-center">
              <button
                onClick={() => setDisplayLimit((prev) => prev + 120)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-xs ${
                  isDark
                    ? 'bg-neutral-700 text-white hover:bg-neutral-600'
                    : 'bg-neutral-800 text-white hover:bg-neutral-700'
                }`}
              >
                Load more ({filteredIcons.length - displayLimit} remaining)
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t text-xs flex items-center justify-between ${
            isDark ? 'border-[#2E2E2E] bg-[#181818] text-neutral-400' : 'border-neutral-200 bg-neutral-50 text-neutral-600'
          }`}
        >
          <span>
            Showing {Math.min(visibleIcons.length, filteredIcons.length)} of {filteredIcons.length} official icons
          </span>
          <span className="font-mono text-[11px] text-neutral-400">Click icon to insert onto canvas</span>
        </div>
      </div>
    </div>
  );
};
