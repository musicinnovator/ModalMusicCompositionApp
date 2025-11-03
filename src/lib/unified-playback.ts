/**
 * UNIFIED PLAYBACK SYSTEM
 * Single source of truth for all musical playback in the application
 * Ensures components sound identical in preview, audition, timeline, and export
 * 
 * This replaces the fragmented playback logic across multiple components
 */

import { MidiNote, Rhythm, NoteValue, isNote, isRest, getNoteValueBeats, midiNoteToNoteName } from '../types/musical';
import { InstrumentType } from './enhanced-synthesis';
import { getSoundfontEngine } from './soundfont-audio-engine';

/**
 * Musical part with rhythm data
 * Supports both modern NoteValue[] format and legacy Rhythm[] format
 * ADDITIVE: Now supports chords (arrays of notes) and rests (-1)
 */
export interface PlaybackPart {
  melody: (MidiNote | MidiNote[] | -1)[]; // ADDITIVE: Supports chords and rests
  rhythm?: Rhythm;           // Legacy format: array of beat durations, 0 = rest
  noteValues?: NoteValue[];  // Modern format: 'quarter', 'half', 'rest', etc.
  instrument: InstrumentType;
  volume?: number;           // 0-1, defaults to 1
  muted?: boolean;
}

/**
 * Playback event - represents a single note or chord to be played
 * ADDITIVE: Now supports chords (array of notes)
 */
interface PlaybackEvent {
  midiNote: number | number[]; // ADDITIVE: Can be single note or chord
  startTime: number;      // in seconds
  duration: number;       // in seconds
  instrument: InstrumentType;
  volume: number;
}

/**
 * Playback controller for managing play/pause/stop
 */
export class UnifiedPlaybackController {
  private events: PlaybackEvent[] = [];
  private startTime: number = 0;
  private isPlaying: boolean = false;
  private playbackTimeouts: NodeJS.Timeout[] = [];
  private audioEngine = getSoundfontEngine();
  private onProgress?: (time: number, duration: number) => void;
  private onComplete?: () => void;
  private pausedAt: number = 0;

  /**
   * Build playback events from musical parts
   * This is the SINGLE algorithm used everywhere for timing interpretation
   */
  private buildEvents(parts: PlaybackPart[], tempo: number): PlaybackEvent[] {
    const events: PlaybackEvent[] = [];
    const secondsPerBeat = 60 / tempo;

    console.log('🎵 [UnifiedPlayback] Building events for', parts.length, 'parts at tempo', tempo);

    parts.forEach((part, partIndex) => {
      if (part.muted) {
        console.log(`  ⏭️ Part ${partIndex + 1} is muted, skipping`);
        return;
      }

      const volume = part.volume ?? 1;
      let currentBeat = 0;

      // PRIORITY 1: Use modern NoteValue[] format if available
      if (part.noteValues && part.noteValues.length === part.melody.length) {
        console.log(`  🎵 Part ${partIndex + 1}: Using NoteValue[] format (${part.noteValues.length} values)`);

        for (let i = 0; i < part.melody.length; i++) {
          const midiNote = part.melody[i];
          const noteValue = part.noteValues[i];

          // Handle rests
          if (noteValue === 'rest' || isRest(midiNote)) {
            const restDuration = noteValue === 'rest' ? 1 : getNoteValueBeats(noteValue);
            currentBeat += restDuration;
            console.log(`    Rest at beat ${currentBeat.toFixed(2)} (duration: ${restDuration} beats)`);
            continue;
          }

          // ADDITIVE: Handle chords (array of notes)
          if (Array.isArray(midiNote)) {
            const durationBeats = getNoteValueBeats(noteValue);
            
            // CRITICAL FIX: Validate duration to prevent 0-duration errors
            if (durationBeats <= 0) {
              console.warn(`    ⚠️ Skipping chord at index ${i} with invalid duration: ${durationBeats} beats (${noteValue})`);
              currentBeat += 1; // Advance by 1 beat default
              continue;
            }
            
            const startTime = currentBeat * secondsPerBeat;
            const duration = durationBeats * secondsPerBeat;

            events.push({
              midiNote, // Store as array for chord
              startTime,
              duration,
              instrument: part.instrument,
              volume
            });

            console.log(`    Chord ${i + 1}: [${midiNote.map(n => midiNoteToNoteName(n)).join(', ')}] at beat ${currentBeat.toFixed(2)}, duration ${durationBeats} beats (${noteValue})`);
            currentBeat += durationBeats;
          }
          // Handle single notes
          else if (isNote(midiNote) && typeof midiNote === 'number') {
            const durationBeats = getNoteValueBeats(noteValue);
            
            // CRITICAL FIX: Validate duration to prevent 0-duration errors
            if (durationBeats <= 0) {
              console.warn(`    ⚠️ Skipping note at index ${i} with invalid duration: ${durationBeats} beats (${noteValue})`);
              currentBeat += 1; // Advance by 1 beat default
              continue;
            }
            
            const startTime = currentBeat * secondsPerBeat;
            const duration = durationBeats * secondsPerBeat;

            events.push({
              midiNote,
              startTime,
              duration,
              instrument: part.instrument,
              volume
            });

            console.log(`    Note ${i + 1}: ${midiNoteToNoteName(midiNote)} at beat ${currentBeat.toFixed(2)}, duration ${durationBeats} beats (${noteValue})`);
            currentBeat += durationBeats;
          }
        }
      }
      // PRIORITY 2: Use legacy Rhythm[] format
      else if (part.rhythm && part.rhythm.length > 0) {
        console.log(`  🎵 Part ${partIndex + 1}: Using Rhythm[] format (${part.rhythm.length} rhythm values)`);

        let melodyIndex = 0;

        // Count initial rests (entry delay)
        let initialRests = 0;
        for (let i = 0; i < part.rhythm.length && part.rhythm[i] === 0; i++) {
          initialRests++;
        }

        if (initialRests > 0) {
          console.log(`    Entry delay: ${initialRests} beats`);
          currentBeat += initialRests;
        }

        // Determine rhythm interpretation mode
        // Mode 1: If rhythm length = initialRests + melody length, use 1:1 mapping (each melody note gets one rhythm value)
        // Mode 2: Otherwise, use consecutive 1s for sustained notes
        const expectedRhythmLength = initialRests + part.melody.length;
        const isOneToOneMapping = part.rhythm.length === expectedRhythmLength;

        if (isOneToOneMapping) {
          console.log(`    Using 1:1 rhythm mapping (each of ${part.melody.length} notes gets one rhythm value)`);
          
          // Process each melody note with its corresponding rhythm value
          for (let i = 0; i < part.melody.length; i++) {
            const midiNote = part.melody[i];
            const rhythmIndex = initialRests + i;
            const rhythmValue = part.rhythm[rhythmIndex];

            if (isNote(midiNote) && typeof midiNote === 'number') {
              // Each rhythm value represents the duration for this one note
              const durationBeats = rhythmValue > 0 ? rhythmValue : 1; // Use rhythm value as duration, default to 1 beat
              const startTime = currentBeat * secondsPerBeat;
              const duration = durationBeats * secondsPerBeat;

              events.push({
                midiNote,
                startTime,
                duration,
                instrument: part.instrument,
                volume
              });

              console.log(`    Note ${i + 1}: ${midiNoteToNoteName(midiNote)} at beat ${currentBeat.toFixed(2)}, duration ${durationBeats} beat(s)`);
              currentBeat += durationBeats;
            } else if (isRest(midiNote)) {
              // Handle rests in melody - advance the beat counter
              const durationBeats = rhythmValue > 0 ? rhythmValue : 1;
              currentBeat += durationBeats;
              console.log(`    Rest at beat ${currentBeat.toFixed(2)} (duration: ${durationBeats} beats)`);
            }
          }
        } else {
          console.log(`    Using consecutive 1s interpretation for sustained notes`);
          
          // Original logic for sustained notes
          let rhythmIndex = initialRests;
          while (rhythmIndex < part.rhythm.length && melodyIndex < part.melody.length) {
            const rhythmValue = part.rhythm[rhythmIndex];

            if (rhythmValue === 1) {
              const midiNote = part.melody[melodyIndex];

              if (isNote(midiNote) && typeof midiNote === 'number') {
                // Count consecutive 1s for sustained notes (one note held for multiple beats)
                let durationBeats = 1;
                let lookAhead = rhythmIndex + 1;
                
                while (lookAhead < part.rhythm.length && part.rhythm[lookAhead] === 1) {
                  durationBeats++;
                  lookAhead++;
                }

                const startTime = currentBeat * secondsPerBeat;
                const duration = durationBeats * secondsPerBeat;

                events.push({
                  midiNote,
                  startTime,
                  duration,
                  instrument: part.instrument,
                  volume
                });

                console.log(`    Note ${melodyIndex + 1}: ${midiNoteToNoteName(midiNote)} at beat ${currentBeat.toFixed(2)}, duration ${durationBeats} beats`);
                
                // Advance by the full duration (skip all the consecutive 1s)
                currentBeat += durationBeats;
                rhythmIndex += durationBeats;
                melodyIndex++;
              } else if (isRest(midiNote)) {
                // Rest in melody (-1) - advance time but don't play anything
                currentBeat += 1;
                rhythmIndex++;
                melodyIndex++;
                console.log(`    Rest (melody index ${melodyIndex}) at beat ${currentBeat.toFixed(2)}`);
              } else {
                // Invalid note value - skip it
                rhythmIndex++;
                melodyIndex++;
              }
            } else if (rhythmValue === 0) {
              // Internal rest (shouldn't happen after initial rests, but handle it)
              currentBeat += 1;
              rhythmIndex++;
            } else {
              // Other rhythm value (shouldn't normally happen)
              currentBeat += Math.abs(rhythmValue);
              rhythmIndex++;
            }
          }
        }
      }
      // FALLBACK: No rhythm data, use quarter notes
      else {
        console.log(`  ⚠️ Part ${partIndex + 1}: No rhythm data, using quarter notes`);

        for (let i = 0; i < part.melody.length; i++) {
          const midiNote = part.melody[i];

          if (isNote(midiNote) && typeof midiNote === 'number') {
            const startTime = currentBeat * secondsPerBeat;
            const duration = secondsPerBeat; // Quarter note

            events.push({
              midiNote,
              startTime,
              duration,
              instrument: part.instrument,
              volume
            });

            console.log(`    Note ${i + 1}: ${midiNoteToNoteName(midiNote)} at beat ${currentBeat.toFixed(2)}, duration 1 beat (quarter)`);
            currentBeat += 1;
          } else if (isRest(midiNote)) {
            // Handle rests - advance time but don't play anything
            currentBeat += 1;
            console.log(`    Rest at beat ${currentBeat.toFixed(2)} (duration: 1 beat)`);
          }
        }
      }
    });

    // Sort by start time
    events.sort((a, b) => a.startTime - b.startTime);
    console.log(`  ✅ Built ${events.length} playback events`);
    return events;
  }

  /**
   * Play musical parts
   * This is THE ONLY playback function - used everywhere in the app
   */
  async play(
    parts: PlaybackPart[],
    tempo: number = 120,
    options?: {
      onProgress?: (time: number, duration: number) => void;
      onComplete?: () => void;
      startFrom?: number; // Resume from this time in seconds
    }
  ): Promise<void> {
    try {
      console.log('🎵 [UnifiedPlayback] Starting playback');
      console.log('  Tempo:', tempo, 'BPM');
      console.log('  Parts:', parts.length);
      console.log('  Start from:', options?.startFrom ?? 0, 'seconds');

      // Stop any existing playback
      this.stop();

      // Store callbacks
      this.onProgress = options?.onProgress;
      this.onComplete = options?.onComplete;

      // Wait for audio engine
      const engine = await this.audioEngine;
      console.log('  ✅ Audio engine ready');

      // Build events
      this.events = this.buildEvents(parts, tempo);

      if (this.events.length === 0) {
        console.warn('  ⚠️ No events to play');
        this.onComplete?.();
        return;
      }

      // Calculate total duration
      const totalDuration = Math.max(...this.events.map(e => e.startTime + e.duration));
      console.log('  Total duration:', totalDuration.toFixed(2), 'seconds');

      // Start playback
      this.isPlaying = true;
      const startFrom = options?.startFrom ?? this.pausedAt;
      this.startTime = performance.now() - (startFrom * 1000);

      // 🚨 CRITICAL FIX: Get audio context for precise scheduling
      const audioContext = engine.getAudioContext?.();
      const useAudioScheduling = !!audioContext;
      
      if (useAudioScheduling) {
        console.log('  🎯 Using Web Audio API scheduling for precise timing');
        
        // Calculate base scheduled time (current time + small buffer)
        const baseScheduledTime = audioContext!.currentTime + 0.02;
        
        // Group events by start time to identify chords
        const eventsByTime = new Map<number, PlaybackEvent[]>();
        this.events.forEach(event => {
          const time = parseFloat(event.startTime.toFixed(4));
          if (!eventsByTime.has(time)) {
            eventsByTime.set(time, []);
          }
          eventsByTime.get(time)!.push(event);
        });
        
        console.log(`  🎵 Grouped ${this.events.length} events into ${eventsByTime.size} time slots (chords detected)`);
      }
      
      // Schedule all events
      this.events.forEach(event => {
        // Skip events before startFrom
        if (event.startTime < startFrom) {
          return;
        }

        const delay = event.startTime - startFrom;
        
        // Calculate exact scheduled time if using audio scheduling
        const scheduledTime = useAudioScheduling 
          ? (audioContext!.currentTime + 0.02 + delay)
          : undefined;

        const timeout = setTimeout(async () => {
          if (!this.isPlaying) return;

          try {
            // ADDITIVE: Handle chords (array of notes)
            if (Array.isArray(event.midiNote)) {
              console.log(`🎹 [UnifiedPlayback] Playing chord:`, event.midiNote);
              // Play all notes in the chord simultaneously with the same scheduled time
              const chordPromises = event.midiNote.map((note, idx) => {
                console.log(`  [UnifiedPlayback] Note ${idx}: ${note} (type: ${typeof note})`);
                return engine.playNote(
                  note,
                  event.duration,
                  event.instrument,
                  event.volume,
                  scheduledTime
                );
              });
              await Promise.all(chordPromises);
            } else {
              console.log(`🎵 [UnifiedPlayback] Playing single note: ${event.midiNote} (type: ${typeof event.midiNote})`);
              // Single note - Pass scheduled time for precise chord playback
              await engine.playNote(
                event.midiNote,
                event.duration,
                event.instrument,
                event.volume,
                scheduledTime
              );
            }
          } catch (error) {
            console.error('Error playing note:', error);
          }
        }, delay * 1000);

        this.playbackTimeouts.push(timeout);
      });

      // Progress tracking
      const progressInterval = setInterval(() => {
        if (!this.isPlaying) {
          clearInterval(progressInterval);
          return;
        }

        const elapsed = (performance.now() - this.startTime) / 1000;
        this.onProgress?.(elapsed, totalDuration);

        if (elapsed >= totalDuration) {
          clearInterval(progressInterval);
          this.stop();
          this.onComplete?.();
        }
      }, 50);

      this.playbackTimeouts.push(progressInterval as any);

      console.log('  ✅ Playback started');
    } catch (error) {
      console.error('❌ [UnifiedPlayback] Error:', error);
      throw error;
    }
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (!this.isPlaying) return;

    console.log('⏸️ [UnifiedPlayback] Pausing');
    this.pausedAt = (performance.now() - this.startTime) / 1000;
    this.isPlaying = false;

    // Clear all timeouts
    this.playbackTimeouts.forEach(timeout => clearTimeout(timeout));
    this.playbackTimeouts = [];
  }

  /**
   * Resume playback
   */
  async resume(parts: PlaybackPart[], tempo: number = 120): Promise<void> {
    if (this.isPlaying) return;

    console.log('▶️ [UnifiedPlayback] Resuming from', this.pausedAt.toFixed(2), 'seconds');
    await this.play(parts, tempo, {
      startFrom: this.pausedAt,
      onProgress: this.onProgress,
      onComplete: this.onComplete
    });
  }

  /**
   * Stop playback
   */
  stop(): void {
    if (!this.isPlaying && this.playbackTimeouts.length === 0) return;

    console.log('⏹️ [UnifiedPlayback] Stopping');
    this.isPlaying = false;
    this.pausedAt = 0;

    // Clear all timeouts
    this.playbackTimeouts.forEach(timeout => clearTimeout(timeout));
    this.playbackTimeouts = [];
  }

  /**
   * Check if currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

/**
 * Create a new playback controller
 */
export function createPlaybackController(): UnifiedPlaybackController {
  return new UnifiedPlaybackController();
}

/**
 * Convenience function for one-shot playback
 */
export async function playMusic(
  parts: PlaybackPart[],
  tempo: number = 120,
  options?: {
    onProgress?: (time: number, duration: number) => void;
    onComplete?: () => void;
  }
): Promise<void> {
  const controller = createPlaybackController();
  await controller.play(parts, tempo, options);
  return;
}