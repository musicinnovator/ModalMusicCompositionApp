import React from 'react';
import { Mode, KeySignature, generateModeScale, midiNoteToNoteName } from '../types/musical';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';

interface ModeScaleTestProps {
  selectedMode: Mode | null;
  selectedKeySignature: KeySignature | null;
}

export function ModeScaleTest({ selectedMode, selectedKeySignature }: ModeScaleTestProps) {
  if (!selectedMode || !selectedKeySignature) {
    return (
      <Card className="p-4 bg-blue-50 border-blue-200">
        <Label className="text-blue-800">Scale Generation Test</Label>
        <p className="text-sm text-blue-600 mt-2">
          Select both a key signature and mode to test scale generation
        </p>
      </Card>
    );
  }

  const testScale = generateModeScale(selectedMode, selectedKeySignature, 4);
  const isWorking = testScale.length > 0;

  return (
    <Card className={`p-4 ${isWorking ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <Label className={isWorking ? 'text-green-800' : 'text-red-800'}>
          🧪 Scale Generation Test
        </Label>
        <Badge variant={isWorking ? 'default' : 'destructive'}>
          {isWorking ? 'WORKING' : 'ERROR'}
        </Badge>
      </div>
      
      <div className={`space-y-2 text-sm ${isWorking ? 'text-green-700' : 'text-red-700'}`}>
        <div>
          <strong>Key:</strong> {selectedKeySignature.name} (pitch class {selectedKeySignature.key})
        </div>
        <div>
          <strong>Mode:</strong> {selectedMode.name} (final: {selectedMode.final})
        </div>
        <div>
          <strong>Expected root:</strong> Should be {selectedKeySignature.name.split(' ')[0]}4
        </div>
        
        {isWorking ? (
          <div>
            <strong>Generated scale:</strong> {testScale.map(note => midiNoteToNoteName(note)).join(', ')}
          </div>
        ) : (
          <div className="text-red-600">
            <strong>Error:</strong> Scale generation failed - check console for details
          </div>
        )}
        
        {isWorking && testScale.length > 0 && (
          <div className="mt-2 p-2 bg-white/50 rounded border">
            <div className="text-xs">
              <strong>✅ Test Result:</strong> The root note is {midiNoteToNoteName(testScale[0])}, 
              which {
                midiNoteToNoteName(testScale[0]).startsWith(selectedKeySignature.name.split(' ')[0]) 
                  ? '✅ MATCHES' 
                  : '❌ DOES NOT MATCH'
              } the expected key signature root!
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}