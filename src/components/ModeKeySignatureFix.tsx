import React from 'react';
import { Mode, KeySignature, generateModeScale, midiNoteToNoteName, PITCH_NAMES } from '../types/musical';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface ModeKeySignatureFixProps {
  selectedMode: Mode | null;
  selectedKeySignature: KeySignature | null;
}

export function ModeKeySignatureFix({ selectedMode, selectedKeySignature }: ModeKeySignatureFixProps) {
  if (!selectedMode || !selectedKeySignature) {
    return (
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-blue-600" />
          <Label className="font-medium text-blue-800">🔧 Mode & Key Signature Integration Test</Label>
        </div>
        <p className="text-sm text-blue-600">
          Select both a key signature and mode to test the "Available Notes" fix
        </p>
      </Card>
    );
  }

  // Test the scale generation
  const testScale = generateModeScale(selectedMode, selectedKeySignature, 4);
  const isWorking = testScale.length > 0;
  
  // Get expected root note name from key signature
  const expectedRootName = selectedKeySignature.name.split(' ')[0];
  const actualRootName = isWorking ? midiNoteToNoteName(testScale[0]).slice(0, -1) : 'N/A'; // Remove octave number
  const rootMatches = isWorking && actualRootName === expectedRootName;
  
  // Additional debugging - check if mode.final matches key signature
  const modeFinalMatchesKey = selectedMode.final === selectedKeySignature.key;
  const expectedPitchClass = selectedKeySignature.key;
  const actualPitchClass = isWorking ? testScale[0] % 12 : -1;

  return (
    <Card className={`p-4 border-2 ${rootMatches ? 'bg-green-50 border-green-300' : isWorking ? 'bg-yellow-50 border-yellow-300' : 'bg-red-50 border-red-300'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {rootMatches ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <Label className={`font-medium ${rootMatches ? 'text-green-800' : 'text-red-800'}`}>
            🔧 Mode & Key Signature Integration Test
          </Label>
        </div>
        <Badge variant={rootMatches ? 'default' : 'destructive'} className="gap-1">
          {rootMatches ? '✅ FIXED' : '❌ ERROR'}
        </Badge>
      </div>

      <div className="space-y-3">
        {/* Configuration Display */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-white/50 rounded border">
          <div>
            <div className="text-xs font-medium text-muted-foreground">KEY SIGNATURE</div>
            <div className="text-sm font-medium">{selectedKeySignature.name}</div>
            <div className="text-xs text-muted-foreground">Root: {PITCH_NAMES[selectedKeySignature.key]} (pitch class {selectedKeySignature.key})</div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">MODE</div>
            <div className="text-sm font-medium">{selectedMode.name}</div>
            <div className="text-xs text-muted-foreground">Final: {selectedMode.final} | Pattern: {selectedMode.stepPattern.join('-')}</div>
          </div>
        </div>

        {/* Test Results */}       
        <div className={`p-3 rounded border space-y-2 ${rootMatches ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'}`}>
          <div className={`text-sm font-medium ${rootMatches ? 'text-green-800' : 'text-red-800'}`}>
            Test Results:
          </div>
          
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Expected root note:</span>
              <Badge variant="outline" className="text-xs">{expectedRootName}4</Badge>
            </div>
            <div className="flex justify-between">
              <span>Actual root note:</span>
              <Badge variant={rootMatches ? 'default' : 'destructive'} className="text-xs">
                {isWorking ? midiNoteToNoteName(testScale[0]) : 'Failed'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Root matches key:</span>
              <Badge variant={rootMatches ? 'default' : 'destructive'} className="text-xs">
                {rootMatches ? '✅ YES' : '❌ NO'}
              </Badge>
            </div>
          </div>
          
          {/* Detailed debugging information */}
          <div className="border-t pt-2 mt-2">
            <div className="text-xs font-medium text-muted-foreground mb-1">Debug Details:</div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Key signature pitch class:</span>
                <Badge variant="outline" className="text-xs">{expectedPitchClass}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Mode.final value:</span>
                <Badge variant={modeFinalMatchesKey ? 'default' : 'destructive'} className="text-xs">
                  {selectedMode.final}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Generated root pitch class:</span>
                <Badge variant={actualPitchClass === expectedPitchClass ? 'default' : 'destructive'} className="text-xs">
                  {actualPitchClass >= 0 ? actualPitchClass : 'N/A'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Mode.final matches key:</span>
                <Badge variant={modeFinalMatchesKey ? 'default' : 'destructive'} className="text-xs">
                  {modeFinalMatchesKey ? '✅ YES' : '❌ NO'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Scale Preview */}
        {isWorking && (
          <div className="p-3 bg-gray-50 rounded border">
            <div className="text-xs font-medium text-muted-foreground mb-2">GENERATED SCALE NOTES:</div>
            <div className="flex flex-wrap gap-1">
              {testScale.slice(0, 8).map((note, index) => (
                <Badge 
                  key={index} 
                  variant={index === 0 ? (rootMatches ? 'default' : 'destructive') : 'outline'}
                  className="text-xs"
                >
                  {midiNoteToNoteName(note)}
                </Badge>
              ))}
              {testScale.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{testScale.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Fix Explanation */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          <strong>What was fixed:</strong> The "Available Notes" tab now correctly combines both your selected key signature AND mode. 
          Previously, it was showing the mode starting on C regardless of the key signature. 
          {rootMatches ? (
            <div className="mt-1 text-green-700">
              ✅ <strong>Fix confirmed:</strong> The mode is now properly transposed to start on {expectedRootName} 
              as specified by your {selectedKeySignature.name} key signature.
            </div>
          ) : (
            <div className="mt-1 text-red-700">
              ❌ <strong>Issue detected:</strong> {!modeFinalMatchesKey 
                ? `The mode's final (${selectedMode.final}) doesn't match the key signature (${expectedPitchClass}). This suggests the mode wasn't built correctly for this key signature.`
                : `The mode.final is correct (${selectedMode.final}) but scale generation failed.`
              }
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}