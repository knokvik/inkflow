import React, { useState, useEffect } from 'react';
import { CanvasElement } from '../../types/canvas';
import { serializeToEraserDSL, parseEraserDSL } from '../../utils/eraserDSL';
import { X, Code, Play, Copy, Check } from 'lucide-react';

interface DiagramCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasElements: CanvasElement[];
  onApplyCode: (elements: CanvasElement[]) => void;
}

export const DiagramCodeModal: React.FC<DiagramCodeModalProps> = ({
  isOpen,
  onClose,
  canvasElements,
  onApplyCode,
}) => {
  const [dslCode, setDslCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDslCode(serializeToEraserDSL(canvasElements));
    }
  }, [isOpen, canvasElements]);

  if (!isOpen) return null;

  const handleApply = () => {
    try {
      const parsed = parseEraserDSL(dslCode);
      if (parsed.length > 0) {
        onApplyCode(parsed);
        onClose();
      }
    } catch (e: any) {
      alert(`Error parsing diagram code: ${e.message}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(dslCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2E2E2E] bg-[#181818]">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">Inkflow Diagram-as-Code</h2>
              <p className="text-xs text-neutral-400">Bidirectional text DSL synchronization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-[#282828] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Editor */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col bg-[#141414]">
          <div className="text-[11px] font-mono text-neutral-400 mb-2 flex items-center justify-between">
            <span>Syntax: [NodeID [attrs] | Node1 &gt; Node2 [label: "foo"]]</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-neutral-400 hover:text-white"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <textarea
            value={dslCode}
            onChange={(e) => setDslCode(e.target.value)}
            className="w-full h-80 bg-[#1E1E1E] border border-[#333333] rounded-xl p-3.5 text-xs text-emerald-300 font-mono resize-none focus:outline-none focus:border-neutral-500 leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#2E2E2E] bg-[#181818] flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Edit text above and apply to instantly reconstruct the canvas layout.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-neutral-400 hover:text-white rounded-xl hover:bg-[#282828]"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 text-xs bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Apply to Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
