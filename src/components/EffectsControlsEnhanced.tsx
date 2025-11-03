import { useState, useEffect, useRef } from 'react';
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
  Sliders,
  Power,
  Info
} from 'lucide-react';
import { EffectsSettings, DEFAULT_EFFECTS } from '../lib/audio-effects-engine';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface EffectsControlsEnhancedProps {
  settings: EffectsSettings;
  onSettingsChange: (settings: Partial<EffectsSettings>) => void;
  onReset?: () => void;
  audioLevel?: number; // 0-1 for audio-reactive feedback
  tempo?: number; // BPM for tempo-synced effects
  immersiveMode?: boolean; // Toggle for reduced motion
}

// Particle effect for spatial visualization
const ParticleField = ({ intensity = 0, color = 'cyan' }: { intensity: number; color: string }) => {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: i * 0.15,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute w-1 h-1 rounded-full bg-${color}-400`}
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: '100%', 
            opacity: 0,
            scale: 0 
          }}
          animate={{ 
            y: '-20%', 
            opacity: [0, intensity, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
};

// Waveform visualization for modulation
const WaveformRing = ({ rate = 1, depth = 0.5, color = 'emerald' }: { rate: number; depth: number; color: string }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
      <motion.div
        className={`w-24 h-24 rounded-full border-2 border-${color}-400`}
        animate={{
          scale: [1, 1 + depth * 0.3, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 1 / rate,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.div
        className={`absolute w-20 h-20 rounded-full border-2 border-${color}-300`}
        animate={{
          scale: [1 + depth * 0.2, 1, 1 + depth * 0.2],
          opacity: [0.6, 0.3, 0.6],
        }}
        transition={{
          duration: 1 / rate,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.2
        }}
      />
    </div>
  );
};

// Gain reduction meter for dynamics
const GainReductionMeter = ({ level = 0, color = 'amber' }: { level: number; color: string }) => {
  const meterRef = useRef<HTMLDivElement>(null);
  const [peakHold, setPeakHold] = useState(0);

  useEffect(() => {
    if (level > peakHold) {
      setPeakHold(level);
      setTimeout(() => setPeakHold(0), 1000);
    }
  }, [level]);

  return (
    <div className="h-2 bg-muted/30 rounded-full overflow-hidden relative">
      <motion.div
        className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-600`}
        initial={{ width: 0 }}
        animate={{ width: `${level * 100}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
      {peakHold > 0 && (
        <motion.div
          className={`absolute top-0 h-full w-0.5 bg-${color}-300`}
          initial={{ left: `${peakHold * 100}%`, opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1 }}
        />
      )}
    </div>
  );
};

export function EffectsControlsEnhanced({ 
  settings, 
  onSettingsChange, 
  onReset,
  audioLevel = 0,
  tempo = 120,
  immersiveMode = true
}: EffectsControlsEnhancedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'spatial' | 'dynamics' | 'modulation'>('spatial');
  const [hoveredControl, setHoveredControl] = useState<string | null>(null);

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

  // Theme colors for each module
  const moduleColors = {
    spatial: {
      primary: 'cyan',
      secondary: 'violet',
      gradient: 'from-cyan-500/20 to-violet-500/20'
    },
    dynamics: {
      primary: 'amber',
      secondary: 'red',
      gradient: 'from-amber-500/20 to-red-500/20'
    },
    modulation: {
      primary: 'emerald',
      secondary: 'teal',
      gradient: 'from-emerald-500/20 to-teal-500/20'
    }
  };

  const currentModuleColor = moduleColors[activeTab];

  if (!isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-4 glass-panel elevation-low hover-lift transition-smooth">
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
              className="hover-lift"
            >
              <Settings2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="p-6 glass-panel elevation-medium relative overflow-hidden">
        {/* Ambient background glow based on active module */}
        {immersiveMode && (
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${currentModuleColor.gradient} pointer-events-none`}
            animate={{
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}

        {/* Audio-reactive pulse */}
        {immersiveMode && audioLevel > 0.5 && (
          <motion.div
            className="absolute inset-0 border-2 border-indigo-500/30 rounded-lg pointer-events-none"
            animate={{
              opacity: [0, audioLevel, 0],
            }}
            transition={{
              duration: 0.3,
              ease: 'easeOut'
            }}
          />
        )}

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
              >
                <Sliders className="w-5 h-5" />
              </motion.div>
              <h3>Audio Effects Suite</h3>
              <Badge 
                variant={getActiveEffectsCount() > 0 ? 'default' : 'outline'} 
                className={`text-xs transition-smooth ${getActiveEffectsCount() > 0 ? 'glow-primary' : ''}`}
              >
                {getActiveEffectsCount()} active
              </Badge>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetToDefaults}
                      className="gap-2 hover-lift"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset all effects to default settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="hover-lift"
              >
                Collapse
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass-panel">
              <TabsTrigger 
                value="spatial" 
                className="gap-1 transition-smooth data-[state=active]:glow-primary"
              >
                <Headphones className="w-3 h-3" />
                Spatial
                {(settings.reverb.enabled || settings.delay.enabled || settings.stereo.enabled) && (
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="dynamics" 
                className="gap-1 transition-smooth data-[state=active]:glow-primary"
              >
                <Volume2 className="w-3 h-3" />
                Dynamics
                {(settings.eq.enabled || settings.compressor.enabled) && (
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-amber-400"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="modulation" 
                className="gap-1 transition-smooth data-[state=active]:glow-primary"
              >
                <Waves className="w-3 h-3" />
                Modulation
                {settings.chorus.enabled && (
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </TabsTrigger>
            </TabsList>

            {/* SPATIAL FX TAB */}
            <TabsContent value="spatial" className="space-y-6 mt-4 relative">
              {immersiveMode && settings.reverb.enabled && (
                <ParticleField intensity={settings.reverb.wetLevel} color="cyan" />
              )}

              {/* Reverb Module */}
              <EffectModule
                title="Reverb"
                icon={<Radio className="w-4 h-4" />}
                enabled={settings.reverb.enabled}
                onToggle={(enabled) => updateReverbSettings({ enabled })}
                color="cyan"
                tooltip="Adds spatial depth and room ambience to your sound"
                immersiveMode={immersiveMode}
              >
                <div className="space-y-3 ml-4">
                  <ParameterControl
                    label="Room Size"
                    value={settings.reverb.roomSize}
                    displayValue={`${Math.round(settings.reverb.roomSize * 100)}%`}
                    onChange={(value) => updateReverbSettings({ roomSize: value })}
                    min={0}
                    max={1}
                    step={0.01}
                    color="cyan"
                    onHoverStart={() => setHoveredControl('reverb-size')}
                    onHoverEnd={() => setHoveredControl(null)}
                    tooltip="Controls the size of the virtual room (larger = longer decay)"
                  />
                  
                  <ParameterControl
                    label="Dampening"
                    value={settings.reverb.dampening}
                    displayValue={`${Math.round(settings.reverb.dampening * 100)}%`}
                    onChange={(value) => updateReverbSettings({ dampening: value })}
                    min={0}
                    max={1}
                    step={0.01}
                    color="violet"
                    onHoverStart={() => setHoveredControl('reverb-damp')}
                    onHoverEnd={() => setHoveredControl(null)}
                    tooltip="Reduces high frequencies in the reverb tail for warmth"
                  />
                  
                  <ParameterControl
                    label="Wet Level"
                    value={settings.reverb.wetLevel}
                    displayValue={`${Math.round(settings.reverb.wetLevel * 100)}%`}
                    onChange={(value) => updateReverbSettings({ wetLevel: value })}
                    min={0}
                    max={1}
                    step={0.01}
                    color="cyan"
                    showMeter
                    onHoverStart={() => setHoveredControl('reverb-wet')}
                    onHoverEnd={() => setHoveredControl(null)}
                    tooltip="Mix level of the reverb effect"
                  />
                </div>
              </EffectModule>

              <Separator className="opacity-30" />

              {/* Delay Module */}
              <EffectModule
                title="Delay"
                icon={<Zap className="w-4 h-4" />}
                enabled={settings.delay.enabled}
                onToggle={(enabled) => updateDelaySettings({ enabled })}
                color="violet"
                tooltip="Creates rhythmic echoes and repeats"
                immersiveMode={immersiveMode}
              >
                <div className="space-y-3 ml-4">
                  <ParameterControl
                    label="Time"
                    value={settings.delay.time}
                    displayValue={`${Math.round(settings.delay.time * 1000)}ms`}
                    onChange={(value) => updateDelaySettings({ time: value })}
                    min={0}
                    max={1}
                    step={0.01}
                    color="violet"
                    tooltip="Delay time between echoes"
                  />
                  
                  <ParameterControl
                    label="Feedback"
                    value={settings.delay.feedback}
                    displayValue={`${Math.round(settings.delay.feedback * 100)}%`}
                    onChange={(value) => updateDelaySettings({ feedback: value })}
                    min={0}
                    max={0.95}
                    step={0.01}
                    color="cyan"
                    tooltip="Amount of delay signal fed back for repeated echoes"
                  />
                  
                  <ParameterControl
                    label="Wet Level"
                    value={settings.delay.wetLevel}
                    displayValue={`${Math.round(settings.delay.wetLevel * 100)}%`}
                    onChange={(value) => updateDelaySettings({ wetLevel: value })}
                    min={0}
                    max={1}
                    step={0.01}
                    color="violet"
                    showMeter
                    tooltip="Mix level of the delay effect"
                  />
                </div>
              </EffectModule>

              <Separator className="opacity-30" />

              {/* Stereo Module */}
              <EffectModule
                title="Stereo Enhancement"
                icon={<Headphones className="w-4 h-4" />}
                enabled={settings.stereo.enabled}
                onToggle={(enabled) => updateStereoSettings({ enabled })}
                color="cyan"
                tooltip="Enhances stereo width and controls panning"
                immersiveMode={immersiveMode}
              >
                <div className="space-y-3 ml-4">
                  <ParameterControl
                    label="Width"
                    value={settings.stereo.width}
                    displayValue={`${Math.round(settings.stereo.width * 100)}%`}
                    onChange={(value) => updateStereoSettings({ width: value })}
                    min={0}
                    max={2}
                    step={0.01}
                    color="cyan"
                    tooltip="Stereo width (100% = normal, >100% = enhanced)"
                  />
                  
                  <ParameterControl
                    label="Pan"
                    value={settings.stereo.pan}
                    displayValue={`${settings.stereo.pan > 0 ? 'R' : settings.stereo.pan < 0 ? 'L' : 'C'}${Math.abs(Math.round(settings.stereo.pan * 100))}`}
                    onChange={(value) => updateStereoSettings({ pan: value })}
                    min={-1}
                    max={1}
                    step={0.01}
                    color="violet"
                    tooltip="Left/Right balance (L = left, R = right, C = center)"
                  />
                </div>
              </EffectModule>
            </TabsContent>

            {/* DYNAMICS FX TAB */}
            <TabsContent value="dynamics" className="space-y-6 mt-4 relative">
              {/* EQ Module */}
              <EffectModule
                title="3-Band Equalizer"
                icon={<Sliders className="w-4 h-4" />}
                enabled={settings.eq.enabled}
                onToggle={(enabled) => updateEQSettings({ enabled })}
                color="amber"
                tooltip="Shape the tonal balance with low, mid, and high frequency control"
                immersiveMode={immersiveMode}
              >
                <div className="space-y-3 ml-4">
                  <ParameterControl
                    label="Low Gain"
                    value={settings.eq.lowGain}
                    displayValue={`${settings.eq.lowGain > 0 ? '+' : ''}${settings.eq.lowGain.toFixed(1)}dB`}
                    onChange={(value) => updateEQSettings({ lowGain: value })}
                    min={-20}
                    max={20}
                    step={0.1}
                    color="red"
                    centerZero
                    tooltip="Boost or cut low frequencies (bass)"
                  />
                  
                  <ParameterControl
                    label="Mid Gain"
                    value={settings.eq.midGain}
                    displayValue={`${settings.eq.midGain > 0 ? '+' : ''}${settings.eq.midGain.toFixed(1)}dB`}
                    onChange={(value) => updateEQSettings({ midGain: value })}
                    min={-20}
                    max={20}
                    step={0.1}
                    color="amber"
                    centerZero
                    tooltip="Boost or cut mid frequencies (presence)"
                  />
                  
                  <ParameterControl
                    label="High Gain"
                    value={settings.eq.highGain}
                    displayValue={`${settings.eq.highGain > 0 ? '+' : ''}${settings.eq.highGain.toFixed(1)}dB`}
                    onChange={(value) => updateEQSettings({ highGain: value })}
                    min={-20}
                    max={20}
                    step={0.1}
                    color="yellow"
                    centerZero
                    tooltip="Boost or cut high frequencies (brightness)"
                  />
                </div>
              </EffectModule>

              <Separator className="opacity-30" />

              {/* Compressor Module */}
              <EffectModule
                title="Compressor"
                icon={<Volume2 className="w-4 h-4" />}
                enabled={settings.compressor.enabled}
                onToggle={(enabled) => updateCompressorSettings({ enabled })}
                color="red"
                tooltip="Controls dynamic range for consistent levels"
                immersiveMode={immersiveMode}
              >
                <div className="space-y-3 ml-4">
                  {/* Gain Reduction Meter */}
                  {settings.compressor.enabled && (
                    <div className="mb-4">
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Gain Reduction
                      </Label>
                      <GainReductionMeter level={audioLevel * 0.7} color="amber" />
                    </div>
                  )}

                  <ParameterControl
                    label="Threshold"
                    value={settings.compressor.threshold}
                    displayValue={`${settings.compressor.threshold.toFixed(1)}dB`}
                    onChange={(value) => updateCompressorSettings({ threshold: value })}
                    min={-60}
                    max={0}
                    step={0.1}
                    color="amber"
                    tooltip="Level above which compression is applied"
                  />
                  
                  <ParameterControl
                    label="Ratio"
                    value={settings.compressor.ratio}
                    displayValue={`${settings.compressor.ratio.toFixed(1)}:1`}
                    onChange={(value) => updateCompressorSettings({ ratio: value })}
                    min={1}
                    max={20}
                    step={0.1}
                    color="red"
                    tooltip="Amount of gain reduction (higher = more compression)"
                  />
                  
                  <ParameterControl
                    label="Attack"
                    value={settings.compressor.attack}
                    displayValue={`${Math.round(settings.compressor.attack * 1000)}ms`}
                    onChange={(value) => updateCompressorSettings({ attack: value })}
                    min={0}
                    max={1}
                    step={0.001}
                    color="orange"
                    tooltip="How quickly compression engages"
                  />
                  
                  <ParameterControl
                    label="Release"
                    value={settings.compressor.release}
                    displayValue={`${Math.round(settings.compressor.release * 1000)}ms`}
                    onChange={(value) => updateCompressorSettings({ release: value })}
                    min={0}
                    max={3}
                    step={0.01}
                    color="amber"
                    tooltip="How quickly compression disengages"
                  />
                </div>
              </EffectModule>
            </TabsContent>

            {/* MODULATION FX TAB */}
            <TabsContent value="modulation" className="space-y-6 mt-4 relative">
              {immersiveMode && settings.chorus.enabled && (
                <WaveformRing rate={settings.chorus.rate} depth={settings.chorus.depth} color="emerald" />
              )}

              {/* Chorus Module */}
              <EffectModule
                title="Chorus"
                icon={<Waves className="w-4 h-4" />}
                enabled={settings.chorus.enabled}
                onToggle={(enabled) => updateChorusSettings({ enabled })}
                color="emerald"
                tooltip="Creates rich, shimmering textures through pitch modulation"
                immersiveMode={immersiveMode}
              >
                <div className="space-y-3 ml-4">
                  <ParameterControl
                    label="Rate"
                    value={settings.chorus.rate}
                    displayValue={`${settings.chorus.rate.toFixed(1)}Hz`}
                    onChange={(value) => updateChorusSettings({ rate: value })}
                    min={0.1}
                    max={10}
                    step={0.1}
                    color="emerald"
                    tooltip="Speed of the modulation oscillation"
                  />
                  
                  <ParameterControl
                    label="Depth"
                    value={settings.chorus.depth}
                    displayValue={`${Math.round(settings.chorus.depth * 100)}%`}
                    onChange={(value) => updateChorusSettings({ depth: value })}
                    min={0}
                    max={1}
                    step={0.01}
                    color="teal"
                    tooltip="Intensity of the pitch modulation"
                  />
                  
                  <ParameterControl
                    label="Wet Level"
                    value={settings.chorus.wetLevel}
                    displayValue={`${Math.round(settings.chorus.wetLevel * 100)}%`}
                    onChange={(value) => updateChorusSettings({ wetLevel: value })}
                    min={0}
                    max={1}
                    step={0.01}
                    color="emerald"
                    showMeter
                    tooltip="Mix level of the chorus effect"
                  />
                </div>
              </EffectModule>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </motion.div>
  );
}

// Reusable Effect Module Component
const EffectModule = ({ 
  title, 
  icon, 
  enabled, 
  onToggle, 
  children, 
  color,
  tooltip,
  immersiveMode = true
}: { 
  title: string; 
  icon: React.ReactNode; 
  enabled: boolean; 
  onToggle: (enabled: boolean) => void; 
  children: React.ReactNode;
  color: string;
  tooltip?: string;
  immersiveMode?: boolean;
}) => {
  return (
    <motion.div 
      className={`space-y-4 relative`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Module glow when enabled */}
      {immersiveMode && enabled && (
        <motion.div
          className={`absolute -inset-2 bg-${color}-500/10 rounded-lg blur-xl pointer-events-none`}
          animate={{
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}

      <div className="flex items-center justify-between relative z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <motion.div
                  animate={enabled ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1, repeat: enabled ? Infinity : 0 }}
                  className={enabled ? `text-${color}-500` : ''}
                >
                  {icon}
                </motion.div>
                <Label className={`font-medium transition-smooth ${enabled ? `text-${color}-600 dark:text-${color}-400` : ''}`}>
                  {title}
                </Label>
                {tooltip && <Info className="w-3 h-3 text-muted-foreground opacity-50" />}
              </div>
            </TooltipTrigger>
            {tooltip && (
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            className="transition-smooth"
          />
        </motion.div>
      </div>
      
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Reusable Parameter Control Component
const ParameterControl = ({
  label,
  value,
  displayValue,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  color = 'indigo',
  showMeter = false,
  centerZero = false,
  onHoverStart,
  onHoverEnd,
  tooltip
}: {
  label: string;
  value: number;
  displayValue: string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  color?: string;
  showMeter?: boolean;
  centerZero?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  tooltip?: string;
}) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div 
      className="space-y-2"
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Label className={`text-sm cursor-help transition-smooth ${isDragging ? `text-${color}-600 dark:text-${color}-400` : ''}`}>
                {label}
              </Label>
            </TooltipTrigger>
            {tooltip && (
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <Badge 
          variant="secondary" 
          className={`text-xs font-mono transition-smooth ${isDragging ? `bg-${color}-500/20` : ''}`}
        >
          {displayValue}
        </Badge>
      </div>
      
      <div className="space-y-1">
        <Slider
          value={[value]}
          onValueChange={([newValue]) => {
            onChange(newValue);
            setIsDragging(true);
          }}
          onPointerUp={() => setIsDragging(false)}
          onPointerLeave={() => setIsDragging(false)}
          min={min}
          max={max}
          step={step}
          className={`w-full transition-smooth ${isDragging ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
        />
        
        {showMeter && (
          <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-600`}
              initial={{ width: 0 }}
              animate={{ width: `${(value / max) * 100}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />
          </div>
        )}
        
        {centerZero && (
          <div className="relative h-0.5">
            <div className="absolute left-1/2 w-px h-3 -top-1 bg-muted-foreground/30" />
          </div>
        )}
      </div>
    </motion.div>
  );
};