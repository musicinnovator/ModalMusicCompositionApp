# Professional Timeline - Quick Start Guide ⚡

## 🎯 5-Minute Quick Start

### Step 1: Generate a Component (30 seconds)

1. **Go to Harmony Engine**
2. **Enter a melody** or use Theme Composer
3. **Click "Harmonize Melody"**
4. **Wait for harmony to generate**

### Step 2: Open Timeline (10 seconds)

1. **Scroll to "Complete Song Creation Suite"**
2. **Click the "Timeline" tab** (⚡ Zap icon)
3. **You should see**: Empty timeline with component at bottom

### Step 3: Add to Timeline (20 seconds)

1. **Look at bottom panel**: "Available Components"
2. **Click "+ Harmony 1"** button
3. **Watch**: Clip appears on timeline
4. **Auto-creation**: Track created automatically

### Step 4: Play! (10 seconds)

1. **Click the Play button** (▶️)
2. **Watch**: Red playhead moves smoothly
3. **Listen**: Hear FULL CHORDS (not single notes!)
4. **Success!** ✅

---

## 🎵 What You Should Hear

### ✅ CORRECT (Full Harmony Chords):
```
🎹 C Major Chord: C + E + G (all together)
🎹 F Major Chord: F + A + C (all together)
🎹 G Major Chord: G + B + D (all together)
```

### ❌ WRONG (Old Timeline Behavior):
```
🎹 C Major Chord: C (only one note)
🎹 F Major Chord: F (only one note)
🎹 G Major Chord: G (only one note)
```

---

## 🎛️ Controls Cheat Sheet

### Transport Controls
| Button | Action |
|--------|--------|
| ▶️ Play | Start playback |
| ⏸️ Pause | Pause (can resume) |
| ⏹️ Stop | Stop and return to start |
| ⏮️ Skip Back | Return to beginning |

### Timeline Controls
| Action | How To |
|--------|--------|
| Seek | Click on ruler |
| Zoom | Use zoom slider |
| Adjust Tempo | Change BPM input |
| Show/Hide Mixer | Click "Mixer" button |

### Track Controls (In Mixer)
| Button | Action |
|--------|--------|
| M | Mute track |
| S | Solo track (hear only this) |
| 🗑️ | Delete track |
| Volume Slider | Adjust track volume |

---

## 🧪 Test Scenario

### Test Full Chord Playback

**What to do:**
1. Generate a harmony (minimum 3 notes per chord)
2. Add to timeline
3. Click Play
4. Listen carefully

**What to expect:**
- ✅ Rich, full chords
- ✅ All harmony notes playing simultaneously
- ✅ Playhead synced to audio
- ✅ Smooth 60fps animation

**If you hear single notes:**
- ❌ Audio engine not using scheduled time
- ❌ Web Audio scheduling broken
- ❌ Check console for errors

---

## 🎨 Visual Guide

```
┌─────────────────────────────────────────────────────┐
│ 🎵 Professional Timeline                            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ⏹️ ▶️ ⏮️   Position: 1.1   BPM: [120]  Zoom: [1x] │
│                                                      │
├──────────┬──────────────────────────────────────────┤
│  MIXER   │  TIMELINE                                │
│          │  ┌───────────────────────────────────┐  │
│  Track 1 │  │  1   2   3   4   5   6   7   8   │  │
│  ┌─────┐ │  ├───────────────────────────────────┤  │
│  │  M  │ │  │  ┌──────┐                        │  │
│  │  S  │ │  │  │ Clip │                        │  │
│  │ Vol │ │  │  └──────┘                        │  │
│  └─────┘ │  └───────────────────────────────────┘  │
│          │              ↑ Playhead (red line)       │
└──────────┴──────────────────────────────────────────┘
│ Available: [+ Harmony 1] [+ Fugue 1] [+ Canon 1]   │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Component Types Supported

| Type | What It Is | Example |
|------|------------|---------|
| 🎹 Harmony | Harmonized melody | Chords beneath melody |
| 🎼 Imitation | Melodic imitation | Canon-like entries |
| 🎻 Fugue | Fugue subjects | Bach-style fugues |
| 🔁 Canon | Canon voices | Round-style canons |
| 📝 Counterpoint | Species counterpoint | Classical voice-leading |
| 🎵 Generated Fugue | AI fugues | 14 architectures |

---

## ⚡ Pro Tips

### 1. **Organize by Instrument**
- Timeline auto-groups components by instrument
- Each instrument gets its own track
- Color-coded for easy identification

### 2. **Use Solo for Mixing**
- Click "S" on one track
- Hear only that track
- Adjust volume perfectly

### 3. **Click Ruler to Jump**
- Click anywhere on timeline ruler
- Instantly seek to that position
- Great for reviewing sections

### 4. **Adjust Playback Speed**
- Change BPM to slow down for analysis
- Or speed up for final playback
- Real-time tempo changes

### 5. **Master Volume**
- Use master volume slider
- Affects all tracks globally
- Mute button for instant silence

---

## 🐛 Troubleshooting

### "I hear single notes, not chords"
**Check:**
1. Is component a harmony? (should have multiple notes)
2. Console shows scheduled notes?
3. Audio engine initialized?

**Solution:** 
- Verify `scheduledTime` is same for all notes
- Check console logs for timing

### "Playhead doesn't move smoothly"
**Check:**
1. Browser tab is active?
2. High CPU usage?
3. Console errors?

**Solution:**
- Close other tabs
- Check performance monitor
- Refresh page

### "No sound when playing"
**Check:**
1. Master volume not zero?
2. Track not muted?
3. Audio engine ready?

**Solution:**
- Check volume sliders
- Look for "M" lit up on tracks
- Wait for initialization

### "Component doesn't appear"
**Check:**
1. Component has valid data?
2. Melody and rhythm arrays exist?
3. Console errors?

**Solution:**
- Re-generate component
- Check console for errors
- Refresh page

---

## 📈 Performance Tips

### For Best Performance:
- ✅ Use Chrome or Edge (best Web Audio support)
- ✅ Close unused tabs
- ✅ Limit to 16 tracks maximum
- ✅ Keep clips under 1000 notes each
- ✅ Disable browser extensions

### If Laggy:
- 🔧 Reduce zoom level
- 🔧 Hide mixer panel
- 🔧 Delete unused tracks
- 🔧 Lower BPM temporarily
- 🔧 Restart browser

---

## 🎯 Next Steps

### Once You're Comfortable:

1. **Try Multiple Components**
   - Add 3-4 different harmonies
   - Mix and match instruments
   - Create layered arrangements

2. **Experiment with Mixing**
   - Solo different tracks
   - Adjust relative volumes
   - Create dynamic balance

3. **Export Your Work**
   - Go to Export tab
   - Download as MIDI
   - Use in other DAWs

4. **Explore Advanced Features**
   - Piano roll editor (future)
   - Automation lanes (future)
   - Effect inserts (future)

---

## ✅ Success Checklist

You've mastered the timeline when:

- [ ] Can add components to timeline
- [ ] Can play and hear full chords
- [ ] Can use mixer controls
- [ ] Can seek to different positions
- [ ] Can adjust tempo
- [ ] Can mute/solo tracks
- [ ] Can delete unwanted tracks
- [ ] Understand playhead movement
- [ ] Can troubleshoot common issues

---

## 🎊 You're Ready!

The Professional Timeline is now your **complete DAW-quality composition tool**. 

**Key Features:**
- ✅ Sample-accurate playback
- ✅ Full chord support
- ✅ Professional mixer
- ✅ Intuitive interface
- ✅ Zero data loss

**What's Different:**
- ❌ OLD: Single notes, broken timing, data loss
- ✅ NEW: Full chords, perfect sync, reliable pipeline

**Go create something amazing!** 🎵🚀
