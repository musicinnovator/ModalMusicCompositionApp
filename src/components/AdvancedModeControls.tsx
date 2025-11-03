import React, { useState, useCallback, useMemo } from 'react';
import { Mode, ModeCategory, PitchClass, PITCH_NAMES, Theme, BachLikeVariables, BachVariableName, MidiNote, pitchClassToMidiNote } from '../types/musical';
import { MusicalEngine } from '../lib/musical-engine';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { 
  Palette, 
  Shuffle, 
  Layers, 
  Sliders, 
  Sparkles, 
  GitMerge,
  Wand2,
  Target,
  Music2,
  Filter,
  Save,
  Download,
  Upload,
  Play,
  Eye
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AdvancedModeControlsProps {
  modeCategories: ModeCategory[];
  selectedMode: Mode | null;
  onModeSelect: (mode: Mode) => void;
  selectedKeySignature: { key: PitchClass } | null;
  onThemeGenerated?: (theme: Theme, modeName: string) => void;
  onBachVariableGenerated?: (variableName: BachVariableName, theme: Theme, modeName: string) => void;
  currentTheme?: Theme;
  bachVariables?: BachLikeVariables;
}

export function AdvancedModeControls({ 
  modeCategories, 
  selectedMode, 
  onModeSelect, 
  selectedKeySignature,
  onThemeGenerated,
  onBachVariableGenerated,
  currentTheme,
  bachVariables
}: AdvancedModeControlsProps) {
  // State for mode mixing
  const [selectedModesForMixing, setSelectedModesForMixing] = useState<Mode[]>([]);
  const [mixingStrategy, setMixingStrategy] = useState<'blend' | 'alternate' | 'weighted' | 'chromatic_fusion'>('blend');
  const [modeWeights, setModeWeights] = useState<number[]>([]);
  
  // State for mode filtering
  const [filterCriteria, setFilterCriteria] = useState({
    pentatonic: false,
    heptatonic: false,
    chromatic: false,
    minorSecond: false,
    majorSecond: false,
    augmentedInterval: false
  });
  
  // State for mode alterations
  const [alterations, setAlterations] = useState({
    raiseSecond: false,
    lowerSecond: false,
    raiseThird: false,
    lowerThird: false,
    raiseFourth: false,
    lowerFourth: false,
    raiseFifth: false,
    lowerFifth: false,
    raiseSixth: false,
    lowerSixth: false,
    raiseSeventh: false,
    lowerSeventh: false
  });

  // State for related mode search
  const [relationshipType, setRelationshipType] = useState<'parallel' | 'relative' | 'similar_intervals' | 'contrasting'>('similar_intervals');

  // State for saved custom modes
  const [savedCustomModes, setSavedCustomModes] = useState<Mode[]>([]);
  const [customModeName, setCustomModeName] = useState('');

  // State for theme generation from mixed mode
  const [themeLength, setThemeLength] = useState(8);
  const [targetDestination, setTargetDestination] = useState<'theme' | BachVariableName>('theme');

  // Last created mode for preview/generation
  const [lastCreatedMode, setLastCreatedMode] = useState<Mode | null>(null);

  // Get all modes flattened
  const allModes = useMemo(() => {
    try {
      return modeCategories.flatMap(category => category.modes);
    } catch (error) {
      console.error('Error flattening modes:', error);
      return [];
    }
  }, [modeCategories]);

  // Get filtered modes based on criteria
  const filteredModes = useMemo(() => {
    try {
      if (!Object.values(filterCriteria).some(Boolean)) {
        return allModes;
      }

      return allModes.filter(mode => {
        const pattern = mode.stepPattern;
        const patternLength = pattern.length;
        
        // Check pattern length criteria
        if (filterCriteria.pentatonic && patternLength !== 5) return false;
        if (filterCriteria.heptatonic && patternLength !== 7) return false;
        if (filterCriteria.chromatic && patternLength < 8) return false;
        
        // Check interval criteria
        if (filterCriteria.minorSecond && !pattern.includes(1)) return false;
        if (filterCriteria.majorSecond && !pattern.includes(2)) return false;
        if (filterCriteria.augmentedInterval && !pattern.some(interval => interval >= 3)) return false;
        
        return true;
      });
    } catch (error) {
      console.error('Error filtering modes:', error);
      return allModes;
    }
  }, [allModes, filterCriteria]);

  // Get related modes
  const relatedModes = useMemo(() => {
    try {
      if (!selectedMode) return [];
      return MusicalEngine.getRelatedModes(selectedMode, allModes, relationshipType);
    } catch (error) {
      console.error('Error getting related modes:', error);
      return [];
    }
  }, [selectedMode, allModes, relationshipType]);

  // Handle mode selection for mixing
  const handleModeSelectionForMixing = useCallback((mode: Mode, isSelected: boolean) => {
    try {
      if (isSelected) {
        if (selectedModesForMixing.length >= 6) {
          toast.warning('Maximum 6 modes can be mixed at once');
          return;
        }
        setSelectedModesForMixing(prev => [...prev, mode]);
        setModeWeights(prev => [...prev, 1]);
      } else {
        const index = selectedModesForMixing.findIndex(m => m.index === mode.index);
        if (index >= 0) {
          setSelectedModesForMixing(prev => prev.filter((_, i) => i !== index));
          setModeWeights(prev => prev.filter((_, i) => i !== index));
        }
      }
    } catch (error) {
      console.error('Error handling mode selection for mixing:', error);
      toast.error('Failed to update mode selection');
    }
  }, [selectedModesForMixing]);

  // Handle weight changes
  const handleWeightChange = useCallback((index: number, newWeight: number) => {
    try {
      setModeWeights(prev => {
        const newWeights = [...prev];
        newWeights[index] = newWeight;
        return newWeights;
      });
    } catch (error) {
      console.error('Error updating weight:', error);
    }
  }, []);

  // Create hybrid mode
  const handleCreateHybridMode = useCallback(() => {
    try {
      if (selectedModesForMixing.length < 2) {
        toast.warning('Select at least 2 modes to create a hybrid');
        return;
      }

      const final = selectedKeySignature?.key ?? 0;
      const weights = mixingStrategy === 'weighted' ? modeWeights : undefined;
      
      const hybridMode = MusicalEngine.createHybridMode(
        selectedModesForMixing,
        final,
        mixingStrategy,
        weights
      );

      // Set as current mode and store for preview
      onModeSelect(hybridMode);
      setLastCreatedMode(hybridMode);
      
      toast.success(`Created hybrid mode: ${hybridMode.name}`, {
        description: 'Use "Generate Theme" to create a melody with this mode'
      });
      
      // Don't clear selections - let user generate themes first
    } catch (error) {
      console.error('Error creating hybrid mode:', error);
      toast.error('Failed to create hybrid mode');
    }
  }, [selectedModesForMixing, mixingStrategy, modeWeights, selectedKeySignature, onModeSelect]);

  // Generate theme from current/hybrid mode
  const handleGenerateThemeFromMode = useCallback(() => {
    try {
      const modeToUse = lastCreatedMode || selectedMode;
      
      if (!modeToUse) {
        toast.warning('Create or select a mode first');
        return;
      }

      // Build scale from mode
      const scale = MusicalEngine.buildScaleFromMode(modeToUse);
      
      if (scale.length === 0) {
        toast.error('Failed to generate scale from mode');
        return;
      }

      // Generate melodic theme using the scale
      const pitchClassTheme: PitchClass[] = [];
      for (let i = 0; i < themeLength; i++) {
        // Use modal composition logic - prefer steps, sometimes leaps
        const useLeap = Math.random() < 0.3;
        
        if (i === 0) {
          // Start on the final (tonic)
          pitchClassTheme.push(modeToUse.final);
        } else {
          const lastPitch = pitchClassTheme[i - 1];
          const lastIndex = scale.indexOf(lastPitch);
          
          if (lastIndex === -1) {
            // Fallback if pitch not in scale
            pitchClassTheme.push(scale[Math.floor(Math.random() * scale.length)]);
          } else {
            if (useLeap) {
              // Leap (3rd or 4th)
              const leapSize = Math.random() < 0.5 ? 2 : 3;
              const direction = Math.random() < 0.5 ? 1 : -1;
              const newIndex = (lastIndex + (leapSize * direction) + scale.length) % scale.length;
              pitchClassTheme.push(scale[newIndex]);
            } else {
              // Step (2nd)
              const direction = Math.random() < 0.5 ? 1 : -1;
              const newIndex = (lastIndex + direction + scale.length) % scale.length;
              pitchClassTheme.push(scale[newIndex]);
            }
          }
        }
      }

      // Ensure ending on final or dominant
      const final = modeToUse.final;
      const dominant = scale[4 % scale.length]; // 5th degree
      pitchClassTheme[pitchClassTheme.length - 1] = Math.random() < 0.7 ? final : dominant;

      // Convert to MIDI notes in octave 4
      const theme: Theme = pitchClassTheme.map(pc => pitchClassToMidiNote(pc));

      // Send to appropriate destination
      if (targetDestination === 'theme') {
        if (onThemeGenerated) {
          onThemeGenerated(theme, modeToUse.name);
          toast.success(`Generated theme using ${modeToUse.name}`, {
            description: `${themeLength} notes • View in visualizer below`
          });
        }
      } else {
        if (onBachVariableGenerated) {
          onBachVariableGenerated(targetDestination, theme, modeToUse.name);
          toast.success(`Generated ${targetDestination} using ${modeToUse.name}`, {
            description: `${themeLength} notes • View in Bach Variables visualizer`
          });
        }
      }
    } catch (error) {
      console.error('Error generating theme from mode:', error);
      toast.error('Failed to generate theme');
    }
  }, [lastCreatedMode, selectedMode, themeLength, targetDestination, onThemeGenerated, onBachVariableGenerated]);

  // Save custom mode
  const handleSaveCustomMode = useCallback(() => {
    try {
      const modeToSave = lastCreatedMode || selectedMode;
      
      if (!modeToSave) {
        toast.warning('Create or select a mode to save');
        return;
      }

      if (!customModeName.trim()) {
        toast.warning('Enter a name for your custom mode');
        return;
      }

      // Check for duplicate names
      if (savedCustomModes.some(m => m.name === customModeName.trim())) {
        toast.warning('A mode with this name already exists');
        return;
      }

      // Create a copy with custom name
      const savedMode: Mode = {
        ...modeToSave,
        name: customModeName.trim(),
        index: savedCustomModes.length + 1000 // High index to avoid conflicts
      };

      setSavedCustomModes(prev => [...prev, savedMode]);
      toast.success(`Saved custom mode: ${customModeName}`, {
        description: 'Available in Custom Modes section'
      });
      
      setCustomModeName('');
    } catch (error) {
      console.error('Error saving custom mode:', error);
      toast.error('Failed to save custom mode');
    }
  }, [lastCreatedMode, selectedMode, customModeName, savedCustomModes]);

  // Clear mode mixing selections
  const handleClearMixingSelections = useCallback(() => {
    setSelectedModesForMixing([]);
    setModeWeights([]);
    setLastCreatedMode(null);
    toast.info('Cleared mode mixing selections');
  }, []);

  // Apply alterations to current mode
  const handleApplyAlterations = useCallback(() => {
    try {
      if (!selectedMode) {
        toast.warning('Select a mode first');
        return;
      }

      const hasAlterations = Object.values(alterations).some(Boolean);
      if (!hasAlterations) {
        toast.warning('Select at least one alteration');
        return;
      }

      const final = selectedKeySignature?.key ?? 0;
      const alteredMode = MusicalEngine.generateModeVariants(selectedMode, final, alterations);
      
      // Set as current mode and store for generation
      onModeSelect(alteredMode);
      setLastCreatedMode(alteredMode);
      
      // Count alterations
      const alterationCount = Object.values(alterations).filter(Boolean).length;
      
      toast.success(`Applied ${alterationCount} alteration${alterationCount > 1 ? 's' : ''} to ${selectedMode.name}`, {
        description: 'Use "Generate Theme" to create a melody with this altered mode'
      });
      
      // Don't reset alterations - let user see what was applied and generate themes
    } catch (error) {
      console.error('Error applying alterations:', error);
      toast.error('Failed to apply alterations');
    }
  }, [selectedMode, alterations, selectedKeySignature, onModeSelect]);

  // Reset alterations
  const handleResetAlterations = useCallback(() => {
    setAlterations({
      raiseSecond: false,
      lowerSecond: false,
      raiseThird: false,
      lowerThird: false,
      raiseFourth: false,
      lowerFourth: false,
      raiseFifth: false,
      lowerFifth: false,
      raiseSixth: false,
      lowerSixth: false,
      raiseSeventh: false,
      lowerSeventh: false
    });
    setLastCreatedMode(null);
    toast.info('Reset alterations');
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilterCriteria({
      pentatonic: false,
      heptatonic: false,
      chromatic: false,
      minorSecond: false,
      majorSecond: false,
      augmentedInterval: false
    });
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Advanced Modal Theory</h3>
        <Badge variant="outline" className="ml-auto">
          {allModes.length} Global Modes
        </Badge>
      </div>

      <Tabs defaultValue="explorer" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
          <TabsTrigger value="explorer" className="gap-1 overflow-hidden">
            <Music2 className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Explorer</span>
          </TabsTrigger>
          <TabsTrigger value="mixer" className="gap-1 overflow-hidden">
            <GitMerge className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Mode Mixer</span>
          </TabsTrigger>
          <TabsTrigger value="alterations" className="gap-1 overflow-hidden">
            <Sliders className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Alterations</span>
          </TabsTrigger>
          <TabsTrigger value="relationships" className="gap-1 overflow-hidden">
            <Target className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Relationships</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explorer" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <Label className="font-medium">Filter Modes</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="ml-auto"
              >
                Clear All
              </Button>
            </div>
            
            {/* ENHANCED with Option C: Flexible grid with wrapped labels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2 min-w-0">
                <Checkbox
                  id="pentatonic"
                  checked={filterCriteria.pentatonic}
                  onCheckedChange={(checked) => 
                    setFilterCriteria(prev => ({ ...prev, pentatonic: !!checked }))
                  }
                  className="flex-shrink-0"
                />
                <Label htmlFor="pentatonic" className="text-sm break-words">Pentatonic (5 notes)</Label>
              </div>
              
              <div className="flex items-center space-x-2 min-w-0">
                <Checkbox
                  id="heptatonic"
                  checked={filterCriteria.heptatonic}
                  onCheckedChange={(checked) => 
                    setFilterCriteria(prev => ({ ...prev, heptatonic: !!checked }))
                  }
                  className="flex-shrink-0"
                />
                <Label htmlFor="heptatonic" className="text-sm break-words">Heptatonic (7 notes)</Label>
              </div>
              
              <div className="flex items-center space-x-2 min-w-0">
                <Checkbox
                  id="chromatic"
                  checked={filterCriteria.chromatic}
                  onCheckedChange={(checked) => 
                    setFilterCriteria(prev => ({ ...prev, chromatic: !!checked }))
                  }
                  className="flex-shrink-0"
                />
                <Label htmlFor="chromatic" className="text-sm break-words">Chromatic (8+ notes)</Label>
              </div>
              
              <div className="flex items-center space-x-2 min-w-0">
                <Checkbox
                  id="minorSecond"
                  checked={filterCriteria.minorSecond}
                  onCheckedChange={(checked) => 
                    setFilterCriteria(prev => ({ ...prev, minorSecond: !!checked }))
                  }
                  className="flex-shrink-0"
                />
                <Label htmlFor="minorSecond" className="text-sm break-words">Minor 2nds</Label>
              </div>
              
              <div className="flex items-center space-x-2 min-w-0">
                <Checkbox
                  id="majorSecond"
                  checked={filterCriteria.majorSecond}
                  onCheckedChange={(checked) => 
                    setFilterCriteria(prev => ({ ...prev, majorSecond: !!checked }))
                  }
                  className="flex-shrink-0"
                />
                <Label htmlFor="majorSecond" className="text-sm break-words">Major 2nds</Label>
              </div>
              
              <div className="flex items-center space-x-2 min-w-0">
                <Checkbox
                  id="augmentedInterval"
                  checked={filterCriteria.augmentedInterval}
                  onCheckedChange={(checked) => 
                    setFilterCriteria(prev => ({ ...prev, augmentedInterval: !!checked }))
                  }
                  className="flex-shrink-0"
                />
                <Label htmlFor="augmentedInterval" className="text-sm break-words">Wide Intervals</Label>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <Label className="font-medium">
                  Filtered Results ({filteredModes.length} modes)
                </Label>
              </div>
              
              <ScrollArea className="h-64 border rounded p-2">
                <div className="space-y-2">
                  {filteredModes.map((mode) => (
                    <div
                      key={`${mode.name}-${mode.index}`}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        selectedMode?.index === mode.index
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => onModeSelect(mode)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{mode.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {mode.stepPattern.length} notes
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Pattern: {mode.stepPattern.join('-')}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mixer" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GitMerge className="w-4 h-4" />
              <Label className="font-medium">Mode Fusion Laboratory</Label>
              {lastCreatedMode && (
                <Badge variant="default" className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500">
                  Active: {lastCreatedMode.name}
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Select Modes to Mix (up to 6):</Label>
                {selectedModesForMixing.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearMixingSelections}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              <ScrollArea className="h-48 border rounded p-2 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
                <div className="space-y-2">
                  {allModes.map((mode) => {
                    const isSelected = selectedModesForMixing.some(m => m.index === mode.index);
                    return (
                      <div
                        key={`mixer-${mode.name}-${mode.index}`}
                        className={`flex items-center space-x-2 p-2 rounded transition-colors ${
                          isSelected ? 'bg-purple-100 dark:bg-purple-900/30' : 'hover:bg-muted/50'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            handleModeSelectionForMixing(mode, !!checked)
                          }
                          disabled={!isSelected && selectedModesForMixing.length >= 6}
                        />
                        <span className="text-sm flex-1">{mode.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {mode.stepPattern.join('-')}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {selectedModesForMixing.length > 0 && (
              <div className="space-y-3 p-3 border border-purple-200 dark:border-purple-800 rounded bg-purple-50/30 dark:bg-purple-950/10">
                <Label className="text-sm font-medium">Selected Modes ({selectedModesForMixing.length}):</Label>
                <div className="space-y-2">
                  {selectedModesForMixing.map((mode, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded bg-background">
                      <Music2 className="w-3 h-3 text-purple-600" />
                      <span className="text-sm flex-1">{mode.name}</span>
                      {mixingStrategy === 'weighted' && (
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Weight:</Label>
                          <Slider
                            value={[modeWeights[index] || 1]}
                            onValueChange={([value]) => handleWeightChange(index, value)}
                            min={0.1}
                            max={3}
                            step={0.1}
                            className="w-20"
                          />
                          <span className="text-xs w-8">{(modeWeights[index] || 1).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-sm">Mixing Strategy:</Label>
              <Select value={mixingStrategy} onValueChange={(value: any) => setMixingStrategy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blend">🎨 Blend (Average intervals)</SelectItem>
                  <SelectItem value="alternate">🔄 Alternate (Rotate between modes)</SelectItem>
                  <SelectItem value="weighted">⚖️ Weighted (Custom weights)</SelectItem>
                  <SelectItem value="chromatic_fusion">✨ Chromatic Fusion (Combine all pitches)</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">
                {mixingStrategy === 'blend' && 'Averages interval patterns from selected modes'}
                {mixingStrategy === 'alternate' && 'Rotates between modes for each scale degree'}
                {mixingStrategy === 'weighted' && 'Uses custom weights to favor certain modes'}
                {mixingStrategy === 'chromatic_fusion' && 'Combines all unique pitches from selected modes'}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleCreateHybridMode}
                disabled={selectedModesForMixing.length < 2}
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Wand2 className="w-4 h-4" />
                Create Hybrid
              </Button>
              
              <Button
                onClick={handleGenerateThemeFromMode}
                disabled={!lastCreatedMode && !selectedMode}
                variant="outline"
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Generate Theme
              </Button>
            </div>

            {(lastCreatedMode || selectedMode) && (
              <div className="space-y-3 p-3 border border-green-200 dark:border-green-800 rounded bg-green-50/30 dark:bg-green-950/10">
                <Label className="text-sm font-medium">Theme Generation Options:</Label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Theme Length:</Label>
                    <Select value={themeLength.toString()} onValueChange={(val) => setThemeLength(parseInt(val))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 notes</SelectItem>
                        <SelectItem value="6">6 notes</SelectItem>
                        <SelectItem value="8">8 notes</SelectItem>
                        <SelectItem value="12">12 notes</SelectItem>
                        <SelectItem value="16">16 notes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Destination:</Label>
                    <Select value={targetDestination} onValueChange={(val: any) => setTargetDestination(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="theme">Main Theme</SelectItem>
                        <SelectItem value="cantusFirmus">Cantus Firmus</SelectItem>
                        <SelectItem value="floridCounterpoint1">FCP1</SelectItem>
                        <SelectItem value="floridCounterpoint2">FCP2</SelectItem>
                        <SelectItem value="countersubject1">CS1</SelectItem>
                        <SelectItem value="countersubject2">CS2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <Eye className="w-3 h-3 inline mr-1" />
                  Theme will appear in the visualizer and can be played back
                </div>
              </div>
            )}

            {lastCreatedMode && (
              <div className="space-y-3 p-3 border border-blue-200 dark:border-blue-800 rounded bg-blue-50/30 dark:bg-blue-950/10">
                <Label className="text-sm font-medium">Save Custom Mode:</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter custom mode name..."
                    value={customModeName}
                    onChange={(e) => setCustomModeName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSaveCustomMode}
                    disabled={!customModeName.trim()}
                    variant="outline"
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Save this hybrid mode to reuse later
                </div>
              </div>
            )}

            {savedCustomModes.length > 0 && (
              <div className="space-y-3 p-3 border rounded">
                <Label className="text-sm font-medium">Saved Custom Modes ({savedCustomModes.length}):</Label>
                <ScrollArea className="max-h-32">
                  <div className="space-y-2">
                    {savedCustomModes.map((mode, index) => (
                      <div
                        key={`saved-${index}`}
                        className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          onModeSelect(mode);
                          setLastCreatedMode(mode);
                          toast.success(`Loaded custom mode: ${mode.name}`);
                        }}
                      >
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        <span className="text-sm flex-1">{mode.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {mode.stepPattern.join('-')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="alterations" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <Label className="font-medium">Mode Alterations</Label>
              {selectedMode && (
                <Badge variant="outline" className="ml-auto">
                  Base: {selectedMode.name}
                </Badge>
              )}
              {lastCreatedMode && lastCreatedMode !== selectedMode && (
                <Badge variant="default" className="bg-gradient-to-r from-orange-500 to-red-500">
                  Altered: {lastCreatedMode.name}
                </Badge>
              )}
            </div>

            {selectedMode ? (
              <div className="space-y-4">
                <div className="p-3 border border-orange-200 dark:border-orange-800 rounded bg-orange-50/30 dark:bg-orange-950/10">
                  <div className="text-sm font-medium mb-2">Original Mode Pattern:</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {selectedMode.stepPattern.join(' - ')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedMode.stepPattern.length} notes • Final: {PITCH_NAMES[selectedMode.final]}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Select Alterations:</Label>
                    {Object.values(alterations).some(Boolean) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetAlterations}
                        className="text-xs"
                      >
                        Reset All
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(alterations).map(([alteration, isSelected]) => {
                      const isRaise = alteration.startsWith('raise');
                      return (
                        <div 
                          key={alteration} 
                          className={`flex items-center space-x-2 p-2 rounded border transition-colors ${
                            isSelected 
                              ? isRaise 
                                ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' 
                                : 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                              : 'border-transparent'
                          }`}
                        >
                          <Checkbox
                            id={alteration}
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              setAlterations(prev => ({ ...prev, [alteration]: !!checked }))
                            }
                          />
                          <Label htmlFor={alteration} className="text-sm cursor-pointer">
                            {isRaise ? '↑' : '↓'} {alteration.replace(/([A-Z])/g, ' $1').replace('raise ', '').replace('lower ', '')}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {Object.values(alterations).some(Boolean) && (
                  <div className="p-3 border border-yellow-200 dark:border-yellow-800 rounded bg-yellow-50/30 dark:bg-yellow-950/10">
                    <div className="text-sm font-medium mb-1">
                      Active Alterations: {Object.values(alterations).filter(Boolean).length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Object.entries(alterations)
                        .filter(([_, val]) => val)
                        .map(([key]) => key.replace(/([A-Z])/g, ' $1'))
                        .join(', ')}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleApplyAlterations}
                    disabled={!Object.values(alterations).some(Boolean)}
                    className="gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    <Sparkles className="w-4 h-4" />
                    Apply Alterations
                  </Button>
                  
                  <Button
                    onClick={handleGenerateThemeFromMode}
                    disabled={!lastCreatedMode && !selectedMode}
                    variant="outline"
                    className="gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Generate Theme
                  </Button>
                </div>

                {(lastCreatedMode || selectedMode) && (
                  <div className="space-y-3 p-3 border border-green-200 dark:border-green-800 rounded bg-green-50/30 dark:bg-green-950/10">
                    <Label className="text-sm font-medium">Theme Generation Options:</Label>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Theme Length:</Label>
                        <Select value={themeLength.toString()} onValueChange={(val) => setThemeLength(parseInt(val))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4">4 notes</SelectItem>
                            <SelectItem value="6">6 notes</SelectItem>
                            <SelectItem value="8">8 notes</SelectItem>
                            <SelectItem value="12">12 notes</SelectItem>
                            <SelectItem value="16">16 notes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Destination:</Label>
                        <Select value={targetDestination} onValueChange={(val: any) => setTargetDestination(val)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="theme">Main Theme</SelectItem>
                            <SelectItem value="cantusFirmus">Cantus Firmus</SelectItem>
                            <SelectItem value="floridCounterpoint1">FCP1</SelectItem>
                            <SelectItem value="floridCounterpoint2">FCP2</SelectItem>
                            <SelectItem value="countersubject1">CS1</SelectItem>
                            <SelectItem value="countersubject2">CS2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <Eye className="w-3 h-3 inline mr-1" />
                      Theme will appear in the visualizer and can be played back
                    </div>
                  </div>
                )}

                {lastCreatedMode && lastCreatedMode !== selectedMode && (
                  <div className="space-y-3 p-3 border border-blue-200 dark:border-blue-800 rounded bg-blue-50/30 dark:bg-blue-950/10">
                    <Label className="text-sm font-medium">Save Altered Mode:</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter custom mode name..."
                        value={customModeName}
                        onChange={(e) => setCustomModeName(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSaveCustomMode}
                        disabled={!customModeName.trim()}
                        variant="outline"
                        className="gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Save this altered mode to reuse later
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sliders className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <div className="font-medium">No Mode Selected</div>
                <div className="text-sm mt-1">Select a mode from Mode Selector to apply alterations</div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <Label className="font-medium">Modal Relationships</Label>
              {selectedMode && (
                <Badge variant="outline" className="ml-auto">
                  Base: {selectedMode.name}
                </Badge>
              )}
            </div>

            {selectedMode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Relationship Type:</Label>
                  <Select value={relationshipType} onValueChange={(value: any) => setRelationshipType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="similar_intervals">Similar Intervals</SelectItem>
                      <SelectItem value="parallel">Parallel (Same pattern)</SelectItem>
                      <SelectItem value="relative">Relative (Shared pitches)</SelectItem>
                      <SelectItem value="contrasting">Contrasting (Different)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Related Modes ({relatedModes.length}):</Label>
                  <ScrollArea className="h-48 border rounded p-2">
                    <div className="space-y-2">
                      {relatedModes.map((mode) => (
                        <div
                          key={`related-${mode.name}-${mode.index}`}
                          className="p-2 border rounded cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => onModeSelect(mode)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{mode.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {mode.stepPattern.length} notes
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Pattern: {mode.stepPattern.join('-')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a mode first to explore relationships
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}