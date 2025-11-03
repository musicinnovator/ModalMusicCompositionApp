# Canon Engine - Comprehensive Testing Checklist

## Pre-Testing Setup ✅

- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Refresh the page
- [ ] Open browser console (F12) for monitoring
- [ ] Ensure audio is enabled and volume is up

## Test Suite 1: Basic Canon Playback 🎵

### Test 1.1: Strict Canon - Basic
**Steps**:
1. Create 8-note theme: C4 D4 E4 F4 G4 F4 E4 D4 (MIDI: 60 62 64 65 67 65 64 62)
2. Generate Strict Canon:
   - Interval: +7 (perfect fifth)
   - Delay: 4 beats
   - Voices: 2
3. Scroll to Canons section
4. Click Play

**Expected Results**:
- [ ] Leader starts immediately with C4 D4 E4 F4 G4 F4 E4 D4
- [ ] Follower starts after 4 beats with G4 A4 B4 C5 D5 C5 B4 A4
- [ ] Both voices complete all 8 notes
- [ ] Voices overlap and play simultaneously after beat 4
- [ ] No notes cut off prematurely

**Console Check**:
```
✅ Added Canon #1 - Leader (8 notes, 8 sounding notes)
✅ Added Canon #1 - Follower 1 (12 notes, 8 sounding notes)
```
- [ ] Console shows correct note counts (12 = 4 rests + 8 notes)

### Test 1.2: Canon by Inversion
**Steps**:
1. Use same 8-note theme from Test 1.1
2. Generate Canon by Inversion:
   - Axis: C4 (60)
   - Interval: 0 (unison)
   - Delay: 2 beats
   - Voices: 2
3. Play the canon

**Expected Results**:
- [ ] Leader plays original melody
- [ ] Follower plays inverted melody (mirrored around C4)
- [ ] Follower starts after 2 beats
- [ ] Both complete full melodies
- [ ] Melodic contour is opposite (leader goes up, follower goes down)

**Console Check**:
```
✅ Added Canon #1 - Leader (8 notes, 8 sounding notes)
✅ Added Canon #1 - Inverted Follower (10 notes, 8 sounding notes)
```
- [ ] Console shows 10 total notes (2 rests + 8 notes)

### Test 1.3: Rhythmic Canon (Augmentation)
**Steps**:
1. Use same 8-note theme
2. Generate Rhythmic Canon:
   - Mensuration Ratio: 2.0 (2x slower)
   - Interval: +5
   - Delay: 0 beats
3. Play the canon

**Expected Results**:
- [ ] Leader plays at normal speed
- [ ] Follower plays at half speed (2x slower)
- [ ] Follower transposed up by a fourth (+5 semitones)
- [ ] Both complete full melodies
- [ ] Rhythmic layering creates depth

### Test 1.4: Crab Canon (Retrograde)
**Steps**:
1. Use theme: C4 D4 E4 F4 G4 (ascending)
2. Generate Crab Canon:
   - Interval: 0 (unison)
   - Delay: 4 beats
3. Play the canon

**Expected Results**:
- [ ] Leader plays: C D E F G (ascending)
- [ ] Follower plays: G F E D C (descending/backward)
- [ ] Follower starts after 4 beats
- [ ] Creates palindromic effect
- [ ] Both complete full melodies

### Test 1.5: Double Canon (4 Voices)
**Steps**:
1. Use 6-note theme
2. Generate Double Canon:
   - Interval: +7
   - Delay: 2 beats
   - Voices: 2 (will create 4 total)
3. Play the canon

**Expected Results**:
- [ ] 4 voices total (2 canons × 2 voices each)
- [ ] Canon A: Leader + Follower
- [ ] Canon B: Leader + Follower
- [ ] Staggered entries create complex texture
- [ ] All 4 voices complete their melodies
- [ ] No voice cuts off

## Test Suite 2: Song Creation Suite Integration 🎼

### Test 2.1: Canon Appears in Available Components
**Steps**:
1. Generate any canon (use Test 1.1 settings)
2. Scroll to "Complete Song Creation" section
3. Click "Compose" tab
4. Look at "Available Components" panel on the right

**Expected Results**:
- [ ] Panel shows section for canons
- [ ] Each canon voice appears as separate component:
  - [ ] "Canon #1 - Leader"
  - [ ] "Canon #1 - Follower 1"
- [ ] Components show note count
- [ ] Components have pink color indicators
- [ ] Components show description (e.g., "STRICT_CANON - Leader")

**Console Check**:
```
🎼 Building available components...
  Canons count: 1
  ✅ Added Canon #1 - Leader (8 notes, 8 sounding notes)
  ✅ Added Canon #1 - Follower 1 (12 notes, 8 sounding notes)
```
- [ ] Console shows "Canons count: 1" (or however many you've generated)

### Test 2.2: Drag Canon Voice to Timeline
**Steps**:
1. From Available Components, find "Canon #1 - Leader"
2. Drag it onto the timeline (gray area)
3. Drop at beat 0

**Expected Results**:
- [ ] Component appears on timeline as a track
- [ ] Track shows:
  - Track name: "Canon #1 - Leader"
  - Note count
  - Instrument
  - Start/end times
- [ ] Track has pink background tint
- [ ] Track width corresponds to note duration

### Test 2.3: Add Multiple Canon Voices
**Steps**:
1. Drag "Canon #1 - Leader" to beat 0
2. Drag "Canon #1 - Follower 1" to beat 0
3. (They should auto-stack vertically)

**Expected Results**:
- [ ] Both tracks appear on timeline
- [ ] Tracks don't overlap vertically (auto-stack)
- [ ] Both tracks start at beat 0
- [ ] Follower track is longer (includes rest padding)

### Test 2.4: Play Canon in Song Timeline
**Steps**:
1. With both canon voices on timeline (from Test 2.3)
2. Click main playback Play button
3. Listen to the composition

**Expected Results**:
- [ ] Leader starts immediately
- [ ] Follower enters after delay (4 beats)
- [ ] Both play complete melodies
- [ ] Audio matches what you heard in Canon Visualizer
- [ ] No notes cut off
- [ ] Playback cursor moves smoothly

### Test 2.5: Multi-Select and Add
**Steps**:
1. Clear timeline (delete all tracks)
2. In Available Components, Ctrl+Click:
   - "Canon #1 - Leader"
   - "Canon #1 - Follower 1"
3. Click "Add Selected (2)" button

**Expected Results**:
- [ ] Both tracks added to timeline simultaneously
- [ ] Both start at beat 0
- [ ] Auto-stacked vertically
- [ ] Success toast notification appears

## Test Suite 3: Advanced Scenarios 🚀

### Test 3.1: Multiple Canons in Song
**Steps**:
1. Generate 2 different canons:
   - Canon 1: Strict Canon, delay 4
   - Canon 2: Inversion Canon, delay 2
2. Add all 4 voices to timeline (2 per canon)
3. Play the song

**Expected Results**:
- [ ] All 4 voices appear in Available Components
- [ ] All 4 can be added to timeline
- [ ] All play correctly with proper delays
- [ ] No interference between different canons
- [ ] Complex polyphonic texture emerges

### Test 3.2: Canon + Other Components
**Steps**:
1. Generate 1 canon
2. Generate 1 imitation
3. Generate 1 fugue
4. Add voices from each to timeline
5. Play the song

**Expected Results**:
- [ ] All component types appear in Available Components
- [ ] Canons, imitations, and fugues all visible
- [ ] All can be mixed on timeline
- [ ] Playback handles all types correctly
- [ ] No conflicts or errors

### Test 3.3: Long Delay Canon
**Steps**:
1. Generate Strict Canon with:
   - Delay: 16 beats (4 measures)
   - Interval: +12 (octave)
2. Verify in console
3. Play the canon

**Expected Results**:
- [ ] Console shows follower with 16 rest notes + theme notes
- [ ] Follower melody: `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, ...notes...]`
- [ ] Playback: 4 measures of silence, then follower enters
- [ ] Leader completes before follower starts (with 8-note theme)

### Test 3.4: Zero Delay Canon (Harmonic Canon)
**Steps**:
1. Generate Strict Canon with:
   - Delay: 0 beats
   - Interval: +4 (major third)
   - Voices: 2
2. Play the canon

**Expected Results**:
- [ ] Both voices start simultaneously
- [ ] No rest padding in follower
- [ ] Console shows both with same note count
- [ ] Creates harmonic texture (not imitative)

## Test Suite 4: Error Handling & Edge Cases 🛡️

### Test 4.1: Empty Theme
**Steps**:
1. Clear your theme (delete all notes)
2. Try to generate a canon

**Expected Results**:
- [ ] Error toast: "Please create a theme first"
- [ ] No canon generated
- [ ] No crash or freeze
- [ ] Console shows validation error

### Test 4.2: No Mode Selected
**Steps**:
1. Deselect current mode (if possible)
2. Try to generate a canon

**Expected Results**:
- [ ] Error toast: "Please select a mode first"
- [ ] No canon generated
- [ ] Graceful failure

### Test 4.3: Clear Canon
**Steps**:
1. Generate a canon
2. Click "Remove" button on the canon card
3. Check Available Components

**Expected Results**:
- [ ] Canon disappears from Canons section
- [ ] Canon voices disappear from Available Components
- [ ] Success toast: "Canon #X cleared"
- [ ] Timeline tracks (if any) remain (they're independent copies)

### Test 4.4: Clear All Canons
**Steps**:
1. Generate 3 different canons
2. Click "Clear All" button in Canons section
3. Check Available Components

**Expected Results**:
- [ ] All canons disappear
- [ ] Available Components shows 0 canons
- [ ] Success toast: "All canons cleared"
- [ ] Canons count in console shows 0

## Test Suite 5: Data Integrity 🔍

### Test 5.1: Console Verification
**Steps**:
1. Generate any canon
2. Check console output carefully

**Expected Console Output**:
```
🎵 Canon Engine: Generating STRICT_CANON
🎼 Building available components...
  Theme length: 8
  Imitations count: 0
  Fugues count: 0
  Canons count: 1
  Counterpoints count: 0
  ✅ Added Canon #1 - Leader (8 notes, 8 sounding notes)
  ✅ Added Canon #1 - Follower 1 (12 notes, 8 sounding notes)
🎼 Total available components: 3 (3 successfully added)
```

**Verify**:
- [ ] Canon generation logged
- [ ] Canons count > 0
- [ ] Each voice shows total notes (with padding) and sounding notes
- [ ] Total components includes canon voices

### Test 5.2: Rhythm/Melody Alignment Check
**Steps**:
1. Generate canon with delay > 0
2. Open console
3. Inspect the canon object (expand in console if available)

**Expected**:
- [ ] For follower with delay = 4:
  - melody.length = themeLength + 4
  - rhythm.length = themeLength + 4
  - melody starts with [0, 0, 0, 0, ...actual notes...]
  - rhythm is all 1s: [1, 1, 1, 1, ...all 1s...]
- [ ] No length mismatches

### Test 5.3: Rest Note Verification
**Steps**:
1. Generate Strict Canon, delay = 8
2. Check console for follower melody

**Expected**:
- [ ] Melody array starts: `[0, 0, 0, 0, 0, 0, 0, 0, ...]`
- [ ] First 8 elements are 0 (rest notes)
- [ ] Following elements are actual MIDI notes (> 0)
- [ ] Console shows: "X sounding notes" = theme length

## Regression Testing 📋

### Test R.1: Existing Features Still Work
- [ ] Imitations generate and play correctly
- [ ] Fugues generate and play correctly
- [ ] Counterpoints generate and play correctly
- [ ] Bach Variables work correctly
- [ ] Theme player works
- [ ] Song export works
- [ ] MIDI import works

### Test R.2: Other Components in Song Suite
- [ ] Main Theme appears in Available Components
- [ ] Imitation parts appear
- [ ] Fugue voices appear
- [ ] Counterpoints appear
- [ ] Bach Variables appear
- [ ] All can be dragged to timeline

## Performance Testing ⚡

### Test P.1: Multiple Canons Performance
**Steps**:
1. Generate 5 different canons (various types)
2. Add all voices to timeline (10+ tracks)
3. Play the song

**Expected**:
- [ ] No lag during playback
- [ ] Smooth audio without glitches
- [ ] Timeline remains responsive
- [ ] No memory warnings in console

### Test P.2: Long Canon Chains
**Steps**:
1. Generate 4 canons with delays: 0, 4, 8, 12 beats
2. Add all to timeline

**Expected**:
- [ ] Timeline extends automatically
- [ ] No rendering issues
- [ ] All voices play at correct times
- [ ] No performance degradation

## Browser Compatibility 🌐

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

## Final Checklist ✅

### Critical Functionality
- [ ] Canons generate without errors
- [ ] All canon types work (6 total)
- [ ] Follower plays complete melody (NOT just 1 note)
- [ ] Entry delays work correctly
- [ ] Canons appear in Song Creation Suite
- [ ] Canon voices draggable to timeline
- [ ] Canon voices play in song compositions

### User Experience
- [ ] Clear error messages
- [ ] Helpful console logging
- [ ] Success toast notifications
- [ ] Intuitive component naming
- [ ] Visual differentiation (pink color)
- [ ] Responsive UI

### Data Integrity
- [ ] Melody/rhythm lengths always match
- [ ] Rest notes preserved for timing
- [ ] No data corruption
- [ ] Proper timestamps
- [ ] Instrument assignments preserved

### Edge Cases
- [ ] Empty themes rejected gracefully
- [ ] Invalid parameters caught
- [ ] Auto-correction works when needed
- [ ] No crashes or freezes
- [ ] Proper memory cleanup

---

## Test Results Log

**Date**: _____________
**Tester**: _____________
**Browser**: _____________
**OS**: _____________

### Summary:
- Tests Passed: _____ / _____
- Tests Failed: _____ / _____
- Critical Issues: _____
- Minor Issues: _____

### Notes:
_________________________________
_________________________________
_________________________________

---

**Status**: Ready for Testing ✅
**Priority**: High - Core Feature Fix
**Estimated Time**: 30-45 minutes for full suite
