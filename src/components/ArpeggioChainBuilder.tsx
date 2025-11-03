/**
 * ARPEGGIO CHAIN BUILDER COMPONENT
 * Version: 1.003
 * 
 * Allows users to daisy-chain multiple arpeggio patterns together
 * to create complex arpeggio sequences. The result can be:
 * - Used as a standalone musical component
 * - Added to the Complete Song Creator Suite
 * - Exported as MIDI/MusicXML
 * - Played back with full audio support
 * 
 * Features:
 * - Select multiple arpeggio patterns from dropdown
 * - Combine them sequentially into one chain
 * - Based on current theme or Bach variables
 * - Full visualizer, playback, and export capabilities
 * - Error checking and validation
 * 
 * PRESERVATION: This is a NEW component that extends existing functionality
 * without modifying any existing code.
 */

import { useState, useMemo, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { MelodyVisualizer } from './MelodyVisualizer';
import { AudioPlayer } from './AudioPlayer';
import { Theme, BachLikeVariables, NoteValue, Rhythm, Part } from '../types/musical';
import { InstrumentType } from '../lib/enhanced-synthesis';
import {
  ArpeggioPattern,
  getAllArpeggioPatterns,
  applyArpeggioPatternAdvanced,
  previewPatternNotes,
} from '../lib/arpeggio-pattern-generator';
import {
  Music2,
  Wand2,
  Plus,
  Trash2,
  Play,
  AlertCircle,
  Info,
  Link,
  Download,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ArpeggioChainBuilderProps {
  currentTheme?: Theme;
  currentThemeRhythm?: NoteValue[];
  currentBachVariables?: BachLikeVariables;
  bachVariableRhythms?: Record<string, NoteValue[]>;
  onAddToSongSuite?: (theme: Theme, rhythm: Rhythm, label: string, instrument: InstrumentType) => void;
}

interface ChainedPattern {
  id: string;
  pattern: ArpeggioPattern;
  repetitions: number;
}

type MelodySource = 'theme' | 'CF' | 'CFF1' | 'CFF2';

export function ArpeggioChainBuilder({
  currentTheme,
  currentThemeRhythm,
  currentBachVariables,
  bachVariableRhythms,
  onAddToSongSuite,
}: ArpeggioChainBuilderProps) {
  // State for chain building
  const [chainedPatterns, setChainedPatterns] = useState<ChainedPattern[]>([]);
  const [selectedPatternName, setSelectedPatternName] = useState<string>('');
  const [patternRepetitions, setPatternRepetitions] = useState(1);
  const [selectedMelodySource, setSelectedMelodySource] = useState<MelodySource>('theme');
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('piano');
  
  // State for generated chain
  const [generatedArpeggio, setGeneratedArpeggio] = useState<Theme | null>(null);
  const [generatedRhythm, setGeneratedRhythm] = useState<Rhythm | null>(null);
  
  // Get all available patterns
  const allPatterns = useMemo(() => getAllArpeggioPatterns(), []);

  /**
   * Get the selected melody and rhythm based on source
   */
  const getSelectedMelody = useCallback((): { melody: Theme; rhythm: Rhythm; label: string } => {
    switch (selectedMelodySource) {
      case 'theme':
        if (currentTheme && currentTheme.length > 0) {
          const rhythm = currentThemeRhythm?.map(noteValueToRhythmValue) || 
                         Array(currentTheme.length).fill(1);
          return { melody: currentTheme, rhythm, label: 'Current Theme' };
        }
        break;
      
      case 'CF':
        if (currentBachVariables?.cantusFirmus && currentBachVariables.cantusFirmus.length > 0) {
          const rhythm = bachVariableRhythms?.cantusFirmus?.map(noteValueToRhythmValue) || 
                         Array(currentBachVariables.cantusFirmus.length).fill(1);
          return { melody: currentBachVariables.cantusFirmus, rhythm, label: 'Cantus Firmus' };
        }
        break;
      
      case 'CFF1':
        if (currentBachVariables?.floridCounterpoint1 && currentBachVariables.floridCounterpoint1.length > 0) {
          const rhythm = bachVariableRhythms?.floridCounterpoint1?.map(noteValueToRhythmValue) || 
                         Array(currentBachVariables.floridCounterpoint1.length).fill(1);
          return { melody: currentBachVariables.floridCounterpoint1, rhythm, label: 'Florid Counterpoint 1' };
        }
        break;
      
      case 'CFF2':
        if (currentBachVariables?.floridCounterpoint2 && currentBachVariables.floridCounterpoint2.length > 0) {
          const rhythm = bachVariableRhythms?.floridCounterpoint2?.map(noteValueToRhythmValue) || 
                         Array(currentBachVariables.floridCounterpoint2.length).fill(1);
          return { melody: currentBachVariables.floridCounterpoint2, rhythm, label: 'Florid Counterpoint 2' };
        }
        break;
    }
    
    // Fallback to example melody
    return {
      melody: [60, 64, 67],
      rhythm: [1, 1, 1],
      label: 'Example (C-E-G)',
    };
  }, [selectedMelodySource, currentTheme, currentThemeRhythm, currentBachVariables, bachVariableRhythms]);

  /**
   * Add pattern to chain
   */
  const handleAddPattern = useCallback(() => {
    if (!selectedPatternName) {
      toast.error('Please select an arpeggio pattern');
      return;
    }
    
    const pattern = allPatterns.find(p => p.name === selectedPatternName);
    if (!pattern) {
      toast.error('Pattern not found');
      return;
    }
    
    try {
      const newPattern: ChainedPattern = {
        id: `${Date.now()}-${Math.random()}`,
        pattern,
        repetitions: patternRepetitions,
      };
      
      setChainedPatterns([...chainedPatterns, newPattern]);
      toast.success(`Added ${pattern.name} to chain`, {
        description: `${pattern.noteCount} notes × ${patternRepetitions} repetitions`,
      });
      
      // Reset selections
      setSelectedPatternName('');
      setPatternRepetitions(1);
    } catch (error) {
      console.error('Error adding pattern:', error);
      toast.error('Failed to add pattern to chain');
    }
  }, [selectedPatternName, patternRepetitions, chainedPatterns, allPatterns]);

  /**
   * Remove pattern from chain
   */
  const handleRemovePattern = useCallback((id: string) => {
    setChainedPatterns(chainedPatterns.filter(p => p.id !== id));
    toast.info('Pattern removed from chain');
  }, [chainedPatterns]);

  /**
   * Clear entire chain
   */
  const handleClearChain = useCallback(() => {
    setChainedPatterns([]);
    setGeneratedArpeggio(null);
    setGeneratedRhythm(null);
    toast.info('Chain cleared');
  }, []);

  /**
   * Generate arpeggio chain
   */
  const handleGenerateChain = useCallback(() => {
    if (chainedPatterns.length === 0) {
      toast.error('Please add at least one pattern to the chain');
      return;
    }
    
    try {
      const { melody: sourceTheme, label } = getSelectedMelody();
      
      if (!sourceTheme || sourceTheme.length === 0) {
        throw new Error('Source melody is empty');
      }
      
      console.log('🎵 Generating arpeggio chain...');
      console.log('  Source:', label);
      console.log('  Chain length:', chainedPatterns.length);
      
      // Generate each pattern and concatenate
      const fullArpeggio: Theme = [];
      const fullRhythm: Rhythm = [];
      
      chainedPatterns.forEach((chainedPattern, index) => {
        console.log(`  Pattern ${index + 1}: ${chainedPattern.pattern.name} × ${chainedPattern.repetitions}`);
        
        const patternResult = applyArpeggioPatternAdvanced(
          sourceTheme,
          chainedPattern.pattern,
          chainedPattern.repetitions
        );
        
        fullArpeggio.push(...patternResult);
        
        // Generate rhythm for this pattern
        const patternRhythm = Array(patternResult.length).fill(1);
        fullRhythm.push(...patternRhythm);
      });
      
      setGeneratedArpeggio(fullArpeggio);
      setGeneratedRhythm(fullRhythm);
      
      console.log('✅ Arpeggio chain generated!');
      console.log('  Total notes:', fullArpeggio.length);
      
      toast.success('Arpeggio Chain Generated!', {
        description: `${fullArpeggio.length} notes from ${chainedPatterns.length} patterns`,
      });
    } catch (error) {
      console.error('Error generating arpeggio chain:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate chain');
    }
  }, [chainedPatterns, getSelectedMelody]);

  /**
   * Add to song suite
   */
  const handleAddToSongSuite = useCallback(() => {
    if (!generatedArpeggio || !generatedRhythm) {
      toast.error('Please generate the arpeggio chain first');
      return;
    }
    
    if (!onAddToSongSuite) {
      toast.error('Song suite integration not available');
      return;
    }
    
    try {
      const { label } = getSelectedMelody();
      const chainLabel = `Arpeggio Chain (${chainedPatterns.length} patterns from ${label})`;
      
      onAddToSongSuite(generatedArpeggio, generatedRhythm, chainLabel, selectedInstrument);
      
      toast.success('Added to Song Suite!', {
        description: chainLabel,
      });
    } catch (error) {
      console.error('Error adding to song suite:', error);
      toast.error('Failed to add to song suite');
    }
  }, [generatedArpeggio, generatedRhythm, chainedPatterns, selectedInstrument, getSelectedMelody, onAddToSongSuite]);

  // Preview notes from source
  const notePreview = useMemo(() => {
    const { melody } = getSelectedMelody();
    return previewPatternNotes(melody);
  }, [getSelectedMelody]);

  // Calculate total notes in chain
  const totalChainNotes = useMemo(() => {
    return chainedPatterns.reduce((sum, cp) => {
      return sum + (cp.pattern.noteCount * cp.repetitions);
    }, 0);
  }, [chainedPatterns]);

  // Convert to parts for playback
  const playbackParts: Part[] = useMemo(() => {
    if (!generatedArpeggio || !generatedRhythm) return [];
    
    return [{
      melody: generatedArpeggio,
      rhythm: generatedRhythm,
    }];
  }, [generatedArpeggio, generatedRhythm]);

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold">Arpeggio Chain Builder</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Daisy-chain multiple arpeggio patterns into complex sequences
            </p>
          </div>
          
          <Badge variant="secondary">
            {chainedPatterns.length} patterns
          </Badge>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Build complex arpeggio sequences by chaining multiple patterns together.
            Each pattern will be applied sequentially to create one unified arpeggio.
            The result can be played back, exported, or added to the Complete Song Creator Suite.
          </AlertDescription>
        </Alert>

        {/* Melody Source Selector */}
        <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Label className="text-sm font-medium">Select Source Melody</Label>
          <Select
            value={selectedMelodySource}
            onValueChange={(value) => setSelectedMelodySource(value as MelodySource)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="theme" disabled={!currentTheme || currentTheme.length === 0}>
                🎵 Current Theme {currentTheme && currentTheme.length > 0 ? `(${currentTheme.length} notes)` : '(empty)'}
              </SelectItem>
              <SelectItem value="CF" disabled={!currentBachVariables?.cantusFirmus || currentBachVariables.cantusFirmus.length === 0}>
                📝 Cantus Firmus {currentBachVariables?.cantusFirmus && currentBachVariables.cantusFirmus.length > 0 ? `(${currentBachVariables.cantusFirmus.length} notes)` : '(empty)'}
              </SelectItem>
              <SelectItem value="CFF1" disabled={!currentBachVariables?.floridCounterpoint1 || currentBachVariables.floridCounterpoint1.length === 0}>
                🎼 Florid Counterpoint 1 {currentBachVariables?.floridCounterpoint1 && currentBachVariables.floridCounterpoint1.length > 0 ? `(${currentBachVariables.floridCounterpoint1.length} notes)` : '(empty)'}
              </SelectItem>
              <SelectItem value="CFF2" disabled={!currentBachVariables?.floridCounterpoint2 || currentBachVariables.floridCounterpoint2.length === 0}>
                🎼 Florid Counterpoint 2 {currentBachVariables?.floridCounterpoint2 && currentBachVariables.floridCounterpoint2.length > 0 ? `(${currentBachVariables.floridCounterpoint2.length} notes)` : '(empty)'}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Note Preview */}
          <div className="bg-white/60 dark:bg-black/20 rounded border border-blue-200 dark:border-blue-700 p-3">
            <div className="text-xs font-medium mb-2">Pattern Notes</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-muted-foreground">Low</div>
                <Badge variant="secondary">{notePreview.lowestName}</Badge>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">Mid</div>
                <Badge variant="secondary">{notePreview.middleName}</Badge>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">High</div>
                <Badge variant="secondary">{notePreview.highestName}</Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Pattern Selection */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Pattern to Chain
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Select Pattern</Label>
            <Select
              value={selectedPatternName}
              onValueChange={setSelectedPatternName}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a pattern" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {allPatterns.map((pattern) => (
                  <SelectItem key={pattern.name} value={pattern.name}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {pattern.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {pattern.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Repetitions</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPatternRepetitions(Math.max(1, patternRepetitions - 1))}
              >
                -
              </Button>
              <Badge variant="secondary" className="flex-1 justify-center">
                {patternRepetitions}x
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPatternRepetitions(Math.min(8, patternRepetitions + 1))}
              >
                +
              </Button>
            </div>
          </div>
        </div>

        <Button
          onClick={handleAddPattern}
          disabled={!selectedPatternName}
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Add to Chain
        </Button>
      </Card>

      {/* Chain Display */}
      {chainedPatterns.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Link className="w-4 h-4" />
              Pattern Chain ({chainedPatterns.length} patterns, {totalChainNotes} total notes)
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChain}
              className="gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear Chain
            </Button>
          </div>

          <div className="space-y-2">
            {chainedPatterns.map((cp, index) => (
              <div
                key={cp.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{index + 1}</Badge>
                  <div>
                    <div className="font-mono text-sm font-medium">{cp.pattern.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {cp.pattern.description} • {cp.pattern.noteCount} notes × {cp.repetitions} = {cp.pattern.noteCount * cp.repetitions} notes
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePattern(cp.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          <Button
            onClick={handleGenerateChain}
            className="w-full gap-2"
          >
            <Wand2 className="w-4 h-4" />
            Generate Arpeggio Chain
          </Button>
        </Card>
      )}

      {/* Generated Result */}
      {generatedArpeggio && generatedRhythm && (
        <Card className="p-6 space-y-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Music2 className="w-4 h-4 text-green-600" />
              Generated Arpeggio Chain
            </h3>
            <Badge variant="secondary">
              {generatedArpeggio.length} notes
            </Badge>
          </div>

          {/* Visualizer */}
          <div className="space-y-2">
            <Label className="text-sm">Arpeggio Visualization</Label>
            <MelodyVisualizer
              melody={generatedArpeggio}
              color="#059669"
              height={80}
            />
          </div>

          <Separator />

          {/* Playback */}
          <div className="space-y-2">
            <Label className="text-sm">Playback</Label>
            <AudioPlayer
              parts={playbackParts}
              title="Arpeggio Chain"
              selectedInstrument={selectedInstrument}
              onInstrumentChange={setSelectedInstrument}
            />
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleAddToSongSuite}
              disabled={!onAddToSongSuite}
              className="flex-1 gap-2"
            >
              <Download className="w-4 h-4" />
              Add to Song Suite
            </Button>
          </div>

          {!onAddToSongSuite && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Song suite integration not available in this context
              </AlertDescription>
            </Alert>
          )}
        </Card>
      )}

      {chainedPatterns.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Add patterns to the chain to get started. Patterns will be combined sequentially
            to create a complex arpeggio sequence.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Helper function to convert NoteValue to rhythm value (number)
function noteValueToRhythmValue(noteValue: NoteValue): number {
  const noteValueMap: Record<NoteValue, number> = {
    'whole': 4,
    'half': 2,
    'quarter': 1,
    'eighth': 0.5,
    'sixteenth': 0.25,
    'thirty-second': 0.125,
    'dotted-half': 3,
    'dotted-quarter': 1.5,
    'dotted-eighth': 0.75,
    'triplet-quarter': 2/3,
    'triplet-eighth': 1/3,
    'triplet-sixteenth': 1/6
  };
  return noteValueMap[noteValue] || 1;
}
