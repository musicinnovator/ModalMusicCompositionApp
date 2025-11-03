# Species Counterpoint Implementation Plan

## Problem Statement
The application generates counterpoint but doesn't properly handle species counterpoint rhythms. All notes play as quarter notes regardless of species selection.

## Correct Species Counterpoint Logic

### Species Definitions:
- **1:1 Species**: 1 counterpoint note per CF note (same duration)
- **2:1 Species**: 2 counterpoint notes per CF note (half duration each)
- **3:1 Species**: 3 counterpoint notes per CF note (third duration each) 
- **4:1 Species**: 4 counterpoint notes per CF note (quarter duration each)
- **5:1 Species (Florid)**: Mixed species - combination of 1:1, 2:1, 3:1, 4:1 in varying patterns

### Duration Subdivision Examples:
- If CF = whole note (4 beats), then:
  - 2:1 species → 2 half notes (2 beats each)
  - 3:1 species → 3 dotted-half notes or 3 notes totaling 4 beats
  - 4:1 species → 4 quarter notes (1 beat each)
  
- If CF = half note (2 beats), then:
  - 2:1 species → 2 quarter notes (1 beat each)
  - 3:1 species → 3 notes totaling 2 beats
  - 4:1 species → 4 eighth notes (0.5 beats each)

## Files That Need Changes

1. `/lib/counterpoint-engine.ts` - Fix species rhythm generation
2. `/components/CounterpointComposer.tsx` - Add species selector UI
3. `/components/AdvancedCounterpointComposer.tsx` - Add species selector UI
4. `/lib/soundfont-audio-engine.ts` - Ensure rhythm playback
5. `/components/AudioPlayer.tsx` - Handle rhythmic notes in playback
6. `/App.tsx` - Pass rhythm data through the pipeline

## Implementation Steps

### Step 1: Fix Duration Helpers
Add proper duration subdivision methods in counterpoint-engine.ts

### Step 2: Fix Third Species
Correct third species to generate 3 notes (not 4) per CF note

### Step 3: Add Rhythm Playback
Update audio engine to respect note durations

### Step 4: UI Updates  
Add species selection dropdowns to counterpoint composers

### Step 5: Data Flow
Ensure rhythm data flows from generation → storage → playback

## Testing Checklist
- [ ] 1:1 species generates same duration notes
- [ ] 2:1 species generates 2 notes per CF note at half duration
- [ ] 3:1 species generates 3 notes per CF note  
- [ ] 4:1 species generates 4 notes per CF note at quarter duration
- [ ] 5:1 florid generates mixed species patterns
- [ ] Audio playback respects note durations
- [ ] All species work with different CF durations (whole, half, quarter)
- [ ] UI shows selected species correctly
- [ ] Exported files contain rhythm information