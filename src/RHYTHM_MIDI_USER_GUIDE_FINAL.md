# How to Export Perfect Rhythms to MIDI - User Guide

## The Fix Is Complete! 🎉

Your MIDI exports will now contain **EXACTLY** the same note durations you set in the Rhythm Controls, including eighth notes, sixteenth notes, and all other durations.

## Quick Start (3 Steps)

### Step 1: Set Your Rhythm
1. Create or select a melody (Theme, Imitation, Fugue, Bach Variable)
2. Open the **Rhythm Controls** section below it
3. Set each note's duration:
   - Click note buttons (1, 2, 3...) to select notes
   - Choose duration: Whole, Half, Quarter, **Eighth**, **Sixteenth**, etc.
   - Use "Set All" buttons for uniform rhythms

### Step 2: Add to Song
1. Go to **Song Creation → Compose** tab
2. Drag your component from "Available Components" to the timeline
3. The rhythm is saved at this moment! ✅

### Step 3: Export MIDI
1. Click **"Export as Song"** button
2. Switch to **Export** tab
3. Click **"Download MIDI File"**
4. Open in your DAW and enjoy perfect rhythm! 🎵

## Example: Creating Fast Notes

Let's create a melody with eighth and sixteenth notes:

```
Theme: C, D, E, F, G, F, E, D
Rhythm: eighth, eighth, sixteenth, sixteenth, quarter, eighth, eighth, half

Result in MIDI:
C = 0.5 beats (fast!)
D = 0.5 beats (fast!)
E = 0.25 beats (very fast!)
F = 0.25 beats (very fast!)
G = 1 beat (normal)
F = 0.5 beats (fast!)
E = 0.5 beats (fast!)
D = 2 beats (long)
```

When you export this and open in GarageBand/Logic/Ableton:
- ✅ Eighth notes are half the length of quarter notes
- ✅ Sixteenth notes are quarter the length of quarter notes
- ✅ It sounds EXACTLY like the playback!

## What's New?

### Before This Fix
- ❌ Set eighth notes → Exported as quarter notes
- ❌ Set sixteenth notes → Exported as quarter notes
- ❌ Only whole, half, quarter notes worked correctly

### After This Fix
- ✅ Set eighth notes → Exported as eighth notes
- ✅ Set sixteenth notes → Exported as sixteenth notes
- ✅ **ALL note durations work perfectly!**

## Supported Note Durations

All of these now export with perfect accuracy:

| Duration | Beats | Example Use |
|----------|-------|-------------|
| Double-whole | 8 | Very long sustained notes |
| Whole | 4 | Cantus firmus, slow melodies |
| Dotted-half | 3 | 3/4 time downbeats |
| Half | 2 | Medium-length notes |
| Dotted-quarter | 1.5 | Swing feel, 6/8 time |
| Quarter | 1 | Standard beat |
| **Eighth** | **0.5** | **Fast notes ✅** |
| **Sixteenth** | **0.25** | **Very fast notes ✅** |

## Common Workflows

### Workflow 1: Simple Melody
```
1. Create 8-note theme: C, D, E, F, G, A, B, C
2. Set all to quarter notes (default)
3. Add to timeline
4. Export → Perfect MIDI with all quarter notes
```

### Workflow 2: Mixed Rhythms
```
1. Create theme with varied rhythm
2. Set first 4 notes: whole, half, quarter, eighth
3. Set last 4 notes: sixteenth, eighth, quarter, half
4. Add to timeline
5. Export → Perfect MIDI with all durations preserved
```

### Workflow 3: Fast Fugue
```
1. Create fugue subject with fast notes
2. Set rhythm: eighth, eighth, sixteenth, sixteenth, quarter, quarter, half
3. Generate 4-voice fugue
4. Set each voice to different rhythm using voice Rhythm Controls
5. Add all voices to timeline
6. Export → Perfect multi-voice MIDI with independent rhythms
```

### Workflow 4: Species Counterpoint
```
1. Create Cantus Firmus: 8 notes, all whole notes (4 beats each)
2. Create Florid Counterpoint: 32 notes, all eighth notes (0.5 beats each)
3. Add both to timeline at same start time
4. Export → Perfect species counterpoint rhythm ratio (8:1)
```

## Verifying in Your DAW

### Visual Check
1. Import MIDI file
2. Open Piano Roll / MIDI Editor
3. Look at note lengths:
   - Eighth notes should be **half** the width of quarters
   - Sixteenth notes should be **quarter** the width of quarters
   - Dotted notes should be 1.5× or 3× the base duration

### Audio Check
1. Play the MIDI in your DAW
2. Compare to playback in the app
3. Should sound **identical**! ✅

## Troubleshooting

### "My eighth notes still sound like quarter notes"

**Solution**: Make sure you:
1. Set the rhythm BEFORE adding to timeline
2. Check the console (F12) for: `✅ Using NoteValue[] array for PRECISE rhythm`
3. If you see `⚠️ Using Rhythm array fallback`, the noteValues weren't saved

**Fix**: Remove the track, set rhythm again, re-add to timeline

### "Only some tracks have correct rhythm"

**Solution**: Each track needs rhythm set independently
- Main Theme: Set rhythm in Main Theme section
- Imitation Parts: Set rhythm for each part
- Fugue Voices: Set rhythm for each voice
- Bach Variables: Set rhythm for each variable

### "How do I know if it's working?"

**Check the console** (F12) when exporting:

**Good ✅**:
```
🎵 Processing track "Main Theme" for MIDI export:
  ✅ Using NoteValue[] array for PRECISE rhythm (supports eighth/sixteenth notes)
  Note 1: 60 (C4) - eighth = 0.5 beats (216 ticks)
  Note 2: 62 (D4) - sixteenth = 0.25 beats (108 ticks)
```

**Needs Fix ⚠️**:
```
🎵 Processing track "Main Theme" for MIDI export:
  ⚠️ Using Rhythm array fallback (eighth/sixteenth notes may be approximated)
```

If you see the warning, remove the track and re-add it after setting rhythm.

## Advanced Tips

### Tip 1: Quick Uniform Rhythms
Use the "Set All" buttons:
- **Set All Quarters**: Makes all notes quarter notes
- **Set All Eighths**: Makes all notes eighth notes (fast!)
- **Set All Sixteenths**: Makes all notes sixteenth notes (very fast!)

### Tip 2: Pattern Rhythm
1. Set first 4 notes to desired pattern
2. Manually copy pattern to remaining notes
3. Example: eighth, eighth, quarter, quarter (repeat)

### Tip 3: Save Presets
Use the Session Memory Bank to save:
- Favorite rhythmic patterns
- Complete compositions with rhythm
- Load later to reuse

### Tip 4: Layer Different Rhythms
Create rich textures:
- Track 1: All whole notes (slow foundation)
- Track 2: All quarter notes (medium melody)
- Track 3: All eighth notes (fast embellishment)
- Track 4: All sixteenth notes (very fast flourishes)

## Examples of What You Can Create

### Example 1: Classical Fugue
```
Subject: 8 notes with rhythm: quarter, eighth, eighth, quarter, half, quarter, quarter, whole
Export: Perfect fugue subject with varied rhythm
```

### Example 2: Baroque Ornamentation
```
Main melody: Half notes
Ornamentation voice: Sixteenth notes running around the melody
Export: Beautiful baroque-style ornamentation
```

### Example 3: Modern Minimalism
```
Voice 1: Whole notes (very slow)
Voice 2: Quarter notes
Voice 3: Eighth notes
Voice 4: Sixteenth notes (Steve Reich style)
Export: Layered rhythmic minimalist texture
```

### Example 4: Species Counterpoint Study
```
Cantus Firmus: All whole notes (traditional)
1st Species: All whole notes (1:1)
2nd Species: All half notes (2:1)
3rd Species: All quarter notes (4:1)
4th Species: Mixed (with syncopation)
5th Species: All eighth/sixteenth notes (florid)
Export: Complete species counterpoint exercise
```

## Summary Checklist

Before exporting, make sure:
- ✅ Rhythm set in Rhythm Controls for each component
- ✅ Components added to timeline AFTER setting rhythm
- ✅ Check console for "✅ Using NoteValue[] array" message
- ✅ Test in DAW to verify rhythm accuracy

If all checkmarks are ✅, your MIDI export will be **PERFECT!** 🎵

---

**Remember**: The key is to set rhythm BEFORE adding to the timeline. The rhythm is captured at the moment you drag the component to the timeline!

**Enjoy creating music with perfect rhythm export!** 🎹✨
