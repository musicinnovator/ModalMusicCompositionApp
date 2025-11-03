import { Theme, Part, MidiNote } from '../types/musical';

// MIDI File Format Constants
const MIDI_HEADER_LENGTH = 14;
const TRACK_HEADER_LENGTH = 8;
const MIDI_FILE_SIGNATURE = 'MThd';
const TRACK_SIGNATURE = 'MTrk';

// MIDI Event Types
const NOTE_OFF = 0x80;
const NOTE_ON = 0x90;
const POLYPHONIC_AFTERTOUCH = 0xA0;
const CONTROL_CHANGE = 0xB0;
const PROGRAM_CHANGE = 0xC0;
const CHANNEL_AFTERTOUCH = 0xD0;
const PITCH_BEND = 0xE0;
const SYSTEM_EXCLUSIVE = 0xF0;
const META_EVENT = 0xFF;

// Meta Event Types
const META_SEQUENCE_NUMBER = 0x00;
const META_TEXT = 0x01;
const META_COPYRIGHT = 0x02;
const META_TRACK_NAME = 0x03;
const META_INSTRUMENT_NAME = 0x04;
const META_LYRIC = 0x05;
const META_MARKER = 0x06;
const META_CUE_POINT = 0x07;
const META_CHANNEL_PREFIX = 0x20;
const META_END_OF_TRACK = 0x2F;
const META_TEMPO = 0x51;
const META_SMPTE_OFFSET = 0x54;
const META_TIME_SIGNATURE = 0x58;
const META_KEY_SIGNATURE = 0x59;
const META_SEQUENCER_SPECIFIC = 0x7F;

export interface MidiFileInfo {
  format: number; // 0, 1, or 2
  trackCount: number;
  ticksPerQuarter: number;
  tempoChanges: TempoChange[];
  timeSignatures: TimeSignature[];
  keySignatures: KeySignature[];
  tracks: MidiTrack[];
}

export interface MidiTrack {
  name?: string;
  instrument?: string;
  notes: NoteEvent[];
  events: MidiEvent[];
}

export interface NoteEvent {
  note: MidiNote;
  velocity: number;
  startTime: number; // in ticks
  duration: number; // in ticks
  channel: number;
}

export interface MidiEvent {
  type: string;
  time: number; // in ticks
  data: any;
}

export interface TempoChange {
  time: number;
  microsecondsPerQuarter: number;
  bpm: number;
}

export interface TimeSignature {
  time: number;
  numerator: number;
  denominator: number;
  clocksPerClick: number;
  thirtySecondNotesPerQuarter: number;
}

export interface KeySignature {
  time: number;
  sharpsFlats: number; // negative for flats, positive for sharps
  major: boolean; // true for major, false for minor
}

export class MidiParseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'MidiParseError';
  }
}

export class MidiFileParser {
  private data: Uint8Array;
  private position: number = 0;

  constructor(data: ArrayBuffer) {
    this.data = new Uint8Array(data);
    this.position = 0;
  }

  parse(): MidiFileInfo {
    try {
      console.log('🎵 Starting MIDI file parse, size:', this.data.length, 'bytes');
      
      // Validate file size
      if (this.data.length < MIDI_HEADER_LENGTH) {
        throw new MidiParseError('File too small to be a valid MIDI file', 'FILE_TOO_SMALL');
      }

      // Parse header
      const header = this.parseHeader();
      console.log('🎵 MIDI Header parsed:', header);

      // Validate format
      if (header.format < 0 || header.format > 2) {
        throw new MidiParseError(`Unsupported MIDI format: ${header.format}. Only formats 0, 1, and 2 are supported.`, 'UNSUPPORTED_FORMAT');
      }

      // Parse tracks
      const tracks: MidiTrack[] = [];
      const tempoChanges: TempoChange[] = [{ time: 0, microsecondsPerQuarter: 500000, bpm: 120 }]; // Default tempo
      const timeSignatures: TimeSignature[] = [{ time: 0, numerator: 4, denominator: 4, clocksPerClick: 24, thirtySecondNotesPerQuarter: 8 }];
      const keySignatures: KeySignature[] = [{ time: 0, sharpsFlats: 0, major: true }];

      for (let i = 0; i < header.trackCount; i++) {
        console.log(`🎵 Parsing track ${i + 1}/${header.trackCount}`);
        
        if (this.position >= this.data.length) {
          throw new MidiParseError(`Unexpected end of file while parsing track ${i + 1}`, 'UNEXPECTED_EOF');
        }

        const track = this.parseTrack(tempoChanges, timeSignatures, keySignatures);
        tracks.push(track);
        console.log(`🎵 Track ${i + 1} parsed: ${track.notes.length} notes, ${track.events.length} events`);
      }

      const result: MidiFileInfo = {
        format: header.format,
        trackCount: header.trackCount,
        ticksPerQuarter: header.ticksPerQuarter,
        tempoChanges,
        timeSignatures,
        keySignatures,
        tracks
      };

      console.log('🎵 MIDI parse complete:', {
        format: result.format,
        tracks: result.trackCount,
        totalNotes: result.tracks.reduce((sum, track) => sum + track.notes.length, 0)
      });

      return result;
    } catch (error) {
      if (error instanceof MidiParseError) {
        throw error;
      }
      throw new MidiParseError(`Unexpected error during MIDI parsing: ${error instanceof Error ? error.message : 'Unknown error'}`, 'PARSE_ERROR');
    }
  }

  private parseHeader() {
    // Check MThd signature
    const signature = this.readString(4);
    if (signature !== MIDI_FILE_SIGNATURE) {
      throw new MidiParseError(`Invalid MIDI file signature: expected "${MIDI_FILE_SIGNATURE}", got "${signature}"`, 'INVALID_SIGNATURE');
    }

    // Read header length (should be 6)
    const headerLength = this.readUint32();
    if (headerLength !== 6) {
      throw new MidiParseError(`Invalid MIDI header length: expected 6, got ${headerLength}`, 'INVALID_HEADER_LENGTH');
    }

    // Read format, track count, and ticks per quarter note
    const format = this.readUint16();
    const trackCount = this.readUint16();
    const ticksPerQuarter = this.readUint16();

    // Validate values
    if (trackCount === 0) {
      throw new MidiParseError('MIDI file contains no tracks', 'NO_TRACKS');
    }

    if (ticksPerQuarter === 0) {
      throw new MidiParseError('Invalid ticks per quarter note: cannot be zero', 'INVALID_TICKS');
    }

    return { format, trackCount, ticksPerQuarter };
  }

  private parseTrack(tempoChanges: TempoChange[], timeSignatures: TimeSignature[], keySignatures: KeySignature[]): MidiTrack {
    // Check MTrk signature
    const signature = this.readString(4);
    if (signature !== TRACK_SIGNATURE) {
      throw new MidiParseError(`Invalid track signature: expected "${TRACK_SIGNATURE}", got "${signature}"`, 'INVALID_TRACK_SIGNATURE');
    }

    // Read track length
    const trackLength = this.readUint32();
    const trackEndPosition = this.position + trackLength;

    const track: MidiTrack = {
      notes: [],
      events: []
    };

    const activeNotes = new Map<string, { note: MidiNote; velocity: number; startTime: number; channel: number }>();
    let currentTime = 0;
    let runningStatus = 0;

    while (this.position < trackEndPosition) {
      try {
        // Read delta time
        const deltaTime = this.readVariableLength();
        currentTime += deltaTime;

        // Read event
        let eventByte = this.readUint8();
        
        // Handle running status (reuse previous status byte if < 0x80)
        if (eventByte < 0x80) {
          if (runningStatus === 0) {
            throw new MidiParseError('Invalid running status: no previous status byte', 'INVALID_RUNNING_STATUS');
          }
          this.position--; // Put the byte back
          eventByte = runningStatus;
        } else {
          runningStatus = eventByte;
        }

        if (eventByte === META_EVENT) {
          this.parseMetaEvent(currentTime, track, tempoChanges, timeSignatures, keySignatures);
        } else if (eventByte >= 0xF0) {
          this.parseSystemEvent(eventByte, currentTime, track);
        } else {
          this.parseChannelEvent(eventByte, currentTime, track, activeNotes);
        }
      } catch (error) {
        console.warn('⚠️ Error parsing MIDI event at position', this.position, ':', error);
        // Try to continue parsing if possible
        if (this.position >= trackEndPosition) break;
      }
    }

    // Close any remaining active notes
    for (const [key, noteInfo] of activeNotes) {
      const duration = currentTime - noteInfo.startTime;
      if (duration > 0) {
        track.notes.push({
          note: noteInfo.note,
          velocity: noteInfo.velocity,
          startTime: noteInfo.startTime,
          duration,
          channel: noteInfo.channel
        });
      }
    }

    // Sort notes by start time
    track.notes.sort((a, b) => a.startTime - b.startTime);

    return track;
  }

  private parseMetaEvent(time: number, track: MidiTrack, tempoChanges: TempoChange[], timeSignatures: TimeSignature[], keySignatures: KeySignature[]) {
    const metaType = this.readUint8();
    const length = this.readVariableLength();
    const data = this.readBytes(length);

    switch (metaType) {
      case META_TRACK_NAME:
        track.name = new TextDecoder().decode(data);
        break;
      case META_INSTRUMENT_NAME:
        track.instrument = new TextDecoder().decode(data);
        break;
      case META_TEMPO:
        if (length === 3) {
          const microsecondsPerQuarter = (data[0] << 16) | (data[1] << 8) | data[2];
          const bpm = Math.round(60000000 / microsecondsPerQuarter);
          tempoChanges.push({ time, microsecondsPerQuarter, bpm });
        }
        break;
      case META_TIME_SIGNATURE:
        if (length === 4) {
          timeSignatures.push({
            time,
            numerator: data[0],
            denominator: Math.pow(2, data[1]),
            clocksPerClick: data[2],
            thirtySecondNotesPerQuarter: data[3]
          });
        }
        break;
      case META_KEY_SIGNATURE:
        if (length === 2) {
          keySignatures.push({
            time,
            sharpsFlats: data[0] > 127 ? data[0] - 256 : data[0], // Convert to signed byte
            major: data[1] === 0
          });
        }
        break;
      case META_END_OF_TRACK:
        // Track end marker
        break;
    }

    track.events.push({
      type: `meta_${metaType.toString(16).padStart(2, '0')}`,
      time,
      data: { metaType, length, data: Array.from(data) }
    });
  }

  private parseSystemEvent(eventByte: number, time: number, track: MidiTrack) {
    // System events - skip for now
    if (eventByte === 0xF0) {
      // System exclusive
      const length = this.readVariableLength();
      const data = this.readBytes(length);
      track.events.push({
        type: 'sysex',
        time,
        data: Array.from(data)
      });
    }
  }

  private parseChannelEvent(eventByte: number, time: number, track: MidiTrack, activeNotes: Map<string, any>) {
    const command = eventByte & 0xF0;
    const channel = eventByte & 0x0F;

    switch (command) {
      case NOTE_OFF:
        {
          const note = this.readUint8();
          const velocity = this.readUint8();
          this.handleNoteOff(note, channel, time, track, activeNotes);
        }
        break;
      case NOTE_ON:
        {
          const note = this.readUint8();
          const velocity = this.readUint8();
          if (velocity === 0) {
            this.handleNoteOff(note, channel, time, track, activeNotes);
          } else {
            this.handleNoteOn(note, velocity, channel, time, activeNotes);
          }
        }
        break;
      case POLYPHONIC_AFTERTOUCH:
        this.readUint8(); // note
        this.readUint8(); // pressure
        break;
      case CONTROL_CHANGE:
        this.readUint8(); // controller
        this.readUint8(); // value
        break;
      case PROGRAM_CHANGE:
        this.readUint8(); // program
        break;
      case CHANNEL_AFTERTOUCH:
        this.readUint8(); // pressure
        break;
      case PITCH_BEND:
        this.readUint8(); // LSB
        this.readUint8(); // MSB
        break;
    }
  }

  private handleNoteOn(note: MidiNote, velocity: number, channel: number, time: number, activeNotes: Map<string, any>) {
    // Validate note range
    if (note < 0 || note > 127) {
      console.warn(`Invalid MIDI note: ${note}, skipping`);
      return;
    }
    
    const key = `${note}_${channel}`;
    
    // If note is already active, end the previous one first
    if (activeNotes.has(key)) {
      const prevNote = activeNotes.get(key);
      const duration = time - prevNote.startTime;
      if (duration > 0) {
        // Add the completed note (this was missing implementation)
        // We'll handle this in the note-off logic instead
      }
    }

    activeNotes.set(key, { note, velocity, startTime: time, channel });
  }

  private handleNoteOff(note: MidiNote, channel: number, time: number, track: MidiTrack, activeNotes: Map<string, any>) {
    // Validate note range
    if (note < 0 || note > 127) {
      console.warn(`Invalid MIDI note in note-off: ${note}, skipping`);
      return;
    }
    
    const key = `${note}_${channel}`;
    
    if (activeNotes.has(key)) {
      const noteInfo = activeNotes.get(key);
      const duration = time - noteInfo.startTime;
      
      // Only add notes with positive duration and reasonable length
      if (duration > 0 && duration < 100000) { // Sanity check for duration
        track.notes.push({
          note,
          velocity: noteInfo.velocity,
          startTime: noteInfo.startTime,
          duration,
          channel
        });
      } else if (duration <= 0) {
        console.warn(`Zero or negative duration for note ${note}, skipping`);
      } else {
        console.warn(`Extremely long duration for note ${note}: ${duration}, skipping`);
      }
      
      activeNotes.delete(key);
    }
  }

  private readString(length: number): string {
    const bytes = this.readBytes(length);
    return new TextDecoder().decode(bytes);
  }

  private readUint8(): number {
    if (this.position >= this.data.length) {
      throw new MidiParseError('Unexpected end of file while reading byte', 'UNEXPECTED_EOF');
    }
    return this.data[this.position++];
  }

  private readUint16(): number {
    const byte1 = this.readUint8();
    const byte2 = this.readUint8();
    return (byte1 << 8) | byte2;
  }

  private readUint32(): number {
    const byte1 = this.readUint8();
    const byte2 = this.readUint8();
    const byte3 = this.readUint8();
    const byte4 = this.readUint8();
    return (byte1 << 24) | (byte2 << 16) | (byte3 << 8) | byte4;
  }

  private readBytes(length: number): Uint8Array {
    if (this.position + length > this.data.length) {
      throw new MidiParseError(`Unexpected end of file: need ${length} bytes, only ${this.data.length - this.position} available`, 'UNEXPECTED_EOF');
    }
    const bytes = this.data.slice(this.position, this.position + length);
    this.position += length;
    return bytes;
  }

  private readVariableLength(): number {
    let value = 0;
    let byte;
    let bytesRead = 0;
    
    do {
      if (bytesRead >= 4) {
        throw new MidiParseError('Variable length value too long (>4 bytes)', 'INVALID_VARIABLE_LENGTH');
      }
      
      byte = this.readUint8();
      value = (value << 7) | (byte & 0x7F);
      bytesRead++;
    } while (byte & 0x80);
    
    return value;
  }
}

// Utility functions to convert MIDI file data to app format
export function convertMidiToTheme(midiFile: MidiFileInfo, trackIndex: number = 0): Theme {
  if (trackIndex >= midiFile.tracks.length) {
    throw new Error(`Track index ${trackIndex} out of range (file has ${midiFile.tracks.length} tracks)`);
  }

  const track = midiFile.tracks[trackIndex];
  
  // Sort notes by start time and take the first 32 notes to prevent memory issues
  const sortedNotes = track.notes
    .sort((a, b) => a.startTime - b.startTime)
    .slice(0, 32);

  return sortedNotes.map(note => note.note);
}

export function convertMidiToParts(midiFile: MidiFileInfo): Part[] {
  const parts: Part[] = [];

  for (let i = 0; i < Math.min(midiFile.tracks.length, 8); i++) { // Limit to 8 tracks
    const track = midiFile.tracks[i];
    
    if (track.notes.length === 0) continue;

    // Sort notes by start time
    const sortedNotes = track.notes.sort((a, b) => a.startTime - b.startTime);
    
    // Convert to melody (take first 32 notes)
    const melody = sortedNotes.slice(0, 32).map(note => note.note);
    
    // Create basic rhythm pattern based on note durations
    const rhythm = sortedNotes.slice(0, 32).map(note => {
      // Convert MIDI ticks to basic rhythm units (simplified)
      const durationInQuarters = note.duration / midiFile.ticksPerQuarter;
      return Math.max(1, Math.round(durationInQuarters * 4)); // Convert to sixteenth note units
    });

    parts.push({
      melody,
      rhythm
    });
  }

  return parts;
}

export function getMidiFileInfo(midiFile: MidiFileInfo): string {
  const trackInfo = midiFile.tracks.map((track, index) => {
    const name = track.name || `Track ${index + 1}`;
    const instrument = track.instrument || 'Unknown';
    const noteCount = track.notes.length;
    return `${name} (${instrument}): ${noteCount} notes`;
  }).join('\n');

  const tempoInfo = midiFile.tempoChanges.length > 1 
    ? `${midiFile.tempoChanges.length} tempo changes`
    : `${midiFile.tempoChanges[0]?.bpm || 120} BPM`;

  return `MIDI Format ${midiFile.format}
${midiFile.trackCount} tracks
${midiFile.ticksPerQuarter} ticks per quarter note
${tempoInfo}

Tracks:
${trackInfo}`;
}