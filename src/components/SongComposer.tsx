import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Song, SongTrack, AvailableComponent, Theme, Part, Melody, Rhythm, midiNoteToNoteName, PITCH_NAMES, isNote, isRest } from '../types/musical';
import { InstrumentType, ENHANCED_INSTRUMENTS } from '../lib/enhanced-synthesis';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Copy,
  Music,
  Layers,
  Clock,
  Zap,
  MoreHorizontal,
  Download,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface SongComposerProps {
  theme: Theme;
  generatedParts: Part[];
  generationType: 'imitation' | 'fugue' | null;
  generatedCounterpoints: Theme[];
  onExportSong: (song: Song) => void;
}

export function SongComposer({
  theme,
  generatedParts,
  generationType,
  generatedCounterpoints,
  onExportSong
}: SongComposerProps) {
  const [song, setSong] = useState<Song>(() => ({
    id: `song-${Date.now()}`,
    title: 'New Composition',
    composer: 'Anonymous',
    tempo: 120,
    timeSignature: '4/4',
    keySignature: null,
    mode: null,
    totalDuration: 32, // beats
    tracks: [],
    loopEnabled: false,
    loopStart: 0,
    loopEnd: 16,
    created: new Date().toISOString(),
    lastModified: new Date().toISOString()
  }));

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1.05); // Raised 50% from 0.7 for better audibility
  const [isMuted, setIsMuted] = useState(false);
  const [isDraggingTrack, setIsDraggingTrack] = useState(false);
  const [draggedTrackId, setDraggedTrackId] = useState<string | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [timelineZoom, setTimelineZoom] = useState(1.0);
  const [showAvailableComponents, setShowAvailableComponents] = useState(true);
  const [timelineHeight, setTimelineHeight] = useState(300); // Dynamic height
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false); // Timeline vertical expansion state
  const [isTimelineWidthExpanded, setIsTimelineWidthExpanded] = useState(false); // Timeline horizontal expansion state
  const [trackInstruments, setTrackInstruments] = useState<Record<string, InstrumentType>>({}); // Per-track instruments

  // Audio system state
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [audioError, setAudioError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const timelineRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const noteTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const isPlayingRef = useRef(false);
  const trackGainNodes = useRef<Map<string, GainNode>>(new Map());

  // Available components from current composition state
  const availableComponents = useMemo<AvailableComponent[]>(() => {
    const components: AvailableComponent[] = [];

    // Add theme if available
    if (theme.length > 0) {
      components.push({
        id: 'theme-main',
        name: 'Main Theme',
        type: 'theme',
        melody: theme,
        rhythm: theme.map(() => 1), // Quarter notes
        duration: theme.length,
        color: '#6366f1'
      });
    }

    // Add generated parts
    generatedParts.forEach((part, index) => {
      const partName = generationType === 'imitation' 
        ? (index === 0 ? 'Original Voice' : 'Imitation Voice')
        : `Fugue Voice ${index + 1}`;
      
      components.push({
        id: `part-${index}`,
        name: partName,
        type: 'part',
        melody: part.melody,
        rhythm: part.rhythm,
        duration: part.melody.length,
        color: ['#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'][index % 5]
      });
    });

    // Add counterpoint techniques
    generatedCounterpoints.forEach((counterpoint, index) => {
      components.push({
        id: `counterpoint-${index}`,
        name: `Counterpoint ${index + 1}`,
        type: 'counterpoint',
        melody: counterpoint,
        rhythm: counterpoint.map(() => 1), // Quarter notes
        duration: counterpoint.length,
        color: '#f97316'
      });
    });

    return components;
  }, [theme, generatedParts, generationType, generatedCounterpoints]);

  // Timeline calculations with unlimited horizontal expansion
  const beatsPerMeasure = 4; // 4/4 time
  const pixelsPerBeat = 40 * timelineZoom;
  
  // Calculate timeline width with true unlimited expansion when enabled
  const minTimelineWidth = Math.max(800, song.totalDuration * pixelsPerBeat);
  const paddingBeats = isTimelineWidthExpanded 
    ? Math.max(32, song.totalDuration * 0.5) // More padding when width-expanded
    : Math.max(16, song.totalDuration * 0.25); // Standard padding
  
  // When width-expanded, allow truly unlimited width - calculate based on furthest track end
  const furthestTrackEnd = song.tracks.length > 0 
    ? Math.max(...song.tracks.map(track => track.endTime), song.totalDuration)
    : song.totalDuration;
  
  const timelineWidth = isTimelineWidthExpanded
    ? Math.max(minTimelineWidth, (furthestTrackEnd + paddingBeats) * pixelsPerBeat, 1600) // Minimum 1600px when expanded
    : Math.max(minTimelineWidth, (song.totalDuration + paddingBeats) * pixelsPerBeat);
  
  // Dynamic total duration adjustment for unlimited expansion
  const dynamicTotalDuration = Math.max(song.totalDuration, timelineWidth / pixelsPerBeat);

  // Auto-expand timeline height based on track count
  const autoHeight = Math.max(200, song.tracks.length * 80 + 100);

  // Toggle timeline vertical expansion
  const toggleTimelineExpansion = useCallback(() => {
    setIsTimelineExpanded(prev => {
      const newExpanded = !prev;
      toast.info(newExpanded ? 'Timeline height expanded - unlimited vertical space' : 'Timeline height collapsed - scrollable view');
      return newExpanded;
    });
  }, []);

  // Toggle timeline horizontal expansion
  const toggleTimelineWidthExpansion = useCallback(() => {
    setIsTimelineWidthExpanded(prev => {
      const newExpanded = !prev;
      toast.info(newExpanded ? 'Timeline width expanded - unlimited horizontal space' : 'Timeline width standard - auto-sizing');
      return newExpanded;
    });
  }, []);

  // Add track to timeline
  const addTrackToTimeline = useCallback((component: AvailableComponent) => {
    const newTrack: SongTrack = {
      id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: component.name,
      type: component.type,
      startTime: song.tracks.length > 0 ? Math.max(...song.tracks.map(t => t.endTime)) : 0,
      endTime: song.tracks.length > 0 ? Math.max(...song.tracks.map(t => t.endTime)) + component.duration : component.duration,
      volume: 80, // 0-100 scale
      muted: false,
      solo: false,
      color: component.color,
      instrument: 'piano',
      melody: component.melody,
      rhythm: component.rhythm
    };

    setSong(prevSong => {
      const newTotalDuration = Math.max(prevSong.totalDuration, newTrack.endTime + 8); // Add some padding
      return {
        ...prevSong,
        tracks: [...prevSong.tracks, newTrack],
        totalDuration: newTotalDuration,
        lastModified: new Date().toISOString()
      };
    });

    // Auto-expand timeline height if needed
    const newHeight = Math.max(timelineHeight, autoHeight);
    if (newHeight > timelineHeight) {
      setTimelineHeight(newHeight);
      toast.success(`Added "${component.name}" to timeline - Height expanded to ${newHeight}px`);
    } else {
      toast.success(`Added "${component.name}" to timeline`);
    }
  }, [song.tracks, timelineHeight, autoHeight]);

  // Handle drag and drop
  const handleDragStart = useCallback((e: React.DragEvent, component: AvailableComponent) => {
    e.dataTransfer.setData('component', JSON.stringify(component));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const componentData = e.dataTransfer.getData('component');
    if (componentData) {
      const component: AvailableComponent = JSON.parse(componentData);
      
      // Calculate drop position based on mouse position
      const rect = timelineRef.current?.getBoundingClientRect();
      if (rect) {
        const relativeX = e.clientX - rect.left;
        const dropTime = Math.max(0, Math.round(relativeX / pixelsPerBeat));
        
        const newTrack: SongTrack = {
          id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: component.name,
          type: component.type,
          startTime: dropTime,
          endTime: dropTime + component.duration,
          volume: 80, // 0-100 scale
          muted: false,
          solo: false,
          color: component.color,
          instrument: 'piano',
          melody: component.melody,
          rhythm: component.rhythm
        };

        setSong(prevSong => {
          const newTotalDuration = Math.max(prevSong.totalDuration, newTrack.endTime + 8); // Add some padding
          return {
            ...prevSong,
            tracks: [...prevSong.tracks, newTrack],
            totalDuration: newTotalDuration,
            lastModified: new Date().toISOString()
          };
        });

        toast.success(`Dropped "${component.name}" at beat ${dropTime}`);
      }
    }
  }, [pixelsPerBeat]);

  // Track manipulation
  const handleTrackStart = useCallback((e: React.MouseEvent, trackId: string) => {
    if (e.button === 0) { // Left click only
      setIsDraggingTrack(true);
      setDraggedTrackId(trackId);
      setSelectedTrackId(trackId);
    }
  }, []);

  const handleTrackMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingTrack && draggedTrackId && timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const newStartTime = Math.max(0, Math.round(relativeX / pixelsPerBeat));
      
      setSong(prevSong => ({
        ...prevSong,
        tracks: prevSong.tracks.map(track =>
          track.id === draggedTrackId
            ? {
                ...track,
                startTime: newStartTime,
                endTime: newStartTime + (track.endTime - track.startTime)
              }
            : track
        ),
        lastModified: new Date().toISOString()
      }));
    }
  }, [isDraggingTrack, draggedTrackId, pixelsPerBeat]);

  const handleTrackRelease = useCallback(() => {
    setIsDraggingTrack(false);
    setDraggedTrackId(null);
  }, []);

  const removeTrack = useCallback((trackId: string) => {
    setSong(prevSong => ({
      ...prevSong,
      tracks: prevSong.tracks.filter(track => track.id !== trackId),
      lastModified: new Date().toISOString()
    }));
    setSelectedTrackId(null);
    toast.success('Track removed from timeline');
  }, []);

  const duplicateTrack = useCallback((track: SongTrack) => {
    const newTrack: SongTrack = {
      ...track,
      id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${track.name} (Copy)`,
      startTime: track.endTime + 1 // Place after original with small gap
    };
    newTrack.endTime = newTrack.startTime + (track.endTime - track.startTime);

    setSong(prevSong => ({
      ...prevSong,
      tracks: [...prevSong.tracks, newTrack],
      totalDuration: Math.max(prevSong.totalDuration, newTrack.endTime + 8),
      lastModified: new Date().toISOString()
    }));

    toast.success(`Duplicated "${track.name}"`);
  }, []);

  // Initialize Web Audio API
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          gainNodeRef.current = audioContextRef.current.createGain();
          gainNodeRef.current.connect(audioContextRef.current.destination);
          
          // Set initial volume
          gainNodeRef.current.gain.value = volume * (isMuted ? 0 : 1);
          
          setAudioInitialized(true);
          setAudioError(null);
          console.log('🎵 Audio system initialized successfully');
        }
      } catch (error: any) {
        console.error('❌ Failed to initialize audio system:', error);
        setAudioError(`Audio initialization failed: ${error.message}`);
        toast.error('Failed to initialize audio system');
      }
    };

    initializeAudio();

    return () => {
      // Cleanup audio resources
      try {
        stopPlayback();
        noteTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        noteTimeoutsRef.current.clear();
        trackGainNodes.current.clear();
        
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      } catch (error) {
        console.warn('Audio cleanup warning:', error);
      }
    };
  }, []);

  // Update master volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume * (isMuted ? 0 : 1);
    }
  }, [volume, isMuted]);

  // Convert MIDI note to frequency
  const frequencyFromMidiNote = useCallback((midiNote: number): number => {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }, []);

  // Enhanced audio synthesis with instrument support
  const playNote = useCallback(async (
    frequency: number, 
    duration: number, 
    instrument: InstrumentType = 'piano',
    volume: number = 0.5, 
    delay: number = 0
  ) => {
    if (!audioContextRef.current || !gainNodeRef.current || !audioInitialized) {
      console.warn('Audio system not ready for playback');
      return;
    }

    try {
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const oscillator = audioContextRef.current.createOscillator();
      const envelope = audioContextRef.current.createGain();
      const filter = audioContextRef.current.createBiquadFilter();
      
      // Get instrument configuration
      const config = ENHANCED_INSTRUMENTS[instrument] || ENHANCED_INSTRUMENTS.piano;
      
      // Set up audio graph
      oscillator.connect(envelope);
      envelope.connect(filter);
      filter.connect(gainNodeRef.current);
      
      // Configure oscillator
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime + delay);
      oscillator.type = config.oscillatorType;
      
      // Configure filter
      if (config.filterType) {
        filter.type = config.filterType;
        filter.frequency.value = config.filterFreq || frequency * 2;
        filter.Q.value = config.filterQ || 1;
      }
      
      // Configure envelope
      const startTime = audioContextRef.current.currentTime + delay;
      const { attack, decay, sustain, release } = config;
      
      envelope.gain.setValueAtTime(0, startTime);
      envelope.gain.linearRampToValueAtTime(volume, startTime + attack);
      envelope.gain.exponentialRampToValueAtTime(volume * sustain, startTime + attack + decay);
      envelope.gain.setValueAtTime(volume * sustain, startTime + duration - release);
      envelope.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
      
      // Add noise for realism (if configured)
      if (config.noiseLevel && config.noiseLevel > 0) {
        const noise = audioContextRef.current.createBufferSource();
        const noiseGain = audioContextRef.current.createGain();
        const noiseBuffer = audioContextRef.current.createBuffer(1, audioContextRef.current.sampleRate * 0.1, audioContextRef.current.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * config.noiseLevel;
        }
        noise.buffer = noiseBuffer;
        noise.connect(noiseGain);
        noiseGain.connect(filter);
        noiseGain.gain.value = 0.1;
        noise.start(startTime);
        noise.stop(startTime + duration);
      }
      
    } catch (error: any) {
      console.error('Error playing note:', error);
      setAudioError(`Note playback failed: ${error.message}`);
    }
  }, [audioInitialized, volume, isMuted]);

  // Get active tracks at current time
  const getActiveTracksAtTime = useCallback((timeInBeats: number) => {
    return song.tracks.filter(track => {
      if (track.muted) return false;
      
      // If any track is soloed, only play soloed tracks
      const hasSoloTracks = song.tracks.some(t => t.solo);
      if (hasSoloTracks && !track.solo) return false;
      
      return timeInBeats >= track.startTime && timeInBeats < track.endTime;
    });
  }, [song.tracks]);

  // Play notes for a specific beat
  const playNotesAtBeat = useCallback(async (beat: number) => {
    const activeTracks = getActiveTracksAtTime(beat);
    const newActiveNotes = new Set<string>();

    for (const track of activeTracks) {
      try {
        const relativeTime = beat - track.startTime;
        const melodyIndex = Math.floor(relativeTime);
        const rhythmIndex = Math.floor(relativeTime);

        // Check if we should play a note based on rhythm
        if (rhythmIndex < track.rhythm.length && track.rhythm[rhythmIndex] > 0) {
          if (melodyIndex < track.melody.length) {
            const melodyElement = track.melody[melodyIndex];
            
            if (isNote(melodyElement) && typeof melodyElement === 'number') {
              const frequency = frequencyFromMidiNote(melodyElement);
              const noteVolume = (track.volume / 100) * 0.4; // Reduced for polyphony
              const noteDuration = (60 / song.tempo) * 0.8; // 80% of beat duration
              const instrument = track.instrument || trackInstruments[track.id] || 'piano';
              
              await playNote(frequency, noteDuration, instrument, noteVolume);
              
              const noteId = `${track.id}-${melodyIndex}`;
              newActiveNotes.add(noteId);
              
              // Set timeout to remove note from active set
              const timeout = setTimeout(() => {
                setActiveNotes(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(noteId);
                  return newSet;
                });
                noteTimeoutsRef.current.delete(noteId);
              }, noteDuration * 1000);
              
              noteTimeoutsRef.current.set(noteId, timeout);
            }
          }
        }
      } catch (error: any) {
        console.error(`Error playing track ${track.name}:`, error);
      }
    }

    setActiveNotes(prev => new Set([...prev, ...newActiveNotes]));
  }, [getActiveTracksAtTime, frequencyFromMidiNote, playNote, song.tempo, trackInstruments]);

  // Main playback loop with precise timing
  const playbackLoop = useCallback(() => {
    if (!isPlayingRef.current) return;

    try {
      const beatsPerSecond = (song.tempo / 60) * 4; // 4 beats per measure
      const newTime = currentTime + (0.1 * playbackRate); // 100ms updates with playback rate
      const newBeat = newTime * beatsPerSecond;
      
      setCurrentTime(newTime);
      setCurrentBeat(newBeat);
      
      // Check if we need to play notes (only on new beats)
      const beatToPlay = Math.floor(newBeat);
      const previousBeat = Math.floor((currentTime - 0.1) * beatsPerSecond);
      
      if (beatToPlay !== previousBeat && beatToPlay >= 0) {
        playNotesAtBeat(beatToPlay);
      }

      // Handle looping and end conditions
      if (song.loopEnabled && newTime >= (song.loopEnd / beatsPerSecond)) {
        setCurrentTime(song.loopStart / beatsPerSecond);
        setCurrentBeat(song.loopStart);
      } else if (newTime >= (song.totalDuration / beatsPerSecond)) {
        stopPlayback();
        toast.info('Playback completed');
      }
    } catch (error: any) {
      console.error('Playback loop error:', error);
      setAudioError(`Playback error: ${error.message}`);
      stopPlayback();
    }
  }, [currentTime, song.tempo, song.loopEnabled, song.loopStart, song.loopEnd, song.totalDuration, playbackRate, playNotesAtBeat]);

  // Playback controls
  const startPlayback = useCallback(async () => {
    if (!audioContextRef.current || !audioInitialized) {
      setAudioError('Audio system not initialized');
      toast.error('Audio system not ready');
      return;
    }

    if (song.tracks.length === 0) {
      toast.warning('No tracks to play - add some tracks to the timeline first');
      return;
    }

    try {
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      setIsPlaying(true);
      isPlayingRef.current = true;
      setAudioError(null);
      
      playbackIntervalRef.current = setInterval(playbackLoop, 100);
      
      toast.success(`Playing "${song.title}" - ${song.tracks.length} tracks`);
    } catch (error: any) {
      console.error('Error starting playback:', error);
      setAudioError(`Failed to start playback: ${error.message}`);
      toast.error('Failed to start playback');
    }
  }, [audioInitialized, song.tracks.length, song.title, playbackLoop]);

  const pausePlayback = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
    
    // Clear active notes
    noteTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    noteTimeoutsRef.current.clear();
    setActiveNotes(new Set());
    
    toast.info('Playback paused');
  }, []);

  const stopPlayback = useCallback(() => {
    pausePlayback();
    setCurrentTime(0);
    setCurrentBeat(0);
    toast.info('Playback stopped');
  }, [pausePlayback]);

  // Seek to specific time
  const seekTo = useCallback((timePercent: number) => {
    if (isPlaying) {
      toast.warning('Stop playback before seeking');
      return;
    }
    
    const totalTimeSeconds = song.totalDuration / ((song.tempo / 60) * 4);
    const newTime = (timePercent / 100) * totalTimeSeconds;
    const newBeat = newTime * ((song.tempo / 60) * 4);
    
    setCurrentTime(newTime);
    setCurrentBeat(newBeat);
    
    // Clear active notes when seeking
    noteTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    noteTimeoutsRef.current.clear();
    setActiveNotes(new Set());
    
    toast.info(`Seeked to ${Math.floor(newBeat / 4) + 1}:${Math.floor(newBeat % 4) + 1}`);
  }, [isPlaying, song.totalDuration, song.tempo]);

  // Handle song property changes
  const handleSongPropertyChange = useCallback((property: keyof Song, value: any) => {
    setSong(prevSong => ({
      ...prevSong,
      [property]: value,
      lastModified: new Date().toISOString()
    }));
  }, []);

  // Render timeline ruler
  const renderTimelineRuler = () => {
    const measures = Math.ceil(dynamicTotalDuration / beatsPerMeasure);
    const rulers = [];

    for (let measure = 0; measure < measures; measure++) {
      for (let beat = 0; beat < beatsPerMeasure; beat++) {
        const beatNumber = measure * beatsPerMeasure + beat;
        const xPosition = beatNumber * pixelsPerBeat;
        
        rulers.push(
          <div
            key={`${measure}-${beat}`}
            className={`absolute top-0 bottom-0 ${beat === 0 ? 'border-l-2 border-primary' : 'border-l border-muted-foreground/30'}`}
            style={{ left: xPosition }}
          >
            {beat === 0 && (
              <div className="absolute top-1 left-1 text-xs font-mono text-muted-foreground">
                {measure + 1}
              </div>
            )}
            <div className="absolute bottom-1 left-1 text-xs font-mono text-muted-foreground">
              {beatNumber}
            </div>
          </div>
        );
      }
    }

    return rulers;
  };

  const hasTracks = song.tracks.length > 0;

  return (
    <Card className="p-6 space-y-6">
      {/* Song Metadata */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Input
            value={song.title}
            onChange={(e) => handleSongPropertyChange('title', e.target.value)}
            className="text-lg font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
            placeholder="Song Title"
          />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="outline">{song.timeSignature} time</Badge>
            <Badge variant="outline">{song.tempo} BPM</Badge>
            <Badge variant="outline">{song.totalDuration} beats</Badge>
            {hasTracks && (
              <Badge variant="secondary">{song.tracks.length} track{song.tracks.length !== 1 ? 's' : ''}</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSong({
                id: `song-${Date.now()}`,
                title: 'New Composition',
                composer: 'Anonymous',
                tempo: 120,
                timeSignature: '4/4',
                keySignature: null,
                mode: null,
                totalDuration: 32,
                tracks: [],
                loopEnabled: false,
                loopStart: 0,
                loopEnd: 16,
                created: new Date().toISOString(),
                lastModified: new Date().toISOString()
              });
              setCurrentTime(0);
              setIsPlaying(false);
              toast.success('New song created');
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Song
          </Button>
          <Button
            onClick={() => onExportSong(song)}
            disabled={!hasTracks}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export Song
          </Button>
        </div>
      </div>

      <Separator />

      {/* Song Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Label>Tempo</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[song.tempo]}
                onValueChange={([value]) => handleSongPropertyChange('tempo', value)}
                min={60}
                max={200}
                step={1}
                className="w-24"
              />
              <span className="text-sm font-mono w-12">{song.tempo}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label>Time Signature</Label>
            <Select
              value={`${song.timeSignature[0]}/${song.timeSignature[1]}`}
              onValueChange={(value) => {
                const [numerator, denominator] = value.split('/').map(Number);
                handleSongPropertyChange('timeSignature', [numerator, denominator]);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4/4">4/4</SelectItem>
                <SelectItem value="3/4">3/4</SelectItem>
                <SelectItem value="2/4">2/4</SelectItem>
                <SelectItem value="6/8">6/8</SelectItem>
                <SelectItem value="12/8">12/8</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => seekTo(0)}
              disabled={isPlaying || !hasTracks}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="sm"
              onClick={isPlaying ? pausePlayback : startPlayback}
              disabled={!hasTracks || !audioInitialized}
              className={audioError ? "border-destructive" : ""}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={stopPlayback}
              disabled={!hasTracks || !audioInitialized}
            >
              <Square className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 ml-4">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-mono">
                {Math.floor(currentTime / 4)}:{((currentTime % 4) * 15).toFixed(0).padStart(2, '0')}
              </span>
              <span className="text-xs text-muted-foreground">
                / {Math.floor(song.totalDuration / 4)}:{((song.totalDuration % 4) * 15).toFixed(0).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={song.loopEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => handleSongPropertyChange('loopEnabled', !song.loopEnabled)}
              >
                <Repeat className="w-4 h-4" />
              </Button>
              {song.loopEnabled && (
                <div className="flex items-center gap-2 text-sm">
                  <Input
                    type="number"
                    value={song.loopStart}
                    onChange={(e) => handleSongPropertyChange('loopStart', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 h-8"
                    min="0"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    value={song.loopEnd}
                    onChange={(e) => handleSongPropertyChange('loopEnd', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-8"
                    min="1"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
                disabled={!audioInitialized}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={([value]) => {
                  setVolume(value / 100);
                  setIsMuted(value === 0);
                }}
                max={100}
                step={1}
                className="w-20"
                disabled={!audioInitialized}
              />
              <div className="flex items-center gap-1 ml-2">
                <div className={`w-2 h-2 rounded-full ${audioInitialized ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-muted-foreground">
                  {audioInitialized ? 'Audio Ready' : 'Audio Init...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Audio Engine Status & Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${audioInitialized ? 'bg-green-500' : 'bg-red-500'} ${isPlaying ? 'animate-pulse' : ''}`} />
            <Label className="font-medium">Professional Audio Engine</Label>
            {activeNotes.size > 0 && (
              <Badge variant="default" className="animate-pulse">
                {activeNotes.size} notes playing
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Speed</Label>
            <Slider
              value={[playbackRate]}
              onValueChange={([value]) => setPlaybackRate(value)}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-16"
              disabled={isPlaying}
            />
            <span className="text-xs font-mono w-10">{playbackRate.toFixed(1)}x</span>
          </div>
        </div>

        {/* Audio Error Display */}
        {audioError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <Zap className="w-4 h-4" />
              <span className="font-medium">Audio Error:</span>
              <span>{audioError}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAudioError(null)}
                className="ml-auto h-6"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Real-time playback info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-mono">
                {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground">Time</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-mono">
                {Math.floor(currentBeat / 4) + 1}:{Math.floor(currentBeat % 4) + 1}
              </div>
              <div className="text-xs text-muted-foreground">Measure:Beat</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-mono">
                {getActiveTracksAtTime(currentBeat).length} / {song.tracks.length}
              </div>
              <div className="text-xs text-muted-foreground">Active Tracks</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-mono">
                {Math.round(volume * 100)}% {isMuted ? '(Muted)' : ''}
              </div>
              <div className="text-xs text-muted-foreground">Master Volume</div>
            </div>
          </div>
        </div>

        {/* Interactive Timeline Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Quick Seek:</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => seekTo(0)}
              disabled={isPlaying}
              className="h-6 px-2 text-xs"
            >
              Start
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => seekTo(25)}
              disabled={isPlaying}
              className="h-6 px-2 text-xs"
            >
              25%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => seekTo(50)}
              disabled={isPlaying}
              className="h-6 px-2 text-xs"
            >
              50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => seekTo(75)}
              disabled={isPlaying}
              className="h-6 px-2 text-xs"
            >
              75%
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {audioInitialized ? (
              isPlaying ? 'Playing with Web Audio API' : 'Ready for playback'
            ) : (
              'Initializing audio system...'
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Available Components */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAvailableComponents(!showAvailableComponents)}
            >
              <Layers className="w-4 h-4 mr-2" />
              Available Components
              <Badge variant="secondary" className="ml-2">
                {availableComponents.length}
              </Badge>
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Drag components to timeline or use Add buttons
          </div>
        </div>

        {showAvailableComponents && (
          <ScrollArea className="h-40 w-full border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableComponents.map((component) => (
                <motion.div
                  key={component.id}
                  className="border rounded-lg p-3 cursor-move hover:shadow-md transition-shadow"
                  style={{ borderColor: component.color }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, component)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: component.color }}
                      />
                      <span className="font-medium text-sm">{component.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addTrackToTimeline(component)}
                      className="text-xs h-6"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {component.melody.slice(0, 5).map(note => 
                      isRest(note) ? 'R' : midiNoteToNoteName(note)
                    ).join('-')}
                    {component.melody.length > 5 && '...'}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" style={{ borderColor: component.color }} className="text-xs">
                      {component.type}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {component.duration} beats
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <Separator />

      {/* Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Label className="font-medium">Timeline</Label>
            <Button
              variant={isTimelineExpanded ? "default" : "outline"}
              size="sm"
              onClick={toggleTimelineExpansion}
              className="gap-1"
            >
              {isTimelineExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              Height {isTimelineExpanded ? 'Collapse' : 'Expand'}
            </Button>
            <Button
              variant={isTimelineWidthExpanded ? "default" : "outline"}
              size="sm"
              onClick={toggleTimelineWidthExpansion}
              className="gap-1"
            >
              {isTimelineWidthExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              Width {isTimelineWidthExpanded ? 'Expandable!' : 'Standard'}
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Height: {isTimelineExpanded ? 'Unlimited' : 'Scrollable (600px max)'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Width: {isTimelineWidthExpanded ? 'Expandable' : 'Auto-size'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Zoom</Label>
              <Slider
                value={[timelineZoom]}
                onValueChange={([value]) => setTimelineZoom(value)}
                min={0.5}
                max={3}
                step={0.1}
                className="w-20"
              />
              <span className="text-xs font-mono w-8">{timelineZoom.toFixed(1)}x</span>
            </div>
          </div>
        </div>

        {/* Timeline Container with Unlimited Horizontal Scrolling */}
        <div className={`border rounded-lg ${isTimelineWidthExpanded ? 'overflow-x-auto overflow-y-hidden' : 'overflow-hidden'}`}>
          {/* Timeline Header with Ruler - Scrollable Container */}
          <div className={`${isTimelineWidthExpanded ? 'overflow-x-auto' : 'overflow-x-hidden'}`}>
            <div className="relative h-16 border-b bg-muted/30" style={{ width: timelineWidth, minWidth: isTimelineWidthExpanded ? timelineWidth : 'auto' }}>
              {renderTimelineRuler()}
              
              {/* Playhead */}
              <div 
                className={`absolute top-0 bottom-0 w-0.5 z-10 ${isPlaying ? 'bg-red-500 shadow-lg animate-pulse' : 'bg-red-400'}`}
                style={{ left: currentBeat * pixelsPerBeat }}
              >
                {isPlaying && (
                  <div className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />
                )}
              </div>

              {/* Loop Markers */}
              {song.loopEnabled && (
                <>
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-green-500 z-10"
                    style={{ left: song.loopStart * pixelsPerBeat }}
                  />
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-green-500 z-10"
                    style={{ left: song.loopEnd * pixelsPerBeat }}
                  />
                  <div 
                    className="absolute bg-green-500/10 border-t border-b border-green-500"
                    style={{ 
                      left: song.loopStart * pixelsPerBeat,
                      width: (song.loopEnd - song.loopStart) * pixelsPerBeat,
                      height: '100%'
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Track Area - Truly Expandable and Scrollable */}
          {isTimelineExpanded ? (
            // When expanded, show full height without scrolling
            <div className="border-t" style={{ height: `${timelineHeight}px` }}>
              <div 
                ref={timelineRef}
                className="relative bg-background"
                style={{ 
                  width: timelineWidth, 
                  minHeight: timelineHeight,
                  cursor: isDraggingTrack ? 'move' : 'default'
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onMouseMove={handleTrackMove}
                onMouseUp={handleTrackRelease}
              >
                {!hasTracks && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Drag components here to create your song</p>
                      <p className="text-xs mt-1">Or use the "Add" buttons above</p>
                    </div>
                  </div>
                )}

                {/* Render Tracks */}
                <AnimatePresence>
                  {song.tracks.map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`absolute h-16 border rounded transition-all duration-200 ${
                        selectedTrackId === track.id ? 'ring-2 ring-blue-500' : ''
                      } ${
                        isDraggingTrack && draggedTrackId === track.id 
                          ? 'cursor-move shadow-lg z-20 ring-2 ring-orange-500' 
                          : 'cursor-pointer hover:shadow-md'
                      }`}
                      style={{
                        left: track.startTime * pixelsPerBeat,
                        width: (track.endTime - track.startTime) * pixelsPerBeat,
                        top: index * 80 + 20,
                        backgroundColor: track.color + '20',
                        borderColor: track.color
                      }}
                      onMouseDown={(e) => handleTrackStart(e, track.id)}
                    >
                      <div className="h-full flex items-center justify-between p-2" style={{ color: track.color }}>
                        <div className="flex-1">
                          <div className="font-medium text-sm truncate">{track.name}</div>
                          <div className="text-xs opacity-75">
                            {track.startTime}-{track.endTime} beats
                          </div>
                        </div>
                        
                        {selectedTrackId === track.id && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateTrack(track);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTrack(track.id);
                              }}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            // When collapsed, use scrollable area with max height
            <ScrollArea className="border-t" style={{ height: `${Math.min(600, timelineHeight)}px` }}>
              <div 
                ref={timelineRef}
                className="relative bg-background"
                style={{ 
                  width: timelineWidth, 
                  height: Math.max(300, song.tracks.length * 80 + 100),
                  cursor: isDraggingTrack ? 'move' : 'default'
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onMouseMove={handleTrackMove}
                onMouseUp={handleTrackRelease}
              >
                {!hasTracks && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Drag components here to create your song</p>
                      <p className="text-xs mt-1">Or use the "Add" buttons above</p>
                    </div>
                  </div>
                )}

                {/* Render Tracks */}
                <AnimatePresence>
                  {song.tracks.map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`absolute h-16 border rounded transition-all duration-200 ${
                        selectedTrackId === track.id ? 'ring-2 ring-blue-500' : ''
                      } ${
                        isDraggingTrack && draggedTrackId === track.id 
                          ? 'cursor-move shadow-lg z-20 ring-2 ring-orange-500' 
                          : 'cursor-pointer hover:shadow-md'
                      }`}
                      style={{
                        left: track.startTime * pixelsPerBeat,
                        width: (track.endTime - track.startTime) * pixelsPerBeat,
                        top: index * 80 + 20,
                        backgroundColor: track.color + '20',
                        borderColor: track.color
                      }}
                      onMouseDown={(e) => handleTrackStart(e, track.id)}
                    >
                      <div className="h-full flex items-center justify-between p-2" style={{ color: track.color }}>
                        <div className="flex-1">
                          <div className="font-medium text-sm truncate">{track.name}</div>
                          <div className="text-xs opacity-75">
                            {track.startTime}-{track.endTime} beats
                          </div>
                        </div>
                        
                        {selectedTrackId === track.id && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateTrack(track);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTrack(track.id);
                              }}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Timeline Status */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Duration: {song.totalDuration} beats</span>
            <span>Tracks: {song.tracks.length}</span>
            <span>Timeline: {(timelineWidth / pixelsPerBeat).toFixed(1)} beats visible</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {isTimelineExpanded ? 'Unlimited Height' : `Max 600px`}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {isTimelineWidthExpanded ? 'Timeline Width Expandable!' : 'Auto Width'}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}