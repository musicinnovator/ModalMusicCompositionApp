# Harmony Chord Export - Quick Test Guide

## Quick Test (2 Minutes)

### Step 1: Generate Harmony
1. Create a simple theme (8-12 notes)
2. Open **Harmony Engine Suite**
3. Select "Current Theme" as melody source
4. Set voicing style to **Block** (easiest to test)
5. Click **"Harmonize"**
6. ▶️ **Play** in the visualizer - listen to full chords

### Step 2: Add to Song
1. Open **Complete Song Creation Suite**
2. Find "Harmonized Melody #1" in available components
3. **Drag** it to the timeline
4. ▶️ **Play** the song
5. ✅ **Verify**: Should sound IDENTICAL to step 1

### Step 3: Export MIDI
1. Click **"Export to MIDI"** button
2. Save file as `harmony_test.mid`
3. Open in any MIDI player/DAW
4. ✅ **Verify**: Should sound IDENTICAL to steps 1 & 2
5. ✅ **Verify**: View piano roll - all chord notes visible

## Expected Results

### In Harmony Visualizer:
- See chord labels (C, Dm, G7, etc.)
- Hear multiple notes playing together
- Full, rich harmony sound

### In Song Suite:
- Timeline shows harmony component
- Playback sounds exactly like visualizer
- No change in audio quality

### In MIDI File:
- Open in DAW (GarageBand, Logic, FL Studio, etc.)
- Piano roll shows multiple notes stacked vertically
- All notes start and end at same time (chords)
- Duration matches original playback

## Console Verification

### Look for these messages:
```
🎼 HARMONY TRACK DETECTED - Exporting full chords
  12 chords to export
  Chord 1: 4 notes at beat 0.00, duration 1 beats
    Note 1/4: C4 (MIDI 60)
    Note 2/4: E4 (MIDI 64)
    Note 3/4: G4 (MIDI 67)
    Note 4/4: C5 (MIDI 72)
✅ Harmony track exported: 12 chords with full voicing
```

## Troubleshooting

### If only single notes play:
- Check console for "HARMONY TRACK DETECTED" message
- Verify harmonyNotes length matches number of chords
- Refresh browser and try again

### If MIDI export fails:
- Clear browser cache
- Check browser console for errors
- Verify song has at least one harmony track

### If timing is off:
- Check harmony rhythm values in console
- Verify tempo setting in Song Suite
- Check time signature is 4/4

## Advanced Testing

### Test Different Voicing Styles:
1. **Block**: All notes together (easiest to verify)
2. **Arpeggiated**: Notes in sequence (pattern preserved)
3. **Broken**: Partial arpeggiation (pattern preserved)
4. **Alberti Bass**: Classic pattern (pattern preserved)

### Test Different Complexities:
1. **Basic**: Simple triads (3 notes per chord)
2. **Seventh**: Add 7th notes (4 notes per chord)
3. **Ninth**: Extended chords (5+ notes per chord)

### Test Different Densities:
1. **Density 3**: Minimal voicing
2. **Density 5**: Richer voicing
3. **Density 7**: Maximum notes

## Success Indicators

✅ Harmony sounds the same in:
  - Harmony Engine visualizer
  - Song Suite playback
  - Exported MIDI file

✅ MIDI file shows:
  - Multiple notes stacked (chords)
  - Notes aligned vertically
  - Proper chord progression

✅ Console shows:
  - "HARMONY TRACK DETECTED"
  - Correct number of chords
  - All notes listed for each chord

## Quick Comparison

### Before Fix:
- 😞 Only bass note in MIDI
- 😞 Single line in piano roll
- 😞 Thin, incomplete sound

### After Fix:
- ✅ All chord notes in MIDI
- ✅ Stacked notes in piano roll
- ✅ Full, rich harmony sound

## Integration Test

### Complete Pipeline Test:
1. Generate Theme → Works ✅
2. Add Rhythm → Works ✅
3. Harmonize → Works ✅
4. Add to Song Suite → Works ✅
5. Export MIDI → **NOW WORKS** ✅

### No Regressions:
- Theme export → Still works ✅
- Counterpoint export → Still works ✅
- Canon export → Still works ✅
- Fugue export → Still works ✅

## Time Estimate
- Basic test: **2 minutes**
- Full test (all voicing styles): **10 minutes**
- Integration test: **5 minutes**

---

**Ready to test?** Start with Step 1 above! 🎵
