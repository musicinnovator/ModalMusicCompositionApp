/**
 * Arpeggio Pattern Generator
 * Version: 1.002
 * 
 * Generates all permutations of arpeggio patterns for 3-6 note groups
 * Patterns use L (Lowest), M (Middle), H (Highest) note positions
 * 
 * Harris Software Solutions LLC
 */

import { MidiNote, Theme } from '../types/musical';

export interface ArpeggioPattern {
  name: string;
  pattern: string; // e.g., "LMH", "MLHL", etc.
  noteCount: 3 | 4 | 5 | 6;
  description: string;
}

/**
 * Generate all permutations of an array
 */
function permute<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const remainingPerms = permute(remaining);
    
    for (const perm of remainingPerms) {
      result.push([current, ...perm]);
    }
  }
  
  return result;
}

/**
 * Generate all possible arpeggio patterns for a given note count
 */
function generatePatternsForNoteCount(noteCount: 3 | 4 | 5 | 6): ArpeggioPattern[] {
  const patterns: ArpeggioPattern[] = [];
  
  if (noteCount === 3) {
    // For 3 notes: use L, M, H (all permutations)
    const baseNotes = ['L', 'M', 'H'];
    const perms = permute(baseNotes);
    
    perms.forEach(perm => {
      const patternStr = perm.join('');
      patterns.push({
        name: patternStr,
        pattern: patternStr,
        noteCount: 3,
        description: getPatternDescription(patternStr)
      });
    });
  } else if (noteCount === 4) {
    // For 4 notes: use combinations of L, M, H with one repeated
    // Common patterns: LMHL, MLHM, HLMH, etc.
    const basePatterns = [
      ['L', 'M', 'H', 'L'],
      ['L', 'M', 'H', 'M'],
      ['L', 'M', 'H', 'H'],
      ['M', 'L', 'H', 'L'],
      ['M', 'L', 'H', 'M'],
      ['M', 'L', 'H', 'H'],
      ['H', 'L', 'M', 'L'],
      ['H', 'L', 'M', 'M'],
      ['H', 'L', 'M', 'H'],
      ['H', 'M', 'L', 'L'],
      ['H', 'M', 'L', 'M'],
      ['H', 'M', 'L', 'H'],
      ['L', 'H', 'M', 'L'],
      ['L', 'H', 'M', 'M'],
      ['L', 'H', 'M', 'H'],
      ['M', 'H', 'L', 'L'],
      ['M', 'H', 'L', 'M'],
      ['M', 'H', 'L', 'H'],
    ];
    
    basePatterns.forEach(pattern => {
      const patternStr = pattern.join('');
      patterns.push({
        name: patternStr,
        pattern: patternStr,
        noteCount: 4,
        description: getPatternDescription(patternStr)
      });
    });
  } else if (noteCount === 5) {
    // For 5 notes: extended patterns with more repetitions
    const basePatterns = [
      ['L', 'M', 'H', 'M', 'L'],
      ['L', 'M', 'H', 'L', 'M'],
      ['M', 'L', 'H', 'L', 'M'],
      ['M', 'L', 'H', 'M', 'L'],
      ['H', 'M', 'L', 'M', 'H'],
      ['H', 'M', 'L', 'H', 'M'],
      ['L', 'H', 'M', 'H', 'L'],
      ['L', 'H', 'M', 'L', 'H'],
      ['M', 'H', 'L', 'H', 'M'],
      ['M', 'H', 'L', 'M', 'H'],
      ['L', 'M', 'L', 'H', 'M'],
      ['M', 'L', 'M', 'H', 'L'],
      ['H', 'L', 'H', 'M', 'L'],
      ['L', 'H', 'L', 'M', 'H'],
      ['M', 'H', 'M', 'L', 'H'],
      ['H', 'M', 'H', 'L', 'M'],
      ['L', 'M', 'H', 'H', 'L'],
      ['L', 'M', 'H', 'L', 'L'],
      ['M', 'L', 'H', 'H', 'M'],
      ['M', 'L', 'H', 'M', 'M'],
    ];
    
    basePatterns.forEach(pattern => {
      const patternStr = pattern.join('');
      patterns.push({
        name: patternStr,
        pattern: patternStr,
        noteCount: 5,
        description: getPatternDescription(patternStr)
      });
    });
  } else if (noteCount === 6) {
    // For 6 notes: complex patterns with varied repetitions
    const basePatterns = [
      ['L', 'M', 'H', 'L', 'M', 'H'],
      ['L', 'M', 'H', 'H', 'M', 'L'],
      ['M', 'L', 'H', 'M', 'L', 'H'],
      ['M', 'L', 'H', 'H', 'L', 'M'],
      ['H', 'M', 'L', 'H', 'M', 'L'],
      ['H', 'M', 'L', 'L', 'M', 'H'],
      ['L', 'H', 'M', 'L', 'H', 'M'],
      ['L', 'H', 'M', 'M', 'H', 'L'],
      ['M', 'H', 'L', 'M', 'H', 'L'],
      ['M', 'H', 'L', 'L', 'H', 'M'],
      ['H', 'L', 'M', 'H', 'L', 'M'],
      ['H', 'L', 'M', 'M', 'L', 'H'],
      ['L', 'M', 'L', 'H', 'M', 'L'],
      ['M', 'L', 'M', 'H', 'L', 'M'],
      ['H', 'M', 'H', 'L', 'M', 'H'],
      ['L', 'H', 'L', 'M', 'H', 'L'],
      ['M', 'H', 'M', 'L', 'H', 'M'],
      ['H', 'L', 'H', 'M', 'L', 'H'],
      ['L', 'M', 'H', 'M', 'H', 'L'],
      ['M', 'L', 'H', 'L', 'H', 'M'],
    ];
    
    basePatterns.forEach(pattern => {
      const patternStr = pattern.join('');
      patterns.push({
        name: patternStr,
        pattern: patternStr,
        noteCount: 6,
        description: getPatternDescription(patternStr)
      });
    });
  }
  
  return patterns;
}

/**
 * Get a human-readable description of the pattern
 */
function getPatternDescription(pattern: string): string {
  const descriptions: Record<string, string> = {
    // 3-note patterns
    'LMH': 'Ascending (Low → Mid → High)',
    'LHM': 'Low → High → Mid',
    'MLH': 'Mid → Low → High',
    'MHL': 'Mid → High → Low',
    'HLM': 'High → Low → Mid',
    'HML': 'Descending (High → Mid → Low)',
    
    // Common 4-note patterns
    'LMHL': 'Ascending then return to Low',
    'MLHM': 'Wave pattern from Mid',
    'HLMH': 'Wave pattern from High',
    'LHML': 'Low jump to High descent',
    'MHLM': 'Mid to High to Low to Mid',
    'HMHL': 'High to Mid to High to Low',
    
    // Common 5-note patterns
    'LMHML': 'Full ascending then descending',
    'MLHLM': 'Wave from Mid with return',
    'HMHLH': 'Complex wave from High',
    'LHLMH': 'Low-High oscillation',
    
    // Common 6-note patterns
    'LMHLMH': 'Double ascending wave',
    'LMHHML': 'Ascending with High plateau',
    'MLHMLH': 'Alternating wave pattern',
    'HMLHML': 'Descending with Low returns',
  };
  
  return descriptions[pattern] || `Pattern: ${pattern}`;
}

/**
 * Get all available arpeggio patterns
 */
export function getAllArpeggioPatterns(): ArpeggioPattern[] {
  const all: ArpeggioPattern[] = [];
  
  // Generate patterns for each note count
  all.push(...generatePatternsForNoteCount(3));
  all.push(...generatePatternsForNoteCount(4));
  all.push(...generatePatternsForNoteCount(5));
  all.push(...generatePatternsForNoteCount(6));
  
  return all;
}

/**
 * Get patterns grouped by note count
 */
export function getPatternsByNoteCount(): Record<number, ArpeggioPattern[]> {
  return {
    3: generatePatternsForNoteCount(3),
    4: generatePatternsForNoteCount(4),
    5: generatePatternsForNoteCount(5),
    6: generatePatternsForNoteCount(6),
  };
}

/**
 * Apply an arpeggio pattern to a theme
 * Extracts L (lowest), M (middle), H (highest) notes from theme
 * and generates a new theme based on the pattern
 */
export function applyArpeggioPattern(
  sourceTheme: Theme,
  pattern: ArpeggioPattern,
  repetitions: number = 1
): Theme {
  if (!sourceTheme || sourceTheme.length === 0) {
    return [];
  }
  
  // Extract lowest, middle, and highest notes from source theme
  const sortedNotes = [...sourceTheme].sort((a, b) => a - b);
  const lowestNote = sortedNotes[0];
  const highestNote = sortedNotes[sortedNotes.length - 1];
  const middleNote = sortedNotes[Math.floor(sortedNotes.length / 2)];
  
  // Create mapping
  const noteMap: Record<string, MidiNote> = {
    'L': lowestNote,
    'M': middleNote,
    'H': highestNote,
  };
  
  // Generate arpeggio based on pattern
  const arpeggio: Theme = [];
  
  for (let rep = 0; rep < repetitions; rep++) {
    for (const char of pattern.pattern) {
      arpeggio.push(noteMap[char]);
    }
  }
  
  return arpeggio;
}

/**
 * Apply an arpeggio pattern using specific notes from the theme
 * This version uses the actual note distribution from the theme
 */
export function applyArpeggioPatternAdvanced(
  sourceTheme: Theme,
  pattern: ArpeggioPattern,
  repetitions: number = 1
): Theme {
  if (!sourceTheme || sourceTheme.length === 0) {
    return [];
  }
  
  // Get unique notes sorted by pitch
  const uniqueNotes = [...new Set(sourceTheme)].sort((a, b) => a - b);
  
  if (uniqueNotes.length < 3) {
    // If less than 3 unique notes, duplicate to have L, M, H
    while (uniqueNotes.length < 3) {
      uniqueNotes.push(uniqueNotes[uniqueNotes.length - 1]);
    }
  }
  
  const lowestNote = uniqueNotes[0];
  const highestNote = uniqueNotes[uniqueNotes.length - 1];
  const middleNote = uniqueNotes[Math.floor(uniqueNotes.length / 2)];
  
  // Create mapping
  const noteMap: Record<string, MidiNote> = {
    'L': lowestNote,
    'M': middleNote,
    'H': highestNote,
  };
  
  // Generate arpeggio based on pattern
  const arpeggio: Theme = [];
  
  for (let rep = 0; rep < repetitions; rep++) {
    for (const char of pattern.pattern) {
      arpeggio.push(noteMap[char]);
    }
  }
  
  return arpeggio;
}

/**
 * Get recommended patterns for a given theme complexity
 */
export function getRecommendedPatterns(themeLength: number): ArpeggioPattern[] {
  const all = getAllArpeggioPatterns();
  
  // Recommend patterns based on theme length
  if (themeLength <= 4) {
    // Short themes: simple 3-note patterns
    return all.filter(p => p.noteCount === 3).slice(0, 6);
  } else if (themeLength <= 8) {
    // Medium themes: 3 and 4 note patterns
    return [
      ...all.filter(p => p.noteCount === 3).slice(0, 3),
      ...all.filter(p => p.noteCount === 4).slice(0, 6),
    ];
  } else if (themeLength <= 12) {
    // Longer themes: 4 and 5 note patterns
    return [
      ...all.filter(p => p.noteCount === 4).slice(0, 4),
      ...all.filter(p => p.noteCount === 5).slice(0, 6),
    ];
  } else {
    // Very long themes: 5 and 6 note patterns
    return [
      ...all.filter(p => p.noteCount === 5).slice(0, 5),
      ...all.filter(p => p.noteCount === 6).slice(0, 8),
    ];
  }
}

/**
 * Preview what notes will be used for L, M, H from a theme
 */
export function previewPatternNotes(sourceTheme: Theme): {
  lowest: MidiNote;
  middle: MidiNote;
  highest: MidiNote;
  lowestName: string;
  middleName: string;
  highestName: string;
} {
  if (!sourceTheme || sourceTheme.length === 0) {
    return {
      lowest: 60,
      middle: 64,
      highest: 67,
      lowestName: 'C4',
      middleName: 'E4',
      highestName: 'G4',
    };
  }
  
  const { midiNoteToNoteName } = require('../types/musical');
  
  const uniqueNotes = [...new Set(sourceTheme)].sort((a, b) => a - b);
  
  if (uniqueNotes.length < 3) {
    while (uniqueNotes.length < 3) {
      uniqueNotes.push(uniqueNotes[uniqueNotes.length - 1]);
    }
  }
  
  const lowest = uniqueNotes[0];
  const middle = uniqueNotes[Math.floor(uniqueNotes.length / 2)];
  const highest = uniqueNotes[uniqueNotes.length - 1];
  
  return {
    lowest,
    middle,
    highest,
    lowestName: midiNoteToNoteName(lowest),
    middleName: midiNoteToNoteName(middle),
    highestName: midiNoteToNoteName(highest),
  };
}
