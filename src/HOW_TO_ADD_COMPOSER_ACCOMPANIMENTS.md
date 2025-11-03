# How to Add Famous Composer Accompaniments

## Complete Guide to Adding New Accompaniment Patterns to the Library

This guide explains how to **permanently add** Famous Composer Accompaniments to the built-in library so they appear in the app automatically.

---

## 📁 Where to Add Accompaniments

**File Location:** `/lib/composer-accompaniment-library.ts`

**Target Array:** `private static library: ComposerAccompaniment[]` (starts at line 110)

---

## 🎵 Step-by-Step: Adding a New Accompaniment

### Step 1: Open the File
Open `/lib/composer-accompaniment-library.ts` in your code editor.

### Step 2: Locate the Library Array
Find the `private static library: ComposerAccompaniment[] = [` array around line 110.

### Step 3: Add Your Entry
Add your new accompaniment object **before the closing `];`** bracket (around line 432).

### Step 4: Follow the Structure
Use this exact structure:

```typescript
{
  id: 'unique-id-here',
  composer: 'ComposerName',
  title: 'Pattern Title',
  period: 'MusicalPeriod',
  description: 'Description of the pattern',
  pattern: {
    melody: [48, 60, 64, 67, 64, 60, 64, 67], // MIDI notes
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
```

**Important:** Don't forget the comma after the closing `}` bracket!

---

## 🎹 Field Reference

### Required Fields

#### `id` (string)
- **Format:** `'composer-description-number'`
- **Examples:** 
  - `'bach-prelude-1'`
  - `'debussy-broken-chord-1'`
  - `'vivaldi-ostinato-1'`
- **Must be unique** - No duplicates allowed

#### `composer` (ComposerName)
**Available Options:**
- `'Bach'`
- `'Beethoven'`
- `'Mozart'`
- `'Handel'`
- `'Chopin'`
- `'Schumann'`
- `'Brahms'`
- `'Liszt'`
- `'Haydn'`
- `'Debussy'`

**Want to add a new composer?** Add it to the `ComposerName` type at line 12-22.

#### `title` (string)
- Descriptive name for the pattern
- Examples: `'Classic Alberti Bass'`, `'Waltz Left Hand'`, `'Virtuoso Arpeggio Pattern'`

#### `period` (MusicalPeriod)
**Available Options:**
- `'Baroque'` - Bach, Handel, Vivaldi (1600-1750)
- `'Classical'` - Mozart, Haydn, Beethoven (1750-1820)
- `'Romantic'` - Chopin, Schumann, Brahms, Liszt (1820-1900)
- `'Impressionist'` - Debussy, Ravel (1890-1920)

#### `description` (string)
- Detailed explanation of the pattern's character and usage
- Example: `'Flowing broken chord pattern inspired by Well-Tempered Clavier preludes'`

#### `pattern` (object)
Contains the musical data:

**`melody`** (array):
- Can contain:
  - **Single notes:** `48, 60, 72` (MIDI note numbers 0-127)
  - **Chords:** `[60,64,67]` (arrays of MIDI notes)
  - **Rests:** `-1` (silence)
- Example: `[48, [60,64,67], -1, 72]` = single note, chord, rest, single note

**`rhythm`** (array):
- Must be **same length** as melody array
- Available values:
  - `'double-whole'` (8 beats)
  - `'whole'` (4 beats)
  - `'dotted-half'` (3 beats)
  - `'half'` (2 beats)
  - `'dotted-quarter'` (1.5 beats)
  - `'quarter'` (1 beat)
  - `'eighth'` (0.5 beats)
  - `'sixteenth'` (0.25 beats)

**`timeSignature`** (optional string):
- Examples: `'4/4'`, `'3/4'`, `'6/8'`, `'2/4'`
- Default: `'4/4'`

**`repeatCount`** (optional number):
- How many times the pattern repeats
- Default: `1`

#### `metadata` (object)

**`commonIn`** (string array):
- Musical contexts where this pattern appears
- Examples: `['Sonatas', 'Waltzes', 'Nocturnes']`, `['Symphonies', 'Concertos']`

**`difficulty`** (DifficultyLevel):
- `'beginner'` - Easy to play
- `'intermediate'` - Moderate skill required
- `'advanced'` - Requires significant technique
- `'virtuoso'` - Extremely difficult

**`harmonyType`** (HarmonyType):
- `'alberti-bass'` - Low-high-middle-high pattern (Mozart)
- `'waltz-bass'` - Bass note + chords (oom-pah-pah)
- `'broken-chord'` - Arpeggiated chord notes
- `'arpeggiated'` - Sweeping arpeggio motion
- `'stride'` - Alternating bass/chords (jazz piano)
- `'murky-bass'` - Octave alternation
- `'drum-bass'` - Repetitive rhythmic bass
- `'pedal-point'` - Sustained/repeated bass note
- `'ostinato'` - Short repeating pattern
- `'chaconne'` - Harmonic variation pattern
- `'ground-bass'` - Repeating bass line for variations

**`voicingType`** (VoicingType):
- `'left-hand'` - Left hand accompaniment
- `'right-hand'` - Right hand accompaniment
- `'both-hands'` - Two-hand pattern
- `'bass-line'` - Bass line only

**`tempoRange`** (optional [number, number]):
- Suggested BPM range: `[60, 120]`
- Format: `[minimum, maximum]`

**`keyContext`** (optional string):
- `'Major'`, `'Minor'`, or `'Modal'`

**`era`** (optional string):
- Specific context: `'Well-Tempered Clavier style'`, `'Heroic period'`, `'Romantic salon music'`

#### `tags` (optional string array)
- Searchable keywords
- Examples: `['baroque', 'flowing', 'arpeggiated']`, `['dramatic', 'tense', 'rapid']`

---

## 📊 MIDI Note Reference

### Quick Reference Table
| Note | MIDI | Note | MIDI | Note | MIDI |
|------|------|------|------|------|------|
| C2   | 36   | C3   | 48   | **C4 (Middle C)** | **60** |
| D2   | 38   | D3   | 50   | D4   | 62   |
| E2   | 40   | E3   | 52   | E4   | 64   |
| F2   | 41   | F3   | 53   | F4   | 65   |
| G2   | 43   | G3   | 55   | G4   | 67   |
| A2   | 45   | A3   | 57   | A4   | 69   |
| B2   | 47   | B3   | 59   | B4   | 71   |
| C5   | 72   | C6   | 84   | C7   | 96   |

### Formulas
- **Octave up:** Add 12
- **Octave down:** Subtract 12
- **Sharp (#):** Add 1 (C# = 61, F# = 66)
- **Flat (♭):** Subtract 1 (B♭ = 70, E♭ = 63)

---

## 🎼 Complete Examples

### Example 1: Debussy Impressionist Pattern

Add this to the library array:

```typescript
// === DEBUSSY - Impressionist Color ===
{
  id: 'debussy-parallel-chords-1',
  composer: 'Debussy',
  title: 'Parallel Chord Motion',
  period: 'Impressionist',
  description: 'Floating parallel chord movement creating impressionist atmosphere',
  pattern: {
    melody: [
      [48,52,55,60], // C minor 7
      [50,54,57,62], // D minor 7
      [52,55,60,64], // E minor 7
      [50,54,57,62], // D minor 7
      [48,52,55,60]  // C minor 7
    ],
    rhythm: ['half', 'half', 'half', 'half', 'half'],
    timeSignature: '4/4',
    repeatCount: 2
  },
  metadata: {
    commonIn: ['Preludes', 'Images', 'Arabesques'],
    difficulty: 'advanced',
    harmonyType: 'broken-chord',
    voicingType: 'both-hands',
    tempoRange: [40, 70],
    keyContext: 'Modal',
    era: 'Impressionist period'
  },
  tags: ['impressionist', 'atmospheric', 'parallel-motion']
},
```

### Example 2: Vivaldi Baroque Ostinato

```typescript
{
  id: 'vivaldi-spring-ostinato-1',
  composer: 'Handel', // Or add Vivaldi to ComposerName type
  title: 'Spring Ritornello Ostinato',
  period: 'Baroque',
  description: 'Repeating baroque ostinato pattern from concerto style',
  pattern: {
    melody: [48, 52, 55, 52, 48, 52, 55, 52], // Repeating triadic pattern
    rhythm: ['eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth'],
    timeSignature: '4/4',
    repeatCount: 4
  },
  metadata: {
    commonIn: ['Concertos', 'Ritornellos', 'Orchestral Works'],
    difficulty: 'intermediate',
    harmonyType: 'ostinato',
    voicingType: 'bass-line',
    tempoRange: [120, 160],
    keyContext: 'Major',
    era: 'Baroque concerto grosso'
  },
  tags: ['baroque', 'energetic', 'ostinato', 'concerto']
},
```

### Example 3: Schumann Syncopated Pattern

```typescript
{
  id: 'schumann-syncopation-1',
  composer: 'Schumann',
  title: 'Romantic Syncopated Rhythm',
  period: 'Romantic',
  description: 'Playful syncopated accompaniment with rests creating rhythmic interest',
  pattern: {
    melody: [
      48, -1, [55,60,64], -1, 
      50, -1, [57,62,65], -1
    ],
    rhythm: [
      'eighth', 'eighth', 'eighth', 'eighth',
      'eighth', 'eighth', 'eighth', 'eighth'
    ],
    timeSignature: '4/4',
    repeatCount: 2
  },
  metadata: {
    commonIn: ['Character Pieces', 'Kinderszenen'],
    difficulty: 'intermediate',
    harmonyType: 'broken-chord',
    voicingType: 'left-hand',
    tempoRange: [100, 140],
    keyContext: 'Major',
    era: 'Romantic character pieces'
  },
  tags: ['romantic', 'syncopated', 'playful']
},
```

### Example 4: Liszt Tremolo Octaves

```typescript
{
  id: 'liszt-tremolo-octaves-1',
  composer: 'Liszt',
  title: 'Dramatic Tremolo Octaves',
  period: 'Romantic',
  description: 'Virtuoso tremolo octaves creating dramatic tension',
  pattern: {
    melody: [
      [36,48], [36,48], [36,48], [36,48],
      [38,50], [38,50], [38,50], [38,50]
    ],
    rhythm: [
      'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth',
      'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth'
    ],
    timeSignature: '4/4',
    repeatCount: 4
  },
  metadata: {
    commonIn: ['Hungarian Rhapsodies', 'Transcendental Etudes'],
    difficulty: 'virtuoso',
    harmonyType: 'drum-bass',
    voicingType: 'both-hands',
    tempoRange: [140, 200],
    keyContext: 'Minor',
    era: 'Virtuoso period'
  },
  tags: ['virtuoso', 'dramatic', 'tremolo', 'octaves']
},
```

---

## 🔧 Adding a New Composer

If you want to add a composer not in the current list (e.g., Vivaldi, Ravel, Schubert):

### Step 1: Add to ComposerName Type
At **line 12-22**, add your composer:

```typescript
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
  | 'Debussy'
  | 'Vivaldi'   // NEW!
  | 'Ravel'     // NEW!
  | 'Schubert'; // NEW!
```

### Step 2: Add Accompaniment Patterns
Now you can use the new composer names in your accompaniment entries.

---

## ✅ Complete Workflow Example

Let's add **3 Debussy patterns** to the library:

### Step 1: Open File
Open `/lib/composer-accompaniment-library.ts`

### Step 2: Find Insertion Point
Scroll to around line 430, just before the `];` that closes the library array.

### Step 3: Add Entries
Insert these three patterns:

```typescript
    // === DEBUSSY - Impressionist Master ===
    {
      id: 'debussy-broken-chord-1',
      composer: 'Debussy',
      title: 'Impressionist Broken Chords',
      period: 'Impressionist',
      description: 'Ethereal broken chord pattern with whole-tone flavor',
      pattern: {
        melody: [48, 54, 58, 62, 66, 62, 58, 54],
        rhythm: ['eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth'],
        timeSignature: '4/4',
        repeatCount: 2
      },
      metadata: {
        commonIn: ['Preludes', 'Images', 'Children\'s Corner'],
        difficulty: 'advanced',
        harmonyType: 'broken-chord',
        voicingType: 'both-hands',
        tempoRange: [50, 90],
        keyContext: 'Modal',
        era: 'Impressionist period'
      },
      tags: ['impressionist', 'atmospheric', 'whole-tone']
    },

    {
      id: 'debussy-parallel-motion-1',
      composer: 'Debussy',
      title: 'Parallel Chord Movement',
      period: 'Impressionist',
      description: 'Floating parallel chord progression',
      pattern: {
        melody: [
          [48,52,55], [50,54,57], [52,55,60], 
          [50,54,57], [48,52,55], [46,50,53]
        ],
        rhythm: ['half', 'half', 'half', 'half', 'half', 'half'],
        timeSignature: '3/4',
        repeatCount: 2
      },
      metadata: {
        commonIn: ['Preludes', 'Arabesques'],
        difficulty: 'advanced',
        harmonyType: 'broken-chord',
        voicingType: 'both-hands',
        tempoRange: [40, 70],
        keyContext: 'Modal',
        era: 'Impressionist harmonic exploration'
      },
      tags: ['impressionist', 'parallel', 'harmonic']
    },

    {
      id: 'debussy-ostinato-1',
      composer: 'Debussy',
      title: 'Hypnotic Ostinato Pattern',
      period: 'Impressionist',
      description: 'Repeating ostinato creating dreamlike atmosphere',
      pattern: {
        melody: [48, 55, 60, 64, 60, 55],
        rhythm: ['eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth'],
        timeSignature: '6/8',
        repeatCount: 4
      },
      metadata: {
        commonIn: ['Preludes', 'Images'],
        difficulty: 'intermediate',
        harmonyType: 'ostinato',
        voicingType: 'left-hand',
        tempoRange: [60, 100],
        keyContext: 'Modal',
        era: 'Impressionist texture'
      },
      tags: ['impressionist', 'ostinato', 'hypnotic']
    }
  ]; // <-- Don't forget this closing bracket stays here!
```

### Step 4: Save File
Save `/lib/composer-accompaniment-library.ts`

### Step 5: Test
1. Refresh the app
2. Open the Composer Accompaniment Library
3. Search for "Debussy" or filter by Impressionist period
4. Your new patterns should appear!

---

## 🎯 Quick Checklist

Before adding an accompaniment, verify:

- [ ] **Unique ID** - No duplicate IDs in the library
- [ ] **Valid Composer** - Composer exists in `ComposerName` type
- [ ] **Valid Period** - One of: Baroque, Classical, Romantic, Impressionist
- [ ] **Melody/Rhythm Same Length** - Arrays must match exactly
- [ ] **Valid MIDI Notes** - All notes between 0-127
- [ ] **Valid Rhythm Values** - Use only approved note values
- [ ] **No Empty Chords** - Chord arrays `[]` must contain at least one note
- [ ] **Comma After Entry** - Don't forget the comma after `}`
- [ ] **Closing Bracket Intact** - Don't accidentally delete the `];` at the end

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Missing Comma
```typescript
{
  id: 'pattern-1',
  ...
}  // Missing comma!
{
  id: 'pattern-2',
  ...
}
```

### ✅ Correct:
```typescript
{
  id: 'pattern-1',
  ...
},  // Comma here!
{
  id: 'pattern-2',
  ...
}
```

### ❌ Mistake 2: Duplicate ID
```typescript
{ id: 'bach-waltz-1', ... },
{ id: 'bach-waltz-1', ... },  // Error: Duplicate!
```

### ✅ Correct:
```typescript
{ id: 'bach-waltz-1', ... },
{ id: 'bach-waltz-2', ... },  // Unique ID
```

### ❌ Mistake 3: Length Mismatch
```typescript
melody: [60, 64, 67],
rhythm: ['quarter', 'quarter']  // Only 2 values!
```

### ✅ Correct:
```typescript
melody: [60, 64, 67],
rhythm: ['quarter', 'quarter', 'quarter']  // Same length!
```

---

## 📖 Pattern Ideas by Composer

### Bach
- Invention two-part counterpoint
- Fugue subject patterns
- Prelude flowing arpeggios
- Chorale harmonizations

### Beethoven
- Dramatic repeated bass
- Heroic octave patterns
- Symphony rhythmic motifs
- Sonata development textures

### Mozart
- Alberti bass variations
- Graceful accompaniments
- Symphony accompaniment figures
- Concerto textures

### Chopin
- Nocturne arpeggiated bass
- Waltz left-hand patterns
- Etude accompaniment textures
- Mazurka rhythmic patterns

### Debussy
- Whole-tone arpeggios
- Parallel chord progressions
- Pentatonic patterns
- Impressionist textures

### Liszt
- Virtuoso arpeggio sweeps
- Tremolo passages
- Octave patterns
- Hungarian rhapsody textures

---

## 🚀 Next Steps

1. **Start Simple** - Add 1-2 patterns first to test
2. **Build Collection** - Gradually add more famous patterns
3. **Test Thoroughly** - Preview patterns in the app
4. **Share** - Document your additions for the team

---

## 💡 Pro Tips

1. **Listen First** - Find recordings of the composer's works to understand their style
2. **Keep it Authentic** - Study actual scores when possible
3. **Start Basic** - Begin with simpler patterns, then add complexity
4. **Use Variations** - Create multiple versions of the same pattern type
5. **Tag Thoughtfully** - Good tags make patterns easier to find
6. **Document Era** - Include specific work references in `era` field

---

## 📚 Resources

- **MIDI Note Reference:** See table above
- **Rhythm Values:** See field reference section
- **JSON Format Guide:** `/ACCOMPANIMENT_JSON_FORMAT_GUIDE.md`
- **Existing Patterns:** Study existing library entries as examples
- **Harmony Types:** Detailed explanations in field reference

---

**Harris Software Solutions LLC**  
*Modal Imitation and Fugue Construction Engine*

**Version:** 1.0  
**Last Updated:** November 2025

---

## Summary

To add Famous Composer Accompaniments:

1. Open `/lib/composer-accompaniment-library.ts`
2. Find the `library` array (line 110)
3. Add your pattern object before the closing `];` (line 432)
4. Follow the structure exactly as shown in examples
5. Save and test!

Your patterns will immediately appear in the Composer Accompaniment Library component and can be used throughout the app with all transformation capabilities (transpose, retrograde, inversion, augmentation, diminution, mode-shift).
