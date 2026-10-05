import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
}) => {
  if (!isOpen) return null;
  const isDark = theme === 'dark';

  const SHORTCUTS = [
    { key: 'V', desc: 'Select Tool' },
    { key: 'H or Space+Drag', desc: 'Hand / Pan Canvas' },
    { key: 'R', desc: 'Rectangle (Sharp or Rounded)' },
    { key: 'O', desc: 'Circle Node' },
    { key: 'D', desc: 'Diamond Gateway / Decision' },
    { key: 'B', desc: 'Database Cylinder' },
    { key: 'T', desc: 'Text Box' },
    { key: 'A / L', desc: 'Arrow / Connector (Magnetic Block Snapping & Freeform)' },
    { key: 'P', desc: 'Pen / Freehand Drawing' },
    { key: 'S', desc: 'Sticky Note' },
    { key: 'F', desc: 'Frame / Boundary Group' },
    { key: 'I', desc: 'Inkflow Icon Library (3,940+ Cloud & Tech Icons)' },
    { key: '⌘ / Ctrl + K', desc: 'Spotlight Command Palette & Quick Search' },
    { key: '⌘ / Ctrl + A', desc: 'Select All Nodes' },
    { key: '⌘ / Ctrl + D', desc: 'Duplicate Selected Element' },
    { key: '⌘ / Ctrl + Z', desc: 'Undo Action' },
    { key: '⌘ / Ctrl + Y', desc: 'Redo Action' },
    { key: 'Delete / ⌫', desc: 'Delete Selected Element' },
    { key: 'Esc', desc: 'Deselect All / Reset to Select Tool' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`border rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-[#1E1E1E] border-[#2E2E2E] text-white'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        <div
          className={`flex items-center justify-between pb-4 border-b ${
            isDark ? 'border-[#2E2E2E]' : 'border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-base">
            <Keyboard className={`w-5 h-5 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`} />
            <span>Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'text-neutral-400 hover:text-white hover:bg-[#282828]'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {SHORTCUTS.map((sc, i) => (
            <div
              key={i}
              className={`flex items-center justify-between py-1.5 px-3 rounded-lg border ${
                isDark
                  ? 'bg-[#262626] border-[#333333]'
                  : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <span className={`text-xs ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>{sc.desc}</span>
              <kbd
                className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                  isDark
                    ? 'bg-[#333333] border-[#444444] text-neutral-200'
                    : 'bg-white border-neutral-300 text-neutral-800 shadow-xs'
                }`}
              >
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className={`px-5 py-2 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors ${
              isDark
                ? 'bg-neutral-700 hover:bg-neutral-600'
                : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
