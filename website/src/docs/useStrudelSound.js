import { useState, useCallback, useRef, useEffect } from 'react';
import { getAudioContext, initAudioOnFirstClick, superdough } from '@strudel/webaudio';
import { prebake } from '../repl/prebake.mjs';
import { loadModules } from '../repl/util.mjs';

let prebaked, modulesLoading, audioReady;
if (typeof window !== 'undefined') {
  prebaked = prebake();
  modulesLoading = loadModules();
  audioReady = initAudioOnFirstClick();
}

// Just intonation: cent offsets from equal temperament for each semitone interval
// Based on 5-limit just intonation ratios
const JUST_INTONATION_CENTS = {
  0: 0,      // unison (1/1)
  1: 12,     // minor 2nd (16/15)
  2: 4,      // major 2nd (9/8)
  3: 16,     // minor 3rd (6/5)
  4: -14,    // major 3rd (5/4)
  5: -2,     // perfect 4th (4/3)
  6: -10,    // tritone (45/32)
  7: 2,      // perfect 5th (3/2)
  8: 14,     // minor 6th (8/5)
  9: -16,    // major 6th (5/3)
  10: 18,    // minor 7th (9/5)
  11: -12,   // major 7th (15/8)
};

// Convert note name to semitone number (C=0, C#=1, etc.)
const NOTE_TO_SEMITONE = {
  'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5,
  'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11,
  'C#': 1, 'D#': 3, 'F#': 6, 'G#': 8, 'A#': 10,
};

// Parse note name to get semitone and octave
function parseNote(note) {
  const match = note.match(/^([A-G][b#]?)(\d+)$/);
  if (!match) return null;
  const [, name, octave] = match;
  const semitone = NOTE_TO_SEMITONE[name];
  return { semitone, octave: parseInt(octave) };
}

// Get just intonation detune in cents relative to root note
function getJustIntonationDetune(note, rootNote) {
  const noteInfo = parseNote(note);
  const rootInfo = parseNote(rootNote);
  if (!noteInfo || !rootInfo) return 0;

  const noteMidi = noteInfo.octave * 12 + noteInfo.semitone;
  const rootMidi = rootInfo.octave * 12 + rootInfo.semitone;
  const interval = ((noteMidi - rootMidi) % 12 + 12) % 12; // 0-11

  return JUST_INTONATION_CENTS[interval] || 0;
}

export function useStrudelSound({ defaultSound = 'piano', notes = [] }) {
  const [sound, setSound] = useState(defaultSound);
  const [activeNotes, setActiveNotes] = useState([]);
  const [lastNote, setLastNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);
  const loadedSounds = useRef(new Set());

  const initAudio = useCallback(async () => {
    if (!initialized.current) {
      await Promise.all([modulesLoading, prebaked, audioReady]);
      initialized.current = true;
    }
  }, []);

  // Preload all notes sequentially
  const preloadSound = useCallback(async (soundName) => {
    if (loadedSounds.current.has(soundName) || notes.length === 0) return;

    await initAudio();
    setLoading(true);

    try {
      const ac = getAudioContext();
      for (const note of notes) {
        await superdough({ s: soundName, note, gain: 0 }, ac.currentTime + 0.01, 0.01);
      }
      loadedSounds.current.add(soundName);
    } catch (e) {
      console.error('Preload error:', e);
    }

    setLoading(false);
  }, [initAudio, notes]);

  // Preload when sound changes
  useEffect(() => {
    preloadSound(sound);
  }, [sound, preloadSound]);

  const playNote = useCallback(async (note) => {
    await initAudio();
    try {
      const ac = getAudioContext();
      const t = ac.currentTime + 0.01;
      await superdough({ s: sound, note }, t, 0.5);
    } catch (e) {
      console.error('Sound error:', e);
    }
  }, [sound, initAudio]);

  // Play multiple notes with staggered timing (for strumming)
  // direction: 'down' plays low to high, 'up' plays high to low
  // strumSpeed: milliseconds between each note (default 20ms)
  // velocity: 0-1 value controlling gain (default 0.8)
  const playStrum = useCallback(async (notesArray, direction = 'down', strumSpeed = 20, velocity = 0.8) => {
    await initAudio();
    try {
      const ac = getAudioContext();
      const baseTime = ac.currentTime + 0.01;
      const orderedNotes = direction === 'up' ? [...notesArray].reverse() : notesArray;
      // Clamp velocity between 0.05 and 1.0
      const gain = Math.max(0.05, Math.min(1.0, velocity));

      // Use first note as root for just intonation tuning
      const rootNote = notesArray[0];

      orderedNotes.forEach((note, i) => {
        const t = baseTime + (i * strumSpeed / 1000);
        const detune = getJustIntonationDetune(note, rootNote);
        superdough({ s: sound, note, gain, detune, room: 0.15, reverb: 0.2 }, t, 1.5);
      });

      // Set the last note for display (root note of chord)
      if (notesArray.length > 0) {
        setLastNote(notesArray[0]);
      }
    } catch (e) {
      console.error('Strum error:', e);
    }
  }, [sound, initAudio]);

  const noteOn = useCallback((note) => {
    if (loading) return;
    if (!activeNotes.includes(note)) {
      setActiveNotes(prev => [...prev, note]);
      setLastNote(note);
      playNote(note);
    }
  }, [activeNotes, playNote, loading]);

  const noteOff = useCallback((note) => {
    setActiveNotes(prev => prev.filter(n => n !== note));
  }, []);

  return {
    sound,
    setSound,
    activeNotes,
    lastNote,
    loading,
    noteOn,
    noteOff,
    playStrum,
    initAudio,
  };
}
