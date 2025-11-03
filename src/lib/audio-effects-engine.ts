export interface EffectsSettings {
  reverb: {
    enabled: boolean;
    roomSize: number; // 0-1
    dampening: number; // 0-1
    wetLevel: number; // 0-1
    dryLevel: number; // 0-1
  };
  delay: {
    enabled: boolean;
    time: number; // 0-1 seconds
    feedback: number; // 0-1
    wetLevel: number; // 0-1
  };
  eq: {
    enabled: boolean;
    lowGain: number; // -20 to 20 dB
    midGain: number; // -20 to 20 dB
    highGain: number; // -20 to 20 dB
    lowFreq: number; // Hz
    highFreq: number; // Hz
  };
  stereo: {
    enabled: boolean;
    width: number; // 0-2 (0=mono, 1=normal, 2=wide)
    pan: number; // -1 to 1
  };
  chorus: {
    enabled: boolean;
    rate: number; // 0.1-10 Hz
    depth: number; // 0-1
    wetLevel: number; // 0-1
  };
  compressor: {
    enabled: boolean;
    threshold: number; // -100 to 0 dB
    ratio: number; // 1-20
    attack: number; // 0-1 seconds
    release: number; // 0-3 seconds
  };
}

export const DEFAULT_EFFECTS: EffectsSettings = {
  reverb: {
    enabled: false, // User must enable manually
    roomSize: 0.3,
    dampening: 0.5,
    wetLevel: 0.15,
    dryLevel: 0.85
  },
  delay: {
    enabled: false,
    time: 0.25,
    feedback: 0.3,
    wetLevel: 0.2
  },
  eq: {
    enabled: false, // User must enable manually
    lowGain: 0,
    midGain: 0,
    highGain: 0,
    lowFreq: 320,
    highFreq: 3200
  },
  stereo: {
    enabled: false, // User must enable manually
    width: 1.2,
    pan: 0
  },
  chorus: {
    enabled: false,
    rate: 0.5,
    depth: 0.3,
    wetLevel: 0.4
  },
  compressor: {
    enabled: false, // User must enable manually
    threshold: -18,
    ratio: 3,
    attack: 0.003,
    release: 0.1
  }
};

export class AudioEffectsEngine {
  private audioContext: AudioContext;
  private effectsChain: AudioNode[] = [];
  private inputNode: GainNode;
  private outputNode: GainNode;
  
  // Effect nodes
  private reverbNode: ConvolverNode | null = null;
  private reverbWetGain: GainNode | null = null;
  private reverbDryGain: GainNode | null = null;
  
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayWetGain: GainNode | null = null;
  
  private eqLowShelf: BiquadFilterNode | null = null;
  private eqMidPeak: BiquadFilterNode | null = null;
  private eqHighShelf: BiquadFilterNode | null = null;
  
  private stereoSplitter: ChannelSplitterNode | null = null;
  private stereoMerger: ChannelMergerNode | null = null;
  private leftGain: GainNode | null = null;
  private rightGain: GainNode | null = null;
  
  private chorusDelay: DelayNode | null = null;
  private chorusLFO: OscillatorNode | null = null;
  private chorusGain: GainNode | null = null;
  private chorusWetGain: GainNode | null = null;
  
  private compressor: DynamicsCompressorNode | null = null;
  
  private currentSettings: EffectsSettings = { ...DEFAULT_EFFECTS };

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.inputNode = audioContext.createGain();
    this.outputNode = audioContext.createGain();
    
    // Initialize effects asynchronously
    this.initializeEffects().catch(console.error);
  }

  private async initializeEffects() {
    await this.createReverbImpulse();
    this.setupEffectsChain();
  }

  private async createReverbImpulse() {
    // Create a simple algorithmic reverb impulse response
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * 2; // 2 second reverb
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 2);
        channelData[i] = (Math.random() * 2 - 1) * decay * 0.5;
      }
    }
    
    this.reverbNode = this.audioContext.createConvolver();
    this.reverbNode.buffer = impulse;
  }

  private setupEffectsChain() {
    // Clear existing chain
    this.effectsChain = [];
    
    // Create all effect nodes
    this.setupEQ();
    this.setupCompressor();
    this.setupReverb();
    this.setupDelay();
    this.setupChorus();
    this.setupStereoEffects();
    
    // Chain them together
    this.connectEffectsChain();
  }

  private setupEQ() {
    this.eqLowShelf = this.audioContext.createBiquadFilter();
    this.eqMidPeak = this.audioContext.createBiquadFilter();
    this.eqHighShelf = this.audioContext.createBiquadFilter();
    
    this.eqLowShelf.type = 'lowshelf';
    this.eqLowShelf.frequency.value = this.currentSettings.eq.lowFreq;
    
    this.eqMidPeak.type = 'peaking';
    this.eqMidPeak.frequency.value = 1000;
    this.eqMidPeak.Q.value = 1;
    
    this.eqHighShelf.type = 'highshelf';
    this.eqHighShelf.frequency.value = this.currentSettings.eq.highFreq;
  }

  private setupCompressor() {
    this.compressor = this.audioContext.createDynamicsCompressor();
    this.compressor.threshold.value = this.currentSettings.compressor.threshold;
    this.compressor.ratio.value = this.currentSettings.compressor.ratio;
    this.compressor.attack.value = this.currentSettings.compressor.attack;
    this.compressor.release.value = this.currentSettings.compressor.release;
  }

  private setupReverb() {
    if (!this.reverbNode) return;
    
    this.reverbWetGain = this.audioContext.createGain();
    this.reverbDryGain = this.audioContext.createGain();
    
    this.reverbWetGain.gain.value = this.currentSettings.reverb.wetLevel;
    this.reverbDryGain.gain.value = this.currentSettings.reverb.dryLevel;
  }

  private setupDelay() {
    this.delayNode = this.audioContext.createDelay(1.0);
    this.delayFeedback = this.audioContext.createGain();
    this.delayWetGain = this.audioContext.createGain();
    
    this.delayNode.delayTime.value = this.currentSettings.delay.time;
    this.delayFeedback.gain.value = this.currentSettings.delay.feedback;
    this.delayWetGain.gain.value = this.currentSettings.delay.wetLevel;
  }

  private setupChorus() {
    this.chorusDelay = this.audioContext.createDelay(0.1);
    this.chorusGain = this.audioContext.createGain();
    this.chorusWetGain = this.audioContext.createGain();
    
    // Create LFO for chorus modulation
    this.chorusLFO = this.audioContext.createOscillator();
    this.chorusLFO.type = 'sine';
    this.chorusLFO.frequency.value = this.currentSettings.chorus.rate;
    
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = this.currentSettings.chorus.depth * 0.005; // Small modulation depth
    
    this.chorusLFO.connect(lfoGain);
    lfoGain.connect(this.chorusDelay.delayTime);
    
    this.chorusDelay.delayTime.value = 0.02; // Base delay time
    this.chorusWetGain.gain.value = this.currentSettings.chorus.wetLevel;
    
    this.chorusLFO.start();
  }

  private setupStereoEffects() {
    this.stereoSplitter = this.audioContext.createChannelSplitter(2);
    this.stereoMerger = this.audioContext.createChannelMerger(2);
    this.leftGain = this.audioContext.createGain();
    this.rightGain = this.audioContext.createGain();
  }

  private connectEffectsChain() {
    let currentNode: AudioNode = this.inputNode;
    
    // EQ Chain
    if (this.currentSettings.eq.enabled && this.eqLowShelf && this.eqMidPeak && this.eqHighShelf) {
      currentNode.connect(this.eqLowShelf);
      this.eqLowShelf.connect(this.eqMidPeak);
      this.eqMidPeak.connect(this.eqHighShelf);
      currentNode = this.eqHighShelf;
    }
    
    // Compressor
    if (this.currentSettings.compressor.enabled && this.compressor) {
      currentNode.connect(this.compressor);
      currentNode = this.compressor;
    }
    
    // Create a split for parallel effects (reverb, delay, chorus)
    const effectsSplitter = this.audioContext.createGain();
    currentNode.connect(effectsSplitter);
    
    const effectsMixer = this.audioContext.createGain();
    
    // Dry signal
    effectsSplitter.connect(effectsMixer);
    
    // Reverb (parallel)
    if (this.currentSettings.reverb.enabled && this.reverbNode && this.reverbWetGain) {
      effectsSplitter.connect(this.reverbNode);
      this.reverbNode.connect(this.reverbWetGain);
      this.reverbWetGain.connect(effectsMixer);
    }
    
    // Delay (parallel)
    if (this.currentSettings.delay.enabled && this.delayNode && this.delayFeedback && this.delayWetGain) {
      effectsSplitter.connect(this.delayNode);
      this.delayNode.connect(this.delayWetGain);
      this.delayWetGain.connect(effectsMixer);
      
      // Feedback loop
      this.delayNode.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
    }
    
    // Chorus (parallel)
    if (this.currentSettings.chorus.enabled && this.chorusDelay && this.chorusWetGain) {
      effectsSplitter.connect(this.chorusDelay);
      this.chorusDelay.connect(this.chorusWetGain);
      this.chorusWetGain.connect(effectsMixer);
    }
    
    currentNode = effectsMixer;
    
    // Stereo effects
    if (this.currentSettings.stereo.enabled && this.stereoSplitter && this.stereoMerger && this.leftGain && this.rightGain) {
      currentNode.connect(this.stereoSplitter);
      
      // Apply stereo width and pan
      this.stereoSplitter.connect(this.leftGain, 0);
      this.stereoSplitter.connect(this.rightGain, 1);
      
      this.leftGain.connect(this.stereoMerger, 0, 0);
      this.rightGain.connect(this.stereoMerger, 0, 1);
      
      // Cross-feed for stereo width
      const crossFeedGain = (2 - this.currentSettings.stereo.width) * 0.5;
      const crossLeft = this.audioContext.createGain();
      const crossRight = this.audioContext.createGain();
      crossLeft.gain.value = crossFeedGain;
      crossRight.gain.value = crossFeedGain;
      
      this.leftGain.connect(crossRight);
      this.rightGain.connect(crossLeft);
      crossLeft.connect(this.stereoMerger, 0, 0);
      crossRight.connect(this.stereoMerger, 0, 1);
      
      currentNode = this.stereoMerger;
    }
    
    currentNode.connect(this.outputNode);
  }

  public updateSettings(newSettings: Partial<EffectsSettings>) {
    this.currentSettings = { ...this.currentSettings, ...newSettings };
    this.applySettings();
  }

  private applySettings() {
    // Update reverb
    if (this.reverbWetGain && this.reverbDryGain) {
      this.reverbWetGain.gain.setValueAtTime(
        this.currentSettings.reverb.wetLevel,
        this.audioContext.currentTime
      );
      this.reverbDryGain.gain.setValueAtTime(
        this.currentSettings.reverb.dryLevel,
        this.audioContext.currentTime
      );
    }
    
    // Update delay
    if (this.delayNode && this.delayFeedback && this.delayWetGain) {
      this.delayNode.delayTime.setValueAtTime(
        this.currentSettings.delay.time,
        this.audioContext.currentTime
      );
      this.delayFeedback.gain.setValueAtTime(
        this.currentSettings.delay.feedback,
        this.audioContext.currentTime
      );
      this.delayWetGain.gain.setValueAtTime(
        this.currentSettings.delay.wetLevel,
        this.audioContext.currentTime
      );
    }
    
    // Update EQ
    if (this.eqLowShelf && this.eqMidPeak && this.eqHighShelf) {
      this.eqLowShelf.gain.setValueAtTime(
        this.currentSettings.eq.lowGain,
        this.audioContext.currentTime
      );
      this.eqMidPeak.gain.setValueAtTime(
        this.currentSettings.eq.midGain,
        this.audioContext.currentTime
      );
      this.eqHighShelf.gain.setValueAtTime(
        this.currentSettings.eq.highGain,
        this.audioContext.currentTime
      );
    }
    
    // Update compressor
    if (this.compressor) {
      this.compressor.threshold.setValueAtTime(
        this.currentSettings.compressor.threshold,
        this.audioContext.currentTime
      );
      this.compressor.ratio.setValueAtTime(
        this.currentSettings.compressor.ratio,
        this.audioContext.currentTime
      );
      this.compressor.attack.setValueAtTime(
        this.currentSettings.compressor.attack,
        this.audioContext.currentTime
      );
      this.compressor.release.setValueAtTime(
        this.currentSettings.compressor.release,
        this.audioContext.currentTime
      );
    }
    
    // Update chorus
    if (this.chorusLFO && this.chorusWetGain) {
      this.chorusLFO.frequency.setValueAtTime(
        this.currentSettings.chorus.rate,
        this.audioContext.currentTime
      );
      this.chorusWetGain.gain.setValueAtTime(
        this.currentSettings.chorus.wetLevel,
        this.audioContext.currentTime
      );
    }
    
    // Update stereo effects
    if (this.leftGain && this.rightGain) {
      const pan = this.currentSettings.stereo.pan;
      const leftPan = Math.cos((pan + 1) * Math.PI / 4);
      const rightPan = Math.sin((pan + 1) * Math.PI / 4);
      
      this.leftGain.gain.setValueAtTime(leftPan, this.audioContext.currentTime);
      this.rightGain.gain.setValueAtTime(rightPan, this.audioContext.currentTime);
    }
    
    // Rebuild effects chain for enabled/disabled effects
    this.setupEffectsChain();
  }

  public getInputNode(): AudioNode {
    return this.inputNode;
  }

  public getOutputNode(): AudioNode {
    return this.outputNode;
  }

  public getCurrentSettings(): EffectsSettings {
    return { ...this.currentSettings };
  }

  public dispose() {
    if (this.chorusLFO) {
      this.chorusLFO.stop();
      this.chorusLFO.disconnect();
    }
    
    // Disconnect all nodes
    this.inputNode.disconnect();
    this.outputNode.disconnect();
    
    // Clear references
    this.effectsChain = [];
  }
}