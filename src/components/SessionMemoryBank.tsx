import { useState, useCallback, useEffect, useRef } from 'react';
import { Theme, Mode, KeySignature, BachLikeVariables, BachVariableName, melodyElementToString, midiNoteToNoteName } from '../types/musical';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Save, Trash2, Download, Upload, Clock, Archive, Database, FileJson, FileAudio } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { MidiFileParser, convertMidiToTheme, convertMidiToParts, MidiParseError } from '../lib/midi-parser';

interface SessionMemoryItem {
  id: string;
  name: string;
  timestamp: number;
  data: {
    theme: Theme;
    selectedMode?: Mode | null;
    selectedKeySignature?: KeySignature | null;
    bachVariables?: BachLikeVariables;
    counterpoints?: Theme[];
    description?: string;
  };
}

const BACH_VARIABLE_NAMES: { value: BachVariableName; label: string }[] = [
  { value: 'cantusFirmus', label: 'Cantus Firmus (CF)' },
  { value: 'floridCounterpoint1', label: 'Florid Counterpoint 1 (FCP1)' },
  { value: 'floridCounterpoint2', label: 'Florid Counterpoint 2 (FCP2)' },
  { value: 'cantusFirmusFragment1', label: 'CF Fragment 1 (CFF1)' },
  { value: 'cantusFirmusFragment2', label: 'CF Fragment 2 (CFF2)' },
  { value: 'floridCounterpointFrag1', label: 'FCP Fragment 1 (FCPF1)' },
  { value: 'floridCounterpointFrag2', label: 'FCP Fragment 2 (FCPF2)' },
  { value: 'countersubject1', label: 'Countersubject 1 (CS1)' },
  { value: 'countersubject2', label: 'Countersubject 2 (CS2)' }
];

interface SessionMemoryBankProps {
  currentTheme: Theme;
  currentMode?: Mode | null;
  currentKeySignature?: KeySignature | null;
  currentBachVariables?: BachLikeVariables;
  currentCounterpoints?: Theme[];
  onLoadMemoryItem: (item: SessionMemoryItem) => void;
  onBachVariablesChange?: (variables: BachLikeVariables) => void;
}

export function SessionMemoryBank({
  currentTheme,
  currentMode,
  currentKeySignature,
  currentBachVariables,
  currentCounterpoints,
  onLoadMemoryItem,
  onBachVariablesChange
}: SessionMemoryBankProps) {
  const [memoryItems, setMemoryItems] = useState<SessionMemoryItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [selectedTab, setSelectedTab] = useState<'session' | 'export'>('session');
  const [autoLoadOnUpload, setAutoLoadOnUpload] = useState(true); // Auto-load uploaded files to theme
  const [loadTarget, setLoadTarget] = useState<'traditional' | BachVariableName>('traditional'); // Target for auto-load
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const midiFileInputRef = useRef<HTMLInputElement>(null);

  // Clear session memory on component unmount (session end)
  useEffect(() => {
    return () => {
      console.log('🗑️ Session ended - clearing temporary memory bank');
      setMemoryItems([]);
    };
  }, []);

  // Monitor memory usage and limit items
  useEffect(() => {
    if (memoryItems.length > 10) {
      setMemoryItems(prev => prev.slice(0, 10));
      toast.warning('Memory bank limited to 10 items - oldest items removed');
    }
  }, [memoryItems.length]);

  const saveCurrentToMemory = useCallback(() => {
    try {
      if (!itemName.trim()) {
        toast.error('Please enter a name for this memory item');
        return;
      }

      if (currentTheme.length === 0) {
        toast.error('Cannot save empty theme to memory');
        return;
      }

      const newItem: SessionMemoryItem = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: itemName.trim(),
        timestamp: Date.now(),
        data: {
          theme: [...currentTheme],
          selectedMode: currentMode ? { ...currentMode } : null,
          selectedKeySignature: currentKeySignature ? { ...currentKeySignature } : null,
          bachVariables: currentBachVariables ? { ...currentBachVariables } : undefined,
          counterpoints: currentCounterpoints ? [...currentCounterpoints] : undefined,
          description: itemDescription.trim() || undefined
        }
      };

      setMemoryItems(prev => [newItem, ...prev]);
      setItemName('');
      setItemDescription('');

      const themePreview = currentTheme.slice(0, 3).map(melodyElementToString).join(', ');
      toast.success(`"${newItem.name}" saved to session memory: ${themePreview}${currentTheme.length > 3 ? '...' : ''}`);

    } catch (error) {
      console.error('Error saving to session memory:', error);
      toast.error('Failed to save to session memory');
    }
  }, [itemName, itemDescription, currentTheme, currentMode, currentKeySignature, currentBachVariables, currentCounterpoints]);

  const loadFromMemory = useCallback((item: SessionMemoryItem) => {
    try {
      onLoadMemoryItem(item);
      
      const themePreview = item.data.theme.slice(0, 3).map(melodyElementToString).join(', ');
      toast.success(`Loaded "${item.name}": ${themePreview}${item.data.theme.length > 3 ? '...' : ''}`);
    } catch (error) {
      console.error('Error loading from session memory:', error);
      toast.error('Failed to load from session memory');
    }
  }, [onLoadMemoryItem]);

  const deleteFromMemory = useCallback((itemId: string) => {
    try {
      const item = memoryItems.find(item => item.id === itemId);
      setMemoryItems(prev => prev.filter(item => item.id !== itemId));
      
      if (item) {
        toast.success(`"${item.name}" deleted from session memory`);
      }
    } catch (error) {
      console.error('Error deleting from session memory:', error);
      toast.error('Failed to delete from session memory');
    }
  }, [memoryItems]);

  const clearAllMemory = useCallback(() => {
    try {
      const count = memoryItems.length;
      setMemoryItems([]);
      toast.success(`Cleared ${count} items from session memory`);
    } catch (error) {
      console.error('Error clearing session memory:', error);
      toast.error('Failed to clear session memory');
    }
  }, [memoryItems.length]);

  const exportToFile = useCallback((item: SessionMemoryItem) => {
    try {
      const exportData = {
        ...item,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `fugue-memory-${item.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`"${item.name}" exported to file for permanent storage`);
    } catch (error) {
      console.error('Error exporting memory item:', error);
      toast.error('Failed to export memory item');
    }
  }, []);

  const importFromFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      // Convert FileList to Array for processing
      const fileArray = Array.from(files);
      let successCount = 0;
      let errorCount = 0;

      // Process each file
      fileArray.forEach((file, fileIndex) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const importedData = JSON.parse(content) as SessionMemoryItem;
            
            // Validate the imported data structure
            if (!importedData.id || !importedData.name || !importedData.data || !importedData.data.theme) {
              throw new Error('Invalid file format');
            }

            // Generate new ID for imported item to avoid conflicts
            const importedItem: SessionMemoryItem = {
              ...importedData,
              id: `imported_${Date.now()}_${fileIndex}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now() // Update timestamp to current time
            };

            setMemoryItems(prev => [importedItem, ...prev]);
            successCount++;
            
            // AUTO-LOAD LOGIC WITH TARGET ROUTING - Only for the first file
            if (fileIndex === 0 && autoLoadOnUpload && importedItem.data.theme) {
              const preview = importedItem.data.theme.slice(0, 3).map(melodyElementToString).join(', ');
              
              if (loadTarget === 'traditional') {
                // Load to Traditional Theme
                onLoadMemoryItem(importedItem);
                toast.success(`JSON loaded to Traditional Theme: ${preview}${importedItem.data.theme.length > 3 ? '...' : ''}`);
              } else if (loadTarget !== 'traditional' && onBachVariablesChange && currentBachVariables) {
                // Load to Bach Variable
                const melody = importedItem.data.theme.slice(0, 32); // Limit to 32 notes
                const updatedVariables = {
                  ...currentBachVariables,
                  [loadTarget]: melody
                };
                onBachVariablesChange(updatedVariables);
                
                const targetLabel = BACH_VARIABLE_NAMES.find(v => v.value === loadTarget)?.label || loadTarget;
                toast.success(`JSON loaded to ${targetLabel}: ${preview}${melody.length > 3 ? '...' : ''} (${melody.length} notes)`);
            } else {
              toast.success(`"${importedItem.name}" imported to session memory`);
            }
          } else {
            toast.success(`"${importedItem.name}" imported to session memory`);
          }
        } catch (parseError) {
          console.error('Error parsing imported file:', parseError);
          toast.error('Invalid file format - cannot import');
        }
      };
      
      reader.readAsText(file);
    });
    
    // Reset the input
    if (jsonFileInputRef.current) {
      jsonFileInputRef.current.value = '';
    }
  } catch (error) {
      console.error('Error importing memory item:', error);
      toast.error('Failed to import memory item');
    }
  }, [autoLoadOnUpload, loadTarget, onLoadMemoryItem, onBachVariablesChange, currentBachVariables]);

  const importFromMidiFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith('.mid') && !file.name.endsWith('.midi')) {
        toast.error('Please upload a .mid or .midi file');
        return;
      }

      const arrayBuffer = await file.arrayBuffer();

      try {
        const parser = new MidiFileParser(arrayBuffer);
        const midiInfo = parser.parse();

        // Use the first track with notes
        let theme: number[] | null = null;
        let trackName = '';

        for (let i = 0; i < midiInfo.tracks.length; i++) {
          if (midiInfo.tracks[i].notes.length > 0) {
            theme = convertMidiToTheme(midiInfo, i);
            trackName = midiInfo.tracks[i].name || `Track ${i + 1}`;
            break;
          }
        }

        if (!theme || theme.length === 0) {
          toast.error('No usable melody data found in MIDI file');
          return;
        }

        // Limit theme length
        const limitedTheme = theme.slice(0, 32);

        const importedItem: SessionMemoryItem = {
          id: `midi_import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name.replace(/\.(mid|midi)$/, ''),
          timestamp: Date.now(),
          data: {
            theme: limitedTheme,
            selectedMode: currentMode,
            selectedKeySignature: currentKeySignature,
            description: `Imported from MIDI: ${trackName}`
          }
        };

        setMemoryItems(prev => [importedItem, ...prev]);

        const preview = limitedTheme.slice(0, 3).map(note => midiNoteToNoteName(note)).join(', ');
        
        // Auto-load to theme if enabled
        if (autoLoadOnUpload) {
          if (loadTarget === 'traditional') {
            onLoadMemoryItem(importedItem);
            toast.success(`MIDI loaded to Traditional Theme: ${preview}${limitedTheme.length > 3 ? '...' : ''} (${limitedTheme.length} notes)`);
          } else if (loadTarget !== 'traditional' && onBachVariablesChange && currentBachVariables) {
            // Load to Bach Variable
            const updatedVariables = {
              ...currentBachVariables,
              [loadTarget]: limitedTheme
            };
            onBachVariablesChange(updatedVariables);
            
            const targetLabel = BACH_VARIABLE_NAMES.find(v => v.value === loadTarget)?.label || loadTarget;
            toast.success(`MIDI loaded to ${targetLabel}: ${preview}${limitedTheme.length > 3 ? '...' : ''} (${limitedTheme.length} notes)`);
          } else {
            toast.success(`MIDI imported to memory: ${preview}${limitedTheme.length > 3 ? '...' : ''} (${limitedTheme.length} notes)`);
          }
        } else {
          toast.success(`MIDI imported to memory: ${preview}${limitedTheme.length > 3 ? '...' : ''} (${limitedTheme.length} notes)`);
        }

        if (limitedTheme.length < theme.length) {
          toast.warning(`Theme trimmed to 32 notes for memory safety`);
        }

      } catch (parseError) {
        console.error('MIDI parsing error:', parseError);
        if (parseError instanceof MidiParseError) {
          toast.error(`MIDI parsing failed: ${parseError.message}`);
        } else {
          toast.error('Failed to parse MIDI file - may be corrupted or unsupported format');
        }
      }

      // Reset file input
      if (midiFileInputRef.current) {
        midiFileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error importing MIDI file:', error);
      toast.error('Failed to import MIDI file');
    }
  }, [currentMode, currentKeySignature, autoLoadOnUpload, loadTarget, onLoadMemoryItem, onBachVariablesChange, currentBachVariables]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getMemoryUsage = () => {
    const totalNotes = memoryItems.reduce((sum, item) => {
      let count = item.data.theme.length;
      if (item.data.bachVariables) {
        count += Object.values(item.data.bachVariables).reduce((sum, melody) => sum + melody.length, 0);
      }
      if (item.data.counterpoints) {
        count += item.data.counterpoints.reduce((sum, cp) => sum + cp.length, 0);
      }
      return sum + count;
    }, 0);
    
    return { items: memoryItems.length, totalNotes, memoryPressure: totalNotes > 500 };
  };

  const memoryUsage = getMemoryUsage();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          <h3>Session Memory Bank</h3>
          <Badge variant="outline" className="text-xs">
            Temporary Storage
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={memoryUsage.memoryPressure ? 'destructive' : 'secondary'} className="text-xs">
            {memoryUsage.items} items, {memoryUsage.totalNotes} notes
          </Badge>
          {memoryItems.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Session Memory</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {memoryItems.length} items from your session memory. 
                    This action cannot be undone unless you've exported items to files.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAllMemory} className="bg-destructive text-destructive-foreground">
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="session" className="gap-2">
            <Clock className="w-4 h-4" />
            Session Storage
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Archive className="w-4 h-4" />
            Import/Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="session" className="mt-4 space-y-4">
          {/* Save Current Composition */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
            <Label className="text-sm font-medium">Save Current Composition</Label>
            <div className="space-y-2">
              <Input
                placeholder="Enter a name for this composition..."
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="Optional description..."
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="text-sm"
              />
              <Button
                onClick={saveCurrentToMemory}
                disabled={!itemName.trim() || currentTheme.length === 0}
                className="w-full gap-2"
                size="sm"
              >
                <Save className="w-4 h-4" />
                Save to Session Memory
              </Button>
            </div>
            {currentTheme.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Current theme: {currentTheme.slice(0, 5).map(melodyElementToString).join(', ')}
                {currentTheme.length > 5 ? '...' : ''} ({currentTheme.length} elements)
              </div>
            )}
          </div>

          {/* Memory Items List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Saved Compositions ({memoryItems.length}/10)
            </Label>
            
            {memoryItems.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Database className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No compositions saved in this session</p>
                <p className="text-xs">Save your current work to quickly switch between ideas</p>
              </div>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {memoryItems.map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg bg-background">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{item.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {item.data.theme.length} notes
                            </Badge>
                          </div>
                          
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>
                              Theme: {item.data.theme.slice(0, 4).map(melodyElementToString).join(', ')}
                              {item.data.theme.length > 4 ? '...' : ''}
                            </div>
                            {item.data.selectedMode && (
                              <div>Mode: {item.data.selectedMode.name}</div>
                            )}
                            {item.data.selectedKeySignature && (
                              <div>Key: {item.data.selectedKeySignature.name}</div>
                            )}
                            {item.data.description && (
                              <div>Note: {item.data.description}</div>
                            )}
                            <div>Saved: {formatTimestamp(item.timestamp)}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-1 ml-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadFromMemory(item)}
                            className="text-xs h-7"
                          >
                            Load
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteFromMemory(item.id)}
                            className="text-xs h-7 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </TabsContent>

        <TabsContent value="export" className="mt-4 space-y-4">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Export compositions to files for permanent storage beyond this session, 
              or import previously exported compositions.
            </div>

            {/* Export Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Export Compositions</Label>
              
              {memoryItems.length === 0 ? (
                <div className="text-center text-muted-foreground py-6">
                  <Archive className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No compositions to export</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {memoryItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.data.theme.length} notes • {formatTimestamp(item.timestamp)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToFile(item)}
                        className="text-xs gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Export
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Import Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Import Compositions</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-load-upload-traditional"
                    checked={autoLoadOnUpload}
                    onChange={(e) => setAutoLoadOnUpload(e.target.checked)}
                    className="rounded border-blue-300"
                  />
                  <Label htmlFor="auto-load-upload-traditional" className="text-xs cursor-pointer">
                    Auto-load to target
                  </Label>
                </div>
              </div>
              
              {/* Load Target Selector */}
              {autoLoadOnUpload && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                  <Label className="text-xs font-medium mb-2 block">Load Target:</Label>
                  <Select value={loadTarget} onValueChange={(value) => setLoadTarget(value as 'traditional' | BachVariableName)}>
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="traditional" className="text-xs">Traditional Theme</SelectItem>
                      <Separator className="my-1" />
                      {BACH_VARIABLE_NAMES.map((bachVar) => (
                        <SelectItem key={bachVar.value} value={bachVar.value} className="text-xs">
                          {bachVar.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                    Uploaded files will automatically populate: <strong>{loadTarget === 'traditional' ? 'Traditional Theme' : BACH_VARIABLE_NAMES.find(v => v.value === loadTarget)?.label}</strong>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                {/* JSON Import */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  <FileJson className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-xs font-medium mb-1">JSON File</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Exported compositions
                  </div>
                  <input
                    ref={jsonFileInputRef}
                    type="file"
                    accept=".json"
                    multiple
                    onChange={importFromFile}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-7"
                    onClick={() => jsonFileInputRef.current?.click()}
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Upload JSON
                  </Button>
                </div>

                {/* MIDI Import */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  <FileAudio className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-xs font-medium mb-1">MIDI File</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Standard MIDI files
                  </div>
                  <input
                    ref={midiFileInputRef}
                    type="file"
                    accept=".mid,.midi"
                    onChange={importFromMidiFile}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-7"
                    onClick={() => midiFileInputRef.current?.click()}
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Upload MIDI
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-2 rounded border border-blue-200 dark:border-blue-800">
                <strong>💡 Tip:</strong> Import JSON files for complete composition data, or MIDI files to extract melodies. Select your target above to auto-load imported files.
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Session Warning */}
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="text-xs text-yellow-800 dark:text-yellow-200">
          <strong>⚠️ Session Storage:</strong> Items saved here are temporary and will be lost when you close the application. 
          Export important compositions to files for permanent storage.
        </div>
      </div>
    </Card>
  );
}