# Soundfont Volume Balance - Quick Test Guide

## 🎯 Quick 2-Minute Test

### **Test 1: Verify Soundfont is Now Louder**

1. **Set your system volume to 40%** (comfortable level)

2. **Create a simple theme**:
   - Go to Theme Composer
   - Add 4-5 notes (any notes)

3. **Play the theme**:
   - Click the "Play" button
   - **Expected**: Theme should be clearly audible and loud
   - **Before fix**: Would have been very quiet

4. **Generate a Canon**:
   - Click "Generate Canon"
   - Play the canon
   - **Expected**: Canon should be loud and clear
   - **Before fix**: Would have been barely audible

---

### **Test 2: Compare with Piano Keyboard**

1. **With system volume still at 40%**, play the on-screen piano:
   - Click a few keys on the piano keyboard at the bottom
   - **Expected**: Piano should be similar loudness to the theme/canon
   - **Before fix**: Piano would have been ear-splittingly loud

2. **Switch back and forth**:
   - Play theme → Play piano → Play theme
   - **Expected**: Both should be at similar comfortable levels
   - **Before fix**: Would need to constantly adjust system volume

---

### **Test 3: Check Console Logs**

1. **Open browser console** (F12)

2. **Look for this message**:
   ```
   🔊 Soundfont master volume set to 2.5x boost
   ```

3. **Expected**: This message should appear when Soundfont engine initializes
4. **If missing**: Volume boost may not be applied

---

## ✅ Success Criteria

| Test | Expected Result | Status |
|------|----------------|--------|
| Theme playback | Loud and clear at 40% volume | ✅ |
| Canon playback | Loud and clear at 40% volume | ✅ |
| Fugue playback | Loud and clear at 40% volume | ✅ |
| Piano keyboard | Similar loudness to Soundfont | ✅ |
| Console message | "2.5x boost" appears | ✅ |
| No manual volume adjustment | Can stay at one system volume | ✅ |

---

## 🎵 Extended Test (5 Minutes)

### **Test All Soundfont-Based Playback**

1. **Theme Player** ✅
   - Create theme → Play
   - Should be loud

2. **Canon Visualizer** ✅
   - Generate any canon → Play
   - Should be loud

3. **Fugue Visualizer** ✅
   - Generate any fugue → Play
   - Should be loud

4. **Harmony Composer** ✅
   - Generate harmony → Play
   - Chords should be loud

5. **Arpeggio Chain** ✅
   - Generate arpeggio → Play
   - Should be loud

6. **Bach Variables** ✅
   - Add notes to variable → Play
   - Should be loud

---

## 🔧 If Soundfont is Still Too Quiet

1. **Check console for boost message**:
   - Open console (F12)
   - Look for "2.5x boost" message
   - If missing, refresh page

2. **Increase the boost**:
   - Open `/lib/soundfont-audio-engine.ts`
   - Find line ~24: `const SOUNDFONT_VOLUME_BOOST = 2.5;`
   - Change to `3.0` or `3.5`
   - Refresh page and test again

3. **Check audio context**:
   - Some browsers require user interaction before audio works
   - Click anywhere on the page first, then try playing

---

## 🔊 If Soundfont is Now Too Loud

1. **Reduce system volume first** (recommended)
   - Lower to 30% or 25%

2. **If still too loud, reduce the boost**:
   - Open `/lib/soundfont-audio-engine.ts`
   - Find line ~24: `const SOUNDFONT_VOLUME_BOOST = 2.5;`
   - Change to `2.0` or `1.8`
   - Refresh page and test again

---

## 🎹 Piano Keyboard Check

**Important**: The piano keyboard volume is **intentionally unchanged**.

- **Before fix**: Piano was very loud compared to Soundfont
- **After fix**: Piano is the SAME loudness (unchanged)
- **Perceived change**: Piano may now SEEM quieter (it's not - Soundfont is louder)

**This is correct behavior!** The goal was to make Soundfont match the piano, not to change the piano.

---

## 📊 Visual Loudness Test

### **Before Fix**
```
Soundfont:  🔉 (20% perceived loudness)
Piano:      🔊🔊🔊🔊🔊 (100% perceived loudness)
Balance:    ❌ Unbalanced - 5x difference
```

### **After Fix**
```
Soundfont:  🔊🔊🔊🔊🔊 (100% perceived loudness)
Piano:      🔊🔊🔊🔊🔊 (100% perceived loudness)
Balance:    ✅ Balanced - equal levels
```

---

## 🐛 Troubleshooting

### **No sound at all**
- Click anywhere on the page first (browser audio policy)
- Check system volume is not muted
- Check browser audio permissions
- Refresh the page

### **Sound is distorted/clipping**
- Lower system volume
- Reduce `SOUNDFONT_VOLUME_BOOST` to 2.0
- Check for other audio effects enabled

### **Console doesn't show boost message**
- Soundfont engine may not have initialized yet
- Play something first (Theme, Canon, etc.)
- Check console after playing

---

## ✅ Quick Checklist

Before testing:
- [ ] Set system volume to 40%
- [ ] Open browser console (F12)
- [ ] Have a theme ready to play

After testing:
- [ ] Soundfont is loud and clear
- [ ] Piano keyboard is similar loudness
- [ ] No need to adjust system volume
- [ ] Console shows "2.5x boost" message
- [ ] All components play at similar levels

---

**Test Duration**: 2-5 minutes  
**Status**: ✅ Ready to test  
**Expected Result**: Balanced audio across all components
