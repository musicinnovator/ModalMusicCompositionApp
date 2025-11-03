/**
 * UndoRedoControls
 * 
 * Visual controls for Undo/Redo functionality
 * 
 * FEATURES:
 * - Floating action buttons for undo/redo
 * - Keyboard shortcut indicators
 * - History visualization panel
 * - Component-specific undo/redo switcher
 * - Real-time state indicators
 */

import React, { useState, useRef, useEffect } from 'react';
import { useUndoRedo, useComponentUndoRedo } from './UndoRedoProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Undo2, 
  Redo2, 
  History, 
  ChevronDown, 
  X, 
  Trash2,
  Layers,
  Globe,
  GripVertical
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { motion, AnimatePresence } from 'motion/react';

// ========================================
// MAIN CONTROLS COMPONENT
// ========================================

interface UndoRedoControlsProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showGlobalControls?: boolean;
  showComponentControls?: boolean;
  defaultComponentId?: string;
  className?: string;
}

export function UndoRedoControls({
  position = 'top-right',
  showGlobalControls = true,
  showComponentControls = true,
  defaultComponentId,
  className = '',
}: UndoRedoControlsProps) {
  const undoRedo = useUndoRedo();
  const [selectedScope, setSelectedScope] = useState<'global' | 'component'>('global');
  const [selectedComponentId, setSelectedComponentId] = useState<string>(defaultComponentId || 'theme-composer');
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Draggable state
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number; elementX: number; elementY: number } | null>(null);

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const undoShortcut = isMac ? '⌘Z' : 'Ctrl+Z';
  const redoShortcut = isMac ? '⌘⇧Z' : 'Ctrl+Y';

  // Position classes (used as default before dragging)
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };
  
  // Load saved position from localStorage
  useEffect(() => {
    try {
      const savedPosition = localStorage.getItem('undoRedoControlsPosition');
      if (savedPosition) {
        const parsed = JSON.parse(savedPosition);
        setDragPosition(parsed);
      }
    } catch (error) {
      console.warn('Failed to load Undo/Redo controls position:', error);
    }
  }, []);
  
  // Save position to localStorage when it changes
  useEffect(() => {
    if (dragPosition) {
      try {
        localStorage.setItem('undoRedoControlsPosition', JSON.stringify(dragPosition));
      } catch (error) {
        console.warn('Failed to save Undo/Redo controls position:', error);
      }
    }
  }, [dragPosition]);
  
  // Drag handlers
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = dragRef.current;
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      elementX: rect.left,
      elementY: rect.top
    };
    
    setIsDragging(true);
  };
  
  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging || !dragStartPos.current) return;
    
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    
    setDragPosition({
      x: dragStartPos.current.elementX + deltaX,
      y: dragStartPos.current.elementY + deltaY
    });
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    dragStartPos.current = null;
  };
  
  // Global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging]);
  
  // Reset position to default
  const handleResetPosition = () => {
    setDragPosition(null);
    localStorage.removeItem('undoRedoControlsPosition');
  };

  // Get current state based on scope
  const currentState = selectedScope === 'global' 
    ? undoRedo.globalState 
    : undoRedo.getComponentState(selectedComponentId);

  const handleUndo = () => {
    if (selectedScope === 'global') {
      undoRedo.undoGlobal();
    } else {
      undoRedo.undoComponent(selectedComponentId);
    }
  };

  const handleRedo = () => {
    if (selectedScope === 'global') {
      undoRedo.redoGlobal();
    } else {
      undoRedo.redoComponent(selectedComponentId);
    }
  };

  const handleClearHistory = () => {
    if (selectedScope === 'global') {
      undoRedo.clearAll();
    } else {
      undoRedo.clearComponent(selectedComponentId);
    }
  };

  const componentIds = undoRedo.getComponentIds();

  // Calculate position style
  const positionStyle = dragPosition 
    ? { left: `${dragPosition.x}px`, top: `${dragPosition.y}px` }
    : {};
  
  return (
    <motion.div
      ref={dragRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed ${dragPosition ? '' : positionClasses[position]} z-50 ${className}`}
      style={positionStyle}
    >
      <Card className={`shadow-lg border-2 bg-background/95 backdrop-blur ${isDragging ? 'cursor-grabbing shadow-2xl' : ''}`}>
        <div className="p-3">
          {/* Header with Drag Handle */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div 
              className="flex items-center gap-2 flex-1 cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleDragStart}
              title="Drag to reposition"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <History className="w-4 h-4" />
              <span className="text-sm">Undo/Redo</span>
            </div>
            <div className="flex items-center gap-1">
              {dragPosition && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetPosition}
                  className="h-6 w-6 p-0"
                  title="Reset to default position"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${isMinimized ? '' : 'rotate-180'}`} />
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3"
              >
                {/* Scope Selector */}
                {showGlobalControls && showComponentControls && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant={selectedScope === 'global' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedScope('global')}
                      className="flex-1"
                    >
                      <Globe className="w-3 h-3 mr-1" />
                      Global
                    </Button>
                    <Button
                      variant={selectedScope === 'component' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedScope('component')}
                      className="flex-1"
                    >
                      <Layers className="w-3 h-3 mr-1" />
                      Component
                    </Button>
                  </div>
                )}

                {/* Component Selector (when in component mode) */}
                {selectedScope === 'component' && showComponentControls && (
                  <Select value={selectedComponentId} onValueChange={setSelectedComponentId}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select component" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theme-composer">Theme Composer</SelectItem>
                      <SelectItem value="canon-visualizer">Canon Visualizer</SelectItem>
                      <SelectItem value="fugue-visualizer">Fugue Visualizer</SelectItem>
                      <SelectItem value="bach-variables">Bach Variables</SelectItem>
                      <SelectItem value="harmony-composer">Harmony Composer</SelectItem>
                      <SelectItem value="arpeggio-chain">Arpeggio Chain</SelectItem>
                      <SelectItem value="song-composer">Song Composer</SelectItem>
                      {componentIds.map(id => (
                        <SelectItem key={id} value={id}>{id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Separator />

                {/* Undo/Redo Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    disabled={!currentState.canUndo}
                    className="flex-1"
                    title={currentState.undoDescription || 'Undo'}
                  >
                    <Undo2 className="w-4 h-4 mr-1" />
                    Undo
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {undoShortcut}
                    </Badge>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRedo}
                    disabled={!currentState.canRedo}
                    className="flex-1"
                    title={currentState.redoDescription || 'Redo'}
                  >
                    <Redo2 className="w-4 h-4 mr-1" />
                    Redo
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {redoShortcut}
                    </Badge>
                  </Button>
                </div>

                {/* Status Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {currentState.historyLength} {currentState.historyLength === 1 ? 'action' : 'actions'}
                  </span>
                  {currentState.undoDescription && (
                    <span className="truncate max-w-[150px]" title={currentState.undoDescription}>
                      Last: {currentState.undoDescription}
                    </span>
                  )}
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Popover open={showHistoryPanel} onOpenChange={setShowHistoryPanel}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <History className="w-3 h-3 mr-1" />
                        History
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <HistoryPanel 
                        scope={selectedScope} 
                        componentId={selectedComponentId}
                      />
                    </PopoverContent>
                  </Popover>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearHistory}
                    disabled={currentState.historyLength === 0}
                    className="flex-1"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

// ========================================
// HISTORY PANEL
// ========================================

interface HistoryPanelProps {
  scope: 'global' | 'component';
  componentId?: string;
}

function HistoryPanel({ scope, componentId }: HistoryPanelProps) {
  const undoRedo = useUndoRedo();

  // Get history from debug info
  const debugInfo = (undoRedo as any).manager?.getDebugInfo?.() || { global: { past: [], future: [] }, components: {} };
  
  const history = scope === 'global' 
    ? debugInfo.global 
    : (componentId && debugInfo.components[componentId]) || { past: [], future: [] };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm">
          {scope === 'global' ? 'Global History' : `${componentId} History`}
        </h4>
        <Badge variant="outline">
          {history.past.length + history.future.length} total
        </Badge>
      </div>

      <Separator />

      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {/* Future (Redo) */}
          {history.future.length > 0 && (
            <>
              <div className="text-xs text-muted-foreground mb-1">Future (Redo)</div>
              {[...history.future].reverse().map((entry: any, index: number) => (
                <div
                  key={`future-${index}`}
                  className="p-2 rounded bg-muted/50 border border-dashed text-xs opacity-60"
                >
                  <div className="flex items-center gap-2">
                    <Redo2 className="w-3 h-3" />
                    <span className="flex-1 truncate">{entry.description}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              <Separator className="my-2" />
            </>
          )}

          {/* Past (Undo) */}
          {history.past.length > 0 ? (
            <>
              <div className="text-xs text-muted-foreground mb-1">Past (Undo)</div>
              {[...history.past].reverse().map((entry: any, index: number) => (
                <div
                  key={`past-${index}`}
                  className="p-2 rounded bg-primary/10 border text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Undo2 className="w-3 h-3" />
                    <span className="flex-1 truncate">{entry.description}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              No history available
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ========================================
// COMPACT FLOATING BUTTONS
// ========================================

interface CompactUndoRedoButtonsProps {
  componentId?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

export function CompactUndoRedoButtons({
  componentId,
  position = 'bottom-right',
  className = '',
}: CompactUndoRedoButtonsProps) {
  const undoRedo = componentId 
    ? useComponentUndoRedo(componentId) 
    : useUndoRedo();

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const canUndo = componentId 
    ? undoRedo.canUndo 
    : (undoRedo as any).globalState.canUndo;
  const canRedo = componentId 
    ? undoRedo.canRedo 
    : (undoRedo as any).globalState.canRedo;

  return (
    <div className={`fixed ${positionClasses[position]} z-40 flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => componentId ? undoRedo.undo() : (undoRedo as any).undoGlobal()}
        disabled={!canUndo}
        className="shadow-lg"
        title="Undo"
      >
        <Undo2 className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => componentId ? undoRedo.redo() : (undoRedo as any).redoGlobal()}
        disabled={!canRedo}
        className="shadow-lg"
        title="Redo"
      >
        <Redo2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
