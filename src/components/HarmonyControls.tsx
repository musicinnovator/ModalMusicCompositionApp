/**
 * HARMONY CONTROLS COMPONENT
 * 
 * User interface for the Harmonic Engine Suite
 * Provides comprehensive control over harmonization parameters
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Music2, Sparkles, Settings2, Wand2 } from 'lucide-react';
import {
  HarmonyParams,
  ChordQuality,
  VoicingStyle,
  HarmonicDensity,
  HarmonicComplexity,
  KeyCenter,
  BrokenVariation,
  ArpeggiatedVariation,
  AlbertiVariation,
  WaltzVariation,
  RollingVariation,
  StrideVariation,
  TremoloVariation,
  SustainedVariation,
  StaccatoVariation
} from '../lib/harmony-engine';

interface HarmonyControlsProps {
  params: HarmonyParams;
  onParamsChange: (params: HarmonyParams) => void;
  onHarmonize: () => void;
  isProcessing?: boolean;
}

export function HarmonyControls({
  params,
  onParamsChange,
  onHarmonize,
  isProcessing = false
}: HarmonyControlsProps) {
  const [useCustomProgression, setUseCustomProgression] = useState(false);

  const updateParam = <K extends keyof HarmonyParams>(
    key: K,
    value: HarmonyParams[K]
  ) => {
    onParamsChange({ ...params, [key]: value });
  };

  return (
    <Card className="p-5 space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music2 className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold">Harmonic Engine Suite</h3>
          <Badge variant="secondary" className="text-xs">
            Professional Harmonization
          </Badge>
        </div>
        
        <Button
          onClick={onHarmonize}
          disabled={isProcessing}
          className="gap-2 whitespace-normal min-w-fit"
          size="sm"
        >
          <Wand2 className="w-4 h-4 shrink-0" />
          <span className="break-words">{isProcessing ? 'Harmonizing...' : 'Harmonize'}</span>
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={['basic', 'voicing']} className="w-full">
        {/* Basic Settings */}
        <AccordionItem value="basic">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Basic Harmony Settings
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {/* Key Center */}
            <div className="space-y-2">
              <Label className="text-xs">Key Center Detection</Label>
              <Select
                value={params.keyCenter}
                onValueChange={(value) => updateParam('keyCenter', value as KeyCenter)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">🔍 Automatic (Detect from melody)</SelectItem>
                  <SelectItem value="major">🎵 Force Major Key</SelectItem>
                  <SelectItem value="minor">🎵 Force Minor Key</SelectItem>
                  <SelectItem value="modal">🎭 Use Selected Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Key Center Bias */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center justify-between">
                <span>Key Preference</span>
                <span className="text-muted-foreground">
                  {params.keyCenterBias === undefined ? 'Neutral' :
                   params.keyCenterBias < 0 ? `♭ Flats (${Math.abs(params.keyCenterBias).toFixed(1)})` :
                   params.keyCenterBias > 0 ? `♯ Sharps (${params.keyCenterBias.toFixed(1)})` :
                   'Neutral'}
                </span>
              </Label>
              <Slider
                value={[params.keyCenterBias || 0]}
                onValueChange={([value]) => updateParam('keyCenterBias', value)}
                min={-1}
                max={1}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>♭ Prefer Flats</span>
                <span>♯ Prefer Sharps</span>
              </div>
            </div>

            {/* Complexity */}
            <div className="space-y-2">
              <Label className="text-xs">Harmonic Complexity</Label>
              <Select
                value={params.complexity}
                onValueChange={(value) => updateParam('complexity', value as HarmonicComplexity)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (Triads: M, m, dim, aug)</SelectItem>
                  <SelectItem value="seventh">7th Chords (M7, m7, dom7)</SelectItem>
                  <SelectItem value="ninth">9th Chords (M9, m9, dom9)</SelectItem>
                  <SelectItem value="eleventh">11th Chords (M11, m11)</SelectItem>
                  <SelectItem value="thirteenth">13th Chords (M13, m13)</SelectItem>
                  <SelectItem value="extended">Extended (sus, add9, 6)</SelectItem>
                  <SelectItem value="altered">Altered (7#9, 7b9, 7#5, alt)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Density */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center justify-between">
                <span>Chord Density</span>
                <span className="text-muted-foreground">{params.density} notes</span>
              </Label>
              <Slider
                value={[params.density]}
                onValueChange={([value]) => updateParam('density', value as HarmonicDensity)}
                min={3}
                max={7}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Sparse (3)</span>
                <span>Dense (7)</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Voicing Style */}
        <AccordionItem value="voicing">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Voicing & Articulation
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {/* Voicing Style */}
            <div className="space-y-2">
              <Label className="text-xs">Voicing Style</Label>
              <Select
                value={params.voicingStyle}
                onValueChange={(value) => updateParam('voicingStyle', value as VoicingStyle)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">🎹 Block (All notes together)</SelectItem>
                  <SelectItem value="broken">🎵 Broken (Partial sequence)</SelectItem>
                  <SelectItem value="arpeggiated">🎸 Arpeggiated (Full arpeggio)</SelectItem>
                  <SelectItem value="alberti">🎼 Alberti Bass</SelectItem>
                  <SelectItem value="waltz">💃 Waltz Pattern</SelectItem>
                  <SelectItem value="rolling">🌊 Rolling</SelectItem>
                  <SelectItem value="stride">🎹 Stride Piano</SelectItem>
                  <SelectItem value="tremolo">⚡ Tremolo</SelectItem>
                  <SelectItem value="sustained">🎻 Sustained</SelectItem>
                  <SelectItem value="staccato">• Staccato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Voicing Preferences */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Prefer Closed Voicing</Label>
                <Switch
                  checked={params.preferClosedVoicing || false}
                  onCheckedChange={(checked) => updateParam('preferClosedVoicing', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Allow Inversions</Label>
                <Switch
                  checked={params.allowInversions !== false}
                  onCheckedChange={(checked) => updateParam('allowInversions', checked)}
                />
              </div>
            </div>

            {/* Doubling Preference */}
            <div className="space-y-2">
              <Label className="text-xs">Note Doubling Priority</Label>
              <Select
                value={params.doublingPreference || 'balanced'}
                onValueChange={(value) => updateParam('doublingPreference', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">⚖️ Balanced</SelectItem>
                  <SelectItem value="root">1️⃣ Emphasize Root</SelectItem>
                  <SelectItem value="third">3️⃣ Emphasize Third</SelectItem>
                  <SelectItem value="fifth">5️⃣ Emphasize Fifth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Advanced Settings */}
        <AccordionItem value="advanced">
          <AccordionTrigger className="text-sm font-medium">
            Advanced Options
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {/* Orchestral Range */}
            <div className="space-y-2">
              <Label className="text-xs">Orchestral Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Lowest Note</Label>
                  <Select
                    value={String(params.lowestNote || 36)}
                    onValueChange={(value) => updateParam('lowestNote', Number(value) as MidiNote)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="28">E1 (Double Bass)</SelectItem>
                      <SelectItem value="36">C2 (Cello)</SelectItem>
                      <SelectItem value="48">C3 (Viola)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Highest Note</Label>
                  <Select
                    value={String(params.highestNote || 84)}
                    onValueChange={(value) => updateParam('highestNote', Number(value) as MidiNote)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="72">C5 (Cello high)</SelectItem>
                      <SelectItem value="84">C6 (Viola/Violin)</SelectItem>
                      <SelectItem value="103">G6 (Violin high)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Explicit Chord Quality */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Explicit Chord Quality</Label>
                <Switch
                  checked={params.quality !== undefined}
                  onCheckedChange={(checked) => {
                    if (!checked) {
                      updateParam('quality', undefined);
                    } else {
                      updateParam('quality', 'M');
                    }
                  }}
                />
              </div>
              
              {params.quality !== undefined && (
                <Select
                  value={params.quality}
                  onValueChange={(value) => updateParam('quality', value as ChordQuality)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="M">Major</SelectItem>
                    <SelectItem value="m">Minor</SelectItem>
                    <SelectItem value="dim">Diminished</SelectItem>
                    <SelectItem value="aug">Augmented</SelectItem>
                    <SelectItem value="sus2">Sus2</SelectItem>
                    <SelectItem value="sus4">Sus4</SelectItem>
                    <SelectItem value="M7">Major 7th</SelectItem>
                    <SelectItem value="m7">Minor 7th</SelectItem>
                    <SelectItem value="dom7">Dominant 7th</SelectItem>
                    <SelectItem value="dim7">Diminished 7th</SelectItem>
                    <SelectItem value="hdim7">Half-Diminished 7th</SelectItem>
                    <SelectItem value="mM7">Minor-Major 7th</SelectItem>
                    <SelectItem value="M9">Major 9th</SelectItem>
                    <SelectItem value="m9">Minor 9th</SelectItem>
                    <SelectItem value="dom9">Dominant 9th</SelectItem>
                    <SelectItem value="M11">Major 11th</SelectItem>
                    <SelectItem value="m11">Minor 11th</SelectItem>
                    <SelectItem value="dom11">Dominant 11th</SelectItem>
                    <SelectItem value="M13">Major 13th</SelectItem>
                    <SelectItem value="m13">Minor 13th</SelectItem>
                    <SelectItem value="dom13">Dominant 13th</SelectItem>
                    <SelectItem value="7#9">7#9 (Hendrix)</SelectItem>
                    <SelectItem value="7b9">7b9</SelectItem>
                    <SelectItem value="7#5">7#5</SelectItem>
                    <SelectItem value="7b5">7b5</SelectItem>
                    <SelectItem value="7#11">7#11 (Lydian)</SelectItem>
                    <SelectItem value="alt">Altered</SelectItem>
                    <SelectItem value="add9">Add 9</SelectItem>
                    <SelectItem value="6">Major 6th</SelectItem>
                    <SelectItem value="m6">Minor 6th</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Quick Presets */}
      <div className="pt-2 space-y-2">
        <Label className="text-xs text-muted-foreground">Quick Presets</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onParamsChange({
                ...params,
                complexity: 'basic',
                density: 3,
                voicingStyle: 'block'
              });
            }}
            className="text-xs"
          >
            Simple
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onParamsChange({
                ...params,
                complexity: 'seventh',
                density: 4,
                voicingStyle: 'arpeggiated'
              });
            }}
            className="text-xs"
          >
            Jazz
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onParamsChange({
                ...params,
                complexity: 'altered',
                density: 7,
                voicingStyle: 'rolling'
              });
            }}
            className="text-xs"
          >
            Complex
          </Button>
        </div>
      </div>
    </Card>
  );
}
