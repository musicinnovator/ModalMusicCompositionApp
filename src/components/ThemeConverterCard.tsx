/**
 * THEME CONVERTER CARD
 * 
 * Feature: Component-to-Theme Conversion System
 * Allows users to convert any generated component into a new current theme
 * 
 * Functionality:
 * - Select any available component from all generators
 * - "Set as Current Theme" action with preview
 * - Full pipeline integration (all generators work with converted theme)
 * - Cancel/Revert capability to restore previous theme
 * - Comprehensive error handling and validation
 * 
 * Preservation Commitment:
 * - Zero modifications to existing functionality
 * - Additive-only implementation
 * - All existing generators remain unchanged
 * - Backward compatible with full pipeline
 */

import { useState, useCallback, useMemo } from 'react';
import { Theme, Rhythm, NoteValue, EnhancedTheme, BachLikeVariables, BachVariableName } from '../types/musical';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { RefreshCw, ArrowRight, Undo2, Check, AlertTriangle, Music2, Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { InstrumentType } from '../lib/enhanced-synthesis';
import { MelodyVisualizer } from './MelodyVisualizer';

/**
 * Component data structure from Available Components
 * Unified format from all generators
 */
export interface ConvertibleComponent {
  id: string;
  name: string;
  type: 'theme' | 'imitation' | 'fugue' | 'counterpoint' | 'part' | 'harmony' | 'canon' | 'generated-fugue' | 'arpeggio';
  melody: Theme;
  rhythm: Rhythm;
  noteValues?: NoteValue[];
  harmonyNotes?: Theme[];
  instrument?: InstrumentType | string;
  timestamp: number;
  metadata?: {
    canonType?: string;
    voiceIndex?: number;
    fugueArchitecture?: string;
    voiceRole?: string;
    technique?: string;
    [key: string]: any;
  };
}

/**
 * Theme history entry for undo/revert functionality
 */
interface ThemeHistoryEntry {
  theme: Theme;
  enhancedTheme: EnhancedTheme;
  themeRhythm: NoteValue[];
  bachVariables: BachLikeVariables;
  bachVariableRhythms: Record<BachVariableName, NoteValue[]>;
  timestamp: number;
  description: string;
}

export interface ThemeConverterCardProps {
  // Available components from all generators
  availableComponents: ConvertibleComponent[];
  
  // Current state (read-only for display)
  currentTheme: Theme;
  currentEnhancedTheme: EnhancedTheme;
  currentThemeRhythm: NoteValue[];
  currentBachVariables: BachLikeVariables;
  currentBachVariableRhythms: Record<BachVariableName, NoteValue[]>;
  
  // State update callbacks (additive only)
  onThemeChange: (theme: Theme) => void;
  onEnhancedThemeChange: (enhancedTheme: EnhancedTheme) => void;
  onThemeRhythmChange: (rhythm: NoteValue[]) => void;
  onBachVariablesChange?: (bachVariables: BachLikeVariables) => void;
  onBachVariableRhythmChange?: (variableName: BachVariableName, rhythm: NoteValue[]) => void;
}

export function ThemeConverterCard({
  availableComponents,
  currentTheme,
  currentEnhancedTheme,
  currentThemeRhythm,
  currentBachVariables,
  currentBachVariableRhythms,
  onThemeChange,
  onEnhancedThemeChange,
  onThemeRhythmChange,
  onBachVariablesChange,
  onBachVariableRhythmChange
}: ThemeConverterCardProps) {
  // Selected component for conversion
  const [selectedComponentId, setSelectedComponentId] = useState<string>('');
  
  // Theme history for undo/revert (stores previous state before conversion)
  const [themeHistory, setThemeHistory] = useState<ThemeHistoryEntry | null>(null);
  
  // Conversion state
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  /**
   * Get the selected component object
   */
  const selectedComponent = useMemo(() => {
    if (!selectedComponentId) return null;
    return availableComponents.find(comp => comp.id === selectedComponentId) || null;
  }, [selectedComponentId, availableComponents]);

  /**
   * Validate component for theme conversion
   * ADDITIVE FIX: Enhanced validation with better error messages for debugging
   */
  const validateComponent = useCallback((component: ConvertibleComponent): { valid: boolean; warnings: string[]; error?: string } => {
    const warnings: string[] = [];
    
    // Check if component exists
    if (!component) {
      return { valid: false, error: 'Component not found', warnings };
    }

    // ADDITIVE FIX: Enhanced melody validation with detailed error messages
    // Check melody exists
    if (!component.melody) {
      console.error('❌ Validation Error: Component has no melody property', component);
      return { valid: false, error: 'Component has no melody property', warnings };
    }

    // Check if melody is iterable (array or array-like)
    if (typeof component.melody !== 'object') {
      console.error('❌ Validation Error: Melody is not an object/array', {
        type: typeof component.melody,
        value: component.melody,
        component
      });
      return { valid: false, error: `Melody must be an array, got ${typeof component.melody}`, warnings };
    }

    // ADDITIVE FIX: Try to convert melody to array if it's array-like but not an array
    let melodyArray: Theme;
    try {
      if (Array.isArray(component.melody)) {
        melodyArray = component.melody;
      } else if (component.melody && typeof component.melody === 'object' && 'length' in component.melody) {
        // Array-like object - convert to array
        melodyArray = Array.from(component.melody as any);
        console.warn('⚠️ Converted array-like melody to array:', melodyArray);
      } else {
        console.error('❌ Validation Error: Melody is not array or array-like', {
          melody: component.melody,
          hasLength: 'length' in (component.melody as any),
          isIterable: Symbol.iterator in Object(component.melody)
        });
        return { valid: false, error: 'Melody is not iterable (not an array)', warnings };
      }
    } catch (conversionError) {
      console.error('❌ Validation Error: Failed to convert melody to array', conversionError);
      return { valid: false, error: 'Failed to process melody data', warnings };
    }

    // Check melody is not empty
    if (melodyArray.length === 0) {
      return { valid: false, error: 'Component melody is empty', warnings };
    }

    // Check for all rests
    const validNotes = melodyArray.filter(note => note !== -1);
    if (validNotes.length === 0) {
      return { valid: false, error: 'Component contains only rests', warnings };
    }

    // Warning: Mostly rests
    if (validNotes.length < melodyArray.length * 0.3) {
      warnings.push('Melody contains mostly rests (>70%)');
    }

    // Warning: Very long melody
    if (melodyArray.length > 64) {
      warnings.push(`Long melody (${melodyArray.length} notes) - may be trimmed to 32 notes`);
    }

    // Warning: Single note
    if (validNotes.length === 1) {
      warnings.push('Melody contains only one note');
    }

    // Check MIDI range
    const outOfRange = validNotes.filter(note => note < 21 || note > 108);
    if (outOfRange.length > 0) {
      warnings.push(`${outOfRange.length} notes out of standard MIDI range (21-108)`);
    }

    return { valid: true, warnings };
  }, []);

  /**
   * Convert component to theme
   */
  const handleConvertToTheme = useCallback(() => {
    if (!selectedComponent) {
      toast.error('Please select a component first');
      return;
    }

    setIsConverting(true);
    setConversionError(null);

    try {
      // ADDITIVE FIX: Log component structure for debugging
      console.log('🔍 Converting component to theme:', {
        id: selectedComponent.id,
        name: selectedComponent.name,
        type: selectedComponent.type,
        hasMelody: !!selectedComponent.melody,
        melodyType: typeof selectedComponent.melody,
        isArray: Array.isArray(selectedComponent.melody),
        melodyLength: selectedComponent.melody?.length,
        hasRhythm: !!selectedComponent.rhythm,
        hasNoteValues: !!selectedComponent.noteValues
      });

      // Validate component
      const validation = validateComponent(selectedComponent);
      if (!validation.valid) {
        console.error('❌ Component validation failed:', validation.error);
        setConversionError(validation.error || 'Invalid component');
        toast.error(validation.error || 'Cannot convert invalid component');
        setIsConverting(false);
        return;
      }

      // Show warnings if any
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          toast.warning(warning, { duration: 4000 });
        });
      }

      // SAVE CURRENT STATE TO HISTORY (for undo/revert)
      const historyEntry: ThemeHistoryEntry = {
        theme: [...currentTheme],
        enhancedTheme: {
          melody: [...currentEnhancedTheme.melody],
          restDurations: new Map(currentEnhancedTheme.restDurations)
        },
        themeRhythm: [...currentThemeRhythm],
        bachVariables: JSON.parse(JSON.stringify(currentBachVariables)),
        bachVariableRhythms: JSON.parse(JSON.stringify(currentBachVariableRhythms)),
        timestamp: Date.now(),
        description: `Theme before converting from ${selectedComponent.name}`
      };
      setThemeHistory(historyEntry);

      // ADDITIVE FIX: Ensure melody is a proper array before slicing
      let melodyToConvert: Theme;
      
      // Step 1: Normalize to array
      if (Array.isArray(selectedComponent.melody)) {
        melodyToConvert = selectedComponent.melody;
        console.log('✅ Melody is already an array');
      } else if (selectedComponent.melody && typeof selectedComponent.melody === 'object' && 'length' in selectedComponent.melody) {
        // Convert array-like to array
        try {
          melodyToConvert = Array.from(selectedComponent.melody as any);
          console.warn('⚠️ Converted array-like melody to array for conversion');
        } catch (conversionError: any) {
          console.error('❌ Failed to convert array-like melody:', conversionError);
          throw new Error('Melody data is corrupted: Cannot convert to array');
        }
      } else {
        console.error('❌ Melody is not an array or array-like object');
        throw new Error('Melody is not iterable - cannot convert to theme');
      }

      // Step 2: Verify melody is valid array with slice method
      if (!melodyToConvert || typeof melodyToConvert.slice !== 'function') {
        console.error('❌ Melody does not have slice method:', {
          melodyToConvert,
          type: typeof melodyToConvert,
          hasSlice: typeof melodyToConvert?.slice
        });
        throw new Error('Melody data is corrupted: Not a valid array');
      }

      // Step 3: Extract melody (limit to 32 notes to prevent memory issues)
      let newMelody: Theme;
      try {
        newMelody = melodyToConvert.slice(0, 32);
        console.log(`✅ Extracted ${newMelody.length} notes from melody`);
      } catch (sliceError: any) {
        console.error('❌ Failed to slice melody array:', sliceError);
        throw new Error(`Melody data is corrupted: ${sliceError.message}`);
      }

      // Step 4: Extract or reconstruct rhythm
      let newRhythm: NoteValue[];
      try {
        if (selectedComponent.noteValues && Array.isArray(selectedComponent.noteValues) && selectedComponent.noteValues.length === newMelody.length) {
          // Use noteValues if available and valid
          newRhythm = selectedComponent.noteValues.slice(0, 32);
          console.log(`✅ Using ${newRhythm.length} note values from component`);
        } else {
          // Default to quarter notes
          newRhythm = Array(newMelody.length).fill('quarter' as NoteValue);
          console.log(`✅ Generated ${newRhythm.length} quarter notes as default rhythm`);
        }
      } catch (rhythmError: any) {
        console.error('❌ Failed to process rhythm, using default:', rhythmError);
        // Failsafe: always provide a rhythm
        newRhythm = Array(newMelody.length).fill('quarter' as NoteValue);
      }

      // Create enhanced theme with preserved rest durations
      const newEnhancedTheme: EnhancedTheme = {
        melody: newMelody,
        restDurations: new Map(currentEnhancedTheme.restDurations) // Preserve existing rest durations
      };

      // UPDATE STATE (additive - using callbacks provided by parent)
      onThemeChange(newMelody);
      onEnhancedThemeChange(newEnhancedTheme);
      onThemeRhythmChange(newRhythm);

      // Success notification
      const componentLabel = `${selectedComponent.name}`;
      toast.success(`Theme updated from ${componentLabel}`, {
        description: `${newMelody.length} notes • ${selectedComponent.instrument || 'default instrument'}`
      });

      console.log('✅ Theme converted successfully:', {
        from: selectedComponent.name,
        type: selectedComponent.type,
        notes: newMelody.length,
        instrument: selectedComponent.instrument,
        hasHistory: true
      });

      setIsConverting(false);
    } catch (error: any) {
      // ADDITIVE FIX: Enhanced error logging with component details
      console.error('❌ Error converting component to theme:', {
        error,
        errorMessage: error?.message,
        errorStack: error?.stack,
        componentId: selectedComponent?.id,
        componentType: selectedComponent?.type,
        componentName: selectedComponent?.name,
        melodyType: typeof selectedComponent?.melody,
        melodyIsArray: Array.isArray(selectedComponent?.melody),
        componentStructure: selectedComponent
      });
      
      // Determine user-friendly error message
      let userFriendlyMessage: string;
      if (error?.message?.includes('not iterable')) {
        userFriendlyMessage = 'Melody data format issue. Check browser console (F12) for details.';
      } else if (error?.message?.includes('corrupted')) {
        userFriendlyMessage = 'Data structure issue detected. Please check console for diagnostic logs.';
      } else if (error?.message?.includes('slice')) {
        userFriendlyMessage = 'Cannot process melody array. See console for details.';
      } else {
        userFriendlyMessage = error.message || 'Conversion failed. Check console for details.';
      }
      
      setConversionError(userFriendlyMessage);
      toast.error('Failed to convert component to theme', {
        description: userFriendlyMessage
      });
      setIsConverting(false);
    }
  }, [
    selectedComponent,
    currentTheme,
    currentEnhancedTheme,
    currentThemeRhythm,
    currentBachVariables,
    currentBachVariableRhythms,
    onThemeChange,
    onEnhancedThemeChange,
    onThemeRhythmChange,
    validateComponent
  ]);

  /**
   * Revert to previous theme (undo conversion)
   */
  const handleRevertToPrevious = useCallback(() => {
    if (!themeHistory) {
      toast.error('No previous theme to restore');
      return;
    }

    try {
      // Restore all state from history
      onThemeChange(themeHistory.theme);
      onEnhancedThemeChange(themeHistory.enhancedTheme);
      onThemeRhythmChange(themeHistory.themeRhythm);
      
      if (onBachVariablesChange) {
        onBachVariablesChange(themeHistory.bachVariables);
      }

      if (onBachVariableRhythmChange) {
        Object.entries(themeHistory.bachVariableRhythms).forEach(([varName, rhythm]) => {
          onBachVariableRhythmChange(varName as BachVariableName, rhythm);
        });
      }

      toast.success('Reverted to previous theme', {
        description: themeHistory.description
      });

      console.log('✅ Theme reverted successfully:', {
        timestamp: themeHistory.timestamp,
        description: themeHistory.description
      });

      // Clear history after successful revert
      setThemeHistory(null);
      setSelectedComponentId('');
    } catch (error: any) {
      console.error('❌ Error reverting theme:', error);
      toast.error('Failed to revert to previous theme');
    }
  }, [
    themeHistory,
    onThemeChange,
    onEnhancedThemeChange,
    onThemeRhythmChange,
    onBachVariablesChange,
    onBachVariableRhythmChange
  ]);

  /**
   * Get validation status for selected component
   */
  const validationStatus = useMemo(() => {
    if (!selectedComponent) return null;
    return validateComponent(selectedComponent);
  }, [selectedComponent, validateComponent]);

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Component → Theme Converter</h3>
              <p className="text-xs text-muted-foreground">
                Convert any generated part into a new theme
              </p>
            </div>
          </div>
          {themeHistory && (
            <Badge variant="outline" className="gap-1 bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400">
              <Undo2 className="w-3 h-3" />
              Undo Available
            </Badge>
          )}
        </div>

        <Separator />

        {/* Component Selection */}
        <div className="space-y-2">
          <Label htmlFor="component-select" className="text-sm">
            Select Component to Convert
          </Label>
          <Select value={selectedComponentId} onValueChange={setSelectedComponentId}>
            <SelectTrigger id="component-select" className="w-full">
              <SelectValue placeholder="Choose a generated component..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {availableComponents.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground text-center">
                  No components available yet.<br />
                  Generate parts using Canon, Fugue, Harmony, etc.
                </div>
              ) : (
                availableComponents.map((component) => (
                  <SelectItem key={component.id} value={component.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {component.type}
                      </Badge>
                      <span className="truncate">{component.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        ({component.melody?.length || 0} notes)
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Preview & Validation */}
        {selectedComponent && (
          <div className="space-y-3">
            <Separator />
            
            {/* Component Info */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="text-muted-foreground">Type:</div>
                <Badge variant="secondary">{selectedComponent.type}</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Notes:</div>
                <div className="font-medium">{selectedComponent.melody.length}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Instrument:</div>
                <div className="font-medium">{selectedComponent.instrument || 'default'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Valid Notes:</div>
                <div className="font-medium">
                  {selectedComponent.melody.filter(n => n !== -1).length}
                </div>
              </div>
            </div>

            {/* Validation Status */}
            {validationStatus && (
              <div className="space-y-2">
                {!validationStatus.valid && validationStatus.error && (
                  <Alert variant="destructive" className="py-2">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription className="text-xs">
                      {validationStatus.error}
                    </AlertDescription>
                  </Alert>
                )}
                {validationStatus.valid && validationStatus.warnings.length > 0 && (
                  <Alert className="py-2 bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                    <AlertDescription className="text-xs text-amber-800 dark:text-amber-300">
                      {validationStatus.warnings.map((warning, idx) => (
                        <div key={idx}>• {warning}</div>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}
                {validationStatus.valid && validationStatus.warnings.length === 0 && (
                  <Alert className="py-2 bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-500" />
                    <AlertDescription className="text-xs text-green-800 dark:text-green-300">
                      Component is valid and ready to convert
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Mini Visualizer Preview */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
              <div className="text-xs text-muted-foreground mb-2">Preview:</div>
              <MelodyVisualizer
                melody={selectedComponent.melody.slice(0, 32)}
                color="#a855f7"
                height={60}
              />
            </div>
          </div>
        )}

        {/* Conversion Error */}
        {conversionError && (
          <Alert variant="destructive" className="py-2">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-xs">
              {conversionError}
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleConvertToTheme}
            disabled={!selectedComponent || isConverting || (validationStatus && !validationStatus.valid)}
            className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isConverting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                Set as Current Theme
              </>
            )}
          </Button>

          {themeHistory && (
            <Button
              onClick={handleRevertToPrevious}
              variant="outline"
              className="gap-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
            >
              <Undo2 className="w-4 h-4" />
              Revert
            </Button>
          )}
        </div>

        {/* Usage Hint */}
        <div className="bg-purple-100 dark:bg-purple-950/30 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-purple-800 dark:text-purple-300 space-y-1">
              <div className="font-medium">How it works:</div>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Select any component from Canon, Fugue, Harmony, etc.</li>
                <li>Click "Set as Current Theme" to convert it</li>
                <li>Use the new theme in all generators (Canon, Fugue, etc.)</li>
                <li>Click "Revert" to undo and restore previous theme</li>
              </ol>
              <div className="mt-2 text-purple-700 dark:text-purple-400 italic">
                New theme named: "Theme from [Component Name]"
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
