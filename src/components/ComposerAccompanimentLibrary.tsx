/**
 * Composer Accompaniment Library Component - SIMPLIFIED VERSION
 * Professional UI for browsing and adding famous accompaniment patterns to Song Suite
 * 
 * Simple editing: Transpose, Expand, Truncate, Combine
 * Direct integration with Song Suite (like Counterpoints, Canons, Fugues)
 * 
 * Harris Software Solutions LLC
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { 
  ComposerAccompanimentLibrary as Library,
  ComposerAccompaniment,
  ComposerName,
  MusicalPeriod,
  HarmonyType,
  DifficultyLevel,
  AccompanimentEditParams
} from '../lib/composer-accompaniment-library';
import { Mode, KeySignature, Theme, BachLikeVariables, BachVariableName, MidiNote, NoteValue, midiNoteToNoteName } from '../types/musical';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { 
  Music, 
  Music4, 
  Play, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Download,
  Search,
  Filter,
  Sparkles,
  Wand2,
  Piano,
  ListMusic,
  Layers,
  Copy,
  Scissors,
  Repeat,
  Upload,
  FileJson
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ComposerAccompanimentVisualizer } from './ComposerAccompanimentVisualizer';
import { InstrumentType } from '../lib/enhanced-synthesis';

// ADDITIVE: New interface for adding to Song Suite
// Updated to support chords (arrays of notes) and rests (-1)
interface ComposerAccompanimentLibraryProps {
  currentTheme?: Theme;
  currentMode?: Mode | null;
  currentKeySignature?: KeySignature | null;
  bachVariables?: BachLikeVariables;
  onAddToSongSuite?: (accompaniment: (MidiNote | MidiNote[] | -1)[], rhythm: NoteValue[], label: string) => void;
  onPlayAccompaniment?: (melody: (MidiNote | MidiNote[] | -1)[], rhythm: NoteValue[]) => void;
  // PRESERVE: Keep old handlers for backward compatibility
  onApplyToTheme?: (accompaniment: MidiNote[], rhythm: NoteValue[], label: string) => void;
  onApplyToBachVariable?: (variable: BachVariableName, accompaniment: MidiNote[], rhythm: NoteValue[]) => void;
}

export function ComposerAccompanimentLibrary({
  currentTheme,
  currentMode,
  currentKeySignature,
  bachVariables,
  onAddToSongSuite,
  onPlayAccompaniment,
  onApplyToTheme,
  onApplyToBachVariable
}: ComposerAccompanimentLibraryProps) {
  // === STATE MANAGEMENT ===
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComposer, setSelectedComposer] = useState<ComposerName | 'all'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<MusicalPeriod | 'all'>('all');
  const [selectedHarmonyType, setSelectedHarmonyType] = useState<HarmonyType | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [selectedAccompaniment, setSelectedAccompaniment] = useState<ComposerAccompaniment | null>(null);
  
  // Simple editing state
  const [transposeInterval, setTransposeInterval] = useState([0]);
  const [expandRepetitions, setExpandRepetitions] = useState([2]);
  const [truncateLength, setTruncateLength] = useState([8]);
  const [autoAdaptKey, setAutoAdaptKey] = useState(true);
  
  // Edited accompaniment (result of simple edits)
  const [editedAccompaniment, setEditedAccompaniment] = useState<ComposerAccompaniment | null>(null);
  
  // Combination state
  const [selectedForCombine, setSelectedForCombine] = useState<ComposerAccompaniment | null>(null);
  
  // ADDITIVE: JSON upload state
  const [uploadedCount, setUploadedCount] = useState(0);
  
  // ADDITIVE: Visualizer state - rhythm and instrument controls
  const [customRhythm, setCustomRhythm] = useState<NoteValue[] | undefined>(undefined);
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('piano');
  
  // ADDITIVE FIX #3: Preview playback state for stop/toggle functionality
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackControllerRef = useRef<any>(null);

  // === DATA RETRIEVAL ===
  const allComposers = useMemo(() => Library.getAllComposers(), []);
  const allPeriods = useMemo(() => Library.getAllPeriods(), []);
  const allHarmonyTypes = useMemo(() => Library.getAllHarmonyTypes(), []);

  // === FILTERED ACCOMPANIMENTS ===
  const filteredAccompaniments = useMemo(() => {
    let results = Library.getAll();

    // Filter by search
    if (searchQuery.trim()) {
      results = Library.search(searchQuery);
    }

    // Filter by composer
    if (selectedComposer !== 'all') {
      results = results.filter(acc => acc.composer === selectedComposer);
    }

    // Filter by period
    if (selectedPeriod !== 'all') {
      results = results.filter(acc => acc.period === selectedPeriod);
    }

    // Filter by harmony type
    if (selectedHarmonyType !== 'all') {
      results = results.filter(acc => acc.metadata.harmonyType === selectedHarmonyType);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      results = results.filter(acc => acc.metadata.difficulty === selectedDifficulty);
    }

    return results;
  }, [searchQuery, selectedComposer, selectedPeriod, selectedHarmonyType, selectedDifficulty]);

  // === SIMPLE EDITING HANDLERS ===
  const handleTranspose = useCallback(() => {
    if (!selectedAccompaniment) return;
    
    try {
      const edited = Library.transposeAccompaniment(
        selectedAccompaniment,
        transposeInterval[0]
      );
      setEditedAccompaniment(edited);
      toast.success(`Transposed ${transposeInterval[0] > 0 ? 'up' : 'down'} by ${Math.abs(transposeInterval[0])} semitones`);
    } catch (error) {
      console.error('Transpose error:', error);
      toast.error('Failed to transpose');
    }
  }, [selectedAccompaniment, transposeInterval]);

  const handleExpand = useCallback(() => {
    if (!selectedAccompaniment) return;
    
    try {
      const edited = Library.expandAccompaniment(
        selectedAccompaniment,
        expandRepetitions[0]
      );
      setEditedAccompaniment(edited);
      toast.success(`Expanded to ${expandRepetitions[0]} repetitions`);
    } catch (error) {
      console.error('Expand error:', error);
      toast.error('Failed to expand');
    }
  }, [selectedAccompaniment, expandRepetitions]);

  const handleTruncate = useCallback(() => {
    if (!selectedAccompaniment) return;
    
    try {
      const edited = Library.truncateAccompaniment(
        selectedAccompaniment,
        truncateLength[0]
      );
      setEditedAccompaniment(edited);
      toast.success(`Truncated to ${truncateLength[0]} notes`);
    } catch (error) {
      console.error('Truncate error:', error);
      toast.error('Failed to truncate');
    }
  }, [selectedAccompaniment, truncateLength]);

  const handleCombine = useCallback(() => {
    if (!selectedAccompaniment || !selectedForCombine) {
      toast.error('Select two accompaniments to combine');
      return;
    }
    
    try {
      const combined = Library.combineAccompaniments(
        selectedAccompaniment,
        selectedForCombine
      );
      setEditedAccompaniment(combined);
      toast.success(`Combined ${selectedAccompaniment.composer} + ${selectedForCombine.composer}`);
    } catch (error) {
      console.error('Combine error:', error);
      toast.error('Failed to combine');
    }
  }, [selectedAccompaniment, selectedForCombine]);

  const handleReset = useCallback(() => {
    setEditedAccompaniment(null);
    setTransposeInterval([0]);
    setExpandRepetitions([2]);
    setTruncateLength([8]);
    toast.success('Reset to original');
  }, []);

  const handlePreview = useCallback(() => {
    const pattern = editedAccompaniment || selectedAccompaniment;
    if (!pattern) {
      toast.error('No pattern selected');
      return;
    }

    try {
      // Expand pattern if it has repetitions
      const expanded = pattern.pattern.repeatCount && pattern.pattern.repeatCount > 1
        ? Library.expandPattern(pattern.pattern)
        : { melody: pattern.pattern.melody, rhythm: pattern.pattern.rhythm };

      onPlayAccompaniment?.(expanded.melody, expanded.rhythm);
      toast.success('Playing accompaniment preview');
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to play preview');
    }
  }, [editedAccompaniment, selectedAccompaniment, onPlayAccompaniment]);

  const handleAddToSongSuite = useCallback(() => {
    const pattern = editedAccompaniment || selectedAccompaniment;
    if (!pattern) {
      toast.error('No pattern selected');
      return;
    }

    try {
      let finalPattern = { ...pattern };

      // Auto-adapt to current key if enabled
      if (autoAdaptKey && currentKeySignature) {
        finalPattern = Library.adaptToKey(pattern, currentKeySignature.key);
      }

      // Expand pattern if it has repetitions
      const expanded = finalPattern.pattern.repeatCount && finalPattern.pattern.repeatCount > 1
        ? Library.expandPattern(finalPattern.pattern)
        : { melody: finalPattern.pattern.melody, rhythm: finalPattern.pattern.rhythm };

      const label = `${finalPattern.composer} - ${finalPattern.title}`;
      onAddToSongSuite?.(expanded.melody, expanded.rhythm, label);
      
      toast.success('Accompaniment added to Song Suite!', {
        description: `${expanded.melody.length} notes from ${finalPattern.composer}`
      });
    } catch (error) {
      console.error('Add to Song Suite error:', error);
      toast.error('Failed to add to Song Suite');
    }
  }, [editedAccompaniment, selectedAccompaniment, autoAdaptKey, currentKeySignature, onAddToSongSuite]);

  // === DIFFICULTY BADGE COLOR ===
  const getDifficultyColor = (difficulty: DifficultyLevel): string => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'virtuoso': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  // === ADDITIVE: JSON FILE UPLOAD HANDLER ===
  // ADDITIVE ENHANCEMENT: Now supports multiple files at once
  const handleJSONUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // ADDITIVE: Track overall statistics for multi-file upload
    let totalSuccessCount = 0;
    let totalErrorCount = 0;
    let totalFilesProcessed = 0;
    const fileResults: { name: string; success: number; errors: number }[] = [];

    // ADDITIVE: Process each file
    const processFile = (file: File, fileIndex: number) => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            
            // ADDITIVE: Check for common formatting issues
            const trimmedContent = content.trim();
            
            // Check if content is wrapped in quotes (common copy-paste error)
            if ((trimmedContent.startsWith('"') && trimmedContent.endsWith('"')) ||
                (trimmedContent.startsWith("'") && trimmedContent.endsWith("'"))) {
              toast.error(`${file.name}: JSON formatting error`, {
                description: 'Remove surrounding quotes from your JSON file. The file should start with { and end with }'
              });
              fileResults.push({ name: file.name, success: 0, errors: 1 });
              totalErrorCount++;
              totalFilesProcessed++;
              resolve();
              return;
            }
            
            // Check if there's content after the JSON ends (common when copying from chat)
            if (trimmedContent.endsWith('}\"') || trimmedContent.endsWith("}' ") || trimmedContent.endsWith('},')) {
              toast.error(`${file.name}: JSON formatting error`, {
                description: 'Extra characters found after JSON. Make sure file ends with } only (no extra quotes or commas)'
              });
              fileResults.push({ name: file.name, success: 0, errors: 1 });
              totalErrorCount++;
              totalFilesProcessed++;
              resolve();
              return;
            }
            
            const jsonData = JSON.parse(content);
            
            // Detect if this is a session file instead of accompaniment data
            if (jsonData.id && jsonData.id.startsWith('session_') && jsonData.data && jsonData.timestamp) {
              toast.error(`${file.name}: Wrong file type - Session file detected`, {
                description: 'This is a session export file, not an accompaniment pattern. Please download the accompaniment template instead.'
              });
              fileResults.push({ name: file.name, success: 0, errors: 1 });
              totalErrorCount++;
              totalFilesProcessed++;
              resolve();
              return;
            }
            
            // Detect if this is a MIDI export file
            if (jsonData.tracks || jsonData.header || jsonData.format) {
              toast.error(`${file.name}: Wrong file type - MIDI data detected`, {
                description: 'This appears to be MIDI data. Please use an accompaniment pattern JSON file instead.'
              });
              fileResults.push({ name: file.name, success: 0, errors: 1 });
              totalErrorCount++;
              totalFilesProcessed++;
              resolve();
              return;
            }
            
            // Detect if this is a theme export
            if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].hasOwnProperty('note') && jsonData[0].hasOwnProperty('duration')) {
              toast.error(`${file.name}: Wrong file type - Theme/Melody data detected`, {
                description: 'This appears to be a theme export. Please use an accompaniment pattern JSON file instead.'
              });
              fileResults.push({ name: file.name, success: 0, errors: 1 });
              totalErrorCount++;
              totalFilesProcessed++;
              resolve();
              return;
            }
            
            // ADDITIVE: Handle MIDI converter format with "patterns" key
            let accompaniments;
            if (jsonData.patterns && Array.isArray(jsonData.patterns)) {
              // MIDI converter format: { "_README": {...}, "_INSTRUCTIONS": {...}, "patterns": [...] }
              accompaniments = jsonData.patterns;
              toast.info(`${file.name}: MIDI converter format detected`, {
                description: 'Extracting pattern data automatically'
              });
            } else {
              // Support both single accompaniment and array of accompaniments
              accompaniments = Array.isArray(jsonData) ? jsonData : [jsonData];
            }
            
            let successCount = 0;
            let errorCount = 0;
            
            accompaniments.forEach((acc: any, index: number) => {
              try {
                // Auto-generate ID if missing
                if (!acc.id) {
                  acc.id = `custom-${Date.now()}-${fileIndex}-${index}`;
                }
                
                // Validate required fields with specific error messages
                const missingFields: string[] = [];
                if (!acc.composer) missingFields.push('composer');
                if (!acc.title) missingFields.push('title');
                if (!acc.period) missingFields.push('period');
                if (!acc.description) missingFields.push('description');
                if (!acc.pattern) missingFields.push('pattern');
                if (!acc.metadata) missingFields.push('metadata');
                
                if (missingFields.length > 0) {
                  throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                }
                
                // Validate pattern structure
                if (!acc.pattern.melody || !Array.isArray(acc.pattern.melody)) {
                  throw new Error('pattern.melody must be an array');
                }
                
                // Validate each melody element (can be single note, chord array, or rest)
                acc.pattern.melody.forEach((element: any, idx: number) => {
                  if (element === -1) {
                    // Valid rest
                    return;
                  } else if (typeof element === 'number') {
                    // Valid single note
                    if (element < 0 || element > 127) {
                      throw new Error(`Invalid MIDI note at index ${idx}: ${element}. Must be 0-127 or -1 for rest`);
                    }
                  } else if (Array.isArray(element)) {
                    // Valid chord - check all notes in chord
                    if (element.length === 0) {
                      throw new Error(`Empty chord at index ${idx}`);
                    }
                    element.forEach((note: any, noteIdx: number) => {
                      if (typeof note !== 'number' || note < 0 || note > 127) {
                        throw new Error(`Invalid MIDI note in chord at index ${idx}[${noteIdx}]: ${note}`);
                      }
                    });
                  } else {
                    throw new Error(`Invalid melody element at index ${idx}. Must be: number (note), array (chord), or -1 (rest)`);
                  }
                });
                
                if (!acc.pattern.rhythm || !Array.isArray(acc.pattern.rhythm)) {
                  throw new Error('pattern.rhythm must be an array of note values');
                }
                
                // Validate rhythm and melody arrays have same length
                if (acc.pattern.melody.length !== acc.pattern.rhythm.length) {
                  throw new Error(`melody (${acc.pattern.melody.length} elements) and rhythm (${acc.pattern.rhythm.length} elements) must have same length`);
                }
                
                // Validate metadata structure
                if (!acc.metadata.difficulty) {
                  throw new Error('metadata.difficulty is required');
                }
                if (!acc.metadata.harmonyType) {
                  throw new Error('metadata.harmonyType is required');
                }
                if (!acc.metadata.voicingType) {
                  throw new Error('metadata.voicingType is required');
                }
                if (!acc.metadata.commonIn || !Array.isArray(acc.metadata.commonIn)) {
                  acc.metadata.commonIn = ['Custom'];
                }
                
                // Set defaults for optional fields
                if (!acc.pattern.timeSignature) {
                  acc.pattern.timeSignature = '4/4';
                }
                if (!acc.pattern.repeatCount) {
                  acc.pattern.repeatCount = 1;
                }
                if (!acc.tags) {
                  acc.tags = ['custom'];
                }
                
                // Add to library
                Library.addCustomAccompaniment(acc as ComposerAccompaniment);
                successCount++;
              } catch (error: any) {
                console.error(`Failed to add accompaniment ${acc.id || index} from ${file.name}:`, error.message);
                toast.error(`${file.name}: Accompaniment ${acc.id || index} failed`, {
                  description: error.message
                });
                errorCount++;
              }
            });
            
            fileResults.push({ name: file.name, success: successCount, errors: errorCount });
            totalSuccessCount += successCount;
            totalErrorCount += errorCount;
            totalFilesProcessed++;
            
            // ADDITIVE: Individual file success message (only if this is a single file upload)
            if (files.length === 1) {
              if (successCount > 0) {
                toast.success(`Uploaded ${successCount} accompaniment${successCount > 1 ? 's' : ''}!`, {
                  description: errorCount > 0 ? `${errorCount} failed to upload` : undefined
                });
              } else {
                toast.error('Failed to upload accompaniments', {
                  description: 'Check console for details'
                });
              }
            }
            
            resolve();
            
          } catch (error: any) {
            console.error(`JSON parse error in ${file.name}:`, error);
            
            // ADDITIVE: Provide more specific error messages
            let errorMessage = `${file.name}: Invalid JSON file`;
            let errorDescription = 'Please check the file format';
            
            if (error instanceof SyntaxError) {
              if (error.message.includes('Unexpected non-whitespace')) {
                errorMessage = `${file.name}: JSON formatting error`;
                errorDescription = 'Extra content found after JSON ends. Make sure file contains ONLY valid JSON (starts with { and ends with })';
              } else if (error.message.includes('Unexpected token')) {
                errorMessage = `${file.name}: JSON syntax error`;
                errorDescription = 'Invalid JSON syntax. Check for missing commas, quotes, or brackets';
              } else {
                errorMessage = `${file.name}: JSON parse error`;
                errorDescription = error.message;
              }
            }
            
            toast.error(errorMessage, {
              description: errorDescription
            });
            
            fileResults.push({ name: file.name, success: 0, errors: 1 });
            totalErrorCount++;
            totalFilesProcessed++;
            resolve();
          }
        };
        
        reader.onerror = () => {
          toast.error(`Failed to read file: ${file.name}`, {
            description: 'Could not read the file contents'
          });
          fileResults.push({ name: file.name, success: 0, errors: 1 });
          totalErrorCount++;
          totalFilesProcessed++;
          resolve();
        };
        
        reader.readAsText(file);
      });
    };

    // ADDITIVE: Process all files sequentially
    const processAllFiles = async () => {
      for (let i = 0; i < files.length; i++) {
        await processFile(files[i], i);
      }
      
      // ADDITIVE: Update uploaded count
      setUploadedCount(prev => prev + totalSuccessCount);
      
      // ADDITIVE: Show summary toast for multi-file uploads
      if (files.length > 1) {
        if (totalSuccessCount > 0) {
          const summary = fileResults
            .filter(r => r.success > 0)
            .map(r => `${r.name}: ${r.success} added`)
            .join(' • ');
          
          toast.success(`Multi-file upload complete: ${totalSuccessCount} total accompaniments added!`, {
            description: totalErrorCount > 0 
              ? `${totalErrorCount} errors occurred. See individual notifications for details.`
              : summary
          });
        } else {
          toast.error('All files failed to upload', {
            description: `${totalFilesProcessed} file${totalFilesProcessed > 1 ? 's' : ''} processed, 0 accompaniments added`
          });
        }
      }
      
      // Reset file input
      event.target.value = '';
    };
    
    processAllFiles();
  }, []);
  
  // === ADDITIVE: Download JSON Template ===
  const handleDownloadTemplate = useCallback(() => {
    const template = {
      _README: {
        file_type: 'ACCOMPANIMENT_PATTERN_TEMPLATE',
        description: 'Use this template to create custom accompaniment patterns for the Composer Accompaniment Library',
        NOT_COMPATIBLE: 'Session exports, MIDI data, Theme exports, or Song Suite files will not work',
        instructions: 'Edit the examples below, then upload the JSON file to add your patterns',
        
        CHORDS_AND_RESTS: {
          single_note: 60,
          chord: [60, 64, 67],
          rest: -1,
          example: 'melody: [60, [60,64,67], -1, [48,52,55]]  means: C note, C-E-G chord, rest, low C-E-G chord'
        }
      },
      
      _INSTRUCTIONS: {
        STEP_1: 'Delete this _INSTRUCTIONS and _README section before uploading',
        STEP_2: 'Edit example_1 and example_2 with your data, or add more examples',
        STEP_3: 'Save as .json file and upload using the Upload JSON button',
        
        REQUIRED_FIELDS: {
          composer: 'One of: Bach, Beethoven, Mozart, Handel, Chopin, Schumann, Brahms, Liszt, Haydn, Debussy',
          title: 'Name of your pattern',
          period: 'One of: Baroque, Classical, Romantic, Romantic, Impressionist',
          description: 'Describe your pattern',
          pattern: {
            melody: 'Array containing: Single notes (60), Chords ([60,64,67]), or Rests (-1)',
            rhythm: 'Array of: "eighth", "quarter", "half", "whole", "sixteenth", "dotted-quarter", "dotted-half"',
            MELODY_EXAMPLES: {
              single_notes_only: [60, 64, 67, 72],
              with_chords: [60, [60,64,67], 64, [64,67,72]],
              with_rests: [60, 64, -1, 67],
              chords_and_rests: [[48,52,55], -1, [60,64,67], -1]
            }
          },
          metadata: {
            difficulty: 'One of: "beginner", "intermediate", "advanced", "virtuoso"',
            harmonyType: 'One of: "alberti-bass", "waltz-bass", "broken-chord", "arpeggiated", "stride", "murky-bass", "drum-bass", "pedal-point", "ostinato", "chaconne", "ground-bass"',
            voicingType: 'One of: "left-hand", "right-hand", "both-hands", "bass-line"',
            commonIn: 'Array of strings, e.g. ["Sonatas", "Waltzes"]'
          }
        },
        
        OPTIONAL_FIELDS: {
          id: 'Auto-generated if omitted',
          timeSignature: 'Defaults to "4/4"',
          repeatCount: 'Defaults to 1',
          tags: 'Array of keywords',
          tempoRange: '[min_bpm, max_bpm]',
          keyContext: '"Major", "Minor", or "Modal"',
          era: 'Description of era/style'
        },
        
        MIDI_NOTE_REFERENCE: {
          C4_Middle_C: 60,
          C3: 48,
          C2: 36,
          C5: 72,
          formula: 'Each semitone up adds 1. C=0, C#=1, D=2, D#=3, E=4, F=5, F#=6, G=7, G#=8, A=9, A#=10, B=11'
        }
      },
      
      // Example 1: Simple single notes (READY TO UPLOAD - just remove instructions above)
      example_1_single_notes: {
        composer: 'Bach',
        title: 'Simple Arpeggio Pattern',
        period: 'Baroque',
        description: 'A basic arpeggiated accompaniment in C major - single notes only',
        pattern: {
          melody: [48, 60, 64, 67, 64, 60],
          rhythm: ['eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth'],
          timeSignature: '3/4',
          repeatCount: 2
        },
        metadata: {
          commonIn: ['Custom Compositions'],
          difficulty: 'beginner',
          harmonyType: 'arpeggiated',
          voicingType: 'left-hand'
        }
      },
      
      // Example 2: Pattern with CHORDS (READY TO UPLOAD)
      example_2_with_chords: {
        composer: 'Chopin',
        title: 'Waltz with Chords',
        period: 'Romantic',
        description: 'Waltz pattern with bass note followed by chord accompaniment',
        pattern: {
          melody: [36, [55,60,64], [55,60,64], 38, [57,62,65], [57,62,65]],
          rhythm: ['quarter', 'eighth', 'eighth', 'quarter', 'eighth', 'eighth'],
          timeSignature: '3/4'
        },
        metadata: {
          commonIn: ['Waltzes'],
          difficulty: 'intermediate',
          harmonyType: 'waltz-bass',
          voicingType: 'left-hand'
        }
      },
      
      // Example 3: Pattern with RESTS (READY TO UPLOAD)
      example_3_with_rests: {
        composer: 'Beethoven',
        title: 'Dramatic Pattern with Rests',
        period: 'Classical',
        description: 'Powerful bass notes with dramatic rests',
        pattern: {
          melody: [36, 36, -1, 43, -1, 36, -1, -1],
          rhythm: ['eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth'],
          timeSignature: '4/4'
        },
        metadata: {
          commonIn: ['Sonatas', 'Symphonies'],
          difficulty: 'intermediate',
          harmonyType: 'drum-bass',
          voicingType: 'left-hand'
        }
      },
      
      // Example 4: Pattern with CHORDS AND RESTS (READY TO UPLOAD)
      example_4_chords_and_rests: {
        composer: 'Mozart',
        title: 'Alberti Bass with Chords',
        period: 'Classical',
        description: 'Classic Alberti bass with chordal accents and rests',
        pattern: {
          melody: [[48,52,55], -1, [52,55,60], 55, [48,52,55], -1, [52,55,60], 55],
          rhythm: ['eighth', 'sixteenth', 'sixteenth', 'sixteenth', 'eighth', 'sixteenth', 'sixteenth', 'sixteenth'],
          timeSignature: '4/4'
        },
        metadata: {
          commonIn: ['Sonatas'],
          difficulty: 'advanced',
          harmonyType: 'alberti-bass',
          voicingType: 'left-hand'
        }
      }
    };
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'accompaniment-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Template downloaded!', {
      description: 'Edit and upload your custom accompaniments'
    });
  }, []);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Piano className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Famous Composer Accompaniments</h2>
              <p className="text-sm text-muted-foreground">
                Authentic patterns - Edit and add to your composition
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <ListMusic className="w-3 h-3" />
              {filteredAccompaniments.length} Patterns
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="w-3 h-3" />
              {allComposers.length} Composers
            </Badge>
            {uploadedCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Upload className="w-3 h-3" />
                {uploadedCount} Custom
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* ADDITIVE: JSON Upload Section */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FileJson className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Add Custom Accompaniments</h3>
                  <p className="text-sm text-muted-foreground">Upload JSON files to expand your library</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleDownloadTemplate} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                <Button variant="default" size="sm" className="relative">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload JSON
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleJSONUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    multiple={true}
                  />
                </Button>
              </div>
            </div>
            
            {/* Quick Reference */}
            <div className="text-xs text-muted-foreground bg-white/50 dark:bg-black/20 p-3 rounded border border-blue-200/50 dark:border-blue-800/50">
              <div className="space-y-1">
                <div>
                  <strong>✅ Upload Accompaniment JSON:</strong> Files with composer, title, period, pattern (melody & rhythm), and metadata
                </div>
                <div>
                  <strong>🎵 Melody Format:</strong> Single notes (60), Chords ([60,64,67]), or Rests (-1)
                </div>
                <div>
                  <strong>❌ Not Compatible:</strong> Session exports, MIDI data, Theme/Melody exports, or Song Suite files
                </div>
                <div>
                  <strong>💡 Tip:</strong> Download Template includes 4 examples: single notes, chords, rests, and combinations
                </div>
                <Separator className="my-2" />
                <div>
                  <strong>Supported Composers:</strong> Bach, Beethoven, Mozart, Handel, Chopin, Schumann, Brahms, Liszt, Haydn, Debussy
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="col-span-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patterns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1 block">Composer</Label>
            <Select value={selectedComposer} onValueChange={(value) => setSelectedComposer(value as ComposerName | 'all')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Composers</SelectItem>
                {allComposers.map(composer => (
                  <SelectItem key={composer} value={composer}>{composer}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs mb-1 block">Period</Label>
            <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as MusicalPeriod | 'all')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                {allPeriods.map(period => (
                  <SelectItem key={period} value={period}>{period}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs mb-1 block">Difficulty</Label>
            <Select value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as DifficultyLevel | 'all')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="virtuoso">Virtuoso</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Accompaniment List */}
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {filteredAccompaniments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Music4 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No accompaniments found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              filteredAccompaniments.map((acc) => (
                <Card
                  key={acc.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedAccompaniment?.id === acc.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : selectedForCombine?.id === acc.id
                      ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950/30'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setSelectedAccompaniment(acc)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{acc.title}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {acc.composer}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{acc.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {acc.period}
                      </Badge>
                      <Badge className={`text-xs ${getDifficultyColor(acc.metadata.difficulty)}`}>
                        {acc.metadata.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {acc.metadata.harmonyType}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {acc.pattern.melody.length} notes
                      </Badge>
                      {acc.pattern.timeSignature && (
                        <Badge variant="outline" className="text-xs">
                          {acc.pattern.timeSignature}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Simple Editing Controls */}
        {selectedAccompaniment && (
          <>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">
                  {editedAccompaniment ? editedAccompaniment.title : selectedAccompaniment.title}
                </h3>
                <Badge variant={editedAccompaniment ? 'default' : 'secondary'}>
                  {editedAccompaniment ? 'Edited' : 'Original'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {editedAccompaniment ? editedAccompaniment.description : selectedAccompaniment.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Transpose */}
              <div className="space-y-2">
                <Label className="text-sm">
                  Transpose: {transposeInterval[0] > 0 ? '+' : ''}{transposeInterval[0]} semitones
                </Label>
                <Slider
                  value={transposeInterval}
                  onValueChange={setTransposeInterval}
                  min={-12}
                  max={12}
                  step={1}
                />
                <Button onClick={handleTranspose} variant="outline" size="sm" className="w-full">
                  <Wand2 className="w-3 h-3 mr-1" />
                  Apply Transpose
                </Button>
              </div>

              {/* Expand */}
              <div className="space-y-2">
                <Label className="text-sm">
                  Repeat: ×{expandRepetitions[0]}
                </Label>
                <Slider
                  value={expandRepetitions}
                  onValueChange={setExpandRepetitions}
                  min={1}
                  max={8}
                  step={1}
                />
                <Button onClick={handleExpand} variant="outline" size="sm" className="w-full">
                  <Repeat className="w-3 h-3 mr-1" />
                  Apply Expand
                </Button>
              </div>

              {/* Truncate */}
              <div className="space-y-2">
                <Label className="text-sm">
                  Keep first {truncateLength[0]} notes
                </Label>
                <Slider
                  value={truncateLength}
                  onValueChange={setTruncateLength}
                  min={2}
                  max={Math.max(selectedAccompaniment.pattern.melody.length, 16)}
                  step={1}
                />
                <Button onClick={handleTruncate} variant="outline" size="sm" className="w-full">
                  <Scissors className="w-3 h-3 mr-1" />
                  Apply Truncate
                </Button>
              </div>

              {/* Combine */}
              <div className="space-y-2">
                <Label className="text-sm">
                  Combine with: {selectedForCombine ? selectedForCombine.composer : 'None'}
                </Label>
                <Button 
                  onClick={() => setSelectedForCombine(selectedForCombine ? null : selectedAccompaniment)}
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  {selectedForCombine ? 'Clear Selection' : 'Select for Combine'}
                </Button>
                <Button 
                  onClick={handleCombine} 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  disabled={!selectedForCombine}
                >
                  <Layers className="w-3 h-3 mr-1" />
                  Combine Patterns
                </Button>
              </div>
            </div>

            <Separator />

            {/* Options */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <Label htmlFor="auto-adapt">Auto-adapt to current key</Label>
              <Switch
                id="auto-adapt"
                checked={autoAdaptKey}
                onCheckedChange={setAutoAdaptKey}
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button onClick={handlePreview} variant="outline" className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Preview Audio
              </Button>
              <Button onClick={handleReset} variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Edits
              </Button>
              <Button onClick={handleAddToSongSuite} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add to Song Suite
              </Button>
            </div>

            {currentKeySignature && autoAdaptKey && (
              <div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded">
                ℹ️ Pattern will be automatically transposed to match current key: <strong>{currentKeySignature.name}</strong>
              </div>
            )}

            <Separator />

            {/* ADDITIVE: Comprehensive Visualizer with Playback and Controls */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Music className="w-4 h-4" />
                Pattern Visualizer & Playback
              </h3>
              <ComposerAccompanimentVisualizer
                accompaniment={editedAccompaniment || selectedAccompaniment}
                isEdited={!!editedAccompaniment}
                onResetEdits={handleReset}
                customRhythm={customRhythm}
                onRhythmChange={setCustomRhythm}
                selectedInstrument={selectedInstrument}
                onInstrumentChange={setSelectedInstrument}
                isPlaying={isPlaying}
                onPlayToggle={setIsPlaying}
                playbackControllerRef={playbackControllerRef}
              />
            </div>
          </>
        )}
      </div>
    </Card>
  );
}