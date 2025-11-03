/**
 * UndoRedoProvider
 * 
 * React Context Provider for Global and Component-Level Undo/Redo
 * 
 * FEATURES:
 * - Global undo/redo across entire application
 * - Component-level undo/redo for isolated changes
 * - Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Cmd+Z, Cmd+Shift+Z)
 * - Visual feedback via toast notifications
 * - Automatic state snapshot management
 * 
 * USAGE:
 * 1. Wrap your app with <UndoRedoProvider>
 * 2. Use useUndoRedo() hook in components
 * 3. Call recordChange() before state mutations
 */

import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { 
  UndoRedoManager, 
  UndoRedoState, 
  HistoryEntry, 
  getUndoRedoManager 
} from '../lib/undo-redo-engine';
import { toast } from 'sonner@2.0.3';

// ========================================
// CONTEXT TYPES
// ========================================

export type UndoRedoScope = 'global' | 'component';

export interface UndoRedoContextValue {
  // Global undo/redo
  undoGlobal: () => void;
  redoGlobal: () => void;
  recordGlobal: (state: any, description: string) => void;
  globalState: UndoRedoState;
  
  // Component undo/redo
  undoComponent: (componentId: string) => void;
  redoComponent: (componentId: string) => void;
  recordComponent: (componentId: string, state: any, description: string) => void;
  getComponentState: (componentId: string) => UndoRedoState;
  
  // Combined recording (both global and component)
  recordBoth: (componentId: string, state: any, description: string) => void;
  
  // Utilities
  clearAll: () => void;
  clearComponent: (componentId: string) => void;
  getComponentIds: () => string[];
  
  // State tracking
  isUndoRedoActive: boolean;
}

const UndoRedoContext = createContext<UndoRedoContextValue | null>(null);

// ========================================
// PROVIDER COMPONENT
// ========================================

interface UndoRedoProviderProps {
  children: React.ReactNode;
  maxHistoryDepth?: number;
  enableKeyboardShortcuts?: boolean;
  enableToastNotifications?: boolean;
}

export function UndoRedoProvider({ 
  children, 
  maxHistoryDepth = 50,
  enableKeyboardShortcuts = true,
  enableToastNotifications = true,
}: UndoRedoProviderProps) {
  const [manager] = useState(() => getUndoRedoManager({ maxHistoryDepth }));
  const [globalState, setGlobalState] = useState<UndoRedoState>(manager.getGlobalState());
  const [componentStates, setComponentStates] = useState<Map<string, UndoRedoState>>(new Map());
  const [isUndoRedoActive, setIsUndoRedoActive] = useState(false);

  // ========================================
  // GLOBAL OPERATIONS
  // ========================================

  const undoGlobal = useCallback(() => {
    const entry = manager.undoGlobal();
    if (entry) {
      setGlobalState(manager.getGlobalState());
      if (enableToastNotifications) {
        toast.success(`Undo: ${entry.description || 'Last action'}`);
      }
      setIsUndoRedoActive(true);
      setTimeout(() => setIsUndoRedoActive(false), 100);
      return entry.state;
    } else {
      if (enableToastNotifications) {
        toast.info('Nothing to undo');
      }
    }
  }, [manager, enableToastNotifications]);

  const redoGlobal = useCallback(() => {
    const entry = manager.redoGlobal();
    if (entry) {
      setGlobalState(manager.getGlobalState());
      if (enableToastNotifications) {
        toast.success(`Redo: ${entry.description || 'Last action'}`);
      }
      setIsUndoRedoActive(true);
      setTimeout(() => setIsUndoRedoActive(false), 100);
      return entry.state;
    } else {
      if (enableToastNotifications) {
        toast.info('Nothing to redo');
      }
    }
  }, [manager, enableToastNotifications]);

  const recordGlobal = useCallback((state: any, description: string) => {
    manager.recordGlobal(state, description);
    setGlobalState(manager.getGlobalState());
  }, [manager]);

  // ========================================
  // COMPONENT OPERATIONS
  // ========================================

  const undoComponent = useCallback((componentId: string) => {
    const entry = manager.undoComponent(componentId);
    if (entry) {
      setComponentStates(new Map(componentStates.set(componentId, manager.getComponentState(componentId))));
      if (enableToastNotifications) {
        toast.success(`Undo (${componentId}): ${entry.description || 'Last action'}`);
      }
      setIsUndoRedoActive(true);
      setTimeout(() => setIsUndoRedoActive(false), 100);
      return entry.state;
    } else {
      if (enableToastNotifications) {
        toast.info(`Nothing to undo in ${componentId}`);
      }
    }
  }, [manager, componentStates, enableToastNotifications]);

  const redoComponent = useCallback((componentId: string) => {
    const entry = manager.redoComponent(componentId);
    if (entry) {
      setComponentStates(new Map(componentStates.set(componentId, manager.getComponentState(componentId))));
      if (enableToastNotifications) {
        toast.success(`Redo (${componentId}): ${entry.description || 'Last action'}`);
      }
      setIsUndoRedoActive(true);
      setTimeout(() => setIsUndoRedoActive(false), 100);
      return entry.state;
    } else {
      if (enableToastNotifications) {
        toast.info(`Nothing to redo in ${componentId}`);
      }
    }
  }, [manager, componentStates, enableToastNotifications]);

  const recordComponent = useCallback((componentId: string, state: any, description: string) => {
    manager.recordComponent(componentId, state, description);
    setComponentStates(new Map(componentStates.set(componentId, manager.getComponentState(componentId))));
  }, [manager, componentStates]);

  const recordBoth = useCallback((componentId: string, state: any, description: string) => {
    manager.recordBoth(componentId, state, description);
    setGlobalState(manager.getGlobalState());
    setComponentStates(new Map(componentStates.set(componentId, manager.getComponentState(componentId))));
  }, [manager, componentStates]);

  // ========================================
  // UTILITY OPERATIONS
  // ========================================

  const getComponentState = useCallback((componentId: string): UndoRedoState => {
    return manager.getComponentState(componentId);
  }, [manager]);

  const clearAll = useCallback(() => {
    manager.clearAll();
    setGlobalState(manager.getGlobalState());
    setComponentStates(new Map());
    if (enableToastNotifications) {
      toast.info('All history cleared');
    }
  }, [manager, enableToastNotifications]);

  const clearComponent = useCallback((componentId: string) => {
    manager.clearComponent(componentId);
    const newStates = new Map(componentStates);
    newStates.delete(componentId);
    setComponentStates(newStates);
    if (enableToastNotifications) {
      toast.info(`History cleared for ${componentId}`);
    }
  }, [manager, componentStates, enableToastNotifications]);

  const getComponentIds = useCallback(() => {
    return manager.getComponentIds();
  }, [manager]);

  // ========================================
  // KEYBOARD SHORTCUTS
  // ========================================

  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // Global Undo: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if (isCtrlOrCmd && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoGlobal();
      }

      // Global Redo: Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac)
      if ((isCtrlOrCmd && e.key === 'y' && !isMac) || (isCtrlOrCmd && e.shiftKey && e.key === 'z' && isMac)) {
        e.preventDefault();
        redoGlobal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, undoGlobal, redoGlobal]);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const contextValue: UndoRedoContextValue = {
    undoGlobal,
    redoGlobal,
    recordGlobal,
    globalState,
    undoComponent,
    redoComponent,
    recordComponent,
    getComponentState,
    recordBoth,
    clearAll,
    clearComponent,
    getComponentIds,
    isUndoRedoActive,
  };

  return (
    <UndoRedoContext.Provider value={contextValue}>
      {children}
    </UndoRedoContext.Provider>
  );
}

// ========================================
// HOOK
// ========================================

export function useUndoRedo() {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error('useUndoRedo must be used within UndoRedoProvider');
  }
  return context;
}

// ========================================
// COMPONENT-SPECIFIC HOOK
// ========================================

/**
 * Hook for component-level undo/redo
 * Automatically manages component ID and provides scoped operations
 */
export function useComponentUndoRedo(componentId: string) {
  const context = useUndoRedo();
  
  const undo = useCallback(() => {
    return context.undoComponent(componentId);
  }, [context, componentId]);

  const redo = useCallback(() => {
    return context.redoComponent(componentId);
  }, [context, componentId]);

  const record = useCallback((state: any, description: string) => {
    context.recordComponent(componentId, state, description);
  }, [context, componentId]);

  const recordGlobalAndLocal = useCallback((state: any, description: string) => {
    context.recordBoth(componentId, state, description);
  }, [context, componentId]);

  const clear = useCallback(() => {
    context.clearComponent(componentId);
  }, [context, componentId]);

  const state = context.getComponentState(componentId);

  return {
    undo,
    redo,
    record,
    recordGlobalAndLocal,
    clear,
    canUndo: state.canUndo,
    canRedo: state.canRedo,
    undoDescription: state.undoDescription,
    redoDescription: state.redoDescription,
    historyLength: state.historyLength,
  };
}
