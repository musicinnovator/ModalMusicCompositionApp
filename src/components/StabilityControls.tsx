import { useState } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Anchor, Zap, Shuffle } from 'lucide-react';

export type StabilityMode = 'stable' | 'unstable' | 'mix';

interface StabilityControlsProps {
  stabilityMode: StabilityMode;
  stabilityRatio: number; // 0-100, where 0 is fully stable, 100 is fully unstable
  onStabilityModeChange: (mode: StabilityMode) => void;
  onStabilityRatioChange: (ratio: number) => void;
}

export function StabilityControls({ 
  stabilityMode, 
  stabilityRatio, 
  onStabilityModeChange, 
  onStabilityRatioChange 
}: StabilityControlsProps) {
  const getStabilityDescription = () => {
    if (stabilityMode === 'stable') {
      return 'Emphasizes stable tones (1, 3, 5) for consonant, resolved melodies';
    } else if (stabilityMode === 'unstable') {
      return 'Emphasizes unstable tones (2, 4, 6, 7) for tension and movement';
    } else {
      return `Mixed approach with ${100 - stabilityRatio}% stable / ${stabilityRatio}% unstable tones`;
    }
  };

  const getStableNotes = () => ['1', '3', '5'];
  const getUnstableNotes = () => ['2', '4', '6', '7'];

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-blue-600 rounded flex items-center justify-center">
            <Anchor className="w-3 h-3 text-white" />
          </div>
          <Label className="font-medium">Tonal Stability</Label>
        </div>
        <Badge variant="outline" className="text-xs">
          Generation Control
        </Badge>
      </div>

      {/* Mode Toggle */}
      <div className="space-y-2">
        <Label className="text-sm">Stability Mode</Label>
        <ToggleGroup 
          type="single" 
          value={stabilityMode} 
          onValueChange={(value) => value && onStabilityModeChange(value as StabilityMode)}
          className="grid grid-cols-3 gap-1"
        >
          <ToggleGroupItem value="stable" className="flex items-center gap-1 text-xs">
            <Anchor className="w-3 h-3" />
            Stable
          </ToggleGroupItem>
          <ToggleGroupItem value="mix" className="flex items-center gap-1 text-xs">
            <Shuffle className="w-3 h-3" />
            Mix
          </ToggleGroupItem>
          <ToggleGroupItem value="unstable" className="flex items-center gap-1 text-xs">
            <Zap className="w-3 h-3" />
            Unstable
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Ratio Slider (only shown in mix mode) */}
      {stabilityMode === 'mix' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Stability Ratio</Label>
            <span className="text-xs text-muted-foreground">
              {100 - stabilityRatio}% / {stabilityRatio}%
            </span>
          </div>
          <Slider
            value={[stabilityRatio]}
            onValueChange={(value) => onStabilityRatioChange(value[0])}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>More Stable</span>
            <span>More Unstable</span>
          </div>
        </div>
      )}

      {/* Tone Information */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Stable tones:</span>
            <div className="flex gap-1">
              {getStableNotes().map(note => (
                <Badge key={note} variant="secondary" className="text-xs px-1.5 py-0">
                  {note}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Unstable tones:</span>
            <div className="flex gap-1">
              {getUnstableNotes().map(note => (
                <Badge key={note} variant="outline" className="text-xs px-1.5 py-0">
                  {note}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          {getStabilityDescription()}
        </div>
      </div>
    </Card>
  );
}