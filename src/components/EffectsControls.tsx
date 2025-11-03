import { useState } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  Volume2, 
  Waves, 
  Zap, 
  Headphones, 
  Radio, 
  Settings2,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { EffectsSettings, DEFAULT_EFFECTS } from '../lib/audio-effects-engine';

interface EffectsControlsProps {
  settings: EffectsSettings;
  onSettingsChange: (settings: Partial<EffectsSettings>) => void;
  onReset?: () => void;
}

export function EffectsControls({ settings, onSettingsChange, onReset }: EffectsControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateReverbSettings = (updates: Partial<EffectsSettings['reverb']>) => {
    onSettingsChange({
      reverb: { ...settings.reverb, ...updates }
    });
  };

  const updateDelaySettings = (updates: Partial<EffectsSettings['delay']>) => {
    onSettingsChange({
      delay: { ...settings.delay, ...updates }
    });
  };

  const updateEQSettings = (updates: Partial<EffectsSettings['eq']>) => {
    onSettingsChange({
      eq: { ...settings.eq, ...updates }
    });
  };

  const updateStereoSettings = (updates: Partial<EffectsSettings['stereo']>) => {
    onSettingsChange({
      stereo: { ...settings.stereo, ...updates }
    });
  };

  const updateChorusSettings = (updates: Partial<EffectsSettings['chorus']>) => {
    onSettingsChange({
      chorus: { ...settings.chorus, ...updates }
    });
  };

  const updateCompressorSettings = (updates: Partial<EffectsSettings['compressor']>) => {
    onSettingsChange({
      compressor: { ...settings.compressor, ...updates }
    });
  };

  const resetToDefaults = () => {
    onSettingsChange(DEFAULT_EFFECTS);
    if (onReset) onReset();
  };

  const getActiveEffectsCount = () => {
    let count = 0;
    if (settings.reverb.enabled) count++;
    if (settings.delay.enabled) count++;
    if (settings.eq.enabled) count++;
    if (settings.stereo.enabled) count++;
    if (settings.chorus.enabled) count++;
    if (settings.compressor.enabled) count++;
    return count;
  };

  if (!isExpanded) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            <Label className="font-medium">Audio Effects</Label>
            <Badge variant="outline" className="text-xs">
              {getActiveEffectsCount()} active
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(true)}
          >
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5" />
          <h3>Audio Effects</h3>
          <Badge variant="outline" className="text-xs">
            {getActiveEffectsCount()} active
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            Collapse
          </Button>
        </div>
      </div>

      <Tabs defaultValue="spatial" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="spatial" className="gap-1">
            <Headphones className="w-3 h-3" />
            Spatial
          </TabsTrigger>
          <TabsTrigger value="dynamics" className="gap-1">
            <Volume2 className="w-3 h-3" />
            Dynamics
          </TabsTrigger>
          <TabsTrigger value="modulation" className="gap-1">
            <Waves className="w-3 h-3" />
            Modulation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spatial" className="space-y-6 mt-4">
          {/* Reverb */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Reverb</Label>
              <Switch
                checked={settings.reverb.enabled}
                onCheckedChange={(enabled) => updateReverbSettings({ enabled })}
              />
            </div>
            
            {settings.reverb.enabled && (
              <div className="space-y-3 ml-4">
                <div className="space-y-2">
                  <Label className="text-sm">Room Size: {Math.round(settings.reverb.roomSize * 100)}%</Label>
                  <Slider
                    value={[settings.reverb.roomSize]}
                    onValueChange={([value]) => updateReverbSettings({ roomSize: value })}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Dampening: {Math.round(settings.reverb.dampening * 100)}%</Label>
                  <Slider
                    value={[settings.reverb.dampening]}
                    onValueChange={([value]) => updateReverbSettings({ dampening: value })}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Wet Level: {Math.round(settings.reverb.wetLevel * 100)}%</Label>
                  <Slider
                    value={[settings.reverb.wetLevel]}
                    onValueChange={([value]) => updateReverbSettings({ wetLevel: value })}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Delay */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Delay</Label>
              <Switch
                checked={settings.delay.enabled}
                onCheckedChange={(enabled) => updateDelaySettings({ enabled })}
              />
            </div>
            
            {settings.delay.enabled && (
              <div className="space-y-3 ml-4">
                <div className="space-y-2">
                  <Label className="text-sm">Time: {Math.round(settings.delay.time * 1000)}ms</Label>
                  <Slider
                    value={[settings.delay.time]}
                    onValueChange={([value]) => updateDelaySettings({ time: value })}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Feedback: {Math.round(settings.delay.feedback * 100)}%</Label>
                  <Slider
                    value={[settings.delay.feedback]}
                    onValueChange={([value]) => updateDelaySettings({ feedback: value })}
                    max={0.95}
                    step={0.01}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Wet Level: {Math.round(settings.delay.wetLevel * 100)}%</Label>
                  <Slider
                    value={[settings.delay.wetLevel]}
                    onValueChange={([value]) => updateDelaySettings({ wetLevel: value })}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Stereo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Stereo Enhancement</Label>
              <Switch
                checked={settings.stereo.enabled}
                onCheckedChange={(enabled) => updateStereoSettings({ enabled })}
              />
            </div>
            
            {settings.stereo.enabled && (
              <div className="space-y-3 ml-4">
                <div className="space-y-2">
                  <Label className="text-sm">Width: {Math.round(settings.stereo.width * 100)}%</Label>
                  <Slider
                    value={[settings.stereo.width]}
                    onValueChange={([value]) => updateStereoSettings({ width: value })}
                    min={0}
                    max={2}
                    step={0.01}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Pan: {settings.stereo.pan > 0 ? 'R' : settings.stereo.pan < 0 ? 'L' : 'C'}{Math.abs(Math.round(settings.stereo.pan * 100))}</Label>
                  <Slider
                    value={[settings.stereo.pan]}
                    onValueChange={([value]) => updateStereoSettings({ pan: value })}
                    min={-1}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="dynamics" className="space-y-6 mt-4">
          {/* EQ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-medium">3-Band Equalizer</Label>
              <Switch
                checked={settings.eq.enabled}
                onCheckedChange={(enabled) => updateEQSettings({ enabled })}
              />
            </div>
            
            {settings.eq.enabled && (
              <div className="space-y-3 ml-4">
                <div className="space-y-2">
                  <Label className="text-sm">Low Gain: {settings.eq.lowGain > 0 ? '+' : ''}{settings.eq.lowGain.toFixed(1)}dB</Label>
                  <Slider
                    value={[settings.eq.lowGain]}
                    onValueChange={([value]) => updateEQSettings({ lowGain: value })}
                    min={-20}
                    max={20}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Mid Gain: {settings.eq.midGain > 0 ? '+' : ''}{settings.eq.midGain.toFixed(1)}dB</Label>
                  <Slider
                    value={[settings.eq.midGain]}
                    onValueChange={([value]) => updateEQSettings({ midGain: value })}
                    min={-20}
                    max={20}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">High Gain: {settings.eq.highGain > 0 ? '+' : ''}{settings.eq.highGain.toFixed(1)}dB</Label>
                  <Slider
                    value={[settings.eq.highGain]}
                    onValueChange={([value]) => updateEQSettings({ highGain: value })}
                    min={-20}
                    max={20}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Compressor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Compressor</Label>
              <Switch
                checked={settings.compressor.enabled}
                onCheckedChange={(enabled) => updateCompressorSettings({ enabled })}
              />
            </div>
            
            {settings.compressor.enabled && (
              <div className="space-y-3 ml-4">
                <div className="space-y-2">
                  <Label className="text-sm">Threshold: {settings.compressor.threshold.toFixed(1)}dB</Label>
                  <Slider
                    value={[settings.compressor.threshold]}
                    onValueChange={([value]) => updateCompressorSettings({ threshold: value })}
                    min={-60}
                    max={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Ratio: {settings.compressor.ratio.toFixed(1)}:1</Label>
                  <Slider
                    value={[settings.compressor.ratio]}
                    onValueChange={([value]) => updateCompressorSettings({ ratio: value })}
                    min={1}
                    max={20}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Attack: {Math.round(settings.compressor.attack * 1000)}ms</Label>
                  <Slider
                    value={[settings.compressor.attack]}
                    onValueChange={([value]) => updateCompressorSettings({ attack: value })}
                    min={0}
                    max={1}
                    step={0.001}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Release: {Math.round(settings.compressor.release * 1000)}ms</Label>
                  <Slider
                    value={[settings.compressor.release]}
                    onValueChange={([value]) => updateCompressorSettings({ release: value })}
                    min={0}
                    max={3}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="modulation" className="space-y-6 mt-4">
          {/* Chorus */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Chorus</Label>
              <Switch
                checked={settings.chorus.enabled}
                onCheckedChange={(enabled) => updateChorusSettings({ enabled })}
              />
            </div>
            
            {settings.chorus.enabled && (
              <div className="space-y-3 ml-4">
                <div className="space-y-2">
                  <Label className="text-sm">Rate: {settings.chorus.rate.toFixed(1)}Hz</Label>
                  <Slider
                    value={[settings.chorus.rate]}
                    onValueChange={([value]) => updateChorusSettings({ rate: value })}
                    min={0.1}
                    max={10}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Depth: {Math.round(settings.chorus.depth * 100)}%</Label>
                  <Slider
                    value={[settings.chorus.depth]}
                    onValueChange={([value]) => updateChorusSettings({ depth: value })}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Wet Level: {Math.round(settings.chorus.wetLevel * 100)}%</Label>
                  <Slider
                    value={[settings.chorus.wetLevel]}
                    onValueChange={([value]) => updateChorusSettings({ wetLevel: value })}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}