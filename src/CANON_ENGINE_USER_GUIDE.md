# 🎵 Canon Engine User Guide

## Overview

The **Canon Engine** is a comprehensive classical canon generation system that adds **14+ canon types** to your Modal Music Composition App. It implements sophisticated algorithms from the Renaissance and Baroque eras, enabling you to create complex contrapuntal works with mathematical precision and musical beauty.

## What is a Canon?

A **canon** is a contrapuntal compositional technique where a melody (the "leader") is imitated by one or more voices (the "followers") at a specific time delay and pitch interval. The Canon Engine automates this process while preserving modal relationships and allowing for creative variations.

---

## ✨ Features Added

### 1. **Core Canon Types** (6 Fundamental Algorithms)

#### 🎼 **Strict Canon**
- **Description**: Classic imitation at a fixed interval
- **How it works**: Follower voices repeat the leader melody exactly, transposed by the specified interval
- **Parameters**:
  - Entry Delay: 1-16 beats
  - Transposition Interval: -24 to +24 semitones
  - Number of Voices: 2-6
- **Use cases**: Traditional canon composition, educational counterpoint exercises
- **Historical examples**: Pachelbel's Canon in D

#### 🔄 **Canon by Inversion**
- **Description**: Melody mirrored around an axis (contrary motion)
- **How it works**: Follower plays the melody upside-down, with ascending intervals becoming descending
- **Parameters**:
  - Entry Delay: 1-16 beats
  - Inversion Axis: MIDI 48-84 (C3-C6)
  - Optional transposition
- **Use cases**: Creating harmonic balance, mirror canons
- **Historical examples**: Bach's *The Art of Fugue*, BWV 1080

#### ⏱️ **Rhythmic Canon** (Mensuration/Augmentation/Diminution)
- **Description**: Follower at different speed (augmentation/diminution)
- **How it works**: Follower plays same notes but stretched (augmentation) or compressed (diminution) in time
- **Parameters**:
  - Entry Delay: 1-16 beats
  - Mensuration Ratio: 0.5x to 4.0x
    - < 1.0 = Diminution (faster follower)
    - > 1.0 = Augmentation (slower follower)
    - Common ratios: 2:1, 3:2, 4:3
- **Use cases**: Polytemporal textures, rhythmic complexity
- **Historical examples**: Ockeghem, Josquin

#### 🎭 **Double Canon**
- **Description**: Two independent canons running simultaneously
- **How it works**: Creates two separate leader-follower pairs that play at the same time
- **Parameters**:
  - Entry Delays: Staggered for 4 voices
  - Intervals: Different for each canon
- **Use cases**: Complex polyphonic textures, advanced contrapuntal writing
- **Historical examples**: Brahms' Motets Op. 29

#### 🦀 **Crab Canon** (Retrograde)
- **Description**: Palindromic - follower plays backward
- **How it works**: Follower plays the melody in reverse order
- **Parameters**:
  - Entry Delay: 1-16 beats
  - Optional transposition
- **Use cases**: Symmetrical compositions, musical palindromes
- **Historical examples**: Bach's *Musical Offering*, BWV 1079

#### 🔁 **Retrograde-Inversion**
- **Description**: Two-dimensional mirror (pitch + time)
- **How it works**: Combines inversion (pitch mirroring) with retrograde (time reversal)
- **Parameters**:
  - Entry Delay: 1-16 beats
  - Inversion Axis: MIDI 48-84
- **Use cases**: Ultimate contrapuntal complexity, serial techniques
- **Historical examples**: Bach's *The Art of Fugue*, Contrapunctus XIII

---

### 2. **Additional Canon Variations** (8 Special Types)

All variations are accessible through the **Canon Type** dropdown:

#### **Per Augmentationem**
- Pre-configured Rhythmic Canon with 2:1 augmentation
- Follower plays twice as slow

#### **Ad Diapente**
- Strict canon at the perfect fifth (7 semitones)
- Classical interval for fugal answers

#### **Mensuration Canon**
- Polytemporal canon with flexible ratio relationships
- Supports complex ratios like 3:2, 4:3

#### **Perpetual Canon**
- Endless round that loops seamlessly
- Used for continuous cycling structures

---

## 🎨 How to Use the Canon Engine

### Step 1: Create a Theme
1. Navigate to the **Theme Composer**
2. Create or import a theme (melody)
3. The theme becomes the "leader" voice

### Step 2: Select a Mode
1. Choose a key signature (e.g., C Major, D Dorian)
2. Select a mode from the 80+ available modes
3. This ensures all canons stay within modal constraints

### Step 3: Open Canon Controls
1. Scroll to the **Canon Generator** section in the left column
2. Select a **Canon Type** from the dropdown
3. Adjust parameters:
   - **Entry Delay**: How many beats before follower enters
   - **Transposition Interval**: How far to transpose the follower
   - **Number of Voices**: 2-6 voices (for applicable types)
   - **Mensuration Ratio**: Tempo ratio (for rhythmic canons)
   - **Inversion Axis**: Center pitch for inversion (for inversion canons)

### Step 4: Generate
1. Click **Generate [Canon Type]**
2. The canon appears in the **Canons** section in the right column

### Step 5: Play and Customize
1. Each canon voice has its own:
   - **Instrument selector** (14+ professional instruments)
   - **Mute/Solo** controls
   - **Melody visualization**
2. Use the **Canon Playback** player to hear the result
3. Export to MIDI or include in the Song Creation Suite

---

## 🎯 Example Workflows

### Example 1: Simple Octave Canon
**Goal**: Create a 2-voice canon at the octave with 4-beat delay

1. Create a theme: `[60, 62, 64, 65, 67, 65, 64, 62, 60]` (C major scale)
2. Select **Mode**: Ionian (Major) on C
3. Canon Controls:
   - **Type**: Strict Canon
   - **Interval**: 12 semitones (octave)
   - **Delay**: 4 beats
   - **Voices**: 2
4. Generate → Hear both voices in perfect imitation

### Example 2: Mirror Canon with Inversion
**Goal**: Create a canon where the follower plays upside-down

1. Create a theme with distinctive melodic contour
2. Select **Mode**: Dorian or Phrygian (for interesting intervals)
3. Canon Controls:
   - **Type**: Canon by Inversion
   - **Inversion Axis**: 60 (Middle C)
   - **Delay**: 2 beats
4. Generate → Follower mirrors the melody

### Example 3: Augmentation Canon (Slow Motion)
**Goal**: Follower plays same melody but twice as slow

1. Create a rhythmic theme
2. Select any mode
3. Canon Controls:
   - **Type**: Per Augmentationem (or Rhythmic Canon)
   - **Mensuration Ratio**: 2.0x
   - **Delay**: 0 beats (simultaneous start)
4. Generate → Creates polytemporal texture

### Example 4: Four-Voice Fugal Canon
**Goal**: Build up to 4 voices with staggered entries

1. Create a fugue-like theme
2. Select **Mode**: Any
3. Canon Controls:
   - **Type**: Strict Canon
   - **Interval**: 7 semitones (fifth)
   - **Delay**: 4 beats
   - **Voices**: 4
4. Generate → Four voices enter every 4 beats

---

## 📊 Parameter Reference

### Entry Delay
- **Range**: 1-16 beats
- **Effect**: Time between voice entries
- **Tip**: Use multiples of 2 or 4 for musical phrasing

### Transposition Interval
- **Range**: -24 to +24 semitones
- **Common values**:
  - 0: Unison (same pitch)
  - 7: Perfect fifth
  - 12: Octave up
  - -12: Octave down
- **Tip**: Use 0, 7, or 12 for consonant canons

### Mensuration Ratio
- **Range**: 0.5x to 4.0x
- **Effect**: Follower speed relative to leader
- **Common ratios**:
  - 0.5: Double speed (diminution)
  - 1.5: 3:2 ratio (hemiola)
  - 2.0: Half speed (augmentation)
- **Tip**: Ratios like 3:2 create interesting polyrhythms

### Inversion Axis
- **Range**: MIDI 48-84 (C3-C6)
- **Effect**: Center pitch for melodic inversion
- **Tip**: Set to the theme's median pitch for balanced results

---

## 🎼 Musical Theory Behind the Engine

### Diatonic vs. Chromatic Transposition
- **Diatonic**: Transposes using scale degrees (preserves mode)
- **Chromatic**: Transposes by semitones (may leave mode)
- The engine uses **diatonic transposition** when a mode is selected

### Voice Entry Patterns
The engine implements classical entry patterns:
- **Strict**: All voices at same interval
- **Fugal**: Alternating tonic/dominant
- **Staggered**: Irregular delays for interest

### Rhythm Handling
- Entry delays are encoded as initial rests
- Mensuration ratios scale note durations
- All rhythms are quantized to beat grid

---

## 💡 Tips & Best Practices

### For Beginners
1. Start with **Strict Canon** at octave or fifth
2. Use short themes (4-8 notes) for clarity
3. Begin with 2 voices, add more gradually
4. Use **Entry Delay** of 4 beats for clear separation

### For Intermediate Users
1. Experiment with **Canon by Inversion** for contrast
2. Try **Rhythmic Canon** with 3:2 ratio
3. Use **Double Canon** for rich textures
4. Combine canons with counterpoint in Song Suite

### For Advanced Users
1. **Crab Canon**: Palindromic themes work best
2. **Retrograde-Inversion**: Use for dense, complex textures
3. Layer multiple canon types in Song Creation Suite
4. Export to MIDI for further editing in a DAW

---

## 🔧 Integration with Existing Features

### Works with:
✅ **80+ Modal Modes**: All canons respect modal constraints  
✅ **Stability Bias**: Apply before canon generation  
✅ **Rhythm Controls**: Customize rhythms post-generation  
✅ **Instrument Selector**: 14+ professional instruments per voice  
✅ **Song Creation Suite**: Combine canons in timeline  
✅ **MIDI Export**: Export canons as MIDI files  
✅ **Bach Variables**: Use Bach variables as canon themes  

### Workflow Integration
1. **Theme → Canon → Song**: Create theme, generate canon, add to song
2. **Mode Mixer → Canon**: Generate theme from mixed mode, create canon
3. **MIDI Import → Canon**: Import MIDI theme, generate canon
4. **Canon → Counterpoint**: Use canon as basis for further counterpoint

---

## 🎵 Musical Examples by Canon Type

### Strict Canon
```
Leader:   C  D  E  F  G  F  E  D  C
Follower:           C  D  E  F  G  F  E  D  C
          (4 beat delay, octave up)
```

### Canon by Inversion
```
Leader:   C  E  G  A  G  E  C
Follower: C  A  F  E  F  A  C  (mirrored around C)
```

### Rhythmic Canon (2:1)
```
Leader:   Q  Q  Q  Q  (quarter notes)
Follower: H     H      (half notes, same pitches)
```

---

## ❓ Troubleshooting

**Q: Canon sounds "off" or dissonant**
- A: Check that interval is consonant (0, 7, 12)
- A: Ensure mode is selected for diatonic transposition
- A: Try reducing number of voices

**Q: Follower voice is silent**
- A: Check mute button isn't enabled
- A: Ensure entry delay isn't beyond theme length
- A: Verify instrument is loaded

**Q: Rhythmic canon has timing issues**
- A: Use simple mensuration ratios (1.5, 2.0)
- A: Ensure theme rhythm is well-defined
- A: Check that entry delay is appropriate

**Q: Can't hear all voices clearly**
- A: Reduce number of simultaneous voices
- A: Use different instruments for each voice
- A: Adjust entry delays for clarity

---

## 🚀 Future Enhancements (Not Yet Implemented)

The provided algorithms include advanced features that could be added:
- **Spatial Canon**: 3D positioning with acoustic delays
- **Imitation Engine**: Stretto, mirror, sequential imitation
- **Hybrid Canon-Imitation**: Smooth transitions between strict and free
- **Dynamic Orchestration**: Instrument morphing during playback

---

## 📚 Historical Context

The canon techniques implemented in this engine have been used by composers for centuries:

- **Renaissance** (1400-1600): Strict canons, canon by inversion
- **Baroque** (1600-1750): Crab canons, augmentation/diminution (Bach, Handel)
- **Classical** (1750-1820): Simplified canons in symphonies (Haydn, Mozart)
- **Romantic** (1820-1900): Double canons, complex entries (Brahms, Schumann)
- **Modern** (1900+): Retrograde-inversion, serial techniques (Webern, Berg)

---

## 🎓 Learning Resources

To deepen your understanding:
1. Study Bach's *The Art of Fugue* - showcases all canon types
2. Analyze Pachelbel's Canon - archetypal strict canon
3. Explore Josquin's masses - mensuration canons
4. Read *Gradus ad Parnassum* by Fux - canon composition rules

---

## ✅ Summary

The **Canon Engine** transforms your Modal Music Composition App into a comprehensive contrapuntal workstation. With **14+ canon types**, you can:

- Generate classical canons in any of 80+ modes
- Create complex polyphonic textures with multiple voices
- Experiment with historical techniques from Renaissance to Modern
- Export professional-quality canons for further development

**Start with simple strict canons, then explore the full palette of contrapuntal possibilities!**

---

*For technical documentation, see `/lib/canon-engine.ts`*  
*For UI component reference, see `/components/CanonControls.tsx`*
