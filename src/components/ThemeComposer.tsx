import { useState, useEffect } from 'react';
import { Theme, PITCH_NAMES, BachLikeVariables, BachVariableName, getBachVariableShortLabel, Mode, KeySignature, MidiNote, pitchClassToMidiNote, pitchClassAndOctaveToMidiNote, midiNoteToNoteName, MelodyElement, RestValue, RestDuration, NoteValue, isRest, isNote, melodyElementToString, getRestValueBeats } from '../types/musical';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BachLikeVariables as BachVariablesComponent } from './BachLikeVariables';
import { ModeScaleBuilder } from './ModeScaleBuilder';
import { RhythmControlsEnhanced } from './RhythmControlsEnhanced';
import { ArpeggioPatternSelector } from './ArpeggioPatternSelector';
import { MelodyVisualizer } from './MelodyVisualizer';
import { X, Plus, Shuffle, Trash2, Music2, Music, Pause, Sliders } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Enhanced theme with rest duration tracking
export interface EnhancedTheme {
  melody: Theme;
  restDurations: Map<number, RestDuration>; // Maps melody index to rest duration
}

// Utility function to get rest duration for an element
export function getRestDuration(
  theme: Theme, 
  index: number, 
  restDurations: Map<number, RestDuration>,
  defaultDuration: RestDuration = 'quarter-rest'
): RestDuration | null {
  if (index < 0 || index >= theme.length || !isRest(theme[index])) {
    return null;
  }
  return restDurations.get(index) || defaultDuration;
}

// Utility function to get rest duration in beats
export function getRestDurationBeats(
  theme: Theme, 
  index: number, 
  restDurations: Map<number, RestDuration>,
  defaultDuration: RestDuration = 'quarter-rest'
): number {
  const duration = getRestDuration(theme, index, restDurations, defaultDuration);
  return duration ? getRestValueBeats(duration) : 1; // Default to 1 beat
}

interface ThemeComposerProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  bachVariables?: BachLikeVariables;
  onBachVariablesChange?: (variables: BachLikeVariables) => void;
  onMidiTargetChange?: (targetVariable: BachVariableName | 'theme' | null) => void;
  selectedMode?: Mode | null;
  selectedKeySignature?: KeySignature | null;
  // Enhanced rest functionality
  enhancedTheme?: EnhancedTheme;
  onEnhancedThemeChange?: (enhancedTheme: EnhancedTheme) => void;
  // Rhythm functionality
  themeRhythm?: NoteValue[];
  onThemeRhythmChange?: (rhythm: NoteValue[]) => void;
  bachVariableRhythms?: Record<BachVariableName, NoteValue[]>;
  onBachVariableRhythmChange?: (variableName: BachVariableName, rhythm: NoteValue[]) => void;
}

export function ThemeComposer({ 
  theme, 
  onThemeChange, 
  bachVariables, 
  onBachVariablesChange,
  onMidiTargetChange,
  selectedMode,
  selectedKeySignature,
  enhancedTheme,
  onEnhancedThemeChange,
  themeRhythm: externalThemeRhythm,
  onThemeRhythmChange,
  bachVariableRhythms,
  onBachVariableRhythmChange
}: ThemeComposerProps) {
  const [selectedPitch, setSelectedPitch] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'traditional' | 'bach'>('traditional');
  const [selectedRestDuration, setSelectedRestDuration] = useState<RestDuration>('quarter-rest');
  const [autoRestProbability, setAutoRestProbability] = useState(20); // 20% chance of auto-adding rests
  const [enableAutoRests, setEnableAutoRests] = useState(false);
  const [selectedBachVariable, setSelectedBachVariable] = useState<BachVariableName | null>(null);
  
  // Enhanced rest duration tracking
  const [restDurations, setRestDurations] = useState<Map<number, RestDuration>>(
    enhancedTheme?.restDurations || new Map()
  );

  // Rhythm pattern tracking - use external rhythm if provided, otherwise internal state
  const [internalThemeRhythm, setInternalThemeRhythm] = useState<NoteValue[]>(
    externalThemeRhythm || Array(theme.length).fill('quarter' as NoteValue)
  );
  
  // Use external rhythm if provided, otherwise use internal state
  const themeRhythm = externalThemeRhythm || internalThemeRhythm;

  // Sync rhythm length with theme length
  useEffect(() => {
    if (themeRhythm.length !== theme.length) {
      const newRhythm = [...themeRhythm];
      // Extend with quarter notes if theme is longer
      while (newRhythm.length < theme.length) {
        newRhythm.push('quarter');
      }
      // Trim if theme is shorter
      if (newRhythm.length > theme.length) {
        newRhythm.length = theme.length;
      }
      
      // Update rhythm through callback or internal state
      if (onThemeRhythmChange) {
        onThemeRhythmChange(newRhythm);
      } else {
        setInternalThemeRhythm(newRhythm);
      }
    }
  }, [theme.length, themeRhythm, onThemeRhythmChange]);

  const addNote = () => {
    const newNote = pitchClassToMidiNote(selectedPitch);
    let updatedTheme = [...theme, newNote];
    
    // Auto-add rests based on probability
    if (enableAutoRests && Math.random() * 100 < autoRestProbability) {
      updatedTheme.push(-1 as RestValue); // Add rest after note
      toast.info(`Added note with auto-rest (${autoRestProbability}% chance)`);
    }
    
    onThemeChange(updatedTheme);
  };

  const addRest = () => {
    try {
      const newTheme = [...theme, -1 as RestValue];
      const newRestIndex = newTheme.length - 1;
      const newRestDurations = new Map(restDurations);
      newRestDurations.set(newRestIndex, selectedRestDuration);
      
      // Update both basic theme and enhanced theme
      onThemeChange(newTheme);
      setRestDurations(newRestDurations);
      
      // Update enhanced theme if callback provided
      if (onEnhancedThemeChange) {
        onEnhancedThemeChange({
          melody: newTheme,
          restDurations: newRestDurations
        });
      }
      
      const restBeats = getRestValueBeats(selectedRestDuration);
      toast.success(`Added ${selectedRestDuration} (${restBeats} beats) to theme`);
      console.log(`🎵 Added rest: ${selectedRestDuration} at index ${newRestIndex}, duration: ${restBeats} beats`);
    } catch (error) {
      console.error('Error adding rest:', error);
      toast.error('Failed to add rest');
    }
  };

  const removeNote = (index: number) => {
    try {
      const newTheme = theme.filter((_, i) => i !== index);
      const element = theme[index];
      const elementName = isRest(element) ? 'rest' : midiNoteToNoteName(element);
      
      // Update rest durations - shift indices down for elements after the removed one
      const newRestDurations = new Map<number, RestDuration>();
      restDurations.forEach((duration, restIndex) => {
        if (restIndex < index) {
          // Keep rest durations before the removed element
          newRestDurations.set(restIndex, duration);
        } else if (restIndex > index) {
          // Shift rest durations after the removed element down by 1
          newRestDurations.set(restIndex - 1, duration);
        }
        // Skip the rest duration at the removed index
      });
      
      onThemeChange(newTheme);
      setRestDurations(newRestDurations);
      
      // Update enhanced theme if callback provided
      if (onEnhancedThemeChange) {
        onEnhancedThemeChange({
          melody: newTheme,
          restDurations: newRestDurations
        });
      }
      
      toast.success(`Removed ${elementName} from theme`);
      console.log(`🎵 Removed element at index ${index}, updated rest duration mappings`);
    } catch (error) {
      console.error('Error removing element:', error);
      toast.error('Failed to remove element');
    }
  };

  const generateRandomTheme = () => {
    const length = Math.floor(Math.random() * 6) + 5; // 5-10 notes
    const baseOctave = 4; // Middle octave
    const baseKey = Math.floor(Math.random() * 12);
    const scale = [0, 2, 4, 5, 7, 9, 11]; // Major scale intervals
    
    const newTheme: Theme = [];
    for (let i = 0; i < length; i++) {
      const scaleIndex = Math.floor(Math.random() * scale.length);
      const pitchClass = (baseKey + scale[scaleIndex]) % 12;
      const octaveVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1 octave variation
      const octave = Math.max(2, Math.min(6, baseOctave + octaveVariation)); // Keep in reasonable range
      const midiNote = pitchClassAndOctaveToMidiNote(pitchClass, octave);
      newTheme.push(midiNote);
    }
    
    onThemeChange(newTheme);
  };

  const presetThemes = [
    { name: 'Simple Scale', theme: [60, 62, 64, 65, 67, 65, 64, 62, 60] }, // C4 to C4
    { name: 'Bach-like', theme: [60, 67, 65, 68, 67, 65, 64, 62, 60] }, // More complex
    { name: 'Stepwise', theme: [60, 62, 64, 65, 67, 69, 71, 72] }, // C4 to C5
    { name: 'Triad Base', theme: [60, 64, 67] }, // C major triad for arpeggiation
  ];

  const handleUseAsTheme = (melody: Theme, variableName: string) => {
    try {
      onThemeChange(melody);
      toast.success(`${variableName} applied as main theme`);
    } catch (err) {
      console.error('Error applying Bach variable as theme:', err);
      toast.error('Failed to apply as theme');
    }
  };

  // Handle adding notes to targets (theme or Bach variables)
  const handleAddToTarget = (notes: MidiNote[], target: BachVariableName | 'theme') => {
    try {
      if (target === 'theme') {
        onThemeChange([...theme, ...notes]);
      } else if (bachVariables && onBachVariablesChange) {
        const newVariables = {
          ...bachVariables,
          [target]: [...bachVariables[target], ...notes]
        };
        onBachVariablesChange(newVariables);
      }
    } catch (err) {
      console.error('Error adding notes to target:', err);
      toast.error('Failed to add notes');
    }
  };

  // Handle MIDI target changes - directly call parent, no local state
  const handleMidiTargetChange = (target: BachVariableName | 'theme' | null) => {
    console.log('🎯 ThemeComposer: MIDI target changing to:', target);
    onMidiTargetChange?.(target);
  };

  // Notify parent when switching tabs and set appropriate MIDI target
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'traditional' | 'bach');
    if (value === 'traditional') {
      console.log('🎯 ThemeComposer: Switching to traditional tab, setting MIDI target to theme');
      handleMidiTargetChange('theme');
    } else if (value === 'bach') {
      // When switching to Bach Variables, set target to the first Bach variable (cantusFirmus)
      console.log('🎯 ThemeComposer: Switching to Bach Variables tab, setting MIDI target to cantusFirmus');
      handleMidiTargetChange('cantusFirmus');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2>Theme Composer</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateRandomTheme}
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Random
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onThemeChange([]);
                setRestDurations(new Map());
                if (onEnhancedThemeChange) {
                  onEnhancedThemeChange({
                    melody: [],
                    restDurations: new Map()
                  });
                }
                toast.success('Theme and rest durations cleared');
              }}
              disabled={theme.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="traditional" className="gap-2">
              <Music2 className="w-4 h-4" />
              Traditional
            </TabsTrigger>
            <TabsTrigger value="bach" className="gap-2">
              <Music className="w-4 h-4" />
              Bach Variables
            </TabsTrigger>
          </TabsList>

          <TabsContent value="traditional" className="mt-4">
            <div className="space-y-4">
              {/* Mode Scale Builder */}
              <ModeScaleBuilder
                selectedMode={selectedMode}
                selectedKeySignature={selectedKeySignature}
                midiTarget={'theme'}
                onAddToTarget={handleAddToTarget}
              />

              <div>
                <h3 className="mb-2">Preset Themes</h3>
                <div className="flex flex-wrap gap-2">
                  {presetThemes.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => onThemeChange(preset.theme)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Arpeggio Pattern Generator - NEW */}
              <ArpeggioPatternSelector
                sourceTheme={theme}
                onApplyToTheme={onThemeChange}
                mode="theme"
              />

              <div className="space-y-3">
                <div>
                  <h4 className="mb-2 text-sm font-medium">Quick Add Notes (Octave 4)</h4>
                  <div className="grid grid-cols-6 gap-1">
                    {PITCH_NAMES.map((name, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => onThemeChange([...theme, pitchClassToMidiNote(index)])}
                        className="text-xs h-8"
                      >
                        {name}4
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select
                    value={selectedPitch.toString()}
                    onValueChange={(value) => setSelectedPitch(parseInt(value))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select pitch" />
                    </SelectTrigger>
                    <SelectContent>
                      {PITCH_NAMES.map((name, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {name}4
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addNote} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Rhythm Controls - ENHANCED */}
                <RhythmControlsEnhanced
                  theme={theme}
                  currentRhythm={themeRhythm}
                  onRhythmApplied={(rhythm) => {
                    try {
                      // Update rhythm through callback or internal state
                      if (onThemeRhythmChange) {
                        onThemeRhythmChange(rhythm);
                      } else {
                        setInternalThemeRhythm(rhythm);
                      }
                      toast.success('Rhythm pattern applied to theme');
                    } catch (error) {
                      console.error('Error applying rhythm:', error);
                      toast.error('Failed to apply rhythm pattern');
                    }
                  }}
                />

                {/* Rest Controls */}
                <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Pause className="w-4 h-4" />
                    <h4 className="font-medium text-sm">Rest Controls</h4>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select
                      value={selectedRestDuration}
                      onValueChange={(value) => setSelectedRestDuration(value as RestDuration)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select rest duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whole-rest">Whole Rest (4 beats)</SelectItem>
                        <SelectItem value="dotted-half-rest">Dotted Half Rest (3 beats)</SelectItem>
                        <SelectItem value="half-rest">Half Rest (2 beats)</SelectItem>
                        <SelectItem value="dotted-quarter-rest">Dotted Quarter Rest (1.5 beats)</SelectItem>
                        <SelectItem value="quarter-rest">Quarter Rest (1 beat)</SelectItem>
                        <SelectItem value="eighth-rest">Eighth Rest (0.5 beats)</SelectItem>
                        <SelectItem value="sixteenth-rest">Sixteenth Rest (0.25 beats)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addRest} size="sm" variant="outline">
                      <Pause className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="auto-rests"
                        checked={enableAutoRests}
                        onChange={(e) => setEnableAutoRests(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="auto-rests" className="text-xs">
                        Auto-add rests ({autoRestProbability}% chance)
                      </Label>
                    </div>
                    
                    {enableAutoRests && (
                      <div className="flex items-center gap-2">
                        <Sliders className="w-3 h-3" />
                        <input
                          type="range"
                          min="5"
                          max="50"
                          value={autoRestProbability}
                          onChange={(e) => setAutoRestProbability(parseInt(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-muted-foreground w-8">{autoRestProbability}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3>Current Theme ({theme.length} elements)</h3>
                  
                  {/* NEW: Add Theme to Bach Variable Button */}
                  {bachVariables && onBachVariablesChange && theme.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedBachVariable || undefined}
                        onValueChange={(value) => setSelectedBachVariable(value as BachVariableName)}
                      >
                        <SelectTrigger className="h-8 text-xs w-[140px]">
                          <SelectValue placeholder="Select variable..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(bachVariables).map((name) => (
                            <SelectItem key={name} value={name}>
                              {getBachVariableShortLabel(name as BachVariableName)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!selectedBachVariable) {
                            toast.error('Please select a Bach variable first');
                            return;
                          }
                          try {
                            const newVariables = {
                              ...bachVariables,
                              [selectedBachVariable]: [...bachVariables[selectedBachVariable], ...theme]
                            };
                            onBachVariablesChange(newVariables);
                            toast.success(`Added ${theme.length} notes to ${getBachVariableShortLabel(selectedBachVariable)}`);
                          } catch (err) {
                            console.error('Error adding theme to Bach variable:', err);
                            toast.error('Failed to add theme to Bach variable');
                          }
                        }}
                        disabled={!selectedBachVariable}
                        className="gap-1 h-8 text-xs"
                      >
                        <Plus className="w-3 h-3" />
                        Add to BV
                      </Button>
                    </div>
                  )}
                </div>
                
                {theme.length === 0 ? (
                  <div className="text-muted-foreground text-sm p-4 border border-dashed rounded-lg">
                    No elements in theme. Add notes or rests above.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {theme.map((element, index) => (
                        <Badge
                          key={index}
                          variant={isRest(element) ? "outline" : "secondary"}
                          className={`flex items-center gap-1 px-3 py-1 ${
                            isRest(element) 
                              ? "border-orange-300 text-orange-700 bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:bg-orange-950/20" 
                              : ""
                          }`}
                        >
                          {isRest(element) ? (
                            <span className="flex items-center gap-1">
                              <Pause className="w-3 h-3" />
                              {restDurations.has(index) ? (
                                <span>
                                  {restDurations.get(index)!.replace('-rest', '')} rest 
                                  <span className="text-xs opacity-75 ml-1">
                                    ({getRestValueBeats(restDurations.get(index)!)}♩)
                                  </span>
                                </span>
                              ) : (
                                'Rest (1♩)'
                              )}
                            </span>
                          ) : (
                            melodyElementToString(element)
                          )}
                          <button
                            onClick={() => removeNote(index)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Theme Analysis */}
                    <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                      Analysis: {theme.filter(isNote).length} notes, {theme.filter(isRest).length} rests
                      {theme.filter(isRest).length > 0 && (
                        <span className="text-orange-600 dark:text-orange-400 ml-2">
                          ♪ Enhanced with rhythmic rests
                        </span>
                      )}
                      {restDurations.size > 0 && (
                        <div className="mt-1">
                          Total rest duration: {
                            Array.from(restDurations.values())
                              .reduce((total, duration) => total + getRestValueBeats(duration), 0)
                          } beats
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* ADDITIVE: Visual Theme Representation with Rest Symbols */}
                {theme.length > 0 && (
                  <MelodyVisualizer
                    melody={theme}
                    title="Theme Visualization (with Rests)"
                    color="hsl(var(--primary))"
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bach" className="mt-4">
            {bachVariables && onBachVariablesChange ? (
              <BachVariablesComponent
                variables={bachVariables}
                onVariablesChange={onBachVariablesChange}
                onUseAsTheme={handleUseAsTheme}
                onMidiTargetChange={handleMidiTargetChange}
                selectedMode={selectedMode}
                selectedKeySignature={selectedKeySignature}
                variableRhythms={bachVariableRhythms}
                onVariableRhythmChange={onBachVariableRhythmChange}
                currentTheme={theme}
              />
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Bach Variables not available</p>
                <p className="text-xs">Enable in App.tsx to use Bach-like composition variables</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}