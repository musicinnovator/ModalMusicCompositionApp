# Quick Test Guide - Audio & Text Wrapping Fixes

## 🎵 Audio Playback Test (2 minutes)

### Test 1: Basic Sound
1. Open the application
2. Navigate to Theme Composer
3. Create a simple theme (or use existing)
4. Click **Play** button in Theme Player
5. **Expected Result:** 
   - ✅ You hear musical notes
   - ✅ Position counter increments
   - ✅ Console shows: `🎵 AudioContext state after resume: running`

**Status:** ✅ PASS / ❌ FAIL

---

### Test 2: Console Verification
1. Open Browser DevTools (Press F12)
2. Go to Console tab
3. Click Play in Theme Player
4. **Expected Console Output:**
   ```
   🎵 AudioContext state before resume: suspended
   ✅ Audio context resumed successfully for theme playback
   🎵 AudioContext state after resume: running
   🎵 Theme note played (soundfont): C4 for 0.45s with piano
   ```

**Status:** ✅ PASS / ❌ FAIL

---

### Test 3: Volume Control
1. Start playback
2. Move volume slider while playing
3. **Expected Result:**
   - ✅ Sound volume changes immediately
   - ✅ Console logs volume changes

**Status:** ✅ PASS / ❌ FAIL

---

## 📝 Text Wrapping Test (2 minutes)

### Test 1: Badge Wrapping
1. Look at any card with badges (e.g., Counterpoint Engine)
2. Look for badges with long text
3. **Expected Result:**
   - ✅ Badge text wraps to multiple lines if needed
   - ✅ No "..." truncation
   - ✅ All text is visible

**Before:**
```
┌────────────────────┐
│ Retrograde-Inve... │  ← Text cut off ❌
└────────────────────┘
```

**After:**
```
┌────────────────────┐
│ Retrograde-        │
│ Inversion          │  ← Wraps properly ✅
└────────────────────┘
```

**Status:** ✅ PASS / ❌ FAIL

---

### Test 2: Card Content Wrapping
1. Find a card with long mode names or technical terms
2. **Expected Result:**
   - ✅ Text wraps within card boundaries
   - ✅ No horizontal overflow
   - ✅ No scrollbars on cards

**Status:** ✅ PASS / ❌ FAIL

---

### Test 3: Multiple Badges
1. Find a card with multiple badges in a row
2. Resize browser window to narrow width
3. **Expected Result:**
   - ✅ Badges wrap to new rows
   - ✅ No badges disappear off edge
   - ✅ All badges remain visible

**Status:** ✅ PASS / ❌ FAIL

---

### Test 4: Responsive Test
1. Resize browser window from wide to narrow
2. Watch all cards and badges
3. **Expected Result:**
   - ✅ Cards adapt to width
   - ✅ Text wraps appropriately
   - ✅ No content overflow at any width

**Status:** ✅ PASS / ❌ FAIL

---

## 🚨 Common Issues

### "No sound when I click Play"

**Solution Checklist:**
- [ ] Check system volume is not muted
- [ ] Check browser tab is not muted (look for 🔇 icon)
- [ ] Click Play button again (sometimes needs interaction)
- [ ] Check console for error messages
- [ ] Try refreshing page

**Console Check:**
Look for `🎵 AudioContext state after resume: running`
- If you see `suspended` → Click Play again
- If you see `Error resuming` → Try different browser

---

### "Text still overflows"

**Solution:**
This should be rare. If it happens:

1. **Quick Fix:** Refresh the page
2. **Manual Fix:** Add class to the card:
   ```tsx
   <Card className="overflow-hidden">
   ```

---

## ✅ Expected Results Summary

### Audio (ALL TESTS SHOULD PASS)
- ✅ Sound is heard when playing theme
- ✅ Console shows AudioContext state transitions
- ✅ Volume slider affects playback volume
- ✅ No silent playback
- ✅ Error messages appear if audio fails

### Text Wrapping (ALL TESTS SHOULD PASS)
- ✅ Badges wrap to multiple lines
- ✅ Card content wraps properly
- ✅ No text cut off at edges
- ✅ No "..." truncation (unless explicitly added)
- ✅ Responsive at all screen sizes

---

## 📊 Quick Test Results

Fill this out:

**Audio Tests:**
- Basic Sound: ⬜ PASS / ⬜ FAIL
- Console Logs: ⬜ PASS / ⬜ FAIL  
- Volume Control: ⬜ PASS / ⬜ FAIL

**Text Wrapping Tests:**
- Badge Wrapping: ⬜ PASS / ⬜ FAIL
- Card Content: ⬜ PASS / ⬜ FAIL
- Multiple Badges: ⬜ PASS / ⬜ FAIL
- Responsive: ⬜ PASS / ⬜ FAIL

**Overall Status:**
- All Tests Pass: ⬜ YES / ⬜ NO
- Critical Issues: ⬜ NONE / ⬜ SEE NOTES

---

## 💡 Pro Tips

### For Audio Testing:
1. Use headphones for better hearing
2. Start with volume at 80%
3. Watch console for detailed feedback

### For Text Testing:
1. Use browser zoom (Ctrl/Cmd +) to test at different sizes
2. Try mobile device view (F12 → Device toolbar)
3. Look at cards in different tabs

---

**Test Duration:** ~4 minutes  
**See:** AUDIO_AND_TEXT_WRAPPING_FIX_COMPLETE.md for full details
