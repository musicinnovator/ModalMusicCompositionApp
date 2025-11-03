/**
 * MIDI to Accompaniment Converter
 * ADDITIVE: Converts MIDI files (Type 0, 1, 2) to Composer Accompaniment JSON format
 * Allows users to fill in metadata and generates compatible JSON for upload
 * 
 * Harris Software Solutions LLC
 */

import { useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  Upload, 
  Download, 
  FileMusic, 
  Music, 
  Wand2, 
  AlertCircle,
  CheckCircle2,
  Info,
  FileJson
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { MidiNote, NoteValue } from '../types/musical';
import { MidiFileParser, MidiFileInfo, NoteEvent } from '../lib/midi-parser';

// ADDITIVE: Available options matching Composer Accompaniment Library
const COMPOSERS = ["Bach", "Beethoven", "Mozart", "Handel", "Chopin", "Schumann", "Brahms", "Liszt", "Haydn", "Debussy"];
const PERIODS = ["Baroque", "Classical", "Romantic", "Impressionist"];
const DIFFICULTIES = ["beginner", "intermediate", "advanced", "virtuoso"];
const HARMONY_TYPES = [
  "alberti-bass", "waltz-bass", "broken-chord", "arpeggiated", "stride", 
  "murky-bass", "drum-bass", "pedal-point", "ostinato", "chaconne", "ground-bass"
];
const VOICING_TYPES = ["left-hand", "right-hand", "both-hands", "bass-line"];
const TIME_SIGNATURES = ["4/4", "3/4", "2/4", "6/8", "12/8", "5/4", "7/8"];

interface ConversionResult {
  melody: (MidiNote | MidiNote[] | -1)[];
  rhythm: NoteValue[];
  noteCount: number;
  chordCount: number;
  restCount: number; // ADDITIVE: Track number of rests detected
  uniqueNotes: Set<number>;
  duration: number;
}

interface MidiToAccompanimentConverterProps {
  onConversionComplete?: (jsonData: any) => void;
}

export function MidiToAccompanimentConverter({ onConversionComplete }: MidiToAccompanimentConverterProps) {
  // ADDITIVE: State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  // ADDITIVE: Metadata state
  const [filename, setFilename] = useState('');
  const [composer, setComposer] = useState('');
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState('');
  const [description, setDescription] = useState('');
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [difficulty, setDifficulty] = useState('');
  const [harmonyType, setHarmonyType] = useState('');
  const [voicingType, setVoicingType] = useState('');
  const [commonIn, setCommonIn] = useState('');

  // ADDITIVE: Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.mid') && !file.name.toLowerCase().endsWith('.midi')) {
      toast.error('Invalid file type', {
        description: 'Please select a MIDI file (.mid or .midi)'
      });
      return;
    }

    setSelectedFile(file);
    
    // Auto-fill filename if not set
    if (!filename) {
      const baseName = file.name.replace(/\.(mid|midi)$/i, '');
      setFilename(baseName);
    }
    
    toast.success('MIDI file loaded', {
      description: file.name
    });
  }, [filename]);

  // ADDITIVE: Convert note duration to NoteValue
  // MOVED BEFORE detectChordsWithRests to fix dependency order
  // ENHANCED: Better duration mapping with tolerance for MIDI timing variations
  const durationToNoteValue = useCallback((durationBeats: number): NoteValue => {
    // Map durations to closest note value with tolerance
    const noteValueMap: Array<[number, NoteValue, number]> = [
      [8, 'double-whole', 0.5],      // 8 beats ± 0.5
      [4, 'whole', 0.3],              // 4 beats ± 0.3
      [3, 'dotted-half', 0.2],        // 3 beats ± 0.2
      [2, 'half', 0.15],              // 2 beats ± 0.15
      [1.5, 'dotted-quarter', 0.1],   // 1.5 beats ± 0.1
      [1, 'quarter', 0.08],           // 1 beat ± 0.08
      [0.5, 'eighth', 0.05],          // 0.5 beats ± 0.05
      [0.25, 'sixteenth', 0.03]       // 0.25 beats ± 0.03
    ];

    // Find closest match within tolerance
    let closest: NoteValue = 'quarter';
    let minDiff = Infinity;
    let matchedExactly = false;

    for (const [beats, noteValue, tolerance] of noteValueMap) {
      const diff = Math.abs(beats - durationBeats);
      
      // Check if within tolerance for exact match
      if (diff <= tolerance) {
        closest = noteValue;
        matchedExactly = true;
        break;
      }
      
      // Track closest match if no exact match found
      if (diff < minDiff) {
        minDiff = diff;
        closest = noteValue;
      }
    }

    // Log duration mapping for debugging
    if (!matchedExactly && durationBeats > 0.1) {
      console.log(`⚠️ Duration ${durationBeats.toFixed(3)} beats → ${closest} (diff: ${minDiff.toFixed(3)})`);
    }

    return closest;
  }, []);

  // ADDITIVE: Detect simultaneous notes (chords)
  const detectChords = useCallback((notes: NoteEvent[], threshold: number = 100): (number | number[])[] => {
    if (notes.length === 0) return [];

    const result: (number | number[])[] = [];
    let currentGroup: NoteEvent[] = [notes[0]];

    for (let i = 1; i < notes.length; i++) {
      const currentNote = notes[i];
      const lastNoteStart = currentGroup[0].startTime;

      // If notes start within threshold ticks, they're a chord
      if (Math.abs(currentNote.startTime - lastNoteStart) <= threshold) {
        currentGroup.push(currentNote);
      } else {
        // Process the current group
        if (currentGroup.length === 1) {
          result.push(currentGroup[0].note);
        } else {
          // Sort chord notes from lowest to highest
          const chordNotes = currentGroup.map(n => n.note).sort((a, b) => a - b);
          result.push(chordNotes);
        }
        currentGroup = [currentNote];
      }
    }

    // Process final group
    if (currentGroup.length === 1) {
      result.push(currentGroup[0].note);
    } else {
      const chordNotes = currentGroup.map(n => n.note).sort((a, b) => a - b);
      result.push(chordNotes);
    }

    return result;
  }, []);

  // ADDITIVE: Detect chords AND rests with timing information
  // This preserves the original detectChords function and adds rest detection
  // ENHANCED: Now detects rests at the beginning of the file
  const detectChordsWithRests = useCallback((notes: NoteEvent[], ticksPerQuarter: number, chordThreshold: number = 100, restThreshold: number = 240): {
    melody: (number | number[] | -1)[],
    rhythm: NoteValue[],
    restCount: number
  } => {
    if (notes.length === 0) return { melody: [], rhythm: [], restCount: 0 };

    const melody: (number | number[] | -1)[] = [];
    const rhythm: NoteValue[] = [];
    let restCount = 0;
    
    // ADDITIVE FIX #1: Check for rest at the beginning
    // If the first note doesn't start at tick 0, there's a rest at the beginning
    const firstNoteStart = notes[0].startTime;
    if (firstNoteStart > restThreshold) {
      const initialRestDuration = firstNoteStart / ticksPerQuarter;
      melody.push(-1);
      rhythm.push(durationToNoteValue(initialRestDuration));
      restCount++;
      console.log(`🎵 Detected rest at beginning: ${initialRestDuration.toFixed(3)} beats`);
    }
    
    let currentGroup: NoteEvent[] = [notes[0]];
    let lastEndTime = notes[0].startTime; // Track when last sound ended

    for (let i = 1; i < notes.length; i++) {
      const currentNote = notes[i];
      const lastNoteStart = currentGroup[0].startTime;

      // Check if notes start within threshold ticks (they're a chord)
      if (Math.abs(currentNote.startTime - lastNoteStart) <= chordThreshold) {
        currentGroup.push(currentNote);
      } else {
        // Process the current group (note or chord)
        const groupEndTime = Math.max(...currentGroup.map(n => n.startTime + n.duration));
        
        // Check for gap (rest) before processing the group
        const gapBetweenNotes = currentNote.startTime - groupEndTime;
        
        if (gapBetweenNotes > restThreshold) {
          // There's a rest between the last group and current note
          const restDurationBeats = gapBetweenNotes / ticksPerQuarter;
          melody.push(-1);
          rhythm.push(durationToNoteValue(restDurationBeats));
          restCount++;
        }
        
        // Add the previous group
        if (currentGroup.length === 1) {
          melody.push(currentGroup[0].note);
          const durationBeats = currentGroup[0].duration / ticksPerQuarter;
          rhythm.push(durationToNoteValue(durationBeats));
        } else {
          // Sort chord notes from lowest to highest
          const chordNotes = currentGroup.map(n => n.note).sort((a, b) => a - b);
          melody.push(chordNotes);
          // Use the longest note duration in the chord
          const maxDuration = Math.max(...currentGroup.map(n => n.duration));
          const durationBeats = maxDuration / ticksPerQuarter;
          rhythm.push(durationToNoteValue(durationBeats));
        }
        
        lastEndTime = groupEndTime;
        currentGroup = [currentNote];
      }
    }

    // Process final group
    if (currentGroup.length > 0) {
      if (currentGroup.length === 1) {
        melody.push(currentGroup[0].note);
        const durationBeats = currentGroup[0].duration / ticksPerQuarter;
        rhythm.push(durationToNoteValue(durationBeats));
      } else {
        const chordNotes = currentGroup.map(n => n.note).sort((a, b) => a - b);
        melody.push(chordNotes);
        const maxDuration = Math.max(...currentGroup.map(n => n.duration));
        const durationBeats = maxDuration / ticksPerQuarter;
        rhythm.push(durationToNoteValue(durationBeats));
      }
    }

    return { melody, rhythm, restCount };
  }, [durationToNoteValue]);

  // ADDITIVE: Process MIDI file
  const processMidiFile = useCallback(async () => {
    if (!selectedFile) {
      toast.error('No file selected', {
        description: 'Please select a MIDI file first'
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Parse MIDI file
      console.log('🎵 Parsing MIDI file...');
      const parser = new MidiFileParser(arrayBuffer);
      const midiData = parser.parse();
      
      console.log('📊 MIDI Data:', {
        format: midiData.format,
        tracks: midiData.tracks.length,
        ticksPerQuarter: midiData.ticksPerQuarter,
        tempo: midiData.tempoChanges[0]?.bpm || 120
      });

      // Collect all notes from all tracks
      let allNotes: NoteEvent[] = [];
      
      midiData.tracks.forEach((track, index) => {
        console.log(`  Track ${index + 1}: ${track.notes.length} notes`);
        allNotes = allNotes.concat(track.notes);
      });

      // Sort by startTime
      allNotes.sort((a, b) => a.startTime - b.startTime);

      if (allNotes.length === 0) {
        throw new Error('No notes found in MIDI file');
      }

      console.log(`🎼 Total notes: ${allNotes.length}`);

      // Detect chords
      const { melody, rhythm, restCount } = detectChordsWithRests(allNotes, midiData.ticksPerQuarter);
      console.log(`🎹 Detected patterns: ${melody.length} (${melody.filter(n => Array.isArray(n)).length} chords, ${restCount} rests)`);

      // Get tempo and ticks per quarter
      const tempo = midiData.tempoChanges[0]?.bpm || 120;
      const ticksPerQuarter = midiData.ticksPerQuarter;

      // Calculate statistics
      const uniqueNotes = new Set<number>();
      let chordCount = 0;
      
      melody.forEach(note => {
        if (Array.isArray(note)) {
          chordCount++;
          note.forEach(n => uniqueNotes.add(n));
        } else {
          uniqueNotes.add(note);
        }
      });

      // Calculate total duration (use last note's end time)
      const lastNote = allNotes[allNotes.length - 1];
      const totalDuration = lastNote ? (lastNote.startTime + lastNote.duration) / ticksPerQuarter : 0;

      const result: ConversionResult = {
        melody: melody as (MidiNote | MidiNote[] | -1)[],
        rhythm: rhythm,
        noteCount: allNotes.length,
        chordCount,
        restCount, // ADDITIVE: Include rest count in result
        uniqueNotes,
        duration: totalDuration
      };

      setConversionResult(result);
      
      toast.success('MIDI file processed successfully!', {
        description: `${result.noteCount} notes, ${result.chordCount} chords detected`
      });

    } catch (error: any) {
      console.error('❌ MIDI processing error:', error);
      toast.error('Failed to process MIDI file', {
        description: error.message || 'Unknown error occurred'
      });
      setConversionResult(null);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, detectChordsWithRests, durationToNoteValue]);

  // ADDITIVE: Validate metadata
  const validateMetadata = useCallback((): string[] => {
    const errors: string[] = [];
    
    if (!filename.trim()) errors.push('Output filename is required');
    if (!composer) errors.push('Composer is required');
    if (!title.trim()) errors.push('Pattern title is required');
    if (!period) errors.push('Period is required');
    if (!description.trim()) errors.push('Description is required');
    if (!difficulty) errors.push('Difficulty is required');
    if (!harmonyType) errors.push('Harmony type is required');
    if (!voicingType) errors.push('Voicing type is required');
    
    return errors;
  }, [filename, composer, title, period, description, difficulty, harmonyType, voicingType]);

  // ADDITIVE: Generate JSON
  const generateJSON = useCallback(() => {
    if (!conversionResult) {
      toast.error('No conversion result', {
        description: 'Please process a MIDI file first'
      });
      return;
    }

    // Validate metadata
    const errors = validateMetadata();
    if (errors.length > 0) {
      toast.error('Missing required fields', {
        description: errors.join(', ')
      });
      return;
    }

    // Parse commonIn into array
    const commonInArray = commonIn.trim() 
      ? commonIn.split(',').map(s => s.trim()).filter(s => s)
      : ['Custom'];

    // Create the pattern object at root level (matching the library's expected format)
    const patternObject = {
      "id": `midi-import-${Date.now()}`,
      "composer": composer,
      "title": title,
      "period": period,
      "description": description,
      "pattern": {
        "melody": conversionResult.melody,
        "rhythm": conversionResult.rhythm,
        "timeSignature": timeSignature,
        "repeatCount": 1
      },
      "metadata": {
        "difficulty": difficulty,
        "harmonyType": harmonyType,
        "voicingType": voicingType,
        "commonIn": commonInArray
      },
      "tags": ["midi-import", "custom"]
    };

    // Create JSON structure with instructions and the pattern
    const jsonData = {
      "_README": {
        "file_type": "ACCOMPANIMENT_PATTERN_FROM_MIDI",
        "description": "Converted from MIDI file using MIDI to Accompaniment Converter",
        "source_file": selectedFile?.name || 'unknown.mid',
        "conversion_date": new Date().toISOString(),
        "note_count": conversionResult.noteCount,
        "chord_count": conversionResult.chordCount,
        "IMPORTANT": "Delete this _README and _INSTRUCTIONS section before uploading!"
      },
      "_INSTRUCTIONS": {
        "STEP_1": "Delete the _README and _INSTRUCTIONS sections (these two objects)",
        "STEP_2": "The file should be a JSON array containing just the pattern object",
        "STEP_3": "Or you can upload as-is and the library will extract the pattern automatically",
        "FORMAT_NOTE": "The library expects an array of patterns at root level, like: [{ composer, title, pattern, ... }]"
      },
      "patterns": [patternObject]
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(jsonData, null, 2);

    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('JSON file downloaded!', {
      description: `${filename}.json - Ready to upload to Composer Accompaniment Library`
    });

    // Callback
    onConversionComplete?.(jsonData);

  }, [conversionResult, validateMetadata, filename, composer, title, period, description, 
      timeSignature, difficulty, harmonyType, voicingType, commonIn, selectedFile, onConversionComplete]);

  // ADDITIVE: Reset form
  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setConversionResult(null);
    setFilename('');
    setComposer('');
    setTitle('');
    setPeriod('');
    setDescription('');
    setTimeSignature('4/4');
    setDifficulty('');
    setHarmonyType('');
    setVoicingType('');
    setCommonIn('');
    toast.success('Form reset');
  }, []);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <FileMusic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">MIDI to Accompaniment Converter</h2>
              <p className="text-sm text-muted-foreground">
                Convert MIDI files (Type 0, 1, 2) to Composer Accompaniment JSON format
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Info className="w-3 h-3" />
            MIDI Import Tool
          </Badge>
        </div>

        <Separator />

        {/* Info Panel */}
        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">How to use:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                <li>Select a MIDI file (supports Type 0, 1, and 2)</li>
                <li>Click "Process MIDI File" to analyze notes and chords</li>
                <li>Fill in all metadata fields (composer, title, etc.)</li>
                <li>Click "Generate JSON" to download the accompaniment file</li>
                <li>Upload the JSON file in the Composer Accompaniment Library</li>
              </ol>
            </div>
          </div>
        </div>

        {/* File Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">1. Select MIDI File</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept=".mid,.midi"
              onChange={handleFileSelect}
              className="flex-1"
            />
            {selectedFile && (
              <Badge variant="secondary" className="gap-1">
                <FileMusic className="w-3 h-3" />
                {selectedFile.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Process Button */}
        {selectedFile && !conversionResult && (
          <Button 
            onClick={processMidiFile} 
            disabled={isProcessing}
            className="w-full"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing MIDI File...' : 'Process MIDI File'}
          </Button>
        )}

        {/* Conversion Result */}
        {conversionResult && (
          <>
            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="space-y-2 text-sm flex-1">
                  <p className="font-medium text-green-900 dark:text-green-100">MIDI Processing Complete!</p>
                  <div className="grid grid-cols-2 gap-2 text-green-800 dark:text-green-200">
                    <div>
                      <strong>Total Notes:</strong> {conversionResult.noteCount}
                    </div>
                    <div>
                      <strong>Chords Detected:</strong> {conversionResult.chordCount}
                    </div>
                    <div>
                      <strong>Rests Detected:</strong> {conversionResult.restCount}
                    </div>
                    <div>
                      <strong>Unique Notes:</strong> {conversionResult.uniqueNotes.size}
                    </div>
                    <div>
                      <strong>Pattern Length:</strong> {conversionResult.melody.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Metadata Form */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">2. Fill in Metadata</Label>
              
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {/* Filename */}
                  <div className="space-y-2">
                    <Label htmlFor="filename">Output Filename *</Label>
                    <Input
                      id="filename"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      placeholder="my-accompaniment"
                    />
                  </div>

                  {/* Composer */}
                  <div className="space-y-2">
                    <Label htmlFor="composer">Composer *</Label>
                    <Select value={composer} onValueChange={setComposer}>
                      <SelectTrigger id="composer">
                        <SelectValue placeholder="Select composer" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPOSERS.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Pattern Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Simple Waltz Pattern"
                    />
                  </div>

                  {/* Period */}
                  <div className="space-y-2">
                    <Label htmlFor="period">Period *</Label>
                    <Select value={period} onValueChange={setPeriod}>
                      <SelectTrigger id="period">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        {PERIODS.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the pattern and its characteristics..."
                      rows={3}
                    />
                  </div>

                  {/* Time Signature */}
                  <div className="space-y-2">
                    <Label htmlFor="timeSignature">Time Signature</Label>
                    <Select value={timeSignature} onValueChange={setTimeSignature}>
                      <SelectTrigger id="timeSignature">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SIGNATURES.map(ts => (
                          <SelectItem key={ts} value={ts}>{ts}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty *</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTIES.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Harmony Type */}
                  <div className="space-y-2">
                    <Label htmlFor="harmonyType">Harmony Type *</Label>
                    <Select value={harmonyType} onValueChange={setHarmonyType}>
                      <SelectTrigger id="harmonyType">
                        <SelectValue placeholder="Select harmony type" />
                      </SelectTrigger>
                      <SelectContent>
                        {HARMONY_TYPES.map(ht => (
                          <SelectItem key={ht} value={ht}>{ht}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Voicing Type */}
                  <div className="space-y-2">
                    <Label htmlFor="voicingType">Voicing Type *</Label>
                    <Select value={voicingType} onValueChange={setVoicingType}>
                      <SelectTrigger id="voicingType">
                        <SelectValue placeholder="Select voicing type" />
                      </SelectTrigger>
                      <SelectContent>
                        {VOICING_TYPES.map(vt => (
                          <SelectItem key={vt} value={vt}>{vt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Common In */}
                  <div className="space-y-2">
                    <Label htmlFor="commonIn">Common In (comma-separated)</Label>
                    <Input
                      id="commonIn"
                      value={commonIn}
                      onChange={(e) => setCommonIn(e.target.value)}
                      placeholder="e.g., Sonatas, Waltzes, Nocturnes"
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple values with commas
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleReset} variant="outline">
                <AlertCircle className="w-4 h-4 mr-2" />
                Reset Form
              </Button>
              <Button onClick={generateJSON}>
                <Download className="w-4 h-4 mr-2" />
                Generate JSON
              </Button>
            </div>

            {/* Next Steps */}
            <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <FileJson className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-purple-900 dark:text-purple-100">After downloading:</p>
                  <ol className="list-decimal list-inside space-y-1 text-purple-800 dark:text-purple-200">
                    <li>Go to "Famous Composer Accompaniments" card above</li>
                    <li>Click "Upload JSON" button in the blue upload section</li>
                    <li>Select your downloaded file</li>
                    <li>The library will automatically extract the pattern from the JSON</li>
                    <li>Your MIDI pattern is now available as an accompaniment!</li>
                  </ol>
                  <div className="mt-3 p-2 bg-white/50 dark:bg-black/20 rounded border border-purple-200/50">
                    <p className="text-xs font-medium">💡 No manual editing needed!</p>
                    <p className="text-xs">The JSON file can be uploaded as-is. The library automatically extracts the pattern data.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}