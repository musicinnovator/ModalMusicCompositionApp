# Quick Reference - Harmony & Arpeggio Enhancements
**Version 1.003 - User Quick Guide**

---

## 🎼 Harmony Chord Editor - Quick Reference

### How to Edit Chords

1. **Open Editor**
   ```
   Harmonic Engine Suite → Harmonize → "Edit Chords" button
   ```

2. **Edit a Chord**
   - **Double-click** chord badge
   - OR **Right-click** → "Change Chord"
   - Select new chord quality
   - Click "Change Chord"

3. **Add a Chord**
   - **Right-click** chord badge
   - Select "Add Before" or "Add After"
   - Choose chord quality
   - Click "Add Chord"

4. **Delete a Chord**
   - **Right-click** chord badge
   - Select "Delete Chord"
   - Confirm deletion
   - (Minimum 1 chord must remain)

5. **Save/Discard**
   - **Save Changes**: Commits all edits
   - **Discard**: Reverts to original
   - **Undo/Redo**: Navigate edit history

---

## 🎵 Available Chord Qualities

### Basic Triads
| Code | Name |
|------|------|
| M | Major |
| m | Minor |
| dim | Diminished |
| aug | Augmented |
| sus2 | Suspended 2nd |
| sus4 | Suspended 4th |

### Seventh Chords
| Code | Name |
|------|------|
| M7 | Major 7th |
| m7 | Minor 7th |
| dom7 | Dominant 7th |
| dim7 | Diminished 7th |
| hdim7 | Half-diminished 7th |
| mM7 | Minor-Major 7th |

### Extended Chords
| Code | Name |
|------|------|
| M9 | Major 9th |
| m9 | Minor 9th |
| dom9 | Dominant 9th |
| M11 | Major 11th |
| m11 | Minor 11th |
| dom11 | Dominant 11th |
| M13 | Major 13th |
| m13 | Minor 13th |
| dom13 | Dominant 13th |

### Altered Chords
| Code | Name |
|------|------|
| 7#9 | Dominant 7 sharp 9 |
| 7b9 | Dominant 7 flat 9 |
| 7#5 | Dominant 7 sharp 5 |
| 7b5 | Dominant 7 flat 5 |
| 7#11 | Lydian dominant |
| alt | Altered dominant |
| add9 | Add 9 |
| 6 | Major 6th |
| m6 | Minor 6th |

---

## 🔗 Arpeggio Chain Builder - Quick Reference

### How to Build a Chain

1. **Select Source**
   ```
   Choose: Theme, CF, CFF1, or CFF2
   ```

2. **Add Patterns**
   ```
   Select Pattern → Set Repetitions (1-8) → "Add to Chain"
   ```

3. **Build Chain**
   ```
   Repeat step 2 for each pattern you want
   Chain shows: Pattern number, name, notes
   ```

4. **Generate**
   ```
   Click "Generate Arpeggio Chain"
   Result shows visualization and playback
   ```

5. **Use Result**
   ```
   - Play back with audio player
   - Add to Song Suite
   - Export to MIDI/MusicXML
   ```

---

## 📊 Arpeggio Pattern Reference

### 3-Note Patterns (6 patterns)
```
LMH - Ascending (Low → Mid → High)
LHM - Low → High → Mid
MLH - Mid → Low → High
MHL - Mid → High → Low
HLM - High → Low → Mid
HML - Descending (High → Mid → Low)
```

### 4-Note Patterns (18 patterns)
```
LMHL - Ascending then return to Low
MLHM - Wave pattern from Mid
HLMH - Wave pattern from High
... (15 more variations)
```

### 5-Note Patterns (20 patterns)
```
LMHML - Full ascending then descending
MLHLM - Wave from Mid with return
HMHLH - Complex wave from High
... (17 more variations)
```

### 6-Note Patterns (20 patterns)
```
LMHLMH - Double ascending wave
LMHHML - Ascending with High plateau
MLHMLH - Alternating wave pattern
... (17 more variations)
```

**Total Available**: 64 unique patterns

---

## 🎹 Pattern Note Mapping

### L (Low)
- **Source**: Lowest note in selected melody
- **Example**: C3 from "C3-E3-G3"

### M (Middle)
- **Source**: Middle note in selected melody
- **Example**: E3 from "C3-E3-G3-C4-E4"

### H (High)
- **Source**: Highest note in selected melody
- **Example**: G4 from "C3-E3-G4"

---

## 🎯 Common Workflows

### Workflow 1: Harmonize Theme and Edit Chords
```
1. Theme Composer → Create theme
2. Harmonic Engine Suite → Select theme
3. Configure harmony params → Harmonize
4. Click "Edit Chords"
5. Edit chord progression as desired
6. Save changes
7. Add to Timeline or Export
```

### Workflow 2: Create Complex Arpeggio
```
1. Theme Composer → Create theme
2. Arpeggio Chain Builder → Select theme
3. Add pattern: LMH × 2
4. Add pattern: HML × 2
5. Add pattern: LMHL × 1
6. Generate Arpeggio Chain
7. Play back and preview
8. Add to Song Suite
9. Use in composition
```

### Workflow 3: Harmonize Arpeggio Chain
```
1. Create arpeggio chain
2. Add to Song Suite
3. Harmonic Engine Suite → Select arpeggio
4. Harmonize arpeggio
5. Edit resulting chords
6. Combine in Timeline
```

---

## ⌨️ Keyboard Shortcuts

### Harmony Chord Editor
- **Double-click** chord: Open edit dialog
- **Right-click** chord: Context menu
- **Ctrl+Z**: Undo (via Undo button)
- **Ctrl+Y**: Redo (via Redo button)
- **Esc**: Close dialog

### Arpeggio Chain Builder
- **Click** pattern badges: View details
- **Scroll** dropdowns: Navigate patterns
- **Tab**: Navigate between fields

---

## 💡 Pro Tips

### Harmony Editing
1. **Use Undo/Redo**: Experiment freely, you can always undo
2. **Preview Before Save**: Use view mode to check changes
3. **Start Simple**: Begin with basic triads, add complexity later
4. **Watch Confidence**: Low confidence (<70%) suggests manual editing might help
5. **Root Notes**: Chords keep same root when added adjacent

### Arpeggio Chains
1. **Start Short**: Build 2-3 pattern chains first
2. **Contrasting Patterns**: Mix ascending/descending for interest
3. **Repetitions**: Use 1-2 reps per pattern for natural sound
4. **Source Matters**: Different sources create different arpeggios
5. **Preview Notes**: Check L/M/H before building to understand output

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot delete chord"
**Solution**: Must keep at least 1 chord. Add another first, then delete.

### Issue: "Unsaved changes" badge stays
**Solution**: Click "Save Changes" button to commit edits.

### Issue: "Pattern chain is empty"
**Solution**: Add at least one pattern before generating.

### Issue: "Source melody is empty"
**Solution**: Create a theme or Bach variable first.

### Issue: Playback doesn't reflect edits
**Solution**: Ensure you clicked "Save Changes" after editing.

---

## 📋 Feature Comparison

| Feature | Harmony Editor | Arpeggio Chain |
|---------|---------------|----------------|
| **Input** | Generated harmony | Theme/Bach Variable |
| **Output** | Modified harmony | Arpeggio sequence |
| **Operations** | Edit/Add/Delete | Chain/Combine |
| **Undo/Redo** | ✅ Yes | ❌ No (Clear only) |
| **Save/Discard** | ✅ Yes | N/A (Generate new) |
| **Timeline** | ✅ Auto | ✅ Via Song Suite |
| **Export** | ✅ Yes | ✅ Yes |
| **Playback** | ✅ Yes | ✅ Yes |

---

## 🎓 Learning Path

### Beginner
1. Try basic harmony editing (change 1-2 chords)
2. Create simple 2-pattern arpeggio chain
3. Use LMH and HML patterns only
4. Add results to timeline

### Intermediate
1. Edit complex progressions (10+ chords)
2. Add/delete chords strategically
3. Build 3-5 pattern chains
4. Experiment with 4-5 note patterns
5. Combine harmony + arpeggio

### Advanced
1. Create custom chord progressions from scratch
2. Build 8+ pattern chains
3. Use all 64 arpeggio patterns
4. Layer harmonized arpeggios
5. Export and refine in DAW

---

## 📞 Quick Help

### Getting Started
- **Harmony**: Harmonic Engine Suite → Harmonize → Edit Chords
- **Arpeggio**: Arpeggio Chain Builder → Add patterns → Generate

### Stuck?
1. Check console for error messages
2. Verify source melody not empty
3. Ensure at least 1 chord/pattern
4. Try Discard/Clear and start over

### Best Practices
✅ Save often when editing chords  
✅ Preview before adding to suite  
✅ Use descriptive labels  
✅ Test playback before exporting  
✅ Keep backups of complex progressions  

---

## 🎉 Quick Wins

### 5-Minute Tasks
- [ ] Edit 3 chords in a harmony
- [ ] Create 2-pattern arpeggio chain
- [ ] Add result to timeline
- [ ] Export to MIDI

### 15-Minute Projects
- [ ] Harmonize theme and edit all chords
- [ ] Build 5-pattern complex arpeggio
- [ ] Layer harmony + arpeggio in timeline
- [ ] Export complete composition

---

**Version**: 1.003  
**Last Updated**: October 24, 2025  
**For**: Modal Imitation and Fugue Construction Engine

**Need more help?** See full documentation:
- `HARMONY_ARPEGGIO_ENHANCEMENTS_COMPLETE.md`
- `HARMONY_ARPEGGIO_QUICK_TEST_GUIDE.md`
