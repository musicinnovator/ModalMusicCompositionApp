import React, { useState, useEffect } from 'react';
import { Mode, ModeCategory, PitchClass, generateModeScale } from '../types/musical';
import { MusicalEngine } from '../lib/musical-engine';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface ModalSystemTestProps {
  modeCategories: ModeCategory[];
}

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
  error?: string;
}

export function ModalSystemTest({ modeCategories }: ModalSystemTestProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState({ total: 0, passed: 0, failed: 0 });

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    try {
      // Test 1: Mode Categories Loading
      results.push({
        name: 'Mode Categories Loading',
        passed: modeCategories.length > 0,
        details: `Loaded ${modeCategories.length} categories with ${modeCategories.reduce((total, cat) => total + cat.modes.length, 0)} total modes`
      });

      // Test 2: Mode Pattern Validation
      let patternValidationPassed = true;
      let patternErrors: string[] = [];
      
      modeCategories.forEach(category => {
        category.modes.forEach(mode => {
          try {
            const sum = mode.stepPattern.reduce((a, b) => a + b, 0);
            if (sum > 15 || sum < 8) { // Allow some flexibility for exotic scales
              patternErrors.push(`${mode.name}: sum=${sum}`);
              patternValidationPassed = false;
            }
            if (mode.stepPattern.some(step => step < 0 || step > 6)) {
              patternErrors.push(`${mode.name}: invalid interval`);
              patternValidationPassed = false;
            }
          } catch (error) {
            patternErrors.push(`${mode.name}: ${error}`);
            patternValidationPassed = false;
          }
        });
      });

      results.push({
        name: 'Mode Pattern Validation',
        passed: patternValidationPassed,
        details: patternValidationPassed 
          ? 'All mode patterns are valid'
          : `${patternErrors.length} validation errors`,
        error: patternErrors.length > 0 ? patternErrors.join('; ') : undefined
      });

      // Test 3: Scale Degree Building
      let scaleBuildingPassed = true;
      let scaleErrors: string[] = [];
      
      try {
        modeCategories[0]?.modes.slice(0, 5).forEach(mode => {
          try {
            const scale = MusicalEngine.buildScaleDegrees(mode);
            if (scale.length === 0) {
              scaleErrors.push(`${mode.name}: empty scale`);
              scaleBuildingPassed = false;
            }
          } catch (error) {
            scaleErrors.push(`${mode.name}: ${error}`);
            scaleBuildingPassed = false;
          }
        });
      } catch (error) {
        scaleErrors.push(`General error: ${error}`);
        scaleBuildingPassed = false;
      }

      results.push({
        name: 'Scale Degree Building',
        passed: scaleBuildingPassed,
        details: scaleBuildingPassed 
          ? 'Scale degrees built successfully for test modes'
          : `${scaleErrors.length} scale building errors`,
        error: scaleErrors.length > 0 ? scaleErrors.join('; ') : undefined
      });

      // Test 4: Mode Mixing Functionality
      let mixingPassed = true;
      let mixingError = '';
      
      try {
        const allModes = modeCategories.flatMap(cat => cat.modes);
        if (allModes.length >= 2) {
          const testModes = allModes.slice(0, 2);
          const hybridMode = MusicalEngine.createHybridMode(testModes, 0, 'blend');
          
          if (!hybridMode || !hybridMode.stepPattern || hybridMode.stepPattern.length === 0) {
            mixingPassed = false;
            mixingError = 'Hybrid mode creation failed';
          }
        } else {
          mixingPassed = false;
          mixingError = 'Not enough modes for mixing test';
        }
      } catch (error) {
        mixingPassed = false;
        mixingError = `Mode mixing error: ${error}`;
      }

      results.push({
        name: 'Mode Mixing Functionality',
        passed: mixingPassed,
        details: mixingPassed 
          ? 'Mode mixing works correctly'
          : 'Mode mixing failed',
        error: mixingError || undefined
      });

      // Test 5: Mode Alteration System
      let alterationPassed = true;
      let alterationError = '';
      
      try {
        const allModes = modeCategories.flatMap(cat => cat.modes);
        if (allModes.length > 0) {
          const testMode = allModes[0];
          const alteredMode = MusicalEngine.generateModeVariants(
            testMode,
            0,
            { raiseThird: true }
          );
          
          if (!alteredMode || !alteredMode.stepPattern) {
            alterationPassed = false;
            alterationError = 'Mode alteration failed';
          }
        } else {
          alterationPassed = false;
          alterationError = 'No modes available for alteration test';
        }
      } catch (error) {
        alterationPassed = false;
        alterationError = `Mode alteration error: ${error}`;
      }

      results.push({
        name: 'Mode Alteration System',
        passed: alterationPassed,
        details: alterationPassed 
          ? 'Mode alterations work correctly'
          : 'Mode alteration system failed',
        error: alterationError || undefined
      });

      // Test 6: Related Mode Discovery
      let relatedModePassed = true;
      let relatedModeError = '';
      
      try {
        const allModes = modeCategories.flatMap(cat => cat.modes);
        if (allModes.length > 1) {
          const testMode = allModes[0];
          const relatedModes = MusicalEngine.getRelatedModes(testMode, allModes, 'similar_intervals');
          
          if (!Array.isArray(relatedModes)) {
            relatedModePassed = false;
            relatedModeError = 'Related modes not returned as array';
          }
        } else {
          relatedModePassed = false;
          relatedModeError = 'Not enough modes for relationship test';
        }
      } catch (error) {
        relatedModePassed = false;
        relatedModeError = `Related mode error: ${error}`;
      }

      results.push({
        name: 'Related Mode Discovery',
        passed: relatedModePassed,
        details: relatedModePassed 
          ? 'Related mode discovery works correctly'
          : 'Related mode discovery failed',
        error: relatedModeError || undefined
      });

      // Test 7: New Cultural Categories
      const expectedCategories = [
        'Western Traditional', 'Chinese Modes', 'Japanese Modes', 'Middle Eastern',
        'Indian Classical', 'European Folk', 'African Modes', 'Native American',
        'Blues & Jazz', 'Exotic Scales', 'Microtonal Experiments'
      ];
      
      const foundCategories = modeCategories.map(cat => cat.name);
      const missingCategories = expectedCategories.filter(cat => !foundCategories.includes(cat));
      
      results.push({
        name: 'Cultural Category Coverage',
        passed: missingCategories.length === 0,
        details: missingCategories.length === 0 
          ? `All ${expectedCategories.length} cultural categories loaded`
          : `Missing ${missingCategories.length} categories`,
        error: missingCategories.length > 0 ? `Missing: ${missingCategories.join(', ')}` : undefined
      });

      // Test 8: Mode Count Validation
      const totalModes = modeCategories.reduce((total, cat) => total + cat.modes.length, 0);
      const modeCountPassed = totalModes >= 80; // Should have significantly more than original 38
      
      results.push({
        name: 'Enhanced Mode Collection',
        passed: modeCountPassed,
        details: `Found ${totalModes} modes (expected 80+)`,
        error: !modeCountPassed ? 'Mode count lower than expected' : undefined
      });

      // Test 9: Key Signature & Mode Integration Fix
      let keySignatureModeIntegrationPassed = true;
      let keySignatureIntegrationError = '';
      
      try {
        // Test different key signatures by building modes for each one
        const testKeySignatures = [
          { key: 0, name: 'C Major' },
          { key: 7, name: 'G Major' },
          { key: 2, name: 'D Major' }
        ];
        
        testKeySignatures.forEach(keySignature => {
          try {
            // Build modes specifically for this key signature (this is the correct approach)
            const modesForKey = MusicalEngine.buildAllWorldModes(keySignature.key);
            
            if (modesForKey.length === 0) {
              keySignatureModeIntegrationPassed = false;
              keySignatureIntegrationError += `No modes built for ${keySignature.name}; `;
              return;
            }
            
            // Find a major mode to test with
            const testMode = modesForKey
              .flatMap(cat => cat.modes)
              .find(m => m.name.includes('Ionian') || m.name.includes('Major'));
            
            if (!testMode) {
              keySignatureModeIntegrationPassed = false;
              keySignatureIntegrationError += `No major mode found for ${keySignature.name}; `;
              return;
            }
            
            // Test that the mode's final matches the key signature
            if (testMode.final !== keySignature.key) {
              keySignatureModeIntegrationPassed = false;
              keySignatureIntegrationError += `Mode final mismatch in ${keySignature.name}: mode.final=${testMode.final}, expected=${keySignature.key}; `;
              return;
            }
            
            // Generate scale and test the root note
            const scale = generateModeScale(testMode, keySignature as any, 4);
            if (scale.length === 0) {
              keySignatureModeIntegrationPassed = false;
              keySignatureIntegrationError += `Empty scale for ${keySignature.name}; `;
            } else {
              // Check if the root note matches the key signature
              const rootNote = scale[0];
              const rootPitchClass = rootNote % 12;
              if (rootPitchClass !== keySignature.key) {
                keySignatureModeIntegrationPassed = false;
                keySignatureIntegrationError += `Root mismatch in ${keySignature.name}: expected ${keySignature.key}, got ${rootPitchClass}; `;
              }
            }
          } catch (error) {
            keySignatureModeIntegrationPassed = false;
            keySignatureIntegrationError += `Error with ${keySignature.name}: ${error}; `;
          }
        });
      } catch (error) {
        keySignatureModeIntegrationPassed = false;
        keySignatureIntegrationError = `Integration test error: ${error}`;
      }

      results.push({
        name: 'Key Signature & Mode Integration Fix',
        passed: keySignatureModeIntegrationPassed,
        details: keySignatureModeIntegrationPassed 
          ? 'Available Notes correctly combines key signature and mode'
          : 'Key signature and mode integration has issues',
        error: keySignatureIntegrationError || undefined
      });

    } catch (error) {
      results.push({
        name: 'Test Suite Execution',
        passed: false,
        details: 'Test suite encountered a critical error',
        error: `${error}`
      });
    }

    setTestResults(results);
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    setSummary({ total: results.length, passed, failed });
    
    setIsRunning(false);
  };

  useEffect(() => {
    if (modeCategories.length > 0) {
      runTests();
    }
  }, [modeCategories]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Modal System Test Suite</h3>
        </div>
        <Button onClick={runTests} disabled={isRunning}>
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </Button>
      </div>

      {summary.total > 0 && (
        <Alert className="mb-4">
          <AlertDescription>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {summary.passed} Passed
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-500" />
                {summary.failed} Failed
              </span>
              <Badge variant={summary.failed === 0 ? 'default' : 'destructive'}>
                {summary.failed === 0 ? 'All Tests Passed' : `${summary.failed} Issues Found`}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <ScrollArea className="h-96">
        <div className="space-y-3">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-3 border rounded-lg ${
                result.passed 
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                  : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {result.passed ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="font-medium">{result.name}</span>
                <Badge variant={result.passed ? 'default' : 'destructive'} className="ml-auto text-xs">
                  {result.passed ? 'PASS' : 'FAIL'}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-1">
                {result.details}
              </p>
              
              {result.error && (
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-2 rounded">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-4 text-xs text-muted-foreground">
        This test suite validates the enhanced modal theory implementation including 
        mode loading, pattern validation, mixing capabilities, and cultural diversity.
      </div>
    </Card>
  );
}