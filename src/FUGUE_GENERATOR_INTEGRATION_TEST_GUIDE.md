# Fugue Generator Integration - Quick Test Guide

## 🎯 Quick Verification (5 Minutes)

### Test 1: Basic Fugue Generation → Song Suite
**Expected: Fugue voices appear as components**

1. Create a simple theme (e.g., C-D-E-F-G-F-E-D-C)
2. Select any mode (e.g., C Major/Ionian)
3. Open "Fugue Generator" section
4. Select "3-Part Fugue" architecture
5. Click "Generate Fugue"
6. ✅ Check: Toast shows "Fugue generated successfully!"
7. Navigate to "Complete Song Creation" tab → "Compose"
8. ✅ Check: Available Components panel shows:
   - "Fugue #1 - Voice 1" (purple color `#8b5cf6`)
   - "Fugue #1 - Voice 2" (light purple `#a78bfa`)
   - "Fugue #1 - Voice 3" (lighter purple `#c4b5fd`)

### Test 2: Drag to Timeline
**Expected: Components can be dragged and played**

1. Drag "Fugue #1 - Voice 1" to the timeline
2. ✅ Check: Track created with purple color
3. ✅ Check: Notes visible in timeline
4. Click Play button
5. ✅ Check: Fugue voice plays with piano sound
6. Repeat for Voice 2 and Voice 3
7. ✅ Check: All three voices play in harmony

### Test 3: Multiple Fugues
**Expected: Each fugue creates separate components**

1. Generate another fugue (use different architecture, e.g., "2-Part Fugue")
2. ✅ Check: Available Components now shows:
   - Fugue #1 - Voice 1, 2, 3
   - Fugue #2 - Voice 1, 2
3. ✅ Check: All voices are independent and draggable

### Test 4: Console Logging
**Expected: Detailed logs show processing**

1. Open browser console (F12)
2. Generate a 4-part fugue
3. ✅ Check console shows:
```
🎼 Processing Fugue Generator fugues...
  🎵 Processing Fugue Generator #1: CLASSIC 4 (4 voices)
    Found X total voice entries across Y sections
    Grouped into 4 distinct voices
  ✅ Added Fugue #1 - Voice 1 (X total notes, Y sounding, Z entries, role: subject)
  ✅ Added Fugue #1 - Voice 2 ...
  ✅ Added Fugue #1 - Voice 3 ...
  ✅ Added Fugue #1 - Voice 4 ...
  ✅ Completed processing 1 Fugue Generator fugue(s)
```

## 🔬 Advanced Tests (10 Minutes)

### Test 5: Architecture Variations
**Expected: All 14 architectures work**

Test each architecture:
- [ ] CLASSIC_2 (2 voices)
- [ ] CLASSIC_3 (3 voices)
- [ ] CLASSIC_4 (4 voices)
- [ ] CLASSIC_5 (5 voices)
- [ ] ADDITIVE
- [ ] SUBTRACTIVE
- [ ] ROTATIONAL
- [ ] MIRROR
- [ ] HOCKETED
- [ ] POLYRHYTHMIC
- [ ] RECURSIVE
- [ ] META
- [ ] SPATIAL
- [ ] ADAPTIVE

For each: ✅ Verify components appear with correct voice count

### Test 6: Transformations
**Expected: Transformations preserved in components**

1. Create a theme
2. Select a mode (required for MODE_SHIFTING)
3. Configure Fugue Generator:
   - Architecture: CLASSIC_3
   - Enable transformations:
     - ✅ Inversion
     - ✅ Retrograde
     - ✅ Augmentation
4. Generate fugue
5. ✅ Check: Console logs show transformation applications
6. ✅ Check: Components appear (may have different note counts due to transformations)
7. Drag to timeline and play
8. ✅ Check: Transformations audible (inverted intervals, reversed phrases, longer durations)

### Test 7: Error Handling
**Expected: Graceful handling of edge cases**

#### 7a. No Theme
1. Clear theme (delete all notes)
2. Try to generate fugue
3. ✅ Check: Error toast "Please create a theme first"

#### 7b. No Mode
1. Create theme
2. Don't select mode
3. Enable MODE_SHIFTING transformation
4. Generate fugue
5. ✅ Check: Warning toast about MODE_SHIFTING skipped
6. ✅ Check: Fugue still generates (without mode shifting)

#### 7c. Invalid Configuration
1. Set number of voices to 0
2. Generate
3. ✅ Check: Graceful error handling

### Test 8: Integration with Other Generators
**Expected: Fugue components coexist with others**

1. Generate:
   - 1 Theme (Main Theme)
   - 1 Imitation
   - 1 Traditional Fugue (from ImitationFugueControls)
   - 1 Canon (from Canon Engine)
   - 1 Fugue Generator fugue (3 voices)
   - 1 Counterpoint

2. Navigate to Complete Song Creation
3. ✅ Check Available Components shows ALL:
   - Main Theme (indigo)
   - Imitation parts (blue)
   - Traditional Fugue parts (purple)
   - Canon voices (pink)
   - **Fugue Generator voices (purple gradient)** ← NEW
   - Counterpoint (green)

4. ✅ Verify: All can be dragged to timeline
5. ✅ Verify: All play correctly together

## 🎼 Playback Tests (5 Minutes)

### Test 9: Full Song Composition
**Expected: Complete workflow works end-to-end**

1. Create theme: C-D-E-F-G-A-G-F-E-D-C
2. Generate CLASSIC_4 fugue (4 voices)
3. Switch to Complete Song Creation
4. Drag all 4 fugue voices to timeline:
   - Voice 1 at beat 0
   - Voice 2 at beat 4
   - Voice 3 at beat 8
   - Voice 4 at beat 12
5. Set different instruments:
   - Voice 1: Piano
   - Voice 2: Violin
   - Voice 3: Flute
   - Voice 4: Cello
6. Click Play
7. ✅ Check: Staggered entry creates fugue effect
8. ✅ Check: Each voice audible with distinct instrument
9. ✅ Check: Harmony sounds correct

### Test 10: Instrument Changes
**Expected: Instruments can be changed per voice**

1. Use fugue from Test 9
2. For each track, change instrument using dropdown
3. ✅ Check: Sound changes immediately
4. ✅ Check: All instruments from ENHANCED_INSTRUMENTS work

### Test 11: Mute/Solo
**Expected: Individual voice control works**

1. Use fugue from Test 9
2. Click Mute on Voice 1
3. ✅ Check: Voice 1 silent, others play
4. Click Mute again to unmute
5. Click Solo on Voice 2
6. ✅ Check: Only Voice 2 plays
7. ✅ Check: Other controls still functional

## 📊 Export Tests (5 Minutes)

### Test 12: MIDI Export
**Expected: Fugue voices export correctly**

1. Create song with Fugue Generator voices
2. Navigate to "Export" tab
3. Click "Export MIDI"
4. ✅ Check: File downloads
5. Open in MIDI editor (e.g., MuseScore, Sibelius)
6. ✅ Check: All voices present as separate tracks
7. ✅ Check: Timing matches composition
8. ✅ Check: Notes are correct

### Test 13: MusicXML Export
**Expected: Fugue structure preserved**

1. Use song from Test 12
2. Click "Export MusicXML"
3. ✅ Check: File downloads
4. Open in notation software
5. ✅ Check: All voices appear
6. ✅ Check: Notation readable
7. ✅ Check: Rhythm values correct

## 🐛 Regression Tests (5 Minutes)

### Test 14: Existing Features Still Work
**Expected: No functionality broken**

#### Theme Composer
- [ ] Create theme → ✅ Works
- [ ] Edit theme → ✅ Works
- [ ] Play theme → ✅ Works

#### Imitation (Old System)
- [ ] Generate imitation → ✅ Creates parts
- [ ] Parts appear in Song Suite → ✅ Works
- [ ] Can drag to timeline → ✅ Works

#### Traditional Fugue (Old System)
- [ ] Generate fugue → ✅ Creates parts
- [ ] Parts appear in Song Suite → ✅ Works
- [ ] Can drag to timeline → ✅ Works

#### Canon Engine
- [ ] Generate canon → ✅ Creates voices
- [ ] Voices appear in Song Suite → ✅ Works
- [ ] Can drag to timeline → ✅ Works

#### Counterpoint
- [ ] Generate counterpoint → ✅ Creates melody
- [ ] Appears in Song Suite → ✅ Works
- [ ] Can drag to timeline → ✅ Works

#### Bach Variables
- [ ] Create Bach variables → ✅ Works
- [ ] Appear in Song Suite → ✅ Works
- [ ] Can drag to timeline → ✅ Works

### Test 15: No Console Errors
**Expected: Clean console**

1. Perform Tests 1-14
2. Open console (F12)
3. ✅ Check: No red errors (warnings OK)
4. ✅ Check: Success messages for each generation
5. ✅ Check: Informative logs about processing

## ✅ Pass Criteria

**All tests must pass:**
- ✅ Fugue Generator creates components
- ✅ Components appear in Available Components
- ✅ Components can be dragged to timeline
- ✅ Playback works correctly
- ✅ Multiple fugues supported
- ✅ All architectures work
- ✅ Transformations preserved
- ✅ Error handling graceful
- ✅ Integration with other generators seamless
- ✅ Export functions correctly
- ✅ No regressions in existing features
- ✅ No console errors

## 🚨 If Tests Fail

### Components Don't Appear
1. Check console for errors
2. Verify `generatedFuguesList` prop passed correctly
3. Check `availableComponents` useMemo dependencies

### Playback Issues
1. Verify rhythm data preserved
2. Check melody consolidation logic
3. Ensure instruments assigned

### Missing Voices
1. Check voice grouping logic
2. Verify voiceId uniqueness
3. Confirm all sections processed

### Console Errors
1. Check error boundaries active
2. Verify try-catch blocks working
3. Review validation logic

## 📝 Test Results Template

```
FUGUE GENERATOR INTEGRATION TEST RESULTS
Date: _______________
Tester: _______________

Basic Tests:
[ ] Test 1: Basic Generation → PASS / FAIL
[ ] Test 2: Drag to Timeline → PASS / FAIL
[ ] Test 3: Multiple Fugues → PASS / FAIL
[ ] Test 4: Console Logging → PASS / FAIL

Advanced Tests:
[ ] Test 5: Architectures (___/14) → PASS / FAIL
[ ] Test 6: Transformations → PASS / FAIL
[ ] Test 7: Error Handling → PASS / FAIL
[ ] Test 8: Integration → PASS / FAIL

Playback Tests:
[ ] Test 9: Full Composition → PASS / FAIL
[ ] Test 10: Instruments → PASS / FAIL
[ ] Test 11: Mute/Solo → PASS / FAIL

Export Tests:
[ ] Test 12: MIDI → PASS / FAIL
[ ] Test 13: MusicXML → PASS / FAIL

Regression Tests:
[ ] Test 14: Existing Features → PASS / FAIL
[ ] Test 15: No Errors → PASS / FAIL

Overall Result: PASS / FAIL
Notes: _______________________________________________
```

---

**Testing Time: ~30 minutes for complete suite**
**Minimum Required: Tests 1-4 (5 minutes)**
**Recommended: All tests (30 minutes)**
