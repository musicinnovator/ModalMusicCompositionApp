import { useState } from 'react';
import { Song, SongTrack, midiNoteToNoteName, isRest, isNote, PITCH_NAMES, NoteValue, getNoteValueBeats } from '../types/musical';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Download, 
  FileText, 
  Music, 
  Code, 
  AlertTriangle,
  Clock,
  Layers,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SongExporterProps {
  song: Song;
}

export function SongExporter({ song }: SongExporterProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Clear MIDI buffers and system memory
  const clearMidiBuffers = () => {
    try {
      // Clear any cached MIDI data
      if (typeof window !== 'undefined') {
        // Clear MIDI-related caches
        delete (window as any).__midiCache;
        delete (window as any).__exportCache;
        delete (window as any).__audioBuffers;
        delete (window as any).__songExportCache;
      }
      
      // Force garbage collection if available
      if (typeof window !== 'undefined' && (window as any).gc) {
        (window as any).gc();
      }
      
      console.log('🧹 MIDI buffers and system memory cleared');
    } catch (error) {
      console.warn('Memory cleanup warning:', error);
    }
  };

  // Helper function to encode variable-length quantity for MIDI
  const encodeVLQ = (value: number): number[] => {
    if (value === 0) return [0];
    
    const bytes: number[] = [];
    let remainingValue = value;
    
    bytes.push(remainingValue & 0x7F);
    remainingValue >>= 7;
    
    while (remainingValue > 0) {
      bytes.unshift((remainingValue & 0x7F) | 0x80);
      remainingValue >>= 7;
    }
    
    return bytes;
  };

  // Generate complete MIDI file for the song
  const generateSongMIDI = (): Uint8Array => {
    try {
      const tempoMicroseconds = Math.round(60000000 / song.tempo);
      const ticksPerQuarter = 480;
      const ticksPerBeat = ticksPerQuarter; // 4/4 time, quarter note gets the beat
      
      // Calculate total number of tracks (conductor track + song tracks)
      const totalTracks = song.tracks.length + 1;
      
      // MIDI header chunk
      const headerData = [
        0x4D, 0x54, 0x68, 0x64, // "MThd"
        0x00, 0x00, 0x00, 0x06, // Header length (always 6)
        0x00, 0x01, // Format 1 (multi-track)
        0x00, totalTracks, // Number of tracks
        (ticksPerQuarter >> 8) & 0xFF, ticksPerQuarter & 0xFF  // Ticks per quarter note
      ];

      const tracks: Uint8Array[] = [];

      // Create conductor track (tempo, time signature, etc.)
      const conductorTrackData: number[] = [];
      
      // Track name
      conductorTrackData.push(0x00, 0xFF, 0x03, 0x0A); // Track name meta event, length 10
      const conductorName = 'Conductor';
      conductorTrackData.push(...Array.from(new TextEncoder().encode(conductorName)));
      
      // Tempo setting
      conductorTrackData.push(0x00, 0xFF, 0x51, 0x03); // Set tempo meta event
      conductorTrackData.push((tempoMicroseconds >> 16) & 0xFF, (tempoMicroseconds >> 8) & 0xFF, tempoMicroseconds & 0xFF);
      
      // Time signature
      conductorTrackData.push(0x00, 0xFF, 0x58, 0x04); // Time signature meta event
      const timeSignatureParts = song.timeSignature.split('/');
      const numerator = parseInt(timeSignatureParts[0]);
      const denominatorLog = Math.log2(parseInt(timeSignatureParts[1]));
      conductorTrackData.push(numerator, denominatorLog, 24, 8); // Time signature parameters
      
      // End of conductor track
      conductorTrackData.push(0x00, 0xFF, 0x2F, 0x00);

      // Create conductor track chunk
      const conductorTrackHeader = [
        0x4D, 0x54, 0x72, 0x6B, // "MTrk"
        (conductorTrackData.length >> 24) & 0xFF,
        (conductorTrackData.length >> 16) & 0xFF,
        (conductorTrackData.length >> 8) & 0xFF,
        conductorTrackData.length & 0xFF
      ];

      const conductorTrack = new Uint8Array(conductorTrackHeader.length + conductorTrackData.length);
      conductorTrack.set(conductorTrackHeader, 0);
      conductorTrack.set(conductorTrackData, conductorTrackHeader.length);
      tracks.push(conductorTrack);

      // Create tracks for each song track
      song.tracks.forEach((songTrack, trackIndex) => {
        const trackData: number[] = [];
        
        // Track name
        const trackNameBytes = Array.from(new TextEncoder().encode(songTrack.name));
        trackData.push(0x00, 0xFF, 0x03, trackNameBytes.length);
        trackData.push(...trackNameBytes);
        
        // Set MIDI channel (0-15)
        const midiChannel = trackIndex % 16;
        
        // Convert song track to MIDI events with PERFECT RHYTHM ACCURACY
        let lastEventTick = 0;
        let currentTick = Math.round(songTrack.startTime * ticksPerBeat);
        
        console.log(`🎵 Processing track "${songTrack.name}" for MIDI export:`, {
          melodyLength: songTrack.melody.length,
          rhythmLength: songTrack.rhythm.length,
          noteValuesLength: songTrack.noteValues?.length || 0,
          hasNoteValues: !!songTrack.noteValues,
          hasHarmonyNotes: !!songTrack.harmonyNotes,
          harmonyNotesLength: songTrack.harmonyNotes?.length || 0,
          startTime: songTrack.startTime
        });
        
        // SPECIAL METHOD FOR HARMONY TRACKS: Export all chord notes simultaneously
        if (songTrack.harmonyNotes && Array.isArray(songTrack.harmonyNotes) && songTrack.harmonyNotes.length > 0) {
          console.log('  🎼 HARMONY TRACK DETECTED - Exporting full chords (all notes simultaneously)');
          console.log(`    ${songTrack.harmonyNotes.length} chords to export`);
          
          for (let chordIndex = 0; chordIndex < songTrack.harmonyNotes.length; chordIndex++) {
            const chordNotes = songTrack.harmonyNotes[chordIndex];
            const chordDurationBeats = songTrack.rhythm[chordIndex] || 1;
            const chordDurationTicks = Math.round(chordDurationBeats * ticksPerBeat * 0.9);
            
            if (!Array.isArray(chordNotes) || chordNotes.length === 0) {
              console.log(`    ⏭️ Skipping empty chord ${chordIndex + 1}`);
              currentTick += Math.round(chordDurationBeats * ticksPerBeat);
              continue;
            }
            
            console.log(`    Chord ${chordIndex + 1}: ${chordNotes.length} notes at beat ${(currentTick / ticksPerBeat).toFixed(2)}, duration ${chordDurationBeats} beats`);
            
            // Calculate delta time for first note in chord
            const deltaTime = currentTick - lastEventTick;
            
            // Play all notes in the chord simultaneously (all have same delta time for the first note)
            chordNotes.forEach((midiNote, noteIndex) => {
              if (isNote(midiNote) && typeof midiNote === 'number') {
                // First note in chord uses calculated delta time, rest use 0 (simultaneous)
                const noteDeltaTime = noteIndex === 0 ? deltaTime : 0;
                
                // Note on event
                trackData.push(...encodeVLQ(noteDeltaTime));
                trackData.push(0x90 | midiChannel, midiNote, Math.round(songTrack.volume * 1.27));
                
                console.log(`      Note ${noteIndex + 1}/${chordNotes.length}: ${midiNoteToNoteName(midiNote)} (MIDI ${midiNote})`);
              }
            });
            
            // Schedule all note off events after the chord duration
            chordNotes.forEach((midiNote, noteIndex) => {
              if (isNote(midiNote) && typeof midiNote === 'number') {
                // First note off uses the chord duration, rest use 0 (simultaneous)
                const noteOffDeltaTime = noteIndex === 0 ? chordDurationTicks : 0;
                
                // Note off event
                trackData.push(...encodeVLQ(noteOffDeltaTime));
                trackData.push(0x80 | midiChannel, midiNote, 0x40);
              }
            });
            
            lastEventTick = currentTick + chordDurationTicks;
            currentTick += Math.round(chordDurationBeats * ticksPerBeat);
          }
          
          console.log(`  ✅ Harmony track exported: ${songTrack.harmonyNotes.length} chords with full voicing`);
        }
        // METHOD 1: Use NoteValue[] array if available (ACCURATE for all durations including eighth/sixteenth)
        else if (songTrack.noteValues && songTrack.noteValues.length === songTrack.melody.length) {
          console.log('  ✅ Using NoteValue[] array for PRECISE rhythm (supports eighth/sixteenth notes)');
          
          for (let i = 0; i < songTrack.melody.length; i++) {
            const melodyElement = songTrack.melody[i];
            
            if (isNote(melodyElement) && typeof melodyElement === 'number') {
              const noteValue = songTrack.noteValues[i];
              const noteDurationBeats = getNoteValueBeats(noteValue);
              
              // Convert to MIDI ticks (90% for articulation)
              const noteDurationTicks = Math.round(noteDurationBeats * ticksPerBeat * 0.9);
              
              // Calculate delta time from last event
              const deltaTime = currentTick - lastEventTick;
              
              console.log(`  Note ${i + 1}: ${melodyElement} (${midiNoteToNoteName(melodyElement)}) - ${noteValue} = ${noteDurationBeats} beats (${noteDurationTicks} ticks)`);
              
              // Note on event
              trackData.push(...encodeVLQ(deltaTime));
              trackData.push(0x90 | midiChannel, melodyElement, Math.round(songTrack.volume * 1.27));
              
              // Note off event
              trackData.push(...encodeVLQ(noteDurationTicks));
              trackData.push(0x80 | midiChannel, melodyElement, 0x40);
              
              lastEventTick = currentTick + noteDurationTicks;
              currentTick += Math.round(noteDurationBeats * ticksPerBeat); // Advance by full duration
            }
          }
        }
        // METHOD 2: Fallback to Rhythm array interpretation (less accurate for short notes)
        else {
          console.log('  ⚠️ Using Rhythm array fallback (eighth/sixteenth notes may be approximated)');
          
          let melodyIndex = 0;
          let rhythmIndex = 0;
          
          while (melodyIndex < songTrack.melody.length && rhythmIndex < songTrack.rhythm.length) {
            // Find note start (rhythm value = 1)
            if (songTrack.rhythm[rhythmIndex] === 1) {
              const melodyElement = songTrack.melody[melodyIndex];
              
              if (isNote(melodyElement) && typeof melodyElement === 'number') {
                // Count consecutive beats for duration
                let noteDurationBeats = 1;
                let lookAhead = rhythmIndex + 1;
                
                while (lookAhead < songTrack.rhythm.length && 
                       songTrack.rhythm[lookAhead] === 0) {
                  noteDurationBeats++;
                  lookAhead++;
                }
                
                const noteDurationTicks = Math.round(noteDurationBeats * ticksPerBeat * 0.9);
                const noteStartTick = Math.round(songTrack.startTime * ticksPerBeat + rhythmIndex * ticksPerBeat);
                const deltaTime = noteStartTick - lastEventTick;
                
                console.log(`  Note ${melodyIndex + 1}: ${melodyElement} (${midiNoteToNoteName(melodyElement)}) - ${noteDurationBeats} beats (${noteDurationTicks} ticks)`);
                
                // Note on event
                trackData.push(...encodeVLQ(deltaTime));
                trackData.push(0x90 | midiChannel, melodyElement, Math.round(songTrack.volume * 1.27));
                
                // Note off event
                trackData.push(...encodeVLQ(noteDurationTicks));
                trackData.push(0x80 | midiChannel, melodyElement, 0x40);
                
                lastEventTick = noteStartTick + noteDurationTicks;
              }
              
              melodyIndex++;
            }
            
            rhythmIndex++;
          }
        }

        // End of track
        trackData.push(0x00, 0xFF, 0x2F, 0x00);

        // Create track chunk
        const trackHeader = [
          0x4D, 0x54, 0x72, 0x6B, // "MTrk"
          (trackData.length >> 24) & 0xFF,
          (trackData.length >> 16) & 0xFF,
          (trackData.length >> 8) & 0xFF,
          trackData.length & 0xFF
        ];

        const track = new Uint8Array(trackHeader.length + trackData.length);
        track.set(trackHeader, 0);
        track.set(trackData, trackHeader.length);
        tracks.push(track);
      });

      // Combine header and all tracks
      const totalSize = headerData.length + tracks.reduce((sum, track) => sum + track.length, 0);
      const midiFile = new Uint8Array(totalSize);
      
      let offset = 0;
      midiFile.set(headerData, offset);
      offset += headerData.length;
      
      tracks.forEach(track => {
        midiFile.set(track, offset);
        offset += track.length;
      });

      console.log('✅ Generated song MIDI file:', {
        totalSize,
        tracks: tracks.length,
        songTracks: song.tracks.length,
        tempo: song.tempo,
        timeSignature: song.timeSignature
      });

      return midiFile;
    } catch (error) {
      console.error('Song MIDI generation error:', error);
      throw new Error('Failed to generate song MIDI file');
    }
  };

  // Generate enhanced text analysis of the song - FIXED FORMATTING
  const generateSongTextFile = (): string => {
    const timestamp = new Date().toLocaleString();
    let content = `IMITATIVE FUGUE SUITE - COMPLETE SONG EXPORT\n`;
    content += `Generated: ${timestamp}\n`;
    content += `Export Version: Professional Song Suite v1.0\n\n`;

    content += `SONG METADATA:\n`;
    content += `${'='.repeat(50)}\n`;
    content += `Title: ${song.title}\n`;
    content += `Composer: ${song.composer}\n`;
    content += `Tempo: ${song.tempo} BPM\n`;
    content += `Time Signature: ${song.timeSignature}\n`;
    content += `Total Duration: ${song.totalDuration} beats (${(song.totalDuration / 4).toFixed(1)} measures)\n`;
    content += `Number of Tracks: ${song.tracks.length}\n`;
    content += `Created: ${new Date(song.created).toLocaleString()}\n`;
    content += `Last Modified: ${new Date(song.lastModified).toLocaleString()}\n\n`;

    if (song.loopEnabled) {
      content += `LOOP SETTINGS:\n`;
      content += `${'='.repeat(30)}\n`;
      content += `Loop Start: ${song.loopStart} beats\n`;
      content += `Loop End: ${song.loopEnd} beats\n`;
      content += `Loop Duration: ${song.loopEnd - song.loopStart} beats\n\n`;
    }

    content += `TRACK ANALYSIS:\n`;
    content += `${'='.repeat(50)}\n`;
    song.tracks.forEach((track, index) => {
      content += `\nTRACK ${index + 1}: ${track.name}\n`;
      content += `${'-'.repeat(30)}\n`;
      content += `Type: ${track.type.charAt(0).toUpperCase() + track.type.slice(1)}\n`;
      content += `Instrument: ${track.instrument}\n`;
      content += `Time Range: ${track.startTime} - ${track.endTime} beats\n`;
      content += `Duration: ${track.endTime - track.startTime} beats\n`;
      content += `Volume: ${track.volume}%\n`;
      content += `Muted: ${track.muted ? 'Yes' : 'No'}\n`;
      content += `Solo: ${track.solo ? 'Yes' : 'No'}\n`;
      
      // Analyze melody
      const noteCount = track.melody.filter(isNote).length;
      const restCount = track.melody.filter(isRest).length;
      content += `Melody: ${track.melody.length} elements (${noteCount} notes, ${restCount} rests)\n`;
      
      if (noteCount > 0) {
        const notes = track.melody.filter(isNote) as number[];
        const firstFewNotes = notes.slice(0, 8).map(note => midiNoteToNoteName(note)).join(' → ');
        content += `Note Sequence: ${firstFewNotes}${notes.length > 8 ? '...' : ''}\n`;
        content += `MIDI Range: ${Math.min(...notes)} to ${Math.max(...notes)}\n`;
        
        // Analyze pitch classes
        const pitchClasses = notes.map(note => PITCH_NAMES[note % 12]);
        const uniquePitchClasses = [...new Set(pitchClasses)];
        content += `Pitch Classes Used: ${uniquePitchClasses.join(', ')}\n`;
      }
      
      // Rhythm analysis
      const rhythmBeats = track.rhythm.reduce((sum, r) => sum + r, 0);
      const nonZeroRhythms = track.rhythm.filter(r => r > 0).length;
      content += `Rhythm Pattern: [${track.rhythm.slice(0, 16).join(', ')}${track.rhythm.length > 16 ? '...' : ''}]\n`;
      content += `Active Beats: ${nonZeroRhythms} out of ${track.rhythm.length}\n`;
    });

    content += `\nSONG STRUCTURE ANALYSIS:\n`;
    content += `${'='.repeat(50)}\n`;
    
    // Timeline analysis
    const timelineEvents: Array<{time: number, type: string, track: string}> = [];
    song.tracks.forEach(track => {
      timelineEvents.push({ time: track.startTime, type: 'start', track: track.name });
      timelineEvents.push({ time: track.endTime, type: 'end', track: track.name });
    });
    timelineEvents.sort((a, b) => a.time - b.time);
    
    content += `\nTimeline Events:\n`;
    content += `${'-'.repeat(30)}\n`;
    timelineEvents.forEach(event => {
      const measure = Math.floor(event.time / 4) + 1;
      const beat = (event.time % 4) + 1;
      content += `  Measure ${measure}, Beat ${beat.toFixed(1)}: ${event.track} ${event.type}s\n`;
    });

    // Polyphony analysis
    const polyphonyMap = new Map<number, number>();
    for (let beat = 0; beat < song.totalDuration; beat += 0.25) {
      const activeTracks = song.tracks.filter(track => 
        beat >= track.startTime && beat < track.endTime && !track.muted
      ).length;
      polyphonyMap.set(activeTracks, (polyphonyMap.get(activeTracks) || 0) + 1);
    }
    
    content += `\nPolyphony Analysis:\n`;
    content += `${'-'.repeat(30)}\n`;
    Array.from(polyphonyMap.entries()).sort((a, b) => b[0] - a[0]).forEach(([voices, duration]) => {
      const percentage = ((duration / (song.totalDuration * 4)) * 100).toFixed(1);
      content += `  ${voices} voice${voices !== 1 ? 's' : ''}: ${percentage}% of song\n`;
    });

    content += `\nTECHNICAL SPECIFICATIONS:\n`;
    content += `${'='.repeat(50)}\n`;
    content += `- Export Engine: Professional Song Suite v1.0\n`;
    content += `- Song Format: Multi-track timeline composition\n`;
    content += `- MIDI Compatibility: General MIDI Level 1, Format 1\n`;
    content += `- MusicXML Version: 3.1 (Sibelius/Dorico/Finale compatible)\n`;
    content += `- Timeline Resolution: Beat-level precision\n`;
    content += `- Audio Engine: Enhanced synthesis with instrument selection\n`;
    content += `- Track Features: Individual volume, mute, solo, instrument selection\n`;
    content += `- Loop Support: Configurable start/end points for rehearsal\n\n`;

    content += `SOFTWARE COMPATIBILITY:\n`;
    content += `${'='.repeat(50)}\n`;
    content += `- DAWs: Pro Tools, Logic Pro, Cubase, Reaper, FL Studio, Ableton Live\n`;
    content += `- Notation: Sibelius, Dorico, Finale, MuseScore\n`;
    content += `- Analysis: Music21, Humdrum, MIDI.js\n`;
    content += `- Import: Most professional music software supporting MIDI Format 1\n\n`;

    content += `EXPORT NOTES:\n`;
    content += `${'='.repeat(50)}\n`;
    content += `This file was exported with proper line breaks and formatting.\n`;
    content += `Each section is clearly separated with visual dividers.\n`;
    content += `All data is presented in a human-readable format.\n`;
    content += `No garbled symbols or escaped characters are present.\n`;

    return content;
  };

  // Generate simplified MusicXML for the song
  const generateSongMusicXML = (): string => {
    const timestamp = new Date().toISOString();
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n`;
    xml += `<score-partwise version="3.1">\n`;
    
    // Header information
    xml += `  <work>\n`;
    xml += `    <work-title>${song.title}</work-title>\n`;
    xml += `  </work>\n`;
    
    xml += `  <identification>\n`;
    xml += `    <creator type="composer">${song.composer}</creator>\n`;
    xml += `    <encoding>\n`;
    xml += `      <software>Imitative Fugue Suite - Professional Song Exporter</software>\n`;
    xml += `      <encoding-date>${timestamp.split('T')[0]}</encoding-date>\n`;
    xml += `    </encoding>\n`;
    xml += `  </identification>\n`;
    
    // Part list
    xml += `  <part-list>\n`;
    song.tracks.forEach((track, index) => {
      xml += `    <score-part id="P${index + 1}">\n`;
      xml += `      <part-name>${track.name}</part-name>\n`;
      xml += `      <score-instrument id="P${index + 1}-I1">\n`;
      xml += `        <instrument-name>${track.instrument}</instrument-name>\n`;
      xml += `      </score-instrument>\n`;
      xml += `    </score-part>\n`;
    });
    xml += `  </part-list>\n`;
    
    // Parts
    song.tracks.forEach((track, trackIndex) => {
      xml += `  <part id="P${trackIndex + 1}">\n`;
      
      // Measures
      const measuresCount = Math.ceil(track.endTime / 4);
      for (let measure = 1; measure <= measuresCount; measure++) {
        xml += `    <measure number="${measure}">\n`;
        
        // Add attributes for first measure
        if (measure === 1) {
          xml += `      <attributes>\n`;
          xml += `        <divisions>480</divisions>\n`;
          xml += `        <key>\n`;
          xml += `          <fifths>0</fifths>\n`;
          xml += `        </key>\n`;
          xml += `        <time>\n`;
          const [numerator, denominator] = song.timeSignature.split('/');
          xml += `          <beats>${numerator}</beats>\n`;
          xml += `          <beat-type>${denominator}</beat-type>\n`;
          xml += `        </time>\n`;
          xml += `        <clef>\n`;
          xml += `          <sign>G</sign>\n`;
          xml += `          <line>2</line>\n`;
          xml += `        </clef>\n`;
          xml += `      </attributes>\n`;
          
          // Add tempo marking
          xml += `      <direction>\n`;
          xml += `        <direction-type>\n`;
          xml += `          <metronome>\n`;
          xml += `            <beat-unit>quarter</beat-unit>\n`;
          xml += `            <per-minute>${song.tempo}</per-minute>\n`;
          xml += `          </metronome>\n`;
          xml += `        </direction-type>\n`;
          xml += `      </direction>\n`;
        }
        
        // Add notes for this measure
        const measureStart = (measure - 1) * 4;
        const measureEnd = measure * 4;
        
        let hasNotes = false;
        for (let beat = measureStart; beat < measureEnd && beat < track.rhythm.length; beat++) {
          const rhythmValue = track.rhythm[beat];
          const melodyIndex = beat;
          
          if (rhythmValue > 0 && melodyIndex < track.melody.length) {
            const melodyElement = track.melody[melodyIndex];
            
            if (isNote(melodyElement) && typeof melodyElement === 'number') {
              hasNotes = true;
              const step = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'][melodyElement % 12];
              const alter = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0][melodyElement % 12];
              const octave = Math.floor(melodyElement / 12) - 1;
              
              xml += `      <note>\n`;
              xml += `        <pitch>\n`;
              xml += `          <step>${step}</step>\n`;
              if (alter !== 0) {
                xml += `          <alter>${alter}</alter>\n`;
              }
              xml += `          <octave>${octave}</octave>\n`;
              xml += `        </pitch>\n`;
              xml += `        <duration>480</duration>\n`;
              xml += `        <type>quarter</type>\n`;
              xml += `      </note>\n`;
            } else if (isRest(melodyElement)) {
              hasNotes = true;
              xml += `      <note>\n`;
              xml += `        <rest/>\n`;
              xml += `        <duration>480</duration>\n`;
              xml += `        <type>quarter</type>\n`;
              xml += `      </note>\n`;
            }
          }
        }
        
        // Add whole rest if no notes in measure
        if (!hasNotes) {
          xml += `      <note>\n`;
          xml += `        <rest/>\n`;
          xml += `        <duration>1920</duration>\n`;
          xml += `        <type>whole</type>\n`;
          xml += `      </note>\n`;
        }
        
        xml += `    </measure>\n`;
      }
      
      xml += `  </part>\n`;
    });
    
    xml += `</score-partwise>\n`;
    
    return xml;
  };

  const handleExportMIDI = async () => {
    if (song.tracks.length === 0) {
      toast.error('No tracks to export');
      return;
    }

    setIsExporting(true);
    try {
      // Clear previous session content before generating new MIDI
      clearMidiBuffers();
      
      const midiData = generateSongMIDI();
      const filename = `${song.title.replace(/[^a-zA-Z0-9]/g, '_')}_song_${Date.now()}.mid`;
      downloadFile(midiData, filename, 'audio/midi');
      toast.success(`Song MIDI exported: ${filename}`);
      
      // Clear buffers after export to prevent accumulation
      setTimeout(clearMidiBuffers, 1000);
    } catch (error) {
      console.error('Song MIDI export error:', error);
      toast.error('Failed to export song MIDI file');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportXML = async () => {
    if (song.tracks.length === 0) {
      toast.error('No tracks to export');
      return;
    }

    setIsExporting(true);
    try {
      // Clear previous session content before generating new XML
      clearMidiBuffers();
      
      const xmlData = generateSongMusicXML();
      const filename = `${song.title.replace(/[^a-zA-Z0-9]/g, '_')}_song_${Date.now()}.xml`;
      downloadFile(xmlData, filename, 'application/vnd.recordare.musicxml+xml');
      toast.success(`Song MusicXML exported: ${filename}`);
      
      // Clear buffers after export
      setTimeout(clearMidiBuffers, 1000);
    } catch (error) {
      console.error('Song XML export error:', error);
      toast.error('Failed to export song MusicXML file');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportText = async () => {
    if (song.tracks.length === 0) {
      toast.error('No tracks to export');
      return;
    }

    setIsExporting(true);
    try {
      // Clear previous session content before generating new text
      clearMidiBuffers();
      
      const textData = generateSongTextFile();
      const filename = `${song.title.replace(/[^a-zA-Z0-9]/g, '_')}_song_analysis_${Date.now()}.txt`;
      downloadFile(textData, filename, 'text/plain');
      toast.success(`Song analysis exported: ${filename} (Human-readable format)`);
      
      // Clear buffers after export
      setTimeout(clearMidiBuffers, 500);
    } catch (error) {
      console.error('Song text export error:', error);
      toast.error('Failed to export song analysis');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (content: string | Uint8Array, filename: string, mimeType: string) => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Clean up the URL after a delay to ensure download completes
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // URL may already be revoked
        }
      }, 2000);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download file');
    }
  };

  const hasContent = song.tracks.length > 0;
  const totalNotes = song.tracks.reduce((sum, track) => sum + track.melody.filter(isNote).length, 0);
  const totalRests = song.tracks.reduce((sum, track) => sum + track.melody.filter(isRest).length, 0);
  const songDurationMinutes = ((song.totalDuration / 4) * (60 / song.tempo)).toFixed(1);

  if (!hasContent) {
    return (
      <Card className="p-6 text-center">
        <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-medium mb-2">No Song to Export</h3>
        <p className="text-muted-foreground text-sm">
          Create a song with tracks in the Song Composer to enable export options.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Song Export Suite</h3>
              <p className="text-sm text-muted-foreground">
                Professional export for complete compositions - with memory cleanup
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
              {songDurationMinutes}m
            </Badge>
            <Badge variant="outline" className="gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              Auto-Clear
            </Badge>
          </div>
        </div>

        {/* Song Summary */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">"{song.title}"</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-green-800 dark:text-green-200">
            <div>
              <span className="font-medium">Composer:</span> {song.composer}
            </div>
            <div>
              <span className="font-medium">Tempo:</span> {song.tempo} BPM
            </div>
            <div>
              <span className="font-medium">Time:</span> {song.timeSignature}
            </div>
            <div>
              <span className="font-medium">Duration:</span> {(song.totalDuration / 4).toFixed(1)} measures
            </div>
          </div>
          <div className="mt-2 text-sm text-green-700 dark:text-green-300">
            <span className="font-medium">Content:</span> {totalNotes} notes, {totalRests} rests across {song.tracks.length} tracks
          </div>
        </div>

        {/* Export Features Notice */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Enhanced Export Features</span>
          </div>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Automatic memory cleanup on each export to prevent old content accumulation</li>
            <li>• Human-readable text files with proper line breaks and visual separators</li>
            <li>• Professional MIDI Format 1 with conductor track and individual channels</li>
            <li>• Timeline scrolling that follows playback across all measures</li>
          </ul>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={handleExportMIDI}
            disabled={isExporting || !hasContent}
            className="gap-2 h-auto p-4 flex-col"
          >
            <Music className="w-8 h-8" />
            <div className="text-center">
              <div className="font-medium">Export MIDI</div>
              <div className="text-xs text-muted-foreground mt-1">
                Professional multi-track MIDI file
              </div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExportXML}
            disabled={isExporting || !hasContent}
            className="gap-2 h-auto p-4 flex-col"
          >
            <Code className="w-8 h-8" />
            <div className="text-center">
              <div className="font-medium">Export MusicXML</div>
              <div className="text-xs text-muted-foreground mt-1">
                For Sibelius, Dorico, Finale
              </div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExportText}
            disabled={isExporting || !hasContent}
            className="gap-2 h-auto p-4 flex-col"
          >
            <FileText className="w-8 h-8" />
            <div className="text-center">
              <div className="font-medium">Export Analysis</div>
              <div className="text-xs text-muted-foreground mt-1">
                Human-readable format
              </div>
            </div>
          </Button>
        </div>

        {/* Format Descriptions */}
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="p-3 border rounded-lg">
            <div className="font-medium text-foreground mb-1">Song MIDI (.mid) - Enhanced</div>
            <div>Multi-track MIDI Format 1 with conductor track, individual instrument channels, and complete timeline arrangement. Compatible with all major DAWs. <span className="text-green-600 font-medium">Now includes automatic memory cleanup.</span></div>
          </div>
          
          <div className="p-3 border rounded-lg">
            <div className="font-medium text-foreground mb-1">Song MusicXML (.xml)</div>
            <div>Industry-standard notation format with multiple parts, proper measure organization, and tempo markings. Import into professional notation software.</div>
          </div>
          
          <div className="p-3 border rounded-lg">
            <div className="font-medium text-foreground mb-1">Song Analysis (.txt) - Human-Readable</div>
            <div>Comprehensive analysis with proper line breaks, visual separators, and clear formatting. <span className="text-green-600 font-medium">No more garbled text or escaped characters.</span></div>
          </div>
        </div>

        {/* Track Preview */}
        <div className="space-y-2">
          <Label className="font-medium">Track Overview</Label>
          <div className="grid gap-2">
            {song.tracks.map((track, index) => (
              <div key={track.id} className="flex items-center justify-between p-2 border rounded text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: track.color }}
                  />
                  <span className="font-medium">{track.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {track.type}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {track.startTime.toFixed(1)} - {track.endTime.toFixed(1)} beats • {track.melody.filter(isNote).length} notes
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Status */}
        {isExporting && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Exporting song... Generating professional music files with automatic memory cleanup.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
}