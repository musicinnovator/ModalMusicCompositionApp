import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Layers, Sparkles, Music4, Settings2 } from 'lucide-react';
import { FugueParams, FugueArchitecture } from '../lib/fugue-builder-engine';
import { Theme, MidiNote } from '../types/musical';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';

interface FugueGeneratorControlsProps {
  onGenerate: (params: FugueParams) => void;
  disabled?: boolean;
  currentTheme?: Theme;
  keySignature?: MidiNote;
}

const ARCHITECTURE_OPTIONS: { value: FugueArchitecture; label: string; description: string }[] = [
  { value: 'CLASSIC_2', label: '2-Part Fugue', description: 'Two-voice dialogue' },
  { value: 'CLASSIC_3', label: '3-Part Fugue', description: 'Trio with countersubject' },
  { value: 'CLASSIC_4', label: '4-Part Fugue (SATB)', description: 'Full choral range' },
  { value: 'CLASSIC_5', label: '5-Part Fugue', description: 'Grand polyphony' },
  { value: 'ADDITIVE', label: 'Additive Fugue', description: 'Voices gradually added' },
  { value: 'SUBTRACTIVE', label: 'Subtractive Fugue', description: 'Voices gradually removed' },
  { value: 'ROTATIONAL', label: 'Rotational Fugue', description: 'Voices cycle roles' },
  { value: 'MIRROR', label: 'Mirror Fugue', description: 'Symmetric inversions' },
  { value: 'HOCKETED', label: 'Hocketed Fugue', description: 'Interlocking notes' },
  { value: 'POLYRHYTHMIC', label: 'Polyrhythmic Fugue', description: 'Multiple meters' },
  { value: 'RECURSIVE', label: 'Recursive Fugue', description: 'Self-similar structure' },
  { value: 'META', label: 'Meta-Fugue', description: 'Fugue of fugues' },
  { value: 'SPATIAL', label: 'Spatial Fugue', description: '3D positioning' },
  { value: 'ADAPTIVE', label: 'Adaptive Fugue', description: 'Real-time transformation' },
];

export function FugueGeneratorControls({
  onGenerate,
  disabled,
  currentTheme,
  keySignature
}: FugueGeneratorControlsProps) {
  const [architecture, setArchitecture] = useState<FugueArchitecture>('CLASSIC_3');
  const [numVoices, setNumVoices] = useState(3);
  const [entryInterval, setEntryInterval] = useState(7); // Fifth
  const [entrySpacing, setEntrySpacing] = useState(4); // 4 beats
  const [applyCounterSubject, setApplyCounterSubject] = useState(true);
  const [strettoDensity, setStrettoDensity] = useState(0.5);
  const [totalMeasures, setTotalMeasures] = useState(24);
  // 12 Transformation types
  const [addInversion, setAddInversion] = useState(false);
  const [addRetrograde, setAddRetrograde] = useState(false);
  const [addAugmentation, setAddAugmentation] = useState(false);
  const [addDiminution, setAddDiminution] = useState(false);
  const [addTruncation, setAddTruncation] = useState(false);
  const [addElision, setAddElision] = useState(false);
  const [addFragmentation, setAddFragmentation] = useState(false);
  const [addSequence, setAddSequence] = useState(false);
  const [addOrnamentation, setAddOrnamentation] = useState(false);
  const [addTransposition, setAddTransposition] = useState(false);
  const [addModeShifting, setAddModeShifting] = useState(false);
  const [addChromatic, setAddChromatic] = useState(false);

  const handleGenerate = () => {
    // Safety check: ensure currentTheme is valid before generating
    if (!currentTheme || currentTheme.length === 0) {
      console.warn('Cannot generate fugue: no theme available');
      return;
    }

    const params: FugueParams = {
      architecture,
      numVoices,
      subject: currentTheme,
      entryInterval,
      entrySpacing,
      applyCounterSubject,
      strettoDensity,
      totalMeasures,
      key: keySignature ?? 0,
      variations: [
        ...(addInversion ? [{ type: 'INVERTED' as const, scope: 'subject' as const }] : []),
        ...(addRetrograde ? [{ type: 'RETROGRADE' as const, scope: 'all' as const }] : []),
        ...(addAugmentation ? [{ type: 'AUGMENTED' as const, scope: 'answer' as const, factor: 2 }] : []),
        ...(addDiminution ? [{ type: 'DIMINUTION' as const, scope: 'all' as const, factor: 2 }] : []),
        ...(addTruncation ? [{ type: 'TRUNCATION' as const, scope: 'subject' as const }] : []),
        ...(addElision ? [{ type: 'ELISION' as const, scope: 'all' as const }] : []),
        ...(addFragmentation ? [{ type: 'FRAGMENTATION' as const, scope: 'subject' as const }] : []),
        ...(addSequence ? [{ type: 'SEQUENCE' as const, scope: 'all' as const, sequenceSteps: [0, 2, 4, 2, 0] }] : []),
        ...(addOrnamentation ? [{ type: 'ORNAMENTATION' as const, scope: 'all' as const, ornamentStyle: 'neighbor' }] : []),
        ...(addTransposition ? [{ type: 'TRANSPOSITION' as const, scope: 'answer' as const, factor: 7 }] : []),
        ...(addModeShifting ? [{ type: 'MODE_SHIFTING' as const, scope: 'all' as const }] : []),
        ...(addChromatic ? [{ type: 'CHROMATIC' as const, scope: 'all' as const }] : []),
      ]
    };

    onGenerate(params);
  };

  const selectedArchInfo = ARCHITECTURE_OPTIONS.find(opt => opt.value === architecture);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold">Fugue Generator</h3>
        </div>
        <Badge variant="outline" className="gap-1">
          <Sparkles className="w-3 h-3" />
          14 Types
        </Badge>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="basic" className="gap-1 text-xs">
            <Settings2 className="w-3 h-3" />
            Basic
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-1 text-xs">
            <Music4 className="w-3 h-3" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-0">
          {/* Architecture Selection */}
          <div className="space-y-2">
            <Label>Fugue Type</Label>
            <Select value={architecture} onValueChange={(value) => setArchitecture(value as FugueArchitecture)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ARCHITECTURE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedArchInfo && (
              <p className="text-xs text-muted-foreground">
                {selectedArchInfo.description}
              </p>
            )}
          </div>

          {/* Number of Voices */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Number of Voices</Label>
              <Badge variant="secondary">{numVoices}</Badge>
            </div>
            <Slider
              value={[numVoices]}
              onValueChange={([value]) => setNumVoices(value)}
              min={2}
              max={8}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2 (Duo)</span>
              <span>8 (Complex)</span>
            </div>
          </div>

          {/* Entry Interval */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Entry Interval</Label>
              <Badge variant="secondary">
                {entryInterval === 0 ? 'Unison' : 
                 entryInterval === 5 ? 'Fourth (P4)' :
                 entryInterval === 7 ? 'Fifth (P5)' :
                 entryInterval === 12 ? 'Octave (P8)' :
                 `${entryInterval} semitones`}
              </Badge>
            </div>
            <Slider
              value={[entryInterval]}
              onValueChange={([value]) => setEntryInterval(value)}
              min={0}
              max={12}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Unison</span>
              <span>Octave</span>
            </div>
          </div>

          {/* Entry Spacing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Entry Spacing</Label>
              <Badge variant="secondary">{entrySpacing} beats</Badge>
            </div>
            <Slider
              value={[entrySpacing]}
              onValueChange={([value]) => setEntrySpacing(value)}
              min={1}
              max={8}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 beat</span>
              <span>8 beats</span>
            </div>
          </div>

          {/* Countersubject */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <Label htmlFor="countersubject">Apply Countersubject</Label>
              <p className="text-xs text-muted-foreground">
                Add complementary melodic lines
              </p>
            </div>
            <Switch
              id="countersubject"
              checked={applyCounterSubject}
              onCheckedChange={setApplyCounterSubject}
            />
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-0">
          {/* Total Measures */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Total Measures</Label>
              <Badge variant="secondary">{totalMeasures} measures</Badge>
            </div>
            <Slider
              value={[totalMeasures]}
              onValueChange={([value]) => setTotalMeasures(value)}
              min={8}
              max={48}
              step={4}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>8 (Short)</span>
              <span>48 (Extended)</span>
            </div>
          </div>

          {/* Stretto Density */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Stretto Density</Label>
              <Badge variant="secondary">{Math.round(strettoDensity * 100)}%</Badge>
            </div>
            <Slider
              value={[strettoDensity * 100]}
              onValueChange={([value]) => setStrettoDensity(value / 100)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>None</span>
              <span>Maximum</span>
            </div>
          </div>

          <Separator />

          {/* Transformations - 12 Types */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Transformations</Label>
              <Badge variant="secondary" className="text-xs">12 Types Available</Badge>
            </div>
            
            {/* Row 1: Inversion, Retrograde, Augmentation */}
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <Label htmlFor="inversion" className="text-sm">Inversion</Label>
                  <p className="text-xs text-muted-foreground">Mirror intervals</p>
                </div>
                <Switch id="inversion" checked={addInversion} onCheckedChange={setAddInversion} />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <Label htmlFor="retrograde" className="text-sm">Retrograde</Label>
                  <p className="text-xs text-muted-foreground">Play backward</p>
                </div>
                <Switch id="retrograde" checked={addRetrograde} onCheckedChange={setAddRetrograde} />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <Label htmlFor="augmentation" className="text-sm">Augmentation</Label>
                  <p className="text-xs text-muted-foreground">2x note values</p>
                </div>
                <Switch id="augmentation" checked={addAugmentation} onCheckedChange={setAddAugmentation} />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <Label htmlFor="diminution" className="text-sm">Diminution</Label>
                  <p className="text-xs text-muted-foreground">½x note values</p>
                </div>
                <Switch id="diminution" checked={addDiminution} onCheckedChange={setAddDiminution} />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <Label htmlFor="truncation" className="text-sm">Truncation</Label>
                  <p className="text-xs text-muted-foreground">Shorten theme</p>
                </div>
                <Switch id="truncation" checked={addTruncation} onCheckedChange={setAddTruncation} />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <Label htmlFor="elision" className="text-sm">Elision</Label>
                  <p className="text-xs text-muted-foreground">Connect head & tail</p>
                </div>
                <Switch id="elision" checked={addElision} onCheckedChange={setAddElision} />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <Label htmlFor="fragmentation" className="text-sm">Fragmentation</Label>
                  <p className="text-xs text-muted-foreground">Extract motif</p>
                </div>
                <Switch id="fragmentation" checked={addFragmentation} onCheckedChange={setAddFragmentation} />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <Label htmlFor="sequence" className="text-sm">Sequence</Label>
                  <p className="text-xs text-muted-foreground">Repeat at steps</p>
                </div>
                <Switch id="sequence" checked={addSequence} onCheckedChange={setAddSequence} />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <Label htmlFor="ornamentation" className="text-sm">Ornamentation</Label>
                  <p className="text-xs text-muted-foreground">Add decorations</p>
                </div>
                <Switch id="ornamentation" checked={addOrnamentation} onCheckedChange={setAddOrnamentation} />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <Label htmlFor="transposition" className="text-sm">Transposition</Label>
                  <p className="text-xs text-muted-foreground">Shift pitch level</p>
                </div>
                <Switch id="transposition" checked={addTransposition} onCheckedChange={setAddTransposition} />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <Label htmlFor="modeShifting" className="text-sm">Mode Shifting</Label>
                  <p className="text-xs text-muted-foreground">Change to new mode</p>
                </div>
                <Switch id="modeShifting" checked={addModeShifting} onCheckedChange={setAddModeShifting} />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <Label htmlFor="chromatic" className="text-sm">Chromatic</Label>
                  <p className="text-xs text-muted-foreground">Add passing tones</p>
                </div>
                <Switch id="chromatic" checked={addChromatic} onCheckedChange={setAddChromatic} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button
        onClick={handleGenerate}
        disabled={disabled || !currentTheme || (currentTheme && currentTheme.length === 0)}
        className="w-full mt-4 gap-2"
      >
        <Layers className="w-4 h-4" />
        Generate Fugue
      </Button>

      <div className="text-xs text-muted-foreground mt-3 p-2 bg-muted/30 rounded">
        <strong>AI Hint:</strong> {architecture === 'CLASSIC_2' ? 'Simple two-voice dialogue with clear subject/answer structure' :
                                    architecture === 'CLASSIC_3' ? 'Three voices with countersubject and episodes' :
                                    architecture === 'CLASSIC_4' ? 'Full SATB with complex stretto and development' :
                                    architecture === 'POLYRHYTHMIC' ? 'Multiple simultaneous meters aligned at key points' :
                                    'Experimental fugue structure with advanced techniques'}
      </div>
    </Card>
  );
}
