/**
 * Canon Visualizer Component
 * Displays and plays generated canons with voice-specific controls
 */

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Music, Trash2, Layers, Clock } from 'lucide-react';
import { CanonResult } from '../lib/canon-engine';
import { MelodyVisualizer } from './MelodyVisualizer';
import { AudioPlayer } from './AudioPlayer';
import { InstrumentType } from '../lib/enhanced-synthesis';
import { Part, NoteValue, noteValuesToRhythm } from '../types/musical';
import { RhythmControlsEnhanced } from './RhythmControlsEnhanced';
import { ErrorBoundary } from './ErrorBoundary';
import { useState, useMemo } from 'react';

interface CanonVisualizerProps {
  canon: CanonResult;
  index: number;
  onClear: () => void;
  colorPalette: string[];
  partInstruments?: InstrumentType[];
  onPartInstrumentChange?: (partIndex: number, instrument: InstrumentType) => void;
  partMuted?: boolean[];
  onPartMuteToggle?: (partIndex: number) => void;
  // ADDITIVE: Rhythm controls
  voiceRhythms?: NoteValue[][];
  onVoiceRhythmChange?: (voiceIndex: number, rhythm: NoteValue[]) => void;
}

export function CanonVisualizer({
  canon,
  index,
  onClear,
  colorPalette,
  partInstruments = [],
  onPartInstrumentChange = () => {},
  partMuted = [],
  onPartMuteToggle = () => {},
  voiceRhythms = [],
  onVoiceRhythmChange = () => {}
}: CanonVisualizerProps) {
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('piano');

  // ADDITIVE FIX: Convert canon voices to Parts with CUSTOM RHYTHMS applied
  // RHYTHM PRECISION FIX: Include noteValues for proper sixteenth/dotted note playback
  const parts: Part[] = useMemo(() => {
    return canon.voices.map((voice, voiceIndex) => {
      // Check if custom rhythm exists for this voice
      const customRhythm = voiceRhythms[voiceIndex];
      
      if (customRhythm && Array.isArray(customRhythm) && customRhythm.length > 0) {
        // Apply custom rhythm
        const beatRhythm = noteValuesToRhythm(customRhythm);
        return {
          melody: voice.melody,
          rhythm: beatRhythm,
          noteValues: customRhythm  // ADDITIVE FIX: High-precision rhythm for sixteenth/dotted notes
        };
      }
      
      // Use original rhythm if no custom rhythm
      return {
        melody: voice.melody,
        rhythm: voice.rhythm
      };
    });
  }, [canon.voices, voiceRhythms]);

  // Generate default instruments if not provided
  const instruments: InstrumentType[] = partInstruments.length > 0
    ? partInstruments
    : ['piano', 'violin', 'flute', 'cello', 'harpsichord', 'bass'].slice(0, canon.voices.length);

  const muted: boolean[] = partMuted.length > 0
    ? partMuted
    : new Array(canon.voices.length).fill(false);

  return (
    <Card className="p-6 space-y-6 bg-gradient-to-br from-indigo-50/30 to-purple-50/30 dark:from-indigo-950/10 dark:to-purple-950/10 border-indigo-200 dark:border-indigo-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Canon #{index + 1}
              <Badge variant="outline" className="text-xs">
                {canon.metadata.type.replace(/_/g, ' ')}
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              {canon.metadata.description}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="text-xs gap-1 hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="w-3 h-3" />
          Remove
        </Button>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Voices</span>
          </div>
          <span className="text-sm font-semibold">{canon.voices.length}</span>
        </div>
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Duration</span>
          </div>
          <span className="text-sm font-semibold">{canon.metadata.totalDuration} beats</span>
        </div>
      </div>

      <div className="bg-muted/30 p-3 rounded-lg">
        <span className="text-xs font-medium text-muted-foreground">Entry Pattern: </span>
        <span className="text-xs">{canon.metadata.entryPattern}</span>
      </div>

      <Separator />

      {/* Voice Visualizations */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Voice Parts</h4>
        {canon.voices.map((voice, voiceIndex) => (
          <div key={voiceIndex} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={{ 
                    backgroundColor: `${colorPalette[voiceIndex % colorPalette.length]}20`,
                    borderColor: colorPalette[voiceIndex % colorPalette.length]
                  }}
                >
                  {voice.id}
                </Badge>
                {voice.delay > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Delay: {voice.delay} beats
                  </Badge>
                )}
                {voice.mensuration && voice.mensuration !== 1.0 && (
                  <Badge variant="outline" className="text-xs">
                    Speed: {voice.mensuration}x
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {voice.melody.length} notes
              </span>
            </div>
            <MelodyVisualizer
              melody={voice.melody}
              title=""
              color={colorPalette[voiceIndex % colorPalette.length]}
              showClearButton={false}
            />
            
            {/* ADDITIVE: Rhythm Controls for this voice */}
            <Card className="p-3 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {voice.id} Rhythm
                </span>
              </div>
              <ErrorBoundary>
                <RhythmControlsEnhanced
                  rhythm={voiceRhythms[voiceIndex] || Array(voice.melody.length).fill('quarter' as NoteValue)}
                  onRhythmChange={(newRhythm) => onVoiceRhythmChange(voiceIndex, newRhythm)}
                  melodyLength={voice.melody.length}
                />
              </ErrorBoundary>
            </Card>
          </div>
        ))}
      </div>

      <Separator />

      {/* Playback */}
      <div>
        <h4 className="text-sm font-medium mb-3">Canon Playback</h4>
        <AudioPlayer
          parts={parts}
          title={`${canon.metadata.type.replace(/_/g, ' ')} Playback`}
          selectedInstrument={selectedInstrument}
          onInstrumentChange={setSelectedInstrument}
          partInstruments={instruments}
          onPartInstrumentChange={onPartInstrumentChange}
          partMuted={muted}
          onPartMuteToggle={onPartMuteToggle}
          playerId={`canon-${index}`}
        />
      </div>

      {/* Info Panel */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <div className="text-xs space-y-2">
          <div>
            <strong className="text-indigo-900 dark:text-indigo-100">Canon Structure</strong>
          </div>
          <p className="text-indigo-800 dark:text-indigo-200">
            This {canon.metadata.type.replace(/_/g, ' ').toLowerCase()} follows classical 
            contrapuntal rules with {canon.voices.length} independent voice{canon.voices.length > 1 ? 's' : ''}.
          </p>
          <div className="space-y-1 text-indigo-700 dark:text-indigo-300">
            {canon.voices.map((voice, i) => (
              <div key={i}>
                • <strong>{voice.id}</strong>: Enters at beat {voice.delay || 0}
                {voice.mensuration && voice.mensuration !== 1.0 && ` (${voice.mensuration}x speed)`}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
