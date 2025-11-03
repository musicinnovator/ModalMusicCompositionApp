# Counterpoint Engine Visual Testing Guide
**Quick 5-Minute Verification Test**  
**Version: 1.001**

---

## 🎯 Quick Test - Verify Everything Works

Follow these steps to verify all counterpoint functionality in under 5 minutes:

### ✅ Test 1: Basic Counterpoint Playback (60 seconds)

1. **Create a Theme:**
   - Go to "Theme Composer" tab
   - Click "Main Theme" section
   - Add notes: C4, D4, E4, F4, G4 using the piano keyboard OR
   - Enter in the note field: 60, 62, 64, 65, 67

2. **Generate a Counterpoint:**
   - Scroll to "Counterpoint Engine Suite"
   - Select **"Basic"** tab
   - Click **"Techniques"** tab
   - Choose technique: **"Retrograde"**
   - Click **"Generate Counterpoint"**
   
   **✅ Expected Result:**
   - Toast notification: "Generated Retrograde..."
   - A new counterpoint appears in "Generated Counterpoints" section
   - Shows melody: G4 F4 E4 D4 C4 (reversed)

3. **Play the Counterpoint:**
   - Find the counterpoint in "Generated Counterpoints" section
   - Click the ▶️ **Play** button
   
   **✅ Expected Result:**
   - You hear the notes playing in reverse order
   - No errors in console
   - Playback completes smoothly

4. **Add to Song:**
   - Scroll to "Complete Song Creation" section
   - Look for "Available Components" panel (left side)
   - You should see **"Retrograde"** listed
   - **Drag it** onto the timeline
   
   **✅ Expected Result:**
   - Track appears on timeline
   - Green color (counterpoint indicator)
   - Shows note blocks

5. **Play in Song:**
   - Click ▶️ **Play** button in Song Composer
   
   **✅ Expected Result:**
   - Counterpoint plays with correct notes
   - Rhythm timing is correct
   - No audio glitches

**✅ TEST 1 PASSED?** If you heard the reversed notes playing, counterpoint playback works!

---

### ✅ Test 2: Species Counterpoint with Rhythm (90 seconds)

1. **Enable Rhythm Mode:**
   - In "Counterpoint Engine Suite"
   - Look for **"Rhythmic Species Counterpoint"** section
   - Toggle the switch **ON**

2. **Configure Species Settings:**
   - **Cantus Firmus Duration:** Whole Note (4 beats)
   - **Species Ratio:** **2:1 (Second Species)**
   - Leave other settings as default

3. **Generate Species Counterpoint:**
   - Click **"Generate Counterpoint"** again
   
   **✅ Expected Result:**
   - Toast shows: "Generated Retrograde: ... (with rhythm data)" OR "(2:1 species)"
   - New counterpoint appears with rhythm info

4. **Verify Rhythm in Song:**
   - Drag the new counterpoint to the timeline
   - **Visual Check:** Notes should be *half as long* as theme notes
   - For whole notes (4 beats) → counterpoint should be half notes (2 beats)

5. **Play and Listen:**
   - Play the song
   
   **✅ Expected Result:**
   - Counterpoint plays *twice as fast* as the theme
   - 2 counterpoint notes per 1 theme note
   - Clear rhythmic relationship audible

**✅ TEST 2 PASSED?** If you can hear the 2:1 rhythm relationship, species counterpoint works!

---

### ✅ Test 3: All Techniques Work (60 seconds)

**Quick technique test - try each one:**

1. **In Counterpoint Composer:**
   - Keep your theme: C4 D4 E4 F4 G4

2. **Test Each Technique:**
   Try generating with these techniques (click dropdown, select, generate):
   
   | Technique | Expected Melody Pattern |
   |-----------|------------------------|
   | **Retrograde** | G4 F4 E4 D4 C4 (reversed) |
   | **Inversion** | C4 Bb3 Ab3 Gb3 F3 (intervals flipped) |
   | **Transposition** | F4 G4 A4 Bb4 C5 (shifted up/down) |
   | **Augmentation** | Same notes, *slower rhythm* |
   | **Diminution** | Same notes, *faster rhythm* |

   **✅ For each:** Click Generate → Should see toast notification → Counterpoint appears

3. **Test Combinations:**
   - Switch to **"Combinations"** tab
   - Try: **"Retrograde-Inversion"**
   - Click Generate
   
   **✅ Expected:** New counterpoint with both effects applied

**✅ TEST 3 PASSED?** If all 5 techniques generated without errors, techniques work!

---

### ✅ Test 4: Texture Parameters (30 seconds)

1. **Change Texture:**
   - Find **"Technique Parameters"** section
   - **Texture Type** dropdown
   - Try: **"Smooth"** vs **"Rough"**

2. **Generate with Each:**
   - Generate with "Smooth" → Should favor stepwise motion
   - Generate with "Rough" → May have larger intervals
   
   **✅ Expected:** Both generate successfully (effect may be subtle)

**✅ TEST 4 PASSED?** If both textures generate, parameters work!

---

### ✅ Test 5: Export Functionality (60 seconds)

1. **Create a Song with Counterpoint:**
   - Ensure you have at least 1 counterpoint on the timeline

2. **Export to MIDI:**
   - Go to "Complete Song Creation" → **"Export"** tab
   - Click **"Export as MIDI"**
   - Save the file
   
   **✅ Expected:** .mid file downloads with no errors

3. **Export to MusicXML:**
   - Click **"Export as MusicXML"**
   - Save the file
   
   **✅ Expected:** .musicxml file downloads

4. **Export to Text:**
   - Click **"Export as Text"**
   
   **✅ Expected:** Human-readable format in browser

**✅ TEST 5 PASSED?** If all 3 formats exported, export works!

---

## 🎓 Advanced Tests (Optional)

### Test 6: Rhythm Controls Integration (60 seconds)

1. **Find a Generated Counterpoint:**
   - In "Generated Counterpoints" section
   - Look for **"Counterpoint Rhythm"** section below it

2. **Modify Rhythm:**
   - Click on rhythm buttons (Quarter, Half, Eighth, etc.)
   - Change some notes to different durations
   
   **✅ Expected:** Buttons change, rhythm values update

3. **Add to Song and Play:**
   - Drag to timeline
   - Play song
   
   **✅ Expected:** Custom rhythm plays (not default quarter notes)

---

### Test 7: Species Counterpoint Rules (120 seconds)

1. **Test All 5 Species:**
   - Switch to **"Species"** tab in Counterpoint Composer
   - Try each:
     - First Species (1:1)
     - Second Species (2:1)
     - Third Species (3:1)
     - Fourth Species (4:1)
     - Fifth Species (Florid/Mixed)

2. **For Each Species:**
   - Select species
   - Click Generate
   - Check rhythm ratio:
     - 1:1 → Same duration as theme
     - 2:1 → Half duration
     - 3:1 → Third duration
     - 4:1 → Quarter duration
     - 5:1 → Mixed durations

   **✅ Expected:** Each generates with correct rhythm relationship

---

## 🐛 What To Look For (Potential Issues)

### ❌ **FAIL Indicators:**
- ❌ Error toast when generating counterpoint
- ❌ Counterpoint doesn't appear in "Generated Counterpoints"
- ❌ No sound when playing counterpoint
- ❌ Can't drag counterpoint to timeline
- ❌ Export fails with error
- ❌ Console shows red errors during generation

### ⚠️ **Warning Indicators (Not Critical):**
- ⚠️ Counterpoint melody sounds odd (might be extreme transformation)
- ⚠️ Texture parameter has subtle effect (expected)
- ⚠️ Some techniques produce similar results

### ✅ **SUCCESS Indicators:**
- ✅ Toast notifications show success messages
- ✅ Counterpoints appear in list with technique name
- ✅ Playback works for each counterpoint
- ✅ Can be added to song and played there
- ✅ Exports work without errors
- ✅ No console errors

---

## 📋 Quick Checklist

Print this and check off as you test:

```
Counterpoint Functionality Checklist:
[ ] Test 1: Basic playback works
[ ] Test 2: Species counterpoint rhythm works
[ ] Test 3: All techniques generate
[ ] Test 4: Texture parameters work
[ ] Test 5: All exports work

Advanced (Optional):
[ ] Test 6: Rhythm Controls work
[ ] Test 7: All 5 species work correctly

Specific Techniques:
[ ] Retrograde
[ ] Inversion
[ ] Truncation
[ ] Elision
[ ] Diminution
[ ] Augmentation
[ ] Fragmentation
[ ] Sequence
[ ] Ornamentation
[ ] Interpolation
[ ] Transposition
[ ] Mode Shifting

Texture Parameters:
[ ] Smooth
[ ] Simple
[ ] Rough
[ ] Complex
[ ] Dense
[ ] Sparse

Species Types:
[ ] First (1:1)
[ ] Second (2:1)
[ ] Third (3:1)
[ ] Fourth (4:1)
[ ] Fifth (Florid)

Export Formats:
[ ] MIDI (.mid)
[ ] MusicXML (.musicxml)
[ ] Text (.txt)
```

---

## 🚀 Expected Total Time

- **Quick Test (Tests 1-5):** 5 minutes
- **Advanced Test (Tests 6-7):** 3 minutes
- **Complete Checklist:** 10-15 minutes

---

## 📸 Screenshot Guide

### Where to Look:

1. **Counterpoint Engine Suite** (left column):
   - Basic/Advanced tabs
   - Techniques/Combinations/Species/Custom tabs
   - Rhythmic Species Counterpoint toggle
   - Generate Counterpoint button

2. **Generated Counterpoints** (right column):
   - List of generated counterpoints
   - Each shows: technique name, timestamp, remove button
   - Counterpoint Rhythm section below each
   - Play button for each

3. **Complete Song Creation** (bottom):
   - Available Components (left panel)
   - Timeline (center)
   - Track controls (right)
   - Play/export buttons (top)

---

## ✅ Success Criteria

**You can confidently say counterpoint is working if:**

1. ✅ You can generate at least 3 different techniques
2. ✅ Species counterpoint plays with correct rhythm (2:1, 3:1, etc.)
3. ✅ Counterpoints can be added to song and played
4. ✅ MIDI export works with rhythm preserved
5. ✅ No console errors during any operation

**Minimum passing score:** 4/5 success criteria

---

## 🆘 Troubleshooting

### Issue: "No sound when playing counterpoint"
**Solution:**
- Check volume slider (top of player)
- Click anywhere on screen first (browser audio policy)
- Check browser console for audio errors

### Issue: "Can't drag to timeline"
**Solution:**
- Ensure "Complete Song Creation" section is visible
- Check that Available Components panel shows counterpoint
- Try refreshing page and regenerating

### Issue: "Species rhythm doesn't sound different"
**Solution:**
- Verify "Rhythmic Species Counterpoint" toggle is ON
- Check species ratio is not "1:1"
- Ensure CF duration is not "quarter" (should be "whole" or "half")

---

**Last Updated:** January 21, 2025  
**Version:** 1.001  
**Quick Test Time:** 5 minutes ⏱️
