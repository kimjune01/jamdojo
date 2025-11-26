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

const ALL_INTERVALS = [
  { semitones: 1, name: 'Minor 2nd', short: 'm2' },
  { semitones: 2, name: 'Major 2nd', short: 'M2' },
  { semitones: 3, name: 'Minor 3rd', short: 'm3' },
  { semitones: 4, name: 'Major 3rd', short: 'M3' },
  { semitones: 5, name: 'Perfect 4th', short: 'P4' },
  { semitones: 6, name: 'Tritone', short: 'TT' },
  { semitones: 7, name: 'Perfect 5th', short: 'P5' },
  { semitones: 8, name: 'Minor 6th', short: 'm6' },
  { semitones: 9, name: 'Major 6th', short: 'M6' },
  { semitones: 10, name: 'Minor 7th', short: 'm7' },
  { semitones: 11, name: 'Major 7th', short: 'M7' },
  { semitones: 12, name: 'Octave', short: 'P8' },
];

const DIFFICULTY_LEVELS = [
  {
    id: 0,
    name: 'Level 1',
    description: 'Perfect intervals',
    intervals: [5, 7, 12], // P4, P5, P8
    timeLimit: 10000,
    roundsToAdvance: 8,
  },
  {
    id: 1,
    name: 'Level 2',
    description: 'Add major intervals',
    intervals: [4, 5, 7, 9, 12], // M3, P4, P5, M6, P8
    timeLimit: 8000,
    roundsToAdvance: 8,
  },
  {
    id: 2,
    name: 'Level 3',
    description: 'Add minor intervals',
    intervals: [3, 4, 5, 7, 8, 9, 12], // m3, M3, P4, P5, m6, M6, P8
    timeLimit: 7000,
    roundsToAdvance: 8,
  },
  {
    id: 3,
    name: 'Level 4',
    description: 'Add 2nds',
    intervals: [1, 2, 3, 4, 5, 7, 8, 9, 12], // m2, M2, m3, M3, P4, P5, m6, M6, P8
    timeLimit: 6000,
    roundsToAdvance: 8,
  },
  {
    id: 4,
    name: 'Level 5',
    description: 'Add 7ths',
    intervals: [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12], // All except tritone
    timeLimit: 5000,
    roundsToAdvance: 8,
  },
  {
    id: 5,
    name: 'Level 6',
    description: 'All intervals',
    intervals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // All
    timeLimit: 5000,
    roundsToAdvance: 10,
  },
];

const STORAGE_KEY = 'eartraining-progress';

const getIntervalsForLevel = (levelIndex) => {
  const level = DIFFICULTY_LEVELS[levelIndex] || DIFFICULTY_LEVELS[DIFFICULTY_LEVELS.length - 1];
  return ALL_INTERVALS.filter(i => level.intervals.includes(i.semitones));
};

const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const semitoneToNote = (semitone) => {
  const octave = Math.floor(semitone / 12);
  const noteIndex = ((semitone % 12) + 12) % 12;
  return NOTE_NAMES[noteIndex] + octave;
};

// Preload notes in the range we use (C3 to G5)
const PRELOAD_NOTES = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'];

// Module-level flag to track if piano is preloaded
let pianoPreloaded = false;

// Load progress from localStorage
const loadProgress = () => {
  if (typeof window === 'undefined') return { highestLevel: 0, levelScores: {} };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to load progress:', e);
  }
  return { highestLevel: 0, levelScores: {} };
};

// Save progress to localStorage
const saveProgress = (progress) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save progress:', e);
  }
};

// Get grid layout based on number of intervals
const getGridClass = (count) => {
  if (count <= 3) return 'grid-cols-3';
  if (count <= 5) return 'grid-cols-3 sm:grid-cols-5';
  if (count <= 7) return 'grid-cols-3 sm:grid-cols-4';
  if (count <= 9) return 'grid-cols-3 sm:grid-cols-5';
  if (count <= 11) return 'grid-cols-3 sm:grid-cols-4';
  return 'grid-cols-3 sm:grid-cols-4';
};

export function EarTraining() {
  const [gameState, setGameState] = useState('idle'); // idle, loading, playing, answered, levelUp, finished
  const [currentInterval, setCurrentInterval] = useState(null);
  const [rootNote, setRootNote] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [round, setRound] = useState(0);
  const [level, setLevel] = useState(0);
  const [useStrudelNotation, setUseStrudelNotation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_LEVELS[0].timeLimit);
  const [progress, setProgress] = useState(() => loadProgress());
  const initialized = useRef(false);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const usedCombos = useRef(new Set());

  const currentLevel = DIFFICULTY_LEVELS[level] || DIFFICULTY_LEVELS[DIFFICULTY_LEVELS.length - 1];
  const currentIntervals = getIntervalsForLevel(level);
  const totalRounds = currentLevel.roundsToAdvance;

  const getIntervalLabel = (interval) => {
    if (useStrudelNotation) {
      return `+${interval.semitones}`;
    }
    return interval.short;
  };

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

  const startGame = useCallback(async (startLevel = 0) => {
    setGameState('loading');
    await preloadPiano();
    usedCombos.current.clear();
    setScore({ correct: 0, total: 0 });
    setRound(1);
    setLevel(startLevel);
    setCurrentInterval(null);
    setGameState('playing');
  }, [preloadPiano]);

  const stopCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const startCountdown = useCallback((timeLimit) => {
    stopCountdown();
    setTimeLeft(timeLimit);
    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          return 0;
        }
        return prev - 100;
      });
    }, 100);
  }, [stopCountdown]);

  const nextQuestion = useCallback((roundNum, levelIdx) => {
    const lvl = DIFFICULTY_LEVELS[levelIdx] || DIFFICULTY_LEVELS[DIFFICULTY_LEVELS.length - 1];
    const intervals = getIntervalsForLevel(levelIdx);

    if (roundNum > lvl.roundsToAdvance) {
      if (levelIdx < DIFFICULTY_LEVELS.length - 1) {
        setGameState('levelUp');
      } else {
        setGameState('finished');
      }
      stopCountdown();
      return;
    }

    let interval, root, comboKey;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      interval = intervals[Math.floor(Math.random() * intervals.length)];
      root = 36 + Math.floor(Math.random() * 20);
      comboKey = `${root}-${interval.semitones}`;
      attempts++;
    } while (usedCombos.current.has(comboKey) && attempts < maxAttempts);

    usedCombos.current.add(comboKey);

    setCurrentInterval(interval);
    setRootNote(root);
    setSelectedAnswer(null);
    setRound(roundNum);

    setTimeout(() => {
      playInterval(root, interval);
      startCountdown(lvl.timeLimit);
    }, 300);
  }, [playInterval, startCountdown, stopCountdown]);

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
    setTimeLeft(currentLevel.timeLimit);
    setGameState('playing');
    nextQuestion(round + 1, level);
  }, [round, level, currentLevel.timeLimit, nextQuestion]);

  const handleNextLevel = useCallback(() => {
    const newLevel = level + 1;

    // Only update progress if perfect score
    if (score.correct === score.total) {
      const newProgress = {
        ...progress,
        highestLevel: Math.max(progress.highestLevel, newLevel),
        levelScores: {
          ...progress.levelScores,
          [level]: { correct: score.correct, total: score.total }
        }
      };
      setProgress(newProgress);
      saveProgress(newProgress);
    }

    usedCombos.current.clear();
    setScore({ correct: 0, total: 0 });
    setRound(1);
    setLevel(newLevel);
    setCurrentInterval(null);
    setGameState('playing');
  }, [level, score, progress]);

  const handleFinish = useCallback(() => {
    // Only save progress if perfect score
    if (score.correct === score.total) {
      const newProgress = {
        ...progress,
        highestLevel: Math.max(progress.highestLevel, level + 1),
        levelScores: {
          ...progress.levelScores,
          [level]: { correct: score.correct, total: score.total }
        }
      };
      setProgress(newProgress);
      saveProgress(newProgress);
    }
    setGameState('idle');
  }, [level, score, progress]);

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

  // Trigger first question when game starts
  const needsFirstQuestion = useRef(false);
  useEffect(() => {
    if (gameState === 'playing' && round === 1 && !currentInterval) {
      if (needsFirstQuestion.current) {
        needsFirstQuestion.current = false;
        nextQuestion(1, level);
      }
    }
  }, [gameState, round, level, currentInterval, nextQuestion]);

  useEffect(() => {
    if (gameState === 'loading') {
      needsFirstQuestion.current = true;
    }
  }, [gameState]);

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
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Header with notation toggle */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <span className={`text-xs ${!useStrudelNotation ? 'text-white' : 'text-gray-500'}`}>Theory</span>
          <button
            onClick={() => setUseStrudelNotation(!useStrudelNotation)}
            className={`relative w-10 h-5 rounded-full transition-colors ${useStrudelNotation ? 'bg-cyan-600' : 'bg-gray-600'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${useStrudelNotation ? 'left-5' : 'left-0.5'}`} />
          </button>
          <span className={`text-xs ${useStrudelNotation ? 'text-white' : 'text-gray-500'}`}>Semitones</span>
        </div>
      </div>

      {/* Level Selection - show in idle state */}
      {gameState === 'idle' && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Select Level</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DIFFICULTY_LEVELS.map((lvl, idx) => {
              const isUnlocked = idx <= progress.highestLevel;
              const levelScore = progress.levelScores[idx];
              const intervals = getIntervalsForLevel(idx);

              return (
                <button
                  key={lvl.id}
                  onClick={() => isUnlocked && startGame(idx)}
                  disabled={!isUnlocked}
                  className={`
                    p-4 rounded-lg text-left transition-all border
                    ${isUnlocked
                      ? 'bg-gray-800 hover:bg-gray-700 border-gray-600 cursor-pointer'
                      : 'bg-gray-900 border-gray-800 cursor-not-allowed opacity-50'}
                    ${idx === progress.highestLevel && isUnlocked ? 'border-cyan-500 ring-1 ring-cyan-500/30' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{lvl.name}</span>
                    {!isUnlocked && <span className="text-gray-600">🔒</span>}
                    {levelScore && (
                      <span className="text-xs text-green-400">
                        {levelScore.correct}/{levelScore.total}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">{lvl.description}</div>
                  <div className="flex flex-wrap gap-1">
                    {intervals.map(int => (
                      <span
                        key={int.semitones}
                        className="text-[10px] px-1.5 py-0.5 bg-gray-700 rounded text-gray-300"
                      >
                        {useStrudelNotation ? `+${int.semitones}` : int.short}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {progress.highestLevel > 0 && (
            <button
              onClick={() => {
                setProgress({ highestLevel: 0, levelScores: {} });
                saveProgress({ highestLevel: 0, levelScores: {} });
              }}
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              Reset Progress
            </button>
          )}
        </div>
      )}

      {/* Score - show during game */}
      {gameState !== 'idle' && (
        <div className="bg-background border border-lineHighlight rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-cyan-400">{currentLevel.name}</span>
              <span className="text-xs text-gray-500">({currentIntervals.length} intervals)</span>
            </div>
            <div className="text-sm text-gray-400">{currentLevel.description}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="font-mono text-sm">
              Round: <span className="text-cyan-400">{Math.min(round, totalRounds)}</span> / {totalRounds}
            </div>
            <div className="font-mono text-sm">
              Score: <span className="text-green-400">{score.correct}</span> / {score.total}
            </div>
          </div>
        </div>
      )}

      {/* Game area */}
      <div className="bg-background border border-lineHighlight rounded-lg p-6">
        {gameState === 'loading' && (
          <div className="text-center py-8">
            <div className="text-xl text-gray-400 mb-2">Loading piano...</div>
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {gameState === 'levelUp' && (
          <div className="text-center space-y-4">
            {score.correct === score.total ? (
              <>
                <h2 className="text-2xl font-bold text-green-400">Perfect!</h2>
                <p className="text-4xl font-mono">
                  <span className="text-green-400">{score.correct}</span>
                  <span className="text-gray-500"> / </span>
                  <span>{score.total}</span>
                </p>
                <p className="text-lg text-gray-400">
                  Level {level + 2} unlocked!
                </p>
                <p className="text-sm text-gray-500">
                  {DIFFICULTY_LEVELS[level + 1]?.description}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setGameState('idle')}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    Back to Levels
                  </button>
                  <button
                    onClick={handleNextLevel}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
                  >
                    Level {level + 2} →
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-yellow-400">Level {level + 1} Complete</h2>
                <p className="text-4xl font-mono">
                  <span className="text-yellow-400">{score.correct}</span>
                  <span className="text-gray-500"> / </span>
                  <span>{score.total}</span>
                </p>
                <p className="text-lg text-gray-400">
                  Perfect score required to unlock next level
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setGameState('idle')}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    Back to Levels
                  </button>
                  <button
                    onClick={() => startGame(level)}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {gameState === 'finished' && (
          <div className="text-center space-y-4">
            {score.correct === score.total ? (
              <>
                <h2 className="text-2xl font-bold text-green-400">All Levels Complete!</h2>
                <p className="text-4xl font-mono">
                  <span className="text-green-400">{score.correct}</span>
                  <span className="text-gray-500"> / </span>
                  <span>{score.total}</span>
                </p>
                <p className="text-lg text-gray-400">
                  You've mastered all intervals!
                </p>
                <button
                  onClick={handleFinish}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
                >
                  Back to Levels
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-yellow-400">Level {level + 1} Complete</h2>
                <p className="text-4xl font-mono">
                  <span className="text-yellow-400">{score.correct}</span>
                  <span className="text-gray-500"> / </span>
                  <span>{score.total}</span>
                </p>
                <p className="text-lg text-gray-400">
                  Perfect score required to complete
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setGameState('idle')}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    Back to Levels
                  </button>
                  <button
                    onClick={() => startGame(level)}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {(gameState === 'playing' || gameState === 'answered') && (
          <div className="space-y-6">
            {/* Timer bar */}
            {gameState === 'playing' && (
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    timeLeft > currentLevel.timeLimit * 0.4 ? 'bg-green-500' :
                    timeLeft > currentLevel.timeLimit * 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(timeLeft / currentLevel.timeLimit) * 100}%` }}
                />
              </div>
            )}

            {/* Replay button */}
            <div className="text-center">
              <button
                onClick={replayInterval}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Replay
              </button>
            </div>

            {/* Answer options - adaptive grid */}
            <div className={`grid ${getGridClass(currentIntervals.length)} gap-2`}>
              {currentIntervals.map((interval) => {
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
                      p-3 rounded-lg font-mono text-center transition-all
                      ${bgColor}
                      ${gameState === 'answered' ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    <div className="text-lg font-bold">{getIntervalLabel(interval)}</div>
                    <div className="text-xs text-gray-300 hidden sm:block">
                      {useStrudelNotation ? `${interval.semitones} semi` : interval.name}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {gameState === 'answered' && (
              <div className="text-center space-y-3">
                {selectedAnswer?.semitones === currentInterval?.semitones ? (
                  <p className="text-green-400 text-xl font-bold">Correct!</p>
                ) : selectedAnswer === null ? (
                  <p className="text-yellow-400 text-xl">
                    Time's up! It was <span className="font-bold">{useStrudelNotation ? `+${currentInterval?.semitones}` : currentInterval?.name}</span>
                  </p>
                ) : (
                  <p className="text-red-400 text-xl">
                    It was <span className="font-bold">{useStrudelNotation ? `+${currentInterval?.semitones}` : currentInterval?.name}</span>
                  </p>
                )}

                {/* Strudel notation */}
                <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm inline-block">
                  <code>
                    {useStrudelNotation ? (
                      <>note("<span className="text-cyan-400">{rootNote}</span> <span className="text-yellow-400">{rootNote + currentInterval?.semitones}</span>").s("piano")</>
                    ) : (
                      <>note("<span className="text-cyan-400">{semitoneToNote(rootNote)}</span> <span className="text-yellow-400">{semitoneToNote(rootNote + currentInterval?.semitones)}</span>").s("piano")</>
                    )}
                  </code>
                </div>

                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
                >
                  {round >= totalRounds ? 'See Results' : 'Next'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
