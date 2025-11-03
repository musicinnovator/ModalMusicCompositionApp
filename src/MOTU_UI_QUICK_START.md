# 🚀 MOTU Professional UI - Quick Start Guide

Get started with the MOTU Professional UI components in 3 minutes!

---

## 1️⃣ Import Components

```typescript
import {
  MetalPanel,
  LEDRingKnob,
  LCDDisplay,
  OscilloscopeDisplay,
  EnvelopeEditor,
  WaveformVisualizer,
  ChannelStrip,
  SpectrumAnalyzer
} from './components/professional';
```

---

## 2️⃣ Apply MOTU Theme

```typescript
import { applyUITheme } from './lib/ui-themes';

// Dark theme with cyan accents (Model12 style)
applyUITheme('pro-motu-dark', true);

// Light theme with blue accents (Proton style)
applyUITheme('pro-motu-light', false);

// Dark theme with green LEDs (MX4 style)
applyUITheme('pro-synth-green', true);
```

---

## 3️⃣ Build Your Interface

### Simple Panel
```tsx
<MetalPanel finish="dark-metal" showScrews={true} depth="deep">
  <LCDDisplay content="SYNTHESIZER" mode="text" colorScheme="cyan" size="medium" />
  
  <div className="flex gap-4">
    <LEDRingKnob 
      label="VOLUME"
      value={volume}
      onChange={setVolume}
      colorScheme="cyan"
    />
    <LEDRingKnob 
      label="CUTOFF"
      value={cutoff}
      onChange={setCutoff}
      colorScheme="green"
    />
  </div>
</MetalPanel>
```

### With Visualization
```tsx
<MetalPanel finish="carbon-fiber" depth="deep">
  <OscilloscopeDisplay
    waveform="sine"
    colorScheme="cyan"
    frequency={2}
    amplitude={0.8}
    width={400}
    height={150}
    animated={true}
  />
</MetalPanel>
```

### Mixer Channel
```tsx
<ChannelStrip
  channelNumber={1}
  label="CH"
  volume={75}
  pan={0}
  colorScheme="cyan"
  showVU={true}
  onVolumeChange={setVolume}
  onMuteToggle={setMute}
  onSoloToggle={setSolo}
/>
```

---

## 🎨 Quick Reference

### Metal Finishes
- `brushed-aluminum` - Shiny silver
- `dark-metal` - Dark gray (default)
- `carbon-fiber` - Black carbon pattern
- `black-anodized` - Pure black
- `silver-metal` - Light silver
- `gunmetal` - Medium gray

### Color Schemes
- `cyan` - #00d4ff (MOTU signature)
- `green` - #00ff88 (Synth style)
- `blue` - #4a9eff (Professional)
- `amber` - #ffaa00 (Warning)
- `red` - #ff4a6e (Critical)
- `purple` - #aa00ff (Creative)

### Component Sizes
- `small` - Compact (knobs: 48px, LCD: 32px)
- `medium` - Standard (knobs: 64px, LCD: 48px)
- `large` - Large (knobs: 80px, LCD: 64px)

---

## 📋 Common Patterns

### Control Panel
```tsx
<MetalPanel finish="dark-metal" showScrews={true}>
  <div className="space-y-4">
    <LCDDisplay content="FILTER" mode="text" colorScheme="cyan" />
    
    <div className="flex gap-4">
      <LEDRingKnob label="CUTOFF" value={cutoff} onChange={setCutoff} />
      <LEDRingKnob label="RES" value={res} onChange={setRes} />
      <LEDRingKnob label="ENV" value={env} onChange={setEnv} />
    </div>
  </div>
</MetalPanel>
```

### Visualizer Panel
```tsx
<MetalPanel finish="black-anodized">
  <WaveformVisualizer
    style="filled"
    colorScheme="cyan"
    width={600}
    height={120}
    showPeaks={true}
    animated={true}
  />
</MetalPanel>
```

### Full Synth Panel
```tsx
<MetalPanel finish="dark-metal" showScrews={true} depth="deep">
  <div className="grid grid-cols-2 gap-6">
    {/* Oscilloscope */}
    <OscilloscopeDisplay 
      waveform="sine" 
      colorScheme="cyan" 
      width={400} 
      height={150} 
    />
    
    {/* Spectrum */}
    <SpectrumAnalyzer 
      colorScheme="cyan" 
      style="bars" 
      width={400} 
      height={150} 
    />
    
    {/* Controls */}
    <div className="flex gap-4">
      <LEDRingKnob label="VOL" value={vol} onChange={setVol} />
      <LEDRingKnob label="FREQ" value={freq} onChange={setFreq} />
      <LEDRingKnob label="RES" value={res} onChange={setRes} />
    </div>
    
    {/* Envelope */}
    <EnvelopeEditor 
      envelope={envelope} 
      onChange={setEnvelope} 
      colorScheme="cyan" 
    />
  </div>
</MetalPanel>
```

---

## 🎛️ Full Example

```tsx
import { useState } from 'react';
import {
  MetalPanel,
  LEDRingKnob,
  LCDDisplay,
  OscilloscopeDisplay,
  ChannelStrip
} from './components/professional';
import { applyUITheme } from './lib/ui-themes';

function SynthInterface() {
  const [volume, setVolume] = useState(75);
  const [cutoff, setCutoff] = useState(50);
  const [resonance, setResonance] = useState(30);
  
  // Apply MOTU dark theme
  useState(() => {
    applyUITheme('pro-motu-dark', true);
  }, []);
  
  return (
    <div className="p-8 space-y-6">
      {/* Main Panel */}
      <MetalPanel finish="dark-metal" showScrews={true} depth="deep">
        <div className="space-y-6">
          {/* Display */}
          <LCDDisplay 
            content="SYNTHESIZER ENGINE" 
            mode="text" 
            colorScheme="cyan" 
            size="large"
          />
          
          {/* Oscilloscope */}
          <OscilloscopeDisplay
            waveform="sine"
            colorScheme="cyan"
            frequency={2}
            amplitude={0.8}
            width={600}
            height={150}
            showGrid={true}
            animated={true}
          />
          
          {/* Controls */}
          <div className="flex justify-around">
            <LEDRingKnob
              label="VOLUME"
              value={volume}
              onChange={setVolume}
              colorScheme="cyan"
              size="medium"
            />
            <LEDRingKnob
              label="CUTOFF"
              value={cutoff}
              onChange={setCutoff}
              colorScheme="green"
              size="medium"
            />
            <LEDRingKnob
              label="RES"
              value={resonance}
              onChange={setResonance}
              colorScheme="amber"
              size="medium"
            />
          </div>
        </div>
      </MetalPanel>
      
      {/* Mixer Channels */}
      <div className="flex gap-2">
        <ChannelStrip channelNumber={1} volume={75} colorScheme="cyan" />
        <ChannelStrip channelNumber={2} volume={60} colorScheme="cyan" />
        <ChannelStrip channelNumber={3} volume={85} colorScheme="cyan" />
        <ChannelStrip channelNumber={4} volume={70} colorScheme="cyan" />
      </div>
    </div>
  );
}

export default SynthInterface;
```

---

## 🎨 Theme Switching

```tsx
function ThemeSelector() {
  const [theme, setTheme] = useState('pro-motu-dark');
  
  const switchTheme = (newTheme: UITheme) => {
    setTheme(newTheme);
    applyUITheme(newTheme, true);
  };
  
  return (
    <div className="flex gap-2">
      <button onClick={() => switchTheme('pro-motu-dark')}>
        MOTU Dark
      </button>
      <button onClick={() => switchTheme('pro-motu-light')}>
        MOTU Light
      </button>
      <button onClick={() => switchTheme('pro-synth-green')}>
        Synth Green
      </button>
    </div>
  );
}
```

---

## 📦 Background Theme Selector

```tsx
import { BACKGROUND_THEMES, BackgroundTheme } from './components/PreferencesDialog';

function BackgroundSelector() {
  const [bgTheme, setBgTheme] = useState<BackgroundTheme>('indigo-purple');
  
  return (
    <div className={BACKGROUND_THEMES[bgTheme].gradient}>
      {/* Your content */}
    </div>
  );
}
```

**18 Background Themes Available**:
- indigo-purple, blue-cyan, green-emerald, orange-red, pink-rose, dark-slate
- amber-gold, teal-aqua, violet-lavender, crimson-ruby, navy-midnight, charcoal-gray
- lime-mint, coral-peach, electric-blue, deep-purple, silver-metal, bronze-copper

---

## 🚀 You're Ready!

Start integrating these components into your Musical Composition Engine cards. See `/CARD_REDESIGN_REMINDER.md` for detailed guidance on each card.

**Need help?** Check `/MOTU_PROFESSIONAL_UI_COMPLETE.md` for comprehensive documentation.

---

**Happy coding! 🎛️✨**
