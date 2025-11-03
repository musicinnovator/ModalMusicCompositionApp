# Timeline Copy/Paste/Duplicate Fix - Implementation Plan

## Problem Statement

**User Report**: "When user has placed a component in the Timeline and wants to copy it to another track (lane), it appears in another lane but there's no sound coming from the copy."

**Root Cause Analysis**:
1. NO copy functionality currently exists in the timeline
2. Users likely expect drag-and-drop or keyboard shortcuts
3. Need to implement full DAW-style clip copying with ALL audio data preserved

## Professional DAW Reference Study

### Industry Standards (ProTools, FL Studio, Ableton Live, Logic Pro)

#### 1. **Ableton Live**
- **Cmd/Ctrl+D**: Duplicate clip in place
- **Cmd/Ctrl+C**: Copy clip to clipboard
- **Cmd/Ctrl+V**: Paste clip at playhead position
- **Alt/Option+Drag**: Duplicate clip while dragging
- **Right-click menu**: Copy, Paste, Duplicate

#### 2. **Logic Pro X**
- **Cmd+C**: Copy selection
- **Cmd+V**: Paste at playhead
- **Option+Drag**: Duplicate
- **Cmd+R**: Repeat/Loop clip
- **Marquee tool**: Select and copy portions

#### 3. **Pro Tools**
- **Cmd/Ctrl+D**: Duplicate
- **Cmd/Ctrl+C**: Copy
- **Cmd/Ctrl+V**: Paste
- **Option/Alt+Drag**: Smart duplicate
- **Grid snap for accurate placement**

#### 4. **FL Studio**
- **Ctrl+B**: Clone pattern
- **Ctrl+C/V**: Standard copy/paste
- **Ctrl+Drag**: Quick duplicate
- **Right-click**: Clone to new track

#### 5. **Reason**
- **Cmd/Ctrl+D**: Duplicate
- **Cmd/Ctrl+C/V**: Copy/Paste
- **Alt+Drag**: Copy while dragging
- **Sequencer lane duplication**

### Common UX Patterns

| Feature | Ableton | Logic | ProTools | FL Studio | Reason | Priority |
|---------|---------|-------|----------|-----------|--------|----------|
| Cmd/Ctrl+D | ✅ | ✅ | ✅ | ✅ | ✅ | **Critical** |
| Cmd/Ctrl+C/V | ✅ | ✅ | ✅ | ✅ | ✅ | **Critical** |
| Alt/Opt+Drag | ✅ | ✅ | ✅ | ✅ | ✅ | **High** |
| Right-click menu | ✅ | ✅ | ✅ | ✅ | ✅ | **High** |
| Visual feedback | ✅ | ✅ | ✅ | ✅ | ✅ | **High** |
| Grid snapping | ✅ | ✅ | ✅ | ✅ | ✅ | **Medium** |
| Multi-select | ✅ | ✅ | ✅ | ✅ | ✅ | **Medium** |

## Implementation Requirements

### Critical Features (Must Have)

1. **Keyboard Shortcuts**
   - `Cmd/Ctrl+D`: Duplicate selected clip in place (slightly offset)
   - `Cmd/Ctrl+C`: Copy selected clip to clipboard
   - `Cmd/Ctrl+V`: Paste clip to selected track at playhead
   - `Cmd/Ctrl+X`: Cut clip (copy + delete)
   - `Delete/Backspace`: Delete selected clip

2. **Visual UI Buttons**
   - Copy button when clip selected
   - Paste button when clipboard has content
   - Duplicate button when clip selected
   - Delete button when clip selected

3. **Data Preservation**
   - ALL note data copied (midiNote, startTime, duration, velocity)
   - ALL clip metadata (name, color, gain, etc.)
   - New unique IDs generated
   - Correct trackId assignment

4. **Audio Playback**
   - Copied clips MUST produce sound
   - Same instrument as source track
   - Same volume settings
   - Same timing/rhythm

### High Priority Features

5. **Right-Click Context Menu**
   - Copy
   - Paste
   - Duplicate
   - Delete
   - Rename

6. **Visual Feedback**
   - Copied clip highlighted
   - Clipboard indicator
   - Paste preview ghost clip
   - Successful operation toasts

7. **Track Selection Smart Paste**
   - Paste to currently selected track
   - Create new track if none selected
   - Maintain instrument type option

### Medium Priority Features

8. **Multi-Select**
   - Shift+Click to select multiple clips
   - Cmd/Ctrl+A to select all clips in track
   - Group copy/paste operations

9. **Grid Snapping**
   - Snap pasted clips to beat grid
   - Toggle snap on/off
   - Configurable snap resolution

10. **Drag and Drop Copy**
    - Alt/Option+Drag to duplicate
    - Drag between tracks
    - Visual drop zone indicators

## Implementation Steps

### Step 1: Core Data Structures (ADDITIVE ONLY)

```typescript
// ADDITIVE: Clipboard state
const [clipboard, setClipboard] = useState<TimelineClip | null>(null);
const [copiedClipId, setCopiedClipId] = useState<string | null>(null);
```

### Step 2: Clip Copy Function

```typescript
// ADDITIVE: Copy clip to clipboard
const handleCopyClip = useCallback((clipId: string) => {
  const sourceClip = project.tracks
    .flatMap(t => t.clips)
    .find(c => c.id === clipId);
    
  if (!sourceClip) {
    toast.error('Clip not found');
    return;
  }
  
  // Deep copy ALL clip data
  const clipCopy: TimelineClip = {
    ...sourceClip,
    // Notes array deep copied
    notes: sourceClip.notes.map(note => ({
      ...note,
      id: `note-${Date.now()}-${Math.random()}` // New IDs
    }))
  };
  
  setClipboard(clipCopy);
  setCopiedClipId(clipId);
  
  console.log('📋 [Timeline] Clip copied to clipboard:', {
    clipId: clipCopy.id,
    noteCount: clipCopy.notes.length,
    name: clipCopy.name
  });
  
  toast.success(`Copied "${clipCopy.name}"`);
}, [project.tracks]);
```

### Step 3: Clip Paste Function

```typescript
// ADDITIVE: Paste clip from clipboard to selected track
const handlePasteClip = useCallback((targetTrackId?: string) => {
  if (!clipboard) {
    toast.error('Nothing to paste');
    return;
  }
  
  // Determine target track
  const trackId = targetTrackId || selectedTrackId;
  const targetTrack = project.tracks.find(t => t.id === trackId);
  
  if (!targetTrack) {
    toast.error('No track selected');
    return;
  }
  
  // Create new clip with unique ID
  const newClip: TimelineClip = {
    ...clipboard,
    id: `clip-${Date.now()}-${Math.random()}`,
    trackId: targetTrack.id,
    startBeat: currentBeat, // Place at playhead
    // Notes already have unique IDs from copy
    notes: clipboard.notes.map(note => ({
      ...note,
      id: `note-${Date.now()}-${Math.random()}`
    }))
  };
  
  // Add clip to target track
  setProject(prev => ({
    ...prev,
    tracks: prev.tracks.map(t =>
      t.id === targetTrack.id
        ? { ...t, clips: [...t.clips, newClip] }
        : t
    )
  }));
  
  console.log('✅ [Timeline] Clip pasted:', {
    sourceClip: clipboard.id,
    newClip: newClip.id,
    targetTrack: targetTrack.name,
    noteCount: newClip.notes.length,
    startBeat: newClip.startBeat
  });
  
  toast.success(`Pasted "${newClip.name}" to ${targetTrack.name}`);
  
  // Select newly pasted clip
  setSelectedClipId(newClip.id);
}, [clipboard, selectedTrackId, project.tracks, currentBeat]);
```

### Step 4: Clip Duplicate Function

```typescript
// ADDITIVE: Duplicate clip in place (offset by 4 beats)
const handleDuplicateClip = useCallback((clipId: string) => {
  const sourceClip = project.tracks
    .flatMap(t => t.clips)
    .find(c => c.id === clipId);
    
  if (!sourceClip) {
    toast.error('Clip not found');
    return;
  }
  
  // Calculate clip length
  const clipLength = sourceClip.notes.length > 0
    ? Math.max(...sourceClip.notes.map(n => n.startTime + n.duration))
    : 4;
  
  // Create duplicate with offset
  const newClip: TimelineClip = {
    ...sourceClip,
    id: `clip-${Date.now()}-${Math.random()}`,
    startBeat: sourceClip.startBeat + clipLength, // Place after original
    name: `${sourceClip.name} (Copy)`,
    notes: sourceClip.notes.map(note => ({
      ...note,
      id: `note-${Date.now()}-${Math.random()}`
    }))
  };
  
  // Add clip to same track
  setProject(prev => ({
    ...prev,
    tracks: prev.tracks.map(t =>
      t.id === sourceClip.trackId
        ? { ...t, clips: [...t.clips, newClip] }
        : t
    )
  }));
  
  console.log('✅ [Timeline] Clip duplicated:', {
    sourceClip: sourceClip.id,
    newClip: newClip.id,
    offset: clipLength
  });
  
  toast.success(`Duplicated "${sourceClip.name}"`);
  
  // Select new clip
  setSelectedClipId(newClip.id);
}, [project.tracks]);
```

### Step 5: Clip Delete Function

```typescript
// ADDITIVE: Delete selected clip
const handleDeleteClip = useCallback((clipId: string) => {
  const clip = project.tracks
    .flatMap(t => t.clips)
    .find(c => c.id === clipId);
    
  if (!clip) {
    toast.error('Clip not found');
    return;
  }
  
  setProject(prev => ({
    ...prev,
    tracks: prev.tracks.map(t => ({
      ...t,
      clips: t.clips.filter(c => c.id !== clipId)
    }))
  }));
  
  console.log('🗑️ [Timeline] Clip deleted:', clipId);
  toast.success(`Deleted "${clip.name}"`);
  
  // Clear selection
  if (selectedClipId === clipId) {
    setSelectedClipId(null);
  }
}, [project.tracks, selectedClipId]);
```

### Step 6: Keyboard Shortcuts

```typescript
// ADDITIVE: Keyboard shortcuts handler
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Check if input/textarea focused (don't intercept)
    if (
      document.activeElement?.tagName === 'INPUT' ||
      document.activeElement?.tagName === 'TEXTAREA'
    ) {
      return;
    }
    
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdCtrl = isMac ? e.metaKey : e.ctrlKey;
    
    if (!selectedClipId) return;
    
    // Copy: Cmd/Ctrl+C
    if (cmdCtrl && e.key === 'c') {
      e.preventDefault();
      handleCopyClip(selectedClipId);
    }
    
    // Paste: Cmd/Ctrl+V
    if (cmdCtrl && e.key === 'v') {
      e.preventDefault();
      handlePasteClip();
    }
    
    // Duplicate: Cmd/Ctrl+D
    if (cmdCtrl && e.key === 'd') {
      e.preventDefault();
      handleDuplicateClip(selectedClipId);
    }
    
    // Delete: Delete or Backspace
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      handleDeleteClip(selectedClipId);
    }
    
    // Cut: Cmd/Ctrl+X
    if (cmdCtrl && e.key === 'x') {
      e.preventDefault();
      handleCopyClip(selectedClipId);
      handleDeleteClip(selectedClipId);
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedClipId, handleCopyClip, handlePasteClip, handleDuplicateClip, handleDeleteClip]);
```

### Step 7: UI Controls

```typescript
// ADDITIVE: Clip editing toolbar
{selectedClipId && (
  <div className=\"absolute top-2 right-2 flex gap-1 bg-background/90 backdrop-blur-sm rounded-lg p-1 border\">
    <Button
      size=\"sm\"
      variant=\"ghost\"
      onClick={() => handleCopyClip(selectedClipId)}
      title=\"Copy (Cmd/Ctrl+C)\"
    >
      <Copy className=\"w-3 h-3\" />
    </Button>
    
    <Button
      size=\"sm\"
      variant=\"ghost\"
      onClick={() => handleDuplicateClip(selectedClipId)}
      title=\"Duplicate (Cmd/Ctrl+D)\"
    >
      <Clipboard className=\"w-3 h-3\" />
    </Button>
    
    <Button
      size=\"sm\"
      variant=\"ghost\"
      onClick={() => handleDeleteClip(selectedClipId)}
      title=\"Delete (Del)\"
    >
      <Trash2 className=\"w-3 h-3\" />
    </Button>
  </div>
)}

{clipboard && (
  <div className=\"absolute bottom-2 right-2\">
    <Button
      size=\"sm\"
      variant=\"default\"
      onClick={() => handlePasteClip()}
      title=\"Paste (Cmd/Ctrl+V)\"
    >
      <Clipboard className=\"w-3 h-3 mr-1\" />
      Paste
    </Button>
  </div>
)}
```

## Testing Checklist

### Audio Playback Verification

- [ ] Original clip plays correctly
- [ ] Copied clip plays with identical sound
- [ ] Copied clip on different track plays with that track's instrument
- [ ] Multiple copies all play independently
- [ ] Copied chords play all notes simultaneously
- [ ] Copied rhythm patterns maintain timing

### Data Integrity

- [ ] All MIDI notes copied
- [ ] All note durations preserved
- [ ] All velocities preserved
- [ ] Clip metadata copied (name, color)
- [ ] Unique IDs generated for copies
- [ ] No ID conflicts

### User Interaction

- [ ] Keyboard shortcuts work (Cmd/Ctrl+C/V/D/X, Delete)
- [ ] UI buttons work (Copy, Paste, Duplicate, Delete)
- [ ] Visual feedback provided (toasts, highlights)
- [ ] Selected clip indicated clearly
- [ ] Clipboard state visible when populated

### Edge Cases

- [ ] Copy/paste with no track selected
- [ ] Paste with empty clipboard
- [ ] Delete last clip on track
- [ ] Copy clip with 100+ notes
- [ ] Rapid copy/paste operations
- [ ] Copy during playback

## Success Criteria

✅ **Critical**: Copied clips produce identical audio to source  
✅ **Critical**: All note data preserved perfectly  
✅ **Critical**: Keyboard shortcuts functional (Cmd/Ctrl+D, C, V)  
✅ **High**: Visual UI buttons present and working  
✅ **High**: User feedback clear and helpful  
✅ **Medium**: Right-click context menu (optional enhancement)  
✅ **Medium**: Multi-select support (optional enhancement)  

## Expected User Experience

### Before Fix

```
User: Places component in Timeline Track 1
User: Wants to copy to Track 2
User: ??? No copy button, no keyboard shortcut
User: Tries dragging (doesn't work)
Result: ❌ Frustrated, can't duplicate clips
```

### After Fix

```
User: Places component in Timeline Track 1
User: Clicks clip to select it
User: Presses Cmd+D (or clicks Duplicate button)
System: ✅ Creates perfect copy offset by 4 beats
System: ✅ Plays identical audio
User: Success! Can build arrangements easily

Alternative flow:
User: Selects clip
User: Presses Cmd+C (copy)
User: Clicks different track
User: Presses Cmd+V (paste)
System: ✅ Pastes clip to new track at playhead
System: ✅ Uses new track's instrument
User: Perfect! Just like a real DAW
```

## Implementation Priority

1. **Phase 1 (Critical)** - Copy/Paste/Duplicate core functions
2. **Phase 2 (Critical)** - Keyboard shortcuts
3. **Phase 3 (High)** - UI buttons and visual feedback
4. **Phase 4 (High)** - Comprehensive testing
5. **Phase 5 (Medium)** - Right-click menu (optional)
6. **Phase 6 (Medium)** - Drag-and-drop copy (optional)

## Backward Compatibility

- ✅ All existing timeline functionality preserved
- ✅ No changes to existing clip data structures
- ✅ No changes to existing playback engine
- ✅ Purely additive features
- ✅ No breaking changes

## Status

- [x] Planning complete
- [ ] Core functions implementation
- [ ] Keyboard shortcuts implementation
- [ ] UI controls implementation
- [ ] Testing and validation
- [ ] Documentation
- [ ] Ready for production

---

**Next Action**: Implement core copy/paste/duplicate functions in ProfessionalTimeline.tsx

**Date**: Current session  
**Priority**: Critical (blocks user workflow)  
**Complexity**: Medium (well-defined, additive only)
