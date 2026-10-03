import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  FolderOpen,
  Download,
  Upload,
  Search,
} from 'lucide-react';
import { EraserDocument } from '../../types/canvas';

interface DocumentSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  documents: EraserDocument[];
  activeDocId: string;
  onSelectDoc: (id: string) => void;
  onCreateDoc: () => void;
  onDeleteDoc: (id: string) => void;
  onExportProject: () => void;
  onImportProject: (e: React.ChangeEvent<HTMLInputElement>) => void;
  theme?: 'light' | 'dark';
}

export const DocumentSidebar: React.FC<DocumentSidebarProps> = ({
  isOpen,
  documents,
  activeDocId,
  onSelectDoc,
  onCreateDoc,
  onDeleteDoc,
  onExportProject,
  onImportProject,
  theme = 'light',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const isDark = theme === 'dark';

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`h-full border-r flex flex-col z-30 select-none transition-all duration-200 ease-in-out shrink-0 overflow-hidden ${
        isOpen ? 'w-72 opacity-100' : 'w-0 opacity-0 border-r-0 pointer-events-none'
      } ${isDark ? 'bg-[#1E1E1E] border-[#2E2E2E]' : 'bg-white border-neutral-200'}`}
    >
      <div className="w-72 h-full flex flex-col shrink-0">
        {/* Top Bar */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-[#2E2E2E]' : 'border-neutral-200'
        }`}>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <FolderOpen className="w-4 h-4 text-neutral-400" />
            <span>Documents</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onCreateDoc}
              className={`p-1.5 rounded-lg transition-colors shadow-2xs ${
                isDark
                  ? 'bg-[#2E2E2E] hover:bg-[#383838] text-white border border-white/10'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
              title="New Document"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className={`p-3 border-b ${isDark ? 'border-[#2E2E2E]' : 'border-neutral-200'}`}>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none transition-colors ${
                isDark
                  ? 'bg-[#262626] border-[#333333] text-neutral-100 placeholder-neutral-500 focus:border-neutral-400'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400'
              }`}
            />
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="text-[10px] uppercase font-mono text-neutral-400 px-3 py-1 font-semibold">
            My Canvases ({documents.length})
          </div>

          {filteredDocs.map((doc) => {
            const isActive = doc.id === activeDocId;
            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                  isActive
                    ? isDark
                      ? 'bg-[#2D2D2D] text-white border border-white/10 font-semibold shadow-2xs'
                      : 'bg-neutral-100 text-neutral-900 border border-neutral-300/80 font-semibold shadow-2xs'
                    : isDark
                      ? 'text-neutral-400 hover:text-white hover:bg-[#262626]'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className={`w-4 h-4 shrink-0 ${isActive ? 'text-neutral-200 dark:text-white' : 'text-neutral-400'}`} />
                  <span className="truncate">{doc.title}</span>
                </div>

                {documents.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete document "${doc.title}"?`)) {
                        onDeleteDoc(doc.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-500 rounded transition-opacity"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Backup / Export / Import */}
        <div className={`p-3 border-t flex items-center justify-between text-xs transition-colors ${
          isDark ? 'border-[#2E2E2E] bg-[#181818] text-neutral-400' : 'border-neutral-200 bg-neutral-50 text-neutral-600'
        }`}>
          <button
            onClick={onExportProject}
            className={`flex items-center gap-1.5 py-1 transition-colors ${
              isDark ? 'hover:text-white' : 'hover:text-neutral-900'
            }`}
            title="Export JSON project backup"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>

          <label className={`flex items-center gap-1.5 py-1 cursor-pointer transition-colors ${
            isDark ? 'hover:text-white' : 'hover:text-neutral-900'
          }`}>
            <Upload className="w-3.5 h-3.5" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={onImportProject}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
