import React from 'react';
import { Mode, KeySignature, ModeCategory, PITCH_NAMES } from '../types/musical';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ModeIntegrationDebugProps {
  modeCategories: ModeCategory[];
  selectedKeySignature: KeySignature | null;
}

export function ModeIntegrationDebug({ modeCategories, selectedKeySignature }: ModeIntegrationDebugProps) {
  if (!selectedKeySignature) {
    return (
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-blue-600" />
          <Label className="text-blue-800">Mode Integration Debug</Label>
        </div>
        <p className="text-sm text-blue-600">
          Select a key signature to debug mode integration
        </p>
      </Card>
    );
  }

  // Get a sample of modes from different categories
  const sampleModes = modeCategories.slice(0, 3).flatMap(cat => 
    cat.modes.slice(0, 2).map(mode => ({ ...mode, categoryName: cat.name }))
  );

  const expectedFinal = selectedKeySignature.key;
  const allModesCorrect = sampleModes.every(mode => mode.final === expectedFinal);

  return (
    <Card className={`p-4 ${allModesCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {allModesCorrect ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
          <Label className={`font-medium ${allModesCorrect ? 'text-green-800' : 'text-red-800'}`}>
            🔍 Mode Integration Debug
          </Label>
        </div>
        <Badge variant={allModesCorrect ? 'default' : 'destructive'}>
          {allModesCorrect ? 'ALL CORRECT' : 'ISSUES FOUND'}
        </Badge>
      </div>

      <div className="space-y-3">
        {/* Key Signature Info */}
        <div className="bg-white/50 p-2 rounded border">
          <div className="text-xs font-medium text-muted-foreground">SELECTED KEY SIGNATURE</div>
          <div className="text-sm">
            {selectedKeySignature.name} → Root pitch class: <strong>{expectedFinal}</strong> ({PITCH_NAMES[expectedFinal]})
          </div>
        </div>

        {/* Mode Sample Analysis */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">MODE SAMPLE ANALYSIS</div>
          
          {sampleModes.map((mode, index) => {
            const isCorrect = mode.final === expectedFinal;
            return (
              <div key={index} className={`p-2 rounded border text-xs ${
                isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{mode.name}</span>
                    <span className="text-muted-foreground ml-1">({mode.categoryName})</span>
                  </div>
                  <Badge variant={isCorrect ? 'default' : 'destructive'} className="text-xs">
                    {isCorrect ? '✅' : '❌'}
                  </Badge>
                </div>
                <div className="mt-1">
                  Final: <strong>{mode.final}</strong> ({PITCH_NAMES[mode.final]}) 
                  {isCorrect ? (
                    <span className="text-green-700 ml-2">✅ Matches key signature</span>
                  ) : (
                    <span className="text-red-700 ml-2">❌ Expected {expectedFinal} ({PITCH_NAMES[expectedFinal]})</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className={`p-2 rounded border text-xs ${
          allModesCorrect ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-800'
        }`}>
          <div className="font-medium">
            {allModesCorrect ? (
              '✅ All modes have correct final values matching the key signature'
            ) : (
              '❌ Some modes have incorrect final values - they should all be ' + expectedFinal + ' (' + PITCH_NAMES[expectedFinal] + ')'
            )}
          </div>
          
          {!allModesCorrect && (
            <div className="mt-1">
              <strong>Root Cause:</strong> The modes are being built with incorrect final values. 
              When you select {selectedKeySignature.name}, all modes should have final={expectedFinal}, 
              but some still have final=0 (C). This means the mode building process isn't properly 
              using the key signature's root note.
            </div>
          )}
        </div>

        {/* Action Items */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          <strong>What this shows:</strong> This debug panel checks if the modes in your current 
          modeCategories have the correct final values matching your selected key signature. 
          If they don't match, it means the issue is in the mode building process, not the scale generation.
        </div>
      </div>
    </Card>
  );
}