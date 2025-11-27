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
  const playStrum = useCallback(async (notesArray, direction = 'down', strumSpeed = 20) => {
    await initAudio();
    try {
      const ac = getAudioContext();
      const baseTime = ac.currentTime + 0.01;
      const orderedNotes = direction === 'up' ? [...notesArray].reverse() : notesArray;

      orderedNotes.forEach((note, i) => {
        const t = baseTime + (i * strumSpeed / 1000);
        superdough({ s: sound, note }, t, 1.5);
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
  };
}
