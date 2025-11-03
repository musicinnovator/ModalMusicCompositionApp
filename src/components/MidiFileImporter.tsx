import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Theme, Part, Mode, KeySignature, BachLikeVariables, BachVariableName, midiNoteToNoteName } from '../types/musical';
import { MidiFileParser, MidiFileInfo, MidiParseError, convertMidiToTheme, convertMidiToParts, getMidiFileInfo } from '../lib/midi-parser';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Upload, FileMusic, AlertTriangle, CheckCircle, Music, Layers, Brain, Trash2, Play, Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Default labels for built-in Bach variables
const DEFAULT_BACH_VARIABLE_LABELS: Record<string, string> = {
  'cantusFirmus': 'Cantus Firmus',
  'floridCounterpoint1': 'Florid Counterpoint 1',
  'floridCounterpoint2': 'Florid Counterpoint 2',
  'cantusFirmusFragment1': 'CF Fragment 1',
  'cantusFirmusFragment2': 'CF Fragment 2',
  'floridCounterpointFrag1': 'FCP Fragment 1',
  'floridCounterpointFrag2': 'FCP Fragment 2',
  'countersubject1': 'Countersubject 1',
  'countersubject2': 'Countersubject 2'
};

interface MidiFileImporterProps {
  onThemeImported?: (theme: Theme) => void;
  onPartsImported?: (parts: Part[]) => void;
  onBachVariablesImported?: (variables: Partial<BachLikeVariables>) => void;
  selectedMode?: Mode | null;
  selectedKeySignature?: KeySignature | null;
  bachVariables?: BachLikeVariables;
}

interface ImportPreview {
  file: File;
  midiInfo: MidiFileInfo;
  themes: { [trackIndex: number]: Theme };
  parts: Part[];
  selectedTracks: Set<number>;
  selectedTargets: { [trackIndex: number]: 'theme' | BachVariableName };
}

/**
 * MIDI File Importer Component
 * 
 * Supports MIDI file types 0, 1, and 2 with comprehensive error handling.
 * Provides three import modes:
 * - Theme: Import single track as main theme
 * - Parts: Import multiple tracks as separate parts for fugue/imitation
 * - Bach Variables: Import tracks to specific counterpoint variables
 * 
 * Features:
 * - Real-time parsing progress
 * - Track selection and targeting
 * - Note preview and validation
 * - Memory optimization (limits to 32 notes per part)
 * - Demo mode for testing without MIDI files
 * - Comprehensive error handling and user feedback
 */
export function MidiFileImporter({
  onThemeImported,
  onPartsImported,
  onBachVariablesImported,
  selectedMode,
  selectedKeySignature,
  bachVariables
}: MidiFileImporterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importMode, setImportMode] = useState<'theme' | 'parts' | 'bach-variables'>('theme');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamically generate Bach variable options from current Bach variables
  // This includes both built-in AND user-created custom variables
  const bachVariableOptions: { value: BachVariableName; label: string }[] = useMemo(() => {
    if (!bachVariables) {
      // Fallback to defaults if bachVariables not provided
      return Object.entries(DEFAULT_BACH_VARIABLE_LABELS).map(([value, label]) => ({
        value: value as BachVariableName,
        label
      }));
    }

    // Generate options from all available Bach variables (built-in + custom)
    return Object.keys(bachVariables).map(variableName => ({
      value: variableName as BachVariableName,
      label: DEFAULT_BACH_VARIABLE_LABELS[variableName] || variableName // Use default label or variable name
    }));
  }, [bachVariables]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.mid') && !file.name.toLowerCase().endsWith('.midi')) {
      setError('Please select a valid MIDI file (.mid or .midi)');
      toast.error('Invalid file type. Please select a MIDI file.');
      return;
    }

    // Validate file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('MIDI file is too large (max 10MB)');
      toast.error('File too large. Please select a smaller MIDI file.');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setError(null);
    setPreview(null);

    try {
      console.log('🎵 Starting MIDI file import:', file.name, 'Size:', file.size, 'bytes');
      
      // Read file
      setProgress(20);
      const arrayBuffer = await file.arrayBuffer();
      
      setProgress(40);
      
      // Parse MIDI file with progress reporting
      console.log('🎵 Creating MIDI parser...');
      const parser = new MidiFileParser(arrayBuffer);
      
      setProgress(50);
      console.log('🎵 Parsing MIDI structure...');
      const midiInfo = parser.parse();
      
      setProgress(70);
      console.log('🎵 Validating parsed data...');
      
      // Validate parsed data
      if (midiInfo.tracks.length === 0) {
        throw new Error('MIDI file contains no tracks with note data');
      }

      const tracksWithNotes = midiInfo.tracks.filter(track => track.notes.length > 0);
      if (tracksWithNotes.length === 0) {
        throw new Error('MIDI file contains no notes to import');
      }

      setProgress(80);
      
      // Generate preview data
      const themes: { [trackIndex: number]: Theme } = {};
      const selectedTracks = new Set<number>();
      const selectedTargets: { [trackIndex: number]: 'theme' | BachVariableName } = {};

      tracksWithNotes.forEach((track, index) => {
        const trackIndex = midiInfo.tracks.indexOf(track);
        themes[trackIndex] = convertMidiToTheme(midiInfo, trackIndex);
        selectedTracks.add(trackIndex);
        selectedTargets[trackIndex] = index === 0 ? 'theme' : 'cantusFirmus';
      });

      const parts = convertMidiToParts(midiInfo);
      
      setProgress(100);
      
      setPreview({
        file,
        midiInfo,
        themes,
        parts,
        selectedTracks,
        selectedTargets
      });

      const noteCount = tracksWithNotes.reduce((sum, track) => sum + track.notes.length, 0);
      toast.success(`MIDI file parsed successfully! Found ${tracksWithNotes.length} tracks with ${noteCount} total notes.`);
      
      console.log('🎵 MIDI import preview ready:', {
        format: midiInfo.format,
        tracks: midiInfo.trackCount,
        tracksWithNotes: tracksWithNotes.length,
        totalNotes: noteCount
      });

    } catch (err) {
      console.error('🎵 MIDI import error:', err);
      
      let errorMessage = 'Failed to parse MIDI file';
      let errorCode = '';
      
      if (err instanceof MidiParseError) {
        errorMessage = err.message;
        errorCode = err.code || '';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(`${errorMessage}${errorCode ? ` (${errorCode})` : ''}`);
      
      // Provide helpful error messages
      if (errorCode === 'INVALID_SIGNATURE') {
        toast.error('This file is not a valid MIDI file. Please check the file format.');
      } else if (errorCode === 'UNSUPPORTED_FORMAT') {
        toast.error('This MIDI format is not supported. Please use MIDI format 0, 1, or 2.');
      } else if (errorCode === 'FILE_TOO_SMALL') {
        toast.error('File appears to be corrupted or incomplete.');
      } else {
        toast.error(`MIDI import failed: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
      setProgress(0);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  const handleTrackSelectionChange = useCallback((trackIndex: number, selected: boolean) => {
    if (!preview) return;
    
    const newSelectedTracks = new Set(preview.selectedTracks);
    if (selected) {
      newSelectedTracks.add(trackIndex);
    } else {
      newSelectedTracks.delete(trackIndex);
    }
    
    setPreview({
      ...preview,
      selectedTracks: newSelectedTracks
    });
  }, [preview]);

  const handleTargetChange = useCallback((trackIndex: number, target: 'theme' | BachVariableName) => {
    if (!preview) return;
    
    setPreview({
      ...preview,
      selectedTargets: {
        ...preview.selectedTargets,
        [trackIndex]: target
      }
    });
  }, [preview]);

  const handleImport = useCallback(() => {
    if (!preview) return;

    try {
      const selectedTrackIndices = Array.from(preview.selectedTracks);
      
      if (selectedTrackIndices.length === 0) {
        toast.error('Please select at least one track to import');
        return;
      }

      console.log('🎵 Importing MIDI data:', {
        mode: importMode,
        selectedTracks: selectedTrackIndices.length,
        targets: preview.selectedTargets
      });

      if (importMode === 'theme') {
        // Import as theme - use the first selected track
        const firstTrackIndex = selectedTrackIndices[0];
        const theme = preview.themes[firstTrackIndex];
        
        if (theme && theme.length > 0) {
          onThemeImported?.(theme);
          
          const trackName = preview.midiInfo.tracks[firstTrackIndex].name || `Track ${firstTrackIndex + 1}`;
          const noteNames = theme.slice(0, 5).map(note => midiNoteToNoteName(note)).join(', ');
          const displayText = theme.length > 5 ? `${noteNames}...` : noteNames;
          
          toast.success(`Theme imported from "${trackName}": ${displayText} (${theme.length} notes)`);
        }
      } else if (importMode === 'parts') {
        // Import as parts
        const selectedParts = selectedTrackIndices
          .map(trackIndex => {
            const track = preview.midiInfo.tracks[trackIndex];
            if (track.notes.length === 0) return null;
            
            const melody = convertMidiToTheme(preview.midiInfo, trackIndex);
            const rhythm = Array(melody.length).fill(4); // Default rhythm
            
            return { melody, rhythm };
          })
          .filter((part): part is Part => part !== null);

        if (selectedParts.length > 0) {
          onPartsImported?.(selectedParts);
          toast.success(`Imported ${selectedParts.length} parts with ${selectedParts.reduce((sum, part) => sum + part.melody.length, 0)} total notes`);
        }
      } else if (importMode === 'bach-variables') {
        // Import to Bach variables
        const bachVariables: Partial<BachLikeVariables> = {};
        
        selectedTrackIndices.forEach(trackIndex => {
          const target = preview.selectedTargets[trackIndex];
          const theme = preview.themes[trackIndex];
          
          if (target !== 'theme' && theme && theme.length > 0) {
            bachVariables[target] = theme.slice(0, 32); // Limit to 32 notes
          }
        });

        if (Object.keys(bachVariables).length > 0) {
          onBachVariablesImported?.(bachVariables);
          
          const importedVars = Object.keys(bachVariables).join(', ');
          const totalNotes = Object.values(bachVariables).reduce((sum, notes) => sum + (notes?.length || 0), 0);
          
          toast.success(`Bach variables imported: ${importedVars} (${totalNotes} total notes)`);
        }
      }

      // Clear preview after successful import
      setPreview(null);
      
    } catch (err) {
      console.error('🎵 Import error:', err);
      toast.error(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [preview, importMode, onThemeImported, onPartsImported, onBachVariablesImported]);

  const handleClearPreview = useCallback(() => {
    setPreview(null);
    setError(null);
  }, []);

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileMusic className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <Label className="text-blue-900 dark:text-blue-100 font-medium">
            Import MIDI Files
          </Label>
        </div>
        <Badge variant="outline" className="text-xs text-blue-700 dark:text-blue-300">
          Types 0, 1, 2 Supported
        </Badge>
      </div>

      {error && (
        <Alert className="mb-4 border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
              className="ml-2"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800 dark:text-blue-200">Processing MIDI file...</span>
            <span className="text-sm text-blue-600 dark:text-blue-400">{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {!preview && !isLoading && (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Import Mode
            </Label>
            <Select value={importMode} onValueChange={(value: any) => setImportMode(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theme">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Import as Theme (single melody)
                  </div>
                </SelectItem>
                <SelectItem value="parts">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Import as Parts (multiple melodies)
                  </div>
                </SelectItem>
                <SelectItem value="bach-variables">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Import to Bach Variables
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Select MIDI File
            </Label>
            <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".mid,.midi"
                onChange={handleFileSelect}
                className="hidden"
                id="midi-file-input"
              />
              <label
                htmlFor="midi-file-input"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                <div>
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Click to upload MIDI file
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    Supports .mid and .midi files (max 10MB)
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <div><strong>Supported formats:</strong> MIDI Type 0 (single track), Type 1 (multiple tracks), Type 2 (multiple sequences)</div>
            <div><strong>Import modes:</strong></div>
            <div className="ml-2">• <strong>Theme:</strong> Import first track as main theme</div>
            <div className="ml-2">• <strong>Parts:</strong> Import multiple tracks as separate parts for fugue/imitation</div>
            <div className="ml-2">• <strong>Bach Variables:</strong> Import tracks to specific counterpoint variables</div>
            <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded border space-y-2">
              <div><strong>💡 Usage Tips:</strong> Start with simple MIDI files. Complex orchestral pieces may need track filtering. Notes are automatically limited to 32 per part for optimal performance.</div>
              
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Create a demo MIDI data structure for testing
                    const demoTheme: Theme = [60, 62, 64, 65, 67, 69, 71, 72]; // C major scale
                    
                    if (importMode === 'theme') {
                      onThemeImported?.(demoTheme);
                      toast.success('Demo theme imported: C major scale');
                    } else if (importMode === 'parts') {
                      const demoParts: Part[] = [
                        { melody: demoTheme, rhythm: Array(8).fill(4) },
                        { melody: [67, 69, 71, 72, 74, 76, 77, 79], rhythm: Array(8).fill(4) }
                      ];
                      onPartsImported?.(demoParts);
                      toast.success('Demo parts imported: 2 scale patterns');
                    } else if (importMode === 'bach-variables') {
                      const demoVariables: Partial<BachLikeVariables> = {
                        cantusFirmus: demoTheme,
                        floridCounterpoint1: [64, 66, 68, 69, 71, 73, 75, 76]
                      };
                      onBachVariablesImported?.(demoVariables);
                      toast.success('Demo Bach variables imported: CF and FCP1');
                    }
                  }}
                  className="text-xs"
                >
                  🧪 Import Demo Data
                </Button>
                
                <Badge variant="outline" className="text-xs">
                  No MIDI file needed
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <Label className="font-medium text-green-900 dark:text-green-100">
                Import Preview: {preview.file.name}
              </Label>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearPreview}
                className="text-xs gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </Button>
              <Button
                onClick={handleImport}
                size="sm"
                className="text-xs gap-1"
                disabled={preview.selectedTracks.size === 0}
              >
                <Download className="w-3 h-3" />
                Import Selected
              </Button>
            </div>
          </div>

          <div className="bg-white/50 dark:bg-black/20 p-3 rounded border">
            <div className="text-xs font-mono text-blue-800 dark:text-blue-200 whitespace-pre-line">
              {getMidiFileInfo(preview.midiInfo)}
            </div>
          </div>

          <Tabs defaultValue="tracks" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tracks">Track Selection</TabsTrigger>
              <TabsTrigger value="preview">Note Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="tracks" className="space-y-3">
              <div className="space-y-2">
                {preview.midiInfo.tracks.map((track, index) => {
                  if (track.notes.length === 0) return null;

                  const isSelected = preview.selectedTracks.has(index);
                  const target = preview.selectedTargets[index] || 'theme';

                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/30 dark:bg-black/20 rounded border">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleTrackSelectionChange(index, !!checked)}
                        />
                        <div>
                          <div className="font-medium text-sm">
                            {track.name || `Track ${index + 1}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {track.instrument || 'Unknown'} • {track.notes.length} notes
                          </div>
                        </div>
                      </div>

                      {isSelected && importMode === 'bach-variables' && (
                        <Select
                          value={target}
                          onValueChange={(value: any) => handleTargetChange(index, value)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="theme">Main Theme</SelectItem>
                            {bachVariableOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {isSelected && (
                        <Badge variant="secondary" className="text-xs">
                          {importMode === 'bach-variables' && target !== 'theme' 
                            ? bachVariableOptions.find(opt => opt.value === target)?.label || target
                            : importMode === 'theme'
                            ? 'Theme'
                            : 'Part'
                          }
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-xs text-blue-700 dark:text-blue-300">
                Selected {preview.selectedTracks.size} of {preview.midiInfo.tracks.filter(t => t.notes.length > 0).length} tracks with notes
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-3">
              {Array.from(preview.selectedTracks).map(trackIndex => {
                const track = preview.midiInfo.tracks[trackIndex];
                const theme = preview.themes[trackIndex];
                
                if (!theme || theme.length === 0) return null;

                return (
                  <div key={trackIndex} className="p-3 bg-white/30 dark:bg-black/20 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm">
                        {track.name || `Track ${trackIndex + 1}`}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {theme.length} notes
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Notes: {theme.slice(0, 10).map(note => midiNoteToNoteName(note)).join(', ')}
                      {theme.length > 10 && '...'}
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Card>
  );
}