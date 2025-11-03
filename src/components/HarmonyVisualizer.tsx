/**
 * HARMONY VISUALIZER COMPONENT
 * 
 * Displays harmonized melodies with chord labels and voicing visualization
 * 
 * Version 1.003: Added HarmonyChordEditor integration for chord editing
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { MelodyVisualizer } from './MelodyVisualizer';
import { AudioPlayer } from './AudioPlayer';
import { HarmonyChordEditor } from './HarmonyChordEditor';
import { HarmonizedPart, HarmonyEngine } from '../lib/harmony-engine';
import { InstrumentType } from '../lib/enhanced-synthesis';
import { Music, Trash2, Info, TrendingUp, Edit3 } from 'lucide-react';

interface HarmonyVisualizerProps {
  harmonizedPart: HarmonizedPart;
  index: number;
  onClear: () => void;
  selectedInstrument: InstrumentType;
  onInstrumentChange: (instrument: InstrumentType) => void;
  onUpdateHarmony?: (updatedPart: HarmonizedPart) => void; // NEW: For chord editing
}

export function HarmonyVisualizer({
  harmonizedPart,
  index,
  onClear,
  selectedInstrument,
  onInstrumentChange,
  onUpdateHarmony
}: HarmonyVisualizerProps) {
  // State for editing mode
  const [isEditingChords, setIsEditingChords] = useState(false);
  const [workingHarmonizedPart, setWorkingHarmonizedPart] = useState(harmonizedPart);
  
  // Convert to parts for playback
  const parts = HarmonyEngine.harmonizedPartToParts(workingHarmonizedPart);

  return (
    <Card className="p-5 space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold">Harmonized Melody #{index + 1}</h3>
          <Badge variant="secondary" className="text-xs">
            {workingHarmonizedPart.harmonyNotes.length} chords
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingChords(!isEditingChords)}
            className="text-xs gap-1"
          >
            <Edit3 className="w-3 h-3" />
            {isEditingChords ? 'View Mode' : 'Edit Chords'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="text-xs gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Remove
          </Button>
        </div>
      </div>

      {/* Analysis Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="p-2 bg-background/60 rounded">
          <div className="text-muted-foreground">Detected Key</div>
          <div className="font-medium">
            {getNoteN(workingHarmonizedPart.analysis.detectedKey)} {workingHarmonizedPart.analysis.keyQuality}
          </div>
        </div>
        <div className="p-2 bg-background/60 rounded">
          <div className="text-muted-foreground">Confidence</div>
          <div className="font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {(workingHarmonizedPart.analysis.confidence * 100).toFixed(0)}%
          </div>
        </div>
        <div className="p-2 bg-background/60 rounded">
          <div className="text-muted-foreground">Chords</div>
          <div className="font-medium">{workingHarmonizedPart.chordLabels.length}</div>
        </div>
        <div className="p-2 bg-background/60 rounded">
          <div className="text-muted-foreground">Harmony Parts</div>
          <div className="font-medium">{parts.length}</div>
        </div>
      </div>

      <Separator />

      {/* Chord Editing or Display */}
      {isEditingChords ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Edit3 className="w-4 h-4 text-purple-600" />
            Edit Chord Progression
          </div>
          <HarmonyChordEditor
            harmonizedPart={workingHarmonizedPart}
            onSaveChanges={(updatedPart) => {
              setWorkingHarmonizedPart(updatedPart);
              setIsEditingChords(false);
              if (onUpdateHarmony) {
                onUpdateHarmony(updatedPart);
              }
            }}
            onCancel={() => setIsEditingChords(false)}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Info className="w-4 h-4 text-purple-600" />
            Chord Progression
          </div>
          <div className="flex flex-wrap gap-2">
            {workingHarmonizedPart.chordLabels.slice(0, 20).map((label, i) => (
              <Badge
                key={i}
                variant="outline"
                className="font-mono text-xs"
              >
                {label}
              </Badge>
            ))}
            {workingHarmonizedPart.chordLabels.length > 20 && (
              <Badge variant="secondary" className="text-xs">
                +{workingHarmonizedPart.chordLabels.length - 20} more
              </Badge>
            )}
          </div>
        </div>
      )}

      <Separator />

      {!isEditingChords && (
        <>
          <Separator />
          
          {/* Original Melody Visualization */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Original Melody</h4>
            <MelodyVisualizer
              melody={workingHarmonizedPart.originalMelody}
              color="#9333ea"
              height={60}
            />
          </div>

          {/* Harmony Visualization */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Harmony (Bass Line)</h4>
            {parts.length > 1 && parts[1].melody.length > 0 && (
              <MelodyVisualizer
                melody={parts[1].melody}
                color="#db2777"
                height={60}
              />
            )}
          </div>

          <Separator />

          {/* Audio Player */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Playback</h4>
            <AudioPlayer
              parts={parts}
              title={`Harmonized Melody #${index + 1}`}
              selectedInstrument={selectedInstrument}
              onInstrumentChange={onInstrumentChange}
            />
          </div>

          {/* Progression Analysis */}
          <div className="text-xs text-muted-foreground p-3 bg-background/40 rounded">
            <div className="font-medium mb-1">Analysis</div>
            <div>
              Key: {getNoteN(workingHarmonizedPart.analysis.detectedKey)} {workingHarmonizedPart.analysis.keyQuality}
            </div>
            <div>
              Progression: {workingHarmonizedPart.analysis.chordProgression.join(' → ')}
            </div>
            <div>
              Confidence: {(workingHarmonizedPart.analysis.confidence * 100).toFixed(1)}%
              {workingHarmonizedPart.analysis.confidence < 0.7 && ' (consider manual adjustment)'}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

// Helper function to get note name from MIDI number
function getNoteN(midiNote: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return noteNames[midiNote % 12];
}
