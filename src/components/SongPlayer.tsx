import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Song, SongTrack, midiNoteToNoteName, isRest, isNote } from '../types/musical';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Music,
  Clock,
  Layers
} from 'lucide-react';
import { InstrumentType, ENHANCED_INSTRUMENTS } from '../lib/enhanced-synthesis';
import { toast } from 'sonner@2.0.3';

interface SongPlayerProps {
  song: Song;
  onSongUpdate?: (song: Song) => void;
}

export function SongPlayer({ song, onSongUpdate }: SongPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [masterVolume, setMasterVolume] = useState([150]); // Increased default master volume to 150% for excellent audibility (increased from 90% per user request)
  const [playbackRate, setPlaybackRate] = useState([1]);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const noteTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const isPlayingRef = useRef(false);

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }

    return () => {
      stopPlayback();
      // Clear all note timeouts
      noteTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      noteTimeoutsRef.current.clear();
    };
  }, []);

  // Update master volume with boost
  useEffect(() => {
    try {
      if (gainNodeRef.current) {
        const volumeValue = Array.isArray(masterVolume) && typeof masterVolume[0] === 'number' ? masterVolume[0] : 90;
        const normalizedVolume = Math.max(0, Math.min(100, volumeValue)) / 100;
        
        // Apply 3.75x multiplier for significantly louder output (raised 50% from 2.5)
        const boostedVolume = normalizedVolume * 3.75;
        gainNodeRef.current.gain.value = boostedVolume;
        
        console.log(`🔊 SongPlayer master volume: ${volumeValue}% (gain: ${boostedVolume.toFixed(2)})`);
      }
    } catch (error) {
      console.error('Error setting SongPlayer master volume:', error);
      toast.error('Failed to set master volume');
    }
  }, [masterVolume]);

  // Audio synthesis with boosted volume
  const playNote = useCallback((frequency: number, duration: number, volume: number = 0.9, delay: number = 0) => {
    try {
      if (!audioContextRef.current || !gainNodeRef.current) return;

      const oscillator = audioContextRef.current.createOscillator();
      const envelope = audioContextRef.current.createGain();
      
      oscillator.connect(envelope);
      envelope.connect(gainNodeRef.current);
      
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime + delay);
      oscillator.type = 'sine';
      
      const attackTime = 0.01;
      const releaseTime = 0.1;
      const sustainTime = Math.max(0.1, duration - attackTime - releaseTime);
      
      const startTime = audioContextRef.current.currentTime + delay;
      
      // Boost note volume by 1.5x for louder playback
      const boostedVolume = Math.min(1.0, volume * 1.5);
      
      envelope.gain.setValueAtTime(0, startTime);
      envelope.gain.linearRampToValueAtTime(boostedVolume, startTime + attackTime);
      envelope.gain.setValueAtTime(boostedVolume, startTime + attackTime + sustainTime);
      envelope.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    } catch (error) {
      console.error('Error playing note in SongPlayer:', error);
    }
  }, []);

  // Convert MIDI note to frequency
  const frequencyFromMidiNote = useCallback((midiNote: number): number => {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }, []);

  // Calculate total song duration in seconds
  const totalDurationSeconds = useCallback(() => {
    return (song.totalDuration / 4) * (60 / song.tempo);
  }, [song.totalDuration, song.tempo]);

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
  const playNotesAtBeat = useCallback((beat: number) => {
    const activeTracks = getActiveTracksAtTime(beat);
    const newActiveNotes = new Set<string>();

    activeTracks.forEach(track => {
      const relativeTime = beat - track.startTime;
      const melodyIndex = Math.floor(relativeTime);
      const rhythmIndex = Math.floor(relativeTime);

      // Check if we should play a note based on rhythm
      if (rhythmIndex < track.rhythm.length && track.rhythm[rhythmIndex] > 0) {
        // CRITICAL FIX: Check for harmonyNotes (full chord data) first
        if (track.harmonyNotes && rhythmIndex < track.harmonyNotes.length) {
          // This is a harmony track with chord data - play all notes in the chord
          const chordNotes = track.harmonyNotes[rhythmIndex];
          
          if (Array.isArray(chordNotes)) {
            chordNotes.forEach((note, chordNoteIndex) => {
              if (isNote(note) && typeof note === 'number' && note !== -1) {
                const frequency = frequencyFromMidiNote(note);
                const volume = (track.volume / 100) * 0.25; // Reduced volume for polyphony with multiple notes
                const noteDuration = 0.8; // 80% of beat duration
                
                playNote(frequency, noteDuration, volume);
                
                const noteId = `${track.id}-${rhythmIndex}-chord-${chordNoteIndex}`;
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
            });
          }
        } else if (melodyIndex < track.melody.length) {
          // Standard melody track - play single note
          const melodyElement = track.melody[melodyIndex];
          
          if (isNote(melodyElement) && typeof melodyElement === 'number') {
            const frequency = frequencyFromMidiNote(melodyElement);
            const volume = (track.volume / 100) * 0.3; // Reduced volume for polyphony
            const noteDuration = 0.8; // 80% of beat duration
            
            playNote(frequency, noteDuration, volume);
            
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
    });

    setActiveNotes(prev => new Set([...prev, ...newActiveNotes]));
  }, [getActiveTracksAtTime, frequencyFromMidiNote, playNote]);

  // Main playback loop
  const playbackLoop = useCallback(() => {
    if (!isPlayingRef.current) return;

    const beatsPerSecond = (song.tempo / 60) * 4; // 4 beats per measure
    const newBeat = currentTime * beatsPerSecond;
    
    setCurrentBeat(newBeat);
    
    // Check if we need to play notes
    const beatToPlay = Math.floor(newBeat);
    if (beatToPlay !== Math.floor((currentTime - 0.1) * beatsPerSecond)) {
      playNotesAtBeat(beatToPlay);
    }

    // Update time
    setCurrentTime(prev => {
      const newTime = prev + 0.1 * playbackRate[0];
      const maxTime = song.loopEnabled ? song.loopEnd / beatsPerSecond : totalDurationSeconds();
      
      if (newTime >= maxTime) {
        if (song.loopEnabled) {
          return song.loopStart / beatsPerSecond;
        } else {
          stopPlayback();
          return 0;
        }
      }
      
      return newTime;
    });
  }, [currentTime, song.tempo, song.loopEnabled, song.loopStart, song.loopEnd, playbackRate, totalDurationSeconds, playNotesAtBeat]);

  // Playback controls
  const startPlayback = useCallback(async () => {
    if (!audioContextRef.current) return;

    try {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      setIsPlaying(true);
      isPlayingRef.current = true;
      
      playbackIntervalRef.current = setInterval(playbackLoop, 100);
      
      toast.success(`Playing "${song.title}"`);
    } catch (error) {
      console.error('Error starting playback:', error);
      toast.error('Failed to start playback');
    }
  }, [playbackLoop, song.title]);

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
  }, []);

  const stopPlayback = useCallback(() => {
    pausePlayback();
    setCurrentTime(0);
    setCurrentBeat(0);
  }, [pausePlayback]);

  const seekTo = useCallback((timePercent: number) => {
    const newTime = (timePercent / 100) * totalDurationSeconds();
    setCurrentTime(newTime);
    setCurrentBeat(newTime * (song.tempo / 60) * 4);
    
    // Clear active notes when seeking
    noteTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    noteTimeoutsRef.current.clear();
    setActiveNotes(new Set());
  }, [totalDurationSeconds, song.tempo]);

  // Track controls
  const updateTrackVolume = useCallback((trackId: string, volume: number) => {
    if (onSongUpdate) {
      const updatedSong = {
        ...song,
        tracks: song.tracks.map(track => 
          track.id === trackId ? { ...track, volume } : track
        ),
        lastModified: new Date().toISOString()
      };
      onSongUpdate(updatedSong);
    }
  }, [song, onSongUpdate]);

  const updateTrackInstrument = useCallback((trackId: string, instrument: InstrumentType) => {
    if (onSongUpdate) {
      const updatedSong = {
        ...song,
        tracks: song.tracks.map(track => 
          track.id === trackId ? { ...track, instrument } : track
        ),
        lastModified: new Date().toISOString()
      };
      onSongUpdate(updatedSong);
    }
  }, [song, onSongUpdate]);

  const toggleTrackMute = useCallback((trackId: string) => {
    if (onSongUpdate) {
      const updatedSong = {
        ...song,
        tracks: song.tracks.map(track => 
          track.id === trackId ? { ...track, muted: !track.muted } : track
        ),
        lastModified: new Date().toISOString()
      };
      onSongUpdate(updatedSong);
    }
  }, [song, onSongUpdate]);

  const toggleTrackSolo = useCallback((trackId: string) => {
    if (onSongUpdate) {
      const updatedSong = {
        ...song,
        tracks: song.tracks.map(track => 
          track.id === trackId ? { ...track, solo: !track.solo } : { ...track, solo: false }
        ),
        lastModified: new Date().toISOString()
      };
      onSongUpdate(updatedSong);
    }
  }, [song, onSongUpdate]);

  const progressPercent = (currentTime / totalDurationSeconds()) * 100;
  const currentMeasure = Math.floor(currentBeat / 4) + 1;
  const currentBeatInMeasure = Math.floor(currentBeat % 4) + 1;

  if (song.tracks.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-medium mb-2">No Song to Play</h3>
        <p className="text-muted-foreground text-sm">
          Create a song in the Song Composer to see playback controls here.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Song Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Play className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{song.title}</h3>
            <p className="text-sm text-muted-foreground">
              by {song.composer} • {song.tempo} BPM • {song.timeSignature}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Layers className="w-3 h-3" />
            {song.tracks.length} Tracks
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            {Math.ceil(totalDurationSeconds())}s
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progressPercent} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
          <span>Measure {currentMeasure}, Beat {currentBeatInMeasure}</span>
          <span>{Math.floor(totalDurationSeconds() / 60)}:{Math.floor(totalDurationSeconds() % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>

      {/* Scrolling Timeline */}
      <div className="space-y-2">
        <Label className="font-medium">Timeline (Scrolling with Playback)</Label>
        <div className="relative border rounded-lg bg-muted/20 h-20 overflow-hidden">
          {/* Timeline container that scrolls */}
          <div 
            className="absolute top-0 left-0 h-full flex items-center transition-transform duration-100 ease-linear"
            style={{
              width: `${Math.max(100, (song.totalDuration / 4) * 60)}px`, // 60px per measure minimum
              transform: `translateX(-${Math.max(0, (currentMeasure - 2) * 60)}px)` // Scroll with current measure, keep 2 measures visible ahead
            }}
          >
            {/* Render measures */}
            {Array.from({ length: Math.ceil(song.totalDuration / 4) }, (_, measureIndex) => {
              const measureNumber = measureIndex + 1;
              const isCurrentMeasure = measureNumber === currentMeasure;
              const measureStartBeat = measureIndex * 4;
              const measureEndBeat = (measureIndex + 1) * 4;
              
              // Check if any tracks are active in this measure
              const activeTracksInMeasure = song.tracks.filter(track => 
                (track.startTime < measureEndBeat && track.endTime > measureStartBeat) && !track.muted
              );
              
              return (
                <div
                  key={measureNumber}
                  className={`relative w-14 h-full border-r border-border flex flex-col justify-center items-center text-xs ${
                    isCurrentMeasure ? 'bg-primary/20 border-primary' : 'hover:bg-muted/40'
                  }`}
                  title={`Measure ${measureNumber} - ${activeTracksInMeasure.length} active tracks`}
                >
                  {/* Measure number */}
                  <div className={`font-mono ${isCurrentMeasure ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                    {measureNumber}
                  </div>
                  
                  {/* Beat indicators */}
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4].map(beat => {
                      const globalBeat = measureStartBeat + (beat - 1);
                      const isCurrentBeat = isCurrentMeasure && beat === currentBeatInMeasure;
                      return (
                        <div
                          key={beat}
                          className={`w-1 h-1 rounded-full ${
                            isCurrentBeat ? 'bg-primary animate-pulse' : 
                            globalBeat <= currentBeat ? 'bg-primary/40' : 'bg-muted-foreground/30'
                          }`}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Track activity indicators */}
                  <div className="flex flex-wrap gap-0.5 mt-1 px-1">
                    {activeTracksInMeasure.slice(0, 3).map((track, index) => (
                      <div
                        key={track.id}
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: track.color }}
                        title={track.name}
                      />
                    ))}
                    {activeTracksInMeasure.length > 3 && (
                      <div className="w-1 h-1 rounded-full bg-muted-foreground" title={`+${activeTracksInMeasure.length - 3} more`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Playhead indicator */}
          <div 
            className="absolute top-0 w-0.5 h-full bg-red-500 z-10 shadow-lg"
            style={{
              left: `${120 + ((currentBeat % 4) / 4) * 60}px` // Always at position for current beat within visible area
            }}
          />
          
          {/* Timeline info overlay */}
          <div className="absolute top-1 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            {Math.ceil(song.totalDuration / 4)} measures • {song.tracks.length} tracks
          </div>
        </div>
        
        {/* Timeline controls */}
        <div className="flex items-center justify-between text-xs">
          <div className="text-muted-foreground">
            Timeline auto-scrolls to keep current measure in view
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => seekTo(0)}
              disabled={isPlaying}
              className="h-6 px-2 text-xs"
            >
              Start
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => seekTo((currentMeasure / Math.ceil(song.totalDuration / 4)) * 100)}
              disabled={isPlaying}
              className="h-6 px-2 text-xs"
            >
              Sync
            </Button>
          </div>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <Button
          variant="outline"
          size="sm"
          onClick={stopPlayback}
          disabled={currentTime === 0}
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          variant={isPlaying ? "default" : "outline"}
          size="lg"
          onClick={isPlaying ? pausePlayback : startPlayback}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => seekTo(100)}
          disabled={isPlaying}
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        <Button
          variant={song.loopEnabled ? "default" : "outline"}
          size="sm"
          onClick={() => onSongUpdate && onSongUpdate({ ...song, loopEnabled: !song.loopEnabled })}
        >
          <Repeat className="w-4 h-4" />
        </Button>
      </div>

      {/* Volume and Playback Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Master Volume</Label>
          <div className="flex items-center gap-2">
            <VolumeX className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={masterVolume}
              onValueChange={setMasterVolume}
              max={100}
              step={1}
              className="flex-1"
            />
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-mono w-8">{masterVolume[0]}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Playback Speed</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs">0.5x</span>
            <Slider
              value={playbackRate}
              onValueChange={setPlaybackRate}
              min={0.5}
              max={2}
              step={0.1}
              className="flex-1"
            />
            <span className="text-xs">2x</span>
            <span className="text-xs font-mono w-12">{playbackRate[0].toFixed(1)}x</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Active Notes</Label>
          <div className="flex items-center gap-2 min-h-6">
            <Music className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{activeNotes.size} playing</span>
          </div>
        </div>
      </div>

      {/* Track Mixer */}
      <div className="space-y-3">
        <Label className="font-medium">Track Mixer</Label>
        <div className="grid gap-3">
          {song.tracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-3 p-3 border rounded-lg"
              style={{ borderColor: track.color }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium truncate">{track.name}</span>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ borderColor: track.color, color: track.color }}
                  >
                    {track.type}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {track.startTime.toFixed(1)} - {track.endTime.toFixed(1)} beats
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select 
                  value={track.instrument} 
                  onValueChange={(value) => updateTrackInstrument(track.id, value as InstrumentType)}
                >
                  <SelectTrigger className="w-24 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ENHANCED_INSTRUMENTS).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        {info.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1">
                  <VolumeX className="w-3 h-3 text-muted-foreground" />
                  <Slider
                    value={[track.volume]}
                    onValueChange={([value]) => updateTrackVolume(track.id, value)}
                    max={100}
                    step={1}
                    className="w-16"
                  />
                  <span className="text-xs font-mono w-6">{track.volume}</span>
                </div>

                <Button
                  size="sm"
                  variant={track.muted ? "default" : "outline"}
                  onClick={() => toggleTrackMute(track.id)}
                  className="h-8 w-8 p-0"
                >
                  {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </Button>

                <Button
                  size="sm"
                  variant={track.solo ? "default" : "outline"}
                  onClick={() => toggleTrackSolo(track.id)}
                  className="h-8 w-8 p-0"
                >
                  S
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}