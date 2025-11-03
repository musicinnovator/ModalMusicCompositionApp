/**
 * Professional Soundfont-based Audio Engine
 * Uses real instrument samples for high-quality playback
 * Includes comprehensive error handling and automatic memory management
 */

import Soundfont from 'soundfont-player';

/**
 * SOUNDFONT VOLUME BOOST CONFIGURATION
 * 
 * Soundfont samples have naturally lower output levels compared to synthesized audio.
 * This multiplier increases the Soundfont output to match the synth engine's perceived loudness.
 * 
 * Synth engine uses gain of 0.6 with peak envelope of 0.8 (effective ~0.48)
 * Soundfont needs boost to reach similar perceived loudness
 * 
 * Tested values:
 * - 1.0 = Too quiet (original problem)
 * - 2.5 = Matches synth loudness well
 * - 3.0 = Slightly louder than synth
 * - 4.0 = Too loud
 */
const SOUNDFONT_VOLUME_BOOST = 3.0;

// Soundfont instrument names (standardized General MIDI names)
export type SoundfontInstrument = 
  | 'acoustic_grand_piano'
  | 'bright_acoustic_piano'
  | 'electric_grand_piano'
  | 'honkytonk_piano'
  | 'electric_piano_1'
  | 'electric_piano_2'
  | 'harpsichord'
  | 'clavinet'
  | 'celesta'
  | 'glockenspiel'
  | 'music_box'
  | 'vibraphone'
  | 'marimba'
  | 'xylophone'
  | 'tubular_bells'
  | 'dulcimer'
  | 'drawbar_organ'
  | 'percussive_organ'
  | 'rock_organ'
  | 'church_organ'
  | 'reed_organ'
  | 'accordion'
  | 'harmonica'
  | 'tango_accordion'
  | 'acoustic_guitar_nylon'
  | 'acoustic_guitar_steel'
  | 'electric_guitar_jazz'
  | 'electric_guitar_clean'
  | 'electric_guitar_muted'
  | 'overdriven_guitar'
  | 'distortion_guitar'
  | 'guitar_harmonics'
  | 'acoustic_bass'
  | 'electric_bass_finger'
  | 'electric_bass_pick'
  | 'fretless_bass'
  | 'slap_bass_1'
  | 'slap_bass_2'
  | 'synth_bass_1'
  | 'synth_bass_2'
  | 'violin'
  | 'viola'
  | 'cello'
  | 'contrabass'
  | 'tremolo_strings'
  | 'pizzicato_strings'
  | 'orchestral_harp'
  | 'timpani'
  | 'string_ensemble_1'
  | 'string_ensemble_2'
  | 'synthstrings_1'
  | 'synthstrings_2'
  | 'choir_aahs'
  | 'voice_oohs'
  | 'synth_voice'
  | 'orchestra_hit'
  | 'trumpet'
  | 'trombone'
  | 'tuba'
  | 'muted_trumpet'
  | 'french_horn'
  | 'brass_section'
  | 'synthbrass_1'
  | 'synthbrass_2'
  | 'soprano_sax'
  | 'alto_sax'
  | 'tenor_sax'
  | 'baritone_sax'
  | 'oboe'
  | 'english_horn'
  | 'bassoon'
  | 'clarinet'
  | 'piccolo'
  | 'flute'
  | 'recorder'
  | 'pan_flute'
  | 'blown_bottle'
  | 'shakuhachi'
  | 'whistle'
  | 'ocarina';

// Map our internal instrument types to soundfont names
export const INSTRUMENT_SOUNDFONT_MAP: Record<string, SoundfontInstrument> = {
  'piano': 'acoustic_grand_piano',
  'harpsichord': 'harpsichord',
  'organ': 'church_organ',
  'guitar': 'acoustic_guitar_nylon',
  'bass': 'acoustic_bass',
  'violin': 'violin',
  'viola': 'viola',
  'cello': 'cello',
  'strings': 'string_ensemble_1',
  'trumpet': 'trumpet',
  'trombone': 'trombone',
  'french_horn': 'french_horn',
  'flute': 'flute',
  'clarinet': 'clarinet',
  'oboe': 'oboe',
  'bassoon': 'bassoon',
  'choir': 'choir_aahs',
  'vibraphone': 'vibraphone',
  'marimba': 'marimba',
  'xylophone': 'xylophone'
};

interface LoadedInstrument {
  player: Soundfont.Player;
  lastUsed: number;
  name: SoundfontInstrument;
}

interface PlayingNote {
  stop: () => void;
  timeoutId: NodeJS.Timeout;
}

export class SoundfontAudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private loadedInstruments: Map<SoundfontInstrument, LoadedInstrument> = new Map();
  private loadingInstruments: Map<SoundfontInstrument, Promise<Soundfont.Player>> = new Map();
  private playingNotes: Map<string, PlayingNote> = new Map();
  private maxCachedInstruments = 5; // Keep max 5 instruments in memory
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private initError: string | null = null;
  private externalAudioContext: AudioContext | null = null; // For sharing AudioContext with effects
  private externalDestination: AudioNode | null = null; // For routing through effects

  /**
   * Initialize the audio engine
   * @param externalContext Optional external AudioContext to use (for sharing with effects engine)
   * @param externalDestination Optional external destination node (for routing through effects)
   */
  async initialize(externalContext?: AudioContext, externalDestination?: AudioNode): Promise<void> {
    try {
      console.log('🎵 Initializing Soundfont Audio Engine...');
      
      // If already initialized and we have a context, check if we need to update
      if (this.isInitialized && this.audioContext) {
        // If we're being asked to use an external context but aren't already
        if (externalContext && this.audioContext !== externalContext) {
          console.log('⚠️ Switching to new AudioContext - will reinitialize');
          // Dispose and reinitialize with new context
          await this.dispose();
        } else {
          console.log('🎵 Soundfont engine already initialized with correct context');
          // Just update the external destination if provided
          if (externalDestination && externalDestination !== this.externalDestination) {
            this.setExternalDestination(externalDestination);
          }
          return;
        }
      }

      // Store external destination BEFORE creating audio nodes
      if (externalDestination) {
        this.externalDestination = externalDestination;
        console.log('🎛️ External destination will be used for routing');
      }

      // Use external context if provided, otherwise create our own
      if (externalContext) {
        this.audioContext = externalContext;
        this.externalAudioContext = externalContext;
        console.log('🎵 Using shared AudioContext from effects engine');
      } else {
        // Create audio context
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          throw new Error('Web Audio API not supported in this browser');
        }
        this.audioContext = new AudioContextClass();
        console.log('🎵 Created new AudioContext for soundfont engine');
      }
      
      // Create master gain node with the correct context
      this.masterGain = this.audioContext.createGain();
      
      // Connect to external destination if provided, otherwise use context destination
      if (this.externalDestination) {
        // CRITICAL FIX: Validate contexts match BEFORE attempting connection
        const destContext = (this.externalDestination as any).context;
        if (destContext && destContext !== this.audioContext) {
          console.error('❌ INITIALIZATION ERROR: External destination has different AudioContext');
          console.error('   Destination context:', destContext);
          console.error('   Soundfont context:', this.audioContext);
          // Clear the invalid external destination
          this.externalDestination = null;
          this.masterGain.connect(this.audioContext.destination);
          console.log('🔊 Falling back to direct audio output due to context mismatch');
        } else {
          this.masterGain.connect(this.externalDestination);
          console.log('🎛️ Connected to external destination (effects chain)');
        }
      } else {
        this.masterGain.connect(this.audioContext.destination);
        console.log('🔊 Connected directly to audio output');
      }
      // Apply volume boost to match synth engine loudness
      this.masterGain.gain.value = SOUNDFONT_VOLUME_BOOST;
      console.log(`🔊 Soundfont master volume set to ${SOUNDFONT_VOLUME_BOOST}x boost`);

      // Resume context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Start cleanup interval - check every 30 seconds
      this.cleanupInterval = setInterval(() => {
        this.cleanupUnusedInstruments();
      }, 30000);

      this.isInitialized = true;
      this.initError = null;
      console.log('✅ Soundfont Audio Engine initialized successfully');
    } catch (error: any) {
      this.initError = `Failed to initialize audio: ${error.message}`;
      console.error('❌ Soundfont initialization error:', error);
      throw error;
    }
  }

  /**
   * Load an instrument from soundfont
   */
  private async loadInstrument(instrumentName: SoundfontInstrument): Promise<Soundfont.Player> {
    try {
      if (!this.audioContext) {
        throw new Error('Audio context not initialized');
      }

      // Check if already loaded
      const cached = this.loadedInstruments.get(instrumentName);
      if (cached) {
        cached.lastUsed = Date.now();
        console.log(`🎵 Using cached instrument: ${instrumentName}`);
        return cached.player;
      }

      // Check if currently loading
      const loading = this.loadingInstruments.get(instrumentName);
      if (loading) {
        console.log(`⏳ Waiting for instrument to load: ${instrumentName}`);
        return loading;
      }

      // Start loading
      console.log(`📥 Loading soundfont instrument: ${instrumentName}...`);
      
      // CRITICAL FIX: Route instrument through masterGain (and effects if connected)
      // This ensures the soundfont player respects our audio routing and effects chain
      const destination = this.masterGain || this.audioContext.destination;
      
      const loadPromise = Soundfont.instrument(this.audioContext, instrumentName, {
        // Use MusyngKite soundfont for better quality
        soundfont: 'MusyngKite',
        // Apply volume boost to match synth engine loudness
        // Note: This is in addition to masterGain boost for consistent levels
        gain: SOUNDFONT_VOLUME_BOOST,
        // CRITICAL: Set destination to route through our masterGain node (which connects to effects)
        destination: destination
      });

      this.loadingInstruments.set(instrumentName, loadPromise);

      const player = await loadPromise;

      // Store in cache
      this.loadedInstruments.set(instrumentName, {
        player,
        lastUsed: Date.now(),
        name: instrumentName
      });

      // Remove from loading map
      this.loadingInstruments.delete(instrumentName);

      // Cleanup old instruments if we have too many
      if (this.loadedInstruments.size > this.maxCachedInstruments) {
        this.cleanupUnusedInstruments();
      }

      console.log(`✅ Loaded instrument: ${instrumentName}`);
      return player;
    } catch (error: any) {
      this.loadingInstruments.delete(instrumentName);
      console.error(`❌ Failed to load instrument ${instrumentName}:`, error);
      throw new Error(`Failed to load ${instrumentName}: ${error.message}`);
    }
  }

  /**
   * Clean up least recently used instruments
   */
  private cleanupUnusedInstruments(): void {
    try {
      if (this.loadedInstruments.size <= this.maxCachedInstruments) {
        return;
      }

      console.log('🧹 Cleaning up unused instruments...');

      // Sort by last used time
      const sorted = Array.from(this.loadedInstruments.entries())
        .sort((a, b) => a[1].lastUsed - b[1].lastUsed);

      // Remove oldest instruments
      const toRemove = sorted.slice(0, sorted.length - this.maxCachedInstruments);
      
      for (const [name, instrument] of toRemove) {
        try {
          // Stop the instrument
          if (instrument.player && typeof instrument.player.stop === 'function') {
            instrument.player.stop();
          }
          this.loadedInstruments.delete(name);
          console.log(`🗑️ Unloaded instrument: ${name}`);
        } catch (error) {
          console.warn(`Warning cleaning up ${name}:`, error);
        }
      }

      console.log(`✅ Cleanup complete. ${this.loadedInstruments.size} instruments cached.`);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Play a note with specified instrument
   * @param scheduledTime - Optional: Exact time to schedule the note (for simultaneous chord playback)
   */
  async playNote(
    midiNote: number,
    duration: number = 1.0,
    instrumentType: string = 'piano',
    velocity: number = 1.0,
    scheduledTime?: number
  ): Promise<void> {
    try {
      // Validate MIDI note
      if (typeof midiNote !== 'number' || isNaN(midiNote) || midiNote < 0 || midiNote > 127) {
        console.error('❌ Invalid MIDI note:', midiNote);
        throw new Error(`Invalid MIDI note: ${midiNote}. Must be 0-127.`);
      }

      // Clamp MIDI note to soundfont-supported range (A0 to C8, MIDI 21-108)
      // This prevents "Buffer C-1 not found" errors for very low notes
      let clampedNote = midiNote;
      if (midiNote < 21) {
        console.warn(`⚠️ MIDI note ${midiNote} is below soundfont range. Transposing up to ${21 + (midiNote % 12)}`);
        clampedNote = 21 + (midiNote % 12); // Transpose to lowest octave with same pitch class
      } else if (midiNote > 108) {
        console.warn(`⚠️ MIDI note ${midiNote} is above soundfont range. Transposing down to ${108 - (12 - (midiNote % 12))}`);
        clampedNote = 108 - (12 - (midiNote % 12)); // Transpose to highest octave with same pitch class
      }

      // Validate duration
      if (typeof duration !== 'number' || isNaN(duration) || duration <= 0) {
        console.error('❌ Invalid duration:', duration, '- This is likely a rest value that should have been filtered out');
        console.error('❌ Stack trace for debugging:', new Error().stack);
        // Don't throw - just skip silently to prevent crashes
        // This is a defensive measure for rest values that slip through
        return;
      }

      // Validate instrument type
      if (typeof instrumentType !== 'string' || !instrumentType) {
        console.error('❌ Invalid instrument type:', instrumentType);
        throw new Error(`Invalid instrument type: ${instrumentType}`);
      }

      // Auto-initialize if not initialized
      if (!this.isInitialized || !this.audioContext) {
        console.log('🎵 Soundfont engine not initialized, initializing now...');
        try {
          await this.initialize();
        } catch (initError: any) {
          console.error('❌ Failed to initialize soundfont engine:', initError);
          throw new Error(`Audio engine initialization failed: ${initError.message}`);
        }
        
        // Verify initialization succeeded
        if (!this.isInitialized || !this.audioContext) {
          throw new Error('Audio engine failed to initialize properly');
        }
      }

      // Resume context if needed
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('🎵 Audio context resumed');
      }

      // Map instrument type to soundfont name
      const soundfontName = INSTRUMENT_SOUNDFONT_MAP[instrumentType] || 'acoustic_grand_piano';

      // Load instrument
      const player = await this.loadInstrument(soundfontName);

      // Apply velocity with volume boost to match synth engine
      // Clamp between 0.1 and 1.0, then apply SOUNDFONT_VOLUME_BOOST
      const baseVelocity = Math.max(0.1, Math.min(1.0, velocity));
      const boostedVelocity = baseVelocity * SOUNDFONT_VOLUME_BOOST;
      
      // Convert MIDI note number to note name (e.g., 60 -> "C4")
      const noteName = this.midiNoteToName(clampedNote);

      // 🚨 CRITICAL FIX FOR CHORD PLAYBACK: Use provided scheduledTime or current time + small buffer
      // When scheduledTime is provided (for chords), all notes will start at the EXACT same moment
      // This ensures proper simultaneous playback even when loading instruments sequentially
      const noteStartTime = scheduledTime !== undefined 
        ? scheduledTime 
        : this.audioContext.currentTime + 0.005; // Small buffer for single notes
      
      // Play the note with boosted volume to match synth engine loudness
      const playedNote = player.play(noteName, noteStartTime, {
        duration: Math.max(0.1, duration), // Ensure minimum duration
        gain: boostedVelocity // Boosted velocity for audible playback
      });

      // Store playing note for cleanup
      const noteId = `${instrumentType}-${midiNote}-${Date.now()}`;
      
      // Create cleanup timeout
      const timeoutId = setTimeout(() => {
        this.playingNotes.delete(noteId);
      }, duration * 1000 + 100); // Add small buffer

      this.playingNotes.set(noteId, {
        stop: () => {
          if (playedNote && typeof playedNote.stop === 'function') {
            playedNote.stop();
          }
        },
        timeoutId
      });

    } catch (error: any) {
      console.error('❌ Error playing note:', error);
      throw new Error(`Failed to play note: ${error.message}`);
    }
  }

  /**
   * Convert MIDI note number to note name
   * Ensures note names are within soundfont-supported range
   */
  private midiNoteToName(midiNote: number): string {
    const noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = noteNames[midiNote % 12];
    
    // Validate octave is within reasonable range
    // Soundfont typically supports -1 to 9, but we clamp to 0-8 for safety
    const clampedOctave = Math.max(0, Math.min(8, octave));
    
    if (octave !== clampedOctave) {
      console.warn(`⚠️ Octave ${octave} clamped to ${clampedOctave} for note ${noteName}`);
    }
    
    return `${noteName}${clampedOctave}`;
  }

  /**
   * Get the audio context (for scheduling notes at precise times)
   */
  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  /**
   * Stop all currently playing notes
   */
  stopAllNotes(): void {
    try {
      console.log(`🛑 Stopping ${this.playingNotes.size} playing notes...`);
      
      for (const [noteId, note] of this.playingNotes.entries()) {
        try {
          // Clear timeout
          if (note.timeoutId) {
            clearTimeout(note.timeoutId);
          }
          // Stop note
          note.stop();
        } catch (error) {
          console.warn(`Warning stopping note ${noteId}:`, error);
        }
      }

      this.playingNotes.clear();
      console.log('✅ All notes stopped');
    } catch (error) {
      console.error('Error stopping notes:', error);
    }
  }

  /**
   * Set master volume
   */
  setVolume(volume: number): void {
    try {
      // Validate input
      if (typeof volume !== 'number' || isNaN(volume)) {
        console.error('❌ Invalid volume value:', volume);
        return;
      }

      if (!this.masterGain) {
        console.warn('⚠️ Master gain not available - audio may not be initialized');
        return;
      }

      // Standard volume (100% = 1.0)
      const normalizedVolume = Math.max(0, Math.min(1.0, volume));
      
      // Apply volume with smooth ramp to prevent clicks
      const currentTime = this.audioContext?.currentTime || 0;
      if (this.audioContext && currentTime > 0) {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, currentTime);
        this.masterGain.gain.linearRampToValueAtTime(normalizedVolume, currentTime + 0.05);
      } else {
        this.masterGain.gain.value = normalizedVolume;
      }
      
      console.log(`🔊 Volume set to ${Math.round(volume * 100)}%`);
    } catch (error) {
      console.error('❌ Error setting volume:', error);
    }
  }

  /**
   * Get list of available instruments
   */
  getAvailableInstruments(): string[] {
    return Object.keys(INSTRUMENT_SOUNDFONT_MAP);
  }

  /**
   * Check if engine is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.audioContext !== null && this.initError === null;
  }

  /**
   * Get initialization error if any
   */
  getError(): string | null {
    return this.initError;
  }

  /**
   * Set external destination for routing through effects
   * Call this to route audio through an effects chain instead of directly to speakers
   * @param destination The AudioNode to connect to (e.g., effects input node)
   */
  setExternalDestination(destination: AudioNode | null): void {
    try {
      console.log('🎛️ Setting external destination for soundfont audio...');
      
      // If not initialized yet, just store the destination for later use
      if (!this.isInitialized || !this.audioContext || !this.masterGain) {
        console.log('ℹ️ Engine not initialized yet, storing destination for later connection');
        this.externalDestination = destination;
        return;
      }
      
      // Validate that destination belongs to the same AudioContext
      if (destination && this.audioContext) {
        // Check if the destination's context matches our context
        const destContext = (destination as any).context;
        if (destContext && destContext !== this.audioContext) {
          console.error('❌ Cannot connect: destination belongs to different AudioContext');
          console.error('   Destination context:', destContext);
          console.error('   Soundfont context:', this.audioContext);
          console.warn('⚠️ This usually means the AudioContext was not properly shared during initialization');
          console.warn('⚠️ Call initialize(externalContext, externalDestination) with both parameters instead');
          // Don't throw - just log the error and skip connection
          return;
        }
        console.log('✅ AudioContext validation passed - same context');
      }
      
      this.externalDestination = destination;
      
      if (this.masterGain && this.audioContext) {
        // Disconnect from current destination
        try {
          this.masterGain.disconnect();
          console.log('🔌 Disconnected from previous destination');
        } catch (e) {
          console.log('ℹ️ No previous connection to disconnect');
        }
        
        // Reconnect to new destination
        if (destination) {
          this.masterGain.connect(destination);
          console.log('✅ Soundfont audio routed through effects chain');
        } else {
          this.masterGain.connect(this.audioContext.destination);
          console.log('✅ Soundfont audio routed directly to speakers');
        }
      } else {
        console.warn('⚠️ Cannot set destination - masterGain or audioContext not available');
      }
    } catch (error) {
      console.error('❌ Error setting external destination:', error);
      throw error; // Re-throw to allow caller to handle
    }
  }

  /**
   * Cleanup and dispose
   */
  async dispose(): Promise<void> {
    try {
      console.log('🧹 Disposing Soundfont Audio Engine...');

      // Stop cleanup interval
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }

      // Stop all playing notes
      this.stopAllNotes();

      // Unload all instruments
      for (const [name, instrument] of this.loadedInstruments.entries()) {
        try {
          if (instrument.player && typeof instrument.player.stop === 'function') {
            instrument.player.stop();
          }
        } catch (error) {
          console.warn(`Warning disposing ${name}:`, error);
        }
      }
      this.loadedInstruments.clear();
      this.loadingInstruments.clear();

      // Disconnect master gain
      if (this.masterGain) {
        try {
          this.masterGain.disconnect();
        } catch (e) {
          console.log('ℹ️ Master gain already disconnected');
        }
      }

      // Only close audio context if we own it (not external)
      if (this.audioContext && !this.externalAudioContext && this.audioContext.state !== 'closed') {
        console.log('🔇 Closing owned AudioContext');
        await this.audioContext.close();
      } else if (this.externalAudioContext) {
        console.log('ℹ️ Not closing external AudioContext - managed by effects engine');
      }

      this.audioContext = null;
      this.externalAudioContext = null;
      this.masterGain = null;
      this.externalDestination = null;
      this.isInitialized = false;

      console.log('✅ Soundfont Audio Engine disposed');
    } catch (error) {
      console.error('Error during disposal:', error);
    }
  }

  /**
   * Preload commonly used instruments
   */
  async preloadInstruments(instruments: string[]): Promise<void> {
    try {
      console.log('📥 Preloading instruments:', instruments);

      const loadPromises = instruments.map(async (instrumentType) => {
        const soundfontName = INSTRUMENT_SOUNDFONT_MAP[instrumentType] || 'acoustic_grand_piano';
        try {
          await this.loadInstrument(soundfontName);
          return { instrument: instrumentType, success: true };
        } catch (error: any) {
          console.error(`Failed to preload ${instrumentType}:`, error);
          return { instrument: instrumentType, success: false, error: error.message };
        }
      });

      const results = await Promise.allSettled(loadPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
      console.log(`✅ Preloaded ${successful}/${instruments.length} instruments`);
    } catch (error) {
      console.error('Error preloading instruments:', error);
    }
  }
}

// Global singleton instance
let globalEngine: SoundfontAudioEngine | null = null;

/**
 * Get or create the global soundfont engine instance
 * @param externalContext Optional external AudioContext to share with effects engine
 * @param externalDestination Optional external destination node for routing through effects
 */
export async function getSoundfontEngine(
  externalContext?: AudioContext, 
  externalDestination?: AudioNode
): Promise<SoundfontAudioEngine> {
  if (!globalEngine) {
    console.log('🎵 Creating new global soundfont engine instance...');
    globalEngine = new SoundfontAudioEngine();
    await globalEngine.initialize(externalContext, externalDestination);
  } else {
    // If engine exists, make sure it's using the right context and destination
    if (externalContext) {
      console.log('🎵 Ensuring soundfont engine uses external context and destination...');
      await globalEngine.initialize(externalContext, externalDestination);
    } else if (!globalEngine.isReady()) {
      console.log('🎵 Reinitializing soundfont engine...');
      await globalEngine.initialize(undefined, externalDestination);
    } else if (externalDestination) {
      // Just update destination if already initialized
      globalEngine.setExternalDestination(externalDestination);
    }
  }
  return globalEngine;
}

/**
 * Dispose the global engine (for cleanup)
 */
export async function disposeSoundfontEngine(): Promise<void> {
  if (globalEngine) {
    await globalEngine.dispose();
    globalEngine = null;
  }
}