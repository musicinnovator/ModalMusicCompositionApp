# Counterpoint Engine - Quick Test Guide

## 🚀 5-Minute Verification

### Test 1: Basic Transformation (Retrograde)
**Expected:** Theme plays backwards

1. Create theme: `[60, 62, 64, 65, 67]` (C-D-E-F-G)
2. Select "Retrograde" technique
3. Click "Generate Counterpoint"
4. **Expected Result:** `[67, 65, 64, 62, 60]` (G-F-E-D-C)
5. **Console Check:** 
   ```
   🔄 RETROGRADE: Input theme: [60, 62, 64, 65, 67]
   🔄 RETROGRADE: Output (reversed): [67, 65, 64, 62, 60]
   ```

**Status:** ✅ PASS / ❌ FAIL

---

### Test 2: Transposition
**Expected:** Theme shifted by semitones

1. Use same theme: `[60, 62, 64, 65, 67]`
2. Select "Transposition" technique
3. Set Transposition Target to `+7 semitones (Perfect Fifth up)`
4. Click "Generate Counterpoint"
5. **Expected Result:** `[67, 69, 71, 72, 74]` (G-A-B-C-D)
6. **Console Check:**
   ```
   🎵 TRANSPOSITION: Interval: 7 semitones
   🎵 TRANSPOSITION: Result: [67, 69, 71, 72, 74]
   ```

**Status:** ✅ PASS / ❌ FAIL

---

### Test 3: Sequence (Repetitions + Interval)
**Expected:** Theme repeats at higher pitches

1. Use theme: `[60, 62, 64]` (C-D-E)
2. Select "Sequence" technique
3. Set Sequence Interval to `2` (Major second)
4. Set Sequence Repetitions to `3`
5. Click "Generate Counterpoint"
6. **Expected Result:** `[60, 62, 64, 62, 64, 66, 64, 66, 68]`
   - Rep 1: C-D-E (original)
   - Rep 2: D-E-F# (+2 semitones)
   - Rep 3: E-F#-G# (+4 semitones)
7. **Console Check:**
   ```
   🔁 SEQUENCE: Repetitions: 3
   🔁 SEQUENCE: Repetition 1 (transposed by 2 semitones): [62, 64, 66]
   🔁 SEQUENCE: Repetition 2 (transposed by 4 semitones): [64, 66, 68]
   ```

**Status:** ✅ PASS / ❌ FAIL

---

### Test 4: Texture (Smooth vs Rough)
**Expected:** Different melodic characteristics

1. Create theme with leaps: `[60, 72, 64, 76]`
2. Select any technique (e.g., "Retrograde")
3. **Test A - Smooth:**
   - Set Texture Type to "Smooth"
   - Generate
   - **Expected:** Stepwise motion (max 2 semitones between notes)
   - **Console:** `🎨 Applying texture: smooth`
4. **Test B - Rough:**
   - Set Texture Type to "Rough"
   - Generate
   - **Expected:** Large leaps (6+ semitones)
   - **Console:** `🎨 Applying texture: rough`

**Status:** ✅ PASS / ❌ FAIL

---

### Test 5: Consonance Check
**Expected:** Only consonant intervals

1. Create theme: `[60, 62, 64]`
2. Select any technique
3. **Test A - Without Consonance:**
   - Disable "Consonance Check"
   - Generate
   - Note the result
4. **Test B - With Consonance:**
   - Enable "Consonance Check"
   - Generate
   - **Expected:** Different result with smoother harmonies
   - **Console:** `✓ Applying consonance check`

**Status:** ✅ PASS / ❌ FAIL

---

### Test 6: Voice Leading
**Expected:** Smooth melodic motion

1. Create theme with leaps: `[60, 72, 55, 80]`
2. Select "Retrograde"
3. **Test A - Without Voice Leading:**
   - Disable "Voice Leading"
   - Generate
   - Note large leaps
4. **Test B - With Voice Leading:**
   - Enable "Voice Leading"
   - Generate
   - **Expected:** Leaps reduced to max 7 semitones
   - **Expected:** Stepwise motion after leaps
   - **Console:** `➜ Applying voice leading rules`

**Status:** ✅ PASS / ❌ FAIL

---

### Test 7: Species Counterpoint (Rhythmic)
**Expected:** Correct note duration ratios

1. Create theme: `[60, 62, 64, 65]`
2. Enable "Rhythmic Species Counterpoint" toggle
3. Set Cantus Firmus Duration to "Whole Note (4 beats)"
4. Set Species Ratio to "2:1 (Second Species)"
5. Generate
6. **Expected:** Each counterpoint note = 2 beats (half of 4 beats)
7. **Console Check:**
   ```
   🎵 RHYTHM GENERATION:
     speciesRatio: 2:1
     cfDuration: whole
     cfBeats: 4
     cpBeats: 2
   ```

**Status:** ✅ PASS / ❌ FAIL

---

### Test 8: Combination Technique
**Expected:** Two techniques applied in sequence

1. Create theme: `[60, 62, 64, 65, 67]`
2. Go to "Combinations" tab
3. Select "Retrograde-Inversion"
4. Generate
5. **Expected:**
   - Step 1: Retrograde `[67, 65, 64, 62, 60]`
   - Step 2: Inversion around first note (67)
   - Result: Different from original theme
6. **Console:** Should show both transformation logs

**Status:** ✅ PASS / ❌ FAIL

---

## Quick Console Checklist

Open Browser DevTools (F12) and look for:

✅ Transformation logs (🔄, 🎵, 🔁, 🎨)  
✅ Input/output comparisons  
✅ Parameter values logged  
✅ Post-processing notifications (✓, ➜)

---

## Common Issues

### "Nothing happens when I generate"
- **Check:** Is there a theme in the Theme Composer?
- **Check:** Is a mode selected?
- **Check:** Check browser console for errors

### "Result looks the same as input"
- **Check:** Some techniques preserve structure (e.g., 1:1 species)
- **Check:** Enable texture or other parameters to see differences

### "Parameters don't seem to affect output"
- **Solution:** This was the bug! It's now fixed.
- **Verify:** Check console logs for post-processing messages

---

## Expected Console Output Example

```
🔄 RETROGRADE: Input theme: [60, 62, 64, 65, 67]
🔄 RETROGRADE: Output (reversed): [67, 65, 64, 62, 60]
🎨 Applying texture: smooth
✓ Applying consonance check
➜ Applying voice leading rules
Generated Retrograde: G4, F4, E4... (5 notes)
```

---

## All Tests Passing?

**If all 8 tests PASS:**
✅ Counterpoint Engine is fully functional!

**If any test FAILS:**
1. Copy console output
2. Note which test failed
3. Report with exact steps taken

---

**Quick Test Duration:** ~5 minutes  
**Comprehensive Test (all 35 features):** ~30 minutes  
**See:** COUNTERPOINT_ENGINE_COMPREHENSIVE_FIX.md for full details
