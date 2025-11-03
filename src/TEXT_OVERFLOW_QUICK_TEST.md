# Quick Test Guide - App-Wide Text Overflow Fix

## 🎯 2-Minute Visual Check

### Test 1: Harmony Controls (Your Reported Issue)
1. Navigate to **Harmony Controls**
2. Look for the **"Harmonize"** button
3. **Expected:** ✅ Full button text visible, no cut-off
4. **Status:** ⬜ PASS / ⬜ FAIL

---

### Test 2: Long Button Names
1. Look for any button with long text throughout app
2. Examples:
   - "Apply Advanced Counterpoint"
   - "Generate Fugue with Transformations"
   - "Export to MIDI with Harmony"
3. **Expected:** ✅ Button text wraps to multiple lines if needed
4. **Status:** ⬜ PASS / ⬜ FAIL

---

### Test 3: Mode/Scale Selectors
1. Open any dropdown with mode names
2. Look for long mode names like:
   - "Hypolydian-Mixolydian-Per-Tonos"
   - "Retrograde-Inversion-Augmentation"
3. **Expected:** ✅ Full text visible in dropdown trigger
4. **Expected:** ✅ Full text visible in dropdown options
5. **Status:** ⬜ PASS / ⬜ FAIL

---

### Test 4: Badges
1. Find cards with multiple badges (Counterpoint Engine, Canon Controls)
2. Look for badges with long text
3. **Expected:** ✅ Badges wrap to multiple lines
4. **Expected:** ✅ No "..." truncation
5. **Status:** ⬜ PASS / ⬜ FAIL

---

### Test 5: Accordion Titles
1. Open any accordion section
2. Look for sections with long titles
3. **Expected:** ✅ Titles wrap to multiple lines
4. **Expected:** ✅ Chevron icon stays aligned at top-right
5. **Status:** ⬜ PASS / ⬜ FAIL

---

## 📱 Responsive Test (1 minute)

### Test 6: Narrow Window
1. Resize browser window to narrow width (~400px)
2. Navigate through different pages
3. **Expected:** ✅ All text wraps appropriately
4. **Expected:** ✅ No horizontal scrolling
5. **Expected:** ✅ No text cut off at any width
6. **Status:** ⬜ PASS / ⬜ FAIL

---

## 🔍 Specific Areas to Check

### Priority 1: Most Likely to Have Long Text
- [ ] **Mode Selector** - Mode names can be very long
- [ ] **Counterpoint Technique Selector** - Technical terms
- [ ] **Canon Type Selector** - "Retrograde-Inversion-Per-Tonos"
- [ ] **Harmony Quality Selector** - Chord quality names
- [ ] **Transform Buttons** - "Apply Retrograde Inversion"

### Priority 2: Button-Heavy Pages
- [ ] **Harmony Controls** - Multiple action buttons
- [ ] **Fugue Generator** - Entry control buttons
- [ ] **Canon Controls** - Canon type buttons
- [ ] **Theme Composer** - Tool buttons
- [ ] **File Exporter** - Export format buttons

### Priority 3: Information Display
- [ ] **Cards** - Titles and descriptions
- [ ] **Alerts** - Warning/info messages
- [ ] **Tabs** - Tab labels
- [ ] **Badges** - Status and feature badges

---

## ✅ Expected Results

### All Components Should:
- ✅ Display full text (no truncation)
- ✅ Wrap to multiple lines if needed
- ✅ Expand vertically to fit content
- ✅ Maintain icon alignment
- ✅ Stay within container boundaries
- ✅ No "..." ellipsis (unless explicitly added)

### Visual Characteristics:
- ✅ Text centered in buttons
- ✅ Icons don't shrink
- ✅ Consistent spacing
- ✅ Clean line breaks
- ✅ Hyphenation for long words (if supported by browser)

---

## 🚨 Common Issues & Quick Fixes

### Issue: "Some text still cut off"

**Quick Fix:**
Add to that specific element:
```tsx
className="force-wrap"
```

### Issue: "Button looks too wide"

**This is normal** - button expands to show full text.

If you need to limit width:
```tsx
className="max-w-[200px]"
```

### Issue: "Layout looks different"

**This is expected** - previously hidden text now visible.

**Is this a problem?** No - users can now read everything!

---

## 📊 Quick Test Results Form

**Date:** _________  
**Tester:** _________

### Core Tests
- [ ] Harmony Controls Button: ✅ PASS / ❌ FAIL
- [ ] Long Buttons: ✅ PASS / ❌ FAIL
- [ ] Mode Selectors: ✅ PASS / ❌ FAIL
- [ ] Badges: ✅ PASS / ❌ FAIL
- [ ] Accordions: ✅ PASS / ❌ FAIL
- [ ] Responsive: ✅ PASS / ❌ FAIL

### Overall Status
- All Tests Pass: ⬜ YES / ⬜ NO
- Critical Issues: ⬜ NONE / ⬜ SEE NOTES

### Notes
```
_________________________________
_________________________________
_________________________________
```

---

## 💡 What to Look For

### ✅ Good Signs
- Button text fully visible
- Dropdown options readable
- Badges show complete text
- No "..." anywhere
- Clean text wrapping

### ❌ Bad Signs
- Text cut off with "..."
- Button text overflows container
- Dropdown options truncated
- Badges showing partial text
- Horizontal scrolling

---

## 🎨 Visual Examples

### Button - Before
```
┌──────────────────┐
│ 🪄 Harmonizin... │  ❌ Cut off
└──────────────────┘
```

### Button - After
```
┌──────────────────┐
│ 🪄 Harmonizing...│  ✅ Full text
└──────────────────┘
```

Or with wrapping:
```
┌──────────────────┐
│ 🪄 Apply         │
│    Advanced      │  ✅ Wraps nicely
│    Counterpoint  │
└──────────────────┘
```

### Select - Before
```
┌────────────────────────┐
│ Hypolydian-Mixoly... ▼ │  ❌ Truncated
└────────────────────────┘
```

### Select - After
```
┌────────────────────────┐
│ Hypolydian-            │
│ Mixolydian-Per-Tonos ▼ │  ✅ Wraps
└────────────────────────┘
```

---

## ⏱️ Test Duration

- **Quick Visual Check:** 2 minutes
- **Responsive Test:** 1 minute
- **Specific Areas:** 3 minutes
- **Total:** ~6 minutes

---

## 📚 Full Documentation

See `TEXT_OVERFLOW_COMPREHENSIVE_FIX.md` for:
- Complete technical details
- All files modified
- Before/after examples
- Troubleshooting guide
- Migration guide

---

**Quick Start:** Just run through Tests 1-6 above (2 minutes total)  
**Comprehensive:** Check all Priority 1-3 areas (6 minutes total)  
**Report Issues:** If any test fails, note the specific component and see troubleshooting guide
