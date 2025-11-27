import React, { useState, useRef, useCallback } from 'react';
import { useStrudelSound } from './useStrudelSound';
import { SoundSelector, CodeDisplay } from './SoundSelector';
import useClient from '@src/useClient.mjs';

// Standard guitar tuning (low to high): E2, A2, D3, G3, B3, E4
const STRINGS = [
  { open: 'E2', name: 'Low E' },
  { open: 'A2', name: 'A' },
  { open: 'D3', name: 'D' },
  { open: 'G3', name: 'G' },
  { open: 'B3', name: 'B' },
  { open: 'E4', name: 'High E' },
];

const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const noteToSemitone = (note) => {
  const noteName = note.slice(0, -1);
  const octave = parseInt(note.slice(-1));
  return octave * 12 + NOTE_NAMES.indexOf(noteName);
};

const semitoneToNote = (semitone) => {
  const octave = Math.floor(semitone / 12);
  const noteIndex = semitone % 12;
  return NOTE_NAMES[noteIndex] + octave;
};

const getNoteAtFret = (openNote, fret) => {
  const openSemitone = noteToSemitone(openNote);
  return semitoneToNote(openSemitone + fret);
};

const NUM_FRETS = 12;

// Get all possible notes for preloading
const ALL_NOTES = STRINGS.flatMap(({ open }) =>
  Array.from({ length: NUM_FRETS + 1 }, (_, fret) => getNoteAtFret(open, fret))
);

const LONG_PRESS_DURATION = 300; // ms

export function GuitarWithPick({ defaultSound = 'gm_acoustic_guitar_nylon' }) {
  const {
    sound,
    setSound,
    lastNote,
    loading,
    noteOn,
    noteOff,
  } = useStrudelSound({ defaultSound, notes: ALL_NOTES });

  // Track selected fret for each string (null = open/muted, number = fret)
  const [selectedFrets, setSelectedFrets] = useState([0, 0, 0, 0, 0, 0]); // Default: all open strings

  // Track which strings have been played during current strum direction
  const playedStrings = useRef(new Set());
  const strumZoneRef = useRef(null);
  const longPressTimer = useRef(null);
  const [isStrumming, setIsStrumming] = useState(false);
  const lastStringIndex = useRef(null); // Track last string to detect direction change
  const strumDirection = useRef(null); // 'up' or 'down'

  // Get the note for a string based on selected fret
  const getNoteForString = useCallback((stringIndex) => {
    const fret = selectedFrets[stringIndex];
    if (fret === null) return null; // Muted
    return getNoteAtFret(STRINGS[stringIndex].open, fret);
  }, [selectedFrets]);

  // Handle fret selection (shift-click or long-press)
  const handleFretSelect = useCallback((stringIndex, fret) => {
    setSelectedFrets(prev => {
      const newFrets = [...prev];
      // If clicking the already selected fret, toggle to muted
      if (newFrets[stringIndex] === fret) {
        newFrets[stringIndex] = null;
      } else {
        newFrets[stringIndex] = fret;
      }
      return newFrets;
    });
  }, []);

  // Handle fret button interactions
  const handleFretPointerDown = useCallback((e, stringIndex, fret) => {
    if (e.shiftKey) {
      // Shift-click: immediate fret selection
      handleFretSelect(stringIndex, fret);
      return;
    }

    // Start long-press timer
    longPressTimer.current = setTimeout(() => {
      handleFretSelect(stringIndex, fret);
      longPressTimer.current = null;
    }, LONG_PRESS_DURATION);
  }, [handleFretSelect]);

  const handleFretPointerUp = useCallback(() => {
    // Cancel long-press if released early
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Strum zone handlers - play notes based on Y position with direction detection
  const handleStrumStart = useCallback((e) => {
    if (!strumZoneRef.current) return;
    strumZoneRef.current.setPointerCapture(e.pointerId);
    setIsStrumming(true);
    playedStrings.current.clear();
    strumDirection.current = null;

    // Get the initial string
    const rect = strumZoneRef.current.getBoundingClientRect();
    const relativeY = (e.clientY - rect.top) / rect.height;
    const stringIndex = Math.floor(relativeY * 6);
    lastStringIndex.current = stringIndex;

    if (stringIndex >= 0 && stringIndex < 6) {
      const note = getNoteForString(5 - stringIndex); // Reverse: top = high E
      if (note) {
        playedStrings.current.add(stringIndex);
        noteOn(note);
        setTimeout(() => noteOff(note), 500);
      }
    }
  }, [getNoteForString, noteOn, noteOff]);

  const handleStrumMove = useCallback((e) => {
    if (!isStrumming || !strumZoneRef.current) return;

    const rect = strumZoneRef.current.getBoundingClientRect();
    const relativeY = (e.clientY - rect.top) / rect.height;
    const stringIndex = Math.floor(relativeY * 6);

    if (stringIndex < 0 || stringIndex >= 6) return;
    if (stringIndex === lastStringIndex.current) return;

    // Detect direction change
    const newDirection = stringIndex > lastStringIndex.current ? 'down' : 'up';

    // If direction changed, clear played strings to allow re-strumming
    if (strumDirection.current !== null && newDirection !== strumDirection.current) {
      playedStrings.current.clear();
    }
    strumDirection.current = newDirection;
    lastStringIndex.current = stringIndex;

    // Play the string if not already played in this direction
    if (!playedStrings.current.has(stringIndex)) {
      const note = getNoteForString(5 - stringIndex); // Reverse: top = high E
      if (note) {
        playedStrings.current.add(stringIndex);
        noteOn(note);
        setTimeout(() => noteOff(note), 500);
      }
    }
  }, [isStrumming, getNoteForString, noteOn, noteOff]);

  const handleStrumEnd = useCallback((e) => {
    if (strumZoneRef.current) {
      strumZoneRef.current.releasePointerCapture(e.pointerId);
    }
    setIsStrumming(false);
    playedStrings.current.clear();
    lastStringIndex.current = null;
    strumDirection.current = null;
  }, []);

  const client = useClient();
  if (!client) {
    return <div>Loading guitar...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <SoundSelector sound={sound} setSound={setSound} loading={loading} />

      <div className="flex gap-0">
        {/* Fretboard */}
        <div className="border border-lineHighlight rounded-l-xl p-4 bg-gradient-to-b from-amber-800 to-amber-900 overflow-x-auto flex-1">
          <div
            className="grid gap-0"
            style={{
              gridTemplateColumns: `60px repeat(${NUM_FRETS + 1}, 36px)`,
              gridTemplateRows: `auto repeat(6, 36px)`,
            }}
          >
            {/* Fret numbers row */}
            <div /> {/* Empty corner */}
            {Array.from({ length: NUM_FRETS + 1 }, (_, i) => (
              <div key={i} className="text-center text-xs text-amber-200 font-mono py-1">
                {i}
              </div>
            ))}

            {/* Strings - reversed so high E is on top visually */}
            {[...STRINGS].reverse().map(({ open, name }, reverseIndex) => {
              const stringIndex = 5 - reverseIndex; // Actual string index (0 = low E)
              const selectedFret = selectedFrets[stringIndex];
              const currentNote = getNoteForString(stringIndex);

              return (
                <React.Fragment key={name}>
                  {/* String name and current note */}
                  <div className="text-right pr-2 text-sm font-mono text-amber-200 flex items-center justify-end gap-1">
                    <span className="text-xs text-cyan-300">
                      {currentNote ? currentNote.replace(/[0-9]/g, '') : 'X'}
                    </span>
                    <span>{name}</span>
                  </div>

                  {/* Frets */}
                  {Array.from({ length: NUM_FRETS + 1 }, (_, fret) => {
                    const isSelected = selectedFret === fret;
                    const isMuted = selectedFret === null;

                    return (
                      <button
                        key={`${name}-${fret}`}
                        onPointerDown={(e) => handleFretPointerDown(e, stringIndex, fret)}
                        onPointerUp={handleFretPointerUp}
                        onPointerLeave={handleFretPointerUp}
                        className={`
                          h-9
                          border-r-2 border-amber-950
                          ${fret === 0 ? 'border-l-4 border-l-amber-950' : ''}
                          ${isSelected
                            ? 'bg-cyan-500 z-10'
                            : fret === 0
                              ? 'bg-amber-100 hover:bg-amber-200'
                              : 'bg-amber-700 hover:bg-amber-600'
                          }
                          transition-all duration-75
                          cursor-pointer
                          relative
                        `}
                      >
                        {/* String line */}
                        <div className={`absolute top-1/2 left-0 right-0 h-0.5 ${
                          isSelected ? 'bg-cyan-600' :
                          isMuted ? 'bg-gray-500 opacity-50' :
                          stringIndex < 3
                            ? 'bg-amber-300'
                            : 'bg-amber-200'
                        }`} />

                        {/* Selected fret indicator (finger) */}
                        {isSelected && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-cyan-400 border-2 border-white shadow-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-cyan-900">
                              {getNoteAtFret(open, fret).replace(/[0-9]/g, '')}
                            </span>
                          </div>
                        )}

                        {/* Fret markers */}
                        {[3, 5, 7, 9, 12].includes(fret) && !isSelected && (
                          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-200 opacity-30" />
                        )}
                      </button>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Strum Zone (Pick Area) */}
        <div
          ref={strumZoneRef}
          onPointerDown={handleStrumStart}
          onPointerMove={handleStrumMove}
          onPointerUp={handleStrumEnd}
          onPointerCancel={handleStrumEnd}
          className={`
            w-48 rounded-r-xl border border-l-0 border-lineHighlight
            bg-gradient-to-b from-gray-800 to-gray-900
            cursor-pointer select-none touch-none
            flex flex-col items-center justify-center
            transition-colors
            ${isStrumming ? 'bg-gradient-to-b from-cyan-800 to-cyan-900' : ''}
          `}
          style={{ height: 'auto' }}
        >
          {/* String indicators in strum zone */}
          <div className="flex flex-col h-full w-full py-4">
            <div className="text-xs text-gray-500 text-center mb-2 px-1">Strum</div>
            {[...STRINGS].reverse().map(({ name }, reverseIndex) => {
              const stringIndex = 5 - reverseIndex;
              const note = getNoteForString(stringIndex);
              return (
                <div
                  key={name}
                  className="flex-1 flex items-center justify-center border-b border-gray-700 last:border-b-0"
                >
                  <div className={`w-full h-0.5 ${note ? 'bg-gray-600' : 'bg-gray-800'}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CodeDisplay sound={sound} lastNote={lastNote} />

      <div className="text-sm text-gray-400 space-y-1">
        <p><b>Select frets:</b> Shift-click or long-press on fretboard</p>
        <p><b>Strum:</b> Click and drag through the strum zone on the right</p>
      </div>
    </div>
  );
}
