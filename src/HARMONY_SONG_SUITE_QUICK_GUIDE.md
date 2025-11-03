# Harmony in Song Suite - Quick Visual Guide 🎵

## 5-Second Summary
**Harmonies now appear in the Complete Song Creation Suite just like Counterpoints, Fugues, and Canons!**

---

## Visual Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Generate Harmony                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Harmonic Engine Suite                                      │
│  ┌────────────────────────────────────────────┐             │
│  │ Configure harmony parameters              │             │
│  │ • Voicing: Block / Spread / Arpeggiated   │             │
│  │ • Density: 3-7 notes                      │             │
│  │ • Chord Quality: Triads / Sevenths / 9ths│             │
│  └────────────────────────────────────────────┘             │
│                                                              │
│         [Harmonize Example Melody]  ← Click this            │
│                                                              │
│  ✅ Harmony Generated Successfully!                         │
│     Key: C major, 8 chords                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

                           ↓

┌─────────────────────────────────────────────────────────────┐
│ STEP 2: View in Song Suite                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Complete Song Creation Suite → Compose Tab                 │
│                                                              │
│  Available Components (5)                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 🎵 Theme: Main Theme                              │     │
│  │    8 notes • piano                                │     │
│  ├────────────────────────────────────────────────────┤     │
│  │ 🎹 Counterpoint #1                                │     │
│  │    12 notes • violin                              │     │
│  ├────────────────────────────────────────────────────┤     │
│  │ 🎼 Harmonized Melody #1                ← NEW!     │     │
│  │    15 notes • 8 chords • strings       ← CYAN     │     │
│  │    Drag or Ctrl+Click to select                   │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘

                           ↓

┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Add to Timeline                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Option A: Drag & Drop                                      │
│  • Click and drag harmony to timeline                       │
│  • Drop at desired beat position                            │
│                                                              │
│  Option B: Multi-Select                                     │
│  • Hold Ctrl (Cmd on Mac)                                   │
│  • Click multiple harmonies                                 │
│  • Click "Add Selected (3)"                                 │
│                                                              │
│  Timeline:                                                   │
│  ┌──────────────────────────────────────────────┐           │
│  │ Track 1: Theme          [████████]          │           │
│  │ Track 2: Counterpoint   [██████████]        │           │
│  │ Track 3: Harmony #1     [████████████] ← NEW│           │
│  │          (cyan colored)                     │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

                           ↓

┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Manage & Play                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Track Controls:                                            │
│  • Change instrument: [strings ▼]                           │
│  • Mute/Unmute: [🔊]                                        │
│  • Delete: [🗑️]                                             │
│  • Duplicate: [📋]                                          │
│                                                              │
│  Playback:                                                   │
│  [▶️ Play] [⏸️ Pause] [⏹️ Stop]                              │
│                                                              │
│  Export:                                                     │
│  • MIDI file (with harmony data)                            │
│  • MusicXML (with chord symbols)                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Color Coding

```
Component Type           Color
──────────────────────  ─────────────
Theme                   🟣 Purple
Imitation               🔵 Blue
Fugue                   🟢 Green
Counterpoint            🟢 Green
Canon                   🔴 Pink
Bach Variables          🟠 Orange
Harmony                 🔵 Cyan     ← NEW!
```

---

## Quick Actions

### Generate Harmony:
1. Scroll to "Harmonic Engine Suite"
2. Click "Harmonize Example Melody"
3. ✅ Done! Automatically added to Song Suite

### Add to Song:
1. Open "Complete Song Creation" tab
2. Find "Harmonized Melody #1" (cyan)
3. Drag to timeline OR Ctrl+Click and "Add Selected"
4. ✅ Done! Ready to play

### Change Instrument:
1. Find harmony track on timeline
2. Click instrument dropdown
3. Select new instrument (e.g., piano, strings, brass)
4. ✅ Done! Plays with new instrument

### Mute/Unmute:
1. Find harmony track
2. Click speaker icon 🔊/🔇
3. ✅ Done! Muted/unmuted

### Clear Harmony:
1. Find harmony in components list
2. Click trash icon 🗑️
3. ✅ Done! Removed from list

---

## Multi-Select Example

```
Available Components (4)
┌────────────────────────────────────┐
│ ☑ Counterpoint #1                 │ ← Ctrl+Click
│ ☐ Canon #1                        │
│ ☑ Harmonized Melody #1            │ ← Ctrl+Click
│ ☑ Harmonized Melody #2            │ ← Ctrl+Click
└────────────────────────────────────┘

        ↓ Click "Add Selected (3)"

Timeline now has 3 new tracks!
```

---

## Console Output Example

```javascript
🎵 Harmony generated, adding to list...
  Harmonized part: { melody: [...], chordLabels: [...] }
  Instrument: strings
✅ Harmony added successfully to Song Suite

🎼 Building available components...
  Harmonized Melodies count: 1
  🎵 Processing Harmonized Melodies...
  🎵 Processing Harmonized Melody #1: 15 notes, 8 chords
    🎵 Using harmony rhythm data (15 values)
  ✅ Added Harmonized Melody #1 (15 notes, 8 chords)
  ✅ Completed processing 1 harmonized melodies

🎼 Total available components: 5 (5 successfully added)
```

---

## Toast Notifications

```
✅ Harmony added to Song Suite!
   8 chords • strings

✅ Track added: Harmonized Melody #1

✅ Harmony mute toggled

✅ Harmony #1 cleared
```

---

## Troubleshooting

### "Harmony not showing in Song Suite"
✅ Check that you clicked "Harmonize" button  
✅ Look for cyan-colored component in list  
✅ Check console for "Harmony added successfully"  

### "Can't drag harmony to timeline"
✅ Make sure you're in "Compose" tab  
✅ Try clicking and holding before dragging  
✅ Or use Ctrl+Click and "Add Selected"  

### "Harmony not playing"
✅ Check if track is muted (speaker icon)  
✅ Verify instrument is selected  
✅ Check master volume  

---

## Feature Comparison

```
Feature                 Counterpoint  Fugue  Canon  Harmony
─────────────────────── ───────────── ────── ────── ────────
Appears in Components   ✅            ✅     ✅     ✅
Drag & Drop            ✅            ✅     ✅     ✅
Multi-Select           ✅            ✅     ✅     ✅
Instrument Control     ✅            ✅     ✅     ✅
Mute/Unmute           ✅            ✅     ✅     ✅
Clear Individual       ✅            ✅     ✅     ✅
Clear All             ✅            ✅     ✅     ✅
MIDI Export           ✅            ✅     ✅     ✅
MusicXML Export       ✅            ✅     ✅     ✅
Playback              ✅            ✅     ✅     ✅
```

**All features work identically!** 🎉

---

## Next Steps

1. ✅ Generate harmony in Harmony Engine Suite
2. ✅ Find it in Song Suite components (cyan color)
3. ✅ Drag to timeline or use multi-select
4. ✅ Adjust instrument, volume, position
5. ✅ Play with your full composition
6. ✅ Export to MIDI/MusicXML

**That's it! Simple, consistent, powerful.** 🎵✨

---

## Example Session

```
09:00 - Generate main theme (8 notes)
09:01 - Create counterpoint (Species II)
09:02 - Generate harmony for theme ← NEW!
09:03 - Open Song Suite
09:04 - Add all 3 to timeline (multi-select)
09:05 - Arrange tracks, adjust instruments
09:06 - Play full composition
09:07 - Export to MIDI
09:08 - 🎉 Complete musical piece ready!
```

---

**The Harmony Engine integration makes it easier than ever to create rich, professional-sounding compositions in minutes!** 🎼
