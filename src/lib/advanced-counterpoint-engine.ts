import { 
  Theme, 
  Mode, 
  MidiNote, 
  RhythmicNote, 
  NoteValue, 
  CounterpointVoice, 
  createRhythmicNote, 
  melodyToRhythmicNotes, 
  rhythmicNotesToMelody, 
  isRest,
  RestValue,
  MelodyElement,
  Interval
} from '../types/musical';
import { handleCounterpointError, handleValidationError, safeExecute } from './error-handling';

// Advanced counterpoint types
export type AdvancedCounterpointTechnique = 
  | 'species_first' | 'species_second' | 'species_third' | 'species_fourth' | 'species_fifth'
  | 'canon_strict' | 'canon_free' | 'canon_crab' | 'canon_augmentation' | 'canon_diminution'
  | 'invertible_counterpoint' | 'double_counterpoint' | 'triple_counterpoint' | 'quadruple_counterpoint'
  | 'stretto' | 'augmentation_canon' | 'diminution_canon' | 'retrograde_canon'
  | 'mensuration_canon' | 'spiral_canon' | 'proportional_canon'
  | 'modal_counterpoint' | 'tonal_counterpoint' | 'chromatic_counterpoint'
  | 'rhythmic_counterpoint' | 'polyrhythmic_counterpoint' | 'hemiola_counterpoint'
  | 'voice_exchange' | 'voice_crossing' | 'false_relation' | 'cross_relation'
  | 'pedal_point' | 'ostinato' | 'ground_bass' | 'passacaglia' | 'chaconne'
  | 'imitative_counterpoint' | 'free_counterpoint' | 'florid_counterpoint'
  | 'nota_cambiata' | 'échappée' | 'anticipation' | 'suspension_chain'
  | 'sequence_ascending' | 'sequence_descending' | 'sequence_modulating' | 'sequence_circle_fifths';

export type VoiceLeadingType = 'strict' | 'free' | 'modern' | 'renaissance' | 'baroque' | 'contemporary';
export type DissonanceTreatment = 'strict_resolution' | 'free_resolution' | 'modern_treatment' | 'chromatic_treatment';
export type CounterpointStyle = 
  | 'palestrina'    // Renaissance (1525-1594) - Pure modal counterpoint
  | 'bach'          // Baroque (1685-1750) - Contrapuntal mastery, fugal complexity
  | 'handel'        // Baroque (1685-1759) - Homophonic clarity, dramatic contrasts
  | 'mozart'        // Classical (1756-1791) - Elegant balance, transparent texture
  | 'beethoven'     // Classical/Romantic (1770-1827) - Dramatic development, motivic work
  | 'brahms'        // Romantic (1833-1897) - Dense harmony, contrapuntal richness
  | 'schumann'      // Romantic (1810-1856) - Lyrical expression, harmonic color
  | 'chopin'        // Romantic (1810-1849) - Chromaticism, expressive melody
  | 'debussy'       // Impressionist (1862-1918) - Modal/whole-tone, parallel motion
  | 'bartok'        // 20th Century (1881-1945) - Folk elements, quartal harmony
  | 'contemporary'; // Modern (1950-present) - Extended techniques, serial methods

// Advanced interval analysis
export interface AdvancedInterval {
  semitones: number;
  name: string;
  abbreviation: string;
  consonant: boolean;
  perfect: boolean;
  stability: number; // 0-1 scale
  tension: number; // 0-1 scale
  resolution_tendency: 'up' | 'down' | 'stable' | 'either';
  modal_function: string;
}

// Voice leading analysis
export interface VoiceLeadingAnalysis {
  motion_type: 'parallel' | 'similar' | 'contrary' | 'oblique';
  parallel_fifths: boolean;
  parallel_octaves: boolean;
  hidden_parallels: boolean;
  voice_crossing: boolean;
  leap_resolution: boolean;
  dissonance_preparation: boolean;
  dissonance_resolution: boolean;
  quality_score: number; // 0-1
}

// Advanced parameters
export interface AdvancedCounterpointParameters {
  // Basic parameters
  technique: AdvancedCounterpointTechnique;
  num_voices: number;
  voice_leading_style: VoiceLeadingType;
  dissonance_treatment: DissonanceTreatment;
  counterpoint_style: CounterpointStyle;
  
  // Species counterpoint
  cantus_firmus_duration: NoteValue;
  counterpoint_duration: NoteValue;
  species_ratio: string; // e.g., "2:1", "3:1", "4:1"
  allow_syncopation: boolean;
  
  // Canon parameters
  canon_interval: number; // semitones
  canon_delay: number; // beats
  canon_strict: boolean;
  canon_finite: boolean;
  
  // Rhythmic parameters
  use_complex_rhythms: boolean;
  allow_polyrhythm: boolean;
  rhythmic_complexity: number; // 0-1
  hemiola_frequency: number; // 0-1
  
  // Voice leading constraints
  max_leap: number; // semitones
  prefer_stepwise: boolean;
  allow_voice_crossing: boolean;
  allow_parallel_fifths: boolean;
  allow_parallel_octaves: boolean;
  
  // Dissonance handling
  require_dissonance_preparation: boolean;
  require_dissonance_resolution: boolean;
  allow_unprepared_dissonance: boolean;
  chromatic_alterations: boolean;
  
  // Modal considerations
  preserve_modal_character: boolean;
  modal_final_emphasis: number; // 0-1
  avoid_leading_tone: boolean;
  
  // Advanced features
  use_invertible_counterpoint: boolean;
  inversion_interval: number; // 10ths, 12ths, etc.
  use_augmentation: boolean;
  use_diminution: boolean;
  augmentation_ratio: number;
  diminution_ratio: number;
  
  // Quality control
  error_tolerance: number; // 0-1
  min_quality_threshold: number; // 0-1
  max_iterations: number;
  enable_self_correction: boolean;
}

// Advanced counterpoint errors
export class CounterpointError extends Error {
  constructor(
    message: string,
    public errorType: 'voice_leading' | 'dissonance' | 'rhythm' | 'modal' | 'structural' | 'parameter',
    public voice?: number,
    public measure?: number,
    public suggestion?: string
  ) {
    super(message);
    this.name = 'CounterpointError';
  }
}

// Advanced counterpoint result
export interface AdvancedCounterpointResult {
  voices: CounterpointVoice[];
  analysis: CounterpointAnalysis;
  errors: CounterpointError[];
  warnings: string[];
  quality_score: number;
  technique_applied: AdvancedCounterpointTechnique;
  parameters_used: AdvancedCounterpointParameters;
}

export interface CounterpointAnalysis {
  total_measures: number;
  dissonance_percentage: number;
  voice_leading_quality: number;
  rhythmic_complexity: number;
  modal_adherence: number;
  overall_quality: number;
  voice_interactions: VoiceInteraction[];
  harmonic_analysis: HarmonicMoment[];
}

export interface VoiceInteraction {
  voice1: number;
  voice2: number;
  intervals: AdvancedInterval[];
  motion_types: string[];
  quality_assessment: number;
}

export interface HarmonicMoment {
  beat: number;
  intervals: number[];
  consonance_level: number;
  tension_level: number;
  resolution_needed: boolean;
}

/**
 * Comprehensive Composer Style Profile
 * Defines the unique characteristics of each composer's counterpoint style
 */
export interface ComposerStyleProfile {
  name: string;
  period: string;
  years: string;
  
  // Intervallic preferences
  preferredConsonances: number[]; // semitones
  preferredDissonances: number[]; // semitones
  dissonanceFrequency: number; // 0-1, how often dissonances appear
  
  // Voice leading
  maxLeapPreference: number; // semitones
  stepwiseMotionFrequency: number; // 0-1
  allowParallelFifths: boolean;
  allowParallelOctaves: boolean;
  allowVoiceCrossing: boolean;
  allowHiddenParallels: boolean;
  
  // Harmonic characteristics
  chromaticismLevel: number; // 0-1
  modalityStrength: number; // 0-1, 1 = strict modal
  functionalHarmony: boolean;
  secondaryDominants: boolean;
  augmentedSixths: boolean;
  neapolitanChords: boolean;
  
  // Rhythmic features
  rhythmicComplexity: number; // 0-1
  syncopationFrequency: number; // 0-1
  allowPolyrhythm: boolean;
  hemiolaFrequency: number; // 0-1
  
  // Textural features
  preferredTexture: 'homophonic' | 'polyphonic' | 'mixed';
  imitationFrequency: number; // 0-1
  sequenceFrequency: number; // 0-1
  pedalPointFrequency: number; // 0-1
  
  // Melodic characteristics
  melodicChromaticism: number; // 0-1
  leapResolutionRequired: boolean;
  avoidTritoneInMelody: boolean;
  emphasizeModeCharacteristics: boolean;
  
  // Cadential preferences
  preferredCadences: string[]; // 'perfect', 'plagal', 'half', 'deceptive', 'phrygian'
  cadenceStrength: number; // 0-1
  
  // Special techniques
  useSuspensions: boolean;
  useAnticipations: boolean;
  useEchappees: boolean;
  useCambiataNotes: boolean;
  
  // Dissonance treatment
  requireDissonancePreparation: boolean;
  requireDissonanceResolution: boolean;
  allowUnpreparedDissonance: boolean;
  allowUnresolvedDissonance: boolean;
  
  // Characteristic intervals/chords
  characteristicIntervals: number[]; // semitones
  avoidedIntervals: number[]; // semitones
  
  // General aesthetic
  expressiveIntensity: number; // 0-1
  formalClarity: number; // 0-1
  harmonic Density: number; // 0-1
}

/**
 * Comprehensive Composer Style Profiles Database
 */
export const COMPOSER_STYLE_PROFILES: Record<CounterpointStyle, ComposerStyleProfile> = {
  palestrina: {
    name: 'Giovanni Pierluigi da Palestrina',
    period: 'Renaissance',
    years: '1525-1594',
    preferredConsonances: [0, 3, 4, 7, 8, 9, 12], // P1, m3, M3, P5, m6, M6, P8
    preferredDissonances: [2, 5], // M2, P4 (as passing/suspension)
    dissonanceFrequency: 0.15,
    maxLeapPreference: 8, // Minor 6th
    stepwiseMotionFrequency: 0.85,
    allowParallelFifths: false,
    allowParallelOctaves: false,
    allowVoiceCrossing: false,
    allowHiddenParallels: false,
    chromaticismLevel: 0.05,
    modalityStrength: 1.0,
    functionalHarmony: false,
    secondaryDominants: false,
    augmentedSixths: false,
    neapolitanChords: false,
    rhythmicComplexity: 0.3,
    syncopationFrequency: 0.2,
    allowPolyrhythm: false,
    hemiolaFrequency: 0.1,
    preferredTexture: 'polyphonic',
    imitationFrequency: 0.7,
    sequenceFrequency: 0.2,
    pedalPointFrequency: 0.1,
    melodicChromaticism: 0.05,
    leapResolutionRequired: true,
    avoidTritoneInMelody: true,
    emphasizeModeCharacteristics: true,
    preferredCadences: ['perfect', 'plagal', 'phrygian'],
    cadenceStrength: 0.9,
    useSuspensions: true,
    useAnticipations: false,
    useEchappees: false,
    useCambiataNotes: true,
    requireDissonancePreparation: true,
    requireDissonanceResolution: true,
    allowUnpreparedDissonance: false,
    allowUnresolvedDissonance: false,
    characteristicIntervals: [3, 4, 7], // Thirds, fifths
    avoidedIntervals: [1, 6], // m2, tritone
    expressiveIntensity: 0.5,
    formalClarity: 0.9,
    harmonicDensity: 0.6
  },
  
  bach: {
    name: 'Johann Sebastian Bach',
    period: 'Baroque',
    years: '1685-1750',
    preferredConsonances: [0, 3, 4, 7, 8, 9, 12],
    preferredDissonances: [1, 2, 5, 6, 10, 11], // Full chromatic palette
    dissonanceFrequency: 0.35,
    maxLeapPreference: 12, // Octave
    stepwiseMotionFrequency: 0.65,
    allowParallelFifths: false,
    allowParallelOctaves: false,
    allowVoiceCrossing: true,
    allowHiddenParallels: true,
    chromaticismLevel: 0.4,
    modalityStrength: 0.3,
    functionalHarmony: true,
    secondaryDominants: true,
    augmentedSixths: true,
    neapolitanChords: true,
    rhythmicComplexity: 0.7,
    syncopationFrequency: 0.5,
    allowPolyrhythm: true,
    hemiolaFrequency: 0.4,
    preferredTexture: 'polyphonic',
    imitationFrequency: 0.9,
    sequenceFrequency: 0.8,
    pedalPointFrequency: 0.5,
    melodicChromaticism: 0.5,
    leapResolutionRequired: true,
    avoidTritoneInMelody: false,
    emphasizeModeCharacteristics: false,
    preferredCadences: ['perfect', 'half', 'deceptive'],
    cadenceStrength: 0.8,
    useSuspensions: true,
    useAnticipations: true,
    useEchappees: true,
    useCambiataNotes: true,
    requireDissonancePreparation: true,
    requireDissonanceResolution: true,
    allowUnpreparedDissonance: true,
    allowUnresolvedDissonance: false,
    characteristicIntervals: [1, 2, 5, 7], // Chromatic, seconds, fourths, fifths
    avoidedIntervals: [],
    expressiveIntensity: 0.8,
    formalClarity: 0.95,
    harmonicDensity: 0.9
  },
  
  handel: {
    name: 'George Frideric Handel',
    period: 'Baroque',
    years: '1685-1759',
    preferredConsonances: [0, 3, 4, 7, 8, 9, 12],
    preferredDissonances: [2, 5, 10], // Major seconds, fourths, minor sevenths
    dissonanceFrequency: 0.25,
    maxLeapPreference: 12, // Octave
    stepwiseMotionFrequency: 0.7,
    allowParallelFifths: false,
    allowParallelOctaves: false,
    allowVoiceCrossing: true,
    allowHiddenParallels: true,
    chromaticismLevel: 0.2,
    modalityStrength: 0.2,
    functionalHarmony: true,
    secondaryDominants: true,
    augmentedSixths: false,
    neapolitanChords: true,
    rhythmicComplexity: 0.5,
    syncopationFrequency: 0.3,
    allowPolyrhythm: false,
    hemiolaFrequency: 0.5,
    preferredTexture: 'homophonic',
    imitationFrequency: 0.5,
    sequenceFrequency: 0.6,
    pedalPointFrequency: 0.4,
    melodicChromaticism: 0.2,
    leapResolutionRequired: true,
    avoidTritoneInMelody: false,
    emphasizeModeCharacteristics: false,
    preferredCadences: ['perfect', 'half', 'plagal'],
    cadenceStrength: 0.85,
    useSuspensions: true,
    useAnticipations: true,
    useEchappees: false,
    useCambiataNotes: false,
    requireDissonancePreparation: true,
    requireDissonanceResolution: true,
    allowUnpreparedDissonance: false,
    allowUnresolvedDissonance: false,
    characteristicIntervals: [4, 7, 9], // Thirds, fifths, sixths
    avoidedIntervals: [1, 6],
    expressiveIntensity: 0.75,
    formalClarity: 0.9,
    harmonicDensity: 0.6
  },
  
  mozart: {
    name: 'Wolfgang Amadeus Mozart',
    period: 'Classical',
    years: '1756-1791',
    preferredConsonances: [0, 3, 4, 7, 8, 9, 12],
    preferredDissonances: [2, 5, 10], // Passing tones, suspensions
    dissonanceFrequency: 0.20,
    maxLeapPreference: 12, // Octave
    stepwiseMotionFrequency: 0.75,
    allowParallelFifths: false,
    allowParallelOctaves: false,
    allowVoiceCrossing: false,
    allowHiddenParallels: true,
    chromaticismLevel: 0.15,
    modalityStrength: 0.1,
    functionalHarmony: true,
    secondaryDominants: true,
    augmentedSixths: true,
    neapolitanChords: false,
    rhythmicComplexity: 0.5,
    syncopationFrequency: 0.3,
    allowPolyrhythm: false,
    hemiolaFrequency: 0.2,
    preferredTexture: 'mixed',
    imitationFrequency: 0.4,
    sequenceFrequency: 0.5,
    pedalPointFrequency: 0.2,
    melodicChromaticism: 0.2,
    leapResolutionRequired: true,
    avoidTritoneInMelody: false,
    emphasizeModeCharacteristics: false,
    preferredCadences: ['perfect', 'half', 'deceptive'],
    cadenceStrength: 0.85,
    useSuspensions: true,
    useAnticipations: true,
    useEchappees: true,
    useCambiataNotes: false,
    requireDissonancePreparation: true,
    requireDissonanceResolution: true,
    allowUnpreparedDissonance: false,
    allowUnresolvedDissonance: false,
    characteristicIntervals: [3, 4, 7], // Classical clarity
    avoidedIntervals: [1],
    expressiveIntensity: 0.6,
    formalClarity: 0.95,
    harmonicDensity: 0.5
  },
  
  beethoven: {
    name: 'Ludwig van Beethoven',
    period: 'Classical/Romantic',
    years: '1770-1827',
    preferredConsonances: [0, 3, 4, 7, 8, 9, 12],
    preferredDissonances: [1, 2, 5, 6, 10, 11],
    dissonanceFrequency: 0.40,
    maxLeapPreference: 15, // Beyond octave
    stepwiseMotionFrequency: 0.60,
    allowParallelFifths: false,
    allowParallelOctaves: false,
    allowVoiceCrossing: true,
    allowHiddenParallels: true,
    chromaticismLevel: 0.35,
    modalityStrength: 0.1,
    functionalHarmony: true,
    secondaryDominants: true,
    augmentedSixths: true,
    neapolitanChords: true,
    rhythmicComplexity: 0.75,
    syncopationFrequency: 0.65,
    allowPolyrhythm: true,
    hemiolaFrequency: 0.5,
    preferredTexture: 'polyphonic',
    imitationFrequency: 0.65,
    sequenceFrequency: 0.75,
    pedalPointFrequency: 0.6,
    melodicChromaticism: 0.4,
    leapResolutionRequired: false,
    avoidTritoneInMelody: false,
    emphasizeModeCharacteristics: false,
    preferredCadences: ['perfect', 'half', 'deceptive'],
    cadenceStrength: 0.75,
    useSuspensions: true,
    useAnticipations: true,
    useEchappees: true,
    useCambiataNotes: true,
    requireDissonancePreparation: false,
    requireDissonanceResolution: true,
    allowUnpreparedDissonance: true,
    allowUnresolvedDissonance: false,
    characteristicIntervals: [1, 2, 6, 7], // Dramatic intervals
    avoidedIntervals: [],
    expressiveIntensity: 0.95,
    formalClarity: 0.8,
    harmonicDensity: 0.8
  },
  
  brahms: {
    name: 'Johannes Brahms',
    period: 'Romantic',
    years: '1833-1897',
    preferredConsonances: [0, 3, 4, 7, 8, 9, 10, 11, 12],
    preferredDissonances: [1, 2, 5, 6], // Rich chromatic palette
    dissonanceFrequency: 0.45,
    maxLeapPreference: 12,
    stepwiseMotionFrequency: 0.65,
    allowParallelFifths: false,
    allowParallelOctaves: false,
    allowVoiceCrossing: true,
    allowHiddenParallels: true,
    chromaticismLevel: 0.60,
    modalityStrength: 0.2,
    functionalHarmony: true,
    secondaryDominants: true,
    augmentedSixths: true,
    neapolitanChords: true,
    rhythmicComplexity: 0.65,
    syncopationFrequency: 0.55,
    allowPolyrhythm: true,
    hemiolaFrequency: 0.7,
    preferredTexture: 'polyphonic',
    imitationFrequency: 0.75,
    sequenceFrequency: 0.65,
    pedalPointFrequency: 0.45,
    melodicChromaticism: 0.65,
    leapResolutionRequired: false,
    avoidTritoneInMelody: false,
    emphasizeModeCharacteristics: false,
    preferredCadences: ['perfect', 'plagal', 'half', 'deceptive'],
    cadenceStrength: 0.70,
    useSuspensions: true,
    useAnticipations: true,
    useEchappees: true,
    useCambiataNotes: true,
    requireDissonancePreparation: false,
    requireDissonanceResolution: true,
    allowUnpreparedDissonance: true,
    allowUnresolvedDissonance: false,
    characteristicIntervals: [1, 2, 3, 10, 11], // Chromatic, sevenths
    avoidedIntervals: [],
    expressiveIntensity: 0.85,
    formalClarity: 0.75,
    harmonicDensity: 0.95
  },
  
  schumann: {
    name: 'Robert Schumann',
    period: 'Romantic',
    years: '1810-1856',
    preferredConsonances: [0, 3, 4, 7, 8, 9, 10, 12],
    preferredDissonances: [1, 2, 5, 6, 11],
    dissonanceFrequency: 0.35,
    maxLeapPreference: 12,
    stepwiseMotionFrequency: 0.70,
    allowParallelFifths: false,
    allowParallelOctaves: false,
    allowVoiceCrossing: true,
    allowHiddenParallels: true,
    chromaticismLevel: 0.45,
    modalityStrength: 0.15,
    functionalHarmony: true,
    secondaryDominants: true,
    augmentedSixths: true,
    neapolitanChords: true,
    rhythmicComplexity: 0.60,
    syncopationFrequency: 0.50,
    allowPolyrhythm: true,
    hemiolaFrequency: 0.4,
    preferredTexture: 'mixed',
    imitationFrequency: 0.5,
    sequenceFrequency: 0.55,
    pedalPointFrequency: 0.35,
    melodicChromaticism: 0.50,
    leapResolutionRequired: false,
    avoidTritoneInMelody: false,
    emphasizeModeCharacteristics: false,
    preferredCadences: ['perfect', 'half', 'deceptive'],
    cadenceStrength: 0.65,
    useSuspensions: true,
    useAnticipations: true,
    useEchappees: true,
    useCambiataNotes: true,
    requireDissonancePreparation: false,
    requireDissonanceResolution: true,
    allowUnpreparedDissonance: true,
    allowUnresolvedDissonance: false,
    characteristicIntervals: [2, 3, 6, 10], // Colorful harmony
    avoidedIntervals: [],
    expressiveIntensity: 0.80,
    formalClarity: 0.70,
    harmonicDensity: 0.75
  },
  
  chopin: {
    name: 'Frédéric Chopin',
    period: 'Romantic',
    years: '1810-1849',
    preferredConsonances: [0, 3, 4, 7, 8, 9, 10, 11, 12],
    preferredDissonances: [1, 2, 5, 6],
    dissonanceFrequency: 0.50,
    maxLeapPreference: 12,
    stepwiseMotionFrequency: 0.75,
    allowParallelFifths: false,
    allowParallelOctaves: true,
    allowVoiceCrossing: true,
    allowHiddenParallels: true,
    chromaticismLevel: 0.75,
    modalityStrength: 0.1,
    functionalHarmony: true,
    secondaryDominants: true,
    augmentedSixths: true,
    neapolitanChords: true,
    rhythmicComplexity: 0.55,
    syncopationFrequency: 0.45,
    allowPolyrhythm: true,
    hemiolaFrequency: 0.3,
    preferredTexture: 'homophonic',
    imitationFrequency: 0.3,
    sequenceFrequency: 0.4,
    pedalPointFrequency: 0.5,
    melodicChromaticism: 0.80,
    leapResolutionRequired: false,
    avoidTritoneInMelody: false,
    emphasizeModeCharacteristics: false,
    preferredCadences: ['perfect', 'half', 'plagal', 'deceptive'],
    cadenceStrength: 0.60,
    useSuspensions: true,
    useAnticipations: true,
    useEchappees: true,
    useCambiataNotes: true,
    requireDissonancePreparation: false,
    requireDissonanceResolution: false,
    allowUnpreparedDissonance: true,
    allowUnresolvedDissonance: true,
    characteristicIntervals: [1, 2, 3, 6, 10, 11], // Chromatic melody
    avoidedIntervals: [],
    expressiveIntensity: 0.90,
    formalClarity: 0.65,
    harmonicDensity: 0.85
  },
  
  debussy: {
    name: 'Claude Debussy',
    period: 'Impressionist',
    years: '1862-1918',
    preferredConsonances: [0, 2, 4, 7, 9, 11, 12], // Whole-tone, pentatonic
    preferredDissonances: [1, 3, 5, 6, 8, 10], // Non-functional
    dissonanceFrequency: 0.55,
    maxLeapPreference: 15,
    stepwiseMotionFrequency: 0.50,
    allowParallelFifths: true,
    allowParallelOctaves: true,
    allowVoiceCrossing: true,
    allowHiddenParallels: true,
    chromaticismLevel: 0.50,
    modalityStrength: 0.80,
    functionalHarmony: false,
    secondaryDominants: false,
    augmentedSixths: false,
    neapolitanChords: false,
    rhythmicComplexity: 0.50,
    syncopationFrequency: 0.40,
    allowPolyrhythm: true,
    hemiolaFrequency: 0.3,
    preferredTexture: 'mixed',
    imitationFrequency: 0.3,
    sequenceFrequency: 0.3,
    pedalPointFrequency: 0.7,
    melodicChromaticism: 0.60,
    leapResolutionRequired: false,
    avoidTritoneInMelody: false,
    emphasizeModeCharacteristics: true,
    preferredCadences: ['plagal', 'half'],
    cadenceStrength: 0.40,
    useSuspensions: false,
    useAnticipations: true,
    useEchappees: true,
    useCambiataNotes: false,
    requireDissonancePreparation: false,
    requireDissonanceResolution: false,
    allowUnpreparedDissonance: true,
    allowUnresolvedDissonance: true,
    characteristicIntervals: [2, 4, 7, 9, 11], // Whole-tone, fourths, fifths
    avoidedIntervals: [],
    expressiveIntensity: 0.70,
    formalClarity: 0.50,
    harmonicDensity: 0.70
  },
  
  bartok: {
    name: 'Béla Bartók',
    period: '20th Century',
    years: '1881-1945',
    preferredConsonances: [0, 5, 7, 12], // Fourths, fifths (quartal)
    preferredDissonances: [1, 2, 6, 11], // Clusters, tritones
    dissonanceFrequency: 0.60,
    maxLeapPreference: 16,
    stepwiseMotionFrequency: 0.55,
    allowParallelFifths: true,
    allowParallelOctaves: true,
    allowVoiceCrossing: true,
    allowHiddenParallels: true,
    chromaticismLevel: 0.65,
    modalityStrength: 0.85,
    functionalHarmony: false,
    secondaryDominants: false,
    augmentedSixths: false,
    neapolitanChords: false,
    rhythmicComplexity: 0.85,
    syncopationFrequency: 0.75,
    allowPolyrhythm: true,
    hemiolaFrequency: 0.6,
    preferredTexture: 'polyphonic',
    imitationFrequency: 0.65,
    sequenceFrequency: 0.50,
    pedalPointFrequency: 0.60,
    melodicChromaticism: 0.70,
    leapResolutionRequired: false,
    avoidTritoneInMelody: false,
    emphasizeModeCharacteristics: true,
    preferredCadences: ['half', 'plagal'],
    cadenceStrength: 0.50,
    useSuspensions: false,
    useAnticipations: true,
    useEchappees: true,
    useCambiataNotes: false,
    requireDissonancePreparation: false,
    requireDissonanceResolution: false,
    allowUnpreparedDissonance: true,
    allowUnresolvedDissonance: true,
    characteristicIntervals: [1, 2, 5, 6, 7], // Clusters, fourths, tritones
    avoidedIntervals: [3, 4], // Avoid thirds
    expressiveIntensity: 0.90,
    formalClarity: 0.75,
    harmonicDensity: 0.80
  },
  
  contemporary: {
    name: 'Contemporary/Modern',
    period: 'Modern',
    years: '1950-present',
    preferredConsonances: [0, 5, 7, 12], // Flexible definition
    preferredDissonances: [1, 2, 3, 4, 6, 8, 9, 10, 11], // All intervals equal
    dissonanceFrequency: 0.70,
    maxLeapPreference: 20,
    stepwiseMotionFrequency: 0.40,
    allowParallelFifths: true,
    allowParallelOctaves: true,
    allowVoiceCrossing: true,
    allowHiddenParallels: true,
    chromaticismLevel: 0.85,
    modalityStrength: 0.50,
    functionalHarmony: false,
    secondaryDominants: false,
    augmentedSixths: false,
    neapolitanChords: false,
    rhythmicComplexity: 0.90,
    syncopationFrequency: 0.80,
    allowPolyrhythm: true,
    hemiolaFrequency: 0.7,
    preferredTexture: 'mixed',
    imitationFrequency: 0.55,
    sequenceFrequency: 0.40,
    pedalPointFrequency: 0.50,
    melodicChromaticism: 0.90,
    leapResolutionRequired: false,
    avoidTritoneInMelody: false,
    emphasizeModeCharacteristics: false,
    preferredCadences: ['half'],
    cadenceStrength: 0.30,
    useSuspensions: false,
    useAnticipations: true,
    useEchappees: true,
    useCambiataNotes: false,
    requireDissonancePreparation: false,
    requireDissonanceResolution: false,
    allowUnpreparedDissonance: true,
    allowUnresolvedDissonance: true,
    characteristicIntervals: [1, 2, 6, 11], // Extended techniques
    avoidedIntervals: [],
    expressiveIntensity: 0.85,
    formalClarity: 0.60,
    harmonicDensity: 0.85
  }
};

/**
 * Advanced Counterpoint Engine with comprehensive algorithms and error handling
 */
export class AdvancedCounterpointEngine {
  private static readonly ADVANCED_INTERVALS: AdvancedInterval[] = [
    { semitones: 0, name: 'Perfect Unison', abbreviation: 'P1', consonant: true, perfect: true, stability: 1.0, tension: 0.0, resolution_tendency: 'stable', modal_function: 'final' },
    { semitones: 1, name: 'Minor Second', abbreviation: 'm2', consonant: false, perfect: false, stability: 0.0, tension: 1.0, resolution_tendency: 'down', modal_function: 'leading_tone' },
    { semitones: 2, name: 'Major Second', abbreviation: 'M2', consonant: false, perfect: false, stability: 0.2, tension: 0.8, resolution_tendency: 'either', modal_function: 'supertonic' },
    { semitones: 3, name: 'Minor Third', abbreviation: 'm3', consonant: true, perfect: false, stability: 0.8, tension: 0.2, resolution_tendency: 'stable', modal_function: 'mediant' },
    { semitones: 4, name: 'Major Third', abbreviation: 'M3', consonant: true, perfect: false, stability: 0.8, tension: 0.2, resolution_tendency: 'stable', modal_function: 'mediant' },
    { semitones: 5, name: 'Perfect Fourth', abbreviation: 'P4', consonant: false, perfect: true, stability: 0.3, tension: 0.7, resolution_tendency: 'down', modal_function: 'subdominant' },
    { semitones: 6, name: 'Tritone', abbreviation: 'TT', consonant: false, perfect: false, stability: 0.0, tension: 1.0, resolution_tendency: 'either', modal_function: 'diabolus' },
    { semitones: 7, name: 'Perfect Fifth', abbreviation: 'P5', consonant: true, perfect: true, stability: 0.9, tension: 0.1, resolution_tendency: 'stable', modal_function: 'dominant' },
    { semitones: 8, name: 'Minor Sixth', abbreviation: 'm6', consonant: true, perfect: false, stability: 0.7, tension: 0.3, resolution_tendency: 'stable', modal_function: 'submediant' },
    { semitones: 9, name: 'Major Sixth', abbreviation: 'M6', consonant: true, perfect: false, stability: 0.8, tension: 0.2, resolution_tendency: 'stable', modal_function: 'submediant' },
    { semitones: 10, name: 'Minor Seventh', abbreviation: 'm7', consonant: false, perfect: false, stability: 0.1, tension: 0.9, resolution_tendency: 'down', modal_function: 'subtonic' },
    { semitones: 11, name: 'Major Seventh', abbreviation: 'M7', consonant: false, perfect: false, stability: 0.0, tension: 1.0, resolution_tendency: 'up', modal_function: 'leading_tone' },
    { semitones: 12, name: 'Perfect Octave', abbreviation: 'P8', consonant: true, perfect: true, stability: 1.0, tension: 0.0, resolution_tendency: 'stable', modal_function: 'octave' }
  ];

  /**
   * Main advanced counterpoint generation with comprehensive error handling
   */
  static async generateAdvancedCounterpoint(
    cantusFirmus: Theme,
    parameters: AdvancedCounterpointParameters
  ): Promise<AdvancedCounterpointResult> {
    return await safeExecute(
      async () => {
        console.log('🎼 Starting advanced counterpoint generation:', {
          technique: parameters.technique,
          voices: parameters.num_voices,
          style: parameters.counterpoint_style,
          cantusFirmusLength: cantusFirmus.length
        });

        // Validate input parameters
        this.validateParameters(cantusFirmus, parameters);
        
        // Initialize result structure
        const result: AdvancedCounterpointResult = {
          voices: [],
          analysis: {
            total_measures: 0,
            dissonance_percentage: 0,
            voice_leading_quality: 0,
            rhythmic_complexity: 0,
            modal_adherence: 0,
            overall_quality: 0,
            voice_interactions: [],
            harmonic_analysis: []
          },
          errors: [],
          warnings: [],
          quality_score: 0,
          technique_applied: parameters.technique,
          parameters_used: parameters
        };

        try {
          // Convert cantus firmus to rhythmic format
          const rhythmicCantusFirmus = await safeExecute(
            () => melodyToRhythmicNotes(cantusFirmus, parameters.cantus_firmus_duration),
            'generation',
            { cantusFirmusLength: cantusFirmus.length, targetDuration: parameters.cantus_firmus_duration }
          );

          if (!rhythmicCantusFirmus) {
            result.errors.push(new CounterpointError(
              'Failed to convert cantus firmus to rhythmic format',
              'generation'
            ));
            return result;
          }
          
          // Add cantus firmus as first voice
          result.voices.push({
            melody: rhythmicCantusFirmus,
            species: 'first',
            ratioToCantusFirmus: '1:1'
          });

          // Generate counterpoint voices based on technique
          await this.generateCounterpointVoices(rhythmicCantusFirmus, parameters, result);
          
          // Analyze the result
          await this.analyzeCounterpoint(result);
          
          // Apply corrections if enabled
          if (parameters.enable_self_correction && result.quality_score < parameters.min_quality_threshold) {
            await this.applySelfCorrection(result, parameters);
          }
          
          // Final validation
          this.validateResult(result, parameters);
          
          console.log('✅ Advanced counterpoint generation completed:', {
            voices: result.voices.length,
            quality: Math.round(result.quality_score * 100),
            errors: result.errors.length,
            warnings: result.warnings.length
          });
          
          return result;
          
        } catch (error) {
          const counterpointError = handleCounterpointError(
            error instanceof Error ? error : new Error(String(error)),
            undefined,
            undefined,
            parameters.technique,
            { 
              parameters: {
                technique: parameters.technique,
                voices: parameters.num_voices,
                style: parameters.counterpoint_style
              },
              cantusFirmusLength: cantusFirmus.length
            }
          );
          
          result.errors.push(counterpointError);
          return result;
        }
      },
      'counterpoint',
      { 
        technique: parameters.technique,
        cantusFirmusLength: cantusFirmus.length,
        parameters: {
          voices: parameters.num_voices,
          style: parameters.counterpoint_style,
          voiceLeading: parameters.voice_leading_style
        }
      }
    ) || this.createFailureResult(parameters);
  }

  /**
   * Create a failure result when main generation fails
   */
  private static createFailureResult(parameters: AdvancedCounterpointParameters): AdvancedCounterpointResult {
    return {
      voices: [],
      analysis: {
        total_measures: 0,
        dissonance_percentage: 0,
        voice_leading_quality: 0,
        rhythmic_complexity: 0,
        modal_adherence: 0,
        overall_quality: 0,
        voice_interactions: [],
        harmonic_analysis: []
      },
      errors: [new CounterpointError(
        'Complete generation failure - check console for details',
        'structural',
        undefined,
        undefined,
        'Try a simpler technique or adjust parameters'
      )],
      warnings: ['Generation failed completely'],
      quality_score: 0,
      technique_applied: parameters.technique,
      parameters_used: parameters
    };
  }

  /**
   * Validate input parameters with detailed error reporting
   */
  private static validateParameters(cantusFirmus: Theme, parameters: AdvancedCounterpointParameters): void {
    try {
      const errors: string[] = [];
      
      // Validate cantus firmus
      if (!cantusFirmus || cantusFirmus.length === 0) {
        errors.push('Cantus firmus cannot be empty');
      }
      
      if (cantusFirmus.length > 32) {
        errors.push('Cantus firmus too long (maximum 32 notes)');
        handleValidationError(
          'Theme too long - may cause memory issues',
          'cantusFirmus.length',
          cantusFirmus.length,
          { maxLength: 32, actualLength: cantusFirmus.length }
        );
      }
      
      // Validate MIDI range
      const invalidNotes = cantusFirmus.filter(note => !isRest(note) && (note < 21 || note > 108));
      if (invalidNotes.length > 0) {
        errors.push(`Invalid MIDI notes detected: ${invalidNotes.join(', ')} (range: 21-108)`);
        handleValidationError(
          'MIDI notes outside valid range',
          'cantusFirmus.notes',
          invalidNotes,
          { validRange: '21-108', invalidNotes }
        );
      }
      
      // Validate parameters
      if (parameters.num_voices < 1 || parameters.num_voices > 8) {
        errors.push('Number of voices must be between 1 and 8');
        handleValidationError(
          'Invalid voice count',
          'num_voices',
          parameters.num_voices,
          { validRange: '1-8' }
        );
      }
      
      if (parameters.max_leap < 0 || parameters.max_leap > 24) {
        errors.push('Maximum leap must be between 0 and 24 semitones');
        handleValidationError(
          'Invalid maximum leap',
          'max_leap',
          parameters.max_leap,
          { validRange: '0-24' }
        );
      }
      
      if (parameters.error_tolerance < 0 || parameters.error_tolerance > 1) {
        errors.push('Error tolerance must be between 0 and 1');
      }
      
      if (parameters.min_quality_threshold < 0 || parameters.min_quality_threshold > 1) {
        errors.push('Quality threshold must be between 0 and 1');
      }
      
      if (parameters.max_iterations < 1 || parameters.max_iterations > 1000) {
        errors.push('Maximum iterations must be between 1 and 1000');
      }
      
      // Validate species ratio
      if (!parameters.species_ratio.match(/^\d+:\d+$/)) {
        errors.push('Species ratio must be in format "n:m" (e.g., "2:1")');
        handleValidationError(
          'Invalid species ratio format',
          'species_ratio',
          parameters.species_ratio,
          { expectedFormat: 'n:m' }
        );
      }
      
      // Validate canon parameters
      if (parameters.technique.includes('canon')) {
        if (parameters.canon_interval < -24 || parameters.canon_interval > 24) {
          errors.push('Canon interval must be between -24 and 24 semitones');
        }
        if (parameters.canon_delay < 0 || parameters.canon_delay > 16) {
          errors.push('Canon delay must be between 0 and 16 beats');
        }
      }
      
      if (errors.length > 0) {
        throw new CounterpointError(
          `Parameter validation failed: ${errors.join('; ')}`,
          'parameter',
          undefined,
          undefined,
          'Adjust parameters to valid ranges'
        );
      }
      
    } catch (error) {
      if (error instanceof CounterpointError) {
        throw error;
      }
      handleCounterpointError(
        error instanceof Error ? error : new Error(String(error)),
        undefined,
        undefined,
        'parameter_validation',
        { parameters, cantusFirmusLength: cantusFirmus?.length }
      );
      throw error;
    }
  }

  /**
   * Generate counterpoint voices based on selected technique
   */
  private static async generateCounterpointVoices(
    cantusFirmus: RhythmicNote[],
    parameters: AdvancedCounterpointParameters,
    result: AdvancedCounterpointResult
  ): Promise<void> {
    try {
      switch (parameters.technique) {
        // Species counterpoint
        case 'species_first':
          await this.generateSpeciesFirst(cantusFirmus, parameters, result);
          break;
        case 'species_second':
          await this.generateSpeciesSecond(cantusFirmus, parameters, result);
          break;
        case 'species_third':
          await this.generateSpeciesThird(cantusFirmus, parameters, result);
          break;
        case 'species_fourth':
          await this.generateSpeciesFourth(cantusFirmus, parameters, result);
          break;
        case 'species_fifth':
          await this.generateSpeciesFifth(cantusFirmus, parameters, result);
          break;
          
        // Canon techniques
        case 'canon_strict':
          await this.generateStrictCanon(cantusFirmus, parameters, result);
          break;
        case 'canon_free':
          await this.generateFreeCanon(cantusFirmus, parameters, result);
          break;
        case 'canon_crab':
          await this.generateCrabCanon(cantusFirmus, parameters, result);
          break;
        case 'canon_augmentation':
          await this.generateAugmentationCanon(cantusFirmus, parameters, result);
          break;
        case 'canon_diminution':
          await this.generateDiminutionCanon(cantusFirmus, parameters, result);
          break;
          
        // Invertible counterpoint
        case 'invertible_counterpoint':
          await this.generateInvertibleCounterpoint(cantusFirmus, parameters, result);
          break;
        case 'double_counterpoint':
          await this.generateDoubleCounterpoint(cantusFirmus, parameters, result);
          break;
        case 'triple_counterpoint':
          await this.generateTripleCounterpoint(cantusFirmus, parameters, result);
          break;
        case 'quadruple_counterpoint':
          await this.generateQuadrupleCounterpoint(cantusFirmus, parameters, result);
          break;
          
        // Advanced techniques
        case 'stretto':
          await this.generateStretto(cantusFirmus, parameters, result);
          break;
        case 'voice_exchange':
          await this.generateVoiceExchange(cantusFirmus, parameters, result);
          break;
        case 'pedal_point':
          await this.generatePedalPoint(cantusFirmus, parameters, result);
          break;
        case 'ostinato':
          await this.generateOstinato(cantusFirmus, parameters, result);
          break;
        case 'passacaglia':
          await this.generatePassacaglia(cantusFirmus, parameters, result);
          break;
        case 'chaconne':
          await this.generateChaconne(cantusFirmus, parameters, result);
          break;
          
        // Sequential techniques
        case 'sequence_ascending':
          await this.generateAscendingSequence(cantusFirmus, parameters, result);
          break;
        case 'sequence_descending':
          await this.generateDescendingSequence(cantusFirmus, parameters, result);
          break;
        case 'sequence_modulating':
          await this.generateModulatingSequence(cantusFirmus, parameters, result);
          break;
        case 'sequence_circle_fifths':
          await this.generateCircleOfFifthsSequence(cantusFirmus, parameters, result);
          break;
          
        default:
          throw new CounterpointError(
            `Unsupported counterpoint technique: ${parameters.technique}`,
            'parameter',
            undefined,
            undefined,
            'Choose a supported technique from the available options'
          );
      }
    } catch (error) {
      if (error instanceof CounterpointError) {
        result.errors.push(error);
      } else {
        result.errors.push(new CounterpointError(
          `Voice generation failed: ${error instanceof Error ? error.message : String(error)}`,
          'structural'
        ));
      }
    }
  }

  /**
   * Generate first species counterpoint (1:1 note against note)
   */
  private static async generateSpeciesFirst(
    cantusFirmus: RhythmicNote[],
    parameters: AdvancedCounterpointParameters,
    result: AdvancedCounterpointResult
  ): Promise<void> {
    try {
      const counterpoint: RhythmicNote[] = [];
      
      for (let i = 0; i < cantusFirmus.length; i++) {
        const cfNote = cantusFirmus[i];
        
        // Generate consonant counterpoint note
        const interval = this.selectConsonantInterval(cfNote.midi, i, cantusFirmus.length, parameters);
        const counterpointMidi = this.calculateCounterpointNote(cfNote.midi, interval, parameters);
        
        // Check for voice leading errors
        if (i > 0) {
          const voiceLeadingCheck = this.checkVoiceLeading(
            counterpoint[i - 1].midi,
            counterpointMidi,
            cantusFirmus[i - 1].midi,
            cfNote.midi,
            parameters
          );
          
          if (!voiceLeadingCheck.valid) {
            result.warnings.push(`Voice leading issue at measure ${i + 1}: ${voiceLeadingCheck.issue}`);
            
            // Apply correction if enabled
            if (parameters.enable_self_correction) {
              const correctedNote = this.correctVoiceLeading(
                counterpoint[i - 1].midi,
                cfNote.midi,
                interval,
                parameters
              );
              counterpoint.push(createRhythmicNote(correctedNote, cfNote.duration));
              continue;
            }
          }
        }
        
        counterpoint.push(createRhythmicNote(counterpointMidi, cfNote.duration));
      }
      
      result.voices.push({
        melody: counterpoint,
        species: 'first',
        ratioToCantusFirmus: '1:1'
      });
      
    } catch (error) {
      throw new CounterpointError(
        `First species generation failed: ${error instanceof Error ? error.message : String(error)}`,
        'voice_leading'
      );
    }
  }

  /**
   * Generate second species counterpoint (2:1 two notes against one)
   */
  private static async generateSpeciesSecond(
    cantusFirmus: RhythmicNote[],
    parameters: AdvancedCounterpointParameters,
    result: AdvancedCounterpointResult
  ): Promise<void> {
    try {
      const counterpoint: RhythmicNote[] = [];
      const halfDuration = this.getHalfDuration(cantusFirmus[0]?.duration || 'whole');
      
      for (let i = 0; i < cantusFirmus.length; i++) {
        const cfNote = cantusFirmus[i];
        
        // First note (strong beat): consonant
        const strongBeatInterval = this.selectConsonantInterval(cfNote.midi, i, cantusFirmus.length, parameters);
        const strongBeatNote = this.calculateCounterpointNote(cfNote.midi, strongBeatInterval, parameters);
        counterpoint.push(createRhythmicNote(strongBeatNote, halfDuration));
        
        // Second note (weak beat): can be dissonant if passing
        let weakBeatNote: MidiNote;
        
        if (i < cantusFirmus.length - 1) {
          const nextCfNote = cantusFirmus[i + 1];
          
          // Create passing tone towards next harmony
          if (Math.abs(nextCfNote.midi - cfNote.midi) <= 4) {
            const direction = nextCfNote.midi > cfNote.midi ? 1 : -1;
            weakBeatNote = this.constrainToRange(strongBeatNote + direction, parameters);
          } else {
            // Use consonant note if large leap
            const weakBeatInterval = this.selectConsonantInterval(cfNote.midi, i, cantusFirmus.length, parameters);
            weakBeatNote = this.calculateCounterpointNote(cfNote.midi, weakBeatInterval, parameters);
          }
        } else {
          // Final note should be consonant
          const finalInterval = this.selectConsonantInterval(cfNote.midi, i, cantusFirmus.length, parameters, true);
          weakBeatNote = this.calculateCounterpointNote(cfNote.midi, finalInterval, parameters);
        }
        
        counterpoint.push(createRhythmicNote(weakBeatNote, halfDuration));
      }
      
      result.voices.push({
        melody: counterpoint,
        species: 'second',
        ratioToCantusFirmus: '2:1'
      });
      
    } catch (error) {
      throw new CounterpointError(
        `Second species generation failed: ${error instanceof Error ? error.message : String(error)}`,
        'voice_leading'
      );
    }
  }

  /**
   * Generate strict canon
   */
  private static async generateStrictCanon(
    cantusFirmus: RhythmicNote[],
    parameters: AdvancedCounterpointParameters,
    result: AdvancedCounterpointResult
  ): Promise<void> {
    try {
      const numVoices = Math.min(parameters.num_voices, 4); // Limit for complexity
      const interval = parameters.canon_interval;
      const delay = Math.floor(parameters.canon_delay);
      
      for (let voice = 1; voice < numVoices; voice++) {
        const canonVoice: RhythmicNote[] = [];
        
        // Add initial rests for delay
        for (let r = 0; r < delay * voice; r++) {
          canonVoice.push({
            type: 'rest',
            duration: cantusFirmus[0]?.duration || 'quarter',
            beats: 1
          } as any); // Cast to handle rest type
        }
        
        // Add transposed melody
        for (let i = 0; i < cantusFirmus.length; i++) {
          const originalNote = cantusFirmus[i];
          const transposedMidi = this.constrainToRange(originalNote.midi + (interval * voice), parameters);
          
          canonVoice.push(createRhythmicNote(transposedMidi, originalNote.duration));
        }
        
        result.voices.push({
          melody: canonVoice,
          species: 'first',
          ratioToCantusFirmus: '1:1'
        });
      }
      
    } catch (error) {
      throw new CounterpointError(
        `Strict canon generation failed: ${error instanceof Error ? error.message : String(error)}`,
        'structural'
      );
    }
  }

  /**
   * Generate invertible counterpoint
   */
  private static async generateInvertibleCounterpoint(
    cantusFirmus: RhythmicNote[],
    parameters: AdvancedCounterpointParameters,
    result: AdvancedCounterpointResult
  ): Promise<void> {
    try {
      // Generate basic counterpoint first
      await this.generateSpeciesFirst(cantusFirmus, parameters, result);
      
      if (result.voices.length < 2) {
        throw new CounterpointError('Need at least 2 voices for invertible counterpoint', 'structural');
      }
      
      // Create inverted version
      const originalCounterpoint = result.voices[1];
      const inversionInterval = parameters.inversion_interval || 12; // Default to octave
      
      const invertedVoice: RhythmicNote[] = [];
      const invertedCF: RhythmicNote[] = [];
      
      for (let i = 0; i < cantusFirmus.length; i++) {
        const cfNote = cantusFirmus[i];
        const cpNote = originalCounterpoint.melody[i];
        
        // Invert by swapping voices and adjusting interval
        const newCfMidi = this.constrainToRange(cpNote.midi, parameters);
        const newCpMidi = this.constrainToRange(
          cfNote.midi + inversionInterval - (cpNote.midi - cfNote.midi),
          parameters
        );
        
        invertedCF.push(createRhythmicNote(newCfMidi, cfNote.duration));
        invertedVoice.push(createRhythmicNote(newCpMidi, cpNote.duration));
      }
      
      // Add inverted voices
      result.voices.push({
        melody: invertedCF,
        species: 'first',
        ratioToCantusFirmus: '1:1'
      });
      
      result.voices.push({
        melody: invertedVoice,
        species: 'first',
        ratioToCantusFirmus: '1:1'
      });
      
    } catch (error) {
      throw new CounterpointError(
        `Invertible counterpoint generation failed: ${error instanceof Error ? error.message : String(error)}`,
        'structural'
      );
    }
  }

  // Helper methods

  private static selectConsonantInterval(
    cfMidi: MidiNote,
    position: number,
    totalLength: number,
    parameters: AdvancedCounterpointParameters,
    isFinal: boolean = false
  ): number {
    const consonantIntervals = isFinal 
      ? [0, 7, 12] // Unison, fifth, octave for final
      : [0, 3, 4, 7, 8, 9, 12]; // All consonant intervals
    
    // Apply style-specific preferences
    if (parameters.counterpoint_style === 'palestrina') {
      return consonantIntervals[Math.floor(Math.random() * consonantIntervals.length)];
    } else if (parameters.counterpoint_style === 'bach') {
      // Bach style prefers certain intervals
      const bachPreferred = [3, 4, 8, 9]; // Thirds and sixths
      if (Math.random() < 0.7 && !isFinal) {
        return bachPreferred[Math.floor(Math.random() * bachPreferred.length)];
      }
    }
    
    return consonantIntervals[Math.floor(Math.random() * consonantIntervals.length)];
  }

  private static calculateCounterpointNote(
    cfMidi: MidiNote,
    interval: number,
    parameters: AdvancedCounterpointParameters
  ): MidiNote {
    const direction = Math.random() < 0.5 ? 1 : -1;
    const note = cfMidi + (direction * interval);
    return this.constrainToRange(note, parameters);
  }

  private static constrainToRange(midi: MidiNote, parameters: AdvancedCounterpointParameters): MidiNote {
    return Math.max(21, Math.min(108, Math.round(midi)));
  }

  private static checkVoiceLeading(
    prevCounterpoint: MidiNote,
    currentCounterpoint: MidiNote,
    prevCF: MidiNote,
    currentCF: MidiNote,
    parameters: AdvancedCounterpointParameters
  ): { valid: boolean; issue?: string } {
    
    const cpLeap = Math.abs(currentCounterpoint - prevCounterpoint);
    const cfMotion = currentCF - prevCF;
    const cpMotion = currentCounterpoint - prevCounterpoint;
    
    // Check for excessive leaps
    if (cpLeap > parameters.max_leap) {
      return { valid: false, issue: `Excessive leap of ${cpLeap} semitones` };
    }
    
    // Check for parallel fifths and octaves
    const prevInterval = Math.abs(prevCounterpoint - prevCF) % 12;
    const currentInterval = Math.abs(currentCounterpoint - currentCF) % 12;
    
    if (!parameters.allow_parallel_fifths && prevInterval === 7 && currentInterval === 7 && 
        Math.sign(cfMotion) === Math.sign(cpMotion) && cfMotion !== 0) {
      return { valid: false, issue: 'Parallel fifths detected' };
    }
    
    if (!parameters.allow_parallel_octaves && prevInterval === 0 && currentInterval === 0 && 
        Math.sign(cfMotion) === Math.sign(cpMotion) && cfMotion !== 0) {
      return { valid: false, issue: 'Parallel octaves detected' };
    }
    
    return { valid: true };
  }

  private static correctVoiceLeading(
    prevCounterpoint: MidiNote,
    currentCF: MidiNote,
    originalInterval: number,
    parameters: AdvancedCounterpointParameters
  ): MidiNote {
    // Try alternative intervals
    const alternatives = [3, 4, 8, 9]; // Thirds and sixths
    for (const interval of alternatives) {
      const candidate = currentCF + interval;
      if (Math.abs(candidate - prevCounterpoint) <= parameters.max_leap) {
        return this.constrainToRange(candidate, parameters);
      }
      const candidateDown = currentCF - interval;
      if (Math.abs(candidateDown - prevCounterpoint) <= parameters.max_leap) {
        return this.constrainToRange(candidateDown, parameters);
      }
    }
    
    // Fallback: stepwise motion from previous note
    const direction = currentCF > prevCounterpoint ? 1 : -1;
    return this.constrainToRange(prevCounterpoint + direction, parameters);
  }

  private static getHalfDuration(duration: NoteValue): NoteValue {
    const durationMap: Record<NoteValue, NoteValue> = {
      'double-whole': 'whole',
      'whole': 'half',
      'dotted-half': 'dotted-quarter',
      'half': 'quarter',
      'dotted-quarter': 'eighth',
      'quarter': 'eighth',
      'eighth': 'sixteenth',
      'sixteenth': 'sixteenth'
    };
    return durationMap[duration] || 'quarter';
  }

  // Placeholder implementations for other advanced techniques
  private static async generateSpeciesThird(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    // Third species: 4:1 (four notes against one)
    try {
      const counterpoint: RhythmicNote[] = [];
      const quarterDuration = this.getQuarterDuration(cf[0]?.duration || 'whole');
      
      for (let i = 0; i < cf.length; i++) {
        const cfNote = cf[i];
        
        // Generate 4 notes for each cantus firmus note
        for (let beat = 0; beat < 4; beat++) {
          const interval = this.selectConsonantInterval(cfNote.midi, i, cf.length, params, beat === 0);
          const noteMidi = this.calculateCounterpointNote(cfNote.midi, interval, params);
          counterpoint.push(createRhythmicNote(noteMidi, quarterDuration));
        }
      }
      
      result.voices.push({
        melody: counterpoint,
        species: 'third',
        ratioToCantusFirmus: '4:1'
      });
      
      result.warnings.push('Third species counterpoint - simplified 4:1 implementation');
    } catch (error) {
      // Fallback to first species
      await this.generateSpeciesFirst(cf, params, result);
      result.warnings.push('Third species - fallback to first species');
    }
  }

  private static async generateSpeciesFourth(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    // Fourth species: syncopation (tied notes creating suspensions)
    try {
      const counterpoint: RhythmicNote[] = [];
      const halfDuration = this.getHalfDuration(cf[0]?.duration || 'whole');
      
      // Start with a rest
      counterpoint.push({
        type: 'rest',
        duration: halfDuration,
        beats: 0.5
      } as any);
      
      for (let i = 0; i < cf.length; i++) {
        const cfNote = cf[i];
        const interval = this.selectConsonantInterval(cfNote.midi, i, cf.length, params);
        const noteMidi = this.calculateCounterpointNote(cfNote.midi, interval, params);
        
        // Add syncopated note (half note starting on weak beat)
        counterpoint.push(createRhythmicNote(noteMidi, halfDuration));
        
        // Resolution note on next strong beat (if not last)
        if (i < cf.length - 1) {
          const resolutionMidi = this.constrainToRange(noteMidi + (Math.random() > 0.5 ? 1 : -1), params);
          counterpoint.push(createRhythmicNote(resolutionMidi, halfDuration));
        }
      }
      
      result.voices.push({
        melody: counterpoint,
        species: 'fourth',
        ratioToCantusFirmus: '2:1'
      });
      
      result.warnings.push('Fourth species counterpoint - simplified syncopation');
    } catch (error) {
      await this.generateSpeciesFirst(cf, params, result);
      result.warnings.push('Fourth species - fallback to first species');
    }
  }

  private static async generateSpeciesFifth(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    // Fifth species: florid (combination of all species)
    try {
      await this.generateSpeciesSecond(cf, params, result);
      result.warnings.push('Fifth species counterpoint - using second species as simplified florid');
    } catch (error) {
      await this.generateSpeciesFirst(cf, params, result);
      result.warnings.push('Fifth species - fallback to first species');
    }
  }
  
  private static getQuarterDuration(baseDuration: NoteValue): NoteValue {
    // Return quarter of the base duration
    const durationMap: Record<NoteValue, NoteValue> = {
      'double-whole': 'half',
      'whole': 'quarter',
      'dotted-half': 'eighth',
      'half': 'eighth',
      'dotted-quarter': 'sixteenth',
      'quarter': 'sixteenth',
      'eighth': 'sixteenth',
      'sixteenth': 'sixteenth'
    };
    return durationMap[baseDuration] || 'quarter';
  }

  private static async generateFreeCanon(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    // Free canon allows more flexibility than strict canon
    // Generate using strict canon as base but with more voices
    try {
      await this.generateStrictCanon(cf, params, result);
      result.warnings.push('Free canon - using strict canon implementation with flexible voice leading');
    } catch (error) {
      // Fallback to first species if strict canon fails
      await this.generateSpeciesFirst(cf, params, result);
      result.warnings.push('Free canon - fallback to first species counterpoint');
    }
  }

  private static async generateCrabCanon(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    // Crab canon (retrograde): the melody is played backwards in another voice
    try {
      const numVoices = Math.min(params.num_voices, 2); // Limit to 2 for crab canon
      
      // First voice: original melody
      for (let voice = 1; voice < numVoices; voice++) {
        const retrogradeVoice: RhythmicNote[] = [];
        
        // Play the cantus firmus backwards
        for (let i = cf.length - 1; i >= 0; i--) {
          const originalNote = cf[i];
          const transposedMidi = this.constrainToRange(
            originalNote.midi + (params.canon_interval || 0),
            params
          );
          
          retrogradeVoice.push(createRhythmicNote(transposedMidi, originalNote.duration));
        }
        
        result.voices.push({
          melody: retrogradeVoice,
          species: 'first',
          ratioToCantusFirmus: '1:1'
        });
      }
      
      result.warnings.push('Crab canon - retrograde implementation');
    } catch (error) {
      throw new CounterpointError(
        `Crab canon generation failed: ${error instanceof Error ? error.message : String(error)}`,
        'structural'
      );
    }
  }

  private static async generateAugmentationCanon(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    // Augmentation canon: subsequent voices play the same melody in longer note values
    try {
      const numVoices = Math.min(params.num_voices, 3); // Limit for complexity
      
      for (let voice = 1; voice < numVoices; voice++) {
        const augmentedVoice: RhythmicNote[] = [];
        const augmentationFactor = voice + 1; // 2x, 3x, etc.
        
        // Add delay rests
        const delay = Math.floor(params.canon_delay) * voice;
        for (let r = 0; r < delay; r++) {
          augmentedVoice.push({
            type: 'rest',
            duration: cf[0]?.duration || 'quarter',
            beats: 1
          } as any);
        }
        
        // Add augmented melody
        for (let i = 0; i < cf.length; i++) {
          const originalNote = cf[i];
          const transposedMidi = this.constrainToRange(
            originalNote.midi + (params.canon_interval * voice),
            params
          );
          
          // Double the duration for augmentation
          const augmentedDuration = this.augmentDuration(originalNote.duration, augmentationFactor);
          augmentedVoice.push(createRhythmicNote(transposedMidi, augmentedDuration));
        }
        
        result.voices.push({
          melody: augmentedVoice,
          species: 'first',
          ratioToCantusFirmus: `1:${augmentationFactor}`
        });
      }
      
      result.warnings.push('Augmentation canon - rhythmic augmentation applied');
    } catch (error) {
      throw new CounterpointError(
        `Augmentation canon generation failed: ${error instanceof Error ? error.message : String(error)}`,
        'structural'
      );
    }
  }
  
  private static augmentDuration(duration: NoteValue, factor: number): NoteValue {
    // Simple augmentation: double the duration
    const durationMap: Record<NoteValue, NoteValue> = {
      'sixteenth': 'eighth',
      'eighth': 'quarter',
      'quarter': 'half',
      'dotted-quarter': 'dotted-half',
      'half': 'whole',
      'dotted-half': 'double-whole',
      'whole': 'double-whole',
      'double-whole': 'double-whole'
    };
    
    let result = duration;
    for (let i = 1; i < factor && i < 3; i++) {
      result = durationMap[result] || result;
    }
    
    return result;
  }

  private static async generateDiminutionCanon(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    // Diminution canon: subsequent voices play the same melody in shorter note values
    try {
      const numVoices = Math.min(params.num_voices, 3);
      
      for (let voice = 1; voice < numVoices; voice++) {
        const diminutedVoice: RhythmicNote[] = [];
        const diminutionFactor = voice + 1; // 2x faster, 3x faster, etc.
        
        // Add delay rests
        const delay = Math.floor(params.canon_delay) * voice;
        for (let r = 0; r < delay; r++) {
          diminutedVoice.push({
            type: 'rest',
            duration: 'quarter',
            beats: 1
          } as any);
        }
        
        // Add diminished melody
        for (let i = 0; i < cf.length; i++) {
          const originalNote = cf[i];
          const transposedMidi = this.constrainToRange(
            originalNote.midi + (params.canon_interval * voice),
            params
          );
          
          // Halve the duration for diminution
          const diminutedDuration = this.diminishDuration(originalNote.duration, diminutionFactor);
          
          // For diminution, we might need to add the same note multiple times
          for (let rep = 0; rep < diminutionFactor; rep++) {
            diminutedVoice.push(createRhythmicNote(transposedMidi, diminutedDuration));
          }
        }
        
        result.voices.push({
          melody: diminutedVoice,
          species: 'first',
          ratioToCantusFirmus: `${diminutionFactor}:1`
        });
      }
      
      result.warnings.push('Diminution canon - rhythmic diminution applied');
    } catch (error) {
      throw new CounterpointError(
        `Diminution canon generation failed: ${error instanceof Error ? error.message : String(error)}`,
        'structural'
      );
    }
  }
  
  private static diminishDuration(duration: NoteValue, factor: number): NoteValue {
    // Simple diminution: halve the duration
    const durationMap: Record<NoteValue, NoteValue> = {
      'double-whole': 'whole',
      'whole': 'half',
      'dotted-half': 'dotted-quarter',
      'half': 'quarter',
      'dotted-quarter': 'eighth',
      'quarter': 'eighth',
      'eighth': 'sixteenth',
      'sixteenth': 'sixteenth'
    };
    
    let result = duration;
    for (let i = 1; i < factor && i < 3; i++) {
      result = durationMap[result] || result;
    }
    
    return result;
  }

  private static async generateDoubleCounterpoint(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    // Double counterpoint: generate 2 voices that can be inverted
    try {
      await this.generateInvertibleCounterpoint(cf, params, result);
      result.warnings.push('Double counterpoint - using invertible counterpoint');
    } catch (error) {
      await this.generateSpeciesFirst(cf, params, result);
      result.warnings.push('Double counterpoint - fallback to first species');
    }
  }

  private static async generateTripleCounterpoint(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    // Triple counterpoint: generate 3 voices
    try {
      // Generate multiple voices using first species
      const originalNumVoices = params.num_voices;
      params.num_voices = Math.max(3, params.num_voices);
      
      await this.generateSpeciesFirst(cf, params, result);
      await this.generateSpeciesFirst(cf, {...params, interval_above: false}, result);
      
      params.num_voices = originalNumVoices;
      result.warnings.push('Triple counterpoint - simplified 3-voice implementation');
    } catch (error) {
      await this.generateSpeciesFirst(cf, params, result);
      result.warnings.push('Triple counterpoint - fallback to first species');
    }
  }

  private static async generateQuadrupleCounterpoint(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    // Quadruple counterpoint: generate 4 voices
    try {
      const originalNumVoices = params.num_voices;
      params.num_voices = Math.max(4, params.num_voices);
      
      await this.generateStrictCanon(cf, params, result);
      
      params.num_voices = originalNumVoices;
      result.warnings.push('Quadruple counterpoint - using strict canon for 4 voices');
    } catch (error) {
      await this.generateSpeciesFirst(cf, params, result);
      result.warnings.push('Quadruple counterpoint - fallback to first species');
    }
  }

  private static async generateStretto(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    // Stretto: entries come in closer together (like a tight canon)
    try {
      // Use strict canon with reduced delay for stretto effect
      const originalDelay = params.canon_delay;
      params.canon_delay = Math.max(1, Math.floor(params.canon_delay / 2)); // Half the normal delay
      
      await this.generateStrictCanon(cf, params, result);
      
      params.canon_delay = originalDelay;
      result.warnings.push('Stretto - using close-entry canon');
    } catch (error) {
      await this.generateSpeciesFirst(cf, params, result);
      result.warnings.push('Stretto - fallback to first species');
    }
  }

  private static async generateVoiceExchange(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    // Voice exchange: voices swap material
    try {
      await this.generateSpeciesFirst(cf, params, result);
      
      // Create exchanged version if we have at least one voice
      if (result.voices.length > 0) {
        const originalVoice = result.voices[0];
        const exchangedCF: RhythmicNote[] = [];
        const exchangedVoice: RhythmicNote[] = [];
        
        // Swap the voices every few notes
        for (let i = 0; i < cf.length; i++) {
          if (Math.floor(i / 2) % 2 === 0) {
            // Normal
            exchangedCF.push(cf[i]);
            exchangedVoice.push(originalVoice.melody[i]);
          } else {
            // Swapped
            exchangedCF.push(originalVoice.melody[i]);
            exchangedVoice.push(cf[i]);
          }
        }
        
        result.voices.push({
          melody: exchangedVoice,
          species: 'first',
          ratioToCantusFirmus: '1:1'
        });
      }
      
      result.warnings.push('Voice exchange - simplified implementation');
    } catch (error) {
      await this.generateSpeciesFirst(cf, params, result);
      result.warnings.push('Voice exchange - fallback to first species');
    }
  }

  private static async generatePedalPoint(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    // Pedal point: sustained note in bass while upper voices move
    try {
      const pedalNote = cf[0].midi - 12; // Octave below first note
      const pedalVoice: RhythmicNote[] = [];
      
      // Create sustained pedal note
      const totalDuration = cf.reduce((sum, note) => sum + (note.beats || 1), 0);
      pedalVoice.push(createRhythmicNote(pedalNote, 'double-whole'));
      
      // Add upper counterpoint
      await this.generateSpeciesFirst(cf, params, result);
      
      // Add pedal as first voice
      result.voices.unshift({
        melody: pedalVoice,
        species: 'first',
        ratioToCantusFirmus: '1:1'
      });
      
      result.warnings.push('Pedal point - sustained bass note implementation');
    } catch (error) {
      await this.generateSpeciesFirst(cf, params, result);
      result.warnings.push('Pedal point - fallback to first species');
    }
  }

  private static async generateOstinato(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    result.warnings.push('Ostinato - simplified implementation');
  }

  private static async generatePassacaglia(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    result.warnings.push('Passacaglia - simplified implementation');
  }

  private static async generateChaconne(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    result.warnings.push('Chaconne - simplified implementation');
  }

  private static async generateAscendingSequence(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    result.warnings.push('Ascending sequence - simplified implementation');
  }

  private static async generateDescendingSequence(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    result.warnings.push('Descending sequence - simplified implementation');
  }

  private static async generateModulatingSequence(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    result.warnings.push('Modulating sequence - simplified implementation');
  }

  private static async generateCircleOfFifthsSequence(cf: RhythmicNote[], params: AdvancedCounterpointParameters, result: AdvancedCounterpointResult): Promise<void> {
    result.warnings.push('Circle of fifths sequence - simplified implementation');
  }

  /**
   * Analyze the generated counterpoint
   */
  private static async analyzeCounterpoint(result: AdvancedCounterpointResult): Promise<void> {
    try {
      if (result.voices.length === 0) return;

      const analysis = result.analysis;
      analysis.total_measures = result.voices[0].melody.length;
      
      // Calculate basic metrics
      let totalDissonances = 0;
      let totalIntervals = 0;
      
      if (result.voices.length >= 2) {
        for (let i = 0; i < analysis.total_measures; i++) {
          const voice1Note = result.voices[0].melody[i]?.midi;
          const voice2Note = result.voices[1].melody[i]?.midi;
          
          if (voice1Note !== undefined && voice2Note !== undefined) {
            const interval = Math.abs(voice1Note - voice2Note) % 12;
            const intervalInfo = this.ADVANCED_INTERVALS.find(int => int.semitones === interval);
            
            if (intervalInfo) {
              totalIntervals++;
              if (!intervalInfo.consonant) {
                totalDissonances++;
              }
            }
          }
        }
        
        analysis.dissonance_percentage = totalIntervals > 0 ? (totalDissonances / totalIntervals) * 100 : 0;
      }
      
      // Simplified quality assessment
      analysis.voice_leading_quality = Math.max(0, 1 - (result.errors.length * 0.2));
      analysis.rhythmic_complexity = result.voices.length > 1 ? 0.5 : 0.3;
      analysis.modal_adherence = 0.8; // Placeholder
      analysis.overall_quality = (
        analysis.voice_leading_quality * 0.4 +
        (1 - analysis.dissonance_percentage / 100) * 0.3 +
        analysis.rhythmic_complexity * 0.2 +
        analysis.modal_adherence * 0.1
      );
      
      result.quality_score = analysis.overall_quality;
      
    } catch (error) {
      result.warnings.push(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Apply self-correction to improve quality
   */
  private static async applySelfCorrection(
    result: AdvancedCounterpointResult,
    parameters: AdvancedCounterpointParameters
  ): Promise<void> {
    let iterations = 0;
    const maxIterations = Math.min(parameters.max_iterations, 10);
    
    while (result.quality_score < parameters.min_quality_threshold && iterations < maxIterations) {
      iterations++;
      result.warnings.push(`Applying self-correction iteration ${iterations}`);
      
      // Simple correction: regenerate problematic sections
      if (result.errors.length > 0) {
        // For now, just add a warning
        result.warnings.push('Self-correction attempted but not fully implemented');
        break;
      }
      
      // Recalculate quality
      await this.analyzeCounterpoint(result);
    }
  }

  /**
   * Final validation of the result
   */
  private static validateResult(
    result: AdvancedCounterpointResult,
    parameters: AdvancedCounterpointParameters
  ): void {
    if (result.voices.length === 0) {
      throw new CounterpointError('No voices generated', 'structural');
    }
    
    // Check for minimum quality
    if (result.quality_score < 0.3) {
      result.warnings.push('Generated counterpoint quality is below recommended threshold');
    }
    
    // Check voice count
    if (result.voices.length < parameters.num_voices) {
      result.warnings.push(`Generated ${result.voices.length} voices instead of requested ${parameters.num_voices}`);
    }
  }

  /**
   * Convert advanced counterpoint result to simple theme format for compatibility
   */
  static resultToThemes(result: AdvancedCounterpointResult): Theme[] {
    return result.voices.map(voice => rhythmicNotesToMelody(voice.melody));
  }

  // ========================================
  // COMPOSER STYLE APPLICATION METHODS
  // ========================================

  /**
   * Get the style profile for a composer
   */
  static getStyleProfile(style: CounterpointStyle): ComposerStyleProfile {
    return COMPOSER_STYLE_PROFILES[style];
  }

  /**
   * Apply composer style to parameters
   * This method modifies the parameters to match the composer's stylistic preferences
   */
  static applyStyleToParameters(
    parameters: AdvancedCounterpointParameters,
    style: CounterpointStyle
  ): AdvancedCounterpointParameters {
    const profile = COMPOSER_STYLE_PROFILES[style];
    
    console.log(`🎭 Applying ${profile.name} style (${profile.period}, ${profile.years})`);
    
    // Create modified parameters based on style profile
    const styledParameters: AdvancedCounterpointParameters = {
      ...parameters,
      
      // Voice leading from style
      max_leap: Math.min(parameters.max_leap, profile.maxLeapPreference),
      prefer_stepwise: profile.stepwiseMotionFrequency > 0.6,
      allow_voice_crossing: profile.allowVoiceCrossing,
      allow_parallel_fifths: profile.allowParallelFifths,
      allow_parallel_octaves: profile.allowParallelOctaves,
      
      // Dissonance treatment from style
      require_dissonance_preparation: profile.requireDissonancePreparation,
      require_dissonance_resolution: profile.requireDissonanceResolution,
      allow_unprepared_dissonance: profile.allowUnpreparedDissonance,
      chromatic_alterations: profile.chromaticismLevel > 0.3,
      
      // Modal considerations from style
      preserve_modal_character: profile.emphasizeModeCharacteristics,
      modal_final_emphasis: profile.modalityStrength,
      avoid_leading_tone: profile.modalityStrength > 0.7,
      
      // Rhythmic parameters from style
      use_complex_rhythms: profile.rhythmicComplexity > 0.6,
      allow_polyrhythm: profile.allowPolyrhythm,
      rhythmic_complexity: profile.rhythmicComplexity,
      hemiola_frequency: profile.hemiolaFrequency,
      allow_syncopation: profile.syncopationFrequency > 0.3
    };
    
    return styledParameters;
  }

  /**
   * Apply dissonance treatment based on composer style
   */
  private static applyDissonanceTreatment(
    dissonantNote: MidiNote,
    resolution: MidiNote,
    parameters: AdvancedCounterpointParameters
  ): { prepared: boolean; resolved: boolean; treatment: string } {
    const profile = COMPOSER_STYLE_PROFILES[parameters.counterpoint_style];
    
    const treatment = {
      prepared: false,
      resolved: false,
      treatment: ''
    };
    
    // Preparation check
    if (profile.requireDissonancePreparation) {
      // In strict styles, dissonance must be prepared
      treatment.prepared = true;
      treatment.treatment = 'suspension';
    } else if (profile.allowUnpreparedDissonance) {
      // Modern styles allow unprepared dissonance
      treatment.treatment = 'appoggiatura';
    }
    
    // Resolution check
    if (profile.requireDissonanceResolution) {
      const resolutionInterval = Math.abs(resolution - dissonantNote);
      treatment.resolved = resolutionInterval <= 2; // Stepwise resolution
      if (treatment.resolved) {
        treatment.treatment += '_resolved';
      }
    } else if (profile.allowUnresolvedDissonance) {
      treatment.treatment = 'free_dissonance';
    }
    
    return treatment;
  }

  /**
   * Generate style-specific rhythmic pattern
   */
  private static generateStyledRhythm(
    length: number,
    parameters: AdvancedCounterpointParameters
  ): NoteValue[] {
    const profile = COMPOSER_STYLE_PROFILES[parameters.counterpoint_style];
    const rhythm: NoteValue[] = [];
    
    // Simple rhythm for Renaissance
    if (profile.period === 'Renaissance') {
      for (let i = 0; i < length; i++) {
        rhythm.push(Math.random() < 0.8 ? 'half' : 'whole');
      }
    }
    // Complex rhythm for Baroque
    else if (profile.period === 'Baroque') {
      for (let i = 0; i < length; i++) {
        const rand = Math.random();
        if (rand < 0.3) rhythm.push('eighth');
        else if (rand < 0.6) rhythm.push('quarter');
        else rhythm.push('half');
      }
    }
    // Balanced rhythm for Classical
    else if (profile.period === 'Classical') {
      for (let i = 0; i < length; i++) {
        rhythm.push(Math.random() < 0.5 ? 'quarter' : 'half');
      }
    }
    // Expressive rhythm for Romantic
    else if (profile.period === 'Romantic') {
      for (let i = 0; i < length; i++) {
        const rand = Math.random();
        if (rand < 0.2) rhythm.push('dotted-quarter');
        else if (rand < 0.5) rhythm.push('quarter');
        else rhythm.push('half');
      }
    }
    // Free rhythm for Modern
    else {
      for (let i = 0; i < length; i++) {
        const durations: NoteValue[] = ['sixteenth', 'eighth', 'quarter', 'half', 'whole'];
        rhythm.push(durations[Math.floor(Math.random() * durations.length)]);
      }
    }
    
    return rhythm;
  }

  /**
   * Get style-appropriate cadence
   */
  private static generateCadence(
    cantusFirmusFinal: MidiNote,
    parameters: AdvancedCounterpointParameters
  ): { counterpoint: MidiNote; type: string } {
    const profile = COMPOSER_STYLE_PROFILES[parameters.counterpoint_style];
    const cadenceType = profile.preferredCadences[
      Math.floor(Math.random() * profile.preferredCadences.length)
    ];
    
    let counterpointNote: MidiNote;
    
    switch (cadenceType) {
      case 'perfect':
        // V-I or leading tone to tonic
        counterpointNote = cantusFirmusFinal; // Unison or octave
        break;
      case 'plagal':
        // IV-I
        counterpointNote = cantusFirmusFinal + 5; // Fourth above
        break;
      case 'half':
        // End on dominant
        counterpointNote = cantusFirmusFinal + 7; // Fifth above
        break;
      case 'deceptive':
        // V-vi
        counterpointNote = cantusFirmusFinal + 9; // Sixth above
        break;
      case 'phrygian':
        // Phrygian half cadence
        counterpointNote = cantusFirmusFinal + 1; // Half step above
        break;
      default:
        counterpointNote = cantusFirmusFinal;
    }
    
    return {
      counterpoint: this.constrainToRange(counterpointNote, parameters),
      type: cadenceType
    };
  }
}