import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MelodyVisualizer } from './MelodyVisualizer';
import { AudioPlayer } from './AudioPlayer';
import { FugueResult, FugueBuilderEngine } from '../lib/fugue-builder-engine';
import { InstrumentType } from '../lib/enhanced-synthesis';
import { Layers, Trash2, Music, Clock } from 'lucide-react';
import { Separator } from './ui/separator';
import { NoteValue, noteValuesToRhythm } from '../types/musical';
import { RhythmControlsEnhanced } from './RhythmControlsEnhanced';
import { ErrorBoundary } from './ErrorBoundary';
import { useMemo } from 'react';

interface FugueVisualizerProps {
  fugue: FugueResult;
  index: number;
  onClear: () => void;
  colorPalette: string[];
  partInstruments: InstrumentType[];
  onPartInstrumentChange: (partIndex: number, instrument: InstrumentType) => void;
  partMuted: boolean[];
  onPartMuteToggle: (partIndex: number) => void;
  // ADDITIVE: Rhythm controls
  partRhythms?: NoteValue[][];
  onPartRhythmChange?: (partIndex: number, rhythm: NoteValue[]) => void;
}

export function FugueVisualizer({
  fugue,
  index,
  onClear,
  colorPalette,
  partInstruments,
  onPartInstrumentChange,
  partMuted,
  onPartMuteToggle,
  partRhythms = [],
  onPartRhythmChange = () => {}
}: FugueVisualizerProps) {
  // ADDITIVE FIX: Get base parts from fugue and apply CUSTOM RHYTHMS
  // RHYTHM PRECISION FIX: Include noteValues for proper sixteenth/dotted note playback
  const parts = useMemo(() => {
    const baseParts = FugueBuilderEngine.fugueToParts(fugue);
    
    return baseParts.map((part, partIndex) => {
      // Check if custom rhythm exists for this part
      const customRhythm = partRhythms[partIndex];
      
      if (customRhythm && Array.isArray(customRhythm) && customRhythm.length > 0) {
        // Apply custom rhythm
        const beatRhythm = noteValuesToRhythm(customRhythm);
        return {
          melody: part.melody,
          rhythm: beatRhythm,
          noteValues: customRhythm  // ADDITIVE FIX: High-precision rhythm for sixteenth/dotted notes
        };
      }
      
      // Use original rhythm if no custom rhythm
      return part;
    });
  }, [fugue, partRhythms]);

  return (
    <Card className="p-5 space-y-4 bg-purple-50/30 dark:bg-purple-950/10 border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold">Fugue #{index + 1}</h3>
          <Badge variant="outline" className="text-xs">
            {fugue.metadata.architecture.replace(/_/g, ' ')}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {fugue.metadata.totalVoices} voices
          </Badge>
        </div>
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

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="p-2 bg-muted/50 rounded">
          <div className="text-muted-foreground">Type</div>
          <div className="font-medium">{fugue.metadata.architecture.replace(/_/g, ' ')}</div>
        </div>
        <div className="p-2 bg-muted/50 rounded">
          <div className="text-muted-foreground">Voices</div>
          <div className="font-medium">{fugue.metadata.totalVoices}</div>
        </div>
        <div className="p-2 bg-muted/50 rounded">
          <div className="text-muted-foreground">Measures</div>
          <div className="font-medium">{fugue.metadata.totalMeasures}</div>
        </div>
        <div className="p-2 bg-muted/50 rounded">
          <div className="text-muted-foreground">Sections</div>
          <div className="font-medium">{fugue.sections.length}</div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {fugue.metadata.description}
      </p>

      <Separator />

      {/* Section Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Music className="w-4 h-4 text-purple-600" />
          Fugue Structure
        </div>

        {fugue.sections.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="p-3 bg-background/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {section.name}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {section.voices.length} entries
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                m.{section.startMeasure + 1} - {section.startMeasure + section.duration}
              </div>
            </div>

            <div className="space-y-1 text-xs">
              {section.voices.slice(0, 3).map((voice, voiceIndex) => (
                <div key={voiceIndex} className="flex items-center gap-2 text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    {voice.role}
                  </Badge>
                  <span>{voice.voiceId}</span>
                  <span>({voice.material.length} notes)</span>
                </div>
              ))}
              {section.voices.length > 3 && (
                <div className="text-muted-foreground">
                  + {section.voices.length - 3} more entries
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Voice Visualizations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Layers className="w-4 h-4 text-purple-600" />
          Voice Parts
        </div>

        {parts.map((part, partIndex) => (
          <div key={partIndex} className="space-y-2">
            <MelodyVisualizer
              melody={part.melody}
              title={`Voice ${partIndex + 1}`}
              color={colorPalette[partIndex % colorPalette.length]}
              showClearButton={false}
            />
            
            {/* ADDITIVE: Rhythm Controls for this part */}
            <Card className="p-3 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Voice {partIndex + 1} Rhythm
                </span>
              </div>
              <ErrorBoundary>
                <RhythmControlsEnhanced
                  rhythm={partRhythms[partIndex] || Array(part.melody.length).fill('quarter' as NoteValue)}
                  onRhythmChange={(newRhythm) => onPartRhythmChange(partIndex, newRhythm)}
                  melodyLength={part.melody.length}
                />
              </ErrorBoundary>
            </Card>
          </div>
        ))}
      </div>

      {/* Audio Player */}
      <AudioPlayer
        parts={parts}
        title="Fugue Playback"
        selectedInstrument="piano"
        onInstrumentChange={() => {}}
        partInstruments={partInstruments}
        onPartInstrumentChange={onPartInstrumentChange}
        partMuted={partMuted}
        onPartMuteToggle={onPartMuteToggle}
        playerId={`fugue-${index}`}
      />
    </Card>
  );
}
