import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { 
  Keyboard, 
  Circle, 
  Square, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Settings2,
  Zap,
  Music,
  Activity,
  Radio,
  Upload,
  Download,
  Play,
  Pause,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface MidiDevice {
  id: string;
  name: string;
  manufacturer: string;
  state: string;
  type: 'input' | 'output';
}

interface RecordedNote {
  pitch: number;
  timestamp: number;
  velocity: number;
  channel: number;
}

interface MidiIOProps {
  onNotesRecorded?: (notes: number[]) => void;
  selectedInstrument?: string;
}

interface MidiSettings {
  inputChannel: number;
  outputChannel: number;
  velocitySensitivity: number;
  noteVelocityThreshold: number;
  recordingMode: 'replace' | 'append' | 'layer';
  quantization: number;
  transposeInput: number;
  transposeOutput: number;
  enablePassthrough: boolean;
  enableMetronome: boolean;
  metronomeVolume: number;
}

export function MidiIO({ onNotesRecorded, selectedInstrument = 'piano' }: MidiIOProps) {
  // Device and connection state
  const [isSupported, setIsSupported] = useState(false);
  const [midiInitialized, setMidiInitialized] = useState(false);
  const [inputDevices, setInputDevices] = useState<MidiDevice[]>([]);
  const [outputDevices, setOutputDevices] = useState<MidiDevice[]>([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState<string | null>(null);
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string | null>(null);
  const [inputEnabled, setInputEnabled] = useState(false);
  const [outputEnabled, setOutputEnabled] = useState(false);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<RecordedNote[]>([]);
  const [lastNote, setLastNote] = useState<{ pitch: number; velocity: number; channel: number; timestamp: number } | null>(null);
  
  // MIDI settings
  const [settings, setSettings] = useState<MidiSettings>({
    inputChannel: 0, // 0 = all channels
    outputChannel: 1,
    velocitySensitivity: 100,
    noteVelocityThreshold: 10,
    recordingMode: 'replace',
    quantization: 0, // 0 = no quantization
    transposeInput: 0,
    transposeOutput: 0,
    enablePassthrough: false,
    enableMetronome: false,
    metronomeVolume: 50
  });
  
  // Activity monitoring
  const [inputActivity, setInputActivity] = useState(false);
  const [outputActivity, setOutputActivity] = useState(false);
  
  const midiAccessRef = useRef<WebMidi.MIDIAccess | null>(null);
  const recordingStartTime = useRef<number>(0);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const hasMidiSupport = !!navigator.requestMIDIAccess;
    console.log('🔍 MIDI Support Check:', hasMidiSupport ? 'Supported' : 'Not Supported');
    setIsSupported(hasMidiSupport);
    
    return () => {
      if (midiAccessRef.current) {
        for (const input of midiAccessRef.current.inputs.values()) {
          input.onmidimessage = null;
        }
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, []);

  const requestMidiAccessSafely = async () => {
    console.log('🔐 Requesting MIDI access from browser...');
    
    try {
      if (!navigator.requestMIDIAccess) {
        throw new Error('MIDI not supported in this browser');
      }

      console.log('🌐 Browser supports MIDI, requesting access...');
      
      const midiAccess = await navigator.requestMIDIAccess({ 
        sysex: false, 
        software: true
      });
      midiAccessRef.current = midiAccess;
      
      console.log('🎹 MIDI access granted! System details:');
      console.log('   📊 Inputs available:', midiAccess.inputs.size);
      console.log('   📤 Outputs available:', midiAccess.outputs.size);
      
      midiAccess.onstatechange = handleStateChange;
      updateDeviceList();
      
      setTimeout(() => {
        console.log('🔍 Secondary device scan...');
        updateDeviceList();
      }, 500);
      
      setTimeout(() => {
        console.log('🔍 Final device scan...');
        updateDeviceList();
      }, 1500);
      
      toast.success('MIDI system initialized! Scanning for devices...');
      return true;
    } catch (error) {
      console.error('❌ MIDI access failed:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Error details:', error);
      setIsSupported(false);
      setMidiInitialized(true);
      
      if (error instanceof Error && error.message.includes('permissions policy')) {
        console.log('🚫 MIDI blocked by browser permissions policy');
        toast.info('MIDI access is disabled in this environment.');
      } else if (error instanceof Error && error.message.includes('SecurityError')) {
        console.log('🚫 MIDI access denied by user or security policy');
        toast.error('MIDI access was denied. Please check browser permissions.');
      } else if (error instanceof Error && error.message.includes('NotSupportedError')) {
        console.log('🚫 MIDI not supported in this browser');
        toast.error('MIDI not supported. Please use Chrome, Edge, or Firefox.');
      } else {
        toast.error('MIDI system unavailable. Check console for details.');
      }
      return false;
    }
  };

  const initializeMidi = async () => {
    console.log('🚀 Initializing MIDI access...');
    setMidiInitialized(true);
    const success = await requestMidiAccessSafely();
    
    if (success) {
      setTimeout(updateDeviceList, 100);
    }
  };

  const handleStateChange = (event: WebMidi.MIDIConnectionEvent) => {
    console.log('MIDI device state changed:', event.port.name, event.port.state);
    updateDeviceList();
    
    if (event.port.state === 'connected') {
      toast.success(`MIDI device connected: ${event.port.name}`);
    } else if (event.port.state === 'disconnected') {
      toast.info(`MIDI device disconnected: ${event.port.name}`);
    }
  };

  const updateDeviceList = () => {
    console.log('🔄 Refreshing MIDI device list...');
    
    if (!midiAccessRef.current) {
      console.log('❌ No MIDI access available.');
      return;
    }
    
    try {
      const inputs: MidiDevice[] = [];
      const outputs: MidiDevice[] = [];
      
      console.log(`🎹 Scanning MIDI inputs... (Total available: ${midiAccessRef.current.inputs.size})`);
      console.log(`📤 Scanning MIDI outputs... (Total available: ${midiAccessRef.current.outputs.size})`);
      
      for (const input of midiAccessRef.current.inputs.values()) {
        const deviceName = input.name || 'Unknown Input';
        const manufacturer = input.manufacturer || 'Unknown';
        
        inputs.push({
          id: input.id,
          name: deviceName,
          manufacturer: manufacturer,
          state: input.state,
          type: 'input'
        });
        
        const isCasio = deviceName.toLowerCase().includes('casio') || manufacturer.toLowerCase().includes('casio');
        const deviceIcon = isCasio ? '🎹' : '🔌';
        
        console.log(`${deviceIcon} MIDI Input: "${deviceName}" (${manufacturer}) - State: ${input.state}`);
        
        if (isCasio) {
          console.log(`🎹 *** CASIO KEYBOARD DETECTED: ${deviceName} ***`);
          toast.success(`Casio keyboard detected: ${deviceName}`, { duration: 4000 });
        }
      }
      
      for (const output of midiAccessRef.current.outputs.values()) {
        const deviceName = output.name || 'Unknown Output';
        const manufacturer = output.manufacturer || 'Unknown';
        
        outputs.push({
          id: output.id,
          name: deviceName,
          manufacturer: manufacturer,
          state: output.state,
          type: 'output'
        });
        
        const isCasio = deviceName.toLowerCase().includes('casio') || manufacturer.toLowerCase().includes('casio');
        const deviceIcon = isCasio ? '🎹' : '📤';
        console.log(`${deviceIcon} MIDI Output: "${deviceName}" (${manufacturer}) - State: ${output.state}`);
      }
      
      setInputDevices(inputs);
      setOutputDevices(outputs);
      
      console.log(`✅ Device scan complete. Found ${inputs.length} input(s) and ${outputs.length} output(s)`);
      
      if (inputs.length === 0 && outputs.length === 0) {
        console.log('⚠️ No MIDI devices found.');
        toast.error('No USB MIDI devices found. Check keyboard power, USB connection, and close DAW software.', { 
          duration: 6000 
        });
      } else {
        const connectedInputs = inputs.filter(d => d.state === 'connected').length;
        const connectedOutputs = outputs.filter(d => d.state === 'connected').length;
        const casioInputCount = inputs.filter(d => 
          d.name.toLowerCase().includes('casio') || 
          d.manufacturer.toLowerCase().includes('casio')
        ).length;
        
        if (casioInputCount > 0) {
          toast.success(`Found ${inputs.length} input(s) and ${outputs.length} output(s) including ${casioInputCount} Casio keyboard(s)!`, { duration: 3000 });
        } else if (connectedInputs + connectedOutputs > 0) {
          toast.success(`Found ${inputs.length} input(s), ${outputs.length} output(s) (${connectedInputs + connectedOutputs} connected)`, { duration: 2000 });
        } else {
          toast.warning(`Found ${inputs.length} input(s), ${outputs.length} output(s) but none are connected. Check device power and cables.`, { duration: 3000 });
        }
      }
      
      // Auto-selection logic
      const connectedInputs = inputs.filter(d => d.state === 'connected');
      const connectedOutputs = outputs.filter(d => d.state === 'connected');
      
      if (connectedInputs.length > 0 && !selectedInputDevice) {
        const casioInput = connectedInputs.find(d => 
          d.name.toLowerCase().includes('casio') || 
          d.manufacturer.toLowerCase().includes('casio')
        );
        
        const selectedInput = casioInput || connectedInputs[0];
        setSelectedInputDevice(selectedInput.id);
        console.log(`🎯 Auto-selected input device: ${selectedInput.name}`);
        
        if (casioInput) {
          toast.success(`Auto-selected Casio input: ${selectedInput.name}`, { duration: 2000 });
        }
      }
      
      if (connectedOutputs.length > 0 && !selectedOutputDevice) {
        const casioOutput = connectedOutputs.find(d => 
          d.name.toLowerCase().includes('casio') || 
          d.manufacturer.toLowerCase().includes('casio')
        );
        
        const selectedOutput = casioOutput || connectedOutputs[0];
        setSelectedOutputDevice(selectedOutput.id);
        console.log(`🎯 Auto-selected output device: ${selectedOutput.name}`);
        
        if (casioOutput) {
          toast.success(`Auto-selected Casio output: ${selectedOutput.name}`, { duration: 2000 });
        }
      }
    } catch (error) {
      console.error('❌ Error updating device list:', error);
      toast.error('Error scanning for MIDI devices - check console for details');
    }
  };

  const connectToInputDevice = (deviceId: string) => {
    if (!midiAccessRef.current) return;
    
    try {
      if (selectedInputDevice) {
        const prevInput = midiAccessRef.current.inputs.get(selectedInputDevice);
        if (prevInput) {
          prevInput.onmidimessage = null;
        }
      }
      
      const input = midiAccessRef.current.inputs.get(deviceId);
      if (input) {
        console.log(`🔌 Connecting to MIDI input device: ${input.name}`);
        
        if (input.state !== 'connected') {
          console.warn(`⚠️ Device "${input.name}" is not in connected state: ${input.state}`);
          toast.warning(`Device "${input.name}" appears ${input.state}. Try refreshing devices or reconnecting USB.`);
        }
        
        input.onmidimessage = handleMidiMessage;
        setSelectedInputDevice(deviceId);
        setInputEnabled(true);
        
        const isUSBMIDI = input.name.toLowerCase().includes('usb') || 
                         input.name.toLowerCase().includes('casio') ||
                         input.name.toLowerCase().includes('midi');
        
        if (isUSBMIDI) {
          toast.success(`🔌 Connected to USB MIDI: ${input.name}. Play a key to test!`, { duration: 3000 });
          console.log(`✅ USB MIDI connection successful. Device ready for input.`);
        } else {
          toast.success(`Connected to input: ${input.name}`);
        }
      } else {
        console.error(`❌ Device with ID ${deviceId} not found in MIDI inputs`);
        toast.error('Device not found. Try refreshing the device list.');
      }
    } catch (error) {
      console.error('❌ Error connecting to input device:', error);
      toast.error('Failed to connect to MIDI input device. Check if device is available and not in use by another application.');
    }
  };

  const connectToOutputDevice = (deviceId: string) => {
    if (!midiAccessRef.current) return;
    
    try {
      const output = midiAccessRef.current.outputs.get(deviceId);
      if (output) {
        console.log(`Connecting to output device: ${output.name}`);
        setSelectedOutputDevice(deviceId);
        setOutputEnabled(true);
        toast.success(`Connected to output: ${output.name}`);
      }
    } catch (error) {
      console.error('Error connecting to output device:', error);
      toast.error('Failed to connect to MIDI output device');
    }
  };

  const handleMidiMessage = (message: WebMidi.MIDIMessageEvent) => {
    const [status, pitch, velocity] = message.data;
    const messageType = status & 0xF0;
    const channel = (status & 0x0F) + 1;
    
    // Show input activity
    setInputActivity(true);
    if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    activityTimeoutRef.current = setTimeout(() => setInputActivity(false), 100);
    
    // Filter by input channel if specified
    if (settings.inputChannel > 0 && channel !== settings.inputChannel) {
      return;
    }
    
    // Handle note on messages
    if (messageType === 144 && velocity > settings.noteVelocityThreshold) {
      const currentTime = Date.now();
      const transposedPitch = Math.max(0, Math.min(127, pitch + settings.transposeInput));
      const pitchClass = transposedPitch % 12;
      const scaledVelocity = Math.round((velocity / 127) * (settings.velocitySensitivity / 100) * 127);
      
      setLastNote({ 
        pitch: pitchClass, 
        velocity: scaledVelocity, 
        channel, 
        timestamp: currentTime 
      });
      
      // Recording logic
      if (isRecording) {
        const noteTime = currentTime - recordingStartTime.current;
        const quantizedTime = settings.quantization > 0 
          ? Math.round(noteTime / settings.quantization) * settings.quantization 
          : noteTime;
        
        const newNote: RecordedNote = {
          pitch: pitchClass,
          timestamp: quantizedTime,
          velocity: scaledVelocity,
          channel
        };
        
        if (settings.recordingMode === 'replace' && recordedNotes.length === 0) {
          setRecordedNotes([newNote]);
        } else {
          setRecordedNotes(prev => [...prev, newNote]);
        }
      }
      
      console.log(`MIDI Note: ${pitch} -> ${pitchClass} (Ch: ${channel}, Vel: ${scaledVelocity})`);
    }
  };

  const startRecording = () => {
    if (!selectedInputDevice || !inputEnabled) {
      toast.error('Please connect to a MIDI input device first');
      return;
    }
    
    setIsRecording(true);
    if (settings.recordingMode === 'replace') {
      setRecordedNotes([]);
    }
    recordingStartTime.current = Date.now();
    toast.success('Recording started! Play notes on your MIDI device.');
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    if (recordedNotes.length === 0) {
      toast.info('No notes recorded');
      return;
    }
    
    const notePitches = recordedNotes.map(note => note.pitch);
    
    console.log('🎵 Stopping MIDI recording. Notes to add to theme:', notePitches);
    
    if (onNotesRecorded) {
      onNotesRecorded(notePitches);
    }
    
    toast.success(`Recording completed! ${recordedNotes.length} notes added to theme.`);
  };

  const clearRecording = () => {
    setRecordedNotes([]);
    setLastNote(null);
    toast.info('Recording cleared');
  };

  const disconnectInput = () => {
    if (!midiAccessRef.current || !selectedInputDevice) return;
    
    try {
      const input = midiAccessRef.current.inputs.get(selectedInputDevice);
      if (input) {
        input.onmidimessage = null;
      }
      
      setSelectedInputDevice(null);
      setInputEnabled(false);
      setIsRecording(false);
      setLastNote(null);
      toast.info('MIDI input disconnected');
    } catch (error) {
      console.error('Error disconnecting input device:', error);
    }
  };

  const disconnectOutput = () => {
    setSelectedOutputDevice(null);
    setOutputEnabled(false);
    toast.info('MIDI output disconnected');
  };

  const getPitchName = (pitch: number): string => {
    const pitchNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    return pitchNames[pitch];
  };

  // Render different states
  if (!midiInitialized) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-3">
          <Keyboard className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="font-medium text-muted-foreground">MIDI I/O System</h3>
          <p className="text-sm text-muted-foreground">
            Professional MIDI input/output with USB keyboard support and theme integration.
          </p>
          
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 rounded-lg">
            <div className="font-medium text-green-900 dark:text-green-100 text-sm mb-1 flex items-center gap-2">
              ✅ System Status Check
            </div>
            <div className="text-green-800 dark:text-green-200 text-xs">
              <div>• <strong>Browser:</strong> Chrome {navigator.userAgent.match(/Chrome\/([0-9.]+)/)?.[1]} ✅ (Perfect for MIDI)</div>
              <div>• <strong>MIDI API:</strong> {navigator.requestMIDIAccess ? 'Supported' : 'Not Supported'} ✅</div>
              <div>• <strong>Status:</strong> Ready to initialize - click button below to grant MIDI access</div>
            </div>
          </div>
          
          <Button
            variant="default"
            size="lg"
            onClick={initializeMidi}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-4 text-base shadow-lg"
          >
            <Keyboard className="w-5 h-5" />
            🚀 Initialize MIDI System
          </Button>
          
          <div className="text-xs text-muted-foreground mt-2">
            This will request browser permission to access MIDI devices
          </div>
        </div>
      </div>
    );
  }

  if (!isSupported && midiInitialized) {
    return (
      <div className="text-center space-y-4">
        <AlertTriangle className="w-12 h-12 mx-auto text-amber-500" />
        <h3 className="font-medium text-muted-foreground">MIDI System Restricted</h3>
        
        {/* Browser Security Restriction */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-lg text-left">
          <div className="font-medium text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
            🔒 Browser Security Restriction
          </div>
          <div className="text-amber-800 dark:text-amber-200 text-sm space-y-2">
            <p>MIDI access is disabled by browser security policy in this environment. This is common in embedded applications and web-based development tools.</p>
          </div>
        </div>

        {/* Test MIDI Callback Button for Development */}
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4 rounded-lg">
          <div className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
            🧪 Test MIDI Integration (Development Only)
          </div>
          <div className="text-green-800 dark:text-green-200 text-sm mb-3">
            Since MIDI is restricted, use this button to test the note addition functionality:
          </div>
          <Button
            variant="default"
            onClick={() => {
              // Simulate MIDI input for testing
              const testNotes = [0, 2, 4, 5, 7]; // C major scale portion (C, D, E, F, G)
              const noteNames = ['C', 'D', 'E', 'F', 'G'];
              
              console.log('🧪 MIDI Test Button Clicked!');
              console.log('🧪 Test notes to add:', testNotes, '→', noteNames);
              console.log('🔗 onNotesRecorded callback available:', !!onNotesRecorded);
              console.log('🔗 Callback function:', onNotesRecorded);
              
              if (onNotesRecorded) {
                console.log('✅ Calling onNotesRecorded with notes:', testNotes);
                onNotesRecorded(testNotes);
                toast.success(`🧪 Test: Added ${testNotes.length} notes (${noteNames.join(', ')}) to theme!`, {
                  duration: 4000
                });
                console.log('✅ onNotesRecorded call completed');
              } else {
                console.error('❌ MIDI callback not connected - this should not happen');
                toast.error('MIDI callback not connected - check console for details');
              }
            }}
            className="gap-2 w-full bg-green-600 hover:bg-green-700"
          >
            <Music className="w-4 h-4" />
            🧪 Test Add Notes (C,D,E,F,G) to Theme
          </Button>
          <div className="text-xs text-green-700 dark:text-green-300 mt-2">
            This simulates adding notes [C, D, E, F, G] to your current theme
          </div>
        </div>

        {/* Solutions */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg text-left">
          <div className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            🚀 Solutions for Real MIDI Access
          </div>
          <div className="text-blue-800 dark:text-blue-200 text-sm space-y-3">
            <div>
              <div className="font-medium">✅ Option 1: Deploy Your App (Recommended)</div>
              <div className="text-xs opacity-90 mt-1 space-y-1">
                <div>• Export from Figma and deploy to Netlify, Vercel, or GitHub Pages</div>
                <div>• MIDI will work perfectly in the deployed version</div>
                <div>• Your Casio keyboard will be detected automatically</div>
              </div>
            </div>
            
            <div>
              <div className="font-medium">⚡ Option 2: Local Development</div>
              <div className="text-xs opacity-90 mt-1 space-y-1">
                <div>• Download project files and run: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">npm install && npm run dev</code></div>
                <div>• Open <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">http://localhost:5173</code> in Chrome</div>
                <div>• Full MIDI support with your USB keyboard</div>
              </div>
            </div>
            
            <div>
              <div className="font-medium">🎹 Alternative: Virtual Piano</div>
              <div className="text-xs opacity-90 mt-1">
                • Use the on-screen piano keyboard below for now
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main MIDI interface (when supported and initialized)
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="font-medium text-green-600 dark:text-green-400">🎹 MIDI System Active</h3>
        <p className="text-sm text-muted-foreground">Ready for device connection and theme recording</p>
      </div>

      {/* Device Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Circle className={`w-3 h-3 ${inputEnabled ? 'text-green-500 fill-green-500' : 'text-gray-400'}`} />
            Input Devices ({inputDevices.length})
          </h4>
          {inputDevices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No input devices found</p>
          ) : (
            <div className="space-y-2">
              {inputDevices.map(device => (
                <div key={device.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{device.name}</div>
                    <div className="text-xs text-muted-foreground">{device.manufacturer} • {device.state}</div>
                  </div>
                  <Button
                    size="sm"
                    variant={selectedInputDevice === device.id ? "default" : "outline"}
                    onClick={() => connectToInputDevice(device.id)}
                  >
                    {selectedInputDevice === device.id ? 'Connected' : 'Connect'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Circle className={`w-3 h-3 ${outputEnabled ? 'text-green-500 fill-green-500' : 'text-gray-400'}`} />
            Output Devices ({outputDevices.length})
          </h4>
          {outputDevices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No output devices found</p>
          ) : (
            <div className="space-y-2">
              {outputDevices.map(device => (
                <div key={device.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{device.name}</div>
                    <div className="text-xs text-muted-foreground">{device.manufacturer} • {device.state}</div>
                  </div>
                  <Button
                    size="sm"
                    variant={selectedOutputDevice === device.id ? "default" : "outline"}
                    onClick={() => connectToOutputDevice(device.id)}
                  >
                    {selectedOutputDevice === device.id ? 'Connected' : 'Available'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recording Controls */}
      {inputEnabled && (
        <Card className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Music className="w-4 h-4" />
            MIDI Recording → Theme Integration
          </h4>
          
          <div className="flex items-center gap-3 mb-4">
            <Button
              onClick={startRecording}
              disabled={isRecording}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              {isRecording ? 'Recording...' : 'Start Recording'}
            </Button>
            
            <Button
              onClick={stopRecording}
              disabled={!isRecording}
              variant="outline"
              className="gap-2"
            >
              <Pause className="w-4 h-4" />
              Stop & Add to Theme
            </Button>

            {recordedNotes.length > 0 && (
              <Button
                onClick={clearRecording}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Clear
              </Button>
            )}

            {recordedNotes.length > 0 && (
              <Badge variant="secondary">
                {recordedNotes.length} notes recorded
              </Badge>
            )}
          </div>

          {/* Recording Status */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg text-sm">
            <div className="text-blue-800 dark:text-blue-200">
              <strong>📝 How it works:</strong> Record MIDI notes by playing your keyboard, then click "Stop & Add to Theme" to append the recorded notes to your current theme. Notes are automatically converted to pitch classes (0-11) for modal composition.
            </div>
          </div>

          {/* Last Note Display */}
          {lastNote && (
            <div className="mt-3 text-sm text-muted-foreground">
              Last note: {getPitchName(lastNote.pitch)} (velocity: {lastNote.velocity}, channel: {lastNote.channel})
            </div>
          )}
        </Card>
      )}

      {/* Settings */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          MIDI Settings
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Input Channel</Label>
            <Select
              value={settings.inputChannel.toString()}
              onValueChange={(value) => setSettings(prev => ({ ...prev, inputChannel: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Channels</SelectItem>
                {Array.from({ length: 16 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Channel {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Velocity Sensitivity (%)</Label>
            <Slider
              value={[settings.velocitySensitivity]}
              onValueChange={(value) => setSettings(prev => ({ ...prev, velocitySensitivity: value[0] }))}
              min={10}
              max={200}
              step={5}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">{settings.velocitySensitivity}%</div>
          </div>
        </div>
      </Card>

      {/* Help */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
        <div className="text-blue-800 dark:text-blue-200 text-sm">
          <strong>🎹 How to use:</strong> Connect your Casio keyboard, start recording, play notes, then stop recording to add them to your composition theme. Recorded notes will be appended to your existing theme for progressive building.
        </div>
      </div>
    </div>
  );
}