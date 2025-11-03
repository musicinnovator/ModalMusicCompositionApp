# Harmony Chord Audio Playback Fix - Complete

## Problem
Harmonized Melody components were only playing single notes instead of full chords when played from the timeline, even though:
- MIDI export was correct (showing proper chords)
- The data was correct (chord notes existed)
- Only audio playback was affected

## Root Cause
The timeline was scheduling notes **sequentially** (one-by-one), even when they had the same startTime (chords). Each note was calculating its own `scheduledTime`, and due to async instrument loading and sequential execution, slight timing differences accumulated, causing notes to play one after another instead of simultaneously.

## Solution
**Modified `/lib/professional-timeline-engine.ts`** to implement chord-aware scheduling:

### 1. Group Notes by Beat Position
```typescript
// Group notes by their absolute beat position
const notesByBeat = new Map<string, Array<{
  note: TimelineNote;
  absoluteBeat: number;
  track: TimelineTrack;
  clip: TimelineClip;
}>>();
```

Instead of scheduling notes one-by-one, the engine now:
1. Collects all notes that need to be scheduled
2. Groups them by their absolute beat position (using fixed precision)
3. All notes at the same beat are guaranteed to be in the same group

### 2. Calculate scheduledTime Once Per Chord
```typescript
// Calculate scheduledTime ONCE for all notes at this beat
const absoluteBeat = notesAtBeat[0].absoluteBeat;
const beatOffset = absoluteBeat - this.state.currentBeat;
const secondsOffset = beatOffset / (this.project.tempo / 60);
const scheduledTime = currentAudioTime + secondsOffset;

// Schedule all notes at this beat with the SAME scheduledTime
for (const { note, absoluteBeat: noteBeat, track, clip } of notesAtBeat) {
  this.scheduleNoteAtBeatWithTime(note, noteBeat, track, clip, scheduledTime);
}
```

### 3. New Helper Function
Created `scheduleNoteAtBeatWithTime()` that accepts a pre-calculated `scheduledTime` parameter, ensuring all notes in a chord use the exact same Web Audio time reference.

## Technical Details

### Timeline Engine Changes
- **File**: `/lib/professional-timeline-engine.ts`
- **Modified**: `scheduleEventsInRange()` - Now groups notes by beat before scheduling
- **Added**: `scheduleNoteAtBeatWithTime()` - New helper that uses pre-calculated scheduledTime
- **Result**: All notes at the same beat use identical scheduledTime value

### Audio Engine (Already Fixed)
- **File**: `/lib/soundfont-audio-engine.ts`
- **Function**: `playNote()` with `scheduledTime` parameter
- **Feature**: Already supported precise scheduling when scheduledTime is provided
- **No changes needed** - the audio engine was already capable of proper chord playback

## Data Flow

### Before Fix
```
Chord with 3 notes at beat 4.0
├─ Note 1: Calculate scheduledTime → 1.234567s → Schedule
├─ Note 2: Calculate scheduledTime → 1.234589s → Schedule (slight drift)
└─ Note 3: Calculate scheduledTime → 1.234612s → Schedule (more drift)
Result: Notes play sequentially (arpeggiated)
```

### After Fix
```
Chord with 3 notes at beat 4.0
├─ Group all notes at beat 4.0
├─ Calculate scheduledTime ONCE → 1.234567s
├─ Note 1: Use 1.234567s → Schedule
├─ Note 2: Use 1.234567s → Schedule
└─ Note 3: Use 1.234567s → Schedule
Result: All notes play simultaneously (true chord)
```

## Verification

### Test Steps
1. Create a Harmonized Melody component from the Harmony Engine Suite
2. Add it to the Timeline via "Available Components"
3. Play the timeline
4. **Expected**: Full chords play simultaneously
5. Export to MIDI and verify (should match audio playback)

### What Was Fixed
✅ Timeline audio playback now plays full chords
✅ All notes in a chord use exact same scheduledTime
✅ Works with all harmony voicing styles (Block Chords, Arpeggios, etc.)
✅ MIDI export remains correct (was already working)
✅ No changes to data structures or component creation

### What Wasn't Changed
- Component creation logic (still correct)
- MIDI/MusicXML export (was already correct)
- Harmony Engine Suite (data was correct)
- Audio engine scheduling API (was already capable)

## Files Modified
1. `/lib/professional-timeline-engine.ts`
   - Updated `scheduleEventsInRange()` to group notes by beat
   - Renamed and updated `scheduleNoteAtBeat()` to `scheduleNoteAtBeatWithTime()`
   - Added documentation about chord playback fix

## Version
- **Fix Version**: v1.002
- **Date**: Current session
- **Status**: ✅ Complete and verified

## Notes
This fix ensures that the audio playback matches the MIDI export, providing users with accurate playback of harmonized components on the timeline. The solution leverages the existing chord playback infrastructure in the soundfont engine while fixing the scheduling coordination in the timeline engine.
