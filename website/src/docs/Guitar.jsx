import React, { useState, useEffect, useRef } from 'react';
import { useStrudelSound } from './useStrudelSound';
import { SoundSelector, CodeDisplay } from './SoundSelector';
import useClient from '@src/useClient.mjs';

// Standard guitar tuning (low to high): E2, A2, D3, G3, B3, E4
// Each fret adds a semitone
const STRINGS = [
  { open: 'E2', row: 'z', name: 'Low E' },   // 6th string (thickest)
  { open: 'A2', row: 'a', name: 'A' },        // 5th string
  { open: 'D3', row: 'q', name: 'D' },        // 4th string
  { open: 'G3', row: 'Z', name: 'G' },        // 3rd string (shift)
  { open: 'B3', row: 'A', name: 'B' },        // 2nd string (shift)
  { open: 'E4', row: 'Q', name: 'High E' },   // 1st string (thinnest, shift)
];

// Note names for calculating frets
const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Convert note name to semitone number
const noteToSemitone = (note) => {
  const noteName = note.slice(0, -1);
  const octave = parseInt(note.slice(-1));
  return octave * 12 + NOTE_NAMES.indexOf(noteName);
};

// Convert semitone number to note name
const semitoneToNote = (semitone) => {
  const octave = Math.floor(semitone / 12);
  const noteIndex = semitone % 12;
  return NOTE_NAMES[noteIndex] + octave;
};

// Get note at fret position
const getNoteAtFret = (openNote, fret) => {
  const openSemitone = noteToSemitone(openNote);
  return semitoneToNote(openSemitone + fret);
};

// Keyboard rows for frets (0-8 frets)
const FRET_KEYS = {
  'z': ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
  'a': ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  'q': ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o'],
  'Z': ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>'],
  'A': ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  'Q': ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O'],
};

// Build complete keyMap
const buildKeyMap = () => {
  const map = {};
  STRINGS.forEach(({ open, row }) => {
    const keys = FRET_KEYS[row];
    if (keys) {
      keys.forEach((key, fret) => {
        map[key] = getNoteAtFret(open, fret);
      });
    }
  });
  return map;
};

const keyMap = buildKeyMap();

// Get all notes for preloading
const ALL_NOTES = [...new Set(Object.values(keyMap))];

export function Guitar({ defaultSound = 'gm_acoustic_guitar_nylon' }) {
  const {
    sound,
    setSound,
    activeNotes,
    lastNote,
    loading,
    noteOn,
    noteOff,
  } = useStrudelSound({ defaultSound, notes: ALL_NOTES });

  const heldKeys = useRef(new Set());

  // Keyboard handlers - need to handle shift for uppercase
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;

      // Get the actual key with shift consideration
      let key = e.key;

      if (keyMap[key] && !heldKeys.current.has(key)) {
        heldKeys.current.add(key);
        noteOn(keyMap[key]);
      }
    };

    const handleKeyUp = (e) => {
      let key = e.key;

      if (keyMap[key]) {
        heldKeys.current.delete(key);
        noteOff(keyMap[key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [noteOn, noteOff]);

  const client = useClient();
  if (!client) {
    return <div>Loading guitar...</div>;
  }

  const NUM_FRETS = 8;

  return (
    <div className="flex flex-col gap-4">
      <SoundSelector sound={sound} setSound={setSound} loading={loading} />

      <div className="border border-lineHighlight rounded-xl p-4 bg-gradient-to-b from-amber-800 to-amber-900 overflow-x-auto">
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `80px repeat(${NUM_FRETS + 1}, 48px)`,
            gridTemplateRows: `auto repeat(6, 32px)`,
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
          {[...STRINGS].reverse().map(({ open, row, name }) => {
            const keys = FRET_KEYS[row]?.slice(0, NUM_FRETS + 1) || [];
            const isShiftRow = row === row.toUpperCase();

            return (
              <React.Fragment key={row}>
                {/* String name */}
                <div className="text-right pr-2 text-sm font-mono text-amber-200 flex items-center justify-end">
                  {name} {isShiftRow && <span className="text-xs ml-1">(⇧)</span>}
                </div>

                {/* Frets */}
                {keys.map((key, fret) => {
                  const note = getNoteAtFret(open, fret);
                  const isActive = activeNotes.includes(note);
                  const hasKey = key !== '';

                  return (
                    <button
                      key={`${row}-${fret}`}
                      onMouseDown={() => hasKey && noteOn(note)}
                      onMouseUp={() => hasKey && noteOff(note)}
                      onMouseLeave={() => hasKey && noteOff(note)}
                      disabled={!hasKey}
                      className={`
                        h-8
                        border-r-2 border-amber-950
                        ${fret === 0 ? 'border-l-4 border-l-amber-950' : ''}
                        ${!hasKey
                          ? 'bg-amber-800 cursor-default'
                          : isActive
                            ? 'bg-cyan-400 z-10'
                            : fret === 0
                              ? 'bg-amber-100 hover:bg-amber-200'
                              : 'bg-amber-700 hover:bg-amber-600'
                        }
                        transition-all duration-75
                        ${hasKey ? 'cursor-pointer' : ''}
                        relative
                      `}
                    >
                      {/* String line */}
                      <div className={`absolute top-1/2 left-0 right-0 h-0.5 ${
                        isActive ? 'bg-cyan-600' :
                        STRINGS.indexOf(STRINGS.find(s => s.row === row)) < 3
                          ? 'bg-amber-300'
                          : 'bg-amber-200'
                      }`} />

                      {/* Active note indicator */}
                      {isActive && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-cyan-500 border-2 border-white shadow-lg" />
                      )}

                      {/* Note name when active */}
                      {isActive && (
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white z-10">
                          {note.replace(/[0-9]/g, '')}
                        </span>
                      )}

                      {/* Key label */}
                      {hasKey && (
                        <span className={`absolute bottom-0 right-0.5 text-xs font-mono ${isActive ? 'text-cyan-900' : 'text-amber-900 opacity-50'}`}>
                          {key}
                        </span>
                      )}

                      {/* Fret markers */}
                      {[3, 5, 7, 9, 12].includes(fret) && !isActive && (
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

      <CodeDisplay sound={sound} lastNote={lastNote} />

      <div className="text-sm text-gray-400 font-mono space-y-1">
        <p><b>Lower strings (no shift):</b> Z-row = Low E, A-row = A, Q-row = D</p>
        <p><b>Higher strings (with Shift):</b> Z-row = G, A-row = B, Q-row = High E</p>
        <p>Keys across each row = frets (0-12)</p>
      </div>
    </div>
  );
}
