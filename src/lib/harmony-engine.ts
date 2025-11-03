/**
 * HARMONIC ENGINE SUITE - Complete Implementation
 * 
 * Comprehensive harmony generation system for all musical content:
 * - Themes & Bach Variables (CFF, CF)
 * - All Counterpoint types (Species 1-5, Advanced)
 * - All Fugue types (14 architectures)
 * - All Canon types (22 types)
 * 
 * Features:
 * - Automatic harmonic analysis
 * - User-controlled chord selection
 * - Multiple voicing styles (block, broken, arpeggiated)
 * - Variable density (3-7 note chords)
 * - Variable complexity (triads to altered extensions)
 * - Orchestral range enforcement
 * - Custom progressions
 * 
 * ============================================================================
 * CRITICAL: Uses -1 for rests (NOT 0 which is MIDI C-1)
 * Maintains melody/rhythm synchronization throughout pipeline
 * ============================================================================
 */

import { Theme, Mode, MidiNote, Rhythm, Part } from '../types/musical';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ChordQuality =
  | 'M'      // Major
  | 'm'      // Minor
  | 'dim'    // Diminished
  | 'aug'    // Augmented
  | 'sus2'   // Suspended 2nd
  | 'sus4'   // Suspended 4th
  | 'M7'     // Major 7th
  | 'm7'     // Minor 7th
  | 'dom7'   // Dominant 7th
  | 'dim7'   // Diminished 7th
  | 'hdim7'  // Half-diminished 7th
  | 'mM7'    // Minor-Major 7th
  | 'M9'     // Major 9th
  | 'm9'     // Minor 9th
  | 'dom9'   // Dominant 9th
  | 'M11'    // Major 11th
  | 'm11'    // Minor 11th
  | 'dom11'  // Dominant 11th
  | 'M13'    // Major 13th
  | 'm13'    // Minor 13th
  | 'dom13'  // Dominant 13th
  | '7#9'    // Dominant 7 sharp 9 (Hendrix chord)
  | '7b9'    // Dominant 7 flat 9
  | '7#5'    // Dominant 7 sharp 5
  | '7b5'    // Dominant 7 flat 5
  | '7#11'   // Lydian dominant
  | 'alt'    // Altered dominant (b9, #9, b5, #5)
  | 'add9'   // Add 9
  | '6'      // Major 6th
  | 'm6';    // Minor 6th

export type VoicingStyle =
  | 'block'           // All notes together
  | 'broken'          // Notes played in sequence (partial)
  | 'arpeggiated'     // Full arpeggio pattern
  | 'alberti'         // Alberti bass pattern
  | 'waltz'           // Waltz pattern (low-mid-mid)
  | 'rolling'         // Rolling pattern
  | 'stride'          // Stride piano pattern
  | 'tremolo'         // Tremolo (rapid alternation)
  | 'sustained'       // Long sustained chord
  | 'staccato';       // Short detached notes

// NEW: Voicing style variation types for each style
export type BrokenVariation = 'ascending' | 'descending' | 'outer-inner' | 'inner-outer' | 'bass-treble' | 'random';
export type ArpeggiatedVariation = 'up' | 'down' | 'up-down' | 'down-up' | 'random' | 'cascading';
export type AlbertiVariation = 'classic' | 'reversed' | 'expanded' | 'compressed';
export type WaltzVariation = 'classic' | 'reverse-bass' | 'double-bass' | 'syncopated';
export type RollingVariation = 'smooth' | 'cascading' | 'reverse' | 'alternating';
export type StrideVariation = 'classic' | 'modern' | 'boogie' | 'swing';
export type TremoloVariation = 'binary' | 'triple' | 'quad' | 'measured';
export type SustainedVariation = 'long' | 'medium' | 'short' | 'crescendo';
export type StaccatoVariation = 'crisp' | 'gentle' | 'rhythmic' | 'swing';

export type HarmonicDensity = 3 | 4 | 5 | 6 | 7;

export type HarmonicComplexity =
  | 'basic'      // Triads only (M, m, dim, aug)
  | 'seventh'    // Add 7th chords
  | 'ninth'      // Add 9th chords
  | 'eleventh'   // Add 11th chords
  | 'thirteenth' // Add 13th chords
  | 'extended'   // All extensions and alterations
  | 'altered';   // Altered dominants and complex extensions

export type KeyCenter = 
  | 'automatic'  // Detect from melody
  | 'major'      // Force major key
  | 'minor'      // Force minor key
  | 'modal';     // Use provided mode

export interface HarmonyParams {
  // User control
  quality?: ChordQuality;           // Explicit chord quality (null = auto)
  voicingStyle: VoicingStyle;       // How to play the chord
  density: HarmonicDensity;         // Number of notes (3-7)
  complexity: HarmonicComplexity;   // Chord complexity level
  keyCenter: KeyCenter;             // Key center preference
  keyCenterBias?: number;           // -1 (flat) to +1 (sharp) for key selection
  
  // NEW: Voicing style variations
  brokenVariation?: BrokenVariation;
  arpeggiatedVariation?: ArpeggiatedVariation;
  albertiVariation?: AlbertiVariation;
  waltzVariation?: WaltzVariation;
  rollingVariation?: RollingVariation;
  strideVariation?: StrideVariation;
  tremoloVariation?: TremoloVariation;
  sustainedVariation?: SustainedVariation;
  staccatoVariation?: StaccatoVariation;
  
  // Orchestral constraints
  lowestNote: MidiNote;             // Default: 40 (E2 - cello range)
  highestNote: MidiNote;            // Default: 84 (C6 - violin range)
  
  // Custom progression
  customProgression?: ChordQuality[]; // User-defined chord sequence
  
  // Mode awareness
  mode?: Mode;                      // For modal harmonization
  
  // Style preferences
  preferClosedVoicing?: boolean;    // Keep notes close together
  allowInversions?: boolean;        // Use chord inversions
  doublingPreference?: 'root' | 'third' | 'fifth' | 'balanced';
}

export interface HarmonicAnalysis {
  detectedKey: MidiNote;            // Root of detected key
  keyQuality: 'major' | 'minor';    // Major or minor key
  chordProgression: ChordQuality[]; // Suggested chord progression
  chordRoots: MidiNote[];           // Root note for each chord
  chordTimings: number[];           // Beat positions for each chord change
  confidence: number;               // 0-1 confidence in analysis
}

export interface HarmonizedPart extends Part {
  originalMelody: Theme;            // Original unharmonized melody
  harmonyNotes: Theme[];            // Array of harmony note arrays
  harmonyRhythm: Rhythm;            // Rhythm for harmony (synchronized)
  chordLabels: string[];            // Chord names for display
  analysis: HarmonicAnalysis;       // Analysis data
}

// ============================================================================
// ORCHESTRAL RANGE CONSTANTS
// ============================================================================

const ORCHESTRAL_RANGES = {
  violin: { lowest: 55, highest: 103 },    // G3 to G6
  viola: { lowest: 48, highest: 84 },      // C3 to C6
  cello: { lowest: 36, highest: 72 },      // C2 to C5
  bass: { lowest: 28, highest: 55 },       // E1 to G3
  full: { lowest: 28, highest: 103 }       // Full orchestral strings range
};

// Default to full string section range
const DEFAULT_LOWEST = ORCHESTRAL_RANGES.cello.lowest;  // 36 (C2)
const DEFAULT_HIGHEST = ORCHESTRAL_RANGES.violin.highest; // 103 (G6)

// ============================================================================
// CHORD INTERVAL DEFINITIONS
// ============================================================================

/**
 * Interval patterns for all chord qualities
 * Intervals are in semitones from root
 */
const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  // Basic Triads
  'M': [0, 4, 7],                      // Major: R, M3, P5
  'm': [0, 3, 7],                      // Minor: R, m3, P5
  'dim': [0, 3, 6],                    // Diminished: R, m3, d5
  'aug': [0, 4, 8],                    // Augmented: R, M3, A5
  'sus2': [0, 2, 7],                   // Sus2: R, M2, P5
  'sus4': [0, 5, 7],                   // Sus4: R, P4, P5
  
  // Seventh Chords
  'M7': [0, 4, 7, 11],                 // Major 7th
  'm7': [0, 3, 7, 10],                 // Minor 7th
  'dom7': [0, 4, 7, 10],               // Dominant 7th
  'dim7': [0, 3, 6, 9],                // Diminished 7th
  'hdim7': [0, 3, 6, 10],              // Half-diminished 7th
  'mM7': [0, 3, 7, 11],                // Minor-Major 7th
  
  // Ninth Chords
  'M9': [0, 4, 7, 11, 14],             // Major 9th
  'm9': [0, 3, 7, 10, 14],             // Minor 9th
  'dom9': [0, 4, 7, 10, 14],           // Dominant 9th
  
  // Eleventh Chords
  'M11': [0, 4, 7, 11, 14, 17],        // Major 11th
  'm11': [0, 3, 7, 10, 14, 17],        // Minor 11th
  'dom11': [0, 4, 7, 10, 14, 17],      // Dominant 11th
  
  // Thirteenth Chords
  'M13': [0, 4, 7, 11, 14, 17, 21],    // Major 13th
  'm13': [0, 3, 7, 10, 14, 17, 21],    // Minor 13th
  'dom13': [0, 4, 7, 10, 14, 17, 21],  // Dominant 13th
  
  // Altered/Extended Chords
  '7#9': [0, 4, 7, 10, 15],            // Hendrix chord (b10 = #9)
  '7b9': [0, 4, 7, 10, 13],            // Dom7 flat 9
  '7#5': [0, 4, 8, 10],                // Dom7 sharp 5
  '7b5': [0, 4, 6, 10],                // Dom7 flat 5
  '7#11': [0, 4, 7, 10, 18],           // Lydian dominant
  'alt': [0, 4, 6, 10, 13, 15],        // Altered (b5, b9, #9)
  'add9': [0, 4, 7, 14],               // Major add 9
  '6': [0, 4, 7, 9],                   // Major 6th
  'm6': [0, 3, 7, 9]                   // Minor 6th
};

// ============================================================================
// HARMONIC ANALYSIS ENGINE
// ============================================================================

export class HarmonyEngine {
  
  /**
   * Analyze melody to detect key and suggest chord progression
   */
  static analyzeMelody(
    melody: Theme,
    rhythm: Rhythm,
    params: HarmonyParams
  ): HarmonicAnalysis {
    console.log('🎵 [HarmonyEngine] Analyzing melody for harmonization...');
    
    // Filter out rests (-1 values)
    const notes = melody.filter(note => note !== -1);
    
    if (notes.length === 0) {
      console.warn('⚠️ [HarmonyEngine] No notes to analyze (all rests)');
      return this.getDefaultAnalysis();
    }
    
    // Detect key center
    const detectedKey = this.detectKeyCenter(notes, params);
    const keyQuality = this.detectKeyQuality(notes, detectedKey, params);
    
    // Generate chord progression based on melody
    const { chordProgression, chordRoots, chordTimings } = 
      this.generateChordProgression(melody, rhythm, detectedKey, keyQuality, params);
    
    // Calculate confidence based on note analysis
    const confidence = this.calculateConfidence(notes, detectedKey, keyQuality);
    
    console.log(`✅ [HarmonyEngine] Detected key: ${detectedKey} ${keyQuality}`);
    console.log(`   Chord progression: ${chordProgression.join(' → ')}`);
    
    return {
      detectedKey,
      keyQuality,
      chordProgression,
      chordRoots,
      chordTimings,
      confidence
    };
  }
  
  /**
   * Detect the key center from melody notes
   */
  private static detectKeyCenter(notes: MidiNote[], params: HarmonyParams): MidiNote {
    // Force key based on params
    if (params.keyCenter === 'major' || params.keyCenter === 'minor') {
      // Find most common note and use as tonic
      const pitchClasses = notes.map(n => n % 12);
      const histogram = new Array(12).fill(0);
      pitchClasses.forEach(pc => histogram[pc]++);
      const tonic = histogram.indexOf(Math.max(...histogram));
      return 60 + tonic; // C4 octave + tonic pitch class
    }
    
    // Use mode if provided
    if (params.mode) {
      return 60 + params.mode.final; // Use mode's final (tonic)
    }
    
    // Automatic detection: find most common pitch class
    const pitchClasses = notes.map(n => n % 12);
    const histogram = new Array(12).fill(0);
    
    // Weight by duration if possible
    pitchClasses.forEach(pc => histogram[pc]++);
    
    // Apply key center bias if specified
    if (params.keyCenterBias) {
      // Bias toward flat keys (negative) or sharp keys (positive)
      const flatKeys = [5, 10, 3, 8, 1, 6]; // F, Bb, Eb, Ab, Db, Gb
      const sharpKeys = [7, 2, 9, 4, 11, 6]; // G, D, A, E, B, F#
      
      if (params.keyCenterBias < 0) {
        flatKeys.forEach(pc => histogram[pc] *= (1 + Math.abs(params.keyCenterBias!)));
      } else {
        sharpKeys.forEach(pc => histogram[pc] *= (1 + params.keyCenterBias!));
      }
    }
    
    const tonic = histogram.indexOf(Math.max(...histogram));
    return 60 + tonic; // Middle C octave + tonic
  }
  
  /**
   * Detect if key is major or minor
   */
  private static detectKeyQuality(
    notes: MidiNote[],
    tonic: MidiNote,
    params: HarmonyParams
  ): 'major' | 'minor' {
    // Force quality if specified
    if (params.keyCenter === 'major') return 'major';
    if (params.keyCenter === 'minor') return 'minor';
    
    // Detect based on presence of major vs minor third
    const tonicPC = tonic % 12;
    const pitchClasses = notes.map(n => n % 12);
    
    const majorThird = (tonicPC + 4) % 12;
    const minorThird = (tonicPC + 3) % 12;
    
    const hasMajorThird = pitchClasses.includes(majorThird);
    const hasMinorThird = pitchClasses.includes(minorThird);
    
    if (hasMajorThird && !hasMinorThird) return 'major';
    if (hasMinorThird && !hasMajorThird) return 'minor';
    
    // Both or neither: count occurrences
    const majorCount = pitchClasses.filter(pc => pc === majorThird).length;
    const minorCount = pitchClasses.filter(pc => pc === minorThird).length;
    
    return majorCount >= minorCount ? 'major' : 'minor';
  }
  
  /**
   * Generate chord progression from melody
   */
  private static generateChordProgression(
    melody: Theme,
    rhythm: Rhythm,
    tonic: MidiNote,
    quality: 'major' | 'minor',
    params: HarmonyParams
  ): {
    chordProgression: ChordQuality[];
    chordRoots: MidiNote[];
    chordTimings: number[];
  } {
    // Use custom progression if provided
    if (params.customProgression && params.customProgression.length > 0) {
      return this.applyCustomProgression(melody, rhythm, tonic, params.customProgression);
    }
    
    // Generate progression based on melody analysis
    const chordProgression: ChordQuality[] = [];
    const chordRoots: MidiNote[] = [];
    const chordTimings: number[] = [];
    
    let currentBeat = 0;
    let chordDuration = 0;
    
    // Analyze melody in chunks (typically every 2-4 beats)
    const chunkSize = 4; // Change chord every 4 beats by default
    
    for (let i = 0; i < melody.length; i += chunkSize) {
      const chunk = melody.slice(i, i + chunkSize).filter(n => n !== -1);
      
      if (chunk.length === 0) {
        currentBeat += chunkSize;
        continue;
      }
      
      // Find predominant note in chunk
      const predominantNote = this.findPredominantNote(chunk);
      const chordRoot = this.findBestChordRoot(predominantNote, tonic, quality);
      const chordQuality = this.selectChordQuality(chordRoot, tonic, quality, params);
      
      chordProgression.push(chordQuality);
      chordRoots.push(chordRoot);
      chordTimings.push(currentBeat);
      
      currentBeat += chunkSize;
      chordDuration += chunkSize;
    }
    
    return { chordProgression, chordRoots, chordTimings };
  }
  
  /**
   * Apply custom chord progression
   */
  private static applyCustomProgression(
    melody: Theme,
    rhythm: Rhythm,
    tonic: MidiNote,
    customProgression: ChordQuality[]
  ): {
    chordProgression: ChordQuality[];
    chordRoots: MidiNote[];
    chordTimings: number[];
  } {
    const chordProgression = [...customProgression];
    const chordRoots: MidiNote[] = [];
    const chordTimings: number[] = [];
    
    const beatsPerChord = Math.floor(melody.length / customProgression.length);
    
    // Distribute chords evenly across melody
    for (let i = 0; i < customProgression.length; i++) {
      const timing = i * beatsPerChord;
      chordTimings.push(timing);
      
      // Determine chord root (typically based on scale degrees)
      // For now, use tonic as base and adjust based on progression
      const root = this.getChordRootForProgression(tonic, i, customProgression.length);
      chordRoots.push(root);
    }
    
    return { chordProgression, chordRoots, chordTimings };
  }
  
  /**
   * Find predominant note in a chunk of melody
   */
  private static findPredominantNote(notes: MidiNote[]): MidiNote {
    if (notes.length === 0) return 60; // Default to C4
    
    const histogram = new Map<MidiNote, number>();
    notes.forEach(note => {
      histogram.set(note, (histogram.get(note) || 0) + 1);
    });
    
    let maxCount = 0;
    let predominant = notes[0];
    
    histogram.forEach((count, note) => {
      if (count > maxCount) {
        maxCount = count;
        predominant = note;
      }
    });
    
    return predominant;
  }
  
  /**
   * Find best chord root for a melody note
   */
  private static findBestChordRoot(
    melodyNote: MidiNote,
    tonic: MidiNote,
    quality: 'major' | 'minor'
  ): MidiNote {
    const melodyPC = melodyNote % 12;
    const tonicPC = tonic % 12;
    
    // Calculate scale degree
    const interval = (melodyPC - tonicPC + 12) % 12;
    
    // Common chord roots based on scale degree
    const majorChordRoots = [
      tonicPC,           // I (tonic)
      (tonicPC + 5) % 12, // IV (subdominant)
      (tonicPC + 7) % 12, // V (dominant)
      (tonicPC + 2) % 12, // ii
      (tonicPC + 9) % 12  // vi
    ];
    
    const minorChordRoots = [
      tonicPC,           // i (tonic)
      (tonicPC + 5) % 12, // iv (subdominant)
      (tonicPC + 7) % 12, // V (dominant)
      (tonicPC + 10) % 12, // VII
      (tonicPC + 3) % 12  // III
    ];
    
    const chordRoots = quality === 'major' ? majorChordRoots : minorChordRoots;
    
    // Find chord root that contains the melody note
    for (const root of chordRoots) {
      const chordTones = [(root) % 12, (root + 4) % 12, (root + 7) % 12];
      if (chordTones.includes(melodyPC)) {
        return 48 + root; // Return in 3rd octave (C3)
      }
    }
    
    // Default to tonic
    return tonic;
  }
  
  /**
   * Select chord quality based on context
   */
  private static selectChordQuality(
    chordRoot: MidiNote,
    tonic: MidiNote,
    keyQuality: 'major' | 'minor',
    params: HarmonyParams
  ): ChordQuality {
    // Use explicit quality if provided
    if (params.quality) {
      return params.quality;
    }
    
    // Select based on complexity level
    const rootPC = chordRoot % 12;
    const tonicPC = tonic % 12;
    const degree = (rootPC - tonicPC + 12) % 12;
    
    // Map scale degrees to qualities based on complexity
    switch (params.complexity) {
      case 'basic':
        return this.getBasicQuality(degree, keyQuality);
      
      case 'seventh':
        return this.getSeventhQuality(degree, keyQuality);
      
      case 'ninth':
        return this.getNinthQuality(degree, keyQuality);
      
      case 'eleventh':
        return this.getEleventhQuality(degree, keyQuality);
      
      case 'thirteenth':
        return this.getThirteenthQuality(degree, keyQuality);
      
      case 'extended':
      case 'altered':
        return this.getExtendedQuality(degree, keyQuality, params.complexity === 'altered');
      
      default:
        return keyQuality === 'major' ? 'M' : 'm';
    }
  }
  
  /**
   * Get basic triad quality
   */
  private static getBasicQuality(degree: number, keyQuality: 'major' | 'minor'): ChordQuality {
    if (keyQuality === 'major') {
      // Major key: I, ii, iii, IV, V, vi, vii°
      if (degree === 0) return 'M';     // I
      if (degree === 2) return 'm';     // ii
      if (degree === 4) return 'm';     // iii
      if (degree === 5) return 'M';     // IV
      if (degree === 7) return 'M';     // V
      if (degree === 9) return 'm';     // vi
      if (degree === 11) return 'dim';  // vii°
    } else {
      // Minor key: i, ii°, III, iv, v, VI, VII
      if (degree === 0) return 'm';     // i
      if (degree === 2) return 'dim';   // ii°
      if (degree === 3) return 'M';     // III
      if (degree === 5) return 'm';     // iv
      if (degree === 7) return 'm';     // v
      if (degree === 8) return 'M';     // VI
      if (degree === 10) return 'M';    // VII
    }
    
    return keyQuality === 'major' ? 'M' : 'm';
  }
  
  /**
   * Get seventh chord quality
   */
  private static getSeventhQuality(degree: number, keyQuality: 'major' | 'minor'): ChordQuality {
    if (keyQuality === 'major') {
      if (degree === 0) return 'M7';    // IM7
      if (degree === 2) return 'm7';    // iim7
      if (degree === 4) return 'm7';    // iiim7
      if (degree === 5) return 'M7';    // IVM7
      if (degree === 7) return 'dom7';  // V7
      if (degree === 9) return 'm7';    // vim7
      if (degree === 11) return 'hdim7'; // viiø7
    } else {
      if (degree === 0) return 'm7';    // im7
      if (degree === 2) return 'hdim7'; // iiø7
      if (degree === 3) return 'M7';    // IIIM7
      if (degree === 5) return 'm7';    // ivm7
      if (degree === 7) return 'dom7';  // V7
      if (degree === 8) return 'M7';    // VIM7
      if (degree === 10) return 'dom7'; // VII7
    }
    
    return 'M7';
  }
  
  /**
   * Get ninth chord quality
   */
  private static getNinthQuality(degree: number, keyQuality: 'major' | 'minor'): ChordQuality {
    if (keyQuality === 'major') {
      if (degree === 0) return 'M9';    // IM9
      if (degree === 7) return 'dom9';  // V9
    }
    return 'M9';
  }
  
  /**
   * Get eleventh chord quality
   */
  private static getEleventhQuality(degree: number, keyQuality: 'major' | 'minor'): ChordQuality {
    if (degree === 0) return 'M11';
    if (degree === 7) return 'dom11';
    return 'M11';
  }
  
  /**
   * Get thirteenth chord quality
   */
  private static getThirteenthQuality(degree: number, keyQuality: 'major' | 'minor'): ChordQuality {
    if (degree === 0) return 'M13';
    if (degree === 7) return 'dom13';
    return 'M13';
  }
  
  /**
   * Get extended/altered chord quality
   */
  private static getExtendedQuality(
    degree: number,
    keyQuality: 'major' | 'minor',
    useAltered: boolean
  ): ChordQuality {
    // Dominant chords get altered
    if (degree === 7 && useAltered) {
      const alterations: ChordQuality[] = ['7#9', '7b9', '7#5', '7b5', '7#11', 'alt'];
      return alterations[Math.floor(Math.random() * alterations.length)];
    }
    
    // Otherwise use extended chords
    if (degree === 0) return 'M13';
    if (degree === 7) return 'dom13';
    
    return 'M13';
  }
  
  /**
   * Calculate confidence in analysis
   */
  private static calculateConfidence(
    notes: MidiNote[],
    tonic: MidiNote,
    quality: 'major' | 'minor'
  ): number {
    const tonicPC = tonic % 12;
    const pitchClasses = notes.map(n => n % 12);
    
    // Check if notes fit the key
    const scale = quality === 'major' 
      ? [0, 2, 4, 5, 7, 9, 11].map(i => (tonicPC + i) % 12)
      : [0, 2, 3, 5, 7, 8, 10].map(i => (tonicPC + i) % 12);
    
    const inScaleNotes = pitchClasses.filter(pc => scale.includes(pc)).length;
    const confidence = inScaleNotes / pitchClasses.length;
    
    return Math.min(1, Math.max(0, confidence));
  }
  
  /**
   * Get chord root for progression position
   */
  private static getChordRootForProgression(
    tonic: MidiNote,
    position: number,
    totalChords: number
  ): MidiNote {
    const tonicPC = tonic % 12;
    
    // Common progressions based on position
    // I - IV - V - I pattern
    const degrees = [0, 5, 7, 0]; // I, IV, V, I
    const degreeIndex = position % degrees.length;
    
    return 48 + ((tonicPC + degrees[degreeIndex]) % 12);
  }
  
  /**
   * Get default analysis when melody is empty
   */
  private static getDefaultAnalysis(): HarmonicAnalysis {
    return {
      detectedKey: 60, // C4
      keyQuality: 'major',
      chordProgression: ['M'],
      chordRoots: [60],
      chordTimings: [0],
      confidence: 0
    };
  }
  
  // ============================================================================
  // CHORD GENERATION ENGINE
  // ============================================================================
  
  /**
   * Harmonize a melody with chords
   * This is the main entry point for harmonization
   */
  static harmonize(
    melody: Theme,
    rhythm: Rhythm,
    params: HarmonyParams
  ): HarmonizedPart {
    console.log('🎼 [HarmonyEngine] Harmonizing melody...');
    console.log(`   Melody length: ${melody.length} notes`);
    console.log(`   Rhythm length: ${rhythm.length} beats`);
    console.log(`   Voicing style: ${params.voicingStyle}`);
    console.log(`   Density: ${params.density} notes`);
    console.log(`   Complexity: ${params.complexity}`);
    
    // Analyze melody
    const analysis = this.analyzeMelody(melody, rhythm, params);
    
    // Generate harmonized notes
    const { harmonyNotes, harmonyRhythm, chordLabels } = 
      this.generateHarmony(melody, rhythm, analysis, params);
    
    console.log(`✅ [HarmonyEngine] Generated ${harmonyNotes.length} harmony parts`);
    
    return {
      melody,
      rhythm,
      originalMelody: melody,
      harmonyNotes,
      harmonyRhythm,
      chordLabels,
      analysis
    };
  }
  
  /**
   * Generate harmony notes based on analysis
   */
  private static generateHarmony(
    melody: Theme,
    rhythm: Rhythm,
    analysis: HarmonicAnalysis,
    params: HarmonyParams
  ): {
    harmonyNotes: Theme[];
    harmonyRhythm: Rhythm;
    chordLabels: string[];
  } {
    const harmonyNotes: Theme[] = [];
    const harmonyRhythm: Rhythm = [];
    const chordLabels: string[] = [];
    
    let currentChordIndex = 0;
    let currentBeat = 0;
    
    // Generate harmony for each melody note
    for (let i = 0; i < melody.length; i++) {
      const melodyNote = melody[i];
      const rhythmValue = rhythm[i] || 1;
      
      // Check if we need to change chord
      if (currentChordIndex < analysis.chordTimings.length - 1) {
        if (currentBeat >= analysis.chordTimings[currentChordIndex + 1]) {
          currentChordIndex++;
        }
      }
      
      // Handle rests in melody
      if (melodyNote === -1) {
        // Add rest to harmony too
        harmonyNotes.push([-1]);
        harmonyRhythm.push(rhythmValue);
        currentBeat += rhythmValue;
        continue;
      }
      
      // Get current chord
      const chordQuality = analysis.chordProgression[currentChordIndex];
      const chordRoot = analysis.chordRoots[currentChordIndex];
      
      // Generate chord voicing (raw chord notes)
      const rawChordNotes = this.generateChordVoicing(
        chordRoot,
        chordQuality,
        melodyNote,
        params
      );
      
      // CRITICAL: Apply voicing style pattern to transform the chord
      // This creates the actual pattern that will be played (e.g., arpeggiated, broken, etc.)
      const voicingPattern = this.applyVoicingPattern(rawChordNotes, rhythmValue, params);
      
      // Store the PATTERN (not the raw chord) - this is what gets played
      // For block chords, voicingPattern will be a single array with all notes
      // For other styles, it will be multiple arrays representing the pattern
      voicingPattern.forEach((patternChunk, chunkIndex) => {
        harmonyNotes.push(patternChunk);
        
        // Distribute rhythm across pattern chunks
        const chunkRhythm = rhythmValue / voicingPattern.length;
        harmonyRhythm.push(chunkRhythm);
        
        // Repeat chord label for each chunk in the pattern
        if (chunkIndex === 0) {
          // Generate chord label
          const label = this.generateChordLabel(chordRoot, chordQuality);
          chordLabels.push(label);
        }
      });
      
      currentBeat += rhythmValue;
    }
    
    console.log(`   Generated harmony for ${harmonyNotes.length} positions`);
    
    return { harmonyNotes, harmonyRhythm, chordLabels };
  }
  
  /**
   * Generate chord voicing
   */
  private static generateChordVoicing(
    root: MidiNote,
    quality: ChordQuality,
    melodyNote: MidiNote,
    params: HarmonyParams
  ): Theme {
    // Get chord intervals
    const intervals = CHORD_INTERVALS[quality] || CHORD_INTERVALS['M'];
    
    // Build chord notes
    let chordNotes: MidiNote[] = intervals.map(interval => root + interval);
    
    // Adjust for density (limit number of notes)
    if (chordNotes.length > params.density) {
      chordNotes = this.selectChordNotes(chordNotes, params.density, params);
    } else if (chordNotes.length < params.density) {
      chordNotes = this.expandChordNotes(chordNotes, params.density, params);
    }
    
    // Voice within orchestral range
    chordNotes = this.voiceWithinRange(
      chordNotes,
      melodyNote,
      params.lowestNote || DEFAULT_LOWEST,
      params.highestNote || DEFAULT_HIGHEST,
      params
    );
    
    // Apply voicing style transformations
    chordNotes = this.applyVoicingStyle(chordNotes, params.voicingStyle);
    
    return chordNotes;
  }
  
  /**
   * Select subset of chord notes for lower density
   */
  private static selectChordNotes(
    notes: MidiNote[],
    targetDensity: number,
    params: HarmonyParams
  ): MidiNote[] {
    // Always keep root
    const selected: MidiNote[] = [notes[0]];
    
    // Add most important notes based on doubling preference
    if (targetDensity >= 2) {
      // Add fifth for stability
      if (notes.length >= 3) selected.push(notes[2]);
    }
    
    if (targetDensity >= 3) {
      // Add third for color
      if (notes.length >= 2) selected.push(notes[1]);
    }
    
    // Add remaining notes from highest extensions
    for (let i = notes.length - 1; i >= 0 && selected.length < targetDensity; i--) {
      if (!selected.includes(notes[i])) {
        selected.push(notes[i]);
      }
    }
    
    return selected.sort((a, b) => a - b);
  }
  
  /**
   * Expand chord notes for higher density (doubling)
   */
  private static expandChordNotes(
    notes: MidiNote[],
    targetDensity: number,
    params: HarmonyParams
  ): MidiNote[] {
    const expanded = [...notes];
    
    while (expanded.length < targetDensity) {
      // Double based on preference
      if (params.doublingPreference === 'root') {
        expanded.push(notes[0] + 12); // Octave up
      } else if (params.doublingPreference === 'third' && notes.length >= 2) {
        expanded.push(notes[1] + 12);
      } else if (params.doublingPreference === 'fifth' && notes.length >= 3) {
        expanded.push(notes[2] + 12);
      } else {
        // Balanced: double each note in turn
        const index = (expanded.length - notes.length) % notes.length;
        expanded.push(notes[index] + 12);
      }
    }
    
    return expanded.sort((a, b) => a - b);
  }
  
  /**
   * Voice chord within orchestral range
   */
  private static voiceWithinRange(
    notes: MidiNote[],
    melodyNote: MidiNote,
    lowest: MidiNote,
    highest: MidiNote,
    params: HarmonyParams
  ): MidiNote[] {
    let voiced = [...notes];
    
    // Transpose to appropriate octave
    while (voiced.some(n => n < lowest)) {
      voiced = voiced.map(n => n < lowest ? n + 12 : n);
    }
    
    while (voiced.some(n => n > highest)) {
      voiced = voiced.map(n => n > highest ? n - 12 : n);
    }
    
    // Remove any notes still out of range
    voiced = voiced.filter(n => n >= lowest && n <= highest);
    
    // Ensure we have at least one note
    if (voiced.length === 0) {
      // Use root in middle of range
      const middleOctave = Math.floor((lowest + highest) / 24) * 12;
      voiced = [middleOctave + (notes[0] % 12)];
    }
    
    // Apply closed/open voicing
    if (params.preferClosedVoicing) {
      voiced = this.applyClosedVoicing(voiced, melodyNote);
    }
    
    // Keep below melody note
    voiced = voiced.filter(n => n < melodyNote || n === melodyNote);
    
    return voiced.sort((a, b) => a - b);
  }
  
  /**
   * Apply closed voicing (notes close together)
   */
  private static applyClosedVoicing(notes: MidiNote[], melodyNote: MidiNote): MidiNote[] {
    if (notes.length <= 1) return notes;
    
    // Find best octave for compact voicing
    const root = notes[0] % 12;
    const targetOctave = Math.floor(melodyNote / 12) - 1;
    const baseNote = targetOctave * 12 + root;
    
    // Voice all notes within one octave
    const closed = notes.map(note => {
      const pc = note % 12;
      let voiced = baseNote + pc;
      if (voiced < baseNote) voiced += 12;
      if (voiced >= baseNote + 12) voiced -= 12;
      return voiced;
    });
    
    return closed.sort((a, b) => a - b);
  }
  
  /**
   * Apply voicing style transformations
   */
  private static applyVoicingStyle(notes: MidiNote[], style: VoicingStyle): MidiNote[] {
    // For block chords, return as-is
    // For other styles, the rhythm generation will handle the articulation
    return notes;
  }
  
  /**
   * Generate rhythm for voicing style
   */
  private static generateVoicingRhythm(
    duration: number,
    style: VoicingStyle,
    numNotes: number
  ): Rhythm {
    // This returns a single rhythm value
    // The voicing style affects how notes are played (handled in playback)
    return [duration];
  }
  
  /**
   * Generate chord label for display
   * PUBLIC: Exported for use in HarmonyChordEditor
   */
  static generateChordLabel(root: MidiNote, quality: ChordQuality): string {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootPC = root % 12;
    const rootName = noteNames[rootPC];
    
    // Simplify quality names for display
    const qualityLabels: Record<ChordQuality, string> = {
      'M': '',
      'm': 'm',
      'dim': 'dim',
      'aug': 'aug',
      'sus2': 'sus2',
      'sus4': 'sus4',
      'M7': 'maj7',
      'm7': 'm7',
      'dom7': '7',
      'dim7': 'dim7',
      'hdim7': 'ø7',
      'mM7': 'mM7',
      'M9': 'maj9',
      'm9': 'm9',
      'dom9': '9',
      'M11': 'maj11',
      'm11': 'm11',
      'dom11': '11',
      'M13': 'maj13',
      'm13': 'm13',
      'dom13': '13',
      '7#9': '7#9',
      '7b9': '7b9',
      '7#5': '7#5',
      '7b5': '7b5',
      '7#11': '7#11',
      'alt': 'alt',
      'add9': 'add9',
      '6': '6',
      'm6': 'm6'
    };
    
    return rootName + qualityLabels[quality];
  }
  
  // ============================================================================
  // VOICING PATTERN GENERATORS
  // ============================================================================
  
  /**
   * Generate arpeggiated pattern
   */
  static generateArpeggio(
    chordNotes: MidiNote[],
    duration: number,
    direction: 'up' | 'down' | 'updown' = 'up'
  ): { notes: Theme; rhythm: Rhythm } {
    const notes: Theme = [];
    const rhythm: Rhythm = [];
    
    const noteCount = chordNotes.length;
    const noteDuration = duration / noteCount;
    
    if (direction === 'up') {
      chordNotes.forEach(note => {
        notes.push(note);
        rhythm.push(noteDuration);
      });
    } else if (direction === 'down') {
      [...chordNotes].reverse().forEach(note => {
        notes.push(note);
        rhythm.push(noteDuration);
      });
    } else {
      // Up and down
      chordNotes.forEach(note => {
        notes.push(note);
        rhythm.push(noteDuration / 2);
      });
      [...chordNotes].reverse().forEach(note => {
        notes.push(note);
        rhythm.push(noteDuration / 2);
      });
    }
    
    return { notes, rhythm };
  }
  
  /**
   * Generate Alberti bass pattern
   */
  static generateAlbertiBass(
    chordNotes: MidiNote[],
    duration: number
  ): { notes: Theme; rhythm: Rhythm } {
    if (chordNotes.length < 3) {
      return this.generateArpeggio(chordNotes, duration);
    }
    
    // Pattern: low - high - middle - high
    const pattern = [
      chordNotes[0],
      chordNotes[2],
      chordNotes[1],
      chordNotes[2]
    ];
    
    const noteDuration = duration / 4;
    const rhythm = new Array(4).fill(noteDuration);
    
    return { notes: pattern, rhythm };
  }
  
  /**
   * Generate waltz pattern
   */
  static generateWaltzPattern(
    chordNotes: MidiNote[],
    duration: number
  ): { notes: Theme; rhythm: Rhythm } {
    if (chordNotes.length < 3) {
      return this.generateArpeggio(chordNotes, duration);
    }
    
    // Pattern: bass - chord - chord (3/4 time)
    const pattern = [
      chordNotes[0],           // Bass on 1
      chordNotes[1],           // Chord on 2
      chordNotes[2]            // Chord on 3
    ];
    
    const beatDuration = duration / 3;
    const rhythm = [beatDuration, beatDuration, beatDuration];
    
    return { notes: pattern, rhythm };
  }
  
  // ============================================================================
  // COMPREHENSIVE VOICING PATTERN GENERATORS WITH VARIATIONS
  // ============================================================================
  
  /**
   * Apply voicing style pattern to chord notes
   * This transforms the raw chord into the actual pattern to be played
   */
  static applyVoicingPattern(
    chordNotes: MidiNote[],
    duration: number,
    params: HarmonyParams
  ): Theme[] {
    console.log(`🎨 [HarmonyEngine] Applying voicing pattern: ${params.voicingStyle}`);
    
    switch (params.voicingStyle) {
      case 'block':
        // All notes together - return as single chord
        return [chordNotes];
      
      case 'broken':
        return this.generateBrokenPattern(chordNotes, params.brokenVariation || 'ascending');
      
      case 'arpeggiated':
        return this.generateArpeggiatedPattern(chordNotes, params.arpeggiatedVariation || 'up');
      
      case 'alberti':
        return this.generateAlbertiPattern(chordNotes, params.albertiVariation || 'classic');
      
      case 'waltz':
        return this.generateWaltzVariation(chordNotes, params.waltzVariation || 'classic');
      
      case 'rolling':
        return this.generateRollingPattern(chordNotes, params.rollingVariation || 'smooth');
      
      case 'stride':
        return this.generateStridePattern(chordNotes, params.strideVariation || 'classic');
      
      case 'tremolo':
        return this.generateTremoloPattern(chordNotes, params.tremoloVariation || 'binary');
      
      case 'sustained':
        return this.generateSustainedPattern(chordNotes, params.sustainedVariation || 'long');
      
      case 'staccato':
        return this.generateStaccatoPattern(chordNotes, params.staccatoVariation || 'crisp');
      
      default:
        return [chordNotes];
    }
  }
  
  /**
   * BROKEN CHORD VARIATIONS
   * Play different partial sequences of the chord
   */
  private static generateBrokenPattern(chordNotes: MidiNote[], variation: BrokenVariation): Theme[] {
    if (chordNotes.length < 2) return [chordNotes];
    
    switch (variation) {
      case 'ascending':
        // Play notes from bottom to top sequentially
        return chordNotes.map(note => [note]);
      
      case 'descending':
        // Play notes from top to bottom
        return [...chordNotes].reverse().map(note => [note]);
      
      case 'outer-inner':
        // Play outer notes first, then inner notes
        const outerInner: Theme[] = [];
        outerInner.push([chordNotes[0]]); // Bass
        outerInner.push([chordNotes[chordNotes.length - 1]]); // Top
        for (let i = 1; i < chordNotes.length - 1; i++) {
          outerInner.push([chordNotes[i]]);
        }
        return outerInner;
      
      case 'inner-outer':
        // Play inner notes first, then outer notes
        const innerOuter: Theme[] = [];
        for (let i = 1; i < chordNotes.length - 1; i++) {
          innerOuter.push([chordNotes[i]]);
        }
        innerOuter.push([chordNotes[0]]); // Bass
        innerOuter.push([chordNotes[chordNotes.length - 1]]); // Top
        return innerOuter;
      
      case 'bass-treble':
        // Alternate between bass and treble notes
        const bassTreble: Theme[] = [];
        for (let i = 0; i < chordNotes.length; i += 2) {
          bassTreble.push([chordNotes[i]]);
        }
        for (let i = 1; i < chordNotes.length; i += 2) {
          bassTreble.push([chordNotes[i]]);
        }
        return bassTreble;
      
      case 'random':
        // Random order (shuffle)
        const shuffled = [...chordNotes];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.map(note => [note]);
      
      default:
        return chordNotes.map(note => [note]);
    }
  }
  
  /**
   * ARPEGGIATED VARIATIONS
   * Full arpeggio patterns with different sequences
   */
  private static generateArpeggiatedPattern(chordNotes: MidiNote[], variation: ArpeggiatedVariation): Theme[] {
    if (chordNotes.length < 2) return [chordNotes];
    
    switch (variation) {
      case 'up':
        return chordNotes.map(note => [note]);
      
      case 'down':
        return [...chordNotes].reverse().map(note => [note]);
      
      case 'up-down':
        const upDown = [...chordNotes];
        return [...upDown, ...[...upDown].reverse().slice(1, -1)].map(note => [note]);
      
      case 'down-up':
        const downUp = [...chordNotes].reverse();
        return [...downUp, ...[...downUp].reverse().slice(1, -1)].map(note => [note]);
      
      case 'random':
        const pattern: Theme[] = [];
        for (let i = 0; i < chordNotes.length * 2; i++) {
          const randomNote = chordNotes[Math.floor(Math.random() * chordNotes.length)];
          pattern.push([randomNote]);
        }
        return pattern;
      
      case 'cascading':
        // Build up the chord note by note
        const cascading: Theme[] = [];
        for (let i = 0; i < chordNotes.length; i++) {
          cascading.push(chordNotes.slice(0, i + 1));
        }
        return cascading;
      
      default:
        return chordNotes.map(note => [note]);
    }
  }
  
  /**
   * ALBERTI BASS VARIATIONS
   * Classic keyboard accompaniment patterns
   */
  private static generateAlbertiPattern(chordNotes: MidiNote[], variation: AlbertiVariation): Theme[] {
    if (chordNotes.length < 3) return [chordNotes];
    
    const low = chordNotes[0];
    const mid = chordNotes[Math.floor(chordNotes.length / 2)];
    const high = chordNotes[chordNotes.length - 1];
    
    switch (variation) {
      case 'classic':
        // Low - High - Mid - High
        return [[low], [high], [mid], [high]];
      
      case 'reversed':
        // High - Low - Mid - Low
        return [[high], [low], [mid], [low]];
      
      case 'expanded':
        // Low - Mid - High - Mid - Low - High
        return [[low], [mid], [high], [mid], [low], [high]];
      
      case 'compressed':
        // Low - High - Low - High (omit middle)
        return [[low], [high], [low], [high]];
      
      default:
        return [[low], [high], [mid], [high]];
    }
  }
  
  /**
   * WALTZ PATTERN VARIATIONS
   * 3/4 time patterns
   */
  private static generateWaltzVariation(chordNotes: MidiNote[], variation: WaltzVariation): Theme[] {
    if (chordNotes.length < 2) return [chordNotes];
    
    const bass = chordNotes[0];
    const chord = chordNotes.slice(1);
    
    switch (variation) {
      case 'classic':
        // Bass - chord - chord
        return [[bass], chord, chord];
      
      case 'reverse-bass':
        // Chord - bass - chord
        return [chord, [bass], chord];
      
      case 'double-bass':
        // Bass - bass - chord
        return [[bass], [bass], chord];
      
      case 'syncopated':
        // Bass - (rest) - chord - chord
        return [[bass], [-1], chord, chord];
      
      default:
        return [[bass], chord, chord];
    }
  }
  
  /**
   * ROLLING PATTERN VARIATIONS
   * Cascading/flowing patterns
   */
  private static generateRollingPattern(chordNotes: MidiNote[], variation: RollingVariation): Theme[] {
    if (chordNotes.length < 2) return [chordNotes];
    
    switch (variation) {
      case 'smooth':
        // Gradually add notes
        const smooth: Theme[] = [];
        for (let i = 0; i < chordNotes.length; i++) {
          smooth.push(chordNotes.slice(0, i + 1));
        }
        return smooth;
      
      case 'cascading':
        // Quick roll from bottom to top, then full chord
        const cascade = chordNotes.map(note => [note]);
        cascade.push(chordNotes); // Full chord at end
        return cascade;
      
      case 'reverse':
        // Roll from top to bottom
        const reverse: Theme[] = [];
        for (let i = chordNotes.length - 1; i >= 0; i--) {
          reverse.push(chordNotes.slice(i));
        }
        return reverse;
      
      case 'alternating':
        // Alternate between building up and tearing down
        const alt: Theme[] = [];
        for (let i = 0; i < chordNotes.length; i++) {
          alt.push(chordNotes.slice(0, i + 1));
        }
        for (let i = chordNotes.length - 1; i >= 0; i--) {
          alt.push(chordNotes.slice(0, i));
        }
        return alt.filter(a => a.length > 0);
      
      default:
        return chordNotes.map(note => [note]);
    }
  }
  
  /**
   * STRIDE PIANO VARIATIONS
   * Left-hand patterns typical of stride piano
   */
  private static generateStridePattern(chordNotes: MidiNote[], variation: StrideVariation): Theme[] {
    if (chordNotes.length < 3) return [chordNotes];
    
    const bass = chordNotes[0];
    const mid = chordNotes.slice(1, 3);
    const top = chordNotes.slice(2);
    
    switch (variation) {
      case 'classic':
        // Bass - chord - bass - chord
        return [[bass], mid, [bass], mid];
      
      case 'modern':
        // Bass - full chord - bass note up octave - mid chord
        return [[bass], chordNotes, [bass + 12], mid];
      
      case 'boogie':
        // Walking bass with chord hits
        const bassWalk = [bass, bass + 2, bass + 4, bass + 5];
        return bassWalk.map((b, i) => i % 2 === 0 ? [b] : mid);
      
      case 'swing':
        // Swung rhythm pattern
        return [[bass], mid, [bass], top, mid];
      
      default:
        return [[bass], mid, [bass], mid];
    }
  }
  
  /**
   * TREMOLO VARIATIONS
   * Rapid alternation patterns
   */
  private static generateTremoloPattern(chordNotes: MidiNote[], variation: TremoloVariation): Theme[] {
    if (chordNotes.length < 2) return [chordNotes];
    
    const bass = chordNotes[0];
    const top = chordNotes[chordNotes.length - 1];
    const mid = chordNotes[Math.floor(chordNotes.length / 2)];
    
    switch (variation) {
      case 'binary':
        // Alternate between two notes
        return [[bass], [top], [bass], [top]];
      
      case 'triple':
        // Three-note alternation
        return [[bass], [mid], [top], [bass], [mid], [top]];
      
      case 'quad':
        // Four-note rapid tremolo
        return [[bass], [mid], [top], [mid], [bass], [mid], [top], [mid]];
      
      case 'measured':
        // Measured tremolo with full chord accents
        return [[bass], [top], chordNotes, [bass], [top], chordNotes];
      
      default:
        return [[bass], [top], [bass], [top]];
    }
  }
  
  /**
   * SUSTAINED VARIATIONS
   * Long held chord variations
   */
  private static generateSustainedPattern(chordNotes: MidiNote[], variation: SustainedVariation): Theme[] {
    switch (variation) {
      case 'long':
      case 'medium':
      case 'short':
      case 'crescendo':
        // All variations return the full chord sustained
        // Duration is handled by rhythm, not pattern
        return [chordNotes];
      
      default:
        return [chordNotes];
    }
  }
  
  /**
   * STACCATO VARIATIONS
   * Short, detached note patterns
   */
  private static generateStaccatoPattern(chordNotes: MidiNote[], variation: StaccatoVariation): Theme[] {
    switch (variation) {
      case 'crisp':
        // Each note played separately with rests
        const crisp: Theme[] = [];
        chordNotes.forEach(note => {
          crisp.push([note]);
          crisp.push([-1]); // Rest after each note
        });
        return crisp;
      
      case 'gentle':
        // Full chord with rests between
        return [chordNotes, [-1], chordNotes, [-1]];
      
      case 'rhythmic':
        // Syncopated staccato pattern
        return [chordNotes, [-1], [-1], chordNotes];
      
      case 'swing':
        // Swing rhythm staccato
        return [chordNotes, [-1], chordNotes, [-1], chordNotes];
      
      default:
        return [chordNotes];
    }
  }
  
  /**
   * Convert harmonized part to playback parts
   * FIXED: Now creates separate parts for each voice in the harmony (bass, tenor, alto, soprano)
   * This ensures all chord notes are played, not just the bass note
   */
  static harmonizedPartToParts(harmonized: HarmonizedPart): Part[] {
    const parts: Part[] = [];
    
    // Add original melody as first part
    parts.push({
      melody: harmonized.melody,
      rhythm: harmonized.rhythm
    });
    
    // CRITICAL FIX: Create separate parts for each voice in the harmony
    // Determine the maximum number of voices across all chords
    let maxVoices = 0;
    harmonized.harmonyNotes.forEach(chordNotes => {
      if (chordNotes.length > maxVoices) {
        maxVoices = chordNotes.length;
      }
    });
    
    console.log(`🎼 [HarmonyEngine] Creating ${maxVoices} voice parts for harmony playback`);
    
    // Create one part for each voice (bass, tenor, alto, soprano, etc.)
    for (let voiceIndex = 0; voiceIndex < maxVoices; voiceIndex++) {
      const voicePart: Part = {
        melody: [],
        rhythm: []
      };
      
      harmonized.harmonyNotes.forEach((chordNotes, chordIndex) => {
        const rhythmValue = harmonized.harmonyRhythm[chordIndex];
        
        if (voiceIndex < chordNotes.length) {
          // This voice has a note in this chord
          voicePart.melody.push(chordNotes[voiceIndex]);
          voicePart.rhythm.push(rhythmValue);
        } else {
          // This voice doesn't have a note in this chord - use rest
          voicePart.melody.push(-1); // -1 represents a rest
          voicePart.rhythm.push(rhythmValue);
        }
      });
      
      parts.push(voicePart);
      console.log(`  ✅ Voice ${voiceIndex + 1}: ${voicePart.melody.length} notes`);
    }
    
    console.log(`✅ [HarmonyEngine] Total parts created: ${parts.length} (1 melody + ${maxVoices} harmony voices)`);
    
    return parts;
  }
}
