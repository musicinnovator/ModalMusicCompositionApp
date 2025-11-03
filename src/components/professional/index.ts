/**
 * Professional UI Components - Export Index
 * MOTU-inspired professional audio plugin interface components
 * 
 * Usage:
 * import { MetalPanel, LEDRingKnob, LCDDisplay } from './components/professional';
 */

// Core Components
export { MetalPanel } from './MetalPanel';
export type { MetalPanelProps, MetalFinish } from './MetalPanel';

export { LEDRingKnob } from './LEDRingKnob';
export type { LEDRingKnobProps, LEDColorScheme } from './LEDRingKnob';

export { LCDDisplay } from './LCDDisplay';
export type { LCDDisplayProps, LCDDisplayMode, LCDColorScheme } from './LCDDisplay';

// Visualizers
export { OscilloscopeDisplay } from './OscilloscopeDisplay';
export type { OscilloscopeDisplayProps, OscilloscopeWaveform, OscilloscopeColorScheme } from './OscilloscopeDisplay';

export { EnvelopeEditor } from './EnvelopeEditor';
export type { EnvelopeEditorProps, ADSREnvelope } from './EnvelopeEditor';

export { WaveformVisualizer } from './WaveformVisualizer';
export type { WaveformVisualizerProps, WaveformStyle, WaveformColorScheme } from './WaveformVisualizer';

export { SpectrumAnalyzer } from './SpectrumAnalyzer';
export type { SpectrumAnalyzerProps, SpectrumColorScheme, SpectrumStyle } from './SpectrumAnalyzer';

// Mixer Components
export { ChannelStrip } from './ChannelStrip';
export type { ChannelStripProps } from './ChannelStrip';

// Demo
export { MOTUDemoPanel } from './MOTUDemoPanel';

// ADDITIVE: Phase 2 - Card Enhancement Wrappers
export { ProfessionalCardWrapper } from './ProfessionalCardWrapper';
export type { ProfessionalCardWrapperProps, CardVisualType } from './ProfessionalCardWrapper';

export { VisualCardEnhancer } from './VisualCardEnhancer';
export type { VisualCardEnhancerProps } from './VisualCardEnhancer';

// ADDITIVE: Option C - Flexible Layout Components
export { FlexibleCardContainer } from './FlexibleCardContainer';
export type { FlexibleCardContainerProps } from './FlexibleCardContainer';

export { SmartTextWrapper } from './SmartTextWrapper';
export type { SmartTextWrapperProps, TextDisplayMode } from './SmartTextWrapper';
