/**
 * Canon Controls Component
 * UI for generating various types of canons
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Music2, Sparkles, Info, Plus } from 'lucide-react';
import { CanonType, CanonParams, CanonEngine } from '../lib/canon-engine';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Theme } from '../types/musical';

interface CanonControlsProps {
  onGenerateCanon: (params: CanonParams, secondTheme?: Theme) => void;
  disabled?: boolean;
  currentTheme?: Theme; // NEW: To show current theme info
}

export function CanonControls({ onGenerateCanon, disabled = false }: CanonControlsProps) {
  const canonTypes = CanonEngine.getCanonTypes();
  
  const [selectedType, setSelectedType] = useState<CanonType>('STRICT_CANON');
  const [interval, setInterval] = useState(12); // Semitones (octave default)
  const [delay, setDelay] = useState(4); // Beats
  const [numVoices, setNumVoices] = useState(2);
  const [mensurationRatio, setMensurationRatio] = useState(2.0);
  const [inversionAxis, setInversionAxis] = useState(60); // Middle C
  
  // NEW: Extended controls for new canon types
  const [inversionAxis2, setInversionAxis2] = useState(67); // G (fifth above middle C)
  const [mensurationRatio2, setMensurationRatio2] = useState(3.0);
  const [numVoicesPerCanon, setNumVoicesPerCanon] = useState(2);
  
  // NEWEST: Harris Software Solutions controls
  const [adherencePercentage, setAdherencePercentage] = useState(70); // For Loose Canon
  const [numPermutations, setNumPermutations] = useState(3); // For Per Mutative Canon

  // PER TONOS ENHANCEMENT: Individual voice intervals and modulation targets
  const [usePerTonosEnhancements, setUsePerTonosEnhancements] = useState(false); // Toggle for Per Tonos advanced mode
  const [perTonosVoiceIntervals, setPerTonosVoiceIntervals] = useState<number[]>([4, 7, 12]); // Default: Major 3rd, Fifth, Octave
  const [perTonosModulationTargets, setPerTonosModulationTargets] = useState<Array<{ keyName?: string; semitones?: number }>>([
    { semitones: 4 }, { semitones: 7 }, { semitones: 12 }
  ]);
  const [perTonosModulationMode, setPerTonosModulationMode] = useState<'semitones' | 'keyNames'>('semitones');

  // Get selected canon info
  const selectedCanonInfo = canonTypes.find(ct => ct.type === selectedType);

  // Determine which controls to show based on canon type
  const showIntervalControl = !['DOUBLE_CANON', 'CRAB_CANON', 'PER_MUTATIVE_CANON'].includes(selectedType);
  const showMensurationControl = ['RHYTHMIC_CANON', 'PER_AUGMENTATIONEM', 'MENSURABILIS', 'PER_ARSIN_ET_THESIN'].includes(selectedType);
  const showInversionAxis = ['INVERSION_CANON', 'RETROGRADE_INVERSION_CANON', 'PER_MOTUM_CONTRARIUM', 'ENIGMATICUS', 'INVERTED_CANON_AT_THE_FIFTH'].includes(selectedType);
  const showNumVoices = ['STRICT_CANON', 'DOUBLE_CANON', 'PER_TONOS', 'PER_DUO_AUGMENTATIONEM', 'INVERTED_CANON_AT_THE_FIFTH', 'LOOSE_CANON', 'FRAGMENTAL_CANON'].includes(selectedType);
  
  // NEW: Controls for new canon types
  const showInversionAxis2 = ['DOUBLE_CANON_BY_INVERSION', 'DOUBLE_CRAB_INVERSION_CANON'].includes(selectedType);
  const showMensurationRatio2 = ['DOUBLE_RHYTHMIC_CANON', 'PER_DUO_AUGMENTATIONEM'].includes(selectedType);
  const showNumVoicesPerCanon = ['DOUBLE_CANON_BY_INVERSION', 'DOUBLE_RHYTHMIC_CANON', 'DOUBLE_CRAB_INVERSION_CANON'].includes(selectedType);
  
  // NEWEST: Controls for Harris Software Solutions canon types
  const showAdherencePercentage = selectedType === 'LOOSE_CANON';
  const showNumPermutations = selectedType === 'PER_MUTATIVE_CANON';

  // PER TONOS ENHANCEMENT: Controls
  const showPerTonosEnhancements = selectedType === 'PER_TONOS';

  // Helper function to get key modulation name from semitone interval
  const getKeyModulationName = (semitones: number): string => {
    const intervalNames: { [key: number]: string } = {
      0: 'Unison/Same Key',
      1: 'Minor 2nd',
      2: 'Major 2nd',
      3: 'Minor 3rd',
      4: 'Major 3rd',
      5: 'Perfect 4th',
      6: 'Tritone',
      7: 'Perfect 5th',
      8: 'Minor 6th',
      9: 'Major 6th',
      10: 'Minor 7th',
      11: 'Major 7th',
      12: 'Octave',
      '-1': 'Minor 2nd down',
      '-2': 'Major 2nd down',
      '-3': 'Minor 3rd down',
      '-4': 'Major 3rd down',
      '-5': 'Perfect 4th down',
      '-6': 'Tritone down',
      '-7': 'Perfect 5th down',
      '-12': 'Octave down'
    };
    return intervalNames[semitones] || `${Math.abs(semitones)} semitones ${semitones < 0 ? 'down' : 'up'}`;
  };

  const handleGenerate = () => {
    const params: CanonParams = {
      type: selectedType,
      interval: {
        semitones: interval,
        diatonicSteps: Math.round(interval / 2), // Approximate diatonic steps
        isDiatonic: true
      },
      delay,
      numVoices,
      mensurationRatio: showMensurationControl || showMensurationRatio2 ? mensurationRatio : undefined,
      inversionAxis: showInversionAxis || showInversionAxis2 ? inversionAxis : undefined,
      // NEW: Extended parameters
      inversionAxis2: showInversionAxis2 ? inversionAxis2 : undefined,
      mensurationRatio2: showMensurationRatio2 ? mensurationRatio2 : undefined,
      numVoicesPerCanon: showNumVoicesPerCanon ? numVoicesPerCanon : undefined,
      // NEWEST: Harris Software Solutions parameters
      adherencePercentage: showAdherencePercentage ? adherencePercentage : undefined,
      numPermutations: showNumPermutations ? numPermutations : undefined,
      // PER TONOS ENHANCEMENTS: Individual voice intervals and modulation targets
      perTonosIntervals: (showPerTonosEnhancements && usePerTonosEnhancements) 
        ? perTonosVoiceIntervals.slice(0, numVoices - 1).map(semitones => ({
            semitones,
            diatonicSteps: Math.round(semitones / 2),
            isDiatonic: true
          }))
        : undefined,
      perTonosModulations: (showPerTonosEnhancements && usePerTonosEnhancements)
        ? perTonosModulationTargets.slice(0, numVoices - 1)
        : undefined
    };

    onGenerateCanon(params);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Canon Generator</h3>
            <p className="text-xs text-muted-foreground">
              Classical canon algorithms
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1">
          <Sparkles className="w-3 h-3" />
          22 Types
        </Badge>
      </div>

      <Separator />

      {/* Canon Type Selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Canon Type
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  {selectedCanonInfo?.description || 'Select a canon type'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <Select value={selectedType} onValueChange={(value) => setSelectedType(value as CanonType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {canonTypes.map(ct => (
              <SelectItem key={ct.type} value={ct.type}>
                <div className="flex flex-col items-start gap-1">
                  <span className="font-medium">{ct.name}</span>
                  <span className="text-xs text-muted-foreground">{ct.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedCanonInfo && (
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <strong>{selectedCanonInfo.name}:</strong> {selectedCanonInfo.description}
          </div>
        )}
      </div>

      {/* Entry Delay */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Entry Delay</Label>
          <span className="text-sm font-medium text-muted-foreground">
            {delay} beats
          </span>
        </div>
        <Slider
          value={[delay]}
          onValueChange={([value]) => setDelay(value)}
          min={1}
          max={16}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Time between voice entries
        </p>
      </div>

      {/* Interval Control (if applicable) */}
      {showIntervalControl && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Transposition Interval</Label>
            <span className="text-sm font-medium text-muted-foreground">
              {interval} semitones
              {interval === 0 && ' (Unison)'}
              {interval === 7 && ' (Fifth)'}
              {interval === 12 && ' (Octave)'}
              {interval === -12 && ' (Octave Down)'}
            </span>
          </div>
          <Slider
            value={[interval]}
            onValueChange={([value]) => setInterval(value)}
            min={-24}
            max={24}
            step={1}
            className="w-full"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInterval(0)}
              className="text-xs"
            >
              Unison
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInterval(7)}
              className="text-xs"
            >
              Fifth
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInterval(12)}
              className="text-xs"
            >
              Octave
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInterval(-12)}
              className="text-xs"
            >
              Oct. Down
            </Button>
          </div>
        </div>
      )}

      {/* Number of Voices (if applicable) */}
      {showNumVoices && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Number of Voices</Label>
            <span className="text-sm font-medium text-muted-foreground">
              {numVoices} voices
            </span>
          </div>
          <Slider
            value={[numVoices]}
            onValueChange={([value]) => setNumVoices(value)}
            min={2}
            max={6}
            step={1}
            className="w-full"
          />
        </div>
      )}

      {/* Mensuration Ratio (if applicable) */}
      {showMensurationControl && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Mensuration Ratio</Label>
            <span className="text-sm font-medium text-muted-foreground">
              {mensurationRatio.toFixed(2)}:1
              {mensurationRatio > 1 && ' (Augmentation)'}
              {mensurationRatio < 1 && ' (Diminution)'}
            </span>
          </div>
          <Slider
            value={[mensurationRatio]}
            onValueChange={([value]) => setMensurationRatio(value)}
            min={0.5}
            max={4.0}
            step={0.25}
            className="w-full"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMensurationRatio(0.5)}
              className="text-xs"
            >
              2:1 Dim.
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMensurationRatio(1.5)}
              className="text-xs"
            >
              3:2 Ratio
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMensurationRatio(2.0)}
              className="text-xs"
            >
              2:1 Aug.
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Follower tempo relative to leader (1.0 = same speed)
          </p>
        </div>
      )}

      {/* Inversion Axis (if applicable) */}
      {showInversionAxis && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Inversion Axis {showInversionAxis2 ? '1' : ''}</Label>
            <span className="text-sm font-medium text-muted-foreground">
              MIDI {inversionAxis} (C{Math.floor(inversionAxis / 12) - 1})
            </span>
          </div>
          <Slider
            value={[inversionAxis]}
            onValueChange={([value]) => setInversionAxis(value)}
            min={48}
            max={84}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Center pitch for melodic inversion
          </p>
        </div>
      )}

      {/* NEW: Second Inversion Axis (for Double Canon by Inversion) */}
      {showInversionAxis2 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Inversion Axis 2</Label>
            <span className="text-sm font-medium text-muted-foreground">
              MIDI {inversionAxis2} (G{Math.floor(inversionAxis2 / 12) - 1})
            </span>
          </div>
          <Slider
            value={[inversionAxis2]}
            onValueChange={([value]) => setInversionAxis2(value)}
            min={48}
            max={84}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Second center pitch for Canon B inversion
          </p>
        </div>
      )}

      {/* NEW: Second Mensuration Ratio (for Per Duo Augmentationem & Double Rhythmic Canon) */}
      {showMensurationRatio2 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Mensuration Ratio 2</Label>
            <span className="text-sm font-medium text-muted-foreground">
              {mensurationRatio2.toFixed(2)}:1
              {mensurationRatio2 > 1 && ' (Augmentation)'}
              {mensurationRatio2 < 1 && ' (Diminution)'}
            </span>
          </div>
          <Slider
            value={[mensurationRatio2]}
            onValueChange={([value]) => setMensurationRatio2(value)}
            min={2.0}
            max={4.0}
            step={0.25}
            className="w-full"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMensurationRatio2(2.0)}
              className="text-xs"
            >
              2:1 Aug.
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMensurationRatio2(3.0)}
              className="text-xs"
            >
              3:1 Aug.
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMensurationRatio2(4.0)}
              className="text-xs"
            >
              4:1 Aug.
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Second mensuration ratio for alternating followers
          </p>
        </div>
      )}

      {/* NEW: Voices Per Canon (for double canon types) */}
      {showNumVoicesPerCanon && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Voices Per Canon</Label>
            <span className="text-sm font-medium text-muted-foreground">
              {numVoicesPerCanon} voices each (Total: {numVoicesPerCanon * 2})
            </span>
          </div>
          <Slider
            value={[numVoicesPerCanon]}
            onValueChange={([value]) => setNumVoicesPerCanon(value)}
            min={2}
            max={7}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Number of voices in each of the two simultaneous canons
          </p>
        </div>
      )}

      {/* NEWEST: Adherence Percentage (for Loose Canon) */}
      {showAdherencePercentage && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Adherence Percentage</Label>
            <span className="text-sm font-medium text-muted-foreground">
              {adherencePercentage}%
            </span>
          </div>
          <Slider
            value={[adherencePercentage]}
            onValueChange={([value]) => setAdherencePercentage(value)}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdherencePercentage(50)}
              className="text-xs"
            >
              50% Loose
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdherencePercentage(70)}
              className="text-xs"
            >
              70% Default
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdherencePercentage(90)}
              className="text-xs"
            >
              90% Strict
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Percentage of notes strictly adhering to classic imitation
          </p>
        </div>
      )}

      {/* NEWEST: Number of Permutations (for Per Mutative Canon) */}
      {showNumPermutations && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Number of Permutations</Label>
            <span className="text-sm font-medium text-muted-foreground">
              {numPermutations} permutations
            </span>
          </div>
          <Slider
            value={[numPermutations]}
            onValueChange={([value]) => setNumPermutations(value)}
            min={1}
            max={7}
            step={1}
            className="w-full"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNumPermutations(3)}
              className="text-xs"
            >
              3 Perms
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNumPermutations(5)}
              className="text-xs"
            >
              5 Perms
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNumPermutations(7)}
              className="text-xs"
            >
              7 Perms
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Number of randomly permutated versions to generate
          </p>
        </div>
      )}

      {/* PER TONOS ENHANCEMENTS: Advanced Per Tonos Controls */}
      {showPerTonosEnhancements && (
        <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              Per Tonos Advanced Mode
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Enable to configure individual transposition intervals for each voice and specify modulation targets
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Button
              variant={usePerTonosEnhancements ? "default" : "outline"}
              size="sm"
              onClick={() => setUsePerTonosEnhancements(!usePerTonosEnhancements)}
              className="text-xs"
            >
              {usePerTonosEnhancements ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          {usePerTonosEnhancements && (
            <>
              <Separator className="bg-purple-200 dark:bg-purple-800" />
              
              {/* Individual Voice Interval Configuration */}
              <div className="space-y-3">
                <Label className="text-sm">Individual Voice Transposition Intervals</Label>
                <p className="text-xs text-muted-foreground">
                  Configure unique transposition for each follower voice (Leader = Voice 1)
                </p>
                
                {Array.from({ length: numVoices - 1 }, (_, i) => {
                  const voiceNum = i + 2; // Voice 2, 3, 4, etc.
                  const currentInterval = perTonosVoiceIntervals[i] || 0;
                  
                  return (
                    <div key={i} className="space-y-2 p-3 bg-white/50 dark:bg-black/20 rounded border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Voice {voiceNum} Interval</Label>
                        <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                          {currentInterval > 0 ? '+' : ''}{currentInterval} semitones
                          {currentInterval === 0 && ' (Unison)'}
                          {currentInterval === 4 && ' (Major 3rd)'}
                          {currentInterval === 7 && ' (Fifth)'}
                          {currentInterval === 12 && ' (Octave)'}
                        </span>
                      </div>
                      <Slider
                        value={[currentInterval]}
                        onValueChange={([value]) => {
                          const newIntervals = [...perTonosVoiceIntervals];
                          newIntervals[i] = value;
                          setPerTonosVoiceIntervals(newIntervals);
                          // Update modulation targets to match
                          const newModulations = [...perTonosModulationTargets];
                          newModulations[i] = { semitones: value };
                          setPerTonosModulationTargets(newModulations);
                        }}
                        min={-24}
                        max={24}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newIntervals = [...perTonosVoiceIntervals];
                            newIntervals[i] = 0;
                            setPerTonosVoiceIntervals(newIntervals);
                          }}
                          className="text-xs h-6 px-2"
                        >
                          0
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newIntervals = [...perTonosVoiceIntervals];
                            newIntervals[i] = 4;
                            setPerTonosVoiceIntervals(newIntervals);
                          }}
                          className="text-xs h-6 px-2"
                        >
                          +4
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newIntervals = [...perTonosVoiceIntervals];
                            newIntervals[i] = 7;
                            setPerTonosVoiceIntervals(newIntervals);
                          }}
                          className="text-xs h-6 px-2"
                        >
                          +7
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newIntervals = [...perTonosVoiceIntervals];
                            newIntervals[i] = 12;
                            setPerTonosVoiceIntervals(newIntervals);
                          }}
                          className="text-xs h-6 px-2"
                        >
                          +12
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className="bg-purple-200 dark:bg-purple-800" />

              {/* Modulation Target Display */}
              <div className="space-y-2">
                <Label className="text-sm">Modulation Targets</Label>
                <div className="text-xs text-muted-foreground bg-purple-100/50 dark:bg-purple-900/20 p-3 rounded border border-purple-200 dark:border-purple-700">
                  <div className="space-y-1">
                    <div className="font-medium text-purple-900 dark:text-purple-100">
                      Voice Modulation Plan:
                    </div>
                    <div className="text-purple-800 dark:text-purple-200">
                      • Voice 1 (Leader): Original key
                    </div>
                    {Array.from({ length: numVoices - 1 }, (_, i) => {
                      const voiceNum = i + 2;
                      const interval = perTonosVoiceIntervals[i] || 0;
                      const modulationLabel = interval > 0 ? `+${interval}` : interval;
                      return (
                        <div key={i} className="text-purple-800 dark:text-purple-200">
                          • Voice {voiceNum}: {modulationLabel} semitones ({getKeyModulationName(interval)})
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <Separator />

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={disabled}
        className="w-full gap-2"
        size="lg"
      >
        <Sparkles className="w-4 h-4" />
        Generate {selectedCanonInfo?.name}
      </Button>

      {/* Info Panel */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <div className="text-xs space-y-2">
          <div>
            <strong className="text-indigo-900 dark:text-indigo-100">What is a {selectedCanonInfo?.name}?</strong>
          </div>
          <p className="text-indigo-800 dark:text-indigo-200">
            {selectedCanonInfo?.description}
          </p>
          <div className="mt-2 space-y-1 text-indigo-700 dark:text-indigo-300">
            <div>• Uses your current theme as the leader voice</div>
            <div>• Preserves modal relationships from your selected mode</div>
            <div>• All voices playable with individual instrument controls</div>
            {selectedType === 'FRAGMENTAL_CANON' && (
              <div className="mt-2 text-amber-700 dark:text-amber-300">
                ⚠️ Requires minimum 7 notes in theme
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
