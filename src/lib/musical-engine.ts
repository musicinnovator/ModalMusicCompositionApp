import { 
  Mode, 
  PitchClass, 
  Melody, 
  Interval, 
  EntrySpec, 
  Part, 
  Theme, 
  CantusFirmus,
  Degree,
  MODE_NAMES,
  ModeCategory,
  EXTENDED_MODE_CATEGORIES,
  MidiNote
} from '../types/musical';

export class MusicalEngine {
  // Build six modes defined by distinct half-step placements
  static buildSixModes(final: PitchClass): Mode[] {
    const patterns = [
      [2,1,2,2,1,2,2], // Mode1: Dorian-like
      [1,2,2,1,2,2,2], // Mode2: Phrygian-like  
      [2,2,1,2,2,1,2], // Mode3: Lydian-like
      [2,1,2,2,2,1,2], // Mode4: Mixolydian-like
      [2,1,2,1,2,2,2], // Mode5: Aeolian-like
      [1,2,1,2,2,1,3]  // Mode6: Locrian-like
    ];

    return patterns.map((pattern, i) => ({
      index: i + 1,
      stepPattern: pattern,
      final,
      octaveSpan: 12,
      name: MODE_NAMES[i]
    }));
  }

  // Build comprehensive mode collection from all world cultures
  static buildAllWorldModes(final: PitchClass): ModeCategory[] {
    const categories: ModeCategory[] = [];
    let currentIndex = 1;
    
    try {
      // Enhanced timeout check with better error handling
      const checkTimeout = () => {
        if (currentIndex > 200) { // Increased limit for expanded mode collection
          throw new Error('Mode building operation exceeded safe limit - preventing infinite loops');
        }
      };

      // Western Traditional Modes (Enhanced with more classical modes)
      checkTimeout();
      const westernModes: Mode[] = [
        { index: currentIndex++, stepPattern: [2,2,1,2,2,2,1], final, octaveSpan: 12, name: 'Ionian (Major)' },
        { index: currentIndex++, stepPattern: [2,1,2,2,1,2,2], final, octaveSpan: 12, name: 'Dorian' },
        { index: currentIndex++, stepPattern: [1,2,2,1,2,2,2], final, octaveSpan: 12, name: 'Phrygian' },
        { index: currentIndex++, stepPattern: [2,2,1,2,2,1,2], final, octaveSpan: 12, name: 'Lydian' },
        { index: currentIndex++, stepPattern: [2,1,2,2,2,1,2], final, octaveSpan: 12, name: 'Mixolydian' },
        { index: currentIndex++, stepPattern: [2,1,2,1,2,2,2], final, octaveSpan: 12, name: 'Aeolian (Natural Minor)' },
        { index: currentIndex++, stepPattern: [1,2,1,2,2,1,3], final, octaveSpan: 12, name: 'Locrian' },
        // Additional classical modes
        { index: currentIndex++, stepPattern: [2,1,2,2,1,3,1], final, octaveSpan: 12, name: 'Harmonic Minor' },
        { index: currentIndex++, stepPattern: [2,1,2,2,2,2,1], final, octaveSpan: 12, name: 'Melodic Minor' },
        { index: currentIndex++, stepPattern: [1,3,1,2,1,3,1], final, octaveSpan: 12, name: 'Double Harmonic' },
        { index: currentIndex++, stepPattern: [1,2,2,2,1,2,2], final, octaveSpan: 12, name: 'Neapolitan Minor' },
        { index: currentIndex++, stepPattern: [2,2,2,1,2,2,1], final, octaveSpan: 12, name: 'Neapolitan Major' }
      ];

      // Chinese Traditional Modes (Expanded with more pentatonic variations)
      checkTimeout();
      const chineseModes: Mode[] = [
        { index: currentIndex++, stepPattern: [2,2,3,2,3], final, octaveSpan: 12, name: 'Gong (宫) - Major Pentatonic' },
        { index: currentIndex++, stepPattern: [2,3,2,2,3], final, octaveSpan: 12, name: 'Shang (商)' },
        { index: currentIndex++, stepPattern: [3,2,2,3,2], final, octaveSpan: 12, name: 'Jiao (角)' },
        { index: currentIndex++, stepPattern: [2,2,3,3,2], final, octaveSpan: 12, name: 'Zhi (徵)' },
        { index: currentIndex++, stepPattern: [2,3,2,3,2], final, octaveSpan: 12, name: 'Yu (羽) - Minor Pentatonic' },
        // Additional Chinese modes
        { index: currentIndex++, stepPattern: [4,2,1,4,1], final, octaveSpan: 12, name: 'Chinese Traditional' },
        { index: currentIndex++, stepPattern: [1,4,2,2,3], final, octaveSpan: 12, name: 'Chinese Ceremonial' },
        { index: currentIndex++, stepPattern: [3,2,4,1,2], final, octaveSpan: 12, name: 'Mongolian' },
        { index: currentIndex++, stepPattern: [2,1,3,3,3], final, octaveSpan: 12, name: 'Pelog (Chinese Style)' }
      ];

      // Japanese Modes (Enhanced with more traditional scales)
      checkTimeout();
      const japaneseModes: Mode[] = [
        { index: currentIndex++, stepPattern: [2,1,4,1,4], final, octaveSpan: 12, name: 'Hirajoshi' },
        { index: currentIndex++, stepPattern: [2,1,4,2,3], final, octaveSpan: 12, name: 'Kumoi' },
        { index: currentIndex++, stepPattern: [1,4,2,1,4], final, octaveSpan: 12, name: 'In' },
        { index: currentIndex++, stepPattern: [1,4,1,4,2], final, octaveSpan: 12, name: 'Iwato' },
        { index: currentIndex++, stepPattern: [2,2,2,2,4], final, octaveSpan: 12, name: 'Yo' },
        { index: currentIndex++, stepPattern: [1,2,4,1,2,2], final, octaveSpan: 12, name: 'Insen' },
        // Additional Japanese modes
        { index: currentIndex++, stepPattern: [1,4,3,1,3], final, octaveSpan: 12, name: 'Akebono' },
        { index: currentIndex++, stepPattern: [2,3,2,2,3], final, octaveSpan: 12, name: 'Sakura' },
        { index: currentIndex++, stepPattern: [1,2,3,1,2,3], final, octaveSpan: 12, name: 'Hon-kumoi-joshi' },
        { index: currentIndex++, stepPattern: [4,1,2,4,1], final, octaveSpan: 12, name: 'Taishikicho' }
      ];

      // Middle Eastern & Hebrew Modes (Greatly expanded)
      checkTimeout();
      const middleEasternModes: Mode[] = [
        { index: currentIndex++, stepPattern: [1,3,1,2,1,3,1], final, octaveSpan: 12, name: 'Ahava Rabbah (Hebrew)' },
        { index: currentIndex++, stepPattern: [1,3,1,2,1,2,2], final, octaveSpan: 12, name: 'Phrygian Dominant' },
        { index: currentIndex++, stepPattern: [1,3,1,2,1,2,2], final, octaveSpan: 12, name: 'Byzantine' },
        { index: currentIndex++, stepPattern: [2,1,3,1,2,1,2], final, octaveSpan: 12, name: 'Hijaz' },
        { index: currentIndex++, stepPattern: [3,1,2,2,1,2,1], final, octaveSpan: 12, name: 'Maqam Kurd' },
        { index: currentIndex++, stepPattern: [2,2,1,2,2,1,2], final, octaveSpan: 12, name: 'Egyptian' },
        // Additional Middle Eastern modes
        { index: currentIndex++, stepPattern: [1,3,1,2,2,1,2], final, octaveSpan: 12, name: 'Hijaz Kar' },
        { index: currentIndex++, stepPattern: [2,1,3,1,1,3,1], final, octaveSpan: 12, name: 'Nikriz' },
        { index: currentIndex++, stepPattern: [1,2,3,1,2,1,2], final, octaveSpan: 12, name: 'Saba' },
        { index: currentIndex++, stepPattern: [2,1,2,2,1,3,1], final, octaveSpan: 12, name: 'Bayati' },
        { index: currentIndex++, stepPattern: [1,3,1,2,1,1,3], final, octaveSpan: 12, name: 'Rast' },
        { index: currentIndex++, stepPattern: [2,1,3,1,2,2,1], final, octaveSpan: 12, name: 'Ajam' },
        { index: currentIndex++, stepPattern: [1,2,2,2,1,3,1], final, octaveSpan: 12, name: 'Ussak' },
        { index: currentIndex++, stepPattern: [3,1,1,3,1,2,1], final, octaveSpan: 12, name: 'Hicaz Humayun' }
      ];

      // Indian Classical Modes (New category)
      checkTimeout();
      const indianModes: Mode[] = [
        { index: currentIndex++, stepPattern: [2,2,1,2,2,2,1], final, octaveSpan: 12, name: 'Bilawal (Indian Ionian)' },
        { index: currentIndex++, stepPattern: [2,1,2,2,2,1,2], final, octaveSpan: 12, name: 'Khamaj (Indian Mixolydian)' },
        { index: currentIndex++, stepPattern: [1,2,2,2,1,2,2], final, octaveSpan: 12, name: 'Bhairav' },
        { index: currentIndex++, stepPattern: [1,3,1,2,1,2,2], final, octaveSpan: 12, name: 'Bhairavi' },
        { index: currentIndex++, stepPattern: [2,1,2,2,1,3,1], final, octaveSpan: 12, name: 'Kalyan' },
        { index: currentIndex++, stepPattern: [1,2,2,1,2,2,2], final, octaveSpan: 12, name: 'Marwa' },
        { index: currentIndex++, stepPattern: [2,2,1,2,1,3,1], final, octaveSpan: 12, name: 'Purvi' },
        { index: currentIndex++, stepPattern: [1,3,1,2,2,1,2], final, octaveSpan: 12, name: 'Todi' },
        { index: currentIndex++, stepPattern: [2,1,3,1,1,3,1], final, octaveSpan: 12, name: 'Ahir Bhairav' },
        { index: currentIndex++, stepPattern: [1,2,3,1,1,3,1], final, octaveSpan: 12, name: 'Basant' }
      ];

      // European Folk Modes (New category)
      checkTimeout();
      const europeanFolkModes: Mode[] = [
        { index: currentIndex++, stepPattern: [2,1,2,2,1,2,2], final, octaveSpan: 12, name: 'Irish Traditional' },
        { index: currentIndex++, stepPattern: [1,2,2,2,1,2,2], final, octaveSpan: 12, name: 'Scottish Bagpipe' },
        { index: currentIndex++, stepPattern: [2,2,1,2,1,2,2], final, octaveSpan: 12, name: 'Gypsy Scale' },
        { index: currentIndex++, stepPattern: [1,3,1,1,3,1,2], final, octaveSpan: 12, name: 'Flamenco' },
        { index: currentIndex++, stepPattern: [2,1,3,1,2,2,1], final, octaveSpan: 12, name: 'Romanian Major' },
        { index: currentIndex++, stepPattern: [1,2,3,1,1,2,2], final, octaveSpan: 12, name: 'Hungarian Folk' },
        { index: currentIndex++, stepPattern: [2,2,2,1,1,2,2], final, octaveSpan: 12, name: 'Klezmer' },
        { index: currentIndex++, stepPattern: [1,2,1,3,1,2,2], final, octaveSpan: 12, name: 'Ukrainian Dorian' }
      ];

      // African Modes (New category)
      checkTimeout();
      const africanModes: Mode[] = [
        { index: currentIndex++, stepPattern: [2,1,3,2,1,3], final, octaveSpan: 12, name: 'West African Pentatonic' },
        { index: currentIndex++, stepPattern: [3,2,2,2,3], final, octaveSpan: 12, name: 'Ethiopian Traditional' },
        { index: currentIndex++, stepPattern: [1,2,2,2,2,2,1], final, octaveSpan: 12, name: 'Chromatic African' },
        { index: currentIndex++, stepPattern: [2,2,1,3,2,2], final, octaveSpan: 12, name: 'Mbira Scale' },
        { index: currentIndex++, stepPattern: [3,1,3,2,1,2], final, octaveSpan: 12, name: 'Kora Tuning' },
        { index: currentIndex++, stepPattern: [2,3,1,2,2,2], final, octaveSpan: 12, name: 'Maghreb' },
        { index: currentIndex++, stepPattern: [1,3,2,1,3,2], final, octaveSpan: 12, name: 'Moorish' }
      ];

      // Native American Modes (New category)
      checkTimeout();
      const nativeAmericanModes: Mode[] = [
        { index: currentIndex++, stepPattern: [3,2,2,3,2], final, octaveSpan: 12, name: 'Plains Indian' },
        { index: currentIndex++, stepPattern: [2,3,2,2,3], final, octaveSpan: 12, name: 'Cherokee' },
        { index: currentIndex++, stepPattern: [1,4,1,3,3], final, octaveSpan: 12, name: 'Navajo Traditional' },
        { index: currentIndex++, stepPattern: [4,1,2,3,2], final, octaveSpan: 12, name: 'Pueblo Scale' },
        { index: currentIndex++, stepPattern: [2,1,4,2,3], final, octaveSpan: 12, name: 'Lakota' },
        { index: currentIndex++, stepPattern: [1,3,3,2,3], final, octaveSpan: 12, name: 'Inuit Traditional' }
      ];

      // Blues & Jazz Scales (Enhanced)
      checkTimeout();
      const bluesJazzModes: Mode[] = [
        { index: currentIndex++, stepPattern: [3,2,1,1,3,2], final, octaveSpan: 12, name: 'Blues Scale' },
        { index: currentIndex++, stepPattern: [2,2,2,2,2,2], final, octaveSpan: 12, name: 'Whole Tone' },
        { index: currentIndex++, stepPattern: [2,1,2,1,2,2,2], final, octaveSpan: 12, name: 'Locrian ♯2' },
        { index: currentIndex++, stepPattern: [2,1,2,2,2,2,1], final, octaveSpan: 12, name: 'Melodic Minor' },
        { index: currentIndex++, stepPattern: [1,2,2,2,1,2,2], final, octaveSpan: 12, name: 'Neapolitan Minor' },
        // Additional jazz modes
        { index: currentIndex++, stepPattern: [1,2,1,2,1,2,1,2], final, octaveSpan: 12, name: 'Octatonic (Jazz)' },
        { index: currentIndex++, stepPattern: [2,1,1,2,1,1,2,1,1], final, octaveSpan: 12, name: 'Diminished (WH)' },
        { index: currentIndex++, stepPattern: [1,1,2,1,1,2,1,1,2], final, octaveSpan: 12, name: 'Diminished (HW)' },
        { index: currentIndex++, stepPattern: [3,2,1,1,2,3], final, octaveSpan: 12, name: 'Blues Major' },
        { index: currentIndex++, stepPattern: [2,1,3,1,1,1,3], final, octaveSpan: 12, name: 'Bebop Dominant' },
        { index: currentIndex++, stepPattern: [2,2,1,2,1,1,2,1], final, octaveSpan: 12, name: 'Bebop Major' }
      ];

      // Exotic & Synthetic Scales (Enhanced)
      checkTimeout();
      const exoticModes: Mode[] = [
        { index: currentIndex++, stepPattern: [2,1,3,1,2,1,2], final, octaveSpan: 12, name: 'Hungarian Minor' },
        { index: currentIndex++, stepPattern: [3,1,2,1,2,1,2], final, octaveSpan: 12, name: 'Hungarian Major' },
        { index: currentIndex++, stepPattern: [2,2,2,1,2,1,2], final, octaveSpan: 12, name: 'Prometheus' },
        { index: currentIndex++, stepPattern: [1,2,1,1,2,1,2,2], final, octaveSpan: 12, name: 'Enigmatic' },
        { index: currentIndex++, stepPattern: [2,1,1,1,2,2,1,2], final, octaveSpan: 12, name: 'Spanish Eight-Tone' },
        // More exotic scales
        { index: currentIndex++, stepPattern: [1,1,1,1,1,1,1,1,1,1,1,1], final, octaveSpan: 12, name: 'Chromatic' },
        { index: currentIndex++, stepPattern: [6,6], final, octaveSpan: 12, name: 'Tritone Scale' },
        { index: currentIndex++, stepPattern: [3,3,3,3], final, octaveSpan: 12, name: 'Augmented Scale' },
        { index: currentIndex++, stepPattern: [4,4,4], final, octaveSpan: 12, name: 'Diminished Triad' },
        { index: currentIndex++, stepPattern: [1,3,2,1,2,3], final, octaveSpan: 12, name: 'Messiaen Mode 2' },
        { index: currentIndex++, stepPattern: [2,1,1,2,1,1,2,1,1], final, octaveSpan: 12, name: 'Messiaen Mode 3' },
        { index: currentIndex++, stepPattern: [1,1,3,1,1,1,3,1], final, octaveSpan: 12, name: 'Messiaen Mode 4' }
      ];

      // Microtonal Approximations (New experimental category)
      checkTimeout();
      const microtonalModes: Mode[] = [
        { index: currentIndex++, stepPattern: [1,1,1,2,1,1,1,2,2], final, octaveSpan: 12, name: '53-TET Approximation' },
        { index: currentIndex++, stepPattern: [2,1,1,1,2,1,1,1,2], final, octaveSpan: 12, name: '19-TET Approximation' },
        { index: currentIndex++, stepPattern: [1,2,1,1,2,1,2,1,1], final, octaveSpan: 12, name: '31-TET Approximation' },
        { index: currentIndex++, stepPattern: [2,2,1,1,2,2,1,1], final, octaveSpan: 12, name: 'Quarter-tone Scale' }
      ];

      categories.push(
        { name: EXTENDED_MODE_CATEGORIES.WESTERN_TRADITIONAL, modes: westernModes },
        { name: EXTENDED_MODE_CATEGORIES.CHINESE, modes: chineseModes },
        { name: EXTENDED_MODE_CATEGORIES.JAPANESE, modes: japaneseModes },
        { name: EXTENDED_MODE_CATEGORIES.MIDDLE_EASTERN, modes: middleEasternModes },
        { name: EXTENDED_MODE_CATEGORIES.INDIAN_CLASSICAL, modes: indianModes },
        { name: EXTENDED_MODE_CATEGORIES.EUROPEAN_FOLK, modes: europeanFolkModes },
        { name: EXTENDED_MODE_CATEGORIES.AFRICAN, modes: africanModes },
        { name: EXTENDED_MODE_CATEGORIES.NATIVE_AMERICAN, modes: nativeAmericanModes },
        { name: EXTENDED_MODE_CATEGORIES.BLUES_JAZZ, modes: bluesJazzModes },
        { name: EXTENDED_MODE_CATEGORIES.EXOTIC, modes: exoticModes },
        { name: EXTENDED_MODE_CATEGORIES.MICROTONAL, modes: microtonalModes }
      );
      
      console.log(`🎵 Enhanced modal system loaded: ${categories.reduce((total, cat) => total + cat.modes.length, 0)} modes across ${categories.length} cultures`);
      
      return categories;
      
    } catch (error) {
      console.error('Error in buildAllWorldModes:', error);
      // Return minimal fallback on error
      return [{
        name: 'Western Traditional (Fallback)',
        modes: [
          { index: 1, stepPattern: [2,2,1,2,2,2,1], final, octaveSpan: 12, name: 'Ionian (Major)' },
          { index: 2, stepPattern: [2,1,2,1,2,2,2], final, octaveSpan: 12, name: 'Aeolian (Natural Minor)' }
        ]
      }];
    }
  }

  // Build scale degrees from mode
  static buildScaleDegrees(mode: Mode): PitchClass[] {
    const degrees: PitchClass[] = [mode.final];
    let acc = mode.final;
    
    for (let d = 1; d < 7; d++) {
      acc = (acc + mode.stepPattern[d - 1]) % 12;
      degrees.push(acc);
    }
    degrees.push((mode.final + 12) % 12); // octave
    
    return degrees;
  }

  // Build scale from mode (alias for buildScaleDegrees for compatibility)
  static buildScaleFromMode(mode: Mode): PitchClass[] {
    try {
      if (!mode || !mode.stepPattern || mode.stepPattern.length === 0) {
        console.error('Invalid mode provided to buildScaleFromMode');
        return [];
      }
      return this.buildScaleDegrees(mode);
    } catch (error) {
      console.error('Error in buildScaleFromMode:', error);
      return [];
    }
  }

  static semitoneInterval(p1: PitchClass, p2: PitchClass): Interval {
    return p2 - p1;
  }

  static isMelodyDiatonicInMode(melody: Melody, mode: Mode): boolean {
    const scale = this.buildScaleDegrees(mode);
    return melody.every(note => 
      scale.some(scaleNote => (scaleNote % 12) === (note % 12))
    );
  }

  static fitsWithinModalOctave(melody: Melody, mode: Mode): boolean {
    if (melody.length === 0) return true;
    const minP = Math.min(...melody);
    const maxP = Math.max(...melody);
    return (maxP - minP) <= mode.octaveSpan;
  }

  static intervalIsModeConstituentForFugue(entryInterval: Interval): boolean {
    return entryInterval === 0 || Math.abs(entryInterval) === 7 || Math.abs(entryInterval) === 12;
  }

  static nearestPitchClassInSet(pc: PitchClass, set: PitchClass[]): PitchClass {
    let best = set[0];
    let bestDist = 12;
    
    for (const s of set) {
      const d = Math.min((pc - s + 12) % 12, (s - pc + 12) % 12);
      if (d < bestDist) {
        best = s;
        bestDist = d;
      }
    }
    return best;
  }

  static adaptThemeToMode(theme: Theme, mode: Mode): Theme {
    const scale = this.buildScaleDegrees(mode);
    let adapted = theme.map(note => this.nearestPitchClassInSet(note, scale));
    
    if (!this.fitsWithinModalOctave(adapted, mode)) {
      adapted = this.compressIntoOctave(adapted, mode);
    }
    
    return adapted;
  }

  static compressIntoOctave(melody: Melody, mode: Mode): Melody {
    return melody.map(note => {
      let n = note;
      while ((n - mode.final) > mode.octaveSpan) n -= 12;
      while ((mode.final - n) > 0) n += 12;
      return n;
    });
  }

  static intervalsOf(melody: Melody): Interval[] {
    const intervals: Interval[] = [];
    for (let i = 0; i < melody.length - 1; i++) {
      intervals.push(this.semitoneInterval(melody[i], melody[i + 1]));
    }
    return intervals;
  }

  static reconstructMelodyFromIntervals(startPitch: PitchClass, intervals: Interval[]): Melody {
    const melody = [startPitch];
    let curr = startPitch;
    
    for (const interval of intervals) {
      curr = (curr + interval) % 12;
      while (curr < 0) curr += 12;
      melody.push(curr);
    }
    
    return melody;
  }

  static buildRhythmWithInitialRests(length: number, rests: number): number[] {
    const rhythm: number[] = [];
    for (let i = 0; i < rests; i++) rhythm.push(0);
    for (let i = 0; i < length; i++) rhythm.push(1);
    return rhythm;
  }

  // Imitation Engine
  static createImitation(cantus: CantusFirmus, imitationSpec: EntrySpec): Part {
    const intervalPattern = this.intervalsOf(cantus);
    let startPitch = (cantus[0] + imitationSpec.entryInterval) % 12;
    while (startPitch < 0) startPitch += 12;
    
    return {
      melody: this.reconstructMelodyFromIntervals(startPitch, intervalPattern),
      rhythm: this.buildRhythmWithInitialRests(cantus.length, imitationSpec.entryDelay)
    };
  }

  // Octave-aware imitation engine for MIDI notes
  // This preserves octave information during transposition
  static createOctaveAwareImitation(cantusMidi: MidiNote[], imitationInterval: Interval, delay: number): Part {
    if (cantusMidi.length === 0) {
      return {
        melody: [],
        rhythm: []
      };
    }

    // Calculate intervals between consecutive MIDI notes (these preserve octave jumps)
    const midiIntervals: Interval[] = [];
    for (let i = 0; i < cantusMidi.length - 1; i++) {
      midiIntervals.push(cantusMidi[i + 1] - cantusMidi[i]);
    }

    // Transpose the starting note by the imitation interval
    const startMidiNote = cantusMidi[0] + imitationInterval;
    
    // Ensure starting note is within soundfont-supported range (21-108)
    // This prevents notes below A0 or above C8
    let adjustedStartNote = startMidiNote;
    if (adjustedStartNote < 21) {
      // Transpose up by octaves until in soundfont range
      while (adjustedStartNote < 21) {
        adjustedStartNote += 12;
      }
    } else if (adjustedStartNote > 108) {
      // Transpose down by octaves until in soundfont range
      while (adjustedStartNote > 108) {
        adjustedStartNote -= 12;
      }
    }

    // Reconstruct the melody by applying the same intervals
    const imitationMelody: MidiNote[] = [adjustedStartNote];
    let currentNote = adjustedStartNote;

    for (const interval of midiIntervals) {
      currentNote = currentNote + interval;
      
      // Clamp to soundfont-supported range (21-108, A0 to C8)
      if (currentNote < 21) {
        // Transpose up by octaves to bring into range
        while (currentNote < 21) {
          currentNote += 12;
        }
      } else if (currentNote > 108) {
        // Transpose down by octaves to bring into range
        while (currentNote > 108) {
          currentNote -= 12;
        }
      }
      
      imitationMelody.push(currentNote);
    }

    return {
      melody: imitationMelody,
      rhythm: this.buildRhythmWithInitialRests(cantusMidi.length, delay)
    };
  }

  // Octave-aware imitation that respects the full MIDI note range
  static buildOctaveAwareImitationFromCantus(cantusMidi: MidiNote[], imitationInterval: Interval, delay: number): Part {
    return this.createOctaveAwareImitation(cantusMidi, imitationInterval, delay);
  }

  // Octave-aware fugue entry generation for MIDI notes
  static createOctaveAwareFugueEntry(subjectMidi: MidiNote[], mode: Mode, entrySpec: EntrySpec): Part {
    if (!this.intervalIsModeConstituentForFugue(entrySpec.entryInterval)) {
      throw new Error('Invalid fugue entry interval');
    }

    if (subjectMidi.length === 0) {
      return {
        melody: [],
        rhythm: []
      };
    }

    // For octave-aware fugue, we'll use a simpler approach:
    // 1. Calculate MIDI intervals
    // 2. Transpose the starting note
    // 3. Apply the same intervals with modal adjustment

    const midiIntervals: Interval[] = [];
    for (let i = 0; i < subjectMidi.length - 1; i++) {
      midiIntervals.push(subjectMidi[i + 1] - subjectMidi[i]);
    }

    // Transpose the starting note
    let startNote = subjectMidi[0] + entrySpec.entryInterval;
    
    // Keep within soundfont-supported range (21-108, A0 to C8)
    while (startNote < 21) startNote += 12;
    while (startNote > 108) startNote -= 12;

    // Build the entry by applying intervals
    const entryMelody: MidiNote[] = [startNote];
    let currentNote = startNote;

    for (const interval of midiIntervals) {
      currentNote = currentNote + interval;
      
      // Clamp to soundfont-supported range (21-108)
      if (currentNote < 21) {
        // Transpose up by octaves to bring into range
        while (currentNote < 21) {
          currentNote += 12;
        }
      } else if (currentNote > 108) {
        // Transpose down by octaves to bring into range
        while (currentNote > 108) {
          currentNote -= 12;
        }
      }
      
      entryMelody.push(currentNote);
    }

    return {
      melody: entryMelody,
      rhythm: this.buildRhythmWithInitialRests(subjectMidi.length, entrySpec.entryDelay)
    };
  }

  // Build octave-aware fugue with multiple entries
  static buildOctaveAwareFugue(subjectMidi: MidiNote[], mode: Mode, entries: EntrySpec[]): Part[] {
    const parts: Part[] = [];
    
    for (let i = 0; i < entries.length; i++) {
      let entrySpec = entries[i];
      
      // First entry should typically be at unison
      if (i === 0 && !this.intervalIsModeConstituentForFugue(entrySpec.entryInterval)) {
        entrySpec = { ...entrySpec, entryInterval: 0 };
      }
      
      parts.push(this.createOctaveAwareFugueEntry(subjectMidi, mode, entrySpec));
    }
    
    return parts;
  }

  // Fugue Engine
  static createFugueEntry(subject: Theme, mode: Mode, entrySpec: EntrySpec): Part {
    if (!this.intervalIsModeConstituentForFugue(entrySpec.entryInterval)) {
      throw new Error('Invalid fugue entry interval');
    }

    const modalSubject = this.ensureSubjectDiatonic(subject, mode);
    const diatonicIntervals = this.diatonicIntervalPattern(modalSubject, mode);
    const startNote = this.modalTranspose(modalSubject[0], entrySpec.entryInterval, mode);
    const adjustedIntervals = this.enforceFourthFifthCompensation(diatonicIntervals, mode);
    let line = this.reconstructMelodyFromDiatonicIntervals(startNote, adjustedIntervals, mode);
    
    if (!this.fitsWithinModalOctave(line, mode)) {
      line = this.compressIntoOctave(line, mode);
    }

    return {
      melody: line,
      rhythm: this.buildRhythmWithInitialRests(modalSubject.length, entrySpec.entryDelay)
    };
  }

  static ensureSubjectDiatonic(subject: Theme, mode: Mode): Theme {
    if (this.themeSuitableForMode(subject, mode)) {
      return subject;
    }
    return this.adaptThemeToMode(subject, mode);
  }

  static themeSuitableForMode(theme: Theme, mode: Mode): boolean {
    return this.isMelodyDiatonicInMode(theme, mode) && this.fitsWithinModalOctave(theme, mode);
  }

  static diatonicIntervalPattern(melody: Melody, mode: Mode): number[] {
    const degrees = this.mapMelodyToDegrees(melody, mode);
    const steps: number[] = [];
    
    for (let i = 0; i < degrees.length - 1; i++) {
      steps.push(degrees[i + 1] - degrees[i]);
    }
    
    return steps;
  }

  static mapMelodyToDegrees(melody: Melody, mode: Mode): Degree[] {
    const scale = this.buildScaleDegrees(mode);
    return melody.map(note => this.findNearestDegree(note, scale));
  }

  static findNearestDegree(note: PitchClass, scale: PitchClass[]): Degree {
    let bestIndex = 0;
    let bestDist = 12;
    
    for (let i = 0; i < 7; i++) {
      const d = Math.min((note - scale[i] + 12) % 12, (scale[i] - note + 12) % 12);
      if (d < bestDist) {
        bestIndex = i;
        bestDist = d;
      }
    }
    
    return bestIndex;
  }

  static modalTranspose(p: PitchClass, semis: Interval, mode: Mode): PitchClass {
    const raw = (p + semis) % 12;
    const scale = this.buildScaleDegrees(mode);
    return this.nearestPitchClassInSet(raw, scale);
  }

  static reconstructMelodyFromDiatonicIntervals(startNote: PitchClass, steps: number[], mode: Mode): Melody {
    const result = [startNote];
    let curr = startNote;
    
    for (const step of steps) {
      curr = this.moveByDiatonicSteps(curr, step, mode);
      result.push(curr);
    }
    
    return result;
  }

  static moveByDiatonicSteps(curr: PitchClass, steps: number, mode: Mode): PitchClass {
    const scale = this.buildScaleDegrees(mode);
    const deg = this.findNearestDegree(curr, scale);
    let newDeg = deg + steps;
    
    while (newDeg < 0) newDeg += 7;
    while (newDeg >= 7) newDeg -= 7;
    
    return scale[newDeg];
  }

  static enforceFourthFifthCompensation(diatonicIntervals: number[], mode: Mode): number[] {
    return diatonicIntervals.map(interval => {
      if (this.isPerfectFifthLeap(interval)) {
        return this.convertToFourthLeap(interval);
      } else if (this.isPerfectFourthLeap(interval)) {
        return this.convertToFifthLeap(interval);
      }
      return interval;
    });
  }

  static isPerfectFifthLeap(diatonicStep: number): boolean {
    return Math.abs(diatonicStep) === 4;
  }

  static isPerfectFourthLeap(diatonicStep: number): boolean {
    return Math.abs(diatonicStep) === 3;
  }

  static convertToFourthLeap(diatonicStep: number): number {
    return Math.sign(diatonicStep) * 3;
  }

  static convertToFifthLeap(diatonicStep: number): number {
    return Math.sign(diatonicStep) * 4;
  }

  // High-level functions
  static buildImitationFromCantus(cantus: CantusFirmus, imitationInterval: Interval, delay: number): Part {
    return this.createImitation(cantus, { entryInterval: imitationInterval, entryDelay: delay });
  }

  static buildFugue(subject: Theme, mode: Mode, entries: EntrySpec[]): Part[] {
    const parts: Part[] = [];
    const modalSubject = this.ensureSubjectDiatonic(subject, mode);
    
    for (let i = 0; i < entries.length; i++) {
      let entrySpec = entries[i];
      
      if (i === 0 && !this.intervalIsModeConstituentForFugue(entrySpec.entryInterval)) {
        entrySpec = { ...entrySpec, entryInterval: 0 };
      }
      
      parts.push(this.createFugueEntry(modalSubject, mode, entrySpec));
    }
    
    return parts;
  }

  // Generate theme with stability bias
  static generateStabilityBiasedTheme(
    length: number, 
    mode: Mode, 
    stabilityMode: 'stable' | 'unstable' | 'mix', 
    stabilityRatio: number = 50
  ): Theme {
    const scale = this.buildScaleDegrees(mode);
    const stableDegrees = [0, 2, 4]; // 1st, 3rd, 5th degrees
    const unstableDegrees = [1, 3, 5, 6]; // 2nd, 4th, 6th, 7th degrees
    
    const theme: Theme = [scale[0]]; // Start on tonic
    
    for (let i = 1; i < length; i++) {
      let useStable: boolean;
      
      if (stabilityMode === 'stable') {
        useStable = Math.random() < 0.8; // 80% stable
      } else if (stabilityMode === 'unstable') {
        useStable = Math.random() < 0.2; // 20% stable
      } else { // mix
        useStable = Math.random() < (1 - stabilityRatio / 100);
      }
      
      const availableDegrees = useStable ? stableDegrees : unstableDegrees;
      const degreeIndex = availableDegrees[Math.floor(Math.random() * availableDegrees.length)];
      theme.push(scale[degreeIndex]);
    }
    
    // Always end on tonic for resolution
    if (theme[theme.length - 1] !== scale[0]) {
      theme[theme.length - 1] = scale[0];
    }
    
    return theme;
  }

  // Apply stability bias to existing theme
  static applyStabilityBias(
    theme: Theme, 
    mode: Mode, 
    stabilityMode: 'stable' | 'unstable' | 'mix', 
    stabilityRatio: number = 50
  ): Theme {
    try {
      const scale = this.buildScaleDegrees(mode);
      const stableDegrees = [0, 2, 4]; // 1st, 3rd, 5th degrees
      const unstableDegrees = [1, 3, 5, 6]; // 2nd, 4th, 6th, 7th degrees
      
      return theme.map((pitch, index) => {
        // Keep first and last notes unchanged for tonal stability
        if (index === 0 || index === theme.length - 1) {
          return pitch;
        }
        
        const currentDegree = this.findNearestDegree(pitch, scale);
        const isCurrentlyStable = stableDegrees.includes(currentDegree);
        
        let shouldBeStable: boolean;
        if (stabilityMode === 'stable') {
          shouldBeStable = Math.random() < 0.8;
        } else if (stabilityMode === 'unstable') {
          shouldBeStable = Math.random() < 0.2;
        } else { // mix
          shouldBeStable = Math.random() < (1 - stabilityRatio / 100);
        }
        
        // If current note matches desired stability, keep it
        if (isCurrentlyStable === shouldBeStable) {
          return pitch;
        }
        
        // Otherwise, find a suitable replacement
        const targetDegrees = shouldBeStable ? stableDegrees : unstableDegrees;
        const targetDegreeIndex = targetDegrees[Math.floor(Math.random() * targetDegrees.length)];
        return scale[targetDegreeIndex];
      });
    } catch (error) {
      console.error('Error applying stability bias:', error);
      return theme; // Return original theme on error
    }
  }

  // === NEW MODE MIXING CAPABILITIES ===

  // Create a hybrid mode by combining characteristics of multiple modes
  static createHybridMode(
    baseModes: Mode[], 
    final: PitchClass, 
    mixingStrategy: 'blend' | 'alternate' | 'weighted' | 'chromatic_fusion' = 'blend',
    weights?: number[]
  ): Mode {
    try {
      if (!baseModes || baseModes.length === 0) {
        throw new Error('At least one base mode is required for hybrid creation');
      }

      if (baseModes.length === 1) {
        return { ...baseModes[0], final, name: `${baseModes[0].name} (Hybrid)` };
      }

      let hybridPattern: number[];
      let hybridName: string;

      switch (mixingStrategy) {
        case 'blend':
          hybridPattern = this.blendModePatterns(baseModes);
          hybridName = `Blended ${baseModes.map(m => m.name).join('/')}`;
          break;

        case 'alternate':
          hybridPattern = this.alternateModePatterns(baseModes);
          hybridName = `Alternating ${baseModes.map(m => m.name).join('/')}`;
          break;

        case 'weighted':
          if (!weights || weights.length !== baseModes.length) {
            weights = baseModes.map(() => 1 / baseModes.length); // Equal weights
          }
          hybridPattern = this.weightedModeBlend(baseModes, weights);
          hybridName = `Weighted ${baseModes.map(m => m.name).join('/')}`;
          break;

        case 'chromatic_fusion':
          hybridPattern = this.chromaticFusionPattern(baseModes);
          hybridName = `Chromatic Fusion ${baseModes.map(m => m.name).join('/')}`;
          break;

        default:
          hybridPattern = this.blendModePatterns(baseModes);
          hybridName = `Hybrid ${baseModes.map(m => m.name).join('/')}`;
      }

      return {
        index: 999, // Special index for user-created modes
        stepPattern: hybridPattern,
        final,
        octaveSpan: 12,
        name: hybridName
      };
    } catch (error) {
      console.error('Error creating hybrid mode:', error);
      // Return the first mode as fallback
      return { ...baseModes[0], final, name: `${baseModes[0].name} (Error Fallback)` };
    }
  }

  // Blend mode patterns by averaging intervals
  private static blendModePatterns(modes: Mode[]): number[] {
    try {
      const maxLength = Math.max(...modes.map(m => m.stepPattern.length));
      const blendedPattern: number[] = [];

      for (let i = 0; i < maxLength; i++) {
        let sum = 0;
        let count = 0;
        
        modes.forEach(mode => {
          if (i < mode.stepPattern.length) {
            sum += mode.stepPattern[i];
            count++;
          }
        });
        
        if (count > 0) {
          const avgInterval = Math.round(sum / count);
          blendedPattern.push(Math.max(1, Math.min(4, avgInterval))); // Clamp to reasonable interval range
        }
      }

      // Ensure pattern sums to 12 semitones (adjust last interval if needed)
      const currentSum = blendedPattern.reduce((a, b) => a + b, 0);
      if (currentSum !== 12 && blendedPattern.length > 0) {
        const difference = 12 - currentSum;
        blendedPattern[blendedPattern.length - 1] += difference;
        blendedPattern[blendedPattern.length - 1] = Math.max(1, blendedPattern[blendedPattern.length - 1]);
      }

      return blendedPattern.length > 0 ? blendedPattern : [2,2,1,2,2,2,1]; // Default to major scale
    } catch (error) {
      console.error('Error blending mode patterns:', error);
      return [2,2,1,2,2,2,1]; // Default to major scale
    }
  }

  // Alternate between patterns from different modes
  private static alternateModePatterns(modes: Mode[]): number[] {
    try {
      const pattern: number[] = [];
      const maxLength = Math.max(...modes.map(m => m.stepPattern.length));
      
      for (let i = 0; i < maxLength; i++) {
        const modeIndex = i % modes.length;
        const sourceMode = modes[modeIndex];
        const intervalIndex = i % sourceMode.stepPattern.length;
        pattern.push(sourceMode.stepPattern[intervalIndex]);
      }

      // Ensure proper octave completion
      const sum = pattern.reduce((a, b) => a + b, 0);
      if (sum !== 12 && pattern.length > 0) {
        const adjustment = 12 - sum;
        pattern[pattern.length - 1] += adjustment;
        pattern[pattern.length - 1] = Math.max(1, pattern[pattern.length - 1]);
      }

      return pattern.length > 0 ? pattern : [2,2,1,2,2,2,1];
    } catch (error) {
      console.error('Error alternating mode patterns:', error);
      return [2,2,1,2,2,2,1];
    }
  }

  // Create weighted blend of mode patterns
  private static weightedModeBlend(modes: Mode[], weights: number[]): number[] {
    try {
      const normalizedWeights = this.normalizeWeights(weights);
      const maxLength = Math.max(...modes.map(m => m.stepPattern.length));
      const blendedPattern: number[] = [];

      for (let i = 0; i < maxLength; i++) {
        let weightedSum = 0;
        let totalWeight = 0;
        
        modes.forEach((mode, modeIndex) => {
          if (i < mode.stepPattern.length) {
            const weight = normalizedWeights[modeIndex];
            weightedSum += mode.stepPattern[i] * weight;
            totalWeight += weight;
          }
        });
        
        if (totalWeight > 0) {
          const avgInterval = Math.round(weightedSum / totalWeight);
          blendedPattern.push(Math.max(1, Math.min(4, avgInterval)));
        }
      }

      // Adjust to sum to 12
      const currentSum = blendedPattern.reduce((a, b) => a + b, 0);
      if (currentSum !== 12 && blendedPattern.length > 0) {
        const difference = 12 - currentSum;
        blendedPattern[blendedPattern.length - 1] += difference;
        blendedPattern[blendedPattern.length - 1] = Math.max(1, blendedPattern[blendedPattern.length - 1]);
      }

      return blendedPattern.length > 0 ? blendedPattern : [2,2,1,2,2,2,1];
    } catch (error) {
      console.error('Error creating weighted mode blend:', error);
      return [2,2,1,2,2,2,1];
    }
  }

  // Create chromatic fusion pattern
  private static chromaticFusionPattern(modes: Mode[]): number[] {
    try {
      // Combine all unique pitch classes from all modes
      const allPitchClasses = new Set<number>();
      
      modes.forEach(mode => {
        const scale = this.buildScaleDegrees(mode);
        scale.forEach(pc => allPitchClasses.add(pc % 12));
      });

      const sortedPitches = Array.from(allPitchClasses).sort((a, b) => a - b);
      
      // Build intervals between consecutive pitch classes
      const intervals: number[] = [];
      for (let i = 0; i < sortedPitches.length - 1; i++) {
        const interval = sortedPitches[i + 1] - sortedPitches[i];
        intervals.push(interval);
      }
      
      // Add final interval to complete octave
      if (sortedPitches.length > 0) {
        const finalInterval = 12 - (sortedPitches[sortedPitches.length - 1] - sortedPitches[0]);
        if (finalInterval > 0) {
          intervals.push(finalInterval);
        }
      }

      return intervals.length > 0 ? intervals : [2,2,1,2,2,2,1];
    } catch (error) {
      console.error('Error creating chromatic fusion pattern:', error);
      return [2,2,1,2,2,2,1];
    }
  }

  // Normalize weights to sum to 1
  private static normalizeWeights(weights: number[]): number[] {
    try {
      const sum = weights.reduce((a, b) => a + b, 0);
      if (sum === 0) {
        return weights.map(() => 1 / weights.length);
      }
      return weights.map(w => w / sum);
    } catch (error) {
      console.error('Error normalizing weights:', error);
      return weights.map(() => 1 / weights.length);
    }
  }

  // Generate mode variants with user control
  static generateModeVariants(
    baseMode: Mode, 
    final: PitchClass,
    alterations: {
      raiseSecond?: boolean;
      lowerSecond?: boolean;
      raiseThird?: boolean;
      lowerThird?: boolean;
      raiseFourth?: boolean;
      lowerFourth?: boolean;
      raiseFifth?: boolean;
      lowerFifth?: boolean;
      raiseSixth?: boolean;
      lowerSixth?: boolean;
      raiseSeventh?: boolean;
      lowerSeventh?: boolean;
    } = {}
  ): Mode {
    try {
      const pattern = [...baseMode.stepPattern];
      let alterationCount = 0;
      
      // Apply alterations to specific degrees
      Object.entries(alterations).forEach(([alteration, shouldApply]) => {
        if (shouldApply) {
          alterationCount++;
          switch (alteration) {
            case 'raiseSecond':
              if (pattern[0] > 1) { pattern[0]--; pattern[1]++; }
              break;
            case 'lowerSecond':
              if (pattern[1] > 1) { pattern[1]--; pattern[0]++; }
              break;
            case 'raiseThird':
              if (pattern[1] > 1) { pattern[1]--; pattern[2]++; }
              break;
            case 'lowerThird':
              if (pattern[2] > 1) { pattern[2]--; pattern[1]++; }
              break;
            case 'raiseFourth':
              if (pattern[2] > 1) { pattern[2]--; pattern[3]++; }
              break;
            case 'lowerFourth':
              if (pattern[3] > 1) { pattern[3]--; pattern[2]++; }
              break;
            case 'raiseFifth':
              if (pattern[3] > 1) { pattern[3]--; pattern[4]++; }
              break;
            case 'lowerFifth':
              if (pattern[4] > 1) { pattern[4]--; pattern[3]++; }
              break;
            case 'raiseSixth':
              if (pattern[4] > 1) { pattern[4]--; pattern[5]++; }
              break;
            case 'lowerSixth':
              if (pattern[5] > 1) { pattern[5]--; pattern[4]++; }
              break;
            case 'raiseSeventh':
              if (pattern[5] > 1) { pattern[5]--; pattern[6]++; }
              break;
            case 'lowerSeventh':
              if (pattern[6] > 1) { pattern[6]--; pattern[5]++; }
              break;
          }
        }
      });

      const alterationSuffix = alterationCount > 0 ? ` (${alterationCount} alterations)` : '';
      
      return {
        index: 998, // Special index for user-altered modes
        stepPattern: pattern,
        final,
        octaveSpan: 12,
        name: `${baseMode.name}${alterationSuffix}`
      };
    } catch (error) {
      console.error('Error generating mode variants:', error);
      return { ...baseMode, final }; // Return base mode on error
    }
  }

  // Get mode recommendations based on harmonic relationship
  static getRelatedModes(
    sourceMode: Mode, 
    allModes: Mode[], 
    relationshipType: 'parallel' | 'relative' | 'similar_intervals' | 'contrasting' = 'similar_intervals'
  ): Mode[] {
    try {
      if (!sourceMode || !allModes || allModes.length === 0) {
        return [];
      }

      switch (relationshipType) {
        case 'parallel':
          // Same pattern, different final
          return allModes.filter(mode => 
            mode.index !== sourceMode.index &&
            this.patternsEqual(mode.stepPattern, sourceMode.stepPattern)
          ).slice(0, 5);

        case 'relative':
          // Shares many of the same pitch classes
          return allModes.filter(mode => {
            if (mode.index === sourceMode.index) return false;
            const similarity = this.calculatePatternSimilarity(mode.stepPattern, sourceMode.stepPattern);
            return similarity > 0.6;
          }).slice(0, 5);

        case 'similar_intervals':
          // Similar interval patterns
          return allModes
            .filter(mode => mode.index !== sourceMode.index)
            .map(mode => ({
              mode,
              similarity: this.calculatePatternSimilarity(mode.stepPattern, sourceMode.stepPattern)
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5)
            .map(item => item.mode);

        case 'contrasting':
          // Very different interval patterns
          return allModes
            .filter(mode => mode.index !== sourceMode.index)
            .map(mode => ({
              mode,
              similarity: this.calculatePatternSimilarity(mode.stepPattern, sourceMode.stepPattern)
            }))
            .sort((a, b) => a.similarity - b.similarity)
            .slice(0, 5)
            .map(item => item.mode);

        default:
          return [];
      }
    } catch (error) {
      console.error('Error getting related modes:', error);
      return [];
    }
  }

  // Helper function to check if two patterns are equal
  private static patternsEqual(pattern1: number[], pattern2: number[]): boolean {
    if (pattern1.length !== pattern2.length) return false;
    return pattern1.every((val, index) => val === pattern2[index]);
  }

  // Calculate similarity between two patterns (0 = no similarity, 1 = identical)
  private static calculatePatternSimilarity(pattern1: number[], pattern2: number[]): number {
    try {
      const maxLength = Math.max(pattern1.length, pattern2.length);
      let matches = 0;
      
      for (let i = 0; i < maxLength; i++) {
        const val1 = i < pattern1.length ? pattern1[i] : 0;
        const val2 = i < pattern2.length ? pattern2[i] : 0;
        
        if (val1 === val2) {
          matches++;
        } else {
          // Partial credit for similar intervals
          const difference = Math.abs(val1 - val2);
          if (difference === 1) {
            matches += 0.5;
          }
        }
      }
      
      return matches / maxLength;
    } catch (error) {
      console.error('Error calculating pattern similarity:', error);
      return 0;
    }
  }
}