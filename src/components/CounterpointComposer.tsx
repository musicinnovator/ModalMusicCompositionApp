import { useState, useCallback } from 'react';
import { Theme, Mode, ModeCategory, KeySignature, MidiNote, midiNoteToNoteName, BachLikeVariables, BachVariableName, NoteValue, getNoteValueBeats } from '../types/musical';
import { CounterpointEngine, CounterpointTechnique, CounterpointCombination, TextureType, SpeciesType, MotionType } from '../lib/counterpoint-engine';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { X, Plus, Music4, Waves, Target, Shuffle, BookOpen, Zap, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CounterpointComposerProps {
  theme: Theme;
  bachVariables?: BachLikeVariables;
  onBachVariablesChange?: (variables: BachLikeVariables) => void;
  selectedMode?: Mode | null;
  modeCategories?: ModeCategory[];
  selectedKeySignature?: KeySignature | null;
  onCounterpointGenerated?: (counterpoint: Theme, technique: string, rhythm?: number[]) => void;
}

const COUNTERPOINT_TECHNIQUES: { value: CounterpointTechnique; label: string; description: string }[] = [
  { value: 'retrograde', label: 'Retrograde', description: 'Melody played backwards in time' },
  { value: 'inversion', label: 'Inversion', description: 'Intervals inverted around a central axis' },
  { value: 'truncation', label: 'Truncation', description: 'Melody shortened by removing notes' },
  { value: 'elision', label: 'Elision', description: 'Smooth connection eliminating rests' },
  { value: 'diminution', label: 'Diminution', description: 'Note values reduced (faster rhythm)' },
  { value: 'augmentation', label: 'Augmentation', description: 'Note values increased (slower rhythm)' },
  { value: 'fragmentation', label: 'Fragmentation', description: 'Melody broken into small motifs' },
  { value: 'sequence', label: 'Sequence', description: 'Pattern repeated at different pitch levels' },
  { value: 'ornamentation', label: 'Ornamentation', description: 'Decorative notes added to melody' },
  { value: 'interpolation', label: 'Interpolation', description: 'Notes inserted between existing notes' },
  { value: 'transposition', label: 'Transposition', description: 'Melody moved to different pitch level' },
  { value: 'modeShifting', label: 'Mode Shifting', description: 'Melody adapted to different modal context' }
];

const COMBINATION_TECHNIQUES: { value: CounterpointCombination; label: string }[] = [
  { value: 'retrograde-inversion', label: 'Retrograde-Inversion' },
  { value: 'diminution-sequence', label: 'Diminution-Sequence' },
  { value: 'augmentation-inversion', label: 'Augmentation-Inversion' },
  { value: 'fragmentation-transposition', label: 'Fragmentation-Transposition' },
  { value: 'ornamentation-sequence', label: 'Ornamentation-Sequence' },
  { value: 'truncation-mode-shifting', label: 'Truncation-Mode-Shifting' }
];

const TEXTURE_TYPES: { value: TextureType; label: string; description: string }[] = [
  { value: 'rough', label: 'Rough', description: 'Frequent dissonance and angular intervals' },
  { value: 'smooth', label: 'Smooth', description: 'Stepwise motion and consonant intervals' },
  { value: 'simple', label: 'Simple', description: 'Basic rhythmic patterns and clear structure' },
  { value: 'complex', label: 'Complex', description: 'Intricate rhythmic relationships' },
  { value: 'dense', label: 'Dense', description: 'Multiple active voices and frequent notes' },
  { value: 'sparse', label: 'Sparse', description: 'Fewer voices with spacious intervals' }
];

const SPECIES_TYPES: { value: SpeciesType; label: string; description: string }[] = [
  { value: 'first', label: 'First Species (1:1)', description: 'Note against note, same durations' },
  { value: 'second', label: 'Second Species (2:1)', description: 'Two notes against one' },
  { value: 'third', label: 'Third Species (3:1)', description: 'Three notes against one' },
  { value: 'fourth', label: 'Fourth Species (4:1)', description: 'Four notes against one' },
  { value: 'fifth', label: 'Fifth Species (Florid)', description: 'Mixture of all species types' }
];

const NOTE_VALUE_OPTIONS: { value: NoteValue; label: string; beats: number }[] = [
  { value: 'double-whole', label: 'Double Whole Note', beats: 8 },
  { value: 'whole', label: 'Whole Note', beats: 4 },
  { value: 'dotted-half', label: 'Dotted Half Note', beats: 3 },
  { value: 'half', label: 'Half Note', beats: 2 },
  { value: 'dotted-quarter', label: 'Dotted Quarter Note', beats: 1.5 },
  { value: 'quarter', label: 'Quarter Note', beats: 1 },
  { value: 'eighth', label: 'Eighth Note', beats: 0.5 },
  { value: 'sixteenth', label: 'Sixteenth Note', beats: 0.25 }
];

export function CounterpointComposer({
  theme,
  bachVariables,
  onBachVariablesChange,
  selectedMode,
  modeCategories,
  selectedKeySignature,
  onCounterpointGenerated
}: CounterpointComposerProps) {
  const [selectedTechnique, setSelectedTechnique] = useState<CounterpointTechnique>('retrograde');
  const [selectedCombination, setSelectedCombination] = useState<CounterpointCombination>('retrograde-inversion');
  const [selectedTexture, setSelectedTexture] = useState<TextureType>('smooth');
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesType>('first');
  const [activeTab, setActiveTab] = useState<'techniques' | 'combinations' | 'species' | 'custom'>('techniques');
  
  // Counterpoint parameters
  const [transpositionInterval, setTranspositionInterval] = useState(0); // Changed to single number, default 0 (no transposition)
  const [sequenceInterval, setSequenceInterval] = useState([2]); // Major second
  const [sequenceRepetitions, setSequenceRepetitions] = useState([3]);
  const [ornamentationDensity, setOrnamentationDensity] = useState([50]);
  const [fragmentSize, setFragmentSize] = useState([3]);
  const [enableConsonanceCheck, setEnableConsonanceCheck] = useState(true);
  const [enableVoiceLeading, setEnableVoiceLeading] = useState(true);
  const [targetBachVariable, setTargetBachVariable] = useState<BachVariableName>('cantusFirmus');
  
  // Inversion parameters
  const [inversionAxisType, setInversionAxisType] = useState<'first' | 'last' | 'middle' | 'custom'>('first');
  const [customInversionAxis, setCustomInversionAxis] = useState([60]); // Middle C default
  
  // Ornamentation parameters
  const [appoggiaturaType, setAppoggiaturaType] = useState<'step-above' | 'step-below' | 'halfstep-above' | 'halfstep-below' | 'none'>('none');
  const [customOrnamentPatterns, setCustomOrnamentPatterns] = useState<{ id: string; name: string; pattern: number[] }[]>([
    { id: 'trill', name: 'Trill (0, +1, 0, +1)', pattern: [0, 1, 0, 1] },
    { id: 'mordent', name: 'Mordent (0, -1, 0)', pattern: [0, -1, 0] },
    { id: 'turn', name: 'Turn (+1, 0, -1, 0)', pattern: [1, 0, -1, 0] }
  ]);
  const [selectedOrnamentPattern, setSelectedOrnamentPattern] = useState<string>('none');
  
  // Mode Shifting parameters - NEW
  const [targetModeShiftingMode, setTargetModeShiftingMode] = useState<Mode | null>(null);
  
  // Diminution/Augmentation parameters
  const [diminutionMode, setDiminutionMode] = useState<'strictly' | 'loose' | 'percentage'>('strictly');
  const [diminutionPercentage, setDiminutionPercentage] = useState([100]);
  const [augmentationMode, setAugmentationMode] = useState<'strictly' | 'loose' | 'percentage'>('strictly');
  const [augmentationPercentage, setAugmentationPercentage] = useState([100]);
  
  // Rhythmic parameters
  const [useRhythm, setUseRhythm] = useState(true);
  const [cantusFirmusDuration, setCantusFirmusDuration] = useState<NoteValue>('whole');
  const [targetSpeciesRatio, setTargetSpeciesRatio] = useState<'1:1' | '2:1' | '3:1' | '4:1' | '5:1'>('2:1');
  const [allowSyncopation, setAllowSyncopation] = useState(false);
  const [enableRhythmicVariety, setEnableRhythmicVariety] = useState(true);
  
  // Custom counterpoint input
  const [customCounterpoint, setCustomCounterpoint] = useState('');
  const [generatedCounterpoints, setGeneratedCounterpoints] = useState<{
    melody: Theme;
    technique: string;
    texture: TextureType;
    timestamp: number;
  }[]>([]);

  const handleGenerateCounterpoint = useCallback(async () => {
    try {
      if (!theme || theme.length === 0) {
        toast.error('Please create a theme first');
        return;
      }

      if (!selectedMode) {
        toast.error('Please select a mode first');
        return;
      }

      const parameters = {
        transpositionInterval: transpositionInterval,
        sequenceInterval: sequenceInterval[0],
        sequenceRepetitions: sequenceRepetitions[0],
        ornamentationDensity: ornamentationDensity[0] / 100,
        fragmentSize: fragmentSize[0],
        enableConsonanceCheck,
        enableVoiceLeading,
        targetTexture: selectedTexture,
        // Rhythmic parameters
        useRhythm,
        cantusFirmusDuration,
        targetSpeciesRatio,
        allowSyncopation,
        enableRhythmicVariety,
        // Inversion parameters
        inversionAxisType,
        inversionAxis: inversionAxisType === 'custom' ? customInversionAxis[0] : undefined,
        // Ornamentation parameters
        appoggiaturaType: appoggiaturaType !== 'none' ? appoggiaturaType : undefined,
        customOrnamentPattern: selectedOrnamentPattern !== 'none' 
          ? customOrnamentPatterns.find(p => p.id === selectedOrnamentPattern)
          : undefined,
        // Mode Shifting parameters
        targetMode: targetModeShiftingMode || undefined,
        // Diminution/Augmentation parameters
        diminutionMode,
        diminutionPercentage: diminutionPercentage[0],
        augmentationMode,
        augmentationPercentage: augmentationPercentage[0]
      };

      let counterpoint: Theme;
      let techniqueName: string;

      if (activeTab === 'techniques') {
        counterpoint = CounterpointEngine.generateCounterpoint(
          theme,
          selectedTechnique,
          selectedMode,
          parameters
        );
        techniqueName = COUNTERPOINT_TECHNIQUES.find(t => t.value === selectedTechnique)?.label || selectedTechnique;
      } else if (activeTab === 'combinations') {
        counterpoint = CounterpointEngine.generateCombinedCounterpoint(
          theme,
          selectedCombination,
          selectedMode,
          parameters
        );
        techniqueName = COMBINATION_TECHNIQUES.find(c => c.value === selectedCombination)?.label || selectedCombination;
      } else if (activeTab === 'species') {
        counterpoint = CounterpointEngine.generateSpeciesCounterpoint(
          theme,
          selectedSpecies,
          selectedMode,
          parameters
        );
        techniqueName = `${SPECIES_TYPES.find(s => s.value === selectedSpecies)?.label || selectedSpecies} Counterpoint`;
      } else {
        toast.error('Please select a technique first');
        return;
      }

      if (!counterpoint || counterpoint.length === 0) {
        toast.error('Generated counterpoint is empty - try different parameters');
        return;
      }

      // Add to generated counterpoints history
      const newCounterpoint = {
        melody: counterpoint,
        technique: techniqueName,
        texture: selectedTexture,
        timestamp: Date.now(),
        rhythm: useRhythm ? {
          cantusFirmusDuration,
          speciesRatio: targetSpeciesRatio,
          syncopation: allowSyncopation
        } : undefined
      };

      setGeneratedCounterpoints(prev => [newCounterpoint, ...prev.slice(0, 4)]); // Keep last 5

      // Add to selected Bach variable if available
      if (bachVariables && onBachVariablesChange) {
        const newVariables = {
          ...bachVariables,
          [targetBachVariable]: [...bachVariables[targetBachVariable], ...counterpoint]
        };
        onBachVariablesChange(newVariables);
      }

      // Generate rhythm data for species counterpoint
      let rhythmData: number[] | undefined = undefined;
      if (useRhythm) {
        // Calculate rhythm based on species ratio and CF duration
        const ratio = parseInt(targetSpeciesRatio.split(':')[0]);
        const cfBeats = getNoteValueBeats(cantusFirmusDuration);
        const cpBeats = ratio > 1 ? cfBeats / ratio : cfBeats;
        
        // Generate rhythm array with calculated beat values
        rhythmData = counterpoint.map(() => cpBeats);
        
        // Enhanced logging for debugging
        console.log('🎵 RHYTHM GENERATION:', {
          technique: techniqueName,
          speciesRatio: targetSpeciesRatio,
          ratio: ratio,
          cfDuration: cantusFirmusDuration,
          cfBeats: cfBeats,
          cpBeats: cpBeats,
          counterpointLength: counterpoint.length,
          themeLength: theme.length,
          notesPerCFNote: ratio,
          rhythmDataSample: rhythmData.slice(0, 5)
        });
      }

      // Notify parent component with rhythm data
      onCounterpointGenerated?.(counterpoint, techniqueName, rhythmData);

      const noteNames = counterpoint.slice(0, 3).map(note => midiNoteToNoteName(note)).join(', ');
      const rhythmInfo = useRhythm ? ` (${targetSpeciesRatio} species)` : '';
      toast.success(`Generated ${techniqueName}: ${noteNames}${counterpoint.length > 3 ? '...' : ''} (${counterpoint.length} notes)${rhythmInfo}`);

    } catch (error) {
      console.error('Counterpoint generation error:', error);
      toast.error('Failed to generate counterpoint');
    }
  }, [
    theme,
    selectedMode,
    selectedTechnique,
    selectedCombination,
    selectedSpecies,
    selectedTexture,
    activeTab,
    transpositionInterval,
    sequenceInterval,
    sequenceRepetitions,
    ornamentationDensity,
    fragmentSize,
    enableConsonanceCheck,
    enableVoiceLeading,
    targetBachVariable,
    bachVariables,
    onBachVariablesChange,
    onCounterpointGenerated,
    // Rhythmic parameters
    useRhythm,
    cantusFirmusDuration,
    targetSpeciesRatio,
    allowSyncopation,
    enableRhythmicVariety,
    // Inversion parameters
    inversionAxisType,
    customInversionAxis,
    // Diminution/Augmentation parameters
    diminutionMode,
    diminutionPercentage,
    augmentationMode,
    augmentationPercentage
  ]);

  const handleCustomCounterpointSubmit = useCallback(() => {
    try {
      if (!customCounterpoint.trim()) {
        toast.error('Please enter custom counterpoint notes');
        return;
      }

      // Parse custom input (expecting note names like "C4 D4 E4" or MIDI numbers)
      const notes = customCounterpoint.trim().split(/\s+/);
      const parsedNotes: MidiNote[] = [];

      for (const note of notes) {
        // Try to parse as MIDI number first
        const midiNum = parseInt(note);
        if (!isNaN(midiNum) && midiNum >= 0 && midiNum <= 127) {
          parsedNotes.push(midiNum);
        } else {
          // Try to parse as note name (basic implementation)
          const noteMatch = note.match(/^([A-G][#b]?)(\d+)$/);
          if (noteMatch) {
            const noteName = noteMatch[1];
            const octave = parseInt(noteMatch[2]);
            const noteMap: { [key: string]: number } = {
              'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 
              'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 
              'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
            };
            const pitchClass = noteMap[noteName];
            if (pitchClass !== undefined && octave >= 0 && octave <= 9) {
              parsedNotes.push(octave * 12 + pitchClass);
            }
          }
        }
      }

      if (parsedNotes.length === 0) {
        toast.error('No valid notes found - use note names (C4 D4 E4) or MIDI numbers (60 62 64)');
        return;
      }

      // Add to Bach variables if available
      if (bachVariables && onBachVariablesChange) {
        const newVariables = {
          ...bachVariables,
          [targetBachVariable]: [...bachVariables[targetBachVariable], ...parsedNotes]
        };
        onBachVariablesChange(newVariables);
      }

      // Add to generated counterpoints history
      const newCounterpoint = {
        melody: parsedNotes,
        technique: 'Custom Input',
        texture: selectedTexture,
        timestamp: Date.now()
      };

      setGeneratedCounterpoints(prev => [newCounterpoint, ...prev.slice(0, 4)]);

      onCounterpointGenerated?.(parsedNotes, 'Custom Counterpoint');

      const noteNames = parsedNotes.slice(0, 3).map(note => midiNoteToNoteName(note)).join(', ');
      toast.success(`Added custom counterpoint: ${noteNames}${parsedNotes.length > 3 ? '...' : ''} (${parsedNotes.length} notes)`);

      setCustomCounterpoint('');

    } catch (error) {
      console.error('Custom counterpoint error:', error);
      toast.error('Failed to process custom counterpoint');
    }
  }, [customCounterpoint, selectedTexture, targetBachVariable, bachVariables, onBachVariablesChange, onCounterpointGenerated]);

  const clearCounterpointHistory = useCallback(() => {
    setGeneratedCounterpoints([]);
    toast.success('Counterpoint history cleared');
  }, []);

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Music4 className="w-5 h-5" />
            <h2>Counterpoint Composer</h2>
            <Badge variant="outline" className="text-xs">
              Contemporary Theory
            </Badge>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              Target: {targetBachVariable}
            </Badge>
            {generatedCounterpoints.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearCounterpointHistory}
                className="text-xs gap-1"
              >
                <X className="w-3 h-3" />
                Clear History
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="techniques" className="gap-2">
              <Target className="w-4 h-4" />
              Techniques
            </TabsTrigger>
            <TabsTrigger value="combinations" className="gap-2">
              <Zap className="w-4 h-4" />
              Combinations
            </TabsTrigger>
            <TabsTrigger value="species" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Species
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-2">
              <Plus className="w-4 h-4" />
              Custom
            </TabsTrigger>
          </TabsList>

          <TabsContent value="techniques" className="mt-4 space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Counterpoint Technique</Label>
              <Select value={selectedTechnique} onValueChange={(value) => setSelectedTechnique(value as CounterpointTechnique)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select technique" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTERPOINT_TECHNIQUES.map((technique) => (
                    <SelectItem key={technique.value} value={technique.value}>
                      <div>
                        <div className="font-medium">{technique.label}</div>
                        <div className="text-xs text-muted-foreground">{technique.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="combinations" className="mt-4 space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Combination Technique</Label>
              <Select value={selectedCombination} onValueChange={(value) => setSelectedCombination(value as CounterpointCombination)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select combination" />
                </SelectTrigger>
                <SelectContent>
                  {COMBINATION_TECHNIQUES.map((combination) => (
                    <SelectItem key={combination.value} value={combination.value}>
                      {combination.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="species" className="mt-4 space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Species Counterpoint</Label>
              <Select value={selectedSpecies} onValueChange={(value) => setSelectedSpecies(value as SpeciesType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIES_TYPES.map((species) => (
                    <SelectItem key={species.value} value={species.value}>
                      <div>
                        <div className="font-medium">{species.label}</div>
                        <div className="text-xs text-muted-foreground">{species.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-4 space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Custom Counterpoint Notes</Label>
              <Textarea
                placeholder="Enter notes: C4 D4 E4 F4 or MIDI numbers: 60 62 64 65"
                value={customCounterpoint}
                onChange={(e) => setCustomCounterpoint(e.target.value)}
                className="min-h-20"
              />
              <Button
                onClick={handleCustomCounterpointSubmit}
                className="w-full mt-2"
                disabled={!customCounterpoint.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Counterpoint
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        {/* Rhythm Controls Section - ADDITIVE: Enhanced spacing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Rhythmic Species Counterpoint</h3>
            <Switch
              checked={useRhythm}
              onCheckedChange={setUseRhythm}
            />
          </div>
          
          {useRhythm && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border rhythm-section">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Cantus Firmus Duration</Label>
                  <Select value={cantusFirmusDuration} onValueChange={(value) => setCantusFirmusDuration(value as NoteValue)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="double-whole">Double Whole (8 beats)</SelectItem>
                      <SelectItem value="whole">Whole Note (4 beats)</SelectItem>
                      <SelectItem value="dotted-half">Dotted Half (3 beats)</SelectItem>
                      <SelectItem value="half">Half Note (2 beats)</SelectItem>
                      <SelectItem value="dotted-quarter">Dotted Quarter (1.5 beats)</SelectItem>
                      <SelectItem value="quarter">Quarter Note (1 beat)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Species Ratio</Label>
                  <Select value={targetSpeciesRatio} onValueChange={(value) => setTargetSpeciesRatio(value as any)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">
                        <div>
                          <div className="font-medium">1:1 (First Species)</div>
                          <div className="text-xs text-muted-foreground">Note against note</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="2:1">
                        <div>
                          <div className="font-medium">2:1 (Second Species)</div>
                          <div className="text-xs text-muted-foreground">Two notes against one</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="3:1">
                        <div>
                          <div className="font-medium">3:1 (Third Species)</div>
                          <div className="text-xs text-muted-foreground">Three notes against one</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="4:1">
                        <div>
                          <div className="font-medium">4:1 (Fourth Species)</div>
                          <div className="text-xs text-muted-foreground">Four notes against one</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="5:1">
                        <div>
                          <div className="font-medium">5:1 (Florid Species)</div>
                          <div className="text-xs text-muted-foreground">Mixed species counterpoint</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="syncopation"
                    checked={allowSyncopation}
                    onCheckedChange={setAllowSyncopation}
                  />
                  <Label htmlFor="syncopation" className="text-xs">
                    Allow Syncopation
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="rhythmic-variety"
                    checked={enableRhythmicVariety}
                    onCheckedChange={setEnableRhythmicVariety}
                  />
                  <Label htmlFor="rhythmic-variety" className="text-xs">
                    Rhythmic Variety
                  </Label>
                </div>
              </div>

              <div className="text-xs text-muted-foreground border-t pt-2 space-y-1">
                <div>
                  <strong>Current Setup:</strong> {cantusFirmusDuration} notes in CF → {targetSpeciesRatio} ratio
                </div>
                <div className="text-indigo-600 dark:text-indigo-400">
                  {targetSpeciesRatio === '1:1' && '🎵 First Species: Note against note (same duration)'}
                  {targetSpeciesRatio === '2:1' && '🎵 Second Species: Two notes against one (half duration)'}
                  {targetSpeciesRatio === '3:1' && '🎵 Third Species: Three notes against one (third duration)'}
                  {targetSpeciesRatio === '4:1' && '🎵 Fourth Species: Four notes against one (quarter duration)'}
                  {targetSpeciesRatio === '5:1' && '🎵 Fifth Species (Florid): Mixed species counterpoint'}
                </div>
                <div className="text-green-600 dark:text-green-400">
                  ✨ <strong>Authentic Species Counterpoint:</strong> Creates proper rhythmic relationships between voices, 
                  following traditional counterpoint rules with consonance/dissonance treatment and voice leading.
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Parameters Section - ADDITIVE: Enhanced spacing */}
        <div className="space-y-4">
          <h3 className="font-medium">Technique Parameters</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 params-grid">
            <div>
              <Label className="text-xs">Texture Type</Label>
              <Select value={selectedTexture} onValueChange={(value) => setSelectedTexture(value as TextureType)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEXTURE_TYPES.map((texture) => (
                    <SelectItem key={texture.value} value={texture.value}>
                      <div>
                        <div className="font-medium">{texture.label}</div>
                        <div className="text-xs text-muted-foreground">{texture.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Target Bach Variable</Label>
              <Select value={targetBachVariable} onValueChange={(value) => setTargetBachVariable(value as BachVariableName)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cantusFirmus">Cantus Firmus</SelectItem>
                  <SelectItem value="floridCounterpoint1">Florid Counterpoint 1</SelectItem>
                  <SelectItem value="floridCounterpoint2">Florid Counterpoint 2</SelectItem>
                  <SelectItem value="cantusFirmusFragment1">CF Fragment 1</SelectItem>
                  <SelectItem value="cantusFirmusFragment2">CF Fragment 2</SelectItem>
                  <SelectItem value="floridCounterpointFrag1">FCP Fragment 1</SelectItem>
                  <SelectItem value="floridCounterpointFrag2">FCP Fragment 2</SelectItem>
                  <SelectItem value="countersubject1">Counter Subject 1</SelectItem>
                  <SelectItem value="countersubject2">Counter Subject 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Transposition Target</Label>
              <Select 
                value={transpositionInterval.toString()} 
                onValueChange={(value) => {
                  const interval = parseInt(value);
                  setTranspositionInterval(interval);
                  const keyName = interval === 0 ? 'Original Key' : 
                    ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'][Math.abs(interval % 12)] || 'Unknown';
                  const direction = interval > 0 ? 'up' : interval < 0 ? 'down' : '';
                  toast.success(`Transposition set to ${interval > 0 ? '+' : ''}${interval} semitones ${direction ? `(${direction})` : ''}`);
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectItem value="0">
                    <div>
                      <div className="font-medium">Original Key (0)</div>
                      <div className="text-xs text-muted-foreground">No transposition</div>
                    </div>
                  </SelectItem>
                  
                  <div className="px-2 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 border-t border-blue-200">
                    Transpose Up
                  </div>
                  <SelectItem value="1"><div><div className="font-medium">+1 semitone (C#/Db)</div><div className="text-xs text-muted-foreground">Minor second up</div></div></SelectItem>
                  <SelectItem value="2"><div><div className="font-medium">+2 semitones (D)</div><div className="text-xs text-muted-foreground">Major second up</div></div></SelectItem>
                  <SelectItem value="3"><div><div className="font-medium">+3 semitones (D#/Eb)</div><div className="text-xs text-muted-foreground">Minor third up</div></div></SelectItem>
                  <SelectItem value="4"><div><div className="font-medium">+4 semitones (E)</div><div className="text-xs text-muted-foreground">Major third up</div></div></SelectItem>
                  <SelectItem value="5"><div><div className="font-medium">+5 semitones (F)</div><div className="text-xs text-muted-foreground">Perfect fourth up</div></div></SelectItem>
                  <SelectItem value="6"><div><div className="font-medium">+6 semitones (F#/Gb)</div><div className="text-xs text-muted-foreground">Tritone up</div></div></SelectItem>
                  <SelectItem value="7"><div><div className="font-medium">+7 semitones (G)</div><div className="text-xs text-muted-foreground">Perfect fifth up</div></div></SelectItem>
                  <SelectItem value="8"><div><div className="font-medium">+8 semitones (G#/Ab)</div><div className="text-xs text-muted-foreground">Minor sixth up</div></div></SelectItem>
                  <SelectItem value="9"><div><div className="font-medium">+9 semitones (A)</div><div className="text-xs text-muted-foreground">Major sixth up</div></div></SelectItem>
                  <SelectItem value="10"><div><div className="font-medium">+10 semitones (A#/Bb)</div><div className="text-xs text-muted-foreground">Minor seventh up</div></div></SelectItem>
                  <SelectItem value="11"><div><div className="font-medium">+11 semitones (B)</div><div className="text-xs text-muted-foreground">Major seventh up</div></div></SelectItem>
                  <SelectItem value="12"><div><div className="font-medium">+12 semitones (Octave)</div><div className="text-xs text-muted-foreground">Octave up</div></div></SelectItem>
                  
                  <div className="px-2 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 border-t border-purple-200">
                    Transpose Down
                  </div>
                  <SelectItem value="-1"><div><div className="font-medium">-1 semitone (B)</div><div className="text-xs text-muted-foreground">Minor second down</div></div></SelectItem>
                  <SelectItem value="-2"><div><div className="font-medium">-2 semitones (A#/Bb)</div><div className="text-xs text-muted-foreground">Major second down</div></div></SelectItem>
                  <SelectItem value="-3"><div><div className="font-medium">-3 semitones (A)</div><div className="text-xs text-muted-foreground">Minor third down</div></div></SelectItem>
                  <SelectItem value="-4"><div><div className="font-medium">-4 semitones (G#/Ab)</div><div className="text-xs text-muted-foreground">Major third down</div></div></SelectItem>
                  <SelectItem value="-5"><div><div className="font-medium">-5 semitones (G)</div><div className="text-xs text-muted-foreground">Perfect fourth down</div></div></SelectItem>
                  <SelectItem value="-6"><div><div className="font-medium">-6 semitones (F#/Gb)</div><div className="text-xs text-muted-foreground">Tritone down</div></div></SelectItem>
                  <SelectItem value="-7"><div><div className="font-medium">-7 semitones (F)</div><div className="text-xs text-muted-foreground">Perfect fifth down</div></div></SelectItem>
                  <SelectItem value="-8"><div><div className="font-medium">-8 semitones (E)</div><div className="text-xs text-muted-foreground">Minor sixth down</div></div></SelectItem>
                  <SelectItem value="-9"><div><div className="font-medium">-9 semitones (D#/Eb)</div><div className="text-xs text-muted-foreground">Major sixth down</div></div></SelectItem>
                  <SelectItem value="-10"><div><div className="font-medium">-10 semitones (D)</div><div className="text-xs text-muted-foreground">Minor seventh down</div></div></SelectItem>
                  <SelectItem value="-11"><div><div className="font-medium">-11 semitones (C#/Db)</div><div className="text-xs text-muted-foreground">Major seventh down</div></div></SelectItem>
                  <SelectItem value="-12"><div><div className="font-medium">-12 semitones (Octave)</div><div className="text-xs text-muted-foreground">Octave down</div></div></SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Sequence Interval: {sequenceInterval[0]} semitones</Label>
              <Slider
                value={sequenceInterval}
                onValueChange={setSequenceInterval}
                max={7}
                min={1}
                step={1}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Sequence Repetitions: {sequenceRepetitions[0]}</Label>
              <Slider
                value={sequenceRepetitions}
                onValueChange={setSequenceRepetitions}
                max={6}
                min={2}
                step={1}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Ornamentation Density: {ornamentationDensity[0]}%</Label>
              <Slider
                value={ornamentationDensity}
                onValueChange={setOrnamentationDensity}
                max={100}
                min={0}
                step={10}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Fragment Size: {fragmentSize[0]} notes</Label>
              <Slider
                value={fragmentSize}
                onValueChange={setFragmentSize}
                max={8}
                min={2}
                step={1}
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="consonance-check"
                checked={enableConsonanceCheck}
                onCheckedChange={setEnableConsonanceCheck}
              />
              <Label htmlFor="consonance-check" className="text-xs">
                Consonance Check
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="voice-leading"
                checked={enableVoiceLeading}
                onCheckedChange={setEnableVoiceLeading}
              />
              <Label htmlFor="voice-leading" className="text-xs">
                Voice Leading
              </Label>
            </div>
          </div>
          
          {/* Inversion Axis Controls - shown when Inversion technique is selected */}
          {selectedTechnique === 'inversion' && (
            <div className="mt-4 p-3 bg-blue-50/30 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Music4 className="w-4 h-4 text-blue-600" />
                <Label className="font-medium text-blue-900 dark:text-blue-100">Inversion Axis Control</Label>
                <Badge variant="outline" className="text-xs">
                  New Feature
                </Badge>
              </div>
              
              <div>
                <Label className="text-xs text-blue-800 dark:text-blue-200 mb-2 block">
                  Choose the pivot point for interval inversion:
                </Label>
                <Select value={inversionAxisType} onValueChange={(value) => setInversionAxisType(value as any)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">
                      <div>
                        <div className="font-medium">First Note</div>
                        <div className="text-xs text-muted-foreground">Use theme's first note as axis (default)</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="last">
                      <div>
                        <div className="font-medium">Last Note</div>
                        <div className="text-xs text-muted-foreground">Use theme's last note as axis</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="middle">
                      <div>
                        <div className="font-medium">Middle Note</div>
                        <div className="text-xs text-muted-foreground">Use theme's middle note as axis</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="custom">
                      <div>
                        <div className="font-medium">Custom MIDI Note</div>
                        <div className="text-xs text-muted-foreground">Choose your own axis note</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {inversionAxisType === 'custom' && (
                <div>
                  <Label className="text-xs text-blue-800 dark:text-blue-200">
                    Custom Axis (MIDI {customInversionAxis[0]} = {midiNoteToNoteName(customInversionAxis[0])})
                  </Label>
                  <Slider
                    value={customInversionAxis}
                    onValueChange={setCustomInversionAxis}
                    max={96}
                    min={24}
                    step={1}
                    className="mt-2"
                  />
                </div>
              )}
              
              <div className="text-xs text-blue-700 dark:text-blue-300 border-t border-blue-200 pt-2">
                <strong>How it works:</strong> All intervals in the theme will be inverted (flipped upside-down) around 
                the chosen axis note. For example, if the axis is C4 and a note is 2 semitones above it (D4), 
                the inverted note will be 2 semitones below it (Bb3).
              </div>
            </div>
          )}
          
          {/* Appoggiatura Type Selection - NEW FEATURE */}
          {selectedTechnique === 'ornamentation' && (
            <div className="space-y-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <Label className="font-medium text-emerald-900 dark:text-emerald-100">
                  Appoggiatura Type
                </Label>
              </div>
              
              <div>
                <Label className="text-xs text-emerald-800 dark:text-emerald-200 mb-2 block">
                  Add expressive appoggiaturas (leaning notes):
                </Label>
                <Select value={appoggiaturaType} onValueChange={(value) => setAppoggiaturaType(value as any)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div>
                        <div className="font-medium">None</div>
                        <div className="text-xs text-muted-foreground">No appoggiaturas</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="step-above">
                      <div>
                        <div className="font-medium">Step Above</div>
                        <div className="text-xs text-muted-foreground">Full step approach from above (+2 semitones)</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="step-below">
                      <div>
                        <div className="font-medium">Step Below</div>
                        <div className="text-xs text-muted-foreground">Full step approach from below (-2 semitones)</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="halfstep-above">
                      <div>
                        <div className="font-medium">Half-Step Above</div>
                        <div className="text-xs text-muted-foreground">Half step approach from above (+1 semitone)</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="halfstep-below">
                      <div>
                        <div className="font-medium">Half-Step Below</div>
                        <div className="text-xs text-muted-foreground">Half step approach from below (-1 semitone)</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-xs text-emerald-700 dark:text-emerald-300 border-t border-emerald-200 pt-2">
                <strong>How it works:</strong> Appoggiaturas add expressive "leaning notes" before the main melody notes. 
                The beat duration is divided between the appoggiatura (2/3) and the main note (1/3), creating tension and resolution.
              </div>
            </div>
          )}
          
          {/* Custom Ornament Pattern Management - NEW FEATURE */}
          {selectedTechnique === 'ornamentation' && (
            <div className="space-y-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <Label className="font-medium text-emerald-900 dark:text-emerald-100">
                  Custom Ornament Patterns
                </Label>
              </div>
              
              <div>
                <Label className="text-xs text-emerald-800 dark:text-emerald-200 mb-2 block">
                  Select or create custom ornament patterns:
                </Label>
                <Select value={selectedOrnamentPattern} onValueChange={setSelectedOrnamentPattern}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div>
                        <div className="font-medium">None</div>
                        <div className="text-xs text-muted-foreground">No custom pattern</div>
                      </div>
                    </SelectItem>
                    {customOrnamentPatterns.map((pattern) => (
                      <SelectItem key={pattern.id} value={pattern.id}>
                        <div>
                          <div className="font-medium">{pattern.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {pattern.pattern.map(n => n >= 0 ? `+${n}` : n).join(', ')}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Pattern Manager - Show all patterns with delete buttons */}
              <div className="space-y-2">
                <Label className="text-xs text-emerald-800 dark:text-emerald-200">
                  Manage Patterns:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {customOrnamentPatterns.map((pattern) => {
                    const isBuiltIn = ['trill', 'mordent', 'turn'].includes(pattern.id);
                    return (
                      <Badge 
                        key={pattern.id} 
                        variant={isBuiltIn ? "secondary" : "outline"}
                        className="gap-1 text-xs"
                      >
                        <span>{pattern.name}</span>
                        <span className="text-muted-foreground font-mono text-[10px]">
                          [{pattern.pattern.map(n => n >= 0 ? `+${n}` : n).join(',')}]
                        </span>
                        {!isBuiltIn && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              try {
                                setCustomOrnamentPatterns(prev => 
                                  prev.filter(p => p.id !== pattern.id)
                                );
                                if (selectedOrnamentPattern === pattern.id) {
                                  setSelectedOrnamentPattern('none');
                                }
                                toast.success(`Deleted pattern: ${pattern.name}`);
                              } catch (error) {
                                console.error('Error deleting pattern:', error);
                                toast.error('Failed to delete pattern');
                              }
                            }}
                            className="ml-1 hover:text-destructive transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              
              {/* Add Pattern Button */}
              <Button
                onClick={() => {
                  try {
                    const patternName = prompt('Enter pattern name (e.g., "My Ornament"):');
                    if (!patternName || patternName.trim() === '') {
                      toast.warning('Pattern name cannot be empty');
                      return;
                    }
                    
                    // Check for duplicate names
                    if (customOrnamentPatterns.some(p => p.name === patternName.trim())) {
                      toast.error('Pattern name already exists');
                      return;
                    }
                    
                    const patternInput = prompt(
                      'Enter pattern intervals separated by commas (e.g., "0,1,0,-1" for a trill).\n' +
                      'Use numbers from -12 to +12 representing semitone intervals.\n' +
                      'Example: "0,1,0" = main note, up 1 semitone, back to main note'
                    );
                    
                    if (!patternInput || patternInput.trim() === '') {
                      toast.warning('Pattern intervals cannot be empty');
                      return;
                    }
                    
                    // Parse and validate intervals
                    const intervals = patternInput
                      .split(',')
                      .map(s => s.trim())
                      .filter(s => s !== '')
                      .map(s => {
                        const num = parseInt(s, 10);
                        if (isNaN(num)) {
                          throw new Error(`Invalid number: ${s}`);
                        }
                        if (num < -12 || num > 12) {
                          throw new Error(`Interval out of range: ${num} (must be -12 to +12)`);
                        }
                        return num;
                      });
                    
                    if (intervals.length === 0) {
                      toast.error('Pattern must contain at least one interval');
                      return;
                    }
                    
                    if (intervals.length > 8) {
                      toast.warning('Pattern too long, truncating to 8 intervals');
                      intervals.length = 8;
                    }
                    
                    const newPattern = {
                      id: `custom-${Date.now()}`,
                      name: patternName.trim(),
                      pattern: intervals
                    };
                    
                    setCustomOrnamentPatterns(prev => [...prev, newPattern]);
                    setSelectedOrnamentPattern(newPattern.id);
                    toast.success(`Created pattern: ${newPattern.name}`);
                  } catch (error) {
                    console.error('Error creating pattern:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Invalid pattern input';
                    toast.error(`Failed to create pattern: ${errorMessage}`);
                  }
                }}
                variant="outline"
                size="sm"
                className="w-full gap-2 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
              >
                <Plus className="w-3 h-3" />
                Add New Pattern
              </Button>
              
              <div className="text-xs text-emerald-700 dark:text-emerald-300 border-t border-emerald-200 pt-2">
                <strong>How it works:</strong> Custom patterns define interval sequences to ornament your melody. 
                For example, [0, 1, 0, -1] creates a trill-like pattern. Built-in patterns (trill, mordent, turn) cannot be deleted.
              </div>
            </div>
          )}
          
          {/* Transposition Enhanced Controls - shown when Transposition technique is selected */}
          {selectedTechnique === 'transposition' && (
            <div className="space-y-3 p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <Label className="font-medium text-indigo-900 dark:text-indigo-100">
                  Transposition Settings
                </Label>
                <Badge variant="outline" className="text-xs">
                  Enhanced
                </Badge>
              </div>
              
              <div>
                <Label className="text-xs text-indigo-800 dark:text-indigo-200 mb-2 block">
                  Select the transposition target (applies to Theme or Bach Variables):
                </Label>
                <Select 
                  value={transpositionInterval.toString()} 
                  onValueChange={(value) => {
                    const interval = parseInt(value);
                    setTranspositionInterval(interval);
                    const keyName = interval === 0 ? 'Original Key' : 
                      ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'][Math.abs(interval % 12)] || 'Unknown';
                    const direction = interval > 0 ? 'up' : interval < 0 ? 'down' : '';
                    toast.success(`Transposition: ${interval > 0 ? '+' : ''}${interval} semitones ${direction ? `(${direction})` : ''}`);
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select transposition..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectItem value="0">
                      <div>
                        <div className="font-medium">Original Key (0)</div>
                        <div className="text-xs text-muted-foreground">No transposition</div>
                      </div>
                    </SelectItem>
                    
                    <div className="px-2 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 border-t border-blue-200">
                      Transpose Up
                    </div>
                    <SelectItem value="1"><div><div className="font-medium">+1 semitone (C#/Db)</div><div className="text-xs text-muted-foreground">Minor second up</div></div></SelectItem>
                    <SelectItem value="2"><div><div className="font-medium">+2 semitones (D)</div><div className="text-xs text-muted-foreground">Major second up</div></div></SelectItem>
                    <SelectItem value="3"><div><div className="font-medium">+3 semitones (D#/Eb)</div><div className="text-xs text-muted-foreground">Minor third up</div></div></SelectItem>
                    <SelectItem value="4"><div><div className="font-medium">+4 semitones (E)</div><div className="text-xs text-muted-foreground">Major third up</div></div></SelectItem>
                    <SelectItem value="5"><div><div className="font-medium">+5 semitones (F)</div><div className="text-xs text-muted-foreground">Perfect fourth up</div></div></SelectItem>
                    <SelectItem value="6"><div><div className="font-medium">+6 semitones (F#/Gb)</div><div className="text-xs text-muted-foreground">Tritone up</div></div></SelectItem>
                    <SelectItem value="7"><div><div className="font-medium">+7 semitones (G)</div><div className="text-xs text-muted-foreground">Perfect fifth up</div></div></SelectItem>
                    <SelectItem value="8"><div><div className="font-medium">+8 semitones (G#/Ab)</div><div className="text-xs text-muted-foreground">Minor sixth up</div></div></SelectItem>
                    <SelectItem value="9"><div><div className="font-medium">+9 semitones (A)</div><div className="text-xs text-muted-foreground">Major sixth up</div></div></SelectItem>
                    <SelectItem value="10"><div><div className="font-medium">+10 semitones (A#/Bb)</div><div className="text-xs text-muted-foreground">Minor seventh up</div></div></SelectItem>
                    <SelectItem value="11"><div><div className="font-medium">+11 semitones (B)</div><div className="text-xs text-muted-foreground">Major seventh up</div></div></SelectItem>
                    <SelectItem value="12"><div><div className="font-medium">+12 semitones (Octave)</div><div className="text-xs text-muted-foreground">Octave up</div></div></SelectItem>
                    
                    <div className="px-2 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 border-t border-purple-200">
                      Transpose Down
                    </div>
                    <SelectItem value="-1"><div><div className="font-medium">-1 semitone (B)</div><div className="text-xs text-muted-foreground">Minor second down</div></div></SelectItem>
                    <SelectItem value="-2"><div><div className="font-medium">-2 semitones (A#/Bb)</div><div className="text-xs text-muted-foreground">Major second down</div></div></SelectItem>
                    <SelectItem value="-3"><div><div className="font-medium">-3 semitones (A)</div><div className="text-xs text-muted-foreground">Minor third down</div></div></SelectItem>
                    <SelectItem value="-4"><div><div className="font-medium">-4 semitones (G#/Ab)</div><div className="text-xs text-muted-foreground">Major third down</div></div></SelectItem>
                    <SelectItem value="-5"><div><div className="font-medium">-5 semitones (G)</div><div className="text-xs text-muted-foreground">Perfect fourth down</div></div></SelectItem>
                    <SelectItem value="-6"><div><div className="font-medium">-6 semitones (F#/Gb)</div><div className="text-xs text-muted-foreground">Tritone down</div></div></SelectItem>
                    <SelectItem value="-7"><div><div className="font-medium">-7 semitones (F)</div><div className="text-xs text-muted-foreground">Perfect fifth down</div></div></SelectItem>
                    <SelectItem value="-8"><div><div className="font-medium">-8 semitones (E)</div><div className="text-xs text-muted-foreground">Minor sixth down</div></div></SelectItem>
                    <SelectItem value="-9"><div><div className="font-medium">-9 semitones (D#/Eb)</div><div className="text-xs text-muted-foreground">Major sixth down</div></div></SelectItem>
                    <SelectItem value="-10"><div><div className="font-medium">-10 semitones (D)</div><div className="text-xs text-muted-foreground">Minor seventh down</div></div></SelectItem>
                    <SelectItem value="-11"><div><div className="font-medium">-11 semitones (C#/Db)</div><div className="text-xs text-muted-foreground">Major seventh down</div></div></SelectItem>
                    <SelectItem value="-12"><div><div className="font-medium">-12 semitones (Octave)</div><div className="text-xs text-muted-foreground">Octave down</div></div></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {transpositionInterval !== 0 && (
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded border border-indigo-300 dark:border-indigo-700">
                  <div className="text-xs">
                    <div className="font-medium text-indigo-900 dark:text-indigo-100">
                      Transposition: {transpositionInterval > 0 ? '+' : ''}{transpositionInterval} semitones
                    </div>
                    <div className="text-indigo-700 dark:text-indigo-300 mt-1">
                      Direction: {transpositionInterval > 0 ? 'Up' : 'Down'} • Interval: {Math.abs(transpositionInterval)} semitones
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-indigo-700 dark:text-indigo-300 border-t border-indigo-200 pt-2">
                <strong>How it works:</strong> Transposition moves your theme (or Bach Variables) to a different pitch level \
                by the specified number of semitones, preserving the melodic intervals and contour while changing the overall key.
              </div>
            </div>
          )}
          
          {/* Mode Shifting Target Mode Selection - NEW FEATURE */}
          {selectedTechnique === 'modeShifting' && (
            <div className="space-y-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <Label className="font-medium text-emerald-900 dark:text-emerald-100">
                  Target Mode
                </Label>
              </div>
              
              <div>
                <Label className="text-xs text-emerald-800 dark:text-emerald-200 mb-2 block">
                  Select the target mode to shift the melody into:
                </Label>
                <Select 
                  value={targetModeShiftingMode?.id || 'none'} 
                  onValueChange={(value) => {
                    if (value === 'none') {
                      setTargetModeShiftingMode(null);
                    } else {
                      // Find the mode from modeCategories
                      const allModes = modeCategories?.flatMap(cat => cat.modes) || [];
                      const selectedMode = allModes.find(m => m.id === value);
                      if (selectedMode) {
                        setTargetModeShiftingMode(selectedMode);
                        toast.success(`Target mode set to: ${selectedMode.name}`);
                      } else {
                        toast.error('Failed to find selected mode');
                      }
                    }
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select target mode..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectItem value="none">
                      <div>
                        <div className="font-medium">None</div>
                        <div className="text-xs text-muted-foreground">No mode shifting (use current mode)</div>
                      </div>
                    </SelectItem>
                    
                    {modeCategories?.map((category) => (
                      <div key={category.name}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 border-t border-emerald-200 dark:border-emerald-800">
                          {category.name}
                        </div>
                        {category.modes.map((mode) => (
                          <SelectItem key={mode.id} value={mode.id}>
                            <div>
                              <div className="font-medium">{mode.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {mode.intervals.join('-')}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {targetModeShiftingMode && (
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded border border-emerald-300 dark:border-emerald-700">
                  <div className="text-xs">
                    <div className="font-medium text-emerald-900 dark:text-emerald-100">
                      Selected: {targetModeShiftingMode.name}
                    </div>
                    <div className="text-emerald-700 dark:text-emerald-300 mt-1">
                      Intervals: {targetModeShiftingMode.intervals.join(', ')}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-emerald-700 dark:text-emerald-300 border-t border-emerald-200 pt-2">
                <strong>How it works:</strong> Mode Shifting intelligently adapts your theme to a different modal context 
                while preserving its melodic contour and character. The engine maps scale degrees from the current mode 
                to the target mode, maintaining the shape and feel of the original melody.
              </div>
            </div>
          )}
          
          {/* Diminution Controls - NEW FEATURE */}
          {selectedTechnique === 'diminution' && (
            <div className="space-y-3 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-600" />
                <Label className="font-medium text-orange-900 dark:text-orange-100">
                  Diminution Settings
                </Label>
                <Badge variant="outline" className="text-xs">
                  Enhanced
                </Badge>
              </div>
              
              <div>
                <Label className="text-xs text-orange-800 dark:text-orange-200 mb-2 block">
                  Select diminution mode:
                </Label>
                <Select 
                  value={diminutionMode} 
                  onValueChange={(value) => {
                    setDiminutionMode(value as 'strictly' | 'loose' | 'percentage');
                    const modeLabels = {
                      'strictly': 'Strictly (all notes affected)',
                      'loose': 'Loose (random notes affected)',
                      'percentage': 'Percentage (controlled by slider)'
                    };
                    toast.success(`Diminution mode: ${modeLabels[value as keyof typeof modeLabels]}`);
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strictly">
                      <div>
                        <div className="font-medium">Strictly</div>
                        <div className="text-xs text-muted-foreground">All notes reduced to half duration</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="loose">
                      <div>
                        <div className="font-medium">Loose</div>
                        <div className="text-xs text-muted-foreground">Random notes reduced (50% probability)</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="percentage">
                      <div>
                        <div className="font-medium">Percentage</div>
                        <div className="text-xs text-muted-foreground">User-controlled percentage of notes</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {diminutionMode === 'percentage' && (
                <div>
                  <Label className="text-xs text-orange-800 dark:text-orange-200">
                    Diminution Percentage: {diminutionPercentage[0]}%
                  </Label>
                  <Slider
                    value={diminutionPercentage}
                    onValueChange={setDiminutionPercentage}
                    max={100}
                    min={0}
                    step={5}
                    className="mt-2"
                  />
                  <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    {diminutionPercentage[0]}% of notes will be reduced to half duration
                  </div>
                </div>
              )}
              
              <div className="text-xs text-orange-700 dark:text-orange-300 border-t border-orange-200 pt-2">
                <strong>How it works:</strong> Diminution reduces note durations to create faster rhythmic movement. 
                In "strictly" mode, all notes are halved. In "loose" mode, roughly half the notes are randomly selected. 
                In "percentage" mode, you control exactly what percentage of notes are affected.
              </div>
            </div>
          )}
          
          {/* Augmentation Controls - NEW FEATURE */}
          {selectedTechnique === 'augmentation' && (
            <div className="space-y-3 p-3 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-600" />
                <Label className="font-medium text-violet-900 dark:text-violet-100">
                  Augmentation Settings
                </Label>
                <Badge variant="outline" className="text-xs">
                  Enhanced
                </Badge>
              </div>
              
              <div>
                <Label className="text-xs text-violet-800 dark:text-violet-200 mb-2 block">
                  Select augmentation mode:
                </Label>
                <Select 
                  value={augmentationMode} 
                  onValueChange={(value) => {
                    setAugmentationMode(value as 'strictly' | 'loose' | 'percentage');
                    const modeLabels = {
                      'strictly': 'Strictly (all notes affected)',
                      'loose': 'Loose (random notes affected)',
                      'percentage': 'Percentage (controlled by slider)'
                    };
                    toast.success(`Augmentation mode: ${modeLabels[value as keyof typeof modeLabels]}`);
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strictly">
                      <div>
                        <div className="font-medium">Strictly</div>
                        <div className="text-xs text-muted-foreground">All notes doubled in duration</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="loose">
                      <div>
                        <div className="font-medium">Loose</div>
                        <div className="text-xs text-muted-foreground">Random notes doubled (50% probability)</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="percentage">
                      <div>
                        <div className="font-medium">Percentage</div>
                        <div className="text-xs text-muted-foreground">User-controlled percentage of notes</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {augmentationMode === 'percentage' && (
                <div>
                  <Label className="text-xs text-violet-800 dark:text-violet-200">
                    Augmentation Percentage: {augmentationPercentage[0]}%
                  </Label>
                  <Slider
                    value={augmentationPercentage}
                    onValueChange={setAugmentationPercentage}
                    max={100}
                    min={0}
                    step={5}
                    className="mt-2"
                  />
                  <div className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                    {augmentationPercentage[0]}% of notes will be doubled in duration
                  </div>
                </div>
              )}
              
              <div className="text-xs text-violet-700 dark:text-violet-300 border-t border-violet-200 pt-2">
                <strong>How it works:</strong> Augmentation increases note durations to create slower, more sustained melodic movement. 
                In "strictly" mode, all notes are doubled. In "loose" mode, roughly half the notes are randomly selected. 
                In "percentage" mode, you control exactly what percentage of notes are affected.
              </div>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Generate Button */}
        <Button
          onClick={handleGenerateCounterpoint}
          className="w-full gap-2"
          disabled={!theme || theme.length === 0 || !selectedMode}
        >
          <Waves className="w-4 h-4" />
          Generate Counterpoint
        </Button>

        {/* Generated Counterpoints History */}
        {generatedCounterpoints.length > 0 && (
          <div className="mt-4 space-y-2">
            <Label className="text-sm font-medium">Recent Counterpoints</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {generatedCounterpoints.map((cp, index) => (
                <div key={cp.timestamp} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                  <div>
                    <span className="font-medium">{cp.technique}</span>
                    <span className="text-muted-foreground ml-2">
                      {cp.melody.slice(0, 3).map(note => midiNoteToNoteName(note)).join(', ')}
                      {cp.melody.length > 3 ? '...' : ''} ({cp.melody.length} notes)
                    </span>
                    {(cp as any).rhythm && (
                      <span className="text-indigo-600 dark:text-indigo-400 ml-2 font-mono">
                        {(cp as any).rhythm.speciesRatio} species
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">{cp.texture}</Badge>
                    {(cp as any).rhythm && (
                      <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        {(cp as any).rhythm.cantusFirmusDuration}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}