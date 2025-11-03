# 🧪 Fugue Transformations - Quick Testing Guide

## 🎯 Quick Test (5 Minutes)

### **Test 1: Basic Inversion**
1. Create theme: C(60) - E(64) - G(67) - C(72)
2. Open Fugue Generator
3. Select: CLASSIC_2
4. Advanced Tab → Enable "Inversion"
5. Click "Generate Fugue"
6. ✅ **Expected**: Subject inverted around C (ascending becomes descending)
7. 🔍 **Console Check**: Look for `[INVERSION]` logs

### **Test 2: Sequence Pattern**
1. Create simple theme: C(60) - D(62) - E(64)
2. Select: CLASSIC_3
3. Advanced Tab → Enable "Sequence"
4. Generate
5. ✅ **Expected**: Theme repeated at multiple pitch levels
6. 🔍 **Console Check**: Look for `[SEQUENCE] Sequence created: X notes (5 iterations)`

### **Test 3: Ornamentation**
1. Create theme: C(60) - E(64) - G(67)
2. Select: CLASSIC_2
3. Advanced Tab → Enable "Ornamentation"
4. Generate
5. ✅ **Expected**: Decorative neighbor tones added (C-D-C-E-F-E-G-A-G)
6. 🔍 **Console Check**: Look for `[ORNAMENTATION] ... notes`

### **Test 4: Multiple Transformations**
1. Create theme: C-D-E-F-G
2. Select: CLASSIC_3
3. Enable: Inversion + Sequence + Chromatic
4. Generate
5. ✅ **Expected**: Complex transformation combination
6. 🔍 **Console Check**: See all 3 transformations applied

### **Test 5: Rhythm Transformations**
1. Create theme with 8 quarter notes
2. Select: CLASSIC_3
3. Enable: Augmentation + Diminution
4. Generate
5. ✅ **Expected**: Different note durations in different voices
6. 🔍 **Console Check**: Look for rhythm factor logs

## 🔍 Console Output Monitoring

Open browser console (F12) and watch for:

```
🎼 Generating fugue with AI engine: CLASSIC_3
🎨 Processing X transformations
📝 Variation 1/X: [TYPE]
  → Applying to Section "...", Voice X (role)
🔄 [TYPE] Starting...
✅ [TYPE] Complete
    ✅ Success: X notes, Y rhythm beats
✅ All variations applied successfully
```

## ✅ Success Criteria

| Test | Success Indicator |
|------|------------------|
| **Inversion** | Theme pitch direction reversed |
| **Retrograde** | Theme plays backward |
| **Augmentation** | Longer note durations |
| **Diminution** | Shorter note durations |
| **Truncation** | Fewer notes in theme |
| **Elision** | Middle section removed |
| **Fragmentation** | Small motif extracted |
| **Sequence** | Pattern repeats at steps |
| **Ornamentation** | Extra decorative notes |
| **Transposition** | Pitch level shifted |
| **Mode Shifting** | Modal character changed |
| **Chromatic** | Chromatic passing tones added |

## 🐛 Error Checking

### **Common Issues**

1. **"Missing mode or targetMode"**
   - ⚠️ Mode Shifting requires mode context
   - ✅ Fix: Ensure mode is selected in app

2. **"Transformation skipped"**
   - ⚠️ Scope filtering (subject/answer only)
   - ✅ Expected behavior if voice doesn't match scope

3. **"Error applying transformation"**
   - ⚠️ Check console for detailed error
   - ✅ Original theme preserved as fallback

## 🎹 Playback Verification

1. Generate fugue with transformations
2. Use integrated audio player
3. Listen for:
   - ✅ Pitch transformations (inversion, transposition)
   - ✅ Rhythm transformations (augmentation, diminution)
   - ✅ Added notes (ornamentation, chromatic)
   - ✅ Modified length (truncation, elision, fragmentation)

## 📤 Export Testing

### **MIDI Export Test**
1. Generate fugue with transformations
2. Add to Song Creator
3. Export as MIDI
4. ✅ **Verify**: Open in DAW - check notes match transformations

### **MusicXML Export Test**
1. Generate fugue with transformations
2. Export as MusicXML
3. ✅ **Verify**: Open in notation software - check correct notation

## ⚡ Performance Test

1. Enable ALL 12 transformations
2. Select CLASSIC_5 (5 voices)
3. Set 48 measures
4. Generate
5. ✅ **Expected**: Completes in <1 second
6. ✅ **Check**: No browser lag or freezing

## 📊 Comprehensive Test Matrix

| Transformation | Pitch | Rhythm | Tested | Works |
|---------------|-------|--------|--------|-------|
| Inversion | ✅ | - | [ ] | [ ] |
| Retrograde | ✅ | ✅ | [ ] | [ ] |
| Augmentation | - | ✅ | [ ] | [ ] |
| Diminution | - | ✅ | [ ] | [ ] |
| Truncation | ✅ | ✅ | [ ] | [ ] |
| Elision | ✅ | ✅ | [ ] | [ ] |
| Fragmentation | ✅ | ✅ | [ ] | [ ] |
| Sequence | ✅ | ✅ | [ ] | [ ] |
| Ornamentation | ✅ | ✅ | [ ] | [ ] |
| Transposition | ✅ | - | [ ] | [ ] |
| Mode Shifting | ✅ | - | [ ] | [ ] |
| Chromatic | ✅ | ✅ | [ ] | [ ] |

## 🚀 Advanced Testing

### **Combination Tests**
- [ ] Inversion + Retrograde (retrograde inversion)
- [ ] Augmentation + Sequence (slower sequence)
- [ ] Truncation + Ornamentation (decorated fragment)
- [ ] All pitch transforms (complex melody)
- [ ] All rhythm transforms (polyrhythmic)
- [ ] All 12 at once (maximum complexity)

### **Architecture Tests**
Test each transformation with:
- [ ] CLASSIC_2
- [ ] CLASSIC_3
- [ ] CLASSIC_4
- [ ] CLASSIC_5
- [ ] ADDITIVE
- [ ] RECURSIVE
- [ ] META
- [ ] ADAPTIVE

## 📝 Bug Report Template

If you find an issue:

```
**Transformation**: [Which type?]
**Architecture**: [Which fugue type?]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected**: [What should happen?]
**Actual**: [What actually happened?]
**Console Output**: [Copy error messages]
**Screenshot**: [If applicable]
```

## ✅ Final Checklist

Before marking complete:
- [ ] All 12 transformations tested individually
- [ ] At least 3 combination tests completed
- [ ] Playback verified for all transformations
- [ ] Console logging checked (no errors)
- [ ] Export tested (MIDI/MusicXML)
- [ ] Performance acceptable (<1s generation)
- [ ] UI responsive and intuitive
- [ ] No browser console errors

## 🎓 Learning Outcomes

After testing, you should understand:
- ✅ How each transformation affects pitch/rhythm
- ✅ Which transformations work well together
- ✅ Historical usage of each technique
- ✅ How to debug using console logs
- ✅ Integration with Song Creator and exports

---

**Happy Testing!** 🎼✨

**Remember**: This is just the beginning - more fugue types coming soon!
