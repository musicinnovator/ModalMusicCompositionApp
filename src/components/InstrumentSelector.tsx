import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Music2, Piano, Guitar, Volume2 } from 'lucide-react';
import { ENHANCED_INSTRUMENTS, InstrumentType } from '../lib/enhanced-synthesis';

// Use the enhanced instruments from the synthesis engine
export const INSTRUMENTS = ENHANCED_INSTRUMENTS;

interface InstrumentSelectorProps {
  selectedInstrument: InstrumentType;
  onInstrumentChange: (instrument: InstrumentType) => void;
  size?: 'sm' | 'default';
}

export function InstrumentSelector({ selectedInstrument, onInstrumentChange, size = 'default' }: InstrumentSelectorProps) {
  const [open, setOpen] = useState(false);

  const categories = [...new Set(Object.values(ENHANCED_INSTRUMENTS).map(i => i.category))];
  
  // Safety check: ensure selectedInstrument exists in ENHANCED_INSTRUMENTS
  const safeSelectedInstrument = ENHANCED_INSTRUMENTS[selectedInstrument] ? selectedInstrument : 'piano';

  const testInstrument = (instrument: InstrumentType) => {
    // This would be called by the parent to test the instrument
    const event = new CustomEvent('testInstrument', { detail: instrument });
    window.dispatchEvent(event);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={size === 'sm' ? 'sm' : 'sm'} className="gap-2">
          <Music2 className="w-4 h-4" />
          {ENHANCED_INSTRUMENTS[safeSelectedInstrument].name}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Piano className="w-5 h-5" />
            Select Instrument
          </DialogTitle>
          <DialogDescription>
            Choose an instrument for audio playback and click the play button to preview the sound.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <RadioGroup value={safeSelectedInstrument} onValueChange={(value) => onInstrumentChange(value as InstrumentType)}>
            {categories.map(category => (
              <div key={category} className="space-y-3">
                <Badge variant="secondary" className="text-xs">
                  {category}
                </Badge>
                <div className="space-y-2 ml-2">
                  {Object.entries(ENHANCED_INSTRUMENTS)
                    .filter(([_, config]) => config.category === category)
                    .map(([key, config]) => (
                      <div key={key} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={key} id={key} />
                          <Label 
                            htmlFor={key} 
                            className="cursor-pointer flex-1 text-sm"
                          >
                            {config.name}
                          </Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => testInstrument(key as InstrumentType)}
                        >
                          <Volume2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </RadioGroup>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}