import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BachLikeVariables, BachVariableName } from '../types/musical';
import { InstrumentType } from '../lib/enhanced-synthesis';
import { SoundfontAudioEngine } from '../lib/soundfont-audio-engine';
import { MusicalEngine } from '../lib/musical-engine';
import { audioPlaybackManager } from '../lib/audio-playback-manager';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Play, Pause, Square, Volume2, Music2, VolumeX } from 'lucide-react';
import { InstrumentSelector } from './InstrumentSelector';
import { toast } from 'sonner@2.0.3';

interface BachVariablePlayerProps {
  variables: BachLikeVariables;
  onInstrumentChange?: (variableName: BachVariableName, instrument: InstrumentType) => void;
  onMuteToggle?: (variableName: BachVariableName) => void;
}

interface PlaybackState {
  isPlaying: boolean;
  currentBeat: number;
  totalBeats: number;
  tempo: number;
  volume: number;
  instrument: InstrumentType;
  muted: boolean;
  isInitializing: boolean;
  error: string | null;
}

const VARIABLE_LABELS: Record<BachVariableName, string> = {
  cantusFirmus: 'CF',
  floridCounterpoint1: 'FCP1',
  floridCounterpoint2: 'FCP2',
  cantusFirmusFragment1: 'CFF1',
  cantusFirmusFragment2: 'CFF2',
  floridCounterpointFrag1: 'FCPF1',
  floridCounterpointFrag2: 'FCPF2',
  countersubject1: 'CS1',
  countersubject2: 'CS2'
};

const VARIABLE_FULL_NAMES: Record<BachVariableName, string> = {
  cantusFirmus: 'Cantus Firmus',
  floridCounterpoint1: 'Florid Counterpoint 1',
  floridCounterpoint2: 'Florid Counterpoint 2',
  cantusFirmusFragment1: 'Cantus Firmus Fragment 1',
  cantusFirmusFragment2: 'Cantus Firmus Fragment 2',
  floridCounterpointFrag1: 'Florid Counterpoint Fragment 1',
  floridCounterpointFrag2: 'Florid Counterpoint Fragment 2',
  countersubject1: 'Countersubject 1',
  countersubject2: 'Countersubject 2'
};

const DEFAULT_INSTRUMENTS: Record<BachVariableName, InstrumentType> = {
  cantusFirmus: 'cello',
  floridCounterpoint1: 'violin',
  floridCounterpoint2: 'flute',
  cantusFirmusFragment1: 'cello',
  cantusFirmusFragment2: 'bass',
  floridCounterpointFrag1: 'violin',
  floridCounterpointFrag2: 'clarinet',
  countersubject1: 'oboe',
  countersubject2: 'bassoon'
};

const COLOR_SCHEMES: Record<BachVariableName, string> = {
  cantusFirmus: 'from-blue-500 to-blue-600',
  floridCounterpoint1: 'from-purple-500 to-purple-600',
  floridCounterpoint2: 'from-pink-500 to-pink-600',
  cantusFirmusFragment1: 'from-cyan-500 to-cyan-600',
  cantusFirmusFragment2: 'from-teal-500 to-teal-600',
  floridCounterpointFrag1: 'from-violet-500 to-violet-600',
  floridCounterpointFrag2: 'from-fuchsia-500 to-fuchsia-600',
  countersubject1: 'from-orange-500 to-orange-600',
  countersubject2: 'from-amber-500 to-amber-600'
};

export function BachVariablePlayer({ variables, onInstrumentChange, onMuteToggle }: BachVariablePlayerProps) {
  // Initialize playback states for each variable
  const [playbackStates, setPlaybackStates] = useState<Record<BachVariableName, PlaybackState>>(() => {
    const initialStates: Partial<Record<BachVariableName, PlaybackState>> = {};
    Object.entries(variables).forEach(([key, melody]) => {
      const variableName = key as BachVariableName;
      if (melody.length > 0) {
        initialStates[variableName] = {
          isPlaying: false,
          currentBeat: 0,
          totalBeats: melody.length,
          tempo: 120,
          volume: 1.5, // Default volume at 150% for excellent audibility (increased from 0.95 per user request)
          instrument: DEFAULT_INSTRUMENTS[variableName],
          muted: false,
          isInitializing: false,
          error: null
        };
      }
    });
    return initialStates as Record<BachVariableName, PlaybackState>;
  });

  const audioEnginesRef = useRef<Record<string, SoundfontAudioEngine>>({});
  const animationFramesRef = useRef<Record<string, number>>({});
  const playerIdsRef = useRef<Record<BachVariableName, string>>({});

  // Define stop handler for each variable
  const stopHandlers = useRef<Record<BachVariableName, () => void>>({} as Record<BachVariableName, () => void>);
  
  // Register with playback manager and cleanup on unmount
  useEffect(() => {
    // Create stop handlers for each variable
    Object.keys(variables).forEach(key => {
      const variableName = key as BachVariableName;
      stopHandlers.current[variableName] = () => {
        // Cancel animation frame/timeout
        if (animationFramesRef.current[variableName]) {
          clearTimeout(animationFramesRef.current[variableName]);
          delete animationFramesRef.current[variableName];
        }

        // Stop audio
        const audioEngine = audioEnginesRef.current[variableName];
        if (audioEngine) {
          audioEngine.stopAllNotes();
        }
        
        setPlaybackStates(prev => ({
          ...prev,
          [variableName]: { ...prev[variableName], isPlaying: false, currentBeat: 0 }
        }));
      };
    });
    
    // Register each variable's player
    Object.keys(variables).forEach(key => {
      const variableName = key as BachVariableName;
      if (variables[variableName].length > 0) {
        const playerId = `bach-${variableName}-${Date.now()}`;
        playerIdsRef.current[variableName] = playerId;
        
        audioPlaybackManager.register(playerId, stopHandlers.current[variableName]);
        console.log(`🎵 Registered Bach player: ${playerId} (${VARIABLE_FULL_NAMES[variableName]})`);
      }
    });
    
    return () => {
      // Unregister all players
      Object.entries(playerIdsRef.current).forEach(([variableName, playerId]) => {
        audioPlaybackManager.unregister(playerId);
        console.log(`🎵 Unregistered Bach player: ${playerId} (${VARIABLE_FULL_NAMES[variableName as BachVariableName]})`);
      });
      
      // Stop all playback
      Object.keys(animationFramesRef.current).forEach(key => {
        clearTimeout(animationFramesRef.current[key]);
      });
      
      // Cleanup all audio engines
      Object.values(audioEnginesRef.current).forEach(engine => {
        if (engine && engine.stopAllNotes) {
          engine.stopAllNotes();
        }
      });
    };
  }, [variables]);

  // Update playback states when variables change
  useEffect(() => {
    setPlaybackStates(prev => {
      const updated: Partial<Record<BachVariableName, PlaybackState>> = {};
      Object.entries(variables).forEach(([key, melody]) => {
        const variableName = key as BachVariableName;
        if (melody.length > 0) {
          updated[variableName] = prev[variableName] || {
            isPlaying: false,
            currentBeat: 0,
            totalBeats: melody.length,
            tempo: 120,
            volume: 0.95,
            instrument: DEFAULT_INSTRUMENTS[variableName],
            muted: false,
            isInitializing: false,
            error: null
          };
          // Update total beats if melody length changed
          if (prev[variableName]) {
            updated[variableName]!.totalBeats = melody.length;
          }
        }
      });
      return updated as Record<BachVariableName, PlaybackState>;
    });
  }, [variables]);

  const handlePlay = useCallback(async (variableName: BachVariableName) => {
    try {
      const melody = variables[variableName];
      const state = playbackStates[variableName];
      
      if (!melody || melody.length === 0 || !state) {
        toast.error(`${VARIABLE_FULL_NAMES[variableName]} has no notes`);
        return;
      }

      if (state.muted) {
        toast.warning(`${VARIABLE_FULL_NAMES[variableName]} is muted`);
        return;
      }

      // Request playback - this will stop all other players
      const playerId = playerIdsRef.current[variableName];
      if (playerId) {
        audioPlaybackManager.requestPlayback(playerId);
      }

      // Lazy initialization of audio engine if it doesn't exist
      if (!audioEnginesRef.current[variableName]) {
        console.log(`🎵 Initializing audio engine for ${variableName}...`);
        
        // Show initializing state
        setPlaybackStates(prev => ({
          ...prev,
          [variableName]: { ...prev[variableName], isInitializing: true, error: null }
        }));

        try {
          const engine = new SoundfontAudioEngine();
          await engine.initialize();
          audioEnginesRef.current[variableName] = engine;
          console.log(`✅ Audio engine initialized for ${variableName}`);
          
          // Clear initializing state
          setPlaybackStates(prev => ({
            ...prev,
            [variableName]: { ...prev[variableName], isInitializing: false }
          }));
        } catch (initError: any) {
          console.error(`❌ Failed to initialize audio engine for ${variableName}:`, initError);
          const errorMsg = initError.message || 'Failed to initialize audio';
          
          setPlaybackStates(prev => ({
            ...prev,
            [variableName]: { ...prev[variableName], isInitializing: false, error: errorMsg }
          }));
          
          toast.error(`Failed to initialize audio for ${VARIABLE_FULL_NAMES[variableName]}`, {
            description: errorMsg
          });
          return;
        }
      }

      const audioEngine = audioEnginesRef.current[variableName];
      if (!audioEngine) {
        const errorMsg = 'Audio engine not available';
        setPlaybackStates(prev => ({
          ...prev,
          [variableName]: { ...prev[variableName], error: errorMsg }
        }));
        toast.error(errorMsg);
        return;
      }

      // Check if engine is ready
      if (!audioEngine.isReady()) {
        const error = audioEngine.getError() || 'Audio engine not ready';
        console.error(`Audio engine not ready for ${variableName}:`, error);
        
        setPlaybackStates(prev => ({
          ...prev,
          [variableName]: { ...prev[variableName], error }
        }));
        
        toast.error(`Audio not ready for ${VARIABLE_FULL_NAMES[variableName]}`, {
          description: error
        });
        return;
      }

      // Stop any currently playing audio for this variable
      audioEngine.stopAllNotes();

      // Update state to playing
      setPlaybackStates(prev => ({
        ...prev,
        [variableName]: { ...prev[variableName], isPlaying: true, currentBeat: 0 }
      }));

      console.log(`🎵 Playing ${VARIABLE_FULL_NAMES[variableName]} with ${melody.length} notes`);

      // Play melody using the same pattern as AudioPlayer
      const beatDuration = 60 / state.tempo; // Duration of one beat in seconds
      let currentBeat = 0;
      let isPlaying = true;

      const playNextNote = async () => {
        if (!isPlaying || currentBeat >= melody.length) {
          // Playback finished
          setPlaybackStates(prev => ({
            ...prev,
            [variableName]: { ...prev[variableName], isPlaying: false, currentBeat: 0 }
          }));
          
          // Notify manager that playback finished
          const playerId = playerIdsRef.current[variableName];
          if (playerId) {
            audioPlaybackManager.notifyStopped(playerId);
          }
          
          console.log(`✅ Finished playing ${VARIABLE_FULL_NAMES[variableName]}`);
          return;
        }

        // Update current beat
        setPlaybackStates(prev => ({
          ...prev,
          [variableName]: { ...prev[variableName], currentBeat }
        }));

        // Play the note
        const midiNote = melody[currentBeat];
        try {
          await audioEngine.playNote(
            midiNote,
            beatDuration * 0.9, // Slightly shorter than beat duration for articulation
            state.instrument,
            state.volume
          );
        } catch (error) {
          console.error(`Error playing note ${midiNote}:`, error);
        }

        currentBeat++;

        // Schedule next note
        if (animationFramesRef.current[variableName]) {
          cancelAnimationFrame(animationFramesRef.current[variableName]);
        }
        
        animationFramesRef.current[variableName] = setTimeout(() => {
          playNextNote();
        }, beatDuration * 1000) as any;
      };

      // Start playback
      playNextNote();

    } catch (error) {
      console.error(`Error playing ${variableName}:`, error);
      toast.error(`Failed to play ${VARIABLE_FULL_NAMES[variableName]}`);
      setPlaybackStates(prev => ({
        ...prev,
        [variableName]: { ...prev[variableName], isPlaying: false }
      }));
    }
  }, [variables, playbackStates]);

  const handlePause = useCallback((variableName: BachVariableName) => {
    try {
      // Cancel animation frame/timeout
      if (animationFramesRef.current[variableName]) {
        clearTimeout(animationFramesRef.current[variableName]);
        delete animationFramesRef.current[variableName];
      }

      // Stop audio
      const audioEngine = audioEnginesRef.current[variableName];
      if (audioEngine) {
        audioEngine.stopAllNotes();
      }
      
      setPlaybackStates(prev => ({
        ...prev,
        [variableName]: { ...prev[variableName], isPlaying: false }
      }));
      
      // Notify manager that playback paused
      const playerId = playerIdsRef.current[variableName];
      if (playerId) {
        audioPlaybackManager.notifyStopped(playerId);
      }
      
      console.log(`⏸️ Paused ${VARIABLE_FULL_NAMES[variableName]}`);
    } catch (error) {
      console.error(`Error pausing ${variableName}:`, error);
    }
  }, []);

  const handleStop = useCallback((variableName: BachVariableName) => {
    try {
      // Cancel animation frame/timeout
      if (animationFramesRef.current[variableName]) {
        clearTimeout(animationFramesRef.current[variableName]);
        delete animationFramesRef.current[variableName];
      }

      // Stop audio
      const audioEngine = audioEnginesRef.current[variableName];
      if (audioEngine) {
        audioEngine.stopAllNotes();
      }
      
      setPlaybackStates(prev => ({
        ...prev,
        [variableName]: { ...prev[variableName], isPlaying: false, currentBeat: 0 }
      }));
      
      // Notify manager that playback stopped
      const playerId = playerIdsRef.current[variableName];
      if (playerId) {
        audioPlaybackManager.notifyStopped(playerId);
      }
      
      console.log(`⏹️ Stopped ${VARIABLE_FULL_NAMES[variableName]}`);
    } catch (error) {
      console.error(`Error stopping ${variableName}:`, error);
    }
  }, []);

  const handleVolumeChange = useCallback((variableName: BachVariableName, value: number[]) => {
    const volume = value[0];
    setPlaybackStates(prev => ({
      ...prev,
      [variableName]: { ...prev[variableName], volume }
    }));
    
    // Only set volume if engine is already initialized
    const audioEngine = audioEnginesRef.current[variableName];
    if (audioEngine && audioEngine.isReady()) {
      audioEngine.setVolume(volume);
    }
  }, []);

  const handleTempoChange = useCallback((variableName: BachVariableName, value: number[]) => {
    const tempo = value[0];
    setPlaybackStates(prev => ({
      ...prev,
      [variableName]: { ...prev[variableName], tempo }
    }));
  }, []);

  const handleInstrumentChange = useCallback((variableName: BachVariableName, instrument: InstrumentType) => {
    setPlaybackStates(prev => ({
      ...prev,
      [variableName]: { ...prev[variableName], instrument }
    }));
    
    if (onInstrumentChange) {
      onInstrumentChange(variableName, instrument);
    }
  }, [onInstrumentChange]);

  const handleMuteToggle = useCallback((variableName: BachVariableName) => {
    setPlaybackStates(prev => ({
      ...prev,
      [variableName]: { ...prev[variableName], muted: !prev[variableName].muted }
    }));
    
    if (onMuteToggle) {
      onMuteToggle(variableName);
    }
  }, [onMuteToggle]);

  // Filter variables that have notes with error handling
  const variablesWithNotes = useMemo(() => {
    try {
      return Object.entries(variables)
        .filter(([_, melody]) => Array.isArray(melody) && melody.length > 0)
        .map(([key]) => key as BachVariableName);
    } catch (error) {
      console.error('Error filtering Bach variables:', error);
      return [];
    }
  }, [variables]);

  if (variablesWithNotes.length === 0) {
    return (
      <Card className="p-6 bg-muted/30">
        <div className="text-center text-muted-foreground">
          <Music2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No Bach Variables with notes to play</p>
          <p className="text-xs mt-1">Add notes to Bach Variables in the Theme Composer</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-background via-background to-muted/10 w-full overflow-visible">
      <div className="space-y-6 w-full">
        <div className="flex items-center gap-2">
          <Music2 className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold">Bach Variables Playback</h3>
          <Badge variant="outline" className="text-xs">
            {variablesWithNotes.length} {variablesWithNotes.length === 1 ? 'variable' : 'variables'}
          </Badge>
        </div>

        {/* Grid container with proper spacing and overflow handling */}
        {/* Single column on mobile/tablet, 2 columns on XL screens for better visibility */}
        {/* Each card is isolated with proper spacing to prevent overlapping */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 auto-rows-max items-start w-full overflow-visible">
        {variablesWithNotes.map((variableName) => {
          try {
            const melody = variables[variableName];
            
            // Safety check: ensure melody exists and has notes
            if (!melody || !Array.isArray(melody) || melody.length === 0) {
              console.warn(`Skipping ${variableName}: invalid melody`);
              return null;
            }
            
            // Get or create playback state (defensive programming)
            const state = playbackStates[variableName] || {
              isPlaying: false,
              currentBeat: 0,
              totalBeats: melody.length,
              tempo: 120,
              volume: 0.95,
              instrument: DEFAULT_INSTRUMENTS[variableName],
              muted: false,
              isInitializing: false,
              error: null
            };

            return (
              <Card 
                key={variableName} 
                className="p-4 space-y-3 bg-gradient-to-br from-background via-background to-muted/20 border-2 flex flex-col w-full max-w-full"
                style={{ 
                  minHeight: 'fit-content',
                  position: 'relative',
                  isolation: 'isolate',
                  contain: 'layout'
                }}
              >
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className={`w-8 h-8 bg-gradient-to-br ${COLOR_SCHEMES[variableName]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xs font-bold text-white">
                      {VARIABLE_LABELS[variableName]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm truncate">{VARIABLE_FULL_NAMES[variableName]}</h4>
                    <p className="text-xs text-muted-foreground">
                      {melody.length} {melody.length === 1 ? 'note' : 'notes'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {state.isInitializing ? (
                    <Badge variant="outline" className="text-xs animate-pulse">
                      Initializing...
                    </Badge>
                  ) : state.error ? (
                    <Badge variant="destructive" className="text-xs">
                      Error
                    </Badge>
                  ) : (
                    <Badge variant={state.isPlaying ? 'default' : 'secondary'} className="text-xs">
                      {state.isPlaying ? 'Playing' : 'Ready'}
                    </Badge>
                  )}
                  {state.muted && (
                    <Badge variant="outline" className="text-xs">
                      Muted
                    </Badge>
                  )}
                </div>
              </div>

              {/* Playback Position */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Position: {state.currentBeat}/{state.totalBeats}</span>
                  <span>{Math.round((state.currentBeat / state.totalBeats) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${COLOR_SCHEMES[variableName]} transition-all duration-300`}
                    style={{ width: `${(state.currentBeat / state.totalBeats) * 100}%` }}
                  />
                </div>
              </div>

              {/* Error Display */}
              {state.error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2">
                  <p className="text-xs text-destructive">{state.error}</p>
                </div>
              )}

              {/* Playback Controls */}
              <div className="flex items-stretch gap-2">
                {!state.isPlaying ? (
                  <Button
                    size="sm"
                    onClick={() => handlePlay(variableName)}
                    className="flex-1 gap-1 min-w-0"
                    disabled={state.isInitializing || !!state.error}
                  >
                    <Play className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{state.isInitializing ? 'Loading...' : 'Play'}</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handlePause(variableName)}
                    className="flex-1 gap-1 min-w-0"
                    variant="secondary"
                  >
                    <Pause className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">Pause</span>
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => handleStop(variableName)}
                  variant="outline"
                  disabled={!state.isPlaying && state.currentBeat === 0}
                  className="gap-1 flex-shrink-0"
                >
                  <Square className="w-3 h-3" />
                  <span className="hidden sm:inline">Stop</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleMuteToggle(variableName)}
                  variant={state.muted ? 'destructive' : 'outline'}
                  className="gap-1 flex-shrink-0"
                >
                  {state.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </Button>
              </div>

              {/* Instrument Selection */}
              <div className="space-y-2 w-full">
                <Label className="text-xs">Instrument</Label>
                <div className="w-full">
                  <InstrumentSelector
                    selectedInstrument={state.instrument}
                    onInstrumentChange={(instrument) => handleInstrumentChange(variableName, instrument)}
                  />
                </div>
              </div>

              {/* Volume Control */}
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs flex-shrink-0">Volume</Label>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(state.volume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[state.volume]}
                  onValueChange={(value) => handleVolumeChange(variableName, value)}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </div>

              {/* Tempo Control */}
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs flex-shrink-0">Tempo</Label>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {state.tempo} BPM
                  </span>
                </div>
                <Slider
                  value={[state.tempo]}
                  onValueChange={(value) => handleTempoChange(variableName, value)}
                  min={40}
                  max={240}
                  step={1}
                  className="w-full"
                />
              </div>
              </Card>
            );
          } catch (error) {
            console.error(`Error rendering ${variableName}:`, error);
            return (
              <Card key={variableName} className="p-4 bg-destructive/10 border-destructive">
                <div className="text-sm text-destructive">
                  Error rendering {VARIABLE_FULL_NAMES[variableName]}
                </div>
              </Card>
            );
          }
        })}
        </div>
      </div>
    </Card>
  );
}