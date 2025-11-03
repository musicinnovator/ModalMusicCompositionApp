/**
 * Visual Card Enhancer
 * ADDITIVE ONLY - Adds professional visualizations to melody/theme cards
 * Wraps existing visualizers with oscilloscope and spectrum displays
 */

import { ReactNode, useMemo } from 'react';
import { OscilloscopeDisplay } from './OscilloscopeDisplay';
import { SpectrumAnalyzer } from './SpectrumAnalyzer';
import { WaveformVisualizer } from './WaveformVisualizer';
import { MetalPanel } from './MetalPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Activity, BarChart3, Waves } from 'lucide-react';

export interface VisualCardEnhancerProps {
  children: ReactNode;
  melody?: number[]; // MIDI notes for visualization
  showOscilloscope?: boolean;
  showSpectrum?: boolean;
  showWaveform?: boolean;
  title?: string;
  color?: string;
  // ADDITIVE: Flexible width control for Option C
  minWidth?: string;
  maxWidth?: string;
  allowFlexibleWidth?: boolean;
}

export function VisualCardEnhancer({
  children,
  melody = [],
  showOscilloscope = true,
  showSpectrum = false,
  showWaveform = true,
  title,
  color = '#06b6d4',
  // ADDITIVE: Default flexible width settings for Option C
  minWidth = '400px',
  maxWidth = 'full',
  allowFlexibleWidth = true
}: VisualCardEnhancerProps) {
  
  // Convert MIDI notes to waveform data (normalized -1 to 1)
  const waveformData = useMemo(() => {
    if (!melody || melody.length === 0) return [];
    
    // Create smooth waveform from MIDI notes
    const data: number[] = [];
    const samplesPerNote = 20;
    
    melody.forEach((note, index) => {
      const normalizedNote = (note - 60) / 48; // Center around middle C, range ±4 octaves
      const nextNote = melody[index + 1] ?? note;
      const nextNormalized = (nextNote - 60) / 48;
      
      // Create smooth transition between notes
      for (let i = 0; i < samplesPerNote; i++) {
        const t = i / samplesPerNote;
        const interpolated = normalizedNote + (nextNormalized - normalizedNote) * t;
        // Add slight sine wave modulation for visual interest
        const modulated = interpolated + Math.sin(i * 0.5) * 0.1;
        data.push(Math.max(-1, Math.min(1, modulated)));
      }
    });
    
    return data;
  }, [melody]);

  // Convert MIDI notes to spectrum data (frequency bins)
  const spectrumData = useMemo(() => {
    if (!melody || melody.length === 0) return [];
    
    // Create frequency spectrum from note distribution
    const spectrum = new Array(64).fill(0);
    
    melody.forEach(note => {
      // Map MIDI note to spectrum bin (0-127 -> 0-63)
      const bin = Math.floor((note / 127) * 63);
      if (bin >= 0 && bin < 64) {
        spectrum[bin] += 0.2;
      }
      // Add harmonics
      const harmonic1 = Math.floor((note * 2 / 127) * 63);
      const harmonic2 = Math.floor((note * 3 / 127) * 63);
      if (harmonic1 < 64) spectrum[harmonic1] += 0.1;
      if (harmonic2 < 64) spectrum[harmonic2] += 0.05;
    });
    
    // Normalize
    const max = Math.max(...spectrum, 1);
    return spectrum.map(v => v / max);
  }, [melody]);

  const hasVisualizations = melody.length > 0 && (showOscilloscope || showSpectrum || showWaveform);
  const visualizationCount = [showOscilloscope, showSpectrum, showWaveform].filter(Boolean).length;

  // ADDITIVE: Flexible width classes for Option C
  const flexibleWidthClasses = allowFlexibleWidth 
    ? `min-w-[${minWidth}] ${maxWidth === 'full' ? 'max-w-full' : `max-w-[${maxWidth}]`} w-full`
    : '';

  if (!hasVisualizations) {
    // No melody data or visualizations disabled - just return children
    return <>{children}</>;
  }

  return (
    <MetalPanel finish="black-anodized" showScrews={true} depth="shallow" className={`p-1 ${flexibleWidthClasses}`}>
      <div className="bg-black/90 backdrop-blur-sm rounded-md p-3 space-y-3 overflow-hidden">
        {/* Professional Visualizations */}
        {visualizationCount > 1 ? (
          <Tabs defaultValue="waveform" className="w-full overflow-hidden">
            <TabsList className="grid w-full overflow-hidden" style={{ gridTemplateColumns: `repeat(${visualizationCount}, 1fr)` }}>
              {showWaveform && (
                <TabsTrigger value="waveform" className="gap-1 text-xs overflow-hidden">
                  <Waves className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">Wave</span>
                </TabsTrigger>
              )}
              {showOscilloscope && (
                <TabsTrigger value="oscilloscope" className="gap-1 text-xs overflow-hidden">
                  <Activity className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">Scope</span>
                </TabsTrigger>
              )}
              {showSpectrum && (
                <TabsTrigger value="spectrum" className="gap-1 text-xs overflow-hidden">
                  <BarChart3 className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">FFT</span>
                </TabsTrigger>
              )}
            </TabsList>

            {showWaveform && (
              <TabsContent value="waveform" className="mt-2">
                <WaveformVisualizer
                  data={waveformData}
                  height={80}
                  colorScheme="cyan"
                  style="filled"
                  showGrid={true}
                />
              </TabsContent>
            )}

            {showOscilloscope && (
              <TabsContent value="oscilloscope" className="mt-2">
                <OscilloscopeDisplay
                  waveform={waveformData}
                  height={80}
                  colorScheme="cyan"
                  showGrid={true}
                  animationSpeed={2}
                />
              </TabsContent>
            )}

            {showSpectrum && (
              <TabsContent value="spectrum" className="mt-2">
                <SpectrumAnalyzer
                  data={spectrumData}
                  height={80}
                  colorScheme="cyan"
                  style="bars"
                  showPeakHold={true}
                />
              </TabsContent>
            )}
          </Tabs>
        ) : (
          // Single visualization - no tabs needed
          <div>
            {showWaveform && (
              <WaveformVisualizer
                data={waveformData}
                height={80}
                colorScheme="cyan"
                style="filled"
                showGrid={true}
              />
            )}
            {showOscilloscope && !showWaveform && (
              <OscilloscopeDisplay
                waveform={waveformData}
                height={80}
                colorScheme="cyan"
                showGrid={true}
                animationSpeed={2}
              />
            )}
            {showSpectrum && !showWaveform && !showOscilloscope && (
              <SpectrumAnalyzer
                data={spectrumData}
                height={80}
                colorScheme="cyan"
                style="bars"
                showPeakHold={true}
              />
            )}
          </div>
        )}

        {/* Original Content */}
        <div className="bg-background/95 rounded-md p-3 overflow-hidden">
          {children}
        </div>
      </div>
    </MetalPanel>
  );
}
