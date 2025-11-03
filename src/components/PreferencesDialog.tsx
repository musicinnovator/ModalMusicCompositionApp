import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Settings, Palette, Download, Upload, Piano, Keyboard, Wrench, BookOpen, Info, Sparkles } from 'lucide-react';
import { Slider } from './ui/slider';
import { MidiIO } from './MidiIO';
import { toast } from 'sonner@2.0.3';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
// Test components imports
import { ModalSystemTest } from './ModalSystemTest';
import { ModeScaleTest } from './ModeScaleTest';
import { ModeKeySignatureFix } from './ModeKeySignatureFix';
import { ModeIntegrationDebug } from './ModeIntegrationDebug';
import { ErrorBoundary } from './ErrorBoundary';
import { ModeCategory, Mode, KeySignature } from '../types/musical';
import { useErrorHandler } from '../lib/error-handling';
import { ErrorDebugPanel } from './ErrorDebugPanel';
import { UITheme, UI_THEMES, applyUITheme, getThemesByCategory, getThemeCategories } from '../lib/ui-themes';

export type BackgroundTheme = 
  | 'indigo-purple' 
  | 'blue-cyan' 
  | 'green-emerald' 
  | 'orange-red' 
  | 'pink-rose' 
  | 'dark-slate'
  | 'amber-gold'
  | 'teal-aqua'
  | 'violet-lavender'
  | 'crimson-ruby'
  | 'navy-midnight'
  | 'charcoal-gray'
  | 'lime-mint'
  | 'coral-peach'
  | 'electric-blue'
  | 'deep-purple'
  | 'silver-metal'
  | 'bronze-copper';

interface BackgroundConfig {
  name: string;
  gradient: string;
  preview: string;
}

export const BACKGROUND_THEMES: Record<BackgroundTheme, BackgroundConfig> = {
  'indigo-purple': {
    name: 'Indigo Purple (Default)',
    gradient: 'bg-gradient-to-br from-background via-background to-muted/30',
    preview: 'bg-gradient-to-br from-indigo-100 to-purple-100'
  },
  'blue-cyan': {
    name: 'Ocean Blue',
    gradient: 'bg-gradient-to-br from-blue-50 via-background to-cyan-50/30',
    preview: 'bg-gradient-to-br from-blue-100 to-cyan-100'
  },
  'green-emerald': {
    name: 'Forest Green',
    gradient: 'bg-gradient-to-br from-green-50 via-background to-emerald-50/30',
    preview: 'bg-gradient-to-br from-green-100 to-emerald-100'
  },
  'orange-red': {
    name: 'Sunset Orange',
    gradient: 'bg-gradient-to-br from-orange-50 via-background to-red-50/30',
    preview: 'bg-gradient-to-br from-orange-100 to-red-100'
  },
  'pink-rose': {
    name: 'Rose Pink',
    gradient: 'bg-gradient-to-br from-pink-50 via-background to-rose-50/30',
    preview: 'bg-gradient-to-br from-pink-100 to-rose-100'
  },
  'dark-slate': {
    name: 'Dark Slate',
    gradient: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    preview: 'bg-gradient-to-br from-slate-600 to-slate-800'
  },
  'amber-gold': {
    name: 'Amber Gold',
    gradient: 'bg-gradient-to-br from-amber-50 via-background to-yellow-50/30',
    preview: 'bg-gradient-to-br from-amber-200 to-yellow-300'
  },
  'teal-aqua': {
    name: 'Teal Aqua',
    gradient: 'bg-gradient-to-br from-teal-50 via-background to-cyan-50/30',
    preview: 'bg-gradient-to-br from-teal-200 to-cyan-300'
  },
  'violet-lavender': {
    name: 'Violet Lavender',
    gradient: 'bg-gradient-to-br from-violet-50 via-background to-purple-50/30',
    preview: 'bg-gradient-to-br from-violet-200 to-purple-300'
  },
  'crimson-ruby': {
    name: 'Crimson Ruby',
    gradient: 'bg-gradient-to-br from-red-50 via-background to-rose-50/30',
    preview: 'bg-gradient-to-br from-red-300 to-rose-400'
  },
  'navy-midnight': {
    name: 'Navy Midnight',
    gradient: 'bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900',
    preview: 'bg-gradient-to-br from-blue-800 to-indigo-900'
  },
  'charcoal-gray': {
    name: 'Charcoal Gray',
    gradient: 'bg-gradient-to-br from-gray-800 via-slate-800 to-zinc-800',
    preview: 'bg-gradient-to-br from-gray-600 to-zinc-700'
  },
  'lime-mint': {
    name: 'Lime Mint',
    gradient: 'bg-gradient-to-br from-lime-50 via-background to-green-50/30',
    preview: 'bg-gradient-to-br from-lime-200 to-green-300'
  },
  'coral-peach': {
    name: 'Coral Peach',
    gradient: 'bg-gradient-to-br from-orange-50 via-background to-pink-50/30',
    preview: 'bg-gradient-to-br from-orange-200 to-pink-300'
  },
  'electric-blue': {
    name: 'Electric Blue',
    gradient: 'bg-gradient-to-br from-sky-50 via-background to-blue-50/30',
    preview: 'bg-gradient-to-br from-sky-300 to-blue-400'
  },
  'deep-purple': {
    name: 'Deep Purple',
    gradient: 'bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900',
    preview: 'bg-gradient-to-br from-purple-700 to-indigo-800'
  },
  'silver-metal': {
    name: 'Silver Metal',
    gradient: 'bg-gradient-to-br from-slate-200 via-background to-gray-200/30',
    preview: 'bg-gradient-to-br from-slate-300 to-gray-400'
  },
  'bronze-copper': {
    name: 'Bronze Copper',
    gradient: 'bg-gradient-to-br from-orange-50 via-background to-amber-50/30',
    preview: 'bg-gradient-to-br from-orange-300 to-amber-400'
  }
};

interface SessionData {
  theme: number[];
  selectedMode: any;
  generatedParts: any[];
  generationType: string | null;
  preferences: {
    backgroundTheme: BackgroundTheme;
    selectedInstrument: string;
  };
  timestamp: string;
}

interface PreferencesDialogProps {
  backgroundTheme: BackgroundTheme;
  onBackgroundThemeChange: (theme: BackgroundTheme) => void;
  sessionData: SessionData;
  onLoadSession: (data: SessionData) => void;
  pianoOctaveRange?: number;
  pianoStartOctave?: number;
  onPianoOctaveRangeChange?: (range: number) => void;
  onPianoStartOctaveChange?: (octave: number) => void;
  onMidiNotesRecorded?: (notes: number[]) => void;
  selectedInstrument?: string;
  // Test components props
  modeCategories?: ModeCategory[];
  selectedMode?: Mode | null;
  selectedKeySignature?: KeySignature | null;
  // UI Theme props
  uiTheme?: UITheme;
  onUIThemeChange?: (theme: UITheme) => void;
  isDarkMode?: boolean;
  onDarkModeToggle?: () => void;
}

export function PreferencesDialog({ 
  backgroundTheme, 
  onBackgroundThemeChange, 
  sessionData,
  onLoadSession,
  pianoOctaveRange = 1.5,
  pianoStartOctave = 4,
  onPianoOctaveRangeChange,
  onPianoStartOctaveChange,
  onMidiNotesRecorded,
  selectedInstrument = 'piano',
  modeCategories = [],
  selectedMode,
  selectedKeySignature,
  uiTheme = 'modern-dark-slate',
  onUIThemeChange,
  isDarkMode = false,
  onDarkModeToggle
}: PreferencesDialogProps) {
  const [open, setOpen] = useState(false);
  const { getErrorStats, clearHistory, exportErrorLog } = useErrorHandler();
  const [selectedCategory, setSelectedCategory] = useState<'Modern Dark' | 'Classic Light' | 'Ultra Modern' | 'Hybrid'>('Modern Dark');

  const saveSession = () => {
    try {
      const dataStr = JSON.stringify(sessionData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `modal-fugue-session-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Session saved successfully!');
    } catch (error) {
      toast.error('Failed to save session');
      console.error('Save error:', error);
    }
  };

  const loadSession = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          onLoadSession(data);
          toast.success('Session loaded successfully!');
          setOpen(false);
        } catch (error) {
          toast.error('Failed to load session - invalid file format');
          console.error('Load error:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Preferences
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Preferences & Settings
          </DialogTitle>
          <DialogDescription>
            Customize your experience, manage sessions, and configure MIDI devices.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="ui-theme" className="w-full">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="ui-theme" className="gap-1 text-xs">
              <Sparkles className="w-3 h-3" />
              UI Theme
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1 text-xs">
              <Palette className="w-3 h-3" />
              Background
            </TabsTrigger>
            <TabsTrigger value="piano" className="gap-1 text-xs">
              <Piano className="w-3 h-3" />
              Piano
            </TabsTrigger>
            <TabsTrigger value="midi" className="gap-1 text-xs">
              <Keyboard className="w-3 h-3" />
              MIDI IO
            </TabsTrigger>
            <TabsTrigger value="session" className="gap-1 text-xs">
              <Settings className="w-3 h-3" />
              Session
            </TabsTrigger>
            <TabsTrigger value="how-to" className="gap-1 text-xs">
              <BookOpen className="w-3 h-3" />
              How To Use
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-1 text-xs">
              <Info className="w-3 h-3" />
              About
            </TabsTrigger>
            <TabsTrigger value="utilities" className="gap-1 text-xs">
              <Wrench className="w-3 h-3" />
              Utilities
            </TabsTrigger>
            <TabsTrigger value="debug" className="gap-1 text-xs">
              <Wrench className="w-3 h-3" />
              Debug
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ui-theme" className="space-y-6 mt-6">
            {/* UI Theme Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Complete UI Theme System</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose from 16+ professionally designed themes that control the entire application appearance
                  </p>
                </div>
                {onDarkModeToggle && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      try {
                        onDarkModeToggle();
                        toast.success(`Switched to ${isDarkMode ? 'light' : 'dark'} mode`);
                      } catch (error) {
                        console.error('Error toggling dark mode:', error);
                        toast.error('Failed to toggle dark mode');
                      }
                    }}
                    className="gap-2"
                  >
                    {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                  </Button>
                )}
              </div>

              {/* Category Tabs */}
              <Tabs value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  {getThemeCategories().map((category) => (
                    <TabsTrigger key={category} value={category} className="text-xs">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {getThemeCategories().map((category) => (
                  <TabsContent key={category} value={category} className="mt-4">
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="grid grid-cols-2 gap-3">
                        {getThemesByCategory(category).map((themeKey) => {
                          const config = UI_THEMES[themeKey];
                          return (
                            <Card
                              key={themeKey}
                              className={`p-3 cursor-pointer hover:shadow-md transition-all ${
                                uiTheme === themeKey ? 'ring-2 ring-primary shadow-lg' : ''
                              }`}
                              onClick={() => {
                                try {
                                  if (onUIThemeChange) {
                                    onUIThemeChange(themeKey);
                                    applyUITheme(themeKey, isDarkMode);
                                    toast.success(`Applied ${config.name}`);
                                  }
                                } catch (error) {
                                  console.error('Error applying UI theme:', error);
                                  toast.error('Failed to apply theme');
                                }
                              }}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium">{config.name.replace(category + ' - ', '')}</span>
                                  {uiTheme === themeKey && (
                                    <Badge variant="default" className="text-xs">Active</Badge>
                                  )}
                                </div>
                                <div 
                                  className="w-full h-16 rounded" 
                                  style={{ background: config.preview.background }}
                                />
                                <p className="text-xs text-muted-foreground">{config.description}</p>
                                <div className="flex gap-1">
                                  <div 
                                    className="w-6 h-6 rounded-full border-2 border-white" 
                                    style={{ backgroundColor: config.preview.primary }}
                                  />
                                  <div 
                                    className="w-6 h-6 rounded-full border-2 border-white" 
                                    style={{ backgroundColor: config.preview.secondary }}
                                  />
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>

              <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-3 rounded border border-blue-200 dark:border-blue-800">
                <strong>💡 Tip:</strong> UI themes change all interface colors including cards, buttons, borders, and text. 
                The background theme (next tab) only changes the page background gradient. You can combine both for maximum customization!
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6 mt-6">
            {/* Background Theme Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Background Theme</Label>
              <RadioGroup 
                value={backgroundTheme} 
                onValueChange={(value) => {
                  console.log('🎨 RadioGroup onValueChange triggered:', value);
                  onBackgroundThemeChange(value as BackgroundTheme);
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(BACKGROUND_THEMES).map(([key, config]) => (
                    <Card 
                      key={key} 
                      className={`p-3 cursor-pointer hover:shadow-md transition-all ${
                        backgroundTheme === key 
                          ? 'ring-2 ring-primary shadow-lg' 
                          : ''
                      }`}
                      onClick={() => {
                        console.log('🎨 Card clicked for theme:', key);
                        onBackgroundThemeChange(key as BackgroundTheme);
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={key} id={key} />
                        <Label 
                          htmlFor={key} 
                          className="cursor-pointer flex-1 text-xs"
                        >
                          {config.name}
                        </Label>
                      </div>
                      <div className={`w-full h-8 rounded mt-2 ${config.preview}`} />
                    </Card>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="piano" className="space-y-6 mt-6">
            {/* Piano Keyboard Settings */}
            {onPianoOctaveRangeChange && onPianoStartOctaveChange && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Piano Keyboard Configuration</Label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Octave Range: {pianoOctaveRange} octaves
                    </Label>
                    <Slider
                      value={[pianoOctaveRange]}
                      onValueChange={(value) => onPianoOctaveRangeChange(value[0])}
                      min={1}
                      max={3}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Starting Octave: {pianoStartOctave}
                    </Label>
                    <Slider
                      value={[pianoStartOctave]}
                      onValueChange={(value) => onPianoStartOctaveChange(value[0])}
                      min={2}
                      max={6}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                  <strong>Piano Settings:</strong> Configure the virtual piano keyboard's octave range and starting position. 
                  Wider ranges show more keys, higher starting octaves focus on higher pitched notes.
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="midi" className="space-y-6 mt-6">
            {/* MIDI IO Component */}
            <MidiIO
              onNotesRecorded={onMidiNotesRecorded}
              selectedInstrument={selectedInstrument}
            />
          </TabsContent>

          <TabsContent value="session" className="space-y-6 mt-6">
            {/* Session Management */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Session Management</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={saveSession} className="gap-2" variant="outline">
                  <Download className="w-4 h-4" />
                  Save Session
                </Button>
                <Button onClick={loadSession} className="gap-2" variant="outline">
                  <Upload className="w-4 h-4" />
                  Load Session
                </Button>
              </div>
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                <strong>Session includes:</strong> Current theme, selected mode, generated parts, instrument settings, 
                stability preferences, and piano configuration. Load saved sessions to restore your complete workspace.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="how-to" className="space-y-6 mt-6">
            {/* How To Use Guide */}
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
                <h3 className="mb-3 text-green-900 dark:text-green-100">
                  🎹 Input Methods & Octave Support
                </h3>
                <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                  <div>
                    <strong>Theme Composer:</strong> Use quick-add buttons (octave 4) or dropdown to build your melody note by note
                  </div>
                  <div>
                    <strong>Piano Keyboard:</strong> Click the virtual piano keys (2.5 octaves from C3) to add notes with exact octave information
                  </div>
                  <div>
                    <strong>Bach Variables:</strong> Switch to Bach Variables tab to route MIDI input to specific compositional variables (CF, FCP1, FCP2, etc.)
                  </div>
                  <div>
                    <strong>MIDI I/O:</strong> Connect physical MIDI devices via Preferences → MIDI IO for advanced recording and routing
                  </div>
                  <div>
                    <strong>Full Octave Range:</strong> All displays now show exact note names with octaves (C4, D#5, etc.) instead of just pitch classes
                  </div>
                  <div>
                    <strong>Auto-Generate:</strong> Use stability controls to create themes with different harmonic characteristics
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
                <h3 className="mb-3 text-orange-900 dark:text-orange-100">
                  Contemporary Counterpoint Theory
                </h3>
                <div className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
                  <div>
                    <strong>Texture Types:</strong> Rough (dissonant), Smooth (stepwise), Simple (basic), Complex (intricate), Dense (active), Sparse (spacious)
                  </div>
                  <div>
                    <strong>Musical Textures:</strong> Monophony (single line), Homophony (harmonized melody), Polyphony (multiple independent lines)
                  </div>
                  <div>
                    <strong>Consonant Intervals:</strong> P1, m3, M3, P5, m6, M6, P8 (stable, relaxed)
                  </div>
                  <div>
                    <strong>Dissonant Intervals:</strong> m2, M2, P4, A4/d5, m7, M7 (unstable, tension)
                  </div>
                  <div>
                    <strong>Species Counterpoint:</strong> First (1:1 note-against-note), Second (2:1 two-against-one), Third (4:1 four-against-one), Fourth (syncopation with suspensions), Fifth (florid mixture)
                  </div>
                  <div>
                    <strong>Rhythmic Counterpoint:</strong> Authentic species with proper note values - whole notes, half notes, quarter notes, creating true rhythmic relationships between cantus firmus and counterpoint voices
                  </div>
                  <div>
                    <strong>Voice Leading:</strong> Contrary motion preferred, parallel 5ths/8ves forbidden, smooth stepwise motion ideal
                  </div>
                  <div>
                    <strong>NCT Groups:</strong> Group 1 (step approach/resolution), Group 2 (leap approach or resolution)
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    How to Use Advanced Counterpoint
                  </h3>
                </div>
                
                <div className="space-y-3 text-sm text-green-800 dark:text-green-200">
                  <div className="flex items-start gap-2">
                    <span className="font-medium bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">1</span>
                    <span><strong>Create a Theme:</strong> Use the Theme Composer to build your cantus firmus melody</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">2</span>
                    <span><strong>Select Technique:</strong> Choose from 40+ counterpoint techniques organized by category</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">3</span>
                    <span><strong>Configure Style:</strong> Set historical style, voice leading rules, and dissonance treatment</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">4</span>
                    <span><strong>Advanced Settings:</strong> Fine-tune parameters like voice count, leap constraints, quality thresholds</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">5</span>
                    <span><strong>Generate & Analyze:</strong> Create counterpoint and review quality analysis with error reports</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-6 mt-6">
            {/* About and Features */}
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20 border-violet-200 dark:border-violet-800">
                <h3 className="mb-3 text-violet-900 dark:text-violet-100">
                  🌍 Enhanced Modal Theory System
                </h3>
                <div className="space-y-2 text-sm text-violet-800 dark:text-violet-200">
                  <div>
                    <strong>Global Coverage:</strong> 80+ modes from multiple world cultures (Western, Chinese, Japanese, Middle Eastern, Indian, European Folk, African, Native American, Blues/Jazz, Exotic, Microtonal)
                  </div>
                  <div>
                    <strong>Mode Mixing:</strong> Create hybrid modes by blending, alternating, or weighted combining of up to 6 modes simultaneously
                  </div>
                  <div>
                    <strong>Mode Alterations:</strong> Raise or lower any scale degree (2nd through 7th) to create custom variants
                  </div>
                  <div>
                    <strong>Smart Filtering:</strong> Find modes by characteristics (pentatonic, heptatonic, chromatic, interval types)
                  </div>
                  <div>
                    <strong>Relationship Analysis:</strong> Discover parallel, relative, similar, or contrasting modes automatically
                  </div>
                  <div>
                    <strong>Cultural Authenticity:</strong> Each mode preserves traditional interval patterns from its source culture
                  </div>
                  <div>
                    <strong>Advanced Integration:</strong> All modes work seamlessly with counterpoint, imitation, fugue, and stability controls
                  </div>
                </div>
              </Card>

              <Separator />

              {/* Counterpoint Techniques */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Counterpoint Techniques
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🎼</span>
                      <h4 className="font-medium">Species Counterpoint</h4>
                      <Badge variant="outline" className="text-xs">5 species</Badge>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• First Species (1:1) - Note against note</li>
                      <li>• Second Species (2:1) - Two against one</li>
                      <li>• Third Species (4:1) - Four against one</li>
                      <li>• Fourth Species - Syncopation</li>
                      <li>• Fifth Species (Florid) - Mixed ornamental</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🔄</span>
                      <h4 className="font-medium">Canon Techniques</h4>
                      <Badge variant="outline" className="text-xs">5 types</Badge>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Strict Canon - Exact imitation</li>
                      <li>• Free Canon - Flexible variations</li>
                      <li>• Crab Canon - Retrograde imitation</li>
                      <li>• Augmentation Canon - Slower values</li>
                      <li>• Diminution Canon - Faster values</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🔀</span>
                      <h4 className="font-medium">Invertible Counterpoint</h4>
                      <Badge variant="outline" className="text-xs">4 types</Badge>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Basic Invertible - Two-voice</li>
                      <li>• Double Counterpoint - At octave/10th/12th</li>
                      <li>• Triple Counterpoint - Three voices</li>
                      <li>• Quadruple Counterpoint - Four voices</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🌊</span>
                      <h4 className="font-medium">Advanced Techniques</h4>
                      <Badge variant="outline" className="text-xs">6+ techniques</Badge>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Stretto - Overlapping entries</li>
                      <li>• Voice Exchange - Material swapping</li>
                      <li>• Pedal Point - Sustained notes</li>
                      <li>• Ostinato - Repeated patterns</li>
                      <li>• Passacaglia & Chaconne</li>
                    </ul>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Historical Styles */}
              <div className="space-y-4">
                <h3 className="font-semibold">Historical Styles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Palestrina</h4>
                      <Badge variant="secondary" className="text-xs">16th C.</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Renaissance polyphonic perfection</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Bach</h4>
                      <Badge variant="secondary" className="text-xs">18th C.</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Baroque contrapuntal mastery</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Mozart</h4>
                      <Badge variant="secondary" className="text-xs">18th C.</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Classical elegance and clarity</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Brahms</h4>
                      <Badge variant="secondary" className="text-xs">19th C.</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Romantic harmonic richness</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Debussy</h4>
                      <Badge variant="secondary" className="text-xs">20th C.</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Impressionistic color and texture</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Contemporary</h4>
                      <Badge variant="secondary" className="text-xs">21st C.</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Modern extended techniques</p>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Advanced Algorithms */}
              <div className="space-y-4">
                <h3 className="font-semibold">Advanced Algorithms</h3>
                <div className="space-y-3">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Voice Leading Analysis</h4>
                    <p className="text-sm text-muted-foreground mb-2">Comprehensive analysis of melodic motion between voices</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Parallel motion detection</Badge>
                      <Badge variant="outline" className="text-xs">Hidden parallel prevention</Badge>
                      <Badge variant="outline" className="text-xs">Leap resolution checking</Badge>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Dissonance Treatment</h4>
                    <p className="text-sm text-muted-foreground mb-2">Sophisticated handling of consonance and dissonance</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Preparation analysis</Badge>
                      <Badge variant="outline" className="text-xs">Resolution validation</Badge>
                      <Badge variant="outline" className="text-xs">Chromatic support</Badge>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Modal Integration</h4>
                    <p className="text-sm text-muted-foreground mb-2">Full integration with 80+ world modal systems</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Modal final emphasis</Badge>
                      <Badge variant="outline" className="text-xs">Scale degree functionality</Badge>
                      <Badge variant="outline" className="text-xs">Cross-cultural compatibility</Badge>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="utilities" className="space-y-6 mt-6">
            {/* Debug and Testing Tools */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Debug & Testing Tools</Label>
                <Badge variant="secondary" className="text-xs">
                  Advanced Users
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-3 rounded border border-blue-200 dark:border-blue-800">
                <strong>🔧 Developer Utilities:</strong> These tools help debug modal system integration, 
                scale generation, and key signature functionality. Use them to verify that modes are 
                correctly transposed to different key signatures and that the "Available Notes" display 
                is working properly.
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                <ErrorBoundary>
                  <ModalSystemTest
                    modeCategories={modeCategories}
                  />
                </ErrorBoundary>

                <ErrorBoundary>
                  <ModeScaleTest
                    selectedMode={selectedMode}
                    selectedKeySignature={selectedKeySignature}
                  />
                </ErrorBoundary>

                <ErrorBoundary>
                  <ModeKeySignatureFix
                    selectedMode={selectedMode}
                    selectedKeySignature={selectedKeySignature}
                  />
                </ErrorBoundary>

                <ErrorBoundary>
                  <ModeIntegrationDebug
                    modeCategories={modeCategories}
                    selectedKeySignature={selectedKeySignature}
                  />
                </ErrorBoundary>
              </div>

              <div className="text-xs text-muted-foreground border-t pt-3">
                <strong>Note:</strong> These debugging tools are primarily for development and testing purposes. 
                They help ensure the modal system is working correctly across different key signatures and modes.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="debug" className="space-y-6 mt-6">
            {/* Error Handling and Debug Tools */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Error Handling & Debug Console</Label>
                <Badge variant="secondary" className="text-xs">
                  Development Tools
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground bg-red-50 dark:bg-red-950/30 p-3 rounded border border-red-200 dark:border-red-800">
                <strong>🐛 Error Monitoring:</strong> This panel shows system errors, counterpoint generation issues, 
                modal system problems, MIDI integration failures, and other technical details. Use this information 
                to troubleshoot problems and improve the application stability.
              </div>

              <ErrorDebugPanel 
                getErrorStats={getErrorStats}
                clearHistory={clearHistory}
                exportErrorLog={exportErrorLog}
              />

              <div className="text-xs text-muted-foreground border-t pt-3">
                <strong>Privacy Note:</strong> Error logs are stored locally in your browser and are not transmitted 
                to any external servers. Use the export function to save logs for debugging purposes.
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-6 pt-4 border-t">
          <Button onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}