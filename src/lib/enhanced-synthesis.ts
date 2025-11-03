export interface InstrumentConfig {
  name: string;
  category: string;
  oscillatorType: OscillatorType;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  filterFreq?: number;
  harmonics?: number[];
  filterType?: BiquadFilterType;
  filterQ?: number;
  detuneSpread?: number;
  voiceCount?: number;
  noiseLevel?: number;
  modulationDepth?: number;
  modulationRate?: number;
}

export type InstrumentType = 
  | 'piano' 
  | 'harpsichord' 
  | 'violin' 
  | 'cello' 
  | 'bass' 
  | 'flute' 
  | 'piccolo' 
  | 'pipe-organ-full' 
  | 'pipe-organ-light' 
  | 'choir-male' 
  | 'choir-female';

export const ENHANCED_INSTRUMENTS: Record<InstrumentType, InstrumentConfig> = {
  piano: {
    name: 'Classical Piano',
    category: 'Keyboard',
    oscillatorType: 'triangle',
    attack: 0.01,
    decay: 0.3,
    sustain: 0.2,
    release: 0.8,
    harmonics: [1, 0.8, 0.6, 0.4, 0.3, 0.2, 0.15, 0.1],
    filterType: 'lowpass',
    filterQ: 1,
    voiceCount: 3,
    detuneSpread: 5,
    noiseLevel: 0.02
  },
  harpsichord: {
    name: 'Harpsichord',
    category: 'Keyboard',
    oscillatorType: 'sawtooth',
    attack: 0.001,
    decay: 0.1,
    sustain: 0.1,
    release: 0.2,
    harmonics: [1, 0.7, 0.5, 0.3, 0.2, 0.1],
    filterType: 'highpass',
    filterQ: 0.8,
    noiseLevel: 0.03
  },
  violin: {
    name: 'Violin',
    category: 'Strings',
    oscillatorType: 'sawtooth',
    attack: 0.2,
    decay: 0.1,
    sustain: 0.8,
    release: 0.3,
    harmonics: [1, 0.9, 0.7, 0.5, 0.4, 0.3, 0.2, 0.15, 0.1],
    filterType: 'bandpass',
    filterQ: 2,
    modulationDepth: 0.1,
    modulationRate: 4.5,
    voiceCount: 2,
    detuneSpread: 3
  },
  cello: {
    name: 'Cello',
    category: 'Strings',
    oscillatorType: 'sawtooth',
    attack: 0.15,
    decay: 0.2,
    sustain: 0.7,
    release: 0.4,
    harmonics: [1, 0.8, 0.6, 0.4, 0.3, 0.2, 0.15],
    filterType: 'lowpass',
    filterQ: 1.5,
    modulationDepth: 0.08,
    modulationRate: 3.2
  },
  bass: {
    name: 'Double Bass',
    category: 'Strings',
    oscillatorType: 'triangle',
    attack: 0.1,
    decay: 0.3,
    sustain: 0.6,
    release: 0.5,
    harmonics: [1, 0.6, 0.4, 0.2, 0.1],
    filterType: 'lowpass',
    filterQ: 0.8
  },
  flute: {
    name: 'Flute',
    category: 'Woodwinds',
    oscillatorType: 'sine',
    attack: 0.1,
    decay: 0.05,
    sustain: 0.9,
    release: 0.2,
    harmonics: [1, 0.3, 0.1, 0.05],
    filterType: 'lowpass',
    filterQ: 1.2,
    modulationDepth: 0.05,
    modulationRate: 5.5,
    noiseLevel: 0.01
  },
  piccolo: {
    name: 'Piccolo',
    category: 'Woodwinds',
    oscillatorType: 'sine',
    attack: 0.05,
    decay: 0.03,
    sustain: 0.95,
    release: 0.15,
    harmonics: [1, 0.4, 0.2, 0.1, 0.05],
    filterType: 'highpass',
    filterQ: 1.5,
    modulationDepth: 0.03,
    modulationRate: 6.2
  },
  'pipe-organ-full': {
    name: 'Pipe Organ (Full)',
    category: 'Organ',
    oscillatorType: 'square',
    attack: 0.05,
    decay: 0.0,
    sustain: 1.0,
    release: 0.1,
    harmonics: [1, 0.8, 0.6, 0.4, 0.3, 0.2, 0.15, 0.1, 0.08, 0.06],
    voiceCount: 4,
    detuneSpread: 2
  },
  'pipe-organ-light': {
    name: 'Pipe Organ (Light)',
    category: 'Organ',
    oscillatorType: 'triangle',
    attack: 0.03,
    decay: 0.0,
    sustain: 0.8,
    release: 0.08,
    harmonics: [1, 0.5, 0.3, 0.2, 0.1],
    filterType: 'lowpass',
    filterQ: 1
  },
  'choir-male': {
    name: 'Male Choir',
    category: 'Vocal',
    oscillatorType: 'triangle',
    attack: 0.3,
    decay: 0.1,
    sustain: 0.7,
    release: 0.4,
    harmonics: [1, 0.7, 0.5, 0.3, 0.2, 0.15, 0.1],
    filterType: 'bandpass',
    filterQ: 2.5,
    modulationDepth: 0.15,
    modulationRate: 2.8,
    voiceCount: 5,
    detuneSpread: 8
  },
  'choir-female': {
    name: 'Female Choir',
    category: 'Vocal',
    oscillatorType: 'sine',
    attack: 0.25,
    decay: 0.1,
    sustain: 0.8,
    release: 0.3,
    harmonics: [1, 0.6, 0.4, 0.2, 0.1, 0.05],
    filterType: 'bandpass',
    filterQ: 3,
    modulationDepth: 0.12,
    modulationRate: 3.5,
    voiceCount: 4,
    detuneSpread: 6
  }
};

export class EnhancedSynthesizer {
  private audioContext: AudioContext;
  
  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  public createInstrumentNote(
    frequency: number,
    duration: number,
    instrument: InstrumentConfig,
    destination: AudioNode,
    delay: number = 0
  ): void {
    const startTime = this.audioContext.currentTime + delay;
    const endTime = startTime + duration;
    
    // Create voice group for unison effects
    const voiceCount = instrument.voiceCount || 1;
    const voices: AudioNode[] = [];
    
    for (let voice = 0; voice < voiceCount; voice++) {
      const voiceFreq = this.calculateVoiceFrequency(frequency, voice, instrument);
      const voiceNode = this.createVoice(voiceFreq, instrument, startTime, endTime);
      
      if (voiceNode) {
        voices.push(voiceNode);
        
        // Apply voice-specific gain for unison spread
        const voiceGain = this.audioContext.createGain();
        voiceGain.gain.value = 1 / voiceCount; // Distribute volume across voices
        
        voiceNode.connect(voiceGain);
        voiceGain.connect(destination);
      }
    }
  }

  private calculateVoiceFrequency(baseFreq: number, voiceIndex: number, instrument: InstrumentConfig): number {
    if (!instrument.detuneSpread || voiceIndex === 0) {
      return baseFreq;
    }
    
    // Calculate detune amount in cents
    const detuneRange = instrument.detuneSpread;
    const detuneCents = (voiceIndex - Math.floor(instrument.voiceCount! / 2)) * detuneRange;
    
    // Convert cents to frequency multiplier
    return baseFreq * Math.pow(2, detuneCents / 1200);
  }

  private createVoice(
    frequency: number,
    instrument: InstrumentConfig,
    startTime: number,
    endTime: number
  ): AudioNode | null {
    try {
      // Create oscillator bank for harmonics
      const oscillators: OscillatorNode[] = [];
      const harmMixer = this.audioContext.createGain();
      
      const harmonics = instrument.harmonics || [1];
      
      for (let i = 0; i < harmonics.length; i++) {
        const harmonic = harmonics[i];
        if (harmonic <= 0) continue;
        
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();
        
        osc.type = instrument.oscillatorType;
        osc.frequency.setValueAtTime(frequency * (i + 1), startTime);
        
        // Apply harmonic amplitude
        oscGain.gain.setValueAtTime(harmonic, startTime);
        
        osc.connect(oscGain);
        oscGain.connect(harmMixer);
        
        oscillators.push(osc);
      }
      
      // Add noise component if specified
      let noiseSource: AudioBufferSourceNode | null = null;
      if (instrument.noiseLevel && instrument.noiseLevel > 0) {
        noiseSource = this.createNoiseSource(instrument.noiseLevel, startTime, endTime);
        if (noiseSource) {
          noiseSource.connect(harmMixer);
        }
      }
      
      // Create filter
      const filter = this.audioContext.createBiquadFilter();
      filter.type = instrument.filterType || 'lowpass';
      filter.frequency.setValueAtTime(
        instrument.filterFreq || frequency * 4,
        startTime
      );
      filter.Q.setValueAtTime(instrument.filterQ || 1, startTime);
      
      // Create envelope
      const envelope = this.audioContext.createGain();
      this.applyEnvelope(envelope, instrument, startTime, endTime);
      
      // Add modulation if specified
      if (instrument.modulationDepth && instrument.modulationRate) {
        this.addModulation(harmMixer, instrument, startTime, endTime);
      }
      
      // Connect the chain
      harmMixer.connect(filter);
      filter.connect(envelope);
      
      // Start all oscillators
      oscillators.forEach(osc => {
        osc.start(startTime);
        osc.stop(endTime);
      });
      
      if (noiseSource) {
        noiseSource.start(startTime);
        noiseSource.stop(endTime);
      }
      
      return envelope;
      
    } catch (error) {
      console.error('Error creating voice:', error);
      return null;
    }
  }

  private createNoiseSource(level: number, startTime: number, endTime: number): AudioBufferSourceNode {
    const duration = endTime - startTime;
    const sampleRate = this.audioContext.sampleRate;
    const bufferLength = duration * sampleRate;
    
    const buffer = this.audioContext.createBuffer(1, bufferLength, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferLength; i++) {
      data[i] = (Math.random() * 2 - 1) * level;
    }
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    
    return source;
  }

  private applyEnvelope(
    gainNode: GainNode,
    instrument: InstrumentConfig,
    startTime: number,
    endTime: number
  ): void {
    const { attack, decay, sustain, release } = instrument;
    
    gainNode.gain.setValueAtTime(0, startTime);
    
    // Attack
    gainNode.gain.linearRampToValueAtTime(0.8, startTime + attack);
    
    // Decay
    gainNode.gain.linearRampToValueAtTime(sustain, startTime + attack + decay);
    
    // Sustain (hold until release)
    const releaseStart = Math.max(endTime - release, startTime + attack + decay);
    gainNode.gain.setValueAtTime(sustain, releaseStart);
    
    // Release
    gainNode.gain.linearRampToValueAtTime(0, endTime);
  }

  private addModulation(
    target: AudioNode,
    instrument: InstrumentConfig,
    startTime: number,
    endTime: number
  ): void {
    if (!instrument.modulationDepth || !instrument.modulationRate) return;
    
    const lfo = this.audioContext.createOscillator();
    const modGain = this.audioContext.createGain();
    
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(instrument.modulationRate, startTime);
    
    modGain.gain.setValueAtTime(instrument.modulationDepth, startTime);
    
    // Connect modulation (this is a simplified version - in practice you'd modulate specific parameters)
    lfo.connect(modGain);
    
    // For demonstration, we'll modulate the gain slightly
    if (target instanceof GainNode) {
      modGain.connect(target.gain);
    }
    
    lfo.start(startTime);
    lfo.stop(endTime);
  }
}