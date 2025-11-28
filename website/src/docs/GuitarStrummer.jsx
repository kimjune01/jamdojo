import React, { useState, useCallback } from 'react';
import { useStrudelSound } from './useStrudelSound';
import { SoundSelector, CodeDisplay } from './SoundSelector';
import { StrumZone } from './StrumZone';
import useClient from '@src/useClient.mjs';

// Common guitar chord voicings (low E to high E, null = muted string)
const CHORD_VOICINGS = {
  // Major chords (most common in pop)
  'C': [null, 'C3', 'E3', 'G3', 'C4', 'E4'],
  'D': [null, null, 'D3', 'A3', 'D4', 'Gb4'],
  'E': ['E2', 'B2', 'E3', 'Ab3', 'B3', 'E4'],
  'F': ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],
  'G': ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'],
  'A': [null, 'A2', 'E3', 'A3', 'Db4', 'E4'],
  'B': [null, 'B2', 'Gb3', 'B3', 'Eb4', 'Gb4'],
  'Bb': [null, 'Bb2', 'F3', 'Bb3', 'D4', 'F4'],
  'Eb': [null, null, 'Eb3', 'Bb3', 'Eb4', 'G4'],
  'Ab': [null, null, 'Ab3', 'Eb4', 'Ab4', 'C5'],

  // Minor chords (essential for pop progressions)
  'Am': [null, 'A2', 'E3', 'A3', 'C4', 'E4'],
  'Bm': [null, 'B2', 'Gb3', 'B3', 'D4', 'Gb4'],
  'Cm': [null, null, 'C3', 'G3', 'C4', 'Eb4'],
  'Dm': [null, null, 'D3', 'A3', 'D4', 'F4'],
  'Em': ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
  'Fm': ['F2', 'C3', 'F3', 'Ab3', 'C4', 'F4'],
  'Gm': ['G2', 'D3', 'G3', 'Bb3', 'D4', 'G4'],
  'Bbm': [null, 'Bb2', 'F3', 'Bb3', 'Db4', 'F4'],

  // Sus chords (very common in pop/rock)
  'Dsus2': [null, null, 'D3', 'A3', 'D4', 'E4'],
  'Dsus4': [null, null, 'D3', 'A3', 'D4', 'G4'],
  'Asus2': [null, 'A2', 'E3', 'A3', 'B3', 'E4'],
  'Asus4': [null, 'A2', 'E3', 'A3', 'D4', 'E4'],
  'Csus2': [null, 'C3', 'G3', 'C4', 'D4', 'G4'],
  'Gsus4': ['G2', 'B2', 'D3', 'G3', 'C4', 'G4'],

  // Add9 chords (pop/contemporary)
  'Cadd9': [null, 'C3', 'E3', 'G3', 'D4', 'E4'],
  'Gadd9': ['G2', 'B2', 'D3', 'G3', 'A3', 'G4'],
  'Dadd9': [null, null, 'D3', 'A3', 'E4', 'Gb4'],

  // 7th chords
  'A7': [null, 'A2', 'E3', 'G3', 'Db4', 'E4'],
  'B7': [null, 'B2', 'Eb3', 'A3', 'B3', 'Eb4'],
  'C7': [null, 'C3', 'E3', 'Bb3', 'C4', 'E4'],
  'D7': [null, null, 'D3', 'A3', 'C4', 'Gb4'],
  'E7': ['E2', 'B2', 'D3', 'Ab3', 'B3', 'E4'],
  'G7': ['G2', 'B2', 'D3', 'G3', 'B3', 'F4'],

  // Major 7th (jazz/pop ballads)
  'Cmaj7': [null, 'C3', 'E3', 'G3', 'B3', 'E4'],
  'Fmaj7': [null, null, 'F3', 'A3', 'C4', 'E4'],
  'Gmaj7': ['G2', 'B2', 'D3', 'G3', 'B3', 'Gb4'],
  'Amaj7': [null, 'A2', 'E3', 'Ab3', 'Db4', 'E4'],
  'Dmaj7': [null, null, 'D3', 'A3', 'Db4', 'Gb4'],

  // Minor 7th (neo-soul/R&B/pop)
  'Am7': [null, 'A2', 'E3', 'G3', 'C4', 'E4'],
  'Bm7': [null, 'B2', 'D3', 'A3', 'B3', 'Gb4'],
  'Dm7': [null, null, 'D3', 'A3', 'C4', 'F4'],
  'Em7': ['E2', 'B2', 'D3', 'G3', 'B3', 'E4'],
  'Fm7': ['F2', 'Ab2', 'Eb3', 'Ab3', 'C4', 'F4'],
  'Gm7': ['G2', 'D3', 'F3', 'Bb3', 'D4', 'G4'],
};

// Get all unique notes for preloading
const ALL_CHORD_NOTES = [...new Set(
  Object.values(CHORD_VOICINGS)
    .flat()
    .filter(n => n !== null)
)];

// Chord categories for UI organization
const CHORD_CATEGORIES = [
  { name: 'Major', chords: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Bb'] },
  { name: 'Minor', chords: ['Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm'] },
  { name: 'Sus', chords: ['Dsus2', 'Dsus4', 'Asus2', 'Asus4', 'Csus2', 'Gsus4'] },
  { name: 'Add9', chords: ['Cadd9', 'Gadd9', 'Dadd9'] },
  { name: '7th', chords: ['A7', 'B7', 'C7', 'D7', 'E7', 'G7'] },
  { name: 'Maj7', chords: ['Cmaj7', 'Dmaj7', 'Fmaj7', 'Gmaj7', 'Amaj7'] },
  { name: 'Min7', chords: ['Am7', 'Bm7', 'Dm7', 'Em7', 'Gm7'] },
];

// Chord button with string diagram
function ChordButton({ chord, notes, onStrum, isActive }) {
  const stringNames = ['E', 'A', 'D', 'G', 'B', 'e'];
  const noteDisplay = notes.map((note, i) => ({
    string: stringNames[i],
    note: note ? note.replace(/[0-9]/g, '') : 'x',
    muted: note === null,
  }));

  return (
    <StrumZone
      notes={notes}
      onStrum={onStrum}
      isActive={isActive}
      className={`
        flex flex-col items-center justify-center
        rounded-xl p-4 min-w-[80px] min-h-[120px]
        transition-all duration-150
        ${isActive
          ? 'bg-cyan-600 shadow-lg shadow-cyan-500/50 scale-105'
          : 'bg-gray-800 hover:bg-gray-700'
        }
      `}
    >
      <span className={`text-xl font-bold mb-2 ${isActive ? 'text-white' : 'text-gray-100'}`}>
        {chord}
      </span>

      {/* String diagram */}
      <div className="flex gap-0.5 text-xs font-mono">
        {noteDisplay.map((n, i) => (
          <div
            key={i}
            className={`
              w-4 h-5 flex items-center justify-center rounded-sm
              ${n.muted ? 'text-gray-500' : isActive ? 'text-cyan-200' : 'text-gray-400'}
            `}
          >
            {n.note}
          </div>
        ))}
      </div>

      {/* Strum indicator */}
      <div className={`mt-2 text-xs ${isActive ? 'text-cyan-200' : 'text-gray-500'}`}>
        drag to strum
      </div>
    </StrumZone>
  );
}

export function GuitarStrummer({ defaultSound = 'gm_acoustic_guitar_nylon' }) {
  const {
    sound,
    setSound,
    lastNote,
    loading,
    playStrum,
  } = useStrudelSound({ defaultSound, notes: ALL_CHORD_NOTES });

  const [activeChord, setActiveChord] = useState(null);
  const [lastDirection, setLastDirection] = useState(null);
  const [chordFilter, setChordFilter] = useState('');

  // Parse chord filter and get ordered list of chords to display
  const filteredChords = chordFilter.trim()
    ? chordFilter.trim().split(/\s+/).filter(c => CHORD_VOICINGS[c])
    : null;

  const handleStrum = useCallback((notes, direction, velocity = 0.8) => {
    // Filter out muted strings
    const playableNotes = notes.filter(n => n !== null);
    // Faster velocity = tighter strum (25-60ms range, quadratic)
    const strumSpeed = 60 - (velocity * velocity * 35);
    playStrum(playableNotes, direction, strumSpeed, velocity);

    // Find chord name for display
    const chordName = Object.entries(CHORD_VOICINGS).find(
      ([, voicing]) => JSON.stringify(voicing) === JSON.stringify(notes)
    )?.[0];

    setActiveChord(chordName);
    setLastDirection(direction);

    // Clear active state after animation
    setTimeout(() => {
      setActiveChord(null);
      setLastDirection(null);
    }, 300);
  }, [playStrum]);

  const client = useClient();
  if (!client) {
    return <div>Loading strummer...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <SoundSelector sound={sound} setSound={setSound} loading={loading} />

      <div className="flex gap-2">
        <input
          type="text"
          value={chordFilter}
          onChange={(e) => setChordFilter(e.target.value)}
          placeholder="C G Am F"
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
        />
        {filteredChords && filteredChords.length > 0 && (
          <a
            href={`/learn/strummer/?chords=${filteredChords.join(',')}`}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center gap-2 whitespace-nowrap"
          >
            <span>Fullscreen</span>
          </a>
        )}
      </div>

      <div className="border border-lineHighlight rounded-xl p-4 bg-gradient-to-b from-gray-900 to-gray-950">
        {filteredChords ? (
          <div className="grid grid-cols-4 gap-2">
            {filteredChords.map((chord, index) => (
              <ChordButton
                key={`${chord}-${index}`}
                chord={chord}
                notes={CHORD_VOICINGS[chord]}
                onStrum={handleStrum}
                isActive={activeChord === chord}
              />
            ))}
          </div>
        ) : (
          CHORD_CATEGORIES.map(category => (
            <div key={category.name} className="mb-4 last:mb-0">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">{category.name}</h3>
              <div className="grid grid-cols-4 gap-2">
                {category.chords.map(chord => (
                  <ChordButton
                    key={chord}
                    chord={chord}
                    notes={CHORD_VOICINGS[chord]}
                    onStrum={handleStrum}
                    isActive={activeChord === chord}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Code display */}
      <div className="font-mono text-sm p-3 bg-gray-900 rounded-lg border border-gray-800">
        <code className="text-gray-300">
          note(<span className="text-cyan-400">"[{activeChord ? CHORD_VOICINGS[activeChord].filter(n => n).join(',') : '...'}]"</span>)
          .s(<span className="text-green-400">"{sound}"</span>)
        </code>
      </div>

      <div className="text-sm text-gray-400">
        <p>Click and drag in any direction to strum</p>
      </div>
    </div>
  );
}
