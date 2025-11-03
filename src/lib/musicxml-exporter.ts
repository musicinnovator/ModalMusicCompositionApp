import { Theme, Mode, KeySignature, Part, MelodyElement, isRest, isNote, midiNoteToNoteName, midiNoteToPitchClass, midiNoteToOctave } from '../types/musical';

export interface MusicXMLExportOptions {
  title?: string;
  composer?: string;
  software?: string;
  includeMetadata?: boolean;
  timeSignature?: '4/4' | '3/4' | '2/4' | '6/8';
  tempo?: number; // BPM
  divisions?: number; // MIDI divisions per quarter note
}

export class MusicXMLExporter {
  private static readonly DEFAULT_OPTIONS: Required<MusicXMLExportOptions> = {
    title: 'Fugue Suite Composition',
    composer: 'Imitative Fugue Suite by HSS',
    software: 'Figma Make - Imitative Fugue Suite',
    includeMetadata: true,
    timeSignature: '4/4',
    tempo: 120,
    divisions: 480
  };

  /**
   * Export a complete composition to MusicXML format
   */
  static exportComposition(
    theme: Theme,
    parts: Part[],
    selectedMode?: Mode | null,
    selectedKeySignature?: KeySignature | null,
    options: Partial<MusicXMLExportOptions> = {}
  ): string {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      const xml = this.generateMusicXMLDocument(theme, parts, selectedMode, selectedKeySignature, opts);
      return xml;
    } catch (error) {
      console.error('MusicXML export error:', error);
      throw new Error(`Failed to export MusicXML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export only the theme to MusicXML
   */
  static exportThemeOnly(
    theme: Theme,
    selectedMode?: Mode | null,
    selectedKeySignature?: KeySignature | null,
    options: Partial<MusicXMLExportOptions> = {}
  ): string {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    opts.title = 'Theme - ' + opts.title;
    
    try {
      const xml = this.generateMusicXMLDocument(theme, [], selectedMode, selectedKeySignature, opts);
      return xml;
    } catch (error) {
      console.error('Theme MusicXML export error:', error);
      throw new Error(`Failed to export theme to MusicXML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static generateMusicXMLDocument(
    theme: Theme,
    parts: Part[],
    selectedMode?: Mode | null,
    selectedKeySignature?: KeySignature | null,
    options: Required<MusicXMLExportOptions> = this.DEFAULT_OPTIONS
  ): string {
    const totalParts = parts.length > 0 ? parts.length + 1 : 1; // Theme + generated parts
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n';
    xml += '<score-partwise version="3.1">\n';

    // Add metadata
    if (options.includeMetadata) {
      xml += this.generateWorkMetadata(options);
      xml += this.generateIdentification(options);
    }

    // Add part list
    xml += this.generatePartList(totalParts);

    // Add theme as first part
    xml += this.generatePart('P1', 'Theme', theme, selectedMode, selectedKeySignature, options, true);

    // Add generated parts
    parts.forEach((part, index) => {
      const partId = `P${index + 2}`;
      const partName = `Voice ${index + 1}`;
      xml += this.generatePart(partId, partName, part.melody, selectedMode, selectedKeySignature, options, false);
    });

    xml += '</score-partwise>\n';
    return xml;
  }

  private static generateWorkMetadata(options: Required<MusicXMLExportOptions>): string {
    return `  <work>
    <work-title>${this.escapeXML(options.title)}</work-title>
  </work>
`;
  }

  private static generateIdentification(options: Required<MusicXMLExportOptions>): string {
    const date = new Date().toISOString().split('T')[0];
    
    return `  <identification>
    <creator type="composer">${this.escapeXML(options.composer)}</creator>
    <creator type="software">${this.escapeXML(options.software)}</creator>
    <encoding>
      <software>${this.escapeXML(options.software)}</software>
      <encoding-date>${date}</encoding-date>
      <supports element="accidental" type="yes"/>
      <supports element="beam" type="yes"/>
      <supports element="print" attribute="new-page" type="yes"/>
      <supports element="print" attribute="new-system" type="yes"/>
      <supports element="stem" type="yes"/>
    </encoding>
  </identification>
`;
  }

  private static generatePartList(totalParts: number): string {
    let xml = '  <part-list>\n';
    
    // Theme part
    xml += `    <score-part id="P1">
      <part-name>Theme</part-name>
      <part-abbreviation>Th.</part-abbreviation>
      <score-instrument id="P1-I1">
        <instrument-name>Piano</instrument-name>
        <instrument-abbreviation>Pno.</instrument-abbreviation>
      </score-instrument>
      <midi-device id="P1-I1" port="1"/>
      <midi-instrument id="P1-I1">
        <midi-channel>1</midi-channel>
        <midi-program>1</midi-program>
        <volume>78.7402</volume>
        <pan>0</pan>
      </midi-instrument>
    </score-part>
`;

    // Generated parts
    for (let i = 2; i <= totalParts; i++) {
      xml += `    <score-part id="P${i}">
      <part-name>Voice ${i - 1}</part-name>
      <part-abbreviation>V${i - 1}</part-abbreviation>
      <score-instrument id="P${i}-I1">
        <instrument-name>Piano</instrument-name>
        <instrument-abbreviation>Pno.</instrument-abbreviation>
      </score-instrument>
      <midi-device id="P${i}-I1" port="1"/>
      <midi-instrument id="P${i}-I1">
        <midi-channel>${i}</midi-channel>
        <midi-program>1</midi-program>
        <volume>78.7402</volume>
        <pan>0</pan>
      </midi-instrument>
    </score-part>
`;
    }

    xml += '  </part-list>\n';
    return xml;
  }

  private static generatePart(
    partId: string,
    partName: string,
    melody: Theme,
    selectedMode?: Mode | null,
    selectedKeySignature?: KeySignature | null,
    options: Required<MusicXMLExportOptions> = this.DEFAULT_OPTIONS,
    isFirstPart: boolean = false
  ): string {
    let xml = `  <part id="${partId}">\n`;
    
    // First measure with attributes
    xml += '    <measure number="1">\n';
    
    if (isFirstPart) {
      xml += this.generateAttributes(selectedKeySignature, options);
      xml += this.generateDirection(options.tempo);
    }

    // Add notes for first measure
    const notesInFirstMeasure = this.getNotesForMeasure(melody, 0, options);
    xml += this.generateNotesXML(notesInFirstMeasure, options);
    
    xml += '    </measure>\n';

    // Generate additional measures if needed
    const totalMeasures = Math.ceil(melody.length / this.getNotesPerMeasure(options));
    for (let measure = 2; measure <= totalMeasures; measure++) {
      xml += `    <measure number="${measure}">\n`;
      
      const measureNotes = this.getNotesForMeasure(melody, measure - 1, options);
      xml += this.generateNotesXML(measureNotes, options);
      
      xml += '    </measure>\n';
    }

    xml += '  </part>\n';
    return xml;
  }

  private static generateAttributes(
    selectedKeySignature?: KeySignature | null,
    options: Required<MusicXMLExportOptions> = this.DEFAULT_OPTIONS
  ): string {
    const [beats, beatType] = options.timeSignature.split('/').map(Number);
    
    let xml = '      <attributes>\n';
    xml += `        <divisions>${options.divisions}</divisions>\n`;
    xml += `        <key>
          <fifths>${this.getKeySignatureFifths(selectedKeySignature)}</fifths>
        </key>
`;
    xml += `        <time>
          <beats>${beats}</beats>
          <beat-type>${beatType}</beat-type>
        </time>
`;
    xml += `        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
`;
    xml += '      </attributes>\n';
    return xml;
  }

  private static generateDirection(tempo: number): string {
    return `      <direction placement="above">
        <direction-type>
          <metronome>
            <beat-unit>quarter</beat-unit>
            <per-minute>${tempo}</per-minute>
          </metronome>
        </direction-type>
        <sound tempo="${tempo}"/>
      </direction>
`;
  }

  private static getKeySignatureFifths(keySignature?: KeySignature | null): number {
    if (!keySignature) return 0;
    
    // Convert sharps/flats to circle of fifths position
    return keySignature.sharps;
  }

  private static getNotesPerMeasure(options: Required<MusicXMLExportOptions>): number {
    const [beats] = options.timeSignature.split('/').map(Number);
    return beats; // Assuming quarter notes for simplicity
  }

  private static getNotesForMeasure(melody: Theme, measureIndex: number, options: Required<MusicXMLExportOptions>): MelodyElement[] {
    const notesPerMeasure = this.getNotesPerMeasure(options);
    const startIndex = measureIndex * notesPerMeasure;
    const endIndex = Math.min(startIndex + notesPerMeasure, melody.length);
    
    return melody.slice(startIndex, endIndex);
  }

  private static generateNotesXML(notes: MelodyElement[], options: Required<MusicXMLExportOptions>): string {
    let xml = '';
    
    notes.forEach((note, index) => {
      if (isRest(note)) {
        xml += this.generateRestXML(options);
      } else if (isNote(note)) {
        xml += this.generateNoteXML(note, options);
      }
    });

    // Fill remaining beats in measure with rests if needed
    const notesPerMeasure = this.getNotesPerMeasure(options);
    const remainingBeats = notesPerMeasure - notes.length;
    for (let i = 0; i < remainingBeats; i++) {
      xml += this.generateRestXML(options);
    }

    return xml;
  }

  private static generateNoteXML(midiNote: number, options: Required<MusicXMLExportOptions>): string {
    const pitchClass = midiNoteToPitchClass(midiNote);
    const octave = midiNoteToOctave(midiNote);
    const { step, alter } = this.midiToPitchStep(pitchClass);
    
    let xml = '      <note>\n';
    xml += '        <pitch>\n';
    xml += `          <step>${step}</step>\n`;
    if (alter !== 0) {
      xml += `          <alter>${alter}</alter>\n`;
    }
    xml += `          <octave>${octave}</octave>\n`;
    xml += '        </pitch>\n';
    xml += `        <duration>${options.divisions}</duration>\n`; // Quarter note duration
    xml += '        <type>quarter</type>\n';
    xml += '      </note>\n';
    
    return xml;
  }

  private static generateRestXML(options: Required<MusicXMLExportOptions>): string {
    let xml = '      <note>\n';
    xml += '        <rest/>\n';
    xml += `        <duration>${options.divisions}</duration>\n`; // Quarter rest duration
    xml += '        <type>quarter</type>\n';
    xml += '      </note>\n';
    
    return xml;
  }

  private static midiToPitchStep(pitchClass: number): { step: string, alter: number } {
    const pitchMap = [
      { step: 'C', alter: 0 },  // 0
      { step: 'C', alter: 1 },  // 1 (C#)
      { step: 'D', alter: 0 },  // 2
      { step: 'D', alter: 1 },  // 3 (D#)
      { step: 'E', alter: 0 },  // 4
      { step: 'F', alter: 0 },  // 5
      { step: 'F', alter: 1 },  // 6 (F#)
      { step: 'G', alter: 0 },  // 7
      { step: 'G', alter: 1 },  // 8 (G#)
      { step: 'A', alter: 0 },  // 9
      { step: 'A', alter: 1 },  // 10 (A#)
      { step: 'B', alter: 0 },  // 11
    ];
    
    return pitchMap[pitchClass];
  }

  private static escapeXML(text: string): string {
    return text
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generate a download link for the MusicXML file
   */
  static downloadMusicXML(
    xml: string,
    filename: string = 'fugue-composition.xml'
  ): void {
    try {
      const blob = new Blob([xml], { type: 'application/vnd.recordare.musicxml+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.endsWith('.xml') ? filename : `${filename}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('MusicXML download error:', error);
      throw new Error('Failed to download MusicXML file');
    }
  }

  /**
   * Validate that the generated MusicXML is well-formed
   */
  static validateMusicXML(xml: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      // Basic XML validation
      if (!xml.includes('<?xml version="1.0"')) {
        errors.push('Missing XML declaration');
      }
      
      if (!xml.includes('<score-partwise')) {
        errors.push('Missing score-partwise root element');
      }
      
      if (!xml.includes('</score-partwise>')) {
        errors.push('Missing closing score-partwise tag');
      }
      
      // Check for required elements
      if (!xml.includes('<part-list>')) {
        errors.push('Missing part-list element');
      }
      
      if (!xml.includes('<part id=')) {
        errors.push('Missing part elements');
      }
      
      // Count opening and closing tags for basic balance
      const openParts = (xml.match(/<part\s/g) || []).length;
      const closeParts = (xml.match(/<\/part>/g) || []).length;
      
      if (openParts !== closeParts) {
        errors.push('Unbalanced part tags');
      }
      
      return { valid: errors.length === 0, errors };
      
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { valid: false, errors };
    }
  }
}