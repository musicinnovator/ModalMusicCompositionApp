# Canon Engine - Quick Start Guide

## What Was Fixed? 🎯

Two critical bugs that prevented canons from working properly:

### ✅ Bug #1: Follower Only Played One Note
- **Before**: Canon followers would play 1 note and stop
- **After**: Canon followers now play complete melodies with proper timing
- **Cause**: Melody/rhythm length mismatch has been fixed

### ✅ Bug #2: Canons Missing from Song Suite
- **Before**: Canons couldn't be added to complete songs
- **After**: Canon voices appear in Available Components and can be dragged to timeline
- **Cause**: Missing integration - now fully connected

## How to Use Canons Now 🎵

### Step 1: Create a Theme
1. Use the **Theme Composer** to create your melody (8-16 notes works well)
2. Or import a MIDI file
3. Or use Bach Variables

### Step 2: Generate a Canon
1. Find **Canon Controls** panel in the left column
2. Choose a canon type:
   - **Strict Canon**: Classic imitation at any interval
   - **Canon by Inversion**: Follower mirrors the melody
   - **Rhythmic Canon**: Follower plays faster/slower
   - **Crab Canon**: Follower plays melody backward
   - **Double Canon**: Two simultaneous canons
   - And more...
3. Set parameters:
   - **Interval**: How many semitones to transpose (e.g., +5 for fifth, +7 for fifth up)
   - **Delay**: How many beats before follower enters (e.g., 4 = one measure delay)
   - **Number of Voices**: 2-4 voices for complex canons
4. Click **"Generate Canon"**

### Step 3: Verify Playback
1. Scroll down to the **"Canons"** section
2. Each canon shows:
   - Canon type and metadata
   - Separate visualizers for each voice (Leader, Follower, etc.)
   - Audio player with all voices
3. Click **Play** to hear the canon
4. **Verify**: All voices should play complete melodies with correct entry delays

### Step 4: Add to Song (NEW! 🎉)
1. Scroll to **"Complete Song Creation"** at the bottom
2. Click the **"Compose"** tab
3. Look at the **"Available Components"** panel
4. You'll see your canon voices:
   ```
   Canon #1 - Leader
   Canon #1 - Follower 1
   Canon #2 - Leader (Forward)
   Canon #2 - Follower (Backward)
   ```
5. **Drag and drop** any voice onto the timeline
6. Position voices wherever you want in the song
7. Layer with other components (themes, fugues, counterpoints)

## Testing Your Canons ✅

### Quick Test: Does It Work?
1. Create an 8-note theme: C D E F G F E D
2. Generate **Strict Canon** with:
   - Interval: +7 (perfect fifth)
   - Delay: 4 beats
   - Voices: 2
3. Listen to playback
4. **Expected**: Leader plays all 8 notes, Follower plays all 8 notes (transposed) starting 4 beats later

### What to Look For:
- ✅ Leader plays complete melody
- ✅ Follower plays complete melody (not just 1 note!)
- ✅ Follower starts after the delay (4 beats of silence, then enters)
- ✅ Both voices play simultaneously after follower enters
- ✅ Voices appear in Song Creation Suite "Available Components"

## Console Debugging 🔍

### Check the Console:
Open browser console (F12) and look for:

```
🎵 Canon Engine: Generating STRICT_CANON
🎼 Building available components...
  Canons count: 1
  ✅ Added Canon #1 - Leader (8 notes, 8 sounding notes)
  ✅ Added Canon #1 - Follower 1 (12 notes, 8 sounding notes)
```

### What the Numbers Mean:
- **Total notes** includes rest padding (e.g., 12 = 4 rest notes + 8 sounding notes)
- **Sounding notes** is the actual melody length (e.g., 8 notes)
- Rest notes are shown as `0` in the melody array

### If You See Warnings:
```
⚠️ Canon voice "Follower 1" has mismatched lengths: melody=8, rhythm=12
```
**Don't worry!** The system auto-corrects this. If you see this, it means the auto-correction kicked in.

## Common Canon Types Explained 🎼

### 1. Strict Canon (Classic)
- Follower imitates leader exactly, just transposed
- Best for: Traditional contrapuntal compositions
- Example: "Frère Jacques" / "Row, Row, Row Your Boat"

### 2. Canon by Inversion
- Follower mirrors melody upside-down
- Best for: Complex, sophisticated textures
- Example: Bach's "Musical Offering"

### 3. Rhythmic Canon (Augmentation/Diminution)
- Follower plays same notes but stretched/compressed in time
- Best for: Creating depth and layering
- Example: Mensurations canons in Renaissance music

### 4. Crab Canon (Retrograde)
- Follower plays melody backward
- Best for: Palindromic compositions
- Example: Bach's "Musical Offering" (Canon cancrizans)

### 5. Double Canon
- Two independent canons running simultaneously (4 voices total)
- Best for: Complex polyphonic works
- Example: Mozart's table canons

## Troubleshooting 🔧

### Problem: Follower still only plays 1 note
**Solution**: 
1. Clear your browser cache (Ctrl+Shift+Delete)
2. Refresh the page
3. Generate a new canon
4. If it persists, check console for errors

### Problem: Canon doesn't appear in Song Suite
**Solution**:
1. Make sure you've generated at least one canon
2. Scroll to "Complete Song Creation" section
3. Click "Compose" tab
4. Look in "Available Components" panel
5. Check console: should show "Canons count: X" where X > 0

### Problem: Entry delay doesn't work
**Solution**:
1. Check the delay parameter (should be > 0 for follower delay)
2. Listen for silence at the start of follower playback
3. Console should show follower melody starting with 0s: `[0, 0, 0, 0, ...]`

### Problem: Notes sound wrong
**Solution**:
1. Check if correct mode/key signature is selected
2. For Strict Canon, verify interval is musically valid (0, ±5, ±7, ±12 work well)
3. For Inversion Canon, check the inversion axis (default is first note of theme)

## Advanced Tips 🚀

### Layering Canons in Songs:
1. Generate multiple canons with different delays
2. Add all voices to song timeline
3. Offset them in time for cascading effect
4. Use different instruments for each voice

### Creating Round (Infinite Canon):
1. Use Strict Canon with delay = theme length
2. Set interval to unison (0 semitones) or octave (12 semitones)
3. Loop in song composer for infinite round effect

### Experimental Techniques:
1. **Double Retrograde**: Generate Crab Canon, then use that as theme for another Crab Canon
2. **Inverted Augmentation**: Combine Inversion + Rhythmic canon (2x slower)
3. **Chain Canons**: Use canon output as input for fugue generation

## Quick Command Reference ⚡

```
Create Theme → Generate Canon → Verify Playback → Add to Song → Export
```

### Keyboard Shortcuts (In Song Composer):
- **Ctrl+Click**: Multi-select components before dragging
- **Drag**: Add component to timeline
- **Click track**: Select for editing
- **Ctrl+D**: Duplicate selected track

---

**Status**: ✅ Ready to use
**Last Updated**: 2025-01-09
**Support**: Check console for detailed logs
