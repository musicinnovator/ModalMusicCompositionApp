import { useMemo } from 'react';
import { BachLikeVariables, BachVariableName, BACH_VARIABLE_SHORT_LABELS, PITCH_NAMES, Melody, midiNoteToNoteName, isRest, isNote, melodyElementToString } from '../types/musical';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { MelodyVisualizer } from './MelodyVisualizer';
import { ErrorBoundary } from './ErrorBoundary';
import { Music, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface BachVariablesVisualizerProps {
  variables: BachLikeVariables;
  colorPalette: string[];
  onClearVariable?: (variableName: BachVariableName) => void;
}

export function BachVariablesVisualizer({ 
  variables, 
  colorPalette,
  onClearVariable 
}: BachVariablesVisualizerProps) {
  const [hiddenVariables, setHiddenVariables] = useState<Set<BachVariableName>>(new Set());

  // Memory optimization: Filter only variables with content
  const filledVariables = useMemo(() => 
    Object.entries(variables).filter(([, melody]) => melody.length > 0) as [BachVariableName, Melody][],
    [variables]
  );

  const toggleVariableVisibility = (variableName: BachVariableName) => {
    setHiddenVariables(prev => {
      const newSet = new Set(prev);
      if (newSet.has(variableName)) {
        newSet.delete(variableName);
      } else {
        newSet.add(variableName);
      }
      return newSet;
    });
  };

  if (filledVariables.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-medium mb-2">No Bach Variables Defined</h3>
        <p className="text-muted-foreground text-sm">
          Create your Bach-like variables in the Theme Composer to see them visualized here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Bach Variables Visualization</h2>
          <Badge variant="secondary">
            {filledVariables.length} variable{filledVariables.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Show/hide all variables
              if (hiddenVariables.size === filledVariables.length) {
                setHiddenVariables(new Set());
              } else {
                setHiddenVariables(new Set(filledVariables.map(([name]) => name)));
              }
            }}
          >
            {hiddenVariables.size === filledVariables.length ? (
              <>
                <Eye className="w-3 h-3 mr-1" />
                Show All
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3 mr-1" />
                Hide All
              </>
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className="max-h-[600px]">
        <div className="space-y-4">
          {filledVariables.map(([variableName, melody], index) => {
            const isHidden = hiddenVariables.has(variableName);
            const color = colorPalette[index % colorPalette.length];

            return (
              <ErrorBoundary key={variableName}>
                <Card className="overflow-hidden">
                  <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full border-2"
                          style={{ backgroundColor: color }}
                        />
                        <div>
                          <h3 className="font-medium">{BACH_VARIABLE_SHORT_LABELS[variableName]}</h3>
                          <p className="text-xs text-muted-foreground">
                            {melody.length} note{melody.length !== 1 ? 's' : ''} • 
                            {melody.map(midiNote => midiNoteToNoteName(midiNote)).join(' - ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVariableVisibility(variableName)}
                        >
                          {isHidden ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {!isHidden && (
                    <div className="p-0">
                      <MelodyVisualizer
                        melody={melody}
                        title=""
                        color={color}
                        showClearButton={!!onClearVariable}
                        onClear={onClearVariable ? () => onClearVariable(variableName) : undefined}
                      />
                    </div>
                  )}
                </Card>

                {index < filledVariables.length - 1 && <Separator className="my-4" />}
              </ErrorBoundary>
            );
          })}
        </div>
      </ScrollArea>

      {/* Summary Card */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
          Variable Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {filledVariables.map(([variableName, melody]) => (
            <div 
              key={variableName}
              className="flex justify-between p-2 bg-white/50 dark:bg-black/20 rounded"
            >
              <span className="font-medium">{BACH_VARIABLE_SHORT_LABELS[variableName]}:</span>
              <span className="text-blue-700 dark:text-blue-300">{melody.length} notes</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-blue-700 dark:text-blue-300">
          <strong>Total notes across all variables:</strong> {' '}
          {filledVariables.reduce((sum, [, melody]) => sum + melody.length, 0)}
        </div>
      </Card>
    </div>
  );
}