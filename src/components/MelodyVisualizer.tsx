import { Melody, PITCH_NAMES, midiNoteToNoteName, isRest, isNote, melodyElementToString, NoteValue, getNoteValueBeats } from '../types/musical';
import { Button } from './ui/button';
import { Trash2, Music2 } from 'lucide-react';
import { Badge } from './ui/badge';

interface MelodyVisualizerProps {
  melody: Melody;
  title: string;
  color: string;
  onClear?: () => void;
  showClearButton?: boolean;
  // ADDITIVE: Rhythm visualization support
  rhythm?: NoteValue[];
  showRhythm?: boolean;
}

export function MelodyVisualizer({ melody, title, color, onClear, showClearButton = false }: MelodyVisualizerProps) {
  if (!melody || melody.length === 0) {
    return (
      <div className="p-4 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3>{title}</h3>
          {showClearButton && onClear && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="text-xs gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </Button>
          )}
        </div>
        <div className="text-muted-foreground">No melody to display</div>
      </div>
    );
  }

  // Filter out rests for pitch calculations
  const noteElements = melody.filter(isNote);
  if (noteElements.length === 0) {
    // If melody contains only rests, use a default range
    const range = 12; // One octave
    const baseY = 72; // C5
    
    return (
      <div className="p-4 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3>{title}</h3>
          {showClearButton && onClear && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="text-xs gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </Button>
          )}
        </div>
        <div className="relative h-48 overflow-x-auto">
          <svg 
            width={Math.max(300, melody.length * 40)} 
            height="100%" 
            className="border border-border rounded bg-background"
          >
            {/* Staff lines */}
            {Array.from({ length: range + 1 }, (_, i) => (
              <line
                key={i}
                x1={20}
                y1={20 + (i * 160) / range}
                x2={melody.length * 40 + 20}
                y2={20 + (i * 160) / range}
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.3"
              />
            ))}
            
            {/* Rest symbols */}
            {melody.map((element, i) => (
              <g key={i}>
                {isRest(element) ? (
                  <>
                    <text
                      x={40 + i * 40}
                      y={20 + (range * 160) / 2}
                      textAnchor="middle"
                      className="text-lg fill-orange-600 font-bold"
                    >
                      r
                    </text>
                    <text
                      x={40 + i * 40}
                      y={20 + (range * 160) / 2 + 15}
                      textAnchor="middle"
                      className="text-xs fill-foreground"
                    >
                      Rest
                    </text>
                  </>
                ) : null}
              </g>
            ))}
          </svg>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Elements: {melody.map(element => melodyElementToString(element)).join(' - ')}
        </div>
      </div>
    );
  }

  const minPitch = Math.min(...noteElements);
  const maxPitch = Math.max(...noteElements);
  const range = Math.max(12, maxPitch - minPitch + 4); // At least an octave
  const baseY = maxPitch + 2;

  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3>{title}</h3>
        {showClearButton && onClear && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="text-xs gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </Button>
        )}
      </div>
      <div className="relative h-48 overflow-x-auto">
        <svg 
          width={Math.max(300, melody.length * 40)} 
          height="100%" 
          className="border border-border rounded bg-background"
        >
          {/* Staff lines */}
          {Array.from({ length: range + 1 }, (_, i) => (
            <line
              key={i}
              x1={20}
              y1={20 + (i * 160) / range}
              x2={melody.length * 40 + 20}
              y2={20 + (i * 160) / range}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}
          
          {/* Melody line - connect only notes, skip rests */}
          <polyline
            points={melody
              .map((element, i) => {
                if (isNote(element)) {
                  return `${40 + i * 40},${20 + ((baseY - element) * 160) / range}`;
                }
                return null;
              })
              .filter(point => point !== null)
              .join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          
          {/* Note points and rest symbols */}
          {melody.map((element, i) => (
            <g key={i}>
              {isNote(element) ? (
                <>
                  <circle
                    cx={40 + i * 40}
                    cy={20 + ((baseY - element) * 160) / range}
                    r="4"
                    fill={color}
                  />
                  <text
                    x={40 + i * 40}
                    y={20 + ((baseY - element) * 160) / range - 10}
                    textAnchor="middle"
                    className="text-xs fill-foreground"
                  >
                    {midiNoteToNoteName(element)}
                  </text>
                </>
              ) : (
                <>
                  <text
                    x={40 + i * 40}
                    y={20 + (range * 160) / 2}
                    textAnchor="middle"
                    className="text-lg fill-orange-600 font-bold"
                  >
                    r
                  </text>
                  <text
                    x={40 + i * 40}
                    y={20 + (range * 160) / 2 + 15}
                    textAnchor="middle"
                    className="text-xs fill-foreground"
                  >
                    Rest
                  </text>
                </>
              )}
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        Elements: {melody.map(element => melodyElementToString(element)).join(' - ')}
      </div>
    </div>
  );
}