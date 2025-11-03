# Counterpoint UI Controls - Visual Testing Guide 🧪

**Quick verification checklist for the new UI controls**

---

## 🎯 Quick Test (2 minutes)

### Step 1: Navigate to Ornamentation
1. Open the application
2. Find **Counterpoint Engine Suite** card in left column
3. Click **Basic** tab (if not already selected)
4. In the **Technique** dropdown, select **"Ornamentation"**

### Step 2: Verify Appoggiatura Section Appears ✅
**You should now see:**
- 📦 **Emerald-colored box** with "Appoggiatura Type" header
- ✨ **Sparkles icon** next to the header
- 📋 **Dropdown menu** with 5 options
- 💬 **Help text** at bottom explaining how it works

**If you see this → Appoggiatura UI is working!**

### Step 3: Verify Custom Patterns Section Appears ✅
**Scroll down slightly. You should see:**
- 📦 **Second emerald-colored box** with "Custom Ornament Patterns" header
- ✨ **Sparkles icon** next to the header
- 📋 **Dropdown selector** with pattern options
- 🏷️ **Three badges** showing built-in patterns:
  - `Trill (0, +1, 0, +1) [0,+1,0,+1]`
  - `Mordent (0, -1, 0) [0,-1,0]`
  - `Turn (+1, 0, -1, 0) [+1,0,-1,0]`
- ➕ **"Add New Pattern" button** at bottom
- 💬 **Help text** explaining custom patterns

**If you see this → Custom Pattern UI is working!**

---

## 🧪 Detailed Feature Testing

### A. Appoggiatura Dropdown Test

**Open the dropdown and verify 5 options:**

1. **None** - "No appoggiaturas"
2. **Step Above** - "Full step approach from above (+2 semitones)"
3. **Step Below** - "Full step approach from below (-2 semitones)"  
4. **Half-Step Above** - "Half step approach from above (+1 semitone)"
5. **Half-Step Below** - "Half step approach from below (-1 semitone)"

**Expected:** All 5 options visible with descriptions

---

### B. Pattern Selector Test

**Open the pattern dropdown and verify:**

1. **None** - "No custom pattern"
2. **Trill (0, +1, 0, +1)** - Shows intervals in monospace
3. **Mordent (0, -1, 0)** - Shows intervals in monospace
4. **Turn (+1, 0, -1, 0)** - Shows intervals in monospace

**Expected:** 4 options total (None + 3 built-in patterns)

---

### C. Pattern Manager Badge Test

**Look at the badge display under "Manage Patterns:"**

**You should see 3 badges:**
1. `Trill (0, +1, 0, +1) [0,+1,0,+1]` - **Secondary variant** (gray background)
2. `Mordent (0, -1, 0) [0,-1,0]` - **Secondary variant** (gray background)
3. `Turn (+1, 0, -1, 0) [+1,0,-1,0]` - **Secondary variant** (gray background)

**Important:** Built-in patterns should **NOT** have an X delete button

**Expected:** 3 badges, no delete buttons on any of them

---

### D. Add New Pattern Test

**Click "Add New Pattern" button:**

1. **First Prompt:** "Enter pattern name..."
   - Type: `My Test Pattern`
   - Click OK

2. **Second Prompt:** "Enter pattern intervals..."
   - Type: `0,1,2,1,0`
   - Click OK

**Expected Results:**
- ✅ Toast notification: "Created pattern: My Test Pattern"
- ✅ New badge appears: `My Test Pattern [0,+1,+2,+1,0]`
- ✅ **This badge HAS an X button** (outline variant)
- ✅ Dropdown auto-selects "My Test Pattern"

---

### E. Delete Custom Pattern Test

**Find your custom pattern badge (should have X button):**

1. Click the **X button** on "My Test Pattern" badge
2. Confirm it disappears
3. Check dropdown - should revert to "None"

**Expected:**
- ✅ Toast notification: "Deleted pattern: My Test Pattern"
- ✅ Badge removed from display
- ✅ Dropdown shows "None" again

**Try to delete built-in pattern:**
- Built-in patterns (Trill, Mordent, Turn) have **NO X button**
- Cannot be deleted ✅

---

### F. Validation Tests

#### Test 1: Empty Pattern Name
1. Click "Add New Pattern"
2. Leave name blank or click Cancel
3. **Expected:** Warning toast: "Pattern name cannot be empty"

#### Test 2: Duplicate Pattern Name  
1. Click "Add New Pattern"
2. Type: `Trill` (same as built-in)
3. **Expected:** Error toast: "Pattern name already exists"

#### Test 3: Empty Intervals
1. Click "Add New Pattern"
2. Type valid name: `Test`
3. Leave intervals blank or click Cancel
4. **Expected:** Warning toast: "Pattern intervals cannot be empty"

#### Test 4: Invalid Intervals
1. Click "Add New Pattern"
2. Type valid name: `Test`
3. Type invalid intervals: `abc,def`
4. **Expected:** Error toast with message about invalid numbers

#### Test 5: Out of Range
1. Click "Add New Pattern"
2. Type valid name: `Test`
3. Type: `0,50,-20` (out of ±12 range)
4. **Expected:** Error toast: "Interval out of range"

#### Test 6: Too Long Pattern
1. Click "Add New Pattern"
2. Type valid name: `Long Pattern`
3. Type: `0,1,2,3,4,5,6,7,8,9,10` (11 intervals)
4. **Expected:** 
   - Warning toast: "Pattern too long, truncating to 8 intervals"
   - Pattern created with first 8 intervals only

---

### G. Functional Integration Test

**Test the complete workflow:**

1. **Select Ornamentation technique**
2. **Choose Appoggiatura:** "Half-Step Above"
3. **Select Pattern:** "Trill"
4. **Generate Counterpoint** (click button at bottom)

**Expected:**
- ✅ Counterpoint generated successfully
- ✅ Toast shows success message
- ✅ New counterpoint appears in history
- ✅ Backend receives both appoggiatura and pattern parameters

5. **Create Custom Pattern:**
   - Name: `Chromatic Run`
   - Intervals: `0,1,2,3,2,1,0`

6. **Generate Counterpoint with custom pattern**

**Expected:**
- ✅ Counterpoint uses your custom pattern
- ✅ Success toast appears
- ✅ Melody is ornamented according to pattern

---

## 🎨 Visual Appearance Checklist

### Color Scheme ✅
- [ ] **Emerald background** on both sections (light emerald in light mode)
- [ ] **Emerald borders** around sections
- [ ] **Sparkles icon** in emerald color
- [ ] **Text** in emerald-900 (dark) or emerald-100 (light mode text)

### Layout ✅
- [ ] Sections appear **only when Ornamentation is selected**
- [ ] Sections appear **after Inversion Axis section**
- [ ] Sections appear **before Generate Button**
- [ ] **Appoggiatura section first**, then **Pattern section**
- [ ] Both sections have **similar structure** (icon, label, dropdown, help text)

### Badges ✅
- [ ] Built-in patterns: **Secondary variant** (gray background)
- [ ] Custom patterns: **Outline variant** (white background with border)
- [ ] Built-in patterns: **No X button**
- [ ] Custom patterns: **X button visible**
- [ ] Intervals shown in **monospace font** with brackets `[0,+1,0]`

### Buttons ✅
- [ ] "Add New Pattern" button: **Full width**
- [ ] Button shows **Plus icon** before text
- [ ] Button has **emerald hover effect**

---

## 🐛 Known Edge Cases (Should Handle Gracefully)

### Pattern Creation
- ✅ Empty name → Warning toast
- ✅ Duplicate name → Error toast
- ✅ Empty intervals → Warning toast
- ✅ Invalid number format → Error toast
- ✅ Out of range intervals → Error toast
- ✅ Very long pattern → Truncate + warning toast

### Pattern Deletion
- ✅ Delete custom pattern → Removes and deselects
- ✅ Built-in patterns → No delete button shown
- ✅ Delete currently selected → Auto-deselect to "None"

### UI Visibility
- ✅ Sections hidden when other techniques selected
- ✅ Sections visible only for Ornamentation
- ✅ Responsive layout on mobile/desktop

---

## ✅ Success Criteria

**All tests pass if:**

1. ✅ **Appoggiatura section visible** when Ornamentation selected
2. ✅ **5 appoggiatura options** in dropdown
3. ✅ **Custom Pattern section visible** when Ornamentation selected
4. ✅ **3 built-in patterns** shown without delete buttons
5. ✅ **Add Pattern button** creates new patterns
6. ✅ **Delete button** (X) works on custom patterns only
7. ✅ **Validation** prevents invalid inputs
8. ✅ **Help text** explains features
9. ✅ **Emerald color scheme** matches design
10. ✅ **Generate button** uses selected parameters

---

## 🎉 If All Tests Pass

**Congratulations!** Your Counterpoint Engine UI is **fully functional** with:

- ✨ Complete appoggiatura control system
- ✨ Full custom ornament pattern management
- ✨ Professional validation and error handling  
- ✨ Beautiful emerald-themed UI
- ✨ Protection for built-in patterns
- ✨ Seamless backend integration

**You can now create expressive, ornamented counterpoint with complete control!** 🎵

---

## 🚨 Troubleshooting

### "I don't see the sections"
- Make sure you selected **"Ornamentation"** technique
- Scroll down - sections appear after Inversion Axis
- Check browser console for errors

### "Built-in patterns have X buttons"
- This is a bug - check the code
- Built-in IDs should be: 'trill', 'mordent', 'turn'
- `isBuiltIn` check should prevent X from rendering

### "Add Pattern does nothing"
- Check browser console for errors
- Verify prompts are appearing
- Check toast notifications for error messages

### "Dropdown is empty"
- State initialization issue
- Check `customOrnamentPatterns` state
- Should have 3 built-in patterns on mount

---

*Quick test complete! Now test the actual audio output by generating counterpoint with these features.* 🎵
