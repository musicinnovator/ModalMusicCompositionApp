import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Download, FileText, Music, Code } from 'lucide-react';
import { Part, Theme, Mode, KeySignature, PITCH_NAMES, melodyElementToString, isRest, isNote } from '../types/musical';
import { MusicXMLExporter, MusicXMLExportOptions } from '../lib/musicxml-exporter';
import { toast } from 'sonner@2.0.3';

interface FileExporterProps {
  theme: Theme;
  parts: Part[];
  selectedMode: Mode | null;
  selectedKeySignature: KeySignature | null;
  generationType: 'imitation' | 'fugue' | null;
}

export function FileExporter({ 
  theme, 
  parts, 
  selectedMode, 
  selectedKeySignature,
  generationType 
}: FileExporterProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Helper function to encode variable-length quantity
  const encodeVLQ = (value: number): number[] => {
    const bytes: number[] = [];
    let temp = value & 0x7F;
    
    while ((value >>= 7) > 0) {
      bytes.unshift(temp | 0x80);
      temp = value & 0x7F;
    }
    bytes.push(temp);
    
    return bytes;
  };

  const generateMIDIFile = (): Uint8Array => {
    // Basic MIDI file structure (Format 0, single track)
    const headerChunk = new Uint8Array([
      0x4D, 0x54, 0x68, 0x64, // "MThd"
      0x00, 0x00, 0x00, 0x06, // Header length (6 bytes)
      0x00, 0x00, // Format type 0
      0x00, 0x01, // Number of tracks (1)
      0x00, 0x60  // Ticks per quarter note (96)
    ]);

    // Track data
    const trackEvents: number[] = [];
    const ticksPerBeat = 96;
    
    // Set tempo (120 BPM = 500000 microseconds per quarter note)
    trackEvents.push(
      ...encodeVLQ(0), 0xFF, 0x51, 0x03, // Delta time 0, Meta event, Set Tempo, length 3
      0x07, 0xA1, 0x20 // 500000 microseconds
    );

    // Convert parts to MIDI events
    parts.forEach((part, partIndex) => {
      const channel = partIndex % 16; // MIDI has 16 channels
      let melodyIndex = 0;

      part.rhythm.forEach((duration, beatIndex) => {
        if (duration > 0 && melodyIndex < part.melody.length) {
          const pitch = part.melody[melodyIndex];
          const midiNote = Math.max(0, Math.min(127, 60 + pitch)); // Clamp to valid MIDI range
          
          // Note On event (delta time 0 for simultaneous notes)
          trackEvents.push(
            ...encodeVLQ(0), // Delta time
            0x90 | channel, // Note On + channel
            midiNote, // Note number
            0x64 // Velocity (100)
          );
          
          // Note Off event
          const noteDuration = Math.max(1, duration * ticksPerBeat);
          trackEvents.push(
            ...encodeVLQ(noteDuration), // Delta time
            0x80 | channel, // Note Off + channel
            midiNote, // Note number
            0x40 // Velocity (64)
          );
          
          melodyIndex++;
        }
      });
    });

    // End of track
    trackEvents.push(...encodeVLQ(0), 0xFF, 0x2F, 0x00);

    const trackData = new Uint8Array(trackEvents);
    
    // Track chunk header
    const trackHeader = new Uint8Array([
      0x4D, 0x54, 0x72, 0x6B, // "MTrk"
      (trackData.length >> 24) & 0xFF,
      (trackData.length >> 16) & 0xFF,
      (trackData.length >> 8) & 0xFF,
      trackData.length & 0xFF
    ]);

    // Combine header, track header, and track data
    const midiFile = new Uint8Array(headerChunk.length + trackHeader.length + trackData.length);
    midiFile.set(headerChunk, 0);
    midiFile.set(trackHeader, headerChunk.length);
    midiFile.set(trackData, headerChunk.length + trackHeader.length);

    return midiFile;
  };

  const generateMusicXML = (): string => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>Generated ${generationType === 'imitation' ? 'Imitation' : 'Fugue'}</work-title>
  </work>
  <identification>
    <creator type="composer">Imitative Fugue Suite</creator>
    <encoding>
      <software>Figma Make Musical Engine</software>
      <encoding-date>${new Date().toISOString().split('T')[0]}</encoding-date>
    </encoding>
  </identification>
  <part-list>
${parts.map((_, index) => `    <score-part id="P${index + 1}">
      <part-name>Part ${index + 1}</part-name>
    </score-part>`).join('\n')}
  </part-list>
${parts.map((part, partIndex) => `  <part id="P${partIndex + 1}">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key>
          <fifths>${selectedKeySignature?.sharps || 0}</fifths>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
${part.melody.map((pitch, noteIndex) => {
  const noteName = PITCH_NAMES[pitch].replace('♯', 'sharp').replace('♭', 'flat');
  const octave = 4;
  return `      <note>
        <pitch>
          <step>${noteName.charAt(0)}</step>
          ${noteName.includes('sharp') ? '<alter>1</alter>' : noteName.includes('flat') ? '<alter>-1</alter>' : ''}
          <octave>${octave}</octave>
        </pitch>
        <duration>4</duration>
        <type>quarter</type>
      </note>`;
}).join('\n')}
    </measure>
  </part>`).join('\n')}
</score-partwise>`;
    
    return xml;
  };

  const generateTextFile = (): string => {
    const timestamp = new Date().toLocaleString();
    let content = `IMITATIVE FUGUE SUITE - GENERATED COMPOSITION
Generated: ${timestamp}

`;

    if (selectedKeySignature) {
      content += `Key Signature: ${selectedKeySignature.name}
`;
    }

    if (selectedMode) {
      content += `Mode: ${selectedMode.name} on ${PITCH_NAMES[selectedMode.final]}
`;
    }

    content += `Generation Type: ${generationType === 'imitation' ? 'Imitation' : 'Fugue'}
Number of Parts: ${parts.length}

`;

    content += `ORIGINAL THEME:
`;
    content += `Notes: ${theme.map(pitch => PITCH_NAMES[pitch]).join(' - ')}
Pitch Classes: [${theme.join(', ')}]

`;

    parts.forEach((part, index) => {
      content += `PART ${index + 1}:
`;
      content += `Melody: ${part.melody.map(pitch => PITCH_NAMES[pitch]).join(' - ')}
`;
      content += `Pitch Classes: [${part.melody.join(', ')}]
`;
      content += `Rhythm: [${part.rhythm.join(', ')}]
`;
      content += `
`;
    });

    content += `MUSICAL ANALYSIS:
`;
    if (selectedMode) {
      content += `- Mode: ${selectedMode.name}
`;
      content += `- Final (Tonic): ${PITCH_NAMES[selectedMode.final]}
`;
      content += `- Step Pattern: [${selectedMode.stepPattern.join(', ')}]
`;
    }

    content += `- Total Notes in Theme: ${theme.length}
`;
    content += `- Total Parts Generated: ${parts.length}
`;
    content += `- Max Part Length: ${Math.max(...parts.map(p => p.melody.length))} notes

`;

    content += `TECHNICAL DETAILS:
`;
    content += `- Engine: Imitative Fugue Suite by HSS
`;
    content += `- Algorithm: ${generationType === 'imitation' ? 'Interval-preserving Imitation' : 'Modal Fugue Construction'}
`;
    content += `- Export Format: Text (.txt)
`;

    return content;
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
      toast.success(`${filename} downloaded successfully!`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download ${filename}`);
    }
  };

  const handleExportMIDI = async () => {
    if (parts.length === 0) {
      toast.error('No parts to export');
      return;
    }

    setIsExporting(true);
    try {
      const midiData = generateMIDIFile();
      const filename = `composition_${generationType || 'theme'}_${Date.now()}.mid`;
      downloadFile(midiData, filename, 'audio/midi');
    } catch (error) {
      console.error('MIDI export error:', error);
      toast.error('Failed to export MIDI file');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportXML = async () => {
    if (parts.length === 0) {
      toast.error('No parts to export');
      return;
    }

    setIsExporting(true);
    try {
      const xmlData = generateMusicXML();
      const filename = `composition_${generationType || 'theme'}_${Date.now()}.xml`;
      downloadFile(xmlData, filename, 'application/xml');
    } catch (error) {
      console.error('XML export error:', error);
      toast.error('Failed to export MusicXML file');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportText = async () => {
    if (theme.length === 0) {
      toast.error('No theme to export');
      return;
    }

    setIsExporting(true);
    try {
      const textData = generateTextFile();
      const filename = `composition_${generationType || 'theme'}_${Date.now()}.txt`;
      downloadFile(textData, filename, 'text/plain');
    } catch (error) {
      console.error('Text export error:', error);
      toast.error('Failed to export text file');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-4 h-4" />
        <h3 className="font-medium">Export Composition</h3>
      </div>
      
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMIDI}
            disabled={isExporting || parts.length === 0}
            className="gap-2"
          >
            <Music className="w-4 h-4" />
            Export MIDI
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportXML}
            disabled={isExporting || parts.length === 0}
            className="gap-2"
          >
            <Code className="w-4 h-4" />
            Export XML
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportText}
            disabled={isExporting || theme.length === 0}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Export Text
          </Button>
        </div>
        
        <Separator />
        
        <div className="text-xs text-muted-foreground space-y-1">
          <div><strong>MIDI (.mid):</strong> Compatible with DAWs and music software</div>
          <div><strong>MusicXML (.xml):</strong> Sheet music format for notation software</div>
          <div><strong>Text (.txt):</strong> Human-readable analysis and note data</div>
        </div>
      </div>
    </Card>
  );
}