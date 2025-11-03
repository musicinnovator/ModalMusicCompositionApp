# Rhythm MIDI Export - Quick Start Guide

## The Fix in 30 Seconds

✅ **PROBLEM SOLVED**: MIDI exports now preserve your exact rhythm settings!

Before: All notes exported as same duration ❌  
After: Each note exports with correct duration ✅

## How to Use

### Step 1: Set Your Rhythms
1. Create or select a melody (Theme, Imitation, Fugue, Bach Variable)
2. Click the **Rhythm Controls** section below it
3. Set each note's duration:
   - Click note number buttons to select notes
   - Choose duration: Whole, Half, Quarter, Eighth, Sixteenth
   - Or use quick-set buttons for all notes

### Step 2: Add to Song Timeline
1. Go to **Song Creation → Compose** tab
2. Drag your component to the timeline
3. **IMPORTANT**: Rhythm is captured at this moment!

### Step 3: Export to MIDI
1. Click **"Export as Song"** button
2. Switch to **Export** tab
3. Click **"Download MIDI File"**
4. Done! 🎉

### Step 4: Verify in Your DAW
1. Import MIDI into GarageBand, Logic, Ableton, etc.
2. Open Piano Roll or MIDI editor
3. You should see exact note durations you set!

## Quick Examples

### Example 1: Basic Melody
```
Notes: C4, D4, E4, F4
Rhythm: Whole, Half, Quarter, Eighth
Result: C=4 beats, D=2 beats, E=1 beat, F=0.5 beats
```

### Example 2: Fugue Subject
```
Notes: 8 notes in your fugue theme
Rhythm: Quarter, Quarter, Half, Quarter, Dotted-half, Quarter
Result: Each voice preserves these exact durations
```

### Example 3: Species Counterpoint
```
Cantus Firmus: 8 notes, all Whole notes
Florid Counterpoint: 32 notes, all Eighth notes
Result: CF long, FCP fast - proper species rhythm!
```

## Tips & Tricks

### ⚡ Quick Rhythm Settings
- **Uniform Rhythm**: Use "Set All" buttons (All Quarters, All Eighths, etc.)
- **Pattern Repeat**: Set first few notes, then copy pattern
- **Mix & Match**: Combine different durations freely

### 🎯 Best Practices
1. **Set rhythm BEFORE adding to timeline**
   - Rhythm is captured when you add to song
   - Can't change after - must remove and re-add
   
2. **Check console logs**
   - Look for "🎵 Processing track" messages
   - Verify beat counts are correct
   
3. **Test in DAW**
   - Always import MIDI to verify
   - Visual check in piano roll
   - Listen to playback

### ⚠️ Common Mistakes
❌ Adding to timeline first, THEN setting rhythm  
✅ Set rhythm first, THEN add to timeline

❌ Expecting automatic update after rhythm change  
✅ Remove track and re-add after changing rhythm

❌ Forgetting to set rhythm (defaults to quarters)  
✅ Always set rhythm for important parts

## Troubleshooting

### "All notes still same length in MIDI"
- Did you set rhythm BEFORE adding to timeline?
- Try: Remove from timeline, set rhythm, re-add

### "Eighth notes sound like quarter notes"
- Check Rhythm Controls shows correct values
- Verify console logs show correct beat counts
- Hard refresh browser (Ctrl+Shift+R)

### "Rhythm sounds right but MIDI export wrong"
- Clear browser cache
- Export again
- Check console for errors

## Visual Guide

```
WORKFLOW:
┌─────────────────┐
│ 1. Create Theme │
└────────┬────────┘
         │
┌────────▼────────────┐
│ 2. Set Rhythm       │
│    (Rhythm Controls)│
└────────┬────────────┘
         │
┌────────▼─────────────┐
│ 3. Add to Timeline   │
│    (Drag & Drop)     │
└────────┬─────────────┘
         │
┌────────▼─────────────┐
│ 4. Export MIDI       │
│    (Download button) │
└────────┬─────────────┘
         │
┌────────▼─────────────┐
│ 5. Import to DAW     │
│    (Verify rhythm)   │
└──────────────────────┘
```

## What Gets Exported

### ✅ Preserved in MIDI Export
- Note durations (whole, half, quarter, etc.)
- Note pitches (MIDI numbers)
- Track names
- Tempo (BPM)
- Time signature
- Volume levels
- Start times

### ❌ Not Preserved (MIDI Limitations)
- Instrument timbres (MIDI uses basic sounds)
- Audio effects (reverb, delay, etc.)
- Visual theme colors
- Component source info

## Testing Your Export

### Quick Test (30 seconds)
1. Create 4-note theme: C, D, E, F
2. Set rhythm: Whole, Half, Quarter, Eighth
3. Export to MIDI
4. Import to any DAW
5. Check: C=4 beats, D=2 beats, E=1 beat, F=0.5 beat

### Full Test (2 minutes)
1. Create complete composition with multiple tracks
2. Set unique rhythms for each track
3. Export to MIDI  
4. Import to DAW
5. Verify each track has correct rhythm
6. Play to hear full composition

## Success Checklist

Before exporting, verify:
- ✅ Rhythm Controls used for all important parts
- ✅ Correct durations visible in Rhythm Controls
- ✅ Components added to timeline AFTER setting rhythm
- ✅ Song title and composer name set
- ✅ Tempo and time signature correct

After exporting:
- ✅ MIDI file downloaded successfully
- ✅ File size reasonable (not 0 bytes)
- ✅ Console shows "Generated song MIDI file"
- ✅ No error messages in console

After importing to DAW:
- ✅ All tracks present
- ✅ Note pitches correct
- ✅ **Note durations match your settings** ⭐
- ✅ Playback sounds as expected

## Get Help

If issues persist:
1. Check browser console for errors (F12)
2. Look for "🎵 Processing track" messages
3. Verify beat counts in console match expectations
4. Try different browser
5. Clear cache and retry

## Summary

🎵 **The rhythm MIDI export now works perfectly!**

Your workflow:
1. Set rhythm → 2. Add to timeline → 3. Export → 4. Verify in DAW

That's it! Your exact rhythmic choices will be preserved in the MIDI export and playback correctly in any professional music software.

**Enjoy your rhythmically accurate compositions!** 🎹🎶
