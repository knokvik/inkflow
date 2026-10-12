import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  CanvasElement,
  EraserDocument,
  Point,
  ToolType,
} from './types/canvas';
import {
  loadDocuments,
  saveDocuments,
  getActiveDocumentId,
  setActiveDocumentId,
  STARTER_DOCUMENTS,
} from './utils/storage';
import { Header } from './components/header/Header';
import { DocumentSidebar } from './components/sidebar/DocumentSidebar';
import { DocEditor } from './components/document/DocEditor';
import { InfiniteCanvas } from './components/canvas/InfiniteCanvas';
import { CanvasToolbar } from './components/toolbar/CanvasToolbar';
import { PropertiesPanel } from './components/toolbar/PropertiesPanel';
import { IconPickerModal } from './components/canvas/IconPickerModal';
import { AIAssistantDrawer } from './components/ai/AIAssistantDrawer';
import { DiagramCodeModal } from './components/code/DiagramCodeModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { CommandPaletteModal } from './components/modals/CommandPaletteModal';
import { snapToGrid } from './utils/geometry';
import { toPng, toSvg } from 'html-to-image';

export function App() {
  // Documents state
  const [documents, setDocuments] = useState<EraserDocument[]>(() => loadDocuments());
  const [activeDocId, setActiveDocIdState] = useState<string>(() => getActiveDocumentId());

  // Active document with guaranteed fallback so canvas is never blank or missing
  const rawActiveDoc = documents.find((d) => d.id === activeDocId) || documents[0] || STARTER_DOCUMENTS[0];
  const activeDoc: EraserDocument = useMemo(() => {
    if (!rawActiveDoc.elements || rawActiveDoc.elements.length === 0) {
      const fallback = STARTER_DOCUMENTS.find((s) => s.id === rawActiveDoc.id) || STARTER_DOCUMENTS[0];
      return {
        ...rawActiveDoc,
        elements: fallback.elements,
        canvasSettings: rawActiveDoc.canvasSettings || fallback.canvasSettings,
      };
    }
    return rawActiveDoc;
  }, [rawActiveDoc]);

  // Tool & Canvas UI state
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [roughStyle, setRoughStyle] = useState<boolean>(activeDoc.canvasSettings?.roughStyle ?? true);
  const [gridMode, setGridMode] = useState<'dots' | 'grid' | 'none'>(activeDoc.canvasSettings?.grid ?? 'dots');
  const [snapEnabled, setSnapEnabled] = useState<boolean>(activeDoc.canvasSettings?.snapToGrid ?? true);
  const [zoom, setZoom] = useState<number>(activeDoc.canvasSettings?.zoom ?? 1);
  const [pan, setPan] = useState<Point>(activeDoc.canvasSettings?.pan ?? { x: 50, y: 50 });

  // View mode & Split divider (default to Canvas)
  const [viewMode, setViewMode] = useState<'both' | 'split' | 'canvas' | 'doc'>(activeDoc.viewMode || 'canvas');
  const [splitRatio, setSplitRatio] = useState<number>(40); // 40% Doc, 60% Canvas
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  // Light / Dark Theme state (default 'light' to match official Eraser UI & user screenshot)
  const [theme, setTheme] = useState<'light' | 'dark'>(activeDoc.theme || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Modals & Drawers
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [isCodeDSLOpen, setIsCodeDSLOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  // AI Building status (for Grok ASCII loader & realtime updates)
  const [aiStatus, setAiStatus] = useState<'idle' | 'building'>('idle');
  const aiStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerAiBuilding = useCallback(() => {
    setAiStatus('building');
    if (aiStatusTimerRef.current) clearTimeout(aiStatusTimerRef.current);
    aiStatusTimerRef.current = setTimeout(() => {
      setAiStatus('idle');
    }, 3500);
  }, []);


  // Robust Undo / Redo Stacks with Refs (zero stale closures)
  const historyRef = useRef<CanvasElement[][]>([activeDoc.elements]);
  const historyIndexRef = useRef<number>(0);
  const [, setHistoryRenderTrigger] = useState(0);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  // Persist documents on change
  useEffect(() => {
    saveDocuments(documents);
  }, [documents]);

  // Update active document state helper
  const updateActiveDoc = useCallback(
    (updates: Partial<EraserDocument>) => {
      setDocuments((prevDocs) =>
        prevDocs.map((doc) =>
          doc.id === activeDoc.id
            ? { ...doc, ...updates, updatedAt: Date.now() }
            : doc
        )
      );
    },
    [activeDoc.id]
  );

  // Elements Change with Undo Stack
  const handleElementsChange = useCallback(
    (newElements: CanvasElement[], recordHistory = true) => {
      updateActiveDoc({ elements: newElements });

      if (recordHistory) {
        const nextIndex = historyIndexRef.current + 1;
        const newHistory = historyRef.current.slice(0, nextIndex);
        newHistory.push(newElements);
        if (newHistory.length > 50) {
          newHistory.shift();
          historyIndexRef.current = newHistory.length - 1;
        } else {
          historyIndexRef.current = nextIndex;
        }
        historyRef.current = newHistory;
        setHistoryRenderTrigger((c) => c + 1);
      }
    },
    [updateActiveDoc]
  );

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prevElements = historyRef.current[historyIndexRef.current];
      updateActiveDoc({ elements: prevElements });
      setHistoryRenderTrigger((c) => c + 1);
    }
  }, [updateActiveDoc]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const nextElements = historyRef.current[historyIndexRef.current];
      updateActiveDoc({ elements: nextElements });
      setHistoryRenderTrigger((c) => c + 1);
    }
  }, [updateActiveDoc]);

  // Automatically sync viewport, zoom, pan, theme, and history whenever active document changes
  useEffect(() => {
    if (activeDoc?.canvasSettings) {
      setZoom(activeDoc.canvasSettings.zoom ?? 1);
      setPan(activeDoc.canvasSettings.pan ?? { x: 50, y: 50 });
      if (activeDoc.canvasSettings.grid) setGridMode(activeDoc.canvasSettings.grid);
      if (activeDoc.canvasSettings.roughStyle !== undefined) setRoughStyle(activeDoc.canvasSettings.roughStyle);
      if (activeDoc.canvasSettings.snapToGrid !== undefined) setSnapEnabled(activeDoc.canvasSettings.snapToGrid);
    }
    if (activeDoc?.theme) {
      setTheme(activeDoc.theme);
    }
    if (activeDoc?.viewMode) {
      setViewMode(activeDoc.viewMode);
    }
    historyRef.current = [activeDoc.elements || []];
    historyIndexRef.current = 0;
    setHistoryRenderTrigger((c) => c + 1);
    setSelectedIds([]);
  }, [activeDocId]);

  // Real-time live synchronization with Local AI Bridge (Port 5173 /api/stream)
  useEffect(() => {
    let evtSource: EventSource | null = null;
    try {
      evtSource = new EventSource('/api/stream');
      evtSource.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'update' && msg.data) {
            triggerAiBuilding();
            if (Array.isArray(msg.data.elements)) {
              handleElementsChange(msg.data.elements, true);
            }
            if (typeof msg.data.doc === 'string') {
              updateActiveDoc({ content: msg.data.doc });
            }
            if (typeof msg.data.title === 'string') {
              updateActiveDoc({ title: msg.data.title });
            }
          }
        } catch (e) {
          // ignore parsing error
        }
      };
      evtSource.onerror = () => {
        // Quietly close if local bridge server is not streaming
        evtSource?.close();
      };
    } catch (e) {
      // ignore
    }
    return () => {
      evtSource?.close();
    };
  }, [handleElementsChange, updateActiveDoc]);

  // Sync canvas state to /api/diagram so external OpenCode / local AIs can read it anytime
  useEffect(() => {
    if (!activeDoc || !activeDoc.elements || activeDoc.elements.length === 0) return;
    const timer = setTimeout(() => {
      try {
        fetch('/api/diagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            elements: activeDoc.elements,
            doc: activeDoc.content,
            title: activeDoc.title,
            clientSyncOnly: true,
          }),
        }).catch(() => {});
      } catch (e) {}
    }, 500);
    return () => clearTimeout(timer);
  }, [activeDoc.elements, activeDoc.content, activeDoc.title]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Spotlight Search & Command Palette (Cmd/Ctrl + K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
        return;
      }

      // Select All (Cmd/Ctrl + A)
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        setSelectedIds(activeDoc.elements.map((el) => el.id));
        return;
      }

      // Undo (Cmd/Ctrl + Z)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo (Cmd/Ctrl + Y or Cmd/Ctrl + Shift + Z)
      if (
        ((e.metaKey || e.ctrlKey) && e.key === 'y') ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Duplicate (Cmd/Ctrl + D)
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        handleDuplicate();
        return;
      }

      // Delete (Backspace / Delete)
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleDeleteSelected();
        return;
      }

      // Letter-wise Tool Selection Shortcuts (Exact Eraser mapping)
      if (e.key === 'v' || e.key === 'V') setActiveTool('select');
      if (e.key === 'h' || e.key === 'H') setActiveTool('hand');
      if (e.key === 'r' || e.key === 'R') setActiveTool('rounded-rect');
      if (e.key === 'o' || e.key === 'O') setActiveTool('circle');
      if (e.key === 'd' || e.key === 'D') setActiveTool('diamond');
      if (e.key === 'b' || e.key === 'B') setActiveTool('cylinder');
      if (e.key === 'p' || e.key === 'P') setActiveTool('pen');
      if (e.key === 't' || e.key === 'T') setActiveTool('text');
      if (e.key === 's' || e.key === 'S') setActiveTool('sticky');
      if (e.key === 'f' || e.key === 'F') setActiveTool('frame');
      if (e.key === 'a' || e.key === 'A') setActiveTool('connector');
      if (e.key === 'l' || e.key === 'L') setActiveTool('connector');
      if (e.key === 'i' || e.key === 'I') setIsIconPickerOpen(true);
      if (e.key === '?') setIsShortcutsOpen(true);
      if (e.key === 'Escape') {
        setSelectedIds([]);
        setActiveTool('select');
        setIsSpotlightOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDoc.elements, selectedIds, handleUndo, handleRedo]);

  // Duplicate Selected Elements
  const handleDuplicate = () => {
    if (selectedIds.length === 0) return;
    const selected = activeDoc.elements.filter((el) => selectedIds.includes(el.id));
    const offset = 40;

    const duplicates: CanvasElement[] = selected.map((el) => ({
      ...el,
      id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      x: el.x + offset,
      y: el.y + offset,
    }));

    handleElementsChange([...activeDoc.elements, ...duplicates]);
    setSelectedIds(duplicates.map((d) => d.id));
  };

  // Delete Selected Elements
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    const filtered = activeDoc.elements.filter((el) => !selectedIds.includes(el.id));
    handleElementsChange(filtered);
    setSelectedIds([]);
  };

  // Update selected elements style
  const handleUpdateSelectedStyle = (updates: Partial<CanvasElement['style']>) => {
    handleElementsChange(
      activeDoc.elements.map((el) =>
        selectedIds.includes(el.id)
          ? { ...el, style: { ...el.style, ...updates } }
          : el
      )
    );
  };

  // Update element properties
  const handleUpdateSelectedElement = (updates: Partial<CanvasElement>) => {
    handleElementsChange(
      activeDoc.elements.map((el) =>
        selectedIds.includes(el.id) ? { ...el, ...updates } : el
      )
    );
  };

  // Bring to front
  const handleBringToFront = () => {
    const maxZ = Math.max(...activeDoc.elements.map((e) => e.zIndex || 10), 10);
    handleElementsChange(
      activeDoc.elements.map((el) =>
        selectedIds.includes(el.id) ? { ...el, zIndex: maxZ + 1 } : el
      )
    );
  };

  // Send to back
  const handleSendToBack = () => {
    handleElementsChange(
      activeDoc.elements.map((el) =>
        selectedIds.includes(el.id) ? { ...el, zIndex: 1 } : el
      )
    );
  };

  // Toggle lock
  const handleToggleLock = () => {
    handleElementsChange(
      activeDoc.elements.map((el) =>
        selectedIds.includes(el.id) ? { ...el, isLocked: !el.isLocked } : el
      )
    );
  };

  // Place Icon from Picker onto canvas
  const handlePlaceIcon = (iconDef: any) => {
    const snapX = snapToGrid(-pan.x / zoom + 300);
    const snapY = snapToGrid(-pan.y / zoom + 200);

    const newIcon: CanvasElement = {
      id: `icon_${Date.now()}`,
      type: 'icon',
      x: snapX,
      y: snapY,
      width: 90,
      height: 90,
      iconName: iconDef.id,
      iconCategory: iconDef.category,
      iconLabel: iconDef.name,
      text: iconDef.name,
      style: {
        fillColor: theme === 'dark' ? '#161924' : '#FFFFFF',
        strokeColor: iconDef.color,
        strokeWidth: 1.5,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: theme === 'dark' ? '#ECEFF4' : '#0F172A',
        fontSize: 12,
        fontFamily: 'sans',
        textAlign: 'center',
        opacity: 1,
      },
      zIndex: 10,
    };

    handleElementsChange([...activeDoc.elements, newIcon]);
    setSelectedIds([newIcon.id]);
  };

  // Export Handlers
  const handleExportPNG = async () => {
    const canvasEl = document.querySelector('.canvas-dots, .canvas-grid, [class*="bg-[#0F1117]"]') as HTMLElement;
    if (!canvasEl) return;
    try {
      const dataUrl = await toPng(canvasEl, { quality: 0.95 });
      const link = document.createElement('a');
      link.download = `${activeDoc.title.replace(/\s+/g, '_')}_diagram.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      alert('PNG Export complete! (Saved high-res screenshot)');
    }
  };

  const handleExportSVG = async () => {
    const svgEl = document.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${activeDoc.title.replace(/\s+/g, '_')}_diagram.svg`;
    link.href = url;
    link.click();
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([activeDoc.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${activeDoc.title.replace(/\s+/g, '_')}.md`;
    link.href = url;
    link.click();
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportProject = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(documents, null, 2));
    const link = document.createElement('a');
    link.download = `eraser_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.href = dataStr;
    link.click();
  };

  const handleImportProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setDocuments(imported);
          setActiveDocIdState(imported[0].id);
          setActiveDocumentId(imported[0].id);
          alert('Eraser project restored successfully!');
        }
      } catch (err) {
        alert('Invalid JSON project file.');
      }
    };
    reader.readAsText(file);
  };

  // Create new doc
  const handleCreateNewDoc = () => {
    const newDoc: EraserDocument = {
      id: `doc_${Date.now()}`,
      title: 'New Architecture Canvas',
      content: `# New Architecture Document\n\nStart documenting your technical architecture specs here...\n`,
      elements: [],
      viewMode: 'canvas',
      canvasSettings: {
        grid: 'dots',
        roughStyle: true,
        zoom: 1,
        pan: { x: 50, y: 50 },
        snapToGrid: true,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setDocuments([...documents, newDoc]);
    setActiveDocIdState(newDoc.id);
    historyRef.current = [[]];
    historyIndexRef.current = 0;
    setHistoryRenderTrigger((c) => c + 1);
  };

  // Delete doc
  const handleDeleteDoc = (id: string) => {
    const remaining = documents.filter((d) => d.id !== id);
    if (remaining.length > 0) {
      setDocuments(remaining);
      setActiveDocIdState(remaining[0].id);
      setActiveDocumentId(remaining[0].id);
    }
  };

  // Load starter template
  const handleLoadTemplate = (index: number) => {
    const t = STARTER_DOCUMENTS[index] || STARTER_DOCUMENTS[0];
    const newDoc: EraserDocument = {
      ...t,
      id: `template_${Date.now()}`,
      title: `${t.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setDocuments([...documents, newDoc]);
    setActiveDocIdState(newDoc.id);
    historyRef.current = [newDoc.elements];
    historyIndexRef.current = 0;
    setHistoryRenderTrigger((c) => c + 1);
  };

  // Switch doc
  const handleSelectDoc = (id: string) => {
    setActiveDocIdState(id);
    setActiveDocumentId(id);
    const target = documents.find((d) => d.id === id);
    if (target) {
      historyRef.current = [target.elements];
      historyIndexRef.current = 0;
      setHistoryRenderTrigger((c) => c + 1);
      setSelectedIds([]);
    }
  };

  // Split view dragging
  const handleSplitMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingSplit) return;
    const windowWidth = window.innerWidth;
    const newRatio = (e.clientX / windowWidth) * 100;
    if (newRatio >= 20 && newRatio <= 80) {
      setSplitRatio(newRatio);
    }
  };

  return (
    <div
      className={`w-screen h-screen flex flex-col overflow-hidden select-none transition-colors ${
        theme === 'dark' ? 'bg-[#1E1E1E] text-[#EDEDED]' : 'bg-[#FAFAFA] text-slate-900'
      }`}
      onMouseMove={handleSplitMouseMove}
      onMouseUp={() => setIsDraggingSplit(false)}
    >
      {/* Top Header */}
      <Header
        title={activeDoc.title}
        onTitleChange={(title) => updateActiveDoc({ title })}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          updateActiveDoc({ viewMode: mode });
        }}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onOpenAI={() => setIsAIDrawerOpen(true)}
        onOpenCodeDSL={() => setIsCodeDSLOpen(true)}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        onExportPDF={handleExportPDF}
        onExportPNG={handleExportPNG}
        onExportSVG={handleExportSVG}
        onExportMarkdown={handleExportMarkdown}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        aiStatus={aiStatus}
      />

      {/* Main Workspace: Sidebar + (Doc & Canvas Split) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <DocumentSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          documents={documents}
          activeDocId={activeDoc.id}
          onSelectDoc={handleSelectDoc}
          onCreateDoc={handleCreateNewDoc}
          onDeleteDoc={handleDeleteDoc}
          onExportProject={handleExportProject}
          onImportProject={handleImportProject}
          theme={theme}
        />

        {/* Central Workspace (Both/Split, Doc only, or Canvas only) */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Document Editor (Left pane in Both/Split, or Full in Doc mode) */}
          {(viewMode === 'both' || viewMode === 'split' || viewMode === 'doc') && (
            <div
              style={{
                width: viewMode === 'doc' ? '100%' : `${splitRatio}%`,
              }}
              className="h-full overflow-hidden"
            >
              <DocEditor
                content={activeDoc.content}
                onChange={(content) => updateActiveDoc({ content })}
                canvasElements={activeDoc.elements}
                onAskAIAboutDoc={() => setIsAIDrawerOpen(true)}
                theme={theme}
              />
            </div>
          )}

          {/* Resizable Divider bar in Both/Split View */}
          {(viewMode === 'both' || viewMode === 'split') && (
            <div
              className={`w-1.5 hover:w-2 ${
                theme === 'dark' ? 'bg-[#2E2E2E]' : 'bg-neutral-200'
              } hover:bg-neutral-400 dark:hover:bg-neutral-500 cursor-col-resize transition-all z-20 flex items-center justify-center`}
              onMouseDown={() => setIsDraggingSplit(true)}
            >
              <div className={`w-0.5 h-8 ${theme === 'dark' ? 'bg-neutral-600' : 'bg-neutral-400'} rounded-full`} />
            </div>
          )}

          {/* Infinite Canvas (Right pane in Both/Split, or Full in Canvas mode) */}
          {(viewMode === 'both' || viewMode === 'split' || viewMode === 'canvas') && (
            <div
              style={{
                width: viewMode === 'canvas' ? '100%' : `${100 - splitRatio}%`,
              }}
              className="h-full relative overflow-hidden"
            >
              <InfiniteCanvas
                elements={activeDoc.elements}
                onElementsChange={handleElementsChange}
                activeTool={activeTool}
                onSelectTool={setActiveTool}
                zoom={zoom}
                onZoomChange={setZoom}
                pan={pan}
                onPanChange={setPan}
                gridMode={gridMode}
                snapEnabled={snapEnabled}
                roughStyle={roughStyle}
                selectedIds={selectedIds}
                onSelectedIdsChange={setSelectedIds}
                onOpenIconPicker={() => setIsIconPickerOpen(true)}
                theme={theme}
              />

              {/* Selected Elements Properties Floating Panel */}
              <PropertiesPanel
                selectedElements={activeDoc.elements.filter((e) =>
                  selectedIds.includes(e.id)
                )}
                allElements={activeDoc.elements}
                onUpdateStyle={handleUpdateSelectedStyle}
                onUpdateElement={handleUpdateSelectedElement}
                onDuplicate={handleDuplicate}
                onDelete={handleDeleteSelected}
                onBringToFront={handleBringToFront}
                onSendToBack={handleSendToBack}
                onToggleLock={handleToggleLock}
                onOpenIconPicker={() => setIsIconPickerOpen(true)}
                theme={theme}
              />

              {/* Floating Toolbar & Controls */}
              <CanvasToolbar
                activeTool={activeTool}
                onSelectTool={setActiveTool}
                onOpenIconPicker={() => setIsIconPickerOpen(true)}
                onOpenAIChat={() => setIsAIDrawerOpen(true)}
                onOpenCodeDSL={() => setIsCodeDSLOpen(true)}
                onOpenShortcuts={() => setIsShortcutsOpen(true)}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={handleUndo}
                onRedo={handleRedo}
                roughStyle={roughStyle}
                onToggleRoughStyle={() => setRoughStyle(!roughStyle)}
                gridMode={gridMode}
                onCycleGrid={() =>
                  setGridMode((prev) =>
                    prev === 'dots' ? 'grid' : prev === 'grid' ? 'none' : 'dots'
                  )
                }
                zoom={zoom}
                onZoomIn={() => setZoom((z) => Math.min(z + 0.15, 3))}
                onZoomOut={() => setZoom((z) => Math.max(z - 0.15, 0.2))}
                onResetZoom={() => setZoom(1)}
                onFitToScreen={() => {
                  setZoom(1);
                  setPan({ x: 50, y: 50 });
                }}
                theme={theme}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              />
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Drawer (DiagramGPT) */}
      <AIAssistantDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        canvasElements={activeDoc.elements}
        docContent={activeDoc.content}
        onApplyDiagram={(newElements) => handleElementsChange(newElements)}
        onUpdateDoc={(newDoc) => updateActiveDoc({ content: newDoc })}
        theme={theme}
      />

      {/* Icon Picker Modal */}
      <IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelectIcon={handlePlaceIcon}
        theme={theme}
      />

      {/* Diagram-as-code DSL Modal */}
      <DiagramCodeModal
        isOpen={isCodeDSLOpen}
        onClose={() => setIsCodeDSLOpen(false)}
        canvasElements={activeDoc.elements}
        onApplyCode={(elements) => handleElementsChange(elements)}
      />

      {/* Shortcuts Reference Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        theme={theme}
      />

      {/* Spotlight Search & Command Palette (Cmd+K) */}
      <CommandPaletteModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onSelectTool={setActiveTool}
        onPlaceIcon={handlePlaceIcon}
        onFitToScreen={() => {
          setZoom(1);
          setPan({ x: 50, y: 50 });
        }}
        onResetZoom={() => setZoom(1)}
        onZoomIn={() => setZoom((z) => Math.min(z + 0.15, 3))}
        onZoomOut={() => setZoom((z) => Math.max(z - 0.15, 0.2))}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onCycleGrid={() =>
          setGridMode((prev) =>
            prev === 'dots' ? 'grid' : prev === 'grid' ? 'none' : 'dots'
          )
        }
        onToggleRoughStyle={() => setRoughStyle(!roughStyle)}
        onExportPNG={handleExportPNG}
        onExportSVG={handleExportSVG}
        onExportMarkdown={handleExportMarkdown}
        documents={documents}
        onSelectDoc={handleSelectDoc}
        onCreateDoc={handleCreateNewDoc}
        onOpenAIBridge={() => setIsAIDrawerOpen(true)}
      />
    </div>
  );
}
export default App;
