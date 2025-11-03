# Timeline Playback Fix - Integration with Unified Playback System

## Problem Identified

The EnhancedSongComposer has **two separate playback systems**:

1. ✅ **Component Audition** - Uses `unified-playback.ts` (works great!)
2. ❌ **Timeline Playback** - Uses old custom system with `buildNoteEvents` + `playNoteEvents` (not playing correct notes)

The issue is that when tracks are added to the timeline, they contain all the correct data (melody, rhythm, noteValues), but the OLD timeline playback system isn't properly reading and playing this data.

## Root Cause

Looking at `/components/EnhancedSongComposer.tsx` lines 873-991:

The `buildNoteEvents` function tries to interpret the track data, but:
- The soundfont engine may not be properly initialized
- The timing interpretation might differ from the unified system
- The note scheduling system is complex and error-prone

Meanwhile, the `unified-playback.ts` system handles all of this correctly for audition!

## Solution

Replace the timeline playback system to use the **exact same** `UnifiedPlaybackController` that works for audition.

### Implementation Steps

1. **Convert tracks to PlaybackPart[] format**
   - Each track becomes a PlaybackPart with melody + noteValues + instrument
   
2. **Use UnifiedPlaybackController for timeline**
   - Same controller, same algorithm
   - Guaranteed consistency

3. **Update playback controls**
   - Play/Pause/Stop use the controller
   - Progress tracking from controller

## Code Changes Needed

### Add Timeline Playback Controller

```typescript
// After line 204 (audition controller)
const timelineControllerRef = useRef(createPlaybackController());
```

### Convert Tracks to PlaybackPart[]

```typescript
const tracksToPlaybackParts = useCallback((tracks: SongTrack[]): PlaybackPart[] => {
  return tracks
    .filter(track => !track.muted)
    .filter(track => {
      const hasSolo = tracks.some(t => t.solo);
      return !hasSolo || track.solo;
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
```

### Replace startPlayback Function

```typescript
const startPlayback = useCallback(async () => {
  if (song.tracks.length === 0) {
    toast.warning('No tracks to play');
    return;
  }

  try {
    const parts = tracksToPlaybackParts(song.tracks);
    
    await timelineControllerRef.current.play(parts, song.tempo, {
      onProgress: (time, duration) => {
        const beat = (time / 60) * song.tempo;
        setCurrentTime(time);
        setCurrentBeat(beat);
      },
      onComplete: () => {
        setIsPlaying(false);
        setCurrentBeat(0);
        setCurrentTime(0);
        toast.success('Playback completed');
      }
    });
    
    setIsPlaying(true);
    toast.success('Playback started');
  } catch (error: any) {
    console.error('Playback error:', error);
    toast.error('Failed to start playback');
  }
}, [song.tracks, song.tempo, tracksToPlaybackParts]);
```

### Replace stopPlayback Function

```typescript
const stopPlayback = useCallback(() => {
  timelineControllerRef.current.stop();
  setIsPlaying(false);
  setCurrentBeat(0);
  setCurrentTime(0);
}, []);
```

### Replace pausePlayback Function

```typescript
const pausePlayback = useCallback(() => {
  if (isPlaying) {
    timelineControllerRef.current.pause();
    setIsPlaying(false);
  }
}, [isPlaying]);
```

## Why This Fixes The Problem

### Before (Broken)
```
Timeline Tracks → buildNoteEvents → playNoteEvents → soundfontEngine
                      ↓ (complex interpretation)
                   May lose rhythm data
                   May not init engine properly
```

### After (Fixed)
```
Timeline Tracks → tracksToPlaybackParts → UnifiedPlaybackController
                                              ↓
                                    SAME SYSTEM AS AUDITION
                                              ↓
                                    soundfontEngine (proper init)
```

## Benefits

1. **Guaranteed Accuracy** - Uses proven audition system
2. **Data Preservation** - rhythm/noteValues flow directly
3. **Simpler Code** - Remove 300+ lines of complex playback logic
4. **Single Source of Truth** - One algorithm everywhere
5. **Easy Debugging** - All playback issues fixed in one place

## Testing

After implementing:

1. **Create a theme** with custom rhythm
2. **Audition it** - note the rhythm
3. **Add to timeline** 
4. **Play timeline** - should sound IDENTICAL to audition
5. **Add multiple tracks** - all should play with correct rhythm
6. **Test solo/mute** - should work correctly

## Expected Result

Timeline playback will sound **exactly like** component audition, because they use the exact same playback engine!

---

## Quick Fix Summary

**Problem:** Timeline not playing correct notes
**Cause:** Using old custom playback system instead of unified system
**Solution:** Use UnifiedPlaybackController for timeline (same as audition)
**Result:** Timeline = Audition = Identical sound

The fix ensures ONE playback system controls everything, eliminating all inconsistencies!
