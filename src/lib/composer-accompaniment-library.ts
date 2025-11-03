/**
 * Composer Accompaniment Library System
 * Famous accompaniment patterns from classical composers
 * Full transformation engine with modal compliance
 * 
 * Harris Software Solutions LLC
 */

import { MidiNote, NoteValue, Mode, KeySignature } from '../types/musical';
import { CounterpointEngine } from './counterpoint-engine';

export type ComposerName = 
  | 'Bach' 
  | 'Beethoven' 
  | 'Mozart' 
  | 'Handel' 
  | 'Chopin' 
  | 'Schumann' 
  | 'Brahms' 
  | 'Liszt'
  | 'Haydn'
  | 'Debussy';

export type MusicalPeriod = 'Baroque' | 'Classical' | 'Romantic' | 'Impressionist';

export type HarmonyType = 
  | 'alberti-bass'
  | 'waltz-bass'
  | 'broken-chord'
  | 'arpeggiated'
  | 'stride'
  | 'murky-bass'
  | 'drum-bass'
  | 'pedal-point'
  | 'ostinato'
  | 'chaconne'
  | 'ground-bass';

export type VoicingType = 'left-hand' | 'right-hand' | 'both-hands' | 'bass-line';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'virtuoso';

export interface AccompanimentPattern {
  melody: (MidiNote | MidiNote[] | -1)[];  // Single notes, chords (arrays), or rests (-1)
  rhythm: NoteValue[];          // Note durations
  timeSignature?: string;       // "4/4", "3/4", "6/8", etc.
  repeatCount?: number;         // How many times to repeat
}

export interface AccompanimentMetadata {
  commonIn: string[];           // ["Sonatas", "Concertos", "Waltzes"]
  difficulty: DifficultyLevel;
  harmonyType: HarmonyType;
  voicingType: VoicingType;
  tempoRange?: [number, number]; // Suggested BPM range [min, max]
  keyContext?: string;          // "Major", "Minor", "Modal"
  era?: string;                 // Specific era or work reference
}

export interface ComposerAccompaniment {
  id: string;
  composer: ComposerName;
  title: string;
  period: MusicalPeriod;
  description: string;
  pattern: AccompanimentPattern;
  metadata: AccompanimentMetadata;
  variations?: ComposerAccompaniment[]; // Optional variations
  tags?: string[];              // ["classical", "energetic", "lyrical"]
}

// ADDITIVE: Simple editing operations for accompaniments
export type AccompanimentEditOperation = 
  | 'transpose'
  | 'expand'
  | 'truncate'
  | 'combine';

export interface AccompanimentEditParams {
  type: AccompanimentEditOperation;
  interval?: number;            // For transposition (-12 to +12)
  repeatCount?: number;         // For expansion (how many times to repeat)
  maxNotes?: number;            // For truncation (how many notes to keep)
  combineWith?: ComposerAccompaniment; // For combining two accompaniments
}

// PRESERVE: Keep old transformation types for backward compatibility
export type AccompanimentTransformation = 
  | 'transpose'
  | 'inversion'
  | 'retrograde'
  | 'retrograde-inversion'
  | 'diminution'
  | 'augmentation'
  | 'mode-shift';

export interface TransformationParams {
  type: AccompanimentTransformation;
  interval?: number;            // For transposition (-12 to +12)
  factor?: number;              // For diminution/augmentation (0.5, 2, etc.)
  targetMode?: Mode;            // For mode shifting
  inversionAxis?: number;       // MIDI note to invert around
}

/**
 * Famous Composer Accompaniment Library
 * Curated collection of authentic patterns from classical masters
 */
export class ComposerAccompanimentLibrary {
  private static library: ComposerAccompaniment[] = [
    // === BACH - Baroque Master ===
    {
      id: 'bach-broken-chord-1',
      composer: 'Bach',
      title: 'Prelude-Style Broken Chords',
      period: 'Baroque',
      description: 'Flowing broken chord pattern inspired by Well-Tempered Clavier preludes',
      pattern: {
        melody: [48, 60, 64, 67, 64, 60, 64, 67], // C major broken chord
        rhythm: ['sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth'],
        timeSignature: '4/4',
        repeatCount: 4
      },
      metadata: {
        commonIn: ['Preludes', 'Inventions', 'Keyboard Works'],
        difficulty: 'intermediate',
        harmonyType: 'broken-chord',
        voicingType: 'both-hands',
        tempoRange: [60, 120],
        keyContext: 'Major',
        era: 'Well-Tempered Clavier style'
      },
      tags: ['baroque', 'flowing', 'arpeggiated']
    },
    
    {
      id: 'bach-walking-bass-1',
      composer: 'Bach',
      title: 'Walking Bass Line',
      period: 'Baroque',
      description: 'Typical Bach walking bass with stepwise motion',
      pattern: {
        melody: [48, 50, 52, 53, 55, 53, 52, 50], // C D E F G F E D
        rhythm: ['quarter', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter'],
        timeSignature: '4/4',
        repeatCount: 2
      },
      metadata: {
        commonIn: ['Chorales', 'Fugues', 'Sonatas'],
        difficulty: 'beginner',
        harmonyType: 'pedal-point',
        voicingType: 'bass-line',
        tempoRange: [50, 100],
        keyContext: 'Major',
        era: 'Baroque counterpoint'
      },
      tags: ['baroque', 'bass', 'stepwise']
    },

    // === MOZART - Classical Elegance ===
    {
      id: 'mozart-alberti-bass-1',
      composer: 'Mozart',
      title: 'Classic Alberti Bass',
      period: 'Classical',
      description: 'The quintessential Classical era accompaniment pattern',
      pattern: {
        melody: [48, 55, 52, 55, 48, 55, 52, 55], // C G E G (I-V-III-V)
        rhythm: ['sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth'],
        timeSignature: '4/4',
        repeatCount: 4
      },
      metadata: {
        commonIn: ['Sonatas', 'Concertos', 'Chamber Music'],
        difficulty: 'intermediate',
        harmonyType: 'alberti-bass',
        voicingType: 'left-hand',
        tempoRange: [100, 160],
        keyContext: 'Major',
        era: 'Classical sonata form'
      },
      tags: ['classical', 'elegant', 'piano']
    },

    {
      id: 'mozart-broken-octave-1',
      composer: 'Mozart',
      title: 'Broken Octave Pattern',
      period: 'Classical',
      description: 'Energetic broken octave bass pattern for dramatic effect',
      pattern: {
        melody: [36, 48, 36, 48, 38, 50, 38, 50], // Low C, High C alternating
        rhythm: ['eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth'],
        timeSignature: '4/4',
        repeatCount: 2
      },
      metadata: {
        commonIn: ['Symphonies', 'Overtures', 'Concertos'],
        difficulty: 'advanced',
        harmonyType: 'drum-bass',
        voicingType: 'left-hand',
        tempoRange: [120, 180],
        keyContext: 'Major',
        era: 'Symphonic style'
      },
      tags: ['classical', 'dramatic', 'energetic']
    },

    // === BEETHOVEN - Heroic Style ===
    {
      id: 'beethoven-heroic-bass-1',
      composer: 'Beethoven',
      title: 'Heroic Repeated Bass',
      period: 'Classical',
      description: 'Powerful repeated bass notes with rhythmic drive',
      pattern: {
        melody: [36, 36, 36, 43, 36, 36, 36, 43], // C C C G pattern
        rhythm: ['eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth'],
        timeSignature: '4/4',
        repeatCount: 4
      },
      metadata: {
        commonIn: ['Sonatas', 'Symphonies', 'Concertos'],
        difficulty: 'intermediate',
        harmonyType: 'drum-bass',
        voicingType: 'left-hand',
        tempoRange: [120, 160],
        keyContext: 'Major',
        era: 'Heroic period'
      },
      tags: ['dramatic', 'powerful', 'rhythmic']
    },

    {
      id: 'beethoven-tremolo-1',
      composer: 'Beethoven',
      title: 'Tremolo Accompaniment',
      period: 'Classical',
      description: 'Rapid alternating notes creating tension',
      pattern: {
        melody: [48, 52, 48, 52, 48, 52, 48, 52], // C E C E tremolo
        rhythm: ['sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth'],
        timeSignature: '4/4',
        repeatCount: 4
      },
      metadata: {
        commonIn: ['Sonatas', 'Symphonies'],
        difficulty: 'advanced',
        harmonyType: 'ostinato',
        voicingType: 'both-hands',
        tempoRange: [80, 140],
        keyContext: 'Major',
        era: 'Late period'
      },
      tags: ['dramatic', 'tense', 'rapid']
    },

    // === CHOPIN - Romantic Waltz ===
    {
      id: 'chopin-waltz-bass-1',
      composer: 'Chopin',
      title: 'Classic Waltz Left Hand',
      period: 'Romantic',
      description: 'Elegant 3/4 waltz accompaniment pattern',
      pattern: {
        melody: [48, 60, 64, 60, 64, 60], // Bass note, chord, chord
        rhythm: ['quarter', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth'],
        timeSignature: '3/4',
        repeatCount: 4
      },
      metadata: {
        commonIn: ['Waltzes', 'Mazurkas', 'Nocturnes'],
        difficulty: 'intermediate',
        harmonyType: 'waltz-bass',
        voicingType: 'left-hand',
        tempoRange: [120, 180],
        keyContext: 'Major',
        era: 'Romantic salon music'
      },
      tags: ['romantic', 'dance', 'elegant']
    },

    {
      id: 'chopin-nocturne-arp-1',
      composer: 'Chopin',
      title: 'Nocturne Arpeggiated Bass',
      period: 'Romantic',
      description: 'Flowing arpeggiated accompaniment for lyrical melodies',
      pattern: {
        melody: [36, 48, 52, 55, 60, 55, 52, 48], // Wide arpeggiated pattern
        rhythm: ['eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth'],
        timeSignature: '4/4',
        repeatCount: 2
      },
      metadata: {
        commonIn: ['Nocturnes', 'Ballades', 'Impromptus'],
        difficulty: 'advanced',
        harmonyType: 'arpeggiated',
        voicingType: 'left-hand',
        tempoRange: [60, 90],
        keyContext: 'Minor',
        era: 'Lyrical nocturnes'
      },
      tags: ['romantic', 'lyrical', 'flowing']
    },

    // === SCHUMANN - Romantic Character ===
    {
      id: 'schumann-march-1',
      composer: 'Schumann',
      title: 'Character March Bass',
      period: 'Romantic',
      description: 'Marching left hand pattern with rhythmic character',
      pattern: {
        melody: [36, 43, 36, 43, 38, 45, 38, 45], // Strong-weak march pattern
        rhythm: ['quarter', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter'],
        timeSignature: '4/4',
        repeatCount: 2
      },
      metadata: {
        commonIn: ['Character Pieces', 'Album for the Young'],
        difficulty: 'beginner',
        harmonyType: 'drum-bass',
        voicingType: 'left-hand',
        tempoRange: [100, 140],
        keyContext: 'Major',
        era: 'Romantic character pieces'
      },
      tags: ['romantic', 'march', 'rhythmic']
    },

    // === BRAHMS - Rich Harmony ===
    {
      id: 'brahms-rich-bass-1',
      composer: 'Brahms',
      title: 'Rich Harmonic Bass',
      period: 'Romantic',
      description: 'Dense, harmonically rich accompaniment pattern',
      pattern: {
        melody: [36, 43, 48, 52, 55, 52, 48, 43], // Rich harmonic movement
        rhythm: ['eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth'],
        timeSignature: '4/4',
        repeatCount: 2
      },
      metadata: {
        commonIn: ['Intermezzi', 'Ballades', 'Rhapsodies'],
        difficulty: 'advanced',
        harmonyType: 'broken-chord',
        voicingType: 'left-hand',
        tempoRange: [60, 100],
        keyContext: 'Minor',
        era: 'Late Romantic'
      },
      tags: ['romantic', 'rich', 'harmonic']
    },

    // === LISZT - Virtuoso Style ===
    {
      id: 'liszt-virtuoso-1',
      composer: 'Liszt',
      title: 'Virtuoso Arpeggio Pattern',
      period: 'Romantic',
      description: 'Sweeping virtuoso arpeggios across wide range',
      pattern: {
        melody: [36, 48, 52, 55, 60, 64, 67, 72, 67, 64, 60, 55, 52, 48], // Wide sweep
        rhythm: ['sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 
                 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth'],
        timeSignature: '4/4',
        repeatCount: 2
      },
      metadata: {
        commonIn: ['Concert Etudes', 'Rhapsodies', 'Transcriptions'],
        difficulty: 'virtuoso',
        harmonyType: 'arpeggiated',
        voicingType: 'both-hands',
        tempoRange: [120, 180],
        keyContext: 'Major',
        era: 'Virtuoso period'
      },
      tags: ['virtuoso', 'dramatic', 'sweeping']
    },

    // === HANDEL - Baroque Grandeur ===
    {
      id: 'handel-ground-bass-1',
      composer: 'Handel',
      title: 'Ground Bass Pattern',
      period: 'Baroque',
      description: 'Repeating ground bass foundation for variations',
      pattern: {
        melody: [48, 50, 52, 48, 43, 45, 47, 48], // Descending/ascending pattern
        rhythm: ['quarter', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter'],
        timeSignature: '4/4',
        repeatCount: 4
      },
      metadata: {
        commonIn: ['Chaconnes', 'Passacaglias', 'Variations'],
        difficulty: 'intermediate',
        harmonyType: 'ground-bass',
        voicingType: 'bass-line',
        tempoRange: [60, 100],
        keyContext: 'Minor',
        era: 'Baroque variations'
      },
      tags: ['baroque', 'variations', 'foundational']
    },

    // === HAYDN - Classical Wit ===
    {
      id: 'haydn-surprise-1',
      composer: 'Haydn',
      title: 'Simple Harmonic Support',
      period: 'Classical',
      description: 'Clear, supportive harmonic accompaniment',
      pattern: {
        melody: [48, 52, 55, 52, 48, 52, 55, 52], // Simple triadic pattern
        rhythm: ['quarter', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter'],
        timeSignature: '4/4',
        repeatCount: 2
      },
      metadata: {
        commonIn: ['Symphonies', 'String Quartets', 'Sonatas'],
        difficulty: 'beginner',
        harmonyType: 'broken-chord',
        voicingType: 'left-hand',
        tempoRange: [90, 140],
        keyContext: 'Major',
        era: 'Classical period'
      },
      tags: ['classical', 'clear', 'simple']
    }
  ];

  /**
   * Get all accompaniments
   */
  static getAll(): ComposerAccompaniment[] {
    return [...this.library];
  }

  /**
   * Get accompaniments by composer
   */
  static getByComposer(composer: ComposerName): ComposerAccompaniment[] {
    return this.library.filter(acc => acc.composer === composer);
  }

  /**
   * Get accompaniments by period
   */
  static getByPeriod(period: MusicalPeriod): ComposerAccompaniment[] {
    return this.library.filter(acc => acc.period === period);
  }

  /**
   * Get accompaniments by harmony type
   */
  static getByHarmonyType(type: HarmonyType): ComposerAccompaniment[] {
    return this.library.filter(acc => acc.metadata.harmonyType === type);
  }

  /**
   * Get accompaniments by difficulty
   */
  static getByDifficulty(difficulty: DifficultyLevel): ComposerAccompaniment[] {
    return this.library.filter(acc => acc.metadata.difficulty === difficulty);
  }

  /**
   * Search accompaniments by keyword
   */
  static search(query: string): ComposerAccompaniment[] {
    const lowerQuery = query.toLowerCase();
    return this.library.filter(acc => 
      acc.title.toLowerCase().includes(lowerQuery) ||
      acc.description.toLowerCase().includes(lowerQuery) ||
      acc.composer.toLowerCase().includes(lowerQuery) ||
      acc.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get accompaniment by ID
   */
  static getById(id: string): ComposerAccompaniment | undefined {
    return this.library.find(acc => acc.id === id);
  }

  /**
   * Get all composers
   */
  static getAllComposers(): ComposerName[] {
    const composers = new Set(this.library.map(acc => acc.composer));
    return Array.from(composers).sort();
  }

  /**
   * Get all periods
   */
  static getAllPeriods(): MusicalPeriod[] {
    const periods = new Set(this.library.map(acc => acc.period));
    return Array.from(periods).sort();
  }

  /**
   * Get all harmony types
   */
  static getAllHarmonyTypes(): HarmonyType[] {
    const types = new Set(this.library.map(acc => acc.metadata.harmonyType));
    return Array.from(types).sort();
  }

  /**
   * Add custom accompaniment (for user-provided patterns in Phase 2)
   */
  static addCustomAccompaniment(accompaniment: ComposerAccompaniment): void {
    // Check if ID already exists
    if (this.library.find(acc => acc.id === accompaniment.id)) {
      throw new Error(`Accompaniment with ID ${accompaniment.id} already exists`);
    }
    this.library.push(accompaniment);
  }

  /**
   * Transform accompaniment pattern
   * ADDITIVE FIX: Now properly handles chords (arrays) and rests (-1)
   */
  static transform(
    accompaniment: ComposerAccompaniment,
    transformation: TransformationParams,
    mode?: Mode,
    keySignature?: KeySignature
  ): ComposerAccompaniment {
    const { melody, rhythm } = accompaniment.pattern;
    let transformedMelody: (MidiNote | MidiNote[] | -1)[] = [...melody];

    switch (transformation.type) {
      case 'transpose':
        if (transformation.interval !== undefined) {
          transformedMelody = melody.map(note => {
            // Handle rest
            if (note === -1) {
              return -1;
            }
            
            // Handle chord (array of notes)
            if (Array.isArray(note)) {
              return note.map(n => (n + transformation.interval!) as MidiNote) as MidiNote[];
            }
            
            // Handle single note
            return (note + transformation.interval!) as MidiNote;
          });
        }
        break;

      case 'retrograde':
        transformedMelody = [...melody].reverse();
        break;

      case 'inversion':
        // For inversion, we need to handle chords by inverting each note in the chord
        const axis = transformation.inversionAxis || (Array.isArray(melody[0]) ? melody[0][0] : (melody[0] === -1 ? 60 : melody[0]));
        transformedMelody = melody.map(note => {
          // Handle rest
          if (note === -1) {
            return -1;
          }
          
          // Handle chord (array of notes)
          if (Array.isArray(note)) {
            return CounterpointEngine.applyInversion(note, 'chromatic', axis) as MidiNote[];
          }
          
          // Handle single note
          return CounterpointEngine.applyInversion([note], 'chromatic', axis)[0];
        });
        break;

      case 'retrograde-inversion':
        const inversionAxis = transformation.inversionAxis || (Array.isArray(melody[0]) ? melody[0][0] : (melody[0] === -1 ? 60 : melody[0]));
        const inverted = melody.map(note => {
          // Handle rest
          if (note === -1) {
            return -1;
          }
          
          // Handle chord (array of notes)
          if (Array.isArray(note)) {
            return CounterpointEngine.applyInversion(note, 'chromatic', inversionAxis) as MidiNote[];
          }
          
          // Handle single note
          return CounterpointEngine.applyInversion([note], 'chromatic', inversionAxis)[0];
        });
        transformedMelody = inverted.reverse();
        break;

      case 'diminution':
        // Halve the duration of each note
        const diminutedRhythm: NoteValue[] = rhythm.map(val => {
          const rhythmMap: { [key in NoteValue]: NoteValue } = {
            'double-whole': 'whole',
            'whole': 'half',
            'dotted-half': 'dotted-quarter',
            'half': 'quarter',
            'dotted-quarter': 'eighth',
            'quarter': 'eighth',
            'eighth': 'sixteenth',
            'sixteenth': 'sixteenth' // Can't go smaller
          };
          return rhythmMap[val] || val;
        });
        
        return {
          ...accompaniment,
          id: `${accompaniment.id}-diminution`,
          title: `${accompaniment.title} (Diminution)`,
          pattern: {
            ...accompaniment.pattern,
            melody: transformedMelody,
            rhythm: diminutedRhythm
          }
        };

      case 'augmentation':
        // Double the duration of each note
        const augmentedRhythm: NoteValue[] = rhythm.map(val => {
          const rhythmMap: { [key in NoteValue]: NoteValue } = {
            'sixteenth': 'eighth',
            'eighth': 'quarter',
            'quarter': 'half',
            'dotted-quarter': 'dotted-half',
            'half': 'whole',
            'dotted-half': 'double-whole',
            'whole': 'double-whole',
            'double-whole': 'double-whole' // Can't go larger
          };
          return rhythmMap[val] || val;
        });
        
        return {
          ...accompaniment,
          id: `${accompaniment.id}-augmentation`,
          title: `${accompaniment.title} (Augmentation)`,
          pattern: {
            ...accompaniment.pattern,
            melody: transformedMelody,
            rhythm: augmentedRhythm
          }
        };

      case 'mode-shift':
        if (mode && transformation.targetMode) {
          transformedMelody = CounterpointEngine.applyModeShifting(
            melody,
            mode,
            transformation.targetMode
          );
        }
        break;
    }

    // Return transformed accompaniment
    return {
      ...accompaniment,
      id: `${accompaniment.id}-${transformation.type}`,
      title: `${accompaniment.title} (${transformation.type})`,
      pattern: {
        ...accompaniment.pattern,
        melody: transformedMelody
      }
    };
  }

  /**
   * Expand pattern with repetitions
   * Returns melody with chords and rests preserved
   */
  static expandPattern(pattern: AccompanimentPattern): { 
    melody: (MidiNote | MidiNote[] | -1)[]; 
    rhythm: NoteValue[] 
  } {
    const repeatCount = pattern.repeatCount || 1;
    const expandedMelody: (MidiNote | MidiNote[] | -1)[] = [];
    const expandedRhythm: NoteValue[] = [];

    for (let i = 0; i < repeatCount; i++) {
      expandedMelody.push(...pattern.melody);
      expandedRhythm.push(...pattern.rhythm);
    }

    return {
      melody: expandedMelody,
      rhythm: expandedRhythm
    };
  }

  /**
   * Adapt accompaniment to target key
   */
  static adaptToKey(
    accompaniment: ComposerAccompaniment,
    targetKey: number
  ): ComposerAccompaniment {
    // Calculate transposition interval
    // Assume original is in C (MIDI 60)
    const originalRoot = 60;
    const targetRoot = 60 + targetKey;
    const interval = targetRoot - originalRoot;

    return this.transform(accompaniment, {
      type: 'transpose',
      interval
    });
  }

  // === ADDITIVE: NEW SIMPLE EDITING FUNCTIONS ===

  /**
   * Simple edit operations for accompaniments
   * TRANSPOSE, EXPAND, TRUNCATE, COMBINE
   */
  static editAccompaniment(
    accompaniment: ComposerAccompaniment,
    params: AccompanimentEditParams
  ): ComposerAccompaniment {
    switch (params.type) {
      case 'transpose':
        return this.transposeAccompaniment(accompaniment, params.interval || 0);
      
      case 'expand':
        return this.expandAccompaniment(accompaniment, params.repeatCount || 2);
      
      case 'truncate':
        return this.truncateAccompaniment(accompaniment, params.maxNotes || 8);
      
      case 'combine':
        if (!params.combineWith) {
          throw new Error('combineWith parameter required for combine operation');
        }
        return this.combineAccompaniments(accompaniment, params.combineWith);
      
      default:
        return accompaniment;
    }
  }

  /**
   * Transpose accompaniment by interval
   * ADDITIVE FIX: Now properly handles chords (arrays) and rests (-1)
   */
  static transposeAccompaniment(
    accompaniment: ComposerAccompaniment,
    interval: number
  ): ComposerAccompaniment {
    const transposedMelody = accompaniment.pattern.melody.map(note => {
      // Handle rest
      if (note === -1) {
        return -1;
      }
      
      // Handle chord (array of notes)
      if (Array.isArray(note)) {
        return note.map(n => (n + interval) as MidiNote) as MidiNote[];
      }
      
      // Handle single note
      return (note + interval) as MidiNote;
    });

    return {
      ...accompaniment,
      id: `${accompaniment.id}-transpose-${interval}`,
      title: `${accompaniment.title} (${interval > 0 ? '+' : ''}${interval})`,
      pattern: {
        ...accompaniment.pattern,
        melody: transposedMelody
      }
    };
  }

  /**
   * Expand accompaniment by repeating the pattern
   * ADDITIVE FIX: Corrected type to support chords and rests
   */
  static expandAccompaniment(
    accompaniment: ComposerAccompaniment,
    repeatCount: number
  ): ComposerAccompaniment {
    const expandedMelody: (MidiNote | MidiNote[] | -1)[] = [];
    const expandedRhythm: NoteValue[] = [];

    for (let i = 0; i < repeatCount; i++) {
      expandedMelody.push(...accompaniment.pattern.melody);
      expandedRhythm.push(...accompaniment.pattern.rhythm);
    }

    return {
      ...accompaniment,
      id: `${accompaniment.id}-expand-${repeatCount}`,
      title: `${accompaniment.title} (×${repeatCount})`,
      pattern: {
        ...accompaniment.pattern,
        melody: expandedMelody,
        rhythm: expandedRhythm,
        repeatCount: 1 // Already expanded
      }
    };
  }

  /**
   * Truncate accompaniment to specified number of notes
   */
  static truncateAccompaniment(
    accompaniment: ComposerAccompaniment,
    maxNotes: number
  ): ComposerAccompaniment {
    const truncatedMelody = accompaniment.pattern.melody.slice(0, maxNotes);
    const truncatedRhythm = accompaniment.pattern.rhythm.slice(0, maxNotes);

    return {
      ...accompaniment,
      id: `${accompaniment.id}-truncate-${maxNotes}`,
      title: `${accompaniment.title} (${maxNotes} notes)`,
      pattern: {
        ...accompaniment.pattern,
        melody: truncatedMelody,
        rhythm: truncatedRhythm
      }
    };
  }

  /**
   * Combine two accompaniments sequentially
   */
  static combineAccompaniments(
    first: ComposerAccompaniment,
    second: ComposerAccompaniment
  ): ComposerAccompaniment {
    const combinedMelody = [...first.pattern.melody, ...second.pattern.melody];
    const combinedRhythm = [...first.pattern.rhythm, ...second.pattern.rhythm];

    return {
      ...first,
      id: `${first.id}-combined-${second.id}`,
      title: `${first.composer} + ${second.composer}`,
      description: `Combined: ${first.title} + ${second.title}`,
      pattern: {
        melody: combinedMelody,
        rhythm: combinedRhythm,
        timeSignature: first.pattern.timeSignature,
        repeatCount: 1
      },
      tags: [...(first.tags || []), ...(second.tags || [])]
    };
  }
}