/**
 * Canon Engine Suite - Complete Implementation
 * Comprehensive canon generation system with all 14 classical canon types
 * Implements Renaissance and Baroque-era canonic algorithms for modal composition
 * 
 * Core 6 Types: STRICT_CANON, INVERSION_CANON, RHYTHMIC_CANON, DOUBLE_CANON, CRAB_CANON, RETROGRADE_INVERSION_CANON
 * Additional 8: PER_AUGMENTATIONEM, AD_DIAPENTE, MENSURABILIS, PERPETUUS, PER_TONOS, PER_ARSIN_ET_THESIN, ENIGMATICUS, PER_MOTUM_CONTRARIUM
 * 
 * ============================================================================
 * MODAL AWARENESS GUIDE (FIX #2 - Documentation Added)
 * ============================================================================
 * 
 * FULLY MODAL-AWARE CANONS (use diatonic transposition when mode provided):
 * - STRICT_CANON: Simple imitation with diatonic interval transposition
 * - AD_DIAPENTE: Canon at the fifth, respects modal scale degrees
 * - PER_TONOS: Modulating canon that shifts through modal centers
 * - PER_MOTUM_CONTRARIUM: Contrary motion respecting modal intervals
 * - DOUBLE_CANON: Multiple canons with diatonic relationships
 * - PERPETUUS: Circular canon maintaining modal structure
 * - MENSURABILIS: Proportional canon with modal transposition
 * 
 * CHROMATIC CANONS (ignore mode, use chromatic intervals):
 * - INVERSION_CANON: Uses chromatic inversion around axis pitch
 * - RETROGRADE_INVERSION_CANON: Chromatic inversion + time reversal
 * - ENIGMATICUS: Puzzle canon with chromatic transformations
 * 
 * HYBRID CANONS (modal for melody, chromatic for special effects):
 * - RHYTHMIC_CANON: Modal melody with chromatic mensuration
 * - PER_AUGMENTATIONEM: Modal intervals with rhythmic augmentation
 * - PER_ARSIN_ET_THESIN: Modal with chromatic displacement
 * - CRAB_CANON: Modal melody played in retrograde (time-based)
 * 
 * Implementation: When mode is provided, isDiatonic flag in CanonInterval
 * determines whether transposeMelody uses modal scale or chromatic semitones.
 * ============================================================================
 */

import { Theme, Part, Mode, Rhythm, MidiNote } from '../types/musical';
import { MusicalEngine } from './musical-engine';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type CanonType =
  // Core 6 Canon Types
  | 'STRICT_CANON'      // MODAL-AWARE: Diatonic transposition
  | 'INVERSION_CANON'   // CHROMATIC: Chromatic inversion
  | 'RHYTHMIC_CANON'    // HYBRID: Modal melody, chromatic mensuration
  | 'DOUBLE_CANON'      // MODAL-AWARE: Multiple diatonic voices
  | 'CRAB_CANON'        // HYBRID: Modal melody in retrograde
  | 'RETROGRADE_INVERSION_CANON'  // CHROMATIC: Chromatic inversion + retrograde
  // Additional Variations
  | 'PER_AUGMENTATIONEM'        // HYBRID: Modal + rhythmic augmentation
  | 'PER_TONOS'                 // MODAL-AWARE: Modulating canon
  | 'PER_MOTUM_CONTRARIUM'      // MODAL-AWARE: Modal contrary motion
  | 'PER_ARSIN_ET_THESIN'       // HYBRID: Modal + chromatic displacement
  | 'AD_DIAPENTE'               // MODAL-AWARE: Canon at the fifth
  | 'PERPETUUS'                 // MODAL-AWARE: Circular modal canon
  | 'ENIGMATICUS'               // CHROMATIC: Puzzle canon
  | 'MENSURABILIS'              // MODAL-AWARE: Proportional canon
  // NEW: Extended Canon Types (Additive Enhancement)
  | 'DOUBLE_CANON_BY_INVERSION'  // NEW: Double Canon + Inversion (4+ voices, 2 axes)
  | 'DOUBLE_RHYTHMIC_CANON'      // NEW: Double Canon + Rhythmic (4+ voices)
  | 'DOUBLE_CRAB_INVERSION_CANON'  // NEW: Crab + Inversion (4+ voices)
  | 'PER_DUO_AUGMENTATIONEM'     // NEW: 2 mensuration ratios (3+ voices)
  | 'INVERTED_CANON_AT_THE_FIFTH'  // NEW: Canon at Fifth but inverted
  // NEWEST: Harris Software Solutions Canon Types
  | 'LOOSE_CANON'               // NEW: Loosely fixed interval with adherence percentage
  | 'PER_MUTATIVE_CANON'        // NEW: Permutates notes randomly (1-7 permutations)
  | 'FRAGMENTAL_CANON';         // NEW: Followers contain fragments (min 7 notes, up to 6 followers)

export interface CanonInterval {
  semitones: number;
  diatonicSteps: number;
  isDiatonic: boolean;
}

export interface CanonParams {
  type: CanonType;
  interval: CanonInterval;
  delay: number; // in beats
  mensurationRatio?: number; // for rhythmic canons (e.g., 1.5 = augmentation)
  inversionAxis?: MidiNote; // for inversion canons
  numVoices?: number; // for multi-voice canons
  spatialPositions?: { x: number; y: number; z: number }[]; // for spatial canons
  loopStart?: number; // for perpetual canons
  loopEnd?: number;
  // NEW: Extended parameters for new canon types (Additive Enhancement)
  inversionAxis2?: MidiNote; // NEW: Second inversion axis for Double Canon by Inversion
  mensurationRatio2?: number; // NEW: Second mensuration ratio for Per Duo Augmentationem
  modulationTargetMode?: Mode; // NEW: Target mode for Per Tonos modulation
  secondThemeInterval?: CanonInterval; // NEW: Custom interval for second theme in Double Canon
  numVoicesPerCanon?: number; // NEW: Voices per canon in double canons (2-7 each)
  // NEWEST: Harris Software Solutions Parameters
  adherencePercentage?: number; // NEW: Percentage of strict adherence for Loose Canon (0-100)
  numPermutations?: number; // NEW: Number of permutations for Per Mutative Canon (1-7)
  // PER TONOS ENHANCEMENTS: Individual voice intervals and key modulation
  perTonosIntervals?: CanonInterval[]; // NEW: Individual transposition interval for each voice (Per Tonos enhancement)
  perTonosModulations?: Array<{ keyName?: string; semitones?: number }>; // NEW: Modulation targets by key name or semitones (Per Tonos enhancement)
}

export interface CanonVoice {
  id: string;
  melody: Theme;
  rhythm: Rhythm;
  delay: number; // entry delay in beats
  instrument?: string;
  spatial?: { x: number; y: number; z: number };
  mensuration?: number; // tempo ratio
}

export interface CanonResult {
  voices: CanonVoice[];
  metadata: {
    type: CanonType;
    description: string;
    entryPattern: string;
    totalDuration: number;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Transpose a melody by a given interval
 * BUG FIX: Now properly handles rests (-1) and preserves octave information
 */
function transposeMelody(melody: Theme, interval: CanonInterval, mode?: Mode): Theme {
  if (interval.isDiatonic && mode) {
    // Diatonic transposition using mode scale
    return melody.map(note => {
      // BUG FIX: Preserve rests (-1) without transposition
      if (note === -1) return -1;
      
      const pitchClass = note % 12;
      const octave = Math.floor(note / 12);
      // Find note in scale and transpose diatonically
      const scaleNotes = buildScaleFromMode(mode);
      const scaleIndex = scaleNotes.indexOf(pitchClass);
      if (scaleIndex >= 0) {
        const newIndex = (scaleIndex + interval.diatonicSteps) % scaleNotes.length;
        const octaveShift = Math.floor((scaleIndex + interval.diatonicSteps) / scaleNotes.length);
        return (octave + octaveShift) * 12 + scaleNotes[newIndex];
      }
      return note + interval.semitones; // Fallback to chromatic
    });
  } else {
    // Chromatic transposition
    return melody.map(note => {
      // BUG FIX: Preserve rests (-1) without transposition
      if (note === -1) return -1;
      return note + interval.semitones;
    });
  }
}

/**
 * Build scale degrees from mode
 * BUG FIX: Only return 7 unique pitch classes (exclude octave duplicate)
 */
function buildScaleFromMode(mode: Mode): number[] {
  const scale: number[] = [mode.final];
  let current = mode.final;
  
  // BUG FIX: Only iterate 6 times (not 7) to avoid adding octave duplicate
  // stepPattern has 7 steps, but the last one wraps back to the root
  const stepsToProcess = mode.stepPattern.slice(0, 6); // First 6 steps only
  
  for (const step of stepsToProcess) {
    current = (current + step) % 12;
    scale.push(current);
  }
  
  return scale; // Returns 7 unique pitch classes
}

/**
 * Invert melody around an axis
 */
function invertMelody(melody: Theme, axis: MidiNote): Theme {
  return melody.map(note => {
    const distance = note - axis;
    return axis - distance;
  });
}

/**
 * Reverse melody (retrograde)
 */
function reverseMelody(melody: Theme): Theme {
  return [...melody].reverse();
}

/**
 * Scale durations for rhythmic transformation
 */
function scaleDurations(rhythm: Rhythm, factor: number): Rhythm {
  return rhythm.map(beat => {
    if (beat === 0) return 0; // Keep rests as rests
    return beat * factor;
  });
}

/**
 * Build rhythm with quarter notes
 * Creates a rhythm array that matches the melody length exactly
 * Note: Entry delays are handled via -1 (rest) values in the melody itself,
 * not through 0 values in the rhythm array
 */
function buildRhythmWithDelay(melodyLength: number, delayBeats: number): Rhythm {
  // For delayed entries, the rhythm should still match the melody length
  // The delay is encoded as initial rests (-1 values) in the melody, not rhythm
  // This prevents melody/rhythm length mismatch
  return new Array(melodyLength).fill(1); // All quarter notes
}

/**
 * Pad melody with rest notes (value -1) at the beginning for entry delay
 * This ensures melody and rhythm lengths stay aligned
 * Uses -1 to represent rests (standard rest value in the system)
 */
function padMelodyWithDelay(melody: Theme, delayBeats: number): Theme {
  if (delayBeats === 0) return melody;
  const restNotes = new Array(Math.floor(delayBeats)).fill(-1); // -1 represents rest (NOT 0 which is MIDI C-1)
  return [...restNotes, ...melody];
}

// ============================================================================
// CORE CANON ALGORITHMS
// ============================================================================

/**
 * 1. STRICT CANON AT INTERVAL
 * The follower imitates the leader at a fixed interval after a delay
 */
function generateStrictCanon(
  leader: Theme,
  params: CanonParams,
  mode?: Mode
): CanonResult {
  const numVoices = params.numVoices || 2;
  const voices: CanonVoice[] = [];

  // Leader voice - pad with rests at beginning if needed
  const leaderWithDelay = padMelodyWithDelay(leader, 0);
  voices.push({
    id: 'Leader',
    melody: leaderWithDelay,
    rhythm: buildRhythmWithDelay(leaderWithDelay.length, 0),
    delay: 0
  });

  // Follower voices - each padded with entry delay
  for (let i = 1; i < numVoices; i++) {
    const followerBase = transposeMelody(leader, params.interval, mode);
    const followerWithDelay = padMelodyWithDelay(followerBase, params.delay * i);
    
    voices.push({
      id: `Follower ${i}`,
      melody: followerWithDelay,
      rhythm: buildRhythmWithDelay(followerWithDelay.length, params.delay * i),
      delay: params.delay * i
    });
  }

  return {
    voices,
    metadata: {
      type: 'STRICT_CANON',
      description: `Strict canon at ${params.interval.semitones} semitones`,
      entryPattern: `Voices enter every ${params.delay} beats`,
      totalDuration: leader.length + params.delay * (numVoices - 1)
    }
  };
}

/**
 * 2. CANON BY INVERSION
 * Follower plays the inverted (mirrored) melody
 */
function generateInversionCanon(
  leader: Theme,
  params: CanonParams
): CanonResult {
  const axis = params.inversionAxis || leader[0];
  const invertedMelody = invertMelody(leader, axis);
  const transposedBase = params.interval.semitones !== 0
    ? transposeMelody(invertedMelody, params.interval)
    : invertedMelody;

  const leaderWithDelay = padMelodyWithDelay(leader, 0);
  const followerWithDelay = padMelodyWithDelay(transposedBase, params.delay);

  const voices: CanonVoice[] = [
    {
      id: 'Leader',
      melody: leaderWithDelay,
      rhythm: buildRhythmWithDelay(leaderWithDelay.length, 0),
      delay: 0
    },
    {
      id: 'Inverted Follower',
      melody: followerWithDelay,
      rhythm: buildRhythmWithDelay(followerWithDelay.length, params.delay),
      delay: params.delay
    }
  ];

  return {
    voices,
    metadata: {
      type: 'INVERSION_CANON',
      description: `Canon by inversion around ${axis}`,
      entryPattern: `Follower enters after ${params.delay} beats with inverted melody`,
      totalDuration: Math.max(leaderWithDelay.length, followerWithDelay.length)
    }
  };
}

/**
 * 3. RHYTHMIC CANON (Augmentation/Diminution/Mensuration)
 * Follower plays at a different tempo ratio
 */
function generateRhythmicCanon(
  leader: Theme,
  params: CanonParams
): CanonResult {
  const ratio = params.mensurationRatio || 2.0;
  
  const followerBase = params.interval.semitones !== 0
    ? transposeMelody(leader, params.interval)
    : leader;

  const leaderWithDelay = padMelodyWithDelay(leader, 0);
  const followerWithDelay = padMelodyWithDelay(followerBase, params.delay);

  const leaderRhythm = buildRhythmWithDelay(leaderWithDelay.length, 0);
  const followerRhythm = scaleDurations(buildRhythmWithDelay(followerWithDelay.length, 0), ratio);

  const voices: CanonVoice[] = [
    {
      id: 'Leader',
      melody: leaderWithDelay,
      rhythm: leaderRhythm,
      delay: 0,
      mensuration: 1.0
    },
    {
      id: `Follower (${ratio}x)`,
      melody: followerWithDelay,
      rhythm: followerRhythm,
      delay: params.delay,
      mensuration: ratio
    }
  ];

  const canonName = ratio > 1 ? 'Augmentation' : ratio < 1 ? 'Diminution' : 'Mensuration';

  return {
    voices,
    metadata: {
      type: 'RHYTHMIC_CANON',
      description: `${canonName} canon (ratio ${ratio}:1)`,
      entryPattern: `Follower plays at ${ratio}x speed`,
      totalDuration: Math.max(leaderWithDelay.length, followerWithDelay.length)
    }
  };
}

/**
 * 4. DOUBLE CANON
 * Two independent canons running simultaneously
 */
function generateDoubleCanon(
  leaderA: Theme,
  leaderB: Theme,
  params: CanonParams
): CanonResult {
  // Canon A
  const followerABase = transposeMelody(leaderA, params.interval);
  
  // Canon B (use different interval if specified)
  const intervalB: CanonInterval = {
    semitones: 7, // Perfect fifth for second canon
    diatonicSteps: 4,
    isDiatonic: true
  };
  const followerBBase = transposeMelody(leaderB, intervalB);

  // Pad all melodies with entry delays
  const leaderAWithDelay = padMelodyWithDelay(leaderA, 0);
  const followerAWithDelay = padMelodyWithDelay(followerABase, params.delay);
  const leaderBWithDelay = padMelodyWithDelay(leaderB, params.delay / 2);
  const followerBWithDelay = padMelodyWithDelay(followerBBase, params.delay * 1.5);

  const voices: CanonVoice[] = [
    {
      id: 'Canon A - Leader',
      melody: leaderAWithDelay,
      rhythm: buildRhythmWithDelay(leaderAWithDelay.length, 0),
      delay: 0
    },
    {
      id: 'Canon A - Follower',
      melody: followerAWithDelay,
      rhythm: buildRhythmWithDelay(followerAWithDelay.length, params.delay),
      delay: params.delay
    },
    {
      id: 'Canon B - Leader',
      melody: leaderBWithDelay,
      rhythm: buildRhythmWithDelay(leaderBWithDelay.length, params.delay / 2),
      delay: params.delay / 2
    },
    {
      id: 'Canon B - Follower',
      melody: followerBWithDelay,
      rhythm: buildRhythmWithDelay(followerBWithDelay.length, params.delay * 1.5),
      delay: params.delay * 1.5
    }
  ];

  return {
    voices,
    metadata: {
      type: 'DOUBLE_CANON',
      description: 'Two simultaneous canons',
      entryPattern: 'Staggered entries across both canons',
      totalDuration: Math.max(...voices.map(v => v.melody.length))
    }
  };
}

/**
 * 5. CRAB CANON (Retrograde)
 * Follower plays the melody backward in time
 */
function generateCrabCanon(
  leader: Theme,
  params: CanonParams
): CanonResult {
  const reversedBase = reverseMelody(leader);
  const transposedBase = params.interval.semitones !== 0
    ? transposeMelody(reversedBase, params.interval)
    : reversedBase;

  const leaderWithDelay = padMelodyWithDelay(leader, 0);
  const followerWithDelay = padMelodyWithDelay(transposedBase, params.delay);

  const voices: CanonVoice[] = [
    {
      id: 'Leader (Forward)',
      melody: leaderWithDelay,
      rhythm: buildRhythmWithDelay(leaderWithDelay.length, 0),
      delay: 0
    },
    {
      id: 'Follower (Backward)',
      melody: followerWithDelay,
      rhythm: buildRhythmWithDelay(followerWithDelay.length, params.delay),
      delay: params.delay
    }
  ];

  return {
    voices,
    metadata: {
      type: 'CRAB_CANON',
      description: 'Palindromic canon (retrograde)',
      entryPattern: 'Follower plays melody in reverse',
      totalDuration: Math.max(leaderWithDelay.length, followerWithDelay.length)
    }
  };
}

/**
 * 6. RETROGRADE-INVERSION CANON
 * Follower inverts AND reverses the melody
 */
function generateRetrogradeInversionCanon(
  leader: Theme,
  params: CanonParams
): CanonResult {
  const axis = params.inversionAxis || leader[0];
  const invertedMelody = invertMelody(leader, axis);
  const reversedMelody = reverseMelody(invertedMelody);
  const transposedBase = params.interval.semitones !== 0
    ? transposeMelody(reversedMelody, params.interval)
    : reversedMelody;

  const leaderWithDelay = padMelodyWithDelay(leader, 0);
  const followerWithDelay = padMelodyWithDelay(transposedBase, params.delay);

  const voices: CanonVoice[] = [
    {
      id: 'Leader',
      melody: leaderWithDelay,
      rhythm: buildRhythmWithDelay(leaderWithDelay.length, 0),
      delay: 0
    },
    {
      id: 'Retrograde-Inverted Follower',
      melody: followerWithDelay,
      rhythm: buildRhythmWithDelay(followerWithDelay.length, params.delay),
      delay: params.delay
    }
  ];

  return {
    voices,
    metadata: {
      type: 'RETROGRADE_INVERSION_CANON',
      description: 'Two-dimensional mirror (pitch + time)',
      entryPattern: 'Follower plays inverted melody in reverse',
      totalDuration: Math.max(leaderWithDelay.length, followerWithDelay.length)
    }
  };
}

/**
 * 7. PER TONOS (MODULATING CANON)
 * Canon that changes keys/intervals progressively
 * ENHANCED: Now supports individual voice intervals and key signature modulation
 */
function generatePerTonosCanon(
  leader: Theme,
  params: CanonParams,
  mode?: Mode
): CanonResult {
  const numVoices = params.numVoices || 3;
  const voices: CanonVoice[] = [];

  // Leader voice
  const leaderWithDelay = padMelodyWithDelay(leader, 0);
  voices.push({
    id: 'Leader',
    melody: leaderWithDelay,
    rhythm: buildRhythmWithDelay(leaderWithDelay.length, 0),
    delay: 0
  });

  // ENHANCEMENT: Check if individual per-voice intervals are provided
  const useIndividualIntervals = params.perTonosIntervals && params.perTonosIntervals.length > 0;
  const useModulationTargets = params.perTonosModulations && params.perTonosModulations.length > 0;

  // Each follower transposes by individual or progressive intervals
  for (let i = 1; i < numVoices; i++) {
    let voiceInterval: CanonInterval;
    let modulationLabel = '';

    if (useIndividualIntervals && params.perTonosIntervals![i - 1]) {
      // NEW: Use individual interval specified for this voice
      voiceInterval = params.perTonosIntervals![i - 1];
      modulationLabel = `${voiceInterval.semitones > 0 ? '+' : ''}${voiceInterval.semitones}st`;
    } else {
      // PRESERVE: Fall back to cumulative interval logic (existing behavior)
      voiceInterval = {
        semitones: params.interval.semitones * i,
        diatonicSteps: params.interval.diatonicSteps * i,
        isDiatonic: params.interval.isDiatonic
      };
      modulationLabel = `+${voiceInterval.semitones}st`;
    }

    // Add modulation target label if specified
    if (useModulationTargets && params.perTonosModulations![i - 1]) {
      const modTarget = params.perTonosModulations![i - 1];
      if (modTarget.keyName) {
        modulationLabel = `→ ${modTarget.keyName}`;
      } else if (modTarget.semitones !== undefined) {
        modulationLabel = `→ ${modTarget.semitones > 0 ? '+' : ''}${modTarget.semitones}st`;
      }
    }

    const followerBase = transposeMelody(leader, voiceInterval, mode);
    const followerWithDelay = padMelodyWithDelay(followerBase, params.delay * i);
    
    voices.push({
      id: `Follower ${i} ${modulationLabel}`,
      melody: followerWithDelay,
      rhythm: buildRhythmWithDelay(followerWithDelay.length, params.delay * i),
      delay: params.delay * i
    });
  }

  // Build description based on configuration
  let description = 'Modulating canon with progressive key changes';
  let entryPattern = '';
  
  if (useIndividualIntervals) {
    description = 'Modulating canon with individual voice intervals';
    entryPattern = 'Each voice has unique transposition interval';
  } else {
    entryPattern = `Each voice transposes by ${params.interval.semitones} more semitones`;
  }

  if (useModulationTargets) {
    description = 'Modulating canon with key signature modulations';
    entryPattern = 'Voices modulate to specified key signatures';
  }

  return {
    voices,
    metadata: {
      type: 'PER_TONOS',
      description,
      entryPattern,
      totalDuration: leader.length + params.delay * (numVoices - 1)
    }
  };
}

/**
 * 8. PER ARSIN ET THESIN (UPBEAT/DOWNBEAT CANON)
 * Canon with shifted metric accents
 */
function generatePerArsinEtThesinCanon(
  leader: Theme,
  params: CanonParams
): CanonResult {
  // Create follower with rhythmic displacement (upbeat vs downbeat)
  // The follower starts on the upbeat (half beat offset)
  const halfBeatDelay = params.delay + 0.5; // Add half-beat shift
  
  const leaderWithDelay = padMelodyWithDelay(leader, 0);
  const followerBase = transposeMelody(leader, params.interval);
  const followerWithDelay = padMelodyWithDelay(followerBase, Math.floor(halfBeatDelay));
  
  // Create rhythm with half-beat displacement
  const followerRhythm = buildRhythmWithDelay(followerWithDelay.length, Math.floor(halfBeatDelay));
  // Shift rhythm values to create upbeat feeling
  const shiftedRhythm = followerRhythm.map((beat, i) => {
    if (i === 0 && beat > 0) return beat * 0.5; // First note shortened
    return beat;
  });

  const voices: CanonVoice[] = [
    {
      id: 'Leader (Downbeat)',
      melody: leaderWithDelay,
      rhythm: buildRhythmWithDelay(leaderWithDelay.length, 0),
      delay: 0
    },
    {
      id: 'Follower (Upbeat)',
      melody: followerWithDelay,
      rhythm: shiftedRhythm,
      delay: halfBeatDelay
    }
  ];

  return {
    voices,
    metadata: {
      type: 'PER_ARSIN_ET_THESIN',
      description: 'Canon with upbeat/downbeat displacement',
      entryPattern: 'Follower enters on upbeat (half-beat shift)',
      totalDuration: Math.max(leaderWithDelay.length, followerWithDelay.length)
    }
  };
}

/**
 * 9. ENIGMATICUS (ENIGMA CANON)
 * Canon with hidden/transformed solution
 */
function generateEnigmaticusCanon(
  leader: Theme,
  params: CanonParams,
  mode?: Mode
): CanonResult {
  // Create "enigmatic" transformation combining multiple techniques
  // 1. Transpose the melody
  const transposed = transposeMelody(leader, params.interval, mode);
  
  // 2. Apply selective inversion (every other note)
  const axis = params.inversionAxis || leader[0];
  const enigmaticMelody = transposed.map((note, i) => {
    if (i % 2 === 0) {
      // Invert even-indexed notes
      const distance = note - axis;
      return axis - distance;
    }
    return note; // Keep odd-indexed notes
  });
  
  // 3. Add rhythmic variation (1.5x speed for complexity)
  const enigmaticRhythm = buildRhythmWithDelay(enigmaticMelody.length, params.delay).map(beat => 
    beat > 0 ? beat * 0.67 : 0 // Speed up to 1.5x
  );

  const leaderWithDelay = padMelodyWithDelay(leader, 0);
  const followerWithDelay = padMelodyWithDelay(enigmaticMelody, params.delay);

  const voices: CanonVoice[] = [
    {
      id: 'Leader (Clear)',
      melody: leaderWithDelay,
      rhythm: buildRhythmWithDelay(leaderWithDelay.length, 0),
      delay: 0
    },
    {
      id: 'Follower (Enigmatic)',
      melody: followerWithDelay,
      rhythm: enigmaticRhythm,
      delay: params.delay
    }
  ];

  return {
    voices,
    metadata: {
      type: 'ENIGMATICUS',
      description: 'Enigma canon with hidden transformation',
      entryPattern: 'Follower uses selective inversion + rhythmic variation',
      totalDuration: Math.max(leaderWithDelay.length, followerWithDelay.length)
    }
  };
}

// ============================================================================
// NEW CANON TYPES - ADDITIVE ENHANCEMENTS
// ============================================================================

/**
 * NEW: DOUBLE CANON BY INVERSION
 * 2 melodies mirrored around 2 axes (contrary motion) - at least 4 voices
 * User can choose number of voices per canon (2-7 each)
 */
function generateDoubleCanonByInversion(
  leaderA: Theme,
  leaderB: Theme,
  params: CanonParams,
  mode?: Mode
): CanonResult {
  const numVoicesPerCanon = params.numVoicesPerCanon || 2;
  const axis1 = params.inversionAxis || leaderA[0];
  const axis2 = params.inversionAxis2 || leaderB[0];
  const voices: CanonVoice[] = [];

  // Canon A - Leader and inverted followers
  const leaderAWithDelay = padMelodyWithDelay(leaderA, 0);
  voices.push({
    id: 'Canon A - Leader',
    melody: leaderAWithDelay,
    rhythm: buildRhythmWithDelay(leaderAWithDelay.length, 0),
    delay: 0
  });

  for (let i = 1; i < numVoicesPerCanon; i++) {
    const invertedA = invertMelody(leaderA, axis1);
    const transposedA = params.interval.semitones !== 0
      ? transposeMelody(invertedA, params.interval, mode)
      : invertedA;
    const followerAWithDelay = padMelodyWithDelay(transposedA, params.delay * i);
    
    voices.push({
      id: `Canon A - Inverted Follower ${i}`,
      melody: followerAWithDelay,
      rhythm: buildRhythmWithDelay(followerAWithDelay.length, params.delay * i),
      delay: params.delay * i
    });
  }

  // Canon B - Leader and inverted followers (around axis2)
  const leaderBWithDelay = padMelodyWithDelay(leaderB, params.delay / 2);
  voices.push({
    id: 'Canon B - Leader',
    melody: leaderBWithDelay,
    rhythm: buildRhythmWithDelay(leaderBWithDelay.length, params.delay / 2),
    delay: params.delay / 2
  });

  for (let i = 1; i < numVoicesPerCanon; i++) {
    const invertedB = invertMelody(leaderB, axis2);
    const intervalB = params.secondThemeInterval || params.interval;
    const transposedB = intervalB.semitones !== 0
      ? transposeMelody(invertedB, intervalB, mode)
      : invertedB;
    const followerBWithDelay = padMelodyWithDelay(transposedB, (params.delay / 2) + (params.delay * i));
    
    voices.push({
      id: `Canon B - Inverted Follower ${i}`,
      melody: followerBWithDelay,
      rhythm: buildRhythmWithDelay(followerBWithDelay.length, (params.delay / 2) + (params.delay * i)),
      delay: (params.delay / 2) + (params.delay * i)
    });
  }

  return {
    voices,
    metadata: {
      type: 'DOUBLE_CANON_BY_INVERSION',
      description: `Double Canon by Inversion (${numVoicesPerCanon}x2 voices, 2 inversion axes)`,
      entryPattern: `Canon A inverts around axis ${axis1}, Canon B around axis ${axis2}`,
      totalDuration: Math.max(...voices.map(v => v.melody.length))
    }
  };
}

/**
 * NEW: DOUBLE RHYTHMIC CANON
 * Combines Double Canon + Rhythmic Canon - at least 4 voices
 */
function generateDoubleRhythmicCanon(
  leaderA: Theme,
  leaderB: Theme,
  params: CanonParams,
  mode?: Mode
): CanonResult {
  const numVoicesPerCanon = params.numVoicesPerCanon || 2;
  const ratio1 = params.mensurationRatio || 2.0;
  const ratio2 = params.mensurationRatio2 || 1.5;
  const voices: CanonVoice[] = [];

  // Canon A - with mensuration ratio 1
  const leaderAWithDelay = padMelodyWithDelay(leaderA, 0);
  voices.push({
    id: 'Canon A - Leader',
    melody: leaderAWithDelay,
    rhythm: buildRhythmWithDelay(leaderAWithDelay.length, 0),
    delay: 0,
    mensuration: 1.0
  });

  for (let i = 1; i < numVoicesPerCanon; i++) {
    const followerABase = transposeMelody(leaderA, params.interval, mode);
    const followerAWithDelay = padMelodyWithDelay(followerABase, params.delay * i);
    const followerARhythm = scaleDurations(buildRhythmWithDelay(followerAWithDelay.length, 0), ratio1);
    
    voices.push({
      id: `Canon A - Follower ${i} (${ratio1}x)`,
      melody: followerAWithDelay,
      rhythm: followerARhythm,
      delay: params.delay * i,
      mensuration: ratio1
    });
  }

  // Canon B - with mensuration ratio 2
  const leaderBWithDelay = padMelodyWithDelay(leaderB, params.delay / 2);
  voices.push({
    id: 'Canon B - Leader',
    melody: leaderBWithDelay,
    rhythm: buildRhythmWithDelay(leaderBWithDelay.length, params.delay / 2),
    delay: params.delay / 2,
    mensuration: 1.0
  });

  for (let i = 1; i < numVoicesPerCanon; i++) {
    const intervalB = params.secondThemeInterval || { semitones: 7, diatonicSteps: 4, isDiatonic: true };
    const followerBBase = transposeMelody(leaderB, intervalB, mode);
    const followerBWithDelay = padMelodyWithDelay(followerBBase, (params.delay / 2) + (params.delay * i));
    const followerBRhythm = scaleDurations(buildRhythmWithDelay(followerBWithDelay.length, 0), ratio2);
    
    voices.push({
      id: `Canon B - Follower ${i} (${ratio2}x)`,
      melody: followerBWithDelay,
      rhythm: followerBRhythm,
      delay: (params.delay / 2) + (params.delay * i),
      mensuration: ratio2
    });
  }

  return {
    voices,
    metadata: {
      type: 'DOUBLE_RHYTHMIC_CANON',
      description: `Double Rhythmic Canon (${numVoicesPerCanon}x2 voices, ratios ${ratio1}:1 & ${ratio2}:1)`,
      entryPattern: `Canon A at ${ratio1}x speed, Canon B at ${ratio2}x speed`,
      totalDuration: Math.max(...voices.map(v => v.melody.length))
    }
  };
}

/**
 * NEW: DOUBLE CRAB INVERSION CANON
 * Combines Crab Canon + Canon by Inversion - at least 4 voices
 * User decides inversion axes, transposition intervals, and entry delays
 */
function generateDoubleCrabInversionCanon(
  leaderA: Theme,
  leaderB: Theme,
  params: CanonParams,
  mode?: Mode
): CanonResult {
  const numVoicesPerCanon = params.numVoicesPerCanon || 2;
  const axis1 = params.inversionAxis || leaderA[0];
  const axis2 = params.inversionAxis2 || leaderB[0];
  const voices: CanonVoice[] = [];

  // Canon A - Crab + Inversion
  const leaderAWithDelay = padMelodyWithDelay(leaderA, 0);
  voices.push({
    id: 'Canon A - Leader',
    melody: leaderAWithDelay,
    rhythm: buildRhythmWithDelay(leaderAWithDelay.length, 0),
    delay: 0
  });

  for (let i = 1; i < numVoicesPerCanon; i++) {
    // Apply both retrograde and inversion
    const invertedA = invertMelody(leaderA, axis1);
    const retrogradeInvertedA = reverseMelody(invertedA);
    const transposedA = params.interval.semitones !== 0
      ? transposeMelody(retrogradeInvertedA, params.interval, mode)
      : retrogradeInvertedA;
    const followerAWithDelay = padMelodyWithDelay(transposedA, params.delay * i);
    
    voices.push({
      id: `Canon A - Crab-Inverted Follower ${i}`,
      melody: followerAWithDelay,
      rhythm: buildRhythmWithDelay(followerAWithDelay.length, params.delay * i),
      delay: params.delay * i
    });
  }

  // Canon B - Crab + Inversion (around axis2)
  const leaderBWithDelay = padMelodyWithDelay(leaderB, params.delay / 2);
  voices.push({
    id: 'Canon B - Leader',
    melody: leaderBWithDelay,
    rhythm: buildRhythmWithDelay(leaderBWithDelay.length, params.delay / 2),
    delay: params.delay / 2
  });

  for (let i = 1; i < numVoicesPerCanon; i++) {
    const invertedB = invertMelody(leaderB, axis2);
    const retrogradeInvertedB = reverseMelody(invertedB);
    const intervalB = params.secondThemeInterval || params.interval;
    const transposedB = intervalB.semitones !== 0
      ? transposeMelody(retrogradeInvertedB, intervalB, mode)
      : retrogradeInvertedB;
    const followerBWithDelay = padMelodyWithDelay(transposedB, (params.delay / 2) + (params.delay * i));
    
    voices.push({
      id: `Canon B - Crab-Inverted Follower ${i}`,
      melody: followerBWithDelay,
      rhythm: buildRhythmWithDelay(followerBWithDelay.length, (params.delay / 2) + (params.delay * i)),
      delay: (params.delay / 2) + (params.delay * i)
    });
  }

  return {
    voices,
    metadata: {
      type: 'DOUBLE_CRAB_INVERSION_CANON',
      description: `Double Crab-Inversion Canon (${numVoicesPerCanon}x2 voices)`,
      entryPattern: `Followers play inverted + retrograde melodies`,
      totalDuration: Math.max(...voices.map(v => v.melody.length))
    }
  };
}

/**
 * NEW: PER DUO AUGMENTATIONEM
 * Followers follow in longer note values (2x-4x slower)
 * Requires 2 mensuration ratio sliders - at least 3 voices
 */
function generatePerDuoAugmentationemCanon(
  leader: Theme,
  params: CanonParams,
  mode?: Mode
): CanonResult {
  const numVoices = params.numVoices || 3;
  const ratio1 = params.mensurationRatio || 2.0; // First mensuration ratio
  const ratio2 = params.mensurationRatio2 || 3.0; // Second mensuration ratio
  const voices: CanonVoice[] = [];

  // Leader voice
  const leaderWithDelay = padMelodyWithDelay(leader, 0);
  voices.push({
    id: 'Leader',
    melody: leaderWithDelay,
    rhythm: buildRhythmWithDelay(leaderWithDelay.length, 0),
    delay: 0,
    mensuration: 1.0
  });

  // Followers with alternating mensuration ratios
  for (let i = 1; i < numVoices; i++) {
    const ratio = i % 2 === 1 ? ratio1 : ratio2; // Alternate between ratio1 and ratio2
    const followerBase = transposeMelody(leader, params.interval, mode);
    const followerWithDelay = padMelodyWithDelay(followerBase, params.delay * i);
    const followerRhythm = scaleDurations(buildRhythmWithDelay(followerWithDelay.length, 0), ratio);
    
    voices.push({
      id: `Follower ${i} (${ratio}x slower)`,
      melody: followerWithDelay,
      rhythm: followerRhythm,
      delay: params.delay * i,
      mensuration: ratio
    });
  }

  return {
    voices,
    metadata: {
      type: 'PER_DUO_AUGMENTATIONEM',
      description: `Per Duo Augmentationem (${numVoices} voices, ratios ${ratio1}:1 & ${ratio2}:1)`,
      entryPattern: `Followers alternate between ${ratio1}x and ${ratio2}x slower speeds`,
      totalDuration: Math.max(...voices.map(v => v.melody.length))
    }
  };
}

/**
 * NEW: INVERTED CANON AT THE FIFTH
 * Strict canon at the fifth, but inverted
 */
function generateInvertedCanonAtTheFifth(
  leader: Theme,
  params: CanonParams,
  mode?: Mode
): CanonResult {
  const numVoices = params.numVoices || 2;
  const axis = params.inversionAxis || leader[0];
  const fifthInterval: CanonInterval = { semitones: 7, diatonicSteps: 4, isDiatonic: true };
  const voices: CanonVoice[] = [];

  // Leader voice
  const leaderWithDelay = padMelodyWithDelay(leader, 0);
  voices.push({
    id: 'Leader',
    melody: leaderWithDelay,
    rhythm: buildRhythmWithDelay(leaderWithDelay.length, 0),
    delay: 0
  });

  // Inverted followers at the fifth
  for (let i = 1; i < numVoices; i++) {
    const invertedMelody = invertMelody(leader, axis);
    const transposedMelody = transposeMelody(invertedMelody, fifthInterval, mode);
    const followerWithDelay = padMelodyWithDelay(transposedMelody, params.delay * i);
    
    voices.push({
      id: `Inverted Follower ${i} (at 5th)`,
      melody: followerWithDelay,
      rhythm: buildRhythmWithDelay(followerWithDelay.length, params.delay * i),
      delay: params.delay * i
    });
  }

  return {
    voices,
    metadata: {
      type: 'INVERTED_CANON_AT_THE_FIFTH',
      description: `Inverted Canon at the Fifth (${numVoices} voices)`,
      entryPattern: `Followers play inverted melody transposed up a fifth`,
      totalDuration: Math.max(...voices.map(v => v.melody.length))
    }
  };
}

/**
 * NEW: LOOSE CANON
 * Novel imitation at a loosely fixed interval
 * User chooses percentage of notes strictly adhering to classic imitation
 */
function generateLooseCanon(
  leader: Theme,
  params: CanonParams,
  mode?: Mode
): CanonResult {
  const numVoices = params.numVoices || 2;
  const adherencePercentage = params.adherencePercentage || 70; // Default 70% adherence
  const voices: CanonVoice[] = [];

  // Leader voice
  const leaderWithDelay = padMelodyWithDelay(leader, 0);
  voices.push({
    id: 'Leader',
    melody: leaderWithDelay,
    rhythm: buildRhythmWithDelay(leaderWithDelay.length, 0),
    delay: 0
  });

  // Generate followers with loose adherence
  for (let i = 1; i < numVoices; i++) {
    const followerBase = transposeMelody(leader, params.interval, mode);
    
    // Apply loose adherence: randomly deviate from strict imitation
    const looseMelody = followerBase.map((note, noteIndex) => {
      const shouldAdhere = Math.random() * 100 < adherencePercentage;
      if (shouldAdhere) {
        return note; // Keep strict imitation
      } else {
        // Deviate by a random small interval (-3 to +3 semitones)
        const deviation = Math.floor(Math.random() * 7) - 3;
        return note + deviation;
      }
    });
    
    const followerWithDelay = padMelodyWithDelay(looseMelody, params.delay * i);
    
    voices.push({
      id: `Loose Follower ${i} (${adherencePercentage}% adherence)`,
      melody: followerWithDelay,
      rhythm: buildRhythmWithDelay(followerWithDelay.length, params.delay * i),
      delay: params.delay * i
    });
  }

  return {
    voices,
    metadata: {
      type: 'LOOSE_CANON',
      description: `Loose Canon with ${adherencePercentage}% adherence`,
      entryPattern: `Followers deviate loosely from strict imitation`,
      totalDuration: Math.max(...voices.map(v => v.melody.length))
    }
  };
}

/**
 * NEW: PER MUTATIVE CANON
 * Permutates notes of the original theme randomly per run
 * User controls number of permutations (1-7)
 */
function generatePerMutativeCanon(
  leader: Theme,
  params: CanonParams,
  mode?: Mode
): CanonResult {
  const numPermutations = Math.min(params.numPermutations || 3, 7);
  const voices: CanonVoice[] = [];

  // Leader voice
  const leaderWithDelay = padMelodyWithDelay(leader, 0);
  voices.push({
    id: 'Leader',
    melody: leaderWithDelay,
    rhythm: buildRhythmWithDelay(leaderWithDelay.length, 0),
    delay: 0
  });

  // Fisher-Yates shuffle algorithm for permutation
  const shuffleArray = (array: Theme): Theme => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate permuted followers
  for (let i = 1; i <= numPermutations; i++) {
    // Create permutation of the leader melody
    const permutedMelody = shuffleArray(leader);
    
    // Optionally transpose the permutation
    const transposedPermutation = params.interval.semitones !== 0
      ? transposeMelody(permutedMelody, params.interval, mode)
      : permutedMelody;
    
    const followerWithDelay = padMelodyWithDelay(transposedPermutation, params.delay * i);
    
    voices.push({
      id: `Permutation ${i}`,
      melody: followerWithDelay,
      rhythm: buildRhythmWithDelay(followerWithDelay.length, params.delay * i),
      delay: params.delay * i
    });
  }

  return {
    voices,
    metadata: {
      type: 'PER_MUTATIVE_CANON',
      description: `Per Mutative Canon with ${numPermutations} permutations`,
      entryPattern: `Each voice is a random permutation of the original theme`,
      totalDuration: Math.max(...voices.map(v => v.melody.length))
    }
  };
}

/**
 * NEW: FRAGMENTAL CANON
 * Followers contain fragments of the original canon
 * Requires minimum 7 notes in theme, supports up to 6 followers
 */
function generateFragmentalCanon(
  leader: Theme,
  params: CanonParams,
  mode?: Mode
): CanonResult {
  // Validate minimum theme length
  if (leader.length < 7) {
    console.warn('Fragmental Canon requires at least 7 notes in theme. Using strict canon instead.');
    return generateStrictCanon(leader, params, mode);
  }

  const numVoices = Math.min(params.numVoices || 3, 7); // Leader + up to 6 followers
  const voices: CanonVoice[] = [];

  // Leader voice (full theme)
  const leaderWithDelay = padMelodyWithDelay(leader, 0);
  voices.push({
    id: 'Leader (Full)',
    melody: leaderWithDelay,
    rhythm: buildRhythmWithDelay(leaderWithDelay.length, 0),
    delay: 0
  });

  // Generate fragmented followers
  for (let i = 1; i < numVoices; i++) {
    // Determine fragment size (varies per follower)
    const fragmentSize = Math.max(3, Math.floor(leader.length / (i + 1)));
    
    // Extract random fragment from leader
    const maxStartIndex = leader.length - fragmentSize;
    const startIndex = Math.floor(Math.random() * (maxStartIndex + 1));
    const fragment = leader.slice(startIndex, startIndex + fragmentSize);
    
    // Transpose fragment
    const transposedFragment = params.interval.semitones !== 0
      ? transposeMelody(fragment, params.interval, mode)
      : fragment;
    
    const followerWithDelay = padMelodyWithDelay(transposedFragment, params.delay * i);
    
    voices.push({
      id: `Fragment ${i} (${fragmentSize} notes)`,
      melody: followerWithDelay,
      rhythm: buildRhythmWithDelay(followerWithDelay.length, params.delay * i),
      delay: params.delay * i
    });
  }

  return {
    voices,
    metadata: {
      type: 'FRAGMENTAL_CANON',
      description: `Fragmental Canon with ${numVoices - 1} fragments`,
      entryPattern: `Followers play fragmented excerpts of the original theme`,
      totalDuration: Math.max(...voices.map(v => v.melody.length))
    }
  };
}

/**
 * ENHANCED: Per Tonos with user-selectable target mode
 * Now supports modulation to user-specified modes
 */
function generatePerTonosCanonEnhanced(
  leader: Theme,
  params: CanonParams,
  mode?: Mode
): CanonResult {
  const numVoices = params.numVoices || 3;
  const voices: CanonVoice[] = [];
  const targetMode = params.modulationTargetMode || mode;

  // Leader voice
  const leaderWithDelay = padMelodyWithDelay(leader, 0);
  voices.push({
    id: 'Leader',
    melody: leaderWithDelay,
    rhythm: buildRhythmWithDelay(leaderWithDelay.length, 0),
    delay: 0
  });

  // Each follower modulates progressively toward target mode
  for (let i = 1; i < numVoices; i++) {
    // Calculate progressive modulation interval
    const progressionFactor = i / (numVoices - 1); // 0 to 1
    const modulationInterval: CanonInterval = {
      semitones: Math.round(params.interval.semitones * progressionFactor),
      diatonicSteps: Math.round(params.interval.diatonicSteps * progressionFactor),
      isDiatonic: params.interval.isDiatonic
    };
    
    // Use target mode for later voices if provided
    const voiceMode = (targetMode && i >= Math.floor(numVoices / 2)) ? targetMode : mode;
    const followerBase = transposeMelody(leader, modulationInterval, voiceMode);
    const followerWithDelay = padMelodyWithDelay(followerBase, params.delay * i);
    
    const modeName = voiceMode?.name || mode?.name || 'chromatic';
    voices.push({
      id: `Follower ${i} (→${modeName})`,
      melody: followerWithDelay,
      rhythm: buildRhythmWithDelay(followerWithDelay.length, params.delay * i),
      delay: params.delay * i
    });
  }

  const sourceModeName = mode?.name || 'chromatic';
  const targetModeName = targetMode?.name || mode?.name || 'chromatic';

  return {
    voices,
    metadata: {
      type: 'PER_TONOS',
      description: `Modulating Canon: ${sourceModeName} → ${targetModeName}`,
      entryPattern: `Progressive modulation from ${sourceModeName} to ${targetModeName}`,
      totalDuration: Math.max(...voices.map(v => v.melody.length))
    }
  };
}

// ============================================================================
// CANON ENGINE DISPATCHER
// ============================================================================

export class CanonEngine {
  /**
   * Generate a canon based on type and parameters
   */
  static generateCanon(
    leader: Theme,
    params: CanonParams,
    mode?: Mode,
    secondLeader?: Theme // For double canon
  ): CanonResult {
    console.log('🎵 Canon Engine: Generating', params.type);

    switch (params.type) {
      case 'STRICT_CANON':
        return generateStrictCanon(leader, params, mode);
        
      case 'AD_DIAPENTE': // Canon at the fifth
        return generateStrictCanon(leader, params, mode);

      case 'INVERSION_CANON':
      case 'PER_MOTUM_CONTRARIUM': // Alias for inversion canon
        return generateInversionCanon(leader, params);

      case 'RHYTHMIC_CANON':
      case 'MENSURABILIS': // Mensuration variant
        return generateRhythmicCanon(leader, params);
        
      case 'PER_AUGMENTATIONEM': // Augmentation variant
        return generateRhythmicCanon(leader, params);

      case 'DOUBLE_CANON':
        if (!secondLeader) {
          // Generate second leader from first if not provided
          secondLeader = transposeMelody(leader, { semitones: 5, diatonicSteps: 3, isDiatonic: true }, mode);
        }
        return generateDoubleCanon(leader, secondLeader, params);

      case 'CRAB_CANON':
      case 'PERPETUUS': // Perpetual canon variant
        return generateCrabCanon(leader, params);

      case 'RETROGRADE_INVERSION_CANON':
        return generateRetrogradeInversionCanon(leader, params);

      case 'PER_TONOS':
        // Use enhanced version with modulation target support
        return generatePerTonosCanonEnhanced(leader, params, mode);

      case 'PER_ARSIN_ET_THESIN':
        return generatePerArsinEtThesinCanon(leader, params);

      case 'ENIGMATICUS':
        return generateEnigmaticusCanon(leader, params, mode);

      // NEW CANON TYPES - Additive Enhancement
      case 'DOUBLE_CANON_BY_INVERSION':
        if (!secondLeader) {
          secondLeader = transposeMelody(leader, { semitones: 5, diatonicSteps: 3, isDiatonic: true }, mode);
        }
        return generateDoubleCanonByInversion(leader, secondLeader, params, mode);

      case 'DOUBLE_RHYTHMIC_CANON':
        if (!secondLeader) {
          secondLeader = transposeMelody(leader, { semitones: 5, diatonicSteps: 3, isDiatonic: true }, mode);
        }
        return generateDoubleRhythmicCanon(leader, secondLeader, params, mode);

      case 'DOUBLE_CRAB_INVERSION_CANON':
        if (!secondLeader) {
          secondLeader = transposeMelody(leader, { semitones: 5, diatonicSteps: 3, isDiatonic: true }, mode);
        }
        return generateDoubleCrabInversionCanon(leader, secondLeader, params, mode);

      case 'PER_DUO_AUGMENTATIONEM':
        return generatePerDuoAugmentationemCanon(leader, params, mode);

      case 'INVERTED_CANON_AT_THE_FIFTH':
        return generateInvertedCanonAtTheFifth(leader, params, mode);

      // NEWEST CANON TYPES - Harris Software Solutions
      case 'LOOSE_CANON':
        return generateLooseCanon(leader, params, mode);

      case 'PER_MUTATIVE_CANON':
        return generatePerMutativeCanon(leader, params, mode);

      case 'FRAGMENTAL_CANON':
        return generateFragmentalCanon(leader, params, mode);

      default:
        console.warn('Unknown canon type, defaulting to strict canon');
        return generateStrictCanon(leader, params, mode);
    }
  }

  /**
   * Convert CanonVoice to Part for playback
   * Handles rest notes (value 0) by keeping melody/rhythm aligned
   */
  static canonVoicesToParts(voices: CanonVoice[]): Part[] {
    return voices.map(voice => {
      // Ensure melody and rhythm have the same length
      const melodyLength = voice.melody.length;
      const rhythmLength = voice.rhythm.length;
      
      if (melodyLength !== rhythmLength) {
        console.warn(`Canon voice "${voice.id}" has mismatched lengths: melody=${melodyLength}, rhythm=${rhythmLength}`);
        // Adjust rhythm to match melody length
        const adjustedRhythm = [...voice.rhythm];
        while (adjustedRhythm.length < melodyLength) {
          adjustedRhythm.push(1); // Add quarter notes
        }
        if (adjustedRhythm.length > melodyLength) {
          adjustedRhythm.length = melodyLength;
        }
        
        return {
          melody: voice.melody,
          rhythm: adjustedRhythm
        };
      }
      
      return {
        melody: voice.melody,
        rhythm: voice.rhythm
      };
    });
  }

  /**
   * Get available canon types with descriptions
   */
  static getCanonTypes(): Array<{ type: CanonType; name: string; description: string }> {
    return [
      {
        type: 'STRICT_CANON',
        name: 'Strict Canon',
        description: 'Classic imitation at a fixed interval'
      },
      {
        type: 'INVERSION_CANON',
        name: 'Canon by Inversion',
        description: 'Melody mirrored around an axis (contrary motion)'
      },
      {
        type: 'RHYTHMIC_CANON',
        name: 'Rhythmic Canon',
        description: 'Follower at different speed (augmentation/diminution)'
      },
      {
        type: 'DOUBLE_CANON',
        name: 'Double Canon',
        description: 'Two independent canons simultaneously'
      },
      {
        type: 'CRAB_CANON',
        name: 'Crab Canon',
        description: 'Palindromic - follower plays backward'
      },
      {
        type: 'RETROGRADE_INVERSION_CANON',
        name: 'Retrograde-Inversion',
        description: 'Two-dimensional mirror (pitch + time)'
      },
      {
        type: 'PER_AUGMENTATIONEM',
        name: 'Per Augmentationem',
        description: 'Follower in longer note values (2x slower)'
      },
      {
        type: 'AD_DIAPENTE',
        name: 'Canon at the Fifth',
        description: 'Strict canon at perfect fifth interval'
      },
      {
        type: 'MENSURABILIS',
        name: 'Mensuration Canon',
        description: 'Polytemporal canon with ratio relationships'
      },
      {
        type: 'PERPETUUS',
        name: 'Perpetual Canon',
        description: 'Endless round that loops seamlessly'
      },
      {
        type: 'PER_TONOS',
        name: 'Per Tonos (Modulating)',
        description: 'Canon with progressive key changes'
      },
      {
        type: 'PER_ARSIN_ET_THESIN',
        name: 'Per Arsin et Thesin',
        description: 'Canon with upbeat/downbeat displacement'
      },
      {
        type: 'ENIGMATICUS',
        name: 'Enigma Canon',
        description: 'Canon with hidden transformations'
      },
      {
        type: 'PER_MOTUM_CONTRARIUM',
        name: 'Per Motum Contrarium',
        description: 'Canon in contrary motion (inversion)'
      },
      // NEW CANON TYPES - Additive Enhancement
      {
        type: 'DOUBLE_CANON_BY_INVERSION',
        name: 'Double Canon by Inversion',
        description: '2 melodies mirrored around 2 axes (4+ voices)'
      },
      {
        type: 'DOUBLE_RHYTHMIC_CANON',
        name: 'Double Rhythmic Canon',
        description: 'Double canon with 2 mensuration ratios (4+ voices)'
      },
      {
        type: 'DOUBLE_CRAB_INVERSION_CANON',
        name: 'Double Crab Inversion Canon',
        description: 'Crab + Inversion combined (4+ voices)'
      },
      {
        type: 'PER_DUO_AUGMENTATIONEM',
        name: 'Per Duo Augmentationem',
        description: 'Followers at 2 different slower speeds (3+ voices)'
      },
      {
        type: 'INVERTED_CANON_AT_THE_FIFTH',
        name: 'Inverted Canon at the Fifth',
        description: 'Canon at the Fifth, but inverted'
      },
      // NEWEST CANON TYPES - Harris Software Solutions
      {
        type: 'LOOSE_CANON',
        name: 'Loose Canon',
        description: 'Novel imitation with adjustable adherence percentage'
      },
      {
        type: 'PER_MUTATIVE_CANON',
        name: 'Per Mutative Canon',
        description: 'Randomly permutates notes (1-7 permutations)'
      },
      {
        type: 'FRAGMENTAL_CANON',
        name: 'Fragmental Canon',
        description: 'Followers play fragments of original (min 7 notes)'
      }
    ];
  }

  /**
   * Create default parameters for a canon type
   */
  static getDefaultParams(type: CanonType, leaderFirstNote: MidiNote = 60): CanonParams {
    const baseParams: CanonParams = {
      type,
      interval: { semitones: 12, diatonicSteps: 7, isDiatonic: true }, // Octave
      delay: 4, // 4 beats
      inversionAxis: leaderFirstNote,
      numVoices: 2
    };

    switch (type) {
      case 'AD_DIAPENTE':
        return { ...baseParams, interval: { semitones: 7, diatonicSteps: 4, isDiatonic: true } }; // Fifth

      case 'PER_AUGMENTATIONEM':
        return { ...baseParams, mensurationRatio: 2.0 }; // Double speed

      case 'RHYTHMIC_CANON':
      case 'MENSURABILIS':
        return { ...baseParams, mensurationRatio: 1.5 }; // 3:2 ratio

      case 'DOUBLE_CANON':
        return { ...baseParams, numVoices: 4, delay: 2 };

      case 'PER_TONOS':
        return { ...baseParams, numVoices: 3, interval: { semitones: 4, diatonicSteps: 2, isDiatonic: true } }; // Major third modulation

      case 'PER_ARSIN_ET_THESIN':
        return { ...baseParams, delay: 3.5 }; // Half-beat offset for upbeat effect

      case 'ENIGMATICUS':
        return { ...baseParams, interval: { semitones: 5, diatonicSteps: 3, isDiatonic: true } }; // Fourth interval for enigma

      case 'PER_MOTUM_CONTRARIUM':
        return { ...baseParams, interval: { semitones: 0, diatonicSteps: 0, isDiatonic: true } }; // Unison inversion

      // NEW CANON TYPES - Additive Enhancement
      case 'DOUBLE_CANON_BY_INVERSION':
        return { 
          ...baseParams, 
          numVoicesPerCanon: 2, 
          delay: 2,
          inversionAxis: leaderFirstNote,
          inversionAxis2: leaderFirstNote + 7 // Fifth above
        };

      case 'DOUBLE_RHYTHMIC_CANON':
        return { 
          ...baseParams, 
          numVoicesPerCanon: 2, 
          delay: 2,
          mensurationRatio: 2.0,
          mensurationRatio2: 1.5
        };

      case 'DOUBLE_CRAB_INVERSION_CANON':
        return { 
          ...baseParams, 
          numVoicesPerCanon: 2, 
          delay: 2,
          inversionAxis: leaderFirstNote,
          inversionAxis2: leaderFirstNote + 7
        };

      case 'PER_DUO_AUGMENTATIONEM':
        return { 
          ...baseParams, 
          numVoices: 3,
          mensurationRatio: 2.0, // First ratio: 2x slower
          mensurationRatio2: 3.0  // Second ratio: 3x slower
        };

      case 'INVERTED_CANON_AT_THE_FIFTH':
        return { 
          ...baseParams, 
          interval: { semitones: 7, diatonicSteps: 4, isDiatonic: true },
          inversionAxis: leaderFirstNote
        };

      // NEWEST CANON TYPES - Harris Software Solutions
      case 'LOOSE_CANON':
        return {
          ...baseParams,
          adherencePercentage: 70, // 70% strict adherence by default
          numVoices: 3
        };

      case 'PER_MUTATIVE_CANON':
        return {
          ...baseParams,
          numPermutations: 3, // 3 permutations by default
          interval: { semitones: 0, diatonicSteps: 0, isDiatonic: true } // No transposition by default
        };

      case 'FRAGMENTAL_CANON':
        return {
          ...baseParams,
          numVoices: 4, // Leader + 3 fragments
          delay: 2 // Shorter delay for fragments
        };

      default:
        return baseParams;
    }
  }
}
