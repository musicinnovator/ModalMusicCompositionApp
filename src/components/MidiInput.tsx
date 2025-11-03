import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Mic, MicOff, Circle, Square, RotateCcw, Keyboard } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface MidiInputProps {
  onNotesRecorded?: (notes: number[]) => void;
  selectedInstrument?: string;
}

interface MidiDevice {
  id: string;
  name: string;
  manufacturer: string;
  state: string;
}

interface RecordedNote {
  pitch: number;
  timestamp: number;
  velocity: number;
}

export function MidiInput({ onNotesRecorded, selectedInstrument = 'piano' }: MidiInputProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [midiInitialized, setMidiInitialized] = useState(false);
  const [devices, setDevices] = useState<MidiDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<RecordedNote[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [lastNote, setLastNote] = useState<{ pitch: number; timestamp: number } | null>(null);
  
  const midiAccessRef = useRef<WebMidi.MIDIAccess | null>(null);
  const recordingStartTime = useRef<number>(0);

  useEffect(() => {
    // Only check MIDI support, don't attempt access immediately
    const hasMidiSupport = !!navigator.requestMIDIAccess;
    console.log('🔍 MIDI Support Check:', hasMidiSupport ? 'Supported' : 'Not Supported');
    setIsSupported(hasMidiSupport);
    
    // Check if we already have MIDI access from a previous session
    if (hasMidiSupport) {
      console.log('🔄 Checking for existing MIDI access...');
      // Don't auto-initialize - wait for user action
      console.log('⏳ Waiting for user to click "Enable MIDI Input"');
    }
    
    return () => {
      // Cleanup MIDI connections
      if (midiAccessRef.current) {
        for (const input of midiAccessRef.current.inputs.values()) {
          input.onmidimessage = null;
        }
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
      console.log('🔍 User Agent:', navigator.userAgent);
      
      // Request MIDI access with comprehensive options for maximum compatibility
      const midiAccess = await navigator.requestMIDIAccess({ 
        sysex: false, 
        software: true  // Essential for virtual MIDI devices like Muse
      });
      midiAccessRef.current = midiAccess;
      
      console.log('🎹 MIDI access granted! Setting up listeners...');
      console.log('📊 MIDI Access Details:', {
        inputs: midiAccess.inputs.size,
        outputs: midiAccess.outputs.size,
        sysexEnabled: midiAccess.sysexEnabled
      });
      
      // Set up device change listeners immediately
      midiAccess.onstatechange = handleStateChange;
      
      // Force immediate device scan - some systems need this
      console.log('🔍 Forcing immediate device scan...');
      setTimeout(() => {
        updateDeviceList();
        // Double-check after a short delay to catch devices that take time to enumerate
        setTimeout(updateDeviceList, 500);
      }, 100);
      
      toast.success('MIDI access granted! Scanning for devices...');
      return true;
    } catch (error) {
      console.error('❌ MIDI access failed:', error instanceof Error ? error.message : 'Unknown error');
      setIsSupported(false);
      setMidiInitialized(true); // Mark as initialized so we show the proper error state
      
      if (error instanceof Error && error.message.includes('permissions policy')) {
        console.log('🚫 MIDI blocked by browser permissions policy');
        toast.info('MIDI access is disabled in this environment. Use the piano keyboard instead!');
      } else if (error instanceof Error && error.message.includes('SecurityError')) {
        console.log('🚫 MIDI access denied by user');
        toast.info('MIDI access denied. Use the piano keyboard below instead.');
      } else if (error instanceof Error && error.message.includes('NotSupportedError')) {
        console.log('🚫 MIDI not supported');
        toast.error('MIDI is not supported in this browser. Use Chrome, Edge, or Firefox.');
      } else {
        console.log('🚫 MIDI not available');
        toast.error('MIDI is not available. Use the piano keyboard below instead.');
      }
      return false;
    }
  };

  const initializeMidi = async () => {
    console.log('🚀 Initializing MIDI access...');
    console.log(`📊 Current state: isSupported=${isSupported}, midiInitialized=${midiInitialized}, hasAccess=${!!midiAccessRef.current}`);
    
    setMidiInitialized(true);
    const success = await requestMidiAccessSafely();
    if (success) {
      setIsEnabled(false); // Start disconnected, user must manually connect
      console.log('✅ MIDI initialization complete');
      // Immediately scan for devices
      setTimeout(updateDeviceList, 100);
    } else {
      console.log('❌ MIDI initialization failed');
      setMidiInitialized(false); // Reset on failure
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
      console.log('❌ No MIDI access available. Click "Enable MIDI Input" first.');
      toast.error('MIDI access not available. Click "Enable MIDI Input" first.');
      return;
    }
    
    try {
      const deviceList: MidiDevice[] = [];
      console.log(`🎹 Scanning MIDI inputs... (Total available: ${midiAccessRef.current.inputs.size})`);
      console.log(`📤 Scanning MIDI outputs... (Total available: ${midiAccessRef.current.outputs.size})`);
      
      // Enhanced device detection - include all devices and log comprehensive details
      for (const input of midiAccessRef.current.inputs.values()) {
        const deviceName = input.name || 'Unknown Device';
        const manufacturer = input.manufacturer || 'Unknown';
        
        deviceList.push({
          id: input.id,
          name: deviceName,
          manufacturer: manufacturer,
          state: input.state
        });
        
        // Enhanced logging for better debugging
        const isCasio = deviceName.toLowerCase().includes('casio') || manufacturer.toLowerCase().includes('casio');
        const isMuse = deviceName.toLowerCase().includes('muse') || manufacturer.toLowerCase().includes('muse');
        const isUSBMidi = deviceName.toLowerCase().includes('usb') || deviceName.toLowerCase().includes('midi');
        
        let deviceIcon = '🎵';
        if (isCasio) deviceIcon = '🎹';
        else if (isMuse) deviceIcon = '🎼';
        else if (isUSBMidi) deviceIcon = '🔌';
        
        console.log(`${deviceIcon} MIDI Input: "${deviceName}" (${manufacturer})`);
        console.log(`   📋 Details: State=${input.state}, Connection=${input.connection}, Type=${input.type}, ID=${input.id}`);
        
        if (isCasio) {
          console.log(`🎹 *** CASIO KEYBOARD DETECTED: ${deviceName} ***`);
          toast.success(`Casio keyboard detected: ${deviceName}`);
        }
        if (isMuse) {
          console.log(`✨ Found Muse virtual MIDI device: ${deviceName}`);
        }
      }
      
      // Also log output devices for completeness
      for (const output of midiAccessRef.current.outputs.values()) {
        const deviceName = output.name || 'Unknown Output';
        const manufacturer = output.manufacturer || 'Unknown';
        console.log(`📤 MIDI Output: "${deviceName}" (${manufacturer}) - State: ${output.state}`);
      }
      
      setDevices(deviceList);
      console.log(`✅ Device scan complete. Found ${deviceList.length} input devices.`);
      
      if (deviceList.length === 0) {
        console.log('⚠️ No MIDI devices found.');
        console.log('🔧 Troubleshooting tips:');
        console.log('   1. Make sure your Casio is connected via USB and powered on');
        console.log('   2. Check if Windows detects the device (Device Manager)');
        console.log('   3. Try refreshing this page after connecting the device');
        console.log('   4. Check browser console for any errors');
        toast.info('No MIDI devices found. Check connection and try refreshing devices.');
      } else {
        const connectedCount = deviceList.filter(d => d.state === 'connected').length;
        const casioCount = deviceList.filter(d => 
          d.name.toLowerCase().includes('casio') || 
          d.manufacturer.toLowerCase().includes('casio')
        ).length;
        
        console.log(`📊 Device summary: ${deviceList.length} total, ${connectedCount} connected, ${casioCount} Casio`);
        
        if (casioCount > 0) {
          toast.success(`Found ${deviceList.length} MIDI device(s) including ${casioCount} Casio keyboard(s)!`);
        } else {
          toast.success(`Found ${deviceList.length} MIDI device(s), ${connectedCount} connected`);
        }
      }
      
      // Auto-select first connected device if none selected, prioritizing Casio devices
      const connectedDevices = deviceList.filter(d => d.state === 'connected');
      if (connectedDevices.length > 0 && !selectedDevice) {
        // Prioritize Casio devices
        const casioDevice = connectedDevices.find(d => 
          d.name.toLowerCase().includes('casio') || 
          d.manufacturer.toLowerCase().includes('casio')
        );
        
        const selectedDevice = casioDevice || connectedDevices[0];
        setSelectedDevice(selectedDevice.id);
        console.log(`🎯 Auto-selected device: ${selectedDevice.name}`);
        
        if (casioDevice) {
          toast.success(`Auto-selected Casio device: ${selectedDevice.name}`);
        }
      }
    } catch (error) {
      console.error('❌ Error updating device list:', error);
      console.error('❌ Full error details:', error);
      toast.error('Error scanning for MIDI devices - check console for details');
    }
  };

  const connectToDevice = (deviceId: string) => {
    if (!midiAccessRef.current) return;
    
    try {
      // Disconnect from previous device
      if (selectedDevice) {
        const prevInput = midiAccessRef.current.inputs.get(selectedDevice);
        if (prevInput) {
          prevInput.onmidimessage = null;
        }
      }
      
      // Connect to new device
      const input = midiAccessRef.current.inputs.get(deviceId);
      if (input) {
        console.log(`Connecting to device: ${input.name} (State: ${input.state})`);
        
        input.onmidimessage = handleMidiMessage;
        setSelectedDevice(deviceId);
        setIsEnabled(true);
        toast.success(`Connected to ${input.name || 'MIDI Device'}`);
        console.log(`Successfully connected to: ${input.name}`);
      } else {
        toast.error('Device not found');
      }
    } catch (error) {
      console.error('Error connecting to device:', error);
      toast.error('Failed to connect to MIDI device');
    }
  };

  const handleMidiMessage = (message: WebMidi.MIDIMessageEvent) => {
    const [status, pitch, velocity] = message.data;
    const messageType = status & 0xF0;
    
    // Handle note on messages (144 = 0x90)
    if (messageType === 144 && velocity > 0) {
      const currentTime = Date.now();
      const pitchClass = pitch % 12; // Convert to pitch class (0-11)
      
      setLastNote({ pitch: pitchClass, timestamp: currentTime });
      
      // If recording, add to recorded notes
      if (isRecording) {
        const noteTime = currentTime - recordingStartTime.current;
        setRecordedNotes(prev => [...prev, {
          pitch: pitchClass,
          timestamp: noteTime,
          velocity
        }]);
      }
      
      console.log(`MIDI Note: ${pitch} (${pitchClass}) velocity: ${velocity}`);
    }
  };

  const startRecording = () => {
    if (!selectedDevice || !isEnabled) {
      toast.error('Please connect to a MIDI device first');
      return;
    }
    
    setIsRecording(true);
    setRecordedNotes([]);
    recordingStartTime.current = Date.now();
    toast.success('Recording started! Play notes on your MIDI device.');
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    if (recordedNotes.length === 0) {
      toast.info('No notes recorded');
      return;
    }
    
    // Extract just the pitch classes in order
    const notePitches = recordedNotes.map(note => note.pitch);
    
    // Call the callback with recorded notes
    if (onNotesRecorded) {
      onNotesRecorded(notePitches);
    }
    
    toast.success(`Recording completed! ${recordedNotes.length} notes recorded.`);
  };

  const clearRecording = () => {
    setRecordedNotes([]);
    setLastNote(null);
    toast.info('Recording cleared');
  };

  const disconnectDevice = () => {
    if (!midiAccessRef.current || !selectedDevice) return;
    
    try {
      const input = midiAccessRef.current.inputs.get(selectedDevice);
      if (input) {
        input.onmidimessage = null;
      }
      
      setSelectedDevice(null);
      setIsEnabled(false);
      setIsRecording(false);
      setLastNote(null);
      toast.info('MIDI device disconnected');
    } catch (error) {
      console.error('Error disconnecting device:', error);
    }
  };

  const getPitchName = (pitch: number): string => {
    const pitchNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    return pitchNames[pitch];
  };

  if (!isSupported && !midiInitialized) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-3">
          <Keyboard className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="font-medium text-muted-foreground">MIDI Input</h3>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              Connect your Casio USB-MIDI device to record notes directly.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg text-left">
              <div className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                📋 Setup Steps (DAW Users):
              </div>
              <div className="text-blue-800 dark:text-blue-200 text-xs space-y-1">
                <div><strong>If using Muse/Virtual MIDI:</strong></div>
                <div>1. Open your DAW (Finale/Digital Performer/Reason)</div>
                <div>2. Ensure Muse MIDI routing is active</div>
                <div>3. Click "Enable MIDI Input" below</div>
                <div>4. Look for "Muse Input/Output/Through" devices</div>
                <div className="pt-1"><strong>Direct hardware connection:</strong></div>
                <div>1. Connect Casio via USB and power on</div>
                <div>2. Click "Enable MIDI Input" below</div>
                <div>3. Check console (F12) for device detection</div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={initializeMidi}
              className="gap-2"
            >
              <Keyboard className="w-4 h-4" />
              Enable MIDI Input
            </Button>
            <div className="text-xs bg-muted/50 p-3 rounded-lg">
              <strong>Alternative input methods:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Use the on-screen piano keyboard below</li>
                <li>Manually compose notes using the Theme Composer</li>
                <li>Generate themes using the Stability Controls</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!isSupported && midiInitialized) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-3">
          <Keyboard className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="font-medium text-muted-foreground">MIDI Input Restricted</h3>
          <div className="text-sm text-muted-foreground space-y-3">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 rounded-lg text-left">
              <div className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                🔒 Browser Security Restriction
              </div>
              <div className="text-amber-800 dark:text-amber-200 text-xs space-y-1">
                <div>MIDI access is disabled by browser security policy in this environment.</div>
                <div>This is common in embedded applications and web-based development tools.</div>
                <div>Your Casio device works fine - this is just a browser limitation.</div>
              </div>
            </div>
            <div className="text-xs bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 rounded-lg">
              <strong className="text-green-900 dark:text-green-100">🎹 Excellent alternatives available:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1 text-green-800 dark:text-green-200">
                <li><strong>Piano Keyboard:</strong> Click the virtual keys below - includes audio feedback</li>
                <li><strong>Theme Composer:</strong> Use quick-add buttons or dropdown selection</li>
                <li><strong>Auto-Generate:</strong> Create themes with stability controls</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Keyboard className="w-5 h-5" />
          <h3 className="font-medium">MIDI Input</h3>
          <Badge variant={isEnabled ? 'default' : 'outline'}>
            {isEnabled ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <Badge variant="destructive" className="gap-1 animate-pulse">
              <Circle className="w-2 h-2 fill-current" />
              Recording
            </Badge>
          )}
        </div>
      </div>

      {/* Device Selection */}
      {devices.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Available MIDI Devices</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={updateDeviceList}
              className="text-xs gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Refresh
            </Button>
          </div>
          <div className="space-y-2">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm flex items-center gap-2">
                    {device.name}
                    {(device.name.toLowerCase().includes('muse') || device.manufacturer.toLowerCase().includes('muse')) && (
                      <Badge variant="secondary" className="text-xs">
                        🎼 Virtual MIDI
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {device.manufacturer}
                    <Badge 
                      variant={device.state === 'connected' ? 'default' : 'outline'} 
                      className="ml-2 text-xs"
                    >
                      {device.state}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant={selectedDevice === device.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => selectedDevice === device.id ? disconnectDevice() : connectToDevice(device.id)}
                  disabled={device.state !== 'connected'}
                >
                  {selectedDevice === device.id ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <Keyboard className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No MIDI devices detected</p>
          <p className="text-xs">Connect a MIDI keyboard or controller and click refresh</p>
          <Button
            variant="outline"
            size="sm"
            onClick={updateDeviceList}
            className="mt-2 gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Refresh Devices
          </Button>
        </div>
      )}

      {/* Recording Controls */}
      {isEnabled && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label className="text-sm font-medium">Recording Controls</Label>
            <div className="flex items-center gap-2">
              <Button
                variant={isRecording ? "destructive" : "default"}
                size="sm"
                onClick={isRecording ? stopRecording : startRecording}
                className="gap-2"
              >
                {isRecording ? (
                  <>
                    <Square className="w-4 h-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4" />
                    Start Recording
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearRecording}
                disabled={recordedNotes.length === 0}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Live Note Display */}
      {isEnabled && lastNote && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Last Note Played</div>
          <div className="font-medium">{getPitchName(lastNote.pitch)}</div>
        </div>
      )}

      {/* Recorded Notes Display */}
      {recordedNotes.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Recorded Notes ({recordedNotes.length})
          </Label>
          <div className="p-3 bg-muted/50 rounded-lg max-h-32 overflow-y-auto">
            <div className="flex flex-wrap gap-1">
              {recordedNotes.map((note, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {getPitchName(note.pitch)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-2">
        <div>
          {isEnabled 
            ? 'Play notes on your MIDI device to test. Recorded notes will be added to your theme.'
            : 'Connect a MIDI device to start recording notes.'
          }
        </div>
        

      </div>
    </Card>
  );
}