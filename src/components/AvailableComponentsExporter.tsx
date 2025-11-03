/**
 * Available Components Exporter
 * 
 * Export all available components from the Complete Song Creation Suite
 * Supports: .mid (MIDI), .xml (MusicXML), .txt (JSON data)
 * Modes: Individual exports or composite file
 * 
 * ADDITIVE ONLY - No modifications to existing functionality
 */

import React, { useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { 
  Download, 
  FileText, 
  FileMusic, 
  File,
  CheckSquare,
  Square,
  Music,
  Layers
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { AvailableComponent } from '../types/musical';
import { MusicXMLExporter } from '../lib/musicxml-exporter';

// ============================================================================
// INTERFACES
// ============================================================================

interface AvailableComponentsExporterProps {
  components: AvailableComponent[];
  projectName?: string;
}

type ExportFormat = 'midi' | 'musicxml' | 'json';
type ExportMode = 'individual' | 'composite';

// ============================================================================
// MIDI EXPORT HELPER
// ============================================================================

/**
 * Creates MIDI file with chord support - PROPERLY ENCODED
 * Based on standard DAW MIDI encoding (Ableton, Logic, Pro Tools, Digital Performer)
 * 
 * MIDI Chord Encoding Rules:
 * - All notes in a chord have delta time 0 between their NOTE ON events = simultaneous start
 * - All notes in a chord have delta time 0 between their NOTE OFF events = simultaneous end
 * - Delta time advances ONLY between chords, not within a chord
 * 
 * Example: C major (60,64,67) for 1 beat, then D minor (62,65,69) for 1 beat:
 *   Delta 0,   Note On 60    ← First chord starts
 *   Delta 0,   Note On 64    ← Same time (chord)
 *   Delta 0,   Note On 67    ← Same time (chord)
 *   Delta 480, Note Off 60   ← After 1 beat
 *   Delta 0,   Note Off 64   ← Same time (chord)
 *   Delta 0,   Note Off 67   ← Same time (chord)
 *   Delta 0,   Note On 62    ← Second chord starts immediately
 *   Delta 0,   Note On 65    ← Same time (chord)
 *   Delta 0,   Note On 69    ← Same time (chord)
 *   Delta 480, Note Off 62   ← After 1 beat
 *   Delta 0,   Note Off 65   ← Same time (chord)
 *   Delta 0,   Note Off 69   ← Same time (chord)
 */
function createMidiFileWithChords(chords: number[][], rhythms: number[], tempo: number = 120, title: string = 'Export'): Uint8Array {
  const ticksPerBeat = 480;
  const events: number[] = [];
  
  // Track name
  events.push(0, 0xFF, 0x03, title.length, ...Array.from(new TextEncoder().encode(title)));
  
  // Tempo event
  const microsecondsPerBeat = Math.floor(60000000 / tempo);
  events.push(
    0, 0xFF, 0x51, 0x03,
    (microsecondsPerBeat >> 16) & 0xFF,
    (microsecondsPerBeat >> 8) & 0xFF,
    microsecondsPerBeat & 0xFF
  );
  
  // Process each chord
  chords.forEach((chord, chordIndex) => {
    const duration = rhythms[chordIndex] || 1;
    const durationTicks = Math.floor(duration * ticksPerBeat);
    
    // Ensure chord is an array
    const chordNotes = Array.isArray(chord) ? chord : [chord];
    
    // Filter valid MIDI notes and remove duplicates
    const validNotes = Array.from(new Set(
      chordNotes.filter(note => typeof note === 'number' && note >= 0 && note <= 127)
    )).sort(); // Sort for consistent ordering
    
    if (validNotes.length > 0) {
      // NOTE ON EVENTS - All notes in chord start simultaneously
      validNotes.forEach((note, noteIndex) => {
        // Delta time 0 for ALL notes = simultaneous playback
        // (Time is advanced by the previous chord's note offs)
        events.push(0, 0x90, note, 90);
      });
      
      // NOTE OFF EVENTS - All notes in chord end simultaneously
      validNotes.forEach((note, noteIndex) => {
        if (noteIndex === 0) {
          // First note off: advance time by chord duration
          events.push(...encodeVariableLength(durationTicks), 0x80, note, 0);
        } else {
          // Rest of note offs: delta time 0 = simultaneous
          events.push(0, 0x80, note, 0);
        }
      });
    }
  });
  
  // End of track
  events.push(0, 0xFF, 0x2F, 0);
  
  // Build track
  const trackData = new Uint8Array(events);
  
  // Build MIDI file header
  const header = new Uint8Array([
    0x4D, 0x54, 0x68, 0x64, // "MThd"
    0x00, 0x00, 0x00, 0x06, // Header length
    0x00, 0x00,             // Format 0 (single track)
    0x00, 0x01,             // Number of tracks (1)
    (ticksPerBeat >> 8) & 0xFF, ticksPerBeat & 0xFF  // Ticks per beat
  ]);
  
  // Combine header and track
  const trackHeader = new Uint8Array([
    0x4D, 0x54, 0x72, 0x6B, // "MTrk"
    (trackData.length >> 24) & 0xFF,
    (trackData.length >> 16) & 0xFF,
    (trackData.length >> 8) & 0xFF,
    trackData.length & 0xFF
  ]);
  
  const midiFile = new Uint8Array(header.length + trackHeader.length + trackData.length);
  let offset = 0;
  
  midiFile.set(header, offset);
  offset += header.length;
  
  midiFile.set(trackHeader, offset);
  offset += trackHeader.length;
  
  midiFile.set(trackData, offset);
  
  return midiFile;
}

/**
 * Creates a simple MIDI file from melodies and rhythms
 * Uses basic MIDI format without external dependencies
 * NOTE: This is for NON-CHORD melodies (legacy function)
 */
function createMidiFile(melodies: number[][], rhythms: number[][], tempo: number = 120, title: string = 'Export'): Uint8Array {
  // MIDI file structure: Header + Tracks
  const ticksPerBeat = 480;
  const tracks: Uint8Array[] = [];
  
  // Create a track for each melody
  melodies.forEach((melody, trackIndex) => {
    const rhythm = rhythms[trackIndex] || [];
    const events: number[] = [];
    
    // Track header events
    const trackName = `Track ${trackIndex + 1}`;
    events.push(0, 0xFF, 0x03, trackName.length, ...Array.from(new TextEncoder().encode(trackName)));
    
    // Tempo event (only in first track)
    if (trackIndex === 0) {
      const microsecondsPerBeat = Math.floor(60000000 / tempo);
      events.push(
        0, 0xFF, 0x51, 0x03,
        (microsecondsPerBeat >> 16) & 0xFF,
        (microsecondsPerBeat >> 8) & 0xFF,
        microsecondsPerBeat & 0xFF
      );
    }
    
    // Note events
    let currentTime = 0;
    melody.forEach((note, i) => {
      if (note >= 0 && note <= 127) { // Valid MIDI note
        const duration = rhythm[i] || 1;
        const durationTicks = Math.floor(duration * ticksPerBeat);
        
        // Note On
        events.push(0, 0x90, note, 90); // Delta time 0, Note On, note, velocity
        
        // Note Off
        events.push(...encodeVariableLength(durationTicks), 0x80, note, 0);
        currentTime += durationTicks;
      }
    });
    
    // End of track
    events.push(0, 0xFF, 0x2F, 0);
    
    tracks.push(new Uint8Array(events));
  });
  
  // Build MIDI file
  const header = new Uint8Array([
    0x4D, 0x54, 0x68, 0x64, // "MThd"
    0x00, 0x00, 0x00, 0x06, // Header length
    0x00, 0x01,             // Format 1 (multiple tracks, synchronous)
    (tracks.length >> 8) & 0xFF, tracks.length & 0xFF, // Number of tracks
    (ticksPerBeat >> 8) & 0xFF, ticksPerBeat & 0xFF    // Ticks per beat
  ]);
  
  // Combine header and tracks
  let totalLength = header.length;
  tracks.forEach(track => {
    totalLength += 8 + track.length; // "MTrk" + length + data
  });
  
  const midiFile = new Uint8Array(totalLength);
  let offset = 0;
  
  // Write header
  midiFile.set(header, offset);
  offset += header.length;
  
  // Write tracks
  tracks.forEach(track => {
    // Track header "MTrk"
    midiFile.set([0x4D, 0x54, 0x72, 0x6B], offset);
    offset += 4;
    
    // Track length
    const length = track.length;
    midiFile.set([
      (length >> 24) & 0xFF,
      (length >> 16) & 0xFF,
      (length >> 8) & 0xFF,
      length & 0xFF
    ], offset);
    offset += 4;
    
    // Track data
    midiFile.set(track, offset);
    offset += track.length;
  });
  
  return midiFile;
}

/**
 * Encode a number as MIDI variable-length quantity
 */
function encodeVariableLength(value: number): number[] {
  const bytes: number[] = [];
  let buffer = value & 0x7F;
  
  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= 0x80;
    buffer += value & 0x7F;
  }
  
  while (true) {
    bytes.push(buffer & 0xFF);
    if (buffer & 0x80) {
      buffer >>= 8;
    } else {
      break;
    }
  }
  
  return bytes;
}

// ============================================================================
// MUSICXML EXPORT HELPER
// ============================================================================

/**
 * Creates a MusicXML file with proper chord support
 * Based on MusicXML 3.1 specification for chord notation
 * 
 * Chord encoding in MusicXML:
 * - First note of chord: normal <note> element
 * - Subsequent notes: <note> with <chord/> element before <pitch>
 * - All notes in chord share the same duration
 */
function createMusicXMLFileWithChords(chords: number[][], rhythms: number[], tempo: number = 120, title: string = 'Export'): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\\n';
  xml += '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\\n';
  xml += '<score-partwise version="3.1">\\n';
  
  // Work metadata
  xml += `  <work>\\n`;
  xml += `    <work-title>${escapeXML(title)}</work-title>\\n`;
  xml += `  </work>\\n`;
  
  // Single part for all chords
  xml += '  <part-list>\\n';
  xml += `    <score-part id="P1">\\n`;
  xml += `      <part-name>Piano</part-name>\\n`;
  xml += `    </score-part>\\n`;
  xml += '  </part-list>\\n';
  
  // Part with chords
  xml += `  <part id="P1">\\n`;
  xml += `    <measure number="1">\\n`;
  
  // Attributes
  xml += `      <attributes>\\n`;
  xml += `        <divisions>480</divisions>\\n`;
  xml += `        <key><fifths>0</fifths></key>\\n`;
  xml += `        <time><beats>4</beats><beat-type>4</beat-type></time>\\n`;
  xml += `        <clef><sign>G</sign><line>2</line></clef>\\n`;
  xml += `      </attributes>\\n`;
  xml += `      <direction>\\n`;
  xml += `        <direction-type>\\n`;
  xml += `          <metronome><beat-unit>quarter</beat-unit><per-minute>${tempo}</per-minute></metronome>\\n`;
  xml += `        </direction-type>\\n`;
  xml += `      </direction>\\n`;
  
  // Process each chord
  chords.forEach((chord, chordIndex) => {
    const duration = rhythms[chordIndex] || 1;
    const durationValue = Math.floor(duration * 480);
    
    // Ensure chord is an array
    const chordNotes = Array.isArray(chord) ? chord : [chord];
    const validNotes = chordNotes.filter(note => typeof note === 'number' && note >= 0 && note <= 127);
    
    if (validNotes.length > 0) {
      // First note in chord (no <chord/> element)
      const { step, octave, alter } = midiToMusicXMLNote(validNotes[0]);
      xml += `      <note>\\n`;
      xml += `        <pitch>\\n`;
      xml += `          <step>${step}</step>\\n`;
      if (alter !== 0) {
        xml += `          <alter>${alter}</alter>\\n`;
      }
      xml += `          <octave>${octave}</octave>\\n`;
      xml += `        </pitch>\\n`;
      xml += `        <duration>${durationValue}</duration>\\n`;
      xml += `        <type>quarter</type>\\n`;
      xml += `      </note>\\n`;
      
      // Remaining notes in chord (with <chord/> element)
      for (let i = 1; i < validNotes.length; i++) {
        const noteData = midiToMusicXMLNote(validNotes[i]);
        xml += `      <note>\\n`;
        xml += `        <chord/>\\n`; // ← This indicates it's part of the previous chord!
        xml += `        <pitch>\\n`;
        xml += `          <step>${noteData.step}</step>\\n`;
        if (noteData.alter !== 0) {
          xml += `          <alter>${noteData.alter}</alter>\\n`;
        }
        xml += `          <octave>${noteData.octave}</octave>\\n`;
        xml += `        </pitch>\\n`;
        xml += `        <duration>${durationValue}</duration>\\n`;
        xml += `        <type>quarter</type>\\n`;
        xml += `      </note>\\n`;
      }
    }
  });
  
  xml += `    </measure>\\n`;
  xml += `  </part>\\n`;
  xml += '</score-partwise>\\n';
  
  return xml;
}

/**
 * Creates a simple MusicXML file from melodies and rhythms
 * LEGACY FUNCTION - For non-chord exports
 */
function createMusicXMLFile(melodies: number[][], rhythms: number[][], tempo: number = 120, title: string = 'Export'): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n';
  xml += '<score-partwise version="3.1">\n';
  
  // Work metadata
  xml += `  <work>\n`;
  xml += `    <work-title>${escapeXML(title)}</work-title>\n`;
  xml += `  </work>\n`;
  
  // Part list
  xml += '  <part-list>\n';
  melodies.forEach((_, index) => {
    const partId = `P${index + 1}`;
    xml += `    <score-part id="${partId}">\n`;
    xml += `      <part-name>Part ${index + 1}</part-name>\n`;
    xml += `    </score-part>\n`;
  });
  xml += '  </part-list>\n';
  
  // Parts
  melodies.forEach((melody, trackIndex) => {
    const partId = `P${trackIndex + 1}`;
    const rhythm = rhythms[trackIndex] || [];
    
    xml += `  <part id="${partId}">\n`;
    xml += `    <measure number="1">\n`;
    
    // Attributes (only first part)
    if (trackIndex === 0) {
      xml += `      <attributes>\n`;
      xml += `        <divisions>480</divisions>\n`;
      xml += `        <key><fifths>0</fifths></key>\n`;
      xml += `        <time><beats>4</beats><beat-type>4</beat-type></time>\n`;
      xml += `        <clef><sign>G</sign><line>2</line></clef>\n`;
      xml += `      </attributes>\n`;
      xml += `      <direction>\n`;
      xml += `        <direction-type>\n`;
      xml += `          <metronome><beat-unit>quarter</beat-unit><per-minute>${tempo}</per-minute></metronome>\n`;
      xml += `        </direction-type>\n`;
      xml += `      </direction>\n`;
    }
    
    // Notes
    melody.forEach((note, i) => {
      if (note >= 0 && note <= 127) {
        const duration = rhythm[i] || 1;
        const { step, octave, alter } = midiToMusicXMLNote(note);
        
        xml += `      <note>\n`;
        xml += `        <pitch>\n`;
        xml += `          <step>${step}</step>\n`;
        if (alter !== 0) {
          xml += `          <alter>${alter}</alter>\n`;
        }
        xml += `          <octave>${octave}</octave>\n`;
        xml += `        </pitch>\n`;
        xml += `        <duration>${Math.floor(duration * 480)}</duration>\n`;
        xml += `        <type>quarter</type>\n`;
        xml += `      </note>\n`;
      }
    });
    
    xml += `    </measure>\n`;
    xml += `  </part>\n`;
  });
  
  xml += '</score-partwise>\n';
  return xml;
}

/**
 * Convert MIDI note to MusicXML pitch
 */
function midiToMusicXMLNote(midiNote: number): { step: string; octave: number; alter: number } {
  const octave = Math.floor(midiNote / 12) - 1;
  const pitchClass = midiNote % 12;
  
  const pitchMap = [
    { step: 'C', alter: 0 },
    { step: 'C', alter: 1 },
    { step: 'D', alter: 0 },
    { step: 'D', alter: 1 },
    { step: 'E', alter: 0 },
    { step: 'F', alter: 0 },
    { step: 'F', alter: 1 },
    { step: 'G', alter: 0 },
    { step: 'G', alter: 1 },
    { step: 'A', alter: 0 },
    { step: 'A', alter: 1 },
    { step: 'B', alter: 0 }
  ];
  
  return { ...pitchMap[pitchClass], octave };
}

/**
 * Escape XML special characters
 */
function escapeXML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AvailableComponentsExporter({ 
  components,
  projectName = 'Musical_Components'
}: AvailableComponentsExporterProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('midi');
  const [selectedMode, setSelectedMode] = useState<ExportMode>('composite');
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  // ============================================================================
  // SELECTION HANDLERS
  // ============================================================================

  const handleToggleComponent = useCallback((componentId: string) => {
    setSelectedComponents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(componentId)) {
        newSet.delete(componentId);
      } else {
        newSet.add(componentId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedComponents(new Set(components.map(c => c.id)));
  }, [components]);

  const handleDeselectAll = useCallback(() => {
    setSelectedComponents(new Set());
  }, []);

  // ============================================================================
  // EXPORT FUNCTIONS
  // ============================================================================

  const exportToJSON = useCallback((component: AvailableComponent): string => {
    const exportData = {
      name: component.name,
      type: component.type,
      melody: component.melody,
      rhythm: component.rhythm,
      noteValues: component.noteValues || [],
      harmonyNotes: component.harmonyNotes || [],
      instrument: component.instrument || 'piano',
      duration: component.duration,
      description: component.description,
      metadata: component.metadata || {},
      exportDate: new Date().toISOString(),
      exportVersion: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  }, []);

  const exportComponentAsJSON = useCallback((component: AvailableComponent) => {
    const jsonContent = exportToJSON(component);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFilename(component.name)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportToJSON]);

  const exportComponentAsMIDI = useCallback((component: AvailableComponent) => {
    try {
      // DYNAMIC EXPORT: Use actual component data (harmony chords OR melody)
      let midiData: Uint8Array;
      
      if (component.harmonyNotes && component.harmonyNotes.length > 0) {
        // HARMONY COMPONENT: Export chords (each array element is a chord played simultaneously)
        // harmonyNotes = [[60,64,67], [62,65,69], ...] where each inner array plays together
        midiData = createMidiFileWithChords(
          component.harmonyNotes,  // Array of chords
          component.rhythm,         // One rhythm value per chord
          120,
          component.name
        );
      } else {
        // NON-HARMONY COMPONENT: Export sequential melody
        // Convert melody to chord format (each note is a "chord" of one note)
        const chordsFromMelody = component.melody.map(note => [note]);
        midiData = createMidiFileWithChords(
          chordsFromMelody,
          component.rhythm,
          120,
          component.name
        );
      }

      const blob = new Blob([midiData], { type: 'audio/midi' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sanitizeFilename(component.name)}.mid`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('MIDI export error:', error);
      toast.error(`Failed to export ${component.name} as MIDI`);
    }
  }, []);

  const exportComponentAsMusicXML = useCallback((component: AvailableComponent) => {
    try {
      // CHORD-AWARE MUSICXML EXPORT
      // Use proper chord notation for harmony, sequential notes for melody
      let xmlContent: string;
      
      if (component.harmonyNotes && component.harmonyNotes.length > 0) {
        // HARMONY COMPONENT: Export with proper chord notation
        // harmonyNotes = [[60,64,67], [62,65,69], ...] where each array is a chord
        xmlContent = createMusicXMLFileWithChords(
          component.harmonyNotes,  // Array of chords
          component.rhythm,         // One rhythm value per chord
          120,
          component.name
        );
      } else {
        // NON-HARMONY COMPONENT: Export as sequential melody
        // Convert melody to chord format (each note is a single-note "chord")
        const chordsFromMelody = component.melody.map(note => [note]);
        xmlContent = createMusicXMLFileWithChords(
          chordsFromMelody,
          component.rhythm,
          120,
          component.name
        );
      }

      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sanitizeFilename(component.name)}.xml`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('MusicXML export error:', error);
      toast.error(`Failed to export ${component.name} as MusicXML`);
    }
  }, []);

  // ============================================================================
  // COMPOSITE EXPORT
  // ============================================================================

  const exportCompositeJSON = useCallback((componentsToExport: AvailableComponent[]) => {
    const compositeData = {
      projectName,
      exportDate: new Date().toISOString(),
      componentCount: componentsToExport.length,
      components: componentsToExport.map(component => ({
        name: component.name,
        type: component.type,
        melody: component.melody,
        rhythm: component.rhythm,
        noteValues: component.noteValues || [],
        harmonyNotes: component.harmonyNotes || [],
        instrument: component.instrument || 'piano',
        duration: component.duration,
        description: component.description,
        metadata: component.metadata || {}
      }))
    };

    const jsonContent = JSON.stringify(compositeData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFilename(projectName)}_AllComponents.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [projectName]);

  const exportCompositeMIDI = useCallback((componentsToExport: AvailableComponent[]) => {
    try {
      // COMPOSITE EXPORT: Format 1 MIDI with multiple tracks
      // Each component = ONE track (not one track per note!)
      // Harmony components use proper chord encoding within their track
      
      // Build Format 1 MIDI file with proper track structure
      const ticksPerBeat = 480;
      const tracks: Uint8Array[] = [];
      
      componentsToExport.forEach((component, index) => {
        const events: number[] = [];
        
        // Track name
        const trackName = component.name;
        events.push(0, 0xFF, 0x03, trackName.length, ...Array.from(new TextEncoder().encode(trackName)));
        
        // Tempo event (only in first track)
        if (index === 0) {
          const microsecondsPerBeat = Math.floor(60000000 / 120);
          events.push(
            0, 0xFF, 0x51, 0x03,
            (microsecondsPerBeat >> 16) & 0xFF,
            (microsecondsPerBeat >> 8) & 0xFF,
            microsecondsPerBeat & 0xFF
          );
        }
        
        // Add notes - with chord support!
        if (component.harmonyNotes && component.harmonyNotes.length > 0) {
          // HARMONY COMPONENT: Process as chords
          component.harmonyNotes.forEach((chord, chordIndex) => {
            const duration = component.rhythm[chordIndex] || 1;
            const durationTicks = Math.floor(duration * ticksPerBeat);
            
            const chordNotes = Array.isArray(chord) ? chord : [chord];
            const validNotes = chordNotes.filter(note => typeof note === 'number' && note >= 0 && note <= 127);
            
            if (validNotes.length > 0) {
              // All Note ONs with delta 0 (simultaneous)
              validNotes.forEach(note => {
                events.push(0, 0x90, note, 90);
              });
              
              // All Note OFFs
              validNotes.forEach((note, noteIndex) => {
                if (noteIndex === 0) {
                  events.push(...encodeVariableLength(durationTicks), 0x80, note, 0);
                } else {
                  events.push(0, 0x80, note, 0);
                }
              });
            }
          });
        } else {
          // NON-HARMONY COMPONENT: Process as sequential melody
          component.melody.forEach((note, i) => {
            if (typeof note === 'number' && note >= 0 && note <= 127) {
              const duration = component.rhythm[i] || 1;
              const durationTicks = Math.floor(duration * ticksPerBeat);
              
              events.push(0, 0x90, note, 90);
              events.push(...encodeVariableLength(durationTicks), 0x80, note, 0);
            }
          });
        }
        
        // End of track
        events.push(0, 0xFF, 0x2F, 0);
        tracks.push(new Uint8Array(events));
      });
      
      // Build Format 1 MIDI file
      const header = new Uint8Array([
        0x4D, 0x54, 0x68, 0x64, // "MThd"
        0x00, 0x00, 0x00, 0x06, // Header length
        0x00, 0x01,             // Format 1 (multiple tracks)
        (tracks.length >> 8) & 0xFF, tracks.length & 0xFF,
        (ticksPerBeat >> 8) & 0xFF, ticksPerBeat & 0xFF
      ]);
      
      // Calculate total length
      let totalLength = header.length;
      tracks.forEach(track => {
        totalLength += 8 + track.length;
      });
      
      // Combine header and tracks
      const midiFile = new Uint8Array(totalLength);
      let offset = 0;
      
      midiFile.set(header, offset);
      offset += header.length;
      
      tracks.forEach(track => {
        // Track header
        midiFile.set([0x4D, 0x54, 0x72, 0x6B], offset);
        offset += 4;
        
        // Track length
        midiFile.set([
          (track.length >> 24) & 0xFF,
          (track.length >> 16) & 0xFF,
          (track.length >> 8) & 0xFF,
          track.length & 0xFF
        ], offset);
        offset += 4;
        
        // Track data
        midiFile.set(track, offset);
        offset += track.length;
      });
      
      const midiData = midiFile;

      const blob = new Blob([midiData], { type: 'audio/midi' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sanitizeFilename(projectName)}_AllComponents.mid`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Composite MIDI export error:', error);
      toast.error('Failed to export composite MIDI');
    }
  }, [projectName]);

  const exportCompositeMusicXML = useCallback((componentsToExport: AvailableComponent[]) => {
    try {
      // COMPOSITE MUSICXML: Each component = ONE part with proper chord notation
      // Build multi-part score with chord support
      
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\\n';
      xml += '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\\n';
      xml += '<score-partwise version="3.1">\\n';
      
      // Work metadata
      xml += `  <work>\\n`;
      xml += `    <work-title>${escapeXML(`${projectName} - All Components`)}</work-title>\\n`;
      xml += `  </work>\\n`;
      
      // Part list
      xml += '  <part-list>\\n';
      componentsToExport.forEach((component, index) => {
        xml += `    <score-part id="P${index + 1}">\\n`;
        xml += `      <part-name>${escapeXML(component.name)}</part-name>\\n`;
        xml += `    </score-part>\\n`;
      });
      xml += '  </part-list>\\n';
      
      // Parts
      componentsToExport.forEach((component, partIndex) => {
        xml += `  <part id="P${partIndex + 1}">\\n`;
        xml += `    <measure number="1">\\n`;
        
        // Attributes (first part only)
        if (partIndex === 0) {
          xml += `      <attributes>\\n`;
          xml += `        <divisions>480</divisions>\\n`;
          xml += `        <key><fifths>0</fifths></key>\\n`;
          xml += `        <time><beats>4</beats><beat-type>4</beat-type></time>\\n`;
          xml += `        <clef><sign>G</sign><line>2</line></clef>\\n`;
          xml += `      </attributes>\\n`;
          xml += `      <direction>\\n`;
          xml += `        <direction-type>\\n`;
          xml += `          <metronome><beat-unit>quarter</beat-unit><per-minute>120</per-minute></metronome>\\n`;
          xml += `        </direction-type>\\n`;
          xml += `      </direction>\\n`;
        }
        
        // Notes - with chord support!
        if (component.harmonyNotes && component.harmonyNotes.length > 0) {
          // HARMONY COMPONENT: Export chords
          component.harmonyNotes.forEach((chord, chordIndex) => {
            const duration = component.rhythm[chordIndex] || 1;
            const durationValue = Math.floor(duration * 480);
            
            const chordNotes = Array.isArray(chord) ? chord : [chord];
            const validNotes = chordNotes.filter(note => typeof note === 'number' && note >= 0 && note <= 127);
            
            if (validNotes.length > 0) {
              // First note (no <chord/> tag)
              const noteData = midiToMusicXMLNote(validNotes[0]);
              xml += `      <note>\\n`;
              xml += `        <pitch>\\n`;
              xml += `          <step>${noteData.step}</step>\\n`;
              if (noteData.alter !== 0) {
                xml += `          <alter>${noteData.alter}</alter>\\n`;
              }
              xml += `          <octave>${noteData.octave}</octave>\\n`;
              xml += `        </pitch>\\n`;
              xml += `        <duration>${durationValue}</duration>\\n`;
              xml += `        <type>quarter</type>\\n`;
              xml += `      </note>\\n`;
              
              // Remaining notes (with <chord/> tag)
              for (let i = 1; i < validNotes.length; i++) {
                const nd = midiToMusicXMLNote(validNotes[i]);
                xml += `      <note>\\n`;
                xml += `        <chord/>\\n`;
                xml += `        <pitch>\\n`;
                xml += `          <step>${nd.step}</step>\\n`;
                if (nd.alter !== 0) {
                  xml += `          <alter>${nd.alter}</alter>\\n`;
                }
                xml += `          <octave>${nd.octave}</octave>\\n`;
                xml += `        </pitch>\\n`;
                xml += `        <duration>${durationValue}</duration>\\n`;
                xml += `        <type>quarter</type>\\n`;
                xml += `      </note>\\n`;
              }
            }
          });
        } else {
          // NON-HARMONY COMPONENT: Export sequential melody
          component.melody.forEach((note, i) => {
            if (typeof note === 'number' && note >= 0 && note <= 127) {
              const duration = component.rhythm[i] || 1;
              const durationValue = Math.floor(duration * 480);
              const noteData = midiToMusicXMLNote(note);
              
              xml += `      <note>\\n`;
              xml += `        <pitch>\\n`;
              xml += `          <step>${noteData.step}</step>\\n`;
              if (noteData.alter !== 0) {
                xml += `          <alter>${noteData.alter}</alter>\\n`;
              }
              xml += `          <octave>${noteData.octave}</octave>\\n`;
              xml += `        </pitch>\\n`;
              xml += `        <duration>${durationValue}</duration>\\n`;
              xml += `        <type>quarter</type>\\n`;
              xml += `      </note>\\n`;
            }
          });
        }
        
        xml += `    </measure>\\n`;
        xml += `  </part>\\n`;
      });
      
      xml += '</score-partwise>\\n';
      const xmlContent = xml;

      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sanitizeFilename(projectName)}_AllComponents.xml`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Composite MusicXML export error:', error);
      toast.error('Failed to export composite MusicXML');
    }
  }, [projectName]);

  // ============================================================================
  // MAIN EXPORT HANDLER
  // ============================================================================

  const handleExport = useCallback(async () => {
    setIsExporting(true);

    try {
      const componentsToExport = selectedMode === 'composite'
        ? components.filter(c => selectedComponents.has(c.id))
        : components.filter(c => selectedComponents.has(c.id));

      if (componentsToExport.length === 0) {
        toast.error('No components selected for export');
        setIsExporting(false);
        return;
      }

      if (selectedMode === 'composite') {
        // Export all selected as one file
        switch (selectedFormat) {
          case 'midi':
            exportCompositeMIDI(componentsToExport);
            break;
          case 'musicxml':
            exportCompositeMusicXML(componentsToExport);
            break;
          case 'json':
            exportCompositeJSON(componentsToExport);
            break;
        }

        toast.success(`Exported ${componentsToExport.length} components as composite ${selectedFormat.toUpperCase()}`);
      } else {
        // Export each component individually
        for (const component of componentsToExport) {
          switch (selectedFormat) {
            case 'midi':
              exportComponentAsMIDI(component);
              break;
            case 'musicxml':
              exportComponentAsMusicXML(component);
              break;
            case 'json':
              exportComponentAsJSON(component);
              break;
          }
          
          // Small delay between downloads to prevent browser blocking
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        toast.success(`Exported ${componentsToExport.length} components individually as ${selectedFormat.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. See console for details.');
    } finally {
      setIsExporting(false);
    }
  }, [
    components,
    selectedComponents,
    selectedFormat,
    selectedMode,
    exportComponentAsMIDI,
    exportComponentAsMusicXML,
    exportComponentAsJSON,
    exportCompositeMIDI,
    exportCompositeMusicXML,
    exportCompositeJSON
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (components.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg mb-2">No Components Available</h3>
        <p className="text-sm text-muted-foreground">
          Generate some components first to enable export functionality.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg">Export Available Components</h3>
            <p className="text-sm text-muted-foreground">
              Save components as MIDI, MusicXML, or JSON data
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {components.length} Components
          </Badge>
        </div>

        <Separator />

        {/* Export Format Selection */}
        <div>
          <Label className="mb-3 block">Export Format</Label>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={selectedFormat === 'midi' ? 'default' : 'outline'}
              onClick={() => setSelectedFormat('midi')}
              className="justify-start"
            >
              <FileMusic className="w-4 h-4 mr-2" />
              MIDI (.mid)
            </Button>
            <Button
              variant={selectedFormat === 'musicxml' ? 'default' : 'outline'}
              onClick={() => setSelectedFormat('musicxml')}
              className="justify-start"
            >
              <File className="w-4 h-4 mr-2" />
              MusicXML (.xml)
            </Button>
            <Button
              variant={selectedFormat === 'json' ? 'default' : 'outline'}
              onClick={() => setSelectedFormat('json')}
              className="justify-start"
            >
              <FileText className="w-4 h-4 mr-2" />
              JSON (.txt)
            </Button>
          </div>
        </div>

        {/* Export Mode Selection */}
        <div>
          <Label className="mb-3 block">Export Mode</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={selectedMode === 'composite' ? 'default' : 'outline'}
              onClick={() => setSelectedMode('composite')}
              className="justify-start"
            >
              <Layers className="w-4 h-4 mr-2" />
              Composite (One File)
            </Button>
            <Button
              variant={selectedMode === 'individual' ? 'default' : 'outline'}
              onClick={() => setSelectedMode('individual')}
              className="justify-start"
            >
              <FileText className="w-4 h-4 mr-2" />
              Individual Files
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {selectedMode === 'composite'
              ? 'Export all selected components into a single file'
              : 'Export each selected component as a separate file'}
          </p>
        </div>

        <Separator />

        {/* Component Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Select Components ({selectedComponents.size} selected)</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
              >
                <CheckSquare className="w-3 h-3 mr-1" />
                All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDeselectAll}
              >
                <Square className="w-3 h-3 mr-1" />
                None
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[300px] border rounded-lg p-4">
            <div className="space-y-2">
              {components.map((component) => (
                <ComponentCheckboxItem
                  key={component.id}
                  component={component}
                  isSelected={selectedComponents.has(component.id)}
                  onToggle={() => handleToggleComponent(component.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={selectedComponents.size === 0 || isExporting}
          className="w-full"
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting
            ? 'Exporting...'
            : `Export ${selectedComponents.size} Component${selectedComponents.size !== 1 ? 's' : ''} as ${selectedFormat.toUpperCase()}`}
        </Button>

        {/* Info */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <h4 className="font-medium mb-2">Export Information</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>• <strong>MIDI (.mid)</strong>: Standard MIDI file for DAWs and music software</li>
            <li>• <strong>MusicXML (.xml)</strong>: Sheet music format for notation software</li>
            <li>• <strong>JSON (.txt)</strong>: Complete data including metadata and harmony</li>
            <li>• <strong>Composite</strong>: Combines all components into one multi-track file</li>
            <li>• <strong>Individual</strong>: Creates separate files for each component</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// COMPONENT CHECKBOX ITEM
// ============================================================================

interface ComponentCheckboxItemProps {
  component: AvailableComponent;
  isSelected: boolean;
  onToggle: () => void;
}

function ComponentCheckboxItem({ component, isSelected, onToggle }: ComponentCheckboxItemProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
        isSelected ? 'bg-blue-500/10 border-blue-500' : 'hover:bg-muted/50'
      }`}
      onClick={onToggle}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        onClick={(e) => e.stopPropagation()}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{component.name}</span>
          <Badge variant="outline" className="text-xs shrink-0">
            {component.type}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {component.description || `${component.melody.length} notes`}
          {component.instrument && ` • ${component.instrument}`}
        </p>
      </div>

      {component.harmonyNotes && component.harmonyNotes.length > 0 && (
        <Badge variant="secondary" className="text-xs shrink-0">
          Harmony
        </Badge>
      )}
    </div>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9_\-]/gi, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}
