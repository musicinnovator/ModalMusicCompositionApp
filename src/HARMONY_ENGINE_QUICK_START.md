# 🎼 HARMONY ENGINE SUITE - Quick Start Guide

## ⚡ 60-Second Setup

### Step 1: Add to App.tsx
```typescript
// Line ~50: Add import
import { HarmonyComposer } from './components/HarmonyComposer';

// Line ~1924: Add component (after MidiFileImporter, before Counterpoint)
<StaggerItem>
  <ErrorBoundary>
    <HarmonyComposer />
  </ErrorBoundary>
</StaggerItem>
```

### Step 2: Use It!
1. Click "Harmonize" button
2. Configure settings (or use defaults)
3. Listen to harmony
4. Done! ✨

## 🎯 What It Does

**Harmonizes EVERYTHING**:
- ✅ Themes & Bach Variables
- ✅ All Counterpoint (Species 1-5, Advanced)
- ✅ All Canons (22 types)
- ✅ All Fugues (14 architectures)

**Features**:
- 🎹 30+ chord types (M, m, dom7, M13, 7#9, etc.)
- 🎸 10 voicing styles (block, arpeggio, waltz, etc.)
- 🎵 3-7 note density control
- 🎼 7 complexity levels (basic to altered)
- 🎻 Orchestral range enforcement
- 🔍 Automatic key detection
- ⚙️ Full manual control

## 📊 Key Parameters

```typescript
HarmonyParams {
  keyCenter: 'automatic' | 'major' | 'minor' | 'modal'
  voicingStyle: 'block' | 'arpeggiated' | 'waltz' | ...
  density: 3 | 4 | 5 | 6 | 7  // number of notes
  complexity: 'basic' | 'seventh' | ... | 'altered'
  lowestNote: 36  // C2 (cello)
  highestNote: 84 // C6 (violin)
}
```

## 🎨 Quick Presets

### Simple Harmony
```typescript
{
  complexity: 'basic',    // Triads only
  density: 3,             // 3-note chords
  voicingStyle: 'block'   // All notes together
}
```

### Jazz Harmony
```typescript
{
  complexity: 'altered',      // Complex alterations
  density: 4,                 // 7th chords
  voicingStyle: 'arpeggiated' // Rolled chords
}
```

### Orchestral Harmony
```typescript
{
  complexity: 'thirteenth',  // Full extensions
  density: 7,                // Rich 13th chords
  voicingStyle: 'sustained'  // Long notes
}
```

## 🔧 Manual Integration

### Harmonize Any Melody
```typescript
import { HarmonyEngine, HarmonyParams } from '../lib/harmony-engine';

const params: HarmonyParams = {
  keyCenter: 'automatic',
  voicingStyle: 'block',
  density: 4,
  complexity: 'seventh',
  lowestNote: 36,
  highestNote: 84
};

const harmonized = HarmonyEngine.harmonize(
  melody,  // MidiNote[]
  rhythm,  // Rhythm
  params
);

// Access results:
harmonized.analysis.detectedKey      // Key center
harmonized.analysis.keyQuality       // 'major' | 'minor'
harmonized.analysis.confidence       // 0-1
harmonized.chordLabels              // ['CM7', 'G7', 'Am7', ...]
harmonized.harmonyNotes             // Chord voicings
```

### Convert to Playback
```typescript
const parts = HarmonyEngine.harmonizedPartToParts(harmonized);

// Now play with AudioPlayer
<AudioPlayer
  parts={parts}
  title="Harmonized Melody"
  selectedInstrument="strings"
/>
```

## 📁 Files Created

```
/lib/harmony-engine.ts                    - Core engine
/components/HarmonyControls.tsx           - UI controls
/components/HarmonyVisualizer.tsx         - Visualization
/components/HarmonyComposer.tsx           - Standalone card
/HARMONY_ENGINE_IMPLEMENTATION_COMPLETE.md - Full docs
/HARMONY_ENGINE_INTEGRATION_GUIDE.md      - Integration guide
/HARMONY_ENGINE_QUICK_START.md            - This file
```

## ⚠️ Critical Notes

### REST HANDLING
```typescript
// ✅ CORRECT: Use -1 for rests
const melody = [60, 62, 64, -1, 65, 67];

// ❌ WRONG: Don't use 0 (that's MIDI C-1!)
const melody = [60, 62, 64, 0, 65, 67];  // BAD!
```

### RHYTHM SYNC
```typescript
// Always ensure lengths match
if (melody.length !== rhythm.length) {
  console.error('Length mismatch!');
}
```

## 🎵 Chord Quality Reference

### Basic (Triads)
- `M` - Major
- `m` - Minor
- `dim` - Diminished
- `aug` - Augmented

### 7th Chords
- `M7` - Major 7th
- `m7` - Minor 7th
- `dom7` - Dominant 7th
- `dim7` - Diminished 7th
- `hdim7` - Half-diminished 7th

### Extensions
- `M9`, `m9`, `dom9` - 9th chords
- `M11`, `m11`, `dom11` - 11th chords
- `M13`, `m13`, `dom13` - 13th chords

### Altered
- `7#9` - Hendrix chord
- `7b9` - Flat 9
- `7#5` - Sharp 5
- `7b5` - Flat 5
- `7#11` - Lydian dominant
- `alt` - Altered dominant

## 🎸 Voicing Styles

1. **Block** - All notes together (classical)
2. **Broken** - Notes in sequence (partial arpeggio)
3. **Arpeggiated** - Full arpeggio pattern
4. **Alberti** - Alberti bass (low-high-mid-high)
5. **Waltz** - Waltz pattern (bass-chord-chord)
6. **Rolling** - Rolling pattern
7. **Stride** - Stride piano style
8. **Tremolo** - Rapid alternation
9. **Sustained** - Long held notes
10. **Staccato** - Short detached notes

## 🧪 Quick Test

1. Open app
2. Create a simple theme (C-D-E-F-G)
3. Go to Harmony Engine Suite card
4. Click "Harmonize"
5. Should see: Key: C major, Confidence: high
6. Click Play to hear harmony

## ✅ Status

**Phase 1**: ✅ COMPLETE
- Core engine implemented
- UI components ready
- Standalone card functional
- Documentation complete

**Phase 2**: 📋 READY
- Integration examples provided
- All components compatible
- Testing checklist included

## 🚀 Ready to Use!

The Harmony Engine Suite is **production-ready** and **fully functional**!

Just add the import and component to App.tsx, and you're done! 🎉

---

**Questions?** See `/HARMONY_ENGINE_INTEGRATION_GUIDE.md` for detailed integration examples.

**Technical Details?** See `/HARMONY_ENGINE_IMPLEMENTATION_COMPLETE.md` for full documentation.
