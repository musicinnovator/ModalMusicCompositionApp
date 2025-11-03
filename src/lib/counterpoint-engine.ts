import { Theme, Mode, MidiNote, RhythmicNote, NoteValue, CounterpointVoice, createRhythmicNote, melodyToRhythmicNotes, rhythmicNotesToMelody, calculateSpeciesRatio } from '../types/musical';

// Counterpoint technique types
export type CounterpointTechnique = 
  | 'retrograde' 
  | 'inversion' 
  | 'truncation' 
  | 'elision' 
  | 'diminution' 
  | 'augmentation' 
  | 'fragmentation' 
  | 'sequence' 
  | 'ornamentation' 
  | 'interpolation' 
  | 'transposition' 
  | 'modeShifting';

// Appoggiatura types for ornamentation
export type AppoggiaturaType = 
  | 'step-above'       // 1 whole step above
  | 'step-below'       // 1 whole step below
  | 'halfstep-above'   // 1 half step above
  | 'halfstep-below';  // 1 half step below

// User-defined ornament pattern
export interface OrnamentPattern {
  id: string;
  name: string;
  pattern: number[];  // Interval pattern (semitones from principal note)
}

export type CounterpointCombination = 
  | 'retrograde-inversion' 
  | 'diminution-sequence' 
  | 'augmentation-inversion' 
  | 'fragmentation-transposition' 
  | 'ornamentation-sequence' 
  | 'truncation-mode-shifting';

export type TextureType = 'rough' | 'smooth' | 'simple' | 'complex' | 'dense' | 'sparse';
export type SpeciesType = 'first' | 'second' | 'third' | 'fourth' | 'fifth';
export type MotionType = 'contrary' | 'similar' | 'parallel' | 'oblique';

// Interval classifications
export interface IntervalInfo {
  semitones: number;
  name: string;
  abbreviation: string;
  consonant: boolean;
}

// Non-chord tone types
export type NCTType = 'PT' | 'NT' | 'DNT' | 'Sus' | 'R' | 'Ant' | 'PedTn' | 'App' | 'ET' | 'C';

export interface CounterpointParameters {
  transpositionInterval: number;
  sequenceInterval: number;
  sequenceRepetitions: number;
  ornamentationDensity: number; // 0-1
  fragmentSize: number;
  enableConsonanceCheck: boolean;
  enableVoiceLeading: boolean;
  targetTexture: TextureType;
  // Rhythmic parameters
  useRhythm: boolean;
  cantusFirmusDuration: NoteValue;
  targetSpeciesRatio: '1:1' | '2:1' | '3:1' | '4:1' | '5:1';
  allowSyncopation: boolean;
  enableRhythmicVariety: boolean;
  // Inversion parameters
  inversionAxis?: number; // MIDI note to use as axis (default: first note)
  inversionAxisType?: 'first' | 'last' | 'middle' | 'custom'; // Axis selection method
  // Ornamentation parameters
  appoggiaturaType?: AppoggiaturaType;
  customOrnamentPattern?: OrnamentPattern;
  // Mode Shifting parameters
  targetMode?: Mode; // Target mode for mode shifting transformation
  // Diminution/Augmentation parameters
  diminutionMode?: 'strictly' | 'loose' | 'percentage'; // How to apply diminution
  diminutionPercentage?: number; // Percentage of notes to diminish (0-100)
  augmentationMode?: 'strictly' | 'loose' | 'percentage'; // How to apply augmentation
  augmentationPercentage?: number; // Percentage of notes to augment (0-100)
}

export class CounterpointEngine {
  // Interval classification system
  private static readonly INTERVALS: IntervalInfo[] = [
    { semitones: 0, name: 'Unison', abbreviation: 'P1', consonant: true },
    { semitones: 1, name: 'Minor Second', abbreviation: 'm2', consonant: false },
    { semitones: 2, name: 'Major Second', abbreviation: 'M2', consonant: false },
    { semitones: 3, name: 'Minor Third', abbreviation: 'm3', consonant: true },
    { semitones: 4, name: 'Major Third', abbreviation: 'M3', consonant: true },
    { semitones: 5, name: 'Perfect Fourth', abbreviation: 'P4', consonant: false },
    { semitones: 6, name: 'Augmented Fourth/Diminished Fifth', abbreviation: 'A4/d5', consonant: false },
    { semitones: 7, name: 'Perfect Fifth', abbreviation: 'P5', consonant: true },
    { semitones: 8, name: 'Minor Sixth', abbreviation: 'm6', consonant: true },
    { semitones: 9, name: 'Major Sixth', abbreviation: 'M6', consonant: true },
    { semitones: 10, name: 'Minor Seventh', abbreviation: 'm7', consonant: false },
    { semitones: 11, name: 'Major Seventh', abbreviation: 'M7', consonant: false },
    { semitones: 12, name: 'Perfect Octave', abbreviation: 'P8', consonant: true }
  ];

  /**
   * Main counterpoint generation function
   * ENHANCED: Now applies texture, consonance, and voice leading post-processing
   */
  static generateCounterpoint(
    theme: Theme,
    technique: CounterpointTechnique,
    mode: Mode,
    parameters: CounterpointParameters
  ): Theme {
    if (!theme || theme.length === 0) return [];

    // If rhythm is enabled, use rhythmic counterpoint generation
    if (parameters.useRhythm) {
      return this.generateRhythmicCounterpoint(theme, technique, mode, parameters);
    }

    // Generate the base counterpoint using the selected technique
    let result: Theme;
    switch (technique) {
      case 'retrograde':
        result = this.generateRetrograde(theme);
        break;
      case 'inversion':
        result = this.generateInversion(theme, mode, parameters);
        break;
      case 'truncation':
        result = this.generateTruncation(theme, parameters);
        break;
      case 'elision':
        result = this.generateElision(theme);
        break;
      case 'diminution':
        result = this.generateDiminution(theme, parameters);
        break;
      case 'augmentation':
        result = this.generateAugmentation(theme, parameters);
        break;
      case 'fragmentation':
        result = this.generateFragmentation(theme, parameters);
        break;
      case 'sequence':
        result = this.generateSequence(theme, parameters);
        break;
      case 'ornamentation':
        result = this.generateOrnamentation(theme, mode, parameters);
        break;
      case 'interpolation':
        result = this.generateInterpolation(theme, mode, parameters);
        break;
      case 'transposition':
        result = this.generateTransposition(theme, parameters);
        break;
      case 'modeShifting':
        result = this.generateModeShifting(theme, mode, parameters);
        break;
      default:
        result = theme;
    }

    // ADDITIVE FIX: Apply post-processing filters based on parameters
    result = this.applyCounterpointPostProcessing(result, theme, mode, parameters);

    return result;
  }

  /**
   * ADDITIVE: Apply post-processing to counterpoint based on parameters
   * This ensures texture, consonance, and voice leading parameters actually affect the output
   */
  private static applyCounterpointPostProcessing(
    counterpoint: Theme,
    originalTheme: Theme,
    mode: Mode,
    parameters: CounterpointParameters
  ): Theme {
    let processed = counterpoint;

    // Apply texture constraints if specified
    if (parameters.targetTexture) {
      console.log('🎨 Applying texture:', parameters.targetTexture);
      processed = this.applyTexture(processed, parameters.targetTexture);
    }

    // Apply consonance check if enabled
    if (parameters.enableConsonanceCheck && originalTheme.length > 0) {
      console.log('✓ Applying consonance check');
      processed = this.applyConsonanceFiltering(processed, originalTheme);
    }

    // Apply voice leading constraints if enabled
    if (parameters.enableVoiceLeading) {
      console.log('➜ Applying voice leading rules');
      processed = this.applyVoiceLeadingRules(processed);
    }

    return processed;
  }

  /**
   * ADDITIVE: Filter counterpoint to ensure consonant relationships with cantus firmus
   */
  private static applyConsonanceFiltering(counterpoint: Theme, cantusFirmus: Theme): Theme {
    const filtered: Theme = [];
    const consonantIntervals = [0, 3, 4, 5, 7, 8, 9, 12]; // Unison, m3, M3, P4, P5, m6, M6, P8

    for (let i = 0; i < counterpoint.length; i++) {
      let note = counterpoint[i];
      const cfIndex = Math.min(i, cantusFirmus.length - 1);
      const cfNote = cantusFirmus[cfIndex];
      
      // Check if current interval is consonant
      const interval = Math.abs(note - cfNote) % 12;
      
      if (!consonantIntervals.includes(interval)) {
        // Adjust to nearest consonant interval
        const adjustments = [-1, 1, -2, 2]; // Try small adjustments first
        let adjusted = false;
        
        for (const adj of adjustments) {
          const testNote = note + adj;
          const testInterval = Math.abs(testNote - cfNote) % 12;
          
          if (consonantIntervals.includes(testInterval)) {
            note = Math.max(24, Math.min(96, testNote));
            adjusted = true;
            break;
          }
        }
        
        if (!adjusted) {
          // Fall back to nearest consonant interval
          note = cfNote + consonantIntervals[Math.floor(Math.random() * consonantIntervals.length)];
          note = Math.max(24, Math.min(96, note));
        }
      }
      
      filtered.push(note);
    }

    return filtered;
  }

  /**
   * ADDITIVE: Apply voice leading rules to ensure smooth melodic motion
   */
  private static applyVoiceLeadingRules(counterpoint: Theme): Theme {
    if (counterpoint.length < 2) return counterpoint;

    const smooth: Theme = [counterpoint[0]];
    const MAX_LEAP = 7; // Maximum allowed leap (perfect fifth)
    const STEP_AFTER_LEAP = 3; // Maximum step after a leap

    for (let i = 1; i < counterpoint.length; i++) {
      let currentNote = counterpoint[i];
      const prevNote = smooth[i - 1];
      const leap = Math.abs(currentNote - prevNote);

      // If leap is too large, reduce it
      if (leap > MAX_LEAP) {
        const direction = Math.sign(currentNote - prevNote);
        currentNote = prevNote + (direction * MAX_LEAP);
        currentNote = Math.max(24, Math.min(96, currentNote));
      }

      // After a large leap, prefer stepwise motion in opposite direction
      if (i > 1) {
        const prevLeap = Math.abs(smooth[i - 1] - smooth[i - 2]);
        if (prevLeap > 4) { // If previous was a leap
          const prevDirection = Math.sign(smooth[i - 1] - smooth[i - 2]);
          const currentDirection = Math.sign(currentNote - smooth[i - 1]);
          
          // Encourage contrary motion after leaps
          if (prevDirection === currentDirection && Math.abs(currentNote - smooth[i - 1]) > STEP_AFTER_LEAP) {
            // Move by step in opposite direction instead
            currentNote = smooth[i - 1] - (prevDirection * 2);
            currentNote = Math.max(24, Math.min(96, currentNote));
          }
        }
      }

      smooth.push(currentNote);
    }

    return smooth;
  }

  /**
   * Generate rhythmic counterpoint with proper species relationships
   */
  static generateRhythmicCounterpoint(
    theme: Theme,
    technique: CounterpointTechnique,
    mode: Mode,
    parameters: CounterpointParameters
  ): Theme {
    // Convert theme to rhythmic notes
    const rhythmicTheme = melodyToRhythmicNotes(theme, parameters.cantusFirmusDuration);
    
    // CRITICAL FIX: For transformational techniques (retrograde, inversion, transposition, modeShifting), 
    // apply them directly to the ORIGINAL theme, not to a generated counterpoint voice.
    // The user expects the original melody to be transformed, not a new melody to be generated and then transformed.
    const isTransformationalTechnique = ['retrograde', 'inversion', 'transposition', 'modeShifting'].includes(technique);
    
    let processedVoice: RhythmicNote[];
    
    if (isTransformationalTechnique) {
      // For transformational techniques: transform the ORIGINAL theme directly
      switch (technique) {
        case 'retrograde':
          // Reverse the original theme (melody in reverse order, same durations)
          processedVoice = this.applyRetrogradeToRhythmic(rhythmicTheme);
          console.log('🔄 RETROGRADE FIX: Original theme reversed directly');
          console.log('   Input theme:', rhythmicTheme.map(n => n.midi));
          console.log('   Output (reversed):', processedVoice.map(n => n.midi));
          break;
        case 'inversion':
          // Invert the original theme (pitch inversion, same durations)
          processedVoice = this.applyInversionToRhythmic(rhythmicTheme, mode, parameters);
          console.log('🔄 INVERSION FIX: Original theme inverted directly');
          break;
        case 'transposition':
          // Transpose the original theme (pitch shifted, same durations)
          processedVoice = this.applyTranspositionToRhythmic(rhythmicTheme, parameters);
          console.log('🎵 TRANSPOSITION: Original theme transposed directly');
          console.log('   Input theme:', rhythmicTheme.map(n => n.midi));
          console.log('   Transposition interval:', parameters.transpositionInterval);
          console.log('   Output (transposed):', processedVoice.map(n => n.midi));
          break;
        case 'modeShifting':
          // Shift the original theme to a different mode (pitch adapted, same durations)
          processedVoice = this.applyModeShiftingToRhythmic(rhythmicTheme, mode, parameters);
          console.log('🎵 MODE SHIFTING: Original theme shifted to new mode directly');
          console.log('   Input theme:', rhythmicTheme.map(n => n.midi));
          console.log('   Target mode:', parameters.targetMode?.name || mode.name);
          console.log('   Output (shifted):', processedVoice.map(n => n.midi));
          break;
        default:
          processedVoice = rhythmicTheme;
      }
    } else {
      // For counterpoint generation techniques: generate a new counterpoint voice FIRST,
      // then apply transformations to that generated voice
      const counterpointVoice = this.generateSpeciesCounterpointRhythmic(
        rhythmicTheme,
        parameters.targetSpeciesRatio,
        mode,
        parameters
      );

      processedVoice = counterpointVoice.melody;

      // Apply technique transformations to the generated counterpoint voice
      switch (technique) {
        case 'diminution':
          processedVoice = this.applyDiminutionToRhythmic(processedVoice, parameters);
          break;
        case 'augmentation':
          processedVoice = this.applyAugmentationToRhythmic(processedVoice, parameters);
          break;
        case 'sequence':
          processedVoice = this.applySequenceToRhythmic(processedVoice, parameters);
          break;
        default:
          // Apply basic technique then convert back to rhythmic
          const basicResult = this.generateCounterpoint(
            rhythmicNotesToMelody(processedVoice), 
            technique, 
            mode, 
            { ...parameters, useRhythm: false }
          );
          processedVoice = melodyToRhythmicNotes(basicResult, parameters.cantusFirmusDuration);
          break;
      }
    }

    // Convert back to simple melody for compatibility
    let result = rhythmicNotesToMelody(processedVoice);
    
    // ADDITIVE FIX: Apply post-processing filters to rhythmic counterpoint as well
    result = this.applyCounterpointPostProcessing(result, theme, mode, parameters);
    
    return result;
  }

  /**
   * Generate combined counterpoint techniques
   * ENHANCED: Now applies post-processing to combined techniques
   */
  static generateCombinedCounterpoint(
    theme: Theme,
    combination: CounterpointCombination,
    mode: Mode,
    parameters: CounterpointParameters
  ): Theme {
    let result: Theme;
    
    switch (combination) {
      case 'retrograde-inversion':
        const retrograde = this.generateRetrograde(theme);
        result = this.generateInversion(retrograde, mode, parameters);
        break;
      
      case 'diminution-sequence':
        const diminished = this.generateDiminution(theme, parameters);
        result = this.generateSequence(diminished, parameters);
        break;
      
      case 'augmentation-inversion':
        const augmented = this.generateAugmentation(theme, parameters);
        result = this.generateInversion(augmented, mode, parameters);
        break;
      
      case 'fragmentation-transposition':
        const fragmented = this.generateFragmentation(theme, parameters);
        result = this.generateTransposition(fragmented, parameters);
        break;
      
      case 'ornamentation-sequence':
        const ornamented = this.generateOrnamentation(theme, mode, parameters);
        result = this.generateSequence(ornamented, parameters);
        break;
      
      case 'truncation-mode-shifting':
        const truncated = this.generateTruncation(theme, parameters);
        result = this.generateModeShifting(truncated, mode, parameters);
        break;
      
      default:
        result = theme;
    }

    // ADDITIVE FIX: Apply post-processing to combined techniques
    result = this.applyCounterpointPostProcessing(result, theme, mode, parameters);
    
    return result;
  }

  /**
   * Generate species counterpoint
   * ENHANCED: Now applies post-processing to species counterpoint
   */
  static generateSpeciesCounterpoint(
    theme: Theme,
    species: SpeciesType,
    mode: Mode,
    parameters: CounterpointParameters
  ): Theme {
    let result: Theme;
    
    switch (species) {
      case 'first':
        result = this.generateFirstSpecies(theme, mode, parameters);
        break;
      case 'second':
        result = this.generateSecondSpecies(theme, mode, parameters);
        break;
      case 'third':
        result = this.generateThirdSpecies(theme, mode, parameters);
        break;
      case 'fourth':
        result = this.generateFourthSpecies(theme, mode, parameters);
        break;
      case 'fifth':
        result = this.generateFloridCounterpoint(theme, mode, parameters);
        break;
      default:
        result = theme;
    }

    // ADDITIVE FIX: Apply post-processing to species counterpoint
    result = this.applyCounterpointPostProcessing(result, theme, mode, parameters);
    
    return result;
  }

  // Individual technique implementations

  /**
   * Retrograde: melody played backwards in time
   */
  private static generateRetrograde(theme: Theme): Theme {
    console.log('🔄 RETROGRADE: Input theme:', theme);
    const reversed = [...theme].reverse();
    console.log('🔄 RETROGRADE: Output (reversed):', reversed);
    console.log('🔄 RETROGRADE: Verification - first becomes last:', 
      `${theme[0]} → ${reversed[reversed.length - 1]}`,
      'match:', theme[0] === reversed[reversed.length - 1]
    );
    return reversed;
  }

  /**
   * Inversion: intervals inverted around a central axis
   * Now supports custom axis selection
   */
  private static generateInversion(theme: Theme, mode: Mode, parameters?: CounterpointParameters): Theme {
    if (theme.length < 2) return theme;

    // Determine axis based on parameters
    let axis: number;
    if (parameters?.inversionAxis !== undefined) {
      // Use custom axis if provided
      axis = parameters.inversionAxis;
      console.log('🔃 INVERSION: Using CUSTOM axis:', axis);
    } else if (parameters?.inversionAxisType) {
      // Use axis type
      switch (parameters.inversionAxisType) {
        case 'first':
          axis = theme[0];
          break;
        case 'last':
          axis = theme[theme.length - 1];
          break;
        case 'middle':
          const midIndex = Math.floor(theme.length / 2);
          axis = theme[midIndex];
          break;
        default:
          axis = theme[0];
      }
      console.log('🔃 INVERSION: Using', parameters.inversionAxisType.toUpperCase(), 'note as axis:', axis);
    } else {
      // Default to first note
      axis = theme[0];
      console.log('🔃 INVERSION: Using DEFAULT (first note) as axis:', axis);
    }

    console.log('🔃 INVERSION: Input theme:', theme);
    console.log('🔃 INVERSION: Axis note (MIDI):', axis);

    const inverted: Theme = [];

    // Invert each note around the axis
    for (let i = 0; i < theme.length; i++) {
      const originalNote = theme[i];
      const distanceFromAxis = originalNote - axis;
      const invertedNote = axis - distanceFromAxis; // Mirror across axis
      
      // Constrain to reasonable MIDI range
      const constrainedNote = Math.max(24, Math.min(96, invertedNote));
      inverted.push(constrainedNote);
      
      if (i < 3 || i === theme.length - 1) {
        console.log(`🔃 INVERSION: Note ${i}: ${originalNote} → distance ${distanceFromAxis} → inverted ${invertedNote} → constrained ${constrainedNote}`);
      }
    }

    console.log('🔃 INVERSION: Output (inverted):', inverted);
    return inverted;
  }

  /**
   * Truncation: melody shortened by removing notes
   * FIXED: Now randomly selects notes for removal from the original theme
   */
  private static generateTruncation(theme: Theme, parameters: CounterpointParameters): Theme {
    if (theme.length < 3) return theme; // Can't truncate very short themes
    
    const targetLength = Math.max(2, Math.floor(theme.length * 0.6)); // Keep ~60%, remove ~40%
    const notesToRemove = theme.length - targetLength;
    
    console.log('✂️ TRUNCATION: Original theme length:', theme.length);
    console.log('✂️ TRUNCATION: Target length:', targetLength, '(removing', notesToRemove, 'notes)');
    
    // Create array of indices and randomly select which ones to keep
    const allIndices = Array.from({ length: theme.length }, (_, i) => i);
    
    // Always keep first and last notes for musical coherence
    const keepIndices = new Set([0, theme.length - 1]);
    
    // Randomly select additional notes to keep (excluding first and last)
    const middleIndices = allIndices.slice(1, -1);
    const shuffled = [...middleIndices].sort(() => Math.random() - 0.5);
    const additionalToKeep = targetLength - 2; // Minus first and last
    
    for (let i = 0; i < Math.min(additionalToKeep, shuffled.length); i++) {
      keepIndices.add(shuffled[i]);
    }
    
    // Build truncated theme by keeping selected notes in original order
    const truncated: Theme = allIndices
      .filter(i => keepIndices.has(i))
      .map(i => theme[i]);
    
    console.log('✂️ TRUNCATION: Kept indices:', Array.from(keepIndices).sort((a, b) => a - b));
    console.log('✂️ TRUNCATION: Result length:', truncated.length);
    console.log('✂️ TRUNCATION: Input theme:', theme);
    console.log('✂️ TRUNCATION: Output (truncated):', truncated);
    
    return truncated;
  }

  /**
   * Elision: smooth connection eliminating gaps
   */
  private static generateElision(theme: Theme): Theme {
    const elided: Theme = [];
    
    for (let i = 0; i < theme.length; i++) {
      elided.push(theme[i]);
      
      // Add connecting notes for large intervals
      if (i < theme.length - 1) {
        const interval = Math.abs(theme[i + 1] - theme[i]);
        if (interval > 4) { // Larger than major third
          const direction = theme[i + 1] > theme[i] ? 1 : -1;
          const steps = Math.floor(interval / 2);
          for (let j = 1; j <= steps; j++) {
            elided.push(theme[i] + (direction * j * 2));
          }
        }
      }
    }

    return elided;
  }

  /**
   * Diminution: note values reduced (more notes, faster rhythm)
   * Supports three modes: strictly, loose, and percentage
   */
  private static generateDiminution(theme: Theme, parameters: CounterpointParameters): Theme {
    const mode = parameters.diminutionMode || 'strictly';
    const percentage = parameters.diminutionPercentage || 100;
    
    console.log('🎵 DIMINUTION: Mode =', mode, ', Percentage =', percentage);
    console.log('🎵 DIMINUTION: Original theme:', theme);
    
    const diminished: Theme = [];
    
    for (let i = 0; i < theme.length; i++) {
      let shouldDiminish = false;
      
      // Determine if this note should be diminished based on mode
      switch (mode) {
        case 'strictly':
          shouldDiminish = true;
          break;
        case 'loose':
          shouldDiminish = Math.random() < 0.5; // Random 50% chance
          break;
        case 'percentage':
          shouldDiminish = Math.random() < (percentage / 100);
          break;
      }
      
      // Always add the original note first
      diminished.push(theme[i]);
      
      // Add passing tone if diminishing this note
      if (shouldDiminish && i < theme.length - 1) {
        const interval = theme[i + 1] - theme[i];
        if (Math.abs(interval) <= 4) { // Within major third
          const passingTone = theme[i] + Math.sign(interval) * 1;
          diminished.push(passingTone);
        } else if (Math.abs(interval) > 4) {
          // For larger intervals, add a passing tone closer to the current note
          const passingTone = theme[i] + Math.sign(interval) * 2;
          diminished.push(Math.max(24, Math.min(96, passingTone)));
        }
      }
    }

    console.log('🎵 DIMINUTION: Result:', diminished);
    console.log('🎵 DIMINUTION: Original length:', theme.length, ', New length:', diminished.length);
    return diminished;
  }

  /**
   * Augmentation: note values increased (fewer notes, slower rhythm)
   * Supports three modes: strictly, loose, and percentage
   */
  private static generateAugmentation(theme: Theme, parameters: CounterpointParameters): Theme {
    const mode = parameters.augmentationMode || 'strictly';
    const percentage = parameters.augmentationPercentage || 100;
    
    console.log('🎵 AUGMENTATION: Mode =', mode, ', Percentage =', percentage);
    console.log('🎵 AUGMENTATION: Original theme:', theme);
    
    const augmented: Theme = [];
    
    for (let i = 0; i < theme.length; i++) {
      let shouldKeep = false;
      
      // Determine if this note should be kept (not removed) based on mode
      switch (mode) {
        case 'strictly':
          // Keep every other note (50% reduction)
          shouldKeep = i % 2 === 0;
          break;
        case 'loose':
          // Random chance to keep each note
          shouldKeep = Math.random() < 0.5;
          break;
        case 'percentage':
          // Keep notes based on inverse of percentage (higher percentage = more removal = fewer notes)
          // If percentage is 100%, keep ~33% of notes. If 50%, keep ~66% of notes
          const keepChance = 1 - (percentage / 150);
          shouldKeep = Math.random() < keepChance;
          break;
      }
      
      if (shouldKeep) {
        augmented.push(theme[i]);
      }
    }
    
    // Ensure we have at least one note
    if (augmented.length === 0 && theme.length > 0) {
      augmented.push(theme[0]);
    }

    console.log('🎵 AUGMENTATION: Result:', augmented);
    console.log('🎵 AUGMENTATION: Original length:', theme.length, ', New length:', augmented.length);
    return augmented;
  }

  /**
   * Fragmentation: melody broken into small motifs
   * FIXED: Now randomly selects fragment size and positions from the original theme
   */
  private static generateFragmentation(theme: Theme, parameters: CounterpointParameters): Theme {
    if (theme.length < 3) return theme;
    
    // Randomly choose a shortened length for the fragmented result (50-80% of original)
    const resultLength = Math.max(2, Math.floor(theme.length * (0.5 + Math.random() * 0.3)));
    
    // Randomly choose fragment size (use parameter as max, but allow variation)
    const maxFragSize = Math.min(parameters.fragmentSize, theme.length - 1);
    const minFragSize = Math.max(2, Math.floor(maxFragSize / 2));
    
    console.log('🔨 FRAGMENTATION: Original theme:', theme);
    console.log('🔨 FRAGMENTATION: Original length:', theme.length);
    console.log('🔨 FRAGMENTATION: Target result length:', resultLength);
    console.log('🔨 FRAGMENTATION: Fragment size range:', minFragSize, '-', maxFragSize);
    
    const fragmented: Theme = [];
    const usedStartIndices = new Set<number>();
    
    // Build fragmented result by randomly selecting fragments until we reach target length
    while (fragmented.length < resultLength) {
      // Randomly select fragment size for this iteration
      const currentFragSize = Math.floor(Math.random() * (maxFragSize - minFragSize + 1)) + minFragSize;
      
      // Randomly select starting position (ensure we don't go out of bounds)
      const maxStartIndex = Math.max(0, theme.length - currentFragSize);
      const startIndex = Math.floor(Math.random() * (maxStartIndex + 1));
      
      // Extract fragment (allow reuse of positions for variation)
      const fragment = theme.slice(startIndex, startIndex + currentFragSize);
      
      // Add fragment notes (but don't exceed target length)
      const remainingSpace = resultLength - fragmented.length;
      const notesToAdd = Math.min(fragment.length, remainingSpace);
      
      for (let i = 0; i < notesToAdd; i++) {
        fragmented.push(fragment[i]);
      }
      
      usedStartIndices.add(startIndex);
      
      console.log(`🔨 FRAGMENTATION: Added fragment from index ${startIndex}, size ${notesToAdd}:`, fragment.slice(0, notesToAdd));
    }
    
    console.log('🔨 FRAGMENTATION: Result:', fragmented);
    console.log('🔨 FRAGMENTATION: Result length:', fragmented.length);
    
    return fragmented;
  }

  /**
   * Sequence: pattern repeated at different pitch levels
   * VERIFIED: Correctly uses the original theme and transposes it
   */
  private static generateSequence(theme: Theme, parameters: CounterpointParameters): Theme {
    console.log('🔁 SEQUENCE: Original theme:', theme);
    console.log('🔁 SEQUENCE: Interval:', parameters.sequenceInterval, 'semitones');
    console.log('🔁 SEQUENCE: Repetitions:', parameters.sequenceRepetitions);
    
    const sequence: Theme = [...theme]; // Start with original theme
    const interval = parameters.sequenceInterval;
    const repetitions = parameters.sequenceRepetitions;

    // Repeat the ORIGINAL theme pattern at different pitch levels
    for (let rep = 1; rep < repetitions; rep++) {
      const transposed = theme.map(note => {
        const newNote = note + (interval * rep);
        return Math.max(24, Math.min(96, newNote)); // Constraint to MIDI range
      });
      sequence.push(...transposed);
      console.log(`🔁 SEQUENCE: Repetition ${rep} (transposed by ${interval * rep} semitones):`, transposed);
    }

    console.log('🔁 SEQUENCE: Final sequence:', sequence);
    return sequence;
  }

  /**
   * Ornamentation: decorative notes added to melody
   * Supports appoggiatura types and custom ornament patterns
   */
  private static generateOrnamentation(theme: Theme, mode: Mode, parameters: CounterpointParameters): Theme {
    const ornamented: Theme = [];
    const density = parameters.ornamentationDensity;

    for (let i = 0; i < theme.length; i++) {
      const principalNote = theme[i];
      
      // Apply appoggiatura if specified
      if (parameters.appoggiaturaType && Math.random() < density) {
        const appoggiatura = this.createAppoggiatura(principalNote, parameters.appoggiaturaType);
        ornamented.push(...appoggiatura);
      } 
      // Apply custom ornament pattern if specified
      else if (parameters.customOrnamentPattern && Math.random() < density) {
        const ornament = this.applyCustomOrnament(principalNote, parameters.customOrnamentPattern);
        ornamented.push(...ornament);
      }
      // Default ornamentation
      else {
        ornamented.push(principalNote);

        // Add ornaments based on density
        if (Math.random() < density && i < theme.length - 1) {
          const current = principalNote;
          const next = theme[i + 1];
          
          // Add neighbor tone
          if (Math.random() < 0.5) {
            const neighbor = current + (Math.random() < 0.5 ? 1 : -1);
            ornamented.push(Math.max(24, Math.min(96, neighbor)));
          }
          
          // Add passing tone
          if (Math.abs(next - current) > 2) {
            const passingTone = current + Math.sign(next - current) * 1;
            ornamented.push(Math.max(24, Math.min(96, passingTone)));
          }
        }
      }
    }

    return ornamented;
  }

  /**
   * Interpolation: notes inserted between existing notes
   * FIXED: Now limits interpolated notes to same octave (max 12 semitones from original notes)
   */
  private static generateInterpolation(theme: Theme, mode: Mode, parameters: CounterpointParameters): Theme {
    console.log('🎵 INTERPOLATION: Original theme:', theme);
    
    const interpolated: Theme = [];
    const MAX_OCTAVE_DISTANCE = 12; // Maximum distance for interpolation (1 octave)

    for (let i = 0; i < theme.length; i++) {
      interpolated.push(theme[i]);

      if (i < theme.length - 1) {
        const current = theme[i];
        const next = theme[i + 1];
        const interval = Math.abs(next - current);

        // Insert interpolated notes for large intervals (but not too large)
        if (interval > 3 && interval <= MAX_OCTAVE_DISTANCE) {
          const steps = Math.floor(interval / 2);
          const direction = next > current ? 1 : -1;
          
          console.log(`🎵 INTERPOLATION: Between notes ${i} and ${i+1} (${current} → ${next}, interval: ${interval})`);
          
          for (let j = 1; j <= steps; j++) {
            const interpolatedNote = current + (direction * j);
            
            // Verify the interpolated note is within the same octave range as the original notes
            const distanceFromCurrent = Math.abs(interpolatedNote - current);
            const distanceFromNext = Math.abs(interpolatedNote - next);
            
            if (distanceFromCurrent <= MAX_OCTAVE_DISTANCE && distanceFromNext <= MAX_OCTAVE_DISTANCE) {
              const constrainedNote = Math.max(24, Math.min(96, interpolatedNote));
              interpolated.push(constrainedNote);
              console.log(`  🎵 Inserted interpolated note: ${constrainedNote}`);
            } else {
              console.log(`  ⚠️ Skipped interpolation: distance too large (${distanceFromCurrent} or ${distanceFromNext} semitones)`);
            }
          }
        } else if (interval > MAX_OCTAVE_DISTANCE) {
          console.log(`🎵 INTERPOLATION: Skipping large interval (${interval} semitones) - exceeds octave limit`);
        }
      }
    }

    console.log('🎵 INTERPOLATION: Result:', interpolated);
    return interpolated;
  }

  /**
   * Transposition: melody moved to different pitch level
   */
  private static generateTransposition(theme: Theme, parameters: CounterpointParameters): Theme {
    const interval = parameters.transpositionInterval;
    console.log('🎵 TRANSPOSITION: Original theme:', theme);
    console.log('🎵 TRANSPOSITION: Interval:', interval, 'semitones');
    
    const transposed = theme.map(note => {
      const newNote = note + interval;
      return Math.max(24, Math.min(96, newNote));
    });
    
    console.log('🎵 TRANSPOSITION: Result:', transposed);
    return transposed;
  }

  /**
   * Mode Shifting: melody adapted to different modal context using melodic contour mapping
   * 
   * This implementation:
   * - Analyzes the melodic contour (up/down movement) of the original theme
   * - Builds scale from the source mode
   * - Builds scale from the target mode (if provided) or current mode
   * - Maps each note to the closest scale degree in the target mode
   * - Preserves melodic shape while adapting to the new modal context
   */
  private static generateModeShifting(theme: Theme, mode: Mode, parameters: CounterpointParameters): Theme {
    if (!theme || theme.length === 0) {
      console.warn('⚠️ MODE SHIFTING: Empty theme provided');
      return theme;
    }

    // Use target mode if provided, otherwise use the current mode (no change)
    const targetMode = parameters.targetMode || mode;
    
    console.log('🎵 MODE SHIFTING: Mapping theme to target mode:', targetMode.name);
    console.log('   Source theme:', theme);
    console.log('   Source mode:', mode.name, mode.stepPattern);
    console.log('   Target mode:', targetMode.name, targetMode.stepPattern);

    // Build source and target mode scales (one octave from the mode's final)
    const sourceScale = this.buildModeScale(mode);
    const targetScale = this.buildModeScale(targetMode);
    
    console.log('   Source scale:', sourceScale);
    console.log('   Target scale:', targetScale);

    const shifted: Theme = [];
    
    for (let i = 0; i < theme.length; i++) {
      const originalNote = theme[i];
      const pitchClass = originalNote % 12;
      const octave = Math.floor(originalNote / 12);
      
      // Find the position in the source scale
      const sourceDegree = this.findScaleDegree(pitchClass, sourceScale);
      
      // Map to the same scale degree in the target mode
      let targetPitchClass = targetScale[sourceDegree % targetScale.length];
      
      // Reconstruct the MIDI note with the original octave
      let shiftedNote = octave * 12 + targetPitchClass;
      
      // If we have a previous note, preserve melodic contour (up/down direction)
      if (i > 0) {
        const prevOriginal = theme[i - 1];
        const prevShifted = shifted[i - 1];
        const originalDirection = originalNote - prevOriginal;
        const currentDirection = shiftedNote - prevShifted;
        
        // If direction is inverted, adjust by an octave to preserve contour
        if (originalDirection > 0 && currentDirection < 0) {
          shiftedNote += 12;
        } else if (originalDirection < 0 && currentDirection > 0) {
          shiftedNote -= 12;
        }
      }
      
      // Clamp to valid MIDI range
      shiftedNote = Math.max(24, Math.min(96, shiftedNote));
      
      shifted.push(shiftedNote);
    }

    console.log('🎵 MODE SHIFTING: Result:', shifted);
    console.log('   Original contour:', this.getMelodicContour(theme));
    console.log('   Shifted contour:', this.getMelodicContour(shifted));
    
    return shifted;
  }

  /**
   * Build a mode scale starting from the mode's final (tonic)
   * Returns pitch classes for one octave
   */
  private static buildModeScale(mode: Mode): number[] {
    const scale: number[] = [mode.final];
    let currentPitch = mode.final;
    
    for (let i = 0; i < mode.stepPattern.length - 1; i++) {
      currentPitch = (currentPitch + mode.stepPattern[i]) % 12;
      scale.push(currentPitch);
    }
    
    return scale;
  }

  /**
   * Find the closest scale degree for a given pitch class
   * Returns index in the scale (0-6 typically)
   */
  private static findScaleDegree(pitchClass: number, scale: number[]): number {
    // First try exact match
    const exactMatch = scale.indexOf(pitchClass);
    if (exactMatch !== -1) {
      return exactMatch;
    }
    
    // If not in scale, find the closest scale degree
    let closestDegree = 0;
    let closestDistance = 12;
    
    for (let i = 0; i < scale.length; i++) {
      const distance = Math.min(
        Math.abs(pitchClass - scale[i]),
        Math.abs(pitchClass - scale[i] + 12),
        Math.abs(pitchClass - scale[i] - 12)
      );
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestDegree = i;
      }
    }
    
    return closestDegree;
  }

  /**
   * Get melodic contour as array of interval directions
   */
  private static getMelodicContour(theme: Theme): string {
    const contour: string[] = [];
    for (let i = 1; i < theme.length; i++) {
      const interval = theme[i] - theme[i - 1];
      if (interval > 0) contour.push('↑');
      else if (interval < 0) contour.push('↓');
      else contour.push('→');
    }
    return contour.join('');
  }

  // Species Counterpoint implementations

  /**
   * First Species: Note against note (1:1 ratio)
   */
  private static generateFirstSpecies(theme: Theme, mode: Mode, parameters: CounterpointParameters): Theme {
    const counterpoint: Theme = [];
    
    for (let i = 0; i < theme.length; i++) {
      const cantusNote = theme[i];
      
      // Generate consonant intervals: 3rd, 5th, 6th, octave
      const consonantIntervals = [3, 4, 7, 8, 9, 12];
      const interval = consonantIntervals[Math.floor(Math.random() * consonantIntervals.length)];
      const direction = Math.random() < 0.5 ? 1 : -1;
      
      let counterpointNote = cantusNote + (direction * interval);
      counterpointNote = Math.max(24, Math.min(96, counterpointNote));
      
      // Apply voice leading constraints
      if (parameters.enableVoiceLeading && i > 0) {
        const previousInterval = Math.abs(counterpoint[i - 1] - counterpointNote);
        if (previousInterval > 7) { // Avoid large leaps
          counterpointNote = counterpoint[i - 1] + Math.sign(counterpointNote - counterpoint[i - 1]) * 2;
        }
      }
      
      counterpoint.push(counterpointNote);
    }

    return counterpoint;
  }

  /**
   * Second Species: Two notes against one (2:1 ratio)
   */
  private static generateSecondSpecies(theme: Theme, mode: Mode, parameters: CounterpointParameters): Theme {
    const counterpoint: Theme = [];
    
    for (let i = 0; i < theme.length; i++) {
      const cantusNote = theme[i];
      
      // First note: consonant
      const consonantNote = this.generateConsonantNote(cantusNote, counterpoint, i);
      counterpoint.push(consonantNote);
      
      // Second note: can be dissonant if it resolves
      if (i < theme.length - 1) {
        const nextCantus = theme[i + 1];
        const passingTone = consonantNote + Math.sign(nextCantus - cantusNote) * 1;
        counterpoint.push(Math.max(24, Math.min(96, passingTone)));
      }
    }

    return counterpoint;
  }

  /**
   * Third Species: Four notes against one (4:1 ratio)
   */
  private static generateThirdSpecies(theme: Theme, mode: Mode, parameters: CounterpointParameters): Theme {
    const counterpoint: Theme = [];
    
    for (let i = 0; i < theme.length; i++) {
      const cantusNote = theme[i];
      
      // Generate four notes for each cantus note
      for (let j = 0; j < 4; j++) {
        if (j === 0) {
          // First note: consonant
          const consonantNote = this.generateConsonantNote(cantusNote, counterpoint, counterpoint.length);
          counterpoint.push(consonantNote);
        } else {
          // Other notes: stepwise motion with some dissonance allowed
          const lastNote = counterpoint[counterpoint.length - 1];
          const step = (Math.random() < 0.5 ? 1 : -1) * (Math.random() < 0.7 ? 1 : 2);
          const newNote = Math.max(24, Math.min(96, lastNote + step));
          counterpoint.push(newNote);
        }
      }
    }

    return counterpoint;
  }

  /**
   * Fourth Species: Syncopation with suspensions
   */
  private static generateFourthSpecies(theme: Theme, mode: Mode, parameters: CounterpointParameters): Theme {
    const counterpoint: Theme = [];
    
    for (let i = 0; i < theme.length; i++) {
      const cantusNote = theme[i];
      
      if (i === 0) {
        // First note: consonant
        const consonantNote = this.generateConsonantNote(cantusNote, counterpoint, i);
        counterpoint.push(consonantNote);
      } else {
        // Create suspension-resolution pattern
        const suspension = counterpoint[counterpoint.length - 1]; // Hold previous note
        counterpoint.push(suspension);
        
        // Resolution down by step
        const resolution = Math.max(24, Math.min(96, suspension - 1));
        counterpoint.push(resolution);
      }
    }

    return counterpoint;
  }

  /**
   * Fifth Species: Florid counterpoint (mixture of all species)
   */
  private static generateFloridCounterpoint(theme: Theme, mode: Mode, parameters: CounterpointParameters): Theme {
    const counterpoint: Theme = [];
    
    for (let i = 0; i < theme.length; i++) {
      const species = Math.floor(Math.random() * 4) + 1; // Random species 1-4
      
      switch (species) {
        case 1:
          // First species pattern
          const consonant = this.generateConsonantNote(theme[i], counterpoint, counterpoint.length);
          counterpoint.push(consonant);
          break;
          
        case 2:
          // Second species pattern
          const consonant2 = this.generateConsonantNote(theme[i], counterpoint, counterpoint.length);
          counterpoint.push(consonant2);
          const passing = Math.max(24, Math.min(96, consonant2 + (Math.random() < 0.5 ? 1 : -1)));
          counterpoint.push(passing);
          break;
          
        case 3:
          // Third species pattern (simplified)
          for (let j = 0; j < 2; j++) {
            const lastNote = counterpoint.length > 0 ? counterpoint[counterpoint.length - 1] : theme[i];
            const step = (Math.random() < 0.5 ? 1 : -1) * 1;
            counterpoint.push(Math.max(24, Math.min(96, lastNote + step)));
          }
          break;
          
        case 4:
          // Fourth species pattern (simplified suspension)
          if (counterpoint.length > 0) {
            const suspension = counterpoint[counterpoint.length - 1];
            counterpoint.push(suspension);
            counterpoint.push(Math.max(24, Math.min(96, suspension - 1)));
          }
          break;
      }
    }

    return counterpoint;
  }

  // New rhythmic counterpoint methods

  /**
   * Generate species counterpoint with proper rhythmic relationships
   */
  static generateSpeciesCounterpointRhythmic(
    cantusFirmus: RhythmicNote[],
    speciesRatio: '1:1' | '2:1' | '3:1' | '4:1' | '5:1',
    mode: Mode,
    parameters: CounterpointParameters
  ): CounterpointVoice {
    const ratio = parseInt(speciesRatio.split(':')[0]);
    
    switch (ratio) {
      case 1:
        return this.generateFirstSpeciesRhythmic(cantusFirmus, mode, parameters);
      case 2:
        return this.generateSecondSpeciesRhythmic(cantusFirmus, mode, parameters);
      case 3:
        return this.generateThirdSpeciesRhythmic(cantusFirmus, mode, parameters);
      case 4:
        return this.generateFourthSpeciesRhythmic(cantusFirmus, mode, parameters);
      case 5:
      default:
        return this.generateFloridCounterpointRhythmic(cantusFirmus, mode, parameters);
    }
  }

  /**
   * First species rhythmic: 1:1 ratio with same note values
   */
  private static generateFirstSpeciesRhythmic(
    cantusFirmus: RhythmicNote[],
    mode: Mode,
    parameters: CounterpointParameters
  ): CounterpointVoice {
    const counterpoint: RhythmicNote[] = [];

    for (let i = 0; i < cantusFirmus.length; i++) {
      const cfNote = cantusFirmus[i];
      const consonantMidi = this.generateConsonantNote(cfNote.midi, counterpoint.map(n => n.midi), i);
      
      counterpoint.push(createRhythmicNote(consonantMidi, cfNote.duration));
    }

    return {
      melody: counterpoint,
      species: 'first',
      ratioToCantusFirmus: '1:1'
    };
  }

  /**
   * Second species rhythmic: 2:1 ratio
   * NOW WITH: Enhanced syncopation and rhythmic variety support
   */
  private static generateSecondSpeciesRhythmic(
    cantusFirmus: RhythmicNote[],
    mode: Mode,
    parameters: CounterpointParameters
  ): CounterpointVoice {
    const counterpoint: RhythmicNote[] = [];
    const halfDuration = this.getHalfDuration(cantusFirmus[0]?.duration || 'whole');

    for (let i = 0; i < cantusFirmus.length; i++) {
      const cfNote = cantusFirmus[i];
      
      // Apply syncopation: occasionally shift strong beat
      const applySyncopation = parameters.allowSyncopation && Math.random() < 0.3 && i > 0;
      
      // First note: consonant on strong beat (or syncopated)
      const consonantMidi = this.generateConsonantNote(cfNote.midi, counterpoint.map(n => n.midi), counterpoint.length);
      const firstDur = applySyncopation && parameters.enableRhythmicVariety 
        ? this.getHalfDuration(halfDuration)  // SYNCOPATION: Shorter first note
        : (parameters.enableRhythmicVariety && Math.random() < 0.25 
            ? this.getHalfDuration(halfDuration)  // VARIETY: Sometimes shorter
            : halfDuration);
      counterpoint.push(createRhythmicNote(consonantMidi, firstDur));
      
      // Second note: can be dissonant passing tone on weak beat
      const lastCounterpointNote = counterpoint[counterpoint.length - 1];
      let secondNoteMidi: MidiNote;
      
      if (i < cantusFirmus.length - 1) {
        const nextCfNote = cantusFirmus[i + 1];
        const direction = nextCfNote.midi > cfNote.midi ? 1 : -1;
        secondNoteMidi = Math.max(24, Math.min(96, lastCounterpointNote.midi + direction * 1));
      } else {
        // Final note should be consonant
        secondNoteMidi = this.generateConsonantNote(cfNote.midi, counterpoint.map(n => n.midi), counterpoint.length);
      }
      
      // Rhythmic variety on second note
      const secondDur = applySyncopation 
        ? halfDuration  // SYNCOPATION: Longer second note creates off-beat accent
        : (parameters.enableRhythmicVariety && Math.random() < 0.25 
            ? this.getHalfDuration(halfDuration)  // VARIETY: Sometimes shorter
            : halfDuration);
      
      counterpoint.push(createRhythmicNote(secondNoteMidi, secondDur));
    }

    return {
      melody: counterpoint,
      species: 'second',
      ratioToCantusFirmus: '2:1'
    };
  }

  /**
   * Third species rhythmic: 3:1 ratio (CORRECTED)
   * For each cantus firmus note, generate 3 counterpoint notes at 1/3 the duration
   * NOW WITH: Enhanced syncopation and rhythmic variety support
   */
  private static generateThirdSpeciesRhythmic(
    cantusFirmus: RhythmicNote[],
    mode: Mode,
    parameters: CounterpointParameters
  ): CounterpointVoice {
    const counterpoint: RhythmicNote[] = [];
    const thirdDuration = this.getThirdDuration(cantusFirmus[0]?.duration || 'whole');

    for (let i = 0; i < cantusFirmus.length; i++) {
      const cfNote = cantusFirmus[i];
      
      // Apply syncopation: start some phrases off-beat
      const applySyncopation = parameters.allowSyncopation && Math.random() < 0.4 && i > 0;
      
      if (applySyncopation) {
        // SYNCOPATION: Start with a shorter note value, then longer
        const shorterDur = this.getHalfDuration(thirdDuration);
        const longerDur = thirdDuration;
        
        const syncopatedMidi = this.generateConsonantNote(cfNote.midi, counterpoint.map(n => n.midi), counterpoint.length);
        counterpoint.push(createRhythmicNote(syncopatedMidi, shorterDur));
        
        const resolvedMidi = Math.max(24, Math.min(96, syncopatedMidi - 1));
        counterpoint.push(createRhythmicNote(resolvedMidi, longerDur));
        counterpoint.push(createRhythmicNote(resolvedMidi, shorterDur));
      } else {
        // Standard 3:1 pattern
        // First note: consonant on strong beat
        const consonantMidi = this.generateConsonantNote(cfNote.midi, counterpoint.map(n => n.midi), counterpoint.length);
        const firstNoteDur = parameters.enableRhythmicVariety && Math.random() < 0.3 
          ? this.getHalfDuration(thirdDuration)  // Rhythmic variety: sometimes use shorter
          : thirdDuration;
        counterpoint.push(createRhythmicNote(consonantMidi, firstNoteDur));
        
        // Generate TWO more notes (total 3) with stepwise motion
        let currentMidi = consonantMidi;
        for (let j = 1; j < 3; j++) {
          const direction = Math.random() < 0.5 ? 1 : -1;
          const step = j === 2 ? -direction : direction; // Return motion on last note
          currentMidi = Math.max(24, Math.min(96, currentMidi + step));
          
          // Rhythmic variety: vary durations
          let noteDur = thirdDuration;
          if (parameters.enableRhythmicVariety && Math.random() < 0.3) {
            noteDur = j === 1 ? this.getHalfDuration(thirdDuration) : thirdDuration;
          }
          
          counterpoint.push(createRhythmicNote(currentMidi, noteDur));
        }
      }
    }

    return {
      melody: counterpoint,
      species: 'third',
      ratioToCantusFirmus: '3:1'
    };
  }

  /**
   * Fourth species rhythmic: 4:1 ratio (CORRECTED)
   * For each cantus firmus note, generate 4 counterpoint notes at 1/4 the duration
   * NOW WITH: Traditional syncopation patterns and rhythmic variety
   */
  private static generateFourthSpeciesRhythmic(
    cantusFirmus: RhythmicNote[],
    mode: Mode,
    parameters: CounterpointParameters
  ): CounterpointVoice {
    const counterpoint: RhythmicNote[] = [];
    const quarterDuration = this.getQuarterDuration(cantusFirmus[0]?.duration || 'whole');

    for (let i = 0; i < cantusFirmus.length; i++) {
      const cfNote = cantusFirmus[i];
      
      // AGGRESSIVE SYNCOPATION: Suspension-resolution patterns
      if (parameters.allowSyncopation && i > 0 && Math.random() < 0.5) {
        // Hold previous note (suspension)
        const prevNote = counterpoint[counterpoint.length - 1];
        const suspensionDur = parameters.enableRhythmicVariety 
          ? this.getHalfDuration(cfNote.duration)  // Longer suspension
          : quarterDuration;
        counterpoint.push(createRhythmicNote(prevNote.midi, suspensionDur));
        
        // Resolution down by step
        const resolutionMidi = Math.max(24, Math.min(96, prevNote.midi - 1));
        counterpoint.push(createRhythmicNote(resolutionMidi, quarterDuration));
        
        // Fill remaining duration with passing motion
        let currentMidi = resolutionMidi;
        for (let j = 2; j < 4; j++) {
          currentMidi = Math.max(24, Math.min(96, currentMidi + (Math.random() < 0.5 ? 1 : -1)));
          const dur = parameters.enableRhythmicVariety && Math.random() < 0.3
            ? this.getHalfDuration(quarterDuration)
            : quarterDuration;
          counterpoint.push(createRhythmicNote(currentMidi, dur));
        }
      } else {
        // Standard 4:1 pattern with rhythmic variety
        // First note: consonant on strong beat
        const consonantMidi = this.generateConsonantNote(cfNote.midi, counterpoint.map(n => n.midi), counterpoint.length);
        const firstDur = parameters.enableRhythmicVariety && Math.random() < 0.3
          ? this.getHalfDuration(quarterDuration)  // Sometimes shorter
          : quarterDuration;
        counterpoint.push(createRhythmicNote(consonantMidi, firstDur));
        
        // Generate THREE more notes (total 4) with flowing motion
        let currentMidi = consonantMidi;
        for (let j = 1; j < 4; j++) {
          // Stepwise motion with occasional leaps
          const useLeap = Math.random() < 0.2; // 20% chance of leap
          const interval = useLeap ? (Math.random() < 0.5 ? 3 : -3) : (Math.random() < 0.5 ? 1 : -1);
          currentMidi = Math.max(24, Math.min(96, currentMidi + interval));
          
          // Apply rhythmic variety
          const noteDur = parameters.enableRhythmicVariety && Math.random() < 0.3 && j > 1
            ? this.getHalfDuration(quarterDuration)
            : quarterDuration;
          
          counterpoint.push(createRhythmicNote(currentMidi, noteDur));
        }
      }
    }

    return {
      melody: counterpoint,
      species: 'fourth',
      ratioToCantusFirmus: '4:1'
    };
  }

  /**
   * Fourth species with syncopation (alternative implementation)
   * This follows traditional 4th species counterpoint with suspensions
   */
  private static generateFourthSpeciesSyncopated(
    cantusFirmus: RhythmicNote[],
    mode: Mode,
    parameters: CounterpointParameters
  ): CounterpointVoice {
    const counterpoint: RhythmicNote[] = [];
    const halfDuration = this.getHalfDuration(cantusFirmus[0]?.duration || 'whole');

    for (let i = 0; i < cantusFirmus.length; i++) {
      const cfNote = cantusFirmus[i];
      
      if (i === 0) {
        // First note: consonant
        const consonantMidi = this.generateConsonantNote(cfNote.midi, counterpoint.map(n => n.midi), counterpoint.length);
        counterpoint.push(createRhythmicNote(consonantMidi, halfDuration));
        counterpoint.push(createRhythmicNote(consonantMidi, halfDuration)); // Hold the note
      } else {
        // Suspension-resolution pattern
        const previousNote = counterpoint[counterpoint.length - 1];
        
        // Suspension: hold previous note (creates dissonance)
        counterpoint.push(createRhythmicNote(previousNote.midi, halfDuration));
        
        // Resolution: step down (or up) to consonance
        const direction = Math.random() < 0.8 ? -1 : 1; // Prefer downward resolution
        const resolvedMidi = Math.max(24, Math.min(96, previousNote.midi + direction));
        counterpoint.push(createRhythmicNote(resolvedMidi, halfDuration));
      }
    }

    return {
      melody: counterpoint,
      species: 'fourth',
      ratioToCantusFirmus: '1:1 syncopated'
    };
  }

  /**
   * Fifth species rhythmic: Florid counterpoint (mixed species)
   */
  private static generateFloridCounterpointRhythmic(
    cantusFirmus: RhythmicNote[],
    mode: Mode,
    parameters: CounterpointParameters
  ): CounterpointVoice {
    const counterpoint: RhythmicNote[] = [];

    for (let i = 0; i < cantusFirmus.length; i++) {
      const cfNote = cantusFirmus[i];
      const species = Math.floor(Math.random() * 4) + 1;
      
      switch (species) {
        case 1: // First species pattern
          const consonantMidi = this.generateConsonantNote(cfNote.midi, counterpoint.map(n => n.midi), counterpoint.length);
          counterpoint.push(createRhythmicNote(consonantMidi, cfNote.duration));
          break;
          
        case 2: // Second species pattern
          const halfDur = this.getHalfDuration(cfNote.duration);
          const consonant2 = this.generateConsonantNote(cfNote.midi, counterpoint.map(n => n.midi), counterpoint.length);
          counterpoint.push(createRhythmicNote(consonant2, halfDur));
          
          const passingMidi = Math.max(24, Math.min(96, consonant2 + (Math.random() < 0.5 ? 1 : -1)));
          counterpoint.push(createRhythmicNote(passingMidi, halfDur));
          break;
          
        case 3: // Third species pattern (simplified to 2:1 for florid)
          const quarterDur = this.getQuarterDuration(cfNote.duration);
          let currentNote = this.generateConsonantNote(cfNote.midi, counterpoint.map(n => n.midi), counterpoint.length);
          counterpoint.push(createRhythmicNote(currentNote, quarterDur));
          
          currentNote = Math.max(24, Math.min(96, currentNote + (Math.random() < 0.5 ? 1 : -1)));
          counterpoint.push(createRhythmicNote(currentNote, quarterDur));
          break;
          
        case 4: // Suspension pattern (simplified)
          if (counterpoint.length > 0) {
            const prevNote = counterpoint[counterpoint.length - 1];
            const suspDur = this.getHalfDuration(cfNote.duration);
            counterpoint.push(createRhythmicNote(prevNote.midi, suspDur));
            
            const resolvedMidi = Math.max(24, Math.min(96, prevNote.midi - 1));
            counterpoint.push(createRhythmicNote(resolvedMidi, suspDur));
          }
          break;
      }
    }

    return {
      melody: counterpoint,
      species: 'fifth',
      ratioToCantusFirmus: 'mixed'
    };
  }

  // Helper methods for rhythmic duration calculation

  private static getHalfDuration(duration: NoteValue): NoteValue {
    switch (duration) {
      case 'double-whole': return 'whole';
      case 'whole': return 'half';
      case 'dotted-half': return 'dotted-quarter';
      case 'half': return 'quarter';
      case 'dotted-quarter': return 'eighth';
      case 'quarter': return 'eighth';
      case 'eighth': return 'sixteenth';
      default: return 'quarter';
    }
  }

  /**
   * Get one-third duration for 3:1 species counterpoint
   */
  private static getThirdDuration(duration: NoteValue): NoteValue {
    // For 3:1 species, we need to divide the CF duration by 3
    // This is approximate since not all durations divide evenly by 3
    switch (duration) {
      case 'double-whole': return 'dotted-half'; // 8 beats / 3 ≈ 2.67, use dotted-half (3 beats)
      case 'whole': return 'dotted-quarter'; // 4 beats / 3 ≈ 1.33, use dotted-quarter (1.5 beats)  
      case 'dotted-half': return 'quarter'; // 3 beats / 3 = 1 beat
      case 'half': return 'eighth'; // 2 beats / 3 ≈ 0.67, use eighth (0.5 beats) + some adjustment
      case 'dotted-quarter': return 'eighth'; // 1.5 beats / 3 = 0.5 beats
      case 'quarter': return 'eighth'; // 1 beat / 3 ≈ 0.33, use eighth (0.5 beats) 
      case 'eighth': return 'sixteenth'; // 0.5 beats / 3 ≈ 0.17, use sixteenth (0.25 beats)
      default: return 'eighth';
    }
  }

  /**
   * Get one-quarter duration for 4:1 species counterpoint
   */
  private static getQuarterDuration(duration: NoteValue): NoteValue {
    switch (duration) {
      case 'double-whole': return 'half'; // 8 beats / 4 = 2 beats
      case 'whole': return 'quarter'; // 4 beats / 4 = 1 beat
      case 'dotted-half': return 'eighth'; // 3 beats / 4 ≈ 0.75, use eighth (0.5 beats)
      case 'half': return 'eighth'; // 2 beats / 4 = 0.5 beats
      case 'quarter': return 'sixteenth'; // 1 beat / 4 = 0.25 beats
      default: return 'eighth';
    }
  }

  // Rhythmic technique applications

  private static applyRetrogradeToRhythmic(voice: RhythmicNote[]): RhythmicNote[] {
    return [...voice].reverse();
  }

  private static applyInversionToRhythmic(voice: RhythmicNote[], mode: Mode, parameters?: CounterpointParameters): RhythmicNote[] {
    if (voice.length < 2) return voice;

    const axis = voice[0].midi;
    const inverted: RhythmicNote[] = [voice[0]]; // Keep first note

    for (let i = 1; i < voice.length; i++) {
      const interval = voice[i].midi - voice[i - 1].midi;
      const invertedMidi = inverted[i - 1].midi - interval;
      const constrainedMidi = Math.max(24, Math.min(96, invertedMidi));
      
      inverted.push(createRhythmicNote(constrainedMidi, voice[i].duration));
    }

    return inverted;
  }

  private static applyTranspositionToRhythmic(voice: RhythmicNote[], parameters: CounterpointParameters): RhythmicNote[] {
    const interval = parameters.transpositionInterval;
    return voice.map(note => {
      const transposedMidi = note.midi + interval;
      const constrainedMidi = Math.max(24, Math.min(96, transposedMidi));
      return createRhythmicNote(constrainedMidi, note.duration);
    });
  }

  private static applyModeShiftingToRhythmic(voice: RhythmicNote[], mode: Mode, parameters: CounterpointParameters): RhythmicNote[] {
    // Convert to simple melody, apply mode shifting, then convert back to rhythmic
    const simpleMelody = rhythmicNotesToMelody(voice);
    const shiftedMelody = this.generateModeShifting(simpleMelody, mode, parameters);
    
    // Preserve original durations
    return voice.map((originalNote, index) => {
      const shiftedMidi = shiftedMelody[index] || originalNote.midi;
      return createRhythmicNote(shiftedMidi, originalNote.duration);
    });
  }

  private static applyDiminutionToRhythmic(voice: RhythmicNote[], parameters?: CounterpointParameters): RhythmicNote[] {
    const mode = parameters?.diminutionMode || 'strictly';
    const percentage = parameters?.diminutionPercentage || 100;
    
    console.log('🎵 RHYTHMIC DIMINUTION: Mode =', mode, ', Percentage =', percentage);
    
    const diminished: RhythmicNote[] = [];
    
    for (const note of voice) {
      let shouldDiminish = false;
      
      // Determine if this note should be diminished based on mode
      switch (mode) {
        case 'strictly':
          shouldDiminish = true;
          break;
        case 'loose':
          shouldDiminish = Math.random() < 0.5;
          break;
        case 'percentage':
          shouldDiminish = Math.random() < (percentage / 100);
          break;
      }
      
      if (shouldDiminish) {
        const fasterDuration = this.getHalfDuration(note.duration);
        diminished.push(createRhythmicNote(note.midi, fasterDuration));
        
        // Add passing tone
        const passingMidi = Math.max(24, Math.min(96, note.midi + (Math.random() < 0.5 ? 1 : -1)));
        diminished.push(createRhythmicNote(passingMidi, fasterDuration));
      } else {
        // Keep original note unchanged
        diminished.push(note);
      }
    }

    console.log('🎵 RHYTHMIC DIMINUTION: Original length:', voice.length, ', New length:', diminished.length);
    return diminished;
  }

  private static applyAugmentationToRhythmic(voice: RhythmicNote[], parameters?: CounterpointParameters): RhythmicNote[] {
    const mode = parameters?.augmentationMode || 'strictly';
    const percentage = parameters?.augmentationPercentage || 100;
    
    console.log('🎵 RHYTHMIC AUGMENTATION: Mode =', mode, ', Percentage =', percentage);
    
    const augmented: RhythmicNote[] = [];
    
    for (let i = 0; i < voice.length; i++) {
      let shouldAugment = false;
      
      // Determine if this note should be augmented based on mode
      switch (mode) {
        case 'strictly':
          shouldAugment = true;
          break;
        case 'loose':
          shouldAugment = Math.random() < 0.5;
          break;
        case 'percentage':
          shouldAugment = Math.random() < (percentage / 100);
          break;
      }
      
      if (shouldAugment) {
        const slowerDuration = this.getSlowerDuration(voice[i].duration);
        augmented.push(createRhythmicNote(voice[i].midi, slowerDuration));
      } else {
        // Keep original note unchanged
        augmented.push(voice[i]);
      }
    }

    console.log('🎵 RHYTHMIC AUGMENTATION: Original length:', voice.length, ', New length:', augmented.length);
    return augmented;
  }

  private static getSlowerDuration(duration: NoteValue): NoteValue {
    switch (duration) {
      case 'sixteenth': return 'eighth';
      case 'eighth': return 'quarter';
      case 'quarter': return 'half';
      case 'dotted-quarter': return 'dotted-half';
      case 'half': return 'whole';
      case 'dotted-half': return 'double-whole';
      case 'whole': return 'double-whole';
      default: return 'half';
    }
  }

  private static applySequenceToRhythmic(voice: RhythmicNote[], parameters: CounterpointParameters): RhythmicNote[] {
    const sequence: RhythmicNote[] = [...voice];
    const interval = parameters.sequenceInterval;
    const repetitions = parameters.sequenceRepetitions;

    for (let rep = 1; rep < repetitions; rep++) {
      const transposed = voice.map(note => {
        const newMidi = Math.max(24, Math.min(96, note.midi + (interval * rep)));
        return createRhythmicNote(newMidi, note.duration);
      });
      sequence.push(...transposed);
    }

    return sequence;
  }

  /**
   * Helper function to generate consonant notes
   */
  private static generateConsonantNote(cantusNote: MidiNote, counterpoint: Theme, index: number): MidiNote {
    const consonantIntervals = [3, 4, 7, 8, 9, 12]; // m3, M3, P5, m6, M6, P8
    const interval = consonantIntervals[Math.floor(Math.random() * consonantIntervals.length)];
    const direction = Math.random() < 0.5 ? 1 : -1;
    
    let note = cantusNote + (direction * interval);
    note = Math.max(24, Math.min(96, note));
    
    // Apply voice leading if not first note
    if (index > 0 && counterpoint.length > 0) {
      const previousNote = counterpoint[counterpoint.length - 1];
      const leap = Math.abs(note - previousNote);
      
      if (leap > 4) { // Avoid large leaps
        note = previousNote + Math.sign(note - previousNote) * 2;
        note = Math.max(24, Math.min(96, note));
      }
    }
    
    return note;
  }

  /**
   * Create appoggiatura ornament
   * The appoggiatura splits the duration of the principal note in half
   * Returns [appoggiatura_note, principal_note]
   */
  private static createAppoggiatura(principalNote: MidiNote, type: AppoggiaturaType): Theme {
    let appoggiaturaNote: MidiNote;
    
    switch (type) {
      case 'step-above':
        appoggiaturaNote = principalNote + 2; // Whole step above
        break;
      case 'step-below':
        appoggiaturaNote = principalNote - 2; // Whole step below
        break;
      case 'halfstep-above':
        appoggiaturaNote = principalNote + 1; // Half step above
        break;
      case 'halfstep-below':
        appoggiaturaNote = principalNote - 1; // Half step below
        break;
      default:
        appoggiaturaNote = principalNote + 1;
    }
    
    // Ensure MIDI range
    appoggiaturaNote = Math.max(21, Math.min(108, appoggiaturaNote));
    
    // Return appoggiatura followed by principal note
    // The rhythm system will handle splitting the duration in half
    return [appoggiaturaNote, principalNote];
  }

  /**
   * Apply custom ornament pattern
   * Pattern is an array of interval offsets from the principal note
   */
  private static applyCustomOrnament(principalNote: MidiNote, pattern: OrnamentPattern): Theme {
    const ornament: Theme = [];
    
    for (const interval of pattern.pattern) {
      const ornamentNote = Math.max(21, Math.min(108, principalNote + interval));
      ornament.push(ornamentNote);
    }
    
    // Always end with the principal note
    ornament.push(principalNote);
    
    return ornament;
  }

  /**
   * Analyze interval consonance/dissonance
   */
  static analyzeInterval(note1: MidiNote, note2: MidiNote): IntervalInfo {
    const interval = Math.abs(note2 - note1) % 12;
    return this.INTERVALS[interval];
  }

  /**
   * Determine motion type between two voice pairs
   */
  static analyzeMotion(
    voice1Notes: [MidiNote, MidiNote],
    voice2Notes: [MidiNote, MidiNote]
  ): MotionType {
    const voice1Direction = voice1Notes[1] - voice1Notes[0];
    const voice2Direction = voice2Notes[1] - voice2Notes[0];

    if (voice1Direction === 0 && voice2Direction === 0) {
      return 'oblique'; // Both stay same (special case)
    } else if (voice1Direction === 0 || voice2Direction === 0) {
      return 'oblique'; // One voice moves, other stays
    } else if (Math.sign(voice1Direction) !== Math.sign(voice2Direction)) {
      return 'contrary'; // Opposite directions
    } else if (Math.abs(voice1Direction) === Math.abs(voice2Direction)) {
      return 'parallel'; // Same direction and interval
    } else {
      return 'similar'; // Same direction, different intervals
    }
  }

  /**
   * Apply texture characteristics to counterpoint
   */
  static applyTexture(counterpoint: Theme, texture: TextureType): Theme {
    switch (texture) {
      case 'rough':
        return this.makeRough(counterpoint);
      case 'smooth':
        return this.makeSmooth(counterpoint);
      case 'dense':
        return this.makeDense(counterpoint);
      case 'sparse':
        return this.makeSparse(counterpoint);
      case 'complex':
        return this.makeComplex(counterpoint);
      case 'simple':
        return this.makeSimple(counterpoint);
      default:
        return counterpoint;
    }
  }

  private static makeRough(theme: Theme): Theme {
    // Add dissonant intervals and angular motion
    return theme.map((note, i) => {
      if (i > 0 && Math.random() < 0.3) {
        const leap = (Math.random() < 0.5 ? 1 : -1) * (6 + Math.floor(Math.random() * 5)); // Large intervals
        return Math.max(24, Math.min(96, note + leap));
      }
      return note;
    });
  }

  private static makeSmooth(theme: Theme): Theme {
    // Ensure stepwise motion
    const smooth: Theme = [theme[0]];
    for (let i = 1; i < theme.length; i++) {
      const interval = theme[i] - smooth[i - 1];
      const step = Math.sign(interval) * Math.min(2, Math.abs(interval));
      smooth.push(Math.max(24, Math.min(96, smooth[i - 1] + step)));
    }
    return smooth;
  }

  private static makeDense(theme: Theme): Theme {
    // Add more notes
    const dense: Theme = [];
    for (let i = 0; i < theme.length; i++) {
      dense.push(theme[i]);
      if (i < theme.length - 1) {
        const passing = theme[i] + Math.sign(theme[i + 1] - theme[i]) * 1;
        dense.push(Math.max(24, Math.min(96, passing)));
      }
    }
    return dense;
  }

  private static makeSparse(theme: Theme): Theme {
    // Remove every other note
    return theme.filter((_, i) => i % 2 === 0);
  }

  private static makeComplex(theme: Theme): Theme {
    // Add rhythmic complexity through note groupings
    const complex: Theme = [];
    for (let i = 0; i < theme.length; i++) {
      complex.push(theme[i]);
      if (Math.random() < 0.4) {
        // Add ornamental figures
        const ornament = theme[i] + (Math.random() < 0.5 ? 1 : -1);
        complex.push(Math.max(24, Math.min(96, ornament)));
        complex.push(theme[i]); // Return
      }
    }
    return complex;
  }

  private static makeSimple(theme: Theme): Theme {
    // Simplify by removing ornaments and using basic intervals
    return theme.map((note, i) => {
      if (i === 0) return note;
      const prev = theme[i - 1];
      const interval = note - prev;
      const simpleInterval = Math.sign(interval) * Math.min(3, Math.abs(interval));
      return Math.max(24, Math.min(96, prev + simpleInterval));
    });
  }
}