import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Mode, Theme, Part, EntrySpec, ModeCategory, KeySignature, KEY_SIGNATURES, PITCH_NAMES, BachLikeVariables, BachVariableName, MidiNote, midiNoteToNoteName, pitchClassToMidiNote, midiNoteToPitchClass, Song, Rhythm, NoteValue, noteValuesToRhythm, rhythmToNoteValues } from './types/musical';
import { MusicalEngine } from './lib/musical-engine';
import { ModeSelector } from './components/ModeSelector';
import { AdvancedModeControls } from './components/AdvancedModeControls';

import { ThemeComposer, EnhancedTheme } from './components/ThemeComposer';
import { ThemePlayer } from './components/ThemePlayer';
import { CounterpointComposer } from './components/CounterpointComposer';
import { AdvancedCounterpointComposer } from './components/AdvancedCounterpointComposer';
import { ImitationFugueControls } from './components/ImitationFugueControls';
import { CanonControls } from './components/CanonControls';
import { CanonVisualizer } from './components/CanonVisualizer';
import { FugueGeneratorControls } from './components/FugueGeneratorControls';
import { FugueVisualizer } from './components/FugueVisualizer';
import { MelodyVisualizer } from './components/MelodyVisualizer';
import { RhythmControlsEnhanced } from './components/RhythmControlsEnhanced';
import { BachVariablesVisualizer } from './components/BachVariablesVisualizer';
import { BachVariablePlayer } from './components/BachVariablePlayer';
import { AudioPlayer } from './components/AudioPlayer';
import { StabilityControls, StabilityMode } from './components/StabilityControls';
import { PreferencesDialog, BackgroundTheme, BACKGROUND_THEMES } from './components/PreferencesDialog';
import { PianoKeyboard, PianoKeyboardRef } from './components/PianoKeyboard';
import { FileExporter } from './components/FileExporter';
import { EnhancedFileExporter } from './components/EnhancedFileExporter';
import { SessionMemoryBank } from './components/SessionMemoryBank';
import { MidiFileImporter } from './components/MidiFileImporter';
import { EnhancedSongComposer } from './components/EnhancedSongComposer';
import { ProfessionalTimeline } from './components/ProfessionalTimeline';
import { AvailableComponentsExporter } from './components/AvailableComponentsExporter';
import { SongPlayer } from './components/SongPlayer';
import { SongExporter } from './components/SongExporter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HarmonyComposer } from './components/HarmonyComposer';
import { HarmonyVisualizer } from './components/HarmonyVisualizer';
import { ArpeggioChainBuilder } from './components/ArpeggioChainBuilder';
import { ThemeConverterCard, ConvertibleComponent } from './components/ThemeConverterCard';
import { ComposerAccompanimentLibrary } from './components/ComposerAccompanimentLibrary';
import { AccompanimentVisualizer, AccompanimentVisualizationData } from './components/AccompanimentVisualizer';
import { MidiToAccompanimentConverter } from './components/MidiToAccompanimentConverter';

import { InstrumentType } from './lib/enhanced-synthesis';
import { UITheme, applyUITheme } from './lib/ui-themes';
import { CanonEngine, CanonParams, CanonResult } from './lib/canon-engine';
import { FugueBuilderEngine, FugueParams, FugueResult } from './lib/fugue-builder-engine';
import { getSoundfontEngine } from './lib/soundfont-audio-engine';
import { Card } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';
import { Separator } from './components/ui/separator';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Label } from './components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Music, Music4, Waves, Sparkles, Shuffle, Play, Pause, Trash2, Layers, Disc3, BookOpen, Zap, Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';
import { ParallaxBackground } from './components/ParallaxBackground';
import { OnboardingOverlay, OnboardingTrigger } from './components/OnboardingOverlay';
import { MotionWrapper, HoverScale, PulseOnActive, StaggerContainer, StaggerItem } from './components/MotionWrapper';
import { UndoRedoProvider } from './components/UndoRedoProvider';
import { UndoRedoControls } from './components/UndoRedoControls';

// ADDITIVE: Phase 2 - Professional UI Enhancement Components
import { ProfessionalCardWrapper, VisualCardEnhancer } from './components/professional';

// ADDITIVE: Authentication & Subscription System
import { AuthProvider } from './components/auth/AuthProvider';
import { AuthHeader } from './components/auth/AuthHeader';

export default function App() {

  // Enhanced memory management with MIDI buffer cleanup
  useEffect(() => {
    // Clear any existing MIDI/export buffers on app startup
    const clearAllBuffers = () => {
      try {
        if (typeof window !== 'undefined') {
          delete (window as any).__modeCache;
          delete (window as any).__midiCache;
          delete (window as any).__exportCache;
          delete (window as any).__audioBuffers;
          delete (window as any).__songExportCache;
          delete (window as any).__themeExportCache;
        }
        
        console.log('🧹 All export buffers cleared on app startup');
      } catch (error) {
        console.warn('Buffer cleanup warning:', error);
      }
    };

    clearAllBuffers();

    return () => {
      // Cleanup caches on unmount
      clearAllBuffers();
    };
  }, []);

  // Enhanced MIDI support check for deployment environments - deferred to prevent blocking
  useEffect(() => {
    const checkMidiSupport = async () => {
      try {
        console.log('🔍 === DEPLOYMENT MIDI CHECK ===');
        console.log('🔍 Browser:', navigator.userAgent);
        console.log('🔍 HTTPS:', window.location.protocol === 'https:');
        console.log('🔍 Host:', window.location.host);
        
        if (!navigator.requestMIDIAccess) {
          setMidiSupported(false);
          console.log('❌ MIDI Support Check: Web MIDI API not supported in this browser');
          return;
        }

        console.log('✅ Web MIDI API available, testing access...');
        
        // Try a simple MIDI access request to check if it's actually available
        const midiAccess = await navigator.requestMIDIAccess({ sysex: false });
        const inputs = Array.from(midiAccess.inputs.values());
        const outputs = Array.from(midiAccess.outputs.values());
        
        setMidiSupported(true);
        console.log('✅ MIDI Support Check: Available and accessible');
        console.log('🎹 MIDI Inputs found:', inputs.length);
        console.log('🎵 MIDI Outputs found:', outputs.length);
        
        if (inputs.length === 0) {
          console.log('ℹ️ No MIDI devices connected. Connect your MIDI keyboard and refresh.');
          toast.info('MIDI ready! Connect your MIDI keyboard and refresh the page.', { duration: 8000 });
        } else {
          console.log('🎹 MIDI devices ready:', inputs.map((input: any) => input.name).join(', '));
          toast.success(`MIDI connected! Found: ${inputs.map((input: any) => input.name).join(', ')}`, { duration: 8000 });
        }
        
      } catch (error: any) {
        console.log('❌ MIDI Support Check failed:', error);
        console.log('❌ Error type:', error.name);
        console.log('❌ Error message:', error.message);
        
        if (error.name === 'SecurityError') {
          if (error.message.includes('permissions policy')) {
            console.log('ℹ️ MIDI restricted by permissions policy (Figma Make environment)');
            toast.info('MIDI restricted in Figma Make. Deploy to enable MIDI keyboard support.', { duration: 6000 });
          } else if (error.message.includes('https')) {
            console.log('❌ MIDI requires HTTPS in production');
            toast.error('MIDI requires HTTPS. Please deploy to a secure HTTPS domain.', { duration: 10000 });
          } else {
            console.log('❌ MIDI access denied by security policy');
            toast.warning('MIDI access denied. Check browser permissions.', { duration: 8000 });
          }
        } else if (error.name === 'NotSupportedError') {
          console.log('❌ MIDI not supported in this environment/browser');
          toast.warning('MIDI not supported in this browser/environment.', { duration: 6000 });
        } else {
          console.log('❌ Unknown MIDI error:', error);
          toast.warning('MIDI initialization failed. Check console for details.', { duration: 6000 });
        }
        
        setMidiSupported(false);
      }
    };
    
    // Increase delay and defer to prevent blocking initial render
    const timer = setTimeout(checkMidiSupport, 2000);
    return () => clearTimeout(timer);
  }, []);

  // State declarations first
  const [selectedKeySignature, setSelectedKeySignature] = useState<KeySignature | null>(() => {
    try {
      return KEY_SIGNATURES.find(ks => ks.key === 0 && ks.mode === 'major') || null; // Default to C Major
    } catch (err) {
      console.error('Error initializing key signature:', err);
      return null;
    }
  });
  
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  
  // Counterpoint state - now with instrument, mute tracking, and rhythm support
  interface CounterpointComposition {
    melody: Theme;
    rhythm?: Rhythm; // Support for species counterpoint rhythms
    instrument: InstrumentType;
    muted: boolean;
    timestamp: number;
    technique?: string;
  }
  
  const [generatedCounterpoints, setGeneratedCounterpoints] = useState<CounterpointComposition[]>([]);

  // Song state
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [songTab, setSongTab] = useState<'composer' | 'player' | 'export'>('composer');

  // Canon state - NEW: Canon generation system
  interface GeneratedCanon {
    result: CanonResult;
    instruments: InstrumentType[];
    muted: boolean[];
    timestamp: number;
  }
  
  const [canonsList, setCanonsList] = useState<GeneratedCanon[]>([]);

  // Fugue Builder state - NEW: AI-driven fugue generation system
  interface GeneratedFugueBuilder {
    result: FugueResult;
    instruments: InstrumentType[];
    muted: boolean[];
    timestamp: number;
  }
  
  const [generatedFugues, setGeneratedFugues] = useState<GeneratedFugueBuilder[]>([]);

  // Harmony state - NEW: Harmony generation system
  interface GeneratedHarmony {
    result: {
      melody: Theme;
      originalMelody: Theme;
      harmonyNotes: Theme[];
      harmonyRhythm: Rhythm;
      chordLabels: string[];
      analysis: {
        detectedKey: number;
        keyQuality: 'major' | 'minor';
        chordProgression: string[];
        chordRoots: number[];
        chordTimings: number[];
        confidence: number;
      };
    };
    instrument: InstrumentType;
    muted: boolean;
    timestamp: number;
  }
  
  const [generatedHarmonies, setGeneratedHarmonies] = useState<GeneratedHarmony[]>([]);

  // Arpeggio Chain state - NEW: Arpeggio chain generation system
  interface GeneratedArpeggio {
    melody: Theme;
    rhythm: Rhythm;
    label: string;
    instrument: InstrumentType;
    muted: boolean;
    timestamp: number;
  }
  
  const [generatedArpeggios, setGeneratedArpeggios] = useState<GeneratedArpeggio[]>([]);

  // ADDITIVE: Composer Accompaniment state - NEW: Famous composer accompaniment system
  interface GeneratedAccompaniment {
    melody: (MidiNote | MidiNote[] | -1)[]; // ADDITIVE: Now supports chords and rests
    rhythm: Rhythm;
    label: string;
    instrument: InstrumentType;
    muted: boolean;
    timestamp: number;
  }
  
  const [generatedAccompaniments, setGeneratedAccompaniments] = useState<GeneratedAccompaniment[]>([]);

  // Optimized mode categories with deferred building and caching
  const [modeCategories, setModeCategories] = useState<ModeCategory[]>([{
    name: 'Western Traditional',
    modes: [
      { index: 1, stepPattern: [2,2,1,2,2,2,1], final: 0, octaveSpan: 12, name: 'Ionian (Major)' },
      { index: 2, stepPattern: [2,1,2,1,2,2,2], final: 0, octaveSpan: 12, name: 'Aeolian (Natural Minor)' }
    ]
  }]);

  // Defer expensive mode building to after initial render
  useEffect(() => {
    // Use requestIdleCallback or setTimeout to avoid blocking render
    const buildModes = () => {
      const rootNote = selectedKeySignature?.key ?? 0;
      console.log('🎵 Building modes for key signature:', selectedKeySignature?.name, 'with root note:', rootNote);
      const modes = MusicalEngine.buildAllWorldModes(rootNote);
      
      // Debug: Check if modes have correct final values
      const sampleMode = modes[0]?.modes?.[0];
      if (sampleMode) {
        console.log('🎵 Sample mode final check:', sampleMode.name, 'final =', sampleMode.final, 'expected =', rootNote);
      }
      
      setModeCategories(modes);
    };

    // Defer to next frame to allow page to render first
    const timeoutId = setTimeout(buildModes, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedKeySignature?.key]);

  // Update selected mode when key signature changes
  useEffect(() => {
    if (!modeCategories || modeCategories.length === 0) return;
    
    // If we already have a mode with the same name, keep it unless the final note changed
    if (selectedMode) {
      const allModes = modeCategories.flatMap(cat => cat.modes || []);
      const matchingMode = allModes.find(mode => mode.name === selectedMode.name);
      if (matchingMode && matchingMode.final !== selectedMode.final) {
        setSelectedMode(matchingMode);
        return;
      }
      if (matchingMode) return; // Keep current if found
    }
    
    // Default to the first major mode if available
    const westernCategory = modeCategories.find(cat => cat.name?.includes('Western Traditional'));
    const majorMode = westernCategory?.modes?.find(mode => mode.name?.includes('Ionian') || mode.name?.includes('Major'));
    
    if (majorMode && (!selectedMode || selectedMode.name !== majorMode.name)) {
      setSelectedMode(majorMode);
    } else if (!selectedMode && modeCategories[0]?.modes?.[0]) {
      setSelectedMode(modeCategories[0].modes[0]);
    }
  }, [modeCategories, selectedMode?.name]);

  const handleKeySignatureSelect = useCallback((keySignature: KeySignature) => {
    try {
      const previousKey = selectedKeySignature;
      setSelectedKeySignature(keySignature);
      
      // Show a helpful toast notification
      if (previousKey && previousKey.key !== keySignature.key) {
        toast.success(`Key signature changed to ${keySignature.name} - all modes updated to ${PITCH_NAMES[keySignature.key]}!`);
      }
    } catch (err) {
      console.error('Error selecting key signature:', err);
      toast.error('Failed to change key signature');
    }
  }, [selectedKeySignature]);
  const [theme, setTheme] = useState<Theme>([60, 62, 64, 65, 67, 65, 64, 62, 60]); // Convert to MIDI notes
  
  // Enhanced theme with rest duration tracking
  const [enhancedTheme, setEnhancedTheme] = useState<EnhancedTheme>({
    melody: [60, 62, 64, 65, 67, 65, 64, 62, 60],
    restDurations: new Map()
  });

  // Bach-like variables state - MUST BE DECLARED BEFORE bachVariableRhythms
  const [bachVariables, setBachVariables] = useState<BachLikeVariables>(() => ({
    cantusFirmus: [],
    floridCounterpoint1: [],
    floridCounterpoint2: [],
    cantusFirmusFragment1: [],
    cantusFirmusFragment2: [],
    floridCounterpointFrag1: [],
    floridCounterpointFrag2: [],
    countersubject1: [],
    countersubject2: []
  }));

  // Rhythm state for theme and Bach variables
  const [themeRhythm, setThemeRhythm] = useState<NoteValue[]>(
    Array(9).fill('quarter' as NoteValue)
  );
  
  const [bachVariableRhythms, setBachVariableRhythms] = useState<Record<BachVariableName, NoteValue[]>>(() => {
    const initialRhythms: Partial<Record<BachVariableName, NoteValue[]>> = {};
    Object.keys(bachVariables).forEach((key) => {
      const bachKey = key as BachVariableName;
      initialRhythms[bachKey] = Array(bachVariables[bachKey].length).fill('quarter' as NoteValue);
    });
    return initialRhythms as Record<BachVariableName, NoteValue[]>;
  });

  // Rhythm state for counterpoints - keyed by timestamp
  const [counterpointRhythms, setCounterpointRhythms] = useState<Map<number, NoteValue[]>>(new Map());

  // Simplified theme setter with basic optimization
  const setOptimizedTheme = useCallback((newTheme: Theme) => {
    try {
      // Basic optimization: limit theme length to prevent memory issues
      const optimizedTheme = newTheme.length > 32 ? newTheme.slice(0, 32) : newTheme;
      setTheme(optimizedTheme);
      
      // Keep enhanced theme in sync
      setEnhancedTheme(prev => ({
        ...prev,
        melody: optimizedTheme,
        // Clean up rest durations for removed elements
        restDurations: new Map(
          Array.from(prev.restDurations.entries())
            .filter(([index]) => index < optimizedTheme.length)
        )
      }));
      
      // Sync rhythm length
      setThemeRhythm(prev => {
        const newRhythm = [...prev];
        while (newRhythm.length < optimizedTheme.length) {
          newRhythm.push('quarter');
        }
        if (newRhythm.length > optimizedTheme.length) {
          newRhythm.length = optimizedTheme.length;
        }
        return newRhythm;
      });
      
      if (optimizedTheme.length < newTheme.length) {
        toast.warning(`Theme trimmed to 32 notes to preserve memory`);
      }
    } catch (err) {
      console.error('Error setting theme:', err);
      setTheme(newTheme); // Fallback to original
    }
  }, []);
  
  // Enhanced theme setter
  const setOptimizedEnhancedTheme = useCallback((newEnhancedTheme: EnhancedTheme) => {
    try {
      const optimizedMelody = newEnhancedTheme.melody.length > 32 
        ? newEnhancedTheme.melody.slice(0, 32) 
        : newEnhancedTheme.melody;
      
      // Clean up rest durations for optimized melody
      const optimizedRestDurations = new Map(
        Array.from(newEnhancedTheme.restDurations.entries())
          .filter(([index]) => index < optimizedMelody.length)
      );
      
      const optimizedEnhancedTheme = {
        melody: optimizedMelody,
        restDurations: optimizedRestDurations
      };
      
      setEnhancedTheme(optimizedEnhancedTheme);
      setTheme(optimizedMelody); // Keep basic theme in sync
      
      if (optimizedMelody.length < newEnhancedTheme.melody.length) {
        toast.warning(`Enhanced theme trimmed to 32 elements to preserve memory`);
      }
    } catch (err) {
      console.error('Error setting enhanced theme:', err);
      setEnhancedTheme(newEnhancedTheme); // Fallback to original
    }
  }, []);
  // Separate storage for imitations and fugues
  interface GeneratedComposition {
    parts: Part[];
    instruments: InstrumentType[];
    muted: boolean[];
    timestamp: number;
  }
  
  const [imitationsList, setImitationsList] = useState<GeneratedComposition[]>([]);
  const [fuguesList, setFuguesList] = useState<GeneratedComposition[]>([]);
  
  // Rhythm state for imitations and fugues - keyed by timestamp
  const [imitationRhythms, setImitationRhythms] = useState<Map<number, NoteValue[][]>>(new Map());
  const [fugueRhythms, setFugueRhythms] = useState<Map<number, NoteValue[][]>>(new Map());
  
  // ADDITIVE: Rhythm state for canons - keyed by timestamp, array per voice
  const [canonRhythms, setCanonRhythms] = useState<Map<number, NoteValue[][]>>(new Map());
  
  // ADDITIVE: Rhythm state for fugue builder (new generator) - keyed by timestamp, array per part
  const [fugueBuilderRhythms, setFugueBuilderRhythms] = useState<Map<number, NoteValue[][]>>(new Map());
  
  // ADDITIVE: Rhythm state for arpeggios - keyed by timestamp
  const [arpeggioRhythms, setArpeggioRhythms] = useState<Map<number, NoteValue[]>>(new Map());
  
  const [error, setError] = useState<string | null>(null);
  
  // New state for features
  const [stabilityMode, setStabilityMode] = useState<StabilityMode>('mix');
  const [stabilityRatio, setStabilityRatio] = useState(50);
  const [backgroundTheme, setBackgroundTheme] = useState<BackgroundTheme>('indigo-purple');
  
  const handleBackgroundThemeChange = useCallback((newTheme: BackgroundTheme) => {
    console.log('🎨 Changing background theme from', backgroundTheme, 'to', newTheme);
    setBackgroundTheme(newTheme);
    toast.success(`Background changed to ${newTheme.replace('-', ' ')}`);
  }, [backgroundTheme]);
  
  // UI Theme state - controls entire interface appearance
  const [uiTheme, setUITheme] = useState<UITheme>('modern-dark-slate');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const handleUIThemeChange = useCallback((newTheme: UITheme) => {
    try {
      console.log('✨ Changing UI theme from', uiTheme, 'to', newTheme);
      setUITheme(newTheme);
      applyUITheme(newTheme, isDarkMode);
      toast.success(`UI theme changed successfully`);
    } catch (error) {
      console.error('Error changing UI theme:', error);
      toast.error('Failed to change UI theme');
    }
  }, [uiTheme, isDarkMode]);
  
  const handleDarkModeToggle = useCallback(() => {
    try {
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);
      applyUITheme(uiTheme, newDarkMode);
      
      // Toggle dark class on html element for proper cascading
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      console.log('🌓 Dark mode toggled:', newDarkMode);
    } catch (error) {
      console.error('Error toggling dark mode:', error);
      toast.error('Failed to toggle dark mode');
    }
  }, [isDarkMode, uiTheme]);
  
  // Apply UI theme on mount and when it changes
  useEffect(() => {
    try {
      applyUITheme(uiTheme, isDarkMode);
      
      // Apply dark class if needed
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error applying UI theme on mount:', error);
    }
  }, []); // Only on mount
  
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('piano');
  
  // Piano keyboard preferences - full range C2-C6 (MIDI 36-84)
  const [pianoOctaveRange, setPianoOctaveRange] = useState(4); // Show 4 octaves (C2-C6)
  const [pianoStartOctave, setPianoStartOctave] = useState(2); // Start from octave 2 (C2)

  // MIDI integration with piano keyboard
  const [midiSupported, setMidiSupported] = useState(false);
  const pianoKeyboardRef = useRef<PianoKeyboardRef>(null);
  
  // MIDI target for Bach Variables
  const [midiTarget, setMidiTarget] = useState<BachVariableName | 'theme' | null>('theme');
  
  // MIDI activity indicator
  const [midiActivity, setMidiActivity] = useState(false);

  const handleGenerateImitation = useCallback((interval: number, delay: number) => {
    try {
      setError(null);
      
      // Simple validation
      if (!theme || theme.length === 0) {
        toast.error('Please create a theme first');
        return;
      }
      
      if (!selectedMode) {
        toast.error('Please select a mode first');
        return;
      }
      
      // Use octave-aware imitation that preserves full MIDI note range
      // This allows themes with notes above C4 to be imitated correctly
      let biasedTheme = theme;
      
      // Apply stability bias to theme if not in default mix mode
      if (stabilityMode !== 'mix' || stabilityRatio !== 50) {
        // Convert to pitch classes for stability bias
        const pitchClassTheme = theme.map(midiNote => midiNoteToPitchClass(midiNote));
        const biasedPitchClassTheme = MusicalEngine.applyStabilityBias(pitchClassTheme, selectedMode, stabilityMode, stabilityRatio);
        
        // Convert back to MIDI notes while preserving original octave relationships
        // Map each biased pitch class to the octave of the corresponding original note
        biasedTheme = biasedPitchClassTheme.map((pitchClass, index) => {
          const originalOctave = Math.floor(theme[index] / 12);
          return originalOctave * 12 + pitchClass;
        });
      }
      
      // Generate octave-aware imitation that preserves exact octave relationships
      const imitation = MusicalEngine.buildOctaveAwareImitationFromCantus(biasedTheme, interval, delay);
      
      const originalPart: Part = {
        melody: biasedTheme,
        rhythm: MusicalEngine.buildRhythmWithInitialRests(biasedTheme.length, 0)
      };
      
      const parts = [originalPart, imitation];
      const instruments: InstrumentType[] = ['piano', 'violin'];
      const muted = [false, false];
      
      // Add to imitations list instead of replacing
      const newImitation: GeneratedComposition = {
        parts,
        instruments,
        muted,
        timestamp: Date.now()
      };
      
      setImitationsList(prev => [...prev, newImitation]);
      
      // ADDITIVE: Initialize rhythms - inherit from theme rhythm if available
      const initialRhythms: NoteValue[][] = parts.map((part, partIndex) => {
        // Check if this is the leader (part 0) and theme rhythm exists
        if (partIndex === 0 && themeRhythm && themeRhythm.length === part.melody.length) {
          // Leader voice uses theme rhythm
          return themeRhythm;
        } else if (partIndex > 0 && themeRhythm) {
          // Follower voices also inherit theme rhythm, potentially with delays
          // First, convert the engine rhythm to see if there are entry delays
          const engineRhythm = rhythmToNoteValues(part.rhythm);
          // Count leading rests (entry delay)
          let restCount = 0;
          while (restCount < engineRhythm.length && engineRhythm[restCount] === 'rest') {
            restCount++;
          }
          // Combine entry delay with theme rhythm
          if (restCount > 0) {
            const delayRests = Array(restCount).fill('rest' as NoteValue);
            const melodyRhythm = Array(part.melody.length).fill('quarter' as NoteValue).map((_, i) =>
              themeRhythm && themeRhythm.length > 0 ? themeRhythm[i % themeRhythm.length] : 'quarter'
            );
            return [...delayRests, ...melodyRhythm];
          } else {
            // No delay, just repeat theme rhythm to match melody length
            const rhythm: NoteValue[] = [];
            for (let i = 0; i < part.melody.length; i++) {
              rhythm.push(themeRhythm && themeRhythm.length > 0 ? themeRhythm[i % themeRhythm.length] : 'quarter');
            }
            return rhythm;
          }
        }
        // Fallback: Convert engine-generated rhythm
        return rhythmToNoteValues(part.rhythm);
      });
      setImitationRhythms(prev => new Map(prev).set(newImitation.timestamp, initialRhythms));
      
      // Show helpful toast with note range info
      const minNote = Math.min(...imitation.melody);
      const maxNote = Math.max(...imitation.melody);
      const noteRange = `${midiNoteToNoteName(minNote)} to ${midiNoteToNoteName(maxNote)}`;
      const delayInfo = delay > 0 ? ` with ${delay} beat delay` : '';
      toast.success(`Imitation #${imitationsList.length + 1} generated across full range: ${noteRange}${delayInfo}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate imitation';
      setError(errorMessage);
      console.error('Imitation generation error:', err);
      toast.error('Failed to generate imitation');
    }
  }, [theme, selectedMode, stabilityMode, stabilityRatio, imitationsList.length]);

  const handleGenerateFugue = useCallback((entries: EntrySpec[]) => {
    try {
      setError(null);
      
      // Simple validation
      if (!theme || theme.length === 0) {
        toast.error('Please create a theme first');
        return;
      }
      
      if (!selectedMode) {
        toast.error('Please select a mode first');
        return;
      }
      
      if (!entries || entries.length === 0) {
        toast.error('Please specify at least one fugue entry');
        return;
      }
      
      // Use octave-aware fugue generation that preserves full MIDI note range
      let biasedTheme = theme;
      
      // Apply stability bias to theme if not in default mix mode
      if (stabilityMode !== 'mix' || stabilityRatio !== 50) {
        // Convert to pitch classes for stability bias
        const pitchClassTheme = theme.map(midiNote => midiNoteToPitchClass(midiNote));
        const biasedPitchClassTheme = MusicalEngine.applyStabilityBias(pitchClassTheme, selectedMode, stabilityMode, stabilityRatio);
        
        // Convert back to MIDI notes while preserving original octave relationships
        biasedTheme = biasedPitchClassTheme.map((pitchClass, index) => {
          const originalOctave = Math.floor(theme[index] / 12);
          return originalOctave * 12 + pitchClass;
        });
      }
      
      // Generate octave-aware fugue that preserves exact octave relationships
      const parts = MusicalEngine.buildOctaveAwareFugue(biasedTheme, selectedMode, entries);
      
      // Initialize part instruments for new parts with different instruments
      const instrumentChoices: InstrumentType[] = ['piano', 'violin', 'flute', 'cello', 'harpsichord', 'bass'];
      const instruments = parts.map((_, index) => instrumentChoices[index % instrumentChoices.length]);
      const muted = parts.map(() => false);
      
      // Add to fugues list instead of replacing
      const newFugue: GeneratedComposition = {
        parts,
        instruments,
        muted,
        timestamp: Date.now()
      };
      
      setFuguesList(prev => [...prev, newFugue]);
      
      // ADDITIVE: Initialize rhythms - inherit from theme rhythm if available
      const initialRhythms: NoteValue[][] = parts.map((part, partIndex) => {
        // Convert engine rhythm to check for entry delays
        const engineRhythm = rhythmToNoteValues(part.rhythm);
        // Count leading rests (entry delay)
        let restCount = 0;
        while (restCount < engineRhythm.length && engineRhythm[restCount] === 'rest') {
          restCount++;
        }
        
        if (themeRhythm && themeRhythm.length > 0) {
          // Calculate melody length (excluding entry delay)
          const melodyLength = part.melody.length;
          // Generate rhythm pattern from theme rhythm
          const melodyRhythm: NoteValue[] = [];
          for (let i = 0; i < melodyLength; i++) {
            melodyRhythm.push(themeRhythm[i % themeRhythm.length]);
          }
          // Combine entry delay with theme rhythm
          if (restCount > 0) {
            const delayRests = Array(restCount).fill('rest' as NoteValue);
            return [...delayRests, ...melodyRhythm];
          } else {
            return melodyRhythm;
          }
        }
        
        // Fallback: use engine-generated rhythm
        return engineRhythm;
      });
      setFugueRhythms(prev => new Map(prev).set(newFugue.timestamp, initialRhythms));
      
      // Show helpful toast with range info for all voices
      const allNotes = parts.flatMap(part => part.melody);
      const minNote = Math.min(...allNotes);
      const maxNote = Math.max(...allNotes);
      const noteRange = `${midiNoteToNoteName(minNote)} to ${midiNoteToNoteName(maxNote)}`;
      const delayInfo = entries.some(e => e.delay > 0) ? ' with staggered entries' : '';
      toast.success(`Fugue #${fuguesList.length + 1} generated with ${parts.length} voices across full range: ${noteRange}${delayInfo}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate fugue';
      setError(errorMessage);
      console.error('Fugue generation error:', err);
      toast.error('Failed to generate fugue');
    }
  }, [theme, selectedMode, stabilityMode, stabilityRatio, fuguesList.length, rhythmToNoteValues]);

  // NEW: Canon generation handler
  const handleGenerateCanon = useCallback((params: CanonParams) => {
    try {
      setError(null);
      
      // Validation
      if (!theme || theme.length === 0) {
        toast.error('Please create a theme first');
        return;
      }
      
      if (!selectedMode) {
        toast.error('Please select a mode first');
        return;
      }
      
      console.log('🎵 Generating canon:', params.type);
      
      // Generate the canon using the Canon Engine
      const canonResult = CanonEngine.generateCanon(theme, params, selectedMode);
      
      // Initialize instruments for canon voices
      const instrumentChoices: InstrumentType[] = ['piano', 'violin', 'flute', 'cello', 'harpsichord', 'bass', 'clarinet', 'oboe'];
      const instruments = canonResult.voices.map((_, index) => instrumentChoices[index % instrumentChoices.length]);
      const muted = canonResult.voices.map(() => false);
      
      // Add to canons list
      const newCanon: GeneratedCanon = {
        result: canonResult,
        instruments,
        muted,
        timestamp: Date.now()
      };
      
      setCanonsList(prev => [...prev, newCanon]);
      
      // ADDITIVE: Initialize rhythm data for canon voices - inherit from theme rhythm
      const canonVoiceRhythms: NoteValue[][] = canonResult.voices.map(voice => {
        // For each voice, create rhythm pattern matching voice length
        // If theme rhythm exists and matches, use it; otherwise default to quarter notes
        if (themeRhythm && voice.melody.length <= themeRhythm.length) {
          // Use theme rhythm for this voice
          return themeRhythm.slice(0, voice.melody.length);
        } else {
          // Generate rhythm pattern to match voice length
          // Repeat theme rhythm pattern if it exists
          const rhythm: NoteValue[] = [];
          for (let i = 0; i < voice.melody.length; i++) {
            if (themeRhythm && themeRhythm.length > 0) {
              rhythm.push(themeRhythm[i % themeRhythm.length]);
            } else {
              rhythm.push('quarter');
            }
          }
          return rhythm;
        }
      });
      
      setCanonRhythms(prev => new Map(prev).set(newCanon.timestamp, canonVoiceRhythms));
      
      console.log('🎵 Canon rhythm initialized:', {
        type: params.type,
        voices: canonResult.voices.length,
        themeRhythmLength: themeRhythm?.length || 0,
        voiceRhythms: canonVoiceRhythms.map(r => r.length)
      });
      
      // Show success toast
      toast.success(`${canonResult.metadata.type.replace(/_/g, ' ')} generated!`, {
        description: `${canonResult.voices.length} voices • ${canonResult.metadata.description}`
      });
      
      console.log('✅ Canon generated successfully:', canonResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate canon';
      setError(errorMessage);
      console.error('Canon generation error:', err);
      toast.error('Failed to generate canon');
    }
  }, [theme, selectedMode, themeRhythm]);

  const handleClearCanon = useCallback((index: number) => {
    try {
      setCanonsList(prev => prev.filter((_, i) => i !== index));
      toast.success(`Canon #${index + 1} cleared`);
    } catch (err) {
      console.error('Error clearing canon:', err);
      toast.error('Failed to clear canon');
    }
  }, []);

  const handleClearAllCanons = useCallback(() => {
    try {
      setCanonsList([]);
      toast.success('All canons cleared');
    } catch (err) {
      console.error('Error clearing all canons:', err);
      toast.error('Failed to clear all canons');
    }
  }, []);

  // NEW: Fugue Builder generation handler
  const handleGenerateFugueBuilder = useCallback((params: FugueParams) => {
    try {
      setError(null);
      
      // Validation
      if (!theme || theme.length === 0) {
        toast.error('Please create a theme first');
        return;
      }
      
      if (!selectedKeySignature) {
        toast.error('Please select a key signature first');
        return;
      }
      
      console.log('🎼 Generating fugue with AI engine:', params.architecture);
      console.log('🎵 Mode parameter:', selectedMode ? selectedMode.name : 'undefined');
      
      // FIX #1: Add mode to params for MODE_SHIFTING transformation support
      const paramsWithMode: FugueParams = {
        ...params,
        mode: selectedMode || undefined
      };
      
      // Generate the fugue using the Fugue Builder Engine with mode
      const fugueResult = FugueBuilderEngine.generateFugue(paramsWithMode);
      
      // Convert fugue result to parts for playback
      const parts = FugueBuilderEngine.fugueToParts(fugueResult);
      
      // Initialize instruments for fugue voices
      const instrumentChoices: InstrumentType[] = ['piano', 'violin', 'flute', 'cello', 'harpsichord', 'bass', 'clarinet', 'oboe'];
      const instruments = parts.map((_, index) => instrumentChoices[index % instrumentChoices.length]);
      const muted = parts.map(() => false);
      
      // Add to generated fugues list
      const newFugue: GeneratedFugueBuilder = {
        result: fugueResult,
        instruments,
        muted,
        timestamp: Date.now()
      };
      
      setGeneratedFugues(prev => [...prev, newFugue]);
      
      // ADDITIVE: Initialize rhythm data for fugue parts - inherit from theme rhythm
      const fuguePartRhythms: NoteValue[][] = parts.map(part => {
        // For each part, create rhythm pattern matching part length
        // If theme rhythm exists and matches, use it; otherwise default to quarter notes
        if (themeRhythm && part.melody.length <= themeRhythm.length) {
          // Use theme rhythm for this part
          return themeRhythm.slice(0, part.melody.length);
        } else {
          // Generate rhythm pattern to match part length
          // Repeat theme rhythm pattern if it exists
          const rhythm: NoteValue[] = [];
          for (let i = 0; i < part.melody.length; i++) {
            if (themeRhythm && themeRhythm.length > 0) {
              rhythm.push(themeRhythm[i % themeRhythm.length]);
            } else {
              rhythm.push('quarter');
            }
          }
          return rhythm;
        }
      });
      
      setFugueBuilderRhythms(prev => new Map(prev).set(newFugue.timestamp, fuguePartRhythms));
      
      console.log('🎵 Fugue rhythm initialized:', {
        architecture: params.architecture,
        parts: parts.length,
        themeRhythmLength: themeRhythm?.length || 0,
        partRhythms: fuguePartRhythms.map(r => r.length)
      });
      
      // Show success toast
      toast.success(`Fugue generated successfully!`, {
        description: `${params.architecture.replace(/_/g, ' ')} • ${params.numVoices} voices • ${params.totalMeasures} measures`
      });
      
      console.log('✅ Fugue generated successfully:', fugueResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate fugue';
      setError(errorMessage);
      console.error('Fugue Builder generation error:', err);
      toast.error('Failed to generate fugue');
    }
  }, [theme, selectedKeySignature, selectedMode, themeRhythm]);

  const handleClearFugueBuilder = useCallback((index: number) => {
    try {
      const fugue = generatedFugues[index];
      if (fugue) {
        // ADDITIVE: Clear rhythm data for this fugue
        setFugueBuilderRhythms(prev => {
          const newMap = new Map(prev);
          newMap.delete(fugue.timestamp);
          return newMap;
        });
      }
      setGeneratedFugues(prev => prev.filter((_, i) => i !== index));
      toast.success(`Fugue #${index + 1} cleared`);
    } catch (err) {
      console.error('Error clearing fugue:', err);
      toast.error('Failed to clear fugue');
    }
  }, [generatedFugues]);

  const handleClearAllFugueBuilders = useCallback(() => {
    try {
      // ADDITIVE: Clear all fugue rhythm data
      setFugueBuilderRhythms(new Map());
      setGeneratedFugues([]);
      toast.success('All fugues cleared');
    } catch (err) {
      console.error('Error clearing all fugues:', err);
      toast.error('Failed to clear all fugues');
    }
  }, []);

  const handleFugueBuilderPartInstrumentChange = useCallback((fugueIndex: number, partIndex: number, instrument: InstrumentType) => {
    try {
      setGeneratedFugues(prev => {
        const updated = [...prev];
        if (updated[fugueIndex]) {
          updated[fugueIndex] = {
            ...updated[fugueIndex],
            instruments: updated[fugueIndex].instruments.map((inst, i) => 
              i === partIndex ? instrument : inst
            )
          };
        }
        return updated;
      });
    } catch (err) {
      console.error('Error changing fugue part instrument:', err);
      toast.error('Failed to change instrument');
    }
  }, []);

  const handleFugueBuilderPartMuteToggle = useCallback((fugueIndex: number, partIndex: number) => {
    try {
      setGeneratedFugues(prev => {
        const updated = [...prev];
        if (updated[fugueIndex]) {
          updated[fugueIndex] = {
            ...updated[fugueIndex],
            muted: updated[fugueIndex].muted.map((m, i) => 
              i === partIndex ? !m : m
            )
          };
        }
        return updated;
      });
      toast.success(`Fugue part ${partIndex + 1} mute toggled`);
    } catch (err) {
      console.error('Error toggling fugue part mute:', err);
      toast.error('Failed to toggle mute');
    }
  }, []);

  // NEW: Harmony generation handler
  const handleHarmonyGenerated = useCallback((harmonizedPart: any, instrument: InstrumentType) => {
    try {
      console.log('🎵 Harmony generated, adding to list...');
      console.log('  Harmonized part:', harmonizedPart);
      console.log('  Instrument:', instrument);
      
      // Validate harmonized part structure
      if (!harmonizedPart || !harmonizedPart.melody || !Array.isArray(harmonizedPart.melody)) {
        console.error('❌ Invalid harmonized part structure:', harmonizedPart);
        toast.error('Invalid harmony data structure');
        return;
      }
      
      if (!harmonizedPart.analysis || !harmonizedPart.analysis.chordProgression) {
        console.error('❌ Missing analysis data in harmonized part');
        toast.error('Missing harmony analysis data');
        return;
      }
      
      // Create the harmony composition
      const newHarmony: GeneratedHarmony = {
        result: {
          melody: harmonizedPart.melody || [],
          originalMelody: harmonizedPart.originalMelody || [],
          harmonyNotes: harmonizedPart.harmonyNotes || [],
          harmonyRhythm: harmonizedPart.harmonyRhythm || [],
          chordLabels: harmonizedPart.chordLabels || [],
          analysis: {
            detectedKey: harmonizedPart.analysis.detectedKey || 0,
            keyQuality: harmonizedPart.analysis.keyQuality || 'major',
            chordProgression: harmonizedPart.analysis.chordProgression || [],
            chordRoots: harmonizedPart.analysis.chordRoots || [],
            chordTimings: harmonizedPart.analysis.chordTimings || [],
            confidence: harmonizedPart.analysis.confidence || 0
          }
        },
        instrument,
        muted: false,
        timestamp: Date.now()
      };
      
      setGeneratedHarmonies(prev => [...prev, newHarmony]);
      
      toast.success('Harmony added to Song Suite!', {
        description: `${harmonizedPart.chordLabels?.length || 0} chords • ${instrument}`
      });
      
      console.log('✅ Harmony added successfully to Song Suite');
    } catch (err) {
      console.error('❌ Error adding harmony to Song Suite:', err);
      toast.error('Failed to add harmony to Song Suite');
    }
  }, []);

  const handleClearHarmony = useCallback((index: number) => {
    try {
      setGeneratedHarmonies(prev => prev.filter((_, i) => i !== index));
      toast.success(`Harmony #${index + 1} cleared`);
    } catch (err) {
      console.error('Error clearing harmony:', err);
      toast.error('Failed to clear harmony');
    }
  }, []);

  const handleClearAllHarmonies = useCallback(() => {
    try {
      setGeneratedHarmonies([]);
      toast.success('All harmonies cleared');
    } catch (err) {
      console.error('Error clearing all harmonies:', err);
      toast.error('Failed to clear all harmonies');
    }
  }, []);

  const handleHarmonyInstrumentChange = useCallback((harmonyIndex: number, instrument: InstrumentType) => {
    try {
      setGeneratedHarmonies(prev => {
        const updated = [...prev];
        if (updated[harmonyIndex]) {
          updated[harmonyIndex] = {
            ...updated[harmonyIndex],
            instrument
          };
        }
        return updated;
      });
    } catch (err) {
      console.error('Error changing harmony instrument:', err);
      toast.error('Failed to change instrument');
    }
  }, []);

  const handleHarmonyMuteToggle = useCallback((harmonyIndex: number) => {
    try {
      setGeneratedHarmonies(prev => {
        const updated = [...prev];
        if (updated[harmonyIndex]) {
          updated[harmonyIndex] = {
            ...updated[harmonyIndex],
            muted: !updated[harmonyIndex].muted
          };
        }
        return updated;
      });
      toast.success('Harmony mute toggled');
    } catch (err) {
      console.error('Error toggling harmony mute:', err);
      toast.error('Failed to toggle mute');
    }
  }, []);

  // NEW: Arpeggio Chain handlers
  const handleArpeggioGenerated = useCallback((melody: Theme, rhythm: Rhythm, label: string, instrument: InstrumentType) => {
    try {
      console.log('🎵 Arpeggio chain generated, adding to list...');
      console.log('  Melody length:', melody.length);
      console.log('  Label:', label);
      console.log('  Instrument:', instrument);
      
      if (!melody || melody.length === 0) {
        console.error('❌ Invalid arpeggio melody');
        toast.error('Invalid arpeggio data');
        return;
      }
      
      const newArpeggio: GeneratedArpeggio = {
        melody,
        rhythm,
        label,
        instrument,
        muted: false,
        timestamp: Date.now()
      };
      
      setGeneratedArpeggios(prev => [...prev, newArpeggio]);
      
      toast.success('Arpeggio Chain added!', {
        description: `${melody.length} notes • ${instrument}`
      });
      
      console.log('✅ Arpeggio added successfully');
    } catch (err) {
      console.error('❌ Error adding arpeggio:', err);
      toast.error('Failed to add arpeggio');
    }
  }, []);

  const handleClearArpeggio = useCallback((index: number) => {
    try {
      setGeneratedArpeggios(prev => prev.filter((_, i) => i !== index));
      toast.success(`Arpeggio #${index + 1} cleared`);
    } catch (err) {
      console.error('Error clearing arpeggio:', err);
      toast.error('Failed to clear arpeggio');
    }
  }, []);

  const handleClearAllArpeggios = useCallback(() => {
    try {
      setGeneratedArpeggios([]);
      toast.success('All arpeggios cleared');
    } catch (err) {
      console.error('Error clearing all arpeggios:', err);
      toast.error('Failed to clear all arpeggios');
    }
  }, []);

  const handleArpeggioInstrumentChange = useCallback((arpeggioIndex: number, instrument: InstrumentType) => {
    try {
      setGeneratedArpeggios(prev => {
        const updated = [...prev];
        if (updated[arpeggioIndex]) {
          updated[arpeggioIndex] = {
            ...updated[arpeggioIndex],
            instrument
          };
        }
        return updated;
      });
    } catch (err) {
      console.error('Error changing arpeggio instrument:', err);
      toast.error('Failed to change instrument');
    }
  }, []);

  const handleArpeggioMuteToggle = useCallback((arpeggioIndex: number) => {
    try {
      setGeneratedArpeggios(prev => {
        const updated = [...prev];
        if (updated[arpeggioIndex]) {
          updated[arpeggioIndex] = {
            ...updated[arpeggioIndex],
            muted: !updated[arpeggioIndex].muted
          };
        }
        return updated;
      });
      toast.success('Arpeggio mute toggled');
    } catch (err) {
      console.error('Error toggling arpeggio mute:', err);
      toast.error('Failed to toggle mute');
    }
  }, []);

  // ADDITIVE: Composer Accompaniment Library handlers
  const handleAccompanimentApplyToTheme = useCallback((melody: MidiNote[], rhythm: NoteValue[], label: string) => {
    try {
      console.log('🎼 Applying composer accompaniment to theme...');
      console.log('  Label:', label);
      console.log('  Melody length:', melody.length);
      
      if (!melody || melody.length === 0) {
        toast.error('Invalid accompaniment data');
        return;
      }

      // Add as a new arpeggio (accompaniments work like arpeggios in the system)
      const newArpeggio: GeneratedArpeggio = {
        melody,
        rhythm,
        label,
        instrument: 'piano', // Default to piano for accompaniments
        muted: false,
        timestamp: Date.now()
      };
      
      setGeneratedArpeggios(prev => [...prev, newArpeggio]);
      
      toast.success('Composer accompaniment applied!', {
        description: `${label} • ${melody.length} notes`
      });
      
      console.log('✅ Accompaniment applied successfully');
    } catch (err) {
      console.error('❌ Error applying accompaniment:', err);
      toast.error('Failed to apply accompaniment');
    }
  }, []);

  const handleAccompanimentApplyToBachVariable = useCallback((
    variable: BachVariableName,
    melody: MidiNote[],
    rhythm: NoteValue[]
  ) => {
    try {
      console.log('🎼 Applying composer accompaniment to Bach Variable...');
      console.log('  Variable:', variable);
      console.log('  Melody length:', melody.length);
      
      if (!melody || melody.length === 0) {
        toast.error('Invalid accompaniment data');
        return;
      }

      // Add to Bach variable
      const newVariables = {
        ...bachVariables,
        [variable]: [...bachVariables[variable], ...melody]
      };
      setBachVariables(newVariables);

      // Also store rhythm if provided
      if (rhythm && rhythm.length > 0) {
        const newRhythms = {
          ...bachVariableRhythms,
          [variable]: [...(bachVariableRhythms[variable] || []), ...rhythm]
        };
        setBachVariableRhythms(newRhythms);
      }
      
      toast.success('Accompaniment added to Bach Variable!', {
        description: `${variable} • ${melody.length} notes`
      });
      
      console.log('✅ Accompaniment added to Bach Variable successfully');
    } catch (err) {
      console.error('❌ Error applying accompaniment to Bach Variable:', err);
      toast.error('Failed to apply accompaniment to Bach Variable');
    }
  }, [bachVariables, bachVariableRhythms]);

  const handleAccompanimentPlay = useCallback(async (melody: (MidiNote | MidiNote[] | -1)[], rhythm: NoteValue[]) => {
    try {
      console.log('🎵 Playing accompaniment preview...');
      
      if (!melody || melody.length === 0) {
        toast.error('No accompaniment to preview');
        return;
      }

      // Use soundfont for playback - MUST AWAIT the promise!
      const soundfontEngine = await getSoundfontEngine();
      
      // Create a simple playback using the soundfont engine
      const beatsPerNote = rhythm.map(noteValue => {
        const beatMap: Record<NoteValue, number> = {
          'whole': 4,
          'dotted-half': 3,
          'half': 2,
          'dotted-quarter': 1.5,
          'quarter': 1,
          'eighth': 0.5,
          'sixteenth': 0.25,
          'double-whole': 8
        };
        return beatMap[noteValue] || 1;
      });

      const tempo = 120; // BPM
      const secondsPerBeat = 60 / tempo;

      // Play notes sequentially (with chord support)
      let currentTime = 0;
      for (let index = 0; index < melody.length; index++) {
        const noteOrChord = melody[index];
        const duration = (beatsPerNote[index] || 1) * secondsPerBeat;
        
        setTimeout(async () => {
          try {
            // ADDITIVE: Handle rests
            if (noteOrChord === -1) {
              // Rest - do nothing
              return;
            }
            
            // ADDITIVE: Handle chords (array of notes)
            if (Array.isArray(noteOrChord)) {
              console.log(`🎹 Playing chord:`, noteOrChord);
              // Play all notes in the chord simultaneously
              const chordPromises = noteOrChord.map((note, idx) => {
                console.log(`  Note ${idx}: ${note} (type: ${typeof note})`);
                return soundfontEngine.playNote(note, duration, 'piano', 0.7);
              });
              await Promise.all(chordPromises);
            } else {
              // Single note
              console.log(`🎵 Playing single note: ${noteOrChord} (type: ${typeof noteOrChord})`);
              await soundfontEngine.playNote(noteOrChord, duration, 'piano', 0.7);
            }
          } catch (playError) {
            console.error('Error playing note:', playError);
          }
        }, currentTime * 1000);
        
        currentTime += (beatsPerNote[index] || 1) * secondsPerBeat;
      }

      toast.success('Playing accompaniment preview...', {
        description: `${melody.length} notes`
      });
      
    } catch (err) {
      console.error('❌ Error playing accompaniment:', err);
      toast.error('Failed to play accompaniment');
    }
  }, []);

  // ADDITIVE: NEW Composer Accompaniment handlers for Song Suite integration
  const handleAccompanimentAddToSongSuite = useCallback((melody: (MidiNote | MidiNote[] | -1)[], rhythm: NoteValue[], label: string) => {
    try {
      console.log('🎼 Adding composer accompaniment to Song Suite...');
      console.log('  Label:', label);
      console.log('  Melody length:', melody.length);
      
      if (!melody || melody.length === 0) {
        toast.error('Invalid accompaniment data');
        return;
      }

      const newAccompaniment: GeneratedAccompaniment = {
        melody,
        rhythm,
        label,
        instrument: 'piano', // Default to piano for accompaniments
        muted: false,
        timestamp: Date.now()
      };
      
      setGeneratedAccompaniments(prev => [...prev, newAccompaniment]);
      
      toast.success('Accompaniment added to Song Suite!', {
        description: `${label} • ${melody.length} notes`
      });
      
      console.log('✅ Accompaniment added to Song Suite successfully');
    } catch (err) {
      console.error('❌ Error adding accompaniment:', err);
      toast.error('Failed to add accompaniment');
    }
  }, []);

  const handleClearAccompaniment = useCallback((timestamp: number) => {
    try {
      setGeneratedAccompaniments(prev => prev.filter(acc => acc.timestamp !== timestamp));
      toast.success('Accompaniment removed');
    } catch (err) {
      console.error('Error removing accompaniment:', err);
      toast.error('Failed to remove accompaniment');
    }
  }, []);

  const handleClearAllAccompaniments = useCallback(() => {
    try {
      setGeneratedAccompaniments([]);
      toast.success('All accompaniments cleared');
    } catch (err) {
      console.error('Error clearing all accompaniments:', err);
      toast.error('Failed to clear all accompaniments');
    }
  }, []);

  const handleAccompanimentInstrumentChange = useCallback((timestamp: number, instrument: InstrumentType) => {
    try {
      setGeneratedAccompaniments(prev => 
        prev.map(acc => 
          acc.timestamp === timestamp 
            ? { ...acc, instrument }
            : acc
        )
      );
    } catch (err) {
      console.error('Error changing accompaniment instrument:', err);
      toast.error('Failed to change instrument');
    }
  }, []);

  const handleAccompanimentMuteToggle = useCallback((timestamp: number) => {
    try {
      setGeneratedAccompaniments(prev => 
        prev.map(acc => 
          acc.timestamp === timestamp 
            ? { ...acc, muted: !acc.muted }
            : acc
        )
      );
      toast.success('Accompaniment mute toggled');
    } catch (err) {
      console.error('Error toggling accompaniment mute:', err);
      toast.error('Failed to toggle mute');
    }
  }, []);

  const handleCanonPartInstrumentChange = useCallback((canonIndex: number, partIndex: number, instrument: InstrumentType) => {
    try {
      setCanonsList(prev => {
        const updated = [...prev];
        if (updated[canonIndex]) {
          updated[canonIndex] = {
            ...updated[canonIndex],
            instruments: updated[canonIndex].instruments.map((inst, i) => 
              i === partIndex ? instrument : inst
            )
          };
        }
        return updated;
      });
    } catch (err) {
      console.error('Error changing canon part instrument:', err);
      toast.error('Failed to change instrument');
    }
  }, []);

  const handleCanonPartMuteToggle = useCallback((canonIndex: number, partIndex: number) => {
    try {
      setCanonsList(prev => {
        const updated = [...prev];
        if (updated[canonIndex]) {
          updated[canonIndex] = {
            ...updated[canonIndex],
            muted: updated[canonIndex].muted.map((m, i) => 
              i === partIndex ? !m : m
            )
          };
        }
        return updated;
      });
      toast.success(`Canon part ${partIndex + 1} mute toggled`);
    } catch (err) {
      console.error('Error toggling canon part mute:', err);
      toast.error('Failed to toggle mute');
    }
  }, []);

  const handleGenerateStabilityTheme = useCallback(() => {
    try {
      setError(null);
      
      if (!selectedMode) {
        toast.error('Please select a mode first');
        return;
      }
      
      const themeLength = theme && theme.length > 0 ? theme.length : 8;
      
      // Generate pitch classes first then convert to MIDI notes
      const pitchClassTheme = MusicalEngine.generateStabilityBiasedTheme(
        themeLength, 
        selectedMode, 
        stabilityMode, 
        stabilityRatio
      );
      
      if (!pitchClassTheme || pitchClassTheme.length === 0) {
        setError('Generated theme is empty - please try different settings');
        return;
      }
      
      // Convert pitch classes to MIDI notes in octave 4
      const newTheme = pitchClassTheme.map(pitchClass => pitchClassToMidiNote(pitchClass));
      
      setOptimizedTheme(newTheme);
      toast.success('New stability-based theme generated!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate stability theme';
      setError(errorMessage);
      console.error('Stability theme generation error:', err);
      toast.error('Failed to generate new theme');
    }
  }, [selectedMode, theme, stabilityMode, stabilityRatio]);

  const handleClearImitation = useCallback((index: number) => {
    try {
      const imitation = imitationsList[index];
      if (imitation) {
        // Remove rhythm data for this imitation
        setImitationRhythms(prev => {
          const newMap = new Map(prev);
          newMap.delete(imitation.timestamp);
          return newMap;
        });
      }
      setImitationsList(prev => prev.filter((_, i) => i !== index));
      toast.success(`Imitation #${index + 1} cleared`);
    } catch (err) {
      console.error('Error clearing imitation:', err);
      toast.error('Failed to clear imitation');
    }
  }, [imitationsList]);

  const handleClearFugue = useCallback((index: number) => {
    try {
      const fugue = fuguesList[index];
      if (fugue) {
        // Remove rhythm data for this fugue
        setFugueRhythms(prev => {
          const newMap = new Map(prev);
          newMap.delete(fugue.timestamp);
          return newMap;
        });
      }
      setFuguesList(prev => prev.filter((_, i) => i !== index));
      toast.success(`Fugue #${index + 1} cleared`);
    } catch (err) {
      console.error('Error clearing fugue:', err);
      toast.error('Failed to clear fugue');
    }
  }, [fuguesList]);

  const handleClearAllImitations = useCallback(() => {
    try {
      setImitationsList([]);
      setImitationRhythms(new Map());
      toast.success('All imitations cleared');
    } catch (err) {
      console.error('Error clearing all imitations:', err);
      toast.error('Failed to clear all imitations');
    }
  }, []);

  const handleClearAllFugues = useCallback(() => {
    try {
      setFuguesList([]);
      setFugueRhythms(new Map());
      toast.success('All fugues cleared');
    } catch (err) {
      console.error('Error clearing all fugues:', err);
      toast.error('Failed to clear all fugues');
    }
  }, []);

  const handlePartInstrumentChange = (compositionType: 'imitation' | 'fugue', compositionIndex: number, partIndex: number, instrument: InstrumentType) => {
    try {
      if (compositionType === 'imitation') {
        setImitationsList(prev => {
          const updated = [...prev];
          if (updated[compositionIndex]) {
            updated[compositionIndex] = {
              ...updated[compositionIndex],
              instruments: updated[compositionIndex].instruments.map((inst, i) => 
                i === partIndex ? instrument : inst
              )
            };
          }
          return updated;
        });
      } else {
        setFuguesList(prev => {
          const updated = [...prev];
          if (updated[compositionIndex]) {
            updated[compositionIndex] = {
              ...updated[compositionIndex],
              instruments: updated[compositionIndex].instruments.map((inst, i) => 
                i === partIndex ? instrument : inst
              )
            };
          }
          return updated;
        });
      }
    } catch (err) {
      console.error('Error changing part instrument:', err);
      toast.error('Failed to change instrument');
    }
  };

  const handlePartMuteToggle = (compositionType: 'imitation' | 'fugue', compositionIndex: number, partIndex: number) => {
    try {
      if (compositionType === 'imitation') {
        setImitationsList(prev => {
          const updated = [...prev];
          if (updated[compositionIndex]) {
            updated[compositionIndex] = {
              ...updated[compositionIndex],
              muted: updated[compositionIndex].muted.map((m, i) => 
                i === partIndex ? !m : m
              )
            };
          }
          return updated;
        });
      } else {
        setFuguesList(prev => {
          const updated = [...prev];
          if (updated[compositionIndex]) {
            updated[compositionIndex] = {
              ...updated[compositionIndex],
              muted: updated[compositionIndex].muted.map((m, i) => 
                i === partIndex ? !m : m
              )
            };
          }
          return updated;
        });
      }
      
      toast.success(`Part ${partIndex + 1} ${compositionType === 'imitation' ? 'imitation' : 'fugue'} toggled`);
    } catch (err) {
      console.error('Error toggling part mute:', err);
      toast.error('Failed to toggle mute');
    }
  };

  const handleCounterpointInstrumentChange = useCallback((index: number, instrument: InstrumentType) => {
    try {
      setGeneratedCounterpoints(prev => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            instrument
          };
        }
        return updated;
      });
    } catch (err) {
      console.error('Error changing counterpoint instrument:', err);
      toast.error('Failed to change instrument');
    }
  }, []);

  const handleCounterpointMuteToggle = useCallback((index: number) => {
    try {
      setGeneratedCounterpoints(prev => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            muted: !updated[index].muted
          };
        }
        return updated;
      });
      toast.success(`Counterpoint ${index + 1} mute toggled`);
    } catch (err) {
      console.error('Error toggling counterpoint mute:', err);
      toast.error('Failed to toggle mute');
    }
  }, []);

  // Rhythm change handlers
  const handleThemeRhythmChange = useCallback((rhythm: NoteValue[]) => {
    if (!rhythm || rhythm.length === 0) return;
    setThemeRhythm(rhythm);
    console.log('🎵 Theme rhythm updated:', rhythm.length, 'values');
  }, []);

  const handleBachVariableRhythmChange = useCallback((variableName: BachVariableName, rhythm: NoteValue[]) => {
    if (!rhythm || rhythm.length === 0 || !variableName) return;
    setBachVariableRhythms(prev => ({
      ...prev,
      [variableName]: rhythm
    }));
    console.log(`🎵 ${variableName} rhythm updated:`, rhythm.length, 'values');
  }, []);

  const handleImitationRhythmChange = useCallback((timestamp: number, partIndex: number, rhythm: NoteValue[]) => {
    if (!rhythm || rhythm.length === 0) return;
    
    setImitationRhythms(prev => {
      const newMap = new Map(prev);
      const partRhythms = newMap.get(timestamp) || [];
      const updatedPartRhythms = [...partRhythms];
      updatedPartRhythms[partIndex] = rhythm;
      newMap.set(timestamp, updatedPartRhythms);
      return newMap;
    });
    console.log(`🎵 Imitation part ${partIndex + 1} rhythm updated:`, rhythm.length, 'values');
  }, []);

  const handleFugueRhythmChange = useCallback((timestamp: number, voiceIndex: number, rhythm: NoteValue[]) => {
    if (!rhythm || rhythm.length === 0) return;
    
    setFugueRhythms(prev => {
      const newMap = new Map(prev);
      const voiceRhythms = newMap.get(timestamp) || [];
      const updatedVoiceRhythms = [...voiceRhythms];
      updatedVoiceRhythms[voiceIndex] = rhythm;
      newMap.set(timestamp, updatedVoiceRhythms);
      return newMap;
    });
    console.log(`🎵 Fugue voice ${voiceIndex + 1} rhythm updated:`, rhythm.length, 'values');
  }, []);

  const handleCounterpointRhythmChange = useCallback((timestamp: number, rhythm: NoteValue[]) => {
    if (!rhythm || rhythm.length === 0) return;
    
    setCounterpointRhythms(prev => {
      const newMap = new Map(prev);
      newMap.set(timestamp, rhythm);
      return newMap;
    });
    console.log(`🎵 Counterpoint rhythm updated:`, rhythm.length, 'values');
  }, []);

  // ADDITIVE: Canon rhythm change handler
  const handleCanonRhythmChange = useCallback((timestamp: number, voiceIndex: number, rhythm: NoteValue[]) => {
    if (!rhythm || rhythm.length === 0) return;
    
    setCanonRhythms(prev => {
      const newMap = new Map(prev);
      const voiceRhythms = newMap.get(timestamp) || [];
      const updatedVoiceRhythms = [...voiceRhythms];
      updatedVoiceRhythms[voiceIndex] = rhythm;
      newMap.set(timestamp, updatedVoiceRhythms);
      return newMap;
    });
    console.log(`🎵 Canon voice ${voiceIndex + 1} rhythm updated:`, rhythm.length, 'values');
  }, []);

  // ADDITIVE: Fugue Builder rhythm change handler
  const handleFugueBuilderRhythmChange = useCallback((timestamp: number, partIndex: number, rhythm: NoteValue[]) => {
    if (!rhythm || rhythm.length === 0) return;
    
    setFugueBuilderRhythms(prev => {
      const newMap = new Map(prev);
      const partRhythms = newMap.get(timestamp) || [];
      const updatedPartRhythms = [...partRhythms];
      updatedPartRhythms[partIndex] = rhythm;
      newMap.set(timestamp, updatedPartRhythms);
      return newMap;
    });
    console.log(`🎵 Fugue Builder part ${partIndex + 1} rhythm updated:`, rhythm.length, 'values');
  }, []);

  // ADDITIVE: Arpeggio rhythm change handler
  const handleArpeggioRhythmChange = useCallback((timestamp: number, rhythm: NoteValue[]) => {
    if (!rhythm || rhythm.length === 0) return;
    
    setArpeggioRhythms(prev => {
      const newMap = new Map(prev);
      newMap.set(timestamp, rhythm);
      return newMap;
    });
    console.log(`🎵 Arpeggio rhythm updated:`, rhythm.length, 'values');
  }, []);

  // RHYTHM FIX: Helper function to apply custom rhythm to parts for playback and export
  // CRITICAL: Must include BOTH rhythm (legacy) and noteValues (high-precision) for proper playback
  const applyRhythmToParts = useCallback((parts: Part[], rhythms: NoteValue[][]): Part[] => {
    if (!parts || !Array.isArray(parts) || parts.length === 0) return [];
    if (!rhythms || !Array.isArray(rhythms) || rhythms.length === 0) return parts;

    return parts.map((part, index) => {
      if (!part || !part.melody || !Array.isArray(part.melody) || part.melody.length === 0) return part;
      
      const customRhythm = rhythms[index];
      if (!customRhythm || !Array.isArray(customRhythm) || customRhythm.length === 0) return part;
      
      const beatRhythm = noteValuesToRhythm(customRhythm);
      return {
        melody: part.melody,
        rhythm: beatRhythm,
        noteValues: customRhythm  // ADDITIVE FIX: Include high-precision note values for proper sixteenth/dotted note playback
      };
    });
  }, []);

  // Bach variables handlers with basic optimization
  const handleBachVariablesChange = useCallback((variables: BachLikeVariables) => {
    try {
      // Basic optimization: limit each variable to 32 notes max
      const optimizedVariables = { ...variables };
      Object.keys(optimizedVariables).forEach(key => {
        if (Array.isArray(optimizedVariables[key as keyof BachLikeVariables]) && 
            optimizedVariables[key as keyof BachLikeVariables].length > 32) {
          (optimizedVariables[key as keyof BachLikeVariables] as number[]) = 
            (optimizedVariables[key as keyof BachLikeVariables] as number[]).slice(0, 32);
        }
      });
      
      setBachVariables(optimizedVariables);
      
      // Sync rhythm lengths for changed variables
      setBachVariableRhythms(prev => {
        try {
          const updated = { ...prev };
          Object.keys(optimizedVariables).forEach(key => {
            const bachKey = key as BachVariableName;
            const varData = optimizedVariables[bachKey];
            const varLength = Array.isArray(varData) ? varData.length : 0;
            const currentRhythm = Array.isArray(updated[bachKey]) ? updated[bachKey] : [];
            
            // Extend or trim rhythm to match variable length
            if (currentRhythm.length !== varLength) {
              const newRhythm = [...currentRhythm];
              while (newRhythm.length < varLength) {
                newRhythm.push('quarter');
              }
              if (newRhythm.length > varLength) {
                newRhythm.length = varLength;
              }
              updated[bachKey] = newRhythm;
            }
          });
          return updated;
        } catch (error) {
          console.error('Error syncing Bach variable rhythms:', error);
          return prev;
        }
      });
    } catch (err) {
      console.error('Error updating Bach variables:', err);
      toast.error('Failed to update Bach variables');
    }
  }, []);

  const handleClearBachVariable = useCallback((variableName: BachVariableName) => {
    try {
      setBachVariables(prev => ({
        ...prev,
        [variableName]: []
      }));
      toast.success(`Bach variable ${variableName} cleared`);
    } catch (err) {
      console.error('Error clearing Bach variable:', err);
      toast.error('Failed to clear Bach variable');
    }
  }, []);

  const handleCounterpointGenerated = useCallback((counterpoint: Theme, technique: string, rhythm?: Rhythm) => {
    try {
      // Limit counterpoint length and keep only 3 most recent
      const limitedCounterpoint = counterpoint.slice(0, 24);
      const limitedRhythm = rhythm ? rhythm.slice(0, 24) : undefined;
      
      // Create a counterpoint composition with instrument, mute info, and optional rhythm
      const newCounterpoint: CounterpointComposition = {
        melody: limitedCounterpoint,
        rhythm: limitedRhythm, // Include rhythm data from species counterpoint
        instrument: 'violin', // Default to violin for counterpoints
        muted: false,
        timestamp: Date.now(),
        technique
      };
      
      setGeneratedCounterpoints(prev => [newCounterpoint, ...prev.slice(0, 2)]);
      
      // Initialize rhythm with either species rhythm or quarter notes
      const initialRhythm: NoteValue[] = limitedRhythm 
        ? limitedRhythm.map(beat => {
            // Convert beat duration to NoteValue
            if (beat === 0.25) return 'sixteenth';
            if (beat === 0.5) return 'eighth';
            if (beat === 1) return 'quarter';
            if (beat === 1.5) return 'dotted-quarter';
            if (beat === 2) return 'half';
            if (beat === 3) return 'dotted-half';
            if (beat === 4) return 'whole';
            if (beat === 8) return 'double-whole';
            return 'quarter'; // Default fallback
          })
        : Array(limitedCounterpoint.length).fill('quarter' as NoteValue);
      
      setCounterpointRhythms(prev => new Map(prev).set(newCounterpoint.timestamp, initialRhythm));
      
      const noteNames = limitedCounterpoint.slice(0, 3).map(note => midiNoteToNoteName(note)).join(', ');
      const rhythmInfo = rhythm ? ' (with rhythm data)' : '';
      toast.success(`Generated ${technique}: ${noteNames}${limitedCounterpoint.length > 3 ? '...' : ''}${rhythmInfo}`);
    } catch (err) {
      console.error('Error handling counterpoint generation:', err);
      toast.error('Failed to process generated counterpoint');
    }
  }, []);

  // Advanced counterpoint handler
  const handleAdvancedCounterpointGenerated = useCallback((counterpoints: Theme[], technique: string, analysis?: any) => {
    try {
      // Process multiple counterpoints from advanced engine
      const limitedCounterpoints = counterpoints.map(cp => cp.slice(0, 24));
      
      // Instrument choices for multiple voices
      const instrumentChoices: InstrumentType[] = ['violin', 'flute', 'cello', 'clarinet', 'oboe', 'bassoon'];
      
      // Create counterpoint compositions with instrument and mute info
      const newCounterpoints: CounterpointComposition[] = limitedCounterpoints.map((cp, index) => ({
        melody: cp,
        instrument: instrumentChoices[index % instrumentChoices.length],
        muted: false,
        timestamp: Date.now() + index, // Ensure unique timestamps
        technique: `${technique} Voice ${index + 1}`
      }));
      
      // Initialize rhythm for each new counterpoint with quarter notes
      newCounterpoints.forEach(cp => {
        const initialRhythm: NoteValue[] = Array(cp.melody.length).fill('quarter' as NoteValue);
        setCounterpointRhythms(prev => new Map(prev).set(cp.timestamp, initialRhythm));
      });
      
      // Add all counterpoints to the generated list, but limit total to 5
      setGeneratedCounterpoints(prev => {
        const combined = [...newCounterpoints, ...prev];
        return combined.slice(0, 5);
      });
      
      if (analysis) {
        const qualityPercent = Math.round(analysis.overall_quality * 100);
        toast.success(`Advanced ${technique} generated! Quality: ${qualityPercent}% • ${counterpoints.length} voices`);
      } else {
        toast.success(`Advanced ${technique} generated! ${counterpoints.length} voices created`);
      }
      
      console.log('🎼 Advanced counterpoint generated:', {
        technique,
        voices: counterpoints.length,
        analysis: analysis || 'No analysis available'
      });
    } catch (err) {
      console.error('Error handling advanced counterpoint generation:', err);
      toast.error('Failed to process advanced counterpoint');
    }
  }, []);

  // Song handlers
  const handleSongExport = useCallback((song: Song) => {
    setCurrentSong(song);
    setSongTab('export');
    toast.success('Song ready for export - switched to Export tab');
  }, []);

  const handleSongUpdate = useCallback((updatedSong: Song) => {
    setCurrentSong(updatedSong);
  }, []);

  // Handler for clicking virtual piano keys (visual keyboard)
  const handlePianoNoteAdd = useCallback((midiNote: number) => {
    try {
      console.log('🎹 Virtual piano key clicked:', midiNote, midiNoteToNoteName(midiNote));
      console.log('🎹 Routing to target:', midiTarget);
      
      // Show MIDI activity indicator
      setMidiActivity(true);
      setTimeout(() => setMidiActivity(false), 200);
      
      // Route to the appropriate target
      if (midiTarget === 'theme') {
        setOptimizedTheme(prevTheme => {
          const newTheme = [...prevTheme, midiNote];
          toast.success(`Added ${midiNoteToNoteName(midiNote)} to theme`);
          return newTheme;
        });
      } else if (midiTarget && midiTarget !== 'theme') {
        setBachVariables(prev => {
          const currentMelody = prev[midiTarget] || [];
          const newVariables = {
            ...prev,
            [midiTarget]: [...currentMelody, midiNote].slice(0, 32)
          };
          toast.success(`Added ${midiNoteToNoteName(midiNote)} to ${midiTarget}`);
          return newVariables;
        });
      } else {
        toast.warning('No valid MIDI target selected');
      }
    } catch (err) {
      console.error('Error adding virtual piano note:', err);
      toast.error('Failed to add note');
    }
  }, [midiTarget, setOptimizedTheme]);

  // Handler for MIDI keyboard input (physical MIDI device)
  // This is called from PianoKeyboard component when physical MIDI device sends notes
  const handleMidiNotesRecorded = (notes: MidiNote[]) => {
    try {
      if (!Array.isArray(notes) || notes.length === 0) {
        toast.info('No notes recorded');
        return;
      }
      
      console.log('🎹 App.tsx: handleMidiNotesRecorded called with notes:', notes);
      console.log('🎹 App.tsx: Current MIDI target:', midiTarget);
      
      // Show MIDI activity indicator
      setMidiActivity(true);
      setTimeout(() => setMidiActivity(false), 500);
      
      // Validate and limit notes
      const validNotes = notes
        .filter(note => typeof note === 'number' && note >= 0 && note <= 127)
        .slice(0, 10); // Limit to 10 notes to prevent memory issues
      
      if (validNotes.length === 0) {
        toast.error('No valid notes in recording');
        return;
      }
      
      // Note: Piano keyboard visual feedback is already handled in PianoKeyboard component
      // via triggerKeyByMidi() call before onMidiNotesRecorded() is called
      console.log('🎹 App.tsx: Processing MIDI notes for routing to target:', midiTarget);
      
      // For notes outside piano range, trigger visual feedback manually if needed
      validNotes.forEach(note => {
        const isInPianoRange = note >= (pianoStartOctave * 12) && note < ((pianoStartOctave + pianoOctaveRange) * 12);
        if (!isInPianoRange && pianoKeyboardRef.current) {
          console.log('🎹 App.tsx: Note outside piano range, no visual feedback:', note, midiNoteToNoteName(note));
        }
      });
      
      // Route to the appropriate target
      if (midiTarget === 'theme') {
        setOptimizedTheme(prevTheme => {
          const newTheme = [...prevTheme, ...validNotes];
          const noteNames = validNotes.slice(0, 3).map(note => midiNoteToNoteName(note)).join(', ');
          const displayText = validNotes.length > 3 ? `${noteNames}...` : noteNames;
          toast.success(`Added ${validNotes.length} notes to theme: ${displayText}`);
          return newTheme;
        });
      } else if (midiTarget && midiTarget !== 'theme') {
        setBachVariables(prev => {
          // Create variable if it doesn't exist yet (for newly created variables)
          const currentMelody = prev[midiTarget] || [];
          const newVariables = {
            ...prev,
            [midiTarget]: [...currentMelody, ...validNotes].slice(0, 32) // Limit Bach variables
          };
          
          const noteNames = validNotes.slice(0, 3).map(note => midiNoteToNoteName(note)).join(', ');
          const displayText = validNotes.length > 3 ? `${noteNames}...` : noteNames;
          toast.success(`Added ${validNotes.length} notes to ${midiTarget}: ${displayText}`);
          
          return newVariables;
        });
      } else {
        toast.warning('No valid MIDI target selected');
      }
    } catch (err) {
      console.error('Error processing MIDI notes:', err);
      toast.error('Failed to process MIDI recording');
    }
  };

  // Handler for changing MIDI routing target
  const handleMidiTargetChange = useCallback((target: BachVariableName | 'theme' | null) => {
    try {
      setMidiTarget(target);
      console.log('🎯 MIDI target changed to:', target);
      const targetName = target === 'theme' ? 'Main Theme' : target || 'None';
      toast.success(`MIDI keyboard will now add notes to ${targetName}`);
    } catch (err) {
      console.error('Error changing MIDI target:', err);
      toast.error('Failed to change MIDI target');
    }
  }, []);



  const getSessionData = useCallback(() => {
    // Limit data to prevent memory issues
    const limitedTheme = theme.length > 32 ? theme.slice(0, 32) : theme;
    const limitedImitations = imitationsList.length > 5 ? imitationsList.slice(0, 5) : imitationsList;
    const limitedFugues = fuguesList.length > 5 ? fuguesList.slice(0, 5) : fuguesList;
    
    return {
      theme: limitedTheme,
      selectedMode,
      selectedKeySignature,
      imitationsList: limitedImitations,
      fuguesList: limitedFugues,
      bachVariables,
      preferences: {
        backgroundTheme,
        selectedInstrument,
        stabilityMode,
        stabilityRatio,
        pianoOctaveRange,
        pianoStartOctave,
        uiTheme,
        isDarkMode
      },
      timestamp: new Date().toISOString()
    };
  }, [
    theme,
    selectedMode,
    selectedKeySignature,
    imitationsList,
    fuguesList,
    bachVariables,
    backgroundTheme,
    selectedInstrument,
    stabilityMode,
    stabilityRatio,
    pianoOctaveRange,
    pianoStartOctave,
    uiTheme,
    isDarkMode
  ]);

  const handleLoadSession = useCallback((data: any) => {
    try {
      // Add timeout protection for session loading
      if (data.theme) setOptimizedTheme(data.theme);
      if (data.selectedMode && Array.isArray(modeCategories)) {
        // First try to find by name, then by index as fallback
        const allModes = modeCategories.flatMap(cat => Array.isArray(cat?.modes) ? cat.modes : []);
        const mode = allModes.find(m => m?.name === data.selectedMode.name) || 
                    allModes.find(m => m?.index === data.selectedMode.index);
        if (mode) {
          setSelectedMode(mode);
        } else {
          // If mode not found, keep current selection or default
          console.warn('Saved mode not found, keeping current selection');
        }
      }
      if (data.selectedKeySignature) {
        const keySignature = KEY_SIGNATURES.find(
          ks => ks.name === data.selectedKeySignature.name || 
               (ks.key === data.selectedKeySignature.key && ks.mode === data.selectedKeySignature.mode)
        );
        if (keySignature) setSelectedKeySignature(keySignature);
      }
      if (data.imitationsList) setImitationsList(data.imitationsList);
      if (data.fuguesList) setFuguesList(data.fuguesList);
      if (data.bachVariables) setBachVariables(data.bachVariables);
      if (data.preferences) {
        if (data.preferences.backgroundTheme) setBackgroundTheme(data.preferences.backgroundTheme);
        if (data.preferences.selectedInstrument) setSelectedInstrument(data.preferences.selectedInstrument);
        if (data.preferences.stabilityMode) setStabilityMode(data.preferences.stabilityMode);
        if (data.preferences.stabilityRatio !== undefined) setStabilityRatio(data.preferences.stabilityRatio);
        if (data.preferences.pianoOctaveRange !== undefined) setPianoOctaveRange(data.preferences.pianoOctaveRange);
        if (data.preferences.pianoStartOctave !== undefined) setPianoStartOctave(data.preferences.pianoStartOctave);
        
        // Load UI theme preferences
        if (data.preferences.uiTheme) {
          try {
            setUITheme(data.preferences.uiTheme);
            applyUITheme(data.preferences.uiTheme, data.preferences.isDarkMode || false);
          } catch (error) {
            console.error('Error loading UI theme from session:', error);
          }
        }
        if (data.preferences.isDarkMode !== undefined) {
          setIsDarkMode(data.preferences.isDarkMode);
          if (data.preferences.isDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }
      
      toast.success('Session loaded successfully!');
    } catch (err) {
      setError('Failed to load session data');
      console.error('Session load error:', err);
      toast.error('Failed to load session data');
    }
  }, [modeCategories]);

  // MIDI file import handlers
  const handleMidiThemeImported = useCallback((importedTheme: Theme) => {
    try {
      // Limit theme length to prevent memory issues
      const limitedTheme = importedTheme.length > 32 ? importedTheme.slice(0, 32) : importedTheme;
      setOptimizedTheme(limitedTheme);
      
      if (limitedTheme.length < importedTheme.length) {
        toast.warning(`Theme trimmed to ${limitedTheme.length} notes to preserve memory`);
      }
      
      console.log('🎵 MIDI theme imported:', limitedTheme.length, 'notes');
    } catch (err) {
      console.error('Error importing MIDI theme:', err);
      toast.error('Failed to import MIDI theme');
    }
  }, []);

  const handleMidiPartsImported = useCallback((importedParts: Part[]) => {
    try {
      // Limit number of parts and notes per part
      const limitedParts = importedParts.slice(0, 8).map(part => ({
        melody: part.melody.slice(0, 32),
        rhythm: part.rhythm.slice(0, 32)
      }));
      
      // Initialize part instruments and mute states
      const instrumentChoices: InstrumentType[] = ['piano', 'violin', 'flute', 'cello', 'harpsichord', 'bass'];
      const instruments = limitedParts.map((_, index) => instrumentChoices[index % instrumentChoices.length]);
      const muted = limitedParts.map(() => false);
      
      // Add as a new imitation to the list
      const newImitation: GeneratedComposition = {
        parts: limitedParts,
        instruments,
        muted,
        timestamp: Date.now()
      };
      
      setImitationsList(prev => [...prev, newImitation]);
      
      console.log('🎵 MIDI parts imported:', limitedParts.length, 'parts');
      toast.success(`MIDI file imported as Imitation #${imitationsList.length + 1}`);
    } catch (err) {
      console.error('Error importing MIDI parts:', err);
      toast.error('Failed to import MIDI parts');
    }
  }, [imitationsList.length]);

  const handleMidiBachVariablesImported = useCallback((importedVariables: Partial<BachLikeVariables>) => {
    try {
      // Merge with existing Bach variables, limiting each to 32 notes
      const updatedVariables = { ...bachVariables };
      
      Object.entries(importedVariables).forEach(([key, value]) => {
        if (Array.isArray(value) && key in updatedVariables) {
          const limitedValue = value.slice(0, 32);
          (updatedVariables as any)[key] = limitedValue;
        }
      });
      
      setBachVariables(updatedVariables);
      
      const importedKeys = Object.keys(importedVariables);
      console.log('🎵 MIDI Bach variables imported:', importedKeys);
    } catch (err) {
      console.error('Error importing MIDI Bach variables:', err);
      toast.error('Failed to import MIDI Bach variables');
    }
  }, [bachVariables]);

  // ADDITIVE: Build available components list for Theme Converter
  // This consolidates all generated components from all generators into a unified list
  // CRITICAL FIX: Each generator type isolated in separate try-catch to prevent crashes
  const availableComponentsForConverter = useMemo((): ConvertibleComponent[] => {
    const components: ConvertibleComponent[] = [];

    // ISOLATED: Add canon voices (each voice becomes a separate component)
    try {
      if (Array.isArray(canonsList) && canonsList.length > 0) {
        canonsList.forEach((canon, canonIndex) => {
          try {
            if (canon?.result?.voices && Array.isArray(canon.result.voices)) {
              canon.result.voices.forEach((voice, voiceIndex) => {
                try {
                  if (voice && voice.melody && Array.isArray(voice.melody) && voice.melody.length > 0) {
                    components.push({
                      id: `canon-${canonIndex}-voice-${voiceIndex}-${canon.timestamp || Date.now()}`,
                      name: `Canon: ${canon.result.metadata?.type || 'Canon'} ${canonIndex + 1} - ${voice.id || `Voice ${voiceIndex + 1}`}`,
                      type: 'canon',
                      melody: voice.melody,
                      rhythm: voice.rhythm || [],
                      instrument: (canon.instruments && canon.instruments[voiceIndex]) || 'piano',
                      timestamp: canon.timestamp || Date.now(),
                      metadata: {
                        canonType: canon.result.metadata?.type,
                        voiceIndex
                      }
                    });
                  }
                } catch (voiceErr) {
                  console.warn(`Skipping canon voice ${voiceIndex}:`, voiceErr);
                }
              });
            }
          } catch (canonErr) {
            console.warn(`Skipping canon ${canonIndex}:`, canonErr);
          }
        });
      }
    } catch (error) {
      console.warn('❌ Error processing canons for converter:', error);
    }

    // ISOLATED: Add fugue builder voices (each voice becomes a separate component)
    try {
      if (Array.isArray(generatedFugues) && generatedFugues.length > 0) {
        generatedFugues.forEach((fugue, fugueIndex) => {
          try {
            if (fugue?.result?.sections && Array.isArray(fugue.result.sections)) {
              fugue.result.sections.forEach((section, sectionIndex) => {
                try {
                  if (section?.voices && Array.isArray(section.voices)) {
                    section.voices.forEach((voice, voiceIndex) => {
                      try {
                        if (voice && voice.material && Array.isArray(voice.material) && voice.material.length > 0) {
                          const voiceName = `${section.label || `Section ${sectionIndex + 1}`} - ${voice.role || 'Voice'}`;
                          components.push({
                            id: `fugue-${fugueIndex}-section-${sectionIndex}-voice-${voiceIndex}-${fugue.timestamp || Date.now()}`,
                            name: `Fugue ${fugueIndex + 1}: ${voiceName}`,
                            type: 'generated-fugue',
                            melody: voice.material,
                            rhythm: voice.rhythm || [],
                            instrument: (fugue.instruments && fugue.instruments[voiceIndex]) || 'piano',
                            timestamp: fugue.timestamp || Date.now(),
                            metadata: {
                              fugueArchitecture: fugue.result.metadata?.architecture,
                              voiceRole: voice.role
                            }
                          });
                        }
                      } catch (voiceErr) {
                        console.warn(`Skipping fugue voice ${voiceIndex}:`, voiceErr);
                      }
                    });
                  }
                } catch (sectionErr) {
                  console.warn(`Skipping fugue section ${sectionIndex}:`, sectionErr);
                }
              });
            }
          } catch (fugueErr) {
            console.warn(`Skipping fugue ${fugueIndex}:`, fugueErr);
          }
        });
      }
    } catch (error) {
      console.warn('❌ Error processing fugues for converter:', error);
    }

    // ISOLATED: Add imitation parts
    try {
      if (Array.isArray(imitationsList) && imitationsList.length > 0) {
        imitationsList.forEach((imitation, index) => {
          try {
            // Check for valid imitation structure with parts array
            if (imitation?.parts && Array.isArray(imitation.parts) && imitation.parts.length > 0) {
              // Use the first part (imitation) as the melody
              const imitationPart = imitation.parts[0];
              if (imitationPart?.melody && Array.isArray(imitationPart.melody) && imitationPart.melody.length > 0) {
                components.push({
                  id: `imitation-${index}-${imitation.timestamp || Date.now()}`,
                  name: `Imitation ${index + 1}`,
                  type: 'imitation',
                  melody: imitationPart.melody,
                  rhythm: [],
                  instrument: (imitation.instruments && imitation.instruments[0]) || 'piano',
                  timestamp: imitation.timestamp || Date.now()
                });
              }
            }
          } catch (imitationErr) {
            console.warn(`Skipping imitation ${index}:`, imitationErr);
          }
        });
      }
    } catch (error) {
      console.warn('❌ Error processing imitations for converter:', error);
    }

    // ISOLATED: Add traditional fugue parts
    try {
      if (Array.isArray(fuguesList) && fuguesList.length > 0) {
        fuguesList.forEach((fugue, index) => {
          try {
            // Check for valid fugue structure with parts array
            if (fugue?.parts && Array.isArray(fugue.parts) && fugue.parts.length > 0) {
              // Use the answer part (second part) as the melody
              const answerPart = fugue.parts[1] || fugue.parts[0];
              if (answerPart?.melody && Array.isArray(answerPart.melody) && answerPart.melody.length > 0) {
                components.push({
                  id: `fugue-answer-${index}-${fugue.timestamp || Date.now()}`,
                  name: `Fugue ${index + 1} - Answer`,
                  type: 'fugue',
                  melody: answerPart.melody,
                  rhythm: [],
                  instrument: (fugue.instruments && fugue.instruments[1]) || (fugue.instruments && fugue.instruments[0]) || 'piano',
                  timestamp: fugue.timestamp || Date.now()
                });
              }
            }
          } catch (fugueErr) {
            console.warn(`Skipping traditional fugue ${index}:`, fugueErr);
          }
        });
      }
    } catch (error) {
      console.warn('❌ Error processing traditional fugues for converter:', error);
    }

    // ISOLATED: Add counterpoint parts
    try {
      if (Array.isArray(generatedCounterpoints) && generatedCounterpoints.length > 0) {
        generatedCounterpoints.forEach((cp, index) => {
          try {
            if (cp?.melody && Array.isArray(cp.melody) && cp.melody.length > 0) {
              components.push({
                id: `counterpoint-${index}-${cp.timestamp || Date.now()}`,
                name: `Counterpoint ${index + 1}${cp.technique ? ` - ${cp.technique}` : ''}`,
                type: 'counterpoint',
                melody: cp.melody,
                rhythm: [],
                instrument: cp.instrument || 'violin',
                timestamp: cp.timestamp || Date.now(),
                metadata: {
                  technique: cp.technique
                }
              });
            }
          } catch (cpErr) {
            console.warn(`Skipping counterpoint ${index}:`, cpErr);
          }
        });
      }
    } catch (error) {
      console.warn('❌ Error processing counterpoints for converter:', error);
    }

    // ISOLATED: Add harmony parts (use original melody, not chord data)
    try {
      if (Array.isArray(generatedHarmonies) && generatedHarmonies.length > 0) {
        generatedHarmonies.forEach((harmony, index) => {
          try {
            const melody = harmony?.result?.originalMelody || harmony?.result?.melody;
            if (melody && Array.isArray(melody) && melody.length > 0) {
              components.push({
                id: `harmony-${index}-${harmony.timestamp || Date.now()}`,
                name: `Harmonized Melody ${index + 1}`,
                type: 'harmony',
                melody: melody,
                rhythm: harmony.result?.harmonyRhythm || [],
                harmonyNotes: harmony.result?.harmonyNotes,
                instrument: harmony.instrument || 'piano',
                timestamp: harmony.timestamp || Date.now()
              });
            }
          } catch (harmonyErr) {
            console.warn(`Skipping harmony ${index}:`, harmonyErr);
          }
        });
      }
    } catch (error) {
      console.warn('❌ Error processing harmonies for converter:', error);
    }

    // ISOLATED: Add arpeggio chains
    try {
      if (Array.isArray(generatedArpeggios) && generatedArpeggios.length > 0) {
        generatedArpeggios.forEach((arpeggio, index) => {
          try {
            if (arpeggio?.melody && Array.isArray(arpeggio.melody) && arpeggio.melody.length > 0) {
              components.push({
                id: `arpeggio-${index}-${arpeggio.timestamp || Date.now()}`,
                name: `Arpeggio Chain ${index + 1}: ${arpeggio.label || 'Pattern'}`,
                type: 'part',
                melody: arpeggio.melody,
                rhythm: arpeggio.rhythm || [],
                instrument: arpeggio.instrument || 'piano',
                timestamp: arpeggio.timestamp || Date.now()
              });
            }
          } catch (arpeggioErr) {
            console.warn(`Skipping arpeggio ${index}:`, arpeggioErr);
          }
        });
      }
    } catch (error) {
      console.warn('❌ Error processing arpeggios for converter:', error);
    }

    // ADDITIVE: Add composer accompaniments
    try {
      if (Array.isArray(generatedAccompaniments) && generatedAccompaniments.length > 0) {
        generatedAccompaniments.forEach((accompaniment, index) => {
          try {
            if (accompaniment?.melody && Array.isArray(accompaniment.melody) && accompaniment.melody.length > 0) {
              components.push({
                id: `accompaniment-${index}-${accompaniment.timestamp || Date.now()}`,
                name: `Composer Accompaniment ${index + 1}: ${accompaniment.label || 'Pattern'}`,
                type: 'part',
                melody: accompaniment.melody,
                rhythm: accompaniment.rhythm || [],
                instrument: accompaniment.instrument || 'piano',
                timestamp: accompaniment.timestamp || Date.now()
              });
            }
          } catch (accompanimentErr) {
            console.warn(`Skipping accompaniment ${index}:`, accompanimentErr);
          }
        });
      }
    } catch (error) {
      console.warn('❌ Error processing accompaniments for converter:', error);
    }

    // Sort by timestamp (newest first) with safety check
    try {
      return components.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } catch (sortError) {
      console.warn('❌ Error sorting components:', sortError);
      return components; // Return unsorted if sorting fails
    }
  }, [
    canonsList,
    generatedFugues,
    imitationsList,
    fuguesList,
    generatedCounterpoints,
    generatedHarmonies,
    generatedArpeggios,
    generatedAccompaniments
  ]);

  const colorPalette = useMemo(() => [
    '#6366f1', // indigo
    '#ec4899', // pink  
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#06b6d4', // cyan
  ], []);

  // Simplified memory monitoring and cleanup - deferred to prevent blocking
  useEffect(() => {
    let memoryCheckInterval: NodeJS.Timeout;
    let cleanupTimeout: NodeJS.Timeout;
    
    // Defer memory monitoring to after initial render
    const startMonitoring = () => {
      // Memory monitoring
      memoryCheckInterval = setInterval(() => {
        try {
          if ('memory' in performance) {
            const memory = (performance as any).memory;
            const usedMB = Math.round(memory.usedJSHeapSize / (1024 * 1024));
            const limitMB = Math.round(memory.jsHeapSizeLimit / (1024 * 1024));
            
            if (usedMB > limitMB * 0.85) {
              console.warn(`🔍 High memory usage: ${usedMB}MB of ${limitMB}MB`);
              
              // Trigger automatic cleanup for memory pressure
              if (usedMB > limitMB * 0.9) {
                // Clear older counterpoints
                setGeneratedCounterpoints(prev => prev.slice(0, 2));
                
                // Limit theme size
                setTheme(prev => prev.length > 24 ? prev.slice(0, 24) : prev);
                
                // Limit Bach variables
                setBachVariables(prev => {
                  const limited = { ...prev };
                  Object.keys(limited).forEach(key => {
                    if (Array.isArray(limited[key as keyof BachLikeVariables])) {
                      (limited[key as keyof BachLikeVariables] as number[]) = 
                        (limited[key as keyof BachLikeVariables] as number[]).slice(0, 24);
                    }
                  });
                  return limited;
                });
                
                toast.warning('Memory optimized - older data cleared automatically', { duration: 3000 });
              }
            }
          }
        } catch (err) {
          console.error('Memory monitoring error:', err);
        }
      }, 60000); // Check every 60 seconds (reduced frequency)

      // Set up cleanup timeout for 10 minutes
      cleanupTimeout = setTimeout(() => {
        console.log('🧹 Performing routine cleanup after 10 minutes');
        setGeneratedCounterpoints([]);
        if (typeof window !== 'undefined' && (window as any).__modeCache) {
          delete (window as any).__modeCache;
        }
      }, 600000); // 10 minutes
    };

    // Defer monitoring start to prevent blocking
    const monitoringTimer = setTimeout(startMonitoring, 5000);

    return () => {
      clearTimeout(monitoringTimer);
      if (memoryCheckInterval) clearInterval(memoryCheckInterval);
      if (cleanupTimeout) clearTimeout(cleanupTimeout);
    };
  }, []);

  // ADDITIVE: Compute background class from background theme using useMemo
  const backgroundClass = useMemo(() => {
    return BACKGROUND_THEMES[backgroundTheme]?.gradient || 'bg-gradient-to-br from-background via-background to-muted/30';
  }, [backgroundTheme]);

  return (
    <AuthProvider>
    <UndoRedoProvider maxHistoryDepth={50} enableKeyboardShortcuts={true} enableToastNotifications={true}>
      <div className={`min-h-screen ${backgroundClass} relative`} data-background-theme={backgroundTheme}>
      {/* Parallax Background Layer */}
      <ParallaxBackground theme={backgroundTheme} />
      
      {/* Onboarding Overlay */}
      <OnboardingOverlay />
      
      {/* Main Content with relative positioning to layer above background */}
      <div className="relative z-10">
        {/* Removed heavy performance monitoring to reduce frame drops */}
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 elevation-low transition-smooth">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Imitative Fugue Suite
                </h1>
                <Badge variant="outline" className="text-xs font-mono bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-300 dark:border-indigo-700">
                  v1.001
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Imitation, Counterpoint & Fugue Construction Engine by Harris Software Solutions LLC
              </p>
            </div>
            <div className="ml-auto flex gap-2 items-center">
              <HoverScale scale={1.05}>
                <Badge variant="outline" className="gap-1 transition-smooth hover:bg-indigo-50 dark:hover:bg-indigo-950/50">
                  <Waves className="w-3 h-3" />
                  {Array.isArray(modeCategories) ? modeCategories.reduce((total, cat) => total + (cat?.modes?.length || 0), 0) : 0} Global Modes
                </Badge>
              </HoverScale>
              <HoverScale scale={1.05}>
                <Badge variant="outline" className="gap-1 transition-smooth hover:bg-purple-50 dark:hover:bg-purple-950/50">
                  <Sparkles className="w-3 h-3" />
                  Modal Theory Enhanced
                </Badge>
              </HoverScale>
              <HoverScale scale={1.05}>
                <Badge variant="outline" className="gap-1 transition-smooth hover:bg-pink-50 dark:hover:bg-pink-950/50">
                  <Sparkles className="w-3 h-3" />
                  II Composition
                </Badge>
              </HoverScale>
              <HoverScale scale={1.05}>
                <Badge variant="outline" className="gap-1 transition-smooth hover:bg-indigo-50 dark:hover:bg-indigo-950/50">
                  <Layers className="w-3 h-3" />
                  Song Creation
                </Badge>
              </HoverScale>
              <OnboardingTrigger />
              {/* ADDITIVE: Authentication Header */}
              <AuthHeader />
              <PreferencesDialog
                backgroundTheme={backgroundTheme}
                onBackgroundThemeChange={handleBackgroundThemeChange}
                sessionData={getSessionData()}
                onLoadSession={handleLoadSession}
                pianoOctaveRange={pianoOctaveRange}
                pianoStartOctave={pianoStartOctave}
                onPianoOctaveRangeChange={setPianoOctaveRange}
                onPianoStartOctaveChange={setPianoStartOctave}
                onMidiNotesRecorded={handleMidiNotesRecorded}
                selectedInstrument={selectedInstrument}
                modeCategories={Array.isArray(modeCategories) ? modeCategories : []}
                selectedMode={selectedMode}
                selectedKeySignature={selectedKeySignature}
                uiTheme={uiTheme}
                onUIThemeChange={handleUIThemeChange}
                isDarkMode={isDarkMode}
                onDarkModeToggle={handleDarkModeToggle}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {error && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setError(null)}
                className="ml-2"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* ADDITIVE: Enhanced Layout - Better spacing for controls */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Controls Column - Wider for better readability */}
          <StaggerContainer className="lg:col-span-2 space-y-6">
            <StaggerItem>
              <ErrorBoundary>
                <div data-onboarding="mode-selector">
                  <MotionWrapper variant="slide-right" delay={0.1}>
                    {/* ADDITIVE: Phase 2 - Professional UI Enhancement */}
                    <ProfessionalCardWrapper
                      visualType="lcd-panel"
                      glowColor="#8b5cf6"
                      lcdText={selectedMode?.name || 'SELECT MODE'}
                      headerBadges={[
                        { label: `${selectedKeySignature?.name || 'C'}`, variant: 'default' },
                        { label: `${Array.isArray(modeCategories) ? modeCategories.reduce((total, cat) => total + (cat?.modes?.length || 0), 0) : 0} Modes`, variant: 'outline' }
                      ]}
                    >
                      <ModeSelector
                        modeCategories={Array.isArray(modeCategories) ? modeCategories : []}
                        selectedMode={selectedMode}
                        onModeSelect={setSelectedMode}
                        selectedKeySignature={selectedKeySignature}
                        onKeySignatureSelect={handleKeySignatureSelect}
                      />
                    </ProfessionalCardWrapper>
                  </MotionWrapper>
                </div>
              </ErrorBoundary>
            </StaggerItem>

            <ErrorBoundary>
              {/* ADDITIVE: Phase 2 - Professional UI Enhancement */}
              <ProfessionalCardWrapper
                title="Advanced Modal Theory"
                subtitle="Generate melodies from world music systems"
                visualType="envelope"
                glowColor="#a855f7"
                headerBadges={[
                  { label: 'Modal Theory', variant: 'secondary' },
                  { label: 'Enhanced', variant: 'outline' }
                ]}
              >
                <AdvancedModeControls
                  modeCategories={Array.isArray(modeCategories) ? modeCategories : []}
                  selectedMode={selectedMode}
                  onModeSelect={setSelectedMode}
                  selectedKeySignature={selectedKeySignature}
                  onThemeGenerated={(theme, modeName) => {
                    setOptimizedTheme(theme);
                    toast.success(`Theme generated from ${modeName}`, {
                      description: `${theme.length} notes created`
                    });
                  }}
                  onBachVariableGenerated={(variableName, theme, modeName) => {
                    setBachVariables(prev => ({
                      ...prev,
                      [variableName]: theme
                    }));
                    toast.success(`${variableName} generated from ${modeName}`, {
                      description: `${theme.length} notes created`
                    });
                  }}
                  currentTheme={theme}
                  bachVariables={bachVariables}
                />
              </ProfessionalCardWrapper>
            </ErrorBoundary>



            <StaggerItem>
              <ErrorBoundary>
                <div data-onboarding="theme-composer">
                  <MotionWrapper variant="slide-right" delay={0.2}>
                    {/* ADDITIVE: Phase 2 - Professional UI Enhancement with Waveform */}
                    <ProfessionalCardWrapper
                      title="Theme Composer"
                      subtitle="Create and edit your musical theme"
                      visualType="oscilloscope"
                      glowColor="#06b6d4"
                      headerBadges={[
                        { label: `${theme.length} notes`, variant: 'default' },
                        { label: 'MIDI Ready', variant: 'outline' }
                      ]}
                    >
                      <ThemeComposer
                        theme={theme}
                        onThemeChange={setOptimizedTheme}
                        bachVariables={bachVariables}
                        onBachVariablesChange={handleBachVariablesChange}
                        onMidiTargetChange={handleMidiTargetChange}
                        selectedMode={selectedMode}
                        selectedKeySignature={selectedKeySignature}
                        enhancedTheme={enhancedTheme}
                        onEnhancedThemeChange={setOptimizedEnhancedTheme}
                        themeRhythm={themeRhythm}
                        onThemeRhythmChange={handleThemeRhythmChange}
                        bachVariableRhythms={bachVariableRhythms}
                        onBachVariableRhythmChange={handleBachVariableRhythmChange}
                      />
                    </ProfessionalCardWrapper>
                  </MotionWrapper>
                </div>
              </ErrorBoundary>
            </StaggerItem>

            {/* ADDITIVE: Theme Converter Card - Convert any component to new theme */}
            <StaggerItem>
              <ErrorBoundary>
                <div data-onboarding="theme-converter">
                  <MotionWrapper variant="slide-right" delay={0.3}>
                    {/* ADDITIVE: Phase 2 - Professional UI Enhancement */}
                    <ProfessionalCardWrapper
                      title="Theme Transfer System"
                      subtitle="Convert any composition to theme or Bach variables"
                      visualType="lcd-panel"
                      glowColor="#3b82f6"
                      headerBadges={[
                        { label: `${availableComponentsForConverter.length} Available`, variant: 'default' },
                        { label: 'Bidirectional', variant: 'outline' }
                      ]}
                    >
                      <ThemeConverterCard
                        availableComponents={availableComponentsForConverter}
                        currentTheme={theme}
                        currentEnhancedTheme={enhancedTheme}
                        currentThemeRhythm={themeRhythm}
                        currentBachVariables={bachVariables}
                        currentBachVariableRhythms={bachVariableRhythms}
                        onThemeChange={setOptimizedTheme}
                        onEnhancedThemeChange={setOptimizedEnhancedTheme}
                        onThemeRhythmChange={handleThemeRhythmChange}
                        onBachVariablesChange={handleBachVariablesChange}
                        onBachVariableRhythmChange={handleBachVariableRhythmChange}
                      />
                    </ProfessionalCardWrapper>
                  </MotionWrapper>
                </div>
              </ErrorBoundary>
            </StaggerItem>

            <ErrorBoundary>
              {/* ADDITIVE: Phase 2 - Professional UI Enhancement */}
              <ProfessionalCardWrapper
                title="Session Memory Bank"
                subtitle="Save and load multiple compositions"
                visualType="lcd-panel"
                glowColor="#10b981"
                headerBadges={[
                  { label: 'Multi-File', variant: 'secondary' },
                  { label: 'JSON', variant: 'outline' }
                ]}
              >
                <SessionMemoryBank
                  currentTheme={theme}
                  currentMode={selectedMode}
                  currentKeySignature={selectedKeySignature}
                  currentBachVariables={bachVariables}
                  currentCounterpoints={generatedCounterpoints.map(cp => cp.melody)}
                  onLoadMemoryItem={(item) => {
                    try {
                      if (item.data.theme) setTheme(item.data.theme);
                      if (item.data.selectedMode) setSelectedMode(item.data.selectedMode);
                      if (item.data.selectedKeySignature) setSelectedKeySignature(item.data.selectedKeySignature);
                      if (item.data.bachVariables) setBachVariables(item.data.bachVariables);
                      if (item.data.counterpoints) {
                        // Convert Theme[] back to CounterpointComposition[]
                        const restoredCounterpoints = item.data.counterpoints.map((melody, index) => ({
                          melody,
                          instrument: 'violin' as InstrumentType,
                          muted: false,
                          timestamp: Date.now() + index,
                          technique: 'Restored from session'
                        }));
                        setGeneratedCounterpoints(restoredCounterpoints);
                      }
                    } catch (error) {
                      console.error('Error loading memory item:', error);
                      toast.error('Failed to load composition from memory');
                    }
                  }}
                  onBachVariablesChange={handleBachVariablesChange}
                />
              </ProfessionalCardWrapper>
            </ErrorBoundary>

            <ErrorBoundary>
              {/* ADDITIVE: Phase 2 - Professional UI Enhancement */}
              <ProfessionalCardWrapper
                title="MIDI File Importer"
                subtitle="Import MIDI files as themes or parts"
                visualType="lcd-panel"
                glowColor="#f59e0b"
                headerBadges={[
                  { label: 'MIDI Import', variant: 'default' },
                  { label: 'Smart Routing', variant: 'outline' }
                ]}
              >
                <MidiFileImporter
                  onThemeImported={handleMidiThemeImported}
                  onPartsImported={handleMidiPartsImported}
                  onBachVariablesImported={handleMidiBachVariablesImported}
                  selectedMode={selectedMode}
                  selectedKeySignature={selectedKeySignature}
                  bachVariables={bachVariables}
                />
              </ProfessionalCardWrapper>
            </ErrorBoundary>

            {/* Harmony Engine Suite - Professional Harmonization */}
            <StaggerItem>
              <ErrorBoundary>
                {/* ADDITIVE: Phase 2 - Professional UI Enhancement */}
                <ProfessionalCardWrapper
                  title="Harmony Composer"
                  subtitle="AI-driven chord generation and harmonization"
                  visualType="spectrum"
                  glowColor="#06b6d4"
                  headerBadges={[
                    { label: 'Chord Engine', variant: 'secondary' },
                    { label: 'Smart Analysis', variant: 'outline' }
                  ]}
                >
                  <HarmonyComposer 
                    onHarmonyGenerated={handleHarmonyGenerated}
                    currentTheme={theme}
                    currentThemeRhythm={themeRhythm}
                    currentBachVariables={bachVariables}
                    bachVariableRhythms={bachVariableRhythms}
                  />
                </ProfessionalCardWrapper>
              </ErrorBoundary>
            </StaggerItem>

            {/* Arpeggio Chain Builder - NEW FEATURE */}
            <StaggerItem>
              <ErrorBoundary>
                {/* ADDITIVE: Phase 2 - Professional UI Enhancement */}
                <ProfessionalCardWrapper
                  title="Arpeggio Pattern Generator"
                  subtitle="64 professional arpeggio patterns"
                  visualType="oscilloscope"
                  glowColor="#8b5cf6"
                  headerBadges={[
                    { label: '64 Patterns', variant: 'default' },
                    { label: 'Chain Builder', variant: 'outline' }
                  ]}
                >
                  <ArpeggioChainBuilder
                    currentTheme={theme}
                    currentThemeRhythm={themeRhythm}
                    currentBachVariables={bachVariables}
                    bachVariableRhythms={bachVariableRhythms}
                    onAddToSongSuite={handleArpeggioGenerated}
                  />
                </ProfessionalCardWrapper>
              </ErrorBoundary>
            </StaggerItem>

            <ErrorBoundary>
              {/* ADDITIVE: Phase 2 - Professional UI Enhancement */}
              <ProfessionalCardWrapper
                title="Counterpoint Engine Suite"
                subtitle="11 composer styles with 54 parameters each"
                visualType="envelope"
                glowColor="#ec4899"
                headerBadges={[
                  { label: '40+ Techniques', variant: 'default' },
                  { label: 'Species I-V', variant: 'outline' }
                ]}
              >
                <Tabs defaultValue="basic" className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Music4 className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold">Counterpoint Modes</h3>
                    </div>
                    <TabsList className="grid w-auto grid-cols-2">
                      <TabsTrigger value="basic" className="gap-1 text-xs">
                        <BookOpen className="w-3 h-3" />
                        Basic
                      </TabsTrigger>
                      <TabsTrigger value="advanced" className="gap-1 text-xs">
                        <Zap className="w-3 h-3" />
                        Advanced
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="basic" className="mt-0">
                    <CounterpointComposer
                      theme={theme}
                      bachVariables={bachVariables}
                      onBachVariablesChange={handleBachVariablesChange}
                      selectedMode={selectedMode}
                      selectedKeySignature={selectedKeySignature}
                      onCounterpointGenerated={handleCounterpointGenerated}
                    />
                  </TabsContent>

                  <TabsContent value="advanced" className="mt-0">
                    <AdvancedCounterpointComposer
                      theme={theme}
                      bachVariables={bachVariables}
                      onBachVariablesChange={handleBachVariablesChange}
                      selectedMode={selectedMode}
                      selectedKeySignature={selectedKeySignature}
                      onCounterpointGenerated={handleAdvancedCounterpointGenerated}
                    />
                  </TabsContent>
                </Tabs>
              </ProfessionalCardWrapper>
            </ErrorBoundary>

            {/* HARMONY ENGINE SUITE - ADDITIVE ADDITION */}
            <ErrorBoundary>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-cyan-600" />
                  <h3 className="font-semibold">Harmony Engine Suite</h3>
                  <Badge variant="secondary" className="text-xs">
                    Chord Generation
                  </Badge>
                </div>
                <HarmonyComposer
                  onHarmonyGenerated={handleHarmonyGenerated}
                  currentTheme={theme}
                  currentThemeRhythm={themeRhythm}
                  currentBachVariables={bachVariables}
                  bachVariableRhythms={bachVariableRhythms}
                />
              </Card>
            </ErrorBoundary>

            {/* ARPEGGIO CHAIN BUILDER - ADDITIVE ADDITION */}
            <ErrorBoundary>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold">Arpeggio Chain Builder</h3>
                  <Badge variant="secondary" className="text-xs">
                    Pattern Sequencing
                  </Badge>
                </div>
                <ArpeggioChainBuilder
                  currentTheme={theme}
                  currentThemeRhythm={themeRhythm}
                  currentBachVariables={bachVariables}
                  bachVariableRhythms={bachVariableRhythms}
                  onAddToSongSuite={handleArpeggioGenerated}
                />
              </Card>
            </ErrorBoundary>

            {/* ADDITIVE: COMPOSER ACCOMPANIMENT LIBRARY - NEW FEATURE */}
            <StaggerItem>
              <ErrorBoundary>
                <ProfessionalCardWrapper
                  title="Famous Composer Accompaniments"
                  subtitle="13 authentic patterns from 10 classical masters"
                  visualType="waveform"
                  glowColor="#d946ef"
                  headerBadges={[
                    { label: '13 Patterns', variant: 'default' },
                    { label: '10 Composers', variant: 'outline' }
                  ]}
                >
                  <ComposerAccompanimentLibrary
                    currentTheme={theme}
                    currentMode={selectedMode}
                    currentKeySignature={selectedKeySignature}
                    bachVariables={bachVariables}
                    onAddToSongSuite={handleAccompanimentAddToSongSuite}
                    onPlayAccompaniment={handleAccompanimentPlay}
                    onApplyToTheme={handleAccompanimentApplyToTheme}
                    onApplyToBachVariable={handleAccompanimentApplyToBachVariable}
                  />
                </ProfessionalCardWrapper>
              </ErrorBoundary>
            </StaggerItem>

            {/* ADDITIVE: MIDI TO ACCOMPANIMENT CONVERTER - NEW FEATURE */}
            <StaggerItem>
              <ErrorBoundary>
                <ProfessionalCardWrapper
                  title="MIDI to Accompaniment Converter"
                  subtitle="Convert MIDI files to Composer Accompaniment JSON format"
                  visualType="oscilloscope"
                  glowColor="#3b82f6"
                  headerBadges={[
                    { label: 'MIDI Import', variant: 'default' },
                    { label: 'Type 0/1/2', variant: 'outline' }
                  ]}
                >
                  <MidiToAccompanimentConverter />
                </ProfessionalCardWrapper>
              </ErrorBoundary>
            </StaggerItem>

            {/* MIDI Integration Status */}
            <ErrorBoundary>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${midiSupported ? (midiActivity ? 'bg-blue-500 animate-pulse' : 'bg-green-500') : 'bg-gray-400'}`} />
                    <Label className="font-medium">MIDI Keyboard Integration</Label>
                    {midiActivity && (
                      <Badge variant="outline" className="text-xs animate-pulse">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={midiTarget === 'theme' ? 'default' : 'secondary'} 
                      className={`text-xs ${midiTarget && midiTarget !== 'theme' ? 'bg-green-600 text-white' : ''}`}
                    >
                      Target: {midiTarget === 'theme' ? 'Main Theme' : midiTarget || 'None'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {midiSupported ? 'Ready' : 'Deploy to Enable'}
                    </Badge>
                    {/* Deployment Environment Indicator */}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${window.location.protocol === 'https:' ? 'border-green-300 text-green-700' : 'border-yellow-300 text-yellow-700'}`}
                    >
                      {window.location.protocol === 'https:' ? 'HTTPS ✓' : 'HTTP'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    {midiSupported ? (
                      <span className="text-green-700 dark:text-green-300">
                        🎹 Your MIDI keyboard will automatically control the Virtual Piano Keyboard below. Play notes to hear them and add them to your theme.
                      </span>
                    ) : (
                      <span>
                        MIDI keyboard integration requires deployment outside Figma Make. 
                        When deployed, your MIDI keyboard will control the Virtual Piano below.
                      </span>
                    )}
                  </div>

                  {/* Test simulation for development */}
                  {!midiSupported && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg space-y-3">
                      <div className="text-xs font-medium text-blue-900 dark:text-blue-100">
                        🧪 Test MIDI Integration & Bach Variables Routing
                      </div>
                      
                      {/* Current MIDI Target Display */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-800 dark:text-blue-200">
                          Current MIDI Target:
                        </span>
                        <Badge 
                          variant={midiTarget === 'theme' ? 'default' : 'secondary'} 
                          className={`text-xs ${midiTarget && midiTarget !== 'theme' ? 'bg-green-600 text-white' : ''}`}
                        >
                          {midiTarget === 'theme' ? 'Main Theme' : midiTarget || 'None'}
                        </Badge>
                      </div>

                      {/* MIDI Target Selector for Testing */}
                      <div className="space-y-2">
                        <div className="text-xs text-blue-800 dark:text-blue-200">
                          Test Target Selection:
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <Button
                            size="sm"
                            variant={midiTarget === 'theme' ? 'default' : 'outline'}
                            onClick={() => handleMidiTargetChange('theme')}
                            className="text-xs h-7"
                          >
                            Theme
                          </Button>
                          <Button
                            size="sm"
                            variant={midiTarget === 'cantusFirmus' ? 'default' : 'outline'}
                            onClick={() => handleMidiTargetChange('cantusFirmus')}
                            className="text-xs h-7"
                          >
                            CF
                          </Button>
                          <Button
                            size="sm"
                            variant={midiTarget === 'floridCounterpoint1' ? 'default' : 'outline'}
                            onClick={() => handleMidiTargetChange('floridCounterpoint1')}
                            className="text-xs h-7"
                          >
                            FCP1
                          </Button>
                        </div>
                      </div>

                      {/* Test Note Input */}
                      <div className="space-y-2">
                        <div className="text-xs text-blue-800 dark:text-blue-200">
                          Test Notes (will route to current target):
                        </div>
                        <div className="grid grid-cols-12 gap-1">
                          {PITCH_NAMES.map((name, index) => {
                            const testMidiNote = (pianoStartOctave + 1) * 12 + index;
                            return (
                              <Button
                                key={index}
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  console.log('🧪 Test button clicked:', name, 'MIDI:', testMidiNote, 'Target:', midiTarget);
                                  
                                  // Test both the piano keyboard visual feedback AND the routing
                                  if (pianoKeyboardRef.current) {
                                    console.log('🧪 Testing piano keyboard visual feedback...');
                                    pianoKeyboardRef.current.triggerKey(testMidiNote);
                                  }
                                  
                                  // Test the full MIDI routing pipeline
                                  console.log('🧪 Testing MIDI routing pipeline...');
                                  handleMidiNotesRecorded([testMidiNote]);
                                }}
                                className="text-xs h-8 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                              >
                                {name}{pianoStartOctave + 1}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Test Multiple Notes */}
                      <div className="space-y-2">
                        <div className="text-xs text-blue-800 dark:text-blue-200">
                          Test Multiple Notes:
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const chord = [60, 64, 67]; // C major chord
                              console.log('🧪 Test chord:', chord, 'Target:', midiTarget);
                              handleMidiNotesRecorded(chord);
                            }}
                            className="text-xs h-7"
                          >
                            C Major Chord
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const scale = [60, 62, 64, 65, 67]; // C major scale
                              console.log('🧪 Test scale:', scale, 'Target:', midiTarget);
                              handleMidiNotesRecorded(scale);
                            }}
                            className="text-xs h-7"
                          >
                            C Scale
                          </Button>
                        </div>
                      </div>

                      <div className="text-xs text-blue-700 dark:text-blue-300 border-t border-blue-200 pt-2">
                        ✅ <strong>How to test:</strong> 
                        <br />1. Switch to "Bach Variables" tab in Theme Composer
                        <br />2. Select a Bach variable (CF, FCP1, etc.) 
                        <br />3. Use buttons above to test MIDI routing
                        <br />4. Check if notes appear in the selected Bach variable
                      </div>
                    </div>
                  )}

                  {/* Real MIDI status (when deployed) */}
                  {midiSupported && (
                    <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 rounded-lg">
                      <div className="text-xs text-green-800 dark:text-green-200">
                        <strong>🎹 Live MIDI Integration:</strong> Your MIDI keyboard is connected and controlling the Virtual Piano Keyboard. 
                        Press keys on your physical keyboard to see them light up on the virtual piano and hear the sounds.
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </ErrorBoundary>

            <ErrorBoundary>
              <StabilityControls
                stabilityMode={stabilityMode}
                stabilityRatio={stabilityRatio}
                onStabilityModeChange={setStabilityMode}
                onStabilityRatioChange={setStabilityRatio}
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="font-medium">Generate with Stability</Label>
                  <Badge variant="outline" className="text-xs">
                    New Theme
                  </Badge>
                </div>
                <Button 
                  onClick={handleGenerateStabilityTheme}
                  className="w-full gap-2"
                  variant="outline"
                  disabled={!selectedMode}
                >
                  <Shuffle className="w-4 h-4" />
                  Generate {stabilityMode} Theme
                </Button>
                <div className="text-xs text-muted-foreground mt-2">
                  Creates a new theme based on your stability preferences
                </div>
              </Card>
            </ErrorBoundary>

            <ErrorBoundary>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="font-medium">Memory Management</Label>
                  <Badge variant="outline" className="text-xs">
                    Performance
                  </Badge>
                </div>
                <Button 
                  onClick={() => {
                    // Clear older data to free memory
                    setGeneratedCounterpoints([]);
                    setImitationsList([]);
                    setFuguesList([]);
                    
                    // Clear rhythm data
                    setCounterpointRhythms(new Map());
                    setImitationRhythms(new Map());
                    setFugueRhythms(new Map());
                    
                    // Clear caches
                    if (typeof window !== 'undefined' && (window as any).__modeCache) {
                      delete (window as any).__modeCache;
                    }
                    
                    toast.success('Memory cleared - performance optimized');
                  }}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Generated Data
                </Button>
                <div className="text-xs text-muted-foreground mt-2">
                  Clears compositions and caches to free memory
                </div>
              </Card>
            </ErrorBoundary>

            <StaggerItem>
              <ErrorBoundary>
                <div data-onboarding="imitation-fugue-controls">
                  <MotionWrapper variant="slide-right" delay={0.3}>
                    <ImitationFugueControls
                      onGenerateImitation={handleGenerateImitation}
                      onGenerateFugue={handleGenerateFugue}
                    />
                  </MotionWrapper>
                </div>
              </ErrorBoundary>
            </StaggerItem>

            {/* NEW: Canon Controls */}
            <StaggerItem>
              <ErrorBoundary>
                <div data-onboarding="canon-controls">
                  <MotionWrapper variant="slide-right" delay={0.35}>
                    <CanonControls
                      onGenerateCanon={handleGenerateCanon}
                      disabled={!theme || theme.length === 0 || !selectedMode}
                    />
                  </MotionWrapper>
                </div>
              </ErrorBoundary>
            </StaggerItem>

            {/* NEW: Fugue Builder Controls - AI-driven fugue generation */}
            <StaggerItem>
              <ErrorBoundary>
                <div data-onboarding="fugue-builder-controls">
                  <MotionWrapper variant="slide-right" delay={0.4}>
                    <FugueGeneratorControls
                      onGenerate={handleGenerateFugueBuilder}
                      disabled={!theme || theme.length === 0 || !selectedKeySignature}
                      currentTheme={theme}
                      keySignature={selectedKeySignature?.key || 0}
                    />
                  </MotionWrapper>
                </div>
              </ErrorBoundary>
            </StaggerItem>

            {/* Export functionality is now integrated into the Song Creation Suite below */}
          </StaggerContainer>

          {/* Visualization Column */}
          <StaggerContainer staggerDelay={0.05} className="lg:col-span-3 space-y-6">
            {/* Original Theme with Enhanced Playback */}
            <ErrorBoundary>
              <MelodyVisualizer
                melody={theme}
                title="Original Theme"
                color={colorPalette[0]}
              />
            </ErrorBoundary>

            {/* Enhanced Theme Player with Rest Support */}
            <ErrorBoundary>
              <ThemePlayer
                theme={theme}
                enhancedTheme={enhancedTheme}
                selectedInstrument={selectedInstrument}
                onInstrumentChange={setSelectedInstrument}
                rhythm={themeRhythm}
              />
            </ErrorBoundary>

            {/* Bach Variables Visualization */}
            <ErrorBoundary>
              <BachVariablesVisualizer
                variables={bachVariables}
                colorPalette={colorPalette}
                onClearVariable={handleClearBachVariable}
              />
            </ErrorBoundary>

            {/* Bach Variables Playback */}
            <ErrorBoundary>
              <BachVariablePlayer
                variables={bachVariables}
              />
            </ErrorBoundary>

            {/* Generated Counterpoints Visualization */}
            {generatedCounterpoints.length > 0 && (
              <ErrorBoundary>
                <Separator />
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">Generated Counterpoints</h2>
                      <Badge variant="secondary">
                        {generatedCounterpoints.length} {generatedCounterpoints.length === 1 ? 'counterpoint' : 'counterpoints'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGeneratedCounterpoints([])}
                      className="text-xs gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </Button>
                  </div>

                  {generatedCounterpoints.map((counterpoint, index) => (
                    <Card key={counterpoint.timestamp} className="p-4 space-y-4 bg-green-50/30 dark:bg-green-950/10 border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium flex items-center gap-2">
                          <Music4 className="w-4 h-4 text-green-600" />
                          Counterpoint #{index + 1}
                          {counterpoint.technique && (
                            <Badge variant="outline" className="text-xs">
                              {counterpoint.technique}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {new Date(counterpoint.timestamp).toLocaleTimeString()}
                          </Badge>
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const counterpoint = generatedCounterpoints[index];
                            if (counterpoint) {
                              // Remove rhythm data for this counterpoint
                              setCounterpointRhythms(prev => {
                                const newMap = new Map(prev);
                                newMap.delete(counterpoint.timestamp);
                                return newMap;
                              });
                            }
                            setGeneratedCounterpoints(prev => prev.filter((_, i) => i !== index));
                            toast.success(`Counterpoint ${index + 1} cleared`);
                          }}
                          className="text-xs gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </Button>
                      </div>

                      <ErrorBoundary>
                        <MelodyVisualizer
                          melody={counterpoint.melody}
                          title="Counterpoint Melody"
                          color={colorPalette[(index + 2) % colorPalette.length]}
                          showClearButton={false}
                        />
                      </ErrorBoundary>

                      {/* Rhythm Controls for counterpoint */}
                      <Card className="p-3 bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Music className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">
                            Counterpoint Rhythm
                          </span>
                        </div>
                        <ErrorBoundary>
                          <RhythmControlsEnhanced
                            rhythm={counterpointRhythms.get(counterpoint.timestamp) || 
                              Array(counterpoint.melody.length).fill('quarter' as NoteValue)}
                            onRhythmChange={(newRhythm) => 
                              handleCounterpointRhythmChange(counterpoint.timestamp, newRhythm)
                            }
                            melodyLength={counterpoint.melody.length}
                          />
                        </ErrorBoundary>
                      </Card>

                      <ErrorBoundary>
                        <AudioPlayer
                          parts={(() => {
                            const customRhythm = counterpointRhythms.get(counterpoint.timestamp);
                            const rhythmData = customRhythm 
                              ? noteValuesToRhythm(customRhythm)
                              : (counterpoint.rhythm || MusicalEngine.buildRhythmWithInitialRests(counterpoint.melody.length, 0));
                            
                            return [{
                              melody: counterpoint.melody,
                              rhythm: rhythmData
                            }, {
                              melody: theme,
                              rhythm: noteValuesToRhythm(themeRhythm.length === theme.length ? themeRhythm : Array(theme.length).fill('quarter' as NoteValue))
                            }];
                          })()}
                          title="Counterpoint Playback"
                          selectedInstrument={selectedInstrument}
                          onInstrumentChange={setSelectedInstrument}
                          partInstruments={[counterpoint.instrument, 'piano']}
                          onPartInstrumentChange={(partIndex, instrument) => {
                            if (partIndex === 0) {
                              handleCounterpointInstrumentChange(index, instrument);
                            }
                          }}
                          partMuted={[counterpoint.muted, false]}
                          onPartMuteToggle={(partIndex) => {
                            if (partIndex === 0) {
                              handleCounterpointMuteToggle(index);
                            }
                          }}
                          enhancedTheme={enhancedTheme}
                          playerId={`counterpoint-${counterpoint.timestamp}`}
                        />
                      </ErrorBoundary>
                    </Card>
                  ))}
                </div>
              </ErrorBoundary>
            )}

            {/* Generated Harmonies - ADDITIVE ADDITION */}
            {generatedHarmonies.length > 0 && (
              <ErrorBoundary>
                <Separator />
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-600" />
                      <h2 className="text-xl font-semibold">Harmonized Melodies</h2>
                      <Badge variant="secondary">
                        {generatedHarmonies.length} {generatedHarmonies.length === 1 ? 'harmony' : 'harmonies'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAllHarmonies}
                      className="text-xs gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </Button>
                  </div>

                  {generatedHarmonies.map((harmony, index) => (
                    <Card key={harmony.timestamp} className="p-4 space-y-4 bg-cyan-50/30 dark:bg-cyan-950/10 border-cyan-200 dark:border-cyan-800">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-600" />
                          Harmonized Melody #{index + 1}
                          <Badge variant="outline" className="text-xs">
                            {harmony.result.chordLabels?.length || 0} chords
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {new Date(harmony.timestamp).toLocaleTimeString()}
                          </Badge>
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleClearHarmony(index)}
                          className="text-xs gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </Button>
                      </div>

                      <ErrorBoundary>
                        <HarmonyVisualizer
                          harmonizedPart={harmony.result}
                          instrument={harmony.instrument}
                        />
                      </ErrorBoundary>
                    </Card>
                  ))}
                </div>
              </ErrorBoundary>
            )}

            {/* Generated Imitations */}
            {imitationsList.length > 0 && (
              <ErrorBoundary>
                <Separator />
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">Imitations</h2>
                      <Badge variant="secondary">
                        {imitationsList.length} {imitationsList.length === 1 ? 'imitation' : 'imitations'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAllImitations}
                      className="text-xs gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </Button>
                  </div>

                  {imitationsList.map((composition, compIndex) => (
                    <Card key={composition.timestamp} className="p-4 space-y-4 bg-blue-50/30 dark:bg-blue-950/10 border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium flex items-center gap-2">
                          <Music className="w-4 h-4 text-blue-600" />
                          Imitation #{compIndex + 1}
                          <Badge variant="outline" className="text-xs">
                            {new Date(composition.timestamp).toLocaleTimeString()}
                          </Badge>
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleClearImitation(compIndex)}
                          className="text-xs gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </Button>
                      </div>

                      {composition.parts && composition.parts.map((part, partIndex) => {
                        if (!part || !part.melody || !Array.isArray(part.melody) || part.melody.length === 0) return null;

                        const partRhythms = imitationRhythms.get(composition.timestamp);
                        const partRhythm = partRhythms?.[partIndex] || 
                          Array(part.melody.length).fill('quarter' as NoteValue);
                        
                        return (
                            <ErrorBoundary key={partIndex}>
                              <div className="space-y-3">
                                <MelodyVisualizer
                                  melody={part.melody}
                                  title={partIndex === 0 ? 'Original' : 'Imitation'}
                                  color={colorPalette[partIndex % colorPalette.length]}
                                  showClearButton={false}
                                />
                                
                                {/* Rhythm Controls for each part */}
                                <Card className="p-3 bg-muted/30">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Music className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground">
                                      {partIndex === 0 ? 'Original' : 'Imitation'} Part Rhythm
                                    </span>
                                  </div>
                                  <ErrorBoundary>
                                    <RhythmControlsEnhanced
                                      rhythm={partRhythm}
                                      onRhythmChange={(newRhythm) => 
                                        handleImitationRhythmChange(composition.timestamp, partIndex, newRhythm)
                                      }
                                      melodyLength={part.melody.length}
                                    />
                                  </ErrorBoundary>
                                </Card>
                              </div>
                            </ErrorBoundary>
                          );
                      })}

                      <ErrorBoundary>
                        <AudioPlayer
                          parts={(() => {
                            const partRhythms = imitationRhythms.get(composition.timestamp) || [];
                            return applyRhythmToParts(composition.parts, partRhythms);
                          })()}
                          title="Imitation Playback"
                          selectedInstrument={selectedInstrument}
                          onInstrumentChange={setSelectedInstrument}
                          partInstruments={composition.instruments || []}
                          onPartInstrumentChange={(partIndex, instrument) => 
                            handlePartInstrumentChange('imitation', compIndex, partIndex, instrument)
                          }
                          partMuted={composition.muted || []}
                          onPartMuteToggle={(partIndex) => 
                            handlePartMuteToggle('imitation', compIndex, partIndex)
                          }
                          enhancedTheme={enhancedTheme}
                          playerId={`imitation-${composition.timestamp}`}
                        />
                      </ErrorBoundary>
                    </Card>
                  ))}
                </div>
              </ErrorBoundary>
            )}

            {/* Generated Fugues */}
            {fuguesList.length > 0 && (
              <ErrorBoundary>
                <Separator />
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">Fugues</h2>
                      <Badge variant="secondary">
                        {fuguesList.length} {fuguesList.length === 1 ? 'fugue' : 'fugues'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAllFugues}
                      className="text-xs gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </Button>
                  </div>

                  {fuguesList.map((composition, compIndex) => (
                    <Card key={composition.timestamp} className="p-4 space-y-4 bg-purple-50/30 dark:bg-purple-950/10 border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium flex items-center gap-2">
                          <Layers className="w-4 h-4 text-purple-600" />
                          Fugue #{compIndex + 1}
                          <Badge variant="outline" className="text-xs">
                            {composition.parts?.length || 0} voices • {new Date(composition.timestamp).toLocaleTimeString()}
                          </Badge>
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleClearFugue(compIndex)}
                          className="text-xs gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </Button>
                      </div>

                      {composition.parts && composition.parts.map((part, partIndex) => {
                        if (!part || !part.melody || !Array.isArray(part.melody) || part.melody.length === 0) return null;

                        const voiceRhythms = fugueRhythms.get(composition.timestamp);
                        const voiceRhythm = voiceRhythms?.[partIndex] || 
                          Array(part.melody.length).fill('quarter' as NoteValue);
                        
                        return (
                            <ErrorBoundary key={partIndex}>
                              <div className="space-y-3">
                                <MelodyVisualizer
                                  melody={part.melody}
                                  title={`Voice ${partIndex + 1}`}
                                  color={colorPalette[partIndex % colorPalette.length]}
                                  showClearButton={false}
                                />
                                
                                {/* Rhythm Controls for each voice */}
                                <Card className="p-3 bg-muted/30">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Music className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Voice {partIndex + 1} Rhythm
                                    </span>
                                  </div>
                                  <ErrorBoundary>
                                    <RhythmControlsEnhanced
                                      rhythm={voiceRhythm}
                                      onRhythmChange={(newRhythm) => 
                                        handleFugueRhythmChange(composition.timestamp, partIndex, newRhythm)
                                      }
                                      melodyLength={part.melody.length}
                                    />
                                  </ErrorBoundary>
                                </Card>
                              </div>
                            </ErrorBoundary>
                          );
                      })}

                      <ErrorBoundary>
                        <AudioPlayer
                          parts={(() => {
                            const voiceRhythms = fugueRhythms.get(composition.timestamp) || [];
                            return applyRhythmToParts(composition.parts, voiceRhythms);
                          })()}
                          title="Fugue Playback"
                          selectedInstrument={selectedInstrument}
                          onInstrumentChange={setSelectedInstrument}
                          partInstruments={composition.instruments || []}
                          onPartInstrumentChange={(partIndex, instrument) => 
                            handlePartInstrumentChange('fugue', compIndex, partIndex, instrument)
                          }
                          partMuted={composition.muted || []}
                          onPartMuteToggle={(partIndex) => 
                            handlePartMuteToggle('fugue', compIndex, partIndex)
                          }
                          enhancedTheme={enhancedTheme}
                          playerId={`fugue-${composition.timestamp}`}
                        />
                      </ErrorBoundary>
                    </Card>
                  ))}
                </div>
              </ErrorBoundary>
            )}

            {/* Generated Canons - NEW */}
            {canonsList.length > 0 && (
              <ErrorBoundary>
                <Separator />
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">Canons</h2>
                      <Badge variant="secondary">
                        {canonsList.length} {canonsList.length === 1 ? 'canon' : 'canons'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAllCanons}
                      className="text-xs gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </Button>
                  </div>

                  {canonsList.map((canon, canonIndex) => (
                    <CanonVisualizer
                      key={canon.timestamp}
                      canon={canon.result}
                      index={canonIndex}
                      onClear={() => handleClearCanon(canonIndex)}
                      colorPalette={colorPalette}
                      partInstruments={canon.instruments}
                      onPartInstrumentChange={(partIndex, instrument) => 
                        handleCanonPartInstrumentChange(canonIndex, partIndex, instrument)
                      }
                      partMuted={canon.muted}
                      onPartMuteToggle={(partIndex) => 
                        handleCanonPartMuteToggle(canonIndex, partIndex)
                      }
                      voiceRhythms={canonRhythms.get(canon.timestamp) || []}
                      onVoiceRhythmChange={(voiceIndex, rhythm) => 
                        handleCanonRhythmChange(canon.timestamp, voiceIndex, rhythm)
                      }
                    />
                  ))}
                </div>
              </ErrorBoundary>
            )}

            {/* Generated Fugues - AI Fugue Builder - NEW */}
            {generatedFugues.length > 0 && (
              <ErrorBoundary>
                <Separator />
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">AI Generated Fugues</h2>
                      <Badge variant="secondary" className="gap-1">
                        <Layers className="w-3 h-3" />
                        {generatedFugues.length} {generatedFugues.length === 1 ? 'fugue' : 'fugues'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAllFugueBuilders}
                      className="text-xs gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </Button>
                  </div>

                  {generatedFugues.map((fugue, fugueIndex) => (
                    <FugueVisualizer
                      key={fugue.timestamp}
                      fugue={fugue.result}
                      index={fugueIndex}
                      onClear={() => handleClearFugueBuilder(fugueIndex)}
                      colorPalette={colorPalette}
                      partInstruments={fugue.instruments}
                      onPartInstrumentChange={(partIndex, instrument) => 
                        handleFugueBuilderPartInstrumentChange(fugueIndex, partIndex, instrument)
                      }
                      partMuted={fugue.muted}
                      onPartMuteToggle={(partIndex) => 
                        handleFugueBuilderPartMuteToggle(fugueIndex, partIndex)
                      }
                      partRhythms={fugueBuilderRhythms.get(fugue.timestamp) || []}
                      onPartRhythmChange={(partIndex, rhythm) => 
                        handleFugueBuilderRhythmChange(fugue.timestamp, partIndex, rhythm)
                      }
                    />
                  ))}
                </div>
              </ErrorBoundary>
            )}

            {/* ADDITIVE: Generated Composer Accompaniments - NEW */}
            {generatedAccompaniments.length > 0 && (
              <ErrorBoundary>
                <Separator />
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">Composer Accompaniments</h2>
                      <Badge variant="secondary">
                        {generatedAccompaniments.length} pattern{generatedAccompaniments.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAllAccompaniments}
                      className="text-xs gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </Button>
                  </div>

                  <AccompanimentVisualizer
                    accompaniments={generatedAccompaniments.map(acc => ({
                      melody: acc.melody,
                      rhythm: acc.rhythm,
                      label: acc.label,
                      instrument: acc.instrument,
                      muted: acc.muted,
                      timestamp: acc.timestamp
                    }))}
                    onPlay={async (acc) => {
                      await handleAccompanimentPlay(acc.melody, acc.rhythm);
                    }}
                    onToggleMute={(timestamp) => {
                      handleAccompanimentMuteToggle(timestamp);
                    }}
                    onRemove={(timestamp) => {
                      handleClearAccompaniment(timestamp);
                    }}
                  />
                </div>
              </ErrorBoundary>
            )}

            {/* Traditional Info Panel */}
            {(selectedMode || selectedKeySignature) && (
              <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
                <h3 className="mb-3 text-indigo-900 dark:text-indigo-100">
                  Current Modal Configuration
                </h3>
                <div className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200">
                  {selectedKeySignature && (
                    <div>
                      <strong>Key Signature:</strong> {selectedKeySignature.name}
                      {selectedKeySignature.sharps !== 0 && (
                        <span className="ml-1">
                          ({Math.abs(selectedKeySignature.sharps)} {selectedKeySignature.sharps > 0 ? 'sharp' : 'flat'}{Math.abs(selectedKeySignature.sharps) > 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                  )}
                  {selectedMode && (
                    <div>
                      <strong>Current Mode:</strong> {selectedMode.name} on {PITCH_NAMES[selectedMode.final]}
                      {selectedKeySignature && selectedKeySignature.key !== selectedMode.final && (
                        <span className="opacity-75 ml-1">
                          (derived from {selectedKeySignature.name})
                        </span>
                      )}
                    </div>
                  )}
                  {selectedMode && (
                    <div>
                      <strong>Step Pattern:</strong> {selectedMode.stepPattern.join(' - ')} semitones
                    </div>
                  )}
                  <div>
                    <strong>Composition Rules:</strong> All modes support imitation (any interval), fugue (unison/5th/octave), counterpoint (with modal constraints), and stability bias controls
                  </div>
                </div>
              </Card>
            )}
          </StaggerContainer>
        </div>

        {/* Song Creation Suite - Full Width */}
        <div className="mt-8">
          <ErrorBoundary>
            <Tabs value={songTab} onValueChange={(value) => setSongTab(value as 'composer' | 'timeline' | 'components-export' | 'player' | 'export')} className="w-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Disc3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Complete Song Creation</h2>
                    <p className="text-sm text-muted-foreground">
                      Professional DAW-style composition suite for building complete musical works
                    </p>
                  </div>
                </div>
                <TabsList className="grid w-auto grid-cols-5">
                  <TabsTrigger value="composer" className="gap-1">
                    <Layers className="w-4 h-4" />
                    Compose
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="gap-1">
                    <Zap className="w-4 h-4" />
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="components-export" className="gap-1">
                    <Download className="w-4 h-4" />
                    Export Components
                  </TabsTrigger>
                  <TabsTrigger value="player" className="gap-1" disabled={!currentSong}>
                    <Play className="w-4 h-4" />
                    Play
                  </TabsTrigger>
                  <TabsTrigger value="export" className="gap-1" disabled={!currentSong}>
                    <Disc3 className="w-4 h-4" />
                    Export Song
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="composer" className="mt-0">
                <EnhancedSongComposer
                  theme={theme}
                  imitationsList={imitationsList}
                  fuguesList={fuguesList}
                  canonsList={canonsList}
                  generatedFuguesList={generatedFugues}
                  generatedCounterpoints={generatedCounterpoints}
                  generatedHarmoniesList={generatedHarmonies}
                  generatedArpeggiosList={generatedArpeggios}
                  generatedAccompanimentsList={generatedAccompaniments}
                  bachVariables={bachVariables}
                  themeRhythm={themeRhythm}
                  bachVariableRhythms={bachVariableRhythms}
                  imitationRhythms={imitationRhythms}
                  fugueRhythms={fugueRhythms}
                  counterpointRhythms={counterpointRhythms}
                  onExportSong={handleSongExport}
                />
              </TabsContent>

              <TabsContent value="timeline" className="mt-0">
                <ProfessionalTimeline
                  availableComponents={[
                    // Convert all components to the unified format
                    // CRITICAL FIX: Use parts array structure for imitations
                    ...imitationsList.map((imitation, index) => {
                      try {
                        const imitationPart = imitation?.parts?.[0];
                        if (!imitationPart?.melody) return null;
                        return {
                          type: 'imitation' as const,
                          name: `Imitation ${index + 1}`,
                          melody: imitationPart.melody,
                          rhythm: [],
                          instrument: imitation.instruments?.[0] || 'piano',
                          timestamp: imitation.timestamp
                        };
                      } catch (err) {
                        console.warn(`Error mapping imitation ${index}:`, err);
                        return null;
                      }
                    }).filter(Boolean) as any[],
                    // CRITICAL FIX: Use parts array structure for fugues
                    ...fuguesList.map((fugue, index) => {
                      try {
                        const answerPart = fugue?.parts?.[1] || fugue?.parts?.[0];
                        if (!answerPart?.melody) return null;
                        return {
                          type: 'fugue' as const,
                          name: `Fugue ${index + 1}`,
                          melody: answerPart.melody,
                          rhythm: [],
                          instrument: fugue.instruments?.[1] || fugue.instruments?.[0] || 'piano',
                          timestamp: fugue.timestamp
                        };
                      } catch (err) {
                        console.warn(`Error mapping fugue ${index}:`, err);
                        return null;
                      }
                    }).filter(Boolean) as any[],
                    ...canonsList.map((canon, index) => ({
                      type: 'canon' as const,
                      name: `${canon.result.metadata?.type || 'Canon'} ${index + 1}`,
                      melody: canon.result.voices[0]?.melody || [],
                      rhythm: canon.result.voices[0]?.rhythm || [],
                      instrument: canon.instruments[0] || 'piano',
                      timestamp: canon.timestamp
                    })),
                    ...generatedFugues.map((fugue, index) => {
                      // Extract the subject from the fugue sections
                      const subjectEntry = fugue.result.sections
                        .flatMap(section => section.voices)
                        .find(voice => voice.role === 'subject');
                      
                      return {
                        type: 'generated-fugue' as const,
                        name: `Generated Fugue ${index + 1}`,
                        melody: subjectEntry?.material || [],
                        rhythm: subjectEntry?.rhythm || [],
                        instrument: fugue.instruments?.[0] || 'piano',
                        timestamp: fugue.timestamp
                      };
                    }),
                    ...generatedCounterpoints.map((cp, index) => ({
                      type: 'counterpoint' as const,
                      name: `Counterpoint ${index + 1}`,
                      melody: cp.melody,
                      rhythm: [],
                      instrument: cp.instrument,
                      timestamp: cp.timestamp
                    })),
                    ...generatedHarmonies.map((harmony, index) => {
                      try {
                        // CRITICAL FIX: Pass harmonyNotes as a separate field for chord playback
                        // Use the first note of each chord as the dummy melody for component structure
                        const dummyMelody = harmony.result.harmonyNotes?.map(chordNotes => 
                          (Array.isArray(chordNotes) && chordNotes.length > 0) ? chordNotes[0] : 60
                        ) || [];
                        
                        return {
                          id: `harmony-${index}-${harmony.timestamp}`,
                          type: 'harmony' as const,
                          name: `Harmonized Melody #${index + 1}`,
                          melody: dummyMelody, // Dummy melody for structure
                          rhythm: harmony.result.harmonyRhythm || [],
                          harmonyNotes: harmony.result.harmonyNotes, // CRITICAL: Full chord data for playback
                          instrument: harmony.instrument,
                          color: '#06b6d4',
                          duration: (harmony.result.harmonyNotes?.length || 0),
                          description: `${harmony.result.chordLabels?.length || 0} chords • ${harmony.instrument}`,
                          timestamp: harmony.timestamp
                        };
                      } catch (err) {
                        console.error(`Error mapping harmony #${index + 1} for timeline:`, err);
                        return null;
                      }
                    }).filter(Boolean) as any[],
                    ...generatedArpeggios.map((arpeggio, index) => {
                      try {
                        return {
                          id: `arpeggio-${index}-${arpeggio.timestamp}`,
                          type: 'part' as const,
                          name: `Arpeggio Chain #${index + 1}`,
                          melody: arpeggio.melody || [],
                          rhythm: arpeggio.rhythm || [],
                          instrument: arpeggio.instrument || 'piano',
                          color: '#8b5cf6',
                          duration: arpeggio.melody?.length || 0,
                          description: `${arpeggio.label} • ${arpeggio.melody?.length || 0} notes`,
                          timestamp: arpeggio.timestamp
                        };
                      } catch (err) {
                        console.error(`Error mapping arpeggio #${index + 1} for timeline:`, err);
                        return null;
                      }
                    }).filter(Boolean) as any[]
                  ]}
                />
              </TabsContent>

              <TabsContent value="components-export" className="mt-0">
                <AvailableComponentsExporter
                  components={[
                    // Convert all components to AvailableComponent format with full data
                    // CRITICAL FIX: Use parts array structure for imitations
                    ...imitationsList.map((imitation, index) => {
                      try {
                        const imitationPart = imitation?.parts?.[0];
                        if (!imitationPart?.melody) return null;
                        return {
                          id: `imitation-${index}-${imitation.timestamp}`,
                          type: 'imitation' as const,
                          name: `Imitation ${index + 1}`,
                          melody: imitationPart.melody,
                          rhythm: [],
                          instrument: imitation.instruments?.[0] || 'piano',
                          color: '#3b82f6',
                          duration: imitationPart.melody.length,
                          description: `Melodic imitation at interval`
                        };
                      } catch (err) {
                        console.warn(`Error mapping imitation ${index} for exporter:`, err);
                        return null;
                      }
                    }).filter(Boolean) as any[],
                    // CRITICAL FIX: Use parts array structure for fugues
                    ...fuguesList.map((fugue, index) => {
                      try {
                        const answerPart = fugue?.parts?.[1] || fugue?.parts?.[0];
                        if (!answerPart?.melody) return null;
                        return {
                          id: `fugue-${index}-${fugue.timestamp}`,
                          type: 'fugue' as const,
                          name: `Fugue ${index + 1}`,
                          melody: answerPart.melody,
                          rhythm: [],
                          instrument: fugue.instruments?.[1] || fugue.instruments?.[0] || 'piano',
                          color: '#8b5cf6',
                          duration: answerPart.melody.length,
                          description: `Fugue answer`
                        };
                      } catch (err) {
                        console.warn(`Error mapping fugue ${index} for exporter:`, err);
                        return null;
                      }
                    }).filter(Boolean) as any[],
                    ...canonsList.map((canon, index) => ({
                      id: `canon-${index}-${canon.timestamp}`,
                      type: 'part' as const,
                      name: `${canon.result.metadata?.type || 'Canon'} ${index + 1}`,
                      melody: canon.result.voices[0]?.melody || [],
                      rhythm: canon.result.voices[0]?.rhythm || [],
                      instrument: canon.instruments[0] || 'piano',
                      color: '#ec4899',
                      duration: canon.result.voices[0]?.melody?.length || 0,
                      description: `Canon type: ${canon.result.metadata?.type || 'Unknown'}`,
                      metadata: {
                        canonType: canon.result.metadata?.type,
                        entryDelay: canon.result.metadata?.entryDelay,
                        entryPattern: canon.result.metadata?.entryPattern
                      }
                    })),
                    ...generatedFugues.map((fugue, index) => {
                      // Extract the subject from the fugue sections
                      const subjectEntry = fugue.result.sections
                        .flatMap(section => section.voices)
                        .find(voice => voice.role === 'subject');
                      
                      const melody = subjectEntry?.material || [];
                      const rhythm = subjectEntry?.rhythm || [];
                      
                      return {
                        id: `generated-fugue-${index}-${fugue.timestamp}`,
                        type: 'fugue' as const,
                        name: `Generated Fugue ${index + 1}`,
                        melody,
                        rhythm,
                        instrument: fugue.instruments?.[0] || 'piano',
                        color: '#a855f7',
                        duration: melody.length,
                        description: `AI-generated fugue - ${fugue.result.metadata?.architecture || 'Unknown'} architecture`,
                        metadata: {
                          fugueArchitecture: fugue.result.metadata?.architecture,
                          totalVoices: fugue.result.metadata?.numVoices
                        }
                      };
                    }),
                    ...generatedCounterpoints.map((cp, index) => ({
                      id: `counterpoint-${index}-${cp.timestamp}`,
                      type: 'counterpoint' as const,
                      name: `Counterpoint ${index + 1}`,
                      melody: cp.melody,
                      rhythm: [],
                      instrument: cp.instrument,
                      color: '#f97316',
                      duration: cp.melody.length,
                      description: `${cp.technique || 'Species'} counterpoint`,
                      metadata: {
                        technique: cp.technique
                      }
                    })),
                    ...generatedHarmonies.map((harmony, index) => {
                      try {
                        // CRITICAL FIX: Use dummy melody from first note of each chord
                        const dummyMelody = harmony.result.harmonyNotes?.map(chordNotes => 
                          (Array.isArray(chordNotes) && chordNotes.length > 0) ? chordNotes[0] : 60
                        ) || [];
                        
                        return {
                          id: `harmony-${index}-${harmony.timestamp}`,
                          type: 'harmony' as const,
                          name: `Harmonized Melody #${index + 1}`,
                          melody: dummyMelody, // Dummy melody for structure - real playback uses harmonyNotes
                          rhythm: harmony.result.harmonyRhythm || [],
                          harmonyNotes: harmony.result.harmonyNotes || [], // CRITICAL: Full chord data
                          instrument: harmony.instrument,
                          color: '#06b6d4',
                          duration: (harmony.result.harmonyNotes?.length || 0),
                          description: `${harmony.result.chordLabels?.length || 0} chords only • ${harmony.instrument}`,
                          metadata: {
                            chordLabels: harmony.result.chordLabels,
                            chordProgression: harmony.result.analysis?.chordProgression,
                            chordRoots: harmony.result.analysis?.chordRoots,
                            chordTimings: harmony.result.analysis?.chordTimings,
                            detectedKey: harmony.result.analysis?.detectedKey,
                            keyQuality: harmony.result.analysis?.keyQuality,
                            confidence: harmony.result.analysis?.confidence,
                            originalMelody: harmony.result.originalMelody,
                            timestamp: harmony.timestamp,
                            generatorType: 'harmony'
                          }
                        };
                      } catch (err) {
                        console.error(`Error mapping harmony #${index + 1} for export:`, err);
                        return null;
                      }
                    }).filter(Boolean) as any[],
                    ...generatedArpeggios.map((arpeggio, index) => {
                      try {
                        return {
                          id: `arpeggio-${index}-${arpeggio.timestamp}`,
                          type: 'part' as const,
                          name: `Arpeggio Chain #${index + 1}`,
                          melody: arpeggio.melody || [],
                          rhythm: arpeggio.rhythm || [],
                          instrument: arpeggio.instrument || 'piano',
                          color: '#8b5cf6',
                          duration: arpeggio.melody?.length || 0,
                          description: `${arpeggio.label} • ${arpeggio.melody?.length || 0} notes • ${arpeggio.instrument}`,
                          metadata: {
                            timestamp: arpeggio.timestamp,
                            generatorType: 'arpeggio'
                          }
                        };
                      } catch (err) {
                        console.error(`Error mapping arpeggio #${index + 1} for export:`, err);
                        return null;
                      }
                    }).filter(Boolean) as any[],
                    ...generatedAccompaniments.map((accompaniment, index) => {
                      try {
                        return {
                          id: `accompaniment-${index}-${accompaniment.timestamp}`,
                          type: 'part' as const,
                          name: `Composer Accompaniment #${index + 1}`,
                          melody: accompaniment.melody || [],
                          rhythm: accompaniment.rhythm || [],
                          instrument: accompaniment.instrument || 'piano',
                          color: '#d946ef',
                          duration: accompaniment.melody?.length || 0,
                          description: `${accompaniment.label} • ${accompaniment.melody?.length || 0} notes • ${accompaniment.instrument}`,
                          metadata: {
                            timestamp: accompaniment.timestamp,
                            generatorType: 'accompaniment'
                          }
                        };
                      } catch (err) {
                        console.error(`Error mapping accompaniment #${index + 1} for export:`, err);
                        return null;
                      }
                    }).filter(Boolean) as any[]
                  ]}
                  projectName={currentSong?.title || 'Musical_Project'}
                />
              </TabsContent>

              <TabsContent value="player" className="mt-0">
                {currentSong ? (
                  <SongPlayer
                    song={currentSong}
                    onSongUpdate={handleSongUpdate}
                  />
                ) : (
                  <Card className="p-8 text-center">
                    <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Song Created</h3>
                    <p className="text-muted-foreground text-sm">
                      Create a song in the Compose tab to see playback controls here.
                    </p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="export" className="mt-0">
                {currentSong ? (
                  <SongExporter song={currentSong} />
                ) : (
                  <Card className="p-8 text-center">
                    <Disc3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Song to Export</h3>
                    <p className="text-muted-foreground text-sm">
                      Create a song in the Compose tab to see export options here.
                    </p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </ErrorBoundary>
        </div>

        {/* Piano Keyboard - Full Width at Bottom */}
        <div className="mt-8">
          <ErrorBoundary>
            <PianoKeyboard
              ref={pianoKeyboardRef}
              startOctave={pianoStartOctave}
              octaveRange={pianoOctaveRange}
              selectedInstrument={selectedInstrument}
              onNoteAdd={handlePianoNoteAdd}
              onMidiNotesRecorded={handleMidiNotesRecorded}
            />
          </ErrorBoundary>
        </div>
      </div>
      <Toaster />
      </div>
    </div>
    </UndoRedoProvider>
    </AuthProvider>
  );
}