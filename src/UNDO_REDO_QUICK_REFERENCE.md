# Undo/Redo System - Quick Reference Card

## 🎯 For End Users

### **Keyboard Shortcuts**

| Platform | Undo | Redo |
|----------|------|------|
| **Windows/Linux** | `Ctrl+Z` | `Ctrl+Y` |
| **macOS** | `Cmd+Z` | `Cmd+Shift+Z` |

### **Visual Controls**

Look for the **floating panel in the top-right corner**:
- 🔘 **Global** button → Undo across entire app
- 🔘 **Component** button → Undo within specific component
- 🔄 **Undo** button → Revert last action
- ↩️ **Redo** button → Reapply undone action
- 📜 **History** button → View timeline of actions
- 🗑️ **Clear** button → Clear all history

---

## 🎮 Common Use Cases

### **"I added a note by mistake"**
→ Press `Ctrl+Z` (note disappears)

### **"I deleted something I needed"**
→ Press `Ctrl+Z` (it comes back)

### **"I applied the wrong arpeggio pattern"**
→ Press `Ctrl+Z` (pattern reverts)

### **"I generated a fugue but want the old one"**
→ Press `Ctrl+Z` (previous fugue restores)

### **"I undid too much!"**
→ Press `Ctrl+Y` (redo the action)

### **"I want to undo only theme changes, not canon"**
→ Open panel, switch to "Component" mode, select "Theme Composer", click Undo

---

## 💻 For Developers

### **Quick Integration (3 steps)**

```typescript
// 1. Import the hook
import { useComponentUndoRedo } from './components/UndoRedoProvider';

// 2. Initialize in your component
const undoRedo = useComponentUndoRedo('my-component-id');

// 3. Record before state changes
const handleChange = () => {
  undoRedo.record(currentState, 'Action Description');
  // ... make your state change ...
};
```

### **Even Easier: useUndoableState**

```typescript
import { useUndoableState } from '../hooks/useUndoableState';

// Replace useState with useUndoableState
const [state, setState, undoControls] = useUndoableState(
  initialState,
  'component-id',
  'Default Action Name'
);

// setState now automatically records to history!
setState(newState, 'Optional Custom Action Name');
```

---

## 📋 Component IDs

| Component | ID String |
|-----------|----------|
| Theme Composer | `'theme-composer'` |
| Canon Visualizer | `'canon-visualizer'` |
| Fugue Visualizer | `'fugue-visualizer'` |
| Bach Variables | `'bach-variables'` |
| Harmony Composer | `'harmony-composer'` |
| Arpeggio Chain | `'arpeggio-chain'` |
| Song Composer | `'song-composer'` |

---

## 🔧 API Reference

### **useComponentUndoRedo(componentId)**

```typescript
const undoRedo = useComponentUndoRedo('component-id');

// Record state
undoRedo.record(state, 'Action Description');

// Record to both global and component
undoRedo.recordGlobalAndLocal(state, 'Big Action');

// Undo
undoRedo.undo();

// Redo
undoRedo.redo();

// Check if undo/redo available
undoRedo.canUndo // boolean
undoRedo.canRedo // boolean

// Get descriptions
undoRedo.undoDescription // string | null
undoRedo.redoDescription // string | null

// Clear history
undoRedo.clear();
```

### **useUndoableState(initialState, componentId, description)**

```typescript
const [state, setState, controls] = useUndoableState(
  initialState,
  'component-id',
  'Action Name'
);

// Use like normal useState, but with optional action description
setState(newState); // Uses default description
setState(newState, 'Custom Action'); // Uses custom description

// Access undo/redo controls
controls.undo();
controls.redo();
controls.canUndo;
controls.canRedo;
controls.clear();
```

### **useUndoRedo() (Global)**

```typescript
const undoRedo = useUndoRedo();

// Global operations
undoRedo.undoGlobal();
undoRedo.redoGlobal();
undoRedo.recordGlobal(state, 'Action');
undoRedo.globalState; // { canUndo, canRedo, ... }

// Component operations
undoRedo.undoComponent('component-id');
undoRedo.redoComponent('component-id');
undoRedo.recordComponent('component-id', state, 'Action');
undoRedo.getComponentState('component-id');

// Utilities
undoRedo.clearAll();
undoRedo.clearComponent('component-id');
undoRedo.getComponentIds(); // string[]
```

---

## 📁 File Locations

### **Core Files**
- `/lib/undo-redo-engine.ts` - Core engine
- `/components/UndoRedoProvider.tsx` - React provider
- `/components/UndoRedoControls.tsx` - UI controls
- `/hooks/useUndoableState.ts` - Helper hooks

### **Documentation**
- `/UNDO_REDO_SYSTEM_COMPLETE.md` - Full docs
- `/UNDO_REDO_QUICK_TEST.md` - Testing guide
- `/UNDO_REDO_INTEGRATION_EXAMPLES.md` - Examples
- `/UNDO_REDO_IMPLEMENTATION_SUMMARY.md` - Summary
- `/UNDO_REDO_QUICK_REFERENCE.md` - This file

---

## ⚙️ Configuration

### **UndoRedoProvider Props**

```typescript
<UndoRedoProvider
  maxHistoryDepth={50}           // Default: 50
  enableKeyboardShortcuts={true} // Default: true
  enableToastNotifications={true} // Default: true
>
```

### **UndoRedoControls Props**

```typescript
<UndoRedoControls
  position="top-right"           // or top-left, bottom-right, bottom-left
  showGlobalControls={true}      // Default: true
  showComponentControls={true}   // Default: true
  defaultComponentId="theme-composer"
/>
```

---

## 🎨 Visual Indicators

### **Toast Notifications**
- ✅ **Success** (green): "Undo: Add Note", "Redo: Apply Arpeggio"
- ℹ️ **Info** (blue): "Nothing to undo", "History cleared"
- ⚠️ **Warning** (yellow): When history limit reached

### **Button States**
- **Enabled** (default color): Action available
- **Disabled** (gray): No action available
- **Hover** (highlighted): Ready to click

### **Action Counter**
Shows number of undoable actions (e.g., "12 actions")

---

## 🐛 Troubleshooting

### **Keyboard shortcuts not working**
✓ Click somewhere in the app to ensure focus  
✓ Check if another extension is intercepting shortcuts

### **"Nothing to undo" message**
✓ Make a change first  
✓ Check if history was cleared

### **Undo doesn't restore all state**
✓ Make sure you're recording the complete state object  
✓ Include all related fields (theme, rhythm, restDurations, etc.)

### **Component undo not working**
✓ Switch to "Component" mode in the panel  
✓ Select the correct component from dropdown  
✓ Ensure the component is using the undo/redo hook

---

## 📊 Best Practices

### **Action Descriptions**

✅ **Good**: "Add Note C4", "Delete Note at position 3", "Apply Arpeggio: Ascending"  
❌ **Bad**: "Change", "Update", "Action"

### **When to Record**

✅ **DO**: Before mutations, before transformations  
❌ **DON'T**: On every render, for UI-only changes

### **Global vs Component Recording**

**Use `record()`** for small, local changes  
**Use `recordGlobalAndLocal()`** for large transformations

---

## 🎓 Examples

### **Basic Integration**

```typescript
const MyComponent = () => {
  const [theme, setTheme] = useState([]);
  const undoRedo = useComponentUndoRedo('my-component');
  
  const addNote = () => {
    undoRedo.record(theme, 'Add Note');
    setTheme([...theme, 60]);
  };
  
  return <button onClick={addNote}>Add Note</button>;
};
```

### **With Undo/Redo Buttons**

```typescript
const MyComponent = () => {
  const [theme, setTheme, undoControls] = useUndoableState(
    [],
    'my-component',
    'Theme Change'
  );
  
  return (
    <div>
      <button onClick={undoControls.undo} disabled={!undoControls.canUndo}>
        Undo
      </button>
      <button onClick={undoControls.redo} disabled={!undoControls.canRedo}>
        Redo
      </button>
    </div>
  );
};
```

---

## ✅ Feature Checklist

- [x] Global undo/redo across entire app
- [x] Component-level undo/redo for isolation
- [x] Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- [x] Visual feedback via toast notifications
- [x] Floating control panel with UI
- [x] History panel showing timeline
- [x] Scope switcher (Global ↔ Component)
- [x] Component selector dropdown
- [x] Action descriptions in history
- [x] Configurable history depth
- [x] State cloning and preservation
- [x] Easy integration hooks
- [x] Drop-in useState replacement
- [x] Comprehensive documentation
- [x] Zero breaking changes

---

## 🚀 Quick Start

### **For Users**
1. Make any change
2. Press `Ctrl+Z` to undo
3. Press `Ctrl+Y` to redo

### **For Developers**
1. Import `useComponentUndoRedo`
2. Call `undoRedo.record()` before changes
3. Done!

---

**Version**: 1.0.0  
**Status**: ✅ Complete  
**Compatibility**: 100% Backward Compatible  
**Breaking Changes**: None
