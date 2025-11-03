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
import { Music2, Zap, BarChart3, Shuffle, RotateCcw, Music } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface RhythmControlsProps {
  // Legacy interface (used by ThemeComposer)
  theme?: Theme;
  onRhythmApplied?: (rhythmPattern: NoteValue[]) => void;
  currentRhythm?: NoteValue[];
  
  // New interface (used by Imitation/Fugue sections)
  rhythm?: NoteValue[];
  onRhythmChange?: (rhythm: NoteValue[]) => void;
  melodyLength?: number;
}

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

export function RhythmControls({ 
  theme, 
  onRhythmApplied, 
  currentRhythm,
  rhythm,
  onRhythmChange,
  melodyLength
}: RhythmControlsProps) {
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

  // State
  const [autoRhythm, setAutoRhythm] = useState(false);
  const [rhythmMode, setRhythmMode] = useState<'percentage' | 'preset' | 'manual'>('percentage');
  const [selectedNoteValue, setSelectedNoteValue] = useState<NoteValue>('quarter');
  const [percentageDistribution, setPercentageDistribution] = useState([50]); // 50% of selected note value
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [manualRhythm, setManualRhythm] = useState<NoteValue[]>([]);

  // Calculate rhythm statistics with comprehensive error handling
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

  // Generate rhythm based on percentage distribution
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

  // Apply preset rhythm
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

  // Apply uniform rhythm
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

  // Reset to default quarter notes
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

  // Generate random rhythm
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

        {/* Rhythm Mode Selection */}
        <div className="space-y-3">
          <Label className="text-sm">Rhythm Application Mode</Label>
          <div className="grid grid-cols-3 gap-2">
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
          </div>
        </div>

        {/* Percentage Mode */}
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

        {/* Preset Mode */}
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

        {/* Manual Mode */}
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

        <Separator />

        {/* Current Rhythm Stats */}
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

        {/* Help Text */}
        <div className="text-xs text-muted-foreground bg-purple-50/50 dark:bg-purple-950/30 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
          <strong className="text-purple-900 dark:text-purple-100">💡 How to use:</strong>
          <ul className="mt-1 space-y-1 list-disc list-inside">
            <li><strong>Percentage Mode:</strong> Choose a note value and distribute it across your theme by percentage</li>
            <li><strong>Preset Mode:</strong> Apply professionally crafted rhythm patterns instantly</li>
            <li><strong>Manual Mode:</strong> Use quick generators or create uniform rhythms</li>
            <li><strong>Auto Toggle:</strong> Enable to randomize the placement of rhythmic values</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
