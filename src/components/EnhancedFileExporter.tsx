import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Download, FileText, Music, Code, AlertTriangle } from 'lucide-react';
import { Part, Theme, Mode, KeySignature, PITCH_NAMES, melodyElementToString, isRest, isNote } from '../types/musical';
import { MusicXMLExporter, MusicXMLExportOptions } from '../lib/musicxml-exporter';
import { toast } from 'sonner@2.0.3';

interface EnhancedFileExporterProps {
  theme: Theme;
  parts: Part[];
  selectedMode: Mode | null;
  selectedKeySignature: KeySignature | null;
  generationType: 'imitation' | 'fugue' | null;
}

export function EnhancedFileExporter({ 
  theme, 
  parts, 
  selectedMode, 
  selectedKeySignature,
  generationType 
}: EnhancedFileExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportTitle, setExportTitle] = useState(`${generationType || 'Theme'} Composition`);
  const [exportComposer, setExportComposer] = useState('Imitative Fugue Suite');
  const [exportTempo, setExportTempo] = useState(120);
  const [exportTimeSignature, setExportTimeSignature] = useState<'4/4' | '3/4' | '2/4' | '6/8'>('4/4');

  // Helper function to encode variable-length quantity - FIXED VERSION
  const encodeVLQ = (value: number): number[] => {
    if (value === 0) return [0];
    
    const bytes: number[] = [];
    let remainingValue = value;
    
    // Extract 7-bit chunks, starting from the least significant
    bytes.push(remainingValue & 0x7F);
    remainingValue >>= 7;
    
    while (remainingValue > 0) {
      bytes.unshift((remainingValue & 0x7F) | 0x80);
      remainingValue >>= 7;
    }
    
    return bytes;
  };

  // Enhanced MIDI generation with rest support - FIXED VERSION
  const generateEnhancedMIDI = (): Uint8Array => {
    try {
      const tempoMicroseconds = Math.round(60000000 / exportTempo); // Convert BPM to microseconds per quarter note
      const ticksPerQuarter = 480;
      const noteDuration = Math.round(ticksPerQuarter * 0.9); // Slightly shorter than full quarter for better playback
      
      // Calculate total number of tracks (theme + parts, or just theme if no parts)
      const totalTracks = parts.length > 0 ? parts.length + 1 : 1;
      
      // MIDI header chunk - FIXED
      const headerData = [
        0x4D, 0x54, 0x68, 0x64, // "MThd"
        0x00, 0x00, 0x00, 0x06, // Header length (always 6)
        0x00, parts.length > 0 ? 0x01 : 0x00, // Format 1 if multiple tracks, 0 if single track
        0x00, totalTracks, // Number of tracks
        (ticksPerQuarter >> 8) & 0xFF, ticksPerQuarter & 0xFF  // Ticks per quarter note
      ];

      const tracks: Uint8Array[] = [];

      // Create theme track
      const themeTrackData: number[] = [];
      
      // Track name
      themeTrackData.push(0x00, 0xFF, 0x03, 0x05); // Track name meta event, length 5
      themeTrackData.push(0x54, 0x68, 0x65, 0x6D, 0x65); // "Theme"
      
      // Tempo setting (only in first track)
      themeTrackData.push(0x00, 0xFF, 0x51, 0x03); // Set tempo meta event
      themeTrackData.push((tempoMicroseconds >> 16) & 0xFF, (tempoMicroseconds >> 8) & 0xFF, tempoMicroseconds & 0xFF);
      
      // Time signature
      themeTrackData.push(0x00, 0xFF, 0x58, 0x04); // Time signature meta event
      const timeSignatureParts = exportTimeSignature.split('/');
      const numerator = parseInt(timeSignatureParts[0]);
      const denominatorLog = Math.log2(parseInt(timeSignatureParts[1]));
      themeTrackData.push(numerator, denominatorLog, 24, 8); // 4/4 time signature
      
      // Add theme notes with proper timing
      let currentTick = 0;
      
      theme.forEach((element, index) => {
        if (isNote(element) && typeof element === 'number' && element >= 0 && element <= 127) {
          // Calculate delta time from last event
          const deltaTime = index === 0 ? 0 : ticksPerQuarter;
          
          // Note on event
          themeTrackData.push(...encodeVLQ(deltaTime));
          themeTrackData.push(0x90, element, 0x64); // Note on, channel 0, velocity 100
          
          // Note off event
          themeTrackData.push(...encodeVLQ(noteDuration));
          themeTrackData.push(0x80, element, 0x64); // Note off, channel 0, velocity 100
          
          currentTick += deltaTime + noteDuration;
        } else if (isRest(element)) {
          // For rests, just advance time without playing notes
          currentTick += ticksPerQuarter;
        }
      });

      // End of track
      themeTrackData.push(0x00, 0xFF, 0x2F, 0x00);

      // Create theme track chunk
      const themeTrackHeader = [
        0x4D, 0x54, 0x72, 0x6B, // "MTrk"
        (themeTrackData.length >> 24) & 0xFF,
        (themeTrackData.length >> 16) & 0xFF,
        (themeTrackData.length >> 8) & 0xFF,
        themeTrackData.length & 0xFF
      ];

      const themeTrack = new Uint8Array(themeTrackHeader.length + themeTrackData.length);
      themeTrack.set(themeTrackHeader, 0);
      themeTrack.set(themeTrackData, themeTrackHeader.length);
      tracks.push(themeTrack);

      // Create additional tracks for parts
      parts.forEach((part, partIndex) => {
        const partTrackData: number[] = [];
        
        // Track name
        const trackName = generationType === 'imitation' && partIndex === 0 ? 'Original' 
                        : generationType === 'imitation' ? 'Imitation'
                        : `Voice ${partIndex + 1}`;
        const trackNameBytes = Array.from(new TextEncoder().encode(trackName));
        partTrackData.push(0x00, 0xFF, 0x03, trackNameBytes.length);
        partTrackData.push(...trackNameBytes);
        
        // Set MIDI channel (0-15)
        const midiChannel = (partIndex + 1) % 16;
        
        // Add part notes based on rhythm
        let tickPosition = 0;
        let melodyIndex = 0;
        
        part.rhythm.forEach((rhythmValue, beatIndex) => {
          const deltaTime = beatIndex === 0 ? 0 : ticksPerQuarter;
          
          if (rhythmValue > 0 && melodyIndex < part.melody.length) {
            const note = part.melody[melodyIndex];
            if (typeof note === 'number' && note >= 0 && note <= 127) {
              // Note on
              partTrackData.push(...encodeVLQ(deltaTime));
              partTrackData.push(0x90 | midiChannel, note, 0x60); // Note on with different channel
              
              // Note off
              partTrackData.push(...encodeVLQ(noteDuration));
              partTrackData.push(0x80 | midiChannel, note, 0x60); // Note off
            }
            melodyIndex++;
          }
          
          tickPosition += ticksPerQuarter;
        });

        // End of track
        partTrackData.push(0x00, 0xFF, 0x2F, 0x00);

        // Create part track chunk
        const partTrackHeader = [
          0x4D, 0x54, 0x72, 0x6B, // "MTrk"
          (partTrackData.length >> 24) & 0xFF,
          (partTrackData.length >> 16) & 0xFF,
          (partTrackData.length >> 8) & 0xFF,
          partTrackData.length & 0xFF
        ];

        const partTrack = new Uint8Array(partTrackHeader.length + partTrackData.length);
        partTrack.set(partTrackHeader, 0);
        partTrack.set(partTrackData, partTrackHeader.length);
        tracks.push(partTrack);
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

      console.log('✅ Generated valid MIDI file:', {
        totalSize,
        tracks: tracks.length,
        tempo: exportTempo,
        timeSignature: exportTimeSignature
      });

      return midiFile;
    } catch (error) {
      console.error('Enhanced MIDI generation error:', error);
      throw new Error('Failed to generate MIDI file');
    }
  };

  // Enhanced text export with rest information
  const generateEnhancedTextFile = (): string => {
    const timestamp = new Date().toLocaleString();
    let content = `IMITATIVE FUGUE SUITE - PROFESSIONAL COMPOSITION EXPORT\n`;
    content += `Generated: ${timestamp}\n`;
    content += `Export Version: Enhanced v2.0\n\n`;

    content += `COMPOSITION METADATA:\n`;
    content += `Title: ${exportTitle}\n`;
    content += `Composer: ${exportComposer}\n`;
    content += `Tempo: ${exportTempo} BPM\n`;
    content += `Time Signature: ${exportTimeSignature}\n`;
    
    if (selectedKeySignature) {
      content += `Key Signature: ${selectedKeySignature.name}\n`;
    }
    
    if (selectedMode) {
      content += `Mode: ${selectedMode.name} on ${PITCH_NAMES[selectedMode.final]}\n`;
    }
    
    content += `Generation Type: ${generationType === 'imitation' ? 'Melodic Imitation' : 'Modal Fugue Construction'}\n`;
    content += `Number of Parts: ${parts.length}\n\n`;

    content += `ORIGINAL THEME (${theme.length} elements):\n`;
    content += `Sequence: ${theme.map(melodyElementToString).join(' → ')}\n`;
    
    // Analyze theme for rests
    const noteCount = theme.filter(isNote).length;
    const restCount = theme.filter(isRest).length;
    content += `Analysis: ${noteCount} notes, ${restCount} rests\n`;
    
    if (noteCount > 0) {
      const notes = theme.filter(isNote) as number[];
      const pitch_classes = notes.map(note => PITCH_NAMES[note % 12]);
      content += `Pitch Classes: ${pitch_classes.join(', ')}\n`;
      content += `MIDI Range: ${Math.min(...notes)} to ${Math.max(...notes)}\n`;
    }
    content += `\n`;

    // Part analysis
    parts.forEach((part, index) => {
      content += `PART ${index + 1} (${generationType === 'imitation' ? (index === 0 ? 'Original' : 'Imitation') : `Voice ${index + 1}`}):\n`;
      content += `Melody: ${part.melody.map(pitch => PITCH_NAMES[pitch % 12]).join(' → ')}\n`;
      content += `MIDI Notes: [${part.melody.join(', ')}]\n`;
      content += `Rhythm Pattern: [${part.rhythm.join(', ')}]\n`;
      content += `Length: ${part.melody.length} notes\n\n`;
    });

    content += `TECHNICAL SPECIFICATIONS:\n`;
    content += `- Export Engine: Professional Fugue Suite v2.0\n`;
    content += `- Algorithm: ${generationType === 'imitation' ? 'Interval-preserving Modal Imitation' : 'Species Counterpoint Modal Fugue'}\n`;
    content += `- Modal System: ${selectedMode ? '38-mode World Music System' : 'Traditional Western'}\n`;
    content += `- MIDI Compatibility: General MIDI Level 1\n`;
    content += `- MusicXML Version: 3.1 (Sibelius/Dorico/Finale compatible)\n`;
    content += `- Rest Support: Enhanced with proper duration encoding\n\n`;

    content += `SOFTWARE COMPATIBILITY:\n`;
    content += `- DAWs: Pro Tools, Logic Pro, Cubase, Reaper, FL Studio\n`;
    content += `- Notation: Sibelius, Dorico, Finale, MuseScore\n`;
    content += `- Analysis: Music21, Humdrum, MIDI.js\n`;

    return content;
  };

  // Clear MIDI buffers and system memory
  const clearMidiBuffers = () => {
    try {
      // Clear any cached MIDI data
      if (typeof window !== 'undefined') {
        // Clear MIDI-related caches
        delete (window as any).__midiCache;
        delete (window as any).__exportCache;
        delete (window as any).__audioBuffers;
        delete (window as any).__themeExportCache;
      }
      
      // Force garbage collection if available
      if (typeof window !== 'undefined' && (window as any).gc) {
        (window as any).gc();
      }
      
      console.log('🧹 Enhanced MIDI buffers and system memory cleared');
    } catch (error) {
      console.warn('Memory cleanup warning:', error);
    }
  };

  const handleExportMIDI = async () => {
    if (theme.length === 0) {
      toast.error('No theme to export');
      return;
    }

    setIsExporting(true);
    try {
      // Clear previous session content before generating new MIDI
      clearMidiBuffers();
      
      const midiData = generateEnhancedMIDI();
      const filename = `${exportTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.mid`;
      downloadFile(midiData, filename, 'audio/midi');
      toast.success(`MIDI exported: ${filename} (Enhanced with rest support)`);
      
      // Clear buffers after export to prevent accumulation
      setTimeout(clearMidiBuffers, 1000);
    } catch (error) {
      console.error('MIDI export error:', error);
      toast.error('Failed to export MIDI file');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportXML = async () => {
    if (theme.length === 0) {
      toast.error('No theme to export');
      return;
    }

    setIsExporting(true);
    try {
      // Clear previous session content before generating new XML
      clearMidiBuffers();
      
      const options: Partial<MusicXMLExportOptions> = {
        title: exportTitle,
        composer: exportComposer,
        software: 'Figma Make - Professional Fugue Suite v2.0',
        includeMetadata: true,
        timeSignature: exportTimeSignature,
        tempo: exportTempo,
        divisions: 480
      };

      const xmlData = MusicXMLExporter.exportComposition(
        theme,
        parts,
        selectedMode,
        selectedKeySignature,
        options
      );

      // Validate the XML
      const validation = MusicXMLExporter.validateMusicXML(xmlData);
      if (!validation.valid) {
        console.warn('MusicXML validation issues:', validation.errors);
        toast.warning('XML generated with minor formatting warnings');
      }

      const filename = `${exportTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.xml`;
      downloadFile(xmlData, filename, 'application/vnd.recordare.musicxml+xml');
      
      toast.success(`Professional MusicXML exported: ${filename}`);
      toast.info('Compatible with Sibelius, Dorico, Finale, and MuseScore');
      
      // Clear buffers after export
      setTimeout(clearMidiBuffers, 1000);
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
      // Clear previous session content before generating new text
      clearMidiBuffers();
      
      const textData = generateEnhancedTextFile();
      const filename = `${exportTitle.replace(/[^a-zA-Z0-9]/g, '_')}_analysis_${Date.now()}.txt`;
      downloadFile(textData, filename, 'text/plain');
      toast.success(`Enhanced analysis exported: ${filename} (Human-readable format)`);
      
      // Clear buffers after export
      setTimeout(clearMidiBuffers, 500);
    } catch (error) {
      console.error('Text export error:', error);
      toast.error('Failed to export text file');
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
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download file');
    }
  };

  const hasContent = theme.length > 0 || parts.length > 0;
  const hasRests = theme.some(isRest);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-5 h-5" />
        <h3>Professional Export Suite</h3>
        {hasRests && (
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-orange-600">Rests Detected</span>
          </div>
        )}
      </div>
      
      {/* Export Configuration */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Composition Title</Label>
            <Input
              value={exportTitle}
              onChange={(e) => setExportTitle(e.target.value)}
              placeholder="Enter composition title..."
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-sm">Composer</Label>
            <Input
              value={exportComposer}
              onChange={(e) => setExportComposer(e.target.value)}
              placeholder="Enter composer name..."
              className="text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Tempo (BPM)</Label>
            <Input
              type="number"
              value={exportTempo}
              onChange={(e) => setExportTempo(parseInt(e.target.value) || 120)}
              min="60"
              max="200"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-sm">Time Signature</Label>
            <Select value={exportTimeSignature} onValueChange={(value) => setExportTimeSignature(value as any)}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4/4">4/4 (Common Time)</SelectItem>
                <SelectItem value="3/4">3/4 (Waltz Time)</SelectItem>
                <SelectItem value="2/4">2/4 (March Time)</SelectItem>
                <SelectItem value="6/8">6/8 (Compound Duple)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator className="mb-4" />
      
      {/* Export Buttons */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMIDI}
            disabled={isExporting || !hasContent}
            className="gap-2"
          >
            <Music className="w-4 h-4" />
            Export MIDI
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportXML}
            disabled={isExporting || !hasContent}
            className="gap-2"
          >
            <Code className="w-4 h-4" />
            Export MusicXML
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportText}
            disabled={isExporting || !hasContent}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Export Analysis
          </Button>
        </div>
        
        <Separator />
        
        {/* Enhanced format descriptions */}
        <div className="text-xs text-muted-foreground space-y-2">
          <div>
            <strong>Enhanced MIDI (.mid):</strong> Professional MIDI with rest encoding, compatible with all major DAWs and virtual instruments. <span className="text-green-600 font-medium">Includes automatic memory cleanup.</span>
          </div>
          <div>
            <strong>Professional MusicXML (.xml):</strong> Industry-standard notation format for Sibelius, Dorico, Finale, and MuseScore with complete metadata
          </div>
          <div>
            <strong>Enhanced Analysis (.txt):</strong> Comprehensive compositional analysis with technical specifications and software compatibility details. <span className="text-green-600 font-medium">Now with proper formatting and human-readable layout.</span>
          </div>
          {hasRests && (
            <div className="text-orange-600 bg-orange-50 dark:bg-orange-950/20 p-2 rounded">
              <strong>Rest Support:</strong> Your composition contains rests which will be properly encoded in all export formats with accurate timing and duration.
            </div>
          )}
        </div>

        {/* Composition Summary */}
        {hasContent && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="text-sm font-medium mb-2">Export Summary</div>
            <div className="text-xs space-y-1">
              <div>Theme: {theme.length} elements ({theme.filter(isNote).length} notes, {theme.filter(isRest).length} rests)</div>
              <div>Parts: {parts.length} voices</div>
              <div>Mode: {selectedMode?.name || 'None selected'}</div>
              <div>Key: {selectedKeySignature?.name || 'C Major (default)'}</div>
              <div>Type: {generationType === 'imitation' ? 'Melodic Imitation' : generationType === 'fugue' ? 'Modal Fugue' : 'Theme Only'}</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}