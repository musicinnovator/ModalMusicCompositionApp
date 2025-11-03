/**
 * HARMONY COMPOSER - Standalone Component
 * 
 * Complete harmony generation card that can harmonize any musical content:
 * - Themes & Bach Variables
 * - Counterpoint (all species)
 * - Canons (all 22 types)
 * - Fugues (all 14 architectures)
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { HarmonyControls } from './HarmonyControls';
import { HarmonyVisualizer } from './HarmonyVisualizer';
import {
  HarmonyEngine,
  HarmonyParams,
  HarmonizedPart
} from '../lib/harmony-engine';
import { Theme, Rhythm, BachLikeVariables, NoteValue } from '../types/musical';
import { InstrumentType } from '../lib/enhanced-synthesis';
import { Music2, Sparkles, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface HarmonyComposerProps {
  onHarmonyGenerated?: (harmony: HarmonizedPart, instrument: InstrumentType) => void;
  currentTheme?: Theme;
  currentThemeRhythm?: NoteValue[];
  currentBachVariables?: BachLikeVariables;
  bachVariableRhythms?: Record<string, NoteValue[]>;
}

type MelodySource = 'theme' | 'CF' | 'CFF1' | 'CFF2' | 'CFFrag1' | 'CFFrag2' | 'FCFrag1' | 'FCFrag2' | 'CS1' | 'CS2' | 'example';

export function HarmonyComposer({ 
  onHarmonyGenerated,
  currentTheme,
  currentThemeRhythm,
  currentBachVariables,
  bachVariableRhythms
}: HarmonyComposerProps = {}) {
  // Default harmony parameters
  const [harmonyParams, setHarmonyParams] = useState<HarmonyParams>({
    keyCenter: 'automatic',
    voicingStyle: 'block',
    density: 4,
    complexity: 'seventh',
    lowestNote: 36,
    highestNote: 84,
    preferClosedVoicing: false,
    allowInversions: true,
    doublingPreference: 'balanced'
  });

  const [harmonizedParts, setHarmonizedParts] = useState<HarmonizedPart[]>([]);

  /**
   * Handle harmony update from editor
   */
  const handleUpdateHarmony = (index: number, updatedPart: HarmonizedPart) => {
    const newParts = [...harmonizedParts];
    newParts[index] = updatedPart;
    setHarmonizedParts(newParts);
    
    // Notify parent if callback provided
    if (onHarmonyGenerated) {
      try {
        onHarmonyGenerated(updatedPart, selectedInstrument);
        console.log('✅ Updated harmony data passed to parent component');
      } catch (callbackError) {
        console.error('❌ Error in onHarmonyGenerated callback:', callbackError);
      }
    }
    
    toast.success('Harmony updated successfully!');
  };
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('strings');
  const [selectedMelodySource, setSelectedMelodySource] = useState<MelodySource>('theme');

  // Example melody for demonstration (fallback only)
  const [exampleMelody] = useState<Theme>([
    60, 62, 64, 65, 67, 65, 64, 62, 60, 60, 62, 64, 64, 62, 62
  ]);
  
  const [exampleRhythm] = useState<Rhythm>([
    1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 2, 2
  ]);

  /**
   * Get the selected melody and rhythm based on source
   */
  const getSelectedMelody = (): { melody: Theme; rhythm: Rhythm; label: string } => {
    switch (selectedMelodySource) {
      case 'theme':
        if (currentTheme && currentTheme.length > 0) {
          const rhythm = currentThemeRhythm?.map(noteValueToRhythmValue) || Array(currentTheme.length).fill(1);
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
      
      case 'CFFrag1':
        if (currentBachVariables?.cantusFirmusFragment1 && currentBachVariables.cantusFirmusFragment1.length > 0) {
          const rhythm = bachVariableRhythms?.cantusFirmusFragment1?.map(noteValueToRhythmValue) || 
                         Array(currentBachVariables.cantusFirmusFragment1.length).fill(1);
          return { melody: currentBachVariables.cantusFirmusFragment1, rhythm, label: 'CF Fragment 1' };
        }
        break;
      
      case 'CFFrag2':
        if (currentBachVariables?.cantusFirmusFragment2 && currentBachVariables.cantusFirmusFragment2.length > 0) {
          const rhythm = bachVariableRhythms?.cantusFirmusFragment2?.map(noteValueToRhythmValue) || 
                         Array(currentBachVariables.cantusFirmusFragment2.length).fill(1);
          return { melody: currentBachVariables.cantusFirmusFragment2, rhythm, label: 'CF Fragment 2' };
        }
        break;
      
      case 'FCFrag1':
        if (currentBachVariables?.floridCounterpointFrag1 && currentBachVariables.floridCounterpointFrag1.length > 0) {
          const rhythm = bachVariableRhythms?.floridCounterpointFrag1?.map(noteValueToRhythmValue) || 
                         Array(currentBachVariables.floridCounterpointFrag1.length).fill(1);
          return { melody: currentBachVariables.floridCounterpointFrag1, rhythm, label: 'Florid CP Fragment 1' };
        }
        break;
      
      case 'FCFrag2':
        if (currentBachVariables?.floridCounterpointFrag2 && currentBachVariables.floridCounterpointFrag2.length > 0) {
          const rhythm = bachVariableRhythms?.floridCounterpointFrag2?.map(noteValueToRhythmValue) || 
                         Array(currentBachVariables.floridCounterpointFrag2.length).fill(1);
          return { melody: currentBachVariables.floridCounterpointFrag2, rhythm, label: 'Florid CP Fragment 2' };
        }
        break;
      
      case 'CS1':
        if (currentBachVariables?.countersubject1 && currentBachVariables.countersubject1.length > 0) {
          const rhythm = bachVariableRhythms?.countersubject1?.map(noteValueToRhythmValue) || 
                         Array(currentBachVariables.countersubject1.length).fill(1);
          return { melody: currentBachVariables.countersubject1, rhythm, label: 'Countersubject 1' };
        }
        break;
      
      case 'CS2':
        if (currentBachVariables?.countersubject2 && currentBachVariables.countersubject2.length > 0) {
          const rhythm = bachVariableRhythms?.countersubject2?.map(noteValueToRhythmValue) || 
                         Array(currentBachVariables.countersubject2.length).fill(1);
          return { melody: currentBachVariables.countersubject2, rhythm, label: 'Countersubject 2' };
        }
        break;
    }
    
    // Fallback to example melody
    return { melody: exampleMelody, rhythm: exampleRhythm, label: 'Example Melody' };
  };

  /**
   * Harmonize the selected melody
   */
  const handleHarmonize = () => {
    try {
      setIsProcessing(true);
      
      const { melody, rhythm, label } = getSelectedMelody();
      
      console.log('🎼 Starting harmonization...');
      console.log('  Source:', label);
      console.log('  Melody:', melody);
      console.log('  Rhythm:', rhythm);
      console.log('  Params:', harmonyParams);
      
      // Validate input
      if (melody.length !== rhythm.length) {
        throw new Error('Melody and rhythm lengths must match');
      }
      
      if (melody.length === 0) {
        throw new Error('Melody cannot be empty');
      }
      
      // Harmonize the melody
      const harmonized = HarmonyEngine.harmonize(
        melody,
        rhythm,
        harmonyParams
      );
      
      console.log('✅ Harmonization complete!');
      console.log('  Source:', label);
      console.log('  Detected key:', harmonized.analysis.detectedKey);
      console.log('  Key quality:', harmonized.analysis.keyQuality);
      console.log('  Confidence:', harmonized.analysis.confidence);
      console.log('  Chord progression:', harmonized.analysis.chordProgression.join(' → '));
      
      // Add to results
      setHarmonizedParts([...harmonizedParts, harmonized]);
      
      // Notify parent component if callback provided
      if (onHarmonyGenerated) {
        try {
          onHarmonyGenerated(harmonized, selectedInstrument);
          console.log('✅ Harmony data passed to parent component');
        } catch (callbackError) {
          console.error('❌ Error in onHarmonyGenerated callback:', callbackError);
        }
      }
      
      // Show success message
      toast.success('Harmony Generated Successfully!', {
        description: `Source: ${label} • Key: ${getNoteName(harmonized.analysis.detectedKey)} ${harmonized.analysis.keyQuality} • ${harmonized.chordLabels.length} chords`
      });
      
    } catch (error) {
      console.error('❌ Harmonization error:', error);
      toast.error('Harmonization Failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Clear a harmonized part
   */
  const handleClearHarmony = (index: number) => {
    const newParts = harmonizedParts.filter((_, i) => i !== index);
    setHarmonizedParts(newParts);
    toast.info('Harmonized part removed');
  };

  /**
   * Clear all harmonized parts
   */
  const handleClearAll = () => {
    setHarmonizedParts([]);
    toast.info('All harmonized parts cleared');
  };

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold">Harmonic Engine Suite</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional harmonization for all musical content
            </p>
          </div>
          
          <Badge variant="secondary">
            {harmonizedParts.length} harmonized
          </Badge>
        </div>

        {/* Melody Source Selector */}
        <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Label className="text-sm font-medium">Select Melody to Harmonize</Label>
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
                📝 Cantus Firmus (CF) {currentBachVariables?.cantusFirmus && currentBachVariables.cantusFirmus.length > 0 ? `(${currentBachVariables.cantusFirmus.length} notes)` : '(empty)'}
              </SelectItem>
              <SelectItem value="CFF1" disabled={!currentBachVariables?.floridCounterpoint1 || currentBachVariables.floridCounterpoint1.length === 0}>
                🎼 Florid Counterpoint 1 (CFF1) {currentBachVariables?.floridCounterpoint1 && currentBachVariables.floridCounterpoint1.length > 0 ? `(${currentBachVariables.floridCounterpoint1.length} notes)` : '(empty)'}
              </SelectItem>
              <SelectItem value="CFF2" disabled={!currentBachVariables?.floridCounterpoint2 || currentBachVariables.floridCounterpoint2.length === 0}>
                🎼 Florid Counterpoint 2 (CFF2) {currentBachVariables?.floridCounterpoint2 && currentBachVariables.floridCounterpoint2.length > 0 ? `(${currentBachVariables.floridCounterpoint2.length} notes)` : '(empty)'}
              </SelectItem>
              <SelectItem value="CFFrag1" disabled={!currentBachVariables?.cantusFirmusFragment1 || currentBachVariables.cantusFirmusFragment1.length === 0}>
                📄 CF Fragment 1 {currentBachVariables?.cantusFirmusFragment1 && currentBachVariables.cantusFirmusFragment1.length > 0 ? `(${currentBachVariables.cantusFirmusFragment1.length} notes)` : '(empty)'}
              </SelectItem>
              <SelectItem value="CFFrag2" disabled={!currentBachVariables?.cantusFirmusFragment2 || currentBachVariables.cantusFirmusFragment2.length === 0}>
                📄 CF Fragment 2 {currentBachVariables?.cantusFirmusFragment2 && currentBachVariables.cantusFirmusFragment2.length > 0 ? `(${currentBachVariables.cantusFirmusFragment2.length} notes)` : '(empty)'}
              </SelectItem>
              <SelectItem value="FCFrag1" disabled={!currentBachVariables?.floridCounterpointFrag1 || currentBachVariables.floridCounterpointFrag1.length === 0}>
                🎹 Florid CP Fragment 1 {currentBachVariables?.floridCounterpointFrag1 && currentBachVariables.floridCounterpointFrag1.length > 0 ? `(${currentBachVariables.floridCounterpointFrag1.length} notes)` : '(empty)'}
              </SelectItem>
              <SelectItem value="FCFrag2" disabled={!currentBachVariables?.floridCounterpointFrag2 || currentBachVariables.floridCounterpointFrag2.length === 0}>
                🎹 Florid CP Fragment 2 {currentBachVariables?.floridCounterpointFrag2 && currentBachVariables.floridCounterpointFrag2.length > 0 ? `(${currentBachVariables.floridCounterpointFrag2.length} notes)` : '(empty)'}
              </SelectItem>
              <SelectItem value="CS1" disabled={!currentBachVariables?.countersubject1 || currentBachVariables.countersubject1.length === 0}>
                🎺 Countersubject 1 (CS1) {currentBachVariables?.countersubject1 && currentBachVariables.countersubject1.length > 0 ? `(${currentBachVariables.countersubject1.length} notes)` : '(empty)'}
              </SelectItem>
              <SelectItem value="CS2" disabled={!currentBachVariables?.countersubject2 || currentBachVariables.countersubject2.length === 0}>
                🎺 Countersubject 2 (CS2) {currentBachVariables?.countersubject2 && currentBachVariables.countersubject2.length > 0 ? `(${currentBachVariables.countersubject2.length} notes)` : '(empty)'}
              </SelectItem>
              <SelectItem value="example">
                💡 Example Melody (Demo)
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Selected Melody Preview */}
          {(() => {
            const { melody, label } = getSelectedMelody();
            return (
              <div className="space-y-2 p-3 bg-white/60 dark:bg-black/20 rounded border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">{label}</Label>
                  <Badge variant="outline" className="text-xs">
                    {melody.length} notes
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground font-mono max-h-16 overflow-y-auto">
                  {melody.map((note, i) => getNoteName(note)).join(' - ')}
                </div>
              </div>
            );
          })()}
        </div>
      </Card>

      {/* Harmony Controls */}
      <HarmonyControls
        params={harmonyParams}
        onParamsChange={setHarmonyParams}
        onHarmonize={handleHarmonize}
        isProcessing={isProcessing}
      />

      {/* Harmonized Results */}
      {harmonizedParts.length > 0 && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Music2 className="w-4 h-4" />
              Harmonized Results ({harmonizedParts.length})
            </h3>
            {harmonizedParts.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {harmonizedParts.map((part, index) => (
              <HarmonyVisualizer
                key={index}
                harmonizedPart={part}
                index={index}
                onClear={() => handleClearHarmony(index)}
                selectedInstrument={selectedInstrument}
                onInstrumentChange={setSelectedInstrument}
                onUpdateHarmony={(updatedPart) => handleUpdateHarmony(index, updatedPart)}
              />
            ))}
          </div>
        </Card>
      )}


    </div>
  );
}

// Helper function to get note name
function getNoteName(midiNote: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNote / 12) - 1;
  return noteNames[midiNote % 12] + octave;
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
