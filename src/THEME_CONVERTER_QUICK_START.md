# Theme Converter - Quick Start Guide

## What is the Theme Converter?

Convert **any** generated component (canon voice, fugue subject, harmony part, etc.) into a **new current theme** that can be used with all generators.

**Location:** Below Theme Composer in the left column

---

## Quick Start (3 Steps)

### Step 1: Generate Components
Use any generator to create parts:
- Canon Generator → Creates canon voices
- Fugue Generator → Creates fugue voices
- Harmony Engine → Creates harmonized melodies
- Arpeggio Builder → Creates arpeggio patterns

### Step 2: Select & Convert
1. Open **Theme Converter Card**
2. Click **dropdown** → Select a component
3. Review **preview** and **validation**
4. Click **"Set as Current Theme"**

### Step 3: Use New Theme
- Theme Composer updates automatically
- Generate new parts using this theme
- All generators work with converted theme

---

## Undo Feature

**Made a mistake?**
- Click **"Revert"** button
- Restores previous theme instantly
- Click again to go back further

---

## Example Workflow

```
1. Generate Canon Per Tonos (3 voices)
   → Leader, Follower 1, Follower 2

2. Convert "Follower 2" to theme
   → Theme Composer now has Follower 2's melody

3. Generate Double Fugue from new theme
   → 4 voices created from Follower 2

4. Convert "Countersubject 1" to theme
   → Theme Composer now has Countersubject 1

5. Revert twice
   → Back to original theme

INFINITE RECURSION ENABLED! 🎵
```

---

## What Can Be Converted?

✅ **Canon voices** (all 22 types, all voices)  
✅ **Fugue voices** (14 architectures, all voices)  
✅ **Imitation parts**  
✅ **Counterpoint parts** (40+ techniques)  
✅ **Harmonized melodies**  
✅ **Arpeggio chains**  

---

## Validation System

**Green Alert:** ✅ Ready to convert  
**Amber Alert:** ⚠️ Warning (still works, but note issues)  
**Red Alert:** ❌ Cannot convert (fix issue first)

**Common Warnings:**
- Long melody (>64 notes) → Will trim to 32
- Mostly rests (>70%) → May sound sparse
- One note only → Very simple theme

**Errors That Block:**
- Empty melody
- All rests
- No valid notes

---

## Tips & Tricks

**Best Practices:**
1. Try converting different voices from same canon
2. Use countersubjects for complex themes
3. Harmonize, then convert harmonized version
4. Combine converted themes on timeline

**Advanced:**
- Extract interesting voice from multi-voice fugue
- Use arpeggio as rhythmic theme
- Convert harmony to create chord-based melodies

**Safety:**
- Always have "Revert" available
- Previous state automatically saved
- Can undo conversions safely

---

## Quick Reference

| Action | Result |
|--------|--------|
| Select component | Preview appears |
| Click "Set as Current Theme" | Theme updates |
| Click "Revert" | Undo conversion |
| Generate with new theme | Works in all generators |
| Add to timeline | Full integration |

---

## Need More Info?

See: `THEME_CONVERTER_IMPLEMENTATION_COMPLETE.md` for:
- Full feature documentation
- Technical specifications
- Advanced workflows
- Troubleshooting guide

---

**Happy composing with recursive themes! 🎼**
