/**
 * Undo/Redo Engine
 * 
 * Provides comprehensive undo/redo functionality with:
 * - Global undo/redo across all components
 * - Component-level undo/redo for isolated changes
 * - Automatic state snapshot management
 * - Action description tracking
 * - Configurable history depth
 * 
 * ARCHITECTURE:
 * - HistoryStack: Manages past/future states with descriptions
 * - UndoRedoManager: Coordinates global and component-level histories
 * - State compression: Efficient storage of large state objects
 */

// ========================================
// TYPES & INTERFACES
// ========================================

export interface HistoryEntry<T = any> {
  state: T;
  description: string;
  timestamp: number;
  componentId?: string; // Optional component identifier
}

export interface HistoryStack<T = any> {
  past: HistoryEntry<T>[];
  future: HistoryEntry<T>[];
  maxDepth: number;
}

export interface UndoRedoOptions {
  maxHistoryDepth?: number; // Maximum number of undo steps (default: 50)
  enableCompression?: boolean; // Enable state compression (default: false)
  debounceMs?: number; // Debounce rapid changes (default: 0)
}

export interface UndoRedoState {
  canUndo: boolean;
  canRedo: boolean;
  undoDescription: string | null;
  redoDescription: string | null;
  historyLength: number;
}

// ========================================
// HISTORY STACK IMPLEMENTATION
// ========================================

export class HistoryStackManager<T = any> {
  private past: HistoryEntry<T>[] = [];
  private future: HistoryEntry<T>[] = [];
  private maxDepth: number;
  private debounceTimer: NodeJS.Timeout | null = null;
  private debounceMs: number;

  constructor(options: UndoRedoOptions = {}) {
    this.maxDepth = options.maxHistoryDepth || 50;
    this.debounceMs = options.debounceMs || 0;
  }

  /**
   * Push a new state to the history stack
   * This clears the future (redo) stack
   */
  push(state: T, description: string, componentId?: string): void {
    // Clear any pending debounce
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    const entry: HistoryEntry<T> = {
      state: this.cloneState(state),
      description,
      timestamp: Date.now(),
      componentId,
    };

    // Add to past
    this.past.push(entry);

    // Enforce max depth
    if (this.past.length > this.maxDepth) {
      this.past.shift(); // Remove oldest entry
    }

    // Clear future (redo stack)
    this.future = [];
  }

  /**
   * Push with debouncing for rapid changes (e.g., slider movements)
   */
  pushDebounced(state: T, description: string, componentId?: string): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.push(state, description, componentId);
      this.debounceTimer = null;
    }, this.debounceMs);
  }

  /**
   * Undo: Move current state to future, return previous state
   */
  undo(): HistoryEntry<T> | null {
    if (this.past.length === 0) {
      return null;
    }

    const entry = this.past.pop()!;
    this.future.push(entry);

    // Return the previous state (or null if no more history)
    return this.past[this.past.length - 1] || null;
  }

  /**
   * Redo: Move state from future back to past
   */
  redo(): HistoryEntry<T> | null {
    if (this.future.length === 0) {
      return null;
    }

    const entry = this.future.pop()!;
    this.past.push(entry);

    return entry;
  }

  /**
   * Get current state information
   */
  getState(): UndoRedoState {
    const lastPast = this.past[this.past.length - 1];
    const lastFuture = this.future[this.future.length - 1];

    return {
      canUndo: this.past.length > 0,
      canRedo: this.future.length > 0,
      undoDescription: lastPast?.description || null,
      redoDescription: lastFuture?.description || null,
      historyLength: this.past.length,
    };
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.past = [];
    this.future = [];
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  /**
   * Get history for debugging
   */
  getHistory(): { past: HistoryEntry<T>[]; future: HistoryEntry<T>[] } {
    return {
      past: [...this.past],
      future: [...this.future],
    };
  }

  /**
   * Deep clone state to prevent mutations
   */
  private cloneState(state: T): T {
    try {
      // Handle Map objects specially
      if (state instanceof Map) {
        return new Map(state) as any;
      }
      
      // Handle arrays
      if (Array.isArray(state)) {
        return state.map(item => this.cloneState(item)) as any;
      }
      
      // Handle objects
      if (state && typeof state === 'object') {
        const cloned: any = {};
        for (const key in state) {
          if (Object.prototype.hasOwnProperty.call(state, key)) {
            cloned[key] = this.cloneState((state as any)[key]);
          }
        }
        return cloned;
      }
      
      // Primitives
      return state;
    } catch (error) {
      console.warn('State cloning failed, using JSON fallback:', error);
      return JSON.parse(JSON.stringify(state));
    }
  }
}

// ========================================
// GLOBAL UNDO/REDO MANAGER
// ========================================

export class UndoRedoManager {
  private globalHistory: HistoryStackManager<any>;
  private componentHistories: Map<string, HistoryStackManager<any>>;
  private options: UndoRedoOptions;

  constructor(options: UndoRedoOptions = {}) {
    this.options = options;
    this.globalHistory = new HistoryStackManager(options);
    this.componentHistories = new Map();
  }

  /**
   * Record a change to global history
   */
  recordGlobal(state: any, description: string): void {
    this.globalHistory.push(state, description);
  }

  /**
   * Record a change to component-specific history
   */
  recordComponent(componentId: string, state: any, description: string): void {
    if (!this.componentHistories.has(componentId)) {
      this.componentHistories.set(componentId, new HistoryStackManager(this.options));
    }

    const history = this.componentHistories.get(componentId)!;
    history.push(state, description, componentId);
  }

  /**
   * Record to both global and component history
   */
  recordBoth(componentId: string, state: any, description: string): void {
    this.recordGlobal(state, `${componentId}: ${description}`);
    this.recordComponent(componentId, state, description);
  }

  /**
   * Undo global change
   */
  undoGlobal(): HistoryEntry | null {
    return this.globalHistory.undo();
  }

  /**
   * Redo global change
   */
  redoGlobal(): HistoryEntry | null {
    return this.globalHistory.redo();
  }

  /**
   * Undo component-specific change
   */
  undoComponent(componentId: string): HistoryEntry | null {
    const history = this.componentHistories.get(componentId);
    return history ? history.undo() : null;
  }

  /**
   * Redo component-specific change
   */
  redoComponent(componentId: string): HistoryEntry | null {
    const history = this.componentHistories.get(componentId);
    return history ? history.redo() : null;
  }

  /**
   * Get global state
   */
  getGlobalState(): UndoRedoState {
    return this.globalHistory.getState();
  }

  /**
   * Get component state
   */
  getComponentState(componentId: string): UndoRedoState {
    const history = this.componentHistories.get(componentId);
    return history ? history.getState() : {
      canUndo: false,
      canRedo: false,
      undoDescription: null,
      redoDescription: null,
      historyLength: 0,
    };
  }

  /**
   * Clear all history
   */
  clearAll(): void {
    this.globalHistory.clear();
    this.componentHistories.forEach(history => history.clear());
    this.componentHistories.clear();
  }

  /**
   * Clear component history
   */
  clearComponent(componentId: string): void {
    const history = this.componentHistories.get(componentId);
    if (history) {
      history.clear();
      this.componentHistories.delete(componentId);
    }
  }

  /**
   * Get all component IDs with history
   */
  getComponentIds(): string[] {
    return Array.from(this.componentHistories.keys());
  }

  /**
   * Debug: Get full history
   */
  getDebugInfo(): any {
    return {
      global: this.globalHistory.getHistory(),
      components: Object.fromEntries(
        Array.from(this.componentHistories.entries()).map(([id, history]) => [
          id,
          history.getHistory(),
        ])
      ),
    };
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================

let globalUndoRedoManager: UndoRedoManager | null = null;

export function getUndoRedoManager(options?: UndoRedoOptions): UndoRedoManager {
  if (!globalUndoRedoManager) {
    globalUndoRedoManager = new UndoRedoManager(options);
  }
  return globalUndoRedoManager;
}

export function resetUndoRedoManager(): void {
  if (globalUndoRedoManager) {
    globalUndoRedoManager.clearAll();
  }
  globalUndoRedoManager = null;
}
