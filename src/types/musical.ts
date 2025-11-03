export type PitchClass = number; // 0..11 (C=0, C#=1, ..., B=11)
export type MidiNote = number; // 0..127 (full MIDI note range)
export type RestValue = -1; // Special value to represent rests in melodies
export type MelodyElement = MidiNote | RestValue; // Can be either a note or a rest
// ADDITIVE: Support for chords (multiple simultaneous notes) in accompaniments
export type ChordElement = MidiNote[]; // Array of simultaneous notes
export type MelodyOrChordElement = MidiNote | ChordElement | RestValue; // Single note, chord, or rest
export type Interval = number; // semitone distance; can be negative
export type Degree = number; // scale degree index (0..6)
export type ModeIndex = number; // 1..6
export type StepPattern = number[]; // sequence of 7 intervals (2 for whole, 1 for half)
export type Melody = MelodyElement[]; // Can contain notes and rests
// ADDITIVE: Extended melody type that supports chords for accompaniment patterns
export type MelodyWithChords = MelodyOrChordElement[]; // Can contain notes, chords, and rests
export type Rhythm = number[]; // rests and note durations as counts

// Rest duration types for precise musical notation
export type RestDuration = 
  | 'whole-rest'       // 4 beats
  | 'half-rest'        // 2 beats  
  | 'quarter-rest'     // 1 beat
  | 'eighth-rest'      // 0.5 beats
  | 'sixteenth-rest'   // 0.25 beats
  | 'dotted-half-rest' // 3 beats
  | 'dotted-quarter-rest'; // 1.5 beats

export interface RestNote {
  type: 'rest';
  duration: RestDuration;
  beats: number;
}

export interface PitchNote {
  type: 'note';
  midi: MidiNote;
  duration: NoteValue;
  beats: number;
}

export type EnhancedMelodyElement = PitchNote | RestNote;

// Song Creation Types
export interface SongTrack {
  id: string;
  name: string;
  type: 'theme' | 'imitation' | 'fugue' | 'counterpoint' | 'part' | 'harmony';
  melody: Melody;
  rhythm: Rhythm;
  noteValues?: NoteValue[]; // ADDED: Preserve original rhythm data for accurate MIDI export
  harmonyNotes?: Melody[]; // ADDED: For harmony tracks - array of chord note arrays
  startTime: number; // in beats
  endTime: number; // in beats
  color: string;
  instrument: string;
  volume: number; // 0-100
  muted: boolean;
  solo: boolean;
  
  // COMPLETE DATA TRANSFER: Preserve all component metadata when added to timeline
  metadata?: {
    // Harmony-specific metadata
    chordLabels?: string[];
    chordProgression?: string[];
    chordRoots?: number[];
    chordTimings?: number[];
    detectedKey?: number;
    keyQuality?: 'major' | 'minor';
    confidence?: number;
    originalMelody?: Melody;
    
    // Canon-specific metadata
    canonType?: string;
    entryDelay?: number;
    entryPattern?: string;
    voiceIndex?: number;
    
    // Fugue-specific metadata
    fugueArchitecture?: string;
    voiceRole?: string;
    fugueSection?: string;
    totalVoices?: number;
    
    // Counterpoint-specific metadata
    technique?: string;
    species?: string;
    
    // General metadata
    timestamp?: number;
    generatorType?: string;
  };
}

export interface Song {
  id: string;
  title: string;
  composer: string;
  tempo: number;
  timeSignature: string;
  keySignature: KeySignature | null;
  mode: Mode | null;
  tracks: SongTrack[];
  totalDuration: number; // in beats
  loopStart: number; // in beats
  loopEnd: number; // in beats
  loopEnabled: boolean;
  created: string;
  lastModified: string;
}

export interface AvailableComponent {
  id: string;
  name: string;
  type: 'theme' | 'imitation' | 'fugue' | 'counterpoint' | 'part' | 'harmony';
  melody: Melody;
  rhythm: Rhythm;
  noteValues?: NoteValue[]; // ADDED: Preserve original rhythm for MIDI export
  harmonyNotes?: Melody[]; // ADDED: For harmony components - array of chord note arrays
  instrument?: string; // CRITICAL: Preserve instrument selection for harmony and other components
  color: string;
  duration: number; // in beats
  description: string;
  
  // COMPLETE DATA TRANSFER: Additional metadata for full component preservation
  metadata?: {
    // Harmony-specific metadata
    chordLabels?: string[];
    chordProgression?: string[];
    chordRoots?: number[];
    chordTimings?: number[];
    detectedKey?: number;
    keyQuality?: 'major' | 'minor';
    confidence?: number;
    originalMelody?: Melody; // For harmony: the original unharmonized melody
    
    // Canon-specific metadata
    canonType?: string;
    entryDelay?: number;
    entryPattern?: string;
    voiceIndex?: number; // Which voice in the canon (0 = leader, 1+ = followers)
    
    // Fugue-specific metadata  
    fugueArchitecture?: string;
    voiceRole?: string; // 'subject', 'answer', 'countersubject', 'episode', etc.
    fugueSection?: string; // 'exposition', 'development', 'recapitulation', etc.
    totalVoices?: number;
    
    // Counterpoint-specific metadata
    technique?: string; // Species type, imitation technique, etc.
    species?: string; // For species counterpoint
    
    // General metadata
    timestamp?: number; // Original creation timestamp for reference
    generatorType?: string; // Which generator created this ('harmony', 'canon', 'fugue', etc.)
  };
}

// Enhanced rhythm types for species counterpoint
export type NoteValue = 
  | 'whole'       // 4 beats
  | 'half'        // 2 beats  
  | 'quarter'     // 1 beat
  | 'eighth'      // 0.5 beats
  | 'sixteenth'   // 0.25 beats
  | 'dotted-half' // 3 beats
  | 'dotted-quarter' // 1.5 beats
  | 'double-whole' // 8 beats (breve)
  | 'rest';        // 0 beats (rest/delay)

export interface RhythmicNote {
  midi: MidiNote;
  duration: NoteValue;
  beats: number; // Numerical value for calculation
}

export interface CounterpointVoice {
  melody: RhythmicNote[];
  species: 'first' | 'second' | 'third' | 'fourth' | 'fifth';
  ratioToCantusFirmus: string; // e.g., "1:1", "2:1", "4:1"
}

// Helper functions for rhythm
export function getNoteValueBeats(duration: NoteValue): number {
  switch (duration) {
    case 'double-whole': return 8;
    case 'whole': return 4;
    case 'dotted-half': return 3;
    case 'half': return 2;
    case 'dotted-quarter': return 1.5;
    case 'quarter': return 1;
    case 'eighth': return 0.5;
    case 'sixteenth': return 0.25;
    case 'rest': return 0; // Rest/delay = 0 beats
    default: return 1;
  }
}

export function createRhythmicNote(midi: MidiNote, duration: NoteValue): RhythmicNote {
  return {
    midi,
    duration,
    beats: getNoteValueBeats(duration)
  };
}

export function createRestNote(duration: RestDuration): RestNote {
  return {
    type: 'rest',
    duration,
    beats: getRestValueBeats(duration)
  };
}

export function createPitchNote(midi: MidiNote, duration: NoteValue): PitchNote {
  return {
    type: 'note',
    midi,
    duration,
    beats: getNoteValueBeats(duration)
  };
}

// Convert NoteValue array to beat-based Rhythm array
export function noteValuesToRhythm(noteValues: NoteValue[]): Rhythm {
  const rhythm: Rhythm = [];
  
  noteValues.forEach(noteValue => {
    if (noteValue === 'rest') {
      // Rest = single 0 beat (no note plays, creates delay)
      rhythm.push(0);
    } else {
      const beats = getNoteValueBeats(noteValue);
      const beatCount = Math.ceil(beats); // Round up to ensure full duration
      
      // First beat is 1 (note plays), rest are 0 (sustain)
      rhythm.push(1);
      for (let i = 1; i < beatCount; i++) {
        rhythm.push(0);
      }
    }
  });
  
  return rhythm;
}

// Convert beat-based Rhythm to NoteValue array (approximation)
export function rhythmToNoteValues(rhythm: Rhythm): NoteValue[] {
  const noteValues: NoteValue[] = [];
  let i = 0;
  
  while (i < rhythm.length) {
    if (rhythm[i] === 1) {
      // Count consecutive beats (1 followed by 0s for sustain)
      let beatCount = 1;
      while (i + beatCount < rhythm.length && rhythm[i + beatCount] === 0) {
        beatCount++;
      }
      
      // Map beat count to NoteValue
      if (beatCount >= 8) noteValues.push('double-whole');
      else if (beatCount >= 4) noteValues.push('whole');
      else if (beatCount >= 3) noteValues.push('dotted-half');
      else if (beatCount >= 2) noteValues.push('half');
      else if (beatCount >= 1.5) noteValues.push('dotted-quarter');
      else noteValues.push('quarter');
      
      i += beatCount;
    } else {
      // Standalone 0 = rest/delay (used for entry delays in fugues/imitations)
      noteValues.push('rest');
      i++;
    }
  }
  
  return noteValues;
}

export function getRestValueBeats(duration: RestDuration): number {
  switch (duration) {
    case 'whole-rest': return 4;
    case 'dotted-half-rest': return 3;
    case 'half-rest': return 2;
    case 'dotted-quarter-rest': return 1.5;
    case 'quarter-rest': return 1;
    case 'eighth-rest': return 0.5;
    case 'sixteenth-rest': return 0.25;
    default: return 1;
  }
}

/**
 * Convert an array of beat durations (from rhythm controls/species counterpoint)
 * to the standard Rhythm format used by AudioPlayer
 * @param beatDurations - Array of beat duration values for each note
 * @returns Standard Rhythm array where each index represents a beat
 */
export function beatDurationsToRhythm(beatDurations: number[]): Rhythm {
  const rhythm: number[] = [];
  
  beatDurations.forEach((duration) => {
    // Add a beat with the note (1)
    rhythm.push(1);
    
    // Add rest beats (0) for the remaining duration
    const restBeats = Math.floor(duration) - 1;
    for (let i = 0; i < restBeats; i++) {
      rhythm.push(0);
    }
  });
  
  return rhythm;
}

// Helper functions for rest detection and conversion
export function isRest(element: MelodyElement): element is RestValue {
  return element === -1;
}

export function isNote(element: MelodyElement): element is MidiNote {
  return element !== -1 && element >= 0 && element <= 127;
}

export function melodyElementToString(element: MelodyElement): string {
  if (isRest(element)) {
    return 'Rest';
  } else {
    return midiNoteToNoteName(element);
  }
}

// Enhanced theme with optional rhythm information
export type EnhancedTheme = RhythmicNote[];

// Helper functions for theme conversion
export function melodyToRhythmicNotes(melody: Melody, defaultDuration: NoteValue = 'quarter'): RhythmicNote[] {
  return melody.map(midi => createRhythmicNote(midi, defaultDuration));
}

export function rhythmicNotesToMelody(rhythmicNotes: RhythmicNote[]): Melody {
  return rhythmicNotes.map(note => note.midi);
}

export function themeToRhythmicNotes(theme: Theme, defaultDuration: NoteValue = 'quarter'): RhythmicNote[] {
  return theme.map(midi => createRhythmicNote(midi, defaultDuration));
}

// Species ratio calculations
export function calculateSpeciesRatio(cantusFirmus: RhythmicNote[], counterpoint: RhythmicNote[]): string {
  if (cantusFirmus.length === 0 || counterpoint.length === 0) return '0:0';
  
  const cfTotalBeats = cantusFirmus.reduce((sum, note) => sum + note.beats, 0);
  const cpTotalBeats = counterpoint.reduce((sum, note) => sum + note.beats, 0);
  
  // Find the ratio by comparing note densities
  const cfNoteCount = cantusFirmus.length;
  const cpNoteCount = counterpoint.length;
  
  if (cfNoteCount === cpNoteCount) return '1:1';
  if (cpNoteCount === cfNoteCount * 2) return '2:1';
  if (cpNoteCount === cfNoteCount * 3) return '3:1';
  if (cpNoteCount === cfNoteCount * 4) return '4:1';
  
  // Calculate actual ratio
  const ratio = Math.round((cpNoteCount / cfNoteCount) * 10) / 10;
  return `${ratio}:1`;
}

export interface Voice {
  melody: Melody;
  rhythm: Rhythm;
  noteValues?: NoteValue[];  // ADDITIVE FIX: High-precision rhythm for proper sixteenth/dotted note playback
}

export type Theme = Melody;
export type CantusFirmus = Melody;
export type Part = Voice;

// Bach-like preset theme variables - Enhanced to support dynamic variables
export interface BachLikeVariables {
  cantusFirmus: Melody;              // CF - Main melodic line
  floridCounterpoint1: Melody;       // FCP1 - First elaborate counterpoint
  floridCounterpoint2: Melody;       // FCP2 - Second elaborate counterpoint
  cantusFirmusFragment1: Melody;     // CFF1 - First CF fragment
  cantusFirmusFragment2: Melody;     // CFF2 - Second CF fragment
  floridCounterpointFrag1: Melody;   // FPC1 - First FCP fragment
  floridCounterpointFrag2: Melody;   // FPC2 - Second FCP fragment
  countersubject1: Melody;           // CS1 - First countersubject
  countersubject2: Melody;           // CS2 - Second countersubject
  // Dynamic variables can be added at runtime
  [key: string]: Melody;             // Support for custom variables
}

export type BachVariableName = keyof BachLikeVariables;

// Built-in Bach variable names (the core 9 variables)
export const BUILT_IN_BACH_VARIABLES = [
  'cantusFirmus',
  'floridCounterpoint1',
  'floridCounterpoint2',
  'cantusFirmusFragment1',
  'cantusFirmusFragment2',
  'floridCounterpointFrag1',
  'floridCounterpointFrag2',
  'countersubject1',
  'countersubject2'
] as const;

export type BuiltInBachVariableName = typeof BUILT_IN_BACH_VARIABLES[number];

// Default labels for built-in variables
const DEFAULT_BACH_VARIABLE_LABELS: Record<string, string> = {
  cantusFirmus: 'Cantus Firmus (CF)',
  floridCounterpoint1: 'Florid Counterpoint 1 (FCP1)',
  floridCounterpoint2: 'Florid Counterpoint 2 (FCP2)',
  cantusFirmusFragment1: 'Cantus Firmus Fragment 1 (CFF1)',
  cantusFirmusFragment2: 'Cantus Firmus Fragment 2 (CFF2)',
  floridCounterpointFrag1: 'Florid Counterpoint Frag 1 (FPC1)',
  floridCounterpointFrag2: 'Florid Counterpoint Frag 2 (FPC2)',
  countersubject1: 'Countersubject 1 (CS1)',
  countersubject2: 'Countersubject 2 (CS2)'
};

const DEFAULT_BACH_VARIABLE_SHORT_LABELS: Record<string, string> = {
  cantusFirmus: 'CF',
  floridCounterpoint1: 'FCP1',
  floridCounterpoint2: 'FCP2',
  cantusFirmusFragment1: 'CFF1',
  cantusFirmusFragment2: 'CFF2',
  floridCounterpointFrag1: 'FPC1',
  floridCounterpointFrag2: 'FPC2',
  countersubject1: 'CS1',
  countersubject2: 'CS2'
};

// Helper functions to get labels (supports dynamic variables)
export function getBachVariableLabel(variableName: string): string {
  return DEFAULT_BACH_VARIABLE_LABELS[variableName] || variableName;
}

export function getBachVariableShortLabel(variableName: string): string {
  return DEFAULT_BACH_VARIABLE_SHORT_LABELS[variableName] || variableName.substring(0, 8).toUpperCase();
}

// Export for backward compatibility
export const BACH_VARIABLE_LABELS = DEFAULT_BACH_VARIABLE_LABELS;
export const BACH_VARIABLE_SHORT_LABELS = DEFAULT_BACH_VARIABLE_SHORT_LABELS;

export interface EntrySpec {
  entryInterval: Interval; // transposition in semitones
  entryDelay: number; // rests before entry (durational units)
}

export interface Mode {
  index: ModeIndex;
  stepPattern: StepPattern; // positions of half-steps implied
  final: PitchClass; // modal final (tonic-like)
  octaveSpan: Interval; // typically 12 semitones
  name: string;
}

export const PITCH_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

// MIDI utility functions
export function midiNoteToNoteName(midiNote: MidiNote): string {
  const pitchClass = midiNote % 12;
  const octave = Math.floor(midiNote / 12) - 1; // MIDI octave starts at -1
  return `${PITCH_NAMES[pitchClass]}${octave}`;
}

export function midiNoteToPitchClass(midiNote: MidiNote): PitchClass {
  return midiNote % 12;
}

export function midiNoteToOctave(midiNote: MidiNote): number {
  return Math.floor(midiNote / 12) - 1;
}

export function pitchClassAndOctaveToMidiNote(pitchClass: PitchClass, octave: number): MidiNote {
  // Validate inputs to prevent NaN
  if (typeof pitchClass !== 'number' || isNaN(pitchClass)) {
    console.error(`pitchClassAndOctaveToMidiNote: Invalid pitchClass: ${pitchClass}`);
    return 60; // Default to middle C
  }
  
  if (typeof octave !== 'number' || isNaN(octave)) {
    console.error(`pitchClassAndOctaveToMidiNote: Invalid octave: ${octave}`);
    return 60; // Default to middle C
  }
  
  const midiNote = (octave + 1) * 12 + pitchClass;
  
  // Validate output
  if (isNaN(midiNote)) {
    console.error(`pitchClassAndOctaveToMidiNote: Calculation resulted in NaN (pitchClass: ${pitchClass}, octave: ${octave})`);
    return 60; // Default to middle C
  }
  
  return midiNote;
}

// For backward compatibility - convert pitch class to middle octave MIDI note
export function pitchClassToMidiNote(pitchClass: PitchClass): MidiNote {
  return pitchClassAndOctaveToMidiNote(pitchClass, 4); // Default to octave 4 (middle C = 60)
}

export const MODE_NAMES = [
  'Dorian',
  'Phrygian', 
  'Lydian',
  'Mixolydian',
  'Aeolian',
  'Locrian'
];

// Extended mode categories for cultural scales
export interface ModeCategory {
  name: string;
  modes: Mode[];
}

export const EXTENDED_MODE_CATEGORIES = {
  WESTERN_TRADITIONAL: 'Western Traditional',
  CHINESE: 'Chinese Modes',
  JAPANESE: 'Japanese Modes', 
  MIDDLE_EASTERN: 'Middle Eastern',
  INDIAN_CLASSICAL: 'Indian Classical',
  EUROPEAN_FOLK: 'European Folk',
  AFRICAN: 'African Modes',
  NATIVE_AMERICAN: 'Native American',
  BLUES_JAZZ: 'Blues & Jazz',
  EXOTIC: 'Exotic Scales',
  MICROTONAL: 'Microtonal Experiments'
};

// Key signature system
export interface KeySignature {
  key: PitchClass; // 0-11 representing the tonic
  mode: 'major' | 'minor';
  name: string;
  sharps: number; // positive for sharps, negative for flats, 0 for natural
  accidentalPitches: PitchClass[]; // which pitches are altered
}

export const KEY_SIGNATURES: KeySignature[] = [
  // Major keys - sharp keys
  { key: 0, mode: 'major', name: 'C Major', sharps: 0, accidentalPitches: [] },
  { key: 7, mode: 'major', name: 'G Major', sharps: 1, accidentalPitches: [6] }, // F#
  { key: 2, mode: 'major', name: 'D Major', sharps: 2, accidentalPitches: [6, 1] }, // F#, C#
  { key: 9, mode: 'major', name: 'A Major', sharps: 3, accidentalPitches: [6, 1, 8] }, // F#, C#, G#
  { key: 4, mode: 'major', name: 'E Major', sharps: 4, accidentalPitches: [6, 1, 8, 3] }, // F#, C#, G#, D#
  { key: 11, mode: 'major', name: 'B Major', sharps: 5, accidentalPitches: [6, 1, 8, 3, 10] }, // F#, C#, G#, D#, A#
  { key: 6, mode: 'major', name: 'F♯ Major', sharps: 6, accidentalPitches: [6, 1, 8, 3, 10, 5] }, // F#, C#, G#, D#, A#, E#
  { key: 1, mode: 'major', name: 'C♯ Major', sharps: 7, accidentalPitches: [6, 1, 8, 3, 10, 5, 0] }, // All sharps
  
  // Major keys - flat keys  
  { key: 5, mode: 'major', name: 'F Major', sharps: -1, accidentalPitches: [10] }, // Bb
  { key: 10, mode: 'major', name: 'B♭ Major', sharps: -2, accidentalPitches: [10, 3] }, // Bb, Eb
  { key: 3, mode: 'major', name: 'E♭ Major', sharps: -3, accidentalPitches: [10, 3, 8] }, // Bb, Eb, Ab
  { key: 8, mode: 'major', name: 'A♭ Major', sharps: -4, accidentalPitches: [10, 3, 8, 1] }, // Bb, Eb, Ab, Db
  { key: 1, mode: 'major', name: 'D♭ Major', sharps: -5, accidentalPitches: [10, 3, 8, 1, 6] }, // Bb, Eb, Ab, Db, Gb
  { key: 6, mode: 'major', name: 'G♭ Major', sharps: -6, accidentalPitches: [10, 3, 8, 1, 6, 0] }, // Bb, Eb, Ab, Db, Gb, Cb
  
  // Minor keys (natural minor) - sharp keys
  { key: 9, mode: 'minor', name: 'A Minor', sharps: 0, accidentalPitches: [] },
  { key: 4, mode: 'minor', name: 'E Minor', sharps: 1, accidentalPitches: [6] }, // F#
  { key: 11, mode: 'minor', name: 'B Minor', sharps: 2, accidentalPitches: [6, 1] }, // F#, C#
  { key: 6, mode: 'minor', name: 'F♯ Minor', sharps: 3, accidentalPitches: [6, 1, 8] }, // F#, C#, G#
  { key: 1, mode: 'minor', name: 'C♯ Minor', sharps: 4, accidentalPitches: [6, 1, 8, 3] }, // F#, C#, G#, D#
  { key: 8, mode: 'minor', name: 'G♯ Minor', sharps: 5, accidentalPitches: [6, 1, 8, 3, 10] }, // F#, C#, G#, D#, A#
  { key: 3, mode: 'minor', name: 'D♯ Minor', sharps: 6, accidentalPitches: [6, 1, 8, 3, 10, 5] }, // F#, C#, G#, D#, A#, E#
  { key: 10, mode: 'minor', name: 'A♯ Minor', sharps: 7, accidentalPitches: [6, 1, 8, 3, 10, 5, 0] }, // All sharps
  
  // Minor keys - flat keys
  { key: 2, mode: 'minor', name: 'D Minor', sharps: -1, accidentalPitches: [10] }, // Bb
  { key: 7, mode: 'minor', name: 'G Minor', sharps: -2, accidentalPitches: [10, 3] }, // Bb, Eb
  { key: 0, mode: 'minor', name: 'C Minor', sharps: -3, accidentalPitches: [10, 3, 8] }, // Bb, Eb, Ab
  { key: 5, mode: 'minor', name: 'F Minor', sharps: -4, accidentalPitches: [10, 3, 8, 1] }, // Bb, Eb, Ab, Db
  { key: 10, mode: 'minor', name: 'B♭ Minor', sharps: -5, accidentalPitches: [10, 3, 8, 1, 6] }, // Bb, Eb, Ab, Db, Gb
  { key: 3, mode: 'minor', name: 'E♭ Minor', sharps: -6, accidentalPitches: [10, 3, 8, 1, 6, 0] }, // Bb, Eb, Ab, Db, Gb, Cb
  { key: 8, mode: 'minor', name: 'A♭ Minor', sharps: -7, accidentalPitches: [10, 3, 8, 1, 6, 0, 5] } // All flats
];

// Helper function to get key signature symbol
export function getKeySignatureSymbol(sharps: number): string {
  if (sharps === 0) return '';
  if (sharps > 0) {
    return '♯'.repeat(Math.abs(sharps));
  } else {
    return '♭'.repeat(Math.abs(sharps));
  }
}

// Generate scale notes from a mode and key signature
export function generateModeScale(mode: Mode, keySignature: KeySignature, octave: number = 4): MidiNote[] {
  try {
    if (!mode || !keySignature) {
      console.error('generateModeScale: Invalid mode or key signature');
      return [];
    }

    const scale: MidiNote[] = [];
    
    // Validate mode.final
    if (typeof mode.final !== 'number' || isNaN(mode.final) || mode.final < 0 || mode.final > 11) {
      console.error(`generateModeScale: Invalid mode.final value: ${mode.final}. Expected 0-11.`);
      return [];
    }
    
    // Validate octave
    if (typeof octave !== 'number' || isNaN(octave) || octave < -1 || octave > 9) {
      console.error(`generateModeScale: Invalid octave value: ${octave}. Expected -1 to 9.`);
      return [];
    }
    
    // The mode.final should already be set to the correct pitch class based on the key signature
    // when the mode was created in buildAllWorldModes(), so we don't need to add keySignature.key again
    const rootPitchClass = mode.final;
    let currentMidiNote = pitchClassAndOctaveToMidiNote(rootPitchClass, octave);
    
    // Validate MIDI note range - also check for NaN
    if (isNaN(currentMidiNote) || currentMidiNote < 0 || currentMidiNote > 127) {
      console.error(`generateModeScale: Root note ${currentMidiNote} out of MIDI range`);
      return [];
    }
    
    // Start with the root note
    scale.push(currentMidiNote);
    
    // Generate the rest of the scale using the mode's step pattern
    for (let i = 0; i < mode.stepPattern.length && i < 11; i++) { // Limit to prevent infinite loops
      const step = mode.stepPattern[i];
      
      // Validate step size - also check for NaN
      if (typeof step !== 'number' || isNaN(step) || step < 0 || step > 12) {
        console.warn(`generateModeScale: Invalid step ${step} at index ${i}, skipping`);
        continue;
      }
      
      currentMidiNote += step;
      
      // Ensure we don't exceed MIDI range - also check for NaN
      if (!isNaN(currentMidiNote) && currentMidiNote > 0 && currentMidiNote <= 127) {
        scale.push(currentMidiNote);
      } else {
        console.warn(`generateModeScale: Note ${currentMidiNote} out of MIDI range, stopping scale generation`);
        break;
      }
    }
    
    // Validate the generated scale
    if (scale.length === 0) {
      console.error('generateModeScale: Generated empty scale');
      return [];
    }
    
    console.log(`🎼 Generated scale for ${mode.name} in ${keySignature.name}:`, 
                scale.map(note => midiNoteToNoteName(note)).join(', '));
    
    return scale;
  } catch (error) {
    console.error('generateModeScale: Error generating scale:', error);
    return [];
  }
}

// Get a more extended scale covering multiple octaves
export function generateExtendedModeScale(mode: Mode, keySignature: KeySignature, startOctave: number = 2, octaveCount: number = 4): MidiNote[] {
  try {
    if (!mode || !keySignature) {
      console.error('generateExtendedModeScale: Invalid mode or key signature');
      return [];
    }

    // Validate parameters
    if (startOctave < 0 || startOctave > 9) {
      console.warn('generateExtendedModeScale: Start octave out of range, using 2');
      startOctave = 2;
    }
    
    if (octaveCount < 1 || octaveCount > 8) {
      console.warn('generateExtendedModeScale: Octave count out of range, using 4');
      octaveCount = 4;
    }

    const scale: MidiNote[] = [];
    
    for (let octave = startOctave; octave < startOctave + octaveCount; octave++) {
      const octaveScale = generateModeScale(mode, keySignature, octave);
      
      if (octaveScale.length === 0) {
        console.warn(`generateExtendedModeScale: Empty scale for octave ${octave}`);
        continue;
      }
      
      // Filter out notes that would be duplicates from previous octaves
      const filteredScale = octaveScale.filter(note => !scale.includes(note) && note <= 127);
      scale.push(...filteredScale);
      
      // Stop if we've reached the MIDI limit
      if (scale.some(note => note >= 120)) break;
    }
    
    console.log(`🎼 Generated extended scale for ${mode.name} in ${keySignature.name} (${octaveCount} octaves):`, 
                scale.length, 'notes');
    
    return scale;
  } catch (error) {
    console.error('generateExtendedModeScale: Error generating extended scale:', error);
    return [];
  }
}