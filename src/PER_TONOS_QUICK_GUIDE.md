# Per Tonos Enhancement - Quick Reference Guide

## What's New?

The Per Tonos canon type now supports **individual voice transposition intervals** and **modulation target visualization**!

---

## Quick Start

### Option 1: Standard Per Tonos (Classic Behavior)
1. Select **"Per Tonos"** from Canon Type dropdown
2. Set **Number of Voices** (2-6)
3. Set **Transposition Interval** (semitones)
4. Set **Entry Delay** (beats)
5. Keep **"Per Tonos Advanced Mode"** disabled
6. Click **"Generate Per Tonos"**

**Result:** Each voice transposes cumulatively (×1, ×2, ×3 of base interval)

---

### Option 2: Advanced Per Tonos (NEW!)
1. Select **"Per Tonos"** from Canon Type dropdown
2. Set **Number of Voices** (2-6)
3. **Enable "Per Tonos Advanced Mode"** toggle button
4. Configure individual intervals for each voice:
   - Use sliders to set custom transposition
   - Or click preset buttons (0, +4, +7, +12)
5. Review **Modulation Plan** panel
6. Click **"Generate Per Tonos"**

**Result:** Each voice uses its own unique transposition interval

---

## UI Controls

### Advanced Mode Toggle
- **Location:** Appears when Per Tonos is selected
- **States:** 
  - Disabled (default) = Standard cumulative behavior
  - Enabled = Individual voice intervals

### Voice Interval Cards
- **Appears when:** Advanced Mode enabled
- **Number of cards:** Equals (Number of Voices - 1)
- **Each card contains:**
  - Voice number label
  - Current interval display with name
  - Slider control (-24 to +24 semitones)
  - Quick preset buttons (0, +4, +7, +12)

### Modulation Plan Display
- **Shows:** Complete voice modulation summary
- **Format:** 
  ```
  Voice 1 (Leader): Original key
  Voice 2: +4 semitones (Major 3rd)
  Voice 3: +7 semitones (Perfect 5th)
  Voice 4: +12 semitones (Octave)
  ```

---

## Common Interval Presets

| Semitones | Interval Name | Musical Effect |
|-----------|---------------|----------------|
| 0 | Unison | Same key |
| +4 | Major 3rd | Major chord feeling |
| +5 | Perfect 4th | Subdominant |
| +7 | Perfect 5th | Dominant |
| +12 | Octave | Same key, higher register |
| -5 | Perfect 4th down | Descending subdominant |
| -12 | Octave down | Same key, lower register |

---

## Musical Examples

### Example 1: I-IV-V-I Progression
**Configuration:**
- Voice 1: Original (I)
- Voice 2: +5 semitones (IV)
- Voice 3: +7 semitones (V)
- Voice 4: +12 semitones (I octave)

**Effect:** Creates a classic harmonic progression through the canon

---

### Example 2: Chromatic Ascent
**Configuration:**
- Voice 1: Original
- Voice 2: +1 semitone
- Voice 3: +2 semitones
- Voice 4: +3 semitones
- Voice 5: +4 semitones

**Effect:** Gradually rising chromatic texture

---

### Example 3: Harmonic Series
**Configuration:**
- Voice 1: Original
- Voice 2: +12 semitones (Octave)
- Voice 3: +19 semitones (Octave + 5th)
- Voice 4: +24 semitones (2 Octaves)

**Effect:** Natural harmonic overtone series

---

## Tips & Tricks

### Tip 1: Start Simple
Begin with Advanced Mode disabled to understand basic Per Tonos behavior, then enable it to experiment.

### Tip 2: Use Common Intervals
Start with presets (+4, +7, +12) for musical results, then customize.

### Tip 3: Watch the Modulation Plan
The modulation plan helps you understand harmonic relationships before generating.

### Tip 4: Try Negative Intervals
Don't forget you can transpose down! Negative intervals create descending effects.

### Tip 5: Adjust Voice Count First
Set your desired number of voices before configuring intervals, as this determines how many voice cards appear.

---

## Keyboard Shortcuts & Quick Actions

### Quick Interval Setting
- **0 button:** Set to Unison (same key)
- **+4 button:** Set to Major 3rd
- **+7 button:** Set to Perfect 5th
- **+12 button:** Set to Octave

### Slider Range
- **Min:** -24 semitones (2 octaves down)
- **Max:** +24 semitones (2 octaves up)
- **Step:** 1 semitone

---

## Comparison: Standard vs. Advanced

### Standard Per Tonos (Advanced Mode OFF)
```
Base Interval: +7 semitones (Fifth)
Voices: 4

Voice 1: Original (0)
Voice 2: +7 semitones (1× base)
Voice 3: +14 semitones (2× base)
Voice 4: +21 semitones (3× base)
```

### Advanced Per Tonos (Advanced Mode ON)
```
Individual Intervals Configured:
Voices: 4

Voice 1: Original (0)
Voice 2: +4 semitones (Major 3rd)
Voice 3: +7 semitones (Fifth)
Voice 4: +12 semitones (Octave)
```

---

## Troubleshooting

### Q: I don't see the Advanced Mode toggle
**A:** Make sure you've selected "Per Tonos" from the Canon Type dropdown.

### Q: The voice cards don't match my voice count
**A:** Adjust the "Number of Voices" slider. Voice cards will update automatically.

### Q: How do I reset to standard behavior?
**A:** Click the Advanced Mode toggle button to disable it. The canon will generate using cumulative intervals.

### Q: Can I save my interval configurations?
**A:** Currently, interval settings reset when changing canon types. This is a potential future enhancement.

### Q: What's the difference between the main Transposition Interval and voice intervals?
**A:** 
- **Main Transposition Interval:** Used when Advanced Mode is OFF (cumulative)
- **Voice Intervals:** Used when Advanced Mode is ON (individual per voice)

---

## Integration with Other Features

### Works With:
- ✅ All modal systems (Dorian, Phrygian, etc.)
- ✅ All instruments
- ✅ Entry delay controls
- ✅ CanonVisualizer
- ✅ Complete Song Creation Suite
- ✅ Professional Timeline
- ✅ MIDI Export
- ✅ MusicXML Export

### Preserves:
- ✅ Modal relationships from selected mode
- ✅ Rhythm patterns
- ✅ All voice metadata
- ✅ Playback functionality

---

## Visual Guide

```
┌─────────────────────────────────────────────────────┐
│  Canon Generator                                     │
├─────────────────────────────────────────────────────┤
│  Canon Type: [Per Tonos ▼]                          │
│  Entry Delay: [════●════] 4 beats                    │
│  Number of Voices: [══●════] 3 voices                │
│                                                       │
│  ╔═══════════════════════════════════════════════╗  │
│  ║ Per Tonos Advanced Mode    [Enabled ✓]       ║  │
│  ║                                                ║  │
│  ║ Individual Voice Transposition Intervals      ║  │
│  ║                                                ║  │
│  ║ ┌──────────────────────────────────────────┐  ║  │
│  ║ │ Voice 2 Interval        +4 semitones     │  ║  │
│  ║ │ [════●══════════════] (Major 3rd)        │  ║  │
│  ║ │ [0] [+4] [+7] [+12]                      │  ║  │
│  ║ └──────────────────────────────────────────┘  ║  │
│  ║                                                ║  │
│  ║ ┌──────────────────────────────────────────┐  ║  │
│  ║ │ Voice 3 Interval        +7 semitones     │  ║  │
│  ║ │ [══════●════════════] (Fifth)            │  ║  │
│  ║ │ [0] [+4] [+7] [+12]                      │  ║  │
│  ║ └──────────────────────────────────────────┘  ║  │
│  ║                                                ║  │
│  ║ Modulation Targets                            ║  │
│  ║ ┌──────────────────────────────────────────┐  ║  │
│  ║ │ Voice Modulation Plan:                   │  ║  │
│  ║ │ • Voice 1 (Leader): Original key         │  ║  │
│  ║ │ • Voice 2: +4 semitones (Major 3rd)      │  ║  │
│  ║ │ • Voice 3: +7 semitones (Perfect 5th)    │  ║  │
│  ║ └──────────────────────────────────────────┘  ║  │
│  ╚═══════════════════════════════════════════════╝  │
│                                                       │
│  [✨ Generate Per Tonos]                             │
└─────────────────────────────────────────────────────┘
```

---

## Remember

- **Standard Mode** (Advanced OFF) = Classic cumulative Per Tonos behavior
- **Advanced Mode** (Advanced ON) = Individual voice interval configuration
- **All existing functionality preserved** = No breaking changes
- **Same output pipeline** = Works with all existing features

---

## Need Help?

Refer to the complete documentation: **PER_TONOS_ENHANCEMENT_COMPLETE.md**

Experiment with different interval combinations to discover unique harmonic effects!
