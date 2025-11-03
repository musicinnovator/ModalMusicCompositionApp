# Complete Species Counterpoint Implementation Guide

## ✅ COMPLETED CHANGES

### 1. Fixed `/lib/counterpoint-engine.ts`
- ✅ Corrected Third Species from 4:1 to **3:1** ratio (3 notes per CF note)
- ✅ Added `getThirdDuration()` helper method for proper 1/3 duration calculation
- ✅ Updated `getQuarterDuration()` with better documentation  
- ✅ Fixed Fourth Species to generate **4 notes per CF note** (true 4:1 ratio)
- ✅ Added alternative `generateFourthSpeciesSyncopated()` for traditional suspensions

### Corrected Species Logic:
```typescript
// 1:1 Species: 1 CP note per CF note (same duration)
CF:  whole  whole  whole  whole
CP:  whole  whole  whole  whole

// 2:1 Species: 2 CP notes per CF note (half duration each)
CF:  whole      whole      whole      whole
CP:  half half  half half  half half  half half

// 3:1 Species: 3 CP notes per CF note (1/3 duration each)  
CF:  whole          whole          whole
CP:  d.qtr d.qtr d.qtr  d.qtr d.qtr d.qtr  d.qtr d.qtr d.qtr

// 4:1 Species: 4 CP notes per CF note (1/4 duration each)
CF:  whole              whole
CP:  qtr qtr qtr qtr    qtr qtr qtr qtr

// 5:1 Species (Florid): Mixed species
CF:  whole          whole              whole
CP:  whole          half half          qtr qtr qtr qtr
```

## 🔧 REMAINING CHANGES NEEDED

### 2. Update Component UI to Enable Rhythm

#### A. `/components/CounterpointComposer.tsx`
Add a species selector dropdown:
```typescript
// Add state
const [selectedSpecies, setSelectedSpecies] = useState<'1:1' | '2:1' | '3:1' | '4:1' | '5:1'>('2:1');
const [cfDuration, setCfDuration] = useState<NoteValue>('whole');

// Add UI controls before technique selector
<div className="space-y-2">
  <Label>Cantus Firmus Duration</Label>
  <Select value={cfDuration} onValueChange={(value) => setCfDuration(value as NoteValue)}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="whole">Whole Note (4 beats)</SelectItem>
      <SelectItem value="half">Half Note (2 beats)</SelectItem>
      <SelectItem value="quarter">Quarter Note (1 beat)</SelectItem>
    </SelectContent>
  </Select>
</div>

<div className="space-y-2">
  <Label>Species Ratio</Label>
  <Select value={selectedSpecies} onValueChange={(value) => setSelectedSpecies(value as any)}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="1:1">1:1 (Note against note)</SelectItem>
      <SelectItem value="2:1">2:1 (Two notes against one)</SelectItem>
      <SelectItem value="3:1">3:1 (Three notes against one)</SelectItem>
      <SelectItem value="4:1">4:1 (Four notes against one)</SelectItem>
      <SelectItem value="5:1">5:1 (Florid - mixed species)</SelectItem>
    </SelectContent>
  </Select>
</div>

// Update parameters when generating counterpoint
const parameters: CounterpointParameters = {
  // ... existing parameters ...
  useRhythm: true, // ENABLE RHYTHM
  cantusFirmusDuration: cfDuration,
  targetSpeciesRatio: selectedSpecies,
  allowSyncopation: false,
  enableRhythmicVariety: true
};
```

#### B. `/components/AdvancedCounterpointComposer.tsx`
Same changes as CounterpointComposer.tsx - add species and duration selectors.

### 3. Update Audio Playback to Respect Rhythm

#### A. Create Rhythm-Aware Audio Player Helper
Add to `/lib/counterpoint-engine.ts` or create new file:
```typescript
/**
 * Convert CounterpointVoice to Part with proper rhythm
 */
export function counterpointVoiceToPart(voice: CounterpointVoice): Part {
  const melody: Melody = voice.melody.map(note => note.midi);
  const rhythm: Rhythm = voice.melody.map(note => note.beats);
  
  return { melody, rhythm };
}
```

#### B. Update `/components/AudioPlayer.tsx`
Modify the playPart function to use rhythm data:
```typescript
// In schedulePart function or equivalent
parts.forEach((part, partIndex) => {
  if (partMuted[partIndex]) return;
  
  let currentTime = 0;
  part.melody.forEach((note, noteIndex) => {
    if (isNote(note)) {
      const duration = part.rhythm[noteIndex] || 1; // Use rhythm if available
      const noteDuration = duration * (60 / tempo); // Convert beats to seconds
      
      // Schedule note with proper duration
      instruments[partIndex].play(
        midiNoteToNoteName(note),
        audioContext.currentTime + startTime + currentTime,
        { duration: noteDuration }
      );
      
      currentTime += duration * (60 / tempo);
    }
  });
});
```

### 4. Update App.tsx to Handle Rhythmic Counterpoints

Modify `handleCounterpointGenerated` callback:
```typescript
const handleCounterpointGenerated = useCallback((
  counterpoint: Theme | RhythmicNote[], 
  technique: string,
  voice?: CounterpointVoice
) => {
  try {
    // Handle rhythmic counterpoint voice
    if (voice && voice.melody) {
      const rhythmicCounterpoint: CounterpointComposition = {
        melody: voice.melody.map(n => n.midi),
        rhythm: voice.melody.map(n => n.beats),
        instrument: 'violin',
        muted: false,
        timestamp: Date.now(),
        technique: `${technique} (${voice.species} species - ${voice.ratioToCantusFirmus})`
      };
      
      setGeneratedCounterpoints(prev => [rhythmicCounterpoint, ...prev.slice(0, 2)]);
      toast.success(`Generated ${voice.species} species counterpoint (${voice.ratioToCantusFirmus})`);
      return;
    }
    
    // Fallback to non-rhythmic
    const limitedCounterpoint = Array.isArray(counterpoint) 
      ? counterpoint.slice(0, 24) 
      : counterpoint;
    
    // ... existing code ...
  } catch (err) {
    console.error('Error handling counterpoint generation:', err);
    toast.error('Failed to process generated counterpoint');
  }
}, []);
```

### 5. Update CounterpointComposition Interface

In `/App.tsx`, add rhythm field:
```typescript
interface CounterpointComposition {
  melody: Theme;
  rhythm?: Rhythm; // ADD THIS - optional rhythm data
  instrument: InstrumentType;
  muted: boolean;
  timestamp: number;
  technique?: string;
}
```

### 6. Testing Checklist

Test each species with different CF durations:
```
✅ 1:1 Species:
  - CF: Whole → CP: Whole (1 note)
  - CF: Half → CP: Half (1 note)
  - CF: Quarter → CP: Quarter (1 note)

✅ 2:1 Species:
  - CF: Whole → CP: 2× Half (2 notes)
  - CF: Half → CP: 2× Quarter (2 notes)
  - CF: Quarter → CP: 2× Eighth (2 notes)

✅ 3:1 Species:
  - CF: Whole → CP: 3× Dotted-Quarter (3 notes)
  - CF: Half → CP: 3× Eighth (3 notes)
  - CF: Dotted-Half → CP: 3× Quarter (3 notes)

✅ 4:1 Species:
  - CF: Whole → CP: 4× Quarter (4 notes)
  - CF: Half → CP: 4× Eighth (4 notes)
  - CF: Quarter → CP: 4× Sixteenth (4 notes)

✅ 5:1 Florid:
  - Mixed patterns of all species
  - Verify rhythmic variety
```

## 📊 Visual Verification

Add debug logging to verify rhythm:
```typescript
console.log('Species:', voice.species);
console.log('Ratio:', voice.ratioToCantusFirmus);
console.log('CF notes:', cantusFirmus.length);
console.log('CP notes:', voice.melody.length);
console.log('Expected CP notes:', cantusFirmus.length * parseInt(voice.ratioToCantusFirmus));
console.log('CP durations:', voice.melody.map(n => `${n.duration} (${n.beats}b)`));
```

## 🎵 Expected Behavior

When user selects:
- **2:1 species with CF = whole note**
  - Should generate 2 half notes for each CF whole note
  - Audio should play 2 distinct notes per CF note
  - Visual timeline should show shorter note blocks

- **3:1 species with CF = whole note**
  - Should generate 3 dotted-quarter notes for each CF whole note  
  - Audio should play 3 distinct notes per CF note
  - Each CP note should be ~1.33 beats long

- **4:1 species with CF = whole note**
  - Should generate 4 quarter notes for each CF whole note
  - Audio should play 4 distinct notes per CF note
  - Each CP note should be 1 beat long

## 🔍 Error Handling

Add validation:
```typescript
// Verify species ratio is correct
const expectedCPNotes = cantusFirmus.length * parseInt(speciesRatio.split(':')[0]);
if (voice.melody.length !== expectedCPNotes) {
  console.warn(`Species ratio mismatch! Expected ${expectedCPNotes} CP notes, got ${voice.melody.length}`);
}

// Verify duration totals match
const cfTotalBeats = cantusFirmus.reduce((sum, n) => sum + n.beats, 0);
const cpTotalBeats = voice.melody.reduce((sum, n) => sum + n.beats, 0);
const tolerance = 0.1; // Allow small rounding differences
if (Math.abs(cfTotalBeats - cpTotalBeats) > tolerance) {
  console.warn(`Total duration mismatch! CF: ${cfTotalBeats} beats, CP: ${cpTotalBeats} beats`);
}
```

## 🚀 Deployment Notes

1. **Test with different modes** - Ensure species work with all modal systems
2. **Test with Bach Variables** - Verify CF from Bach variables works correctly
3. **Test audio export** - Ensure MIDI/MusicXML exports include rhythm data
4. **Test playback controls** - Verify pause/resume respects rhythm timing
5. **Performance test** - Ensure no lag with florid counterpoint (many notes)

## 📝 Documentation for Users

Add to UI:
```
Species Counterpoint Guide:
- 1:1 = One note in counterpoint per theme note (simple, consonant)
- 2:1 = Two notes in counterpoint per theme note (more melodic)  
- 3:1 = Three notes in counterpoint per theme note (flowing)
- 4:1 = Four notes in counterpoint per theme note (very active)
- 5:1 = Florid (mixed species, most complex)

Cantus Firmus Duration:
- Sets the rhythmic value of your theme notes
- Counterpoint notes will be subdivided accordingly
- Longer CF notes allow more subdivision
```