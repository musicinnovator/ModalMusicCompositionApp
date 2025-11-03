/**
 * Composer Accompaniment Visualizer Component
 * ADDITIVE: Comprehensive visualizer for Famous Composer Accompaniments
 * Includes melody visualization, rhythm controls, and audio playback with effects
 * ENHANCEMENT: Added comprehensive pattern analysis, error handling, and detailed diagnostics
 * 
 * Pattern follows Canon/Fugue visualizers for consistency
 * Harris Software Solutions LLC
 */

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Music, Wand2, RefreshCw, Info, AlertTriangle, CheckCircle, Clock, Layers } from 'lucide-react';
import { ComposerAccompaniment } from '../lib/composer-accompaniment-library';
import { MelodyVisualizer } from './MelodyVisualizer';
import { AudioPlayer } from './AudioPlayer';
import { InstrumentType } from '../lib/enhanced-synthesis';
import { Part, NoteValue, noteValuesToRhythm, MidiNote, getNoteValueBeats } from '../types/musical';
import { RhythmControlsEnhanced } from './RhythmControlsEnhanced';
import { ErrorBoundary } from './ErrorBoundary';
import { useState, useMemo } from 'react';

// ADDITIVE FIX #2: Chord analysis helper function
// Analyzes MIDI note arrays and returns human-readable chord names
function analyzeChord(midiNotes: number[]): string {
  if (midiNotes.length === 0) return 'Empty';
  if (midiNotes.length === 1) return 'Single Note';
  
  // Sort notes
  const sorted = [...midiNotes].sort((a, b) => a - b);
  const root = sorted[0];
  
  // Calculate intervals from root
  const intervals = sorted.slice(1).map(note => note - root);
  
  // Note names
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const rootName = noteNames[root % 12];
  
  // Detect chord type based on intervals
  const intervalsKey = intervals.join(',');
  
  // Common chord patterns
  const chordTypes: Record<string, string> = {
    '3,7': 'dim',         // Diminished (C-Eb-Gb)
    '4,7': 'maj',         // Major (C-E-G)
    '3,6': 'min',         // Minor (C-Eb-G)
    '4,8': 'aug',         // Augmented (C-E-G#)
    '2,7': 'sus2',        // Sus2 (C-D-G)
    '5,7': 'sus4',        // Sus4 (C-F-G)
    '4,7,10': 'dom7',     // Dominant 7th (C-E-G-Bb)
    '4,7,11': 'maj7',     // Major 7th (C-E-G-B)
    '3,7,10': 'min7',     // Minor 7th (C-Eb-G-Bb)
    '3,6,9': 'dim7',      // Diminished 7th (C-Eb-Gb-A)
    '3,7,11': 'minMaj7',  // Minor-Major 7th (C-Eb-G-B)
    '4,7,9': '6',         // Major 6th (C-E-G-A)
    '3,7,9': 'min6',      // Minor 6th (C-Eb-G-A)
    '4,7,10,14': 'dom9',  // Dominant 9th (C-E-G-Bb-D)
    '4,7,11,14': 'maj9',  // Major 9th (C-E-G-B-D)
  };
  
  const chordType = chordTypes[intervalsKey];
  
  if (chordType) {
    return `${rootName}${chordType}`;
  }
  
  // If not a standard chord, show interval structure
  return `${rootName} [${sorted.map(n => noteNames[n % 12]).join('-')}]`;
}

// ADDITIVE FIX #2: Convert MIDI note to readable name with octave
function midiToNoteName(midi: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const noteName = noteNames[midi % 12];
  return `${noteName}${octave}`;
}

interface ComposerAccompanimentVisualizerProps {
  accompaniment: ComposerAccompaniment;  // Selected or edited accompaniment
  isEdited?: boolean;                    // Whether this is an edited version
  onResetEdits?: () => void;             // Reset to original
  // ADDITIVE: Rhythm controls
  customRhythm?: NoteValue[];
  onRhythmChange?: (rhythm: NoteValue[]) => void;
  // ADDITIVE: Instrument controls  
  selectedInstrument?: InstrumentType;
  onInstrumentChange?: (instrument: InstrumentType) => void;
  // ADDITIVE FIX #3: Play/Stop toggle for preview button
  isPlaying?: boolean;
  onPlayToggle?: (playing: boolean) => void;
  playbackControllerRef?: React.RefObject<any>;
}

export function ComposerAccompanimentVisualizer({
  accompaniment,
  isEdited = false,
  onResetEdits,
  customRhythm,
  onRhythmChange,
  selectedInstrument = 'piano',
  onInstrumentChange,
  isPlaying,
  onPlayToggle,
  playbackControllerRef
}: ComposerAccompanimentVisualizerProps) {
  
  // ADDITIVE: Internal state for muting (local to visualizer)
  const [isMuted, setIsMuted] = useState(false);

  // ADDITIVE: Convert accompaniment to Parts format for AudioPlayer
  // Handles both single notes and chords (arrays of notes)
  const parts: Part[] = useMemo(() => {
    const effectiveRhythm = customRhythm || accompaniment.pattern.rhythm.map(nv => nv as NoteValue);
    
    // Ensure rhythm matches melody length
    let finalRhythm: NoteValue[];
    if (effectiveRhythm.length === accompaniment.pattern.melody.length) {
      finalRhythm = effectiveRhythm;
    } else {
      // Default to quarter notes if mismatch
      finalRhythm = Array(accompaniment.pattern.melody.length).fill('quarter' as NoteValue);
    }
    
    const beatRhythm = noteValuesToRhythm(finalRhythm);
    
    return [{
      melody: accompaniment.pattern.melody,  // Already supports (MidiNote | MidiNote[] | -1)[]
      rhythm: beatRhythm,
      noteValues: finalRhythm  // High-precision rhythm
    }];
  }, [accompaniment.pattern.melody, accompaniment.pattern.rhythm, customRhythm]);

  // ADDITIVE: Flatten melody for MelodyVisualizer (single notes only)
  // Chords are shown as their root note for visual simplicity
  const flattenedMelody: MidiNote[] = useMemo(() => {
    return accompaniment.pattern.melody.map(note => {
      if (note === -1) return 60; // Rest - show as middle C for visualization
      if (Array.isArray(note)) return note[0]; // Chord - show root note
      return note; // Single note
    });
  }, [accompaniment.pattern.melody]);

  // ADDITIVE: Determine rhythm to display (custom or original)
  const displayRhythm = customRhythm || 
    accompaniment.pattern.rhythm.map(nv => nv as NoteValue) || 
    Array(accompaniment.pattern.melody.length).fill('quarter' as NoteValue);

  // ADDITIVE: COMPREHENSIVE PATTERN ANALYSIS with error checking
  const patternAnalysis = useMemo(() => {
    try {
      const melody = accompaniment.pattern.melody;
      const rhythm = accompaniment.pattern.rhythm;
      
      // Count different element types
      const noteCount = melody.filter(n => typeof n === 'number' && n !== -1).length;
      const chordCount = melody.filter(n => Array.isArray(n)).length;
      const restCount = melody.filter(n => n === -1).length;
      
      // Total notes in chords
      const totalChordNotes = melody
        .filter(n => Array.isArray(n))
        .reduce((sum, chord) => sum + chord.length, 0);
      
      // Calculate total duration in beats
      let totalBeats = 0;
      const rhythmArray = displayRhythm;
      
      for (let i = 0; i < rhythmArray.length; i++) {
        totalBeats += getNoteValueBeats(rhythmArray[i]);
      }
      
      // Analyze pitch range
      const allPitches: number[] = [];
      melody.forEach(note => {
        if (Array.isArray(note)) {
          allPitches.push(...note);
        } else if (typeof note === 'number' && note !== -1) {
          allPitches.push(note);
        }
      });
      
      const minPitch = allPitches.length > 0 ? Math.min(...allPitches) : 60;
      const maxPitch = allPitches.length > 0 ? Math.max(...allPitches) : 60;
      const pitchRange = maxPitch - minPitch;
      
      // Check for errors/warnings
      const warnings: string[] = [];
      if (rhythm.length !== melody.length) {
        warnings.push(`Rhythm length (${rhythm.length}) doesn't match melody length (${melody.length})`);
      }
      if (allPitches.length === 0) {
        warnings.push('Pattern contains no pitched notes (only rests)');
      }
      if (pitchRange > 48) {
        warnings.push(`Large pitch range (${pitchRange} semitones / ${(pitchRange / 12).toFixed(1)} octaves)`);
      }
      
      return {
        noteCount,
        chordCount,
        restCount,
        totalChordNotes,
        totalBeats,
        minPitch,
        maxPitch,
        pitchRange,
        uniquePitches: new Set(allPitches).size,
        warnings,
        isValid: warnings.length === 0
      };
    } catch (error) {
      console.error('Pattern analysis error:', error);
      return {
        noteCount: 0,
        chordCount: 0,
        restCount: 0,
        totalChordNotes: 0,
        totalBeats: 0,
        minPitch: 0,
        maxPitch: 0,
        pitchRange: 0,
        uniquePitches: 0,
        warnings: ['Analysis failed: ' + (error as Error).message],
        isValid: false
      };
    }
  }, [accompaniment.pattern.melody, accompaniment.pattern.rhythm, displayRhythm]);

  // ADDITIVE: Format metadata for display
  const { commonIn, difficulty, harmonyType, voicingType, tempoRange, keyContext, era } = accompaniment.metadata;

  return (
    <Card className="p-6 space-y-6 bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-950/10 dark:to-pink-950/10 border-purple-200 dark:border-purple-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              {accompaniment.title}
              {isEdited && (
                <Badge variant="default" className="text-xs">
                  Edited
                </Badge>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              {accompaniment.composer} • {accompaniment.period}
            </p>
          </div>
        </div>
        {isEdited && onResetEdits && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetEdits}
            className="text-xs gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Reset
          </Button>
        )}
      </div>

      {/* Metadata Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-xs">
          {difficulty}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {harmonyType}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {voicingType}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {accompaniment.pattern.melody.length} notes
        </Badge>
        {accompaniment.pattern.timeSignature && (
          <Badge variant="outline" className="text-xs">
            {accompaniment.pattern.timeSignature}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Description */}
      <div className="bg-muted/30 p-3 rounded-lg">
        <p className="text-sm">{accompaniment.description}</p>
      </div>

      {/* Melody Visualization */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Pattern Visualization</h4>
        <MelodyVisualizer
          melody={flattenedMelody}
          title=""
          color="#d946ef"
          showClearButton={false}
        />
        
        {/* ADDITIVE: Chord/Rest indicators */}
        <div className="flex flex-wrap gap-1 text-xs">
          {accompaniment.pattern.melody.map((note, idx) => {
            if (note === -1) {
              return (
                <Badge key={idx} variant="outline" className="text-xs bg-gray-100 dark:bg-gray-800">
                  Rest
                </Badge>
              );
            }
            if (Array.isArray(note)) {
              return (
                <Badge key={idx} variant="default" className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100">
                  Chord {note.length}
                </Badge>
              );
            }
            return null;
          }).filter(Boolean).length > 0 && (
            <span className="text-muted-foreground ml-2">
              {accompaniment.pattern.melody.filter(n => n === -1).length > 0 && 
                `${accompaniment.pattern.melody.filter(n => n === -1).length} rests`}
              {accompaniment.pattern.melody.filter(n => n === -1).length > 0 && 
               accompaniment.pattern.melody.filter(n => Array.isArray(n)).length > 0 && ' • '}
              {accompaniment.pattern.melody.filter(n => Array.isArray(n)).length > 0 && 
                `${accompaniment.pattern.melody.filter(n => Array.isArray(n)).length} chords`}
            </span>
          )}
        </div>
      </div>

      <Separator />

      {/* ADDITIVE: Rhythm Controls */}
      <Card className="p-3 bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <Music className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Rhythm Pattern
          </span>
          {customRhythm && (
            <Badge variant="secondary" className="text-xs">
              <Wand2 className="w-3 h-3 mr-1" />
              Custom
            </Badge>
          )}
        </div>
        <ErrorBoundary>
          <RhythmControlsEnhanced
            rhythm={displayRhythm}
            onRhythmChange={(newRhythm) => onRhythmChange?.(newRhythm)}
            melodyLength={accompaniment.pattern.melody.length}
          />
        </ErrorBoundary>
      </Card>

      <Separator />

      {/* ADDITIVE: COMPREHENSIVE PATTERN ANALYSIS PANEL */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Layers className="w-4 h-4 text-purple-600" />
          Pattern Analysis & Diagnostics
        </div>

        {/* Error/Warning Panel */}
        {!patternAnalysis.isValid && (
          <Card className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-medium text-yellow-900 dark:text-yellow-100">Warnings Detected:</p>
                {patternAnalysis.warnings.map((warning, idx) => (
                  <p key={idx} className="text-yellow-800 dark:text-yellow-200">• {warning}</p>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Success Panel */}
        {patternAnalysis.isValid && (
          <Card className="p-3 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-xs font-medium text-green-900 dark:text-green-100">Pattern validation passed</p>
            </div>
          </Card>
        )}

        {/* Detailed Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="p-2 bg-muted/50 rounded">
            <div className="text-muted-foreground">Single Notes</div>
            <div className="font-medium">{patternAnalysis.noteCount}</div>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <div className="text-muted-foreground">Chords</div>
            <div className="font-medium">{patternAnalysis.chordCount} ({patternAnalysis.totalChordNotes} notes)</div>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <div className="text-muted-foreground">Rests</div>
            <div className="font-medium">{patternAnalysis.restCount}</div>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <div className="text-muted-foreground">Total Duration</div>
            <div className="font-medium">{patternAnalysis.totalBeats} beats</div>
          </div>
        </div>

        {/* Pitch Range Analysis */}
        <Card className="p-3 bg-background/50">
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium">Pitch Range Analysis</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Lowest Note:</span>
                <span className="ml-1 font-medium">MIDI {patternAnalysis.minPitch}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Highest Note:</span>
                <span className="ml-1 font-medium">MIDI {patternAnalysis.maxPitch}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Range:</span>
                <span className="ml-1 font-medium">{patternAnalysis.pitchRange} semitones</span>
              </div>
              <div>
                <span className="text-muted-foreground">Unique Pitches:</span>
                <span className="ml-1 font-medium">{patternAnalysis.uniquePitches}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Chord Details (if any chords present) */}
        {patternAnalysis.chordCount > 0 && (
          <Card className="p-3 bg-background/50">
            <div className="space-y-2 text-xs">
              <div className="font-medium">Chord Breakdown</div>
              <div className="flex flex-wrap gap-1">
                {accompaniment.pattern.melody.map((note, idx) => {
                  if (Array.isArray(note)) {
                    return (
                      <Badge key={idx} variant="outline" className="text-xs">
                        #{idx + 1}: [{note.join(', ')}] ({analyzeChord(note)})
                      </Badge>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </Card>
        )}
      </div>

      <Separator />

      {/* ADDITIVE: Playback with Effects */}
      <div>
        <h4 className="text-sm font-medium mb-3">Accompaniment Playback</h4>
        <AudioPlayer
          parts={parts}
          title={`${accompaniment.title} Playback`}
          selectedInstrument={selectedInstrument}
          onInstrumentChange={onInstrumentChange}
          partInstruments={[selectedInstrument]}
          partMuted={[isMuted]}
          onPartMuteToggle={() => setIsMuted(!isMuted)}
          playerId={`accompaniment-${accompaniment.id}`}
          isPlaying={isPlaying}
          onPlayToggle={onPlayToggle}
          playbackControllerRef={playbackControllerRef}
        />
      </div>

      {/* ADDITIVE: Info Panel */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="text-xs space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-purple-600" />
            <strong className="text-purple-900 dark:text-purple-100">Pattern Information</strong>
          </div>
          
          {commonIn && commonIn.length > 0 && (
            <p className="text-purple-800 dark:text-purple-200">
              <strong>Common in:</strong> {commonIn.join(', ')}
            </p>
          )}
          
          {keyContext && (
            <p className="text-purple-800 dark:text-purple-200">
              <strong>Key Context:</strong> {keyContext}
            </p>
          )}
          
          {tempoRange && (
            <p className="text-purple-800 dark:text-purple-200">
              <strong>Tempo Range:</strong> {tempoRange[0]}-{tempoRange[1]} BPM
            </p>
          )}
          
          {era && (
            <p className="text-purple-800 dark:text-purple-200">
              <strong>Era:</strong> {era}
            </p>
          )}

          {accompaniment.tags && accompaniment.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {accompaniment.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}