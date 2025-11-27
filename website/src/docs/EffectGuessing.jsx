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

// Effect definitions with their superdough parameters
const EFFECTS = {
  // Time-based effects
  reverb: {
    id: 'reverb',
    name: 'Reverb',
    description: 'Spacious echo decay',
    params: { room: 0.8, size: 4 },
    code: '.room(0.8).size(4)',
  },
  delay: {
    id: 'delay',
    name: 'Delay',
    description: 'Rhythmic echo',
    params: { delay: 0.5, delaytime: 0.25, delayfeedback: 0.5 },
    code: '.delay(0.5).delaytime(0.25).delayfeedback(0.5)',
  },
  // Modulation effects
  chorus: {
    id: 'chorus',
    name: 'Chorus',
    description: 'Thick, shimmery doubling',
    params: { chorus: 1, chorusDepth: 0.5, chorusSpeed: 2 },
    code: '.chorus(1)',
  },
  phaser: {
    id: 'phaser',
    name: 'Phaser',
    description: 'Sweeping, swooshy filter',
    params: { phaser: 1, phaserdepth: 0.8, phasersweep: 2 },
    code: '.phaser(1).phaserdepth(0.8)',
  },
  vibrato: {
    id: 'vibrato',
    name: 'Vibrato',
    description: 'Pitch wobble',
    params: { vibmod: 0.5, vib: 6 },
    code: '.vibmod(0.5).vib(6)',
  },
  // Filter effects
  lpf: {
    id: 'lpf',
    name: 'Low-pass Filter',
    description: 'Muffled, darker sound',
    params: { lpf: 200, lpq: 8 },
    code: '.lpf(200).lpq(8)',
  },
  hpf: {
    id: 'hpf',
    name: 'High-pass Filter',
    description: 'Thin, tinny sound',
    params: { hpf: 2500, hpq: 8 },
    code: '.hpf(2500).hpq(8)',
  },
  // Distortion effects
  distort: {
    id: 'distort',
    name: 'Distortion',
    description: 'Gritty, crunchy sound',
    params: { distort: 3 },
    code: '.distort(3)',
  },
  crush: {
    id: 'crush',
    name: 'Bitcrush',
    description: 'Lo-fi, digital crunch',
    params: { crush: 4 },
    code: '.crush(4)',
  },
  // FM synthesis
  fm: {
    id: 'fm',
    name: 'FM',
    description: 'Metallic, bell-like harmonics',
    params: { fmi: 2, fmh: 3 },
    code: '.fmi(2).fmh(3)',
  },
  // Tremolo
  tremolo: {
    id: 'tremolo',
    name: 'Tremolo',
    description: 'Volume wobble',
    params: { tremolodepth: 0.7, tremolorate: 6 },
    code: '.tremolodepth(0.7).tremolorate(6)',
  },
};

// Difficulty levels
const DIFFICULTY_LEVELS = [
  {
    id: 0,
    name: 'Level 1',
    description: 'Obvious effects',
    effects: ['reverb', 'delay', 'distort'],
    roundsToAdvance: 6,
    timeLimit: 15000,
  },
  {
    id: 1,
    name: 'Level 2',
    description: 'Add filters',
    effects: ['reverb', 'delay', 'distort', 'lpf', 'hpf'],
    roundsToAdvance: 8,
    timeLimit: 12000,
  },
  {
    id: 2,
    name: 'Level 3',
    description: 'Add modulation',
    effects: ['reverb', 'delay', 'distort', 'lpf', 'chorus', 'phaser'],
    roundsToAdvance: 8,
    timeLimit: 12000,
  },
  {
    id: 3,
    name: 'Level 4',
    description: 'More variety',
    effects: ['reverb', 'delay', 'distort', 'lpf', 'hpf', 'chorus', 'phaser', 'crush'],
    roundsToAdvance: 10,
    timeLimit: 10000,
  },
  {
    id: 4,
    name: 'Level 5',
    description: 'Subtle effects',
    effects: ['reverb', 'delay', 'chorus', 'phaser', 'vibrato', 'tremolo', 'fm'],
    roundsToAdvance: 10,
    timeLimit: 10000,
  },
  {
    id: 5,
    name: 'Level 6',
    description: 'All effects',
    effects: Object.keys(EFFECTS),
    roundsToAdvance: 12,
    timeLimit: 8000,
  },
];

const STORAGE_KEY = 'effectguessing-progress';

// Module-level flag to track if sounds are preloaded
let soundsPreloaded = false;

// Sound sources for variety
const SOUND_SOURCES = [
  { s: 'sawtooth', note: 'C4', duration: 1.5 },
  { s: 'square', note: 'E4', duration: 1.5 },
  { s: 'triangle', note: 'G3', duration: 1.5 },
  { s: 'sine', note: 'C5', duration: 1.5 },
  { s: 'piano', note: 'C4', duration: 1.5 },
  { s: 'piano', note: 'E4', duration: 1.5 },
];

// Load/save progress
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

const saveProgress = (progress) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save progress:', e);
  }
};

// Get grid layout based on number of effects
const getGridClass = (count) => {
  if (count <= 3) return 'grid-cols-3';
  if (count <= 4) return 'grid-cols-2 sm:grid-cols-4';
  if (count <= 6) return 'grid-cols-2 sm:grid-cols-3';
  if (count <= 8) return 'grid-cols-2 sm:grid-cols-4';
  return 'grid-cols-3 sm:grid-cols-4';
};

export function EffectGuessing() {
  const [gameState, setGameState] = useState('idle'); // idle, loading, playing, answered, levelUp, finished
  const [currentEffect, setCurrentEffect] = useState(null);
  const [currentSound, setCurrentSound] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [round, setRound] = useState(0);
  const [level, setLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_LEVELS[0].timeLimit);
  const [progress, setProgress] = useState(() => loadProgress());
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [isPlayingDry, setIsPlayingDry] = useState(false);
  const [isPlayingWet, setIsPlayingWet] = useState(false);
  const initialized = useRef(false);
  const countdownRef = useRef(null);
  const usedEffects = useRef(new Set());
  const autoAdvanceRef = useRef(null);

  const currentLevel = DIFFICULTY_LEVELS[level] || DIFFICULTY_LEVELS[DIFFICULTY_LEVELS.length - 1];
  const currentEffects = currentLevel.effects.map(id => EFFECTS[id]);

  const initAudio = useCallback(async () => {
    if (!initialized.current) {
      await Promise.all([modulesLoading, prebaked, audioReady]);
      initialized.current = true;
    }
  }, []);

  const preloadSounds = useCallback(async () => {
    if (soundsPreloaded) return;
    await initAudio();
    const ac = getAudioContext();
    const t = ac.currentTime + 0.01;

    // Preload all sound sources with gain: 0
    for (const sound of SOUND_SOURCES) {
      await superdough({ s: sound.s, note: sound.note, gain: 0 }, t, 0.01);
    }

    soundsPreloaded = true;
  }, [initAudio]);

  const playSound = useCallback(async (sound, effectParams = null, delay = 0) => {
    await initAudio();
    const ac = getAudioContext();
    const t = ac.currentTime + delay + 0.01;

    const params = {
      s: sound.s,
      note: sound.note,
      gain: 0.6,
    };

    // Apply effect parameters if provided
    if (effectParams) {
      Object.assign(params, effectParams);
    }

    await superdough(params, t, sound.duration);
  }, [initAudio]);

  const playComparison = useCallback(async (sound, effect) => {
    // Play dry sound first
    setIsPlayingDry(true);
    await playSound(sound, null, 0);

    // Wait for dry sound to finish, then play wet
    setTimeout(() => {
      setIsPlayingDry(false);
      setIsPlayingWet(true);
      playSound(sound, effect.params, 0);

      // Reset wet indicator after sound finishes
      setTimeout(() => {
        setIsPlayingWet(false);
      }, sound.duration * 1000);
    }, (sound.duration + 0.3) * 1000);
  }, [playSound]);

  const playEffectDemo = useCallback(async (effectId) => {
    if (!currentSound) return;
    const effect = EFFECTS[effectId];
    if (!effect) return;
    await playSound(currentSound, effect.params, 0);
  }, [currentSound, playSound]);

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
        if (prev <= 100) return 0;
        return prev - 100;
      });
    }, 100);
  }, [stopCountdown]);

  const startGame = useCallback(async (startLevel = 0) => {
    setGameState('loading');
    await preloadSounds();
    usedEffects.current.clear();
    setScore({ correct: 0, total: 0 });
    setRound(1);
    setLevel(startLevel);
    setCurrentEffect(null);
    setCurrentSound(null);
    setGameState('playing');
  }, [preloadSounds]);

  const nextQuestion = useCallback((roundNum, levelIdx) => {
    const lvl = DIFFICULTY_LEVELS[levelIdx] || DIFFICULTY_LEVELS[DIFFICULTY_LEVELS.length - 1];

    if (roundNum > lvl.roundsToAdvance) {
      if (levelIdx < DIFFICULTY_LEVELS.length - 1) {
        setGameState('levelUp');
      } else {
        setGameState('finished');
      }
      stopCountdown();
      return;
    }

    // Pick random effect, avoiding recent repeats
    const availableEffects = lvl.effects;
    let effectId;
    let attempts = 0;
    const maxAttempts = 50;

    do {
      effectId = availableEffects[Math.floor(Math.random() * availableEffects.length)];
      attempts++;
    } while (usedEffects.current.has(effectId) && attempts < maxAttempts && usedEffects.current.size < availableEffects.length - 1);

    // Track used effects to avoid immediate repeats
    usedEffects.current.add(effectId);
    if (usedEffects.current.size > Math.min(3, availableEffects.length - 1)) {
      const oldest = usedEffects.current.values().next().value;
      usedEffects.current.delete(oldest);
    }

    const effect = EFFECTS[effectId];

    // Pick random sound source
    const sound = SOUND_SOURCES[Math.floor(Math.random() * SOUND_SOURCES.length)];

    setCurrentEffect(effect);
    setCurrentSound(sound);
    setSelectedAnswer(null);
    setRound(roundNum);

    // Play the comparison after a short delay
    setTimeout(() => {
      playComparison(sound, effect);
      startCountdown(lvl.timeLimit);
    }, 300);
  }, [playComparison, startCountdown, stopCountdown]);

  const handleAnswer = useCallback((effectId) => {
    if (gameState !== 'playing') return;

    stopCountdown();
    setSelectedAnswer(effectId);
    setGameState('answered');

    const isCorrect = effectId === currentEffect?.id;
    setLastAnswerCorrect(isCorrect);
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    // Auto-advance after 500ms if correct
    if (isCorrect) {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = setTimeout(() => {
        setTimeLeft(DIFFICULTY_LEVELS[level]?.timeLimit || 15000);
        setGameState('playing');
        nextQuestion(round + 1, level);
      }, 500);
    }
  }, [gameState, currentEffect, stopCountdown, level, round, nextQuestion]);

  const handleTimeout = useCallback(() => {
    stopCountdown();
    setSelectedAnswer(null);
    setLastAnswerCorrect(false);
    setGameState('answered');
    setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
  }, [stopCountdown]);

  const handleNext = useCallback(() => {
    setTimeLeft(currentLevel.timeLimit);
    setGameState('playing');
    nextQuestion(round + 1, level);
  }, [round, level, currentLevel.timeLimit, nextQuestion]);

  const handleNextLevel = useCallback(() => {
    const newLevel = level + 1;

    // Only save progress if perfect score
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

    usedEffects.current.clear();
    setScore({ correct: 0, total: 0 });
    setRound(1);
    setLevel(newLevel);
    setCurrentEffect(null);
    setCurrentSound(null);
    setGameState('playing');

    // Trigger first question for the new level
    setTimeout(() => {
      nextQuestion(1, newLevel);
    }, 100);
  }, [level, score, progress, nextQuestion]);

  const handleFinish = useCallback(() => {
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

  const replayComparison = useCallback(() => {
    if (currentSound && currentEffect) {
      playComparison(currentSound, currentEffect);
    }
  }, [currentSound, currentEffect, playComparison]);

  // Handle timeout
  useEffect(() => {
    if (timeLeft === 0 && gameState === 'playing') {
      handleTimeout();
    }
  }, [timeLeft, gameState, handleTimeout]);

  // Trigger first question when game starts
  const needsFirstQuestion = useRef(false);
  useEffect(() => {
    if (gameState === 'playing' && round === 1 && !currentEffect) {
      if (needsFirstQuestion.current) {
        needsFirstQuestion.current = false;
        nextQuestion(1, level);
      }
    }
  }, [gameState, round, level, currentEffect, nextQuestion]);

  useEffect(() => {
    if (gameState === 'loading') {
      needsFirstQuestion.current = true;
    }
  }, [gameState]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      if (autoAdvanceRef.current) {
        clearTimeout(autoAdvanceRef.current);
      }
    };
  }, []);

  const client = useClient();
  if (!client) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Level Selection - idle state */}
      {gameState === 'idle' && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Select Level</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DIFFICULTY_LEVELS.map((lvl, idx) => {
              const isUnlocked = idx <= progress.highestLevel;
              const levelScore = progress.levelScores[idx];
              const effects = lvl.effects.map(id => EFFECTS[id]);

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
                    {effects.slice(0, 4).map(effect => (
                      <span
                        key={effect.id}
                        className="text-[10px] px-1.5 py-0.5 bg-gray-700 rounded text-gray-300"
                      >
                        {effect.name}
                      </span>
                    ))}
                    {effects.length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">
                        +{effects.length - 4} more
                      </span>
                    )}
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

      {/* Score - during game */}
      {gameState !== 'idle' && (
        <div className="bg-background border border-lineHighlight rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-cyan-400">{currentLevel.name}</span>
              <span className="text-xs text-gray-500">({currentEffects.length} effects)</span>
            </div>
            <div className="text-sm text-gray-400">{currentLevel.description}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="font-mono text-sm">
              Round: <span className="text-cyan-400">{Math.min(round, currentLevel.roundsToAdvance)}</span> / {currentLevel.roundsToAdvance}
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
            <div className="text-xl text-gray-400 mb-2">Loading effects...</div>
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
                <p className="text-lg text-gray-400">Level {level + 2} unlocked!</p>
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
                  You've mastered all audio effects!
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
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  timeLeft > currentLevel.timeLimit * 0.4 ? 'bg-green-500' :
                  timeLeft > currentLevel.timeLimit * 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(timeLeft / currentLevel.timeLimit) * 100}%` }}
              />
            </div>

            {/* Sound indicator */}
            <div className="text-center mb-4">
              <div className="text-lg text-gray-300 mb-2">
                {gameState === 'answered' && !lastAnswerCorrect
                  ? 'Click effects to hear the difference'
                  : 'Which effect was applied?'}
              </div>
              <div className="flex justify-center gap-4 text-sm">
                <span className={`px-3 py-1 rounded ${isPlayingDry ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  Dry
                </span>
                <span className="text-gray-500">→</span>
                <span className={`px-3 py-1 rounded ${isPlayingWet ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  Wet (Effect)
                </span>
              </div>
            </div>

            {/* Effect options */}
            <div className={`grid ${getGridClass(currentEffects.length)} gap-3`}>
              {currentEffects.map((effect) => {
                const isSelected = selectedAnswer === effect.id;
                const isCorrect = currentEffect?.id === effect.id;
                const showResult = gameState === 'answered';

                let bgColor = 'bg-gray-700 hover:bg-gray-600';
                if (showResult) {
                  if (isCorrect) {
                    bgColor = 'bg-green-600 hover:bg-green-500';
                  } else if (isSelected && !isCorrect) {
                    bgColor = 'bg-red-600 hover:bg-red-500';
                  } else {
                    bgColor = 'bg-gray-800 hover:bg-gray-700';
                  }
                }

                const handleClick = () => {
                  if (showResult && !lastAnswerCorrect) {
                    // Play this effect for learning
                    playEffectDemo(effect.id);
                  } else if (!showResult) {
                    handleAnswer(effect.id);
                  }
                };

                return (
                  <button
                    key={effect.id}
                    onClick={handleClick}
                    disabled={showResult && lastAnswerCorrect}
                    className={`
                      p-4 rounded-lg text-center transition-all
                      ${bgColor}
                      ${showResult && lastAnswerCorrect ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    <div className="text-sm font-bold mb-1">{effect.name}</div>
                    <div className="text-xs text-gray-400">{effect.description}</div>
                  </button>
                );
              })}
            </div>

            {/* Replay button */}
            <div className="text-center">
              <button
                onClick={replayComparison}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Replay Comparison
              </button>
            </div>

            {/* Feedback - only show for incorrect guesses */}
            {gameState === 'answered' && !lastAnswerCorrect && (
              <div className="text-center space-y-3">
                {selectedAnswer === null ? (
                  <p className="text-yellow-400 text-xl">
                    Time's up! It was <span className="font-bold">{currentEffect?.name}</span>
                  </p>
                ) : (
                  <p className="text-red-400 text-xl">
                    It was <span className="font-bold">{currentEffect?.name}</span>
                  </p>
                )}

                {/* Description */}
                <p className="text-gray-400 text-sm">
                  {currentEffect?.description}
                </p>

                {/* Strudel notation */}
                <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm inline-block">
                  <code>
                    note("<span className="text-cyan-400">{currentSound?.note}</span>")
                    .sound("<span className="text-yellow-400">{currentSound?.s}</span>")
                    <span className="text-green-400">{currentEffect?.code}</span>
                  </code>
                </div>

                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
                >
                  {round >= currentLevel.roundsToAdvance ? 'See Results' : 'Next'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Effect reference - show during game */}
      {gameState !== 'idle' && gameState !== 'loading' && (
        <div className="bg-background border border-lineHighlight rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-2">Effects in this level:</div>
          <div className="flex flex-wrap gap-2">
            {currentEffects.map(effect => (
              <span
                key={effect.id}
                className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300"
              >
                {effect.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
