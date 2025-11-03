import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  BachLikeVariables, 
  BachVariableName, 
  getBachVariableLabel,
  getBachVariableShortLabel,
  BUILT_IN_BACH_VARIABLES,
  BACH_VARIABLE_SHORT_LABELS,
  PITCH_NAMES, 
  Melody, 
  MidiNote,
  midiNoteToNoteName,
  pitchClassToMidiNote,
  pitchClassAndOctaveToMidiNote,
  melodyElementToString,
  isRest,
  isNote,
  RestValue,
  RestDuration,
  Mode,
  KeySignature
} from '../types/musical';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { X, Plus, Shuffle, Trash2, Music, Copy, FileText, Pause, Sliders, PlusCircle } from 'lucide-react';
import { ModeScaleBuilder } from './ModeScaleBuilder';
import { RhythmControlsEnhanced } from './RhythmControlsEnhanced';
import { ArpeggioPatternSelector } from './ArpeggioPatternSelector';
import { toast } from 'sonner@2.0.3';
import { NoteValue } from '../types/musical';

interface BachLikeVariablesProps {
  variables: BachLikeVariables;
  onVariablesChange: (variables: BachLikeVariables) => void;
  onUseAsTheme: (melody: Melody, variableName: string) => void;
  onMidiTargetChange?: (targetVariable: BachVariableName | null) => void;
  selectedMode?: Mode | null;
  selectedKeySignature?: KeySignature | null;
  // Rhythm functionality
  variableRhythms?: Record<BachVariableName, NoteValue[]>;
  onVariableRhythmChange?: (variableName: BachVariableName, rhythm: NoteValue[]) => void;
  // Current theme from Traditional mode
  currentTheme?: Melody;
}

export function BachLikeVariables({ 
  variables, 
  onVariablesChange, 
  onUseAsTheme, 
  onMidiTargetChange,
  selectedMode,
  selectedKeySignature,
  variableRhythms,
  onVariableRhythmChange,
  currentTheme
}: BachLikeVariablesProps) {
  const [selectedPitch, setSelectedPitch] = useState<number>(0);
  const [activeVariable, setActiveVariable] = useState<BachVariableName>('cantusFirmus');
  const [asciiInput, setAsciiInput] = useState('');
  const [selectedRestDuration, setSelectedRestDuration] = useState<RestDuration>('quarter-rest');
  const [autoRestProbability, setAutoRestProbability] = useState(20); // 20% chance of auto-adding rests
  const [enableAutoRests, setEnableAutoRests] = useState(false);
  
  // New variable creation
  const [showAddVariableDialog, setShowAddVariableDialog] = useState(false);
  const [newVariableName, setNewVariableName] = useState('');
  const [newVariableShortName, setNewVariableShortName] = useState('');
  
  // Get current rhythm for active variable
  const currentRhythm = useMemo(() => {
    if (!variableRhythms || !variableRhythms[activeVariable]) {
      const varLength = variables[activeVariable]?.length || 0;
      return Array(varLength).fill('quarter' as NoteValue);
    }
    return variableRhythms[activeVariable];
  }, [variableRhythms, activeVariable, variables]);
  
  // Set initial MIDI target when component mounts and update when activeVariable changes
  useEffect(() => {
    // Set the MIDI target to the active variable whenever it changes
    if (onMidiTargetChange) {
      console.log('🎯 BachLikeVariables: Setting MIDI target to', activeVariable);
      onMidiTargetChange(activeVariable);
    }
  }, [activeVariable, onMidiTargetChange]); // Update whenever activeVariable changes
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any lingering state or references
      setAsciiInput('');
    };
  }, []);
  
  // Memory optimization: Use callbacks to prevent unnecessary re-renders
  const updateVariable = useCallback((name: BachVariableName, melody: Melody) => {
    try {
      const newVariables = { ...variables, [name]: melody };
      onVariablesChange(newVariables);
    } catch (err) {
      console.error('Error updating Bach variable:', err);
      toast.error('Failed to update variable');
    }
  }, [variables, onVariablesChange]);

  const addNoteToVariable = useCallback((name: BachVariableName, midiNote: MidiNote) => {
    try {
      if (typeof midiNote !== 'number' || midiNote < 0 || midiNote > 127) {
        console.warn('Invalid MIDI note value:', midiNote);
        return;
      }
      
      const currentMelody = variables[name] || [];
      if (currentMelody.length >= 32) { // Limit melody length for memory
        toast.warning('Maximum melody length (32 notes) reached');
        return;
      }
      
      let updatedMelody = [...currentMelody, midiNote];
      
      // Auto-add rests based on probability
      if (enableAutoRests && Math.random() * 100 < autoRestProbability) {
        updatedMelody.push(-1 as RestValue); // Add rest after note
        toast.info(`Added note with auto-rest to ${getBachVariableShortLabel(name)} (${autoRestProbability}% chance)`);
      }
      
      updateVariable(name, updatedMelody);
    } catch (err) {
      console.error('Error adding note to Bach variable:', err);
      toast.error('Failed to add note');
    }
  }, [variables, updateVariable, enableAutoRests, autoRestProbability]);

  const addRestToVariable = useCallback((name: BachVariableName) => {
    try {
      const currentMelody = variables[name] || [];
      if (currentMelody.length >= 32) { // Limit melody length for memory
        toast.warning('Maximum melody length (32 notes) reached');
        return;
      }
      
      updateVariable(name, [...currentMelody, -1 as RestValue]);
      toast.success(`Added ${selectedRestDuration} to ${getBachVariableShortLabel(name)}`);
    } catch (err) {
      console.error('Error adding rest to Bach variable:', err);
      toast.error('Failed to add rest');
    }
  }, [variables, updateVariable, selectedRestDuration]);

  const removeNoteFromVariable = useCallback((name: BachVariableName, index: number) => {
    try {
      const currentMelody = variables[name] || [];
      if (index < 0 || index >= currentMelody.length) {
        console.warn('Invalid note index for removal:', index);
        return;
      }
      
      updateVariable(name, currentMelody.filter((_, i) => i !== index));
    } catch (err) {
      console.error('Error removing note from Bach variable:', err);
      toast.error('Failed to remove note');
    }
  }, [variables, updateVariable]);

  const clearVariable = useCallback((name: BachVariableName) => {
    try {
      updateVariable(name, []);
      toast.success(`${getBachVariableShortLabel(name)} cleared`);
    } catch (err) {
      console.error('Error clearing Bach variable:', err);
      toast.error('Failed to clear variable');
    }
  }, [updateVariable]);

  const generateRandomVariable = useCallback((name: BachVariableName) => {
    try {
      const length = Math.floor(Math.random() * 8) + 4; // 4-11 notes
      const baseOctave = 4; // Middle octave
      const baseKey = Math.floor(Math.random() * 12);
      const scale = [0, 2, 4, 5, 7, 9, 11]; // Major scale intervals
      
      const newMelody: Melody = [];
      for (let i = 0; i < length; i++) {
        const scaleIndex = Math.floor(Math.random() * scale.length);
        const pitchClass = (baseKey + scale[scaleIndex]) % 12;
        const octaveVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1 octave variation
        const octave = Math.max(2, Math.min(6, baseOctave + octaveVariation)); // Keep in reasonable range
        const midiNote = pitchClassAndOctaveToMidiNote(pitchClass, octave);
        newMelody.push(midiNote);
      }
      
      updateVariable(name, newMelody);
      toast.success(`${BACH_VARIABLE_SHORT_LABELS[name]} generated`);
    } catch (err) {
      console.error('Error generating random Bach variable:', err);
      toast.error('Failed to generate variable');
    }
  }, [updateVariable]);

  const parseAsciiInput = useCallback((input: string): Melody => {
    try {
      // Support multiple formats: note names, numbers, or comma-separated
      const cleaned = input.trim().toUpperCase();
      
      if (!cleaned) return [];
      
      // Try to parse as comma-separated numbers (MIDI notes)
      if (/^[\d,\s]+$/.test(cleaned)) {
        return cleaned.split(',')
          .map(s => parseInt(s.trim()))
          .filter(n => !isNaN(n) && n >= 0 && n <= 127);
      }
      
      // Try to parse as note names with octaves (C4, D#5, etc.)
      const notePattern = /([A-G][#b]?)(\d?)/g;
      const matches = cleaned.matchAll(notePattern);
      
      return Array.from(matches).map(match => {
        const noteName = match[1];
        const octaveStr = match[2];
        const octave = octaveStr ? parseInt(octaveStr) : 4; // Default to octave 4
        
        // Convert note name to pitch class
        const noteMap: Record<string, number> = {
          'C': 0, 'C#': 1, 'DB': 1, 'D': 2, 'D#': 3, 'EB': 3,
          'E': 4, 'F': 5, 'F#': 6, 'GB': 6, 'G': 7, 'G#': 8,
          'AB': 8, 'A': 9, 'A#': 10, 'BB': 10, 'B': 11
        };
        const pitchClass = noteMap[noteName] ?? 0;
        return pitchClassAndOctaveToMidiNote(pitchClass, octave);
      });
    } catch (err) {
      console.error('Error parsing ASCII input:', err);
      return [];
    }
  }, []);

  const applyAsciiInput = useCallback(() => {
    try {
      const melody = parseAsciiInput(asciiInput);
      if (melody.length === 0) {
        toast.warning('No valid notes found in input');
        return;
      }
      
      if (melody.length > 32) {
        toast.warning('Input too long, truncating to 32 notes');
        updateVariable(activeVariable, melody.slice(0, 32));
      } else {
        updateVariable(activeVariable, melody);
      }
      
      setAsciiInput('');
      toast.success(`${getBachVariableShortLabel(activeVariable)} updated from ASCII`);
    } catch (err) {
      console.error('Error applying ASCII input:', err);
      toast.error('Failed to apply ASCII input');
    }
  }, [asciiInput, activeVariable, parseAsciiInput, updateVariable]);

  // Fallback clipboard copy for restricted environments
  const fallbackCopyToClipboard = (text: string, variableName: BachVariableName) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        toast.success(`${getBachVariableShortLabel(variableName)} copied to clipboard`);
      } else {
        toast.warning(`Copy text: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      toast.warning(`Copy text: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
    }
  };

  const copyVariable = useCallback((name: BachVariableName) => {
    try {
      const melody = variables[name] || [];
      if (melody.length === 0) {
        toast.warning('Variable is empty');
        return;
      }
      
      const noteNames = melody.map(midiNote => midiNoteToNoteName(midiNote)).join(', ');
      
      // Fallback clipboard method for restricted environments (e.g., Figma Make)
      try {
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(noteNames).then(() => {
            toast.success(`${getBachVariableShortLabel(name)} copied to clipboard`);
          }).catch(() => {
            // Fallback to textarea method
            fallbackCopyToClipboard(noteNames, name);
          });
        } else {
          // Use fallback method
          fallbackCopyToClipboard(noteNames, name);
        }
      } catch (clipboardErr) {
        // Use fallback method
        fallbackCopyToClipboard(noteNames, name);
      }
    } catch (err) {
      console.error('Error copying variable:', err);
      toast.error('Failed to copy variable');
    }
  }, [variables]);

  // Handle adding notes to specific Bach variable from ModeScaleBuilder
  const handleAddToTarget = useCallback((notes: MidiNote[], target: BachVariableName | 'theme') => {
    try {
      if (target === 'theme') {
        // This shouldn't happen in Bach Variables, but handle gracefully
        console.warn('Theme target not supported in Bach Variables');
        return;
      }
      
      if (target in variables) {
        const currentMelody = variables[target] || [];
        const newMelody = [...currentMelody, ...notes].slice(0, 32); // Limit to 32 notes
        
        updateVariable(target, newMelody);
        
        const noteNames = notes.slice(0, 3).map(note => midiNoteToNoteName(note)).join(', ');
        const displayText = notes.length > 3 ? `${noteNames}...` : noteNames;
        toast.success(`Added ${notes.length} notes to ${getBachVariableShortLabel(target)}: ${displayText}`);
      }
    } catch (err) {
      console.error('Error adding notes to Bach variable:', err);
      toast.error('Failed to add notes');
    }
  }, [variables, updateVariable]);

  // Add new variable handler with comprehensive validation
  const handleAddVariable = useCallback(() => {
    try {
      // Validation
      if (!newVariableName.trim()) {
        toast.error('Please enter a variable name');
        return;
      }
      
      // Create a camelCase variable name from the input
      let variableName = newVariableName.trim();
      
      // Remove special characters and convert to camelCase
      variableName = variableName
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
        .replace(/\s+(.)/g, (_, char) => char.toUpperCase()) // Convert spaces to camelCase
        .replace(/^(.)/, (_, char) => char.toLowerCase()); // Ensure first char is lowercase
      
      // Ensure name is not empty after sanitization
      if (!variableName) {
        toast.error('Please enter a valid variable name (letters and numbers only)');
        return;
      }
      
      // Check for duplicate names
      if (variableName in variables) {
        toast.error(`Variable "${variableName}" already exists. Please choose a different name.`);
        return;
      }
      
      // Validate name length
      if (variableName.length > 50) {
        toast.error('Variable name too long (max 50 characters)');
        return;
      }
      
      // Add the new variable with an empty melody
      const newVariables = {
        ...variables,
        [variableName]: []
      };
      
      console.log('✅ Creating new Bach variable:', variableName);
      onVariablesChange(newVariables);
      
      // CRITICAL: Set the active variable first, which will trigger the effect to update MIDI target
      setActiveVariable(variableName as BachVariableName);
      
      // IMPORTANT: Also set MIDI target directly to ensure it happens immediately
      // This provides a belt-and-suspenders approach for MIDI routing
      if (onMidiTargetChange) {
        console.log('🎯 BachLikeVariables: IMMEDIATELY routing MIDI to new variable:', variableName);
        // Use setTimeout to ensure state updates have completed
        setTimeout(() => {
          if (onMidiTargetChange) {
            onMidiTargetChange(variableName as BachVariableName);
            console.log('🎯 BachLikeVariables: MIDI target confirmed set to:', variableName);
          }
        }, 0);
      }
      
      setShowAddVariableDialog(false);
      setNewVariableName('');
      setNewVariableShortName('');
      
      toast.success(`Created "${variableName}" - MIDI now routing to this variable`, { duration: 4000 });
    } catch (err) {
      console.error('❌ Error adding new variable:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to add variable: ${errorMessage}`);
    }
  }, [newVariableName, variables, onVariablesChange, onMidiTargetChange]);
  
  // Delete custom variable handler with comprehensive error handling
  const handleDeleteVariable = useCallback((name: string) => {
    try {
      // Validation
      if (!name || typeof name !== 'string') {
        console.error('❌ Invalid variable name for deletion:', name);
        toast.error('Invalid variable name');
        return;
      }
      
      // Only allow deletion of custom variables (not built-in ones)
      if (BUILT_IN_BACH_VARIABLES.includes(name as any)) {
        toast.error('Cannot delete built-in variables');
        return;
      }
      
      // Check if variable exists
      if (!(name in variables)) {
        console.error('❌ Variable not found:', name);
        toast.error('Variable not found');
        return;
      }
      
      // Create new variables object without the deleted variable
      const newVariables = { ...variables };
      delete newVariables[name];
      
      console.log('✅ Deleting Bach variable:', name);
      onVariablesChange(newVariables);
      
      // If the deleted variable was active, switch to cantusFirmus
      if (activeVariable === name) {
        const newActiveVariable = 'cantusFirmus';
        setActiveVariable(newActiveVariable);
        
        // Update MIDI target
        if (onMidiTargetChange) {
          console.log('🎯 Switching MIDI target to:', newActiveVariable);
          onMidiTargetChange(newActiveVariable);
        }
      }
      
      toast.success(`Deleted variable: ${name}`);
    } catch (err) {
      console.error('❌ Error deleting variable:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to delete variable: ${errorMessage}`);
    }
  }, [variables, onVariablesChange, activeVariable, onMidiTargetChange]);

  // Memory optimization: Memoize variable entries to prevent recreating on each render
  const variableEntries = useMemo(() => 
    Object.entries(variables) as [BachVariableName, Melody][],
    [variables]
  );

  const filledVariablesCount = useMemo(() => 
    variableEntries.filter(([, melody]) => melody.length > 0).length,
    [variableEntries]
  );

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2>Bach-like Variables</h2>
          <Badge variant="outline" className="text-xs">
            {filledVariablesCount} / {variableEntries.length} filled
          </Badge>
        </div>
        
        {/* Button group with wrap - ensures Clear All button is always visible */}
        <div className="flex flex-wrap gap-2">
          <Dialog open={showAddVariableDialog} onOpenChange={setShowAddVariableDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Variable
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Bach Variable</DialogTitle>
                <DialogDescription>
                  Create a new variable to store melodic material for use in your compositions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="variableName">Variable Name</Label>
                  <Input
                    id="variableName"
                    placeholder="e.g., countersubject3"
                    value={newVariableName}
                    onChange={(e) => setNewVariableName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use camelCase naming (e.g., countersubject3, fugueSubject1)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddVariableDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddVariable}>
                  Create Variable
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Clear all variables but preserve structure
              const clearedVariables = Object.fromEntries(
                Object.keys(variables).map(key => [key, []])
              ) as BachLikeVariables;
              onVariablesChange(clearedVariables);
              toast.success('All Bach variables cleared');
            }}
            disabled={filledVariablesCount === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* MIDI Input Status and Instructions */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium text-green-900 dark:text-green-100">
              🎹 MIDI Input Active
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Target: {activeVariable ? getBachVariableShortLabel(activeVariable) : 'None'}
          </Badge>
        </div>
        
        <div className="space-y-2 text-xs text-green-800 dark:text-green-200">
          <div>
            <strong>Current Target:</strong> {getBachVariableLabel(activeVariable) || 'None selected'}
          </div>
          <div>
            <strong>How to Input Notes:</strong>
            <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
              <li><strong>MIDI Keyboard:</strong> Play keys on your connected MIDI device</li>
              <li><strong>Virtual Piano:</strong> Click the piano keyboard at the bottom of the screen</li>
              <li><strong>Quick Add:</strong> Click the note buttons below (C, D, E, etc.)</li>
              <li><strong>Text Entry:</strong> Type note names like "C4, D#5, Eb3" in the ASCII field</li>
            </ul>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
            <strong>💡 Tip:</strong> Switch between tabs above to target different Bach variables. 
            Each variable represents a different musical element in counterpoint composition.
          </div>
        </div>
      </Card>

      <Tabs 
        value={activeVariable} 
        onValueChange={(value) => {
          try {
            const newVariable = value as BachVariableName;
            console.log('🎯 BachLikeVariables: Tab changed to:', newVariable);
            
            // Validate that the variable exists
            if (!(newVariable in variables)) {
              console.error('❌ Invalid Bach variable selected:', newVariable);
              toast.error('Invalid variable selected');
              return;
            }
            
            setActiveVariable(newVariable);
            
            // Update MIDI target
            if (onMidiTargetChange) {
              console.log('🎯 BachLikeVariables: Calling onMidiTargetChange with:', newVariable);
              onMidiTargetChange(newVariable);
            } else {
              console.warn('⚠️ BachLikeVariables: onMidiTargetChange not provided');
            }
          } catch (err) {
            console.error('❌ Error changing Bach variable tab:', err);
            toast.error('Failed to switch variable');
          }
        }}
      >
        <ScrollArea className="w-full">
          <TabsList className={`grid w-full h-auto p-1`} style={{ gridTemplateColumns: `repeat(${variableEntries.length}, minmax(0, 1fr))` }}>
            {variableEntries.map(([name, melody]) => (
              <TabsTrigger
                key={name}
                value={name}
                className="text-xs p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <div className="flex flex-col items-center gap-1">
                  <span>{getBachVariableShortLabel(name)}</span>
                  <Badge 
                    variant={melody.length > 0 ? "default" : "outline"} 
                    className="text-[10px] px-1 py-0"
                  >
                    {melody.length}
                  </Badge>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {variableEntries.map(([name, melody]) => (
          <TabsContent 
            key={name} 
            value={name} 
            className="space-y-4"
            onFocus={() => onMidiTargetChange?.(name)}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">{getBachVariableLabel(name)}</h3>
                {!BUILT_IN_BACH_VARIABLES.includes(name as any) && (
                  <Badge variant="secondary" className="text-xs">Custom</Badge>
                )}
              </div>
              
              {/* Button group with wrap - ensures Clear button is always visible */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateRandomVariable(name)}
                >
                  <Shuffle className="w-3 h-3 mr-1" />
                  Random
                </Button>
                
                {/* NEW: Add Theme from Traditional Button */}
                {currentTheme && currentTheme.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      try {
                        const newVariables = {
                          ...variables,
                          [name]: [...melody, ...currentTheme]
                        };
                        onVariablesChange(newVariables);
                        toast.success(`Added ${currentTheme.length} notes from Theme to ${getBachVariableShortLabel(name)}`);
                      } catch (err) {
                        console.error('Error adding theme to Bach variable:', err);
                        toast.error('Failed to add theme');
                      }
                    }}
                    className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 border-blue-300 dark:border-blue-700"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Theme
                    <Badge variant="secondary" className="ml-2 bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100">
                      {currentTheme.length}
                    </Badge>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyVariable(name)}
                  disabled={melody.length === 0}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant={melody.length === 0 ? "outline" : "default"}
                  size="sm"
                  onClick={() => {
                    if (melody.length > 0) {
                      onUseAsTheme(melody, getBachVariableShortLabel(name));
                    }
                  }}
                  disabled={melody.length === 0}
                  className={melody.length > 0 ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                >
                  <Music className="w-3 h-3 mr-1" />
                  Use as Theme
                  {melody.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                      {melody.length}
                    </Badge>
                  )}
                </Button>
                {!BUILT_IN_BACH_VARIABLES.includes(name as any) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteVariable(name)}
                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearVariable(name)}
                  disabled={melody.length === 0}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Mode Scale Builder for Bach Variables */}
            <ModeScaleBuilder
              selectedMode={selectedMode}
              selectedKeySignature={selectedKeySignature}
              midiTarget={activeVariable}
              onAddToTarget={handleAddToTarget}
            />

            {/* Arpeggio Pattern Generator for Bach Variables */}
            <ArpeggioPatternSelector
              sourceTheme={melody}
              onApplyToBachVariable={(arpeggioTheme, variableName) => {
                updateVariable(variableName, arpeggioTheme);
              }}
              mode="bach"
              bachVariableName={name}
            />

            <Separator />

            {/* Quick Add Notes */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Quick Add Notes</Label>
                <div className="grid grid-cols-6 gap-1 mt-1">
                  {PITCH_NAMES.map((name, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => addNoteToVariable(activeVariable, pitchClassToMidiNote(index))}
                      className="text-xs h-8"
                    >
                      {name}4
                    </Button>
                  ))}
                </div>
              </div>

              {/* Dropdown Add */}
              <div className="flex gap-2">
                <Select
                  value={selectedPitch.toString()}
                  onValueChange={(value) => setSelectedPitch(parseInt(value))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select pitch" />
                  </SelectTrigger>
                  <SelectContent>
                    {PITCH_NAMES.map((name, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {name}4
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => addNoteToVariable(activeVariable, pitchClassToMidiNote(selectedPitch))} 
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Rhythm Controls for Bach Variables - ENHANCED */}
              <RhythmControlsEnhanced
                theme={variables[activeVariable] || []}
                currentRhythm={currentRhythm}
                onRhythmApplied={(rhythm) => {
                  try {
                    if (onVariableRhythmChange) {
                      onVariableRhythmChange(activeVariable, rhythm);
                      toast.success(`Rhythm pattern applied to ${BACH_VARIABLE_SHORT_LABELS[activeVariable]}`);
                    } else {
                      toast.warning('Rhythm control not available. Update App.tsx to enable rhythm functionality.');
                    }
                  } catch (error) {
                    console.error('Error applying rhythm to Bach variable:', error);
                    toast.error('Failed to apply rhythm pattern');
                  }
                }}
              />

              {/* Rest Controls for Bach Variables */}
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Pause className="w-4 h-4" />
                  <h4 className="font-medium text-sm">Rest Controls for {BACH_VARIABLE_SHORT_LABELS[activeVariable]}</h4>
                </div>
                
                <div className="flex gap-2">
                  <Select
                    value={selectedRestDuration}
                    onValueChange={(value) => setSelectedRestDuration(value as RestDuration)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select rest duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whole-rest">Whole Rest (4 beats)</SelectItem>
                      <SelectItem value="dotted-half-rest">Dotted Half Rest (3 beats)</SelectItem>
                      <SelectItem value="half-rest">Half Rest (2 beats)</SelectItem>
                      <SelectItem value="dotted-quarter-rest">Dotted Quarter Rest (1.5 beats)</SelectItem>
                      <SelectItem value="quarter-rest">Quarter Rest (1 beat)</SelectItem>
                      <SelectItem value="eighth-rest">Eighth Rest (0.5 beats)</SelectItem>
                      <SelectItem value="sixteenth-rest">Sixteenth Rest (0.25 beats)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => addRestToVariable(activeVariable)} size="sm" variant="outline">
                    <Pause className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`auto-rests-${activeVariable}`}
                      checked={enableAutoRests}
                      onChange={(e) => setEnableAutoRests(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`auto-rests-${activeVariable}`} className="text-xs">
                      Auto-add rests ({autoRestProbability}% chance)
                    </Label>
                  </div>
                  
                  {enableAutoRests && (
                    <div className="flex items-center gap-2">
                      <Sliders className="w-3 h-3" />
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={autoRestProbability}
                        onChange={(e) => setAutoRestProbability(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs text-muted-foreground w-8">{autoRestProbability}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ASCII Input */}
              <div className="space-y-2">
                <Label className="text-xs">ASCII Entry</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. C4,D4,E4 or C4 D#5 Eb3 F4"
                    value={asciiInput}
                    onChange={(e) => setAsciiInput(e.target.value)}
                    className="flex-1 text-xs"
                  />
                  <Button
                    onClick={applyAsciiInput}
                    size="sm"
                    disabled={!asciiInput.trim()}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Apply
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Enter note names (C4, D#5, Eb3) or MIDI numbers (60-72) separated by commas
                </div>
              </div>
            </div>

            <Separator />

            {/* Current Variable Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Current {BACH_VARIABLE_SHORT_LABELS[name]}</Label>
                {melody.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {melody.length} note{melody.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              {melody.length === 0 ? (
                <div className="text-muted-foreground text-sm p-6 border-2 border-dashed rounded-lg mt-2 bg-muted/20">
                  <div className="text-center">
                    <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div className="font-medium mb-1">No notes in {BACH_VARIABLE_SHORT_LABELS[name]}</div>
                    <div className="text-xs opacity-75">
                      🎹 Play your MIDI keyboard or use the methods above to add notes
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 border rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
                    {melody.map((element, index) => (
                      <Badge
                        key={index}
                        variant={isRest(element) ? "outline" : "secondary"}
                        className={`flex items-center gap-1 px-3 py-1 shadow-sm ${
                          isRest(element) 
                            ? "border-orange-300 text-orange-700 bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:bg-orange-950/20" 
                            : "bg-white dark:bg-slate-800"
                        }`}
                      >
                        {isRest(element) ? (
                          <span className="flex items-center gap-1 font-mono">
                            <Pause className="w-3 h-3" />
                            Rest
                          </span>
                        ) : (
                          <span className="font-mono">{melodyElementToString(element)}</span>
                        )}
                        <button
                          onClick={() => removeNoteFromVariable(name, index)}
                          className="ml-1 hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Enhanced Use as Theme Button */}
                  <div className="flex items-center justify-center">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={() => {
                        if (melody.length > 0) {
                          onUseAsTheme(melody, BACH_VARIABLE_SHORT_LABELS[name]);
                        }
                      }}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                    >
                      <Music className="w-4 h-4 mr-2" />
                      Use {BACH_VARIABLE_SHORT_LABELS[name]} as Main Theme
                      <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                        {melody.filter(isNote).length} notes, {melody.filter(isRest).length} rests
                      </Badge>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}