import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { PITCH_NAMES } from '../types/musical';
import { InstrumentType, ENHANCED_INSTRUMENTS } from '../lib/enhanced-synthesis';
import { EnhancedSynthesizer } from '../lib/enhanced-synthesis';
import { Piano, VolumeX } from 'lucide-react';

interface PianoKeyboardProps {
  startOctave?: number;
  octaveRange?: number;
  selectedInstrument?: InstrumentType;
  onNotePlay?: (pitch: number, frequency: number) => void;
  onNoteAdd?: (midiNote: number) => void;
  onMidiNotesRecorded?: (notes: number[]) => void;
}

export interface PianoKeyboardRef {
  triggerKey: (midiNote: number) => void;
}

interface KeyInfo {
  pitch: number;
  note: string;
  octave: number;
  isBlack: boolean;
  frequency: number;
}

export const PianoKeyboard = forwardRef<PianoKeyboardRef, PianoKeyboardProps>(({ 
  startOctave = 4, 
  octaveRange = 1.5, 
  selectedInstrument = 'piano',
  onNotePlay,
  onNoteAdd,
  onMidiNotesRecorded
}, ref) => {
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());
  const [isMuted, setIsMuted] = useState(false);
  const [midiConnected, setMidiConnected] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthesizerRef = useRef<EnhancedSynthesizer | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const midiAccessRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Audio API
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      synthesizerRef.current = new EnhancedSynthesizer(audioContextRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = 0.6;
    }

    // Enhanced MIDI initialization for deployment environments
    const initMidi = async () => {
      try {
        console.log('🎹 === PIANO KEYBOARD MIDI INIT ===');
        console.log('🎹 Environment check:');
        console.log('  - Protocol:', window.location.protocol);
        console.log('  - Host:', window.location.host);
        console.log('  - Navigator MIDI available:', !!navigator.requestMIDIAccess);
        
        // Check if MIDI is available and not restricted
        if (!navigator.requestMIDIAccess) {
          console.log('❌ MIDI not supported in this browser');
          setMidiConnected(false);
          return;
        }

        console.log('🎹 Requesting MIDI access...');
        
        // Try to request MIDI access with timeout protection
        const midiAccess = await Promise.race([
          navigator.requestMIDIAccess({ sysex: false }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('MIDI access timeout')), 10000)
          )
        ]) as any;
        
        midiAccessRef.current = midiAccess;
        console.log('✅ MIDI access granted');
        
        const inputs = Array.from(midiAccess.inputs.values());
        const outputs = Array.from(midiAccess.outputs.values());
        
        console.log('🎹 MIDI devices found:');
        console.log('  - Inputs:', inputs.length);
        console.log('  - Outputs:', outputs.length);
        
        if (inputs.length > 0) {
          setMidiConnected(true);
          console.log('🎹 Setting up MIDI input handlers...');
          
          inputs.forEach((input: any, index: number) => {
            console.log(`🎹 Input ${index + 1}: ${input.name || 'Unknown Device'}`);
            
            input.onmidimessage = (message: any) => {
              const [command, note, velocity] = message.data;
              
              console.log('🎹 === MIDI MESSAGE RECEIVED ===');
              console.log('🎹 Raw data:', Array.from(message.data));
              console.log('🎹 Command:', command, 'Note:', note, 'Velocity:', velocity);
              console.log('🎹 Note name:', note, 'Velocity:', velocity);
              
              // Note on (144-159) or note off (128-143)
              if ((command >= 144 && command <= 159 && velocity > 0) || 
                  (command >= 128 && command <= 143)) {
                if (command >= 144 && command <= 159 && velocity > 0) {
                  console.log('🎹 Note ON detected:', note);
                  
                  // Trigger the key (handles visual feedback and audio only)
                  triggerKeyByMidi(note);
                  
                  // Route the note through the main MIDI recording system for proper targeting
                  console.log('🎹 Routing MIDI note to recording system...');
                  if (onMidiNotesRecorded) {
                    console.log('🎹 Calling onMidiNotesRecorded with note:', note);
                    onMidiNotesRecorded([note]);
                  } else {
                    console.warn('⚠️ onMidiNotesRecorded callback not available');
                  }
                } else {
                  console.log('🎹 Note OFF detected:', note);
                }
              }
            };
            
            // Handle connection state changes
            input.onstatechange = (event: any) => {
              console.log('🎹 MIDI device state changed:', event.port.name, event.port.state);
              if (event.port.state === 'disconnected') {
                console.log('🎹 Device disconnected, checking remaining devices...');
                const remainingInputs = Array.from(midiAccessRef.current?.inputs.values() || [])
                  .filter((inp: any) => inp.state === 'connected');
                setMidiConnected(remainingInputs.length > 0);
              }
            };
          });
          
          console.log('✅ MIDI setup complete - all input handlers registered');
          
        } else {
          setMidiConnected(false);
          console.log('ℹ️ No MIDI inputs detected - connect a MIDI device and refresh');
        }
        
        // Set up state change monitoring
        midiAccess.onstatechange = (event: any) => {
          console.log('🎹 MIDI system state change:', event.port.name, event.port.state);
          const inputs = Array.from(midiAccess.inputs.values());
          const connectedInputs = inputs.filter((input: any) => input.state === 'connected');
          setMidiConnected(connectedInputs.length > 0);
          
          if (connectedInputs.length > 0) {
            console.log('🎹 MIDI devices reconnected');
          } else {
            console.log('🎹 All MIDI devices disconnected');
          }
        };
        
      } catch (error: any) {
        console.log('❌ === MIDI INITIALIZATION FAILED ===');
        console.log('❌ Error type:', error.name);
        console.log('❌ Error message:', error.message);
        console.log('❌ Full error:', error);
        
        // Handle specific errors with helpful messages
        if (error.name === 'SecurityError') {
          if (error.message.includes('permissions policy')) {
            console.log('🎹 MIDI restricted by permissions policy (Figma Make environment)');
          } else if (error.message.includes('https') || error.message.includes('secure')) {
            console.log('❌ MIDI requires HTTPS in production environments');
          } else {
            console.log('❌ MIDI access denied by browser security');
          }
        } else if (error.name === 'NotSupportedError') {
          console.log('❌ MIDI not supported in this browser/environment');
        } else if (error.message === 'MIDI access timeout') {
          console.log('❌ MIDI access request timed out');
        } else {
          console.log('❌ Unknown MIDI error');
        }
        
        setMidiConnected(false);
      }
    };

    initMidi();

    return () => {
      // Cleanup MIDI connections
      if (midiAccessRef.current) {
        const inputs = Array.from(midiAccessRef.current.inputs.values());
        inputs.forEach((input: any) => {
          input.onmidimessage = null;
        });
      }
    };
  }, []);

  const frequencyFromPitch = (pitch: number): number => {
    // Convert pitch to frequency using equal temperament
    // A4 (MIDI note 69) = 440 Hz
    return 440 * Math.pow(2, (pitch - 69) / 12);
  };

  const generateKeys = (): KeyInfo[] => {
    const keys: KeyInfo[] = [];
    const totalSemitones = Math.floor(octaveRange * 12);
    const startMidiNote = startOctave * 12; // Start from C in the start octave (MIDI note calculation)

    for (let i = 0; i < totalSemitones; i++) {
      const midiNote = startMidiNote + i;
      const pitchClass = midiNote % 12;
      const octave = Math.floor(midiNote / 12);
      const isBlack = [1, 3, 6, 8, 10].includes(pitchClass); // C#, D#, F#, G#, A#
      
      keys.push({
        pitch: midiNote,
        note: PITCH_NAMES[pitchClass],
        octave,
        isBlack,
        frequency: frequencyFromPitch(midiNote)
      });
    }

    return keys;
  };

  const playNote = async (key: KeyInfo, skipNoteAdd: boolean = false) => {
    if (isMuted || !audioContextRef.current || !synthesizerRef.current || !gainNodeRef.current) {
      return;
    }

    try {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const config = ENHANCED_INSTRUMENTS[selectedInstrument];
      if (!config) {
        console.error(`Unknown instrument: ${selectedInstrument}`);
        return;
      }

      // Play the note
      synthesizerRef.current.createInstrumentNote(
        key.frequency,
        0.8, // Duration
        config,
        gainNodeRef.current,
        0 // No delay
      );

      // Callback for external handling
      if (onNotePlay) {
        onNotePlay(key.pitch % 12, key.frequency);
      }

      // Callback for adding to composition (now passes full MIDI note)
      // Skip this for MIDI input since routing is handled separately
      if (onNoteAdd && !skipNoteAdd) {
        onNoteAdd(key.pitch);
      }

    } catch (error) {
      console.error('Error playing note:', error);
    }
  };

  const handleKeyPress = (key: KeyInfo) => {
    setPressedKeys(prev => new Set([...prev, key.pitch]));
    playNote(key);
    
    // Release key after short delay for visual feedback
    setTimeout(() => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key.pitch);
        return newSet;
      });
    }, 150);
  };

  // Function to trigger a key by MIDI note number
  const triggerKeyByMidi = (midiNote: number) => {
    const keys = generateKeys();
    const key = keys.find(k => k.pitch === midiNote);
    
    if (key) {
      // For MIDI input: handle visual/audio feedback for keys in visible range
      setPressedKeys(prev => new Set([...prev, key.pitch]));
      playNote(key, true); // Add flag to skip onNoteAdd call
      console.log('🎹 MIDI triggered visible key:', key.note, key.octave);
      
      // Release key after short delay for visual feedback
      setTimeout(() => {
        setPressedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(key.pitch);
          return newSet;
        });
      }, 150);
    } else {
      // For notes outside visible range, create a temporary key object and play it
      console.log('🎹 MIDI note outside keyboard range, but playing audio:', midiNote);
      
      const pitchClass = midiNote % 12;
      const octave = Math.floor(midiNote / 12);
      const isBlack = [1, 3, 6, 8, 10].includes(pitchClass);
      
      const tempKey: KeyInfo = {
        pitch: midiNote,
        note: PITCH_NAMES[pitchClass],
        octave,
        isBlack,
        frequency: frequencyFromPitch(midiNote)
      };
      
      // Play the note even though it's not visible on the keyboard
      playNote(tempKey, true); // Skip onNoteAdd since routing is handled separately
      console.log('🎹 MIDI triggered off-screen key:', tempKey.note, tempKey.octave, 'frequency:', tempKey.frequency.toFixed(2) + 'Hz');
    }
  };

  // Expose triggerKey function through ref
  useImperativeHandle(ref, () => ({
    triggerKey: triggerKeyByMidi
  }));

  const keys = generateKeys();
  const whiteKeys = keys.filter(k => !k.isBlack);
  const blackKeys = keys.filter(k => k.isBlack);

  const getBlackKeyPosition = (key: KeyInfo): number => {
    const keyWidth = 100 / whiteKeys.length;
    const pitchClass = key.pitch % 12;
    const octave = Math.floor(key.pitch / 12);
    const startOctaveNumber = Math.floor(keys[0].pitch / 12);
    const relativeOctave = octave - startOctaveNumber;
    
    // Real piano layout: Black keys are positioned between specific white keys
    // Pattern per octave: C-C#-D-D#-E-F-F#-G-G#-A-A#-B
    // Groups: [C# D#] gap [F# G# A#] - 2 black keys, gap, 3 black keys
    let positionInOctave = 0;
    
    switch (pitchClass) {
      case 1: // C# - between C and D (0.5 white keys from C)
        positionInOctave = 0.5;
        break;
      case 3: // D# - between D and E (1.5 white keys from C)  
        positionInOctave = 1.5;
        break;
      case 6: // F# - between F and G (3.5 white keys from C)
        positionInOctave = 3.5;
        break;
      case 8: // G# - between G and A (4.5 white keys from C)
        positionInOctave = 4.5;
        break;
      case 10: // A# - between A and B (5.5 white keys from C)
        positionInOctave = 5.5;
        break;
    }
    
    // Calculate total position: white keys per full octave (7) * octave offset + position within octave
    const totalWhiteKeyPosition = relativeOctave * 7 + positionInOctave;
    
    return totalWhiteKeyPosition * keyWidth;
  };

  return (
    <Card className="p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Piano className="w-5 h-5" />
          <h3 className="font-medium">Virtual Piano Keyboard</h3>
          <Badge variant="outline" className="text-xs">
            {octaveRange} octaves
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Primary Input
          </Badge>
          {midiConnected && (
            <Badge variant="outline" className="text-xs text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
              🎹 MIDI Connected
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {ENHANCED_INSTRUMENTS[selectedInstrument].name}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className={isMuted ? 'text-muted-foreground' : ''}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Piano className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="relative bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg border shadow-inner">
        {/* White Keys */}
        <div className="flex relative">
          {whiteKeys.map((key, index) => (
            <button
              key={key.pitch}
              className={`
                relative h-32 flex-1 border-r border-gray-300 dark:border-gray-600 rounded-b-md
                transition-all duration-75 select-none
                ${pressedKeys.has(key.pitch) 
                  ? 'bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 shadow-inner' 
                  : 'bg-gradient-to-b from-white to-gray-50 dark:from-gray-100 dark:to-gray-200 hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-50 dark:hover:to-gray-100 shadow-md hover:shadow-lg'
                }
                ${index === 0 ? 'rounded-bl-md border-l' : ''}
                ${index === whiteKeys.length - 1 ? 'rounded-br-md' : ''}
              `}
              onMouseDown={() => handleKeyPress(key)}
              style={{ minWidth: '32px' }}
            >
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 dark:text-gray-800">
                {key.note}
                <div className="text-[10px] text-gray-500 dark:text-gray-700">
                  {key.octave}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Black Keys */}
        <div className="absolute top-4 left-4 right-4">
          {blackKeys.map((key) => {
            const keyWidth = 100 / whiteKeys.length;
            return (
              <button
                key={key.pitch}
                className={`
                  absolute h-20 rounded-b-md border border-gray-800
                  transition-all duration-75 select-none z-10
                  ${pressedKeys.has(key.pitch)
                    ? 'bg-gradient-to-b from-gray-700 to-gray-900 shadow-inner'
                    : 'bg-gradient-to-b from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 shadow-lg hover:shadow-xl'
                  }
                `}
                style={{ 
                  left: `${getBlackKeyPosition(key)}%`,
                  width: `${keyWidth * 0.7}%`, // 70% of white key width for realistic proportions
                  transform: 'translateX(-50%)',
                  minWidth: '24px' // Ensure minimum readable size
                }}
                onMouseDown={() => handleKeyPress(key)}
              >
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-[9px] font-medium text-white">
                  {key.note}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground space-y-1">
        <div>
          Click keys to play notes • Keys will be automatically added to your theme
          {midiConnected && <span className="text-green-700 dark:text-green-300"> • MIDI keyboard connected and controlling this piano</span>}
        </div>
        <div className="text-[10px] bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 p-2 rounded">
          <strong>🎵 Audio Range:</strong> All MIDI notes (C0-C8) will play sound, even if not visible on keyboard. Visual feedback limited to {PITCH_NAMES[keys[0]?.pitch % 12]}{Math.floor(keys[0]?.pitch / 12)}-{PITCH_NAMES[keys[keys.length - 1]?.pitch % 12]}{Math.floor(keys[keys.length - 1]?.pitch / 12)} range.
        </div>
        <div className="text-[10px] bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-2 rounded">
          <strong>🎹 Primary Input Method:</strong> Use this virtual keyboard to compose melodies by clicking the keys{midiConnected ? ' or playing your MIDI keyboard' : ''}. Each note you play will be added to your current theme.
        </div>
        {midiConnected && (
          <div className="text-[10px] bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-2 rounded">
            <strong>🎹 MIDI Integration Active:</strong> Your physical MIDI keyboard is controlling this virtual piano. Press keys on your MIDI keyboard to see them light up here and hear the selected instrument.
          </div>
        )}
      </div>
    </Card>
  );
});