import React from 'react';
import { useStrudelSound } from './useStrudelSound';
import { SoundSelector, CodeDisplay } from './SoundSelector';
import useClient from '@src/useClient.mjs';

// Standard guitar tuning (low to high): E2, A2, D3, G3, B3, E4
// Each fret adds a semitone
const STRINGS = [
  { open: 'E2', name: 'Low E' },   // 6th string (thickest)
  { open: 'A2', name: 'A' },        // 5th string
  { open: 'D3', name: 'D' },        // 4th string
  { open: 'G3', name: 'G' },        // 3rd string
  { open: 'B3', name: 'B' },        // 2nd string
  { open: 'E4', name: 'High E' },   // 1st string (thinnest)
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

const NUM_FRETS = 8;

// Get all notes for preloading
const ALL_NOTES = STRINGS.flatMap(({ open }) =>
  Array.from({ length: NUM_FRETS + 1 }, (_, fret) => getNoteAtFret(open, fret))
);

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

  const client = useClient();
  if (!client) {
    return <div>Loading guitar...</div>;
  }

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
          {[...STRINGS].reverse().map(({ open, name }, stringIndex) => {
            return (
              <React.Fragment key={name}>
                {/* String name */}
                <div className="text-right pr-2 text-sm font-mono text-amber-200 flex items-center justify-end">
                  {name}
                </div>

                {/* Frets */}
                {Array.from({ length: NUM_FRETS + 1 }, (_, fret) => {
                  const note = getNoteAtFret(open, fret);
                  const isActive = activeNotes.includes(note);

                  return (
                    <button
                      key={`${name}-${fret}`}
                      onMouseDown={() => noteOn(note)}
                      onMouseUp={() => noteOff(note)}
                      onMouseLeave={() => noteOff(note)}
                      className={`
                        h-8
                        border-r-2 border-amber-950
                        ${fret === 0 ? 'border-l-4 border-l-amber-950' : ''}
                        ${isActive
                          ? 'bg-cyan-400 z-10'
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
                        isActive ? 'bg-cyan-600' :
                        stringIndex < 3
                          ? 'bg-amber-200'
                          : 'bg-amber-300'
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
    </div>
  );
}
