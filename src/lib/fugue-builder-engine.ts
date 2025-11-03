/**
 * Fugue Builder Engine - Complete Implementation
 * AI-driven fugue construction with 36+ variations
 * Implements fundamental bass, figured bass, and harmonic progression systems
 */

import { Theme, Mode, MidiNote, Part, Rhythm } from '../types/musical';
import { MusicalEngine } from './musical-engine';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type FugueArchitecture =
  | 'CLASSIC_2' | 'CLASSIC_3' | 'CLASSIC_4' | 'CLASSIC_5' // Classical core
  | 'ADDITIVE' | 'SUBTRACTIVE' | 'ROTATIONAL' | 'MIRROR' // Hybrid structures
  | 'HOCKETED' | 'POLYRHYTHMIC' | 'RECURSIVE' | 'META' // Algorithmic
  | 'SPATIAL' | 'ADAPTIVE'; // Extended

export type FunctionType =
  | 'I' | 'i' | 'ii' | 'II' | 'iii' | 'III' | 'IV' | 'iv' | 'V' | 'v' | 'VI' | 'vi' | 'VII' | 'vii'
  | 'N6' | 'Fr6' | 'Ger6' | 'It6' // Augmented sixths
  | 'V/V' | 'V/ii' | 'V/IV' | 'vii/V'; // Secondary dominants

export interface FigureEvent {
  figure: string; // "4-3", "7-6", "6-5", "Cad64", etc.
  onsetOffset: number; // Offset within station (beats)
  preparationRule: string; // "common-tone", "step", "tie"
  resolutionRule: string; // "down-by-step", "up-by-step", "stationary"
  accented: boolean;
}

export interface HarmonicStation {
  function: FunctionType;
  bassPitch: MidiNote;
  roman: string;
  figureEvents: FigureEvent[];
  duration: number; // beats
}

export interface FundamentalBassPlan {
  key: MidiNote;
  stations: HarmonicStation[];
  cadenceMarkers: number[]; // Indices of cadential stations
}

export interface FugueParams {
  architecture: FugueArchitecture;
  numVoices: number;
  subject: Theme;
  entryInterval: number; // Semitones (5 for fifth, 7 for dominant, etc.)
  entrySpacing: number; // Beats between entries
  applyCounterSubject: boolean;
  strettoDensity: number; // 0-1
  totalMeasures: number;
  key: MidiNote;
  mode?: Mode;
  fundamentalBass?: FundamentalBassPlan;
  variations?: VariationSpec[];
}

export interface VariationSpec {
  type: 'INVERTED' | 'RETROGRADE' | 'AUGMENTED' | 'DIMINUTION' | 'TRUNCATION' | 
        'ELISION' | 'FRAGMENTATION' | 'SEQUENCE' | 'ORNAMENTATION' | 
        'TRANSPOSITION' | 'MODE_SHIFTING' | 'CHROMATIC';
  scope?: 'all' | 'subject' | 'answer';
  factor?: number; // For augmentation/diminution/transposition
  sequenceSteps?: number[]; // For sequence transformation
  ornamentStyle?: 'trill' | 'turn' | 'mordent' | 'neighbor';
  targetMode?: Mode; // For mode shifting
}

export interface VoiceEntry {
  voiceId: string;
  material: Theme;
  rhythm: Rhythm;
  startTime: number; // beats
  transposition: number; // semitones
  role: 'subject' | 'answer' | 'countersubject' | 'episode';
}

export interface FugueSection {
  name: string; // "Exposition", "Episode 1", "Development", "Stretto", "Recap"
  voices: VoiceEntry[];
  startMeasure: number;
  duration: number; // measures
}

export interface FugueResult {
  sections: FugueSection[];
  fundamentalBass: FundamentalBassPlan;
  metadata: {
    architecture: FugueArchitecture;
    totalVoices: number;
    totalMeasures: number;
    keySignature: MidiNote;
    description: string;
  };
}

// ============================================================================
// FUNDAMENTAL BASS PLANNING
// ============================================================================

export class FundamentalBassEngine {
  /**
   * Generate a fundamental bass plan for fugue structure
   */
  static planFundamentalBass(
    key: MidiNote,
    totalMeasures: number,
    architecture: FugueArchitecture
  ): FundamentalBassPlan {
    const stations: HarmonicStation[] = [];
    const cadenceMarkers: number[] = [];

    // Exposition (measures 1-8): I → IV → V → I
    stations.push(
      this.createStation('I', key, 'I', 2, [
        { figure: '5-3', onsetOffset: 0, preparationRule: 'none', resolutionRule: 'stable', accented: false }
      ])
    );
    
    stations.push(
      this.createStation('IV', key + 5, 'IV', 2, [
        { figure: '4-3', onsetOffset: 0, preparationRule: 'common-tone', resolutionRule: 'down-by-step', accented: true }
      ])
    );
    
    stations.push(
      this.createStation('V', key + 7, 'V', 2, [
        { figure: '7-6', onsetOffset: 0, preparationRule: 'step', resolutionRule: 'down-by-step', accented: true }
      ])
    );
    
    stations.push(
      this.createStation('I', key, 'I', 2, [
        { figure: 'Cad64', onsetOffset: 0, preparationRule: 'leap', resolutionRule: 'resolve-to-V', accented: true }
      ])
    );
    
    cadenceMarkers.push(stations.length - 1);

    // Episode (measures 9-12): Sequential pattern
    for (let i = 0; i < 2; i++) {
      stations.push(
        this.createStation('ii', key + 2, 'ii', 1, [
          { figure: '6-5', onsetOffset: 0, preparationRule: 'step', resolutionRule: 'down-by-step', accented: true }
        ])
      );
      stations.push(
        this.createStation('V', key + 7, 'V', 1, [
          { figure: '4-3', onsetOffset: 0, preparationRule: 'common-tone', resolutionRule: 'down-by-step', accented: true }
        ])
      );
    }

    // Development/Stretto (measures 13-20): Intensification
    if (totalMeasures >= 16) {
      stations.push(
        this.createStation('vi', key + 9, 'vi', 2, [])
      );
      stations.push(
        this.createStation('ii', key + 2, 'ii', 2, [
          { figure: '7-6', onsetOffset: 0, preparationRule: 'step', resolutionRule: 'down-by-step', accented: true }
        ])
      );
      stations.push(
        this.createStation('V', key + 7, 'V', 2, [
          { figure: '4-3', onsetOffset: 0, preparationRule: 'common-tone', resolutionRule: 'down-by-step', accented: true },
          { figure: '7-6', onsetOffset: 0.5, preparationRule: 'step', resolutionRule: 'down-by-step', accented: false }
        ])
      );
    }

    // Recapitulation (final measures): Return to tonic with cadence
    stations.push(
      this.createStation('I', key, 'I6-4', 1, [
        { figure: 'Cad64', onsetOffset: 0, preparationRule: 'leap', resolutionRule: 'resolve-to-V', accented: true }
      ])
    );
    stations.push(
      this.createStation('V', key + 7, 'V7', 1, [
        { figure: '4-3', onsetOffset: 0, preparationRule: 'preparation', resolutionRule: 'down-by-step', accented: true }
      ])
    );
    stations.push(
      this.createStation('I', key, 'I', 2, [
        { figure: '3-1', onsetOffset: 0, preparationRule: 'resolution', resolutionRule: 'stable', accented: false }
      ])
    );
    
    cadenceMarkers.push(stations.length - 1);

    return { key, stations, cadenceMarkers };
  }

  private static createStation(
    func: FunctionType,
    bassPitch: MidiNote,
    roman: string,
    duration: number,
    figureEvents: FigureEvent[]
  ): HarmonicStation {
    return { function: func, bassPitch, roman, figureEvents, duration };
  }
}

// ============================================================================
// FUGUE BUILDER CORE ENGINE
// ============================================================================

export class FugueBuilderEngine {
  /**
   * Generate a complete fugue structure
   */
  static generateFugue(params: FugueParams): FugueResult {
    const sections: FugueSection[] = [];

    // 1. Prepare fundamental bass if not provided
    const fundamentalBass = params.fundamentalBass || 
      FundamentalBassEngine.planFundamentalBass(
        params.key,
        params.totalMeasures,
        params.architecture
      );

    // 2. Build Exposition
    sections.push(this.buildExposition(params, fundamentalBass));

    // 3. Build Episodes & Development
    if (params.totalMeasures >= 12) {
      sections.push(this.buildEpisode(params, fundamentalBass, 1));
    }
    
    if (params.totalMeasures >= 16) {
      sections.push(this.buildDevelopment(params, fundamentalBass));
    }

    // 4. Build Stretto (if density > 0.3)
    if (params.strettoDensity > 0.3 && params.totalMeasures >= 20) {
      sections.push(this.buildStretto(params, fundamentalBass));
    }

    // 5. Build Recapitulation
    sections.push(this.buildRecapitulation(params, fundamentalBass));

    // 6. Apply variations if specified
    if (params.variations && params.variations.length > 0) {
      console.log(`🎨 Processing ${params.variations.length} transformations`);
      this.applyVariations(sections, params.variations, params.mode);
    }

    return {
      sections,
      fundamentalBass,
      metadata: {
        architecture: params.architecture,
        totalVoices: params.numVoices,
        totalMeasures: params.totalMeasures,
        keySignature: params.key,
        description: this.getArchitectureDescription(params.architecture)
      }
    };
  }

  /**
   * Build Exposition section
   */
  private static buildExposition(
    params: FugueParams,
    fb: FundamentalBassPlan
  ): FugueSection {
    const voices: VoiceEntry[] = [];
    let currentTime = 0;

    for (let i = 0; i < params.numVoices; i++) {
      const isAnswer = i % 2 === 1;
      const transposition = isAnswer ? params.entryInterval : 0;
      
      // Apply transposition to subject
      const baseMaterial = this.transposeTheme(params.subject, transposition);
      // Pad with rests for entry delay
      const material = this.padMaterialWithDelay(baseMaterial, currentTime);
      
      voices.push({
        voiceId: `Voice ${i + 1}`,
        material,
        rhythm: this.buildRhythmForMaterial(material, currentTime),
        startTime: currentTime,
        transposition,
        role: i === 0 ? 'subject' : (isAnswer ? 'answer' : 'subject')
      });

      currentTime += params.entrySpacing;

      // Add countersubject for previous voices
      if (params.applyCounterSubject && i > 0) {
        const baseCountersubject = this.generateCountersubject(params.subject, params.mode);
        // Pad countersubject with rests to match previous voice's start time
        const countersubject = this.padMaterialWithDelay(baseCountersubject, voices[i - 1].startTime);
        voices.push({
          voiceId: `Voice ${i} CS`,
          material: countersubject,
          rhythm: this.buildRhythmForMaterial(countersubject, voices[i - 1].startTime),
          startTime: voices[i - 1].startTime,
          transposition: 0,
          role: 'countersubject'
        });
      }
    }

    return {
      name: 'Exposition',
      voices,
      startMeasure: 0,
      duration: Math.ceil(currentTime / 4) // Convert beats to measures
    };
  }

  /**
   * Build Episode section
   */
  private static buildEpisode(
    params: FugueParams,
    fb: FundamentalBassPlan,
    episodeNumber: number
  ): FugueSection {
    const voices: VoiceEntry[] = [];
    
    // Create sequential material from subject fragments
    const motif = params.subject.slice(0, 4);
    const sequenceSteps = [0, 2, 4, 2, 0]; // Step pattern
    
    for (let i = 0; i < params.numVoices; i++) {
      const baseMaterial: Theme = [];
      
      sequenceSteps.forEach(step => {
        motif.forEach(note => {
          baseMaterial.push(note + step);
        });
      });

      // Pad with rests for entry delay
      const material = this.padMaterialWithDelay(baseMaterial, i * 2);

      voices.push({
        voiceId: `Voice ${i + 1}`,
        material,
        rhythm: this.buildRhythmForMaterial(material, i * 2),
        startTime: i * 2,
        transposition: i * 2,
        role: 'episode'
      });
    }

    return {
      name: `Episode ${episodeNumber}`,
      voices,
      startMeasure: 8,
      duration: 4
    };
  }

  /**
   * Build Development section with transformations
   */
  private static buildDevelopment(
    params: FugueParams,
    fb: FundamentalBassPlan
  ): FugueSection {
    const voices: VoiceEntry[] = [];
    
    // Apply inversions and fragmentations
    for (let i = 0; i < params.numVoices; i++) {
      const baseMaterial = i % 2 === 0
        ? this.invertTheme(params.subject, params.subject[0])
        : this.fragmentTheme(params.subject);

      // Pad with rests for entry delay
      const material = this.padMaterialWithDelay(baseMaterial, i * 1.5);

      voices.push({
        voiceId: `Voice ${i + 1}`,
        material,
        rhythm: this.buildRhythmForMaterial(material, i * 1.5),
        startTime: i * 1.5,
        transposition: i * 3,
        role: 'subject'
      });
    }

    return {
      name: 'Development',
      voices,
      startMeasure: 12,
      duration: 4
    };
  }

  /**
   * Build Stretto section (compressed entries)
   */
  private static buildStretto(
    params: FugueParams,
    fb: FundamentalBassPlan
  ): FugueSection {
    const voices: VoiceEntry[] = [];
    const overlapBeats = Math.max(1, params.entrySpacing * (1 - params.strettoDensity));

    for (let i = 0; i < params.numVoices; i++) {
      const baseMaterial = params.subject.slice(0, 6); // Use subject head
      // Pad with rests for entry delay
      const material = this.padMaterialWithDelay(baseMaterial, i * overlapBeats);
      
      voices.push({
        voiceId: `Voice ${i + 1}`,
        material,
        rhythm: this.buildRhythmForMaterial(material, i * overlapBeats),
        startTime: i * overlapBeats,
        transposition: i % 2 === 0 ? 0 : params.entryInterval,
        role: 'subject'
      });
    }

    return {
      name: 'Stretto',
      voices,
      startMeasure: 16,
      duration: 4
    };
  }

  /**
   * Build Recapitulation with final cadence
   */
  private static buildRecapitulation(
    params: FugueParams,
    fb: FundamentalBassPlan
  ): FugueSection {
    const voices: VoiceEntry[] = [];

    // Return to tonic with full subject
    for (let i = 0; i < Math.min(params.numVoices, 3); i++) {
      // Pad with rests for entry delay
      const material = this.padMaterialWithDelay(params.subject, i * 2);
      
      voices.push({
        voiceId: `Voice ${i + 1}`,
        material,
        rhythm: this.buildRhythmForMaterial(material, i * 2),
        startTime: i * 2,
        transposition: 0,
        role: 'subject'
      });
    }

    return {
      name: 'Recapitulation',
      voices,
      startMeasure: 20,
      duration: 4
    };
  }

  /**
   * Apply variations to sections using comprehensive transformation system
   */
  private static applyVariations(
    sections: FugueSection[], 
    variations: VariationSpec[],
    mode?: Mode
  ): void {
    console.log(`🎨 Applying ${variations.length} variations to ${sections.length} sections`);
    
    variations.forEach((variation, varIdx) => {
      console.log(`📝 Variation ${varIdx + 1}/${variations.length}: ${variation.type}`);
      
      sections.forEach((section, secIdx) => {
        section.voices.forEach((voice, voiceIdx) => {
          // Apply scope filtering
          if (variation.scope === 'subject' && voice.role !== 'subject') {
            return;
          }
          if (variation.scope === 'answer' && voice.role !== 'answer') {
            return;
          }
          
          console.log(`  → Applying to Section "${section.name}", Voice ${voiceIdx + 1} (${voice.role})`);
          
          // Apply transformation using the comprehensive system
          try {
            const result = this.applyTransformation(
              voice.material,
              voice.rhythm,
              variation,
              mode
            );
            
            voice.material = result.theme;
            voice.rhythm = result.rhythm;
            
            console.log(`    ✅ Success: ${voice.material.length} notes, ${voice.rhythm.length} rhythm beats`);
          } catch (error) {
            console.error(`    ❌ Error applying ${variation.type}:`, error);
          }
        });
      });
    });
  }

  // ============================================================================
  // COMPREHENSIVE TRANSFORMATION SYSTEM (12 Types)
  // ============================================================================

  /**
   * 1. INVERSION - Mirror theme around axis
   */
  private static invertTheme(theme: Theme, axis: MidiNote): Theme {
    console.log(`🔄 [INVERSION] Inverting ${theme.length} notes around axis ${axis}`);
    const result = theme.map(note => 2 * axis - note);
    console.log(`✅ [INVERSION] Result range: ${Math.min(...result)} to ${Math.max(...result)}`);
    return result;
  }

  /**
   * 2. RETROGRADE - Reverse theme
   */
  private static retrogradeTheme(theme: Theme): Theme {
    console.log(`🔄 [RETROGRADE] Reversing ${theme.length} notes`);
    const result = [...theme].reverse();
    console.log(`✅ [RETROGRADE] Reversed theme`);
    return result;
  }

  /**
   * 3. AUGMENTATION - Increase note durations (rhythm transformation)
   * Affects rhythm, not pitch
   */
  private static augmentRhythm(rhythm: Rhythm, factor: number = 2): Rhythm {
    console.log(`🔄 [AUGMENTATION] Augmenting rhythm by factor ${factor}`);
    const result = rhythm.map(beat => beat * factor);
    console.log(`✅ [AUGMENTATION] New total duration: ${result.reduce((a, b) => a + b, 0)} beats`);
    return result;
  }

  /**
   * 4. DIMINUTION - Decrease note durations (rhythm transformation)
   * Affects rhythm, not pitch
   */
  private static diminishRhythm(rhythm: Rhythm, factor: number = 2): Rhythm {
    console.log(`🔄 [DIMINUTION] Diminishing rhythm by factor ${factor}`);
    const result = rhythm.map(beat => Math.max(0.25, beat / factor)); // Min duration 0.25 beats
    console.log(`✅ [DIMINUTION] New total duration: ${result.reduce((a, b) => a + b, 0)} beats`);
    return result;
  }

  /**
   * 5. TRUNCATION - Cut theme to specific length
   */
  private static truncateTheme(theme: Theme, length?: number): Theme {
    const cutLength = length || Math.ceil(theme.length * 0.6);
    console.log(`🔄 [TRUNCATION] Truncating from ${theme.length} to ${cutLength} notes`);
    const result = theme.slice(0, cutLength);
    console.log(`✅ [TRUNCATION] Truncated theme created`);
    return result;
  }

  /**
   * 6. ELISION - Remove middle portion, connect beginning and end
   */
  private static elideTheme(theme: Theme): Theme {
    console.log(`🔄 [ELISION] Eliding middle section of ${theme.length} notes`);
    const headLength = Math.floor(theme.length * 0.3);
    const tailLength = Math.floor(theme.length * 0.3);
    const result = [
      ...theme.slice(0, headLength),
      ...theme.slice(theme.length - tailLength)
    ];
    console.log(`✅ [ELISION] Elided theme: ${headLength} + ${tailLength} = ${result.length} notes`);
    return result;
  }

  /**
   * 7. FRAGMENTATION - Break into smaller fragments
   */
  private static fragmentTheme(theme: Theme, fragmentSize?: number): Theme {
    const size = fragmentSize || Math.max(2, Math.floor(theme.length / 3));
    console.log(`🔄 [FRAGMENTATION] Fragmenting ${theme.length} notes into size ${size}`);
    const result = theme.slice(0, size);
    console.log(`✅ [FRAGMENTATION] Fragment extracted: ${result.length} notes`);
    return result;
  }

  /**
   * 8. SEQUENCE - Repeat theme at different pitch levels
   */
  private static sequenceTheme(theme: Theme, steps: number[] = [0, 2, 4, 2, 0]): Theme {
    console.log(`🔄 [SEQUENCE] Creating sequence with steps: [${steps.join(', ')}]`);
    const result: Theme = [];
    steps.forEach((step, idx) => {
      theme.forEach(note => {
        result.push(note + step);
      });
    });
    console.log(`✅ [SEQUENCE] Sequence created: ${result.length} notes (${steps.length} iterations)`);
    return result;
  }

  /**
   * 9. ORNAMENTATION - Add decorative notes
   */
  private static ornamentTheme(theme: Theme, style: 'trill' | 'turn' | 'mordent' | 'neighbor' = 'neighbor'): Theme {
    console.log(`🔄 [ORNAMENTATION] Ornamenting ${theme.length} notes with ${style}`);
    const result: Theme = [];
    
    theme.forEach((note, idx) => {
      switch (style) {
        case 'trill':
          // Add upper neighbor trill
          result.push(note, note + 2, note, note + 2);
          break;
        case 'turn':
          // Add turn figure
          result.push(note + 2, note, note - 2, note);
          break;
        case 'mordent':
          // Add mordent (lower neighbor)
          result.push(note, note - 2, note);
          break;
        case 'neighbor':
        default:
          // Add upper neighbor
          result.push(note, note + 2, note);
          break;
      }
    });
    
    console.log(`✅ [ORNAMENTATION] Ornamented theme: ${theme.length} → ${result.length} notes`);
    return result;
  }

  /**
   * 10. TRANSPOSITION - Move theme to different pitch level
   */
  private static transposeTheme(theme: Theme, semitones: number): Theme {
    console.log(`🔄 [TRANSPOSITION] Transposing ${theme.length} notes by ${semitones} semitones`);
    const result = theme.map(note => note + semitones);
    console.log(`✅ [TRANSPOSITION] New range: ${Math.min(...result)} to ${Math.max(...result)}`);
    return result;
  }

  /**
   * 11. MODE SHIFTING - Transform theme to different mode
   */
  private static modeShiftTheme(theme: Theme, sourceMode: Mode, targetMode: Mode): Theme {
    console.log(`🔄 [MODE_SHIFTING] Shifting from ${sourceMode.name} to ${targetMode.name}`);
    
    const result: Theme = [];
    const sourceFinal = sourceMode.final;
    const targetFinal = targetMode.final;
    
    theme.forEach((note, idx) => {
      // Calculate degree in source mode
      const relativeToFinal = note - (Math.floor(note / 12) * 12 + sourceFinal);
      const sourceDegree = this.findDegreeInMode(relativeToFinal, sourceMode);
      
      // Map to target mode
      const targetNote = this.mapDegreeToMode(sourceDegree, targetMode, Math.floor(note / 12) * 12);
      result.push(targetNote);
    });
    
    console.log(`✅ [MODE_SHIFTING] Mode shift complete: ${result.length} notes`);
    return result;
  }

  /**
   * 12. CHROMATIC - Add chromatic passing tones
   */
  private static chromaticTheme(theme: Theme): Theme {
    console.log(`🔄 [CHROMATIC] Adding chromatic passing tones to ${theme.length} notes`);
    const result: Theme = [];
    
    for (let i = 0; i < theme.length - 1; i++) {
      result.push(theme[i]);
      
      const interval = theme[i + 1] - theme[i];
      // Add chromatic passing tone if interval is 2+ semitones
      if (Math.abs(interval) >= 2) {
        const passingTone = theme[i] + (interval > 0 ? 1 : -1);
        result.push(passingTone);
      }
    }
    result.push(theme[theme.length - 1]); // Add final note
    
    console.log(`✅ [CHROMATIC] Chromatic theme: ${theme.length} → ${result.length} notes`);
    return result;
  }

  // ============================================================================
  // HELPER FUNCTIONS FOR MODE SHIFTING
  // ============================================================================

  private static findDegreeInMode(pitchClass: number, mode: Mode): number {
    // Normalize pitch class to 0-11
    const normalizedPC = ((pitchClass % 12) + 12) % 12;
    
    // Build scale from mode
    let currentPC = 0;
    for (let degree = 0; degree < mode.stepPattern.length; degree++) {
      if (currentPC === normalizedPC) {
        return degree;
      }
      currentPC = (currentPC + mode.stepPattern[degree]) % 12;
    }
    
    // If not found in scale, return closest degree
    return 0;
  }

  private static mapDegreeToMode(degree: number, mode: Mode, octaveBase: number): MidiNote {
    let currentPC = mode.final;
    
    for (let i = 0; i < degree && i < mode.stepPattern.length; i++) {
      currentPC = (currentPC + mode.stepPattern[i]) % 12;
    }
    
    return octaveBase + currentPC;
  }

  // ============================================================================
  // APPLY TRANSFORMATIONS
  // ============================================================================

  /**
   * Apply a specific transformation to theme and rhythm
   * FIX #4: Added comprehensive rhythm synchronization validation
   */
  static applyTransformation(
    theme: Theme,
    rhythm: Rhythm,
    variation: VariationSpec,
    mode?: Mode
  ): { theme: Theme; rhythm: Rhythm } {
    console.log(`🎵 Applying transformation: ${variation.type}`);
    
    // FIX #4: Validate input rhythm length matches theme length
    if (rhythm.length !== theme.length) {
      console.warn(`⚠️ Rhythm length (${rhythm.length}) doesn't match theme length (${theme.length}), padding/truncating...`);
      while (rhythm.length < theme.length) {
        rhythm.push(1); // Default to quarter notes
      }
      if (rhythm.length > theme.length) {
        rhythm = rhythm.slice(0, theme.length);
      }
    }
    
    let newTheme = [...theme];
    let newRhythm = [...rhythm];

    try {
      switch (variation.type) {
        case 'INVERTED':
          newTheme = this.invertTheme(newTheme, newTheme[0]);
          break;

        case 'RETROGRADE':
          newTheme = this.retrogradeTheme(newTheme);
          newRhythm = [...newRhythm].reverse();
          break;

        case 'AUGMENTED':
          newRhythm = this.augmentRhythm(newRhythm, variation.factor || 2);
          break;

        case 'DIMINUTION':
          newRhythm = this.diminishRhythm(newRhythm, variation.factor || 2);
          break;

        case 'TRUNCATION':
          newTheme = this.truncateTheme(newTheme, variation.factor);
          newRhythm = newRhythm.slice(0, newTheme.length);
          break;

        case 'ELISION':
          newTheme = this.elideTheme(newTheme);
          // Proportionally adjust rhythm
          const headLength = Math.floor(theme.length * 0.3);
          const tailLength = Math.floor(theme.length * 0.3);
          newRhythm = [
            ...rhythm.slice(0, headLength),
            ...rhythm.slice(rhythm.length - tailLength)
          ];
          break;

        case 'FRAGMENTATION':
          newTheme = this.fragmentTheme(newTheme, variation.factor);
          newRhythm = newRhythm.slice(0, newTheme.length);
          break;

        case 'SEQUENCE':
          const steps = variation.sequenceSteps || [0, 2, 4, 2, 0];
          newTheme = this.sequenceTheme(newTheme, steps);
          // Repeat rhythm for each sequence step
          const originalRhythm = [...newRhythm];
          newRhythm = [];
          steps.forEach(() => {
            newRhythm.push(...originalRhythm);
          });
          break;

        case 'ORNAMENTATION':
          const ornamentStyle = variation.ornamentStyle || 'neighbor';
          newTheme = this.ornamentTheme(newTheme, ornamentStyle);
          // Distribute rhythm across ornaments
          newRhythm = [];
          const notesPerOrnament = ornamentStyle === 'trill' ? 4 : 
                                  ornamentStyle === 'turn' ? 4 : 
                                  ornamentStyle === 'mordent' ? 3 : 3;
          rhythm.forEach(beat => {
            const subdivided = beat / notesPerOrnament;
            for (let i = 0; i < notesPerOrnament; i++) {
              newRhythm.push(subdivided);
            }
          });
          break;

        case 'TRANSPOSITION':
          newTheme = this.transposeTheme(newTheme, variation.factor || 5);
          break;

        case 'MODE_SHIFTING':
          if (mode && variation.targetMode) {
            newTheme = this.modeShiftTheme(newTheme, mode, variation.targetMode);
          } else {
            console.warn('⚠️ [MODE_SHIFTING] Missing mode or targetMode, skipping');
            
            // FIX #3: Add user-facing feedback for skipped transformation
            if (typeof window !== 'undefined') {
              // Use toast if available (safe check)
              try {
                const { toast } = require('sonner@2.0.3');
                if (toast && typeof toast.warning === 'function') {
                  toast.warning('MODE_SHIFTING transformation skipped', {
                    description: mode ? 'Target mode not specified' : 'No mode selected - select a mode in the Mode Selector',
                    duration: 5000
                  });
                }
              } catch (err) {
                // Silent fail if toast not available
                console.log('ℹ️ Toast notification not available:', err);
              }
            }
          }
          break;

        case 'CHROMATIC':
          newTheme = this.chromaticTheme(newTheme);
          // Adjust rhythm for added chromatic notes
          newRhythm = [];
          let chromaticIdx = 0;
          for (let i = 0; i < theme.length - 1; i++) {
            const interval = theme[i + 1] - theme[i];
            if (Math.abs(interval) >= 2) {
              // Split rhythm between main note and passing tone
              newRhythm.push(rhythm[i] * 0.6);
              newRhythm.push(rhythm[i] * 0.4);
              chromaticIdx++;
            } else {
              newRhythm.push(rhythm[i]);
            }
            chromaticIdx++;
          }
          newRhythm.push(rhythm[rhythm.length - 1]);
          break;

        default:
          console.warn(`⚠️ Unknown transformation type: ${variation.type}`);
      }

      // FIX #4: Final validation - ensure rhythm length matches theme length
      if (newRhythm.length !== newTheme.length) {
        console.warn(`⚠️ Post-transformation rhythm mismatch: rhythm=${newRhythm.length}, theme=${newTheme.length}`);
        console.log(`🔧 Synchronizing rhythm to match theme length...`);
        
        // Pad with quarter notes if rhythm too short
        while (newRhythm.length < newTheme.length) {
          newRhythm.push(1); // Quarter note default
        }
        
        // Truncate if rhythm too long
        if (newRhythm.length > newTheme.length) {
          newRhythm = newRhythm.slice(0, newTheme.length);
        }
        
        console.log(`✅ Rhythm synchronized: ${newRhythm.length} beats match ${newTheme.length} notes`);
      }

      console.log(`✅ Transformation ${variation.type} completed successfully`);
      console.log(`📊 Output: ${newTheme.length} notes, ${newRhythm.length} rhythm values`);
      return { theme: newTheme, rhythm: newRhythm };

    } catch (error) {
      console.error(`❌ Error applying transformation ${variation.type}:`, error);
      // FIX #4: Ensure original arrays match on error return
      const safeRhythm = rhythm.length === theme.length ? rhythm : 
        Array(theme.length).fill(1);
      return { theme, rhythm: safeRhythm };
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  private static generateCountersubject(subject: Theme, mode?: Mode): Theme {
    // Generate contrary motion countersubject
    const cs: Theme = [];
    for (let i = 0; i < subject.length; i++) {
      if (i === 0) {
        cs.push(subject[0] + 5); // Start a fourth above
      } else {
        const subjectMotion = subject[i] - subject[i - 1];
        cs.push(cs[i - 1] - subjectMotion); // Contrary motion
      }
    }
    return cs;
  }

  /**
   * Build rhythm for material with entry delay
   * NOTE: This creates a rhythm array that matches the PADDED melody length
   * The melody should be padded with -1 (rest) values before calling this
   */
  private static buildRhythmForMaterial(material: Theme, delay: number): Rhythm {
    // Material should already be padded with -1 rests for the delay
    // So we just create quarter notes for the entire length
    return new Array(material.length).fill(1);
  }

  /**
   * Pad material (melody) with rest notes (-1) for entry delay
   * This ensures melody and rhythm lengths stay synchronized
   */
  private static padMaterialWithDelay(material: Theme, delayBeats: number): Theme {
    if (delayBeats === 0) return material;
    const restNotes = new Array(Math.floor(delayBeats)).fill(-1); // -1 = rest (NOT 0 which is MIDI C-1)
    return [...restNotes, ...material];
  }

  private static getArchitectureDescription(arch: FugueArchitecture): string {
    const descriptions: Record<FugueArchitecture, string> = {
      CLASSIC_2: 'Two-part fugue with subject and answer',
      CLASSIC_3: 'Three-part fugue with countersubject',
      CLASSIC_4: 'Four-part SATB fugue',
      CLASSIC_5: 'Five-part grand fugue',
      ADDITIVE: 'Additive fugue - voices gradually added',
      SUBTRACTIVE: 'Subtractive fugue - voices gradually removed',
      ROTATIONAL: 'Rotational fugue - voices cycle roles',
      MIRROR: 'Mirror fugue - symmetric inversions',
      HOCKETED: 'Hocketed fugue - interlocking notes',
      POLYRHYTHMIC: 'Polyrhythmic fugue - multiple meters',
      RECURSIVE: 'Recursive fugue - self-similar structure',
      META: 'Meta-fugue - fugue of fugues',
      SPATIAL: 'Spatial fugue - 3D positioning',
      ADAPTIVE: 'Adaptive fugue - real-time transformation'
    };
    return descriptions[arch] || 'Classical fugue';
  }

  /**
   * Convert FugueResult to Part[] for playback compatibility
   */
  static fugueToParts(fugueResult: FugueResult): Part[] {
    const parts: Part[] = [];
    const allVoices = fugueResult.sections.flatMap(section => section.voices);

    // Group by voiceId
    const voiceMap = new Map<string, VoiceEntry[]>();
    allVoices.forEach(voice => {
      if (!voiceMap.has(voice.voiceId)) {
        voiceMap.set(voice.voiceId, []);
      }
      voiceMap.get(voice.voiceId)!.push(voice);
    });

    // Convert each voice to a Part
    voiceMap.forEach((entries, voiceId) => {
      const melody: Theme = [];
      const rhythm: Rhythm = [];

      entries.forEach(entry => {
        melody.push(...entry.material);
        rhythm.push(...entry.rhythm);
      });

      parts.push({ melody, rhythm });
    });

    return parts;
  }
}
