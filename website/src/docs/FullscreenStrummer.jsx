import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useStrudelSound } from './useStrudelSound';
import useClient from '@src/useClient.mjs';
import { getAudioContext, superdough } from '@strudel/webaudio';

// Common guitar chord voicings (low E to high E, null = muted string)
const CHORD_VOICINGS = {
  // Major chords
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

  // Minor chords
  'Am': [null, 'A2', 'E3', 'A3', 'C4', 'E4'],
  'Bm': [null, 'B2', 'Gb3', 'B3', 'D4', 'Gb4'],
  'Cm': [null, null, 'C3', 'G3', 'C4', 'Eb4'],
  'Dm': [null, null, 'D3', 'A3', 'D4', 'F4'],
  'Em': ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
  'Fm': ['F2', 'C3', 'F3', 'Ab3', 'C4', 'F4'],
  'Gm': ['G2', 'D3', 'G3', 'Bb3', 'D4', 'G4'],
  'Bbm': [null, 'Bb2', 'F3', 'Bb3', 'Db4', 'F4'],

  // Sus chords
  'Dsus2': [null, null, 'D3', 'A3', 'D4', 'E4'],
  'Dsus4': [null, null, 'D3', 'A3', 'D4', 'G4'],
  'Asus2': [null, 'A2', 'E3', 'A3', 'B3', 'E4'],
  'Asus4': [null, 'A2', 'E3', 'A3', 'D4', 'E4'],
  'Csus2': [null, 'C3', 'G3', 'C4', 'D4', 'G4'],
  'Gsus4': ['G2', 'B2', 'D3', 'G3', 'C4', 'G4'],

  // Add9 chords
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

  // Major 7th
  'Cmaj7': [null, 'C3', 'E3', 'G3', 'B3', 'E4'],
  'Fmaj7': [null, null, 'F3', 'A3', 'C4', 'E4'],
  'Gmaj7': ['G2', 'B2', 'D3', 'G3', 'B3', 'Gb4'],
  'Amaj7': [null, 'A2', 'E3', 'Ab3', 'Db4', 'E4'],
  'Dmaj7': [null, null, 'D3', 'A3', 'Db4', 'Gb4'],

  // Minor 7th
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

function FullscreenStrumZone({ chord, notes, onStrum, isActive }) {
  const zoneRef = useRef(null);
  const strumState = useRef({
    isActive: false,
    centerX: 0,
    centerY: 0,
    lastDirection: null,
  });

  const STRUM_THRESHOLD = 15;

  const getDirectionFromAngle = (angle) => {
    const deg = angle * (180 / Math.PI);
    if (deg >= -45 && deg < 45) return 'right';
    if (deg >= 45 && deg < 135) return 'down';
    if (deg >= -135 && deg < -45) return 'up';
    return 'left';
  };

  const handlePointerDown = (e) => {
    if (!zoneRef.current) return;
    zoneRef.current.setPointerCapture(e.pointerId);

    const rect = zoneRef.current.getBoundingClientRect();
    strumState.current = {
      isActive: true,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      lastDirection: null,
    };
  };

  const handlePointerMove = (e) => {
    if (!strumState.current.isActive) return;

    const { centerX, centerY } = strumState.current;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > STRUM_THRESHOLD) {
      const angle = Math.atan2(deltaY, deltaX);
      const direction = getDirectionFromAngle(angle);

      if (strumState.current.lastDirection !== direction) {
        const audioDirection = (direction === 'up' || direction === 'left') ? 'up' : 'down';
        onStrum(notes, audioDirection);
        strumState.current.lastDirection = direction;
      }
    }
  };

  const handlePointerUp = (e) => {
    if (zoneRef.current) {
      zoneRef.current.releasePointerCapture(e.pointerId);
    }
    strumState.current.isActive = false;
    strumState.current.lastDirection = null;
  };

  return (
    <div
      ref={zoneRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`
        select-none touch-none cursor-grab active:cursor-grabbing
        flex flex-col items-center justify-center
        rounded-2xl flex-1 min-h-0
        transition-all duration-150
        ${isActive
          ? 'bg-cyan-600 shadow-lg shadow-cyan-500/50 scale-[1.02]'
          : 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600'
        }
      `}
    >
      <span className={`text-4xl md:text-6xl font-bold ${isActive ? 'text-white' : 'text-gray-100'}`}>
        {chord}
      </span>
    </div>
  );
}

export function FullscreenStrummer({ defaultSound = 'gm_acoustic_guitar_nylon' }) {
  const {
    sound,
    loading,
    playStrum,
    initAudio,
  } = useStrudelSound({ defaultSound, notes: ALL_CHORD_NOTES });

  const [activeChord, setActiveChord] = useState(null);
  const [chords, setChords] = useState([]);
  const [audioStarted, setAudioStarted] = useState(false);

  // Parse chords from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chordsParam = params.get('chords');
    if (chordsParam) {
      const parsedChords = chordsParam.split(',').filter(c => CHORD_VOICINGS[c]);
      setChords(parsedChords);
    }
  }, []);

  const handleStartAudio = async () => {
    await initAudio();
    // Play a quick hi-hat to confirm audio is working
    try {
      const ac = getAudioContext();
      superdough({ s: 'hh' }, ac.currentTime + 0.01, 0.1);
    } catch (e) {
      console.error('Start sound error:', e);
    }
    setAudioStarted(true);
  };

  const handleStrum = useCallback((notes, direction) => {
    const playableNotes = notes.filter(n => n !== null);
    playStrum(playableNotes, direction);

    const chordName = Object.entries(CHORD_VOICINGS).find(
      ([, voicing]) => JSON.stringify(voicing) === JSON.stringify(notes)
    )?.[0];

    setActiveChord(chordName);
    setTimeout(() => setActiveChord(null), 300);
  }, [playStrum]);

  const handleBack = () => {
    window.history.back();
  };

  const client = useClient();
  if (!client) {
    return <div className="fixed inset-0 bg-gray-950 flex items-center justify-center text-white">Loading...</div>;
  }

  if (chords.length === 0) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center text-white p-4">
        <p className="text-xl mb-4">No chords specified</p>
        <p className="text-gray-400 mb-6">Add chords to the URL like: ?chords=C,G,Am,F</p>
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Show start screen on mobile to unlock audio
  if (!audioStarted) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center text-white p-4">
        <p className="text-2xl mb-2 font-bold">{chords.join(' - ')}</p>
        <p className="text-gray-400 mb-8">Tap to start</p>
        <button
          onClick={handleStartAudio}
          className="w-32 h-32 rounded-full bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-400 flex items-center justify-center text-6xl shadow-lg shadow-cyan-500/30 transition-all active:scale-95"
        >
          ▶
        </button>
      </div>
    );
  }

  // Determine grid layout based on number of chords
  const getGridClass = () => {
    if (chords.length <= 2) return 'grid-cols-2';
    if (chords.length <= 4) return 'grid-cols-2 grid-rows-2';
    if (chords.length <= 6) return 'grid-cols-3 grid-rows-2';
    return 'grid-cols-4 grid-rows-2';
  };

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-900 border-b border-gray-800">
        <button
          onClick={handleBack}
          className="px-4 py-2 text-gray-400 hover:text-white"
        >
          ← Back
        </button>
        <span className="text-gray-400 text-sm">
          {loading ? 'Loading sounds...' : 'Drag to strum'}
        </span>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Chord grid */}
      <div className={`flex-1 grid ${getGridClass()} gap-3 p-3`}>
        {chords.map((chord, index) => (
          <FullscreenStrumZone
            key={`${chord}-${index}`}
            chord={chord}
            notes={CHORD_VOICINGS[chord]}
            onStrum={handleStrum}
            isActive={activeChord === chord}
          />
        ))}
      </div>
    </div>
  );
}

// Helper to generate shareable URL
export function getStrummerURL(chords, baseUrl = '') {
  const validChords = chords.filter(c => CHORD_VOICINGS[c]);
  if (validChords.length === 0) return null;
  return `${baseUrl}learn/strummer/?chords=${validChords.join(',')}`;
}

// Export chord voicings for validation
export { CHORD_VOICINGS };
