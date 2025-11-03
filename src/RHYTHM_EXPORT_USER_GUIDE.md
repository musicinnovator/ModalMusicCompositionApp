# How to Export Rhythm-Controlled Compositions - User Guide

## Quick Start

Your rhythm modifications in the **Rhythm Controls** are now automatically included in all exported files (MIDI, MusicXML, and TXT). No extra steps needed!

## Step-by-Step Workflow

### 1. Create and Customize Your Music

#### For Traditional Mode (Main Theme):
1. **Create a theme** in the Theme Composer
2. **Open Rhythm Controls** (located above Rest Controls)
3. **Adjust rhythms** for individual notes or use the automatic slider
4. **Click "Apply All"** to save your rhythm changes
5. ✅ Your rhythm is now part of the theme

#### For Bach Variables Mode:
1. **Switch to Bach Variables tab** in Theme Composer
2. **Select a Bach variable** (CF, FCP1, etc.)
3. **Create or edit the melody**
4. **Open Rhythm Controls**
5. **Adjust rhythms** for that specific variable
6. **Click "Apply All"**
7. ✅ Repeat for other Bach variables as needed

### 2. Build Your Song

1. **Go to Song Creation Suite** (bottom of the page)
2. **Click the "Compose" tab**
3. **Drag components** from the left panel to the timeline:
   - Main Theme (will include your custom rhythm)
   - Bach Variables (each with its own rhythm)
   - Counterpoints (including species counterpoint rhythms)
   - Imitations and Fugues

### 3. Export Your Music

1. **Switch to "Export" tab** in Song Creation Suite
2. **Choose your format(s)**:
   - **MIDI** → For DAWs (Logic, Pro Tools, FL Studio, etc.)
   - **MusicXML** → For notation software (Sibelius, Finale, MuseScore)
   - **TXT** → For analysis and documentation
3. **Click the export button**
4. ✅ Your files now contain all rhythm information!

## What Gets Exported

### MIDI Files (.mid)
- ✅ **Note timing**: Exact placement based on your rhythm
- ✅ **Note durations**: Whole, half, quarter, eighth, sixteenth notes
- ✅ **Rests**: Properly timed silence between notes
- ✅ **Multi-track**: Each component on its own track
- **Import into**: Any DAW, MIDI sequencer, or music software

### MusicXML Files (.xml)
- ✅ **Notation**: Correct note values (♩ ♪ ♫ etc.)
- ✅ **Measure placement**: Notes in correct beats
- ✅ **Tempo markings**: BPM preserved
- ✅ **Instrument names**: Per-track instruments
- **Import into**: Sibelius, Dorico, Finale, MuseScore, Noteflight

### Text Files (.txt)
- ✅ **Complete analysis**: Full track breakdown
- ✅ **Rhythm patterns**: Beat-by-beat display
- ✅ **Note sequences**: Pitch and rhythm information
- ✅ **Timeline events**: When each track starts/stops
- **Use for**: Documentation, analysis, reference

## Examples

### Example 1: Varied Rhythm Theme
```
Before Rhythm Controls:
  C4 D4 E4 F4 G4
  ♩  ♩  ♩  ♩  ♩  (all quarter notes)

After Rhythm Controls:
  C4  D4  E4  F4  G4
  𝅝   ♩   ♪   ♩   𝅝  (whole, quarter, eighth, quarter, whole)

✅ MIDI export: Notes play with exact durations
✅ XML export: Proper note symbols in notation software
✅ TXT export: Shows rhythm pattern [1,0,0,0,1,1,0,1,0,0,0]
```

### Example 2: Species Counterpoint
```
Cantus Firmus:     C4  D4  E4  F4
                   𝅝   𝅝   𝅝   𝅝  (all whole notes - 2:1 ratio)

Counterpoint:      C5  D5 E5 F5 G5 F5 E5 D5
                   ♩   ♩  ♩  ♩  ♩  ♩  ♩  ♩  (all quarter notes)

✅ Both parts export with correct 2:1 rhythm relationship
```

### Example 3: Multiple Bach Variables
```
Cantus Firmus (CF):        ♩  ♩  ♩  ♩
Florid Counterpoint (FCP): ♪  ♪  ♪  ♪  ♪  ♪  ♪  ♪
Countersubject (CS):       𝅗𝅥  𝅗𝅥  𝅗𝅥  𝅗𝅥

✅ Each exports with its own unique rhythm pattern
```

## Verification Tips

### After Export, Verify Your Files:

#### MIDI Files
1. Import into your DAW
2. Listen to playback
3. Check piano roll view for note lengths
4. **Expected**: Notes match what you hear in the app

#### MusicXML Files
1. Import into notation software
2. Check note values in the score
3. Look at measure placement
4. **Expected**: Notation matches your rhythm settings

#### TXT Files
1. Open in text editor
2. Find "Rhythm Pattern" section for each track
3. Check "Active Beats" count
4. **Expected**: Pattern shows your custom rhythm

## Troubleshooting

### "My rhythm doesn't appear in the export"
**Solution**: Make sure you clicked "Apply All" in Rhythm Controls before creating the song

### "All notes are quarter notes in MIDI"
**Solution**: 
1. Check that you adjusted rhythm BEFORE adding to timeline
2. Remove the track from timeline
3. Adjust rhythm again
4. Re-add the component to timeline

### "Different rhythms in Bach variables all sound the same"
**Solution**: Each Bach variable needs rhythm applied separately:
1. Select variable in Bach Variables tab
2. Adjust its rhythm
3. Apply
4. Repeat for each variable

## Pro Tips

### 🎯 Tip 1: Preview Before Export
Use the playback controls in Song Player to hear your composition with rhythms before exporting

### 🎯 Tip 2: Save Multiple Versions
Export different rhythm variations to compare:
- `composition_version1.mid` (conservative rhythm)
- `composition_version2.mid` (varied rhythm)
- `composition_version3.mid` (complex rhythm)

### 🎯 Tip 3: Use Session Memory
Save your rhythm-controlled compositions in Session Memory Bank for later use

### 🎯 Tip 4: Combine Techniques
Mix themes with custom rhythms + species counterpoint + Bach variables for rich, complex compositions

## Supported Rhythm Values

The system supports these note durations:
- **Double Whole** (8 beats) - Breve
- **Whole** (4 beats) - 𝅝
- **Dotted Half** (3 beats) - 𝅗𝅥.
- **Half** (2 beats) - 𝅗𝅥
- **Dotted Quarter** (1.5 beats) - ♩.
- **Quarter** (1 beat) - ♩
- **Eighth** (0.5 beats) - ♪
- **Sixteenth** (0.25 beats) - ♬

All values export correctly to MIDI, MusicXML, and TXT formats.

## Summary

✅ **Rhythm Controls changes ARE transmitted to export files**
✅ **All file formats (MIDI, XML, TXT) include rhythm data**
✅ **Works for themes, Bach variables, and counterpoints**
✅ **No manual editing of export files needed**
✅ **Professional workflow: Compose → Export → Import to DAW**

Your compositions will sound and look exactly as you created them!

---

*For more information, see RHYTHM_CONTROLS_USER_GUIDE.md and RHYTHM_EXPORT_FIX_COMPLETE.md*
