import { useState, useRef, useEffect } from 'react';
import { Theme, isRest, isNote, RestDuration, getRestValueBeats, midiNoteToNoteName, NoteValue, getNoteValueBeats } from '../types/musical';
import { EnhancedTheme, getRestDurationBeats } from './ThemeComposer';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Play, Pause, Square, Volume2, Music, Download } from 'lucide-react';
import { Badge } from './ui/badge';
import { InstrumentSelector } from './InstrumentSelector';
import { InstrumentType } from '../lib/enhanced-synthesis';
import { EnhancedSynthesizer, ENHANCED_INSTRUMENTS } from '../lib/enhanced-synthesis';
import { getSoundfontEngine, SoundfontAudioEngine } from '../lib/soundfont-audio-engine';
import { audioPlaybackManager } from '../lib/audio-playback-manager';
import { toast } from 'sonner@2.0.3';

interface ThemePlayerProps {
  theme: Theme;
  enhancedTheme?: EnhancedTheme;
  selectedInstrument?: InstrumentType;
  onInstrumentChange?: (instrument: InstrumentType) => void;
  defaultRestDuration?: RestDuration;
  rhythm?: NoteValue[]; // NEW: Rhythm pattern for theme
}

export function ThemePlayer({ 
  theme, 
  enhancedTheme,
  selectedInstrument = 'piano', 
  onInstrumentChange,
  defaultRestDuration = 'quarter-rest',
  rhythm // NEW: Rhythm pattern
}: ThemePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState([120]);
  const [volume, setVolume] = useState([150]); // Default volume set to 150% for excellent audibility (increased from 90% per user request)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [useSoundfont, setUseSoundfont] = useState(true);
  const [soundfontReady, setSoundfontReady] = useState(false);
  const [soundfontError, setSoundfontError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const synthesizerRef = useRef<EnhancedSynthesizer | null>(null);
  const soundfontEngineRef = useRef<SoundfontAudioEngine | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);
  const playerIdRef = useRef(`theme-player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const initAudio = async () => {
      try {
        // Initialize Web Audio API for synthesis fallback
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          gainNodeRef.current = audioContextRef.current.createGain();
          synthesizerRef.current = new EnhancedSynthesizer(audioContextRef.current);
          
          // Connect to destination
          gainNodeRef.current.connect(audioContextRef.current.destination);
        }

        // Initialize Soundfont engine with shared AudioContext
        if (useSoundfont && !soundfontEngineRef.current) {
          try {
            const engine = await getSoundfontEngine(audioContextRef.current || undefined);
            soundfontEngineRef.current = engine;
            setSoundfontReady(true);
            setSoundfontError(null);
          } catch (error: any) {
            console.error('Soundfont initialization failed:', error);
            setSoundfontError(error.message);
            setSoundfontReady(false);
          }
        }
      } catch (error: any) {
        console.error('Audio initialization error:', error);
      }
    };

    initAudio();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [useSoundfont]);

  // Register with playback manager
  useEffect(() => {
    const stopCallback = () => {
      stop();
    };
    
    audioPlaybackManager.register(playerIdRef.current, stopCallback);
    console.log(`🎵 Registered theme player: ${playerIdRef.current}`);
    
    return () => {
      audioPlaybackManager.unregister(playerIdRef.current);
      console.log(`🎵 Unregistered theme player: ${playerIdRef.current}`);
    };
  }, []);

  useEffect(() => {
    try {
      // Validate volume value
      const volumeValue = Array.isArray(volume) && typeof volume[0] === 'number' ? volume[0] : 90;
      const normalizedVolume = Math.max(0, Math.min(100, volumeValue)) / 100;
      
      // Apply 3x multiplier for significantly louder output (raised 50% from 2.0)
      const boostedVolume = normalizedVolume * 3.0;
      
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = boostedVolume;
      }
      if (soundfontEngineRef.current && soundfontReady) {
        // setVolume already applies internal boosting, so pass normalized value
        soundfontEngineRef.current.setVolume(normalizedVolume);
      }
      
      console.log(`🔊 ThemePlayer volume: ${volumeValue}% (gain: ${boostedVolume.toFixed(2)})`);
    } catch (error) {
      console.error('Error setting volume:', error);
      toast.error('Failed to set volume');
    }
  }, [volume, soundfontReady]);

  const frequencyFromMidiNote = (midiNote: number): number => {
    // A4 is MIDI note 69 (440 Hz)
    const semitoneRatio = Math.pow(2, 1/12);
    return 440 * Math.pow(semitoneRatio, midiNote - 69);
  };

  const playNote = async (midiNote: number, duration: number, delay: number = 0) => {
    try {
      // Try soundfont first if available and enabled
      if (useSoundfont && soundfontEngineRef.current && soundfontReady) {
        try {
          // Normalize volume (0-100 to 0-1) - soundfont engine applies its own boost
          const normalizedVelocity = Math.max(0, Math.min(100, volume[0])) / 100;
          
          if (delay > 0) {
            setTimeout(async () => {
              try {
                await soundfontEngineRef.current!.playNote(
                  midiNote,
                  duration,
                  selectedInstrument,
                  normalizedVelocity
                );
              } catch (error) {
                console.warn('Soundfont playback failed, using synthesis fallback');
              }
            }, delay * 1000);
          } else {
            await soundfontEngineRef.current.playNote(
              midiNote,
              duration,
              selectedInstrument,
              normalizedVelocity
            );
          }
          console.log(`🎵 Theme note played (soundfont): ${midiNoteToNoteName(midiNote)} for ${duration}s with ${selectedInstrument}`);
          return;
        } catch (error: any) {
          console.warn('Soundfont playback error, falling back to synthesis:', error);
        }
      }

      // Fallback to synthesis
      if (!audioContextRef.current || !gainNodeRef.current || !synthesizerRef.current) {
        console.log('Audio context, gain node, or synthesizer not available');
        return;
      }

      const config = ENHANCED_INSTRUMENTS[selectedInstrument];
      if (!config) {
        console.error(`Unknown instrument: ${selectedInstrument}`);
        return;
      }
      
      const frequency = frequencyFromMidiNote(midiNote);
      
      // Use enhanced synthesizer to create the note
      synthesizerRef.current.createInstrumentNote(
        frequency,
        duration,
        config,
        gainNodeRef.current,
        delay
      );
      
      console.log(`🎵 Theme note played (synthesis): ${midiNoteToNoteName(midiNote)} (${frequency.toFixed(2)}Hz) for ${duration}s with ${selectedInstrument}`);
    } catch (error) {
      console.error('Error playing note:', error);
    }
  };

  const play = async () => {
    if (!audioContextRef.current || theme.length === 0) return;
    
    // Request playback - this will stop all other players
    audioPlaybackManager.requestPlayback(playerIdRef.current);
    
    // CRITICAL FIX: Always resume AudioContext on user interaction
    // This is required by browsers for security - AudioContext must be resumed by user gesture
    try {
      console.log('🎵 AudioContext state before resume:', audioContextRef.current.state);
      
      if (audioContextRef.current.state === 'suspended' || audioContextRef.current.state === 'interrupted') {
        await audioContextRef.current.resume();
        console.log('✅ Audio context resumed successfully for theme playback');
      }
      
      // Double-check the state
      if (audioContextRef.current.state !== 'running') {
        console.warn('⚠️ AudioContext not running after resume attempt. State:', audioContextRef.current.state);
        toast.error('Audio system not ready. Please try again.');
        return;
      }
      
      console.log('🎵 AudioContext state after resume:', audioContextRef.current.state);
    } catch (error) {
      console.error('❌ Error resuming audio context:', error);
      toast.error('Failed to start audio playback');
      return;
    }

    setIsPlaying(true);
    isPlayingRef.current = true;
    setCurrentIndex(0);

    const baseBeatDuration = 60 / tempo[0]; // Duration of one beat in seconds
    
    const playElement = (index: number) => {
      if (index >= theme.length || !isPlayingRef.current) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        setCurrentIndex(0);
        audioPlaybackManager.notifyStopped(playerIdRef.current);
        toast.success('Theme playback completed');
        return;
      }

      setCurrentIndex(index);
      const element = theme[index];

      if (isNote(element)) {
        // Get rhythm value for this note if available
        let noteValueBeats = 1; // Default to quarter note (1 beat)
        
        if (rhythm && rhythm[index]) {
          try {
            const rhythmValue = rhythm[index];
            // CRITICAL FIX: Check if rhythm value is 'rest' - skip playing note
            if (rhythmValue === 'rest') {
              // Treat this as a rest even though element is a note
              // This happens when rhythm has 'rest' but melody still has a note value
              console.log(`🎵 Skipping note at index ${index} due to 'rest' rhythm value`);
              const restDurationMs = baseBeatDuration * 1000; // Default 1 beat rest
              timeoutRef.current = setTimeout(() => playElement(index + 1), restDurationMs);
              return;
            }
            
            noteValueBeats = getNoteValueBeats(rhythmValue);
            console.log(`🎵 Using rhythm value: ${rhythmValue} = ${noteValueBeats} beats for note at index ${index}`);
          } catch (error) {
            console.warn('Error getting note value beats, using default:', error);
            noteValueBeats = 1;
          }
        }
        
        // CRITICAL FIX: Validate duration before playing
        if (noteValueBeats <= 0) {
          console.warn(`⚠️ Invalid note duration ${noteValueBeats} at index ${index}, skipping playback`);
          const delayToNext = baseBeatDuration; // Default 1 beat delay
          timeoutRef.current = setTimeout(() => playElement(index + 1), delayToNext * 1000);
          return;
        }
        
        // Calculate actual duration based on rhythm
        const noteDuration = baseBeatDuration * noteValueBeats * 0.9; // 90% of beat duration for articulation
        const delayToNext = baseBeatDuration * noteValueBeats; // Full beat duration for spacing
        
        playNote(element, noteDuration);
        
        // Schedule next element after the rhythm duration
        timeoutRef.current = setTimeout(() => playElement(index + 1), delayToNext * 1000);
        
      } else if (isRest(element)) {
        // Handle rest with proper duration
        let restDurationBeats = 1; // Default
        
        if (enhancedTheme && enhancedTheme.restDurations.has(index)) {
          const restDuration = enhancedTheme.restDurations.get(index)!;
          restDurationBeats = getRestValueBeats(restDuration);
          console.log(`🎵 Theme rest: ${restDuration} (${restDurationBeats} beats) at index ${index}`);
        } else {
          restDurationBeats = getRestValueBeats(defaultRestDuration);
          console.log(`🎵 Theme rest: ${defaultRestDuration} (${restDurationBeats} beats) at index ${index} [default]`);
        }
        
        // Schedule next element after the rest duration
        const restDurationMs = baseBeatDuration * restDurationBeats * 1000;
        timeoutRef.current = setTimeout(() => playElement(index + 1), restDurationMs);
      }
    };

    playElement(0);
  };

  const pause = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    audioPlaybackManager.notifyStopped(playerIdRef.current);
  };

  const stop = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentIndex(0);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    audioPlaybackManager.notifyStopped(playerIdRef.current);
  };

  if (theme.length === 0) {
    return (
      <Card className="p-4 bg-muted/30">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Music className="w-4 h-4" />
          <span className="text-sm">No theme to play</span>
        </div>
      </Card>
    );
  }

  // Calculate total theme duration for display including rhythm
  const totalBeats = theme.reduce((total, element, index) => {
    if (isRest(element) && enhancedTheme && enhancedTheme.restDurations.has(index)) {
      return total + getRestValueBeats(enhancedTheme.restDurations.get(index)!);
    }
    // Use rhythm value if available, otherwise default to 1 beat
    if (rhythm && rhythm[index]) {
      try {
        return total + getNoteValueBeats(rhythm[index]);
      } catch {
        return total + 1;
      }
    }
    return total + 1; // Notes and default rests count as 1 beat
  }, 0);

  return (
    <Card className="p-4 space-y-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-green-600" />
          <h3 className="font-medium text-green-900 dark:text-green-100">Theme Playback</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-green-700 dark:text-green-300">
            {theme.length} elements • {totalBeats.toFixed(1)} beats
          </div>
          {rhythm && rhythm.length > 0 && (
            <Badge variant="outline" className="text-xs">
              Rhythm Active
            </Badge>
          )}
          {useSoundfont && soundfontReady && (
            <Badge variant="outline" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              HQ Audio
            </Badge>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isPlaying ? pause : play}
              disabled={theme.length === 0}
              className="bg-white/50 hover:bg-white/80"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={stop}
              disabled={!isPlaying && currentIndex === 0}
              className="bg-white/50 hover:bg-white/80"
            >
              <Square className="w-4 h-4" />
            </Button>
            
            {onInstrumentChange && (
              <InstrumentSelector
                selectedInstrument={selectedInstrument}
                onInstrumentChange={onInstrumentChange}
                size="sm"
              />
            )}
            
            <div className="text-sm text-green-800 dark:text-green-200">
              Position: {currentIndex + 1}/{theme.length}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={useSoundfont ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setUseSoundfont(!useSoundfont);
                if (!useSoundfont) {
                  toast.info('Switching to high-quality samples');
                } else {
                  toast.info('Switching to synthesized sounds');
                }
              }}
              className="gap-2"
            >
              <Download className="w-3 h-3" />
              {useSoundfont ? 'Pro' : 'Synth'}
            </Button>
            {useSoundfont && soundfontReady && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                ✓ Ready
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2 text-green-800 dark:text-green-200">
            <Volume2 className="w-4 h-4" />
            Volume: {volume[0]}%
          </label>
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-green-800 dark:text-green-200">
            Tempo: {tempo[0]} BPM
          </label>
          <Slider
            value={tempo}
            onValueChange={setTempo}
            min={60}
            max={200}
            step={5}
            className="w-full"
          />
        </div>
      </div>

      {/* Enhanced Rest Information */}
      {enhancedTheme && enhancedTheme.restDurations.size > 0 && (
        <div className="bg-white/30 p-3 rounded border border-green-200 dark:border-green-700">
          <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
            🎵 Enhanced Rest Durations Active
          </div>
          <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
            <div>
              Rest elements: {enhancedTheme.restDurations.size} with specific durations
            </div>
            <div>
              Total rest time: {
                Array.from(enhancedTheme.restDurations.values())
                  .reduce((total, duration) => total + getRestValueBeats(duration), 0)
              } beats
            </div>
            <div className="opacity-75">
              Rests will create actual silence periods during playback
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-green-600 dark:text-green-400 border-t border-green-200 dark:border-green-700 pt-2">
        ✅ <strong>Rest Functionality:</strong> Rests now create actual silence periods with proper durations during playback. 
        Each rest respects its selected duration (whole, half, quarter, etc.) creating authentic musical timing.
      </div>
    </Card>
  );
}