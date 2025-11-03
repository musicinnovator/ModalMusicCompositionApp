import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Music4, 
  Users, 
  TrendingUp, 
  Settings, 
  Zap, 
  Shield, 
  BookOpen, 
  Wrench,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

export function CounterpointFeaturesSummary() {
  const features = [
    {
      category: 'Species Counterpoint',
      icon: '🎼',
      items: [
        'First Species (1:1) - Note against note with strict consonance rules',
        'Second Species (2:1) - Two notes against one with passing tones',
        'Third Species (4:1) - Four notes against one with stepwise motion',
        'Fourth Species - Syncopation with suspensions and resolutions',
        'Fifth Species (Florid) - Mixed species with ornamental freedom'
      ]
    },
    {
      category: 'Canon Techniques',
      icon: '🔄',
      items: [
        'Strict Canon - Exact imitation at specified interval and delay',
        'Free Canon - Flexible imitation with variations',
        'Crab Canon - Retrograde canon (backwards imitation)',
        'Augmentation Canon - Canon with slower note values',
        'Diminution Canon - Canon with faster note values'
      ]
    },
    {
      category: 'Invertible Counterpoint',
      icon: '🔀',
      items: [
        'Basic Invertible - Two-voice invertible counterpoint',
        'Double Counterpoint - Invertible at octave, 10th, or 12th',
        'Triple Counterpoint - Three-voice invertible counterpoint',
        'Quadruple Counterpoint - Four-voice invertible counterpoint'
      ]
    },
    {
      category: 'Advanced Techniques',
      icon: '🌊',
      items: [
        'Stretto - Overlapping imitative entries',
        'Voice Exchange - Voices swap melodic material', 
        'Pedal Point - Sustained note with moving voices above',
        'Ostinato - Repeated melodic pattern',
        'Passacaglia - Variations over repeated bass line',
        'Chaconne - Variations over repeated harmonic progression'
      ]
    },
    {
      category: 'Sequential Patterns',
      icon: '📈', 
      items: [
        'Ascending Sequence - Pattern repeated at higher pitches',
        'Descending Sequence - Pattern repeated at lower pitches',
        'Modulating Sequence - Sequence that changes key',
        'Circle of Fifths - Sequence following circle of fifths progression'
      ]
    }
  ];

  const styles = [
    { name: 'Palestrina', description: 'Renaissance polyphonic perfection', era: '16th Century' },
    { name: 'Bach', description: 'Baroque contrapuntal mastery', era: '18th Century' },
    { name: 'Mozart', description: 'Classical elegance and clarity', era: '18th Century' },
    { name: 'Brahms', description: 'Romantic harmonic richness', era: '19th Century' },
    { name: 'Debussy', description: 'Impressionistic color and texture', era: '20th Century' },
    { name: 'Bartók', description: '20th century folk-influenced modernism', era: '20th Century' },
    { name: 'Contemporary', description: 'Modern extended techniques', era: '21st Century' }
  ];

  const algorithms = [
    {
      name: 'Voice Leading Analysis',
      description: 'Comprehensive analysis of melodic motion between voices',
      features: ['Parallel motion detection', 'Hidden parallel prevention', 'Leap resolution checking']
    },
    {
      name: 'Dissonance Treatment',
      description: 'Sophisticated handling of consonance and dissonance',
      features: ['Preparation analysis', 'Resolution validation', 'Chromatic alteration support']
    },
    {
      name: 'Modal Integration',
      description: 'Full integration with 80+ world modal systems',
      features: ['Modal final emphasis', 'Scale degree functionality', 'Cross-cultural compatibility']
    },
    {
      name: 'Quality Assessment',
      description: 'Real-time quality scoring and error detection',
      features: ['Voice leading quality metrics', 'Harmonic analysis', 'Style adherence scoring']
    },
    {
      name: 'Self-Correction',
      description: 'Intelligent error correction and optimization',
      features: ['Automatic voice leading fixes', 'Quality threshold enforcement', 'Iterative improvement']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Music4 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-purple-900 dark:text-purple-100">
              Advanced Counterpoint Engine
            </h2>
            <p className="text-purple-700 dark:text-purple-300 text-sm">
              Professional-grade algorithmic counterpoint with comprehensive techniques and error handling
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-800 dark:text-purple-200">40+ Techniques</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-800 dark:text-purple-200">Up to 8 Voices</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-800 dark:text-purple-200">Error Handling</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-800 dark:text-purple-200">Quality Analysis</span>
          </div>
        </div>
      </Card>

      {/* Technique Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Counterpoint Techniques
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {features.map((category, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{category.icon}</span>
                <h4 className="font-medium">{category.category}</h4>
                <Badge variant="outline" className="text-xs">
                  {category.items.length} techniques
                </Badge>
              </div>
              <ul className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Historical Styles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Historical Styles
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {styles.map((style, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{style.name}</h4>
                <Badge variant="secondary" className="text-xs">{style.era}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{style.description}</p>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Advanced Algorithms */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Advanced Algorithms
        </h3>
        
        <div className="space-y-4">
          {algorithms.map((algorithm, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{algorithm.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{algorithm.description}</p>
                </div>
                <Wrench className="w-4 h-4 text-blue-500 mt-1" />
              </div>
              <div className="flex flex-wrap gap-2">
                {algorithm.features.map((feature, featureIndex) => (
                  <Badge key={featureIndex} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>



      {/* Usage Instructions */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
            How to Use Advanced Counterpoint
          </h3>
        </div>
        
        <div className="space-y-3 text-sm text-green-800 dark:text-green-200">
          <div className="flex items-start gap-2">
            <span className="font-medium bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
            <span><strong>Create a Theme:</strong> Use the Theme Composer to build your cantus firmus melody</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
            <span><strong>Select Technique:</strong> Choose from 40+ counterpoint techniques organized by category</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
            <span><strong>Configure Style:</strong> Set historical style, voice leading rules, and dissonance treatment</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
            <span><strong>Advanced Settings:</strong> Fine-tune parameters like voice count, leap constraints, quality thresholds</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">5</span>
            <span><strong>Generate & Analyze:</strong> Create counterpoint and review quality analysis with error reports</span>
          </div>
        </div>
      </Card>
    </div>
  );
}