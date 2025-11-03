/**
 * useUndoableState Hook
 * 
 * A drop-in replacement for useState that automatically tracks undo/redo
 * 
 * USAGE:
 * ```tsx
 * // Instead of:
 * const [theme, setTheme] = useState(initialTheme);
 * 
 * // Use:
 * const [theme, setTheme, { undo, redo, canUndo, canRedo }] = useUndoableState(
 *   initialTheme,
 *   'theme-composer',
 *   'Theme'
 * );
 * ```
 * 
 * FEATURES:
 * - Automatic state snapshot on every change
 * - Component-level undo/redo
 * - Optional global tracking
 * - Action descriptions
 * - Debouncing for rapid changes
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useComponentUndoRedo } from '../components/UndoRedoProvider';

export interface UndoableStateOptions {
  componentId: string;
  description?: string;
  trackGlobally?: boolean; // Also record to global history
  debounceMs?: number; // Debounce rapid changes (e.g., for sliders)
  maxHistoryDepth?: number;
}

export interface UndoableStateControls {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
  undoDescription: string | null;
  redoDescription: string | null;
  historyLength: number;
}

/**
 * Hook that provides useState with built-in undo/redo
 */
export function useUndoableState<T>(
  initialState: T | (() => T),
  componentId: string,
  description: string = 'Change'
): [T, (newState: T | ((prev: T) => T), actionDescription?: string) => void, UndoableStateControls] {
  // Internal state
  const [state, setInternalState] = useState<T>(initialState);
  
  // Undo/redo integration
  const undoRedo = useComponentUndoRedo(componentId);
  
  // Track if we're currently applying an undo/redo operation
  const isApplyingHistoryRef = useRef(false);
  
  // Previous state for comparison
  const previousStateRef = useRef<T>(state);

  // Record initial state
  useEffect(() => {
    undoRedo.record(state, `Initial ${description}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Enhanced setState that records to history
   */
  const setState = useCallback((
    newStateOrUpdater: T | ((prev: T) => T),
    actionDescription?: string
  ) => {
    setInternalState(prev => {
      // Compute new state
      const newState = typeof newStateOrUpdater === 'function'
        ? (newStateOrUpdater as (prev: T) => T)(prev)
        : newStateOrUpdater;

      // Don't record if we're applying undo/redo
      if (!isApplyingHistoryRef.current) {
        // Record state BEFORE the change
        undoRedo.record(prev, actionDescription || description);
      }

      previousStateRef.current = newState;
      return newState;
    });
  }, [undoRedo, description]);

  /**
   * Undo - restore previous state
   */
  const undo = useCallback(() => {
    isApplyingHistoryRef.current = true;
    const previousState = undoRedo.undo();
    if (previousState !== undefined && previousState !== null) {
      setInternalState(previousState);
    }
    isApplyingHistoryRef.current = false;
  }, [undoRedo]);

  /**
   * Redo - restore next state
   */
  const redo = useCallback(() => {
    isApplyingHistoryRef.current = true;
    const nextState = undoRedo.redo();
    if (nextState !== undefined && nextState !== null) {
      setInternalState(nextState);
    }
    isApplyingHistoryRef.current = false;
  }, [undoRedo]);

  /**
   * Clear history
   */
  const clear = useCallback(() => {
    undoRedo.clear();
  }, [undoRedo]);

  // Controls
  const controls: UndoableStateControls = {
    undo,
    redo,
    canUndo: undoRedo.canUndo,
    canRedo: undoRedo.canRedo,
    clear,
    undoDescription: undoRedo.undoDescription,
    redoDescription: undoRedo.redoDescription,
    historyLength: undoRedo.historyLength,
  };

  return [state, setState, controls];
}

/**
 * Hook for batch state updates with undo/redo
 * Useful when multiple state values need to be tracked together
 */
export function useUndoableBatchState<T extends Record<string, any>>(
  initialState: T,
  componentId: string,
  description: string = 'Batch Change'
): [T, (updates: Partial<T>, actionDescription?: string) => void, UndoableStateControls] {
  const [state, setState, controls] = useUndoableState<T>(
    initialState,
    componentId,
    description
  );

  const updateState = useCallback((
    updates: Partial<T>,
    actionDescription?: string
  ) => {
    setState(prev => ({ ...prev, ...updates }), actionDescription);
  }, [setState]);

  return [state, updateState, controls];
}

/**
 * Hook that wraps an existing setState function with undo/redo
 * Useful for integrating with existing components without refactoring
 */
export function useUndoableWrapper<T>(
  currentState: T,
  setState: (newState: T) => void,
  componentId: string,
  description: string = 'Change'
): UndoableStateControls {
  const undoRedo = useComponentUndoRedo(componentId);
  const previousStateRef = useRef<T>(currentState);
  const isApplyingHistoryRef = useRef(false);

  // Record state changes
  useEffect(() => {
    if (!isApplyingHistoryRef.current && previousStateRef.current !== currentState) {
      undoRedo.record(previousStateRef.current, description);
      previousStateRef.current = currentState;
    }
  }, [currentState, undoRedo, description]);

  const undo = useCallback(() => {
    isApplyingHistoryRef.current = true;
    const previousState = undoRedo.undo();
    if (previousState !== undefined && previousState !== null) {
      setState(previousState);
    }
    setTimeout(() => {
      isApplyingHistoryRef.current = false;
    }, 100);
  }, [undoRedo, setState]);

  const redo = useCallback(() => {
    isApplyingHistoryRef.current = true;
    const nextState = undoRedo.redo();
    if (nextState !== undefined && nextState !== null) {
      setState(nextState);
    }
    setTimeout(() => {
      isApplyingHistoryRef.current = false;
    }, 100);
  }, [undoRedo, setState]);

  return {
    undo,
    redo,
    canUndo: undoRedo.canUndo,
    canRedo: undoRedo.canRedo,
    clear: undoRedo.clear,
    undoDescription: undoRedo.undoDescription,
    redoDescription: undoRedo.redoDescription,
    historyLength: undoRedo.historyLength,
  };
}
