# Rhythm Controls Testing Guide

## Quick Test - 60 Seconds

### Test 1: Basic Rhythm Application (20 seconds)
1. Open the app
2. Navigate to "Theme Composer" → "Traditional" tab
3. Scroll down to find "Rhythm Controls" (purple gradient card, above "Rest Controls")
4. Click "Uniform Rhythm" mode
5. Select "Whole (1)" from dropdown → Click "Apply"
6. Scroll to "Theme Playback" section
7. Click **Play** button
8. **Expected:** Notes play slowly (4 beats each = 2 seconds per note at 120 BPM)

### Test 2: Fast Rhythm (20 seconds)
1. Go back to Rhythm Controls
2. Select "Sixteenth (1/16)" from dropdown → Click "Apply"
3. Toast should say "Applied uniform Sixteenth (1/16) rhythm"
4. Go to Theme Playback
5. Click **Play** button
6. **Expected:** Notes play very fast (0.25 beats each = 0.125 seconds per note at 120 BPM)

### Test 3: Preset Rhythms (20 seconds)
1. In Rhythm Controls, switch to "Preset Patterns" mode
2. Select "Baroque" → Click "Apply"
3. Toast: "Applied Baroque rhythm pattern"
4. Play the theme
5. **Expected:** Alternating fast and slow notes (quarters and eighths)

## Detailed Testing

### Percentage Mode Test
**Purpose:** Test percentage-based rhythm distribution

1. Switch to "Percentage Distribution" mode (default)
2. Select "Half (1/2)" note value
3. Set slider to **30%**
4. Click "Generate Rhythm"
5. Toast: "Applied 30% Half (1/2) rhythm"
6. **Result:** 30% of notes will be half notes (2 beats), rest will be quarters

#### Verify:
- Look for "Rhythm Active" badge in Theme Playback
- Total beats should be > number of notes (some notes are longer)
- Play and listen - some notes should be noticeably longer

### Preset Patterns Test
**Purpose:** Test all 6 preset rhythm patterns

1. Test each preset in order:
   - **Uniform Quarter**: All notes same length (baseline)
   - **Walking Bass**: Steady quarter notes (same as uniform)
   - **Baroque**: Mix of eighths and quarters (varies)
   - **Syncopated**: Dotted rhythms (longer + short)
   - **Slow Chorale**: Long notes (half and whole)
   - **Fast Passage**: Very fast (sixteenth notes)

2. For each preset:
   - Click "Apply"
   - Verify toast message
   - Play and listen
   - Stop before testing next

#### Expected Sounds:
- **Uniform Quarter**: Steady, even rhythm (1 beat each)
- **Walking Bass**: Same as uniform quarter
- **Baroque**: Bouncy, alternating fast-slow
- **Syncopated**: "Long-short-short" pattern
- **Slow Chorale**: Slow, sustained notes
- **Fast Passage**: Rapid notes like a fast run

### Manual Rhythm Test
**Purpose:** Test individual note rhythm assignment

1. Switch to "Manual Rhythm" mode
2. You'll see your theme with dropdown for each note
3. For a 4-note theme, try:
   - Note 1: Whole (4 beats)
   - Note 2: Eighth (0.5 beats)
   - Note 3: Half (2 beats)
   - Note 4: Quarter (1 beat)
4. Click "Apply Manual Rhythm"
5. Play and listen

**Expected:** 
- First note: Very long (4 seconds at 120 BPM)
- Second note: Very short (0.25 seconds)
- Third note: Medium (1 second)
- Fourth note: Normal (0.5 seconds)

### Shuffle Mode Test
**Purpose:** Test rhythm randomization

1. In Percentage mode, enable "Auto-shuffle" toggle
2. Apply any rhythm pattern
3. **Expected:** Notes distributed randomly instead of sequentially
4. Play twice - should sound different each time (randomized)

### Tempo Interaction Test
**Purpose:** Verify rhythm works at different tempos

1. Apply "Fast Passage" (sixteenth notes) preset
2. In Theme Playback:
   - Play at tempo 60 (slow): Sixteenths sound like quarters
   - Play at tempo 120 (normal): Sixteenths sound fast
   - Play at tempo 240 (fast): Sixteenths sound extremely rapid

**Expected:** Same rhythm, different speeds based on tempo

### Reset Test
**Purpose:** Test rhythm reset functionality

1. Apply any complex rhythm pattern
2. Click "Reset to Quarter Notes" button in Rhythm Controls
3. Toast: "Rhythm reset to uniform quarter notes"
4. Play theme
5. **Expected:** All notes back to normal quarter note rhythm

## Bach Variables Rhythm Test

### Test Bach Variable Rhythm (Traditional vs Bach)
1. Go to "Theme Composer" → "Bach Variables" tab
2. Select "Cantus Firmus" (CF)
3. Add some notes using Quick Add or dropdown
4. Scroll to find "Rhythm Controls" (same purple card)
5. Apply a rhythm pattern (e.g., "Slow Chorale")
6. Toast: "Rhythm pattern applied to CF"
7. Go to "Bach Variables Visualization" section
8. Click Play for Cantus Firmus
9. **Expected:** CF plays with slow chorale rhythm

### Test Different Rhythms for Each Bach Variable
1. For CF: Apply "Slow Chorale" (slow)
2. For FCP1: Apply "Fast Passage" (fast)
3. For FCP2: Apply "Baroque" (varied)
4. Play each one separately
5. **Expected:** Each variable has its own distinct rhythm

## Visual Indicators

### Check for These UI Elements:
1. **"Rhythm Active" Badge**: Shows in Theme Playback when rhythm applied
2. **Total Beats Display**: Should show decimal (e.g., "9 elements • 12.5 beats")
3. **"HQ Audio" Badge**: Shows when soundfont loaded successfully
4. **Toast Messages**: Confirm every rhythm change

### Rhythm Statistics Display:
In Rhythm Controls card, after applying rhythm:
- Shows distribution breakdown (e.g., "40% Half, 60% Quarter")
- Shows total duration in beats
- Updates in real-time

## Error Handling Tests

### Test 1: Empty Theme
1. Clear all notes from theme (Clear button)
2. Try to apply rhythm
3. **Expected:** Toast error: "No theme to apply rhythm to"

### Test 2: Invalid Rhythm Data
1. Create a theme
2. Apply rhythm
3. Delete some notes from theme
4. Play
5. **Expected:** Auto-syncs rhythm length, plays correctly

### Test 3: Audio Engine Not Ready
1. Apply rhythm immediately on page load
2. Click play before soundfont loads
3. **Expected:** Auto-initializes engine, plays successfully (may use fallback synthesis)

## Audio Quality Verification

### Soundfont vs Synthesis
1. Apply a rhythm pattern
2. Play theme
3. Check for "HQ Audio" badge
   - **If present:** Using soundfont (professional samples)
   - **If absent:** Using synthesis (Web Audio oscillators)

### Verify Professional Sound:
- Piano should sound like real piano (not synthetic beep)
- Violin should have string texture
- Different note durations should have proper attack/release

## Performance Test

### Large Theme Test
1. Create a theme with 16+ notes
2. Apply complex rhythm (Syncopated or Baroque)
3. Play full theme
4. **Expected:** 
   - Smooth playback
   - No stuttering
   - Accurate timing
   - Memory stays stable

## Common Issues & Solutions

### Issue: "Audio engine not initialized" error
**Solution:** Fixed! Engine now auto-initializes. Refresh if persists.

### Issue: All notes sound the same length
**Solution:** 
1. Verify "Rhythm Active" badge shows
2. Check Rhythm Controls shows applied pattern
3. Try different rhythm with more variety (e.g., Slow Chorale)

### Issue: No sound plays
**Solution:**
1. Check browser audio permissions
2. Click page to activate audio context
3. Check volume slider in Theme Playback
4. Try refreshing page

### Issue: Rhythm doesn't match what was applied
**Solution:**
1. Click "Reset to Quarter Notes"
2. Re-apply desired rhythm
3. Verify toast message confirms application

## Success Criteria

✅ **Test PASSED if:**
1. Sixteenth notes play noticeably faster than whole notes
2. "Slow Chorale" sounds slow and sustained
3. "Fast Passage" sounds rapid
4. Tempo changes affect speed proportionally
5. Visual indicators show correctly
6. No console errors
7. Smooth playback with no stuttering

## Advanced Testing

### Rhythm + Rest Combination
1. Create theme with notes and rests
2. Apply rhythm pattern
3. **Expected:** Rhythm affects notes, rests use their own durations

### Multiple Playback
1. Apply rhythm to theme
2. Play theme
3. While playing, go to generated imitations/fugues
4. Play those too
5. **Expected:** All should play with proper rhythm (theme) or default rhythm (imitations)

## Reporting Issues

If rhythm isn't working:
1. Check browser console for errors
2. Note which rhythm pattern failed
3. Check if "Rhythm Active" badge shows
4. Try "Reset" and re-apply
5. Report with: Browser, pattern tried, error messages

## Quick Comparison Chart

| Rhythm Value | Beats | Seconds @ 120 BPM | Expected Sound |
|--------------|-------|-------------------|----------------|
| Sixteenth | 0.25 | 0.125s | Very fast |
| Eighth | 0.5 | 0.25s | Fast |
| Quarter | 1.0 | 0.5s | Normal (default) |
| Dotted Quarter | 1.5 | 0.75s | Medium-slow |
| Half | 2.0 | 1.0s | Slow |
| Dotted Half | 3.0 | 1.5s | Very slow |
| Whole | 4.0 | 2.0s | Extremely slow |
| Double Whole | 8.0 | 4.0s | Sustained |

## Final Verification

After all tests, confirm:
- [ ] Rhythm controls appear in both Traditional and Bach tabs
- [ ] All preset patterns apply successfully
- [ ] Audio playback reflects rhythm changes
- [ ] Visual feedback is accurate
- [ ] No errors in console
- [ ] Performance is smooth
- [ ] Professional audio quality (when soundfont loaded)

**If all checked: Rhythm System is FULLY FUNCTIONAL! 🎉**
