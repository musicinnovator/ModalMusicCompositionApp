import { useState } from 'react';
import { EntrySpec } from '../types/musical';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { X, Plus } from 'lucide-react';

interface ImitationFugueControlsProps {
  onGenerateImitation: (interval: number, delay: number) => void;
  onGenerateFugue: (entries: EntrySpec[]) => void;
}

export function ImitationFugueControls({ onGenerateImitation, onGenerateFugue }: ImitationFugueControlsProps) {
  const [imitationInterval, setImitationInterval] = useState(7);
  const [imitationDelay, setImitationDelay] = useState(2);
  
  const [fugueEntries, setFugueEntries] = useState<EntrySpec[]>([
    { entryInterval: 0, entryDelay: 0 },
    { entryInterval: 7, entryDelay: 4 },
    { entryInterval: 12, entryDelay: 8 }
  ]);

  const intervalOptions = [
    { value: 0, label: 'Unison (0)', fugueValid: true },
    { value: 1, label: 'Minor 2nd (1)', fugueValid: false },
    { value: 2, label: 'Major 2nd (2)', fugueValid: false },
    { value: 3, label: 'Minor 3rd (3)', fugueValid: false },
    { value: 4, label: 'Major 3rd (4)', fugueValid: false },
    { value: 5, label: 'Perfect 4th (5)', fugueValid: false },
    { value: 6, label: 'Tritone (6)', fugueValid: false },
    { value: 7, label: 'Perfect 5th (7)', fugueValid: true },
    { value: 8, label: 'Minor 6th (8)', fugueValid: false },
    { value: 9, label: 'Major 6th (9)', fugueValid: false },
    { value: 10, label: 'Minor 7th (10)', fugueValid: false },
    { value: 11, label: 'Major 7th (11)', fugueValid: false },
    { value: 12, label: 'Octave (12)', fugueValid: true },
    { value: -7, label: 'Perfect 4th down (-7)', fugueValid: true },
    { value: -12, label: 'Octave down (-12)', fugueValid: true }
  ];

  const addFugueEntry = () => {
    setFugueEntries([...fugueEntries, { entryInterval: 0, entryDelay: 0 }]);
  };

  const removeFugueEntry = (index: number) => {
    if (fugueEntries.length > 1) {
      setFugueEntries(fugueEntries.filter((_, i) => i !== index));
    }
  };

  const updateFugueEntry = (index: number, field: keyof EntrySpec, value: number) => {
    const updated = [...fugueEntries];
    updated[index] = { ...updated[index], [field]: value };
    setFugueEntries(updated);
  };

  return (
    <Card className="p-6">
      <h2 className="mb-4">Generation Controls</h2>
      
      <Tabs defaultValue="imitation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="imitation">Imitation</TabsTrigger>
          <TabsTrigger value="fugue">Fugue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="imitation" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="imitation-interval">Entry Interval</Label>
              <Select
                value={imitationInterval.toString()}
                onValueChange={(value) => setImitationInterval(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {intervalOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Imitation can use any interval
              </p>
            </div>
            
            <div>
              <Label htmlFor="imitation-delay">Entry Delay</Label>
              <Input
                id="imitation-delay"
                type="number"
                min="0"
                max="16"
                value={imitationDelay}
                onChange={(e) => setImitationDelay(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of beats before imitation starts
              </p>
            </div>
            
            <Button 
              onClick={() => onGenerateImitation(imitationInterval, imitationDelay)}
              className="w-full"
            >
              Generate Imitation
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="fugue" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3>Fugue Entries</h3>
              <Button variant="outline" size="sm" onClick={addFugueEntry}>
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </div>
            
            <div className="space-y-3">
              {fugueEntries.map((entry, index) => (
                <div key={index} className="p-3 border border-border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Entry {index + 1}</Badge>
                    {fugueEntries.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFugueEntry(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Interval</Label>
                      <Select
                        value={entry.entryInterval.toString()}
                        onValueChange={(value) => updateFugueEntry(index, 'entryInterval', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {intervalOptions
                            .filter(option => option.fugueValid)
                            .map((option) => (
                              <SelectItem key={option.value} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Delay</Label>
                      <Input
                        type="number"
                        min="0"
                        max="256"
                        value={entry.entryDelay}
                        onChange={(e) => updateFugueEntry(index, 'entryDelay', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
              <strong>Fugue Rules:</strong> Entries must be at unison, perfect 5th, or octave. 
              Fourth-fifth compensation is automatically applied to maintain modal constraints.
            </div>
            
            <Button 
              onClick={() => onGenerateFugue(fugueEntries)}
              className="w-full"
            >
              Generate Fugue
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}