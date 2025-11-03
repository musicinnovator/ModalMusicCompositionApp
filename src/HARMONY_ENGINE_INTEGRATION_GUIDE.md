# HARMONY ENGINE SUITE - Integration Guide

## 📋 Files Created

### Core Engine
- ✅ `/lib/harmony-engine.ts` - Complete harmonic analysis and chord generation engine

### UI Components  
- ✅ `/components/HarmonyControls.tsx` - User interface for harmony configuration
- ✅ `/components/HarmonyVisualizer.tsx` - Visualization of harmonized results
- ✅ `/components/HarmonyComposer.tsx` - Standalone harmony card (ready to use!)

### Documentation
- ✅ `/HARMONY_ENGINE_IMPLEMENTATION_COMPLETE.md` - Complete technical documentation
- ✅ `/HARMONY_ENGINE_INTEGRATION_GUIDE.md` - This file

## 🎯 Quick Start - Add to App.tsx

### Step 1: Import the Component

Add to the import section of `/App.tsx` (around line 50):

```typescript
import { HarmonyComposer } from './components/HarmonyComposer';
```

### Step 2: Add to UI

Insert the Harmony Composer card in the left column, after the MidiFileImporter and before the Counterpoint Engine Suite card (around line 1924):

```typescript
{/* NEW: Harmony Engine Suite */}
<StaggerItem>
  <ErrorBoundary>
    <HarmonyComposer />
  </ErrorBoundary>
</StaggerItem>
```

That's it! The Harmony Engine is now fully integrated.

## 🔧 Advanced Integration

### Integrate with Existing Components

#### 1. Theme Composer Integration

Add harmony button to `/components/ThemeComposer.tsx`:

```typescript
// Import
import { HarmonyEngine, HarmonyParams } from '../lib/harmony-engine';

// Add state
const [showHarmony, setShowHarmony] = useState(false);
const [harmonized, setHarmonized] = useState<HarmonizedPart | null>(null);

// Add function
const handleHarmonize = () => {
  const params: HarmonyParams = {
    keyCenter: 'automatic',
    voicingStyle: 'block',
    density: 4,
    complexity: 'seventh',
    lowestNote: 36,
    highestNote: 84
  };
  
  const result = HarmonyEngine.harmonize(
    enhancedTheme?.melody || theme,
    enhancedTheme?.rhythm || new Array(theme.length).fill(1),
    params
  );
  
  setHarmonized(result);
  setShowHarmony(true);
};

// Add button in UI
<Button onClick={handleHarmonize} size="sm">
  <Music2 className="w-4 h-4" />
  Harmonize
</Button>

// Add visualizer
{showHarmony && harmonized && (
  <HarmonyVisualizer
    harmonizedPart={harmonized}
    index={0}
    onClear={() => setShowHarmony(false)}
    selectedInstrument={selectedInstrument}
    onInstrumentChange={onInstrumentChange}
  />
)}
```

#### 2. Canon Generator Integration

Add harmony option to `/components/CanonVisualizer.tsx`:

```typescript
// Import
import { HarmonyEngine, HarmonyParams } from '../lib/harmony-engine';
import { HarmonyVisualizer } from './HarmonyVisualizer';

// Add state
const [harmonizedCanon, setHarmonizedCanon] = useState<HarmonizedPart | null>(null);

// Add harmonize function
const handleHarmonizeCanon = () => {
  const parts = CanonEngine.canonVoicesToParts(canon.voices);
  
  // Harmonize first voice (leader)
  const params: HarmonyParams = {
    keyCenter: 'automatic',
    voicingStyle: 'arpeggiated',
    density: 4,
    complexity: 'seventh',
    lowestNote: 36,
    highestNote: 84
  };
  
  const harmonized = HarmonyEngine.harmonize(
    parts[0].melody,
    parts[0].rhythm,
    params
  );
  
  setHarmonizedCanon(harmonized);
};

// Add button in UI
<Button onClick={handleHarmonizeCanon} size="sm" variant="outline">
  Add Harmony
</Button>

// Add visualizer (conditional)
{harmonizedCanon && (
  <HarmonyVisualizer
    harmonizedPart={harmonizedCanon}
    index={0}
    onClear={() => setHarmonizedCanon(null)}
    selectedInstrument={selectedInstrument}
    onInstrumentChange={setSelectedInstrument}
  />
)}
```

#### 3. Fugue Generator Integration

Add harmony to `/components/FugueVisualizer.tsx`:

```typescript
// Similar pattern as canon integration
const handleHarmonizeFugue = () => {
  const parts = FugueBuilderEngine.fugueToParts(fugue);
  
  // Harmonize first part
  const params: HarmonyParams = {
    keyCenter: 'automatic',
    voicingStyle: 'waltz',
    density: 5,
    complexity: 'thirteenth',
    lowestNote: 36,
    highestNote: 84
  };
  
  const harmonized = HarmonyEngine.harmonize(
    parts[0].melody,
    parts[0].rhythm,
    params
  );
  
  // Store and display
};
```

#### 4. Counterpoint Integration

Add to `/components/CounterpointComposer.tsx` and `/components/AdvancedCounterpointComposer.tsx`:

```typescript
const handleHarmonizeCounterpoint = (counterpoint: Part) => {
  const params: HarmonyParams = {
    keyCenter: 'modal',  // Use selected mode
    mode: selectedMode,
    voicingStyle: 'sustained',
    density: 3,
    complexity: 'seventh',
    lowestNote: 36,
    highestNote: 84
  };
  
  const harmonized = HarmonyEngine.harmonize(
    counterpoint.melody,
    counterpoint.rhythm,
    params
  );
  
  return harmonized;
};
```

#### 5. Complete Song Suite Integration

Add harmony tracks to `/components/EnhancedSongComposer.tsx`:

```typescript
// Add harmony track type
const handleAddHarmonyTrack = (sourceTrack: SongTrack) => {
  const params: HarmonyParams = {
    keyCenter: 'automatic',
    voicingStyle: 'arpeggiated',
    density: 4,
    complexity: 'ninth',
    lowestNote: 36,
    highestNote: 84
  };
  
  // Get source melody and rhythm
  const sourceMelody = sourceTrack.parts[0].melody;
  const sourceRhythm = sourceTrack.parts[0].rhythm;
  
  // Harmonize
  const harmonized = HarmonyEngine.harmonize(
    sourceMelody,
    sourceRhythm,
    params
  );
  
  // Convert to playback parts
  const harmonyParts = HarmonyEngine.harmonizedPartToParts(harmonized);
  
  // Create new track
  const harmonyTrack: SongTrack = {
    id: generateId(),
    name: `Harmony: ${sourceTrack.name}`,
    parts: harmonyParts,
    instrument: 'strings',
    volume: 75,
    startTime: sourceTrack.startTime,
    endTime: sourceTrack.endTime,
    muted: false
  };
  
  // Add to song
  setSong(prev => ({
    ...prev,
    tracks: [...prev.tracks, harmonyTrack]
  }));
};
```

## 🎹 Usage Examples

### Example 1: Simple Major Harmony
```typescript
const params: HarmonyParams = {
  keyCenter: 'major',
  voicingStyle: 'block',
  density: 3,
  complexity: 'basic',
  lowestNote: 48,
  highestNote: 72
};

const harmonized = HarmonyEngine.harmonize(melody, rhythm, params);
```

### Example 2: Jazz-Style Harmony
```typescript
const params: HarmonyParams = {
  keyCenter: 'automatic',
  keyCenterBias: 0.5,  // Prefer sharp keys
  voicingStyle: 'arpeggiated',
  density: 5,
  complexity: 'altered',
  lowestNote: 36,
  highestNote: 84,
  preferClosedVoicing: false,
  allowInversions: true,
  doublingPreference: 'balanced'
};

const harmonized = HarmonyEngine.harmonize(melody, rhythm, params);
```

### Example 3: Custom Progression
```typescript
const params: HarmonyParams = {
  keyCenter: 'major',
  voicingStyle: 'waltz',
  density: 4,
  complexity: 'seventh',
  customProgression: ['M7', 'dom7', 'm7', 'M7'],  // I - V7 - ii7 - I
  lowestNote: 36,
  highestNote: 84
};

const harmonized = HarmonyEngine.harmonize(melody, rhythm, params);
```

### Example 4: Modal Harmony
```typescript
const params: HarmonyParams = {
  keyCenter: 'modal',
  mode: selectedMode,  // Use Dorian, Phrygian, etc.
  voicingStyle: 'sustained',
  density: 4,
  complexity: 'ninth',
  lowestNote: 36,
  highestNote: 84
};

const harmonized = HarmonyEngine.harmonize(melody, rhythm, params);
```

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Import HarmonyComposer in App.tsx
- [ ] Add HarmonyComposer card to UI
- [ ] Click "Harmonize" button
- [ ] Verify harmony is generated
- [ ] Check chord progression display
- [ ] Test playback
- [ ] Test clear functionality

### Parameters Testing
- [ ] Test all voicing styles (10 total)
- [ ] Test all density levels (3-7 notes)
- [ ] Test all complexity levels (basic to altered)
- [ ] Test key center options (auto, major, minor, modal)
- [ ] Test key center bias slider
- [ ] Test explicit chord quality override
- [ ] Test custom progression
- [ ] Test orchestral range limits

### Integration Testing
- [ ] Harmonize a theme from Theme Composer
- [ ] Harmonize Bach Variables
- [ ] Harmonize counterpoint (Species I-V)
- [ ] Harmonize advanced counterpoint
- [ ] Harmonize canon (test multiple types)
- [ ] Harmonize fugue
- [ ] Add harmony track to Song Suite
- [ ] Export harmonized MIDI
- [ ] Export harmonized MusicXML

### Edge Cases
- [ ] Test with empty melody
- [ ] Test with all rests (-1 values)
- [ ] Test with very short melody (2-3 notes)
- [ ] Test with very long melody (50+ notes)
- [ ] Test with melody outside orchestral range
- [ ] Test with mismatched melody/rhythm lengths
- [ ] Test rapid parameter changes
- [ ] Test multiple harmonizations

## 📊 Performance Notes

### Memory Usage
- Each harmonized part stores:
  - Original melody (N notes)
  - Harmony notes (N arrays of 3-7 notes each)
  - Synchronized rhythm
  - Chord labels
  - Analysis data

### Optimization Tips
1. Limit melody length to <100 notes for best performance
2. Use lower density (3-4 notes) for complex melodies
3. Clear old harmonizations when not needed
4. Test on production deployment for best results

## 🎨 UI Customization

### Theme Colors
The Harmony components use purple/pink gradient theme by default:
- `from-purple-50 to-pink-50` (light mode)
- `from-purple-950/20 to-pink-950/20` (dark mode)

To customize, edit the className in:
- `HarmonyControls.tsx` (line 47)
- `HarmonyVisualizer.tsx` (line 30)  
- `HarmonyComposer.tsx` (line 135)

### Icons
Uses lucide-react icons:
- `Music2` - Main harmony icon
- `Sparkles` - Harmonize action
- `Settings2` - Advanced settings
- `Wand2` - Generate button

## 🚀 Deployment Notes

### Production Checklist
- [ ] All files are in correct locations
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Harmony generation works
- [ ] Playback works correctly
- [ ] Export works correctly
- [ ] MIDI integration works (if deployed with HTTPS)
- [ ] All documentation is updated

### Known Limitations
1. Harmony generation is CPU-bound (runs in main thread)
2. Very long melodies (>200 notes) may cause brief UI lag
3. Some voicing styles (tremolo, stride) not yet fully implemented in rhythm
4. Custom progressions require even distribution across melody

### Future Enhancements
- [ ] Web Worker for harmony generation
- [ ] Real-time harmony preview
- [ ] Harmony editing interface
- [ ] Voice leading optimization
- [ ] Style-specific chord libraries
- [ ] AI-assisted chord selection
- [ ] Multi-track harmony (full orchestration)
- [ ] Advanced rhythm patterns for voicing styles

## 📞 Support

If you encounter any issues:
1. Check console for error messages
2. Verify melody/rhythm synchronization
3. Test with simple example first
4. Review this guide's testing checklist
5. Check that all files are in correct locations

## ✅ Verification

**Phase 1 Complete**: ✅
- Core engine implemented
- UI components created
- Standalone card ready
- Documentation complete

**Phase 2 Ready**: Integration with existing components
- Follow integration examples above
- Test each integration individually
- Update documentation as needed

## 🎉 Summary

The Harmony Engine Suite is **ready for immediate use**! 

**Quick Start**:
1. Import `HarmonyComposer` in App.tsx
2. Add `<HarmonyComposer />` to the UI
3. Click "Harmonize" and enjoy!

**For Advanced Use**:
- Follow integration examples for specific components
- Customize parameters for your needs
- Extend with additional voicing styles

All implementations follow strict guidelines:
- ✅ Additive-only (no existing code modified)
- ✅ Backward compatible
- ✅ Error handling with -1 rests
- ✅ Data integrity maintained
- ✅ Full pipeline support

**Ready to harmonize everything!** 🎼✨
