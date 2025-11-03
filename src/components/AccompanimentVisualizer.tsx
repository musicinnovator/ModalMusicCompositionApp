/**
 * Accompaniment Visualizer Component
 * Visual representation of famous composer accompaniment patterns
 * Integrated with the comprehensive visualizer window
 * 
 * Harris Software Solutions LLC
 */

import { useMemo } from 'react';
import { MidiNote, NoteValue, midiNoteToNoteName } from '../types/musical';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Piano, Play, Trash2, Volume2, VolumeX } from 'lucide-react';

// ADDITIVE: Interface for accompaniment visualization
export interface AccompanimentVisualizationData {
  melody: MidiNote[];
  rhythm: NoteValue[];
  label: string;
  instrument: string;
  muted: boolean;
  timestamp: number;
}

interface AccompanimentVisualizerProps {
  accompaniments: AccompanimentVisualizationData[];
  onPlay?: (accompaniment: AccompanimentVisualizationData) => void;
  onToggleMute?: (timestamp: number) => void;
  onRemove?: (timestamp: number) => void;
}

export function AccompanimentVisualizer({
  accompaniments,
  onPlay,
  onToggleMute,
  onRemove
}: AccompanimentVisualizerProps) {
  
  // Calculate visualization data
  const visualizationData = useMemo(() => {
    return accompaniments.map((acc) => {
      const noteRange = {
        min: Math.min(...acc.melody),
        max: Math.max(...acc.melody)
      };
      
      const noteNames = acc.melody.map(note => midiNoteToNoteName(note));
      
      return {
        ...acc,
        noteRange,
        noteNames,
        noteCount: acc.melody.length
      };
    });
  }, [accompaniments]);

  // Get note color based on MIDI value
  const getNoteColor = (midiNote: number): string => {
    const normalizedNote = ((midiNote - 48) / 48) * 360; // Map to hue
    return `hsl(${normalizedNote}, 70%, 60%)`;
  };

  if (accompaniments.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <Piano className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No Accompaniments Added</p>
          <p className="text-sm mt-1">
            Select a famous composer accompaniment and add it to your composition
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Piano className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Composer Accompaniments</h3>
            <Badge variant="outline">{accompaniments.length} pattern{accompaniments.length !== 1 ? 's' : ''}</Badge>
          </div>
        </div>

        {/* Accompaniment List */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {visualizationData.map((acc, index) => (
              <Card 
                key={acc.timestamp} 
                className={`p-4 transition-all ${acc.muted ? 'opacity-50' : 'opacity-100'}`}
              >
                {/* Accompaniment Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{acc.label}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {acc.instrument}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{acc.noteCount} notes</span>
                      <span>•</span>
                      <span>Range: {midiNoteToNoteName(acc.noteRange.min)} - {midiNoteToNoteName(acc.noteRange.max)}</span>
                    </div>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPlay?.(acc)}
                      className="h-8 w-8 p-0"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleMute?.(acc.timestamp)}
                      className="h-8 w-8 p-0"
                    >
                      {acc.muted ? (
                        <VolumeX className="w-3 h-3" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove?.(acc.timestamp)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Visual Piano Roll */}
                <div className="space-y-2">
                  {/* Note Grid */}
                  <div className="relative h-24 bg-muted/30 rounded border overflow-hidden">
                    {acc.melody.map((note, noteIndex) => {
                      const normalizedHeight = ((note - acc.noteRange.min) / 
                        (acc.noteRange.max - acc.noteRange.min || 1)) * 100;
                      const xPosition = (noteIndex / acc.melody.length) * 100;
                      const width = (1 / acc.melody.length) * 100;
                      
                      return (
                        <div
                          key={noteIndex}
                          className="absolute transition-all hover:opacity-80"
                          style={{
                            left: `${xPosition}%`,
                            bottom: `${normalizedHeight * 0.8}%`,
                            width: `${width}%`,
                            height: '8px',
                            backgroundColor: getNoteColor(note),
                            borderRadius: '2px'
                          }}
                          title={`${midiNoteToNoteName(note)} (${acc.rhythm[noteIndex] || 'quarter'})`}
                        />
                      );
                    })}
                  </div>

                  {/* Note Names Preview (first 16 notes) */}
                  <div className="flex flex-wrap gap-1">
                    {acc.noteNames.slice(0, 16).map((name, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className="text-xs px-1.5 py-0"
                        style={{ 
                          borderColor: getNoteColor(acc.melody[i]),
                          color: getNoteColor(acc.melody[i])
                        }}
                      >
                        {name}
                      </Badge>
                    ))}
                    {acc.noteNames.length > 16 && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        +{acc.noteNames.length - 16} more
                      </Badge>
                    )}
                  </div>

                  {/* Rhythm Preview */}
                  <div className="text-xs text-muted-foreground">
                    Rhythm: {acc.rhythm.slice(0, 8).join(', ')}
                    {acc.rhythm.length > 8 && ` +${acc.rhythm.length - 8} more`}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Summary */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-muted-foreground">Total Patterns</div>
              <div className="font-semibold">{accompaniments.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Notes</div>
              <div className="font-semibold">
                {accompaniments.reduce((sum, acc) => sum + acc.melody.length, 0)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Active</div>
              <div className="font-semibold">
                {accompaniments.filter(acc => !acc.muted).length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
