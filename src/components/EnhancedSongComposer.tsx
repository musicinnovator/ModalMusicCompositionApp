import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Song, SongTrack, AvailableComponent, Theme, Part, Melody, Rhythm, midiNoteToNoteName, PITCH_NAMES, isNote, isRest, BachLikeVariables, getBachVariableLabel, getBachVariableShortLabel, NoteValue, noteValuesToRhythm, BachVariableName, getNoteValueBeats } from '../types/musical';
import { InstrumentType, ENHANCED_INSTRUMENTS } from '../lib/enhanced-synthesis';
import { getSoundfontEngine, SoundfontAudioEngine } from '../lib/soundfont-audio-engine';
import { createPlaybackController, PlaybackPart } from '../lib/unified-playback';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';
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
  Minimize2,
  Activity,
  Headphones,
  Mic,
  Settings,
  FastForward,
  Rewind,
  Grid3x3,
  Bookmark,
  Palette,
  Undo,
  Redo,
  CheckSquare,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface GeneratedComposition {
  parts: Part[];
  instruments: InstrumentType[];
  muted: boolean[];
  timestamp: number;
}

interface CounterpointComposition {
  melody: Theme;
  instrument: InstrumentType;
  muted: boolean;
  timestamp: number;
  technique?: string;
}

// Arrangement Marker - Phase 2 Feature 4
interface ArrangementMarker {
  id: string;
  name: string;
  beat: number;
  color: string;
}

// Tempo Point for automation - Phase 3 Feature 10
interface TempoPoint {
  id: string;
  beat: number;
  tempo: number;
}

// History state for undo/redo - Phase 3 Feature 8
interface HistoryState {
  song: Song;
  timestamp: number;
  description: string;
}

// Canon composition interface
interface GeneratedCanon {
  result: {
    voices: Array<{
      id: string;
      melody: Theme;
      rhythm: Rhythm;
      delay: number;
    }>;
    metadata: {
      type: string;
      description: string;
      entryPattern: string;
      totalDuration: number;
    };
  };
  instruments: InstrumentType[];
  muted: boolean[];
  timestamp: number;
}

// Fugue Builder composition interface
interface GeneratedFugueBuilder {
  result: {
    voices: Array<{
      melody: Theme;
      rhythm?: Rhythm;
      type: string;
      entry: number;
    }>;
    metadata: {
      architecture: string;
      numVoices: number;
      totalMeasures: number;
      description?: string;
    };
  };
  instruments: InstrumentType[];
  muted: boolean[];
  timestamp: number;
}

// Harmony composition interface
interface GeneratedHarmony {
  result: {
    melody: Theme;
    originalMelody: Theme;
    harmonyNotes: Theme[];
    harmonyRhythm: Rhythm;
    chordLabels: string[];
    analysis: {
      detectedKey: number;
      keyQuality: 'major' | 'minor';
      chordProgression: string[];
      chordRoots: number[];
      chordTimings: number[];
      confidence: number;
    };
  };
  instrument: InstrumentType;
  muted: boolean;
  timestamp: number;
}

// Arpeggio composition interface
interface GeneratedArpeggio {
  melody: Theme;
  rhythm: Rhythm;
  label: string;
  instrument: InstrumentType;
  muted: boolean;
  timestamp: number;
}

// ADDITIVE: Interface for accompaniments
interface GeneratedAccompaniment {
  melody: Theme;
  rhythm: Rhythm;
  label: string;
  instrument: InstrumentType;
  muted: boolean;
  timestamp: number;
}

interface EnhancedSongComposerProps {
  theme: Theme;
  imitationsList: GeneratedComposition[];
  fuguesList: GeneratedComposition[];
  canonsList?: GeneratedCanon[];
  generatedFuguesList?: GeneratedFugueBuilder[];
  generatedCounterpoints: CounterpointComposition[];
  generatedHarmoniesList?: GeneratedHarmony[];
  generatedArpeggiosList?: GeneratedArpeggio[];
  generatedAccompanimentsList?: GeneratedAccompaniment[];
  bachVariables?: BachLikeVariables;
  themeRhythm?: NoteValue[];
  bachVariableRhythms?: Record<BachVariableName, NoteValue[]>;
  imitationRhythms?: Map<number, NoteValue[][]>;
  fugueRhythms?: Map<number, NoteValue[][]>;
  counterpointRhythms?: Map<number, NoteValue[]>;
  onExportSong: (song: Song) => void;
}

// Note event for accurate playback
interface NoteEvent {
  trackId: string;
  midiNote: number;
  startBeat: number;
  durationBeats: number;
  instrument: InstrumentType;
  volume: number;
}

// Grid snap divisions - Phase 1 Feature 2
type GridSnap = 'off' | 'measure' | 'half' | 'quarter' | 'eighth' | 'sixteenth' | 'triplet';

// Color palette for track coloring - Phase 3 Feature 9
const TRACK_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#10b981' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
];

// Marker presets - Phase 2 Feature 4
const MARKER_PRESETS = [
  { name: 'Intro', color: '#3b82f6' },
  { name: 'Verse', color: '#10b981' },
  { name: 'Chorus', color: '#f59e0b' },
  { name: 'Bridge', color: '#a855f7' },
  { name: 'Outro', color: '#ef4444' },
  { name: 'Solo', color: '#ec4899' },
  { name: 'Breakdown', color: '#06b6d4' },
  { name: 'Build', color: '#84cc16' },
];

export function EnhancedSongComposer({
  theme,
  imitationsList,
  fuguesList,
  canonsList = [],
  generatedFuguesList = [],
  generatedCounterpoints,
  generatedHarmoniesList = [],
  generatedArpeggiosList = [],
  generatedAccompanimentsList = [],
  bachVariables,
  themeRhythm,
  bachVariableRhythms,
  imitationRhythms,
  fugueRhythms,
  counterpointRhythms,
  onExportSong
}: EnhancedSongComposerProps) {
  // Song state
  const [song, setSong] = useState<Song>(() => ({
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
  }));

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1.5); // Raised to 150% for excellent audibility (increased from 1.05 per user request)
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioError, setAudioError] = useState<string | null>(null);

  // UI state
  const [isTimelineWidthExpanded, setIsTimelineWidthExpanded] = useState(false);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [timelineHeight, setTimelineHeight] = useState(300);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<AvailableComponent | null>(null);
  const [draggedTrack, setDraggedTrack] = useState<SongTrack | null>(null);
  const [isDraggingTrack, setIsDraggingTrack] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  
  // Multi-select for available components (Ctrl+Click)
  const [selectedComponentIds, setSelectedComponentIds] = useState<Set<string>>(new Set());
  
  // Component audition (preview playback) state
  const [auditioningComponentId, setAuditioningComponentId] = useState<string | null>(null);
  const auditionControllerRef = useRef(createPlaybackController());
  
  // Timeline playback controller - uses SAME unified system as audition
  const timelineControllerRef = useRef(createPlaybackController());

  // ========== PHASE 1 FEATURES ==========
  // Feature 1: Measure Length Control
  const [targetMeasures, setTargetMeasures] = useState(8); // User-controlled measure count
  const [showMeasureControl, setShowMeasureControl] = useState(true);
  
  // Feature 2: Grid Snapping
  const [gridSnapEnabled, setGridSnapEnabled] = useState(true);
  const [gridSnapDivision, setGridSnapDivision] = useState<GridSnap>('quarter');
  
  // Feature 3: Track Selection for duplication/multi-select (used in Phase 3 too)
  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<string>>(new Set());

  // ========== PHASE 2 FEATURES ==========
  // Feature 4: Arrangement Markers
  const [arrangementMarkers, setArrangementMarkers] = useState<ArrangementMarker[]>([]);
  const [showMarkerDialog, setShowMarkerDialog] = useState(false);
  const [newMarkerBeat, setNewMarkerBeat] = useState(0);
  const [newMarkerName, setNewMarkerName] = useState('Intro');
  const [newMarkerColor, setNewMarkerColor] = useState('#3b82f6');
  
  // Feature 5: Vertical Track Resize
  const [trackHeights, setTrackHeights] = useState<Map<string, number>>(new Map());
  const [resizingTrackId, setResizingTrackId] = useState<string | null>(null);
  
  // Feature 6: Loop Region Enhancement (existing loop features enhanced with visual feedback)
  const [loopRegionVisible, setLoopRegionVisible] = useState(false);

  // ========== PHASE 3 FEATURES ==========
  // Feature 7: Multi-Selection (uses selectedTrackIds from Phase 1)
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  
  // Feature 8: Undo/Redo
  const [historyStack, setHistoryStack] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [maxHistorySize] = useState(50); // Limit to prevent memory issues
  
  // Feature 9: Track Color System
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerTrackId, setColorPickerTrackId] = useState<string | null>(null);
  
  // Feature 10: Tempo Automation
  const [tempoPoints, setTempoPoints] = useState<TempoPoint[]>([]);
  const [showTempoAutomation, setShowTempoAutomation] = useState(false);
  const [newTempoPointBeat, setNewTempoPointBeat] = useState(0);
  const [newTempoPointTempo, setNewTempoPointTempo] = useState(120);

  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const soundfontEngineRef = useRef<SoundfontAudioEngine | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playbackIntervalRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  const noteTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const scheduledNotesRef = useRef<Map<string, any>>(new Map());
  
  // Refs for playback timing to avoid stale closures
  const playbackStartTimeRef = useRef<number | null>(null);
  const lastPlayedBeatRef = useRef(0);
  
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [soundfontReady, setSoundfontReady] = useState(false);

  // Initialize audio on mount
  useEffect(() => {
    let isMounted = true;
    
    const initAudio = async () => {
      try {
        console.log('🎵 Initializing Song Composer audio system...');
        
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) {
          throw new Error('Web Audio API not supported');
        }

        const ctx = new AudioContext();
        audioContextRef.current = ctx;
        
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.value = volume; // Will use the raised default of 1.05
        gainNodeRef.current = gain;
        
        if (isMounted) {
          setAudioInitialized(true);
          console.log('✅ Audio context initialized');
        }

        // Get soundfont engine with shared AudioContext
        const engine = await getSoundfontEngine(audioContextRef.current || undefined);
        
        if (isMounted) {
          soundfontEngineRef.current = engine;
          setSoundfontReady(true);
          console.log('✅ Soundfont engine ready (shared AudioContext)');
        }
        
      } catch (error) {
        console.error('Audio initialization error:', error);
        if (isMounted) {
          setAudioError('Failed to initialize audio system');
        }
      }
    };

    initAudio();

    return () => {
      isMounted = false;
      console.log('🧹 Cleaning up Song Composer audio...');
      
      // Stop both playback controllers
      try {
        if (timelineControllerRef.current) {
          timelineControllerRef.current.stop();
          console.log('  ✅ Timeline playback stopped');
        }
      } catch (error) {
        console.warn('Error stopping timeline playback:', error);
      }
      
      try {
        if (auditionControllerRef.current) {
          auditionControllerRef.current.stop();
          console.log('  ✅ Audition playback stopped');
        }
      } catch (error) {
        console.warn('Error stopping audition playback:', error);
      }
      
      // IMPORTANT: Do NOT dispose the global soundfont engine!
      // It's a shared singleton used by multiple components (AudioPlayer, ThemePlayer, etc.)
      // Disposing it would break other components that are still using it
      // Just clear our local reference
      try {
        soundfontEngineRef.current = null;
      } catch (error) {
        console.warn('Error clearing soundfont engine reference:', error);
      }
      
      // Disconnect and clear audio context components
      try {
        if (gainNodeRef.current) {
          try {
            gainNodeRef.current.disconnect();
          } catch (disconnectError) {
            console.warn('Error disconnecting gain node:', disconnectError);
          }
          gainNodeRef.current = null;
        }
      } catch (error) {
        console.warn('Error handling gain node cleanup:', error);
      }
      
      try {
        if (audioContextRef.current) {
          try {
            if (audioContextRef.current.state !== 'closed') {
              audioContextRef.current.close().catch((closeError: any) => {
                console.warn('Error closing audio context:', closeError);
              });
            }
          } catch (checkError) {
            console.warn('Error checking audio context state:', checkError);
          }
          audioContextRef.current = null;
        }
      } catch (error) {
        console.warn('Error handling audio context cleanup:', error);
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume * (isMuted ? 0 : 1);
    }
    if (soundfontEngineRef.current && soundfontReady) {
      soundfontEngineRef.current.setVolume(volume * (isMuted ? 0 : 1));
    }
  }, [volume, isMuted, soundfontReady]);

  // ========== UNDO/REDO IMPLEMENTATION - Phase 3 Feature 8 ==========
  
  // Save state to history
  const saveToHistory = useCallback((description: string) => {
    setHistoryStack(prev => {
      // Remove any "future" states if we're not at the end
      const newStack = prev.slice(0, historyIndex + 1);
      
      // Add new state
      const newState: HistoryState = {
        song: JSON.parse(JSON.stringify(song)), // Deep copy
        timestamp: Date.now(),
        description
      };
      
      newStack.push(newState);
      
      // Limit history size
      if (newStack.length > maxHistorySize) {
        newStack.shift();
        setHistoryIndex(prev => prev); // Keep same index since we removed from beginning
      } else {
        setHistoryIndex(newStack.length - 1);
      }
      
      return newStack;
    });
  }, [song, historyIndex, maxHistorySize]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevState = historyStack[prevIndex];
      
      if (prevState) {
        setSong(JSON.parse(JSON.stringify(prevState.song))); // Deep copy
        setHistoryIndex(prevIndex);
        toast.info(`Undo: ${prevState.description}`);
      }
    }
  }, [historyIndex, historyStack]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextState = historyStack[nextIndex];
      
      if (nextState) {
        setSong(JSON.parse(JSON.stringify(nextState.song))); // Deep copy
        setHistoryIndex(nextIndex);
        toast.info(`Redo: ${nextState.description}`);
      }
    }
  }, [historyIndex, historyStack]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // ========== GRID SNAPPING - Phase 1 Feature 2 ==========
  
  const getSnapDivisionBeats = useCallback((): number => {
    const beatsPerMeasure = parseInt(song.timeSignature.split('/')[0]) || 4;
    
    switch (gridSnapDivision) {
      case 'off': return 0;
      case 'measure': return beatsPerMeasure;
      case 'half': return beatsPerMeasure / 2;
      case 'quarter': return 1;
      case 'eighth': return 0.5;
      case 'sixteenth': return 0.25;
      case 'triplet': return 1 / 3;
      default: return 1;
    }
  }, [gridSnapDivision, song.timeSignature]);

  const snapToGrid = useCallback((beat: number): number => {
    if (!gridSnapEnabled || gridSnapDivision === 'off') {
      return beat;
    }
    
    const snapDivision = getSnapDivisionBeats();
    return Math.round(beat / snapDivision) * snapDivision;
  }, [gridSnapEnabled, getSnapDivisionBeats, gridSnapDivision]);

  // ========== MEASURE LENGTH CONTROL - Phase 1 Feature 1 ==========
  
  const beatsPerMeasure = parseInt(song.timeSignature.split('/')[0]) || 4;
  const targetBeats = targetMeasures * beatsPerMeasure;
  
  const extendSongByMeasures = useCallback((additionalMeasures: number) => {
    const beatsToAdd = additionalMeasures * beatsPerMeasure;
    setSong(prev => ({
      ...prev,
      totalDuration: prev.totalDuration + beatsToAdd,
      lastModified: new Date().toISOString()
    }));
    saveToHistory(`Extended by ${additionalMeasures} measures`);
    toast.success(`Added ${additionalMeasures} measures (${beatsToAdd} beats)`);
  }, [beatsPerMeasure, saveToHistory]);

  const trimToFit = useCallback(() => {
    const furthestBeat = song.tracks.length > 0 
      ? Math.max(...song.tracks.map(t => t.endTime))
      : beatsPerMeasure;
    
    const measuresNeeded = Math.ceil(furthestBeat / beatsPerMeasure);
    const newDuration = measuresNeeded * beatsPerMeasure;
    
    setSong(prev => ({
      ...prev,
      totalDuration: newDuration,
      lastModified: new Date().toISOString()
    }));
    saveToHistory('Trimmed to fit tracks');
    toast.success(`Trimmed to ${measuresNeeded} measures (${newDuration} beats)`);
  }, [song.tracks, beatsPerMeasure, saveToHistory]);

  const setExactMeasures = useCallback((measures: number) => {
    const newDuration = measures * beatsPerMeasure;
    setSong(prev => ({
      ...prev,
      totalDuration: newDuration,
      lastModified: new Date().toISOString()
    }));
    setTargetMeasures(measures);
    saveToHistory(`Set length to ${measures} measures`);
    toast.success(`Song length set to ${measures} measures (${newDuration} beats)`);
  }, [beatsPerMeasure, saveToHistory]);

  // ========== ARRANGEMENT MARKERS - Phase 2 Feature 4 ==========
  
  const addMarker = useCallback(() => {
    const newMarker: ArrangementMarker = {
      id: `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newMarkerName,
      beat: snapToGrid(newMarkerBeat),
      color: newMarkerColor
    };
    
    setArrangementMarkers(prev => [...prev, newMarker].sort((a, b) => a.beat - b.beat));
    setShowMarkerDialog(false);
    saveToHistory(`Added marker: ${newMarkerName}`);
    toast.success(`Marker "${newMarkerName}" added at beat ${newMarker.beat}`);
  }, [newMarkerName, newMarkerBeat, newMarkerColor, snapToGrid, saveToHistory]);

  const deleteMarker = useCallback((markerId: string) => {
    const marker = arrangementMarkers.find(m => m.id === markerId);
    setArrangementMarkers(prev => prev.filter(m => m.id !== markerId));
    saveToHistory(`Deleted marker: ${marker?.name || 'marker'}`);
    toast.success('Marker deleted');
  }, [arrangementMarkers, saveToHistory]);

  // ========== TEMPO AUTOMATION - Phase 3 Feature 10 ==========
  
  const addTempoPoint = useCallback(() => {
    const newPoint: TempoPoint = {
      id: `tempo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      beat: snapToGrid(newTempoPointBeat),
      tempo: newTempoPointTempo
    };
    
    setTempoPoints(prev => [...prev, newPoint].sort((a, b) => a.beat - b.beat));
    saveToHistory(`Added tempo change: ${newTempoPointTempo} BPM at beat ${newPoint.beat}`);
    toast.success(`Tempo point added: ${newTempoPointTempo} BPM at beat ${newPoint.beat}`);
  }, [newTempoPointBeat, newTempoPointTempo, snapToGrid, saveToHistory]);

  const deleteTempoPoint = useCallback((pointId: string) => {
    setTempoPoints(prev => prev.filter(p => p.id !== pointId));
    saveToHistory('Deleted tempo point');
    toast.success('Tempo point deleted');
  }, [saveToHistory]);

  // Get current tempo at a given beat (for playback with tempo automation)
  const getTempoAtBeat = useCallback((beat: number): number => {
    if (tempoPoints.length === 0) return song.tempo;
    
    // Find the tempo point at or before this beat
    const relevantPoints = tempoPoints.filter(p => p.beat <= beat).sort((a, b) => b.beat - a.beat);
    return relevantPoints[0]?.tempo || song.tempo;
  }, [tempoPoints, song.tempo]);

  // Available components from current composition state
  const availableComponents = useMemo<AvailableComponent[]>(() => {
    try {
      console.log('🎼 Building available components...');
      console.log('  Theme length:', theme.length);
      console.log('  Theme rhythm data:', themeRhythm ? `${themeRhythm.length} values` : 'none (will use defaults)');
      console.log('  Bach variable rhythms:', bachVariableRhythms ? `${Object.keys(bachVariableRhythms).length} variables` : 'none');
      console.log('  Imitations count:', imitationsList.length);
      console.log('  Fugues count:', fuguesList.length);
      console.log('  Canons count:', canonsList?.length || 0);
      console.log('  Fugue Generator count:', generatedFuguesList?.length || 0);
      console.log('  Counterpoints count:', generatedCounterpoints.length);
      
      const components: AvailableComponent[] = [];
      let componentsAdded = 0;

      // Add theme if available
      if (theme.length > 0) {
        try {
          let themeRhythmData: Rhythm;
          if (themeRhythm && themeRhythm.length === theme.length) {
            themeRhythmData = noteValuesToRhythm(themeRhythm);
            console.log('  🎵 Using Rhythm Controls data for Main Theme:', themeRhythm.length, 'notes');
          } else {
            themeRhythmData = theme.map(() => 1);
            console.log('  ℹ️ Using default quarter note rhythm for Main Theme');
          }
          
          components.push({
            id: 'theme-main',
            name: 'Main Theme',
            type: 'theme',
            melody: theme,
            rhythm: themeRhythmData,
            noteValues: themeRhythm && themeRhythm.length === theme.length ? themeRhythm : undefined,
            duration: theme.length,
            color: '#6366f1',
            description: themeRhythm ? 'With custom rhythm' : 'Default quarter notes'
          });
          componentsAdded++;
          console.log('  ✅ Added Main Theme with rhythm data');
        } catch (error) {
          console.error('  ❌ Error adding theme:', error);
          toast.error('Failed to add theme to available components');
        }
      }

      // Add all imitations (SKIP ORIGINAL - ONLY ADD IMITATION VOICES)
      imitationsList.forEach((imitation, imitationIndex) => {
        try {
          if (!imitation || !imitation.parts || !Array.isArray(imitation.parts)) {
            console.warn(`  ⚠️ Skipping invalid imitation #${imitationIndex + 1}`);
            return;
          }
          
          const customPartRhythms = imitationRhythms?.get(imitation.timestamp);
          
          imitation.parts.forEach((part, partIndex) => {
            try {
              // GLOBAL FIX: Skip original melody (partIndex 0) - only include generated imitation voices
              if (partIndex === 0) {
                console.log(`  🎯 Skipping original melody in imitation #${imitationIndex + 1} (user can add Main Theme separately)`);
                return;
              }
              
              if (!part || !part.melody || !Array.isArray(part.melody)) {
                console.warn(`    ⚠️ Skipping invalid part #${partIndex} in imitation #${imitationIndex + 1}`);
                return;
              }
              
              const partName = `Imitation #${imitationIndex + 1} - Voice ${partIndex}`;
              
              let rhythmData: Rhythm;
              const customRhythm = customPartRhythms?.[partIndex];
              if (customRhythm && customRhythm.length === part.melody.length) {
                rhythmData = noteValuesToRhythm(customRhythm);
                console.log(`  🎵 Using Rhythm Controls data for ${partName}:`, customRhythm.length, 'notes');
              } else {
                rhythmData = part.rhythm;
                console.log(`  ℹ️ Using default rhythm for ${partName}`);
              }
              
              components.push({
                id: `imitation-${imitationIndex}-part-${partIndex}`,
                name: partName,
                type: 'part',
                melody: part.melody,
                rhythm: rhythmData,
                noteValues: customRhythm && customRhythm.length === part.melody.length ? customRhythm : undefined,
                duration: part.melody.length,
                color: ['#60a5fa', '#93c5fd', '#bfdbfe'][(partIndex - 1) % 3], // Adjusted for skipped index 0
                description: customRhythm ? 'With custom rhythm' : 'Default rhythm'
              });
              componentsAdded++;
              console.log(`  ✅ Added ${partName} (${part.melody.length} notes) - Generated imitation only`);
            } catch (error) {
              console.error(`    ❌ Error adding part #${partIndex} in imitation #${imitationIndex + 1}:`, error);
            }
          });
        } catch (error) {
          console.error(`  ❌ Error processing imitation #${imitationIndex + 1}:`, error);
        }
      });

      // Add all fugues (SKIP ORIGINAL SUBJECT - ONLY ADD FUGUE VOICES)
      fuguesList.forEach((fugue, fugueIndex) => {
        try {
          if (!fugue || !fugue.parts || !Array.isArray(fugue.parts)) {
            console.warn(`  ⚠️ Skipping invalid fugue #${fugueIndex + 1}`);
            return;
          }
          
          const customVoiceRhythms = fugueRhythms?.get(fugue.timestamp);
          
          fugue.parts.forEach((part, partIndex) => {
            try {
              // GLOBAL FIX: Skip original subject (partIndex 0) - only include generated fugue voices
              if (partIndex === 0) {
                console.log(`  🎯 Skipping original subject in fugue #${fugueIndex + 1} (user can add Main Theme separately)`);
                return;
              }
              
              if (!part || !part.melody || !Array.isArray(part.melody)) {
                console.warn(`    ⚠️ Skipping invalid voice #${partIndex + 1} in fugue #${fugueIndex + 1}`);
                return;
              }
              
              const partName = `Fugue #${fugueIndex + 1} - Voice ${partIndex}`;
              
              let rhythmData: Rhythm;
              const customRhythm = customVoiceRhythms?.[partIndex];
              if (customRhythm && customRhythm.length === part.melody.length) {
                rhythmData = noteValuesToRhythm(customRhythm);
                console.log(`  🎵 Using Rhythm Controls data for ${partName}:`, customRhythm.length, 'notes');
              } else {
                rhythmData = part.rhythm;
                console.log(`  ℹ️ Using default rhythm for ${partName}`);
              }
              
              components.push({
                id: `fugue-${fugueIndex}-part-${partIndex}`,
                name: partName,
                type: 'part',
                melody: part.melody,
                rhythm: rhythmData,
                noteValues: customRhythm && customRhythm.length === part.melody.length ? customRhythm : undefined,
                duration: part.melody.length,
                color: ['#c084fc', '#e9d5ff', '#f3e8ff', '#fae8ff'][(partIndex - 1) % 4], // Adjusted for skipped index 0
                description: customRhythm ? 'With custom rhythm' : 'Default rhythm'
              });
              componentsAdded++;
              console.log(`  ✅ Added ${partName} (${part.melody.length} notes) - Generated fugue voice only`);
            } catch (error) {
              console.error(`    ❌ Error adding voice #${partIndex + 1} in fugue #${fugueIndex + 1}:`, error);
            }
          });
        } catch (error) {
          console.error(`  ❌ Error processing fugue #${fugueIndex + 1}:`, error);
        }
      });

      // Add generated counterpoints
      generatedCounterpoints.forEach((counterpoint, index) => {
        try {
          if (!counterpoint || !counterpoint.melody || !Array.isArray(counterpoint.melody) || counterpoint.melody.length === 0) {
            console.warn(`  ⚠️ Skipping invalid counterpoint #${index + 1}`);
            return;
          }
          
          const name = counterpoint.technique 
            ? `${counterpoint.technique}` 
            : `Counterpoint ${index + 1}`;
          
          // Check for custom rhythm from Rhythm Controls
          let rhythmData: Rhythm;
          let noteValuesData: NoteValue[] | undefined;
          let description: string;
          
          const customRhythm = counterpointRhythms?.get(counterpoint.timestamp);
          if (customRhythm && customRhythm.length === counterpoint.melody.length) {
            rhythmData = noteValuesToRhythm(customRhythm);
            noteValuesData = customRhythm;
            description = 'With custom rhythm from Rhythm Controls';
            console.log(`  🎵 Using Rhythm Controls data for ${name}:`, customRhythm.length, 'notes');
          } else if (counterpoint.rhythm) {
            rhythmData = counterpoint.rhythm;
            noteValuesData = undefined;
            description = 'Species counterpoint with original rhythm';
            console.log(`  🎵 Using species counterpoint rhythm for ${name}`);
          } else {
            rhythmData = counterpoint.melody.map(() => 1);
            noteValuesData = undefined;
            description = 'Default quarter notes';
            console.log(`  ℹ️ Using default quarter note rhythm for ${name}`);
          }
          
          components.push({
            id: `counterpoint-${counterpoint.timestamp}`,
            name,
            type: 'counterpoint',
            melody: counterpoint.melody,
            rhythm: rhythmData,
            noteValues: noteValuesData,
            instrument: counterpoint.instrument, // CRITICAL: Preserve instrument selection
            duration: counterpoint.melody.length,
            color: '#10b981',
            description,
            // COMPLETE DATA TRANSFER: Include all counterpoint metadata
            metadata: {
              technique: counterpoint.technique,
              timestamp: counterpoint.timestamp,
              generatorType: 'counterpoint'
            }
          });
          componentsAdded++;
          console.log(`  ✅ Added ${name} (${counterpoint.melody.length} notes) - ${description}`);
        } catch (error) {
          console.error(`  ❌ Error adding counterpoint #${index + 1}:`, error);
        }
      });

      // Add all canons (SKIP LEADER - ONLY ADD FOLLOWER VOICES)
      if (canonsList && Array.isArray(canonsList)) {
        canonsList.forEach((canon, canonIndex) => {
          try {
            if (!canon || !canon.result || !canon.result.voices || !Array.isArray(canon.result.voices)) {
              console.warn(`  ⚠️ Skipping invalid canon #${canonIndex + 1}`);
              return;
            }
            
            canon.result.voices.forEach((voice, voiceIndex) => {
              try {
                // GLOBAL FIX: Skip leader voice (voiceIndex 0) - only include follower voices
                if (voiceIndex === 0) {
                  console.log(`  🎯 Skipping leader voice in canon #${canonIndex + 1} (user can add Main Theme separately)`);
                  return;
                }
                
                if (!voice || !voice.melody || !Array.isArray(voice.melody) || voice.melody.length === 0) {
                  console.warn(`    ⚠️ Skipping invalid voice #${voiceIndex + 1} in canon #${canonIndex + 1}`);
                  return;
                }
                
                // Filter out rest notes (value 0) from melody for display
                const actualNotes = voice.melody.filter(note => note !== 0);
                
                if (actualNotes.length === 0) {
                  console.warn(`    ⚠️ Skipping voice with no actual notes in canon #${canonIndex + 1}`);
                  return;
                }
                
                const partName = `Canon #${canonIndex + 1} - ${voice.id}`;
                
                // Use the rhythm from the canon voice
                const rhythmData = voice.rhythm || voice.melody.map(() => 1);
                
                components.push({
                  id: `canon-${canon.timestamp}-voice-${voiceIndex}`,
                  name: partName,
                  type: 'part',
                  melody: voice.melody, // Keep original with rests for timing
                  rhythm: rhythmData,
                  noteValues: undefined,
                  duration: voice.melody.length,
                  color: ['#f472b6', '#f9a8d4', '#fbcfe8', '#fce7f3'][(voiceIndex - 1) % 4], // Adjusted for skipped index 0
                  description: `${canon.result.metadata.type.replace(/_/g, ' ')} - ${voice.id} (follower only)`,
                  // COMPLETE DATA TRANSFER: Include all canon metadata
                  metadata: {
                    canonType: canon.result.metadata.type,
                    entryDelay: voice.delay,
                    entryPattern: canon.result.metadata.entryPattern,
                    voiceIndex: voiceIndex,
                    timestamp: canon.timestamp,
                    generatorType: 'canon'
                  }
                });
                componentsAdded++;
                console.log(`  ✅ Added ${partName} (${voice.melody.length} notes, ${actualNotes.length} sounding notes) - Follower voice only`);
              } catch (error) {
                console.error(`    ❌ Error adding voice #${voiceIndex + 1} in canon #${canonIndex + 1}:`, error);
              }
            });
          } catch (error) {
            console.error(`  ❌ Error processing canon #${canonIndex + 1}:`, error);
          }
        });
      }

      // Add all Fugue Generator (Fugue Builder) fugues
      if (generatedFuguesList && Array.isArray(generatedFuguesList)) {
        console.log('  🎼 Processing Fugue Generator fugues...');
        generatedFuguesList.forEach((fugueBuilder, fugueIndex) => {
          try {
            if (!fugueBuilder || !fugueBuilder.result) {
              console.warn(`  ⚠️ Skipping invalid Fugue Generator fugue #${fugueIndex + 1}`);
              return;
            }
            
            const { result, instruments, muted } = fugueBuilder;
            const { sections, metadata } = result;
            
            // Validate metadata and sections
            if (!metadata || !sections || !Array.isArray(sections)) {
              console.warn(`  ⚠️ Skipping Fugue Generator fugue #${fugueIndex + 1} - missing metadata or sections`);
              return;
            }
            
            const architectureName = metadata.architecture ? metadata.architecture.replace(/_/g, ' ') : 'Unknown';
            console.log(`  🎵 Processing Fugue Generator #${fugueIndex + 1}: ${architectureName} (${metadata.totalVoices} voices)`);
            
            // Extract all voices from all sections and group by voiceId (following FugueBuilderEngine.fugueToParts logic)
            const allVoices = sections.flatMap(section => section.voices || []);
            console.log(`    Found ${allVoices.length} total voice entries across ${sections.length} sections`);
            
            // Group by voiceId to create consolidated parts
            const voiceMap = new Map<string, Array<{ material: Theme; rhythm: Rhythm; role: string; startTime: number }>>();
            allVoices.forEach(voice => {
              try {
                if (!voice || !voice.voiceId || !voice.material || !Array.isArray(voice.material)) {
                  console.warn(`    ⚠️ Skipping invalid voice entry`);
                  return;
                }
                
                if (!voiceMap.has(voice.voiceId)) {
                  voiceMap.set(voice.voiceId, []);
                }
                
                // FIX: Ensure rhythm length matches material length before storing
                let validatedRhythm: Rhythm;
                if (voice.rhythm && Array.isArray(voice.rhythm)) {
                  if (voice.rhythm.length === voice.material.length) {
                    // Perfect match - use as is
                    validatedRhythm = voice.rhythm;
                  } else if (voice.rhythm.length > voice.material.length) {
                    // Rhythm is longer (likely includes initial rests) - truncate to match
                    validatedRhythm = voice.rhythm.slice(0, voice.material.length);
                    console.log(`    🔧 Truncated rhythm from ${voice.rhythm.length} to ${voice.material.length} for ${voice.voiceId}`);
                  } else {
                    // Rhythm is shorter - pad with quarter notes
                    validatedRhythm = [...voice.rhythm];
                    while (validatedRhythm.length < voice.material.length) {
                      validatedRhythm.push(1);
                    }
                    console.log(`    🔧 Padded rhythm from ${voice.rhythm.length} to ${voice.material.length} for ${voice.voiceId}`);
                  }
                } else {
                  // No rhythm provided - use quarter notes
                  validatedRhythm = voice.material.map(() => 1);
                }
                
                voiceMap.get(voice.voiceId)!.push({
                  material: voice.material,
                  rhythm: validatedRhythm,
                  role: voice.role || 'subject',
                  startTime: voice.startTime || 0
                });
              } catch (voiceError) {
                console.warn(`    ⚠️ Error processing voice entry:`, voiceError);
              }
            });
            
            console.log(`    Grouped into ${voiceMap.size} distinct voices`);
            
            // Convert each grouped voice into a component
            let voiceIndex = 0;
            voiceMap.forEach((entries, voiceId) => {
              try {
                // Consolidate all entries for this voice into single melody and rhythm
                const consolidatedMelody: Theme = [];
                const consolidatedRhythm: Rhythm = [];
                
                entries.forEach(entry => {
                  consolidatedMelody.push(...entry.material);
                  consolidatedRhythm.push(...entry.rhythm);
                });
                
                if (consolidatedMelody.length === 0) {
                  console.warn(`    ⚠️ Skipping voice "${voiceId}" with no notes`);
                  return;
                }
                
                // Filter out rest notes (value 0) for display information
                const actualNotes = consolidatedMelody.filter(note => note !== 0);
                
                if (actualNotes.length === 0) {
                  console.warn(`    ⚠️ Skipping voice "${voiceId}" with no actual notes`);
                  return;
                }
                
                // Create descriptive name
                const partName = `Fugue #${fugueIndex + 1} - ${voiceId}`;
                
                // FIX: Final post-consolidation validation - ensure arrays match
                if (consolidatedRhythm.length !== consolidatedMelody.length) {
                  console.warn(`    ⚠️ Post-consolidation rhythm mismatch for \"${voiceId}\": rhythm=${consolidatedRhythm.length}, melody=${consolidatedMelody.length}`);
                  console.log(`    🔧 Synchronizing consolidated rhythm to match melody...`);
                  
                  // Pad with quarter notes if rhythm too short
                  while (consolidatedRhythm.length < consolidatedMelody.length) {
                    consolidatedRhythm.push(1);
                  }
                  
                  // Truncate if rhythm too long  
                  if (consolidatedRhythm.length > consolidatedMelody.length) {
                    consolidatedRhythm.splice(consolidatedMelody.length);
                  }
                  
                  console.log(`    ✅ Synchronized: ${consolidatedRhythm.length} rhythm beats now match ${consolidatedMelody.length} notes`);
                }
                
                // Use the synchronized rhythm data
                const rhythmData = consolidatedRhythm;
                console.log(`    🎵 Using Fugue Generator rhythm for ${partName} (${rhythmData.length} beats, ${entries.length} entries consolidated)`)
                
                // Get role for description (use most common role from entries)
                const roles = entries.map(e => e.role);
                const roleCount = new Map<string, number>();
                roles.forEach(role => roleCount.set(role, (roleCount.get(role) || 0) + 1));
                const primaryRole = Array.from(roleCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'voice';
                
                // Create component with comprehensive error checking
                try {
                  const component = {
                    id: `fugue-generator-${fugueBuilder.timestamp}-voice-${voiceIndex}`,
                    name: partName,
                    type: 'part' as const,
                    melody: consolidatedMelody,
                    rhythm: rhythmData,
                    noteValues: undefined, // Fugue Builder uses internal rhythm representation
                    duration: consolidatedMelody.length,
                    color: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'][voiceIndex % 4], // Purple gradient
                    description: `${architectureName} - ${primaryRole} (${entries.length} ${entries.length === 1 ? 'entry' : 'entries'})`,
                    // COMPLETE DATA TRANSFER: Include all fugue metadata
                    metadata: {
                      fugueArchitecture: metadata.architecture,
                      voiceRole: primaryRole,
                      totalVoices: metadata.totalVoices,
                      timestamp: fugueBuilder.timestamp,
                      generatorType: 'fugue'
                    }
                  };
                  
                  components.push(component);
                  componentsAdded++;
                  console.log(`  ✅ Added ${partName} (${consolidatedMelody.length} total notes, ${actualNotes.length} sounding, ${entries.length} entries, role: ${primaryRole})`);
                } catch (componentError) {
                  console.error(`    ❌ Error creating component for voice "${voiceId}":`, componentError);
                }
                
                voiceIndex++;
              } catch (voiceError) {
                console.error(`    ❌ Error processing voice "${voiceId}":`, voiceError);
              }
            });
            
            if (voiceMap.size === 0) {
              console.warn(`  ⚠️ No valid voices found in Fugue Generator #${fugueIndex + 1}`);
            }
          } catch (fugueError) {
            console.error(`  ❌ Error processing Fugue Generator #${fugueIndex + 1}:`, fugueError);
          }
        });
        console.log(`  ✅ Completed processing ${generatedFuguesList.length} Fugue Generator fugue(s)`);
      } else {
        console.log('  ℹ️ No Fugue Generator fugues available');
      }

      // Add Bach Variables
      if (bachVariables) {
        try {
          console.log('  🎼 Processing Bach Variables...');
          const variableEntries = Object.entries(bachVariables);
          console.log(`    Found ${variableEntries.length} Bach Variables`);
          
          variableEntries.forEach(([variableName, melody], index) => {
            try {
              if (!melody || !Array.isArray(melody) || melody.length === 0) {
                console.log(`    ⚠️ Skipping empty Bach Variable: ${variableName}`);
                return;
              }
              
              const displayName = getBachVariableLabel(variableName);
              const shortName = getBachVariableShortLabel(variableName);
              
              let variableRhythmData: Rhythm;
              const noteValueRhythm = bachVariableRhythms?.[variableName as BachVariableName];
              
              if (noteValueRhythm && noteValueRhythm.length === melody.length) {
                variableRhythmData = noteValuesToRhythm(noteValueRhythm);
                console.log(`    🎵 Using Rhythm Controls data for ${shortName}:`, noteValueRhythm.length, 'notes');
              } else {
                variableRhythmData = melody.map(() => 1);
                console.log(`    ℹ️ Using default quarter note rhythm for ${shortName}`);
              }
              
              components.push({
                id: `bach-variable-${variableName}`,
                name: `${shortName}: ${displayName}`,
                type: 'counterpoint',
                melody: melody,
                rhythm: variableRhythmData,
                noteValues: noteValueRhythm && noteValueRhythm.length === melody.length ? noteValueRhythm : undefined,
                duration: melody.length,
                color: '#f59e0b',
                description: noteValueRhythm ? 'With custom rhythm' : 'Default quarter notes'
              });
              componentsAdded++;
              console.log(`    ✅ Added Bach Variable "${shortName}" (${melody.length} notes) with rhythm data`);
            } catch (error) {
              console.error(`    ❌ Error adding Bach Variable "${variableName}":`, error);
            }
          });
        } catch (error) {
          console.error('  ❌ Error processing Bach Variables:', error);
        }
      }

      // Add generated harmonies
      if (generatedHarmoniesList && Array.isArray(generatedHarmoniesList)) {
        console.log('  🎵 Processing Harmonized Melodies...');
        generatedHarmoniesList.forEach((harmony, index) => {
          try {
            if (!harmony || !harmony.result || !harmony.result.melody) {
              console.warn(`  ⚠️ Skipping invalid harmony #${index + 1}`);
              return;
            }
            
            const { result, instrument } = harmony;
            
            // Validate melody structure
            if (!Array.isArray(result.melody) || result.melody.length === 0) {
              console.warn(`  ⚠️ Skipping harmony #${index + 1} - invalid melody`);
              return;
            }
            
            // Validate analysis data
            if (!result.analysis || !result.analysis.chordProgression) {
              console.warn(`  ⚠️ Skipping harmony #${index + 1} - missing analysis data`);
              return;
            }
            
            const chordCount = result.chordLabels?.length || result.analysis.chordProgression.length;
            const name = `Harmonized Melody #${index + 1}`;
            
            console.log(`  🎵 Processing ${name}: ${result.melody.length} melody notes, ${chordCount} chords`);
            
            // CRITICAL: Include harmonyNotes for full chord playback
            const harmonyNotesData = result.harmonyNotes && Array.isArray(result.harmonyNotes) 
              ? result.harmonyNotes 
              : undefined;
            
            if (!harmonyNotesData) {
              console.warn(`    ⚠️ No harmonyNotes data - skipping harmony #${index + 1}`);
              return;
            }
            
            console.log(`    🎼 Including ${harmonyNotesData.length} chord voicings for playback`);
            console.log(`    🔍 Sample chord structure (first chord):`, harmonyNotesData[0]);
            
            // GLOBAL FIX: Create a dummy melody array matching harmonyNotes length for component structure
            // The actual playback will use harmonyNotes for the chords (not the original melody)
            const dummyMelody = harmonyNotesData.map(chordNotes => {
              // Use the root note of each chord as the "melody" placeholder
              return chordNotes.length > 0 ? chordNotes[0] : 60;
            });
            
            // Build rhythm - CRITICAL: Must match harmonyNotes length for proper chord playback
            let rhythmData: Rhythm;
            let noteValuesData: NoteValue[] | undefined;
            let description: string;
            
            const targetLength = harmonyNotesData.length;
            
            if (result.harmonyRhythm && Array.isArray(result.harmonyRhythm) && result.harmonyRhythm.length === targetLength) {
              rhythmData = result.harmonyRhythm;
              noteValuesData = undefined;
              description = `${chordCount} chords only • ${instrument}`;
              console.log(`    🎵 Using harmony rhythm data (${result.harmonyRhythm.length} values)`);
            } else {
              // Default to quarter notes matching chord count
              rhythmData = Array(targetLength).fill(1);
              noteValuesData = undefined;
              description = `${chordCount} chords only • ${instrument}`;
              console.log(`    ℹ️ Using default quarter note rhythm (${targetLength} beats)`);
            }
            
            const harmonyComponent = {
              id: `harmony-${harmony.timestamp}`,
              name,
              type: 'harmony' as const,
              melody: dummyMelody, // Dummy melody for structure - real playback uses harmonyNotes
              rhythm: rhythmData,
              noteValues: noteValuesData,
              harmonyNotes: harmonyNotesData, // ONLY the harmony chords (no original melody)
              instrument: instrument || 'piano', // CRITICAL: Preserve instrument selection
              duration: targetLength,
              color: '#06b6d4', // Cyan color for harmonies
              description,
              // COMPLETE DATA TRANSFER: Include all harmony metadata
              metadata: {
                chordLabels: result.chordLabels,
                chordProgression: result.analysis.chordProgression,
                chordRoots: result.analysis.chordRoots,
                chordTimings: result.analysis.chordTimings,
                detectedKey: result.analysis.detectedKey,
                keyQuality: result.analysis.keyQuality,
                confidence: result.analysis.confidence,
                originalMelody: result.originalMelody,
                timestamp: harmony.timestamp,
                generatorType: 'harmony'
              }
            };
            
            // CRITICAL DEBUG: Verify harmonyNotes structure BEFORE adding to components
            console.log(`    ✅ Harmony component created:`, {
              id: harmonyComponent.id,
              hasHarmonyNotes: !!harmonyComponent.harmonyNotes,
              harmonyNotesLength: harmonyComponent.harmonyNotes?.length,
              firstChord: harmonyComponent.harmonyNotes?.[0],
              instrument: harmonyComponent.instrument,
              rhythmLength: harmonyComponent.rhythm.length
            });
            
            components.push(harmonyComponent);
            componentsAdded++;
            console.log(`  ✅ Added ${name} (${chordCount} chords only - original melody excluded, user can add separately)`);
          } catch (error) {
            console.error(`  ❌ Error adding harmony #${index + 1}:`, error);
          }
        });
        console.log(`  ✅ Completed processing ${generatedHarmoniesList.length} harmonized melodies`);
      } else {
        console.log('  ℹ️ No harmonized melodies available');
      }

      // Add generated arpeggios
      if (generatedArpeggiosList && Array.isArray(generatedArpeggiosList)) {
        console.log('  🎵 Processing Arpeggio Chains...');
        generatedArpeggiosList.forEach((arpeggio, index) => {
          try {
            if (!arpeggio || !arpeggio.melody || !Array.isArray(arpeggio.melody)) {
              console.warn(`  ⚠️ Skipping invalid arpeggio #${index + 1}`);
              return;
            }
            
            if (arpeggio.melody.length === 0) {
              console.warn(`  ⚠️ Skipping arpeggio #${index + 1} - empty melody`);
              return;
            }
            
            const name = arpeggio.label || `Arpeggio Chain #${index + 1}`;
            
            console.log(`  🎵 Processing ${name}: ${arpeggio.melody.length} notes`);
            
            // Build rhythm - use provided rhythm or default to quarter notes
            let rhythmData: Rhythm;
            let noteValuesData: NoteValue[] | undefined;
            let description: string;
            
            if (arpeggio.rhythm && Array.isArray(arpeggio.rhythm) && arpeggio.rhythm.length === arpeggio.melody.length) {
              rhythmData = arpeggio.rhythm;
              noteValuesData = undefined;
              description = `${arpeggio.melody.length} notes • ${arpeggio.instrument}`;
              console.log(`    🎵 Using arpeggio rhythm data (${arpeggio.rhythm.length} values)`);
            } else {
              // Default to quarter notes
              rhythmData = Array(arpeggio.melody.length).fill(1);
              noteValuesData = undefined;
              description = `${arpeggio.melody.length} notes • ${arpeggio.instrument}`;
              console.log(`    ℹ️ Using default quarter note rhythm (${arpeggio.melody.length} beats)`);
            }
            
            const arpeggioComponent = {
              id: `arpeggio-${arpeggio.timestamp}`,
              name,
              type: 'part' as const,
              melody: arpeggio.melody,
              rhythm: rhythmData,
              noteValues: noteValuesData,
              instrument: arpeggio.instrument || 'piano', // CRITICAL: Preserve instrument selection
              duration: arpeggio.melody.length,
              color: '#a855f7', // Purple color for arpeggios
              description,
              // COMPLETE DATA TRANSFER: Include all arpeggio metadata
              metadata: {
                label: arpeggio.label,
                timestamp: arpeggio.timestamp,
                generatorType: 'arpeggio'
              }
            };
            
            components.push(arpeggioComponent);
            componentsAdded++;
            console.log(`  ✅ Added ${name} (${arpeggio.melody.length} notes)`);
          } catch (error) {
            console.error(`  ❌ Error adding arpeggio #${index + 1}:`, error);
          }
        });
        console.log(`  ✅ Completed processing ${generatedArpeggiosList.length} arpeggio chains`);
      } else {
        console.log('  ℹ️ No arpeggio chains available');
      }

      // ADDITIVE: Add generated composer accompaniments
      if (generatedAccompanimentsList && Array.isArray(generatedAccompanimentsList)) {
        console.log('  🎼 Processing Composer Accompaniments...');
        generatedAccompanimentsList.forEach((accompaniment, index) => {
          try {
            if (!accompaniment || !accompaniment.melody || !Array.isArray(accompaniment.melody)) {
              console.warn(`  ⚠️ Skipping invalid accompaniment #${index + 1}`);
              return;
            }
            
            if (accompaniment.melody.length === 0) {
              console.warn(`  ⚠️ Skipping accompaniment #${index + 1} - empty melody`);
              return;
            }
            
            const name = accompaniment.label || `Composer Accompaniment #${index + 1}`;
            
            console.log(`  🎵 Processing ${name}: ${accompaniment.melody.length} notes`);
            
            // Build rhythm - use provided rhythm or default to quarter notes
            // ADDITIVE FIX: Correctly assign NoteValue[] rhythm data to noteValuesData
            let rhythmData: Rhythm;
            let noteValuesData: NoteValue[] | undefined;
            let description: string;
            
            if (accompaniment.rhythm && Array.isArray(accompaniment.rhythm) && accompaniment.rhythm.length === accompaniment.melody.length) {
              // CRITICAL FIX: accompaniment.rhythm is NoteValue[], not Rhythm (number[])
              // Assign to noteValuesData, not rhythmData!
              rhythmData = []; // Empty - we're using noteValues format
              noteValuesData = accompaniment.rhythm as NoteValue[];  // Use the NoteValue[] format
              description = `${accompaniment.melody.length} notes • ${accompaniment.instrument}`;
              console.log(`    🎵 Using accompaniment rhythm data as NoteValue[] (${accompaniment.rhythm.length} values)`);
            } else {
              // Default to quarter notes using NoteValue[] format
              rhythmData = [];
              noteValuesData = Array(accompaniment.melody.length).fill('quarter') as NoteValue[];
              description = `${accompaniment.melody.length} notes • ${accompaniment.instrument}`;
              console.log(`    ℹ️ Using default quarter note rhythm as NoteValue[] (${accompaniment.melody.length} notes)`);
            }
            
            const accompanimentComponent = {
              id: `accompaniment-${accompaniment.timestamp}`,
              name,
              type: 'part' as const,
              melody: accompaniment.melody,
              rhythm: rhythmData,
              noteValues: noteValuesData,
              instrument: accompaniment.instrument || 'piano', // CRITICAL: Preserve instrument selection
              duration: accompaniment.melody.length,
              color: '#d946ef', // Pink/magenta color for accompaniments
              description,
              // COMPLETE DATA TRANSFER: Include all accompaniment metadata
              metadata: {
                label: accompaniment.label,
                timestamp: accompaniment.timestamp,
                generatorType: 'accompaniment'
              }
            };
            
            components.push(accompanimentComponent);
            componentsAdded++;
            console.log(`  ✅ Added ${name} (${accompaniment.melody.length} notes)`);
          } catch (error) {
            console.error(`  ❌ Error adding accompaniment #${index + 1}:`, error);
          }
        });
        console.log(`  ✅ Completed processing ${generatedAccompanimentsList.length} composer accompaniments`);
      } else {
        console.log('  ℹ️ No composer accompaniments available');
      }

      console.log(`🎼 Total available components: ${components.length} (${componentsAdded} successfully added)`);
      
      if (components.length === 0) {
        console.log('ℹ️ No musical components available yet - waiting for user to generate a theme, imitation, fugue, or counterpoint.');
        console.log('💡 User guide: Create musical content in the left panel, then drag components here to build your song!');
      }
      
      return components;
    } catch (error) {
      console.error('❌ Critical error building available components:', error);
      toast.error('Error loading available components. Check console for details.');
      return [];
    }
  }, [theme, imitationsList, fuguesList, canonsList, generatedFuguesList, generatedCounterpoints, generatedHarmoniesList, generatedArpeggiosList, bachVariables, themeRhythm, bachVariableRhythms, imitationRhythms, fugueRhythms, counterpointRhythms]);

  // Timeline calculations - FULLY FLEXIBLE with no limits
  const pixelsPerBeat = 40 * timelineZoom;
  
  // Calculate the furthest point in the timeline based on actual track positions
  const furthestTrackEnd = song.tracks.length > 0 
    ? Math.max(...song.tracks.map(track => track.endTime), song.totalDuration)
    : song.totalDuration;
  
  // Generous padding to allow users to add tracks far beyond current content
  const paddingBeats = Math.max(64, furthestTrackEnd * 0.5); // Always provide at least 64 beats of space
  
  // Timeline width grows dynamically with content - NO MAXIMUM LIMIT
  const timelineWidth = Math.max(
    1200, // Minimum comfortable width
    (furthestTrackEnd + paddingBeats) * pixelsPerBeat
  );
  
  // Total duration dynamically expands to accommodate any track position
  const dynamicTotalDuration = Math.max(song.totalDuration, furthestTrackEnd + paddingBeats);
  
  // Height grows automatically with track count - NO MAXIMUM LIMIT
  const autoHeight = Math.max(300, song.tracks.length * 80 + 150); // More generous vertical space

  // Build note events for accurate playback
  const buildNoteEvents = useCallback((tracks: SongTrack[]): NoteEvent[] => {
    const events: NoteEvent[] = [];
    
    console.log('🎵 Building note events for playback...');
    
    tracks.forEach((track, trackIndex) => {
      if (track.muted) {
        console.log(`  ⏭️ Skipping muted track: ${track.name}`);
        return;
      }
      
      const hasSoloTracks = tracks.some(t => t.solo);
      if (hasSoloTracks && !track.solo) {
        console.log(`  ⏭️ Skipping non-solo track: ${track.name}`);
        return;
      }
      
      console.log(`  🎼 Processing track: ${track.name}`);
      console.log(`    Melody length: ${track.melody.length}`);
      console.log(`    Has noteValues: ${!!track.noteValues}`);
      console.log(`    Has harmonyNotes: ${!!track.harmonyNotes}`);
      console.log(`    Instrument: ${track.instrument || 'piano'}`);
      
      // 🚨 EMERGENCY DEBUG: Log ALL track data before processing
      console.log(`    🔍 RAW TRACK DATA:`, {
        name: track.name,
        type: track.type,
        melodyLength: track.melody?.length,
        rhythmLength: track.rhythm?.length,
        hasHarmonyNotes: !!track.harmonyNotes,
        harmonyNotesLength: track.harmonyNotes?.length,
        firstMelodyNote: track.melody?.[0],
        firstRhythmValue: track.rhythm?.[0],
        firstChord: track.harmonyNotes?.[0],
        instrument: track.instrument
      });
      
      // SPECIAL HANDLING FOR HARMONY TRACKS - Play all chord notes simultaneously
      if (track.harmonyNotes && Array.isArray(track.harmonyNotes) && track.harmonyNotes.length > 0) {
        console.log(`    🎵 ═══════════════════════════════════════════════════`);
        console.log(`    🎵 PROCESSING HARMONY TRACK: "${track.name}"`);
        console.log(`    🎵 ═══════════════════════════════════════════════════`);
        console.log(`    📊 Track Info:`);
        console.log(`       - Track ID: ${track.id}`);
        console.log(`       - Track Type: ${track.type}`);
        console.log(`       - Instrument: ${track.instrument}`);
        console.log(`       - Total Chords: ${track.harmonyNotes.length}`);
        console.log(`       - Start Time: ${track.startTime} beats`);
        console.log(`    🎼 Chord Structure (first 3 chords):`);
        track.harmonyNotes.slice(0, 3).forEach((chord, i) => {
          console.log(`       Chord ${i + 1}: [${chord.join(', ')}] (${chord.length} notes)`);
        });
        
        let currentBeat = track.startTime;
        
        // Use rhythm data to get timing for each chord
        const rhythm = track.rhythm || track.melody.map(() => 1);
        
        console.log(`    🎵 Rhythm Info:`);
        console.log(`       - Rhythm array length: ${rhythm.length}`);
        console.log(`       - HarmonyNotes length: ${track.harmonyNotes.length}`);
        console.log(`       - Match: ${rhythm.length === track.harmonyNotes.length ? '✅ YES' : '❌ NO - MISMATCH!'}`);
        
        let totalNotesAdded = 0;
        
        for (let i = 0; i < track.harmonyNotes.length; i++) {
          const chordNotes = track.harmonyNotes[i];
          const durationBeats = rhythm[i] || 1;
          
          // Play all notes in the chord simultaneously
          if (Array.isArray(chordNotes) && chordNotes.length > 0) {
            let notesAdded = 0;
            chordNotes.forEach((midiNote) => {
              if (isNote(midiNote) && typeof midiNote === 'number') {
                events.push({
                  trackId: track.id,
                  midiNote,
                  startBeat: currentBeat,
                  durationBeats,
                  instrument: track.instrument || 'piano',
                  volume: track.volume / 100
                });
                notesAdded++;
                totalNotesAdded++;
              }
            });
            
            if (i < 3 || i >= track.harmonyNotes.length - 1) {
              // Log first 3 and last chord in detail
              console.log(`      🎹 Chord ${i + 1}: Added ${notesAdded}/${chordNotes.length} notes at beat ${currentBeat.toFixed(2)}, duration ${durationBeats} beats`);
            }
          }
          
          currentBeat += durationBeats;
        }
        
        console.log(`    ✅ ═══════════════════════════════════════════════════`);
        console.log(`    ✅ HARMONY TRACK COMPLETE`);
        console.log(`    ✅ Total chords processed: ${track.harmonyNotes.length}`);
        console.log(`    ✅ Total note events created: ${totalNotesAdded}`);
        console.log(`    ✅ Instrument: ${track.instrument || 'piano'}`);
        console.log(`    ✅ ═══════════════════════════════════════════════════`);
        return; // Skip normal processing for harmony tracks
      }
      
      // Use noteValues if available for PRECISE timing
      if (track.noteValues && track.noteValues.length === track.melody.length) {
        console.log(`    ✅ Using NoteValue[] for precise timing`);
        
        let currentBeat = track.startTime;
        
        for (let i = 0; i < track.melody.length; i++) {
          const midiNote = track.melody[i];
          const noteValue = track.noteValues[i];
          
          // Handle rest - just advance time without playing a note
          if (noteValue === 'rest') {
            currentBeat += 1; // Rest advances by 1 beat
            console.log(`      Rest at beat ${currentBeat.toFixed(2)}`);
            continue;
          }
          
          if (isNote(midiNote) && typeof midiNote === 'number') {
            const durationBeats = getNoteValueBeats(noteValue);
            
            events.push({
              trackId: track.id,
              midiNote,
              startBeat: currentBeat,
              durationBeats,
              instrument: track.instrument || 'piano',
              volume: track.volume / 100
            });
            
            console.log(`      Note ${i + 1}: ${midiNoteToNoteName(midiNote)} at beat ${currentBeat.toFixed(2)}, duration ${durationBeats} beats (${noteValue})`);
            
            // Advance by the note duration
            currentBeat += durationBeats;
          } else {
            // Invalid note - just advance by 1 beat
            currentBeat += 1;
          }
        }
      }
      // Fallback: interpret rhythm array
      else {
        console.log(`    ⚠️ Using Rhythm array fallback`);
        console.log(`      Rhythm length: ${track.rhythm.length}, Melody length: ${track.melody.length}`);
        
        let melodyIndex = 0;
        let currentBeat = track.startTime;
        
        // Count initial rests for entry delay
        let initialRests = 0;
        for (let i = 0; i < track.rhythm.length && track.rhythm[i] === 0; i++) {
          initialRests++;
        }
        
        if (initialRests > 0) {
          console.log(`      🎵 Entry delay detected: ${initialRests} beats of silence before first note`);
          currentBeat += initialRests; // Advance by the delay
        }
        
        for (let rhythmIndex = initialRests; rhythmIndex < track.rhythm.length; rhythmIndex++) {
          const rhythmValue = track.rhythm[rhythmIndex];
          
          if (rhythmValue === 1 && melodyIndex < track.melody.length) {
            const midiNote = track.melody[melodyIndex];
            
            if (isNote(midiNote) && typeof midiNote === 'number') {
              // Count consecutive 1s for sustained notes (tied notes)
              let durationBeats = 1;
              let lookAhead = rhythmIndex + 1;
              while (lookAhead < track.rhythm.length && track.rhythm[lookAhead] === 1) {
                durationBeats++;
                lookAhead++;
                rhythmIndex++; // Skip these tied beats
              }
              
              events.push({
                trackId: track.id,
                midiNote,
                startBeat: currentBeat,
                durationBeats,
                instrument: track.instrument || 'piano',
                volume: track.volume / 100
              });
              
              console.log(`      Note ${melodyIndex + 1}: ${midiNoteToNoteName(midiNote)} at beat ${currentBeat.toFixed(2)}, duration ${durationBeats} beats (after ${initialRests} beat delay)`);
              
              currentBeat += durationBeats;
              melodyIndex++;
            } else {
              // Rest - just advance time
              currentBeat += 1;
            }
          } else {
            // Rest or spacer - advance time
            currentBeat += Math.abs(rhythmValue) || 1;
          }
        }
      }
    });
    
    console.log(`  ✅ Built ${events.length} note events`);
    return events.sort((a, b) => a.startBeat - b.startBeat);
  }, []);

  // Play notes using soundfont engine
  const playNoteEvents = useCallback(async (events: NoteEvent[], currentBeat: number, nextBeat: number) => {
    const engine = soundfontEngineRef.current;
    if (!engine || !soundfontReady) {
      console.warn('Soundfont engine not ready');
      return;
    }
    
    const eventsToPlay = events.filter(e => 
      e.startBeat >= currentBeat && e.startBeat < nextBeat
    );
    
    // 🚨 CRITICAL FIX FOR CHORD PLAYBACK: Capture scheduled time ONCE for all notes
    // This ensures notes that start at the same beat play simultaneously (chords)
    // Get the audio context and calculate the scheduled time once
    const audioContext = engine.getAudioContext?.();
    if (!audioContext) {
      console.error('Audio context not available');
      return;
    }
    
    // Calculate scheduled time once - small buffer to ensure audio system is ready
    const baseScheduledTime = audioContext.currentTime + 0.01;
    
    // Group events by start beat to identify chords
    const eventsByBeat = new Map<number, NoteEvent[]>();
    eventsToPlay.forEach(event => {
      const beat = parseFloat(event.startBeat.toFixed(4)); // Round to avoid floating point issues
      if (!eventsByBeat.has(beat)) {
        eventsByBeat.set(beat, []);
      }
      eventsByBeat.get(beat)!.push(event);
    });
    
    console.log(`🎵 Playing ${eventsToPlay.length} notes across ${eventsByBeat.size} beats`);
    
    // CRITICAL FIX: Play all notes simultaneously (no await in loop)
    // This allows chords to sound together instead of sequentially
    const playPromises = eventsToPlay.map(async (event) => {
      try {
        // Get tempo at this beat (for tempo automation)
        const currentTempo = getTempoAtBeat(event.startBeat);
        const noteDurationSeconds = (60 / currentTempo) * event.durationBeats;
        
        // Calculate offset from base scheduled time based on beat position
        const beatOffset = (event.startBeat - currentBeat) * (60 / currentTempo);
        const noteScheduledTime = baseScheduledTime + beatOffset;
        
        // Use the soundfont engine to play with the correct instrument
        // Pass the EXACT scheduled time to ensure simultaneous chord playback
        const playPromise = engine.playNote(
          event.midiNote,
          noteDurationSeconds,
          event.instrument,
          event.volume * volume * (isMuted ? 0 : 1),
          noteScheduledTime // 🔥 PASS SCHEDULED TIME FOR SIMULTANEOUS PLAYBACK
        );
        
        console.log(`🎵 Playing: ${midiNoteToNoteName(event.midiNote)} (${event.instrument}) at beat ${event.startBeat.toFixed(2)}, duration ${noteDurationSeconds.toFixed(2)}s`);
        
        // Track active notes for visualization
        const noteId = `${event.trackId}-${event.midiNote}-${event.startBeat}`;
        setActiveNotes(prev => new Set([...prev, noteId]));
        
        setTimeout(() => {
          setActiveNotes(prev => {
            const newSet = new Set(prev);
            newSet.delete(noteId);
            return newSet;
          });
        }, noteDurationSeconds * 1000);
        
        return playPromise;
      } catch (error) {
        console.error('Error playing note event:', error);
      }
    });
    
    // Wait for all notes to start playing (but they trigger simultaneously)
    await Promise.all(playPromises);
  }, [volume, isMuted, soundfontReady, getTempoAtBeat]);

  // Main playback loop with accurate timing using refs to avoid stale closures
  const playbackLoop = useCallback(() => {
    if (!isPlayingRef.current || !playbackStartTimeRef.current) return;

    try {
      // Calculate elapsed time from start using performance.now()
      const now = performance.now();
      const elapsedMs = now - playbackStartTimeRef.current;
      const elapsedSeconds = (elapsedMs / 1000) * playbackRate;
      
      // Get tempo at current beat for accurate timing
      const currentTempo = getTempoAtBeat(lastPlayedBeatRef.current);
      const secondsPerBeat = 60 / currentTempo;
      const newBeat = elapsedSeconds / secondsPerBeat;
      const newTime = elapsedSeconds;
      
      // Update state for UI
      setCurrentTime(newTime);
      setCurrentBeat(newBeat);
      
      // Build note events from current tracks
      const noteEvents = buildNoteEvents(song.tracks);
      
      // Play notes that should start in this time window
      const oldBeat = lastPlayedBeatRef.current;
      playNoteEvents(noteEvents, oldBeat, newBeat);
      lastPlayedBeatRef.current = newBeat;
      
      // Check for loop/end
      const totalDurationSeconds = song.totalDuration * secondsPerBeat;
      const loopEndSeconds = song.loopEnd * secondsPerBeat;
      
      if (song.loopEnabled && newTime >= loopEndSeconds) {
        const loopStartSeconds = song.loopStart * secondsPerBeat;
        playbackStartTimeRef.current = performance.now() - (loopStartSeconds * 1000 / playbackRate);
        lastPlayedBeatRef.current = song.loopStart;
        setCurrentTime(loopStartSeconds);
        setCurrentBeat(song.loopStart);
      } else if (newTime >= totalDurationSeconds) {
        // Inline stop to avoid circular dependency
        isPlayingRef.current = false;
        setIsPlaying(false);
        playbackStartTimeRef.current = null;
        if (playbackIntervalRef.current) {
          clearInterval(playbackIntervalRef.current);
          playbackIntervalRef.current = null;
        }
        toast.success('Playback completed');
      }
    } catch (error: any) {
      console.error('Playback loop error:', error);
      setAudioError(`Playback error: ${error.message}`);
      // Inline stop to avoid circular dependency
      isPlayingRef.current = false;
      setIsPlaying(false);
      playbackStartTimeRef.current = null;
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
    }
  }, [song.tempo, song.totalDuration, song.loopEnabled, song.loopStart, song.loopEnd, song.tracks, playbackRate, buildNoteEvents, playNoteEvents, getTempoAtBeat]);

  // Convert timeline tracks to unified playback format
  const tracksToPlaybackParts = useCallback((tracks: SongTrack[]): PlaybackPart[] => {
    console.log('🎵 [Timeline] Converting', tracks.length, 'tracks to PlaybackPart[] format');
    
    return tracks
      .filter(track => {
        if (track.muted) {
          console.log('  ⏭️ Skipping muted track:', track.name);
          return false;
        }
        
        const hasSolo = tracks.some(t => t.solo);
        if (hasSolo && !track.solo) {
          console.log('  ⏭️ Skipping non-solo track:', track.name);
          return false;
        }
        
        return true;
      })
      .map(track => {
        console.log('  ✅ Converting track:', track.name);
        console.log('    Melody:', track.melody.length, 'notes');
        console.log('    Has noteValues:', !!track.noteValues);
        console.log('    Instrument:', track.instrument || 'piano');
        
        return {
          melody: track.melody,
          rhythm: track.rhythm,
          noteValues: track.noteValues,
          instrument: track.instrument || 'piano',
          volume: track.volume / 100,
          muted: false
        };
      });
  }, []);

  // UNIFIED PLAYBACK CONTROLS - Uses same system as component audition
  const startPlayback = useCallback(async () => {
    if (song.tracks.length === 0) {
      toast.warning('No tracks to play - add some tracks to the timeline first');
      return;
    }

    try {
      console.log('▶️ [Timeline] Starting playback');
      console.log('  Tracks:', song.tracks.length);
      console.log('  Tempo:', song.tempo, 'BPM');
      
      // Convert tracks to unified playback format
      const parts = tracksToPlaybackParts(song.tracks);
      
      if (parts.length === 0) {
        toast.warning('No audible tracks (all may be muted or non-solo)');
        return;
      }
      
      console.log('  Playable parts:', parts.length);
      
      // Use the SAME unified playback controller as audition
      await timelineControllerRef.current.play(parts, song.tempo, {
        onProgress: (time, duration) => {
          const beat = (time / 60) * song.tempo;
          setCurrentTime(time);
          setCurrentBeat(beat);
        },
        onComplete: () => {
          console.log('✅ [Timeline] Playback completed');
          setIsPlaying(false);
          setCurrentBeat(0);
          setCurrentTime(0);
          toast.success('Playback completed');
        }
      });
      
      setIsPlaying(true);
      setAudioError(null);
      toast.success('Playback started');
      
    } catch (error: any) {
      console.error('❌ [Timeline] Playback error:', error);
      setAudioError(`Playback error: ${error.message}`);
      toast.error('Failed to start playback');
    }
  }, [song.tracks, song.tempo, tracksToPlaybackParts]);

  const stopPlayback = useCallback(() => {
    console.log('⏹️ [Timeline] Stopping playback');
    timelineControllerRef.current.stop();
    setIsPlaying(false);
    setCurrentBeat(0);
    setCurrentTime(0);
    setActiveNotes(new Set());
  }, []);

  const pausePlayback = useCallback(() => {
    console.log('⏸️ [Timeline] Pausing playback');
    if (isPlaying) {
      timelineControllerRef.current.pause();
      setIsPlaying(false);
      toast.info('Playback paused');
    }
  }, [isPlaying]);

  const resetPlayback = useCallback(() => {
    console.log('⏮️ Resetting playback');
    stopPlayback();
    lastPlayedBeatRef.current = 0;
    setCurrentTime(0);
    setCurrentBeat(0);
    toast.info('Playback reset');
  }, [stopPlayback]);

  // ========== TRACK DUPLICATION - Phase 1 Feature 3 ==========
  
  const duplicateTrack = useCallback((trackId: string) => {
    const trackToDuplicate = song.tracks.find(t => t.id === trackId);
    if (!trackToDuplicate) return;
    
    // Create new track with offset position
    const offsetBeats = 4; // Offset by 4 beats
    const newTrack: SongTrack = {
      ...trackToDuplicate,
      id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${trackToDuplicate.name} (Copy)`,
      startTime: trackToDuplicate.startTime + offsetBeats,
      endTime: trackToDuplicate.endTime + offsetBeats
    };
    
    setSong(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack],
      totalDuration: Math.max(prev.totalDuration, newTrack.endTime + 32),
      lastModified: new Date().toISOString()
    }));
    
    saveToHistory(`Duplicated track: ${trackToDuplicate.name}`);
    toast.success(`Track duplicated: ${trackToDuplicate.name}`);
  }, [song.tracks, saveToHistory]);

  // ========== MULTI-SELECTION - Phase 3 Feature 7 ==========
  
  const toggleTrackSelection = useCallback((trackId: string, ctrlKey: boolean) => {
    if (multiSelectMode || ctrlKey) {
      setSelectedTrackIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(trackId)) {
          newSet.delete(trackId);
        } else {
          newSet.add(trackId);
        }
        return newSet;
      });
    } else {
      setSelectedTrackId(trackId);
      setSelectedTrackIds(new Set([trackId]));
    }
  }, [multiSelectMode]);

  const deleteSelectedTracks = useCallback(() => {
    if (selectedTrackIds.size === 0) return;
    
    const count = selectedTrackIds.size;
    setSong(prev => ({
      ...prev,
      tracks: prev.tracks.filter(t => !selectedTrackIds.has(t.id)),
      lastModified: new Date().toISOString()
    }));
    
    setSelectedTrackIds(new Set());
    setSelectedTrackId(null);
    saveToHistory(`Deleted ${count} tracks`);
    toast.success(`Deleted ${count} tracks`);
  }, [selectedTrackIds, saveToHistory]);

  const duplicateSelectedTracks = useCallback(() => {
    if (selectedTrackIds.size === 0) return;
    
    const tracksToDuplicate = song.tracks.filter(t => selectedTrackIds.has(t.id));
    const offsetBeats = 4;
    
    const newTracks = tracksToDuplicate.map(track => ({
      ...track,
      id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${track.name} (Copy)`,
      startTime: track.startTime + offsetBeats,
      endTime: track.endTime + offsetBeats
    }));
    
    setSong(prev => ({
      ...prev,
      tracks: [...prev.tracks, ...newTracks],
      totalDuration: Math.max(prev.totalDuration, ...newTracks.map(t => t.endTime + 32)),
      lastModified: new Date().toISOString()
    }));
    
    saveToHistory(`Duplicated ${newTracks.length} tracks`);
    toast.success(`Duplicated ${newTracks.length} tracks`);
  }, [selectedTrackIds, song.tracks, saveToHistory]);

  // Component selection handlers for multi-select (Ctrl+Click)
  const toggleComponentSelection = useCallback((componentId: string, ctrlKey: boolean) => {
    if (ctrlKey) {
      // Multi-select mode
      setSelectedComponentIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(componentId)) {
          newSet.delete(componentId);
        } else {
          newSet.add(componentId);
        }
        return newSet;
      });
    } else {
      // Single select mode - replace selection
      setSelectedComponentIds(new Set([componentId]));
    }
  }, []);

  const clearComponentSelection = useCallback(() => {
    setSelectedComponentIds(new Set());
  }, []);

  const addSelectedComponents = useCallback(() => {
    if (selectedComponentIds.size === 0) {
      toast.warning('No components selected');
      return;
    }

    const componentsToAdd = availableComponents.filter(c => selectedComponentIds.has(c.id));
    if (componentsToAdd.length === 0) {
      toast.warning('Selected components not found');
      return;
    }

    let startTime = song.tracks.length > 0 ? Math.max(...song.tracks.map(t => t.endTime)) : 0;
    const newTracks: SongTrack[] = [];

    componentsToAdd.forEach((component, index) => {
      try {
        if (!component || !component.melody || component.melody.length === 0) {
          console.warn(`Skipping invalid component: ${component?.name}`);
          return;
        }

        const rhythm = component.rhythm || component.melody.map(() => 1);

        const newTrack: SongTrack = {
          id: `track-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          name: component.name,
          type: component.type,
          startTime: startTime,
          endTime: startTime + component.duration,
          volume: 80,
          muted: false,
          solo: false,
          color: component.color,
          instrument: 'piano',
          melody: component.melody,
          rhythm: rhythm,
          noteValues: component.noteValues,
          harmonyNotes: component.harmonyNotes // CRITICAL: Include harmony chord data for full playback
        };

        newTracks.push(newTrack);
        startTime = newTrack.endTime; // Next track starts where this one ends
      } catch (error: any) {
        console.error(`Error preparing track for ${component.name}:`, error);
      }
    });

    if (newTracks.length === 0) {
      toast.error('Failed to prepare tracks');
      return;
    }

    setSong(prevSong => {
      const newTotalDuration = Math.max(prevSong.totalDuration, ...newTracks.map(t => t.endTime + 32));
      return {
        ...prevSong,
        tracks: [...prevSong.tracks, ...newTracks],
        totalDuration: newTotalDuration,
        lastModified: new Date().toISOString()
      };
    });

    const newHeight = Math.max(timelineHeight, autoHeight);
    if (newHeight > timelineHeight) {
      setTimelineHeight(newHeight);
    }

    clearComponentSelection();
    saveToHistory(`Added ${newTracks.length} tracks`);
    toast.success(`✅ Added ${newTracks.length} tracks to timeline`);
    console.log(`✅ Successfully added ${newTracks.length} tracks`);
  }, [selectedComponentIds, availableComponents, song.tracks, timelineHeight, autoHeight, clearComponentSelection, saveToHistory]);

  // Track manipulation
  const addTrackToTimeline = useCallback((component: AvailableComponent) => {
    try {
      console.log('🎵 Adding track:', component.name, 'Current tracks:', song.tracks.length);
      
      if (!component || !component.melody || component.melody.length === 0) {
        throw new Error(`Invalid component: melody missing or empty`);
      }
      
      if (!component.rhythm) {
        component.rhythm = component.melody.map(() => 1);
      }
      
    console.log('🔍 Component data for addTrackToTimeline:', {
      name: component.name,
      hasHarmonyNotes: !!component.harmonyNotes,
      harmonyNotesLength: component.harmonyNotes?.length,
      firstChord: component.harmonyNotes?.[0],
      instrument: component.instrument
    });
    
    const newTrack: SongTrack = {
      id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: component.name,
      type: component.type,
      startTime: song.tracks.length > 0 ? Math.max(...song.tracks.map(t => t.endTime)) : 0,
      endTime: song.tracks.length > 0 ? Math.max(...song.tracks.map(t => t.endTime)) + component.duration : component.duration,
      volume: 80,
      muted: false,
      solo: false,
      color: component.color,
      instrument: component.instrument || 'piano', // CRITICAL FIX: Use component's instrument
      melody: component.melody,
      rhythm: component.rhythm,
      noteValues: component.noteValues, // CRITICAL: Preserve original NoteValue[] for MIDI export
      harmonyNotes: component.harmonyNotes, // CRITICAL: Include harmony chord data for full playback
      metadata: component.metadata // COMPLETE DATA TRANSFER: Preserve all metadata
    };
    
    console.log('✅ Track created in addTrackToTimeline:', {
      id: newTrack.id,
      hasHarmonyNotes: !!newTrack.harmonyNotes,
      harmonyNotesLength: newTrack.harmonyNotes?.length,
      instrument: newTrack.instrument
    });

    setSong(prevSong => {
      // Timeline expands automatically to accommodate any track position
      const newTotalDuration = Math.max(prevSong.totalDuration, newTrack.endTime + 32); // Generous padding
      return {
        ...prevSong,
        tracks: [...prevSong.tracks, newTrack],
        totalDuration: newTotalDuration,
        lastModified: new Date().toISOString()
      };
    });

    // Height expands automatically with track count
    const newHeight = Math.max(timelineHeight, autoHeight);
    if (newHeight > timelineHeight) {
      setTimelineHeight(newHeight);
      toast.success(`✅ Added "${component.name}" - Timeline expanded (Beat ${newTrack.startTime} to ${newTrack.endTime})`);
    } else {
      toast.success(`✅ Added "${component.name}" at Beat ${newTrack.startTime}`);
    }
    
    saveToHistory(`Added track: ${component.name}`);
    console.log('✅ Track successfully added');
    
    } catch (error: any) {
      console.error('❌ Error adding track:', error);
      toast.error(`Failed to add track: ${error.message || 'Unknown error'}`, { duration: 5000 });
      setDragError(error.message || 'Failed to add track');
    }
  }, [song.tracks, timelineHeight, autoHeight, song, saveToHistory]);

  // Drag and Drop Handlers
  const handleDragStart = useCallback((e: React.DragEvent, component: AvailableComponent) => {
    try {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('application/json', JSON.stringify(component));
      setDraggedComponent(component);
      setIsDraggingTrack(true);
      setDragError(null);
      console.log('🎵 Drag started:', component.name);
    } catch (error: any) {
      console.error('Error starting drag:', error);
      setDragError(`Failed to start drag: ${error.message}`);
      toast.error('Failed to start drag operation');
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    try {
      setIsDraggingTrack(false);
      console.log('🎵 Drag ended');
      
      setTimeout(() => {
        setDraggedComponent(null);
        setDraggedTrack(null);
        setDragError(null);
      }, 100);
    } catch (error: any) {
      console.error('Error ending drag:', error);
      setDragError(`Failed to end drag: ${error.message}`);
    }
  }, []);

  // Track-specific drag handlers
  const handleTrackDragStart = useCallback((e: React.DragEvent, track: SongTrack) => {
    try {
      e.stopPropagation(); // Prevent triggering component drag
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', track.id); // Simple data for track reposition
      setDraggedTrack(track);
      setIsDraggingTrack(true);
      setDragError(null);
      console.log('🎵 Track drag started:', track.name);
    } catch (error: any) {
      console.error('Error starting track drag:', error);
      setDragError(`Failed to start track drag: ${error.message}`);
    }
  }, []);

  const handleTrackDragEnd = useCallback((e: React.DragEvent) => {
    try {
      setIsDraggingTrack(false);
      console.log('🎵 Track drag ended');
      
      setTimeout(() => {
        setDraggedTrack(null);
        setDragError(null);
      }, 100);
    } catch (error: any) {
      console.error('Error ending track drag:', error);
      setDragError(`Failed to end track drag: ${error.message}`);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    try {
      e.preventDefault();
      // Show 'move' cursor when repositioning tracks, 'copy' when adding new components
      e.dataTransfer.dropEffect = draggedTrack ? 'move' : 'copy';
    } catch (error: any) {
      console.error('Error during drag over:', error);
    }
  }, [draggedTrack]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    try {
      e.preventDefault();
      setIsDraggingTrack(false);

      if (!timelineRef.current) {
        throw new Error('Timeline reference not available');
      }

      const rect = timelineRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      let dropBeat = Math.max(0, relativeX / pixelsPerBeat);
      
      // Apply grid snapping if enabled
      dropBeat = snapToGrid(dropBeat);

      // Check if we're repositioning an existing track
      if (draggedTrack) {
        console.log('🎵 Repositioning track:', draggedTrack.name, 'to beat:', dropBeat);
        
        const duration = draggedTrack.endTime - draggedTrack.startTime;
        const newEndTime = dropBeat + duration;
        
        setSong(prevSong => {
          // Expand timeline generously to support the new position
          const newTotalDuration = Math.max(prevSong.totalDuration, newEndTime + 32);
          return {
            ...prevSong,
            tracks: prevSong.tracks.map(t => 
              t.id === draggedTrack.id 
                ? { ...t, startTime: dropBeat, endTime: newEndTime }
                : t
            ),
            totalDuration: newTotalDuration,
            lastModified: new Date().toISOString()
          };
        });
        
        setDraggedTrack(null);
        setDragError(null);
        saveToHistory(`Moved track: ${draggedTrack.name}`);
        toast.success(`✅ Moved "${draggedTrack.name}" to beat ${dropBeat.toFixed(2)} - Timeline expanded as needed`);
        return;
      }

      // Otherwise, we're adding a new component
      let component: AvailableComponent | null = null;
      
      if (draggedComponent) {
        component = draggedComponent;
        console.log('🎵 Using draggedComponent state:', component.name);
      } else {
        try {
          const dataStr = e.dataTransfer.getData('application/json');
          if (dataStr) {
            component = JSON.parse(dataStr);
            console.log('🎵 Using dataTransfer data:', component.name);
          }
        } catch (parseError: any) {
          console.warn('Failed to parse dataTransfer data:', parseError);
        }
      }

      if (!component) {
        console.warn('🎵 Drop cancelled: No component data available');
        setDraggedComponent(null);
        setDragError(null);
        return;
      }
      
      console.log('🎵 Drop at beat:', dropBeat);
      console.log('🔍 Component data being transferred:');
      console.log('  - Name:', component.name);
      console.log('  - Type:', component.type);
      console.log('  - Melody length:', component.melody?.length);
      console.log('  - Rhythm length:', component.rhythm?.length);
      console.log('  - NoteValues length:', component.noteValues?.length);
      console.log('  - HarmonyNotes:', component.harmonyNotes ? `${component.harmonyNotes.length} chords` : 'none');
      console.log('  - Instrument:', component.instrument || 'not specified');
      console.log('  - Metadata:', component.metadata ? 'present' : 'none');
      
      const newTrack: SongTrack = {
        id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: component.name,
        type: component.type,
        startTime: dropBeat,
        endTime: dropBeat + component.duration,
        volume: 80,
        muted: false,
        solo: false,
        color: component.color,
        instrument: component.instrument || 'piano', // CRITICAL FIX: Use component's instrument
        melody: component.melody,
        rhythm: component.rhythm,
        noteValues: component.noteValues,
        harmonyNotes: component.harmonyNotes, // CRITICAL: Include harmony chord data for full playback
        metadata: component.metadata // COMPLETE DATA TRANSFER: Preserve all metadata
      };
      
      console.log('✅ Track created with:');
      console.log('  - Instrument:', newTrack.instrument);
      console.log('  - HarmonyNotes:', newTrack.harmonyNotes ? `${newTrack.harmonyNotes.length} chords` : 'none');
      console.log('  - Metadata:', newTrack.metadata ? 'preserved' : 'none');

      setSong(prevSong => {
        // Timeline expands automatically to accommodate dropped position
        const newTotalDuration = Math.max(prevSong.totalDuration, newTrack.endTime + 32);
        return {
          ...prevSong,
          tracks: [...prevSong.tracks, newTrack],
          totalDuration: newTotalDuration,
          lastModified: new Date().toISOString()
        };
      });

      setDraggedComponent(null);
      setDragError(null);
      saveToHistory(`Added track: ${component.name}`);
      toast.success(`✅ Added "${component.name}" at beat ${dropBeat.toFixed(2)} - Timeline expanded`);
    } catch (error: any) {
      console.error('Drop error:', error);
      setDragError(`Failed to drop track: ${error.message}`);
      toast.error('Failed to add track to timeline');
    }
  }, [draggedComponent, draggedTrack, pixelsPerBeat, snapToGrid, saveToHistory]);

  // Track controls
  const updateTrack = useCallback((trackId: string, updates: Partial<SongTrack>) => {
    setSong(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => t.id === trackId ? { ...t, ...updates } : t),
      lastModified: new Date().toISOString()
    }));
    saveToHistory(`Updated track`);
  }, [saveToHistory]);

  const deleteTrack = useCallback((trackId: string) => {
    const track = song.tracks.find(t => t.id === trackId);
    setSong(prev => ({
      ...prev,
      tracks: prev.tracks.filter(t => t.id !== trackId),
      lastModified: new Date().toISOString()
    }));
    saveToHistory(`Deleted track: ${track?.name || 'track'}`);
    toast.success('Track deleted');
  }, [song.tracks, saveToHistory]);

  const exportSong = useCallback(() => {
    if (song.tracks.length === 0) {
      toast.warning('Add some tracks before exporting');
      return;
    }
    
    onExportSong(song);
  }, [song, onExportSong]);

  // Component audition/preview - plays the component exactly as it will sound on the timeline
  const handleAuditionComponent = useCallback(async (component: AvailableComponent) => {
    try {
      const controller = auditionControllerRef.current;

      // If already playing this component, stop it
      if (auditioningComponentId === component.id && controller.getIsPlaying()) {
        console.log('🎵 [Audition] Stopping', component.name);
        controller.stop();
        setAuditioningComponentId(null);
        toast.info(`Stopped: ${component.name}`);
        return;
      }

      // Stop any current audition
      if (controller.getIsPlaying()) {
        controller.stop();
      }

      console.log('🎵 [Audition] Playing', component.name);
      console.log('  Melody:', component.melody.length, 'notes');
      console.log('  Rhythm format:', component.noteValues ? 'NoteValue[]' : 'Rhythm[]');
      console.log('  Has rhythm data:', !!(component.rhythm || component.noteValues));
      console.log('  Has harmonyNotes:', !!component.harmonyNotes);

      // Set auditioning state
      setAuditioningComponentId(component.id);

      // SPECIAL HANDLING FOR HARMONY COMPONENTS - Play all chord notes simultaneously
      if (component.harmonyNotes && Array.isArray(component.harmonyNotes) && component.harmonyNotes.length > 0) {
        console.log('  🎼 HARMONY component detected - playing full chords');
        
        // Create playback parts with harmonyNotes expanded into separate voices
        const harmonyParts: PlaybackPart[] = [];
        
        // Determine maximum voices in any chord
        let maxVoices = 0;
        component.harmonyNotes.forEach(chordNotes => {
          if (chordNotes.length > maxVoices) {
            maxVoices = chordNotes.length;
          }
        });
        
        console.log(`    Creating ${maxVoices} voice parts for harmony`);
        
        // Create one part for each voice position (bass, tenor, alto, soprano, etc.)
        for (let voiceIndex = 0; voiceIndex < maxVoices; voiceIndex++) {
          const voiceMelody: number[] = [];
          const voiceRhythm: number[] = [];
          
          component.harmonyNotes.forEach((chordNotes, chordIndex) => {
            if (voiceIndex < chordNotes.length) {
              voiceMelody.push(chordNotes[voiceIndex]);
            } else {
              voiceMelody.push(-1); // Rest if this voice doesn't have a note
            }
            voiceRhythm.push(component.rhythm[chordIndex] || 1);
          });
          
          harmonyParts.push({
            melody: voiceMelody,
            rhythm: voiceRhythm,
            instrument: 'piano',
            volume: 1.0,
            muted: false
          });
        }
        
        console.log(`    Created ${harmonyParts.length} harmony voice parts`);
        
        // Play all voices together
        await controller.play(harmonyParts, song.tempo, {
          onComplete: () => {
            console.log('🎵 [Audition] Harmony completed', component.name);
            setAuditioningComponentId(null);
            toast.success(`Finished: ${component.name}`);
          }
        });
      } else {
        // Standard component (non-harmony) - Build playback part with EXACT same data
        const part: PlaybackPart = {
          melody: component.melody,
          rhythm: component.rhythm,
          noteValues: component.noteValues,
          instrument: 'piano', // Default instrument for audition
          volume: 1,
          muted: false
        };

        // Play using unified playback system - this ensures it sounds EXACTLY the same
        await controller.play([part], song.tempo, {
          onComplete: () => {
            console.log('🎵 [Audition] Completed', component.name);
            setAuditioningComponentId(null);
            toast.success(`Finished: ${component.name}`);
          }
        });
      }

      toast.info(`Playing: ${component.name}`);
    } catch (error) {
      console.error('❌ [Audition] Error:', error);
      setAuditioningComponentId(null);
      toast.error('Failed to audition component');
    }
  }, [auditioningComponentId, song.tempo]);

  return (
    <div className="space-y-6">
      {/* Song Info */}
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Song Title</Label>
            <Input
              value={song.title}
              onChange={(e) => {
                setSong(prev => ({ ...prev, title: e.target.value, lastModified: new Date().toISOString() }));
                saveToHistory('Changed song title');
              }}
              placeholder="Enter song title..."
            />
          </div>
          <div>
            <Label>Composer</Label>
            <Input
              value={song.composer}
              onChange={(e) => {
                setSong(prev => ({ ...prev, composer: e.target.value, lastModified: new Date().toISOString() }));
                saveToHistory('Changed composer');
              }}
              placeholder="Enter composer name..."
            />
          </div>
          <div>
            <Label>Tempo (BPM)</Label>
            <div className="flex gap-2 items-center">
              <Slider
                value={[song.tempo]}
                onValueChange={([value]) => {
                  setSong(prev => ({ ...prev, tempo: value, lastModified: new Date().toISOString() }));
                  saveToHistory(`Changed tempo to ${value} BPM`);
                }}
                min={40}
                max={240}
                step={1}
                className="flex-1"
              />
              <Badge variant="outline" className="w-16 justify-center">
                {song.tempo}
              </Badge>
            </div>
          </div>
          <div>
            <Label>Time Signature</Label>
            <Select
              value={song.timeSignature}
              onValueChange={(value) => {
                setSong(prev => ({ ...prev, timeSignature: value, lastModified: new Date().toISOString() }));
                saveToHistory(`Changed time signature to ${value}`);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2/4">2/4</SelectItem>
                <SelectItem value="3/4">3/4</SelectItem>
                <SelectItem value="4/4">4/4</SelectItem>
                <SelectItem value="5/4">5/4</SelectItem>
                <SelectItem value="6/8">6/8</SelectItem>
                <SelectItem value="7/8">7/8</SelectItem>
                <SelectItem value="9/8">9/8</SelectItem>
                <SelectItem value="12/8">12/8</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* ========== PHASE 1 & 2 & 3 DAW CONTROLS ========== */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold">Professional DAW Controls</h3>
          <Badge variant="secondary" className="text-xs">All Features Active</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Phase 1 Feature 1: Measure Length Control */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-600" />
              <Label className="text-sm font-medium">Song Length</Label>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  value={targetMeasures}
                  onChange={(e) => setTargetMeasures(parseInt(e.target.value) || 8)}
                  min={1}
                  max={999}
                  className="w-20 text-sm"
                />
                <span className="text-xs text-muted-foreground">measures</span>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExactMeasures(targetMeasures)}
                  className="flex-1 text-xs h-7"
                >
                  Set
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => extendSongByMeasures(4)}
                  className="flex-1 text-xs h-7"
                >
                  +4
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={trimToFit}
                  className="flex-1 text-xs h-7"
                >
                  Trim
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Current: {Math.ceil(song.totalDuration / beatsPerMeasure)} measures ({song.totalDuration} beats)
              </div>
            </div>
          </Card>

          {/* Phase 1 Feature 2: Grid Snapping */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Grid3x3 className="w-4 h-4 text-green-600" />
              <Label className="text-sm font-medium">Grid Snap</Label>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={gridSnapEnabled}
                  onChange={(e) => setGridSnapEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-xs">Snap Enabled</span>
              </div>
              <Select
                value={gridSnapDivision}
                onValueChange={(value) => setGridSnapDivision(value as GridSnap)}
                disabled={!gridSnapEnabled}
              >
                <SelectTrigger className="text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="measure">1 Measure</SelectItem>
                  <SelectItem value="half">1/2 Note</SelectItem>
                  <SelectItem value="quarter">1/4 Note</SelectItem>
                  <SelectItem value="eighth">1/8 Note</SelectItem>
                  <SelectItem value="sixteenth">1/16 Note</SelectItem>
                  <SelectItem value="triplet">Triplet</SelectItem>
                </SelectContent>
              </Select>
              {gridSnapEnabled && gridSnapDivision !== 'off' && (
                <div className="text-xs text-green-600">
                  Snapping to {gridSnapDivision === 'measure' ? beatsPerMeasure : 
                    gridSnapDivision === 'half' ? beatsPerMeasure / 2 :
                    gridSnapDivision === 'quarter' ? 1 :
                    gridSnapDivision === 'eighth' ? 0.5 :
                    gridSnapDivision === 'sixteenth' ? 0.25 : 0.33} beat{getSnapDivisionBeats() !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </Card>

          {/* Phase 2 Feature 4: Arrangement Markers */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bookmark className="w-4 h-4 text-amber-600" />
              <Label className="text-sm font-medium">Markers</Label>
              <Badge variant="outline" className="text-xs">{arrangementMarkers.length}</Badge>
            </div>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setNewMarkerBeat(currentBeat);
                  setShowMarkerDialog(!showMarkerDialog);
                }}
                className="w-full text-xs h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Marker
              </Button>
              {showMarkerDialog && (
                <div className="space-y-2 p-2 border rounded">
                  <Input
                    type="number"
                    value={newMarkerBeat}
                    onChange={(e) => setNewMarkerBeat(parseFloat(e.target.value) || 0)}
                    placeholder="Beat"
                    className="text-xs h-7"
                  />
                  <Select value={newMarkerName} onValueChange={setNewMarkerName}>
                    <SelectTrigger className="text-xs h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKER_PRESETS.map(preset => (
                        <SelectItem key={preset.name} value={preset.name}>{preset.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={addMarker} className="flex-1 text-xs h-6">Add</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowMarkerDialog(false)} className="flex-1 text-xs h-6">Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Phase 3 Feature 10: Tempo Automation */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="w-4 h-4 text-purple-600" />
              <Label className="text-sm font-medium">Tempo Auto</Label>
              <Badge variant="outline" className="text-xs">{tempoPoints.length}</Badge>
            </div>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowTempoAutomation(!showTempoAutomation)}
                className="w-full text-xs h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Tempo Point
              </Button>
              {showTempoAutomation && (
                <div className="space-y-2 p-2 border rounded">
                  <Input
                    type="number"
                    value={newTempoPointBeat}
                    onChange={(e) => setNewTempoPointBeat(parseFloat(e.target.value) || 0)}
                    placeholder="Beat"
                    className="text-xs h-7"
                  />
                  <Input
                    type="number"
                    value={newTempoPointTempo}
                    onChange={(e) => setNewTempoPointTempo(parseInt(e.target.value) || 120)}
                    placeholder="Tempo"
                    min={40}
                    max={240}
                    className="text-xs h-7"
                  />
                  <div className="flex gap-1">
                    <Button size="sm" onClick={addTempoPoint} className="flex-1 text-xs h-6">Add</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowTempoAutomation(false)} className="flex-1 text-xs h-6">Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Phase 3 Feature 7 & 8: Multi-Select and Undo/Redo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={multiSelectMode ? 'default' : 'outline'}
              onClick={() => {
                setMultiSelectMode(!multiSelectMode);
                if (!multiSelectMode) {
                  toast.info('Multi-select mode: Click tracks to select multiple');
                } else {
                  setSelectedTrackIds(new Set());
                }
              }}
              className="flex-1 text-xs"
            >
              <CheckSquare className="w-3 h-3 mr-1" />
              Multi-Select {selectedTrackIds.size > 0 && `(${selectedTrackIds.size})`}
            </Button>
            {selectedTrackIds.size > 1 && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={duplicateSelectedTracks}
                  className="text-xs"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={deleteSelectedTracks}
                  className="text-xs text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
          
          <div className="flex gap-2 items-center justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={undo}
              disabled={historyIndex <= 0}
              className="text-xs"
            >
              <Undo className="w-3 h-3 mr-1" />
              Undo
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={redo}
              disabled={historyIndex >= historyStack.length - 1}
              className="text-xs"
            >
              <Redo className="w-3 h-3 mr-1" />
              Redo
            </Button>
            {historyStack.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {historyIndex + 1}/{historyStack.length}
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Playback Controls */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold">Playback Controls</h3>
              {soundfontReady && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Headphones className="w-3 h-3" />
                  Soundfont Ready
                </Badge>
              )}
              {tempoPoints.length > 0 && (
                <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-950/20">
                  Tempo Auto Active
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetPlayback}
                disabled={currentBeat === 0}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              {!isPlaying ? (
                <Button
                  onClick={startPlayback}
                  disabled={song.tracks.length === 0 || !soundfontReady}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  Play
                </Button>
              ) : (
                <Button
                  onClick={pausePlayback}
                  variant="outline"
                  className="gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={stopPlayback}
                disabled={!isPlaying}
              >
                <Square className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <Progress 
              value={(currentBeat / song.totalDuration) * 100} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Beat: {currentBeat.toFixed(2)} / {song.totalDuration}</span>
              <span>Time: {currentTime.toFixed(2)}s / {(song.totalDuration * 60 / song.tempo).toFixed(2)}s</span>
            </div>
          </div>

          {/* Volume control */}
          <div className="flex gap-4 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Slider
              value={[volume * 100]}
              onValueChange={([value]) => setVolume(value / 100)}
              max={100}
              step={1}
              className="flex-1"
            />
            <Badge variant="outline" className="w-12 justify-center">
              {Math.round(volume * 100)}%
            </Badge>
          </div>

          {/* Phase 2 Feature 6: Enhanced Loop Region */}
          <div className="flex gap-2 items-center">
            <input
              type="checkbox"
              checked={song.loopEnabled}
              onChange={(e) => {
                setSong(prev => ({ ...prev, loopEnabled: e.target.checked, lastModified: new Date().toISOString() }));
                setLoopRegionVisible(e.target.checked);
                saveToHistory(e.target.checked ? 'Enabled loop' : 'Disabled loop');
              }}
              className="w-4 h-4"
            />
            <Label className="text-sm">Loop Region</Label>
            {song.loopEnabled && (
              <div className="flex gap-2 items-center ml-4">
                <Input
                  type="number"
                  value={song.loopStart}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setSong(prev => ({ ...prev, loopStart: val, lastModified: new Date().toISOString() }));
                  }}
                  className="w-20 h-7 text-xs"
                  placeholder="Start"
                />
                <span className="text-xs">to</span>
                <Input
                  type="number"
                  value={song.loopEnd}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 16;
                    setSong(prev => ({ ...prev, loopEnd: val, lastModified: new Date().toISOString() }));
                  }}
                  className="w-20 h-7 text-xs"
                  placeholder="End"
                />
                <Badge variant="outline" className="text-xs">
                  {(song.loopEnd - song.loopStart).toFixed(1)} beats
                </Badge>
              </div>
            )}
          </div>

          {audioError && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {audioError}
            </div>
          )}
        </div>
      </Card>

      {/* Available Components */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Available Components</h3>
            <Badge variant="secondary">{availableComponents.length}</Badge>
            {selectedComponentIds.size > 0 && (
              <Badge variant="default" className="bg-blue-600">
                {selectedComponentIds.size} selected
              </Badge>
            )}
          </div>
          {selectedComponentIds.size > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearComponentSelection}
                className="text-xs h-7"
              >
                Clear
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={addSelectedComponents}
                className="text-xs h-7 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Selected ({selectedComponentIds.size})
              </Button>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground mb-3 bg-blue-50 dark:bg-blue-950/20 p-2 rounded border border-blue-200 dark:border-blue-800">
          💡 <strong>Multi-select tip:</strong> Hold Ctrl (or Cmd on Mac) and click components to select multiple, then click "Add Selected" to add them all at once!
        </div>

        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {availableComponents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No components available</p>
                <p className="text-xs">Create themes, imitations, or fugues to get started</p>
              </div>
            ) : (
              availableComponents.map((component) => {
                const isSelected = selectedComponentIds.has(component.id);
                return (
                  <motion.div
                    key={component.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e as any, component)}
                    onDragEnd={handleDragEnd as any}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComponentSelection(component.id, e.ctrlKey || e.metaKey);
                    }}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-950/40 border-blue-500 dark:border-blue-400 shadow-md'
                        : 'hover:bg-accent/50 border-border'
                    }`}
                    style={{ 
                      borderColor: isSelected ? undefined : component.color,
                      borderWidth: isSelected ? '2px' : '1px'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: component.color }}
                          />
                          <span className={`font-medium text-sm ${isSelected ? 'text-blue-900 dark:text-blue-100' : ''}`}>
                            {component.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {component.melody.length} notes
                          </Badge>
                          {component.noteValues && (
                            <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950/20">
                              🎵 Rhythm
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {component.description}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant={auditioningComponentId === component.id ? "default" : "ghost"}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAuditionComponent(component);
                          }}
                          className={`text-xs ${auditioningComponentId === component.id ? 'bg-green-600 hover:bg-green-700' : ''}`}
                          title={auditioningComponentId === component.id ? 'Stop preview' : 'Preview how this will sound'}
                        >
                          {auditioningComponentId === component.id ? (
                            <>
                              <Square className="w-3 h-3 mr-1" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Play
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            addTrackToTimeline(component);
                          }}
                          className="text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Timeline</h3>
            <Badge variant="secondary">{song.tracks.length} tracks</Badge>
            <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950/20 border-green-300">
              ∞ Unlimited Space
            </Badge>
            {furthestTrackEnd > 64 && (
              <Badge variant="outline" className="text-xs">
                {Math.ceil(furthestTrackEnd / beatsPerMeasure)} measures
              </Badge>
            )}
            {gridSnapEnabled && gridSnapDivision !== 'off' && (
              <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950/20">
                Grid: {gridSnapDivision}
              </Badge>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground">Zoom:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimelineZoom(Math.max(0.5, timelineZoom - 0.25))}
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Badge variant="outline" className="min-w-[60px] justify-center">
              {Math.round(timelineZoom * 100)}%
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimelineZoom(Math.min(4, timelineZoom + 0.25))}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div
          ref={timelineRef}
          className="border rounded-lg p-4 bg-muted/20 relative overflow-auto"
          style={{ 
            minHeight: `${Math.max(timelineHeight, autoHeight)}px`,
            maxHeight: '80vh', // Allow vertical scrolling beyond viewport
            width: '100%'
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Timeline ruler - extends to accommodate all content */}
          <div className="flex border-b pb-2 mb-4" style={{ minWidth: `${timelineWidth}px` }}>
            {Array.from({ length: Math.ceil(dynamicTotalDuration / beatsPerMeasure) }).map((_, i) => (
              <div
                key={i}
                className="text-xs text-muted-foreground"
                style={{ width: `${beatsPerMeasure * pixelsPerBeat}px` }}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Phase 2 Feature 6: Visual Loop Region */}
          {song.loopEnabled && loopRegionVisible && (
            <div
              className="absolute top-0 bottom-0 bg-blue-500/10 border-l-2 border-r-2 border-blue-500 pointer-events-none z-10"
              style={{
                left: `${song.loopStart * pixelsPerBeat}px`,
                width: `${(song.loopEnd - song.loopStart) * pixelsPerBeat}px`
              }}
            >
              <div className="absolute top-2 left-2 text-xs font-medium text-blue-600 bg-white dark:bg-slate-900 px-2 py-1 rounded">
                LOOP
              </div>
            </div>
          )}

          {/* Phase 2 Feature 4: Arrangement Markers */}
          {arrangementMarkers.map(marker => (
            <div
              key={marker.id}
              className="absolute top-0 bottom-0 w-0.5 pointer-events-none z-20"
              style={{
                left: `${marker.beat * pixelsPerBeat}px`,
                backgroundColor: marker.color
              }}
            >
              <div 
                className="absolute top-2 left-1 text-xs font-medium px-2 py-1 rounded shadow-sm pointer-events-auto cursor-pointer"
                style={{ backgroundColor: marker.color, color: 'white' }}
                onClick={() => deleteMarker(marker.id)}
              >
                {marker.name}
              </div>
            </div>
          ))}

          {/* Phase 3 Feature 10: Tempo Points Visualization */}
          {tempoPoints.map(point => (
            <div
              key={point.id}
              className="absolute top-0 w-0.5 h-8 bg-purple-500 pointer-events-auto cursor-pointer z-15"
              style={{
                left: `${point.beat * pixelsPerBeat}px`
              }}
              onClick={() => deleteTempoPoint(point.id)}
            >
              <div className="absolute top-10 left-1 text-xs font-medium px-2 py-1 rounded shadow-sm bg-purple-500 text-white">
                {point.tempo} BPM
              </div>
            </div>
          ))}

          {/* Tracks - full width container for unlimited horizontal expansion */}
          <div className="space-y-2 relative" style={{ minWidth: `${timelineWidth}px`, minHeight: `${autoHeight - 150}px` }}>
            {song.tracks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Layers className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Drop components here to build your song</p>
                <p className="text-xs">Or click the + button on any component above</p>
                <p className="text-xs mt-2 font-medium text-indigo-600">Timeline expands automatically - no limits!</p>
              </div>
            ) : (
              song.tracks.map((track) => {
                const trackHeight = trackHeights.get(track.id) || 60;
                const isSelected = selectedTrackIds.has(track.id) || selectedTrackId === track.id;
                
                return (
                  <motion.div
                    key={track.id}
                    layout
                    draggable
                    onDragStart={(e) => handleTrackDragStart(e as any, track)}
                    onDragEnd={handleTrackDragEnd as any}
                    className={`relative border rounded-lg p-2 cursor-move hover:shadow-md transition-shadow ${
                      isSelected ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    style={{
                      backgroundColor: `${track.color}20`,
                      borderColor: track.color,
                      marginLeft: `${track.startTime * pixelsPerBeat}px`,
                      width: `${(track.endTime - track.startTime) * pixelsPerBeat}px`,
                      height: `${trackHeight}px`,
                      opacity: draggedTrack?.id === track.id ? 0.5 : 1
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTrackSelection(track.id, e.ctrlKey || e.metaKey);
                    }}
                  >
                    <div className="flex items-center justify-between h-full">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{track.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {track.melody.length} notes • {track.instrument} • Beat {track.startTime}-{track.endTime}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {/* Phase 1 Feature 3: Track Duplication Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateTrack(track.id);
                          }}
                          className="h-6 w-6 p-0"
                          title="Duplicate Track"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        {/* Phase 3 Feature 9: Track Color Picker */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setColorPickerTrackId(track.id);
                            setShowColorPicker(true);
                          }}
                          className="h-6 w-6 p-0"
                          title="Change Color"
                        >
                          <Palette className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateTrack(track.id, { muted: !track.muted });
                          }}
                          className="h-6 w-6 p-0"
                        >
                          {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTrack(track.id);
                          }}
                          className="h-6 w-6 p-0 text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Phase 2 Feature 5: Resize Handle */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-white/20"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setResizingTrackId(track.id);
                        const startY = e.clientY;
                        const startHeight = trackHeight;
                        
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const deltaY = moveEvent.clientY - startY;
                          const newHeight = Math.max(40, Math.min(200, startHeight + deltaY));
                          setTrackHeights(prev => new Map(prev).set(track.id, newHeight));
                        };
                        
                        const handleMouseUp = () => {
                          setResizingTrackId(null);
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <div className="w-full h-1 bg-white/40 dark:bg-black/40 rounded-full" />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Playhead */}
          {isPlaying && (
            <motion.div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-30"
              style={{
                left: `${currentBeat * pixelsPerBeat}px`
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}
        </div>
        
        {/* Helpful tip */}
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              💡 Tip
            </Badge>
            <span>
              Drag tracks anywhere - the timeline expands automatically! Scroll horizontally and vertically as needed.
              {gridSnapEnabled && ` Grid snapping to ${gridSnapDivision}.`}
            </span>
          </div>
          {song.tracks.length > 0 && (
            <span>
              Total duration: {Math.ceil(furthestTrackEnd)} beats ({Math.ceil(furthestTrackEnd / beatsPerMeasure)} measures)
            </span>
          )}
        </div>
      </Card>

      {/* Phase 3 Feature 9: Color Picker Dialog */}
      {showColorPicker && colorPickerTrackId && (
        <Card className="p-4 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Track Color</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowColorPicker(false);
                  setColorPickerTrackId(null);
                }}
              >
                ✕
              </Button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {TRACK_COLORS.map(color => (
                <button
                  key={color.value}
                  className="w-10 h-10 rounded border-2 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  onClick={() => {
                    updateTrack(colorPickerTrackId, { color: color.value });
                    setShowColorPicker(false);
                    setColorPickerTrackId(null);
                    toast.success(`Track color changed to ${color.name}`);
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Selected Track Properties */}
      {selectedTrackId && song.tracks.find(t => t.id === selectedTrackId) && (
        <Card className="p-6">
          {(() => {
            const selectedTrack = song.tracks.find(t => t.id === selectedTrackId);
            if (!selectedTrack) return null;
            
            return (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">Track Properties</h3>
                    <Badge variant="outline" style={{ borderColor: selectedTrack.color }}>
                      {selectedTrack.name}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTrackId(null)}
                  >
                    Close
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Track Name</Label>
                    <Input
                      value={selectedTrack.name}
                      onChange={(e) => updateTrack(selectedTrack.id, { name: e.target.value })}
                      placeholder="Track name..."
                    />
                  </div>
                  <div>
                    <Label>Instrument</Label>
                    <Select
                      value={selectedTrack.instrument || 'piano'}
                      onValueChange={(value) => updateTrack(selectedTrack.id, { instrument: value as InstrumentType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="piano">Piano</SelectItem>
                        <SelectItem value="harpsichord">Harpsichord</SelectItem>
                        <SelectItem value="organ">Organ</SelectItem>
                        <SelectItem value="guitar">Guitar</SelectItem>
                        <SelectItem value="bass">Bass</SelectItem>
                        <SelectItem value="violin">Violin</SelectItem>
                        <SelectItem value="viola">Viola</SelectItem>
                        <SelectItem value="cello">Cello</SelectItem>
                        <SelectItem value="strings">String Ensemble</SelectItem>
                        <SelectItem value="trumpet">Trumpet</SelectItem>
                        <SelectItem value="trombone">Trombone</SelectItem>
                        <SelectItem value="french_horn">French Horn</SelectItem>
                        <SelectItem value="flute">Flute</SelectItem>
                        <SelectItem value="clarinet">Clarinet</SelectItem>
                        <SelectItem value="oboe">Oboe</SelectItem>
                        <SelectItem value="bassoon">Bassoon</SelectItem>
                        <SelectItem value="choir">Choir</SelectItem>
                        <SelectItem value="vibraphone">Vibraphone</SelectItem>
                        <SelectItem value="marimba">Marimba</SelectItem>
                        <SelectItem value="xylophone">Xylophone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Start Time (beats)</Label>
                    <Input
                      type="number"
                      value={selectedTrack.startTime}
                      onChange={(e) => {
                        const newStart = parseFloat(e.target.value) || 0;
                        const duration = selectedTrack.endTime - selectedTrack.startTime;
                        updateTrack(selectedTrack.id, { 
                          startTime: Math.max(0, newStart),
                          endTime: Math.max(0, newStart) + duration
                        });
                      }}
                      min={0}
                      step={0.25}
                    />
                  </div>
                  <div>
                    <Label>Volume</Label>
                    <div className="flex gap-2 items-center">
                      <Slider
                        value={[selectedTrack.volume]}
                        onValueChange={([value]) => updateTrack(selectedTrack.id, { volume: value })}
                        min={0}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <Badge variant="outline" className="w-12 justify-center">
                        {selectedTrack.volume}%
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-muted-foreground">
                  💡 Tip: Drag the track on the timeline to reposition it, or use the Start Time field above for precise positioning.
                  {gridSnapEnabled && ` Grid snapping is enabled (${gridSnapDivision}).`}
                </div>
              </>
            );
          })()}
        </Card>
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={exportSong}
          disabled={song.tracks.length === 0}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export as Song
        </Button>
      </div>
    </div>
  );
}
