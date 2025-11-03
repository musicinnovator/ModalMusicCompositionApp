import { useState, useCallback } from 'react';
import { 
  Theme, 
  Mode, 
  KeySignature, 
  MidiNote, 
  midiNoteToNoteName, 
  BachLikeVariables, 
  BachVariableName,
  NoteValue 
} from '../types/musical';
import { 
  AdvancedCounterpointEngine,
  AdvancedCounterpointTechnique,
  AdvancedCounterpointParameters,
  AdvancedCounterpointResult,
  CounterpointError,
  VoiceLeadingType,
  DissonanceTreatment,
  CounterpointStyle,
  COMPOSER_STYLE_PROFILES,
  ComposerStyleProfile
} from '../lib/advanced-counterpoint-engine';
import { useErrorHandler } from '../lib/error-handling';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Music4, 
  Waves, 
  Target, 
  Shuffle, 
  BookOpen, 
  Zap, 
  Trash2, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AdvancedCounterpointComposerProps {
  theme: Theme;
  bachVariables?: BachLikeVariables;
  onBachVariablesChange?: (variables: BachLikeVariables) => void;
  selectedMode?: Mode | null;
  selectedKeySignature?: KeySignature | null;
  onCounterpointGenerated?: (counterpoints: Theme[], technique: string, analysis?: any) => void;
}

// Technique definitions with categorization
const TECHNIQUE_CATEGORIES = {
  species: {
    name: 'Species Counterpoint',
    icon: '🎼',
    techniques: [
      { value: 'species_first' as AdvancedCounterpointTechnique, label: 'First Species (1:1)', description: 'Note against note - fundamental consonant counterpoint' },
      { value: 'species_second' as AdvancedCounterpointTechnique, label: 'Second Species (2:1)', description: 'Two notes against one with passing tones' },
      { value: 'species_third' as AdvancedCounterpointTechnique, label: 'Third Species (4:1)', description: 'Four notes against one with stepwise motion' },
      { value: 'species_fourth' as AdvancedCounterpointTechnique, label: 'Fourth Species', description: 'Syncopation with suspensions and resolutions' },
      { value: 'species_fifth' as AdvancedCounterpointTechnique, label: 'Fifth Species (Florid)', description: 'Mixed species with ornamental freedom' }
    ]
  },
  canon: {
    name: 'Canonic Techniques',
    icon: '🔄',
    techniques: [
      { value: 'canon_strict' as AdvancedCounterpointTechnique, label: 'Strict Canon', description: 'Exact imitation at specified interval and delay' },
      { value: 'canon_free' as AdvancedCounterpointTechnique, label: 'Free Canon', description: 'Flexible imitation with variations' },
      { value: 'canon_crab' as AdvancedCounterpointTechnique, label: 'Crab Canon', description: 'Retrograde canon (backwards)' },
      { value: 'canon_augmentation' as AdvancedCounterpointTechnique, label: 'Augmentation Canon', description: 'Canon with slower note values' },
      { value: 'canon_diminution' as AdvancedCounterpointTechnique, label: 'Diminution Canon', description: 'Canon with faster note values' }
    ]
  },
  invertible: {
    name: 'Invertible Counterpoint',
    icon: '🔀',
    techniques: [
      { value: 'invertible_counterpoint' as AdvancedCounterpointTechnique, label: 'Basic Invertible', description: 'Two-voice invertible counterpoint' },
      { value: 'double_counterpoint' as AdvancedCounterpointTechnique, label: 'Double Counterpoint', description: 'Invertible at the octave, 10th, or 12th' },
      { value: 'triple_counterpoint' as AdvancedCounterpointTechnique, label: 'Triple Counterpoint', description: 'Three-voice invertible counterpoint' },
      { value: 'quadruple_counterpoint' as AdvancedCounterpointTechnique, label: 'Quadruple Counterpoint', description: 'Four-voice invertible counterpoint' }
    ]
  },
  structural: {
    name: 'Structural Techniques',
    icon: '🏗️',
    techniques: [
      { value: 'stretto' as AdvancedCounterpointTechnique, label: 'Stretto', description: 'Overlapping imitative entries' },
      { value: 'voice_exchange' as AdvancedCounterpointTechnique, label: 'Voice Exchange', description: 'Voices swap melodic material' },
      { value: 'pedal_point' as AdvancedCounterpointTechnique, label: 'Pedal Point', description: 'Sustained note with moving voices above' },
      { value: 'ostinato' as AdvancedCounterpointTechnique, label: 'Ostinato', description: 'Repeated melodic pattern' }
    ]
  },
  variation: {
    name: 'Variation Forms',
    icon: '🌊',
    techniques: [
      { value: 'passacaglia' as AdvancedCounterpointTechnique, label: 'Passacaglia', description: 'Variations over repeated bass line' },
      { value: 'chaconne' as AdvancedCounterpointTechnique, label: 'Chaconne', description: 'Variations over repeated harmonic progression' }
    ]
  },
  sequential: {
    name: 'Sequential Techniques',
    icon: '📈',
    techniques: [
      { value: 'sequence_ascending' as AdvancedCounterpointTechnique, label: 'Ascending Sequence', description: 'Pattern repeated at higher pitches' },
      { value: 'sequence_descending' as AdvancedCounterpointTechnique, label: 'Descending Sequence', description: 'Pattern repeated at lower pitches' },
      { value: 'sequence_modulating' as AdvancedCounterpointTechnique, label: 'Modulating Sequence', description: 'Sequence that changes key' },
      { value: 'sequence_circle_fifths' as AdvancedCounterpointTechnique, label: 'Circle of Fifths', description: 'Sequence following circle of fifths' }
    ]
  }
};

const VOICE_LEADING_STYLES: { value: VoiceLeadingType; label: string; description: string }[] = [
  { value: 'strict', label: 'Strict', description: 'Rigorous traditional rules' },
  { value: 'free', label: 'Free', description: 'More flexible voice leading' },
  { value: 'modern', label: 'Modern', description: 'Contemporary voice leading' },
  { value: 'renaissance', label: 'Renaissance', description: 'Palestrina style' },
  { value: 'baroque', label: 'Baroque', description: 'Bach style' },
  { value: 'contemporary', label: 'Contemporary', description: 'Modern techniques' }
];

const COUNTERPOINT_STYLES: { value: CounterpointStyle; label: string; description: string; period: string }[] = [
  { value: 'palestrina', label: 'Palestrina', description: 'Pure modal counterpoint, strict voice leading', period: 'Renaissance (1525-1594)' },
  { value: 'bach', label: 'Bach', description: 'Fugal complexity, chromatic harmony, contrapuntal mastery', period: 'Baroque (1685-1750)' },
  { value: 'handel', label: 'Handel', description: 'Homophonic clarity, dramatic contrasts, grand style', period: 'Baroque (1685-1759)' },
  { value: 'mozart', label: 'Mozart', description: 'Elegant balance, transparent texture, classical perfection', period: 'Classical (1756-1791)' },
  { value: 'beethoven', label: 'Beethoven', description: 'Dramatic development, motivic work, heroic style', period: 'Classical/Romantic (1770-1827)' },
  { value: 'brahms', label: 'Brahms', description: 'Dense harmony, contrapuntal richness, late Romantic', period: 'Romantic (1833-1897)' },
  { value: 'schumann', label: 'Schumann', description: 'Lyrical expression, harmonic color, poetic character', period: 'Romantic (1810-1856)' },
  { value: 'chopin', label: 'Chopin', description: 'Expressive chromaticism, melodic ornamentation, rubato', period: 'Romantic (1810-1849)' },
  { value: 'debussy', label: 'Debussy', description: 'Modal/whole-tone scales, parallel motion, impressionism', period: 'Impressionist (1862-1918)' },
  { value: 'bartok', label: 'Bartók', description: 'Folk elements, quartal harmony, rhythmic complexity', period: '20th Century (1881-1945)' },
  { value: 'contemporary', label: 'Contemporary', description: 'Extended techniques, serial methods, free atonality', period: 'Modern (1950-present)' }
];

const DISSONANCE_TREATMENTS: { value: DissonanceTreatment; label: string; description: string }[] = [
  { value: 'strict_resolution', label: 'Strict Resolution', description: 'Traditional preparation and resolution' },
  { value: 'free_resolution', label: 'Free Resolution', description: 'Flexible dissonance treatment' },
  { value: 'modern_treatment', label: 'Modern Treatment', description: 'Extended harmony techniques' },
  { value: 'chromatic_treatment', label: 'Chromatic Treatment', description: 'Heavy use of chromaticism' }
];

const NOTE_VALUES: NoteValue[] = ['whole', 'half', 'quarter', 'eighth', 'sixteenth', 'dotted-half', 'dotted-quarter'];

export function AdvancedCounterpointComposer({
  theme,
  bachVariables,
  onBachVariablesChange,
  selectedMode,
  selectedKeySignature,
  onCounterpointGenerated
}: AdvancedCounterpointComposerProps) {
  
  // Error handling
  const { handleCounterpointError, handleValidationError, safeExecute } = useErrorHandler();
  
  // State for parameters
  const [selectedTechnique, setSelectedTechnique] = useState<AdvancedCounterpointTechnique>('species_first');
  const [numVoices, setNumVoices] = useState([2]);
  const [voiceLeadingStyle, setVoiceLeadingStyle] = useState<VoiceLeadingType>('strict');
  const [dissonanceTreatment, setDissonanceTreatment] = useState<DissonanceTreatment>('strict_resolution');
  const [counterpointStyle, setCounterpointStyle] = useState<CounterpointStyle>('palestrina');
  
  // Advanced parameters
  const [cantusFirmusDuration, setCantusFirmusDuration] = useState<NoteValue>('whole');
  const [counterpointDuration, setCounterpointDuration] = useState<NoteValue>('half');
  const [speciesRatio, setSpeciesRatio] = useState('2:1');
  const [allowSyncopation, setAllowSyncopation] = useState(true);
  
  // Canon parameters
  const [canonInterval, setCanonInterval] = useState([7]); // Perfect fifth
  const [canonDelay, setCanonDelay] = useState([1]);
  const [canonStrict, setCanonStrict] = useState(true);
  
  // Voice leading constraints
  const [maxLeap, setMaxLeap] = useState([12]); // Octave
  const [preferStepwise, setPreferStepwise] = useState(true);
  const [allowVoiceCrossing, setAllowVoiceCrossing] = useState(false);
  const [allowParallelFifths, setAllowParallelFifths] = useState(false);
  const [allowParallelOctaves, setAllowParallelOctaves] = useState(false);
  
  // Quality control
  const [errorTolerance, setErrorTolerance] = useState([0.2]);
  const [minQualityThreshold, setMinQualityThreshold] = useState([0.6]);
  const [maxIterations, setMaxIterations] = useState([50]);
  const [enableSelfCorrection, setEnableSelfCorrection] = useState(true);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [lastResult, setLastResult] = useState<AdvancedCounterpointResult | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'analysis'>('basic');

  // Create parameters object
  const createParameters = useCallback((): AdvancedCounterpointParameters => {
    return {
      technique: selectedTechnique,
      num_voices: numVoices[0],
      voice_leading_style: voiceLeadingStyle,
      dissonance_treatment: dissonanceTreatment,
      counterpoint_style: counterpointStyle,
      
      cantus_firmus_duration: cantusFirmusDuration,
      counterpoint_duration: counterpointDuration,
      species_ratio: speciesRatio,
      allow_syncopation: allowSyncopation,
      
      canon_interval: canonInterval[0],
      canon_delay: canonDelay[0],
      canon_strict: canonStrict,
      canon_finite: true,
      
      use_complex_rhythms: false,
      allow_polyrhythm: false,
      rhythmic_complexity: 0.5,
      hemiola_frequency: 0.1,
      
      max_leap: maxLeap[0],
      prefer_stepwise: preferStepwise,
      allow_voice_crossing: allowVoiceCrossing,
      allow_parallel_fifths: allowParallelFifths,
      allow_parallel_octaves: allowParallelOctaves,
      
      require_dissonance_preparation: dissonanceTreatment === 'strict_resolution',
      require_dissonance_resolution: dissonanceTreatment !== 'modern_treatment',
      allow_unprepared_dissonance: dissonanceTreatment === 'modern_treatment',
      chromatic_alterations: dissonanceTreatment === 'chromatic_treatment',
      
      preserve_modal_character: true,
      modal_final_emphasis: 0.8,
      avoid_leading_tone: counterpointStyle === 'palestrina',
      
      use_invertible_counterpoint: selectedTechnique.includes('invertible') || selectedTechnique.includes('counterpoint'),
      inversion_interval: 12,
      use_augmentation: selectedTechnique.includes('augmentation'),
      use_diminution: selectedTechnique.includes('diminution'),
      augmentation_ratio: 2,
      diminution_ratio: 0.5,
      
      error_tolerance: errorTolerance[0],
      min_quality_threshold: minQualityThreshold[0],
      max_iterations: maxIterations[0],
      enable_self_correction: enableSelfCorrection
    };
  }, [
    selectedTechnique, numVoices, voiceLeadingStyle, dissonanceTreatment, counterpointStyle,
    cantusFirmusDuration, counterpointDuration, speciesRatio, allowSyncopation,
    canonInterval, canonDelay, canonStrict, maxLeap, preferStepwise, allowVoiceCrossing,
    allowParallelFifths, allowParallelOctaves, errorTolerance, minQualityThreshold,
    maxIterations, enableSelfCorrection
  ]);

  // Generate counterpoint with comprehensive error handling
  const handleGenerate = useCallback(async () => {
    const result = await safeExecute(
      async () => {
        // Input validation
        if (!theme || theme.length === 0) {
          handleValidationError('Please create a theme first', 'theme', theme);
          toast.error('Please create a theme first');
          return;
        }

        if (theme.length > 32) {
          handleValidationError('Theme too long for advanced counterpoint', 'theme.length', theme.length);
          toast.warning('Theme is very long - this may take time or cause memory issues');
        }

        setIsGenerating(true);
        setGenerationProgress(0);
        
        // Simulate progress with better timing
        const progressInterval = setInterval(() => {
          setGenerationProgress(prev => {
            if (prev < 30) return prev + 15;
            if (prev < 70) return prev + 8;
            return Math.min(prev + 5, 90);
          });
        }, 300);

        try {
          const parameters = createParameters();
          
          // Log generation attempt
          console.log('🎼 Starting advanced counterpoint generation:', {
            technique: selectedTechnique,
            style: counterpointStyle,
            voices: numVoices[0],
            themeLength: theme.length,
            voiceLeadingStyle: voiceLeadingStyle,
            dissonanceTreatment: dissonanceTreatment
          });

          // Validate parameters before generation
          if (numVoices[0] > 4 && selectedTechnique.includes('canon')) {
            handleValidationError('Too many voices for canon technique', 'numVoices', numVoices[0]);
            toast.warning('Reducing to 4 voices for canon technique complexity');
            setNumVoices([4]);
          }

          const result = await AdvancedCounterpointEngine.generateAdvancedCounterpoint(theme, parameters);
          
          clearInterval(progressInterval);
          setGenerationProgress(100);
          
          setLastResult(result);
          
          // Convert to themes for compatibility
          const generatedThemes = AdvancedCounterpointEngine.resultToThemes(result);
          
          if (onCounterpointGenerated) {
            onCounterpointGenerated(
              generatedThemes, 
              `Advanced ${selectedTechnique.replace('_', ' ')}`,
              result.analysis
            );
          }

          // Report results with detailed feedback
          if (result.errors.length > 0) {
            const errorCount = result.errors.length;
            const criticalErrors = result.errors.filter(e => e.errorType === 'voice_leading' || e.errorType === 'structural');
            
            if (criticalErrors.length > 0) {
              toast.error(`Generation completed with ${criticalErrors.length} critical error${criticalErrors.length > 1 ? 's' : ''}`);
            } else {
              toast.warning(`Generated with ${errorCount} warning${errorCount > 1 ? 's' : ''} - check analysis tab`);
            }
          } else {
            const qualityPercent = Math.round(result.quality_score * 100);
            const qualityLabel = qualityPercent >= 80 ? 'Excellent' : 
                               qualityPercent >= 60 ? 'Good' : 
                               qualityPercent >= 40 ? 'Fair' : 'Needs Improvement';
            
            toast.success(`Advanced counterpoint generated! Quality: ${qualityLabel} (${qualityPercent}%)`);
          }

          if (result.warnings.length > 0) {
            console.warn('🎼 Counterpoint generation warnings:', result.warnings);
          }

          // Log successful completion
          console.log('✅ Advanced counterpoint generation completed:', {
            voices: generatedThemes.length,
            quality: Math.round(result.quality_score * 100),
            errors: result.errors.length,
            warnings: result.warnings.length,
            technique: result.technique_applied
          });

        } finally {
          clearInterval(progressInterval);
        }
      },
      'counterpoint',
      {
        technique: selectedTechnique,
        style: counterpointStyle,
        voices: numVoices[0],
        themeLength: theme?.length
      }
    );

    // Always ensure UI state is reset
    setIsGenerating(false);
    setGenerationProgress(0);
    
  }, [
    theme, 
    createParameters, 
    selectedTechnique, 
    counterpointStyle, 
    numVoices, 
    voiceLeadingStyle,
    dissonanceTreatment,
    onCounterpointGenerated,
    handleValidationError,
    safeExecute
  ]);

  // Reset parameters to defaults
  const handleReset = useCallback(() => {
    setSelectedTechnique('species_first');
    setNumVoices([2]);
    setVoiceLeadingStyle('strict');
    setDissonanceTreatment('strict_resolution');
    setCounterpointStyle('palestrina');
    setCantusFirmusDuration('whole');
    setCounterpointDuration('half');
    setSpeciesRatio('2:1');
    setAllowSyncopation(true);
    setCanonInterval([7]);
    setCanonDelay([1]);
    setCanonStrict(true);
    setMaxLeap([12]);
    setPreferStepwise(true);
    setAllowVoiceCrossing(false);
    setAllowParallelFifths(false);
    setAllowParallelOctaves(false);
    setErrorTolerance([0.2]);
    setMinQualityThreshold([0.6]);
    setMaxIterations([50]);
    setEnableSelfCorrection(true);
    toast.success('Parameters reset to defaults');
  }, []);

  // Get current technique info
  const getCurrentTechniqueInfo = () => {
    for (const category of Object.values(TECHNIQUE_CATEGORIES)) {
      const technique = category.techniques.find(t => t.value === selectedTechnique);
      if (technique) return { category, technique };
    }
    return null;
  };

  const techniqueInfo = getCurrentTechniqueInfo();

  if (!theme || theme.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
        <div className="text-center">
          <Music4 className="w-12 h-12 mx-auto mb-4 text-purple-400" />
          <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100 mb-2">
            Advanced Counterpoint Engine
          </h3>
          <p className="text-purple-700 dark:text-purple-300 text-sm">
            Create a theme first to begin advanced counterpoint composition
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Music4 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              Advanced Counterpoint Engine
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Professional algorithmic counterpoint with comprehensive techniques
            </p>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          {lastResult && (
            <Badge 
              variant="outline" 
              className={`${
                lastResult.quality_score > 0.8 ? 'border-green-300 text-green-700' :
                lastResult.quality_score > 0.6 ? 'border-yellow-300 text-yellow-700' :
                'border-red-300 text-red-700'
              }`}
            >
              Quality: {Math.round(lastResult.quality_score * 100)}%
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Generating Advanced Counterpoint...
            </span>
            <span className="text-sm text-purple-600 dark:text-purple-400">
              {generationProgress}%
            </span>
          </div>
          <Progress value={generationProgress} className="h-2" />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'basic' | 'advanced' | 'analysis')} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="gap-2">
            <Target className="w-4 h-4" />
            Basic Setup
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <Settings className="w-4 h-4" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-2" disabled={!lastResult}>
            <TrendingUp className="w-4 h-4" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6 mt-6">
          {/* Technique Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Counterpoint Technique
            </Label>
            
            {/* Current Selection Info */}
            {techniqueInfo && (
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{techniqueInfo.category.icon}</span>
                  <Badge variant="secondary">{techniqueInfo.category.name}</Badge>
                </div>
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">
                  {techniqueInfo.technique.label}
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {techniqueInfo.technique.description}
                </p>
              </div>
            )}

            {/* Technique Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(TECHNIQUE_CATEGORIES).map(([key, category]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      {category.name}
                    </span>
                  </div>
                  <Select 
                    value={category.techniques.some(t => t.value === selectedTechnique) ? selectedTechnique : ''} 
                    onValueChange={(value) => setSelectedTechnique(value as AdvancedCounterpointTechnique)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select ${category.name.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {category.techniques.map((technique) => (
                        <SelectItem key={technique.value} value={technique.value}>
                          <div>
                            <div className="font-medium">{technique.label}</div>
                            <div className="text-xs text-muted-foreground">{technique.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Basic Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Number of Voices: {numVoices[0]}
              </Label>
              <Slider
                value={numVoices}
                onValueChange={setNumVoices}
                min={2}
                max={6}
                step={1}
                className="w-full"
              />
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Counterpoint Style
                </Label>
                <Select value={counterpointStyle} onValueChange={(value) => setCounterpointStyle(value as CounterpointStyle)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTERPOINT_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div>
                          <div className="font-medium">{style.label}</div>
                          <div className="text-xs text-muted-foreground">{style.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Voice Leading Style
                </Label>
                <Select value={voiceLeadingStyle} onValueChange={(value) => setVoiceLeadingStyle(value as VoiceLeadingType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICE_LEADING_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div>
                          <div className="font-medium">{style.label}</div>
                          <div className="text-xs text-muted-foreground">{style.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Dissonance Treatment
                </Label>
                <Select value={dissonanceTreatment} onValueChange={(value) => setDissonanceTreatment(value as DissonanceTreatment)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISSONANCE_TREATMENTS.map((treatment) => (
                      <SelectItem key={treatment.value} value={treatment.value}>
                        <div>
                          <div className="font-medium">{treatment.label}</div>
                          <div className="text-xs text-muted-foreground">{treatment.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Generate Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-purple-700 dark:text-purple-300">
              Theme: {theme.length} notes • Mode: {selectedMode?.name || 'None'} • Key: {selectedKeySignature?.name || 'C Major'}
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !theme || theme.length === 0}
              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate Advanced Counterpoint
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          {/* Species-specific parameters */}
          {selectedTechnique.startsWith('species_') && (
            <div className="space-y-4">
              <h4 className="font-medium text-purple-900 dark:text-purple-100">Species Parameters</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Cantus Firmus Duration</Label>
                  <Select value={cantusFirmusDuration} onValueChange={(value) => setCantusFirmusDuration(value as NoteValue)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_VALUES.map((value) => (
                        <SelectItem key={value} value={value}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Counterpoint Duration</Label>
                  <Select value={counterpointDuration} onValueChange={(value) => setCounterpointDuration(value as NoteValue)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_VALUES.map((value) => (
                        <SelectItem key={value} value={value}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Species Ratio</Label>
                  <Select value={speciesRatio} onValueChange={setSpeciesRatio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">1:1</SelectItem>
                      <SelectItem value="2:1">2:1</SelectItem>
                      <SelectItem value="3:1">3:1</SelectItem>
                      <SelectItem value="4:1">4:1</SelectItem>
                      <SelectItem value="5:1">5:1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="allow-syncopation"
                  checked={allowSyncopation}
                  onCheckedChange={setAllowSyncopation}
                />
                <Label htmlFor="allow-syncopation" className="text-sm">Allow Syncopation</Label>
              </div>
            </div>
          )}

          {/* Canon-specific parameters */}
          {selectedTechnique.startsWith('canon_') && (
            <div className="space-y-4">
              <h4 className="font-medium text-purple-900 dark:text-purple-100">Canon Parameters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Canon Interval: {canonInterval[0]} semitones</Label>
                    <Slider
                      value={canonInterval}
                      onValueChange={setCanonInterval}
                      min={-12}
                      max={12}
                      step={1}
                      className="w-full mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Canon Delay: {canonDelay[0]} beats</Label>
                    <Slider
                      value={canonDelay}
                      onValueChange={setCanonDelay}
                      min={0}
                      max={8}
                      step={1}
                      className="w-full mt-2"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="canon-strict"
                      checked={canonStrict}
                      onCheckedChange={setCanonStrict}
                    />
                    <Label htmlFor="canon-strict" className="text-sm">Strict Canon (exact imitation)</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Voice Leading Constraints */}
          <div className="space-y-4">
            <h4 className="font-medium text-purple-900 dark:text-purple-100">Voice Leading Constraints</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Maximum Leap: {maxLeap[0]} semitones</Label>
                  <Slider
                    value={maxLeap}
                    onValueChange={setMaxLeap}
                    min={1}
                    max={24}
                    step={1}
                    className="w-full mt-2"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="prefer-stepwise"
                    checked={preferStepwise}
                    onCheckedChange={setPreferStepwise}
                  />
                  <Label htmlFor="prefer-stepwise" className="text-sm">Prefer Stepwise Motion</Label>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-voice-crossing"
                    checked={allowVoiceCrossing}
                    onCheckedChange={setAllowVoiceCrossing}
                  />
                  <Label htmlFor="allow-voice-crossing" className="text-sm">Allow Voice Crossing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-parallel-fifths"
                    checked={allowParallelFifths}
                    onCheckedChange={setAllowParallelFifths}
                  />
                  <Label htmlFor="allow-parallel-fifths" className="text-sm">Allow Parallel Fifths</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-parallel-octaves"
                    checked={allowParallelOctaves}
                    onCheckedChange={setAllowParallelOctaves}
                  />
                  <Label htmlFor="allow-parallel-octaves" className="text-sm">Allow Parallel Octaves</Label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quality Control */}
          <div className="space-y-4">
            <h4 className="font-medium text-purple-900 dark:text-purple-100">Quality Control</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Error Tolerance: {Math.round(errorTolerance[0] * 100)}%</Label>
                  <Slider
                    value={errorTolerance}
                    onValueChange={setErrorTolerance}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Quality Threshold: {Math.round(minQualityThreshold[0] * 100)}%</Label>
                  <Slider
                    value={minQualityThreshold}
                    onValueChange={setMinQualityThreshold}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full mt-2"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Max Iterations: {maxIterations[0]}</Label>
                  <Slider
                    value={maxIterations}
                    onValueChange={setMaxIterations}
                    min={10}
                    max={200}
                    step={10}
                    className="w-full mt-2"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-self-correction"
                    checked={enableSelfCorrection}
                    onCheckedChange={setEnableSelfCorrection}
                  />
                  <Label htmlFor="enable-self-correction" className="text-sm">Enable Self-Correction</Label>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6 mt-6">
          {lastResult ? (
            <div className="space-y-6">
              {/* Quality Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Overall Quality</p>
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(lastResult.quality_score * 100)}%
                      </p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Voices Generated</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {lastResult.voices.length}
                      </p>
                    </div>
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Errors</p>
                      <p className="text-2xl font-bold text-red-600">
                        {lastResult.errors.length}
                      </p>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Warnings</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {lastResult.warnings.length}
                      </p>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  </div>
                </Card>
              </div>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-medium mb-4">Analysis Metrics</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Voice Leading Quality</span>
                        <span>{Math.round(lastResult.analysis.voice_leading_quality * 100)}%</span>
                      </div>
                      <Progress value={lastResult.analysis.voice_leading_quality * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Dissonance Percentage</span>
                        <span>{Math.round(lastResult.analysis.dissonance_percentage)}%</span>
                      </div>
                      <Progress value={lastResult.analysis.dissonance_percentage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Rhythmic Complexity</span>
                        <span>{Math.round(lastResult.analysis.rhythmic_complexity * 100)}%</span>
                      </div>
                      <Progress value={lastResult.analysis.rhythmic_complexity * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Modal Adherence</span>
                        <span>{Math.round(lastResult.analysis.modal_adherence * 100)}%</span>
                      </div>
                      <Progress value={lastResult.analysis.modal_adherence * 100} className="h-2" />
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-4">Generation Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Technique:</span>
                      <Badge variant="outline">{lastResult.technique_applied.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Measures:</span>
                      <span>{lastResult.analysis.total_measures}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Style:</span>
                      <span>{lastResult.parameters_used.counterpoint_style}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Voice Leading:</span>
                      <span>{lastResult.parameters_used.voice_leading_style}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Errors and Warnings */}
              {(lastResult.errors.length > 0 || lastResult.warnings.length > 0) && (
                <div className="space-y-4">
                  {lastResult.errors.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-2">Errors ({lastResult.errors.length}):</div>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {lastResult.errors.slice(0, 5).map((error, index) => (
                            <li key={index}>
                              {error.message}
                              {error.suggestion && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Suggestion: {error.suggestion}
                                </div>
                              )}
                            </li>
                          ))}
                          {lastResult.errors.length > 5 && (
                            <li className="text-muted-foreground">...and {lastResult.errors.length - 5} more</li>
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {lastResult.warnings.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-2">Warnings ({lastResult.warnings.length}):</div>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {lastResult.warnings.slice(0, 5).map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                          {lastResult.warnings.length > 5 && (
                            <li className="text-muted-foreground">...and {lastResult.warnings.length - 5} more</li>
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Analysis Available</h3>
              <p className="text-muted-foreground text-sm">
                Generate advanced counterpoint to see detailed analysis and quality metrics.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}