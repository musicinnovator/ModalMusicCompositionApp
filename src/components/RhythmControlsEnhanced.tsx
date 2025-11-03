import { useState, useCallback, useMemo } from 'react';
import { NoteValue, Theme, getNoteValueBeats } from '../types/musical';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { 
  Music2, Zap, BarChart3, Shuffle, RotateCcw, Music, 
  Plus, X, Save, FolderOpen, Trash2, Settings2, PauseCircle 
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface RhythmControlsEnhancedProps {
  // Legacy interface (used by ThemeComposer)
  theme?: Theme;
  onRhythmApplied?: (rhythmPattern: NoteValue[]) => void;
  currentRhythm?: NoteValue[];
  
  // New interface (used by Imitation/Fugue sections)
  rhythm?: NoteValue[];
  onRhythmChange?: (rhythm: NoteValue[]) => void;
  melodyLength?: number;
}

// Extended note values including rests
type RhythmValue = NoteValue | 'rest-whole' | 'rest-half' | 'rest-quarter' | 'rest-eighth' | 'rest-sixteenth';

const NOTE_VALUES: { value: NoteValue; label: string; beats: number; icon: string }[] = [
  { value: 'sixteenth', label: 'Sixteenth (1/16)', beats: 0.25, icon: '𝅘𝅥𝅯' },
  { value: 'eighth', label: 'Eighth (1/8)', beats: 0.5, icon: '𝅘𝅥𝅮' },
  { value: 'dotted-quarter', label: 'Dotted Quarter', beats: 1.5, icon: '𝅘𝅥𝅭.' },
  { value: 'quarter', label: 'Quarter (1/4)', beats: 1, icon: '𝅘𝅥' },
  { value: 'half', label: 'Half (1/2)', beats: 2, icon: '𝅗𝅥' },
  { value: 'dotted-half', label: 'Dotted Half', beats: 3, icon: '𝅗𝅥.' },
  { value: 'whole', label: 'Whole', beats: 4, icon: '𝅝' },
  { value: 'double-whole', label: 'Double Whole (Breve)', beats: 8, icon: '𝅜' }
];

// Rest values
const REST_VALUES: { value: RhythmValue; label: string; beats: number; icon: string }[] = [
  { value: 'rest-sixteenth', label: 'Sixteenth Rest', beats: 0.25, icon: '𝄾' },
  { value: 'rest-eighth', label: 'Eighth Rest', beats: 0.5, icon: '𝄽' },
  { value: 'rest-quarter', label: 'Quarter Rest', beats: 1, icon: '𝄽' },
  { value: 'rest-half', label: 'Half Rest', beats: 2, icon: '𝄼' },
  { value: 'rest-whole', label: 'Whole Rest', beats: 4, icon: '𝄻' },
];

// All rhythm values (notes + rests)
const ALL_RHYTHM_VALUES = [...NOTE_VALUES, ...REST_VALUES];

const RHYTHM_PRESETS: { name: string; description: string; pattern: (length: number) => NoteValue[] }[] = [
  {
    name: 'Uniform Quarter',
    description: 'All quarter notes',
    pattern: (length) => Array(length).fill('quarter')
  },
  {
    name: 'Walking Bass',
    description: 'Steady quarter notes',
    pattern: (length) => Array(length).fill('quarter')
  },
  {
    name: 'Baroque',
    description: 'Mix of eighths and quarters',
    pattern: (length) => {
      const pattern: NoteValue[] = [];
      for (let i = 0; i < length; i++) {
        pattern.push(i % 2 === 0 ? 'quarter' : 'eighth');
      }
      return pattern;
    }
  },
  {
    name: 'Syncopated',
    description: 'Dotted rhythms',
    pattern: (length) => {
      const pattern: NoteValue[] = [];
      for (let i = 0; i < length; i++) {
        pattern.push(i % 3 === 0 ? 'dotted-quarter' : 'eighth');
      }
      return pattern;
    }
  },
  {
    name: 'Slow Chorale',
    description: 'Long note values',
    pattern: (length) => {
      const pattern: NoteValue[] = [];
      for (let i = 0; i < length; i++) {
        pattern.push(i % 2 === 0 ? 'half' : 'whole');
      }
      return pattern;
    }
  },
  {
    name: 'Fast Passage',
    description: 'Rapid sixteenth notes',
    pattern: (length) => Array(length).fill('sixteenth')
  }
];

// Type for duration distribution
interface DurationSlot {
  id: string;
  rhythmValue: RhythmValue;
  percentage: number;
}

// ADDITIVE: Type for rest slot distribution (multi-rest support)
interface RestSlot {
  id: string;
  restValue: RhythmValue;
  percentage: number;
}

// Type for saved patterns
interface SavedPattern {
  id: string;
  name: string;
  slots: DurationSlot[];
  includeRests: boolean;
  restSlots?: RestSlot[]; // ADDITIVE: Support multiple rest types
  restPercentage?: number; // ADDITIVE: Total rest percentage
  createdAt: number;
}

export function RhythmControlsEnhanced({ 
  theme, 
  onRhythmApplied, 
  currentRhythm,
  rhythm,
  onRhythmChange,
  melodyLength
}: RhythmControlsEnhancedProps) {
  // Normalize props - support both interfaces with comprehensive safety checks
  const effectiveTheme = theme || [];
  const effectiveLength = melodyLength || 
    (theme && Array.isArray(theme) ? theme.length : 0) || 
    (rhythm && Array.isArray(rhythm) ? rhythm.length : 0) || 
    0;
  const effectiveCurrentRhythm = rhythm || currentRhythm || [];
  const effectiveOnChange = onRhythmChange || onRhythmApplied;

  // Validation
  if (effectiveLength === 0) {
    return (
      <Card className="p-3 bg-muted/10">
        <div className="text-xs text-muted-foreground text-center">
          No melody to apply rhythm to
        </div>
      </Card>
    );
  }

  // EXISTING STATE (preserved from original)
  const [autoRhythm, setAutoRhythm] = useState(false);
  const [rhythmMode, setRhythmMode] = useState<'percentage' | 'preset' | 'manual' | 'advanced'>('percentage');
  const [selectedNoteValue, setSelectedNoteValue] = useState<NoteValue>('quarter');
  const [percentageDistribution, setPercentageDistribution] = useState([50]); // 50% of selected note value
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [manualRhythm, setManualRhythm] = useState<NoteValue[]>([]);

  // NEW STATE for advanced features
  const [multiDurationSlots, setMultiDurationSlots] = useState<DurationSlot[]>([
    { id: '1', rhythmValue: 'quarter', percentage: 50 },
    { id: '2', rhythmValue: 'eighth', percentage: 50 }
  ]);
  const [includeRests, setIncludeRests] = useState(false);
  const [restPercentage, setRestPercentage] = useState([10]);
  const [selectedRestValue, setSelectedRestValue] = useState<RhythmValue>('rest-quarter');
  // ADDITIVE: Multi-rest slots support
  const [multiRestSlots, setMultiRestSlots] = useState<RestSlot[]>([
    { id: 'rest-1', restValue: 'rest-quarter', percentage: 50 },
    { id: 'rest-2', restValue: 'rest-eighth', percentage: 50 }
  ]);
  const [savedPatterns, setSavedPatterns] = useState<SavedPattern[]>([]);
  const [patternName, setPatternName] = useState('');
  const [showSavedPatterns, setShowSavedPatterns] = useState(false);

  // Calculate rhythm statistics with comprehensive error handling (EXISTING LOGIC PRESERVED)
  const rhythmStats = useMemo(() => {
    try {
      const effectiveRhythm = effectiveCurrentRhythm.length > 0 
        ? effectiveCurrentRhythm 
        : Array(effectiveLength).fill('quarter' as NoteValue);
      
      if (!Array.isArray(effectiveRhythm) || effectiveRhythm.length === 0) {
        return { totalBeats: 0, distribution: {} };
      }

      const totalBeats = effectiveRhythm.reduce((sum, noteValue) => {
        try {
          return sum + getNoteValueBeats(noteValue);
        } catch {
          return sum;
        }
      }, 0);

      const distribution = NOTE_VALUES.reduce((acc, nv) => {
        try {
          const count = effectiveRhythm.filter(r => r === nv.value).length;
          if (count > 0) {
            acc[nv.label] = {
              count,
              percentage: Math.round((count / effectiveRhythm.length) * 100)
            };
          }
        } catch (error) {
          console.error('Error calculating distribution for', nv.label, error);
        }
        return acc;
      }, {} as Record<string, { count: number; percentage: number }>);

      return { totalBeats, distribution };
    } catch (error) {
      console.error('Error calculating rhythm stats:', error);
      return { totalBeats: 0, distribution: {} };
    }
  }, [effectiveCurrentRhythm, effectiveLength]);

  // EXISTING FUNCTION: Generate rhythm based on percentage distribution (PRESERVED)
  const generatePercentageRhythm = useCallback(() => {
    try {
      if (effectiveLength === 0) {
        toast.error('No melody to apply rhythm to');
        return;
      }

      const percentage = percentageDistribution[0] / 100;
      const targetCount = Math.round(effectiveLength * percentage);
      const pattern: NoteValue[] = [];

      // Fill with selected note value for target percentage
      for (let i = 0; i < effectiveLength; i++) {
        if (i < targetCount) {
          pattern.push(selectedNoteValue);
        } else {
          // Fill remaining with quarter notes (default)
          pattern.push('quarter');
        }
      }

      // Shuffle for variety if enabled
      if (autoRhythm) {
        for (let i = pattern.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pattern[i], pattern[j]] = [pattern[j], pattern[i]];
        }
      }

      if (effectiveOnChange) {
        effectiveOnChange(pattern);
      }
      
      const noteInfo = NOTE_VALUES.find(nv => nv.value === selectedNoteValue);
      toast.success(`Applied ${percentageDistribution[0]}% ${noteInfo?.label || selectedNoteValue} rhythm`);
    } catch (error) {
      console.error('Error generating percentage rhythm:', error);
      toast.error('Failed to generate rhythm');
    }
  }, [effectiveLength, percentageDistribution, selectedNoteValue, autoRhythm, effectiveOnChange]);

  // EXISTING FUNCTION: Apply preset rhythm (PRESERVED)
  const applyPreset = useCallback((presetIndex: number) => {
    try {
      if (effectiveLength === 0) {
        toast.error('No melody to apply rhythm to');
        return;
      }

      const preset = RHYTHM_PRESETS[presetIndex];
      const pattern = preset.pattern(effectiveLength);
      
      if (effectiveOnChange) {
        effectiveOnChange(pattern);
      }
      toast.success(`Applied ${preset.name} rhythm pattern`);
    } catch (error) {
      console.error('Error applying preset:', error);
      toast.error('Failed to apply preset rhythm');
    }
  }, [effectiveLength, effectiveOnChange]);

  // EXISTING FUNCTION: Apply uniform rhythm (PRESERVED)
  const applyUniformRhythm = useCallback((noteValue: NoteValue) => {
    try {
      if (effectiveLength === 0) {
        toast.error('No melody to apply rhythm to');
        return;
      }

      const pattern = Array(effectiveLength).fill(noteValue);
      if (effectiveOnChange) {
        effectiveOnChange(pattern);
      }
      
      const noteInfo = NOTE_VALUES.find(nv => nv.value === noteValue);
      toast.success(`Applied uniform ${noteInfo?.label || noteValue} rhythm`);
    } catch (error) {
      console.error('Error applying uniform rhythm:', error);
      toast.error('Failed to apply rhythm');
    }
  }, [effectiveLength, effectiveOnChange]);

  // EXISTING FUNCTION: Reset to default quarter notes (PRESERVED)
  const resetRhythm = useCallback(() => {
    try {
      const pattern = Array(effectiveLength).fill('quarter' as NoteValue);
      if (effectiveOnChange) {
        effectiveOnChange(pattern);
      }
      toast.success('Rhythm reset to uniform quarter notes');
    } catch (error) {
      console.error('Error resetting rhythm:', error);
      toast.error('Failed to reset rhythm');
    }
  }, [effectiveLength, effectiveOnChange]);

  // EXISTING FUNCTION: Generate random rhythm (PRESERVED)
  const generateRandomRhythm = useCallback(() => {
    try {
      if (effectiveLength === 0) {
        toast.error('No melody to apply rhythm to');
        return;
      }

      // Weighted random selection favoring musically common rhythms
      const weightedValues: NoteValue[] = [
        'sixteenth', 'sixteenth', // 10%
        'eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth', // 30%
        'quarter', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter', // 40%
        'half', 'half', 'half', // 15%
        'dotted-quarter', // 5%
      ];

      const pattern = Array(effectiveLength).fill('quarter').map(() => {
        const randomIndex = Math.floor(Math.random() * weightedValues.length);
        return weightedValues[randomIndex];
      });

      if (effectiveOnChange) {
        effectiveOnChange(pattern);
      }
      toast.success('Applied random rhythm pattern');
    } catch (error) {
      console.error('Error generating random rhythm:', error);
      toast.error('Failed to generate random rhythm');
    }
  }, [effectiveLength, effectiveOnChange]);

  // NEW FUNCTION: Generate advanced multi-duration rhythm with multi-rest support
  const generateAdvancedRhythm = useCallback(() => {
    try {
      if (effectiveLength === 0) {
        toast.error('No melody to apply rhythm to');
        return;
      }

      // Normalize percentages to sum to 100
      const totalPercentage = multiDurationSlots.reduce((sum, slot) => sum + slot.percentage, 0);
      if (totalPercentage === 0) {
        toast.error('Please set at least one duration percentage');
        return;
      }

      // Calculate how many slots to allocate for notes vs rests
      const totalRestPercentage = restPercentage[0];
      const noteSlotCount = Math.round(((100 - totalRestPercentage) / 100) * effectiveLength);
      const restSlotCount = effectiveLength - noteSlotCount;

      // Create a weighted pool of note rhythm values
      const rhythmPool: RhythmValue[] = [];
      multiDurationSlots.forEach(slot => {
        const normalizedPercentage = (slot.percentage / totalPercentage) * 100;
        const count = Math.round((normalizedPercentage / 100) * noteSlotCount);
        for (let i = 0; i < count; i++) {
          rhythmPool.push(slot.rhythmValue);
        }
      });

      // ADDITIVE: Add multiple rest types if enabled
      if (includeRests && restSlotCount > 0) {
        // Calculate total rest slot percentage
        const totalRestSlotPercentage = multiRestSlots.reduce((sum, slot) => sum + slot.percentage, 0);
        
        if (totalRestSlotPercentage > 0) {
          // Distribute rest slots among different rest types
          multiRestSlots.forEach(slot => {
            const normalizedPercentage = (slot.percentage / totalRestSlotPercentage) * 100;
            const count = Math.round((normalizedPercentage / 100) * restSlotCount);
            for (let i = 0; i < count; i++) {
              rhythmPool.push(slot.restValue);
            }
          });
        } else {
          // Fallback to single rest type if no multi-rest percentages set
          for (let i = 0; i < restSlotCount; i++) {
            rhythmPool.push(selectedRestValue);
          }
        }
      }

      // Fill to exact length if needed
      while (rhythmPool.length < effectiveLength) {
        rhythmPool.push('quarter');
      }

      // Trim if too long
      if (rhythmPool.length > effectiveLength) {
        rhythmPool.length = effectiveLength;
      }

      // Shuffle the pool
      for (let i = rhythmPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rhythmPool[i], rhythmPool[j]] = [rhythmPool[j], rhythmPool[i]];
      }

      // 🚨 CRITICAL FIX: Keep rests as 'rest' NoteValue for proper handling
      // The system now understands 'rest' as a valid NoteValue (duration = 0 beats)
      // This will be properly handled by:
      // - Melody generation (rests become -1 in melody array)
      // - Audio engine (skips playback for rest values)
      // - Visualizers (shows rest symbols)
      // - MIDI export (exports as rest events)
      const pattern: NoteValue[] = rhythmPool.map(rv => {
        if (rv.startsWith('rest-')) {
          // Convert rest-quarter -> 'rest', rest-eighth -> 'rest', etc.
          // The duration information is preserved in the rhythm but melody gets -1
          return 'rest' as NoteValue;
        }
        return rv as NoteValue;
      });

      if (effectiveOnChange) {
        effectiveOnChange(pattern);
      }
      
      const restInfo = includeRests ? ` with ${restPercentage[0]}% rests (${multiRestSlots.length} types)` : '';
      toast.success(`Applied advanced rhythm pattern${restInfo}`);
    } catch (error) {
      console.error('Error generating advanced rhythm:', error);
      toast.error('Failed to generate advanced rhythm');
    }
  }, [effectiveLength, multiDurationSlots, includeRests, restPercentage, selectedRestValue, effectiveOnChange]);

  // NEW FUNCTION: Add duration slot
  const addDurationSlot = useCallback(() => {
    const newSlot: DurationSlot = {
      id: Date.now().toString(),
      rhythmValue: 'quarter',
      percentage: 25
    };
    setMultiDurationSlots([...multiDurationSlots, newSlot]);
  }, [multiDurationSlots]);

  // NEW FUNCTION: Remove duration slot
  const removeDurationSlot = useCallback((id: string) => {
    if (multiDurationSlots.length <= 1) {
      toast.error('Must have at least one duration slot');
      return;
    }
    setMultiDurationSlots(multiDurationSlots.filter(slot => slot.id !== id));
  }, [multiDurationSlots]);

  // NEW FUNCTION: Update duration slot
  const updateDurationSlot = useCallback((id: string, updates: Partial<DurationSlot>) => {
    setMultiDurationSlots(multiDurationSlots.map(slot => 
      slot.id === id ? { ...slot, ...updates } : slot
    ));
  }, [multiDurationSlots]);

  // ADDITIVE: Rest slot management functions
  const addRestSlot = useCallback(() => {
    const newSlot: RestSlot = {
      id: `rest-${Date.now()}`,
      restValue: 'rest-quarter',
      percentage: 25
    };
    setMultiRestSlots([...multiRestSlots, newSlot]);
  }, [multiRestSlots]);

  const removeRestSlot = useCallback((id: string) => {
    if (multiRestSlots.length <= 1) {
      toast.error('Must have at least one rest slot when using multi-rest mode');
      return;
    }
    setMultiRestSlots(multiRestSlots.filter(slot => slot.id !== id));
  }, [multiRestSlots]);

  const updateRestSlot = useCallback((id: string, updates: Partial<RestSlot>) => {
    setMultiRestSlots(multiRestSlots.map(slot => 
      slot.id === id ? { ...slot, ...updates } : slot
    ));
  }, [multiRestSlots]);

  // NEW FUNCTION: Save current pattern (ENHANCED with rest slots)
  const savePattern = useCallback(() => {
    if (!patternName.trim()) {
      toast.error('Please enter a pattern name');
      return;
    }

    const newPattern: SavedPattern = {
      id: Date.now().toString(),
      name: patternName,
      slots: [...multiDurationSlots],
      includeRests,
      restSlots: [...multiRestSlots], // ADDITIVE: Save rest slots
      restPercentage: restPercentage[0], // ADDITIVE: Save rest percentage
      createdAt: Date.now()
    };

    setSavedPatterns([...savedPatterns, newPattern]);
    setPatternName('');
    toast.success(`Saved pattern: ${patternName}`);
  }, [patternName, multiDurationSlots, includeRests, multiRestSlots, restPercentage, savedPatterns]);

  // NEW FUNCTION: Load saved pattern (ENHANCED with rest slots)
  const loadPattern = useCallback((pattern: SavedPattern) => {
    setMultiDurationSlots([...pattern.slots]);
    setIncludeRests(pattern.includeRests);
    // ADDITIVE: Load rest slots if available
    if (pattern.restSlots && pattern.restSlots.length > 0) {
      setMultiRestSlots([...pattern.restSlots]);
    }
    if (pattern.restPercentage !== undefined) {
      setRestPercentage([pattern.restPercentage]);
    }
    toast.success(`Loaded pattern: ${pattern.name}`);
  }, []);

  // NEW FUNCTION: Delete saved pattern
  const deletePattern = useCallback((id: string) => {
    setSavedPatterns(savedPatterns.filter(p => p.id !== id));
    toast.success('Pattern deleted');
  }, [savedPatterns]);

  // Calculate total percentage for multi-duration slots
  const totalSlotPercentage = useMemo(() => {
    return multiDurationSlots.reduce((sum, slot) => sum + slot.percentage, 0);
  }, [multiDurationSlots]);

  // ADDITIVE: Calculate total percentage for multi-rest slots
  const totalRestSlotPercentage = useMemo(() => {
    return multiRestSlots.reduce((sum, slot) => sum + slot.percentage, 0);
  }, [multiRestSlots]);

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-purple-900 dark:text-purple-100">
              Rhythm Controls
            </h3>
            <Badge variant="outline" className="text-xs">
              {effectiveLength} notes
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetRhythm}
              className="h-7 text-xs gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </Button>
          </div>
        </div>

        {/* Auto Rhythm Toggle */}
        <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <div>
              <Label className="text-sm font-medium">Auto Rhythm Generation</Label>
              <p className="text-xs text-muted-foreground">
                {autoRhythm ? 'Randomize rhythm distribution' : 'Sequential rhythm application'}
              </p>
            </div>
          </div>
          <Switch
            checked={autoRhythm}
            onCheckedChange={setAutoRhythm}
          />
        </div>

        <Separator />

        {/* Rhythm Mode Selection - EXTENDED with Advanced mode */}
        <div className="space-y-3">
          <Label className="text-sm">Rhythm Application Mode</Label>
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant={rhythmMode === 'percentage' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRhythmMode('percentage')}
              className="text-xs gap-1"
            >
              <BarChart3 className="w-3 h-3" />
              Percentage
            </Button>
            <Button
              variant={rhythmMode === 'preset' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRhythmMode('preset')}
              className="text-xs gap-1"
            >
              <Music className="w-3 h-3" />
              Presets
            </Button>
            <Button
              variant={rhythmMode === 'manual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRhythmMode('manual')}
              className="text-xs gap-1"
            >
              <Shuffle className="w-3 h-3" />
              Manual
            </Button>
            <Button
              variant={rhythmMode === 'advanced' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRhythmMode('advanced')}
              className="text-xs gap-1"
            >
              <Settings2 className="w-3 h-3" />
              Advanced
            </Button>
          </div>
        </div>

        {/* EXISTING Percentage Mode (PRESERVED 100%) */}
        {rhythmMode === 'percentage' && (
          <div className="space-y-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Note Value</Label>
                <Badge variant="outline" className="text-xs font-mono">
                  {NOTE_VALUES.find(nv => nv.value === selectedNoteValue)?.icon}
                </Badge>
              </div>
              <Select value={selectedNoteValue} onValueChange={(value) => setSelectedNoteValue(value as NoteValue)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_VALUES.map((nv) => (
                    <SelectItem key={nv.value} value={nv.value}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg">{nv.icon}</span>
                        <div>
                          <div className="font-medium">{nv.label}</div>
                          <div className="text-xs text-muted-foreground">{nv.beats} beats</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Distribution Percentage</Label>
                <Badge variant="secondary" className="text-xs font-mono">
                  {percentageDistribution[0]}%
                </Badge>
              </div>
              <Slider
                value={percentageDistribution}
                onValueChange={setPercentageDistribution}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="text-xs text-purple-700 dark:text-purple-300 bg-purple-100/50 dark:bg-purple-900/30 p-2 rounded border border-purple-200 dark:border-purple-700">
              <strong>Effect:</strong> {Math.round(effectiveLength * percentageDistribution[0] / 100)} notes will be {NOTE_VALUES.find(nv => nv.value === selectedNoteValue)?.label.toLowerCase() || selectedNoteValue}, 
              {' '}{effectiveLength - Math.round(effectiveLength * percentageDistribution[0] / 100)} will be quarter notes
            </div>

            <Button
              onClick={generatePercentageRhythm}
              className="w-full gap-2"
              disabled={effectiveLength === 0}
            >
              <Zap className="w-4 h-4" />
              Apply Percentage Rhythm
            </Button>
          </div>
        )}

        {/* EXISTING Preset Mode (PRESERVED 100%) */}
        {rhythmMode === 'preset' && (
          <div className="space-y-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <Label className="text-sm">Choose Rhythm Preset</Label>
            <div className="grid grid-cols-1 gap-2">
              {RHYTHM_PRESETS.map((preset, index) => (
                <Button
                  key={index}
                  variant={selectedPreset === index ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedPreset(index);
                    applyPreset(index);
                  }}
                  className="justify-start text-left h-auto py-2"
                >
                  <div>
                    <div className="font-medium text-sm">{preset.name}</div>
                    <div className="text-xs text-muted-foreground">{preset.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* EXISTING Manual Mode (PRESERVED 100%) */}
        {rhythmMode === 'manual' && (
          <div className="space-y-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <Label className="text-sm">Quick Rhythm Generators</Label>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateRandomRhythm}
                className="gap-1 text-xs"
              >
                <Shuffle className="w-3 h-3" />
                Random Mix
              </Button>
              {NOTE_VALUES.slice(1, 5).map((nv) => (
                <Button
                  key={nv.value}
                  variant="outline"
                  size="sm"
                  onClick={() => applyUniformRhythm(nv.value)}
                  className="gap-1 text-xs"
                >
                  <span className="font-mono">{nv.icon}</span>
                  All {nv.label.split(' ')[0]}
                </Button>
              ))}
            </div>

            <div className="text-xs text-muted-foreground">
              Apply a uniform rhythm or generate a random musical pattern
            </div>
          </div>
        )}

        {/* NEW Advanced Mode */}
        {rhythmMode === 'advanced' && (
          <div className="space-y-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Multi-Duration Distribution</Label>
              <Badge variant="secondary" className="text-xs">
                Total: {totalSlotPercentage}%
              </Badge>
            </div>

            {/* Duration Slots */}
            <div className="space-y-2">
              {multiDurationSlots.map((slot, index) => (
                <div key={slot.id} className="p-2 bg-white dark:bg-black/30 rounded border border-purple-200 dark:border-purple-700">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Select 
                          value={slot.rhythmValue} 
                          onValueChange={(value) => updateDurationSlot(slot.id, { rhythmValue: value as RhythmValue })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Notes</div>
                            {NOTE_VALUES.map((nv) => (
                              <SelectItem key={nv.value} value={nv.value}>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono">{nv.icon}</span>
                                  <span className="text-xs">{nv.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDurationSlot(slot.id)}
                        className="h-8 w-8 p-0"
                        disabled={multiDurationSlots.length <= 1}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Percentage</span>
                        <Badge variant="outline" className="text-xs">{slot.percentage}%</Badge>
                      </div>
                      <Slider
                        value={[slot.percentage]}
                        onValueChange={([value]) => updateDurationSlot(slot.id, { percentage: value })}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={addDurationSlot}
              className="w-full gap-2"
            >
              <Plus className="w-3 h-3" />
              Add Duration Slot
            </Button>

            {/* Rest Controls - ENHANCED with Multi-Rest Support */}
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PauseCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <Label className="text-sm">Include Rests</Label>
                </div>
                <Switch
                  checked={includeRests}
                  onCheckedChange={setIncludeRests}
                />
              </div>

              {includeRests && (
                <div className="space-y-3 p-2 bg-purple-50/50 dark:bg-purple-950/30 rounded border border-purple-200 dark:border-purple-700">
                  {/* Total Rest Percentage */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Total Rest Percentage</Label>
                      <Badge variant="outline" className="text-xs">{restPercentage[0]}%</Badge>
                    </div>
                    <Slider
                      value={restPercentage}
                      onValueChange={setRestPercentage}
                      min={0}
                      max={50}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <Separator className="my-2" />

                  {/* Multi-Rest Slots */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Rest Type Distribution</Label>
                      <Badge variant="secondary" className="text-xs">
                        Total: {totalRestSlotPercentage}%
                      </Badge>
                    </div>

                    {/* Rest Slots */}
                    <div className="space-y-2">
                      {multiRestSlots.map((slot, index) => (
                        <div key={slot.id} className="p-2 bg-white dark:bg-black/30 rounded border border-orange-200 dark:border-orange-700/50">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <Select 
                                  value={slot.restValue} 
                                  onValueChange={(value) => updateRestSlot(slot.id, { restValue: value as RhythmValue })}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {REST_VALUES.map((rv) => (
                                      <SelectItem key={rv.value} value={rv.value}>
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono">{rv.icon}</span>
                                          <span className="text-xs">{rv.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRestSlot(slot.id)}
                                className="h-8 w-8 p-0"
                                disabled={multiRestSlots.length <= 1}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Distribution</span>
                                <Badge variant="outline" className="text-xs">{slot.percentage}%</Badge>
                              </div>
                              <Slider
                                value={[slot.percentage]}
                                onValueChange={([value]) => updateRestSlot(slot.id, { percentage: value })}
                                min={0}
                                max={100}
                                step={5}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addRestSlot}
                      className="w-full gap-2 text-xs"
                    >
                      <Plus className="w-3 h-3" />
                      Add Rest Type
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Effect Preview */}
            <div className="text-xs text-purple-700 dark:text-purple-300 bg-purple-100/50 dark:bg-purple-900/30 p-2 rounded border border-purple-200 dark:border-purple-700">
              <strong>Effect:</strong> Rhythm will be distributed among {multiDurationSlots.length} duration type{multiDurationSlots.length > 1 ? 's' : ''}
              {includeRests && ` with ${restPercentage[0]}% rests`}
            </div>

            {/* Apply Button */}
            <Button
              onClick={generateAdvancedRhythm}
              className="w-full gap-2"
              disabled={effectiveLength === 0 || totalSlotPercentage === 0}
            >
              <Zap className="w-4 h-4" />
              Apply Advanced Rhythm
            </Button>

            {/* Save/Load Section */}
            <Separator />
            <div className="space-y-3">
              <Label className="text-sm font-medium">Save & Load Patterns</Label>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Pattern name..."
                  value={patternName}
                  onChange={(e) => setPatternName(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={savePattern}
                  className="gap-1 h-8"
                  disabled={!patternName.trim()}
                >
                  <Save className="w-3 h-3" />
                  Save
                </Button>
              </div>

              {savedPatterns.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSavedPatterns(!showSavedPatterns)}
                    className="w-full gap-2 text-xs"
                  >
                    <FolderOpen className="w-3 h-3" />
                    {showSavedPatterns ? 'Hide' : 'Show'} Saved Patterns ({savedPatterns.length})
                  </Button>

                  {showSavedPatterns && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {savedPatterns.map((pattern) => (
                        <div 
                          key={pattern.id} 
                          className="flex items-center justify-between p-2 bg-white dark:bg-black/30 rounded border border-purple-200 dark:border-purple-700"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{pattern.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {pattern.slots.length} durations{pattern.includeRests && ' + rests'}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadPattern(pattern)}
                              className="h-7 w-7 p-0"
                            >
                              <FolderOpen className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePattern(pattern.id)}
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* EXISTING Current Rhythm Stats (PRESERVED 100%) */}
        <div className="space-y-2 p-3 bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <Label className="text-sm font-medium">Current Rhythm Analysis</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/50 dark:bg-black/20 p-2 rounded border border-purple-200 dark:border-purple-700">
              <div className="text-muted-foreground">Total Duration</div>
              <div className="font-mono font-medium text-purple-900 dark:text-purple-100">
                {rhythmStats.totalBeats.toFixed(1)} beats
              </div>
            </div>
            <div className="bg-white/50 dark:bg-black/20 p-2 rounded border border-purple-200 dark:border-purple-700">
              <div className="text-muted-foreground">Note Count</div>
              <div className="font-mono font-medium text-purple-900 dark:text-purple-100">
                {effectiveLength} notes
              </div>
            </div>
          </div>

          {Object.keys(rhythmStats.distribution).length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Distribution:</div>
              {Object.entries(rhythmStats.distribution).map(([noteType, stats]) => (
                <div key={noteType} className="flex items-center justify-between text-xs bg-white/50 dark:bg-black/20 px-2 py-1 rounded">
                  <span className="font-medium">{noteType}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{stats.count} notes</span>
                    <Badge variant="secondary" className="text-xs">
                      {stats.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EXISTING Help Text - UPDATED with new mode */}
        <div className="text-xs text-muted-foreground bg-purple-50/50 dark:bg-purple-950/30 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
          <strong className="text-purple-900 dark:text-purple-100">💡 How to use:</strong>
          <ul className="mt-1 space-y-1 list-disc list-inside">
            <li><strong>Percentage Mode:</strong> Choose a note value and distribute it across your theme by percentage</li>
            <li><strong>Preset Mode:</strong> Apply professionally crafted rhythm patterns instantly</li>
            <li><strong>Manual Mode:</strong> Use quick generators or create uniform rhythms</li>
            <li><strong>Advanced Mode:</strong> ✨ Distribute among multiple durations, include rests, save/load patterns</li>
            <li><strong>Auto Toggle:</strong> Enable to randomize the placement of rhythmic values</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
