# Undo/Redo Integration Examples

## 🎯 How to Add Undo/Redo to Any Component

This guide shows **concrete examples** of integrating the undo/redo system into existing components **without modifying their core logic**.

---

## Example 1: Theme Composer (Recommended Approach)

### **Step 1: Import the Hook**

```typescript
// At the top of ThemeComposer.tsx
import { useComponentUndoRedo } from './UndoRedoProvider';
```

### **Step 2: Initialize the Hook**

```typescript
export function ThemeComposer({ 
  theme, 
  onThemeChange, 
  // ... other props
}: ThemeComposerProps) {
  // Add this line
  const undoRedo = useComponentUndoRedo('theme-composer');
  
  // Rest of existing code remains unchanged...
}
```

### **Step 3: Record State Before Changes**

**Example: Adding a Note**

```typescript
// BEFORE (existing code)
const addNote = () => {
  const newNote = pitchClassToMidiNote(selectedPitch);
  let updatedTheme = [...theme, newNote];
  onThemeChange(updatedTheme);
};

// AFTER (with undo/redo)
const addNote = () => {
  // Record state BEFORE the change
  undoRedo.record(
    { 
      theme, 
      restDurations, 
      themeRhythm 
    }, 
    'Add Note'
  );
  
  const newNote = pitchClassToMidiNote(selectedPitch);
  let updatedTheme = [...theme, newNote];
  onThemeChange(updatedTheme);
};
```

**Example: Deleting a Note**

```typescript
// BEFORE (existing code)
const removeNote = (index: number) => {
  const newTheme = theme.filter((_, i) => i !== index);
  onThemeChange(newTheme);
};

// AFTER (with undo/redo)
const removeNote = (index: number) => {
  // Record state BEFORE the change
  undoRedo.record(
    { 
      theme, 
      restDurations, 
      themeRhythm 
    }, 
    `Delete Note at position ${index + 1}`
  );
  
  const newTheme = theme.filter((_, i) => i !== index);
  onThemeChange(newTheme);
};
```

**Example: Applying Arpeggio Pattern (Large Change)**

```typescript
// BEFORE (existing code)
const handlePatternApply = (pattern: ArpeggioPattern) => {
  const transformed = applyArpeggioToTheme(theme, pattern);
  onThemeChange(transformed.notes);
  toast.success(`Applied ${pattern.name} pattern`);
};

// AFTER (with undo/redo)
const handlePatternApply = (pattern: ArpeggioPattern) => {
  // Record to BOTH global and component history (large change)
  undoRedo.recordGlobalAndLocal(
    { 
      theme, 
      restDurations, 
      themeRhythm,
      bachVariables // if affected
    }, 
    `Apply Arpeggio: ${pattern.name}`
  );
  
  const transformed = applyArpeggioToTheme(theme, pattern);
  onThemeChange(transformed.notes);
  toast.success(`Applied ${pattern.name} pattern`);
};
```

### **Step 4: Add Undo/Redo Buttons (Optional)**

```typescript
return (
  <Card>
    {/* Existing header */}
    <div className="flex gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={undoRedo.undo}
        disabled={!undoRedo.canUndo}
        title={undoRedo.undoDescription || 'Undo'}
      >
        <Undo2 className="w-4 h-4 mr-1" />
        Undo
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={undoRedo.redo}
        disabled={!undoRedo.canRedo}
        title={undoRedo.redoDescription || 'Redo'}
      >
        <Redo2 className="w-4 h-4 mr-1" />
        Redo
      </Button>
      {undoRedo.historyLength > 0 && (
        <Badge variant="secondary" className="ml-2">
          {undoRedo.historyLength} actions
        </Badge>
      )}
    </div>
    
    {/* Rest of existing component */}
  </Card>
);
```

---

## Example 2: Canon Visualizer

### **Integration Points**

```typescript
import { useComponentUndoRedo } from './UndoRedoProvider';

export function CanonVisualizer({ ... }: CanonVisualizerProps) {
  const undoRedo = useComponentUndoRedo('canon-visualizer');
  
  // Before generating a canon
  const handleGenerateCanon = () => {
    undoRedo.recordGlobalAndLocal(
      { 
        canonResult, 
        canonParams,
        selectedCanonType 
      }, 
      `Generate ${selectedCanonType} Canon`
    );
    
    // Existing canon generation logic...
    const result = canonEngine.generateCanon(theme, params);
    setCanonResult(result);
  };
  
  // Before changing interval
  const handleIntervalChange = (interval: number) => {
    undoRedo.record(
      { canonParams }, 
      `Change Canon Interval to ${interval}`
    );
    
    setCanonParams({ ...canonParams, interval });
  };
  
  // Before changing entry delay
  const handleDelayChange = (delay: number) => {
    undoRedo.record(
      { canonParams }, 
      `Change Entry Delay to ${delay} beats`
    );
    
    setCanonParams({ ...canonParams, entryDelay: delay });
  };
}
```

---

## Example 3: Fugue Generator

### **Integration Points**

```typescript
import { useComponentUndoRedo } from './UndoRedoProvider';

export function FugueVisualizer({ ... }: FugueVisualizerProps) {
  const undoRedo = useComponentUndoRedo('fugue-visualizer');
  
  // Before generating a fugue (LARGE CHANGE - use global recording)
  const handleGenerateFugue = () => {
    undoRedo.recordGlobalAndLocal(
      { 
        fugueResult, 
        fugueParams,
        selectedArchitecture,
        selectedMode,
        selectedKeySignature
      }, 
      `Generate ${selectedArchitecture} Fugue`
    );
    
    // Existing fugue generation logic...
    const result = fugueEngine.generateFugue(theme, params);
    setFugueResult(result);
  };
  
  // Before applying transformation
  const handleApplyTransformation = (
    voiceIndex: number, 
    transformation: TransformationType
  ) => {
    undoRedo.record(
      { fugueResult }, 
      `Apply ${transformation} to Voice ${voiceIndex + 1}`
    );
    
    // Apply transformation...
    const newResult = applyTransformationToVoice(
      fugueResult, 
      voiceIndex, 
      transformation
    );
    setFugueResult(newResult);
  };
}
```

---

## Example 4: Bach Variables

### **Integration Points**

```typescript
import { useComponentUndoRedo } from './UndoRedoProvider';

export function BachLikeVariables({ ... }: BachVariablesProps) {
  const undoRedo = useComponentUndoRedo('bach-variables');
  
  // Before adding a variable
  const handleAddVariable = (variableName: BachVariableName) => {
    undoRedo.record(
      bachVariables, 
      `Add Bach Variable: ${variableName}`
    );
    
    onBachVariablesChange({
      ...bachVariables,
      [variableName]: []
    });
  };
  
  // Before deleting a variable
  const handleDeleteVariable = (variableName: BachVariableName) => {
    undoRedo.record(
      bachVariables, 
      `Delete Bach Variable: ${variableName}`
    );
    
    const newVars = { ...bachVariables };
    delete newVars[variableName];
    onBachVariablesChange(newVars);
  };
  
  // Before adding a note to a variable
  const handleAddNoteToVariable = (
    variableName: BachVariableName, 
    note: number
  ) => {
    undoRedo.record(
      bachVariables, 
      `Add Note to ${variableName}`
    );
    
    onBachVariablesChange({
      ...bachVariables,
      [variableName]: [...bachVariables[variableName], note]
    });
  };
}
```

---

## Example 5: Harmony Composer

### **Integration Points**

```typescript
import { useComponentUndoRedo } from './UndoRedoProvider';

export function HarmonyComposer({ ... }: HarmonyComposerProps) {
  const undoRedo = useComponentUndoRedo('harmony-composer');
  
  // Before generating harmony
  const handleGenerateHarmony = () => {
    undoRedo.recordGlobalAndLocal(
      { 
        harmonyResult,
        harmonyParams,
        chordProgression 
      }, 
      `Generate Harmony with ${harmonyParams.voices} voices`
    );
    
    // Existing harmony generation logic...
    const result = harmonyEngine.generateHarmony(theme, params);
    setHarmonyResult(result);
  };
  
  // Before changing chord progression
  const handleChordChange = (index: number, chord: string) => {
    undoRedo.record(
      { chordProgression }, 
      `Change chord ${index + 1} to ${chord}`
    );
    
    const newProgression = [...chordProgression];
    newProgression[index] = chord;
    setChordProgression(newProgression);
  };
}
```

---

## Example 6: Arpeggio Chain Builder

### **Integration Points**

```typescript
import { useComponentUndoRedo } from './UndoRedoProvider';

export function ArpeggioChainBuilder({ ... }: ArpeggioChainBuilderProps) {
  const undoRedo = useComponentUndoRedo('arpeggio-chain');
  
  // Before adding a pattern to the chain
  const handleAddPattern = (pattern: ArpeggioPattern) => {
    undoRedo.record(
      { 
        arpeggioChain,
        currentPattern 
      }, 
      `Add Pattern: ${pattern.name}`
    );
    
    setArpeggioChain([...arpeggioChain, pattern]);
  };
  
  // Before generating arpeggio
  const handleGenerateArpeggio = () => {
    undoRedo.recordGlobalAndLocal(
      { 
        arpeggioChain,
        arpeggioResult,
        arpeggioParams 
      }, 
      `Generate Arpeggio Chain (${arpeggioChain.length} patterns)`
    );
    
    // Existing generation logic...
    const result = arpeggioEngine.generateArpeggio(theme, chain, params);
    setArpeggioResult(result);
  };
}
```

---

## Example 7: Song Composer

### **Integration Points**

```typescript
import { useComponentUndoRedo } from './UndoRedoProvider';

export function EnhancedSongComposer({ ... }: SongComposerProps) {
  const undoRedo = useComponentUndoRedo('song-composer');
  
  // Before adding a section
  const handleAddSection = (section: SongSection) => {
    undoRedo.record(
      currentSong, 
      `Add Section: ${section.name}`
    );
    
    const newSong = {
      ...currentSong,
      sections: [...currentSong.sections, section]
    };
    onSongUpdate(newSong);
  };
  
  // Before deleting a section
  const handleDeleteSection = (index: number) => {
    undoRedo.record(
      currentSong, 
      `Delete Section: ${currentSong.sections[index].name}`
    );
    
    const newSong = {
      ...currentSong,
      sections: currentSong.sections.filter((_, i) => i !== index)
    };
    onSongUpdate(newSong);
  };
  
  // Before reordering sections
  const handleReorderSections = (fromIndex: number, toIndex: number) => {
    undoRedo.record(
      currentSong, 
      `Reorder Section from ${fromIndex + 1} to ${toIndex + 1}`
    );
    
    const newSections = [...currentSong.sections];
    const [moved] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, moved);
    
    onSongUpdate({
      ...currentSong,
      sections: newSections
    });
  };
}
```

---

## Best Practices

### **When to Record to History**

✅ **DO record**:
- Before any state mutation
- Before adding/deleting items
- Before applying transformations
- Before changing parameters that affect output

❌ **DON'T record**:
- On every render
- For UI-only changes (e.g., accordion expand/collapse)
- For temporary preview states
- For derived state calculations

### **When to Use `record()` vs `recordGlobalAndLocal()`**

**Use `record()` for**:
- Small, localized changes (e.g., add a single note)
- Parameter adjustments within a component
- Changes that don't affect other components

**Use `recordGlobalAndLocal()` for**:
- Large transformations (e.g., generate fugue)
- Changes that affect multiple components
- Complex operations the user will want to undo across the app

### **Action Descriptions**

✅ **Good descriptions**:
- "Add Note C4"
- "Delete Note at position 3"
- "Apply Arpeggio: Ascending Triplets"
- "Generate 4-Voice Fugue"
- "Change Canon Interval to Perfect 5th"

❌ **Poor descriptions**:
- "Change" (too vague)
- "Update" (not specific)
- "Action" (meaningless)

---

## Complete Integration Checklist

For each component you integrate:

- [ ] Import `useComponentUndoRedo` hook
- [ ] Initialize hook with unique component ID
- [ ] Identify all state mutation points
- [ ] Add `undoRedo.record()` calls BEFORE mutations
- [ ] Choose descriptive action names
- [ ] Decide between `record()` and `recordGlobalAndLocal()`
- [ ] Test undo/redo functionality
- [ ] Verify state restoration is complete
- [ ] Check that existing functionality still works
- [ ] Add optional undo/redo buttons to UI (if desired)

---

## Minimal Integration Example

If you want the **absolute minimum** integration:

```typescript
import { useComponentUndoRedo } from './UndoRedoProvider';

export function MyComponent() {
  const [state, setState] = useState(initialState);
  const undoRedo = useComponentUndoRedo('my-component');
  
  const handleChange = () => {
    undoRedo.record(state, 'Change Description');
    setState(newState);
  };
  
  // That's it! Ctrl+Z and Ctrl+Y now work globally
}
```

---

## Advanced: Using `useUndoableState` Hook

For even easier integration, use the `useUndoableState` hook:

```typescript
import { useUndoableState } from '../hooks/useUndoableState';

export function MyComponent() {
  // Replace useState with useUndoableState
  const [theme, setTheme, undoControls] = useUndoableState<Theme>(
    [],
    'my-component',
    'Theme Change'
  );
  
  // Now setState automatically records to history!
  const addNote = (note: number) => {
    setTheme([...theme, note], 'Add Note'); // Automatically recorded!
  };
  
  // Access undo/redo controls
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
}
```

---

**This approach requires ZERO modifications to existing state management logic!**

---

## Questions & Troubleshooting

### Q: Do I need to modify existing component code?
**A**: No! The undo/redo system is completely opt-in. Components work exactly as before without integration.

### Q: What if I forget to record a state change?
**A**: It simply won't be undoable. No crash or error. The app continues working normally.

### Q: Can I record partial state?
**A**: Yes! Record only what needs to be restored. The hook will clone and store it.

### Q: What about performance?
**A**: State is cloned efficiently. For large states, only record when necessary. History depth is limited to 50 actions by default.

---

**Integration Date**: October 27, 2025
**Version**: 1.0.0
**Difficulty**: ⭐⭐☆☆☆ (Easy - just add one hook call!)
