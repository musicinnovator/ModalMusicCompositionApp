# New Canon Types - Quick Reference Card

## 🎵 3 NEW CANON TYPES ADDED (Total: 22)

---

## 1️⃣ LOOSE CANON 🎯

**What:** Imitation with controlled randomness  
**Key Control:** Adherence Percentage (0-100%)  
**Default:** 70% adherence, 3 voices  
**Use When:** You want natural, organic variation from strict imitation

**Quick Settings:**
- 50% = Very loose, lots of variation
- 70% = Balanced (default)
- 90% = Mostly strict adherence

---

## 2️⃣ PER MUTATIVE CANON 🔀

**What:** Random permutations of the original theme  
**Key Control:** Number of Permutations (1-7)  
**Default:** 3 permutations, unison interval  
**Use When:** You want variations using the same notes in different orders

**Quick Settings:**
- 3 Permutations = Moderate complexity
- 5 Permutations = Rich texture
- 7 Permutations = Maximum complexity

---

## 3️⃣ FRAGMENTAL CANON ✂️

**What:** Followers play fragments of the original theme  
**Key Control:** Number of Voices (2-7)  
**Default:** 4 voices (Leader + 3 fragments)  
**Requirements:** ⚠️ **Minimum 7 notes in theme**  
**Use When:** You want to deconstruct a theme into smaller pieces

**Quick Settings:**
- 4 Voices = Leader + 3 fragments
- 6 Voices = Leader + 5 fragments
- Fragment sizes automatically calculated

---

## UI LOCATION

**Canon Generator Card** → **Canon Type Dropdown** → Select:
- "Loose Canon"
- "Per Mutative Canon"
- "Fragmental Canon"

---

## PARAMETER COMPARISON

| Canon Type | Min Notes | Default Voices | Special Parameter | Range |
|-----------|-----------|----------------|-------------------|-------|
| **Loose Canon** | 1 | 3 | Adherence % | 0-100% |
| **Per Mutative** | 1 | 1+3 perms | Num Permutations | 1-7 |
| **Fragmental** | **7** | 4 | Num Voices | 2-7 |

---

## COMMON CONTROLS (All Types)

- **Entry Delay:** 1-16 beats (how long before each voice enters)
- **Transposition Interval:** -24 to +24 semitones
- **Modal Awareness:** ✅ All types respect selected mode

---

## QUICK TEST

1. **Create a theme** with 8-10 notes
2. **Select canon type** from dropdown
3. **Adjust key parameter:**
   - Loose: Set adherence to 60%
   - Per Mutative: Set to 5 permutations
   - Fragmental: Set to 5 voices
4. **Click Generate**
5. **Listen & visualize** the results

---

## ERROR HANDLING

**Fragmental Canon with < 7 notes:**
- ⚠️ Warning displayed in UI
- 🔄 Auto-falls back to Strict Canon
- 📝 Console warning message
- ✅ No crashes or errors

---

## BEST PRACTICES

### Loose Canon
- Start with 70% adherence
- Lower adherence for jazzy, improvisational feel
- Higher adherence for subtle variation

### Per Mutative Canon
- Use unison interval (0) to highlight permutations
- Or combine with transposition for richer texture
- More permutations = more complexity

### Fragmental Canon
- Ensure theme has 7+ notes
- Shorter entry delay (2 beats) works well
- More voices = smaller fragments

---

## ADVANCED TIPS

1. **Combine with modes:** All canon types work with all 80+ modes
2. **Layer effects:** Use with rhythm controls, arpeggios, etc.
3. **Export:** All types export to MIDI/MusicXML
4. **Song suite:** Use in Complete Song Creation Suite
5. **Visualize:** All types show in Canon Visualizer

---

## TROUBLESHOOTING

**Problem:** Fragmental Canon not working  
**Solution:** Check theme has minimum 7 notes

**Problem:** Per Mutative sounds same as original  
**Solution:** Increase number of permutations

**Problem:** Loose Canon too random  
**Solution:** Increase adherence percentage

---

## STATUS

✅ **Implementation Complete**  
✅ **Fully Tested**  
✅ **Modal Integration**  
✅ **UI Controls Ready**  
✅ **Documentation Complete**

---

**Total Canon Types:** 22  
**Harris Software Solutions:** 3 new types  
**Ready for Production:** Yes ✅
