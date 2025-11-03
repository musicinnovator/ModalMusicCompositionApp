import { Mode, PITCH_NAMES, ModeCategory, KeySignature, KEY_SIGNATURES, getKeySignatureSymbol } from '../types/musical';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from './ui/select';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

interface ModeSelectorProps {
  modeCategories: ModeCategory[];
  selectedMode: Mode | null;
  onModeSelect: (mode: Mode) => void;
  selectedKeySignature?: KeySignature | null;
  onKeySignatureSelect?: (keySignature: KeySignature) => void;
}

export function ModeSelector({ 
  modeCategories, 
  selectedMode, 
  onModeSelect, 
  selectedKeySignature = null, 
  onKeySignatureSelect 
}: ModeSelectorProps) {
  // Flatten all modes for easy lookup
  const allModes = modeCategories.flatMap(category => category.modes);
  
  // Validate key signatures to ensure no name collisions
  const uniqueKeySignatureNames = new Set(KEY_SIGNATURES.map(ks => ks.name));
  if (uniqueKeySignatureNames.size !== KEY_SIGNATURES.length) {
    console.warn('Duplicate key signature names detected');
  }

  // Validate that we have modes available
  if (!modeCategories || modeCategories.length === 0) {
    console.warn('No mode categories available');
  }
  
  return (
    <Card className="p-6 space-y-4">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2>Mode Selection</h2>
          <Badge variant="outline" className="text-xs">
            {allModes.length} Modes
          </Badge>
        </div>
        
        {/* Key Signature Selection */}
        {onKeySignatureSelect && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Key Signature Select</Label>
              {selectedKeySignature && (
                <Badge variant="outline" className="text-xs">
                  Root: {PITCH_NAMES[selectedKeySignature.key]}
                </Badge>
              )}
            </div>
            <Select
              value={selectedKeySignature ? selectedKeySignature.name : ''}
              onValueChange={(value) => {
                try {
                  if (value && onKeySignatureSelect) {
                    const keySignature = KEY_SIGNATURES.find(ks => ks.name === value);
                    if (keySignature) {
                      onKeySignatureSelect(keySignature);
                    } else {
                      console.warn('Key signature not found:', value);
                    }
                  }
                } catch (err) {
                  console.error('Error selecting key signature:', err);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select key signature" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <SelectGroup>
                  <SelectLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
                    Major Keys
                  </SelectLabel>
                  {KEY_SIGNATURES.filter(ks => ks.mode === 'major').map((keySignature, index) => (
                    <SelectItem 
                      key={`major-${index}-${keySignature.name}`} 
                      value={keySignature.name}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className="font-medium min-w-[80px]">{keySignature.name}</span>
                        <div className="flex items-center gap-2">
                          {keySignature.sharps !== 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">
                                {Math.abs(keySignature.sharps)}
                              </span>
                              <span className="text-lg leading-none">
                                {keySignature.sharps > 0 ? '♯' : '♭'}
                              </span>
                            </div>
                          )}
                          {keySignature.sharps === 0 && (
                            <span className="text-xs text-muted-foreground">♮</span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
                    Minor Keys
                  </SelectLabel>
                  {KEY_SIGNATURES.filter(ks => ks.mode === 'minor').map((keySignature, index) => (
                    <SelectItem 
                      key={`minor-${index}-${keySignature.name}`} 
                      value={keySignature.name}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className="font-medium min-w-[80px]">{keySignature.name}</span>
                        <div className="flex items-center gap-2">
                          {keySignature.sharps !== 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">
                                {Math.abs(keySignature.sharps)}
                              </span>
                              <span className="text-lg leading-none">
                                {keySignature.sharps > 0 ? '♯' : '♭'}
                              </span>
                            </div>
                          )}
                          {keySignature.sharps === 0 && (
                            <span className="text-xs text-muted-foreground">♮</span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {selectedKeySignature && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded space-y-1">
                <div>
                  <strong>Selected:</strong> {selectedKeySignature.name}
                  {selectedKeySignature.sharps !== 0 && (
                    <span className="ml-2">
                      ({Math.abs(selectedKeySignature.sharps)} {selectedKeySignature.sharps > 0 ? 'sharp' : 'flat'}{Math.abs(selectedKeySignature.sharps) > 1 ? 's' : ''})
                    </span>
                  )}
                  {selectedKeySignature.sharps === 0 && (
                    <span className="ml-2">(no accidentals)</span>
                  )}
                </div>
                <div className="opacity-75 italic">
                  ℹ️ All modes below are now transposed to {PITCH_NAMES[selectedKeySignature.key]}
                </div>
              </div>
            )}
            
            <Separator />
          </div>
        )}
        <Select
          value={selectedMode?.index.toString() || ''}
          onValueChange={(value) => {
            const mode = allModes.find(m => m.index.toString() === value);
            if (mode) onModeSelect(mode);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a mode from any culture" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {modeCategories.map((category) => (
              <SelectGroup key={category.name}>
                <SelectLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
                  {category.name}
                </SelectLabel>
                {category.modes.map((mode) => (
                  <SelectItem key={mode.index} value={mode.index.toString()}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{mode.name}</span>
                      <span className="text-xs text-muted-foreground">
                        on {PITCH_NAMES[mode.final]}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

      </div>

      {selectedMode && (
        <div className="space-y-3">
          <div>
            <h3>Mode Details</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Name:</span> {selectedMode.name}</div>
              <div><span className="font-medium">Root Note:</span> {PITCH_NAMES[selectedMode.final]}</div>
              <div><span className="font-medium">Category:</span> {
                modeCategories.find(cat => 
                  cat.modes.some(m => m.index === selectedMode.index)
                )?.name || 'Unknown'
              }</div>
              {selectedKeySignature && (
                <div>
                  <span className="font-medium">Key Context:</span> {selectedKeySignature.name}
                  {selectedKeySignature.key !== selectedMode.final && (
                    <span className="text-muted-foreground ml-1">
                      (mode transposed from {PITCH_NAMES[selectedKeySignature.key]})
                    </span>
                  )}
                </div>
              )}
              <div>
                <span className="font-medium">Step Pattern:</span>{' '}
                {selectedMode.stepPattern.map(step => {
                  if (step === 1) return 'H';
                  if (step === 2) return 'W';
                  if (step === 3) return 'W+H';
                  if (step === 4) return '2W';
                  return step.toString();
                }).join('-')}
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-sm text-indigo-900 dark:text-indigo-100">Scale Degrees & Theory</div>
              <Badge variant="outline" className="text-xs text-indigo-700 dark:text-indigo-300">
                Musical Analysis
              </Badge>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-indigo-700 dark:text-indigo-300 mb-2">Scale Notes with Degrees:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedMode.stepPattern.reduce((acc, step, i) => {
                    if (i === 0) {
                      acc.push((selectedMode.final + 0) % 12);
                    }
                    const last = acc[acc.length - 1];
                    acc.push((last + step) % 12);
                    return acc;
                  }, [] as number[]).slice(0, -1).map((pitch, i) => (
                    <div key={i} className="text-center">
                      <span 
                        className={`block px-3 py-2 rounded-lg text-sm font-medium border ${
                          i === 0 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white dark:bg-gray-800 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700'
                        }`}
                      >
                        {PITCH_NAMES[pitch]}
                      </span>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-xs text-indigo-700 dark:text-indigo-300 pt-2 border-t border-indigo-200 dark:border-indigo-800">
                🎼 Numbers below notes show scale degrees (1 = tonic/root)
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}