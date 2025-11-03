/**
 * Professional DAW Timeline Engine
 * 
 * Built to DAW industry standards (Ableton Live, Logic Pro, Pro Tools, etc.)
 * - Clip-based architecture
 * - Sample-accurate Web Audio scheduling
 * - Reliable data pipeline (no data loss)
 * - Accurate visual synchronization
 * - Professional track management
 * 
 * CHORD PLAYBACK FIX (v1.002):
 * - Groups notes by their absolute beat position before scheduling
 * - All notes at the same beat (chords) use the EXACT same scheduledTime value
 * - Ensures true simultaneous playback for harmony components
 */

import { SoundfontAudioEngine } from './soundfont-audio-engine';

// ============================================================================
// CORE DATA STRUCTURES (Industry Standard)
// ============================================================================

/**
 * A single note event with precise timing
 */
export interface TimelineNote {
  id: string;
  midiNote: number;
  startTime: number;      // In beats (quarter notes)
  duration: number;       // In beats (quarter notes)
  velocity: number;       // 0.0 to 1.0
}

/**
 * A clip contains a sequence of notes
 * Similar to Ableton clips or Logic regions
 * 
 * PROFESSIONAL DAW CLIP ARCHITECTURE:
 * - Clips can be moved anywhere on timeline (startBeat)
 * - Clips can be duplicated without affecting source
 * - Clips can be truncated/trimmed non-destructively (clipStart, clipEnd)
 * - Clips can be looped (loopEnabled, loopLength)
 * - Original note data is never modified (non-destructive editing)
 */
export interface TimelineClip {
  id: string;
  name: string;
  trackId: string;
  startBeat: number;      // When this clip starts on the timeline
  notes: TimelineNote[];  // Source notes (never modified)
  color: string;
  muted: boolean;
  
  // ========== DAW FLEXIBILITY FEATURES (ADDITIVE ONLY) ==========
  // All optional - existing clips without these work identically
  
  /** 
   * Clip start offset within source notes (in beats)
   * Allows non-destructive trimming from beginning
   * Default: 0 (play from beginning)
   */
  clipStart?: number;
  
  /** 
   * Clip end offset within source notes (in beats)
   * Allows non-destructive trimming from end
   * Default: undefined (play entire clip)
   */
  clipEnd?: number;
  
  /** 
   * Enable clip looping (like Ableton loop mode)
   * Default: false
   */
  loopEnabled?: boolean;
  
  /** 
   * Loop length in beats (if loopEnabled)
   * Default: entire clip length
   */
  loopLength?: number;
  
  /**
   * Reference to source component (for future piano roll editing)
   * Stores original component ID for data integrity
   */
  sourceComponentId?: string;
  
  /**
   * Clip gain/volume adjustment (0.0 to 2.0)
   * Multiplies with track volume
   * Default: 1.0 (no adjustment)
   */
  gain?: number;
}

/**
 * A track contains multiple clips
 * Similar to DAW tracks
 */
export interface TimelineTrack {
  id: string;
  name: string;
  instrument: string;
  volume: number;         // 0.0 to 1.0
  pan: number;            // -1.0 (left) to 1.0 (right)
  muted: boolean;
  solo: boolean;
  color: string;
  clips: TimelineClip[];
}

/**
 * The complete timeline project
 */
export interface TimelineProject {
  id: string;
  name: string;
  tempo: number;          // BPM
  timeSignature: { numerator: number; denominator: number };
  tracks: TimelineTrack[];
  markers: TimelineMarker[];
  loopEnabled: boolean;
  loopStart: number;      // In beats
  loopEnd: number;        // In beats
}

/**
 * Timeline markers for arrangement sections
 */
export interface TimelineMarker {
  id: string;
  name: string;
  beat: number;
  color: string;
}

// ============================================================================
// SCHEDULED EVENT (For Web Audio Playback)
// ============================================================================

/**
 * A scheduled audio event with precise Web Audio timing
 */
interface ScheduledNoteEvent {
  id: string;
  trackId: string;
  clipId: string;
  noteId: string;
  midiNote: number;
  scheduledTime: number;  // Web Audio context time (seconds)
  duration: number;       // In seconds
  instrument: string;
  velocity: number;
  volume: number;         // Track volume
  pan: number;            // Track pan
}

// ============================================================================
// PLAYBACK STATE
// ============================================================================

interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentBeat: number;
  startTime: number;      // Performance.now() when playback started
  pausedAt: number;       // Beat position when paused
}

// ============================================================================
// PROFESSIONAL TIMELINE ENGINE
// ============================================================================

export class ProfessionalTimelineEngine {
  private audioEngine: SoundfontAudioEngine;
  private project: TimelineProject;
  private state: PlaybackState;
  private scheduledEvents: Map<string, ScheduledNoteEvent>;
  private activeNotes: Map<string, any>;
  private animationFrameId: number | null;
  private lookAheadTime: number = 0.1;  // Schedule events 100ms ahead
  private scheduleInterval: number = 25; // Check every 25ms
  private lastScheduleTime: number = 0;
  
  // Callbacks
  private onPlaybackUpdate?: (beat: number, isPlaying: boolean) => void;
  private onPlaybackComplete?: () => void;

  constructor(audioEngine: SoundfontAudioEngine, project: TimelineProject) {
    this.audioEngine = audioEngine;
    this.project = project;
    this.scheduledEvents = new Map();
    this.activeNotes = new Map();
    this.animationFrameId = null;
    this.state = {
      isPlaying: false,
      isPaused: false,
      currentBeat: 0,
      startTime: 0,
      pausedAt: 0
    };
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Start playback from current position or beginning
   */
  async play(fromBeat?: number): Promise<void> {
    console.log('🎵 [Timeline] Starting playback', { fromBeat });

    // Initialize audio context
    const audioContext = this.audioEngine.getAudioContext();
    if (!audioContext) {
      console.error('❌ Audio context not available');
      return;
    }

    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // Set playback position
    const startBeat = fromBeat !== undefined ? fromBeat : this.state.currentBeat;
    
    this.state = {
      isPlaying: true,
      isPaused: false,
      currentBeat: startBeat,
      startTime: performance.now(),
      pausedAt: 0
    };

    // Start the scheduling loop
    this.lastScheduleTime = audioContext.currentTime;
    this.scheduleLoop();
    
    console.log('✅ [Timeline] Playback started');
  }

  /**
   * Pause playback (can be resumed)
   */
  pause(): void {
    console.log('⏸️ [Timeline] Pausing playback');
    
    this.state.isPaused = true;
    this.state.isPlaying = false;
    this.state.pausedAt = this.state.currentBeat;
    
    // Stop animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Stop all currently playing notes
    this.stopAllNotes();
    
    this.onPlaybackUpdate?.(this.state.currentBeat, false);
  }

  /**
   * Stop playback (return to beginning)
   */
  stop(): void {
    console.log('⏹️ [Timeline] Stopping playback');
    
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.currentBeat = 0;
    this.state.pausedAt = 0;
    
    // Stop animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Stop all notes
    this.stopAllNotes();
    
    this.onPlaybackUpdate?.(0, false);
  }

  /**
   * Seek to a specific beat position
   */
  seek(beat: number): void {
    console.log('⏩ [Timeline] Seeking to beat', beat);
    
    const wasPlaying = this.state.isPlaying;
    
    if (wasPlaying) {
      this.pause();
    }
    
    this.state.currentBeat = beat;
    this.state.pausedAt = beat;
    
    this.onPlaybackUpdate?.(beat, false);
    
    if (wasPlaying) {
      this.play(beat);
    }
  }

  /**
   * Get current playback state
   */
  getState(): Readonly<PlaybackState> {
    return { ...this.state };
  }

  /**
   * Set playback update callback
   */
  setOnPlaybackUpdate(callback: (beat: number, isPlaying: boolean) => void): void {
    this.onPlaybackUpdate = callback;
  }

  /**
   * Set playback complete callback
   */
  setOnPlaybackComplete(callback: () => void): void {
    this.onPlaybackComplete = callback;
  }

  /**
   * Update project data
   * ADDITIVE FIX: DAW-style live project updates
   * Updates project without stopping playback - new clips play immediately
   */
  setProject(project: TimelineProject): void {
    // CRITICAL FIX: Don't stop playback when project updates
    // This allows DAW-style live editing - new clips play immediately
    // Old scheduling code will be cleaned up automatically
    this.project = project;
    
    console.log('🔄 [Timeline] Project updated (live)', {
      trackCount: project.tracks.length,
      clipCount: project.tracks.reduce((sum, t) => sum + t.clips.length, 0),
      isPlaying: this.state.isPlaying
    });
  }

  /**
   * Get current project
   */
  getProject(): TimelineProject {
    return this.project;
  }

  /**
   * Set tempo
   */
  setTempo(tempo: number): void {
    this.project.tempo = tempo;
  }

  // ============================================================================
  // SCHEDULING ENGINE (Web Audio Based)
  // ============================================================================

  /**
   * Main scheduling loop using requestAnimationFrame
   * This is the heart of the DAW - it schedules notes ahead of time using Web Audio
   */
  private scheduleLoop = (): void => {
    if (!this.state.isPlaying) {
      return;
    }

    const audioContext = this.audioEngine.getAudioContext();
    if (!audioContext) {
      console.error('❌ Audio context not available');
      this.stop();
      return;
    }

    // Calculate current beat based on elapsed time
    const elapsedMs = performance.now() - this.state.startTime;
    const elapsedBeats = (elapsedMs / 1000) * (this.project.tempo / 60);
    this.state.currentBeat = this.state.pausedAt + elapsedBeats;

    // Schedule events that should play in the next lookAheadTime
    const currentAudioTime = audioContext.currentTime;
    const scheduleUntilAudioTime = currentAudioTime + this.lookAheadTime;

    // Convert beat range to audio time range
    const currentBeatsPerSecond = this.project.tempo / 60;
    const scheduleUntilBeat = this.state.currentBeat + (this.lookAheadTime * currentBeatsPerSecond);

    // Schedule all events in this range
    this.scheduleEventsInRange(this.state.currentBeat, scheduleUntilBeat, currentAudioTime);

    // Update listeners
    this.onPlaybackUpdate?.(this.state.currentBeat, true);

    // Check if we've reached the end
    const projectEnd = this.getProjectEndBeat();
    if (this.state.currentBeat >= projectEnd) {
      if (this.project.loopEnabled && this.project.loopEnd > this.project.loopStart) {
        // Loop back
        this.seek(this.project.loopStart);
      } else {
        // Stop at end
        this.stop();
        this.onPlaybackComplete?.();
        return;
      }
    }

    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.scheduleLoop);
  };

  /**
   * Schedule all note events in the given beat range
   * CRITICAL FIX: Groups notes by startTime to ensure chords play simultaneously
   */
  private scheduleEventsInRange(startBeat: number, endBeat: number, currentAudioTime: number): void {
    const audioContext = this.audioEngine.getAudioContext();
    if (!audioContext) return;

    // Get active tracks (not muted and not soloed if any track is solo)
    const hasSolo = this.project.tracks.some(t => t.solo);
    const activeTracks = this.project.tracks.filter(track => {
      if (track.muted) return false;
      if (hasSolo && !track.solo) return false;
      return true;
    });
    
    // 🔍 ADDITIVE DEBUG: Log scheduling context
    console.log('🔍 [SCHEDULE DEBUG] scheduleEventsInRange called:', {
      startBeat: startBeat.toFixed(2),
      endBeat: endBeat.toFixed(2),
      trackCount: this.project.tracks.length,
      activeTrackCount: activeTracks.length,
      totalClipCount: this.project.tracks.reduce((sum, t) => sum + t.clips.length, 0)
    });
    
    // 🔍 ADDITIVE DEBUG: Log each track and its clips
    for (const track of this.project.tracks) {
      console.log('🔍 [TRACK DEBUG]', {
        trackName: track.name,
        trackId: track.id,
        muted: track.muted,
        solo: track.solo,
        clipCount: track.clips.length,
        clips: track.clips.map(c => ({
          name: c.name,
          startBeat: c.startBeat,
          noteCount: c.notes.length
        }))
      });
    }

    // 🎵 CHORD PLAYBACK FIX: Group notes by their absolute beat position
    // This ensures all notes that should play at the same time share the exact same scheduledTime
    const notesByBeat = new Map<string, Array<{
      note: TimelineNote;
      absoluteBeat: number;
      track: TimelineTrack;
      clip: TimelineClip;
    }>>();

    // Iterate through all tracks and clips to collect notes
    for (const track of activeTracks) {
      for (const clip of track.clips) {
        if (clip.muted) continue;

        // === DAW-STYLE CLIP BOUNDARY HANDLING ===
        // Respect clipStart, clipEnd, and looping
        
        const clipStartOffset = clip.clipStart || 0;
        const clipLength = getClipLength(clip);
        const clipEndOffset = clip.clipEnd !== undefined ? clip.clipEnd : 
          (clip.notes.length > 0 ? Math.max(...clip.notes.map(n => n.startTime + n.duration)) : 0);
        
        // Calculate effective clip end on timeline
        let effectiveClipEnd = clip.startBeat + clipLength;
        
        // Handle looping: extend clip end if looped
        if (clip.loopEnabled && clip.loopLength) {
          // For scheduling purposes, consider up to 100 loops (arbitrary large number)
          effectiveClipEnd = clip.startBeat + (clip.loopLength * 100);
        }
        
        // Check if clip is in range
        if (clip.startBeat >= endBeat || effectiveClipEnd <= startBeat) {
          continue;
        }
        
        // 🔍 ADDITIVE DEBUG: Log clip being processed
        console.log('🔍 [CLIP DEBUG] Processing clip:', {
          clipId: clip.id.substring(0, 8),
          clipName: clip.name,
          clipStartBeat: clip.startBeat.toFixed(2),
          clipLength: clipLength.toFixed(2),
          effectiveClipEnd: effectiveClipEnd.toFixed(2),
          noteCount: clip.notes.length,
          trackName: track.name,
          inRange: clip.startBeat < endBeat && effectiveClipEnd > startBeat
        });

        // Collect notes in this clip
        for (const note of clip.notes) {
          // === APPLY CLIP BOUNDARIES ===
          // Only schedule notes within clipStart to clipEnd range
          
          if (note.startTime < clipStartOffset || note.startTime >= clipEndOffset) {
            continue; // Note is outside clip boundaries
          }
          
          // Calculate note position relative to clip start boundary
          const noteOffsetFromBoundary = note.startTime - clipStartOffset;
          
          // Handle looping
          if (clip.loopEnabled && clip.loopLength) {
            // Schedule note for each loop iteration in range
            const maxLoops = Math.ceil((endBeat - clip.startBeat) / clip.loopLength) + 1;
            
            for (let loopIteration = 0; loopIteration < maxLoops; loopIteration++) {
              const loopStartBeat = clip.startBeat + (loopIteration * clip.loopLength);
              const absoluteNoteBeat = loopStartBeat + noteOffsetFromBoundary;
              
              // Only collect if in current range
              if (absoluteNoteBeat >= startBeat && absoluteNoteBeat < endBeat) {
                const beatKey = absoluteNoteBeat.toFixed(6); // Use fixed precision for grouping
                if (!notesByBeat.has(beatKey)) {
                  notesByBeat.set(beatKey, []);
                }
                notesByBeat.get(beatKey)!.push({ note, absoluteBeat: absoluteNoteBeat, track, clip });
              }
            }
          } else {
            // Non-looping: standard collection
            const absoluteNoteBeat = clip.startBeat + noteOffsetFromBoundary;
            
            // Check if note is in range
            if (absoluteNoteBeat >= startBeat && absoluteNoteBeat < endBeat) {
              const beatKey = absoluteNoteBeat.toFixed(6); // Use fixed precision for grouping
              if (!notesByBeat.has(beatKey)) {
                notesByBeat.set(beatKey, []);
              }
              notesByBeat.get(beatKey)!.push({ note, absoluteBeat: absoluteNoteBeat, track, clip });
            }
          }
        }
      }
    }

    // 🎵 CHORD PLAYBACK FIX: Schedule all notes at each beat position together
    // All notes in a chord will use the EXACT same scheduledTime value
    for (const [beatKey, notesAtBeat] of notesByBeat.entries()) {
      if (notesAtBeat.length === 0) continue;
      
      // Calculate scheduledTime ONCE for all notes at this beat
      const absoluteBeat = notesAtBeat[0].absoluteBeat;
      const beatOffset = absoluteBeat - this.state.currentBeat;
      const secondsOffset = beatOffset / (this.project.tempo / 60);
      const scheduledTime = currentAudioTime + secondsOffset;
      
      // Only schedule if in the future (with small tolerance)
      if (scheduledTime < currentAudioTime - 0.001) {
        continue;
      }
      
      // Schedule all notes at this beat with the SAME scheduledTime
      for (const { note, absoluteBeat: noteBeat, track, clip } of notesAtBeat) {
        this.scheduleNoteAtBeatWithTime(note, noteBeat, track, clip, scheduledTime);
      }
    }

    // Clean up old scheduled events
    const eventsToDelete: string[] = [];
    for (const [eventId, event] of this.scheduledEvents.entries()) {
      if (event.scheduledTime + event.duration < currentAudioTime - 1.0) {
        eventsToDelete.push(eventId);
      }
    }
    for (const eventId of eventsToDelete) {
      this.scheduledEvents.delete(eventId);
    }
  }

  /**
   * Helper function to schedule a note at a specific beat with pre-calculated scheduledTime
   * CRITICAL: This ensures all notes at the same beat use the exact same scheduledTime (for chords)
   * Handles DAW-style clip gain and deduplication
   */
  private scheduleNoteAtBeatWithTime(
    note: TimelineNote,
    absoluteNoteBeat: number,
    track: TimelineTrack,
    clip: TimelineClip,
    scheduledTime: number
  ): void {
    const eventId = `${track.id}-${clip.id}-${note.id}-${absoluteNoteBeat.toFixed(3)}`;
    
    // Don't schedule if already scheduled
    if (this.scheduledEvents.has(eventId)) {
      return;
    }
    
    const durationSeconds = note.duration / (this.project.tempo / 60);
    
    // Apply clip gain (if set)
    const clipGain = clip.gain !== undefined ? clip.gain : 1.0;
    const effectiveVolume = track.volume * clipGain;
    
    const event: ScheduledNoteEvent = {
      id: eventId,
      trackId: track.id,
      clipId: clip.id,
      noteId: note.id,
      midiNote: note.midiNote,
      scheduledTime, // 🎵 Use the pre-calculated time (same for all notes in chord)
      duration: durationSeconds,
      instrument: track.instrument,
      velocity: note.velocity,
      volume: effectiveVolume,
      pan: track.pan
    };
    
    // Schedule the note
    this.scheduleNoteEvent(event);
    this.scheduledEvents.set(eventId, event);
  }

  /**
   * Schedule a single note event using Web Audio
   */
  private async scheduleNoteEvent(event: ScheduledNoteEvent): Promise<void> {
    try {
      // Calculate final volume (note velocity * track volume)
      const finalVolume = event.velocity * event.volume;

      console.log(
        `🎵 Scheduling: ${event.id} at ${event.scheduledTime.toFixed(3)}s ` +
        `(MIDI ${event.midiNote}, dur ${event.duration.toFixed(3)}s, vol ${finalVolume.toFixed(2)})`
      );

      // Schedule using the audio engine
      await this.audioEngine.playNote(
        event.midiNote,
        event.duration,
        event.instrument,
        finalVolume,
        event.scheduledTime
      );

    } catch (error) {
      console.error('❌ Error scheduling note event:', error);
    }
  }

  /**
   * Stop all currently playing notes
   */
  private stopAllNotes(): void {
    this.audioEngine.stopAllNotes();
    this.scheduledEvents.clear();
    this.activeNotes.clear();
  }

  /**
   * Get the end beat of a clip
   */
  private getClipEndBeat(clip: TimelineClip): number {
    if (clip.notes.length === 0) {
      return clip.startBeat;
    }
    const lastNote = clip.notes.reduce((max, note) => 
      Math.max(max, note.startTime + note.duration), 0
    );
    return clip.startBeat + lastNote;
  }

  /**
   * Get the end beat of the entire project
   */
  private getProjectEndBeat(): number {
    let maxBeat = 0;
    const clipDetails: any[] = []; // 🔍 ADDITIVE DEBUG
    
    for (const track of this.project.tracks) {
      for (const clip of track.clips) {
        const clipEnd = this.getClipEndBeat(clip);
        clipDetails.push({ // 🔍 ADDITIVE DEBUG
          trackName: track.name,
          clipName: clip.name,
          clipStart: clip.startBeat,
          clipEnd: clipEnd,
          noteCount: clip.notes.length
        });
        maxBeat = Math.max(maxBeat, clipEnd);
      }
    }
    
    const finalEndBeat = maxBeat || 32; // Minimum 32 beats (8 bars)
    
    // 🔍 ADDITIVE DEBUG: Log project end calculation
    console.log('🔍 [PROJECT END DEBUG]', {
      calculatedEndBeat: finalEndBeat.toFixed(2),
      clipCount: clipDetails.length,
      clips: clipDetails
    });
    
    return finalEndBeat;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.scheduledEvents.clear();
    this.activeNotes.clear();
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create an empty timeline project
 */
export function createEmptyProject(name: string = 'New Project'): TimelineProject {
  return {
    id: `project-${Date.now()}`,
    name,
    tempo: 120,
    timeSignature: { numerator: 4, denominator: 4 },
    tracks: [],
    markers: [],
    loopEnabled: false,
    loopStart: 0,
    loopEnd: 32
  };
}

/**
 * Create an empty track
 */
export function createEmptyTrack(name: string, instrument: string = 'piano'): TimelineTrack {
  return {
    id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    instrument,
    volume: 0.8,
    pan: 0,
    muted: false,
    solo: false,
    color: getRandomTrackColor(),
    clips: []
  };
}

/**
 * Create a clip from melody data
 */
export function createClipFromMelody(
  trackId: string,
  name: string,
  melody: number[],
  rhythm: number[],
  startBeat: number = 0
): TimelineClip {
  const notes: TimelineNote[] = [];
  let currentBeat = 0;
  let melodyIndex = 0;

  // Parse rhythm array to create notes
  for (let i = 0; i < rhythm.length; i++) {
    const rhythmValue = rhythm[i];

    if (rhythmValue === 0) {
      // Rest
      currentBeat += 1;
    } else if (rhythmValue === 1) {
      // Note
      if (melodyIndex < melody.length) {
        const midiNote = melody[melodyIndex];
        
        if (typeof midiNote === 'number' && midiNote > 0) {
          // Count consecutive 1s for note duration
          let duration = 1;
          while (i + 1 < rhythm.length && rhythm[i + 1] === 1) {
            duration++;
            i++;
          }

          notes.push({
            id: `note-${Date.now()}-${notes.length}`,
            midiNote,
            startTime: currentBeat,
            duration,
            velocity: 0.8
          });

          currentBeat += duration;
        } else {
          // Rest in melody
          currentBeat += 1;
        }
        melodyIndex++;
      }
    } else {
      // Other rhythm value (shouldn't happen, but handle it)
      currentBeat += Math.abs(rhythmValue);
    }
  }

  return {
    id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    trackId,
    startBeat,
    notes,
    color: getRandomClipColor(),
    muted: false
  };
}

/**
 * Create a clip from harmony chord data
 * Each element in harmonyNotes is a CHORD (array of notes that play simultaneously)
 * This is the same structure as in the MIDI export fix
 */
export function createClipFromHarmonyChords(
  trackId: string,
  name: string,
  harmonyNotes: number[][], // Array of chords (each chord = array of simultaneous notes)
  rhythm: number[],
  startBeat: number = 0
): TimelineClip {
  const notes: TimelineNote[] = [];
  let currentBeat = 0;

  // Process each chord
  for (let chordIndex = 0; chordIndex < harmonyNotes.length; chordIndex++) {
    const chord = harmonyNotes[chordIndex];
    const duration = rhythm[chordIndex] || 1;

    // Ensure chord is an array
    const chordNotes = Array.isArray(chord) ? chord : [chord];

    // Create a note for each MIDI note in the chord
    // KEY: All notes in a chord share the SAME startTime (simultaneous playback)
    chordNotes.forEach((midiNote) => {
      if (typeof midiNote === 'number' && midiNote > 0 && midiNote <= 127) {
        notes.push({
          id: `note-${Date.now()}-${notes.length}-${Math.random().toString(36).substr(2, 5)}`,
          midiNote,
          startTime: currentBeat,  // ← SAME startTime = simultaneous!
          duration,                 // ← SAME duration = chord duration
          velocity: 0.8
        });
      }
    });

    currentBeat += duration;
  }

  return {
    id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    trackId,
    startBeat,
    notes,
    color: getRandomClipColor(),
    muted: false
  };
}

/**
 * Get a random track color
 */
function getRandomTrackColor(): string {
  const colors = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f97316', // orange
    '#84cc16', // lime
    '#06b6d4', // cyan
    '#f59e0b', // amber
    '#10b981', // emerald
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Get a random clip color
 */
function getRandomClipColor(): string {
  const colors = [
    '#60a5fa', // blue
    '#a78bfa', // purple
    '#f472b6', // pink
    '#fb923c', // orange
    '#a3e635', // lime
    '#22d3ee', // cyan
    '#fbbf24', // amber
    '#34d399', // emerald
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ============================================================================
// DAW-STYLE CLIP MANIPULATION FUNCTIONS
// Professional DAW Features: Move, Duplicate, Loop, Truncate
// ============================================================================

/**
 * Move a clip to a new position on the timeline
 * Non-destructive: Original clip data is preserved
 * 
 * @param clip - The clip to move
 * @param newStartBeat - New timeline position in beats
 * @returns Updated clip with new position
 * 
 * Example: Ableton Live/Logic Pro drag-and-drop behavior
 */
export function moveClip(clip: TimelineClip, newStartBeat: number): TimelineClip {
  return {
    ...clip,
    startBeat: Math.max(0, newStartBeat) // Ensure non-negative
  };
}

/**
 * Duplicate a clip (like Ctrl+D in Ableton Live)
 * Creates a new clip with identical properties
 * 
 * @param clip - The clip to duplicate
 * @param offset - Beat offset from original clip (default: place immediately after)
 * @returns New clip instance
 * 
 * Example: Ableton "Duplicate" command
 */
export function duplicateClip(clip: TimelineClip, offset?: number): TimelineClip {
  // Calculate default offset: place immediately after source clip
  const clipLength = getClipLength(clip);
  const defaultOffset = offset !== undefined ? offset : clipLength;
  
  return {
    ...clip,
    id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    startBeat: clip.startBeat + defaultOffset,
    // Deep copy notes array to ensure full independence
    notes: clip.notes.map(note => ({ ...note, id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }))
  };
}

/**
 * Enable/disable looping on a clip
 * 
 * @param clip - The clip to modify
 * @param enabled - Enable or disable looping
 * @param loopLength - Length of loop in beats (optional, defaults to clip length)
 * @returns Updated clip
 * 
 * Example: Ableton Live loop mode
 */
export function setClipLoop(clip: TimelineClip, enabled: boolean, loopLength?: number): TimelineClip {
  const clipLen = getClipLength(clip);
  
  return {
    ...clip,
    loopEnabled: enabled,
    loopLength: loopLength !== undefined ? loopLength : clipLen
  };
}

/**
 * Truncate/trim a clip non-destructively
 * Uses clipStart/clipEnd to define playback boundaries
 * Original notes are never modified
 * 
 * @param clip - The clip to truncate
 * @param startOffset - Start position within clip (in beats from clip beginning)
 * @param endOffset - End position within clip (in beats from clip beginning)
 * @returns Updated clip
 * 
 * Example: Logic Pro region trimming, Pro Tools clip boundaries
 */
export function truncateClip(clip: TimelineClip, startOffset: number, endOffset?: number): TimelineClip {
  const clipLength = getClipLength(clip);
  
  return {
    ...clip,
    clipStart: Math.max(0, startOffset),
    clipEnd: endOffset !== undefined ? Math.min(endOffset, clipLength) : undefined
  };
}

/**
 * Adjust clip gain/volume
 * 
 * @param clip - The clip to modify
 * @param gain - Gain multiplier (0.0 to 2.0, default 1.0)
 * @returns Updated clip
 */
export function setClipGain(clip: TimelineClip, gain: number): TimelineClip {
  return {
    ...clip,
    gain: Math.max(0, Math.min(2.0, gain))
  };
}

/**
 * Split a clip at a specific beat position
 * Creates two clips from one (non-destructive split)
 * 
 * @param clip - The clip to split
 * @param splitBeat - Beat position to split at (relative to clip start)
 * @returns Array of two clips [left, right]
 * 
 * Example: Pro Tools "Split" command, Logic "Split at Playhead"
 */
export function splitClip(clip: TimelineClip, splitBeat: number): [TimelineClip, TimelineClip] {
  const clipLength = getClipLength(clip);
  
  if (splitBeat <= 0 || splitBeat >= clipLength) {
    // Invalid split position, return original + null
    throw new Error(`Invalid split position: ${splitBeat} (clip length: ${clipLength})`);
  }
  
  // Left clip: from start to split point
  const leftClip: TimelineClip = {
    ...clip,
    id: `clip-${Date.now()}-L-${Math.random().toString(36).substr(2, 9)}`,
    clipEnd: (clip.clipStart || 0) + splitBeat
  };
  
  // Right clip: from split point to end
  const rightClip: TimelineClip = {
    ...clip,
    id: `clip-${Date.now()}-R-${Math.random().toString(36).substr(2, 9)}`,
    startBeat: clip.startBeat + splitBeat,
    clipStart: (clip.clipStart || 0) + splitBeat,
    clipEnd: clip.clipEnd
  };
  
  return [leftClip, rightClip];
}

/**
 * Get the effective length of a clip considering clipStart/clipEnd
 * 
 * @param clip - The clip to measure
 * @returns Length in beats
 */
export function getClipLength(clip: TimelineClip): number {
  if (clip.notes.length === 0) return 0;
  
  // Find the maximum end time of all notes
  const maxNoteEnd = clip.notes.reduce((max, note) => 
    Math.max(max, note.startTime + note.duration), 0
  );
  
  // Apply clip boundaries if set
  const effectiveStart = clip.clipStart || 0;
  const effectiveEnd = clip.clipEnd !== undefined ? clip.clipEnd : maxNoteEnd;
  
  return Math.max(0, effectiveEnd - effectiveStart);
}

/**
 * Get the actual end beat of a clip on the timeline
 * Accounts for looping if enabled
 * 
 * @param clip - The clip
 * @param maxLoops - Maximum number of loops to calculate (default: 1, no looping)
 * @returns End beat position
 */
export function getClipEndBeat(clip: TimelineClip, maxLoops: number = 1): number {
  const clipLength = getClipLength(clip);
  
  if (clip.loopEnabled && clip.loopLength && maxLoops > 1) {
    return clip.startBeat + (clip.loopLength * maxLoops);
  }
  
  return clip.startBeat + clipLength;
}

/**
 * Get notes that should be played from a clip considering all boundaries
 * Handles clipStart, clipEnd, and looping
 * 
 * @param clip - The clip
 * @param currentBeat - Current playback position
 * @returns Array of notes to play
 */
export function getActiveNotesForClip(clip: TimelineClip, currentBeat: number): TimelineNote[] {
  const clipStart = clip.clipStart || 0;
  const clipLength = getClipLength(clip);
  const clipEnd = clipStart + clipLength;
  
  // Check if current beat is within clip playback range
  const beatInTimeline = currentBeat - clip.startBeat;
  
  if (beatInTimeline < 0) {
    return []; // Before clip starts
  }
  
  // Handle looping
  let effectiveBeatInClip = beatInTimeline;
  if (clip.loopEnabled && clip.loopLength) {
    effectiveBeatInClip = beatInTimeline % clip.loopLength;
  } else if (beatInTimeline >= clipLength) {
    return []; // Past clip end and no looping
  }
  
  // Adjust for clip start offset
  const absoluteBeatInSource = clipStart + effectiveBeatInClip;
  
  // Filter notes within boundaries
  return clip.notes.filter(note => {
    const noteStart = note.startTime;
    const noteEnd = note.startTime + note.duration;
    
    // Note must start within clip boundaries
    return noteStart >= clipStart && 
           noteStart < clipEnd &&
           noteStart <= absoluteBeatInSource &&
           noteEnd > absoluteBeatInSource;
  });
}