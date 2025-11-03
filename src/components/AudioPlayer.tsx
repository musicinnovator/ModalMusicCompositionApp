import { useState, useRef, useEffect } from 'react';
import { Melody, Part, isRest, isNote, RestDuration, getRestValueBeats, rhythmToNoteValues } from '../types/musical';
import { EnhancedTheme, getRestDurationBeats } from './ThemeComposer';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { Play, Pause, Square, Volume2, VolumeX, Download } from 'lucide-react';
import { InstrumentSelector } from './InstrumentSelector';
import { InstrumentType } from '../lib/enhanced-synthesis';
import { EffectsControlsEnhanced } from './EffectsControlsEnhanced';
import { AudioEffectsEngine, EffectsSettings, DEFAULT_EFFECTS } from '../lib/audio-effects-engine';
import { EnhancedSynthesizer, ENHANCED_INSTRUMENTS } from '../lib/enhanced-synthesis';
import { getSoundfontEngine, SoundfontAudioEngine } from '../lib/soundfont-audio-engine';
import { audioPlaybackManager } from '../lib/audio-playback-manager';
import { createPlaybackController, PlaybackPart } from '../lib/unified-playback';
import { toast } from 'sonner@2.0.3';
import { Badge } from './ui/badge';

interface AudioPlayerProps {
  parts: Part[];
  title: string;
  selectedInstrument?: InstrumentType;
  onInstrumentChange?: (instrument: InstrumentType) => void;
  partInstruments?: InstrumentType[];
  onPartInstrumentChange?: (partIndex: number, instrument: InstrumentType) => void;
  partMuted?: boolean[];
  onPartMuteToggle?: (partIndex: number) => void;
  // Enhanced rest support
  enhancedTheme?: EnhancedTheme;
  defaultRestDuration?: RestDuration;
  // Unique identifier for this player instance
  playerId?: string;
}

export function AudioPlayer({ 
  parts, 
  title, 
  selectedInstrument = 'piano', 
  onInstrumentChange,
  partInstruments,
  onPartInstrumentChange,
  partMuted,
  onPartMuteToggle,
  enhancedTheme,
  defaultRestDuration = 'quarter-rest',
  playerId
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState([120]);
  const [volume, setVolume] = useState([150]); // Default volume set to 150% for excellent audibility (increased from 90% per user request)
  const [currentBeat, setCurrentBeat] = useState(0);
  const [effectsSettings, setEffectsSettings] = useState<EffectsSettings>(DEFAULT_EFFECTS);
  const [useSoundfont, setUseSoundfont] = useState(true); // Toggle between soundfont and synthesis
  const [soundfontReady, setSoundfontReady] = useState(false);
  const [soundfontError, setSoundfontError] = useState<string | null>(null);
  const [isLoadingInstrument, setIsLoadingInstrument] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // For audio-reactive effects
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const effectsEngineRef = useRef<AudioEffectsEngine | null>(null);
  const synthesizerRef = useRef<EnhancedSynthesizer | null>(null);
  const soundfontEngineRef = useRef<SoundfontAudioEngine | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);
  
  // Generate unique player ID if not provided
  const playerIdRef = useRef(playerId || `audio-player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  // Unified playback controller for consistent playback across app
  const playbackControllerRef = useRef(createPlaybackController());

  // Initialize audio engines
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Initialize Web Audio API for synthesis fallback
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          gainNodeRef.current = audioContextRef.current.createGain();
          
          // Initialize effects engine and synthesizer
          effectsEngineRef.current = new AudioEffectsEngine(audioContextRef.current);
          synthesizerRef.current = new EnhancedSynthesizer(audioContextRef.current);
          
          // Connect: gain -> effects -> destination
          gainNodeRef.current.connect(effectsEngineRef.current.getInputNode());
          effectsEngineRef.current.getOutputNode().connect(audioContextRef.current.destination);
        }

        // Initialize Soundfont engine with shared AudioContext AND effects destination
        if (useSoundfont && !soundfontEngineRef.current) {
          try {
            console.log('🎵 Initializing Soundfont engine with shared AudioContext and effects routing...');
            // CRITICAL FIX: Pass BOTH the shared AudioContext AND the effects input node together
            // This ensures they're created from the same context and can be connected
            const effectsInput = effectsEngineRef.current?.getInputNode();
            const engine = await getSoundfontEngine(audioContextRef.current!, effectsInput);
            soundfontEngineRef.current = engine;
            
            setSoundfontReady(true);
            setSoundfontError(null);
            console.log('✅ Soundfont engine ready with effects routing');
            toast.success('High-quality audio ready!', { description: 'Using professional instrument samples' });
          } catch (error: any) {
            console.error('❌ Soundfont initialization failed:', error);
            setSoundfontError(error.message);
            setSoundfontReady(false);
            toast.error('Failed to load high-quality audio', { 
              description: 'Falling back to synthesized sounds'
            });
          }
        }
      } catch (error: any) {
        console.error('Audio initialization error:', error);
        toast.error('Audio system error', { description: error.message });
      }
    };

    initAudio();

    // Listen for instrument test events
    const handleTestInstrument = (event: CustomEvent) => {
      testInstrumentSound(event.detail);
    };

    window.addEventListener('testInstrument', handleTestInstrument as EventListener);

    return () => {
      // Stop unified playback controller
      if (playbackControllerRef.current) {
        playbackControllerRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (effectsEngineRef.current) {
        effectsEngineRef.current.dispose();
      }
      window.removeEventListener('testInstrument', handleTestInstrument as EventListener);
    };
  }, [useSoundfont]);

  // Register with playback manager
  useEffect(() => {
    const stopCallback = () => {
      stop();
    };
    
    audioPlaybackManager.register(playerIdRef.current, stopCallback);
    console.log(`🎵 Registered player: ${playerIdRef.current} (${title})`);
    
    return () => {
      audioPlaybackManager.unregister(playerIdRef.current);
      console.log(`🎵 Unregistered player: ${playerIdRef.current} (${title})`);
    };
  }, [title]);

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
      
      console.log(`🔊 AudioPlayer volume: ${volumeValue}% (gain: ${boostedVolume.toFixed(2)})`);
    } catch (error) {
      console.error('Error setting volume:', error);
      toast.error('Failed to set volume');
    }
  }, [volume, soundfontReady]);

  const frequencyFromPitch = (midiNote: number): number => {
    // Convert MIDI note to frequency using equal temperament
    // MIDI notes are already in the correct octave (0-127)
    // A4 is MIDI note 69 (440 Hz)
    const semitoneRatio = Math.pow(2, 1/12);
    return 440 * Math.pow(semitoneRatio, midiNote - 69);
  };

  const playNote = async (frequency: number, duration: number, delay: number = 0, instrument: InstrumentType = selectedInstrument, midiNote?: number) => {
    try {
      // Try soundfont first if available and enabled
      if (useSoundfont && soundfontEngineRef.current && soundfontReady && midiNote !== undefined) {
        try {
          // Normalize volume (0-100 to 0-1) - soundfont engine applies its own boost
          const normalizedVelocity = Math.max(0, Math.min(100, volume[0])) / 100;
          
          // Small delay for scheduling
          if (delay > 0) {
            setTimeout(async () => {
              try {
                await soundfontEngineRef.current!.playNote(
                  midiNote,
                  duration,
                  instrument,
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
              instrument,
              normalizedVelocity
            );
          }
          return; // Success - exit early
        } catch (error: any) {
          console.warn('Soundfont playback error, falling back to synthesis:', error);
          // Fall through to synthesis
        }
      }

      // Fallback to synthesis
      if (!audioContextRef.current || !gainNodeRef.current || !synthesizerRef.current) {
        console.log('Audio context, gain node, or synthesizer not available');
        return;
      }

      const config = ENHANCED_INSTRUMENTS[instrument];
      if (!config) {
        console.error(`Unknown instrument: ${instrument}`);
        return;
      }
      
      // Use enhanced synthesizer to create the note
      synthesizerRef.current.createInstrumentNote(
        frequency,
        duration,
        config,
        gainNodeRef.current,
        delay
      );
      
    } catch (error) {
      console.error('Error playing note:', error);
    }
  };

  const testInstrumentSound = async (instrument: InstrumentType) => {
    if (!audioContextRef.current) return;
    
    try {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      // Play a test C4 note (MIDI 60) with the selected instrument
      await playNote(261.63, 1.5, 0, instrument, 60);
    } catch (error) {
      console.error('Error testing instrument:', error);
    }
  };

  const handleEffectsChange = (newSettings: Partial<EffectsSettings>) => {
    const updatedSettings = { ...effectsSettings, ...newSettings };
    setEffectsSettings(updatedSettings);
    
    if (effectsEngineRef.current) {
      effectsEngineRef.current.updateSettings(newSettings);
    }
  };

  const resetEffects = () => {
    setEffectsSettings(DEFAULT_EFFECTS);
    if (effectsEngineRef.current) {
      effectsEngineRef.current.updateSettings(DEFAULT_EFFECTS);
    }
  };

  const play = async () => {
    try {
      console.log('🎵 [AudioPlayer] Starting playback using unified system');
      
      // Request playback - this will stop all other players
      audioPlaybackManager.requestPlayback(playerIdRef.current);
      
      // Validate parts array
      if (!parts || parts.length === 0) {
        console.error('No parts to play');
        toast.error('No parts to play');
        return;
      }

      // Convert parts to PlaybackPart format for unified playback
      const playbackParts: PlaybackPart[] = parts.map((part, index) => {
        // RHYTHM PRECISION FIX: Use part.noteValues directly if available (high precision)
        // Only fall back to converting rhythm array if noteValues not provided
        let noteValues = part.noteValues; // Use existing noteValues if present
        
        if (!noteValues && part.rhythm && part.rhythm.length > 0) {
          // Fallback: Try to extract NoteValue[] from rhythm array (less precise)
          try {
            noteValues = rhythmToNoteValues(part.rhythm);
            console.log(`  Converted part ${index} rhythm to NoteValue[] format:`, noteValues.length, 'values');
          } catch (error) {
            console.warn(`  Failed to convert part ${index} rhythm, using rhythm array directly`, error);
          }
        } else if (noteValues) {
          console.log(`  Part ${index} using high-precision noteValues:`, noteValues.length, 'values');
        }
        
        // Get instrument for this part
        const partInstrument = partInstruments && partInstruments[index] 
          ? partInstruments[index] 
          : selectedInstrument;
        
        // Check if part is muted
        const isMuted = partMuted && index < partMuted.length && partMuted[index];
        
        return {
          melody: part.melody,
          rhythm: part.rhythm,
          noteValues: noteValues,  // Use high-precision noteValues when available
          instrument: partInstrument,
          volume: volume[0] / 100, // Convert 0-200 to 0-2
          muted: isMuted || false
        };
      });

      console.log(`  Created ${playbackParts.length} playback parts at tempo ${tempo[0]}`);
      
      setIsPlaying(true);
      isPlayingRef.current = true;
      setCurrentBeat(0);

      // Use unified playback controller
      const controller = playbackControllerRef.current;
      
      await controller.play(playbackParts, tempo[0], {
        onProgress: (time, duration) => {
          // Update current beat based on time
          const secondsPerBeat = 60 / tempo[0];
          const beat = time / secondsPerBeat;
          setCurrentBeat(beat);
          
          // Simulate audio level for visual feedback
          setAudioLevel(0.6 + Math.random() * 0.4);
          setTimeout(() => setAudioLevel(0), 100);
        },
        onComplete: () => {
          console.log('🎵 [AudioPlayer] Playback completed');
          setIsPlaying(false);
          isPlayingRef.current = false;
          setCurrentBeat(0);
          setAudioLevel(0);
          audioPlaybackManager.notifyStopped(playerIdRef.current);
          toast.success('Playback completed');
        }
      });

      console.log('✅ [AudioPlayer] Playback started successfully');
    } catch (error: any) {
      console.error('❌ [AudioPlayer] Playback error:', error);
      setIsPlaying(false);
      isPlayingRef.current = false;
      setCurrentBeat(0);
      setAudioLevel(0);
      audioPlaybackManager.notifyStopped(playerIdRef.current);
      toast.error('Playback failed: ' + error.message);
    }
  };

  const pause = () => {
    console.log('⏸️ [AudioPlayer] Pausing playback');
    playbackControllerRef.current.pause();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setAudioLevel(0); // Reset audio level
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Notify manager that playback paused
    audioPlaybackManager.notifyStopped(playerIdRef.current);
  };

  const stop = () => {
    console.log('⏹️ [AudioPlayer] Stopping playback');
    playbackControllerRef.current.stop();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentBeat(0);
    setAudioLevel(0); // Reset audio level
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Notify manager that playback stopped
    audioPlaybackManager.notifyStopped(playerIdRef.current);
  };

  if (parts.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="mb-4">{title}</h3>
        <div className="text-muted-foreground">No parts to play</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <h3>{title}</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isPlaying ? pause : play}
              disabled={parts.length === 0}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={stop}
              disabled={!isPlaying && currentBeat === 0}
            >
              <Square className="w-4 h-4" />
            </Button>
            
            {onInstrumentChange && (
              <InstrumentSelector
                selectedInstrument={selectedInstrument}
                onInstrumentChange={onInstrumentChange}
              />
            )}
            
            <div className="text-sm text-muted-foreground">
              Beat: {currentBeat + 1}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={useSoundfont ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setUseSoundfont(!useSoundfont);
                if (!useSoundfont) {
                  toast.info('Switching to high-quality samples...', { description: 'Instruments will load on first use' });
                } else {
                  toast.info('Switching to synthesized sounds');
                }
              }}
              className="gap-2"
            >
              <Download className="w-3 h-3" />
              {useSoundfont ? 'Pro Audio' : 'Synthesized'}
            </Button>
            {useSoundfont && soundfontReady && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                ✓ Ready
              </Badge>
            )}
            {useSoundfont && !soundfontReady && soundfontError && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Error
              </Badge>
            )}
            {useSoundfont && isLoadingInstrument && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Loading...
              </Badge>
            )}
          </div>
        </div>

        {useSoundfont && soundfontError && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
            {soundfontError}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
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
          <label className="text-sm font-medium">
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

      <div className="text-xs text-muted-foreground">
        Parts: {parts.length} | 
        Max length: {(() => {
          try {
            const validParts = parts.filter(p => p?.rhythm?.length);
            return validParts.length > 0 ? Math.max(...validParts.map(p => p.rhythm.length)) : 0;
          } catch (error) {
            console.error('Error calculating max length:', error);
            return 0;
          }
        })()} beats
      </div>

      {/* Individual part instrument selectors */}
      {onPartInstrumentChange && partInstruments && parts.length > 1 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium">Individual Part Instruments</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {parts.map((part, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm font-medium min-w-16">
                    Part {index + 1}:
                  </span>
                  <InstrumentSelector
                    selectedInstrument={partInstruments[index] || selectedInstrument || 'piano'}
                    onInstrumentChange={(instrument) => onPartInstrumentChange(index, instrument)}
                    size="sm"
                  />
                  {onPartMuteToggle && partMuted && index < partMuted.length && (
                    <Button
                      variant={partMuted[index] ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => onPartMuteToggle(index)}
                      className="flex items-center gap-1 min-w-[70px]"
                    >
                      {partMuted[index] ? (
                        <>
                          <VolumeX className="w-3 h-3" />
                          Muted
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          On
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      <EffectsControlsEnhanced
        settings={effectsSettings}
        onSettingsChange={handleEffectsChange}
        onReset={resetEffects}
        audioLevel={audioLevel}
        tempo={tempo[0]}
        immersiveMode={true}
      />
    </Card>
  );
}