# Component Audition Feature - User Guide

## What's New? 🎵

Every available component in the Complete Song Creation Suite now has a **Play/Stop button** that lets you preview ("audition") how it will sound BEFORE adding it to your timeline.

**The best part:** The audition preview plays EXACTLY the same notes, rhythms, and timing as when you add it to the timeline. No surprises!

## Quick Start

### Step 1: Create Your Musical Components

Create any combination of:
- 🎹 **Main Theme** (with custom rhythm if desired)
- 🎼 **Imitations** (with any interval and entry delay)
- 🎭 **Fugues** (with multiple voices and staggered entries)
- 🎶 **Counterpoints** (using basic or advanced techniques)
- 📝 **Bach Variables** (custom melodies with rhythm)

### Step 2: Open Complete Song Creation Suite

1. Scroll down to the **"Complete Song Creation"** section
2. Make sure you're on the **"Compose"** tab
3. Look at the **"Available Components"** panel

### Step 3: Preview Components

For each component you see:
- **🎵 Green "Play" button** - Click to hear how it sounds
- **➕ "Add" button** - Add it to the timeline

**While playing:**
- Button changes to **"Stop"** (red background)
- Click again to stop the preview
- You can preview different components (previous one stops automatically)

### Step 4: Add to Timeline

Once you're happy with how a component sounds:
1. Click the **"Add"** button, OR
2. **Drag and drop** it onto the timeline

**The component will sound IDENTICAL to the preview!**

## Features Explained

### 🎵 Accurate Rhythm Playback

The audition system plays:
- ✅ **Entry delays** (rests before the first note)
- ✅ **Note durations** (whole, half, quarter, eighth notes, etc.)
- ✅ **Rests** (silences within the melody)
- ✅ **Custom rhythms** (from Rhythm Controls)

### 🎹 Tempo Awareness

The audition plays at your current song tempo:
- Change the **Tempo (BPM)** slider
- Re-audition to hear the difference
- Perfect for finding the right speed

### 🎼 Multi-Part Components

For imitations and fugues with multiple parts:
- The audition plays only the FIRST part
- This lets you hear the melody clearly
- When added to timeline, ALL parts play together

### 🔊 Default Instrument

All auditions use **piano** by default:
- Clear, recognizable sound
- Once added to timeline, you can change instruments
- Each track can have a different instrument

## Example Workflow

### Workflow 1: Building a Fugue Arrangement

```
1. Generate a fugue with 4 voices
2. Click "Play" next to the fugue voice components
3. Listen to Voice 1 (subject)
4. Listen to Voice 2 (answer)
5. Add voices to timeline in the order you like
6. Arrange their timing by dragging
7. Play the full timeline to hear all voices together
```

### Workflow 2: Experimenting with Counterpoint

```
1. Create a main theme
2. Generate several counterpoint variations
3. Click "Play" on each counterpoint
4. Compare which sounds best against your theme
5. Add your favorite to the timeline
6. Generate more and repeat!
```

### Workflow 3: Testing Entry Delays

```
1. Generate an imitation with 4-beat delay
2. Click "Play" to audition
3. Listen for the 4 beats of silence
4. Verify the delay is correct
5. Add to timeline - delay is preserved!
```

## Visual Indicators

### Available Components Panel

Each component shows:
- **Color dot** - Visual identification
- **Name** - e.g., "Main Theme", "Imitation #1 - Original"
- **Note count** - e.g., "9 notes"
- **🎵 Rhythm badge** - Shows if custom rhythm is set
- **Description** - e.g., "With custom rhythm"

### Audition State

- **Gray "Play" button** - Ready to audition
- **Green "Stop" button** - Currently playing
- **Toast notification** - "Playing: [Component Name]"
- **Completion toast** - "Finished: [Component Name]"

## Tips & Tricks

### 💡 Quick Comparison

Want to compare two similar components?
1. Click Play on Component A
2. Let it finish (or click Stop)
3. Immediately click Play on Component B
4. Compare the sounds in your head!

### 💡 Fine-Tune Before Adding

Not happy with a rhythm?
1. Audition the component
2. Go back to the original component's Rhythm Controls
3. Adjust the rhythm
4. Audition again
5. Repeat until perfect
6. Now add to timeline!

### 💡 Test Tempo Changes

Finding the right tempo:
1. Audition a component
2. Adjust the tempo slider
3. Audition again at new tempo
4. Keep adjusting until it grooves!

### 💡 Multi-Select Workflow

Planning to add multiple components?
1. Hold **Ctrl** (or **Cmd** on Mac)
2. Click to select multiple components
3. Audition the selected ones individually
4. Click **"Add Selected"** to add them all at once

## Troubleshooting

### "No sound when I click Play"

**Check:**
- ✅ Is your device volume up?
- ✅ Did the browser ask for audio permission? (approve it)
- ✅ Are other sounds working in the app?
- ✅ Try refreshing the page

### "Component sounds different on timeline"

This should NOT happen! The audition and timeline use the same playback system. If you notice a difference:
1. Check the console for errors (F12)
2. Make sure the component has rhythm data
3. Verify the tempo hasn't changed
4. Report the bug with details

### "Audition keeps playing forever"

This shouldn't happen, but if it does:
1. Click the **Stop** button again
2. Refresh the page if needed
3. The audition should auto-stop when done

### "I don't see the Play button"

Make sure you:
1. Are in the **Complete Song Creation Suite**
2. Have components in the **Available Components** panel
3. Created at least a theme, imitation, fugue, or counterpoint

## Technical Details

### What Makes This Accurate?

The audition system uses a **Unified Playback Engine** that:
- Interprets rhythm data the SAME way everywhere
- Preserves entry delays and rests perfectly
- Handles both modern and legacy rhythm formats
- Uses the same soundfont engine as the timeline

### Data Flow

```
Theme/Imitation/Fugue Creation
    ↓
    ├─ Melody (MIDI notes)
    ├─ Rhythm (timing data from Rhythm Controls)
    └─ NoteValues (quarter, half, rest, etc.)
    ↓
Available Components
    ↓
Audition Preview ←→ SAME ALGORITHM ←→ Timeline Playback
    ↓
IDENTICAL SOUND
```

## Advanced Features

### For Power Users

The audition system respects:
- **Species counterpoint rhythms** (from species rules)
- **Entry delays** (from fugue/imitation generation)
- **Rest duration maps** (from enhanced theme composer)
- **Tied notes** (consecutive rhythm values)

All of this happens automatically - you don't need to do anything special!

## Comparison: Before vs After

### Before This Feature ❌

```
1. Create a component
2. Wonder how it will sound
3. Add it to the timeline
4. Play the timeline
5. Realize it's not what you wanted
6. Delete it
7. Start over
```

### After This Feature ✅

```
1. Create a component
2. Click "Play" to audition
3. Hear EXACTLY how it will sound
4. Add to timeline with confidence
5. Done!
```

## Keyboard Shortcuts (Planned)

_Future enhancement:_
- `Space` - Play/Stop selected component
- `A` - Audition selected component
- `Enter` - Add selected component to timeline

## Related Features

Works perfectly with:
- ✅ **Rhythm Controls** - Custom rhythm data is preserved
- ✅ **Multi-Select** - Audition before batch-adding
- ✅ **Drag & Drop** - Audition then drag to timeline
- ✅ **Track Duplication** - Duplicate includes rhythm data
- ✅ **MIDI Export** - Exported rhythm matches audition

## Summary

The Component Audition feature gives you **confidence and control**:
- 🎧 **Preview before committing**
- 🎯 **Know exactly what you're getting**
- ⏱️ **Save time** by not adding wrong components
- 🎵 **Trust the timing** - it's always accurate

**No more guessing. Just great music!**

---

## Questions?

If you have questions about this feature:
1. Check the console (F12) for detailed logging
2. Look for 🎵 [Audition] messages
3. The system explains what it's doing in real-time

## Next Steps

Try it now:
1. Generate a few components
2. Click some Play buttons
3. Listen to the previews
4. Add your favorites to the timeline
5. Create amazing music!

Enjoy your new audition powers! 🎵✨
