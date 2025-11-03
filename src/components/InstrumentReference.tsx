import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Music, Piano, Violin, TrumpetIcon as Trumpet, Wind } from 'lucide-react';

export function InstrumentReference() {
  return (
    <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
      <div className="flex items-center gap-3 mb-4">
        <Music className="w-6 h-6 text-purple-600" />
        <div>
          <h3 className="font-semibold text-purple-900 dark:text-purple-100">
            Professional Instrument Library
          </h3>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            High-quality sampled instruments powered by MusyngKite Soundfont
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Keyboard Instruments */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Piano className="w-4 h-4 text-purple-600" />
            <h4 className="font-medium text-purple-900 dark:text-purple-100">Keyboard Instruments</h4>
            <Badge variant="outline" className="text-xs">8 instruments</Badge>
          </div>
          <div className="flex flex-wrap gap-2 ml-6">
            <Badge variant="secondary">Grand Piano</Badge>
            <Badge variant="secondary">Bright Piano</Badge>
            <Badge variant="secondary">Electric Grand</Badge>
            <Badge variant="secondary">Harpsichord</Badge>
            <Badge variant="secondary">Clavinet</Badge>
            <Badge variant="secondary">Celesta</Badge>
            <Badge variant="secondary">Organ</Badge>
            <Badge variant="secondary">Accordion</Badge>
          </div>
        </div>

        <Separator />

        {/* String Instruments */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Violin className="w-4 h-4 text-purple-600" />
            <h4 className="font-medium text-purple-900 dark:text-purple-100">String Instruments</h4>
            <Badge variant="outline" className="text-xs">8 instruments</Badge>
          </div>
          <div className="flex flex-wrap gap-2 ml-6">
            <Badge variant="secondary">String Ensemble ⭐</Badge>
            <Badge variant="secondary">Violin</Badge>
            <Badge variant="secondary">Viola</Badge>
            <Badge variant="secondary">Cello</Badge>
            <Badge variant="secondary">Contrabass</Badge>
            <Badge variant="secondary">Tremolo Strings</Badge>
            <Badge variant="secondary">Pizzicato</Badge>
            <Badge variant="secondary">Harp</Badge>
          </div>
        </div>

        <Separator />

        {/* Brass Instruments */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trumpet className="w-4 h-4 text-purple-600" />
            <h4 className="font-medium text-purple-900 dark:text-purple-100">Brass Instruments</h4>
            <Badge variant="outline" className="text-xs">8 instruments</Badge>
          </div>
          <div className="flex flex-wrap gap-2 ml-6">
            <Badge variant="secondary">Trumpet</Badge>
            <Badge variant="secondary">Trombone</Badge>
            <Badge variant="secondary">French Horn</Badge>
            <Badge variant="secondary">Tuba</Badge>
            <Badge variant="secondary">Muted Trumpet</Badge>
            <Badge variant="secondary">Brass Section ⭐</Badge>
            <Badge variant="secondary">Synth Brass 1</Badge>
            <Badge variant="secondary">Synth Brass 2</Badge>
          </div>
        </div>

        <Separator />

        {/* Woodwind Instruments */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-4 h-4 text-purple-600" />
            <h4 className="font-medium text-purple-900 dark:text-purple-100">Woodwind Instruments</h4>
            <Badge variant="outline" className="text-xs">12 instruments</Badge>
          </div>
          <div className="flex flex-wrap gap-2 ml-6">
            <Badge variant="secondary">Flute</Badge>
            <Badge variant="secondary">Piccolo</Badge>
            <Badge variant="secondary">Recorder</Badge>
            <Badge variant="secondary">Pan Flute</Badge>
            <Badge variant="secondary">Clarinet</Badge>
            <Badge variant="secondary">Oboe</Badge>
            <Badge variant="secondary">English Horn</Badge>
            <Badge variant="secondary">Bassoon</Badge>
            <Badge variant="secondary">Soprano Sax</Badge>
            <Badge variant="secondary">Alto Sax</Badge>
            <Badge variant="secondary">Tenor Sax</Badge>
            <Badge variant="secondary">Baritone Sax</Badge>
          </div>
        </div>

        <Separator />

        {/* Additional Instruments */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Music className="w-4 h-4 text-purple-600" />
            <h4 className="font-medium text-purple-900 dark:text-purple-100">Other Instruments</h4>
            <Badge variant="outline" className="text-xs">10+ instruments</Badge>
          </div>
          <div className="flex flex-wrap gap-2 ml-6">
            <Badge variant="secondary">Vibraphone</Badge>
            <Badge variant="secondary">Marimba</Badge>
            <Badge variant="secondary">Xylophone</Badge>
            <Badge variant="secondary">Glockenspiel</Badge>
            <Badge variant="secondary">Choir Aahs</Badge>
            <Badge variant="secondary">Voice Oohs</Badge>
            <Badge variant="secondary">Guitar (Nylon)</Badge>
            <Badge variant="secondary">Guitar (Steel)</Badge>
            <Badge variant="secondary">Bass</Badge>
            <Badge variant="secondary">Timpani</Badge>
          </div>
        </div>

        <Separator />

        {/* Technical Info */}
        <div className="bg-purple-100/50 dark:bg-purple-900/20 p-3 rounded-lg space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-purple-900 dark:text-purple-100 font-medium">⭐ Featured:</span>
            <span className="text-purple-800 dark:text-purple-200">
              Beautiful Grand Piano, String Ensemble, Full Brass & Woodwind sections
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-900 dark:text-purple-100 font-medium">📦 Quality:</span>
            <span className="text-purple-800 dark:text-purple-200">
              MusyngKite soundfont - professional studio-quality samples
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-900 dark:text-purple-100 font-medium">🎵 Range:</span>
            <span className="text-purple-800 dark:text-purple-200">
              Full MIDI range (C-1 to G9) with accurate octave playback
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-900 dark:text-purple-100 font-medium">💾 Memory:</span>
            <span className="text-purple-800 dark:text-purple-200">
              Automatic caching & cleanup - instruments load on first use
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-900 dark:text-purple-100 font-medium">🔄 Fallback:</span>
            <span className="text-purple-800 dark:text-purple-200">
              Automatic synthesis fallback if samples fail to load
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}