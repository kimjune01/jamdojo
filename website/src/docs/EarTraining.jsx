import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAudioContext, initAudioOnFirstClick, superdough } from '@strudel/webaudio';
import { prebake } from '../repl/prebake.mjs';
import { loadModules } from '../repl/util.mjs';
import useClient from '@src/useClient.mjs';

let prebaked, modulesLoading, audioReady;
if (typeof window !== 'undefined') {
  prebaked = prebake();
  modulesLoading = loadModules();
  audioReady = initAudioOnFirstClick();
}

const INTERVALS = [
  { semitones: 1, name: 'Minor 2nd', short: 'm2' },
  { semitones: 2, name: 'Major 2nd', short: 'M2' },
  { semitones: 3, name: 'Minor 3rd', short: 'm3' },
  { semitones: 4, name: 'Major 3rd', short: 'M3' },
  { semitones: 5, name: 'Perfect 4th', short: 'P4' },
  { semitones: 7, name: 'Perfect 5th', short: 'P5' },
  { semitones: 12, name: 'Octave', short: 'P8' },
];

const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const semitoneToNote = (semitone) => {
  const octave = Math.floor(semitone / 12);
  const noteIndex = ((semitone % 12) + 12) % 12;
  return NOTE_NAMES[noteIndex] + octave;
};

const AUTO_ADVANCE_DELAY = 2000;
const ANSWER_TIME_LIMIT = 5000;

// Preload notes in the range we use (C3 to G5)
const PRELOAD_NOTES = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'];

// Module-level flag to track if piano is preloaded
let pianoPreloaded = false;

export function EarTraining() {
  const [gameState, setGameState] = useState('idle'); // idle, loading, playing, answered, finished
  const [currentInterval, setCurrentInterval] = useState(null);
  const [rootNote, setRootNote] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [round, setRound] = useState(0);
  const [totalRounds] = useState(10);
  const [timeLeft, setTimeLeft] = useState(ANSWER_TIME_LIMIT);
  const initialized = useRef(false);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const usedCombos = useRef(new Set());

  const initAudio = useCallback(async () => {
    if (!initialized.current) {
      await Promise.all([modulesLoading, prebaked, audioReady]);
      initialized.current = true;
    }
  }, []);

  const preloadPiano = useCallback(async () => {
    if (pianoPreloaded) return;
    await initAudio();
    const ac = getAudioContext();
    // Preload all notes by playing them silently
    for (const note of PRELOAD_NOTES) {
      await superdough({ s: 'piano', note, gain: 0 }, ac.currentTime + 0.01, 0.01);
    }
    pianoPreloaded = true;
  }, [initAudio]);

  const playNote = useCallback(async (note, delay = 0) => {
    await initAudio();
    const ac = getAudioContext();
    const t = ac.currentTime + delay + 0.01;
    await superdough({ s: 'piano', note, gain: 0.8 }, t, 1);
  }, [initAudio]);

  const playInterval = useCallback(async (rootSemitone, interval) => {
    const rootNoteName = semitoneToNote(rootSemitone);
    const secondNoteName = semitoneToNote(rootSemitone + interval.semitones);

    await playNote(rootNoteName, 0);
    await playNote(secondNoteName, 0.6);
  }, [playNote]);

  const startGame = useCallback(async () => {
    setGameState('loading');
    await preloadPiano();
    usedCombos.current.clear();
    setScore({ correct: 0, total: 0 });
    setRound(1);
    setGameState('playing');
    nextQuestion(1);
  }, [preloadPiano]);

  const stopCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    // Always clear any existing timer first
    stopCountdown();
    setTimeLeft(ANSWER_TIME_LIMIT);
    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          return 0;
        }
        return prev - 100;
      });
    }, 100);
  }, [stopCountdown]);

  const nextQuestion = useCallback((roundNum) => {
    if (roundNum > totalRounds) {
      setGameState('finished');
      stopCountdown();
      return;
    }

    // Generate unique combination
    let interval, root, comboKey;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      interval = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
      // Random root note between C3 (36) and G4 (55)
      root = 36 + Math.floor(Math.random() * 20);
      comboKey = `${root}-${interval.semitones}`;
      attempts++;
    } while (usedCombos.current.has(comboKey) && attempts < maxAttempts);

    usedCombos.current.add(comboKey);

    setCurrentInterval(interval);
    setRootNote(root);
    setSelectedAnswer(null);
    setRound(roundNum);

    // Play after a short delay, then start countdown
    setTimeout(() => {
      playInterval(root, interval);
      startCountdown();
    }, 300);
  }, [playInterval, totalRounds, startCountdown, stopCountdown]);

  const handleAnswer = useCallback((interval, timedOut = false) => {
    if (gameState !== 'playing') return;

    stopCountdown();
    setSelectedAnswer(timedOut ? null : interval);
    setGameState('answered');

    const isCorrect = !timedOut && interval?.semitones === currentInterval?.semitones;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  }, [gameState, currentInterval, stopCountdown]);

  const handleNext = useCallback(() => {
    setGameState('playing');
    nextQuestion(round + 1);
  }, [round, nextQuestion]);

  // Handle timeout
  useEffect(() => {
    if (timeLeft === 0 && gameState === 'playing') {
      handleAnswer(null, true);
    }
  }, [timeLeft, gameState, handleAnswer]);

  const replayInterval = useCallback(() => {
    if (rootNote && currentInterval) {
      playInterval(rootNote, currentInterval);
    }
  }, [rootNote, currentInterval, playInterval]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const client = useClient();
  if (!client) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      {/* Instructions - only show before starting */}
      {gameState === 'idle' && (
        <div className="bg-background border border-lineHighlight rounded-lg p-4">
          <h3 className="font-bold mb-2">How to play:</h3>
          <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
            <li>Click Start to begin</li>
            <li>Listen to two notes played one after another</li>
            <li>Select the interval you hear</li>
            <li>Get instant feedback - green for correct, red for wrong</li>
          </ol>
        </div>
      )}

      {/* Score */}
      {gameState !== 'idle' && (
        <div className="flex justify-between items-center bg-background border border-lineHighlight rounded-lg p-4">
          <div className="font-mono">
            Round: <span className="text-cyan-400">{Math.min(round, totalRounds)}</span> / {totalRounds}
          </div>
          <div className="font-mono">
            Score: <span className="text-green-400">{score.correct}</span> / {score.total}
          </div>
        </div>
      )}

      {/* Game area */}
      <div className="bg-background border border-lineHighlight rounded-lg p-6">
        {gameState === 'idle' && (
          <div className="text-center">
            <button
              onClick={startGame}
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xl transition-colors"
            >
              Start Training
            </button>
          </div>
        )}

        {gameState === 'loading' && (
          <div className="text-center py-8">
            <div className="text-xl text-gray-400 mb-2">Loading piano...</div>
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Training Complete!</h2>
            <p className="text-4xl font-mono">
              <span className="text-green-400">{score.correct}</span>
              <span className="text-gray-500"> / </span>
              <span>{score.total}</span>
            </p>
            <p className="text-lg text-gray-400">
              {score.correct === score.total ? 'Perfect! 🎉' :
               score.correct >= score.total * 0.8 ? 'Great job! 👏' :
               score.correct >= score.total * 0.6 ? 'Good work! 👍' :
               'Keep practicing! 💪'}
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'answered') && (
          <div className="space-y-6">
            {/* Timer bar */}
            {gameState === 'playing' && (
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    timeLeft > 2000 ? 'bg-green-500' :
                    timeLeft > 1000 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(timeLeft / ANSWER_TIME_LIMIT) * 100}%` }}
                />
              </div>
            )}

            {/* Replay button */}
            <div className="text-center">
              <button
                onClick={replayInterval}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                🔊 Replay
              </button>
            </div>

            {/* Answer options */}
            <div className="grid grid-cols-2 gap-3">
              {INTERVALS.map((interval) => {
                const isSelected = selectedAnswer?.semitones === interval.semitones;
                const isCorrect = currentInterval?.semitones === interval.semitones;
                const showResult = gameState === 'answered';

                let bgColor = 'bg-gray-700 hover:bg-gray-600';
                if (showResult) {
                  if (isCorrect) {
                    bgColor = 'bg-green-600';
                  } else if (isSelected && !isCorrect) {
                    bgColor = 'bg-red-600';
                  } else {
                    bgColor = 'bg-gray-800';
                  }
                }

                return (
                  <button
                    key={interval.semitones}
                    onClick={() => handleAnswer(interval)}
                    disabled={gameState === 'answered'}
                    className={`
                      p-4 rounded-lg font-mono text-center transition-all
                      ${bgColor}
                      ${gameState === 'answered' ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    <div className="text-lg font-bold">{interval.short}</div>
                    <div className="text-sm text-gray-300">{interval.name}</div>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {gameState === 'answered' && (
              <div className="text-center space-y-3">
                {selectedAnswer?.semitones === currentInterval?.semitones ? (
                  <p className="text-green-400 text-xl font-bold">Correct! ✓</p>
                ) : selectedAnswer === null ? (
                  <p className="text-yellow-400 text-xl">
                    Time's up! It was <span className="font-bold">{currentInterval?.name}</span>
                  </p>
                ) : (
                  <p className="text-red-400 text-xl">
                    It was <span className="font-bold">{currentInterval?.name}</span>
                  </p>
                )}

                {/* Strudel notation */}
                <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm inline-block">
                  <code>
                    note("<span className="text-cyan-400">{semitoneToNote(rootNote)}</span> <span className="text-yellow-400">{semitoneToNote(rootNote + currentInterval?.semitones)}</span>").s("piano")
                  </code>
                </div>

                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
                >
                  {round >= totalRounds ? 'See Results' : 'Next →'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
