# Accompaniment JSON Format Guide

## Complete Guide to Creating Custom Accompaniment Patterns

This guide explains how to create JSON files for the Famous Composer Accompaniment Library with support for **single notes**, **chords**, and **rests**.

---

## 📋 Quick Format Overview

```json
{
  "composer": "Bach",
  "title": "My Pattern Name",
  "period": "Baroque",
  "description": "Description of the pattern",
  "pattern": {
    "melody": [60, [60,64,67], -1, 72],
    "rhythm": ["quarter", "quarter", "quarter", "quarter"]
  },
  "metadata": {
    "difficulty": "intermediate",
    "harmonyType": "broken-chord",
    "voicingType": "left-hand",
    "commonIn": ["Custom Works"]
  }
}
```

---

## 🎵 Melody Array Format

The `melody` array can contain three types of elements:

### 1. Single Notes (Numbers)
```json
"melody": [60, 64, 67, 72]
```
- MIDI note numbers (0-127)
- Middle C = 60
- Each semitone up adds 1

### 2. Chords (Arrays of Numbers)
```json
"melody": [[60,64,67], [48,52,55]]
```
- Array of MIDI note numbers
- All notes play simultaneously
- Example: `[60,64,67]` = C major chord (C-E-G)

### 3. Rests (Value: -1)
```json
"melody": [60, -1, 64, -1]
```
- Use `-1` to represent silence
- Duration determined by corresponding rhythm value

### 4. Combined Example
```json
"melody": [
  60,           // Single note (C)
  [60,64,67],   // Chord (C-E-G)
  -1,           // Rest
  [48,52,55],   // Lower chord
  -1,           // Rest
  72            // High note
]
```

---

## 🎼 Rhythm Array Format

The `rhythm` array must have the **same length** as the `melody` array.

### Available Note Values
```json
"rhythm": [
  "whole",           // 4 beats
  "dotted-half",     // 3 beats
  "half",            // 2 beats
  "dotted-quarter",  // 1.5 beats
  "quarter",         // 1 beat
  "eighth",          // 0.5 beats
  "sixteenth"        // 0.25 beats
]
```

### Example: Waltz Pattern
```json
{
  "melody": [[36], [60,64,67], [60,64,67]],
  "rhythm": ["quarter", "eighth", "eighth"],
  "timeSignature": "3/4"
}
```
- Beat 1: Bass note (quarter note)
- Beat 2: Chord (eighth note)
- Beat 3: Chord (eighth note)

---

## 📊 MIDI Note Reference

### Common Note Values
| Note   | MIDI | Note   | MIDI | Note   | MIDI |
|--------|------|--------|------|--------|------|
| C2     | 36   | C3     | 48   | C4 (Middle C) | 60 |
| D2     | 38   | D3     | 50   | D4     | 62   |
| E2     | 40   | E3     | 52   | E4     | 64   |
| F2     | 41   | F3     | 53   | F4     | 65   |
| G2     | 43   | G3     | 55   | G4     | 67   |
| A2     | 45   | A3     | 57   | A4     | 69   |
| B2     | 47   | B3     | 59   | B4     | 71   |

### Octave Formula
- Each octave adds 12
- C2=36, C3=48, C4=60, C5=72, C6=84

### Sharps/Flats
- Add 1 for sharp (#)
- C# = 61, D# = 63, F# = 66, etc.

---

## ✅ Required Fields

```json
{
  "composer": "Bach | Beethoven | Mozart | Handel | Chopin | Schumann | Brahms | Liszt | Haydn | Debussy",
  "title": "String",
  "period": "Baroque | Classical | Romantic | Impressionist",
  "description": "String",
  "pattern": {
    "melody": "Array (notes/chords/rests)",
    "rhythm": "Array (note values)"
  },
  "metadata": {
    "difficulty": "beginner | intermediate | advanced | virtuoso",
    "harmonyType": "alberti-bass | waltz-bass | broken-chord | arpeggiated | stride | murky-bass | drum-bass | pedal-point | ostinato | chaconne | ground-bass",
    "voicingType": "left-hand | right-hand | both-hands | bass-line",
    "commonIn": ["Array", "of", "strings"]
  }
}
```

---

## 🔧 Optional Fields

```json
{
  "id": "custom-unique-id",
  "pattern": {
    "timeSignature": "4/4",
    "repeatCount": 2
  },
  "metadata": {
    "tempoRange": [60, 120],
    "keyContext": "Major",
    "era": "Baroque period"
  },
  "tags": ["custom", "arpeggiated"]
}
```

---

## 📝 Complete Examples

### Example 1: Simple Arpeggio (Single Notes Only)
```json
{
  "composer": "Bach",
  "title": "Simple C Major Arpeggio",
  "period": "Baroque",
  "description": "Basic arpeggiated pattern",
  "pattern": {
    "melody": [48, 60, 64, 67, 64, 60],
    "rhythm": ["eighth", "eighth", "eighth", "eighth", "eighth", "eighth"],
    "timeSignature": "3/4",
    "repeatCount": 2
  },
  "metadata": {
    "commonIn": ["Preludes"],
    "difficulty": "beginner",
    "harmonyType": "arpeggiated",
    "voicingType": "left-hand"
  }
}
```

### Example 2: Waltz with Chords
```json
{
  "composer": "Chopin",
  "title": "Waltz Bass with Chords",
  "period": "Romantic",
  "description": "Classic waltz: bass note + chord + chord",
  "pattern": {
    "melody": [
      36,           
      [55,60,64],   
      [55,60,64],   
      38,           
      [57,62,65],   
      [57,62,65]    
    ],
    "rhythm": ["quarter", "eighth", "eighth", "quarter", "eighth", "eighth"],
    "timeSignature": "3/4"
  },
  "metadata": {
    "commonIn": ["Waltzes", "Mazurkas"],
    "difficulty": "intermediate",
    "harmonyType": "waltz-bass",
    "voicingType": "left-hand"
  }
}
```

### Example 3: Pattern with Rests
```json
{
  "composer": "Beethoven",
  "title": "Dramatic Pattern with Rests",
  "period": "Classical",
  "description": "Strong accents with dramatic silences",
  "pattern": {
    "melody": [36, 36, -1, 43, -1, 36, -1, -1],
    "rhythm": ["eighth", "eighth", "eighth", "eighth", "eighth", "eighth", "eighth", "eighth"],
    "timeSignature": "4/4"
  },
  "metadata": {
    "commonIn": ["Sonatas"],
    "difficulty": "intermediate",
    "harmonyType": "drum-bass",
    "voicingType": "left-hand"
  }
}
```

### Example 4: Advanced - Chords, Notes, and Rests
```json
{
  "composer": "Mozart",
  "title": "Complex Alberti Bass",
  "period": "Classical",
  "description": "Alberti bass with chords, single notes, and rests",
  "pattern": {
    "melody": [
      [48,52,55],   // Opening chord
      -1,           // Rest
      52,           // Single note
      55,           // Single note
      [48,52,55],   // Chord
      -1,           // Rest
      [52,55,60],   // Higher chord
      55            // Single note
    ],
    "rhythm": [
      "eighth", 
      "sixteenth", 
      "sixteenth", 
      "sixteenth",
      "eighth", 
      "sixteenth", 
      "sixteenth", 
      "sixteenth"
    ],
    "timeSignature": "4/4"
  },
  "metadata": {
    "commonIn": ["Sonatas", "Concertos"],
    "difficulty": "advanced",
    "harmonyType": "alberti-bass",
    "voicingType": "left-hand",
    "tempoRange": [100, 160]
  },
  "tags": ["classical", "alberti", "advanced"]
}
```

---

## 🎹 Creating Common Patterns

### Alberti Bass Pattern
```json
"melody": [48, 55, 52, 55, 48, 55, 52, 55],
"rhythm": ["sixteenth", "sixteenth", "sixteenth", "sixteenth", "sixteenth", "sixteenth", "sixteenth", "sixteenth"]
```

### Waltz Pattern (oom-pah-pah)
```json
"melody": [36, [60,64,67], [60,64,67]],
"rhythm": ["quarter", "eighth", "eighth"]
```

### Stride Piano Pattern
```json
"melody": [[36,43], [52,55,60], [36,43], [52,55,60]],
"rhythm": ["quarter", "quarter", "quarter", "quarter"]
```

### Broken Chord Pattern
```json
"melody": [48, 52, 55, 60, 64, 60, 55, 52],
"rhythm": ["eighth", "eighth", "eighth", "eighth", "eighth", "eighth", "eighth", "eighth"]
```

---

## 📤 Uploading Multiple Patterns

You can upload multiple patterns in a single file:

```json
[
  {
    "composer": "Bach",
    "title": "Pattern 1",
    ...
  },
  {
    "composer": "Chopin",
    "title": "Pattern 2",
    ...
  },
  {
    "composer": "Mozart",
    "title": "Pattern 3",
    ...
  }
]
```

---

## ⚠️ Common Mistakes

### ❌ Wrong: Melody and rhythm different lengths
```json
{
  "melody": [60, 64, 67],
  "rhythm": ["quarter", "quarter"]  // Missing one rhythm value!
}
```

### ✅ Correct: Same length
```json
{
  "melody": [60, 64, 67],
  "rhythm": ["quarter", "quarter", "quarter"]
}
```

### ❌ Wrong: Invalid MIDI note
```json
{
  "melody": [200]  // MIDI notes must be 0-127!
}
```

### ✅ Correct: Valid MIDI range
```json
{
  "melody": [60]  // Valid: 0-127
}
```

### ❌ Wrong: Empty chord
```json
{
  "melody": [[]]  // Empty array not allowed!
}
```

### ✅ Correct: Chord with notes
```json
{
  "melody": [[60, 64, 67]]
}
```

---

## 🎯 Quick Start Steps

1. **Download Template** - Click "Download Template" in the app
2. **Edit Examples** - Modify the example patterns or add new ones
3. **Remove Instructions** - Delete the `_README` and `_INSTRUCTIONS` sections
4. **Validate** - Check that melody and rhythm arrays are same length
5. **Upload** - Click "Upload JSON" and select your file

---

## 🔍 Validation Errors

The system will automatically validate your JSON and show specific errors:

- **Missing required fields** - Lists which fields are missing
- **Invalid MIDI notes** - Shows which note is out of range
- **Array length mismatch** - Tells you the melody/rhythm length difference
- **Empty chords** - Identifies which index has an empty array
- **Wrong file type** - Detects if you uploaded a session/MIDI/theme file instead

---

## 💡 Pro Tips

1. **Start Simple** - Begin with single notes, then add chords and rests
2. **Use Template** - The downloaded template has working examples
3. **Test Patterns** - Upload and preview before creating complex patterns
4. **MIDI Reference** - Keep the MIDI note table handy
5. **Copy Existing** - Export library patterns as reference (coming soon)

---

## 🎼 Musical Context

### Harmony Types Explained

- **alberti-bass**: Low-high-middle-high pattern (Mozart style)
- **waltz-bass**: Bass note followed by chords (1-2-3 pattern)
- **broken-chord**: Arpeggiated chord notes in sequence
- **arpeggiated**: Similar to broken-chord, sweeping motion
- **stride**: Alternating bass notes and chords (jazz piano)
- **drum-bass**: Repetitive rhythmic bass (Beethoven style)
- **pedal-point**: Sustained or repeated bass note
- **ostinato**: Short repeating pattern
- **ground-bass**: Repeating bass line for variations

### When to Use Chords vs Single Notes

- **Single Notes**: Arpeggios, walking bass, melodic lines
- **Chords**: Waltz accompaniment, stride piano, block chords
- **Mixed**: Alberti bass variations, complex accompaniments
- **Rests**: Dramatic pauses, syncopation, articulation

---

**Harris Software Solutions LLC**  
*Modal Imitation and Fugue Construction Engine*
