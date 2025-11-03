# Quick Test Guide - Harmony & Arpeggio Enhancements
**Version 1.003 - Fast Testing Protocol**

---

## 🎯 Harmony Chord Editor - Quick Test (5 minutes)

### Test 1: Basic Chord Change
1. Open **Harmonic Engine Suite**
2. Select **Current Theme** as source
3. Click **"Harmonize"**
4. In the results, click **"Edit Chords"** button
5. **Double-click** any chord badge
6. Change chord quality (e.g., M → m7)
7. Click **"Change Chord"**
8. Click **"Save Changes"**
9. ✅ Verify chord label updated

### Test 2: Context Menu Operations
1. **Right-click** a chord badge
2. Select **"Add Before"**
3. Choose chord quality: **M7**
4. Click **"Add Chord"**
5. Click **"Save Changes"**
6. ✅ Verify new chord inserted

### Test 3: Undo/Redo
1. Make several chord changes
2. Click **"Undo"** button
3. ✅ Verify change reversed
4. Click **"Redo"** button
5. ✅ Verify change restored

### Test 4: Delete Chord
1. **Right-click** a chord (not the last one)
2. Select **"Delete Chord"**
3. Confirm deletion
4. Click **"Save Changes"**
5. ✅ Verify chord removed

### Test 5: Discard Changes
1. Make several chord edits
2. Click **"Discard"** button
3. ✅ Verify all changes reverted
4. ✅ Verify "Unsaved Changes" badge gone

---

## 🎵 Arpeggio Chain Builder - Quick Test (5 minutes)

### Test 1: Single Pattern Chain
1. Open **Arpeggio Chain Builder**
2. Select source: **Current Theme**
3. Select pattern: **LMH** (Ascending)
4. Set repetitions: **2**
5. Click **"Add to Chain"**
6. Click **"Generate Arpeggio Chain"**
7. Click **Play** button
8. ✅ Verify arpeggio plays correctly

### Test 2: Multi-Pattern Chain
1. Add pattern: **LMH** × 1
2. Add pattern: **HML** × 1
3. Add pattern: **LMHL** × 2
4. ✅ Verify chain shows "3 patterns"
5. ✅ Verify total notes calculated correctly
6. Click **"Generate Arpeggio Chain"**
7. ✅ Verify visualization shows full sequence

### Test 3: Remove from Chain
1. Build a chain with 3+ patterns
2. Click **trash icon** on middle pattern
3. ✅ Verify pattern removed
4. ✅ Verify total notes recalculated
5. Generate chain
6. ✅ Verify result reflects removal

### Test 4: Source Selection
1. Select source: **Cantus Firmus (CF)**
2. ✅ Verify note preview updates (L/M/H)
3. Add pattern and generate
4. ✅ Verify uses CF notes
5. Try other sources (CFF1, CFF2)
6. ✅ Verify each source works

### Test 5: Song Suite Integration
1. Generate an arpeggio chain
2. Click **"Add to Song Suite"**
3. ✅ Verify success toast appears
4. ✅ Verify component added to suite
5. Check timeline
6. ✅ Verify can drag to timeline

---

## 🐛 Error Handling Tests

### Harmony Editor Errors
1. **Try to delete last chord** → Should show error
2. **Discard with no changes** → Should show info toast
3. **Undo at beginning** → Button should be disabled
4. **Redo at end** → Button should be disabled

### Arpeggio Chain Errors
1. **Generate with empty chain** → Should show error
2. **Add to suite without generating** → Should show error
3. **Select empty source** → Should use fallback/example
4. **Add pattern without selection** → Should show error

---

## ✅ Feature Checklist

### Harmony Chord Editor
- [ ] Edit mode toggle works
- [ ] Double-click opens dialog
- [ ] Right-click shows context menu
- [ ] All 29 chord qualities available
- [ ] Change chord works
- [ ] Add before works
- [ ] Add after works
- [ ] Delete chord works (not last)
- [ ] Delete last chord blocked
- [ ] Undo button works
- [ ] Redo button works
- [ ] Save changes persists
- [ ] Discard reverts changes
- [ ] Unsaved changes badge shows
- [ ] Toast notifications appear
- [ ] View mode shows updated chords
- [ ] Playback uses updated chords

### Arpeggio Chain Builder
- [ ] Source selection works
- [ ] Note preview updates
- [ ] Pattern dropdown populated (64 patterns)
- [ ] Repetitions +/- buttons work
- [ ] Add to chain works
- [ ] Chain display shows patterns
- [ ] Total notes calculated correctly
- [ ] Remove pattern works
- [ ] Clear chain works
- [ ] Generate chain works
- [ ] Visualization displays
- [ ] Playback works
- [ ] Instrument selection works
- [ ] Add to song suite works
- [ ] Toast notifications appear
- [ ] All sources work (Theme, CF, CFF1, CFF2)

---

## 🚀 Performance Tests

### Harmony Editor
1. Create harmony with 20+ chords
2. Edit multiple chords rapidly
3. ✅ Verify UI remains responsive
4. Use undo/redo 20+ times
5. ✅ Verify no memory issues

### Arpeggio Chain
1. Add 10+ patterns to chain
2. Generate large chain (200+ notes)
3. ✅ Verify generation completes
4. Play back long arpeggio
5. ✅ Verify smooth playback

---

## 📊 Integration Tests

### With Existing Components

#### Harmony Integration
1. Generate harmony from **Theme**
2. Edit chords
3. Add to **Timeline**
4. ✅ Verify timeline shows edited harmony
5. Export to **MIDI**
6. ✅ Verify MIDI has correct chords

#### Arpeggio Integration
1. Create arpeggio chain
2. Add to **Song Suite**
3. ✅ Verify appears in Available Components
4. Drag to **Timeline**
5. ✅ Verify timeline playback correct
6. Export to **MIDI**
7. ✅ Verify MIDI export works

---

## 🔍 Visual Verification

### Harmony Editor UI
- [ ] "Edit Chords" button visible
- [ ] Chord badges clickable
- [ ] Context menu appears on right-click
- [ ] Dialog opens centered
- [ ] Undo/Redo buttons styled correctly
- [ ] Unsaved changes badge prominent
- [ ] All 29 chord options in dropdown

### Arpeggio Chain UI
- [ ] Source selector shows all options
- [ ] Note preview displays L/M/H
- [ ] Pattern dropdown scrollable
- [ ] Chain list shows all patterns
- [ ] Pattern numbers sequential
- [ ] Total notes display accurate
- [ ] Visualizer renders correctly
- [ ] Audio player controls present

---

## 🎨 Theme Testing

Test both features with different UI themes:

1. **Light Mode**
   - [ ] Harmony editor readable
   - [ ] Arpeggio chain readable

2. **Dark Mode**
   - [ ] Harmony editor readable
   - [ ] Arpeggio chain readable

3. **Color Contrast**
   - [ ] Badges legible
   - [ ] Buttons clearly visible
   - [ ] Dialogs readable

---

## 📝 Console Output Verification

### Expected Console Messages

#### Harmony Editor
```
✅ Harmony data passed to parent component
✅ Updated harmony data passed to parent component
```

#### Arpeggio Chain
```
🎵 Generating arpeggio chain...
  Source: Current Theme
  Chain length: 3
  Pattern 1: LMH × 2
  Pattern 2: HML × 1
  Pattern 3: LMHL × 2
✅ Arpeggio chain generated!
  Total notes: 18
```

---

## 🎯 Success Criteria

### Harmony Chord Editor
✅ All CRUD operations work  
✅ Undo/Redo functional  
✅ Error handling prevents invalid states  
✅ Changes persist when saved  
✅ Changes revert when discarded  
✅ Integration with existing harmony system seamless  

### Arpeggio Chain Builder
✅ All 64 patterns available  
✅ Chain building intuitive  
✅ Generation produces correct output  
✅ Playback works perfectly  
✅ Song suite integration smooth  
✅ All source types supported  

---

## 🐞 Known Issues / Limitations

### Harmony Editor
- History limited to 50 states (by design)
- Chord root notes cannot be changed (quality only)
- No batch editing (one chord at a time)

### Arpeggio Chain
- No drag-and-drop reordering (manual remove/add)
- No save/load chain templates
- No real-time preview while building

---

## ✨ Test Results Template

```
Test Date: _______________
Tester: __________________

Harmony Chord Editor:
  Basic Operations: [ ] Pass [ ] Fail
  Undo/Redo: [ ] Pass [ ] Fail
  Error Handling: [ ] Pass [ ] Fail
  Integration: [ ] Pass [ ] Fail

Arpeggio Chain Builder:
  Chain Building: [ ] Pass [ ] Fail
  Generation: [ ] Pass [ ] Fail
  Playback: [ ] Pass [ ] Fail
  Integration: [ ] Pass [ ] Fail

Overall Status: [ ] ✅ Ready [ ] ⚠️ Issues [ ] ❌ Blocked

Notes:
_________________________________
_________________________________
_________________________________
```

---

**Happy Testing! 🎉**

**Estimated Testing Time**: 15-20 minutes for complete test suite  
**Quick Smoke Test**: 5 minutes (Tests 1 only for each feature)
