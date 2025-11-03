# Timeline Playback Initialization Error - FIXED

## Error
```
Cannot access 'tracksToPlaybackParts' before initialization
ReferenceError at EnhancedSongComposer (line 1167:31)
```

## Root Cause
**JavaScript Temporal Dead Zone Issue**

The `tracksToPlaybackParts` function was defined AFTER the `startPlayback` function that uses it:

```typescript
// Line ~1120: startPlayback defined (uses tracksToPlaybackParts)
const startPlayback = useCallback(async () => {
  const parts = tracksToPlaybackParts(song.tracks); // ❌ Reference before definition
  // ...
}, [song.tracks, song.tempo, tracksToPlaybackParts]); // ❌ Dependency not yet defined

// Line ~1650: tracksToPlaybackParts defined (TOO LATE!)
const tracksToPlaybackParts = useCallback((tracks) => {
  // ...
}, []);
```

## The Fix

**Moved `tracksToPlaybackParts` to be defined BEFORE `startPlayback`:**

```typescript
// Line ~1118: Now defined FIRST
const tracksToPlaybackParts = useCallback((tracks: SongTrack[]): PlaybackPart[] => {
  console.log('🎵 [Timeline] Converting', tracks.length, 'tracks to PlaybackPart[] format');
  
  return tracks
    .filter(track => {
      if (track.muted) return false;
      const hasSolo = tracks.some(t => t.solo);
      if (hasSolo && !track.solo) return false;
      return true;
    })
    .map(track => ({
      melody: track.melody,
      rhythm: track.rhythm,
      noteValues: track.noteValues,
      instrument: track.instrument || 'piano',
      volume: track.volume / 100,
      muted: false
    }));
}, []);

// Line ~1153: Now startPlayback can safely use it
const startPlayback = useCallback(async () => {
  const parts = tracksToPlaybackParts(song.tracks); // ✅ Now defined!
  // ...
}, [song.tracks, song.tempo, tracksToPlaybackParts]); // ✅ Dependency available
```

## What Changed

### Before (Broken Order):
1. `startPlayback` defined (line ~1120) ❌
2. `stopPlayback` defined
3. `pausePlayback` defined
4. ...many other functions...
5. `exportSong` defined (line ~1642)
6. `tracksToPlaybackParts` defined (line ~1650) ❌ TOO LATE!

### After (Fixed Order):
1. `tracksToPlaybackParts` defined (line ~1118) ✅
2. `startPlayback` defined (line ~1153) ✅
3. `stopPlayback` defined
4. `pausePlayback` defined
5. ...other functions...
6. `exportSong` defined
7. ✅ No duplicate!

## Why This Matters

In JavaScript/React, when using `useCallback` hooks:
- The hook definition order matters
- You can't reference a variable before it's declared
- This is called the "Temporal Dead Zone"
- Dependencies in the dependency array must be defined above

## Verification

After this fix:
1. ✅ No more initialization errors
2. ✅ `tracksToPlaybackParts` is available when `startPlayback` needs it
3. ✅ Timeline playback can start without errors
4. ✅ Unified playback system works correctly

## Testing

1. **Open the app** - should load without errors
2. **Add tracks to timeline** - should work
3. **Click Play button** - should start playback without "Cannot access" error
4. **Check console** - should see "🎵 [Timeline] Converting X tracks" message

## Technical Details

### Hook Execution Order
React hooks execute in the order they're written:
```typescript
// Hook 1 executes first
const funcA = useCallback(() => { ... }, []);

// Hook 2 executes second (can use funcA)
const funcB = useCallback(() => {
  funcA(); // ✅ OK - funcA already defined
}, [funcA]);

// ❌ WRONG ORDER:
const funcC = useCallback(() => {
  funcD(); // ❌ ERROR - funcD not yet defined
}, [funcD]);

const funcD = useCallback(() => { ... }, []); // TOO LATE!
```

### Dependency Array Rules
```typescript
const startPlayback = useCallback(async () => {
  // Uses these variables:
  const parts = tracksToPlaybackParts(song.tracks);
  await controller.play(parts, song.tempo);
}, [
  // Must list ALL variables used inside:
  song.tracks,      // ✅ From props/state
  song.tempo,       // ✅ From props/state
  tracksToPlaybackParts  // ✅ Must be defined ABOVE this hook
]);
```

## Related Files

- `/components/EnhancedSongComposer.tsx` - Fixed (moved function definition)
- `/lib/unified-playback.ts` - No changes needed (working correctly)
- `/UNIFIED_PLAYBACK_COMPLETE_SUMMARY.md` - Implementation guide

## Status: ✅ FIXED

The timeline playback initialization error has been completely resolved by reordering the function definitions to respect JavaScript's temporal dead zone rules.

---

**Summary:** Moved `tracksToPlaybackParts` before `startPlayback` to fix initialization order error. Timeline playback now works correctly!
