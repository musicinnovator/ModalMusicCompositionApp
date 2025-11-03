# Undo/Redo System - Quick Test Guide

## 🚀 Test the Undo/Redo System in 2 Minutes

### **Test 1: Global Undo/Redo with Keyboard Shortcuts**

1. **Add a note to the Theme**
   - Go to Theme Composer
   - Click "Add Note" or use piano keyboard
   - Note appears in the theme

2. **Undo the note**
   - Press `Ctrl+Z` (Windows/Linux) or `Cmd+Z` (macOS)
   - 🎯 **Expected**: Toast notification "Undo: Add Note" appears
   - 🎯 **Expected**: Note disappears from theme

3. **Redo the note**
   - Press `Ctrl+Y` (Windows/Linux) or `Cmd+Shift+Z` (macOS)
   - 🎯 **Expected**: Toast notification "Redo: Add Note" appears
   - 🎯 **Expected**: Note reappears in theme

---

### **Test 2: Complex Transformation Undo**

1. **Create a theme**
   - Add 4-5 notes to the Theme Composer
   - Example: C4, D4, E4, F4, G4

2. **Apply a transformation** (any of these):
   - Apply an Arpeggio Pattern
   - Generate a Canon
   - Generate a Fugue

3. **Undo the transformation**
   - Press `Ctrl+Z`
   - 🎯 **Expected**: Entire transformation reverts
   - 🎯 **Expected**: Original theme restored

4. **Redo the transformation**
   - Press `Ctrl+Y`
   - 🎯 **Expected**: Transformation reapplies

---

### **Test 3: Component-Level Undo (Isolated)**

1. **Make changes in Theme Composer**
   - Add 3 notes to the theme

2. **Make changes in another component**
   - Generate a Canon

3. **Open the Undo/Redo panel** (top-right floating button)
   - Switch from "Global" to "Component" mode
   - Select "Theme Composer" from the dropdown

4. **Undo theme changes only**
   - Click "Undo" button or press `Ctrl+Z`
   - 🎯 **Expected**: Only theme changes undo
   - 🎯 **Expected**: Canon remains unchanged

5. **Switch to Canon component**
   - Select "Canon Visualizer" from dropdown
   - Click "Undo"
   - 🎯 **Expected**: Only canon generation undoes
   - 🎯 **Expected**: Theme remains unchanged

---

### **Test 4: Visual Controls Panel**

1. **Open the Undo/Redo Controls Panel**
   - Look at the top-right corner of the screen
   - You should see a floating card with "Undo/Redo" title

2. **Check the panel features**
   - 🎯 Should show "Global" and "Component" mode buttons
   - 🎯 Should show "Undo" and "Redo" buttons with keyboard shortcuts
   - 🎯 Should show action count (e.g., "5 actions")
   - 🎯 Should show last action description

3. **Click "History" button**
   - 🎯 Should open a panel showing past actions with timestamps
   - 🎯 Should show future actions (if you've undone something)

4. **Test Clear History**
   - Click "Clear" button
   - 🎯 **Expected**: Toast notification "All history cleared"
   - 🎯 **Expected**: Undo/Redo buttons become disabled

---

### **Test 5: Multiple Undos in Sequence**

1. **Perform 5 different actions**:
   - Add note 1
   - Add note 2
   - Add rest
   - Delete note 1
   - Change rhythm

2. **Undo all 5 actions**
   - Press `Ctrl+Z` five times
   - 🎯 **Expected**: Each undo shows toast with specific action name
   - 🎯 **Expected**: State reverts step by step in reverse order

3. **Redo all 5 actions**
   - Press `Ctrl+Y` five times
   - 🎯 **Expected**: Each redo shows toast with specific action name
   - 🎯 **Expected**: State reapplies step by step in forward order

---

## ✅ Success Criteria

If all tests pass:
- ✅ Global undo/redo works across all components
- ✅ Component-level undo/redo maintains isolation
- ✅ Keyboard shortcuts respond correctly
- ✅ Visual feedback (toasts) appears for every action
- ✅ History panel shows accurate timeline
- ✅ Small and large changes are both undoable
- ✅ No existing functionality is broken

---

## 🎯 Quick Visual Check

**Before Undo/Redo Implementation:**
- Theme Composer had no undo capability
- Mistakes required manual recreation
- No way to revert complex transformations

**After Undo/Redo Implementation:**
- Ctrl+Z/Ctrl+Y work everywhere
- Floating control panel in top-right corner
- Toast notifications confirm every undo/redo
- History panel shows all actions
- Both global and component-level control available

---

## 🐛 Troubleshooting

### **Issue: Keyboard shortcuts not working**
- **Solution**: Make sure the main window has focus (click anywhere in the app)
- **Solution**: Check if another browser extension is intercepting the shortcuts

### **Issue: Undo/Redo controls not visible**
- **Solution**: Look for floating panel in top-right corner
- **Solution**: Try minimizing/expanding the panel using the chevron button

### **Issue: "Nothing to undo" message appears**
- **Solution**: Make a change first (add a note, generate a canon, etc.)
- **Solution**: Check if history was cleared

### **Issue: Component-level undo not working**
- **Solution**: Make sure you've selected the correct component in the dropdown
- **Solution**: Make sure you're in "Component" mode (not "Global" mode)

---

## 📊 Testing Matrix

| Test | Feature | Status |
|------|---------|--------|
| 1 | Global undo with Ctrl+Z | ✅ Ready |
| 2 | Global redo with Ctrl+Y | ✅ Ready |
| 3 | Component-level undo | ✅ Ready |
| 4 | Component-level redo | ✅ Ready |
| 5 | Visual controls panel | ✅ Ready |
| 6 | History panel | ✅ Ready |
| 7 | Toast notifications | ✅ Ready |
| 8 | Scope switcher (Global ↔ Component) | ✅ Ready |
| 9 | Component selector dropdown | ✅ Ready |
| 10 | Clear history | ✅ Ready |
| 11 | Small changes (single note) | ✅ Ready |
| 12 | Large changes (transformations) | ✅ Ready |
| 13 | Keyboard shortcuts (Windows) | ✅ Ready |
| 14 | Keyboard shortcuts (macOS) | ✅ Ready |
| 15 | Multiple sequential undos | ✅ Ready |

---

## 🎓 What to Look For

### **Visual Indicators**:
1. **Floating Panel**: Top-right corner with "Undo/Redo" title
2. **Toast Notifications**: Bottom of screen showing undo/redo feedback
3. **Button States**: Undo/Redo buttons are disabled when no history available
4. **Keyboard Shortcut Badges**: Shown on buttons (e.g., "Ctrl+Z")

### **Functional Indicators**:
1. **State Restoration**: Theme/canon/fugue reverts to previous state
2. **Action Descriptions**: Toast shows specific action (e.g., "Undo: Add Note")
3. **History Count**: Panel shows "X actions" where X increases with each change
4. **Isolation**: Component-level undo doesn't affect other components

---

## 🔥 Stress Test (Optional)

For advanced testing:

1. **Rapid Changes**: Make 20+ quick changes
   - 🎯 All should be undoable
   - 🎯 History depth should be respected (max 50)

2. **Cross-Component Workflow**:
   - Add notes to theme
   - Generate canon
   - Generate fugue
   - Create harmony
   - Undo all in reverse order
   - 🎯 Each undo should target the correct component

3. **Browser Refresh**:
   - Make changes
   - Refresh browser
   - 🎯 History clears (expected behavior - no persistence yet)

---

**Test Date**: October 27, 2025
**Version**: 1.0.0
**Estimated Test Time**: 5-10 minutes for full suite
