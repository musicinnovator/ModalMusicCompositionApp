import { useState, useMemo } from 'react';
import { Mode, KeySignature, MidiNote, generateModeScale, midiNoteToNoteName, BachVariableName } from '../types/musical';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Music, Plus, Target } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ModeScaleBuilderProps {
  selectedMode: Mode | null;
  selectedKeySignature: KeySignature | null;
  midiTarget: BachVariableName | 'theme' | null;
  onAddToTarget: (notes: MidiNote[], target: BachVariableName | 'theme') => void;
}

export function ModeScaleBuilder({ 
  selectedMode, 
  selectedKeySignature, 
  midiTarget,
  onAddToTarget 
}: ModeScaleBuilderProps) {
  const [selectedOctave, setSelectedOctave] = useState<number>(4);
  const [selectedNotes, setSelectedNotes] = useState<Set<number>>(new Set());

  // Generate the scale notes for the current mode and key
  const scaleNotes = useMemo(() => {
    if (!selectedMode || !selectedKeySignature) {
      console.log('🎼 ModeScaleBuilder: Missing mode or key signature');
      return [];
    }
    
    try {
      console.log(`🎼 ModeScaleBuilder: Generating scale for ${selectedMode.name} in ${selectedKeySignature.name} (octave ${selectedOctave})`);
      console.log(`🎼 Mode final: ${selectedMode.final}, Key signature key: ${selectedKeySignature.key}`);
      
      const notes = generateModeScale(selectedMode, selectedKeySignature, selectedOctave);
      
      if (notes.length === 0) {
        console.error('🎼 ModeScaleBuilder: Generated scale is empty');
        toast.error('Failed to generate scale notes - check mode and key signature');
        return [];
      }
      
      console.log(`🎼 ModeScaleBuilder: Successfully generated ${notes.length} notes`);
      return notes;
    } catch (err) {
      console.error('🎼 ModeScaleBuilder: Error generating mode scale:', err);
      toast.error('Failed to generate scale notes');
      return [];
    }
  }, [selectedMode, selectedKeySignature, selectedOctave]);

  const handleNoteToggle = (midiNote: MidiNote) => {
    const newSelected = new Set(selectedNotes);
    if (newSelected.has(midiNote)) {
      newSelected.delete(midiNote);
    } else {
      newSelected.add(midiNote);
    }
    setSelectedNotes(newSelected);
  };

  const handleAddToTarget = () => {
    const notesToAdd = Array.from(selectedNotes).sort((a, b) => a - b);
    
    if (notesToAdd.length === 0) {
      toast.warning('Please select some notes first');
      return;
    }

    if (!midiTarget) {
      toast.error('No target selected');
      return;
    }

    onAddToTarget(notesToAdd, midiTarget);
    
    const noteNames = notesToAdd.map(note => midiNoteToNoteName(note)).join(', ');
    const targetName = midiTarget === 'theme' ? 'Main Theme' : midiTarget;
    toast.success(`Added ${notesToAdd.length} notes to ${targetName}: ${noteNames}`);
    
    // Clear selection after adding
    setSelectedNotes(new Set());
  };

  const handleSelectAll = () => {
    setSelectedNotes(new Set(scaleNotes));
  };

  const handleClearSelection = () => {
    setSelectedNotes(new Set());
  };

  if (!selectedMode || !selectedKeySignature) {
    return (
      <Card className="p-4 bg-muted/50">
        <div className="text-center text-muted-foreground">
          <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Select a Mode and Key Signature to generate scale notes</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5" />
          <Label className="font-medium">Mode Scale Builder</Label>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {selectedMode.name}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {selectedKeySignature.name}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Root: {selectedMode.final}
          </Badge>
        </div>
      </div>

      {/* Octave Selection */}
      <div className="mb-4">
        <Label className="text-sm font-medium mb-2 block">Octave Range</Label>
        <Select value={selectedOctave.toString()} onValueChange={(value) => setSelectedOctave(parseInt(value))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select octave" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">Octave 2 (C2-B2)</SelectItem>
            <SelectItem value="3">Octave 3 (C3-B3)</SelectItem>
            <SelectItem value="4">Octave 4 (C4-B4) - Middle</SelectItem>
            <SelectItem value="5">Octave 5 (C5-B5)</SelectItem>
            <SelectItem value="6">Octave 6 (C6-B6)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Scale Notes */}
      {scaleNotes.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Available Notes</Label>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
          </div>
          
          {/* Debug information */}
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <div className="text-blue-800">
              <strong>🔍 Debug Info:</strong> Root note is <strong>{midiNoteToNoteName(scaleNotes[0])}</strong> 
              (should start with {selectedKeySignature.name.split(' ')[0]}) | 
              Mode final: {selectedMode.final} | Key: {selectedKeySignature.key}
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {scaleNotes.map((midiNote, index) => (
              <Button
                key={`${midiNote}-${index}`}
                variant={selectedNotes.has(midiNote) ? "default" : "outline"}
                size="sm"
                onClick={() => handleNoteToggle(midiNote)}
                className="text-xs justify-center"
              >
                {midiNoteToNoteName(midiNote)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Add to Target */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="w-4 h-4" />
          <span>
            Target: <strong>{midiTarget === 'theme' ? 'Main Theme' : midiTarget || 'None'}</strong>
          </span>
        </div>
        
        <Button
          onClick={handleAddToTarget}
          disabled={selectedNotes.size === 0 || !midiTarget}
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Add {selectedNotes.size > 0 ? `${selectedNotes.size} notes` : 'selected notes'} to {midiTarget === 'theme' ? 'Theme' : midiTarget}
        </Button>
        
        {selectedNotes.size > 0 && (
          <div className="text-xs text-muted-foreground">
            Selected: {Array.from(selectedNotes).sort((a, b) => a - b).map(note => midiNoteToNoteName(note)).join(', ')}
          </div>
        )}
      </div>
    </Card>
  );
}