/**
 * MOTUDemoPanel Component
 * Demo panel showcasing all MOTU-inspired professional UI components
 * This serves as both a reference and a testing ground for the components
 */

import { useState } from 'react';
import { MetalPanel } from './MetalPanel';
import { LEDRingKnob } from './LEDRingKnob';
import { LCDDisplay } from './LCDDisplay';
import { OscilloscopeDisplay } from './OscilloscopeDisplay';
import { EnvelopeEditor } from './EnvelopeEditor';
import { WaveformVisualizer } from './WaveformVisualizer';
import { ChannelStrip } from './ChannelStrip';
import { SpectrumAnalyzer } from './SpectrumAnalyzer';

export function MOTUDemoPanel() {
  const [volume, setVolume] = useState(75);
  const [cutoff, setCutoff] = useState(50);
  const [resonance, setResonance] = useState(30);
  const [envelope, setEnvelope] = useState({
    attack: 0.2,
    decay: 0.3,
    sustain: 0.7,
    release: 0.4
  });
  const [time, setTime] = useState(0);
  
  // Simulate time progress
  useState(() => {
    const interval = setInterval(() => {
      setTime(prev => (prev + 0.1) % 100);
    }, 100);
    return () => clearInterval(interval);
  });
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl">MOTU Professional UI Components</h1>
        <p className="opacity-60 text-sm">
          Production-quality audio plugin interface inspired by MOTU MX4, Proton, and Model12
        </p>
      </div>
      
      {/* Main Panel - Dark Metal */}
      <MetalPanel finish="dark-metal" showScrews={true} depth="deep">
        <div className="space-y-6">
          {/* Top Row - Oscilloscope and Spectrum */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="text-sm opacity-60 tracking-widest">OSCILLOSCOPE</div>
              <OscilloscopeDisplay 
                waveform="sine"
                colorScheme="cyan"
                frequency={2}
                amplitude={0.8}
                width={400}
                height={150}
                showGrid={true}
                animated={true}
              />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm opacity-60 tracking-widest">SPECTRUM ANALYZER</div>
              <SpectrumAnalyzer
                colorScheme="cyan"
                style="bars"
                width={400}
                height={150}
                bars={48}
                showPeaks={true}
                animated={true}
              />
            </div>
          </div>
          
          {/* Middle Row - Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Knobs Section */}
            <MetalPanel finish="carbon-fiber" showScrews={false} depth="shallow">
              <div className="space-y-4">
                <div className="text-xs opacity-60 tracking-widest text-center">FILTER CONTROLS</div>
                <div className="flex justify-around">
                  <LEDRingKnob
                    label="VOLUME"
                    value={volume}
                    onChange={setVolume}
                    colorScheme="cyan"
                    size="medium"
                    showValue={true}
                  />
                  <LEDRingKnob
                    label="CUTOFF"
                    value={cutoff}
                    onChange={setCutoff}
                    colorScheme="green"
                    size="medium"
                    showValue={true}
                  />
                  <LEDRingKnob
                    label="RES"
                    value={resonance}
                    onChange={setResonance}
                    colorScheme="amber"
                    size="medium"
                    showValue={true}
                  />
                </div>
              </div>
            </MetalPanel>
            
            {/* Envelope Editor */}
            <MetalPanel finish="black-anodized" showScrews={false} depth="shallow">
              <div className="space-y-2">
                <div className="text-xs opacity-60 tracking-widest text-center">ENVELOPE</div>
                <EnvelopeEditor
                  envelope={envelope}
                  onChange={setEnvelope}
                  colorScheme="cyan"
                  width={280}
                  height={150}
                  showLabels={true}
                />
              </div>
            </MetalPanel>
            
            {/* LCD Displays */}
            <MetalPanel finish="gunmetal" showScrews={false} depth="shallow">
              <div className="space-y-4">
                <div className="text-xs opacity-60 tracking-widest text-center">DISPLAYS</div>
                <div className="space-y-2">
                  <LCDDisplay
                    content={time}
                    mode="timecode"
                    colorScheme="cyan"
                    size="medium"
                    animated={true}
                    showBorder={true}
                  />
                  <LCDDisplay
                    content={volume}
                    mode="level"
                    colorScheme="green"
                    size="medium"
                    animated={false}
                    showBorder={true}
                  />
                  <LCDDisplay
                    content={`VOL ${Math.round(volume)}`}
                    mode="text"
                    colorScheme="amber"
                    size="small"
                    animated={true}
                    showBorder={true}
                  />
                </div>
              </div>
            </MetalPanel>
          </div>
          
          {/* Bottom Row - Waveform and Mixer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="text-sm opacity-60 tracking-widest">WAVEFORM</div>
              <WaveformVisualizer
                style="filled"
                colorScheme="cyan"
                width={400}
                height={120}
                showPeaks={true}
                animated={true}
              />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm opacity-60 tracking-widest">MIXER CHANNELS</div>
              <div className="flex gap-2 justify-center">
                <ChannelStrip
                  channelNumber={1}
                  label="CH"
                  volume={75}
                  colorScheme="cyan"
                  showVU={true}
                />
                <ChannelStrip
                  channelNumber={2}
                  label="CH"
                  volume={60}
                  colorScheme="cyan"
                  showVU={true}
                />
                <ChannelStrip
                  channelNumber={3}
                  label="CH"
                  volume={85}
                  colorScheme="cyan"
                  showVU={true}
                />
              </div>
            </div>
          </div>
        </div>
      </MetalPanel>
      
      {/* Alternative Color Schemes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetalPanel finish="brushed-aluminum" showScrews={true} depth="shallow">
          <div className="text-center space-y-3">
            <div className="text-xs opacity-60 tracking-widest">CYAN THEME</div>
            <div className="flex justify-center gap-4">
              <LEDRingKnob value={70} colorScheme="cyan" size="small" />
              <LEDRingKnob value={50} colorScheme="cyan" size="small" />
            </div>
            <LCDDisplay content="CYAN" mode="text" colorScheme="cyan" size="small" />
          </div>
        </MetalPanel>
        
        <MetalPanel finish="dark-metal" showScrews={true} depth="shallow">
          <div className="text-center space-y-3">
            <div className="text-xs opacity-60 tracking-widest">GREEN THEME</div>
            <div className="flex justify-center gap-4">
              <LEDRingKnob value={70} colorScheme="green" size="small" />
              <LEDRingKnob value={50} colorScheme="green" size="small" />
            </div>
            <LCDDisplay content="GREEN" mode="text" colorScheme="green" size="small" />
          </div>
        </MetalPanel>
        
        <MetalPanel finish="silver-metal" showScrews={true} depth="shallow">
          <div className="text-center space-y-3">
            <div className="text-xs opacity-60 tracking-widest">AMBER THEME</div>
            <div className="flex justify-center gap-4">
              <LEDRingKnob value={70} colorScheme="amber" size="small" />
              <LEDRingKnob value={50} colorScheme="amber" size="small" />
            </div>
            <LCDDisplay content="AMBER" mode="text" colorScheme="amber" size="small" />
          </div>
        </MetalPanel>
      </div>
    </div>
  );
}

export default MOTUDemoPanel;
