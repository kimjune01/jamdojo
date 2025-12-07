import { useState, useEffect, useCallback, useRef } from 'react';
import { usePitchDetection } from './usePitchDetection';
import useClient from '@src/useClient.mjs';
import { getAudioContext, initAudioOnFirstClick, superdough } from '@strudel/webaudio';
import { prebake } from '../repl/prebake.mjs';
import { loadModules } from '../repl/util.mjs';

// SSR-safe initialization
let prebaked, modulesLoading, audioReady;
if (typeof window !== 'undefined') {
  prebaked = prebake();
  modulesLoading = loadModules();
  audioReady = initAudioOnFirstClick();
}

let initialized = false;

// Chord library - each chord has 4 notes
const CHORD_LIBRARY = {
  'C Major': ['C4', 'E4', 'G4', 'C5'],
  'C Minor': ['C4', 'Eb4', 'G4', 'C5'],
  'G Major': ['G3', 'B3', 'D4', 'G4'],
  'D Minor': ['D4', 'F4', 'A4', 'D5'],
  'A Minor': ['A3', 'C4', 'E4', 'A4'],
  'E Minor': ['E3', 'G3', 'B3', 'E4'],
  'F Major': ['F3', 'A3', 'C4', 'F4'],
  'C7': ['C4', 'E4', 'G4', 'Bb4'],
  'Am7': ['A3', 'C4', 'E4', 'G4'],
  'Dm7': ['D4', 'F4', 'A4', 'C5'],
  'G7': ['G3', 'B3', 'D4', 'F4'],
  'Cmaj7': ['C4', 'E4', 'G4', 'B4'],
};

// Button colors - classic Simon style
const BUTTON_COLORS = [
  { bg: 'bg-red-600', hover: 'hover:bg-red-500', active: 'bg-red-400', glow: 'shadow-red-500/50' },
  { bg: 'bg-blue-600', hover: 'hover:bg-blue-500', active: 'bg-blue-400', glow: 'shadow-blue-500/50' },
  { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-400', active: 'bg-yellow-300', glow: 'shadow-yellow-500/50' },
  { bg: 'bg-green-600', hover: 'hover:bg-green-500', active: 'bg-green-400', glow: 'shadow-green-500/50' },
];

// Storage keys
const STORAGE_KEY = 'pitch-simon-highscore';
const OCTAVE_OFFSET_KEY = 'pitch-simon-octave-offset';

// Helper functions
function loadHighScore() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score) {
  try {
    localStorage.setItem(STORAGE_KEY, score.toString());
  } catch {
    // Silently fail
  }
}

function loadOctaveOffset() {
  try {
    const val = parseInt(localStorage.getItem(OCTAVE_OFFSET_KEY));
    return isNaN(val) ? 0 : Math.max(-2, Math.min(2, val));
  } catch {
    return 0;
  }
}

function saveOctaveOffset(offset) {
  try {
    localStorage.setItem(OCTAVE_OFFSET_KEY, offset.toString());
  } catch {
    // Silently fail
  }
}

function generateSequence(chordNotes, length) {
  const sequence = [];
  for (let i = 0; i < length; i++) {
    let note;
    // Avoid runs of more than 2 of the same note
    if (sequence.length >= 2 && sequence[sequence.length - 1] === sequence[sequence.length - 2]) {
      // Last two notes are the same, pick a different note
      const otherNotes = chordNotes.filter(n => n !== sequence[sequence.length - 1]);
      note = otherNotes[Math.floor(Math.random() * otherNotes.length)];
    } else {
      note = chordNotes[Math.floor(Math.random() * chordNotes.length)];
    }
    sequence.push(note);
  }
  return sequence;
}

// Pick a random note that won't create a run of 3+
function pickNextNote(chordNotes, existingSequence) {
  if (existingSequence.length >= 2 &&
      existingSequence[existingSequence.length - 1] === existingSequence[existingSequence.length - 2]) {
    // Last two notes are the same, pick a different note
    const otherNotes = chordNotes.filter(n => n !== existingSequence[existingSequence.length - 1]);
    return otherNotes[Math.floor(Math.random() * otherNotes.length)];
  }
  return chordNotes[Math.floor(Math.random() * chordNotes.length)];
}

function getNextLength(currentLength) {
  if (currentLength < 6) return currentLength + 1;
  if (currentLength < 10) {
    return Math.random() < 0.7 ? currentLength + 1 : currentLength;
  }
  return Math.random() < 0.5 ? currentLength + 1 : currentLength;
}

// Shift a note by octave offset
function shiftNoteOctave(note, offset) {
  const match = note.match(/^([A-G][#b]?)(\d+)$/);
  if (!match) return note;
  const [, pitchClass, octave] = match;
  return `${pitchClass}${parseInt(octave) + offset}`;
}

export function PitchSimon() {
  const client = useClient();

  // Pitch detection hook - safe to call because it has its own client guard
  const {
    isListening,
    currentNote,
    clarity,
    startListening,
    stopListening,
  } = usePitchDetection();

  // Game state
  const [gameState, setGameState] = useState('menu');  // 'menu', 'playing', 'listening', 'success', 'failed'
  const [mode, setMode] = useState('auto');
  const [selectedChordName, setSelectedChordName] = useState('C Major');
  const [currentChord, setCurrentChord] = useState(null);
  const [targetSequence, setTargetSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [sequenceLength, setSequenceLength] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [activeButton, setActiveButton] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [octaveOffset, setOctaveOffset] = useState(0);  // User's octave offset (-2 to +2)
  const [settings, setSettings] = useState({
    minClarity: 0.97,
    debounceMs: 800,
  });

  // Refs for cleanup
  const playbackTimeoutRef = useRef(null);
  const lastNoteTimeRef = useRef(0);

  /**
   * Load settings from localStorage on mount
   */
  useEffect(() => {
    if (client) {
      setHighScore(loadHighScore());
      setOctaveOffset(loadOctaveOffset());
    }
  }, [client]);

  /**
   * Save octave offset when it changes
   */
  useEffect(() => {
    if (client) {
      saveOctaveOffset(octaveOffset);
    }
  }, [client, octaveOffset]);

  /**
   * Initialize audio system
   */
  const initAudio = useCallback(async () => {
    if (!initialized) {
      await Promise.all([modulesLoading, prebaked, audioReady]);
      initialized = true;
    }
  }, []);

  /**
   * Play a single note with visual feedback
   */
  const playNote = useCallback(async (note, buttonIndex) => {
    await initAudio();
    const ac = getAudioContext();
    const t = ac.currentTime + 0.01;

    setActiveButton(buttonIndex);
    await superdough({ s: 'triangle', note }, t, 1.0);

    setTimeout(() => setActiveButton(null), 1000);
  }, [initAudio]);

  /**
   * Play entire sequence with delays
   */
  const playSequence = useCallback(async (notes, chord) => {
    await initAudio();
    const ac = getAudioContext();

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      const buttonIndex = chord.indexOf(note);

      // Highlight button
      setActiveButton(buttonIndex);

      // Play note immediately
      const t = ac.currentTime;
      await superdough({ s: 'triangle', note }, t, 1.0);

      // Wait for note duration + gap
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Unhighlight button
      setActiveButton(null);
    }

    // After playback, switch to listening mode
    setGameState('listening');
    startListening();
  }, [initAudio, startListening]);

  /**
   * Play sequence fast (2x speed) - for recap on failure
   */
  const playSequenceFast = useCallback(async (notes, chord) => {
    await initAudio();
    const ac = getAudioContext();

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      const buttonIndex = chord.indexOf(note);

      setActiveButton(buttonIndex);
      const t = ac.currentTime;
      await superdough({ s: 'triangle', note }, t, 0.4);

      // Half the normal delay (600ms instead of 1200ms)
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveButton(null);
    }
  }, [initAudio]);

  /**
   * Play feedback sound
   */
  const playFeedback = useCallback(async (type) => {
    await initAudio();
    const ac = getAudioContext();
    const t = ac.currentTime + 0.01;

    if (type === 'correct') {
      // Happy chime
      await superdough({ s: 'triangle', note: 'C5' }, t, 0.15);
    } else if (type === 'wrong') {
      // Buzzer
      await superdough({ s: 'sawtooth', note: 'C2' }, t, 0.3);
    } else if (type === 'complete') {
      // Ascending arpeggio
      const notes = ['C4', 'E4', 'G4', 'C5'];
      for (let i = 0; i < notes.length; i++) {
        await superdough({ s: 'triangle', note: notes[i] }, t + (i * 0.1), 0.15);
      }
    }
  }, [initAudio]);

  /**
   * Start new game
   */
  const handleStart = useCallback(async () => {
    await initAudio();
    await startListening();

    // Select chord
    let chord;
    if (mode === 'auto') {
      const chordNames = Object.keys(CHORD_LIBRARY);
      const randomName = chordNames[Math.floor(Math.random() * chordNames.length)];
      chord = CHORD_LIBRARY[randomName];
      setSelectedChordName(randomName);
    } else {
      chord = CHORD_LIBRARY[selectedChordName];
    }

    setCurrentChord(chord);
    setSequenceLength(1);
    setScore(0);
    setUserSequence([]);

    // Generate and play sequence
    const sequence = generateSequence(chord, 1);
    setTargetSequence(sequence);
    setGameState('playing');

    // Start playback after short delay
    setTimeout(() => {
      playSequence(sequence, chord);
    }, 500);
  }, [mode, selectedChordName, initAudio, startListening, playSequence]);

  /**
   * Next round - append one new note to existing sequence
   */
  const handleNextRound = useCallback(async () => {
    const points = sequenceLength;
    setScore(prev => prev + points);

    // Append one random note (avoiding runs of 3+)
    const newNote = pickNextNote(currentChord, targetSequence);
    const newSequence = [...targetSequence, newNote];

    setSequenceLength(newSequence.length);
    setTargetSequence(newSequence);
    setUserSequence([]);
    setGameState('playing');

    setTimeout(() => {
      playSequence(newSequence, currentChord);
    }, 500);
  }, [sequenceLength, currentChord, targetSequence, playSequence]);

  /**
   * Restart game
   */
  const handleRestart = useCallback(() => {
    stopListening();
    setGameState('menu');
    setUserSequence([]);
    setTargetSequence([]);
    setCurrentChord(null);
  }, [stopListening]);

  /**
   * Manual button click (for testing/accessibility)
   */
  const handleButtonClick = useCallback((note, index) => {
    if (gameState !== 'listening') {
      playNote(note, index);
    }
  }, [gameState, playNote]);

  // Effect: Monitor pitch detection during listening state
  useEffect(() => {
    if (gameState !== 'listening' || !currentNote || clarity < settings.minClarity) {
      return;
    }

    // Debounce
    const now = Date.now();
    if (now - lastNoteTimeRef.current < settings.debounceMs) {
      return;
    }

    // Apply octave offset to the detected note for comparison
    const adjustedNote = shiftNoteOctave(currentNote, octaveOffset);

    const isNoteInChord = currentChord.includes(adjustedNote);

    // Ignore notes outside the chord
    if (!isNoteInChord) {
      return;
    }

    lastNoteTimeRef.current = now;

    const expectedNote = targetSequence[userSequence.length];

    if (adjustedNote === expectedNote) {
      // Correct note!
      const newUserSequence = [...userSequence, adjustedNote];
      setUserSequence(newUserSequence);
      playFeedback('correct');

      const buttonIndex = currentChord.indexOf(adjustedNote);
      setActiveButton(buttonIndex);
      setTimeout(() => setActiveButton(null), 300);

      // Check if sequence complete
      if (newUserSequence.length === targetSequence.length) {
        setGameState('success');
        playFeedback('complete');
      }
    } else {
      // Wrong note from chord - game over
      setGameState('failed');
      playFeedback('wrong');

      // Save high score
      if (score > highScore) {
        setHighScore(score);
        saveHighScore(score);
      }
    }
  }, [currentNote, clarity, gameState, userSequence, targetSequence, currentChord, settings, score, highScore, playFeedback, octaveOffset]);

  // Auto-advance to next round on success
  useEffect(() => {
    if (gameState === 'success') {
      const timer = setTimeout(() => {
        handleNextRound();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, handleNextRound]);

  // Play fast recap on failure
  useEffect(() => {
    if (gameState === 'failed' && targetSequence.length > 0 && currentChord) {
      // Small delay after wrong buzzer, then play recap
      const timer = setTimeout(() => {
        playSequenceFast(targetSequence, currentChord);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState, targetSequence, currentChord, playSequenceFast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
    };
  }, []);

  const getStatusMessage = () => {
    switch (gameState) {
      case 'menu':
        return 'Choose a mode and start the game!';
      case 'playing':
        return 'Listen carefully...';
      case 'listening':
        return `Sing note ${userSequence.length + 1} of ${targetSequence.length}`;
      case 'success':
        return 'Perfect! Get ready for the next round...';
      case 'failed':
        return 'Game Over! Try again?';
      default:
        return '';
    }
  };

  if (!client) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-2 border-lineHighlight rounded-xl p-4 bg-gradient-to-br from-gray-900 to-gray-800">
          <h3 className="font-mono font-bold text-foreground text-sm mb-3">Detection Settings</h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-mono text-xs text-gray-300">
                  Min Confidence: <span className="text-green-400 font-bold">{(settings.minClarity * 100).toFixed(0)}%</span>
                </label>
              </div>
              <input
                type="range"
                min="90"
                max="100"
                step="1"
                value={settings.minClarity * 100}
                onChange={(e) => setSettings(prev => ({ ...prev, minClarity: parseFloat(e.target.value) / 100 }))}
                className="w-1/2 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <div className="text-xs text-gray-500 mt-1 font-mono">
                Higher = fewer false positives
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-mono text-xs text-gray-300">
                  Debounce: <span className="text-blue-400 font-bold">{settings.debounceMs}ms</span>
                </label>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={settings.debounceMs}
                onChange={(e) => setSettings(prev => ({ ...prev, debounceMs: parseInt(e.target.value) }))}
                className="w-1/2 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1 font-mono">
                Min time between notes
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Screen */}
      {gameState === 'menu' && (
        <div className="flex flex-col gap-4">
          <div className="border-2 border-lineHighlight rounded-xl p-6 bg-gradient-to-br from-gray-900 to-gray-800">
            <h2 className="text-xl font-bold font-mono text-foreground mb-4">Choose Mode</h2>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setMode('auto')}
                className={`flex-1 px-6 py-4 rounded-lg font-mono font-bold transition-all ${
                  mode === 'auto'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Auto (Random Chords)
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`flex-1 px-6 py-4 rounded-lg font-mono font-bold transition-all ${
                  mode === 'manual'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Manual (Choose Chord)
              </button>
            </div>

            {mode === 'manual' && (
              <div className="mb-6">
                <label className="block text-sm font-mono text-gray-300 mb-2">Select Chord:</label>
                <select
                  value={selectedChordName}
                  onChange={(e) => setSelectedChordName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg font-mono bg-gray-700 text-foreground border border-gray-600 focus:outline-none focus:border-cyan-500"
                >
                  {Object.keys(CHORD_LIBRARY).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleStart}
              className="w-full px-8 py-4 rounded-xl font-mono font-bold text-lg bg-green-600 hover:bg-green-700 text-white transition-all shadow-xl hover:shadow-green-500/50 hover:scale-105"
            >
              🎤 Start Game
            </button>
          </div>

          {highScore > 0 && (
            <div className="text-center">
              <div className="text-sm text-gray-400 font-mono">High Score</div>
              <div className="text-3xl font-bold text-cyan-400 font-mono">{highScore}</div>
            </div>
          )}

          <div className="text-sm text-gray-500 font-mono space-y-2">
            <p><strong>How to Play:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Listen to the sequence of notes</li>
              <li>Sing them back in the same order</li>
              <li>Each round adds more notes</li>
              <li>One wrong note = game over!</li>
            </ul>
          </div>
        </div>
      )}

      {/* Game Screen */}
      {gameState !== 'menu' && (
        <>
          {/* Chord Name with Settings/Menu buttons inline */}
          <div className="flex justify-between items-center">
            <div className="text-4xl md:text-5xl font-bold font-mono text-foreground">
              {selectedChordName}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-3 py-1 rounded-lg font-mono text-sm font-bold bg-gray-700 hover:bg-gray-600 text-white transition-all"
              >
                ⚙️
              </button>
              <button
                onClick={handleRestart}
                className="px-3 py-1 rounded-lg font-mono text-sm font-bold bg-gray-600 hover:bg-gray-700 text-white transition-all"
              >
                Menu
              </button>
            </div>
          </div>

          {/* Score Display */}
          <div className="flex justify-around text-center border-2 border-lineHighlight rounded-xl p-4 bg-gradient-to-br from-gray-900 to-gray-800">
            <div>
              <div className="text-sm text-gray-400 font-mono">Score</div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">{score}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 font-mono">Best</div>
              <div className="text-2xl font-bold text-green-400 font-mono">{highScore}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 font-mono">Length</div>
              <div className="text-2xl font-bold text-yellow-400 font-mono">{sequenceLength}</div>
            </div>
          </div>

          {/* Simon Grid with Center Circle */}
          <div className="relative max-w-2xl w-full mx-auto px-4">
            <div className="grid grid-cols-2 gap-6 aspect-square">
              {currentChord && currentChord.map((note, i) => (
                <button
                  key={i}
                  onClick={() => handleButtonClick(note, i)}
                  className={`
                    relative rounded-2xl transition-all duration-150 transform
                    ${BUTTON_COLORS[i].bg}
                    ${activeButton === i ? BUTTON_COLORS[i].active + ' scale-95' : 'scale-100'}
                    ${activeButton === i ? 'shadow-2xl ' + BUTTON_COLORS[i].glow : 'shadow-lg'}
                    ${activeButton === i ? 'brightness-125' : 'brightness-100'}
                    ${gameState !== 'listening' ? 'cursor-default' : BUTTON_COLORS[i].hover + ' cursor-pointer'}
                    font-mono font-bold text-white
                    flex items-center justify-center
                    text-6xl md:text-7xl
                    min-h-[200px] md:min-h-[250px]
                  `}
                  disabled={gameState !== 'listening'}
                >
                  <div className={`transition-opacity ${activeButton === i ? 'opacity-100' : 'opacity-70'}`}>
                    {note}
                  </div>
                </button>
              ))}
            </div>

            {/* Center Circle - Audio Input Display with Octave Controls */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div
                className={`
                  w-28 h-28 md:w-36 md:h-36 rounded-full
                  flex flex-col items-center justify-center
                  border-4 transition-all duration-150
                  ${gameState === 'listening'
                    ? clarity >= settings.minClarity
                      ? 'bg-gray-900/95 border-green-500 shadow-lg shadow-green-500/50'
                      : 'bg-gray-900/95 border-gray-500'
                    : 'bg-gray-900/95 border-gray-700'
                  }
                `}
              >
                {/* Up arrow for octave */}
                <button
                  onClick={() => setOctaveOffset(prev => Math.min(prev + 1, 2))}
                  className="text-gray-400 hover:text-white text-xs leading-none transition-colors"
                  title="Shift up one octave"
                >
                  ▲
                </button>

                {gameState === 'listening' ? (
                  <>
                    <div className={`text-xl md:text-2xl font-bold font-mono ${
                      currentNote && clarity >= settings.minClarity ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {currentNote ? shiftNoteOctave(currentNote, octaveOffset) : '🎤'}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {octaveOffset !== 0 && <span className="text-cyan-400">{octaveOffset > 0 ? '+' : ''}{octaveOffset}oct </span>}
                      {Math.round(clarity * 100)}%
                    </div>
                  </>
                ) : gameState === 'failed' ? (
                  <button
                    onClick={handleStart}
                    className="text-sm font-mono font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all pointer-events-auto"
                  >
                    Retry
                  </button>
                ) : (
                  <div className="text-2xl">
                    {gameState === 'playing' ? '🔊' : '✨'}
                  </div>
                )}

                {/* Down arrow for octave */}
                <button
                  onClick={() => setOctaveOffset(prev => Math.max(prev - 1, -2))}
                  className="text-gray-400 hover:text-white text-xs leading-none transition-colors"
                  title="Shift down one octave"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="text-center text-lg font-mono">
            <div className="text-gray-300">{getStatusMessage()}</div>
            {gameState === 'listening' && (
              <div className="text-sm text-gray-500 mt-1">
                {userSequence.map((note, i) => (
                  <span key={i} className="inline-block mx-1 text-green-400">✓</span>
                ))}
              </div>
            )}
          </div>

        </>
      )}
    </div>
  );
}
