# Component Export Fix - Quick Test Guide 🧪

**Test Duration**: 2-3 minutes  
**Purpose**: Verify harmony components export correctly

---

## 🎯 THE FIX

**Before**: Harmony components exported only the original melody (wrong!)  
**After**: Harmony components export the actual harmony chords (correct!)

---

## ⚡ QUICK TEST

### Step 1: Create Harmony Component

1. Go to **"Complete Song Creation Suite"** tab
2. Enter a theme in **Theme Composer** (or use Bach Variables)
3. Go to **Harmony Engine Suite**
4. Click **"Harmonize Current Theme"**
5. Wait for harmony generation
6. Look for **"Harmony 1"** in Generated Harmonies section
7. ✅ **Component should appear in "Available Components"**

### Step 2: Export the Harmony

1. Go to **"Export Components"** tab (new tab)
2. Find your harmony component in the list
3. Look for the **"Harmony" badge** next to component name
4. Select the checkbox for that component
5. Choose format: **MIDI** (recommended for testing)
6. Keep mode as: **Composite** (default)
7. Click **"Export 1 Component as MIDI"**
8. ✅ **File downloads**

### Step 3: Verify Export Content

**Open in DAW** (Ableton, Logic, FL Studio, etc.):
- ✅ Should see **MULTIPLE tracks** (3-6 tracks typically)
- ✅ Each track is a different chord voice (bass, middle, top)
- ✅ Plays back as **full chords**, not single notes
- ✅ Sounds like what you heard in the application

**Previously (Bug)**:
- ❌ Only 1 track
- ❌ Only melody notes, no harmony
- ❌ Didn't match playback

---

## 🎵 WHAT YOU'RE TESTING

### Harmony Component Structure

```
harmony.harmonyNotes = [
  [60, 64, 67],  ← Chord 1: C, E, G (C major)
  [62, 65, 69],  ← Chord 2: D, F, A (D minor)
  [64, 67, 71],  ← Chord 3: E, G, B (E minor)
  [65, 69, 72]   ← Chord 4: F, A, C (F major)
]
```

### Export Result (CORRECT NOW)

```
MIDI File:
  Track 1: [60, 62, 64, 65]  (Bass line)
  Track 2: [64, 65, 67, 69]  (Middle line)  
  Track 3: [67, 69, 71, 72]  (Top line)
```

### Old Export Result (BUG - FIXED)

```
MIDI File:
  Track 1: [60, 62, 64, 65]  (Only melody, no harmony!)
```

---

## 📊 EXPECTED RESULTS

### ✅ SUCCESS INDICATORS

| Test | Expected Result |
|------|----------------|
| Export file size | **Larger** than before (more data) |
| Track count | **3-6 tracks** (multiple chord voices) |
| Playback | **Sounds harmonized** (full chords) |
| Visual (piano roll) | **Vertical chord stacks** visible |

### ❌ IF SOMETHING'S WRONG

| Issue | Possible Cause |
|-------|---------------|
| Only 1 track | Component might not be harmony type |
| No chords | Component's harmonyNotes might be empty |
| Wrong notes | Different component selected |

---

## 🔍 DETAILED VERIFICATION

### Test Case: Compare Theme vs Harmony Export

1. **Export the THEME** (original melody):
   - Should be **1 track**
   - Single melody line
   - No harmony

2. **Export the HARMONY** (harmonized version):
   - Should be **3-6 tracks**
   - Multiple voices playing together
   - Full chords

This proves the system is **dynamically** choosing what to export!

---

## 🎓 ADVANCED TESTS

### Composite Export (Multiple Components)

1. Select **multiple components**:
   - 1 Theme
   - 1 Harmony
   - 1 Canon
2. Export as **Composite MIDI**
3. **Expected**: 
   - Theme: 1 track
   - Harmony: 3+ tracks  
   - Canon: 1 track
   - Total: 5+ tracks combined

### Individual Export (Multiple Files)

1. Select **multiple components**
2. Choose **Individual** mode
3. Click Export
4. **Expected**: Downloads multiple files (one per component)
5. Each harmony file has multiple tracks

---

## 💾 FILE EXAMPLES

### Harmony Component MIDI (CORRECT)

```
File: My_Harmonized_Melody.mid
Size: ~2-4 KB
Tracks: 3-6
Duration: Matches component
Content: Full harmony chords
```

### Theme Component MIDI (CORRECT)

```
File: My_Theme.mid
Size: ~1-2 KB
Tracks: 1
Duration: Matches component
Content: Single melody
```

---

## 🐛 TROUBLESHOOTING

### "I only see 1 track in the MIDI export"

**Possible reasons**:
1. Component is not a harmony type (check for "Harmony" badge)
2. Harmony generation failed (check Generated Harmonies list)
3. Wrong component selected (verify component name)

**Fix**: Generate a new harmony and try again

### "Export button is disabled"

**Reason**: No components selected

**Fix**: Check the checkbox next to component you want to export

### "No components available to export"

**Reason**: Haven't generated any components yet

**Fix**: 
1. Go to Complete Song Creation Suite
2. Generate something (harmony, canon, fugue, etc.)
3. Return to Export Components tab

---

## ✅ TEST COMPLETION CHECKLIST

- [ ] Created a harmony component
- [ ] Exported harmony as MIDI
- [ ] Opened MIDI in DAW
- [ ] Verified multiple tracks present
- [ ] Verified tracks play together as chords
- [ ] Compared to original theme export (single track)
- [ ] Tested composite export (optional)
- [ ] Tested individual export (optional)

---

## 🎉 SUCCESS CRITERIA

**Test PASSES if**:
- ✅ Harmony components export with multiple tracks
- ✅ Each track represents a chord voice
- ✅ Playback matches application audio
- ✅ Theme components still export single melody
- ✅ No errors during export

**Test FAILS if**:
- ❌ Harmony exports only 1 track
- ❌ Export doesn't match playback
- ❌ Error messages appear
- ❌ Files are corrupted

---

## 📞 QUICK SUMMARY

**What was broken**: Harmony exports only contained melody  
**What was fixed**: Harmony exports now contain full chord data  
**How to test**: Export a harmony component and check track count  
**Expected result**: Multiple tracks (3-6) with vertical chords  
**Time to test**: 2-3 minutes

**STATUS: READY TO TEST** ✅
