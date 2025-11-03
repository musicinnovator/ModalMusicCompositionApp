# Undo/Redo Draggable Controls - Quick Test Guide

## 🎯 Quick 2-Minute Test

### **Test 1: Verify Default Position Changed**

1. **Refresh the page**
2. **Look for the Undo/Redo panel**
   - **Expected**: Panel is in **bottom-left** corner
   - **Before fix**: Was in top-right (blocking preferences)
3. **Try to access Preferences** (top-right)
   - **Expected**: ✅ Preferences is now fully accessible
   - **Before fix**: ❌ Was blocked by Undo/Redo panel

---

### **Test 2: Verify Draggable Functionality**

1. **Find the Undo/Redo panel** (bottom-left by default)

2. **Hover over the header** (where it says "Undo/Redo")
   - **Expected**: See grip icon (⋮⋮) on the left
   - **Expected**: Cursor changes to grab hand (🖐)

3. **Click and hold** on the header

4. **Drag the panel** to a new location (e.g., top-left)
   - **Expected**: Panel follows your mouse
   - **Expected**: Cursor changes to grabbing hand (✊)
   - **Expected**: Shadow effect gets stronger

5. **Release mouse button**
   - **Expected**: Panel stays in new position

---

### **Test 3: Verify Position Persistence**

1. **After dragging** the panel to a new location

2. **Refresh the page** (F5 or Cmd/Ctrl+R)

3. **Check panel location**
   - **Expected**: ✅ Panel is in the SAME position you moved it to
   - **Not expected**: ❌ Panel returning to default position

4. **This means position is saved to localStorage!** ✅

---

### **Test 4: Verify Reset Function**

1. **After dragging** the panel, look at the header

2. **Check for reset button**
   - **Expected**: Small X button appears (next to minimize button)
   - **Only visible after panel has been moved**

3. **Click the reset X button**
   - **Expected**: Panel instantly returns to bottom-left (default)
   - **Expected**: Reset X button disappears

4. **Refresh page**
   - **Expected**: Panel is still at default position (bottom-left)
   - **This confirms localStorage was cleared**

---

### **Test 5: Verify Minimize Still Works**

1. **Click the chevron button** (▼) in header

2. **Panel should collapse**
   - **Expected**: Only header visible
   - **Expected**: Content hidden

3. **Click chevron again** (now points down)
   - **Expected**: Panel expands back

4. **Drag the minimized panel**
   - **Expected**: Still draggable when minimized!

---

## ✅ Success Criteria

| Test | Expected Result | Status |
|------|----------------|--------|
| Default position | Bottom-left (not blocking preferences) | ✅ |
| Preferences accessible | Can click preferences without moving panel | ✅ |
| Grip icon visible | ⋮⋮ icon in header | ✅ |
| Drag cursor | Changes to grab/grabbing | ✅ |
| Panel drags smoothly | Follows mouse cursor | ✅ |
| Shadow effect | Enhances during drag | ✅ |
| Position persists | Same location after refresh | ✅ |
| Reset button appears | Shows after first drag | ✅ |
| Reset works | Returns to default position | ✅ |
| Minimize works | Panel collapses/expands | ✅ |

---

## 🎮 Visual Test

### **Before Fix**
```
┌────────────────────────────────┐
│ [🔧 Prefs] [📦 Undo/Redo]     │ ← BLOCKING!
│            ╔══════════════╗    │
│            ║ Undo  Redo   ║    │
│            ╚══════════════╝    │
│                                │
│  Main Content Area             │
│                                │
└────────────────────────────────┘
```

### **After Fix - Default**
```
┌────────────────────────────────┐
│ [🔧 Prefs] ✅ Accessible!       │
│                                │
│  Main Content Area             │
│                                │
│ ╔══════════════╗               │
│ ║ ⋮⋮ Undo/Redo ║ ← Default pos │
│ ╚══════════════╝               │
└────────────────────────────────┘
```

### **After Fix - User Dragged**
```
┌────────────────────────────────┐
│ ╔══════════════╗                │
│ ║ ⋮⋮ Undo/Redo ║ ← User chose   │
│ ╚══════════════╝    this spot!  │
│                                │
│  Main Content Area             │
│                                │
└────────────────────────────────┘
```

---

## 🔍 Detailed Drag Test

### **Step-by-Step Drag**

1. **Locate panel** (bottom-left initially)
2. **Move mouse over header**
   - See: Grip icon (⋮⋮)
   - See: Cursor becomes grab hand
3. **Press and hold mouse button**
   - See: Cursor becomes grabbing hand
   - See: Shadow gets stronger
4. **Move mouse around screen**
   - See: Panel follows cursor smoothly
   - Works in all directions
5. **Release mouse button**
   - See: Panel stays in place
   - See: Shadow returns to normal
   - See: Reset X button appears in header

### **Where Can You Drag It?**

✅ **Anywhere on screen**:
- Top-left corner
- Top-right corner
- Bottom-right corner
- Bottom-left corner
- Middle of screen
- Anywhere in between!

**Panel stays where you put it!**

---

## 🧪 Advanced Tests

### **Test: Multiple Drags**

1. Drag panel to top-left
2. Refresh page → Should be at top-left
3. Drag panel to center
4. Refresh page → Should be at center
5. Click reset
6. Refresh page → Should be at bottom-left (default)

**Result**: ✅ Position updates correctly each time

---

### **Test: Drag While Minimized**

1. Click minimize button (▼)
2. Panel collapses to just header
3. Try dragging the minimized panel
4. **Expected**: ✅ Still draggable!
5. Expand panel again
6. **Expected**: ✅ Still in dragged position

---

### **Test: Reset Clears Storage**

1. Drag panel somewhere
2. Open browser DevTools (F12)
3. Go to Application → Local Storage
4. Find key: `undoRedoControlsPosition`
5. **Expected**: JSON value with x, y coordinates
6. Click reset button
7. Check localStorage again
8. **Expected**: Key is removed!

---

### **Test: Preferences Access**

1. **Without moving panel** (default bottom-left)
2. Try to click Preferences button (top-right area)
3. **Expected**: ✅ Fully accessible
4. **Before fix**: ❌ Was blocked

---

## 🐛 What to Check If Something's Wrong

### **Panel not draggable?**

Check:
- [ ] Grip icon (⋮⋮) visible in header?
- [ ] Cursor changes to grab hand on hover?
- [ ] Any JavaScript errors in console?

---

### **Position not saving?**

Check:
- [ ] Browser allows localStorage?
- [ ] Not in private/incognito mode?
- [ ] Check DevTools → Application → Local Storage

---

### **Panel disappeared?**

Solution:
1. Open browser console (F12)
2. Type: `localStorage.removeItem('undoRedoControlsPosition')`
3. Press Enter
4. Refresh page
5. Panel should be back at default (bottom-left)

---

### **Reset button not showing?**

Expected behavior:
- Reset button ONLY shows AFTER you drag panel
- If panel is at default position, no reset button
- This is normal!

To see reset button:
1. Drag panel somewhere
2. Reset button will appear

---

## 📊 Quick Checklist

Before starting test:
- [ ] Page loaded successfully
- [ ] Undo/Redo panel visible

After Test 1:
- [ ] Panel is at bottom-left (default)
- [ ] Preferences is accessible

After Test 2:
- [ ] Panel dragged successfully
- [ ] Visual feedback correct

After Test 3:
- [ ] Position persisted after refresh

After Test 4:
- [ ] Reset button appeared
- [ ] Reset worked correctly

After Test 5:
- [ ] Minimize/expand works
- [ ] Can drag while minimized

---

## ✅ Final Verification

**All working if**:
1. ✅ Panel starts at bottom-left
2. ✅ Preferences not blocked
3. ✅ Panel is draggable
4. ✅ Position saves after refresh
5. ✅ Reset returns to default
6. ✅ Minimize/expand works

**Fix is complete!** 🎉

---

## 🎯 Common Use Cases

### **Use Case 1: Clear Workspace**

**Scenario**: Panel blocking your work area

**Solution**:
1. Drag panel to edge of screen
2. Or minimize it (click ▼)
3. Position is saved!

---

### **Use Case 2: Frequently Use Undo/Redo**

**Scenario**: Want panel near main work area

**Solution**:
1. Drag panel to convenient location
2. Near theme composer, or canon controls
3. Easy access, position remembered!

---

### **Use Case 3: Multiple Monitors**

**Scenario**: Want panel on specific monitor

**Solution**:
1. Drag panel to desired monitor
2. Position saves for that monitor setup
3. If monitors change, use reset button

---

**Test Duration**: 2-5 minutes  
**Status**: ✅ Ready to test  
**Expected Result**: Fully draggable controls that don't block UI
