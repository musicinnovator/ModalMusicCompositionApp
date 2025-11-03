/**
 * Professional DAW Timeline Component
 * 
 * Industry-standard timeline interface matching Ableton Live, Logic Pro, etc.
 * - Piano roll visualization
 * - Clip-based editing
 * - Professional mixer
 * - Accurate playback indicator
 * - Reliable data pipeline
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Music,
  Settings,
  Download,
  Maximize2,
  Minimize2,
  Copy,
  Clipboard,
  Scissors
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { 
  ProfessionalTimelineEngine, 
  TimelineProject, 
  TimelineTrack, 
  TimelineClip,
  TimelineNote,
  createEmptyProject,
  createEmptyTrack,
  createClipFromMelody,
  createClipFromHarmonyChords
} from '../lib/professional-timeline-engine';
import { getSoundfontEngine } from '../lib/soundfont-audio-engine';
import { AvailableComponent } from '../types/musical';

// ============================================================================
// INTERFACES
// ============================================================================

interface ProfessionalTimelineProps {
  availableComponents: AvailableComponent[];
  onExport?: (project: TimelineProject) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BEAT_WIDTH = 40; // pixels per beat (quarter note)
const TRACK_HEIGHT = 80; // pixels per track
const PIANO_ROLL_HEIGHT = 400; // pixels for expanded piano roll view
const GRID_SUBDIVISION = 4; // 4 subdivisions per beat (16th notes)

const MIDI_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function midiNoteToName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteName = MIDI_NOTE_NAMES[midi % 12];
  return `${noteName}${octave}`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ProfessionalTimeline({ availableComponents, onExport }: ProfessionalTimelineProps) {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [project, setProject] = useState<TimelineProject>(() => createEmptyProject());
  const [engine, setEngine] = useState<ProfessionalTimelineEngine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showMixer, setShowMixer] = useState(true);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [isMasterMuted, setIsMasterMuted] = useState(false);
  
  // ADDITIVE FIX: DAW-Style Clipboard for Copy/Paste Operations
  const [clipboard, setClipboard] = useState<TimelineClip | null>(null);
  const [copiedClipId, setCopiedClipId] = useState<string | null>(null);
  
  // ADDITIVE FIX: DAW-Style Auto-Scroll During Playback
  const [autoScroll, setAutoScroll] = useState(true); // Enable by default
  
  // ADDITIVE FIX: Click-to-Seek on Timeline
  const [clickInsertBeat, setClickInsertBeat] = useState<number>(0); // Where to insert new components
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const soundfontEngineRef = useRef<any>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  // Calculate beatWidth early so it can be used in effects and callbacks
  const beatWidth = BEAT_WIDTH * zoom;

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    let mounted = true;

    async function initializeEngine() {
      try {
        console.log('🎵 [ProfessionalTimeline] Initializing audio engine...');
        
        const audioEngine = await getSoundfontEngine();
        if (!mounted) return;
        
        soundfontEngineRef.current = audioEngine;
        
        const timelineEngine = new ProfessionalTimelineEngine(audioEngine, project);
        
        // Set up callbacks
        timelineEngine.setOnPlaybackUpdate((beat, playing) => {
          if (!mounted) return;
          setCurrentBeat(beat);
          setIsPlaying(playing);
        });
        
        timelineEngine.setOnPlaybackComplete(() => {
          if (!mounted) return;
          setIsPlaying(false);
          toast.success('Playback complete');
        });
        
        setEngine(timelineEngine);
        
        console.log('✅ [ProfessionalTimeline] Engine initialized');
        toast.success('Timeline ready');
        
      } catch (error) {
        console.error('❌ [ProfessionalTimeline] Initialization error:', error);
        toast.error('Failed to initialize timeline');
      }
    }

    initializeEngine();

    return () => {
      mounted = false;
      if (engine) {
        engine.destroy();
      }
    };
  }, []); // Only run once on mount

  // Update engine when project changes
  useEffect(() => {
    if (engine) {
      engine.setProject(project);
    }
  }, [project, engine]);

  // ============================================================================
  // ADDITIVE: DAW-STYLE AUTO-SCROLL DURING PLAYBACK
  // ============================================================================
  
  /**
   * Auto-scroll timeline to follow playhead during playback
   * Keeps playhead centered in viewport (like Ableton Live, Logic Pro)
   */
  useEffect(() => {
    if (!autoScroll || !isPlaying || !scrollContainerRef.current) {
      return;
    }
    
    // FIXED: Direct access to ScrollArea's viewport
    // ScrollArea from shadcn renders a viewport div that we can access
    let viewport: HTMLElement | null = null;
    
    // Try multiple approaches to find the scrollable element
    const radixViewport = scrollContainerRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    const directViewport = scrollContainerRef.current as HTMLElement;
    
    if (radixViewport) {
      viewport = radixViewport;
      console.log('📺 [Auto-Scroll] Using Radix viewport');
    } else if (directViewport && directViewport.scrollTo) {
      viewport = directViewport;
      console.log('📺 [Auto-Scroll] Using direct viewport');
    } else {
      console.warn('⚠️ [Auto-Scroll] Could not find viewport element');
      return;
    }
    
    // Calculate playhead position in pixels
    const playheadX = currentBeat * beatWidth;
    
    // Get viewport width
    const viewportWidth = viewport.clientWidth;
    
    // Calculate desired scroll position (keep playhead centered, or at 1/3 from left edge)
    const targetScroll = playheadX - (viewportWidth / 3);
    
    // Smooth scroll to position
    try {
      viewport.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
      
      console.log('📺 [Auto-Scroll] Following playhead:', {
        currentBeat: currentBeat.toFixed(2),
        playheadX: playheadX.toFixed(0),
        targetScroll: targetScroll.toFixed(0),
        viewportWidth,
        currentScrollLeft: viewport.scrollLeft
      });
    } catch (error) {
      console.error('❌ [Auto-Scroll] Error:', error);
    }
    
  }, [currentBeat, beatWidth, autoScroll, isPlaying]);

  // ============================================================================
  // TRANSPORT CONTROLS
  // ============================================================================

  const handlePlay = useCallback(() => {
    if (!engine) {
      toast.error('Engine not ready');
      return;
    }
    
    if (isPlaying) {
      engine.pause();
    } else {
      engine.play();
    }
  }, [engine, isPlaying]);

  const handleStop = useCallback(() => {
    if (!engine) return;
    engine.stop();
  }, [engine]);

  const handleSeek = useCallback((beat: number) => {
    if (!engine) return;
    engine.seek(beat);
    
    // ADDITIVE FIX: Update clickInsertBeat when seeking
    // This allows users to click timeline to set insert position
    setClickInsertBeat(Math.floor(beat)); // Round to whole beat
  }, [engine]);

  const handleTempoChange = useCallback((tempo: number) => {
    setProject(prev => ({ ...prev, tempo }));
  }, []);

  // ============================================================================
  // TRACK MANAGEMENT
  // ============================================================================

  const handleAddTrack = useCallback(() => {
    const newTrack = createEmptyTrack(`Track ${project.tracks.length + 1}`);
    setProject(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack]
    }));
    toast.success('Track added');
  }, [project.tracks.length]);

  const handleDeleteTrack = useCallback((trackId: string) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.filter(t => t.id !== trackId)
    }));
    toast.success('Track deleted');
  }, []);

  const handleTrackVolumeChange = useCallback((trackId: string, volume: number) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => 
        t.id === trackId ? { ...t, volume } : t
      )
    }));
  }, []);

  const handleTrackMuteToggle = useCallback((trackId: string) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => 
        t.id === trackId ? { ...t, muted: !t.muted } : t
      )
    }));
  }, []);

  const handleTrackSoloToggle = useCallback((trackId: string) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => 
        t.id === trackId ? { ...t, solo: !t.solo } : t
      )
    }));
  }, []);

  // ============================================================================
  // ADDITIVE: DAW-STYLE CLIP EDITING (Copy/Paste/Duplicate/Delete)
  // ============================================================================

  /**
   * Copy selected clip to clipboard
   * Deep copies ALL note data to preserve audio
   */
  const handleCopyClip = useCallback((clipId: string) => {
    try {
      const sourceClip = project.tracks
        .flatMap(t => t.clips)
        .find(c => c.id === clipId);
      
      if (!sourceClip) {
        toast.error('Clip not found');
        console.error('❌ [Timeline] Clip not found:', clipId);
        return;
      }
      
      // Deep copy ALL clip data - preserves audio!
      const clipCopy: TimelineClip = {
        ...sourceClip,
        // Deep copy notes array with new unique IDs
        notes: sourceClip.notes.map(note => ({
          ...note,
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }))
      };
      
      setClipboard(clipCopy);
      setCopiedClipId(clipId);
      
      console.log('📋 [Timeline] Clip copied to clipboard:', {
        clipName: clipCopy.name,
        noteCount: clipCopy.notes.length,
        clipId: clipId
      });
      
      toast.success(`Copied "${clipCopy.name}"`);
    } catch (error) {
      console.error('❌ [Timeline] Error copying clip:', error);
      toast.error('Failed to copy clip');
    }
  }, [project.tracks]);

  /**
   * Paste clip from clipboard to selected track
   * Creates new clip with all audio data at playhead position
   */
  const handlePasteClip = useCallback((targetTrackId?: string) => {
    try {
      if (!clipboard) {
        toast.error('Nothing to paste');
        return;
      }
      
      const trackId = targetTrackId || selectedTrackId;
      const targetTrack = project.tracks.find(t => t.id === trackId);
      
      if (!targetTrack) {
        toast.error('No track selected');
        console.error('❌ [Timeline] No target track for paste');
        return;
      }
      
      // Create new clip with ALL audio data
      const newClip: TimelineClip = {
        ...clipboard,
        id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        trackId: targetTrack.id,
        startBeat: currentBeat, // Place at playhead
        // Generate new unique IDs for all notes
        notes: clipboard.notes.map(note => ({
          ...note,
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }))
      };
      
      // Add clip to target track
      setProject(prev => ({
        ...prev,
        tracks: prev.tracks.map(t =>
          t.id === targetTrack.id
            ? { ...t, clips: [...t.clips, newClip] }
            : t
        )
      }));
      
      console.log('✅ [Timeline] Clip pasted:', {
        clipName: newClip.name,
        targetTrack: targetTrack.name,
        noteCount: newClip.notes.length,
        startBeat: newClip.startBeat
      });
      
      toast.success(`Pasted "${newClip.name}" to ${targetTrack.name}`);
      
      // Auto-select newly pasted clip
      setSelectedClipId(newClip.id);
    } catch (error) {
      console.error('❌ [Timeline] Error pasting clip:', error);
      toast.error('Failed to paste clip');
    }
  }, [clipboard, selectedTrackId, project.tracks, currentBeat]);

  /**
   * Duplicate clip in place (on same track)
   * Creates copy right after original with smart offset
   */
  const handleDuplicateClip = useCallback((clipId: string) => {
    try {
      const sourceClip = project.tracks
        .flatMap(t => t.clips)
        .find(c => c.id === clipId);
      
      if (!sourceClip) {
        toast.error('Clip not found');
        console.error('❌ [Timeline] Clip not found for duplicate:', clipId);
        return;
      }
      
      // Calculate clip length for smart offset
      const clipLength = sourceClip.notes.length > 0
        ? Math.max(...sourceClip.notes.map(n => n.startTime + n.duration))
        : 4; // Default to 4 beats if no notes
      
      // Create duplicate right after original
      const newClip: TimelineClip = {
        ...sourceClip,
        id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startBeat: sourceClip.startBeat + clipLength, // Smart offset
        name: `${sourceClip.name} (Copy)`,
        // Deep copy all notes with new IDs
        notes: sourceClip.notes.map(note => ({
          ...note,
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }))
      };
      
      // Add to same track
      setProject(prev => ({
        ...prev,
        tracks: prev.tracks.map(t =>
          t.id === sourceClip.trackId
            ? { ...t, clips: [...t.clips, newClip] }
            : t
        )
      }));
      
      console.log('✅ [Timeline] Clip duplicated:', {
        originalClip: sourceClip.name,
        newClip: newClip.name,
        offset: clipLength,
        noteCount: newClip.notes.length
      });
      
      toast.success(`Duplicated "${sourceClip.name}"`);
      
      // Auto-select new clip
      setSelectedClipId(newClip.id);
    } catch (error) {
      console.error('❌ [Timeline] Error duplicating clip:', error);
      toast.error('Failed to duplicate clip');
    }
  }, [project.tracks]);

  /**
   * Delete selected clip from timeline
   * Removes clip and clears selection if needed
   */
  const handleDeleteClip = useCallback((clipId: string) => {
    try {
      const clip = project.tracks
        .flatMap(t => t.clips)
        .find(c => c.id === clipId);
      
      if (!clip) {
        toast.error('Clip not found');
        console.error('❌ [Timeline] Clip not found for delete:', clipId);
        return;
      }
      
      setProject(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => ({
          ...t,
          clips: t.clips.filter(c => c.id !== clipId)
        }))
      }));
      
      console.log('🗑️ [Timeline] Clip deleted:', {
        clipName: clip.name,
        clipId: clipId
      });
      
      toast.success(`Deleted "${clip.name}"`);
      
      // Clear selection if deleted clip was selected
      if (selectedClipId === clipId) {
        setSelectedClipId(null);
      }
    } catch (error) {
      console.error('❌ [Timeline] Error deleting clip:', error);
      toast.error('Failed to delete clip');
    }
  }, [project.tracks, selectedClipId]);

  // ============================================================================
  // ADDITIVE: KEYBOARD SHORTCUTS FOR CLIP EDITING
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs or textareas
      const activeElement = document.activeElement;
      if (
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }
      
      // Detect platform (Mac uses Meta/Cmd, Windows/Linux uses Ctrl)
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdCtrl = isMac ? e.metaKey : e.ctrlKey;
      
      // Require clip selection for most operations
      if (!selectedClipId) return;
      
      try {
        // Cmd/Ctrl+C: Copy
        if (cmdCtrl && e.key.toLowerCase() === 'c') {
          e.preventDefault();
          handleCopyClip(selectedClipId);
          return;
        }
        
        // Cmd/Ctrl+V: Paste (doesn't require clip selection, just clipboard)
        if (cmdCtrl && e.key.toLowerCase() === 'v' && clipboard) {
          e.preventDefault();
          handlePasteClip();
          return;
        }
        
        // Cmd/Ctrl+D: Duplicate
        if (cmdCtrl && e.key.toLowerCase() === 'd') {
          e.preventDefault();
          handleDuplicateClip(selectedClipId);
          return;
        }
        
        // Delete/Backspace: Delete
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          handleDeleteClip(selectedClipId);
          return;
        }
        
        // Cmd/Ctrl+X: Cut (copy + delete)
        if (cmdCtrl && e.key.toLowerCase() === 'x') {
          e.preventDefault();
          handleCopyClip(selectedClipId);
          handleDeleteClip(selectedClipId);
          return;
        }
      } catch (error) {
        console.error('❌ [Timeline] Keyboard shortcut error:', error);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    selectedClipId,
    clipboard,
    handleCopyClip,
    handlePasteClip,
    handleDuplicateClip,
    handleDeleteClip
  ]);

  // ============================================================================
  // COMPONENT IMPORT (From Available Components)
  // ============================================================================

  const handleAddComponent = useCallback((component: AvailableComponent) => {
    console.log('📥 [Timeline] Adding component to timeline:', component);
    
    // CRITICAL FIX: Use clickInsertBeat instead of currentBeat for placement
    // currentBeat is the playhead position, clickInsertBeat is where user wants to insert
    const insertPosition = clickInsertBeat;
    
    // 🔍 ADDITIVE DEBUG: Log placement context
    console.log('🔍 [ADD DEBUG] Component placement context:', {
      componentName: component.name,
      insertPosition: insertPosition,
      currentPlayheadPosition: currentBeat,
      isPlaying: isPlaying
    });
    
    try {
      // ========================================================================
      // ADDITIVE FIX: Create a NEW track for each component (DAW-style)
      // ========================================================================
      // OLD BEHAVIOR: Reused tracks with same instrument (all clips stacked)
      // NEW BEHAVIOR: Each component gets its own track (clips visible separately)
      // BENEFIT: Vertical alignment = simultaneous, horizontal = sequential
      // ========================================================================
      
      const track = createEmptyTrack(
        component.name, // Use component name as track name
        component.instrument || 'piano'
      );
      
      // Add the new track to the project
      setProject(prev => ({
        ...prev,
        tracks: [...prev.tracks, track]
      }));

      // CHORD-AWARE CLIP CREATION
      // Detect harmony components and use chord converter
      let clip: TimelineClip;
      
      if (component.harmonyNotes && component.harmonyNotes.length > 0) {
        // HARMONY COMPONENT: Create clip with chords
        // Each element in harmonyNotes is a chord (multiple simultaneous notes)
        console.log('🎵 [Timeline] Creating harmony clip with chords:', {
          chordCount: component.harmonyNotes.length,
          firstChord: component.harmonyNotes[0]
        });
        
        clip = createClipFromHarmonyChords(
          track.id,
          component.name,
          component.harmonyNotes,
          component.rhythm,
          insertPosition  // FIXED: Use insertPosition
        );
      } else {
        // NON-HARMONY COMPONENT: Create clip with melody
        console.log('🎵 [Timeline] Creating melody clip:', {
          noteCount: component.melody.length
        });
        
        clip = createClipFromMelody(
          track.id,
          component.name,
          component.melody,
          component.rhythm,
          insertPosition  // FIXED: Use insertPosition
        );
      }

      // Add clip to the newly created track
      setProject(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => 
          t.id === track.id 
            ? { ...t, clips: [clip] } // New track gets this one clip
            : t
        )
      }));

      console.log('✅ [Timeline] Component added to NEW track:', {
        trackId: track.id,
        trackName: track.name,
        clipId: clip.id,
        noteCount: clip.notes.length,
        startBeat: insertPosition,
        isHarmony: !!(component.harmonyNotes && component.harmonyNotes.length > 0),
        totalTracks: project.tracks.length + 1
      });

      toast.success(`Added "${component.name}" on new track at beat ${insertPosition.toFixed(1)}`);
      
    } catch (error) {
      console.error('❌ [Timeline] Error adding component:', error);
      toast.error('Failed to add component');
    }
  }, [project.tracks, clickInsertBeat, currentBeat, isPlaying]); // FIXED: Added clickInsertBeat dependency

  // ============================================================================
  // RENDERING HELPERS
  // ============================================================================

  const projectEndBeat = useMemo(() => {
    let maxBeat = 32;
    for (const track of project.tracks) {
      for (const clip of track.clips) {
        const clipEnd = clip.startBeat + (clip.notes.length > 0 
          ? Math.max(...clip.notes.map(n => n.startTime + n.duration))
          : 0);
        maxBeat = Math.max(maxBeat, clipEnd);
      }
    }
    return Math.ceil(maxBeat / 4) * 4; // Round up to nearest bar
  }, [project.tracks]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card className="w-full">
      {/* HEADER */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Music className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-lg">Professional Timeline</h2>
              <p className="text-sm text-muted-foreground">
                DAW-Quality Multi-Track Sequencer
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={showMixer ? "default" : "outline"}
              onClick={() => setShowMixer(!showMixer)}
            >
              {showMixer ? <Minimize2 className="w-4 h-4 mr-2" /> : <Maximize2 className="w-4 h-4 mr-2" />}
              Mixer
            </Button>
            
            {onExport && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onExport(project)}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* TRANSPORT CONTROLS */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleStop}
              disabled={!isPlaying && currentBeat === 0}
            >
              <Square className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant={isPlaying ? "default" : "outline"}
              onClick={handlePlay}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSeek(0)}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-8" />
            
            <div className="flex items-center gap-2">
              <Label className="text-xs">Position:</Label>
              <Badge variant="outline">
                {Math.floor(currentBeat / 4) + 1}.{(currentBeat % 4) + 1}
              </Badge>
            </div>
          </div>

          {/* Tempo Control */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-xs">BPM:</Label>
              <Input
                type="number"
                min="40"
                max="240"
                value={project.tempo}
                onChange={(e) => handleTempoChange(parseInt(e.target.value) || 120)}
                className="w-20 h-8"
              />
            </div>

            {/* Zoom Control */}
            <div className="flex items-center gap-2">
              <Label className="text-xs">Zoom:</Label>
              <Slider
                value={[zoom]}
                onValueChange={([v]) => setZoom(v)}
                min={0.5}
                max={2}
                step={0.1}
                className="w-24"
              />
            </div>

            {/* Master Volume */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMasterMuted(!isMasterMuted)}
              >
                {isMasterMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider
                value={[masterVolume]}
                onValueChange={([v]) => setMasterVolume(v)}
                min={0}
                max={1}
                step={0.01}
                className="w-24"
                disabled={isMasterMuted}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ADDITIVE: CLIP EDITING TOOLBAR */}
      {selectedClipId && (
        <div className="px-4 py-2 border-b bg-blue-500/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Clip Selected
            </Badge>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-xs text-muted-foreground">
              {(() => {
                const clip = project.tracks
                  .flatMap(t => t.clips)
                  .find(c => c.id === selectedClipId);
                return clip ? clip.name : 'Unknown';
              })()}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopyClip(selectedClipId)}
              title="Copy (Cmd/Ctrl+C)"
              className="h-7"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDuplicateClip(selectedClipId)}
              title="Duplicate (Cmd/Ctrl+D)"
              className="h-7"
            >
              <Clipboard className="w-3 h-3 mr-1" />
              Duplicate
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                handleCopyClip(selectedClipId);
                handleDeleteClip(selectedClipId);
              }}
              title="Cut (Cmd/Ctrl+X)"
              className="h-7"
            >
              <Scissors className="w-3 h-3 mr-1" />
              Cut
            </Button>
            
            <Separator orientation="vertical" className="h-4 mx-1" />
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteClip(selectedClipId)}
              title="Delete (Del)"
              className="h-7 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* ADDITIVE: PASTE BUTTON (when clipboard has content) */}
      {clipboard && !selectedClipId && (
        <div className="px-4 py-2 border-b bg-green-500/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-green-500/10">
              Clipboard Ready
            </Badge>
            <span className="text-xs text-muted-foreground">
              "{clipboard.name}" ({clipboard.notes.length} notes)
            </span>
          </div>
          
          <Button
            size="sm"
            variant="default"
            onClick={() => handlePasteClip()}
            title="Paste to selected track (Cmd/Ctrl+V)"
            className="h-7"
            disabled={!selectedTrackId}
          >
            <Clipboard className="w-3 h-3 mr-1" />
            Paste to {selectedTrackId ? project.tracks.find(t => t.id === selectedTrackId)?.name || 'Track' : 'Selected Track'}
          </Button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex">
        {/* TRACK LIST & MIXER (Left Side) */}
        {showMixer && (
          <div className="w-64 border-r bg-muted/20">
            <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
              <span className="text-sm">Tracks</span>
              <Button size="sm" variant="ghost" onClick={handleAddTrack}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <ScrollArea className="h-[600px]">
              <div className="p-2 space-y-2">
                {project.tracks.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No tracks yet</p>
                    <p className="text-xs mt-1">Click + to add a track</p>
                  </div>
                ) : (
                  project.tracks.map((track, index) => (
                    <TrackMixerStrip
                      key={track.id}
                      track={track}
                      trackNumber={index + 1}
                      isSelected={selectedTrackId === track.id}
                      onSelect={() => setSelectedTrackId(track.id)}
                      onVolumeChange={(v) => handleTrackVolumeChange(track.id, v)}
                      onMuteToggle={() => handleTrackMuteToggle(track.id)}
                      onSoloToggle={() => handleTrackSoloToggle(track.id)}
                      onDelete={() => handleDeleteTrack(track.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* TIMELINE (Right Side) */}
        <div className="flex-1 overflow-hidden">
          <div ref={scrollContainerRef}>
            <ScrollArea className="h-[600px]">
              <div ref={timelineRef} className="relative p-4" style={{ minWidth: projectEndBeat * beatWidth + 100 }}>
                {/* RULER */}
                <div className="sticky top-0 z-10 bg-background border-b mb-2 pb-2">
                  <TimelineRuler
                    beats={projectEndBeat}
                    beatWidth={beatWidth}
                    currentBeat={currentBeat}
                    onSeek={handleSeek}
                  />
                </div>

                {/* PLAYHEAD */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                  style={{ left: currentBeat * beatWidth + 16 }}
                />

                {/* TRACKS */}
                <div className="space-y-2">
                  {project.tracks.length === 0 ? (
                    <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <Music className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="mb-2">Empty Timeline</p>
                        <p className="text-sm">Add tracks and components to get started</p>
                      </div>
                    </div>
                  ) : (
                    project.tracks.map((track) => (
                      <TimelineTrackView
                        key={track.id}
                        track={track}
                        beatWidth={beatWidth}
                        projectEnd={projectEndBeat}
                        isSelected={selectedTrackId === track.id}
                        selectedClipId={selectedClipId}
                        onSelectClip={setSelectedClipId}
                      />
                    ))
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* AVAILABLE COMPONENTS PANEL */}
      {availableComponents.length > 0 && (
        <div className="border-t p-4 bg-muted/20">
          <div className="mb-2">
            <Label className="text-xs text-muted-foreground">
              Available Components ({availableComponents.length})
            </Label>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {availableComponents.map((component, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddComponent(component)}
                  className="shrink-0"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {component.name}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {component.type}
                  </Badge>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// TRACK MIXER STRIP COMPONENT
// ============================================================================

interface TrackMixerStripProps {
  track: TimelineTrack;
  trackNumber: number;
  isSelected: boolean;
  onSelect: () => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onSoloToggle: () => void;
  onDelete: () => void;
}

function TrackMixerStrip({
  track,
  trackNumber,
  isSelected,
  onSelect,
  onVolumeChange,
  onMuteToggle,
  onSoloToggle,
  onDelete
}: TrackMixerStripProps) {
  return (
    <Card
      className={`p-2 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-500/5' : 'hover:bg-muted/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: track.color }}
          />
          <span className="text-xs truncate">{track.name}</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={track.muted ? "default" : "outline"}
            className="h-6 flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onMuteToggle();
            }}
          >
            M
          </Button>
          <Button
            size="sm"
            variant={track.solo ? "default" : "outline"}
            className="h-6 flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onSoloToggle();
            }}
          >
            S
          </Button>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Volume</Label>
          <Slider
            value={[track.volume]}
            onValueChange={([v]) => onVolumeChange(v)}
            min={0}
            max={1}
            step={0.01}
            className="mt-1"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="text-xs text-muted-foreground text-center mt-1">
            {Math.round(track.volume * 100)}%
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          {track.instrument}
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// TIMELINE RULER COMPONENT
// ============================================================================

interface TimelineRulerProps {
  beats: number;
  beatWidth: number;
  currentBeat: number;
  onSeek: (beat: number) => void;
}

function TimelineRuler({ beats, beatWidth, currentBeat, onSeek }: TimelineRulerProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const beat = x / beatWidth;
    onSeek(Math.max(0, beat));
  };

  return (
    <div
      className="relative h-8 bg-muted/30 rounded cursor-pointer"
      onClick={handleClick}
    >
      {Array.from({ length: Math.ceil(beats / 4) }).map((_, barIndex) => (
        <div
          key={barIndex}
          className="absolute top-0 bottom-0 flex items-center"
          style={{ left: barIndex * 4 * beatWidth }}
        >
          <div className="w-0.5 h-full bg-border" />
          <span className="ml-1 text-xs text-muted-foreground">
            {barIndex + 1}
          </span>
          
          {/* Beat markers */}
          {[1, 2, 3].map((beat) => (
            <div
              key={beat}
              className="absolute w-0.5 h-2 bg-border/50"
              style={{ left: beat * beatWidth }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// TIMELINE TRACK VIEW COMPONENT
// ============================================================================

interface TimelineTrackViewProps {
  track: TimelineTrack;
  beatWidth: number;
  projectEnd: number;
  isSelected: boolean;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
}

function TimelineTrackView({
  track,
  beatWidth,
  projectEnd,
  isSelected,
  selectedClipId,
  onSelectClip
}: TimelineTrackViewProps) {
  return (
    <div
      className={`relative h-${TRACK_HEIGHT} border rounded-lg overflow-hidden ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{ 
        height: TRACK_HEIGHT,
        minWidth: projectEnd * beatWidth 
      }}
    >
      {/* Track background grid */}
      <div className="absolute inset-0 bg-muted/10">
        {Array.from({ length: Math.ceil(projectEnd / 4) }).map((_, barIndex) => (
          <div
            key={barIndex}
            className="absolute top-0 bottom-0 border-l border-border/20"
            style={{ left: barIndex * 4 * beatWidth }}
          />
        ))}
      </div>

      {/* Clips */}
      {track.clips.map((clip) => (
        <TimelineClipView
          key={clip.id}
          clip={clip}
          beatWidth={beatWidth}
          isSelected={selectedClipId === clip.id}
          onSelect={() => onSelectClip(clip.id)}
        />
      ))}
    </div>
  );
}

// ============================================================================
// TIMELINE CLIP VIEW COMPONENT
// ============================================================================

interface TimelineClipViewProps {
  clip: TimelineClip;
  beatWidth: number;
  isSelected: boolean;
  onSelect: () => void;
}

function TimelineClipView({ clip, beatWidth, isSelected, onSelect }: TimelineClipViewProps) {
  const clipWidth = clip.notes.length > 0
    ? Math.max(...clip.notes.map(n => n.startTime + n.duration)) * beatWidth
    : beatWidth * 4;

  // Get note range for visualization
  const midiNotes = clip.notes.map(n => n.midiNote);
  const minNote = midiNotes.length > 0 ? Math.min(...midiNotes) : 60;
  const maxNote = midiNotes.length > 0 ? Math.max(...midiNotes) : 72;
  const noteRange = maxNote - minNote + 1;

  return (
    <div
      className={`absolute top-1 bottom-1 rounded overflow-hidden cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-white' : 'hover:opacity-90'
      } ${clip.muted ? 'opacity-40' : ''}`}
      style={{
        left: clip.startBeat * beatWidth,
        width: clipWidth,
        backgroundColor: clip.color + '40',
        borderLeft: `3px solid ${clip.color}`
      }}
      onClick={onSelect}
    >
      {/* Clip name */}
      <div className="absolute top-1 left-2 text-xs font-medium text-white drop-shadow">
        {clip.name}
      </div>

      {/* Simple note visualization */}
      <div className="absolute inset-0 pt-6">
        {clip.notes.map((note) => {
          const noteHeight = noteRange > 1 ? ((maxNote - note.midiNote) / noteRange) * 100 : 50;
          return (
            <div
              key={note.id}
              className="absolute bg-white/60 rounded-sm"
              style={{
                left: note.startTime * beatWidth,
                width: note.duration * beatWidth - 1,
                top: `${noteHeight}%`,
                height: '2px'
              }}
            />
          );
        })}
      </div>
    </div>
  );
}