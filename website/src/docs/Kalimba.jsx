import { useState, useEffect, useCallback, useRef } from 'react';
import { useStrudelSound } from './useStrudelSound';
import { SoundSelector, CodeDisplay } from './SoundSelector';
import useClient from '@src/useClient.mjs';

// Kalimba layout: center is lowest (C3), alternating left-right going higher
// 17-key kalimba in C major - displayed left to right (one octave lower)
const KALIMBA_NOTES = [
  'D5', 'B4', 'G4', 'E4', 'C4', 'A3', 'F3', 'D3',  // Left side (high to low toward center)
  'C3',                                              // Center (lowest)
  'E3', 'G3', 'B3', 'D4', 'F4', 'A4', 'C5', 'E5'   // Right side (low to high away from center)
];

// Keyboard mapping: T is center (C3), spread outward matching physical layout
const keyMap = {
  // Left side (from leftmost to center)
  '2': 'D5',
  '3': 'B4',
  '4': 'G4',
  '5': 'E4',
  'q': 'C4',
  'w': 'A3',
  'e': 'F3',
  'r': 'D3',
  // Center
  't': 'C3',
  // Right side (from center to rightmost)
  'y': 'E3',
  'u': 'G3',
  'i': 'B3',
  'o': 'D4',
  'p': 'F4',
  '9': 'A4',
  '0': 'C5',
  '-': 'E5',
};

// Tine heights based on pitch (lower = longer tine)
const getTineHeight = (note) => {
  const baseHeight = 120;
  const octave = parseInt(note.slice(-1));
  const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const noteName = note.slice(0, -1).replace('b', '').replace('#', '');
  const noteIndex = noteNames.indexOf(noteName);
  const pitch = octave * 7 + noteIndex;
  // Lower pitch = taller tine
  return baseHeight + (42 - pitch) * 8;
};

export function Kalimba({ defaultSound = 'kalimba' }) {
  const {
    sound,
    setSound,
    activeNotes,
    lastNote,
    loading,
    noteOn,
    noteOff,
  } = useStrudelSound({ defaultSound, notes: KALIMBA_NOTES });

  const heldKeys = useRef(new Set());

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (keyMap[key] && !heldKeys.current.has(key)) {
        heldKeys.current.add(key);
        noteOn(keyMap[key]);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
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
    return <div>Loading kalimba...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <SoundSelector sound={sound} setSound={setSound} loading={loading} />

      <div className="border border-lineHighlight rounded-xl p-6 bg-gradient-to-b from-amber-900 to-amber-950">
        {/* Sound hole */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-amber-950 border-4 border-amber-800" />
        </div>

        {/* Tines */}
        <div className="flex justify-center items-end gap-1">
          {KALIMBA_NOTES.map((note, index) => {
            const isActive = activeNotes.includes(note);
            const height = getTineHeight(note);
            const keyLabel = Object.entries(keyMap).find(([k, v]) => v === note)?.[0]?.toUpperCase();

            return (
              <button
                key={note}
                onMouseDown={() => noteOn(note)}
                onMouseUp={() => noteOff(note)}
                onMouseLeave={() => noteOff(note)}
                className={`
                  relative
                  w-8
                  rounded-t-full
                  border-2 border-gray-400
                  transition-all duration-75
                  cursor-pointer
                  ${isActive
                    ? 'bg-gray-300 border-gray-200 scale-95'
                    : 'bg-gradient-to-b from-gray-300 to-gray-400 hover:from-gray-200 hover:to-gray-300'
                  }
                `}
                style={{ height: `${height}px` }}
              >
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-mono text-gray-600">
                  {keyLabel}
                </span>
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-700">
                  {note.replace(/[0-9]/g, '')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bridge */}
        <div className="mt-2 h-3 bg-amber-800 rounded" />
      </div>

      <CodeDisplay sound={sound} lastNote={lastNote} />

      <p className="text-sm text-gray-400 font-mono">
        Play with keyboard: 2-3-4-5-Q-W-E-R-<b>T</b>-Y-U-I-O-P-9-0-- (T is center/lowest)
      </p>
    </div>
  );
}
