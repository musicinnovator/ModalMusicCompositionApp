# Audio Playback Isolation - Complete Implementation

## Overview
Implemented a global audio playback manager to ensure that only one audio player is active at a time across the entire application. This prevents multiple windows from playing simultaneously and ensures clean, isolated playback for each composition.

## What Was Implemented

### 1. Global Audio Playback Manager (`/lib/audio-playback-manager.ts`)
- **Singleton pattern** that manages all audio players in the application
- **Registration system** where each player registers with a unique ID
- **Automatic stopping** of other players when one starts
- **Console logging** for debugging and monitoring playback state

Key features:
- `register(id, stopCallback)` - Register a player with a unique ID
- `unregister(id)` - Remove a player when component unmounts
- `requestPlayback(id)` - Request playback (stops all other players)
- `notifyStopped(id)` - Notify when playback stops
- `stopAll()` - Emergency stop for all players

### 2. Updated Components

#### AudioPlayer (`/components/AudioPlayer.tsx`)
- Added `playerId` prop (optional - auto-generates if not provided)
- Registers with manager on mount, unregisters on unmount
- Calls `requestPlayback()` when play is pressed
- Calls `notifyStopped()` when playback stops/pauses/completes

#### ThemePlayer (`/components/ThemePlayer.tsx`)
- Auto-generates unique player ID
- Integrated with playback manager
- Stops when other players start

#### BachVariablePlayer (`/components/BachVariablePlayer.tsx`)
- Creates unique player ID for each Bach variable
- Each variable (CF, FCP1, FCP2, etc.) has its own managed player
- Integrated with playback manager for coordinated playback

#### App.tsx
- Passes unique `playerId` props to all AudioPlayer instances:
  - `counterpoint-${timestamp}` for counterpoints
  - `imitation-${timestamp}` for imitations
  - `fugue-${timestamp}` for fugues

## How It Works

### Scenario 1: Playing Counterpoint 1
1. User clicks play on "Counterpoint 1"
2. AudioPlayer calls `audioPlaybackManager.requestPlayback('counterpoint-123456')`
3. Manager checks if another player is active
4. If "Imitation 2" was playing, manager calls its stop callback
5. "Imitation 2" stops immediately
6. "Counterpoint 1" starts playing
7. Manager tracks "Counterpoint 1" as the active player

### Scenario 2: User Creates Multiple Windows
```
Window 1: Counterpoint 1 (playing) ──> Manager sees active player
Window 2: Imitation 2 (user clicks play)
  ├─> Manager calls stop() on Counterpoint 1
  ├─> Counterpoint 1 stops
  └─> Imitation 2 starts
```

### Scenario 3: Playback Completes Naturally
1. Fugue 1 is playing
2. Last note finishes
3. Fugue 1 calls `audioPlaybackManager.notifyStopped('fugue-789')`
4. Manager clears active player
5. No active player - system ready for next playback

## Console Logs for Debugging

When audio playback happens, you'll see console logs like:
```
🎵 AudioPlaybackManager: Registered player "counterpoint-1735934567890" (Counterpoint Playback)
🎵 AudioPlaybackManager: Player "counterpoint-1735934567890" requesting playback
🎵 AudioPlaybackManager: Stopping previous player "imitation-1735934560000"
🎵 AudioPlaybackManager: Player "counterpoint-1735934567890" is now active
🎵 AudioPlaybackManager: Player "counterpoint-1735934567890" stopped, no active player
```

## Testing the Implementation

### Test 1: Multiple Counterpoints
1. Generate 2 counterpoints
2. Start playing Counterpoint 1
3. While it's playing, click play on Counterpoint 2
4. ✅ Counterpoint 1 should stop immediately
5. ✅ Counterpoint 2 should start

### Test 2: Different Composition Types
1. Generate an imitation and a fugue
2. Start playing the imitation
3. While it's playing, click play on the fugue
4. ✅ Imitation should stop
5. ✅ Fugue should start

### Test 3: Theme Player
1. Start playing the main theme
2. While it's playing, click play on any Bach variable
3. ✅ Theme should stop
4. ✅ Bach variable should start

### Test 4: Bach Variables
1. Play Cantus Firmus (CF)
2. While it's playing, click play on Florid Counterpoint 1 (FCP1)
3. ✅ CF should stop
4. ✅ FCP1 should start

### Test 5: Natural Completion
1. Start playing a short theme (3-5 notes)
2. Let it play to completion
3. ✅ Playback should stop automatically
4. ✅ You should be able to start another player without issues

## Benefits

1. **No Audio Conflicts**: Only one audio source plays at a time
2. **Clean UX**: Users don't have to manually stop one player before starting another
3. **Memory Efficient**: Prevents multiple audio engines from running simultaneously
4. **Predictable Behavior**: Clear playback state across the entire app
5. **Debugging**: Console logs make it easy to track what's playing

## Technical Details

### Player IDs Format
- **AudioPlayer**: Uses prop or auto-generates: `audio-player-{timestamp}-{random}`
- **ThemePlayer**: `theme-player-{timestamp}-{random}`
- **BachVariablePlayer**: `bach-{variableName}-{timestamp}`
- **Counterpoints**: `counterpoint-{timestamp}` (from App.tsx)
- **Imitations**: `imitation-{timestamp}` (from App.tsx)
- **Fugues**: `fugue-{timestamp}` (from App.tsx)

### Component Lifecycle
1. **Mount**: Register with manager
2. **Play**: Request playback from manager
3. **Stop/Pause**: Notify manager
4. **Complete**: Notify manager
5. **Unmount**: Unregister from manager

### Manager State
The manager maintains:
- `activePlayer`: Currently playing player (or null)
- `registeredPlayers`: Map of all registered players
- Each player has: `{ id: string, stop: () => void }`

## Future Enhancements

Potential improvements (not currently implemented):
1. **Volume Ducking**: Instead of stopping, lower volume of other players
2. **Playback Queue**: Allow queueing multiple compositions
3. **Crossfade**: Smooth transition between players
4. **Multi-track**: Allow specific players to play simultaneously (opt-in)
5. **Persistence**: Remember which player was last active

## Implementation Status

✅ **COMPLETE** - All audio players now use the centralized playback manager
✅ **TESTED** - Core functionality verified
✅ **DOCUMENTED** - Full implementation guide created

## Summary

The audio playback manager ensures that across your entire Modal Imitation and Fugue Construction Engine application:
- **Only one audio player is active at a time**
- **Playback is automatically coordinated between all windows**
- **No manual stopping required**
- **Clean, predictable user experience**

Each counterpoint window, imitation window, fugue window, and Bach variable player is now isolated and managed by the centralized system. When you click play on any player, all others automatically stop.
