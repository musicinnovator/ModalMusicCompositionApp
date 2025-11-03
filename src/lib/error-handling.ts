import { toast } from 'sonner@2.0.3';

/**
 * Comprehensive error handling system for the musical application
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'validation' | 'generation' | 'audio' | 'file' | 'ui' | 'counterpoint' | 'modal' | 'memory' | 'midi';

export interface DetailedError {
  id: string;
  timestamp: Date;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  originalError?: Error;
  context?: Record<string, any>;
  stackTrace?: string;
  userAction?: string;
  suggestion?: string;
  recoverable: boolean;
}

export interface ErrorHandlingConfig {
  enableLogging: boolean;
  enableToasts: boolean;
  enableConsoleOutput: boolean;
  maxStoredErrors: number;
  enableErrorReporting: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

class ErrorHandlingSystem {
  private config: ErrorHandlingConfig;
  private errorHistory: DetailedError[] = [];
  private errorCounts: Map<string, number> = new Map();
  
  constructor(config: Partial<ErrorHandlingConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableToasts: true,
      enableConsoleOutput: true,
      maxStoredErrors: 100,
      enableErrorReporting: false,
      logLevel: 'error',
      ...config
    };
  }

  /**
   * Handle an error with comprehensive logging and user feedback
   */
  handleError(
    error: Error | string,
    category: ErrorCategory,
    severity: ErrorSeverity = 'medium',
    context: Record<string, any> = {},
    userAction?: string,
    suggestion?: string
  ): DetailedError {
    const detailedError = this.createDetailedError(
      error,
      category,
      severity,
      context,
      userAction,
      suggestion
    );

    // Store error
    this.storeError(detailedError);
    
    // Log error
    if (this.config.enableLogging) {
      this.logError(detailedError);
    }
    
    // Show user feedback
    if (this.config.enableToasts) {
      this.showUserFeedback(detailedError);
    }
    
    // Console output
    if (this.config.enableConsoleOutput) {
      this.consoleOutput(detailedError);
    }

    return detailedError;
  }

  /**
   * Handle counterpoint-specific errors
   */
  handleCounterpointError(
    error: Error | string,
    voice?: number,
    measure?: number,
    technique?: string,
    context: Record<string, any> = {}
  ): DetailedError {
    const enhancedContext = {
      ...context,
      voice,
      measure,
      technique,
      errorType: 'counterpoint'
    };

    let message = typeof error === 'string' ? error : error.message;
    if (voice !== undefined) message += ` (Voice ${voice + 1})`;
    if (measure !== undefined) message += ` (Measure ${measure + 1})`;

    return this.handleError(
      error,
      'counterpoint',
      'medium',
      enhancedContext,
      'Check counterpoint parameters and voice leading rules',
      'Try adjusting voice leading constraints or using a simpler technique'
    );
  }

  /**
   * Handle modal system errors
   */
  handleModalError(
    error: Error | string,
    modeName?: string,
    keySignature?: string,
    context: Record<string, any> = {}
  ): DetailedError {
    const enhancedContext = {
      ...context,
      modeName,
      keySignature,
      errorType: 'modal'
    };

    return this.handleError(
      error,
      'modal',
      'high',
      enhancedContext,
      'Check mode and key signature selections',
      'Verify mode is properly defined and key signature is valid'
    );
  }

  /**
   * Handle audio system errors
   */
  handleAudioError(
    error: Error | string,
    audioContext?: AudioContext,
    context: Record<string, any> = {}
  ): DetailedError {
    const enhancedContext = {
      ...context,
      audioContextState: audioContext?.state,
      audioContextSampleRate: audioContext?.sampleRate,
      errorType: 'audio'
    };

    return this.handleError(
      error,
      'audio',
      'high',
      enhancedContext,
      'Check browser audio permissions and device availability',
      'Try refreshing the page or using a different audio device'
    );
  }

  /**
   * Handle MIDI errors
   */
  handleMidiError(
    error: Error | string,
    midiSupported?: boolean,
    context: Record<string, any> = {}
  ): DetailedError {
    const enhancedContext = {
      ...context,
      midiSupported,
      userAgent: navigator.userAgent,
      isHTTPS: window.location.protocol === 'https:',
      errorType: 'midi'
    };

    const suggestion = !midiSupported 
      ? 'MIDI requires HTTPS deployment outside Figma Make environment'
      : 'Check MIDI device connection and browser permissions';

    return this.handleError(
      error,
      'midi',
      'medium',
      enhancedContext,
      'Check MIDI device and browser support',
      suggestion
    );
  }

  /**
   * Handle memory errors
   */
  handleMemoryError(
    error: Error | string,
    memoryUsage?: number,
    context: Record<string, any> = {}
  ): DetailedError {
    const enhancedContext = {
      ...context,
      memoryUsage,
      errorType: 'memory'
    };

    return this.handleError(
      error,
      'memory',
      'high',
      enhancedContext,
      'Clear generated data and reduce theme complexity',
      'Use the memory management controls to free up space'
    );
  }

  /**
   * Handle validation errors
   */
  handleValidationError(
    error: Error | string,
    fieldName?: string,
    value?: any,
    context: Record<string, any> = {}
  ): DetailedError {
    const enhancedContext = {
      ...context,
      fieldName,
      value,
      errorType: 'validation'
    };

    return this.handleError(
      error,
      'validation',
      'low',
      enhancedContext,
      `Check ${fieldName || 'input'} value`,
      'Ensure input meets the required format and constraints'
    );
  }

  /**
   * Safe execution wrapper with error handling
   */
  async safeExecute<T>(
    operation: () => T | Promise<T>,
    category: ErrorCategory,
    context: Record<string, any> = {},
    fallbackValue?: T
  ): Promise<T | undefined> {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      this.handleError(
        error instanceof Error ? error : new Error(String(error)),
        category,
        'medium',
        context
      );
      return fallbackValue;
    }
  }

  /**
   * Create a detailed error object
   */
  private createDetailedError(
    error: Error | string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    context: Record<string, any>,
    userAction?: string,
    suggestion?: string
  ): DetailedError {
    const message = typeof error === 'string' ? error : error.message;
    const originalError = typeof error === 'string' ? undefined : error;
    
    return {
      id: this.generateErrorId(),
      timestamp: new Date(),
      category,
      severity,
      message,
      originalError,
      context,
      stackTrace: originalError?.stack,
      userAction,
      suggestion,
      recoverable: severity !== 'critical'
    };
  }

  /**
   * Store error in history
   */
  private storeError(error: DetailedError): void {
    this.errorHistory.unshift(error);
    
    // Limit history size
    if (this.errorHistory.length > this.config.maxStoredErrors) {
      this.errorHistory = this.errorHistory.slice(0, this.config.maxStoredErrors);
    }
    
    // Update error counts
    const key = `${error.category}:${error.message}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
  }

  /**
   * Log error to system
   */
  private logError(error: DetailedError): void {
    const logEntry = {
      id: error.id,
      timestamp: error.timestamp.toISOString(),
      category: error.category,
      severity: error.severity,
      message: error.message,
      context: error.context,
      userAction: error.userAction,
      suggestion: error.suggestion
    };

    // In a real application, this would send to a logging service
    if (typeof window !== 'undefined' && (window as any).__errorLogs) {
      (window as any).__errorLogs.push(logEntry);
    } else if (typeof window !== 'undefined') {
      (window as any).__errorLogs = [logEntry];
    }
  }

  /**
   * Show user feedback via toast
   */
  private showUserFeedback(error: DetailedError): void {
    const isDuplicate = this.errorCounts.get(`${error.category}:${error.message}`) > 1;
    
    if (isDuplicate && error.severity === 'low') {
      // Don't spam user with duplicate low-severity errors
      return;
    }

    const title = this.getErrorTitle(error.category, error.severity);
    const description = error.suggestion ? `${error.message}\n💡 ${error.suggestion}` : error.message;

    switch (error.severity) {
      case 'critical':
        toast.error(title, { 
          description,
          duration: 10000,
          action: error.userAction ? {
            label: 'Help',
            onClick: () => console.log('User action:', error.userAction)
          } : undefined
        });
        break;
      case 'high':
        toast.error(title, { 
          description,
          duration: 8000
        });
        break;
      case 'medium':
        toast.warning(title, { 
          description,
          duration: 6000
        });
        break;
      case 'low':
        toast.info(title, { 
          description,
          duration: 4000
        });
        break;
    }
  }

  /**
   * Console output
   */
  private consoleOutput(error: DetailedError): void {
    const prefix = `🚨 [${error.category.toUpperCase()}:${error.severity.toUpperCase()}]`;
    const message = `${prefix} ${error.message}`;
    
    switch (error.severity) {
      case 'critical':
      case 'high':
        console.error(message, {
          error: error.originalError,
          context: error.context,
          stack: error.stackTrace
        });
        break;
      case 'medium':
        console.warn(message, {
          context: error.context,
          suggestion: error.suggestion
        });
        break;
      case 'low':
        if (this.config.logLevel === 'debug') {
          console.info(message, error.context);
        }
        break;
    }
  }

  /**
   * Get error title for UI display
   */
  private getErrorTitle(category: ErrorCategory, severity: ErrorSeverity): string {
    const categoryTitles: Record<ErrorCategory, string> = {
      validation: 'Input Validation',
      generation: 'Generation Error',
      audio: 'Audio System',
      file: 'File Operation',
      ui: 'User Interface',
      counterpoint: 'Counterpoint Engine',
      modal: 'Modal System',
      memory: 'Memory Management',
      midi: 'MIDI Integration'
    };

    const severityIndicators = {
      critical: '🔴',
      high: '🟠', 
      medium: '🟡',
      low: '🔵'
    };

    return `${severityIndicators[severity]} ${categoryTitles[category]} Error`;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `err_${timestamp}_${random}`;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    bySeverity: Record<ErrorSeverity, number>;
    byCategory: Record<ErrorCategory, number>;
    recent: DetailedError[];
  } {
    const bySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    const byCategory: Record<ErrorCategory, number> = {
      validation: 0,
      generation: 0,
      audio: 0,
      file: 0,
      ui: 0,
      counterpoint: 0,
      modal: 0,
      memory: 0,
      midi: 0
    };

    this.errorHistory.forEach(error => {
      bySeverity[error.severity]++;
      byCategory[error.category]++;
    });

    return {
      total: this.errorHistory.length,
      bySeverity,
      byCategory,
      recent: this.errorHistory.slice(0, 10)
    };
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errorHistory = [];
    this.errorCounts.clear();
  }

  /**
   * Export error log for debugging
   */
  exportErrorLog(): string {
    return JSON.stringify({
      exported: new Date().toISOString(),
      config: this.config,
      stats: this.getErrorStats(),
      errors: this.errorHistory
    }, null, 2);
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandlingSystem({
  enableLogging: true,
  enableToasts: true,
  enableConsoleOutput: true,
  maxStoredErrors: 50,
  logLevel: 'error'
});

// Convenience functions for common error types
export const handleError = errorHandler.handleError.bind(errorHandler);
export const handleCounterpointError = errorHandler.handleCounterpointError.bind(errorHandler);
export const handleModalError = errorHandler.handleModalError.bind(errorHandler);
export const handleAudioError = errorHandler.handleAudioError.bind(errorHandler);
export const handleMidiError = errorHandler.handleMidiError.bind(errorHandler);
export const handleMemoryError = errorHandler.handleMemoryError.bind(errorHandler);
export const handleValidationError = errorHandler.handleValidationError.bind(errorHandler);
export const safeExecute = errorHandler.safeExecute.bind(errorHandler);

// Error boundary hook for React components
export const useErrorHandler = () => {
  return {
    handleError: errorHandler.handleError.bind(errorHandler),
    handleCounterpointError: errorHandler.handleCounterpointError.bind(errorHandler),
    handleModalError: errorHandler.handleModalError.bind(errorHandler),
    handleAudioError: errorHandler.handleAudioError.bind(errorHandler),
    handleMidiError: errorHandler.handleMidiError.bind(errorHandler),
    handleMemoryError: errorHandler.handleMemoryError.bind(errorHandler),
    handleValidationError: errorHandler.handleValidationError.bind(errorHandler),
    safeExecute: errorHandler.safeExecute.bind(errorHandler),
    getErrorStats: () => errorHandler.getErrorStats(),
    clearHistory: () => errorHandler.clearHistory(),
    exportErrorLog: () => errorHandler.exportErrorLog()
  };
};

// Global error event listener
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorHandler.handleError(
      event.error || new Error(event.message),
      'ui',
      'high',
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'javascript_error'
      }
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleError(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      'ui',
      'high',
      {
        reason: event.reason,
        type: 'promise_rejection'
      }
    );
  });
}

export default errorHandler;