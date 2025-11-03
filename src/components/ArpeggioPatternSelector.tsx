/**
 * Arpeggio Pattern Selector Component
 * Version: 1.002
 * 
 * UI for selecting and applying arpeggio patterns to themes
 * Supports 3-6 note patterns with all permutations
 * 
 * Harris Software Solutions LLC
 */

import { useState, useMemo } from 'react';
import { Theme, BachVariableName, midiNoteToNoteName } from '../types/musical';
import {
  ArpeggioPattern,
  getPatternsByNoteCount,
  applyArpeggioPatternAdvanced,
  previewPatternNotes,
} from '../lib/arpeggio-pattern-generator';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Music2, Wand2, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ArpeggioPatternSelectorProps {
  sourceTheme: Theme;
  onApplyToTheme: (arpeggioTheme: Theme) => void;
  onApplyToBachVariable?: (arpeggioTheme: Theme, variableName: BachVariableName) => void;
  mode?: 'theme' | 'bach';
  bachVariableName?: BachVariableName;
}

export function ArpeggioPatternSelector({
  sourceTheme,
  onApplyToTheme,
  onApplyToBachVariable,
  mode = 'theme',
  bachVariableName,
}: ArpeggioPatternSelectorProps) {
  const [selectedNoteCount, setSelectedNoteCount] = useState<3 | 4 | 5 | 6>(3);
  const [selectedPattern, setSelectedPattern] = useState<ArpeggioPattern | null>(null);
  const [repetitions, setRepetitions] = useState(1);

  // Get all patterns grouped by note count
  const patternsByNoteCount = useMemo(() => getPatternsByNoteCount(), []);

  // Get current patterns for selected note count
  const currentPatterns = useMemo(
    () => patternsByNoteCount[selectedNoteCount] || [],
    [patternsByNoteCount, selectedNoteCount]
  );

  // Preview what notes will be used from source theme
  const notePreview = useMemo(
    () => previewPatternNotes(sourceTheme),
    [sourceTheme]
  );

  // Auto-select first pattern when note count changes
  useMemo(() => {
    if (currentPatterns.length > 0 && !selectedPattern) {
      setSelectedPattern(currentPatterns[0]);
    } else if (selectedPattern && selectedPattern.noteCount !== selectedNoteCount) {
      setSelectedPattern(currentPatterns[0]);
    }
  }, [currentPatterns, selectedNoteCount, selectedPattern]);

  const handleApplyPattern = () => {
    if (!selectedPattern) {
      toast.error('Please select an arpeggio pattern first');
      return;
    }

    if (!sourceTheme || sourceTheme.length === 0) {
      toast.error('Source theme is empty. Please create a theme first.');
      return;
    }

    try {
      // Generate arpeggio using the selected pattern
      const arpeggioTheme = applyArpeggioPatternAdvanced(
        sourceTheme,
        selectedPattern,
        repetitions
      );

      // Apply to the appropriate target
      if (mode === 'theme') {
        onApplyToTheme(arpeggioTheme);
        toast.success(`Arpeggio pattern ${selectedPattern.name} applied to theme!`, {
          description: `${arpeggioTheme.length} notes generated with ${repetitions} repetition${repetitions > 1 ? 's' : ''}`
        });
      } else if (mode === 'bach' && bachVariableName && onApplyToBachVariable) {
        onApplyToBachVariable(arpeggioTheme, bachVariableName);
        toast.success(`Arpeggio pattern ${selectedPattern.name} applied to ${bachVariableName}!`, {
          description: `${arpeggioTheme.length} notes generated with ${repetitions} repetition${repetitions > 1 ? 's' : ''}`
        });
      }

      console.log('🎵 Arpeggio applied:', {
        pattern: selectedPattern.name,
        noteCount: selectedPattern.noteCount,
        repetitions,
        sourceNotes: notePreview,
        generatedLength: arpeggioTheme.length,
      });
    } catch (error) {
      console.error('Error applying arpeggio pattern:', error);
      toast.error('Failed to apply arpeggio pattern');
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music2 className="w-5 h-5 text-indigo-600" />
          <h3 className="font-medium">Arpeggio Pattern Generator</h3>
        </div>
        <Badge variant="outline" className="gap-1">
          <Wand2 className="w-3 h-3" />
          {currentPatterns.length} Patterns
        </Badge>
      </div>

      {/* Note Preview */}
      <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Info className="w-3 h-3" />
          Pattern Notes from Source
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">L (Low)</div>
            <Badge variant="secondary" className="w-full justify-center">
              {notePreview.lowestName}
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">M (Mid)</div>
            <Badge variant="secondary" className="w-full justify-center">
              {notePreview.middleName}
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">H (High)</div>
            <Badge variant="secondary" className="w-full justify-center">
              {notePreview.highestName}
            </Badge>
          </div>
        </div>
      </div>

      {/* Note Count Selection */}
      <div className="space-y-2">
        <Label>Pattern Length (Notes per Cycle)</Label>
        <Tabs
          value={selectedNoteCount.toString()}
          onValueChange={(value) => setSelectedNoteCount(parseInt(value) as 3 | 4 | 5 | 6)}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="3">3 Notes</TabsTrigger>
            <TabsTrigger value="4">4 Notes</TabsTrigger>
            <TabsTrigger value="5">5 Notes</TabsTrigger>
            <TabsTrigger value="6">6 Notes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Pattern Selection */}
      <div className="space-y-2">
        <Label>Select Pattern</Label>
        <Select
          value={selectedPattern?.name || ''}
          onValueChange={(value) => {
            const pattern = currentPatterns.find((p) => p.name === value);
            setSelectedPattern(pattern || null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose an arpeggio pattern" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {currentPatterns.map((pattern) => (
              <SelectItem key={pattern.name} value={pattern.name}>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    {pattern.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {pattern.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedPattern && (
          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3">
            <div className="text-xs font-medium text-indigo-900 dark:text-indigo-100 mb-1">
              Selected Pattern
            </div>
            <div className="flex items-center gap-2">
              <Badge className="font-mono">{selectedPattern.name}</Badge>
              <span className="text-xs text-indigo-700 dark:text-indigo-300">
                {selectedPattern.description}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Repetitions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Repetitions</Label>
          <Badge variant="secondary">{repetitions}x</Badge>
        </div>
        <Slider
          value={[repetitions]}
          onValueChange={(value) => setRepetitions(value[0])}
          min={1}
          max={8}
          step={1}
          className="w-full"
        />
        <div className="text-xs text-muted-foreground">
          Total notes: {selectedPattern ? selectedPattern.noteCount * repetitions : 0}
        </div>
      </div>

      {/* Pattern Grid Preview */}
      {selectedPattern && (
        <div className="bg-muted/30 border border-border rounded-lg p-3">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Pattern Preview (1 cycle)
          </div>
          <div className="flex items-center gap-1">
            {selectedPattern.pattern.split('').map((char, index) => {
              const noteMap: Record<string, string> = {
                L: notePreview.lowestName,
                M: notePreview.middleName,
                H: notePreview.highestName,
              };
              return (
                <div
                  key={index}
                  className="flex-1 text-center bg-background border border-border rounded px-2 py-1"
                >
                  <div className="text-xs font-mono font-semibold">{char}</div>
                  <div className="text-xs text-muted-foreground">{noteMap[char]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Apply Button */}
      <Button
        onClick={handleApplyPattern}
        disabled={!selectedPattern || sourceTheme.length === 0}
        className="w-full gap-2"
      >
        <Wand2 className="w-4 h-4" />
        Apply Arpeggio Pattern
        {mode === 'bach' && bachVariableName && ` to ${bachVariableName}`}
      </Button>

      {sourceTheme.length === 0 && (
        <div className="text-xs text-center text-muted-foreground">
          ⚠️ Create a theme first to use arpeggio patterns
        </div>
      )}
    </Card>
  );
}
